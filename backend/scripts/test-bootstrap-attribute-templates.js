"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const { MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");
const { CONFIRM_TOKEN, EXPECTED_MEMBERSHIP_COUNT, parseArgs, openDatabase, hashProtectedTables, buildPlan,
    hasChanges, blockingIssues, createOnlineBackup, runBatch } = require("./bootstrap-attribute-templates");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-template-bootstrap-"));
const allCodes = [...new Set([...CANONICAL.mainAttributes, ...CANONICAL.categories.flatMap(item => item.codes)])];

function rawRun(db, sql, params = []) {
    return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
}
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function createFixture(name, { missingDefinition = null, wrongStructure = false, extraMembership = false } = {}) {
    const file = path.join(tempRoot, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `
            PRAGMA user_version=11;
            CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER);
            CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT UNIQUE,label TEXT,data_type TEXT,default_unit TEXT,is_active INTEGER,sort_order INTEGER,default_section TEXT);
            CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY AUTOINCREMENT,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT NOT NULL DEFAULT 'regular' CHECK(section IN ('main','regular')),sort_order INTEGER NOT NULL DEFAULT 0,is_required INTEGER NOT NULL DEFAULT 0,unit_override TEXT,created_at TEXT,updated_at TEXT,UNIQUE(structure_id,attribute_definition_id));
            CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,brand TEXT,seo_title TEXT,seo_description TEXT,short_description TEXT,full_description TEXT,description TEXT);
            CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT);
            CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,sort_order INTEGER);
        `);
        await rawRun(raw, "INSERT INTO catalog_structure VALUES(1,NULL,'category','Смеси',1)");
        for (const category of CANONICAL.categories) {
            const name = wrongStructure && category.structureId === 2 ? "Неверное имя" : category.name;
            await rawRun(raw, "INSERT INTO catalog_structure VALUES(?,?, 'subcategory', ?,1)", [category.structureId, 1, name]);
        }
        let nextId = 1;
        const ids = new Map();
        for (const code of allCodes) {
            if (code === missingDefinition) continue;
            ids.set(code, nextId);
            await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(?,?,?, 'text',NULL,1,?,NULL)", [nextId++, code, code, nextId]);
        }
        await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(999,'extra_legacy','Legacy','text',NULL,1,999,'regular')");
        await rawRun(raw, "INSERT INTO products VALUES(1,'UX-BOOTSTRAP','Fixture','Brand','SEO','SEO','short','full','legacy')");
        await rawRun(raw, "INSERT INTO product_attribute_values VALUES(1,1,?,'keep',NULL,NULL,NULL,77,'created','updated')", [ids.get("base")]);
        await rawRun(raw, "INSERT INTO product_images VALUES(1,1,'/fixture.webp',1)");
        for (const category of CANONICAL.categories) {
            for (const [sortOrder, code] of category.codes.entries()) {
                if (!ids.has(code)) continue;
                await rawRun(raw, "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order) VALUES(?,?,'regular',?)", [category.structureId, ids.get(code), sortOrder]);
            }
        }
        const plaster = CANONICAL.categories[0];
        await rawRun(raw, "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order,is_required,unit_override) VALUES(?,?,'regular',99,1,'custom-unit')", [plaster.structureId, ids.get("brand")]);
        if (extraMembership) await rawRun(raw, "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order) VALUES(2,999,'regular',90)");
    } finally { await rawClose(raw); }
    return file;
}

async function templateRows(db) {
    return db.all("SELECT id,structure_id,attribute_definition_id,section,sort_order,is_required,unit_override FROM product_attribute_templates ORDER BY id");
}

async function productDropdownCodes(db, structureId, section) {
    return db.all(`SELECT d.code FROM product_attribute_templates t
        JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
        WHERE t.structure_id=? AND t.section=? AND d.is_active=1 ORDER BY t.sort_order,t.id`, [structureId, section]);
}

