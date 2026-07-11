const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ExcelJS = require("exceljs");
const { databasePath } = require("../database");
const {
    normalizeCatalogStructureName,
    syncCatalogStructureFromProducts
} = require("./catalogStructure");

const IMPORT_SHEET_NAME = "ШАБЛОН";
const MAT_CODE_PATTERN = /^MAT-(\d{6,})$/i;
const CAT_CODE_PATTERN = /^CAT-(\d{6,})$/i;
const SUB_CODE_PATTERN = /^SUB-(\d{6,})$/i;
const ALLOWED_UNITS = new Set(["шт", "кг", "м", "м2"]);
const PREVIEW_TOKEN_TTL_MS = 30 * 60 * 1000;
const previewTokens = new Map();
const COMPARED_FIELDS = [
    "title",
    "category",
    "subcategory",
    "productGroup",
    "price",
    "weight",
    "unit",
    "sortOrder"
];

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeKey(value) {
    return normalizeText(value).toLowerCase().replace(/ё/g, "е");
}

function getCellRawValue(cell) {
    const value = cell?.value;
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString();
    if (typeof value !== "object") return value;
    if (Array.isArray(value.richText)) return value.richText.map(part => part.text || "").join("");
    if (value.text !== undefined) return value.text;
    if (value.result !== undefined) return value.result;
    if (value.hyperlink !== undefined && value.text !== undefined) return value.text;
    return "";
}

function getCellText(cell) {
    return normalizeText(getCellRawValue(cell));
}

function parseDecimal(value, fallback = null) {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

    const normalized = String(value)
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");
    if (!normalized) return fallback;

    const number = Number(normalized);
    return Number.isFinite(number) ? number : fallback;
}

function normalizeUnit(value) {
    const unit = normalizeKey(value)
        .replace(/[²]/g, "2")
        .replace(/^шту?к?\.?$/i, "шт")
        .replace(/^кг\.?$/i, "кг")
        .replace(/^м\.?$/i, "м")
        .replace(/^м2\.?$/i, "м2")
        .replace(/^м\^2$/i, "м2");

    return unit || "шт";
}

function normalizeMatCode(value) {
    const normalized = normalizeText(value).toUpperCase();
    const match = normalized.match(MAT_CODE_PATTERN);
    if (!match) return normalized;
    return `MAT-${match[1].padStart(6, "0")}`;
}

function normalizeTypedCode(value, pattern, prefix) {
    const normalized = normalizeText(value).toUpperCase();
    const match = normalized.match(pattern);
    if (!match) return normalized;
    return `${prefix}-${match[1].padStart(6, "0")}`;
}

function normalizeCategoryCode(value) {
    return normalizeTypedCode(value, CAT_CODE_PATTERN, "CAT");
}

function normalizeSubcategoryCode(value) {
    return normalizeTypedCode(value, SUB_CODE_PATTERN, "SUB");
}

function validateMatCode(value) {
    return MAT_CODE_PATTERN.test(normalizeText(value));
}

function validateCategoryCode(value) {
    return CAT_CODE_PATTERN.test(normalizeText(value));
}

function validateSubcategoryCode(value) {
    return SUB_CODE_PATTERN.test(normalizeText(value));
}

function getMatNumber(value) {
    const match = normalizeText(value).match(MAT_CODE_PATTERN);
    return match ? Number(match[1]) : 0;
}

function getTypedCodeNumber(value, pattern) {
    const match = normalizeText(value).match(pattern);
    return match ? Number(match[1]) : 0;
}

function formatMatCode(number) {
    return `MAT-${String(number).padStart(6, "0")}`;
}

function formatCategoryCode(number) {
    return `CAT-${String(number).padStart(6, "0")}`;
}

function formatSubcategoryCode(number) {
    return `SUB-${String(number).padStart(6, "0")}`;
}

