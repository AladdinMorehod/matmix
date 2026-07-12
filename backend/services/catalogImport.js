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
const MAT_CODE_PATTERN = /^MAT-(\d+)$/i;
const CAT_CODE_PATTERN = /^CAT-(\d+)$/i;
const SUB_CODE_PATTERN = /^SUB-(\d+)$/i;
const ALLOWED_UNITS = new Set(["шт", "кг", "м", "м2"]);
const PREVIEW_TOKEN_TTL_MS = 30 * 60 * 1000;
const LARGE_PRICE_CHANGE_PERCENT = 20;
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

function normalizeCodeText(value) {
    if (value === null || value === undefined) return "";
    const normalized = String(value)
        .normalize("NFKC")
        .replace(/\u00a0/g, " ")
        .trim();
    if (!normalized || ["nan", "null", "undefined"].includes(normalized.toLowerCase())) return "";
    return normalized
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+/g, "")
        .toUpperCase();
}

function normalizeKey(value) {
    return normalizeText(value)
        .normalize("NFKC")
        .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, " ")
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/\s+/g, " ")
        .trim();
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

function normalizePriceToCents(value) {
    const number = parseDecimal(value, null);
    if (number === null || number < 0) return null;
    return Math.round(number * 100);
}

function centsToNumber(value) {
    return value === null || value === undefined ? null : Number((value / 100).toFixed(2));
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
    const normalized = normalizeCodeText(value);
    const match = normalized.match(MAT_CODE_PATTERN);
    if (!match) return normalized;
    return `MAT-${match[1].padStart(6, "0")}`;
}

function normalizeTypedCode(value, pattern, prefix) {
    const normalized = normalizeCodeText(value);
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
    return MAT_CODE_PATTERN.test(normalizeMatCode(value));
}

function validateCategoryCode(value) {
    return CAT_CODE_PATTERN.test(normalizeCategoryCode(value));
}

function validateSubcategoryCode(value) {
    return SUB_CODE_PATTERN.test(normalizeSubcategoryCode(value));
}

function getMatNumber(value) {
    const match = normalizeMatCode(value).match(MAT_CODE_PATTERN);
    return match ? Number(match[1]) : 0;
}

