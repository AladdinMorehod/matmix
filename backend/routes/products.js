const express = require("express");
const ExcelJS = require("exceljs");
const { all, get, run } = require("../database");
const { requireRole } = require("../middleware/auth");
const {
    normalizeCatalogStructureName,
    getCatalogStructureTree,
    getPublicCatalogStructureTree,
    getCatalogStructureAudit,
    createCategory,
    createSubcategory,
    moveRootCategoryToIndex,
    getMoveSubcategoriesPreview,
    moveSubcategories,
    validateProductStructureSelection
} = require("../services/catalogStructure");
const {
    parseCatalogExcel,
    createCatalogImportPreviewToken,
    updateCatalogImportResolutions,
    getCatalogImportMatConflictAudit,
    getCatalogImportGroupResolutionDryRun,
    applyCatalogImport,
    getCatalogImportExcelCopy,
    getNextMatExternalId,
    sanitizeUploadFileName
} = require("../services/catalogImport");

const router = express.Router();
const publicRouter = express.Router();
const allowedCrmUnits = new Set(["шт", "кг", "м", "м2"]);
let productCreateQueue = Promise.resolve();

const safeErrorMessages = {
    400: "Проверьте данные запроса.",
    401: "Сессия истекла. Войдите снова.",
    403: "У вас недостаточно прав для выполнения операции.",
    404: "Запрошенные данные не найдены.",
    409: "Операцию нельзя выполнить из-за конфликта данных.",
    413: "Файл слишком большой.",
    422: "В файле обнаружены критические ошибки.",
    500: "Произошла внутренняя ошибка сервера."
};

