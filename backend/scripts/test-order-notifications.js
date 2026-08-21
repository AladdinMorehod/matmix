const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const bcrypt = require("bcryptjs");
const {
    CURRENT_SCHEMA_VERSION,
    migrateDatabase,
    openDatabase
} = require("../databaseMigrations");

async function waitForServer(url) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
        try {
            if ((await fetch(url)).ok) return;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Order notification test server did not start.");
}

async function stopServer(child) {
    if (!child || child.exitCode !== null) return;
    child.kill("SIGTERM");
    await new Promise(resolve => child.once("exit", resolve));
}

function cookieFrom(response) {
    return response.headers.get("set-cookie")?.split(";")[0] || "";
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
    const payload = await response.json();
    return { response, payload };
}

async function login(baseUrl, loginName, password) {
    const result = await requestJson(baseUrl, "/api/auth/login", {
        method: "POST",
        body: { login: loginName, password }
    });
    assert.strictEqual(result.response.status, 200, JSON.stringify(result.payload));
    return cookieFrom(result.response);
}

async function addUser(db, { login, role, active = 1 }) {
    const now = new Date().toISOString();
    const password = `Notification-${login}-123!`;
    const result = await db.run(
        `INSERT INTO users (
            login, password_hash, role, name, is_active, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [login, await bcrypt.hash(password, 4), role, login, active, now, now]
    );
    return { id: result.id, login, password, role };
}

async function addOrder(db, {
    customerName,
    managerId = null,
    status = "Новая",
    deletedAt = null
}) {
    const now = new Date().toISOString();
    const result = await db.run(
        `INSERT INTO orders (
            customer_name, phone, items_json, status, manager_id,
            deleted_at, created_at, updated_at, request_type
         ) VALUES (?, ?, '[]', ?, ?, ?, ?, ?, 'order')`,
        [customerName, "+70000000000", status, managerId, deletedAt, now, now]
    );
    return result.id;
}

async function assertSummary(baseUrl, cookie, expected, suffix = "") {
    const { response, payload } = await requestJson(
        baseUrl,
        `/api/order-notifications/summary${suffix}`,
        { cookie }
    );
    assert.strictEqual(response.status, 200, JSON.stringify(payload));
    assert.strictEqual(payload.unreadCount, expected);
}

async function assertMigration(root, sourceDatabase) {
    const v5Path = path.join(root, "schema-v5.db");
    await fs.promises.copyFile(sourceDatabase, v5Path);
    const v5 = await openDatabase(v5Path);
    await v5.run("DROP TABLE order_notification_reads");
    await v5.run("PRAGMA user_version=5");
    const preservedOrderCount = Number((await v5.get("SELECT COUNT(*) AS count FROM orders")).count);
    await v5.close();

    const dryRun = await migrateDatabase(v5Path, { dryRun: true });
    assert.deepStrictEqual(
        { from: dryRun.fromVersion, to: dryRun.toVersion, changed: dryRun.changed },
        { from: 5, to: 8, changed: false }
    );

    const result = await migrateDatabase(v5Path, { dryRun: false });
    assert.deepStrictEqual(
        { from: result.fromVersion, to: result.toVersion, changed: result.changed },
        { from: 5, to: 8, changed: true }
    );
    assert(fs.existsSync(result.backupPath));
    const migrated = await openDatabase(v5Path);
    assert.strictEqual(Number((await migrated.get("PRAGMA user_version")).user_version), CURRENT_SCHEMA_VERSION);
    assert.strictEqual(Number((await migrated.get("SELECT COUNT(*) AS count FROM orders")).count), preservedOrderCount);
    assert(await migrated.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_notification_reads'"));
    assert(await migrated.get("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_order_notification_reads_order_id'"));
    assert.deepStrictEqual(await migrated.all("PRAGMA foreign_key_check"), []);
    assert.strictEqual((await migrated.get("PRAGMA integrity_check")).integrity_check, "ok");
    await migrated.close();

    const repeated = await migrateDatabase(v5Path, { dryRun: false });
    assert.strictEqual(repeated.changed, false);
    assert.strictEqual(repeated.fromVersion, 8);

    const rollbackPath = path.join(root, "schema-v5-rollback.db");
    await fs.promises.copyFile(sourceDatabase, rollbackPath);
    const rollbackFixture = await openDatabase(rollbackPath);
    await rollbackFixture.run("DROP TABLE order_notification_reads");
    await rollbackFixture.run("PRAGMA user_version=5");
    await rollbackFixture.close();
    await assert.rejects(
        migrateDatabase(rollbackPath, { dryRun: false, injectFailure: true }),
        /Injected migration failure/
    );
    const rolledBack = await openDatabase(rollbackPath);
    assert.strictEqual(Number((await rolledBack.get("PRAGMA user_version")).user_version), 5);
    assert.strictEqual(
        await rolledBack.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_notification_reads'"),
        undefined
    );
    await rolledBack.close();
}

async function assertForeignKeyCascades(db) {
    const user = await addUser(db, { login: "cascade_manager", role: "manager" });
    const orderId = await addOrder(db, { customerName: "Cascade order" });
    await db.run(
        `INSERT INTO order_notification_reads (user_id, order_id, read_at)
         VALUES (?, ?, ?)`,
        [user.id, orderId, new Date().toISOString()]
    );
    await db.run("DELETE FROM users WHERE id = ?", [user.id]);
    assert.strictEqual(Number((await db.get("SELECT COUNT(*) AS count FROM order_notification_reads WHERE user_id = ?", [user.id])).count), 0);
    await db.run("DELETE FROM orders WHERE id = ?", [orderId]);

    const secondUser = await addUser(db, { login: "cascade_manager_2", role: "manager" });
    const secondOrderId = await addOrder(db, { customerName: "Cascade order 2" });
    await db.run(
        `INSERT INTO order_notification_reads (user_id, order_id, read_at)
         VALUES (?, ?, ?)`,
        [secondUser.id, secondOrderId, new Date().toISOString()]
    );
    await db.run("DELETE FROM orders WHERE id = ?", [secondOrderId]);
    assert.strictEqual(Number((await db.get("SELECT COUNT(*) AS count FROM order_notification_reads WHERE order_id = ?", [secondOrderId])).count), 0);
}

async function main() {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 8);
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-order-notifications-"));
    const databasePath = path.join(root, "matmix.db");
    const lockPath = path.join(root, "runtime.lock");
    const sessionPath = path.join(root, "sessions.db");
    const port = 46600 + Math.floor(Math.random() * 200);
    const baseUrl = `http://127.0.0.1:${port}`;

    process.env.MATMIX_DB_PATH = databasePath;
    const database = require("../database");
    await database.initDatabase();
    await new Promise((resolve, reject) => database.db.close(error => error ? reject(error) : resolve()));
    await migrateDatabase(databasePath, { dryRun: false });
    await assertMigration(root, databasePath);

    const db = await openDatabase(databasePath);
    const adminOne = await addUser(db, { login: "notification_admin_1", role: "admin" });
    const adminTwo = await addUser(db, { login: "notification_admin_2", role: "admin" });
    const managerOne = await addUser(db, { login: "notification_manager_1", role: "manager" });
    const managerTwo = await addUser(db, { login: "notification_manager_2", role: "manager" });
    const unsupported = await addUser(db, { login: "notification_viewer", role: "viewer" });
    const inactive = await addUser(db, { login: "notification_inactive", role: "manager", active: 0 });

    const unassignedOrder = await addOrder(db, { customerName: "Unassigned order" });
    const managerOneOrder = await addOrder(db, {
        customerName: "Manager one order",
        managerId: managerOne.id,
        status: "В работе"
    });
    const managerTwoOrder = await addOrder(db, {
        customerName: "Manager two order",
        managerId: managerTwo.id,
        status: "В работе"
    });
    const managerTwoHiddenOrder = await addOrder(db, {
        customerName: "Manager two hidden order",
        managerId: managerTwo.id,
        status: "В работе"
    });
    await addOrder(db, {
        customerName: "Deleted order",
        deletedAt: new Date().toISOString()
    });
    await assertForeignKeyCascades(db);
    const managerOneHighOrder = await addOrder(db, {
        customerName: "Manager one higher order",
        managerId: managerOne.id,
        status: "В работе"
    });
    assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
    assert.strictEqual((await db.get("PRAGMA integrity_check")).integrity_check, "ok");
    await db.close();

    const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
        cwd: path.resolve(__dirname, "..", ".."),
        windowsHide: true,
        stdio: "ignore",
        env: {
            ...process.env,
            NODE_ENV: "test",
            PORT: String(port),
            SESSION_SECRET: "order-notification-test-secret-123456789012345",
            MATMIX_DB_PATH: databasePath,
            SESSION_DB_PATH: sessionPath,
            APP_RUNTIME_LOCK_PATH: lockPath,
            PUBLIC_BASE_URL: baseUrl,
            SEO_ALLOW_INDEXING: "false"
        }
    });

    try {
        await waitForServer(`${baseUrl}/health`);
        const unauthenticated = await requestJson(baseUrl, "/api/order-notifications/summary");
        assert.strictEqual(unauthenticated.response.status, 401);

        const adminOneCookie = await login(baseUrl, adminOne.login, adminOne.password);
        const adminTwoCookie = await login(baseUrl, adminTwo.login, adminTwo.password);
        const managerOneCookie = await login(baseUrl, managerOne.login, managerOne.password);
        const managerTwoCookie = await login(baseUrl, managerTwo.login, managerTwo.password);
        const unsupportedCookie = await login(baseUrl, unsupported.login, unsupported.password);

        const inactiveLogin = await requestJson(baseUrl, "/api/auth/login", {
            method: "POST",
            body: { login: inactive.login, password: inactive.password }
        });
        assert.strictEqual(inactiveLogin.response.status, 401);

        const forbiddenRole = await requestJson(baseUrl, "/api/order-notifications/summary", {
            cookie: unsupportedCookie
        });
        assert.strictEqual(forbiddenRole.response.status, 403);

        await assertSummary(baseUrl, adminOneCookie, 5);
        await assertSummary(baseUrl, adminTwoCookie, 5);
        await assertSummary(baseUrl, managerOneCookie, 3);
        await assertSummary(baseUrl, managerTwoCookie, 3);

        const managerOrders = await requestJson(baseUrl, "/api/orders", {
            cookie: managerOneCookie
        });
        assert.strictEqual(managerOrders.response.status, 200);
        assert.deepStrictEqual(
            new Set(managerOrders.payload.orders.map(order => order.id)),
            new Set([unassignedOrder, managerOneOrder, managerOneHighOrder])
        );
        assert(managerOrders.payload.orders.every(order => order.isNotificationRead === false));

        const untouchedReads = await openDatabase(databasePath);
        assert.strictEqual(Number((await untouchedReads.get("SELECT COUNT(*) AS count FROM order_notification_reads")).count), 0);
        await untouchedReads.close();

        const orderDetails = await requestJson(baseUrl, `/api/orders/${unassignedOrder}`, {
            cookie: managerOneCookie
        });
        assert.strictEqual(orderDetails.response.status, 200);
        assert.strictEqual(orderDetails.payload.order.isNotificationRead, false);
        await assertSummary(baseUrl, managerOneCookie, 3);

        const firstRead = await requestJson(baseUrl, `/api/orders/${unassignedOrder}/read`, {
            method: "POST",
            cookie: adminOneCookie
        });
        assert.strictEqual(firstRead.response.status, 200);
        assert.strictEqual(firstRead.payload.unreadCount, 4);
        await assertSummary(baseUrl, adminOneCookie, 4);
        await assertSummary(baseUrl, adminTwoCookie, 5);

        const repeatedRead = await requestJson(baseUrl, `/api/orders/${unassignedOrder}/read`, {
            method: "POST",
            cookie: adminOneCookie
        });
        assert.strictEqual(repeatedRead.response.status, 200);
        assert.strictEqual(repeatedRead.payload.unreadCount, 4);

        const inaccessible = await requestJson(baseUrl, `/api/orders/${managerTwoOrder}/read`, {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(inaccessible.response.status, 404);
        const nonexistent = await requestJson(baseUrl, "/api/orders/999999/read", {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(nonexistent.response.status, 404);
        assert.strictEqual(nonexistent.payload.message, inaccessible.payload.message);

        const sessionIdentityRead = await requestJson(
            baseUrl,
            `/api/orders/${unassignedOrder}/read?userId=${adminTwo.id}`,
            {
                method: "POST",
                cookie: managerOneCookie,
                body: { userId: adminTwo.id }
            }
        );
        assert.strictEqual(sessionIdentityRead.response.status, 200);
        await assertSummary(baseUrl, managerOneCookie, 2, `?userId=${adminTwo.id}`);
        await assertSummary(baseUrl, adminTwoCookie, 5);
        const managerOrdersAfterRead = await requestJson(baseUrl, "/api/orders", {
            cookie: managerOneCookie
        });
        assert.strictEqual(managerOrdersAfterRead.response.status, 200);
        assert.strictEqual(
            managerOrdersAfterRead.payload.orders.find(order => order.id === unassignedOrder)?.isNotificationRead,
            true
        );
        assert(
            managerOrdersAfterRead.payload.orders
                .filter(order => order.id !== unassignedOrder)
                .every(order => order.isNotificationRead === false)
        );
        const managerOrderDetailsAfterRead = await requestJson(baseUrl, `/api/orders/${unassignedOrder}`, {
            cookie: managerOneCookie
        });
        assert.strictEqual(managerOrderDetailsAfterRead.response.status, 200);
        assert.strictEqual(managerOrderDetailsAfterRead.payload.order.isNotificationRead, true);
        const adminTwoOrderDetails = await requestJson(baseUrl, `/api/orders/${unassignedOrder}`, {
            cookie: adminTwoCookie
        });
        assert.strictEqual(adminTwoOrderDetails.response.status, 200);
        assert.strictEqual(adminTwoOrderDetails.payload.order.isNotificationRead, false);

        const readAll = await requestJson(baseUrl, "/api/order-notifications/read-all", {
            method: "POST",
            cookie: managerOneCookie,
            body: { userId: adminTwo.id }
        });
        assert.strictEqual(readAll.response.status, 200);
        assert.strictEqual(readAll.payload.unreadCount, 0);
        await assertSummary(baseUrl, managerOneCookie, 0);
        await assertSummary(baseUrl, managerTwoCookie, 3);
        const managerOrdersAfterReadAll = await requestJson(baseUrl, "/api/orders", {
            cookie: managerOneCookie
        });
        assert.strictEqual(managerOrdersAfterReadAll.response.status, 200);
        assert(managerOrdersAfterReadAll.payload.orders.every(order => order.isNotificationRead === true));

        const hiddenStatusChange = await requestJson(
            baseUrl,
            `/api/orders/${managerTwoHiddenOrder}/status`,
            {
                method: "PATCH",
                cookie: managerTwoCookie,
                body: { status: "Ожидает клиента" }
            }
        );
        assert.strictEqual(hiddenStatusChange.response.status, 200);
        await assertSummary(baseUrl, managerOneCookie, 0);

        const oldOrderRelease = await requestJson(baseUrl, `/api/orders/${managerTwoOrder}/release`, {
            method: "POST",
            cookie: managerTwoCookie
        });
        assert.strictEqual(oldOrderRelease.response.status, 200);
        await assertSummary(baseUrl, managerOneCookie, 1);

        const oldOrderTake = await requestJson(baseUrl, `/api/orders/${managerTwoOrder}/take`, {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(oldOrderTake.response.status, 200);
        assert(managerTwoOrder < managerOneHighOrder);
        await assertSummary(baseUrl, managerOneCookie, 1);
        await assertSummary(baseUrl, managerTwoCookie, 2);

        const reassignedRead = await requestJson(baseUrl, `/api/orders/${managerTwoOrder}/read`, {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(reassignedRead.response.status, 200);
        assert.strictEqual(reassignedRead.payload.unreadCount, 0);

        const repeatedTake = await requestJson(baseUrl, `/api/orders/${managerTwoOrder}/take`, {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(repeatedTake.response.status, 409);
        await assertSummary(baseUrl, managerOneCookie, 0);

        const releaseHidden = await requestJson(baseUrl, `/api/orders/${managerTwoHiddenOrder}/release`, {
            method: "POST",
            cookie: managerTwoCookie
        });
        assert.strictEqual(releaseHidden.response.status, 200);
        assert(managerTwoHiddenOrder < managerOneHighOrder);
        await assertSummary(baseUrl, managerOneCookie, 1);
        const releasedRead = await requestJson(baseUrl, `/api/orders/${managerTwoHiddenOrder}/read`, {
            method: "POST",
            cookie: managerOneCookie
        });
        assert.strictEqual(releasedRead.response.status, 200);
        assert.strictEqual(releasedRead.payload.unreadCount, 0);

        const liveDb = await openDatabase(databasePath);
        const futureOrder = await addOrder(liveDb, { customerName: "Future unassigned order" });
        await liveDb.close();
        await assertSummary(baseUrl, managerOneCookie, 1);
        await assertSummary(baseUrl, managerTwoCookie, 3);

        const futureTake = await requestJson(baseUrl, `/api/orders/${futureOrder}/take`, {
            method: "POST",
            cookie: managerTwoCookie
        });
        assert.strictEqual(futureTake.response.status, 200);
        await assertSummary(baseUrl, managerOneCookie, 0);
        await assertSummary(baseUrl, managerTwoCookie, 3);

        const adminReadAll = await requestJson(baseUrl, "/api/order-notifications/read-all", {
            method: "POST",
            cookie: adminOneCookie
        });
        assert.strictEqual(adminReadAll.response.status, 200);
        assert.strictEqual(adminReadAll.payload.unreadCount, 0);
        const futureDb = await openDatabase(databasePath);
        await addOrder(futureDb, { customerName: "Post read-all order" });
        await futureDb.close();
        await assertSummary(baseUrl, adminOneCookie, 1);
        await assertSummary(baseUrl, adminTwoCookie, 7);

        assert(managerOneOrder > 0);
    } finally {
        await stopServer(server);
        await fs.promises.rm(root, { recursive: true, force: true });
    }

    console.log(JSON.stringify({
        success: true,
        schema: "5->8",
        personalizedReadState: "ok",
        exactReadSet: "ok",
        olderOrderFirstAssignmentUnread: "ok",
        olderOrderFirstReleaseUnread: "ok",
        futureOrdersUnread: "ok",
        managerVisibility: "ok",
        idorProtection: "ok",
        foreignKeys: "ok",
        indexes: "ok",
        migrationRollback: "ok"
    }));
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
