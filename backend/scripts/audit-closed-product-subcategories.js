"use strict";

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const EXPECTED_SCHEMA_VERSION = 11;
const TARGET_NAMES = Object.freeze(["Штукатурка", "Шпаклевка", "Кладочные Смеси", "Наливной Пол", "Стяжки Пола"]);
const MAIN_CODES = Object.freeze(["brand", "product_type", "shelf_life", "package_weight"]);
const SHARED_PLACEHOLDER = "/uploads/products/MAT-000001-20260714153714969-3fb7fe.png";
const MIX_BATCH = Object.freeze([
    "MAT-000067", "MAT-000068", "MAT-000069", "MAT-000075", "MAT-000076", "MAT-000077",
    "MAT-000078", "MAT-000079", "MAT-000080", "MAT-000081", "MAT-000082", "MAT-000083",
    "MAT-000084", "MAT-000085", "MAT-000086", "MAT-000087", "MAT-000089", "MAT-000090"
]);
const HISTORICAL_SCOPE = Object.freeze({
    "Штукатурка": Object.freeze(range("MAT-000001", "MAT-000028")),
    "Шпаклевка": Object.freeze(range("MAT-000033", "MAT-000065")),
    "Кладочные Смеси": Object.freeze(range("MAT-000067", "MAT-000069")),
    "Наливной Пол": Object.freeze(range("MAT-000075", "MAT-000087")),
    "Стяжки Пола": Object.freeze(range("MAT-000089", "MAT-000090"))
});
const TEMPLATE_CODES = Object.freeze({
    "Штукатурка": Object.freeze(["base", "purpose", "application_method", "substrates", "color", "wall_layer_thickness", "ceiling_layer_thickness", "consumption_10mm", "application_temperature"]),
    "Шпаклевка": Object.freeze(["base", "purpose", "application_area", "application_method", "substrates", "color", "layer_thickness", "consumption", "application_temperature"]),
    "Кладочные Смеси": Object.freeze(["base", "purpose", "application_area", "application_method", "substrates", "color", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "mortar_grade", "standard"]),
    "Наливной Пол": Object.freeze(["base", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "water_requirement", "pot_life", "application_temperature", "walkability", "compressive_strength", "flexural_strength", "adhesion"]),
    "Стяжки Пола": Object.freeze(["base", "purpose", "application_area", "layer_thickness", "walkability", "flexural_strength"])
});
const EXPECTED_MEMBERSHIPS = Object.freeze({ "Штукатурка": 13, "Шпаклевка": 13, "Кладочные Смеси": 20, "Наливной Пол": 17, "Стяжки Пола": 10 });

function range(first, last) {
    const start = Number(String(first).slice(-6));
    const end = Number(String(last).slice(-6));
    return Array.from({ length: end - start + 1 }, (_, index) => `MAT-${String(start + index).padStart(6, "0")}`);
}

function normalize(value) { return String(value ?? "").normalize("NFKC").split(/\s+/gu).filter(Boolean).join(" ").trim(); }
function key(value) { return normalize(value).toLocaleLowerCase("ru-RU"); }
function hasValue(value) { return value !== null && value !== undefined && String(value).trim() !== ""; }
function json(value) { return JSON.stringify(value); }

function parseArgs(args) {
    const options = { db: null, uploads: null, reportDir: path.join("reports", "product-content"), writeReport: true };
    const seen = new Set();
    for (let index = 0; index < args.length; index += 1) {
        const [flag, ...tail] = String(args[index]).split("=");
        if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
        seen.add(flag);
        if (flag === "--no-report") { if (tail.length) throw new Error("Unexpected value: --no-report"); options.writeReport = false; continue; }
        if (!["--db", "--uploads", "--report-dir"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
        const value = tail.length ? tail.join("=") : args[++index];
        if (!value || String(value).startsWith("--")) throw new Error(`Value required: ${flag}`);
        const optionName = flag.slice(2).split("-").map((part, partIndex) => partIndex ? part.charAt(0).toUpperCase() + part.slice(1) : part).join("");
        options[optionName] = value;
    }
    if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path to an existing database is required");
    return options;
}

function openReadOnly(file) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(resolved, sqlite3.OPEN_READONLY, error => {
            if (error) return reject(error);
            const db = {
                get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
                all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
                close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
            };
            db.all("PRAGMA query_only=ON").then(() => db.all("PRAGMA foreign_keys=ON")).then(() => resolve(db)).catch(async err => { await db.close(); reject(err); });
        });
    });
}

async function tableExists(db, name) { return Boolean(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name])); }
async function columns(db, table) { return new Set((await db.all(`PRAGMA table_info(${table})`)).map(row => row.name)); }
async function readSchema(db) {
    const version = Number((await db.get("PRAGMA user_version")).user_version || 0);
    const templateColumns = await columns(db, "product_attribute_templates");
    const requiredTables = ["products", "catalog_structure", "product_attribute_definitions", "product_attribute_templates", "product_attribute_values", "product_images"];
    const missingTables = [];
    for (const table of requiredTables) if (!await tableExists(db, table)) missingTables.push(table);
    const integrity = await db.get("PRAGMA integrity_check");
    const foreignKeys = await db.all("PRAGMA foreign_key_check");
    return {
        userVersion: version,
        expectedVersion: EXPECTED_SCHEMA_VERSION,
        schemaVersionCompatible: version === EXPECTED_SCHEMA_VERSION,
        templateSectionAvailable: templateColumns.has("section"),
        missingTables,
        integrity: integrity?.integrity_check || "unknown",
        foreignKeyViolations: foreignKeys.length,
        productionTemplateAuditAvailable: version === EXPECTED_SCHEMA_VERSION && templateColumns.has("section") && missingTables.length === 0
    };
}