function sendApiError(res, error, fallbackMessage, fallbackCode = "REQUEST_FAILED") {
    const status = Number(error?.status) || 500;
    const message = error?.status && error?.message
        ? error.message
        : (fallbackMessage || safeErrorMessages[status] || safeErrorMessages[500]);
    res.status(status).json({
        success: false,
        code: error?.code || fallbackCode,
        message
    });
}

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeNumber(value, fallback = 0) {
    if (value === "" || value === null || value === undefined) return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function normalizeSearchText(value) {
    return normalizeText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[-.,;:()[\]{}_/\\]+/g, " ")
        .replace(/[^a-zа-я0-9\s]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSearchWords(value) {
    const normalized = normalizeSearchText(value);
    return normalized ? normalized.split(" ").filter(Boolean) : [];
}

function getProductSearchText(row) {
    return normalizeSearchText([
        row.title,
        row.external_id,
        row.slug,
        row.category,
        row.subcategory,
        row.product_group,
        row.description,
        row.source,
        row.price,
        row.weight,
        row.unit
    ].filter(value => value !== null && value !== undefined).join(" "));
}

function makeSlug(value, fallback = "") {
    const slug = transliterate(normalizeText(value))
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120)
        .replace(/-+$/g, "");

    return slug || fallback;
}

const translitMap = {
    "\u0430": "a", "\u0431": "b", "\u0432": "v", "\u0433": "g", "\u0434": "d",
    "\u0435": "e", "\u0451": "e", "\u0436": "zh", "\u0437": "z", "\u0438": "i",
    "\u0439": "y", "\u043a": "k", "\u043b": "l", "\u043c": "m", "\u043d": "n",
    "\u043e": "o", "\u043f": "p", "\u0440": "r", "\u0441": "s", "\u0442": "t",
    "\u0443": "u", "\u0444": "f", "\u0445": "h", "\u0446": "ts", "\u0447": "ch",
    "\u0448": "sh", "\u0449": "sch", "\u044a": "", "\u044b": "y", "\u044c": "",
    "\u044d": "e", "\u044e": "yu", "\u044f": "ya"
};

function transliterate(value) {
    return Array.from(String(value || "").toLowerCase())
        .map(char => translitMap[char] ?? char)
        .join("");
}

async function generateUniqueSlug(title, fallback, exceptId = null) {
    const baseSlug = makeSlug(title, fallback || "product").slice(0, 120) || fallback || "product";
    let slug = baseSlug;
    let suffix = 2;

    while (true) {
        const existing = exceptId
            ? await get("SELECT id FROM products WHERE slug = ? AND id != ?", [slug, exceptId])
            : await get("SELECT id FROM products WHERE slug = ?", [slug]);
        if (!existing) return slug;

        const suffixText = `-${suffix}`;
        slug = `${baseSlug.slice(0, 120 - suffixText.length)}${suffixText}`;
        suffix += 1;
    }
}

function normalizeProduct(row) {
    return {
        id: row.id,
        title: row.title,
        category: row.category || "",
        subcategory: row.subcategory || "",
        productGroup: row.product_group || "",
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        unit: row.unit || "шт",
        image: row.image || "",
        description: row.description || "",
        isActive: Boolean(row.is_active),
        sortOrder: Number(row.sort_order) || 0,
        source: row.source || "",
        lastImportedAt: row.last_imported_at || "",
        createdAt: row.created_at || "",
        updatedAt: row.updated_at || "",
        deletedAt: row.deleted_at || "",
        deletedById: row.deleted_by_id || null,
        deletedByName: row.deleted_by_name || ""
    };
}

function normalizePublicProduct(row) {
    return {
        id: row.id,
        externalId: row.external_id,
        title: row.title,
        slug: row.slug || "",
        category: row.category || "",
        subcategory: row.subcategory || "",
        productGroup: row.product_group || "",
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        unit: row.unit || "шт",
        image: row.image || "",
        description: row.description || ""
    };
}

function getProductPayload(body, existing = {}) {
    const title = normalizeText(body.title);

    return {
        title,
        category: normalizeText(body.category),
        subcategory: normalizeText(body.subcategory),
        productGroup: body.productGroup === undefined && body.product_group === undefined
            ? (existing.product_group || "")
            : normalizeText(body.productGroup || body.product_group),
        price: body.price === "" || body.price === null || body.price === undefined ? null : normalizeNumber(body.price, null),
        weight: normalizeNumber(body.weight, 0),
        unit: normalizeText(body.unit) || "шт",
        image: normalizeText(body.image),
        description: normalizeText(body.description),
        isActive: body.isActive === undefined ? (existing.is_active ?? 1) : (body.isActive ? 1 : 0),
        sortOrder: normalizeNumber(body.sortOrder ?? body.sort_order, existing.sort_order || 0)
    };
}

function validateProductPayload(payload, existing = null) {
    if (!payload.title) return "Укажите название товара.";
    if (payload.price !== null && payload.price < 0) return "Цена не может быть отрицательной.";
    if (payload.weight < 0) return "Вес не может быть отрицательным.";
    if (!existing || normalizeText(payload.unit) !== normalizeText(existing.unit)) {
        if (!allowedCrmUnits.has(payload.unit)) {
            return "Выберите корректную единицу измерения.";
        }
    }
    return "";
}

function getWorkbookFileName(prefix) {
    const today = new Date().toISOString().slice(0, 10);
    return `${prefix}-${today}.xlsx`;
}

function setExcelHeaders(res, filename) {
    const encoded = encodeURIComponent(filename);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encoded}`);
}

function isAllowedXlsxMime(mimeType) {
    return [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream",
        "application/zip"
    ].includes(String(mimeType || "").toLowerCase());
}

function collectRequestBuffer(req, maxBytes) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let total = 0;

        req.on("data", chunk => {
            total += chunk.length;
            if (total > maxBytes) {
                const error = new Error("Файл слишком большой.");
                error.status = 413;
                reject(error);
                req.destroy();
                return;
            }

            chunks.push(chunk);
        });
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
    });
}

async function readMultipartXlsxUpload(req, { maxBytes = 30 * 1024 * 1024 } = {}) {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!contentType.toLowerCase().includes("multipart/form-data") || !boundaryMatch) {
        const error = new Error("Ожидается multipart/form-data с Excel-файлом.");
        error.status = 400;
        throw error;
    }

    const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
    const body = await collectRequestBuffer(req, maxBytes);
    const bodyText = body.toString("latin1");
    const parts = bodyText.split(boundary);

    for (const partText of parts) {
        if (!partText.includes('name="file"')) continue;

        const headerEnd = partText.indexOf("\r\n\r\n");
        if (headerEnd === -1) break;

        const rawHeaders = partText.slice(0, headerEnd);
        const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);
        const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
        const originalName = sanitizeUploadFileName(filenameMatch?.[1] || "");
        const mimeType = contentTypeMatch?.[1]?.trim() || "";
        let fileText = partText.slice(headerEnd + 4);
        fileText = fileText.replace(/\r\n--$/, "").replace(/\r\n$/, "");

        if (!originalName || !originalName.toLowerCase().endsWith(".xlsx")) {
            const error = new Error("Загрузите файл формата .xlsx.");
            error.status = 400;
            throw error;
        }
        if (!isAllowedXlsxMime(mimeType)) {
            const error = new Error("Некорректный MIME-тип Excel-файла.");
            error.status = 400;
            throw error;
        }

        return {
            name: originalName,
            mimeType,
            buffer: Buffer.from(fileText, "latin1")
        };
    }

    const error = new Error("Файл не найден в поле file.");
    error.status = 400;
    throw error;
}

async function getFilteredProducts(query = {}) {
    const params = [];
    const where = [];
    const searchWords = getSearchWords(query.search);
    const category = normalizeText(query.category);
    const status = normalizeText(query.status);

    if (category) {
        where.push("category = ?");
        params.push(category);
    }

    if (status === "active") {
        where.push("is_active = 1");
    } else if (status === "hidden") {
        where.push("is_active = 0");
    }

    if (query.deleted === "true") {
        where.push("deleted_at IS NOT NULL");
    } else {
        where.push("deleted_at IS NULL");
    }

    const sql = `
        SELECT *
        FROM products
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY category COLLATE NOCASE ASC,
                 subcategory COLLATE NOCASE ASC,
                 product_group COLLATE NOCASE ASC,
                 sort_order ASC,
                 title COLLATE NOCASE ASC
    `;

    const rows = await all(sql, params);
    if (!searchWords.length) return rows;

    return rows.filter(row => {
        const searchableText = getProductSearchText(row);
        return searchWords.every(word => searchableText.includes(word));
    });
}

async function getProductsWithCatalogOrder(query = {}) {
    const params = [];
    const where = [];
    const searchWords = getSearchWords(query.search);
    const category = normalizeText(query.category);
    const status = normalizeText(query.status);

    if (category) {
        where.push("category = ?");
        params.push(category);
    }

    if (status === "active") {
        where.push("is_active = 1");
    } else if (status === "hidden") {
        where.push("is_active = 0");
    }

    if (query.deleted === "true") {
        where.push("deleted_at IS NOT NULL");
    } else {
        where.push("deleted_at IS NULL");
    }

    const [rows, structureRows] = await Promise.all([
        all(`
            SELECT *
            FROM products
            ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
            ORDER BY sort_order ASC, id ASC
        `, params),
        all(`
            SELECT id, type, normalized_name, parent_id, sort_order
            FROM catalog_structure
            WHERE is_active = 1
              AND COALESCE(is_system, 0) = 0
              AND type IN ('category', 'subcategory')
            ORDER BY sort_order ASC, id ASC
        `)
    ]);
    const filteredRows = searchWords.length
        ? rows.filter(row => {
            const searchableText = getProductSearchText(row);
            return searchWords.every(word => searchableText.includes(word));
        })
        : rows;
    const categoryOrder = new Map();
    const categoryIds = new Map();
    const subcategoryOrder = new Map();
    const categoryFallbackOrder = new Map();
    const subcategoryFallbackOrder = new Map();
    const groupOrder = new Map();
    const unknownStructureOffset = 1000000000;

    structureRows.filter(row => row.type === "category").forEach((row, index) => {
        const normalizedName = normalizeCatalogStructureName(row.normalized_name);
        categoryOrder.set(normalizedName, (Number(row.sort_order) || 0) * 1000 + index);
        categoryIds.set(normalizedName, row.id);
    });

    structureRows.filter(row => row.type === "subcategory").forEach((row, index) => {
        subcategoryOrder.set(`${row.parent_id}:${normalizeCatalogStructureName(row.normalized_name)}`, (Number(row.sort_order) || 0) * 1000 + index);
    });

    filteredRows.forEach((row, index) => {
        const categoryName = normalizeCatalogStructureName(row.category);
        const subcategoryName = normalizeCatalogStructureName(row.subcategory);
        const productGroupName = normalizeCatalogStructureName(row.product_group);
        const categoryId = categoryIds.get(categoryName) || 0;

        if (!categoryFallbackOrder.has(categoryName)) {
            categoryFallbackOrder.set(categoryName, index);
        }

        const subcategoryFallbackKey = `${categoryName}:${subcategoryName}`;
        if (!subcategoryFallbackOrder.has(subcategoryFallbackKey)) {
            subcategoryFallbackOrder.set(subcategoryFallbackKey, index);
        }

        const groupKey = `${categoryName}:${subcategoryName}:${productGroupName}`;
        if (!groupOrder.has(groupKey)) {
            groupOrder.set(groupKey, index);
        }

        row.__catalogOrder = {
            category: categoryOrder.has(categoryName)
                ? categoryOrder.get(categoryName)
                : unknownStructureOffset + (categoryFallbackOrder.get(categoryName) || 0),
            subcategory: categoryId && subcategoryOrder.has(`${categoryId}:${subcategoryName}`)
                ? subcategoryOrder.get(`${categoryId}:${subcategoryName}`)
                : unknownStructureOffset + (subcategoryFallbackOrder.get(subcategoryFallbackKey) || 0),
            group: groupOrder.get(groupKey) || 0
        };
    });

    return filteredRows
        .slice()
        .sort((first, second) => {
            const firstOrder = first.__catalogOrder;
            const secondOrder = second.__catalogOrder;

            return firstOrder.category - secondOrder.category
                || firstOrder.subcategory - secondOrder.subcategory
                || firstOrder.group - secondOrder.group
                || (Number(first.sort_order) || 0) - (Number(second.sort_order) || 0)
                || (Number(first.id) || 0) - (Number(second.id) || 0);
        })
        .map(row => {
            delete row.__catalogOrder;
            return row;
        });
}

async function getPublicProducts() {
    return getProductsWithCatalogOrder({ status: "active", deleted: "false" });
}

function enqueueProductCreate(callback) {
    const next = productCreateQueue.then(callback, callback);
    productCreateQueue = next.catch(() => {});
    return next;
}

async function createManualProductWithMatCodeLocked(payload) {
    let lastError = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
        await run("BEGIN IMMEDIATE TRANSACTION");
        try {
            const now = new Date().toISOString();
            const externalId = await getNextMatExternalId({ all });
            const slug = await generateUniqueSlug(payload.title, externalId);
            const result = await run(
                `INSERT INTO products (
                    external_id, title, slug, category, subcategory, product_group, price, weight, unit,
                    image, description, is_active, sort_order, source, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    externalId,
                    payload.title,
                    slug,
                    payload.category,
                    payload.subcategory,
                    payload.productGroup,
                    payload.price,
                    payload.weight,
                    payload.unit,
                    payload.image,
                    payload.description,
                    payload.isActive,
                    payload.sortOrder,
                    "manual",
                    now,
                    now
                ]
            );
            await run("COMMIT");
            return result;
        } catch (error) {
            lastError = error;
            await run("ROLLBACK").catch(() => {});

            if (!String(error.message || "").includes("UNIQUE constraint failed: products.external_id")) {
                throw error;
            }
        }
    }

    throw lastError;
}

