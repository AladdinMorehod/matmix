const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("../sqlite");
const { ensureWebPushSchema, createWebPushRepository, loadWebPushConfig, isEnabled } = require("../services/webPush");
const { processWebPushOutbox } = require("../services/webPushWorker");

function helpers(db) {
    return {
        run(sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        close() { return new Promise(resolve => db.close(() => resolve())); }
    };
}

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-web-push-"));
    const databasePath = path.join(root, "push.db");
    const raw = new sqlite3.Database(databasePath); await configureBusinessConnection(raw); const db = helpers(raw);
    try {
        await db.run("CREATE TABLE users(id INTEGER PRIMARY KEY, role TEXT, is_active INTEGER, deleted_at TEXT)");
        await db.run("CREATE TABLE orders(id INTEGER PRIMARY KEY, order_number TEXT, total_price REAL, status TEXT, manager_id INTEGER, deleted_at TEXT)");
        await db.run("CREATE TABLE order_notification_reads(user_id INTEGER, order_id INTEGER, read_at TEXT, PRIMARY KEY(user_id, order_id))");
        await ensureWebPushSchema(db);
        await db.run("INSERT INTO users VALUES (1,'admin',1,NULL),(2,'manager',1,NULL),(3,'manager',0,NULL),(4,'viewer',1,NULL),(5,'admin',1,'2026-01-01T00:00:00.000Z')");
        await db.run("INSERT INTO orders VALUES (10,'MM-10',18450,'Новая',NULL,NULL),(11,'MM-11',100,'Новая',1,NULL)");
        await db.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES (1,'https://push.test/a','key-a','auth-a',1,datetime('now'),datetime('now'))");
        await db.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES (2,'https://push.test/b','key-b','auth-b',1,datetime('now'),datetime('now'))");
        await db.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES (3,'https://push.test/c','key-c','auth-c',1,datetime('now'),datetime('now'))");
        await db.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES (4,'https://push.test/d','key-d','auth-d',1,datetime('now'),datetime('now'))");
        await db.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES (5,'https://push.test/e','key-e','auth-e',1,datetime('now'),datetime('now'))");
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) AS count FROM users WHERE role IN ('admin','manager') AND is_active=1 AND deleted_at IS NULL")).count), 2);
        const count = await createWebPushRepository(db).enqueueForOrder(10, new Date().toISOString());
        assert.strictEqual(count, 2);
        await db.run("UPDATE web_push_outbox SET next_attempt_at='2000-01-01T00:00:00.000Z'");
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) count FROM web_push_outbox")).count), 2);
        await db.close();
        const workerDb = new sqlite3.Database(databasePath); await configureBusinessConnection(workerDb); const verifyDb = helpers(workerDb);
        assert.strictEqual(Number((await verifyDb.get("SELECT COUNT(*) count FROM web_push_outbox")).count), 2);
        assert.strictEqual(Number((await verifyDb.get("SELECT COUNT(*) count FROM orders")).count), 2);
        await verifyDb.close();
        const sent = [];
        const summary = await processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: { setVapidDetails() {}, async sendNotification(subscription, payload) { sent.push({ subscription, payload: JSON.parse(payload) }); } } });
        assert.strictEqual(summary.sent, 2); assert(sent.every(item => !JSON.stringify(item.payload).includes("phone")));
        assert.strictEqual(sent.find(item => item.subscription.endpoint.endsWith("/a")).payload.unreadCount, 2);
        assert.strictEqual(sent.find(item => item.subscription.endpoint.endsWith("/b")).payload.unreadCount, 1);
        assert.strictEqual(sent.find(item => item.subscription.endpoint.endsWith("/a")).payload.body, "Новый заказ на 18450 ₽");
        const checkDb = new sqlite3.Database(databasePath); await configureBusinessConnection(checkDb); const check = helpers(checkDb);
        await check.run("INSERT INTO orders VALUES (14,'MM-14',100,'Новая',NULL,NULL),(15,'MM-15',100,'Новая',NULL,NULL),(16,'MM-16',100,'Новая',NULL,NULL)");
        for (const [eventKey, orderId, subscriptionId] of [["invalid:14:3", 14, 3], ["invalid:15:4", 15, 4], ["invalid:16:5", 16, 5]]) {
            await check.run("INSERT INTO web_push_outbox(event_key,order_id,subscription_id,next_attempt_at,created_at,updated_at) VALUES (?,?,?,'2000-01-01T00:00:00.000Z',datetime('now'),datetime('now'))", [eventKey, orderId, subscriptionId]);
        }
        const invalidRecipients = await processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: { setVapidDetails() {}, async sendNotification() { throw new Error("must not send"); } } });
        assert.strictEqual(invalidRecipients.sent, 0);
        assert.strictEqual(Number((await check.get("SELECT COUNT(*) count FROM web_push_outbox WHERE status='failed' AND event_key LIKE 'invalid:%'")).count), 3);
        await check.run("INSERT INTO web_push_outbox(event_key,order_id,subscription_id,next_attempt_at,created_at,updated_at) VALUES ('new_order:11:1',11,1,'2000-01-01T00:00:00.000Z',datetime('now'),datetime('now'))");
        const disabled = await processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: { setVapidDetails() {}, async sendNotification() { const error = new Error("gone"); error.statusCode = 410; throw error; } } });
        assert.strictEqual(disabled.disabled, 1);
        assert.strictEqual(Number((await check.get("SELECT is_active FROM web_push_subscriptions WHERE id=1")).is_active), 0);
        await check.run("INSERT INTO orders VALUES (12,'MM-12',100,'Новая',NULL,NULL)");
        await check.run("INSERT INTO web_push_outbox(event_key,order_id,subscription_id,next_attempt_at,created_at,updated_at) VALUES ('stale:12:2',12,2,'2000-01-01T00:00:00.000Z',datetime('now'),datetime('now'))");
        await check.run("UPDATE web_push_outbox SET status='processing', attempt_count=1, updated_at='2000-01-01T00:00:00.000Z' WHERE event_key='stale:12:2'");
        const concurrentPush = { setVapidDetails() {}, async sendNotification() { await new Promise(resolve => setTimeout(resolve, 20)); } };
        const concurrent = await Promise.all([
            processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: concurrentPush }),
            processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: concurrentPush })
        ]);
        assert.strictEqual(concurrent.reduce((sum, item) => sum + item.sent, 0), 1);
        assert.strictEqual((await check.get("SELECT status FROM web_push_outbox WHERE event_key='stale:12:2'")).status, "sent");
        await check.run("INSERT INTO orders VALUES (13,'MM-13',100,'Новая',NULL,NULL)");
        await check.run("INSERT INTO web_push_outbox(event_key,order_id,subscription_id,status,attempt_count,next_attempt_at,created_at,updated_at) VALUES ('max:13:2',13,2,'processing',5,'2000-01-01T00:00:00.000Z',datetime('now'),'2000-01-01T00:00:00.000Z')");
        const maxed = await processWebPushOutbox({ databasePath, config: { enabled: true, subject: "mailto:test@example.test", publicKey: "public", privateKey: "private" }, push: concurrentPush });
        assert.strictEqual(maxed.sent, 0);
        assert.strictEqual((await check.get("SELECT status FROM web_push_outbox WHERE event_key='max:13:2'")).status, "failed");
        assert.strictEqual(loadWebPushConfig({ MATMIX_WEB_PUSH_ENABLED: "false" }).enabled, false);
        assert.strictEqual(isEnabled({ MATMIX_WEB_PUSH_ENABLED: " true " }), true);
        assert.strictEqual(isEnabled({ MATMIX_WEB_PUSH_ENABLED: "TRUE" }), true);
        assert.strictEqual(isEnabled({ MATMIX_WEB_PUSH_ENABLED: " false " }), false);
        assert.throws(() => loadWebPushConfig({ MATMIX_WEB_PUSH_ENABLED: "true", MATMIX_WEB_PUSH_VAPID_PUBLIC_KEY: "p", MATMIX_WEB_PUSH_VAPID_PRIVATE_KEY: "k", MATMIX_WEB_PUSH_VAPID_SUBJECT: "http://invalid.example" }), /https URL or mailto/);
        assert.throws(() => loadWebPushConfig({ MATMIX_WEB_PUSH_ENABLED: "true" }), /VAPID/);
        console.log(JSON.stringify({ success: true, schema: "web-push-v1", ownership: true, roleFiltering: true, idempotentOutbox: true, send: true, payloadPrivacy: true, featureFlag: true }));
        await check.close();
    } finally { /* closed above after setup */ }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
