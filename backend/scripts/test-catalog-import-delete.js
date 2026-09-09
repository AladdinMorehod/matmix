const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ExcelJS = require("exceljs");
const sourceDb = path.join(__dirname, "..", "database", "matmix.db");
const excelPath = process.argv[2] || "C:\\Users\\Aladd\\Desktop\\MatMix_catalog.xlsx";

async function main() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-delete-e2e-"));
    const dbPath = path.join(dir, "matmix.db");
    fs.copyFileSync(sourceDb, dbPath);
    process.env.MATMIX_DB_PATH = dbPath;
    process.env.CATALOG_IMPORT_ARCHIVE_PATH = path.join(dir, "archives");
    const database = require("../database");
    const service = require("../services/catalogImport");
    const user = { id: 1, name: "isolated delete test", role: "admin" };
    await database.run("UPDATE products SET source='public-site'");
    const buffer = fs.readFileSync(excelPath);
    const parsed = await service.parseCatalogExcel(buffer);
    const baselineRow = parsed.productRows.find(row => service.validateMatCode(service.normalizeMatCode(row.externalId)));
    const authoritativeParsed = { ...parsed, productRows: baselineRow ? [baselineRow] : [] };
    const now = new Date().toISOString();
    const base = await database.get("SELECT * FROM products WHERE deleted_at IS NULL LIMIT 1");
    assert(base, "isolated database needs an Excel product template");
    const category = await database.get("SELECT name FROM catalog_structure WHERE type='category' AND is_system=0 LIMIT 1");
    const subcategory = await database.get("SELECT name FROM catalog_structure WHERE type='subcategory' AND is_system=0 LIMIT 1");
    const ids = [];
    for (const [title, mat] of [["Test3", "MAT-004160"], ["Test4", "MAT-004161"]]) {
        const inserted = await database.run(`INSERT INTO products (external_id,title,slug,category,subcategory,product_group,price,weight,unit,is_active,sort_order,source,last_imported_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,1,?,?,?, ?,?)`, [mat, title, `${title.toLowerCase()}-${mat.toLowerCase()}`, category?.name || base.category, subcategory?.name || base.subcategory, base.product_group || "", base.price || 1, base.weight || 1, base.unit || "шт", base.sort_order || 0, "excel", now, now, now]);
        ids.push(inserted.id);
    }
    const token = await service.createCatalogImportPreviewToken(database, authoritativeParsed, { name: path.basename(excelPath), size: buffer.length, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, user, buffer);
    const preview = await service.updateCatalogImportResolutions(database, token.token, [], user);
    assert.strictEqual(preview.data.preview.summary.missingFromFile, 2);
    const applied = await service.applyCatalogImport(database, token.token, { missingFromFileAction: "delete" }, user, { archiveOptions: { rootPath: path.join(dir, "archives") } });
    assert.strictEqual(applied.deleted, 2);
    for (const id of ids) assert.strictEqual(await database.get("SELECT 1 FROM products WHERE id=?", [id]), undefined);
    const owners = await database.all("SELECT external_id FROM products WHERE external_id IN ('MAT-004160','MAT-004161')");
    assert.strictEqual(owners.length, 0);
    const secondToken = await service.createCatalogImportPreviewToken(database, authoritativeParsed, { name: path.basename(excelPath), size: buffer.length, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, user, buffer);
    const second = secondToken;
    assert.strictEqual(second.summary.missingFromFile, 0);
    await database.db.close();
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* Windows may release archive handles asynchronously. */ }
    console.log(JSON.stringify({ success: true, missingBefore: 2, deleted: applied.deleted, matReleased: true, missingAfter: second.summary.missingFromFile }));
}

main().catch(error => { console.error(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
