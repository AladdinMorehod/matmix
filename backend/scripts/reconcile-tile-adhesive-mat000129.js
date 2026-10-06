"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const CORE = require("./data/tile-adhesive-core-batch1");
const CONTENT = require("./data/tile-adhesive-content-batch1");
const CONTENT_RUNNER = require("./backfill-tile-adhesive-content-batch1");

const MAT = "MAT-000129";
const ONLY = Object.freeze([MAT]);
const CONFIRM = "RECONCILE_TILE_ADHESIVE_MAT000129";
const PRODUCT = CORE.PRODUCTS.find(row => row.externalId === MAT);
const COPY = CONTENT.PRODUCTS.find(row => row.externalId === MAT);
const TABLES = Object.freeze(["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]);
const CONTENT_FIELDS = Object.freeze(["short_description", "full_description", "seo_description"]);
const OLD = Object.freeze({
    purpose: "керамическая плитка и камень, кроме мрамора; до 60×60 см; до 45 кг/м²",
    short_description: "Vetonit Изи Фикс серый, 25 кг — клей для керамической плитки и камня внутри здания.",
    full_description: "Vetonit Изи Фикс — серый плиточный клей для керамической плитки и камня, кроме мрамора, внутри здания. Подходит для стен и полов при любом уровне влажности; слой — 1–15 мм. Расход — 1,29 кг/м² на 1 мм, время жизни — 3 ч.",
    seo_description: "Vetonit Изи Фикс серый 25 кг — для плитки и камня, кроме мрамора. Расход 1,29 кг/м² на 1 мм; время жизни — 3 ч. Закажите в MatMix с доставкой по Москве."
});
const NEW = Object.freeze({
    purpose: "Керамическая плитка размером до 60×60 см и массой не более 45 кг/м²",
    shelf_life: Object.freeze({ value: 12, value_text: null, value_number: 12, value_boolean: null, unit_override: "месяцев" }),
    adjustment_time: Object.freeze({ value: "15 мин", value_text: "15 мин", value_number: null, value_boolean: null, unit_override: null }),
    short_description: "Vetonit Изи Фикс серый, 25 кг — клей класса C0 T для керамической плитки до 60×60 см внутри помещений.",
    full_description: "Vetonit Изи Фикс — серый клей класса C0 T для керамической плитки до 60×60 см и массой не более 45 кг/м². Для стен и полов внутри сухих и влажных помещений; слой — 1–15 мм. Расход — 1,29 кг/м² на 1 мм, время жизни раствора — 3 ч.",
    seo_description: "Vetonit Изи Фикс серый 25 кг — клей C0 T для керамической плитки до 60×60 см. Слой 1–15 мм, расход 1,29 кг/м² на 1 мм. Доставка по Москве."
});

function assertOnly(value) {
    const selected = (Array.isArray(value) ? value : String(value ?? "").split(",")).map(item => String(item).trim());
    if (selected.length !== 1 || selected[0] !== MAT) throw new Error(`Exact --only ${MAT} required`);
    return [...ONLY];
}

function parseArgs(args) {
    const options = { db: null, only: null, apply: false, confirm: null, backupDir: null };
    const seen = new Set();
    for (let i = 0; i < args.length; i += 1) {
        const [flag, ...tail] = String(args[i]).split("=");
        if (seen.has(flag)) throw new Error(`Duplicate option ${flag}`);
        seen.add(flag);
        if (flag === "--apply" || flag === "--dry-run") {
            if (tail.length) throw new Error(`${flag} takes no value`);
            options.apply = flag === "--apply";
            continue;
        }
        if (!["--db", "--only", "--confirm", "--backup-dir"].includes(flag)) throw new Error(`Unknown option ${flag}`);
        const value = tail.length ? tail.join("=") : args[++i];
        if (!value || String(value).startsWith("--")) throw new Error(`Value required for ${flag}`);
        options[flag.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())] = value;
    }
    if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --apply or --dry-run");
    if (!options.db || options.db === ":memory:") throw new Error("Explicit existing --db is required");
    options.only = assertOnly(options.only);
    if (options.apply && (options.confirm !== CONFIRM || !options.backupDir)) throw new Error(`--apply requires --confirm ${CONFIRM} and --backup-dir`);
    if (!options.apply && (options.confirm || options.backupDir)) throw new Error("--confirm and --backup-dir are accepted only with --apply");
    return options;
}

function openDatabase(file, writable = false) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY, error => {
            if (error) return reject(error);
            const db = {
                run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
                backup(target) { return new Promise((res, rej) => { let backup; try { backup = raw.backup(target); } catch (err) { rej(err); return; } const step = () => backup.step(-1, (err, done) => { if (err) return rej(err); if (done) return res(); step(); }); step(); }); },
                close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
            };
            db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async err => { await db.close(); reject(err); });
        });
    });
}

