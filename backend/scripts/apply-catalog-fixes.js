const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databaseDir = path.join(__dirname, "..", "database");
const databasePath = path.join(databaseDir, "matmix.db");
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

function createBackup() {
    fs.mkdirSync(backupsDir, { recursive: true });
    const backupPath = path.join(
        backupsDir,
        `matmix-before-catalog-fixes-${timestampForFile()}.db`
    );
    fs.copyFileSync(databasePath, backupPath);
    return backupPath;
}

function normalizeTitle(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\\/g, "/")
        .replace(/\s+/g, " ")
        .trim();
}

function getPlywoodGroup(title) {
    const normalized = normalizeTitle(title);

    if (/(^|\D)4\s*\/\s*4(\D|$)/.test(normalized)) {
        return "ФК Сорт 4/4";
    }

    if (/(^|\D)3\s*\/\s*4(\D|$)/.test(normalized)) {
        return "ФК Сорт 3/4";
    }

    return "";
}

const catalogFixes = [
    {
        id: "plywood-groups",
        description: "Исправляет группы товаров у фанеры",
        match(product) {
            return product.subcategory === "Фанера";
        },
        update(product) {
            const productGroup = getPlywoodGroup(product.title);

            if (!productGroup) {
                return {
                    skipped: true,
                    reason: "Не сорт 3/4 или 4/4"
                };
            }

            return {
                product_group: productGroup
            };
        }
    }
];

function getChangedFields(product, patch) {
    return Object.entries(patch).filter(([field, value]) => {
        return String(product[field] ?? "") !== String(value ?? "");
    });
}

async function applyFix(db, fix, products) {
    const report = {
        id: fix.id,
        description: fix.description,
        checked: 0,
        updated: 0,
        skipped: 0,
        skippedProducts: []
    };

    for (const product of products) {
        if (!fix.match(product)) continue;

        report.checked += 1;
        const patch = fix.update(product);

        if (!patch || patch.skipped) {
            report.skipped += 1;
            report.skippedProducts.push({
                id: product.id,
                title: product.title,
                reason: patch?.reason || "Нет изменений"
            });
            continue;
        }

        const changedFields = getChangedFields(product, patch);
        if (!changedFields.length) continue;

        const now = new Date().toISOString();
        const assignments = changedFields.map(([field]) => `${field} = ?`).join(", ");
        const values = changedFields.map(([, value]) => value);
        await run(
            db,
            `UPDATE products SET ${assignments}, updated_at = ? WHERE id = ?`,
            [...values, now, product.id]
        );

        changedFields.forEach(([field, value]) => {
            product[field] = value;
        });
        product.updated_at = now;
        report.updated += 1;
    }

    return report;
}

function printReport({ backupPath, reports, integrityResult }) {
    const totalUpdated = reports.reduce((sum, report) => sum + report.updated, 0);

    console.log(`Backup: ${backupPath}`);
    console.log(`Правил: ${reports.length}`);

    reports.forEach(report => {
        console.log("");
        console.log(`Rule: ${report.id}`);
        console.log(`Description: ${report.description}`);
        console.log(`Проверено: ${report.checked}`);
        console.log(`Обновлено: ${report.updated}`);
        console.log(`Пропущено: ${report.skipped}`);

        if (report.skippedProducts.length) {
            console.log("Пропущенные товары:");
            report.skippedProducts.forEach(product => {
                console.log(`- [${product.id}] ${product.title} (${product.reason})`);
            });
        }
    });

    console.log("");
    console.log(`Итого обновлено товаров: ${totalUpdated}`);
    console.log(`PRAGMA integrity_check: ${integrityResult}`);
}

async function main() {
    if (!fs.existsSync(databasePath)) {
        throw new Error(`Database not found: ${databasePath}`);
    }

    const backupPath = createBackup();
    const db = openDatabase();

    try {
        const products = await all(
            db,
            "SELECT * FROM products WHERE deleted_at IS NULL ORDER BY id ASC"
        );
        const reports = [];

        await run(db, "BEGIN TRANSACTION");
        try {
            for (const fix of catalogFixes) {
                reports.push(await applyFix(db, fix, products));
            }
            await run(db, "COMMIT");
        } catch (error) {
            await run(db, "ROLLBACK");
            throw error;
        }

        const integrity = await get(db, "PRAGMA integrity_check");
        const integrityResult = integrity?.integrity_check || "";
        printReport({ backupPath, reports, integrityResult });

        if (integrityResult !== "ok") {
            throw new Error(`Integrity check failed: ${integrityResult}`);
        }
    } finally {
        await closeDatabase(db);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error("apply-catalog-fixes error:", error);
        process.exit(1);
    });
}

module.exports = {
    catalogFixes,
    main
};
