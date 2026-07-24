const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const STORAGE_ENV_NAME = "ORDER_ATTACHMENTS_PATH";
const DEFAULT_STORAGE_ROOT = path.resolve(__dirname, "..", "private", "order-attachments");
const MAX_STORAGE_KEY_LENGTH = 160;
const STORAGE_KEY_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function normalizeExtension(value) {
    const extension = String(value || "").trim().toLowerCase().replace(/^\./, "");
    if (!/^[a-z0-9]{1,10}$/.test(extension)) throw new TypeError("Attachment extension is invalid.");
    return extension;
}

function validateStorageKey(value) {
    const storageKey = String(value || "");
    if (!storageKey || storageKey.length > MAX_STORAGE_KEY_LENGTH || storageKey.includes("\0")
        || storageKey.includes("..") || storageKey.includes("/") || storageKey.includes("\\")
        || path.isAbsolute(storageKey) || /^[A-Za-z]:/.test(storageKey) || !STORAGE_KEY_PATTERN.test(storageKey)) {
        throw new TypeError("Unsafe attachment storage key.");
    }
    return storageKey;
}

function isContained(root, target) {
    const relative = path.relative(root, target);
    return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function createOrderAttachmentStorage({ rootPath = process.env[STORAGE_ENV_NAME] || DEFAULT_STORAGE_ROOT } = {}) {
    const configuredRoot = path.resolve(String(rootPath || ""));
    if (!configuredRoot) throw new TypeError("Attachment storage root is required.");

    async function ensureRoot() {
        await fs.promises.mkdir(configuredRoot, { recursive: true, mode: 0o700 });
        const rootStat = await fs.promises.lstat(configuredRoot);
        if (!rootStat.isDirectory()) throw new Error("Attachment storage root is not a directory.");
        return configuredRoot;
    }

    function lexicalPath(storageKey) {
        const safeKey = validateStorageKey(storageKey);
        const target = path.resolve(configuredRoot, safeKey);
        if (!isContained(configuredRoot, target)) throw new Error("Attachment path escapes the storage root.");
        return target;
    }

    async function checkedPath(storageKey, { allowMissing = false } = {}) {
        await ensureRoot();
        const target = lexicalPath(storageKey);
        const realRoot = await fs.promises.realpath(configuredRoot);
        let stat;
        try {
            stat = await fs.promises.lstat(target);
        } catch (error) {
            if (error.code !== "ENOENT" || !allowMissing) throw error;
            const realParent = await fs.promises.realpath(path.dirname(target));
            if (!isContained(realRoot, path.join(realParent, path.basename(target)))) throw new Error("Attachment path escapes the storage root.");
            return target;
        }
        if (stat.isSymbolicLink()) throw new Error("Symbolic links are not allowed in attachment storage.");
        const realTarget = await fs.promises.realpath(target);
        if (!isContained(realRoot, realTarget)) throw new Error("Attachment path escapes the storage root.");
        return target;
    }

    function generateStorageKey(extension) {
        return `${crypto.randomBytes(32).toString("hex")}.${normalizeExtension(extension)}`;
    }

    function generateTemporaryKey() {
        return `tmp-${crypto.randomBytes(32).toString("hex")}`;
    }

    async function createTemporaryFile(content = Buffer.alloc(0)) {
        await ensureRoot();
        const temporaryKey = generateTemporaryKey();
        const target = await checkedPath(temporaryKey, { allowMissing: true });
        await fs.promises.writeFile(target, content, { flag: "wx", mode: 0o600 });
        return temporaryKey;
    }

    async function moveTemporaryFile(temporaryKey, storageKey) {
        if (!/^tmp-[a-f0-9]{64}$/.test(validateStorageKey(temporaryKey))) throw new TypeError("Invalid temporary attachment storage key.");
        const source = await checkedPath(temporaryKey);
        const target = await checkedPath(storageKey, { allowMissing: true });
        try {
            await fs.promises.lstat(target);
            const error = new Error("Attachment destination already exists.");
            error.code = "EEXIST";
            throw error;
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
        await fs.promises.rename(source, target);
        return validateStorageKey(storageKey);
    }

    async function deleteFile(storageKey) {
        let target;
        try {
            target = await checkedPath(storageKey);
        } catch (error) {
            if (error.code === "ENOENT") return false;
            throw error;
        }
        const stat = await fs.promises.lstat(target);
        if (!stat.isFile()) throw new Error("Attachment storage key does not reference a regular file.");
        await fs.promises.unlink(target);
        return true;
    }

    async function fileExists(storageKey) {
        try {
            const target = await checkedPath(storageKey);
            return (await fs.promises.lstat(target)).isFile();
        } catch (error) {
            if (error.code === "ENOENT") return false;
            throw error;
        }
    }

    async function computeSha256(storageKey) {
        const target = await checkedPath(storageKey);
        const stat = await fs.promises.lstat(target);
        if (!stat.isFile()) throw new Error("Attachment storage key does not reference a regular file.");
        const hash = crypto.createHash("sha256");
        await new Promise((resolve, reject) => {
            const stream = fs.createReadStream(target);
            stream.on("data", chunk => hash.update(chunk));
            stream.once("error", reject);
            stream.once("end", resolve);
        });
        return hash.digest("hex");
    }

    return {
        getStorageRoot: () => configuredRoot,
        ensureRoot,
        generateStorageKey,
        generateTemporaryKey,
        createTemporaryFile,
        moveTemporaryFile,
        deleteFile,
        fileExists,
        computeSha256
    };
}

module.exports = {
    STORAGE_ENV_NAME,
    DEFAULT_STORAGE_ROOT,
    MAX_STORAGE_KEY_LENGTH,
    normalizeExtension,
    validateStorageKey,
    createOrderAttachmentStorage
};
