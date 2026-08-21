const webpush = require("web-push");

const PUSH_ENV = Object.freeze({
    enabled: "MATMIX_WEB_PUSH_ENABLED",
    publicKey: "MATMIX_WEB_PUSH_VAPID_PUBLIC_KEY",
    privateKey: "MATMIX_WEB_PUSH_VAPID_PRIVATE_KEY",
    subject: "MATMIX_WEB_PUSH_VAPID_SUBJECT"
});

const PUSH_STATUSES = Object.freeze(["pending", "processing", "sent", "retry", "failed"]);
const PUSH_ROLES = Object.freeze(["admin", "manager"]);

function isEnabled(env = process.env) {
    return String(env[PUSH_ENV.enabled] || "false").trim().toLowerCase() === "true";
}

function loadWebPushConfig(env = process.env) {
    const enabled = isEnabled(env);
    const config = { enabled, publicKey: String(env[PUSH_ENV.publicKey] || "").trim(), subject: String(env[PUSH_ENV.subject] || "").trim() };
    if (!enabled) return { ...config, privateKey: "" };
    const privateKey = String(env[PUSH_ENV.privateKey] || "").trim();
    if (!config.publicKey || !privateKey || !config.subject) throw new Error("Web Push VAPID configuration is required when MATMIX_WEB_PUSH_ENABLED=true.");
    if (!/^https:\/\/|^mailto:/i.test(config.subject)) throw new Error("Web Push VAPID subject must be an https URL or mailto address.");
    return { ...config, privateKey };
}

function ensureWebPushConfig(config) {
    if (config.enabled) webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
    return config;
}

async function ensureWebPushSchema({ run }) {
    await run(`CREATE TABLE IF NOT EXISTS web_push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_failure_at TEXT,
        last_error TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    await run("CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_active ON web_push_subscriptions(user_id, is_active, id)");
    await run(`CREATE TABLE IF NOT EXISTS web_push_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL UNIQUE,
        order_id INTEGER NOT NULL,
        subscription_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','retry','failed')),
        attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (typeof(attempt_count)='integer' AND attempt_count >= 0),
        next_attempt_at TEXT NOT NULL,
        last_error TEXT,
        sent_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES web_push_subscriptions(id) ON DELETE CASCADE
    )`);
    await run("CREATE INDEX IF NOT EXISTS idx_web_push_outbox_status_next_attempt ON web_push_outbox(status, next_attempt_at, id)");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_web_push_outbox_order_subscription ON web_push_outbox(order_id, subscription_id)");
}

function createWebPushRepository(executor) {
    return {
        async enqueueForOrder(orderId, now) {
            const subscriptions = await executor.all("SELECT s.id FROM web_push_subscriptions s JOIN users u ON u.id=s.user_id WHERE s.is_active=1 AND u.is_active=1 AND u.deleted_at IS NULL AND u.role IN ('admin','manager')");
            for (const subscription of subscriptions) {
                const eventKey = `new_order:${Number(orderId)}:${Number(subscription.id)}`;
                await executor.run(`INSERT OR IGNORE INTO web_push_outbox
                    (event_key, order_id, subscription_id, status, attempt_count, next_attempt_at, created_at, updated_at)
                    VALUES (?, ?, ?, 'pending', 0, ?, ?, ?)`, [eventKey, orderId, subscription.id, now, now, now]);
            }
            return subscriptions.length;
        }
    };
}

function createPushPayload(order) {
    const orderId = Number(order.id);
    const eventId = Number.isSafeInteger(orderId) && orderId > 0 ? `order-${orderId}` : null;
    return JSON.stringify({
        title: `Новый заказ №${order.orderNumber || order.id}`,
        body: `Новый заказ на ${order.totalPrice || 0} ₽`,
        orderId,
        eventId,
        orderNumber: String(order.orderNumber || order.id),
        unreadCount: Number(order.unreadCount || 0)
    });
}

module.exports = {
    PUSH_ENV, PUSH_ROLES, PUSH_STATUSES, isEnabled, loadWebPushConfig, ensureWebPushConfig,
    ensureWebPushSchema, createWebPushRepository, createPushPayload
};
