"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const CONFIRM_TOKEN = "REMOVE_APPROVED_MAT_ATTRIBUTE_VALUE";
const APPROVED_REMOVAL = Object.freeze({
    externalId: "MAT-000002",
    title: "Штукатурка гипсовая Knauf Ротбанд 30 кг",
    code: "coverage_30kg_10mm",
    valueText: null,
    valueNumber: 3.5,
    valueBoolean: null,
    legacyRowId: 29
});

function parseArgs(args) {
    const options = { apply: false, db: null, confirm: null, backupDir: null };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const [key, ...tail] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    if (options.apply && options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
    if (!options.apply && options.confirm) throw new Error("--confirm is valid only with --apply");
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

function sameTypedValue(row, approved) {
    return row.value_text === approved.valueText
        && (row.value_number === null ? null : Number(row.value_number)) === approved.valueNumber
        && row.value_boolean === approved.valueBoolean;
}

async function planRemoval(db, approved = APPROVED_REMOVAL) {
    if (JSON.stringify(approved) !== JSON.stringify(APPROVED_REMOVAL)) {
        return { status: "BLOCKED", reason: "Removal descriptor differs from the immutable user-approved target" };
    }
    const product = await db.get("SELECT id,external_id,title FROM products WHERE external_id=?", [APPROVED_REMOVAL.externalId]);
    if (!product) {
        const legacy = await db.get("SELECT id,product_id,attribute_definition_id,value_number FROM product_attribute_values WHERE id=?", [APPROVED_REMOVAL.legacyRowId]);
        return { status: "BLOCKED", reason: legacy ? "Legacy target row ID belongs to a database without the exact MAT identity" : "Exact MAT-000002 product is missing" };
    }
    if (product.external_id !== APPROVED_REMOVAL.externalId || product.title !== APPROVED_REMOVAL.title) {
        return { status: "BLOCKED", reason: `Exact product identity/title guard failed for ${APPROVED_REMOVAL.externalId}`, product };
    }
    const definition = await db.get("SELECT id,code FROM product_attribute_definitions WHERE code=?", [APPROVED_REMOVAL.code]);
    if (!definition || definition.code !== APPROVED_REMOVAL.code) return { status: "BLOCKED", reason: "Exact attribute definition is missing" };
    const rows = await db.get(`SELECT v.id,v.product_id,v.attribute_definition_id,v.value_text,v.value_number,v.value_boolean,
            p.external_id,p.title,d.code
        FROM product_attribute_values v
        JOIN products p ON p.id=v.product_id
        JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        WHERE p.id=? AND d.id=?`, [product.id, definition.id]);
    if (!rows) {
        const sentinel = await db.get("SELECT id,product_id,attribute_definition_id,value_text,value_number,value_boolean FROM product_attribute_values WHERE id=?", [APPROVED_REMOVAL.legacyRowId]);
        if (sentinel) return { status: "BLOCKED", reason: "Legacy target row ID exists but points to a different product or attribute", row: sentinel };
        return { status: "EXISTING_OK / ALREADY_ABSENT", product, code: APPROVED_REMOVAL.code };
    }
    if (rows.external_id !== APPROVED_REMOVAL.externalId || rows.title !== APPROVED_REMOVAL.title || rows.code !== APPROVED_REMOVAL.code) {
        return { status: "BLOCKED", reason: "Exact MAT/title/attribute guard failed", row: rows };
    }
    if (!sameTypedValue(rows, APPROVED_REMOVAL)) return { status: "BLOCKED", reason: "Exact current typed value guard failed", row: rows };
    return { status: "WILL_DELETE_ONE", product, row: rows };
}

async function createOnlineBackup(db, dbPath, backupDir) {
    const destinationDir = path.resolve(backupDir || path.dirname(path.resolve(dbPath)));
    const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const target = path.join(destinationDir, `matmix-approved-attribute-removal-${suffix}.backup`);
    await fs.promises.mkdir(destinationDir, { recursive: true });
    const backup = db.raw.backup(target);
    await new Promise((resolve, reject) => backup.step(-1, error => {
        if (error) return reject(error);
        backup.finish(finishError => finishError ? reject(finishError) : resolve());
    }));
    const stat = await fs.promises.stat(target);
    if (stat.size < 1024) throw new Error(`Online backup is unexpectedly small: ${target}`);
    const check = await openDatabase(target, true);
    try {
        const integrity = await check.get("PRAGMA integrity_check");
        if (integrity?.integrity_check !== "ok") throw new Error(`Online backup integrity failed: ${target}`);
    } finally { await check.close(); }
    return { path: target, size: stat.size, integrity: "ok" };
}

async function run(db, { apply = false, backup = null } = {}) {
    const plan = await planRemoval(db);
    if (plan.status === "BLOCKED" || plan.status === "EXISTING_OK / ALREADY_ABSENT") return { ...plan, mode: apply ? "apply" : "dry-run", backup: null };
    if (!apply) return { ...plan, status: "DRY_RUN / WOULD_DELETE_ONE", mode: "dry-run", backup: null };
    if (typeof backup !== "function") throw new Error("Apply requires an online backup callback");
    const backupResult = await backup();
    await db.run("BEGIN IMMEDIATE");
    try {
        const current = await planRemoval(db);
        if (current.status !== "WILL_DELETE_ONE" || current.row.id !== plan.row.id) throw new Error("Target changed after backup; refusing delete");
        const result = await db.run("DELETE FROM product_attribute_values WHERE id=? AND product_id=? AND attribute_definition_id=? AND value_text IS ? AND value_number IS ? AND value_boolean IS ?", [
            current.row.id, current.row.product_id, current.row.attribute_definition_id,
            APPROVED_REMOVAL.valueText, APPROVED_REMOVAL.valueNumber, APPROVED_REMOVAL.valueBoolean
        ]);
        if (result.changes !== 1) throw new Error(`Expected exactly one approved row deletion, got ${result.changes}`);
        const after = await planRemoval(db);
        if (after.status !== "EXISTING_OK / ALREADY_ABSENT") throw new Error("Post-delete idempotency guard failed");
        await db.run("COMMIT");
        return { status: "APPLIED_ONE_ROW", mode: "apply", deleted: plan.row, backup: backupResult };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    const db = await openDatabase(options.db, !options.apply);
    try {
        const result = await run(db, { apply: options.apply, backup: options.apply ? () => createOnlineBackup(db, options.db, options.backupDir) : null });
        console.log(JSON.stringify(result, null, 2));
        if (result.status === "BLOCKED") process.exitCode = 2;
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, APPROVED_REMOVAL, parseArgs, openDatabase, planRemoval, createOnlineBackup, run };
