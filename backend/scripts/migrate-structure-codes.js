const fs = require("fs");
const path = require("path");
const { initDatabase, run, get, all, databasePath } = require("../database");
const {
    parseCatalogExcel,
    upsertCatalogStructureFromParsed
} = require("../services/catalogImport");

function timestampForFile(date = new Date()) {
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function createBackup() {
    if (!fs.existsSync(databasePath)) {
        throw new Error(`Database not found: ${databasePath}`);
    }

    const backupsDir = path.join(path.dirname(databasePath), "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const backupPath = path.join(backupsDir, `matmix-before-structure-codes-${timestampForFile()}.db`);
    fs.copyFileSync(databasePath, backupPath, fs.constants.COPYFILE_EXCL);
    return backupPath;
}

async function migrateStructureCodes(excelPath) {
    const absoluteExcelPath = path.resolve(excelPath || "");
    if (!excelPath || !fs.existsSync(absoluteExcelPath)) {
        throw new Error('Usage: npm run catalog:migrate-structure-codes -- "C:\\path\\catalog.xlsx"');
    }
    if (!absoluteExcelPath.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Excel file must be .xlsx.");
    }

    await initDatabase();
    const parsed = await parseCatalogExcel(absoluteExcelPath);
    const criticalErrors = (parsed.errors || []).filter(error => error.severity === "critical");
    if (criticalErrors.length) {
        throw new Error(`Excel has critical errors: ${criticalErrors.slice(0, 5).map(error => error.code).join(", ")}`);
    }

    const before = {
        categoriesWithCodes: (await get("SELECT COUNT(*) AS count FROM catalog_structure WHERE type = 'category' AND external_code IS NOT NULL AND external_code != ''"))?.count || 0,
        subcategoriesWithCodes: (await get("SELECT COUNT(*) AS count FROM catalog_structure WHERE type = 'subcategory' AND external_code IS NOT NULL AND external_code != ''"))?.count || 0
    };
    const backupPath = createBackup();
    const now = new Date().toISOString();
    let assignedRows = [];

    await run("BEGIN IMMEDIATE TRANSACTION");
    try {
        assignedRows = await upsertCatalogStructureFromParsed({ run, get, all }, parsed, now);
        await run("COMMIT");
    } catch (error) {
        await run("ROLLBACK").catch(() => {});
        throw error;
    }

    const integrity = await get("PRAGMA integrity_check");
    const foreignKeys = await all("PRAGMA foreign_key_check");
    const after = {
        categoriesWithCodes: (await get("SELECT COUNT(*) AS count FROM catalog_structure WHERE type = 'category' AND external_code IS NOT NULL AND external_code != ''"))?.count || 0,
        subcategoriesWithCodes: (await get("SELECT COUNT(*) AS count FROM catalog_structure WHERE type = 'subcategory' AND external_code IS NOT NULL AND external_code != ''"))?.count || 0
    };

    return {
        backupPath,
        sheetName: parsed.sheetName,
        categoryRows: parsed.categoryRows.length,
        subcategoryRows: parsed.subcategoryRows.length,
        assignedCodes: assignedRows.length,
        before,
        after,
        integrity: integrity?.integrity_check || "",
        foreignKeyIssues: foreignKeys.length
    };
}

async function main() {
    try {
        const report = await migrateStructureCodes(process.argv[2]);
        console.log(JSON.stringify(report, null, 2));
        if (report.integrity !== "ok" || report.foreignKeyIssues) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(error.message || error);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    migrateStructureCodes
};
