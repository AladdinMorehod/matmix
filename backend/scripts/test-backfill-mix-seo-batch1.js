"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-seo-batch1");
const DATA = require("./data/mixes-seo-batch1");

function tempFile(name) { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mix-seo-")), name); }
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function execSql(file, sql) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.exec(sql, error => db.close(() => error ? reject(error) : resolve())); }); }
function pass(name) { console.log(`PASS ${name}`); }

async function fixture(file, { firstExisting = true } = {}) {
    const db = new sqlite3.Database(file);
    await new Promise((resolve, reject) => db.exec(`
      CREATE TABLE products(
        id INTEGER PRIMARY KEY, external_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL, slug TEXT,
        category TEXT, subcategory TEXT, product_group TEXT, price REAL, weight REAL, unit TEXT,
        image TEXT, image_url TEXT, description TEXT, short_description TEXT, full_description TEXT,
        brand TEXT, seo_title TEXT, seo_description TEXT, stock_status TEXT, is_active INTEGER,
        deleted_at TEXT, updated_at TEXT
      );
      CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY, product_id INTEGER, value_text TEXT);
      CREATE TABLE product_images(id INTEGER PRIMARY KEY, product_id INTEGER, image_url TEXT);
      INSERT INTO product_attribute_values VALUES(1,1,'sentinel');
      INSERT INTO product_images VALUES(1,1,'/image.webp');`, error => error ? reject(error) : resolve()));
    const insert = db.prepare("INSERT INTO products(id,external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,image_url,description,short_description,full_description,brand,seo_title,seo_description,stock_status,is_active,deleted_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    for (const [index, item] of DATA.PRODUCTS.entries()) {
        const seoTitle = firstExisting && index === 0 ? item.proposedSeoTitle : null;
        const seoDescription = firstExisting && index === 0 ? item.proposedSeoDescription : null;
        await new Promise((resolve, reject) => insert.run(index + 1, item.externalId, item.expectedTitle, `slug-${item.externalId}`, item.expectedCategory, item.expectedSubcategory, index < 3 ? "EUROMIX" : "Floor", 100 + index, 20, "шт", "/image.webp", "/image.webp", "legacy description", "legacy short", "approved full", "brand", seoTitle, seoDescription, "unknown", 1, null, "before", error => error ? reject(error) : resolve()));
    }
    await new Promise((resolve, reject) => insert.finalize(error => error ? reject(error) : resolve()));
    await new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
}

