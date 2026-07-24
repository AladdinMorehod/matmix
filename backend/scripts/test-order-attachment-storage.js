const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
    createOrderAttachmentStorage,
    validateStorageKey
} = require("../services/orderAttachmentStorage");

async function expectRejected(work, pattern) {
    let error;
    try {
        await work();
    } catch (caught) {
        error = caught;
    }
    assert(error, "Expected operation to reject.");
    if (pattern) assert.match(error.message, pattern);
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-order-attachments-"));
    const storageRoot = path.join(root, "private", "attachments");
    const outsideFile = path.join(root, "outside.txt");
    const storage = createOrderAttachmentStorage({ rootPath: storageRoot });
    let symlink = "tested";

    try {
        assert.strictEqual(await storage.ensureRoot(), path.resolve(storageRoot));
        assert((await fs.promises.stat(storageRoot)).isDirectory());

        const firstKey = storage.generateStorageKey("PDF");
        const secondKey = storage.generateStorageKey(".pdf");
        assert.notStrictEqual(firstKey, secondKey);
        assert.match(firstKey, /^[a-f0-9]{64}\.pdf$/);
        assert(!firstKey.includes("customer-original-name"));
        assert.strictEqual(path.relative(storageRoot, path.resolve(storageRoot, firstKey)).startsWith(".."), false);

        for (const unsafe of [
            "", "../outside.pdf", "..\\outside.pdf", "folder/file.pdf", "folder\\file.pdf",
            "folder/..\\outside.pdf", "/tmp/outside.pdf", "C:\\temp\\outside.pdf", "\\\\server\\share\\outside.pdf",
            `safe\0name.pdf`, "a".repeat(161)
        ]) {
            assert.throws(() => validateStorageKey(unsafe), /Unsafe attachment storage key/);
        }

        const content = Buffer.from("MatMix attachment storage test", "utf8");
        const expectedHash = crypto.createHash("sha256").update(content).digest("hex");
        const temporaryKey = await storage.createTemporaryFile(content);
        assert.match(temporaryKey, /^tmp-[a-f0-9]{64}$/);
        assert.strictEqual(await storage.fileExists(temporaryKey), true);
        assert.strictEqual(await storage.computeSha256(temporaryKey), expectedHash);

        const permanentKey = storage.generateStorageKey("pdf");
        const occupiedKey = storage.generateStorageKey("pdf");
        const occupiedTempKey = await storage.createTemporaryFile(Buffer.from("occupied"));
        await storage.moveTemporaryFile(occupiedTempKey, occupiedKey);
        await expectRejected(() => storage.moveTemporaryFile(permanentKey, occupiedKey), /Invalid temporary/);
        const collisionTempKey = await storage.createTemporaryFile(Buffer.from("collision"));
        await expectRejected(() => storage.moveTemporaryFile(collisionTempKey, occupiedKey), /already exists/);
        assert.strictEqual(await storage.deleteFile(collisionTempKey), true);
        assert.strictEqual(await storage.deleteFile(occupiedKey), true);
        assert.strictEqual(await storage.moveTemporaryFile(temporaryKey, permanentKey), permanentKey);
        assert.strictEqual(await storage.fileExists(temporaryKey), false);
        assert.strictEqual(await storage.fileExists(permanentKey), true);
        assert.strictEqual(await storage.computeSha256(permanentKey), expectedHash);

        await fs.promises.writeFile(outsideFile, "must remain");
        await expectRejected(() => storage.deleteFile(outsideFile), /Unsafe attachment storage key/);
        assert.strictEqual(await fs.promises.readFile(outsideFile, "utf8"), "must remain");

        const symlinkKey = "escape.pdf";
        const symlinkPath = path.join(storageRoot, symlinkKey);
        try {
            await fs.promises.symlink(outsideFile, symlinkPath, "file");
            await expectRejected(() => storage.fileExists(symlinkKey), /Symbolic links/);
            await fs.promises.unlink(symlinkPath);
        } catch (error) {
            if (!["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) throw error;
            symlink = `skipped:${error.code}`;
        }

        assert.strictEqual(await storage.deleteFile(permanentKey), true);
        assert.strictEqual(await storage.deleteFile(permanentKey), false);
        assert.strictEqual(await storage.fileExists(permanentKey), false);

        console.log(JSON.stringify({
            success: true,
            rootCreation: "ok",
            randomKeys: "ok",
            containment: "ok",
            traversal: "rejected",
            windowsPaths: "rejected",
            mixedSeparators: "rejected",
            symlink,
            sha256: "ok",
            move: "ok",
            overwrite: "rejected",
            idempotentDelete: "ok",
            outsideFileProtected: "ok"
        }));
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
