const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("./sqlite");

const CURRENT_SCHEMA_VERSION = 3;
const CONSENT_COLUMNS = [
    ["consent_given", "INTEGER"], ["consent_at", "TEXT"], ["privacy_policy_version", "TEXT"],
    ["terms_version", "TEXT"], ["privacy_policy_url", "TEXT"], ["terms_url", "TEXT"]
];
const REQUIRED_INDEXES = [
    "idx_clients_phone", "idx_orders_status_created_at", "idx_orders_client_created_at",
    "idx_order_events_order_created_at", "idx_products_public_order", "idx_products_catalog_order",
    "idx_products_group_order", "idx_products_image_url", "idx_order_attachments_order_id"
];

function helpers(db) {
    return {
        run(sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes, id: this.lastID }); })); },
        get(sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        close() { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
    };
}

async function openDatabase(file) {
    const db = new sqlite3.Database(path.resolve(file));
    await configureBusinessConnection(db);
    return helpers(db);
}

async function audit(db) {
    const checks = {
        ordersWithoutClient: "SELECT COUNT(*) count FROM orders o LEFT JOIN clients c ON c.id=o.client_id WHERE o.client_id IS NOT NULL AND c.id IS NULL",
        eventsWithoutOrder: "SELECT COUNT(*) count FROM order_events e LEFT JOIN orders o ON o.id=e.order_id WHERE o.id IS NULL",
        subcategoriesWithoutParent: "SELECT COUNT(*) count FROM catalog_structure s LEFT JOIN catalog_structure p ON p.id=s.parent_id WHERE s.type='subcategory' AND p.id IS NULL",
        activeChildWithInactiveParent: "SELECT COUNT(*) count FROM catalog_structure s JOIN catalog_structure p ON p.id=s.parent_id WHERE s.is_active=1 AND p.is_active<>1",
        emptyStructureCodes: "SELECT COUNT(*) count FROM catalog_structure WHERE external_code IS NULL OR TRIM(external_code)=''",
        duplicateOrderNumbers: "SELECT COUNT(*) count FROM (SELECT order_number FROM orders WHERE order_number IS NOT NULL GROUP BY order_number HAVING COUNT(*)>1)",
        duplicateProductCodes: "SELECT COUNT(*) count FROM (SELECT external_id FROM products GROUP BY external_id HAVING COUNT(*)>1)",
        emptyProductCodes: "SELECT COUNT(*) count FROM products WHERE external_id IS NULL OR TRIM(external_id)=''"
    };
    const result = {};
    for (const [name, sql] of Object.entries(checks)) result[name] = Number((await db.get(sql)).count);
    const orderColumns = new Set((await db.all("PRAGMA table_info(orders)")).map(column => column.name));
    result.invalidRequestTypes = orderColumns.has("request_type")
        ? Number((await db.get("SELECT COUNT(*) count FROM orders WHERE request_type NOT IN ('order','file_request') OR request_type IS NULL")).count)
        : 0;
    const attachmentsTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_attachments'");
    result.attachmentsWithoutOrder = attachmentsTable
        ? Number((await db.get("SELECT COUNT(*) count FROM order_attachments a LEFT JOIN orders o ON o.id=a.order_id WHERE o.id IS NULL")).count)
        : 0;
    return result;
}

