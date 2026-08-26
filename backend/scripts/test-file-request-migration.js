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

async function assertCurrentSchema(db) {
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
    assert.deepStrictEqual({ from: result.fromVersion, to: result.toVersion, changed: result.changed }, { from: 0, to: CURRENT_SCHEMA_VERSION, changed: true });
    const db = await openDatabase(file);
    try {
        await assertCurrentSchema(db);
    } finally {
        await db.close();
    }
}

async function testV2Migration(root) {
    const file = path.join(root, "existing-v2.db");
    await createLegacyFixture(file, 2);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.deepStrictEqual({ from: result.fromVersion, to: result.toVersion, changed: result.changed }, { from: 2, to: CURRENT_SCHEMA_VERSION, changed: true });
    const db = await openDatabase(file);
    try {
        await assertCurrentSchema(db);
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
    assert.strictEqual(repeated.fromVersion, CURRENT_SCHEMA_VERSION);
}

async function testLegacyColumnCopy(root) {
    const file = path.join(root, "reordered-v0.db");
    await createLegacyFixture(file, 0);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.strictEqual(result.fromVersion, 0);
    const db = await openDatabase(file);
    try {
        await assertCurrentSchema(db);
        assert.deepStrictEqual(
            await db.get("SELECT id, customer_name, comment, request_type, email FROM orders WHERE id=7"),
            { id: 7, customer_name: "Existing customer", comment: "Preserve me", request_type: "order", email: null }
        );
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) count FROM order_events WHERE order_id=7")).count), 1);
    } finally {
        await db.close();
    }
}

async function createAttachmentFixture(file, { version = 3, includeTxt = false } = {}) {
    initializeEmptyDatabase(file);
    const db = rawConnection(file);
    const createdAt = "2026-03-01T12:00:00.000Z";
    try {
        await db.run("ALTER TABLE orders ADD COLUMN request_type TEXT NOT NULL DEFAULT 'order' CHECK (request_type IN ('order', 'file_request'))");
        await db.run("ALTER TABLE orders ADD COLUMN email TEXT");
        await db.run(`CREATE TABLE order_attachments (
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
                AND extension IN ('pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'csv'${includeTxt ? ", 'txt'" : ""})
            ),
            size_bytes INTEGER NOT NULL CHECK (typeof(size_bytes) = 'integer' AND size_bytes BETWEEN 0 AND 15728640),
            sha256 TEXT NOT NULL CHECK (
                length(sha256) = 64
                AND sha256 = lower(sha256)
                AND sha256 NOT GLOB '*[^0-9a-f]*'
            ),
            created_at TEXT NOT NULL CHECK (length(trim(created_at)) BETWEEN 1 AND 64),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )`);
        await db.run("CREATE INDEX idx_order_attachments_order_id ON order_attachments(order_id)");
        await db.run(`INSERT INTO orders (
            id, order_number, customer_name, phone, request_type, email, items_json,
            total_price, total_weight, status, created_at, updated_at
        ) VALUES (41, 'V3-ORDER', 'V3 customer', '+70000000041', 'file_request',
            'v3@example.test', '[]', 0, 0, 'Новая', ?, ?)`, [createdAt, createdAt]);
        await db.run(`INSERT INTO order_attachments (
            id, order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
        ) VALUES (73, 41, 'preserved.pdf', ?, 'application/pdf', 'pdf', 17, ?, ?)`, [
            "7".repeat(64) + ".pdf",
            "a".repeat(64),
            createdAt
        ]);
        await db.run(`PRAGMA user_version=${version}`);
    } finally {
        await db.close();
    }
}

