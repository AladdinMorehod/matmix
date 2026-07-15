const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { all, get, run } = require("../database");
const { requireRole } = require("../middleware/auth");
const { getPaginationParams, buildPaginationMeta } = require("../utils/pagination");
const { sanitizeExcelText } = require("../utils/excelText");
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
    sanitizeUploadFileName,
    buildCatalogExportWorkbook
} = require("../services/catalogImport");
const { ceilMoney, ceilWeight } = require("../utils/numberFormat");

const router = express.Router();
const publicRouter = express.Router();
const allowedCrmUnits = new Set(["шт", "кг", "м", "м2"]);
const productUploadsRoot = path.join(__dirname, "..", "..", "public", "uploads", "products");
const productUploadsUrlPrefix = "/uploads/products/";
const productImageMaxBytes = 10 * 1024 * 1024;
const allowedProductImageTypes = new Map([
    ["image/jpeg", [".jpg", ".jpeg"]],
    ["image/png", [".png"]],
    ["image/webp", [".webp"]]
]);
let productCreateQueue = Promise.resolve();

fs.mkdirSync(productUploadsRoot, { recursive: true });

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

function createHttpError(status, message, code = "REQUEST_FAILED") {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

function normalizeProductImageUrl(value) {
    const imageUrl = normalizeText(value);
    if (!imageUrl.startsWith(productUploadsUrlPrefix)) return "";
    if (imageUrl.includes("\\") || imageUrl.includes("..")) return "";

    const filename = path.posix.basename(imageUrl);
    if (!filename || filename !== imageUrl.slice(productUploadsUrlPrefix.length)) return "";

    return `${productUploadsUrlPrefix}${filename}`;
}

function getProductImageUrl(row = {}) {
    return normalizeProductImageUrl(row.image_url || row.imageUrl);
}

function getProductImagePath(imageUrl) {
    const normalizedUrl = normalizeProductImageUrl(imageUrl);
    if (!normalizedUrl) return "";

    const targetPath = path.resolve(productUploadsRoot, path.posix.basename(normalizedUrl));
    const rootPath = path.resolve(productUploadsRoot);
    if (!targetPath.startsWith(`${rootPath}${path.sep}`)) return "";

    return targetPath;
}

function getImageMagicMime(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) return "";
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
    if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
    return "";
}

function validateProductImageUpload(upload) {
    if (!upload?.buffer?.length) {
        throw createHttpError(400, "Загрузите изображение товара.", "IMAGE_REQUIRED");
    }
    if (upload.buffer.length > productImageMaxBytes) {
        throw createHttpError(413, "Файл изображения слишком большой. Максимум 10 МБ.", "IMAGE_TOO_LARGE");
    }

    const mimeType = normalizeText(upload.mimeType).toLowerCase();
    const allowedExtensions = allowedProductImageTypes.get(mimeType);
    const extension = path.extname(upload.originalName || "").toLowerCase();
    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
        throw createHttpError(400, "Допустимы только JPG, PNG или WebP.", "IMAGE_TYPE_NOT_ALLOWED");
    }

    const magicMime = getImageMagicMime(upload.buffer);
    if (magicMime !== mimeType) {
        throw createHttpError(400, "Файл не похож на заявленный формат изображения.", "IMAGE_SIGNATURE_MISMATCH");
    }

    return { mimeType, extension };
}

function makeProductImageFilename(product, extension) {
    const externalId = normalizeText(product.external_id);
    const prefix = /^MAT-\d+$/i.test(externalId) ? externalId.toUpperCase() : `product-${Number(product.id) || "new"}`;
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    const suffix = crypto.randomBytes(3).toString("hex");
    return `${prefix}-${timestamp}-${suffix}${extension}`;
}

async function readMultipartProductImageUpload(req, { maxBytes = productImageMaxBytes + 1024 * 1024 } = {}) {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!contentType.toLowerCase().includes("multipart/form-data") || !boundaryMatch) {
        throw createHttpError(400, "Ожидается multipart/form-data с полем image.", "MULTIPART_REQUIRED");
    }

    const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
    const body = await collectRequestBuffer(req, maxBytes);
    const bodyText = body.toString("latin1");
    const parts = bodyText.split(boundary);
    const fields = {};
    let image = null;

    for (const partText of parts) {
        const headerEnd = partText.indexOf("\r\n\r\n");
        if (headerEnd === -1) continue;

        const rawHeaders = partText.slice(0, headerEnd);
        const nameMatch = rawHeaders.match(/name="([^"]+)"/i);
        if (!nameMatch) continue;

        const fieldName = nameMatch[1];
        let valueText = partText.slice(headerEnd + 4).replace(/\r\n--$/, "").replace(/\r\n$/, "");
        const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);

        if (filenameMatch) {
            if (fieldName !== "image") continue;
            const contentTypeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
            image = {
                originalName: sanitizeUploadFileName(filenameMatch[1] || ""),
                mimeType: contentTypeMatch?.[1]?.trim() || "",
                buffer: Buffer.from(valueText, "latin1")
            };
        } else {
            fields[fieldName] = Buffer.from(valueText, "latin1").toString("utf8").trim();
        }
    }

    if (!image) {
        throw createHttpError(400, "Файл не найден в поле image.", "IMAGE_REQUIRED");
    }

    return { image, fields };
}

