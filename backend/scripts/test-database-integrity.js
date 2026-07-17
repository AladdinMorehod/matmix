const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { migrateDatabase, openDatabase } = require("../databaseMigrations");
const { configureBusinessConnection } = require("../sqlite");

function connection(file) {
    const raw = new sqlite3.Database(file);
    const ready = configureBusinessConnection(raw);
    return {
        async run(sql, params = []) { await ready; return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID }); })); },
        close() { return new Promise(resolve => raw.close(() => resolve())); }
    };
}

async function concurrentOrder(file, suffix) {
    const db = connection(file);
    const now = new Date().toISOString();
    try {
        await db.run("BEGIN IMMEDIATE");
        const client = await db.run("INSERT INTO clients(name,phone,created_at,updated_at) VALUES(?,?,?,?)", [`Concurrency ${suffix}`, `+7000000${suffix}`, now, now]);
        const order = await db.run(`INSERT INTO orders(customer_name,phone,client_id,items_json,total_price,total_weight,status,created_at,updated_at)
            VALUES(?,?,?,'[]',0,0,'Новая',?,?)`, [`Concurrency ${suffix}`, `+7000000${suffix}`, client.id, now, now]);
        await db.run("UPDATE orders SET order_number=? WHERE id=?", [`TEST-${suffix}-${order.id}`, order.id]);
        await db.run("INSERT INTO order_events(order_id,event_type,message,created_at) VALUES(?,'created','test',?)", [order.id, now]);
        await db.run("COMMIT");
        return order.id;
    } catch (error) { await db.run("ROLLBACK").catch(() => {}); throw error; } finally { await db.close(); }
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-integrity-"));
    const file = path.join(root, "matmix.db");
    process.env.MATMIX_DB_PATH = file;

    const { initDatabase, db: initializationDb } = require("../database");
    await initDatabase();
    await new Promise((resolve, reject) => {
        initializationDb.close(error => error ? reject(error) : resolve());
    });

    await migrateDatabase(file, { dryRun: false });
    const ids = await Promise.all([concurrentOrder(file, "A"), concurrentOrder(file, "B")]);
    assert.strictEqual(new Set(ids).size, 2);
    const db = await openDatabase(file);
    assert.strictEqual((await db.get("PRAGMA integrity_check")).integrity_check, "ok");
    assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
    const before = Number((await db.get("SELECT COUNT(*) n FROM order_events WHERE order_id=?", [ids[0]])).n);
    assert(before > 0);
    await db.run("DELETE FROM orders WHERE id=?", [ids[0]]);
    assert.strictEqual(Number((await db.get("SELECT COUNT(*) n FROM order_events WHERE order_id=?", [ids[0]])).n), 0);
    let rejected = false;
    try { await db.run("INSERT INTO order_events(order_id,event_type,message) VALUES(-1,'test','orphan')"); } catch (error) { rejected = String(error.code).startsWith("SQLITE_CONSTRAINT"); }
    assert(rejected);
    await db.close();
    console.log(JSON.stringify({ success: true, concurrentOrders: 2, integrity: "ok", foreignKeys: "ok", cascade: "ok", orphanRejected: true }));
})().catch(error => { console.error(error); process.exitCode = 1; });
