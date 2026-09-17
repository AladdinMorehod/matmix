"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/putties-seo");

const CONFIRM = "BACKFILL_PUTTY_SEO";
const ALL_MATS = DATA.TARGET_MATS;
const SEO_MUTABLE_FIELDS_EXACTLY = Object.freeze(["seo_title", "seo_description"]);
const IMMUTABLE_FIELDS = Object.freeze(["title", "slug", "brand", "weight", "price", "category", "subcategory", "short_description", "description", "full_description", "stock_status", "image", "image_url"]);
const PUBLIC_META_MARKERS = Object.freeze(["источник", "использованн", "официальн", "exact sku", "tds", "подтверждающ", "подтвержд", "needs_source", "absent_by_design", "schema_blocked", "research", "review", "source metadata", "source key"]);
const FORBIDDEN_SALES_MARKERS = Object.freeze(["лучшая цена", "самая низкая цена", "дешево", "дёшево", "в наличии", "со склада", "сегодня", "завтра", "срочная доставка", "скидка", "гарантируем", "официальный дилер", "100% оригинал", "бесплатная доставка"]);
const LENGTH_GUIDELINE = "SEO title: непустой, не более 65 символов; ориентир 45–65 — мягкая рекомендация, короткие 42–43 символа допускаются для полного названия. SEO description: ориентир 120–170 символов.";

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    const resolved = path.resolve(file);
    const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, mode, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : resolveRow(res, rej, e, row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (e, rows) => e ? rej(e) : res(rows))); },
                close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
        });
    });
}
function resolveRow(resolve, reject, error, row) { return error ? reject(error) : resolve(row); }

