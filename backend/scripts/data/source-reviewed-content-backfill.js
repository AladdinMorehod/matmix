"use strict";

const plasterCore = require("./plasters-core-content");
const plasterLegacy = require("./plasters-content");
const puttyBatches = [
    ["putties-core-content.js", require("./putties-core-content")],
    ["putties-core-content-batch2.js", require("./putties-core-content-batch2")],
    ["putties-core-content-batch3.js", require("./putties-core-content-batch3")]
];

const MAT_RANGES = Object.freeze({ plaster: [1, 28], putty: [33, 65] });
const MAIN_CODES = Object.freeze(["brand", "product_type", "shelf_life", "package_weight"]);
const makeIds = ([first, last]) => Array.from({ length: last - first + 1 }, (_, index) => `MAT-${String(first + index).padStart(6, "0")}`);

function createProduct(externalId, group) {
    return { externalId, group, category: "Смеси", subcategory: group === "plaster" ? "Штукатурка" : "Шпаклевка", records: [], proposals: [] };
}

const products = new Map();
for (const externalId of [...makeIds(MAT_RANGES.plaster), ...makeIds(MAT_RANGES.putty)]) {
    products.set(externalId, createProduct(externalId, externalId <= "MAT-000028" ? "plaster" : "putty"));
}

function addRecord(moduleName, sourceMap, record) {
    const target = products.get(record.externalId);
    if (!target) throw new Error(`Source dataset contains out-of-scope MAT: ${record.externalId}`);
    target.records.push({ moduleName, sourceMap, record });
    if (record.core && typeof record.core === "object") {
        for (const [code, proposal] of Object.entries(record.core)) {
            if (code !== "brand") target.proposals.push({ code, proposal, moduleName, sourceMap });
        }
    }
    if (record.attributes && typeof record.attributes === "object") {
        for (const [code, proposal] of Object.entries(record.attributes)) {
            if (code !== "brand") target.proposals.push({ code, proposal, moduleName, sourceMap });
        }
    }
}

for (const record of plasterCore.PRODUCTS) addRecord("plasters-core-content.js", plasterCore.SOURCES, record);
for (const record of plasterLegacy.PRODUCTS) addRecord("plasters-content.js", plasterLegacy.SOURCES, record);
for (const [moduleName, data] of puttyBatches) {
    for (const record of data.PRODUCTS) addRecord(moduleName, data.SOURCES, record);
}

const expectedIds = [...makeIds(MAT_RANGES.plaster), ...makeIds(MAT_RANGES.putty)];
if (products.size !== expectedIds.length || expectedIds.some(id => !products.has(id))) throw new Error("Source dataset MAT allowlist is incomplete");
for (const product of products.values()) {
    if (!product.records.length) throw new Error(`No source dataset record for ${product.externalId}`);
}

module.exports = Object.freeze({
    products: Object.freeze([...products.values()].map(product => Object.freeze({
        ...product,
        records: Object.freeze(product.records),
        proposals: Object.freeze(product.proposals)
    }))),
    matRanges: MAT_RANGES,
    mainCodes: MAIN_CODES,
    modules: Object.freeze([
        "plasters-core-content.js", "plasters-content.js", ...puttyBatches.map(([name]) => name)
    ])
});
