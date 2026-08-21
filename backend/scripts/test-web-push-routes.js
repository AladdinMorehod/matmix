const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function cookie(response) { return response.headers.get("set-cookie")?.split(";")[0] || ""; }
async function waitFor(url) { for (let i = 0; i < 120; i += 1) { try { if ((await fetch(url)).ok) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Push route test server did not start."); }
async function request(base, pathname, { method = "GET", auth = "", body, origin } = {}) {
    const response = await fetch(`${base}${pathname}`, { method, headers: { ...(auth ? { Cookie: auth } : {}), ...(origin ? { Origin: origin } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { response, payload: await response.json() };
}

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-web-push-routes-"));
    const dbPath = path.join(root, "matmix.db"); const sessionPath = path.join(root, "sessions.db"); const port = 4187; const base = `http://127.0.0.1:${port}`;
    const env = { ...process.env, NODE_ENV: "test", HOST: "127.0.0.1", PORT: String(port), MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: sessionPath, MATMIX_WEB_PUSH_ENABLED: "true", MATMIX_WEB_PUSH_VAPID_PUBLIC_KEY: "public-test-key", MATMIX_WEB_PUSH_VAPID_PRIVATE_KEY: "private-test-key", MATMIX_WEB_PUSH_VAPID_SUBJECT: "mailto:test@example.test" };
    process.env.MATMIX_DB_PATH = dbPath; process.env.SESSION_DB_PATH = sessionPath;
    const { initDatabase, db: initDb } = require("../database"); await initDatabase(); await new Promise((resolve, reject) => initDb.close(error => error ? reject(error) : resolve()));
    const db = new sqlite3.Database(dbPath); const now = new Date().toISOString(); const password = "PushManager!234";
    const manager = await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["push_manager", await bcrypt.hash(password, 4), "manager", "Push Manager", now, now]);
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { cwd: path.resolve(__dirname, "..", ".."), env, stdio: "ignore" });
    try {
        await waitFor(`${base}/health`);
        let result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", body: { endpoint: "https://push.test/unauth", keys: { p256dh: "a", auth: "b" } } });
        assert.strictEqual(result.response.status, 401);
        result = await request(base, "/api/auth/login", { method: "POST", body: { login: "admin", password: "admin123" } }); const adminCookie = cookie(result.response); assert.strictEqual(result.response.status, 200);
        result = await request(base, "/api/order-notifications/push/config", { auth: adminCookie }); assert.strictEqual(result.response.status, 200); assert.strictEqual(result.payload.publicKey, "public-test-key"); assert(!JSON.stringify(result.payload).includes("private"));
        const subscription = { endpoint: "https://push.test/shared", keys: { p256dh: "key-a", auth: "auth-a" } };
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", auth: adminCookie, body: subscription }); assert.strictEqual(result.response.status, 200);
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", auth: adminCookie, body: subscription }); assert.strictEqual(result.response.status, 200);
        result = await request(base, "/api/auth/login", { method: "POST", body: { login: "push_manager", password } }); const managerCookie = cookie(result.response); assert.strictEqual(result.response.status, 200);
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", auth: managerCookie, body: subscription }); assert.strictEqual(result.response.status, 409);
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", auth: managerCookie, body: { endpoint: "https://push.test/manager", keys: { p256dh: "key-m", auth: "auth-m" } } }); assert.strictEqual(result.response.status, 200);
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "DELETE", auth: managerCookie, body: subscription }); assert.strictEqual(result.response.status, 200);
        const owner = await get(db, "SELECT user_id,is_active FROM web_push_subscriptions WHERE endpoint=?", [subscription.endpoint]); assert.strictEqual(Number(owner.user_id), 1); assert.strictEqual(Number(owner.is_active), 1);
        result = await request(base, "/api/order-notifications/push/subscriptions", { method: "POST", auth: managerCookie, origin: "https://evil.invalid", body: { endpoint: "https://push.test/evil", keys: { p256dh: "key", auth: "auth" } } }); assert.strictEqual(result.response.status, 403);
        console.log(JSON.stringify({ success: true, authentication: true, roleAccess: true, configPrivacy: true, idempotentOwnership: true, collisionFailClosed: true, foreignDeleteBlocked: true, originBlocked: true }));
    } finally { await new Promise(resolve => db.close(resolve)); child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
