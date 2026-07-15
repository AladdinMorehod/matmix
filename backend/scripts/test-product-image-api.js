const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sharp = require("sharp");
const sqlite3 = require("sqlite3").verbose();

function rows(file, sql) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.all(sql, (error, result) => db.close(() => error ? reject(error) : resolve(result))); }); }
function run(file, sql) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.run(sql, error => db.close(() => error ? reject(error) : resolve())); }); }
async function waitFor(url) { for (let i = 0; i < 80; i += 1) { try { const response = await fetch(url); if (response.status) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Test server did not start."); }
function cookie(response) { return response.headers.getSetCookie?.()[0]?.split(";")[0] || response.headers.get("set-cookie")?.split(";")[0] || ""; }
async function upload(url, auth, buffer, name = "фото товара.png", mime = "image/png", fields = {}) {
    const body = new FormData(); body.append("image", new Blob([buffer], { type: mime }), name);
    for (const [key, value] of Object.entries(fields)) body.append(key, value);
    return fetch(url, { method: "POST", headers: { Cookie: auth }, body });
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-image-api-"));
    const dbPath = path.join(root, "matmix.db"); const uploads = path.join(root, "uploads");
    fs.copyFileSync(path.join(__dirname, "..", "database", "matmix.db"), dbPath); fs.mkdirSync(uploads);
    const port = 41000 + Math.floor(Math.random() * 1000);
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
        cwd: path.join(__dirname, "..", ".."), windowsHide: true,
        env: { ...process.env, NODE_ENV: "test", PORT: String(port), MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(root, "sessions.db"), PRODUCT_UPLOADS_PATH: uploads, APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock") },
        stdio: ["ignore", "pipe", "pipe"]
    });
    let errors = ""; child.stderr.on("data", chunk => { errors += chunk; });
    try {
        const base = `http://127.0.0.1:${port}`; await waitFor(`${base}/api/public/products?limit=1`);
        const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: "admin", password: "admin123" }) });
        assert.strictEqual(login.status, 200); const auth = cookie(login); assert(auth);
        const products = await rows(dbPath, "SELECT id FROM products WHERE deleted_at IS NULL ORDER BY id LIMIT 2"); assert.strictEqual(products.length, 2);
        const first = await sharp({ create: { width: 1600, height: 900, channels: 4, background: { r: 30, g: 90, b: 40, alpha: 0.6 } } }).png().toBuffer();
        let response = await upload(`${base}/api/products/images/batch`, auth, first, "русское ../ имя.png", "image/png", { productIds: JSON.stringify(products.map(row => row.id)) });
        assert.strictEqual(response.status, 200); const shared = (await response.json()).imageUrl; assert(shared.endsWith(".webp"));
        const sharedPath = path.join(uploads, path.basename(shared)); assert(fs.existsSync(sharedPath));
        const publicImage = await fetch(`${base}${shared}`); assert.strictEqual(publicImage.headers.get("content-type"), "image/webp"); assert(/immutable/.test(publicImage.headers.get("cache-control"))); assert.strictEqual(publicImage.headers.get("x-content-type-options"), "nosniff");
        assert.strictEqual((await fetch(`${base}/uploads/products/missing.webp`)).status, 404);
        const second = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#993333" } }).jpeg().toBuffer();
        response = await upload(`${base}/api/products/${products[0].id}/image`, auth, second, "same.jpg", "image/jpeg");
        assert.strictEqual(response.status, 200); const replacement = (await response.json()).imageUrl; assert(fs.existsSync(sharedPath));
        response = await fetch(`${base}/api/products/${products[1].id}/image`, { method: "DELETE", headers: { Cookie: auth } }); assert.strictEqual(response.status, 200); assert(!fs.existsSync(sharedPath));
        response = await fetch(`${base}/api/products/${products[0].id}/image`, { method: "DELETE", headers: { Cookie: auth } }); assert.strictEqual(response.status, 200); assert(!fs.existsSync(path.join(uploads, path.basename(replacement))));
        response = await upload(`${base}/api/products/${products[0].id}/image`, auth, Buffer.from("%PDF-1.4"), "fake.jpg", "image/jpeg"); assert.strictEqual((await response.json()).code, "CORRUPT_IMAGE");
        response = await upload(`${base}/api/products/${products[0].id}/image`, auth, Buffer.from("<svg/>"), "image.svg", "image/svg+xml"); assert.strictEqual((await response.json()).code, "UNSUPPORTED_IMAGE_FORMAT");
        const huge = await sharp({ create: { width: 12001, height: 1, channels: 3, background: "white" } }).png().toBuffer();
        response = await upload(`${base}/api/products/${products[0].id}/image`, auth, huge, "huge.png", "image/png"); assert.strictEqual((await response.json()).code, "IMAGE_DIMENSIONS_TOO_LARGE");
        await run(dbPath, "CREATE TRIGGER reject_test_image BEFORE UPDATE OF image_url ON products WHEN NEW.image_url IS NOT NULL BEGIN SELECT RAISE(ABORT, 'test rollback'); END");
        response = await upload(`${base}/api/products/images/batch`, auth, first, "rollback.png", "image/png", { productIds: JSON.stringify(products.map(row => row.id)) });
        assert(response.status >= 400); assert.strictEqual(fs.readdirSync(uploads).filter(name => !name.startsWith(".")).length, 0);
        await run(dbPath, "DROP TRIGGER reject_test_image");
        console.log(JSON.stringify({ success: true, normalizedWebP: true, immutableCache: true, contentType: "image/webp", sharedReference: true, lastReferenceDelete: true, corruptRejected: true, dimensionsRejected: true, massRollbackOrphanFree: true }));
    } finally { child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }
    if (errors && !/ephemeral development secret/.test(errors)) console.error(errors);
})().catch(error => { console.error(error); process.exitCode = 1; });
