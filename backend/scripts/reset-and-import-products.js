const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const ExcelJS = require("exceljs");

const databaseDir = path.join(__dirname, "..", "database");
const databasePath = path.join(databaseDir, "matmix.db");
const backupsDir = path.join(databaseDir, "backups");

function usage() {
    console.error('Usage: node backend/scripts/reset-and-import-products.js "path/to/price.xlsx"');
}

function timestampForFile(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate())
    ].join("-") + "-" + [
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds())
    ].join("-");
}

function textValue(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        if (value.text !== undefined) return String(value.text);
        if (value.result !== undefined) return textValue(value.result);
        if (Array.isArray(value.richText)) return value.richText.map(part => part.text || "").join("");
        if (value.hyperlink && value.text) return String(value.text);
    }

    return String(value).replace(/\s+/g, " ").trim();
}

function parseNumber(value, fallback = null) {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

    const normalized = textValue(value)
        .replace(/\s+/g, "")
        .replace(/₽|руб\.?/gi, "")
        .replace(",", ".");

    if (!normalized) return fallback;

    const number = Number(normalized);
    return Number.isFinite(number) ? number : fallback;
}

function normalizeText(value) {
    return textValue(value).replace(/\?/g, "").replace(/\s+/g, " ").trim();
}

const translitMap = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya"
};

function asciiSlug(value, fallback = "item") {
    const transliterated = normalizeText(value)
        .toLowerCase()
        .split("")
        .map(char => translitMap[char] ?? char)
        .join("");

    return transliterated
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120) || fallback;
}

function makeSlug(value, fallback) {
    return normalizeText(value)
        .toLowerCase()
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120) || fallback;
}

function uniqueSlug(baseSlug, usedSlugs) {
    let slug = baseSlug;
    let suffix = 2;

    while (usedSlugs.has(slug)) {
        const tail = `-${suffix}`;
        slug = `${baseSlug.slice(0, 120 - tail.length)}${tail}`;
        suffix += 1;
    }

    usedSlugs.add(slug);
    return slug;
}

function isHeaderRow(title) {
    return ["наименование", "товар", "название"].includes(title.toLowerCase());
}

async function readProductsFromWorkbook(pricePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(pricePath);

    const sheet = workbook.getWorksheet("ШАБЛОН") || workbook.worksheets[0];
    if (!sheet) {
        throw new Error("В Excel-файле не найден ни один лист.");
    }

    const importedAt = new Date().toISOString();
    const products = [];
    const warnings = [];
    const categories = new Set();
    const subcategories = new Set();
    const productGroups = new Set();
    const usedSlugs = new Set();
    let skippedRows = 0;
    let currentCategory = "";
    let currentSubcategory = "";

    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        const title = normalizeText(row.getCell(1).value);
        const unit = normalizeText(row.getCell(4).value) || "шт";
        const rawPrice = row.getCell(5).value;
        const productGroup = normalizeText(row.getCell(8).value);
        const rawWeight = row.getCell(10).value;

        if (!title) {
            skippedRows += 1;
            return;
        }

        const categoryMatch = title.match(/^Категория\s*-\s*(.+)$/i);
        if (categoryMatch) {
            currentCategory = normalizeText(categoryMatch[1]);
            currentSubcategory = "";
            if (currentCategory) categories.add(currentCategory);
            skippedRows += 1;
            return;
        }

        const subcategoryMatch = title.match(/^Подкатегория\s*-\s*(.+)$/i);
        if (subcategoryMatch) {
            currentSubcategory = normalizeText(subcategoryMatch[1]);
            if (currentSubcategory) subcategories.add(currentSubcategory);
            skippedRows += 1;
            return;
        }

        if (isHeaderRow(title)) {
            skippedRows += 1;
            return;
        }

        if (!currentCategory) {
            warnings.push(`row ${rowNumber}: пропущен товар без категории: ${title}`);
            skippedRows += 1;
            return;
        }

        const effectiveSubcategory = currentSubcategory || "Без подкатегории";
        if (!currentSubcategory) subcategories.add(effectiveSubcategory);

        const priceText = textValue(rawPrice);
        const price = priceText ? parseNumber(rawPrice, null) : null;
        if (priceText && price === null) {
            warnings.push(`row ${rowNumber}: не удалось прочитать цену, импортировано null: ${title}`);
        }

        const weightText = textValue(rawWeight);
        const weight = weightText ? parseNumber(rawWeight, 0) : 0;
        if (weightText && parseNumber(rawWeight, null) === null) {
            warnings.push(`row ${rowNumber}: не удалось прочитать вес, импортировано 0: ${title}`);
        }

        const sortOrder = products.length + 1;
        const externalId = [
            "excel",
            asciiSlug(currentCategory, "category"),
            asciiSlug(effectiveSubcategory, "subcategory"),
            asciiSlug(productGroup, "group"),
            asciiSlug(title, "product"),
            rowNumber
        ].join("-").slice(0, 240);
        const slug = uniqueSlug(makeSlug(title, `product-${rowNumber}`), usedSlugs);

        if (productGroup) productGroups.add(productGroup);

        products.push({
            externalId,
            title,
            slug,
            category: currentCategory,
            subcategory: effectiveSubcategory,
            productGroup,
            price,
            weight,
            unit,
            image: "",
            description: "",
            isActive: 1,
            sortOrder,
            source: "excel",
            lastImportedAt: importedAt,
            createdAt: importedAt,
            updatedAt: importedAt
        });
    });

    return {
        sheetName: sheet.name,
        products,
        skippedRows,
        categories,
        subcategories,
        productGroups,
        warnings
    };
}

function openDatabase() {
    return new sqlite3.Database(databasePath);
}

