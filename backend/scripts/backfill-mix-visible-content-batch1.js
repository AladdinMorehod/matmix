"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mix-visible-content-batch1");

const CONFIRM = "BACKFILL_MIX_VISIBLE_CONTENT_BATCH1";
const ALL_MATS = DATA.ONLY;
const VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["short_description", "full_description"]);
const PUBLIC_META_MARKERS = Object.freeze(["needs_source", "absent_by_design", "schema_blocked", "research", "review", "по данным источника", "для этой карточки", "источник не подтверждает", "не подтверждено источником"]);
const normalize = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const countChars = value => Array.from(String(value ?? "")).length;

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
                backup(target) {
                    return new Promise((resolve, reject) => {
                        try {
                            const backup = raw.backup(target);
                            const step = () => backup.step(-1, (error, done) => {
                                if (error) return reject(error);
                                if (done) return resolve();
                                step();
                            });
                            step();
                        } catch (error) { reject(error); }
                    });
                },
                close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async e => { await db.close(); reject(e); });
        });
    });
}

function normalizeOnly(value) {
    const items = Array.isArray(value) ? value : String(value ?? "").split(",");
    return items.map(item => String(item).trim());
}

function assertExactBatch(value) {
    const selected = normalizeOnly(value);
    if (selected.length !== ALL_MATS.length) throw new Error(`Exact 16-MAT batch required: got ${selected.length}`);
    if (selected.some(item => !item)) throw new Error("Empty MAT in --only is not allowed");
    if (new Set(selected).size !== selected.length) throw new Error("Duplicate MAT in --only is not allowed");
    if (selected.some((item, index) => item !== ALL_MATS[index])) throw new Error(`Exact canonical --only order required: ${ALL_MATS.join(",")}`);
    return selected;
}

