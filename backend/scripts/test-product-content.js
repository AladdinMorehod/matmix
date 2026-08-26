const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const sqlite3 = require("sqlite3").verbose();
const { verifyReferences } = require("../services/productionBackup");

function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); }
async function waitFor(url) { for (let attempt = 0; attempt < 100; attempt += 1) { try { if ((await fetch(url)).status) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Test server did not start."); }
function cookie(response) { return response.headers.getSetCookie?.()[0]?.split(";")[0] || response.headers.get("set-cookie")?.split(";")[0] || ""; }
async function login(base, loginName, password) { const response = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: loginName, password }) }); assert.strictEqual(response.status, 200); return cookie(response); }
async function json(base, endpoint, method = "GET", body, auth = "") {
    const response = await fetch(`${base}${endpoint}`, { method, headers: { ...(auth ? { Cookie: auth } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json(); return { response, data };
}
async function upload(base, endpoint, buffer, auth, name) { const body = new FormData(); body.append("image", new Blob([buffer], { type: "image/png" }), name); return fetch(`${base}${endpoint}`, { method: "POST", headers: { Cookie: auth }, body }); }

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-product-content-"));
    const dbPath = path.join(root, "matmix.db"); const uploads = path.join(root, "uploads"); fs.mkdirSync(uploads);
    const v8Path = path.join(root, "v8-reference.db"); const v8Uploads = path.join(root, "v8-uploads"); fs.mkdirSync(v8Uploads);
    const v8 = open(v8Path);
    await run(v8, "CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,image_url TEXT,is_active INTEGER)");
    await run(v8, "INSERT INTO products(id,external_id,image_url,is_active) VALUES(1,'MAT-V8','/uploads/products/v8.webp',1)");
    await run(v8, "PRAGMA user_version=8"); await new Promise(resolve => v8.close(resolve));
    await fs.promises.writeFile(path.join(v8Uploads, "v8.webp"), "v8 fixture");
    assert.deepStrictEqual((await verifyReferences(v8Path, v8Uploads)).orphanFiles, []);
    process.env.MATMIX_DB_PATH = dbPath;
    const { initDatabase, db: initializationDb } = require("../database");
    await initDatabase(); await new Promise(resolve => initializationDb.close(resolve));
    await require("../databaseMigrations").migrateDatabase(dbPath, { dryRun: false });
    const fixture = open(dbPath); const now = new Date().toISOString();
    try {
        await run(fixture, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["content_manager", await bcrypt.hash("Manager!234", 10), "manager", "Manager", now, now]);
        const category = await run(fixture, "INSERT INTO catalog_structure(type,name,normalized_name,sort_order,is_active,created_at,updated_at) VALUES('category','Материалы','материалы',0,1,?,?)", [now, now]);
        const subcategory = await run(fixture, "INSERT INTO catalog_structure(type,name,normalized_name,parent_id,sort_order,is_active,created_at,updated_at) VALUES('subcategory','Штукатурки','штукатурки',?,0,1,?,?)", [category.id, now, now]);
        await run(fixture, `INSERT INTO products(external_id,title,category,subcategory,product_group,price,weight,unit,description,is_active,sort_order,created_at,updated_at)
            VALUES('MAT-CONTENT-001','Товар content','Материалы','Штукатурки','Гипсовые',100,5,'шт','Legacy stays',1,0,?,?)`, [now, now]);
        assert(subcategory.id);
    } finally { await new Promise(resolve => fixture.close(resolve)); }

    const port = 43000 + Math.floor(Math.random() * 1000);
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { cwd: path.join(__dirname, "..", ".."), windowsHide: true, env: { ...process.env, NODE_ENV: "test", PORT: String(port), MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(root, "sessions.db"), PRODUCT_UPLOADS_PATH: uploads, APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock") }, stdio: ["ignore", "pipe", "pipe"] });
    let errors = ""; child.stderr.on("data", chunk => { errors += chunk; }); child.stdout.resume();
    try {
        const base = `http://127.0.0.1:${port}`; await waitFor(`${base}/api/public/products?limit=1`);
        const admin = await login(base, "admin", "admin123"); const manager = await login(base, "content_manager", "Manager!234");
        const fixtureDb = open(dbPath); const product = await get(fixtureDb, "SELECT id FROM products WHERE external_id='MAT-CONTENT-001'"); const subcategory = await get(fixtureDb, "SELECT id FROM catalog_structure WHERE type='subcategory' AND name='Штукатурки'"); await new Promise(resolve => fixtureDb.close(resolve));

        let result = await json(base, "/api/products/attribute-definitions", "POST", { code: "layer_thickness", label: "Толщина слоя", dataType: "number", defaultUnit: "мм", defaultSection: "Применение", sortOrder: 2, isActive: true }, admin);
        assert.strictEqual(result.response.status, 201); const numberDefinition = result.data.definition.id;
        result = await json(base, "/api/products/attribute-definitions", "POST", { code: "is_frost_resistant", label: "Морозостойкость", dataType: "boolean", sortOrder: 3, isActive: true }, admin);
        assert.strictEqual(result.response.status, 201); const booleanDefinition = result.data.definition.id;
        result = await json(base, "/api/products/attribute-definitions", "POST", { code: "layer_thickness", label: "Дубль", dataType: "text" }, admin); assert.strictEqual(result.response.status, 409); assert.strictEqual(result.data.code, "ATTRIBUTE_CODE_EXISTS");
        result = await json(base, "/api/products/attribute-definitions", "POST", { code: "Bad Code", label: "Bad", dataType: "text" }, admin); assert.strictEqual(result.response.status, 400);
        result = await json(base, `/api/products/attribute-definitions/${numberDefinition}`, "PATCH", { code: "changed_code", label: "Толщина нанесения" }, admin); assert.strictEqual(result.response.status, 400);
        result = await json(base, `/api/products/attribute-definitions/${numberDefinition}`, "PATCH", { label: "Толщина нанесения", defaultUnit: "мм", defaultSection: "Применение", sortOrder: 1, isActive: true }, admin); assert.strictEqual(result.response.status, 200);

        result = await json(base, `/api/products/attribute-templates/${subcategory.id}`, "PUT", { templates: [{ definitionId: numberDefinition, sortOrder: 1, isRequired: true, unitOverride: "мм" }, { definitionId: booleanDefinition, sortOrder: 2, isRequired: false }] }, admin); assert.strictEqual(result.response.status, 200); assert.strictEqual(result.data.templates.length, 2);
        result = await json(base, `/api/products/${product.id}/content`, "PATCH", { brand: "Knauf", shortDescription: "Коротко", fullDescription: "Полное plain text <script>alert(1)</script>", seoTitle: "SEO title", seoDescription: "SEO description", attributes: [{ definitionId: numberDefinition, value: 25, unitOverride: "мм", sortOrder: 1 }, { definitionId: booleanDefinition, value: true, sortOrder: 2 }] }, admin); assert.strictEqual(result.response.status, 200);
        assert.strictEqual(result.data.content.product.brand, "Knauf"); assert.strictEqual(result.data.content.values.length, 2); assert.strictEqual(result.data.content.values.find(item => item.definitionId === numberDefinition).value, 25);
        result = await json(base, `/api/products/${product.id}/content`, "PATCH", { brand: "Knauf", attributes: [{ definitionId: numberDefinition, value: "not-number" }] }, admin); assert.strictEqual(result.response.status, 400); assert.strictEqual(result.data.code, "INVALID_ATTRIBUTE_VALUE");
        result = await json(base, `/api/products/${product.id}`, "PATCH", { title: "Legacy update", category: "Материалы", subcategory: "Штукатурки", productGroup: "Гипсовые", price: 120, weight: 5, unit: "шт", description: "Legacy stays", isActive: true }, admin); assert.strictEqual(result.response.status, 200); assert.strictEqual(result.data.product.brand, "Knauf");

        const firstBuffer = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#844455" } }).png().toBuffer();
        const secondBuffer = await sharp({ create: { width: 500, height: 350, channels: 3, background: "#447755" } }).png().toBuffer();
        let response = await upload(base, `/api/products/${product.id}/gallery`, firstBuffer, admin, "first.png"); assert.strictEqual(response.status, 201); const first = (await response.json()).image;
        response = await upload(base, `/api/products/${product.id}/gallery`, secondBuffer, admin, "second.png"); assert.strictEqual(response.status, 201); const second = (await response.json()).image;
        result = await json(base, `/api/products/${product.id}/gallery/${second.id}`, "PATCH", { altText: "Второе изображение", isPrimary: true }, admin); assert.strictEqual(result.response.status, 200);
        let checkDb = open(dbPath); let primary = await get(checkDb, "SELECT p.image_url,i.image_url,i.alt_text FROM products p JOIN product_images i ON i.product_id=p.id AND i.is_primary=1 WHERE p.id=?", [product.id]); assert.strictEqual(primary.image_url, result.data.image.image_url); assert.strictEqual(primary.alt_text, "Второе изображение"); await new Promise(resolve => checkDb.close(resolve));
        result = await json(base, `/api/products/${product.id}/gallery-order`, "PUT", { imageIds: [second.id, first.id] }, admin); assert.strictEqual(result.response.status, 200);
        result = await json(base, `/api/products/${product.id}/gallery/${second.id}`, "DELETE", undefined, admin); assert.strictEqual(result.response.status, 200); assert(result.data.primaryImageUrl);
        checkDb = open(dbPath); primary = await get(checkDb, "SELECT p.image_url product_image_url,i.image_url gallery_image_url FROM products p JOIN product_images i ON i.product_id=p.id AND i.is_primary=1 WHERE p.id=?", [product.id]); assert.strictEqual(primary.product_image_url, primary.gallery_image_url); assert.strictEqual((await all(checkDb, "SELECT id FROM product_images WHERE product_id=? AND is_primary=1", [product.id])).length, 1); await new Promise(resolve => checkDb.close(resolve));

        const unusedName = "genuinely-unused.webp";
        await fs.promises.writeFile(path.join(uploads, unusedName), "unused fixture");
        let references = await verifyReferences(dbPath, uploads);
        assert(!references.orphanFiles.includes(path.basename(first.image_url)), "primary products/product_images reference must not be orphaned");
        assert(references.orphanFiles.includes(unusedName), "unreferenced file must be reported as orphan");

        checkDb = open(dbPath);
        const sharedProduct = await run(checkDb, `INSERT INTO products(external_id,title,category,price,unit,is_active,created_at,updated_at)
            VALUES('MAT-CONTENT-SHARED','Shared secondary','Материалы',100,'шт',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
        const sharedImage = await run(checkDb, `INSERT INTO product_images(product_id,image_url,sort_order,is_primary,created_at,updated_at)
            VALUES(?,?,0,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [sharedProduct.id, first.image_url]);
        await new Promise(resolve => checkDb.close(resolve));
        references = await verifyReferences(dbPath, uploads);
        assert(!references.orphanFiles.includes(path.basename(first.image_url)), "secondary-only gallery reference must not be orphaned");

        result = await json(base, `/api/products/${product.id}/gallery/${first.id}`, "DELETE", undefined, admin); assert.strictEqual(result.response.status, 200);
        assert(fs.existsSync(path.join(uploads, path.basename(first.image_url))), "shared secondary reference must prevent physical deletion");
        references = await verifyReferences(dbPath, uploads);
        assert(!references.orphanFiles.includes(path.basename(first.image_url)), "secondary-only gallery reference must not be orphaned");
        const optimizerScan = spawnSync(process.execPath, [path.join(__dirname, "optimize-product-images.js"), "--scan"], {
            cwd: path.join(__dirname, "..", ".."), env: { ...process.env, MATMIX_DB_PATH: dbPath, PRODUCT_UPLOADS_PATH: uploads }, encoding: "utf8"
        });
        assert.strictEqual(optimizerScan.status, 0, String(optimizerScan.stderr || optimizerScan.stdout));
        const optimizerReport = JSON.parse(optimizerScan.stdout);
        assert(!optimizerReport.orphan.includes(path.basename(first.image_url)));
        assert(optimizerReport.orphan.includes(unusedName));
        result = await json(base, `/api/products/${sharedProduct.id}/gallery/${sharedImage.id}`, "DELETE", undefined, admin); assert.strictEqual(result.response.status, 200);
        assert(!fs.existsSync(path.join(uploads, path.basename(first.image_url))), "last reference removal must allow physical deletion");

        result = await json(base, `/api/products/${product.id}/content`, "GET", undefined, manager); assert.strictEqual(result.response.status, 403);
        result = await json(base, "/api/products/attribute-definitions", "POST", { code: "denied", label: "Denied", dataType: "text" }, manager); assert.strictEqual(result.response.status, 403);
        response = await upload(base, `/api/products/${product.id}/gallery`, firstBuffer, manager, "denied.png"); assert.strictEqual(response.status, 403);

        checkDb = open(dbPath); const finalProduct = await get(checkDb, "SELECT brand,short_description,full_description,seo_title,seo_description,description FROM products WHERE id=?", [product.id]); assert.deepStrictEqual(finalProduct, { brand: "Knauf", short_description: "Коротко", full_description: "Полное plain text <script>alert(1)</script>", seo_title: "SEO title", seo_description: "SEO description", description: "Legacy stays" }); assert.strictEqual((await all(checkDb, "PRAGMA foreign_key_check")).length, 0); assert.strictEqual((await get(checkDb, "PRAGMA integrity_check")).integrity_check, "ok"); await new Promise(resolve => checkDb.close(resolve));
        const health = spawnSync(process.execPath, [path.join(__dirname, "check-database-health.js"), "--json"], { cwd: path.join(__dirname, "..", ".."), env: { ...process.env, MATMIX_DB_PATH: dbPath }, encoding: "utf8" });
        assert.strictEqual(health.status, 0, String(health.stderr || health.stdout));
        assert.strictEqual(JSON.parse(health.stdout).healthy, true);
        console.log(JSON.stringify({ success: true, contentFields: true, legacyUpdate: true, definitions: true, templates: true, typedValues: true, invalidValueRejected: true, galleryUpload: true, primarySync: true, primaryRemovalPromotesNext: true, reorder: true, altText: true, unauthorizedRejected: true, primaryNotOrphan: true, secondaryNotOrphan: true, unusedReportedOrphan: true, sharedSecondaryDeleteSafe: true, lastReferenceDeletion: true, integrity: true, databaseHealth: true }));
    } finally { child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); fs.rmSync(root, { recursive: true, force: true }); }
    if (errors && !/ephemeral development secret/.test(errors)) console.error(errors);
})().catch(error => { console.error(error); process.exitCode = 1; });
