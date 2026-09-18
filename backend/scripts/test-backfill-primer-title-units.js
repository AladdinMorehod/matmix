"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { DATA, CONFIRM, PRODUCT_MUTABLE_FIELDS_EXACTLY, inspectBatch, applyBatch, parseArgs, openDatabase, normalizeStructure } = require("./backfill-primer-title-units");

const tempDb = path.join(os.tmpdir(), `matmix-primer-title-units-${process.pid}.db`);
const tempBackup = path.join(os.tmpdir(), `matmix-primer-title-units-backups-${process.pid}`);
const runRaw = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes }); }));
const allRaw = (db, sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));

async function createDb(rows) {
  try { fs.rmSync(tempDb, { force: true }); fs.rmSync(tempBackup, { recursive: true, force: true }); } catch {}
  const db = new sqlite3.Database(tempDb);
  await runRaw(db, "CREATE TABLE products (id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, category TEXT, subcategory TEXT)");
  for (const row of rows) await runRaw(db, "INSERT INTO products(id,external_id,title,slug,category,subcategory) VALUES(?,?,?,?,?,?)", row);
  await new Promise(resolve => db.close(() => resolve()));
}

async function hashDb() { return require("crypto").createHash("sha256").update(fs.readFileSync(tempDb)).digest("hex"); }
async function open() { return openDatabase(tempDb, true); }

async function main() {
  assert.deepStrictEqual(PRODUCT_MUTABLE_FIELDS_EXACTLY, ["title"]);
  assert.strictEqual(normalizeStructure(" ГРУНТ /  БЕТОНКОНТАКТ "), normalizeStructure("Грунт / БетонКонтакт"));
  assert.strictEqual(parseArgs(["--db", tempDb, "--only", "MAT-000227"]).apply, false);
  assert.throws(() => parseArgs(["--db", tempDb, "--only", "MAT-000227", "--apply"]), /BACKFILL_PRIMER_TITLE_UNITS/);
  assert.strictEqual(parseArgs(["--db", tempDb, "--only", "MAT-000227", "--apply", "--confirm", CONFIRM]).apply, true);

  await createDb(DATA.PRODUCTS.map((p, i) => [i + 1, p.externalId, p.oldTitle, `stable-${i}`, i === 0 ? " ГРУНТ /  БЕТОНКОНТАКТ " : DATA.EXPECTED_CATEGORY, DATA.EXPECTED_SUBCATEGORY]));
  const before = await hashDb();
  const db = await open();
  const dry = await inspectBatch(db, DATA.TARGET_MATS);
  assert.strictEqual(dry.summary.total, 6);
  assert.strictEqual(dry.summary.willFix, 6);
  assert.strictEqual(dry.summary.titleConflict, 0);
  assert.strictEqual(dry.summary.titleGuardBlocked, 0);
  assert.strictEqual(await hashDb(), before);
  await db.close();

  await createDb([[1, DATA.PRODUCTS[0].externalId, DATA.PRODUCTS[0].newTitle, "stable", DATA.EXPECTED_CATEGORY, DATA.EXPECTED_SUBCATEGORY]]);
  let db2 = await open(); let idempotent = await inspectBatch(db2, [DATA.PRODUCTS[0].externalId]); assert.strictEqual(idempotent.rows[0].status, "EXISTING_OK"); await db2.close();
  await createDb([[1, DATA.PRODUCTS[0].externalId, "Другой title", "stable", DATA.EXPECTED_CATEGORY, DATA.EXPECTED_SUBCATEGORY]]);
  db2 = await open(); let conflict = await inspectBatch(db2, [DATA.PRODUCTS[0].externalId]); assert.strictEqual(conflict.rows[0].status, "TITLE_CONFLICT"); await db2.close();
  await createDb([[1, DATA.PRODUCTS[0].externalId, DATA.PRODUCTS[0].oldTitle, "stable", "Другая категория", DATA.EXPECTED_SUBCATEGORY]]);
  db2 = await open(); let blocked = await inspectBatch(db2, [DATA.PRODUCTS[0].externalId]); assert.strictEqual(blocked.rows[0].status, "TITLE_GUARD_BLOCKED"); await db2.close();

  await createDb([[1, DATA.PRODUCTS[0].externalId, DATA.PRODUCTS[0].oldTitle, "stable", DATA.EXPECTED_CATEGORY, DATA.EXPECTED_SUBCATEGORY]]);
  db2 = await open(); const applied = await applyBatch(db2, tempDb, { only: [DATA.PRODUCTS[0].externalId], confirm: CONFIRM, backupDir: tempBackup }); assert.strictEqual(applied.rows[0].status, "EXISTING_OK"); assert.strictEqual(applied.writes, 1); await db2.close();

  await createDb([[1, DATA.PRODUCTS[0].externalId, DATA.PRODUCTS[0].oldTitle, "stable", DATA.EXPECTED_CATEGORY, DATA.EXPECTED_SUBCATEGORY]]);
  const raw = new sqlite3.Database(tempDb); await runRaw(raw, "CREATE TRIGGER fail_title BEFORE UPDATE OF title ON products BEGIN SELECT RAISE(ABORT, 'forced rollback'); END"); await new Promise(resolve => raw.close(() => resolve()));
  db2 = await open(); await assert.rejects(() => applyBatch(db2, tempDb, { only: [DATA.PRODUCTS[0].externalId], confirm: CONFIRM, backupDir: tempBackup }), /forced rollback/); await db2.close();
  const check = new sqlite3.Database(tempDb); const rows = await allRaw(check, "SELECT title FROM products"); await new Promise(resolve => check.close(() => resolve())); assert.strictEqual(rows[0].title, DATA.PRODUCTS[0].oldTitle);

  assert.strictEqual(DATA.TARGET_MATS.length, 6);
  console.log("PASS: title allowlist, exact guards, normalized structure, dry-run immutability, title-only apply, rollback, idempotency");
}

main().finally(() => { try { fs.rmSync(tempDb, { force: true }); fs.rmSync(tempBackup, { recursive: true, force: true }); } catch {} }).catch(error => { console.error(error); process.exitCode = 1; });