function getSha256(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

function timestampForFile(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

async function getNextMatExternalId(db) {
    const rows = await db.all("SELECT external_id FROM products WHERE external_id IS NOT NULL AND external_id != ''");
    const maxNumber = rows.reduce((max, row) => {
        const nextNumber = getMatNumber(row.external_id);
        return nextNumber > max ? nextNumber : max;
    }, 0);

    return formatMatCode(maxNumber + 1);
}

function createIssue(severity, code, message, rowNumber = null, details = {}) {
    return {
        severity,
        code,
        message,
        ...(rowNumber ? { rowNumber } : {}),
        ...details
    };
}

function isHeaderTitle(title) {
    return ["наименование", "наименование товара", "товар", "название"].includes(normalizeKey(title));
}

function getCategoryName(title) {
    const match = normalizeText(title).match(/^Категория\s*-\s*(.+)$/i);
    return match ? normalizeText(match[1]) : "";
}

function getSubcategoryName(title) {
    const match = normalizeText(title).match(/^Подкатегория\s*-\s*(.+)$/i);
    return match ? normalizeText(match[1]) : "";
}

function hasProductCells(row) {
    return [1, 4, 5, 8, 10, 11].some(index => getCellText(row.getCell(index)));
}

function parseCatalogRow(row, rowNumber, context = {}) {
    const title = getCellText(row.getCell(1));
    const code = getCellText(row.getCell(11));
    const categoryName = getCategoryName(title);
    const subcategoryName = getSubcategoryName(title);

    if (categoryName) {
        return {
            type: "category",
            rowNumber,
            name: categoryName,
            externalCode: code ? normalizeCategoryCode(code) : "",
            rawExternalCode: code
        };
    }

    if (subcategoryName) {
        return {
            type: "subcategory",
            rowNumber,
            name: subcategoryName,
            category: context.currentCategory || "",
            categoryExternalCode: context.currentCategoryExternalCode || "",
            externalCode: code ? normalizeSubcategoryCode(code) : "",
            rawExternalCode: code
        };
    }

    if (!hasProductCells(row)) {
        return {
            type: "empty",
            rowNumber
        };
    }

    const rawPrice = getCellRawValue(row.getCell(5));
    const rawWeight = getCellRawValue(row.getCell(10));
    const priceText = getCellText(row.getCell(5));
    const weightText = getCellText(row.getCell(10));
    const unit = normalizeUnit(getCellText(row.getCell(4)));

    return {
        type: "product",
        rowNumber,
        externalId: code ? normalizeMatCode(code) : "",
        rawExternalId: code,
        title,
        category: context.currentCategory || "",
        categoryExternalCode: context.currentCategoryExternalCode || "",
        subcategory: context.currentSubcategory || "",
        subcategoryExternalCode: context.currentSubcategoryExternalCode || "",
        productGroup: getCellText(row.getCell(8)),
        unit,
        price: priceText ? parseDecimal(rawPrice, null) : null,
        weight: weightText ? parseDecimal(rawWeight, 0) : 0,
        priceText,
        weightText,
        rawPrice,
        rawWeight
    };
}

async function loadWorkbook(input) {
    const workbook = new ExcelJS.Workbook();
    if (Buffer.isBuffer(input)) {
        await workbook.xlsx.load(input);
    } else {
        await workbook.xlsx.readFile(input);
    }
    return workbook;
}

async function parseCatalogExcel(input) {
    const errors = [];
    const warnings = [];
    let workbook;

    try {
        workbook = await loadWorkbook(input);
    } catch (error) {
        return {
            sheetName: "",
            rowsRead: 0,
            productRows: [],
            errors: [createIssue("critical", "FILE_READ_ERROR", "Файл невозможно прочитать.")],
            warnings: []
        };
    }

    const sheet = workbook.getWorksheet(IMPORT_SHEET_NAME);
    if (!sheet) {
        return {
            sheetName: "",
            rowsRead: 0,
            productRows: [],
            errors: [createIssue("critical", "MISSING_SHEET", `В Excel-файле отсутствует лист ${IMPORT_SHEET_NAME}.`)],
            warnings: []
        };
    }

    const productRows = [];
    const seenCodes = new Map();
    const titleRows = new Map();
    let currentCategory = "";
    let currentSubcategory = "";

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const title = getCellText(row.getCell(1));
        const categoryName = getCategoryName(title);
        const subcategoryName = getSubcategoryName(title);

        if (categoryName) {
            currentCategory = categoryName;
            currentSubcategory = "";
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Строка категории пропущена как служебная.", rowNumber));
            return;
        }

        if (subcategoryName) {
            currentSubcategory = subcategoryName;
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Строка подкатегории пропущена как служебная.", rowNumber));
            return;
        }

        if (!hasProductCells(row)) return;
        if (title && isHeaderTitle(title)) {
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Строка заголовка пропущена как служебная.", rowNumber));
            return;
        }

        const rawCode = getCellText(row.getCell(11));
        const externalId = rawCode ? normalizeMatCode(rawCode) : "";
        const rawPrice = getCellRawValue(row.getCell(5));
        const rawWeight = getCellRawValue(row.getCell(10));
        const priceText = getCellText(row.getCell(5));
        const weightText = getCellText(row.getCell(10));
        const unit = normalizeUnit(getCellText(row.getCell(4)));
        const price = priceText ? parseDecimal(rawPrice, null) : null;
        const weight = weightText ? parseDecimal(rawWeight, 0) : 0;
        const normalizedTitle = normalizeKey(title);

        if (!title) errors.push(createIssue("critical", "MISSING_TITLE", "Товар не имеет названия.", rowNumber));
        if (!currentCategory) errors.push(createIssue("critical", "MISSING_CATEGORY", "Товар не имеет категории.", rowNumber, { title }));
        if (rawCode && !validateMatCode(rawCode)) {
            errors.push(createIssue("critical", "INVALID_MAT_CODE", "MAT-код имеет неправильный формат.", rowNumber, { externalId: rawCode }));
        }
        if (externalId) {
            if (seenCodes.has(externalId)) {
                errors.push(createIssue("critical", "DUPLICATE_MAT_CODE", "Дублирующийся MAT-код в одном файле.", rowNumber, {
                    externalId,
                    firstRowNumber: seenCodes.get(externalId)
                }));
            } else {
                seenCodes.set(externalId, rowNumber);
            }
        }
        if (priceText && price === null) errors.push(createIssue("critical", "INVALID_PRICE", "Некорректная цена.", rowNumber, { title }));
        if (price !== null && price < 0) errors.push(createIssue("critical", "NEGATIVE_PRICE", "Отрицательная цена.", rowNumber, { title }));
        if (weightText && parseDecimal(rawWeight, null) === null) errors.push(createIssue("critical", "INVALID_WEIGHT", "Некорректный вес.", rowNumber, { title }));
        if (weight < 0) errors.push(createIssue("critical", "NEGATIVE_WEIGHT", "Отрицательный вес.", rowNumber, { title }));
        if (!ALLOWED_UNITS.has(unit)) errors.push(createIssue("critical", "INVALID_UNIT", "Некорректная единица измерения.", rowNumber, { title, unit }));

        if (!rawCode) warnings.push(createIssue("warning", "MISSING_CODE", "Товарная строка не имеет MAT-кода.", rowNumber, { title }));
        if (!priceText) warnings.push(createIssue("warning", "EMPTY_PRICE", "Пустая цена: будет считаться ценой по запросу.", rowNumber, { title }));
        if (!weightText) warnings.push(createIssue("warning", "EMPTY_WEIGHT", "Пустой вес: будет считаться 0.", rowNumber, { title }));
        if (!currentSubcategory) warnings.push(createIssue("warning", "EMPTY_SUBCATEGORY", "Пустая подкатегория.", rowNumber, { title }));
        if (!getCellText(row.getCell(8))) warnings.push(createIssue("warning", "EMPTY_GROUP", "Пустая группа товаров.", rowNumber, { title }));
        if (normalizedTitle) {
            if (titleRows.has(normalizedTitle)) {
                warnings.push(createIssue("warning", "SIMILAR_TITLE", "Похожий дубль названия товара.", rowNumber, {
                    title,
                    firstRowNumber: titleRows.get(normalizedTitle)
                }));
            } else {
                titleRows.set(normalizedTitle, rowNumber);
            }
        }

        productRows.push({
            rowNumber,
            externalId,
            title,
            category: currentCategory,
            subcategory: currentSubcategory,
            productGroup: getCellText(row.getCell(8)),
            unit,
            price,
            weight,
            sortOrder: productRows.length + 1
        });
    });

    return {
        sheetName: sheet.name,
        rowsRead: sheet.rowCount,
        productRows,
        errors,
        warnings
    };
}