async function loadStructures(db) {
    const rows = await db.all("SELECT s.id,s.parent_id,s.type,s.name,s.normalized_name,s.external_code,s.is_active,s.is_system,p.name AS parent_name,p.type AS parent_type,p.is_active AS parent_active FROM catalog_structure s LEFT JOIN catalog_structure p ON p.id=s.parent_id WHERE s.type='subcategory' ORDER BY s.name,s.id");
    const allByName = new Map(TARGET_NAMES.map(name => [name, rows.filter(row => key(row.name) === key(name))]));
    const structures = [];
    for (const name of TARGET_NAMES) {
        const matches = allByName.get(name) || [];
        const active = matches.filter(row => Number(row.is_active) === 1);
        const structure = active.length === 1 ? active[0] : active[0] || matches[0] || null;
        structures.push({ name, matches, activeMatches: active, structure, expectedMemberships: EXPECTED_MEMBERSHIPS[name], expectedCodes: [...MAIN_CODES, ...TEMPLATE_CODES[name]], expectedMainCodes: [...MAIN_CODES], expectedRegularCodes: [...TEMPLATE_CODES[name]] });
    }
    return structures;
}

async function loadProducts(db, structures) {
    const products = [];
    const deleted = [];
    const rows = await db.all("SELECT * FROM products ORDER BY id");
    for (const row of rows) {
        const item = structures.find(candidate => key(row.subcategory) === key(candidate.name));
        if (!item) continue;
        (row.deleted_at || Number(row.is_active) !== 1 ? deleted : products).push({ ...row, auditedSubcategory: item.name, auditedStructure: item });
    }
    return { products, deleted };
}

async function duplicateExternalIds(db) {
    return db.all("SELECT external_id,COUNT(*) AS count FROM products WHERE external_id IS NOT NULL AND trim(external_id)<>'' GROUP BY external_id HAVING COUNT(*)>1 ORDER BY external_id");
}

function countBy(rows, field) { return rows.reduce((map, row) => map.set(row[field], (map.get(row[field]) || 0) + 1), new Map()); }

