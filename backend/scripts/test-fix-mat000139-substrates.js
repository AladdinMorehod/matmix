"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const sqlite3 = require("sqlite3").verbose();
const ENGINE = require("./tile-adhesive-batch1-engine");
const FIX = require("./fix-mat000139-substrates");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "fix-mat000139-substrates-"));
const now = "2026-10-06T00:00:00.000Z";
const stable = value => JSON.stringify(value);
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const raw = file => new sqlite3.Database(file);
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const close = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
let checks = 0;
function pass(label) { checks += 1; console.log(`PASS ${label}`); }

async function fixture(name, options = {}) {
  const file = path.join(root, `${name}.db`);
  const db = raw(file);
  try {
    await run(db, "PRAGMA user_version=11");
    await run(db, "CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,normalized_name TEXT,external_code TEXT,is_active INTEGER)");
    await run(db, "CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,slug TEXT,category TEXT,subcategory TEXT,brand TEXT,weight REAL,unit TEXT,price REAL,stock_status TEXT,product_group TEXT,description TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image TEXT,image_url TEXT,is_active INTEGER,deleted_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER,created_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,is_required INTEGER,unit_override TEXT,created_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER)");
    await run(db, "INSERT INTO products VALUES(1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
      options.externalId ?? FIX.PRODUCT.externalId,
      options.title ?? FIX.PRODUCT.title,
      "mat-000139-granit",
      FIX.PRODUCT.category,
      FIX.PRODUCT.subcategory,
      null,
      FIX.PRODUCT.weight,
      FIX.PRODUCT.unit,
      100,
      "in_stock",
      FIX.PRODUCT.subcategory,
      "Описание без изменений",
      "Кратко",
      "Полное описание",
      "SEO title",
      "SEO description",
      "placeholder",
      "/uploads/products/shared-placeholder.png",
      1,
      null,
      now
    ]);
    await run(db, "INSERT INTO products VALUES(2,'MAT-OTHER','Другой товар','other','Другая категория','Другая подкатегория','Другой бренд',1,'шт',1,'in_stock','other','desc','short','full','seo','seo desc','img','/other.png',1,NULL,?)", [now]);
    await run(db, "INSERT INTO product_attribute_definitions VALUES(1,'substrates','Применимые основания','text',NULL,'Характеристики',1,1,?,?)", [now, now]);
    await run(db, "INSERT INTO product_attribute_definitions VALUES(2,'purpose','Назначение','text',NULL,'Характеристики',2,1,?,?)", [now, now]);
    await run(db, "INSERT INTO product_attribute_values VALUES(1,1,1,?,?,?,?,0,?,?)", [options.value ?? FIX.OLD_VALUE, null, null, null, now, now]);
    await run(db, "INSERT INTO product_attribute_values VALUES(2,2,2,'Тестовое назначение',NULL,NULL,NULL,0,?,?)", [now, now]);
    if (options.duplicate) await run(db, "INSERT INTO product_attribute_values VALUES(3,1,1,?,NULL,NULL,NULL,0,?,?)", [FIX.OLD_VALUE, now, now]);
    if (options.failUpdate) await run(db, "CREATE TRIGGER fail_substrates_update BEFORE UPDATE ON product_attribute_values BEGIN SELECT RAISE(ABORT,'fixture update failure'); END");
  } finally {
    await close(db);
  }
  return file;
}

async function snapshot(file) {
  const db = await ENGINE.dbOpen(file, true);
  try { return await ENGINE.snapshots(db); } finally { await db.close(); }
}

