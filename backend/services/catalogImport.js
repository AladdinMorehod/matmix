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
const PREVIEW_SCHEMA_VERSION = 3;
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

const IMPORT_EXPORT_HEADERS = [
    "Тип / структура / наименование",
    "Служебная копия",
    "ID товара",
    "Ед. изм",
    "Цена",
    "Порядок",
    "Служебное поле",
    "Группа Товаров",
    "Служебное поле",
    "Вес",
    "Код товара"
];

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function sanitizeExcelText(value) {
    const text = normalizeText(value);
    return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function getCatalogExportFileName(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `MatMix_catalog_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}.xlsx`;
}

async function buildCatalogExportWorkbook(db) {
    const [products, structureRows] = await Promise.all([
        db.all(`
            SELECT id, external_id, title, category, subcategory, product_group,
                   price, weight, unit, is_active, sort_order, source
            FROM products
            WHERE deleted_at IS NULL
            ORDER BY category COLLATE NOCASE ASC,
                     subcategory COLLATE NOCASE ASC,
                     product_group COLLATE NOCASE ASC,
                     sort_order ASC,
                     id ASC
        `),
        db.all(`
            SELECT id, type, name, normalized_name, external_code, parent_id, sort_order, is_system
            FROM catalog_structure
            WHERE type IN ('category', 'subcategory')
            ORDER BY sort_order ASC, id ASC
        `)
    ]);

    const categories = structureRows.filter(row => row.type === "category");
    const subcategories = structureRows.filter(row => row.type === "subcategory");
    const categoryByName = new Map(categories.map(row => [normalizeCatalogStructureName(row.name), row]));
    const subcategoryByParentAndName = new Map(subcategories.map(row => [
        `${Number(row.parent_id) || 0}:${normalizeCatalogStructureName(row.name)}`,
        row
    ]));
    const categoryRank = new Map(categories.map((row, index) => [Number(row.id), index]));
    const subcategoryRank = new Map(subcategories.map((row, index) => [Number(row.id), index]));

    const exportRows = products.map(product => {
        const category = categoryByName.get(normalizeCatalogStructureName(product.category));
        const subcategory = category
            ? subcategoryByParentAndName.get(`${Number(category.id)}:${normalizeCatalogStructureName(product.subcategory)}`)
            : null;
        return { product, category, subcategory };
    }).sort((first, second) => {
        const firstCategoryRank = first.category ? categoryRank.get(Number(first.category.id)) : Number.MAX_SAFE_INTEGER;
        const secondCategoryRank = second.category ? categoryRank.get(Number(second.category.id)) : Number.MAX_SAFE_INTEGER;
        const firstSubcategoryRank = first.subcategory ? subcategoryRank.get(Number(first.subcategory.id)) : Number.MAX_SAFE_INTEGER;
        const secondSubcategoryRank = second.subcategory ? subcategoryRank.get(Number(second.subcategory.id)) : Number.MAX_SAFE_INTEGER;
        return firstCategoryRank - secondCategoryRank
            || firstSubcategoryRank - secondSubcategoryRank
            || normalizeText(first.product.product_group).localeCompare(normalizeText(second.product.product_group), "ru")
            || Number(first.product.sort_order || 0) - Number(second.product.sort_order || 0)
            || Number(first.product.id) - Number(second.product.id);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MatMix";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet(IMPORT_SHEET_NAME, {
        views: [{ state: "frozen", ySplit: 1 }]
    });
    sheet.columns = [
        { width: 58 }, { width: 2, hidden: true }, { width: 12 }, { width: 12 }, { width: 14 },
        { width: 12 }, { width: 2, hidden: true }, { width: 26 }, { width: 2, hidden: true }, { width: 12 }, { width: 18 }
    ];

    const header = sheet.addRow(IMPORT_EXPORT_HEADERS);
    header.height = 24;
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } };
    header.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
    header.eachCell({ includeEmpty: true }, cell => {
        cell.border = { bottom: { style: "thin", color: { argb: "FF87B48E" } } };
    });
    header.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: false };
    header.getCell(3).note = "Служебный стабильный идентификатор. Для существующего товара не изменяйте; для нового оставьте пустым.";
    header.getCell(11).note = "Уникальный MAT-код товара. В служебных строках здесь находятся CAT- и SUB-коды.";

    let currentCategoryKey = null;
    let currentSubcategoryKey = null;
    exportRows.forEach(({ product, category, subcategory }) => {
        const categoryName = normalizeText(product.category);
        const subcategoryName = normalizeText(product.subcategory);
        const categoryKey = normalizeCatalogStructureName(categoryName);
        const subcategoryKey = `${categoryKey}:${normalizeCatalogStructureName(subcategoryName)}`;

        if (categoryKey !== currentCategoryKey) {
            currentCategoryKey = categoryKey;
            currentSubcategoryKey = null;
            const row = sheet.addRow([
                sanitizeExcelText(`Категория - ${categoryName}`),
                sanitizeExcelText(`Категория - ${categoryName}`),
                null, null, null, null, null, null, null, null,
                sanitizeExcelText(category?.external_code || "")
            ]);
            row.font = { bold: true, color: { argb: "FF205742" } };
            row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD7E7DC" } };
            row.height = 22;
        }

        if (subcategoryName && subcategoryKey !== currentSubcategoryKey) {
            currentSubcategoryKey = subcategoryKey;
            const row = sheet.addRow([
                sanitizeExcelText(`Подкатегория - ${subcategoryName}`),
                sanitizeExcelText(`Подкатегория - ${subcategoryName}`),
                null, null, null, null, null, null, null, null,
                sanitizeExcelText(subcategory?.external_code || "")
            ]);
            row.font = { bold: true, color: { argb: "FF2F7A5D" } };
            row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F6F1" } };
            row.height = 21;
        }

        const price = product.price === null || product.price === undefined ? null : Number(product.price);
        const weight = product.weight === null || product.weight === undefined ? null : Number(product.weight);
        const title = sanitizeExcelText(product.title);
        const row = sheet.addRow([
            title,
            title,
            Number(product.id),
            sanitizeExcelText(product.unit || "шт"),
            Number.isFinite(price) ? price : null,
            Number(product.sort_order) || 0,
            null,
            sanitizeExcelText(product.product_group || ""),
            null,
            Number.isFinite(weight) ? weight : null,
            sanitizeExcelText(product.external_id || "")
        ]);
        row.getCell(5).numFmt = "#,##0.00";
        row.getCell(10).numFmt = "0.###";
        row.getCell(3).numFmt = "0";
        row.getCell(6).numFmt = "0";
        row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F1F0" } };
        [1, 4, 5, 6, 8, 10, 11].forEach(columnNumber => {
            row.getCell(columnNumber).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCFDFC" } };
        });
        row.alignment = { vertical: "middle", wrapText: false };
    });

    sheet.properties.defaultRowHeight = 20;

    const instructions = workbook.addWorksheet("ИНСТРУКЦИЯ", {
        views: [{ state: "frozen", ySplit: 2 }]
    });
    instructions.columns = [{ width: 28 }, { width: 100 }];
    instructions.getRow(1).height = 30;
    instructions.getCell("A1").value = "MatMix — работа с каталогом";
    instructions.mergeCells("A1:B1");
    instructions.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    instructions.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } };
    instructions.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
    instructions.addRow(["Правило", "Описание"]);
    const instructionRows = [
        ["Рабочий лист", "Импорт читает лист «ШАБЛОН». Не удаляйте и не переименовывайте его и обязательные колонки."],
        ["Существующий товар", "ID товара — служебный стабильный идентификатор. Не изменяйте его без необходимости."],
        ["Новый товар", "Добавьте строку товара и оставьте ID пустым. Укажите уникальный MAT-код, название, единицу и структуру."],
        ["Категория", "Строка «Категория - Название» создаёт или сопоставляет категорию; в K указывается CAT-код."],
        ["Подкатегория", "Строка «Подкатегория - Название» создаёт или сопоставляет подкатегорию; в K указывается SUB-код."],
        ["Группа товаров", "Название группы задаётся в колонке «Группа Товаров» каждой товарной строки."],
        ["Цена", "Может быть пустой — это означает цену по запросу. Если указана, должна быть числом не меньше нуля."],
        ["Вес", "Необязательное числовое поле. Пустое значение импортируется как 0."],
        ["Изображения", "Excel не управляет изображениями. Обратный импорт не удаляет существующие изображения товаров."],
        ["Конфликт ID и MAT", "Если ID и MAT относятся к разным товарам CRM, импорт блокируется до разрешения конфликта."],
        ["Скрытые колонки", "B, G и I — legacy-служебные колонки. Они сохранены для совместимости и скрыты от обычной работы."]
    ];
    instructionRows.forEach(values => instructions.addRow(values));
    const instructionHeader = instructions.getRow(2);
    instructionHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    instructionHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2F7A5D" } };
    instructions.getColumn(1).font = { bold: true, color: { argb: "FF205742" } };
    instructions.eachRow((row, rowNumber) => {
        if (rowNumber > 2) row.height = 34;
        row.alignment = { vertical: "middle", wrapText: true };
    });

    return {
        workbook,
        filename: getCatalogExportFileName(),
        counts: {
            products: products.length,
            active: products.filter(product => Number(product.is_active) === 1).length,
            inactive: products.filter(product => Number(product.is_active) !== 1).length,
            deleted: 0
        }
    };
}

const CATALOG_TEMPLATE_PATH = path.join(__dirname, "..", "templates", "catalog-template.xlsx");

function getStructuralLegacyKind(record) {
    const title = normalizeText(record?.title).replace(/[\u2010-\u2015]/g, "-");
    const match = title.match(/^(категория|подкатегория)\s*(?:-\s*)?(.+)$/i);
    return match ? { type: match[1].toLowerCase() === "категория" ? "category" : "subcategory", name: normalizeText(match[2]) } : null;
}

function classifyCatalogStructureRecord(record, context = {}) {
    const kind = String(record?.type || record?.kind || "").toLowerCase();
    const code = normalizeCodeText(record?.external_code ?? record?.externalCode ?? record?.external_id ?? record?.externalId);
    const parentId = Number(record?.parent_id ?? record?.parentId) || null;
    const isActive = record?.is_active === undefined ? record?.isActive !== false : Number(record.is_active) === 1;
    const hasRelations = Number(context.childCount || 0) > 0
        || Number(context.productCount || 0) > 0
        || context.isPublic === true;
    const duplicateCode = Number(context.codeCount || 0) > 1;

    if (record?.deleted_at || !isActive) return { type: "legacy_invalid", reason: "INACTIVE_OR_DELETED_STRUCTURE" };
    if (!["category", "subcategory"].includes(kind)) return { type: "manual_review", reason: "INVALID_STRUCTURE_KIND" };
    if (kind === "subcategory" && !parentId) return { type: "orphan", reason: "MISSING_STRUCTURE_PARENT" };
    if (duplicateCode) return { type: "manual_review", reason: "DUPLICATE_STRUCTURE_CODE" };
    if (kind === "category" && validateCategoryCode(code) || kind === "subcategory" && validateSubcategoryCode(code)) {
        return { type: "standard", code };
    }
    if (code && hasRelations) return { type: "legacy_valid", code };
    return { type: "manual_review", reason: code ? "UNUSED_LEGACY_STRUCTURE" : "MISSING_STRUCTURE_CODE" };
}

function classifyCatalogRecord(record) {
    const externalId = normalizeCodeText(record?.external_id ?? record?.externalId);
    const legacyStructure = getStructuralLegacyKind(record);
    const isLegacyImport = String(record?.source || "").toLowerCase() === "excel" && externalId.toLowerCase().startsWith("excel-");
    const hasProductPayload = Boolean(normalizeText(record?.product_group))
        || record?.price !== null && record?.price !== undefined && record?.price !== ""
        || Number(record?.weight || 0) !== 0
        || !["", "шт"].includes(normalizeText(record?.unit).toLowerCase());

    if (legacyStructure && isLegacyImport && !hasProductPayload) {
        return {
            type: "legacy_invalid",
            reason: "PRODUCT_ROW_MASQUERADING_AS_STRUCTURE",
            structureType: legacyStructure.type,
            structureName: legacyStructure.name
        };
    }
    if (validateMatCode(externalId)) return { type: "product" };
    if (isLegacyImport && hasProductPayload && !legacyStructure) return { type: "product", legacy: true };
    if (!externalId || validateCategoryCode(externalId) || validateSubcategoryCode(externalId)) {
        return { type: "invalid", reason: "INVALID_PRODUCT_CODE" };
    }
    return { type: "manual_review", reason: "UNRECOGNIZED_LEGACY_CODE" };
}

function validateCatalogExportRows(rows, expectedProducts) {
    const seenCodes = new Set();
    let productCount = 0;
    for (const row of rows) {
        const code = normalizeCodeText(row.values[10]);
        const expected = row.type === "category" ? validateCategoryCode(code)
            : row.type === "subcategory" ? validateSubcategoryCode(code)
                : validateMatCode(code) || row.legacy === true;
        if (!expected) throw createImportError(409, `Некорректный код строки экспорта ${row.rowNumber} (${row.type}: ${code || "пусто"}).`, "CATALOG_EXPORT_INVALID_CODE");
        if (seenCodes.has(code)) throw createImportError(409, `Дублирующийся код строки экспорта ${row.rowNumber}.`, "CATALOG_EXPORT_DUPLICATE_CODE");
        seenCodes.add(code);
        if (row.type === "product") productCount += 1;
    }
    if (productCount !== expectedProducts) {
        throw createImportError(409, "Количество товаров в сформированном каталоге не прошло проверку.", "CATALOG_EXPORT_COUNT_MISMATCH");
    }
}