function parseArgs(args) {
    const out = { apply: false }; const seen = new Set();
    for (let i = 0; i < args.length; i += 1) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`); seen.add(key);
        if (key === "--apply" || key === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${key}`); out.apply = key === "--apply"; continue; }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`); out[key.slice(2)] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
    if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
    if (out.only === undefined) throw new Error("Explicit --only is required");
    out.only = out.only.split(",").map(value => value.trim()).filter(Boolean); if (!out.only.length) throw new Error("Nonempty --only is required");
    if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    return out;
}

function snapshot(product) { return Object.fromEntries(IMMUTABLE_FIELDS.map(field => [field, product[field] ?? null])); }
function sameSnapshot(before, after) { return IMMUTABLE_FIELDS.every(field => (before[field] ?? null) === (after[field] ?? null)); }
function normalize(value) { return String(value ?? "").replace(/\s+/gu, " ").trim(); }
function validationIssues(config) {
    const issues = [];
    const values = [config.proposedSeoTitle, config.proposedSeoDescription];
    if (values.some(value => !String(value || "").trim())) issues.push("empty SEO value");
    for (const value of values) {
        const text = String(value || "");
        if (text !== text.trim()) issues.push("leading/trailing whitespace");
        if (/\s{2,}/u.test(text)) issues.push("duplicate spaces");
        if (/[\r\n]/u.test(text)) issues.push("embedded newline");
        const lower = text.toLowerCase();
        issues.push(...PUBLIC_META_MARKERS.filter(marker => lower.includes(marker)).map(marker => `public meta marker: ${marker}`));
        issues.push(...FORBIDDEN_SALES_MARKERS.filter(marker => lower.includes(marker)).map(marker => `unsupported sales claim: ${marker}`));
    }
    if (Array.from(config.proposedSeoTitle).length > 65) issues.push("SEO title exceeds 65-character guideline");
    if (Array.from(config.proposedSeoDescription).length < 120 || Array.from(config.proposedSeoDescription).length > 170) issues.push("SEO description outside 120–170-character guideline");
    return [...new Set(issues)];
}

async function guardProduct(db, config) {
    const product = await db.get("SELECT * FROM products WHERE external_id=?", [config.externalId]);
    if (!product || product.external_id !== config.externalId) throw new Error(`Product missing: ${config.externalId}`);
    if (product.title !== config.expectedTitle) throw new Error(`Identity mismatch: expected exact title "${config.expectedTitle}"`);
    if (product.category !== "Смеси" || product.subcategory !== "Шпаклевка") throw new Error(`Category guard failed: ${config.externalId}`);
    if (Number(product.is_active) !== 1 || product.deleted_at !== null) throw new Error(`Active/deleted guard failed: ${config.externalId}`);
    const structure = await db.get(`SELECT c.external_code AS category_code, s.external_code AS subcategory_code
      FROM catalog_structure s JOIN catalog_structure c ON c.id=s.parent_id
      WHERE s.name=? AND c.name=? AND s.external_code=? AND c.external_code=?`, [product.subcategory, product.category, "SUB-000003", "CAT-000001"]);
    if (!structure) throw new Error(`CAT/SUB structure guard failed: ${config.externalId}`);
    if (config.expectedWeight !== undefined && Number(product.weight) !== Number(config.expectedWeight)) throw new Error(`Weight guard failed: ${config.externalId}`);
    return product;
}

async function inspectBatch(db, { only, data = DATA } = {}) {
    const selected = [...new Set(only || [])]; if (!selected.length) throw new Error("Explicit nonempty --only is required");
    const rows = [];
    for (const externalId of selected) {
        const config = data.PRODUCTS.find(item => item.externalId === externalId);
        if (!ALL_MATS.includes(externalId)) { rows.push({ externalId, status: "EXCLUDED_ALLOWLIST", reason: "MAT отсутствует в явном allowlist SEO corrective." }); continue; }
        if (!config) { rows.push({ externalId, status: "ERROR", error: `SEO config missing: ${externalId}` }); continue; }
        try {
            const issues = validationIssues(config);
            const product = await guardProduct(db, config);
            const status = issues.length ? "ERROR" : (product.seo_title === config.proposedSeoTitle && product.seo_description === config.proposedSeoDescription ? "EXISTING_OK" : "NEEDS_FIX");
            rows.push({ externalId, productId: product.id, currentTitle: product.title, title: product.title, slug: product.slug || null, brand: product.brand || null, weight: product.weight, category: product.category, subcategory: product.subcategory, currentFullDescription: product.full_description || null, currentSeoTitle: product.seo_title || null, currentSeoDescription: product.seo_description || null, proposedSeoTitle: config.proposedSeoTitle, proposedSeoDescription: config.proposedSeoDescription, seoTitleCharacterCount: Array.from(config.proposedSeoTitle).length, seoDescriptionCharacterCount: Array.from(config.proposedSeoDescription).length, canonicalIdentity: config.canonicalIdentity, sourceKeys: config.sourceKeys, factsUsed: config.factsUsed || [], factsIntentionallyOmitted: config.factsIntentionallyOmitted || [], identityStatus: config.identityStatus, titleIssues: config.titleIssues || [], slugIssues: config.slugIssues || [], validationIssues: issues, immutableSnapshot: snapshot(product), status });
        } catch (error) { rows.push({ externalId, title: config.expectedTitle, currentTitle: config.expectedTitle, status: "ERROR", error: error.message, sourceKeys: config.sourceKeys, titleIssues: config.titleIssues || [], slugIssues: config.slugIssues || [] }); }
    }
    const seoTitles = rows.filter(row => row.proposedSeoTitle).map(row => row.proposedSeoTitle.toLocaleLowerCase("ru-RU").trim());
    const seoDescriptions = rows.filter(row => row.proposedSeoDescription).map(row => row.proposedSeoDescription.toLocaleLowerCase("ru-RU").trim());
    const duplicateSeoTitles = seoTitles.length - new Set(seoTitles).size;
    const duplicateSeoDescriptions = seoDescriptions.length - new Set(seoDescriptions).size;
    const unsupportedClaims = rows.reduce((sum, row) => sum + (row.validationIssues || []).filter(issue => issue.startsWith("unsupported sales claim")).length, 0);
    const publicMetaLanguageCount = rows.reduce((sum, row) => sum + (row.validationIssues || []).filter(issue => issue.startsWith("public meta marker")).length, 0);
    if (duplicateSeoTitles || duplicateSeoDescriptions) for (const row of rows) if (row.status !== "ERROR") row.status = "ERROR";
    return { mode: "dry-run", rows, sources: DATA.SOURCES, lengthGuideline: LENGTH_GUIDELINE, summary: { total: rows.length, existingOk: rows.filter(row => row.status === "EXISTING_OK").length, needsFix: rows.filter(row => row.status === "NEEDS_FIX").length, blockedIdentity: rows.filter(row => row.status === "BLOCKED_IDENTITY").length, excludedAllowlist: rows.filter(row => row.status === "EXCLUDED_ALLOWLIST").length, errors: rows.filter(row => row.status === "ERROR").length, duplicateSeoTitles, duplicateSeoDescriptions, unsupportedClaims, publicMetaLanguageCount } };
}

async function backupDatabase(dbPath, backupDir) {
    const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-putty-seo-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
    const preflight = await inspectBatch(db, { only: options.only, data });
    if (preflight.summary.errors || preflight.summary.excludedAllowlist || preflight.summary.blockedIdentity || preflight.summary.duplicateSeoTitles || preflight.summary.duplicateSeoDescriptions) throw new Error("SEO batch preflight failed");
    const targets = preflight.rows.filter(row => row.status === "NEEDS_FIX"); if (!targets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
    try {
        const now = new Date().toISOString();
        for (const row of targets) { const result = await db.run("UPDATE products SET seo_title=?,seo_description=?,updated_at=? WHERE id=? AND external_id=?", [row.proposedSeoTitle, row.proposedSeoDescription, now, row.productId, row.externalId]); if (result.changes !== 1) throw new Error(`Write guard failed: ${row.externalId}`); writes++; }
        for (const row of targets) { const after = await db.get("SELECT * FROM products WHERE id=? AND external_id=?", [row.productId, row.externalId]); if (!after || after.seo_title !== row.proposedSeoTitle || after.seo_description !== row.proposedSeoDescription || !sameSnapshot(row.immutableSnapshot, after)) throw new Error(`Postcheck failed: ${row.externalId}`); }
        await db.run("COMMIT"); return { ...preflight, mode: "apply", writes, backup };
    } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function mdCell(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, "<br>"); }
function renderReview(report) {
    const lines = ["# Putty SEO — unified category review", "", "Изменяются только `products.seo_title` и `products.seo_description`; production не используется.", "", "SEO_MUTABLE_FIELDS_EXACTLY = [\"seo_title\", \"seo_description\"]", `CONFIRM = ${CONFIRM}`, "", "## Length policy", "", report.lengthGuideline || LENGTH_GUIDELINE, "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "## Dry-run", "", "| MAT | Current title | Status | SEO title chars | SEO description chars |", "|---|---|---|---:|---:|"];
    for (const row of report.rows) lines.push(`| ${mdCell(row.externalId)} | ${mdCell(row.currentTitle || row.title)} | ${row.status} | ${row.seoTitleCharacterCount || 0} | ${row.seoDescriptionCharacterCount || 0} |`);
    lines.push("", "## Per-MAT review", "");
    for (const row of report.rows) {
        lines.push(`### ${row.externalId}`, "", `- Current title: ${mdCell(row.currentTitle || row.title)}`, `- Slug: ${mdCell(row.slug)}`, `- Category / subcategory: ${mdCell(row.category)} / ${mdCell(row.subcategory)}`, `- Brand: ${mdCell(row.brand)}`, `- Weight: ${mdCell(row.weight)}`, `- Current full_description: ${mdCell(row.currentFullDescription)}`, `- Current SEO title: ${mdCell(row.currentSeoTitle)}`, `- Current SEO description: ${mdCell(row.currentSeoDescription)}`, `- Proposed SEO title (${row.seoTitleCharacterCount || 0} chars):`, "", row.proposedSeoTitle || "—", "", `- Proposed SEO description (${row.seoDescriptionCharacterCount || 0} chars):`, "", row.proposedSeoDescription || "—", "", `- Source keys: ${mdCell((row.sourceKeys || []).join(", "))}`, `- Facts used: ${mdCell((row.factsUsed || []).join("; "))}`, `- Facts intentionally omitted: ${mdCell((row.factsIntentionallyOmitted || []).join("; ") || "—")}`, `- Title issues (report only): ${mdCell((row.titleIssues || []).join("; ") || "—")}`, `- Slug issues (report only): ${mdCell((row.slugIssues || []).join("; ") || "—")}`, `- Identity status: ${mdCell(row.identityStatus)}`, `- Status: **${row.status}**`, "");
    }
    lines.push("## Source registry", "");
    for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title || key}](${source.url})` : (source.title || key)}${source.note ? ` — ${source.note}` : ""}`);
    return lines.join("\n") + "\n";
}

async function main() {
    const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply);
    try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors || report.summary.duplicateSeoTitles || report.summary.duplicateSeoDescriptions) process.exitCode = 1; }
    finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, DATA, SEO_MUTABLE_FIELDS_EXACTLY, IMMUTABLE_FIELDS, PUBLIC_META_MARKERS, FORBIDDEN_SALES_MARKERS, LENGTH_GUIDELINE, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview, validationIssues };
if (require.main === module) main().catch(error => { console.error(`PUTTY SEO BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
