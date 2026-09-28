"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/plasters-027-028-identity-fix");
const ALLOW = new Set(DATA.ATTRIBUTE_CODES);
const PRODUCT_ALLOW = new Set(DATA.PRODUCT_FIELDS);
const TYPES = Object.freeze({ brand: "text", product_type: "text", base: "text", purpose: "text", package_weight: "number", consumption_10mm: "text", wall_layer_thickness: "text", application_temperature: "text", shelf_life: "number", substrates: "text", color: "text", application_method: "text" });
const UNITS = Object.freeze({ package_weight: "кг", consumption_10mm: "кг/м²", shelf_life: "месяцев" });
const targetCodes = target => Object.keys(target.facts).filter(code => ALLOW.has(code) && target.facts[code]?.status === "READY");

function assertExactTargets(only) {
    if (!Array.isArray(only) || only.length !== DATA.TARGETS.length || only.some((id, index) => id !== DATA.TARGETS[index])) {
        throw new Error(`Exact ordered --only required: ${DATA.TARGETS.join(",")}`);
    }
    return DATA.TARGETS;
}

function parseArgs(args) {
    const options = { apply: false }; const seen = new Set();
    for (let index = 0; index < args.length; index += 1) {
        const [flag, ...tail] = String(args[index]).split("=");
        if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`); seen.add(flag);
        if (flag === "--apply" || flag === "--dry-run") { if (tail.length) throw new Error(`Unexpected value: ${flag}`); options.apply = flag === "--apply"; continue; }
        if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
        const value = tail.length ? tail.join("=") : args[++index]; if (!value || value.startsWith("--")) throw new Error(`Value required: ${flag}`);
        options[flag.slice(2)] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    if (!options.only) throw new Error("Explicit --only is required");
    options.only = options.only.split(",").map(value => value.trim()); assertExactTargets(options.only);
    if (options.apply) {
        if (options.confirm !== DATA.CONFIRM) throw new Error(`Apply requires --confirm ${DATA.CONFIRM}`);
        if (!options["backup-dir"]) throw new Error("Apply requires --backup-dir");
    } else if (options.confirm) throw new Error("--confirm requires --apply");
    return { ...options, backupDir: options["backup-dir"] };
}

function openDatabase(file, writable = false) {
    if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    const resolved = path.resolve(file); if (!fs.existsSync(resolved)) throw new Error(`Database not found: ${resolved}`);
    return new Promise((resolve, reject) => {
        const mode = writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
        const raw = new sqlite3.Database(resolved, mode, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ changes: this.changes, id: this.lastID }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
                backup(destination) {
                    return new Promise((resolve, reject) => {
                        const backup = raw.backup(destination);
                        const step = () => backup.step(-1, (error, done) => {
                            if (error) return backup.finish(() => reject(error));
                            if (done) return backup.finish(() => backup.failed ? reject(new Error("SQLite backup failed")) : resolve());
                            step();
                        });
                        step();
                    });
                },
                close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async err => { await db.close(); reject(err); });
        });
    });
}

function attrValue(row) { return row.value_text ?? row.value_number ?? row.value_boolean ?? null; }
function equalScalar(a, b) { return a === b || (a == null && b == null); }
function productMatches(product, expected) {
    return Object.entries(expected).every(([field, value]) => equalScalar(product[field], value));
}
function typedValueMatches(row, type, value) {
    const populated = [row.value_text, row.value_number, row.value_boolean].filter(item => item !== null && item !== undefined);
    if (populated.length !== 1) return false;
    if (type === "text") return row.value_text === value && row.value_number == null && row.value_boolean == null;
    if (type === "number") return row.value_number === value && row.value_text == null && row.value_boolean == null;
    return false;
}
function desiredAttribute(spec) {
    return { value: spec.value, type: spec.type || TYPES[spec.code], unit: spec.unit ?? UNITS[spec.code] ?? null };
}
function attributeMatches(row, spec) {
    const expected = desiredAttribute(spec);
    if (row.data_type !== expected.type || !typedValueMatches(row, expected.type, expected.value)) return false;
    if (Object.prototype.hasOwnProperty.call(spec, "unit")) return equalScalar(row.unit_override, spec.unit);
    return true;
}
function proposalAttributeMatches(row, code, proposal) {
    const type = TYPES[code]; const expected = proposal.value;
    if (row.data_type !== type || !typedValueMatches(row, type, expected)) return false;
    const unit = UNITS[code] ?? null;
    return equalScalar(row.unit_override, unit);
}

async function loadProduct(db, target) {
    const product = await db.get("SELECT * FROM products WHERE external_id=?", [target.externalId]);
    if (!product) throw new Error(`${target.externalId}: product missing`);
    if (product.title !== target.expectedTitle) throw new Error(`${target.externalId}: exact title guard failed`);
    if (product.slug !== target.expectedSlug) throw new Error(`${target.externalId}: exact slug guard failed`);
    if (product.weight !== target.expectedProduct.weight || product.category !== target.expectedProduct.category || product.subcategory !== target.expectedProduct.subcategory || Number(product.is_active) !== 1 || product.deleted_at != null) throw new Error(`${target.externalId}: exact product scope guard failed`);
    const attributes = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active AS definition_active,d.sort_order AS definition_sort_order
        FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        WHERE v.product_id=? ORDER BY v.id`, [product.id]);
    const codes = targetCodes(target);
    const definitions = await db.all("SELECT * FROM product_attribute_definitions WHERE code IN (" + codes.map(() => "?").join(",") + ") ORDER BY id", codes);
    return { product, attributes, definitions };
}

