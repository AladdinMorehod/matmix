const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const { configureBusinessConnection } = require("./sqlite");
const {
    ensureCatalogStructureSchema,
    syncCatalogStructureFromProducts
} = require("./services/catalogStructure");

const defaultDatabasePath = path.join(__dirname, "database", "matmix.db");
const databasePath = process.env.MATMIX_DB_PATH || defaultDatabasePath;
const databaseDir = path.dirname(databasePath);

fs.mkdirSync(databaseDir, { recursive: true });

const db = new sqlite3.Database(databasePath);
const connectionReady = configureBusinessConnection(db);

async function run(sql, params = []) {
    await connectionReady;
    return new Promise((resolve, reject) => {
        db.run(sql, params, function onRun(error) {
            if (error) {
                reject(error);
                return;
            }

            resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

async function get(sql, params = []) {
    await connectionReady;
    return new Promise((resolve, reject) => {
        db.get(sql, params, (error, row) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(row);
        });
    });
}

async function all(sql, params = []) {
    await connectionReady;
    return new Promise((resolve, reject) => {
        db.all(sql, params, (error, rows) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(rows);
        });
    });
}

function createConnectionHelpers(connection) {
    return {
        run(sql, params = []) {
            return new Promise((resolve, reject) => {
                connection.run(sql, params, function onRun(error) {
                    if (error) return reject(error);
                    resolve({ id: this.lastID, changes: this.changes });
                });
            });
        },
        get(sql, params = []) {
            return new Promise((resolve, reject) => {
                connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
            });
        },
        all(sql, params = []) {
            return new Promise((resolve, reject) => {
                connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
            });
        }
    };
}

async function withTransaction(work) {
    const connection = new sqlite3.Database(databasePath);
    const transaction = createConnectionHelpers(connection);

    try {
        await configureBusinessConnection(connection);
        await transaction.run("BEGIN IMMEDIATE");
        const result = await work(transaction);
        await transaction.run("COMMIT");
        return result;
    } catch (error) {
        try {
            await transaction.run("ROLLBACK");
        } catch (rollbackError) {
            console.error("Transaction rollback error:", rollbackError);
        }
        throw error;
    } finally {
        await new Promise(resolve => connection.close(() => resolve()));
    }
}

async function initDatabase() {
    await connectionReady;
    await run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            telegram TEXT,
            max_contact TEXT,
            address TEXT,
            unloading TEXT,
            payment_method TEXT,
            comment TEXT,
            items_json TEXT NOT NULL,
            total_price REAL DEFAULT 0,
            total_weight REAL DEFAULT 0,
            status TEXT DEFAULT 'Новая',
            created_at TEXT,
            updated_at TEXT
        )
    `);

    await ensureColumn("orders", "manager_id", "INTEGER");
    await ensureColumn("orders", "taken_at", "TEXT");
    await ensureColumn("orders", "closed_at", "TEXT");
    await ensureColumn("orders", "deleted_at", "TEXT");
    await ensureColumn("orders", "deleted_by_id", "INTEGER");
    await ensureColumn("orders", "deleted_by_name", "TEXT");
    await ensureColumn("orders", "preferred_contact_method", "TEXT");
    await ensureColumn("orders", "preferred_contact_value", "TEXT");
    await ensureColumn("orders", "client_id", "INTEGER");
    await ensureColumn("orders", "order_number", "TEXT");
    await backfillOrderNumbers();
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL");
    await run("CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC)");
    await run("CREATE INDEX IF NOT EXISTS idx_orders_client_created_at ON orders(client_id, created_at DESC)");

    await run(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            preferred_contact_method TEXT,
            preferred_contact_value TEXT,
            email TEXT,
            telegram TEXT,
            max_contact TEXT,
            whatsapp TEXT,
            orders_count INTEGER DEFAULT 0,
            total_spent REAL DEFAULT 0,
            last_order_at TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    `);
    await run("CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone)");

    await run(`
        CREATE TABLE IF NOT EXISTS order_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            user_id INTEGER,
            user_name TEXT,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT
        )
    `);
    await run("CREATE INDEX IF NOT EXISTS idx_order_events_order_created_at ON order_events(order_id, created_at)");

    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        )
    `);
    await ensureColumn("users", "is_active", "INTEGER DEFAULT 1");
    await ensureColumn("users", "updated_at", "TEXT");
    await ensureColumn("users", "deleted_at", "TEXT");

    await initProductsTable();
    await initCatalogImportLogsTable();
    await ensureCatalogStructureSchema({ run, all });

    const admin = await get("SELECT id FROM users WHERE login = ?", ["admin"]);
    if (!admin) {
        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash("admin123", 10);

        await run(
            `INSERT INTO users (login, password_hash, role, name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["admin", passwordHash, "admin", "Администратор", now, now]
        );

        console.warn("Default admin created: login admin / password admin123. Change password before production.");
    }

    await seedProductsFromPublicCatalog();
    await syncCatalogStructureFromProducts({ run, get, all });
}

