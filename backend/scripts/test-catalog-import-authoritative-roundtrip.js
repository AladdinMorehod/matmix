const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ExcelJS = require("exceljs");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-authoritative-roundtrip-"));
process.env.MATMIX_DB_PATH = path.join(dir, "matmix.db");
process.env.CATALOG_IMPORT_ARCHIVE_PATH = path.join(dir, "archives");

const database = require("../database");
const catalogImport = require("../services/catalogImport");

function buildWorkbook({ includeTests = true, categoryName = "ТЕСТ 1", subcategoryName = "Тест2" } = {}) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    sheet.addRow(["Тип / структура / наименование", "Служебная копия", "ID товара", "Ед. изм", "Цена", "Порядок", "", "Группа Товаров", "", "Вес", "Код товара"]);
    sheet.addRow([]); sheet.addRow([]); sheet.addRow([]); sheet.addRow([]); sheet.addRow([]);
    sheet.addRow([`Категория - ${categoryName}`, `Категория - ${categoryName}`, null, null, null, null, null, null, null, null, null]);
    sheet.addRow([`Подкатегория - ${subcategoryName}`, `Подкатегория - ${subcategoryName}`, null, null, null, null, null, null, null, null, null, null]);
    sheet.addRow(["Базовый товар", "Базовый товар", null, "шт", 10, 3, null, "База", null, 1, "MAT-009999"]);
    if (includeTests) {
        sheet.addRow(["Тест 3", "Тест 3", null, "шт", 100, 1, null, "Тесты", null, 1, "MAT-004160"]);
        sheet.addRow(["Тест 4", "Тест 4", null, "шт", 200, 2, null, "Тесты", null, 1, "MAT-004161"]);
    }
    return workbook;
}

async function parseWorkbook(workbook) {
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, parsed: await catalogImport.parseCatalogExcel(buffer) };
}

