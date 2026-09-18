"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, parseArgs } = require("./backfill-primer-core-batch1");

function wrap(raw) {
  return {
    run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
    get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
    all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
    close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
  };
}

function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-primer-batch1-")), name); }
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
async function scalar(db, sql, params = []) { return Number((await db.get(sql, params)).n); }

async function fixture(file, { definitions = [] } = {}) {
  const db = wrap(new sqlite3.Database(file));
  await db.run("PRAGMA foreign_keys=ON");
  await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT UNIQUE NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER DEFAULT 1,updated_at TEXT,deleted_at TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image_url TEXT,stock_status TEXT NOT NULL DEFAULT 'unknown')");
  await db.run("CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL,label TEXT NOT NULL,data_type TEXT NOT NULL,default_unit TEXT,default_section TEXT,sort_order INTEGER NOT NULL DEFAULT 0,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT,updated_at TEXT)");
  await db.run("CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,attribute_definition_id INTEGER NOT NULL,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT,updated_at TEXT)");
  for (const def of definitions) await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [def.code || Object.entries(DATA.REUSABLE_DEFINITIONS).find(([, value]) => value === def)?.[0], def.label, def.dataType, def.defaultUnit, "Характеристики", 0, 1, "before", "before"]);
  for (const item of DATA.PRODUCTS) await db.run("INSERT INTO products(external_id,title,category,subcategory,weight,price,brand,full_description,seo_title,image_url,is_active,deleted_at,updated_at,stock_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [item.externalId, item.expectedTitle, item.expectedCategory, item.expectedSubcategory, 1, 100, null, "keep full", "keep seo", "/keep.jpg", 1, null, "before", "in_stock"]);
  return db;
}

async function addValue(db, externalId, code, value, type = "text") {
  const product = await db.get("SELECT id FROM products WHERE external_id=?", [externalId]); const def = await db.get("SELECT id FROM product_attribute_definitions WHERE code=?", [code]);
  await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)", [product.id, def.id, type === "text" ? value : null, type === "number" ? value : null, type === "boolean" ? (value ? 1 : 0) : null, 0, "before", "before"]);
}

