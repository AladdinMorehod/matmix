const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { CURRENT_SCHEMA_VERSION, PRODUCT_PAGE_TABLES, REQUIRED_INDEXES, audit, migrateDatabase, openDatabase } = require("../databaseMigrations");
const { getProductPageDataByExternalId } = require("../services/productPageData");
const { backfillPrimaryProductImages } = require("../services/productPageSchema");
const { productPage, seoConfig } = require("../services/seo");

async function createV8Fixture(file, { imageUrl = "/uploads/products/MAT-FOUNDATION.webp" } = {}) {
    const db = await openDatabase(file);
    const now = "2026-08-26T00:00:00.000Z";
    try {
        await db.run("CREATE TABLE clients(id INTEGER PRIMARY KEY, phone TEXT)");
        await db.run(`CREATE TABLE orders(id INTEGER PRIMARY KEY, client_id INTEGER, order_number TEXT,
            request_type TEXT NOT NULL DEFAULT 'order', FOREIGN KEY(client_id) REFERENCES clients(id))`);
        await db.run("CREATE TABLE order_events(id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id))");
        await db.run(`CREATE TABLE products(
            id INTEGER PRIMARY KEY AUTOINCREMENT, external_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
            slug TEXT, category TEXT, subcategory TEXT, product_group TEXT, price REAL, weight REAL,
            unit TEXT, image TEXT, image_url TEXT, description TEXT, is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0, source TEXT, last_imported_at TEXT, created_at TEXT,
            updated_at TEXT, deleted_at TEXT, deleted_by_id INTEGER, deleted_by_name TEXT)`);
        await db.run(`CREATE TABLE catalog_structure(
            id INTEGER PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, normalized_name TEXT NOT NULL,
            external_code TEXT, parent_id INTEGER REFERENCES catalog_structure(id), sort_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1, is_system INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT)`);
        await db.run("CREATE TABLE order_attachments(id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id))");
        await db.run("CREATE TABLE order_email_outbox(id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id))");
        await db.run("CREATE TABLE web_push_subscriptions(id INTEGER PRIMARY KEY)");
        await db.run("CREATE TABLE web_push_outbox(id INTEGER PRIMARY KEY, order_id INTEGER REFERENCES orders(id), subscription_id INTEGER REFERENCES web_push_subscriptions(id))");
        await db.run("INSERT INTO catalog_structure(id,type,name,normalized_name,external_code,created_at,updated_at) VALUES(1,'category','Материалы','материалы','CAT-001',?,?)", [now, now]);
        await db.run("INSERT INTO catalog_structure(id,type,name,normalized_name,external_code,parent_id,created_at,updated_at) VALUES(2,'subcategory','Штукатурки','штукатурки','SUB-001',1,?,?)", [now, now]);
        await db.run(`INSERT INTO products(external_id,title,category,subcategory,product_group,price,weight,unit,image_url,description,is_active,sort_order,created_at,updated_at)
            VALUES('MAT-FOUNDATION','Штукатурка тестовая','Материалы','Штукатурки','Гипсовые',750,30,'шт',?,'Legacy description',1,7,?,?)`, [imageUrl, now, now]);
        await db.run("PRAGMA user_version=8");
    } finally { await db.close(); }
}

async function rejectsConstraint(work) {
    await assert.rejects(work, error => String(error?.code || "").startsWith("SQLITE_CONSTRAINT"));
}

