"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mat000076-unis-armored-fix");
const CORE = require("./data/floor-mixes-core-batch1");
const { ONLY, PRODUCT_WRITES, applyBatch, inspect, openDatabase, parseArgs } = require("./fix-mat000076-unis-armored");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mat000076-fix-"));
const tempFile = name => path.join(root, `${name}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes, id: this.lastID }); }));
const close = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));

const OLD_SPECS = Object.freeze({
  product_type: "Армированный базовый ровнитель для пола", package_weight: 20,
  layer_thickness: "30–300 мм", water_requirement: "3,8–4,8 л на 20 кг",
  pot_life: "1 час", compressive_strength: 15, adhesion: 0.6,
  shelf_life: 12, consumption: "около 1,8 кг/м²/мм", walkability: "12 часов"
});

async function createFixture(file) {
  const db = new sqlite3.Database(file);
  await run(db, "CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT NOT NULL,title TEXT NOT NULL,slug TEXT,category TEXT,subcategory TEXT,product_group TEXT,brand TEXT,price REAL,weight REAL,unit TEXT,short_description TEXT,full_description TEXT,description TEXT,seo_title TEXT,seo_description TEXT,image TEXT,image_url TEXT,stock_status TEXT,is_active INTEGER,deleted_at TEXT,updated_at TEXT)");
  await run(db, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT NOT NULL,label TEXT NOT NULL,data_type TEXT NOT NULL,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER,created_at TEXT,updated_at TEXT)");
  await run(db, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER NOT NULL,attribute_definition_id INTEGER NOT NULL,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
  await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER NOT NULL,image_url TEXT NOT NULL,sort_order INTEGER,is_primary INTEGER)");
  let defId = 1;
  for (const [code, spec] of Object.entries(DATA.ATTRIBUTE_CHANGES)) {
    await run(db, "INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,'Характеристики',0,1,'seed','seed')", [defId++, code, code, spec.dataType, spec.unit]);
  }
  await run(db, "INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(99,'brand','Бренд','text',NULL,'Основные',0,1,'seed','seed')");
  const ids = { "MAT-000002": 2, "MAT-000075": 75, "MAT-000076": 76, "MAT-000077": 77, "MAT-OTHER": 999 };
  for (const [externalId, id] of Object.entries(ids)) {
    const isTarget = externalId === DATA.EXTERNAL_ID;
    await run(db, "INSERT INTO products(id,external_id,title,slug,category,subcategory,product_group,brand,price,weight,unit,short_description,full_description,description,seo_title,seo_description,image,image_url,stock_status,is_active,deleted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [id, externalId, isTarget ? DATA.OLD_PRODUCT.title : `Untouched ${externalId}`, isTarget ? DATA.SLUG : `slug-${externalId}`, "Смеси", "Наливной Пол", "UNIS", "UNIS", 137.5, isTarget ? 20 : 20, "шт", isTarget ? DATA.OLD_PRODUCT.short_description : "unchanged short", isTarget ? DATA.OLD_PRODUCT.full_description : "unchanged full", "legacy description", isTarget ? DATA.OLD_PRODUCT.seo_title : "unchanged seo title", isTarget ? DATA.OLD_PRODUCT.seo_description : "unchanged seo description", "symbol", isTarget ? "/uploads/old.webp" : "/uploads/other.webp", "in_stock", 1, null, "unchanged timestamp"]);
    await run(db, "INSERT INTO product_attribute_values(id,product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,NULL,NULL,NULL,0,'seed','seed')", [id + 5000, id, 99, "UNIS"]);
  }
  let valueId = 10000;
  for (const [code, spec] of Object.entries(DATA.ATTRIBUTE_CHANGES)) {
    if (spec.old === null) continue;
    const valueText = spec.dataType === "text" ? String(spec.old) : null;
    const valueNumber = spec.dataType === "number" ? Number(spec.old) : null;
    await run(db, "INSERT INTO product_attribute_values(id,product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,76,?,?,?,NULL,NULL,1,'old','old')", [valueId++, Object.keys(DATA.ATTRIBUTE_CHANGES).indexOf(code) + 1, valueText, valueNumber]);
  }
  await run(db, "INSERT INTO product_images(id,product_id,image_url,sort_order,is_primary) VALUES(1,76,'/uploads/old.webp',0,1)");
  await close(db);
}

async function raw(file) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file, sqlite3.OPEN_READWRITE, error => error ? reject(error) : resolve(db)); }); }
async function getRaw(file, sql, params = []) { const db = await raw(file); try { return await new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); } finally { await close(db); } }
async function updateRaw(file, sql, params = []) { const db = await raw(file); try { return await run(db, sql, params); } finally { await close(db); } }

async function test() {
  let passed = 0; const pass = message => { passed += 1; console.log(`PASS ${message}`); };
  assert.deepStrictEqual(parseArgs(["--db", "fixture.db", "--only", "MAT-000076"]).only, "MAT-000076");
  for (const only of ["MAT-000075", "MAT-000076,MAT-000077", "MAT-000076,MAT-000076", "MAT-000076,MAT-000222", "MAT-000076,"]) assert.throws(() => parseArgs(["--db", "fixture.db", "--only", only]), /Exact --only/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", "MAT-000076", "--apply", "--confirm", DATA.CONFIRM]), /--backup-dir/);
  await assert.rejects(() => applyBatch(null, "unused.db", { only: "MAT-000075", confirm: DATA.CONFIRM, backupDir: root }), /exact --only MAT-000076/);
  assert.strictEqual(ONLY.length, 1); assert.strictEqual(ONLY[0], "MAT-000076");
  assert.deepStrictEqual(PRODUCT_WRITES, ["title", "weight", "short_description", "full_description", "seo_title", "seo_description"]);
  pass("exact one-MAT allowlist and apply flags guard");

  const dryFile = tempFile("dry"); await createFixture(dryFile); const before = sha(dryFile); let db = await openDatabase(dryFile, false);
  const dry = await inspect(db); assert.strictEqual(dry.status, "READY"); assert.strictEqual(dry.summary.willFix, Object.keys(DATA.ATTRIBUTE_CHANGES).length - 2); assert.strictEqual(dry.productChanges.length, DATA.PRODUCT_MUTABLE_FIELDS.length); await db.close();
  assert.strictEqual(sha(dryFile), before); console.log(`DRY_RUN ${JSON.stringify({ total: dry.summary.total, status: dry.status, productWillFix: dry.productChanges.length, attributeWillFix: dry.summary.willFix, existingOk: dry.summary.existingOk, blockers: dry.summary.blockers, errors: dry.summary.errors, databaseUnchanged: sha(dryFile) === before })}`); pass("default inspect is read-only and reports guarded writes only");

  for (const [label, sql, params] of [
    ["wrong title", "UPDATE products SET title='changed' WHERE external_id='MAT-000076'", []],
    ["wrong weight", "UPDATE products SET weight=21 WHERE external_id='MAT-000076'", []],
    ["wrong existing attribute", "UPDATE product_attribute_values SET value_text='wrong' WHERE product_id=76 AND attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='layer_thickness')", []],
    ["incompatible existing definition", "UPDATE product_attribute_definitions SET data_type='number' WHERE code='layer_thickness'", []],
    ["partial title update", "UPDATE products SET title=? WHERE external_id='MAT-000076'", [DATA.NEW_PRODUCT.title]],
    ["partial attribute update", "UPDATE product_attribute_values SET value_text=? WHERE product_id=76 AND attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='water_requirement')", [DATA.ATTRIBUTE_CHANGES.water_requirement.value]]
  ]) {
    const file = tempFile(label.replace(/\s+/g, "-")); await createFixture(file); await updateRaw(file, sql, params); db = await openDatabase(file, false); const blocked = await inspect(db); await db.close(); assert.strictEqual(blocked.status, "BLOCKED", label); assert(blocked.guards.length > 0);
  }
  pass("wrong title/weight/attribute, incompatible schema and partially corrected state block the correction");

  const applyFile = tempFile("apply"); await createFixture(applyFile); const backupDir = path.join(root, "operator-backup"); db = await openDatabase(applyFile, true);
  const beforeTarget = await db.get("SELECT * FROM products WHERE external_id='MAT-000076'"); const beforeOther = await db.all("SELECT * FROM products WHERE external_id IN ('MAT-000002','MAT-000075','MAT-000077') ORDER BY external_id"); const beforeValues = await db.all("SELECT * FROM product_attribute_values WHERE product_id<>76 OR attribute_definition_id=99 ORDER BY id"); const beforeDefs = await db.all("SELECT * FROM product_attribute_definitions ORDER BY id");
  const applied = await applyBatch(db, applyFile, { only: DATA.EXTERNAL_ID, confirm: DATA.CONFIRM, backupDir });
  assert.strictEqual(applied.status, "EXISTING_OK"); assert(applied.writes > 0); assert(fs.existsSync(applied.backup)); assert.strictEqual(path.dirname(applied.backup), backupDir);
  const backupDb = await openDatabase(applied.backup, false); assert.strictEqual((await backupDb.get("SELECT title FROM products WHERE external_id='MAT-000076'")).title, DATA.OLD_PRODUCT.title); await backupDb.close();
  const afterTarget = await db.get("SELECT * FROM products WHERE external_id='MAT-000076'"); const afterOther = await db.all("SELECT * FROM products WHERE external_id IN ('MAT-000002','MAT-000075','MAT-000077') ORDER BY external_id");
  assert.strictEqual(afterTarget.title, DATA.NEW_PRODUCT.title); assert.strictEqual(afterTarget.weight, 25); assert.strictEqual(afterTarget.slug, DATA.SLUG); assert.strictEqual(afterTarget.price, beforeTarget.price); assert.strictEqual(afterTarget.unit, beforeTarget.unit); assert.strictEqual(afterTarget.image_url, beforeTarget.image_url); assert.strictEqual(afterTarget.category, beforeTarget.category); assert.strictEqual(afterTarget.subcategory, beforeTarget.subcategory); assert.strictEqual(afterTarget.stock_status, beforeTarget.stock_status); assert.strictEqual(afterTarget.updated_at, beforeTarget.updated_at); assert.deepStrictEqual(afterOther, beforeOther);
  assert.strictEqual(afterTarget.short_description, DATA.NEW_PRODUCT.short_description); assert.strictEqual(afterTarget.full_description, DATA.NEW_PRODUCT.full_description); assert.strictEqual(afterTarget.seo_title, DATA.NEW_PRODUCT.seo_title); assert.strictEqual(afterTarget.seo_description, DATA.NEW_PRODUCT.seo_description);
  assert.deepStrictEqual(await db.all("SELECT * FROM product_attribute_definitions ORDER BY id"), beforeDefs); assert.deepStrictEqual(await db.all("SELECT * FROM product_attribute_values WHERE product_id<>76 OR attribute_definition_id=99 ORDER BY id"), beforeValues);
  const updatedValues = await db.all("SELECT v.*,d.code FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=76");
  for (const [code, change] of Object.entries(DATA.ATTRIBUTE_CHANGES)) { const row = updatedValues.find(item => item.code === code); assert(row, code); assert.strictEqual(change.dataType === "text" ? row.value_text : Number(row.value_number), change.value, code); }
  const remainingWrong = updatedValues.filter(row => ["30–300 мм", "3,8–4,8 л на 20 кг", "15", "0.6", "1 час"].includes(row.value_text) || [15, 0.6].includes(row.value_number)); assert.strictEqual(remainingWrong.length, 0);
  const stable = await applyBatch(db, applyFile, { only: DATA.EXTERNAL_ID, confirm: DATA.CONFIRM, backupDir }); assert.strictEqual(stable.writes, 0); assert.strictEqual(stable.status, "EXISTING_OK"); assert.strictEqual(stable.backup, null);
  await db.close(); pass("backup path, targeted writes, immutable fields, P075/P077 preservation and idempotent repeat");

  const rollbackFile = tempFile("rollback"); await createFixture(rollbackFile); await updateRaw(rollbackFile, "CREATE TRIGGER fail_insert BEFORE INSERT ON product_attribute_values WHEN NEW.attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='purpose') BEGIN SELECT RAISE(ABORT,'forced rollback'); END");
  db = await openDatabase(rollbackFile, true); await assert.rejects(() => applyBatch(db, rollbackFile, { only: DATA.EXTERNAL_ID, confirm: DATA.CONFIRM, backupDir }), /forced rollback/); const rolledBack = await db.get("SELECT title,weight,full_description FROM products WHERE external_id='MAT-000076'"); assert.strictEqual(rolledBack.title, DATA.OLD_PRODUCT.title); assert.strictEqual(rolledBack.weight, 20); assert.strictEqual(rolledBack.full_description, DATA.OLD_PRODUCT.full_description); await db.close(); pass("transaction rollback restores product and attribute changes after backup");

  assert.strictEqual(DATA.NEW_PRODUCT.title, "Наливной пол UNIS Горизонт Армированный 25 кг");
  assert.strictEqual(DATA.NEW_PRODUCT.short_description, "UNIS Горизонт Армированный — высокопрочный базовый ровнитель для пола. Фасовка — 25 кг.");
  assert.strictEqual(DATA.NEW_PRODUCT.full_description, "UNIS Горизонт Армированный — высокопрочный армированный базовый ровнитель для пола в фасовке 25 кг. Материал предназначен для подготовки прочных ровных оснований под напольные покрытия и финишные ровнители. Толщина слоя — 10–200 мм, расход — 1,8 кг/м² на каждый миллиметр слоя. Возможность хождения — через 12 часов.");
  assert.strictEqual(DATA.NEW_PRODUCT.seo_title, "UNIS Горизонт Армированный 25 кг — ровнитель купить в Москве");
  assert.strictEqual(DATA.NEW_PRODUCT.seo_description, "Высокопрочный армированный базовый ровнитель UNIS Горизонт Армированный 25 кг. Слой 10–200 мм, расход 1,8 кг/м²/мм. Закажите с доставкой по Москве и МО.");
  assert.strictEqual(DATA.ATTRIBUTE_CHANGES.consumption.value, "1,8 кг/м²/мм");
  assert.strictEqual(DATA.ATTRIBUTE_CHANGES.package_weight.value, 25);
  const reviewed76 = CORE.PRODUCTS.find(row => row.externalId === "MAT-000076");
  for (const code of ["purpose", "application_area", "substrates", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "shelf_life", "consumption", "flexural_strength", "walkability"]) assert.strictEqual(reviewed76.core[code].status, "READY", code);
  assert.deepStrictEqual(reviewed76.core.application_temperature.sources, ["unisArmoredTds"]);
  assert(reviewed76.core.water_requirement.sources.includes("unisArmoredCurrent"));
  assert(CORE.SOURCES.unisArmoredCurrent.provenanceNote.includes("не усредняются"));
  const p75 = CORE.PRODUCTS.find(row => row.externalId === "MAT-000075"); const p77 = CORE.PRODUCTS.find(row => row.externalId === "MAT-000077");
  assert.strictEqual(p75.identityStatus, "IDENTITY_UNCERTAIN"); assert.strictEqual(p77.identityStatus, "SOURCE_CONFLICT");
  pass("reviewed current facts, normalized consumption and P075/P077 blockers retained");

  console.log(`PASS ${passed} test groups`);
}

test().finally(() => { try { fs.rmSync(root, { recursive: true, force: true }); } catch {} }).catch(error => { console.error(error.stack || error); process.exitCode = 1; });
