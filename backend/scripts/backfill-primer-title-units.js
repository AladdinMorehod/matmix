"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/primers-title-units");

const CONFIRM = "BACKFILL_PRIMER_TITLE_UNITS";
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["title"]);
const ALLOWLIST = new Set(DATA.TARGET_MATS);
const normalizeStructure = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase("ru-RU");

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

function parseArgs(args) {
  const out = { apply: false }; const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("="); if (seen.has(key)) throw new Error(`Duplicate option: ${key}`); seen.add(key);
    if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); if (key === "--apply") out.apply = true; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`); out[key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only === undefined) throw new Error("Explicit --only is required");
  out.only = [...new Set(out.only.split(",").map(v => v.trim().toUpperCase()).filter(Boolean))]; if (!out.only.length) throw new Error("Nonempty --only is required");
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  return out;
}

async function inspectBatch(db, only = DATA.TARGET_MATS) {
  const rows = [];
  for (const externalId of only) {
    const config = DATA.PRODUCTS.find(item => item.externalId === externalId);
    if (!config || !ALLOWLIST.has(externalId)) { rows.push({ externalId, status: "ERROR", reason: "MAT is outside exact title-unit allowlist." }); continue; }
    const product = await db.get("SELECT id,external_id,title,slug,category,subcategory FROM products WHERE external_id=?", [externalId]);
    if (!product || product.external_id !== externalId) { rows.push({ externalId, status: "ERROR", reason: "Exact external_id not found." }); continue; }
    if (product.category === null || product.subcategory === null || normalizeStructure(product.category) !== normalizeStructure(DATA.EXPECTED_CATEGORY) || normalizeStructure(product.subcategory) !== normalizeStructure(DATA.EXPECTED_SUBCATEGORY)) {
      rows.push({ externalId, currentTitle: product.title, status: "TITLE_GUARD_BLOCKED", reason: "Normalized category/subcategory guard mismatch." }); continue;
    }
    let status = "TITLE_CONFLICT"; let reason = `Unexpected current title: ${product.title}`;
    if (product.title === config.oldTitle) { status = "WILL_FIX"; reason = "Exact old title matched."; }
    else if (product.title === config.newTitle) { status = "EXISTING_OK"; reason = "Exact new title already present."; }
    rows.push({ externalId, productId: product.id, currentTitle: product.title, oldTitle: config.oldTitle, newTitle: config.newTitle, slug: product.slug, category: product.category, subcategory: product.subcategory, officialName: config.officialName, package: config.package, sourceKeys: config.sourceKeys, status, reason });
  }
  const summary = { total: rows.length, willFix: rows.filter(r => r.status === "WILL_FIX").length, existingOk: rows.filter(r => r.status === "EXISTING_OK").length, titleConflict: rows.filter(r => r.status === "TITLE_CONFLICT").length, titleGuardBlocked: rows.filter(r => r.status === "TITLE_GUARD_BLOCKED").length, errors: rows.filter(r => r.status === "ERROR").length };
  return { mode: "dry-run", rows, summary, writableSurface: { products: PRODUCT_MUTABLE_FIELDS_EXACTLY, forbidden: ["slug", "brand", "attributes", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "category", "subcategory", "stock", "image", "image_url", "any image table"] }, sources: DATA.SOURCES };
}

async function backupDatabase(dbPath, backupDir) {
  const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `matmix-before-primer-title-units-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function applyBatch(db, dbPath, options) {
  const preflight = await inspectBatch(db, options.only);
  if (preflight.summary.errors || preflight.summary.titleGuardBlocked || preflight.summary.titleConflict) throw new Error("Apply blocked by title/external_id/category guard.");
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    for (const row of preflight.rows.filter(r => r.status === "WILL_FIX")) { await db.run("UPDATE products SET title=? WHERE id=? AND external_id=? AND title=?", [row.newTitle, row.productId, row.externalId, row.oldTitle]); writes += 1; }
    const post = await inspectBatch(db, options.only);
    if (post.summary.errors || post.summary.titleGuardBlocked || post.summary.titleConflict || post.summary.willFix) throw new Error("Postcheck failed; rollback required.");
    await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function renderReview(report) { return [`# Primer title/unit corrective review`, ``, `Mode: ${report.mode}; title-only, dry-run by default.`, ``, `- Mutable field: \`products.title\` only.`, `- Slug is preserved; product routes use external_id.`, `- Exact title and external_id guards are mandatory; normalized category/subcategory guards ignore only case and repeated whitespace.`, ``, `## Summary`, ``, "```json", JSON.stringify(report.summary, null, 2), "```", ``, `| MAT | current | proposed | status | source |`, `|---|---|---|---|---|`, ...report.rows.map(r => `| ${r.externalId} | ${r.currentTitle || "—"} | ${r.newTitle || "—"} | ${r.status} | ${(r.sourceKeys || []).join(", ")} |`), ``, `## Source registry`, ``, ...Object.entries(report.sources || {}).map(([key, source]) => `- **${key}**: [${source.title}](${source.url}) — ${source.evidence}`), ``].join("\n"); }

async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options.only); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors || report.summary.titleGuardBlocked || report.summary.titleConflict) process.exitCode = 1; } finally { await db.close(); } }

module.exports = { CONFIRM, PRODUCT_MUTABLE_FIELDS_EXACTLY, ALLOWLIST, DATA, parseArgs, openDatabase, inspectBatch, applyBatch, renderReview, normalizeStructure };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
