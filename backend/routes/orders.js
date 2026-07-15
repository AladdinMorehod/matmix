const express = require("express");
const path = require("path");
const ExcelJS = require("exceljs");
const { all, get, run, withTransaction, getOrderNumber } = require("../database");
const { requireRole } = require("../middleware/auth");
const { normalizePhone } = require("../utils/phone");
const { getPaginationParams, buildPaginationMeta } = require("../utils/pagination");
const { ceilMoney, ceilWeight, formatMoneyValue, toFiniteNumber } = require("../utils/numberFormat");
const { sanitizeExcelText } = require("../utils/excelText");

const router = express.Router();
const orderTemplatePath = path.join(__dirname, "..", "templates", "order-template.xlsx");
const MAX_ORDER_ITEMS = 100;
const MAX_ITEM_QUANTITY = 10000;

class PublicOrderError extends Error {
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

function readOrderText(body, key, maxLength, required = false) {
    const value = body?.[key];
    if (value !== undefined && value !== null && typeof value !== "string") {
        throw new PublicOrderError(400, `Поле ${key} должно быть строкой.`, "INVALID_FIELD_TYPE");
    }

    const normalized = String(value || "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim();
    if (required && !normalized) {
        throw new PublicOrderError(400, `Поле ${key} обязательно.`, "REQUIRED_FIELD");
    }
    if (normalized.length > maxLength) {
        throw new PublicOrderError(400, `Поле ${key} слишком длинное.`, "FIELD_TOO_LONG");
    }
    return normalized;
}

function normalizeRequestedItems(items) {
    if (!Array.isArray(items) || !items.length) {
        throw new PublicOrderError(400, "Корзина пуста.", "EMPTY_CART");
    }
    if (items.length > MAX_ORDER_ITEMS) {
        throw new PublicOrderError(400, "В заказе слишком много позиций.", "TOO_MANY_ITEMS");
    }

    const quantitiesByProductId = new Map();
    for (const item of items) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new PublicOrderError(400, "Некорректная позиция заказа.", "INVALID_ITEM");
        }
        const rawProductId = item.productId ?? item.id;
        const productId = typeof rawProductId === "number" ? rawProductId : Number(rawProductId);
        const quantity = typeof item.qty === "number" ? item.qty : Number(item.qty ?? item.quantity);
        if (!Number.isSafeInteger(productId) || productId <= 0) {
            throw new PublicOrderError(400, "Некорректный идентификатор товара.", "INVALID_PRODUCT_ID");
        }
        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            throw new PublicOrderError(400, "Количество товара должно быть целым числом больше нуля.", "INVALID_QUANTITY");
        }

        const combinedQuantity = (quantitiesByProductId.get(productId) || 0) + quantity;
        if (combinedQuantity > MAX_ITEM_QUANTITY) {
            throw new PublicOrderError(400, `Количество одного товара не может превышать ${MAX_ITEM_QUANTITY}.`, "QUANTITY_LIMIT");
        }
        quantitiesByProductId.set(productId, combinedQuantity);
    }

    if (quantitiesByProductId.size > MAX_ORDER_ITEMS) {
        throw new PublicOrderError(400, "В заказе слишком много уникальных позиций.", "TOO_MANY_ITEMS");
    }
    return quantitiesByProductId;
}

function moneyToCents(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) return null;
    const cents = Math.round(ceilMoney(number) * 100);
    return Number.isSafeInteger(cents) ? cents : null;
}

async function buildServerOrderItems(transaction, quantitiesByProductId) {
    const productIds = [...quantitiesByProductId.keys()];
    const placeholders = productIds.map(() => "?").join(", ");
    const products = await transaction.all(
        `SELECT id, external_id, title, price, weight, unit, is_active, deleted_at
         FROM products
         WHERE id IN (${placeholders})`,
        productIds
    );
    const productsById = new Map(products.map(product => [Number(product.id), product]));
    const snapshot = [];
    let totalCents = 0;
    let totalWeight = 0;

    for (const productId of productIds) {
        const product = productsById.get(productId);
        if (!product) throw new PublicOrderError(404, `Товар ${productId} не найден.`, "PRODUCT_NOT_FOUND");
        if (product.deleted_at || Number(product.is_active) !== 1) {
            throw new PublicOrderError(409, `Товар ${product.external_id || productId} недоступен для заказа.`, "PRODUCT_UNAVAILABLE");
        }

        const unitPriceCents = moneyToCents(product.price);
        if (unitPriceCents === null || product.price === null) {
            throw new PublicOrderError(409, `Для товара ${product.external_id || productId} цена предоставляется по запросу.`, "PRICE_ON_REQUEST");
        }

        const quantity = quantitiesByProductId.get(productId);
        const lineTotalCents = unitPriceCents * quantity;
        if (!Number.isSafeInteger(lineTotalCents) || !Number.isSafeInteger(totalCents + lineTotalCents)) {
            throw new PublicOrderError(400, "Сумма заказа превышает допустимый предел.", "ORDER_TOTAL_LIMIT");
        }
        const unitWeight = Math.max(0, ceilWeight(product.weight));
        const lineWeight = ceilWeight(unitWeight * quantity);
        totalCents += lineTotalCents;
        totalWeight = ceilWeight(totalWeight + lineWeight);
        snapshot.push({
            id: product.id,
            productId: product.id,
            externalId: product.external_id,
            name: product.title,
            title: product.title,
            unit: product.unit || "шт",
            price: unitPriceCents / 100,
            unitPrice: unitPriceCents / 100,
            qty: quantity,
            quantity,
            weight: unitWeight,
            lineTotal: lineTotalCents / 100,
            lineWeight
        });
    }

    return { items: snapshot, totalPrice: totalCents / 100, totalWeight };
}

