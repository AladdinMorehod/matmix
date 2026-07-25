const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const { migrateDatabase } = require("../databaseMigrations");

function open(file) {
    return new sqlite3.Database(file);
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => db.run(sql, params, function done(error) {
        error ? reject(error) : resolve({ id: this.lastID, changes: this.changes });
    }));
}

function get(db, sql, params = []) {
    return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

function close(db) {
    return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
}

function sha256(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}

async function waitForServer(url) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
        try {
            if ((await fetch(url)).ok) return;
        } catch {
            // The isolated server is still starting.
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("CRM attachment test server did not start.");
}

async function stopServer(child) {
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    child.kill("SIGTERM");
    await new Promise(resolve => child.once("exit", resolve));
}

function sessionCookie(response) {
    return response.headers.getSetCookie?.()[0]?.split(";")[0]
        || response.headers.get("set-cookie")?.split(";")[0]
        || "";
}

async function login(base, loginName, password) {
    const response = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginName, password })
    });
    assert.strictEqual(response.status, 200);
    const cookie = sessionCookie(response);
    assert(cookie, "Authenticated session cookie is required.");
    return cookie;
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({}));
    return { response, body };
}

async function seedAttachment(db, storageRoot, orderId, fixture) {
    const content = Buffer.from(fixture.content);
    fs.writeFileSync(path.join(storageRoot, fixture.storageKey), content);
    const result = await run(
        db,
        `INSERT INTO order_attachments (
            order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            orderId,
            fixture.originalName,
            fixture.storageKey,
            fixture.mimeType,
            fixture.extension,
            content.length,
            sha256(content),
            fixture.createdAt
        ]
    );
    return { ...fixture, id: result.id, content };
}

async function abortDownload(base, cookie, orderId, attachmentId) {
    const url = new URL(`${base}/api/orders/${orderId}/attachments/${attachmentId}/download`);
    await new Promise(resolve => {
        const request = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: { Cookie: cookie }
        }, response => {
            response.once("data", () => {
                request.destroy();
                response.destroy();
                resolve();
            });
        });
        request.on("error", () => resolve());
        request.end();
    });
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-crm-attachments-"));
    const dbPath = path.join(root, "matmix.db");
    const storageRoot = path.join(root, "order-attachments");
    const port = 4280 + Math.floor(Math.random() * 200);
    const base = `http://127.0.0.1:${port}`;
    let child;
    let db;

    try {
        process.env.MATMIX_DB_PATH = dbPath;
        const { initDatabase, db: initializationDb } = require("../database");
        await initDatabase();
        await close(initializationDb);
        await migrateDatabase(dbPath, { dryRun: false });

        fs.mkdirSync(storageRoot, { recursive: true });
        db = open(dbPath);
        await run(db, "PRAGMA foreign_keys=ON");
        const now = new Date().toISOString();
        const earlier = new Date(Date.now() - 60_000).toISOString();
        const password = "AttachmentTest!234";
        const users = {};
        for (const [loginName, role] of [["attach_admin", "admin"], ["attach_manager", "manager"], ["attach_other", "manager"]]) {
            const result = await run(
                db,
                "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)",
                [loginName, await bcrypt.hash(password, 10), role, loginName, now, now]
            );
            users[loginName] = result.id;
        }

        const ordinary = await run(
            db,
            `INSERT INTO orders (
                order_number, customer_name, phone, request_type, items_json,
                total_price, total_weight, status, manager_id, created_at, updated_at
            ) VALUES ('ATT-ORDINARY', 'Ordinary', '+79000000001', 'order', '[]', 0, 0, 'Новая', ?, ?, ?)`,
            [users.attach_admin, now, now]
        );
        const fileOrder = await run(
            db,
            `INSERT INTO orders (
                order_number, customer_name, phone, email, request_type, items_json,
                total_price, total_weight, status, manager_id, created_at, updated_at
            ) VALUES ('ATT-FILES', 'Files', '+79000000002', 'snapshot@example.test', 'file_request', '[]', 0, 0, 'Новая', ?, ?, ?)`,
            [users.attach_manager, now, now]
        );
        const secondOrder = await run(
            db,
            `INSERT INTO orders (
                order_number, customer_name, phone, request_type, items_json,
                total_price, total_weight, status, manager_id, created_at, updated_at
            ) VALUES ('ATT-OTHER', 'Other', '+79000000003', 'file_request', '[]', 0, 0, 'Новая', ?, ?, ?)`,
            [users.attach_other, now, now]
        );

        const first = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Смета проекта.xlsx",
            storageKey: "estimate-safe.xlsx",
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            extension: "xlsx",
            content: "estimate bytes",
            createdAt: earlier
        });
        const second = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "План.pdf",
            storageKey: "plan-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: "%PDF-1.4 plan bytes",
            createdAt: now
        });
        const txtContent = Buffer.from("CRM TXT русский текст\r\nSecond line\n", "utf8");
        const txtAttachment = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Комментарий.txt",
            storageKey: "comment-safe.txt",
            mimeType: "text/plain",
            extension: "txt",
            content: txtContent,
            createdAt: now
        });
        const otherAttachment = await seedAttachment(db, storageRoot, secondOrder.id, {
            originalName: "Other.pdf",
            storageKey: "other-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: "%PDF other",
            createdAt: now
        });
        const missing = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Missing.pdf",
            storageKey: "missing-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: "%PDF missing",
            createdAt: now
        });
        fs.unlinkSync(path.join(storageRoot, missing.storageKey));
        const mismatch = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Mismatch.pdf",
            storageKey: "mismatch-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: "%PDF mismatch",
            createdAt: now
        });
        fs.appendFileSync(path.join(storageRoot, mismatch.storageKey), "changed");
        const abortFixture = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Large.pdf",
            storageKey: "large-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: Buffer.alloc(2 * 1024 * 1024, 7),
            createdAt: now
        });
        const headerFixture = await seedAttachment(db, storageRoot, fileOrder.id, {
            originalName: "Смета\r\nX-Injected: yes.pdf",
            storageKey: "header-safe.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            content: "%PDF header",
            createdAt: now
        });
        let symlinkFixture = null;
        const outsideFile = path.join(root, "outside.pdf");
        fs.writeFileSync(outsideFile, "%PDF outside");
        try {
            const storageKey = "symlink-safe.pdf";
            fs.symlinkSync(outsideFile, path.join(storageRoot, storageKey), "file");
            const result = await run(
                db,
                `INSERT INTO order_attachments (
                    order_id, original_name, storage_key, mime_type, extension, size_bytes, sha256, created_at
                ) VALUES (?, ?, ?, 'application/pdf', 'pdf', ?, ?, ?)`,
                [fileOrder.id, "Symlink.pdf", storageKey, fs.statSync(outsideFile).size, sha256(fs.readFileSync(outsideFile)), now]
            );
            symlinkFixture = { id: result.id };
        } catch (error) {
            if (!["EPERM", "EACCES", "UNKNOWN"].includes(error.code)) throw error;
            console.log(`Symlink download check skipped on this platform: ${error.code}`);
        }
        const expectedAttachmentCount = 7 + (symlinkFixture ? 1 : 0);
        await close(db);
        db = null;

        child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
            cwd: path.resolve(__dirname, "..", ".."),
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
            env: {
                ...process.env,
                NODE_ENV: "test",
                PORT: String(port),
                SESSION_SECRET: "crm-attachment-test-secret-1234567890",
                MATMIX_DB_PATH: dbPath,
                SESSION_DB_PATH: path.join(root, "sessions.db"),
                ORDER_ATTACHMENTS_PATH: storageRoot,
                PRODUCT_UPLOADS_PATH: path.join(root, "uploads"),
                BACKUP_ROOT_PATH: path.join(root, "backups"),
                APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock"),
                PUBLIC_BASE_URL: base,
                SEO_ALLOW_INDEXING: "false"
            }
        });
        let serverErrors = "";
        child.stderr.on("data", chunk => { serverErrors += chunk.toString(); });
        await waitForServer(`${base}/health`);

        let result = await requestJson(`${base}/api/orders`);
        assert.strictEqual(result.response.status, 401);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments`);
        assert.strictEqual(result.response.status, 401);
        const anonymousDownload = await fetch(`${base}/api/orders/${fileOrder.id}/attachments/${first.id}/download`);
        assert.strictEqual(anonymousDownload.status, 401);

        const adminCookie = await login(base, "attach_admin", password);
        const managerCookie = await login(base, "attach_manager", password);
        const otherCookie = await login(base, "attach_other", password);

        result = await requestJson(`${base}/api/orders`, { headers: { Cookie: adminCookie } });
        const ordinaryMetadata = result.body.orders.find(order => order.id === ordinary.id);
        const fileMetadata = result.body.orders.find(order => order.id === fileOrder.id);
        assert.strictEqual(ordinaryMetadata.requestType, "order");
        assert.strictEqual(ordinaryMetadata.attachmentCount, 0);
        assert.strictEqual(fileMetadata.requestType, "file_request");
        assert.strictEqual(fileMetadata.attachmentCount, expectedAttachmentCount);

        result = await requestJson(`${base}/api/orders/${fileOrder.id}`, { headers: { Cookie: managerCookie } });
        assert.strictEqual(result.response.status, 200);
        assert.strictEqual(result.body.order.email, "snapshot@example.test");
        assert.strictEqual(result.body.order.requestType, "file_request");
        assert.strictEqual(result.body.order.attachmentCount, expectedAttachmentCount);

        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments`, { headers: { Cookie: managerCookie } });
        assert.strictEqual(result.response.status, 200);
        assert.deepStrictEqual(result.body.attachments.slice(0, 2).map(item => item.id), [first.id, second.id]);
        const serializedMetadata = JSON.stringify(result.body);
        assert(!serializedMetadata.includes("storageKey"));
        assert(!serializedMetadata.includes("storage_key"));
        assert(!serializedMetadata.includes("sha256"));
        assert(!serializedMetadata.includes(storageRoot));
        assert(result.body.attachments.every(item => item.downloadUrl.startsWith(`/api/orders/${fileOrder.id}/attachments/`)));
        const txtMetadata = result.body.attachments.find(item => item.id === txtAttachment.id);
        assert.strictEqual(txtMetadata.originalName, "Комментарий.txt");
        assert.strictEqual(txtMetadata.extension, "txt");
        assert.strictEqual(txtMetadata.mimeType, "text/plain");
        assert(!/[ÐÑ]/.test(txtMetadata.originalName));

        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments`, { headers: { Cookie: otherCookie } });
        assert.strictEqual(result.response.status, 403);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments`, { headers: { Cookie: adminCookie } });
        assert.strictEqual(result.response.status, 200);
        result = await requestJson(`${base}/api/orders/999999/attachments`, { headers: { Cookie: adminCookie } });
        assert.strictEqual(result.response.status, 404);
        result = await requestJson(`${base}/api/orders/not-an-id/attachments`, { headers: { Cookie: adminCookie } });
        assert.strictEqual(result.response.status, 400);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/999999/download`, { headers: { Cookie: adminCookie } });
        assert.strictEqual(result.response.status, 404);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/${otherAttachment.id}/download`, { headers: { Cookie: adminCookie } });
        assert.strictEqual(result.response.status, 404);

        const download = await fetch(`${base}/api/orders/${fileOrder.id}/attachments/${first.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(download.status, 200);
        assert.strictEqual(download.headers.get("content-length"), String(first.content.length));
        assert.strictEqual(download.headers.get("content-type"), first.mimeType);
        assert.strictEqual(download.headers.get("cache-control"), "private, no-store");
        assert.strictEqual(download.headers.get("x-content-type-options"), "nosniff");
        const disposition = download.headers.get("content-disposition");
        assert(disposition.includes("attachment;"));
        assert(disposition.includes(`filename="attachment-${first.id}.xlsx"`));
        assert(disposition.includes("filename*=UTF-8''"));
        assert(!/[\r\n]/.test(disposition));
        assert(!disposition.includes(first.storageKey));
        assert(!disposition.includes(storageRoot));
        assert.deepStrictEqual(Buffer.from(await download.arrayBuffer()), first.content);

        const txtDownload = await fetch(`${base}/api/orders/${fileOrder.id}/attachments/${txtAttachment.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(txtDownload.status, 200);
        assert.strictEqual(txtDownload.headers.get("content-type"), "text/plain");
        assert.strictEqual(txtDownload.headers.get("cache-control"), "private, no-store");
        assert.strictEqual(txtDownload.headers.get("x-content-type-options"), "nosniff");
        const txtDisposition = txtDownload.headers.get("content-disposition");
        assert(txtDisposition.includes("attachment;"));
        assert(txtDisposition.includes(`filename="attachment-${txtAttachment.id}.txt"`));
        assert(txtDisposition.includes(`filename*=UTF-8''${encodeURIComponent("Комментарий.txt")}`));
        assert(!/%25(?:D0|D1)/i.test(txtDisposition));
        assert(!/[\r\n]/.test(txtDisposition));
        assert(!txtDisposition.includes(txtAttachment.storageKey));
        assert(!txtDisposition.includes(storageRoot));
        assert.deepStrictEqual(Buffer.from(await txtDownload.arrayBuffer()), txtContent);

        const headerDownload = await fetch(`${base}/api/orders/${fileOrder.id}/attachments/${headerFixture.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(headerDownload.status, 200);
        const sanitizedDisposition = headerDownload.headers.get("content-disposition");
        assert(!/[\r\n]/.test(sanitizedDisposition));
        assert(!/%0D|%0A/i.test(sanitizedDisposition));
        if (symlinkFixture) {
            result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/${symlinkFixture.id}/download`, {
                headers: { Cookie: managerCookie }
            });
            assert.strictEqual(result.response.status, 410);
        }

        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/${first.id}/download`, {
            headers: { Cookie: otherCookie }
        });
        assert.strictEqual(result.response.status, 403);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/${missing.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(result.response.status, 410);
        assert.strictEqual(result.body.message, "Файл больше недоступен.");
        assert(!JSON.stringify(result.body).includes(storageRoot));
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/attachments/${mismatch.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(result.response.status, 410);

        await abortDownload(base, managerCookie, fileOrder.id, abortFixture.id);
        await new Promise(resolve => setTimeout(resolve, 100));
        assert.strictEqual(child.exitCode, null, `Server exited after client abort: ${serverErrors}`);

        result = await requestJson(`${base}/api/orders/${fileOrder.id}`, { headers: { Cookie: managerCookie } });
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/status`, {
            method: "PATCH",
            headers: { Cookie: managerCookie, "Content-Type": "application/json" },
            body: JSON.stringify({ status: "В работе", updatedAt: result.body.order.updatedAt })
        });
        assert.strictEqual(result.response.status, 200);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}`, { headers: { Cookie: managerCookie } });
        assert.strictEqual(result.body.order.status, "В работе");
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/release`, {
            method: "POST",
            headers: { Cookie: managerCookie, "Content-Type": "application/json" },
            body: JSON.stringify({ updatedAt: result.body.order.updatedAt })
        });
        assert.strictEqual(result.response.status, 200);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/take`, {
            method: "POST",
            headers: { Cookie: managerCookie, "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        assert.strictEqual(result.response.status, 200);
        result = await requestJson(`${base}/api/orders/${fileOrder.id}`, { headers: { Cookie: managerCookie } });
        const updatedAt = result.body.order.updatedAt;
        result = await requestJson(`${base}/api/orders/${fileOrder.id}`, {
            method: "DELETE",
            headers: { Cookie: managerCookie, "Content-Type": "application/json" },
            body: JSON.stringify({ updatedAt })
        });
        assert.strictEqual(result.response.status, 200);
        assert(fs.existsSync(path.join(storageRoot, first.storageKey)));
        db = open(dbPath);
        assert.strictEqual(
            (await get(db, "SELECT COUNT(*) count FROM order_attachments WHERE order_id = ?", [fileOrder.id])).count,
            expectedAttachmentCount
        );
        await close(db);
        db = null;
        result = await requestJson(`${base}/api/orders/${fileOrder.id}/restore`, {
            method: "POST",
            headers: { Cookie: managerCookie, "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        assert.strictEqual(result.response.status, 200);
        const restoredDownload = await fetch(`${base}/api/orders/${fileOrder.id}/attachments/${second.id}/download`, {
            headers: { Cookie: managerCookie }
        });
        assert.strictEqual(restoredDownload.status, 200);

        console.log("CRM order attachment API and download security tests passed.");
    } finally {
        if (db) await close(db).catch(() => {});
        await stopServer(child);
        fs.rmSync(root, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
