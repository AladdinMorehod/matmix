const express = require("express");
const { all, get } = require("../database");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

function normalizeClient(row) {
    if (!row) return null;

    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        preferredContactMethod: row.preferred_contact_method || "",
        preferredContactValue: row.preferred_contact_value || "",
        email: row.email || "",
        telegram: row.telegram || "",
        maxContact: row.max_contact || "",
        whatsapp: row.whatsapp || "",
        ordersCount: row.orders_count || 0,
        totalSpent: row.total_spent || 0,
        lastOrderAt: row.last_order_at || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function normalizeClientOrder(row) {
    return {
        id: row.id,
        orderNumber: row.order_number || "",
        status: row.status,
        totalPrice: row.total_price || 0,
        totalWeight: row.total_weight || 0,
        managerId: row.manager_id || null,
        managerName: row.manager_name || null,
        createdAt: row.created_at
    };
}

router.get("/", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const rows = await all(`
            SELECT *
            FROM clients
            ORDER BY datetime(last_order_at) DESC, id DESC
        `);

        res.json({ success: true, clients: rows.map(normalizeClient) });
    } catch (error) {
        console.error("Clients list error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить клиентов." });
    }
});

router.get("/:id", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const row = await get("SELECT * FROM clients WHERE id = ?", [req.params.id]);

        if (!row) {
            res.status(404).json({ success: false, message: "Клиент не найден." });
            return;
        }

        res.json({ success: true, client: normalizeClient(row) });
    } catch (error) {
        console.error("Client read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить клиента." });
    }
});

router.get("/:id/orders", requireRole(["admin", "manager"]), async (req, res) => {
    try {
        const client = await get("SELECT id FROM clients WHERE id = ?", [req.params.id]);

        if (!client) {
            res.status(404).json({ success: false, message: "Клиент не найден." });
            return;
        }

        const rows = await all(`
            SELECT orders.*, users.name AS manager_name
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            WHERE orders.client_id = ?
              AND orders.deleted_at IS NULL
            ORDER BY datetime(orders.created_at) DESC, orders.id DESC
        `, [req.params.id]);

        res.json({ success: true, orders: rows.map(normalizeClientOrder) });
    } catch (error) {
        console.error("Client orders read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить историю заказов клиента." });
    }
});

module.exports = router;
