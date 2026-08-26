const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { CURRENT_SCHEMA_VERSION, PRODUCT_PAGE_TABLES, REQUIRED_INDEXES, audit, migrateDatabase, openDatabase } = require("../databaseMigrations");
const { getProductPageDataByExternalId } = require("../services/productPageData");
const { backfillPrimaryProductImages } = require("../services/productPageSchema");

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
    assert.strictEqual(CURRENT_SCHEMA_VERSION, 9);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-product-page-foundation-"));
    try {
        const file = path.join(root, "v8.db");
        await createV8Fixture(file);
        const migration = await migrateDatabase(file, { dryRun: false });
        assert.deepStrictEqual({ from: migration.fromVersion, to: migration.toVersion, changed: migration.changed }, { from: 8, to: 9, changed: true });

        const db = await openDatabase(file);
        try {
            const columns = new Set((await db.all("PRAGMA table_info(products)")).map(row => row.name));
            for (const name of ["brand", "short_description", "full_description", "seo_title", "seo_description"]) assert(columns.has(name));
            assert(!columns.has("public_slug"));
            for (const table of PRODUCT_PAGE_TABLES) assert(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [table]));
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
                (structure_id,attribute_definition_id,sort_order,is_required) VALUES(2,?,4,1)`, [definition.id]);
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
            assert.strictEqual(page.product.brand, "Foundation Brand");
            assert.strictEqual(page.product.full_description, "Full");
            assert.deepStrictEqual(page.attributes[0], {
                id: 1, code: "layer_thickness", label: "Толщина слоя", type: "number",
                value: 25, unit: "мм", section: "Применение", sortOrder: 5
            });
            assert.strictEqual(page.images.length, 2);
            assert.strictEqual(page.images[0].is_primary, 1);
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

        const rollbackFile = path.join(root, "rollback.db");
        await createV8Fixture(rollbackFile);
        await assert.rejects(migrateDatabase(rollbackFile, { dryRun: false, injectFailure: true }), /Injected migration failure/);
        const rollbackDb = await openDatabase(rollbackFile);
        try {
            assert.strictEqual(Number((await rollbackDb.get("PRAGMA user_version")).user_version), 8);
            assert.strictEqual(await rollbackDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='product_images'"), undefined);
            const columns = new Set((await rollbackDb.all("PRAGMA table_info(products)")).map(row => row.name));
            assert(!columns.has("brand"));
            assert.strictEqual((await rollbackDb.get("SELECT image_url FROM products WHERE id=1")).image_url, "/uploads/products/MAT-FOUNDATION.webp");
        } finally { await rollbackDb.close(); }

        console.log(JSON.stringify({ success: true, migration: "8->9", backfill: "ok", retry: "ok", constraints: "ok", cascade: "ok", rollback: "ok", repository: "ok" }));
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
