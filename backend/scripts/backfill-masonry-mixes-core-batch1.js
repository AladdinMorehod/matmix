"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/masonry-mixes-core-batch1");

const CONFIRM = "BACKFILL_MASONRY_MIXES_CORE_BATCH1";
const ALL_MATS = Object.freeze(DATA.PRODUCTS.map(item => item.externalId));
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["brand", "image_url"]);
const VALUE_CODES = new Set(DATA.CORE_ORDER);
const DEFINITION_CATALOG = Object.freeze({ ...DATA.REUSABLE_DEFINITIONS, ...Object.fromEntries(DATA.NEW_DEFINITIONS.map(item => [item.code, item])) });
const DEFINITION_ALIASES = Object.freeze({
  application_area: ["область применения", "зона применения"],
  application_method: ["способ нанесения", "метод нанесения"],
  substrates: ["основания", "тип основания", "поверхности"],
  color: ["цвет"],
  layer_thickness: ["толщина слоя"],
  water_requirement: ["расход воды", "количество воды", "вода затворения"],
  pot_life: ["жизнеспособность раствора", "жизнеспособность", "время использования"],
  compressive_strength: ["прочность на сжатие", "сопротивление сжатию", "прочность", "strength", "compressive strength", "compression strength"],
  adhesion: ["адгезия", "сцепление"],
  frost_resistance: ["морозостойкость"],
  standard: ["стандарт", "нормативный документ"],
  mortar_grade: ["марка раствора", "марка смеси", "марка"]
});
const DEFINITION_CODE_ALIASES = Object.freeze({
  compressive_strength: ["strength", "compressive_strength", "compression_strength"]
});
const normalize = value => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/\s+/gu, " ").trim();
const normalizedCompact = value => normalize(value).replace(/[^\p{L}\p{N}.]+/gu, "");
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const valueOf = row => row?.value_text ?? row?.value_number ?? row?.value_boolean ?? null;
const isPlaceholder = value => /NEEDS_SOURCE|UNKNOWN/i.test(String(value ?? ""));
const imageValue = row => String(row?.image_url ?? "").trim();

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
  const out = { apply: false, cleanupPlaceholder: false }; const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("="); if (seen.has(key)) throw new Error(`Duplicate option: ${key}`); seen.add(key);
    if (["--apply", "--dry-run", "--cleanup-shared-placeholder"].includes(key)) { if (tail.length) throw new Error(`Unexpected value: ${key}`); if (key === "--apply") out.apply = true; if (key === "--cleanup-shared-placeholder") out.cleanupPlaceholder = true; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`); out[key.slice(2)] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only === undefined) throw new Error("Explicit --only is required");
  out.only = assertExactBatch(out.only.split(",").map(value => value.trim()).filter(Boolean));
  if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
  if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  if (out.cleanupPlaceholder && !out.apply) throw new Error("--cleanup-shared-placeholder requires --apply");
  return out;
}

function assertExactBatch(values) {
  const normalized = values.map(value => String(value).trim());
  if (normalized.length !== ALL_MATS.length || new Set(normalized).size !== ALL_MATS.length || ALL_MATS.some(id => !normalized.includes(id))) throw new Error(`Exact batch required: ${ALL_MATS.join(",")}`);
  return normalized;
}

function semanticForDefinition(definition) {
  if (!definition) return null;
  if (DEFINITION_CATALOG[definition.code]) return definition.code;
  const code = normalize(definition.code); for (const [semantic, aliases] of Object.entries(DEFINITION_CODE_ALIASES)) if (aliases.some(alias => normalize(alias) === code)) return semantic;
  const label = normalize(definition.label); for (const [code, aliases] of Object.entries(DEFINITION_ALIASES)) if (aliases.some(alias => normalize(alias) === label)) return code;
  return null;
}
function findDefinition(definitions, code) { const matches = definitions.filter(def => def.code === code || semanticForDefinition(def) === code); if (matches.length > 1) throw new Error(`Duplicate semantic definition: ${code}`); return matches[0] || null; }
function expectedDefinition(code) { return DEFINITION_CATALOG[code]; }
function compatible(definition, code) { const expected = expectedDefinition(code); return Boolean(definition && expected && definition.data_type === expected.dataType && (definition.default_unit || null) === (expected.defaultUnit || null) && Number(definition.is_active) === 1); }
function sameValue(row, proposal, definition) { if (!row) return false; const type = definition?.data_type || expectedDefinition(proposal.code)?.dataType; if (type === "number") return Number(row.value_number) === Number(proposal.value); return normalizedCompact(valueOf(row)) === normalizedCompact(proposal.value); }

async function loadState(db, config) {
  const productRows = await db.all("SELECT * FROM products WHERE external_id=?", [config.externalId]);
  if (productRows.length !== 1) return { product: productRows[0] || null, productCount: productRows.length, values: [], definitions: [], imageRows: [] };
  const product = productRows[0];
  const values = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`, [product.id]);
  const definitions = await db.all("SELECT * FROM product_attribute_definitions", []);
  const imageRows = await db.all("SELECT * FROM product_images WHERE product_id=? ORDER BY id", [product.id]);
  return { product, productCount: 1, values, definitions, imageRows };
}

