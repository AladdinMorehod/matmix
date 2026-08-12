const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("../sqlite");
const logger = require("./logger");
const { OUTBOX_EVENT_TYPES } = require("./orderEmailOutbox");
const { buildOrderEmail } = require("./orderEmailTemplate");

const DEFAULT_BATCH_LIMIT = 20;
const MAX_BATCH_LIMIT = 100;
const STALE_PROCESSING_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const BASE_RETRY_DELAY_MS = 60 * 1000;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60 * 1000;
const MAX_ERROR_LENGTH = 500;

function helpers(connection) {
    return {
        run(sql, params = []) {
            return new Promise((resolve, reject) => connection.run(sql, params, function done(error) {
                error ? reject(error) : resolve({ changes: this.changes, id: this.lastID });
            }));
        },
        get(sql, params = []) {
            return new Promise((resolve, reject) => connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
        },
        all(sql, params = []) {
            return new Promise((resolve, reject) => connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
        }
    };
}

async function openConnection(databasePath) {
    const connection = new sqlite3.Database(databasePath);
    await configureBusinessConnection(connection);
    return { connection, db: helpers(connection) };
}

async function closeConnection(connection) {
    await new Promise((resolve, reject) => connection.close(error => error ? reject(error) : resolve()));
}

async function withImmediateTransaction(databasePath, work) {
    const { connection, db } = await openConnection(databasePath);
    try {
        await db.run("BEGIN IMMEDIATE");
        try {
            const result = await work(db);
            await db.run("COMMIT");
            return result;
        } catch (error) {
            await db.run("ROLLBACK").catch(() => {});
            throw error;
        }
    } finally {
        await closeConnection(connection);
    }
}

function iso(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) throw new TypeError("Worker clock returned an invalid date.");
    return date.toISOString();
}

function retryDelayMs(attemptCount) {
    const safeAttempt = Math.max(1, Number(attemptCount) || 1);
    return Math.min(BASE_RETRY_DELAY_MS * (2 ** (safeAttempt - 1)), MAX_RETRY_DELAY_MS);
}

function sanitizeError(error, sensitiveValues = []) {
    let message = String(error?.message || error?.name || "SMTP send failed");
    for (const secret of sensitiveValues) {
        const value = String(secret || "");
        if (value) message = message.split(value).join("[REDACTED]");
    }
    message = message.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
    return (message || "SMTP send failed").slice(0, MAX_ERROR_LENGTH);
}

async function claimNextEvent(databasePath, { now, staleProcessingMs = STALE_PROCESSING_MS } = {}) {
    const claimAt = iso(now || new Date());
    const staleCutoff = new Date(new Date(claimAt).getTime() - staleProcessingMs).toISOString();
    return withImmediateTransaction(databasePath, async db => {
        const row = await db.get(
            `SELECT id, event_key, order_id, event_type, status, attempt_count,
                    next_attempt_at, updated_at
             FROM order_email_outbox
             WHERE (status IN ('pending', 'retry') AND next_attempt_at <= ?)
                OR (status = 'processing' AND updated_at <= ?)
             ORDER BY CASE WHEN status = 'processing' THEN updated_at ELSE next_attempt_at END, id
             LIMIT 1`,
            [claimAt, staleCutoff]
        );
        if (!row) return null;
        const result = await db.run(
            `UPDATE order_email_outbox
             SET status = 'processing', updated_at = ?
             WHERE id = ? AND status = ? AND updated_at = ?`,
            [claimAt, row.id, row.status, row.updated_at]
        );
        return result.changes === 1 ? { ...row, claimTimestamp: claimAt } : null;
    });
}

async function loadOrderEmailData(databasePath, orderId) {
    const { connection, db } = await openConnection(databasePath);
    try {
        const order = await db.get(
            `SELECT id, order_number, customer_name, phone, email, request_type,
                    address, unloading, payment_method, comment, items_json,
                    total_price, total_weight, created_at
             FROM orders WHERE id = ?`,
            [orderId]
        );
        if (!order) return null;
        const attachments = await db.all(
            `SELECT original_name FROM order_attachments WHERE order_id = ? ORDER BY id`,
            [orderId]
        );
        const parsedItems = JSON.parse(order.items_json || "[]");
        if (!Array.isArray(parsedItems)) throw new Error("Order items_json must contain an array.");
        return { order: { ...order, items: parsedItems }, attachments };
    } finally {
        await closeConnection(connection);
    }
}

async function conditionalUpdate(databasePath, claim, sql, params) {
    return withImmediateTransaction(databasePath, async db => {
        const result = await db.run(sql, [...params, claim.id, claim.claimTimestamp]);
        return result.changes === 1;
    });
}

function finishSent(databasePath, claim, completedAt) {
    return conditionalUpdate(
        databasePath,
        claim,
        `UPDATE order_email_outbox
         SET status = 'sent', attempt_count = attempt_count + 1,
             sent_at = ?, last_error = NULL, updated_at = ?
         WHERE id = ? AND status = 'processing' AND updated_at = ?`,
        [completedAt, completedAt]
    );
}

function finishFailure(databasePath, claim, completedAt, safeError) {
    const attemptCount = Number(claim.attempt_count) + 1;
    const failed = attemptCount >= MAX_ATTEMPTS;
    const nextAttemptAt = failed
        ? completedAt
        : new Date(new Date(completedAt).getTime() + retryDelayMs(attemptCount)).toISOString();
    return conditionalUpdate(
        databasePath,
        claim,
        `UPDATE order_email_outbox
         SET status = ?, attempt_count = attempt_count + 1,
             next_attempt_at = ?, last_error = ?, sent_at = NULL, updated_at = ?
         WHERE id = ? AND status = 'processing' AND updated_at = ?`,
        [failed ? "failed" : "retry", nextAttemptAt, safeError, completedAt]
    ).then(updated => ({ updated, status: failed ? "failed" : "retry", attemptCount, nextAttemptAt }));
}

function finishWithoutSend(databasePath, claim, completedAt, safeError) {
    return conditionalUpdate(
        databasePath,
        claim,
        `UPDATE order_email_outbox
         SET status = 'failed', last_error = ?, sent_at = NULL, updated_at = ?
         WHERE id = ? AND status = 'processing' AND updated_at = ?`,
        [safeError, completedAt]
    );
}

async function processClaim({ databasePath, claim, transport, from, to, clock, sensitiveValues = [], log = logger }) {
    if (claim.event_type !== OUTBOX_EVENT_TYPES.NEW_ORDER) {
        const completedAt = iso(clock());
        const updated = await finishWithoutSend(databasePath, claim, completedAt, "Unsupported email event type.");
        log.warn("order_email_unsupported_event", { outboxId: claim.id, orderId: claim.order_id, updated });
        return { status: "unsupported", updated };
    }

    const data = await loadOrderEmailData(databasePath, claim.order_id);
    if (!data) {
        const completedAt = iso(clock());
        const updated = await finishWithoutSend(databasePath, claim, completedAt, "Order no longer exists.");
        log.warn("order_email_missing_order", { outboxId: claim.id, orderId: claim.order_id, updated });
        return { status: "missing_order", updated };
    }

    const message = buildOrderEmail(data);
    // SQLite records the attempt only during conditional finalization; SMTP and SQLite cannot commit atomically.
    try {
        await transport.sendMail({ from, to, ...message });
    } catch (error) {
        const completedAt = iso(clock());
        const safeError = sanitizeError(error, sensitiveValues);
        const result = await finishFailure(databasePath, claim, completedAt, safeError);
        log.warn("order_email_send_failed", {
            outboxId: claim.id,
            orderId: claim.order_id,
            attempt: result.attemptCount,
            status: result.status,
            updated: result.updated,
            error: safeError
        });
        return result;
    }

    const completedAt = iso(clock());
    const updated = await finishSent(databasePath, claim, completedAt);
    log.info("order_email_send_completed", {
        outboxId: claim.id,
        orderId: claim.order_id,
        attempt: Number(claim.attempt_count) + 1,
        status: updated ? "sent" : "claim_lost"
    });
    return { status: updated ? "sent" : "claim_lost", updated };
}

function normalizeBatchLimit(value) {
    const limit = value === undefined ? DEFAULT_BATCH_LIMIT : Number(value);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_BATCH_LIMIT) {
        throw new TypeError(`batchLimit must be an integer between 1 and ${MAX_BATCH_LIMIT}.`);
    }
    return limit;
}

