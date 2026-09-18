"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/primers-product-weights");

const normalizeOnly = values => [...new Set(values.map(value => String(value).trim()).filter(Boolean))];

function parseArgs(args) {
  const out = { apply: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("=");
    if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
    seen.add(key);
    if (key === "--apply" || key === "--dry-run") {
      if (tail.length) throw new Error(`Unexpected value: ${key}`);
      if (key === "--apply") out.apply = true;
      continue;
    }
    if (!["--db", "--only", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
    out[key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only === undefined) throw new Error("Explicit --only is required");
  out.only = normalizeOnly(out.only.split(","));
  if (out.only.length !== DATA.TARGET_IDS.length || out.only.some((id, index) => id !== DATA.TARGET_IDS[index])) {
    throw new Error(`--only must be exactly ${DATA.TARGET_IDS.join(",")}`);
  }
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== DATA.CONFIRM) throw new Error(`Apply requires --confirm ${DATA.CONFIRM}`);
  return out;
}

function openDatabase(file, writable = false) {
  const resolved = path.resolve(file);
  const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(resolved, mode, error => {
      if (error) return reject(error);
      const db = {
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : res(row))); },
        close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
      };
      db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
    });
  });
}

function planStatus(product, config) {
  if (!product) return { status: "ERROR", reason: "Product not found." };
  if (product.title !== config.expectedTitle) return { status: "TITLE_GUARD_BLOCKED", reason: "Exact title mismatch." };
  if (product.unit !== config.expectedUnit) return { status: "UNIT_CONFLICT", reason: `Expected unit ${config.expectedUnit}, got ${product.unit || "empty"}.` };
  if (Number(product.weight) === config.oldWeight) return { status: "WILL_FIX", reason: "Legacy operational weight matches guarded old value." };
  if (Number(product.weight) === config.newWeight) return { status: "EXISTING_OK", reason: "Target operational weight is already present." };
  return { status: "WEIGHT_CONFLICT", reason: `Expected weight ${config.oldWeight} or ${config.newWeight}, got ${product.weight}.` };
}

async function inspectBatch(db) {
  const rows = [];
  for (const config of DATA.PRODUCTS) {
    const product = await db.get("SELECT id,external_id,title,weight,unit FROM products WHERE external_id=?", [config.externalId]);
    const planned = planStatus(product, config);
    rows.push({ externalId: config.externalId, productId: product?.id || null, title: product?.title || null, currentWeight: product?.weight ?? null, unit: product?.unit ?? null, oldWeight: config.oldWeight, newWeight: config.newWeight, status: planned.status, reason: planned.reason, sourceUrl: config.sourceUrl });
  }
  const summary = {
    total: rows.length,
    willFix: rows.filter(row => row.status === "WILL_FIX").length,
    existingOk: rows.filter(row => row.status === "EXISTING_OK").length,
    weightConflict: rows.filter(row => row.status === "WEIGHT_CONFLICT").length,
    unitConflict: rows.filter(row => row.status === "UNIT_CONFLICT").length,
    titleGuardBlocked: rows.filter(row => row.status === "TITLE_GUARD_BLOCKED").length,
    errors: rows.filter(row => row.status === "ERROR").length
  };
  summary.blockers = summary.weightConflict + summary.unitConflict + summary.titleGuardBlocked + summary.errors;
  return { mode: "dry-run", rows, summary, writableSurface: ["products.weight"] };
}

async function backupDatabase(dbPath, backupDir) {
  const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups"));
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `matmix-before-primer-product-weights-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
  fs.copyFileSync(path.resolve(dbPath), target);
  return target;
}

async function applyBatch(db, dbPath, options) {
  if (options.confirm !== DATA.CONFIRM) throw new Error(`Apply requires --confirm ${DATA.CONFIRM}`);
  const preflight = await inspectBatch(db);
  if (preflight.summary.blockers) throw new Error("Apply blocked by guarded conflict/status");
  const backup = await backupDatabase(dbPath, options.backupDir);
  await db.run("BEGIN IMMEDIATE");
  let writes = 0;
  try {
    for (const row of preflight.rows.filter(item => item.status === "WILL_FIX")) {
      const result = await db.run("UPDATE products SET weight=? WHERE id=? AND external_id=? AND weight=? AND unit=?", [row.newWeight, row.productId, row.externalId, row.oldWeight, row.unit]);
      if (result.changes !== 1) throw new Error(`Guarded update did not affect exactly one row: ${row.externalId}`);
      writes += 1;
    }
    const post = await inspectBatch(db);
    if (post.summary.blockers || post.summary.existingOk !== DATA.TARGET_IDS.length || post.summary.willFix !== 0) throw new Error("Postcheck failed: target weights are not stable");
    await db.run("COMMIT");
    return { ...post, mode: "apply", writes, backup };
  } catch (error) {
    try { await db.run("ROLLBACK"); } catch {}
    throw error;
  }
}

function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = await openDatabase(options.db, options.apply);
  try {
    const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await db.close();
  }
}

module.exports = { DATA, CONFIRM: DATA.CONFIRM, parseArgs, openDatabase, inspectBatch, applyBatch, sha256 };

if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
