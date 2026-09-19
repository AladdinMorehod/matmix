"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/betoncontact-core-batch1");

const CONFIRM = "BACKFILL_BETONCONTACT_CORE_BATCH1";
const ALL_MATS = Object.freeze(DATA.PRODUCTS.map(p => p.externalId));
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze([]);
const DEFINITION_CATALOG = Object.freeze({ ...DATA.REUSABLE_DEFINITIONS, ...Object.fromEntries(DATA.NEW_DEFINITIONS.map(d => [d.code, d])) });
const MASS_LABELS = new Set(["вес", "масса", "вес упаковки", "масса упаковки", "фасовка"]);
const normalize = value => String(value ?? "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const structure = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase("ru-RU");
const compact = value => normalize(value).replace(/[^\p{L}\p{N}.]+/gu, "");
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const valueOf = row => row?.value_text ?? row?.value_number ?? row?.value_boolean ?? null;
const isPlaceholder = value => /NEEDS_SOURCE|UNKNOWN/i.test(String(value ?? ""));

function openDatabase(file, writable = false) {
  if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
  const resolved = path.resolve(file); const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
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
  out.only = out.only.split(",").map(v => v.trim()).filter(Boolean); if (!out.only.length) throw new Error("Nonempty --only is required");
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  return out;
}

function expectedDefinition(code) { return DEFINITION_CATALOG[code]; }
function semantic(definition) {
  if (!definition) return null;
  if (definition.code === "package_weight" || MASS_LABELS.has(normalize(definition.label))) return "package_weight";
  if (DEFINITION_CATALOG[definition.code]) return definition.code;
  const found = Object.entries(DEFINITION_CATALOG).find(([, d]) => normalize(d.label) === normalize(definition.label)); return found ? found[0] : null;
}
function findDefinition(definitions, code) { const matches = definitions.filter(d => d.code === code || semantic(d) === code); if (matches.length > 1) throw new Error(`Duplicate semantic definition: ${code}`); return matches[0] || null; }
function compatible(definition, code) { const expected = expectedDefinition(code); return Boolean(definition && expected && definition.data_type === expected.dataType && (definition.default_unit || null) === (expected.defaultUnit || null) && Number(definition.is_active) === 1); }
function sameValue(row, proposal, definition) {
  if (!row) return false; const type = definition?.data_type || expectedDefinition(proposal.code)?.dataType;
  if (type === "number") return Number(row.value_number) === Number(proposal.value);
  if (type === "boolean") return Boolean(Number(row.value_boolean)) === Boolean(proposal.value);
  return compact(valueOf(row)) === compact(proposal.value);
}
async function state(db, config) {
  const product = await db.get("SELECT * FROM products WHERE external_id=?", [config.externalId]);
  if (!product) return { missing: true, product: null, values: [], definitions: [] };
  const values = await db.all("SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id", [product.id]);
  const definitions = await db.all("SELECT * FROM product_attribute_definitions", []); return { product, values, definitions };
}
function guard(product, config) {
  if (!product || Number(product.is_active) !== 1 || product.deleted_at) return { status: "ERROR", reason: "Product is missing, inactive, or deleted." };
  if (product.title !== config.expectedTitle) return { status: "TITLE_GUARD_BLOCKED", reason: `Exact title mismatch: expected «${config.expectedTitle}», got «${product.title}».` };
  if (structure(product.category) !== structure(config.expectedCategory) || structure(product.subcategory) !== structure(config.expectedSubcategory)) return { status: "TITLE_GUARD_BLOCKED", reason: `Category guard mismatch: expected ${config.expectedCategory} / ${config.expectedSubcategory}, got ${product.category} / ${product.subcategory}.` };
  return { status: "OK" };
}
function existingBySemantic(values, code) { const matches = values.filter(v => semantic(v) === code || v.code === code); if (matches.length > 1) throw new Error(`Duplicate semantic value: ${code}`); return matches[0] || null; }
function planItem(code, proposal, definitions, existing) {
  const def = findDefinition(definitions, code); const sourceStatus = proposal?.status || "NEEDS_SOURCE";
  const item = { code, sourceStatus, value: proposal?.value ?? null, currentValue: valueOf(existing), currentId: existing?.id || null, definitionId: def?.id || null, definitionType: def?.data_type || null, sources: proposal?.sources || [], reason: proposal?.reason || null };
  if (sourceStatus === "READY" && def && !compatible(def, code)) { item.status = "SCHEMA_BLOCKED"; item.reason = `Existing definition incompatible with ${expectedDefinition(code).dataType}/${expectedDefinition(code).defaultUnit || "no unit"}.`; return item; }
  if (sourceStatus === "READY") { if (existing && sameValue(existing, item, def)) item.status = "EXISTING_OK"; else if (existing) { item.status = "VALUE_CONFLICT"; item.reason = "Existing non-empty value differs; silent overwrite is forbidden."; } else item.status = "WILL_ADD"; return item; }
  item.status = existing && nonempty(valueOf(existing)) ? "VALUE_CONFLICT" : sourceStatus; if (item.status === "VALUE_CONFLICT") item.reason = "A non-empty value exists while the source proposal is unresolved."; return item;
}
async function planProduct(db, config) {
  const current = await state(db, config); if (current.missing) return { externalId: config.externalId, status: "ERROR", error: "Product not found." };
  const g = guard(current.product, config); const row = { externalId: config.externalId, title: current.product.title, productId: current.product.id, category: current.product.category, subcategory: current.product.subcategory, identityStatus: config.identityStatus, titleStatus: config.titleStatus, sourceKeys: config.sourceKeys, current: { brand: current.product.brand, weight: current.product.weight, unit: current.product.unit, price: current.product.price, description: current.product.full_description || current.product.description || null, seoTitle: current.product.seo_title, imageUrl: current.product.image_url, specsCount: current.values.length }, specs: [], notStored: ["products.brand", "title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "unit", "category", "subcategory", "image", "image_url", "stock_status", "all image tables"] };
  if (g.status !== "OK") { row.status = g.status; row.guardReason = g.reason; row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: 0, willFix: 0, existingOk: 0, needsSource: 0, absentByDesign: 0, schemaBlocked: 0, valueConflict: 0, titleGuardBlocked: 1 }; return row; }
  for (const code of DATA.CORE_ORDER) row.specs.push(planItem(code, config.core[code], current.definitions, existingBySemantic(current.values, code)));
  const all = row.specs; const count = status => all.filter(i => i.status === status).length;
  row.status = count("VALUE_CONFLICT") || count("SCHEMA_BLOCKED") || count("NEEDS_SOURCE") ? "PARTIAL" : "READY";
  row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: count("WILL_ADD"), willFix: count("WILL_FIX"), existingOk: count("EXISTING_OK"), needsSource: count("NEEDS_SOURCE"), absentByDesign: count("ABSENT_BY_DESIGN"), schemaBlocked: count("SCHEMA_BLOCKED"), valueConflict: count("VALUE_CONFLICT"), titleGuardBlocked: 0 };
  return row;
}
function requiredDefinitions(rows, definitions) { const out = []; for (const row of rows) for (const item of row.specs || []) if (item && ["WILL_ADD", "WILL_FIX"].includes(item.status) && !item.definitionId && !findDefinition(definitions, item.code)) { const d = expectedDefinition(item.code); if (d && !out.some(x => x.code === item.code)) out.push({ code: item.code, ...d }); } return out; }
async function inspectBatch(db, { only, data = DATA } = {}) {
  const selected = [...new Set(only || [])]; if (!selected.length) throw new Error("Explicit nonempty --only is required"); const definitions = await db.all("SELECT * FROM product_attribute_definitions", []); const rows = [];
  for (const id of selected) { const config = data.PRODUCTS.find(p => p.externalId === id); if (!config || !ALL_MATS.includes(id)) rows.push({ externalId: id, status: "ERROR", error: `MAT is outside exact batch1 allowlist: ${id}` }); else { try { rows.push(await planProduct(db, config)); } catch (e) { rows.push({ externalId: id, status: "ERROR", error: e.message }); } } }
  const definitionsToCreate = requiredDefinitions(rows.filter(r => !["ERROR", "TITLE_GUARD_BLOCKED"].includes(r.status)), definitions); const sum = key => rows.reduce((n, r) => n + (r.summary?.[key] || 0), 0);
  return { mode: "dry-run", rows, summary: { total: rows.length, readyProducts: rows.filter(r => r.status === "READY").length, partialProducts: rows.filter(r => r.status === "PARTIAL").length, errors: rows.filter(r => r.status === "ERROR").length, logicalSlots: sum("logicalSlots"), willAdd: sum("willAdd"), willFix: sum("willFix"), existingOk: sum("existingOk"), needsSource: sum("needsSource"), absentByDesign: sum("absentByDesign"), schemaBlocked: sum("schemaBlocked"), valueConflict: sum("valueConflict"), titleGuardBlocked: sum("titleGuardBlocked"), definitionsToCreate: definitionsToCreate.length }, definitionsToCreate, absentByDesign: data.ABSENT_BY_DESIGN || {}, sources: data.SOURCES, writableSurface: { products: PRODUCT_MUTABLE_FIELDS_EXACTLY, attributeValueCodes: DATA.CORE_ORDER, forbidden: ["products.brand", "title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "unit", "category", "subcategory", "image", "image_url", "stock_status", "any image table"] } };
}
async function backupDatabase(dbPath, backupDir) { const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true }); const target = path.join(dir, `matmix-before-betoncontact-core-batch1-${Date.now()}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target; }
async function ensureDefinition(db, def) { const old = await db.get("SELECT * FROM product_attribute_definitions WHERE code=?", [def.code]); if (old) { if (!compatible(old, def.code)) throw new Error(`Definition conflict: ${def.code}`); return old; } const now = new Date().toISOString(); const result = await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [def.code, def.label, def.dataType, def.defaultUnit, "Характеристики", 100, 1, now, now]); return db.get("SELECT * FROM product_attribute_definitions WHERE id=?", [result.id]); }
async function applyBatch(db, dbPath, options, data = DATA) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`); const preflight = await inspectBatch(db, { only: options.only, data });
  if (preflight.summary.errors || preflight.summary.titleGuardBlocked || preflight.summary.valueConflict || preflight.summary.schemaBlocked) throw new Error("Apply blocked by preflight guard/conflict/schema status");
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    const created = new Map(); for (const def of preflight.definitionsToCreate) { const row = await ensureDefinition(db, def); created.set(def.code, row.id); writes += 1; }
    const now = new Date().toISOString();
    for (const row of preflight.rows) for (const item of row.specs) { if (!["WILL_ADD", "WILL_FIX"].includes(item.status)) continue; if (item.value === null || item.value === undefined || isPlaceholder(item.value)) throw new Error(`Unsafe placeholder write: ${row.externalId}/${item.code}`); const definitionId = item.definitionId || created.get(item.code); if (!definitionId) throw new Error(`Missing definition for ${item.code}`); const def = await db.get("SELECT data_type,default_unit FROM product_attribute_definitions WHERE id=?", [definitionId]); const text = def.data_type === "text" ? String(item.value) : null; const number = def.data_type === "number" ? Number(item.value) : null; const bool = def.data_type === "boolean" ? (item.value ? 1 : 0) : null; if (item.currentId) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=?,unit_override=?,updated_at=? WHERE id=?", [text, number, bool, def.default_unit || null, now, item.currentId]); else await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, text, number, bool, def.default_unit || null, DATA.CORE_ORDER.indexOf(item.code), now, now]); writes += 1; }
    const post = await inspectBatch(db, { only: options.only, data }); if (post.summary.errors || post.summary.titleGuardBlocked || post.summary.valueConflict || post.summary.schemaBlocked || post.summary.willAdd || post.summary.willFix) throw new Error("Postcheck failed: mandatory core is not stable"); await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (e) { try { await db.run("ROLLBACK"); } catch {} throw e; }
}
function md(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function renderReview(report) { const lines = ["# Бетонконтакт — CORE batch 1 review", "", `Режим: ${report.mode}. Дата: ${DATA.CHECKED_AT}. Production и product fields не изменяются.`, "", "## Scope", "", "Только MAT-000217…MAT-000221. MAT-000222…224 заблокированы по identity, MAT-000225 частично подтверждён и исключён.", "", "## Writable surface", "", "- `products`: ничего не изменяется.", "- `product_attribute_values`: только " + DATA.CORE_ORDER.join(", ") + " для пяти target MAT.", "- Definitions создаются только для READY source-backed values; templates не создаются.", "- Title, slug, descriptions, SEO, prices, weight/unit, category, images и stock не являются write targets.", "- Dry-run read-only; apply требует explicit confirmation, backup и transaction.", "", "## ABSENT_BY_DESIGN", "", ...Object.entries(report.absentByDesign || {}).map(([code, reason]) => `- **${code}**: ${reason}`), "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "## Products", "", "| MAT | title | status | slots | willAdd | existingOk | needsSource | absentByDesign | conflicts |", "|---|---|---|---:|---:|---:|---:|---:|---:|"]; for (const row of report.rows) { const s = row.summary || {}; lines.push(`| ${row.externalId} | ${md(row.title || row.error)} | ${row.status} | ${s.logicalSlots || 0} | ${s.willAdd || 0} | ${s.existingOk || 0} | ${s.needsSource || 0} | ${s.absentByDesign || 0} | ${(s.valueConflict || 0) + (s.schemaBlocked || 0) + (s.titleGuardBlocked || 0)} |`); } lines.push("", "## Per-MAT details", ""); for (const row of report.rows) { lines.push(`### ${row.externalId}`, "", `- Current title: ${md(row.title || row.error)}`, `- Guard: ${row.status === "TITLE_GUARD_BLOCKED" ? md(row.guardReason) : "PASS"}`, `- Source keys: ${md((row.sourceKeys || []).join(", "))}`, "", "| code | proposed | current | status | source/reason |", "|---|---|---|---|---|"); for (const item of row.specs || []) lines.push(`| ${item.code} | ${md(item.value)} | ${md(item.currentValue)} | ${item.status} | ${md((item.sources || []).join(", ") || item.reason)} |`); lines.push(""); } lines.push("## Source registry", ""); for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: [${source.title}](${source.url}) — ${source.evidence}`); return lines.join("\n") + "\n"; }
async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors || report.summary.titleGuardBlocked || report.summary.valueConflict || report.summary.schemaBlocked) process.exitCode = 1; } finally { await db.close(); } }
module.exports = { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