async function saveProductImageFile(product, upload) {
    const { extension } = validateProductImageUpload(upload);
    const filename = makeProductImageFilename(product, extension);
    const filePath = path.join(productUploadsRoot, filename);
    await fs.promises.writeFile(filePath, upload.buffer, { flag: "wx" });
    return `${productUploadsUrlPrefix}${filename}`;
}

async function deleteUnusedProductImage(imageUrl) {
    const normalizedUrl = normalizeProductImageUrl(imageUrl);
    if (!normalizedUrl) return false;

    const usage = await get("SELECT COUNT(*) AS count FROM products WHERE image_url = ?", [normalizedUrl]);
    if (Number(usage?.count) > 0) return false;

    const filePath = getProductImagePath(normalizedUrl);
    if (!filePath) return false;

    await fs.promises.unlink(filePath).catch(error => {
        if (error.code !== "ENOENT") throw error;
    });
    return true;
}

function parseProductIdsField(value) {
    let parsed = [];
    try {
        parsed = JSON.parse(value || "[]");
    } catch (error) {
        parsed = String(value || "").split(",");
    }

    return [...new Set((Array.isArray(parsed) ? parsed : [])
        .map(item => Number(item))
        .filter(id => Number.isInteger(id) && id > 0))];
}

function parseProductImageFilters(value) {
    if (!normalizeText(value)) return {};

    let filters;
    try {
        filters = JSON.parse(value);
    } catch (error) {
        throw createHttpError(400, "Некорректный JSON фильтров.", "INVALID_FILTERS_JSON");
    }

    if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
        throw createHttpError(400, "Фильтры должны быть объектом.", "INVALID_FILTERS");
    }

    const allowedFields = new Set(["search", "category", "subcategory", "productGroup", "product_group", "status", "deleted"]);
    const unknownField = Object.keys(filters).find(field => !allowedFields.has(field));
    if (unknownField) {
        throw createHttpError(400, "Фильтры содержат неизвестное поле.", "UNKNOWN_FILTER_FIELD");
    }

    const normalized = {
        search: normalizeText(filters.search),
        category: normalizeText(filters.category),
        subcategory: normalizeText(filters.subcategory),
        productGroup: normalizeText(filters.productGroup || filters.product_group)
    };
    const status = normalizeText(filters.status);
    const deleted = normalizeText(filters.deleted);

    if (status) {
        if (!["active", "hidden", "deleted"].includes(status)) {
            throw createHttpError(400, "Некорректный статус фильтра.", "INVALID_FILTER_STATUS");
        }
        if (status === "deleted") {
            normalized.deleted = "true";
        } else {
            normalized.status = status;
            normalized.deleted = "false";
        }
    } else if (deleted === "true") {
        normalized.deleted = "true";
    } else {
        normalized.deleted = "false";
    }

    return normalized;
}