async function parseCatalogExcelV2(input) {
    const errors = [];
    const warnings = [];
    let workbook;

    try {
        workbook = await loadWorkbook(input);
    } catch {
        return {
            sheetName: "",
            rowsRead: 0,
            categoryRows: [],
            subcategoryRows: [],
            productRows: [],
            errors: [createIssue("critical", "FILE_READ_ERROR", "Excel file cannot be read.")],
            warnings: []
        };
    }

    const sheet = workbook.getWorksheet(IMPORT_SHEET_NAME);
    if (!sheet) {
        return {
            sheetName: "",
            rowsRead: 0,
            categoryRows: [],
            subcategoryRows: [],
            productRows: [],
            errors: [createIssue("critical", "MISSING_SHEET", `Missing worksheet ${IMPORT_SHEET_NAME}.`)],
            warnings: []
        };
    }

    const categoryRows = [];
    const subcategoryRows = [];
    const productRows = [];
    const seenCategoryCodes = new Map();
    const seenSubcategoryCodes = new Map();
    const seenMatCodes = new Map();
    const titleRows = new Map();
    const context = {
        currentCategory: "",
        currentCategoryExternalCode: "",
        currentSubcategory: "",
        currentSubcategoryExternalCode: ""
    };

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const parsedRow = parseCatalogRow(row, rowNumber, context);

        if (parsedRow.type === "empty") return;

        if (parsedRow.type === "category") {
            context.currentCategory = parsedRow.name;
            context.currentCategoryExternalCode = parsedRow.externalCode;
            context.currentSubcategory = "";
            context.currentSubcategoryExternalCode = "";
            if (parsedRow.rawExternalCode && !validateCategoryCode(parsedRow.rawExternalCode)) {
                errors.push(createIssue("critical", "INVALID_CAT_CODE", "CAT code has invalid format.", rowNumber, { externalCode: parsedRow.rawExternalCode }));
            }
            if (parsedRow.externalCode) {
                if (seenCategoryCodes.has(parsedRow.externalCode)) {
                    errors.push(createIssue("critical", "DUPLICATE_CAT_CODE", "Duplicate CAT code in Excel.", rowNumber, {
                        externalCode: parsedRow.externalCode,
                        firstRowNumber: seenCategoryCodes.get(parsedRow.externalCode)
                    }));
                } else {
                    seenCategoryCodes.set(parsedRow.externalCode, rowNumber);
                }
            } else {
                warnings.push(createIssue("warning", "MISSING_CAT_CODE", "Category row has no CAT code.", rowNumber, { name: parsedRow.name }));
            }
            categoryRows.push(parsedRow);
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Category row skipped as service row.", rowNumber));
            return;
        }

        if (parsedRow.type === "subcategory") {
            context.currentSubcategory = parsedRow.name;
            context.currentSubcategoryExternalCode = parsedRow.externalCode;
            if (!context.currentCategory) {
                errors.push(createIssue("critical", "MISSING_PARENT_CATEGORY", "Subcategory has no parent category.", rowNumber, { name: parsedRow.name }));
            }
            if (parsedRow.rawExternalCode && !validateSubcategoryCode(parsedRow.rawExternalCode)) {
                errors.push(createIssue("critical", "INVALID_SUB_CODE", "SUB code has invalid format.", rowNumber, { externalCode: parsedRow.rawExternalCode }));
            }
            if (parsedRow.externalCode) {
                if (seenSubcategoryCodes.has(parsedRow.externalCode)) {
                    errors.push(createIssue("critical", "DUPLICATE_SUB_CODE", "Duplicate SUB code in Excel.", rowNumber, {
                        externalCode: parsedRow.externalCode,
                        firstRowNumber: seenSubcategoryCodes.get(parsedRow.externalCode)
                    }));
                } else {
                    seenSubcategoryCodes.set(parsedRow.externalCode, rowNumber);
                }
            } else {
                warnings.push(createIssue("warning", "MISSING_SUB_CODE", "Subcategory row has no SUB code.", rowNumber, { name: parsedRow.name }));
            }
            subcategoryRows.push(parsedRow);
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Subcategory row skipped as service row.", rowNumber));
            return;
        }

        if (parsedRow.title && isHeaderTitle(parsedRow.title)) {
            warnings.push(createIssue("warning", "SERVICE_ROW_SKIPPED", "Header row skipped as service row.", rowNumber));
            return;
        }

        const normalizedTitle = normalizeKey(parsedRow.title);
        if (!parsedRow.title) errors.push(createIssue("critical", "MISSING_TITLE", "Product has no title.", rowNumber));
        if (!parsedRow.category) errors.push(createIssue("critical", "MISSING_CATEGORY", "Product has no category.", rowNumber, { title: parsedRow.title }));
        if (parsedRow.rawExternalId && !validateMatCode(parsedRow.rawExternalId)) {
            errors.push(createIssue("critical", "INVALID_MAT_CODE", "MAT code has invalid format.", rowNumber, { externalId: parsedRow.rawExternalId }));
        }
        if (parsedRow.externalId) {
            if (seenMatCodes.has(parsedRow.externalId)) {
                errors.push(createIssue("critical", "DUPLICATE_MAT_CODE", "Duplicate MAT code in Excel.", rowNumber, {
                    externalId: parsedRow.externalId,
                    firstRowNumber: seenMatCodes.get(parsedRow.externalId)
                }));
            } else {
                seenMatCodes.set(parsedRow.externalId, rowNumber);
            }
        }
        if (parsedRow.priceText && parsedRow.price === null) errors.push(createIssue("critical", "INVALID_PRICE", "Invalid price.", rowNumber, { title: parsedRow.title }));
        if (parsedRow.price !== null && parsedRow.price < 0) errors.push(createIssue("critical", "NEGATIVE_PRICE", "Negative price.", rowNumber, { title: parsedRow.title }));
        if (parsedRow.weightText && parseDecimal(parsedRow.rawWeight, null) === null) errors.push(createIssue("critical", "INVALID_WEIGHT", "Invalid weight.", rowNumber, { title: parsedRow.title }));
        if (parsedRow.weight < 0) errors.push(createIssue("critical", "NEGATIVE_WEIGHT", "Negative weight.", rowNumber, { title: parsedRow.title }));
        if (!ALLOWED_UNITS.has(parsedRow.unit)) errors.push(createIssue("critical", "INVALID_UNIT", "Invalid unit.", rowNumber, { title: parsedRow.title, unit: parsedRow.unit }));

        if (!parsedRow.rawExternalId) warnings.push(createIssue("warning", "MISSING_CODE", "Product row has no MAT code.", rowNumber, { title: parsedRow.title }));
        if (!parsedRow.priceText) warnings.push(createIssue("warning", "EMPTY_PRICE", "Empty price: treated as price on request.", rowNumber, { title: parsedRow.title }));
        if (!parsedRow.weightText) warnings.push(createIssue("warning", "EMPTY_WEIGHT", "Empty weight: treated as 0.", rowNumber, { title: parsedRow.title }));
        if (!parsedRow.subcategory) warnings.push(createIssue("warning", "EMPTY_SUBCATEGORY", "Empty subcategory.", rowNumber, { title: parsedRow.title }));
        if (!parsedRow.productGroup) warnings.push(createIssue("warning", "EMPTY_GROUP", "Empty product group.", rowNumber, { title: parsedRow.title }));
        if (normalizedTitle) {
            if (titleRows.has(normalizedTitle)) {
                warnings.push(createIssue("warning", "SIMILAR_TITLE", "Similar product title duplicate.", rowNumber, {
                    title: parsedRow.title,
                    firstRowNumber: titleRows.get(normalizedTitle)
                }));
            } else {
                titleRows.set(normalizedTitle, rowNumber);
            }
        }

        productRows.push({
            rowNumber,
            externalId: parsedRow.externalId,
            title: parsedRow.title,
            category: parsedRow.category,
            categoryExternalCode: parsedRow.categoryExternalCode,
            subcategory: parsedRow.subcategory,
            subcategoryExternalCode: parsedRow.subcategoryExternalCode,
            productGroup: parsedRow.productGroup,
            unit: parsedRow.unit,
            price: parsedRow.price,
            weight: parsedRow.weight,
            sortOrder: productRows.length + 1
        });
    });

    return {
        sheetName: sheet.name,
        rowsRead: sheet.rowCount,
        categoryRows,
        subcategoryRows,
        productRows,
        errors,
        warnings
    };
}

