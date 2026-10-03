"use strict";

const assert = require("assert");
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-cement-content-batch3");
const DATA = require("./data/mix-cement-content-batch3");

function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function createFixture(file, { contentConflict = null } = {}) {
    const db = open(file);
    try {
        await run(db, `CREATE TABLE products (
            id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, category TEXT, subcategory TEXT,
            price REAL, weight REAL, unit TEXT, image TEXT, image_url TEXT, brand TEXT, description TEXT,
            short_description TEXT, full_description TEXT, seo_title TEXT, seo_description TEXT,
            product_group TEXT, stock_status TEXT, is_active INTEGER, deleted_at TEXT, updated_at TEXT
        )`);
        await run(db, "CREATE TABLE product_attribute_definitions (id INTEGER PRIMARY KEY, code TEXT, data_type TEXT, default_unit TEXT)");
        await run(db, "CREATE TABLE product_attribute_values (id INTEGER PRIMARY KEY, product_id INTEGER, attribute_definition_id INTEGER, value_text TEXT, value_number REAL, value_boolean INTEGER, unit_override TEXT, sort_order INTEGER, created_at TEXT, updated_at TEXT)");
        await run(db, "CREATE TABLE product_attribute_templates (id INTEGER PRIMARY KEY, structure_id INTEGER, attribute_definition_id INTEGER, sort_order INTEGER)");
        await run(db, "CREATE TABLE product_images (id INTEGER PRIMARY KEY, product_id INTEGER, image_url TEXT, alt_text TEXT, sort_order INTEGER, is_primary INTEGER)");
        await run(db, "PRAGMA user_version=11");
        await run(db, "INSERT INTO product_attribute_definitions VALUES (1,'existing-core','text',NULL)");
        await run(db, "INSERT INTO product_attribute_values VALUES (1,99,1,'preserve',NULL,NULL,NULL,1,'created','updated')");
        await run(db, "INSERT INTO product_attribute_templates VALUES (1,12,1,1)");
        await run(db, "INSERT INTO product_images VALUES (1,99,'/uploads/placeholder.png','existing',0,1)");
        for (const [index, config] of DATA.PRODUCTS.entries()) {
            const fields = {
                id: index + 1,
                external_id: config.externalId,
                title: config.expectedTitle,
                slug: `${config.externalId.toLowerCase()}-fixture`,
                category: config.expectedCategory,
                subcategory: config.expectedSubcategory,
                price: 321 + index,
                weight: config.expectedWeight,
                unit: config.expectedUnit,
                image: "/uploads/placeholder.png",
                image_url: "/uploads/placeholder.png",
                brand: config.expectedBrand,
                description: "legacy description",
                short_description: null,
                full_description: null,
                seo_title: null,
                seo_description: null,
                product_group: null,
                stock_status: "in_stock",
                is_active: 1,
                deleted_at: null,
                updated_at: "unchanged"
            };
            const fieldNames = Object.keys(fields);
            if (contentConflict?.externalId === config.externalId) fields[contentConflict.field] = "unexpected existing content";
            await run(db, `INSERT INTO products (${fieldNames.join(",")}) VALUES (${fieldNames.map(() => "?").join(",")})`, fieldNames.map(field => fields[field]));
        }
        await run(db, `INSERT INTO products (id,external_id,title,slug,category,subcategory,price,weight,unit,image,image_url,brand,description,short_description,full_description,seo_title,seo_description,product_group,stock_status,is_active,deleted_at,updated_at)
            VALUES (99,'MAT-999999','Unrelated','unrelated','Other','Other',999,1,'шт',NULL,NULL,'Other',NULL,NULL,NULL,NULL,NULL,NULL,'in_stock',1,NULL,'unchanged')`);
    } finally { await close(db); }
}

async function snapshot(file) {
    const db = open(file);
    try {
        const result = {};
        for (const table of RUNNER.PROTECTED_TABLES) result[table] = await all(db, `SELECT * FROM ${table} ORDER BY id`);
        return result;
    } finally { await close(db); }
}

