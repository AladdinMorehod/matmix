const express = require("express");
const { all, get } = require("../database");
const { requireRole } = require("../middleware/auth");
const { getPaginationParams, buildPaginationMeta } = require("../utils/pagination");

const router = express.Router();

function normalizeSearchText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeSqlLike(value) {
    return String(value || "").replace(/[\\%_]/g, char => `\\${char}`);
}

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
        const paginationParams = getPaginationParams(req.query);
        const params = [];
        const where = [];
        const search = normalizeSearchText(req.query.search);

        if (search) {
            const like = `%${escapeSqlLike(search)}%`;
            const digits = String(search).replace(/\D/g, "");
            where.push(`(
                LOWER(COALESCE(name, '')) LIKE ? ESCAPE '\\'
                OR LOWER(COALESCE(phone, '')) LIKE ? ESCAPE '\\'
                OR LOWER(COALESCE(email, '')) LIKE ? ESCAPE '\\'
                OR LOWER(COALESCE(telegram, '')) LIKE ? ESCAPE '\\'
                ${digits ? "OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), '+', ''), ' ', ''), '(', ''), ')', ''), '-', '') LIKE ?" : ""}
            )`);
            params.push(like, like, like, like);
            if (digits) params.push(`%${digits}%`);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const [countRow, rows, statsRow] = await Promise.all([
            get(`SELECT COUNT(*) AS total FROM clients ${whereSql}`, params),
            all(`
            SELECT *
            FROM clients
            ${whereSql}
            ORDER BY datetime(last_order_at) DESC, id DESC
            LIMIT ? OFFSET ?
        `, [...params, paginationParams.limit, paginationParams.offset]),
            get(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN orders_count > 1 THEN 1 ELSE 0 END) AS repeat_clients,
                    SUM(COALESCE(total_spent, 0)) AS total_spent
                FROM clients
                ${whereSql}
            `, params)
        ]);

        const clients = rows.map(normalizeClient);
        res.json({
            success: true,
            clients,
            items: clients,
            pagination: buildPaginationMeta({ ...paginationParams, total: countRow?.total }),
            stats: {
                total: Number(statsRow?.total) || 0,
                repeat: Number(statsRow?.repeat_clients) || 0,
                totalSpent: Number(statsRow?.total_spent) || 0
            }
        });
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
        const paginationParams = getPaginationParams(req.query);
        const client = await get("SELECT id FROM clients WHERE id = ?", [req.params.id]);

        if (!client) {
            res.status(404).json({ success: false, message: "Клиент не найден." });
            return;
        }

        const [countRow, rows] = await Promise.all([
            get(`
                SELECT COUNT(*) AS total
                FROM orders
                WHERE client_id = ?
                  AND deleted_at IS NULL
            `, [req.params.id]),
            all(`
            SELECT orders.*, users.name AS manager_name
            FROM orders
            LEFT JOIN users ON users.id = orders.manager_id
            WHERE orders.client_id = ?
              AND orders.deleted_at IS NULL
            ORDER BY datetime(orders.created_at) DESC, orders.id DESC
            LIMIT ? OFFSET ?
        `, [req.params.id, paginationParams.limit, paginationParams.offset])
        ]);

        const orders = rows.map(normalizeClientOrder);
        res.json({
            success: true,
            orders,
            items: orders,
            pagination: buildPaginationMeta({ ...paginationParams, total: countRow?.total })
        });
    } catch (error) {
        console.error("Client orders read error:", error);
        res.status(500).json({ success: false, message: "Не удалось загрузить историю заказов клиента." });
    }
});

module.exports = router;