function cloneExcelStyle(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
}

function applyTemplateRow(sheet, rowNumber, template, values) {
    const row = sheet.getRow(rowNumber);
    row.height = template.height;
    for (let column = 1; column <= 12; column += 1) {
        const cell = row.getCell(column);
        cell.value = values[column - 1] ?? null;
        cell.style = cloneExcelStyle(template.styles[column - 1]);
    }
    sheet.mergeCells(rowNumber, 1, rowNumber, 2);
    row.commit();
    return row;
}

async function buildReferenceCatalogExportWorkbook(db) {
    const [products, structureRows] = await Promise.all([
        db.all(`
            SELECT id, external_id, title, category, subcategory, product_group,
                   price, weight, unit, is_active, sort_order, source
            FROM products
            WHERE deleted_at IS NULL
            ORDER BY sort_order ASC, id ASC
        `),
        db.all(`
            SELECT id, type, name, normalized_name, external_code, parent_id, sort_order, is_system
            FROM catalog_structure
            WHERE type IN ('category', 'subcategory')
            ORDER BY sort_order ASC, id ASC
        `)
    ]);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(CATALOG_TEMPLATE_PATH);
    const sheet = workbook.worksheets[0];
    workbook.creator = "MatMix";
    workbook.modified = new Date();

    const captureRow = rowNumber => ({
        height: sheet.getRow(rowNumber).height,
        styles: Array.from({ length: 12 }, (_, index) => cloneExcelStyle(sheet.getCell(rowNumber, index + 1).style))
    });
    const categoryTemplate = captureRow(7);
    const subcategoryTemplate = captureRow(8);
    const productTemplate = captureRow(9);

    for (const range of [...(sheet.model.merges || [])]) {
        const match = range.match(/^[A-Z]+(\d+):[A-Z]+(\d+)$/);
        if (match && Number(match[1]) >= 7) sheet.unMergeCells(range);
    }
    if (sheet.rowCount > 6) sheet.spliceRows(7, sheet.rowCount - 6);
    if (sheet.columnCount > 12) sheet.spliceColumns(13, sheet.columnCount - 12);
    sheet.removeConditionalFormatting();
    sheet.autoFilter = undefined;
    sheet.views = cloneExcelStyle(sheet.views);

    const categories = structureRows.filter(row => row.type === "category" && !row.is_system);
    const subcategories = structureRows.filter(row => row.type === "subcategory");
    const categoryByName = new Map(categories.map(row => [normalizeCatalogStructureName(row.name), row]));
    const subcategoryByKey = new Map();
    subcategories.forEach(row => {
        const key = `${Number(row.parent_id) || 0}:${normalizeCatalogStructureName(row.name)}`;
        const existing = subcategoryByKey.get(key);
        if (!existing || !validateSubcategoryCode(existing.external_code) && validateSubcategoryCode(row.external_code)) subcategoryByKey.set(key, row);
    });
    const categoryRank = new Map(categories.map((row, index) => [Number(row.id), (Number(row.sort_order) || 0) * 1000 + index]));
    const subcategoryRank = new Map(subcategories.map((row, index) => [Number(row.id), (Number(row.sort_order) || 0) * 1000 + index]));

    const classifiedProducts = products.map(product => ({ product, classification: classifyCatalogRecord(product) }));
    const excluded = classifiedProducts.filter(item => ["legacy_invalid", "orphan"].includes(item.classification.type));
    const ambiguous = classifiedProducts.filter(item => ["invalid", "manual_review"].includes(item.classification.type));
    if (ambiguous.length) {
        console.error("Catalog export blocked by ambiguous records:", ambiguous.map(item => ({ id: item.product.id, reason: item.classification.reason })));
        throw createImportError(409, "Каталог содержит неоднозначные записи. Выполните диагностику перед экспортом.", "CATALOG_EXPORT_AMBIGUOUS_RECORDS");
    }
    if (excluded.length) {
        console.warn("Catalog export excluded invalid legacy structure records:", excluded.map(item => ({
            id: item.product.id,
            kind: item.classification.structureType,
            reason: item.classification.reason
        })));
    }

    const rows = classifiedProducts.filter(item => item.classification.type === "product").map(({ product, classification }) => {
        const category = categoryByName.get(normalizeCatalogStructureName(product.category));
        const subcategory = category
            ? subcategoryByKey.get(`${Number(category.id)}:${normalizeCatalogStructureName(product.subcategory)}`)
            : null;
        return { product, category, subcategory, classification };
    }).sort((first, second) => {
        const firstCategoryRank = first.category ? categoryRank.get(Number(first.category.id)) : Number.MAX_SAFE_INTEGER;
        const secondCategoryRank = second.category ? categoryRank.get(Number(second.category.id)) : Number.MAX_SAFE_INTEGER;
        const firstSubcategoryRank = first.subcategory ? subcategoryRank.get(Number(first.subcategory.id)) : Number.MAX_SAFE_INTEGER;
        const secondSubcategoryRank = second.subcategory ? subcategoryRank.get(Number(second.subcategory.id)) : Number.MAX_SAFE_INTEGER;
        return firstCategoryRank - secondCategoryRank
            || firstSubcategoryRank - secondSubcategoryRank
            || Number(first.product.sort_order || 0) - Number(second.product.sort_order || 0)
            || Number(first.product.id) - Number(second.product.id);
    });

    let rowNumber = 7;
    let currentCategoryKey = null;
    let currentSubcategoryKey = null;
    const validationRows = [];
    for (const { product, category, subcategory, classification } of rows) {
        const categoryName = normalizeText(product.category);
        const subcategoryName = normalizeText(product.subcategory);
        const categoryKey = normalizeCatalogStructureName(categoryName);
        const subcategoryKey = `${categoryKey}:${normalizeCatalogStructureName(subcategoryName)}`;

        if (categoryKey !== currentCategoryKey) {
            currentCategoryKey = categoryKey;
            currentSubcategoryKey = null;
            const title = sanitizeExcelText(`Категория - ${categoryName}`);
            const values = [title, title, null, null, null, null, null, null, null, null, sanitizeExcelText(category?.external_code || ""), null];
            validationRows.push({ type: "category", rowNumber, values });
            applyTemplateRow(sheet, rowNumber++, categoryTemplate, values);
        }
        if (subcategoryName && subcategoryKey !== currentSubcategoryKey) {
            currentSubcategoryKey = subcategoryKey;
            const title = sanitizeExcelText(`Подкатегория - ${subcategoryName}`);
            const values = [title, title, null, null, null, null, null, null, null, null, sanitizeExcelText(subcategory?.external_code || ""), null];
            validationRows.push({ type: "subcategory", rowNumber, values });
            applyTemplateRow(sheet, rowNumber++, subcategoryTemplate, values);
        }

        const price = product.price === null || product.price === undefined ? null : Number(product.price);
        const weight = product.weight === null || product.weight === undefined ? null : Number(product.weight);
        const title = sanitizeExcelText(product.title);
        const values = [
            title, title, null, sanitizeExcelText(product.unit || "шт"), Number.isFinite(price) ? price : null,
            null, null, sanitizeExcelText(product.product_group || ""), null,
            Number.isFinite(weight) ? weight : null, sanitizeExcelText(product.external_id || ""), null
        ];
        validationRows.push({ type: "product", legacy: classification.legacy === true, rowNumber, values });
        applyTemplateRow(sheet, rowNumber++, productTemplate, values);
    }

    validateCatalogExportRows(validationRows, rows.length);

    return {
        workbook,
        filename: getCatalogExportFileName(),
        counts: {
            products: rows.length,
            active: rows.filter(item => Number(item.product.is_active) === 1).length,
            inactive: rows.filter(item => Number(item.product.is_active) !== 1).length,
            deleted: 0,
            excludedStructuralLegacy: excluded.length
        }
    };
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
    return ["наименование", "наименование товара", "товар", "название", "тип / структура / наименование"].includes(normalizeKey(title));
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
    const rawProductId = "";
    const productId = null;
    const code = getCellText(row.getCell(11));
    const structuralCandidate = getStructuralLegacyKind({ title });
    const hasProductPayload = [4, 5, 8, 10].some(index => getCellText(row.getCell(index)));
    const structuralCodeMatches = !code
        || structuralCandidate?.type === "category" && validateCategoryCode(code)
        || structuralCandidate?.type === "subcategory" && validateSubcategoryCode(code);
    const allowLooseServiceRow = !hasProductPayload && structuralCodeMatches;
    const categoryName = allowLooseServiceRow && structuralCandidate?.type === "category" ? structuralCandidate.name : "";
    const subcategoryName = allowLooseServiceRow && structuralCandidate?.type === "subcategory" ? structuralCandidate.name : "";

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
    const rawSortOrder = "";
    const rawWeight = getCellRawValue(row.getCell(10));
    const priceText = getCellText(row.getCell(5));
    const weightText = getCellText(row.getCell(10));
    const unit = normalizeUnit(getCellText(row.getCell(4)));

    return {
        type: "product",
        rowNumber,
        productId,
        rawProductId,
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
        rawWeight,
        sortOrder: null,
        rawSortOrder
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
    const seenProductIds = new Map();
    const titleRows = new Map();
    const context = {
        currentCategory: "",
        currentCategoryExternalCode: "",
        currentSubcategory: "",
        currentSubcategoryExternalCode: ""
    };
    let categoryOrder = 0;
    const subcategoryOrderByCategory = new Map();
    const productOrderBySection = new Map();

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const parsedRow = parseCatalogRow(row, rowNumber, context);

        if (parsedRow.type === "empty") return;

        if (parsedRow.type === "category") {
            categoryOrder += 1;
            parsedRow.sortOrder = categoryOrder;
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
            }
            categoryRows.push(parsedRow);
            return;
        }

        if (parsedRow.type === "subcategory") {
            const categoryKey = normalizeCatalogStructureName(context.currentCategory);
            const subcategoryOrder = (subcategoryOrderByCategory.get(categoryKey) || 0) + 1;
            subcategoryOrderByCategory.set(categoryKey, subcategoryOrder);
            parsedRow.sortOrder = subcategoryOrder;
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
            }
            subcategoryRows.push(parsedRow);
            return;
        }

        if (parsedRow.title && isHeaderTitle(parsedRow.title)) {
            return;
        }

        const normalizedTitle = normalizeKey(parsedRow.title);
        if (parsedRow.rawProductId !== "" && !parsedRow.productId) {
            errors.push(createIssue("critical", "INVALID_PRODUCT_ID", "Product ID must be a positive integer.", rowNumber, { productId: parsedRow.rawProductId }));
        }
        if (parsedRow.rawSortOrder !== "" && parsedRow.sortOrder === null) {
            errors.push(createIssue("critical", "INVALID_SORT_ORDER", "Sort order must be a non-negative integer.", rowNumber, { sortOrder: parsedRow.rawSortOrder }));
        }
        if (parsedRow.productId) {
            if (seenProductIds.has(parsedRow.productId)) {
                errors.push(createIssue("critical", "DUPLICATE_PRODUCT_ID", "Duplicate product ID in Excel.", rowNumber, {
                    productId: parsedRow.productId,
                    firstRowNumber: seenProductIds.get(parsedRow.productId)
                }));
            } else {
                seenProductIds.set(parsedRow.productId, rowNumber);
            }
        }
        if (!parsedRow.title) errors.push(createIssue("critical", "MISSING_TITLE", "Product has no title.", rowNumber));
        if (!parsedRow.category) errors.push(createIssue("critical", "MISSING_CATEGORY", "Product has no category.", rowNumber, { title: parsedRow.title }));
        if (parsedRow.rawExternalId && !validateMatCode(parsedRow.rawExternalId)) {
            warnings.push(createIssue("warning", "LEGACY_PRODUCT_CODE", "Legacy product code is preserved for compatibility.", rowNumber, { externalId: parsedRow.rawExternalId }));
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

        if (!parsedRow.rawExternalId) parsedRow.codeWillBeGenerated = true;
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

        const productSectionKey = `${normalizeCatalogStructureName(parsedRow.category)}\u0000${normalizeCatalogStructureName(parsedRow.subcategory)}`;
        const productOrder = (productOrderBySection.get(productSectionKey) || 0) + 1;
        productOrderBySection.set(productSectionKey, productOrder);
        productRows.push({
            rowNumber,
            productId: parsedRow.productId,
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
            sortOrder: productOrder
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
    if (field === "subcategory") {
        const normalized = normalizeCatalogStructureName(value);
        return normalized === "\u0431\u0435\u0437 \u043f\u043e\u0434\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438" ? "" : normalized;
    }
    return normalizeText(value);
}

function compareProductFields(currentProduct, incomingProduct) {
    return COMPARED_FIELDS
        .map(field => {
            const currentValueRaw = field === "productGroup"
                ? (currentProduct.productGroup ?? currentProduct.product_group)
                : field === "sortOrder"
                    ? (currentProduct.sortOrder ?? currentProduct.sort_order)
                    : currentProduct[field];
            const currentValue = comparableValue(currentValueRaw, field);
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
        if (!normalizedCode) return;
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
        warningRows: 0,
        warningEvents: 0,
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

    summary.warningEvents = summary.warningSummary.reduce((total, item) => total + Number(item.count || 0), 0);
    summary.warningRows = summary.items.filter(item => (item.warningCodes || []).length > 0).length;
    summary.uniquePriceRiskRows = summary.warningRows;
    summary.priceRiskEvents = summary.warningEvents;
    summary.riskBreakdown = summary.warningSummary.map(item => ({
        code: item.code,
        label: item.label,
        events: Number(item.count || 0)
    }));

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

function normalizeProductTitle(value) {
    return String(value || "")
        .normalize("NFKC")
        .replace(/[\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ")
        .replace(/[\u200b-\u200f\u2060\ufeff]/g, "")
        .replace(/[\u2010-\u2015\u2212]/g, "-")
        .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
        .replace(/[\u201c\u201d\u201e\u201f\u00ab\u00bb]/g, '"')
        .replace(/\\/g, "/")
        .toLowerCase()
        .replace(/\u0451/g, "\u0435")
        .replace(/[\u00d7\u0445\u0425*]/g, "x")
        .replace(/\u043c\s*[\u00b2\u00b3\u2082\u2083^]?\s*2/gi, "\u043c2")
        .replace(/\s*([x/(),-])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeMatchText(value) {
    return normalizeProductTitle(value);
}

function hasDamagedTitleMarker(value) {
    return normalizeText(value).includes("?");
}

function getTitleDifferenceDiagnostics(first, second) {
    const firstText = String(first || "");
    const secondText = String(second || "");
    const firstChars = Array.from(firstText);
    const secondChars = Array.from(secondText);
    const maxLength = Math.max(firstChars.length, secondChars.length);
    const differences = [];

    for (let index = 0; index < maxLength; index += 1) {
        const firstChar = firstChars[index] || "";
        const secondChar = secondChars[index] || "";
        if (firstChar === secondChar) continue;

        differences.push({
            index,
            excelChar: firstChar,
            crmChar: secondChar,
            excelCodePoint: firstChar ? `U+${firstChar.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}` : "",
            crmCodePoint: secondChar ? `U+${secondChar.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}` : ""
        });
        if (differences.length >= 20) break;
    }

    return {
        excelJson: JSON.stringify(firstText),
        crmJson: JSON.stringify(secondText),
        excelLength: firstChars.length,
        crmLength: secondChars.length,
        differences
    };
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

function getReviewReasonLabel(reason) {
    const labels = {
        TITLE_MATCH_MAT_DIFFERS: "Совпадает название, отличается MAT",
        POSSIBLE_MAT_TYPO: "Возможная опечатка MAT",
        MULTIPLE_CANDIDATES: "Найдено несколько кандидатов CRM",
        POSSIBLE_EXISTING_PRODUCT: "Похож на существующий товар",
        POSSIBLE_EXISTING_PRODUCT_WITHOUT_CODE: "Возможный существующий товар без MAT-кода",
        SIMILAR_UNLINKED_PRODUCT: "Похож на товар без MAT",
        STRUCTURE_CONFLICT: "Конфликт структуры"
    };
    return labels[reason] || reason || "Требует решения";
}

function buildCandidate(product, similarity = null) {
    if (!product) return null;
    const externalIdRaw = product.externalId || product.external_id || "";
    const matCode = normalizeMatCode(externalIdRaw);
    const hasValidMat = validateMatCode(matCode);
    return {
        id: product.id,
        title: product.title,
        externalId: matCode,
        externalIdRaw,
        matCode: hasValidMat ? matCode : "",
        hasValidMat,
        matStatus: hasValidMat ? "VALID" : (normalizeText(externalIdRaw) ? "INVALID_OR_NON_MAT" : "EMPTY"),
        category: product.category || "",
        subcategory: product.subcategory || "",
        productGroup: product.productGroup || product.product_group || "",
        price: product.price === null || product.price === undefined ? null : Number(product.price),
        source: product.source,
        similarity
    };
}

function buildMatConflictDiagnostics(items, productsByExternalId) {
    const result = {
        conflictsWithEmptyCrmMat: 0,
        conflictsWithDifferentCrmMat: 0,
        conflictsWithEquivalentNormalizedMat: 0,
        conflictsWithInvalidCrmMat: 0,
        conflictsWithMultipleCandidates: 0,
        exactTitleCandidates: 0,
        fuzzyMatCandidates: 0,
        conflictsEligibleForAcceptExcelMat: 0,
        conflictsBlockedFromMatUpdate: 0
    };

    items.forEach(item => {
        const candidates = (item.candidates?.length ? item.candidates : [item.candidate]).filter(Boolean);
        const candidate = item.candidate || candidates[0] || null;
        const excelMat = normalizeMatCode(item.externalId);
        if (item.conflictCode === "MULTIPLE_CANDIDATES" || candidates.length > 1) result.conflictsWithMultipleCandidates += 1;
        if (item.conflictCode === "TITLE_MATCH_MAT_DIFFERS") result.exactTitleCandidates += 1;
        if (item.conflictCode === "POSSIBLE_MAT_TYPO") result.fuzzyMatCandidates += 1;

        if (!candidate || candidate.matStatus === "EMPTY") {
            result.conflictsWithEmptyCrmMat += 1;
        } else if (!candidate.hasValidMat) {
            result.conflictsWithInvalidCrmMat += 1;
        } else if (candidate.matCode === excelMat) {
            result.conflictsWithEquivalentNormalizedMat += 1;
        } else {
            result.conflictsWithDifferentCrmMat += 1;
        }

        const excelMatIsFree = validateMatCode(excelMat) && !productsByExternalId.has(excelMat);
        const eligible = candidates.length === 1
            && item.conflictCode === "TITLE_MATCH_MAT_DIFFERS"
            && excelMatIsFree
            && candidate;
        if (eligible) result.conflictsEligibleForAcceptExcelMat += 1;
        else result.conflictsBlockedFromMatUpdate += 1;
    });

    return result;
}

function getItemCandidates(item) {
    return (item.candidates?.length ? item.candidates : [item.candidate]).filter(Boolean);
}

function getCandidateMatStatus(candidate) {
    if (!candidate) return "NO_CANDIDATE";
    if (candidate.matStatus) return candidate.matStatus;
    const raw = normalizeText(candidate.externalIdRaw || candidate.externalId || "");
    if (!raw) return "EMPTY";
    return validateMatCode(raw) ? "VALID" : "INVALID_OR_NON_MAT";
}

function getMatConflictBlockReasonLabel(reason) {
    const labels = {
        ALREADY_RESOLVED: "Строка уже имеет сохранённое решение.",
        EXCLUDED_BY_USER: "Строка исключена из импорта.",
        STRUCTURE_CONFLICT: "У строки есть нерешённый структурный конфликт.",
        NO_CANDIDATE: "Не найден кандидат CRM.",
        MULTIPLE_CANDIDATES: "Найдено несколько exact-title кандидатов CRM.",
        NOT_EXACT_TITLE_CONFLICT: "Конфликт не является точным совпадением названия.",
        TITLE_NOT_EXACT: "Нормализованные названия Excel и CRM не совпадают.",
        DAMAGED_TITLE_MARKER: "Название содержит повреждённые или неопределённые символы. Исправьте строку в Excel и повторите проверку.",
        EMPTY_EXCEL_MAT: "MAT в Excel пустой.",
        INVALID_EXCEL_MAT: "MAT в Excel невалиден.",
        DUPLICATE_EXCEL_MAT_IN_PREVIEW: "MAT из Excel повторяется в текущем Preview.",
        DUPLICATE_PRODUCT: "Один productId CRM используется несколькими строками Preview.",
        EXCEL_MAT_TAKEN: "MAT из Excel уже занят другим товаром CRM.",
        CRM_HAS_VALID_MAT: "У кандидата CRM уже есть другой валидный MAT.",
        CANDIDATE_DELETED: "Кандидат CRM удалён."
    };
    return labels[reason] || reason || "Иная причина блокировки.";
}

function getAcceptExcelMatDecision({ item, candidate, candidates, dbCandidate, productsByMatCode, productUse, excelMatUse }) {
    const productId = Number(candidate?.id || 0);
    const excelMat = normalizeMatCode(item.externalId);
    const excelMatOwner = productsByMatCode.get(excelMat);
    const candidateMatStatus = getCandidateMatStatus(candidate);
    const normalizedTitleExcel = normalizeMatchText(item.title);
    const normalizedTitleCrm = normalizeMatchText(candidate?.title || "");
    const exactTitleMatch = Boolean(candidate && normalizedTitleExcel === normalizedTitleCrm);
    const exactStructureMatch = Boolean(candidate
        && normalizeCatalogStructureName(item.category) === normalizeCatalogStructureName(candidate.category)
        && normalizeCatalogStructureName(item.subcategory) === normalizeCatalogStructureName(candidate.subcategory));
    const exactTitleCandidateCount = candidates.filter(candidateItem =>
        normalizeMatchText(candidateItem.title) === normalizedTitleExcel
    ).length;
    const blockReasons = [];
    const warnings = [];

    if (item.resolved) blockReasons.push("ALREADY_RESOLVED");
    if (item.resolution?.action === "exclude" || item.importStatus === "EXCLUDED") blockReasons.push("EXCLUDED_BY_USER");
    if (item.reviewReason === "STRUCTURE_CONFLICT") blockReasons.push("STRUCTURE_CONFLICT");
    if (!candidate) blockReasons.push("NO_CANDIDATE");
    if (candidates.length !== 1 || exactTitleCandidateCount !== 1) blockReasons.push("MULTIPLE_CANDIDATES");
    if (item.conflictCode !== "TITLE_MATCH_MAT_DIFFERS" && item.reviewReason !== "TITLE_MATCH_MAT_DIFFERS") blockReasons.push("NOT_EXACT_TITLE_CONFLICT");
    if (!exactTitleMatch) blockReasons.push("TITLE_NOT_EXACT");
    if (hasDamagedTitleMarker(item.title) || hasDamagedTitleMarker(candidate?.title)) blockReasons.push("DAMAGED_TITLE_MARKER");
    if (!exactStructureMatch && candidate) warnings.push("STRUCTURE_DIFFERS");
    if (!excelMat) blockReasons.push("EMPTY_EXCEL_MAT");
    if (!validateMatCode(excelMat)) blockReasons.push("INVALID_EXCEL_MAT");
    if (excelMat && excelMatUse.get(excelMat) > 1) blockReasons.push("DUPLICATE_EXCEL_MAT_IN_PREVIEW");
    if (productId && productUse.get(productId) > 1) blockReasons.push("DUPLICATE_PRODUCT");
    if (excelMatOwner && Number(excelMatOwner.id) !== productId) blockReasons.push("EXCEL_MAT_TAKEN");
    if (candidateMatStatus === "VALID") blockReasons.push("CRM_HAS_VALID_MAT");
    if (dbCandidate?.deletedAt) blockReasons.push("CANDIDATE_DELETED");

    const uniqueBlockReasons = Array.from(new Set(blockReasons));
    return {
        canAcceptExcelMat: uniqueBlockReasons.length === 0,
        blockReasons: uniqueBlockReasons,
        blockReasonLabels: uniqueBlockReasons.map(getMatConflictBlockReasonLabel),
        warnings,
        exactTitleMatch,
        exactStructureMatch,
        exactTitleCandidateCount,
        candidateCount: candidates.length,
        normalizedTitleExcel,
        normalizedTitleCrm,
        candidateMatStatus,
        excelMatOwnerId: excelMatOwner?.id || null
    };
}

function getMatConflictGroup(item, candidate, candidates, blockReasons) {
    if (item.reviewReason === "STRUCTURE_CONFLICT") return "structureConflict";
    if (blockReasons.includes("EXCEL_MAT_TAKEN")) return "excelMatAlreadyTaken";
    if (blockReasons.includes("DUPLICATE_PRODUCT")) return "duplicateCandidateProduct";
    if (candidates.length > 1 || item.conflictCode === "MULTIPLE_CANDIDATES") return "multipleCandidates";
    if (item.conflictCode === "POSSIBLE_MAT_TYPO" || item.reviewReason === "POSSIBLE_MAT_TYPO") return "possibleMatTypo";
    if (!candidate) return "other";

    const isExactTitle = normalizeMatchText(item.title) === normalizeMatchText(candidate.title);
    if (candidates.length === 1 && isExactTitle) {
        const matStatus = getCandidateMatStatus(candidate);
        if (matStatus === "EMPTY") return "singleExactEmptyMat";
        if (matStatus !== "VALID") return "singleExactInvalidMat";
        if (candidate.matCode !== normalizeMatCode(item.externalId)) return "singleExactDifferentValidMat";
    }

    return "other";
}

function buildMatConflictAudit(preview, dbProducts) {
    const productsById = new Map(dbProducts.map(product => [Number(product.id), product]));
    const { productsByMatCode } = buildProductsByMatCode(dbProducts);
    const conflicts = (preview?.changes?.requiresReview || []).filter(item => !item.resolved);
    const productUse = new Map();
    const excelMatUse = new Map();

    conflicts.forEach(item => {
        if (item.reviewReason === "STRUCTURE_CONFLICT") return;
        const candidateId = Number(item.candidate?.id || 0);
        if (candidateId) productUse.set(candidateId, (productUse.get(candidateId) || 0) + 1);
        const excelMat = normalizeMatCode(item.externalId);
        if (excelMat) excelMatUse.set(excelMat, (excelMatUse.get(excelMat) || 0) + 1);
    });

    const groups = {
        singleExactInvalidMat: 0,
        singleExactEmptyMat: 0,
        singleExactDifferentValidMat: 0,
        multipleCandidates: 0,
        possibleMatTypo: 0,
        structureConflict: 0,
        excelMatAlreadyTaken: 0,
        duplicateCandidateProduct: 0,
        other: 0
    };

    const items = conflicts.map(item => {
        const candidates = getItemCandidates(item);
        const candidate = item.candidate || candidates[0] || null;
        const productId = Number(candidate?.id || 0);
        const dbCandidate = productsById.get(productId);
        const excelMat = normalizeMatCode(item.externalId);
        const decision = getAcceptExcelMatDecision({
            item,
            candidate,
            candidates,
            dbCandidate,
            productsByMatCode,
            productUse,
            excelMatUse
        });
        const titleDiagnostics = getTitleDifferenceDiagnostics(item.title, candidate?.title || "");
        const group = getMatConflictGroup(item, candidate, candidates, decision.blockReasons);
        groups[group] = (groups[group] || 0) + 1;

        return {
            rowId: item.rowId || getResolutionKey(item),
            rowNumber: item.rowNumber,
            excelMatRaw: item.rawExternalId || item.externalId || "",
            excelMat,
            titleExcel: item.title || "",
            titleExcelJson: titleDiagnostics.excelJson,
            titleCrmJson: titleDiagnostics.crmJson,
            titleExcelLength: titleDiagnostics.excelLength,
            titleCrmLength: titleDiagnostics.crmLength,
            titleDifferences: titleDiagnostics.differences,
            categoryExcel: item.category || "",
            subcategoryExcel: item.subcategory || "",
            candidateProductId: productId || null,
            crmExternalIdRaw: candidate?.externalIdRaw || candidate?.externalId || "",
            crmMat: candidate?.hasValidMat ? candidate.matCode : "",
            crmMatStatus: decision.candidateMatStatus,
            titleCrm: candidate?.title || "",
            categoryCrm: candidate?.category || "",
            subcategoryCrm: candidate?.subcategory || "",
            priceCrm: candidate?.price ?? null,
            matchType: item.conflictCode || item.reviewReason || "",
            candidateCount: decision.candidateCount,
            exactTitleCandidateCount: decision.exactTitleCandidateCount,
            normalizedTitleExcel: decision.normalizedTitleExcel,
            normalizedTitleCrm: decision.normalizedTitleCrm,
            candidates: candidates.map(candidateItem => ({
                productId: candidateItem.id,
                title: candidateItem.title,
                externalIdRaw: candidateItem.externalIdRaw || candidateItem.externalId || "",
                matStatus: getCandidateMatStatus(candidateItem),
                category: candidateItem.category || "",
                subcategory: candidateItem.subcategory || "",
                price: candidateItem.price ?? null,
                similarity: candidateItem.similarity ?? null
            })),
            exactTitleMatch: decision.exactTitleMatch,
            exactStructureMatch: decision.exactStructureMatch,
            canAcceptExcelMat: decision.canAcceptExcelMat,
            blockReasons: decision.blockReasons,
            blockReasonLabels: decision.blockReasonLabels,
            warnings: decision.warnings,
            group,
            externalIdChange: candidate ? `${candidate.externalIdRaw || candidate.externalId || ""} -> ${excelMat}` : "",
            safetyReason: decision.canAcceptExcelMat
                ? "single exact title candidate; Excel MAT is valid, unique, and replaces empty/non-MAT CRM external_id"
                : ""
        };
    });

    const eligible = items.filter(item => item.canAcceptExcelMat);
    const blocked = items.filter(item => !item.canAcceptExcelMat);

    return {
        totalConflicts: items.length,
        groups,
        eligibleRows: eligible.length,
        blockedRows: blocked.length,
        uniqueProducts: new Set(eligible.map(item => item.candidateProductId).filter(Boolean)).size,
        matChangesPlanned: eligible.length,
        duplicateProductConflicts: items.filter(item => item.blockReasons.includes("DUPLICATE_PRODUCT")).length,
        duplicateMatConflicts: items.filter(item => item.blockReasons.includes("DUPLICATE_EXCEL_MAT_IN_PREVIEW")).length,
        invalidMatRows: items.filter(item => item.blockReasons.includes("INVALID_EXCEL_MAT")).length,
        multipleCandidateRows: items.filter(item => item.blockReasons.includes("MULTIPLE_CANDIDATES")).length,
        eligible,
        blocked,
        items
    };
}

function getWarningGroup(code) {
    if (/MAT|IMPORT_REVIEW/i.test(code)) return "matWarnings";
    if (/PRICE|ZERO|INCREASE|DECREASE/i.test(code)) return "priceWarnings";
    if (/STRUCTURE|CAT|SUB/i.test(code)) return "structureWarnings";
    if (/EMPTY|MISSING/i.test(code)) return "missingFieldWarnings";
    if (/DUPLICATE|SIMILAR/i.test(code)) return "duplicateWarnings";
    if (/TITLE/i.test(code)) return "titleWarnings";
    if (/WEIGHT|UNIT/i.test(code)) return "weightUnitWarnings";
    return "otherWarnings";
}

function buildWarningBreakdown(warnings) {
    const breakdown = {
        matWarnings: 0,
        priceWarnings: 0,
        structureWarnings: 0,
        missingFieldWarnings: 0,
        duplicateWarnings: 0,
        titleWarnings: 0,
        weightUnitWarnings: 0,
        otherWarnings: 0
    };
    warnings.forEach(item => {
        const group = getWarningGroup(item.code || "");
        breakdown[group] += 1;
    });
    return breakdown;
}

function classifyNewProduct(row, candidateProducts) {
    const normalizedRowMat = normalizeMatCode(row.externalId);
    const candidates = candidateProducts.filter(product => !product.deletedAt);
    const rowTitleKey = normalizeMatchText(row.title);
    const exactTitleMatches = candidates.filter(product =>
        normalizeMatCode(product.externalId) !== normalizedRowMat
        && normalizeMatchText(product.title) === rowTitleKey
    );
    if (exactTitleMatches.length) {
        const exactWithValidMat = exactTitleMatches.filter(product => validateMatCode(normalizeMatCode(product.externalId)));
        const primary = exactWithValidMat[0] || exactTitleMatches[0];
        const conflictCode = exactTitleMatches.length > 1
            ? "MULTIPLE_CANDIDATES"
            : "TITLE_MATCH_MAT_DIFFERS";
        return {
            classification: "REQUIRES_REVIEW",
            reason: conflictCode,
            conflictCode,
            candidate: buildCandidate(primary, 1),
            candidates: exactTitleMatches.slice(0, 10).map(product => buildCandidate(product, 1)),
            similarity: 1
        };
    }

    const structureKey = getStructureKey(row);
    const nearest = candidates
        .filter(product => normalizeMatCode(product.externalId) !== normalizedRowMat && getStructureKey(product) === structureKey)
        .map(product => ({ product, similarity: textSimilarity(row.title, product.title) }))
        .sort((first, second) => second.similarity - first.similarity)[0];

    if (nearest && nearest.similarity >= 0.35) {
        const candidateMat = normalizeMatCode(nearest.product.externalId);
        return {
            classification: "REQUIRES_REVIEW",
            reason: validateMatCode(candidateMat) ? "POSSIBLE_MAT_TYPO" : "SIMILAR_UNLINKED_PRODUCT",
            conflictCode: validateMatCode(candidateMat) ? "POSSIBLE_MAT_TYPO" : "SIMILAR_UNLINKED_PRODUCT",
            similarity: Number(nearest.similarity.toFixed(3)),
            candidate: buildCandidate(nearest.product, Number(nearest.similarity.toFixed(3))),
            candidates: [buildCandidate(nearest.product, Number(nearest.similarity.toFixed(3)))]
        };
    }

    return {
        classification: "TRUE_NEW",
        reason: "ABSENT_IN_CRM",
        reasonCode: "ABSENT_IN_CRM"
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

function collectUsedStructureCodes(structureRows, normalizer) {
    const used = new Set();
    structureRows.forEach(row => {
        const code = normalizer(row.externalCode || row.external_code || "");
        if (code) used.add(code);
    });
    return used;
}

function allocateNextStructureCode(usedCodes, formatter) {
    let number = 1;
    let code = formatter(number);
    while (usedCodes.has(code)) {
        number += 1;
        code = formatter(number);
    }
    usedCodes.add(code);
    return code;
}

function allocateNextCategoryCode(usedCodes) {
    return allocateNextStructureCode(usedCodes, formatCategoryCode);
}

function allocateNextSubcategoryCode(usedCodes) {
    return allocateNextStructureCode(usedCodes, formatSubcategoryCode);
}

function chooseStructureCode({ requestedCode, usedCodes, normalizer, validator, allocator }) {
    const normalizedRequested = normalizer(requestedCode || "");
    if (normalizedRequested && validator(normalizedRequested) && !usedCodes.has(normalizedRequested)) {
        usedCodes.add(normalizedRequested);
        return {
            code: normalizedRequested,
            requestedCode: normalizedRequested,
            ignoredCode: "",
            assignedBy: "excel"
        };
    }

    const code = allocator(usedCodes);
    return {
        code,
        requestedCode: normalizedRequested,
        ignoredCode: normalizedRequested || requestedCode || "",
        assignedBy: "auto"
    };
}

function buildStructurePreview(parsed, structureRows) {
    const categoryListsByName = new Map();
    const subcategoryListsByParentAndName = new Map();
    const usedCategoryCodes = collectUsedStructureCodes(
        structureRows.filter(row => row.type === "category"),
        normalizeCategoryCode
    );
    const usedSubcategoryCodes = collectUsedStructureCodes(
        structureRows.filter(row => row.type === "subcategory"),
        normalizeSubcategoryCode
    );
    const changes = {
        newCategories: [],
        renamedCategories: [],
        assignedCategoryCodes: [],
        missingCategoryCodes: [],
        newSubcategories: [],
        renamedSubcategories: [],
        assignedSubcategoryCodes: [],
        missingSubcategoryCodes: [],
        structureCodeConflicts: [],
        existingCategoriesMatchedByName: [],
        existingSubcategoriesMatchedByName: [],
        categoryCodesPreserved: [],
        subcategoryCodesPreserved: [],
        categoryCodesAssigned: [],
        subcategoryCodesAssigned: [],
        categoryExcelCodesIgnored: [],
        subcategoryExcelCodesIgnored: [],
        realStructureConflicts: []
    };
    const pushList = (map, key, row) => {
        const list = map.get(key) || [];
        list.push(row);
        map.set(key, list);
    };
    const getSingle = list => (list && list.length === 1 ? list[0] : null);
    const categoryByNameOrFileCode = new Map();
    const plannedCategoriesByName = new Map();

    structureRows.filter(row => row.type === "category" && row.isActive && !row.isSystem).forEach(row => {
        const nameKey = normalizeCatalogStructureName(row.name);
        pushList(categoryListsByName, nameKey, row);
    });
    structureRows.filter(row => row.type === "subcategory" && row.isActive && !row.isSystem).forEach(row => {
        const parentNameKey = `${row.parentId}:${normalizeCatalogStructureName(row.name)}`;
        pushList(subcategoryListsByParentAndName, parentNameKey, row);
    });

    parsed.categoryRows?.forEach(row => {
        const nameKey = normalizeCatalogStructureName(row.name);
        const nameMatches = categoryListsByName.get(nameKey) || [];
        const existingByName = getSingle(nameMatches);
        const requestedCode = normalizeCategoryCode(row.externalCode || "");

        if (nameMatches.length > 1) {
            const conflict = {
                type: "category",
                conflictType: "MULTIPLE_NAME_MATCHES",
                externalCode: row.externalCode || "",
                rowNumber: row.rowNumber,
                incomingName: row.name,
                matches: nameMatches.map(item => ({ structureId: item.id, name: item.name, externalCode: item.externalCode || "" }))
            };
            changes.structureCodeConflicts.push(conflict);
            changes.realStructureConflicts.push(conflict);
            return;
        }

        if (existingByName) {
            categoryByNameOrFileCode.set(nameKey, existingByName);
            if (requestedCode) categoryByNameOrFileCode.set(requestedCode, existingByName);
            changes.existingCategoriesMatchedByName.push({
                rowNumber: row.rowNumber,
                name: row.name,
                structureId: existingByName.id,
                externalCode: existingByName.externalCode || ""
            });

            if (existingByName.externalCode) {
                changes.categoryCodesPreserved.push({
                    rowNumber: row.rowNumber,
                    name: row.name,
                    structureId: existingByName.id,
                    externalCode: normalizeCategoryCode(existingByName.externalCode)
                });
                if (requestedCode && requestedCode !== normalizeCategoryCode(existingByName.externalCode)) {
                    changes.categoryExcelCodesIgnored.push({
                        rowNumber: row.rowNumber,
                        name: row.name,
                        ignoredExternalCode: requestedCode,
                        preservedExternalCode: normalizeCategoryCode(existingByName.externalCode),
                        reason: "EXISTING_CRM_CODE_PRESERVED"
                    });
                }
            } else {
                const codeChoice = chooseStructureCode({
                    requestedCode,
                    usedCodes: usedCategoryCodes,
                    normalizer: normalizeCategoryCode,
                    validator: validateCategoryCode,
                    allocator: allocateNextCategoryCode
                });
                changes.assignedCategoryCodes.push({
                    rowNumber: row.rowNumber,
                    name: row.name,
                    externalCode: codeChoice.code,
                    requestedExternalCode: codeChoice.requestedCode,
                    structureId: existingByName.id,
                    assignedBy: codeChoice.assignedBy
                });
                changes.categoryCodesAssigned.push(changes.assignedCategoryCodes[changes.assignedCategoryCodes.length - 1]);
                if (codeChoice.ignoredCode) {
                    changes.categoryExcelCodesIgnored.push({
                        rowNumber: row.rowNumber,
                        name: row.name,
                        ignoredExternalCode: codeChoice.ignoredCode,
                        assignedExternalCode: codeChoice.code,
                        reason: "EXCEL_CODE_UNAVAILABLE"
                    });
                }
            }
            return;
        }

        const codeChoice = chooseStructureCode({
            requestedCode,
            usedCodes: usedCategoryCodes,
            normalizer: normalizeCategoryCode,
            validator: validateCategoryCode,
            allocator: allocateNextCategoryCode
        });
        const plannedCategory = {
            ...row,
            externalCode: codeChoice.code,
            requestedExternalCode: codeChoice.requestedCode,
            assignedBy: codeChoice.assignedBy
        };
        changes.newCategories.push(plannedCategory);
        changes.assignedCategoryCodes.push({
            rowNumber: row.rowNumber,
            name: row.name,
            externalCode: codeChoice.code,
            requestedExternalCode: codeChoice.requestedCode,
            structureId: null,
            assignedBy: codeChoice.assignedBy
        });
        changes.categoryCodesAssigned.push(changes.assignedCategoryCodes[changes.assignedCategoryCodes.length - 1]);
        if (codeChoice.ignoredCode) {
            changes.categoryExcelCodesIgnored.push({
                rowNumber: row.rowNumber,
                name: row.name,
                ignoredExternalCode: codeChoice.ignoredCode,
                assignedExternalCode: codeChoice.code,
                reason: "EXCEL_CODE_UNAVAILABLE"
            });
        }
        plannedCategoriesByName.set(nameKey, plannedCategory);
        categoryByNameOrFileCode.set(nameKey, plannedCategory);
        if (requestedCode) categoryByNameOrFileCode.set(requestedCode, plannedCategory);
    });

    parsed.subcategoryRows?.forEach(row => {
        const categoryNameKey = normalizeCatalogStructureName(row.category);
        const parent = categoryByNameOrFileCode.get(categoryNameKey)
            || (row.categoryExternalCode ? categoryByNameOrFileCode.get(normalizeCategoryCode(row.categoryExternalCode)) : null);
        const subNameKey = normalizeCatalogStructureName(row.name);
        const requestedCode = normalizeSubcategoryCode(row.externalCode || "");
        const parentId = parent?.id || null;
        const parentNameKey = parentId ? `${parentId}:${subNameKey}` : "";
        const nameMatches = parentNameKey ? (subcategoryListsByParentAndName.get(parentNameKey) || []) : [];
        const existingByName = getSingle(nameMatches);

        if (!parent) {
            const conflict = {
                type: "subcategory",
                conflictType: "CATEGORY_NOT_FOUND",
                rowNumber: row.rowNumber,
                category: row.category,
                incomingName: row.name,
                externalCode: row.externalCode || ""
            };
            changes.structureCodeConflicts.push(conflict);
            changes.realStructureConflicts.push(conflict);
            return;
        }

        if (nameMatches.length > 1) {
            const conflict = {
                type: "subcategory",
                conflictType: "MULTIPLE_NAME_MATCHES",
                externalCode: row.externalCode,
                rowNumber: row.rowNumber,
                category: row.category,
                incomingName: row.name,
                parentId: parent.id,
                matches: nameMatches.map(item => ({ structureId: item.id, name: item.name, externalCode: item.externalCode || "" }))
            };
            changes.structureCodeConflicts.push(conflict);
            changes.realStructureConflicts.push(conflict);
            return;
        }

        if (existingByName) {
            changes.existingSubcategoriesMatchedByName.push({
                rowNumber: row.rowNumber,
                category: row.category,
                name: row.name,
                structureId: existingByName.id,
                parentId,
                externalCode: existingByName.externalCode || ""
            });
            if (existingByName.externalCode) {
                changes.subcategoryCodesPreserved.push({
                    rowNumber: row.rowNumber,
                    category: row.category,
                    name: row.name,
                    structureId: existingByName.id,
                    parentId,
                    externalCode: normalizeSubcategoryCode(existingByName.externalCode)
                });
                if (requestedCode && requestedCode !== normalizeSubcategoryCode(existingByName.externalCode)) {
                    changes.subcategoryExcelCodesIgnored.push({
                        rowNumber: row.rowNumber,
                        category: row.category,
                        name: row.name,
                        ignoredExternalCode: requestedCode,
                        preservedExternalCode: normalizeSubcategoryCode(existingByName.externalCode),
                        reason: "EXISTING_CRM_CODE_PRESERVED"
                    });
                }
            } else {
                const codeChoice = chooseStructureCode({
                    requestedCode,
                    usedCodes: usedSubcategoryCodes,
                    normalizer: normalizeSubcategoryCode,
                    validator: validateSubcategoryCode,
                    allocator: allocateNextSubcategoryCode
                });
                changes.assignedSubcategoryCodes.push({
                    rowNumber: row.rowNumber,
                    category: row.category,
                    name: row.name,
                    externalCode: codeChoice.code,
                    requestedExternalCode: codeChoice.requestedCode,
                    structureId: existingByName.id,
                    parentId,
                    parentExternalCode: parent.externalCode || row.categoryExternalCode || "",
                    assignedBy: codeChoice.assignedBy
                });
                changes.subcategoryCodesAssigned.push(changes.assignedSubcategoryCodes[changes.assignedSubcategoryCodes.length - 1]);
                if (codeChoice.ignoredCode) {
                    changes.subcategoryExcelCodesIgnored.push({
                        rowNumber: row.rowNumber,
                        category: row.category,
                        name: row.name,
                        ignoredExternalCode: codeChoice.ignoredCode,
                        assignedExternalCode: codeChoice.code,
                        reason: "EXCEL_CODE_UNAVAILABLE"
                    });
                }
            }
            return;
        }

        const codeChoice = chooseStructureCode({
            requestedCode,
            usedCodes: usedSubcategoryCodes,
            normalizer: normalizeSubcategoryCode,
            validator: validateSubcategoryCode,
            allocator: allocateNextSubcategoryCode
        });
        const plannedSubcategory = {
            ...row,
            externalCode: codeChoice.code,
            requestedExternalCode: codeChoice.requestedCode,
            parentId,
            parentExternalCode: parent.externalCode || row.categoryExternalCode || "",
            assignedBy: codeChoice.assignedBy
        };
        changes.newSubcategories.push(plannedSubcategory);
        changes.assignedSubcategoryCodes.push({
            rowNumber: row.rowNumber,
            category: row.category,
            name: row.name,
            externalCode: codeChoice.code,
            requestedExternalCode: codeChoice.requestedCode,
            structureId: null,
            parentId,
            parentExternalCode: parent.externalCode || row.categoryExternalCode || "",
            assignedBy: codeChoice.assignedBy
        });
        changes.subcategoryCodesAssigned.push(changes.assignedSubcategoryCodes[changes.assignedSubcategoryCodes.length - 1]);
        if (codeChoice.ignoredCode) {
            changes.subcategoryExcelCodesIgnored.push({
                rowNumber: row.rowNumber,
                category: row.category,
                name: row.name,
                ignoredExternalCode: codeChoice.ignoredCode,
                assignedExternalCode: codeChoice.code,
                reason: "EXCEL_CODE_UNAVAILABLE"
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

function isProductReviewResolved(resolution) {
    return Boolean(resolution && ["exclude", "map_existing", "accept_excel_mat", "create_new"].includes(resolution.action));
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
    const productsById = new Map(dbProducts.map(product => [Number(product.id), product]));
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
        excluded: [],
        matConflicts: [],
        newCategories: [],
        newSubcategories: [],
        renamedCategories: [],
        renamedSubcategories: [],
        assignedCategoryCodes: [],
        assignedSubcategoryCodes: [],
        missingCategoryCodes: [],
        missingSubcategoryCodes: [],
        structureCodeConflicts: [],
        existingCategoriesMatchedByName: [],
        existingSubcategoriesMatchedByName: [],
        categoryCodesPreserved: [],
        subcategoryCodesPreserved: [],
        categoryCodesAssigned: [],
        subcategoryCodesAssigned: [],
        categoryExcelCodesIgnored: [],
        subcategoryExcelCodesIgnored: [],
        realStructureConflicts: [],
        newGroups: [],
        structureWarnings: [],
        unmatchedMatDiagnostics: []
    };

    let nextCodeNumber = getMatNumber(await getNextMatExternalId(db));

    parsed.productRows.forEach(row => {
        const normalizedRowCode = normalizeMatCode(row.externalId);
        const currentProductById = row.productId ? productsById.get(Number(row.productId)) : null;
        const currentProductByCode = productsByExternalId.get(normalizedRowCode);
        if (!normalizedRowCode && !currentProductById) {
            const suggestedExternalId = formatMatCode(nextCodeNumber);
            changes.new.push({
                ...row,
                externalId: suggestedExternalId,
                suggestedExternalId,
                autoGeneratedMat: true,
                reason: "MAT_CODE_WILL_BE_GENERATED",
                reasonLabel: "Для нового товара будет автоматически создан MAT-код."
            });
            fileCodes.add(suggestedExternalId);
            nextCodeNumber += 1;
            return;
        }
        if (!validateMatCode(normalizedRowCode) && !currentProductByCode && !currentProductById) {
            changes.missingCodes.push({
                rowNumber: row.rowNumber,
                title: row.title,
                category: row.category,
                subcategory: row.subcategory,
                rawExternalId: row.rawExternalId,
                reason: "INVALID_LEGACY_PRODUCT_CODE"
            });
            return;
        }

        if (validateMatCode(normalizedRowCode)) importDiagnostics.excelRowsWithMatCode += 1;
        if (normalizedRowCode) fileCodes.add(normalizedRowCode);
        if (currentProductById && currentProductByCode && Number(currentProductById.id) !== Number(currentProductByCode.id)) {
            changes.requiresReview.push(buildReviewItem(row, "ID_MAT_CONFLICT", {
                importStatus: "ID_MAT_CONFLICT",
                reasonLabel: "ID товара и MAT-код относятся к разным товарам CRM.",
                candidate: currentProductById,
                candidates: [currentProductById, currentProductByCode]
            }));
            return;
        }
        let currentProduct = currentProductById || currentProductByCode;
        const structureConflict = getProductStructureConflict(row, structureLookup);
        const storedResolution = getStoredResolution(row, resolutions);
        const mappedExistingProduct = !currentProduct && ["map_existing", "accept_excel_mat"].includes(storedResolution?.action)
            ? productsById.get(Number(storedResolution.productId || 0))
            : null;
        if (mappedExistingProduct) currentProduct = mappedExistingProduct;

        if (currentProduct && structureConflict && !hasStructureResolutionApplied(storedResolution)) {
            changes.structureWarnings.push(createStructureWarning(row, structureConflict, currentProduct));
        }
        if (!currentProduct && !structureConflict && storedResolution?.action === "exclude") {
            changes.excluded.push({
                ...row,
                importStatus: "EXCLUDED",
                rowId: getResolutionKey(row),
                reviewReason: "EXCLUDED_BY_USER",
                reasonLabel: "Строка исключена из импорта пользователем",
                resolution: storedResolution,
                resolved: true
            });
            return;
        }
        if (!currentProduct && structureConflict && storedResolution?.action === "exclude") {
            const item = buildReviewItem(row, "STRUCTURE_CONFLICT", {
                importStatus: "EXCLUDED",
                reasonLabel: structureConflict.message,
                conflictType: structureConflict.type,
                structureConflict,
                resolution: storedResolution
            });
            changes.requiresReview.push(item);
            changes.excluded.push(item);
            return;
        }
        if (!currentProduct && structureConflict && !isStructureConflictResolved(row, resolutions)) {
            importDiagnostics.unmatchedMatCodes += productsByExternalId.has(normalizedRowCode) ? 0 : 1;
            if (!productsByExternalId.has(normalizedRowCode)) {
                const similarProduct = findSimilarProductHint(row, dbProducts);
                changes.unmatchedMatDiagnostics.push(buildUnmatchedMatDiagnostic(row, structureConflict, similarProduct));
            }
            changes.requiresReview.push(buildReviewItem(row, "STRUCTURE_CONFLICT", {
                importStatus: "STRUCTURE_CONFLICT",
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
                importStatus: "STRUCTURE_CONFLICT",
                reasonLabel: structureConflict.message,
                conflictType: structureConflict.type,
                structureConflict,
                resolution: storedResolution
            }));
        }

        const effective = mappedExistingProduct && !hasStructureResolutionApplied(storedResolution)
            ? {
                row: {
                    ...row,
                    category: currentProduct.category || "",
                    subcategory: currentProduct.subcategory || "",
                    categoryExternalCode: "",
                    subcategoryExternalCode: ""
                },
                preserveCrmStructure: true
            }
            : getEffectiveProductRow(row, currentProduct, structureConflict, storedResolution, structureOptions);
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
        fileCodes.add(normalizeMatCode(currentProduct.externalId));
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
                importStatus: "MATCHED_UPDATE",
                externalId: normalizedRowCode,
                incomingExternalId: mappedExistingProduct ? normalizedRowCode : "",
                acceptExcelMat: storedResolution?.action === "accept_excel_mat",
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
            if (storedResolution?.action === "accept_excel_mat") {
                const item = changes.updated[changes.updated.length - 1];
                if (!item.changes.some(change => change.field === "externalId")) {
                    item.changes.unshift({
                        field: "externalId",
                        currentValue: normalizeMatCode(currentProduct.externalId),
                        incomingValue: normalizedRowCode
                    });
                }
            }
        } else {
            changes.unchanged.push({
                importStatus: "MATCHED_UPDATE",
                externalId: normalizedRowCode,
                incomingExternalId: mappedExistingProduct ? normalizedRowCode : "",
                acceptExcelMat: storedResolution?.action === "accept_excel_mat",
                productId: currentProduct.id,
                title: currentProduct.title,
                rowNumber: effectiveRow.rowNumber,
                preserveCrmStructure: effective.preserveCrmStructure,
                structureNote: effective.preserveCrmStructure
                    ? "Структура из Excel не применена. MAT-код и текущая структура CRM сохраняются."
                    : ""
            });
            if (storedResolution?.action === "accept_excel_mat") {
                const item = changes.unchanged.pop();
                changes.updated.push({
                    ...item,
                    title: effectiveRow.title,
                    category: effectiveRow.category,
                    subcategory: effectiveRow.subcategory,
                    productGroup: effectiveRow.productGroup,
                    price: effectiveRow.price,
                    weight: effectiveRow.weight,
                    unit: effectiveRow.unit,
                    sortOrder: effectiveRow.sortOrder,
                    changes: [{
                        field: "externalId",
                        currentValue: normalizeMatCode(currentProduct.externalId),
                        incomingValue: normalizedRowCode
                    }]
                });
            }
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

    changes.new.forEach(row => {
        const resolution = getStoredResolution(row, resolutions);
        let classification = resolution?.action === "create_new"
            ? { classification: "TRUE_NEW", reason: "ABSENT_IN_CRM" }
            : classifyNewProduct(row, dbProducts);
        if (row.autoGeneratedMat && classification.classification !== "TRUE_NEW") {
            classification = {
                ...classification,
                reason: "POSSIBLE_EXISTING_PRODUCT_WITHOUT_CODE",
                conflictCode: "POSSIBLE_EXISTING_PRODUCT_WITHOUT_CODE"
            };
        }
        const item = {
            ...row,
            importStatus: classification.classification === "TRUE_NEW" ? "SAFE_NEW" : "MAT_CONFLICT",
            classification: classification.classification,
            reviewReason: classification.reason,
            conflictCode: classification.conflictCode || (classification.classification === "TRUE_NEW" ? "" : classification.reason),
            reasonCode: classification.reasonCode || (classification.classification === "TRUE_NEW" ? "ABSENT_IN_CRM" : ""),
            reasonLabel: classification.classification === "TRUE_NEW"
                ? (row.autoGeneratedMat ? "Для нового товара будет автоматически создан MAT-код." : "MAT отсутствует в CRM, конфликтов не найдено")
                : getReviewReasonLabel(classification.reason),
            rowId: getResolutionKey(row),
            resolution: resolution || null,
            resolved: isProductReviewResolved(resolution)
        };
        if (classification.candidate) item.candidate = classification.candidate;
        if (classification.candidates) item.candidates = classification.candidates;
        if (classification.similarity) item.similarity = classification.similarity;

        if (classification.classification === "TRUE_NEW") {
            changes.trueNew.push(item);
        } else {
            changes.requiresReview.push(item);
            changes.matConflicts.push(item);
        }
    });
    changes.new = changes.trueNew;
    const importRowsByKey = new Map();
    [
        ...changes.updated,
        ...changes.new,
        ...changes.requiresReview,
        ...changes.excluded,
        ...changes.missingCodes.map(item => ({ ...item, importStatus: "ERROR" }))
    ].forEach(item => {
        const key = item.rowId || item.rowNumber || `${item.importStatus}:${importRowsByKey.size}`;
        importRowsByKey.set(String(key), item);
    });
    changes.importRows = Array.from(importRowsByKey.values());

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
    changes.structureCodeConflicts = structureChanges.structureCodeConflicts || [];
    changes.existingCategoriesMatchedByName = structureChanges.existingCategoriesMatchedByName || [];
    changes.existingSubcategoriesMatchedByName = structureChanges.existingSubcategoriesMatchedByName || [];
    changes.categoryCodesPreserved = structureChanges.categoryCodesPreserved || [];
    changes.subcategoryCodesPreserved = structureChanges.subcategoryCodesPreserved || [];
    changes.categoryCodesAssigned = structureChanges.categoryCodesAssigned || changes.assignedCategoryCodes;
    changes.subcategoryCodesAssigned = structureChanges.subcategoryCodesAssigned || changes.assignedSubcategoryCodes;
    changes.categoryExcelCodesIgnored = structureChanges.categoryExcelCodesIgnored || [];
    changes.subcategoryExcelCodesIgnored = structureChanges.subcategoryExcelCodesIgnored || [];
    changes.realStructureConflicts = structureChanges.realStructureConflicts || changes.structureCodeConflicts;
    changes.newGroups = collectNewValues(parsed.productRows, dbProducts.map(product => product.productGroup), "productGroup");

    const unresolvedStructureConflicts = changes.requiresReview.filter(item => item.reviewReason === "STRUCTURE_CONFLICT" && !item.resolved);
    const unresolvedReviewConflicts = changes.requiresReview.filter(item => !item.resolved);
    const resolvedReviewConflicts = Array.from(resolutions.values()).filter(resolution =>
        isProductReviewResolved(resolution) || [
            "keep_current_structure",
            "create_category",
            "map_category",
            "create_subcategory",
            "map_subcategory"
        ].includes(resolution?.action)
    );
    const matChangesPlanned = changes.updated.filter(item => item.acceptExcelMat).length;
    const preservedMatRows = changes.updated.filter(item => item.preserveCrmStructure && !item.acceptExcelMat).length
        + changes.unchanged.filter(item => item.preserveCrmStructure && !item.acceptExcelMat).length;
    const titleMatchMatDiffers = changes.requiresReview.filter(item => item.reviewReason === "TITLE_MATCH_MAT_DIFFERS").length;
    const possibleMatTypo = changes.requiresReview.filter(item => item.reviewReason === "POSSIBLE_MAT_TYPO").length;
    const multipleCandidates = changes.requiresReview.filter(item => item.reviewReason === "MULTIPLE_CANDIDATES").length;
    const matConflictDiagnostics = buildMatConflictDiagnostics(changes.matConflicts, productsByExternalId);
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
        ...changes.structureCodeConflicts.map(item => ({
            severity: "critical",
            code: "STRUCTURE_CODE_BINDING_CONFLICT",
            message: `${item.externalCode || "CAT/SUB"} already belongs to a different CRM structure row.`,
            rowNumber: item.rowNumber,
            details: item
        }))
    ];
    const errors = [...parsed.errors, ...structureErrors];
    const warnings = [
        ...parsed.warnings.filter(item => !["MISSING_CAT_CODE", "MISSING_SUB_CODE", "SERVICE_ROW_SKIPPED", "EMPTY_PRICE", "EMPTY_WEIGHT", "EMPTY_GROUP"].includes(item.code)),
        ...changes.structureWarnings,
        ...changes.categoryExcelCodesIgnored.map(item => createIssue("warning", "CATEGORY_EXCEL_CODE_IGNORED", "CAT code from Excel was ignored because CRM structure is matched by name.", item.rowNumber, item)),
        ...changes.subcategoryExcelCodesIgnored.map(item => createIssue("warning", "SUBCATEGORY_EXCEL_CODE_IGNORED", "SUB code from Excel was ignored because CRM structure is matched by name and parent.", item.rowNumber, item)),
        ...unresolvedStructureConflicts.map(item => createIssue("warning", "UNRESOLVED_STRUCTURE_CONFLICTS", "Есть нерешённый структурный конфликт.", item.rowNumber, item)),
        ...changes.requiresReview
            .filter(item => item.reviewReason !== "STRUCTURE_CONFLICT" && !item.resolved)
            .map(item => createIssue("warning", "UNRESOLVED_IMPORT_REVIEW", "Перед применением импорта необходимо решить или исключить конфликтную строку.", item.rowNumber, item))
    ];
    const warningRows = new Set(warnings.map(item => Number(item.rowNumber || 0)).filter(Boolean)).size;
    const warningBreakdown = buildWarningBreakdown(warnings);
    // Applicable means that a product row was parsed and safely matched/planned,
    // not merely that applying the file would mutate that product. A complete,
    // unchanged export must remain importable and therefore cannot report zero.
    const applicableRows = changes.updated.length
        + changes.new.length
        + changes.unchanged.length
        + changes.missingCodes.length;
    const generatedMatCodes = changes.new.filter(item => item.autoGeneratedMat).length;
    const generatedCategoryCodes = changes.newCategories.filter(item => parsed.categoryRows.some(row =>
        normalizeCatalogStructureName(row.name) === normalizeCatalogStructureName(item.name)
        && !row.rawExternalCode
    )).length;
    const generatedSubcategoryCodes = changes.newSubcategories.filter(item => parsed.subcategoryRows.some(row =>
        normalizeCatalogStructureName(row.category) === normalizeCatalogStructureName(item.category)
        && normalizeCatalogStructureName(row.name) === normalizeCatalogStructureName(item.name)
        && !row.rawExternalCode
    )).length;
    const emptyPriceCount = parsed.productRows.filter(item => !item.priceText).length;
    const summary = {
        new: changes.new.length,
        updated: changes.updated.length,
        unchanged: changes.unchanged.length,
        missingFromFile: changes.missingFromFile.length,
        manualOnly: changes.manualOnly.length,
        missingCodes: changes.missingCodes.length,
        generatedMatCodes,
        generatedCategoryCodes,
        generatedSubcategoryCodes,
        emptyPriceCount,
        serviceRows: parsed.categoryRows.length + parsed.subcategoryRows.length + 1,
        trueNew: changes.trueNew.length,
        requiresReview: changes.requiresReview.length,
        unresolvedReviewConflicts: unresolvedReviewConflicts.length,
        resolvedReviewConflicts: resolvedReviewConflicts.length,
        blockingConflicts: unresolvedReviewConflicts.length,
        matChangesPlanned,
        preservedMatRows,
        matConflicts: changes.matConflicts.length,
        titleMatchMatDiffers,
        possibleMatTypo,
        multipleCandidates,
        ...matConflictDiagnostics,
        excluded: changes.excluded.length,
        deleted: changes.deleted.length,
        newCategories: changes.newCategories.length,
        newSubcategories: changes.newSubcategories.length,
        renamedCategories: changes.renamedCategories.length,
        renamedSubcategories: changes.renamedSubcategories.length,
        assignedCategoryCodes: changes.assignedCategoryCodes.length,
        assignedSubcategoryCodes: changes.assignedSubcategoryCodes.length,
        recognizedCategories: changes.assignedCategoryCodes.length,
        recognizedSubcategories: changes.assignedSubcategoryCodes.length,
        structureCodeConflicts: changes.structureCodeConflicts.length,
        existingCategoriesMatchedByName: changes.existingCategoriesMatchedByName.length,
        existingSubcategoriesMatchedByName: changes.existingSubcategoriesMatchedByName.length,
        categoryCodesPreserved: changes.categoryCodesPreserved.length,
        subcategoryCodesPreserved: changes.subcategoryCodesPreserved.length,
        categoryCodesAssigned: changes.categoryCodesAssigned.length,
        subcategoryCodesAssigned: changes.subcategoryCodesAssigned.length,
        categoryExcelCodesIgnored: changes.categoryExcelCodesIgnored.length,
        subcategoryExcelCodesIgnored: changes.subcategoryExcelCodesIgnored.length,
        realStructureConflicts: changes.realStructureConflicts.length,
        categoryChanges: changes.renamedCategories.length,
        subcategoryChanges: changes.renamedSubcategories.length,
        preservedStructureRows: changes.updated.filter(item => item.preserveCrmStructure).length
            + changes.unchanged.filter(item => item.preserveCrmStructure).length,
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
        priceWarnings: priceChanges.warningRows,
        priceWarningEvents: priceChanges.warningEvents,
        uniquePriceRiskRows: priceChanges.uniquePriceRiskRows,
        priceRiskEvents: priceChanges.priceRiskEvents,
        applicableRows,
        structureConflicts: unresolvedStructureConflicts.length,
        resolvedStructureConflicts: changes.requiresReview.filter(item => item.reviewReason === "STRUCTURE_CONFLICT" && item.resolved).length,
        criticalErrors: errors.length,
        warnings: warnings.length,
        warningRows,
        uniqueWarningRows: warningRows,
        warningEvents: warnings.length,
        ...warningBreakdown
    };

    return {
        success: true,
        previewVersion: PREVIEW_SCHEMA_VERSION,
        canImport: errors.length === 0
            && unresolvedReviewConflicts.length === 0
            && !priceChanges.hasBlockingErrors
            && applicableRows > 0,
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
        previewVersion: PREVIEW_SCHEMA_VERSION,
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
    if (!["exclude", "keep_current_structure", "create_category", "map_category", "create_subcategory", "map_subcategory", "map_existing", "accept_excel_mat", "create_new"].includes(action)) {
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

    if (["map_existing", "accept_excel_mat"].includes(action)) {
        const productId = Number(resolution.productId || 0);
        const product = await db.get(
            "SELECT id FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1",
            [productId]
        );
        if (!product) {
            throw createImportError(400, "Выбранный товар CRM недоступен для связывания.", "INVALID_IMPORT_PRODUCT");
        }
    }

    return {
        rowId: String(resolution.rowId || resolution.rowNumber || ""),
        action,
        categoryId: Number(resolution.categoryId || 0) || null,
        subcategoryId: Number(resolution.subcategoryId || 0) || null,
        productId: Number(resolution.productId || 0) || null,
        externalId: normalizeMatCode(resolution.externalId || "") || null
    };
}

async function updateCatalogImportResolutions(db, token, resolutions = [], user = {}) {
    const tokenData = await getValidPreviewToken(db, token, user);
    if (!Array.isArray(resolutions)) {
        throw createImportError(400, "Передайте список решений.", "INVALID_IMPORT_RESOLUTION");
    }

    const structureRows = await db.all("SELECT * FROM catalog_structure WHERE type IN ('category', 'subcategory') ORDER BY id ASC");
    const dbProducts = (await db.all("SELECT * FROM products ORDER BY id ASC")).map(normalizeDbProduct);
    const structureLookup = createStructureLookup(structureRows.map(normalizeStructureRow));
    const categoryActions = new Set(["exclude", "keep_current_structure", "create_category", "map_category"]);
    const subcategoryActions = new Set(["exclude", "keep_current_structure", "create_subcategory", "map_subcategory"]);
    const productReviewActions = new Set(["exclude", "map_existing", "accept_excel_mat", "create_new"]);
    const existingMappedProductIdsByRow = new Map();
    const existingAcceptedMatByRow = new Map();
    tokenData.resolutions.forEach((resolution, rowId) => {
        if (["map_existing", "accept_excel_mat"].includes(resolution?.action) && resolution.productId) {
            existingMappedProductIdsByRow.set(rowId, Number(resolution.productId));
        }
        if (resolution?.action === "accept_excel_mat" && resolution.externalId) {
            existingAcceptedMatByRow.set(rowId, normalizeMatCode(resolution.externalId));
        }
    });
    const mappedProductIds = new Set(existingMappedProductIdsByRow.values());
    const acceptedMatCodes = new Set(existingAcceptedMatByRow.values());

    for (const item of resolutions) {
        const normalized = await validateImportResolution(db, item);
        const row = tokenData.parsed.productRows.find(productRow => getResolutionKey(productRow) === normalized.rowId || String(productRow.rowNumber) === normalized.rowId);
        if (!row) {
            throw createImportError(404, "Строка Preview не найдена.", "IMPORT_ROW_NOT_FOUND");
        }
        const structureConflict = getProductStructureConflict(row, structureLookup);
        if (structureConflict) {
            if ((structureConflict.type === "missing_category" && !categoryActions.has(normalized.action))
                || (structureConflict.type === "missing_subcategory" && !subcategoryActions.has(normalized.action))) {
                throw createImportError(400, "Выбранное решение не соответствует проблеме строки.", "INVALID_IMPORT_RESOLUTION");
            }
        } else if (!productReviewActions.has(normalized.action)) {
            throw createImportError(400, "Выбранное решение не соответствует проблеме строки.", "INVALID_IMPORT_RESOLUTION");
        }
        const rowKey = getResolutionKey(row);
        const existingProductId = existingMappedProductIdsByRow.get(rowKey);
        if (existingProductId) mappedProductIds.delete(existingProductId);
        const existingAcceptedMat = existingAcceptedMatByRow.get(rowKey);
        if (existingAcceptedMat) acceptedMatCodes.delete(existingAcceptedMat);
        if (["map_existing", "accept_excel_mat"].includes(normalized.action)) {
            const classification = classifyNewProduct(row, dbProducts);
            const candidates = (classification.candidates || [classification.candidate]).filter(Boolean);
            const candidateIds = new Set(candidates.map(candidate => Number(candidate.id)));
            if (!candidateIds.has(Number(normalized.productId))) {
                throw createImportError(400, "Выбранный товар CRM не входит в подтверждённые кандидаты этой строки.", "INVALID_IMPORT_PRODUCT_CANDIDATE");
            }
            if (normalized.action === "accept_excel_mat") {
                const candidate = candidates.find(item => Number(item.id) === Number(normalized.productId)) || classification.candidate || candidates[0] || null;
                const decision = getAcceptExcelMatDecision({
                    item: {
                        ...row,
                        reviewReason: classification.reason,
                        conflictCode: classification.conflictCode || classification.reason,
                        resolved: false,
                        resolution: null
                    },
                    candidate,
                    candidates,
                    dbCandidate: dbProducts.find(product => Number(product.id) === Number(normalized.productId)),
                    productsByMatCode: buildProductsByMatCode(dbProducts).productsByMatCode,
                    productUse: new Map([[Number(normalized.productId), 1]]),
                    excelMatUse: new Map([[normalizeMatCode(row.externalId), 1]])
                });
                if (!decision.canAcceptExcelMat) {
                    throw createImportError(400, `MAT from Excel cannot be accepted automatically: ${decision.blockReasonLabels.join("; ")}`, "IMPORT_ACCEPT_EXCEL_MAT_BLOCKED");
                }
            }
            if (mappedProductIds.has(normalized.productId)) {
                throw createImportError(400, "Один товар CRM нельзя связать с несколькими строками Preview.", "IMPORT_PRODUCT_ALREADY_MAPPED");
            }
            mappedProductIds.add(normalized.productId);
        }
        if (normalized.action === "accept_excel_mat") {
            const normalizedExcelMat = normalizeMatCode(row.externalId);
            if (!validateMatCode(normalizedExcelMat)) {
                throw createImportError(400, "MAT из Excel недоступен для принятия.", "INVALID_IMPORT_MAT");
            }
            const existingProduct = dbProducts.find(product =>
                normalizeMatCode(product.externalId) === normalizedExcelMat
                && Number(product.id) !== Number(normalized.productId)
                && !product.deletedAt
            );
            if (existingProduct) {
                throw createImportError(409, "MAT из Excel уже назначен другому товару CRM.", "IMPORT_MAT_ALREADY_EXISTS");
            }
            if (acceptedMatCodes.has(normalizedExcelMat)) {
                throw createImportError(400, "Один MAT из Excel нельзя назначить нескольким товарам в Preview.", "IMPORT_MAT_ALREADY_ACCEPTED");
            }
            acceptedMatCodes.add(normalizedExcelMat);
            normalized.externalId = normalizedExcelMat;
        }
        tokenData.resolutions.set(rowKey, normalized);
    }

    const preview = await buildCatalogImportPreview(db, tokenData.parsed, tokenData.file, {
        resolutions: tokenData.resolutions
    });
    preview.token = tokenData.token;
    preview.tokenExpiresAt = new Date(tokenData.createdAtMs + PREVIEW_TOKEN_TTL_MS).toISOString();
    tokenData.preview = preview;

    const unresolved = Number(preview.summary?.unresolvedReviewConflicts || preview.summary?.structureConflicts || 0);
    return {
        success: true,
        data: {
            resolved: Number(preview.summary?.resolvedReviewConflicts || preview.summary?.resolvedStructureConflicts || 0),
            unresolved,
            canImport: preview.canImport,
            preview
        }
    };
}

async function getCatalogImportMatConflictAudit(db, token, user = {}) {
    const tokenData = await getValidPreviewToken(db, token, user);
    const dbProducts = (await db.all("SELECT * FROM products ORDER BY id ASC")).map(normalizeDbProduct);
    const preview = await buildCatalogImportPreview(db, tokenData.parsed, tokenData.file, {
        resolutions: tokenData.resolutions
    });
    preview.token = tokenData.token;
    preview.tokenExpiresAt = new Date(tokenData.createdAtMs + PREVIEW_TOKEN_TTL_MS).toISOString();
    tokenData.preview = preview;

    return {
        success: true,
        data: buildMatConflictAudit(preview, dbProducts)
    };
}

async function getCatalogImportGroupResolutionDryRun(db, token, options = {}, user = {}) {
    const strategy = String(options.strategy || "accept_excel_mat");
    if (strategy !== "accept_excel_mat") {
        throw createImportError(400, "Р”Р»СЏ dry run РґРѕСЃС‚СѓРїРЅР° С‚РѕР»СЊРєРѕ СЃС‚СЂР°С‚РµРіРёСЏ accept_excel_mat.", "INVALID_GROUP_RESOLUTION_STRATEGY");
    }

    const auditResult = await getCatalogImportMatConflictAudit(db, token, user);
    const audit = auditResult.data;
    const resolutions = audit.eligible.map(item => ({
        rowId: item.rowId,
        action: "accept_excel_mat",
        productId: item.candidateProductId,
        externalId: item.excelMat
    }));
    const blockedReasonCounts = {};
    audit.blocked.forEach(item => {
        (item.blockReasons || ["OTHER"]).forEach(reason => {
            blockedReasonCounts[reason] = (blockedReasonCounts[reason] || 0) + 1;
        });
    });
    const blockedReasonBreakdown = Object.entries(blockedReasonCounts).map(([reason, count]) => ({
        reason,
        label: getMatConflictBlockReasonLabel(reason),
        count
    }));

    return {
        success: true,
        data: {
            strategy,
            totalConflicts: audit.totalConflicts,
            eligibleRows: audit.eligibleRows,
            blockedRows: audit.blockedRows,
            uniqueProducts: audit.uniqueProducts,
            matChangesPlanned: audit.matChangesPlanned,
            duplicateProductConflicts: audit.duplicateProductConflicts,
            duplicateMatConflicts: audit.duplicateMatConflicts,
            invalidMatRows: audit.invalidMatRows,
            multipleCandidateRows: audit.multipleCandidateRows,
            groups: audit.groups,
            blockedReasonCounts,
            blockedReasonBreakdown,
            eligiblePreview: audit.eligible.slice(0, 20),
            blocked: audit.blocked,
            resolutions
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
    if (stored.previewVersion !== PREVIEW_SCHEMA_VERSION) {
        previewTokens.delete(stored.token);
        throw createImportError(409, "Предварительная проверка устарела. Проверьте файл заново.", "PREVIEW_TOKEN_EXPIRED");
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
        sortOrder: row.sortOrder === null || row.sortOrder === undefined ? null : (Number(row.sortOrder) || 0)
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
            product.sortOrder ?? 0,
            "excel",
            now,
            now,
            now
        ]
    );
}

async function updateImportedProduct(db, row, now, productId = null, options = {}) {
    const product = normalizeIncomingProduct(row);
    const normalizedExternalId = normalizeMatCode(options.externalId || product.externalId);
    if (!productId && !validateMatCode(normalizedExternalId)) {
        throw createImportError(409, "Не удалось определить существующий товар для обновления.", "IMPORT_PRODUCT_MATCH_FAILED");
    }
    if (options.externalId) {
        if (!validateMatCode(normalizedExternalId)) {
            throw createImportError(409, "MAT из Excel недоступен для обновления товара.", "INVALID_IMPORT_MAT");
        }
        const duplicate = await db.get(
            "SELECT id FROM products WHERE external_id = ? AND id != ? AND deleted_at IS NULL LIMIT 1",
            [normalizedExternalId, Number(productId || 0)]
        );
        if (duplicate) {
            throw createImportError(409, "MAT из Excel уже назначен другому товару CRM.", "IMPORT_MAT_ALREADY_EXISTS");
        }
    }
    await db.run(
        `UPDATE products
         SET title = ?,
             ${options.externalId ? "external_id = ?," : ""}
             category = ?,
             subcategory = ?,
             product_group = ?,
             price = ?,
             weight = ?,
             unit = ?,
             sort_order = COALESCE(?, sort_order),
             source = ?,
             last_imported_at = ?,
             updated_at = ?
         WHERE ${productId ? "id = ?" : "external_id = ?"}
           AND deleted_at IS NULL`,
        [
            product.title,
            ...(options.externalId ? [normalizedExternalId] : []),
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
    const normalizedName = normalizeCatalogStructureName(row.name);
    const byNameRows = await db.all(
        "SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0",
        [normalizedName]
    );

    if (byNameRows.length > 1) {
        throw createImportError(409, `Найдено несколько категорий CRM с названием "${row.name}".`, "CAT_NAME_BINDING_CONFLICT");
    }
    return byNameRows[0] || null;
}

async function findStructureSubcategory(db, row, parentId) {
    const normalizedName = normalizeCatalogStructureName(row.name);
    const byNameRows = await db.all(
        "SELECT * FROM catalog_structure WHERE type = 'subcategory' AND parent_id = ? AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0",
        [parentId, normalizedName]
    );

    if (byNameRows.length > 1) {
        throw createImportError(409, `Найдено несколько подкатегорий CRM "${row.name}" внутри выбранной категории.`, "SUB_NAME_BINDING_CONFLICT");
    }
    return byNameRows[0] || null;
}

async function upsertCatalogStructureFromParsed(db, parsed, now) {
    const assignedRows = [];
    const categoryByFileCodeOrName = new Map();
    const structureRows = await db.all("SELECT * FROM catalog_structure WHERE type IN ('category', 'subcategory')");
    const usedCategoryCodes = collectUsedStructureCodes(
        structureRows.filter(row => row.type === "category"),
        normalizeCategoryCode
    );
    const usedSubcategoryCodes = collectUsedStructureCodes(
        structureRows.filter(row => row.type === "subcategory"),
        normalizeSubcategoryCode
    );

    for (const row of parsed.categoryRows || []) {
        const existing = await findStructureCategory(db, row);
        let externalCode = normalizeCategoryCode(existing?.external_code || existing?.externalCode || "");
        let assignedNewCode = false;
        if (!externalCode) {
            const codeChoice = chooseStructureCode({
                requestedCode: row.externalCode,
                usedCodes: usedCategoryCodes,
                normalizer: normalizeCategoryCode,
                validator: validateCategoryCode,
                allocator: allocateNextCategoryCode
            });
            externalCode = codeChoice.code;
            assignedNewCode = true;
        }

        if (existing) {
            await db.run(
                `UPDATE catalog_structure
                 SET external_code = COALESCE(NULLIF(external_code, ''), ?),
                     sort_order = ?,
                     updated_at = ?
                 WHERE id = ?`,
                [externalCode, Number(row.sortOrder) || 0, now, existing.id]
            );
            categoryByFileCodeOrName.set(normalizeCatalogStructureName(row.name), { ...existing, id: existing.id, external_code: externalCode });
            if (row.externalCode) categoryByFileCodeOrName.set(normalizeCategoryCode(row.externalCode), { ...existing, id: existing.id, external_code: externalCode });
        } else {
            const result = await db.run(
                `INSERT INTO catalog_structure (
                    type, name, normalized_name, external_code, parent_id, sort_order, is_active, is_system, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ["category", row.name, normalizeCatalogStructureName(row.name), externalCode, null, Number(row.sortOrder) || 0, 1, 0, now, now]
            );
            categoryByFileCodeOrName.set(normalizeCatalogStructureName(row.name), { id: result.id, external_code: externalCode });
            if (row.externalCode) categoryByFileCodeOrName.set(normalizeCategoryCode(row.externalCode), { id: result.id, external_code: externalCode });
            assignedNewCode = true;
        }
        if (assignedNewCode) assignedRows.push({ rowNumber: row.rowNumber, externalId: externalCode, entityType: "category", name: row.name });
    }

    for (const row of parsed.subcategoryRows || []) {
        const categoryKey = normalizeCatalogStructureName(row.category);
        let parent = categoryByFileCodeOrName.get(categoryKey);
        if (!parent && row.categoryExternalCode) {
            parent = categoryByFileCodeOrName.get(normalizeCategoryCode(row.categoryExternalCode));
        }
        if (!parent) {
            parent = await db.get("SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1", [normalizeCatalogStructureName(row.category)]);
        }
        if (!parent) continue;

        const existing = await findStructureSubcategory(db, row, parent.id);
        let externalCode = normalizeSubcategoryCode(existing?.external_code || existing?.externalCode || "");
        let assignedNewCode = false;
        if (!externalCode) {
            const codeChoice = chooseStructureCode({
                requestedCode: row.externalCode,
                usedCodes: usedSubcategoryCodes,
                normalizer: normalizeSubcategoryCode,
                validator: validateSubcategoryCode,
                allocator: allocateNextSubcategoryCode
            });
            externalCode = codeChoice.code;
            assignedNewCode = true;
        }

        if (existing) {
            await db.run(
                `UPDATE catalog_structure
                 SET external_code = COALESCE(NULLIF(external_code, ''), ?),
                     sort_order = ?,
                     updated_at = ?
                 WHERE id = ?`,
                [externalCode, Number(row.sortOrder) || 0, now, existing.id]
            );
        } else {
            await db.run(
                `INSERT INTO catalog_structure (
                    type, name, normalized_name, external_code, parent_id, sort_order, is_active, is_system, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ["subcategory", row.name, normalizeCatalogStructureName(row.name), externalCode, parent.id, Number(row.sortOrder) || 0, 1, 0, now, now]
            );
            assignedNewCode = true;
        }
        if (assignedNewCode) assignedRows.push({ rowNumber: row.rowNumber, externalId: externalCode, entityType: "subcategory", name: row.name });
    }

    return assignedRows;
}

async function applyCatalogOrderFromParsed(db, parsed, assignedRows, now) {
    const structureRows = await db.all(`
        SELECT id, type, name, normalized_name, parent_id, sort_order, is_system
        FROM catalog_structure
        WHERE type IN ('category', 'subcategory')
        ORDER BY sort_order ASC, id ASC
    `);
    const categories = structureRows.filter(row => row.type === "category" && !Number(row.is_system));
    const categoryByName = new Map(categories.map(row => [normalizeCatalogStructureName(row.normalized_name || row.name), row]));
    const importedCategoryIds = new Set();
    let categoryOrder = 0;

    for (const parsedCategory of parsed.categoryRows || []) {
        const category = categoryByName.get(normalizeCatalogStructureName(parsedCategory.name));
        if (!category || importedCategoryIds.has(Number(category.id))) continue;
        categoryOrder += 1;
        importedCategoryIds.add(Number(category.id));
        if (Number(category.sort_order) !== categoryOrder) {
            await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [categoryOrder, now, category.id]);
        }
    }
    for (const category of categories) {
        if (importedCategoryIds.has(Number(category.id))) continue;
        categoryOrder += 1;
        if (Number(category.sort_order) !== categoryOrder) {
            await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [categoryOrder, now, category.id]);
        }
    }

    const subcategories = structureRows.filter(row => row.type === "subcategory" && !Number(row.is_system));
    const subcategoryByKey = new Map(subcategories.map(row => [
        `${Number(row.parent_id) || 0}:${normalizeCatalogStructureName(row.normalized_name || row.name)}`,
        row
    ]));
    const importedSubcategoryIds = new Set();
    const nextSubcategoryOrderByParent = new Map();
    for (const parsedSubcategory of parsed.subcategoryRows || []) {
        const parent = categoryByName.get(normalizeCatalogStructureName(parsedSubcategory.category));
        if (!parent) continue;
        const key = `${Number(parent.id)}:${normalizeCatalogStructureName(parsedSubcategory.name)}`;
        const subcategory = subcategoryByKey.get(key);
        if (!subcategory || importedSubcategoryIds.has(Number(subcategory.id))) continue;
        const nextOrder = (nextSubcategoryOrderByParent.get(Number(parent.id)) || 0) + 1;
        nextSubcategoryOrderByParent.set(Number(parent.id), nextOrder);
        importedSubcategoryIds.add(Number(subcategory.id));
        if (Number(subcategory.sort_order) !== nextOrder) {
            await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [nextOrder, now, subcategory.id]);
        }
    }
    for (const subcategory of subcategories) {
        if (importedSubcategoryIds.has(Number(subcategory.id))) continue;
        const parentId = Number(subcategory.parent_id) || 0;
        const nextOrder = (nextSubcategoryOrderByParent.get(parentId) || 0) + 1;
        nextSubcategoryOrderByParent.set(parentId, nextOrder);
        if (Number(subcategory.sort_order) !== nextOrder) {
            await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [nextOrder, now, subcategory.id]);
        }
    }

    const products = await db.all(`
        SELECT id, external_id, category, subcategory, sort_order
        FROM products
        WHERE deleted_at IS NULL
        ORDER BY sort_order ASC, id ASC
    `);
    const productById = new Map(products.map(product => [Number(product.id), product]));
    const productByExternalId = new Map(products.map(product => [normalizeMatCode(product.external_id), product]));
    const assignedProductCodeByRow = new Map((assignedRows || [])
        .filter(row => row.entityType === "product")
        .map(row => [Number(row.rowNumber), normalizeMatCode(row.externalId)]));
    const importedProductIds = new Set();
    const nextProductOrderBySection = new Map();

    for (const parsedProduct of parsed.productRows || []) {
        const assignedCode = assignedProductCodeByRow.get(Number(parsedProduct.rowNumber));
        const product = productById.get(Number(parsedProduct.productId))
            || productByExternalId.get(assignedCode || normalizeMatCode(parsedProduct.externalId));
        if (!product || importedProductIds.has(Number(product.id))) continue;
        const sectionKey = `${normalizeCatalogStructureName(product.category)}\u0000${normalizeCatalogStructureName(product.subcategory)}`;
        const nextOrder = (nextProductOrderBySection.get(sectionKey) || 0) + 1;
        nextProductOrderBySection.set(sectionKey, nextOrder);
        importedProductIds.add(Number(product.id));
        if (Number(product.sort_order) !== nextOrder) {
            await db.run("UPDATE products SET sort_order = ?, updated_at = ? WHERE id = ?", [nextOrder, now, product.id]);
        }
    }
    for (const product of products) {
        if (importedProductIds.has(Number(product.id))) continue;
        const sectionKey = `${normalizeCatalogStructureName(product.category)}\u0000${normalizeCatalogStructureName(product.subcategory)}`;
        const nextOrder = (nextProductOrderBySection.get(sectionKey) || 0) + 1;
        nextProductOrderBySection.set(sectionKey, nextOrder);
        if (Number(product.sort_order) !== nextOrder) {
            await db.run("UPDATE products SET sort_order = ?, updated_at = ? WHERE id = ?", [nextOrder, now, product.id]);
        }
    }
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
    const hideMissingFromFile = options.missingFromFileAction === "hide";
    const assignedRows = [];
    const effectiveParsed = applyImportResolutionsToParsed(
        tokenData.parsed,
        tokenData.resolutions,
        latestPreview.structureOptions || { categories: [], subcategories: [] }
    );
    const structureParsed = effectiveParsed;

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
            await updateImportedProduct(db, row, now, item.productId, {
                externalId: item.acceptExcelMat ? (item.incomingExternalId || item.externalId) : null
            });
            result.updated += 1;
        }

        for (const row of latestPreview.changes.new || []) {
            if (row.classification !== "TRUE_NEW") continue;
            const incomingRow = row.autoGeneratedMat
                ? { ...row, externalId: formatMatCode(nextMatNumber) }
                : row;
            if (row.autoGeneratedMat) {
                nextMatNumber += 1;
                assignedRows.push({
                    rowNumber: row.rowNumber,
                    externalId: incomingRow.externalId,
                    entityType: "product",
                    name: row.title
                });
                result.assignedMat += 1;
            }
            await insertImportedProduct(db, incomingRow, now);
            result.created += 1;
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
        await applyCatalogOrderFromParsed(db, effectiveParsed, assignedRows, now);
        await db.run("COMMIT");
    } catch (error) {
        await db.run("ROLLBACK").catch(() => {});
        throw error;
    }

    result.assignedCodes = assignedRows.map(item => ({
        entityType: item.entityType || "structure",
        name: item.name || "",
        externalId: item.externalId
    }));
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
    normalizeProductTitle,
    validateMatCode,
    parseCatalogExcel: parseCatalogExcelV2,
    parseCatalogRow,
    validateCatalogRows: parseCatalogExcelV2,
    buildCatalogImportPreview,
    createCatalogImportPreviewToken,
    updateCatalogImportResolutions,
    getCatalogImportMatConflictAudit,
    getCatalogImportGroupResolutionDryRun,
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
    classifyCatalogStructureRecord,
    classifyCatalogRecord,
    sanitizeUploadFileName,
    buildCatalogExportWorkbook: buildReferenceCatalogExportWorkbook
};