async function main() {
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 11);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-product-page-foundation-"));
    try {
        const file = path.join(root, "v8.db");
        await createV8Fixture(file);
        const migration = await migrateDatabase(file, { dryRun: false });
        assert.deepStrictEqual({ from: migration.fromVersion, to: migration.toVersion, changed: migration.changed }, { from: 8, to: 11, changed: true });

        const db = await openDatabase(file);
        try {
            const columns = new Set((await db.all("PRAGMA table_info(products)")).map(row => row.name));
            for (const name of ["brand", "short_description", "full_description", "seo_title", "seo_description"]) assert(columns.has(name));
            assert.strictEqual((await db.get("SELECT stock_status FROM products WHERE id=1")).stock_status, "unknown");
            assert(!columns.has("public_slug"));
            for (const table of PRODUCT_PAGE_TABLES) assert(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [table]));
            const templateColumns = new Set((await db.all("PRAGMA table_info(product_attribute_templates)")).map(row => row.name));
            assert(templateColumns.has("section"));
            const indexes = new Set((await db.all("SELECT name FROM sqlite_master WHERE type='index'")).map(row => row.name));
            for (const name of REQUIRED_INDEXES.filter(name => name.includes("product_attribute") || name.includes("product_images"))) assert(indexes.has(name));
            assert.strictEqual((await db.get("SELECT COUNT(*) count FROM products")).count, 1);
            assert.deepStrictEqual(await db.get("SELECT product_id,image_url,is_primary,sort_order FROM product_images"), {
                product_id: 1, image_url: "/uploads/products/MAT-FOUNDATION.webp", is_primary: 1, sort_order: 0
            });
            await backfillPrimaryProductImages(db);
            await backfillPrimaryProductImages(db);
            assert.strictEqual((await db.get("SELECT COUNT(*) count FROM product_images WHERE product_id=1")).count, 1);

            await db.run(`UPDATE products SET brand='Foundation Brand', short_description='Short',
                full_description='Full', seo_title='SEO title', seo_description='SEO description' WHERE id=1`);
            const definition = await db.run(`INSERT INTO product_attribute_definitions
                (code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at)
                VALUES('layer_thickness','Толщина слоя','number','мм','Применение',3,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
            await db.run(`INSERT INTO product_attribute_templates
                (structure_id,attribute_definition_id,section,sort_order,is_required) VALUES(2,?,'main',4,1)`, [definition.id]);
            await db.run(`INSERT INTO product_attribute_values
                (product_id,attribute_definition_id,value_number,unit_override,sort_order) VALUES(1,?,25,'мм',5)`, [definition.id]);
            await db.run("INSERT INTO product_images(product_id,image_url,alt_text,sort_order,is_primary) VALUES(1,'/uploads/products/second.webp','Второе изображение',2,0)");

            await rejectsConstraint(() => db.run("INSERT INTO product_attribute_definitions(code,label,data_type) VALUES('layer_thickness','Дубль','number')"));
            await rejectsConstraint(() => db.run("INSERT INTO product_attribute_definitions(code,label,data_type) VALUES('Bad-Code','Плохой код','text')"));
            await rejectsConstraint(() => db.run("INSERT INTO product_attribute_templates(structure_id,attribute_definition_id) VALUES(2,?)", [definition.id]));
            await rejectsConstraint(() => db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_number) VALUES(1,?,10)", [definition.id]));
            await rejectsConstraint(() => db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number) VALUES(1,999,'x',1)"));
            await rejectsConstraint(() => db.run("INSERT INTO product_images(product_id,image_url,is_primary) VALUES(1,'/uploads/products/duplicate-primary.webp',1)"));
            await rejectsConstraint(() => db.run("INSERT INTO product_images(product_id,image_url) VALUES(999,'/uploads/products/orphan.webp')"));

            const page = await getProductPageDataByExternalId("mat-foundation", db);
            assert(page);
            const schemaFrom = status => [...productPage(seoConfig({ SEO_ALLOW_INDEXING: "false" }), {
                product: { ...page.product, price: 750, stock_status: status }, attributes: page.attributes, images: page.images
            }).html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(item => JSON.parse(item[1])).find(item => item["@type"] === "Product");
            assert.strictEqual(schemaFrom("unknown").offers.availability, undefined);
            assert.strictEqual(schemaFrom("in_stock").offers.availability, "https://schema.org/InStock");
            assert.strictEqual(schemaFrom("out_of_stock").offers.availability, "https://schema.org/OutOfStock");
            assert.strictEqual(schemaFrom("invalid").offers.availability, undefined);
            assert.strictEqual(page.product.brand, "Foundation Brand");
            assert.strictEqual(page.product.full_description, "Full");
            assert.deepStrictEqual(Object.fromEntries(Object.entries(page.attributes.find(item => item.code === "layer_thickness")).filter(([key]) => ["id", "code", "label", "type", "value", "unit", "section", "sortOrder"].includes(key))), {
                id: 1, code: "layer_thickness", label: "Толщина слоя", type: "number",
                value: 25, unit: "мм", section: "Основные характеристики", sortOrder: 4
            });
            assert.strictEqual(page.images.length, 2);
            assert.strictEqual(page.images[0].is_primary, 1);
            const renderedHtml = productPage(seoConfig({ SEO_ALLOW_INDEXING: "false" }), {
                product: { ...page.product, price: 750 }, attributes: page.attributes, images: page.images
            }).html;
            assert(renderedHtml.includes("<h3>Основные характеристики</h3>"));
            assert(!renderedHtml.includes("<h3>Характеристики</h3>"));
            assert(renderedHtml.includes("Foundation Brand · Артикул MAT-FOUNDATION"));
            assert(!renderedHtml.includes("MAT-код:"));
            assert(!renderedHtml.includes("Бренд:"));
            assert(renderedHtml.includes("Срок и стоимость доставки рассчитаем при оформлении"));
            for (const text of ["Доставка по Москве и МО", "Сегодня / Завтра / Срочно", "Удобный поиск", "По всему каталогу", "Заказ по списку", "Загрузите список — соберём заказ"]) assert(renderedHtml.includes(text));
            const noBrandHtml = productPage(seoConfig({ SEO_ALLOW_INDEXING: "false" }), {
                product: { ...page.product, brand: "", price: 750 }, attributes: page.attributes, images: page.images
            }).html;
            assert(noBrandHtml.includes("Артикул MAT-FOUNDATION"));
            assert(!noBrandHtml.includes("undefined"));
            const findings = await audit(db);
            assert.deepStrictEqual(findings.missingProductPageTables, []);
            for (const key of ["attributeValuesWithoutProduct", "attributeValuesWithoutDefinition", "attributeTemplatesWithoutStructure", "attributeTemplatesWithoutDefinition", "productImagesWithoutProduct", "productsWithMultiplePrimaryImages"]) assert.strictEqual(findings[key], 0);
            assert.strictEqual(await getProductPageDataByExternalId("UNKNOWN", db), null);
            await db.run("UPDATE products SET is_active=0 WHERE id=1");
            assert.strictEqual(await getProductPageDataByExternalId("MAT-FOUNDATION", db), null);
            await db.run("UPDATE products SET is_active=1, deleted_at='2026-08-26' WHERE id=1");
            assert.strictEqual(await getProductPageDataByExternalId("MAT-FOUNDATION", db), null);
            await db.run("UPDATE products SET deleted_at=NULL WHERE id=1");

            await db.run("DELETE FROM products WHERE id=1");
            assert.strictEqual((await db.get("SELECT COUNT(*) count FROM product_attribute_values")).count, 0);
            assert.strictEqual((await db.get("SELECT COUNT(*) count FROM product_images")).count, 0);
            assert.deepStrictEqual(await db.all("PRAGMA foreign_key_check"), []);
        } finally { await db.close(); }

        const repeated = await migrateDatabase(file, { dryRun: false });
        assert.strictEqual(repeated.changed, false);

        const legacyTemplateFile = path.join(root, "v10-templates.db");
        await createV8Fixture(legacyTemplateFile);
        const legacyTemplateDb = await openDatabase(legacyTemplateFile);
        try {
            const { ensureProductPageSchema } = require("../services/productPageSchema");
            await ensureProductPageSchema({ run: legacyTemplateDb.run, ensureColumn: (table, column, type) => legacyTemplateDb.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`) });
            await legacyTemplateDb.run("DROP TABLE product_attribute_templates");
            await legacyTemplateDb.run(`CREATE TABLE product_attribute_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT, structure_id INTEGER NOT NULL, attribute_definition_id INTEGER NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0, is_required INTEGER NOT NULL DEFAULT 0, unit_override TEXT,
                created_at TEXT, updated_at TEXT, UNIQUE(structure_id,attribute_definition_id),
                FOREIGN KEY(structure_id) REFERENCES catalog_structure(id) ON DELETE CASCADE,
                FOREIGN KEY(attribute_definition_id) REFERENCES product_attribute_definitions(id))`);
            await legacyTemplateDb.run("CREATE INDEX idx_product_attribute_templates_structure_order ON product_attribute_templates(structure_id,sort_order)");
            const mainDefinition = await legacyTemplateDb.run(`INSERT INTO product_attribute_definitions(code,label,data_type,sort_order,is_active)
                VALUES('product_type','Тип продукта','text',1,1)`);
            const regularDefinition = await legacyTemplateDb.run(`INSERT INTO product_attribute_definitions(code,label,data_type,sort_order,is_active)
                VALUES('base','Основа','text',2,1)`);
            await legacyTemplateDb.run("INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,sort_order) VALUES(2,?,0),(2,?,1)", [mainDefinition.id, regularDefinition.id]);
            await legacyTemplateDb.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text) VALUES(1,?,'Гипсовая')", [mainDefinition.id]);
            await legacyTemplateDb.run("PRAGMA user_version=10");
        } finally { await legacyTemplateDb.close(); }
        const beforeLegacyMigration = await openDatabase(legacyTemplateFile);
        const beforeProducts = await beforeLegacyMigration.all("SELECT * FROM products ORDER BY id");
        const beforeValues = await beforeLegacyMigration.all("SELECT * FROM product_attribute_values ORDER BY id");
        await beforeLegacyMigration.close();
        const v11Migration = await migrateDatabase(legacyTemplateFile, { dryRun: false });
        assert.deepStrictEqual({ from: v11Migration.fromVersion, to: v11Migration.toVersion }, { from: 10, to: 11 });
        const afterLegacyMigration = await openDatabase(legacyTemplateFile);
        try {
            assert.deepStrictEqual(await afterLegacyMigration.all(`SELECT d.code,t.section FROM product_attribute_templates t
                JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id ORDER BY t.id`), [
                { code: "product_type", section: "main" }, { code: "base", section: "regular" }
            ]);
            assert.deepStrictEqual(await afterLegacyMigration.all("SELECT * FROM products ORDER BY id"), beforeProducts);
            assert.deepStrictEqual(await afterLegacyMigration.all("SELECT * FROM product_attribute_values ORDER BY id"), beforeValues);
            await assert.rejects(afterLegacyMigration.run("UPDATE product_attribute_templates SET section='invalid'"), /CHECK constraint failed/);
        } finally { await afterLegacyMigration.close(); }
        assert.strictEqual((await migrateDatabase(legacyTemplateFile, { dryRun: false })).changed, false);

        const rollbackFile = path.join(root, "rollback.db");
        await createV8Fixture(rollbackFile);
        await assert.rejects(migrateDatabase(rollbackFile, { dryRun: false, injectFailure: true }), /Injected migration failure/);
        const rollbackDb = await openDatabase(rollbackFile);
        try {
            assert.strictEqual(Number((await rollbackDb.get("PRAGMA user_version")).user_version), 8);
            assert.strictEqual(await rollbackDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='product_images'"), undefined);
            const columns = new Set((await rollbackDb.all("PRAGMA table_info(products)")).map(row => row.name));
            assert(!columns.has("brand"));
            assert(!columns.has("stock_status"));
            assert.strictEqual((await rollbackDb.get("SELECT image_url FROM products WHERE id=1")).image_url, "/uploads/products/MAT-FOUNDATION.webp");
        } finally { await rollbackDb.close(); }

        console.log(JSON.stringify({ success: true, migration: "8->11", backfill: "ok", retry: "ok", constraints: "ok", cascade: "ok", rollback: "ok", repository: "ok" }));
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
