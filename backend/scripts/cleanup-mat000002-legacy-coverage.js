"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");

const CONFIRM_TOKEN = "CLEANUP_MAT000002_LEGACY_COVERAGE";
const TARGET = Object.freeze({
    externalId: "MAT-000002",
    title: "Штукатурка гипсовая Knauf Ротбанд 30 кг",
    brand: "KNAUF",
    category: "Смеси",
    subcategory: "Штукатурка",
    code: "coverage_30kg_10mm",
    label: "Площадь мешка 30 кг при слое 10 мм",
    dataType: "number",
    valueText: null,
    valueNumber: 3.5,
    valueBoolean: null,
    unitOverride: "м²",
    retainedCode: "consumption_10mm",
    retainedValueText: "8,5",
    retainedUnitOverride: "кг/м²"
});
const SNAPSHOT_TABLES = Object.freeze([
    ["products", "id"],
    ["product_attribute_values", "id"],
    ["product_attribute_definitions", "id"],
    ["product_attribute_templates", "id"]
]);

function normalize(value) { return String(value ?? "").normalize("NFKC").trim().replace(/\s+/gu, " "); }
function exactCanonicalContract(canonical = CANONICAL) {
    const categories = Array.isArray(canonical?.categories) ? canonical.categories.filter(item => item?.name === TARGET.subcategory) : [];
    if (categories.length !== 1) return { ok: false, reason: "Canonical Штукатурка category must occur exactly once" };
    const category = categories[0];
    if (Number(category.structureId) !== 2) return { ok: false, reason: "Canonical Штукатурка structure ID must remain 2" };
    const removeCodes = Array.isArray(category.removeCodes) ? category.removeCodes : [];
    const codes = Array.isArray(category.codes) ? category.codes : [];
    if (!removeCodes.includes(TARGET.code) || codes.includes(TARGET.code)) {
        return { ok: false, reason: "Canonical removeCodes contract does not explicitly remove coverage_30kg_10mm" };
    }
    if (!codes.includes(TARGET.retainedCode)) return { ok: false, reason: "Canonical plaster template no longer includes consumption_10mm" };
    return { ok: true, category };
}

function parseArgs(args) {
    const options = { apply: false, db: null, only: null, confirm: null, backupDir: null };
    const seen = new Set();
    for (let i = 0; i < args.length; i += 1) {
        const [key, ...tail] = String(args[i]).split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--only", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || String(value).startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    if (normalize(options.only) !== TARGET.externalId) throw new Error(`Exact --only ${TARGET.externalId} is required`);
    options.only = TARGET.externalId;
    if (options.apply) {
        if (options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
        if (!options.backupDir) throw new Error("Apply requires --backup-dir");
    } else if (options.confirm || options.backupDir) {
        throw new Error("--confirm and --backup-dir are valid only with --apply");
    }
    return options;
}

function openDatabase(file, readOnly = true) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, readOnly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE, async error => {
            if (error) return reject(error);
            const db = {
                raw,
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
                close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
            };
            try {
                await db.run("PRAGMA foreign_keys=ON");
                if (readOnly) await db.run("PRAGMA query_only=ON");
                resolve(db);
            } catch (err) { await db.close(); reject(err); }
        });
    });
}

async function tableColumns(db, table) {
    return new Set((await db.all(`PRAGMA table_info(${table})`)).map(row => row.name));
}

async function schemaGuard(db) {
    const required = {
        products: ["id", "external_id", "title", "brand", "category", "subcategory"],
        product_attribute_values: ["id", "product_id", "attribute_definition_id", "value_text", "value_number", "value_boolean", "unit_override"],
        product_attribute_definitions: ["id", "code", "label", "data_type"],
        product_attribute_templates: ["id", "structure_id", "attribute_definition_id"]
    };
    for (const [table, needed] of Object.entries(required)) {
        const exists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [table]);
        if (!exists) return `Required table is missing: ${table}`;
        const actual = await tableColumns(db, table);
        const missing = needed.filter(column => !actual.has(column));
        if (missing.length) return `Required ${table} columns are missing: ${missing.join(",")}`;
    }
    return null;
}

async function rowsByCode(db, productId, definitionId, code) {
    return db.all(`SELECT v.*, d.code AS definition_code, d.label AS definition_label, d.data_type AS definition_data_type
        FROM product_attribute_values v
        JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        WHERE v.product_id=? AND d.id=? AND d.code=? ORDER BY v.id`, [productId, definitionId, code]);
}