const allowedStatuses = [
    "Новая",
    "В работе",
    "Ожидает клиента",
    "Доставка",
    "Завершена",
    "Отменена"
];

function normalizeText(value) {
    return String(value || "").trim();
}

function parseExcelNumber(value) {
    return toFiniteNumber(value);
}

function hasOrderUnloading(value) {
    const normalized = normalizeText(value).toLowerCase();
    if (!normalized) return false;
    return !["no", "нет", "0", "false", "не нужна", "без разгрузки"].includes(normalized);
}

const paymentMethodLabels = new Map([
    ["cash", "Наличные"],
    ["наличные", "Наличные"],
    ["наличными", "Наличные"],
    ["наличными при получении", "Наличные"],
    ["transfer", "Перевод на карту"],
    ["card", "Перевод на карту"],
    ["card_transfer", "Перевод на карту"],
    ["перевод", "Перевод на карту"],
    ["переводом", "Перевод на карту"],
    ["перевод на карту", "Перевод на карту"],
    ["terminal", "Терминал"],
    ["терминал", "Терминал"],
    ["bank_vat", "Безнал — с НДС"],
    ["invoice_vat", "Безнал — с НДС"],
    ["безнал — с ндс", "Безнал — с НДС"],
    ["безнал - с ндс", "Безнал — с НДС"],
    ["безналичная — с ндс", "Безнал — с НДС"],
    ["безналичная - с ндс", "Безнал — с НДС"],
    ["безналичный расчет с ндс", "Безнал — с НДС"],
    ["bank_no_vat", "Безнал — без НДС"],
    ["invoice", "Безнал — без НДС"],
    ["invoice_no_vat", "Безнал — без НДС"],
    ["безнал — без ндс", "Безнал — без НДС"],
    ["безнал - без ндс", "Безнал — без НДС"],
    ["безналичный расчет", "Безнал — без НДС"],
    ["безналичная — без ндс", "Безнал — без НДС"],
    ["безналичная - без ндс", "Безнал — без НДС"],
    ["безналичный расчет без ндс", "Безнал — без НДС"]
]);

function normalizePaymentMethod(value) {
    const method = sanitizeExcelText(value);
    const normalized = method.toLowerCase();

    return paymentMethodLabels.get(normalized) || method;
}

function normalizePaymentMethodForExport(value) {
    return normalizePaymentMethod(value) || "не указана";
}

function normalizePreferredContactMethod(value) {
    const method = normalizeText(value);
    const allowedMethods = ["Телефон", "WhatsApp", "Telegram", "MAX", "E-mail", "Почта"];

    if (method === "Почта") return "E-mail";
    return allowedMethods.includes(method) ? method : "";
}

function getFallbackPreferredContact(body, phone) {
    const method = normalizePreferredContactMethod(body.preferredContactMethod);
    const value = normalizeText(body.preferredContactValue);

    if (method) {
        return {
            method,
            value
        };
    }

    const telegram = normalizeText(body.telegram);
    if (telegram) {
        return {
            method: "Telegram",
            value: telegram
        };
    }

    const maxContact = normalizeText(body.maxContact);
    if (maxContact) {
        return {
            method: "MAX",
            value: maxContact
        };
    }

    return {
        method: "",
        value: ""
    };
}

function getClientContactFields(method, value, phone) {
    return {
        email: method === "E-mail" ? value : "",
        telegram: method === "Telegram" ? value : "",
        maxContact: method === "MAX" ? value : "",
        whatsapp: method === "WhatsApp" ? (value || phone) : ""
    };
}

