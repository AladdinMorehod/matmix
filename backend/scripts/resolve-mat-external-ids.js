const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const {
    parseCatalogExcel,
    normalizeMatCode,
    validateMatCode
} = require("../services/catalogImport");

const databasePath = process.env.MATMIX_DB_PATH || path.join(__dirname, "..", "database", "matmix.db");
const databaseDir = path.dirname(databasePath);
const backupsDir = path.join(databaseDir, "backups");
const reportsDir = process.env.MATMIX_REPORTS_PATH || path.join(__dirname, "..", "reports");

function timestampForFile(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join("-") + "-" + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join("-");
}

function openDatabase() {
    return new sqlite3.Database(databasePath);
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(error) {
            if (error) {
                reject(error);
                return;
            }

            resolve({ changes: this.changes });
        });
    });
}

function get(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(row);
        });
    });
}

function all(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(rows);
        });
    });
}

function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close(error => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function normalizeSimpleText(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeCatalogMatchText(value) {
    return String(value || "")
        .normalize("NFKC")
        .replace(/\u00a0/g, " ")
        .replace(/[‐‑‒–—―]/g, "-")
        .replace(/[“”„«»]/g, '"')
        .replace(/[‘’‚]/g, "'")
        .replace(/[\\]/g, "/")
        .replace(/[×хХ*]/g, "x")
        .replace(/м\s*[²2]/gi, "м2")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s*([x/(),-])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function exactKey(item) {
    return [
        item.title,
        item.category,
        item.subcategory,
        item.productGroup ?? item.product_group
    ].map(normalizeSimpleText).join("\u001f");
}

function normalizedKey(item) {
    return [
        item.title,
        item.category,
        item.subcategory,
        item.productGroup ?? item.product_group
    ].map(normalizeCatalogMatchText).join("\u001f");
}

function normalizedTitle(item) {
    return normalizeCatalogMatchText(item.title);
}

function normalizeUnit(value) {
    return normalizeCatalogMatchText(value).replace(/^шту?к?\.?$/, "шт");
}

function hasMatExternalId(product) {
    return validateMatCode(product.external_id || "");
}

function numberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function equalNumbers(first, second) {
    const a = numberOrNull(first);
    const b = numberOrNull(second);
    if (a === null || b === null) return false;
    return Math.abs(a - b) < 0.000001;
}

function createIndex(rows, getKey) {
    const index = new Map();
    rows.forEach(row => {
        const key = getKey(row);
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(row);
    });
    return index;
}

function toReportProduct(product) {
    return {
        id: product.id,
        externalId: product.external_id || "",
        title: product.title || "",
        category: product.category || "",
        subcategory: product.subcategory || "",
        productGroup: product.product_group || "",
        price: product.price === null || product.price === undefined ? null : Number(product.price),
        weight: Number(product.weight) || 0,
        unit: product.unit || "",
        sortOrder: Number(product.sort_order) || 0
    };
}

function toReportExcelRow(row) {
    return {
        rowNumber: row.rowNumber,
        externalId: row.externalId,
        title: row.title || "",
        category: row.category || "",
        subcategory: row.subcategory || "",
        productGroup: row.productGroup || "",
        unit: row.unit || "",
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        sortOrder: Number(row.sortOrder) || 0
    };
}

function textSimilarity(first, second) {
    const a = normalizeCatalogMatchText(first);
    const b = normalizeCatalogMatchText(second);
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    const aTokens = new Set(a.split(/[\s,()-]+/).filter(Boolean));
    const bTokens = new Set(b.split(/[\s,()-]+/).filter(Boolean));
    const intersection = Array.from(aTokens).filter(token => bTokens.has(token)).length;
    const union = new Set([...aTokens, ...bTokens]).size || 1;
    return Number((intersection / union).toFixed(3));
}

function getMatchedFields(excelRow, product) {
    const checks = [
        ["title", excelRow.title, product.title, normalizeCatalogMatchText],
        ["category", excelRow.category, product.category, normalizeCatalogMatchText],
        ["subcategory", excelRow.subcategory, product.subcategory, normalizeCatalogMatchText],
        ["productGroup", excelRow.productGroup, product.product_group, normalizeCatalogMatchText],
        ["unit", excelRow.unit, product.unit, normalizeUnit],
        ["price", excelRow.price, product.price, value => numberOrNull(value)],
        ["weight", excelRow.weight, product.weight, value => numberOrNull(value)],
        ["sortOrder", excelRow.sortOrder, product.sort_order, value => Number(value) || 0]
    ];

    return checks
        .filter(([, first, second, normalize]) => Object.is(normalize(first), normalize(second)))
        .map(([field]) => field);
}

function getDifferentFields(excelRow, product) {
    const checks = [
        ["title", excelRow.title, product.title, normalizeCatalogMatchText],
        ["category", excelRow.category, product.category, normalizeCatalogMatchText],
        ["subcategory", excelRow.subcategory, product.subcategory, normalizeCatalogMatchText],
        ["productGroup", excelRow.productGroup, product.product_group, normalizeCatalogMatchText],
        ["unit", excelRow.unit, product.unit, normalizeUnit],
        ["price", excelRow.price, product.price, value => numberOrNull(value)],
        ["weight", excelRow.weight, product.weight, value => numberOrNull(value)],
        ["sortOrder", excelRow.sortOrder, product.sort_order, value => Number(value) || 0]
    ];

    return checks
        .filter(([, first, second, normalize]) => !Object.is(normalize(first), normalize(second)))
        .map(([field]) => field);
}

function getAttributeCandidateDiagnostics(row, candidates, selectedProduct = null, selectionField = "") {
    return candidates.map(product => {
        const matchedFields = getMatchedFields(row, product);
        const differentFields = getDifferentFields(row, product);
        let rejectionReason = "";

        if (selectedProduct && Number(product.id) === Number(selectedProduct.id)) {
            rejectionReason = "SELECTED";
        } else if (selectionField && differentFields.includes(selectionField)) {
            rejectionReason = `REJECTED_BY_${selectionField.toUpperCase()}`;
        } else if (selectedProduct) {
            rejectionReason = "REJECTED_BY_PREVIOUS_FILTERS";
        }

        return {
            ...toReportProduct(product),
            matchedFields,
            differentFields,
            rejectionReason
        };
    });
}

function getCodePointDiff(first, second) {
    const a = Array.from(String(first || ""));
    const b = Array.from(String(second || ""));
    const maxLength = Math.max(a.length, b.length);
    const diffs = [];

    for (let index = 0; index < maxLength; index += 1) {
        if (a[index] === b[index]) continue;
        diffs.push({
            index,
            excelChar: a[index] || "",
            excelCodePoint: a[index] ? `U+${a[index].codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}` : "",
            dbChar: b[index] || "",
            dbCodePoint: b[index] ? `U+${b[index].codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}` : ""
        });
        if (diffs.length >= 12) break;
    }

    return diffs;
}

function getNearestCandidates(excelRow, products) {
    const category = normalizeCatalogMatchText(excelRow.category);
    const subcategory = normalizeCatalogMatchText(excelRow.subcategory);
    const productGroup = normalizeCatalogMatchText(excelRow.productGroup);

    return products
        .filter(product => normalizeCatalogMatchText(product.category) === category)
        .filter(product => normalizeCatalogMatchText(product.subcategory) === subcategory)
        .filter(product => !productGroup || normalizeCatalogMatchText(product.product_group) === productGroup)
        .map(product => ({
            ...toReportProduct(product),
            similarity: textSimilarity(excelRow.title, product.title),
            differentFields: getDifferentFields(excelRow, product),
            titleDiagnostics: (excelRow.title.includes("?") || String(product.title || "").includes("?"))
                ? {
                    excelTitleJson: JSON.stringify(excelRow.title),
                    dbTitleJson: JSON.stringify(product.title || ""),
                    codePointDiff: getCodePointDiff(excelRow.title, product.title)
                }
                : undefined
        }))
        .sort((first, second) => second.similarity - first.similarity || first.sortOrder - second.sortOrder || first.id - second.id)
        .slice(0, 5);
}

function makeResolution(row, product, method, details = {}) {
    return {
        rowNumber: row.rowNumber,
        externalId: row.externalId,
        productId: product.id,
        title: product.title,
        method,
        oldExternalId: product.external_id || "",
        ...details
    };
}

function filterByAttributes(row, candidates) {
    let filtered = candidates;
    const filters = [
        product => normalizeCatalogMatchText(product.category) === normalizeCatalogMatchText(row.category),
        product => normalizeCatalogMatchText(product.subcategory) === normalizeCatalogMatchText(row.subcategory),
        product => normalizeCatalogMatchText(product.product_group) === normalizeCatalogMatchText(row.productGroup),
        product => normalizeUnit(product.unit) === normalizeUnit(row.unit),
        product => equalNumbers(product.price, row.price),
        product => equalNumbers(product.weight, row.weight),
        product => Number(product.sort_order) === Number(row.sortOrder)
    ];

    for (const filter of filters) {
        const next = filtered.filter(filter);
        if (next.length === 1) return next;
        if (next.length > 1) filtered = next;
    }

    return filtered;
}

function resolveByAttributesWithDiagnostics(row, candidates) {
    let filtered = candidates;
    const filters = [
        {
            field: "category",
            usesPrice: false,
            usesWeight: false,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => normalizeCatalogMatchText(product.category) === normalizeCatalogMatchText(row.category)
        },
        {
            field: "subcategory",
            usesPrice: false,
            usesWeight: false,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => normalizeCatalogMatchText(product.subcategory) === normalizeCatalogMatchText(row.subcategory)
        },
        {
            field: "productGroup",
            usesPrice: false,
            usesWeight: false,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => normalizeCatalogMatchText(product.product_group) === normalizeCatalogMatchText(row.productGroup)
        },
        {
            field: "unit",
            usesPrice: false,
            usesWeight: false,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => normalizeUnit(product.unit) === normalizeUnit(row.unit)
        },
        {
            field: "price",
            usesPrice: true,
            usesWeight: false,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => equalNumbers(product.price, row.price)
        },
        {
            field: "weight",
            usesPrice: true,
            usesWeight: true,
            usesSortOrder: false,
            usesExcelRowProximity: false,
            match: product => equalNumbers(product.weight, row.weight)
        },
        {
            field: "sortOrder",
            usesPrice: true,
            usesWeight: true,
            usesSortOrder: true,
            usesExcelRowProximity: false,
            match: product => Number(product.sort_order) === Number(row.sortOrder)
        }
    ];

    for (const filter of filters) {
        const next = filtered.filter(filter.match);
        if (next.length === 1) {
            return {
                selectedProduct: next[0],
                diagnostics: {
                    excel: toReportExcelRow(row),
                    selectedCandidate: toReportProduct(next[0]),
                    otherCandidates: getAttributeCandidateDiagnostics(row, candidates, next[0], filter.field)
                        .filter(candidate => Number(candidate.id) !== Number(next[0].id)),
                    selectionRule: {
                        method: "RESOLVED_BY_ATTRIBUTES",
                        uniqueByField: filter.field,
                        usedPrice: filter.usesPrice,
                        usedWeight: filter.usesWeight,
                        usedSortOrder: filter.usesSortOrder,
                        usedExcelRowProximity: filter.usesExcelRowProximity,
                        candidateCountBeforeField: filtered.length,
                        candidateCountAfterField: next.length
                    }
                }
            };
        }
        if (next.length > 1) filtered = next;
    }

    return {
        selectedProduct: null,
        diagnostics: null
    };
}

function buildDuplicateSequenceResolutions(rows, products, assignedRows, assignedProducts, usedMatCodes) {
    const resolutions = [];
    const rowsByKey = createIndex(rows.filter(row => !assignedRows.has(row.rowNumber)), exactKey);
    const productsByKey = createIndex(products.filter(product => !assignedProducts.has(product.id)), exactKey);

    rowsByKey.forEach((groupRows, key) => {
        if (groupRows.length < 2) return;
        const candidates = productsByKey.get(key) || [];
        const uniqueMatCodes = new Set(groupRows.map(row => row.externalId));
        if (groupRows.length !== candidates.length || uniqueMatCodes.size !== groupRows.length) return;
        if (groupRows.some(row => usedMatCodes.has(row.externalId))) return;
        if (candidates.some(product => hasMatExternalId(product))) return;

        const sortedRows = groupRows.slice().sort((first, second) => first.rowNumber - second.rowNumber);
        const sortedProducts = candidates.slice().sort((first, second) => {
            return (Number(first.sort_order) || 0) - (Number(second.sort_order) || 0)
                || Number(first.id) - Number(second.id);
        });
        const hasAttributeMismatch = sortedRows.some((row, index) => {
            const product = sortedProducts[index];
            return normalizeUnit(row.unit) !== normalizeUnit(product.unit)
                || (numberOrNull(row.price) !== null && !equalNumbers(row.price, product.price))
                || (numberOrNull(row.weight) !== null && !equalNumbers(row.weight, product.weight));
        });

        if (hasAttributeMismatch) return;

        sortedRows.forEach((row, index) => {
            resolutions.push(makeResolution(row, sortedProducts[index], "RESOLVED_DUPLICATE_SEQUENCE"));
        });
    });

    return resolutions;
}

function getDuplicateSequenceBlockers(groupRows, candidates, linkedItems) {
    const blockers = [];
    const uniqueMatCodes = new Set(groupRows.map(row => row.externalId));
    const remainingRows = groupRows.length - linkedItems.length;
    const remainingCandidates = candidates.length - linkedItems.length;

    if (groupRows.length !== candidates.length) {
        blockers.push(`COUNT_MISMATCH excel=${groupRows.length} db=${candidates.length}`);
    }
    if (uniqueMatCodes.size !== groupRows.length) {
        blockers.push("DUPLICATE_MAT_INSIDE_GROUP");
    }
    if (candidates.some(product => hasMatExternalId(product))) {
        blockers.push("DB_CANDIDATE_ALREADY_HAS_MAT");
    }
    if (linkedItems.length > 0) {
        blockers.push(`PARTIALLY_LINKED linked=${linkedItems.length} remainingExcel=${remainingRows} remainingDb=${remainingCandidates}`);
    }

    const sortedRows = groupRows.slice().sort((first, second) => first.rowNumber - second.rowNumber);
    const sortedProducts = candidates.slice().sort((first, second) => {
        return (Number(first.sort_order) || 0) - (Number(second.sort_order) || 0)
            || Number(first.id) - Number(second.id);
    });
    const hasAttributeMismatch = sortedRows.some((row, index) => {
        const product = sortedProducts[index];
        if (!product) return true;
        return normalizeUnit(row.unit) !== normalizeUnit(product.unit)
            || (numberOrNull(row.price) !== null && !equalNumbers(row.price, product.price))
            || (numberOrNull(row.weight) !== null && !equalNumbers(row.weight, product.weight));
    });

    if (hasAttributeMismatch) {
        blockers.push("ATTRIBUTE_MISMATCH_IN_STABLE_ORDER");
    }

    return blockers.length ? blockers : ["DUPLICATE_SEQUENCE_NOT_APPLICABLE"];
}

function buildPartiallyResolvedDuplicateGroups(rows, products, resolutions) {
    const rowsByKey = createIndex(rows, exactKey);
    const productsByKey = createIndex(products, exactKey);
    const resolutionsByRow = new Map(resolutions.map(item => [item.rowNumber, item]));
    const groups = [];

    rowsByKey.forEach((groupRows, key) => {
        if (groupRows.length < 2) return;

        const candidates = productsByKey.get(key) || [];
        if (candidates.length < 2) return;

        const candidateIds = new Set(candidates.map(product => Number(product.id)));
        const linkedItems = groupRows
            .map(row => resolutionsByRow.get(row.rowNumber))
            .filter(item => item && candidateIds.has(Number(item.productId)));

        if (!linkedItems.length || linkedItems.length >= groupRows.length) return;

        const linkedProductIds = new Set(linkedItems.map(item => Number(item.productId)));
        groups.push({
            key,
            excelRows: groupRows
                .slice()
                .sort((first, second) => first.rowNumber - second.rowNumber)
                .map(toReportExcelRow),
            dbCandidates: candidates
                .slice()
                .sort((first, second) => (Number(first.sort_order) || 0) - (Number(second.sort_order) || 0) || Number(first.id) - Number(second.id))
                .map(toReportProduct),
            linkedProducts: linkedItems.map(item => ({
                rowNumber: item.rowNumber,
                externalId: item.externalId,
                productId: item.productId,
                method: item.method,
                title: item.title
            })),
            remainingFreeProducts: candidates
                .filter(product => !linkedProductIds.has(Number(product.id)))
                .map(toReportProduct),
            duplicateSequenceNotAppliedBecause: getDuplicateSequenceBlockers(groupRows, candidates, linkedItems)
        });
    });

    return groups;
}

function validatePlan(plan, dbProductsById, matOwners) {
    const conflicts = [];
    const productToMat = new Map();
    const matToProduct = new Map();

    plan.forEach(item => {
        const product = dbProductsById.get(item.productId);
        const ownerId = matOwners.get(item.externalId);
        if (!product) {
            conflicts.push({ ...item, reason: "PRODUCT_NOT_FOUND" });
            return;
        }
        if (hasMatExternalId(product)) {
            conflicts.push({ ...item, reason: "PRODUCT_ALREADY_LINKED" });
        }
        if (ownerId && Number(ownerId) !== Number(item.productId)) {
            conflicts.push({ ...item, reason: "MAT_ALREADY_USED", ownerId });
        }
        if (productToMat.has(item.productId)) {
            conflicts.push({ ...item, reason: "PRODUCT_HAS_MULTIPLE_MAT", previousMat: productToMat.get(item.productId) });
        }
        if (matToProduct.has(item.externalId)) {
            conflicts.push({ ...item, reason: "DUPLICATE_MAT_IN_PLAN", previousProductId: matToProduct.get(item.externalId) });
        }

        productToMat.set(item.productId, item.externalId);
        matToProduct.set(item.externalId, item.productId);
    });

    return conflicts;
}

function buildResolutionReport(parsedRows, dbProducts) {
    const dbProductsById = new Map(dbProducts.map(product => [product.id, product]));
    const matOwners = new Map();
    dbProducts.forEach(product => {
        const code = normalizeMatCode(product.external_id);
        if (validateMatCode(code)) matOwners.set(code, product.id);
    });

    const excelRows = [];
    const duplicateMat = [];
    const invalidMat = [];
    const seenMat = new Map();

    parsedRows.forEach(row => {
        const externalId = normalizeMatCode(row.externalId);
        if (!externalId) return;
        if (!validateMatCode(externalId)) {
            invalidMat.push({ rowNumber: row.rowNumber, externalId: row.externalId, title: row.title });
            return;
        }
        if (seenMat.has(externalId)) {
            duplicateMat.push({ rowNumber: row.rowNumber, firstRowNumber: seenMat.get(externalId), externalId, title: row.title });
            return;
        }
        seenMat.set(externalId, row.rowNumber);
        excelRows.push({ ...row, externalId });
    });

    const alreadyLinked = [];
    const rowsToResolve = [];
    excelRows.forEach(row => {
        const ownerId = matOwners.get(row.externalId);
        if (ownerId) {
            const product = dbProductsById.get(ownerId);
            alreadyLinked.push({
                rowNumber: row.rowNumber,
                externalId: row.externalId,
                productId: ownerId,
                title: product?.title || row.title
            });
            return;
        }
        rowsToResolve.push(row);
    });

    const freeProducts = dbProducts.filter(product => !hasMatExternalId(product));
    const exactIndex = createIndex(freeProducts, exactKey);
    const normalizedIndex = createIndex(freeProducts, normalizedKey);
    const titleIndex = createIndex(freeProducts, normalizedTitle);
    const assignedRows = new Set();
    const assignedProducts = new Set();
    const usedMatCodes = new Set(alreadyLinked.map(item => item.externalId));
    const resolutions = [];

    function addResolution(row, product, method) {
        if (assignedRows.has(row.rowNumber) || assignedProducts.has(product.id) || usedMatCodes.has(row.externalId)) return false;
        resolutions.push(makeResolution(row, product, method));
        assignedRows.add(row.rowNumber);
        assignedProducts.add(product.id);
        usedMatCodes.add(row.externalId);
        return true;
    }

    function addDetailedResolution(row, product, method, details) {
        if (assignedRows.has(row.rowNumber) || assignedProducts.has(product.id) || usedMatCodes.has(row.externalId)) return false;
        resolutions.push(makeResolution(row, product, method, details));
        assignedRows.add(row.rowNumber);
        assignedProducts.add(product.id);
        usedMatCodes.add(row.externalId);
        return true;
    }

    rowsToResolve.forEach(row => {
        const matches = (exactIndex.get(exactKey(row)) || []).filter(product => !assignedProducts.has(product.id));
        if (matches.length === 1) addResolution(row, matches[0], "RESOLVED_EXACT");
    });

    rowsToResolve.forEach(row => {
        if (assignedRows.has(row.rowNumber)) return;
        const matches = (normalizedIndex.get(normalizedKey(row)) || []).filter(product => !assignedProducts.has(product.id));
        if (matches.length === 1) addResolution(row, matches[0], "RESOLVED_NORMALIZED");
    });

    rowsToResolve.forEach(row => {
        if (assignedRows.has(row.rowNumber)) return;
        const matches = (titleIndex.get(normalizedTitle(row)) || []).filter(product => !assignedProducts.has(product.id));
        if (matches.length < 2) return;
        const result = resolveByAttributesWithDiagnostics(row, matches);
        if (result.selectedProduct) {
            addDetailedResolution(row, result.selectedProduct, "RESOLVED_BY_ATTRIBUTES", {
                attributeDiagnostics: result.diagnostics
            });
        }
    });

    buildDuplicateSequenceResolutions(rowsToResolve, freeProducts, assignedRows, assignedProducts, usedMatCodes)
        .forEach(item => {
            const row = rowsToResolve.find(excelRow => excelRow.rowNumber === item.rowNumber);
            const product = dbProductsById.get(item.productId);
            if (row && product) addResolution(row, product, item.method);
        });

    const unresolved = rowsToResolve
        .filter(row => !assignedRows.has(row.rowNumber))
        .map(row => {
            const exactMatches = (exactIndex.get(exactKey(row)) || []).filter(product => !assignedProducts.has(product.id));
            const normalizedMatches = (normalizedIndex.get(normalizedKey(row)) || []).filter(product => !assignedProducts.has(product.id));
            const titleMatches = (titleIndex.get(normalizedTitle(row)) || []).filter(product => !assignedProducts.has(product.id));
            const reason = exactMatches.length > 1 || normalizedMatches.length > 1 || titleMatches.length > 1
                ? "AMBIGUOUS"
                : "NOT_FOUND";

            return {
                rowNumber: row.rowNumber,
                externalId: row.externalId,
                title: row.title,
                category: row.category,
                subcategory: row.subcategory,
                productGroup: row.productGroup,
                reason,
                nearestCandidates: getNearestCandidates(row, freeProducts)
            };
        });

    const partiallyResolvedDuplicateGroups = buildPartiallyResolvedDuplicateGroups(rowsToResolve, freeProducts, resolutions);
    const conflicts = validatePlan(resolutions, dbProductsById, matOwners);
    const summary = {
        excelMatRows: excelRows.length,
        alreadyLinked: alreadyLinked.length,
        resolvedExact: resolutions.filter(item => item.method === "RESOLVED_EXACT").length,
        resolvedNormalized: resolutions.filter(item => item.method === "RESOLVED_NORMALIZED").length,
        resolvedByAttributes: resolutions.filter(item => item.method === "RESOLVED_BY_ATTRIBUTES").length,
        resolvedDuplicateSequence: resolutions.filter(item => item.method === "RESOLVED_DUPLICATE_SEQUENCE").length,
        unresolvedNotFound: unresolved.filter(item => item.reason === "NOT_FOUND").length,
        unresolvedAmbiguous: unresolved.filter(item => item.reason === "AMBIGUOUS").length,
        partiallyResolvedDuplicateGroups: partiallyResolvedDuplicateGroups.length,
        conflicts: conflicts.length + duplicateMat.length + invalidMat.length,
        plannedUpdates: resolutions.length
    };

    return {
        generatedAt: new Date().toISOString(),
        databasePath,
        summary,
        resolved: resolutions,
        alreadyLinked,
        unresolved,
        partiallyResolvedDuplicateGroups,
        duplicateMat,
        invalidMat,
        conflicts,
        applied: false,
        backupPath: "",
        integrity: ""
    };
}

function createBackup() {
    fs.mkdirSync(backupsDir, { recursive: true });
    const backupPath = path.join(backupsDir, `matmix-before-mat-resolution-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

async function applyResolution(db, report) {
    if (report.duplicateMat.length || report.invalidMat.length || report.conflicts.length) {
        throw new Error("Apply blocked: technical conflicts found.");
    }

    await run(db, "BEGIN IMMEDIATE TRANSACTION");
    try {
        for (const item of report.resolved) {
            const product = await get(db, "SELECT id, external_id FROM products WHERE id = ?", [item.productId]);
            if (!product || hasMatExternalId(product)) {
                throw new Error(`Product ${item.productId} changed before update.`);
            }
            const matOwner = await get(db, "SELECT id FROM products WHERE external_id = ? AND id != ?", [item.externalId, item.productId]);
            if (matOwner) {
                throw new Error(`MAT ${item.externalId} already belongs to product ${matOwner.id}.`);
            }
            await run(db, "UPDATE products SET external_id = ? WHERE id = ?", [item.externalId, item.productId]);
        }
        await run(db, "COMMIT");
    } catch (error) {
        await run(db, "ROLLBACK").catch(() => {});
        throw error;
    }
}

function writeReports(report, mode) {
    fs.mkdirSync(reportsDir, { recursive: true });
    const baseName = `mat-resolution-${mode}-${timestampForFile()}`;
    const jsonPath = path.join(reportsDir, `${baseName}.json`);
    const txtPath = path.join(reportsDir, `${baseName}.txt`);
    const lines = [
        `MAT resolution ${mode}`,
        `Generated: ${report.generatedAt}`,
        `Excel MAT rows: ${report.summary.excelMatRows}`,
        `Already linked: ${report.summary.alreadyLinked}`,
        `Resolved exact: ${report.summary.resolvedExact}`,
        `Resolved normalized: ${report.summary.resolvedNormalized}`,
        `Resolved by attributes: ${report.summary.resolvedByAttributes}`,
        `Resolved duplicate sequence: ${report.summary.resolvedDuplicateSequence}`,
        `Unresolved not found: ${report.summary.unresolvedNotFound}`,
        `Unresolved ambiguous: ${report.summary.unresolvedAmbiguous}`,
        `Partially resolved duplicate groups: ${report.summary.partiallyResolvedDuplicateGroups}`,
        `Conflicts: ${report.summary.conflicts}`,
        `Planned updates: ${report.summary.plannedUpdates}`,
        `Applied: ${report.applied}`,
        `Backup: ${report.backupPath || "-"}`,
        `Integrity: ${report.integrity || "-"}`
    ];

    if (report.resolved.length) {
        lines.push("", "Resolved sample:");
        report.resolved.slice(0, 100).forEach(item => {
            lines.push(`- row ${item.rowNumber}: ${item.externalId} -> product ${item.productId} (${item.method}) ${item.title}`);
        });
    }

    const attributeResolutions = report.resolved.filter(item => item.method === "RESOLVED_BY_ATTRIBUTES");
    if (attributeResolutions.length) {
        lines.push("", "RESOLVED_BY_ATTRIBUTES diagnostics:");
        attributeResolutions.forEach(item => {
            const rule = item.attributeDiagnostics?.selectionRule || {};
            lines.push(`- row ${item.rowNumber}: ${item.externalId} -> product ${item.productId}`);
            lines.push(`  uniqueByField=${rule.uniqueByField || "-"} usedPrice=${Boolean(rule.usedPrice)} usedWeight=${Boolean(rule.usedWeight)} usedSortOrder=${Boolean(rule.usedSortOrder)} usedExcelRowProximity=${Boolean(rule.usedExcelRowProximity)}`);
            lines.push(`  selected=${item.attributeDiagnostics?.selectedCandidate?.title || item.title}`);
            (item.attributeDiagnostics?.otherCandidates || []).forEach(candidate => {
                lines.push(`  rejected candidate ${candidate.id}: reason=${candidate.rejectionReason || "-"} matched=${candidate.matchedFields.join(",") || "-"} different=${candidate.differentFields.join(",") || "-"}`);
            });
        });
    }

    if (report.partiallyResolvedDuplicateGroups.length) {
        lines.push("", "PARTIALLY_RESOLVED_DUPLICATE_GROUPS:");
        report.partiallyResolvedDuplicateGroups.forEach((group, index) => {
            lines.push(`- group ${index + 1}: excelRows=${group.excelRows.length} dbCandidates=${group.dbCandidates.length}`);
            lines.push(`  blockers=${group.duplicateSequenceNotAppliedBecause.join("; ")}`);
            group.linkedProducts.forEach(item => {
                lines.push(`  linked row ${item.rowNumber}: ${item.externalId} -> product ${item.productId} (${item.method})`);
            });
            group.remainingFreeProducts.forEach(product => {
                lines.push(`  remaining product ${product.id}: ${product.externalId || "-"} ${product.title}`);
            });
        });
    }

    if (report.unresolved.length) {
        lines.push("", "Unresolved sample:");
        report.unresolved.slice(0, 100).forEach(item => {
            lines.push(`- row ${item.rowNumber}: ${item.externalId} ${item.reason} ${item.title}`);
            item.nearestCandidates.slice(0, 3).forEach(candidate => {
                lines.push(`  candidate ${candidate.id}: score=${candidate.similarity} diff=${candidate.differentFields.join(",") || "-"} ${candidate.title}`);
            });
        });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
    fs.writeFileSync(txtPath, `${lines.join("\n")}\n`, "utf8");
    return { jsonPath, txtPath };
}

async function resolveMatExternalIds(excelPath, { apply = false } = {}) {
    const absoluteExcelPath = path.resolve(excelPath || "");
    if (!excelPath || !fs.existsSync(absoluteExcelPath)) {
        throw new Error('Укажите путь к Excel: npm run catalog:resolve-mat -- "C:\\path\\catalog.xlsx"');
    }
    if (!absoluteExcelPath.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Файл должен быть .xlsx.");
    }

    const parsed = await parseCatalogExcel(absoluteExcelPath);
    const blockingParseErrors = (parsed.errors || []).filter(error => ["MISSING_SHEET", "FILE_READ_ERROR"].includes(error.code));
    if (blockingParseErrors.length) {
        throw new Error(blockingParseErrors.map(error => error.message).join(" "));
    }

    const db = openDatabase();
    try {
        const products = await all(db, `
            SELECT id, external_id, title, category, subcategory, product_group, price, weight, unit, sort_order
            FROM products
            ORDER BY sort_order ASC, id ASC
        `);
        const report = buildResolutionReport(parsed.productRows, products);

        if (apply) {
            report.backupPath = createBackup();
            await applyResolution(db, report);
            report.applied = true;
        }

        report.integrity = (await get(db, "PRAGMA integrity_check")).integrity_check;
        report.finalMatCount = (await get(db, "SELECT COUNT(*) AS count FROM products WHERE external_id LIKE 'MAT-%'")).count;
        report.reportPaths = writeReports(report, apply ? "apply" : "preview");

        return report;
    } finally {
        await closeDatabase(db);
    }
}

function printReport(report) {
    console.log(`Excel MAT rows: ${report.summary.excelMatRows}`);
    console.log(`Already linked: ${report.summary.alreadyLinked}`);
    console.log(`Resolved exact: ${report.summary.resolvedExact}`);
    console.log(`Resolved normalized: ${report.summary.resolvedNormalized}`);
    console.log(`Resolved by attributes: ${report.summary.resolvedByAttributes}`);
    console.log(`Resolved duplicate sequence: ${report.summary.resolvedDuplicateSequence}`);
    console.log(`Unresolved not found: ${report.summary.unresolvedNotFound}`);
    console.log(`Unresolved ambiguous: ${report.summary.unresolvedAmbiguous}`);
    console.log(`Partially resolved duplicate groups: ${report.summary.partiallyResolvedDuplicateGroups}`);
    console.log(`Conflicts: ${report.summary.conflicts}`);
    console.log(`Planned updates: ${report.summary.plannedUpdates}`);
    console.log(`Applied: ${report.applied}`);
    console.log(`Backup: ${report.backupPath || "-"}`);
    console.log(`Final MAT count: ${report.finalMatCount}`);
    console.log(`Integrity check: ${report.integrity}`);
    console.log(`JSON report: ${report.reportPaths.jsonPath}`);
    console.log(`Text report: ${report.reportPaths.txtPath}`);
}

async function main() {
    const args = process.argv.slice(2);
    const apply = args.includes("--apply");
    const excelPath = args.find(arg => arg !== "--apply");

    try {
        const report = await resolveMatExternalIds(excelPath, { apply });
        printReport(report);
        if (report.integrity !== "ok") process.exitCode = 1;
    } catch (error) {
        console.error(`MAT resolver failed: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    resolveMatExternalIds,
    buildResolutionReport,
    normalizeCatalogMatchText
};