async function inspectTemplates(db, structures, schema) {
    const result = [];
    const definitions = await db.all("SELECT id,code,label,data_type,default_unit,default_section,sort_order,is_active FROM product_attribute_definitions ORDER BY id");
    const defById = new Map(definitions.map(row => [Number(row.id), row]));
    const defByCode = new Map();
    const duplicateDefinitions = [];
    for (const definition of definitions) {
        if (defByCode.has(definition.code)) duplicateDefinitions.push(definition.code); else defByCode.set(definition.code, definition);
    }
    for (const item of structures) {
        const structure = item.structure;
        const rows = structure ? await db.all(`SELECT t.id,t.structure_id,t.attribute_definition_id,${schema.templateSectionAvailable ? "t.section," : "NULL AS section,"}t.sort_order,t.is_required,t.unit_override,d.code,d.label,d.data_type,d.default_unit,d.default_section,d.is_active AS definition_active
            FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? ORDER BY t.sort_order,t.id`, [structure.id]) : [];
        const byCode = new Map(); const duplicateMemberships = []; const orphanDefinitions = []; const inactiveDefinitions = [];
        for (const row of rows) {
            if (!row.code) { orphanDefinitions.push(row.attribute_definition_id); continue; }
            if (byCode.has(row.code)) duplicateMemberships.push(row.code); else byCode.set(row.code, row);
            if (Number(row.definition_active) !== 1) inactiveDefinitions.push(row.code);
        }
        const expected = new Set(item.expectedCodes);
        const missingCodes = item.expectedCodes.filter(code => !byCode.has(code));
        const unlistedCodes = [...byCode.keys()].filter(code => !expected.has(code));
        const unitOverrides = rows.filter(row => hasValue(row.unit_override)).map(row => ({ code: row.code, unit: row.unit_override }));
        const sectionAvailable = schema.templateSectionAvailable;
        const mainRows = sectionAvailable ? rows.filter(row => row.section === "main") : [];
        const regularRows = sectionAvailable ? rows.filter(row => row.section === "regular") : [];
        const mainOrder = mainRows.sort((a, b) => Number(a.sort_order) - Number(b.sort_order)).map(row => row.code);
        const regularOrder = regularRows.sort((a, b) => Number(a.sort_order) - Number(b.sort_order)).map(row => row.code);
        const invalidSections = sectionAvailable ? rows.filter(row => !["main", "regular"].includes(row.section)).map(row => row.code) : [];
        const sectionIssue = sectionAvailable && (mainOrder.join("\u0000") !== MAIN_CODES.join("\u0000") || regularOrder.join("\u0000") !== TEMPLATE_CODES[item.name].join("\u0000") || invalidSections.length > 0);
        const issues = [];
        if (item.matches.length !== 1 || item.activeMatches.length !== 1) issues.push({ code: "STRUCTURE_COUNT", detail: `matches=${item.matches.length}, active=${item.activeMatches.length}` });
        const definitionIdsKnown = rows.filter(row => row.code).every(row => defById.has(Number(row.attribute_definition_id)) && defByCode.has(row.code));
        if (structure && (key(structure.parent_name) !== key("Смеси") || key(structure.parent_type) !== key("category") || Number(structure.parent_active) !== 1)) issues.push({ code: "PARENT_STRUCTURE", detail: { parentName: structure.parent_name || null, parentType: structure.parent_type || null, parentActive: structure.parent_active ?? null } });
        if (rows.length !== item.expectedMemberships) issues.push({ code: "MEMBERSHIP_COUNT", detail: `${rows.length}/${item.expectedMemberships}` });
        if (missingCodes.length) issues.push({ code: "MISSING_MEMBERSHIP", detail: missingCodes });
        if (unlistedCodes.length) issues.push({ code: "UNLISTED_MEMBERSHIP", detail: unlistedCodes });
        if (duplicateMemberships.length) issues.push({ code: "DUPLICATE_MEMBERSHIP", detail: duplicateMemberships });
        if (orphanDefinitions.length) issues.push({ code: "ORPHAN_DEFINITION", detail: orphanDefinitions });
        if (inactiveDefinitions.length) issues.push({ code: "INACTIVE_DEFINITION", detail: inactiveDefinitions });
        if (!definitionIdsKnown) issues.push({ code: "MISSING_DEFINITION", detail: "One or more template memberships reference a missing definition" });
        if (duplicateDefinitions.length) issues.push({ code: "DUPLICATE_DEFINITION_CODE", detail: duplicateDefinitions });
        if (sectionIssue) issues.push({ code: "SECTION_OR_ORDER", detail: { mainOrder, expectedMain: MAIN_CODES, regularOrder, expectedRegular: TEMPLATE_CODES[item.name], invalidSections } });
        if (!sectionAvailable) issues.push({ code: "SECTION_UNAVAILABLE_IN_SCHEMA", detail: "Cannot prove main/regular integrity on schema without templates.section" });
        result.push({ subcategory: item.name, structureId: structure?.id || null, structureMatches: item.matches.length, activeStructureMatches: item.activeMatches.length, expectedMemberships: item.expectedMemberships, expectedCodes: item.expectedCodes, expectedMainCodes: item.expectedMainCodes, expectedRegularCodes: item.expectedRegularCodes, actualMemberships: rows.length, sectionAvailable, mainOrder, regularOrder, invalidSections, missingCodes, unlistedCodes, duplicateMemberships, orphanDefinitions, inactiveDefinitions, unitOverrides, duplicateDefinitionCodes: duplicateDefinitions, issues, status: issues.length ? "TEMPLATE_REVIEW" : "TEMPLATE_OK", definitionCount: definitions.length, definitionIdsKnown });
    }
    return result;
}

function valueValidity(row) {
    const fields = [row.value_text, row.value_number, row.value_boolean].filter(value => value !== null && value !== undefined);
    if (fields.length !== 1) return "VALUE_TYPE_CARDINALITY";
    if (row.data_type === "text" && (!hasValue(row.value_text) || String(row.value_text).length > 2000)) return "VALUE_TEXT_INVALID";
    if (row.data_type === "number" && (typeof row.value_number !== "number" || !Number.isFinite(row.value_number))) return "VALUE_NUMBER_INVALID";
    if (row.data_type === "boolean" && ![0, 1].includes(Number(row.value_boolean))) return "VALUE_BOOLEAN_INVALID";
    return null;
}