function getTypedCodeNumber(value, pattern) {
    const match = normalizeCodeText(value).match(pattern);
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

function getLooseCategoryName(title) {
    const match = normalizeText(title).match(/^Категория\s+(.+)$/i);
    return match ? normalizeText(match[1]) : "";
}

function getLooseSubcategoryName(title) {
    const match = normalizeText(title).match(/^Подкатегория\s+(.+)$/i);
    return match ? normalizeText(match[1]) : "";
}

function hasProductCells(row) {
    return [1, 4, 5, 8, 10, 11].some(index => getCellText(row.getCell(index)));
}

function hasNonTitleProductCells(row) {
    return [4, 5, 8, 10, 11].some(index => getCellText(row.getCell(index)));
}

function parseCatalogRow(row, rowNumber, context = {}) {
    const title = getCellText(row.getCell(1));
    const code = getCellText(row.getCell(11));
    const allowLooseServiceRow = !hasNonTitleProductCells(row);
    const categoryName = getCategoryName(title) || (allowLooseServiceRow ? getLooseCategoryName(title) : "");
    const subcategoryName = getSubcategoryName(title) || (allowLooseServiceRow ? getLooseSubcategoryName(title) : "");

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
        const allowLooseServiceRow = !hasNonTitleProductCells(row);
        const categoryName = getCategoryName(title) || (allowLooseServiceRow ? getLooseCategoryName(title) : "");
        const subcategoryName = getSubcategoryName(title) || (allowLooseServiceRow ? getLooseSubcategoryName(title) : "");

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

        if (!rawCode) errors.push(createIssue("critical", "MISSING_MAT_CODE", "В строке отсутствует MAT-код.", rowNumber, { title }));
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
            rawExternalId: rawCode,
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
                const firstCategoryWithCode = seenCategoryCodes.get(parsedRow.externalCode);
                if (firstCategoryWithCode && !isSameCategoryCodeRow(firstCategoryWithCode, parsedRow)) {
                    errors.push(createIssue("critical", "DUPLICATE_CAT_CODE", "Duplicate CAT code in Excel.", rowNumber, {
                        externalCode: parsedRow.externalCode,
                        firstRowNumber: firstCategoryWithCode.rowNumber
                    }));
                } else if (!firstCategoryWithCode) {
                    seenCategoryCodes.set(parsedRow.externalCode, parsedRow);
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
                const firstSubcategoryWithCode = seenSubcategoryCodes.get(parsedRow.externalCode);
                if (firstSubcategoryWithCode && !isSameSubcategoryCodeRow(firstSubcategoryWithCode, parsedRow)) {
                    errors.push(createIssue("critical", "DUPLICATE_SUB_CODE", "Duplicate SUB code in Excel.", rowNumber, {
                        externalCode: parsedRow.externalCode,
                        firstRowNumber: firstSubcategoryWithCode.rowNumber
                    }));
                } else if (!firstSubcategoryWithCode) {
                    seenSubcategoryCodes.set(parsedRow.externalCode, parsedRow);
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

        if (!parsedRow.rawExternalId) errors.push(createIssue("critical", "MISSING_MAT_CODE", "В строке отсутствует MAT-код.", rowNumber, { title: parsedRow.title }));
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
            rawExternalId: parsedRow.rawExternalId,
            title: parsedRow.title,
            category: parsedRow.category,
            categoryExternalCode: parsedRow.categoryExternalCode,
            subcategory: parsedRow.subcategory,
            subcategoryExternalCode: parsedRow.subcategoryExternalCode,
            productGroup: parsedRow.productGroup,
            unit: parsedRow.unit,
            price: parsedRow.price,
            priceText: parsedRow.priceText,
            rawPrice: parsedRow.rawPrice,
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

function buildProductsByMatCode(dbProducts) {
    const productsByMatCode = new Map();
    const duplicateMatCodes = new Map();
    let productsWithMatCode = 0;

    dbProducts.forEach(product => {
        const normalizedCode = normalizeMatCode(product.externalId ?? product.external_id);
        if (!validateMatCode(normalizedCode)) return;
        productsWithMatCode += 1;
        if (productsByMatCode.has(normalizedCode)) {
            if (!duplicateMatCodes.has(normalizedCode)) {
                duplicateMatCodes.set(normalizedCode, [productsByMatCode.get(normalizedCode)]);
            }
            duplicateMatCodes.get(normalizedCode).push(product);
            return;
        }
        productsByMatCode.set(normalizedCode, product);
    });

    return {
        productsByMatCode,
        duplicateMatCodes,
        diagnostics: {
            productsLoaded: dbProducts.length,
            productsWithMatCode,
            uniqueMatCodes: productsByMatCode.size,
            duplicateMatCodes: duplicateMatCodes.size
        }
    };
}

function createEmptyPriceChanges() {
    return {
        totalChecked: 0,
        changed: 0,
        increased: 0,
        decreased: 0,
        unchanged: 0,
        newPrice: 0,
        invalid: 0,
        zeroPrice: 0,
        productNotFound: 0,
        averageChangePercent: null,
        maxIncreasePercent: null,
        maxDecreasePercent: null,
        hasBlockingErrors: false,
        hasWarnings: false,
        warningSummary: [],
        items: []
    };
}

function getPriceWarningLabel(code) {
    const labels = {
        LARGE_INCREASE: "Сильное повышение цены",
        LARGE_DECREASE: "Сильное снижение цены",
        ZERO_PRICE: "Нулевая цена",
        INVALID_PRICE: "Некорректная цена",
        DUPLICATE_PRICE_CONFLICT: "Конфликт цены в дублях"
    };
    return labels[code] || code;
}

function addPriceWarning(summary, code, details = {}) {
    const existing = summary.warningSummary.find(item => item.code === code);
    if (existing) {
        existing.count += 1;
        return;
    }
    summary.warningSummary.push({
        code,
        label: getPriceWarningLabel(code),
        count: 1,
        ...details
    });
}

function buildPriceItem({ row, product = null, status, oldPriceCents = null, newPriceCents = null, warningCodes = [], duplicateRows = [] }) {
    const differenceCents = oldPriceCents !== null && newPriceCents !== null
        ? newPriceCents - oldPriceCents
        : null;
    const differencePercent = oldPriceCents && oldPriceCents > 0 && differenceCents !== null
        ? Number(((differenceCents / oldPriceCents) * 100).toFixed(2))
        : null;

    return {
        rowNumber: row?.rowNumber || 0,
        productId: product?.id || null,
        productCode: row?.externalId || product?.externalId || "",
        productName: product?.title || row?.title || "",
        oldPrice: centsToNumber(oldPriceCents),
        newPrice: centsToNumber(newPriceCents),
        difference: centsToNumber(differenceCents),
        differencePercent,
        status,
        warningCodes,
        duplicateRows
    };
}

function buildPriceChangesPreview(dbProducts, productRows) {
    const summary = createEmptyPriceChanges();
    const { productsByMatCode } = buildProductsByMatCode(dbProducts);
    const rowsByExternalId = new Map();
    const percentValues = [];

    productRows.forEach(row => {
        if (!row.externalId) {
            return;
        }
        const key = normalizeMatCode(row.externalId);
        if (!rowsByExternalId.has(key)) rowsByExternalId.set(key, []);
        rowsByExternalId.get(key).push(row);
    });

    rowsByExternalId.forEach((rows, externalId) => {
        const product = productsByMatCode.get(externalId);
        const prices = rows.map(row => ({
            row,
            cents: row.priceText ? normalizePriceToCents(row.rawPrice ?? row.price) : null,
            hasText: Boolean(row.priceText)
        }));
        const uniquePrices = new Set(prices.map(item => item.cents === null ? "invalid" : String(item.cents)));
        const first = prices[0];
        const warningCodes = [];
        const duplicateRows = rows.length > 1
            ? rows.map(row => ({ rowNumber: row.rowNumber, price: row.price === null ? null : Number(row.price) }))
            : [];

        if (rows.length > 1 && uniquePrices.size > 1) {
            warningCodes.push("DUPLICATE_PRICE_CONFLICT");
            summary.hasBlockingErrors = true;
            summary.hasWarnings = true;
            addPriceWarning(summary, "DUPLICATE_PRICE_CONFLICT", { rows: duplicateRows.slice(0, 5) });
        }

        if (!product) {
            summary.productNotFound += 1;
            summary.items.push(buildPriceItem({
                row: first.row,
                status: "productNotFound",
                newPriceCents: first.cents,
                warningCodes,
                duplicateRows
            }));
            summary.totalChecked += 1;
            return;
        }

        if (!first.hasText || first.cents === null) {
            warningCodes.push("INVALID_PRICE");
            summary.invalid += 1;
            if (first.hasText) {
                summary.hasBlockingErrors = true;
            }
            summary.hasWarnings = true;
            addPriceWarning(summary, "INVALID_PRICE");
            summary.items.push(buildPriceItem({ row: first.row, product, status: "invalid", warningCodes, duplicateRows }));
            summary.totalChecked += 1;
            return;
        }

        const newPriceCents = first.cents;
        const oldPriceCents = product.price === null || product.price === undefined
            ? null
            : normalizePriceToCents(product.price);
        let status = "unchanged";

        if (newPriceCents === 0) {
            status = "zeroPrice";
            warningCodes.push("ZERO_PRICE");
            summary.zeroPrice += 1;
            summary.hasWarnings = true;
            addPriceWarning(summary, "ZERO_PRICE");
        } else if (oldPriceCents === null) {
            status = "newPrice";
            summary.newPrice += 1;
        } else if (newPriceCents > oldPriceCents) {
            status = "increased";
            summary.increased += 1;
            summary.changed += 1;
        } else if (newPriceCents < oldPriceCents) {
            status = "decreased";
            summary.decreased += 1;
            summary.changed += 1;
        } else {
            summary.unchanged += 1;
        }

        const item = buildPriceItem({ row: first.row, product, status, oldPriceCents, newPriceCents, warningCodes, duplicateRows });
        if (item.differencePercent !== null && ["increased", "decreased"].includes(status)) {
            percentValues.push(item.differencePercent);
            if (item.differencePercent > LARGE_PRICE_CHANGE_PERCENT) {
                item.warningCodes.push("LARGE_INCREASE");
                summary.hasWarnings = true;
                addPriceWarning(summary, "LARGE_INCREASE");
            }
            if (item.differencePercent < -LARGE_PRICE_CHANGE_PERCENT) {
                item.warningCodes.push("LARGE_DECREASE");
                summary.hasWarnings = true;
                addPriceWarning(summary, "LARGE_DECREASE");
            }
        }

        summary.items.push(item);
        summary.totalChecked += 1;
    });

    if (percentValues.length) {
        const sum = percentValues.reduce((total, value) => total + value, 0);
        summary.averageChangePercent = Number((sum / percentValues.length).toFixed(2));
        summary.maxIncreasePercent = percentValues.some(value => value > 0)
            ? Number(Math.max(...percentValues.filter(value => value > 0)).toFixed(2))
            : null;
        summary.maxDecreasePercent = percentValues.some(value => value < 0)
            ? Number(Math.min(...percentValues.filter(value => value < 0)).toFixed(2))
            : null;
    }

    return summary;
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
        normalizedName: normalizeCatalogStructureName(row.name || row.normalized_name),
        externalCode: row.external_code || "",
        parentId: row.parent_id || null,
        isActive: Number(row.is_active) === 1,
        isSystem: Number(row.is_system) === 1,
        sortOrder: Number(row.sort_order) || 0
    };
}

function isSameCategoryCodeRow(first, second) {
    return normalizeCatalogStructureName(first?.name) === normalizeCatalogStructureName(second?.name);
}

function isSameSubcategoryCodeRow(first, second) {
    return normalizeCatalogStructureName(first?.category) === normalizeCatalogStructureName(second?.category)
        && normalizeCatalogStructureName(first?.name) === normalizeCatalogStructureName(second?.name);
}

function buildStructurePreview(parsed, structureRows) {
    const categoriesByCode = new Map();
    const subcategoriesByCode = new Map();
    const categoriesByName = new Map();
    const subcategoriesByParentAndName = new Map();
    const changes = {
        newCategories: [],
        renamedCategories: [],
        assignedCategoryCodes: [],
        missingCategoryCodes: [],
        newSubcategories: [],
        renamedSubcategories: [],
        assignedSubcategoryCodes: [],
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
            const existing = categoriesByName.get(normalizeCatalogStructureName(row.name));
            if (existing) {
                changes.assignedCategoryCodes.push({
                    rowNumber: row.rowNumber,
                    name: row.name,
                    externalCode: existing.externalCode,
                    structureId: existing.id
                });
            } else {
                changes.missingCategoryCodes.push({
                    rowNumber: row.rowNumber,
                    name: row.name,
                    reason: "CATEGORY_NOT_FOUND"
                });
            }
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
            const parent = row.categoryExternalCode
                ? categoriesByCode.get(normalizeCategoryCode(row.categoryExternalCode))
                : categoriesByName.get(normalizeCatalogStructureName(row.category));
            const existing = parent
                ? subcategoriesByParentAndName.get(`${parent.id}:${normalizeCatalogStructureName(row.name)}`)
                : null;

            if (existing) {
                changes.assignedSubcategoryCodes.push({
                    rowNumber: row.rowNumber,
                    category: row.category,
                    name: row.name,
                    externalCode: existing.externalCode,
                    structureId: existing.id,
                    parentId: parent.id,
                    parentExternalCode: parent.externalCode
                });
            } else {
                changes.missingSubcategoryCodes.push({
                    rowNumber: row.rowNumber,
                    category: row.category,
                    name: row.name,
                    reason: parent ? "SUBCATEGORY_NOT_FOUND" : "CATEGORY_NOT_FOUND"
                });
            }
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

function createStructureLookup(structureRows) {
    const categoriesByName = new Map();
    const subcategoriesByParentAndName = new Map();

    structureRows.filter(row => row.type === "category" && row.isActive && !row.isSystem).forEach(row => {
        categoriesByName.set(normalizeCatalogStructureName(row.name), row);
    });
    structureRows.filter(row => row.type === "subcategory" && row.isActive && !row.isSystem).forEach(row => {
        subcategoriesByParentAndName.set(`${row.parentId}:${normalizeCatalogStructureName(row.name)}`, row);
    });

    return { categoriesByName, subcategoriesByParentAndName };
}

function getProductStructureConflict(row, structureLookup) {
    const category = structureLookup.categoriesByName.get(normalizeCatalogStructureName(row.category));
    if (!category) {
        return {
            type: "missing_category",
            message: "Категория отсутствует в CRM",
            category: row.category,
            subcategory: row.subcategory
        };
    }

    const subcategory = structureLookup.subcategoriesByParentAndName.get(`${category.id}:${normalizeCatalogStructureName(row.subcategory)}`);
    if (row.subcategory && !subcategory) {
        return {
            type: "missing_subcategory",
            message: "Подкатегория отсутствует в CRM",
            category: row.category,
            subcategory: row.subcategory,
            categoryId: category.id
        };
    }

    return null;
}

function getResolutionKey(row) {
    return `${row.rowNumber}:${normalizeMatCode(row.externalId)}:${normalizeCatalogStructureName(row.category)}:${normalizeCatalogStructureName(row.subcategory)}`;
}

function normalizePreviewResolutions(resolutions = {}) {
    if (resolutions instanceof Map) return resolutions;
    return new Map(Object.entries(resolutions || {}));
}

function getStoredResolution(row, resolutions) {
    return resolutions.get(getResolutionKey(row)) || resolutions.get(String(row.rowNumber)) || null;
}

function isStructureConflictResolved(row, resolutions) {
    const resolution = getStoredResolution(row, resolutions);
    return Boolean(resolution && ["exclude", "keep_current_structure", "create_category", "map_category", "create_subcategory", "map_subcategory"].includes(resolution.action));
}

function hasStructureResolutionApplied(resolution) {
    return Boolean(resolution && ["create_category", "map_category", "create_subcategory", "map_subcategory"].includes(resolution.action));
}

function getEffectiveProductRow(row, currentProduct, structureConflict, resolution, structureOptions) {
    if (hasStructureResolutionApplied(resolution)) {
        return {
            row: applyStructureResolutionToRow(row, resolution, structureOptions),
            preserveCrmStructure: false
        };
    }

    if (currentProduct && structureConflict) {
        return {
            row: {
                ...row,
                category: currentProduct.category || "",
                subcategory: currentProduct.subcategory || "",
                categoryExternalCode: "",
                subcategoryExternalCode: ""
            },
            preserveCrmStructure: true
        };
    }

    return {
        row,
        preserveCrmStructure: false
    };
}

function createStructureWarning(row, structureConflict, currentProduct = null) {
    const isCategory = structureConflict?.type === "missing_category";
    return createIssue(
        "warning",
        isCategory ? "MISSING_CAT_STRUCTURE" : "MISSING_SUB_STRUCTURE",
        currentProduct
            ? "Структура из Excel не применена. Цена и наименование товара будут обновлены, текущая категория и подкатегория CRM сохранятся."
            : (isCategory
                ? `Не удалось найти категорию в структуре: ${row.category}.`
                : `Не удалось найти подкатегорию в структуре: ${row.category || "Без категории"} / ${row.subcategory}.`),
        row.rowNumber,
        {
            productId: currentProduct?.id || null,
            externalId: normalizeMatCode(row.externalId),
            category: row.category,
            subcategory: row.subcategory,
            preserveCrmStructure: Boolean(currentProduct)
        }
    );
}

function buildReviewItem(row, reason, extras = {}) {
    return {
        ...row,
        classification: "REQUIRES_REVIEW",
        reviewReason: reason,
        reasonLabel: extras.reasonLabel || reason,
        rowId: getResolutionKey(row),
        resolution: extras.resolution || null,
        resolved: Boolean(extras.resolution),
        ...extras
    };
}

function buildStructureOptions(structureRows) {
    const categories = structureRows
        .filter(row => row.type === "category" && row.isActive && !row.isSystem)
        .map(row => ({
            id: row.id,
            name: row.name,
            externalCode: row.externalCode || ""
        }));
    const subcategories = structureRows
        .filter(row => row.type === "subcategory" && row.isActive && !row.isSystem)
        .map(row => ({
            id: row.id,
            parentId: row.parentId,
            name: row.name,
            externalCode: row.externalCode || ""
        }));

    return { categories, subcategories };
}

function findSimilarProductHint(row, products) {
    const titleKey = normalizeMatchText(row.title);
    const exactTitle = products.find(product => normalizeMatchText(product.title) === titleKey
        && normalizeMatCode(product.externalId) !== normalizeMatCode(row.externalId));
    if (exactTitle) {
        return {
            reason: "TITLE_MATCH_MAT_DIFFERS",
            productId: exactTitle.id,
            externalId: normalizeMatCode(exactTitle.externalId),
            title: exactTitle.title,
            similarity: 1
        };
    }

    const structureKey = getStructureKey(row);
    const nearest = products
        .filter(product => getStructureKey(product) === structureKey)
        .map(product => ({ product, similarity: textSimilarity(row.title, product.title) }))
        .sort((first, second) => second.similarity - first.similarity)[0];

    if (nearest && nearest.similarity >= 0.35) {
        return {
            reason: "POSSIBLE_MAT_TYPO",
            productId: nearest.product.id,
            externalId: normalizeMatCode(nearest.product.externalId),
            title: nearest.product.title,
            similarity: Number(nearest.similarity.toFixed(3))
        };
    }

    return null;
}

function getUnmatchedMatReason(row, structureConflict, similarProduct) {
    if (structureConflict?.type === "missing_category") return "MISSING_CAT_STRUCTURE";
    if (structureConflict?.type === "missing_subcategory") return "MISSING_SUB_STRUCTURE";
    if (similarProduct?.reason === "TITLE_MATCH_MAT_DIFFERS") return "TITLE_MATCH_MAT_DIFFERS";
    if (similarProduct?.reason === "POSSIBLE_MAT_TYPO") return "POSSIBLE_MAT_TYPO";
    return "ABSENT_IN_CRM";
}

function buildUnmatchedMatDiagnostic(row, structureConflict, similarProduct) {
    const reason = getUnmatchedMatReason(row, structureConflict, similarProduct);
    return {
        rowNumber: row.rowNumber,
        rawExternalId: row.rawExternalId || row.externalId,
        normalizedExternalId: normalizeMatCode(row.externalId),
        title: row.title,
        category: row.category,
        subcategory: row.subcategory,
        categoryExternalCode: row.categoryExternalCode || "",
        subcategoryExternalCode: row.subcategoryExternalCode || "",
        price: row.price,
        reason,
        reasonLabel: reason,
        similarProduct: similarProduct || null
    };
}

function applyStructureResolutionToRow(row, resolution, structureOptions) {
    if (!resolution || resolution.action === "exclude") return row;
    const next = { ...row };
    const category = structureOptions.categories.find(item => item.id === resolution.categoryId);
    const subcategory = structureOptions.subcategories.find(item => item.id === resolution.subcategoryId);

    if (["map_category", "create_subcategory", "map_subcategory"].includes(resolution.action) && category) {
        next.category = category.name;
        next.categoryExternalCode = category.externalCode || next.categoryExternalCode || "";
    }
    if (resolution.action === "map_subcategory" && subcategory) {
        next.subcategory = subcategory.name;
        next.subcategoryExternalCode = subcategory.externalCode || next.subcategoryExternalCode || "";
    }

    return next;
}

function applyImportResolutionsToParsed(parsed, resolutions, structureOptions) {
    const normalizedResolutions = normalizePreviewResolutions(resolutions);
    const categoryActions = new Map();
    const subcategoryActions = new Map();

    parsed.productRows.forEach(row => {
        const resolution = getStoredResolution(row, normalizedResolutions);
        if (!resolution) return;
        const categoryKey = normalizeCatalogStructureName(row.category);
        const subcategoryKey = `${categoryKey}:${normalizeCatalogStructureName(row.subcategory)}`;
        if (["map_category", "exclude"].includes(resolution.action)) {
            categoryActions.set(categoryKey, resolution.action);
        }
        if (["map_subcategory", "exclude"].includes(resolution.action)) {
            subcategoryActions.set(subcategoryKey, resolution.action);
        }
    });

    return {
        ...parsed,
        categoryRows: (parsed.categoryRows || []).filter(row => {
            const action = categoryActions.get(normalizeCatalogStructureName(row.name));
            return !["map_category", "exclude"].includes(action);
        }),
        subcategoryRows: (parsed.subcategoryRows || [])
            .filter(row => {
                const categoryKey = normalizeCatalogStructureName(row.category);
                const action = subcategoryActions.get(`${categoryKey}:${normalizeCatalogStructureName(row.name)}`);
                return !["map_subcategory", "exclude"].includes(action)
                    && !["map_category", "exclude"].includes(categoryActions.get(categoryKey));
            })
            .map(row => {
                const productRow = parsed.productRows.find(item =>
                    normalizeCatalogStructureName(item.category) === normalizeCatalogStructureName(row.category)
                    && normalizeCatalogStructureName(item.subcategory) === normalizeCatalogStructureName(row.name)
                );
                const resolution = productRow ? getStoredResolution(productRow, normalizedResolutions) : null;
                if (resolution?.action !== "create_subcategory") return row;
                const category = structureOptions.categories.find(item => item.id === resolution.categoryId);
                return category ? {
                    ...row,
                    category: category.name,
                    categoryExternalCode: category.externalCode || row.categoryExternalCode || ""
                } : row;
            }),
        productRows: parsed.productRows
            .map(row => {
                const resolution = getStoredResolution(row, normalizedResolutions);
                if (resolution?.action === "exclude") return null;
                return applyStructureResolutionToRow(row, resolution, structureOptions);
            })
            .filter(Boolean)
    };
}

function filterParsedStructureRowsForResolvedCreates(parsed, resolutions, structureOptions) {
    const normalizedResolutions = normalizePreviewResolutions(resolutions);
    const categoryCreates = new Set();
    const subcategoryCreates = new Set();
    const subcategoryCategoryByKey = new Map();

    (parsed.productRows || []).forEach(row => {
        const resolution = getStoredResolution(row, normalizedResolutions);
        if (resolution?.action === "create_category") {
            categoryCreates.add(normalizeCatalogStructureName(row.category));
        }
        if (resolution?.action === "create_subcategory") {
            const key = `${normalizeCatalogStructureName(row.category)}:${normalizeCatalogStructureName(row.subcategory)}`;
            const category = (structureOptions.categories || []).find(item => Number(item.id) === Number(resolution.categoryId));
            subcategoryCreates.add(key);
            if (category) subcategoryCategoryByKey.set(key, category);
        }
    });

    return {
        ...parsed,
        categoryRows: (parsed.categoryRows || []).filter(row => categoryCreates.has(normalizeCatalogStructureName(row.name))),
        subcategoryRows: (parsed.subcategoryRows || [])
            .filter(row =>
                subcategoryCreates.has(`${normalizeCatalogStructureName(row.category)}:${normalizeCatalogStructureName(row.name)}`)
            )
            .map(row => {
                const key = `${normalizeCatalogStructureName(row.category)}:${normalizeCatalogStructureName(row.name)}`;
                const category = subcategoryCategoryByKey.get(key);
                return category ? {
                    ...row,
                    category: category.name,
                    categoryExternalCode: category.externalCode || row.categoryExternalCode || ""
                } : row;
            })
    };
}

async function buildCatalogImportPreview(db, parsed, file = {}, options = {}) {
    const [products, rawStructureRows] = await Promise.all([
        db.all("SELECT * FROM products ORDER BY id ASC"),
        db.all("SELECT * FROM catalog_structure WHERE type IN ('category', 'subcategory') ORDER BY id ASC")
    ]);
    const dbProducts = products.map(normalizeDbProduct);
    const structureRows = rawStructureRows.map(normalizeStructureRow);
    const structureLookup = createStructureLookup(structureRows);
    const structureOptions = buildStructureOptions(structureRows);
    const resolutions = normalizePreviewResolutions(options.resolutions);
    const structureChanges = buildStructurePreview(parsed, structureRows);
    const priceChanges = buildPriceChangesPreview(dbProducts, parsed.productRows);
    const matIndex = buildProductsByMatCode(dbProducts);
    const productsByExternalId = matIndex.productsByMatCode;
    const fileCodes = new Set();
    const importDiagnostics = {
        ...matIndex.diagnostics,
        excelRows: parsed.productRows.length,
        excelRowsWithMatCode: 0,
        matchedMatCodes: 0,
        unmatchedMatCodes: 0,
        unmatchedSamples: []
    };
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
        assignedCategoryCodes: [],
        assignedSubcategoryCodes: [],
        missingCategoryCodes: [],
        missingSubcategoryCodes: [],
        newGroups: [],
        structureWarnings: [],
        unmatchedMatDiagnostics: []
    };

    let nextCodeNumber = getMatNumber(await getNextMatExternalId(db));

    parsed.productRows.forEach(row => {
        const normalizedRowCode = normalizeMatCode(row.externalId);
        if (!normalizedRowCode || !validateMatCode(normalizedRowCode)) {
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

        importDiagnostics.excelRowsWithMatCode += 1;
        fileCodes.add(normalizedRowCode);
        const currentProduct = productsByExternalId.get(normalizedRowCode);
        const structureConflict = getProductStructureConflict(row, structureLookup);
        const storedResolution = structureConflict ? getStoredResolution(row, resolutions) : null;
        if (currentProduct && structureConflict && !hasStructureResolutionApplied(storedResolution)) {
            changes.structureWarnings.push(createStructureWarning(row, structureConflict, currentProduct));
        }
        if (!currentProduct && structureConflict && storedResolution?.action === "exclude") {
            changes.requiresReview.push(buildReviewItem(row, "STRUCTURE_CONFLICT", {
                reasonLabel: structureConflict.message,
                conflictType: structureConflict.type,
                structureConflict,
                resolution: storedResolution
            }));
            return;
        }
        if (!currentProduct && structureConflict && !isStructureConflictResolved(row, resolutions)) {
            importDiagnostics.unmatchedMatCodes += productsByExternalId.has(normalizedRowCode) ? 0 : 1;
            if (!productsByExternalId.has(normalizedRowCode)) {
                const similarProduct = findSimilarProductHint(row, dbProducts);
                changes.unmatchedMatDiagnostics.push(buildUnmatchedMatDiagnostic(row, structureConflict, similarProduct));
            }
            changes.requiresReview.push(buildReviewItem(row, "STRUCTURE_CONFLICT", {
                reasonLabel: structureConflict.message,
                conflictType: structureConflict.type,
                structureConflict,
                resolution: storedResolution
            }));
            fileCodes.add(normalizedRowCode);
            return;
        }

        if (!currentProduct && structureConflict && storedResolution) {
            changes.requiresReview.push(buildReviewItem(row, "STRUCTURE_CONFLICT", {
                reasonLabel: structureConflict.message,
                conflictType: structureConflict.type,
                structureConflict,
                resolution: storedResolution
            }));
        }

        const effective = getEffectiveProductRow(row, currentProduct, structureConflict, storedResolution, structureOptions);
        const effectiveRow = effective.row;
        if (!currentProduct) {
            importDiagnostics.unmatchedMatCodes += 1;
            const similarProduct = findSimilarProductHint(effectiveRow, dbProducts);
            changes.unmatchedMatDiagnostics.push(buildUnmatchedMatDiagnostic(effectiveRow, null, similarProduct));
            if (importDiagnostics.unmatchedSamples.length < 20) {
                importDiagnostics.unmatchedSamples.push({
                    rowNumber: effectiveRow.rowNumber,
                    rawExternalId: effectiveRow.rawExternalId || effectiveRow.externalId,
                    normalizedExternalId: normalizedRowCode
                });
            }
            changes.new.push({
                ...effectiveRow,
                reason: "MAT_CODE_NOT_FOUND",
                reasonLabel: "MAT-код не найден в CRM"
            });
            return;
        }

        importDiagnostics.matchedMatCodes += 1;
        if (currentProduct.deletedAt) {
            changes.deleted.push({
                externalId: normalizedRowCode,
                title: currentProduct.title,
                rowNumber: effectiveRow.rowNumber
            });
            return;
        }

        const fieldChanges = compareProductFields(currentProduct, effectiveRow);
        if (fieldChanges.length) {
            changes.updated.push({
                externalId: normalizedRowCode,
                productId: currentProduct.id,
                title: currentProduct.title,
                rowNumber: effectiveRow.rowNumber,
                changes: fieldChanges,
                category: effectiveRow.category,
                subcategory: effectiveRow.subcategory,
                productGroup: effectiveRow.productGroup,
                price: effectiveRow.price,
                weight: effectiveRow.weight,
                unit: effectiveRow.unit,
                sortOrder: effectiveRow.sortOrder,
                preserveCrmStructure: effective.preserveCrmStructure,
                structureConflict: effective.preserveCrmStructure ? structureConflict : null,
                structureNote: effective.preserveCrmStructure
                    ? "Структура из Excel не применена. MAT-код и текущая структура CRM сохраняются."
                    : ""
            });
        } else {
            changes.unchanged.push({
                externalId: normalizedRowCode,
                productId: currentProduct.id,
                title: currentProduct.title,
                rowNumber: effectiveRow.rowNumber,
                preserveCrmStructure: effective.preserveCrmStructure,
                structureNote: effective.preserveCrmStructure
                    ? "Структура из Excel не применена. MAT-код и текущая структура CRM сохраняются."
                    : ""
            });
        }
    });

    dbProducts.forEach(product => {
        const normalizedCode = normalizeMatCode(product.externalId);
        const isMatProduct = validateMatCode(normalizedCode);
        if (!isMatProduct || fileCodes.has(normalizedCode) || product.deletedAt) return;

        const item = {
            productId: product.id,
            externalId: normalizedCode,
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
            reviewReason: classification.reason,
            reasonLabel: row.reasonLabel || "MAT-код не найден в CRM"
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
    changes.assignedCategoryCodes = structureChanges.assignedCategoryCodes;
    changes.assignedSubcategoryCodes = structureChanges.assignedSubcategoryCodes;
    changes.missingCategoryCodes = structureChanges.missingCategoryCodes;
    changes.missingSubcategoryCodes = structureChanges.missingSubcategoryCodes;
    changes.newGroups = collectNewValues(parsed.productRows, dbProducts.map(product => product.productGroup), "productGroup");

    const unresolvedStructureConflicts = changes.requiresReview.filter(item => item.reviewReason === "STRUCTURE_CONFLICT" && !item.resolved);
    const activeMissingCategoryCodes = changes.missingCategoryCodes;
    const activeMissingSubcategoryCodes = changes.missingSubcategoryCodes;
    const blockingMissingCategoryCodes = activeMissingCategoryCodes.filter(item =>
        unresolvedStructureConflicts.some(conflict =>
            conflict.conflictType === "missing_category"
            && normalizeCatalogStructureName(conflict.category) === normalizeCatalogStructureName(item.name)
        )
    );
    const blockingMissingSubcategoryCodes = activeMissingSubcategoryCodes.filter(item =>
        unresolvedStructureConflicts.some(conflict =>
            conflict.conflictType === "missing_subcategory"
            && normalizeCatalogStructureName(conflict.category) === normalizeCatalogStructureName(item.category)
            && normalizeCatalogStructureName(conflict.subcategory) === normalizeCatalogStructureName(item.name)
        )
    );
    const structureErrors = [
        ...Array.from(matIndex.duplicateMatCodes.entries()).map(([externalId, items]) => ({
            severity: "critical",
            code: "DUPLICATE_DB_MAT_CODE",
            message: `MAT-код ${externalId} назначен нескольким товарам в CRM.`,
            externalId,
            productIds: items.slice(0, 5).map(item => item.id)
        })),
        ...(unresolvedStructureConflicts.length ? [{
            severity: "critical",
            code: "UNRESOLVED_STRUCTURE_CONFLICTS",
            message: `Есть нерешённые структурные конфликты: ${unresolvedStructureConflicts.length}.`
        }] : []),
        ...blockingMissingCategoryCodes.map(item => ({
            severity: "critical",
            code: "MISSING_CAT_STRUCTURE",
            message: `Не удалось найти категорию в структуре: ${item.name}.`,
            rowNumber: item.rowNumber,
            category: item.name
        })),
        ...blockingMissingSubcategoryCodes.map(item => ({
            severity: "critical",
            code: "MISSING_SUB_STRUCTURE",
            message: `Не удалось найти подкатегорию в структуре: ${item.category || "Без категории"} / ${item.name}.`,
            rowNumber: item.rowNumber,
            category: item.category,
            subcategory: item.name
        }))
    ];
    const errors = [...parsed.errors, ...structureErrors];
    const warnings = [
        ...parsed.warnings.filter(item => !["MISSING_CAT_CODE", "MISSING_SUB_CODE"].includes(item.code)),
        ...changes.structureWarnings
    ];
    const applicableRows = changes.updated.length + changes.new.length + changes.missingCodes.length;
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
        assignedCategoryCodes: changes.assignedCategoryCodes.length,
        assignedSubcategoryCodes: changes.assignedSubcategoryCodes.length,
        missingCategoryCodes: activeMissingCategoryCodes.length,
        missingSubcategoryCodes: activeMissingSubcategoryCodes.length,
        structureWarnings: changes.structureWarnings.length,
        blockingMissingCategoryCodes: blockingMissingCategoryCodes.length,
        blockingMissingSubcategoryCodes: blockingMissingSubcategoryCodes.length,
        unmatchedMatDiagnostics: changes.unmatchedMatDiagnostics.length,
        newGroups: changes.newGroups.length,
        priceChanged: priceChanges.changed,
        priceIncreased: priceChanges.increased,
        priceDecreased: priceChanges.decreased,
        priceWarnings: priceChanges.warningSummary.reduce((total, item) => total + item.count, 0),
        applicableRows,
        structureConflicts: unresolvedStructureConflicts.length,
        resolvedStructureConflicts: changes.requiresReview.filter(item => item.reviewReason === "STRUCTURE_CONFLICT" && item.resolved).length,
        criticalErrors: errors.length,
        warnings: warnings.length
    };

    return {
        success: true,
        canImport: errors.length === 0 && !priceChanges.hasBlockingErrors && applicableRows > 0,
        file: {
            name: file.name || "",
            sheet: parsed.sheetName,
            rowsRead: parsed.rowsRead,
            productRows: parsed.productRows.length
        },
        summary,
        changes,
        structureOptions,
        priceChanges,
        debug: process.env.NODE_ENV === "production" ? undefined : importDiagnostics,
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
        resolutions: new Map(),
        userId: user?.id || null,
        createdAt: now.toISOString(),
        createdAtMs: now.getTime(),
        catalogFingerprint
    });

    return preview;
}

async function validateImportResolution(db, resolution) {
    const action = String(resolution?.action || "");
    if (!["exclude", "keep_current_structure", "create_category", "map_category", "create_subcategory", "map_subcategory"].includes(action)) {
        throw createImportError(400, "Выбранное решение недоступно для этой строки.", "INVALID_IMPORT_RESOLUTION");
    }

    if (["map_category", "create_subcategory", "map_subcategory"].includes(action)) {
        const categoryId = Number(resolution.categoryId || 0);
        const category = await db.get(
            "SELECT id FROM catalog_structure WHERE id = ? AND type = 'category' AND is_active = 1 AND COALESCE(is_system, 0) = 0",
            [categoryId]
        );
        if (!category) {
            throw createImportError(400, "Выбранная категория недоступна.", "INVALID_IMPORT_CATEGORY");
        }
    }

    if (action === "map_subcategory") {
        const categoryId = Number(resolution.categoryId || 0);
        const subcategoryId = Number(resolution.subcategoryId || 0);
        const subcategory = await db.get(
            "SELECT id FROM catalog_structure WHERE id = ? AND parent_id = ? AND type = 'subcategory' AND is_active = 1 AND COALESCE(is_system, 0) = 0",
            [subcategoryId, categoryId]
        );
        if (!subcategory) {
            throw createImportError(400, "Выбранная подкатегория не принадлежит выбранной категории.", "INVALID_IMPORT_SUBCATEGORY");
        }
    }

    return {
        rowId: String(resolution.rowId || resolution.rowNumber || ""),
        action,
        categoryId: Number(resolution.categoryId || 0) || null,
        subcategoryId: Number(resolution.subcategoryId || 0) || null
    };
}

async function updateCatalogImportResolutions(db, token, resolutions = [], user = {}) {
    const tokenData = await getValidPreviewToken(db, token, user);
    if (!Array.isArray(resolutions)) {
        throw createImportError(400, "Передайте список решений.", "INVALID_IMPORT_RESOLUTION");
    }

    const structureRows = await db.all("SELECT * FROM catalog_structure WHERE type IN ('category', 'subcategory') ORDER BY id ASC");
    const structureLookup = createStructureLookup(structureRows.map(normalizeStructureRow));
    const categoryActions = new Set(["exclude", "keep_current_structure", "create_category", "map_category"]);
    const subcategoryActions = new Set(["exclude", "keep_current_structure", "create_subcategory", "map_subcategory"]);

    for (const item of resolutions) {
        const normalized = await validateImportResolution(db, item);
        const row = tokenData.parsed.productRows.find(productRow => getResolutionKey(productRow) === normalized.rowId || String(productRow.rowNumber) === normalized.rowId);
        if (!row) {
            throw createImportError(404, "Строка Preview не найдена.", "IMPORT_ROW_NOT_FOUND");
        }
        const structureConflict = getProductStructureConflict(row, structureLookup);
        if (!structureConflict
            || (structureConflict.type === "missing_category" && !categoryActions.has(normalized.action))
            || (structureConflict.type === "missing_subcategory" && !subcategoryActions.has(normalized.action))) {
            throw createImportError(400, "Р’С‹Р±СЂР°РЅРЅРѕРµ СЂРµС€РµРЅРёРµ РЅРµ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓРµС‚ РїСЂРѕР±Р»РµРјРµ СЃС‚СЂРѕРєРё.", "INVALID_IMPORT_RESOLUTION");
        }
        tokenData.resolutions.set(getResolutionKey(row), normalized);
    }

    const preview = await buildCatalogImportPreview(db, tokenData.parsed, tokenData.file, {
        resolutions: tokenData.resolutions
    });
    preview.token = tokenData.token;
    preview.tokenExpiresAt = new Date(tokenData.createdAtMs + PREVIEW_TOKEN_TTL_MS).toISOString();
    tokenData.preview = preview;

    const unresolved = Number(preview.summary?.structureConflicts || 0);
    return {
        success: true,
        data: {
            resolved: Number(preview.summary?.resolvedStructureConflicts || 0),
            unresolved,
            canImport: preview.canImport,
            preview
        }
    };
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
        externalId: normalizeMatCode(externalId),
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

async function updateImportedProduct(db, row, now, productId = null) {
    const product = normalizeIncomingProduct(row);
    const normalizedExternalId = normalizeMatCode(product.externalId);
    if (!productId && !validateMatCode(normalizedExternalId)) {
        throw createImportError(409, "Не удалось определить существующий товар для обновления.", "IMPORT_PRODUCT_MATCH_FAILED");
    }
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
         WHERE ${productId ? "id = ?" : "external_id = ?"}
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
            productId || normalizedExternalId
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
    const latestPreview = await buildCatalogImportPreview(db, tokenData.parsed, tokenData.file, {
        resolutions: tokenData.resolutions
    });
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
    const effectiveParsed = applyImportResolutionsToParsed(
        tokenData.parsed,
        tokenData.resolutions,
        latestPreview.structureOptions || { categories: [], subcategories: [] }
    );
    const structureParsed = filterParsedStructureRowsForResolvedCreates(
        tokenData.parsed,
        tokenData.resolutions,
        latestPreview.structureOptions || { categories: [], subcategories: [] }
    );

    await db.run("BEGIN IMMEDIATE TRANSACTION");
    try {
        const dbProducts = await db.all("SELECT * FROM products ORDER BY id ASC");
        let nextMatNumber = getMaxMatNumberFromProducts(dbProducts) + 1;
        const assignedStructureRows = await upsertCatalogStructureFromParsed(db, structureParsed, now);
        result.assignedStructureCodes = assignedStructureRows.length;
        assignedRows.push(...assignedStructureRows);

        for (const item of latestPreview.changes.updated || []) {
            const parsedRow = effectiveParsed.productRows.find(productRow => productRow.rowNumber === item.rowNumber
                || normalizeMatCode(productRow.externalId) === normalizeMatCode(item.externalId));
            if (!parsedRow) continue;
            const row = item.preserveCrmStructure
                ? {
                    ...parsedRow,
                    category: item.category,
                    subcategory: item.subcategory,
                    productGroup: item.productGroup,
                    price: item.price,
                    weight: item.weight,
                    unit: item.unit,
                    sortOrder: item.sortOrder
                }
                : parsedRow;
            if (!row) continue;
            await updateImportedProduct(db, row, now, item.productId);
            result.updated += 1;
        }

        for (const row of latestPreview.changes.new || []) {
            if (row.classification !== "TRUE_NEW") continue;
            await insertImportedProduct(db, row, now);
            result.created += 1;
        }

        if (assignMissingCodes) {
            for (const row of latestPreview.changes.missingCodes || []) {
                const parsedRow = effectiveParsed.productRows.find(productRow => productRow.rowNumber === row.rowNumber);
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
                     WHERE id = ?
                       AND source = 'excel'
                       AND deleted_at IS NULL`,
                    [now, item.productId]
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
    updateCatalogImportResolutions,
    applyCatalogImport,
    getCatalogImportExcelCopy,
    upsertCatalogStructureFromParsed,
    getNextMatExternalId,
    compareProductFields,
    buildPriceChangesPreview,
    formatMatCode,
    formatCategoryCode,
    formatSubcategoryCode,
    normalizeCategoryCode,
    normalizeSubcategoryCode,
    validateCategoryCode,
    validateSubcategoryCode,
    sanitizeUploadFileName
};
