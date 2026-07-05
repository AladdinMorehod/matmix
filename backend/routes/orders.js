const express = require("express");
const { all, get, run, getOrderNumber } = require("../database");
const { requireRole } = require("../middleware/auth");
const { normalizePhone } = require("../utils/phone");

const router = express.Router();

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

function normalizePreferredContactMethod(value) {
    const method = normalizeText(value);
    const allowedMethods = ["Телефон", "WhatsApp", "Telegram", "MAX", "Почта"];

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
        value: phone
    };
}

function getClientContactFields(method, value, phone) {
    return {
        email: method === "Почта" ? value : "",
        telegram: method === "Telegram" ? value : "",
        maxContact: method === "MAX" ? value : "",
        whatsapp: method === "WhatsApp" ? (value || phone) : ""
    };
}

async function findOrCreateClient({ customerName, phone, preferredContact, totalPrice, now }) {
    const normalizedPhone = normalizePhone(phone);
    const contactFields = getClientContactFields(preferredContact.method, preferredContact.value, phone);
    const existingClient = await get("SELECT * FROM clients WHERE phone = ?", [normalizedPhone]);

    if (existingClient) {
        await run(
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

    const result = await run(
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
        paymentMethod: row.payment_method || "",
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
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function canManageOrder(user, order) {
    return user.role === "admin" || Number(order.manager_id) === Number(user.id);
}

function ownsOrder(user, order) {
    return Number(order.manager_id) === Number(user.id);
}

function isClosedStatus(status) {
    return ["Завершена", "Отменена"].includes(status);
}

async function createOrderEvent({ orderId, userId = null, userName = "Система", eventType, message }) {
    await run(
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
        const order = await get("SELECT id, manager_id, deleted_at FROM orders WHERE id = ?", [req.params.id]);

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

        const now = new Date().toISOString();
        const result = await run(
            "UPDATE orders SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
            [now, now, req.params.id]
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
        const order = await get("SELECT id, manager_id, deleted_at FROM orders WHERE id = ?", [req.params.id]);

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

        const now = new Date().toISOString();
        await run(
            "UPDATE orders SET deleted_at = NULL, updated_at = ? WHERE id = ?",
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
        const customerName = normalizeText(req.body.customerName);
        const phone = normalizeText(req.body.phone);
        const items = Array.isArray(req.body.items) ? req.body.items : [];

        if (!customerName) {
            res.status(400).json({ success: false, message: "Укажите имя клиента." });
            return;
        }

        if (!phone) {
            res.status(400).json({ success: false, message: "Укажите телефон клиента." });
            return;
        }

        if (!items.length) {
            res.status(400).json({ success: false, message: "Корзина пуста." });
            return;
        }

        const now = new Date().toISOString();
        const preferredContact = getFallbackPreferredContact(req.body, phone);
        const clientId = await findOrCreateClient({
            customerName,
            phone,
            preferredContact,
            totalPrice: req.body.totalPrice,
            now
        });
        const result = await run(
            `INSERT INTO orders (
                customer_name,
                phone,
                client_id,
                telegram,
                max_contact,
                preferred_contact_method,
                preferred_contact_value,
                address,
                unloading,
                payment_method,
                comment,
                items_json,
                total_price,
                total_weight,
                status,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerName,
                phone,
                clientId,
                normalizeText(req.body.telegram),
                normalizeText(req.body.maxContact),
                preferredContact.method,
                preferredContact.value,
                normalizeText(req.body.address),
                normalizeText(req.body.unloading),
                normalizeText(req.body.paymentMethod),
                normalizeText(req.body.comment),
                JSON.stringify(items),
                Number(req.body.totalPrice) || 0,
                Number(req.body.totalWeight) || 0,
                "Новая",
                now,
                now
            ]
        );

        const orderNumber = getOrderNumber(result.id, now);
        await run(
            "UPDATE orders SET order_number = ? WHERE id = ?",
            [orderNumber, result.id]
        );

        await createOrderEvent({
            orderId: result.id,
            userName: "Клиент",
            eventType: "created",
            message: "Заявка создана клиентом"
        });

        res.status(201).json({ success: true, id: result.id });
    } catch (error) {
        console.error("Order create error:", error);
        res.status(500).json({ success: false, message: "Не удалось сохранить заказ." });
    }
});

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const showDeleted = req.query.deleted === "true";
        const rows = await all(`
            SELECT
                orders.*,
                users.name AS manager_name,
                clients.orders_count AS client_orders_count,
                clients.total_spent AS client_total_spent,
                clients.last_order_at AS client_last_order_at
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            LEFT JOIN clients ON clients.id = orders.client_id
            WHERE orders.deleted_at IS ${showDeleted ? "NOT NULL" : "NULL"}
            ORDER BY datetime(orders.created_at) DESC, orders.id DESC
        `);
        res.json({ success: true, orders: rows.map(normalizeOrder) });
    } catch (error) {
        console.error("Orders list error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить заявки." });
    }
});

router.get("/:id/events", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
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

        await createOrderEvent({
            orderId: req.params.id,
            userId: req.session.user.id,
            userName: req.session.user.name,
            eventType: "note",
            message
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Order note create error:", error);
        res.status(500).json({ success: false, message: "Не удалось сохранить заметку." });
    }
});

router.delete("/:id", requireRole(["admin", "manager"]), deleteOrder);
router.post("/:id/restore", requireRole(["admin", "manager"]), restoreOrder);

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

        res.json({ success: true, order: normalizeOrder(row) });
    } catch (error) {
        console.error("Order read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить заявку." });
    }
});

router.post("/:id/take", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id, manager_id, status, deleted_at FROM orders WHERE id = ?", [req.params.id]);

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
        const order = await get("SELECT id, manager_id, status, deleted_at FROM orders WHERE id = ?", [req.params.id]);

        if (!order || order.deleted_at) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canManageOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
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

        const order = await get("SELECT id, manager_id, status, deleted_at FROM orders WHERE id = ?", [req.params.id]);

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