async function inspectAttributes(db, products, schema) {
    const rows = []; const valuesByProduct = new Map();
    for (const product of products) {
        const structure = product.auditedStructure.structure;
        const templateRows = structure ? await db.all(`SELECT t.id,t.attribute_definition_id,${schema.templateSectionAvailable ? "t.section," : "NULL AS section,"}t.sort_order,t.is_required,t.unit_override,d.code,d.label,d.data_type,d.default_unit,d.default_section,d.is_active AS definition_active
            FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? ORDER BY t.sort_order,t.id`, [structure.id]) : [];
        const values = await db.all(`SELECT v.id,v.product_id,v.attribute_definition_id,v.value_text,v.value_number,v.value_boolean,v.unit_override,v.sort_order,d.code,d.label,d.data_type,d.default_unit,d.default_section,d.is_active AS definition_active
            FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`, [product.id]);
        valuesByProduct.set(product.id, values);
        const templateByCode = new Map(templateRows.filter(row => row.code).map(row => [row.code, row]));
        const valuesByCode = new Map(); const duplicates = []; const invalid = []; const inactive = []; const outOfTemplate = [];
        for (const value of values) {
            if (valuesByCode.has(value.code)) duplicates.push(value.code); else valuesByCode.set(value.code, value);
            const issue = valueValidity(value); if (issue) invalid.push({ code: value.code, issue });
            if (Number(value.definition_active) !== 1) inactive.push(value.code);
            if (!templateByCode.has(value.code)) outOfTemplate.push(value.code);
        }
        const missing = templateRows.filter(template => !valuesByCode.has(template.code) || !hasValue(valuesByCode.get(template.code).value_text) && valuesByCode.get(template.code)?.value_number === null && valuesByCode.get(template.code)?.value_boolean === null).map(template => template.code);
        const requiredMissing = templateRows.filter(template => Number(template.is_required) === 1 && missing.includes(template.code)).map(template => template.code);
        const mainTemplate = schema.templateSectionAvailable ? templateRows.filter(row => row.section === "main") : [];
        const regularTemplate = schema.templateSectionAvailable ? templateRows.filter(row => row.section === "regular") : [];
        const present = templateRows.filter(template => !missing.includes(template.code)).map(template => template.code);
        const mainMissing = schema.templateSectionAvailable ? mainTemplate.filter(template => missing.includes(template.code)).map(template => template.code) : null;
        const regularMissing = schema.templateSectionAvailable ? regularTemplate.filter(template => missing.includes(template.code)).map(template => template.code) : null;
        const brandValue = valuesByCode.get("brand");
        const brandAttr = brandValue ? (brandValue.value_text ?? brandValue.value_number ?? brandValue.value_boolean) : null;
        const brandMismatch = brandValue && hasValue(product.brand) && key(brandAttr) !== key(product.brand);
        const mainCanonical = Object.fromEntries(MAIN_CODES.map(code => [code, code === "brand" ? hasValue(product.brand) : present.includes(code)]));
        const anomalies = [...invalid, ...inactive.map(code => ({ code, issue: "INACTIVE_DEFINITION" })), ...duplicates.map(code => ({ code, issue: "DUPLICATE" })), ...outOfTemplate.map(code => ({ code, issue: "NOT_IN_TEMPLATE" }))];
        const attributeStatus = anomalies.length ? "ATTR_ANOMALY" : requiredMissing.length ? "ATTR_REQUIRED_MISSING" : missing.length ? "ATTR_PARTIAL" : "ATTR_OK";
        rows.push({ externalId: product.external_id, title: product.title, totalTemplateAttributes: templateRows.length, presentCount: present.length, present, missing, requiredMissing, mainPresent: schema.templateSectionAvailable ? mainTemplate.filter(row => present.includes(row.code) || row.code === "brand" && hasValue(product.brand)).map(row => row.code) : null, mainMissing, regularPresent: schema.templateSectionAvailable ? regularTemplate.filter(row => present.includes(row.code)).map(row => row.code) : null, regularMissing, mainCanonical, outOfTemplate, inactiveDefinitions: inactive, anomalies, brand: { productsBrand: product.brand || null, attributeBrand: brandAttr || null, canonicalSource: "products.brand; runtime injects it into main brand rendering", mismatch: Boolean(brandMismatch) }, attributeStatus });
    }
    return { rows, valuesByProduct };
}

function effectiveSeo(product) {
    const explicitTitle = normalize(product.seo_title); const explicitDescription = normalize(product.seo_description);
    const fallbackTitle = normalize(product.title) ? `${normalize(product.title)} | MatMix` : "";
    const effectiveTitle = explicitTitle || fallbackTitle;
    const effectiveMeta = explicitDescription || normalize(product.short_description) || normalize(product.description) || (normalize(product.title) ? `Код ${product.external_id}. Каталог MatMix.` : "");
    const visible = normalize(product.full_description) || normalize(product.description);
    const fields = { seo_title: Boolean(explicitTitle), seo_description: Boolean(explicitDescription), short_description: Boolean(normalize(product.short_description)), full_description: Boolean(normalize(product.full_description)), description: Boolean(normalize(product.description)) };
    const status = !effectiveTitle || !effectiveMeta || !visible ? "SEO_MISSING" : explicitTitle && explicitDescription ? "SEO_OK" : "SEO_PARTIAL";
    return { ...fields, effectiveTitle, effectiveMetaDescription: effectiveMeta, visibleDescriptionPresent: Boolean(visible), status };
}

async function inspectSeo(products) {
    const rows = products.map(product => ({ externalId: product.external_id, ...effectiveSeo(product) }));
    const titleMap = countBy(rows.filter(row => row.seo_title).map(row => ({ value: row.effectiveTitle })), "value");
    const descriptionMap = countBy(rows.filter(row => row.seo_description).map(row => ({ value: row.effectiveMetaDescription })), "value");
    for (const row of rows) {
        row.duplicateEffectiveTitle = (titleMap.get(row.effectiveTitle) || 0) > 1;
        row.duplicateEffectiveDescription = (descriptionMap.get(row.effectiveMetaDescription) || 0) > 1;
        if (row.duplicateEffectiveTitle || row.duplicateEffectiveDescription) row.status = "SEO_ANOMALY";
    }
    return { rows, duplicateTitles: [...titleMap].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count })), duplicateDescriptions: [...descriptionMap].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count })) };
}

function expectedMixSeo() {
    try {
        const data = require("./data/mixes-seo-batch1");
        const source = data.CONFIRMED_MATS || data.RECORDS || data.records || [];
        const map = new Map();
        for (const item of source) if (item?.externalId && (item.proposedSeoTitle || item.seoTitle)) map.set(item.externalId, { seoTitle: item.proposedSeoTitle || item.seoTitle, seoDescription: item.proposedSeoDescription || item.seoDescription });
        return { available: map.size > 0, map, source: "repository data/mixes-seo-batch1" };
    } catch { return { available: false, map: new Map(), source: null }; }
}

