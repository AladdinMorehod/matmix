const express = require("express");
const ExcelJS = require("exceljs");
const { all, get, run } = require("../database");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeNumber(value, fallback = 0) {
    if (value === "" || value === null || value === undefined) return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
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
        updatedAt: row.updated_at || ""
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
    const search = normalizeText(query.search).toLowerCase();
    const category = normalizeText(query.category);
    const status = normalizeText(query.status);

    if (search) {
        where.push("(LOWER(title) LIKE ? OR LOWER(external_id) LIKE ? OR LOWER(category) LIKE ? OR LOWER(subcategory) LIKE ?)");
        const value = `%${search}%`;
        params.push(value, value, value, value);
    }

    if (category) {
        where.push("category = ?");
        params.push(category);
    }

    if (status === "active") {
        where.push("is_active = 1");
    } else if (status === "hidden") {
        where.push("is_active = 0");
    }

    const sql = `
        SELECT *
        FROM products
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY category COLLATE NOCASE ASC,
                 subcategory COLLATE NOCASE ASC,
                 sort_order ASC,
                 title COLLATE NOCASE ASC
    `;

    return all(sql, params);
}

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const rows = await getFilteredProducts(req.query);
        const products = rows.map(normalizeProduct);
        const categoryRows = await all("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category COLLATE NOCASE ASC");
        const subcategoryRows = await all("SELECT DISTINCT subcategory FROM products WHERE subcategory IS NOT NULL AND subcategory != '' ORDER BY subcategory COLLATE NOCASE ASC");
        const categories = categoryRows.map(row => row.category);
        const subcategories = subcategoryRows.map(row => row.subcategory);

        res.json({ success: true, products, categories, subcategories });
    } catch (error) {
        console.error("Products load error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить каталог." });
    }
});

router.get("/export/excel", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const rows = await getFilteredProducts({ ...req.query, status: req.query.status || "active" });
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "MatMix CRM";
        workbook.created = new Date();
        const sheet = workbook.addWorksheet("Прайс");

        sheet.columns = [
            { header: "Категория", key: "category", width: 26 },
            { header: "Подкатегория", key: "subcategory", width: 28 },
            { header: "Товар", key: "title", width: 56 },
            { header: "Цена", key: "price", width: 12 },
            { header: "Ед.", key: "unit", width: 10 },
            { header: "Вес", key: "weight", width: 12 },
            { header: "External ID", key: "external_id", width: 18 }
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF205742" } };
        sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

        rows.forEach(row => {
            sheet.addRow({
                category: row.category || "",
                subcategory: row.subcategory || "",
                title: row.title,
                price: row.price === null ? "" : Number(row.price) || 0,
                unit: row.unit || "шт",
                weight: Number(row.weight) || 0,
                external_id: row.external_id
            });
        });

        sheet.getColumn("price").numFmt = "#,##0.00";
        sheet.getColumn("weight").numFmt = "#,##0.###";
        sheet.eachRow(row => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FFE0E6DD" } },
                    left: { style: "thin", color: { argb: "FFE0E6DD" } },
                    bottom: { style: "thin", color: { argb: "FFE0E6DD" } },
                    right: { style: "thin", color: { argb: "FFE0E6DD" } }
                };
                cell.alignment = { vertical: "middle", wrapText: true };
            });
        });

        setExcelHeaders(res, getWorkbookFileName("MatMix-прайс"));
        await workbook.xlsx.write(res);
        res.end();
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
                external_id, title, slug, category, subcategory, price, weight, unit,
                image, description, is_active, sort_order, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.externalId,
                payload.title,
                payload.slug,
                payload.category,
                payload.subcategory,
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
        const existing = await get("SELECT id FROM products WHERE id = ?", [id]);

        if (!existing) {
            res.status(404).json({ success: false, message: "Товар не найден." });
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

module.exports = router;