async function inspectBatch(db, { only } = {}) {
    assertExactTargets(only);
    const rows = [];
    for (const target of DATA.PRODUCTS) {
        try {
            const state = await loadProduct(db, target);
            const definitionsByCode = new Map();
            for (const definition of state.definitions) {
                if (definitionsByCode.has(definition.code)) throw new Error(`${target.externalId}: duplicate definition ${definition.code}`);
                definitionsByCode.set(definition.code, definition);
                if (Number(definition.is_active) !== 1 || definition.data_type !== TYPES[definition.code] || (UNITS[definition.code] && definition.default_unit !== UNITS[definition.code])) throw new Error(`${target.externalId}: incompatible active definition ${definition.code}`);
            }
            const codes = targetCodes(target);
            for (const code of codes) if (!definitionsByCode.has(code)) throw new Error(`${target.externalId}: missing existing definition ${code}; definitions are read-only`);
            const byCode = new Map();
            for (const value of state.attributes) {
                if (!ALLOW.has(value.code)) continue;
                if (byCode.has(value.code)) throw new Error(`${target.externalId}: duplicate allowlisted attribute ${value.code}`);
                byCode.set(value.code, value);
            }
            const oldProduct = productMatches(state.product, target.expectedProduct);
            const newProduct = productMatches(state.product, target.proposedProduct);
            if (!oldProduct && !newProduct) throw new Error(`${target.externalId}: exact product current/proposed state guard failed`);
            let oldAttributes = true; let newAttributes = true;
            const attrRows = [];
            for (const code of codes) {
                const current = byCode.get(code); const expectedOld = target.expectedAttributes[code]; const proposal = target.facts[code];
                if (!proposal || proposal.status !== "READY") throw new Error(`${target.externalId}: no source-backed proposal for ${code}`);
                const oldMatch = expectedOld ? Boolean(current && attributeMatches(current, { ...expectedOld, code })) : !current;
                const newMatch = Boolean(current && proposalAttributeMatches(current, code, proposal));
                oldAttributes &&= oldMatch; newAttributes &&= newMatch;
                const definition = definitionsByCode.get(code);
                attrRows.push({ code, current: current ? attrValue(current) : null, proposed: proposal.value, status: newMatch ? "EXISTING_OK" : oldMatch ? (current ? "WILL_FIX" : "WILL_ADD") : "BLOCKED", currentId: current?.id || null, definitionId: definition.id, type: definition.data_type, unit: UNITS[code] ?? null, sourceKeys: proposal.sourceKeys, sourceNote: proposal.note || null });
            }
            if (!oldAttributes && !newAttributes) throw new Error(`${target.externalId}: exact attribute old/proposed state guard failed`);
            const rowMode = oldProduct && oldAttributes ? "READY" : newProduct && newAttributes ? "EXISTING_OK" : "MIXED_STATE_BLOCKED";
            if (rowMode === "MIXED_STATE_BLOCKED") throw new Error(`${target.externalId}: partial state is not accepted; batch must be atomic`);
            rows.push({ externalId: target.externalId, title: state.product.title, slug: state.product.slug, status: rowMode, productId: state.product.id, product: { current: Object.fromEntries(DATA.PRODUCT_FIELDS.map(field => [field, state.product[field] ?? null])), proposed: target.proposedProduct }, attributes: attrRows, sources: target.sourceKeys, sourceQuality: target.sourceQuality || null, legacyTitleNote: target.legacyTitleNote || null, immutableSnapshot: state.product });
        } catch (error) {
            rows.push({ externalId: target.externalId, title: target.expectedTitle, status: "ERROR", error: error.message, sources: target.sourceKeys });
        }
    }
    const modes = new Set(rows.map(row => row.status));
    if (modes.size > 1) {
        for (const row of rows) if (row.status !== "ERROR") { row.status = "ERROR"; row.error = "Atomic exact-batch guard: all products must be in the same old or proposed state."; }
    }
    const summary = { total: rows.length, ready: rows.filter(row => row.status === "READY").length, existingOk: rows.filter(row => row.status === "EXISTING_OK").length, errors: rows.filter(row => row.status === "ERROR").length, willAdd: rows.reduce((n, row) => n + (row.attributes || []).filter(item => item.status === "WILL_ADD").length, 0), willFix: rows.reduce((n, row) => n + (row.attributes || []).filter(item => item.status === "WILL_FIX").length, 0) + rows.filter(row => row.status === "READY").reduce((n, row) => n + DATA.PRODUCT_FIELDS.filter(field => row.product.current[field] !== row.product.proposed[field]).length, 0) };
    return { mode: "dry-run", targets: DATA.TARGETS, summary, rows, sources: DATA.SOURCES, writableProductFields: DATA.PRODUCT_FIELDS, writableAttributeCodes: DATA.ATTRIBUTE_CODES, definitionsAndTemplates: "READ_ONLY" };
}

