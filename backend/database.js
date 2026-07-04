const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

const databaseDir = path.join(__dirname, "database");
const databasePath = path.join(databaseDir, "matmix.db");

fs.mkdirSync(databaseDir, { recursive: true });

const db = new sqlite3.Database(databasePath);

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(error) {
            if (error) {
                reject(error);
                return;
            }

            resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(rows);
        });
    });
}

async function initDatabase() {
    await run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            telegram TEXT,
            max_contact TEXT,
            address TEXT,
            unloading TEXT,
            payment_method TEXT,
            comment TEXT,
            items_json TEXT NOT NULL,
            total_price REAL DEFAULT 0,
            total_weight REAL DEFAULT 0,
            status TEXT DEFAULT 'Новая',
            created_at TEXT,
            updated_at TEXT
        )
    `);

    await ensureColumn("orders", "manager_id", "INTEGER");
    await ensureColumn("orders", "taken_at", "TEXT");
    await ensureColumn("orders", "closed_at", "TEXT");
    await ensureColumn("orders", "deleted_at", "TEXT");
    await ensureColumn("orders", "preferred_contact_method", "TEXT");
    await ensureColumn("orders", "preferred_contact_value", "TEXT");
    await ensureColumn("orders", "client_id", "INTEGER");

    await run(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            preferred_contact_method TEXT,
            preferred_contact_value TEXT,
            email TEXT,
            telegram TEXT,
            max_contact TEXT,
            whatsapp TEXT,
            orders_count INTEGER DEFAULT 0,
            total_spent REAL DEFAULT 0,
            last_order_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS order_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            user_id INTEGER,
            user_name TEXT,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        )
    `);

    const admin = await get("SELECT id FROM users WHERE login = ?", ["admin"]);
    if (!admin) {
        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash("admin123", 10);

        await run(
            `INSERT INTO users (login, password_hash, role, name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["admin", passwordHash, "admin", "Администратор", now, now]
        );

        console.warn("Default admin created: login admin / password admin123. Change password before production.");
    }
}

async function ensureColumn(tableName, columnName, columnDefinition) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    const exists = columns.some(column => column.name === columnName);

    if (!exists) {
        await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

module.exports = {
    db,
    run,
    get,
    all,
    initDatabase
};
