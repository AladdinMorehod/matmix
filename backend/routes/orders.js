const express = require("express");
const { all, get, run } = require("../database");
const { requireRole } = require("../middleware/auth");

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

function normalizeOrder(row) {
    if (!row) return null;

    return {
        id: row.id,
        customerName: row.customer_name,
        phone: row.phone,
        telegram: row.telegram || "",
        maxContact: row.max_contact || "",
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
        const result = await run(
            `INSERT INTO orders (
                customer_name,
                phone,
                telegram,
                max_contact,
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customerName,
                phone,
                normalizeText(req.body.telegram),
                normalizeText(req.body.maxContact),
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

        res.status(201).json({ success: true, id: result.id });
    } catch (error) {
        console.error("Order create error:", error);
        res.status(500).json({ success: false, message: "Не удалось сохранить заказ." });
    }
});

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const rows = await all(`
            SELECT orders.*, users.name AS manager_name
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            ORDER BY datetime(orders.created_at) DESC, orders.id DESC
        `);
        res.json({ success: true, orders: rows.map(normalizeOrder) });
    } catch (error) {
        console.error("Orders list error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить заявки." });
    }
});

router.get("/:id", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const row = await get(`
            SELECT orders.*, users.name AS manager_name
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            WHERE orders.id = ?
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
        const order = await get("SELECT id, manager_id, status FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
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
             WHERE id = ? AND manager_id IS NULL`,
            [req.session.user.id, now, "В работе", now, req.params.id]
        );

        if (!result.changes) {
            res.status(409).json({ success: false, message: "Заявка уже находится в работе." });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Order take error:", error);
        res.status(500).json({ success: false, message: "Не удалось взять заявку в работу." });
    }
});

router.post("/:id/release", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const order = await get("SELECT id, manager_id, status FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
            res.status(404).json({ success: false, message: "Заявка не найдена." });
            return;
        }

        if (!canManageOrder(req.session.user, order)) {
            res.status(403).json({ success: false, message: "Недостаточно прав" });
            return;
        }

        if (isClosedStatus(order.status)) {
            res.status(400).json({ success: false, message: "Завершенную или отмененную заявку нельзя освободить." });
            return;
        }

        await run(
            `UPDATE orders
             SET manager_id = NULL, taken_at = NULL, status = ?, updated_at = ?
             WHERE id = ?`,
            ["Новая", new Date().toISOString(), req.params.id]
        );

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

        const order = await get("SELECT id, manager_id FROM orders WHERE id = ?", [req.params.id]);

        if (!order) {
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
            "UPDATE orders SET status = ?, closed_at = ?, updated_at = ? WHERE id = ?",
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

        res.json({ success: true });
    } catch (error) {
        console.error("Order status update error:", error);
        res.status(500).json({ success: false, message: "Не удалось обновить статус." });
    }
});

module.exports = router;
