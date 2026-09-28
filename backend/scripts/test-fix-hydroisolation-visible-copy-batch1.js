"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const ENGINE = require("./hydroisolation-batch1-engine");
const DATA = ENGINE.DATA;
const FIX = require("./fix-hydroisolation-visible-copy-batch1");

const now = "2026-09-28T00:00:00.000Z";
const OLD_FIELDS = {
  "MAT-000102": { full_description: "Готовая полиакриловая мастика СТК Профи БС-755 PROFI поставляется в ведре 5 кг. Производитель указывает её применение для обработки жилых и нежилых помещений, включая санузлы и ванные комнаты. Расход составляет 100–120 г/м². Характеристики других продуктов СТК Профи в этот текст не переносились." },
  "MAT-000104": { full_description: "Смесь Русеан НЦ в фасовке 25 кг основана на напрягающем цементе и предназначена для конструкционной гидроизоляции. Производитель описывает НЦ как специальную смесь для гидроизоляционных задач; доступный официальный материал допускает нанесение кистью или распылением. Технические параметры, по которым источники расходятся, в описание не включены." },
  "MAT-000107": {
    short_description: "Ceresit CR 166, комплект 32 кг по локальной карточке — двухкомпонентная эластичная гидроизоляция.",
    full_description: "Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ. Официальная упаковка включает компонент A — сухую смесь 24 кг — и компонент B — жидкий эластификатор 8 л; локальные title и products.weight остаются без изменений. Смесь наносят шпателем, кистью или механизированно на незасоленные минеральные основания без гипса. Плитку можно укладывать через 12 часов, гидравлическая нагрузка допускается через 7 суток.",
    seo_title: "Ceresit CR 166 комплект 32 кг — купить в Москве",
  },
};

function raw(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function (error) { error ? reject(error) : resolve({ changes: this.changes, id: this.lastID }); })); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function keyFor(field) { return ({ short_description: "shortDescription", full_description: "fullDescription", seo_title: "seoTitle" })[field]; }
function valuesFor(config, id) {
  const fields = FIX.CHANGES[id] || {};
  return Object.fromEntries(Object.keys(fields).map(field => [field, OLD_FIELDS[id][field]]));
}

