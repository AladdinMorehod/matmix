const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const ExcelJS = require("exceljs");
const sqlite3 = require("sqlite3").verbose();
const { migrateDatabase } = require("../databaseMigrations");
const {
    MAX_ATTACHMENT_SIZE_BYTES
} = require("../services/orderAttachments");
const {
    MAX_FIELD_BYTES,
    sanitizeOriginalName
} = require("../services/fileRequestUpload");
const {
    createFileRequestRateLimiter
} = require("../services/fileRequestRateLimit");

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

function all(db, sql, params = []) {
    return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}

function close(db) {
    return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
}

async function waitForServer(url) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
        try {
            if ((await fetch(url)).ok) return;
        } catch {
            // The isolated test server is still starting.
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("File request test server did not start.");
}

async function stopServer(child) {
    if (child.exitCode !== null || child.signalCode !== null) return;
    child.kill("SIGTERM");
    await new Promise(resolve => child.once("exit", resolve));
}

function file(name, type, bytes) {
    return { name, type, bytes: Buffer.from(bytes) };
}

function defaultFields(overrides = {}) {
    return {
        customerName: "Тестовый клиент",
        phone: "+7 (999) 123-45-67",
        email: "request@example.test",
        comment: "Нужен расчёт материалов",
        paymentMethod: "cash",
        includeCart: "false",
        consent: "true",
        ...overrides
    };
}

function buildForm(fields = defaultFields(), files = []) {
    const form = new FormData();
    for (const [name, value] of Object.entries(fields)) {
        if (value !== undefined) form.append(name, String(value));
    }
    for (const upload of files) {
        form.append("files", new Blob([upload.bytes], { type: upload.type }), upload.name);
    }
    return form;
}

async function post(base, { fields = defaultFields(), files = [], form = null } = {}) {
    const response = await fetch(`${base}/api/orders/file-request`, {
        method: "POST",
        body: form || buildForm(fields, files)
    });
    const body = await response.json().catch(() => ({}));
    return { response, body };
}

function listStorage(storageRoot) {
    if (!fs.existsSync(storageRoot)) return [];
    return fs.readdirSync(storageRoot).sort();
}

async function expectRejected(base, storageRoot, expected, input) {
    const before = listStorage(storageRoot);
    const { response, body } = await post(base, input);
    assert.strictEqual(response.status, expected.status, JSON.stringify({ expected, body }));
    if (expected.code) assert.strictEqual(body.code, expected.code, JSON.stringify(body));
    assert(!JSON.stringify(body).includes(storageRoot), "Public error exposed the storage path.");
    assert.deepStrictEqual(listStorage(storageRoot), before, `Rejected request leaked a file: ${body.code}`);
    return body;
}

async function createXlsx() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Заявка");
    sheet.addRow(["Код", "Количество"]);
    sheet.addRow(["MAT-FILE-001", 2]);
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

function renameZipEntry(buffer, from, to) {
    assert.strictEqual(Buffer.byteLength(from), Buffer.byteLength(to));
    const result = Buffer.from(buffer);
    let offset = 0;
    while ((offset = result.indexOf(Buffer.from(from), offset)) !== -1) {
        result.write(to, offset, "utf8");
        offset += to.length;
    }
    return result;
}

function createZipBombMetadata(buffer) {
    const result = Buffer.from(buffer);
    const signature = Buffer.from([0x50, 0x4b, 0x01, 0x02]);
    const offset = result.indexOf(signature);
    assert(offset >= 0, "Expected an XLSX central-directory entry.");
    result.writeUInt32LE(0x7fffffff, offset + 24);
    return result;
}