async function createDatabaseBackup(db, dbPath) {
    const backupDir = path.join(path.dirname(dbPath), "migration-backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const version = Number((await db.get("PRAGMA user_version")).user_version || 0);
    const target = path.join(backupDir, `matmix-v${version}-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    await db.run(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    return target;
}

function quoteIdentifier(value) {
    const identifier = String(value || "");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) throw new Error(`Unsafe SQLite identifier: ${identifier}`);
    return `"${identifier}"`;
}

async function copyNamedColumns(db, sourceTable, targetTable, allowedColumns = null) {
    const sourceColumns = (await db.all(`PRAGMA table_info(${quoteIdentifier(sourceTable)})`)).map(column => column.name);
    const columns = allowedColumns ? sourceColumns.filter(column => allowedColumns.includes(column)) : sourceColumns;
    if (!columns.length) throw new Error(`No columns available to copy from ${sourceTable}.`);
    const list = columns.map(quoteIdentifier).join(", ");
    await db.run(`INSERT INTO ${quoteIdentifier(targetTable)} (${list}) SELECT ${list} FROM ${quoteIdentifier(sourceTable)}`);
}

async function ensureColumn(db, tableName, columnName, definition) {
    const columns = new Set((await db.all(`PRAGMA table_info(${quoteIdentifier(tableName)})`)).map(column => column.name));
    if (!columns.has(columnName)) await db.run(`ALTER TABLE ${quoteIdentifier(tableName)} ADD COLUMN ${quoteIdentifier(columnName)} ${definition}`);
}

async function migrateLegacyV0(db) {
    for (const indexName of ["idx_orders_order_number", "idx_clients_phone", "idx_orders_status_created_at", "idx_orders_client_created_at", "idx_order_events_order_created_at"]) {
        await db.run(`DROP INDEX IF EXISTS ${quoteIdentifier(indexName)}`);
    }
    await db.run("ALTER TABLE order_events RENAME TO order_events_legacy");
    await db.run("ALTER TABLE orders RENAME TO orders_legacy");
    const orderForeignKeys = await db.all("PRAGMA foreign_key_list(orders_legacy)");
    let orderSql = (await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders_legacy'")).sql
        .replace(/CREATE TABLE\s+[\"'`\[]?orders_legacy[\"'`\]]?/i, "CREATE TABLE orders");
    if (!orderForeignKeys.some(foreignKey => foreignKey.from === "client_id")) {
        orderSql = orderSql.replace(/\)\s*$/, ", FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL)");
    }
    await db.run(orderSql);
    await db.run("UPDATE orders_legacy SET client_id=NULL WHERE client_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clients WHERE clients.id=orders_legacy.client_id)");
    await copyNamedColumns(db, "orders_legacy", "orders");
    await db.run(`CREATE TABLE order_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, user_id INTEGER, user_name TEXT,
        event_type TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`);
    await copyNamedColumns(db, "order_events_legacy", "order_events", [
        "id", "order_id", "user_id", "user_name", "event_type", "message", "created_at"
    ]);
    const oldOrders = Number((await db.get("SELECT COUNT(*) count FROM orders_legacy")).count);
    const newOrders = Number((await db.get("SELECT COUNT(*) count FROM orders")).count);
    const oldEvents = Number((await db.get("SELECT COUNT(*) count FROM order_events_legacy")).count);
    const newEvents = Number((await db.get("SELECT COUNT(*) count FROM order_events")).count);
    if (oldOrders !== newOrders || oldEvents !== newEvents) throw new Error("Migration row-count verification failed.");
    await db.run("DROP TABLE order_events_legacy");
    await db.run("DROP TABLE orders_legacy");
    await db.run("CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL");
    await db.run("CREATE INDEX idx_clients_phone ON clients(phone)");
    await db.run("CREATE INDEX idx_orders_status_created_at ON orders(status, created_at DESC)");
    await db.run("CREATE INDEX idx_orders_client_created_at ON orders(client_id, created_at DESC)");
    await db.run("CREATE INDEX idx_order_events_order_created_at ON order_events(order_id, created_at)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_products_public_order ON products(is_active, deleted_at, sort_order, id)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_products_catalog_order ON products(category, subcategory, sort_order, id)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_products_group_order ON products(category, subcategory, product_group, sort_order, id)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url)");
    await db.run("DROP INDEX IF EXISTS idx_products_external_id");
}

async function migrateToV3(db) {
    await ensureColumn(db, "orders", "request_type", "TEXT NOT NULL DEFAULT 'order' CHECK (request_type IN ('order', 'file_request'))");
    await ensureColumn(db, "orders", "email", "TEXT");
    const invalidTypes = Number((await db.get("SELECT COUNT(*) count FROM orders WHERE request_type NOT IN ('order','file_request') OR request_type IS NULL")).count);
    if (invalidTypes) throw new Error("Migration blocked by invalid order request_type values.");
    await db.run(`CREATE TABLE IF NOT EXISTS order_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        original_name TEXT NOT NULL CHECK (length(trim(original_name)) BETWEEN 1 AND 255),
        storage_key TEXT NOT NULL UNIQUE CHECK (
            length(storage_key) BETWEEN 1 AND 160
            AND instr(storage_key, '/') = 0
            AND instr(storage_key, char(92)) = 0
            AND instr(storage_key, '..') = 0
            AND storage_key NOT GLOB '*[^a-z0-9._-]*'
        ),
        mime_type TEXT NOT NULL CHECK (
            length(trim(mime_type)) BETWEEN 3 AND 127
            AND mime_type = lower(mime_type)
            AND instr(mime_type, '/') > 1
        ),
        extension TEXT NOT NULL CHECK (
            length(extension) BETWEEN 1 AND 10
            AND extension = lower(extension)
            AND substr(extension, 1, 1) <> '.'
            AND extension IN ('pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'csv')
        ),
        size_bytes INTEGER NOT NULL CHECK (
            typeof(size_bytes) = 'integer'
            AND size_bytes BETWEEN 0 AND 15728640
        ),
        sha256 TEXT NOT NULL CHECK (
            length(sha256) = 64
            AND sha256 = lower(sha256)
            AND sha256 NOT GLOB '*[^0-9a-f]*'
        ),
        created_at TEXT NOT NULL CHECK (length(trim(created_at)) BETWEEN 1 AND 64),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`);
    await db.run("CREATE INDEX IF NOT EXISTS idx_order_attachments_order_id ON order_attachments(order_id)");
}

async function migrateDatabase(dbPath, { dryRun = true, injectFailure = false } = {}) {
    const db = await openDatabase(dbPath);
    try {
        const fromVersion = Number((await db.get("PRAGMA user_version")).user_version || 0);
        if (fromVersion > CURRENT_SCHEMA_VERSION) throw new Error(`Unsupported newer schema version ${fromVersion}.`);
        const findings = await audit(db);
        if (dryRun || fromVersion === CURRENT_SCHEMA_VERSION) return { dryRun, fromVersion, toVersion: CURRENT_SCHEMA_VERSION, findings, changed: false };
        if (![0, 1, 2].includes(fromVersion)) throw new Error(`Unsupported schema version ${fromVersion}.`);
        if (findings.eventsWithoutOrder || findings.subcategoriesWithoutParent || findings.activeChildWithInactiveParent
            || findings.duplicateOrderNumbers || findings.duplicateProductCodes || findings.emptyProductCodes
            || findings.invalidRequestTypes || findings.attachmentsWithoutOrder) {
            throw new Error("Migration blocked by critical integrity findings.");
        }
        const backupPath = await createDatabaseBackup(db, path.resolve(dbPath));
        await db.run("BEGIN IMMEDIATE");
        try {
            if (fromVersion === 0) await migrateLegacyV0(db);
            if (fromVersion <= 1) {
                for (const [name, type] of CONSENT_COLUMNS) await ensureColumn(db, "orders", name, type);
            }
            await migrateToV3(db);
            if (injectFailure) throw new Error("Injected migration failure");
            const fk = await db.all("PRAGMA foreign_key_check");
            const integrity = await db.get("PRAGMA integrity_check");
            if (fk.length || integrity.integrity_check !== "ok") throw new Error("Post-migration integrity verification failed.");
            await db.run(`PRAGMA user_version=${CURRENT_SCHEMA_VERSION}`);
            await db.run("COMMIT");
        } catch (error) { await db.run("ROLLBACK").catch(() => {}); throw error; }
        return { dryRun: false, fromVersion, toVersion: CURRENT_SCHEMA_VERSION, findings, changed: true, backupPath };
    } finally { await db.close(); }
}

async function assertSupportedSchema(get, { production = false } = {}) {
    const version = Number((await get("PRAGMA user_version")).user_version || 0);
    if (version !== CURRENT_SCHEMA_VERSION && production) throw new Error(`Unsupported database schema ${version}; run the migration CLI.`);
    return version;
}

module.exports = { CURRENT_SCHEMA_VERSION, REQUIRED_INDEXES, audit, migrateDatabase, assertSupportedSchema, openDatabase };
