const assert = require("assert");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const webpush = require("web-push");
const { migrateDatabase, openDatabase } = require("../databaseMigrations");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(base, pathname, body) {
    const response = await fetch(`${base}${pathname}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { response, payload: await response.json().catch(() => ({})) };
}
async function waitForHealth(base, child) {
    for (let attempt = 0; attempt < 200; attempt += 1) {
        if (child.exitCode !== null) throw new Error(`server exited ${child.exitCode}`);
        try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
        await sleep(50);
    }
    throw new Error("server did not start");
}

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-one-click-"));
    const dbPath = path.join(root, "matmix.db"); const sessionPath = path.join(root, "sessions.db");
    const uploadsPath = path.join(root, "uploads"); const attachmentsPath = path.join(root, "attachments");
    await fs.promises.mkdir(uploadsPath); await fs.promises.mkdir(attachmentsPath);
    process.env.MATMIX_DB_PATH = dbPath;
    const database = require("../database");
    await database.initDatabase();
    await new Promise((resolve, reject) => database.db.close(error => error ? reject(error) : resolve()));
    await migrateDatabase(dbPath, { dryRun: false });
    const db = await openDatabase(dbPath); const now = new Date().toISOString();
    const product = await db.run("INSERT INTO products (external_id,title,price,weight,unit,is_active,sort_order,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)", ["ONECLICK-001", "One click product", 125.5, 2.5, "шт", 1, 1, "test", now, now]);
    const requestProduct = await db.run("INSERT INTO products (external_id,title,price,weight,unit,is_active,sort_order,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)", ["ONECLICK-002", "Price request product", null, 0, "шт", 1, 2, "test", now, now]);
    const inactive = await db.run("INSERT INTO products (external_id,title,price,weight,unit,is_active,sort_order,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)", ["ONECLICK-003", "Inactive product", 10, 1, "шт", 0, 3, "test", now, now]);
    const user = await db.run("INSERT INTO users (login,password_hash,role,name,created_at,updated_at,is_active) VALUES (?,?,?,?,?,?,1)", ["push-admin", await bcrypt.hash("push-admin-password", 4), "admin", "Push admin", now, now]);
    await db.run("INSERT INTO web_push_subscriptions (user_id,endpoint,p256dh,auth,created_at,updated_at) VALUES (?,?,?,?,?,?)", [user.id, "https://push.example.test/subscription", "p256dh", "auth", now, now]);
    await db.close();
    const port = 47000 + Math.floor(Math.random() * 1000); const base = `http://127.0.0.1:${port}`;
    const vapid = webpush.generateVAPIDKeys();
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { cwd: path.resolve(__dirname, "..", ".."), windowsHide: true, stdio: "ignore", env: { ...process.env, NODE_ENV: "test", PORT: String(port), SESSION_SECRET: "one-click-order-test-secret-12345678901234567890", MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: sessionPath, PRODUCT_UPLOADS_PATH: uploadsPath, ORDER_ATTACHMENTS_PATH: attachmentsPath, APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock"), PUBLIC_BASE_URL: base, SEO_ALLOW_INDEXING: "false", MATMIX_WEB_PUSH_ENABLED: "true", MATMIX_WEB_PUSH_VAPID_PUBLIC_KEY: vapid.publicKey, MATMIX_WEB_PUSH_VAPID_PRIVATE_KEY: vapid.privateKey, MATMIX_WEB_PUSH_VAPID_SUBJECT: "mailto:test@example.com", PUBLIC_ORDER_RATE_MAX: "30" } });
    try {
        await waitForHealth(base, child);
        const validBody = { productId: product.id, quantity: 2, customerName: "<script>Имя</script>", phone: "+7 (999) 555-12-34", comment: "<img>Комментарий", consent: true, formStartedAt: Date.now() - 1200, landingPath: "/product/ONECLICK-001" };
        const valid = await request(base, "/api/orders/one-click", validBody); assert.strictEqual(valid.response.status, 201, JSON.stringify(valid.payload));
        assert(valid.payload.orderNumber); assert.strictEqual(valid.payload.totalPrice, 251); assert.strictEqual(valid.payload.hasPriceOnRequest, false);
        const priceRequest = await request(base, "/api/orders/one-click", { ...validBody, productId: requestProduct.id, quantity: 1, customerName: "Price request", formStartedAt: Date.now() - 1200 }); assert.strictEqual(priceRequest.response.status, 201); assert.strictEqual(priceRequest.payload.hasPriceOnRequest, true);
        for (const [body, code] of [[{ ...validBody, productId: 999999, formStartedAt: Date.now() - 1200 }, "PRODUCT_NOT_FOUND"], [{ ...validBody, productId: inactive.id, formStartedAt: Date.now() - 1200 }, "PRODUCT_UNAVAILABLE"], [{ ...validBody, quantity: 0, formStartedAt: Date.now() - 1200 }, "INVALID_QUANTITY"], [{ ...validBody, phone: "123", formStartedAt: Date.now() - 1200 }, "INVALID_PHONE"], [{ ...validBody, consent: false, formStartedAt: Date.now() - 1200 }, "CONSENT_REQUIRED"], [{ ...validBody, website: "bot", formStartedAt: Date.now() - 1200 }, "HONEYPOT_REJECTED"], [{ ...validBody, formStartedAt: Date.now() }, "FORM_TOO_FAST"]]) { const result = await request(base, "/api/orders/one-click", body); assert.strictEqual(result.payload.code, code, JSON.stringify(result.payload)); }
        const after = await openDatabase(dbPath); const order = await after.get("SELECT * FROM orders WHERE id=?", [valid.payload.id]); const item = JSON.parse(order.items_json)[0]; assert.strictEqual(order.request_type, "order"); assert.strictEqual(order.consent_given, 1); assert.strictEqual(item.price, 125.5); assert.strictEqual(item.title, "One click product"); assert(order.comment.includes("<img>"));
        const event = await after.get("SELECT message FROM order_events WHERE order_id=? AND event_type='created'", [order.id]); assert(event.message.includes("Заявка в 1 клик создана со страницы товара /product/ONECLICK-001"));
        assert.strictEqual(Number((await after.get("SELECT COUNT(*) AS count FROM order_email_outbox WHERE order_id=?", [order.id])).count), 1); assert.strictEqual(Number((await after.get("SELECT COUNT(*) AS count FROM web_push_outbox WHERE order_id=?", [order.id])).count), 1);
        const visible = await after.get("SELECT id FROM orders WHERE id=? AND request_type='order'", [order.id]); assert(visible); await after.close();
        let limited = null; for (let index = 0; index < 30; index += 1) limited = await request(base, "/api/orders/one-click", { ...validBody, formStartedAt: Date.now() - 1200 }); assert.strictEqual(limited.response.status, 429); assert.strictEqual(limited.payload.code, "PUBLIC_ORDER_RATE_LIMITED");
        console.log(JSON.stringify({ success: true, endpoint: true, serverPricing: true, priceOnRequest: true, validation: true, consent: true, honeypot: true, formAge: true, orderNumber: true, emailOutbox: true, webPushOutbox: true, crmVisible: true, rateLimit: true }));
    } finally { child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