(async () => {
    const exact = DATA.CONFIRMED_MATS;
    assert.deepStrictEqual(RUNNER.SEO_MUTABLE_FIELDS_EXACTLY, ["seo_title", "seo_description"]);
    assert.equal(exact.length, 18);
    assert.equal(RUNNER.CONFIRM, "BACKFILL_MIX_SEO_BATCH1");
    assert.deepStrictEqual(RUNNER.parseArgs(["--db", "fixture.db", "--only", exact.join(",")]).only, exact);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", exact.slice(0, -1).join(",")]), /Exact 18-MAT batch/);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", `${exact.join(",")},MAT-000222`]), /Exact 18-MAT batch|canonical/);
    assert.throws(() => RUNNER.parseArgs(["--db", "fixture.db", "--only", `${exact.slice(0, 2).join(",")},${exact[1]},${exact.slice(2, -1).join(",")}`]), /Duplicate|canonical|Exact 18-MAT/);
    pass("exact allowlist, order and CLI guards");

    const dryFile = tempFile("dry.db");
    await fixture(dryFile);
    const before = sha(dryFile);
    const dryDb = await RUNNER.openDatabase(dryFile, false);
    const dry = await RUNNER.inspectBatch(dryDb, { only: exact });
    assert.equal(dry.summary.total, 18);
    assert.equal(dry.summary.ready, 17);
    assert.equal(dry.summary.existingOk, 1);
    assert.equal(dry.summary.blocked, 0);
    assert.equal(dry.summary.errors, 0);
    assert.equal(sha(dryFile), before);
    await dryDb.close();
    const subsetDb = await RUNNER.openDatabase(dryFile, false);
    await assert.rejects(() => RUNNER.inspectBatch(subsetDb, { only: exact.slice(0, 1) }), /Exact 18-MAT batch/);
    await subsetDb.close();
    pass("dry-run is read-only and direct subset is rejected");

    const applyFile = tempFile("apply.db");
    await fixture(applyFile, { firstExisting: false });
    const applyDb = await RUNNER.openDatabase(applyFile, true);
    const tableCountsBefore = {
        attributes: (await applyDb.get("SELECT COUNT(*) AS count FROM product_attribute_values")).count,
        images: (await applyDb.get("SELECT COUNT(*) AS count FROM product_images")).count
    };
    const applied = await RUNNER.applyBatch(applyDb, applyFile, { only: exact, confirm: RUNNER.CONFIRM, backupDir: path.dirname(applyFile) });
    assert.equal(applied.writes, 18);
    const after = await applyDb.all("SELECT * FROM products ORDER BY id");
    for (const row of after) {
        const config = DATA.PRODUCTS.find(item => item.externalId === row.external_id);
        assert.equal(row.seo_title, config.proposedSeoTitle);
        assert.equal(row.seo_description, config.proposedSeoDescription);
        assert.equal(row.title, config.expectedTitle);
        assert.equal(row.slug, `slug-${row.external_id}`);
        assert.equal(row.price, 100 + row.id - 1);
        assert.equal(row.brand, "brand");
        assert.equal(row.image_url, "/image.webp");
        assert.equal(row.full_description, "approved full");
    }
    const repeated = await RUNNER.applyBatch(applyDb, applyFile, { only: exact, confirm: RUNNER.CONFIRM, backupDir: path.dirname(applyFile) });
    assert.equal(repeated.writes, 0);
    assert.equal((await applyDb.get("SELECT COUNT(*) AS count FROM product_attribute_values")).count, tableCountsBefore.attributes);
    assert.equal((await applyDb.get("SELECT COUNT(*) AS count FROM product_images")).count, tableCountsBefore.images);
    await applyDb.close();
    pass("apply changes only SEO fields and is idempotent");

    const conflictFile = tempFile("conflict.db");
    await fixture(conflictFile, { firstExisting: false });
    await execSql(conflictFile, "UPDATE products SET seo_title='existing different' WHERE external_id='MAT-000067'");
    const conflictDb = await RUNNER.openDatabase(conflictFile, true);
    const conflict = await RUNNER.inspectBatch(conflictDb, { only: exact });
    assert.equal(conflict.rows.find(row => row.externalId === "MAT-000067").status, "EXISTING_SEO_BLOCKED");
    await assert.rejects(() => RUNNER.applyBatch(conflictDb, conflictFile, { only: exact, confirm: RUNNER.CONFIRM, backupDir: path.dirname(conflictFile) }), /blocked/);
    await conflictDb.close();
    pass("conflicting existing SEO blocks overwrite");

    const subsetApplyDb = await RUNNER.openDatabase(conflictFile, true);
    await assert.rejects(() => RUNNER.applyBatch(subsetApplyDb, conflictFile, { only: exact.slice(0, 1), confirm: RUNNER.CONFIRM, backupDir: path.dirname(conflictFile) }), /Exact 18-MAT batch/);
    await subsetApplyDb.close();
    pass("direct apply subset is rejected");

    const titleFile = tempFile("title.db");
    await fixture(titleFile, { firstExisting: false });
    await execSql(titleFile, "UPDATE products SET title='wrong title' WHERE external_id='MAT-000068'");
    const titleDb = await RUNNER.openDatabase(titleFile, false);
    const titleReport = await RUNNER.inspectBatch(titleDb, { only: exact });
    assert.equal(titleReport.rows.find(row => row.externalId === "MAT-000068").status, "ERROR");
    await titleDb.close();
    pass("exact title guard blocks mismatched product");

    const duplicateData = { ...DATA, PRODUCTS: DATA.PRODUCTS.map((item, index) => index === 1 ? { ...item, proposedSeoTitle: DATA.PRODUCTS[0].proposedSeoTitle } : item) };
    const duplicateDb = await RUNNER.openDatabase(dryFile, false);
    const duplicate = await RUNNER.inspectBatch(duplicateDb, { only: exact, data: duplicateData });
    assert.equal(duplicate.summary.duplicateSeoTitles, 1);
    assert(duplicate.summary.errors > 0);
    await duplicateDb.close();
    assert(RUNNER.validationIssues({ proposedSeoTitle: "x".repeat(161), proposedSeoDescription: "valid" }).includes("SEO title exceeds 160 characters"));
    pass("duplicate detection and technical length limits");

    const rollbackFile = tempFile("rollback.db");
    await fixture(rollbackFile, { firstExisting: false });
    await execSql(rollbackFile, "CREATE TRIGGER fail_mix_seo BEFORE UPDATE OF seo_description ON products WHEN NEW.external_id='MAT-000068' BEGIN SELECT RAISE(ABORT, 'forced rollback'); END");
    const rollbackDb = await RUNNER.openDatabase(rollbackFile, true);
    await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackFile, { only: exact, confirm: RUNNER.CONFIRM, backupDir: path.dirname(rollbackFile) }), /forced rollback/);
    assert.equal((await rollbackDb.get("SELECT seo_title FROM products WHERE external_id='MAT-000067'")).seo_title, null);
    await rollbackDb.close();
    pass("transaction rollback restores prior SEO state");

    console.log("PASS 6 test groups; synthetic SQLite only");
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
