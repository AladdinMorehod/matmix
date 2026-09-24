"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mixes-seo-batch1");

const CONFIRM = "BACKFILL_MIX_SEO_BATCH1";
const ALL_MATS = Object.freeze(DATA.CONFIRMED_MATS);
const SEO_MUTABLE_FIELDS_EXACTLY = Object.freeze(["seo_title", "seo_description"]);
const IMMUTABLE_FIELDS = Object.freeze([
    "title", "slug", "external_id", "brand", "price", "weight", "unit", "category", "subcategory",
    "product_group", "stock_status", "description", "short_description", "full_description", "image",
    "image_url"
]);
const PUBLIC_META_MARKERS = Object.freeze(["для этой карточки", "в источнике", "официальный источник", "needs_source", "research", "review", "schema_blocked"]);
const normalize = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
const normalizeStructure = value => normalize(value).toLocaleLowerCase("ru-RU");
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path is required");
    const resolved = path.resolve(file);
    const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, mode, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (e, rows) => e ? rej(e) : res(rows))); },
                backup(target) { return new Promise((res, rej) => { try { const backup = raw.backup(target); backup.once("error", rej); backup.step(-1); backup.finish(); res(); } catch (error) { rej(error); } }); },
                close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
        });
    });
}

function normalizeOnly(value) {
    if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
    return String(value || "").split(",").map(item => item.trim()).filter(Boolean);
}

function assertExactBatch(value) {
    const selected = normalizeOnly(value);
    if (selected.length !== ALL_MATS.length) throw new Error(`Exact 18-MAT batch required: got ${selected.length}`);
    if (new Set(selected).size !== selected.length) throw new Error("Duplicate MAT in --only is not allowed");
    if (selected.some((item, index) => item !== ALL_MATS[index])) throw new Error(`Exact canonical --only order required: ${ALL_MATS.join(",")}`);
    return selected;
}

