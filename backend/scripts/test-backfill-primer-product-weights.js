"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { DATA, CONFIRM, parseArgs, openDatabase, inspectBatch, applyBatch, sha256 } = require("./backfill-primer-product-weights");

function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-primer-weight-")), name); }
function wrap(raw) {
  return {
    run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
    get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
    all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
    close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
  };
}

async function fixture(file, weights = [3, 3], units = ["шт", "шт"]) {
  const db = wrap(new sqlite3.Database(file));
  await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,price REAL,weight REAL,unit TEXT,category TEXT,subcategory TEXT,image_url TEXT,description TEXT,full_description TEXT,seo_title TEXT,brand TEXT)");
  await db.run("CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT)");
  await db.run("CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,unit_override TEXT)");
  await db.run("INSERT INTO product_attribute_definitions VALUES(1,'package_weight','Фасовка','number','кг')");
  for (let i = 0; i < DATA.PRODUCTS.length; i += 1) {
    const item = DATA.PRODUCTS[i];
    await db.run("INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [i + 1, item.externalId, item.expectedTitle, `slug-${i}`, 100 + i, weights[i], units[i], "Грунт / БетонКонтакт", "Грунтовка", `/img-${i}.webp`, `desc-${i}`, `full-${i}`, `seo-${i}`, `brand-${i}`]);
    await db.run("INSERT INTO product_attribute_values VALUES(?,?,?,?,?,?)", [i + 1, i + 1, 1, null, item.packageWeight, "кг"]);
  }
  return db;
}

async function snapshot(db) { return { products: await db.all("SELECT * FROM products ORDER BY id"), values: await db.all("SELECT * FROM product_attribute_values ORDER BY id") }; }

async function main() {
  let passed = 0; const pass = name => { passed += 1; console.log(`PASS ${name}`); };
  assert.deepEqual(DATA.TARGET_IDS, ["MAT-000243", "MAT-000244"]); assert.equal(DATA.CONFIRM, CONFIRM); pass("exact two-MAT allowlist and confirmation token");
  assert.throws(() => parseArgs(["--db", "x", "--only", "MAT-000243"]), /exactly/); assert.throws(() => parseArgs(["--db", "x", "--only", "MAT-000243,MAT-000244", "--apply", "--confirm", "WRONG"]), /BACKFILL_PRIMER_PRODUCT_WEIGHTS/); pass("exact --only and apply guards");

  const dryFile = tempFile("dry.db"); const dryDb = await fixture(dryFile); const beforeDry = sha256(dryFile); const dry = await inspectBatch(dryDb); assert.equal(dry.summary.willFix, 2); assert.equal(dry.summary.existingOk, 0); assert.equal(dry.summary.blockers, 0); assert.equal(sha256(dryFile), beforeDry); await dryDb.close(); pass("dry-run reports 3-to-10 without mutation");

  const okFile = tempFile("ok.db"); const okDb = await fixture(okFile, [10, 10]); const already = await inspectBatch(okDb); assert.equal(already.summary.existingOk, 2); assert.equal(already.summary.willFix, 0); await okDb.close(); pass("10 is EXISTING_OK");
  const conflictFile = tempFile("conflict.db"); const conflictDb = await fixture(conflictFile, [4, 3]); const conflict = await inspectBatch(conflictDb); assert.equal(conflict.summary.weightConflict, 1); assert.equal(conflict.rows[0].status, "WEIGHT_CONFLICT"); await assert.rejects(() => applyBatch(conflictDb, conflictFile, { confirm: CONFIRM, backupDir: path.dirname(conflictFile) }), /guarded conflict/); await conflictDb.close(); pass("unexpected weight blocks apply");
  const unitFile = tempFile("unit.db"); const unitDb = await fixture(unitFile, [3, 3], ["кг", "шт"]); const unitPlan = await inspectBatch(unitDb); assert.equal(unitPlan.summary.unitConflict, 1); assert.equal(unitPlan.rows[0].status, "UNIT_CONFLICT"); await unitDb.close(); pass("unit mismatch blocks");

  const applyFile = tempFile("apply.db"); const applyDb = await fixture(applyFile); const before = await snapshot(applyDb); const applied = await applyBatch(applyDb, applyFile, { confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(applied.writes, 2); const after = await snapshot(applyDb); for (let i = 0; i < before.products.length; i += 1) { const oldProduct = before.products[i]; const newProduct = after.products[i]; assert.equal(newProduct.weight, 10); for (const key of ["title", "slug", "price", "unit", "category", "subcategory", "image_url", "description", "full_description", "seo_title", "brand"]) assert.equal(newProduct[key], oldProduct[key], `${key} changed`); } assert.deepEqual(after.values, before.values); pass("apply changes only products.weight and preserves package_weight/content fields");
  const repeat = await applyBatch(applyDb, applyFile, { confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(repeat.writes, 0); assert.equal(repeat.summary.existingOk, 2); pass("second apply is idempotent"); await applyDb.close();

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = sha256(rollbackFile); const originalRun = rollbackDb.run.bind(rollbackDb); let updates = 0; rollbackDb.run = (sql, params) => { if (sql.startsWith("UPDATE products SET weight") && ++updates === 2) return Promise.reject(new Error("injected rollback")); return originalRun(sql, params); }; await assert.rejects(() => applyBatch(rollbackDb, rollbackFile, { confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(sha256(rollbackFile), rollbackBefore); const rollbackState = await rollbackDb.all("SELECT external_id,weight FROM products ORDER BY id"); assert.deepEqual(rollbackState.map(row => row.weight), [3, 3]); await rollbackDb.close(); pass("transaction rollback restores both weights");
  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
