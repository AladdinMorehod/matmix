"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mix-sand-cement-repair-content-batch1");

const CONFIRM = "BACKFILL_MIX_SAND_CEMENT_REPAIR_CONTENT_BATCH1";
const ALL_MATS = Object.freeze(DATA.BATCH_MATS);
const CONTENT_FIELDS_EXACTLY = Object.freeze(["short_description", "full_description", "seo_title", "seo_description"]);
const TITLE_CORRECTION_MATS = Object.freeze(["MAT-000110", "MAT-000111"]);
const PROTECTED_TABLES = Object.freeze(["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]);
const PUBLIC_META_MARKERS = Object.freeze(["source_conflict", "needs_mapping", "not_available", "blocked_by_variant", "needs_source", "absent_by_design", "для этой карточки", "источник не подтверждает", "не подтверждено источником", "по данным источника"]);
const normalize = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const stable = value => JSON.stringify(value, Object.keys(value || {}).sort());

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, mode, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (e, row) => e ? rej(e) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (e, rows) => e ? rej(e) : res(rows))); },
                backup(target) { return new Promise((res, rej) => { try { const b = raw.backup(target); const step = () => b.step(-1, (e, done) => { if (e) return rej(e); if (done) return res(); step(); }); step(); } catch (e) { rej(e); } }); },
                close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
        });
    });
}

function normalizeOnly(value) {
    const values = Array.isArray(value) ? value : String(value ?? "").split(",");
    return values.map(item => String(item).trim());
}

function assertExactBatch(value) {
    const selected = normalizeOnly(value);
    if (selected.length !== ALL_MATS.length) throw new Error(`Exact ${ALL_MATS.length}-MAT batch required: got ${selected.length}`);
    if (selected.some(item => !item)) throw new Error("Empty MAT in --only is not allowed");
    if (new Set(selected).size !== selected.length) throw new Error("Duplicate MAT in --only is not allowed");
    if (selected.some((item, index) => item !== ALL_MATS[index])) throw new Error(`Exact canonical --only order required: ${ALL_MATS.join(",")}`);
    return selected;
}