async function inspectMixSeo(db, products) {
    const expected = expectedMixSeo(); const byId = new Map(products.map(product => [product.external_id, product]));
    const rows = MIX_BATCH.map(externalId => { const product = byId.get(externalId); const present = Boolean(product && normalize(product.seo_title) && normalize(product.seo_description)); const expectedPair = expected.map.get(externalId); const matchesPrepared = Boolean(product && expectedPair && product.seo_title === expectedPair.seoTitle && product.seo_description === expectedPair.seoDescription); return { externalId, present, matchesPrepared: expected.available ? matchesPrepared : null, actualTitle: product?.seo_title || null, actualDescription: product?.seo_description || null, subcategory: product?.subcategory || null }; });
    const absent = rows.filter(row => !row.present).map(row => row.externalId); const mismatched = expected.available ? rows.filter(row => row.present && !row.matchesPrepared).map(row => row.externalId) : [];
    return { expectedSourceAvailable: expected.available, expectedSource: expected.source, rows, absent, mismatched, productionApplyEvidence: expected.available ? (absent.length === 0 && mismatched.length === 0 ? "ALL_VALUES_MATCH_PREPARED_DATA" : "VALUES_DO_NOT_MATCH_PREPARED_DATA") : (absent.length === 0 ? "ALL_18_SEO_PAIRS_PRESENT;_PREPARED_DATA_NOT_AVAILABLE" : "SEO_PAIRS_MISSING") };
}

function normalizeImageUrl(value) { const raw = normalize(value); return /^\/uploads\/products\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(raw) ? raw : null; }

async function inspectImages(db, products, uploadsPath) {
    const rows = []; const allUrls = new Map();
    for (const product of products) {
        const gallery = await db.all("SELECT id,image_url,alt_text,sort_order,is_primary,created_at,updated_at FROM product_images WHERE product_id=? ORDER BY sort_order,id", [product.id]);
        const urls = gallery.map(row => normalize(row.image_url)).filter(Boolean); const primary = gallery.filter(row => Number(row.is_primary) === 1); const invalid = gallery.filter(row => !normalizeImageUrl(row.image_url)); const duplicateWithin = [...countBy(gallery.map(row => ({ value: normalize(row.image_url) })), "value")].filter(([, count]) => count > 1).map(([value]) => value);
        for (const url of urls) { if (!allUrls.has(url)) allUrls.set(url, []); allUrls.get(url).push(product.external_id); }
        let status = "IMAGE_OK"; const issues = [];
        if (!product.image_url && !gallery.length) { status = "IMAGE_MISSING"; issues.push("NO_IMAGE_REFERENCE"); }
        if (String(product.image_url || "").trim() === SHARED_PLACEHOLDER || gallery.some(row => normalize(row.image_url) === SHARED_PLACEHOLDER)) { status = "IMAGE_LEGACY_PLACEHOLDER"; issues.push("SHARED_PLACEHOLDER"); }
        if (primary.length > 1) { status = "IMAGE_MULTIPLE_PRIMARY"; issues.push("MULTIPLE_PRIMARY"); }
        else if (gallery.length > 0 && primary.length === 0) { status = "IMAGE_NO_PRIMARY"; issues.push("NO_PRIMARY"); }
        if (invalid.length || duplicateWithin.length) { status = "IMAGE_ANOMALY"; issues.push(...(invalid.length ? ["INVALID_LOCAL_REFERENCE"] : []), ...(duplicateWithin.length ? ["DUPLICATE_URL_WITHIN_PRODUCT"] : [])); }
        const physical = uploadsPath ? gallery.concat(product.image_url ? [{ image_url: product.image_url, source: "products" }] : []).map(row => { const url = normalizeImageUrl(row.image_url); if (!url) return { imageUrl: row.image_url || null, status: "UNSAFE_OR_EXTERNAL" }; const file = path.join(path.resolve(uploadsPath), path.basename(url)); try { const stat = fs.statSync(file); return { imageUrl: url, file, status: stat.isFile() ? (stat.size ? "OK" : "ZERO_BYTE") : "NOT_FILE", bytes: stat.size || 0 }; } catch { return { imageUrl: url, file, status: "MISSING_FILE" }; } }) : [];
        rows.push({ externalId: product.external_id, productsImage: product.image || null, productsImageUrl: product.image_url || null, productImagesCount: gallery.length, primaryCount: primary.length, primaryUrls: primary.map(row => row.image_url), gallery: gallery.map(row => ({ id: row.id, imageUrl: row.image_url, isPrimary: Number(row.is_primary) === 1 })), duplicateUrlsWithinProduct: duplicateWithin, invalidReferences: invalid.map(row => row.image_url), physical, issues, status });
    }
    const globalDuplicateUrls = [...allUrls].filter(([, ids]) => ids.length > 1 && !ids.includes(SHARED_PLACEHOLDER)).map(([url, ids]) => ({ url, externalIds: ids }));
    return { rows, globalDuplicateUrls, sharedPlaceholder: SHARED_PLACEHOLDER };
}

