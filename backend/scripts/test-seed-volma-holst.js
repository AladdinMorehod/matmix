const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("../sqlite");
const { runSeed, ATTRIBUTES, EXPECTED_IMAGE, IMAGE_ALT, EXTERNAL_ID, SKIPPED } = require("./seed-volma-holst");

function open(file) { const raw = new sqlite3.Database(file); return { raw, ready: configureBusinessConnection(raw), run(sql, params = []) { return this.ready.then(() => new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID }); }))); }, get(sql, params = []) { return this.ready.then(() => new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row)))); }, all(sql, params = []) { return this.ready.then(() => new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)))); }, close() { return new Promise(resolve => raw.close(resolve)); } }; }

async function schema(db) {
    await db.run("PRAGMA foreign_keys=ON");
    await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,price REAL,weight REAL,unit TEXT,category TEXT,subcategory TEXT,product_group TEXT,image_url TEXT,is_active INTEGER,source TEXT,last_imported_at TEXT,deleted_at TEXT,updated_at TEXT)");
    await db.run("CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,sort_order INTEGER,is_active INTEGER)");
    await db.run("CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
    await db.run("CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,alt_text TEXT,is_primary INTEGER,sort_order INTEGER,updated_at TEXT)");
    let id = 1; for (const [code, value] of Object.entries(ATTRIBUTES)) await db.run("INSERT INTO product_attribute_definitions VALUES(?,?,?,?,?,?,1)", [id++, code, code, value.type, value.unit || null, id]);
    for (const code of SKIPPED) await db.run("INSERT INTO product_attribute_definitions VALUES(?,?,?,?,?,?,1)", [id++, code, code, code === "consumption_10mm" || code === "coverage_30kg_10mm" ? "number" : "text", null, id]);
    await db.run("INSERT INTO products(id,external_id,title,brand,short_description,full_description,seo_title,seo_description,price,weight,unit,category,subcategory,product_group,image_url,is_active,source,last_imported_at,deleted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [5, EXTERNAL_ID, "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг", null, null, null, null, null, 407.4, 30, "шт", "Смеси", "Штукатурка", "Гипсовая", EXPECTED_IMAGE, 1, "import", "stamp", null, "stamp"]);
    await db.run("INSERT INTO products(id,external_id,title,price,weight,unit,is_active,image_url) VALUES(6,'MAT-OTHER','Другой товар',10,1,'шт',1,'/other.webp')");
    await db.run("INSERT INTO product_images VALUES(1,5,?,?,1,0,?)", [EXPECTED_IMAGE, null, "stamp"]);
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-volma-seed-")); const file = path.join(root, "db.sqlite"); const db = open(file);
    try {
        await schema(db);
        const before = await db.get("SELECT * FROM products WHERE id=6");
        let result = await runSeed({ database: db }); assert.strictEqual(result.changed, false); assert.strictEqual((await db.get("SELECT brand FROM products WHERE id=5")).brand, null);
        result = await runSeed({ database: db, apply: true, confirm: "SEED_MAT_000005" }); assert.strictEqual(result.changed, true);
        const product = await db.get("SELECT brand,short_description,seo_title,price,weight,unit,image_url FROM products WHERE id=5"); assert.strictEqual(product.brand, "ВОЛМА"); assert.strictEqual(product.price, 407.4); assert.strictEqual(product.image_url, EXPECTED_IMAGE);
        assert.deepStrictEqual(await db.get("SELECT image_url,alt_text FROM product_images WHERE product_id=5 AND is_primary=1"), { image_url: EXPECTED_IMAGE, alt_text: IMAGE_ALT });
        const values = await db.all("SELECT d.code,v.value_text,v.value_number,v.unit_override FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=5 ORDER BY d.code"); assert.strictEqual(values.length, Object.keys(ATTRIBUTES).length); assert(!values.some(value => SKIPPED.includes(value.code)));
        result = await runSeed({ database: db, apply: true, confirm: "SEED_MAT_000005" }); assert.strictEqual(result.changed, false); assert.deepStrictEqual(await db.get("SELECT * FROM products WHERE id=6"), before);
        await db.run("UPDATE product_images SET image_url='/wrong.webp' WHERE product_id=5"); result = await runSeed({ database: db }); assert.strictEqual(result.state.imageMatches, false); result = await runSeed({ database: db, apply: true, confirm: "SEED_MAT_000005" }); assert.strictEqual(result.changed, false); assert.strictEqual((await db.get("SELECT image_url,alt_text FROM product_images WHERE product_id=5")).alt_text, IMAGE_ALT);
        result = await runSeed({ database: db, apply: true, confirm: "SEED_MAT_000005" }); assert.strictEqual(result.changed, false);
        await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text) SELECT 5,id,'duplicate' FROM product_attribute_definitions WHERE code='brand'"); await assert.rejects(() => runSeed({ database: db }), /Дубликат attribute value/); await db.run("DELETE FROM product_attribute_values WHERE id=(SELECT MAX(id) FROM product_attribute_values WHERE product_id=5)");
        await db.run("INSERT INTO product_attribute_definitions(id,code,label,data_type) VALUES(99,'brand','duplicate','text')"); await assert.rejects(() => runSeed({ database: db }), /неоднозначно/); await db.run("DELETE FROM product_attribute_definitions WHERE id=99");
        const packageDefinition = await db.get("SELECT id FROM product_attribute_definitions WHERE code='package_weight'"); await db.run("UPDATE product_attribute_definitions SET data_type='text' WHERE id=?", [packageDefinition.id]); await assert.rejects(() => runSeed({ database: db, apply: true, confirm: "SEED_MAT_000005" }), /ожидался тип/); await db.run("UPDATE product_attribute_definitions SET data_type='number' WHERE id=?", [packageDefinition.id]);
        await db.run("UPDATE products SET brand=NULL WHERE id=5"); await db.run("DELETE FROM product_attribute_values WHERE attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='product_type') AND product_id=5"); let failed = false; const failingDb = { get: db.get.bind(db), all: db.all.bind(db), run: async (sql, params) => { if (!failed && sql.startsWith("INSERT INTO product_attribute_values")) { failed = true; throw new Error("injected failure"); } return db.run(sql, params); } }; await assert.rejects(() => runSeed({ database: failingDb, apply: true, confirm: "SEED_MAT_000005" }), /injected failure/); assert.strictEqual((await db.get("SELECT brand FROM products WHERE id=5")).brand, null);
        await db.run("UPDATE products SET external_id='MAT-TEMP' WHERE id=5"); await assert.rejects(() => runSeed({ database: db }), /товар не найден/); await db.run("UPDATE products SET external_id=? WHERE id=5", [EXTERNAL_ID]);
        console.log(JSON.stringify({ success: true, dryRunNoMutation: true, apply: true, idempotent: true, immutableFields: true, skippedRanges: true, imageMismatchWarning: true }));
    } finally { await db.close(); fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