async function createBackup(dbPath, backupDir, db) {
    if (!backupDir) throw new Error("Explicit --backup-dir is required");
    const dir = path.resolve(backupDir); fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `matmix-plasters-027-028-before-${new Date().toISOString().replace(/[:.]/g, "-")}.db`);
    if (db?.backup) await db.backup(target);
    else fs.copyFileSync(path.resolve(dbPath), target);
    if (!fs.statSync(target).size) throw new Error("Backup verification failed: empty backup");
    return target;
}

async function snapshotTables(db) {
    return {
        products: await db.all("SELECT * FROM products ORDER BY id"),
        values: await db.all("SELECT * FROM product_attribute_values ORDER BY id"),
        definitions: await db.all("SELECT * FROM product_attribute_definitions ORDER BY id"),
        templates: await db.all("SELECT * FROM product_attribute_templates ORDER BY id")
    };
}
function compareAllowedSnapshots(before, after) {
    const targets = new Map(DATA.PRODUCTS.map(item => [item.externalId, item]));
    const beforeProducts = new Map(before.products.map(row => [row.external_id, row])); const afterProducts = new Map(after.products.map(row => [row.external_id, row]));
    if (before.products.length !== after.products.length) throw new Error("Immutable product set changed");
    for (const [externalId, oldRow] of beforeProducts) {
        const newRow = afterProducts.get(externalId); if (!newRow) throw new Error(`Product disappeared: ${externalId}`);
        const target = targets.get(externalId);
        for (const key of new Set([...Object.keys(oldRow), ...Object.keys(newRow)])) {
            if (target && PRODUCT_ALLOW.has(key)) {
                if (!equalScalar(newRow[key], target.proposedProduct[key])) throw new Error(`${externalId}: product postcheck ${key} failed`);
            } else if (!equalScalar(oldRow[key], newRow[key])) throw new Error(`${externalId}: immutable product field changed: ${key}`);
        }
    }
    if (before.definitions.length !== after.definitions.length || JSON.stringify(before.definitions) !== JSON.stringify(after.definitions)) throw new Error("Attribute definitions changed");
    if (before.templates.length !== after.templates.length || JSON.stringify(before.templates) !== JSON.stringify(after.templates)) throw new Error("Attribute templates changed");
    const oldVals = new Map(before.values.map(row => [row.id, row])); const newVals = new Map(after.values.map(row => [row.id, row]));
    const idToMat = new Map(before.products.map(row => [row.id, row.external_id]));
    const defCode = new Map(before.definitions.map(row => [row.id, row.code]));
    const allowedValueCols = new Set(["value_text", "value_number", "value_boolean", "unit_override"]);
    for (const [id, oldRow] of oldVals) {
        const newRow = newVals.get(id); if (!newRow) throw new Error(`Attribute value deleted: ${id}`);
        const mat = idToMat.get(oldRow.product_id); const code = defCode.get(oldRow.attribute_definition_id); const isTarget = targets.has(mat) && ALLOW.has(code);
        for (const key of new Set([...Object.keys(oldRow), ...Object.keys(newRow)])) if (!(isTarget && allowedValueCols.has(key)) && !equalScalar(oldRow[key], newRow[key])) throw new Error(`Immutable attribute field changed: ${mat}/${code}/${key}`);
    }
    for (const [id, newRow] of newVals) if (!oldVals.has(id)) {
        const mat = idToMat.get(newRow.product_id); const code = defCode.get(newRow.attribute_definition_id);
        if (!targets.has(mat) || !ALLOW.has(code)) throw new Error(`Out-of-scope attribute inserted: ${mat}/${code}`);
    }
}

