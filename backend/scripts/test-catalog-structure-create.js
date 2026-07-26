const assert = require("assert");
const sqlite3 = require("sqlite3").verbose();
const { createCategory, createSubcategory } = require("../services/catalogStructure");

function database() {
    const raw = new sqlite3.Database(":memory:");
    return {
        run(sql, params = []) {
            return new Promise((resolve, reject) => raw.run(sql, params, function done(error) {
                if (error) reject(error);
                else resolve({ id: this.lastID, changes: this.changes });
            }));
        },
        get(sql, params = []) {
            return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
        },
        all(sql, params = []) {
            return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
        },
        close() {
            return new Promise((resolve, reject) => raw.close(error => error ? reject(error) : resolve()));
        }
    };
}

async function setup() {
    const db = database();
    await db.run(`CREATE TABLE catalog_structure (
        id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, name TEXT NOT NULL,
        normalized_name TEXT NOT NULL, external_code TEXT, parent_id INTEGER,
        sort_order INTEGER NOT NULL, is_active INTEGER NOT NULL, is_system INTEGER NOT NULL,
        created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`);
    await db.run("CREATE UNIQUE INDEX category_name ON catalog_structure(normalized_name) WHERE type='category' AND is_active=1 AND is_system=0");
    await db.run("CREATE UNIQUE INDEX subcategory_name ON catalog_structure(parent_id, normalized_name) WHERE type='subcategory' AND is_active=1 AND is_system=0");
    return db;
}

async function expectStatus(callback, status) {
    await assert.rejects(callback, error => error.status === status);
}

async function main() {
    const db = await setup();
    try {
        const first = await createCategory(db, { name: "  Первая   категория  ", position: "end" });
        assert.strictEqual(first.name, "Первая категория");
        assert.strictEqual(first.externalCode, undefined);
        const start = await createCategory(db, { name: "Начальная", position: "start" });
        const end = await createCategory(db, { name: "Конечная", position: "end" });
        assert.deepStrictEqual(
            (await db.all("SELECT name, sort_order FROM catalog_structure WHERE type='category' ORDER BY sort_order, id")),
            [
                { name: "Начальная", sort_order: 10 },
                { name: "Первая категория", sort_order: 20 },
                { name: "Конечная", sort_order: 30 }
            ]
        );
        await expectStatus(() => createCategory(db, { name: "" }), 400);
        await expectStatus(() => createCategory(db, { name: "   " }), 400);
        await expectStatus(() => createCategory(db, { name: null }), 400);
        await expectStatus(() => createCategory(db, { name: "Категория" }), 400);
        await expectStatus(() => createCategory(db, { name: "первая категория" }), 409);
        await expectStatus(() => createCategory(db, { name: "Первая   категория" }), 409);
        await expectStatus(() => createCategory(db, { name: "Плохое\u0000имя" }), 400);
        await expectStatus(() => createCategory(db, { name: "x".repeat(201) }), 400);

        const subEnd = await createSubcategory(db, { categoryId: first.id, name: "  Ёлки - Палки ", position: "end" });
        const subStart = await createSubcategory(db, { categoryId: first.id, name: "В начало", position: "start" });
        assert.strictEqual(subEnd.name, "Ёлки - Палки");
        assert.deepStrictEqual(
            (await db.all("SELECT name, sort_order FROM catalog_structure WHERE type='subcategory' AND parent_id=? ORDER BY sort_order", [first.id])),
            [{ name: "В начало", sort_order: 10 }, { name: "Ёлки - Палки", sort_order: 20 }]
        );
        await expectStatus(() => createSubcategory(db, { categoryId: 999, name: "Нет parent" }), 400);
        await expectStatus(() => createSubcategory(db, { categoryId: subEnd.id, name: "Parent sub" }), 400);
        await expectStatus(() => createSubcategory(db, { categoryId: first.id, name: "" }), 400);
        await expectStatus(() => createSubcategory(db, { categoryId: first.id, name: "елки–палки" }), 409);
        const sameOtherParent = await createSubcategory(db, { categoryId: end.id, name: "Ёлки - Палки" });
        assert(sameOtherParent.id);

        await db.run("UPDATE catalog_structure SET is_active=0 WHERE id=?", [end.id]);
        await expectStatus(() => createSubcategory(db, { categoryId: end.id, name: "Inactive parent" }), 400);
        await db.run("UPDATE catalog_structure SET is_active=1, is_system=1 WHERE id=?", [end.id]);
        await expectStatus(() => createSubcategory(db, { categoryId: end.id, name: "System parent" }), 400);
    } finally {
        await db.close();
    }

    const rollbackDb = await setup();
    try {
        await rollbackDb.run(`CREATE TRIGGER fail_reorder BEFORE UPDATE OF sort_order ON catalog_structure
            BEGIN SELECT RAISE(ABORT, 'forced create rollback'); END`);
        await assert.rejects(() => createCategory(rollbackDb, { name: "Rollback" }), /forced create rollback/);
        assert.strictEqual((await rollbackDb.all("SELECT id FROM catalog_structure")).length, 0);
    } finally {
        await rollbackDb.close();
    }
    console.log(JSON.stringify({ success: true, scenarios: 25 }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