async function findOrCreateClient({ customerName, phone, preferredContact, totalPrice, now, transaction = { get, run } }) {
    const normalizedPhone = normalizePhone(phone);
    const contactFields = getClientContactFields(preferredContact.method, preferredContact.value, phone);
    const existingClient = await transaction.get("SELECT * FROM clients WHERE phone = ?", [normalizedPhone]);

    if (existingClient) {
        await transaction.run(
            `UPDATE clients
             SET name = ?,
                 preferred_contact_method = ?,
                 preferred_contact_value = ?,
                 email = COALESCE(NULLIF(?, ''), email),
                 telegram = COALESCE(NULLIF(?, ''), telegram),
                 max_contact = COALESCE(NULLIF(?, ''), max_contact),
                 whatsapp = COALESCE(NULLIF(?, ''), whatsapp),
                 orders_count = COALESCE(orders_count, 0) + 1,
                 total_spent = COALESCE(total_spent, 0) + ?,
                 last_order_at = ?,
                 updated_at = ?
             WHERE id = ?`,
            [
                customerName || existingClient.name,
                preferredContact.method,
                preferredContact.value,
                contactFields.email,
                contactFields.telegram,
                contactFields.maxContact,
                contactFields.whatsapp,
                Number(totalPrice) || 0,
                now,
                now,
                existingClient.id
            ]
        );

        return existingClient.id;
    }

    const result = await transaction.run(
        `INSERT INTO clients (
            name,
            phone,
            preferred_contact_method,
            preferred_contact_value,
            email,
            telegram,
            max_contact,
            whatsapp,
            orders_count,
            total_spent,
            last_order_at,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            customerName,
            normalizedPhone,
            preferredContact.method,
            preferredContact.value,
            contactFields.email,
            contactFields.telegram,
            contactFields.maxContact,
            contactFields.whatsapp,
            1,
            Number(totalPrice) || 0,
            now,
            now,
            now
        ]
    );

    return result.id;
}

function normalizeOrder(row) {
    if (!row) return null;

    return {
        id: row.id,
        orderNumber: row.order_number || "",
        customerName: row.customer_name,
        phone: row.phone,
        telegram: row.telegram || "",
        maxContact: row.max_contact || "",
        preferredContactMethod: row.preferred_contact_method || "",
        preferredContactValue: row.preferred_contact_value || "",
        clientId: row.client_id || null,
        clientOrdersCount: row.client_orders_count || null,
        clientTotalSpent: row.client_total_spent || null,
        clientLastOrderAt: row.client_last_order_at || null,
        address: row.address || "",
        unloading: row.unloading || "",
        paymentMethod: normalizePaymentMethod(row.payment_method) || "",
        comment: row.comment || "",
        items: JSON.parse(row.items_json || "[]"),
        totalPrice: row.total_price || 0,
        totalWeight: row.total_weight || 0,
        status: row.status,
        managerId: row.manager_id || null,
        managerName: row.manager_name || null,
        takenAt: row.taken_at || null,
        closedAt: row.closed_at || null,
        deletedAt: row.deleted_at || null,
        deletedById: row.deleted_by_id || null,
        deletedByName: row.deleted_by_name || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function cloneStyle(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
}

function copyRowStyle(sourceRow, targetRow) {
    targetRow.height = sourceRow.height;
    for (let column = 1; column <= 9; column += 1) {
        const sourceCell = sourceRow.getCell(column);
        const targetCell = targetRow.getCell(column);
        targetCell.style = cloneStyle(sourceCell.style);
        targetCell.numFmt = sourceCell.numFmt;
        targetCell.alignment = cloneStyle(sourceCell.alignment);
        targetCell.border = cloneStyle(sourceCell.border);
        targetCell.fill = cloneStyle(sourceCell.fill);
        targetCell.font = cloneStyle(sourceCell.font);
    }
}

function unmergeRowsFrom(sheet, startRow) {
    const merges = Object.entries(sheet._merges || {});

    merges.forEach(([range, merge]) => {
        if (merge?.model && merge.model.bottom >= startRow) {
            sheet.unMergeCells(range);
        }
    });
}

function restoreOrderTemplateMerges(sheet, tableRowsCount) {
    const tableStartRow = 8;
    const summaryRow = tableStartRow + tableRowsCount;
    const paymentRow = summaryRow + 2;
    const amountTextRow = summaryRow + 4;
    const noteRow = summaryRow + 6;

    for (let index = 0; index < tableRowsCount; index += 1) {
        mergeTableRow(sheet, tableStartRow + index);
    }

    sheet.mergeCells(`A${summaryRow}:H${summaryRow}`);
    sheet.mergeCells(`A${paymentRow}:C${paymentRow}`);
    sheet.mergeCells(`D${paymentRow}:H${paymentRow}`);
    sheet.mergeCells(`A${amountTextRow}:I${amountTextRow}`);
    sheet.mergeCells(`A${noteRow}:F${noteRow}`);
}

function mergeTableRow(sheet, rowNumber) {
    sheet.mergeCells(`B${rowNumber}:C${rowNumber}`);
    sheet.mergeCells(`F${rowNumber}:G${rowNumber}`);
}

function setFormula(cell, formula, result = 0) {
    cell.value = { formula, result };
}

function getExcelFormulaNumber(value, precision = 3) {
    return toFiniteNumber(value).toFixed(precision).replace(/0+$/g, "").replace(/\.$/, "") || "0";
}

function getMergedNameCapacity(row) {
    const worksheet = row.worksheet;
    const cell = row.getCell("B");
    const fontSize = cell.font?.size || 9;
    const columnWidth = [2, 3].reduce((sum, columnNumber) => {
        return sum + (worksheet.getColumn(columnNumber).width || 8.43);
    }, 0);

    return Math.max(20, Math.floor(columnWidth * (11 / fontSize)));
}

function estimateWrappedLineCount(text, charsPerLine = 34) {
    const capacity = Math.max(8, charsPerLine);
    const paragraphs = sanitizeExcelText(text)
        .replace(/[ \t]+/g, " ")
        .split(/\r?\n/);
    if (!paragraphs.some(paragraph => paragraph.trim())) return 1;

    return paragraphs.reduce((totalLines, paragraph) => {
        const words = paragraph.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return totalLines + 1;

        let currentLineWidth = 0;
        let paragraphLines = 1;

        words.forEach(word => {
            const wordWidth = word.length;
            const separatorWidth = currentLineWidth ? 1 : 0;

            if (wordWidth > capacity) {
                const wrappedWordLines = Math.ceil(wordWidth / capacity);
                paragraphLines += currentLineWidth ? wrappedWordLines : wrappedWordLines - 1;
                currentLineWidth = wordWidth % capacity || capacity;
                return;
            }

            if (currentLineWidth && currentLineWidth + separatorWidth + wordWidth > capacity) {
                paragraphLines += 1;
                currentLineWidth = wordWidth;
            } else {
                currentLineWidth += separatorWidth + wordWidth;
            }
        });

        return totalLines + paragraphLines;
    }, 0);
}

function getTableRowBorder(row) {
    for (let column = 1; column <= 9; column += 1) {
        const border = row.getCell(column).border;
        if (border && Object.keys(border).length) return border;
    }

    return {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };
}

function applyCellAlignment(cell, alignment) {
    cell.alignment = {
        ...(cell.alignment || {}),
        ...alignment
    };
}

function setCellNumberFormat(cell, numFmt) {
    cell.style = cloneStyle(cell.style) || {};
    cell.numFmt = numFmt;
}

function applyOrderTableRowLayout(row, name) {
    const baseHeight = row.height || 18;

    applyCellAlignment(row.getCell("B"), { horizontal: "left", vertical: "top", wrapText: true, shrinkToFit: false, indent: 0 });
    applyCellAlignment(row.getCell("C"), { horizontal: "left", vertical: "top", wrapText: true, shrinkToFit: false, indent: 0 });

    const lineCount = Math.min(4, estimateWrappedLineCount(name, getMergedNameCapacity(row)));
    const rowHeightByLines = {
        1: baseHeight,
        2: Math.max(baseHeight, 30),
        3: Math.max(baseHeight, 42),
        4: Math.max(baseHeight, 54)
    };
    row.height = rowHeightByLines[lineCount] || rowHeightByLines[4];

    const referenceBorder = getTableRowBorder(row);
    for (let column = 1; column <= 9; column += 1) {
        const cell = row.getCell(column);
        if (!cell.border || !Object.keys(cell.border).length) {
            cell.border = cloneStyle(referenceBorder);
        }
    }

    setCellNumberFormat(row.getCell("A"), "0");
    applyCellAlignment(row.getCell("A"), { horizontal: "right", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("D"), { horizontal: "right", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("E"), { horizontal: "left", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("F"), { horizontal: "right", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("G"), { horizontal: "right", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("H"), { horizontal: "right", vertical: "middle", wrapText: false });
    applyCellAlignment(row.getCell("I"), { horizontal: "right", vertical: "middle", wrapText: false });
}

function setMergedRowValue(sheet, rowNumber, cell, value) {
    sheet.getCell(`${cell}${rowNumber}`).value = value;
}

function safeExcelFilename(value) {
    return String(value || "Заказ").replace(/[\\/:*?"<>|]+/g, "-");
}

function setExcelHeaders(res, filename) {
    const encoded = encodeURIComponent(filename);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encoded}`);
}

