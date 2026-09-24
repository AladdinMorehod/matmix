"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { ALL_MATS, CONFIRM, SHARED_PLACEHOLDER, applyBatch, inspectBatch, openDatabase, parseArgs } = require("./cleanup-mix-products-shared-placeholder-batch1");

const tempFile = name => path.join(os.tmpdir(), `matmix-cleanup-${name}-${process.pid}-${Date.now()}.db`);
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); }));
const get = (db, sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));

async function createFixture(file, mode = "legacy") {
  const raw = new sqlite3.Database(file); await run(raw, "PRAGMA foreign_keys=ON");
  await run(raw, "CREATE TABLE products(id INTEGER PRIMARY KEY AUTOINCREMENT,external_id TEXT NOT NULL,title TEXT NOT NULL,image_url TEXT,is_active INTEGER DEFAULT 1,deleted_at TEXT,brand TEXT,price REAL,weight REAL,unit TEXT,stock_status TEXT)");
  await run(raw, "CREATE TABLE product_images(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER NOT NULL,image_url TEXT NOT NULL,alt_text TEXT,sort_order INTEGER NOT NULL DEFAULT 0,is_primary INTEGER NOT NULL DEFAULT 0,created_at TEXT,updated_at TEXT)");
  for (const id of ALL_MATS) {
    const special = id === ALL_MATS[0]; if (mode === "missing" && special) continue; const mixed = mode === "mixed" && special; const real = mode === "real" || (mode === "real-target" && special); const different = mode === "different" || (mode === "different-target" && special);
    const imageUrl = mode === "clean" ? null : real ? "/uploads/products/real.webp" : SHARED_PLACEHOLDER;
    const product = await run(raw, "INSERT INTO products(external_id,title,image_url,is_active,brand,price,weight,unit,stock_status) VALUES(?,?,?,?,?,?,?,?,?)", [id, `Title ${id}`, imageUrl, 1, "Brand", 10, 20, "шт", "in_stock"]);
    if (mode !== "clean" && !mixed) await run(raw, "INSERT INTO product_images(product_id,image_url,sort_order,is_primary) VALUES(?,?,?,?)", [product.id, different ? "/uploads/products/different.webp" : real ? "/uploads/products/real.webp" : SHARED_PLACEHOLDER, 0, 1]);
    if (mode === "gallery" && special) await run(raw, "INSERT INTO product_images(product_id,image_url,sort_order,is_primary) VALUES(?,?,?,?)", [product.id, "/uploads/products/gallery.webp", 1, 0]);
    if (mode === "duplicate" && special) await run(raw, "INSERT INTO product_images(product_id,image_url,sort_order,is_primary) VALUES(?,?,?,?)", [product.id, SHARED_PLACEHOLDER, 1, 1]);
  }
  await run(raw, "INSERT INTO products(external_id,title,image_url,is_active,brand,price,weight,unit,stock_status) VALUES(?,?,?,?,?,?,?,?,?)", ["MAT-OTHER", "Other", SHARED_PLACEHOLDER, 1, "Other", 99, 99, "шт", "in_stock"]);
  await new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve())); return openDatabase(file, true);
}

async function main() {
  let passed = 0; const pass = message => { passed += 1; console.log(`PASS ${message}`); };
  assert.deepEqual(parseArgs(["--db", "fixture.db", "--only", ALL_MATS.join(",")]).only, ALL_MATS); assert.throws(() => parseArgs(["--db", "fixture.db", "--only", ALL_MATS.slice(0, 1).join(",")]), /Exact cleanup batch required/); assert.throws(() => parseArgs(["--db", "fixture.db", "--only", `${ALL_MATS.join(",")},MAT-000091`]), /Exact cleanup batch required/); pass("exact 18-MAT parse guard");
  const eligibleFile = tempFile("eligible"); const eligibleDb = await createFixture(eligibleFile); const eligible = await inspectBatch(eligibleDb, { only: ALL_MATS }); assert.equal(eligible.summary.legacyPlaceholder, 18); assert.equal(eligible.summary.blocked, 0); const beforeOther = (await eligibleDb.all("SELECT * FROM products WHERE external_id=?", ["MAT-OTHER"]))[0]; const applied = await applyBatch(eligibleDb, eligibleFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(eligibleFile) }); assert.equal(applied.writes, 36); assert.equal(applied.summary.alreadyClean, 18); assert.deepEqual((await eligibleDb.all("SELECT * FROM products WHERE external_id=?", ["MAT-OTHER"]))[0], beforeOther); const repeated = await applyBatch(eligibleDb, eligibleFile, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(eligibleFile) }); assert.equal(repeated.writes, 0); assert.equal(repeated.summary.alreadyClean, 18); await eligibleDb.close(); pass("legacy cleanup apply and idempotent repeat");
  for (const [name, mode, blocked] of [["real image", "real-target", 1], ["second gallery row", "gallery", 1], ["duplicate primary row", "duplicate", 1], ["mixed state", "mixed", 1], ["missing product", "missing", 1]]) { const file = tempFile(name.replace(/ /g, "-")); const db = await createFixture(file, mode); const report = await inspectBatch(db, { only: ALL_MATS }); assert.equal(report.summary.blocked, blocked); const before = sha(file); await assert.rejects(() => applyBatch(db, file, { only: ALL_MATS, confirm: CONFIRM, backupDir: path.dirname(file) }), /Apply blocked/); assert.equal(sha(file), before); await db.close(); pass(`${name} blocks whole batch without writes`); }
  const differentFile = tempFile("different-url"); const differentDb = await createFixture(differentFile, "different"); const different = await inspectBatch(differentDb, { only: ALL_MATS }); assert.equal(different.summary.blocked, 18); await differentDb.close(); pass("different image URL blocks all targets");
  console.log(`PASS ${passed} test groups`);
}
main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
