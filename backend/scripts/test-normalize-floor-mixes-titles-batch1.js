"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/floor-mixes-core-batch1");
const { ALL_MATS, CONFIRM, applyBatch, inspectBatch, openDatabase, parseArgs } = require("./normalize-floor-mixes-titles-batch1");

const tempFile = label => path.join(os.tmpdir(), `matmix-floor-title-${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const closeRaw = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));

async function fixture(file) {
  const raw = new sqlite3.Database(file); await run(raw, "CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT NOT NULL,title TEXT NOT NULL,slug TEXT,price REAL,weight REAL,unit TEXT,brand TEXT,category TEXT,subcategory TEXT,image_url TEXT)");
  for (const item of DATA.PRODUCTS.filter(product => itemIdentity(product))) await run(raw, "INSERT INTO products(external_id,title,slug,price,weight,unit,brand,category,subcategory,image_url) VALUES(?,?,?,?,?,?,?,?,?,?)", [item.externalId, item.expectedTitle, `slug-${item.externalId}`, 10, 20, "шт", "brand", "Смеси", item.expectedSubcategory, DATA.SHARED_PLACEHOLDER]);
  await run(raw, "INSERT INTO products(external_id,title,slug,price,weight,unit,brand,category,subcategory,image_url) VALUES(?,?,?,?,?,?,?,?,?,?)", ["MAT-OTHER", "Other", "other", 12, 1, "шт", "other", "Other", "Other", "other"]);
  await closeRaw(raw); return openDatabase(file, true);
}
function itemIdentity(product) { return product.identityStatus === "READY_FOR_CORE_REVIEW"; }
async function main() {
  let passed = 0; const pass = message => { passed += 1; console.log(`PASS ${message}`); };
  assert.deepEqual(parseArgs(["--db", "fixture.db", "--only", ALL_MATS.join(",")]).only, ALL_MATS); assert.throws(() => parseArgs(["--db", "fixture.db", "--only", ALL_MATS.slice(0, 1).join(",")]), /Exact title batch required/); assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS.join(",")},MAT-000090`]), /Exact title batch required/); pass("exact ready-title batch guard");
  const file = tempFile("apply"); const db = await fixture(file); const before = sha(file); const dry = await inspectBatch(db, { only: ALL_MATS }); assert.equal(dry.summary.total, 12); assert.equal(dry.summary.willFix, 12); assert.equal(dry.summary.titleGuardBlocked, 0); assert.equal(sha(file), before); const applied = await applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(applied.writes, 12); assert.equal(applied.summary.existingOk, 12); const repeated = await applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(repeated.writes, 0); assert.equal(repeated.summary.existingOk, 12); pass("guarded title apply is idempotent and dry-run is read-only");
  await db.run("UPDATE products SET title=? WHERE external_id=?", ["Unexpected", ALL_MATS[0]]); const blocked = await inspectBatch(db, { only: ALL_MATS }); assert.equal(blocked.summary.titleGuardBlocked, 1); await assert.rejects(() => applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }), /title guard/); await db.close(); pass("unexpected current title blocks apply");
  const rollbackFile = tempFile("rollback"); const rollbackDb = await fixture(rollbackFile); await rollbackDb.run("CREATE TRIGGER fail_second_title BEFORE UPDATE OF title ON products WHEN OLD.external_id=? BEGIN SELECT RAISE(ABORT, 'forced floor title failure'); END;", [ALL_MATS[1]]).catch(() => {});
  // SQLite does not parameterize trigger DDL; recreate with the exact guarded MAT when needed.
  await rollbackDb.run("DROP TRIGGER IF EXISTS fail_second_title"); await rollbackDb.run(`CREATE TRIGGER fail_second_title BEFORE UPDATE OF title ON products WHEN OLD.external_id='${ALL_MATS[1]}' BEGIN SELECT RAISE(ABORT, 'forced floor title failure'); END;`); await assert.rejects(() => applyBatch(rollbackDb, rollbackFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /forced floor title failure/); assert.equal((await rollbackDb.all("SELECT title FROM products WHERE external_id=?", [ALL_MATS[0]]))[0].title, DATA.PRODUCTS.find(item => item.externalId === ALL_MATS[0]).expectedTitle); await rollbackDb.close(); pass("title transaction rollback restores earlier updates");
  console.log(`PASS ${passed} test groups`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
