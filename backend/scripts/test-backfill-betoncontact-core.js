"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, parseArgs } = require("./backfill-betoncontact-core");

function wrap(raw) {
  return {
    run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
    get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
    all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
    close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
  };
}
function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-betoncontact-batch1-")), name); }
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
async function fixture(file, definitions = []) {
  const db = wrap(new sqlite3.Database(file)); await db.run("PRAGMA foreign_keys=ON");
  await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT UNIQUE NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER DEFAULT 1,updated_at TEXT,deleted_at TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image_url TEXT,stock_status TEXT NOT NULL DEFAULT 'unknown')");
  await db.run("CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL,label TEXT NOT NULL,data_type TEXT NOT NULL,default_unit TEXT,default_section TEXT,sort_order INTEGER NOT NULL DEFAULT 0,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT,updated_at TEXT)");
  await db.run("CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,attribute_definition_id INTEGER NOT NULL,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT,updated_at TEXT)");
  for (const def of definitions) await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [def.code, def.label, def.dataType, def.defaultUnit, "Характеристики", 0, 1, "before", "before"]);
  for (const item of DATA.PRODUCTS) await db.run("INSERT INTO products(external_id,title,slug,category,subcategory,price,weight,unit,brand,description,full_description,seo_title,seo_description,image_url,is_active,deleted_at,updated_at,stock_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [item.externalId, item.expectedTitle, `slug-${item.externalId}`, item.expectedCategory, item.expectedSubcategory, 100, item.core.package_weight.value, "шт", null, "desc", "full", "seo", "seo desc", "/keep.jpg", 1, null, "before", "in_stock"]);
  return db;
}
async function addValue(db, externalId, code, value, type = "text") { const p = await db.get("SELECT id FROM products WHERE external_id=?", [externalId]); const d = await db.get("SELECT id FROM product_attribute_definitions WHERE code=?", [code]); await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)", [p.id, d.id, type === "text" ? value : null, type === "number" ? value : null, type === "boolean" ? (value ? 1 : 0) : null, null, "before", "before"]); }
function allDefinitions() { return [...Object.entries(DATA.REUSABLE_DEFINITIONS).map(([code, d]) => ({ code, ...d })), ...DATA.NEW_DEFINITIONS]; }

