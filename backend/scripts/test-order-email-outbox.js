const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const {
    CURRENT_SCHEMA_VERSION,
    migrateDatabase,
    openDatabase
} = require("../databaseMigrations");
const {
    createOrderEmailOutboxRepository,
    newOrderEventKey
} = require("../services/orderEmailOutbox");

async function waitForServer(url, child, getServerOutput) {
    let lastProbe = "no response";
    for (let attempt = 0; attempt < 200; attempt += 1) {
        if (child.exitCode !== null) {
            throw new Error(`Order email outbox test server exited (${child.exitCode}): ${getServerOutput()}`);
        }
        try {
            const response = await fetch(url);
            lastProbe = `HTTP ${response.status}`;
            if (response.ok) return;
        } catch (error) {
            lastProbe = error.message;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Order email outbox test server did not start (${lastProbe}): ${getServerOutput()}`);
}

async function stopServer(child) {
    if (!child || child.exitCode !== null) return;
    child.kill("SIGTERM");
    await new Promise(resolve => child.once("exit", resolve));
}

async function requestJson(baseUrl, pathname, { method = "GET", cookie = "", body } = {}) {
    const response = await fetch(`${baseUrl}${pathname}`, {
        method,
        headers: {
            ...(cookie ? { Cookie: cookie } : {}),
            ...(body === undefined ? {} : { "Content-Type": "application/json" })
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
}

function ordinaryOrderPayload(productId, overrides = {}) {
    return {
        customerName: "Outbox customer",
        phone: "+7 (999) 123-45-67",
        items: [{ productId, quantity: 2 }],
        consent: true,
        ...overrides
    };
}

async function login(baseUrl) {
    const result = await requestJson(baseUrl, "/api/auth/login", {
        method: "POST",
        body: { login: "admin", password: "admin123" }
    });
    assert.strictEqual(result.response.status, 200, JSON.stringify(result.payload));
    return result.response.headers.getSetCookie?.()[0]?.split(";")[0]
        || result.response.headers.get("set-cookie")?.split(";")[0]
        || "";
}

async function assertSchema(db) {
    assert.strictEqual(Number((await db.get("PRAGMA user_version")).user_version), 9);
    const columns = await db.all("PRAGMA table_info(order_email_outbox)");
    assert.deepStrictEqual(columns.map(column => column.name), [
        "id", "event_key", "order_id", "event_type", "status", "attempt_count",
        "next_attempt_at", "last_error", "sent_at", "created_at", "updated_at"
    ]);
    const indexes = new Set((await db.all("PRAGMA index_list(order_email_outbox)")).map(index => index.name));
    assert(indexes.has("idx_order_email_outbox_status_next_attempt"));
    assert([...indexes].some(name => name.startsWith("sqlite_autoindex_order_email_outbox_")));
    const workerIndex = await db.all("PRAGMA index_info(idx_order_email_outbox_status_next_attempt)");
    assert.deepStrictEqual(workerIndex.map(column => column.name), ["status", "next_attempt_at", "id"]);
    const foreignKeys = await db.all("PRAGMA foreign_key_list(order_email_outbox)");
    assert(foreignKeys.some(key => key.from === "order_id" && key.table === "orders" && key.on_delete === "CASCADE"));
    assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
    assert.strictEqual((await db.get("PRAGMA integrity_check")).integrity_check, "ok");
}

async function assertMigration(root, sourceDatabase) {
    const schema6Path = path.join(root, "schema-6.db");
    await fs.promises.copyFile(sourceDatabase, schema6Path);
    const schema6 = await openDatabase(schema6Path);
    const existingOrder = await schema6.run(
        `INSERT INTO orders (customer_name, phone, items_json, created_at, updated_at, request_type)
         VALUES ('Existing order', '+70000000000', '[]', ?, ?, 'order')`,
        [new Date().toISOString(), new Date().toISOString()]
    );
    await schema6.run("DROP TABLE order_email_outbox");
    await schema6.run("PRAGMA user_version=6");
    await schema6.close();

    const dryRun = await migrateDatabase(schema6Path, { dryRun: true });
    assert.deepStrictEqual(
        { from: dryRun.fromVersion, to: dryRun.toVersion, changed: dryRun.changed },
        { from: 6, to: 9, changed: false }
    );
    const migrated = await migrateDatabase(schema6Path, { dryRun: false });
    assert.deepStrictEqual(
        { from: migrated.fromVersion, to: migrated.toVersion, changed: migrated.changed },
        { from: 6, to: 9, changed: true }
    );
    assert(fs.existsSync(migrated.backupPath));
    const migratedDb = await openDatabase(schema6Path);
    await assertSchema(migratedDb);
    assert(await migratedDb.get("SELECT id FROM orders WHERE id = ?", [existingOrder.id]));
    assert.strictEqual(Number((await migratedDb.get("SELECT COUNT(*) AS count FROM order_email_outbox")).count), 0);
    await migratedDb.close();

    const repeated = await migrateDatabase(schema6Path, { dryRun: false });
    assert.strictEqual(repeated.changed, false);
    assert.strictEqual(repeated.fromVersion, 9);
}

async function outboxRows(db) {
    return db.all(
        `SELECT id, event_key, order_id, event_type, status, attempt_count,
                next_attempt_at, last_error, sent_at, created_at, updated_at
         FROM order_email_outbox ORDER BY id`
    );
}

async function main() {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 9);
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-order-email-outbox-"));
    const databasePath = path.join(root, "matmix.db");
    const sessionPath = path.join(root, "sessions.db");
    const lockPath = path.join(root, "runtime.lock");
    const uploadsPath = path.join(root, "uploads");
    const attachmentsPath = path.join(root, "attachments");
    const port = 47000 + Math.floor(Math.random() * 1000);
    const baseUrl = `http://127.0.0.1:${port}`;
    await fs.promises.mkdir(uploadsPath);
    await fs.promises.mkdir(attachmentsPath);

    process.env.MATMIX_DB_PATH = databasePath;
    const database = require("../database");
    await database.initDatabase();
    await new Promise((resolve, reject) => database.db.close(error => error ? reject(error) : resolve()));
    const freshMigration = await migrateDatabase(databasePath, { dryRun: false });
    assert.strictEqual(freshMigration.fromVersion, 0);
    assert.strictEqual(freshMigration.toVersion, 9);

    const setup = await openDatabase(databasePath);
    await assertSchema(setup);
    const product = await setup.run(
        `INSERT INTO products (
            external_id, title, price, weight, unit, is_active, sort_order,
            source, created_at, updated_at
         ) VALUES ('OUTBOX-001', 'Outbox product', 125.5, 2.5, 'шт', 1, 1, 'test', ?, ?)`,
        [new Date().toISOString(), new Date().toISOString()]
    );
    await setup.close();
    await assertMigration(root, databasePath);

    const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
        cwd: path.resolve(__dirname, "..", ".."),
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
            ...process.env,
            NODE_ENV: "test",
            PORT: String(port),
            SESSION_SECRET: "order-email-outbox-test-secret-12345678901234567890",
            MATMIX_DB_PATH: databasePath,
            SESSION_DB_PATH: sessionPath,
            PRODUCT_UPLOADS_PATH: uploadsPath,
            ORDER_ATTACHMENTS_PATH: attachmentsPath,
            APP_RUNTIME_LOCK_PATH: lockPath,
            PUBLIC_BASE_URL: baseUrl,
            SEO_ALLOW_INDEXING: "false"
        }
    });
    let serverOutput = "";
    const captureServerOutput = chunk => {
        serverOutput = `${serverOutput}${chunk}`.slice(-8000);
    };
    server.stdout.on("data", captureServerOutput);
    server.stderr.on("data", captureServerOutput);

    try {
        await waitForServer(`${baseUrl}/health`, server, () => serverOutput.trim());

        const ordinary = await requestJson(baseUrl, "/api/orders", {
            method: "POST",
            body: ordinaryOrderPayload(product.id)
        });
        assert.strictEqual(ordinary.response.status, 201, JSON.stringify(ordinary.payload));

        const afterOrdinary = await openDatabase(databasePath);
        let rows = await outboxRows(afterOrdinary);
        assert.strictEqual(rows.length, 1);
        assert.deepStrictEqual(
            {
                eventKey: rows[0].event_key,
                orderId: rows[0].order_id,
                eventType: rows[0].event_type,
                status: rows[0].status,
                attemptCount: rows[0].attempt_count,
                lastError: rows[0].last_error,
                sentAt: rows[0].sent_at
            },
            {
                eventKey: newOrderEventKey(ordinary.payload.id),
                orderId: ordinary.payload.id,
                eventType: "new_order",
                status: "pending",
                attemptCount: 0,
                lastError: null,
                sentAt: null
            }
        );
        assert.strictEqual(rows[0].next_attempt_at, rows[0].created_at);
        assert.strictEqual(rows[0].updated_at, rows[0].created_at);

        await assert.rejects(
            createOrderEmailOutboxRepository(afterOrdinary).enqueueNewOrder(ordinary.payload.id),
            error => String(error?.code || "").startsWith("SQLITE_CONSTRAINT")
        );
        assert.strictEqual((await outboxRows(afterOrdinary)).length, 1);
        await afterOrdinary.close();

        const form = new FormData();
        form.append("customerName", "File outbox customer");
        form.append("phone", "+7 (999) 000-00-01");
        form.append("email", "outbox@example.test");
        form.append("comment", "File request outbox test");
        form.append("paymentMethod", "cash");
        form.append("includeCart", "false");
        form.append("consent", "true");
        form.append("files", new Blob(["outbox test"], { type: "text/plain" }), "outbox.txt");
        const fileResponse = await fetch(`${baseUrl}/api/orders/file-request`, { method: "POST", body: form });
        const filePayload = await fileResponse.json();
        assert.strictEqual(fileResponse.status, 201, JSON.stringify(filePayload));

        const afterBothPaths = await openDatabase(databasePath);
        rows = await outboxRows(afterBothPaths);
        assert.strictEqual(rows.length, 2);
        assert(rows.some(row => row.event_key === newOrderEventKey(filePayload.id)));

        const beforeRollback = {
            orders: Number((await afterBothPaths.get("SELECT COUNT(*) AS count FROM orders")).count),
            clients: Number((await afterBothPaths.get("SELECT COUNT(*) AS count FROM clients")).count),
            events: Number((await afterBothPaths.get("SELECT COUNT(*) AS count FROM order_events")).count),
            outbox: rows.length
        };
        await afterBothPaths.run(`
            CREATE TRIGGER reject_new_order_email_outbox
            BEFORE INSERT ON order_email_outbox
            BEGIN SELECT RAISE(ABORT, 'forced outbox enqueue failure'); END
        `);
        await afterBothPaths.close();

        const rejected = await requestJson(baseUrl, "/api/orders", {
            method: "POST",
            body: ordinaryOrderPayload(product.id, {
                customerName: "Rolled back customer",
                phone: "+7 (999) 000-00-02"
            })
        });
        assert.strictEqual(rejected.response.status, 409, JSON.stringify(rejected.payload));

        const rollbackDb = await openDatabase(databasePath);
        assert.deepStrictEqual(
            {
                orders: Number((await rollbackDb.get("SELECT COUNT(*) AS count FROM orders")).count),
                clients: Number((await rollbackDb.get("SELECT COUNT(*) AS count FROM clients")).count),
                events: Number((await rollbackDb.get("SELECT COUNT(*) AS count FROM order_events")).count),
                outbox: Number((await rollbackDb.get("SELECT COUNT(*) AS count FROM order_email_outbox")).count)
            },
            beforeRollback
        );
        assert.strictEqual(
            Number((await rollbackDb.get("SELECT COUNT(*) AS count FROM clients WHERE phone = '+79990000002'")).count),
            0
        );
        await rollbackDb.run("DROP TRIGGER reject_new_order_email_outbox");
        await rollbackDb.close();

        const cookie = await login(baseUrl);
        const list = await requestJson(baseUrl, "/api/orders", { cookie });
        assert.strictEqual(list.response.status, 200);
        const details = await requestJson(baseUrl, `/api/orders/${ordinary.payload.id}`, { cookie });
        assert.strictEqual(details.response.status, 200);
        const read = await requestJson(baseUrl, `/api/orders/${ordinary.payload.id}/read`, {
            method: "POST",
            cookie
        });
        assert.strictEqual(read.response.status, 200);
        const take = await requestJson(baseUrl, `/api/orders/${ordinary.payload.id}/take`, {
            method: "POST",
            cookie
        });
        assert.strictEqual(take.response.status, 200);
        const status = await requestJson(baseUrl, `/api/orders/${ordinary.payload.id}/status`, {
            method: "PATCH",
            cookie,
            body: { status: "Ожидает клиента" }
        });
        assert.strictEqual(status.response.status, 200);

        const finalDb = await openDatabase(databasePath);
        assert.strictEqual(Number((await finalDb.get("SELECT COUNT(*) AS count FROM order_email_outbox")).count), 2);
        await finalDb.run("DELETE FROM orders WHERE id = ?", [filePayload.id]);
        assert.strictEqual(Number((await finalDb.get("SELECT COUNT(*) AS count FROM order_email_outbox WHERE order_id = ?", [filePayload.id])).count), 0);
        await assertSchema(finalDb);
        await finalDb.close();

        console.log(JSON.stringify({
            success: true,
            schemaMigration: "0 -> 9 and 6 -> 9",
            productionCreationPaths: ["POST /api/orders", "POST /api/orders/file-request"],
            atomicRollback: true,
            uniqueEventKey: true,
            existingOrderOperationsDoNotEnqueue: true
        }));
    } finally {
        await stopServer(server);
        await fs.promises.rm(root, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
