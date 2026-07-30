const express = require("express");
const { get, withTransaction } = require("../database");
const { requireRole } = require("../middleware/auth");
const { createOrderNotificationService } = require("../services/orderNotifications");

const router = express.Router();
const service = createOrderNotificationService({ get, withTransaction });
const requireCrmUser = requireRole(["admin", "manager"]);

router.get("/summary", requireCrmUser, async (req, res) => {
    try {
        res.json({
            unreadCount: await service.getUnreadCount(req.session.user)
        });
    } catch (error) {
        console.error("Order notification summary error:", error);
        res.status(500).json({
            success: false,
            message: "Не удалось загрузить уведомления о заказах."
        });
    }
});

router.post("/read-all", requireCrmUser, async (req, res) => {
    try {
        const result = await service.markAllRead(req.session.user);
        res.json({ success: true, unreadCount: result.unreadCount });
    } catch (error) {
        console.error("Order notification read-all error:", error);
        res.status(500).json({
            success: false,
            message: "Не удалось отметить уведомления прочитанными."
        });
    }
});

module.exports = router;