async function initCatalogImportLogsTable() {
    await run(`
        CREATE TABLE IF NOT EXISTS catalog_import_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_name TEXT,
            file_name TEXT,
            file_hash TEXT,
            backup_path TEXT,
            excel_copy_path TEXT,
            created_count INTEGER DEFAULT 0,
            updated_count INTEGER DEFAULT 0,
            assigned_mat_count INTEGER DEFAULT 0,
            assigned_structure_count INTEGER DEFAULT 0,
            hidden_count INTEGER DEFAULT 0,
            requires_review_count INTEGER DEFAULT 0,
            error_count INTEGER DEFAULT 0,
            summary_json TEXT,
            created_at TEXT NOT NULL
        )
    `);
    await ensureColumn("catalog_import_logs", "assigned_structure_count", "INTEGER DEFAULT 0");
}

async function initProductsTable() {
    await run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            slug TEXT,
            category TEXT,
            subcategory TEXT,
            product_group TEXT,
            price REAL,
            weight REAL,
            unit TEXT,
            image TEXT,
            description TEXT,
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            source TEXT,
            last_imported_at TEXT,
            created_at TEXT,
            updated_at TEXT,
            deleted_at TEXT,
            deleted_by_id INTEGER,
            deleted_by_name TEXT
        )
    `);

    await ensureColumn("products", "external_id", "TEXT");
    await ensureColumn("products", "title", "TEXT");
    await ensureColumn("products", "slug", "TEXT");
    await ensureColumn("products", "category", "TEXT");
    await ensureColumn("products", "subcategory", "TEXT");
    await ensureColumn("products", "product_group", "TEXT");
    await ensureColumn("products", "price", "REAL");
    await ensureColumn("products", "weight", "REAL");
    await ensureColumn("products", "unit", "TEXT");
    await ensureColumn("products", "image", "TEXT");
    await ensureColumnWithBackup("products", "image_url", "TEXT", "image-url");
    await ensureColumn("products", "description", "TEXT");
    await ensureColumn("products", "is_active", "INTEGER DEFAULT 1");
    await ensureColumn("products", "sort_order", "INTEGER DEFAULT 0");
    await ensureColumn("products", "source", "TEXT");
    await ensureColumn("products", "last_imported_at", "TEXT");
    await ensureColumn("products", "created_at", "TEXT");
    await ensureColumn("products", "updated_at", "TEXT");
    await ensureColumn("products", "deleted_at", "TEXT");
    await ensureColumn("products", "deleted_by_id", "INTEGER");
    await ensureColumn("products", "deleted_by_name", "TEXT");
    await run("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, subcategory, product_group)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_public_order ON products(is_active, deleted_at, sort_order, id)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_catalog_order ON products(category, subcategory, sort_order, id)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_group_order ON products(category, subcategory, product_group, sort_order, id)");
    await run("CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url)");
}

async function ensureColumn(tableName, columnName, columnDefinition) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    const exists = columns.some(column => column.name === columnName);

    if (!exists) {
        await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

async function ensureColumnWithBackup(tableName, columnName, columnDefinition, backupReason) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    const exists = columns.some(column => column.name === columnName);

    if (!exists) {
        createDatabaseBackup(backupReason || `${tableName}-${columnName}`);
        await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

function createDatabaseBackup(reason) {
    if (!fs.existsSync(databasePath)) return "";

    const backupDir = path.join(databaseDir, "backups");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeReason = String(reason || "schema").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "schema";
    const backupPath = path.join(backupDir, `matmix-before-${safeReason}-${timestamp}.db`);

    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(databasePath, backupPath);
    return backupPath;
}

function extractPublicCatalogProducts() {
    const scriptPath = path.join(__dirname, "..", "js", "script.js");
    if (!fs.existsSync(scriptPath)) return [];

    const script = fs.readFileSync(scriptPath, "utf8");
    const declarationMatch = script.match(/\b(?:const|let)\s+products\s*=/);
    if (!declarationMatch) return [];
    const start = declarationMatch.index;

    const arrayStart = script.indexOf("[", start);
    if (arrayStart === -1) return [];

    let depth = 0;
    let inString = false;
    let quote = "";
    let escaped = false;

    for (let index = arrayStart; index < script.length; index += 1) {
        const char = script[index];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === quote) {
                inString = false;
            }
            continue;
        }

        if (char === "\"" || char === "'" || char === "`") {
            inString = true;
            quote = char;
            continue;
        }

        if (char === "[") depth += 1;
        if (char === "]") depth -= 1;

        if (depth === 0) {
            const arrayText = script.slice(arrayStart, index + 1);
            return JSON.parse(arrayText);
        }
    }

    return [];
}

