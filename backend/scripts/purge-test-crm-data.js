#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { openDatabase } = require("../databaseMigrations");
const { runtimePaths } = require("../services/productionBackup");
const { createOrderAttachmentStorage } = require("../services/orderAttachmentStorage");

const CONFIRM = "PURGE_TEST_CRM_DATA";
const TABLES = [
    ["orders", "SELECT COUNT(*) count FROM orders"],
    ["clients", "SELECT COUNT(*) count FROM clients"],
    ["order_events", "SELECT COUNT(*) count FROM order_events"],
    ["order_attachments", "SELECT COUNT(*) count FROM order_attachments"],
    ["order_email_outbox", "SELECT COUNT(*) count FROM order_email_outbox"],
    ["web_push_outbox", "SELECT COUNT(*) count FROM web_push_outbox"],
    ["order_notification_reads", "SELECT COUNT(*) count FROM order_notification_reads"]
];

async function tableExists(db, name) {
    return Boolean(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name]));
}

async function countTables(db) {
    const result = {};
    for (const [name, sql] of TABLES) result[name] = await tableExists(db, name) ? Number((await db.get(sql)).count || 0) : 0;
    return result;
}

async function attachmentKeys(db) {
    if (!await tableExists(db, "order_attachments")) return [];
    return (await db.all("SELECT storage_key FROM order_attachments ORDER BY id")).map(row => row.storage_key);
}

async function buildReport(db, attachmentsPath) {
    const before = await countTables(db);
    const keys = await attachmentKeys(db);
    const storage = createOrderAttachmentStorage({ rootPath: attachmentsPath });
    let files = 0;
    for (const key of keys) if (await storage.fileExists(key).catch(() => false)) files += 1;
    const catalog = {
        products: Number((await db.get("SELECT COUNT(*) count FROM products")).count || 0),
        structure: Number((await db.get("SELECT COUNT(*) count FROM catalog_structure")).count || 0),
        users: Number((await db.get("SELECT COUNT(*) count FROM users")).count || 0)
    };
    return { before, plannedDelete: { ...before, attachmentFiles: files }, afterExpected: { ...Object.fromEntries(Object.keys(before).map(key => [key, 0])), attachmentFiles: 0 }, catalog, attachmentKeys: keys };
}

async function purge(db, { failAfter = "" } = {}) {
    const orderIds = (await db.all("SELECT id FROM orders")).map(row => Number(row.id));
    const clientIds = (await db.all("SELECT id FROM clients")).map(row => Number(row.id));
    await db.run("BEGIN IMMEDIATE");
    try {
        const has = name => tableExists(db, name);
        if (await has("order_notification_reads")) await db.run("DELETE FROM order_notification_reads");
        if (await has("web_push_outbox")) await db.run("DELETE FROM web_push_outbox");
        if (await has("order_email_outbox")) await db.run("DELETE FROM order_email_outbox");
        if (await has("order_attachments")) await db.run("DELETE FROM order_attachments");
        if (await has("order_events")) await db.run("DELETE FROM order_events");
        if (failAfter === "children") throw new Error("Injected purge failure after children");
        await db.run("DELETE FROM orders");
        if (failAfter === "orders") throw new Error("Injected purge failure after orders");
        await db.run("DELETE FROM clients");
        await db.run("COMMIT");
        return { orderIds, clientIds };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function removeAttachmentFiles(keys, attachmentsPath) {
    const storage = createOrderAttachmentStorage({ rootPath: attachmentsPath });
    const removed = [];
    for (const key of keys || []) if (await storage.deleteFile(key).catch(() => false)) removed.push(key);
    return removed;
}

async function retryOrphanAttachmentFiles(db, attachmentsPath) {
    const storage = createOrderAttachmentStorage({ rootPath: attachmentsPath });
    const referenced = new Set(await attachmentKeys(db));
    let entries = [];
    try { entries = await fs.promises.readdir(attachmentsPath, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return []; throw error; }
    const removed = [];
    for (const entry of entries) {
        if (!entry.isFile() || referenced.has(entry.name)) continue;
        if (await storage.deleteFile(entry.name).catch(() => false)) removed.push(entry.name);
    }
    return removed;
}

async function main(argv = process.argv.slice(2)) {
    const apply = argv.includes("--apply");
    const confirmIndex = argv.indexOf("--confirm");
    const confirm = confirmIndex >= 0 ? argv[confirmIndex + 1] : "";
    if (apply && confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    const dbArg = argv[argv.indexOf("--db") + 1];
    const attachmentsArg = argv[argv.indexOf("--attachments") + 1];
    const paths = runtimePaths({ ...process.env, ...(dbArg ? { MATMIX_DB_PATH: dbArg } : {}), ...(attachmentsArg ? { ORDER_ATTACHMENTS_PATH: attachmentsArg } : {}) }, { allowMissingProduction: true });
    const db = await openDatabase(paths.dbPath);
    try {
        const report = await buildReport(db, paths.attachmentsPath);
        if (!apply) {
            console.log(JSON.stringify({ dryRun: true, ...report }, null, 2));
            return report;
        }
        const deleted = await purge(db, { failAfter: argv[argv.indexOf("--fail-after") + 1] || "" });
        const removedFiles = await removeAttachmentFiles(report.attachmentKeys, paths.attachmentsPath);
        const after = await buildReport(db, paths.attachmentsPath);
        console.log(JSON.stringify({ dryRun: false, ...report, deleted, removedFiles, after }, null, 2));
        return { ...report, deleted, removedFiles, after };
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(JSON.stringify({ success: false, error: error.message })); process.exitCode = 2; });
module.exports = { CONFIRM, buildReport, purge, removeAttachmentFiles, retryOrphanAttachmentFiles, main };
