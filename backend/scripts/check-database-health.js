const sqlite3 = require("sqlite3").verbose();
const { runtimePaths } = require("../services/productionBackup");
const { CURRENT_SCHEMA_VERSION, REQUIRED_INDEXES } = require("../databaseMigrations");
const { BUSY_TIMEOUT_MS } = require("../sqlite");

function open(file) {
    const raw = new sqlite3.Database(file, sqlite3.OPEN_READONLY);
    raw.configure("busyTimeout", BUSY_TIMEOUT_MS);
    raw.run("PRAGMA foreign_keys=ON");
    return {
        get(sql) { return new Promise((resolve, reject) => raw.get(sql, (e, r) => e ? reject(e) : resolve(r))); },
        all(sql) { return new Promise((resolve, reject) => raw.all(sql, (e, r) => e ? reject(e) : resolve(r))); },
        close() { return new Promise(resolve => raw.close(() => resolve())); }
    };
}

async function main() {
    const db = open(runtimePaths().dbPath);
    try {
        const scalar = async sql => Object.values(await db.get(sql))[0];
        const version = Number(await scalar("PRAGMA user_version"));
        const indexes = new Set((await db.all("SELECT name FROM sqlite_master WHERE type='index'")).map(row => row.name));
        const tables = new Set((await db.all("SELECT name FROM sqlite_master WHERE type='table'")).map(row => row.name));
        const orderColumns = new Set((await db.all("PRAGMA table_info(orders)")).map(row => row.name));
        const hasAttachments = tables.has("order_attachments");
        const report = {
            healthy: true,
            schemaVersion: version,
            expectedSchemaVersion: CURRENT_SCHEMA_VERSION,
            journalMode: await scalar("PRAGMA journal_mode"),
            foreignKeys: Number(await scalar("PRAGMA foreign_keys")),
            busyTimeout: Number(await scalar("PRAGMA busy_timeout")),
            integrity: await scalar("PRAGMA integrity_check"),
            foreignKeyViolations: (await db.all("PRAGMA foreign_key_check")).length,
            missingIndexes: REQUIRED_INDEXES.filter(name => !indexes.has(name)),
            schema: {
                ordersRequestType: orderColumns.has("request_type"),
                ordersEmail: orderColumns.has("email"),
                orderAttachments: hasAttachments,
                orderAttachmentsOrderIndex: indexes.has("idx_order_attachments_order_id")
            },
            counts: {
                products: await scalar("SELECT COUNT(*) FROM products"), clients: await scalar("SELECT COUNT(*) FROM clients"),
                orders: await scalar("SELECT COUNT(*) FROM orders"), events: await scalar("SELECT COUNT(*) FROM order_events"),
                attachments: hasAttachments ? await scalar("SELECT COUNT(*) FROM order_attachments") : null
            },
            orphans: {
                ordersWithoutClient: await scalar("SELECT COUNT(*) FROM orders o LEFT JOIN clients c ON c.id=o.client_id WHERE o.client_id IS NOT NULL AND c.id IS NULL"),
                eventsWithoutOrder: await scalar("SELECT COUNT(*) FROM order_events e LEFT JOIN orders o ON o.id=e.order_id WHERE o.id IS NULL"),
                attachmentsWithoutOrder: hasAttachments
                    ? await scalar("SELECT COUNT(*) FROM order_attachments a LEFT JOIN orders o ON o.id=a.order_id WHERE o.id IS NULL")
                    : null
            },
            invalidRequestTypes: orderColumns.has("request_type")
                ? await scalar("SELECT COUNT(*) FROM orders WHERE request_type NOT IN ('order','file_request') OR request_type IS NULL")
                : null,
            invalidAttachmentMetadata: hasAttachments
                ? await scalar(`SELECT COUNT(*) FROM order_attachments
                    WHERE order_id <= 0 OR length(trim(original_name)) NOT BETWEEN 1 AND 255
                    OR length(storage_key) NOT BETWEEN 1 AND 160 OR instr(storage_key, '/') > 0
                    OR instr(storage_key, char(92)) > 0 OR instr(storage_key, '..') > 0
                    OR storage_key GLOB '*[^a-z0-9._-]*'
                    OR length(trim(mime_type)) NOT BETWEEN 3 AND 127 OR mime_type <> lower(mime_type)
                    OR instr(mime_type, '/') <= 1
                    OR extension NOT IN ('pdf','jpg','jpeg','png','xls','xlsx','csv')
                    OR typeof(size_bytes) <> 'integer' OR size_bytes NOT BETWEEN 0 AND 15728640
                    OR length(sha256) <> 64 OR sha256 <> lower(sha256) OR sha256 GLOB '*[^0-9a-f]*'
                    OR length(trim(created_at)) NOT BETWEEN 1 AND 64`)
                : null,
            duplicateBusinessKeys: {
                products: await scalar("SELECT COUNT(*) FROM (SELECT external_id FROM products GROUP BY external_id HAVING COUNT(*)>1)"),
                orders: await scalar("SELECT COUNT(*) FROM (SELECT order_number FROM orders WHERE order_number IS NOT NULL GROUP BY order_number HAVING COUNT(*)>1)")
            },
            imageReferences: await scalar("SELECT COUNT(*) FROM products WHERE COALESCE(image_url,image,'')<>''")
        };
        report.healthy = version === CURRENT_SCHEMA_VERSION && report.foreignKeys === 1 && report.busyTimeout === BUSY_TIMEOUT_MS
            && report.journalMode === "wal" && report.integrity === "ok" && !report.foreignKeyViolations
            && !report.missingIndexes.length && Object.values(report.schema).every(Boolean)
            && !Object.values(report.orphans).some(Number) && !Object.values(report.duplicateBusinessKeys).some(Number)
            && report.invalidRequestTypes === 0 && report.invalidAttachmentMetadata === 0;
        console.log(process.argv.includes("--json") ? JSON.stringify(report) : JSON.stringify(report, null, 2));
        if (!report.healthy) process.exitCode = 2;
    } finally { await db.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