function hasActiveProductImageFilter(filters = {}) {
    return Boolean(
        normalizeText(filters.search)
        || normalizeText(filters.category)
        || normalizeText(filters.subcategory)
        || normalizeText(filters.productGroup || filters.product_group)
        || normalizeText(filters.status)
        || normalizeText(filters.deleted) === "true"
    );
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
    const imageUrl = getProductImageUrl(row);
    return {
        id: row.id,
        externalId: row.external_id || "",
        title: row.title,
        category: row.category || "",
        subcategory: row.subcategory || "",
        productGroup: row.product_group || "",
        price: row.price === null || row.price === undefined ? null : Number(row.price),
        weight: Number(row.weight) || 0,
        unit: row.unit || "шт",
        image: row.image || "",
        imageUrl,
        image_url: imageUrl,
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
    const imageUrl = getProductImageUrl(row);
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
        imageUrl,
        image_url: imageUrl,
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
        image: body.image === undefined ? (existing.image || "") : normalizeText(body.image),
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

function getPriceWorkbookFileName(date = new Date()) {
    const day = date.toISOString().slice(0, 10);
    const time = date.toTimeString().slice(0, 5).replace(":", "-");
    return `MatMix_Прайс_${day}_${time}.xlsx`;
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
    const subcategory = normalizeText(query.subcategory);
    const status = normalizeText(query.status);

    if (category) {
        where.push("category = ?");
        params.push(category);
    }
    if (subcategory) {
        where.push("subcategory = ?");
        params.push(subcategory);
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

function escapeSqlLike(value) {
    return String(value || "").replace(/[\\%_]/g, char => `\\${char}`);
}

function addProductSearchWhere(where, params, search) {
    const words = getSearchWords(search);
    words.forEach(word => {
        const like = `%${escapeSqlLike(word)}%`;
        where.push(`(
            LOWER(title) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(external_id, '')) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(slug, '')) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(category, '')) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(subcategory, '')) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(product_group, '')) LIKE ? ESCAPE '\\'
            OR LOWER(COALESCE(description, '')) LIKE ? ESCAPE '\\'
        )`);
        params.push(like, like, like, like, like, like, like);
    });
}

function getNormalizedProductTitle(row = {}) {
    return normalizeSearchText(row.title);
}

function containsWholeSearchToken(value, query) {
    if (!value || !query) return false;
    return value === query
        || value.startsWith(`${query} `)
        || value.endsWith(` ${query}`)
        || value.includes(` ${query} `);
}

function getProductSearchRank(row = {}, normalizedQuery = "") {
    const title = getNormalizedProductTitle(row);
    if (!normalizedQuery) return 99;

    if (title === normalizedQuery) return 0;
    if (title.startsWith(`${normalizedQuery} `)) return 1;
    if (title.startsWith(normalizedQuery)) return 2;
    if (containsWholeSearchToken(title, normalizedQuery)) return 3;
    if (title.includes(normalizedQuery)) return 4;

    const secondaryText = normalizeSearchText([
        row.external_id,
        row.slug,
        row.category,
        row.subcategory,
        row.product_group
    ].filter(value => value !== null && value !== undefined).join(" "));
    if (containsWholeSearchToken(secondaryText, normalizedQuery) || secondaryText.includes(normalizedQuery)) return 5;

    const searchableText = getProductSearchText(row);
    if (searchableText.includes(normalizedQuery)) return 6;

    return 99;
}

function compareProductSearchRows(first, second, normalizedQuery = "") {
    const firstRank = getProductSearchRank(first, normalizedQuery);
    const secondRank = getProductSearchRank(second, normalizedQuery);
    if (firstRank !== secondRank) return firstRank - secondRank;

    const firstSort = Number(first.sort_order) || 0;
    const secondSort = Number(second.sort_order) || 0;
    if (firstSort !== secondSort) return firstSort - secondSort;

    const titleCompare = normalizeText(first.title).localeCompare(normalizeText(second.title), "ru");
    if (titleCompare) return titleCompare;

    return (Number(first.id) || 0) - (Number(second.id) || 0);
}

function buildProductListWhere(query = {}, defaults = {}, options = {}) {
    const { includeSearch = true } = options;
    const params = [];
    const where = [];
    const category = normalizeText(query.category);
    const subcategory = normalizeText(query.subcategory);
    const productGroup = normalizeText(query.productGroup || query.product_group);
    const status = normalizeText(query.status || defaults.status);
    const deleted = query.deleted ?? defaults.deleted;

    if (category) {
        where.push("category = ?");
        params.push(category);
    }
    if (subcategory) {
        where.push("subcategory = ?");
        params.push(subcategory);
    }
    if (productGroup) {
        where.push("product_group = ?");
        params.push(productGroup);
    }
    if (status === "active") {
        where.push("is_active = 1");
    } else if (status === "hidden") {
        where.push("is_active = 0");
    }
    if (deleted === "true") {
        where.push("deleted_at IS NOT NULL");
    } else {
        where.push("deleted_at IS NULL");
    }

    if (includeSearch) {
        addProductSearchWhere(where, params, query.search);
    }

    return {
        whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
        params
    };
}

async function getPaginatedProductRows(query = {}, defaults = {}) {
    const paginationParams = getPaginationParams(query);
    const normalizedSearchQuery = normalizeSearchText(query.search);
    const searchWords = getSearchWords(query.search);
    const { whereSql, params } = buildProductListWhere(query, defaults, {
        includeSearch: !normalizedSearchQuery
    });
    const orderSql = `
        ORDER BY category COLLATE NOCASE ASC,
                 subcategory COLLATE NOCASE ASC,
                 product_group COLLATE NOCASE ASC,
                 sort_order ASC,
                 title COLLATE NOCASE ASC,
                 id ASC
    `;
    if (normalizedSearchQuery) {
        const rows = await all(`
            SELECT *
            FROM products
            ${whereSql}
        `, params);

        const filteredRows = rows
            .filter(row => {
                const searchableText = getProductSearchText(row);
                return searchWords.every(word => searchableText.includes(word));
            })
            .sort((first, second) => compareProductSearchRows(first, second, normalizedSearchQuery));

        return {
            rows: filteredRows.slice(paginationParams.offset, paginationParams.offset + paginationParams.limit),
            pagination: buildPaginationMeta({
                ...paginationParams,
                total: filteredRows.length
            })
        };
    }

    const [countRow, rows] = await Promise.all([
        get(`SELECT COUNT(*) AS total FROM products ${whereSql}`, params),
        all(`
            SELECT *
            FROM products
            ${whereSql}
            ${orderSql}
            LIMIT ? OFFSET ?
        `, [...params, paginationParams.limit, paginationParams.offset])
    ]);

    return {
        rows,
        pagination: buildPaginationMeta({
            ...paginationParams,
            total: countRow?.total
        })
    };
}

function addStructureProductSearchWhere(where, params, search) {
    addProductSearchWhere(where, params, search);
}

function addStructureProductStatusWhere(where, status) {
    if (status === "active") {
        where.push("p.is_active = 1");
    } else if (status === "hidden") {
        where.push("p.is_active = 0");
    }
}

async function getCatalogStructureProductRows(query = {}) {
    const paginationParams = getPaginationParams(query);
    const mode = normalizeText(query.mode || "node");
    const type = normalizeText(query.type);
    const id = Number(query.id || 0);
    const status = normalizeText(query.status || "all");
    const where = ["p.deleted_at IS NULL"];
    const params = [];
    let node = null;

    if (mode === "withoutStructure") {
        where.push(`(
            p.category IS NULL OR TRIM(p.category) = ''
            OR NOT EXISTS (
                SELECT 1
                FROM catalog_structure c
                WHERE c.type = 'category'
                  AND c.parent_id IS NULL
                  AND c.is_active = 1
                  AND c.name = p.category
            )
            OR p.subcategory IS NULL OR TRIM(p.subcategory) = ''
            OR NOT EXISTS (
                SELECT 1
                FROM catalog_structure sc
                JOIN catalog_structure pc ON pc.id = sc.parent_id
                WHERE sc.type = 'subcategory'
                  AND sc.is_active = 1
                  AND pc.type = 'category'
                  AND pc.is_active = 1
                  AND pc.name = p.category
                  AND sc.name = p.subcategory
            )
        )`);
    } else {
        if (!id || !["category", "subcategory"].includes(type)) {
            const error = new Error("Выберите категорию или подкатегорию.");
            error.status = 400;
            error.code = "VALIDATION_ERROR";
            throw error;
        }

        node = await get(`
            SELECT item.*, parent.name AS parent_name
            FROM catalog_structure item
            LEFT JOIN catalog_structure parent ON parent.id = item.parent_id
            WHERE item.id = ? AND item.type = ?
        `, [id, type]);
        if (!node) {
            const error = new Error("Узел структуры не найден.");
            error.status = 404;
            error.code = "NOT_FOUND";
            throw error;
        }

        if (type === "category") {
            where.push("p.category = ?");
            params.push(node.name);
        } else {
            where.push("p.category = ?");
            where.push("p.subcategory = ?");
            params.push(node.parent_name || "", node.name);
        }
    }

    addStructureProductStatusWhere(where, status);
    addStructureProductSearchWhere(where, params, query.search);

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const orderSql = `
        ORDER BY p.category COLLATE NOCASE ASC,
                 p.subcategory COLLATE NOCASE ASC,
                 p.product_group COLLATE NOCASE ASC,
                 p.sort_order ASC,
                 p.title COLLATE NOCASE ASC,
                 p.id ASC
    `;
    const [countRow, rows] = await Promise.all([
        get(`SELECT COUNT(*) AS total FROM products p ${whereSql}`, params),
        all(`
            SELECT p.*
            FROM products p
            ${whereSql}
            ${orderSql}
            LIMIT ? OFFSET ?
        `, [...params, paginationParams.limit, paginationParams.offset])
    ]);

    return {
        node,
        rows,
        pagination: buildPaginationMeta({
            ...paginationParams,
            total: countRow?.total
        })
    };
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

function buildLegacyPriceWorkbook(rows) {
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

    const workbookRows = sections
        ? sections.flatMap(section => section.subcategories.length
            ? section.subcategories.flatMap(subcategory => subcategory.products.length
                ? subcategory.products.map(product => ({
                    ...product,
                    category: section.name,
                    subcategory: subcategory.name
                }))
                : [{
                    __sectionOnly: true,
                    category: section.name,
                    subcategory: subcategory.name
                }])
            : [{
                __categoryOnly: true,
                category: section.name,
                subcategory: ""
            }])
        : rows;
    let currentCategory = "";
    let currentSubcategory = "";
    let currentGroup = "";
    let rowNumber = 5;
    let itemNumber = 0;

    workbookRows.forEach(row => {
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
            row.price === null || row.price === undefined ? "" : ceilMoney(row.price),
            ceilWeight(row.weight)
        ];
        productRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        productRow.getCell(4).numFmt = '#,##0.00 "₽"';
        productRow.getCell(5).numFmt = "0.000";
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

function applyPriceRowFill(row, fillColor) {
    row.eachCell({ includeEmpty: true }, cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
    });
}

function applyPriceRowFont(row, font) {
    row.eachCell({ includeEmpty: true }, cell => {
        cell.font = font;
    });
}

function setPriceRowValues(row, values) {
    values.forEach((value, index) => {
        row.getCell(index + 1).value = value;
    });
}

function addPriceTitleRow(sheet, rowNumber, value, style = {}) {
    sheet.mergeCells(`A${rowNumber}:H${rowNumber}`);
    const cell = sheet.getCell(`A${rowNumber}`);
    cell.value = value;
    cell.font = style.font || { bold: true };
    cell.fill = style.fill;
    cell.alignment = style.alignment || { vertical: "middle", horizontal: "center" };
}

function parseOptionalExportNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "string") {
        const normalized = value.replace(",", ".").replace(/\s+/g, "").trim();
        if (!normalized) return null;
        const number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function getExportMatCode(row) {
    const code = normalizeText(row.external_id);
    if (!code || /^excel-/i.test(code)) return "";
    return code;
}

function formatPriceExportDate(date) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function getPriceSectionKey(value) {
    return normalizeCatalogStructureName(value || "");
}

async function getPriceWorkbookSections(rows, query = {}) {
    const categoryFilter = getPriceSectionKey(query.category);
    const subcategoryFilter = getPriceSectionKey(query.subcategory);
    const hasSearch = Boolean(getSearchWords(query.search).length);
    const productBuckets = new Map();
    const usedProductIds = new Set();

    rows.forEach(row => {
        const categoryKey = getPriceSectionKey(row.category);
        const subcategoryKey = getPriceSectionKey(row.subcategory);
        const bucketKey = `${categoryKey}\u0000${subcategoryKey}`;
        if (!productBuckets.has(bucketKey)) productBuckets.set(bucketKey, []);
        productBuckets.get(bucketKey).push(row);
    });

    const structureRows = await all(`
        SELECT id, type, name, normalized_name, parent_id, sort_order
        FROM catalog_structure
        WHERE is_active = 1
          AND COALESCE(is_system, 0) = 0
          AND type IN ('category', 'subcategory')
        ORDER BY sort_order ASC, id ASC
    `);
    const categoryRows = structureRows.filter(row => row.type === "category");
    const subcategoriesByParent = new Map();
    structureRows.filter(row => row.type === "subcategory").forEach(row => {
        const parentId = Number(row.parent_id) || 0;
        if (!subcategoriesByParent.has(parentId)) subcategoriesByParent.set(parentId, []);
        subcategoriesByParent.get(parentId).push(row);
    });

    const sections = [];
    categoryRows.forEach(category => {
        const categoryKey = getPriceSectionKey(category.normalized_name || category.name);
        if (categoryFilter && categoryKey !== categoryFilter) return;

        const section = {
            name: category.name,
            subcategories: []
        };
        const withoutSubProducts = productBuckets.get(`${categoryKey}\u0000`) || [];
        if ((!subcategoryFilter || subcategoryFilter === "") && withoutSubProducts.length) {
            withoutSubProducts.forEach(row => usedProductIds.add(row.id));
            section.subcategories.push({
                name: "Без подкатегории",
                products: withoutSubProducts
            });
        }

        (subcategoriesByParent.get(Number(category.id)) || []).forEach(subcategory => {
            const subcategoryKey = getPriceSectionKey(subcategory.normalized_name || subcategory.name);
            if (subcategoryFilter && subcategoryKey !== subcategoryFilter) return;
            const products = productBuckets.get(`${categoryKey}\u0000${subcategoryKey}`) || [];
            products.forEach(row => usedProductIds.add(row.id));
            if (!hasSearch || products.length) {
                section.subcategories.push({
                    name: subcategory.name,
                    products
                });
            }
        });

        if (!hasSearch || section.subcategories.length) {
            sections.push(section);
        }
    });

    const leftoverProducts = rows.filter(row => !usedProductIds.has(row.id));
    if (leftoverProducts.length) {
        const leftoverBySubcategory = new Map();
        leftoverProducts.forEach(row => {
            const subcategory = normalizeText(row.subcategory) || "Без подкатегории";
            if (!leftoverBySubcategory.has(subcategory)) leftoverBySubcategory.set(subcategory, []);
            leftoverBySubcategory.get(subcategory).push(row);
        });
        sections.push({
            name: "Без структуры",
            subcategories: Array.from(leftoverBySubcategory, ([name, products]) => ({ name, products }))
        });
    }

    return sections;
}

function buildPriceWorkbook(rows, sections = null) {
    const workbook = new ExcelJS.Workbook();
    const exportedAt = new Date();
    workbook.creator = "MatMix";
    workbook.created = exportedAt;
    workbook.modified = exportedAt;

    const sheet = workbook.addWorksheet("ПРАЙС", {
        views: [{ state: "frozen", ySplit: 4, showGridLines: false }]
    });
    sheet.properties.outlineProperties = {
        summaryBelow: false,
        summaryRight: false
    };
    sheet.columns = [
        { key: "title", width: 64 },
        { key: "category", width: 28 },
        { key: "subcategory", width: 34 },
        { key: "unit", width: 11 },
        { key: "price", width: 15 },
        { key: "productGroup", width: 28 },
        { key: "weight", width: 13 },
        { key: "mat", width: 18 }
    ];

    addPriceTitleRow(sheet, 1, sanitizeExcelText("Прайс-лист MatMix"), {
        font: { bold: true, size: 22, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } }
    });
    sheet.getRow(1).height = 30;
    addPriceTitleRow(sheet, 2, sanitizeExcelText(`Дата формирования: ${formatPriceExportDate(exportedAt)}`), {
        font: { bold: true, size: 11, color: { argb: "FF4A5348" } }
    });
    addPriceTitleRow(sheet, 3, sanitizeExcelText("Актуальные цены на дату формирования"), {
        font: { italic: true, size: 10, color: { argb: "FF6F766C" } }
    });
    sheet.getRow(3).height = 18;

    const headerRow = sheet.getRow(4);
    setPriceRowValues(headerRow, ["Наименование", "Категория", "Подкатегория", "Ед. изм.", "Цена, ₽", "Группа товаров", "Вес", "MAT-код"].map(sanitizeExcelText));
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headerRow.height = 24;
    headerRow.eachCell({ includeEmpty: true }, applyBaseCellStyle);

    let currentCategory = "";
    let currentSubcategory = "";
    let rowNumber = 5;

    rows.forEach(row => {
        const category = sanitizeExcelText(normalizeText(row.category) || "Без структуры");
        const subcategory = sanitizeExcelText(normalizeText(row.subcategory) || "Без подкатегории");
        const price = parseOptionalExportNumber(row.price);
        const weight = parseOptionalExportNumber(row.weight);

        if (category !== currentCategory) {
            currentCategory = category;
            currentSubcategory = "";
            const categoryRow = sheet.getRow(rowNumber);
            setPriceRowValues(categoryRow, [`Категория: ${category}`, category, null, null, null, null, null, null].map(value => typeof value === "string" ? sanitizeExcelText(value) : value));
            categoryRow.height = 24;
            categoryRow.outlineLevel = 0;
            categoryRow.alignment = { vertical: "middle", wrapText: true };
            applyPriceRowFill(categoryRow, "FFE8EFE8");
            applyPriceRowFont(categoryRow, { bold: true, size: 13, color: { argb: "FF1A4F3A" } });
            categoryRow.eachCell({ includeEmpty: true }, applyBaseCellStyle);
            rowNumber += 1;
        }

        if (row.__categoryOnly) return;

        if (subcategory !== currentSubcategory) {
            currentSubcategory = subcategory;
            const subcategoryRow = sheet.getRow(rowNumber);
            setPriceRowValues(subcategoryRow, [`  Подкатегория: ${subcategory}`, category, subcategory, null, null, null, null, null].map(value => typeof value === "string" ? sanitizeExcelText(value) : value));
            subcategoryRow.height = 22;
            subcategoryRow.outlineLevel = 1;
            subcategoryRow.hidden = true;
            subcategoryRow.alignment = { vertical: "middle", wrapText: true };
            applyPriceRowFill(subcategoryRow, "FFF4F6F1");
            applyPriceRowFont(subcategoryRow, { bold: true, size: 11, color: { argb: "FF205742" } });
            subcategoryRow.eachCell({ includeEmpty: true }, applyBaseCellStyle);
            rowNumber += 1;
        }

        if (row.__sectionOnly) return;

        const productRow = sheet.getRow(rowNumber);
        setPriceRowValues(productRow, [
            sanitizeExcelText(row.title),
            category,
            subcategory,
            sanitizeExcelText(row.unit || "шт"),
            price === null ? null : ceilMoney(price),
            sanitizeExcelText(row.product_group || ""),
            weight === null ? null : ceilWeight(weight),
            sanitizeExcelText(getExportMatCode(row))
        ]);
        productRow.outlineLevel = 2;
        productRow.hidden = true;
        productRow.getCell(5).numFmt = "#,##0.00";
        productRow.getCell(7).numFmt = "0.000";
        productRow.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
        productRow.getCell(7).alignment = { vertical: "middle", horizontal: "right" };
        productRow.getCell(8).font = { color: { argb: "FF6F766C" } };
        productRow.eachCell({ includeEmpty: true }, applyBaseCellStyle);
        rowNumber += 1;
    });

    const lastRow = Math.max(4, rowNumber - 1);
    sheet.autoFilter = {
        from: "A4",
        to: `H${lastRow}`
    };
    sheet.pageSetup = {
        orientation: "landscape",
        fitToWidth: 1,
        fitToHeight: 0,
        printTitlesRow: "4:4",
        printArea: `A1:H${lastRow}`,
        horizontalCentered: true,
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

async function sendPriceWorkbook(res, rows, query = {}) {
    const sections = await getPriceWorkbookSections(rows, query);
    const workbook = buildPriceWorkbook(rows, sections);
    setExcelHeaders(res, getPriceWorkbookFileName());
    await workbook.xlsx.write(res);
    res.end();
}

publicRouter.get("/", async (req, res) => {
    try {
        const { rows, pagination } = await getPaginatedProductRows(req.query, { status: "active", deleted: "false" });
        const products = rows.map(normalizePublicProduct);
        res.json({ success: true, products, items: products, pagination });
    } catch (error) {
        console.error("Public products load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить каталог." });
    }
});

publicRouter.get("/export/excel", async (req, res) => {
    try {
        const rows = await getProductsWithCatalogOrder({ ...req.query, status: "active", deleted: "false" });
        await sendPriceWorkbook(res, rows, req.query || {});
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
        const { rows, pagination } = await getPaginatedProductRows(req.query, { deleted: "false" });
        const products = rows.map(normalizeProduct);
        const [categoryRows, subcategoryRows, productGroupRows, totalRow] = await Promise.all([
            all("SELECT DISTINCT category FROM products WHERE deleted_at IS NULL AND category IS NOT NULL AND category != '' ORDER BY category COLLATE NOCASE ASC"),
            all("SELECT DISTINCT subcategory FROM products WHERE deleted_at IS NULL AND subcategory IS NOT NULL AND subcategory != '' ORDER BY subcategory COLLATE NOCASE ASC"),
            all("SELECT DISTINCT product_group FROM products WHERE deleted_at IS NULL AND product_group IS NOT NULL AND product_group != '' ORDER BY product_group COLLATE NOCASE ASC"),
            get("SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL")
        ]);
        const categories = categoryRows.map(row => row.category);
        const subcategories = subcategoryRows.map(row => row.subcategory);
        const productGroups = productGroupRows.map(row => row.product_group);

        res.json({
            success: true,
            products,
            items: products,
            categories,
            subcategories,
            productGroups,
            productTotal: Number(totalRow?.total) || 0,
            pagination
        });
    } catch (error) {
        console.error("Products load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить каталог." });
    }
});

router.get("/export/excel", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const status = req.query.all === "true" ? "" : (req.query.status || "active");
        const rows = await getProductsWithCatalogOrder({ ...req.query, status, deleted: "false" });
        await sendPriceWorkbook(res, rows, req.query || {});
    } catch (error) {
        console.error("Products export error:", error);
        res.status(500).json({ success: false, message: "Не удалось сформировать прайс." });
    }
});

router.get("/import/export/excel", requireRole(["admin"]), async (req, res) => {
    try {
        const { workbook, filename } = await buildCatalogExportWorkbook({ all });
        setExcelHeaders(res, filename);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Catalog import-compatible export error:", error);
        sendApiError(res, error, "Не удалось сформировать актуальный каталог Excel.", "CATALOG_EXPORT_FAILED");
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

router.get("/structure/audit/products", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const result = await getCatalogStructureProductRows(req.query || {});
        const products = result.rows.map(normalizeProduct);
        res.json({
            success: true,
            products,
            items: products,
            node: result.node ? {
                id: result.node.id,
                type: result.node.type,
                name: result.node.name,
                code: result.node.code || "",
                parentId: result.node.parent_id || null,
                parentName: result.node.parent_name || "",
                isActive: Boolean(result.node.is_active),
                sortOrder: Number(result.node.sort_order) || 0,
                createdAt: result.node.created_at || "",
                updatedAt: result.node.updated_at || ""
            } : null,
            pagination: result.pagination
        });
    } catch (error) {
        console.error("Catalog structure products audit error:", error);
        sendApiError(res, error, "Не удалось загрузить товары по структуре каталога.", "CATALOG_STRUCTURE_PRODUCTS_FAILED");
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

router.post("/images/batch", requireRole(["admin"]), async (req, res) => {
    let savedImageUrl = "";
    try {
        const { image, fields } = await readMultipartProductImageUpload(req);
        const productIds = parseProductIdsField(fields.productIds || fields.product_ids);
        if (!productIds.length) {
            throw createHttpError(400, "Выберите товары для назначения изображения.", "PRODUCT_IDS_REQUIRED");
        }

        const placeholders = productIds.map(() => "?").join(",");
        const existingProducts = await all(
            `SELECT * FROM products WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
            productIds
        );
        if (!existingProducts.length) {
            throw createHttpError(404, "Выбранные товары не найдены.", "PRODUCTS_NOT_FOUND");
        }

        savedImageUrl = await saveProductImageFile(existingProducts[0], image);
        const previousUrls = [...new Set(existingProducts.map(product => getProductImageUrl(product)).filter(Boolean))];
        const now = new Date().toISOString();
        await run(
            `UPDATE products
             SET image_url = ?,
                 updated_at = ?
             WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
            [savedImageUrl, now, ...productIds]
        );

        for (const previousUrl of previousUrls) {
            await deleteUnusedProductImage(previousUrl);
        }

        res.json({
            success: true,
            updated: existingProducts.length,
            imageUrl: savedImageUrl,
            image_url: savedImageUrl
        });
    } catch (error) {
        if (savedImageUrl) {
            await deleteUnusedProductImage(savedImageUrl).catch(cleanupError => {
                console.error("Batch product image cleanup error:", cleanupError);
            });
        }
        console.error("Product batch image upload error:", error);
        sendApiError(res, error, "Не удалось назначить изображение выбранным товарам.", "PRODUCT_IMAGE_BATCH_FAILED");
    }
});

router.post("/images/by-filter", requireRole(["admin"]), async (req, res) => {
    let savedImageUrl = "";
    try {
        const { image, fields } = await readMultipartProductImageUpload(req);
        const scope = normalizeText(fields.scope || "filtered");
        if (!["filtered", "all"].includes(scope)) {
            throw createHttpError(400, "Некорректная область назначения изображения.", "INVALID_IMAGE_SCOPE");
        }

        validateProductImageUpload(image);
        const filters = parseProductImageFilters(fields.filters);
        if (scope === "filtered" && !hasActiveProductImageFilter(filters)) {
            throw createHttpError(400, "Для назначения найденным товарам задайте хотя бы один фильтр.", "FILTER_REQUIRED");
        }

        const query = scope === "all" ? {} : filters;
        const defaults = scope === "all" ? { deleted: "false" } : {};
        const { whereSql, params } = buildProductListWhere(query, defaults);
        const productsToUpdate = await all(
            `SELECT id, external_id, image_url FROM products ${whereSql} ORDER BY id ASC`,
            params
        );

        if (!productsToUpdate.length) {
            throw createHttpError(400, "По выбранным условиям товары не найдены.", "NO_PRODUCTS_MATCHED");
        }

        savedImageUrl = await saveProductImageFile(productsToUpdate[0], image);
        const previousUrls = [...new Set(productsToUpdate.map(product => getProductImageUrl(product)).filter(Boolean))];
        const now = new Date().toISOString();
        let updateResult;

        await run("BEGIN IMMEDIATE TRANSACTION");
        try {
            updateResult = await run(
                `UPDATE products
                 SET image_url = ?,
                     updated_at = ?
                 ${whereSql}`,
                [savedImageUrl, now, ...params]
            );
            await run("COMMIT");
        } catch (error) {
            await run("ROLLBACK").catch(rollbackError => {
                console.error("Product image by-filter rollback error:", rollbackError);
            });
            throw error;
        }

        for (const previousUrl of previousUrls) {
            await deleteUnusedProductImage(previousUrl);
        }

        const updated = Number(updateResult?.changes) || productsToUpdate.length;
        res.json({
            success: true,
            scope,
            matched: productsToUpdate.length,
            updated,
            skipped: Math.max(0, productsToUpdate.length - updated),
            imageUrl: savedImageUrl,
            image_url: savedImageUrl
        });
    } catch (error) {
        if (savedImageUrl) {
            await deleteUnusedProductImage(savedImageUrl).catch(cleanupError => {
                console.error("Product image by-filter cleanup error:", cleanupError);
            });
        }
        console.error("Product image by-filter upload error:", error);
        sendApiError(res, error, "Не удалось назначить изображение по фильтру.", "PRODUCT_IMAGE_BY_FILTER_FAILED");
    }
});

router.post("/:id/image", requireRole(["admin"]), async (req, res) => {
    let savedImageUrl = "";
    try {
        const id = Number(req.params.id);
        if (!id) throw createHttpError(400, "Некорректный товар.", "INVALID_PRODUCT_ID");

        const product = await get("SELECT * FROM products WHERE id = ?", [id]);
        if (!product) throw createHttpError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
        if (product.deleted_at) throw createHttpError(400, "Товар удалён.", "PRODUCT_DELETED");

        const { image } = await readMultipartProductImageUpload(req);
        const previousUrl = getProductImageUrl(product);
        savedImageUrl = await saveProductImageFile(product, image);
        await run(
            "UPDATE products SET image_url = ?, updated_at = ? WHERE id = ?",
            [savedImageUrl, new Date().toISOString(), id]
        );
        await deleteUnusedProductImage(previousUrl);

        const updatedProduct = await get("SELECT * FROM products WHERE id = ?", [id]);
        res.json({
            success: true,
            imageUrl: savedImageUrl,
            image_url: savedImageUrl,
            product: normalizeProduct(updatedProduct)
        });
    } catch (error) {
        if (savedImageUrl) {
            await deleteUnusedProductImage(savedImageUrl).catch(cleanupError => {
                console.error("Product image cleanup error:", cleanupError);
            });
        }
        console.error("Product image upload error:", error);
        sendApiError(res, error, "Не удалось загрузить изображение товара.", "PRODUCT_IMAGE_UPLOAD_FAILED");
    }
});

router.delete("/:id/image", requireRole(["admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) throw createHttpError(400, "Некорректный товар.", "INVALID_PRODUCT_ID");

        const product = await get("SELECT * FROM products WHERE id = ?", [id]);
        if (!product) throw createHttpError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");

        const previousUrl = getProductImageUrl(product);
        await run(
            "UPDATE products SET image_url = NULL, updated_at = ? WHERE id = ?",
            [new Date().toISOString(), id]
        );
        await deleteUnusedProductImage(previousUrl);

        const updatedProduct = await get("SELECT * FROM products WHERE id = ?", [id]);
        res.json({
            success: true,
            imageUrl: null,
            image_url: null,
            product: normalizeProduct(updatedProduct)
        });
    } catch (error) {
        console.error("Product image delete error:", error);
        sendApiError(res, error, "Не удалось удалить изображение товара.", "PRODUCT_IMAGE_DELETE_FAILED");
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
