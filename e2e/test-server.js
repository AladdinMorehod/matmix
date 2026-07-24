const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const root = path.resolve(__dirname, "..");
const runtime = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-e2e-"));
const dbPath = path.join(runtime, "matmix.db");
process.env.MATMIX_DB_PATH = dbPath;
function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, error => error ? reject(error) : resolve())); }
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

    await run(
        db,
        `INSERT INTO catalog_structure (
            type, name, normalized_name, external_code, parent_id,
            sort_order, is_active, is_system, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, 1, 1, 0, ?, ?)`,
        ["category", "Сухие смеси", "сухие смеси", "DRY-MIXES", now, now]
    );

    await run(
        db,
        `INSERT INTO products (
            external_id, title, slug, category, subcategory,
            product_group, price, weight, unit, description,
            is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
        [
            "MAT-E2E-001",
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

    await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["e2e_admin", await bcrypt.hash("E2eAdmin!234", 10), "admin", "E2E Admin", now, now]);
    await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["e2e_manager", await bcrypt.hash("E2eManager!234", 10), "manager", "E2E Manager", now, now]);
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
    child = spawn(process.execPath, [path.join(root, "backend", "server.js")], { cwd: root, windowsHide: true, stdio: ["inherit", "inherit", "inherit", "ipc"], env: { ...process.env, NODE_ENV: "test", PORT: "4173", SESSION_SECRET: "e2e-only-secret-not-for-production-1234567890", MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(runtime, "sessions.db"), PRODUCT_UPLOADS_PATH: path.join(runtime, "uploads"), ORDER_ATTACHMENTS_PATH: path.join(runtime, "order-attachments"), BACKUP_ROOT_PATH: path.join(runtime, "backups"), APP_RUNTIME_LOCK_PATH: path.join(runtime, "runtime.lock"), PUBLIC_BASE_URL: "http://127.0.0.1:4173", SEO_ALLOW_INDEXING: "true", LOGIN_RATE_MAX: "3", LOGIN_RATE_WINDOW_MS: "60000", FILE_REQUEST_RATE_MAX: "1000" } });
    child.once("exit", code => { cleanup(code || 0).catch(error => { console.error(error); process.exitCode = 1; }); });
}).catch(error => { console.error(error); cleanup(1).catch(cleanupError => { console.error(cleanupError); process.exitCode = 1; }); });
process.once("SIGTERM", () => { cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
process.once("SIGINT", () => { cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
process.on("message", message => { if (message === "shutdown") cleanup(0).catch(error => { console.error(error); process.exitCode = 1; }); });
