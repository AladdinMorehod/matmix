"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-sand-cement-repair-core-batch1");
const DATA = require("./data/mix-sand-cement-repair-core-batch1");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mix-sand-cement-core-batch1-"));
const now = "2026-10-02T00:00:00.000Z";
const ALL = DATA.BATCH_MATS;
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function createFixture(name, options = {}) {
  const file = path.join(tempRoot, `${name}.db`); const db = open(file);
  try {
    await run(db, "PRAGMA user_version=11");
    await run(db, `CREATE TABLE catalog_structure (id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER)`);
    await run(db, `CREATE TABLE products (
      id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,brand TEXT,price REAL,weight REAL,unit TEXT,
      category TEXT,subcategory TEXT,product_group TEXT,stock_status TEXT,description TEXT,short_description TEXT,full_description TEXT,
      seo_title TEXT,seo_description TEXT,image TEXT,image_url TEXT,is_active INTEGER,deleted_at TEXT,updated_at TEXT)`);
    await run(db, `CREATE TABLE product_attribute_definitions (
      id INTEGER PRIMARY KEY,code TEXT UNIQUE,label TEXT,data_type TEXT,default_unit TEXT,is_active INTEGER,sort_order INTEGER)`);
    await run(db, `CREATE TABLE product_attribute_templates (
      id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,unit_override TEXT)`);
    await run(db, `CREATE TABLE product_attribute_values (
      id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,
      unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)`);
    await run(db, "CREATE TABLE product_images (id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT)");
    await run(db, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
    await run(db, "INSERT INTO catalog_structure VALUES(11,1,'subcategory','Пескобетон',1)");
    await run(db, "INSERT INTO catalog_structure VALUES(12,1,'subcategory','Цемент',1)");
    await run(db, "INSERT INTO catalog_structure VALUES(13,1,'subcategory','Смесь Ремонтная',1)");
    for (const [index, [code, definition]] of Object.entries(DATA.DEFINITIONS).entries()) {
      if (code === options.missingDefinition) continue;
      const type = code === options.incompatibleDefinition ? "text" : definition.dataType;
      const unit = code === options.incompatibleDefinition ? null : definition.unit;
      await run(db, "INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,is_active,sort_order) VALUES(?,?,?,?,?,1,?)", [index + 1, code, code, type, unit, index]);
    }
    for (const [index, config] of DATA.PRODUCTS.entries()) {
      const title = config.externalId === options.titleMismatch ? `${config.expectedTitle} changed` : config.expectedTitle;
      const brand = config.externalId === options.brandConflict ? "Different brand" : null;
      const weight = config.externalId === options.weightMismatch ? Number(config.core.package_weight.value) + 1 : Number(config.core.package_weight.value);
      await run(db, `INSERT INTO products(id,external_id,title,slug,brand,price,weight,unit,category,subcategory,product_group,stock_status,
        description,short_description,full_description,seo_title,seo_description,image,image_url,is_active,deleted_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [100 + index, config.externalId, title, `slug-${config.externalId}`, brand, 123 + index,
        weight, "шт", "Смеси", config.expectedSubcategory, "repair", "available", `description-${config.externalId}`,
        `short-${config.externalId}`, `full-${config.externalId}`, `seo-title-${config.externalId}`, `seo-description-${config.externalId}`,
        `legacy-image-${config.externalId}`, `/uploads/products/${config.externalId}.webp`, 1, null, now]);
    }
    await run(db, `INSERT INTO products(id,external_id,title,slug,brand,price,weight,unit,category,subcategory,product_group,stock_status,
      description,short_description,full_description,seo_title,seo_description,image,image_url,is_active,deleted_at,updated_at)
      VALUES(999,'MAT-OTHER','Unrelated','unrelated','Keep',88,9,'шт','Other','Other','Other','available','d','s','f','st','sd','i','/other.webp',1,NULL,?)`, [now]);
    await run(db, "INSERT INTO product_images VALUES(1,999,'/keep.webp')");
    if (options.valueConflict) {
      const product = DATA.PRODUCTS.find(row => row.externalId === options.valueConflict.externalId);
      const definition = await get(db, "SELECT id,data_type FROM product_attribute_definitions WHERE code=?", [options.valueConflict.code]);
      await run(db, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",
        [100 + DATA.PRODUCTS.indexOf(product), definition.id, definition.data_type === "text" ? "not same" : null, definition.data_type === "number" ? 999 : null, null, definition.data_type === "number" ? definition.default_unit : null, 55, now, now]);
    }
    if (options.existingBrandValue) {
      const brandDefinition = await get(db, "SELECT id FROM product_attribute_definitions WHERE code='brand'");
      await run(db, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(100,?,?,NULL,NULL,NULL,0,?,?)",
        [brandDefinition.id, options.existingBrandValue, now, now]);
    }
    if (options.membership) {
      const definition = await get(db, "SELECT id FROM product_attribute_definitions WHERE code='base'");
      await run(db, "INSERT INTO product_attribute_templates VALUES(1,13,?,'regular',0,NULL)", [definition.id]);
    }
    if (options.rollbackTrigger) {
      const product = DATA.PRODUCTS.find(row => row.externalId === options.rollbackTrigger.externalId);
      const definition = await get(db, "SELECT id FROM product_attribute_definitions WHERE code=?", [options.rollbackTrigger.code]);
      await run(db, `CREATE TRIGGER fail_selected_insert BEFORE INSERT ON product_attribute_values
        WHEN NEW.product_id=${100 + DATA.PRODUCTS.indexOf(product)} AND NEW.attribute_definition_id=${definition.id}
        BEGIN SELECT RAISE(ABORT,'fixture rollback'); END`);
    }
  } finally { await close(db); }
  return file;
}

async function snapshot(db) {
  const result = {};
  for (const table of ["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) result[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
  return result;
}
function row(report, id) { return report.rows.find(item => item.externalId === id); }
function spec(reportRow, code) { return reportRow.specs.find(item => item.code === code); }

async function main() {
  let passed = 0; const pass = label => { passed += 1; console.log(`PASS ${label}`); };

  assert.deepStrictEqual(RUNNER.ALL_MATS, ["MAT-000109", "MAT-000117", "MAT-000118"]);
  assert.deepStrictEqual(DATA.PRODUCTS.map(item => item.externalId), RUNNER.ALL_MATS);
  assert.throws(() => RUNNER.assertExactBatch(["MAT-000109"]), /Exact batch required/);
  assert.throws(() => RUNNER.assertExactBatch([...ALL, "MAT-000113"]), /Exact batch required/);
  assert.throws(() => RUNNER.assertExactBatch([ALL[0], ALL[1], ALL[1]]), /Exact batch required/);
  assert.throws(() => RUNNER.assertExactBatch([ALL[0], ALL[1], "MAT-000110"]), /Exact batch required/);
  assert.throws(() => RUNNER.validateData({ ...DATA, PRODUCTS: [...DATA.PRODUCTS, DATA.PRODUCTS[0]] }), /exactly the three ordered batch MATs/);
  assert.deepStrictEqual(RUNNER.parseArgs(["--db", "fixture.db", "--only", ALL.join(",")]).only, ALL);
  assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", ALL[0]]), /Exact batch required/);
  assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", `${ALL.join(",")},MAT-000113`]), /Exact batch required/);
  assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", `${ALL[0]},${ALL[1]},${ALL[1]}`]), /Exact batch required/);
  assert.throws(() => RUNNER.parseArgs(["--apply", "--db", "fixture.db", "--only", ALL.join(","), "--confirm", RUNNER.CONFIRM]), /backup-dir/);
  assert.deepStrictEqual(DATA.TEMPLATE_AUDIT.filter(item => [11, 13].includes(item.structureId)).map(item => item.readiness), ["TEMPLATE_READY", "TEMPLATE_READY"]);
  assert.deepStrictEqual(DATA.CORE_ORDER.filter(code => !DATA.DEFINITIONS[code]), []);
  assert.deepStrictEqual(DATA.PRODUCTS.map(product => product.core.mortar_grade.status), ["READY", "NOT_AVAILABLE", "NOT_AVAILABLE"]);
  assert.deepStrictEqual([DATA.PRODUCTS[0].core.consumption_10mm.status, DATA.PRODUCTS[0].core.frost_resistance.status], ["SOURCE_CONFLICT", "SOURCE_CONFLICT"]);
  assert.equal(DATA.PRODUCTS[0].core.mortar_grade.value, "М-300");
  assert.equal(DATA.PRODUCTS[0].core.compressive_strength.value, 30);
  assert.equal(DATA.PRODUCTS[2].identity.includes("CRT-40 AF"), true);
  assert.equal(DATA.PRODUCTS[2].core.compressive_strength.status, "NEEDS_MAPPING");
  pass("exact three-MAT scope, exclusions, source conflicts and non-collapsed classifications");

  const dryFile = await createFixture("dry"); const dryDb = await RUNNER.openDatabase(dryFile, false);
  const beforeDry = await snapshot(dryDb); const dryHash = sha(dryFile);
  const dry = await RUNNER.inspectBatch(dryDb, { only: ALL });
  assert.equal(dry.summary.total, 3); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.titleGuardBlocked, 0);
  assert.equal(dry.summary.identityConfirmedProducts, 3); assert.equal(dry.summary.corePartialProducts, 3);
  for (const id of ALL) {
    assert.equal(row(dry, id).identityStatus, "IDENTITY_CONFIRMED");
    assert.equal(row(dry, id).coreCoverageStatus, "CORE_PARTIAL");
    assert.equal(row(dry, id).status, "PARTIAL", "legacy status remains a core-coverage status alias");
  }
  assert.equal(dry.summary.templateMembershipChanges, 0); assert.equal(dry.summary.definitionsToCreate, 0);
  assert.equal(spec(row(dry, "MAT-000109"), "consumption_10mm").status, "SOURCE_CONFLICT");
  assert.equal(spec(row(dry, "MAT-000109"), "frost_resistance").status, "SOURCE_CONFLICT");
  assert.equal(spec(row(dry, "MAT-000117"), "compressive_strength").status, "NEEDS_MAPPING");
  assert.equal(spec(row(dry, "MAT-000118"), "compressive_strength").status, "NEEDS_MAPPING");
  assert.equal(dry.summary.willAdd > 0, true); assert.equal(dry.summary.schemaBlocked, 0);
  assert.deepStrictEqual({ logicalSlots: dry.summary.logicalSlots, ready: dry.summary.ready, willAdd: dry.summary.willAdd,
    sourceConflict: dry.summary.sourceConflict, needsMapping: dry.summary.needsMapping, notAvailable: dry.summary.notAvailable,
    schemaBlocked: dry.summary.schemaBlocked, valueConflict: dry.summary.valueConflict, errors: dry.summary.errors },
  { logicalSlots: 69, ready: 51, willAdd: 51, sourceConflict: 2, needsMapping: 7, notAvailable: 9, schemaBlocked: 0, valueConflict: 0, errors: 0 });
  assert.deepStrictEqual(await snapshot(dryDb), beforeDry); assert.equal(sha(dryFile), dryHash);
  await assert.rejects(() => RUNNER.inspectBatch(dryDb, { only: [ALL[0]] }), /Exact batch required/);
  await assert.rejects(() => RUNNER.applyBatch(dryDb, dryFile, { only: [ALL[0]], confirm: RUNNER.CONFIRM, backupDir: tempRoot }), /Exact batch required/);
  pass("dry-run leaves all product/spec/schema/template/image rows and DB bytes unchanged");
  await dryDb.close();

  const titleFile = await createFixture("title", { titleMismatch: "MAT-000117" }); const titleDb = await RUNNER.openDatabase(titleFile, false);
  const title = await RUNNER.inspectBatch(titleDb, { only: ALL });
  assert.equal(row(title, "MAT-000117").status, "TITLE_GUARD_BLOCKED");
  assert.equal(row(title, "MAT-000117").identityStatus, "IDENTITY_GUARD_BLOCKED");
  assert.equal(row(title, "MAT-000117").coreCoverageStatus, "NOT_EVALUATED"); await titleDb.close();
  const weightFile = await createFixture("weight-guard", { weightMismatch: "MAT-000118" }); const weightDb = await RUNNER.openDatabase(weightFile, false);
  const weight = await RUNNER.inspectBatch(weightDb, { only: ALL }); assert.equal(row(weight, "MAT-000118").status, "TITLE_GUARD_BLOCKED"); assert.match(row(weight, "MAT-000118").guardReason, /weight\/unit mismatch/); await weightDb.close();
  const missingFile = await createFixture("missing-definition", { missingDefinition: "base" }); const missingDb = await RUNNER.openDatabase(missingFile, false);
  await assert.rejects(() => RUNNER.inspectBatch(missingDb, { only: ALL }), /Missing\/incompatible existing canonical definitions: base/); await missingDb.close();
  const schemaFile = await createFixture("incompatible-definition", { incompatibleDefinition: "pot_life" }); const schemaDb = await RUNNER.openDatabase(schemaFile, false);
  await assert.rejects(() => RUNNER.inspectBatch(schemaDb, { only: ALL }), /Missing\/incompatible existing canonical definitions: pot_life/); await schemaDb.close();
  const membershipFile = await createFixture("unexpected-membership", { membership: true }); const membershipDb = await RUNNER.openDatabase(membershipFile, false);
  const membership = await RUNNER.inspectBatch(membershipDb, { only: ALL }); assert.equal(row(membership, "MAT-000117").status, "ERROR"); assert.match(row(membership, "MAT-000117").error, /Template assumption changed/); await membershipDb.close();
  pass("exact title, local weight/unit identity, existing definition compatibility and empty-template fallback guards");

  const valueConflictFile = await createFixture("value-conflict", { valueConflict: { externalId: "MAT-000117", code: "base" } });
  const valueConflictDb = await RUNNER.openDatabase(valueConflictFile, false); const valueConflict = await RUNNER.inspectBatch(valueConflictDb, { only: ALL });
  assert.equal(spec(row(valueConflict, "MAT-000117"), "base").status, "VALUE_CONFLICT");
  await assert.rejects(() => RUNNER.applyBatch(valueConflictDb, valueConflictFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: tempRoot }), /Apply blocked/);
  await valueConflictDb.close();
  const brandConflictFile = await createFixture("brand-conflict", { brandConflict: "MAT-000109" });
  const brandConflictDb = await RUNNER.openDatabase(brandConflictFile, false); const brandConflict = await RUNNER.inspectBatch(brandConflictDb, { only: ALL });
  assert.equal(row(brandConflict, "MAT-000109").status, "BLOCKED"); assert.equal(brandConflict.summary.brandConflict, 1); await brandConflictDb.close();
  const brandValueConflictFile = await createFixture("brand-value-conflict", { existingBrandValue: "not Русеан" });
  const brandValueConflictDb = await RUNNER.openDatabase(brandValueConflictFile, false); const brandValueConflict = await RUNNER.inspectBatch(brandValueConflictDb, { only: ALL });
  assert.equal(row(brandValueConflict, "MAT-000109").status, "BLOCKED"); await brandValueConflictDb.close();
  pass("existing conflicting values or brand block apply without overwrite");

  const applyFile = await createFixture("apply"); const applyDb = await RUNNER.openDatabase(applyFile, true);
  const beforeApply = await snapshot(applyDb);
  const applied = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "verified-backups") });
  assert.equal(applied.summary.errors, 0); assert.equal(applied.summary.valueConflict, 0); assert.equal(applied.summary.willAdd, 0);
  assert.equal(applied.backup.verified, true); assert.equal(fs.existsSync(applied.backup.path), true);
  assert.equal(applied.writes, applied.summary.existingOk - beforeApply.product_attribute_values.length + DATA.PRODUCTS.length);
  const afterApply = await snapshot(applyDb);
  assert.equal(afterApply.products.find(p => p.external_id === "MAT-OTHER").brand, "Keep");
  assert.deepStrictEqual(afterApply.product_attribute_definitions, beforeApply.product_attribute_definitions);
  assert.deepStrictEqual(afterApply.product_attribute_templates, beforeApply.product_attribute_templates);
  assert.deepStrictEqual(afterApply.product_images, beforeApply.product_images);
  for (const config of DATA.PRODUCTS) {
    const original = beforeApply.products.find(p => p.external_id === config.externalId);
    const current = afterApply.products.find(p => p.external_id === config.externalId);
    const expected = { ...original, brand: config.brand };
    assert.deepStrictEqual(current, expected, `only brand may change for ${config.externalId}`);
  }
  const repeated = await RUNNER.applyBatch(applyDb, applyFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "verified-backups") });
  assert.equal(repeated.writes, 0); assert.equal(repeated.backup, null); assert.equal(repeated.summary.willAdd, 0);
  assert.deepStrictEqual(await snapshot(applyDb), afterApply);
  pass("apply writes only permitted brand/core values, verifies online backup, and is idempotent");
  await applyDb.close();

  const rollbackFile = await createFixture("rollback", { rollbackTrigger: { externalId: "MAT-000117", code: "base" } });
  const rollbackDb = await RUNNER.openDatabase(rollbackFile, true); const rollbackBefore = await snapshot(rollbackDb);
  await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: ALL, confirm: RUNNER.CONFIRM, backupDir: path.join(tempRoot, "rollback-backups") }), /fixture rollback/);
  assert.deepStrictEqual(await snapshot(rollbackDb), rollbackBefore); await rollbackDb.close();
  pass("unexpected insert failure rolls back all prior product and attribute writes");

  const runnerText = fs.readFileSync(path.join(__dirname, "backfill-mix-sand-cement-repair-core-batch1.js"), "utf8");
  assert.match(runnerText, /UPDATE products SET brand=/);
  assert.match(runnerText, /INSERT INTO product_attribute_values/);
  assert.doesNotMatch(runnerText, /UPDATE products SET (?!brand=)/);
  assert.doesNotMatch(runnerText, /(?:INSERT|UPDATE|DELETE|REPLACE)\s+INTO?\s+product_attribute_(?:definitions|templates)/i);
  assert.doesNotMatch(runnerText, /(?:DELETE|REPLACE)\s+FROM\s+product_attribute_values/i);
  pass("static writable surface excludes definitions/templates, product fields beyond brand, and deletes");

  console.log(JSON.stringify({ success: true, exactScope: true, sourceConflictPreserved: true, mappingLimitationsPreserved: true,
    genericTemplateFallbackGuarded: true, definitionsAndTemplatesNeverWritten: true, dryRunImmutable: true, applyTransactional: true,
    onlineBackupVerified: true, rollback: true, idempotent: true }, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