function readiness(product, attr, seo, image) {
    const flags = []; if (!hasValue(product.external_id)) flags.push("CARD_REVIEW:EXTERNAL_ID_MISSING"); if (!hasValue(product.slug)) flags.push("CARD_REVIEW:SLUG_MISSING"); if (!hasValue(product.title)) flags.push("CARD_REVIEW:TITLE_MISSING"); if (Number(product.is_active) !== 1 || product.deleted_at) flags.push("CARD_REVIEW:INACTIVE_OR_DELETED");
    if (["ATTR_ANOMALY", "ATTR_REQUIRED_MISSING"].includes(attr.attributeStatus)) flags.push(`ANOMALY:${attr.attributeStatus}`);
    if (["SEO_MISSING", "SEO_ANOMALY"].includes(seo.status)) flags.push(seo.status);
    if (["IMAGE_MISSING", "IMAGE_LEGACY_PLACEHOLDER", "IMAGE_NO_PRIMARY", "IMAGE_MULTIPLE_PRIMARY", "IMAGE_ANOMALY"].includes(image.status)) flags.push(image.status);
    return { publicDataStatus: flags.length ? "CARD_REVIEW" : "READY", flags };
}

function buildMarkdown(report) {
    const lines = ["# Final audit of closed product subcategories", "", "This report is deterministic for a fixed database and uploads tree; no database or upload mutations are performed.", "", "## Summary", "", "| Subcategory | Products | Attr OK | Attr Partial | SEO OK | SEO Issues | Image OK | Image Issues | Blockers | Status |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---|"];
    for (const row of report.summary) lines.push(`| ${row.subcategory} | ${row.products} | ${row.attrOk} | ${row.attrPartial} | ${row.seoOk} | ${row.seoIssues} | ${row.imageOk} | ${row.imageIssues} | ${row.blockers} | ${row.status} |`);
    lines.push("", "## Scope reconciliation", "", `Schema version: ${report.schema.userVersion}; expected production version: ${EXPECTED_SCHEMA_VERSION}; production template audit available: ${report.schema.productionTemplateAuditAvailable}.`, "", "| Subcategory | Active products | Deleted/inactive informational | Unexpected MAT | Historical MAT missing |", "|---|---:|---:|---|---|");
    for (const row of report.scope) lines.push(`| ${row.subcategory} | ${row.activeCount} | ${row.deletedCount} | ${row.unexpected.join(", ") || "—"} | ${row.historicalMissing.join(", ") || "—"} |`);
    lines.push("", "## Template integrity", "", "| Subcategory | Structure matches | Memberships | Section available | Main order | Issues | Status |", "|---|---:|---:|---|---|---|---|");
    for (const row of report.templates) lines.push(`| ${row.subcategory} | ${row.activeStructureMatches}/${row.structureMatches} | ${row.actualMemberships}/${row.expectedMemberships} | ${row.sectionAvailable ? "yes" : "no"} | ${row.mainOrder.join(", ") || "—"} | ${row.issues.map(issue => issue.code).join(", ") || "—"} | ${row.status} |`);
    lines.push("", "## Per-product reconciliation", "", "| MAT | Title | Attr | Missing | Required missing | SEO | Image | Public/Data | Flags |", "|---|---|---|---|---|---|---|---|---|");
    for (const row of report.products) lines.push(`| ${row.externalId} | ${String(row.title || "").split("|").join("\\|")} | ${row.attributeStatus} | ${row.missing.length} | ${row.requiredMissing.length} | ${row.seoStatus} | ${row.imageStatus} | ${row.publicDataStatus} | ${row.flags.join(", ") || "—"} |`);
    lines.push("", "## Attribute coverage", "", "The audit distinguishes present, missing, required missing, invalid, out-of-template and inactive-definition values. Optional missing values are reported and are not automatically treated as source blockers.", "", "| MAT | Template total | Present | Missing | Main present/missing | Regular present/missing | Out-of-template | Anomalies |", "|---|---:|---:|---:|---|---|---|---|");
    for (const row of report.attributeCoverage) lines.push(`| ${row.externalId} | ${row.totalTemplateAttributes} | ${row.presentCount} | ${row.missing.length} | ${row.mainPresent === null ? "unavailable" : `${row.mainPresent.length}/${row.mainMissing.length}`} | ${row.regularPresent === null ? "unavailable" : `${row.regularPresent.length}/${row.regularMissing.length}`} | ${row.outOfTemplate.join(", ") || "—"} | ${row.anomalies.map(item => `${item.code}:${item.issue}`).join(", ") || "—"} |`);
    lines.push("", "## Main attribute coverage", "", "Canonical brand source in the current runtime is `products.brand`; `attribute-order` injects it into the main brand row. Any raw attribute brand value is compared and reported separately.", "", "| MAT | products.brand | attribute brand | Product type | Shelf life | Package weight | Mismatch |", "|---|---|---|---|---|---|---|");
    for (const row of report.attributeCoverage) lines.push(`| ${row.externalId} | ${row.brand.productsBrand || "—"} | ${row.brand.attributeBrand || "—"} | ${row.present.includes("product_type") ? "present" : "missing"} | ${row.present.includes("shelf_life") ? "present" : "missing"} | ${row.present.includes("package_weight") ? "present" : "missing"} | ${row.brand.mismatch ? "yes" : "no"} |`);
    lines.push("", "## SEO verification", "", "Effective title uses `seo_title` with the existing product title fallback. Effective meta description uses `seo_description`, then short/legacy description, then the existing code/catalog fallback. Visible product description uses `full_description`, then legacy `description`.", "", "| MAT | seo_title | seo_description | short | full | legacy description | Effective title/meta/visible | Status |", "|---|---|---|---|---|---|---|---|");
    for (const row of report.seo.rows) lines.push(`| ${row.externalId} | ${row.seo_title ? "yes" : "no"} | ${row.seo_description ? "yes" : "no"} | ${row.short_description ? "yes" : "no"} | ${row.full_description ? "yes" : "no"} | ${row.description ? "yes" : "no"} | ${row.effectiveTitle ? "title" : ""}/${row.effectiveMetaDescription ? "meta" : ""}/${row.visibleDescriptionPresent ? "visible" : ""} | ${row.status} |`);
    lines.push("", "### Mix SEO batch production verification", "", `Expected data module available: ${report.mixSeo.expectedSourceDataAvailable}. Commit presence is not used as evidence. Evidence is based on factual values in the audited DB: **${report.mixSeo.productionApplyEvidence}**.`, "", "| MAT | SEO pair present | Matches prepared data |", "|---|---|---|");
    for (const row of report.mixSeo.rows) lines.push(`| ${row.externalId} | ${row.present ? "yes" : "no"} | ${row.matchesPrepared === null ? "not comparable" : row.matchesPrepared ? "yes" : "no"} |`);
    lines.push("", "## Image verification", "", "DB image audit does not establish visual quality. The exact shared placeholder signature comes from the existing cleanup script.", "", "| MAT | products.image | products.image_url | Gallery rows | Primary rows | Status | Physical check |", "|---|---|---|---:|---:|---|---|");
    for (const row of report.images.rows) lines.push(`| ${row.externalId} | ${row.productsImage || "—"} | ${row.productsImageUrl || "—"} | ${row.productImagesCount} | ${row.primaryCount} | ${row.status} | ${row.physical.length ? row.physical.map(item => item.status).join(", ") : "not run"} |`);
    lines.push("", "## Upload file verification", "", `Uploads audit mode: ${report.uploads.status}. No files were modified.`, "", "## Data anomalies", "", `Duplicate external_id values: ${report.duplicateExternalIds.length ? report.duplicateExternalIds.map(row => `${row.external_id} (${row.count})`).join(", ") : "none"}.`, `Global duplicate image URLs: ${report.images.globalDuplicateUrls.length}. Foreign-key violations: ${report.schema.foreignKeyViolations}. Integrity check: ${report.schema.integrity}.`);
    lines.push("", "## Blocking issues", "", ...(report.blockingIssues.length ? report.blockingIssues.map(issue => `- ${issue}`) : ["- None detected in the audited data; local schema incompatibility still prevents a production template conclusion."]));
    lines.push("", "## Non-blocking informational findings", "", "- Optional missing attributes are reported as coverage gaps and are not source blockers by themselves.", "- Price, weight and unit states are reported as data readiness information; no automatic corrections are made.", "- Visual image quality is not established by this DB/file audit.");
    lines.push("", "## Final conclusion", "", ...report.subcategoryConclusions.map(row => `- ${row.subcategory}: **${row.status}**${row.blockingMats.length ? ` — ${row.blockingMats.join(", ")}` : ""}`));
    if (!report.schema.productionTemplateAuditAvailable) lines.push("", "Production conclusion is intentionally withheld because this run used a schema without `product_attribute_templates.section`; run the command below against production schema v11.");
    return `${lines.join("\n")}\n`;
}