async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-cement-content-batch3-"));
    try {
        const expected = RUNNER.ALL_MATS;
        assert.deepStrictEqual(expected, ["MAT-000113", "MAT-000114", "MAT-000115"]);
        assert.deepStrictEqual(RUNNER.assertExactBatch(expected), expected);
        assert.throws(() => RUNNER.assertExactBatch([expected[0], expected[1]]), /Exact canonical/);
        assert.throws(() => RUNNER.assertExactBatch([...expected, "MAT-000116"]), /Exact canonical/);
        assert.throws(() => RUNNER.assertExactBatch([expected[0], expected[0], expected[2]]), /Exact canonical/);
        assert.throws(() => RUNNER.parseArgs(["--db", "x.db", "--only", "MAT-000113"]), /Exact canonical/);
        assert.throws(() => RUNNER.parseArgs(["--db", "x.db", "--only", expected.join(","), "--apply"]), /--confirm/);
        assert.throws(() => RUNNER.parseArgs(["--db", "x.db", "--only", expected.join(","), "--apply", "--confirm", RUNNER.CONFIRM]), /--backup-dir/);
        assert.strictEqual(RUNNER.parseArgs(["--db", "fixture.db", "--only", expected.join(",")]).apply, false, "dry-run is default");
        RUNNER.validateData();

        const oldSchemaFile = path.join(root, "old-schema.db");
        await createFixture(oldSchemaFile);
        const oldSchemaSeed = open(oldSchemaFile);
        await run(oldSchemaSeed, "PRAGMA user_version=4");
        await close(oldSchemaSeed);
        const oldSchemaDb = await RUNNER.openDatabase(oldSchemaFile, false);
        await assert.rejects(() => RUNNER.inspectBatch(oldSchemaDb, { only: expected }), /schema v11 required/);
        await oldSchemaDb.close();

        const copy113 = DATA.PRODUCTS[0];
        const copy114 = DATA.PRODUCTS[1];
        const copy115 = DATA.PRODUCTS[2];
        assert.strictEqual(copy113.fullDescription, "ЦЕМЕНТУМ ExtraCEM 500 — портландцемент с известняком до 20%. Применяется для устройства полусухих и мокрых стяжек, дорожек, отмосток и площадок, возведения фундаментов и несущих конструкций, приготовления кладочных растворов, а также при укладке брусчатки и камня. Соответствует ГОСТ 31108-2020. Фасовка — 40 кг.");
        assert.strictEqual(copy115.fullDescription, "Цемент Русеан ЦЕМ I 42,5Н — портландцемент без минеральных добавок. Применяется для железобетонных конструкций, гидротехнических сооружений в пресной воде, массивного монолитного бетона, аэродромного и дорожного строительства, а также зимнего бетонирования с обогревом. Цвет — серый; температура проведения работ — от +10 до +25 °C. Соответствует ГОСТ 31108-2020. Фасовка — 40 кг.");
        assert(!copy115.factsUsed.includes("compressive_strength"), "MAT-115 copy no longer states compressive strength");
        assert(!`${copy113.shortDescription} ${copy113.fullDescription} ${copy113.seoTitle} ${copy113.seoDescription}`.match(/42,5[НБ]/u), "MAT-113 must omit plant-dependent class");
        assert(!`${copy114.shortDescription} ${copy114.fullDescription} ${copy114.seoTitle} ${copy114.seoDescription}`.match(/ГОСТ|МПа|класс|прочност|завод|производ|\+\d|мороз/iu), "MAT-114 must remain conservative");
        assert(/ЦЕМ I 42,5Н/u.test(copy115.fullDescription) && !/завод|производител/iu.test(copy115.fullDescription), "MAT-115 keeps exact class and omits plant");

        const fixture = path.join(root, "dry-run.db");
        await createFixture(fixture);
        const beforeHash = hash(fixture);
        const dryDb = await RUNNER.openDatabase(fixture, false);
        let dry;
        try { dry = await RUNNER.inspectBatch(dryDb, { only: expected }); }
        finally { await dryDb.close(); }
        assert.strictEqual(hash(fixture), beforeHash, "dry-run must leave fixture DB byte-identical");
        assert.deepStrictEqual({ total: dry.summary.total, ready: dry.summary.ready, wouldAdd: dry.summary.wouldAdd, existingOk: dry.summary.existingOk, blocked: dry.summary.blocked, errors: dry.summary.errors }, { total: 3, ready: 3, wouldAdd: 12, existingOk: 0, blocked: 0, errors: 0 });
        assert.strictEqual(dry.summary.duplicateSeoTitles, 0);
        assert.strictEqual(dry.summary.duplicateSeoDescriptions, 0);
        assert.deepStrictEqual([dry.summary.titleWrites, dry.summary.slugWrites, dry.summary.imageWrites, dry.summary.coreWrites], [0, 0, 0, 0]);
        console.log("DISPOSABLE_DRY_RUN=" + JSON.stringify(dry.summary));
        const cliDry = spawnSync(process.execPath, [path.join(__dirname, "backfill-mix-cement-content-batch3.js"), "--db", fixture, "--only", expected.join(",")], { encoding: "utf8" });
        assert.strictEqual(cliDry.status, 0, cliDry.stderr);
        assert(cliDry.stdout.includes('"mode": "dry-run"'), "CLI defaults to dry-run");
        assert(cliDry.stdout.includes('"wouldAdd": 12'), "CLI dry-run reports twelve content writes");

        const subsetDb = await RUNNER.openDatabase(fixture, false);
        await assert.rejects(() => RUNNER.inspectBatch(subsetDb, { only: [expected[0]] }), /Exact canonical/);
        await subsetDb.close();
        const subsetApplyDb = await RUNNER.openDatabase(fixture, true);
        await assert.rejects(() => RUNNER.applyBatch(subsetApplyDb, fixture, { only: [expected[0]], confirm: RUNNER.CONFIRM, backupDir: path.join(root, "subset-backup") }), /Exact canonical/);
        await subsetApplyDb.close();
        assert(!fs.existsSync(path.join(root, "subset-backup")), "subset must reject before backup");

        const beforeApply = await snapshot(fixture);
        const applyDb = await RUNNER.openDatabase(fixture, true);
        const applied = await RUNNER.applyBatch(applyDb, fixture, { only: expected, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "backups") });
        await applyDb.close();
        assert.strictEqual(applied.mode, "apply");
        assert.strictEqual(applied.contentWrites, 12);
        assert.strictEqual(applied.backup.verified, true);
        assert.strictEqual(applied.backup.schemaVersion, 11);
        assert.strictEqual(applied.summary.existingOk, 3);
        assert.strictEqual(applied.summary.wouldAdd, 0);
        assert.deepStrictEqual(applied.summary, { total: 3, ready: 0, existingOk: 3, wouldAdd: 0, blocked: 0, errors: 0, duplicateSeoTitles: 0, duplicateSeoDescriptions: 0, titleWrites: 0, slugWrites: 0, imageWrites: 0, coreWrites: 0, forbiddenPublicMarkers: 0 });
        const after = await snapshot(fixture);
        assert.deepStrictEqual(after.product_attribute_values, beforeApply.product_attribute_values);
        assert.deepStrictEqual(after.product_attribute_definitions, beforeApply.product_attribute_definitions);
        assert.deepStrictEqual(after.product_attribute_templates, beforeApply.product_attribute_templates);
        assert.deepStrictEqual(after.product_images, beforeApply.product_images);
        const productRows = after.products;
        const unrelated = productRows.find(row => row.external_id === "MAT-999999");
        assert.strictEqual(unrelated.updated_at, "unchanged");
        for (const product of DATA.PRODUCTS) {
            const row = productRows.find(item => item.external_id === product.externalId);
            assert.strictEqual(row.title, product.expectedTitle);
            assert.strictEqual(row.slug, `${product.externalId.toLowerCase()}-fixture`);
            assert.strictEqual(row.brand, product.expectedBrand);
            for (const [field, property] of Object.entries({ short_description: "shortDescription", full_description: "fullDescription", seo_title: "seoTitle", seo_description: "seoDescription" })) assert.strictEqual(row[field], product[property]);
            assert.strictEqual(row.updated_at, "unchanged");
        }

        const repeatDb = await RUNNER.openDatabase(fixture, false);
        const repeat = await RUNNER.inspectBatch(repeatDb, { only: expected });
        await repeatDb.close();
        assert.strictEqual(repeat.summary.wouldAdd, 0);
        assert.strictEqual(repeat.summary.existingOk, 3);
        assert.strictEqual(repeat.summary.blocked, 0);
        console.log("DISPOSABLE_IDEMPOTENCY=" + JSON.stringify(repeat.summary));

        const conflictFile = path.join(root, "conflict.db");
        await createFixture(conflictFile, { contentConflict: { externalId: "MAT-000114", field: "seo_title" } });
        const conflictBefore = hash(conflictFile);
        const conflictDb = await RUNNER.openDatabase(conflictFile, true);
        await assert.rejects(() => RUNNER.applyBatch(conflictDb, conflictFile, { only: expected, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "conflict-backups") }), /apply blocked/iu);
        await conflictDb.close();
        assert.strictEqual(hash(conflictFile), conflictBefore, "existing different content blocks without DB mutation");

        const rollbackFile = path.join(root, "rollback.db");
        await createFixture(rollbackFile);
        const triggerDb = open(rollbackFile);
        await run(triggerDb, "CREATE TRIGGER fail_mat114_seo BEFORE UPDATE OF seo_title ON products WHEN OLD.external_id='MAT-000114' BEGIN SELECT RAISE(ABORT,'injected failure'); END");
        await close(triggerDb);
        const rollbackBefore = await snapshot(rollbackFile);
        const rollbackApplyDb = await RUNNER.openDatabase(rollbackFile, true);
        await assert.rejects(() => RUNNER.applyBatch(rollbackApplyDb, rollbackFile, { only: expected, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "rollback-backups") }), /injected failure/);
        const rollbackAfter = await snapshot(rollbackFile);
        await rollbackApplyDb.close();
        assert.deepStrictEqual(rollbackAfter, rollbackBefore, "failed transaction rolls back every protected table");

        console.log(JSON.stringify({ exactScope: "PASS", dryRunReadOnly: "PASS", exact12ContentWrites: "PASS", titlesSlugsBrandsCoreImagesImmutable: "PASS", existingConflictBlocks: "PASS", backupVerified: applied.backup.verified, rollback: "PASS", idempotency: "PASS", copyFactsAndCementClassBoundaries: "PASS" }, null, 2));
    } finally {
        try { fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
        catch (error) { console.error(`Disposable fixture cleanup failed at ${root}: ${error.message}`); }
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
