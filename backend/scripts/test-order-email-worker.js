const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { migrateDatabase, openDatabase, CURRENT_SCHEMA_VERSION } = require("../databaseMigrations");
const { createOrderEmailOutboxRepository } = require("../services/orderEmailOutbox");
const { buildOrderEmail } = require("../services/orderEmailTemplate");
const {
    loadOrderEmailConfig,
    createOrderEmailTransport,
    SMTP_TIMEOUTS_MS
} = require("../services/orderEmailTransport");
const {
    DEFAULT_BATCH_LIMIT,
    STALE_PROCESSING_MS,
    MAX_ATTEMPTS,
    retryDelayMs,
    sanitizeError,
    claimNextEvent,
    finishSent,
    processClaim,
    processOrderEmailOutbox
} = require("../services/orderEmailWorker");

const silentLog = { info() {}, warn() {}, error() {} };

function fakeTransport(handler = async () => ({ accepted: ["orders@example.test"] })) {
    const messages = [];
    return {
        messages,
        async sendMail(message) {
            messages.push(message);
            return handler(message);
        }
    };
}

async function setupDatabase(root) {
    const databasePath = path.join(root, "worker.db");
    process.env.MATMIX_DB_PATH = databasePath;
    const database = require("../database");
    await database.initDatabase();
    await new Promise((resolve, reject) => database.db.close(error => error ? reject(error) : resolve()));
    await migrateDatabase(databasePath, { dryRun: false });
    return databasePath;
}

async function insertOrder(db, overrides = {}) {
    const now = overrides.createdAt || "2026-08-12T10:00:00.000Z";
    const items = overrides.items || [{
        title: "Плита <опасная> & товар",
        quantity: 2,
        unit: "шт",
        price: 125.5,
        lineTotal: 251
    }];
    const result = await db.run(
        `INSERT INTO orders (
            order_number, customer_name, phone, email, request_type, address,
            unloading, payment_method, comment, items_json, total_price,
            total_weight, status, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Новая', ?, ?)`,
        [
            overrides.orderNumber || `MM-2026-${String(Date.now()).slice(-6)}`,
            overrides.customerName || 'Клиент <script>alert("x")</script> & Co',
            overrides.phone || "+79991234567",
            overrides.email || "customer@example.test",
            overrides.requestType || "order",
            overrides.address || "Адрес > склад",
            overrides.unloading || "Нужна",
            overrides.paymentMethod || "cash",
            overrides.comment || 'Комментарий "важный" & <b>raw</b>',
            JSON.stringify(items),
            overrides.totalPrice ?? 251,
            overrides.totalWeight ?? 5.5,
            now,
            now
        ]
    );
    return result.id;
}

async function enqueue(db, orderId, at = "2026-08-12T10:00:00.000Z") {
    await createOrderEmailOutboxRepository(db).enqueueNewOrder(orderId, at);
    return db.get("SELECT * FROM order_email_outbox WHERE order_id = ?", [orderId]);
}

function advancingClock(values) {
    let index = 0;
    return () => new Date(values[Math.min(index++, values.length - 1)]);
}

async function row(db, orderId) {
    return db.get("SELECT * FROM order_email_outbox WHERE order_id = ?", [orderId]);
}

