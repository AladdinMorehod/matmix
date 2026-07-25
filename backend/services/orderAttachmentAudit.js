const crypto = require("crypto");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const {
    createOrderAttachmentStorage,
    validateStorageKey
} = require("./orderAttachmentStorage");
const { validateAttachmentMetadata } = require("./orderAttachments");

function openReadOnly(filePath) {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY);
    db.configure("busyTimeout", 5000);
    return {
        all(sql) {
            return new Promise((resolve, reject) => db.all(sql, (error, rows) => error ? reject(error) : resolve(rows)));
        },
        close() {
            return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
        }
    };
}

async function listAttachmentMetadata(dbPath) {
    const db = openReadOnly(dbPath);
    try {
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='order_attachments'");
        if (!tables.length) return [];
        return await db.all(
            `SELECT id, order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
             FROM order_attachments ORDER BY id`
        );
    } finally {
        await db.close();
    }
}

async function digestStream(stream) {
    const hash = crypto.createHash("sha256");
    await new Promise((resolve, reject) => {
        stream.on("data", chunk => hash.update(chunk));
        stream.once("error", reject);
        stream.once("end", resolve);
    });
    return hash.digest("hex");
}

async function listStorageEntries(rootPath) {
    try {
        return await fs.promises.readdir(rootPath, { withFileTypes: true });
    } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
    }
}

async function auditOrderAttachments({ dbPath, attachmentsPath, includeMetadata = false }) {
    const rows = await listAttachmentMetadata(dbPath);
    const storage = createOrderAttachmentStorage({ rootPath: attachmentsPath });
    const expected = new Set();
    const missing = [];
    const corrupt = [];
    const unsafe = [];
    const metadata = [];
    let totalBytes = 0;
    let storageAvailable = false;
    try {
        const rootStat = await fs.promises.lstat(attachmentsPath);
        if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
            unsafe.push({ storageKey: "", reason: "Attachment storage root must be a real directory." });
        } else {
            storageAvailable = true;
        }
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }

    for (const row of rows) {
        let validated;
        try {
            validated = validateAttachmentMetadata(row);
        } catch (error) {
            unsafe.push({ attachmentId: row.id, storageKey: String(row.storage_key || ""), reason: error.message });
            continue;
        }
        if (expected.has(validated.storageKey)) {
            unsafe.push({ attachmentId: row.id, storageKey: validated.storageKey, reason: "Duplicate storage key in metadata." });
            continue;
        }
        expected.add(validated.storageKey);
        metadata.push(validated);
        try {
            if (!storageAvailable) {
                missing.push({ attachmentId: row.id, storageKey: validated.storageKey });
                continue;
            }
            const opened = await storage.createReadStream(validated.storageKey);
            const actualSha256 = await digestStream(opened.stream);
            if (opened.sizeBytes !== validated.sizeBytes || actualSha256 !== validated.sha256) {
                corrupt.push({
                    attachmentId: row.id,
                    storageKey: validated.storageKey,
                    expectedSizeBytes: validated.sizeBytes,
                    actualSizeBytes: opened.sizeBytes,
                    sha256Matches: actualSha256 === validated.sha256
                });
            } else {
                totalBytes += opened.sizeBytes;
            }
        } catch (error) {
            if (error.code === "ENOENT") {
                missing.push({ attachmentId: row.id, storageKey: validated.storageKey });
            } else {
                unsafe.push({ attachmentId: row.id, storageKey: validated.storageKey, reason: error.message });
            }
        }
    }

    const entries = storageAvailable ? await listStorageEntries(attachmentsPath) : [];
    const orphans = [];
    for (const entry of entries) {
        let safeKey = null;
        try {
            safeKey = validateStorageKey(entry.name);
        } catch (error) {
            unsafe.push({ storageKey: entry.name, reason: error.message });
            continue;
        }
        if (!entry.isFile()) {
            unsafe.push({ storageKey: safeKey, reason: "Attachment storage contains a non-regular entry." });
        } else if (!expected.has(safeKey)) {
            orphans.push({ storageKey: safeKey });
        }
    }

    const report = {
        healthy: missing.length === 0 && corrupt.length === 0 && orphans.length === 0 && unsafe.length === 0,
        metadataCount: rows.length,
        filesystemFileCount: entries.filter(entry => entry.isFile()).length,
        verifiedFileCount: rows.length - missing.length - corrupt.length - unsafe.filter(item => item.attachmentId).length,
        totalBytes,
        missing,
        corrupt,
        orphans,
        unsafe,
        checkedAt: new Date().toISOString()
    };
    if (includeMetadata) report.metadata = metadata;
    return report;
}

module.exports = {
    auditOrderAttachments,
    digestStream,
    listAttachmentMetadata
};