async function preview(parsed, buffer, name) {
    return catalogImport.createCatalogImportPreviewToken(database, parsed, { name, size: buffer.length, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, { id: 1, name: "roundtrip", role: "admin" }, buffer);
}

async function audit() {
    const integrity = await database.get("PRAGMA integrity_check");
    const foreignKeys = await database.all("PRAGMA foreign_key_check");
    const duplicateMat = await database.get("SELECT COUNT(*) count FROM (SELECT external_id FROM products WHERE external_id IS NOT NULL AND external_id != '' GROUP BY external_id HAVING COUNT(*) > 1)");
    return { integrity: integrity.integrity_check, foreignKeys: foreignKeys.length, duplicateMat: Number(duplicateMat.count) };
}

async function main() {
    await database.initDatabase();
    await new Promise(resolve => setTimeout(resolve, 200));
    await database.run("DELETE FROM products");
    await database.run("DELETE FROM catalog_structure WHERE COALESCE(is_system,0)=0 AND id != 251");
    let unrelated = await database.get("SELECT * FROM products WHERE external_id LIKE 'MAT-%' LIMIT 1");
    if (!unrelated) {
        const now = new Date().toISOString();
        const inserted = await database.run("INSERT INTO products (external_id,title,slug,category,subcategory,product_group,price,weight,unit,is_active,sort_order,source,last_imported_at,created_at,updated_at) VALUES ('MAT-009999','Базовый товар','base-mat-009999','Базовая категория','Базовая подкатегория','База',10,1,'шт',1,1,'public-site',?,?,?)", [now, now, now]);
        unrelated = await database.get("SELECT * FROM products WHERE id=?", [inserted.id]);
    }
    const structure = await database.get("SELECT category, subcategory FROM products WHERE category IS NOT NULL AND subcategory IS NOT NULL LIMIT 1");
    const categoryName = structure?.category || "Базовая категория";
    const subcategoryName = structure?.subcategory || "Базовая подкатегория";
    const ts = new Date().toISOString();
    const categoryRow = await database.get("SELECT id FROM catalog_structure WHERE type='category' AND normalized_name=?", [categoryName.toLowerCase()]);
    const categoryId = categoryRow?.id || (await database.run("INSERT INTO catalog_structure (type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES ('category',?,?,NULL,NULL,1,1,0,?,?)", [categoryName, categoryName.toLowerCase(), ts, ts])).id;
    if (!await database.get("SELECT id FROM catalog_structure WHERE type='subcategory' AND parent_id=? AND normalized_name=?", [categoryId, subcategoryName.toLowerCase()])) await database.run("INSERT INTO catalog_structure (type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES ('subcategory',?,?,NULL,?,1,1,0,?,?)", [subcategoryName, subcategoryName.toLowerCase(), categoryId, ts, ts]);
    assert(unrelated);

    const stageA = await parseWorkbook(buildWorkbook({ includeTests: true, categoryName, subcategoryName }));
    if (!stageA.parsed.productRows.length) console.log(JSON.stringify({ parsedErrors: stageA.parsed.errors, parsedWarnings: stageA.parsed.warnings.slice(0, 5) }));
    const tokenA = await preview(stageA.parsed, stageA.buffer, "stage-a.xlsx");
    console.log(JSON.stringify({ stageASummary: tokenA.summary, rows: stageA.parsed.productRows }));
    assert.strictEqual(tokenA.summary.new, 2);
    const applyA = await catalogImport.applyCatalogImport(database, tokenA.token, { missingFromFileAction: "keep" }, { id: 1, name: "roundtrip", role: "admin" });
    assert.strictEqual(applyA.created, 2);
    assert(await database.get("SELECT id FROM products WHERE external_id='MAT-004160'"));
    assert(await database.get("SELECT id FROM products WHERE external_id='MAT-004161'"));
    assert((await audit()).foreignKeys === 0);
    console.log("STAGE_A=PASS");

    const stageBToken = await preview(stageA.parsed, stageA.buffer, "stage-a.xlsx");
    assert.strictEqual(stageBToken.summary.new, 0); assert.strictEqual(stageBToken.summary.updated, 0); assert.strictEqual(stageBToken.summary.missingFromFile, 0); assert.strictEqual(stageBToken.summary.matReassignments || stageBToken.summary.matChangesPlanned, 0);
    console.log("STAGE_B=PASS");

    const stageC = await parseWorkbook(buildWorkbook({ includeTests: false, categoryName, subcategoryName }));
    const beforeC = JSON.stringify(await database.all("SELECT id,external_id,title,source FROM products ORDER BY id"));
    const tokenC = await preview(stageC.parsed, stageC.buffer, "stage-c.xlsx");
    assert.strictEqual(tokenC.summary.missingFromFile, 2);
    assert.strictEqual(JSON.stringify(await database.all("SELECT id,external_id,title,source FROM products ORDER BY id")), beforeC);
    const applyC = await catalogImport.applyCatalogImport(database, tokenC.token, { missingFromFileAction: "delete" }, { id: 1, name: "roundtrip", role: "admin" });
    assert.strictEqual(applyC.deleted, 2);
    assert.strictEqual(await database.get("SELECT id FROM products WHERE external_id IN ('MAT-004160','MAT-004161')"), undefined);
    console.log("STAGE_C=PASS");

    console.log("PRODUCT_COUNT_BEFORE_EXPORT=" + Number((await database.get("SELECT COUNT(*) count FROM products")).count));
    const exported = await catalogImport.buildCatalogExportWorkbook({ all: database.all.bind(database) });
    console.log("EXPORT_ROWCOUNT=" + exported.workbook.worksheets[0].rowCount);
    const exportBuffer = await exported.workbook.xlsx.writeBuffer();
    const exportParsed = await catalogImport.parseCatalogExcel(exportBuffer);
    assert(!exportParsed.productRows.some(row => ["MAT-004160", "MAT-004161"].includes(catalogImport.normalizeMatCode(row.externalId))));
    assert(exportParsed.productRows.some(row => row.title === unrelated.title));
    console.log("STAGE_D=PASS");

    const tokenE = await preview(exportParsed, exportBuffer, exported.filename || "export.xlsx");
    console.log(JSON.stringify({ stageESummary: tokenE.summary }));
    assert.strictEqual(tokenE.summary.new, 0); assert.strictEqual(tokenE.summary.updated, 0); assert.strictEqual(tokenE.summary.missingFromFile, 0); assert.strictEqual(tokenE.summary.requiresReview, 0); assert.strictEqual(tokenE.canImport, true);
    const beforeE = JSON.stringify(await database.all("SELECT id,external_id,title,source,is_active,deleted_at FROM products ORDER BY id"));
    await catalogImport.applyCatalogImport(database, tokenE.token, { missingFromFileAction: "keep" }, { id: 1, name: "roundtrip", role: "admin" });
    const afterE = JSON.stringify(await database.all("SELECT id,external_id,title,source,is_active,deleted_at FROM products ORDER BY id"));
    assert.strictEqual(afterE, beforeE);
    const finalAudit = await audit(); assert.deepStrictEqual(finalAudit, { integrity: "ok", foreignKeys: 0, duplicateMat: 0 });
    console.log("STAGE_E=PASS");
    console.log(JSON.stringify({ success: true, exportGenerator: "catalogImport.buildCatalogExportWorkbook (route /api/products/import/export/excel)", finalAudit }));
    await database.db.close();
}

main().catch(error => { console.error(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
