"use strict";
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/putties-core-content");
const CONFIRM = "BACKFILL_PUTTY_CORE";
const PUTTY_MAT_ALLOWLIST = Object.freeze(Array.from({ length: 14 }, (_, i) => `MAT-${String(i + 33).padStart(6, "0")}`));
const ALL_MATS = PUTTY_MAT_ALLOWLIST;
const MASS_LABELS = new Set(["вес", "масса", "весупаковки", "массаупаковки", "фасовка"]);
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["brand"]);
const normalize = v => String(v || "").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]+/gu, "").trim();
const valueOf = row => row?.value_text ?? row?.value_number ?? row?.value_boolean ?? null;
const sameValue = (row, proposal) => proposal && row && (typeof proposal.value === "number" ? Number(row.value_number) === Number(proposal.value) : String(valueOf(row)) === String(proposal.value));

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
  for (let i = 0; i < args.length; i++) {
    const token = args[i]; const [key, ...tail] = token.split("=");
    if (seen.has(key)) throw new Error(`Duplicate option: ${key}`); seen.add(key);
    if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); if (key === "--apply") out.apply = true; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`); out[key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only === undefined) throw new Error("Explicit --only is required");
  out.only = out.only.split(",").map(v => v.trim()).filter(Boolean); if (!out.only.length) throw new Error("Nonempty --only is required");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  return out;
}

function semanticForDefinition(def) {
  if (!def) return null;
  if (def.code === "package_weight" || MASS_LABELS.has(normalize(def.label))) return "package_weight";
  return DATA.REUSABLE_DEFINITIONS[def.code] || DATA.NEW_DEFINITIONS.some(d => d.code === def.code) ? def.code : null;
}
function findDefinition(definitions, code) {
  const matches = definitions.filter(d => d.code === code || (code === "package_weight" && MASS_LABELS.has(normalize(d.label))));
  if (matches.length > 1) throw new Error(`Duplicate semantic definition: ${code}`);
  return matches[0] || null;
}
function checkDefinitions(definitions) {
  const seen = new Map();
  for (const d of definitions) { const semantic = semanticForDefinition(d); if (!semantic) continue; if (seen.has(semantic) && seen.get(semantic).id !== d.id) throw new Error(`Duplicate semantic definition: ${semantic}`); seen.set(semantic, d); }
}
async function loadState(db, config) {
  const product = await db.get("SELECT * FROM products WHERE external_id=?", [config.externalId]);
  if (!product) throw new Error(`Product not found: ${config.externalId}`);
  if (Number(product.is_active) !== 1 || product.deleted_at) throw new Error(`Product inactive/deleted: ${config.externalId}`);
  if (product.category !== "Смеси" || product.subcategory !== "Шпаклевка") throw new Error(`Category guard failed: ${config.externalId}`);
  if (product.title !== config.expectedTitle) throw new Error(`Identity mismatch: expected exact title "${config.expectedTitle}"`);
  if (Number(product.weight) !== Number(config.core.package_weight.value)) throw new Error(`Weight mismatch: ${config.externalId}`);
  const definitions = await db.all("SELECT * FROM product_attribute_definitions WHERE is_active=1 ORDER BY id"); checkDefinitions(definitions);
  const values = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active
      FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
      WHERE v.product_id=? ORDER BY v.id`, [product.id]);
  if (values.some(v => !v.code)) throw new Error(`Orphan attribute value: ${config.externalId}`);
  const semantics = new Map();
  for (const v of values) { const semantic = semanticForDefinition({ code: v.code, label: v.label }); if (!semantic) continue; if (semantics.has(semantic)) throw new Error(`Duplicate semantic specification: ${config.externalId}/${semantic}`); semantics.set(semantic, v); }
  return { product, definitions, values, semantics };
}

