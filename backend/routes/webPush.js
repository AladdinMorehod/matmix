const express = require("express");
const { withTransaction } = require("../database");
const { requireRole } = require("../middleware/auth");
const { isEnabled } = require("../services/webPush");

const router = express.Router();
const requireCrmUser = requireRole(["admin", "manager"]);

function validSubscription(body) {
    const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
    const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";
    const auth = typeof body?.keys?.auth === "string" ? body.keys.auth.trim() : "";
    if (!endpoint || endpoint.length > 2048 || !/^https:\/\//i.test(endpoint) || !p256dh || !auth || p256dh.length > 512 || auth.length > 512) return null;
    return { endpoint, p256dh, auth };
}

router.get("/config", requireCrmUser, (req, res) => {
    res.json({ enabled: isEnabled(), publicKey: isEnabled() ? String(process.env.MATMIX_WEB_PUSH_VAPID_PUBLIC_KEY || "").trim() : "" });
});

router.post("/subscriptions", requireCrmUser, async (req, res) => {
    if (!isEnabled()) return res.status(503).json({ success: false, code: "WEB_PUSH_DISABLED" });
    const subscription = validSubscription(req.body);
    if (!subscription) return res.status(400).json({ success: false, code: "INVALID_SUBSCRIPTION" });
    const now = new Date().toISOString();
    try {
        const result = await withTransaction(async transaction => {
            const existing = await transaction.get("SELECT id, user_id FROM web_push_subscriptions WHERE endpoint=?", [subscription.endpoint]);
            if (existing && Number(existing.user_id) !== Number(req.session.user.id)) return { conflict: true };
            if (existing) {
                await transaction.run("UPDATE web_push_subscriptions SET p256dh=?, auth=?, is_active=1, last_error=NULL, updated_at=? WHERE id=? AND user_id=?", [subscription.p256dh, subscription.auth, now, existing.id, req.session.user.id]);
                return { id: existing.id };
            }
            const inserted = await transaction.run("INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", [req.session.user.id, subscription.endpoint, subscription.p256dh, subscription.auth, now, now]);
            return { id: inserted.id };
        });
        if (result.conflict) return res.status(409).json({ success: false, code: "SUBSCRIPTION_OWNERSHIP_CONFLICT" });
        res.json({ success: true, active: true });
    } catch (error) { res.status(500).json({ success: false, code: "SUBSCRIPTION_SAVE_FAILED" }); }
});

router.delete("/subscriptions", requireCrmUser, async (req, res) => {
    const endpoint = typeof req.body?.endpoint === "string" ? req.body.endpoint.trim() : "";
    if (!endpoint || endpoint.length > 2048) return res.status(400).json({ success: false, code: "INVALID_ENDPOINT" });
    await withTransaction(transaction => transaction.run("UPDATE web_push_subscriptions SET is_active=0, updated_at=? WHERE endpoint=? AND user_id=?", [new Date().toISOString(), endpoint, req.session.user.id]));
    res.json({ success: true });
});

module.exports = router;
