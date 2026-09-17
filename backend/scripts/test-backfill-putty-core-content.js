"use strict";
const assert = require("assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ensureProductPageSchema } = require("../services/productPageSchema");
const { ALL_MATS, DATA, CONFIRM, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, parseArgs } = require("./backfill-putty-core-content");

function wrap(raw) {
  return {
    run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
    get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
    all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
    ensureColumn(table, name, type) { return new Promise(async (resolve, reject) => { try { const columns = await this.all(`PRAGMA table_info(${table})`); if (!columns.some(c => c.name === name)) await this.run(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`); resolve(); } catch (error) { reject(error); } }); },
    close() { return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); }
  };
}
async function fixture(file) {
  const raw = new sqlite3.Database(file); const db = wrap(raw); await db.run("PRAGMA foreign_keys=ON");
  await db.run("CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT UNIQUE NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER DEFAULT 1,sort_order INTEGER DEFAULT 0,source TEXT,last_imported_at TEXT,created_at TEXT,updated_at TEXT,deleted_at TEXT,deleted_by_id INTEGER,deleted_by_name TEXT,product_group TEXT,image_url TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,stock_status TEXT NOT NULL DEFAULT 'unknown')");
  await db.run("CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,type TEXT,name TEXT,normalized_name TEXT,parent_id INTEGER,sort_order INTEGER DEFAULT 0,is_active INTEGER DEFAULT 1,created_at TEXT,updated_at TEXT,external_code TEXT,is_system INTEGER DEFAULT 0)");
  await ensureProductPageSchema(db);
  const oldDefs = [
    ["brand", "Бренд", "text", null], ["product_type", "Тип продукта", "text", null], ["base", "Основа", "text", null], ["purpose", "Назначение", "text", null], ["package_weight", "Фасовка", "number", "кг"], ["consumption_10mm", "Расход при слое 10 мм", "number", "кг/м²"], ["coverage_30kg_10mm", "Площадь мешка 30 кг при слое 10 мм", "number", "м²"], ["wall_layer_thickness", "Толщина слоя на стене", "text", null], ["ceiling_layer_thickness", "Толщина слоя на потолке", "text", null], ["application_temperature", "Температура основания и воздуха", "text", null], ["shelf_life", "Срок хранения", "number", "месяцев"], ["legacy_note", "Старая заметка", "text", null]
  ];
  for (const [code,label,type,unit] of oldDefs) await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [code,label,type,unit,"Характеристики",0,1,"before","before"]);
  for (const item of DATA.PRODUCTS) await db.run("INSERT INTO products(external_id,title,category,subcategory,weight,price,brand,full_description,updated_at) VALUES(?,?,?,?,?,?,?, ?,?)", [item.externalId,item.expectedTitle,"Смеси","Шпаклевка",Number(item.core.package_weight.value),100,null,null,"before"]);
  for (const id of ["MAT-000002","MAT-000005","MAT-000027","MAT-000028"]) await db.run("INSERT INTO products(external_id,title,category,subcategory,weight,price,brand,full_description,updated_at) VALUES(?,?,?,?,?,?,?, ?,?)", [id,"protected "+id,"Смеси","Шпаклевка",25,100,null,null,"before"]);
  const mat33 = await db.get("SELECT id FROM products WHERE external_id='MAT-000033'"); const legacy = await db.get("SELECT id FROM product_attribute_definitions WHERE code='legacy_note'");
  await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?)", [mat33.id,legacy.id,"preserve",null,99,"before","before"]);
  return db;
}
function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-putty-test-")), name); }
async function sha(file) { return require("crypto").createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
async function scalar(db, sql, params = []) { const row = await db.get(sql, params); return Number(row.n); }
async function main() {
  let passed = 0; const pass = name => { passed++; console.log(`PASS ${name}`); };
  assert.deepEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, ["brand"]); pass("products mutable fields are exactly brand");
  assert.deepEqual(ALL_MATS, Array.from({ length: 14 }, (_, i) => `MAT-${String(i + 33).padStart(6, "0")}`)); pass("putty MAT allowlist is exactly MAT-000033..MAT-000046");
  assert.throws(() => parseArgs(["--db", "x"]), /--only/); assert.throws(() => parseArgs(["--db", "x", "--only", "MAT-000033", "--apply", "--confirm", "WRONG"]), /BACKFILL_PUTTY_CORE/); assert.equal(parseArgs(["--db", "x", "--only", "MAT-000033"]).apply, false); pass("default dry-run and required explicit --only/confirmation");
  const file = tempFile("fixture.db"); const db = await fixture(file); const before = await sha(file); const dry = await inspectBatch(db, { only: DATA.PRODUCTS.map(p => p.externalId) }); assert.equal(dry.summary.total, 14); assert.equal(dry.summary.errors, 0); assert.equal(dry.summary.definitionsToCreate, DATA.NEW_DEFINITIONS.length); assert.equal(await sha(file), before); pass("full putty dry-run is read-only");
  const unknown = await inspectBatch(db, { only: ["MAT-000002", "MAT-000027", "MAT-000028", "MAT-999999"] }); assert.equal(unknown.summary.errors, 4); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values"), 1); pass("out-of-allowlist MATs are rejected without writes");
  await assert.rejects(() => applyBatch(db, file, { only: ["MAT-000002"], confirm: CONFIRM, backupDir: path.dirname(file) }), /outside putty allowlist/); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_definitions WHERE code='color'"), 0); pass("out-of-allowlist apply cannot create schema definitions");
  const applied = await applyBatch(db, file, { only: DATA.PRODUCTS.map(p => p.externalId), confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(applied.summary.errors, 0); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_definitions WHERE code IN ('color','form','application_area','application_method','substrates','layer_thickness','consumption','consumption_basis','pot_life','drying_time')"), 10); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_definitions WHERE code IN ('consumption_10mm','coverage_30kg_10mm','wall_layer_thickness','ceiling_layer_thickness')"), 4); pass("allowlisted definitions only; plaster-specific definitions reused and untouched");
  assert.equal((await db.get("SELECT brand FROM products WHERE external_id='MAT-000033'")).brand, "KNAUF"); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id JOIN products p ON p.id=v.product_id WHERE p.external_id='MAT-000033' AND d.code='brand'"), 1); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id JOIN products p ON p.id=v.product_id WHERE p.external_id='MAT-000033' AND d.code='package_weight' AND v.value_number=25"), 1); pass("brand sync and exact title/weight guarded core writes");
  assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE d.code='legacy_note'"), 1); const immutable = await db.get("SELECT full_description,seo_title,price,image_url,title FROM products WHERE external_id='MAT-000033'"); assert.equal(immutable.full_description, null); assert.equal(immutable.title, DATA.PRODUCTS[0].expectedTitle); pass("unrelated attributes, descriptions, SEO, price, image and title preserved");
  await db.run("UPDATE products SET title='wrong title' WHERE external_id='MAT-000034'"); await assert.rejects(() => applyBatch(db, file, { only: ["MAT-000034"], confirm: CONFIRM, backupDir: path.dirname(file) }), /Identity mismatch/); await db.run("UPDATE products SET title=? WHERE external_id='MAT-000034'", [DATA.PRODUCTS[1].expectedTitle]); pass("title is guard-only and never a write target");
  assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id JOIN products p ON p.id=v.product_id WHERE p.external_id='MAT-000044' AND d.code='shelf_life'"), 0); assert.equal(await scalar(db, "SELECT COUNT(*) n FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE d.code='consumption_10mm'"), 0); pass("SCHEMA_BLOCKED shelf life and prohibited plaster fields are never written");
  const repeat = await applyBatch(db, file, { only: DATA.PRODUCTS.map(p => p.externalId), confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(repeat.writes, 0); pass("repeat apply is idempotent");
  await db.close();

  const rollbackFile = tempFile("rollback.db"); const rollbackDb = await fixture(rollbackFile); const rollbackBefore = await sha(rollbackFile); const failing = { ...rollbackDb, run(sql, params) { if (sql.startsWith("INSERT INTO product_attribute_values") && params?.[0] === 1) return Promise.reject(new Error("injected rollback")); return rollbackDb.run(sql, params); } }; await assert.rejects(() => applyBatch(failing, rollbackFile, { only: ["MAT-000033"], confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected rollback/); assert.equal(await sha(rollbackFile), rollbackBefore); assert.equal(await scalar(rollbackDb, "SELECT COUNT(*) n FROM product_attribute_definitions WHERE code='color'"), 0); pass("backup precedes mutation and transaction rollback restores definitions/values"); await rollbackDb.close();

  const duplicateFile = tempFile("duplicate.db"); const duplicateDb = await fixture(duplicateFile); await duplicateDb.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active) VALUES('mass','Масса упаковки','number','кг','Характеристики',0,1)"); await assert.rejects(() => inspectBatch(duplicateDb, { only: ["MAT-000033"] }), /Duplicate semantic definition/); pass("duplicate semantic mass/package definitions abort preflight"); await duplicateDb.close();
  console.log(`PASS ${passed} test groups; synthetic SQLite only`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