async function main() {
    assert.strictEqual(EXPECTED_MEMBERSHIP_COUNT, 73);
    assert.deepStrictEqual(CANONICAL.categories.map(item => item.name), ["Штукатурка", "Шпаклевка", "Кладочные Смеси", "Наливной Пол", "Стяжки Пола"]);
    assert.strictEqual(parseArgs(["--db", "fixture.db"]).apply, false, "dry-run must be the default");
    assert.throws(() => parseArgs(["--db", "fixture.db", "--apply"]), /Apply requires --confirm/);
    assert.strictEqual(parseArgs(["--db", "fixture.db", "--apply", "--confirm", CONFIRM_TOKEN]).apply, true);

    const fixturePath = await createFixture("successful");
    const db = await openDatabase(fixturePath, false);
    try {
        const beforeProtected = await hashProtectedTables(db);
        const beforeTemplates = await templateRows(db);
        const dryRun = await runBatch(db);
        assert.strictEqual(dryRun.status, "CHANGES_REQUIRED");
        assert.strictEqual(dryRun.plan.willAdd, 19);
        assert.strictEqual(dryRun.plan.willUpdate, 1);
        assert.deepStrictEqual(await hashProtectedTables(db), beforeProtected, "dry-run must preserve all protected data");
        assert.deepStrictEqual(await templateRows(db), beforeTemplates, "dry-run must not write template rows");

        const backup = await createOnlineBackup(db, fixturePath, tempRoot);
        assert(fs.existsSync(backup.path) && backup.size > 1024);
        const applied = await runBatch(db, { apply: true, backup: async () => backup });
        assert.strictEqual(applied.status, "APPLIED");
        assert.strictEqual(applied.plan.willAdd, 0);
        assert.strictEqual(applied.plan.willUpdate, 0);
        assert.strictEqual(applied.plan.existingOk, EXPECTED_MEMBERSHIP_COUNT);
        assert.deepStrictEqual(applied.protectedHashesAfter, applied.protectedHashesBefore);

        const mainCounts = await db.all("SELECT section,COUNT(*) AS count FROM product_attribute_templates GROUP BY section ORDER BY section");
        assert.deepStrictEqual(mainCounts, [{ section: "main", count: 20 }, { section: "regular", count: 53 }]);
        assert.strictEqual((await templateRows(db)).length, EXPECTED_MEMBERSHIP_COUNT, "applied template fixture must contain exactly 73 memberships");
        const brand = await db.get(`SELECT id,section,sort_order,is_required,unit_override FROM product_attribute_templates WHERE structure_id=? AND attribute_definition_id=?`,
            [CANONICAL.categories[0].structureId, 1]);
        assert.deepStrictEqual(brand, { id: 54, section: "main", sort_order: 0, is_required: 1, unit_override: "custom-unit" },
            "section/order update must preserve membership ID, required and unit override");
        for (const category of CANONICAL.categories) {
            assert.deepStrictEqual((await productDropdownCodes(db, category.structureId, "main")).map(row => row.code),
                CANONICAL.mainAttributes, `${category.name}: product editor main dropdown must contain only main memberships in order`);
            assert.deepStrictEqual((await productDropdownCodes(db, category.structureId, "regular")).map(row => row.code),
                category.codes, `${category.name}: product editor regular dropdown must contain only regular memberships in order`);
            const report = applied.plan.categories.find(item => item.structureId === category.structureId);
            assert.deepStrictEqual(report.orderedCodes, { main: CANONICAL.mainAttributes, regular: category.codes },
                `${category.name}: bootstrap report must list codes by section and sort_order`);
        }

        const secondDryRun = await runBatch(db);
        assert.strictEqual(secondDryRun.plan.willAdd, 0);
        assert.strictEqual(secondDryRun.plan.willUpdate, 0);
        assert.strictEqual(secondDryRun.status, "EXISTING_OK / NO_CHANGES");
        assert(!hasChanges(secondDryRun.plan));
        assert.strictEqual((await templateRows(db)).length, 73);
        assert.deepStrictEqual(await hashProtectedTables(db), beforeProtected, "repeat dry-run must not change products or product_attribute_values");
        const secondApply = await runBatch(db, { apply: true, backup: async () => { throw new Error("backup should not run for a no-op"); } });
        assert.strictEqual(secondApply.status, "EXISTING_OK / NO_CHANGES");

        for (const category of CANONICAL.categories) {
            const rows = await db.all(`SELECT d.code,t.section,t.sort_order FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? AND d.code IN (${[...CANONICAL.mainAttributes, ...category.codes].map(() => "?").join(",")}) ORDER BY t.section,t.sort_order`,
                [category.structureId, ...CANONICAL.mainAttributes, ...category.codes]);
            assert.strictEqual(rows.length, CANONICAL.mainAttributes.length + category.codes.length);
            assert.deepStrictEqual(rows.filter(item => item.section === "main").map(item => item.code), CANONICAL.mainAttributes);
            assert.deepStrictEqual(rows.filter(item => item.section === "regular").map(item => item.code), category.codes);
        }
    } finally { await db.close(); }

    const preservationPath = await createFixture("unlisted-membership", { extraMembership: true });
    const preservationDb = await openDatabase(preservationPath, false);
    try {
        const beforeProtected = await hashProtectedTables(preservationDb);
        const applied = await runBatch(preservationDb, { apply: true, backup: async () => ({ path: "verified fixture backup" }) });
        assert.strictEqual(applied.status, "APPLIED_WITH_NEEDS_REVIEW");
        assert(applied.plan.issues.some(issue => issue.code === "UNLISTED_MEMBERSHIP_PRESERVED"));
        assert.strictEqual((await templateRows(preservationDb)).length, 74);
        assert.deepStrictEqual(await hashProtectedTables(preservationDb), beforeProtected);
        const extra = await preservationDb.get("SELECT id,structure_id,attribute_definition_id FROM product_attribute_templates WHERE attribute_definition_id=999");
        assert.deepStrictEqual(extra, { id: 55, structure_id: 2, attribute_definition_id: 999 }, "unlisted membership must stay untouched");
    } finally { await preservationDb.close(); }

    const blockedPath = await createFixture("missing-definition", { missingDefinition: "base" });
    const blockedDb = await openDatabase(blockedPath, false);
    try {
        const plan = await buildPlan(blockedDb);
        assert(blockingIssues(plan));
        await assert.rejects(() => runBatch(blockedDb, { apply: true, backup: async () => ({ path: "unused" }) }), /blocking NEEDS_REVIEW/);
    } finally { await blockedDb.close(); }

    const wrongPath = await createFixture("wrong-structure", { wrongStructure: true });
    const wrongDb = await openDatabase(wrongPath, true);
    try { assert(blockingIssues(await buildPlan(wrongDb))); } finally { await wrongDb.close(); }

    console.log(JSON.stringify({ success: true, expectedMemberships: EXPECTED_MEMBERSHIP_COUNT, mainMemberships: 20, regularMemberships: 53,
        dryRunImmutable: true, idempotent: true, membershipIdPreserved: true, requiredAndUnitOverridePreserved: true,
        dropdownSectionsVerified: true, perCategoryCodeOrderReported: true, exactTemplateRows: 73, repeatDryRunAdds: 0,
        unlistedMembershipPreservedAndFlagged: true, productsValuesDefinitionsImagesSeoUnchanged: true, backupVerified: true,
        missingDefinitionBlocked: true, wrongStructureBlocked: true }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
