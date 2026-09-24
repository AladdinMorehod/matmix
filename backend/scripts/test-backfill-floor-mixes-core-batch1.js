"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/floor-mixes-core-batch1");
const { ALL_MATS, CONFIRM, applyBatch, inspectBatch, openDatabase, parseArgs, PRODUCT_MUTABLE_FIELDS_EXACTLY } = require("./backfill-floor-mixes-core-batch1");

const tempFile = label => path.join(os.tmpdir(), `matmix-floor-mixes-${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const closeRaw = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));

async function createFixture(file) {
  const raw = new sqlite3.Database(file);
  await run(raw, "CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,image_url TEXT,brand TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,is_active INTEGER DEFAULT 1,deleted_at TEXT,stock_status TEXT DEFAULT 'unknown')");
  await run(raw, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT NOT NULL,label TEXT NOT NULL,data_type TEXT NOT NULL,default_unit TEXT,default_section TEXT,sort_order INTEGER DEFAULT 0,is_active INTEGER DEFAULT 1,created_at TEXT,updated_at TEXT)");
  await run(raw, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,attribute_definition_id INTEGER NOT NULL,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER DEFAULT 0,created_at TEXT,updated_at TEXT)");
  await run(raw, "CREATE TABLE product_images(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,image_url TEXT NOT NULL,sort_order INTEGER DEFAULT 0,is_primary INTEGER DEFAULT 0)");
  for (const [code, definition] of Object.entries(DATA.REUSABLE_DEFINITIONS)) if (!DATA.NEW_DEFINITIONS.some(item => item.code === code)) await run(raw, "INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active) VALUES(?,?,?,?,?,?,1)", [code, definition.label, definition.dataType, definition.defaultUnit, "Характеристики", 0]);
  for (const item of DATA.PRODUCTS) await run(raw, "INSERT INTO products(external_id,title,slug,category,subcategory,price,weight,unit,image_url,brand,full_description,seo_title,seo_description,is_active,deleted_at,stock_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [item.externalId, item.expectedTitle, `slug-${item.externalId}`, item.expectedCategory, item.expectedSubcategory, 100, 20, "шт", DATA.SHARED_PLACEHOLDER, null, "existing description", "existing seo title", "existing seo description", 1, null, "unknown"]);
  await run(raw, "INSERT INTO products(external_id,title,slug,category,subcategory,price,weight,unit,image_url,brand,full_description,seo_title,seo_description,is_active,deleted_at,stock_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", ["MAT-OTHER", "Other", "other", "Other", "Other", 321, 99, "шт", DATA.SHARED_PLACEHOLDER, "OTHER", "other description", "other seo", "other seo description", 1, null, "in_stock"]);
  await closeRaw(raw);
  return openDatabase(file, true);
}

function row(report, id) { return report.rows.find(item => item.externalId === id); }
function item(reportRow, code) { return [reportRow.brand, ...(reportRow.specs || [])].find(value => value.code === code); }

async function main() {
  let passed = 0; const pass = message => { passed += 1; console.log(`PASS ${message}`); };
  assert.deepEqual(parseArgs(["--db", "fixture.db", "--only", ALL_MATS.join(",")]).only, ALL_MATS);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", ALL_MATS.slice(0, 2).join(",")]), /Exact floor-mixes batch required/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS.join(",")},MAT-000091`]), /Exact floor-mixes batch required/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS[0]},${ALL_MATS[0]},${ALL_MATS.slice(1).join(",")}`]), /Exact floor-mixes batch required/);
  pass("exact immutable 15-MAT parse guard");

  const dryFile = tempFile("dry"); const dryDb = await createFixture(dryFile); const before = sha(dryFile); const dry = await inspectBatch(dryDb, { only: ALL_MATS });
  assert.equal(dry.summary.total, 15); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0); assert.equal(dry.summary.definitionsToCreate, 3); assert.equal(dry.summary.imageCleanupEligible, 15); assert.equal(dry.summary.brandConflict, 0); assert.equal(DATA.REUSABLE_DEFINITIONS.consumption_10mm.dataType, "text"); assert.equal(DATA.REUSABLE_DEFINITIONS.pot_life.dataType, "text"); assert.equal(DATA.REUSABLE_DEFINITIONS.pot_life.defaultUnit, null); assert.equal(item(row(dry, "MAT-000075"), "package_weight").status, "WILL_ADD"); assert.equal(item(row(dry, "MAT-000076"), "pot_life").value, "1 час"); assert.equal(item(row(dry, "MAT-000076"), "pot_life").definitionType, "text"); assert.equal(item(row(dry, "MAT-000077"), "layer_thickness").status, "NEEDS_SOURCE"); assert.equal(item(row(dry, "MAT-000090"), "package_weight").value, 25); assert.equal(sha(dryFile), before); assert.equal(PRODUCT_MUTABLE_FIELDS_EXACTLY.join(","), "brand,image_url"); pass("read-only dry-run preserves DB and accepts canonical text definitions"); await dryDb.close();

  const applyFile = tempFile("apply"); const applyDb = await createFixture(applyFile); const unrelatedBefore = (await applyDb.all("SELECT * FROM products WHERE external_id=?", ["MAT-OTHER"]))[0]; const applied = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, cleanupSharedPlaceholder: true, backupDir: path.dirname(applyFile) });
  assert.equal(applied.summary.errors, 0); assert.equal(applied.summary.imageCleanupEligible, 0); assert.equal((await applyDb.get("SELECT COUNT(*) AS n FROM product_attribute_definitions WHERE code IN ('consumption','flexural_strength','walkability')")).n, 3); assert.equal((await applyDb.get("SELECT COUNT(*) AS n FROM products WHERE brand IS NULL")).n, 0); assert.equal((await applyDb.get("SELECT COUNT(*) AS n FROM products WHERE image_url IS NULL")).n, 15); assert.deepEqual((await applyDb.all("SELECT * FROM products WHERE external_id=?", ["MAT-OTHER"]))[0], unrelatedBefore); const stable = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, cleanupSharedPlaceholder: true, backupDir: path.dirname(applyFile) }); assert.equal(stable.writes, 0); assert.equal(stable.summary.errors, 0); pass("guarded apply, exact placeholder cleanup and idempotent repeat"); await applyDb.close();

  const conflictFile = tempFile("conflict"); const conflictDb = await createFixture(conflictFile); await conflictDb.run("UPDATE products SET brand=? WHERE external_id=?", ["Other", "MAT-000076"]); const conflict = await inspectBatch(conflictDb, { only: ALL_MATS }); assert.equal(row(conflict, "MAT-000076").status, "PARTIAL"); assert.equal(conflict.summary.brandConflict, 1); await assert.rejects(() => applyBatch(conflictDb, conflictFile, { only: ALL_MATS, confirm: CONFIRM, cleanupSharedPlaceholder: true, backupDir: path.dirname(conflictFile) }), /preflight guard/); await conflictDb.close(); pass("different existing brand blocks apply");

  const titleFile = tempFile("title"); const titleDb = await createFixture(titleFile); await titleDb.run("UPDATE products SET title=? WHERE external_id=?", ["wrong", "MAT-000078"]); const title = await inspectBatch(titleDb, { only: ALL_MATS }); assert.equal(row(title, "MAT-000078").status, "TITLE_GUARD_BLOCKED"); await assert.rejects(() => applyBatch(titleDb, titleFile, { only: ALL_MATS, confirm: CONFIRM, cleanupSharedPlaceholder: true, backupDir: path.dirname(titleFile) }), /preflight guard/); await titleDb.close(); pass("exact title guard blocks mismatch");

  const categoryFile = tempFile("category"); const categoryDb = await createFixture(categoryFile); await categoryDb.run("UPDATE products SET subcategory=? WHERE external_id=?", ["Другая категория", "MAT-000079"]); await assert.rejects(() => inspectBatch(categoryDb, { only: ALL_MATS }), /Discovery scope mismatch/); await categoryDb.close(); pass("category/subcategory scope guard blocks mismatch");

  const rollbackFile = tempFile("rollback"); const rollbackDb = await createFixture(rollbackFile); await rollbackDb.run("CREATE TRIGGER fail_second_brand BEFORE UPDATE OF brand ON products WHEN NEW.external_id='MAT-000076' BEGIN SELECT RAISE(ABORT, 'forced floor core failure'); END;"); await assert.rejects(() => applyBatch(rollbackDb, rollbackFile, { only: ALL_MATS, confirm: CONFIRM, cleanupSharedPlaceholder: true, backupDir: path.dirname(rollbackFile) }), /forced floor core failure/); assert.equal((await rollbackDb.get("SELECT brand FROM products WHERE external_id=?", ["MAT-000075"])).brand, null); assert.equal((await rollbackDb.get("SELECT COUNT(*) AS n FROM product_attribute_definitions WHERE code='walkability'")).n, 0); assert.equal((await rollbackDb.get("SELECT image_url FROM products WHERE external_id=?", ["MAT-000075"])).image_url, DATA.SHARED_PLACEHOLDER); await rollbackDb.close(); pass("transaction rollback restores definitions, brands and placeholders");

  console.log(`PASS ${passed} test groups`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