function applyBaseCellStyle(cell) {
    cell.border = {
        top: { style: "thin", color: { argb: "FFE2E7DF" } },
        left: { style: "thin", color: { argb: "FFE2E7DF" } },
        bottom: { style: "thin", color: { argb: "FFE2E7DF" } },
        right: { style: "thin", color: { argb: "FFE2E7DF" } }
    };
    cell.alignment = { vertical: "middle", wrapText: true };
}

function addMergedRow(sheet, rowNumber, value, style = {}) {
    sheet.mergeCells(`A${rowNumber}:E${rowNumber}`);
    const cell = sheet.getCell(`A${rowNumber}`);
    cell.value = value;
    cell.font = style.font || { bold: true };
    cell.fill = style.fill;
    cell.alignment = style.alignment || { vertical: "middle" };
    cell.border = style.border;
}

function buildPriceWorkbook(rows) {
    const workbook = new ExcelJS.Workbook();
    const exportedAt = new Date();
    workbook.creator = "MatMix";
    workbook.created = exportedAt;
    workbook.modified = exportedAt;

    const sheet = workbook.addWorksheet("Прайс-лист", {
        views: [{ state: "frozen", ySplit: 4 }]
    });

    sheet.columns = [
        { key: "number", width: 8 },
        { key: "title", width: 62 },
        { key: "unit", width: 12 },
        { key: "price", width: 16 },
        { key: "weight", width: 14 }
    ];

    addMergedRow(sheet, 1, "MatMix", {
        font: { bold: true, size: 22, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5A1F28" } },
        alignment: { vertical: "middle", horizontal: "center" }
    });
    sheet.getRow(1).height = 30;

    addMergedRow(sheet, 2, "Прайс-лист", {
        font: { bold: true, size: 16, color: { argb: "FF1A4F3A" } },
        alignment: { vertical: "middle", horizontal: "center" }
    });
    addMergedRow(sheet, 3, `Дата выгрузки: ${new Intl.DateTimeFormat("ru-RU").format(exportedAt)}`, {
        font: { bold: true, size: 11, color: { argb: "FF4A5348" } },
        alignment: { vertical: "middle", horizontal: "center" }
    });

    const headerRow = sheet.getRow(4);
    headerRow.values = ["№", "Наименование", "Ед. изм.", "Цена", "Вес"];
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headerRow.height = 24;
    headerRow.eachCell(applyBaseCellStyle);

    let currentCategory = "";
    let currentSubcategory = "";
    let currentGroup = "";
    let rowNumber = 5;
    let itemNumber = 0;

    rows.forEach(row => {
        const category = row.category || "Без категории";
        const subcategory = row.subcategory || "Без подкатегории";
        const productGroup = row.product_group || "";

        if (category !== currentCategory) {
            currentCategory = category;
            currentSubcategory = "";
            currentGroup = "";
            addMergedRow(sheet, rowNumber, category, {
                font: { bold: true, size: 13, color: { argb: "FFFFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF5A1F28" } }
            });
            sheet.getRow(rowNumber).height = 22;
            rowNumber += 1;
        }

        if (subcategory !== currentSubcategory) {
            currentSubcategory = subcategory;
            currentGroup = "";
            addMergedRow(sheet, rowNumber, subcategory, {
                font: { bold: true, size: 11, color: { argb: "FF205742" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F6F1" } }
            });
            rowNumber += 1;
        }

        if (productGroup && productGroup !== currentGroup) {
            currentGroup = productGroup;
            addMergedRow(sheet, rowNumber, productGroup, {
                font: { bold: true, size: 10, color: { argb: "FF2F7A5D" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF1EA" } }
            });
            rowNumber += 1;
        }

        itemNumber += 1;
        const productRow = sheet.getRow(rowNumber);
        productRow.values = [
            itemNumber,
            row.title,
            row.unit || "шт",
            row.price === null || row.price === undefined ? "" : Number(row.price) || 0,
            Number(row.weight) || 0
        ];
        productRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        productRow.getCell(4).numFmt = '#,##0.00 "₽"';
        productRow.getCell(5).numFmt = "#,##0.###";
        productRow.eachCell(applyBaseCellStyle);
        rowNumber += 1;
    });

    sheet.pageSetup = {
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
            left: 0.35,
            right: 0.35,
            top: 0.45,
            bottom: 0.45,
            header: 0.2,
            footer: 0.2
        }
    };

    return workbook;
}

async function sendPriceWorkbook(res, rows) {
    const workbook = buildPriceWorkbook(rows);
    setExcelHeaders(res, getWorkbookFileName("MatMix-прайс"));
    await workbook.xlsx.write(res);
    res.end();
}

publicRouter.get("/", async (req, res) => {
    try {
        const rows = await getPublicProducts();
        res.json({ success: true, products: rows.map(normalizePublicProduct) });
    } catch (error) {
        console.error("Public products load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить каталог." });
    }
});

publicRouter.get("/export/excel", async (req, res) => {
    try {
        const rows = await getPublicProducts();
        await sendPriceWorkbook(res, rows);
    } catch (error) {
        console.error("Public products export error:", error);
        res.status(500).json({ success: false, message: "Не удалось сформировать прайс." });
    }
});

publicRouter.get("/structure", async (req, res) => {
    try {
        const categories = await getPublicCatalogStructureTree({ all });
        res.json({ success: true, categories });
    } catch (error) {
        console.error("Public catalog structure load error:", error);
        res.status(500).json({ success: false, message: "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ СЃС‚СЂСѓРєС‚СѓСЂСѓ РєР°С‚Р°Р»РѕРіР°." });
    }
});

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const rows = await getFilteredProducts(req.query);
        const products = rows.map(normalizeProduct);
        const categoryRows = await all("SELECT DISTINCT category FROM products WHERE deleted_at IS NULL AND category IS NOT NULL AND category != '' ORDER BY category COLLATE NOCASE ASC");
        const subcategoryRows = await all("SELECT DISTINCT subcategory FROM products WHERE deleted_at IS NULL AND subcategory IS NOT NULL AND subcategory != '' ORDER BY subcategory COLLATE NOCASE ASC");
        const productGroupRows = await all("SELECT DISTINCT product_group FROM products WHERE deleted_at IS NULL AND product_group IS NOT NULL AND product_group != '' ORDER BY product_group COLLATE NOCASE ASC");
        const categories = categoryRows.map(row => row.category);
        const subcategories = subcategoryRows.map(row => row.subcategory);
        const productGroups = productGroupRows.map(row => row.product_group);

        res.json({ success: true, products, categories, subcategories, productGroups });
    } catch (error) {
        console.error("Products load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить каталог." });
    }
});

