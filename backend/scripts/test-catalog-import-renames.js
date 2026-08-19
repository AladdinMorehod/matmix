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
const CASCADE_SUBCATEGORY_COUNT = 158;
const CASCADE_LAST_CODE_NUMBER = CASCADE_SUBCATEGORY_COUNT + 2;
const PRODUCTION_CASCADE_SUBCATEGORY_COUNT = 158;

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
    const cascadeSubcategories = [];
    for (let index = 3; index <= CASCADE_LAST_CODE_NUMBER; index += 1) {
        const name = `Тестовая подкатегория ${index}`;
        const externalCode = `SUB-${String(index).padStart(6, "0")}`;
        const result = await database.run(
            "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,?,1,0,?,?)",
            [name, name.toLowerCase(), externalCode, category.id, index, now, now]
        );
        cascadeSubcategories.push({ id: result.id, name, externalCode, productCode: `MAT-${String(index).padStart(6, "0")}` });
    }
    const otherParentSubcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,1,1,0,?,?)",
        ["Подкатегория инструментов", "подкатегория инструментов", "SUB-000999", otherCategory.id, now, now]
    );
    const ventilationCategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,19,1,0,?,?)",
        ["Вентиляция", "вентиляция", "CAT-000019", null, now, now]
    );
    const ceilingCategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,20,1,0,?,?)",
        ["Потолочные системы", "потолочные системы", "CAT-000020", null, now, now]
    );
    const hatchesCategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('category',?,?,?,?,22,1,0,?,?)",
        ["Люки", "люки", "CAT-000022", null, now, now]
    );
    const ventilationCodeOwnerSubcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,1,1,0,?,?)",
        ["Воздуховоды", "воздуховоды", "SUB-000201", ventilationCategory.id, now, now]
    );
    const hatchesNameOwnerSubcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,1,1,0,?,?)",
        ["Люки ревизионные", "люки ревизионные", "SUB-000202", hatchesCategory.id, now, now]
    );
    const ventilationSubcategory = await database.run(
        "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,2,1,0,?,?)",
        ["Вентиляционные решётки", "вентиляционные решетки", "SUB-000203", ventilationCategory.id, now, now]
    );
    const productionCascadeSubcategories = [{
        id: hatchesNameOwnerSubcategory.id,
        name: "Люки ревизионные",
        storedCode: "SUB-000202",
        incomingCode: "SUB-000201",
        productCode: "MAT-001000"
    }];
    for (let index = 1; index < PRODUCTION_CASCADE_SUBCATEGORY_COUNT; index += 1) {
        const number = 299 + index;
        const name = `Люки: тестовая подкатегория ${index}`;
        const storedCode = `SUB-${String(number).padStart(6, "0")}`;
        const result = await database.run(
            "INSERT INTO catalog_structure(type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at) VALUES('subcategory',?,?,?,?,?,1,0,?,?)",
            [name, name.toLowerCase(), storedCode, hatchesCategory.id, index + 1, now, now]
        );
        productionCascadeSubcategories.push({
            id: result.id,
            name,
            storedCode,
            incomingCode: storedCode,
            productCode: `MAT-${String(1000 + index).padStart(6, "0")}`
        });
    }
    await database.run(
        `INSERT INTO products(external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ["MAT-000001", "Грунтовка Тест", "gruntovka-test", "Лакокрасочные", "Грунт / БетонКонтакт", "Грунты", 100, 1, "шт", "", "", 1, 1, "excel", now, now, now]
    );
    for (const [index, item] of cascadeSubcategories.entries()) {
        await database.run(
            `INSERT INTO products(external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [item.productCode, `Тестовый товар ${index + 1}`, `test-product-${index + 1}`, "Лакокрасочные", item.name, "Тестовая группа", 100 + index, 1, "шт", "", "", 1, index + 2, "excel", now, now, now]
        );
    }
    for (const [index, item] of productionCascadeSubcategories.entries()) {
        await database.run(
            `INSERT INTO products(external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at)
             VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [item.productCode, `Товар для люков ${index + 1}`, `hatch-product-${index + 1}`, "Люки", item.name, "Люки", 200 + index, 1, "шт", "", "", 1, index + 1, "excel", now, now, now]
        );
    }
    await database.run(
        `INSERT INTO products(external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ["MAT-002000", "Вентиляционная решётка", "ventilation-grille", "Вентиляция", "Вентиляционные решётки", "Вентиляция", 500, 1, "шт", "", "", 1, 1, "excel", now, now, now]
    );
    return {
        categoryId: category.id,
        otherCategoryId: otherCategory.id,
        subcategoryId: subcategory.id,
        otherSubcategoryId: otherSubcategory.id,
        otherParentSubcategoryId: otherParentSubcategory.id,
        cascadeSubcategories,
        ventilationCategoryId: ventilationCategory.id,
        ceilingCategoryId: ceilingCategory.id,
        hatchesCategoryId: hatchesCategory.id,
        ventilationCodeOwnerSubcategoryId: ventilationCodeOwnerSubcategory.id,
        hatchesNameOwnerSubcategoryId: hatchesNameOwnerSubcategory.id,
        ventilationSubcategoryId: ventilationSubcategory.id,
        productionCascadeSubcategories
    };
}

async function createWorkbook({ categoryName, categoryCode, subcategoryName, subcategoryCode, productTitle, subcategories = null }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    sheet.addRow([`Категория - ${categoryName}`, `Категория - ${categoryName}`, null, null, null, null, null, null, null, null, categoryCode]);
    const rows = subcategories || [{ name: subcategoryName, code: subcategoryCode, productTitle, productCode: "MAT-000001" }];
    rows.forEach((item, index) => {
        sheet.addRow([`Подкатегория - ${item.name}`, `Подкатегория - ${item.name}`, null, null, null, null, null, null, null, null, item.code]);
        sheet.addRow([item.productTitle, item.productTitle, null, "шт", 100 + index, null, null, "Грунты", null, 1, item.productCode]);
    });
    return workbook;
}

async function createMultiCategoryWorkbook(categories) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    categories.forEach(category => {
        sheet.addRow([`Категория - ${category.name}`, `Категория - ${category.name}`, null, null, null, null, null, null, null, null, category.code]);
        category.subcategories.forEach((subcategory, index) => {
            sheet.addRow([`Подкатегория - ${subcategory.name}`, `Подкатегория - ${subcategory.name}`, null, null, null, null, null, null, null, null, subcategory.code]);
            sheet.addRow([subcategory.productTitle, subcategory.productTitle, null, "шт", 200 + index, null, null, category.name, null, 1, subcategory.productCode]);
        });
    });
    return workbook;
}

