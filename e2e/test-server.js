const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const root = path.resolve(__dirname, "..");
const runtime = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-e2e-"));
const dbPath = path.join(runtime, "matmix.db");
const orderAttachmentsPath = path.join(runtime, "order-attachments");
process.env.MATMIX_DB_PATH = dbPath;
process.env.ORDER_ATTACHMENTS_PATH = orderAttachmentsPath;
function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
async function prepare() {
    const { initDatabase, db: initializationDb } = require("../backend/database");
    const { migrateDatabase } = require("../backend/databaseMigrations");
    await initDatabase();
    await new Promise((resolve, reject) => initializationDb.close(error => error ? reject(error) : resolve()));
    await migrateDatabase(dbPath, { dryRun: false });

    const db = open(dbPath);
    const now = new Date().toISOString();

    await run(db, "PRAGMA foreign_keys=ON");
    await run(db, "DELETE FROM order_events");
    await run(db, "DELETE FROM orders");
    await run(db, "DELETE FROM clients");
    await run(db, "DELETE FROM users");
    await run(db, "DELETE FROM products");
    await run(db, "DELETE FROM catalog_structure");

    const category = await run(
        db,
        `INSERT INTO catalog_structure (
            type, name, normalized_name, external_code, parent_id,
            sort_order, is_active, is_system, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, 1, 1, 0, ?, ?)`,
        ["category", "Сухие смеси", "сухие смеси", "CAT-000001", now, now]
    );
    await run(
        db,
        `INSERT INTO catalog_structure (
            type, name, normalized_name, external_code, parent_id,
            sort_order, is_active, is_system, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 1, 1, 0, ?, ?)`,
        ["subcategory", "Штукатурки", "штукатурки", "SUB-000001", category.id, now, now]
    );
    const otherCategory = await run(
        db,
        `INSERT INTO catalog_structure (
            type, name, normalized_name, external_code, parent_id,
            sort_order, is_active, is_system, created_at, updated_at
        ) VALUES ('category', 'Другие материалы', 'другие материалы', 'CAT-000002', NULL, 2, 1, 0, ?, ?)`,
        [now, now]
    );
    await run(
        db,
        `INSERT INTO catalog_structure (
            type, name, normalized_name, external_code, parent_id,
            sort_order, is_active, is_system, created_at, updated_at
        ) VALUES ('subcategory', 'Клеи', 'клеи', 'SUB-000002', ?, 1, 1, 0, ?, ?)`,
        [otherCategory.id, now, now]
    );

    await run(
        db,
        `INSERT INTO products (
            external_id, title, slug, category, subcategory,
            product_group, price, weight, unit, description,
            is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [
            "MAT-000001",
            "Ротбанд тестовый",
            "rotband-test",
            "Сухие смеси",
            "Штукатурки",
            "Гипсовые штукатурки",
            750,
            30,
            "мешок",
            "Тестовый товар для E2E",
            now,
            now
        ]
    );
    for (const [externalId, title, slug, group, sortOrder] of [
        ["MAT-000002", "Волма тестовая", "volma-test", "Гипсовые смеси", 2],
        ["MAT-000003", "Церезит тестовый", "ceresit-test", "Готовые", 3]
    ]) {
        await run(
            db,
            `INSERT INTO products (
                external_id, title, slug, category, subcategory,
                product_group, price, weight, unit, description,
                is_active, sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, 'Сухие смеси', 'Штукатурки', ?, 500, 25, 'мешок', '', 1, ?, ?, ?)`,
            [externalId, title, slug, group, sortOrder, now, now]
        );
    }
    await run(db, `
        CREATE TRIGGER e2e_bulk_product_structure_failure
        BEFORE UPDATE OF product_group ON products
        WHEN NEW.product_group = '__E2E_FORCE_ROLLBACK__' AND OLD.external_id = 'MAT-000002'
        BEGIN
            SELECT RAISE(ABORT, 'forced bulk rollback');
        END
    `);

    await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["e2e_admin", await bcrypt.hash("E2eAdmin!234", 10), "admin", "E2E Admin", now, now]);
    await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["e2e_manager", await bcrypt.hash("E2eManager!234", 10), "manager", "E2E Manager", now, now]);
    await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["admin", await bcrypt.hash("E2eChiefAdmin!234", 10), "admin", "E2E Chief Admin", now, now]);
    const admin = await get(db, "SELECT id FROM users WHERE login = ?", ["e2e_admin"]);
    const ordinaryOrder = await run(
        db,
        `INSERT INTO orders (
            order_number, customer_name, phone, email, request_type, items_json,
            total_price, total_weight, status, manager_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'order', ?, ?, ?, ?, ?, ?, ?)`,
        ["E2E-ORDINARY", "Обычный E2E клиент", "+7 900 100-00-01", "ordinary@example.test",
            JSON.stringify([{ name: "Обычный товар", qty: 1, unit: "шт", lineWeight: 1, lineTotal: 100 }]),
            100, 1, "Новая", admin.id, now, now]
    );
    const fileOrder = await run(
        db,
        `INSERT INTO orders (
            order_number, customer_name, phone, email, request_type, items_json,
            total_price, total_weight, status, manager_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'file_request', '[]', 0, 0, ?, ?, ?, ?)`,
        ["E2E-FILES", "Клиент с файлами", "+7 900 100-00-02", "files@example.test",
            "Новая", admin.id, now, now]
    );
    fs.mkdirSync(orderAttachmentsPath, { recursive: true });
    const attachments = [
        { name: "Смета проекта.xlsx", key: "e2e-estimate.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx", content: Buffer.from("E2E estimate content") },
        { name: "План помещения.pdf", key: "e2e-plan.pdf", type: "application/pdf", extension: "pdf", content: Buffer.from("%PDF-1.4 E2E plan") },
        { name: "Комментарий.txt", key: "e2e-comment.txt", type: "text/plain", extension: "txt", content: Buffer.from("E2E TXT русский текст\r\n", "utf8") }
    ];
    for (const attachment of attachments) {
        fs.writeFileSync(path.join(orderAttachmentsPath, attachment.key), attachment.content);
        const sha256 = require("crypto").createHash("sha256").update(attachment.content).digest("hex");
        await run(
            db,
            `INSERT INTO order_attachments (
                order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fileOrder.id, attachment.name, attachment.key, attachment.type, attachment.extension, attachment.content.length, sha256, now]
        );
    }
    await run(
        db,
        "INSERT INTO order_events(order_id,user_id,user_name,event_type,message,created_at) VALUES(?,?,?,?,?,?)",
        [ordinaryOrder.id, admin.id, "E2E Admin", "created", "Обычная заявка создана", now]
    );
    await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
    const sourceUploads = path.join(root, "public", "uploads", "products");
    if (fs.existsSync(sourceUploads)) fs.cpSync(sourceUploads, path.join(runtime, "uploads"), { recursive: true }); else fs.mkdirSync(path.join(runtime, "uploads"), { recursive: true });
    fs.mkdirSync(path.join(runtime, "backups"), { recursive: true });
}
let child;
let cleanupPromise;
function cleanup(code = 0) {
    if (cleanupPromise) return cleanupPromise;
    cleanupPromise = (async () => {
        if (child && child.exitCode === null && child.signalCode === null) {
            const childExited = new Promise(resolve => child.once("exit", resolve));
            if (child.connected) child.send("shutdown");
            else child.kill("SIGTERM");
            await childExited;
        }
        fs.rmSync(runtime, { recursive: true, force: true });
        if (process.connected) process.disconnect();
        process.exitCode = code;
    })();
    return cleanupPromise;
}
prepare().then(() => {
    child = spawn(process.execPath, [path.join(root, "backend", "server.js")], { cwd: root, windowsHide: true, stdio: ["inherit", "inherit", "inherit", "ipc"], env: { ...process.env, NODE_ENV: "test", PORT: "4173", SESSION_SECRET: "e2e-only-secret-not-for-production-1234567890", MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(runtime, "sessions.db"), PRODUCT_UPLOADS_PATH: path.join(runtime, "uploads"), ORDER_ATTACHMENTS_PATH: orderAttachmentsPath, BACKUP_ROOT_PATH: path.join(runtime, "backups"), APP_RUNTIME_LOCK_PATH: path.join(runtime, "runtime.lock"), PUBLIC_BASE_URL: "http://127.0.0.1:4173", SEO_ALLOW_INDEXING: "true", LOGIN_RATE_MAX: "10", LOGIN_RATE_WINDOW_MS: "60000", FILE_REQUEST_RATE_MAX: "1000" } });
    child.once("exit", code => { cleanup(code || 0).catch(error => { console.error(error); process.exitCode = 1; }); });
}).catch(error => { console.error(error); cleanup(1).catch(cleanupError => { console.error(cleanupError); process.exitCode = 1; }); });
process.once("SIGTERM", () => { cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
process.once("SIGINT", () => { cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
process.on("message", message => { if (message === "shutdown") cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
