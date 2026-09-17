"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ensureProductPageSchema } = require("../services/productPageSchema");
const { ALL_MATS, DATA, CONFIRM, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, parseArgs } = require("./backfill-putty-core-content-batch3");

function wrap(raw) {
  return {
    run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
    get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
    all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
    ensureColumn(table, name, type) { return new Promise(async (resolve, reject) => { try { const columns = await this.all(`PRAGMA table_info(${table})`); if (!columns.some(column => column.name === name)) await this.run(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`); resolve(); } catch (error) { reject(error); } }); },
    close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
  };
}

function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-putty-batch3-")), name); }
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
async function scalar(db, sql, params = []) { return Number((await db.get(sql, params)).n); }

async function fixture(file, { includeDefinitions = true } = {}) {
  const db = wrap(new sqlite3.Database(file));
  await db.run("PRAGMA foreign_keys=ON");
  await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT UNIQUE NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER DEFAULT 1,sort_order INTEGER DEFAULT 0,source TEXT,last_imported_at TEXT,created_at TEXT,updated_at TEXT,deleted_at TEXT,deleted_by_id INTEGER,deleted_by_name TEXT,product_group TEXT,image_url TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,stock_status TEXT NOT NULL DEFAULT 'unknown')");
  await db.run("CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,type TEXT,name TEXT,normalized_name TEXT,parent_id INTEGER,sort_order INTEGER DEFAULT 0,is_active INTEGER DEFAULT 1,created_at TEXT,updated_at TEXT,external_code TEXT,is_system INTEGER DEFAULT 0)");
  await ensureProductPageSchema(db);
  await db.run("INSERT INTO catalog_structure(id,type,name,parent_id,external_code,is_active) VALUES(1,'category','Смеси',NULL,'CAT-000001',1)");
  await db.run("INSERT INTO catalog_structure(id,type,name,parent_id,external_code,is_active) VALUES(4,'subcategory','Шпаклевка',1,'SUB-000003',1)");
  if (includeDefinitions) {
    const defs = [...Object.entries(DATA.REUSABLE_DEFINITIONS).map(([code, d]) => [code, d.label, d.dataType, d.unit]), ...DATA.NEW_DEFINITIONS.map(d => [d.code, d.label, d.dataType, d.defaultUnit])];
    for (const [code, label, type, unit] of defs) await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [code, label, type, unit, "Характеристики", 0, 1, "before", "before"]);
  }
  for (const item of DATA.PRODUCTS) await db.run("INSERT INTO products(external_id,title,category,subcategory,weight,price,brand,full_description,seo_title,image_url,is_active,deleted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", [item.externalId, item.expectedTitle, "Смеси", "Шпаклевка", Number(item.core.package_weight.value), 100, null, "keep full", "keep seo", "/keep.jpg", 1, null, "before"]);
  return db;
}

async function configureBrand(db, productBrand, attributeValue) {
  const product = await db.get("SELECT id FROM products WHERE external_id='MAT-000061'");
  const brandDef = await db.get("SELECT id FROM product_attribute_definitions WHERE code='brand'");
  await db.run("UPDATE products SET brand=? WHERE external_id='MAT-000061'", [productBrand]);
  await db.run("DELETE FROM product_attribute_values WHERE product_id=? AND attribute_definition_id=?", [product.id, brandDef.id]);
  if (attributeValue !== undefined) await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?)", [product.id, brandDef.id, attributeValue, 0, "before", "before"]);
}

async function main() {
  let passed = 0; const pass = name => { passed += 1; console.log(`PASS ${name}`); };
  assert.deepEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, ["brand"]); pass("products mutable fields are exactly brand");
  assert.deepEqual(ALL_MATS, ["MAT-000061", "MAT-000062", "MAT-000063", "MAT-000064", "MAT-000065"]); pass("allowlist is exactly MAT-000061..MAT-000065");
  assert.equal(CONFIRM, "BACKFILL_PUTTY_CORE_BATCH3");
  assert.throws(() => parseArgs(["--db", "x"]), /--only/);
  assert.throws(() => parseArgs(["--db", "x", "--only", "MAT-000061", "--apply", "--confirm", "WRONG"]), /BACKFILL_PUTTY_CORE_BATCH3/);
  assert.equal(parseArgs(["--db", "x", "--only", "MAT-000061"]).apply, false); pass("dry-run default and explicit apply confirmation");

  const file = tempFile("fixture.db"); const db = await fixture(file); const before = sha(file);
  const dry = await inspectBatch(db, { only: ALL_MATS });
  assert.equal(dry.summary.total, 5); assert.equal(dry.summary.readyProducts, 4); assert.equal(dry.summary.partial, 1); assert.equal(dry.summary.errors, 0);
  assert.equal(dry.summary.ready, 82); assert.equal(dry.summary.willAdd, 77); assert.equal(dry.summary.willFix, 5); assert.equal(dry.summary.needsSource, 2); assert.equal(dry.summary.absentByDesign, 1); assert.equal(dry.summary.schemaBlocked, 0); assert.equal(dry.summary.logicalSlots, 85); assert.equal(dry.summary.definitionsToCreate, 0);
  assert.ok(dry.rows.every(row => row.summary.logicalSlots === 17)); assert.equal(sha(file), before); pass("clean 85-slot dry-run is read-only with expected arithmetic");
  const partial = dry.rows.find(row => row.externalId === "MAT-000061"); assert.deepEqual(partial.specs.filter(i => i.status === "NEEDS_SOURCE").map(i => i.code), ["color", "drying_time"]); pass("MAT-000061 has exactly the two documented source gaps");
  const absent = dry.rows.find(row => row.externalId === "MAT-000065").specs.find(i => i.code === "pot_life"); assert.equal(absent.status, "ABSENT_BY_DESIGN"); pass("MAT-000065 pot_life is absent by design");
  const outside = await inspectBatch(db, { only: ["MAT-000060", "MAT-000027"] }); assert.equal(outside.summary.errors, 2); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values"), 0); pass("outside allowlist MATs are rejected without writes");
  await db.close();

  const applyFile = tempFile("apply.db"); const applyDb = await fixture(applyFile); const applied = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) });
  assert.equal(applied.summary.errors, 0); assert.equal(applied.summary.readyProducts, 4); assert.equal(applied.summary.partial, 1); assert.equal(applied.writes, 87);
  assert.equal((await applyDb.get("SELECT brand FROM products WHERE external_id='MAT-000061'")).brand, "KNAUF");
  assert.equal(await scalar(applyDb, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE d.code='brand'"), 5);
  assert.equal((await applyDb.get("SELECT full_description,seo_title,image_url,title,price,weight FROM products WHERE external_id='MAT-000061'")).full_description, "keep full");
  assert.equal(await scalar(applyDb, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE d.code='pot_life'"), 4); pass("apply writes only canonical ready values and synchronized brand targets");
  const repeat = await applyBatch(applyDb, applyFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(applyFile) }); assert.equal(repeat.writes, 0); pass("repeat apply is idempotent"); await applyDb.close();

  const titleFile = tempFile("title-guard.db"); const titleDb = await fixture(titleFile); await titleDb.run("UPDATE products SET title='wrong' WHERE external_id='MAT-000061'"); await assert.rejects(() => applyBatch(titleDb, titleFile, { only: ["MAT-000061"], confirm: CONFIRM, backupDir: path.dirname(titleFile) }), /Identity mismatch/); pass("exact title guard prevents writes"); await titleDb.close();
  const weightFile = tempFile("weight-guard.db"); const weightDb = await fixture(weightFile); await weightDb.run("UPDATE products SET weight=30 WHERE external_id='MAT-000061'"); const weightPlan = await inspectBatch(weightDb, { only: ["MAT-000061"] }); assert.equal(weightPlan.summary.errors, 1); assert.match(weightPlan.rows[0].error, /Weight mismatch/); pass("exact weight guard prevents planning"); await weightDb.close();
  const categoryFile = tempFile("category-guard.db"); const categoryDb = await fixture(categoryFile); await categoryDb.run("UPDATE products SET category='Other' WHERE external_id='MAT-000061'"); const categoryPlan = await inspectBatch(categoryDb, { only: ["MAT-000061"] }); assert.equal(categoryPlan.summary.errors, 1); assert.match(categoryPlan.rows[0].error, /Category guard/); await categoryDb.run("UPDATE products SET category='Смеси',subcategory='Other' WHERE external_id='MAT-000061'"); const subcategoryPlan = await inspectBatch(categoryDb, { only: ["MAT-000061"] }); assert.equal(subcategoryPlan.summary.errors, 1); assert.match(subcategoryPlan.rows[0].error, /Category guard/); pass("category and subcategory guards prevent planning"); await categoryDb.close();
  const lifecycleFile = tempFile("lifecycle-guard.db"); const lifecycleDb = await fixture(lifecycleFile); await lifecycleDb.run("UPDATE products SET is_active=0 WHERE external_id='MAT-000061'"); const inactivePlan = await inspectBatch(lifecycleDb, { only: ["MAT-000061"] }); assert.equal(inactivePlan.summary.errors, 1); await lifecycleDb.run("UPDATE products SET is_active=1,deleted_at='gone' WHERE external_id='MAT-000061'"); const deletedPlan = await inspectBatch(lifecycleDb, { only: ["MAT-000061"] }); assert.equal(deletedPlan.summary.errors, 1); pass("active and deleted guards prevent planning"); await lifecycleDb.close();

  const absentFile = tempFile("absent-conflict.db"); const absentDb = await fixture(absentFile); const product = await absentDb.get("SELECT id FROM products WHERE external_id='MAT-000065'"); const potDef = await absentDb.get("SELECT id FROM product_attribute_definitions WHERE code='pot_life'"); await absentDb.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?)", [product.id, potDef.id, "old", 0, "before", "before"]); const absentPlan = await inspectBatch(absentDb, { only: ["MAT-000065"] }); assert.equal(absentPlan.summary.errors, 1); await assert.rejects(() => applyBatch(absentDb, absentFile, { only: ["MAT-000065"], confirm: CONFIRM, backupDir: path.dirname(absentFile) }), /Batch preflight errors/); pass("existing ABSENT_BY_DESIGN row is conflict and aborts before mutation"); await absentDb.close();

  for (const [label, productBrand, attributeValue, expectedProduct, expectedAttribute] of [["product-only", "KNAUF", undefined, "EXISTING_OK", "WILL_ADD"], ["attribute-only", null, "KNAUF", "WILL_FIX", "EXISTING_OK"], ["both-wrong", "Other", "Other", "WILL_FIX", "WILL_FIX"]]) {
    const asymFile = tempFile(`brand-${label}.db`); const asymDb = await fixture(asymFile); await configureBrand(asymDb, productBrand, attributeValue); const plan = await inspectBatch(asymDb, { only: ["MAT-000061"] }); assert.equal(plan.rows[0].brand.productColumnStatus, expectedProduct); assert.equal(plan.rows[0].brand.attributeStatus, expectedAttribute); await applyBatch(asymDb, asymFile, { only: ["MAT-000061"], confirm: CONFIRM, backupDir: path.dirname(asymFile) }); const afterProduct = await asymDb.get("SELECT brand FROM products WHERE external_id='MAT-000061'"); const afterAttribute = await asymDb.get("SELECT v.value_text FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id JOIN products p ON p.id=v.product_id WHERE p.external_id='MAT-000061' AND d.code='brand'"); assert.equal(afterProduct.brand, "KNAUF"); assert.equal(afterAttribute.value_text, "KNAUF"); await asymDb.close();
  }
  pass("product.brand and brand attribute are planned independently and synchronized");

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = sha(rollbackFile); const failing = { ...rollbackDb, run(sql, params) { if (sql.startsWith("INSERT INTO product_attribute_values") && params?.[0] === 1) return Promise.reject(new Error("injected rollback")); return rollbackDb.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, rollbackFile, { only: ["MAT-000061"], confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(sha(rollbackFile), rollbackBefore); assert.equal(await scalar(rollbackDb, "SELECT COUNT(*) n FROM product_attribute_values"), 0); pass("backup precedes mutation and rollback restores DB"); await rollbackDb.close();

  const needData = { ...DATA, PRODUCTS: DATA.PRODUCTS.map(item => item.externalId === "MAT-000061" ? { ...item, core: { ...item.core, color: { status: "NEEDS_SOURCE", value: null, reason: "missing", sources: ["test"] } } } : item) }; const needFile = tempFile("needs-source.db"); const needDb = await fixture(needFile); const needPlan = await inspectBatch(needDb, { only: ["MAT-000061"], data: needData }); assert.equal(needPlan.rows[0].specs.find(item => item.code === "color").status, "NEEDS_SOURCE"); assert.equal(await scalar(needDb, "SELECT COUNT(*) n FROM product_attribute_values"), 0); pass("NEEDS_SOURCE is diagnostic only and creates no row"); await needDb.close();

  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
