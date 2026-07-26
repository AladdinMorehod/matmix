const assert = require("assert");
const sqlite3 = require("sqlite3").verbose();
const {
    SUBCATEGORY_MOVE_BATCH_LIMIT,
    getSubcategoryMoveContext,
    previewSubcategoryMove,
    moveSubcategories
} = require("../services/catalogSubcategoryMove");

function database() {
    const raw = new sqlite3.Database(":memory:");
    return {
        raw,
        run(sql, params = []) {
            return new Promise((resolve, reject) => raw.run(sql, params, function done(error) {
                if (error) reject(error);
                else resolve({ id: this.lastID, changes: this.changes });
            }));
        },
        all(sql, params = []) {
            return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
        },
        close() {
            return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve()));
        }
    };
}

async function expectCode(callback, code) {
    await assert.rejects(callback, error => error.code === code);
}

async function fixture() {
    const db = database();
    await db.run(`CREATE TABLE catalog_structure (
        id INTEGER PRIMARY KEY, type TEXT, name TEXT, normalized_name TEXT, external_code TEXT,
        parent_id INTEGER, sort_order INTEGER, is_active INTEGER, is_system INTEGER, updated_at TEXT
    )`);
    await db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY, title TEXT, category TEXT, subcategory TEXT, product_group TEXT,
        is_active INTEGER, deleted_at TEXT, updated_at TEXT
    )`);
    const nodes = [
        [1, "category", "Старая Категория", "старая категория", "C1", null, 10, 1, 0, "a"],
        [2, "category", "Новая Категория", "новая категория", "C2", null, 20, 1, 0, "a"],
        [3, "subcategory", "Ёлки - Палки", "елки-палки", "S1", 1, 10, 1, 0, "a"],
        [4, "subcategory", "Остаток", "остаток", "S2", 1, 20, 1, 0, "a"],
        [5, "subcategory", "Целевая", "целевая", "S3", 2, 10, 1, 0, "a"],
        [6, "subcategory", "Скрытая", "скрытая", "S4", 1, 30, 0, 0, "a"],
        [7, "subcategory", "Системная", "системная", "S5", 1, 40, 1, 1, "a"],
        [8, "subcategory", "Сирота", "сирота", "S6", 99, 10, 1, 0, "a"]
    ];
    for (const row of nodes) {
        await db.run("INSERT INTO catalog_structure VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", row);
    }
    const products = [
        [1, "Exact", "Старая Категория", "Ёлки - Палки", "G1", 1, null, "a"],
        [2, "Normalized hidden", "  старая   категория ", "елки–палки", "G2", 0, null, "a"],
        [3, "Deleted", "Старая Категория", "Ёлки - Палки", "G3", 1, "x", "a"],
        [4, "Wrong", "Новая Категория", "Ёлки - Палки", "G4", 1, null, "a"]
    ];
    for (const row of products) await db.run("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)", row);
    return db;
}

async function main() {
    const db = await fixture();
    try {
        const context = await getSubcategoryMoveContext(db);
        assert.deepStrictEqual(context.categories.map(item => item.id), [1, 2]);
        assert.deepStrictEqual(context.subcategories.map(item => item.id), [3, 4, 5]);
        assert.strictEqual(context.subcategories.find(item => item.id === 3).productCount, 2);
        assert(context.version);

        await expectCode(() => previewSubcategoryMove(db, {}), "SUBCATEGORY_IDS_REQUIRED");
        await expectCode(() => previewSubcategoryMove(db, { subcategoryIds: [], targetCategoryId: 2, expectedVersion: context.version }), "SUBCATEGORY_IDS_EMPTY");
        await expectCode(() => previewSubcategoryMove(db, { subcategoryIds: [3, 3], targetCategoryId: 2, expectedVersion: context.version }), "DUPLICATE_SUBCATEGORY_IDS");
        await expectCode(() => previewSubcategoryMove(db, {
            subcategoryIds: Array.from({ length: SUBCATEGORY_MOVE_BATCH_LIMIT + 1 }, (_, index) => index + 1),
            targetCategoryId: 2,
            expectedVersion: context.version
        }), "SUBCATEGORY_MOVE_BATCH_LIMIT_EXCEEDED");
        await expectCode(() => previewSubcategoryMove(db, { subcategoryIds: [3], targetCategoryId: 2 }), "STRUCTURE_VERSION_REQUIRED");
        await expectCode(() => previewSubcategoryMove(db, { subcategoryIds: [3], targetCategoryId: 2, expectedVersion: "stale" }), "STRUCTURE_VERSION_STALE");
        await expectCode(() => previewSubcategoryMove(db, { subcategoryIds: [1], targetCategoryId: 2, expectedVersion: context.version }), "SUBCATEGORY_NOT_FOUND");

        const preview = await previewSubcategoryMove(db, { subcategoryIds: [3], targetCategoryId: 2, expectedVersion: context.version });
        assert.strictEqual(preview.canMove, true);
        assert.strictEqual(preview.totalProducts, 2);
        assert.strictEqual(preview.subcategories[0].activeProductCount, 1);
        assert.strictEqual(preview.subcategories[0].hiddenProductCount, 1);

        const result = await moveSubcategories(db, { subcategoryIds: [3], targetCategoryId: 2, expectedVersion: preview.version });
        assert.strictEqual(result.moved, 1);
        assert.notStrictEqual(result.version, preview.version);
        const nodes = await db.all("SELECT id, parent_id, sort_order FROM catalog_structure WHERE id IN (3, 4, 5) ORDER BY id");
        assert.deepStrictEqual(nodes, [
            { id: 3, parent_id: 2, sort_order: 20 },
            { id: 4, parent_id: 1, sort_order: 10 },
            { id: 5, parent_id: 2, sort_order: 10 }
        ]);
        const products = await db.all("SELECT id, category, subcategory, product_group FROM products ORDER BY id");
        assert.deepStrictEqual(products.slice(0, 2), [
            { id: 1, category: "Новая Категория", subcategory: "Ёлки - Палки", product_group: "G1" },
            { id: 2, category: "Новая Категория", subcategory: "елки–палки", product_group: "G2" }
        ]);
        assert.strictEqual(products[2].category, "Старая Категория");
        assert.strictEqual(products[3].category, "Новая Категория");
    } finally {
        await db.close();
    }

    const rollbackDb = await fixture();
    try {
        const context = await getSubcategoryMoveContext(rollbackDb);
        await rollbackDb.run(`CREATE TRIGGER fail_move_product BEFORE UPDATE OF category ON products
            WHEN NEW.id = 2 BEGIN SELECT RAISE(ABORT, 'forced move rollback'); END`);
        await assert.rejects(() => moveSubcategories(rollbackDb, {
            subcategoryIds: [3],
            targetCategoryId: 2,
            expectedVersion: context.version
        }), /forced move rollback/);
        assert.strictEqual((await rollbackDb.all("SELECT parent_id FROM catalog_structure WHERE id = 3"))[0].parent_id, 1);
        assert.deepStrictEqual(
            (await rollbackDb.all("SELECT category FROM products WHERE id IN (1, 2) ORDER BY id")).map(row => row.category),
            ["Старая Категория", "  старая   категория "]
        );
    } finally {
        await rollbackDb.close();
    }
    console.log(JSON.stringify({ success: true, scenarios: 25 }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