async function main() {
  let passed = 0; const pass = name => { passed += 1; console.log(`PASS ${name}`); };
  assert.deepEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, []); assert.equal(ALL_MATS.length, 5); assert.equal(CONFIRM, "BACKFILL_BETONCONTACT_CORE_BATCH1"); pass("exact five-MAT allowlist and zero products writable fields");
  assert.throws(() => parseArgs(["--db", "x"]), /--only/); assert.throws(() => parseArgs(["--db", "x", "--only", ALL_MATS[0], "--apply", "--confirm", "WRONG"]), /BACKFILL_BETONCONTACT_CORE_BATCH1/); pass("argument and confirmation guards");

  const file = tempFile("dry.db"); const db = await fixture(file); const before = sha(file); const dry = await inspectBatch(db, { only: ALL_MATS });
  assert.equal(dry.summary.total, 5); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0); assert.ok(dry.summary.willAdd > 0); assert.ok(dry.summary.needsSource > 0); assert.ok(dry.summary.definitionsToCreate > 0); assert.equal(sha(file), before); pass("five-target dry-run is read-only with runtime definition planning");
  const star = dry.rows.find(r => r.externalId === "MAT-000221"); assert.equal(star.specs.find(i => i.code === "application_method").value, "Валик или кисть"); assert.equal(star.specs.find(i => i.code === "application_method").status, "WILL_ADD"); pass("official method fact is writable only for source-confirmed product");
  const outside = await inspectBatch(db, { only: ["MAT-000222"] }); assert.equal(outside.summary.errors, 1); pass("exact --only scope rejects excluded MAT"); await db.close();

  const applyFile = tempFile("apply.db"); const applyDb = await fixture(applyFile); const immutableBefore = await applyDb.get("SELECT brand,slug,price,weight,unit,description,full_description,seo_title,image_url,stock_status FROM products WHERE external_id=?", ["MAT-000217"]); const applied = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(applied.summary.errors, 0); assert.ok(applied.writes > 0); const immutableAfter = await applyDb.get("SELECT brand,slug,price,weight,unit,description,full_description,seo_title,image_url,stock_status FROM products WHERE external_id=?", ["MAT-000217"]); assert.deepEqual(immutableAfter, immutableBefore); assert.equal((await applyDb.get("SELECT COUNT(*) n FROM product_attribute_values")).n > 0, true); pass("apply writes definitions/attribute values only and preserves product columns");
  const repeat = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(repeat.writes, 0); assert.equal(repeat.summary.willAdd, 0); assert.ok(repeat.summary.existingOk > 0); pass("repeat apply is idempotent and reaches stable EXISTING_OK"); await applyDb.close();

  const existingFile = tempFile("existing.db"); const existingDb = await fixture(existingFile, allDefinitions()); await addValue(existingDb, "MAT-000217", "brand", "KNAUF"); await addValue(existingDb, "MAT-000217", "package_weight", 5, "number"); const existingPlan = await inspectBatch(existingDb, { only: ["MAT-000217"] }); assert.equal(existingPlan.rows[0].specs.find(i => i.code === "brand").status, "EXISTING_OK"); assert.equal(existingPlan.rows[0].specs.find(i => i.code === "package_weight").status, "EXISTING_OK"); pass("correct existing values are EXISTING_OK");
  await existingDb.run("UPDATE product_attribute_values SET value_text='other' WHERE id=(SELECT v.id FROM product_attribute_values v JOIN products p ON p.id=v.product_id JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id='MAT-000217' AND d.code='brand')"); const conflict = await inspectBatch(existingDb, { only: ["MAT-000217"] }); assert.equal(conflict.rows[0].specs.find(i => i.code === "brand").status, "VALUE_CONFLICT"); assert.equal(conflict.summary.valueConflict, 1); await existingDb.close(); pass("different existing attribute value blocks overwrite");

  const titleFile = tempFile("title.db"); const titleDb = await fixture(titleFile); await titleDb.run("UPDATE products SET title='wrong' WHERE external_id=?", ["MAT-000217"]); const titlePlan = await inspectBatch(titleDb, { only: ["MAT-000217"] }); assert.equal(titlePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); await titleDb.close(); pass("exact title guard blocks mismatch");
  const categoryFile = tempFile("category.db"); const categoryDb = await fixture(categoryFile); await categoryDb.run("UPDATE products SET category=? WHERE external_id=?", ["Грунтовка", "MAT-000217"]); const categoryPlan = await inspectBatch(categoryDb, { only: ["MAT-000217"] }); assert.equal(categoryPlan.rows[0].status, "TITLE_GUARD_BLOCKED"); await categoryDb.close(); pass("Грунтовка category is rejected");
  const subFile = tempFile("subcategory.db"); const subDb = await fixture(subFile); await subDb.run("UPDATE products SET subcategory=? WHERE external_id=?", ["Грунтовка", "MAT-000217"]); const subPlan = await inspectBatch(subDb, { only: ["MAT-000217"] }); assert.equal(subPlan.rows[0].status, "TITLE_GUARD_BLOCKED"); await subDb.close(); pass("subcategory mismatch is rejected");
  const caseFile = tempFile("case.db"); const caseDb = await fixture(caseFile); await caseDb.run("UPDATE products SET category=?,subcategory=? WHERE external_id=?", [" грунт / бетонконтакт ", " БЕТОНКОНТАКТ ", "MAT-000217"]); const casePlan = await inspectBatch(caseDb, { only: ["MAT-000217"] }); assert.notEqual(casePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); await caseDb.close(); pass("normalized structure guard accepts case/whitespace only");

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = sha(rollbackFile); const failing = { ...rollbackDb, run(sql, params) { if (sql.startsWith("INSERT INTO product_attribute_values")) return Promise.reject(new Error("injected rollback")); return rollbackDb.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, rollbackFile, { only: ["MAT-000217"], confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(sha(rollbackFile), rollbackBefore); assert.equal((await rollbackDb.get("SELECT COUNT(*) n FROM product_attribute_values")).n, 0); assert.equal((await rollbackDb.get("SELECT COUNT(*) n FROM product_attribute_definitions")).n, 0); await rollbackDb.close(); pass("backup precedes mutation and rollback restores definitions and values");
  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
