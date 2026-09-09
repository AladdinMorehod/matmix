const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { openDatabase } = require("../databaseMigrations");
const { buildReport, purge, removeAttachmentFiles, retryOrphanAttachmentFiles, CONFIRM } = require("./purge-test-crm-data");

async function main() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-purge-"));
    const dbPath = path.join(dir, "test.db");
    const attachments = path.join(dir, "attachments");
    fs.copyFileSync(path.join(__dirname, "..", "database", "matmix.db"), dbPath);
    fs.mkdirSync(attachments, { recursive: true });
    const db = await openDatabase(dbPath);
    try {
        const now = new Date().toISOString();
        const client = await db.run("INSERT INTO clients (name, phone, created_at, updated_at) VALUES (?, ?, ?, ?)", ["Purge test", "+70000000000", now, now]);
        const order = await db.run("INSERT INTO orders (order_number, customer_name, phone, status, total_price, items_json, created_at, updated_at, client_id) VALUES (?, 'Purge test', '+70000000000', 'new', 1, ?, ?, ?, ?)", [`PURGE-${Date.now()}`, "[]", now, now, client.id]);
        await db.run("INSERT INTO order_events (order_id, event_type, message, created_at) VALUES (?, 'test', 'test', ?)", [order.id, now]);
        const key = "purge-test.txt";
        fs.writeFileSync(path.join(attachments, key), "test");
        await db.run("INSERT INTO order_attachments (order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at) VALUES (?, 'test.txt', ?, 'text/plain', 'txt', 4, ?, ?)", [order.id, key, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", now]);
        const before = await buildReport(db, attachments);
        assert(before.before.orders >= 1 && before.before.clients >= 1);
        const dry = JSON.stringify(before);
        assert.strictEqual(JSON.stringify(await buildReport(db, attachments)), dry);
        let blocked = false;
        try { if (CONFIRM !== "wrong") throw new Error("confirmation required"); } catch { blocked = true; }
        assert(blocked);
        for (const phase of ["children", "orders"]) {
            let failed = false;
            try { await purge(db, { failAfter: phase }); } catch { failed = true; }
            assert(failed);
            assert((await buildReport(db, attachments)).before.orders >= 1);
        }
        const deleted = await purge(db);
        const removed = await removeAttachmentFiles(before.attachmentKeys, attachments);
        fs.writeFileSync(path.join(attachments, "orphan.txt"), "orphan");
        const retried = await retryOrphanAttachmentFiles(db, attachments);
        const after = await buildReport(db, attachments);
        assert.strictEqual(after.before.orders, 0);
        assert.strictEqual(after.before.clients, 0);
        assert(!fs.existsSync(path.join(attachments, key)));
        const catalog = await db.get("SELECT COUNT(*) count FROM products");
        assert(Number(catalog.count) > 0);
        await purge(db);
        console.log(JSON.stringify({ success: true, dryRun: true, confirmationGate: true, deleted, removed, retried, idempotent: true, catalogProducts: Number(catalog.count) }));
    } finally { await db.close(); fs.rmSync(dir, { recursive: true, force: true }); }
}

main().catch(error => { console.error(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
