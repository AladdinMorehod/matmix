"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-tile-adhesive-content-batch1");

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-tile-adhesive-content-"));
const EXPECTED = [
    "MAT-000127", "MAT-000128", "MAT-000129", "MAT-000130", "MAT-000131", "MAT-000132",
    "MAT-000133",
    "MAT-000134", "MAT-000135", "MAT-000136", "MAT-000137", "MAT-000138", "MAT-000139",
    "MAT-000140", "MAT-000141", "MAT-000142", "MAT-000143", "MAT-000144", "MAT-000145"
];
const ALLOWED_FIELDS = ["short_description", "full_description", "seo_title", "seo_description"];

function rawRun(db, sql, params = []) {
    return new Promise((resolve, reject) => db.run(sql, params, function done(error) {
        error ? reject(error) : resolve({ changes: this.changes, lastID: this.lastID });
    }));
}
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function digest(value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function completeContent(config) {
    return {
        short_description: config.shortDescription,
        full_description: config.fullDescription,
        seo_title: config.seoTitle,
        seo_description: config.seoDescription
    };
}

async function createFixture(name, { initialContent = false, schemaVersion = 11, guard = null, externalCollision = null, triggerFailure = false } = {}) {
    const file = path.join(ROOT, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `
            PRAGMA user_version=${schemaVersion};
            CREATE TABLE products (
                id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, category TEXT, subcategory TEXT,
                brand TEXT, weight REAL, unit TEXT, is_active INTEGER, deleted_at TEXT,
                short_description TEXT, full_description TEXT, seo_title TEXT, seo_description TEXT,
                description TEXT, price REAL, stock INTEGER, image_url TEXT, updated_at TEXT
            );
            CREATE TABLE product_attribute_values (id INTEGER PRIMARY KEY, product_id INTEGER, attribute_definition_id INTEGER,
                value_text TEXT, value_number REAL, value_boolean INTEGER, unit_override TEXT, sort_order INTEGER, created_at TEXT, updated_at TEXT);
            CREATE TABLE product_attribute_definitions (id INTEGER PRIMARY KEY, code TEXT, label TEXT, data_type TEXT, default_unit TEXT, is_active INTEGER);
            CREATE TABLE product_attribute_templates (id INTEGER PRIMARY KEY, structure_id INTEGER, attribute_definition_id INTEGER,
                section TEXT, sort_order INTEGER, is_required INTEGER, unit_override TEXT, created_at TEXT, updated_at TEXT);
            CREATE TABLE product_images (id INTEGER PRIMARY KEY, product_id INTEGER, image_url TEXT, sort_order INTEGER);
        `);
        let id = 1;
        for (const config of RUNNER.DATA.PRODUCTS) {
            const content = initialContent ? completeContent(config) : {
                short_description: null, full_description: null, seo_title: null, seo_description: null
            };
            await rawRun(raw, `INSERT INTO products(
                id,external_id,title,slug,category,subcategory,brand,weight,unit,is_active,deleted_at,
                short_description,full_description,seo_title,seo_description,description,price,stock,image_url,updated_at
            ) VALUES(?,?,?,?,?,?,?,?,?,1,NULL,?,?,?,?,?,?,?,?,?)`, [
                id++, config.externalId, config.expectedTitle, `slug-${config.externalId}`, config.expectedCategory, config.expectedSubcategory,
                config.expectedBrand, config.expectedWeight, config.expectedUnit,
                content.short_description, content.full_description, content.seo_title, content.seo_description,
                `legacy-${config.externalId}`, 123.45, 7, `/placeholder/${config.externalId}.webp`, `stamp-${config.externalId}`
            ]);
        }
        if (externalCollision) {
            const target = RUNNER.DATA.PRODUCTS[0];
            const content = completeContent(target);
            await rawRun(raw, `INSERT INTO products(
                id,external_id,title,slug,category,subcategory,brand,weight,unit,is_active,deleted_at,
                short_description,full_description,seo_title,seo_description,description,price,stock,image_url,updated_at
            ) VALUES(999,'MAT-OUTSIDE','Outside','outside','Смеси','Клей для Плитки','Other',25,'шт',1,NULL,NULL,NULL,?,?,?,?,?,?,?)`, [
                externalCollision === "title" ? content.seo_title : "Unique outside title",
                externalCollision === "description" ? content.seo_description : "Unique outside description",
                "outside legacy", 99.99, 3, "/placeholder/outside.webp", "outside-stamp"
            ]);
        } else {
            await rawRun(raw, `INSERT INTO products(
                id,external_id,title,slug,category,subcategory,brand,weight,unit,is_active,deleted_at,
                short_description,full_description,seo_title,seo_description,description,price,stock,image_url,updated_at
            ) VALUES(999,'MAT-OUTSIDE','Outside','outside','Смеси','Other','Other',25,'шт',1,NULL,NULL,NULL,'Unique outside title','Unique outside description','outside legacy',99.99,3,'/placeholder/outside.webp','outside-stamp')`);
        }
        await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(1,'base','Base','text',NULL,1)");
        await rawRun(raw, "INSERT INTO product_attribute_templates VALUES(1,16,1,'regular',0,0,NULL,'created','updated')");
        await rawRun(raw, "INSERT INTO product_attribute_values VALUES(1,1,1,'untouched',NULL,NULL,NULL,0,'created','updated')");
        await rawRun(raw, "INSERT INTO product_images VALUES(1,1,'/placeholder/shared.webp',0)");
        if (guard) {
            const targetId = EXPECTED.indexOf(guard.externalId) + 1;
            if (guard.field === "title") await rawRun(raw, "UPDATE products SET title='Unexpected title' WHERE id=?", [targetId]);
            if (guard.field === "category") await rawRun(raw, "UPDATE products SET category='Other' WHERE id=?", [targetId]);
            if (guard.field === "subcategory") await rawRun(raw, "UPDATE products SET subcategory='Other' WHERE id=?", [targetId]);
            if (guard.field === "weight") await rawRun(raw, "UPDATE products SET weight=99 WHERE id=?", [targetId]);
            if (guard.field === "unit") await rawRun(raw, "UPDATE products SET unit='кг' WHERE id=?", [targetId]);
            if (guard.field === "brand") await rawRun(raw, "UPDATE products SET brand='Other' WHERE id=?", [targetId]);
            if (guard.field === "content") await rawRun(raw, "UPDATE products SET short_description='Owner copy' WHERE id=?", [targetId]);
        }
        if (triggerFailure) await rawRun(raw, `CREATE TRIGGER fail_tile_content BEFORE UPDATE OF seo_title ON products
            WHEN OLD.external_id='MAT-000145' BEGIN SELECT RAISE(ABORT,'injected tile content failure'); END`);
    } finally { await rawClose(raw); }
    return file;
}

