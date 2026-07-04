const fs = require("fs");
const path = require("path");
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
}

module.exports = {
    db,
    run,
    get,
    all,
    initDatabase
};
