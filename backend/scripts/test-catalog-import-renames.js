const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ExcelJS = require("exceljs");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-catalog-rename-test-"));
const databasePath = path.join(tempDir, "matmix.db");
process.env.MATMIX_DB_PATH = databasePath;

const database = require("../database");
const {
    parseCatalogExcel,
    createCatalogImportPreviewToken,
    applyCatalogImport
} = require("../services/catalogImport");

const importedExcelDir = path.join(__dirname, "..", "imported-excel");
const initialExcelArtifacts = new Set(fs.existsSync(importedExcelDir) ? fs.readdirSync(importedExcelDir) : []);
const user = { id: 1, name: "Catalog rename regression" };

async function setupDatabase() {
    await database.run(`CREATE TABLE products (
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
        deleted_at TEXT
    )`);
    await database.run(`CREATE TABLE catalog_structure (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL,
        external_code TEXT,
        parent_id INTEGER,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_system INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )`);
    await database.run("CREATE UNIQUE INDEX category_name ON catalog_structure(normalized_name) WHERE type='category' AND is_active=1 AND is_system=0");
    await database.run("CREATE UNIQUE INDEX subcategory_name ON catalog_structure(parent_id, normalized_name) WHERE type='subcategory' AND is_active=1 AND is_system=0");
    await database.run("CREATE UNIQUE INDEX structure_code ON catalog_structure(external_code) WHERE external_code IS NOT NULL AND external_code != ''");
    await database.run(`CREATE TABLE catalog_import_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        user_name TEXT,
        file_name TEXT,
        file_hash TEXT,
        backup_path TEXT,
        excel_copy_path TEXT,
        created_count INTEGER,
        updated_count INTEGER,
        assigned_mat_count INTEGER,
        assigned_structure_count INTEGER,
        hidden_count INTEGER,
        requires_review_count INTEGER,
        error_count INTEGER,
        summary_json TEXT,
        created_at TEXT NOT NULL
    )`);

    const now = new Date().toISOString();
    const category = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,1,1,0,?,?)",
        ["Лакокрасочные", "лакокрасочные", "CAT-000001", null, now, now]
    );
    const otherCategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,2,1,0,?,?)",
        ["Инструменты", "инструменты", "CAT-000002", null, now, now]
    );
    const subcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,1,1,0,?,?)",
        ["Грунт / БетонКонтакт", "грунт / бетонконтакт", "SUB-000001", category.id, now, now]
    );
    const otherSubcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,2,1,0,?,?)",
        ["Эмали", "эмали", "SUB-000002", category.id, now, now]
    );
    await database.run(
        `INSERT INTO products(external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ["MAT-000001", "Грунтовка Тест", "gruntovka-test", "Лакокрасочные", "Грунт / БетонКонтакт", "Грунты", 100, 1, "шт", "", "", 1, 1, "excel", now, now, now]
    );
    return { categoryId: category.id, otherCategoryId: otherCategory.id, subcategoryId: subcategory.id, otherSubcategoryId: otherSubcategory.id };
}

async function createWorkbook({ categoryName, categoryCode, subcategoryName, subcategoryCode, productTitle }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    sheet.addRow([`Категория - ${categoryName}`, `Категория - ${categoryName}`, null, null, null, null, null, null, null, null, categoryCode]);
    sheet.addRow([`Подкатегория - ${subcategoryName}`, `Подкатегория - ${subcategoryName}`, null, null, null, null, null, null, null, null, subcategoryCode]);
    sheet.addRow([productTitle, productTitle, null, "шт", 100, null, null, "Грунты", null, 1, "MAT-000001"]);
    return workbook;
}

async function preview(workbook, name) {
    const buffer = await workbook.xlsx.writeBuffer();
    const parsed = await parseCatalogExcel(buffer);
    assert.deepStrictEqual(parsed.errors, []);
    return createCatalogImportPreviewToken(database, parsed, { name, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, user, buffer);
}

function cleanupApplyArtifacts(result) {
    [result?.backupPath, result?.excelCopyPath].forEach(filePath => {
        if (filePath && fs.existsSync(filePath)) fs.rmSync(filePath, { force: true });
    });
}

async function apply(workbook, name) {
    const resultPreview = await preview(workbook, name);
    assert.strictEqual(resultPreview.canImport, true, JSON.stringify(resultPreview.errors));
    const result = await applyCatalogImport(database, resultPreview.token, {}, user);
    cleanupApplyArtifacts(result);
    return { preview: resultPreview, result };
}

async function assertIdentity(expected, ids) {
    const categories = await database.all("SELECT id,name,normalized_name,external_code FROM catalog_structure WHERE type='category' AND external_code='CAT-000001'");
    const subcategories = await database.all("SELECT id,parent_id,name,normalized_name,external_code FROM catalog_structure WHERE type='subcategory' AND external_code='SUB-000001'");
    assert.strictEqual(categories.length, 1);
    assert.strictEqual(subcategories.length, 1);
    assert.strictEqual(categories[0].id, ids.categoryId);
    assert.strictEqual(categories[0].external_code, "CAT-000001");
    assert.strictEqual(categories[0].name, expected.categoryName);
    assert.strictEqual(categories[0].normalized_name, expected.categoryNormalizedName);
    assert.strictEqual(subcategories[0].id, ids.subcategoryId);
    assert.strictEqual(subcategories[0].parent_id, ids.categoryId);
    assert.strictEqual(subcategories[0].external_code, "SUB-000001");
    assert.strictEqual(subcategories[0].name, expected.subcategoryName);
    assert.strictEqual(subcategories[0].normalized_name, expected.subcategoryNormalizedName);
}

async function assertProduct(expected, productId) {
    const products = await database.all("SELECT id,external_id,title,category,subcategory FROM products WHERE external_id='MAT-000001'");
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].id, productId);
    assert.strictEqual(products[0].title, expected.title);
    assert.strictEqual(products[0].category, expected.categoryName);
    assert.strictEqual(products[0].subcategory, expected.subcategoryName);
    const publicFilter = await database.all(
        "SELECT id FROM products WHERE category=? AND subcategory=? AND is_active=1 AND deleted_at IS NULL",
        [expected.categoryName, expected.subcategoryName]
    );
    assert.deepStrictEqual(publicFilter.map(row => row.id), [productId]);
}

async function main() {
    const ids = await setupDatabase();
    const productId = (await database.get("SELECT id FROM products WHERE external_id='MAT-000001'")).id;

    const caseOnlyWorkbook = await createWorkbook({
        categoryName: "лакокрасочные",
        categoryCode: "CAT-000001",
        subcategoryName: "грунт / бетонконтакт",
        subcategoryCode: "SUB-000001",
        productTitle: "грунтовка тест"
    });
    const caseOnly = await apply(caseOnlyWorkbook, "catalog-case-only-rename.xlsx");
    assert.strictEqual(caseOnly.preview.changes.renamedCategories.length, 1);
    assert.strictEqual(caseOnly.preview.changes.renamedSubcategories.length, 1);
    assert.deepStrictEqual(
        Object.keys(caseOnly.preview.changes.renamedCategories[0]).sort(),
        ["currentName", "externalCode", "incomingName", "rowNumber", "structureId"].sort()
    );
    await assertIdentity({
        categoryName: "лакокрасочные",
        categoryNormalizedName: "лакокрасочные",
        subcategoryName: "грунт / бетонконтакт",
        subcategoryNormalizedName: "грунт / бетонконтакт"
    }, ids);
    await assertProduct({ title: "грунтовка тест", categoryName: "лакокрасочные", subcategoryName: "грунт / бетонконтакт" }, productId);

    const repeated = await preview(caseOnlyWorkbook, "catalog-case-only-repeat.xlsx");
    assert.strictEqual(repeated.canImport, true);
    assert.strictEqual(repeated.changes.renamedCategories.length, 0);
    assert.strictEqual(repeated.changes.renamedSubcategories.length, 0);
    assert.strictEqual(repeated.summary.new, 0);
    assert.strictEqual(repeated.summary.updated, 0);
    cleanupApplyArtifacts(await applyCatalogImport(database, repeated.token, {}, user));

    const substantialWorkbook = await createWorkbook({
        categoryName: "Краски и покрытия",
        categoryCode: "CAT-000001",
        subcategoryName: "Грунты глубокого проникновения",
        subcategoryCode: "SUB-000001",
        productTitle: "Грунтовка универсальная"
    });
    const substantial = await apply(substantialWorkbook, "catalog-substantial-rename.xlsx");
    assert.strictEqual(substantial.preview.changes.renamedCategories.length, 1);
    assert.strictEqual(substantial.preview.changes.renamedSubcategories.length, 1);
    assert.strictEqual(substantial.preview.summary.newCategories, 0);
    assert.strictEqual(substantial.preview.summary.newSubcategories, 0);
    await assertIdentity({
        categoryName: "Краски и покрытия",
        categoryNormalizedName: "краски и покрытия",
        subcategoryName: "Грунты глубокого проникновения",
        subcategoryNormalizedName: "грунты глубокого проникновения"
    }, ids);
    await assertProduct({ title: "Грунтовка универсальная", categoryName: "Краски и покрытия", subcategoryName: "Грунты глубокого проникновения" }, productId);

    const categoryConflict = await preview(await createWorkbook({
        categoryName: "Инструменты",
        categoryCode: "CAT-000001",
        subcategoryName: "Грунты глубокого проникновения",
        subcategoryCode: "SUB-000001",
        productTitle: "Грунтовка универсальная"
    }), "catalog-category-conflict.xlsx");
    assert.strictEqual(categoryConflict.canImport, false);
    assert(categoryConflict.changes.structureCodeConflicts.some(item => item.conflictType === "CODE_NAME_MISMATCH"));

    const subcategoryConflict = await preview(await createWorkbook({
        categoryName: "Краски и покрытия",
        categoryCode: "CAT-000001",
        subcategoryName: "Эмали",
        subcategoryCode: "SUB-000001",
        productTitle: "Грунтовка универсальная"
    }), "catalog-subcategory-conflict.xlsx");
    assert.strictEqual(subcategoryConflict.canImport, false);
    assert(subcategoryConflict.changes.structureCodeConflicts.some(item => item.conflictType === "CODE_NAME_MISMATCH"));

    const finalRepeated = await preview(substantialWorkbook, "catalog-substantial-repeat.xlsx");
    assert.strictEqual(finalRepeated.canImport, true);
    assert.strictEqual(finalRepeated.summary.new, 0);
    assert.strictEqual(finalRepeated.summary.updated, 0);
    assert.strictEqual(finalRepeated.summary.newCategories, 0);
    assert.strictEqual(finalRepeated.summary.newSubcategories, 0);
    assert.strictEqual(finalRepeated.summary.renamedCategories, 0);
    assert.strictEqual(finalRepeated.summary.renamedSubcategories, 0);

    console.log(JSON.stringify({
        success: true,
        scenarios: {
            caseOnlyCategoryRename: "ok",
            caseOnlySubcategoryRename: "ok",
            substantialCategoryRenameByCode: "ok",
            substantialSubcategoryRenameByCode: "ok",
            codeNameConflict: "blocked",
            productSynchronization: "ok",
            productRenameByMat: "ok",
            idempotence: "ok"
        }
    }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(async () => {
    await new Promise(resolve => database.db.close(() => resolve()));
    if (fs.existsSync(importedExcelDir)) {
        fs.readdirSync(importedExcelDir).forEach(name => {
            if (!initialExcelArtifacts.has(name) && /catalog-.*-updated-/i.test(name)) {
                fs.rmSync(path.join(importedExcelDir, name), { force: true });
            }
        });
    }
    fs.rmSync(tempDir, { recursive: true, force: true });
});
