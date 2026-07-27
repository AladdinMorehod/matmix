const assert = require("assert");
const {
    ProductBulkStructureError,
    parseBulkProductStructureRequest,
    createProductBulkStructureService
} = require("../services/productBulkStructure");

function expectDomainError(work, code) {
    assert.throws(
        work,
        error => error instanceof ProductBulkStructureError && error.code === code
    );
}

function createFixture({
    products = [
        { id: 1, category: "Сухие смеси", subcategory: "Штукатурки", product_group: "Старая группа" },
        { id: 2, category: "Сухие смеси", subcategory: "Штукатурки", product_group: "Другая группа" },
        { id: 3, category: "Другие материалы", subcategory: "Клеи", product_group: "Не выбран" }
    ],
    deletedIds = [],
    invalidStructures = new Map(),
    conflictId = null,
    throwOnId = null
} = {}) {
    const rows = new Map(products.map(product => [product.id, { ...product }]));
    const deleted = new Set(deletedIds);
    const events = [];

    const runTransaction = async work => {
        const snapshot = new Map(Array.from(rows, ([id, product]) => [id, { ...product }]));
        events.push("BEGIN IMMEDIATE");
        const transaction = {
            async all(sql, ids) {
                return ids
                    .filter(id => rows.has(id) && !deleted.has(id))
                    .map(id => ({ ...rows.get(id) }));
            },
            async run(sql, values) {
                const id = values[values.length - 1];
                if (throwOnId === id) throw new Error("forced update failure");
                if (conflictId === id || deleted.has(id) || !rows.has(id)) return { changes: 0 };

                const product = rows.get(id);
                let index = 0;
                if (sql.includes("category = ?")) product.category = values[index++];
                if (sql.includes("subcategory = ?")) product.subcategory = values[index++];
                if (sql.includes("product_group = ?")) product.product_group = values[index++];
                product.updated_at = values[index];
                return { changes: 1 };
            }
        };

        try {
            const result = await work(transaction);
            events.push("COMMIT");
            return result;
        } catch (error) {
            rows.clear();
            for (const [id, product] of snapshot) rows.set(id, product);
            events.push("ROLLBACK");
            throw error;
        }
    };

    const validateStructure = async (transaction, structure) => (
        invalidStructures.get(`${structure.category}/${structure.subcategory}`) || ""
    );

    return {
        rows,
        events,
        service: createProductBulkStructureService({
            runTransaction,
            validateStructure,
            now: () => "2026-07-26T10:00:00.000Z"
        })
    };
}

async function expectAsyncDomainError(work, code) {
    await assert.rejects(
        work,
        error => error instanceof ProductBulkStructureError && error.code === code
    );
}

function testValidation() {
    expectDomainError(() => parseBulkProductStructureRequest({}), "PRODUCT_IDS_REQUIRED");
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: "1", changes: { category: "A" } }),
        "PRODUCT_IDS_REQUIRED"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [], changes: { category: "A" } }),
        "PRODUCT_IDS_REQUIRED"
    );
    for (const id of [0, -1, 1.5, "1", null]) {
        expectDomainError(
            () => parseBulkProductStructureRequest({ productIds: [id], changes: { category: "A" } }),
            "INVALID_PRODUCT_IDS"
        );
    }
    assert.deepStrictEqual(
        parseBulkProductStructureRequest({
            productIds: [2, 1, 2],
            changes: { productGroup: "Новая" }
        }).productIds,
        [2, 1]
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({
            productIds: Array.from({ length: 501 }, (_, index) => index + 1),
            changes: { category: "A" }
        }),
        "PRODUCT_BATCH_LIMIT_EXCEEDED"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1] }),
        "PRODUCT_CHANGES_REQUIRED"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: {} }),
        "PRODUCT_CHANGES_REQUIRED"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: { title: "X" } }),
        "UNKNOWN_PRODUCT_CHANGE_FIELDS"
    );
    assert.deepStrictEqual(
        parseBulkProductStructureRequest({
            productIds: [1],
            changes: { product_group: "  Legacy   group  " }
        }).changes,
        { productGroup: "Legacy group" }
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: { productGroup: 1 } }),
        "INVALID_PRODUCT_GROUP"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: { productGroup: "x".repeat(201) } }),
        "INVALID_PRODUCT_GROUP"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: { productGroup: "a\nb" } }),
        "INVALID_PRODUCT_GROUP"
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({ productIds: [1], changes: { productGroup: " " } }),
        "PRODUCT_GROUP_CLEAR_CONFIRMATION_REQUIRED"
    );
    assert.deepStrictEqual(
        parseBulkProductStructureRequest({
            productIds: [1],
            changes: { productGroup: " " },
            allowClearProductGroup: true
        }).changes,
        { productGroup: "" }
    );
    expectDomainError(
        () => parseBulkProductStructureRequest({
            productIds: [1],
            changes: { productGroup: "A", product_group: "B" }
        }),
        "AMBIGUOUS_PRODUCT_GROUP"
    );
}

