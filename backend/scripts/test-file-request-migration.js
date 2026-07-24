const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const { CURRENT_SCHEMA_VERSION, migrateDatabase, openDatabase } = require("../databaseMigrations");
const { configureBusinessConnection } = require("../sqlite");
const {
    createOrderAttachmentRepository,
    normalizeRequestType,
    validateAttachmentMetadata
} = require("../services/orderAttachments");

function rawConnection(file) {
    const raw = new sqlite3.Database(file);
    const ready = configureBusinessConnection(raw);
    return {
        async run(sql, params = []) {
            await ready;
            return new Promise((resolve, reject) => raw.run(sql, params, function done(error) {
                error ? reject(error) : resolve({ id: this.lastID, changes: this.changes });
            }));
        },
        close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
    };
}

async function createLegacyFixture(file, version = 2) {
    const db = rawConnection(file);
    try {
        await db.run("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL)");
        await db.run(`CREATE TABLE orders (
            updated_at TEXT,
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT,
            client_id INTEGER,
            comment TEXT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            items_json TEXT NOT NULL,
            status TEXT,
            created_at TEXT,
            consent_given INTEGER,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
        )`);
        await db.run(`CREATE TABLE order_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            user_id INTEGER,
            user_name TEXT,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )`);
        await db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT,
            is_active INTEGER DEFAULT 1,
            deleted_at TEXT,
            sort_order INTEGER DEFAULT 0,
            category TEXT,
            subcategory TEXT,
            product_group TEXT,
            image_url TEXT
        )`);
        await db.run(`CREATE TABLE catalog_structure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            parent_id INTEGER,
            is_active INTEGER DEFAULT 1,
            external_code TEXT
        )`);
        await db.run("INSERT INTO clients(id,name,phone) VALUES(1,'Existing client','+70000000000')");
        await db.run(`INSERT INTO orders (
            updated_at, id, order_number, client_id, comment, customer_name, phone,
            items_json, status, created_at, consent_given
        ) VALUES (
            '2026-01-02T00:00:00.000Z', 7, 'MM-2026-000007', 1, 'Preserve me',
            'Existing customer', '+70000000000', '[]', 'Новая', '2026-01-01T00:00:00.000Z', 1
        )`);
        await db.run("INSERT INTO order_events(order_id,event_type,message,created_at) VALUES(7,'created','existing','2026-01-01T00:00:00.000Z')");
        await db.run(`PRAGMA user_version=${Number(version)}`);
    } finally {
        await db.close();
    }
}

function initializeEmptyDatabase(file) {
    const projectRoot = path.resolve(__dirname, "..", "..");
    const script = `
        process.env.MATMIX_DB_PATH = process.argv[1];
        const { initDatabase, db } = require("./backend/database");
        initDatabase()
            .then(() => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())))
            .catch(error => { console.error(error); process.exitCode = 1; });
    `;
    const result = spawnSync(process.execPath, ["-e", script, file], {
        cwd: projectRoot,
        encoding: "utf8",
        env: { ...process.env, MATMIX_DB_PATH: file }
    });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Failed to initialize empty database.");
}

async function assertV3Schema(db) {
    assert.strictEqual(Number((await db.get("PRAGMA user_version")).user_version), CURRENT_SCHEMA_VERSION);
    const orderColumns = new Map((await db.all("PRAGMA table_info(orders)")).map(column => [column.name, column]));
    assert(orderColumns.has("request_type"));
    assert(orderColumns.has("email"));
    assert.strictEqual(orderColumns.get("request_type").notnull, 1);
    assert.strictEqual(orderColumns.get("request_type").dflt_value, "'order'");
    assert(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_attachments'"));
    assert(await db.get("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_order_attachments_order_id'"));
    const foreignKeys = await db.all("PRAGMA foreign_key_list(order_attachments)");
    assert(foreignKeys.some(key => key.table === "orders" && key.from === "order_id" && key.on_delete === "CASCADE"));
    assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
}

async function testEmptyDatabase(root) {
    const file = path.join(root, "empty.db");
    initializeEmptyDatabase(file);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.deepStrictEqual({ from: result.fromVersion, to: result.toVersion, changed: result.changed }, { from: 0, to: 3, changed: true });
    const db = await openDatabase(file);
    try {
        await assertV3Schema(db);
    } finally {
        await db.close();
    }
}

async function testV2Migration(root) {
    const file = path.join(root, "existing-v2.db");
    await createLegacyFixture(file, 2);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.deepStrictEqual({ from: result.fromVersion, to: result.toVersion, changed: result.changed }, { from: 2, to: 3, changed: true });
    const db = await openDatabase(file);
    try {
        await assertV3Schema(db);
        const oldOrder = await db.get(
            "SELECT id, customer_name, comment, request_type, email, created_at, updated_at FROM orders WHERE id=7"
        );
        assert.deepStrictEqual(oldOrder, {
            id: 7,
            customer_name: "Existing customer",
            comment: "Preserve me",
            request_type: "order",
            email: null,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-02T00:00:00.000Z"
        });

        const repository = createOrderAttachmentRepository(db);
        const createdAt = "2026-02-01T12:00:00.000Z";
        const first = await repository.createOrderAttachmentMetadata({
            orderId: 7,
            originalName: "first.pdf",
            storageKey: "1".repeat(64) + ".pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            sizeBytes: 100,
            sha256: "a".repeat(64),
            createdAt
        });
        const second = await repository.createOrderAttachmentMetadata({
            orderId: 7,
            originalName: "second.csv",
            storageKey: "2".repeat(64) + ".csv",
            mimeType: "text/csv",
            extension: "csv",
            sizeBytes: 200,
            sha256: "b".repeat(64),
            createdAt
        });
        assert.strictEqual((await repository.findOrderAttachmentById(7, first.id)).originalName, "first.pdf");
        assert.deepStrictEqual((await repository.listOrderAttachments(7)).map(item => item.id), [first.id, second.id]);

        let orphanRejected = false;
        try {
            await repository.createOrderAttachmentMetadata({
                orderId: 999,
                originalName: "orphan.pdf",
                storageKey: "3".repeat(64) + ".pdf",
                mimeType: "application/pdf",
                extension: "pdf",
                sizeBytes: 1,
                sha256: "c".repeat(64)
            });
        } catch (error) {
            orphanRejected = String(error.code).startsWith("SQLITE_CONSTRAINT");
        }
        assert(orphanRejected);

        const ordinary = await db.run(`INSERT INTO orders (
            customer_name, phone, items_json, status, created_at, updated_at
        ) VALUES ('New ordinary order', '+71111111111', '[]', 'Новая', ?, ?)`, [createdAt, createdAt]);
        assert.deepStrictEqual(
            await db.get("SELECT request_type, email FROM orders WHERE id=?", [ordinary.id]),
            { request_type: "order", email: null }
        );
        assert.throws(() => normalizeRequestType("unknown"), /Unsupported order request_type/);
        assert.throws(() => validateAttachmentMetadata({
            orderId: ordinary.id,
            originalName: "",
            storageKey: "../unsafe.pdf",
            mimeType: "application/pdf",
            extension: "PDF",
            sizeBytes: -1,
            sha256: "invalid"
        }));
        let requestTypeConstraint = false;
        try {
            await db.run("UPDATE orders SET request_type='unknown' WHERE id=?", [ordinary.id]);
        } catch (error) {
            requestTypeConstraint = String(error.code).startsWith("SQLITE_CONSTRAINT");
        }
        assert(requestTypeConstraint);
        await db.run("DELETE FROM orders WHERE id=7");
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) count FROM order_attachments WHERE order_id=7")).count), 0);
    } finally {
        await db.close();
    }

    const repeated = await migrateDatabase(file, { dryRun: false });
    assert.strictEqual(repeated.changed, false);
    assert.strictEqual(repeated.fromVersion, 3);
}

async function testLegacyColumnCopy(root) {
    const file = path.join(root, "reordered-v0.db");
    await createLegacyFixture(file, 0);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.strictEqual(result.fromVersion, 0);
    const db = await openDatabase(file);
    try {
        await assertV3Schema(db);
        assert.deepStrictEqual(
            await db.get("SELECT id, customer_name, comment, request_type, email FROM orders WHERE id=7"),
            { id: 7, customer_name: "Existing customer", comment: "Preserve me", request_type: "order", email: null }
        );
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) count FROM order_events WHERE order_id=7")).count), 1);
    } finally {
        await db.close();
    }
}

(async () => {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 3);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-file-request-migration-"));
    try {
        await testEmptyDatabase(root);
        await testV2Migration(root);
        await testLegacyColumnCopy(root);
        console.log(JSON.stringify({
            success: true,
            schema: "2->3",
            emptyDatabase: "ok",
            existingOrdersPreserved: "ok",
            explicitColumnOrderIndependent: "ok",
            legacyReorderedColumnCopy: "ok",
            attachmentMetadata: "ok",
            foreignKeys: "ok",
            cascade: "ok",
            idempotentFramework: "ok"
        }));
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
