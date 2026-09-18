"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/primers-core-batch1");

const CONFIRM = "BACKFILL_PRIMER_CORE_BATCH1";
const ALL_MATS = Object.freeze(DATA.PRODUCTS.map(product => product.externalId));
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["brand"]);
const VALUE_CODES = new Set(DATA.CORE_ORDER);
const DEFINITION_CATALOG = Object.freeze({ ...DATA.REUSABLE_DEFINITIONS, ...Object.fromEntries(DATA.NEW_DEFINITIONS.map(def => [def.code, def])) });
const MASS_LABELS = new Set(["вес", "масса", "вес упаковки", "масса упаковки", "фасовка"]);

const normalize = value => String(value ?? "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
const normalizeStructureName = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase("ru-RU");
const normalizedCompact = value => normalize(value).replace(/[^\p{L}\p{N}.]+/gu, "");
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const valueOf = row => row?.value_text ?? row?.value_number ?? row?.value_boolean ?? null;
const isPlaceholder = value => /NEEDS_SOURCE|UNKNOWN/i.test(String(value ?? ""));

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
  const out = { apply: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("=");
    if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
    seen.add(key);
    if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); if (key === "--apply") out.apply = true; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
    out[key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only === undefined) throw new Error("Explicit --only is required");
  out.only = out.only.split(",").map(value => value.trim()).filter(Boolean);
  if (!out.only.length) throw new Error("Nonempty --only is required");
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  return out;
}

function semanticForDefinition(definition) {
  if (!definition) return null;
  if (definition.code === "package_weight" || MASS_LABELS.has(normalize(definition.label))) return "package_weight";
  if (DEFINITION_CATALOG[definition.code]) return definition.code;
  const match = Object.entries(DEFINITION_CATALOG).find(([, candidate]) => normalize(candidate.label) === normalize(definition.label));
  return match ? match[0] : null;
}

function findDefinition(definitions, code) {
  const matches = definitions.filter(definition => definition.code === code || semanticForDefinition(definition) === code);
  if (matches.length > 1) throw new Error(`Duplicate semantic definition: ${code}`);
  return matches[0] || null;
}

function expectedDefinition(code) { return DEFINITION_CATALOG[code]; }
function compatible(definition, code) {
  const expected = expectedDefinition(code);
  return Boolean(definition && expected && definition.data_type === expected.dataType && (definition.default_unit || null) === (expected.defaultUnit || null) && Number(definition.is_active) === 1);
}

function sameValue(row, proposal, definition) {
  if (!row) return false;
  const expectedType = definition?.data_type || expectedDefinition(proposal.code)?.dataType;
  if (expectedType === "number") return Number(row.value_number) === Number(proposal.value);
  if (expectedType === "boolean") return Boolean(Number(row.value_boolean)) === Boolean(proposal.value);
  return normalizedCompact(valueOf(row)) === normalizedCompact(proposal.value);
}

