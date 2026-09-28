"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const {
    CONFIRM_TOKEN, TARGET, parseArgs, openDatabase, planCleanup, snapshot,
    snapshotsUnchangedExceptTarget, runCleanup
} = require("./cleanup-mat000002-legacy-coverage");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mat000002-coverage-"));
let passed = 0;
function pass(name) { passed += 1; console.log(`PASS ${name}`); }
function rawRun(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function fixture(name, { title = TARGET.title, brand = TARGET.brand, targetRows = 1, wrongTarget = null,
    badConsumption = false, includeConsumption = true, includeTemplateLegacy = false, noSection = false } = {}) {
    const file = path.join(root, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,brand TEXT,category TEXT,subcategory TEXT,price REAL,updated_at TEXT);
            CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER);
            CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER${noSection ? "" : ",section TEXT"});
            CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER);
            INSERT INTO products VALUES(1,'MAT-000002',${JSON.stringify(title)},${JSON.stringify(brand)},'Смеси','Штукатурка',1250,'unchanged-2');
            INSERT INTO products VALUES(2,'MAT-000027','Штукатурная смесь цементная Евро М-150 40 кг','Евро','Смеси','Штукатурка',700,'unchanged-27');
            INSERT INTO products VALUES(3,'MAT-000028','Штукатурная смесь цементная Русеан М-150 40 кг','Русеан','Смеси','Штукатурка',720,'unchanged-28');
            INSERT INTO products VALUES(4,'MAT-888888','Other product','Other','Смеси','Штукатурка',100,'unchanged-other');
            INSERT INTO product_attribute_definitions VALUES(1,'coverage_30kg_10mm','Площадь мешка 30 кг при слое 10 мм','number','м²','Характеристики',30,1);
            INSERT INTO product_attribute_definitions VALUES(2,'consumption_10mm','Расход при слое 10 мм','text','кг/м²','Характеристики',31,1);
            INSERT INTO product_attribute_definitions VALUES(3,'color','Цвет','text',NULL,'Характеристики',32,1);
            INSERT INTO product_attribute_templates VALUES(1,2,2${noSection ? "" : ",'regular'"});
            INSERT INTO product_attribute_templates VALUES(2,2,3${noSection ? "" : ",'regular'"});
            INSERT INTO product_attribute_values VALUES(101,1,2,${badConsumption ? "'8.5'" : "'8,5'"},NULL,NULL,'кг/м²',31);
            INSERT INTO product_attribute_values VALUES(102,1,3,'Белый',NULL,NULL,NULL,32);
            INSERT INTO product_attribute_values VALUES(201,2,3,'Серый',NULL,NULL,NULL,32);
            INSERT INTO product_attribute_values VALUES(301,3,3,'Серый',NULL,NULL,NULL,32);
            INSERT INTO product_attribute_values VALUES(401,4,3,'Other',NULL,NULL,NULL,32);`);
        if (!includeConsumption) await rawRun(raw, "DELETE FROM product_attribute_values WHERE id=101");
        const target = wrongTarget || { valueText: null, valueNumber: 3.5, valueBoolean: null, unitOverride: "м²" };
        for (let i = 0; i < targetRows; i += 1) {
            const rowId = 110 + i;
            await rawRun(raw, "INSERT INTO product_attribute_values VALUES(?,1,1,?,?,?,?,30)", [rowId, target.valueText, target.valueNumber, target.valueBoolean, target.unitOverride]);
        }
        if (includeTemplateLegacy) await rawRun(raw, noSection
            ? "INSERT INTO product_attribute_templates VALUES(3,2,1)"
            : "INSERT INTO product_attribute_templates VALUES(3,2,1,'regular')");
    } finally { await rawClose(raw); }
    return file;
}

async function auditRuleFixture(db) {
    const category = CANONICAL.categories.find(item => item.name === TARGET.subcategory);
    const product = await db.get("SELECT id,external_id FROM products WHERE external_id=?", [TARGET.externalId]);
    const template = await db.all(`SELECT d.code FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=?`, [category.structureId]);
    const values = await db.all(`SELECT d.code,v.value_text,v.value_number,v.value_boolean,d.is_active AS definition_active
        FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=?`, [product.id]);
    const templateCodes = new Set(template.map(row => row.code));
    const removed = new Set(category.removeCodes || []);
    const explicitlyRemovedValuesPresent = values.filter(row => !templateCodes.has(row.code) && removed.has(row.code));
    const duplicateCodes = values.map(row => row.code).filter((code, index, all) => all.indexOf(code) !== index);
    const anomalies = [...explicitlyRemovedValuesPresent, ...duplicateCodes];
    return { attributeStatus: anomalies.length ? "ATTR_ANOMALY" : "ATTR_OK", explicitlyRemovedValuesPresent };
}

async function main() {
    assert.strictEqual(parseArgs(["--db", "fixture.db", "--only", " MAT-000002 "]).only, TARGET.externalId);
    assert.strictEqual(parseArgs(["--apply", "--db", "fixture.db", "--only", TARGET.externalId, "--confirm", CONFIRM_TOKEN, "--backup-dir", "backups"]).apply, true);
    assert.throws(() => parseArgs(["--db", "fixture.db"]), /Exact --only/);
    assert.throws(() => parseArgs(["--db", "fixture.db", "--only", "MAT-000002,MAT-000003"]), /Exact --only/);
    assert.throws(() => parseArgs(["--db", "fixture.db", "--only", "MAT-000002", "--apply", "--confirm", CONFIRM_TOKEN]), /--backup-dir/);
    assert.throws(() => parseArgs(["--db", "fixture.db", "--only", "MAT-000002", "--apply", "--confirm", CONFIRM_TOKEN, "--backup-dir", "b", "--only", "MAT-000002"]), /Duplicate option/);
    pass("exact MAT-000002 allowlist and apply CLI requirements");

    const correctFile = await fixture("correct");
    const dryDb = await openDatabase(correctFile, true);
    const dryBeforeSnapshot = await snapshot(dryDb);
    await dryDb.close();
    const dryBeforeHash = hash(correctFile);
    const dryDb2 = await openDatabase(correctFile, true);
    const dry = await runCleanup(dryDb2);
    assert.strictEqual(dry.status, "READY");
    assert.strictEqual(dry.writes, 0);
    assert.strictEqual((await dryDb2.get("PRAGMA query_only")).query_only, 1);
    await assert.rejects(() => dryDb2.run("DELETE FROM product_attribute_values WHERE id=110"), /readonly|read-only/i);
    await dryDb2.close();
    const dryAfterHash = hash(correctFile);
    assert.strictEqual(dryAfterHash, dryBeforeHash, "dry-run must leave file hash unchanged");
    const dryCheck = await openDatabase(correctFile, true);
    assert.deepStrictEqual(await snapshot(dryCheck), dryBeforeSnapshot);
    await dryCheck.close();
    pass("default dry-run is read-only and exact legacy row is READY");

    const scriptSource = fs.readFileSync(path.join(__dirname, "cleanup-mat000002-legacy-coverage.js"), "utf8");
    const sqlMutations = [...scriptSource.matchAll(/db\.run\(\s*`((?:INSERT|UPDATE|DELETE|REPLACE)\b[\s\S]*?)`/gi)].map(match => match[1].trim().replace(/\s+/g, " "));
    assert.strictEqual(sqlMutations.length, 1);
    assert.match(sqlMutations[0], /^DELETE FROM product_attribute_values WHERE id=\? AND product_id=\? AND attribute_definition_id=\?/);
    assert.doesNotMatch(scriptSource, /\b(?:INSERT|UPDATE|REPLACE)\s+(?:INTO\s+)?(?:products|product_attribute_values|product_attribute_definitions|product_attribute_templates)\b/i);
    pass("static writable SQL surface is one targeted product_attribute_values DELETE");

    for (const [name, config] of [
        ["wrong-title", { title: "Штукатурка гипсовая Knauf Ротбанд, другой вариант 30 кг" }],
        ["wrong-brand", { brand: "Other brand" }],
        ["wrong-value", { wrongTarget: { valueText: null, valueNumber: 3.6, valueBoolean: null, unitOverride: "м²" } }],
        ["wrong-unit", { wrongTarget: { valueText: null, valueNumber: 3.5, valueBoolean: null, unitOverride: "кг/м²" } }],
        ["duplicate", { targetRows: 2 }],
        ["no-consumption", { includeConsumption: false }],
        ["bad-consumption", { badConsumption: true }],
        ["legacy-still-templated", { includeTemplateLegacy: true }]
    ]) {
        const file = await fixture(name, config);
        const db = await openDatabase(file, true);
        const plan = await planCleanup(db);
        assert.strictEqual(plan.status, "BLOCKED", `${name} must block`);
        await db.close();
    }
    const removeContract = { ...CANONICAL, categories: CANONICAL.categories.map(item => item.name === TARGET.subcategory ? { ...item, removeCodes: [] } : item) };
    const removeContractFile = await fixture("remove-contract");
    const removeContractDb = await openDatabase(removeContractFile, true);
    assert.strictEqual((await planCleanup(removeContractDb, removeContract)).status, "BLOCKED");
    await removeContractDb.close();
    pass("wrong identity/value, duplicate row, altered removeCodes, consumption drift and templated legacy value all block");

    const absentFile = await fixture("already-absent", { targetRows: 0 });
    const absentDb = await openDatabase(absentFile, true);
    assert.strictEqual((await planCleanup(absentDb)).status, "EXISTING_OK");
    await absentDb.close();
    pass("missing exact legacy value is idempotent EXISTING_OK");

    const applyDb = await openDatabase(correctFile, false);
    const before = await snapshot(applyDb);
    const auditBefore = await auditRuleFixture(applyDb);
    assert.strictEqual(auditBefore.attributeStatus, "ATTR_ANOMALY");
    const auditBlockersBefore = ["MAT-000002", "MAT-000027", "MAT-000028"];
    const backupDir = path.join(root, "chosen-backup-directory");
    let backupCallbackCount = 0;
    const applied = await runCleanup(applyDb, { apply: true, backup: async () => {
        backupCallbackCount += 1;
        const result = await require("./cleanup-mat000002-legacy-coverage").createOnlineBackup(applyDb, backupDir);
        assert.ok(result.path.startsWith(backupDir));
        const backupDb = await openDatabase(result.path, true);
        assert.strictEqual((await backupDb.get("SELECT COUNT(*) AS n FROM product_attribute_values WHERE id=110")).n, 1, "backup must predate deletion");
        await backupDb.close();
        return result;
    } });
    assert.strictEqual(applied.status, "APPLIED");
    assert.strictEqual(applied.writes, 1);
    assert.deepStrictEqual(applied.deleted, { id: 110, product: TARGET.externalId, code: TARGET.code, valueNumber: 3.5, unitOverride: "м²" });
    const after = await snapshot(applyDb);
    assert.ok(snapshotsUnchangedExceptTarget(before, after, 110), "all other attributes, all products, definitions and templates must remain unchanged");
    assert.strictEqual((await applyDb.get("SELECT value_text,unit_override FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=2")).value_text, "8,5");
    const auditAfter = await auditRuleFixture(applyDb);
    assert.strictEqual(auditAfter.attributeStatus, "ATTR_OK");
    assert.deepStrictEqual(auditAfter.explicitlyRemovedValuesPresent, []);
    const auditBlockersAfter = auditBlockersBefore.filter(id => id !== TARGET.externalId || auditAfter.attributeStatus === "ATTR_ANOMALY");
    assert.deepStrictEqual(auditBlockersAfter, ["MAT-000027", "MAT-000028"]);
    pass("apply removes exactly one row; product/other values/definitions/templates unchanged; audit fixture clears anomaly and leaves only MAT-000027/028 blockers");

    const repeat = await runCleanup(applyDb, { apply: true, backup: async () => { backupCallbackCount += 1; throw new Error("idempotent apply must not back up"); } });
    assert.strictEqual(repeat.status, "EXISTING_OK");
    assert.strictEqual(repeat.writes, 0);
    assert.strictEqual(backupCallbackCount, 1);
    await applyDb.close();
    pass("second apply is EXISTING_OK with zero writes and no second backup");

    const rollbackFile = await fixture("rollback");
    const rollbackDb = await openDatabase(rollbackFile, false);
    const rollbackBefore = await snapshot(rollbackDb);
    let afterDelete = false; let injected = false;
    const failingDb = {
        ...rollbackDb,
        async run(sql, params) { const result = await rollbackDb.run(sql, params); if (/^\s*DELETE FROM product_attribute_values/i.test(sql)) afterDelete = true; return result; },
        async all(sql, params) { if (afterDelete && !injected && /SELECT \* FROM products/i.test(sql)) { injected = true; throw new Error("injected post-delete failure"); } return rollbackDb.all(sql, params); }
    };
    await assert.rejects(() => runCleanup(failingDb, { apply: true, backup: async () => ({ path: "fixture-backup" }) }), /injected post-delete failure/);
    assert.deepStrictEqual(await snapshot(rollbackDb), rollbackBefore, "rollback must restore the deleted row");
    assert.strictEqual(injected, true);
    await rollbackDb.close();
    pass("post-delete failure rolls back exact row deletion");

    const noSectionFile = await fixture("schema-without-section", { noSection: true });
    const noSectionDb = await openDatabase(noSectionFile, true);
    assert.strictEqual((await planCleanup(noSectionDb)).status, "READY", "cleanup does not depend on templates.section");
    await noSectionDb.close();
    pass("read-only template guard is compatible with schemas with or without templates.section");

    console.log(JSON.stringify({ success: true, passedGroups: passed, dryRun: { status: dry.status, writes: dry.writes, databaseSha256Before: dryBeforeHash, databaseSha256After: dryAfterHash, databaseSha256Unchanged: dryAfterHash === dryBeforeHash }, auditFixture: { MAT000002: "not ATTR_ANOMALY", plasterBlockers: ["MAT-000027", "MAT-000028"] }, productionAccess: false }, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; })
    .finally(() => fs.rmSync(root, { recursive: true, force: true }));