async function schemaGuard(db) {
    const version = Number((await db.get("PRAGMA user_version"))?.user_version ?? 0);
    if (version !== 11) throw new Error(`SCHEMA_BLOCKED expected v11, got ${version}`);
    const definitions = await db.all("SELECT * FROM product_attribute_definitions ORDER BY id");
    const expected = {
        purpose: { data_type: "text", default_unit: null },
        shelf_life: { data_type: "number", default_unit: "месяцев" },
        adjustment_time: { data_type: "text", default_unit: null }
    };
    const byCode = new Map();
    for (const row of definitions) {
        if (byCode.has(row.code)) throw new Error(`SCHEMA_BLOCKED duplicate definition ${row.code}`);
        byCode.set(row.code, row);
    }
    const memberships = await db.all(`SELECT t.*,d.code FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=?`, [CORE.TEMPLATE.structureId]);
    const memberByCode = new Map();
    for (const row of memberships) {
        if (memberByCode.has(row.code)) throw new Error(`TEMPLATE_BLOCKED duplicate membership ${row.code}`);
        memberByCode.set(row.code, row);
    }
    for (const [code, contract] of Object.entries(expected)) {
        const definition = byCode.get(code);
        if (!definition || Number(definition.is_active) !== 1 || definition.data_type !== contract.data_type || (definition.default_unit ?? null) !== contract.default_unit) throw new Error(`SCHEMA_BLOCKED incompatible/missing ${code} definition`);
        const membership = memberByCode.get(code);
        const templateIndex = code === "shelf_life" ? CORE.TEMPLATE.mainCodes.indexOf(code) : CORE.TEMPLATE.regularCodes.indexOf(code);
        const section = code === "shelf_life" ? "main" : "regular";
        if (!membership || membership.section !== section || Number(membership.sort_order) !== templateIndex || Number(membership.is_required) !== 0 || (membership.unit_override ?? null) !== null) throw new Error(`TEMPLATE_BLOCKED incompatible ${code} membership`);
    }
    return { version, definitions: byCode, memberships: memberByCode };
}

function tuple(row) { return { value_text: row.value_text ?? null, value_number: row.value_number ?? null, value_boolean: row.value_boolean ?? null, unit_override: row.unit_override ?? null }; }
function tupleEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function expectedPurposeTuple(value) { return { value_text: value, value_number: null, value_boolean: null, unit_override: null }; }

