"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ALL_MATS, CONFIRM, PRODUCTS, applyBatch, inspectBatch, openDatabase, parseArgs } = require("./normalize-masonry-mixes-titles-batch1");

const tempFile = () => path.join(os.tmpdir(), `matmix-masonry-title-${process.pid}-${Date.now()}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));

async function fixture(file) {
  const raw = new sqlite3.Database(file); await run(raw, "CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT NOT NULL,title TEXT NOT NULL,slug TEXT,price REAL,weight REAL,unit TEXT,brand TEXT)");
  for (const item of PRODUCTS) await run(raw, "INSERT INTO products(external_id,title,slug,price,weight,unit,brand) VALUES(?,?,?,?,?,?,?)", [item.externalId, item.currentTitle, `slug-${item.externalId}`, 10, 40, "шт", "brand"]);
  await run(raw, "INSERT INTO products(external_id,title,slug,price,weight,unit,brand) VALUES(?,?,?,?,?,?,?)", ["MAT-OTHER", "Other", "other", 12, 1, "шт", "other"]);
  await new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve()));
  return openDatabase(file, true);
}

async function main() {
  assert.deepEqual(parseArgs(["--db", "fixture.db", "--only", ALL_MATS.join(",")]).only, ALL_MATS);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", ALL_MATS.slice(0, 2).join(",")]), /Exact title batch required/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS.join(",")},MAT-000070`]), /Exact title batch required/);
  assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS[0]},${ALL_MATS[0]},${ALL_MATS[1]}`]), /Exact title batch required/);
  const file = tempFile(); const db = await fixture(file); const before = sha(file); const dry = await inspectBatch(db, { only: ALL_MATS });
  assert.equal(dry.summary.willFix, 3); assert.equal(dry.summary.titleGuardBlocked, 0); assert.equal(sha(file), before);
  const applied = await applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(applied.writes, 3); assert.equal(applied.summary.existingOk, 3);
  const other = (await db.all("SELECT * FROM products WHERE external_id=?", ["MAT-OTHER"]))[0]; assert.equal(other.title, "Other");
  const repeated = await applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }); assert.equal(repeated.writes, 0); assert.equal(repeated.summary.existingOk, 3);
  await db.run("UPDATE products SET title=? WHERE external_id=?", ["Unexpected title", ALL_MATS[0]]); const blocked = await inspectBatch(db, { only: ALL_MATS }); assert.equal(blocked.summary.titleGuardBlocked, 1); await assert.rejects(() => applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }), /title guard/); await db.close();
  const rollbackFile = tempFile(); const rollbackDb = await fixture(rollbackFile); await rollbackDb.run("CREATE TRIGGER fail_second_title BEFORE UPDATE OF title ON products WHEN OLD.external_id='MAT-000068' BEGIN SELECT RAISE(ABORT, 'forced title failure'); END;"); await assert.rejects(() => applyBatch(rollbackDb, rollbackFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(rollbackFile) }), /forced title failure/); const rolledBack = (await rollbackDb.all("SELECT title FROM products WHERE external_id=?", [ALL_MATS[0]]))[0]; assert.equal(rolledBack.title, PRODUCTS[0].currentTitle); await rollbackDb.close();
  console.log("PASS exact title parse guard"); console.log("PASS dry-run is read-only"); console.log("PASS guarded apply changes only three titles"); console.log("PASS repeat apply is idempotent"); console.log("PASS mismatch blocks apply and unrelated product is unchanged"); console.log("PASS rollback restores earlier title after later write failure"); console.log("PASS 6 test groups");
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