async function tableSnapshot(db) {
    const output = {};
    for (const table of RUNNER.PROTECTED_TABLES) output[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
    return output;
}

async function inspect(file) {
    const db = await RUNNER.openDatabase(file, false);
    try { return await RUNNER.inspectBatch(db, { only: EXPECTED }); }
    finally { await db.close(); }
}

async function main() {
    try {
    assert.deepStrictEqual(RUNNER.ALL_MATS, EXPECTED, "exact ordered 19-MAT allowlist");
    assert.strictEqual(RUNNER.ALL_MATS.filter(id => id === "MAT-000133").length, 1);
    assert.strictEqual(RUNNER.ALL_MATS[RUNNER.ALL_MATS.indexOf("MAT-000133") - 1], "MAT-000132");
    assert.strictEqual(RUNNER.ALL_MATS[RUNNER.ALL_MATS.indexOf("MAT-000133") + 1], "MAT-000134");
    assert.deepStrictEqual(RUNNER.CONTENT_FIELDS_EXACTLY, ALLOWED_FIELDS, "exact writable field set");
    assert.strictEqual(RUNNER.DATA.PRODUCTS.length, 19);
    assert.strictEqual(RUNNER.validateData(), true);
    assert.strictEqual(new Set(RUNNER.DATA.PRODUCTS.map(item => item.seoTitle.toLocaleLowerCase("ru-RU"))).size, 19);
    assert.strictEqual(new Set(RUNNER.DATA.PRODUCTS.map(item => item.seoDescription.toLocaleLowerCase("ru-RU"))).size, 19);
    assert(RUNNER.DATA.PRODUCTS.every(item => item.seoDescription.trim().length > 0 && [...item.seoDescription].length >= 135 && [...item.seoDescription].length <= 160),
        "all SEO descriptions must be non-empty and approximately 135–160 characters");
    const customerCopy = product => [product.shortDescription, product.fullDescription, product.seoTitle, product.seoDescription].join(" ");
    for (const product of RUNNER.DATA.PRODUCTS) {
        const approvedCore = RUNNER.DATA.CORE.PRODUCTS.find(item => item.externalId === product.externalId);
        for (const factCode of product.factsUsed) assert.strictEqual(approvedCore.core[factCode].status, "READY", `${product.externalId}/${factCode} must be READY`);
        if (product.externalId === "MAT-000144") assert(!customerCopy(product).includes("T10"));
    }
    for (const product of RUNNER.DATA.PRODUCTS) {
        const approvedCore = RUNNER.DATA.CORE.PRODUCTS.find(item => item.externalId === product.externalId);
        assert.strictEqual(product.identityStatus, "IDENTITY_CONFIRMED");
        assert.deepStrictEqual(
            [product.expectedTitle, product.expectedBrand, product.expectedCategory, product.expectedSubcategory, product.expectedWeight, product.expectedUnit],
            [approvedCore.expectedTitle, approvedCore.expectedBrand, approvedCore.expectedCategory, approvedCore.expectedSubcategory, approvedCore.expectedWeight, approvedCore.expectedUnit]
        );
    }
    const mat133 = RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000133");
    assert(mat133);
    assert.strictEqual(mat133.identityStatus, "IDENTITY_CONFIRMED");
    assert.deepStrictEqual(mat133.factsUsed, ["product_type", "package_weight", "purpose", "application_area", "adhesive_class", "layer_thickness", "consumption"]);
    assert.deepStrictEqual(
        [mat133.shortDescription, mat133.fullDescription, mat133.seoTitle, mat133.seoDescription],
        [
            "Ceresit CM 17 Super Flex, 25 кг — клей класса C2 TE S1 для плитки, керамогранита, клинкера и камня внутри и снаружи.",
            "Ceresit CM 17 Super Flex — клей класса C2 TE S1 для керамической плитки, керамогранита, клинкера и камня, кроме мрамора, включая крупноформатные плиты. Для стен и полов внутри и снаружи зданий; подходит для балконов, террас, бассейнов и стяжек с подогревом. Слой — до 10 мм, расход — около 1,1 кг/м² на 1 мм.",
            "Клей Ceresit CM 17 Super Flex 25 кг — купить в Москве",
            "Ceresit CM 17 Super Flex 25 кг — клей C2 TE S1 для плитки, керамогранита, клинкера и камня. Слой до 10 мм, расход около 1,1 кг/м² на 1 мм. Доставка по Москве."
        ]
    );
    assert.deepStrictEqual([mat133.shortDescription.length, mat133.fullDescription.length, mat133.seoTitle.length, mat133.seoDescription.length], [116, 308, 53, 158]);
    assert(mat133.sourceKeys.includes("ceresitCm17Tds"));
    assert(mat133.factsUsed.every(code => RUNNER.DATA.CORE.PRODUCTS.find(item => item.externalId === "MAT-000133").core[code].status === "READY"));
    assert(!/(?:серый|сер\.|walkability|source_conflict|needs_source|placeholder|grouting_time|maximum_tile_size|adhesion)/iu.test(customerCopy(mat133)));
    const mat131 = RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000131");
    assert(!/(?:серый|сер\.)/iu.test(customerCopy(mat131)), "MAT-000131 customer copy must not assert unsupported gray color");
    const mat145 = RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000145");
    assert([mat145.shortDescription, mat145.fullDescription, mat145.seoTitle, mat145.seoDescription].every(text => /Т14/iu.test(text)),
        "MAT-000145 public identity must consistently include T14");
    assert(!customerCopy(RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000134")).includes("LITOLIGHT K16"));
    assert(!customerCopy(RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000140")).match(/срок хранения|\b\d+\s*месяц/iu));
    assert(!customerCopy(RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000143")).match(/срок хранения|\b\d+\s*месяц/iu));
    assert(RUNNER.validateConfig({ ...RUNNER.DATA.PRODUCTS[0], seoDescription: "PLACEHOLDER text" }).some(problem => problem.includes("internal marker")), "placeholder markers must be rejected");
    assert(RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000127").fullDescription.includes("около 3 ч"));
    assert(RUNNER.DATA.PRODUCTS.find(item => item.externalId === "MAT-000138").fullDescription.includes("не менее 240 минут"));

    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", "MAT-000127"]), /Exact canonical/);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", [...EXPECTED, "MAT-000133"].join(",")]), /Exact canonical/);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", [EXPECTED[1], EXPECTED[0], ...EXPECTED.slice(2)].join(",")]), /Exact canonical/);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", [...EXPECTED, EXPECTED[0]].join(",")]), /Exact canonical/);
    assert.throws(() => RUNNER.assertExactBatch([EXPECTED[0], ...EXPECTED.slice(2)]), /Exact canonical/);
    assert.throws(() => RUNNER.validateData({ ...RUNNER.DATA, PRODUCTS: RUNNER.DATA.PRODUCTS.map((item, index) => index === 1 ? { ...item, seoTitle: RUNNER.DATA.PRODUCTS[0].seoTitle } : item) }), /Duplicate seo_title/);
    assert.throws(() => RUNNER.validateData({ ...RUNNER.DATA, PRODUCTS: RUNNER.DATA.PRODUCTS.map((item, index) => index === 1 ? { ...item, seoDescription: RUNNER.DATA.PRODUCTS[0].seoDescription } : item) }), /Duplicate seo_description/);

    const cleanFile = await createFixture("clean");
    const readOnly = await RUNNER.openDatabase(cleanFile, false);
    const beforeDry = await tableSnapshot(readOnly);
    const beforeDigest = digest(beforeDry);
    const dry = await RUNNER.inspectBatch(readOnly, { only: EXPECTED });
    const afterDry = await tableSnapshot(readOnly);
    assert.deepStrictEqual(dry.mode, "dry-run");
    assert.strictEqual(dry.summary.total, 19);
    assert.strictEqual(dry.summary.ready, 19);
    assert.strictEqual(dry.summary.wouldAdd, 76);
    assert.strictEqual(dry.rows.reduce((sum, row) => sum + row.wouldAdd, 0), 76, "19 × 4 exact proposed content writes");
    assert.strictEqual(dry.summary.existingOk, 0);
    assert.strictEqual(dry.summary.blocked, 0);
    assert.strictEqual(dry.summary.errors, 0);
    assert.strictEqual(dry.summary.duplicateSeoTitles, 0);
    assert.strictEqual(dry.summary.duplicateSeoDescriptions, 0);
    assert.strictEqual(dry.summary.existingSeoTitleCollisions, 0);
    assert.strictEqual(dry.summary.existingSeoDescriptionCollisions, 0);
    assert.deepStrictEqual(dry.writableSurface.productContentFields, ALLOWED_FIELDS);
    assert.deepStrictEqual(afterDry, beforeDry, "dry-run must preserve products and protected tables");
    assert.strictEqual(digest(afterDry), beforeDigest);
    await assert.rejects(() => readOnly.run("UPDATE products SET title='nope' WHERE id=1"), /readonly|query_only/i);
    await readOnly.close();

    assert.strictEqual(digest(afterDry), beforeDigest, "read-only dry-run table snapshot is stable");
    const subsetApplyDb = await RUNNER.openDatabase(cleanFile, true);
    await assert.rejects(() => RUNNER.applyBatch(subsetApplyDb, cleanFile, {
        only: EXPECTED.slice(0, -1), confirm: RUNNER.CONFIRM, backupDir: path.join(ROOT, "subset-backup")
    }), /Exact canonical/);
    await subsetApplyDb.close();

    const writeDb = await RUNNER.openDatabase(cleanFile, true);
    const beforeApply = await tableSnapshot(writeDb);
    const backupDir = path.join(ROOT, "backups");
    const applied = await RUNNER.applyBatch(writeDb, cleanFile, { only: EXPECTED, confirm: RUNNER.CONFIRM, backupDir });
    assert.strictEqual(applied.writes, 76);
    assert.strictEqual(applied.contentWrites, 76);
    assert.strictEqual(applied.backup.verified, true);
    assert(fs.existsSync(applied.backup.path) && applied.backup.path.startsWith(backupDir));
    const afterApply = await tableSnapshot(writeDb);
    for (const oldProduct of beforeApply.products) {
        const newProduct = afterApply.products.find(item => item.id === oldProduct.id);
        const expectedProduct = { ...oldProduct };
        if (EXPECTED.includes(oldProduct.external_id)) {
            const config = RUNNER.DATA.PRODUCTS.find(item => item.externalId === oldProduct.external_id);
            Object.assign(expectedProduct, completeContent(config));
        }
        assert.deepStrictEqual(newProduct, expectedProduct, `${oldProduct.external_id}: only the exact four content columns may change`);
    }
    for (const table of ["product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"])
        assert.deepStrictEqual(afterApply[table], beforeApply[table], `${table} must remain unchanged`);
    const postApply = await RUNNER.inspectBatch(writeDb, { only: EXPECTED });
    assert.strictEqual(postApply.summary.wouldAdd, 0);
    assert.strictEqual(postApply.summary.existingOk, 19);
    assert.strictEqual(postApply.summary.blocked, 0);
    const rerun = await RUNNER.applyBatch(writeDb, cleanFile, { only: EXPECTED, confirm: RUNNER.CONFIRM, backupDir: path.join(ROOT, "no-op-backup") });
    assert.strictEqual(rerun.writes, 0, "idempotent apply writes nothing");
    assert.strictEqual(rerun.backup, null, "idempotent apply does not create unnecessary backup");
    await writeDb.close();

    const exactFile = await createFixture("exact-existing", { initialContent: true });
    const exact = await inspect(exactFile);
    assert.strictEqual(exact.summary.existingOk, 19, "already exact candidate values classify as EXISTING_OK");
    assert.strictEqual(exact.summary.wouldAdd, 0);

    for (const field of ["title", "category", "subcategory", "weight", "unit", "brand", "content"]) {
        const guardedFile = await createFixture(`guard-${field}`, { guard: { externalId: "MAT-000134", field } });
        const guarded = await inspect(guardedFile);
        const row = guarded.rows.find(item => item.externalId === "MAT-000134");
        assert.strictEqual(row.status, field === "content" ? "EXISTING_CONTENT_BLOCKED" : "BLOCKED", `${field} guard must block target`);
        assert.strictEqual(guarded.summary.wouldAdd, 72, `${field} mismatch must prevent writes for that target only in dry-run report`);
    }

    for (const collision of ["title", "description"]) {
        const collisionFile = await createFixture(`seo-collision-${collision}`, { externalCollision: collision });
        const result = await inspect(collisionFile);
        assert.strictEqual(result.summary.blocked, 1, `${collision} collision with an outside product blocks target`);
        assert.strictEqual(result.rows[0].status, "SEO_COLLISION_BLOCKED");
        assert.strictEqual(collision === "title" ? result.summary.existingSeoTitleCollisions : result.summary.existingSeoDescriptionCollisions, 1);
    }

    const oldSchemaFile = await createFixture("wrong-schema", { schemaVersion: 10 });
    await assert.rejects(() => inspect(oldSchemaFile), /schema v11 required/);

    const rollbackFile = await createFixture("rollback", { triggerFailure: true });
    const rollbackDb = await RUNNER.openDatabase(rollbackFile, true);
    const rollbackBefore = await tableSnapshot(rollbackDb);
    await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: EXPECTED, confirm: RUNNER.CONFIRM, backupDir: path.join(ROOT, "rollback-backups") }), /injected tile content failure/);
    assert.deepStrictEqual(await tableSnapshot(rollbackDb), rollbackBefore, "injected write error must rollback all target and non-target data");
    await rollbackDb.close();

    console.log(JSON.stringify({
        success: true,
        exactScope19: true,
        mat133Included: true,
        exactWritableFields: ALLOWED_FIELDS,
        dryRun: { total: dry.summary.total, ready: dry.summary.ready, writes: dry.summary.wouldAdd, immutable: true },
        apply: { writes: applied.writes, backupVerified: applied.backup.verified, allOtherFieldsAndTablesUnchanged: true },
        idempotency: { existingOk: postApply.summary.existingOk, writes: rerun.writes },
        exactExistingContent: true,
        titleCategorySubcategoryWeightUnitBrandAndContentGuards: true,
        schemaV11Guard: true,
        internalDuplicateAndExternalCollisionChecks: true,
        noAttributeImageTitleSlugTemplateDefinitionWrites: true,
        rollback: true,
        copyBoundaries: { mat140ShelfLifeOmitted: true, mat134IdentityPreserved: true, mat144T10Omitted: true, qualifiedTimingRetained: true }
    }, null, 2));
    } finally {
    fs.rmSync(ROOT, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