async function main() {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 8);
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-order-email-worker-"));
    const databasePath = await setupDatabase(root);
    const db = await openDatabase(databasePath);
    try {
        const version = Number((await db.get("PRAGMA user_version")).user_version);
        assert.strictEqual(version, 8);

        const config = loadOrderEmailConfig({
            MATMIX_ORDER_EMAIL_SMTP_HOST: "smtp.example.test",
            MATMIX_ORDER_EMAIL_SMTP_PORT: "587",
            MATMIX_ORDER_EMAIL_SMTP_USER: "site@example.test",
            MATMIX_ORDER_EMAIL_SMTP_PASSWORD: "test-only-secret",
            MATMIX_ORDER_EMAIL_FROM: "site@example.test",
            MATMIX_ORDER_EMAIL_TO: " orders@example.test, admin@example.test, ORDERS@example.test "
        });
        let transportOptions;
        createOrderEmailTransport(config, { createTransport(options) { transportOptions = options; return fakeTransport(); } });
        assert.strictEqual(transportOptions.secure, false);
        assert.strictEqual(transportOptions.requireTLS, true);
        assert.strictEqual(transportOptions.tls.minVersion, "TLSv1.2");
        assert(!Object.prototype.hasOwnProperty.call(transportOptions.tls, "rejectUnauthorized"));
        assert.deepStrictEqual(config.to, ["orders@example.test", "admin@example.test"]);
        assert.deepStrictEqual(
            [transportOptions.connectionTimeout, transportOptions.greetingTimeout, transportOptions.socketTimeout],
            [SMTP_TIMEOUTS_MS.connection, SMTP_TIMEOUTS_MS.greeting, SMTP_TIMEOUTS_MS.socket]
        );
        assert.throws(() => loadOrderEmailConfig({}), /MATMIX_ORDER_EMAIL_SMTP_HOST/);
        assert(!JSON.stringify(transportOptions).includes("production"));

        const successOrder = await insertOrder(db, { orderNumber: "MM-2026-000001", requestType: "file_request" });
        await db.run(
            `INSERT INTO order_attachments (
                order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
             ) VALUES (?, ?, 'safe-file.pdf', 'application/pdf', 'pdf', 12, ?, ?)`,
            [successOrder, "Смета <финал>.pdf", "a".repeat(64), "2026-08-12T10:00:00.000Z"]
        );
        await enqueue(db, successOrder);
        const successTransport = fakeTransport();
        const success = await processOrderEmailOutbox({
            databasePath,
            transport: successTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: advancingClock(["2026-08-12T10:01:00.000Z", "2026-08-12T10:01:01.000Z"]),
            log: silentLog
        });
        assert.deepStrictEqual(success, { claimed: 1, sent: 1, retry: 0, failed: 0, unsupported: 0, missingOrder: 0, claimLost: 0 });
        const successRow = await row(db, successOrder);
        assert.strictEqual(successRow.status, "sent");
        assert.strictEqual(successRow.attempt_count, 1);
        assert(successRow.sent_at);
        assert.strictEqual(successRow.last_error, null);
        assert.strictEqual(successTransport.messages.length, 1);
        const sentMessage = successTransport.messages[0];
        assert(sentMessage.subject.includes("MM-2026-000001"));
        assert(sentMessage.text.includes("Файловая заявка"));
        assert(sentMessage.text.includes("Смета <финал>.pdf"));
        assert(!sentMessage.html.includes("<script>"));
        assert(!sentMessage.html.includes("<b>raw</b>"));
        assert(sentMessage.html.includes("&lt;script&gt;"));
        assert(sentMessage.html.includes("Смета &lt;финал&gt;.pdf"));
        assert(!sentMessage.text.includes("safe-file.pdf"));

        const retryOrder = await insertOrder(db, { orderNumber: "MM-2026-000002" });
        await enqueue(db, retryOrder);
        const secret = "worker-test-password";
        const retryLogs = [];
        const capturingLog = {
            info(event, fields) { retryLogs.push({ level: "info", event, fields }); },
            warn(event, fields) { retryLogs.push({ level: "warn", event, fields }); },
            error(event, fields) { retryLogs.push({ level: "error", event, fields }); }
        };
        const retryTransport = fakeTransport(async () => { throw new Error(`SMTP failed with ${secret}\nstack-like line`); });
        const retrySummary = await processOrderEmailOutbox({
            databasePath,
            transport: retryTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: advancingClock(["2026-08-12T10:02:00.000Z", "2026-08-12T10:02:05.000Z"]),
            sensitiveValues: [secret],
            log: capturingLog
        });
        assert.strictEqual(retrySummary.retry, 1);
        const retryRow = await row(db, retryOrder);
        assert.strictEqual(retryRow.status, "retry");
        assert.strictEqual(retryRow.attempt_count, 1);
        assert.strictEqual(retryRow.next_attempt_at, "2026-08-12T10:03:05.000Z");
        assert(!retryRow.last_error.includes(secret));
        assert(!retryRow.last_error.includes("\n"));
        assert(retryRow.last_error.includes("[REDACTED]"));
        const serializedLogs = JSON.stringify(retryLogs);
        assert(!serializedLogs.includes(secret));
        assert(!serializedLogs.includes("auth"));
        assert(!serializedLogs.includes("customer@example.test"));
        assert(!serializedLogs.includes("Плита"));
        await db.run(
            "UPDATE order_email_outbox SET next_attempt_at=? WHERE id=?",
            ["2026-08-13T00:00:00.000Z", retryRow.id]
        );

        assert.deepStrictEqual(
            [1, 2, 3, 4, 5, 6, 7, 8, 20].map(retryDelayMs),
            [60, 120, 240, 480, 960, 1920, 3840, 7680, 21600].map(seconds => seconds * 1000)
        );

        const finalOrder = await insertOrder(db, { orderNumber: "MM-2026-000003" });
        const finalEvent = await enqueue(db, finalOrder);
        await db.run(
            "UPDATE order_email_outbox SET status='retry', attempt_count=?, next_attempt_at=? WHERE id=?",
            [MAX_ATTEMPTS - 1, "2026-08-12T10:00:00.000Z", finalEvent.id]
        );
        const finalSummary = await processOrderEmailOutbox({
            databasePath,
            transport: fakeTransport(async () => { throw new Error("last failure"); }),
            from: "site@example.test",
            to: "orders@example.test",
            clock: advancingClock(["2026-08-12T10:04:00.000Z", "2026-08-12T10:04:01.000Z"]),
            log: silentLog
        });
        assert.strictEqual(finalSummary.failed, 1);
        assert.strictEqual((await row(db, finalOrder)).attempt_count, MAX_ATTEMPTS);
        assert.strictEqual((await row(db, finalOrder)).status, "failed");

        const futureOrder = await insertOrder(db, { orderNumber: "MM-2026-000004" });
        const futureEvent = await enqueue(db, futureOrder);
        await db.run(
            "UPDATE order_email_outbox SET status='retry', next_attempt_at=? WHERE id=?",
            ["2026-08-12T12:00:00.000Z", futureEvent.id]
        );
        assert.strictEqual(await claimNextEvent(databasePath, { now: "2026-08-12T11:00:00.000Z" }), null);

        const concurrentOrder = await insertOrder(db, { orderNumber: "MM-2026-000005" });
        await enqueue(db, concurrentOrder, "2026-08-12T10:00:00.000Z");
        const [claimOne, claimTwo] = await Promise.all([
            claimNextEvent(databasePath, { now: "2026-08-12T11:01:00.000Z" }),
            claimNextEvent(databasePath, { now: "2026-08-12T11:01:00.001Z" })
        ]);
        assert.strictEqual([claimOne, claimTwo].filter(Boolean).length, 1);
        const concurrentClaim = claimOne || claimTwo;

        assert.strictEqual(
            await claimNextEvent(databasePath, { now: new Date(new Date(concurrentClaim.claimTimestamp).getTime() + STALE_PROCESSING_MS - 1) }),
            null
        );
        const reclaimed = await claimNextEvent(databasePath, {
            now: new Date(new Date(concurrentClaim.claimTimestamp).getTime() + STALE_PROCESSING_MS + 1)
        });
        assert.strictEqual(reclaimed.id, concurrentClaim.id);
        assert.notStrictEqual(reclaimed.claimTimestamp, concurrentClaim.claimTimestamp);
        assert.strictEqual(await finishSent(databasePath, concurrentClaim, "2026-08-12T11:20:01.000Z"), false);
        assert.strictEqual((await row(db, concurrentOrder)).status, "processing");
        assert.strictEqual(await finishSent(databasePath, reclaimed, "2026-08-12T11:20:02.000Z"), true);

        const parallelOrderOne = await insertOrder(db, { orderNumber: "MM-2026-PARALLEL-1" });
        const parallelOrderTwo = await insertOrder(db, { orderNumber: "MM-2026-PARALLEL-2" });
        await enqueue(db, parallelOrderOne, "2026-08-12T10:00:00.000Z");
        await enqueue(db, parallelOrderTwo, "2026-08-12T10:00:00.000Z");
        const parallelClaims = await Promise.all([
            claimNextEvent(databasePath, { now: "2026-08-12T11:20:03.000Z" }),
            claimNextEvent(databasePath, { now: "2026-08-12T11:20:03.001Z" })
        ]);
        assert(parallelClaims.every(Boolean));
        assert.notStrictEqual(parallelClaims[0].id, parallelClaims[1].id);
        await Promise.all([
            finishSent(databasePath, parallelClaims[0], "2026-08-12T11:20:04.000Z"),
            finishSent(databasePath, parallelClaims[1], "2026-08-12T11:20:04.001Z")
        ]);

        const missingOrder = await insertOrder(db, { orderNumber: "MM-2026-000006" });
        const missingEvent = await enqueue(db, missingOrder, "2026-08-12T10:00:00.000Z");
        const missingClaim = await claimNextEvent(databasePath, { now: "2026-08-12T11:21:00.000Z" });
        assert.strictEqual(missingClaim.id, missingEvent.id);
        await db.run("DELETE FROM orders WHERE id = ?", [missingOrder]);
        const missingTransport = fakeTransport();
        const missingResult = await processClaim({
            databasePath,
            claim: missingClaim,
            transport: missingTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: () => new Date("2026-08-12T11:21:01.000Z"),
            log: silentLog
        });
        assert.strictEqual(missingTransport.messages.length, 0);
        assert.strictEqual(missingResult.status, "missing_order");
        assert.strictEqual(missingResult.updated, false);
        assert.strictEqual(await db.get("SELECT id FROM order_email_outbox WHERE id = ?", [missingEvent.id]), undefined);

        const unsupportedOrder = await insertOrder(db, { orderNumber: "MM-2026-000007" });
        const unsupportedEvent = await enqueue(db, unsupportedOrder, "2026-08-12T10:00:00.000Z");
        await db.run("UPDATE order_email_outbox SET event_type='other_event' WHERE id=?", [unsupportedEvent.id]);
        const unsupportedTransport = fakeTransport();
        const unsupported = await processOrderEmailOutbox({
            databasePath,
            transport: unsupportedTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: advancingClock(["2026-08-12T11:22:00.000Z", "2026-08-12T11:22:01.000Z"]),
            log: silentLog
        });
        assert.strictEqual(unsupported.unsupported, 1);
        assert.strictEqual(unsupportedTransport.messages.length, 0);
        assert.strictEqual((await row(db, unsupportedOrder)).status, "failed");

        const crashWindowOrder = await insertOrder(db, { orderNumber: "MM-2026-CRASH-WINDOW" });
        const crashWindowEvent = await enqueue(db, crashWindowOrder, "2026-08-12T10:00:00.000Z");
        const interruptedClaim = await claimNextEvent(databasePath, { now: "2026-08-12T11:23:00.000Z" });
        assert.strictEqual(interruptedClaim.id, crashWindowEvent.id);
        const interruptedTransport = fakeTransport();
        await interruptedTransport.sendMail({ subject: "simulated accepted message" });
        assert.strictEqual((await row(db, crashWindowOrder)).attempt_count, 0);
        assert.strictEqual((await row(db, crashWindowOrder)).status, "processing");
        const recoveredClaim = await claimNextEvent(databasePath, { now: "2026-08-12T11:38:00.001Z" });
        assert.strictEqual(recoveredClaim.id, crashWindowEvent.id);
        const recoveredTransport = fakeTransport();
        const recoveredResult = await processClaim({
            databasePath,
            claim: recoveredClaim,
            transport: recoveredTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: () => new Date("2026-08-12T11:38:01.000Z"),
            log: silentLog
        });
        assert.strictEqual(recoveredResult.status, "sent");
        assert.strictEqual(interruptedTransport.messages.length + recoveredTransport.messages.length, 2);
        assert.strictEqual((await row(db, crashWindowOrder)).attempt_count, 1);

        const batchOrders = [];
        for (let index = 0; index < DEFAULT_BATCH_LIMIT + 2; index += 1) {
            const orderId = await insertOrder(db, { orderNumber: `MM-BATCH-${index}` });
            batchOrders.push(orderId);
            await enqueue(db, orderId, "2026-08-12T10:00:00.000Z");
        }
        const batchTransport = fakeTransport();
        const batchSummary = await processOrderEmailOutbox({
            databasePath,
            transport: batchTransport,
            from: "site@example.test",
            to: "orders@example.test",
            clock: () => new Date("2026-08-12T11:30:00.000Z"),
            log: silentLog
        });
        assert.strictEqual(batchSummary.claimed, DEFAULT_BATCH_LIMIT);
        assert.strictEqual(batchTransport.messages.length, DEFAULT_BATCH_LIMIT);
        assert.strictEqual(Number((await db.get("SELECT COUNT(*) AS count FROM order_email_outbox WHERE status='pending'")).count), 2);

        const directTemplate = buildOrderEmail({
            order: {
                id: 999,
                order_number: "XSS-1",
                customer_name: "<img src=x onerror=alert(1)>",
                phone: "+70000000000",
                request_type: "order",
                items: [],
                total_price: 0,
                total_weight: 0,
                created_at: "2026-08-12T10:00:00.000Z"
            },
            attachments: []
        });
        assert(!directTemplate.html.includes("<img src=x"));
        assert(directTemplate.html.includes("&lt;img src=x onerror=alert(1)&gt;"));
        assert.strictEqual(sanitizeError({ message: "x".repeat(1000) }).length, 500);

        console.log(JSON.stringify({
            success: true,
            schemaVersion: 8,
            successSend: true,
            retryAndMaxAttempts: true,
            concurrentClaim: true,
            staleRecoveryAndRaceProtection: true,
            crashWindowPersistedAttemptSemantics: true,
            missingOrderNoSend: true,
            unsupportedEventNoSend: true,
            emailEscaping: true,
            batchLimit: DEFAULT_BATCH_LIMIT,
            smtpConnections: 0
        }));
    } finally {
        await db.close();
        await fs.promises.rm(root, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
