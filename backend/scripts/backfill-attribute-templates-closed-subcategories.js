"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const { MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");

const CONFIRM_TOKEN = "APPLY_CLOSED_ATTRIBUTE_TEMPLATES";
const CLOSED_STRUCTURE_IDS = Object.freeze([2, 4, 5, 7, 8]);
const CLOSED_STRUCTURE_NAMES = Object.freeze(["Штукатурка", "Шпаклевка", "Кладочные Смеси", "Наливной Пол", "Стяжки Пола"]);
const CLOSED_CATEGORIES = Object.freeze(CLOSED_STRUCTURE_IDS.map(id => {
    const category = CANONICAL.categories.find(item => Number(item.structureId) === id);
    if (!category) throw new Error(`Canonical closed structure is missing: ${id}`);
    return category;
}));
const EXPECTED_ROW_COUNT = CLOSED_CATEGORIES.reduce((sum, category) => sum + category.codes.length, 0);
const PROTECTED_TABLES = Object.freeze(["products", "product_attribute_values", "product_images"]);
const signature = value => JSON.stringify(value);
const sha256 = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

function parseArgs(args) {
    const options = { apply: false, db: null, confirm: null, backupDir: null };
    const seen = new Set();
    for (let i = 0; i < args.length; i++) {
        const [key, ...rest] = args[i].split("=");
        if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
        seen.add(key);
        if (key === "--apply" || key === "--dry-run") {
            if (rest.length) throw new Error(`Unexpected option value: ${key}`);
            if (key === "--apply") options.apply = true;
            continue;
        }
        if (!["--db", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
        const value = rest.length ? rest.join("=") : args[++i];
        if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
        options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    if (options.apply && options.confirm !== CONFIRM_TOKEN) throw new Error(`Apply requires --confirm ${CONFIRM_TOKEN}`);
    if (!options.apply && options.confirm) throw new Error("--confirm is valid only with --apply");
    return options;
}

function openDatabase(file, readOnly) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    const flags = readOnly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, flags, async error => {
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

async function hashProtectedTables(db) {
    const hashes = {};
    for (const table of PROTECTED_TABLES) {
        const rows = await db.all(`SELECT * FROM ${table} ORDER BY id`);
        hashes[table] = sha256(rows);
    }
    const seo = await db.all("SELECT id,seo_title,seo_description,short_description,full_description,description FROM products ORDER BY id");
    hashes.seo = sha256(seo);
    return hashes;
}

async function buildPlan(db, canonical = CANONICAL) {
    if (signature(canonical.mainAttributes) !== signature(MAIN_ATTRIBUTES.map(item => item.code))) {
        throw new Error("MAIN_ATTRIBUTES guard differs from the canonical resolver");
    }
    if (!Array.isArray(canonical.categories)) throw new Error("Canonical categories must be an array");
    const canonicalIds = canonical.categories.map(item => Number(item.structureId));
    if (new Set(canonicalIds).size !== canonicalIds.length) throw new Error("Canonical structure IDs must be unique");
    const scopedCategories = CLOSED_STRUCTURE_IDS.map(id => canonical.categories.find(item => Number(item.structureId) === id));
    if (scopedCategories.some((item, index) => !item || item.name !== CLOSED_STRUCTURE_NAMES[index])) {
        throw new Error("Canonical closed-subcategory allowlist mismatch");
    }
    const sectionColumn = (await db.all("PRAGMA table_info(product_attribute_templates)")).some(column => column.name === "section");
    const parent = await db.get("SELECT id,type,name,is_active FROM catalog_structure WHERE id=?", [canonical.parent.id]);
    if (!parent || parent.type !== canonical.parent.type || parent.name !== canonical.parent.name || Number(parent.is_active) !== 1) {
        throw new Error("Canonical parent structure guard failed");
    }
    const definitions = await db.all("SELECT id,code,is_active FROM product_attribute_definitions");
    const definitionByCode = new Map();
    for (const definition of definitions) {
        if (definitionByCode.has(definition.code)) throw new Error(`Duplicate definition code: ${definition.code}`);
        definitionByCode.set(definition.code, definition);
    }
    const mainCodes = new Set(canonical.mainAttributes);
    const plan = [];
    for (const category of scopedCategories) {
        if (!Array.isArray(category.codes) || new Set(category.codes).size !== category.codes.length) throw new Error(`Invalid code list: ${category.name}`);
        const removeCodes = category.removeCodes || [];
        if (!Array.isArray(removeCodes) || new Set(removeCodes).size !== removeCodes.length || removeCodes.some(code => category.codes.includes(code))) throw new Error(`Invalid explicit removals: ${category.name}`);
        if (category.codes.some(code => mainCodes.has(code))) throw new Error(`MAIN_ATTRIBUTE cannot be templated: ${category.name}`);
        const structure = await db.get("SELECT id,parent_id,type,name,is_active FROM catalog_structure WHERE id=?", [category.structureId]);
        if (!structure || Number(structure.parent_id) !== Number(canonical.parent.id) || structure.type !== "subcategory" || structure.name !== category.name || Number(structure.is_active) !== 1) {
            throw new Error(`Exact structure ID/name guard failed: ${category.structureId}/${category.name}`);
        }
        const desired = [];
        for (const [sortOrder, code] of category.codes.entries()) {
            const definition = definitionByCode.get(code);
            if (!definition || Number(definition.is_active) !== 1) throw new Error(`Missing or inactive definition code: ${code}`);
            desired.push({ code, definitionId: definition.id, sortOrder });
        }
        const current = await db.all(`SELECT t.id,t.attribute_definition_id,t.sort_order,${sectionColumn ? "t.section,t.is_required,t.unit_override,t.created_at,t.updated_at" : "'regular' AS section"},d.code
            FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
            WHERE t.structure_id=? ORDER BY t.id`, [category.structureId]);
        const mainContract = [];
        if (sectionColumn) {
            for (const [sortOrder, code] of canonical.mainAttributes.entries()) {
                const matching = current.filter(row => row.code === code);
                if (matching.length !== 1 || matching[0].section !== "main" || Number(matching[0].sort_order) !== sortOrder) {
                    throw new Error(`Main template contract mismatch: ${category.name}/${code}`);
                }
                mainContract.push({ code, rowId: matching[0].id, definitionId: matching[0].attribute_definition_id,
                    section: matching[0].section, sortOrder: Number(matching[0].sort_order), isRequired: matching[0].is_required,
                    unitOverride: matching[0].unit_override ?? null, createdAt: matching[0].created_at ?? null, updatedAt: matching[0].updated_at ?? null });
            }
            for (const row of current) {
                if (row.section === "main" && !canonical.mainAttributes.includes(row.code)) {
                    throw new Error(`Unlisted main template membership: ${category.name}/${row.code}`);
                }
                if (canonical.mainAttributes.includes(row.code) && row.section !== "main") {
                    throw new Error(`Main attribute has wrong section: ${category.name}/${row.code}`);
                }
            }
        }
        const currentCodes = new Set();
        for (const row of current) {
            if (!row.code) throw new Error(`Unknown definition membership in ${category.name}: ${row.attribute_definition_id}`);
            if (mainCodes.has(row.code) && sectionColumn && row.section === "main") continue;
            if (mainCodes.has(row.code)) throw new Error(`MAIN_ATTRIBUTE template membership found: ${category.name}/${row.code}`);
            if (sectionColumn && row.section !== "regular") throw new Error(`Invalid template section: ${category.name}/${row.code}/${row.section}`);
            if (!category.codes.includes(row.code) && !removeCodes.includes(row.code)) throw new Error(`Unlisted template membership requires explicit canonical removal: ${category.name}/${row.code}`);
            if (currentCodes.has(row.code)) throw new Error(`Duplicate template membership: ${category.name}/${row.code}`);
            currentCodes.add(row.code);
        }
        const currentByCode = new Map(current.map(row => [row.code, row]));
        const items = desired.map(target => {
            const existing = currentByCode.get(target.code);
            const action = !existing ? "ADD" : Number(existing.sort_order) !== target.sortOrder ? "UPDATE_ORDER" : "EXISTING_OK";
            return { ...target, action, rowId: existing?.id ?? null, desired: true };
        });
        for (const code of removeCodes) {
            const existing = currentByCode.get(code);
            if (existing) items.push({ code, definitionId: existing.attribute_definition_id, sortOrder: null, action: "REMOVE_EXPLICIT", rowId: existing.id, desired: false });
        }
        plan.push({ name: category.name, structureId: category.structureId, mainContract, items });
    }
    const rowCount = plan.reduce((sum, category) => sum + category.items.filter(item => item.desired).length, 0);
    if (rowCount !== EXPECTED_ROW_COUNT) throw new Error(`Canonical row count mismatch: ${rowCount}/${EXPECTED_ROW_COUNT}`);
    return { expectedRowCount: rowCount, expectedMainMembershipCount: sectionColumn ? scopedCategories.length * canonical.mainAttributes.length : null, sectionColumn, categories: plan };
}

function hasChanges(plan) {
    return plan.categories.some(category => category.items.some(item => item.action !== "EXISTING_OK"));
}

async function createOnlineBackup(db, databasePath, backupDir = path.dirname(path.resolve(databasePath))) {
    const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const target = path.join(path.resolve(backupDir), `matmix-attribute-templates-${suffix}.backup`);
    if (fs.existsSync(target)) throw new Error(`Backup destination already exists: ${target}`);
    await fs.promises.mkdir(path.dirname(target), { recursive: true });
    const backup = db.raw.backup(target);
    await new Promise((resolve, reject) => backup.step(-1, error => {
        if (error) return reject(error);
        backup.finish(finishError => finishError ? reject(finishError) : resolve());
    }));
    const stat = await fs.promises.stat(target);
    if (stat.size < 1024) throw new Error(`Online backup is unexpectedly small: ${target}`);
    const verification = await openDatabase(target, true);
    try {
        const integrity = await verification.get("PRAGMA integrity_check");
        const tables = await verification.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products','product_attribute_values','product_attribute_templates','product_images')");
        if (integrity?.integrity_check !== "ok" || tables.length !== 4) throw new Error(`Online backup verification failed: ${target}`);
    } finally { await verification.close(); }
    return { path: target, size: stat.size };
}

async function runBatch(db, { apply = false, backup = null, canonical = CANONICAL } = {}) {
    const initialPlan = await buildPlan(db, canonical);
    const beforeDryRun = await hashProtectedTables(db);
    if (!apply) return { status: hasChanges(initialPlan) ? "CHANGES_REQUIRED" : "EXISTING_OK / NO_CHANGES", plan: initialPlan, protectedHashes: beforeDryRun, backup: null };
    if (hasChanges(initialPlan) && typeof backup !== "function") throw new Error("Apply with changes requires a verified online backup callback");
    const backupResult = hasChanges(initialPlan) ? await backup() : null;
    await db.run("BEGIN IMMEDIATE");
    try {
        const transactionPlan = await buildPlan(db, canonical);
        if (signature(transactionPlan) !== signature(initialPlan)) throw new Error("Database state changed after planning; refusing apply");
        const before = await hashProtectedTables(db);
        for (const category of transactionPlan.categories) {
            for (const item of category.items) {
                if (item.action === "ADD") {
                    const insertSql = transactionPlan.sectionColumn
                        ? "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order) VALUES(?,?,'regular',?)"
                        : "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,sort_order) VALUES(?,?,?)";
                    const inserted = await db.run(insertSql, [category.structureId, item.definitionId, item.sortOrder]);
                    if (inserted.changes !== 1) throw new Error(`Template insert did not affect one row: ${category.name}/${item.code}`);
                }
                if (item.action === "UPDATE_ORDER") {
                    const updated = await db.run("UPDATE product_attribute_templates SET sort_order=? WHERE id=?", [item.sortOrder, item.rowId]);
                    if (updated.changes !== 1) throw new Error(`Template update did not affect one row: ${category.name}/${item.code}`);
                }
                if (item.action === "REMOVE_EXPLICIT") {
                    const removed = await db.run("DELETE FROM product_attribute_templates WHERE id=? AND structure_id=? AND attribute_definition_id=?", [item.rowId, category.structureId, item.definitionId]);
                    if (removed.changes !== 1) throw new Error(`Explicit template removal did not affect one row: ${category.name}/${item.code}`);
                }
            }
        }
        const finalPlan = await buildPlan(db, canonical);
        if (hasChanges(finalPlan)) throw new Error("Post-apply idempotency check failed");
        if (signature(finalPlan.categories.map(category => category.mainContract))
            !== signature(transactionPlan.categories.map(category => category.mainContract))) {
            throw new Error("Main template memberships changed during closed-subcategory apply");
        }
        const after = await hashProtectedTables(db);
        if (signature(before) !== signature(after)) throw new Error("Protected table hash changed during template apply");
        await db.run("COMMIT");
        return { status: hasChanges(initialPlan) ? "APPLIED" : "EXISTING_OK / NO_CHANGES", plan: finalPlan, changes: initialPlan, protectedHashesBefore: before, protectedHashesAfter: after, backup: backupResult };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    const db = await openDatabase(options.db, !options.apply);
    try {
        const result = await runBatch(db, {
            apply: options.apply,
            backup: options.apply ? () => createOnlineBackup(db, options.db, options.backupDir || undefined) : null
        });
        console.log(JSON.stringify(result, null, 2));
    } finally { await db.close(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { CONFIRM_TOKEN, CLOSED_STRUCTURE_IDS, CLOSED_STRUCTURE_NAMES, EXPECTED_ROW_COUNT, PROTECTED_TABLES, parseArgs, openDatabase, hashProtectedTables, buildPlan, hasChanges, createOnlineBackup, runBatch };