async function inspect(db) {
    const schema = await schemaGuard(db);
    const matches = await db.all("SELECT * FROM products WHERE external_id=? ORDER BY id", [MAT]);
    if (matches.length !== 1) throw new Error(`IDENTITY_BLOCKED expected exactly one ${MAT}, got ${matches.length}`);
    const product = matches[0];
    for (const [field, expected] of Object.entries({ title: PRODUCT.expectedTitle, category: PRODUCT.expectedCategory, subcategory: PRODUCT.expectedSubcategory, brand: PRODUCT.expectedBrand, unit: PRODUCT.expectedUnit })) {
        if (product[field] !== expected) throw new Error(`IDENTITY_BLOCKED ${field} mismatch: expected ${expected}, got ${product[field]}`);
    }
    if (Number(product.weight) !== Number(PRODUCT.expectedWeight) || Number(product.is_active) !== 1 || product.deleted_at !== null) throw new Error("IDENTITY_BLOCKED weight/activity/deletion guard failed");
    if (product.seo_title !== COPY.seoTitle) throw new Error("IMMUTABLE_GUARD_BLOCKED seo_title differs from approved unchanged value");

    const values = await db.all(`SELECT v.*,d.code,d.data_type,d.default_unit FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`, [product.id]);
    const byCode = new Map();
    for (const value of values) {
        if (["purpose", "shelf_life", "adjustment_time"].includes(value.code)) {
            if (byCode.has(value.code)) throw new Error(`VALUE_CONFLICT duplicate ${MAT}/${value.code}`);
            byCode.set(value.code, value);
        }
    }
    const purpose = byCode.get("purpose");
    if (!purpose || ![OLD.purpose, NEW.purpose].some(value => tupleEqual(tuple(purpose), expectedPurposeTuple(value)))) throw new Error("VALUE_CONFLICT purpose must equal exact old value or exact approved new value");
    const purposeAction = purpose.value_text === OLD.purpose ? "UPDATE_OLD_TO_NEW" : "EXISTING_OK";
    const attrActions = [{ code: "purpose", action: purposeAction, old: OLD.purpose, value: NEW.purpose, valueId: purpose.id, definitionId: purpose.attribute_definition_id, sortOrder: purpose.sort_order }];
    for (const code of ["shelf_life", "adjustment_time"]) {
        const value = byCode.get(code);
        const expected = NEW[code];
        if (value) {
            if (!tupleEqual(tuple(value), { value_text: expected.value_text, value_number: expected.value_number, value_boolean: expected.value_boolean, unit_override: expected.unit_override })) throw new Error(`VALUE_CONFLICT ${code} must be absent or exact approved value`);
            attrActions.push({ code, action: "EXISTING_OK", value: expected.value, valueId: value.id, definitionId: value.attribute_definition_id, sortOrder: value.sort_order });
        } else {
            const membership = schema.memberships.get(code);
            attrActions.push({ code, action: "INSERT", value: expected.value, tuple: { value_text: expected.value_text, value_number: expected.value_number, value_boolean: expected.value_boolean, unit_override: expected.unit_override }, definitionId: schema.definitions.get(code).id, sortOrder: Number(membership.sort_order) });
        }
    }
    const contentActions = [];
    for (const field of CONTENT_FIELDS) {
        const current = product[field] ?? null;
        if (current === NEW[field]) contentActions.push({ field, action: "EXISTING_OK", old: OLD[field], value: NEW[field] });
        else if (current === OLD[field]) contentActions.push({ field, action: "UPDATE_OLD_TO_NEW", old: OLD[field], value: NEW[field] });
        else throw new Error(`CONTENT_CONFLICT ${field} must equal exact old or exact approved new copy`);
    }
    return {
        mode: "dry-run",
        scope: [...ONLY],
        identity: { externalId: MAT, title: product.title, category: product.category, subcategory: product.subcategory, brand: product.brand, weight: Number(product.weight), unit: product.unit },
        schemaVersion: schema.version,
        attributeActions: attrActions,
        contentActions,
        planned: {
            attributeUpdates: attrActions.filter(item => item.action === "UPDATE_OLD_TO_NEW").length,
            attributeInserts: attrActions.filter(item => item.action === "INSERT").length,
            contentUpdates: contentActions.filter(item => item.action === "UPDATE_OLD_TO_NEW").length,
            totalDatabaseMutations: attrActions.filter(item => ["UPDATE_OLD_TO_NEW", "INSERT"].includes(item.action)).length + contentActions.filter(item => item.action === "UPDATE_OLD_TO_NEW").length,
            brandUpdates: 0,
            definitionWrites: 0,
            templateWrites: 0,
            imageWrites: 0,
            titleSlugPriceStockWrites: 0
        },
        guards: { exactIdentity: true, exactOldPurposeOrExactNew: true, exactOldContentOrExactNew: true, shelfLifeAbsentOrExact: true, adjustmentTimeAbsentOrExact: true, seoTitleImmutable: true }
    };
}

