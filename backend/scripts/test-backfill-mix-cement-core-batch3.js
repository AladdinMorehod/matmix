"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-cement-core-batch3");
const DATA = require("./data/mix-cement-core-batch3");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mix-cement-core-batch3-"));
const ALL = DATA.BATCH_MATS;
const now = "2026-10-03T00:00:00.000Z";
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const open = file => new sqlite3.Database(file);
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const get = (db, sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
const close = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));

async function createFixture(name, options = {}) {
  const file = path.join(tempRoot, `${name}.db`);
  const db = open(file);
  try {
    await run(db, "PRAGMA user_version=11");
    await run(db, "CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER)");
    await run(db, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,brand TEXT,price REAL,weight REAL,unit TEXT,category TEXT,subcategory TEXT,product_group TEXT,stock_status TEXT,description TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image TEXT,image_url TEXT,is_active INTEGER,deleted_at TEXT,updated_at TEXT)`);
    await run(db, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT UNIQUE,label TEXT,data_type TEXT,default_unit TEXT,is_active INTEGER,sort_order INTEGER)");
    await run(db, "CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,unit_override TEXT)");
    await run(db, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT)");
    await run(db, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
    await run(db, "INSERT INTO catalog_structure VALUES(12,1,'subcategory','Цемент',1)");
    for (const [index, [code, definition]] of Object.entries(DATA.DEFINITIONS).entries()) {
      await run(db, "INSERT INTO product_attribute_definitions VALUES(?,?,?,?,?,1,?)", [index + 1, code, code, definition.dataType, definition.unit, index]);
    }
    for (const [index, config] of DATA.PRODUCTS.entries()) {
      const title = config.externalId === options.titleMismatch ? `${config.expectedTitle} изменён`
        : config.externalId === options.titleOverride?.externalId ? options.titleOverride.title : config.expectedTitle;
      const category = config.externalId === options.categoryMismatch ? "Другая категория" : "Смеси";
      const subcategory = config.externalId === options.subcategoryMismatch ? "Пескобетон" : "Цемент";
      const brand = config.externalId === options.brandConflict ? "Другой бренд" : null;
      const weight = config.externalId === options.weightMismatch ? Number(config.core.package_weight.value) + 1 : Number(config.core.package_weight.value);
      await run(db, "INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [113 + index, config.externalId, title, `slug-${config.externalId}`, brand, 100 + index, weight, "шт", category, subcategory, "Цемент", "unknown", "legacy-description", null, null, null, null, "", "/uploads/products/shared-placeholder.png", 1, null, now]);
    }
    await run(db, "INSERT INTO products VALUES(999,'MAT-OTHER','Other','other','Keep',1,1,'шт','Other','Other','Other','unknown','d',NULL,NULL,NULL,NULL,'','/other.png',1,NULL,?)", [now]);
    await run(db, "INSERT INTO product_images VALUES(1,999,'/keep.webp')");
    if (options.valueConflict) {
      const config = DATA.PRODUCTS.find(item => item.externalId === options.valueConflict.externalId);
      const definition = await get(db, "SELECT id,data_type,default_unit FROM product_attribute_definitions WHERE code=?", [options.valueConflict.code]);
      await run(db, "INSERT INTO product_attribute_values VALUES(1,?,?,?,?,?,?,0,?,?)", [113 + DATA.PRODUCTS.indexOf(config), definition.id, "unexpected", null, null, definition.default_unit, now, now]);
    }
    if (options.trigger) {
      const config = DATA.PRODUCTS.find(item => item.externalId === options.trigger.externalId);
      const definition = await get(db, "SELECT id FROM product_attribute_definitions WHERE code=?", [options.trigger.code]);
      await run(db, `CREATE TRIGGER fail_insert BEFORE INSERT ON product_attribute_values WHEN NEW.product_id=${113 + DATA.PRODUCTS.indexOf(config)} AND NEW.attribute_definition_id=${definition.id} BEGIN SELECT RAISE(ABORT,'fixture rollback'); END`);
    }
  } finally { await close(db); }
  return file;
}

async function snapshot(db) {
  const out = {};
  for (const table of ["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) out[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
  return out;
}
const row = (report, mat) => report.rows.find(item => item.externalId === mat);
const spec = (reportRow, code) => reportRow.specs.find(item => item.code === code);

async function main() {
  let passed = 0; const pass = label => { passed += 1; console.log(`PASS ${label}`); };
  assert.deepStrictEqual(ALL, ["MAT-000113", "MAT-000114", "MAT-000115"]);
  assert.deepStrictEqual(DATA.PRODUCTS.map(item => item.externalId), ALL);
  assert.equal(RUNNER.validateData(), true);
  assert.deepStrictEqual(RUNNER.parseArgs(["--db", "fixture.db", "--only", ALL.join(",")]).only, ALL);
  for (const invalid of [ALL[0], `${ALL.join(",")},MAT-000116`, `${ALL[0]},${ALL[0]}`]) assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", invalid]), /Exact batch required/);
  await assert.rejects(() => RUNNER.inspectBatch({}, { only: [ALL[0]] }), /Exact batch required/);
  await assert.rejects(() => RUNNER.applyBatch({}, "fixture.db", { only: [ALL[0]], confirm: RUNNER.CONFIRM, backupDir: tempRoot }), /Exact batch required/);
  pass("exact three-MAT allowlist and source-status matrix validated");

  const dryFile = await createFixture("dry");
  const dryDb = await RUNNER.openDatabase(dryFile, false);
  const before = await snapshot(dryDb); const beforeHash = sha(dryFile);
  const dry = await RUNNER.inspectBatch(dryDb, { only: ALL });
  assert.equal(DATA.PRODUCTS.find(item => item.externalId === "MAT-000114").expectedTitle, 'Цемент "РосЦемент" 50кг');
  assert.equal(row(dry, "MAT-000114").status, "PARTIAL", "the exact current MAT-000114 title must pass its title guard");
  assert.equal(dry.summary.total, 3);
  assert.equal(dry.summary.logicalSlots, 69);
  assert.equal(dry.summary.ready, 18);
  assert.equal(dry.summary.willAdd, 18);
  assert.equal(dry.summary.existingOk, 0);
  assert.equal(dry.summary.sourceConflict, 0);
  assert.equal(dry.summary.needsMapping, 4);
  assert.equal(dry.summary.notAvailable, 47);
  assert.equal(dry.summary.plannedBrandUpdates, 3);
  assert.equal(dry.summary.schemaBlocked, 0);
  assert.equal(dry.summary.valueConflict, 0);
  assert.equal(dry.summary.brandConflict, 0);
  assert.equal(dry.summary.titleGuardBlocked, 0);
  assert.equal(dry.summary.errors, 0);
  assert.equal(dry.summary.definitionsToCreate, 0);
  assert.equal(dry.summary.templateMembershipChanges, 0);
  assert.equal(dry.summary.identityConfirmedProducts, 3);
  assert.equal(dry.summary.partialProducts, 3);
  assert.equal(spec(row(dry, "MAT-000113"), "compressive_strength").status, "NEEDS_MAPPING");
  assert.equal(spec(row(dry, "MAT-000113"), "shelf_life").sourceValue, "60");
  assert.equal(spec(row(dry, "MAT-000114"), "mortar_grade").status, "NEEDS_MAPPING");
  assert.equal(spec(row(dry, "MAT-000114"), "standard").status, "NEEDS_MAPPING");
  assert.equal(spec(row(dry, "MAT-000115"), "compressive_strength").value, 42.5);
  assert.equal(spec(row(dry, "MAT-000115"), "standard").value, "ГОСТ 31108-2020");
  assert.deepStrictEqual(await snapshot(dryDb), before);
  assert.equal(sha(dryFile), beforeHash, "dry-run must leave fixture DB bytes unchanged");
  await dryDb.close();
  pass("schema-v11 dry-run is immutable and exposes exact source gaps");

  const oldCaseFile = await createFixture("old-title-case", { titleOverride: { externalId: "MAT-000114", title: 'Цемент "Росцемент" 50кг' } });
  const oldCaseDb = await RUNNER.openDatabase(oldCaseFile, false);
  const oldCase = await RUNNER.inspectBatch(oldCaseDb, { only: ALL });
  assert.equal(row(oldCase, "MAT-000114").status, "TITLE_GUARD_BLOCKED", "the previous capitalization must not be accepted by the exact title guard");
  assert.equal(oldCase.summary.titleGuardBlocked, 1);
  await oldCaseDb.close();
  pass("MAT-000114 exact production title passes while prior capitalization remains blocked");

  for (const [name, option] of [["title", { titleMismatch: ALL[1] }], ["category", { categoryMismatch: ALL[2] }], ["subcategory", { subcategoryMismatch: ALL[1] }], ["weight", { weightMismatch: ALL[2] }]]) {
    const file = await createFixture(name, option); const db = await RUNNER.openDatabase(file, false);
    assert.equal(row(await RUNNER.inspectBatch(db, { only: ALL }), option.titleMismatch || option.categoryMismatch || option.subcategoryMismatch || option.weightMismatch).status, "TITLE_GUARD_BLOCKED");
    await db.close();
  }
  const conflictFile = await createFixture("conflict", { valueConflict: { externalId: "MAT-000115", code: "color" } });
  const conflictDb = await RUNNER.openDatabase(conflictFile, false);
  assert.equal(spec(row(await RUNNER.inspectBatch(conflictDb, { only: ALL }), "MAT-000115"), "color").status, "VALUE_CONFLICT");
  await conflictDb.close();
  const brandFile = await createFixture("brand", { brandConflict: "MAT-000114" });
  const brandDb = await RUNNER.openDatabase(brandFile, false);
  assert.equal(row(await RUNNER.inspectBatch(brandDb, { only: ALL }), "MAT-000114").status, "BLOCKED");
  await brandDb.close();
  pass("exact title/category/subcategory/weight and existing-value/brand guards block unsafe writes");

  const applyFile = await createFixture("apply"); const applyDb = await RUNNER.openDatabase(applyFile, true);
  const beforeApply = await snapshot(applyDb);
  const applied = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "backup") });
  assert.equal(applied.summary.willAdd, 0); assert.equal(applied.summary.existingOk, 18); assert.equal(applied.writes, 21); assert.equal(applied.backup.verified, true);
  const afterApply = await snapshot(applyDb);
  const expectedProducts = beforeApply.products.map(product => {
    const config = DATA.PRODUCTS.find(item => item.externalId === product.external_id);
    return config ? { ...product, brand: config.brand } : product;
  });
  assert.deepStrictEqual(afterApply.products, expectedProducts);
  assert.deepStrictEqual(afterApply.product_attribute_definitions, beforeApply.product_attribute_definitions);
  assert.deepStrictEqual(afterApply.product_attribute_templates, beforeApply.product_attribute_templates);
  assert.deepStrictEqual(afterApply.product_images, beforeApply.product_images);
  assert.equal(afterApply.product_attribute_values.length - beforeApply.product_attribute_values.length, 18);
  assert.equal(afterApply.products.find(item => item.external_id === "MAT-OTHER").brand, "Keep");
  const again = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "backup") });
  assert.equal(again.writes, 0); assert.deepStrictEqual(await snapshot(applyDb), afterApply);
  await applyDb.close();
  pass("disposable apply writes only 18 READY attributes and 3 brands; backup and idempotency pass");

  const rollbackFile = await createFixture("rollback", { trigger: { externalId: "MAT-000115", code: "standard" } });
  const rollbackDb = await RUNNER.openDatabase(rollbackFile, true); const rollbackBefore = await snapshot(rollbackDb);
  await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "rollback-backup") }), /fixture rollback/);
  assert.deepStrictEqual(await snapshot(rollbackDb), rollbackBefore); await rollbackDb.close();
  pass("transaction rollback removes all writes after an injected local fixture failure");

  const runnerText = fs.readFileSync(path.join(__dirname, "backfill-mix-cement-core-batch3.js"), "utf8");
  assert.match(runnerText, /UPDATE products SET brand=/);
  assert.match(runnerText, /INSERT INTO product_attribute_values/);
  assert.doesNotMatch(runnerText, /UPDATE products SET (?!brand=)/);
  assert.doesNotMatch(runnerText, /(?:INSERT|UPDATE|DELETE|REPLACE)\s+INTO?\s+product_attribute_(?:definitions|templates)/i);
  assert.doesNotMatch(runnerText, /(?:DELETE|REPLACE)\s+FROM\s+product_attribute_values/i);
  console.log(JSON.stringify({ success: true, exactScope: true, dryRunImmutable: true, threeIdentitiesConfirmedAtProductLevel: true, unknownPlantAndUnreadableGradePreserved: true, applyRollbackIdempotent: true, definitionsAndTemplatesNeverWritten: true, dryRunSummary: { total: dry.summary.total, logicalSlots: dry.summary.logicalSlots, ready: dry.summary.ready, willAdd: dry.summary.willAdd, existingOk: dry.summary.existingOk, sourceConflict: dry.summary.sourceConflict, needsMapping: dry.summary.needsMapping, notAvailable: dry.summary.notAvailable, plannedBrandUpdates: dry.summary.plannedBrandUpdates, schemaBlocked: dry.summary.schemaBlocked, valueConflict: dry.summary.valueConflict, brandConflict: dry.summary.brandConflict, titleGuardBlocked: dry.summary.titleGuardBlocked, errors: dry.summary.errors } }, null, 2));
  console.log(`PASS_COUNT=${passed}`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
