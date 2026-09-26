"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CANONICAL = require("./data/attribute-templates-closed-subcategories");
const { MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");

const CONFIRM_TOKEN = "BOOTSTRAP_ATTRIBUTE_TEMPLATES";
const EXPECTED_MEMBERSHIP_COUNT = CANONICAL.categories.reduce((sum, category) => sum + category.codes.length, 0)
    + CANONICAL.categories.length * CANONICAL.mainAttributes.length;
const PROTECTED_TABLES = Object.freeze([
    "products", "product_attribute_values", "product_attribute_definitions", "product_images"
]);
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
        hashes[table] = sha256(await db.all(`SELECT * FROM ${table} ORDER BY id`));
    }
    hashes.seo = sha256(await db.all("SELECT id,seo_title,seo_description,short_description,full_description,description FROM products ORDER BY id"));
    return hashes;
}

function desiredMemberships(category, mainCodes) {
    return [
        ...mainCodes.map((code, sortOrder) => ({ code, section: "main", sortOrder, isRequired: 0, unitOverride: null })),
        ...category.codes.map((code, sortOrder) => ({ code, section: "regular", sortOrder, isRequired: 0, unitOverride: null }))
    ];
}

async function buildPlan(db, canonical = CANONICAL) {
    const issues = [];
    const version = Number((await db.get("PRAGMA user_version"))?.user_version || 0);
    if (version !== 11) throw new Error(`Expected schema version 11, got ${version}`);
    const templateColumns = new Set((await db.all("PRAGMA table_info(product_attribute_templates)")).map(row => row.name));
    for (const column of ["section", "sort_order", "is_required", "unit_override"]) {
        if (!templateColumns.has(column)) throw new Error(`Missing product_attribute_templates.${column}`);
    }
    if (signature(canonical.mainAttributes) !== signature(MAIN_ATTRIBUTES.map(item => item.code))) {
        throw new Error("Canonical main-attribute list differs from the product attribute resolver");
    }
    if (!Array.isArray(canonical.categories) || canonical.categories.length !== 5) throw new Error("Canonical scope must contain exactly five subcategories");
    const expectedNames = ["Штукатурка", "Шпаклевка", "Кладочные Смеси", "Наливной Пол", "Стяжки Пола"];
    const names = canonical.categories.map(item => item.name);
    if (new Set(names).size !== names.length || signature([...names].sort()) !== signature([...expectedNames].sort())) {
        throw new Error("Canonical subcategory allowlist mismatch");
    }
    const parent = await db.get("SELECT id,type,name,is_active FROM catalog_structure WHERE id=?", [canonical.parent.id]);
    if (!parent || parent.type !== canonical.parent.type || parent.name !== canonical.parent.name || Number(parent.is_active) !== 1) {
        throw new Error("Canonical parent structure guard failed");
    }
    const definitions = await db.all("SELECT id,code,is_active FROM product_attribute_definitions ORDER BY id");
    const definitionByCode = new Map();
    for (const definition of definitions) {
        if (definitionByCode.has(definition.code)) issues.push({ code: "DUPLICATE_DEFINITION_CODE", detail: definition.code, blocking: true });
        else definitionByCode.set(definition.code, definition);
    }
    const mainCodes = canonical.mainAttributes;
    const categories = [];
    for (const category of canonical.categories) {
        if (!Array.isArray(category.codes) || new Set(category.codes).size !== category.codes.length
            || category.codes.some(code => mainCodes.includes(code))) throw new Error(`Invalid canonical code list: ${category.name}`);
        const structure = await db.get("SELECT id,parent_id,type,name,is_active FROM catalog_structure WHERE id=?", [category.structureId]);
        if (!structure || Number(structure.parent_id) !== Number(canonical.parent.id) || structure.type !== "subcategory"
            || structure.name !== category.name || Number(structure.is_active) !== 1) {
            issues.push({ code: "STRUCTURE_GUARD_FAILED", detail: `${category.structureId}/${category.name}; actual=${JSON.stringify(structure || null)}`, blocking: true });
            categories.push({ name: category.name, structureId: category.structureId, items: [], orderedCodes: { main: [], regular: [] } });
            continue;
        }
        const desired = desiredMemberships(category, mainCodes);
        const current = await db.all(`SELECT t.id,t.attribute_definition_id,t.section,t.sort_order,t.is_required,t.unit_override,d.code
            FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
            WHERE t.structure_id=? ORDER BY t.id`, [category.structureId]);
        const currentByCode = new Map();
        for (const row of current) {
            if (!row.code) {
                issues.push({ code: "UNKNOWN_EXISTING_DEFINITION", detail: `${category.name}/${row.attribute_definition_id}`, blocking: true });
                continue;
            }
            if (currentByCode.has(row.code)) {
                issues.push({ code: "DUPLICATE_MEMBERSHIP", detail: `${category.name}/${row.code}`, blocking: true });
                continue;
            }
            currentByCode.set(row.code, row);
        }
        const desiredCodes = new Set(desired.map(item => item.code));
        for (const row of current) {
            if (row.code && !desiredCodes.has(row.code)) {
                issues.push({ code: "UNLISTED_MEMBERSHIP_PRESERVED", detail: `${category.name}/${row.code}`, blocking: false });
            }
        }
        const items = desired.map(target => {
            const definition = definitionByCode.get(target.code);
            if (!definition || Number(definition.is_active) !== 1) {
                issues.push({ code: "MISSING_OR_INACTIVE_DEFINITION", detail: `${category.name}/${target.code}`, blocking: true });
                return { ...target, definitionId: definition?.id ?? null, action: "NEEDS_REVIEW", rowId: null };
            }
            const existing = currentByCode.get(target.code);
            if (!existing) return { ...target, definitionId: definition.id, action: "ADD", rowId: null };
            const action = existing.section !== target.section || Number(existing.sort_order) !== target.sortOrder ? "UPDATE" : "EXISTING_OK";
            return { ...target, definitionId: definition.id, action, rowId: existing.id,
                existingRequired: Number(existing.is_required) || 0, existingUnitOverride: existing.unit_override ?? null };
        });
        categories.push({ name: category.name, structureId: category.structureId, items,
            orderedCodes: Object.fromEntries(["main", "regular"].map(section => [section,
                items.filter(item => item.section === section).sort((a, b) => a.sortOrder - b.sortOrder).map(item => item.code)
            ])) });
    }
    const desiredCount = canonical.categories.reduce((sum, category) => sum + category.codes.length + mainCodes.length, 0);
    if (desiredCount !== EXPECTED_MEMBERSHIP_COUNT) throw new Error(`Canonical membership count mismatch: ${desiredCount}/${EXPECTED_MEMBERSHIP_COUNT}; issues=${JSON.stringify(issues)}`);
    const willAdd = categories.reduce((sum, category) => sum + category.items.filter(item => item.action === "ADD").length, 0);
    const willUpdate = categories.reduce((sum, category) => sum + category.items.filter(item => item.action === "UPDATE").length, 0);
    const existingOk = categories.reduce((sum, category) => sum + category.items.filter(item => item.action === "EXISTING_OK").length, 0);
    return { schemaVersion: version, expectedMembershipCount: EXPECTED_MEMBERSHIP_COUNT, willAdd, willUpdate, existingOk, issues, categories };
}