function comparableValue(value, field) {
    if (["price", "weight"].includes(field)) {
        return value === null || value === undefined ? null : Number(value);
    }
    if (field === "sortOrder") return Number(value) || 0;
    return normalizeText(value);
}

function compareProductFields(currentProduct, incomingProduct) {
    return COMPARED_FIELDS
        .map(field => {
            const currentField = field === "productGroup" ? "product_group" : field === "sortOrder" ? "sort_order" : field;
            const currentValue = comparableValue(currentProduct[currentField], field);
            const incomingValue = comparableValue(incomingProduct[field], field);

            return Object.is(currentValue, incomingValue)
                ? null
                : { field, currentValue, incomingValue };
        })
        .filter(Boolean);
}

function normalizeDbProduct(row) {
    return {
        id: row.id,
        externalId: row.external_id || "",
        title: row.title || "",
        category: row.category || "",
        subcategory: row.subcategory || "",
        productGroup: row.product_group || "",
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        unit: row.unit || "шт",
        sortOrder: Number(row.sort_order) || 0,
        source: row.source || "",
        isActive: Boolean(row.is_active),
        deletedAt: row.deleted_at || ""
    };
}

function normalizeMatchText(value) {
    return String(value || "")
        .normalize("NFKC")
        .replace(/\u00a0/g, " ")
        .replace(/[‐‑‒–—―]/g, "-")
        .replace(/[“”„«»]/g, '"')
        .replace(/[‘’‚]/g, "'")
        .replace(/\\/g, "/")
        .replace(/[×хХ*]/g, "x")
        .replace(/м\s*[²2]/gi, "м2")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s*([x/(),-])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function getMatchKey(item) {
    return [
        item.title,
        item.category,
        item.subcategory,
        item.productGroup ?? item.product_group
    ].map(normalizeMatchText).join("\u001f");
}

function getStructureKey(item) {
    return [
        item.category,
        item.subcategory,
        item.productGroup ?? item.product_group
    ].map(normalizeMatchText).join("\u001f");
}

function textSimilarity(first, second) {
    const a = normalizeMatchText(first);
    const b = normalizeMatchText(second);
    if (!a && !b) return 1;
    if (!a || !b) return 0;

    const aTokens = new Set(a.split(/[\s,()./-]+/).filter(Boolean));
    const bTokens = new Set(b.split(/[\s,()./-]+/).filter(Boolean));
    const intersection = Array.from(aTokens).filter(token => bTokens.has(token)).length;
    const union = new Set([...aTokens, ...bTokens]).size || 1;

    return intersection / union;
}

function classifyNewProduct(row, unlinkedProducts) {
    const exactMatch = unlinkedProducts.find(product => getMatchKey(product) === getMatchKey(row));
    if (exactMatch) {
        return {
            classification: "REQUIRES_REVIEW",
            reason: "POSSIBLE_EXISTING_PRODUCT",
            candidate: {
                id: exactMatch.id,
                title: exactMatch.title,
                externalId: exactMatch.externalId,
                source: exactMatch.source
            }
        };
    }

    const structureKey = getStructureKey(row);
    const nearest = unlinkedProducts
        .filter(product => getStructureKey(product) === structureKey)
        .map(product => ({ product, similarity: textSimilarity(row.title, product.title) }))
        .sort((first, second) => second.similarity - first.similarity)[0];

    if (nearest && nearest.similarity >= 0.35) {
        return {
            classification: "REQUIRES_REVIEW",
            reason: "SIMILAR_UNLINKED_PRODUCT",
            similarity: Number(nearest.similarity.toFixed(3)),
            candidate: {
                id: nearest.product.id,
                title: nearest.product.title,
                externalId: nearest.product.externalId,
                source: nearest.product.source
            }
        };
    }

    return {
        classification: "TRUE_NEW",
        reason: "NO_UNLINKED_CANDIDATE"
    };
}

function collectNewValues(productRows, existingValues, field, parentField = null) {
    const existing = new Set(existingValues.map(value => normalizeKey(value)).filter(Boolean));
    const seen = new Set();

    return productRows
        .map(row => {
            const value = row[field];
            const normalizedValue = normalizeKey(value);
            if (!normalizedValue || existing.has(normalizedValue) || seen.has(normalizedValue)) return null;
            seen.add(normalizedValue);

            if (field === "productGroup") {
                return {
                    name: value,
                    category: row.category,
                    subcategory: row.subcategory
                };
            }

            return parentField
                ? { name: value, [parentField]: row[parentField] }
                : { name: value };
        })
        .filter(Boolean);
}

function normalizeStructureRow(row) {
    return {
        id: row.id,
        type: row.type,
        name: row.name || "",
        normalizedName: row.normalized_name || normalizeCatalogStructureName(row.name),
        externalCode: row.external_code || "",
        parentId: row.parent_id || null,
        isActive: Number(row.is_active) === 1,
        isSystem: Number(row.is_system) === 1,
        sortOrder: Number(row.sort_order) || 0
    };
}

function buildStructurePreview(parsed, structureRows) {
    const categoriesByCode = new Map();
    const subcategoriesByCode = new Map();
    const categoriesByName = new Map();
    const subcategoriesByParentAndName = new Map();
    const changes = {
        newCategories: [],
        renamedCategories: [],
        missingCategoryCodes: [],
        newSubcategories: [],
        renamedSubcategories: [],
        missingSubcategoryCodes: []
    };

    structureRows.filter(row => row.type === "category" && row.isActive && !row.isSystem).forEach(row => {
        if (row.externalCode) categoriesByCode.set(normalizeCategoryCode(row.externalCode), row);
        categoriesByName.set(normalizeCatalogStructureName(row.name), row);
    });
    structureRows.filter(row => row.type === "subcategory" && row.isActive && !row.isSystem).forEach(row => {
        if (row.externalCode) subcategoriesByCode.set(normalizeSubcategoryCode(row.externalCode), row);
        subcategoriesByParentAndName.set(`${row.parentId}:${normalizeCatalogStructureName(row.name)}`, row);
    });

    parsed.categoryRows?.forEach(row => {
        if (!row.externalCode) {
            changes.missingCategoryCodes.push(row);
            return;
        }
        const existing = categoriesByCode.get(row.externalCode);
        if (!existing) {
            changes.newCategories.push(row);
            return;
        }
        if (normalizeCatalogStructureName(existing.name) !== normalizeCatalogStructureName(row.name)) {
            changes.renamedCategories.push({
                externalCode: row.externalCode,
                rowNumber: row.rowNumber,
                currentName: existing.name,
                incomingName: row.name
            });
        }
    });

    parsed.subcategoryRows?.forEach(row => {
        if (!row.externalCode) {
            changes.missingSubcategoryCodes.push(row);
            return;
        }
        const existing = subcategoriesByCode.get(row.externalCode);
        if (!existing) {
            changes.newSubcategories.push(row);
            return;
        }
        if (normalizeCatalogStructureName(existing.name) !== normalizeCatalogStructureName(row.name)) {
            changes.renamedSubcategories.push({
                externalCode: row.externalCode,
                rowNumber: row.rowNumber,
                currentName: existing.name,
                incomingName: row.name
            });
        }
    });

    return changes;
}

async function buildCatalogImportPreview(db, parsed, file = {}) {
    const [products, rawStructureRows] = await Promise.all([
        db.all("SELECT * FROM products ORDER BY id ASC"),
        db.all("SELECT * FROM catalog_structure WHERE type IN ('category', 'subcategory') ORDER BY id ASC")
    ]);
    const dbProducts = products.map(normalizeDbProduct);
    const structureRows = rawStructureRows.map(normalizeStructureRow);
    const structureChanges = buildStructurePreview(parsed, structureRows);
    const productsByExternalId = new Map();
    const fileCodes = new Set();
    const changes = {
        new: [],
        updated: [],
        unchanged: [],
        missingFromFile: [],
        manualOnly: [],
        missingCodes: [],
        deleted: [],
        trueNew: [],
        requiresReview: [],
        newCategories: [],
        newSubcategories: [],
        renamedCategories: [],
        renamedSubcategories: [],
        missingCategoryCodes: [],
        missingSubcategoryCodes: [],
        newGroups: []
    };

    dbProducts.forEach(product => {
        const normalizedCode = normalizeMatCode(product.externalId);
        if (validateMatCode(normalizedCode)) productsByExternalId.set(normalizedCode, product);
    });

    let nextCodeNumber = getMatNumber(await getNextMatExternalId(db));

    parsed.productRows.forEach(row => {
        if (!row.externalId) {
            changes.missingCodes.push({
                rowNumber: row.rowNumber,
                title: row.title,
                category: row.category,
                subcategory: row.subcategory,
                suggestedExternalId: formatMatCode(nextCodeNumber)
            });
            nextCodeNumber += 1;
            return;
        }

        fileCodes.add(row.externalId);
        const currentProduct = productsByExternalId.get(row.externalId);
        if (!currentProduct) {
            changes.new.push(row);
            return;
        }

        if (currentProduct.deletedAt) {
            changes.deleted.push({
                externalId: row.externalId,
                title: currentProduct.title,
                rowNumber: row.rowNumber
            });
            return;
        }

        const fieldChanges = compareProductFields(currentProduct, row);
        if (fieldChanges.length) {
            changes.updated.push({
                externalId: row.externalId,
                title: currentProduct.title,
                rowNumber: row.rowNumber,
                changes: fieldChanges
            });
        } else {
            changes.unchanged.push({
                externalId: row.externalId,
                title: currentProduct.title,
                rowNumber: row.rowNumber
            });
        }
    });

    dbProducts.forEach(product => {
        const normalizedCode = normalizeMatCode(product.externalId);
        const isMatProduct = validateMatCode(normalizedCode);
        if (!isMatProduct || fileCodes.has(normalizedCode) || product.deletedAt) return;

        const item = {
            externalId: product.externalId,
            title: product.title,
            category: product.category,
            subcategory: product.subcategory,
            source: product.source,
            status: product.deletedAt ? "deleted" : (product.isActive ? "active" : "hidden")
        };

        if (product.source === "excel") {
            changes.missingFromFile.push(item);
        } else {
            changes.manualOnly.push(item);
        }
    });

    const unlinkedProducts = dbProducts.filter(product => {
        const normalizedCode = normalizeMatCode(product.externalId);
        return !validateMatCode(normalizedCode)
            && !product.deletedAt
            && product.source !== "manual";
    });
    changes.new.forEach(row => {
        const classification = classifyNewProduct(row, unlinkedProducts);
        const item = {
            ...row,
            classification: classification.classification,
            reviewReason: classification.reason
        };
        if (classification.candidate) item.candidate = classification.candidate;
        if (classification.similarity) item.similarity = classification.similarity;

        if (classification.classification === "TRUE_NEW") {
            changes.trueNew.push(item);
        } else {
            changes.requiresReview.push(item);
        }
    });
    changes.new = changes.trueNew;

    changes.newCategories = structureChanges.newCategories.length
        ? structureChanges.newCategories
        : collectNewValues(parsed.productRows, dbProducts.map(product => product.category), "category");
    changes.newSubcategories = structureChanges.newSubcategories.length
        ? structureChanges.newSubcategories
        : collectNewValues(parsed.productRows, dbProducts.map(product => product.subcategory), "subcategory", "category");
    changes.renamedCategories = structureChanges.renamedCategories;
    changes.renamedSubcategories = structureChanges.renamedSubcategories;
    changes.missingCategoryCodes = structureChanges.missingCategoryCodes;
    changes.missingSubcategoryCodes = structureChanges.missingSubcategoryCodes;
    changes.newGroups = collectNewValues(parsed.productRows, dbProducts.map(product => product.productGroup), "productGroup");

    const errors = parsed.errors;
    const warnings = parsed.warnings;
    const summary = {
        new: changes.new.length,
        updated: changes.updated.length,
        unchanged: changes.unchanged.length,
        missingFromFile: changes.missingFromFile.length,
        manualOnly: changes.manualOnly.length,
        missingCodes: changes.missingCodes.length,
        trueNew: changes.trueNew.length,
        requiresReview: changes.requiresReview.length,
        deleted: changes.deleted.length,
        newCategories: changes.newCategories.length,
        newSubcategories: changes.newSubcategories.length,
        renamedCategories: changes.renamedCategories.length,
        renamedSubcategories: changes.renamedSubcategories.length,
        missingCategoryCodes: changes.missingCategoryCodes.length,
        missingSubcategoryCodes: changes.missingSubcategoryCodes.length,
        newGroups: changes.newGroups.length,
        criticalErrors: errors.length,
        warnings: warnings.length
    };

    return {
        success: true,
        canImport: errors.length === 0,
        file: {
            name: file.name || "",
            sheet: parsed.sheetName,
            rowsRead: parsed.rowsRead,
            productRows: parsed.productRows.length
        },
        summary,
        changes,
        errors,
        warnings
    };
}

function sanitizeUploadFileName(filename) {
    return path.basename(String(filename || "catalog.xlsx")).replace(/[^\wа-яА-ЯёЁ ._-]+/g, "_");
}

async function getCatalogFingerprint(db) {
    const rows = await db.all(`
        SELECT id, external_id, title, category, subcategory, product_group, price, weight, unit,
               sort_order, source, is_active, deleted_at, updated_at
        FROM products
        ORDER BY id ASC
    `);
    const structureRows = await db.all(`
        SELECT id, type, name, normalized_name, external_code, parent_id, sort_order, is_active, updated_at
        FROM catalog_structure
        ORDER BY id ASC
    `);

    return getSha256(JSON.stringify({ products: rows, structure: structureRows }));
}

function cleanupExpiredPreviewTokens() {
    const now = Date.now();
    previewTokens.forEach((value, key) => {
        if (now - value.createdAtMs > PREVIEW_TOKEN_TTL_MS) {
            previewTokens.delete(key);
        }
    });
}

async function createCatalogImportPreviewToken(db, parsed, file, user, buffer) {
    cleanupExpiredPreviewTokens();

    const preview = await buildCatalogImportPreview(db, parsed, file);
    const token = crypto.randomUUID();
    const now = new Date();
    const fileHash = getSha256(buffer);
    const catalogFingerprint = await getCatalogFingerprint(db);

    preview.token = token;
    preview.tokenExpiresAt = new Date(now.getTime() + PREVIEW_TOKEN_TTL_MS).toISOString();

    previewTokens.set(token, {
        token,
        fileHash,
        file: {
            name: file.name || "",
            mimeType: file.mimeType || ""
        },
        buffer: Buffer.from(buffer),
        parsed,
        preview,
        userId: user?.id || null,
        createdAt: now.toISOString(),
        createdAtMs: now.getTime(),
        catalogFingerprint
    });

    return preview;
}

function createImportError(status, message, code = "IMPORT_ERROR") {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

async function getValidPreviewToken(db, token, user) {
    cleanupExpiredPreviewTokens();

    const stored = previewTokens.get(String(token || ""));
    if (!stored) {
        throw createImportError(409, "Preview устарел. Проверьте Excel-файл заново.", "PREVIEW_TOKEN_EXPIRED");
    }
    if (Date.now() - stored.createdAtMs > PREVIEW_TOKEN_TTL_MS) {
        previewTokens.delete(stored.token);
        throw createImportError(409, "Preview устарел. Проверьте Excel-файл заново.", "PREVIEW_TOKEN_EXPIRED");
    }
    if (stored.userId && user?.id && Number(stored.userId) !== Number(user.id)) {
        throw createImportError(403, "Preview создан другим пользователем.", "PREVIEW_TOKEN_OWNER_MISMATCH");
    }

    const currentFingerprint = await getCatalogFingerprint(db);
    if (currentFingerprint !== stored.catalogFingerprint) {
        previewTokens.delete(stored.token);
        throw createImportError(409, "Каталог изменился после проверки файла. Сделайте Preview заново.", "CATALOG_CHANGED");
    }

    return stored;
}

function getMaxMatNumberFromProducts(products) {
    return products.reduce((max, product) => {
        const nextNumber = getMatNumber(product.external_id || product.externalId || "");
        return nextNumber > max ? nextNumber : max;
    }, 0);
}

function normalizeIncomingProduct(row, externalId = row.externalId) {
    return {
        externalId,
        title: normalizeText(row.title),
        category: normalizeText(row.category),
        subcategory: normalizeText(row.subcategory),
        productGroup: normalizeText(row.productGroup),
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        unit: normalizeUnit(row.unit),
        sortOrder: Number(row.sortOrder) || 0
    };
}

async function generateUniqueSlug(db, title, fallback) {
    const translitMap = {
        "а": "a", "б": "b", "в": "v", "г": "g", "д": "d",
        "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i",
        "й": "y", "к": "k", "л": "l", "м": "m", "н": "n",
        "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
        "у": "u", "ф": "f", "х": "h", "ц": "ts", "ч": "ch",
        "ш": "sh", "щ": "sch", "ъ": "", "ы": "y", "ь": "",
        "э": "e", "ю": "yu", "я": "ya"
    };
    const base = Array.from(String(title || "").toLowerCase())
        .map(char => translitMap[char] ?? char)
        .join("")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120)
        .replace(/-+$/g, "") || fallback || "product";
    let slug = base;
    let suffix = 2;

    while (await db.get("SELECT id FROM products WHERE slug = ? LIMIT 1", [slug])) {
        const tail = `-${suffix}`;
        slug = `${base.slice(0, 120 - tail.length)}${tail}`;
        suffix += 1;
    }

    return slug;
}

async function insertImportedProduct(db, row, now) {
    const product = normalizeIncomingProduct(row);
    const slug = await generateUniqueSlug(db, product.title, product.externalId);

    await db.run(
        `INSERT INTO products (
            external_id, title, slug, category, subcategory, product_group, price, weight, unit,
            image, description, is_active, sort_order, source, last_imported_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            product.externalId,
            product.title,
            slug,
            product.category,
            product.subcategory,
            product.productGroup,
            product.price,
            product.weight,
            product.unit,
            "",
            "",
            1,
            product.sortOrder,
            "excel",
            now,
            now,
            now
        ]
    );
}

async function updateImportedProduct(db, row, now) {
    const product = normalizeIncomingProduct(row);
    await db.run(
        `UPDATE products
         SET title = ?,
             category = ?,
             subcategory = ?,
             product_group = ?,
             price = ?,
             weight = ?,
             unit = ?,
             sort_order = ?,
             source = ?,
             last_imported_at = ?,
             updated_at = ?
         WHERE external_id = ?
           AND deleted_at IS NULL`,
        [
            product.title,
            product.category,
            product.subcategory,
            product.productGroup,
            product.price,
            product.weight,
            product.unit,
            product.sortOrder,
            "excel",
            now,
            now,
            product.externalId
        ]
    );
}

function findUniqueUnlinkedMatch(row, products) {
    const candidates = products.filter(product => {
        const normalizedCode = normalizeMatCode(product.external_id || "");
        return !validateMatCode(normalizedCode)
            && !product.deleted_at
            && product.source !== "manual";
    });
    const exactMatches = candidates.filter(product => getMatchKey(product) === getMatchKey(row));
    if (exactMatches.length === 1) return exactMatches[0];

    const normalizedTitleMatches = candidates.filter(product => {
        return getStructureKey(product) === getStructureKey(row)
            && normalizeMatchText(product.title) === normalizeMatchText(row.title);
    });

    return normalizedTitleMatches.length === 1 ? normalizedTitleMatches[0] : null;
}

function createDatabaseBackup() {
    if (!fs.existsSync(databasePath)) {
        throw createImportError(500, "База данных не найдена. Импорт остановлен.", "DATABASE_NOT_FOUND");
    }

    const backupDir = path.join(path.dirname(databasePath), "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const backupPath = path.join(backupDir, `matmix-before-catalog-import-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

async function getNextStructureCodeNumber(db, pattern) {
    const rows = await db.all("SELECT external_code FROM catalog_structure WHERE external_code IS NOT NULL AND external_code != ''");
    return rows.reduce((max, row) => {
        const nextNumber = getTypedCodeNumber(row.external_code, pattern);
        return nextNumber > max ? nextNumber : max;
    }, 0) + 1;
}

async function findStructureCategory(db, row) {
    if (row.externalCode) {
        const byCode = await db.get("SELECT * FROM catalog_structure WHERE type = 'category' AND external_code = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1", [row.externalCode]);
        if (byCode) return byCode;
    }

    return db.get(
        "SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [normalizeCatalogStructureName(row.name)]
    );
}

async function findStructureSubcategory(db, row, parentId) {
    if (row.externalCode) {
        const byCode = await db.get("SELECT * FROM catalog_structure WHERE type = 'subcategory' AND external_code = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1", [row.externalCode]);
        if (byCode) return byCode;
    }

    return db.get(
        "SELECT * FROM catalog_structure WHERE type = 'subcategory' AND parent_id = ? AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [parentId, normalizeCatalogStructureName(row.name)]
    );
}

async function upsertCatalogStructureFromParsed(db, parsed, now) {
    let nextCategoryNumber = await getNextStructureCodeNumber(db, CAT_CODE_PATTERN);
    let nextSubcategoryNumber = await getNextStructureCodeNumber(db, SUB_CODE_PATTERN);
    const assignedRows = [];
    const categoryByFileCodeOrName = new Map();

    for (const row of parsed.categoryRows || []) {
        const externalCode = row.externalCode || formatCategoryCode(nextCategoryNumber++);
        const existing = await findStructureCategory(db, { ...row, externalCode });
        if (existing) {
            await db.run(
                `UPDATE catalog_structure
                 SET name = ?,
                     normalized_name = ?,
                     external_code = COALESCE(NULLIF(external_code, ''), ?),
                     updated_at = ?
                 WHERE id = ?`,
                [row.name, normalizeCatalogStructureName(row.name), externalCode, now, existing.id]
            );
            categoryByFileCodeOrName.set(row.externalCode || normalizeCatalogStructureName(row.name), { ...existing, id: existing.id, external_code: externalCode });
        } else {
            const result = await db.run(
                `INSERT INTO catalog_structure (
                    type, name, normalized_name, external_code, parent_id, sort_order, is_active, is_system, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ["category", row.name, normalizeCatalogStructureName(row.name), externalCode, null, row.rowNumber || 0, 1, 0, now, now]
            );
            categoryByFileCodeOrName.set(row.externalCode || normalizeCatalogStructureName(row.name), { id: result.id, external_code: externalCode });
        }
        if (!row.externalCode) assignedRows.push({ rowNumber: row.rowNumber, externalId: externalCode });
    }

    for (const row of parsed.subcategoryRows || []) {
        const categoryKey = row.categoryExternalCode || normalizeCatalogStructureName(row.category);
        let parent = categoryByFileCodeOrName.get(categoryKey);
        if (!parent && row.categoryExternalCode) {
            parent = await db.get("SELECT * FROM catalog_structure WHERE type = 'category' AND external_code = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1", [row.categoryExternalCode]);
        }
        if (!parent) {
            parent = await db.get("SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1", [normalizeCatalogStructureName(row.category)]);
        }
        if (!parent) continue;

        const externalCode = row.externalCode || formatSubcategoryCode(nextSubcategoryNumber++);
        const existing = await findStructureSubcategory(db, { ...row, externalCode }, parent.id);
        if (existing) {
            await db.run(
                `UPDATE catalog_structure
                 SET name = ?,
                     normalized_name = ?,
                     external_code = COALESCE(NULLIF(external_code, ''), ?),
                     parent_id = ?,
                     updated_at = ?
                 WHERE id = ?`,
                [row.name, normalizeCatalogStructureName(row.name), externalCode, parent.id, now, existing.id]
            );
        } else {
            await db.run(
                `INSERT INTO catalog_structure (
                    type, name, normalized_name, external_code, parent_id, sort_order, is_active, is_system, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ["subcategory", row.name, normalizeCatalogStructureName(row.name), externalCode, parent.id, row.rowNumber || 0, 1, 0, now, now]
            );
        }
        if (!row.externalCode) assignedRows.push({ rowNumber: row.rowNumber, externalId: externalCode });
    }

    return assignedRows;
}

async function createExcelCopy(tokenData, assignedRows) {
    const copiesDir = path.join(__dirname, "..", "imported-excel");
    fs.mkdirSync(copiesDir, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(tokenData.buffer);
    const sheet = workbook.getWorksheet(IMPORT_SHEET_NAME) || workbook.worksheets[0];
    assignedRows.forEach(item => {
        if (sheet && item.rowNumber) {
            sheet.getRow(item.rowNumber).getCell(11).value = item.externalId;
        }
    });

    const baseName = sanitizeUploadFileName(tokenData.file.name || "catalog.xlsx").replace(/\.xlsx$/i, "");
    const copyPath = path.join(copiesDir, `${baseName}-updated-${timestampForFile()}.xlsx`);
    await workbook.xlsx.writeFile(copyPath);
    return copyPath;
}

async function applyCatalogImport(db, token, options = {}, user = {}) {
    const tokenData = await getValidPreviewToken(db, token, user);
    const latestPreview = await buildCatalogImportPreview(db, tokenData.parsed, tokenData.file);
    if (!latestPreview.canImport) {
        throw createImportError(409, "Файл больше не проходит проверку. Сделайте Preview заново.", "PREVIEW_NOT_IMPORTABLE");
    }

    const backupPath = createDatabaseBackup();
    const now = new Date().toISOString();
    const result = {
        success: true,
        created: 0,
        updated: 0,
        assignedMat: 0,
        assignedStructureCodes: 0,
        hidden: 0,
        requiresReview: Number(latestPreview.summary?.requiresReview || 0),
        skippedRequiresReview: latestPreview.changes?.requiresReview || [],
        backupPath,
        excelCopyPath: "",
        excelCopyUrl: "",
        importLogId: null,
        integrityCheck: "",
        foreignKeyCheck: []
    };
    const assignMissingCodes = options.assignMissingCodes === true;
    const hideMissingFromFile = options.missingFromFileAction === "hide";
    const assignedRows = [];

    await db.run("BEGIN IMMEDIATE TRANSACTION");
    try {
        const dbProducts = await db.all("SELECT * FROM products ORDER BY id ASC");
        let nextMatNumber = getMaxMatNumberFromProducts(dbProducts) + 1;
        const assignedStructureRows = await upsertCatalogStructureFromParsed(db, tokenData.parsed, now);
        result.assignedStructureCodes = assignedStructureRows.length;
        assignedRows.push(...assignedStructureRows);

        for (const item of latestPreview.changes.updated || []) {
            const row = tokenData.parsed.productRows.find(productRow => productRow.externalId === item.externalId);
            if (!row) continue;
            await updateImportedProduct(db, row, now);
            result.updated += 1;
        }

        for (const row of latestPreview.changes.new || []) {
            if (row.classification !== "TRUE_NEW") continue;
            await insertImportedProduct(db, row, now);
            result.created += 1;
        }

        if (assignMissingCodes) {
            for (const row of latestPreview.changes.missingCodes || []) {
                const parsedRow = tokenData.parsed.productRows.find(productRow => productRow.rowNumber === row.rowNumber);
                if (!parsedRow) continue;
                const match = findUniqueUnlinkedMatch(parsedRow, dbProducts);
                if (!match) continue;

                const externalId = formatMatCode(nextMatNumber);
                nextMatNumber += 1;
                const incoming = normalizeIncomingProduct(parsedRow, externalId);
                await db.run(
                    `UPDATE products
                     SET external_id = ?,
                         title = ?,
                         category = ?,
                         subcategory = ?,
                         product_group = ?,
                         price = ?,
                         weight = ?,
                         unit = ?,
                         sort_order = ?,
                         source = ?,
                         last_imported_at = ?,
                         updated_at = ?
                     WHERE id = ?`,
                    [
                        incoming.externalId,
                        incoming.title,
                        incoming.category,
                        incoming.subcategory,
                        incoming.productGroup,
                        incoming.price,
                        incoming.weight,
                        incoming.unit,
                        incoming.sortOrder,
                        "excel",
                        now,
                        now,
                        match.id
                    ]
                );
                assignedRows.push({ rowNumber: parsedRow.rowNumber, externalId });
                result.assignedMat += 1;
            }
        }

        if (hideMissingFromFile) {
            for (const item of latestPreview.changes.missingFromFile || []) {
                await db.run(
                    `UPDATE products
                     SET is_active = 0,
                         updated_at = ?
                     WHERE external_id = ?
                       AND source = 'excel'
                       AND deleted_at IS NULL`,
                    [now, item.externalId]
                );
                result.hidden += 1;
            }
        }

        await syncCatalogStructureFromProducts(db);
        await db.run("COMMIT");
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }

    result.excelCopyPath = await createExcelCopy(tokenData, assignedRows);
    const integrity = await db.get("PRAGMA integrity_check");
    result.integrityCheck = integrity?.integrity_check || Object.values(integrity || {})[0] || "";
    result.foreignKeyCheck = await db.all("PRAGMA foreign_key_check");

    const logResult = await db.run(
        `INSERT INTO catalog_import_logs (
            user_id, user_name, file_name, file_hash, backup_path, excel_copy_path,
            created_count, updated_count, assigned_mat_count, assigned_structure_count, hidden_count, requires_review_count,
            error_count, summary_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user?.id || null,
            user?.name || "",
            tokenData.file.name || "",
            tokenData.fileHash,
            result.backupPath,
            result.excelCopyPath,
            result.created,
            result.updated,
            result.assignedMat,
            result.assignedStructureCodes,
            result.hidden,
            result.requiresReview,
            0,
            JSON.stringify({
                previewSummary: latestPreview.summary,
                applyOptions: options,
                skippedRequiresReview: result.skippedRequiresReview.slice(0, 500)
            }),
            now
        ]
    );

    result.importLogId = logResult.id;
    result.excelCopyUrl = `/api/products/import/excel-copy/${logResult.id}`;
    previewTokens.delete(tokenData.token);
    return result;
}

async function getCatalogImportExcelCopy(db, id) {
    const row = await db.get("SELECT excel_copy_path FROM catalog_import_logs WHERE id = ?", [Number(id) || 0]);
    if (!row || !row.excel_copy_path || !fs.existsSync(row.excel_copy_path)) {
        throw createImportError(404, "Копия Excel не найдена.", "EXCEL_COPY_NOT_FOUND");
    }

    return {
        path: row.excel_copy_path,
        filename: path.basename(row.excel_copy_path)
    };
}

module.exports = {
    normalizeMatCode,
    validateMatCode,
    parseCatalogExcel: parseCatalogExcelV2,
    parseCatalogRow,
    validateCatalogRows: parseCatalogExcelV2,
    buildCatalogImportPreview,
    createCatalogImportPreviewToken,
    applyCatalogImport,
    getCatalogImportExcelCopy,
    upsertCatalogStructureFromParsed,
    getNextMatExternalId,
    compareProductFields,
    formatMatCode,
    formatCategoryCode,
    formatSubcategoryCode,
    normalizeCategoryCode,
    normalizeSubcategoryCode,
    validateCategoryCode,
    validateSubcategoryCode,
    sanitizeUploadFileName
};
