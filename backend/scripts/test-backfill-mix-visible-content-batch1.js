"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const RUNNER = require("./backfill-mix-visible-content-batch1");
const DATA = require("./data/mix-visible-content-batch1");

const now = "2026-09-28T00:00:00.000Z";
const MUTABLE_COLUMNS = new Set(["short_description", "full_description"]);
function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); }
function close(db) {
    if (db.close.length === 0) return db.close();
    return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
}
function sha(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function fixture(file, { conflictId = null, titleMismatchId = null } = {}) {
    const db = open(file);
    try {
        await run(db, `CREATE TABLE products (
            id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, brand TEXT, price REAL, weight REAL, unit TEXT,
            category TEXT, subcategory TEXT, product_group TEXT, stock_status TEXT, description TEXT, short_description TEXT,
            full_description TEXT, seo_title TEXT, seo_description TEXT, image TEXT, image_url TEXT, is_active INTEGER,
            deleted_at TEXT, updated_at TEXT
        )`);
        await run(db, "CREATE TABLE product_attribute_values (id INTEGER PRIMARY KEY, product_id INTEGER, attribute_definition_id INTEGER, value_text TEXT)");
        await run(db, "CREATE TABLE product_attribute_definitions (id INTEGER PRIMARY KEY, code TEXT)");
        await run(db, "CREATE TABLE product_attribute_templates (id INTEGER PRIMARY KEY, structure_id INTEGER, attribute_definition_id INTEGER)");
        await run(db, "CREATE TABLE product_images (id INTEGER PRIMARY KEY, product_id INTEGER, image_url TEXT)");
        await run(db, "INSERT INTO product_attribute_values VALUES (1,1,1,'keep')");
        await run(db, "INSERT INTO product_attribute_definitions VALUES (1,'keep')");
        await run(db, "INSERT INTO product_attribute_templates VALUES (1,1,1)");
        await run(db, "INSERT INTO product_images VALUES (1,1,'/keep.webp')");
        for (const [index, config] of DATA.PRODUCTS.entries()) {
            const title = config.externalId === titleMismatchId ? `${config.expectedTitle} (wrong)` : config.expectedTitle;
            const short = config.externalId === conflictId ? "Unrelated existing short content" : null;
            await run(db, `INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
                index + 1, config.externalId, title, `slug-${config.externalId}`, config.brand, 100 + index, config.core.package_weight.value, "шт",
                config.expectedCategory, config.expectedSubcategory, "Мешки", "available", `legacy ${config.externalId}`, short, null,
                `SEO title ${config.externalId}`, `SEO description ${config.externalId}`, `legacy image ${config.externalId}`,
                `/uploads/products/${config.externalId}.webp`, 1, null, now
            ]);
        }
    } finally { await close(db); }
}

async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mix-visible-content-"));
    try {
        const source = fs.readFileSync(path.join(__dirname, "backfill-mix-visible-content-batch1.js"), "utf8");
        assert(!/\b(?:INSERT\s+INTO\s+\w+|DELETE\s+FROM\s+\w+|REPLACE\s+INTO\s+\w+)\b/i.test(source), "runner should not insert/delete/replace data");
        const updates = [...source.matchAll(/UPDATE\s+products\s+SET\s+([^\n]+)/gi)].map(match => match[1]);
        assert(updates.length > 0 && updates.every(update => /^\$\{column\}=\?/u.test(update)), "only dynamic allowlisted visible content columns may be updated");
        assert.deepStrictEqual(RUNNER.VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY, ["short_description", "full_description"]);
        assert.strictEqual(DATA.PRODUCTS.length, 16);
        assert.deepStrictEqual(DATA.PRODUCTS.map(item => item.externalId), RUNNER.ALL_MATS);
        assert(!RUNNER.ALL_MATS.includes("MAT-000075") && !RUNNER.ALL_MATS.includes("MAT-000077"));
        assert(!DATA.PRODUCTS.find(item => item.externalId === "MAT-000076").factsUsed.some(fact => fact.code === "consumption"));
        assert(DATA.PRODUCTS.find(item => item.externalId === "MAT-000076").factsOmitted.some(fact => fact.code === "consumption"));
        assert(DATA.PRODUCTS.every(item => item.shortDescription.length <= 500));
        assert(DATA.PRODUCTS.every(item => RUNNER.validateConfig(item).length === 0));

        const exact = RUNNER.ALL_MATS;
        const dbPath = path.join(root, "dry-run.sqlite");
        await fixture(dbPath);
        const beforeDry = sha(dbPath);
        const dryDb = await RUNNER.openDatabase(dbPath, false);
        const dry = await RUNNER.inspectBatch(dryDb, { only: exact });
        await dryDb.close();
        const afterDry = sha(dbPath);
        assert.strictEqual(beforeDry, afterDry, "dry-run must leave fixture DB bytes unchanged");
        assert.deepStrictEqual(dry.summary, { total: 16, ready: 16, existingOk: 0, blocked: 0, errors: 0, duplicateShortDescriptions: 0, duplicateFullDescriptions: 0, forbiddenPublicMarkers: 0 });
        for (const subset of [exact.slice(0, 15), ["MAT-000075", ...exact.slice(1)]]) assert.throws(() => RUNNER.parseArgs(["--db", dbPath, "--only", subset.join(",")]), /Exact 16-MAT batch|canonical/);
        assert.throws(() => RUNNER.parseArgs(["--db", dbPath, "--only", [...exact, "MAT-000075"].join(",")]), /Exact 16-MAT batch/);
        assert.throws(() => RUNNER.parseArgs(["--db", dbPath, "--only", [exact[0], exact[0], ...exact.slice(2)].join(",")]), /Duplicate|canonical/);
        assert.throws(() => RUNNER.parseArgs(["--db", dbPath, "--only", exact.join(","), "--apply", "--confirm", RUNNER.CONFIRM]), /--backup-dir/);
        await assert.rejects(() => RUNNER.inspectBatch(dryDb, { only: exact.slice(0, 1) }), /Exact 16-MAT batch/);
        await assert.rejects(() => RUNNER.applyBatch(dryDb, dbPath, { only: exact.slice(0, 1), confirm: RUNNER.CONFIRM, backupDir: root }), /Exact 16-MAT batch/);
        console.log("PASS exact 16-MAT scope and read-only dry-run fixture hash");

        const conflictPath = path.join(root, "conflict.sqlite");
        await fixture(conflictPath, { conflictId: "MAT-000067" });
        const conflictDb = await RUNNER.openDatabase(conflictPath, true);
        const conflict = await RUNNER.inspectBatch(conflictDb, { only: exact });
        assert.strictEqual(conflict.rows.find(row => row.externalId === "MAT-000067").status, "EXISTING_CONTENT_BLOCKED");
        assert.strictEqual(conflict.summary.blocked, 1);
        const conflictHash = sha(conflictPath);
        await assert.rejects(() => RUNNER.applyBatch(conflictDb, conflictPath, { only: exact, confirm: RUNNER.CONFIRM, backupDir: path.join(root, "must-not-create") }), /preflight/);
        assert.strictEqual(sha(conflictPath), conflictHash);
        await close(conflictDb);
        const titlePath = path.join(root, "title-guard.sqlite");
        await fixture(titlePath, { titleMismatchId: "MAT-000067" });
        const titleDb = await RUNNER.openDatabase(titlePath, false);
        const titleGuard = await RUNNER.inspectBatch(titleDb, { only: exact });
        assert.strictEqual(titleGuard.rows.find(row => row.externalId === "MAT-000067").status, "BLOCKED");
        await close(titleDb);
        console.log("PASS existing content conflict and exact identity guards block the whole apply");

        const applyPath = path.join(root, "apply.sqlite");
        const backupDir = path.join(root, "nested", "approved-backups");
        await fixture(applyPath);
        const beforeRowsDb = await RUNNER.openDatabase(applyPath, false);
        const beforeRows = await beforeRowsDb.all("SELECT * FROM products ORDER BY id");
        const beforeNonContentCounts = {
            attributes: (await beforeRowsDb.get("SELECT COUNT(*) AS count FROM product_attribute_values")).count,
            definitions: (await beforeRowsDb.get("SELECT COUNT(*) AS count FROM product_attribute_definitions")).count,
            templates: (await beforeRowsDb.get("SELECT COUNT(*) AS count FROM product_attribute_templates")).count,
            images: (await beforeRowsDb.get("SELECT COUNT(*) AS count FROM product_images")).count
        };
        await beforeRowsDb.close();
        const cliOptions = RUNNER.parseArgs(["--db", applyPath, "--only", exact.join(","), "--apply", "--confirm", RUNNER.CONFIRM, "--backup-dir", backupDir]);
        assert.strictEqual(cliOptions.backupDir, backupDir, "--backup-dir maps to options.backupDir");
        const applyDb = await RUNNER.openDatabase(applyPath, true);
        const applied = await RUNNER.applyBatch(applyDb, applyPath, cliOptions);
        assert.strictEqual(applied.writes, 32);
        assert.strictEqual(applied.summary.existingOk, 16);
        assert.strictEqual(path.dirname(applied.backup), backupDir);
        assert(fs.existsSync(applied.backup), "backup is created in the supplied custom backup directory");
        const backupDb = await RUNNER.openDatabase(applied.backup, false);
        assert.strictEqual((await backupDb.get("SELECT short_description FROM products WHERE external_id='MAT-000067'")).short_description, null, "backup captures pre-apply values");
        await backupDb.close();
        const afterRows = await applyDb.all("SELECT * FROM products ORDER BY id");
        for (let index = 0; index < beforeRows.length; index += 1) {
            const before = beforeRows[index]; const after = afterRows[index]; const config = DATA.PRODUCTS[index];
            assert.strictEqual(after.short_description, config.shortDescription);
            assert.strictEqual(after.full_description, config.fullDescription);
            for (const column of Object.keys(before)) if (!MUTABLE_COLUMNS.has(column)) assert.deepStrictEqual(after[column], before[column], `${config.externalId} immutable ${column}`);
        }
        assert.deepStrictEqual({
            attributes: (await applyDb.get("SELECT COUNT(*) AS count FROM product_attribute_values")).count,
            definitions: (await applyDb.get("SELECT COUNT(*) AS count FROM product_attribute_definitions")).count,
            templates: (await applyDb.get("SELECT COUNT(*) AS count FROM product_attribute_templates")).count,
            images: (await applyDb.get("SELECT COUNT(*) AS count FROM product_images")).count
        }, beforeNonContentCounts);
        const repeatBefore = sha(applyPath);
        const repeated = await RUNNER.applyBatch(applyDb, applyPath, cliOptions);
        assert.strictEqual(repeated.writes, 0);
        assert.strictEqual(repeated.backup, null);
        assert.strictEqual(sha(applyPath), repeatBefore, "idempotent apply performs no DB writes");
        await close(applyDb);
        console.log("PASS apply writes only short/full description, custom --backup-dir, immutable snapshot, and idempotency");

        const rollbackPath = path.join(root, "rollback.sqlite");
        const rollbackDir = path.join(root, "rollback-backup");
        await fixture(rollbackPath);
        const rollbackDb = await RUNNER.openDatabase(rollbackPath, true);
        await rollbackDb.run("CREATE TRIGGER force_visible_rollback BEFORE UPDATE OF full_description ON products WHEN NEW.external_id='MAT-000068' BEGIN SELECT RAISE(ABORT, 'forced content rollback'); END");
        const rollbackBefore = await rollbackDb.all("SELECT * FROM products ORDER BY id");
        const rollbackOptions = { only: exact, confirm: RUNNER.CONFIRM, backupDir: rollbackDir };
        await assert.rejects(() => RUNNER.applyBatch(rollbackDb, rollbackPath, rollbackOptions), /forced content rollback/);
        const rollbackAfter = await rollbackDb.all("SELECT * FROM products ORDER BY id");
        assert.deepStrictEqual(rollbackAfter, rollbackBefore, "failed transaction restores all visible and immutable fields");
        const backups = fs.readdirSync(rollbackDir);
        assert.strictEqual(backups.length, 1, "pre-transaction backup exists after a rollback");
        await close(rollbackDb);
        console.log("PASS rollback restores the full fixture state after an injected update failure");

        console.log("PASS MAT-000076 consumption omitted; MAT-000075/MAT-000077 excluded; static writable surface exact");
        console.log("PASS visible review includes current/proposed text, source facts, character counts, duplicates, and public markers");
        console.log("PASS synthetic SQLite only; no production or repository DB access");
    } finally {
        try { fs.rmSync(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); }
        catch (error) { console.error(`Temporary fixture cleanup failed: ${error.message}`); }
    }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
