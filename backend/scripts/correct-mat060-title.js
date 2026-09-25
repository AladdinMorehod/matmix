"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const CONFIRM_TOKEN = "CORRECT_MAT060_PRODUCT_TITLE";
const APPROVED_CORRECTION = Object.freeze({
    externalId: "MAT-000060",
    oldTitle: "Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг",
    newTitle: "Шпаклевка полимерная финишная Волма Искрит, белоснежная мех. 19 кг"
});

function parseArgs(args) {
    const options = { apply: false, db: null, confirm: null, backupDir: null };
    const seen = new Set();
    for (let index = 0; index < args.length; index++) {
        const [key, ...tail] = args[index].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (tail.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = tail.length ? tail.join("=") : args[++index];
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

async function planCorrection(db, approved = APPROVED_CORRECTION) {
    if (JSON.stringify(approved) !== JSON.stringify(APPROVED_CORRECTION)) {
        return { status: "BLOCKED", reason: "Title correction differs from the immutable approved target" };
    }
    const products = await db.all("SELECT id,external_id,title FROM products WHERE external_id=? ORDER BY id", [APPROVED_CORRECTION.externalId]);
    if (products.length !== 1) {
        return { status: "BLOCKED", reason: products.length ? "MAT-000060 is not unique" : "Exact MAT-000060 product is missing", matchCount: products.length };
    }
    const product = products[0];
    if (product.external_id !== APPROVED_CORRECTION.externalId) return { status: "BLOCKED", reason: "External ID guard failed", product };
    if (product.title === APPROVED_CORRECTION.newTitle) return { status: "EXISTING_OK", reason: "Title already has the approved value", product };
    if (product.title !== APPROVED_CORRECTION.oldTitle) {
        return { status: "BLOCKED", reason: "Current title differs from the exact approved old title", product };
    }
    return { status: "WILL_UPDATE", product };
}

async function createOnlineBackup(db, dbPath, backupDir) {
    const destinationDir = path.resolve(backupDir || path.dirname(path.resolve(dbPath)));
    const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const target = path.join(destinationDir, `matmix-mat060-title-correction-${suffix}.backup`);
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
    const plan = await planCorrection(db);
    if (plan.status === "BLOCKED" || plan.status === "EXISTING_OK") {
        return { mode: apply ? "apply" : "dry-run", ...plan, target: { externalId: APPROVED_CORRECTION.externalId, oldTitle: APPROVED_CORRECTION.oldTitle, newTitle: APPROVED_CORRECTION.newTitle }, backup: null };
    }
    if (!apply) {
        return { mode: "dry-run", status: "DRY_RUN / WOULD_UPDATE_TITLE", target: { externalId: APPROVED_CORRECTION.externalId, currentTitle: plan.product.title, newTitle: APPROVED_CORRECTION.newTitle }, backup: null };
    }
    if (typeof backup !== "function") throw new Error("Apply requires an online backup callback");
    const backupResult = await backup();
    await db.run("BEGIN IMMEDIATE");
    try {
        const current = await planCorrection(db);
        if (current.status !== "WILL_UPDATE" || current.product.id !== plan.product.id) {
            throw new Error("MAT-000060 title changed after backup; refusing update");
        }
        const updated = await db.run("UPDATE products SET title=? WHERE id=? AND external_id=? AND title=?", [
            APPROVED_CORRECTION.newTitle, current.product.id, APPROVED_CORRECTION.externalId, APPROVED_CORRECTION.oldTitle
        ]);
        if (updated.changes !== 1) throw new Error(`Expected exactly one MAT-000060 title update, got ${updated.changes}`);
        const after = await db.get("SELECT id,external_id,title FROM products WHERE id=? AND external_id=?", [current.product.id, APPROVED_CORRECTION.externalId]);
        if (!after || after.title !== APPROVED_CORRECTION.newTitle) throw new Error("Post-update title verification failed");
        await db.run("COMMIT");
        return { mode: "apply", status: "APPLIED_TITLE_CORRECTION", target: { externalId: after.external_id, oldTitle: APPROVED_CORRECTION.oldTitle, newTitle: after.title }, updatedRows: updated.changes, backup: backupResult };
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
        console.log(JSON.stringify({ audit: "MAT-000060_TITLE_CORRECTION", ...result }, null, 2));
        if (result.status === "BLOCKED") process.exitCode = 2;
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, APPROVED_CORRECTION, parseArgs, openDatabase, planCorrection, createOnlineBackup, run };
