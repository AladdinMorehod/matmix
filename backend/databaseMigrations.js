const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("./sqlite");

const CURRENT_SCHEMA_VERSION = 2;
const CONSENT_COLUMNS = [
    ["consent_given", "INTEGER"], ["consent_at", "TEXT"], ["privacy_policy_version", "TEXT"],
    ["terms_version", "TEXT"], ["privacy_policy_url", "TEXT"], ["terms_url", "TEXT"]
];
const REQUIRED_INDEXES = [
    "idx_clients_phone", "idx_orders_status_created_at", "idx_orders_client_created_at",
    "idx_order_events_order_created_at", "idx_products_public_order", "idx_products_catalog_order",
    "idx_products_group_order", "idx_products_image_url"
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
    return result;
}

async function createDatabaseBackup(db, dbPath) {
    const backupDir = path.join(path.dirname(dbPath), "migration-backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const target = path.join(backupDir, `matmix-v0-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    await db.run(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    return target;
}

async function migrateDatabase(dbPath, { dryRun = true, injectFailure = false } = {}) {
    const db = await openDatabase(dbPath);
    try {
        const fromVersion = Number((await db.get("PRAGMA user_version")).user_version || 0);
        if (fromVersion > CURRENT_SCHEMA_VERSION) throw new Error(`Unsupported newer schema version ${fromVersion}.`);
        const findings = await audit(db);
        if (dryRun || fromVersion === CURRENT_SCHEMA_VERSION) return { dryRun, fromVersion, toVersion: CURRENT_SCHEMA_VERSION, findings, changed: false };
        if (![0, 1].includes(fromVersion)) throw new Error(`Unsupported schema version ${fromVersion}.`);
        if (findings.eventsWithoutOrder || findings.subcategoriesWithoutParent || findings.activeChildWithInactiveParent
            || findings.duplicateOrderNumbers || findings.duplicateProductCodes || findings.emptyProductCodes) {
            throw new Error("Migration blocked by critical integrity findings.");
        }
        const backupPath = await createDatabaseBackup(db, path.resolve(dbPath));
        if (fromVersion === 1) {
            await db.run("BEGIN IMMEDIATE");
            try {
                for (const [name, type] of CONSENT_COLUMNS) await db.run(`ALTER TABLE orders ADD COLUMN ${name} ${type}`);
                if (injectFailure) throw new Error("Injected migration failure");
                await db.run(`PRAGMA user_version=${CURRENT_SCHEMA_VERSION}`); await db.run("COMMIT");
            } catch (error) { await db.run("ROLLBACK").catch(() => {}); throw error; }
            return { dryRun: false, fromVersion, toVersion: CURRENT_SCHEMA_VERSION, findings, changed: true, backupPath };
        }
        await db.run("BEGIN IMMEDIATE");
        try {
            await db.run("ALTER TABLE order_events RENAME TO order_events_legacy");
            await db.run("ALTER TABLE orders RENAME TO orders_legacy");
            const orderSql = (await db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders_legacy'")).sql
                .replace(/CREATE TABLE\s+[\"'`\[]?orders_legacy[\"'`\]]?/i, "CREATE TABLE orders")
                .replace(/\)\s*$/, ", FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL)");
            await db.run(orderSql);
            await db.run("UPDATE orders_legacy SET client_id=NULL WHERE client_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM clients WHERE clients.id=orders_legacy.client_id)");
            await db.run(`INSERT INTO orders SELECT ${Object.keys(await db.get("SELECT * FROM orders_legacy LIMIT 1") || {}).length ? "*" : "*"} FROM orders_legacy`);
            await db.run(`CREATE TABLE order_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, user_id INTEGER, user_name TEXT,
                event_type TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )`);
            await db.run("INSERT INTO order_events SELECT * FROM order_events_legacy");
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
            for (const [name, type] of CONSENT_COLUMNS) await db.run(`ALTER TABLE orders ADD COLUMN ${name} ${type}`);
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
