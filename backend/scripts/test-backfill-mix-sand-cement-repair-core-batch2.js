"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-sand-cement-repair-core-batch2");
const DATA = require("./data/mix-sand-cement-repair-core-batch2");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mix-sand-cement-core-batch2-"));
const ALL = DATA.BATCH_MATS;
const now = "2026-10-03T00:00:00.000Z";
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function createFixture(name, options = {}) {
  const file = path.join(tempRoot, `${name}.db`); const db = open(file);
  try {
    await run(db, "PRAGMA user_version=11");
    await run(db, "CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER)");
    await run(db, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,brand TEXT,price REAL,weight REAL,unit TEXT,category TEXT,subcategory TEXT,product_group TEXT,stock_status TEXT,description TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image TEXT,image_url TEXT,is_active INTEGER,deleted_at TEXT,updated_at TEXT)`);
    await run(db, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT UNIQUE,label TEXT,data_type TEXT,default_unit TEXT,is_active INTEGER,sort_order INTEGER)");
    await run(db, "CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,unit_override TEXT)");
    await run(db, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT)");
    await run(db, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
    await run(db, "INSERT INTO catalog_structure VALUES(11,1,'subcategory','Пескобетон',1)");
    for (const [index, [code, definition]] of Object.entries(DATA.DEFINITIONS).entries()) {
      await run(db, "INSERT INTO product_attribute_definitions VALUES(?,?,?,?,?,1,?)", [index + 1, code, code, definition.dataType, definition.unit, index]);
    }
    for (const [index, config] of DATA.PRODUCTS.entries()) {
      const title = config.externalId === options.titleMismatch ? `${config.expectedTitle} изменён` : config.expectedTitle;
      const category = config.externalId === options.categoryMismatch ? "Другая категория" : "Смеси";
      const subcategory = config.externalId === options.subcategoryMismatch ? "Цемент" : config.expectedSubcategory;
      const brand = config.externalId === options.brandConflict ? "Иной бренд" : null;
      const weight = config.externalId === options.weightMismatch ? Number(config.core.package_weight.value) + 1 : Number(config.core.package_weight.value);
      await run(db, `INSERT INTO products VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [101 + index, config.externalId, title, `slug-${config.externalId}`, brand, 100 + index, weight, "шт", category, subcategory, "Пескобетон", "unknown", "legacy-description", null, null, null, null, "", "/uploads/products/MAT-000001-placeholder.png", 1, null, now]);
    }
    await run(db, `INSERT INTO products VALUES(999,'MAT-OTHER','Other','other','Keep',1,1,'шт','Other','Other','Other','unknown','d',NULL,NULL,NULL,NULL,'','/other.png',1,NULL,?)`, [now]);
    await run(db, "INSERT INTO product_images VALUES(1,999,'/keep.webp')");
    if (options.valueConflict) {
      const config = DATA.PRODUCTS.find(item => item.externalId === options.valueConflict.externalId);
      const definition = await get(db, "SELECT id,data_type,default_unit FROM product_attribute_definitions WHERE code=?", [options.valueConflict.code]);
      await run(db, "INSERT INTO product_attribute_values VALUES(1,?,?,?,?,?,?,0,?,?)", [101 + DATA.PRODUCTS.indexOf(config), definition.id, "conflict", null, null, definition.default_unit, now, now]);
    }
    if (options.trigger) {
      const config = DATA.PRODUCTS.find(item => item.externalId === options.trigger.externalId);
      const definition = await get(db, "SELECT id FROM product_attribute_definitions WHERE code=?", [options.trigger.code]);
      await run(db, `CREATE TRIGGER fail_insert BEFORE INSERT ON product_attribute_values WHEN NEW.product_id=${101 + DATA.PRODUCTS.indexOf(config)} AND NEW.attribute_definition_id=${definition.id} BEGIN SELECT RAISE(ABORT,'fixture rollback'); END`);
    }
  } finally { await close(db); }
  return file;
}
async function snapshot(db) {
  const out = {};
  for (const table of ["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) out[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
  return out;
}
const row = (report, externalId) => report.rows.find(item => item.externalId === externalId);
const spec = (reportRow, code) => reportRow.specs.find(item => item.code === code);

async function main() {
  let passed = 0; const pass = label => { passed += 1; console.log(`PASS ${label}`); };
  assert.deepStrictEqual(ALL, ["MAT-000110", "MAT-000111"]);
  assert.deepStrictEqual(DATA.PRODUCTS.map(item => item.externalId), ALL);
  assert.deepStrictEqual(DATA.DEFINITIONS.consumption_10mm, { dataType: "text", unit: "кг/м²" });
  assert.deepStrictEqual(DATA.DEFINITIONS.pot_life, { dataType: "text", unit: null });
  assert.equal(RUNNER.validateData(), true);
  assert.deepStrictEqual(RUNNER.parseArgs(["--db", "fixture.db", "--only", ALL.join(",")]).only, ALL);
  for (const invalid of ["MAT-000110", `${ALL.join(",")},MAT-000113`, `${ALL[0]},${ALL[0]}`]) assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", invalid]), /Exact batch required/);
  await assert.rejects(() => RUNNER.inspectBatch({}, { only: [ALL[0]] }), /Exact batch required/);
  await assert.rejects(() => RUNNER.applyBatch({}, "fixture.db", { only: [ALL[0]], confirm: RUNNER.CONFIRM, backupDir: tempRoot }), /Exact batch required/);
  pass("exact target allowlist and source-status matrix validated");

  const dryFile = await createFixture("dry"); const dryDb = await RUNNER.openDatabase(dryFile, false);
  const before = await snapshot(dryDb); const beforeHash = sha(dryFile);
  const dry = await RUNNER.inspectBatch(dryDb, { only: ALL });
  assert.equal(dry.summary.total, 2); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0);
  assert.equal(dry.summary.ownerConfirmedProducts, 2); assert.equal(dry.summary.partialProducts, 2);
  assert.equal(dry.summary.definitionsToCreate, 0); assert.equal(dry.summary.templateMembershipChanges, 0);
  assert.equal(row(dry, "MAT-000110").identityStatus, "OWNER_CONFIRMED");
  assert.equal(row(dry, "MAT-000111").identityStatus, "OWNER_CONFIRMED");
  assert.equal(spec(row(dry, "MAT-000111"), "layer_thickness").status, "WILL_ADD");
  assert.equal(spec(row(dry, "MAT-000111"), "layer_thickness").value, "10–50 мм");
  assert.equal(spec(row(dry, "MAT-000111"), "adhesion").status, "WILL_ADD");
  assert.equal(spec(row(dry, "MAT-000111"), "adhesion").value, 0.5);
  assert.equal(spec(row(dry, "MAT-000111"), "shelf_life").status, "WILL_ADD");
  assert.equal(spec(row(dry, "MAT-000111"), "shelf_life").value, 6);
  for (const code of ["consumption_10mm", "consumption", "pot_life"]) assert.equal(spec(row(dry, "MAT-000111"), code).status, "SOURCE_CONFLICT");
  assert.equal(spec(row(dry, "MAT-000111"), "water_requirement").value, "0,17–0,20 л/кг");
  for (const [code, value] of [["purpose", "Устройство стяжек пола (в том числе плавающих и тёплых), фундаментов, отмосток и других бетонных конструкций в жилых и общественных зданиях"], ["application_area", "Внутренние и наружные работы"], ["standard", "ГОСТ 31358-2007"]]) {
    assert.equal(spec(row(dry, "MAT-000110"), code).status, "WILL_ADD");
    assert.equal(spec(row(dry, "MAT-000110"), code).value, value);
  }
  assert.equal(spec(row(dry, "MAT-000110"), "layer_thickness").sourceStatus, "BLOCKED_BY_VARIANT");
  assert.equal(dry.summary.plannedBrandUpdates, 2);
  assert.deepStrictEqual(await snapshot(dryDb), before); assert.equal(sha(dryFile), beforeHash);
  assert.deepStrictEqual({ logicalSlots: dry.summary.logicalSlots, ready: dry.summary.ready, willAdd: dry.summary.willAdd, existingOk: dry.summary.existingOk, sourceConflict: dry.summary.sourceConflict, needsMapping: dry.summary.needsMapping, notAvailable: dry.summary.notAvailable, blockedByVariant: dry.summary.blockedByVariant, plannedBrandUpdates: dry.summary.plannedBrandUpdates, errors: dry.summary.errors },
    { logicalSlots: 46, ready: 20, willAdd: 20, existingOk: 0, sourceConflict: 3, needsMapping: 0, notAvailable: 22, blockedByVariant: 1, plannedBrandUpdates: 2, errors: 0 });
  await dryDb.close();
  pass("dry-run reports only source-backed values and leaves fixture bytes/tables unchanged");

  const titleFile = await createFixture("title", { titleMismatch: "MAT-000111" }); const titleDb = await RUNNER.openDatabase(titleFile, false);
  assert.equal(row(await RUNNER.inspectBatch(titleDb, { only: ALL }), "MAT-000111").status, "TITLE_GUARD_BLOCKED"); await titleDb.close();
  const subcategoryFile = await createFixture("subcategory", { subcategoryMismatch: "MAT-000111" }); const subcategoryDb = await RUNNER.openDatabase(subcategoryFile, false);
  assert.equal(row(await RUNNER.inspectBatch(subcategoryDb, { only: ALL }), "MAT-000111").status, "TITLE_GUARD_BLOCKED"); await subcategoryDb.close();
  const categoryFile = await createFixture("category", { categoryMismatch: "MAT-000111" }); const categoryDb = await RUNNER.openDatabase(categoryFile, false);
  assert.equal(row(await RUNNER.inspectBatch(categoryDb, { only: ALL }), "MAT-000111").status, "TITLE_GUARD_BLOCKED"); await categoryDb.close();
  const weightFile = await createFixture("weight", { weightMismatch: "MAT-000111" }); const weightDb = await RUNNER.openDatabase(weightFile, false);
  assert.equal(row(await RUNNER.inspectBatch(weightDb, { only: ALL }), "MAT-000111").status, "TITLE_GUARD_BLOCKED"); await weightDb.close();
  const conflictFile = await createFixture("conflict", { valueConflict: { externalId: "MAT-000111", code: "color" } }); const conflictDb = await RUNNER.openDatabase(conflictFile, false);
  assert.equal(spec(row(await RUNNER.inspectBatch(conflictDb, { only: ALL }), "MAT-000111"), "color").status, "VALUE_CONFLICT"); await conflictDb.close();
  const brandFile = await createFixture("brand", { brandConflict: "MAT-000110" }); const brandDb = await RUNNER.openDatabase(brandFile, false);
  assert.equal(row(await RUNNER.inspectBatch(brandDb, { only: ALL }), "MAT-000110").status, "BLOCKED"); await brandDb.close();
  pass("exact title, differing existing value and brand-conflict guards block writes");

  const applyFile = await createFixture("apply"); const applyDb = await RUNNER.openDatabase(applyFile, true); const beforeApply = await snapshot(applyDb);
  const applied = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "backup") });
  assert.equal(applied.summary.willAdd, 0); assert.equal(applied.backup.verified, true); assert.equal(applied.writes, 22);
  const afterApply = await snapshot(applyDb);
  const expectedProducts = beforeApply.products.map(product => {
    const config = DATA.PRODUCTS.find(item => item.externalId === product.external_id);
    return config ? { ...product, brand: config.brand } : product;
  });
  assert.deepStrictEqual(afterApply.products, expectedProducts);
  assert.deepStrictEqual(afterApply.product_attribute_definitions, beforeApply.product_attribute_definitions);
  assert.deepStrictEqual(afterApply.product_attribute_templates, beforeApply.product_attribute_templates);
  assert.deepStrictEqual(afterApply.product_images, beforeApply.product_images);
  const unrelated = afterApply.products.find(item => item.external_id === "MAT-OTHER"); assert.equal(unrelated.brand, "Keep");
  for (const config of DATA.PRODUCTS) assert.equal(afterApply.products.find(item => item.external_id === config.externalId).brand, config.brand);
  const again = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "backup") });
  assert.equal(again.writes, 0); assert.deepStrictEqual(await snapshot(applyDb), afterApply); await applyDb.close();
  pass("disposable apply writes only planned product brands/attributes; backup and idempotency pass");

  const rollbackFile = await createFixture("rollback", { trigger: { externalId: "MAT-000111", code: "color" } }); const rollbackDb = await RUNNER.openDatabase(rollbackFile, true); const rollbackBefore = await snapshot(rollbackDb);
  await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "rollback-backup") }), /fixture rollback/);
  assert.deepStrictEqual(await snapshot(rollbackDb), rollbackBefore); await rollbackDb.close();
  pass("transaction rollback removes all partial changes after injected write failure");

  const runnerText = fs.readFileSync(path.join(__dirname, "backfill-mix-sand-cement-repair-core-batch2.js"), "utf8");
  assert.match(runnerText, /UPDATE products SET brand=/); assert.match(runnerText, /INSERT INTO product_attribute_values/);
  assert.doesNotMatch(runnerText, /UPDATE products SET (?!brand=)/);
  assert.doesNotMatch(runnerText, /(?:INSERT|UPDATE|DELETE|REPLACE)\s+INTO?\s+product_attribute_(?:definitions|templates)/i);
  assert.doesNotMatch(runnerText, /(?:DELETE|REPLACE)\s+FROM\s+product_attribute_values/i);
  console.log(JSON.stringify({ success: true, exactScope: true, dryRunImmutable: true, ownerIdentityPreserved: true, categoryTitleWeightGuards: true, sourceConflictsPreserved: true, applyRollbackIdempotent: true, productBrandWritableSurfaceOnly: true, definitionsAndTemplatesNeverWritten: true, dryRunSummary: { total: dry.summary.total, logicalSlots: dry.summary.logicalSlots, ready: dry.summary.ready, willAdd: dry.summary.willAdd, existingOk: dry.summary.existingOk, sourceConflict: dry.summary.sourceConflict, needsMapping: dry.summary.needsMapping, notAvailable: dry.summary.notAvailable, blockedByVariant: dry.summary.blockedByVariant, plannedBrandUpdates: dry.summary.plannedBrandUpdates, schemaBlocked: dry.summary.schemaBlocked, valueConflict: dry.summary.valueConflict, brandConflict: dry.summary.brandConflict, titleGuardBlocked: dry.summary.titleGuardBlocked, errors: dry.summary.errors } }, null, 2));
  console.log(`PASS_COUNT=${passed}`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
