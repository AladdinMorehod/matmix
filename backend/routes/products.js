const express = require("express");
const ExcelJS = require("exceljs");
const { all, get, run } = require("../database");
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const publicRouter = express.Router();

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
    const slug = normalizeText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    return slug || fallback;
}

function normalizeProduct(row) {
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
    const externalId = normalizeText(body.externalId || body.external_id);
    const slug = normalizeText(body.slug) || makeSlug(title, externalId);

    return {
        externalId,
        title,
        slug,
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

function validateProductPayload(payload) {
    if (!payload.title) return "Укажите название товара.";
    if (!payload.externalId) return "Укажите External ID товара.";
    if (payload.price !== null && payload.price < 0) return "Цена не может быть отрицательной.";
    if (payload.weight < 0) return "Вес не может быть отрицательным.";
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

async function getPublicProducts() {
    return all(`
        SELECT *
        FROM products
        WHERE is_active = 1
          AND deleted_at IS NULL
        ORDER BY sort_order ASC,
                 category COLLATE NOCASE ASC,
                 subcategory COLLATE NOCASE ASC,
                 product_group COLLATE NOCASE ASC,
                 title COLLATE NOCASE ASC
    `);
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
        const rows = await getFilteredProducts({ ...req.query, status, deleted: "false" });
        await sendPriceWorkbook(res, rows);
    } catch (error) {
        console.error("Products export error:", error);
        res.status(500).json({ success: false, message: "Не удалось сформировать прайс." });
    }
});

router.post("/", requireRole(["admin"]), async (req, res) => {
    try {
        const payload = getProductPayload(req.body);
        const validationMessage = validateProductPayload(payload);
        if (validationMessage) {
            res.status(400).json({ success: false, message: validationMessage });
            return;
        }

        const exists = await get("SELECT id FROM products WHERE external_id = ?", [payload.externalId]);
        if (exists) {
            res.status(409).json({ success: false, message: "Товар с таким External ID уже существует." });
            return;
        }

        const now = new Date().toISOString();
        const result = await run(
            `INSERT INTO products (
                external_id, title, slug, category, subcategory, product_group, price, weight, unit,
                image, description, is_active, sort_order, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.externalId,
                payload.title,
                payload.slug,
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
                "crm",
                now,
                now
            ]
        );
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
        const validationMessage = validateProductPayload(payload);
        if (validationMessage) {
            res.status(400).json({ success: false, message: validationMessage });
            return;
        }

        const duplicate = await get("SELECT id FROM products WHERE external_id = ? AND id != ?", [payload.externalId, id]);
        if (duplicate) {
            res.status(409).json({ success: false, message: "Товар с таким External ID уже существует." });
            return;
        }

        const now = new Date().toISOString();
        await run(
            `UPDATE products
             SET external_id = ?,
                 title = ?,
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
                payload.externalId,
                payload.title,
                payload.slug,
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