async function main() {
  const dryFile = await fixture("dry-run");
  const dryHash = hash(dryFile);
  const dryDb = await ENGINE.dbOpen(dryFile, false);
  try {
    const result = await FIX.inspect(dryDb);
    assert.equal(result.status, "READY");
    assert.equal(result.willFix, 1);
    assert.equal(result.report.rowId, 1);
  } finally { await dryDb.close(); }
  assert.equal(hash(dryFile), dryHash, "dry-run must not change database bytes");
  pass("exact old value dry-run reports WILL_FIX=1 and DB hash is unchanged");

  const wrongValue = await fixture("wrong-value", { value: "другое значение" });
  const wrongValueDb = await ENGINE.dbOpen(wrongValue, false);
  try { await assert.rejects(() => FIX.inspect(wrongValueDb), /neither exact approved old nor corrected value/); }
  finally { await wrongValueDb.close(); }
  pass("wrong current value blocks");

  const wrongTitle = await fixture("wrong-title", { title: "Похожий клей ЮНИС 25 кг" });
  const wrongTitleDb = await ENGINE.dbOpen(wrongTitle, false);
  try { await assert.rejects(() => FIX.inspect(wrongTitleDb), /IDENTITY_BLOCKED/); }
  finally { await wrongTitleDb.close(); }
  pass("wrong product identity/title blocks");

  const wrongMat = await fixture("wrong-mat", { externalId: "MAT-000138" });
  const wrongMatDb = await ENGINE.dbOpen(wrongMat, false);
  try { await assert.rejects(() => FIX.inspect(wrongMatDb), /expected exactly one MAT-000139, found 0/); }
  finally { await wrongMatDb.close(); }
  pass("wrong MAT blocks");

  const duplicate = await fixture("duplicate", { duplicate: true });
  const duplicateDb = await ENGINE.dbOpen(duplicate, false);
  try { await assert.rejects(() => FIX.inspect(duplicateDb), /expected exactly one MAT-000139\/substrates row, found 2/); }
  finally { await duplicateDb.close(); }
  pass("duplicate target value rows block");

  assert.throws(() => FIX.parseArgs(["--db", dryFile, "--apply", "--backup-dir", path.join(root, "no-confirm")]), /requires --backup-dir and --confirm/);
  assert.throws(() => FIX.parseArgs(["--db", dryFile, "--apply", "--confirm", "WRONG", "--backup-dir", path.join(root, "wrong-token")]), /requires --backup-dir and --confirm/);
  pass("apply without exact confirmation token blocks");

  const applyFile = await fixture("apply");
  const before = await snapshot(applyFile);
  const applyDb = await ENGINE.dbOpen(applyFile, true);
  let applied;
  try { applied = await FIX.apply(applyDb, applyFile, path.join(root, "backups")); }
  finally { await applyDb.close(); }
  assert.equal(applied.writes, 1);
  assert.equal(applied.backup.verified, true);
  assert.equal(applied.backup.schemaVersion, 11);
  const after = await snapshot(applyFile);
  assert.deepEqual(after.products, before.products);
  assert.deepEqual(after.product_attribute_definitions, before.product_attribute_definitions);
  assert.deepEqual(after.product_attribute_templates, before.product_attribute_templates);
  assert.deepEqual(after.product_images, before.product_images);
  assert.equal(after.product_attribute_values.length, before.product_attribute_values.length);
  assert.deepEqual(after.product_attribute_values.find(row => row.id === 1), { ...before.product_attribute_values.find(row => row.id === 1), value_text: FIX.NEW_VALUE });
  assert.deepEqual(after.product_attribute_values.find(row => row.id === 2), before.product_attribute_values.find(row => row.id === 2));
  pass("apply fixture changes exactly one value_text with a verified backup; other products/tables unchanged");

  const idempotentDb = await ENGINE.dbOpen(applyFile, false);
  try {
    const idempotent = await FIX.inspect(idempotentDb);
    assert.equal(idempotent.status, "EXISTING_OK");
    assert.equal(idempotent.willFix, 0);
  } finally { await idempotentDb.close(); }
  pass("second dry-run reports EXISTING_OK and zero writes");

  const rollbackFile = await fixture("rollback", { failUpdate: true });
  const rollbackBefore = await snapshot(rollbackFile);
  const rollbackDb = await ENGINE.dbOpen(rollbackFile, true);
  try { await assert.rejects(() => FIX.apply(rollbackDb, rollbackFile, path.join(root, "backups")), /fixture update failure/); }
  finally { await rollbackDb.close(); }
  assert.deepEqual(await snapshot(rollbackFile), rollbackBefore);
  pass("transaction rolls back fully after injected UPDATE failure");

  console.log(`PASS_COUNT=${checks}`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; }).finally(() => {
  try { fs.rmSync(root, { recursive: true, force: true }); }
  catch (error) { console.warn(`TEMP_FIXTURE_CLEANUP_SKIPPED=${error.code}`); }
});
