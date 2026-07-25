const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { auditOrderAttachments } = require("../services/orderAttachmentAudit");
const { migrateDatabase } = require("../databaseMigrations");

function run(dbPath, sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.run(sql, params, function done(error) {
            const result = { lastID: this?.lastID };
            db.close(() => error ? reject(error) : resolve(result));
        });
    });
}

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-attachment-audit-"));
    try {
        const dbPath = path.join(root, "matmix.db");
        const attachmentsPath = path.join(root, "attachments");
        await fs.promises.mkdir(attachmentsPath);
        process.env.MATMIX_DB_PATH = dbPath;
        const { initDatabase, db } = require("../database");
        await initDatabase();
        await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
        await migrateDatabase(dbPath, { dryRun: false });

        const order = await run(dbPath, "INSERT INTO orders(customer_name,phone,items_json,created_at,updated_at,request_type) VALUES(?,?,?,?,?,'file_request')", ["Audit fixture", "+70000000000", "[]", new Date().toISOString(), new Date().toISOString()]);
        const body = Buffer.from("attachment audit fixture");
        const key = `${crypto.randomBytes(32).toString("hex")}.txt`;
        const digest = crypto.createHash("sha256").update(body).digest("hex");
        await fs.promises.writeFile(path.join(attachmentsPath, key), body);
        await run(dbPath, "INSERT INTO order_attachments(order_id,original_name,storage_key,mime_type,extension,size_bytes,sha256,created_at) VALUES(?,?,?,?,?,?,?,?)", [order.lastID, "Проверка аудита.txt", key, "text/plain", "txt", body.length, digest, new Date().toISOString()]);

        const healthy = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert.strictEqual(healthy.healthy, true);
        assert.strictEqual(healthy.metadataCount, 1);

        await fs.promises.rm(path.join(attachmentsPath, key));
        const missing = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert.strictEqual(missing.missing.length, 1);

        await fs.promises.writeFile(path.join(attachmentsPath, key), Buffer.alloc(body.length, 1));
        const shaMismatch = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert.strictEqual(shaMismatch.corrupt.length, 1);
        assert.strictEqual(shaMismatch.corrupt[0].actualSizeBytes, body.length);

        await fs.promises.writeFile(path.join(attachmentsPath, key), "size mismatch");
        const sizeMismatch = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert.strictEqual(sizeMismatch.corrupt.length, 1);
        assert.notStrictEqual(sizeMismatch.corrupt[0].actualSizeBytes, body.length);

        await fs.promises.writeFile(path.join(attachmentsPath, key), body);
        await fs.promises.writeFile(path.join(attachmentsPath, "orphan.txt"), "orphan");
        const orphan = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert.strictEqual(orphan.orphans.length, 1);

        await fs.promises.mkdir(path.join(attachmentsPath, "unexpected-directory"));
        const unsafe = await auditOrderAttachments({ dbPath, attachmentsPath });
        assert(unsafe.unsafe.some(item => item.storageKey === "unexpected-directory"));

        console.log(JSON.stringify({
            success: true,
            healthy: healthy.healthy,
            missingDetected: missing.missing.length,
            shaMismatchDetected: shaMismatch.corrupt.length,
            sizeMismatchDetected: sizeMismatch.corrupt.length,
            orphanDetected: orphan.orphans.length,
            unsafeDetected: unsafe.unsafe.length,
            readOnly: true
        }));
    } finally {
        await fs.promises.rm(root, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
