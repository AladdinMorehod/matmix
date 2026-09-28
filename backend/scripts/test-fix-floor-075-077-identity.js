"use strict";

const assert = require("assert");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const fs = require("fs");
const Module = require("module");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/floor-075-077-identity-fix");
const FLOOR = require("./data/floor-mixes-core-batch1");
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const { CONFIRM, TARGETS, WRITABLE_ATTRIBUTE_CODES, WRITABLE_PRODUCT_FIELDS, applyBatch, inspectBatch, normalizeOnly, openDatabase, parseArgs } = require("./fix-floor-075-077-identity");

const AUDIT_REF = "c330cf1c8d516b7e0438d68f3cbc9a00baeede05";
const tempFile = label => path.join(os.tmpdir(), `matmix-floor-075-077-${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const runRaw = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const closeRaw = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
const dataProduct = id => DATA.PRODUCTS.find(product => product.externalId === id);
const floorProduct = id => FLOOR.PRODUCTS.find(product => product.externalId === id);

function fromGitModule(ref, sourcePath, virtualFileName) {
  const source = execFileSync("git", ["show", `${ref}:${sourcePath}`], { encoding: "utf8" });
  const filename = path.resolve(__dirname, virtualFileName);
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(__dirname);
  loaded._compile(source, filename);
  return loaded.exports;
}

async function makeFixture(file) {
  const raw = new sqlite3.Database(file);
  await runRaw(raw, `CREATE TABLE products(
    id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,slug TEXT,category TEXT,subcategory TEXT,price REAL,weight REAL,unit TEXT,brand TEXT,
    short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,image_url TEXT,stock_status TEXT,is_active INTEGER,deleted_at TEXT,
    description TEXT,updated_at TEXT,created_at TEXT,product_group TEXT,sort_order INTEGER,source TEXT,last_imported_at TEXT)`);
  await runRaw(raw, "CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER)");
  await runRaw(raw, "CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,is_active INTEGER,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
  await runRaw(raw, "CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,sort_order INTEGER,is_required INTEGER,unit_override TEXT)");
  await runRaw(raw, "CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT)");
  await runRaw(raw, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
  await runRaw(raw, "INSERT INTO catalog_structure VALUES(7,1,'subcategory','Наливной Пол',1)");
  const allCodes = [...new Set(DATA.EXPECTED_TEMPLATE_CODES)];
  for (const code of allCodes) {
    const contract = DATA.DEFINITION_CONTRACT[code];
    await runRaw(raw, "INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,is_active,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,1,0,'fixture','fixture')", [allCodes.indexOf(code) + 1, code, code, contract.type, contract.unit]);
    await runRaw(raw, "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,sort_order,is_required,unit_override) VALUES(7,?,?,0,NULL)", [allCodes.indexOf(code) + 1, allCodes.indexOf(code)]);
  }
  for (const id of TARGETS) {
    const product = dataProduct(id);
    const row = product.expectedProduct;
    await runRaw(raw, `INSERT INTO products(id,external_id,title,slug,category,subcategory,price,weight,unit,brand,short_description,full_description,seo_title,seo_description,image_url,stock_status,is_active,deleted_at,description,updated_at,created_at,product_group,sort_order,source,last_imported_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?)`, [Number(id.slice(-3)), id, row.title, row.slug, row.category, row.subcategory, row.price, row.weight, row.unit, row.brand, row.short_description, row.full_description, row.seo_title, row.seo_description, row.image_url, row.stock_status, row.is_active, row.deleted_at, "legacy description untouched", "fixture-time", "fixture-time", "materials", 8, "fixture", "fixture-import"]);
  }
  const other = floorProduct("MAT-000076");
  await runRaw(raw, `INSERT INTO products(id,external_id,title,slug,category,subcategory,price,weight,unit,brand,short_description,full_description,seo_title,seo_description,image_url,stock_status,is_active,deleted_at,description,updated_at,created_at,product_group,sort_order,source,last_imported_at)
    VALUES(76,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [other.externalId, other.expectedTitle, "mat076-current-slug", "Смеси", "Наливной Пол", 399, 25, "шт", "UNIS", "076 short", "076 full", "076 SEO title", "076 SEO description", "/uploads/products/MAT-000076-existing.webp", "unknown", 1, null, "076 legacy description", "preserve-076", "preserve-076-created", "materials", 76, "fixture", "preserve-076-import"]);
  const ids = new Map(allCodes.map(code => [code, allCodes.indexOf(code) + 1]));
  let valueId = 1;
  for (const id of TARGETS) {
    const productId = Number(id.slice(-3));
    const product = dataProduct(id).expectedProduct;
    for (const [code, stored] of Object.entries({ brand: { text: product.brand, number: null, unit: null }, package_weight: { text: null, number: product.weight, unit: null } })) {
      await runRaw(raw, "INSERT INTO product_attribute_values(id,product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,NULL,?,0,'fixture','fixture')", [valueId++, productId, ids.get(code), stored.text, stored.number, stored.unit]);
    }
  }
  await runRaw(raw, "INSERT INTO product_attribute_values(id,product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(900,76,?,NULL,25,NULL,'кг',3,'076-value','076-value')", [ids.get("package_weight")]);
  await closeRaw(raw);
  return { path: file, definitions: ids };
}

