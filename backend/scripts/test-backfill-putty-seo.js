"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-putty-seo");
const DATA = require("./data/putties-seo");

function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-putty-seo-")), name); }
function execSql(file, sql) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.exec(sql, error => db.close(() => error ? reject(error) : resolve())); }); }
function pass(name) { console.log(`PASS ${name}`); }

async function fixture(file) {
    const db = new sqlite3.Database(file);
    await new Promise((resolve, reject) => db.exec(`
      CREATE TABLE products(id INTEGER PRIMARY KEY, external_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL, slug TEXT, category TEXT, subcategory TEXT, price REAL, weight REAL, unit TEXT, image TEXT, description TEXT, is_active INTEGER DEFAULT 1, source TEXT, image_url TEXT, brand TEXT, short_description TEXT, full_description TEXT, seo_title TEXT, seo_description TEXT, stock_status TEXT DEFAULT 'unknown', deleted_at TEXT, updated_at TEXT);
      CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY, type TEXT, name TEXT, external_code TEXT, parent_id INTEGER, is_active INTEGER DEFAULT 1);
      INSERT INTO catalog_structure VALUES (1,'category','Смеси','CAT-000001',NULL,1);
      INSERT INTO catalog_structure VALUES (2,'subcategory','Шпаклевка','SUB-000003',1,1);
    `, error => error ? reject(error) : resolve()));
    const insert = db.prepare("INSERT INTO products(id,external_id,title,slug,category,subcategory,price,weight,unit,image,description,is_active,image_url,brand,short_description,full_description,seo_title,seo_description,stock_status,deleted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    for (const [index, item] of DATA.PRODUCTS.entries()) {
        const weight = Number(item.expectedWeight);
        await new Promise((resolve, reject) => insert.run(index + 1, item.externalId, item.expectedTitle, `slug-${item.externalId}`, "Смеси", "Шпаклевка", 100, weight, "шт", "/image.webp", "legacy", 1, "/image.webp", null, "legacy short", "approved full", index === 0 ? item.proposedSeoTitle : null, index === 0 ? item.proposedSeoDescription : null, "unknown", null, "before", error => error ? reject(error) : resolve()));
    }
    await new Promise((resolve, reject) => insert.finalize(error => error ? reject(error) : resolve()));
    await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
}

(async () => {
    assert.deepStrictEqual(DATA.TARGET_MATS, Array.from({ length: 33 }, (_, index) => `MAT-${String(index + 33).padStart(6, "0")}`));
    assert.deepStrictEqual(RUNNER.SEO_MUTABLE_FIELDS_EXACTLY, ["seo_title", "seo_description"]); assert.equal(DATA.PRODUCTS.length, 33); pass("exact 33-MAT allowlist and SEO mutable fields");
    assert.equal(RUNNER.CONFIRM, "BACKFILL_PUTTY_SEO"); assert.throws(() => RUNNER.parseArgs(["--db", "x.db"]), /--only/); assert.throws(() => RUNNER.parseArgs(["--db", "x.db", "--only", "", "--apply", "--confirm", RUNNER.CONFIRM]), /Value required|Nonempty/); pass("confirm token and mandatory nonempty --only");
    const normalizedTitles = new Set(DATA.PRODUCTS.map(item => item.proposedSeoTitle.toLocaleLowerCase("ru-RU").trim())); const normalizedDescriptions = new Set(DATA.PRODUCTS.map(item => item.proposedSeoDescription.toLocaleLowerCase("ru-RU").trim())); assert.equal(normalizedTitles.size, 33); assert.equal(normalizedDescriptions.size, 33); for (const item of DATA.PRODUCTS) assert.deepStrictEqual(RUNNER.validationIssues(item), []); pass("SEO uniqueness, lengths, whitespace and public-language validation");
    const file = tempFile("fixture.db"); await fixture(file); const db = await RUNNER.openDatabase(file, true);
    const before = await db.all("SELECT * FROM products ORDER BY id"); const dry = await RUNNER.inspectBatch(db, { only: DATA.TARGET_MATS }); assert.deepStrictEqual(dry.summary, { total: 33, existingOk: 1, needsFix: 32, blockedIdentity: 0, excludedAllowlist: 0, errors: 0, duplicateSeoTitles: 0, duplicateSeoDescriptions: 0, unsupportedClaims: 0, publicMetaLanguageCount: 0 }); pass("full 33-MAT dry-run and existing SEO comparison");
    const excluded = await RUNNER.inspectBatch(db, { only: ["MAT-999999"] }); assert.equal(excluded.rows[0].status, "EXCLUDED_ALLOWLIST"); pass("outside allowlist rejected");
    const immutableBefore = before.map(row => ({ id: row.id, title: row.title, slug: row.slug, brand: row.brand, weight: row.weight, price: row.price, category: row.category, subcategory: row.subcategory, full_description: row.full_description, image_url: row.image_url })); const applied = await RUNNER.applyBatch(db, file, { only: DATA.TARGET_MATS, confirm: RUNNER.CONFIRM, backupDir: path.dirname(file) }); assert.equal(applied.writes, 32); const after = await db.all("SELECT * FROM products ORDER BY id"); for (let i = 0; i < after.length; i += 1) { for (const field of Object.keys(immutableBefore[i])) if (field !== "id") assert.equal(after[i][field], immutableBefore[i][field], `${after[i].external_id}/${field}`); } assert.equal(after[1].seo_title, DATA.PRODUCTS[1].proposedSeoTitle); pass("apply mutates only SEO fields and preserves immutable product data");
    const repeated = await RUNNER.applyBatch(db, file, { only: DATA.TARGET_MATS, confirm: RUNNER.CONFIRM, backupDir: path.dirname(file) }); assert.equal(repeated.writes, 0); pass("repeat apply is idempotent"); await db.close();
    await execSql(file, "UPDATE products SET seo_title=NULL,seo_description=NULL WHERE external_id IN ('MAT-000034','MAT-000035')"); await execSql(file, "CREATE TRIGGER fail_seo_update BEFORE UPDATE OF seo_title ON products WHEN NEW.external_id='MAT-000035' BEGIN SELECT RAISE(ABORT, 'forced rollback'); END"); const rollbackDb = await RUNNER.openDatabase(file, true); const rollbackBefore = await rollbackDb.get("SELECT seo_title,seo_description FROM products WHERE external_id='MAT-000034'"); await assert.rejects(() => RUNNER.applyBatch(rollbackDb, file, { only: ["MAT-000034", "MAT-000035"], confirm: RUNNER.CONFIRM, backupDir: path.dirname(file) }), /forced rollback/); const rollbackAfter = await rollbackDb.get("SELECT seo_title,seo_description FROM products WHERE external_id='MAT-000034'"); assert.deepStrictEqual(rollbackAfter, rollbackBefore); await rollbackDb.close(); pass("transaction rollback restores partial SEO writes");
    await execSql(file, "UPDATE products SET title='wrong title' WHERE external_id='MAT-000034'"); const guarded = await RUNNER.openDatabase(file, false); const mismatch = await RUNNER.inspectBatch(guarded, { only: ["MAT-000034"] }); assert.equal(mismatch.rows[0].status, "ERROR"); assert.match(mismatch.rows[0].error, /Identity mismatch/); await guarded.close(); pass("exact title guard prevents unsafe planning");
    console.log("PASS 9 test groups; synthetic SQLite only");
})().catch(error => { console.error(error); process.exitCode = 1; });
