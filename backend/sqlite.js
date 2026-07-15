const sqlite3 = require("sqlite3").verbose();

const BUSY_TIMEOUT_MS = 5000;

function exec(db, sql) {
    return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve()));
}

function get(db, sql, params = []) {
    return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

async function configureBusinessConnection(db, { readOnly = false } = {}) {
    db.configure("busyTimeout", BUSY_TIMEOUT_MS);
    await exec(db, `PRAGMA busy_timeout=${BUSY_TIMEOUT_MS}; PRAGMA foreign_keys=ON;`);
    if (!readOnly) await exec(db, "PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;");
    const row = await get(db, "PRAGMA foreign_keys");
    if (Number(row?.foreign_keys) !== 1) throw new Error("SQLite foreign key enforcement could not be enabled.");
    return db;
}

function sqliteApiError(error) {
    const code = String(error?.code || "");
    if (code === "SQLITE_BUSY" || code === "SQLITE_LOCKED") {
        return { status: 503, code: "DATABASE_BUSY", message: "База данных временно занята. Повторите запрос позже." };
    }
    if (code.startsWith("SQLITE_CONSTRAINT")) {
        return { status: 409, code: "DATABASE_CONFLICT", message: "Изменение конфликтует с актуальными данными." };
    }
    return { status: 500, code: "DATABASE_ERROR", message: "Не удалось выполнить операцию с базой данных." };
}

module.exports = { BUSY_TIMEOUT_MS, configureBusinessConnection, sqliteApiError };