router.get("/export/excel", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const status = req.query.all === "true" ? "" : (req.query.status || "active");
        const rows = await getProductsWithCatalogOrder({ ...req.query, status, deleted: "false" });
        await sendPriceWorkbook(res, rows);
    } catch (error) {
        console.error("Products export error:", error);
        res.status(500).json({ success: false, message: "Не удалось сформировать прайс." });
    }
});

router.get("/structure", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const categories = await getCatalogStructureTree({ all });
        res.json({ success: true, categories, data: { categories } });
    } catch (error) {
        console.error("Catalog structure load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить структуру каталога." });
    }
});

router.get("/structure/audit", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const audit = await getCatalogStructureAudit({ all });
        res.json({ success: true, data: audit });
    } catch (error) {
        console.error("Catalog structure audit error:", error);
        sendApiError(res, error, "Не удалось выполнить аудит структуры каталога.", "CATALOG_STRUCTURE_AUDIT_FAILED");
    }
});

router.post("/structure/subcategories/move-preview", requireRole(["admin"]), async (req, res) => {
    try {
        const preview = await getMoveSubcategoriesPreview({ all, get }, req.body || {});
        res.json({ success: true, data: preview });
    } catch (error) {
        console.error("Catalog subcategory move preview error:", error);
        sendApiError(res, error, "Не удалось подготовить предварительный просмотр перемещения.", "CATALOG_STRUCTURE_MOVE_PREVIEW_FAILED");
    }
});

