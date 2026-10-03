"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-sand-cement-repair-content-batch1");
const DATA = require("./data/mix-sand-cement-repair-content-batch1");

function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function createFixture(file, { titleMismatch = null, contentConflict = null, brandConflict = null } = {}) {
    const db = open(file);
    try {
        await run(db, `CREATE TABLE products (
            id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, category TEXT, subcategory TEXT,
            price REAL, weight REAL, unit TEXT, image TEXT, image_url TEXT, brand TEXT, description TEXT,
            short_description TEXT, full_description TEXT, seo_title TEXT, seo_description TEXT,
            product_group TEXT, stock_status TEXT, is_active INTEGER, deleted_at TEXT, updated_at TEXT
        )`);
        await run(db, `CREATE TABLE product_attribute_definitions (id INTEGER PRIMARY KEY, code TEXT, data_type TEXT, default_unit TEXT)`);
        await run(db, `CREATE TABLE product_attribute_values (id INTEGER PRIMARY KEY, product_id INTEGER, attribute_definition_id INTEGER, value_text TEXT, value_number REAL, value_boolean INTEGER, unit_override TEXT, sort_order INTEGER, created_at TEXT, updated_at TEXT)`);
        await run(db, `CREATE TABLE product_attribute_templates (id INTEGER PRIMARY KEY, structure_id INTEGER, attribute_definition_id INTEGER, sort_order INTEGER)`);
        await run(db, `CREATE TABLE product_images (id INTEGER PRIMARY KEY, product_id INTEGER, image_url TEXT, alt_text TEXT, sort_order INTEGER, is_primary INTEGER)`);
        await run(db, "INSERT INTO product_attribute_definitions VALUES (1,'preserved_core','text',NULL)");
        await run(db, "INSERT INTO product_attribute_templates VALUES (1,11,1,1)");
        for (const [index, config] of DATA.PRODUCTS.entries()) {
            const id = index + 1;
            const title = config.externalId === titleMismatch ? `${config.expectedTitle} changed` : config.expectedTitle;
            const brand = config.externalId === brandConflict ? "UNEXPECTED BRAND" : config.expectedIdentityBrand;
            const short = config.externalId === contentConflict ? "Different approved copy exists" : null;
            await run(db, `INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                id, config.externalId, title, `slug-${id}`, config.expectedCategory, config.expectedSubcategory,
                100 + id, config.expectedWeight, config.expectedUnit, "legacy-image", `/uploads/products/${config.externalId}.png`, brand,
                `legacy-description-${id}`, short, null, null, null, "мешки", "available", 1, null, `before-${id}`
            ]);
            await run(db, "INSERT INTO product_attribute_values VALUES (?,?,?,?,?,?,?,?,?,?)", [id, 1, 1, `core-${id}`, null, null, null, 1, "old-created", "old-updated"]);
            await run(db, "INSERT INTO product_images VALUES (?,?,?,?,?,?)", [id, id, `/uploads/products/${config.externalId}.png`, `alt-${id}`, 0, 1]);
        }
        await run(db, `INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            99, "MAT-999999", "Untouched unrelated", "other", "Смеси", "Other", 500, 1, "шт", "", "/placeholder.png", "Other brand",
            "Other description", "Other short", "Other full", "Other SEO title", "Other SEO description", "other", "available", 1, null, "unrelated-before"
        ]);
    } finally { await close(db); }
}