async function processOrderEmailOutbox({
    databasePath,
    transport,
    from,
    to,
    clock = () => new Date(),
    batchLimit = DEFAULT_BATCH_LIMIT,
    staleProcessingMs = STALE_PROCESSING_MS,
    sensitiveValues = [],
    log = logger
}) {
    if (!databasePath) throw new TypeError("databasePath is required.");
    if (!transport || typeof transport.sendMail !== "function") throw new TypeError("SMTP transport with sendMail is required.");
    const limit = normalizeBatchLimit(batchLimit);
    const summary = { claimed: 0, sent: 0, retry: 0, failed: 0, unsupported: 0, missingOrder: 0, claimLost: 0 };

    for (let index = 0; index < limit; index += 1) {
        const claim = await claimNextEvent(databasePath, { now: clock(), staleProcessingMs });
        if (!claim) break;
        summary.claimed += 1;
        const result = await processClaim({ databasePath, claim, transport, from, to, clock, sensitiveValues, log });
        if (result.status === "sent") summary.sent += 1;
        else if (result.status === "retry") summary.retry += 1;
        else if (result.status === "failed") summary.failed += 1;
        else if (result.status === "unsupported") summary.unsupported += 1;
        else if (result.status === "missing_order") summary.missingOrder += 1;
        else if (result.status === "claim_lost") summary.claimLost += 1;
    }
    return summary;
}

module.exports = {
    DEFAULT_BATCH_LIMIT,
    STALE_PROCESSING_MS,
    MAX_ATTEMPTS,
    BASE_RETRY_DELAY_MS,
    MAX_RETRY_DELAY_MS,
    retryDelayMs,
    sanitizeError,
    claimNextEvent,
    loadOrderEmailData,
    finishSent,
    finishFailure,
    processClaim,
    processOrderEmailOutbox
};