async function testV3ToCurrentMigration(root) {
    const file = path.join(root, "existing-v3.db");
    await createAttachmentFixture(file);
    const result = await migrateDatabase(file, { dryRun: false });
    assert.deepStrictEqual(
        { from: result.fromVersion, to: result.toVersion, changed: result.changed },
        { from: 3, to: CURRENT_SCHEMA_VERSION, changed: true }
    );
    const db = await openDatabase(file);
    try {
        await assertCurrentSchema(db);
        assert.deepStrictEqual(
            await db.get(`SELECT id, order_id, original_name, storage_key, mime_type, extension,
                size_bytes, sha256, created_at FROM order_attachments WHERE id=73`),
            {
                id: 73,
                order_id: 41,
                original_name: "preserved.pdf",
                storage_key: "7".repeat(64) + ".pdf",
                mime_type: "application/pdf",
                extension: "pdf",
                size_bytes: 17,
                sha256: "a".repeat(64),
                created_at: "2026-03-01T12:00:00.000Z"
            }
        );
        assert.strictEqual((await db.get("SELECT customer_name FROM orders WHERE id=41")).customer_name, "V3 customer");
        const repository = createOrderAttachmentRepository(db);
        const txt = await repository.createOrderAttachmentMetadata({
            orderId: 41,
            originalName: "notes.txt",
            storageKey: "8".repeat(64) + ".txt",
            mimeType: "text/plain",
            extension: "txt",
            sizeBytes: 12,
            sha256: "b".repeat(64),
            createdAt: "2026-03-02T12:00:00.000Z"
        });
        assert.strictEqual(txt.extension, "txt");
        for (const extension of ["pdf", "jpg", "jpeg", "png", "xls", "xlsx", "csv"]) {
            const id = extension.charCodeAt(0) + extension.length;
            await db.run(
                `INSERT INTO order_attachments (
                    order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
                ) VALUES (41, ?, ?, 'application/octet-stream', ?, 1, ?, ?)`,
                [`legacy.${extension}`, `${id}${"c".repeat(63)}.${extension}`.slice(-70), extension, "c".repeat(64), "2026-03-03T12:00:00.000Z"]
            );
        }
        await assert.rejects(
            db.run(`INSERT INTO order_attachments (
                order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
            ) VALUES (41, 'bad.exe', ?, 'application/octet-stream', 'exe', 1, ?, ?)` ,
            ["d".repeat(64) + ".exe", "d".repeat(64), "2026-03-03T12:00:00.000Z"]),
            error => String(error.code).startsWith("SQLITE_CONSTRAINT")
        );
        assert.strictEqual((await db.get("PRAGMA integrity_check")).integrity_check, "ok");
        assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
    } finally {
        await db.close();
    }
    const repeated = await migrateDatabase(file, { dryRun: false });
    assert.strictEqual(repeated.changed, false);
    assert.strictEqual(repeated.fromVersion, CURRENT_SCHEMA_VERSION);
}

async function testV4ToCurrentMigration(root) {
    const file = path.join(root, "existing-v4.db");
    await createAttachmentFixture(file, { version: 4, includeTxt: true });
    const beforeDb = await openDatabase(file);
    const beforeCount = Number((await beforeDb.get("SELECT COUNT(*) count FROM order_attachments")).count);
    const beforeRow = await beforeDb.get("SELECT * FROM order_attachments WHERE id=73");
    await beforeDb.close();

    const result = await migrateDatabase(file, { dryRun: false });
    assert.deepStrictEqual(
        { from: result.fromVersion, to: result.toVersion, changed: result.changed },
        { from: 4, to: CURRENT_SCHEMA_VERSION, changed: true }
    );
    const db = await openDatabase(file);
    try {
        await assertCurrentSchema(db);
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) count FROM order_attachments")).count), beforeCount);
        assert.deepStrictEqual(await db.get("SELECT * FROM order_attachments WHERE id=73"), beforeRow);
        const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "xls", "xlsx", "csv", "txt", "doc", "docx"];
        for (const [index, extension] of allowedExtensions.entries()) {
            await db.run(
                `INSERT INTO order_attachments (
                    order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
                ) VALUES (41, ?, ?, 'application/octet-stream', ?, 1, ?, ?)`,
                [
                    `allowed-${index}.${extension}`,
                    `${String(index).padStart(2, "0")}${"e".repeat(62)}.${extension}`,
                    extension,
                    "e".repeat(64),
                    "2026-03-04T12:00:00.000Z"
                ]
            );
        }
        await assert.rejects(
            db.run(`INSERT INTO order_attachments (
                order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
            ) VALUES (41, 'bad.exe', ?, 'application/octet-stream', 'exe', 1, ?, ?)`,
            ["f".repeat(64) + ".exe", "f".repeat(64), "2026-03-04T12:00:00.000Z"]),
            error => String(error.code).startsWith("SQLITE_CONSTRAINT")
        );
        assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
        assert.strictEqual((await db.get("PRAGMA integrity_check")).integrity_check, "ok");
    } finally {
        await db.close();
    }
    const repeated = await migrateDatabase(file, { dryRun: false });
    assert.strictEqual(repeated.changed, false);
    assert.strictEqual(repeated.fromVersion, CURRENT_SCHEMA_VERSION);
}

(async () => {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 9);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-file-request-migration-"));
    try {
        await testEmptyDatabase(root);
        await testV2Migration(root);
        await testV3ToCurrentMigration(root);
        await testV4ToCurrentMigration(root);
        await testLegacyColumnCopy(root);
        console.log(JSON.stringify({
            success: true,
            schema: "3/4->9",
            emptyDatabase: "ok",
            existingOrdersPreserved: "ok",
            explicitColumnOrderIndependent: "ok",
            legacyReorderedColumnCopy: "ok",
            attachmentMetadata: "ok",
            existingAttachmentsPreserved: "ok",
            attachmentIdsPreserved: "ok",
            txtExtension: "accepted",
            wordExtensions: "accepted",
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