async function main() {
    RUNNER.validateData();
    assert.deepStrictEqual(RUNNER.CONTENT_FIELDS_EXACTLY, ["short_description", "full_description", "seo_title", "seo_description"]);
    assert.deepStrictEqual(RUNNER.TITLE_CORRECTION_MATS, ["MAT-000110", "MAT-000111"]);
    assert.deepStrictEqual(RUNNER.ALL_MATS, ["MAT-000109", "MAT-000110", "MAT-000111", "MAT-000117", "MAT-000118"]);
    assert(!RUNNER.ALL_MATS.includes("MAT-000113") && !RUNNER.ALL_MATS.includes("MAT-000114") && !RUNNER.ALL_MATS.includes("MAT-000115"));
    const runnerSource = fs.readFileSync(path.join(__dirname, "backfill-mix-sand-cement-repair-content-batch1.js"), "utf8");
    assert(!/\b(?:INSERT\s+INTO\s+\w+|DELETE\s+FROM\s+\w+|REPLACE\s+INTO\s+\w+|ALTER\s+TABLE)\b/i.test(runnerSource));
    assert.deepStrictEqual([...runnerSource.matchAll(/UPDATE\s+products\s+SET\s+([^"`]+)/giu)].map(match => match[1].trim()), ["${field}=? WHERE id=? AND external_id=? AND title=? AND category=? AND subcategory=? AND weight=? AND unit=? AND is_active=1 AND deleted_at IS NULL AND (${field} IS NULL OR TRIM(${field})='')", "title=? WHERE id=? AND external_id=? AND title=?"]);
    assert(!/SET\s+(?:slug|brand|weight|price|stock|image|category|subcategory)\s*=/iu.test(runnerSource));

    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-repair-content-batch1-"));
    try {
        const file = path.join(root, "fixture.db");
        await createFixture(file);
        assert.doesNotThrow(() => RUNNER.parseArgs(["--db", file, "--only", RUNNER.ALL_MATS.join(",")]));
        assert.throws(() => RUNNER.parseArgs(["--db", file, "--only", "MAT-000109"]), /Exact 5-MAT/);
        assert.throws(() => RUNNER.parseArgs(["--db", file, "--only", `${RUNNER.ALL_MATS.join(",")},MAT-000113`]), /Exact 5-MAT/);
        assert.throws(() => RUNNER.parseArgs(["--db", file, "--only", [...RUNNER.ALL_MATS.slice(0, 4), "MAT-000117"].join(",")]), /Duplicate MAT/);
        assert.throws(() => RUNNER.parseArgs(["--db", file, "--only", RUNNER.ALL_MATS.join(","), "--apply", "--confirm", RUNNER.CONFIRM]), /explicit --backup-dir/);
        const scopeDb = await RUNNER.openDatabase(file, true);
        await assert.rejects(() => RUNNER.applyBatch(scopeDb, file, { only: [RUNNER.ALL_MATS[0]], confirm: RUNNER.CONFIRM, backupDir: path.join(root, "should-not-exist") }), /Exact 5-MAT/);
        await scopeDb.close();

        const beforeDry = hash(file);
        const readDb = await RUNNER.openDatabase(file, false);
        const report = await RUNNER.inspectBatch(readDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(report.summary.total, 5);
        assert.strictEqual(report.summary.ready, 5);
        assert.strictEqual(report.summary.wouldAdd, 20);
        assert.strictEqual(report.summary.wouldFix, 0);
        assert.strictEqual(report.summary.blocked, 0);
        assert.strictEqual(report.summary.errors, 0);
        assert.strictEqual(report.summary.plannedTitleCorrections, 2);
        assert.strictEqual(report.summary.existingTitleCorrections, 0);
        for (const row of report.rows.filter(item => RUNNER.TITLE_CORRECTION_MATS.includes(item.externalId))) {
            assert.strictEqual(row.titleCorrectionStatus, "WOULD_CORRECT");
            assert.strictEqual(row.currentTitle, DATA.PRODUCTS.find(item => item.externalId === row.externalId).titleCorrection.expectedOldTitle);
        }
        assert.strictEqual(report.rows.filter(item => item.titleCorrectionStatus === "WOULD_CORRECT").length, 2);
        await assert.rejects(() => RUNNER.inspectBatch(readDb, { only: [RUNNER.ALL_MATS[0]] }), /Exact 5-MAT/);
        await readDb.close();
        assert.strictEqual(hash(file), beforeDry, "dry-run must leave the DB byte-identical");

        const backupDir = path.join(root, "verified-backups");
        const applyDb = await RUNNER.openDatabase(file, true);
        const result = await RUNNER.applyBatch(applyDb, file, { only: RUNNER.ALL_MATS, confirm: RUNNER.CONFIRM, backupDir });
        assert.strictEqual(result.mode, "apply");
        assert.strictEqual(result.writes, 22);
        assert.strictEqual(result.contentWrites, 20);
        assert.strictEqual(result.titleCorrections, 2);
        assert.strictEqual(result.summary.ready, 0);
        assert.strictEqual(result.summary.existingOk, 5);
        assert.strictEqual(result.summary.wouldAdd, 0);
        assert(result.backup.verified);
        assert.strictEqual(path.dirname(result.backup.path), backupDir);
        assert(fs.statSync(result.backup.path).size > 1024);
        const unchangedCore = await applyDb.all("SELECT * FROM product_attribute_values ORDER BY id");
        assert.strictEqual(unchangedCore.length, 5);
        const unrelated = await applyDb.get("SELECT short_description,full_description,seo_title,seo_description,updated_at FROM products WHERE external_id='MAT-999999'");
        assert.deepStrictEqual(Object.values(unrelated), ["Other short", "Other full", "Other SEO title", "Other SEO description", "unrelated-before"]);
        for (const config of DATA.PRODUCTS) {
            const actual = await applyDb.get("SELECT title,slug,short_description,full_description,seo_title,seo_description,updated_at FROM products WHERE external_id=?", [config.externalId]);
            assert.deepStrictEqual([actual.short_description, actual.full_description, actual.seo_title, actual.seo_description], [config.shortDescription, config.fullDescription, config.seoTitle, config.seoDescription]);
            assert.strictEqual(actual.updated_at, `before-${DATA.PRODUCTS.indexOf(config) + 1}`);
            assert.strictEqual(actual.slug, `slug-${DATA.PRODUCTS.indexOf(config) + 1}`);
            assert.strictEqual(actual.title, config.titleCorrection?.proposedTitle || config.expectedTitle);
        }
        const afterDry = await RUNNER.inspectBatch(applyDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(afterDry.summary.wouldAdd, 0);
        assert.strictEqual(afterDry.summary.existingOk, 5);
        assert.strictEqual(afterDry.summary.plannedTitleCorrections, 0);
        assert.strictEqual(afterDry.summary.existingTitleCorrections, 2);
        assert.strictEqual(afterDry.summary.blocked, 0);
        await applyDb.close();

        const conflictFile = path.join(root, "conflict.db");
        await createFixture(conflictFile, { contentConflict: "MAT-000109" });
        const conflictDb = await RUNNER.openDatabase(conflictFile, false);
        const conflict = await RUNNER.inspectBatch(conflictDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(conflict.rows.find(row => row.externalId === "MAT-000109").status, "EXISTING_CONTENT_BLOCKED");
        assert.strictEqual(conflict.summary.blocked, 1);
        await conflictDb.close();

        const titleFile = path.join(root, "title.db");
        await createFixture(titleFile, { titleMismatch: "MAT-000111" });
        const titleDb = await RUNNER.openDatabase(titleFile, false);
        const title = await RUNNER.inspectBatch(titleDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(title.rows.find(row => row.externalId === "MAT-000111").status, "BLOCKED");
        assert(/Exact title guard failed/.test(title.rows.find(row => row.externalId === "MAT-000111").error));
        await titleDb.close();

        const brandFile = path.join(root, "brand.db");
        await createFixture(brandFile, { brandConflict: "MAT-000110" });
        const brandDb = await RUNNER.openDatabase(brandFile, false);
        const brand = await RUNNER.inspectBatch(brandDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(brand.rows.find(row => row.externalId === "MAT-000110").status, "BLOCKED");
        await brandDb.close();

        const titleScopeFile = path.join(root, "title-scope.db");
        await createFixture(titleScopeFile, { titleMismatch: "MAT-000110" });
        const titleScopeDb = await RUNNER.openDatabase(titleScopeFile, false);
        const titleScope = await RUNNER.inspectBatch(titleScopeDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(titleScope.rows.find(row => row.externalId === "MAT-000110").status, "BLOCKED");
        assert.match(titleScope.rows.find(row => row.externalId === "MAT-000110").error, /Exact title guard failed/);
        await titleScopeDb.close();
        const titleScopeBeforeApply = hash(titleScopeFile);
        const titleScopeApplyDb = await RUNNER.openDatabase(titleScopeFile, true);
        await assert.rejects(() => RUNNER.applyBatch(titleScopeApplyDb, titleScopeFile, { only: RUNNER.ALL_MATS, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "blocked-title-backup") }), /Content batch apply blocked/);
        await titleScopeApplyDb.close();
        assert.strictEqual(hash(titleScopeFile), titleScopeBeforeApply, "unknown title must block apply without DB changes");
        assert(!fs.existsSync(path.join(root, "blocked-title-backup")), "blocked title must stop before backup or writes");

        const rollbackFile = path.join(root, "rollback.db");
        await createFixture(rollbackFile);
        const rollbackSeed = await open(rollbackFile);
        await run(rollbackSeed, "CREATE TRIGGER fail_second_title BEFORE UPDATE OF title ON products WHEN OLD.external_id='MAT-000111' BEGIN SELECT RAISE(ABORT,'injected title failure'); END");
        await close(rollbackSeed);
        const rollbackDb = await RUNNER.openDatabase(rollbackFile, true);
        const rollbackBefore = {};
        for (const table of RUNNER.PROTECTED_TABLES) rollbackBefore[table] = await rollbackDb.all(`SELECT * FROM ${table} ORDER BY id`);
        await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: RUNNER.ALL_MATS, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "rollback-backups") }), /injected title failure/);
        const rollbackAfter = {};
        for (const table of RUNNER.PROTECTED_TABLES) rollbackAfter[table] = await rollbackDb.all(`SELECT * FROM ${table} ORDER BY id`);
        assert.deepStrictEqual(rollbackAfter, rollbackBefore, "title failure must roll back all content/title writes");
        await rollbackDb.close();

        const noTitleCorrectionFile = path.join(root, "no-title-correction.db");
        await createFixture(noTitleCorrectionFile, { titleMismatch: "MAT-000117" });
        const noTitleCorrectionDb = await RUNNER.openDatabase(noTitleCorrectionFile, false);
        const noTitleCorrection = await RUNNER.inspectBatch(noTitleCorrectionDb, { only: RUNNER.ALL_MATS });
        assert.strictEqual(noTitleCorrection.rows.find(row => row.externalId === "MAT-000117").status, "BLOCKED");
        await noTitleCorrectionDb.close();

        console.log(JSON.stringify({
            exactScope: "PASS",
            dryRunReadOnly: "PASS",
            contentWrites: result.contentWrites,
            titleCorrections: result.titleCorrections,
            backupVerified: result.backup.verified,
            immutableCoreAndUnrelatedRows: "PASS",
            idempotency: "PASS",
            exactOldTitleGuardsAndScope: "PASS",
            titleCorrectionRollback: "PASS",
            slugsUnchanged: "PASS",
            brandAndContentGuards: "PASS",
            existingContentConflict: "PASS"
        }, null, 2));
    } finally {
        try { fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
        catch (error) { console.error(`Fixture cleanup failed at ${root}: ${error.message}`); }
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
