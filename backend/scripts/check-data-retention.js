const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(process.env.MATMIX_DB_PATH || path.join(__dirname, "..", "database", "matmix.db"));
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
const get = sql => new Promise((resolve, reject) => db.get(sql, (error, row) => error ? reject(error) : resolve(row)));
const days = name => { const value = Number.parseInt(process.env[name], 10); return Number.isInteger(value) && value > 0 ? value : null; };
(async () => {
    const orderDays = days("ORDER_DATA_RETENTION"); const customerDays = days("CUSTOMER_DATA_RETENTION");
    const report = {
        readOnly: true,
        configured: { customer: process.env.CUSTOMER_DATA_RETENTION || "[НЕ ЗАДАНО]", order: process.env.ORDER_DATA_RETENTION || "[НЕ ЗАДАНО]", logs: process.env.LOG_RETENTION || "[НЕ ЗАДАНО]", backups: process.env.BACKUP_RETENTION || "[НЕ ЗАДАНО]" },
        orders: await get(`SELECT COUNT(*) total, MIN(created_at) oldest, MAX(created_at) newest${orderDays ? `, SUM(CASE WHEN created_at < datetime('now','-${orderDays} days') THEN 1 ELSE 0 END) older_than_policy` : ""} FROM orders`),
        clients: await get(`SELECT COUNT(*) total, MIN(created_at) oldest, MAX(created_at) newest${customerDays ? `, SUM(CASE WHEN created_at < datetime('now','-${customerDays} days') THEN 1 ELSE 0 END) older_than_policy` : ""} FROM clients`)
    };
    console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.close());
