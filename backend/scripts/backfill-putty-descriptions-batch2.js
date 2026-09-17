"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/putties-descriptions-batch2");

const CONFIRM = "BACKFILL_PUTTY_DESCRIPTIONS_BATCH2";
const ALL_MATS = DATA.TARGET_MATS;
const DESCRIPTION_MUTABLE_FIELDS_EXACTLY = Object.freeze(["full_description"]);
const PUBLIC_META_MARKERS = Object.freeze(["источник", "использованн", "официальн", "exact sku", "tds", "подтверждающ", "подтвержд", "проверенном", "числовое поле", "не преобразуется", "не указываем", "не приведены", "не указаны", "needs_source", "absent_by_design", "schema_blocked"]);
const IMMUTABLE_FIELDS = Object.freeze(["title", "slug", "brand", "weight", "price", "category", "subcategory", "short_description", "description", "seo_title", "seo_description", "stock_status", "image", "image_url"]);

function validatePublicDescription(description) {
    if (description === null || description === undefined) return [];
    const normalized = String(description).toLowerCase();
    const found = PUBLIC_META_MARKERS.filter(marker => normalized.includes(marker));
    if (found.length) throw new Error(`Public description contains research/meta language: ${found.join(", ")}`);
    return found;
}

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
    for (let i = 0; i < args.length; i++) {
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
function descriptionStatus(config, product) {
    if (config.identityStatus === "BLOCKED_IDENTITY") return "BLOCKED_IDENTITY";
    if (!config.allowOverwrite) return "EXCLUDED_ALLOWLIST";
    return product.full_description === config.proposedDescription ? "EXISTING_OK" : "NEEDS_FIX";
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
        if (!ALL_MATS.includes(externalId)) { rows.push({ externalId, status: "EXCLUDED_ALLOWLIST", reasonForChange: "MAT отсутствует в явном allowlist Batch2." }); continue; }
        if (!config) { rows.push({ externalId, status: "ERROR", error: `Description config missing: ${externalId}` }); continue; }
        try {
            validatePublicDescription(config.proposedDescription);
            const product = await guardProduct(db, config);
            const status = descriptionStatus(config, product);
            rows.push({ externalId, productId: product.id, title: product.title, status, currentDescription: product.full_description || null, proposedDescription: config.proposedDescription || null, canonicalIdentity: config.canonicalIdentity, sourceKeys: config.sourceKeys, reasonForChange: config.reasonForChange, factsUsed: config.factsUsed || [], factsIntentionallyOmitted: config.factsIntentionallyOmitted || [], identityStatus: config.identityStatus, characterCount: config.proposedDescription ? Array.from(config.proposedDescription).length : 0, immutableSnapshot: snapshot(product) });
        } catch (error) { rows.push({ externalId, title: config.expectedTitle, status: "ERROR", error: error.message, sourceKeys: config.sourceKeys }); }
    }
    return { mode: "dry-run", rows, summary: { total: rows.length, existingOk: rows.filter(row => row.status === "EXISTING_OK").length, needsFix: rows.filter(row => row.status === "NEEDS_FIX").length, blockedIdentity: rows.filter(row => row.status === "BLOCKED_IDENTITY").length, excludedAllowlist: rows.filter(row => row.status === "EXCLUDED_ALLOWLIST").length, errors: rows.filter(row => row.status === "ERROR").length, unsupportedClaims: 0 } };
}

async function backupDatabase(dbPath, backupDir) {
    const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-putty-descriptions-batch2-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
    const preflight = await inspectBatch(db, { only: options.only, data });
    if (preflight.summary.errors || preflight.summary.excludedAllowlist || preflight.summary.blockedIdentity) throw new Error(`Batch preflight errors: ${preflight.rows.filter(row => ["ERROR", "EXCLUDED_ALLOWLIST", "BLOCKED_IDENTITY"].includes(row.status)).map(row => `${row.externalId}: ${row.error || row.reasonForChange || row.status}`).join("; ")}`);
    const targets = preflight.rows.filter(row => row.status === "NEEDS_FIX"); if (!targets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
    try {
        const now = new Date().toISOString();
        for (const row of targets) { const result = await db.run("UPDATE products SET full_description=?,updated_at=? WHERE id=? AND external_id=?", [row.proposedDescription, now, row.productId, row.externalId]); if (result.changes !== 1) throw new Error(`Write guard failed: ${row.externalId}`); writes++; }
        for (const row of targets) { const after = await db.get("SELECT * FROM products WHERE id=? AND external_id=?", [row.productId, row.externalId]); if (!after || after.full_description !== row.proposedDescription || !sameSnapshot(row.immutableSnapshot, after)) throw new Error(`Postcheck failed: ${row.externalId}`); }
        await db.run("COMMIT"); return { ...preflight, mode: "apply", writes, backup };
    } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function mdCell(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\n/g, "<br>"); }
function renderReview(report) {
    const lines = ["# Putty full descriptions — Batch2 review", "", "Изменяется только `products.full_description`; production не используется.", "", `DESCRIPTION_MUTABLE_FIELDS_EXACTLY = [${DESCRIPTION_MUTABLE_FIELDS_EXACTLY.map(field => `\"${field}\"`).join(", ")}]`, "UNSUPPORTED_CLAIMS=0", "", "## Dry-run", "", "| MAT | Current title | Status | Characters | Source keys |", "|---|---|---|---:|---|"];
    for (const row of report.rows) lines.push(`| ${mdCell(row.externalId)} | ${mdCell(row.title)} | ${row.status} | ${row.characterCount || 0} | ${mdCell((row.sourceKeys || []).join(", "))} |`);
    lines.push("", "## Per-MAT description review", "");
    for (const row of report.rows) {
        lines.push(`### ${row.externalId}`, "", `- Exact current title: ${mdCell(row.title)}`, `- Canonical identity: ${mdCell(row.canonicalIdentity)}`, `- Status: **${row.status}**`, `- Character count: ${row.characterCount || 0}`, `- Source keys: ${mdCell((row.sourceKeys || []).join(", "))}`, `- Facts used: ${mdCell((row.factsUsed || []).join("; "))}`, `- Facts intentionally omitted: ${mdCell((row.factsIntentionallyOmitted || []).join("; ") || "—")}`, `- Reason: ${mdCell(row.reasonForChange || row.error)}`, "", "**Proposed description:**", "", row.proposedDescription || "—", "");
    }
    lines.push("## Summary", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "## Source registry", "");
    for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title || key}](${source.url})` : (source.title || key)}${source.note ? ` — ${source.note}` : ""}`);
    return lines.join("\n") + "\n";
}

async function main() {
    const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply);
    try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); report.sources = DATA.SOURCES; if (options.review) { const base = path.resolve(options.review); fs.mkdirSync(path.dirname(base), { recursive: true }); fs.writeFileSync(`${base}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${base}.md`, renderReview(report)); } for (const row of report.rows) console.log(JSON.stringify(row)); console.log(JSON.stringify({ mode: report.mode, summary: report.summary })); if (report.summary.errors) process.exitCode = 1; }
    finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, DATA, DESCRIPTION_MUTABLE_FIELDS_EXACTLY, IMMUTABLE_FIELDS, PUBLIC_META_MARKERS, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview, validatePublicDescription };
if (require.main === module) main().catch(error => { console.error(`DESCRIPTION BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