async function loadState(db, config) {
  const product = await db.get("SELECT * FROM products WHERE external_id=?", [config.externalId]);
  if (!product) return { missing: true, product: null, values: [], definitions: [] };
  const values = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active
    FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
    WHERE v.product_id=? ORDER BY v.id`, [product.id]);
  const definitions = await db.all("SELECT * FROM product_attribute_definitions", []);
  return { product, values, definitions };
}

function guardStatus(product, config) {
  if (!product || Number(product.is_active) !== 1 || product.deleted_at) return { status: "ERROR", reason: "Product is missing, inactive, or deleted." };
  if (product.title !== config.expectedTitle) return { status: "TITLE_GUARD_BLOCKED", reason: `Exact title mismatch: expected «${config.expectedTitle}», got «${product.title}».` };
  if (normalizeStructureName(product.category) !== normalizeStructureName(config.expectedCategory) || normalizeStructureName(product.subcategory) !== normalizeStructureName(config.expectedSubcategory)) return { status: "TITLE_GUARD_BLOCKED", reason: `Category guard mismatch: expected ${config.expectedCategory} / ${config.expectedSubcategory}, got ${product.category} / ${product.subcategory}.` };
  return { status: "OK" };
}

function existingBySemantic(values, definitions, code) {
  const matches = values.filter(value => semanticForDefinition(value) === code || value.code === code);
  if (matches.length > 1) throw new Error(`Duplicate semantic value: ${code}`);
  return matches[0] || null;
}

function planItem(code, proposal, definitions, existing) {
  const definition = findDefinition(definitions, code);
  const sourceStatus = proposal?.status || "NEEDS_SOURCE";
  const item = { code, sourceStatus, value: proposal?.value ?? null, currentValue: valueOf(existing), currentId: existing?.id || null, definitionId: definition?.id || null, definitionType: definition?.data_type || null, sources: proposal?.sources || [], reason: proposal?.reason || null };
  if (sourceStatus === "READY" && definition && !compatible(definition, code)) { item.status = "SCHEMA_BLOCKED"; item.reason = `Existing definition is incompatible with ${expectedDefinition(code).dataType}/${expectedDefinition(code).defaultUnit || "no unit"}.`; return item; }
  if (sourceStatus === "READY") {
    if (existing && sameValue(existing, item, definition)) item.status = "EXISTING_OK";
    else if (existing) { item.status = "VALUE_CONFLICT"; item.reason = "Existing non-empty value differs; silent overwrite is forbidden."; }
    else item.status = definition ? "WILL_ADD" : "WILL_ADD";
    return item;
  }
  if (existing && nonempty(valueOf(existing))) { item.status = "VALUE_CONFLICT"; item.reason = "A non-empty value exists while the source proposal is unresolved/non-applicable."; }
  else item.status = sourceStatus;
  return item;
}

function planBrand(config, product, definitions, existing) {
  const definition = findDefinition(definitions, "brand");
  const attributeStatus = definition && !compatible(definition, "brand") ? "SCHEMA_BLOCKED" : existing ? (sameValue(existing, { code: "brand", value: config.brand }, definition) ? "EXISTING_OK" : "BRAND_CONFLICT") : "WILL_ADD";
  const productStatus = !nonempty(product.brand) ? "WILL_ADD" : normalize(product.brand) === normalize(config.brand) ? "EXISTING_OK" : "BRAND_CONFLICT";
  return { code: "brand", sourceStatus: "READY", value: config.brand, currentValue: valueOf(existing), currentProductBrand: product.brand, currentId: existing?.id || null, definitionId: definition?.id || null, definitionType: definition?.data_type || null, sources: config.core.brand?.sources || [], attributeStatus, productColumnStatus: productStatus, status: attributeStatus === "SCHEMA_BLOCKED" ? "SCHEMA_BLOCKED" : attributeStatus === "BRAND_CONFLICT" || productStatus === "BRAND_CONFLICT" ? "BRAND_CONFLICT" : attributeStatus === "EXISTING_OK" && productStatus === "EXISTING_OK" ? "EXISTING_OK" : "WILL_ADD" };
}

async function planProduct(db, config) {
  const state = await loadState(db, config);
  if (state.missing) return { externalId: config.externalId, status: "ERROR", error: "Product not found." };
  const guard = guardStatus(state.product, config);
  const row = { externalId: config.externalId, title: state.product.title, productId: state.product.id, category: state.product.category, subcategory: state.product.subcategory, identityStatus: config.identityStatus || "IDENTITY_CONFIRMED", titleStatus: config.titleStatus || "MATCH", sourceKeys: config.sourceKeys, current: { brand: state.product.brand, weight: state.product.weight, description: state.product.full_description || state.product.description || null, specsCount: state.values.length }, specs: [], contentWrites: [], notStored: ["title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "category", "subcategory", "image", "image_url", "stock_status"], notes: [] };
  if (guard.status !== "OK") { row.status = guard.status; row.guardReason = guard.reason; row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: 0, willFix: 0, existingOk: 0, needsSource: 0, absentByDesign: 0, schemaBlocked: 0, valueConflict: 0, brandConflict: 0, titleGuardBlocked: guard.status === "TITLE_GUARD_BLOCKED" ? 1 : 0 }; return row; }
  const brandExisting = existingBySemantic(state.values, state.definitions, "brand");
  row.brand = planBrand(config, state.product, state.definitions, brandExisting);
  for (const code of DATA.CORE_ORDER.filter(item => item !== "brand")) row.specs.push(planItem(code, config.core[code], state.definitions, existingBySemantic(state.values, state.definitions, code)));
  const all = [row.brand, ...row.specs];
  const valueConflict = all.filter(item => item.status === "VALUE_CONFLICT").length;
  const brandConflict = row.brand.status === "BRAND_CONFLICT" ? 1 : 0;
  const schemaBlocked = all.filter(item => item.status === "SCHEMA_BLOCKED").length;
  const needsSource = all.filter(item => item.status === "NEEDS_SOURCE").length;
  const absentByDesign = all.filter(item => item.status === "ABSENT_BY_DESIGN").length;
  const hasPartial = needsSource || schemaBlocked || valueConflict || brandConflict;
  row.status = hasPartial ? "PARTIAL" : "READY";
  row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: all.filter(item => item.status === "WILL_ADD").length, willFix: all.filter(item => item.status === "WILL_FIX").length, existingOk: all.filter(item => item.status === "EXISTING_OK").length, needsSource, absentByDesign, schemaBlocked, valueConflict, brandConflict, titleGuardBlocked: 0 };
  return row;
}

function requiredDefinitions(rows, definitions) {
  const out = [];
  for (const row of rows) for (const item of [row.brand, ...(row.specs || [])]) {
    if (!item || !["WILL_ADD", "WILL_FIX"].includes(item.status) || item.definitionId) continue;
    const def = expectedDefinition(item.code); if (def && !out.some(candidate => candidate.code === item.code) && !findDefinition(definitions, item.code)) out.push({ code: item.code, ...def });
  }
  return out;
}

async function inspectBatch(db, { only, data = DATA } = {}) {
  const selected = [...new Set(only || [])]; if (!selected.length) throw new Error("Explicit nonempty --only is required");
  const definitions = await db.all("SELECT * FROM product_attribute_definitions", []);
  const rows = [];
  for (const externalId of selected) {
    const config = data.PRODUCTS.find(product => product.externalId === externalId);
    if (!config || !ALL_MATS.includes(externalId)) rows.push({ externalId, status: "ERROR", error: `MAT is outside exact batch1 allowlist: ${externalId}` });
    else { try { rows.push(await planProduct(db, config)); } catch (error) { rows.push({ externalId, status: "ERROR", error: error.message }); } }
  }
  const definitionsToCreate = requiredDefinitions(rows.filter(row => row.status !== "ERROR" && row.status !== "TITLE_GUARD_BLOCKED"), definitions);
  const summary = {
    total: rows.length, readyProducts: rows.filter(row => row.status === "READY").length, partialProducts: rows.filter(row => row.status === "PARTIAL").length,
    errors: rows.filter(row => row.status === "ERROR").length, logicalSlots: rows.reduce((n, row) => n + (row.summary?.logicalSlots || 0), 0),
    willAdd: rows.reduce((n, row) => n + (row.summary?.willAdd || 0), 0), willFix: rows.reduce((n, row) => n + (row.summary?.willFix || 0), 0), existingOk: rows.reduce((n, row) => n + (row.summary?.existingOk || 0), 0),
    needsSource: rows.reduce((n, row) => n + (row.summary?.needsSource || 0), 0), absentByDesign: rows.reduce((n, row) => n + (row.summary?.absentByDesign || 0), 0), schemaBlocked: rows.reduce((n, row) => n + (row.summary?.schemaBlocked || 0), 0), valueConflict: rows.reduce((n, row) => n + (row.summary?.valueConflict || 0), 0), brandConflict: rows.reduce((n, row) => n + (row.summary?.brandConflict || 0), 0), titleGuardBlocked: rows.reduce((n, row) => n + (row.summary?.titleGuardBlocked || 0), 0), definitionsToCreate: definitionsToCreate.length
  };
  return { mode: "dry-run", rows, summary, definitionsToCreate, sources: data.SOURCES, writableSurface: { products: PRODUCT_MUTABLE_FIELDS_EXACTLY, attributeValueCodes: DATA.CORE_ORDER, forbidden: ["title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "category", "subcategory", "image", "image_url", "stock_status", "any image table"] } };
}

async function backupDatabase(dbPath, backupDir) {
  const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `matmix-before-primer-core-batch1-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function ensureDefinition(db, definition) {
  const existing = await db.get("SELECT * FROM product_attribute_definitions WHERE code=?", [definition.code]);
  if (existing) { if (!compatible(existing, definition.code)) throw new Error(`Definition conflict: ${definition.code}`); return existing; }
  const now = new Date().toISOString(); const result = await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [definition.code, definition.label, definition.dataType, definition.defaultUnit, "Характеристики", 100, 1, now, now]); return db.get("SELECT * FROM product_attribute_definitions WHERE id=?", [result.id]);
}