async function mutateFixture(mutator) {
  const file = tempFile("guard");
  const fixture = await makeFixture(file);
  const db = new sqlite3.Database(file);
  await mutator(db, fixture);
  await closeRaw(db);
  return { ...fixture, db: await openDatabase(file, true) };
}

function attrValue(code, value, definition) {
  return {
    code,
    value_text: definition.data_type === "text" ? String(value) : null,
    value_number: definition.data_type === "number" ? Number(value) : null,
    value_boolean: null,
    unit_override: definition.default_unit || null,
    default_unit: definition.default_unit,
    data_type: definition.data_type
  };
}

async function fixtureSnapshot(db) {
  const result = {};
  for (const table of ["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates"]) {
    result[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
  }
  return result;
}

async function testAuditFixture() {
  const audit = fromGitModule(AUDIT_REF, "backend/scripts/audit-closed-product-subcategories.js", "audit-closed-product-subcategories-c330-fixture.js");
  for (const id of ["MAT-000075", "MAT-000076", "MAT-000077"]) {
    const product = floorProduct(id);
    const current = FLOOR.DISCOVERY.rows.find(row => row.externalId === id);
    const attrs = Object.entries(product.core).flatMap(([code, fact]) => {
      if (fact.status !== "READY" || fact.value === null || fact.value === undefined) return [];
      const definition = FLOOR.REUSABLE_DEFINITIONS[code];
      assert(definition, `missing audit fixture definition for ${code}`);
      return [attrValue(code, fact.value, { data_type: definition.dataType, default_unit: definition.defaultUnit })];
    });
    const result = audit.reconcileSourceProduct({ external_id: id, title: current.currentTitle, slug: current.current.slug, category: current.current.category, subcategory: current.current.subcategory, brand: product.core.brand.value, weight: product.core.package_weight.value, unit: current.current.unit, is_active: 1, deleted_at: null }, attrs);
    assert(!["SOURCE_BLOCKED", "SOURCE_PROVENANCE_ANOMALY"].includes(result.status), `${id} source classification: ${JSON.stringify(result)}`);
    assert(!result.anomalies.length, `${id} source anomalies: ${JSON.stringify(result.anomalies)}`);
    const readiness = audit.readiness(
      { external_id: id, slug: current.current.slug, title: current.currentTitle, category: current.current.category, is_active: 1, deleted_at: null },
      { attributeStatus: "ATTR_PARTIAL", mainCanonical: { brand: true } },
      { status: "SEO_OK" }, { status: "IMAGE_OK", issues: [] }, result
    );
    assert(!readiness.flags.some(flag => ["SOURCE_BLOCKED", "SOURCE_PROVENANCE_ANOMALY", "SEO_MISSING", "SEO_ANOMALY"].some(prefix => flag.startsWith(prefix))), `${id} readiness flags: ${JSON.stringify(readiness.flags)}`);
  }
  return audit;
}

async function main() {
  let passed = 0;
  const pass = message => { passed += 1; console.log(`PASS ${message}`); };

  assert.deepStrictEqual(normalizeOnly(TARGETS), TARGETS);
  assert.deepStrictEqual(parseArgs(["--db", "fixture.db", "--only", TARGETS.join(",")]).only, TARGETS);
  for (const invalid of [TARGETS.slice(0, 1), [...TARGETS, "MAT-000078"], [TARGETS[0], TARGETS[0]], [...TARGETS].reverse(), [TARGETS[0], "MAT-000076"]]) assert.throws(() => normalizeOnly(invalid), /Exact ordered floor identity batch required/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", TARGETS.join(","), "--apply"]), /--confirm/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", TARGETS.join(","), "--apply", "--confirm", CONFIRM]), /--backup-dir/);
  pass("exact ordered two-MAT allowlist and apply CLI contract");

  assert.equal(WRITABLE_PRODUCT_FIELDS.join(","), "short_description,full_description,seo_title,seo_description");
  assert(!WRITABLE_ATTRIBUTE_CODES.includes("compressive_strength"));
  assert(WRITABLE_ATTRIBUTE_CODES.includes("flexural_strength"));
  assert(!WRITABLE_ATTRIBUTE_CODES.includes("purpose"));
  assert(WRITABLE_ATTRIBUTE_CODES.every(code => DATA.EXPECTED_TEMPLATE_CODES.includes(code)));
  const m75 = dataProduct("MAT-000075"); const m77 = dataProduct("MAT-000077");
  assert.equal(m75.identityStatus, "READY_FOR_CORE_REVIEW"); assert.equal(m75.expectedTitle, 'Наливной пол "Unis Горизонт" 20 кг');
  assert.match(DATA.SOURCES.unisM45OwnerPack.provenanceNote, /М-45/); assert.match(DATA.SOURCES.unisM45Current.provenanceNote, /Универсальный \/ F-45/); assert.match(DATA.SOURCES.unisM45OwnerIdentity.provenanceNote, /только как точный guard/);
  assert.equal(m77.identityStatus, "READY_FOR_CORE_REVIEW"); assert.match(DATA.SOURCES.starateli77OwnerPack.provenanceNote, /БЫСТРОТВЕРДЕЮЩИЙ/); assert.match(DATA.SOURCES.starateli77OwnerIdentity.provenanceNote, /не переносится/);
  for (const text of Object.values(m77.proposedProduct)) assert(!text.includes("Быстрый"));
  assert.equal(m75.sourceFactsNotStoredAsAttributes.compressive_strength.sourceRange, "16–20 МПа (производственная площадка влияет на минимум)");
  assert.equal(m77.sourceFactsNotStoredAsAttributes.compressive_strength.sourceRange, "16–20 МПа");
  assert.equal(m75.attributes.adhesion.note.includes("not less than"), true);
  assert.equal(m77.attributes.adhesion.note.includes("not less than"), true);
  assert.equal(m77.attributes.flexural_strength.value, "не менее 4 МПа"); assert(!Object.hasOwn(m75.attributes, "flexural_strength"));
  assert.equal(m75.proposedProduct.seo_title.length <= 65, true); assert.equal(m77.proposedProduct.seo_title.length <= 65, true);
  assert(!m75.proposedProduct.seo_title.includes("Быстрый")); assert(!m77.proposedProduct.seo_description.includes("Быстрый"));
  const proposedTitles = DATA.PRODUCTS.map(product => product.proposedProduct.seo_title);
  const proposedDescriptions = DATA.PRODUCTS.map(product => product.proposedProduct.seo_description);
  assert.equal(new Set(proposedTitles).size, 2); assert.equal(new Set(proposedDescriptions).size, 2);
  pass("owner identity mapping, official-family provenance, schema-range handling, scope-only fields and SEO constraints");

  const oldFloor = fromGitModule("cccc1a8271f1595ae502ebbb813a755f5b82a961", "backend/scripts/data/floor-mixes-core-batch1.js", "data/floor-mixes-core-batch1-baseline.js");
  assert.deepStrictEqual(floorProduct("MAT-000076"), oldFloor.PRODUCTS.find(product => product.externalId === "MAT-000076"));
  assert.equal(floorProduct("MAT-000075").dedicatedCorrectionOnly, true); assert.equal(floorProduct("MAT-000077").dedicatedCorrectionOnly, true);
  pass("MAT-000076 is byte-for-byte equivalent at the data-object level to the required baseline commit");

  const dryFile = tempFile("dry"); await makeFixture(dryFile);
  const before = sha(dryFile); const dryDb = await openDatabase(dryFile, true); const dry = await inspectBatch(dryDb, { only: TARGETS });
  assert.equal(dry.summary.total, 2); assert.equal(dry.summary.ready, 2); assert.equal(dry.summary.existingOk, 0); assert.equal(dry.summary.errors, 0);
  assert.equal(dry.summary.willAdd, Object.keys(m75.attributes).length + Object.keys(m77.attributes).length); assert.equal(dry.summary.willFix, 2 * WRITABLE_PRODUCT_FIELDS.length);
  assert.equal(dry.summary.definitionsToCreate, 0); assert.equal(dry.summary.templateWrites, 0); assert.equal(sha(dryFile), before);
  assert.equal(dry.rows.find(row => row.externalId === "MAT-000075").title, m75.expectedTitle);
  assert.equal(dry.rows.find(row => row.externalId === "MAT-000077").slug, m77.expectedSlug);
  await dryDb.close(); pass("read-only dry-run reports READY and preserves the full DB file hash");

  const guardCases = [
    ["wrong title", (db, f) => runRaw(db, "UPDATE products SET title='wrong' WHERE external_id='MAT-000075'")],
    ["wrong slug", (db, f) => runRaw(db, "UPDATE products SET slug='wrong' WHERE external_id='MAT-000077'")],
    ["wrong product brand", (db, f) => runRaw(db, "UPDATE products SET brand='Other' WHERE external_id='MAT-000075'")],
    ["wrong operational weight", (db, f) => runRaw(db, "UPDATE products SET weight=21 WHERE external_id='MAT-000077'")],
    ["wrong price", (db, f) => runRaw(db, "UPDATE products SET price=1 WHERE external_id='MAT-000075'")],
    ["wrong image", (db, f) => runRaw(db, "UPDATE products SET image_url='/wrong.webp' WHERE external_id='MAT-000077'")],
    ["unexpected short description", (db, f) => runRaw(db, "UPDATE products SET short_description='unexpected' WHERE external_id='MAT-000075'")],
    ["unexpected full description", (db, f) => runRaw(db, "UPDATE products SET full_description='unexpected' WHERE external_id='MAT-000077'")],
    ["unexpected SEO", (db, f) => runRaw(db, "UPDATE products SET seo_title='unexpected' WHERE external_id='MAT-000075'")],
    ["wrong base attribute", (db, f) => runRaw(db, "UPDATE product_attribute_values SET value_number=99 WHERE product_id=75 AND attribute_definition_id=?", [f.definitions.get("package_weight")])]
  ];
  for (const [name, mutate] of guardCases) {
    const fixture = await mutateFixture(mutate);
    try { const report = await inspectBatch(fixture.db, { only: TARGETS }); assert.equal(report.summary.errors, 2, `${name} did not block whole batch`); }
    finally { await fixture.db.close(); }
  }
  pass("title/slug/brand/weight/price/image/description/SEO and existing attribute mismatches block both targets");

  const duplicate = await mutateFixture(async (db, fixture) => runRaw(db, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(75,?, 'UNIS',NULL,NULL,NULL,0,'duplicate','duplicate')", [fixture.definitions.get("brand")]));
  try { const result = await inspectBatch(duplicate.db, { only: TARGETS }); assert.equal(result.summary.errors, 2); }
  finally { await duplicate.db.close(); }
  const definitionConflict = await mutateFixture(async db => runRaw(db, "UPDATE product_attribute_definitions SET data_type='number' WHERE code='pot_life'").then(() => {}));
  try { await assert.rejects(() => inspectBatch(definitionConflict.db, { only: TARGETS }), /canonical definition: pot_life/); }
  finally { await definitionConflict.db.close(); }
  const templateConflict = await mutateFixture(async (db, fixture) => runRaw(db, "DELETE FROM product_attribute_templates WHERE structure_id=7 AND attribute_definition_id=?", [fixture.definitions.get("consumption")]));
  try { await assert.rejects(() => inspectBatch(templateConflict.db, { only: TARGETS }), /template membership differs/); }
  finally { await templateConflict.db.close(); }
  pass("duplicate values, incompatible definitions and template drift block without schema writes");

  const applyFile = tempFile("apply"); await makeFixture(applyFile); const applyDb = await openDatabase(applyFile, false); const preSnapshot = await fixtureSnapshot(applyDb);
  let beginSeen = false;
  const originalRun = applyDb.run.bind(applyDb);
  applyDb.run = async (sql, params) => {
    if (String(sql).trim().toUpperCase() === "BEGIN IMMEDIATE") {
      const backups = fs.readdirSync(path.dirname(applyFile)).filter(name => name.startsWith("matmix-before-floor-075-077-"));
      assert(backups.length > 0, "backup must exist before BEGIN IMMEDIATE");
      const backupDb = await openDatabase(path.join(path.dirname(applyFile), backups.sort().at(-1)), true);
      try { assert.deepStrictEqual(await fixtureSnapshot(backupDb), preSnapshot, "backup must contain the pre-transaction DB state"); }
      finally { await backupDb.close(); }
      beginSeen = true;
    }
    return originalRun(sql, params);
  };
  const applied = await applyBatch(applyDb, applyFile, { only: TARGETS, confirm: CONFIRM, backupDir: path.dirname(applyFile) });
  assert(beginSeen); assert.equal(applied.summary.existingOk, 2); assert.equal(applied.summary.errors, 0); assert.equal(applied.writes, Object.keys(m75.attributes).length + Object.keys(m77.attributes).length + TARGETS.length);
  assert(fs.existsSync(applied.backup.path)); assert.equal(path.dirname(applied.backup.path), path.dirname(applyFile));
  for (const product of DATA.PRODUCTS) {
    const row = await applyDb.get("SELECT * FROM products WHERE external_id=?", [product.externalId]);
    assert.equal(row.title, product.expectedTitle); assert.equal(row.slug, product.expectedSlug);
    for (const field of WRITABLE_PRODUCT_FIELDS) assert.equal(row[field], product.proposedProduct[field]);
  }
  const other076 = await applyDb.get("SELECT * FROM products WHERE external_id='MAT-000076'");
  assert.equal(other076.title, floorProduct("MAT-000076").expectedTitle); assert.equal(other076.weight, 25); assert.equal(other076.updated_at, "preserve-076");
  assert.equal((await applyDb.get("SELECT COUNT(*) AS n FROM product_attribute_values WHERE product_id IN (75,77)")).n, 4 + Object.keys(m75.attributes).length + Object.keys(m77.attributes).length);
  const repeated = await applyBatch(applyDb, applyFile, { only: TARGETS, confirm: CONFIRM, backupDir: path.dirname(applyFile) });
  assert.equal(repeated.summary.existingOk, 2); assert.equal(repeated.writes, 0); assert.equal(repeated.backup, null);
  await applyDb.close(); pass("backup precedes transaction; exact writes, title/slug/MAT076/definitions/templates/other rows preserved; idempotent second apply writes zero");

  const rollbackFile = tempFile("rollback"); await makeFixture(rollbackFile); const rollbackDb = await openDatabase(rollbackFile, false);
  await rollbackDb.run("CREATE TRIGGER reject_second_product BEFORE UPDATE OF full_description ON products WHEN NEW.external_id='MAT-000077' BEGIN SELECT RAISE(ABORT,'injected floor correction failure'); END");
  await assert.rejects(() => applyBatch(rollbackDb, rollbackFile, { only: TARGETS, confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /injected floor correction failure/);
  assert.equal((await rollbackDb.get("SELECT short_description FROM products WHERE external_id='MAT-000075'")).short_description, null);
  assert.equal((await rollbackDb.get("SELECT COUNT(*) AS n FROM product_attribute_values WHERE product_id IN (75,77)")).n, 4);
  assert.equal((await rollbackDb.get("SELECT title FROM products WHERE external_id='MAT-000077'")).title, m77.expectedTitle);
  await rollbackDb.close(); pass("failure on second product rolls back entire two-MAT batch");

  const audit = await testAuditFixture();
  for (const id of TARGETS) {
    const record = floorProduct(id);
    const source = audit.sourceEntries(id);
    assert(source.identity.some(item => item.status === "READY_FOR_CORE_REVIEW" || item.status === "CONFIRMED"), `${id} missing confirmed source identity`);
    assert.equal(record.identityStatus, "READY_FOR_CORE_REVIEW");
  }
  const sourceStatuses = [];
  for (const id of TARGETS) {
    const product = dataProduct(id);
    const facts = Object.values(product.attributes);
    assert(facts.every(fact => fact.sourceKeys.length && fact.sourceKeys.every(key => Object.prototype.hasOwnProperty.call(DATA.SOURCES, key))));
    sourceStatuses.push(id);
  }
  assert.deepStrictEqual(sourceStatuses, ["MAT-000075", "MAT-000077"]);
  pass("c330 audit fixture clears source blockers/anomalies for MAT075/MAT077 and keeps corrected MAT076 non-blocking; optional numeric ranges remain omitted");

  const seo = DATA.PRODUCTS.map(product => [product.proposedProduct.seo_title, product.proposedProduct.seo_description]);
  assert.equal(new Set(seo.map(pair => pair[0])).size, 2); assert.equal(new Set(seo.map(pair => pair[1])).size, 2);
  assert(seo.every(([title, description]) => title.trim() && title.length <= 65 && description.trim() && description.length <= 160));
  console.log(`PASS ${passed} test groups`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
