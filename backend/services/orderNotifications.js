const { activeOrderVisibility, canViewOrder } = require("./orderAccess");

const NOTIFICATION_INDEXES = [
    "idx_order_notification_reads_order_id"
];

async function ensureOrderNotificationSchema({ run }) {
    await run(`
        CREATE TABLE IF NOT EXISTS order_notification_reads (
            user_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL,
            read_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, order_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);
    await run(`
        CREATE INDEX IF NOT EXISTS idx_order_notification_reads_order_id
        ON order_notification_reads(order_id)
    `);
}

async function getUnreadCount(database, user) {
    const visibility = activeOrderVisibility(user);
    const row = await database.get(
        `SELECT COUNT(*) AS count
         FROM orders
         LEFT JOIN order_notification_reads AS notification_read
           ON notification_read.user_id = ?
          AND notification_read.order_id = orders.id
         WHERE ${visibility.sql}
           AND notification_read.order_id IS NULL`,
        [user.id, ...visibility.params]
    );
    return Number(row?.count) || 0;
}

function createOrderNotificationService({ get, withTransaction }) {
    return {
        getUnreadCount(user) {
            return getUnreadCount({ get }, user);
        },

        markAllRead(user) {
            return withTransaction(async transaction => {
                const visibility = activeOrderVisibility(user);
                const now = new Date().toISOString();
                await transaction.run(
                    `INSERT OR IGNORE INTO order_notification_reads (
                        user_id, order_id, read_at
                     )
                     SELECT ?, orders.id, ?
                     FROM orders
                     WHERE ${visibility.sql}`,
                    [user.id, now, ...visibility.params]
                );
                return {
                    unreadCount: await getUnreadCount(transaction, user)
                };
            });
        },

        markOrderRead(user, orderId) {
            return withTransaction(async transaction => {
                const order = await transaction.get(
                    `SELECT id, manager_id, status, deleted_at
                     FROM orders
                     WHERE id = ? AND deleted_at IS NULL`,
                    [orderId]
                );
                if (!order || !canViewOrder(user, order)) return null;

                await transaction.run(
                    `INSERT OR IGNORE INTO order_notification_reads (
                        user_id, order_id, read_at
                     ) VALUES (?, ?, ?)`,
                    [user.id, order.id, new Date().toISOString()]
                );

                return {
                    orderId: order.id,
                    unreadCount: await getUnreadCount(transaction, user)
                };
            });
        }
    };
}

module.exports = {
    NOTIFICATION_INDEXES,
    createOrderNotificationService,
    ensureOrderNotificationSchema,
    getUnreadCount
};
