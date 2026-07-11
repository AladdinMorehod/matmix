const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const {
    parseCatalogExcel,
    normalizeMatCode,
    validateMatCode
} = require("../services/catalogImport");

const databasePath = process.env.MATMIX_DB_PATH || path.join(__dirname, "..", "database", "matmix.db");
const databaseDir = path.dirname(databasePath);
const backupsDir = path.join(databaseDir, "backups");

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

            resolve({ changes: this.changes });
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
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeMatchValue(value) {
    return normalizeText(value).toLowerCase().replace(/ё/g, "е");
}

function getProductMatchKey(product) {
    return [
        product.title,
        product.category,
        product.subcategory,
        product.productGroup ?? product.product_group
    ].map(normalizeMatchValue).join("\u001f");
}

function createBackup() {
    if (!fs.existsSync(databasePath)) {
        throw new Error(`База не найдена: ${databasePath}`);
    }

    fs.mkdirSync(backupsDir, { recursive: true });
    const backupPath = path.join(backupsDir, `matmix-before-mat-external-id-migration-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

function buildProductIndex(products) {
    const index = new Map();
    products.forEach(product => {
        const key = getProductMatchKey(product);
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(product);
    });
    return index;
}

function buildMigrationPlan(parsedRows, dbProducts) {
    const productIndex = buildProductIndex(dbProducts);
    const seenMatCodes = new Map();
    const plan = [];
    const notFound = [];
    const ambiguous = [];
    const duplicates = [];
    const invalidCodes = [];
    const alreadyLinked = [];

    parsedRows.forEach(row => {
        const externalId = normalizeMatCode(row.externalId);
        if (!externalId) return;

        if (!validateMatCode(externalId)) {
            invalidCodes.push({ rowNumber: row.rowNumber, externalId: row.externalId, title: row.title });
            return;
        }

        if (seenMatCodes.has(externalId)) {
            duplicates.push({
                externalId,
                rowNumber: row.rowNumber,
                firstRowNumber: seenMatCodes.get(externalId),
                title: row.title
            });
            return;
        }
        seenMatCodes.set(externalId, row.rowNumber);

        const matches = productIndex.get(getProductMatchKey(row)) || [];
        if (!matches.length) {
            notFound.push({ rowNumber: row.rowNumber, externalId, title: row.title });
            return;
        }

        if (matches.length > 1) {
            ambiguous.push({
                rowNumber: row.rowNumber,
                externalId,
                title: row.title,
                matchedIds: matches.map(product => product.id)
            });
            return;
        }

        const product = matches[0];
        if (normalizeMatCode(product.external_id) === externalId) {
            alreadyLinked.push({ rowNumber: row.rowNumber, externalId, productId: product.id, title: row.title });
            return;
        }

        plan.push({
            rowNumber: row.rowNumber,
            productId: product.id,
            oldExternalId: product.external_id,
            newExternalId: externalId,
            title: product.title
        });
    });

    return {
        plan,
        notFound,
        ambiguous,
        duplicates,
        invalidCodes,
        alreadyLinked,
        excelRows: parsedRows.filter(row => row.externalId).length
    };
}

async function applyMigration(db, plan) {
    let updated = 0;
    await run(db, "BEGIN IMMEDIATE TRANSACTION");

    try {
        for (const item of plan) {
            const result = await run(
                db,
                "UPDATE products SET external_id = ? WHERE id = ?",
                [item.newExternalId, item.productId]
            );
            updated += Number(result.changes) || 0;
        }

        await run(db, "COMMIT");
    } catch (error) {
        await run(db, "ROLLBACK").catch(() => {});
        throw error;
    }

    return updated;
}

function printSample(title, rows, formatRow) {
    if (!rows.length) return;
    console.log(`\n${title}:`);
    rows.slice(0, 20).forEach(row => console.log(`- ${formatRow(row)}`));
    if (rows.length > 20) console.log(`... еще ${rows.length - 20}`);
}

async function migrateMatExternalIds(excelPath) {
    const absoluteExcelPath = path.resolve(excelPath || "");
    if (!excelPath || !fs.existsSync(absoluteExcelPath)) {
        throw new Error('Укажите путь к Excel: npm run catalog:migrate-mat -- "C:\\path\\catalog.xlsx"');
    }
    if (!absoluteExcelPath.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Файл должен быть .xlsx.");
    }

    const parsed = await parseCatalogExcel(absoluteExcelPath);
    const criticalParseErrors = parsed.errors || [];
    if (criticalParseErrors.some(error => ["MISSING_SHEET", "FILE_READ_ERROR"].includes(error.code))) {
        throw new Error(criticalParseErrors.map(error => error.message).join(" "));
    }

    const db = openDatabase();
    let backupPath = "";
    let report;

    try {
        const dbProducts = await all(db, `
            SELECT id, external_id, title, category, subcategory, product_group
            FROM products
            ORDER BY id ASC
        `);
        report = buildMigrationPlan(parsed.productRows, dbProducts);

        const occupiedMatRows = await all(db, `
            SELECT id, external_id
            FROM products
            WHERE external_id LIKE 'MAT-%'
        `);
        const occupiedMatByCode = new Map(occupiedMatRows.map(row => [normalizeMatCode(row.external_id), row.id]));
        const conflicts = report.plan.filter(item => {
            const ownerId = occupiedMatByCode.get(item.newExternalId);
            return ownerId && Number(ownerId) !== Number(item.productId);
        });

        if (conflicts.length) {
            report.conflicts = conflicts;
            throw new Error(`Найдены конфликты MAT-кодов: ${conflicts.length}. Миграция остановлена.`);
        }

        backupPath = createBackup();
        report.updated = await applyMigration(db, report.plan);
        report.matCount = (await get(db, "SELECT COUNT(*) AS count FROM products WHERE external_id LIKE 'MAT-%'")).count;
        report.integrity = (await get(db, "PRAGMA integrity_check")).integrity_check;

        return { backupPath, report };
    } finally {
        await closeDatabase(db);
    }
}

async function main() {
    const excelPath = process.argv[2];
    const startedAt = Date.now();

    try {
        const { backupPath, report } = await migrateMatExternalIds(excelPath);

        console.log("\nMAT external_id migration complete");
        console.log(`Excel products with MAT-code: ${report.excelRows}`);
        console.log(`Matched for update: ${report.plan.length}`);
        console.log(`Updated external_id: ${report.updated}`);
        console.log(`Already linked: ${report.alreadyLinked.length}`);
        console.log(`Not found: ${report.notFound.length}`);
        console.log(`Ambiguous match: ${report.ambiguous.length}`);
        console.log(`Duplicate MAT in Excel: ${report.duplicates.length}`);
        console.log(`Invalid MAT-code: ${report.invalidCodes.length}`);
        console.log(`MAT external_id in DB: ${report.matCount}`);
        console.log(`Integrity check: ${report.integrity}`);
        console.log(`Backup: ${backupPath}`);
        console.log(`Duration: ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

        printSample("NOT FOUND", report.notFound, row => `row ${row.rowNumber}: ${row.externalId} | ${row.title}`);
        printSample("AMBIGUOUS MATCH", report.ambiguous, row => `row ${row.rowNumber}: ${row.externalId} | ${row.title} | ids=${row.matchedIds.join(",")}`);
        printSample("DUPLICATE MAT", report.duplicates, row => `row ${row.rowNumber}: ${row.externalId} | first row ${row.firstRowNumber}`);
        printSample("INVALID MAT", report.invalidCodes, row => `row ${row.rowNumber}: ${row.externalId} | ${row.title}`);

        if (report.integrity !== "ok") {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(`MAT external_id migration failed: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    migrateMatExternalIds,
    buildMigrationPlan,
    getProductMatchKey
};
