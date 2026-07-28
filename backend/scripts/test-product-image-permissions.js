const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const sqlite3 = require("sqlite3").verbose();

function open(file) {
    return new sqlite3.Database(file);
}

function run(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function done(error) {
            error ? reject(error) : resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function all(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
    });
}

async function waitFor(url) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
            const response = await fetch(url);
            if (response.status) return;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error("Test server did not start.");
}

function sessionCookie(response) {
    return response.headers.getSetCookie?.()[0]?.split(";")[0]
        || response.headers.get("set-cookie")?.split(";")[0]
        || "";
}

async function login(baseUrl, loginName, password) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: loginName, password })
    });
    assert.strictEqual(response.status, 200);
    const cookie = sessionCookie(response);
    assert(cookie);
    return cookie;
}

async function upload(baseUrl, endpoint, image, fields = {}, cookie = "") {
    const body = new FormData();
    body.append("image", new Blob([image], { type: "image/png" }), "permission-test.png");
    for (const [key, value] of Object.entries(fields)) {
        body.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
    return fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: cookie ? { Cookie: cookie } : {},
        body
    });
}

async function snapshot(dbPath, uploadsPath) {
    const db = open(dbPath);
    try {
        const products = await all(db, "SELECT id, image_url FROM products ORDER BY id");
        const files = fs.existsSync(uploadsPath)
            ? fs.readdirSync(uploadsPath).filter(name => !name.startsWith(".")).sort()
            : [];
        return { products, files };
    } finally {
        await new Promise(resolve => db.close(resolve));
    }
}

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-image-permissions-"));
    const dbPath = path.join(root, "matmix.db");
    const uploadsPath = path.join(root, "uploads");
    fs.mkdirSync(uploadsPath);

    process.env.MATMIX_DB_PATH = dbPath;
    const { initDatabase, db: initializationDb } = require("../database");
    await initDatabase();
    await new Promise((resolve, reject) => initializationDb.close(error => error ? reject(error) : resolve()));

    const db = open(dbPath);
    const now = new Date().toISOString();
    try {
        await run(
            db,
            `INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at)
             VALUES(?,?,?,?,1,?,?)`,
            ["image_admin", await bcrypt.hash("ImageAdmin!234", 10), "admin", "Image Admin", now, now]
        );
        await run(db, "DELETE FROM products");
        for (let index = 1; index <= 3; index += 1) {
            await run(
                db,
                `INSERT INTO products(
                    external_id,title,category,subcategory,product_group,price,weight,unit,
                    description,is_active,sort_order,created_at,updated_at
                ) VALUES(?,?,?,?,?,?,?,?,?,1,?,?,?)`,
                [
                    `MAT-PERM-${String(index).padStart(3, "0")}`,
                    `Permission product ${index}`,
                    index < 3 ? "Permission category" : "Other category",
                    "Permission subcategory",
                    "Permission group",
                    100 * index,
                    index,
                    "шт",
                    "",
                    index,
                    now,
                    now
                ]
            );
        }
    } finally {
        await new Promise(resolve => db.close(resolve));
    }

    const port = 42000 + Math.floor(Math.random() * 1000);
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
        cwd: path.join(__dirname, "..", ".."),
        windowsHide: true,
        env: {
            ...process.env,
            NODE_ENV: "test",
            PORT: String(port),
            MATMIX_DB_PATH: dbPath,
            SESSION_DB_PATH: path.join(root, "sessions.db"),
            PRODUCT_UPLOADS_PATH: uploadsPath,
            APP_RUNTIME_LOCK_PATH: path.join(root, "runtime.lock")
        },
        stdio: ["ignore", "pipe", "pipe"]
    });
    child.stdout.resume();
    child.stderr.resume();

    try {
        const baseUrl = `http://127.0.0.1:${port}`;
        await waitFor(`${baseUrl}/api/public/products?limit=1`);
        const chiefCookie = await login(baseUrl, "admin", "admin123");
        const adminCookie = await login(baseUrl, "image_admin", "ImageAdmin!234");
        const fixtureDb = open(dbPath);
        const products = await all(fixtureDb, "SELECT id FROM products ORDER BY id");
        await new Promise(resolve => fixtureDb.close(resolve));
        const productIds = products.map(product => product.id);
        const image = await sharp({
            create: {
                width: 320,
                height: 240,
                channels: 3,
                background: "#4f8f5f"
            }
        }).png().toBuffer();

        let response = await upload(baseUrl, "/api/products/images/by-filter", image, {
            scope: "all",
            filters: {}
        });
        assert.strictEqual(response.status, 401);

        response = await upload(baseUrl, `/api/products/${productIds[0]}/image`, image, {}, adminCookie);
        assert.strictEqual(response.status, 200);
        response = await upload(baseUrl, "/api/products/images/batch", image, {
            productIds: productIds.slice(0, 2)
        }, adminCookie);
        assert.strictEqual(response.status, 200);
        response = await upload(baseUrl, "/api/products/images/by-filter", image, {
            scope: "filtered",
            filters: { category: "Permission category" }
        }, adminCookie);
        assert.strictEqual(response.status, 200);

        const beforeDenied = await snapshot(dbPath, uploadsPath);
        for (const fields of [
            { scope: "all", filters: {} },
            { scope: "filtered", filters: { category: "Permission category" }, allProducts: true },
            { scope: "*", filters: {} },
            { scope: "all", filters: {}, role: "chief_admin" },
            { scope: "all", filters: {}, userRole: "admin" }
        ]) {
            response = await upload(
                baseUrl,
                "/api/products/images/by-filter?role=admin&isChief=true",
                image,
                fields,
                adminCookie
            );
            assert.strictEqual(response.status, 403);
            assert.deepStrictEqual(await response.json(), {
                success: false,
                code: "GLOBAL_PRODUCT_IMAGE_REPLACE_FORBIDDEN",
                message: "Глобальная замена изображений доступна только главному администратору."
            });
        }
        assert.deepStrictEqual(await snapshot(dbPath, uploadsPath), beforeDenied);

        response = await upload(baseUrl, "/api/products/images/batch", image, {
            productIds: []
        }, adminCookie);
        assert.strictEqual(response.status, 400);
        assert.strictEqual((await response.json()).code, "PRODUCT_IDS_REQUIRED");
        assert.deepStrictEqual(await snapshot(dbPath, uploadsPath), beforeDenied);

        response = await upload(baseUrl, `/api/products/${productIds[0]}/image`, image, {}, chiefCookie);
        assert.strictEqual(response.status, 200);
        response = await upload(baseUrl, "/api/products/images/batch", image, {
            productIds: productIds.slice(0, 2)
        }, chiefCookie);
        assert.strictEqual(response.status, 200);
        response = await upload(baseUrl, "/api/products/images/by-filter", image, {
            scope: "filtered",
            filters: { category: "Permission category" }
        }, chiefCookie);
        assert.strictEqual(response.status, 200);
        response = await upload(baseUrl, "/api/products/images/by-filter", image, {
            scope: "all",
            filters: {}
        }, chiefCookie);
        assert.strictEqual(response.status, 200);
        const globalResult = await response.json();
        assert.strictEqual(globalResult.scope, "all");
        assert.strictEqual(globalResult.updated, productIds.length);

        console.log(JSON.stringify({
            success: true,
            chiefSingle: "allowed",
            chiefSelected: "allowed",
            chiefFiltered: "allowed",
            chiefGlobal: "allowed",
            ordinaryAdminSingle: "allowed",
            ordinaryAdminSelected: "allowed",
            ordinaryAdminFiltered: "allowed",
            ordinaryAdminGlobal: "forbidden",
            spoofedGlobalAliases: "forbidden",
            roleSpoofing: "forbidden",
            unauthorized: "rejected",
            deniedMutation: "none",
            emptySelection: "not-global"
        }));
    } finally {
        child.kill("SIGTERM");
        await new Promise(resolve => child.once("exit", resolve));
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