async function snapshot(db) {
    const result = {};
    for (const table of TABLES) result[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
    return result;
}

function assertOnlyApprovedDelta(before, after, report) {
    const targetId = report.identity.externalId;
    const productId = report._productId;
    const beforeProducts = new Map(before.products.map(row => [Number(row.id), row]));
    const afterProducts = new Map(after.products.map(row => [Number(row.id), row]));
    assert.equal(afterProducts.size, beforeProducts.size, "products count unchanged");
    for (const [id, oldRow] of beforeProducts) {
        const next = afterProducts.get(id);
        assert(next, `product ${oldRow.external_id} remains`);
        const expected = { ...oldRow };
        if (id === Number(productId)) for (const field of CONTENT_FIELDS) expected[field] = NEW[field];
        assert.deepStrictEqual(next, expected, `only approved content columns can change on ${oldRow.external_id}`);
    }
    for (const table of ["product_attribute_definitions", "product_attribute_templates", "product_images"]) assert.deepStrictEqual(after[table], before[table], `${table} unchanged`);
    const definitions = new Map(before.product_attribute_definitions.map(row => [Number(row.id), row.code]));
    const beforeValues = new Map(before.product_attribute_values.map(row => [Number(row.id), row]));
    const afterValues = new Map(after.product_attribute_values.map(row => [Number(row.id), row]));
    const purposeAction = report.attributeActions.find(item => item.code === "purpose");
    for (const [id, oldRow] of beforeValues) {
        const next = afterValues.get(id);
        assert(next, `attribute row ${id} remains`);
        const expected = { ...oldRow };
        if (Number(oldRow.product_id) === Number(productId) && definitions.get(Number(oldRow.attribute_definition_id)) === "purpose" && purposeAction.action === "UPDATE_OLD_TO_NEW") expected.value_text = NEW.purpose;
        assert.deepStrictEqual(next, expected, `existing attribute ${id} changed only under exact purpose guard`);
    }
    const additions = after.product_attribute_values.filter(row => !beforeValues.has(Number(row.id)));
    const expectedAdds = report.attributeActions.filter(item => item.action === "INSERT");
    assert.equal(additions.length, expectedAdds.length, "only expected missing attribute rows inserted");
    for (const spec of expectedAdds) {
        const row = additions.find(item => Number(item.product_id) === Number(productId) && Number(item.attribute_definition_id) === Number(spec.definitionId));
        assert(row, `inserted ${targetId}/${spec.code}`);
        assert.deepStrictEqual(tuple(row), spec.tuple);
        assert.equal(Number(row.sort_order), Number(spec.sortOrder));
    }
}

async function applyBatch(db, dbPath, options) {
    if (!options || options.confirm !== CONFIRM || !options.backupDir) throw new Error(`Apply requires --confirm ${CONFIRM} and --backup-dir`);
    assertOnly(options.only);
    const preflight = await inspect(db);
    const mutations = preflight.planned.totalDatabaseMutations;
    if (!mutations) return { ...preflight, mode: "apply", writes: 0, backup: null };
    const backup = await CONTENT_RUNNER.backupDatabase(db, options.backupDir);
    if (!backup.verified || backup.schemaVersion !== 11 || backup.integrityCheck !== "ok" || backup.foreignKeyViolations !== 0) throw new Error("Verified schema-v11 backup required before transaction");
    await db.run("BEGIN IMMEDIATE");
    try {
        const locked = await inspect(db);
        assert.deepStrictEqual(locked.planned, preflight.planned, "state/actions changed after backup");
        const productRows = await db.all("SELECT * FROM products WHERE external_id=?", [MAT]);
        if (productRows.length !== 1) throw new Error("IDENTITY_BLOCKED target multiplicity changed after backup");
        const product = productRows[0];
        const before = await snapshot(db);
        const report = { ...locked, _productId: product.id };
        for (const action of locked.contentActions.filter(item => item.action === "UPDATE_OLD_TO_NEW")) {
            const field = action.field;
            const result = await db.run(`UPDATE products SET ${field}=? WHERE id=? AND external_id=? AND title=? AND category=? AND subcategory=? AND brand=? AND weight=? AND unit=? AND is_active=1 AND deleted_at IS NULL AND seo_title=? AND ${field}=?`, [NEW[field], product.id, MAT, PRODUCT.expectedTitle, PRODUCT.expectedCategory, PRODUCT.expectedSubcategory, PRODUCT.expectedBrand, PRODUCT.expectedWeight, PRODUCT.expectedUnit, COPY.seoTitle, OLD[field]]);
            if (result.changes !== 1) throw new Error(`EXACT_CONTENT_GUARD_FAILED ${MAT}.${field}`);
        }
        for (const action of locked.attributeActions) {
            if (action.action === "UPDATE_OLD_TO_NEW") {
                const result = await db.run(`UPDATE product_attribute_values SET value_text=? WHERE id=? AND product_id=? AND attribute_definition_id=? AND value_text=? AND value_number IS NULL AND value_boolean IS NULL AND unit_override IS NULL`, [NEW.purpose, action.valueId, product.id, action.definitionId, OLD.purpose]);
                if (result.changes !== 1) throw new Error("EXACT_PURPOSE_GUARD_FAILED");
            } else if (action.action === "INSERT") {
                const t = action.tuple;
                const result = await db.run(`INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`, [product.id, action.definitionId, t.value_text, t.value_number, t.value_boolean, t.unit_override, action.sortOrder, new Date().toISOString(), new Date().toISOString()]);
                if (result.changes !== 1) throw new Error(`INSERT_COUNT_MISMATCH ${MAT}/${action.code}`);
            }
        }
        const after = await snapshot(db);
        assertOnlyApprovedDelta(before, after, report);
        const post = await inspect(db);
        if (post.planned.totalDatabaseMutations !== 0) throw new Error("Idempotency postcheck failed: mutations remain");
        const integrity = await db.get("PRAGMA integrity_check");
        const foreignKeys = await db.all("PRAGMA foreign_key_check");
        if (integrity?.integrity_check !== "ok" || foreignKeys.length) throw new Error("Post-apply database integrity/FK check failed");
        await db.run("COMMIT");
        return { ...post, mode: "apply", writes: mutations, backup, integrity: "ok", foreignKeyViolations: 0 };
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const db = await openDatabase(options.db, options.apply);
    try {
        const report = options.apply ? await applyBatch(db, options.db, options) : await inspect(db);
        console.log(JSON.stringify(report, null, 2));
        if (report.planned.totalDatabaseMutations && !options.apply) process.exitCode = 0;
    } finally { await db.close(); }
}

module.exports = { MAT, ONLY, CONFIRM, OLD, NEW, CONTENT_FIELDS, assertOnly, parseArgs, openDatabase, schemaGuard, inspect, snapshot, assertOnlyApprovedDelta, applyBatch };
if (require.main === module) main().catch(error => { console.error(`MAT-000129 RECONCILIATION ABORTED: ${error.message}`); process.exitCode = 1; });
