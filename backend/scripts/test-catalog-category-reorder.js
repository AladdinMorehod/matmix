const assert = require("assert");
const {
    getRootCategoryOrder,
    applyRootCategoryOrder,
    moveRootCategoryToIndex
} = require("../services/catalogStructure");

function createFixture({ failAtUpdate = 0 } = {}) {
    let rows = [
        { id: 1, type: "category", name: "One", external_code: "C1", parent_id: null, sort_order: 10, is_active: 1, is_system: 0, updated_at: "a" },
        { id: 2, type: "category", name: "Two", external_code: "C2", parent_id: null, sort_order: 10, is_active: 1, is_system: 0, updated_at: "a" },
        { id: 3, type: "category", name: "Inactive", parent_id: null, sort_order: 5, is_active: 0, is_system: 0, updated_at: "a" },
        { id: 4, type: "category", name: "System", parent_id: null, sort_order: 5, is_active: 1, is_system: 1, updated_at: "a" },
        { id: 5, type: "category", name: "Child", parent_id: 1, sort_order: 5, is_active: 1, is_system: 0, updated_at: "a" }
    ];
    let snapshot = null;
    let updates = 0;
    const events = [];
    return {
        events,
        rows: () => rows,
        async all(sql) {
            if (!sql.includes("FROM catalog_structure")) throw new Error("Unexpected query");
            return rows
                .filter(row => row.type === "category" && row.is_active === 1 && row.is_system === 0 && row.parent_id === null)
                .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
                .map(row => ({ ...row }));
        },
        async run(sql, params = []) {
            if (sql.startsWith("BEGIN")) {
                snapshot = rows.map(row => ({ ...row }));
                events.push("BEGIN");
            } else if (sql === "COMMIT") {
                snapshot = null;
                events.push("COMMIT");
            } else if (sql === "ROLLBACK") {
                rows = snapshot;
                events.push("ROLLBACK");
            } else if (sql.startsWith("UPDATE catalog_structure")) {
                updates += 1;
                if (failAtUpdate && updates === failAtUpdate) throw new Error("forced reorder failure");
                const [sortOrder, updatedAt, id] = params;
                const row = rows.find(item => item.id === id);
                row.sort_order = sortOrder;
                row.updated_at = updatedAt;
            }
        }
    };
}

async function expectError(callback, status, code) {
    await assert.rejects(callback, error => error.status === status && error.code === code);
}

async function main() {
    const fixture = createFixture();
    const initial = await getRootCategoryOrder(fixture);
    assert.deepStrictEqual(initial.categories.map(item => item.id), [1, 2]);
    assert(initial.version);

    await expectError(() => applyRootCategoryOrder(fixture, { expectedVersion: initial.version }), 400, "CATEGORY_ORDER_IDS_REQUIRED");
    await expectError(() => applyRootCategoryOrder(fixture, { categoryIds: [], expectedVersion: initial.version }), 400, "CATEGORY_ORDER_EMPTY");
    await expectError(() => applyRootCategoryOrder(fixture, { categoryIds: [1, 1], expectedVersion: initial.version }), 400, "CATEGORY_ORDER_DUPLICATE_ID");
    await expectError(() => applyRootCategoryOrder(fixture, { categoryIds: [1, 99], expectedVersion: initial.version }), 409, "CATEGORY_ORDER_SET_CHANGED");
    await expectError(() => applyRootCategoryOrder(fixture, { categoryIds: [1, 2] }), 400, "CATEGORY_ORDER_VERSION_REQUIRED");
    await expectError(() => applyRootCategoryOrder(fixture, { categoryIds: [1, 2], expectedVersion: "stale" }), 409, "CATEGORY_ORDER_STALE");

    const reordered = await applyRootCategoryOrder(fixture, { categoryIds: [2, 1], expectedVersion: initial.version });
    assert.deepStrictEqual(reordered.categories.map(item => item.id), [2, 1]);
    assert.notStrictEqual(reordered.version, initial.version);
    assert.deepStrictEqual(reordered.categories.map(item => item.sortOrder), [10, 20]);
    assert.strictEqual(new Set(fixture.rows().filter(row => [1, 2].includes(row.id)).map(row => row.updated_at)).size, 1);

    const moved = await moveRootCategoryToIndex(fixture, { categoryId: 1, targetIndex: 0 });
    assert.deepStrictEqual(moved.map(item => item.id), [1, 2]);

    const rollbackFixture = createFixture({ failAtUpdate: 2 });
    const beforeRollback = await getRootCategoryOrder(rollbackFixture);
    await assert.rejects(() => applyRootCategoryOrder(rollbackFixture, {
        categoryIds: [2, 1],
        expectedVersion: beforeRollback.version
    }), /forced reorder failure/);
    assert.deepStrictEqual((await getRootCategoryOrder(rollbackFixture)).categories.map(item => item.id), [1, 2]);
    assert(rollbackFixture.events.includes("ROLLBACK"));

    console.log(JSON.stringify({ success: true, scenarios: 13 }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
