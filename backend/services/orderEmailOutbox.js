const OUTBOX_EVENT_TYPES = Object.freeze({
    NEW_ORDER: "new_order"
});

const OUTBOX_STATUSES = Object.freeze([
    "pending",
    "processing",
    "sent",
    "retry",
    "failed"
]);

const OUTBOX_INDEXES = Object.freeze([
    "idx_order_email_outbox_status_next_attempt"
]);

async function ensureOrderEmailOutboxSchema({ run }) {
    await run(`
        CREATE TABLE IF NOT EXISTS order_email_outbox (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_key TEXT NOT NULL UNIQUE,
            order_id INTEGER NOT NULL,
            event_type TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'sent', 'retry', 'failed')),
            attempt_count INTEGER NOT NULL DEFAULT 0
                CHECK (typeof(attempt_count) = 'integer' AND attempt_count >= 0),
            next_attempt_at TEXT NOT NULL,
            last_error TEXT,
            sent_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);
    await run(`
        CREATE INDEX IF NOT EXISTS idx_order_email_outbox_status_next_attempt
        ON order_email_outbox(status, next_attempt_at, id)
    `);
}

function positiveOrderId(value) {
    const orderId = Number(value);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        throw new TypeError("order_id must be a positive integer.");
    }
    return orderId;
}

function normalizeTimestamp(value) {
    const timestamp = value === undefined ? new Date().toISOString() : String(value || "").trim();
    if (!timestamp || timestamp.length > 64 || Number.isNaN(Date.parse(timestamp))) {
        throw new TypeError("created_at must be a valid timestamp.");
    }
    return timestamp;
}

function newOrderEventKey(orderId) {
    return `${OUTBOX_EVENT_TYPES.NEW_ORDER}:${positiveOrderId(orderId)}`;
}

function createOrderEmailOutboxRepository(executor) {
    if (!executor || typeof executor.run !== "function") {
        throw new TypeError("A database executor with run is required.");
    }

    return {
        async enqueueNewOrder(orderId, createdAt) {
            const safeOrderId = positiveOrderId(orderId);
            const now = normalizeTimestamp(createdAt);
            const eventKey = newOrderEventKey(safeOrderId);
            const result = await executor.run(
                `INSERT INTO order_email_outbox (
                    event_key, order_id, event_type, status, attempt_count,
                    next_attempt_at, last_error, sent_at, created_at, updated_at
                 ) VALUES (?, ?, ?, 'pending', 0, ?, NULL, NULL, ?, ?)`,
                [eventKey, safeOrderId, OUTBOX_EVENT_TYPES.NEW_ORDER, now, now, now]
            );
            return { id: result.id, eventKey, orderId: safeOrderId };
        }
    };
}

module.exports = {
    OUTBOX_EVENT_TYPES,
    OUTBOX_STATUSES,
    OUTBOX_INDEXES,
    ensureOrderEmailOutboxSchema,
    newOrderEventKey,
    createOrderEmailOutboxRepository
};
