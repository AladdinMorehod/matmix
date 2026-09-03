const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("../sqlite");

const EXTERNAL_ID = "MAT-000005";
const EXPECTED_TITLE = "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг";
const EXPECTED_IMAGE = "/uploads/products/MAT-000005-d1f4af562a9aea7a.webp";
const IMAGE_ALT = "Штукатурка гипсовая ВОЛМА Холст 30 кг";
const CONTENT = Object.freeze({
    brand: "ВОЛМА",
    short_description: "Лёгкая гипсовая штукатурка ручного нанесения для выравнивания стен и потолков внутри помещений. Рекомендуемый слой — 5–30 мм, максимальный — 50 мм.",
    full_description: "Что это:\nВОЛМА-Холст — лёгкая сухая штукатурная смесь на гипсовом вяжущем для ручного нанесения.\n\nОбласть применения:\nПредназначена для выравнивания стен и потолков внутри помещений с нормальной относительной влажностью.\n\nОсновные характеристики:\nРекомендуемая толщина слоя — 5–30 мм, максимальная — 50 мм. Расход при слое 10 мм составляет 9–10 кг/м². Ориентировочное время высыхания слоя 10 мм — 5–7 суток.\n\nПодходящие основания:\nПрименяется для оштукатуривания стен и потолков внутри помещений. Конкретную совместимость основания необходимо учитывать по действующей технической документации производителя и технологии подготовки поверхности.\n\nПрименение:\nРаствор наносят вручную. Работы выполняют при температуре основания и воздуха от +5 до +30 °C. Жизнеспособность приготовленной растворной смеси — не менее 30 минут.\n\nУпаковка:\nБумажный мешок 30 кг.",
    seo_title: "Штукатурка ВОЛМА Холст 30 кг — купить в MatMix",
    seo_description: "ВОЛМА Холст 30 кг — гипсовая штукатурка ручного нанесения для стен и потолков внутри помещений. Расход 9–10 кг/м², заказ в MatMix."
});
const ATTRIBUTES = Object.freeze({
    brand: { type: "text", value: "ВОЛМА" },
    product_type: { type: "text", value: "Лёгкая гипсовая штукатурка ручного нанесения" },
    base: { type: "text", value: "Гипсовое вяжущее" },
    purpose: { type: "text", value: "Выравнивание стен и потолков внутри помещений" },
    package_weight: { type: "number", value: 30, unit: "кг" },
    wall_layer_thickness: { type: "text", value: "5–30 мм; максимум 50 мм" },
    application_temperature: { type: "text", value: "+5…+30 °C" },
    shelf_life: { type: "number", value: 12, unit: "месяцев" }
});
const SKIPPED = ["consumption_10mm", "coverage_30kg_10mm", "ceiling_layer_thickness"];

