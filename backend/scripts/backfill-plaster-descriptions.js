const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/plasters-descriptions-content");

const CONFIRM = "BACKFILL_PLASTER_DESCRIPTIONS";
const ALL_MATS = Object.freeze(DATA.PRODUCTS.map(item => item.externalId));
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(path.resolve(file), mode, error => {
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
    if (out.apply && out.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
    if (out.only === undefined) throw new Error("Explicit --only is required");
    out.only = out.only.split(",").map(value => value.trim()).filter(Boolean); if (!out.only.length) throw new Error("Nonempty --only is required");
    return out;
}

async function inspectBatch(db, { only, data = DATA } = {}) {
    const selected = [...new Set(only || [])]; if (!selected.length) throw new Error("Explicit nonempty --only is required");
    const rows = [];
    for (const externalId of selected) {
        const config = data.PRODUCTS.find(item => item.externalId === externalId);
        if (!config) { rows.push({ externalId, status: "ERROR", error: `Unknown MAT: ${externalId}` }); continue; }
        const product = await db.get("SELECT id,external_id,title,full_description,description FROM products WHERE external_id=?", [externalId]);
        if (!product || product.external_id !== externalId) { rows.push({ externalId, status: "ERROR", error: `Product missing: ${externalId}` }); continue; }
        if (product.title !== config.expectedTitle) { rows.push({ externalId, title: product.title, status: "ERROR", error: `Identity mismatch: expected exact title "${config.expectedTitle}"` }); continue; }
        const current = product.full_description || product.description || null;
        if (config.blocked) { rows.push({ externalId, productId: product.id, title: product.title, status: "BLOCKED_IDENTITY", currentDescription: current, proposedDescription: null, sourceKeys: config.sourceKeys, reasonForChange: config.reasonForChange }); continue; }
        if (config.protected) { rows.push({ externalId, productId: product.id, title: product.title, status: externalId === "MAT-000005" ? "EXISTING_OK" : "EXCLUDED_PROTECTED", currentDescription: current, proposedDescription: null, sourceKeys: config.sourceKeys, reasonForChange: config.reasonForChange }); continue; }
        if (!config.allowOverwrite) { rows.push({ externalId, productId: product.id, title: product.title, status: "EXCLUDED_ALLOWLIST", currentDescription: current, proposedDescription: null, sourceKeys: config.sourceKeys, reasonForChange: "Товар отсутствует в явном allowlist description overwrite." }); continue; }
        rows.push({ externalId, productId: product.id, title: product.title, status: product.full_description === config.proposedDescription ? "EXISTING_OK" : "NEEDS_FIX", currentDescription: current, proposedDescription: config.proposedDescription, sourceKeys: config.sourceKeys, reasonForChange: config.reasonForChange });
    }
    return { mode: "dry-run", rows, summary: { total: rows.length, existingOk: rows.filter(row => row.status === "EXISTING_OK").length, needsFix: rows.filter(row => row.status === "NEEDS_FIX").length, excluded: rows.filter(row => ["EXCLUDED_PROTECTED", "BLOCKED_IDENTITY"].includes(row.status)).length, errors: rows.filter(row => row.status === "ERROR").length } };
}

async function backupDatabase(dbPath, backupDir) {
    const dir = path.resolve(backupDir || path.join(path.dirname(dbPath), "backups")); fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-before-plaster-descriptions-${new Date().toISOString().replace(/[:.]/g, "-")}.db`); fs.copyFileSync(path.resolve(dbPath), target); return target;
}

async function applyBatch(db, dbPath, options, data = DATA) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires explicit confirmation: ${CONFIRM}`);
    const preflight = await inspectBatch(db, { only: options.only, data }); if (preflight.summary.errors) throw new Error(`Batch preflight errors: ${preflight.rows.filter(row => row.error).map(row => `${row.externalId}: ${row.error}`).join("; ")}`);
    const targets = preflight.rows.filter(row => row.status === "NEEDS_FIX"); if (!targets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await backupDatabase(dbPath, options.backupDir); await db.run("BEGIN IMMEDIATE"); let writes = 0;
    try {
        const now = new Date().toISOString();
        for (const row of targets) { await db.run("UPDATE products SET full_description=?,updated_at=? WHERE id=? AND external_id=?", [row.proposedDescription, now, row.productId || (await db.get("SELECT id FROM products WHERE external_id=?", [row.externalId])).id, row.externalId]); writes++; }
        for (const row of targets) { const check = await db.get("SELECT full_description FROM products WHERE external_id=?", [row.externalId]); if (check.full_description !== row.proposedDescription) throw new Error(`Postcheck failed: ${row.externalId}`); }
        await db.run("COMMIT"); return { ...preflight, mode: "apply", writes, backup };
    } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function renderReview(report) {
    const lines = ["# Full description corrective pass — review", "", `Режим: ${report.mode}. Изменяется только products.full_description; БД рассматривается как локальный снимок.`, "", "| MAT | title | description_status | current_description_summary | proposed_description | source_keys | reason_for_change |", "|---|---|---|---|---|---|---|"];
    for (const row of report.rows) { const current = String(row.currentDescription || "—").replace(/\n/g, " ").slice(0, 180).replace(/\|/g, "\\|"); const proposed = String(row.proposedDescription || "—").replace(/\|/g, "\\|").replace(/\n/g, "<br>"); const reason = String(row.reasonForChange || row.error || "—").replace(/\|/g, "\\|"); lines.push(`| ${row.externalId} | ${row.title || "—"} | ${row.status} | ${current} | ${proposed} | ${(row.sourceKeys || []).join(", ") || "—"} | ${reason} |`); }
    lines.push("", "## Full proposed descriptions for NEEDS_FIX", ""); for (const row of report.rows.filter(item => item.status === "NEEDS_FIX")) lines.push(`### ${row.externalId} — ${row.title}`, "", row.proposedDescription, "");
    lines.push("## Summary", "", `- EXISTING_OK: ${report.summary.existingOk}`, `- NEEDS_FIX: ${report.summary.needsFix}`, `- BLOCKED/EXCLUDED: ${report.summary.excluded}`, `- ERRORS: ${report.summary.errors}`, "", "## Source registry", ""); for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title || key}](${source.url})` : (source.title || key)}${source.note ? ` — ${source.note}` : ""}`); return lines.join("\n") + "\n";
}

async function main() { const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply); try { const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options); report.sources = DATA.SOURCES; if (options.review) { fs.mkdirSync(path.dirname(path.resolve(options.review)), { recursive: true }); fs.writeFileSync(`${options.review}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${options.review}.md`, renderReview(report)); } console.log(JSON.stringify({ summary: report.summary, mode: report.mode })); if (report.summary.errors) process.exitCode = 1; } finally { await db.close(); } }

module.exports = { ALL_MATS, CONFIRM, DATA, applyBatch, inspectBatch, openDatabase, parseArgs, renderReview };
if (require.main === module) main().catch(error => { console.error(`DESCRIPTION BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