async function createProductionLegacyWorkbook(ids) {
    return createMultiCategoryWorkbook([
        {
            name: "Люки",
            code: "CAT-000019",
            subcategories: ids.productionCascadeSubcategories.map((item, index) => ({
                name: item.name,
                code: item.incomingCode,
                productTitle: `Товар для люков ${index + 1}`,
                productCode: item.productCode
            }))
        },
        {
            name: "Вентиляция",
            code: "CAT-000020",
            subcategories: [{
                name: "Вентиляционные решётки",
                code: "SUB-000203",
                productTitle: "Вентиляционная решётка",
                productCode: "MAT-002000"
            }]
        }
    ]);
}

function createProductionLikeSubcategories(ids, firstName, firstTitle) {
    return [
        { name: firstName, code: "SUB-000001", productTitle: firstTitle, productCode: "MAT-000001" },
        ...ids.cascadeSubcategories.map((item, index) => ({
            name: item.name,
            code: item.externalCode,
            productTitle: `Тестовый товар ${index + 1}`,
            productCode: item.productCode
        }))
    ];
}

async function getMutableState() {
    return {
        structure: await database.all("SELECT id,type,name,normalized_name,external_code,parent_id,sort_order FROM catalog_structure ORDER BY id"),
        products: await database.all("SELECT id,external_id,title,category,subcategory,updated_at FROM products ORDER BY id")
    };
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

async function assertCascadeIdentities(ids, expectedCategoryName) {
    const rows = await database.all(
        "SELECT id,name,external_code,parent_id FROM catalog_structure WHERE external_code BETWEEN 'SUB-000003' AND ? ORDER BY external_code",
        [`SUB-${String(CASCADE_LAST_CODE_NUMBER).padStart(6, "0")}`]
    );
    assert.strictEqual(rows.length, ids.cascadeSubcategories.length);
    rows.forEach((row, index) => {
        const expected = ids.cascadeSubcategories[index];
        assert.strictEqual(row.id, expected.id);
        assert.strictEqual(row.name, expected.name);
        assert.strictEqual(row.external_code, expected.externalCode);
        assert.strictEqual(row.parent_id, ids.categoryId);
    });
    const products = await database.all(
        "SELECT external_id,category,subcategory FROM products WHERE external_id BETWEEN 'MAT-000003' AND ? ORDER BY external_id",
        [`MAT-${String(CASCADE_LAST_CODE_NUMBER).padStart(6, "0")}`]
    );
    assert.strictEqual(products.length, ids.cascadeSubcategories.length);
    products.forEach((product, index) => {
        assert.strictEqual(product.category, expectedCategoryName);
        assert.strictEqual(product.subcategory, ids.cascadeSubcategories[index].name);
    });
}

function cleanupFailedApplyArtifacts() {
    const backupDir = path.join(tempDir, "backups");
    if (!fs.existsSync(backupDir)) return;
    fs.readdirSync(backupDir).forEach(name => fs.rmSync(path.join(backupDir, name), { force: true }));
}

async function main() {
    const ids = await setupDatabase();
    const productId = (await database.get("SELECT id FROM products WHERE external_id='MAT-000001'")).id;
    const productionLegacyWorkbook = await createProductionLegacyWorkbook(ids);
    const productionLegacyRedGreenPreview = await preview(productionLegacyWorkbook, "catalog-production-legacy-red-green.xlsx");
    assert.strictEqual(productionLegacyRedGreenPreview.canImport, true, JSON.stringify(productionLegacyRedGreenPreview.errors));
    assert.strictEqual(productionLegacyRedGreenPreview.summary.structureCodeConflicts, 0);
    assert(productionLegacyRedGreenPreview.changes.categoryCodesPreserved.some(item =>
        item.name === "Люки" && item.structureId === ids.hatchesCategoryId && item.externalCode === "CAT-000022"
    ));
    assert(productionLegacyRedGreenPreview.changes.categoryCodesPreserved.some(item =>
        item.name === "Вентиляция" && item.structureId === ids.ventilationCategoryId && item.externalCode === "CAT-000019"
    ));

    const caseOnlyWorkbook = await createWorkbook({
        categoryName: "лакокрасочные",
        categoryCode: "CAT-000001",
        subcategoryName: "грунт / бетонконтакт",
        subcategoryCode: "SUB-000001",
        productTitle: "грунтовка тест",
        subcategories: createProductionLikeSubcategories(ids, "грунт / бетонконтакт", "грунтовка тест")
    });
    const caseOnly = await apply(caseOnlyWorkbook, "catalog-case-only-rename.xlsx");
    assert.strictEqual(caseOnly.preview.summary.structureCodeConflicts, 0);
    assert.strictEqual(caseOnly.preview.summary.newCategories, 0);
    assert.strictEqual(caseOnly.preview.summary.newSubcategories, 0);
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
    assert.strictEqual(
        (await database.get("SELECT COUNT(*) AS count FROM products WHERE category='лакокрасочные' AND deleted_at IS NULL")).count,
        ids.cascadeSubcategories.length + 1
    );
    await assertCascadeIdentities(ids, "лакокрасочные");

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
        productTitle: "Грунтовка универсальная",
        subcategories: createProductionLikeSubcategories(ids, "Грунты глубокого проникновения", "Грунтовка универсальная")
    });
    const substantial = await apply(substantialWorkbook, "catalog-substantial-rename.xlsx");
    assert.strictEqual(substantial.preview.summary.structureCodeConflicts, 0);
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
    assert.strictEqual(
        (await database.get("SELECT COUNT(*) AS count FROM products WHERE category='Краски и покрытия' AND deleted_at IS NULL")).count,
        ids.cascadeSubcategories.length + 1
    );
    await assertCascadeIdentities(ids, "Краски и покрытия");

    const stateBeforeCategoryLegacyMatch = await getMutableState();
    const categoryLegacyMatch = await preview(await createWorkbook({
        categoryName: "Инструменты",
        categoryCode: "CAT-000001",
        subcategoryName: "Подкатегория инструментов",
        subcategoryCode: "SUB-000999",
        productTitle: "Товар инструментов"
    }), "catalog-category-legacy-code.xlsx");
    assert.strictEqual(categoryLegacyMatch.canImport, true, JSON.stringify(categoryLegacyMatch.errors));
    assert.strictEqual(categoryLegacyMatch.summary.structureCodeConflicts, 0);
    assert(categoryLegacyMatch.warnings.some(item => item.code === "CATEGORY_EXCEL_CODE_IGNORED"));
    assert.deepStrictEqual(await getMutableState(), stateBeforeCategoryLegacyMatch);

    const stateBeforeSubcategoryLegacyMatch = await getMutableState();
    const subcategoryLegacyMatch = await preview(await createWorkbook({
        categoryName: "Краски и покрытия",
        categoryCode: "CAT-000001",
        subcategoryName: "Эмали",
        subcategoryCode: "SUB-000001",
        productTitle: "Грунтовка универсальная"
    }), "catalog-subcategory-legacy-code.xlsx");
    assert.strictEqual(subcategoryLegacyMatch.canImport, true, JSON.stringify(subcategoryLegacyMatch.errors));
    assert.strictEqual(subcategoryLegacyMatch.summary.structureCodeConflicts, 0);
    assert(subcategoryLegacyMatch.warnings.some(item => item.code === "SUBCATEGORY_EXCEL_CODE_IGNORED"));
    assert.deepStrictEqual(await getMutableState(), stateBeforeSubcategoryLegacyMatch);

    const stateBeforeParentMismatch = await getMutableState();
    const parentMismatch = await preview(await createWorkbook({
        categoryName: "Инструменты",
        categoryCode: "CAT-000002",
        subcategoryName: "Грунты глубокого проникновения",
        subcategoryCode: "SUB-000001",
        productTitle: "Товар с неверным parent"
    }), "catalog-subcategory-parent-mismatch.xlsx");
    assert.strictEqual(parentMismatch.canImport, false);
    assert(parentMismatch.changes.structureCodeConflicts.some(item => item.conflictType === "CODE_PARENT_MISMATCH"));
    assert.deepStrictEqual(await getMutableState(), stateBeforeParentMismatch);

    const finalRepeated = await preview(substantialWorkbook, "catalog-substantial-repeat.xlsx");
    assert.strictEqual(finalRepeated.canImport, true);
    assert.strictEqual(finalRepeated.summary.new, 0);
    assert.strictEqual(finalRepeated.summary.updated, 0);
    assert.strictEqual(finalRepeated.summary.newCategories, 0);
    assert.strictEqual(finalRepeated.summary.newSubcategories, 0);
    assert.strictEqual(finalRepeated.summary.renamedCategories, 0);
    assert.strictEqual(finalRepeated.summary.renamedSubcategories, 0);

    await database.run("UPDATE catalog_structure SET external_code='CAT-1' WHERE id=?", [ids.categoryId]);
    await database.run("UPDATE catalog_structure SET external_code='SUB-1' WHERE id=?", [ids.subcategoryId]);
    const legacyWorkbook = await createWorkbook({
        categoryName: "Краски и покрытия",
        categoryCode: "CAT-000001",
        subcategoryName: "Грунты глубокого проникновения",
        subcategoryCode: "SUB-000001",
        productTitle: "Грунтовка универсальная"
    });
    const legacy = await apply(legacyWorkbook, "catalog-legacy-code-normalization.xlsx");
    assert.strictEqual(legacy.preview.summary.structureCodeConflicts, 0);
    assert.strictEqual(legacy.preview.summary.newCategories, 0);
    assert.strictEqual(legacy.preview.summary.newSubcategories, 0);
    assert.strictEqual((await database.get("SELECT external_code FROM catalog_structure WHERE id=?", [ids.categoryId])).external_code, "CAT-1");
    assert.strictEqual((await database.get("SELECT external_code FROM catalog_structure WHERE id=?", [ids.subcategoryId])).external_code, "SUB-1");

    const rollbackWorkbook = await createWorkbook({
        categoryName: "Категория после rollback",
        categoryCode: "CAT-000001",
        subcategoryName: "Подкатегория после rollback",
        subcategoryCode: "SUB-000001",
        productTitle: "Товар после rollback"
    });
    const rollbackPreview = await preview(rollbackWorkbook, "catalog-rename-rollback.xlsx");
    assert.strictEqual(rollbackPreview.canImport, true, JSON.stringify(rollbackPreview.errors));
    const stateBeforeRollback = await getMutableState();
    await database.run(`CREATE TRIGGER fail_catalog_rename_product
        BEFORE UPDATE OF category ON products
        WHEN NEW.category = 'Категория после rollback'
        BEGIN SELECT RAISE(ABORT, 'forced rename rollback'); END`);
    await assert.rejects(() => applyCatalogImport(database, rollbackPreview.token, {}, user), /forced rename rollback/);
    await database.run("DROP TRIGGER fail_catalog_rename_product");
    cleanupFailedApplyArtifacts();
    assert.deepStrictEqual(await getMutableState(), stateBeforeRollback);

    const productionLegacyPreview = await preview(productionLegacyWorkbook, "catalog-production-legacy-codes.xlsx");
    assert.strictEqual(productionLegacyPreview.canImport, true, JSON.stringify(productionLegacyPreview.errors));
    assert.strictEqual(productionLegacyPreview.summary.structureCodeConflicts, 0);
    assert.strictEqual(productionLegacyPreview.changes.realStructureConflicts.length, 0);
    assert(productionLegacyPreview.warnings.filter(item => item.code === "CATEGORY_EXCEL_CODE_IGNORED").length >= 2);
    assert(productionLegacyPreview.warnings.some(item => item.code === "SUBCATEGORY_EXCEL_CODE_IGNORED"));
    assert(productionLegacyPreview.changes.categoryCodesPreserved.some(item =>
        item.name === "Люки" && item.structureId === ids.hatchesCategoryId && item.externalCode === "CAT-000022"
    ));
    assert(productionLegacyPreview.changes.categoryCodesPreserved.some(item =>
        item.name === "Вентиляция" && item.structureId === ids.ventilationCategoryId && item.externalCode === "CAT-000019"
    ));
    assert(productionLegacyPreview.changes.subcategoryCodesPreserved.some(item =>
        item.name === "Люки ревизионные"
        && item.structureId === ids.hatchesNameOwnerSubcategoryId
        && item.externalCode === "SUB-000202"
    ));
    const productionLegacyResult = await applyCatalogImport(database, productionLegacyPreview.token, {}, user);
    cleanupApplyArtifacts(productionLegacyResult);
    const productionCategories = await database.all(
        "SELECT id,name,external_code FROM catalog_structure WHERE external_code IN ('CAT-000019','CAT-000020','CAT-000022') ORDER BY external_code"
    );
    assert.deepStrictEqual(productionCategories, [
        { id: ids.ventilationCategoryId, name: "Вентиляция", external_code: "CAT-000019" },
        { id: ids.ceilingCategoryId, name: "Потолочные системы", external_code: "CAT-000020" },
        { id: ids.hatchesCategoryId, name: "Люки", external_code: "CAT-000022" }
    ]);
    const productionSubcategories = await database.all(
        "SELECT id,parent_id,name,external_code FROM catalog_structure WHERE external_code IN ('SUB-000201','SUB-000202') ORDER BY external_code"
    );
    assert.deepStrictEqual(productionSubcategories, [
        { id: ids.ventilationCodeOwnerSubcategoryId, parent_id: ids.ventilationCategoryId, name: "Воздуховоды", external_code: "SUB-000201" },
        { id: ids.hatchesNameOwnerSubcategoryId, parent_id: ids.hatchesCategoryId, name: "Люки ревизионные", external_code: "SUB-000202" }
    ]);
    assert.deepStrictEqual(
        await database.get("SELECT external_id,category,subcategory FROM products WHERE external_id='MAT-001000'"),
        { external_id: "MAT-001000", category: "Люки", subcategory: "Люки ревизионные" }
    );
    assert.strictEqual(
        (await database.get("SELECT COUNT(*) AS count FROM catalog_structure WHERE type='subcategory' AND parent_id=?", [ids.hatchesCategoryId])).count,
        PRODUCTION_CASCADE_SUBCATEGORY_COUNT
    );
    const productionRepeated = await preview(productionLegacyWorkbook, "catalog-production-legacy-repeat.xlsx");
    assert.strictEqual(productionRepeated.canImport, true, JSON.stringify(productionRepeated.errors));
    assert.strictEqual(productionRepeated.summary.structureCodeConflicts, 0);
    assert.strictEqual(productionRepeated.summary.new, 0);
    assert.strictEqual(productionRepeated.summary.updated, 0);
    assert.strictEqual(productionRepeated.summary.renamedCategories, 0);
    assert.strictEqual(productionRepeated.summary.renamedSubcategories, 0);

    const stableCodeRenameWorkbook = await createWorkbook({
        categoryName: "Вентиляционные материалы",
        categoryCode: "CAT-000019",
        subcategoryName: "Вентиляционные решётки",
        subcategoryCode: "SUB-000203",
        productTitle: "Вентиляционная решётка",
        subcategories: [{
            name: "Вентиляционные решётки",
            code: "SUB-000203",
            productTitle: "Вентиляционная решётка",
            productCode: "MAT-002000"
        }]
    });
    const stableCodeRename = await apply(stableCodeRenameWorkbook, "catalog-stable-code-rename.xlsx");
    assert.strictEqual(stableCodeRename.preview.summary.structureCodeConflicts, 0);
    assert(stableCodeRename.preview.changes.renamedCategories.some(item =>
        item.structureId === ids.ventilationCategoryId
        && item.currentName === "Вентиляция"
        && item.incomingName === "Вентиляционные материалы"
    ));
    assert.deepStrictEqual(
        await database.get("SELECT id,name,external_code FROM catalog_structure WHERE id=?", [ids.ventilationCategoryId]),
        { id: ids.ventilationCategoryId, name: "Вентиляционные материалы", external_code: "CAT-000019" }
    );
    assert.strictEqual(
        (await database.get("SELECT category FROM products WHERE external_id='MAT-002000'")).category,
        "Вентиляционные материалы"
    );

    console.log(JSON.stringify({
        success: true,
        scenarios: {
            caseOnlyCategoryRename: "ok",
            caseOnlySubcategoryRename: "ok",
            substantialCategoryRenameByCode: "ok",
            substantialSubcategoryRenameByCode: "ok",
            legacyCodeNameCollision: "matched_by_name_with_warning",
            subcategoryParentMismatch: "blocked",
            productionLikeSubcategories: ids.cascadeSubcategories.length,
            productionLikeCascadeConflicts: caseOnly.preview.summary.structureCodeConflicts,
            productionLegacyCategories: {
                "CAT-000019 -> Люки": { structureId: ids.hatchesCategoryId, externalCode: "CAT-000022" },
                "CAT-000020 -> Вентиляция": { structureId: ids.ventilationCategoryId, externalCode: "CAT-000019" }
            },
            productionLegacyCascadeSubcategories: ids.productionCascadeSubcategories.length,
            productionLegacyCascadeConflicts: productionLegacyPreview.summary.structureCodeConflicts,
            stableCodeRename: { structureId: ids.ventilationCategoryId, externalCode: "CAT-000019", name: "Вентиляционные материалы" },
            productSynchronization: "ok",
            productRenameByMat: "ok",
            legacyCodeNormalization: "ok",
            rollbackAfterRename: "ok",
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
