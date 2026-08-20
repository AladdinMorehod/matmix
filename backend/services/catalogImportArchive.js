const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ARCHIVE_FILE_PATTERN = /^catalog-import-\d{8}T\d{6}-[a-f0-9]{16}\.xlsx$/;
const ARCHIVE_TEMP_FILE_PATTERN = /^\.catalog-import-[a-f0-9]{16}\.tmp$/;

function isInside(parent, child) {
    const relative = path.relative(path.resolve(parent), path.resolve(child));
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function archiveError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function resolveCatalogImportArchivePath(env = process.env, options = {}) {
    const projectRoot = path.resolve(options.projectRoot || path.join(__dirname, "..", ".."));
    const configured = String(env.CATALOG_IMPORT_ARCHIVE_PATH || "").trim();
    if (env.NODE_ENV === "production" && !configured && !options.allowMissingProduction) {
        throw archiveError("CATALOG_IMPORT_ARCHIVE_PATH is required in production.", "CATALOG_IMPORT_ARCHIVE_CONFIG_REQUIRED");
    }

    const root = path.resolve(configured || path.join(os.tmpdir(), "matmix", "catalog-imports"));
    if (!options.allowUnsafePath && (isInside(path.join(projectRoot, "public"), root) || isInside(path.join(projectRoot, ".git"), root))) {
        throw archiveError("Catalog import archive must be outside public and .git.", "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE");
    }
    if (!options.allowUnsafePath && configured && isInside(projectRoot, root)) {
        throw archiveError("Configured catalog import archive must be outside the deployed application directory.", "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE");
    }
    return root;
}

async function ensureCatalogImportArchiveRoot(env = process.env, options = {}) {
    const root = resolveCatalogImportArchivePath(env, options);
    await fs.promises.mkdir(root, { recursive: true, mode: 0o750 });
    const stat = await fs.promises.lstat(root);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
        throw archiveError("Catalog import archive must be a real directory.", "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE");
    }
    const realRoot = await fs.promises.realpath(root);
    if (path.resolve(realRoot) !== path.resolve(root)) {
        throw archiveError("Catalog import archive must not resolve through symbolic links.", "CATALOG_IMPORT_ARCHIVE_PATH_UNSAFE");
    }
    return realRoot;
}

function archiveTimestamp(date = new Date()) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "");
}

async function writeCatalogImportArchive(contents, env = process.env, options = {}) {
    const root = await ensureCatalogImportArchiveRoot(env, options);
    const randomBytes = options.randomBytes || crypto.randomBytes;
    const filename = `catalog-import-${archiveTimestamp(options.now)}-${randomBytes(8).toString("hex")}.xlsx`;
    const filePath = path.join(root, filename);
    const tempPath = path.join(root, `.catalog-import-${randomBytes(8).toString("hex")}.tmp`);
    let handle = null;
    let tempCreated = false;
    let finalCreated = false;
    try {
        handle = await fs.promises.open(tempPath, "wx", 0o600);
        tempCreated = true;
        await handle.writeFile(contents);
        await handle.sync();
        await handle.close();
        handle = null;
        if (typeof options.afterTempWritten === "function") {
            await options.afterTempWritten({ root, tempPath, filePath });
        }

        // A hard link provides atomic no-replace publication on every supported
        // platform. Unlike rename(), it cannot overwrite an existing archive.
        await fs.promises.link(tempPath, filePath);
        finalCreated = true;
        await fs.promises.rm(tempPath, { force: true });
        tempCreated = false;
        return filePath;
    } catch (error) {
        await handle?.close().catch(() => {});
        if (tempCreated) await fs.promises.rm(tempPath, { force: true }).catch(() => {});
        if (finalCreated) await fs.promises.rm(filePath, { force: true }).catch(() => {});
        throw error;
    }
}

async function removeCatalogImportArchive(filePath, env = process.env, options = {}) {
    if (!filePath) return false;
    const root = resolveCatalogImportArchivePath(env, options);
    const resolved = path.resolve(filePath);
    if (path.dirname(resolved) !== root || !ARCHIVE_FILE_PATTERN.test(path.basename(resolved))) return false;
    await fs.promises.rm(resolved, { force: true });
    return true;
}

async function validateCatalogImportArchiveFile(filePath, env = process.env, options = {}) {
    const root = await ensureCatalogImportArchiveRoot(env, options);
    const resolved = path.resolve(String(filePath || ""));
    if (path.dirname(resolved) !== root || !ARCHIVE_FILE_PATTERN.test(path.basename(resolved))) {
        throw archiveError("Catalog import archive file path is unsafe.", "EXCEL_COPY_PATH_UNSAFE");
    }
    const stat = await fs.promises.lstat(resolved);
    if (!stat.isFile() || stat.isSymbolicLink()) {
        throw archiveError("Catalog import archive file is unsafe.", "EXCEL_COPY_PATH_UNSAFE");
    }
    const realFile = await fs.promises.realpath(resolved);
    if (path.dirname(realFile) !== root) {
        throw archiveError("Catalog import archive file escapes its storage root.", "EXCEL_COPY_PATH_UNSAFE");
    }
    return realFile;
}

module.exports = {
    ARCHIVE_FILE_PATTERN,
    ARCHIVE_TEMP_FILE_PATTERN,
    resolveCatalogImportArchivePath,
    ensureCatalogImportArchiveRoot,
    writeCatalogImportArchive,
    removeCatalogImportArchive,
    validateCatalogImportArchiveFile
};