function parseArgs(args) {
    const options = { apply: false };
    const seen = new Set();
    for (let index = 0; index < args.length; index += 1) {
        const [flag, ...tail] = String(args[index]).split("=");
        if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
        seen.add(flag);
        if (flag === "--apply" || flag === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected value: ${flag}`);
            options.apply = flag === "--apply";
            continue;
        }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
        const value = tail.length ? tail.join("=") : args[++index];
        if (!value || String(value).startsWith("--")) throw new Error(`Value required: ${flag}`);
        const optionName = flag.slice(2).split("-").map((part, partIndex) => partIndex ? part[0].toUpperCase() + part.slice(1) : part).join("");
        options[optionName] = value;
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

function immutableSnapshot(product) {
    return Object.fromEntries(Object.entries(product).filter(([field]) => !VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY.includes(field)));
}

function sameImmutableSnapshot(before, after) {
    return Object.keys(before).every(field => (before[field] ?? null) === (after[field] ?? null));
}

function findPublicMarkers(config) {
    const found = [];
    for (const field of VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY) {
        const text = String(config[field === "short_description" ? "shortDescription" : "fullDescription"] || "");
        const lower = text.toLocaleLowerCase("ru-RU");
        for (const marker of PUBLIC_META_MARKERS) if (lower.includes(marker)) found.push({ field, marker });
    }
    return found;
}

function duplicateValues(rows, field) {
    const byValue = new Map();
    for (const row of rows) {
        const value = normalize(row[field]);
        if (!value) continue;
        if (!byValue.has(value)) byValue.set(value, []);
        byValue.get(value).push(row.externalId);
    }
    return [...byValue].filter(([, ids]) => ids.length > 1).map(([value, externalIds]) => ({ value, externalIds }));
}

function validateConfig(config) {
    const issues = [];
    if (!nonempty(config.shortDescription) || countChars(config.shortDescription) > 500) issues.push("short_description must contain 1-500 characters");
    if (!nonempty(config.fullDescription)) issues.push("full_description is required");
    for (const [field, value] of [["shortDescription", config.shortDescription], ["fullDescription", config.fullDescription]]) {
        if (value !== String(value).trim()) issues.push(`${field} has leading/trailing whitespace`);
        if (/\s{2,}/u.test(value)) issues.push(`${field} has duplicate whitespace`);
        if (/[\r\n]/u.test(value)) issues.push(`${field} has embedded newline`);
    }
    const markers = findPublicMarkers(config);
    if (markers.length) issues.push(...markers.map(item => `public meta marker ${item.marker} in ${item.field}`));
    for (const fact of config.factsUsed || []) if (!fact.value || !fact.sourceKeys.length) issues.push(`fact is not source-backed: ${fact.code}`);
    return [...new Set(issues)];
}

async function inspectBatch(db, { only, data = DATA } = {}) {
    const selected = assertExactBatch(only);
    const rows = [];
    for (const externalId of selected) {
        const config = data.PRODUCTS.find(item => item.externalId === externalId);
        if (!config) { rows.push({ externalId, status: "ERROR", error: `Content configuration missing: ${externalId}` }); continue; }
        const configIssues = validateConfig(config);
        if (configIssues.length) { rows.push({ externalId, title: config.expectedTitle, status: "ERROR", error: configIssues.join("; "), sourceKeys: config.sourceKeys }); continue; }
        try {
            const product = await db.get("SELECT * FROM products WHERE external_id=?", [externalId]);
            if (!product || product.external_id !== externalId) throw new Error(`Product missing or external_id mismatch: ${externalId}`);
            if (product.title !== config.expectedTitle) throw new Error(`Exact title guard failed: expected "${config.expectedTitle}"`);
            if (product.category !== config.expectedCategory || product.subcategory !== config.expectedSubcategory) throw new Error(`Exact category/subcategory guard failed: expected ${config.expectedCategory}/${config.expectedSubcategory}`);
            if (Number(product.is_active) !== 1 || product.deleted_at !== null) throw new Error("Product must be active and not deleted");
            const conflicts = [];
            for (const [column, prepared] of [["short_description", config.shortDescription], ["full_description", config.fullDescription]]) {
                if (nonempty(product[column]) && product[column] !== prepared) conflicts.push(column);
            }
            const status = conflicts.length ? "EXISTING_CONTENT_BLOCKED" : ["short_description", "full_description"].every(column => product[column] === config[column === "short_description" ? "shortDescription" : "fullDescription"]) ? "EXISTING_OK" : "READY";
            rows.push({
                externalId, productId: product.id, title: product.title, status,
                currentShortDescription: product.short_description || null, currentFullDescription: product.full_description || null,
                proposedShortDescription: config.shortDescription, proposedFullDescription: config.fullDescription,
                shortDescriptionCharacterCount: countChars(config.shortDescription), fullDescriptionCharacterCount: countChars(config.fullDescription),
                sourceKeys: config.sourceKeys, sourceMetadata: Object.fromEntries(config.sourceKeys.map(key => [key, data.SOURCES?.[key] || null])), factsUsed: config.factsUsed, factsOmitted: config.factsOmitted,
                conflictingFields: conflicts, immutableSnapshot: immutableSnapshot(product)
            });
        } catch (error) {
            rows.push({ externalId, title: config.expectedTitle, status: "BLOCKED", error: error.message, sourceKeys: config.sourceKeys, factsUsed: config.factsUsed, factsOmitted: config.factsOmitted });
        }
    }
    const duplicateShortDescriptions = duplicateValues(rows.filter(row => row.proposedShortDescription), "proposedShortDescription");
    const duplicateFullDescriptions = duplicateValues(rows.filter(row => row.proposedFullDescription), "proposedFullDescription");
    const forbiddenPublicMarkers = rows.flatMap(row => {
        const config = data.PRODUCTS.find(item => item.externalId === row.externalId);
        return config ? findPublicMarkers(config).map(marker => ({ externalId: row.externalId, ...marker })) : [];
    });
    const summary = {
        total: rows.length,
        ready: rows.filter(row => row.status === "READY").length,
        existingOk: rows.filter(row => row.status === "EXISTING_OK").length,
        blocked: rows.filter(row => ["BLOCKED", "EXISTING_CONTENT_BLOCKED"].includes(row.status)).length,
        errors: rows.filter(row => row.status === "ERROR").length,
        duplicateShortDescriptions: duplicateShortDescriptions.length,
        duplicateFullDescriptions: duplicateFullDescriptions.length,
        forbiddenPublicMarkers: forbiddenPublicMarkers.length
    };
    return { mode: "dry-run", rows, summary, duplicateShortDescriptions, duplicateFullDescriptions, forbiddenPublicMarkers };
}

async function backupDatabase(db, dbPath, backupDir) {
    if (!backupDir) throw new Error("Explicit custom backup directory is required");
    const directory = path.resolve(backupDir);
    fs.mkdirSync(directory, { recursive: true });
    const target = path.join(directory, `matmix-before-mix-visible-content-batch1-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    await db.backup(target);
    return target;
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!options.backupDir) throw new Error("Apply requires explicit --backup-dir");
    const only = assertExactBatch(options.only);
    const preflight = await inspectBatch(db, { only, data });
    if (preflight.summary.blocked || preflight.summary.errors || preflight.summary.duplicateShortDescriptions || preflight.summary.duplicateFullDescriptions || preflight.summary.forbiddenPublicMarkers) throw new Error("Visible content batch apply blocked by preflight review");
    const initialTargets = preflight.rows.filter(row => row.status === "READY");
    if (!initialTargets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await backupDatabase(db, dbPath, options.backupDir);
    await db.run("BEGIN IMMEDIATE");
    let writes = 0;
    try {
        const checked = await inspectBatch(db, { only, data });
        if (checked.summary.blocked || checked.summary.errors || checked.summary.duplicateShortDescriptions || checked.summary.duplicateFullDescriptions || checked.summary.forbiddenPublicMarkers) throw new Error("Visible content batch changed after backup; apply aborted");
        for (const row of checked.rows.filter(item => item.status === "READY")) {
            for (const [column, value] of [["short_description", row.proposedShortDescription], ["full_description", row.proposedFullDescription]]) {
                const current = column === "short_description" ? row.currentShortDescription : row.currentFullDescription;
                if (nonempty(current)) continue;
                const result = await db.run(`UPDATE products SET ${column}=? WHERE id=? AND external_id=? AND title=? AND category=? AND subcategory=? AND is_active=1 AND deleted_at IS NULL AND (${column} IS NULL OR TRIM(${column})='')`, [value, row.productId, row.externalId, row.title, row.immutableSnapshot.category, row.immutableSnapshot.subcategory]);
                if (result.changes !== 1) throw new Error(`Write guard failed: ${row.externalId}.${column}`);
                writes += 1;
            }
        }
        for (const row of checked.rows) {
            const after = await db.get("SELECT * FROM products WHERE id=? AND external_id=?", [row.productId, row.externalId]);
            if (!after || after.short_description !== row.proposedShortDescription || after.full_description !== row.proposedFullDescription || !sameImmutableSnapshot(row.immutableSnapshot, after)) throw new Error(`Postcheck failed: ${row.externalId}`);
        }
        const postflight = await inspectBatch(db, { only, data });
        if (postflight.summary.ready || postflight.summary.blocked || postflight.summary.errors || postflight.summary.existingOk !== ALL_MATS.length) throw new Error("Postcheck did not reach idempotent EXISTING_OK state");
        await db.run("COMMIT");
        return { ...postflight, mode: "apply", writes, backup };
    } catch (error) {
        try { await db.run("ROLLBACK"); } catch {}
        throw error;
    }
}

function mdCell(value) { return String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>"); }

function renderReview(report) {
    const lines = ["# Mix visible content — Batch1 review", "", `Mode: ${report.mode}. Writable fields: ${VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY.join(", ")}.`, "", `Summary: ${JSON.stringify(report.summary)}`, "", "| MAT | Status | Short chars | Full chars | Source keys |", "|---|---|---:|---:|---|"];
    for (const row of report.rows) lines.push(`| ${row.externalId} | ${row.status} | ${row.shortDescriptionCharacterCount || 0} | ${row.fullDescriptionCharacterCount || 0} | ${mdCell((row.sourceKeys || []).join(", "))} |`);
    for (const row of report.rows) {
        lines.push("", `## ${row.externalId} — ${mdCell(row.title)}`, "", `- Current short_description: ${mdCell(row.currentShortDescription)}`, `- Current full_description: ${mdCell(row.currentFullDescription)}`, `- Proposed short_description (${row.shortDescriptionCharacterCount || 0} chars): ${mdCell(row.proposedShortDescription)}`, `- Proposed full_description (${row.fullDescriptionCharacterCount || 0} chars): ${mdCell(row.proposedFullDescription)}`, `- Source keys: ${mdCell((row.sourceKeys || []).join(", "))}`, `- Source metadata: ${mdCell(Object.entries(row.sourceMetadata || {}).map(([key, value]) => `${key}: ${value?.title || "no title"} ${value?.url || ""}`).join("; "))}`, `- Facts used: ${mdCell((row.factsUsed || []).map(fact => `${fact.code}=${fact.value}`).join("; "))}`, `- Facts intentionally omitted: ${mdCell((row.factsOmitted || []).map(fact => `${fact.code || "note"}: ${fact.reason}`).join("; "))}`, `- Status: **${row.status}**`);
    }
    lines.push("", "## Duplicate copy and public metadata checks", "", `- Duplicate short descriptions: ${report.duplicateShortDescriptions.length}`, `- Duplicate full descriptions: ${report.duplicateFullDescriptions.length}`, `- Forbidden/public meta markers: ${report.forbiddenPublicMarkers.length}`, "");
    return `${lines.join("\n")}\n`;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const db = await openDatabase(options.db, options.apply);
    try {
        const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options);
        if (options.review) {
            const base = path.resolve(options.review);
            fs.mkdirSync(path.dirname(base), { recursive: true });
            await fs.promises.writeFile(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
            await fs.promises.writeFile(`${base}.md`, renderReview(report), "utf8");
        }
        for (const row of report.rows) console.log(JSON.stringify(row));
        console.log(JSON.stringify({ mode: report.mode, summary: report.summary, backup: report.backup || null }));
        if (report.summary.errors || report.summary.blocked || report.summary.duplicateShortDescriptions || report.summary.duplicateFullDescriptions || report.summary.forbiddenPublicMarkers) process.exitCode = 1;
    } finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, DATA, VISIBLE_CONTENT_MUTABLE_FIELDS_EXACTLY, PUBLIC_META_MARKERS, applyBatch, assertExactBatch, backupDatabase, immutableSnapshot, inspectBatch, normalizeOnly, openDatabase, parseArgs, renderReview, sameImmutableSnapshot, validateConfig };
if (require.main === module) main().catch(error => { console.error(`MIX VISIBLE CONTENT BATCH ABORTED: ${error.message}`); process.exitCode = 1; });