function normalizeProductText(value) {
    return String(value || "").replace(/\?/g, "").replace(/\s+/g, " ").trim();
}

function makeSlug(value, fallback) {
    const slug = normalizeProductText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);

    return slug || fallback;
}

async function seedProductsFromPublicCatalog() {
    const existing = await get("SELECT COUNT(*) AS count FROM products");
    if (Number(existing?.count) > 0) return;

    const catalogProducts = extractPublicCatalogProducts();
    if (!catalogProducts.length) return;

    const now = new Date().toISOString();
    let sortOrder = 0;

    for (const product of catalogProducts) {
        const title = normalizeProductText(product.name);
        if (!title) continue;

        sortOrder += 1;
        const externalId = `site-${String(sortOrder).padStart(6, "0")}`;
        await run(
            `INSERT OR IGNORE INTO products (
                external_id,
                title,
                slug,
                category,
                subcategory,
                product_group,
                price,
                weight,
                unit,
                image,
                description,
                is_active,
                sort_order,
                source,
                last_imported_at,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                externalId,
                title,
                makeSlug(title, externalId),
                normalizeProductText(product.category?.main),
                normalizeProductText(product.category?.section || product.category?.type),
                normalizeProductText(product.category?.type),
                product.price === null || product.price === undefined ? null : Number(product.price) || 0,
                Number(product.weight) || 0,
                normalizeProductText(product.unit) || "шт",
                normalizeProductText(product.image),
                "",
                1,
                sortOrder,
                "public-site",
                now,
                now,
                now
            ]
        );
    }
}

function getOrderNumber(id, createdAt) {
    const date = createdAt ? new Date(createdAt) : new Date();
    const year = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();

    return `MM-${year}-${String(id).padStart(6, "0")}`;
}

async function backfillOrderNumbers() {
    const rows = await all("SELECT id, created_at FROM orders WHERE order_number IS NULL OR order_number = '' ORDER BY id ASC");

    for (const row of rows) {
        await run(
            "UPDATE orders SET order_number = ? WHERE id = ? AND (order_number IS NULL OR order_number = '')",
            [getOrderNumber(row.id, row.created_at), row.id]
        );
    }
}

module.exports = {
    db,
    run,
    get,
    all,
    withTransaction,
    initDatabase,
    getOrderNumber,
    databasePath
};
