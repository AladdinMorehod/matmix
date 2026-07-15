const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const { migrateDatabase } = require("../databaseMigrations");
const { readiness, legalConfig, documentDefinitions, REQUIRED_ENV } = require("../services/legal");

function dbGet(file, sql, params = []) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY); db.get(sql, params, (e, row) => db.close(() => e ? reject(e) : resolve(row))); }); }
async function wait(url) { for (let i = 0; i < 80; i += 1) { try { if ((await fetch(url)).status) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Legal test server did not start"); }
function cookie(response) { return response.headers.getSetCookie?.()[0]?.split(";")[0] || response.headers.get("set-cookie")?.split(";")[0] || ""; }
(async () => {
    assert.strictEqual(readiness({}).ready, false);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-legal-")); const dbPath = path.join(root, "matmix.db"); fs.copyFileSync(path.join(__dirname, "..", "database", "matmix.db"), dbPath); fs.mkdirSync(path.join(root, "uploads")); await migrateDatabase(dbPath, { dryRun: false });
    const env = Object.fromEntries(REQUIRED_ENV.map(name => [name, "Approved test value"])); Object.assign(env, { LEGAL_BUSINESS_NAME: "Test & <Company>", PUBLIC_PHONE: "+7 900 000-00-00", PUBLIC_EMAIL: "legal@example.test", PRIVACY_POLICY_VERSION: "test-privacy-v1", TERMS_VERSION: "test-terms-v2", CUSTOMER_DATA_RETENTION: "365", ORDER_DATA_RETENTION: "730", LOG_RETENTION: "30", BACKUP_RETENTION: "14" });
    assert.strictEqual(readiness(env).ready, true); const definitions = documentDefinitions(legalConfig(env)); assert(definitions["/contacts"].sections.flat().join(" ").includes("Test & <Company>"));
    const product = await dbGet(dbPath, "SELECT id,price FROM products WHERE is_active=1 AND deleted_at IS NULL AND price IS NOT NULL ORDER BY id LIMIT 1"); const before = await dbGet(dbPath, "SELECT (SELECT COUNT(*) FROM orders) orders,(SELECT COUNT(*) FROM clients) clients,(SELECT COUNT(*) FROM order_events) events"); const oldOrder = await dbGet(dbPath, "SELECT id FROM orders ORDER BY id LIMIT 1");
    const port = 44000 + Math.floor(Math.random() * 800); const base = `http://127.0.0.1:${port}`; const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { cwd: path.join(__dirname, "..", ".."), windowsHide: true, stdio: "ignore", env: { ...process.env, ...env, NODE_ENV: "test", PORT: String(port), MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(root, "sessions.db"), PRODUCT_UPLOADS_PATH: path.join(root, "uploads"), APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock"), PUBLIC_BASE_URL: base, SEO_ALLOW_INDEXING: "true" } });
    try {
        await wait(`${base}/privacy`); const payload = { customerName: "Consent Test", phone: "+7 (900) 111-22-33", address: "Test", items: [{ productId: product.id, qty: 1, price: 0.01 }] };
        let response = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); let body = await response.json(); assert.strictEqual(response.status, 400); assert.strictEqual(body.code, "CONSENT_REQUIRED"); assert.deepStrictEqual(await dbGet(dbPath, "SELECT (SELECT COUNT(*) FROM orders) orders,(SELECT COUNT(*) FROM clients) clients,(SELECT COUNT(*) FROM order_events) events"), before);
        response = await fetch(`${base}/api/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, consent: true, privacyPolicyVersion: "forged", termsVersion: "forged" }) }); body = await response.json(); assert.strictEqual(response.status, 201); const saved = await dbGet(dbPath, "SELECT * FROM orders WHERE id=?", [body.id]); assert.strictEqual(saved.consent_given, 1); assert(saved.consent_at); assert.strictEqual(saved.privacy_policy_version, env.PRIVACY_POLICY_VERSION); assert.strictEqual(saved.terms_version, env.TERMS_VERSION); assert.notStrictEqual(saved.total_price, 0.01);
        const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: "admin", password: "admin123" }) }); const auth = cookie(login); assert(auth); response = await fetch(`${base}/api/orders/${body.id}`, { headers: { Cookie: auth } }); const crm = await response.json(); assert(crm.order.consent.given); assert.strictEqual(crm.order.consent.privacyVersion, env.PRIVACY_POLICY_VERSION);
        if (oldOrder) { response = await fetch(`${base}/api/orders/${oldOrder.id}`, { headers: { Cookie: auth } }); const old = await response.json(); assert.strictEqual(old.order.consent, null); }
        const contacts = await (await fetch(`${base}/contacts`)).text(); assert(contacts.includes("Test &amp; &lt;Company&gt;")); assert(!contacts.includes("Test & <Company>")); for (const url of ["/privacy", "/terms", "/delivery", "/payment", "/returns", "/contacts", "/legal"]) assert.strictEqual((await fetch(`${base}${url}`)).status, 200);
        console.log(JSON.stringify({ success: true, missingConsent: "blocked", savedConsent: true, forgedVersionsIgnored: true, crmReadback: true, legacyOrder: oldOrder ? "unrecorded" : "not-present", legalXssEscaped: true }));
    } finally { child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
