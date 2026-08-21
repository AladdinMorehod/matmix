const webpush = require("web-push");
const { createPushPayload } = require("./webPush");
const { getUnreadCount } = require("./orderNotifications");

const MAX_ATTEMPTS = 5;
const BATCH_LIMIT = 20;
const RETRY_BASE_MS = 60_000;
const STALE_PROCESSING_MS = 15 * 60 * 1000;

function sanitizeError(error) { return String(error?.message || error || "Unknown push error").replace(/[\r\n]+/g, " ").slice(0, 500); }
function nextAttempt(attempt) { return new Date(Date.now() + RETRY_BASE_MS * (2 ** Math.max(0, attempt - 1))).toISOString(); }

async function processWebPushOutbox({ databasePath, config, limit = BATCH_LIMIT, push = webpush }) {
    const { openDatabase } = require("../databaseMigrations");
    const db = await openDatabase(databasePath);
    const summary = { claimed: 0, sent: 0, retried: 0, failed: 0, disabled: 0 };
    try {
        if (!config.enabled) return summary;
        push.setVapidDetails(config.subject, config.publicKey, config.privateKey);
        const now = new Date().toISOString();
        const staleCutoff = new Date(Date.now() - STALE_PROCESSING_MS).toISOString();
        const rows = await db.all(`SELECT o.id, o.order_id, o.subscription_id, o.status, o.attempt_count,
                s.endpoint, s.p256dh, s.auth, s.is_active, s.user_id,
                u.role, u.is_active AS user_is_active, u.deleted_at AS user_deleted_at,
                ord.deleted_at, ord.order_number, ord.total_price
            FROM web_push_outbox o
            JOIN web_push_subscriptions s ON s.id=o.subscription_id
            JOIN users u ON u.id=s.user_id
            JOIN orders ord ON ord.id=o.order_id
            WHERE (o.status IN ('pending','retry') AND o.next_attempt_at <= ?)
               OR (o.status='processing' AND o.updated_at <= ?)
            ORDER BY o.id LIMIT ?`, [now, staleCutoff, limit]);
        for (const row of rows) {
            const invalidRecipient = !Number(row.is_active)
                || !Number(row.user_is_active)
                || row.user_deleted_at
                || !["admin", "manager"].includes(row.role)
                || row.deleted_at;
            if (invalidRecipient) {
                await db.run("UPDATE web_push_outbox SET status='failed', last_error=?, updated_at=? WHERE id=? AND status IN ('pending','retry','processing')", [
                    row.deleted_at ? "Order deleted." : "Recipient is no longer eligible.", now, row.id
                ]);
                summary.failed += 1;
                continue;
            }
            if (Number(row.attempt_count) >= MAX_ATTEMPTS) {
                await db.run("UPDATE web_push_outbox SET status='failed', last_error=?, updated_at=? WHERE id=? AND status IN ('pending','retry','processing')", ["Maximum attempts reached.", now, row.id]);
                summary.failed += 1;
                continue;
            }
            const claimed = await db.run(`UPDATE web_push_outbox
                SET status='processing', attempt_count=attempt_count+1, updated_at=?
                WHERE id=? AND ((status IN ('pending','retry') AND next_attempt_at <= ?)
                    OR (status='processing' AND updated_at <= ?))`, [now, row.id, now, staleCutoff]);
            if (!claimed.changes) continue;
            summary.claimed += 1;
            try {
                const unread = await getUnreadCount(db, { id: row.user_id, role: row.role });
                await push.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, createPushPayload({
                    ...row,
                    totalPrice: row.total_price,
                    unreadCount: Number(unread) || 0
                }));
                await db.run("UPDATE web_push_outbox SET status='sent', sent_at=?, updated_at=? WHERE id=? AND status='processing'", [new Date().toISOString(), new Date().toISOString(), row.id]);
                summary.sent += 1;
            } catch (error) {
                const message = sanitizeError(error); const permanent = Number(error?.statusCode) === 404 || Number(error?.statusCode) === 410;
                if (permanent) {
                    await db.run("UPDATE web_push_subscriptions SET is_active=0, last_failure_at=?, last_error=?, updated_at=? WHERE id=?", [new Date().toISOString(), message, new Date().toISOString(), row.subscription_id]);
                    await db.run("UPDATE web_push_outbox SET status='failed', last_error=?, updated_at=? WHERE id=?", [message, new Date().toISOString(), row.id]);
                    summary.disabled += 1;
                } else if (row.attempt_count + 1 >= MAX_ATTEMPTS) {
                    await db.run("UPDATE web_push_outbox SET status='failed', last_error=?, updated_at=? WHERE id=?", [message, new Date().toISOString(), row.id]);
                    summary.failed += 1;
                } else {
                    await db.run("UPDATE web_push_outbox SET status='retry', last_error=?, next_attempt_at=?, updated_at=? WHERE id=?", [message, nextAttempt(row.attempt_count + 1), new Date().toISOString(), row.id]);
                    summary.retried += 1;
                }
            }
        }
        return summary;
    } finally { await db.close(); }
}

module.exports = { MAX_ATTEMPTS, BATCH_LIMIT, processWebPushOutbox, sanitizeError };