async function applyBatch(db, dbPath, options) {
    assertExactTargets(options.only);
    if (options.confirm !== DATA.CONFIRM) throw new Error(`Apply requires --confirm ${DATA.CONFIRM}`);
    if (!options.backupDir) throw new Error("Apply requires --backup-dir");
    const beforePlan = await inspectBatch(db, { only: options.only });
    if (beforePlan.summary.errors) throw new Error(`Apply preflight errors: ${JSON.stringify(beforePlan.summary)}`);
    if (beforePlan.summary.existingOk === DATA.TARGETS.length) return { ...beforePlan, mode: "apply", writes: 0, backup: null };
    if (beforePlan.summary.existingOk) throw new Error(`Apply requires the complete pre-correction state: ${JSON.stringify(beforePlan.summary)}`);
    const backup = await createBackup(dbPath, options.backupDir, db);
    const before = await snapshotTables(db);
    await db.run("BEGIN IMMEDIATE");
    try {
        const lockedPlan = await inspectBatch(db, { only: options.only });
        if (lockedPlan.summary.errors || lockedPlan.summary.existingOk) throw new Error("State changed after backup; batch blocked");
        for (const target of DATA.PRODUCTS) {
            const product = lockedPlan.rows.find(row => row.externalId === target.externalId);
            for (const field of DATA.PRODUCT_FIELDS) if (product.product.current[field] !== target.proposedProduct[field]) {
                if (!PRODUCT_ALLOW.has(field)) throw new Error(`Writable product field not allowlisted: ${field}`);
                const result = await db.run(`UPDATE products SET ${field}=? WHERE id=? AND external_id=?`, [target.proposedProduct[field], product.productId, target.externalId]);
                if (result.changes !== 1) throw new Error(`Product field update count is not one: ${target.externalId}/${field}`);
            }
            for (const item of product.attributes) if (["WILL_ADD", "WILL_FIX"].includes(item.status)) {
                if (!ALLOW.has(item.code)) throw new Error(`Writable attribute not allowlisted: ${item.code}`);
                const valueText = TYPES[item.code] === "text" ? item.proposed : null;
                const valueNumber = TYPES[item.code] === "number" ? item.proposed : null;
                if (item.currentId) {
                    const result = await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=NULL,unit_override=? WHERE id=? AND product_id=?", [valueText, valueNumber, item.unit, item.currentId, product.productId]);
                    if (result.changes !== 1) throw new Error(`Attribute update count is not one: ${target.externalId}/${item.code}`);
                } else {
                    const result = await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,NULL,?,?,?,?)", [product.productId, item.definitionId, valueText, valueNumber, item.unit, 0, new Date().toISOString(), new Date().toISOString()]);
                    if (result.changes !== 1) throw new Error(`Attribute insert count is not one: ${target.externalId}/${item.code}`);
                }
            }
        }
        const after = await snapshotTables(db); compareAllowedSnapshots(before, after);
        const post = await inspectBatch(db, { only: options.only });
        if (post.summary.errors || post.summary.existingOk !== 2 || post.summary.willAdd || post.summary.willFix) throw new Error(`Postcheck is not idempotent: ${JSON.stringify(post.summary)}`);
        await db.run("COMMIT");
        return { ...post, mode: "apply", writes: beforePlan.summary.willAdd + beforePlan.summary.willFix, backup };
    } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