async function planCleanup(db, canonical = CANONICAL) {
    const contract = exactCanonicalContract(canonical);
    if (!contract.ok) return { status: "BLOCKED", reason: contract.reason };
    const schemaError = await schemaGuard(db);
    if (schemaError) return { status: "BLOCKED", reason: schemaError };

    const products = await db.all("SELECT * FROM products WHERE external_id=? ORDER BY id", [TARGET.externalId]);
    if (products.length !== 1) return { status: "BLOCKED", reason: `Expected one ${TARGET.externalId} product, found ${products.length}` };
    const product = products[0];
    if (product.external_id !== TARGET.externalId || product.title !== TARGET.title || product.brand !== TARGET.brand
        || product.category !== TARGET.category || product.subcategory !== TARGET.subcategory) {
        return { status: "BLOCKED", reason: "Exact MAT/title/brand/category identity guard failed", product };
    }

    const obsoleteDefinitions = await db.all("SELECT * FROM product_attribute_definitions WHERE code=? ORDER BY id", [TARGET.code]);
    if (obsoleteDefinitions.length > 1) return { status: "BLOCKED", reason: `Duplicate legacy definitions found: ${obsoleteDefinitions.length}` };
    const obsoleteDefinition = obsoleteDefinitions[0] || null;

    const templates = await db.all(`SELECT t.id,t.structure_id,t.attribute_definition_id,d.code
        FROM product_attribute_templates t
        LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
        WHERE t.structure_id=? AND d.code=? ORDER BY t.id`, [Number(contract.category.structureId), TARGET.code]);
    if (templates.length) return { status: "BLOCKED", reason: "Legacy code is still present in the Штукатурка template; value cleanup alone is unsafe", templateRows: templates };

    const obsoleteRows = obsoleteDefinition ? await rowsByCode(db, product.id, obsoleteDefinition.id, TARGET.code) : [];
    if (obsoleteRows.length > 1) return { status: "BLOCKED", reason: `Duplicate legacy value rows found: ${obsoleteRows.length}`, rows: obsoleteRows };

    const consumptionDefinitions = await db.all("SELECT * FROM product_attribute_definitions WHERE code=? ORDER BY id", [TARGET.retainedCode]);
    if (consumptionDefinitions.length !== 1) return { status: "BLOCKED", reason: `Expected one ${TARGET.retainedCode} definition, found ${consumptionDefinitions.length}` };
    const consumptionDefinition = consumptionDefinitions[0];
    if (consumptionDefinition.data_type !== "text") return { status: "BLOCKED", reason: `${TARGET.retainedCode} definition must be text`, definition: consumptionDefinition };
    const consumptionRows = await rowsByCode(db, product.id, consumptionDefinition.id, TARGET.retainedCode);
    if (consumptionRows.length !== 1) return { status: "BLOCKED", reason: `Expected one canonical ${TARGET.retainedCode} value, found ${consumptionRows.length}`, rows: consumptionRows };
    const consumption = consumptionRows[0];
    if (consumption.value_text !== TARGET.retainedValueText || consumption.value_number !== null || consumption.value_boolean !== null
        || consumption.unit_override !== TARGET.retainedUnitOverride) {
        return { status: "BLOCKED", reason: "Canonical consumption_10mm value/unit guard failed", consumption };
    }

    if (!obsoleteRows.length) {
        return { status: "EXISTING_OK", product, obsoleteDefinition, consumption, canonicalCategory: contract.category.name };
    }
    if (obsoleteDefinition.label !== TARGET.label || obsoleteDefinition.data_type !== TARGET.dataType) {
        return { status: "BLOCKED", reason: "Exact legacy definition label/type guard failed", definition: obsoleteDefinition };
    }
    const row = obsoleteRows[0];
    if (row.definition_code !== TARGET.code || row.definition_label !== TARGET.label || row.definition_data_type !== TARGET.dataType
        || row.value_text !== TARGET.valueText || Number(row.value_number) !== TARGET.valueNumber || row.value_boolean !== TARGET.valueBoolean
        || row.unit_override !== TARGET.unitOverride) {
        return { status: "BLOCKED", reason: "Exact legacy value tuple guard failed", row };
    }
    return { status: "READY", product, obsoleteDefinition, row, consumption, canonicalCategory: contract.category.name };
}