router.post("/structure/subcategories/move", requireRole(["admin"]), async (req, res) => {
    try {
        const result = await moveSubcategories({ all, get, run }, req.body || {});
        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Catalog subcategory move error:", error);
        sendApiError(res, error, "Не удалось переместить подкатегории.", "CATALOG_STRUCTURE_MOVE_FAILED");
    }
});

router.post("/import/preview", requireRole(["admin"]), async (req, res) => {
    try {
        const upload = await readMultipartXlsxUpload(req);
        const parsed = await parseCatalogExcel(upload.buffer);
        const preview = await createCatalogImportPreviewToken({ all }, parsed, {
            name: upload.name,
            mimeType: upload.mimeType
        }, req.session.user || {}, upload.buffer);

        res.json(preview);
    } catch (error) {
        console.error("Products import preview error:", error);
        const status = Number(error?.status) || 500;
        const message = error?.status && error?.message
            ? error.message
            : "Не удалось выполнить предварительную проверку файла.";
        res.status(status).json({
            success: false,
            canImport: false,
            code: error?.code || (error?.status ? "UPLOAD_ERROR" : "IMPORT_PREVIEW_FAILED"),
            message,
            errors: [{
                severity: "critical",
                code: error?.code || (error?.status ? "UPLOAD_ERROR" : "IMPORT_PREVIEW_FAILED"),
                message
            }],
            warnings: []
        });
    }
});