async function main() {
  let passed = 0; const pass = name => { passed += 1; console.log(`PASS ${name}`); };
  assert.deepEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, ["brand"]); assert.equal(ALL_MATS.length, 11); assert.equal(CONFIRM, "BACKFILL_PRIMER_CORE_BATCH1"); pass("exact allowlist and writable product surface");
  assert.throws(() => parseArgs(["--db", "x"]), /--only/); assert.throws(() => parseArgs(["--db", "x", "--only", ALL_MATS[0], "--apply", "--confirm", "WRONG"]), /BACKFILL_PRIMER_CORE_BATCH1/); pass("argument and apply confirmation guards");

  const emptyFile = tempFile("empty.db"); const emptyDb = await fixture(emptyFile); const before = sha(emptyFile); const dry = await inspectBatch(emptyDb, { only: ALL_MATS });
  assert.equal(dry.summary.total, 11); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0); assert.ok(dry.summary.willAdd > 0); assert.ok(dry.summary.definitionsToCreate > 0); assert.equal(sha(emptyFile), before); pass("full dry-run is read-only and resolves missing definitions at runtime");
  const first = dry.rows.find(row => row.externalId === "MAT-000227"); assert.equal(first.specs.find(item => item.code === "package_weight").value, 5); assert.equal(first.specs.find(item => item.code === "package_volume").status, "NEEDS_SOURCE"); assert.equal(first.specs.find(item => item.code === "package_volume").value, null); pass("kg/l discrepancy never converts or backfills volume from title");
  const outside = await inspectBatch(emptyDb, { only: ["MAT-000226"] }); assert.equal(outside.summary.errors, 1); pass("exact --only scope rejects outside MAT"); await emptyDb.close();

  const applyFile = tempFile("apply.db"); const applyDb = await fixture(applyFile); const applied = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(applied.summary.errors, 0); assert.equal(applied.summary.titleGuardBlocked, 0); assert.equal((await applyDb.get("SELECT brand FROM products WHERE external_id=?", ["MAT-000227"])).brand, "KNAUF"); assert.equal((await applyDb.get("SELECT full_description,seo_title,image_url,price,weight,stock_status FROM products WHERE external_id=?", ["MAT-000227"])).full_description, "keep full"); pass("apply writes only brand/core targets and preserves content, price, weight, stock, image");
  const repeat = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(repeat.writes, 0); pass("repeat apply is idempotent"); await applyDb.close();

  const reuseFile = tempFile("reuse.db"); const reuseDb = await fixture(reuseFile, { definitions: [DATA.REUSABLE_DEFINITIONS.brand, DATA.REUSABLE_DEFINITIONS.product_type, DATA.REUSABLE_DEFINITIONS.base, DATA.REUSABLE_DEFINITIONS.purpose, DATA.REUSABLE_DEFINITIONS.package_weight, DATA.REUSABLE_DEFINITIONS.application_temperature, DATA.REUSABLE_DEFINITIONS.shelf_life, ...DATA.NEW_DEFINITIONS] }); const reusePlan = await inspectBatch(reuseDb, { only: ["MAT-000227"] }); assert.equal(reusePlan.summary.definitionsToCreate, 0); pass("existing compatible definitions are reused");
  await addValue(reuseDb, "MAT-000227", "brand", "KNAUF"); const samePlan = await inspectBatch(reuseDb, { only: ["MAT-000227"] }); assert.equal(samePlan.rows[0].brand.attributeStatus, "EXISTING_OK"); pass("existing same value is EXISTING_OK");
  await reuseDb.run("UPDATE product_attribute_values SET value_text='Other' WHERE id=(SELECT v.id FROM product_attribute_values v JOIN products p ON p.id=v.product_id JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id='MAT-000227' AND d.code='brand')"); const conflictPlan = await inspectBatch(reuseDb, { only: ["MAT-000227"] }); assert.equal(conflictPlan.summary.brandConflict, 1); assert.equal(conflictPlan.rows[0].brand.status, "BRAND_CONFLICT"); await reuseDb.close(); pass("existing different brand attribute is BRAND_CONFLICT");

  const productBrandFile = tempFile("product-brand-conflict.db"); const productBrandDb = await fixture(productBrandFile, { definitions: [DATA.REUSABLE_DEFINITIONS.brand] }); await productBrandDb.run("UPDATE products SET brand='Other' WHERE external_id=?", ["MAT-000227"]); const productBrandPlan = await inspectBatch(productBrandDb, { only: ["MAT-000227"] }); assert.equal(productBrandPlan.summary.brandConflict, 1); assert.equal(productBrandPlan.rows[0].brand.productColumnStatus, "BRAND_CONFLICT"); await assert.rejects(() => applyBatch(productBrandDb, productBrandFile, { only: ["MAT-000227"], confirm: CONFIRM, backupDir: path.dirname(productBrandFile) }), /preflight guard/); await productBrandDb.close(); pass("existing different products.brand is BRAND_CONFLICT and blocks apply");

  const schemaFile = tempFile("schema.db"); const schemaDb = await fixture(schemaFile, { definitions: [DATA.REUSABLE_DEFINITIONS.brand, { ...DATA.NEW_DEFINITIONS.find(def => def.code === "package_volume"), dataType: "text" }] }); const schemaPlan = await inspectBatch(schemaDb, { only: ["MAT-000231"] }); assert.equal(schemaPlan.rows[0].specs.find(item => item.code === "package_volume").status, "SCHEMA_BLOCKED"); await schemaDb.close(); pass("incompatible definition type is SCHEMA_BLOCKED");

  const titleFile = tempFile("title.db"); const titleDb = await fixture(titleFile); await titleDb.run("UPDATE products SET title='wrong' WHERE external_id=?", ["MAT-000227"]); const titlePlan = await inspectBatch(titleDb, { only: ["MAT-000227"] }); assert.equal(titlePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(titlePlan.summary.titleGuardBlocked, 1); await assert.rejects(() => applyBatch(titleDb, titleFile, { only: ["MAT-000227"], confirm: CONFIRM, backupDir: path.dirname(titleFile) }), /preflight guard/); await titleDb.close(); pass("title guard blocks planning/apply without mutation");

  const categoryCaseFile = tempFile("category-case.db"); const categoryCaseDb = await fixture(categoryCaseFile); await categoryCaseDb.run("UPDATE products SET category=? WHERE external_id=?", ["Грунт / Бетонконтакт", "MAT-000227"]); const categoryCasePlan = await inspectBatch(categoryCaseDb, { only: ["MAT-000227"] }); assert.notEqual(categoryCasePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(categoryCasePlan.summary.titleGuardBlocked, 0); await categoryCaseDb.close(); pass("category guard accepts case-only Unicode differences");
  const categoryWhitespaceFile = tempFile("category-whitespace.db"); const categoryWhitespaceDb = await fixture(categoryWhitespaceFile); await categoryWhitespaceDb.run("UPDATE products SET category=?,subcategory=? WHERE external_id=?", ["  грунт   /   БЕТОНКОНТАКТ  ", "  ГРУНТОВКА  ", "MAT-000227"]); const categoryWhitespacePlan = await inspectBatch(categoryWhitespaceDb, { only: ["MAT-000227"] }); assert.notEqual(categoryWhitespacePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(categoryWhitespacePlan.summary.titleGuardBlocked, 0); await categoryWhitespaceDb.close(); pass("category guard collapses whitespace and ignores case");
  const wrongCategoryFile = tempFile("wrong-category.db"); const wrongCategoryDb = await fixture(wrongCategoryFile); await wrongCategoryDb.run("UPDATE products SET category=? WHERE external_id=?", ["Другая категория", "MAT-000227"]); const wrongCategoryPlan = await inspectBatch(wrongCategoryDb, { only: ["MAT-000227"] }); assert.equal(wrongCategoryPlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(wrongCategoryPlan.summary.titleGuardBlocked, 1); await wrongCategoryDb.close(); pass("real category mismatch remains blocked");
  const wrongSubcategoryFile = tempFile("wrong-subcategory.db"); const wrongSubcategoryDb = await fixture(wrongSubcategoryFile); await wrongSubcategoryDb.run("UPDATE products SET subcategory=? WHERE external_id=?", ["Другая подкатегория", "MAT-000227"]); const wrongSubcategoryPlan = await inspectBatch(wrongSubcategoryDb, { only: ["MAT-000227"] }); assert.equal(wrongSubcategoryPlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(wrongSubcategoryPlan.summary.titleGuardBlocked, 1); await wrongSubcategoryDb.close(); pass("subcategory mismatch remains blocked");
  const titleCaseFile = tempFile("title-case.db"); const titleCaseDb = await fixture(titleCaseFile); await titleCaseDb.run("UPDATE products SET title=? WHERE external_id=?", [DATA.PRODUCTS.find(item => item.externalId === "MAT-000227").expectedTitle.toLowerCase(), "MAT-000227"]); const titleCasePlan = await inspectBatch(titleCaseDb, { only: ["MAT-000227"] }); assert.equal(titleCasePlan.rows[0].status, "TITLE_GUARD_BLOCKED"); assert.equal(titleCasePlan.summary.titleGuardBlocked, 1); await titleCaseDb.close(); pass("exact title guard remains case-sensitive");

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = sha(rollbackFile); const failing = { ...rollbackDb, run(sql, params) { if (sql.startsWith("INSERT INTO product_attribute_values") && params?.[0] === 1) return Promise.reject(new Error("injected rollback")); return rollbackDb.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, rollbackFile, { only: ["MAT-000227"], confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(sha(rollbackFile), rollbackBefore); assert.equal(await scalar(rollbackDb, "SELECT COUNT(*) n FROM product_attribute_values"), 0); await rollbackDb.close(); pass("backup precedes mutation and rollback restores definitions and values");
  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