async function snapshot(db) {
    const result = {};
    for (const [table, orderBy] of SNAPSHOT_TABLES) result[table] = await db.all(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    return result;
}

function stable(value) { return JSON.stringify(value); }
function withoutRow(rows, id) { return rows.filter(row => Number(row.id) !== Number(id)); }
function snapshotsUnchangedExceptTarget(before, after, targetId) {
    return stable(before.products) === stable(after.products)
        && stable(withoutRow(before.product_attribute_values, targetId)) === stable(after.product_attribute_values)
        && stable(before.product_attribute_definitions) === stable(after.product_attribute_definitions)
        && stable(before.product_attribute_templates) === stable(after.product_attribute_templates);
}

async function createOnlineBackup(db, backupDir) {
    if (!backupDir) throw new Error("Apply requires --backup-dir");
    const destinationDir = path.resolve(backupDir);
    await fs.promises.mkdir(destinationDir, { recursive: true });
    const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const target = path.join(destinationDir, `mat000002-legacy-coverage-${suffix}.backup`);
    const backup = db.raw.backup(target);
    await new Promise((resolve, reject) => backup.step(-1, error => {
        if (error) return reject(error);
        backup.finish(finishError => finishError ? reject(finishError) : resolve());
    }));
    if (!fs.existsSync(target)) throw new Error(`Backup was not created in the requested directory: ${target}`);
    const verify = await openDatabase(target, true);
    try {
        const integrity = await verify.get("PRAGMA integrity_check");
        if (integrity?.integrity_check !== "ok") throw new Error(`Backup integrity check failed: ${target}`);
    } finally { await verify.close(); }
    const stat = await fs.promises.stat(target);
    return { path: target, size: stat.size, integrity: "ok" };
}

async function runCleanup(db, { apply = false, backup = null, canonical = CANONICAL } = {}) {
    const initial = await planCleanup(db, canonical);
    if (initial.status === "BLOCKED") return { ...initial, mode: apply ? "apply" : "dry-run", writes: 0, backup: null };
    if (initial.status === "EXISTING_OK") return { ...initial, mode: apply ? "apply" : "dry-run", writes: 0, backup: null };
    if (!apply) return { ...initial, mode: "dry-run", writes: 0, action: "would delete exactly one product_attribute_values row", backup: null };
    if (typeof backup !== "function") throw new Error("Apply requires an online backup callback");

    const backupResult = await backup();
    await db.run("BEGIN IMMEDIATE");
    try {
        const current = await planCleanup(db, canonical);
        if (current.status !== "READY" || Number(current.row.id) !== Number(initial.row.id)) throw new Error("State changed after backup; refusing cleanup");
        const before = await snapshot(db);
        const deleted = await db.run(`DELETE FROM product_attribute_values
            WHERE id=? AND product_id=? AND attribute_definition_id=?
                AND value_text IS ? AND value_number IS ? AND value_boolean IS ? AND unit_override IS ?`, [
            current.row.id, current.product.id, current.obsoleteDefinition.id,
            TARGET.valueText, TARGET.valueNumber, TARGET.valueBoolean, TARGET.unitOverride
        ]);
        if (deleted.changes !== 1) throw new Error(`Expected one deleted row, got ${deleted.changes}`);
        const afterPlan = await planCleanup(db, canonical);
        if (afterPlan.status !== "EXISTING_OK") throw new Error(`Post-delete guard failed: ${afterPlan.reason || afterPlan.status}`);
        if (afterPlan.consumption.value_text !== TARGET.retainedValueText || afterPlan.consumption.unit_override !== TARGET.retainedUnitOverride) {
            throw new Error("Post-delete consumption_10mm retention guard failed");
        }
        const after = await snapshot(db);
        if (!snapshotsUnchangedExceptTarget(before, after, current.row.id)) throw new Error("Immutable snapshot changed outside the exact target value row");
        await db.run("COMMIT");
        return { status: "APPLIED", mode: "apply", writes: deleted.changes, deleted: { id: current.row.id, product: TARGET.externalId, code: TARGET.code, valueNumber: TARGET.valueNumber, unitOverride: TARGET.unitOverride }, consumptionRetained: { code: TARGET.retainedCode, valueText: afterPlan.consumption.value_text, unitOverride: afterPlan.consumption.unit_override }, backup: backupResult };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    const db = await openDatabase(options.db, !options.apply);
    try {
        const result = await runCleanup(db, {
            apply: options.apply,
            backup: options.apply ? () => createOnlineBackup(db, options.backupDir) : null
        });
        console.log(JSON.stringify(result, null, 2));
        if (result.status === "BLOCKED") process.exitCode = 2;
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, TARGET, SNAPSHOT_TABLES, parseArgs, openDatabase, exactCanonicalContract, planCleanup, snapshot, snapshotsUnchangedExceptTarget, createOnlineBackup, runCleanup };