router.patch("/import/preview/:token/resolutions", requireRole(["admin"]), async (req, res) => {
    try {
        const result = await updateCatalogImportResolutions(
            { all, get },
            req.params.token,
            req.body?.resolutions || [],
            req.session.user || {}
        );

        res.json(result);
    } catch (error) {
        console.error("Products import resolution error:", error);
        sendApiError(res, error, "Не удалось сохранить решение импорта.", "IMPORT_RESOLUTION_FAILED");
    }
});

router.get("/import/preview/:token/mat-conflicts/audit", requireRole(["admin"]), async (req, res) => {
    try {
        const result = await getCatalogImportMatConflictAudit(
            { all, get },
            req.params.token,
            req.session.user || {}
        );

        res.json(result);
    } catch (error) {
        console.error("Products import MAT conflict audit error:", error);
        sendApiError(res, error, "РќРµ СѓРґР°Р»РѕСЃСЊ РІС‹РїРѕР»РЅРёС‚СЊ Р°СѓРґРёС‚ MAT-РєРѕРЅС„Р»РёРєС‚РѕРІ.", "IMPORT_MAT_CONFLICT_AUDIT_FAILED");
    }
});

router.post("/import/preview/:token/group-resolution/dry-run", requireRole(["admin"]), async (req, res) => {
    try {
        const result = await getCatalogImportGroupResolutionDryRun(
            { all, get },
            req.params.token,
            req.body || {},
            req.session.user || {}
        );

        res.json(result);
    } catch (error) {
        console.error("Products import group resolution dry run error:", error);
        sendApiError(res, error, "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРіРѕС‚РѕРІРёС‚СЊ dry run РіСЂСѓРїРїРѕРІРѕРіРѕ СЂРµС€РµРЅРёСЏ.", "IMPORT_GROUP_RESOLUTION_DRY_RUN_FAILED");
    }
});