async function fixture(file) {
  const db = raw(file);
  await run(db, "PRAGMA user_version=11");
  await run(db, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,category TEXT,subcategory TEXT,product_group TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER,sort_order INTEGER,source TEXT,last_imported_at TEXT,created_at TEXT,updated_at TEXT,deleted_at TEXT,deleted_by_id INTEGER,deleted_by_name TEXT,image_url TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,stock_status TEXT)`);
  await run(db, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
  await run(db, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER)");
  await run(db, "CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,is_required INTEGER,unit_override TEXT)");
  await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,alt_text TEXT,sort_order INTEGER,is_primary INTEGER)");
  const columns = "id,external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at,deleted_at,deleted_by_id,deleted_by_name,image_url,brand,short_description,full_description,seo_title,seo_description,stock_status";
  for (const config of DATA.PRODUCTS) {
    const mutable = valuesFor(config, config.externalId);
    const row = {
      id: config.expectedId, external_id: config.externalId, title: config.expectedTitle, slug: config.expectedSlug,
      category: config.expectedCategory, subcategory: config.expectedSubcategory, product_group: "Гидроизоляция",
      price: 1450, weight: config.expectedWeight, unit: config.expectedUnit, image: null, description: "immutable description",
      is_active: 1, sort_order: 4, source: "fixture", last_imported_at: now, created_at: now, updated_at: now,
      deleted_at: null, deleted_by_id: null, deleted_by_name: null, image_url: config.expectedImageUrl, brand: config.brand,
      short_description: mutable.short_description ?? "old short", full_description: mutable.full_description ?? "old full",
      seo_title: mutable.seo_title ?? "old SEO title", seo_description: "immutable SEO description", stock_status: "in_stock",
    };
    await run(db, `INSERT INTO products(${columns}) VALUES(${columns.split(",").map(() => "?").join(",")})`, columns.split(",").map(column => row[column]));
    await run(db, "INSERT INTO product_attribute_definitions VALUES(?,'immutable_'||?,'Immutable','text',NULL,NULL,1,1)", [config.expectedId, config.expectedId]);
    await run(db, "INSERT INTO product_attribute_templates VALUES(?,10,?,'regular',0,0,NULL)", [config.expectedId, config.expectedId]);
    await run(db, "INSERT INTO product_attribute_values VALUES(?,?,?,?,NULL,NULL,NULL,0,?,?)", [config.expectedId, config.expectedId, config.expectedId, "unchanged", now, now]);
    await run(db, "INSERT INTO product_images VALUES(?,?,?,'unchanged',0,1)", [config.expectedId, config.expectedId, config.expectedImageUrl]);
  }
  await close(db);
  return file;
}

async function main() {
  const root = fs.mkdtempSync(path.join(__dirname, ".tmp-hydro-visible-fix-"));
  let passed = 0;
  const pass = message => { passed += 1; console.log(`PASS ${message}`); };
  try {
    const byId = new Map(DATA.PRODUCTS.map(config => [config.externalId, config]));
    assert.equal(byId.get("MAT-000102").copy.fullDescription, "Готовая полиакриловая мастика СТК Профи БС-755 PROFI поставляется в ведре 5 кг. Предназначена для гидроизоляционной обработки жилых и нежилых помещений, включая санузлы и ванные комнаты. Расход составляет 100–120 г/м².");
    assert.equal(byId.get("MAT-000104").copy.fullDescription, "Русеан НЦ, 25 кг — сухая смесь на основе напрягающего цемента для конструкционной гидроизоляции. Применяется для подземных конструкций и ёмкостей. Состав наносят кистью или распылением.");
    assert.equal(byId.get("MAT-000107").copy.shortDescription, "Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ.");
    assert.equal(byId.get("MAT-000107").copy.fullDescription, "Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ. Комплект включает сухой компонент A 24 кг и жидкий эластификатор B 8 л. Состав наносят шпателем, кистью или механизированно на незасоленные минеральные основания без гипса. Плитку можно укладывать через 12 часов, гидравлическая нагрузка допускается через 7 суток.");
    assert.equal(byId.get("MAT-000107").copy.seoTitle, "Ceresit CR 166 A+B — купить гидроизоляцию в Москве");
    assert.equal(byId.get("MAT-000107").copy.seoDescription, "Двухкомпонентная гидроизоляция Ceresit CR 166: сухой компонент 24 кг и жидкий эластификатор 8 л. Для внутренних и наружных работ. Доставка по Москве.");
    pass("canonical 102/104/107 public copy matches approved exact text; MAT-000107 SEO description retained");

    const file = path.join(root, "fixture.db");
    await fixture(file);
    const only = FIX.ONLY.join(",");
    assert.deepEqual(FIX.parseArgs(["--db", file, "--only", only]).only.split(","), FIX.ONLY);
    for (const bad of ["MAT-000102", `${only},MAT-000108`, `${only},MAT-000107`]) assert.throws(() => FIX.parseArgs(["--db", file, "--only", bad]));
    pass("CLI accepts exact ordered allowlist only; subset, superset and duplicate reject");

    const beforeDry = hash(file);
    const readOnly = await ENGINE.dbOpen(file, true);
    const dry = await FIX.inspect(readOnly);
    await readOnly.close();
    assert.equal(dry.summary.ready, 3);
    assert.equal(dry.summary.existingOk, 0);
    assert.equal(hash(file), beforeDry);
    console.log(`FIX_DRY_RUN=${JSON.stringify(dry.summary)}`);
    pass("readonly dry-run identifies exactly the three approved corrections and preserves DB SHA");

    const preApplyDb = await ENGINE.dbOpen(file, true);
    const preApplyProducts = await preApplyDb.all("SELECT * FROM products ORDER BY id");
    const preApplyTables = {};
    for (const table of ["product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) preApplyTables[table] = await preApplyDb.all(`SELECT * FROM ${table} ORDER BY rowid`);
    await preApplyDb.close();

    const backupDir = path.join(root, "verified-backups");
    const writer = await ENGINE.dbOpen(file, false);
    const applied = await FIX.apply(writer, file, backupDir);
    assert.equal(applied.writes, 3);
    assert(applied.backup.path.startsWith(backupDir));
    assert(fs.existsSync(applied.backup.path));
    assert.match(applied.backup.sha256, /^[a-f0-9]{64}$/);
    assert.equal(applied.summary.existingOk, 3);
    console.log(`FIX_SYNTHETIC_APPLY=${JSON.stringify({ writes: applied.writes, existingOk: applied.summary.existingOk, backupVerified: Boolean(applied.backup.sha256) })}`);
    await writer.close();
    pass("apply uses the requested verified backup directory and updates exactly three product rows");

    const verify = await ENGINE.dbOpen(file, true);
    const rows = await verify.all("SELECT * FROM products ORDER BY id");
    const stable = value => JSON.stringify(value);
    for (const config of DATA.PRODUCTS) {
      const actual = rows.find(row => row.external_id === config.externalId);
      const original = preApplyProducts.find(row => row.external_id === config.externalId);
      assert.equal(actual.title, config.expectedTitle);
      assert.equal(actual.slug, config.expectedSlug);
      assert.equal(actual.weight, config.expectedWeight);
      assert.equal(actual.seo_description, "immutable SEO description");
      const expected = { ...original };
      for (const field of Object.keys(FIX.CHANGES[config.externalId] || {})) expected[field] = config.copy[keyFor(field)];
      assert.equal(stable(actual), stable(expected), `only approved copy fields may change for ${config.externalId}`);
    }
    for (const table of Object.keys(preApplyTables)) assert.equal(stable(await verify.all(`SELECT * FROM ${table} ORDER BY rowid`)), stable(preApplyTables[table]), `${table} must be byte-exact unchanged`);
    await verify.close();
    pass("only allowlisted copy values changed; product identity, other fields, attributes, templates, definitions and images remain intact");

    const second = await ENGINE.dbOpen(file, false);
    const secondRun = await FIX.apply(second, file, backupDir);
    assert.equal(secondRun.writes, 0);
    assert.equal(secondRun.backup, null);
    console.log(`FIX_SYNTHETIC_SECOND_RUN=${JSON.stringify({ writes: secondRun.writes, existingOk: secondRun.summary.existingOk })}`);
    await second.close();
    pass("second apply is EXISTING_OK with zero writes and safely skips backup");

    const thirdValue = path.join(root, "third-value.db");
    await fixture(thirdValue);
    const bad = await ENGINE.dbOpen(thirdValue, false);
    await bad.run("UPDATE products SET full_description='operator edit' WHERE external_id='MAT-000102'");
    await assert.rejects(() => FIX.inspect(bad), /MIGRATION_GUARD_BLOCKED MAT-000102\/full_description/);
    await bad.close();
    pass("third-party value blocks instead of being overwritten");

    const rollback = path.join(root, "rollback.db");
    await fixture(rollback);
    const triggerDb = await ENGINE.dbOpen(rollback, false);
    await triggerDb.run("CREATE TRIGGER fail_hydro_copy BEFORE UPDATE OF seo_title ON products BEGIN SELECT RAISE(ABORT,'injected corrective failure'); END");
    await triggerDb.close();
    const beforeRollback = hash(rollback);
    const rollWriter = await ENGINE.dbOpen(rollback, false);
    await assert.rejects(() => FIX.apply(rollWriter, rollback, path.join(root, "rollback-backup")), /injected corrective failure/);
    await rollWriter.close();
    assert.equal(hash(rollback), beforeRollback);
    pass("transaction rolls back earlier target updates when the final target write fails");

    const wrongTitle = path.join(root, "wrong-title.db");
    await fixture(wrongTitle);
    const wrong = await ENGINE.dbOpen(wrongTitle, false);
    await wrong.run("UPDATE products SET title='Changed title' WHERE external_id='MAT-000104'");
    await assert.rejects(() => FIX.inspect(wrong), /IDENTITY_GUARD_BLOCKED MAT-000104/);
    await wrong.close();
    pass("exact product identity change blocks correction");

    const existing = path.join(root, "already-new.db");
    await fixture(existing);
    const ex = await ENGINE.dbOpen(existing, false);
    for (const config of DATA.PRODUCTS) for (const field of Object.keys(FIX.CHANGES[config.externalId] || {})) await ex.run(`UPDATE products SET ${field}=? WHERE external_id=?`, [config.copy[keyFor(field)], config.externalId]);
    const already = await FIX.apply(ex, existing, root);
    assert.equal(already.summary.existingOk, 3);
    assert.equal(already.writes, 0);
    await ex.close();
    pass("all-new values are idempotently EXISTING_OK");
    console.log(`PASS ${passed} hydro visible-copy corrective test groups; synthetic temporary SQLite only`);
  } finally {
    try { fs.rmSync(root, { recursive: true, force: true }); } catch (error) { console.warn(`TEMP_FIXTURE_CLEANUP_SKIPPED=${root} (${error.code})`); }
  }
}

if (require.main === module) main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
module.exports = { main, fixture };