async function testDomainOperations() {
    {
        const fixture = createFixture();
        const result = await fixture.service({
            productIds: [1, 2],
            changes: { productGroup: "  Общая   группа " }
        });
        assert.strictEqual(fixture.rows.get(1).product_group, "Общая группа");
        assert.strictEqual(fixture.rows.get(1).category, "Сухие смеси");
        assert.strictEqual(fixture.rows.get(2).subcategory, "Штукатурки");
        assert.deepStrictEqual(result, {
            success: true,
            requestedCount: 2,
            updatedCount: 2,
            updatedProductIds: [1, 2],
            appliedChanges: { productGroup: "Общая группа" },
            updatedAt: "2026-07-26T10:00:00.000Z"
        });
        assert.strictEqual(fixture.rows.get(1).updated_at, fixture.rows.get(2).updated_at);
        assert.deepStrictEqual(fixture.events, ["BEGIN IMMEDIATE", "COMMIT"]);
    }
    {
        const fixture = createFixture();
        await fixture.service({
            productIds: [1],
            changes: { category: "Другие материалы", subcategory: "Клеи" }
        });
        assert.strictEqual(fixture.rows.get(1).category, "Другие материалы");
        assert.strictEqual(fixture.rows.get(1).subcategory, "Клеи");
        assert.strictEqual(fixture.rows.get(1).product_group, "Старая группа");
    }
    {
        const fixture = createFixture();
        await fixture.service({
            productIds: [1],
            changes: {
                category: "Другие материалы",
                subcategory: "Клеи",
                productGroup: "Полная замена"
            }
        });
        assert.deepStrictEqual(
            fixture.rows.get(1),
            {
                id: 1,
                category: "Другие материалы",
                subcategory: "Клеи",
                product_group: "Полная замена",
                updated_at: "2026-07-26T10:00:00.000Z"
            }
        );
    }
    {
        const invalidStructures = new Map([
            ["Другие материалы/Штукатурки", "Выберите подкатегорию из списка выбранной категории."],
            ["Неизвестная/Штукатурки", "Выберите категорию из списка."]
        ]);
        const categoryFixture = createFixture({ invalidStructures });
        await expectAsyncDomainError(
            () => categoryFixture.service({ productIds: [1], changes: { category: "Неизвестная" } }),
            "INVALID_FINAL_PRODUCT_STRUCTURE"
        );
        assert.deepStrictEqual(categoryFixture.events, ["BEGIN IMMEDIATE", "ROLLBACK"]);

        const subcategoryFixture = createFixture({ invalidStructures });
        await expectAsyncDomainError(
            () => subcategoryFixture.service({ productIds: [1], changes: { category: "Другие материалы" } }),
            "INVALID_FINAL_PRODUCT_STRUCTURE"
        );
        assert.strictEqual(subcategoryFixture.rows.get(1).category, "Сухие смеси");
    }
    {
        const missingFixture = createFixture();
        await expectAsyncDomainError(
            () => missingFixture.service({ productIds: [1, 99], changes: { productGroup: "X" } }),
            "BULK_PRODUCTS_NOT_FOUND"
        );
        assert.strictEqual(missingFixture.rows.get(1).product_group, "Старая группа");

        const deletedFixture = createFixture({ deletedIds: [2] });
        await expectAsyncDomainError(
            () => deletedFixture.service({ productIds: [1, 2], changes: { productGroup: "X" } }),
            "BULK_PRODUCTS_NOT_FOUND"
        );
        assert.strictEqual(deletedFixture.rows.get(1).product_group, "Старая группа");
    }
}

async function testAtomicity() {
    {
        const fixture = createFixture({ throwOnId: 2 });
        await assert.rejects(
            () => fixture.service({ productIds: [1, 2], changes: { productGroup: "Не сохранять" } }),
            /forced update failure/
        );
        assert.strictEqual(fixture.rows.get(1).product_group, "Старая группа");
        assert.strictEqual(fixture.rows.get(2).product_group, "Другая группа");
        assert.deepStrictEqual(fixture.events, ["BEGIN IMMEDIATE", "ROLLBACK"]);
    }
    {
        const fixture = createFixture({ conflictId: 2 });
        await expectAsyncDomainError(
            () => fixture.service({ productIds: [1, 2], changes: { productGroup: "Не сохранять" } }),
            "BULK_PRODUCT_UPDATE_CONFLICT"
        );
        assert.strictEqual(fixture.rows.get(1).product_group, "Старая группа");
        assert.strictEqual(fixture.rows.get(2).product_group, "Другая группа");
        assert.deepStrictEqual(fixture.events, ["BEGIN IMMEDIATE", "ROLLBACK"]);
    }
}

async function main() {
    testValidation();
    await testDomainOperations();
    await testAtomicity();
    console.log("Product bulk structure service scenarios passed: 31");
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