function guardStatus(state, config) {
  if (state.productCount !== 1 || !state.product || Number(state.product.is_active) !== 1 || state.product.deleted_at) return { status: "ERROR", reason: `Expected exactly one active product, found ${state.productCount}.` };
  const acceptedTitles = [config.expectedTitle, config.titleCandidate].filter(Boolean);
  if (!acceptedTitles.includes(state.product.title)) return { status: "TITLE_GUARD_BLOCKED", reason: `Exact title mismatch: expected one of «${acceptedTitles.join("» or «")}», got «${state.product.title}».` };
  if (normalize(state.product.category) !== normalize(config.expectedCategory) || normalize(state.product.subcategory) !== normalize(config.expectedSubcategory)) return { status: "TITLE_GUARD_BLOCKED", reason: `Category guard mismatch: expected ${config.expectedCategory} / ${config.expectedSubcategory}, got ${state.product.category} / ${state.product.subcategory}.` };
  return { status: "OK" };
}

function existingBySemantic(values, code) { const matches = values.filter(value => semanticForDefinition(value) === code || value.code === code); if (matches.length > 1) throw new Error(`Duplicate semantic value: ${code}`); return matches[0] || null; }
function planItem(code, proposal, definitions, existing) {
  const definition = findDefinition(definitions, code); const sourceStatus = proposal?.status || "NEEDS_SOURCE";
  const item = { code, sourceStatus, value: proposal?.value ?? null, currentValue: valueOf(existing), currentId: existing?.id || null, definitionId: definition?.id || null, definitionType: definition?.data_type || null, sources: proposal?.sources || [], reason: proposal?.reason || null };
  if (sourceStatus === "READY" && definition && !compatible(definition, code)) { item.status = "SCHEMA_BLOCKED"; item.reason = `Existing definition incompatible with ${expectedDefinition(code).dataType}/${expectedDefinition(code).defaultUnit || "no unit"}.`; return item; }
  if (sourceStatus === "READY") { if (existing && sameValue(existing, item, definition)) item.status = "EXISTING_OK"; else if (existing) { item.status = "VALUE_CONFLICT"; item.reason = "Existing non-empty value differs; overwrite is forbidden."; } else item.status = "WILL_ADD"; return item; }
  if (existing && nonempty(valueOf(existing))) { item.status = "VALUE_CONFLICT"; item.reason = "A non-empty value exists while the source proposal is unresolved."; } else item.status = sourceStatus;
  return item;
}
function planBrand(config, state, existing) {
  const definition = findDefinition(state.definitions, "brand"); const attributeStatus = definition && !compatible(definition, "brand") ? "SCHEMA_BLOCKED" : existing ? (sameValue(existing, { code: "brand", value: config.brand }, definition) ? "EXISTING_OK" : "BRAND_CONFLICT") : "WILL_ADD";
  const productStatus = !nonempty(state.product.brand) ? "WILL_ADD" : normalize(state.product.brand) === normalize(config.brand) ? "EXISTING_OK" : "BRAND_CONFLICT";
  return { code: "brand", value: config.brand, currentValue: valueOf(existing), currentProductBrand: state.product.brand, currentId: existing?.id || null, definitionId: definition?.id || null, sources: config.core.brand?.sources || [], attributeStatus, productColumnStatus: productStatus, status: attributeStatus === "SCHEMA_BLOCKED" ? "SCHEMA_BLOCKED" : attributeStatus === "BRAND_CONFLICT" || productStatus === "BRAND_CONFLICT" ? "BRAND_CONFLICT" : attributeStatus === "EXISTING_OK" && productStatus === "EXISTING_OK" ? "EXISTING_OK" : "WILL_ADD" };
}

