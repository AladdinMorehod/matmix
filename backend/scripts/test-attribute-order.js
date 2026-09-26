const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const sqlite3 = require("sqlite3");
const { resolve, MAIN_ATTRIBUTES } = require("../services/productAttributeOrder");
const { getProductPageDataByExternalId } = require("../services/productPageData");
const { productPage, seoConfig } = require("../services/seo");
const { ensureProductPageSchema } = require("../services/productPageSchema");

async function main() {
    const connection = new sqlite3.Database(":memory:");
    const db = {
        run: (sql, params = []) => new Promise((resolve, reject) => connection.run(sql, params, function (error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })),
        all: (sql, params = []) => new Promise((resolve, reject) => connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))),
        get: (sql, params = []) => new Promise((resolve, reject) => connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row)))
    };
    db.ensureColumn = async (table, column, type) => db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    db.withTransaction = async operation => { await db.run("BEGIN"); try { const result = await operation(db); await db.run("COMMIT"); return result; } catch (error) { await db.run("ROLLBACK"); throw error; } };
    // Inject the in-memory fixture before loading content; never open the workspace database.
    const databasePath = require.resolve("../database");
    require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: db };
    const { getProductContent, updateProductContent, replaceTemplates } = require("../services/productContent");
    try {
        await db.run(`CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,slug TEXT,category TEXT,subcategory TEXT,
            product_group TEXT,price REAL,weight REAL,unit TEXT,image TEXT,image_url TEXT,description TEXT,stock_status TEXT,is_active INTEGER,
            sort_order INTEGER,created_at TEXT,updated_at TEXT,deleted_at TEXT)`);
        await db.run("CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY,parent_id INTEGER,type TEXT,name TEXT,is_active INTEGER)");
        await ensureProductPageSchema(db);
        await db.run("INSERT INTO catalog_structure VALUES(1,NULL,'category','Category',1),(2,1,'subcategory','Subcategory',1)");
        for (const id of [1, 2]) await db.run("INSERT INTO products(id,external_id,title,category,subcategory,is_active,brand,seo_title,price) VALUES(?,?,'Test','Category','Subcategory',1,'Test Brand A','Keep SEO',100)", [id, `MAT-TEST-${id}`]);
        const codes = [...MAIN_ATTRIBUTES.map(item => item.code), "alpha", "beta", "gamma"];
        for (const [index, code] of codes.entries()) await db.run("INSERT INTO product_attribute_definitions(id,code,label,data_type,sort_order) VALUES(?,?,?,'text',?)", [index + 1, code, MAIN_ATTRIBUTES.find(item => item.code === code)?.label || code, index === 4 ? 90 : index === 5 ? 20 : 10]);
        await replaceTemplates(2, [
            ...[1, 2, 3, 4].map((definitionId, sortOrder) => ({ definitionId, section: "main", sortOrder })),
            { definitionId: 5, section: "regular", sortOrder: 2 },
            { definitionId: 6, section: "regular", sortOrder: 1 },
            { definitionId: 7, section: "regular", sortOrder: 0 }
        ], db);
        for (const productId of [1, 2]) for (const [id, value, order] of [[1, "Legacy brand attribute value", 999], [2, "Old product type", 300], [3, "12 months", 400], [4, "25 kg", 500], [5, "A", 999], [6, "B", -90], [7, "C", -100]]) {
            await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,sort_order,created_at) VALUES(?,?,?,?, 'original')", [productId, id, value, order]);
        }
        assert.deepStrictEqual(MAIN_ATTRIBUTES.map(item => item.code), ["brand", "product_type", "shelf_life", "package_weight"]);
        assert(Object.isFrozen(MAIN_ATTRIBUTES));
        let content = await getProductContent(1, db);
        assert.deepStrictEqual(content.values.map(item => item.code), [...codes.slice(0, 4), "gamma", "beta", "alpha"]);
        assert.strictEqual(content.values[0].value, "Test Brand A");
        assert.strictEqual(content.values[1].value, "Old product type");
        assert.strictEqual(content.values[2].value, "12 months");
        assert.strictEqual(content.values[3].value, "25 kg");
        const page = await getProductPageDataByExternalId("MAT-TEST-1", db);
        assert.deepStrictEqual(page.attributes.map(item => item.code), content.values.filter(item => item.value !== "").map(item => item.code));
        assert(page.attributes.some(item => item.code === "package_weight"));
        const html = productPage(seoConfig({}), page).html;
        assert(html.includes("Основные характеристики"));
        assert(!html.includes("Legacy brand attribute value"));
        assert(html.indexOf("<dt>Бренд</dt>") < html.indexOf("<dt>Срок хранения</dt>"));
        const empty = resolve({ brand: "", includeEmptyMain: false });
        assert.strictEqual(empty.length, 0);
        assert(!productPage(seoConfig({}), { ...page, product: { ...page.product, brand: "" }, attributes: empty }).html.includes("Основные характеристики"));

        const original = await db.all("SELECT * FROM product_attribute_values ORDER BY id");
        const originalTemplate = await db.get("SELECT * FROM product_attribute_templates WHERE structure_id=2 AND attribute_definition_id=5");
        const otherProduct = await db.get("SELECT * FROM products WHERE id=2");
        await updateProductContent(1, { attributes: [{ definitionId: 5, value: "A", sortOrder: -999 }] }, db);
        assert.deepStrictEqual(await db.all("SELECT * FROM product_attribute_values ORDER BY id"), original);
        await updateProductContent(1, { attributes: [{ definitionId: 5, value: "Changed" }] }, db);
        const updated = await db.get("SELECT * FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=5");
        assert.strictEqual(updated.id, original.find(row => row.product_id === 1 && row.attribute_definition_id === 5).id);
        assert.strictEqual(updated.created_at, "original");
        assert.strictEqual(updated.sort_order, 999);
        const beforeMainEdit = await db.all("SELECT * FROM product_attribute_values WHERE product_id=1 ORDER BY id");
        await updateProductContent(1, { brand: "Test Brand B", attributes: [{ definitionId: 1, value: "Conflicting legacy value" }] }, db);
        let reloadedContent = await getProductContent(1, db);
        assert.strictEqual((await db.get("SELECT brand FROM products WHERE id=1")).brand, "Test Brand B");
        assert.strictEqual(reloadedContent.product.brand, "Test Brand B");
        assert.strictEqual(reloadedContent.values[0].value, "Test Brand B");
        assert.strictEqual((await getProductPageDataByExternalId("MAT-TEST-1", db)).attributes[0].value, "Test Brand B");
        assert.strictEqual((await db.get("SELECT value_text FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=1")).value_text, "Legacy brand attribute value");

        for (const [definitionId, value] of [[2, "Product Type B"], [3, "18 months"], [4, "30 kg"]]) {
            await updateProductContent(1, { attributes: [{ definitionId, value }] }, db);
            reloadedContent = await getProductContent(1, db);
            assert.strictEqual(reloadedContent.values.find(item => item.definitionId === definitionId).value, value);
            assert.strictEqual((await db.get("SELECT id FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=?", [definitionId])).id,
                beforeMainEdit.find(row => row.attribute_definition_id === definitionId).id);
        }
        for (const row of beforeMainEdit.filter(row => [1, 5, 6, 7].includes(row.attribute_definition_id))) {
            assert.deepStrictEqual(await db.get("SELECT * FROM product_attribute_values WHERE id=?", [row.id]), row);
        }
        await updateProductContent(1, { attributes: [{ definitionId: 3, value: null }] }, db);
        reloadedContent = await getProductContent(1, db);
        assert(!(await db.get("SELECT id FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=3")));
        assert.strictEqual(reloadedContent.values.filter(item => item.isMain).length, 4);
        assert.strictEqual(reloadedContent.values.find(item => item.code === "shelf_life").value, "");
        const clearedPage = await getProductPageDataByExternalId("MAT-TEST-1", db);
        assert(!clearedPage.attributes.some(item => item.code === "shelf_life"));
        assert.deepStrictEqual(clearedPage.attributes.filter(item => item.isMain).map(item => item.code), ["brand", "product_type", "package_weight"]);
        const clearedHtml = productPage(seoConfig({}), clearedPage).html;
        assert(!clearedHtml.includes("<dt>Срок хранения</dt>"));
        assert(clearedHtml.includes("<h3>Основные характеристики</h3>"));
        await updateProductContent(1, { removedDefinitionIds: [6] }, db);
        assert(!(await db.get("SELECT id FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=6")));
        await updateProductContent(1, { attributes: [{ definitionId: 6, value: "Returned", sortOrder: -999 }] }, db);
        assert.deepStrictEqual((await getProductContent(1, db)).values.slice(4).map(item => item.code), ["gamma", "beta", "alpha"]);
        assert.deepStrictEqual(await db.all("SELECT * FROM product_attribute_values WHERE product_id=2 ORDER BY id"), original.filter(row => row.product_id === 2));
        assert.deepStrictEqual(await db.get("SELECT * FROM products WHERE id=2"), otherProduct);
        assert.strictEqual((await db.get("SELECT seo_title FROM products WHERE id=1")).seo_title, "Keep SEO");
        await updateProductContent(1, { removedDefinitionIds: [2] }, db);
        assert(!(await db.get("SELECT id FROM product_attribute_values WHERE product_id=1 AND attribute_definition_id=2")));
        assert.strictEqual((await db.get("SELECT section FROM product_attribute_templates WHERE structure_id=2 AND attribute_definition_id=2")).section, "main");
        await replaceTemplates(2, [{ definitionId: 5, sortOrder: 2 }, { definitionId: 6, sortOrder: 1 }], db);
        const updatedTemplate = await db.get("SELECT * FROM product_attribute_templates WHERE structure_id=2 AND attribute_definition_id=5");
        assert.strictEqual(updatedTemplate.id, originalTemplate.id);
        assert.strictEqual(updatedTemplate.sort_order, 2);
        assert.deepStrictEqual((await getProductContent(2, db)).values.slice(4).map(item => item.code), ["beta", "alpha", "gamma"]);
        assert.deepStrictEqual(await db.all("SELECT * FROM product_attribute_values WHERE product_id=2 ORDER BY id"), original.filter(row => row.product_id === 2));
        await updateProductContent(1, { brand: "", attributes: [{ definitionId: 2, value: null }, { definitionId: 4, value: null }] }, db);
        const allMainCleared = await getProductContent(1, db);
        assert.strictEqual(allMainCleared.values.filter(item => item.isMain).length, 4);
        assert(allMainCleared.values.filter(item => item.isMain).every(item => item.value === ""));
        const noMainPage = await getProductPageDataByExternalId("MAT-TEST-1", db);
        assert(!noMainPage.attributes.some(item => item.isMain));
        assert(!productPage(seoConfig({}), noMainPage).html.includes("<h3>Основные характеристики</h3>"));
        const context = vm.createContext({ MatMixAttributeOrder: require("../../public/js/attribute-order"), escapeHtml: value => String(value ?? "") });
        vm.runInContext(fs.readFileSync(require.resolve("../../public/js/crm/products.js"), "utf8"), context);
        context.fixture = { definitions: codes.map((code, index) => ({ id: index + 1, code, label: code, dataType: "text", sortOrder: index === 4 ? 90 : index === 5 ? 20 : 10, isActive: true })), content: reloadedContent };
        vm.runInContext("productContentEditor = fixture", context);
        assert.deepStrictEqual(Array.from(vm.runInContext("getEditorAttributeRows().map(row => row.code)", context)), reloadedContent.values.map(row => row.code));
        const markup = vm.runInContext("renderProductAttributes()", context);
        assert(markup.includes('data-add-attribute="main"'));
        assert(markup.includes('data-add-attribute="regular"'));
        assert(markup.includes('data-manage-definitions="main"'));
        assert(markup.includes('data-manage-definitions="regular"'));
        assert(markup.includes('data-remove-attribute="1"'));
        assert.strictEqual((markup.match(/name="brand"/g) || []).length, 1);
        console.log("PASS section-aware template ordering and public grouping, main/regular controls, Test Brand A → B, explicit main value removal preserves membership, row IDs and product isolation (in-memory SQLite)");
    } finally { await new Promise(resolve => connection.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