function run(db, sql, params = []) {
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

function get(db, sql, params = []) {
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

function all(db, sql, params = []) {
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

function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close(error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function tableExists(db, tableName) {
    const row = await get(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?", [tableName]);
    return Boolean(row);
}

async function ensureColumn(db, tableName, columnName, columnDefinition) {
    const columns = await all(db, `PRAGMA table_info(${tableName})`);
    const exists = columns.some(column => column.name === columnName);

    if (!exists) {
        await run(db, `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

async function countRows(db, tableName) {
    const row = await get(db, `SELECT COUNT(*) AS count FROM ${tableName}`);
    return Number(row?.count) || 0;
}

async function resetSequence(db, tableNames) {
    for (const tableName of tableNames) {
        await run(db, "DELETE FROM sqlite_sequence WHERE name = ?", [tableName]);
    }
}

function createBackup() {
    if (!fs.existsSync(databasePath)) {
        throw new Error(`База не найдена: ${databasePath}`);
    }

    fs.mkdirSync(backupsDir, { recursive: true });
    const backupPath = path.join(backupsDir, `matmix-before-catalog-reset-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

async function resetAndImport(products) {
    const db = openDatabase();
    const report = {
        deletedOrders: 0,
        deletedOrderItems: 0,
        deletedOrderEvents: 0,
        deletedClients: 0,
        deletedProducts: 0,
        clearedTables: []
    };

    try {
        const hasOrderItems = await tableExists(db, "order_items");
        await ensureColumn(db, "products", "product_group", "TEXT");
        report.deletedOrders = await countRows(db, "orders");
        report.deletedOrderEvents = await countRows(db, "order_events");
        report.deletedClients = await countRows(db, "clients");
        report.deletedProducts = await countRows(db, "products");
        report.deletedOrderItems = hasOrderItems ? await countRows(db, "order_items") : 0;

        await run(db, "BEGIN IMMEDIATE TRANSACTION");

        if (hasOrderItems) {
            await run(db, "DELETE FROM order_items");
            report.clearedTables.push("order_items");
        }

        await run(db, "DELETE FROM order_events");
        await run(db, "DELETE FROM orders");
        await run(db, "DELETE FROM clients");
        await run(db, "DELETE FROM products");
        report.clearedTables.push("order_events", "orders", "clients", "products");

        await resetSequence(db, hasOrderItems
            ? ["orders", "order_items", "order_events", "clients", "products"]
            : ["orders", "order_events", "clients", "products"]);

        const insertSql = `
            INSERT INTO products (
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const product of products) {
            await run(db, insertSql, [
                product.externalId,
                product.title,
                product.slug,
                product.category,
                product.subcategory,
                product.productGroup,
                product.price,
                product.weight,
                product.unit,
                product.image,
                product.description,
                product.isActive,
                product.sortOrder,
                product.source,
                product.lastImportedAt,
                product.createdAt,
                product.updatedAt
            ]);
        }

        await run(db, "COMMIT");

        const integrity = await get(db, "PRAGMA integrity_check");
        report.integrityCheck = Object.values(integrity || {})[0] || "";
        report.productsAfter = await countRows(db, "products");
        report.ordersAfter = await countRows(db, "orders");
        report.clientsAfter = await countRows(db, "clients");
        report.orderEventsAfter = await countRows(db, "order_events");
        report.nextProductId = (await get(db, "SELECT seq FROM sqlite_sequence WHERE name = 'products'"))?.seq + 1 || 1;
        report.nextOrderId = (await get(db, "SELECT seq FROM sqlite_sequence WHERE name = 'orders'"))?.seq + 1 || 1;

        return report;
    } catch (error) {
        try {
            await run(db, "ROLLBACK");
        } catch {
            // Ignore rollback errors: original error is more useful.
        }
        throw error;
    } finally {
        await closeDatabase(db);
    }
}

async function main() {
    const pricePath = process.argv[2] ? path.resolve(process.argv[2]) : "";
    if (!pricePath) {
        usage();
        process.exitCode = 1;
        return;
    }

    if (!fs.existsSync(pricePath)) {
        throw new Error(`Excel-файл не найден: ${pricePath}`);
    }

    const workbookReport = await readProductsFromWorkbook(pricePath);
    if (!workbookReport.products.length) {
        throw new Error("В Excel-файле не найдено товарных строк для импорта.");
    }

    const backupPath = createBackup();
    const dbReport = await resetAndImport(workbookReport.products);

    const output = {
        backupPath,
        sourceFile: pricePath,
        sheetName: workbookReport.sheetName,
        deletedOrders: dbReport.deletedOrders,
        deletedOrderItems: dbReport.deletedOrderItems,
        deletedOrderEvents: dbReport.deletedOrderEvents,
        deletedClients: dbReport.deletedClients,
        deletedProducts: dbReport.deletedProducts,
        importedProducts: workbookReport.products.length,
        categoriesFound: workbookReport.categories.size,
        subcategoriesFound: workbookReport.subcategories.size,
        productGroupsFound: workbookReport.productGroups.size,
        skippedRows: workbookReport.skippedRows,
        clearedTables: dbReport.clearedTables,
        productsAfter: dbReport.productsAfter,
        ordersAfter: dbReport.ordersAfter,
        clientsAfter: dbReport.clientsAfter,
        orderEventsAfter: dbReport.orderEventsAfter,
        nextProductId: dbReport.nextProductId,
        nextOrderId: dbReport.nextOrderId,
        integrityCheck: dbReport.integrityCheck,
        warnings: workbookReport.warnings.slice(0, 20)
    };

    console.log(JSON.stringify(output, null, 2));
}

main().catch(error => {
    console.error(error.message || error);
    process.exitCode = 1;
});