function hasChanges(plan) { return plan.willAdd > 0 || plan.willUpdate > 0; }
function blockingIssues(plan) { return plan.issues.some(issue => issue.blocking); }
function needsReview(plan) { return plan.issues.length > 0; }

async function createOnlineBackup(db, databasePath, backupDir = path.dirname(path.resolve(databasePath))) {
    const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const target = path.join(path.resolve(backupDir), `matmix-template-bootstrap-${suffix}.backup`);
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
        if (integrity?.integrity_check !== "ok") throw new Error(`Online backup verification failed: ${target}`);
        const version = Number((await verification.get("PRAGMA user_version"))?.user_version || 0);
        if (version !== 11) throw new Error(`Online backup has unexpected schema version: ${version}`);
    } finally { await verification.close(); }
    return { path: target, size: stat.size };
}

async function runBatch(db, { apply = false, backup = null, canonical = CANONICAL } = {}) {
    const initialPlan = await buildPlan(db, canonical);
    const protectedBefore = await hashProtectedTables(db);
    if (!apply) return { status: needsReview(initialPlan) ? "NEEDS_REVIEW" : hasChanges(initialPlan) ? "CHANGES_REQUIRED" : "EXISTING_OK / NO_CHANGES",
        plan: initialPlan, protectedHashes: protectedBefore, backup: null };
    if (blockingIssues(initialPlan)) throw new Error("Plan contains blocking NEEDS_REVIEW issues; apply refused");
    if (hasChanges(initialPlan) && typeof backup !== "function") throw new Error("Apply with changes requires a verified online backup callback");
    const backupResult = hasChanges(initialPlan) ? await backup() : null;
    await db.run("BEGIN IMMEDIATE");
    try {
        const transactionPlan = await buildPlan(db, canonical);
        if (signature(transactionPlan) !== signature(initialPlan)) throw new Error("Database changed after planning; refusing apply");
        const before = await hashProtectedTables(db);
        const now = new Date().toISOString();
        for (const category of transactionPlan.categories) {
            for (const item of category.items) {
                if (item.action === "ADD") {
                    const result = await db.run(`INSERT INTO product_attribute_templates
                        (structure_id,attribute_definition_id,section,sort_order,is_required,unit_override,created_at,updated_at)
                        VALUES(?,?,?,?,?,?,?,?)`, [category.structureId, item.definitionId, item.section, item.sortOrder, item.isRequired, item.unitOverride, now, now]);
                    if (result.changes !== 1) throw new Error(`Template insert failed: ${category.name}/${item.code}`);
                } else if (item.action === "UPDATE") {
                    const result = await db.run("UPDATE product_attribute_templates SET section=?,sort_order=?,updated_at=? WHERE id=? AND structure_id=? AND attribute_definition_id=?",
                        [item.section, item.sortOrder, now, item.rowId, category.structureId, item.definitionId]);
                    if (result.changes !== 1) throw new Error(`Template update failed: ${category.name}/${item.code}`);
                }
            }
        }
        const finalPlan = await buildPlan(db, canonical);
        if (finalPlan.willAdd || finalPlan.willUpdate || blockingIssues(finalPlan)) throw new Error("Post-apply idempotency check failed");
        const protectedAfter = await hashProtectedTables(db);
        if (signature(before) !== signature(protectedAfter)) throw new Error("Protected data changed during template bootstrap");
        await db.run("COMMIT");
        const status = needsReview(finalPlan) ? (hasChanges(initialPlan) ? "APPLIED_WITH_NEEDS_REVIEW" : "NEEDS_REVIEW")
            : hasChanges(initialPlan) ? "APPLIED" : "EXISTING_OK / NO_CHANGES";
        return { status, plan: finalPlan, changes: initialPlan,
            protectedHashesBefore: before, protectedHashesAfter: protectedAfter, backup: backupResult };
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

module.exports = { CONFIRM_TOKEN, EXPECTED_MEMBERSHIP_COUNT, PROTECTED_TABLES, parseArgs, openDatabase, hashProtectedTables,
    desiredMemberships, buildPlan, hasChanges, blockingIssues, needsReview, createOnlineBackup, runBatch };