function parseArgs(args) {
    const options = { apply: false };
    const seen = new Set();
    for (let i = 0; i < args.length; i += 1) {
        const [flag, ...tail] = String(args[i]).split("=");
        if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
        seen.add(flag);
        if (flag === "--apply" || flag === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected value: ${flag}`);
            options.apply = flag === "--apply";
            continue;
        }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${flag}`);
        options[flag.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path is required");
    if (options.only === undefined) throw new Error("Explicit --only is required");
    options.only = assertExactBatch(options.only);
    if (seen.has("--confirm") && !options.apply) throw new Error("--confirm requires --apply");
    if (options.apply && options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (options.apply && !options.backupDir) throw new Error("Apply requires explicit --backup-dir");
    return options;
}

function validateConfig(config, data = DATA) {
    const issues = [];
    if (!config || !ALL_MATS.includes(config.externalId)) issues.push("MAT outside exact batch scope");
    if (!config.expectedTitle || !config.expectedCategory || !config.expectedSubcategory) issues.push("missing exact identity guards");
    if (!Number.isFinite(config.expectedWeight) || config.expectedWeight <= 0 || !config.expectedUnit) issues.push("invalid package guard");
    for (const key of config.sourceKeys || []) if (!data.SOURCES[key]) issues.push(`missing source registry key: ${key}`);
    const configField = { short_description: "shortDescription", full_description: "fullDescription", seo_title: "seoTitle", seo_description: "seoDescription" };
    for (const field of CONTENT_FIELDS_EXACTLY) {
        const value = config[configField[field]];
        if (!nonempty(value) || value !== String(value).trim() || /[\r\n]/u.test(value) || /<[^>]+>/u.test(value)) issues.push(`invalid ${field}`);
        if (/\s{2,}/u.test(value || "")) issues.push(`duplicate whitespace in ${field}`);
        const lower = String(value || "").toLocaleLowerCase("ru-RU");
        for (const marker of PUBLIC_META_MARKERS) if (lower.includes(marker)) issues.push(`public metadata marker in ${field}: ${marker}`);
    }
    if (Array.from(config.shortDescription || "").length > 500) issues.push("short_description exceeds 500 characters");
    if (Array.from(config.fullDescription || "").length > 5000) issues.push("full_description exceeds 5000 characters");
    if (Array.from(config.seoTitle || "").length > 160) issues.push("seo_title exceeds 160 characters");
    if (Array.from(config.seoDescription || "").length > 320) issues.push("seo_description exceeds 320 characters");
    const knownFacts = new Set((config.verifiedFacts || []).map(item => item.code));
    for (const code of config.factsUsed || []) if (!knownFacts.has(code)) issues.push(`fact is not READY: ${code}`);
    if (config.titleCorrection) {
        if (!TITLE_CORRECTION_MATS.includes(config.externalId)) issues.push("title correction outside exact MAT allowlist");
        if (config.titleCorrection.expectedOldTitle !== config.expectedTitle) issues.push("title correction old-title guard must match exact historical title");
        if (!nonempty(config.titleCorrection.proposedTitle) || config.titleCorrection.proposedTitle === config.titleCorrection.expectedOldTitle) issues.push("invalid proposed title correction");
    }
    return [...new Set(issues)];
}

function validateData(data = DATA) {
    if (!Array.isArray(data.BATCH_MATS) || data.BATCH_MATS.length !== 5 || new Set(data.BATCH_MATS).size !== 5) throw new Error("Batch data must contain five unique exact MATs");
    if (data.PRODUCTS.length !== 5 || data.PRODUCTS.some((item, index) => item.externalId !== data.BATCH_MATS[index])) throw new Error("Product data must match exact canonical scope and order");
    const titleCorrectionMats = data.PRODUCTS.filter(item => item.titleCorrection).map(item => item.externalId);
    if (JSON.stringify(titleCorrectionMats) !== JSON.stringify(TITLE_CORRECTION_MATS)) throw new Error("Title corrections must target exactly MAT-000110 and MAT-000111");
    for (const config of data.PRODUCTS) {
        const issues = validateConfig(config, data);
        if (issues.length) throw new Error(`${config.externalId}: ${issues.join("; ")}`);
    }
    for (const field of ["shortDescription", "fullDescription", "seoTitle", "seoDescription"]) {
        const values = data.PRODUCTS.map(item => item[field].toLocaleLowerCase("ru-RU"));
        if (new Set(values).size !== values.length) throw new Error(`Duplicate ${field} in exact batch`);
    }
    return true;
}

function currentFields(row) { return Object.fromEntries(CONTENT_FIELDS_EXACTLY.map(field => [field, row[field] ?? null])); }
function preparedFields(config) { return { short_description: config.shortDescription, full_description: config.fullDescription, seo_title: config.seoTitle, seo_description: config.seoDescription }; }

async function inspectBatch(db, { only, data = DATA } = {}) {
    validateData(data);
    const selected = assertExactBatch(only);
    const rows = [];
    for (const externalId of selected) {
        const config = data.PRODUCTS.find(item => item.externalId === externalId);
        try {
            const issues = validateConfig(config, data);
            if (issues.length) throw new Error(issues.join("; "));
            const product = await db.get("SELECT * FROM products WHERE external_id=?", [externalId]);
            if (!product || product.external_id !== externalId) throw new Error("Product missing or external_id mismatch");
            const titleCorrectionStatus = config.titleCorrection
                ? product.title === config.titleCorrection.expectedOldTitle ? "WOULD_CORRECT" : product.title === config.titleCorrection.proposedTitle ? "EXISTING_OK" : "BLOCKED"
                : product.title === config.expectedTitle ? "NOT_IN_SCOPE" : "BLOCKED";
            if (titleCorrectionStatus === "BLOCKED") throw new Error(`Exact title guard failed: ${product.title}`);
            if (product.category !== config.expectedCategory || product.subcategory !== config.expectedSubcategory) throw new Error("Exact category/subcategory guard failed");
            if (Number(product.weight) !== config.expectedWeight || product.unit !== config.expectedUnit) throw new Error("Exact operational package guard failed");
            if (Number(product.is_active) !== 1 || product.deleted_at !== null) throw new Error("Product must be active and not deleted");
            if (!(config.allowedCurrentBrands || [null, config.expectedIdentityBrand]).includes(product.brand || null)) throw new Error(`Identity brand guard failed: ${product.brand}`);
            const proposed = preparedFields(config);
            const conflicts = CONTENT_FIELDS_EXACTLY.filter(field => nonempty(product[field]) && product[field] !== proposed[field]);
            const same = CONTENT_FIELDS_EXACTLY.every(field => product[field] === proposed[field]);
            const status = conflicts.length ? "EXISTING_CONTENT_BLOCKED" : same ? "EXISTING_OK" : "READY";
            const wouldAdd = status === "READY" ? CONTENT_FIELDS_EXACTLY.filter(field => !nonempty(product[field])).length : 0;
            rows.push({
                externalId, productId: product.id, title: product.title, category: product.category, subcategory: product.subcategory,
                identityStatus: config.identityStatus, identityBrand: config.expectedIdentityBrand, currentBrand: product.brand || null,
                titleCorrectionStatus, currentTitle: product.title, proposedTitle: config.titleCorrection?.proposedTitle || null,
                status, currentContent: currentFields(product), proposedContent: proposed, conflictingFields: conflicts,
                wouldAdd, wouldFix: 0, existingOkFields: status === "EXISTING_OK" ? CONTENT_FIELDS_EXACTLY.slice() : CONTENT_FIELDS_EXACTLY.filter(field => product[field] === proposed[field]),
                characterCounts: Object.fromEntries(CONTENT_FIELDS_EXACTLY.map(field => [field, Array.from(proposed[field]).length])),
                sourceKeys: config.sourceKeys, sourceMetadata: Object.fromEntries(config.sourceKeys.map(key => [key, data.SOURCES[key]])),
                verifiedFacts: config.verifiedFacts, factsUsed: config.factsUsed, factsOmitted: config.factsOmitted,
                titleCorrectionRecommendation: config.titleCorrection,
                immutableSnapshot: Object.fromEntries(Object.entries(product).filter(([field]) => !CONTENT_FIELDS_EXACTLY.includes(field)))
            });
        } catch (error) {
            rows.push({ externalId, title: config?.expectedTitle || null, status: "BLOCKED", error: error.message, sourceKeys: config?.sourceKeys || [] });
        }
    }
    const duplicateCounts = Object.fromEntries([["seoTitle", "seoTitle"], ["seoDescription", "seoDescription"]].map(([name, field]) => {
        const values = rows.map(row => row.proposedContent?.[field]).filter(Boolean).map(value => value.toLocaleLowerCase("ru-RU"));
        return [`duplicate${name[0].toUpperCase()}${name.slice(1)}`, values.length - new Set(values).size];
    }));
    const summary = {
        total: rows.length,
        ready: rows.filter(row => row.status === "READY").length,
        existingOk: rows.filter(row => row.status === "EXISTING_OK").length,
        wouldAdd: rows.reduce((sum, row) => sum + (row.wouldAdd || 0), 0),
        wouldFix: 0,
        plannedTitleCorrections: rows.filter(row => row.titleCorrectionStatus === "WOULD_CORRECT").length,
        existingTitleCorrections: rows.filter(row => row.titleCorrectionStatus === "EXISTING_OK").length,
        blocked: rows.filter(row => ["BLOCKED", "EXISTING_CONTENT_BLOCKED"].includes(row.status)).length,
        errors: rows.filter(row => row.status === "ERROR").length,
        duplicateSeoTitles: duplicateCounts.duplicateSeoTitle,
        duplicateSeoDescriptions: duplicateCounts.duplicateSeoDescription,
        forbiddenPublicMarkers: 0
    };
    return { mode: "dry-run", rows, summary, duplicateSeoTitles: duplicateCounts.duplicateSeoTitle, duplicateSeoDescriptions: duplicateCounts.duplicateSeoDescription, writableSurface: { productContentFields: CONTENT_FIELDS_EXACTLY, titleCorrections: { externalIds: TITLE_CORRECTION_MATS, field: "title", oldValueGuard: "exact" }, otherTables: "none" } };
}

async function snapshotTables(db) {
    const result = {};
    for (const table of PROTECTED_TABLES) result[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
    return result;
}

function assertAllowedSnapshotDelta(before, after, targets) {
    const allowedContent = new Map(targets.map(row => [Number(row.productId), row.proposedContent]));
    const allowedTitles = new Map(targets.filter(row => row.titleCorrectionStatus === "WOULD_CORRECT").map(row => [Number(row.productId), row.proposedTitle]));
    const oldProducts = new Map(before.products.map(row => [Number(row.id), row]));
    const newProducts = new Map(after.products.map(row => [Number(row.id), row]));
    if (oldProducts.size !== newProducts.size) throw new Error("Products row count changed");
    for (const [id, oldRow] of oldProducts) {
        const newRow = newProducts.get(id);
        if (!newRow) throw new Error(`Product row disappeared: ${oldRow.external_id}`);
        const expected = { ...oldRow };
        if (allowedContent.has(id)) Object.assign(expected, allowedContent.get(id));
        if (allowedTitles.has(id)) expected.title = allowedTitles.get(id);
        if (JSON.stringify(expected) !== JSON.stringify(newRow)) throw new Error(`Unexpected product field change: ${oldRow.external_id}`);
    }
    for (const table of ["product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) {
        if (JSON.stringify(before[table]) !== JSON.stringify(after[table])) throw new Error(`Protected table changed: ${table}`);
    }
}

async function backupDatabase(db, dbPath, backupDir) {
    const dir = path.resolve(backupDir);
    await fs.promises.mkdir(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-mix-sand-cement-repair-content-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}.db`);
    await db.backup(target);
    const stat = await fs.promises.stat(target);
    const verify = await openDatabase(target, false);
    try {
        const integrity = await verify.get("PRAGMA integrity_check");
        const fk = await verify.all("PRAGMA foreign_key_check");
        const version = await verify.get("PRAGMA user_version");
        if (integrity?.integrity_check !== "ok" || fk.length) throw new Error("Backup integrity/FK verification failed");
        return { path: target, size: stat.size, schemaVersion: version?.user_version ?? null, integrityCheck: integrity.integrity_check, foreignKeyViolations: fk.length, verified: true };
    } finally { await verify.close(); }
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!options.backupDir) throw new Error("Apply requires explicit --backup-dir");
    const selected = assertExactBatch(options.only);
    const preflight = await inspectBatch(db, { only: selected, data });
    if (preflight.summary.blocked || preflight.summary.errors || preflight.summary.duplicateSeoTitles || preflight.summary.duplicateSeoDescriptions) throw new Error("Content batch apply blocked by exact guard/conflict");
    const targets = preflight.rows.filter(row => row.status === "READY" || row.titleCorrectionStatus === "WOULD_CORRECT");
    if (!targets.length) return { ...preflight, mode: "apply", writes: 0, contentWrites: 0, titleCorrections: 0, backup: null };
    const backup = await backupDatabase(db, dbPath, options.backupDir);
    const before = await snapshotTables(db);
    await db.run("BEGIN IMMEDIATE");
    let contentWrites = 0;
    let titleCorrections = 0;
    try {
        const locked = await inspectBatch(db, { only: selected, data });
        if (locked.summary.blocked || locked.summary.errors || locked.summary.duplicateSeoTitles || locked.summary.duplicateSeoDescriptions || locked.summary.wouldAdd !== preflight.summary.wouldAdd || locked.summary.plannedTitleCorrections !== preflight.summary.plannedTitleCorrections) throw new Error("Content state changed after backup; apply aborted");
        for (const row of locked.rows.filter(item => item.status === "READY")) {
            for (const field of CONTENT_FIELDS_EXACTLY) {
                const column = ({ short_description: "shortDescription", full_description: "fullDescription", seo_title: "seoTitle", seo_description: "seoDescription" })[field];
                if (nonempty(row.currentContent[field])) continue;
                const result = await db.run(`UPDATE products SET ${field}=? WHERE id=? AND external_id=? AND title=? AND category=? AND subcategory=? AND weight=? AND unit=? AND is_active=1 AND deleted_at IS NULL AND (${field} IS NULL OR TRIM(${field})='')`, [row.proposedContent[field], row.productId, row.externalId, row.title, row.category, row.subcategory, row.immutableSnapshot.weight, row.immutableSnapshot.unit]);
                if (result.changes !== 1) throw new Error(`Write guard failed: ${row.externalId}.${field}`);
                contentWrites += 1;
            }
        }
        for (const row of locked.rows.filter(item => item.titleCorrectionStatus === "WOULD_CORRECT")) {
            const config = data.PRODUCTS.find(item => item.externalId === row.externalId);
            const result = await db.run("UPDATE products SET title=? WHERE id=? AND external_id=? AND title=?", [row.proposedTitle, row.productId, row.externalId, config.titleCorrection.expectedOldTitle]);
            if (result.changes !== 1) throw new Error(`Exact old-title correction guard failed: ${row.externalId}`);
            titleCorrections += 1;
        }
        const after = await snapshotTables(db);
        assertAllowedSnapshotDelta(before, after, locked.rows.filter(row => row.status === "READY" || row.titleCorrectionStatus === "WOULD_CORRECT"));
        const postflight = await inspectBatch(db, { only: selected, data });
        if (postflight.summary.ready || postflight.summary.blocked || postflight.summary.errors || postflight.summary.existingOk !== selected.length || postflight.summary.plannedTitleCorrections !== 0 || postflight.summary.existingTitleCorrections !== TITLE_CORRECTION_MATS.length) throw new Error("Postcheck did not reach exact idempotent EXISTING_OK state");
        await db.run("COMMIT");
        return { ...postflight, mode: "apply", writes: contentWrites + titleCorrections, contentWrites, titleCorrections, backup };
    } catch (error) {
        try { await db.run("ROLLBACK"); } catch {}
        throw error;
    }
}

function md(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>"); }
function renderReview(report) {
    const lines = ["# Sand/cement/repair descriptions and SEO — Batch1 review", "", `Mode: ${report.mode}. Exact MAT scope: ${ALL_MATS.join(", ")}.`, `Content writable fields: ${CONTENT_FIELDS_EXACTLY.join(", ")}. Title corrections are limited to ${TITLE_CORRECTION_MATS.join(", ")} with exact old-title guards; slugs are immutable.`, "", `Summary: ${JSON.stringify(report.summary)}`, "", "| MAT | Current title | Title correction | Status | Short / full chars | SEO title / description chars | Sources |", "|---|---|---|---|---:|---:|---|"];
    for (const row of report.rows) lines.push(`| ${row.externalId} | ${md(row.currentTitle || row.title)} | ${row.titleCorrectionStatus || "—"}${row.proposedTitle ? ` → ${md(row.proposedTitle)}` : ""} | ${row.status} | ${row.characterCounts?.short_description || 0} / ${row.characterCounts?.full_description || 0} | ${row.characterCounts?.seo_title || 0} / ${row.characterCounts?.seo_description || 0} | ${md((row.sourceKeys || []).join(", "))} |`);
    for (const row of report.rows) {
        lines.push("", `## ${row.externalId} — ${md(row.currentTitle || row.title)}`, "", `- Identity: ${row.identityStatus || "—"}; brand: ${row.identityBrand || "—"}`, `- Current content: ${md(JSON.stringify(row.currentContent || {}))}`, `- Short description: ${md(row.proposedContent?.short_description)}`, `- Full description: ${md(row.proposedContent?.full_description)}`, `- SEO title (${row.characterCounts?.seo_title || 0} chars): ${md(row.proposedContent?.seo_title)}`, `- SEO description (${row.characterCounts?.seo_description || 0} chars): ${md(row.proposedContent?.seo_description)}`, `- Title correction: ${md(row.titleCorrectionStatus === "WOULD_CORRECT" ? `${row.currentTitle} → ${row.proposedTitle}` : row.titleCorrectionStatus === "EXISTING_OK" ? `already corrected to ${row.currentTitle}` : "none")}`, `- Sources: ${md((row.sourceKeys || []).map(key => `${key} (${row.sourceMetadata?.[key]?.url || ""})`).join("; "))}`, `- Facts used: ${md((row.factsUsed || []).join(", "))}`, `- Facts intentionally omitted: ${md((row.factsOmitted || []).map(item => `${item.code}=${item.status}`).join(", "))}`, `- Status: **${row.status}**`);
    }
    lines.push("", "## Guarded write boundary", "", `- CONTENT_MUTABLE_FIELDS_EXACTLY = ${JSON.stringify(CONTENT_FIELDS_EXACTLY)}`, `- TITLE_CORRECTION_MATS_EXACTLY = ${JSON.stringify(TITLE_CORRECTION_MATS)}`, "- Title writes require the exact expected historical title. Slugs, brands, core attributes, images, category, price, weight, stock and timestamps are immutable.", `- CONFIRM = ${CONFIRM}`, "");
    return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const db = await openDatabase(options.db, options.apply);
    try {
        const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options);
        if (options.review) {
            const base = path.resolve(options.review);
            await fs.promises.mkdir(path.dirname(base), { recursive: true });
            await fs.promises.writeFile(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
            await fs.promises.writeFile(`${base}.md`, renderReview(report), "utf8");
        }
        for (const row of report.rows) console.log(JSON.stringify(row));
        console.log(JSON.stringify({ mode: report.mode, summary: report.summary, writableSurface: report.writableSurface, writes: report.writes ?? null, backup: report.backup ?? null }, null, 2));
        if (report.summary.blocked || report.summary.errors || report.summary.duplicateSeoTitles || report.summary.duplicateSeoDescriptions || report.summary.forbiddenPublicMarkers) process.exitCode = 1;
    } finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, CONTENT_FIELDS_EXACTLY, DATA, PROTECTED_TABLES, TITLE_CORRECTION_MATS, applyBatch, assertAllowedSnapshotDelta, assertExactBatch, backupDatabase, inspectBatch, normalizeOnly, openDatabase, parseArgs, renderReview, validateConfig, validateData };
if (require.main === module) main().catch(error => { console.error(`MIX CONTENT BATCH ABORTED: ${error.message}`); process.exitCode = 1; });