async function applyBatch(db, dbPath, options, data = DATA) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  const preflight = await inspectBatch(db, { only: options.only, data });
  if (preflight.summary.errors || preflight.summary.titleGuardBlocked || preflight.summary.valueConflict || preflight.summary.brandConflict || preflight.summary.schemaBlocked) throw new Error("Apply blocked by preflight guard/conflict/schema status");
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    const created = new Map(); for (const definition of preflight.definitionsToCreate) { const row = await ensureDefinition(db, definition); created.set(definition.code, row.id); writes += 1; }
    const now = new Date().toISOString();
    for (const row of preflight.rows) {
      const brand = row.brand; if (brand.productColumnStatus === "WILL_ADD") { await db.run("UPDATE products SET brand=? WHERE id=? AND external_id=?", [brand.value, row.productId, row.externalId]); writes += 1; }
      if (brand.status === "WILL_ADD") { const definitionId = brand.definitionId || created.get("brand"); await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, brand.value, null, null, null, 0, now, now]); writes += 1; }
      for (const item of row.specs) {
        if (item.status !== "WILL_ADD" && item.status !== "WILL_FIX") continue;
        if (item.value === null || item.value === undefined || isPlaceholder(item.value)) throw new Error(`Unsafe placeholder write: ${row.externalId}/${item.code}`);
        const definitionId = item.definitionId || created.get(item.code); if (!definitionId) throw new Error(`Missing definition for ${item.code}`);
        const definition = await db.get("SELECT data_type,default_unit FROM product_attribute_definitions WHERE id=?", [definitionId]);
        const text = definition.data_type === "text" ? String(item.value) : null; const number = definition.data_type === "number" ? Number(item.value) : null; const bool = definition.data_type === "boolean" ? (item.value ? 1 : 0) : null;
        if (item.currentId) { await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=?,unit_override=?,updated_at=? WHERE id=?", [text, number, bool, definition.default_unit || null, now, item.currentId]); }
        else { await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, text, number, bool, definition.default_unit || null, DATA.CORE_ORDER.indexOf(item.code), now, now]); }
        writes += 1;
      }
    }
    const post = await inspectBatch(db, { only: options.only, data });
    if (post.summary.errors || post.summary.titleGuardBlocked || post.summary.valueConflict || post.summary.brandConflict || post.summary.schemaBlocked || post.summary.willAdd || post.summary.willFix) throw new Error("Postcheck failed: mandatory core is not stable");
    await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function md(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function renderReview(report) {
  const lines = ["# Грунтовки — CORE batch 1 review", "", `Режим: ${report.mode}. Дата: ${DATA.CHECKED_AT}. Production и title/slug не изменяются.`, "", "## Writable surface", "", "- `products`: только `brand`.", `- \`product_attribute_values\`: только ${DATA.CORE_ORDER.join(", ")} для MAT-000227, 228, 230, 231, 232, 233, 235, 236, 240, 241, 242.`, "- Title, slug, descriptions, SEO, prices, inventory weight, stock и images не являются write targets.", "- Existing different brand is `BRAND_CONFLICT` and blocks apply; other conflicting core values are `VALUE_CONFLICT`.", "- Dry-run never writes.", "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "## Products", "", "| MAT | title | status | logical slots | willAdd | willFix | existingOk | needsSource | absentByDesign | schemaBlocked | valueConflict | brandConflict |", "|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"];
  for (const row of report.rows) { const s = row.summary || {}; lines.push(`| ${row.externalId} | ${md(row.title || row.error)} | ${row.status} | ${s.logicalSlots || 0} | ${s.willAdd || 0} | ${s.willFix || 0} | ${s.existingOk || 0} | ${s.needsSource || 0} | ${s.absentByDesign || 0} | ${s.schemaBlocked || 0} | ${s.valueConflict || 0} | ${s.brandConflict || 0} |`); }
  lines.push("", "## Per-MAT details", "");
  for (const row of report.rows) { lines.push(`### ${row.externalId}`, "", `- Current title: ${md(row.title || row.error)}`, `- Guard: ${row.status === "TITLE_GUARD_BLOCKED" ? md(row.guardReason) : "PASS"}`, `- Source keys: ${md((row.sourceKeys || []).join(", "))}`); if (row.status === "TITLE_GUARD_BLOCKED" || row.status === "ERROR") { lines.push(""); continue; } lines.push("", "| code | proposed | current | status | source/reason |", "|---|---|---|---|---|"); for (const item of [row.brand, ...(row.specs || [])]) lines.push(`| ${item.code} | ${md(item.value)} | ${md(item.currentValue)} | ${item.status} | ${md((item.sources || []).join(", ") || item.reason)} |`); lines.push(""); }
  lines.push("## Definitions", "", `- Reusable definitions: ${Object.keys(DATA.REUSABLE_DEFINITIONS).join(", ")}`, `- Proposed definitions: ${DATA.NEW_DEFINITIONS.map(def => `${def.code} (${def.dataType}${def.defaultUnit ? `, ${def.defaultUnit}` : ""})`).join(", ")}`, `- Definitions to create in this runtime: ${(report.definitionsToCreate || []).map(def => def.code).join(", ") || "none"}`, "", "## Source registry", "");
  for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title}](${source.url})` : source.title} — ${source.owner}`);
  return lines.join("\n") + "\n";
}

async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors || report.summary.titleGuardBlocked || report.summary.valueConflict || report.summary.schemaBlocked) process.exitCode = 1; } finally { await db.close(); } }

module.exports = { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