function helpers(db) {
    return {
        run(sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        close() { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
    };
}

async function open(file) {
    const db = new sqlite3.Database(path.resolve(file));
    await configureBusinessConnection(db);
    return helpers(db);
}

function immutableSnapshot(product) {
    return { id: product.id, external_id: product.external_id, title: product.title, price: product.price, weight: product.weight, unit: product.unit, category: product.category, subcategory: product.subcategory, product_group: product.product_group, image_url: product.image_url, active: product.is_active, source: product.source, last_imported_at: product.last_imported_at };
}

async function inspect(database) {
    const product = await database.get("SELECT * FROM products WHERE external_id=? AND deleted_at IS NULL", [EXTERNAL_ID]);
    if (!product) throw new Error(`${EXTERNAL_ID}: товар не найден или удалён.`);
    if (product.id !== 5 || product.title !== EXPECTED_TITLE) throw new Error(`${EXTERNAL_ID}: identity guard не пройден (id/title не совпадают).`);
    const definitions = await database.all("SELECT id,code,data_type,label FROM product_attribute_definitions WHERE code IN (" + Object.keys(ATTRIBUTES).concat(SKIPPED).map(() => "?").join(",") + ")", Object.keys(ATTRIBUTES).concat(SKIPPED));
    const definitionCounts = new Map(); definitions.forEach(item => definitionCounts.set(item.code, (definitionCounts.get(item.code) || 0) + 1));
    for (const [code, count] of definitionCounts) if (count !== 1) throw new Error(`Definition ${code} разрешается неоднозначно (${count} строк).`);
    const byCode = new Map(definitions.map(item => [item.code, item]));
    for (const [code, expected] of Object.entries(ATTRIBUTES)) {
        const definition = byCode.get(code);
        if (!definition) throw new Error(`Definition отсутствует: ${code}. Создание definitions запрещено.`);
        if (definition.data_type !== expected.type) throw new Error(`Definition ${code}: ожидался тип ${expected.type}, получен ${definition.data_type}.`);
    }
    for (const code of SKIPPED) if (!byCode.has(code)) throw new Error(`Definition отсутствует: ${code}.`);
    const values = await database.all("SELECT v.*,d.code,d.data_type FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=?", [product.id]);
    const counts = new Map(); values.forEach(value => counts.set(value.code, (counts.get(value.code) || 0) + 1));
    for (const code of Object.keys(ATTRIBUTES).concat(SKIPPED)) if ((counts.get(code) || 0) > 1) throw new Error(`Дубликат attribute value для ${code}; автоматическое исправление запрещено.`);
    const primary = await database.get("SELECT id,image_url,alt_text,is_primary FROM product_images WHERE product_id=? AND is_primary=1", [product.id]);
    return { product, definitions: byCode, values, valueByCode: new Map(values.map(value => [value.code, value])), primary, immutable: immutableSnapshot(product), imageMatches: product.image_url === EXPECTED_IMAGE && primary?.image_url === EXPECTED_IMAGE };
}

function changesFor(state) {
    const fields = Object.keys(CONTENT).filter(field => (state.product[field] ?? null) !== CONTENT[field]);
    const attributes = Object.entries(ATTRIBUTES).map(([code, expected]) => {
        const current = state.valueByCode.get(code);
        if (!current) return { code, action: "insert", value: expected.value, unit: expected.unit || null };
        const expectedNumber = expected.type === "number" ? expected.value : null;
        const currentNumber = current.value_number === null || current.value_number === undefined ? null : Number(current.value_number);
        const unchanged = current.value_text === (expected.type === "text" ? expected.value : null) && currentNumber === expectedNumber && (current.unit_override || null) === (expected.unit || null);
        return { code, action: unchanged ? "unchanged" : "update", value: expected.value, unit: expected.unit || null };
    });
    return { fields, definitions: Object.keys(ATTRIBUTES).map(code => ({ code, action: "reused" })), attributes, skipped: SKIPPED, image: state.imageMatches ? (state.primary.alt_text === IMAGE_ALT ? "unchanged" : "update alt_text") : "warning: image URL mismatch; alt_text unchanged" };
}

function hasSemanticChanges(state) {
    if (Object.keys(CONTENT).some(field => (state.product[field] ?? null) !== CONTENT[field])) return true;
    for (const [code, expected] of Object.entries(ATTRIBUTES)) {
        const current = state.valueByCode.get(code);
        const expectedNumber = expected.type === "number" ? expected.value : null;
        const currentNumber = current?.value_number === null || current?.value_number === undefined ? null : Number(current.value_number);
        if (!current || current.value_text !== (expected.type === "text" ? expected.value : null) || currentNumber !== expectedNumber || (current.unit_override || null) !== (expected.unit || null)) return true;
    }
    return Boolean(state.imageMatches && state.primary.alt_text !== IMAGE_ALT);
}

async function apply(database, state) {
    await database.run("BEGIN IMMEDIATE");
    try {
        const repeated = await inspect(database);
        if (repeated.product.id !== state.product.id || JSON.stringify(repeated.immutable) !== JSON.stringify(state.immutable)) throw new Error("Immutable product state changed during preflight.");
        const now = new Date().toISOString();
        const changedFields = Object.keys(CONTENT).filter(field => (state.product[field] ?? null) !== CONTENT[field]);
        if (changedFields.length) await database.run("UPDATE products SET brand=?,short_description=?,full_description=?,seo_title=?,seo_description=?,updated_at=? WHERE id=?", [CONTENT.brand, CONTENT.short_description, CONTENT.full_description, CONTENT.seo_title, CONTENT.seo_description, now, state.product.id]);
        for (const [code, expected] of Object.entries(ATTRIBUTES)) {
            const definition = state.definitions.get(code); const existing = state.valueByCode.get(code);
            const expectedNumber = expected.type === "number" ? expected.value : null;
            const currentNumber = existing?.value_number === null || existing?.value_number === undefined ? null : Number(existing.value_number);
            const needsUpdate = existing && (existing.value_text !== (expected.type === "text" ? expected.value : null) || currentNumber !== expectedNumber || (existing.unit_override || null) !== (expected.unit || null));
            if (existing) {
                if (needsUpdate) await database.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=?,unit_override=?,updated_at=? WHERE id=?", [expected.type === "text" ? expected.value : null, expected.type === "number" ? expected.value : null, null, expected.unit || null, now, existing.id]);
            } else await database.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [state.product.id, definition.id, expected.type === "text" ? expected.value : null, expected.type === "number" ? expected.value : null, null, expected.unit || null, definition.sort_order || 0, now, now]);
        }
        if (state.imageMatches && state.primary.alt_text !== IMAGE_ALT) await database.run("UPDATE product_images SET alt_text=?,updated_at=? WHERE id=? AND product_id=? AND is_primary=1 AND image_url=?", [IMAGE_ALT, now, state.primary.id, state.product.id, EXPECTED_IMAGE]);
        const after = await inspect(database);
        if (after.product.image_url !== state.immutable.image_url || after.primary?.image_url !== state.primary?.image_url) throw new Error("Image preservation guard failed.");
        for (const [field, value] of Object.entries(CONTENT)) if (after.product[field] !== value) throw new Error(`Postcheck failed: ${field}`);
        await database.run("COMMIT");
        return after;
    } catch (error) { await database.run("ROLLBACK").catch(() => {}); throw error; }
}

async function runSeed({ database, apply: shouldApply = false, confirm = "" } = {}) {
    const state = await inspect(database); const changes = changesFor(state);
    if (!shouldApply) return { changed: false, state, changes };
    if (confirm !== "SEED_MAT_000005") throw new Error("Для apply требуется --confirm SEED_MAT_000005.");
    const shouldChange = hasSemanticChanges(state); const after = await apply(database, state); return { changed: shouldChange, state: after, changes: changesFor(after) };
}

async function main() {
    const args = process.argv.slice(2); const shouldApply = args.includes("--apply"); const confirmIndex = args.indexOf("--confirm"); const confirm = confirmIndex >= 0 ? args[confirmIndex + 1] : "";
    const dbArg = args.find(arg => arg.startsWith("--db=")); const file = dbArg ? dbArg.slice(5) : (process.env.MATMIX_DB_PATH || path.join(__dirname, "..", "database", "matmix.db"));
    const database = await open(file);
    try { const result = await runSeed({ database, apply: shouldApply, confirm }); console.log(JSON.stringify({ database: path.resolve(file), product: EXTERNAL_ID, ...result }, null, 2)); }
    finally { await database.close(); }
}

module.exports = { ATTRIBUTES, CONTENT, EXPECTED_IMAGE, EXTERNAL_ID, IMAGE_ALT, SKIPPED, inspect, runSeed };
if (require.main === module) main().catch(error => { console.error(`SEED ABORTED: ${error.message}`); process.exitCode = 1; });
