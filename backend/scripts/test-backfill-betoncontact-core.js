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
function canonical() { return ALL_MATS.join(","); }
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
function row(plan, id) { return plan.rows.find(item => item.externalId === id); }

async function main() {
  let passed = 0; const pass = name => { passed += 1; console.log(`PASS ${name}`); };
  assert.deepEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, []); assert.equal(ALL_MATS.length, 5); assert.equal(CONFIRM, "BACKFILL_BETONCONTACT_CORE_BATCH1"); pass("exact five-MAT allowlist and zero products writable fields");
  const exact = parseArgs(["--db", "x", "--only", ` ${ALL_MATS[0]}, ${ALL_MATS[1]},${ALL_MATS[2]},${ALL_MATS[3]},${ALL_MATS[4]} `]); assert.deepEqual(exact.only, ALL_MATS); pass("parseArgs exact canonical five MATs passes with whitespace normalization");
  assert.throws(() => parseArgs(["--db", "x", "--only", ALL_MATS.slice(0, 4).join(",")]), /Exact batch required/); pass("parseArgs subset rejected");
  assert.throws(() => parseArgs(["--db", "x", "--only", `${canonical()},MAT-000225`]), /Exact batch required/); pass("parseArgs superset rejected");
  assert.throws(() => parseArgs(["--db", "x", "--only", `${ALL_MATS[0]},${ALL_MATS[0]},${ALL_MATS[1]},${ALL_MATS[2]},${ALL_MATS[3]}`]), /Exact batch required/); pass("parseArgs duplicate rejected");
  assert.throws(() => parseArgs(["--db", "x", "--only", "MAT-000222,MAT-000223,MAT-000224,MAT-000225,MAT-000217"]), /Exact batch required/); pass("parseArgs excluded MATs rejected");

  const dryFile = tempFile("dry.db"); const dryDb = await fixture(dryFile); const before = sha(dryFile); const dry = await inspectBatch(dryDb, { only: ALL_MATS });
  assert.equal(dry.summary.total, 5); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0); assert.equal(dry.summary.logicalSlots, 75); assert.equal(dry.summary.willAdd, 67); assert.equal(dry.summary.needsSource, 8); assert.equal(dry.summary.valueConflict, 0); assert.ok(dry.summary.definitionsToCreate > 0); assert.equal(sha(dryFile), before); pass("full five-target dry-run is read-only with expected totals");
  await assert.rejects(() => inspectBatch(dryDb, { only: ALL_MATS.slice(0, 1) }), /Exact batch required/); pass("direct inspectBatch subset rejected");
  await assert.rejects(() => inspectBatch(dryDb, { only: ["MAT-000222", ...ALL_MATS.slice(0, 4)] }), /Exact batch required/); pass("direct inspectBatch excluded MAT rejected");
  await assert.rejects(() => applyBatch(dryDb, dryFile, { only: ALL_MATS.slice(0, 1), confirm: CONFIRM, backupDir: path.dirname(dryFile) }), /Exact batch required/); pass("direct applyBatch subset rejected"); await dryDb.close();

  const applyFile = tempFile("apply.db"); const applyDb = await fixture(applyFile); const immutableBefore = await applyDb.get("SELECT brand,slug,price,weight,unit,description,full_description,seo_title,image_url,stock_status FROM products WHERE external_id=?", ["MAT-000217"]); const applied = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(applied.summary.errors, 0); assert.ok(applied.writes > 0); const immutableAfter = await applyDb.get("SELECT brand,slug,price,weight,unit,description,full_description,seo_title,image_url,stock_status FROM products WHERE external_id=?", ["MAT-000217"]); assert.deepEqual(immutableAfter, immutableBefore); const repeat = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(repeat.writes, 0); assert.equal(repeat.summary.willAdd, 0); assert.ok(repeat.summary.existingOk > 0); pass("full five-target apply preserves product columns and is idempotent"); await applyDb.close();

  const existingFile = tempFile("existing.db"); const existingDb = await fixture(existingFile, allDefinitions()); await addValue(existingDb, "MAT-000217", "brand", "KNAUF"); await addValue(existingDb, "MAT-000217", "package_weight", 5, "number"); const existingPlan = await inspectBatch(existingDb, { only: ALL_MATS }); assert.equal(row(existingPlan, "MAT-000217").specs.find(i => i.code === "brand").status, "EXISTING_OK"); assert.equal(row(existingPlan, "MAT-000217").specs.find(i => i.code === "package_weight").status, "EXISTING_OK"); pass("correct existing values are EXISTING_OK in full batch");
  await existingDb.run("UPDATE product_attribute_values SET value_text='other' WHERE id=(SELECT v.id FROM product_attribute_values v JOIN products p ON p.id=v.product_id JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id='MAT-000217' AND d.code='brand')"); const conflict = await inspectBatch(existingDb, { only: ALL_MATS }); assert.equal(row(conflict, "MAT-000217").specs.find(i => i.code === "brand").status, "VALUE_CONFLICT"); assert.equal(conflict.summary.valueConflict, 1); await existingDb.close(); pass("different existing value is reported as conflict in full batch");

  for (const [name, change, expected] of [["exact title guard", db => db.run("UPDATE products SET title='wrong' WHERE external_id=?", ["MAT-000217"]), "TITLE_GUARD_BLOCKED"], ["Грунтовка category rejection", db => db.run("UPDATE products SET category=? WHERE external_id=?", ["Грунтовка", "MAT-000217"]), "TITLE_GUARD_BLOCKED"], ["subcategory rejection", db => db.run("UPDATE products SET subcategory=? WHERE external_id=?", ["Грунтовка", "MAT-000217"]), "TITLE_GUARD_BLOCKED"]]) { const file = tempFile("guard.db"); const db = await fixture(file); await change(db); const plan = await inspectBatch(db, { only: ALL_MATS }); assert.equal(row(plan, "MAT-000217").status, expected); await db.close(); pass(name); }
  const caseFile = tempFile("case.db"); const caseDb = await fixture(caseFile); await caseDb.run("UPDATE products SET category=?,subcategory=? WHERE external_id=?", [" грунт / бетонконтакт ", " БЕТОНКОНТАКТ ", "MAT-000217"]); const casePlan = await inspectBatch(caseDb, { only: ALL_MATS }); assert.notEqual(row(casePlan, "MAT-000217").status, "TITLE_GUARD_BLOCKED"); await caseDb.close(); pass("normalized structure guard accepts case/whitespace only");

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = sha(rollbackFile); const failing = { ...rollbackDb, run(sql, params) { if (sql.startsWith("INSERT INTO product_attribute_values")) return Promise.reject(new Error("injected rollback")); return rollbackDb.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, rollbackFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(sha(rollbackFile), rollbackBefore); assert.equal((await rollbackDb.get("SELECT COUNT(*) n FROM product_attribute_values")).n, 0); assert.equal((await rollbackDb.get("SELECT COUNT(*) n FROM product_attribute_definitions")).n, 0); await rollbackDb.close(); pass("full-batch rollback restores definitions and values");
  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