async function auditDatabase(options) {
    const db = await openReadOnly(options.db);
    try {
        const schema = await readSchema(db); const structures = await loadStructures(db); const { products, deleted } = await loadProducts(db, structures); const duplicateIds = await duplicateExternalIds(db); const templates = await inspectTemplates(db, structures, schema); const { rows: attributeCoverage } = await inspectAttributes(db, products, schema); const seo = await inspectSeo(products); const images = await inspectImages(db, products, options.uploads && path.resolve(options.uploads)); const mixSeo = await inspectMixSeo(db, products);
        const productById = new Map(products.map(row => [row.external_id, row])); const attrById = new Map(attributeCoverage.map(row => [row.externalId, row])); const seoById = new Map(seo.rows.map(row => [row.externalId, row])); const imageById = new Map(images.rows.map(row => [row.externalId, row]));
        const productRows = products.map(product => { const attr = attrById.get(product.external_id); const seoRow = seoById.get(product.external_id); const image = imageById.get(product.external_id); const readinessRow = readiness(product, attr, seoRow, image); return { externalId: product.external_id, title: product.title, subcategory: product.auditedSubcategory, attributeStatus: attr.attributeStatus, missing: attr.missing, requiredMissing: attr.requiredMissing, seoStatus: seoRow.status, imageStatus: image.status, publicDataStatus: readinessRow.publicDataStatus, priceState: product.price === null ? "NULL" : Number(product.price) === 0 ? "ZERO" : "SET", weight: product.weight, unit: product.unit || null, stockStatus: product.stock_status || null, slugPresent: hasValue(product.slug), active: Number(product.is_active) === 1, deleted: Boolean(product.deleted_at), flags: readinessRow.flags }; });
        const scope = structures.map(item => { const active = products.filter(product => product.auditedSubcategory === item.name); const gone = deleted.filter(product => product.auditedSubcategory === item.name); const actual = new Set(active.map(row => row.external_id)); const expected = new Set(HISTORICAL_SCOPE[item.name]); return { subcategory: item.name, activeCount: active.length, deletedCount: gone.length, externalIds: active.map(row => row.external_id), deletedExternalIds: gone.map(row => row.external_id), unexpected: active.map(row => row.external_id).filter(id => !expected.has(id)), historicalMissing: [...expected].filter(id => !actual.has(id)) }; });
        const summary = structures.map(item => { const rows = productRows.filter(row => row.subcategory === item.name); const attrs = rows.map(row => row.attributeStatus); const seos = rows.map(row => row.seoStatus); const imgs = rows.map(row => row.imageStatus); const blockers = rows.filter(row => row.flags.some(flag => /^(ANOMALY|SEO_MISSING|IMAGE_|CARD_REVIEW)/.test(flag))).length; const template = templates.find(row => row.subcategory === item.name); const status = schema.productionTemplateAuditAvailable && !template.issues.length && blockers === 0 ? "DATA_CLOSED" : "NOT_CLOSED"; return { subcategory: item.name, products: rows.length, attrOk: attrs.filter(value => value === "ATTR_OK").length, attrPartial: attrs.filter(value => value === "ATTR_PARTIAL").length, seoOk: seos.filter(value => value === "SEO_OK").length, seoIssues: seos.filter(value => value !== "SEO_OK").length, imageOk: imgs.filter(value => value === "IMAGE_OK").length, imageIssues: imgs.filter(value => value !== "IMAGE_OK").length, blockers, status }; });
        const subcategoryConclusions = structures.map(item => { const rows = productRows.filter(row => row.subcategory === item.name); const blockerRows = rows.filter(row => row.flags.length > 0); const template = templates.find(row => row.subcategory === item.name); const blockers = [...blockerRows.map(row => row.externalId), ...(template.issues.length ? ["TEMPLATE_INTEGRITY"] : [])]; return { subcategory: item.name, status: schema.productionTemplateAuditAvailable && blockers.length === 0 ? "CLOSED" : "NOT CLOSED", blockingMats: [...new Set(blockers.filter(value => value !== "TEMPLATE_INTEGRITY"))] }; });
        const uploads = options.uploads ? { status: fs.existsSync(path.resolve(options.uploads)) ? "CHECKED_READ_ONLY" : "PATH_NOT_FOUND", path: path.resolve(options.uploads) } : { status: "NOT_REQUESTED", path: null };
        const blockingIssues = []; if (!schema.productionTemplateAuditAvailable) blockingIssues.push(`Schema ${schema.userVersion} is not production-compatible schema ${EXPECTED_SCHEMA_VERSION}; template section/order conclusion withheld.`); if (duplicateIds.length) blockingIssues.push(`Duplicate external_id values: ${json(duplicateIds)}`); for (const row of templates) for (const issue of row.issues.filter(item => item.code !== "SECTION_UNAVAILABLE_IN_SCHEMA")) blockingIssues.push(`${row.subcategory}: ${issue.code}`); for (const row of productRows.filter(row => row.flags.length)) blockingIssues.push(`${row.externalId}: ${row.flags.join(", ")}`);
        return { readOnly: true, deterministic: true, database: path.resolve(options.db), schema, scope, duplicateExternalIds: duplicateIds, templates, products: productRows, attributeCoverage, mainAttributeCodes: [...MAIN_CODES], seo, mixSeo: { expectedSourceDataAvailable: mixSeo.expectedSourceAvailable, productionApplyEvidence: mixSeo.productionApplyEvidence, rows: mixSeo.rows, absent: mixSeo.absent, mismatched: mixSeo.mismatched }, images, uploads, summary, subcategoryConclusions, blockingIssues };
    } finally { await db.close(); }
}

