const assert = require("assert");
const {
    buildCatalogImportPreview,
    createCatalogImportPreviewToken,
    buildMatPlanInputFromPreview,
    buildMatPlanPreview,
    buildPriceChangesPreview,
    updateCatalogImportResolutions,
    getUnsupportedMatBatchReassignments,
    getCatalogImportPreviewTokenResolutions
} = require("../services/catalogImport");

(async function main() {

const products = [
    { id: 478, title: "Пергамин 15м2", externalId: "MAT-000541", deletedAt: null, source: "excel", isActive: 1 },
    { id: 901, title: "Пробковый компенсатор 15х90 х 4мм", externalId: "MAT-000900", deletedAt: null, source: "excel", isActive: 1 },
    { id: 902, title: "Незатронутый товар", externalId: "MAT-000777", deletedAt: null, source: "excel", isActive: 1 }
];
const parsed = {
    errors: [],
    warnings: [],
    sheetName: "ШАБЛОН",
    rowsRead: 2,
    categoryRows: [],
    subcategoryRows: [],
    productRows: [
        { rowNumber: 10, title: products[0].title, externalId: "MAT-000542", category: "Cat", subcategory: "Sub" },
        { rowNumber: 20, title: products[1].title, externalId: "MAT-000541", category: "Cat", subcategory: "Sub" }
    ]
};
const changes = {
    updated: [
        { rowNumber: 10, productId: 478, externalId: "MAT-000542", incomingExternalId: "MAT-000542" },
        { rowNumber: 20, productId: 901, externalId: "MAT-000541", incomingExternalId: "MAT-000541" }
    ],
    unchanged: [],
    new: [],
    requiresReview: [],
    excluded: []
};

const planInput = buildMatPlanInputFromPreview({ parsed, changes, dbProducts: products, resolutions: new Map() });
const plan = buildMatPlanPreview({ parsed, changes, dbProducts: products, resolutions: new Map(), planInput });
assert.strictEqual(plan.valid, true);
assert.deepStrictEqual(plan.reassignments.map(item => [item.productId, item.oldMat, item.targetMat]), [
    [478, "MAT-000541", "MAT-000542"],
    [901, "MAT-000900", "MAT-000541"]
]);
assert.strictEqual(plan.finalOwnerByMat["MAT-000541"], 901);
assert.strictEqual(plan.finalOwnerByMat["MAT-000542"], 478);
assert.strictEqual(plan.finalOwnerByMat["MAT-000777"], 902);
assert.strictEqual(getUnsupportedMatBatchReassignments(plan).length, 2);
assert.strictEqual(getUnsupportedMatBatchReassignments({ reassignments: [{ oldMat: "", targetMat: "MAT-000004" }] }).length, 0);

const fakeDb = {
    get: async sql => sql.includes("FROM products") ? { id: 478 } : null,
    all: async sql => sql.includes("catalog_structure") ? [
        { id: 1, type: "category", name: "Cat", normalized_name: "cat", external_code: "CAT-000001", parent_id: null, sort_order: 1, is_active: 1, is_system: 0 },
        { id: 2, type: "subcategory", name: "Sub", normalized_name: "sub", external_code: "SUB-000001", parent_id: 1, sort_order: 1, is_active: 1, is_system: 0 }
    ] : products.map(product => ({
        id: product.id,
        external_id: product.externalId,
        title: product.title,
        category: "Cat",
        subcategory: "Sub",
        product_group: "",
        price: 100,
        weight: 1,
        unit: "шт",
        sort_order: 1,
        source: product.source,
        is_active: product.isActive,
        deleted_at: product.deletedAt
    }))
};
const previewWithoutResolution = await buildCatalogImportPreview(fakeDb, parsed, { name: "pergamin.xlsx" });
assert.strictEqual(previewWithoutResolution.matPlan.valid, true);
assert.deepStrictEqual(previewWithoutResolution.matPlan.reassignments.map(item => item.productId), [478, 901]);
const resolutions = new Map([
    ["10:MAT-000542:cat:sub", { rowId: "10:MAT-000542:cat:sub", action: "accept_excel_mat", productId: 478, externalId: "MAT-000542" }],
    ["20:MAT-000541:cat:sub", { rowId: "20:MAT-000541:cat:sub", action: "accept_excel_mat", productId: 901, externalId: "MAT-000541" }]
]);
const previewWithResolution = await buildCatalogImportPreview(fakeDb, parsed, { name: "pergamin.xlsx" }, { resolutions });
assert.strictEqual(previewWithResolution.matPlan.valid, true);
assert.deepStrictEqual(previewWithResolution.matPlan.reassignments.map(item => item.productId), [478, 901]);
assert.strictEqual(previewWithResolution.canImport, true);

const resolutionParsed = {
    ...parsed,
    productRows: [{ rowNumber: 10, title: products[0].title, externalId: "MAT-000542", category: "Cat", subcategory: "Sub" }]
};
const resolutionToken = await createCatalogImportPreviewToken(fakeDb, resolutionParsed, { name: "atomic.xlsx" }, { id: 1 }, Buffer.from("atomic"));
const atomicInitial = getCatalogImportPreviewTokenResolutions(resolutionToken.token);
let atomicFailure = null;
try {
    await updateCatalogImportResolutions(fakeDb, resolutionToken.token, [
        { rowNumber: 10, action: "map_existing", productId: 478 },
        { rowId: "missing-row", action: "unsupported_action", productId: 478 }
    ], { id: 1 });
} catch (error) {
    atomicFailure = error;
}
assert.strictEqual(atomicFailure?.code, "INVALID_IMPORT_RESOLUTION");
assert.deepStrictEqual(Array.from(getCatalogImportPreviewTokenResolutions(resolutionToken.token).entries()), Array.from(atomicInitial.entries()));
const atomicSuccess = await updateCatalogImportResolutions(fakeDb, resolutionToken.token, [
    { rowNumber: 10, action: "map_existing", productId: 478 }
], { id: 1 });
assert.strictEqual(atomicSuccess.success, true);
assert.strictEqual(atomicSuccess.data.preview.matPlan.valid, true);
const storedAfterSuccess = Array.from(getCatalogImportPreviewTokenResolutions(resolutionToken.token).values());
assert.strictEqual(storedAfterSuccess.length, 1);
assert.strictEqual(storedAfterSuccess[0].action, "map_existing");
assert.strictEqual(storedAfterSuccess[0].productId, 478);

const identityPreview = await buildCatalogImportPreview(fakeDb, {
    ...parsed,
    productRows: [{ rowNumber: 30, title: products[1].title, externalId: "MAT-000541", category: "Cat", subcategory: "Sub", productGroup: "" }]
}, { name: "identity.xlsx" });
const identityItem = [...identityPreview.changes.updated, ...identityPreview.changes.unchanged][0];
assert.strictEqual(identityItem.productId, 901);
assert(identityPreview.matPlan.conflicts.some(conflict => conflict.code === "TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT"));

const unresolvedIdentity = buildMatPlanPreview({
    parsed,
    changes: { updated: [], unchanged: [], new: [], requiresReview: [{ rowNumber: 30, candidates: [] }], excluded: [] },
    dbProducts: products,
    resolutions: new Map()
});
assert(unresolvedIdentity.conflicts.some(conflict => conflict.code === "UNRESOLVED_IDENTITY"));

const unresolvedPreview = await buildCatalogImportPreview(fakeDb, {
    ...parsed,
    productRows: [{ rowNumber: 31, title: "Несопоставимый товар", externalId: "MAT-000541", category: "Cat", subcategory: "Sub" }]
}, { name: "unresolved.xlsx" });
assert(unresolvedPreview.changes.missingFromFile.some(item => Number(item.productId) === 478));

const excludedPreview = await buildCatalogImportPreview(fakeDb, {
    ...parsed,
    productRows: [{ rowNumber: 32, title: "Несопоставимый товар", externalId: "MAT-000541", category: "Cat", subcategory: "Sub" }]
}, { name: "excluded.xlsx" }, {
    resolutions: new Map([["32:MAT-000541:cat:sub", { rowId: "32:MAT-000541:cat:sub", action: "exclude" }]])
});
assert(excludedPreview.changes.missingFromFile.some(item => Number(item.productId) === 478));

const explicitIdentity = buildMatPlanPreview({
    parsed,
    changes: { updated: [{ rowNumber: 30, productId: 901, externalId: "MAT-000541" }], unchanged: [], new: [], requiresReview: [], excluded: [] },
    dbProducts: products,
    resolutions: new Map(),
    planInput: { products, rows: [{ sourceRowId: "30", productId: 901, targetMat: "MAT-000541" }] }
});
assert.strictEqual(explicitIdentity.reassignments.find(item => item.sourceRowId === "30").productId, 901);

const swapProducts = [
    { id: 1, title: "A", externalId: "MAT-000001" },
    { id: 2, title: "B", externalId: "MAT-000002" }
];
const swapRows = [
    { sourceRowId: "a", productId: 1, targetMat: "MAT-000002" },
    { sourceRowId: "b", productId: 2, targetMat: "MAT-000001" }
];
const swapPlan = buildMatPlanPreview({ parsed: { productRows: [] }, changes: {}, dbProducts: swapProducts, resolutions: new Map(), planInput: { products: swapProducts, rows: swapRows } });
assert.strictEqual(swapPlan.valid, true);
const chainProducts = [
    { id: 1, title: "A", externalId: "MAT-000001" },
    { id: 2, title: "B", externalId: "MAT-000002" },
    { id: 3, title: "C", externalId: "MAT-000003" }
];
const chainPlan = buildMatPlanPreview({ parsed: { productRows: [] }, changes: {}, dbProducts: chainProducts, resolutions: new Map(), planInput: {
    products: chainProducts,
    rows: [
        { sourceRowId: "a", productId: 1, targetMat: "MAT-000002" },
        { sourceRowId: "b", productId: 2, targetMat: "MAT-000003" },
        { sourceRowId: "c", productId: 3, targetMat: "MAT-000004" }
    ]
} });
assert.strictEqual(chainPlan.valid, true);
const excludedPlan = buildMatPlanPreview({ parsed: { productRows: [] }, changes: {}, dbProducts: swapProducts, resolutions: new Map(), planInput: {
    products: swapProducts,
    rows: [{ sourceRowId: "a", productId: 1, targetMat: "MAT-000002", action: "exclude" }]
} });
assert.strictEqual(excludedPlan.valid, true);
assert.strictEqual(excludedPlan.finalOwnerByMat["MAT-000002"], 2);

const pricePreview = buildPriceChangesPreview([{ id: 901, title: products[1].title, externalId: "MAT-000900", price: 100 }], [
    { rowNumber: 1, productId: 901, externalId: "MAT-000541", priceText: "120", rawPrice: "120" },
    { rowNumber: 2, externalId: "MAT-000541", priceText: "999", rawPrice: "999" }
]);
assert.strictEqual(pricePreview.changed, 1);
assert.strictEqual(pricePreview.items[0].productId, 901);

const wrongIdentityChanges = {
    ...changes,
    updated: [{ rowNumber: 10, productId: 478, externalId: "MAT-000541", incomingExternalId: "MAT-000541" }],
    new: [{ rowNumber: 20, title: products[1].title, externalId: "MAT-000541", classification: "TRUE_NEW" }]
};
const wrongIdentityPlan = buildMatPlanPreview({
    parsed,
    changes: wrongIdentityChanges,
    dbProducts: products,
    resolutions: new Map()
});
assert.strictEqual(wrongIdentityPlan.valid, false);
assert(wrongIdentityPlan.conflicts.some(conflict => conflict.code === "DUPLICATE_TARGET_MAT"));

const unresolvedPlan = buildMatPlanPreview({
    parsed,
    changes: { updated: [], unchanged: [], new: [], requiresReview: [{ rowNumber: 20, candidates: [] }], excluded: [] },
    dbProducts: products,
    resolutions: new Map()
});
assert.strictEqual(unresolvedPlan.valid, false);
assert(unresolvedPlan.conflicts.some(conflict => conflict.code === "UNRESOLVED_IDENTITY"));

// Explicit operator mapping may intentionally select an existing product when
// the automatic candidate list is empty (for example, a package-size change).
const packageChangeProduct = {
    id: 224,
    title: "Очиститель эпоксидной затирки Litokol Litonet Gel Evo 0,75л",
    externalId: "MAT-000256",
    deletedAt: null,
    source: "excel",
    isActive: 1
};
const packageChangeParsed = {
    ...parsed,
    productRows: [{
        rowNumber: 264,
        title: "Очиститель эпоксидной затирки Litokol Litonet Gel Evo 1л",
        externalId: "MAT-000256",
        category: "Cat",
        subcategory: "Sub",
        price: 2700,
        weight: 1,
        unit: "шт",
        sortOrder: 5
    }]
};
const packageChangeDb = {
    get: async (sql, params = []) => {
        if (sql.includes("FROM products")) return Number(params[0]) === 224 ? { id: 224 } : null;
        return null;
    },
    all: async sql => sql.includes("catalog_structure") ? [
        { id: 1, type: "category", name: "Cat", normalized_name: "cat", external_code: "CAT-000001", parent_id: null, sort_order: 1, is_active: 1, is_system: 0 },
        { id: 2, type: "subcategory", name: "Sub", normalized_name: "sub", external_code: "SUB-000001", parent_id: 1, sort_order: 1, is_active: 1, is_system: 0 }
    ] : [packageChangeProduct].map(product => ({
        id: product.id,
        external_id: product.externalId,
        title: product.title,
        category: "Cat",
        subcategory: "Sub",
        product_group: "",
        price: 1732.5,
        weight: 0.8,
        unit: "шт",
        sort_order: 5,
        source: product.source,
        is_active: product.isActive,
        deleted_at: product.deletedAt
    }))
};
const packageChangeToken = await createCatalogImportPreviewToken(packageChangeDb, packageChangeParsed, { name: "package-change.xlsx" }, { id: 1 }, Buffer.from("package-change"));
const packageChangeResolution = await updateCatalogImportResolutions(packageChangeDb, packageChangeToken.token, [
    { rowNumber: 264, action: "map_existing", productId: 224 }
], { id: 1 });
assert.strictEqual(packageChangeResolution.data.canImport, true);
assert.strictEqual(packageChangeResolution.data.preview.matPlan.valid, true);
assert.strictEqual(packageChangeResolution.data.preview.matPlan.finalOwnerByMat["MAT-000256"], 224);
assert.strictEqual(packageChangeResolution.data.preview.matPlan.reassignments.some(item => item.productId === 224), false);
assert.strictEqual(packageChangeResolution.data.preview.changes.missingFromFile.some(item => Number(item.productId) === 224), false);

let unknownProductError = null;
try {
    await updateCatalogImportResolutions(packageChangeDb, packageChangeToken.token, [
        { rowNumber: 264, action: "map_existing", productId: 9999 }
    ], { id: 1 });
} catch (error) {
    unknownProductError = error;
}
assert.strictEqual(unknownProductError?.code, "INVALID_IMPORT_PRODUCT");

console.log(JSON.stringify({ success: true, cases: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"] }));
})();
