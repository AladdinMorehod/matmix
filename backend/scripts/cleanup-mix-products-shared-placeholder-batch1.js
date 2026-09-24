"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const CONFIRM = "CLEANUP_MIX_PRODUCTS_SHARED_PLACEHOLDER_BATCH1";
const SHARED_PLACEHOLDER = "/uploads/products/MAT-000001-20260714153714969-3fb7fe.png";
const ALL_MATS = Object.freeze([
  "MAT-000067", "MAT-000068", "MAT-000069", "MAT-000075", "MAT-000076", "MAT-000077",
  "MAT-000078", "MAT-000079", "MAT-000080", "MAT-000081", "MAT-000082", "MAT-000083",
  "MAT-000084", "MAT-000085", "MAT-000086", "MAT-000087", "MAT-000089", "MAT-000090"
]);

function openDatabase(file, writable = false) {
  if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
  const resolved = path.resolve(file);
  const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(resolved, mode, error => {
      if (error) return reject(error);
      const db = {
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : res(row))); },
        all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (e, rows) => e ? rej(e) : res(rows))); },
        close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
      };
      db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
    });
  });
}

function assertExactBatch(values) {
  const normalized = values.map(value => String(value).trim());
  if (normalized.length !== ALL_MATS.length || normalized.some((value, index) => value !== ALL_MATS[index])) throw new Error(`Exact cleanup batch required: ${ALL_MATS.join(",")}`);
  return normalized;
}

function parseArgs(args) {
  const out = { apply: false }; const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("=");
    if (seen.has(key)) throw new Error(`Duplicate option: ${key}`); seen.add(key);
    if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); out.apply = key === "--apply"; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
    out[key === "--backup-dir" ? "backupDir" : key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (!out.only) throw new Error("Explicit --only is required");
  out.only = assertExactBatch(out.only.split(","));
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  return out;
}

async function loadState(db, externalId) {
  const products = await db.all("SELECT id,external_id,image_url,is_active,deleted_at FROM products WHERE external_id=?", [externalId]);
  if (products.length !== 1) return { products, imageRows: [] };
  const imageRows = await db.all("SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order,id", [products[0].id]);
  return { products, imageRows };
}

function classify(state) {
  if (state.products.length !== 1) return { status: "BLOCKED", reason: `Expected one active product, found ${state.products.length}.` };
  const product = state.products[0];
  if (Number(product.is_active) !== 1 || product.deleted_at) return { status: "BLOCKED", reason: "Product is inactive or deleted." };
  const productUrl = String(product.image_url || "").trim();
  if (!productUrl && state.imageRows.length === 0) return { status: "ALREADY_CLEAN", productId: product.id, imageRowId: null };
  if (productUrl === SHARED_PLACEHOLDER && state.imageRows.length === 1) {
    const image = state.imageRows[0];
    if (String(image.image_url || "").trim() === SHARED_PLACEHOLDER && Number(image.is_primary) === 1) return { status: "LEGACY_PLACEHOLDER", productId: product.id, imageRowId: image.id };
  }
  return { status: "BLOCKED", productId: product.id, reason: "Unexpected image state: requires exact shared placeholder in both locations, one primary row, or an already-clean product." };
}

async function inspectBatch(db, { only } = {}) {
  const selected = assertExactBatch(only || []); const rows = [];
  for (const externalId of selected) {
    try {
      const state = await loadState(db, externalId); const result = classify(state);
      rows.push({ externalId, productId: result.productId || state.products[0]?.id || null, imageRowId: result.imageRowId || null, imageUrl: state.products[0]?.image_url || null, productImagesCount: state.imageRows.length, status: result.status, reason: result.reason || null });
    } catch (error) { rows.push({ externalId, status: "ERROR", reason: error.message }); }
  }
  return { mode: "dry-run", rows, summary: { total: rows.length, legacyPlaceholder: rows.filter(row => row.status === "LEGACY_PLACEHOLDER").length, alreadyClean: rows.filter(row => row.status === "ALREADY_CLEAN").length, blocked: rows.filter(row => row.status === "BLOCKED").length, errors: rows.filter(row => row.status === "ERROR").length, writes: 0 } };
}

async function backupDatabase(dbPath, backupDir) {
  const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `matmix-before-mix-products-placeholder-cleanup-${Date.now()}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function applyBatch(db, dbPath, options) {
  const preflight = await inspectBatch(db, { only: options.only });
  if (preflight.summary.blocked || preflight.summary.errors) throw new Error("Apply blocked: every target must be LEGACY_PLACEHOLDER or ALREADY_CLEAN");
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    for (const row of preflight.rows.filter(item => item.status === "LEGACY_PLACEHOLDER")) {
      const deleted = await db.run("DELETE FROM product_images WHERE id=? AND product_id=? AND image_url=? AND is_primary=1", [row.imageRowId, row.productId, SHARED_PLACEHOLDER]);
      if (deleted.changes !== 1) throw new Error(`Placeholder image delete guard failed: ${row.externalId}`); writes += 1;
      const cleared = await db.run("UPDATE products SET image_url=NULL WHERE id=? AND external_id=? AND image_url=?", [row.productId, row.externalId, SHARED_PLACEHOLDER]);
      if (cleared.changes !== 1) throw new Error(`Placeholder product cleanup guard failed: ${row.externalId}`); writes += 1;
    }
    const post = await inspectBatch(db, { only: options.only });
    if (post.summary.blocked || post.summary.errors || post.summary.legacyPlaceholder) throw new Error("Postcheck failed: cleanup is not stable");
    await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

async function main() {
  const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply);
  try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary, ...(report.backup ? { backup: report.backup, writes: report.writes } : {}) })); if (report.summary.blocked || report.summary.errors) process.exitCode = 1; }
  finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, SHARED_PLACEHOLDER, applyBatch, assertExactBatch, inspectBatch, openDatabase, parseArgs };
if (require.main === module) main().catch(error => { console.error(`PLACEHOLDER CLEANUP ABORTED: ${error.message}`); process.exitCode = 1; });
