"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const { MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");
const { CONFIRM_TOKEN, CLOSED_STRUCTURE_IDS, EXPECTED_ROW_COUNT, parseArgs, openDatabase, hashProtectedTables, buildPlan, hasChanges, createOnlineBackup, runBatch } = require("./backfill-attribute-templates-closed-subcategories");

const allCodes = [...new Set(CANONICAL.categories.flatMap(category => [...category.codes, ...(category.removeCodes || [])]))];
const codes = [...allCodes, ...MAIN_ATTRIBUTES.map(item => item.code)];
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-closed-templates-"));

function rawRun(db, sql, params = []) {
    return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
}
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function createFixture(name, { missingDefinition = null, wrongStructure = false, orphanTemplate = false, triggerInsert = false, schemaVersion11 = true } = {}) {
    const file = path.join(tempRoot, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `
            CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER);
            CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,is_active INTEGER);
            CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY AUTOINCREMENT,structure_id INTEGER,attribute_definition_id INTEGER,${schemaVersion11 ? "section TEXT NOT NULL DEFAULT 'regular'," : ""}sort_order INTEGER NOT NULL DEFAULT 0,is_required INTEGER NOT NULL DEFAULT 0,unit_override TEXT,created_at TEXT,updated_at TEXT);
            CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,brand TEXT,seo_title TEXT,seo_description TEXT,short_description TEXT,full_description TEXT,description TEXT);
            CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,sort_order INTEGER);
            CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,sort_order INTEGER);
        `);
        await rawRun(raw, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
        for (const category of CANONICAL.categories) await rawRun(raw, "INSERT INTO catalog_structure VALUES(?,?, 'subcategory', ?,1)", [category.structureId, 1, category.name]);
        if (wrongStructure) await rawRun(raw, "UPDATE catalog_structure SET name='Неверное имя' WHERE id=2");
        let definitionId = 1;
        const ids = new Map();
        for (const code of codes) {
            if (code === missingDefinition) continue;
            ids.set(code, definitionId);
            await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(?,?,1)", [definitionId++, code]);
        }
        await rawRun(raw, "INSERT INTO products VALUES(1,'MAT-FIXTURE-1','Тест','KNAUF','SEO title','SEO description','short','full','legacy')");
        await rawRun(raw, "INSERT INTO product_attribute_values VALUES(1,1,?,'value',NULL,NULL,77)", [ids.get("base") || 1]);
        await rawRun(raw, "INSERT INTO product_images VALUES(1,1,'/fixture.webp',1)");
        let templateId = 1;
        for (const category of CANONICAL.categories) {
            if (schemaVersion11) {
                for (const [sortOrder, item] of MAIN_ATTRIBUTES.entries()) {
                    await rawRun(raw, "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,section,sort_order) VALUES(?,?,?,'main',?)", [templateId++, category.structureId, ids.get(item.code), sortOrder]);
                }
            }
            for (const [sortOrder, code] of category.codes.entries()) {
                if (category.structureId === 2) continue;
                await rawRun(raw, schemaVersion11
                    ? "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,section,sort_order) VALUES(?,?,?,'regular',?)"
                    : "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,sort_order) VALUES(?,?,?,?)",
                [templateId++, category.structureId, ids.get(code) || 1, sortOrder]);
            }
        }
        await rawRun(raw, schemaVersion11
            ? "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,section,sort_order) VALUES(777,2,?,'regular',77)"
            : "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,sort_order) VALUES(777,2,?,77)", [ids.get("base") || 1]);
        if (ids.has("coverage_30kg_10mm")) await rawRun(raw, schemaVersion11
            ? "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,section,sort_order) VALUES(778,2,?,'regular',6)"
            : "INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,sort_order) VALUES(778,2,?,6)", [ids.get("coverage_30kg_10mm")]);
        if (schemaVersion11) await rawRun(raw, "UPDATE product_attribute_templates SET is_required=1,unit_override='custom-unit' WHERE structure_id=2 AND attribute_definition_id=?", [ids.get("brand")]);
        if (orphanTemplate) await rawRun(raw, schemaVersion11
            ? "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order) VALUES(2,9999,'regular',0)"
            : "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,sort_order) VALUES(2,9999,0)");
        if (triggerInsert) await rawRun(raw, "CREATE TRIGGER reject_template_add BEFORE INSERT ON product_attribute_templates BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");
    } finally { await rawClose(raw); }
    return file;
}

async function expectReject(operation, pattern) {
    let error;
    try { await operation(); } catch (caught) { error = caught; }
    assert(error, `Expected rejection matching ${pattern}`);
    assert.match(error.message, pattern);
}