async function abortMultipart(base, storageRoot) {
    const boundary = "matmix-client-abort";
    const url = new URL(`${base}/api/orders/file-request`);
    await new Promise(resolve => {
        const request = http.request({
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: "POST",
            headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` }
        });
        request.on("error", () => resolve());
        request.write(
            `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="abort.pdf"\r\n`
            + "Content-Type: application/pdf\r\n\r\n%PDF-1.4\n"
        );
        request.write(Buffer.alloc(256 * 1024, 1), () => request.destroy());
    });
    let stableEmptyChecks = 0;
    for (let attempt = 0; attempt < 100; attempt += 1) {
        if (!listStorage(storageRoot).some(name => name.startsWith("tmp-"))) {
            stableEmptyChecks += 1;
            if (stableEmptyChecks >= 10) return;
        } else {
            stableEmptyChecks = 0;
        }
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.fail("Client abort left a temporary upload.");
}

function testRateLimiter() {
    let time = 1000;
    const middleware = createFileRequestRateLimiter({
        windowMs: 5000,
        maxAttempts: 2,
        maxKeys: 10,
        now: () => time
    });
    const responses = [];
    const invoke = ip => {
        let passed = false;
        const response = {
            headers: {},
            setHeader(name, value) { this.headers[name] = value; },
            status(value) { this.statusCode = value; return this; },
            json(value) { responses.push({ status: this.statusCode, value, headers: this.headers }); }
        };
        middleware({ ip }, response, () => { passed = true; });
        return passed;
    };
    assert.strictEqual(invoke("127.0.0.1"), true);
    assert.strictEqual(invoke("127.0.0.1"), true);
    assert.strictEqual(invoke("127.0.0.1"), false);
    assert.strictEqual(responses[0].status, 429);
    assert.strictEqual(responses[0].value.code, "FILE_REQUEST_RATE_LIMITED");
    time += 5001;
    assert.strictEqual(invoke("127.0.0.1"), true);
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-file-request-api-"));
    const dbPath = path.join(root, "matmix.db");
    const storageRoot = path.join(root, "private", "order-attachments");
    const uploadsRoot = path.join(root, "uploads");
    const moveFailureMarker = path.join(root, "fail-move");
    const preloadPath = path.join(root, "fail-attachment-move.js");
    let child;

    try {
        process.env.MATMIX_DB_PATH = dbPath;
        const { initDatabase, db: initializationDb } = require("../database");
        await initDatabase();
        await close(initializationDb);
        await migrateDatabase(dbPath, { dryRun: false });

        fs.mkdirSync(uploadsRoot, { recursive: true });
        fs.writeFileSync(preloadPath, `
            const fs = require("fs");
            const originalRename = fs.promises.rename.bind(fs.promises);
            fs.promises.rename = async function(source, target) {
                if (process.env.FILE_REQUEST_FAIL_MOVE_MARKER
                    && fs.existsSync(process.env.FILE_REQUEST_FAIL_MOVE_MARKER)
                    && String(source).includes("order-attachments")) {
                    const error = new Error("Injected attachment move failure");
                    error.code = "EACCES";
                    throw error;
                }
                return originalRename(source, target);
            };
        `);

        const fixtureDb = open(dbPath);
        const now = new Date().toISOString();
        const productResult = await run(
            fixtureDb,
            `INSERT INTO products (
                external_id, title, category, price, weight, unit, description,
                is_active, sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)`,
            ["MAT-FILE-001", "Тестовый материал", "Тест", 125.5, 2.75, "шт", "Тест", now, now]
        );
        await close(fixtureDb);

        const port = 44800 + Math.floor(Math.random() * 500);
        const base = `http://127.0.0.1:${port}`;
        child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
            cwd: path.join(__dirname, "..", ".."),
            windowsHide: true,
            stdio: ["ignore", "ignore", "inherit"],
            env: {
                ...process.env,
                NODE_OPTIONS: `--require=${preloadPath}`,
                NODE_ENV: "test",
                PORT: String(port),
                SESSION_SECRET: "file-request-test-secret-12345678901234567890",
                MATMIX_DB_PATH: dbPath,
                SESSION_DB_PATH: path.join(root, "sessions.db"),
                PRODUCT_UPLOADS_PATH: uploadsRoot,
                ORDER_ATTACHMENTS_PATH: storageRoot,
                APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock"),
                PUBLIC_BASE_URL: base,
                SEO_ALLOW_INDEXING: "true",
                FILE_REQUEST_RATE_MAX: "1000",
                FILE_REQUEST_FAIL_MOVE_MARKER: moveFailureMarker
            }
        });
        await waitForServer(`${base}/health`);

        const pdf = file("request.pdf", "application/pdf", Buffer.from("%PDF-1.4\n%%EOF", "ascii"));
        const jpeg = file("photo.jpg", "image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]));
        const png = file("plan.png", "image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1]));
        const xls = file("legacy.xls", "application/vnd.ms-excel", Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 1]));
        const csv = file("items.csv", "text/csv", Buffer.from("code,qty\nMAT-FILE-001,2\n", "utf8"));
        const xlsxBuffer = await createXlsx();
        const xlsx = file(
            "items.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            xlsxBuffer
        );

        let result = await post(base, { files: [pdf] });
        assert.strictEqual(result.response.status, 201, JSON.stringify(result.body));
        assert.strictEqual(result.body.requestType, "file_request");
        assert.strictEqual(result.body.attachmentCount, 1);
        assert.strictEqual(result.body.totalPrice, 0);
        assert.strictEqual(result.body.totalWeight, 0);
        assert(!("storageKey" in result.body) && !("path" in result.body));

        result = await post(base, { files: [jpeg, png, xls, csv, pdf] });
        assert.strictEqual(result.response.status, 201, JSON.stringify(result.body));
        assert.strictEqual(result.body.attachmentCount, 5);

        result = await post(base, { files: [xlsx] });
        assert.strictEqual(result.response.status, 201, JSON.stringify(result.body));

        const sanitizedNamesResult = await post(base, {
            files: [
                file("../../traversal.pdf", "application/pdf", pdf.bytes),
                file("C:\\temp\\windows.pdf", "application/pdf", pdf.bytes)
            ]
        });
        assert.strictEqual(sanitizedNamesResult.response.status, 201, JSON.stringify(sanitizedNamesResult.body));

        const cartFields = defaultFields({
            includeCart: "true",
            items: JSON.stringify([{ productId: productResult.id, qty: 2, price: 0.01, title: "Подмена" }])
        });
        result = await post(base, { fields: cartFields, files: [pdf] });
        assert.strictEqual(result.response.status, 201, JSON.stringify(result.body));
        assert.strictEqual(result.body.totalPrice, 251);
        assert.strictEqual(result.body.totalWeight, 5.5);

        const verificationDb = open(dbPath);
        const savedOrder = await get(verificationDb, "SELECT * FROM orders WHERE id=?", [result.body.id]);
        assert.strictEqual(savedOrder.request_type, "file_request");
        assert.strictEqual(savedOrder.email, "request@example.test");
        assert.strictEqual(savedOrder.phone, "+79991234567");
        assert.strictEqual(savedOrder.status, "Новая");
        assert.strictEqual(JSON.parse(savedOrder.items_json)[0].price, 125.5);
        assert.strictEqual(Number(savedOrder.total_price), 251);
        assert.strictEqual(Number(savedOrder.total_weight), 5.5);
        assert.strictEqual(Number((await get(verificationDb, "SELECT COUNT(*) count FROM order_events WHERE order_id=?", [savedOrder.id])).count), 1);
        const savedAttachments = await all(verificationDb, "SELECT * FROM order_attachments ORDER BY id");
        assert(savedAttachments.length >= 10);
        const normalizedMimeTypes = new Set(savedAttachments.map(attachment => attachment.mime_type));
        for (const expectedMime of [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv"
        ]) {
            assert(normalizedMimeTypes.has(expectedMime), `Missing normalized MIME ${expectedMime}`);
        }
        const sanitizedNames = await all(
            verificationDb,
            "SELECT original_name FROM order_attachments WHERE order_id=? ORDER BY id",
            [sanitizedNamesResult.body.id]
        );
        assert.deepStrictEqual(sanitizedNames.map(row => row.original_name), ["traversal.pdf", "windows.pdf"]);
        for (const attachment of savedAttachments) {
            const content = fs.readFileSync(path.join(storageRoot, attachment.storage_key));
            assert.strictEqual(content.length, attachment.size_bytes);
            assert.strictEqual(crypto.createHash("sha256").update(content).digest("hex"), attachment.sha256);
            assert(!attachment.storage_key.includes(attachment.original_name));
        }
        await close(verificationDb);

        const requiredCases = [
            [{ customerName: undefined }, "REQUIRED_FIELD"],
            [{ phone: undefined }, "REQUIRED_FIELD"],
            [{ phone: "123" }, "INVALID_PHONE"],
            [{ email: "invalid" }, "INVALID_EMAIL"],
            [{ comment: "   " }, "REQUIRED_FIELD"],
            [{ paymentMethod: "bitcoin" }, "INVALID_PAYMENT_METHOD"],
            [{ consent: undefined }, "CONSENT_REQUIRED"],
            [{ consent: "false" }, "CONSENT_REQUIRED"],
            [{ includeCart: "yes" }, "INVALID_BOOLEAN"]
        ];
        for (const [overrides, code] of requiredCases) {
            await expectRejected(base, storageRoot, { status: 400, code }, {
                fields: defaultFields(overrides),
                files: [pdf]
            });
        }

        const duplicate = buildForm(defaultFields(), [pdf]);
        duplicate.append("customerName", "Дубликат");
        await expectRejected(base, storageRoot, { status: 400, code: "DUPLICATE_FIELD" }, { form: duplicate });

        const oversizedField = defaultFields({ comment: "x".repeat(MAX_FIELD_BYTES + 1) });
        await expectRejected(base, storageRoot, { status: 413, code: "FIELD_TOO_LARGE" }, { fields: oversizedField, files: [pdf] });

        await expectRejected(base, storageRoot, { status: 400, code: "EMPTY_CART" }, {
            fields: defaultFields({ includeCart: "true", items: undefined }),
            files: [pdf]
        });
        await expectRejected(base, storageRoot, { status: 400, code: "EMPTY_CART" }, {
            fields: defaultFields({ includeCart: "true", items: "[]" }),
            files: [pdf]
        });
        await expectRejected(base, storageRoot, { status: 400, code: "INVALID_ITEMS_JSON" }, {
            fields: defaultFields({ includeCart: "true", items: "[" }),
            files: [pdf]
        });
        await expectRejected(base, storageRoot, { status: 404, code: "PRODUCT_NOT_FOUND" }, {
            fields: defaultFields({ includeCart: "true", items: JSON.stringify([{ productId: 999999, qty: 1 }]) }),
            files: [pdf]
        });
        await expectRejected(base, storageRoot, { status: 400, code: "INVALID_QUANTITY" }, {
            fields: defaultFields({ includeCart: "true", items: JSON.stringify([{ productId: productResult.id, qty: 0 }]) }),
            files: [pdf]
        });
        result = await post(base, {
            fields: defaultFields({
                includeCart: "false",
                items: JSON.stringify([{ productId: 999999, qty: 1 }])
            }),
            files: [pdf]
        });
        assert.strictEqual(result.response.status, 201, JSON.stringify(result.body));
        assert.strictEqual(result.body.totalPrice, 0);

        await expectRejected(base, storageRoot, { status: 400, code: "FILES_REQUIRED" }, { fields: defaultFields(), files: [] });
        await expectRejected(base, storageRoot, { status: 400, code: "TOO_MANY_FILES" }, {
            files: Array.from({ length: 6 }, (_, index) => file(`file-${index}.pdf`, "application/pdf", pdf.bytes))
        });
        await expectRejected(base, storageRoot, { status: 413, code: "FILE_TOO_LARGE" }, {
            files: [file("large.pdf", "application/pdf", Buffer.alloc(MAX_ATTACHMENT_SIZE_BYTES + 1, 1))]
        });
        await expectRejected(base, storageRoot, { status: 413, code: "TOTAL_FILES_TOO_LARGE" }, {
            files: Array.from({ length: 4 }, (_, index) => file(`total-${index}.pdf`, "application/pdf", Buffer.alloc(13 * 1024 * 1024, 1)))
        });
        await expectRejected(base, storageRoot, { status: 400, code: "EMPTY_FILE" }, {
            files: [file("empty.pdf", "application/pdf", Buffer.alloc(0))]
        });
        await expectRejected(base, storageRoot, { status: 415, code: "UNSUPPORTED_FILE_FORMAT" }, {
            files: [file("unsafe.exe", "application/octet-stream", Buffer.from("MZ"))]
        });
        await expectRejected(base, storageRoot, { status: 400, code: "FILE_NAME_TOO_LONG" }, {
            files: [file(`${"a".repeat(256)}.pdf`, "application/pdf", pdf.bytes)]
        });
        await expectRejected(base, storageRoot, { status: 415, code: "MIME_MISMATCH" }, {
            files: [file("spoof.pdf", "text/plain", pdf.bytes)]
        });
        await expectRejected(base, storageRoot, { status: 400, code: "CORRUPT_FILE" }, {
            files: [file("spoof.png", "image/png", pdf.bytes)]
        });
        for (const corrupt of [
            file("bad.pdf", "application/pdf", Buffer.from("not pdf")),
            file("bad.jpg", "image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 1])),
            file("bad.png", "image/png", Buffer.from("not png")),
            file("bad.xls", "application/vnd.ms-excel", Buffer.from("not xls")),
            file("bad.csv", "text/csv", Buffer.from([0, 1, 2, 3]))
        ]) {
            await expectRejected(base, storageRoot, { status: 400, code: "CORRUPT_FILE" }, { files: [corrupt] });
        }
        await expectRejected(base, storageRoot, { status: 400, code: "CORRUPT_FILE" }, {
            files: [file(
                "not-ooxml.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                renameZipEntry(xlsxBuffer, "[Content_Types].xml", "[Content_Typez].xml")
            )]
        });
        await expectRejected(base, storageRoot, { status: 400 }, {
            files: [file(
                "bomb.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                createZipBombMetadata(xlsxBuffer)
            )]
        });

        assert.strictEqual(sanitizeOriginalName("../../safe.pdf"), "safe.pdf");
        assert.strictEqual(sanitizeOriginalName("C:\\temp\\safe.pdf"), "safe.pdf");
        assert.throws(() => sanitizeOriginalName("safe\u0000.pdf"), error => error.code === "INVALID_FILE_NAME");
        assert.strictEqual(sanitizeOriginalName("safe\u0001.pdf"), "safe.pdf");
        assert.throws(() => sanitizeOriginalName(`${"a".repeat(256)}.pdf`), error => error.code === "FILE_NAME_TOO_LONG");

        const unexpected = buildForm(defaultFields(), [pdf]);
        unexpected.append("unexpected", "value");
        await expectRejected(base, storageRoot, { status: 400, code: "UNEXPECTED_FIELD" }, { form: unexpected });

        let response = await fetch(`${base}/api/orders/file-request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}"
        });
        assert.strictEqual(response.status, 415);
        response = await fetch(`${base}/api/orders/file-request`, {
            method: "POST",
            headers: { "Content-Type": "multipart/form-data; boundary=broken" },
            body: "--broken\r\nContent-Disposition: form-data; name=\"files\"; filename=\"broken.pdf\"\r\n\r\n%PDF"
        });
        assert.strictEqual(response.status, 400);
        assert(!listStorage(storageRoot).some(name => name.startsWith("tmp-")));

        await abortMultipart(base, storageRoot);

        const beforeFailureDb = open(dbPath);
        const beforeFailureCounts = await get(
            beforeFailureDb,
            "SELECT (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM order_attachments) attachments"
        );
        await run(
            beforeFailureDb,
            `CREATE TRIGGER fail_file_request_metadata
             BEFORE INSERT ON order_attachments BEGIN
                SELECT RAISE(FAIL, 'injected metadata failure');
             END`
        );
        await close(beforeFailureDb);
        await expectRejected(base, storageRoot, { status: 409, code: "DATABASE_CONFLICT" }, { files: [pdf] });
        const removeTriggerDb = open(dbPath);
        await run(removeTriggerDb, "DROP TRIGGER fail_file_request_metadata");
        assert.deepStrictEqual(
            await get(removeTriggerDb, "SELECT (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM order_attachments) attachments"),
            beforeFailureCounts
        );
        await close(removeTriggerDb);

        fs.writeFileSync(moveFailureMarker, "fail");
        await expectRejected(base, storageRoot, { status: 500, code: "FILE_REQUEST_FAILED" }, { files: [pdf] });
        fs.rmSync(moveFailureMarker);
        const afterMoveFailureDb = open(dbPath);
        assert.deepStrictEqual(
            await get(afterMoveFailureDb, "SELECT (SELECT COUNT(*) FROM orders) orders, (SELECT COUNT(*) FROM order_attachments) attachments"),
            beforeFailureCounts
        );
        await close(afterMoveFailureDb);
        assert(!listStorage(storageRoot).some(name => name.startsWith("tmp-")));

        testRateLimiter();

        console.log(JSON.stringify({
            success: true,
            endpoint: "POST /api/orders/file-request",
            streamingMultipart: "busboy@1.6.0",
            formats: ["pdf", "jpg", "jpeg", "png", "xls", "xlsx", "csv"],
            serverTotals: "verified",
            metadataAndPrivateFiles: "verified",
            sha256AndSize: "verified",
            validationAndSpoofing: "rejected",
            xlsxStructureAndBombMetadata: "rejected",
            parserAndClientAbortCleanup: "verified",
            databaseAndMoveRollback: "verified",
            rateLimit: "verified"
        }));
    } finally {
        if (child) await stopServer(child);
        fs.rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