function parseArgs(args) {
    const out = { apply: false };
    const seen = new Set();
    for (let i = 0; i < args.length; i += 1) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected value: ${key}`);
            out.apply = key === "--apply";
            continue;
        }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        out[key.slice(2)] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
    if (out.only === undefined) throw new Error("Explicit --only is required");
    out.only = assertExactBatch(out.only);
    if (seen.has("--confirm") && !out.apply) throw new Error("--confirm requires --apply");
    if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    return out;
}

function snapshot(product) { return Object.fromEntries(IMMUTABLE_FIELDS.map(field => [field, product[field] ?? null])); }
function sameSnapshot(before, after) { return IMMUTABLE_FIELDS.every(field => (before[field] ?? null) === (after[field] ?? null)); }

function validationIssues(config) {
    const issues = [];
    const title = String(config.proposedSeoTitle || "");
    const description = String(config.proposedSeoDescription || "");
    if (!title.trim() || !description.trim()) issues.push("empty SEO value");
    for (const text of [title, description]) {
        if (text !== text.trim()) issues.push("leading/trailing whitespace");
        if (/\s{2,}/u.test(text)) issues.push("duplicate spaces");
        if (/[\r\n]/u.test(text)) issues.push("embedded newline");
        const lower = text.toLocaleLowerCase("ru-RU");
        for (const marker of PUBLIC_META_MARKERS) if (lower.includes(marker)) issues.push(`public meta marker: ${marker}`);
    }
    if (Array.from(title).length > 160) issues.push("SEO title exceeds 160 characters");
    if (Array.from(description).length > 320) issues.push("SEO description exceeds 320 characters");
    return [...new Set(issues)];
}

function validateSourceKeys(data) {
    const known = new Set(Object.keys(data.SOURCES || {}));
    const dangling = data.PRODUCTS.flatMap(item => (item.sourceKeys || []).filter(key => !known.has(key)).map(key => `${item.externalId}:${key}`));
    if (dangling.length) throw new Error(`Dangling source registry keys: ${dangling.join(", ")}`);
}

async function guardProduct(db, config) {
    const product = await db.get("SELECT * FROM products WHERE external_id=?", [config.externalId]);
    if (!product || product.external_id !== config.externalId) throw new Error(`Product missing: ${config.externalId}`);
    if (product.title !== config.expectedTitle) throw new Error(`Exact title guard failed for ${config.externalId}`);
    if (normalizeStructure(product.category) !== normalizeStructure(config.expectedCategory) || normalizeStructure(product.subcategory) !== normalizeStructure(config.expectedSubcategory)) throw new Error(`Category/subcategory guard failed for ${config.externalId}`);
    if (Number(product.is_active) !== 1 || product.deleted_at) throw new Error(`Active/deleted guard failed for ${config.externalId}`);
    return product;
}

async function inspectBatch(db, { only, data = DATA } = {}) {
    validateSourceKeys(data);
    const selected = assertExactBatch(only);
    const rows = [];
    for (const externalId of selected) {
        const config = data.PRODUCTS.find(item => item.externalId === externalId);
        try {
            if (!config) throw new Error(`SEO config missing: ${externalId}`);
            const product = await guardProduct(db, config);
            const issues = validationIssues(config);
            const same = product.seo_title === config.proposedSeoTitle && product.seo_description === config.proposedSeoDescription;
            const conflict = (nonempty(product.seo_title) && product.seo_title !== config.proposedSeoTitle) || (nonempty(product.seo_description) && product.seo_description !== config.proposedSeoDescription);
            const status = issues.length ? "ERROR" : same ? "EXISTING_OK" : conflict ? "EXISTING_SEO_BLOCKED" : "READY";
            rows.push({ externalId, productId: product.id, currentTitle: product.title, category: product.category, subcategory: product.subcategory, brand: product.brand || null, currentSeoTitle: product.seo_title || null, currentSeoDescription: product.seo_description || null, proposedSeoTitle: config.proposedSeoTitle, proposedSeoDescription: config.proposedSeoDescription, seoTitleCharacterCount: Array.from(config.proposedSeoTitle).length, seoDescriptionCharacterCount: Array.from(config.proposedSeoDescription).length, sourceKeys: config.sourceKeys, factsUsed: config.factsUsed, factsIntentionallyOmitted: config.factsIntentionallyOmitted, notes: config.notes, validationIssues: issues, immutableSnapshot: snapshot(product), status });
        } catch (error) {
            rows.push({ externalId, currentTitle: config?.expectedTitle || null, proposedSeoTitle: config?.proposedSeoTitle || null, proposedSeoDescription: config?.proposedSeoDescription || null, sourceKeys: config?.sourceKeys || [], status: "ERROR", error: error.message, validationIssues: [error.message] });
        }
    }
    const titles = rows.filter(row => row.proposedSeoTitle).map(row => row.proposedSeoTitle.toLocaleLowerCase("ru-RU"));
    const descriptions = rows.filter(row => row.proposedSeoDescription).map(row => row.proposedSeoDescription.toLocaleLowerCase("ru-RU"));
    const duplicateSeoTitles = titles.length - new Set(titles).size;
    const duplicateSeoDescriptions = descriptions.length - new Set(descriptions).size;
    if (duplicateSeoTitles || duplicateSeoDescriptions) for (const row of rows) if (row.status !== "ERROR") { row.status = "ERROR"; row.validationIssues = [...row.validationIssues, "duplicate SEO copy"]; }
    return {
        mode: "dry-run", rows, sources: data.SOURCES, writableSurface: { products: SEO_MUTABLE_FIELDS_EXACTLY, forbidden: IMMUTABLE_FIELDS.concat(["product_attribute_values", "product_attribute_definitions", "product_images"]) },
        summary: { total: rows.length, ready: rows.filter(row => row.status === "READY").length, existingOk: rows.filter(row => row.status === "EXISTING_OK").length, blocked: rows.filter(row => row.status === "EXISTING_SEO_BLOCKED").length, errors: rows.filter(row => row.status === "ERROR").length, duplicateSeoTitles, duplicateSeoDescriptions }
    };
}

async function backupDatabase(db, dbPath, backupDir) {
    const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups"));
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-mix-seo-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    await db.backup(target);
    return target;
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    const preflight = await inspectBatch(db, { only: options.only, data });
    if (preflight.summary.errors || preflight.summary.blocked || preflight.summary.duplicateSeoTitles || preflight.summary.duplicateSeoDescriptions) throw new Error("SEO apply blocked by guard/conflict");
    const targets = preflight.rows.filter(row => row.status === "READY");
    if (!targets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await backupDatabase(db, dbPath, options.backupDir);
    await db.run("BEGIN IMMEDIATE");
    let writes = 0;
    try {
        for (const row of targets) {
            let changed = 0;
            if (!nonempty(row.currentSeoTitle)) {
                const result = await db.run("UPDATE products SET seo_title=? WHERE id=? AND external_id=? AND title=? AND (seo_title IS NULL OR TRIM(seo_title)='')", [row.proposedSeoTitle, row.productId, row.externalId, row.currentTitle]);
                if (result.changes !== 1) throw new Error(`SEO title write guard failed: ${row.externalId}`);
                changed = 1;
            }
            if (!nonempty(row.currentSeoDescription)) {
                const result = await db.run("UPDATE products SET seo_description=? WHERE id=? AND external_id=? AND title=? AND (seo_description IS NULL OR TRIM(seo_description)='')", [row.proposedSeoDescription, row.productId, row.externalId, row.currentTitle]);
                if (result.changes !== 1) throw new Error(`SEO description write guard failed: ${row.externalId}`);
                changed = 1;
            }
            if (changed) writes += 1;
        }
        for (const row of targets) {
            const after = await db.get("SELECT * FROM products WHERE id=? AND external_id=?", [row.productId, row.externalId]);
            if (!after || after.seo_title !== row.proposedSeoTitle || after.seo_description !== row.proposedSeoDescription || !sameSnapshot(row.immutableSnapshot, after)) throw new Error(`Postcheck failed: ${row.externalId}`);
        }
        await db.run("COMMIT");
        return { ...preflight, mode: "apply", writes, backup };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

function md(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, "<br>"); }
function renderReview(report) {
    const lines = ["# Кладочные и напольные смеси — SEO batch 1 review", "", "Изменяются только `products.seo_title` и `products.seo_description`; остальные поля товара, характеристики и изображения не записываются.", "", `SEO_MUTABLE_FIELDS_EXACTLY = ["seo_title", "seo_description"]`, `CONFIRM = ${CONFIRM}`, "", "## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "| MAT | Current title | Proposed SEO title | Proposed SEO description | Lengths | Status |", "|---|---|---|---|---|---|"];
    for (const row of report.rows) lines.push(`| ${row.externalId} | ${md(row.currentTitle)} | ${md(row.proposedSeoTitle)} | ${md(row.proposedSeoDescription)} | ${row.seoTitleCharacterCount || 0} / ${row.seoDescriptionCharacterCount || 0} | ${row.status} |`);
    lines.push("", "## Per-MAT facts", "");
    for (const row of report.rows) lines.push(`### ${row.externalId}`, "", `- Current title: ${md(row.currentTitle)}`, `- Current SEO title: ${md(row.currentSeoTitle)}`, `- Current SEO description: ${md(row.currentSeoDescription)}`, `- Proposed SEO title (${row.seoTitleCharacterCount || 0} chars): ${md(row.proposedSeoTitle)}`, `- Proposed SEO description (${row.seoDescriptionCharacterCount || 0} chars): ${md(row.proposedSeoDescription)}`, `- Source keys: ${md((row.sourceKeys || []).join(", "))}`, `- Facts used: ${md((row.factsUsed || []).join("; "))}`, `- Facts intentionally omitted: ${md((row.factsIntentionallyOmitted || []).join("; ") || "—")}`, `- Status: **${row.status}**`, "");
    lines.push("## Source registry", "");
    for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title || key}](${source.url})` : (source.title || key)}${source.owner ? ` — ${source.owner}` : ""}`);
    return lines.join("\n") + "\n";
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const db = await openDatabase(options.db, options.apply);
    try {
        const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options);
        if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); }
        for (const row of report.rows) console.log(JSON.stringify(row));
        console.log(JSON.stringify({ mode: report.mode, summary: report.summary }));
        if (report.summary.errors || report.summary.blocked || report.summary.duplicateSeoTitles || report.summary.duplicateSeoDescriptions) process.exitCode = 1;
    } finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, DATA, SEO_MUTABLE_FIELDS_EXACTLY, IMMUTABLE_FIELDS, applyBatch, assertExactBatch, inspectBatch, normalizeOnly, openDatabase, parseArgs, renderReview, validateSourceKeys, validationIssues };
if (require.main === module) main().catch(error => { console.error(`MIX SEO BATCH ABORTED: ${error.message}`); process.exitCode = 1; });