function proposalStatus(item) { return item?.status || "NEEDS_SOURCE"; }
function buildItem(code, proposal, def, existing, config) {
  const status = proposalStatus(proposal); const expectedType = ["package_weight", "shelf_life"].includes(code) ? "number" : "text";
  if (status === "READY") {
    if (!def) {
      const creatable = DATA.NEW_DEFINITIONS.some(candidate => candidate.code === code);
      if (!creatable) return { code, status: "ERROR", sourceStatus: status, value: proposal.value, sources: proposal.sources || [], reason: "Reusable definition missing", definitionId: null, definitionType: null, currentValue: valueOf(existing), currentId: existing?.id };
    } else {
      if (def.data_type !== expectedType) throw new Error(`Incompatible definition type: ${code}`);
      if (code === "package_weight" && def.default_unit !== "\u043a\u0433") throw new Error("package_weight must use кг");
      if (code === "shelf_life" && def.default_unit !== "\u043c\u0435\u0441\u044f\u0446\u0435\u0432") throw new Error("shelf_life must use months");
    }
  }
  let itemStatus = status;
  if (status === "READY") itemStatus = existing && sameValue(existing, proposal) ? "EXISTING_OK" : existing ? "WILL_FIX" : "WILL_ADD";
  else if (status === "ABSENT_BY_DESIGN" && existing) itemStatus = "EXISTING_OK";
  return { code, status: itemStatus, sourceStatus: status, value: proposal.value, sources: proposal.sources || [], reason: proposal.reason, rawSourceValue: proposal.rawSourceValue, qualifier: proposal.qualifier, formula: proposal.formula, definitionId: def?.id || null, definitionType: def?.data_type || null, currentValue: valueOf(existing), currentId: existing?.id || null };
}