function renderMarkdown(report) {
    const lines = ["# Plaster identity correction — MAT-000027 / MAT-000028", "", `Mode: ${report.mode}; this task does not access production.`, "", "## Batch summary", "", "| MAT | title guard | slug guard | status | product changes | attribute changes | sources |", "|---|---|---|---|---|---|---|"];
    for (const row of report.rows) lines.push(`| ${row.externalId} | ${row.title || "—"} | ${row.slug || "—"} | ${row.status} | ${Object.entries(row.product?.proposed || {}).map(([k,v]) => `${k}: ${v}`).join("; ") || row.error || "—"} | ${(row.attributes || []).map(a => `${a.code}: ${a.current ?? "∅"} → ${a.proposed}`).join("; ") || "—"} | ${(row.sources || []).join(", ")} |`);
    lines.push("", "## Source interpretation", "", "- MAT-000027: owner packaging confirms EUROmix M-150 identity; technical details remain explicitly secondary-source-backed because no official manufacturer page was verified. Consumption 18 is only from the exact 40 kg listing and is not averaged.", "- MAT-000028: owner image plus the current official Rusean 40 kg modified plaster page confirm identity. The retained MAT title is a guard only: its ‘М-150’ is excluded from technical facts, descriptions, and SEO.", "- Rusean official page gives prose average consumption 15–17 kg/m² at 10 mm and a separate nominal table value 17; the source-faithful prose range is used without averaging.", "", "## Source registry", "");
    for (const [key, source] of Object.entries(report.sources || {})) lines.push(`- **${key}**: ${source.url ? `[${source.title}](${source.url})` : source.title}; ${source.kind}. ${source.note}`);
    lines.push("", "Definitions and templates are read-only. Titles, slugs, prices, package operational weight, categories, images, stock, and metadata are immutable.", "");
    return lines.join("\n");
}

async function main() {
    const options = parseArgs(process.argv.slice(2)); const db = await openDatabase(options.db, options.apply);
    try {
        const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, { only: options.only });
        report.sources = DATA.SOURCES; report.checkedAt = DATA.CHECKED_AT;
        if (options.review) { fs.mkdirSync(path.dirname(path.resolve(options.review)), { recursive: true }); fs.writeFileSync(`${options.review}.json`, JSON.stringify(report, null, 2) + "\n"); fs.writeFileSync(`${options.review}.md`, renderMarkdown(report)); }
        console.log(JSON.stringify({ mode: report.mode, summary: report.summary, targets: DATA.TARGETS, backup: report.backup || null }, null, 2));
        if (report.summary.errors) process.exitCode = 1;
    } finally { await db.close(); }
}

module.exports = { DATA, assertExactTargets, parseArgs, openDatabase, inspectBatch, createBackup, snapshotTables, compareAllowedSnapshots, applyBatch, renderMarkdown };
if (require.main === module) main().catch(error => { console.error(`PLASTER 027/028 CORRECTION ABORTED: ${error.message}`); process.exitCode = 1; });