router.post("/import/apply", requireRole(["admin"]), async (req, res) => {
    try {
        const result = await applyCatalogImport(
            { all, get, run },
            req.body?.token,
            req.body?.options || {},
            req.session.user || {}
        );

        res.json(result);
    } catch (error) {
        console.error("Products import apply error:", error);
        sendApiError(res, error, "Не удалось применить импорт.", "IMPORT_APPLY_FAILED");
    }
});

router.get("/import/excel-copy/:id", requireRole(["admin"]), async (req, res) => {
    try {
        const copy = await getCatalogImportExcelCopy({ get }, req.params.id);
        setExcelHeaders(res, copy.filename);
        res.sendFile(copy.path);
    } catch (error) {
        console.error("Products import Excel copy error:", error);
        sendApiError(res, error, "Не удалось скачать копию Excel.", "IMPORT_EXCEL_COPY_FAILED");
    }
});

router.post("/structure/categories", requireRole(["admin"]), async (req, res) => {
    try {
        const item = await createCategory({ run, get, all }, req.body || {});
        res.status(201).json({ success: true, item, data: { item } });
    } catch (error) {
        console.error("Catalog category create error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Не удалось добавить категорию."
        });
    }
});

router.patch("/structure/categories/:id/order", requireRole(["admin"]), async (req, res) => {
    try {
        const order = await moveRootCategoryToIndex({ run, get, all }, {
            categoryId: req.params.id,
            targetIndex: Number(req.body?.targetIndex)
        });
        res.json({ success: true, order, data: { order } });
    } catch (error) {
        console.error("Catalog category reorder error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Не удалось изменить порядок категорий."
        });
    }
});

router.post("/structure/subcategories", requireRole(["admin"]), async (req, res) => {
    try {
        const item = await createSubcategory({ run, get, all }, req.body || {});
        res.status(201).json({ success: true, item, data: { item } });
    } catch (error) {
        console.error("Catalog subcategory create error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Не удалось добавить подкатегорию."
        });
    }
});

router.post("/", requireRole(["admin"]), async (req, res) => {
    try {
        const payload = getProductPayload(req.body);
        const validationMessage = validateProductPayload(payload)
            || await validateProductStructureSelection({ get }, payload);
        if (validationMessage) {
            res.status(400).json({ success: false, message: validationMessage });
            return;
        }

        const result = await enqueueProductCreate(() => createManualProductWithMatCodeLocked(payload));
        const product = await get("SELECT * FROM products WHERE id = ?", [result.id]);

        res.status(201).json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        console.error("Product create error:", error);
        res.status(500).json({ success: false, message: "Не удалось создать товар." });
    }
});