async function planProduct(db, config, preloadedDefinitions) {
  const state = await loadState(db, config); const { product, definitions, semantics } = state; const defs = preloadedDefinitions || definitions;
  const row = { externalId: config.externalId, title: product.title, productId: product.id, category: product.category, subcategory: product.subcategory, identityStatus: config.identityStatus, sourceKeys: config.sourceKeys, current: { brand: product.brand, weight: product.weight, description: product.full_description || product.short_description || product.description || null, specsCount: state.values.length }, brand: null, specs: [], content: {}, notes: [] };
  const brandDef = findDefinition(defs, "brand"); if (!brandDef || brandDef.data_type !== "text") throw new Error("Canonical brand definition missing/incompatible");
  const existingBrand = semantics.get("brand"); const brandProposal = { status: "READY", value: config.brand, sources: config.brandSources || config.sourceKeys };
  row.brand = { ...buildItem("brand", brandProposal, brandDef, existingBrand, config), currentProductBrand: product.brand, value: config.brand };
  for (const code of DATA.CORE_ORDER.filter(c => c !== "brand")) {
    const proposal = config.core[code]; if (!proposal) throw new Error(`Missing proposal: ${config.externalId}/${code}`);
    const def = findDefinition(defs, code); const existing = semantics.get(code); row.specs.push(buildItem(code, proposal, def, existing, config));
  }
  if (config.content && Object.keys(config.content).length) throw new Error("Putty core pass does not accept content writes");
  for (const field of ["short_description", "full_description", "seo_title", "seo_description"]) row.content[field] = { status: "EXISTING_OK", value: product[field] || null, reason: "Putty core pass is read-only for content fields." };

  row.canonicalIdentity = { brand: config.brand, productType: config.core.product_type?.value || null, packageWeightKg: config.core.package_weight?.value || null, sourceKeys: config.sourceKeys };
  row.titleNormalization = { current: product.title, recommendation: "KEEP_UNCHANGED", reason: "Exact local title is an identity guard; title/category are review-only in this pass." };
  row.notStored = ["title", "slug", "category", "subcategory", "weight", "price", "stock_status", "image", "image_url", "description", "short_description", "full_description", "seo_title", "seo_description", "consumption_10mm", "coverage_30kg_10mm", "wall_layer_thickness", "ceiling_layer_thickness"];
  row.stored = [row.brand, ...row.specs].filter(i => ["WILL_ADD", "WILL_FIX", "EXISTING_OK"].includes(i.status)).map(i => i.code);
  const unresolved = [row.brand, ...row.specs].some(i => ["NEEDS_SOURCE", "SCHEMA_BLOCKED"].includes(i.status));
  row.status = row.identityStatus === "BLOCKED_IDENTITY" ? "BLOCKED_IDENTITY" : unresolved ? "PARTIAL" : "READY";
  row.summary = { ready: [row.brand, ...row.specs].filter(i => ["READY", "EXISTING_OK", "WILL_ADD", "WILL_FIX"].includes(i.status)).length, willAdd: [row.brand, ...row.specs].filter(i => i.status === "WILL_ADD").length, willFix: [row.brand, ...row.specs].filter(i => i.status === "WILL_FIX").length, needsSource: [row.brand, ...row.specs].filter(i => i.status === "NEEDS_SOURCE").length, schemaBlocked: [row.brand, ...row.specs].filter(i => i.status === "SCHEMA_BLOCKED").length };
  return row;
}
function definitionsToCreate(definitions) { return DATA.NEW_DEFINITIONS.filter(d => !definitions.some(existing => existing.code === d.code)); }
async function inspectBatch(db, { only, data = DATA } = {}) {
  const selected = [...new Set(only || [])]; if (!selected.length) throw new Error("Explicit nonempty --only is required");
  const defs = await db.all("SELECT * FROM product_attribute_definitions WHERE is_active=1 ORDER BY id"); checkDefinitions(defs);
  const rows = []; for (const id of selected) {
    const config = data.PRODUCTS.find(p => p.externalId === id);
    if (!PUTTY_MAT_ALLOWLIST.includes(id)) rows.push({ externalId: id, status: "ERROR", error: `MAT is outside putty allowlist: ${id}` });
    else if (!config) rows.push({ externalId: id, status: "ERROR", error: `Putty config missing from allowlist: ${id}` });
    else { try { rows.push(await planProduct(db, config, defs)); } catch (error) { rows.push({ externalId: id, status: "ERROR", error: error.message }); } }
  }
  const summary = { total: rows.length, ready: rows.filter(r => r.status === "READY").length, partial: rows.filter(r => r.status === "PARTIAL").length, errors: rows.filter(r => r.status === "ERROR").length, willAdd: rows.reduce((n,r) => n + (r.summary?.willAdd || 0), 0), willFix: rows.reduce((n,r) => n + (r.summary?.willFix || 0), 0), existingOk: rows.reduce((n,r) => n + (r.summary?.ready || 0) - (r.summary?.willAdd || 0) - (r.summary?.willFix || 0), 0), needsSource: rows.reduce((n,r) => n + (r.summary?.needsSource || 0), 0), schemaBlocked: rows.reduce((n,r) => n + (r.summary?.schemaBlocked || 0), 0), definitionsToCreate: definitionsToCreate(defs).length };
  const globalTemplates = Number((await db.get("SELECT COUNT(*) AS n FROM product_attribute_templates")).n);
  const categoryTemplates = Number((await db.get("SELECT COUNT(*) AS n FROM product_attribute_templates t JOIN catalog_structure s ON s.id=t.structure_id WHERE s.external_code=?", ["SUB-000003"])).n);
  return { mode: "dry-run", rows, summary, definitionsToCreate: definitionsToCreate(defs), templateAudit: { globalCount: globalTemplates, categoryCount: categoryTemplates, action: "No templates created; current global/category template count is audited only." }, schema: { prohibited: ["consumption_10mm", "coverage_30kg_10mm", "wall_layer_thickness", "ceiling_layer_thickness"], shelfLife: "Numeric months only; unlimited/textual source remains SCHEMA_BLOCKED; no migration." }, sources: data.SOURCES };
}
async function backupDatabase(dbPath, backupDir) { const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true }); const target = path.join(dir, `matmix-before-putty-core-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target; }
async function ensureDefinition(db, def) { const existing = await db.get("SELECT * FROM product_attribute_definitions WHERE code=?", [def.code]); if (existing) { if (existing.data_type !== def.dataType || (existing.default_unit || null) !== (def.defaultUnit || null) || Number(existing.is_active) !== 1) throw new Error(`Definition conflict: ${def.code}`); return existing; } const now = new Date().toISOString(); const result = await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [def.code, def.label, def.dataType, def.defaultUnit, "Характеристики", 100, 1, now, now]); return db.get("SELECT * FROM product_attribute_definitions WHERE id=?", [result.id]); }
async function applyBatch(db, dbPath, options, data = DATA) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
  const preflight = await inspectBatch(db, { only: options.only, data }); if (preflight.summary.errors) throw new Error(`Batch preflight errors: ${preflight.rows.filter(r => r.error).map(r => `${r.externalId}: ${r.error}`).join("; ")}`);
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0; const created = new Map();
  const needsDefinitions = preflight.rows.some(row => row.specs?.some(item => ["WILL_ADD", "WILL_FIX"].includes(item.status)));
  try {
    if (needsDefinitions) for (const def of preflight.definitionsToCreate) { const row = await ensureDefinition(db, def); created.set(def.code, row.id); writes++; }
    const now = new Date().toISOString();
    for (const row of preflight.rows) {
      const brand = row.brand;
      if (["WILL_ADD", "WILL_FIX"].includes(brand.status)) {
        await db.run("UPDATE products SET brand=?,updated_at=? WHERE id=? AND external_id=?", [brand.value, now, row.productId, row.externalId]); writes++;
        if (brand.currentId) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=NULL,value_boolean=NULL,unit_override=NULL,updated_at=? WHERE id=?", [brand.value, now, brand.currentId]);
        else await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, brand.definitionId, brand.value, null, null, null, 0, now, now]);
        if (!brand.currentId) writes++;
      }
      for (const item of row.specs) {
        if (!["WILL_ADD", "WILL_FIX"].includes(item.status)) continue;
        if (item.value === null || item.value === undefined || /NEEDS_SOURCE|UNKNOWN/i.test(String(item.value))) throw new Error(`Unsafe placeholder write: ${row.externalId}/${item.code}`);
        const definitionId = item.definitionId || created.get(item.code); if (!definitionId) throw new Error(`Missing definition for ${item.code}`);
        const definition = await db.get("SELECT data_type,default_unit FROM product_attribute_definitions WHERE id=?", [definitionId]);
        const text = definition.data_type === "text" ? String(item.value) : null; const number = definition.data_type === "number" ? Number(item.value) : null;
        if (item.currentId) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=NULL,unit_override=?,updated_at=? WHERE id=?", [text, number, definition.default_unit || null, now, item.currentId]);
        else await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, text, number, null, definition.default_unit || null, DATA.CORE_ORDER.indexOf(item.code), now, now]);
        writes++;
      }
    }
    const post = await inspectBatch(db, { only: options.only, data }); if (post.summary.errors || post.rows.some(r => r.specs?.some(i => ["WILL_ADD", "WILL_FIX"].includes(i.status)))) throw new Error("Postcheck failed: mandatory core values are not stable");
    await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}
function mdCell(v) { return String(v ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function renderReview(report) {
  const lines = ["# Шпаклевка — CORE corrective review", "", `Проверено: ${DATA.CHECKED_AT}. Локальный dry-run; production не используется.`, "", "## Архитектура", "", "- Scope: только core attributes и синхронизация `products.brand` с атрибутом `brand`.", "- `TITLE_WRITES=0`: `products.title` используется только как identity guard; `canonicalIdentity` и `titleNormalization` — review metadata, не операции записи.", "- Запись только targeted upsert; wholesale delete не используется.", "- `consumption_10mm`, `coverage_30kg_10mm`, `wall_layer_thickness`, `ceiling_layer_thickness` не используются.", "- `shelf_life` с текстом «не ограничен» имеет статус `SCHEMA_BLOCKED`; миграций нет.", "- Templates: аудит без создания.", "", "## Dry-run", "", "| MAT | Current title | Brand | Core status | Source keys |", "|---|---|---|---|---|"];
  for (const row of report.rows) lines.push(`| ${mdCell(row.externalId)} | ${mdCell(row.title)} | ${mdCell(row.brand?.value)} (${mdCell(row.brand?.status)}) | ${mdCell(row.status)} | ${mdCell(row.sourceKeys?.join(", "))} |`);
  lines.push("", "## Per-MAT details", "");
  for (const row of report.rows) {
    lines.push(`### ${row.externalId}`, "", `- Current title: ${row.title || "ERROR"}`, `- Identity: ${row.identityStatus || "ERROR"}`, `- Category guard: ${row.category || "-"} / ${row.subcategory || "-"}`);
    if (row.error) { lines.push(`- ERROR: ${row.error}`, ""); continue; }
    lines.push(`- Brand: ${row.brand?.value} - ${row.brand?.status}; product column and attribute are planned together.`);
    lines.push(`- Canonical identity: ${mdCell(row.canonicalIdentity?.brand)} / ${mdCell(row.canonicalIdentity?.productType)} / ${mdCell(row.canonicalIdentity?.packageWeightKg)} kg.`);
    lines.push(`- Title normalization: ${row.titleNormalization?.recommendation}; ${row.titleNormalization?.reason}`);
    lines.push(`- Stored/planned fields: ${mdCell(row.stored?.join(", ")) || "-"}`);
    lines.push(`- Not stored: ${mdCell(row.notStored?.join(", "))}`);
    lines.push("", "| Code | Proposed | Current | Status | Definition | Sources / reason |", "|---|---|---|---|---|---|");
    for (const item of row.specs || []) lines.push(`| ${item.code} | ${mdCell(item.value)} | ${mdCell(item.currentValue)} | ${item.status} | ${item.definitionId || "to create"} (${item.definitionType || "text"}) | ${mdCell((item.sources || []).join(", ") || item.reason)} |`);
    const needs = (row.specs || []).filter(i => i.status === "NEEDS_SOURCE"); const blocked = (row.specs || []).filter(i => i.status === "SCHEMA_BLOCKED");
    if (needs.length) lines.push("", `- NEEDS_SOURCE: ${needs.map(i => `${i.code} - ${mdCell(i.reason)}`).join("; ")}`);
    if (blocked.length) lines.push("", `- SCHEMA_BLOCKED: ${blocked.map(i => `${i.code} - ${mdCell(i.reason)}`).join("; ")}`);
    const shelf = row.specs?.find(i => i.code === "shelf_life"); if (shelf) lines.push(`- shelf_life note: ${shelf.status === "SCHEMA_BLOCKED" ? "unlimited/textual source is intentionally not coerced to numeric months" : `numeric months ${shelf.value} is source-supported`}.`);
    lines.push("");
  }
  lines.push("## Definitions and templates", "", `- Reused canonical definitions: ${Object.keys(DATA.REUSABLE_DEFINITIONS).join(", ")}.`, `- New TEXT definitions (default unit null): ${DATA.NEW_DEFINITIONS.map(d => d.code).join(", ")}.`, `- Definitions planned to create: ${(report.definitionsToCreate || []).map(d => d.code).join(", ") || "none"}.`, `- Template audit: ${JSON.stringify(report.templateAudit || {})}`, "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "## Source registry", "");
  for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title}](${source.url})` : source.title}${source.market ? ` [market: ${source.market}]` : ""}${source.note ? ` — ${source.note}` : ""}`);
  return lines.join("\n") + "\n";
}
async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors) process.exitCode = 1; } finally { await db.close(); } }
module.exports = { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
