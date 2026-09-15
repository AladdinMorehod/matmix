const assert = require("assert/strict");
const os = require("os");
const sqlite3 = require("sqlite3").verbose();
const { DATA, CONFIRM, applyBatch, inspectBatch } = require("./backfill-plaster-descriptions");

function wrap(raw) {
    return {
        run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
    };
}
async function fixture() {
    const db = wrap(new sqlite3.Database(":memory:"));
    await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,brand TEXT,price REAL,description TEXT,full_description TEXT,seo_title TEXT,image_url TEXT,updated_at TEXT)");
    await db.run("CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_id INTEGER,value_text TEXT,value_number REAL,unit TEXT)");
    for (const item of DATA.PRODUCTS) await db.run("INSERT INTO products(id,external_id,title,brand,price,description,full_description,seo_title,image_url,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)", [Number(item.externalId.slice(-6)), item.externalId, item.expectedTitle, "KEEP", 123, "legacy", item.externalId === "MAT-000005" ? "protected full" : null, "KEEP SEO", "/keep.webp", "before"]);
    await db.run("INSERT INTO product_attribute_values(product_id,attribute_id,value_text,value_number,unit) VALUES(?,?,?,?,?)", [1, 77, "8,5", 8.5, "кг/м²"]);
    return db;
}
async function main() {
    const dbPath = "backend/database/matmix.db"; const db = await fixture(); let passed = 0; const pass = name => { passed++; console.log(`PASS ${name}`); };
    const before = await db.all("SELECT * FROM products ORDER BY id"); const dry = await inspectBatch(db, { only: ["MAT-000001", "MAT-000002", "MAT-000005", "MAT-000027", "MAT-000028"] }); assert.equal(dry.summary.needsFix, 1); assert.equal(dry.rows.find(row => row.externalId === "MAT-000002").status, "EXCLUDED_PROTECTED"); assert.deepEqual(await db.all("SELECT * FROM products ORDER BY id"), before); pass("dry-run audit is read-only and classifies protected/blocked records");
    assert.doesNotMatch(DATA.DESCRIPTIONS["MAT-000022"], /расход[^.]{0,80}10\s*мм/i); assert.doesNotMatch(DATA.DESCRIPTIONS["MAT-000025"], /PC21\s*M/i); assert.deepEqual(DATA.PRODUCTS.find(item => item.externalId === "MAT-000025").sourceKeys, ["startwell"]); pass("high-risk description/source checks for MAT-000022 and MAT-000025");
    await assert.rejects(() => applyBatch(db, dbPath, { only: ["MAT-000001"], confirm: "wrong", backupDir: os.tmpdir() }), /BACKFILL_PLASTER_DESCRIPTIONS/); pass("apply confirmation guard");
    const original = await db.get("SELECT * FROM products WHERE external_id='MAT-000001'"); const specsBefore = await db.all("SELECT * FROM product_attribute_values ORDER BY id"); await applyBatch(db, dbPath, { only: ["MAT-000001"], confirm: CONFIRM, backupDir: os.tmpdir() }); const changed = await db.get("SELECT * FROM products WHERE external_id='MAT-000001'"); assert.notEqual(changed.full_description, null); assert.equal(changed.brand, original.brand); assert.equal(changed.price, original.price); assert.equal(changed.seo_title, original.seo_title); assert.equal(changed.image_url, original.image_url); assert.equal(changed.title, original.title); assert.equal(changed.external_id, original.external_id); assert.equal(changed.description, original.description); assert.deepEqual(await db.all("SELECT * FROM product_attribute_values ORDER BY id"), specsBefore); pass("targeted apply changes only full_description");
    const repeat = await applyBatch(db, dbPath, { only: ["MAT-000001"], confirm: CONFIRM, backupDir: os.tmpdir() }); assert.equal(repeat.writes, 0); pass("idempotent apply");
    const mat2 = await db.get("SELECT * FROM products WHERE external_id='MAT-000002'"); await applyBatch(db, dbPath, { only: ["MAT-000002"], confirm: CONFIRM, backupDir: os.tmpdir() }); assert.deepEqual(await db.get("SELECT * FROM products WHERE external_id='MAT-000002'"), mat2); pass("MAT-000002 protected");
    const mat5 = await db.get("SELECT * FROM products WHERE external_id='MAT-000005'"); await applyBatch(db, dbPath, { only: ["MAT-000005"], confirm: CONFIRM, backupDir: os.tmpdir() }); assert.deepEqual(await db.get("SELECT * FROM products WHERE external_id='MAT-000005'"), mat5); pass("MAT-000005 protected");
    const blocked = await db.get("SELECT * FROM products WHERE external_id='MAT-000027'"); await applyBatch(db, dbPath, { only: ["MAT-000027", "MAT-000028"], confirm: CONFIRM, backupDir: os.tmpdir() }); assert.deepEqual(await db.get("SELECT * FROM products WHERE external_id='MAT-000027'"), blocked); pass("blocked identities never write");
    const titleBefore = await db.get("SELECT * FROM products WHERE external_id='MAT-000003'"); await db.run("UPDATE products SET title='wrong title' WHERE external_id='MAT-000003'"); const mismatchSnapshot = await db.get("SELECT * FROM products WHERE external_id='MAT-000003'"); await assert.rejects(() => applyBatch(db, dbPath, { only: ["MAT-000003"], confirm: CONFIRM, backupDir: os.tmpdir() }), /Identity mismatch/); assert.deepEqual(await db.get("SELECT * FROM products WHERE external_id='MAT-000003'"), mismatchSnapshot); await db.run("UPDATE products SET title=? WHERE external_id='MAT-000003'", [titleBefore.title]); pass("exact title validation blocks writes");
    await db.run("UPDATE products SET full_description=NULL WHERE external_id='MAT-000003'"); const snapshot = await db.all("SELECT * FROM products ORDER BY id"); const failing = { ...db, run(sql, params) { if (sql.startsWith("UPDATE products SET full_description")) throw new Error("injected rollback"); return db.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, dbPath, { only: ["MAT-000003"], confirm: CONFIRM, backupDir: os.tmpdir() }), /injected rollback/); assert.deepEqual(await db.all("SELECT * FROM products ORDER BY id"), snapshot); pass("transaction rollback");
    await db.close(); console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