router.patch("/:id", requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: "Некорректный товар." });
            return;
        }

        const existing = await get("SELECT * FROM products WHERE id = ?", [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: "Товар не найден." });
            return;
        }
        if (existing.deleted_at) {
            res.status(400).json({ success: false, message: "Товар удален." });
            return;
        }

        const payload = getProductPayload(req.body, existing);
        const validationMessage = validateProductPayload(payload, existing)
            || await validateProductStructureSelection({ get }, payload, existing);
        if (validationMessage) {
            res.status(400).json({ success: false, message: validationMessage });
            return;
        }

        const now = new Date().toISOString();
        const slug = normalizeText(existing.slug) || await generateUniqueSlug(payload.title, existing.external_id || `product-${id}`, id);
        await run(
            `UPDATE products
             SET title = ?,
                 slug = ?,
                 category = ?,
                 subcategory = ?,
                 product_group = ?,
                 price = ?,
                 weight = ?,
                 unit = ?,
                 image = ?,
                 description = ?,
                 is_active = ?,
                 sort_order = ?,
                 updated_at = ?
             WHERE id = ?`,
            [
                payload.title,
                slug,
                payload.category,
                payload.subcategory,
                payload.productGroup,
                payload.price,
                payload.weight,
                payload.unit,
                payload.image,
                payload.description,
                payload.isActive,
                payload.sortOrder,
                now,
                id
            ]
        );
        const product = await get("SELECT * FROM products WHERE id = ?", [id]);

        res.json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        console.error("Product update error:", error);
        res.status(500).json({ success: false, message: "Не удалось обновить товар." });
    }
});

router.patch("/:id/status", requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const isActive = req.body?.isActive ? 1 : 0;
        const existing = await get("SELECT id, deleted_at FROM products WHERE id = ?", [id]);

        if (!existing) {
            res.status(404).json({ success: false, message: "Товар не найден." });
            return;
        }
        if (existing.deleted_at) {
            res.status(400).json({ success: false, message: "Товар удален." });
            return;
        }

        await run(
            "UPDATE products SET is_active = ?, updated_at = ? WHERE id = ?",
            [isActive, new Date().toISOString(), id]
        );
        const product = await get("SELECT * FROM products WHERE id = ?", [id]);

        res.json({ success: true, product: normalizeProduct(product) });
    } catch (error) {
        console.error("Product status error:", error);
        res.status(500).json({ success: false, message: "Не удалось изменить статус товара." });
    }
});

router.post("/:id/restore", requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: "Некорректный товар." });
            return;
        }

        const existing = await get("SELECT id, deleted_at FROM products WHERE id = ?", [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: "Товар не найден." });
            return;
        }

        if (!existing.deleted_at) {
            res.status(400).json({ success: false, message: "Товар не удален." });
            return;
        }

        await run(
            `UPDATE products
             SET deleted_at = NULL,
                 deleted_by_id = NULL,
                 deleted_by_name = NULL,
                 is_active = 1,
                 updated_at = ?
             WHERE id = ?`,
            [new Date().toISOString(), id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Product restore error:", error);
        res.status(500).json({ success: false, message: "Не удалось восстановить товар." });
    }
});

router.delete("/:id", requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: "Некорректный товар." });
            return;
        }

        const existing = await get("SELECT * FROM products WHERE id = ?", [id]);
        if (!existing) {
            res.status(404).json({ success: false, message: "Товар не найден." });
            return;
        }

        if (existing.deleted_at) {
            res.status(400).json({ success: false, message: "Товар уже удален." });
            return;
        }

        const now = new Date().toISOString();
        const user = req.session.user || {};
        await run(
            `UPDATE products
             SET deleted_at = ?,
                 deleted_by_id = ?,
                 deleted_by_name = ?,
                 is_active = 0,
                 updated_at = ?
             WHERE id = ?`,
            [
                now,
                user.id || null,
                user.name || "",
                now,
                id
            ]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Product delete error:", error);
        res.status(500).json({ success: false, message: "Не удалось удалить товар." });
    }
});

module.exports = router;
module.exports.publicRouter = publicRouter;