function canManageOrder(user, order) {
    return user.role === "admin" || Number(order.manager_id) === Number(user.id);
}

function canViewOrder(user, order) {
    if (user.role === "admin") return true;
    if (Number(order.manager_id) === Number(user.id)) return true;
    return !order.deleted_at && order.status === "Новая" && !order.manager_id;
}

function ownsOrder(user, order) {
    return Number(order.manager_id) === Number(user.id);
}

function isClosedStatus(status) {
    return ["Завершена", "Отменена"].includes(status);
}

const orderConflictMessage = "Заявка была изменена другим пользователем.";

function getExpectedUpdatedAt(req) {
    return normalizeText(req.body?.updatedAt || req.get("x-order-updated-at"));
}

function hasOrderConflict(req, order) {
    const expectedUpdatedAt = getExpectedUpdatedAt(req);
    return Boolean(expectedUpdatedAt && order?.updated_at && expectedUpdatedAt !== order.updated_at);
}

function sendOrderConflict(res) {
    res.status(409).json({ success: false, message: orderConflictMessage });
}

async function createOrderEvent({ orderId, userId = null, userName = "Система", eventType, message, transaction = { run } }) {
    await transaction.run(
        `INSERT INTO order_events (order_id, user_id, user_name, event_type, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, userId, userName, eventType, message, new Date().toISOString()]
    );
}

function normalizeOrderEvent(row) {
    return {
        id: row.id,
        orderId: row.order_id,
        userId: row.user_id || null,
        userName: row.user_name || null,
        eventType: row.event_type,
        message: row.message,
        createdAt: row.created_at
    };
}

function canAddOrderNote(user, order) {
    if (user.role === "admin") return true;
    if (!order.manager_id) return true;
    return Number(order.manager_id) === Number(user.id);
}

async function deleteOrder(req, res) {
    try {
        const order = await get("SELECT id, manager_id, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
            res.status(404).json({ success: false, message: "Заявка не найдена" });
            return;
        }

        if (order.deleted_at) {
            res.status(400).json({ success: false, message: "Заявка уже удалена" });
            return;
        }

        if (!canManageOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        const now = new Date().toISOString();
        const result = await run(
            `UPDATE orders
             SET deleted_at = ?, deleted_by_id = ?, deleted_by_name = ?, updated_at = ?
             WHERE id = ? AND deleted_at IS NULL`,
            [now, req.session.user.id, req.session.user.name, now, req.params.id]
        );

        if (!result.changes) {
            res.status(404).json({ success: false, message: "Заявка не найдена" });
            return;
        }

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "deleted",
            message: "Заявка перемещена в удаленные"
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Order delete error:", error);
        res.status(500).json({ success: false, message: "Не удалось удалить заявку." });
    }
}

async function restoreOrder(req, res) {
    try {
        const order = await get("SELECT id, manager_id, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
            res.status(404).json({ success: false, message: "Заявка не найдена" });
            return;
        }

        if (!order.deleted_at) {
            res.status(400).json({ success: false, message: "Заявка не удалена" });
            return;
        }

        if (!canManageOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        const now = new Date().toISOString();
        await run(
            "UPDATE orders SET deleted_at = NULL, deleted_by_id = NULL, deleted_by_name = NULL, updated_at = ? WHERE id = ?",
            [now, req.params.id]
        );

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "restored",
            message: "Заявка восстановлена"
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Order restore error:", error);
        res.status(500).json({ success: false, message: "Не удалось восстановить заявку." });
    }
}

router.post("/", async (req, res) => {
    try {
        const customerName = readOrderText(req.body, "customerName", 160, true);
        const phone = readOrderText(req.body, "phone", 50, true);
        const requestedItems = normalizeRequestedItems(req.body.items);
        const safeBody = {
            preferredContactMethod: readOrderText(req.body, "preferredContactMethod", 50),
            preferredContactValue: readOrderText(req.body, "preferredContactValue", 200),
            telegram: readOrderText(req.body, "telegram", 200),
            maxContact: readOrderText(req.body, "maxContact", 200)
        };
        const address = readOrderText(req.body, "address", 500);
        const unloading = readOrderText(req.body, "unloading", 100);
        const paymentMethod = readOrderText(req.body, "paymentMethod", 100);
        const comment = readOrderText(req.body, "comment", 2000);
        const now = new Date().toISOString();
        const preferredContact = getFallbackPreferredContact(safeBody, phone);
        const createdOrder = await withTransaction(async transaction => {
            const serverOrder = await buildServerOrderItems(transaction, requestedItems);
            const clientId = await findOrCreateClient({
                customerName,
                phone,
                preferredContact,
                totalPrice: serverOrder.totalPrice,
                now,
                transaction
            });
            const result = await transaction.run(
                `INSERT INTO orders (
                    customer_name, phone, client_id, telegram, max_contact,
                    preferred_contact_method, preferred_contact_value, address,
                    unloading, payment_method, comment, items_json, total_price,
                    total_weight, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    customerName,
                    phone,
                    clientId,
                    safeBody.telegram,
                    safeBody.maxContact,
                    preferredContact.method,
                    preferredContact.value,
                    address,
                    unloading,
                    normalizePaymentMethod(paymentMethod),
                    comment,
                    JSON.stringify(serverOrder.items),
                    serverOrder.totalPrice,
                    serverOrder.totalWeight,
                    "Новая",
                    now,
                    now
                ]
            );
            const orderNumber = getOrderNumber(result.id, now);
            await transaction.run("UPDATE orders SET order_number = ? WHERE id = ?", [orderNumber, result.id]);
            await createOrderEvent({
                orderId: result.id,
                userName: "Клиент",
                eventType: "created",
                message: "Заявка создана клиентом",
                transaction
            });
            return { id: result.id, orderNumber, ...serverOrder };
        });

        res.status(201).json({
            success: true,
            id: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            totalPrice: createdOrder.totalPrice,
            totalWeight: createdOrder.totalWeight,
            itemCount: createdOrder.items.length
        });
    } catch (error) {
        if (error instanceof PublicOrderError) {
            res.status(error.status).json({ success: false, code: error.code, message: error.message });
            return;
        }
        console.error("Order create error:", error);
        res.status(500).json({ success: false, message: "Не удалось сохранить заказ." });
    }
});

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const showDeleted = req.query.deleted === "true";
        const showMine = req.query.mine === "true";
        const requestedStatus = allowedStatuses.includes(req.query.status) ? req.query.status : "";
        const paginationParams = getPaginationParams(req.query);
        const params = [];
        let where = "orders.deleted_at IS NULL";

        if (showMine) {
            where = "orders.deleted_at IS NULL AND orders.manager_id = ?";
            params.push(req.session.user.id);
        } else if (req.session.user.role === "admin") {
            where = `orders.deleted_at IS ${showDeleted ? "NOT NULL" : "NULL"}`;
        } else if (showDeleted) {
            where = "orders.deleted_at IS NOT NULL AND orders.manager_id = ?";
            params.push(req.session.user.id);
        } else {
            where = `orders.deleted_at IS NULL
                AND (
                    (orders.status = ? AND orders.manager_id IS NULL)
                    OR orders.manager_id = ?
                )`;
            params.push("Новая", req.session.user.id);
        }
        if (requestedStatus && !showDeleted) {
            where = `(${where}) AND orders.status = ?`;
            params.push(requestedStatus);
        }

        const orderBy = showDeleted
            ? "datetime(orders.deleted_at) DESC, orders.id DESC"
            : "datetime(orders.created_at) DESC, orders.id DESC";
        const [countRow, rows, statsRows] = await Promise.all([
            get(`SELECT COUNT(*) AS total FROM orders WHERE ${where}`, params),
            all(`
            SELECT
                orders.*,
                users.name AS manager_name,
                clients.orders_count AS client_orders_count,
                clients.total_spent AS client_total_spent,
                clients.last_order_at AS client_last_order_at
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            LEFT JOIN clients ON clients.id = orders.client_id
            WHERE ${where}
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [...params, paginationParams.limit, paginationParams.offset]),
            all(`
                SELECT status, COUNT(*) AS count
                FROM orders
                WHERE deleted_at IS NULL
                GROUP BY status
            `)
        ]);
        const normalizedOrders = rows.map(normalizeOrder);
        const statsByStatus = new Map(statsRows.map(row => [row.status, Number(row.count) || 0]));
        res.json({
            success: true,
            orders: normalizedOrders,
            items: normalizedOrders,
            pagination: buildPaginationMeta({ ...paginationParams, total: countRow?.total }),
            stats: {
                total: statsRows.reduce((sum, row) => sum + (Number(row.count) || 0), 0),
                new: statsByStatus.get(allowedStatuses[0]) || 0,
                work: statsByStatus.get(allowedStatuses[1]) || 0
            }
        });
    } catch (error) {
        console.error("Orders list error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить заявки." });
    }
});

router.get("/:id/events", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id, manager_id, status, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canViewOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        const rows = await all(
            `SELECT id, order_id, user_id, user_name, event_type, message, created_at
             FROM order_events
             WHERE order_id = ?
             ORDER BY datetime(created_at) ASC, id ASC`,
            [req.params.id]
        );

        res.json({ success: true, events: rows.map(normalizeOrderEvent) });
    } catch (error) {
        console.error("Order events read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить историю заявки." });
    }
});

router.post("/:id/notes", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const message = normalizeText(req.body.message);

        if (message.length < 2 || message.length > 1000) {
            res.status(400).json({ success: false, message: "Заметка должна быть от 2 до 1000 символов." });
            return;
        }

        const order = await get("SELECT id, manager_id, status, deleted_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order || order.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canAddOrderNote(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Нельзя добавить заметку к чужой заявке." });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "note",
            message
        });
        await run(
            "UPDATE orders SET updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [new Date().toISOString(), req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Order note create error:", error);
        res.status(500).json({ success: false, message: "Не удалось сохранить заметку." });
    }
});

router.delete("/:id", requireRole(["admin", "manager"]), deleteOrder);
router.post("/:id/restore", requireRole(["admin", "manager"]), restoreOrder);

router.get("/:id/export/excel", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const row = await get(`
            SELECT
                orders.*,
                users.name AS manager_name,
                clients.orders_count AS client_orders_count,
                clients.total_spent AS client_total_spent,
                clients.last_order_at AS client_last_order_at
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            LEFT JOIN clients ON clients.id = orders.client_id
            WHERE orders.id = ?
        `, [req.params.id]);

        if (!row || row.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canViewOrder(req.session.user, row)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        const order = normalizeOrder(row);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(orderTemplatePath);
        workbook.calcProperties.fullCalcOnLoad = true;

        const sheet = workbook.worksheets[0];
        const items = Array.isArray(order.items) ? order.items : [];
        const includeUnloading = hasOrderUnloading(order.unloading);
        const tableRowsCount = items.length + 1 + (includeUnloading ? 1 : 0);
        const templateTableRowsCount = 3;
        const tableStartRow = 8;
        const summaryTemplateRow = 11;

        unmergeRowsFrom(sheet, tableStartRow);

        if (tableRowsCount > templateTableRowsCount) {
            const insertCount = tableRowsCount - templateTableRowsCount;
            for (let index = 0; index < insertCount; index += 1) {
                const insertAt = summaryTemplateRow + index;
                sheet.insertRow(insertAt, []);
                copyRowStyle(sheet.getRow(tableStartRow), sheet.getRow(insertAt));
            }
        } else if (tableRowsCount < templateTableRowsCount) {
            const deleteCount = templateTableRowsCount - tableRowsCount;
            for (let index = 0; index < deleteCount; index += 1) {
                const deleteAt = tableStartRow + tableRowsCount;
                sheet.spliceRows(deleteAt, 1);
            }
        }

        restoreOrderTemplateMerges(sheet, tableRowsCount);

        const summaryRow = tableStartRow + tableRowsCount;
        const technicalRow = summaryRow + 1;
        const paymentRow = summaryRow + 2;
        const amountTextRow = summaryRow + 4;
        const lastTableRow = summaryRow - 1;
        const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
        const dateText = new Intl.DateTimeFormat("ru-RU").format(createdAt);

        sheet.getCell("A2").value = `${dateText} Товарный чек № ${sanitizeExcelText(order.orderNumber || order.id)}`;
        sheet.getCell("A4").value = `Адрес доставки: ${sanitizeExcelText(order.address) || "не указан"}`;
        sheet.getCell("A6").value = `Заказчик: ${sanitizeExcelText(order.customerName)}${order.phone ? `, ${sanitizeExcelText(order.phone)}` : ""}`;

        const tableRows = items.map((item, index) => {
            const qty = parseExcelNumber(item.qty);
            const price = ceilMoney(parseExcelNumber(item.price));
            const unitWeight = ceilWeight(parseExcelNumber(item.weight || (qty ? parseExcelNumber(item.lineWeight) / qty : 0)));
            const weight = ceilWeight(unitWeight * qty);

            return {
                number: index + 1,
                name: sanitizeExcelText(item.name),
                qty,
                unit: sanitizeExcelText(item.unit || "шт"),
                unitWeight,
                weight,
                price
            };
        });

        tableRows.push({
            number: tableRows.length + 1,
            name: "Доставка",
            qty: 1,
            unit: "шт",
            unitWeight: 0,
            weight: 0,
            price: 0
        });

        if (includeUnloading) {
            tableRows.push({
                number: tableRows.length + 1,
                name: "Разгрузка",
                qty: 1,
                unit: "шт",
                unitWeight: 0,
                weight: 0,
                price: 0
            });
        }

        const totalPrice = ceilMoney(tableRows.reduce((sum, item) => sum + ceilMoney(item.price * item.qty), 0));
        const totalWeight = ceilWeight(tableRows.reduce((sum, item) => sum + item.weight, 0));

        tableRows.forEach((item, index) => {
            const rowNumber = tableStartRow + index;
            const row = sheet.getRow(rowNumber);

            setMergedRowValue(sheet, rowNumber, "A", item.number);
            setMergedRowValue(sheet, rowNumber, "B", item.name);
            setMergedRowValue(sheet, rowNumber, "D", item.qty);
            setMergedRowValue(sheet, rowNumber, "E", item.unit);
            if (item.unitWeight) {
                setFormula(sheet.getCell(`F${rowNumber}`), `ROUNDUP(D${rowNumber}*${getExcelFormulaNumber(item.unitWeight, 3)},3)`, item.weight);
            } else {
                setMergedRowValue(sheet, rowNumber, "F", 0);
            }
            setMergedRowValue(sheet, rowNumber, "H", item.price);
            setFormula(sheet.getCell(`I${rowNumber}`), `ROUNDUP(H${rowNumber}*D${rowNumber},2)`, ceilMoney(item.price * item.qty));

            applyOrderTableRowLayout(row, item.name);
            setCellNumberFormat(row.getCell("D"), "0.00");
            setCellNumberFormat(row.getCell("F"), "0.000");
            setCellNumberFormat(row.getCell("H"), "#,##0.00");
            setCellNumberFormat(row.getCell("I"), "#,##0.00");
        });

        setFormula(sheet.getCell(`I${summaryRow}`), `ROUNDUP(SUM(I${tableStartRow}:I${lastTableRow}),2)`, totalPrice);
        sheet.getCell(`I${summaryRow}`).numFmt = "#,##0.00";
        sheet.getCell(`I${technicalRow}`).value = null;
        sheet.getRow(technicalRow).height = 3;
        sheet.getCell(`D${paymentRow}`).value = "Вес товара (кг):";
        setFormula(sheet.getCell(`I${paymentRow}`), `ROUNDUP(SUM(F${tableStartRow}:F${lastTableRow}),3)`, totalWeight);
        sheet.getCell(`I${paymentRow}`).numFmt = "0.000";
        sheet.getCell(`A${paymentRow}`).value = `* Форма оплаты: ${normalizePaymentMethodForExport(order.paymentMethod)}`;
        sheet.getCell(`A${amountTextRow}`).value = `Сумма к оплате: ${formatMoneyValue(totalPrice)} рублей. Без НДС.`;

        const filename = `${safeExcelFilename(`Заказ-${order.orderNumber || order.id}`)}.xlsx`;
        setExcelHeaders(res, filename);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Order export error:", error);
        res.status(500).json({ success: false, message: "Не удалось сформировать заказ Excel." });
    }
});

router.get("/:id", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const row = await get(`
            SELECT
                orders.*,
                users.name AS manager_name,
                clients.orders_count AS client_orders_count,
                clients.total_spent AS client_total_spent,
                clients.last_order_at AS client_last_order_at
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            LEFT JOIN clients ON clients.id = orders.client_id
            WHERE orders.id = ? AND orders.deleted_at IS NULL
        `, [req.params.id]);

        if (!row) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canViewOrder(req.session.user, row)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        res.json({ success: true, order: normalizeOrder(row) });
    } catch (error) {
        console.error("Order read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить заявку." });
    }
});

router.post("/:id/take", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id, manager_id, status, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order || order.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (isClosedStatus(order.status)) {
            res.status(400).json({ success: false, message: "Завершенную или отмененную заявку нельзя взять в работу." });
            return;
        }

        if (order.manager_id) {
            res.status(409).json({ success: false, message: "Заявка уже находится в работе." });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        const now = new Date().toISOString();
        const result = await run(
            `UPDATE orders
             SET manager_id = ?, taken_at = ?, status = ?, updated_at = ?
             WHERE id = ? AND manager_id IS NULL AND deleted_at IS NULL`,
            [req.session.user.id, now, "В работе", now, req.params.id]
        );

        if (!result.changes) {
            res.status(409).json({ success: false, message: "Заявка уже находится в работе." });
            return;
        }

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "taken",
            message: "Заявка взята в работу"
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Order take error:", error);
        res.status(500).json({ success: false, message: "Не удалось взять заявку в работу." });
    }
});

router.post("/:id/release", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id, manager_id, status, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order || order.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canManageOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        await run(
            `UPDATE orders
             SET manager_id = NULL, taken_at = NULL, status = ?, updated_at = ?
             WHERE id = ? AND deleted_at IS NULL`,
            ["Новая", new Date().toISOString(), req.params.id]
        );

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "released",
            message: "Заявка освобождена"
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Order release error:", error);
        res.status(500).json({ success: false, message: "Не удалось освободить заявку." });
    }
});

router.patch("/:id/status", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const status = normalizeText(req.body.status);

        if (!allowedStatuses.includes(status)) {
            res.status(400).json({ success: false, message: "Недопустимый статус заявки." });
            return;
        }

        const order = await get("SELECT id, manager_id, status, deleted_at, updated_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order || order.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!order.manager_id) {
            res.status(400).json({ success: false, message: "Сначала возьмите заявку в работу." });
            return;
        }

        if (!ownsOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        if (hasOrderConflict(req, order)) {
            sendOrderConflict(res);
            return;
        }

        const result = await run(
            "UPDATE orders SET status = ?, closed_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [
                status,
                isClosedStatus(status) ? new Date().toISOString() : null,
                new Date().toISOString(),
                req.params.id
            ]
        );

        if (!result.changes) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (order.status !== status) {
            await createOrderEvent({
                orderId: req.params.id,
                userId: req.session.user.id,
                userName: req.session.user.name,
                eventType: "status_changed",
                message: `Статус изменен: ${order.status} → ${status}`
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Order status update error:", error);
        res.status(500).json({ success: false, message: "Не удалось обновить статус." });
    }
});

module.exports = router;