async function main() {
    assert.strictEqual(EXPECTED_ROW_COUNT, 53);
    assert.deepStrictEqual(CLOSED_STRUCTURE_IDS, [2, 4, 5, 7, 8]);
    assert.deepStrictEqual(CANONICAL.categories.map(item => item.structureId), [2, 4, 5, 7, 8, 10, 16]);
    assert.strictEqual(CANONICAL.categories.find(item => item.structureId === 10).codes.length, 19);
    assert.deepStrictEqual(CANONICAL.categories.find(item => item.structureId === 16).codes,
        ["base", "purpose", "application_area", "substrates", "color", "adhesive_class", "layer_thickness", "consumption", "water_requirement", "pot_life", "application_temperature", "open_time", "adjustment_time", "walkability", "heated_floor_compatibility", "standard"]);
    assert(!CLOSED_STRUCTURE_IDS.includes(16), "tile adhesive registration must not expand the closed-template mutation scope");
    assert(CANONICAL.categories.every(category => category.codes.every(code => !MAIN_ATTRIBUTES.some(item => item.code === code))));
    assert.strictEqual(parseArgs(["--db", "fixture.db"]).apply, false, "dry-run is the default");
    assert.throws(() => parseArgs(["--db", "fixture.db", "--apply"]), /Apply requires --confirm/);
    assert.strictEqual(parseArgs(["--db", "fixture.db", "--apply", "--confirm", CONFIRM_TOKEN]).apply, true);

    const successfulFile = await createFixture("success");
    const readOnly = await openDatabase(successfulFile, true);
    const untouchedMainBefore = await readOnly.all("SELECT * FROM product_attribute_templates WHERE section='main' ORDER BY id");
    const hydroBefore = await readOnly.all("SELECT * FROM product_attribute_templates WHERE structure_id=10 ORDER BY id");
    const dryBefore = await hashProtectedTables(readOnly);
    const dry = await runBatch(readOnly);
    const dryAfter = await hashProtectedTables(readOnly);
    assert.strictEqual(dry.status, "CHANGES_REQUIRED");
    assert.deepStrictEqual(dry.plan.categories.map(item => item.structureId), CLOSED_STRUCTURE_IDS, "closed-subcategories consumer must exclude structure 10");
    assert.strictEqual(dry.plan.expectedRowCount, 53);
    assert.strictEqual(dry.plan.expectedMainMembershipCount, 20);
    assert(hasChanges(dry.plan));
    assert.deepStrictEqual(dryAfter, dryBefore, "dry-run must be immutable");
    await readOnly.close();

    const writable = await openDatabase(successfulFile, false);
    const tileAdhesiveBefore = await writable.all("SELECT * FROM product_attribute_templates WHERE structure_id=16 ORDER BY id");
    const backup = await createOnlineBackup(writable, successfulFile, tempRoot);
    assert(fs.existsSync(backup.path));
    assert(backup.size > 1024);
    const applied = await runBatch(writable, { apply: true, backup: async () => backup });
    assert.strictEqual(applied.status, "APPLIED");
    assert.strictEqual(applied.plan.expectedRowCount, EXPECTED_ROW_COUNT);
    assert.deepStrictEqual(applied.protectedHashesAfter, applied.protectedHashesBefore);
    const mainRows = await writable.all(`SELECT t.structure_id,d.code,t.section,t.sort_order FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE d.code IN (${MAIN_ATTRIBUTES.map(() => "?").join(",")}) ORDER BY t.structure_id,t.sort_order`, MAIN_ATTRIBUTES.map(item => item.code));
    assert.strictEqual(mainRows.length, 28, "four main memberships for each of seven canonical structures must remain");
    assert.deepStrictEqual(await writable.all("SELECT * FROM product_attribute_templates WHERE section='main' ORDER BY id"), untouchedMainBefore, "main tuples and their metadata must remain byte-for-byte unchanged");
    for (const structureId of CLOSED_STRUCTURE_IDS) {
        assert.deepStrictEqual(mainRows.filter(row => row.structure_id === structureId).map(({ code, section, sort_order }) => ({ code, section, sort_order })),
            MAIN_ATTRIBUTES.map((item, sort_order) => ({ code: item.code, section: "main", sort_order })), "main section/order must remain exact and untouched");
    }
    const rows = await writable.all("SELECT id,sort_order FROM product_attribute_templates WHERE structure_id=2 AND attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='base')");
    assert.deepStrictEqual(rows, [{ id: 777, sort_order: 0 }], "existing template row ID must survive order update");
    const removedCoverage = await writable.all("SELECT id FROM product_attribute_templates WHERE id=778");
    assert.deepStrictEqual(removedCoverage, [], "only explicitly approved obsolete coverage template row must be removed");
    for (const category of CANONICAL.categories) {
        const actual = await writable.all(`SELECT d.code,t.sort_order FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? AND t.section='regular' ORDER BY t.sort_order`, [category.structureId]);
        assert.deepStrictEqual(actual, category.codes.map((code, sort_order) => ({ code, sort_order })), `canonical regular order mismatch for ${category.name}`);
    }
    const hydroRows = await writable.all("SELECT * FROM product_attribute_templates WHERE structure_id=10 ORDER BY id");
    assert.strictEqual(hydroRows.length, 23, "Hydroisolation memberships must remain outside the closed backfill scope");
    assert.deepStrictEqual(hydroRows, hydroBefore, "Hydroisolation structure 10 template rows must remain unchanged");
    assert.deepStrictEqual(await writable.all("SELECT * FROM product_attribute_templates WHERE structure_id=16 ORDER BY id"), tileAdhesiveBefore,
        "tile-adhesive canonical registration must remain outside the closed-template mutation scope");
    const beforeIdempotent = await hashProtectedTables(writable);
    const secondDryRun = await runBatch(writable);
    assert.strictEqual(secondDryRun.status, "EXISTING_OK / NO_CHANGES");
    assert(!hasChanges(secondDryRun.plan));
    const secondApply = await runBatch(writable, { apply: true, backup: async () => { throw new Error("backup should not run for a no-op"); } });
    assert.strictEqual(secondApply.status, "EXISTING_OK / NO_CHANGES");
    assert.deepStrictEqual(await hashProtectedTables(writable), beforeIdempotent);
    await writable.close();

    const legacyFile = await createFixture("schema-v4", { schemaVersion11: false });
    const legacyDb = await openDatabase(legacyFile, true);
    try {
        const legacyPlan = await buildPlan(legacyDb);
        assert.strictEqual(legacyPlan.sectionColumn, false, "legacy schema-v4 shape must work without section");
        assert.strictEqual(legacyPlan.categories.length, 5);
        assert.strictEqual(legacyPlan.expectedMainMembershipCount, null);
    } finally { await legacyDb.close(); }

    const rollbackFile = await createFixture("rollback", { triggerInsert: true });
    const rollbackDb = await openDatabase(rollbackFile, false);
    const rollbackHashes = await hashProtectedTables(rollbackDb);
    await expectReject(() => runBatch(rollbackDb, { apply: true, backup: async () => ({ path: "fixture-backup" }) }), /fixture rollback/);
    assert.deepStrictEqual(await hashProtectedTables(rollbackDb), rollbackHashes);
    const rollbackTemplate = await rollbackDb.get("SELECT id,sort_order FROM product_attribute_templates WHERE id=777");
    assert.deepStrictEqual(rollbackTemplate, { id: 777, sort_order: 77 }, "failed batch must roll back earlier template updates");
    await rollbackDb.close();

    const missingFile = await createFixture("missing-definition", { missingDefinition: "base" });
    const missingDb = await openDatabase(missingFile, true);
    await expectReject(() => buildPlan(missingDb), /Missing or inactive definition code: base/);
    await missingDb.close();

    const orphanFile = await createFixture("orphan-template", { orphanTemplate: true });
    const orphanDb = await openDatabase(orphanFile, true);
    await expectReject(() => buildPlan(orphanDb), /Unknown definition membership/);
    await orphanDb.close();

    const wrongFile = await createFixture("wrong-structure", { wrongStructure: true });
    const wrongDb = await openDatabase(wrongFile, true);
    await expectReject(() => buildPlan(wrongDb), /Exact structure ID\/name guard failed/);
    await wrongDb.close();

    console.log(JSON.stringify({ success: true, exactScope: true, closedStructureIds: CLOSED_STRUCTURE_IDS, expectedRowCount: EXPECTED_ROW_COUNT,
        mainMembershipsPreserved: 20, allCanonicalMainMembershipsPresent: 28, hydroStructure10ExcludedFromMutation: true, tileAdhesiveStructure16ExcludedFromMutation: true, schemaV4Compatibility: true,
        canonicalOrdering: true, existingRowIdsPreserved: true, explicitCoverageTemplateRemoval: true, dryRunImmutable: true, idempotent: true, rollback: true,
        missingDefinitionGuard: true, unknownDefinitionGuard: true, wrongStructureGuard: true,
        productsValuesImagesSeoHashesUnchanged: true, verifiedOnlineBackup: true }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
