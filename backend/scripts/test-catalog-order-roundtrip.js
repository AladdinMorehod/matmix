const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const ExcelJS = require("exceljs");

const sourceDatabasePath = path.join(__dirname, "..", "database", "matmix.db");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-order-test-"));
const testDatabasePath = path.join(tempDir, "matmix.db");
const importedExcelDir = path.join(__dirname, "..", "imported-excel");
const testArtifactPrefixes = ["catalog-order-", "catalog-new-structure"];
const existingTestArtifacts = new Set(fs.existsSync(importedExcelDir)
    ? fs.readdirSync(importedExcelDir).filter(name => testArtifactPrefixes.some(prefix => name.startsWith(prefix)))
    : []);
fs.copyFileSync(sourceDatabasePath, testDatabasePath);
process.env.MATMIX_DB_PATH = testDatabasePath;

const databaseModule = require("../database");
const {
    parseCatalogExcel,
    createCatalogImportPreviewToken,
    applyCatalogImport,
    buildCatalogExportWorkbook
} = require("../services/catalogImport");

function createDb(filePath) {
    const connection = new sqlite3.Database(filePath);
    return {
        run(sql, params = []) {
            return new Promise((resolve, reject) => connection.run(sql, params, function onRun(error) {
                if (error) return reject(error);
                resolve({ id: this.lastID, changes: this.changes });
            }));
        },
        get(sql, params = []) {
            return new Promise((resolve, reject) => connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
        },
        all(sql, params = []) {
            return new Promise((resolve, reject) => connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
        },
        close() {
            return new Promise(resolve => connection.close(() => resolve()));
        }
    };
}

function rowValues(row) {
    return Array.from({ length: 12 }, (_, index) => row.getCell(index + 1).value);
}

function getCode(value) {
    return String(value || "").trim().toUpperCase();
}

function getCategoryBlocks(sheet) {
    const starts = [];
    for (let rowNumber = 7; rowNumber <= sheet.rowCount; rowNumber += 1) {
        if (/^CAT-\d+$/.test(getCode(sheet.getCell(rowNumber, 11).value))) starts.push(rowNumber);
    }
    return starts.map((start, index) => ({
        start,
        end: (starts[index + 1] || sheet.rowCount + 1) - 1,
        name: String(sheet.getCell(start, 1).value || "").replace(/^Категория\s*-\s*/i, "").trim()
    }));
}

function getSequence(sheet) {
    const result = [];
    for (let rowNumber = 7; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const code = getCode(sheet.getCell(rowNumber, 11).value);
        const type = /^CAT-/.test(code) ? "CAT" : /^SUB-/.test(code) ? "SUB" : /^MAT-/.test(code) ? "MAT" : "";
        if (type) {
            const name = String(sheet.getCell(rowNumber, 1).value || "").trim();
            result.push(type === "MAT" ? `${type}:${code}` : `${type}:${name}`);
        }
    }
    return result;
}

function moveCategoryBefore(workbook, movingName, targetName) {
    const sourceSheet = workbook.worksheets[0];
    const blocks = getCategoryBlocks(sourceSheet);
    const moving = blocks.find(block => block.name.toLowerCase() === movingName.toLowerCase());
    const target = blocks.find(block => block.name.toLowerCase() === targetName.toLowerCase());
    if (!moving || !target) throw new Error(`Category blocks not found: ${movingName}, ${targetName}`);

    const headerRows = Array.from({ length: 6 }, (_, index) => rowValues(sourceSheet.getRow(index + 1)));
    const orderedBlocks = blocks.filter(block => block !== moving);
    orderedBlocks.splice(orderedBlocks.indexOf(target), 0, moving);
    const output = new ExcelJS.Workbook();
    const sheet = output.addWorksheet(sourceSheet.name);
    headerRows.forEach(values => sheet.addRow(values));
    orderedBlocks.forEach(block => {
        for (let rowNumber = block.start; rowNumber <= block.end; rowNumber += 1) sheet.addRow(rowValues(sourceSheet.getRow(rowNumber)));
    });
    return output;
}

function addNewStructureBefore(workbook, targetName) {
    const sheet = workbook.worksheets[0];
    const target = getCategoryBlocks(sheet).find(block => block.name.toLowerCase() === targetName.toLowerCase());
    if (!target) throw new Error(`Target category not found: ${targetName}`);
    const rows = [
        ["Категория - Roundtrip Test", "Категория - Roundtrip Test"],
        ["Подкатегория - Roundtrip Sub", "Подкатегория - Roundtrip Sub"],
        ["Roundtrip Product One", "Roundtrip Product One", null, "шт", 100, null, null, "Roundtrip Group", null, 1],
        ["Roundtrip Product Two", "Roundtrip Product Two", null, "шт", 200, null, null, "Roundtrip Group", null, 2]
    ];
    sheet.insertRows(target.start, rows);
    return workbook;
}

async function getOrderState(db) {
    return {
        structure: await db.all("SELECT id, type, parent_id, sort_order FROM catalog_structure ORDER BY type, parent_id, sort_order, id"),
        products: await db.all("SELECT id, category, subcategory, sort_order FROM products WHERE deleted_at IS NULL ORDER BY category, subcategory, sort_order, id")
    };
}

async function previewAndApply(db, workbook, fileName, allowNoop = false) {
    const buffer = await workbook.xlsx.writeBuffer();
    const parsed = await parseCatalogExcel(buffer);
    if (parsed.errors.length) throw new Error(`Parse errors: ${JSON.stringify(parsed.errors.slice(0, 3))}`);
    const user = { id: 1, name: "Catalog order test" };
    const preview = await createCatalogImportPreviewToken(db, parsed, { name: fileName, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, user, buffer);
    if (!preview.canImport && allowNoop && Number(preview.summary?.applicableRows || 0) === 0 && !Number(preview.summary?.criticalErrors || 0)) {
        return { preview, result: null };
    }
    if (!preview.canImport) throw new Error(`Preview blocked: ${JSON.stringify(preview.summary)}`);
    const result = await applyCatalogImport(db, preview.token, {}, user);
    if (result.excelCopyPath && fs.existsSync(result.excelCopyPath)) fs.unlinkSync(result.excelCopyPath);
    return { preview, result };
}

async function main() {
    const db = createDb(testDatabasePath);
    try {
        const firstExport = await buildCatalogExportWorkbook(db);
        const reordered = moveCategoryBefore(firstExport.workbook, "Люки", "Вентиляция");
        const intendedSequence = getSequence(reordered.worksheets[0]);
        const firstApply = await previewAndApply(db, reordered, "catalog-order-test.xlsx");
        const afterExport = await buildCatalogExportWorkbook(db);
        const afterSequence = getSequence(afterExport.workbook.worksheets[0]);
        if (JSON.stringify(intendedSequence) !== JSON.stringify(afterSequence)) {
            const mismatchIndex = intendedSequence.findIndex((value, index) => value !== afterSequence[index]);
            throw new Error(`Import/export sequence mismatch at ${mismatchIndex}: ${intendedSequence[mismatchIndex]} !== ${afterSequence[mismatchIndex]}`);
        }

        const stateAfterFirstApply = await getOrderState(db);
        const secondApply = await previewAndApply(db, reordered, "catalog-order-test-repeat.xlsx", true);
        const stateAfterSecondApply = await getOrderState(db);
        if (JSON.stringify(stateAfterFirstApply) !== JSON.stringify(stateAfterSecondApply)) throw new Error("Repeated import changed catalog order");

        const rollbackWorkbook = moveCategoryBefore(afterExport.workbook, "Вентиляция", "Люки");
        const rollbackPreviewBuffer = await rollbackWorkbook.xlsx.writeBuffer();
        const rollbackParsed = await parseCatalogExcel(rollbackPreviewBuffer);
        const user = { id: 1, name: "Catalog order rollback test" };
        const rollbackPreview = await createCatalogImportPreviewToken(db, rollbackParsed, { name: "catalog-order-rollback.xlsx" }, user, rollbackPreviewBuffer);
        const stateBeforeRollback = await getOrderState(db);
        await db.run("CREATE TRIGGER fail_product_order_update BEFORE UPDATE OF sort_order ON products BEGIN SELECT RAISE(ABORT, 'catalog order rollback test'); END");
        await db.run("CREATE TRIGGER fail_structure_order_update BEFORE UPDATE OF sort_order ON catalog_structure BEGIN SELECT RAISE(ABORT, 'catalog order rollback test'); END");
        let rollbackTriggered = false;
        try {
            await applyCatalogImport(db, rollbackPreview.token, {}, user);
        } catch {
            rollbackTriggered = true;
        }
        await db.run("DROP TRIGGER IF EXISTS fail_product_order_update");
        await db.run("DROP TRIGGER IF EXISTS fail_structure_order_update");
        const stateAfterRollback = await getOrderState(db);
        if (!rollbackTriggered || JSON.stringify(stateBeforeRollback) !== JSON.stringify(stateAfterRollback)) throw new Error("Catalog order rollback failed");

        const newStructureWorkbook = addNewStructureBefore(await buildCatalogExportWorkbook(db).then(item => item.workbook), "Вентиляция");
        const newStructureApply = await previewAndApply(db, newStructureWorkbook, "catalog-new-structure.xlsx");
        const newStructureExport = await buildCatalogExportWorkbook(db);
        const newStructureRepeat = await previewAndApply(db, newStructureExport.workbook, "catalog-new-structure-repeat.xlsx", true);
        const newStructureRows = await db.all("SELECT id, type, name, external_code, parent_id, sort_order FROM catalog_structure WHERE name IN (?, ?) ORDER BY type", ["Roundtrip Test", "Roundtrip Sub"]);
        const newProducts = await db.all("SELECT id, external_id, title, product_group, sort_order FROM products WHERE title IN (?, ?) AND deleted_at IS NULL ORDER BY title", ["Roundtrip Product One", "Roundtrip Product Two"]);
        if (newStructureRows.length !== 2 || newProducts.length !== 2) throw new Error("New structure was not created completely");
        if (new Set(newStructureRows.map(row => row.external_code)).size !== 2 || new Set(newProducts.map(row => row.external_id)).size !== 2) throw new Error("Generated structure/product codes are not unique");

        const categoryNames = getCategoryBlocks(afterExport.workbook.worksheets[0]).map(block => block.name);
        const hatchesIndex = categoryNames.indexOf("Люки");
        const ventilationIndex = categoryNames.indexOf("Вентиляция");
        if (hatchesIndex < 0 || ventilationIndex < 0 || hatchesIndex >= ventilationIndex) throw new Error("Люки is not before Вентиляция");

        console.log(JSON.stringify({
            success: true,
            sequenceLength: afterSequence.length,
            hatchesIndex,
            ventilationIndex,
            firstPreviewUpdates: firstApply.preview.summary?.updated || 0,
            firstApplicableRows: firstApply.preview.summary?.applicableRows || 0,
            parsedProducts: firstApply.preview.file?.productRows || 0,
            secondPreviewUpdates: secondApply.preview.summary?.updated || 0,
            secondApplicableRows: secondApply.preview.summary?.applicableRows || 0,
            newStructure: {
                generatedCategoryCodes: newStructureApply.preview.summary?.generatedCategoryCodes || 0,
                generatedSubcategoryCodes: newStructureApply.preview.summary?.generatedSubcategoryCodes || 0,
                generatedMatCodes: newStructureApply.preview.summary?.generatedMatCodes || 0,
                repeatNew: newStructureRepeat.preview.summary?.new || 0,
                repeatUpdated: newStructureRepeat.preview.summary?.updated || 0,
                repeatCritical: newStructureRepeat.preview.summary?.criticalErrors || 0
            },
            rollback: "ok"
        }));
    } finally {
        await db.close();
        await new Promise(resolve => databaseModule.db.close(() => resolve()));
        if (fs.existsSync(importedExcelDir)) {
            fs.readdirSync(importedExcelDir)
                .filter(name => testArtifactPrefixes.some(prefix => name.startsWith(prefix)) && !existingTestArtifacts.has(name))
                .forEach(name => fs.rmSync(path.join(importedExcelDir, name), { force: true }));
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