async function main(args = process.argv.slice(2)) {
    const options = parseArgs(args);
    const report = await auditDatabase(options); if (options.writeReport) { const dir = path.resolve(options.reportDir); fs.mkdirSync(dir, { recursive: true }); await fs.promises.writeFile(path.join(dir, "closed-subcategories-final-audit.json"), `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8" }); await fs.promises.writeFile(path.join(dir, "closed-subcategories-final-audit.md"), buildMarkdown(report), { encoding: "utf8" }); }
    console.log(JSON.stringify({ readOnly: report.readOnly, schema: report.schema, summary: report.summary, mixSeo: { expectedSourceDataAvailable: report.mixSeo.expectedSourceDataAvailable, productionApplyEvidence: report.mixSeo.productionApplyEvidence }, conclusions: report.subcategoryConclusions, reportsWritten: options.writeReport }, null, 2));
    return report;
}

if (require.main === module) main().catch(error => { console.error(`CLOSED SUBCATEGORY AUDIT ABORTED: ${error.message}`); process.exitCode = 1; });

module.exports = { EXPECTED_SCHEMA_VERSION, EXPECTED_MEMBERSHIPS, HISTORICAL_SCOPE, MAIN_CODES, MIX_BATCH, TEMPLATE_CODES, buildMarkdown, auditDatabase, normalize, openReadOnly, parseArgs };