async function planProduct(db, config) {
  const state = await loadState(db, config); const guard = guardStatus(state, config);
  const row = { externalId: config.externalId, title: state.product?.title || null, productId: state.product?.id || null, category: state.product?.category || null, subcategory: state.product?.subcategory || null, identityStatus: config.identityStatus, sourceKeys: config.sourceKeys, titleCandidate: config.titleCandidate, image: { currentUrl: state.product?.image_url || null, productImagesCount: state.imageRows.length, cleanupEligible: imageValue(state.product) === DATA.SHARED_PLACEHOLDER && state.imageRows.length === 0 }, current: state.product ? { brand: state.product.brand, weight: state.product.weight, unit: state.product.unit, price: state.product.price, imageUrl: state.product.image_url, description: state.product.full_description || state.product.description || null, specsCount: state.values.length } : null, brand: null, specs: [], imageCleanup: null, notStored: ["title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "unit", "category", "subcategory", "stock_status", "product_images"] };
  if (guard.status !== "OK") { row.status = guard.status; row.guardReason = guard.reason; row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: 0, willFix: 0, existingOk: 0, needsSource: 0, schemaBlocked: 0, valueConflict: 0, brandConflict: 0, titleGuardBlocked: guard.status === "TITLE_GUARD_BLOCKED" ? 1 : 0, imageCleanup: 0 }; return row; }
  row.brand = planBrand(config, state, existingBySemantic(state.values, "brand"));
  for (const code of DATA.CORE_ORDER.filter(item => item !== "brand")) row.specs.push(planItem(code, config.core[code], state.definitions, existingBySemantic(state.values, code)));
  row.imageCleanup = { ...DATA.IMAGE_CLEANUP, status: row.image.cleanupEligible ? "ELIGIBLE" : "SKIPPED", currentValue: state.product.image_url || null, productImagesCount: state.imageRows.length };
  const all = [row.brand, ...row.specs]; const count = status => all.filter(item => item.status === status).length;
  row.status = count("VALUE_CONFLICT") || count("SCHEMA_BLOCKED") || count("BRAND_CONFLICT") || count("NEEDS_SOURCE") ? "PARTIAL" : "READY";
  row.summary = { logicalSlots: DATA.CORE_ORDER.length, willAdd: count("WILL_ADD"), willFix: count("WILL_FIX"), existingOk: count("EXISTING_OK"), needsSource: count("NEEDS_SOURCE"), schemaBlocked: count("SCHEMA_BLOCKED"), valueConflict: count("VALUE_CONFLICT"), brandConflict: count("BRAND_CONFLICT"), titleGuardBlocked: 0, imageCleanup: row.imageCleanup.status === "ELIGIBLE" ? 1 : 0 };
  return row;
}

function requiredDefinitions(rows, definitions) { const out = []; for (const row of rows) for (const item of [row.brand, ...(row.specs || [])]) if (item && item.status === "WILL_ADD" && !item.definitionId && !findDefinition(definitions, item.code)) { const def = expectedDefinition(item.code); if (def && !out.some(candidate => candidate.code === item.code)) out.push({ code: item.code, ...def }); } return out; }
async function inspectBatch(db, { only, data = DATA } = {}) {
  const selected = assertExactBatch(only || []);
  const definitions = await db.all("SELECT * FROM product_attribute_definitions", []); const rows = [];
  for (const id of selected) { const config = data.PRODUCTS.find(item => item.externalId === id); try { rows.push(await planProduct(db, config)); } catch (error) { rows.push({ externalId: id, status: "ERROR", error: error.message }); } }
  const definitionsToCreate = requiredDefinitions(rows.filter(row => !["ERROR", "TITLE_GUARD_BLOCKED"].includes(row.status)), definitions); const sum = key => rows.reduce((n, row) => n + (row.summary?.[key] || 0), 0);
  return { mode: "dry-run", rows, summary: { total: rows.length, readyProducts: rows.filter(row => row.status === "READY").length, partialProducts: rows.filter(row => row.status === "PARTIAL").length, errors: rows.filter(row => row.status === "ERROR").length, logicalSlots: sum("logicalSlots"), willAdd: sum("willAdd"), willFix: sum("willFix"), existingOk: sum("existingOk"), needsSource: sum("needsSource"), schemaBlocked: sum("schemaBlocked"), valueConflict: sum("valueConflict"), brandConflict: sum("brandConflict"), titleGuardBlocked: sum("titleGuardBlocked"), imageCleanupEligible: sum("imageCleanup"), definitionsToCreate: definitionsToCreate.length }, definitionsToCreate, sources: data.SOURCES, writableSurface: { products: PRODUCT_MUTABLE_FIELDS_EXACTLY, attributeValueCodes: DATA.CORE_ORDER, forbidden: ["title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "unit", "category", "subcategory", "stock_status", "any image table"] } };
}

async function backupDatabase(dbPath, backupDir) { const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true }); const target = path.join(dir, `matmix-before-masonry-mixes-core-batch1-${Date.now()}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target; }
async function ensureDefinition(db, definition) { const existing = await db.get("SELECT * FROM product_attribute_definitions WHERE code=?", [definition.code]); if (existing) { if (!compatible(existing, definition.code)) throw new Error(`Definition conflict: ${definition.code}`); return existing; } const now = new Date().toISOString(); const result = await db.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [definition.code, definition.label, definition.dataType, definition.defaultUnit, "Характеристики", 100, 1, now, now]); return db.get("SELECT * FROM product_attribute_definitions WHERE id=?", [result.id]); }
async function applyBatch(db, dbPath, options, data = DATA) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`); const preflight = await inspectBatch(db, { only: options.only, data });
  if (preflight.summary.errors || preflight.summary.titleGuardBlocked || preflight.summary.valueConflict || preflight.summary.brandConflict || preflight.summary.schemaBlocked) throw new Error("Apply blocked by preflight guard/conflict/schema status");
  const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    const created = new Map(); for (const definition of preflight.definitionsToCreate) { const row = await ensureDefinition(db, definition); created.set(definition.code, row.id); writes += 1; }
    const now = new Date().toISOString();
    for (const row of preflight.rows) {
      const brand = row.brand; if (brand.productColumnStatus === "WILL_ADD") { await db.run("UPDATE products SET brand=? WHERE id=? AND external_id=?", [brand.value, row.productId, row.externalId]); writes += 1; }
      if (brand.status === "WILL_ADD") { const definitionId = brand.definitionId || created.get("brand"); await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, brand.value, null, null, null, 0, now, now]); writes += 1; }
      for (const item of row.specs) { if (item.status !== "WILL_ADD" && item.status !== "WILL_FIX") continue; if (item.value === null || item.value === undefined || isPlaceholder(item.value)) throw new Error(`Unsafe placeholder write: ${row.externalId}/${item.code}`); const definitionId = item.definitionId || created.get(item.code); if (!definitionId) throw new Error(`Missing definition for ${item.code}`); const definition = await db.get("SELECT data_type,default_unit FROM product_attribute_definitions WHERE id=?", [definitionId]); const text = definition.data_type === "text" ? String(item.value) : null; const number = definition.data_type === "number" ? Number(item.value) : null; const boolean = definition.data_type === "boolean" ? (item.value ? 1 : 0) : null; if (item.currentId) await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=?,unit_override=?,updated_at=? WHERE id=?", [text, number, boolean, definition.default_unit || null, now, item.currentId]); else await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [row.productId, definitionId, text, number, boolean, definition.default_unit || null, DATA.CORE_ORDER.indexOf(item.code), now, now]); writes += 1; }
      if (options.cleanupPlaceholder && row.imageCleanup?.status === "ELIGIBLE") { const result = await db.run("UPDATE products SET image_url=NULL WHERE id=? AND external_id=? AND image_url=?", [row.productId, row.externalId, DATA.SHARED_PLACEHOLDER]); if (result.changes !== 1) throw new Error(`Placeholder cleanup guard failed: ${row.externalId}`); writes += 1; }
    }
    const post = await inspectBatch(db, { only: options.only, data }); if (post.summary.errors || post.summary.titleGuardBlocked || post.summary.valueConflict || post.summary.brandConflict || post.summary.schemaBlocked || post.summary.willAdd || post.summary.willFix) throw new Error("Postcheck failed: mandatory core is not stable"); await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function md(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, " "); }
function renderReview(report) { const lines = ["# Кладочные смеси — CORE batch 1 review", "", `Проверено: ${DATA.CHECKED_AT}. Локальный режим; production не используется.`, "", "## Scope and writable surface", "", `Только ${ALL_MATS.join(", ")}. ` + "`products.brand` и `product_attribute_values` для allowlisted core codes; `image_url` очищается только отдельным флагом и только для известного shared placeholder при отсутствии product_images.", "Title, slug, descriptions, SEO, price, weight, unit, category, subcategory, stock и image tables не являются write targets.", `CONFIRM=${CONFIRM}. Dry-run read-only; apply требует backup, transaction и exact guards.`, "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "| MAT | status | willAdd | existingOk | needsSource | conflicts | image cleanup |", "|---|---|---:|---:|---:|---:|---|"];
  for (const row of report.rows) { const s = row.summary || {}; lines.push(`| ${row.externalId} | ${row.status} | ${s.willAdd || 0} | ${s.existingOk || 0} | ${s.needsSource || 0} | ${(s.valueConflict || 0) + (s.brandConflict || 0) + (s.schemaBlocked || 0)} | ${row.imageCleanup?.status || "—"} |`); }
  lines.push("", "## Per-MAT", ""); for (const row of report.rows) { lines.push(`### ${row.externalId}`, "", `- Current title: ${md(row.title || row.error)}`, `- Title candidate: ${md(row.titleCandidate)}`, `- Brand: ${md(row.brand?.value)}`, `- Image URL: ${md(row.image?.currentUrl)}`, `- Product images: ${row.image?.productImagesCount ?? "—"}`, `- Image cleanup: ${md(row.imageCleanup?.status)} — ${md(row.imageCleanup?.reason)}`, "", "| code | proposed | current | status | source/reason |", "|---|---|---|---|---|"); for (const item of [row.brand, ...(row.specs || [])]) lines.push(`| ${item.code} | ${md(item.value)} | ${md(item.currentValue)} | ${item.status} | ${md((item.sources || []).join(", ") || item.reason)} |`); lines.push(""); }
  lines.push("## Definitions", "", `Reused: ${Object.keys(DATA.REUSABLE_DEFINITIONS).join(", ")}`, `Created on apply only: ${DATA.NEW_DEFINITIONS.map(item => item.code).join(", ")}`, "Templates: none created; frontend reads product values independently of template rows.", "", "## Title candidates", "", ...DATA.PRODUCTS.map(item => `- ${item.externalId}: ${item.expectedTitle} → ${item.titleCandidate} (review only)`), "", "## Source registry", ""); for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title}](${source.url})` : source.title} — ${source.evidence}`); return lines.join("\n") + "\n"; }

async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors || report.summary.titleGuardBlocked || report.summary.valueConflict || report.summary.brandConflict || report.summary.schemaBlocked) process.exitCode = 1; } finally { await db.close(); } }

module.exports = { ALL_MATS, CONFIRM, DATA, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, assertExactBatch, inspectBatch, openDatabase, parseArgs, renderReview, normalize, semanticForDefinition };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
