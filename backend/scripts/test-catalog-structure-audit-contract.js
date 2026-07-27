const assert = require("assert");
const { getCatalogStructureAudit } = require("../services/catalogStructure");

const structureRows = [
    { id: 1, type: "category", name: "Сухие смеси", normalized_name: "сухие смеси", external_code: "CAT-1", parent_id: null, sort_order: 1, is_active: 1, is_system: 0 },
    { id: 2, type: "subcategory", name: "Штукатурки", normalized_name: "штукатурки", external_code: "SUB-1", parent_id: 1, sort_order: 1, is_active: 1, is_system: 0 },
    { id: 3, type: "category", name: "Пустая", normalized_name: "пустая", external_code: "CAT-2", parent_id: null, sort_order: 2, is_active: 1, is_system: 0 },
    { id: 4, type: "subcategory", name: "Пустая SUB", normalized_name: "пустая sub", external_code: "SUB-2", parent_id: 1, sort_order: 2, is_active: 1, is_system: 0 },
    { id: 5, type: "category", name: "Неактивная", normalized_name: "неактивная", external_code: "CAT-3", parent_id: null, sort_order: 3, is_active: 0, is_system: 0 },
    { id: 6, type: "subcategory", name: "Активная в неактивной", normalized_name: "активная в неактивной", external_code: "SUB-3", parent_id: 5, sort_order: 1, is_active: 1, is_system: 0 },
    { id: 7, type: "subcategory", name: "Неактивная SUB", normalized_name: "неактивная sub", external_code: "SUB-4", parent_id: 1, sort_order: 3, is_active: 0, is_system: 0 },
    { id: 8, type: "category", name: "Системная", normalized_name: "системная", external_code: "SYS-1", parent_id: null, sort_order: 4, is_active: 1, is_system: 1 },
    { id: 9, type: "subcategory", name: "Orphan", normalized_name: "orphan", external_code: "SUB-5", parent_id: null, sort_order: 4, is_active: 1, is_system: 0 },
    { id: 10, type: "category", name: "Категория с parent", normalized_name: "категория с parent", external_code: "CAT-4", parent_id: 1, sort_order: 5, is_active: 1, is_system: 0 },
    { id: 11, type: "category", name: " Сухие   смеси ", normalized_name: "сухие смеси", external_code: "CAT-5", parent_id: null, sort_order: 6, is_active: 0, is_system: 0 },
    { id: 12, type: "subcategory", name: " Штукатурки ", normalized_name: "штукатурки", external_code: "SUB-6", parent_id: 1, sort_order: 5, is_active: 1, is_system: 0 },
    { id: 13, type: "subcategory", name: "Штукатурки", normalized_name: "штукатурки", external_code: "SUB-7", parent_id: 3, sort_order: 1, is_active: 1, is_system: 0 }
];

const products = [
    { id: 1, title: "Корректный", category: "Сухие смеси", subcategory: "Штукатурки", product_group: "", is_active: 1, deleted_at: null },
    { id: 2, title: "Без категории", category: "", subcategory: "", product_group: "", is_active: 1, deleted_at: null },
    { id: 3, title: "Без подкатегории", category: "Сухие смеси", subcategory: "", product_group: "", is_active: 1, deleted_at: null },
    { id: 4, title: "Неизвестная структура", category: "Нет такой", subcategory: "Нет такой", product_group: "", is_active: 1, deleted_at: null },
    { id: 5, title: "Нормализованное совпадение", category: "  СУХИЕ   СМЕСИ ", subcategory: " ШТУКАТУРКИ ", product_group: "", is_active: 0, deleted_at: null },
    { id: 6, title: "Удалённый", category: "", subcategory: "", product_group: "", is_active: 1, deleted_at: "2026-01-01T00:00:00.000Z" }
];

async function main() {
    const db = {
        async all(sql) {
            return sql.includes("FROM catalog_structure") ? structureRows : products.filter(product => !product.deleted_at);
        }
    };
    const audit = await getCatalogStructureAudit(db);
    const issueCodes = audit.issues.map(issue => issue.code);
    const category = audit.categories.find(item => item.id === 1);

    assert.strictEqual(audit.summary.categories, 6);
    assert.strictEqual(audit.summary.subcategories, 7);
    assert.strictEqual(audit.summary.products, 5);
    assert.strictEqual(audit.summary.productsWithoutStructure, 3);
    assert.strictEqual(category.productCount, 3);
    assert.strictEqual(category.activeProductCount, 2);
    assert.strictEqual(category.inactiveProductCount, 1);
    assert.strictEqual(category.subcategories.length, 4);
    assert.strictEqual(category.subcategories.find(item => item.id === 2).productCount, 0);
    assert.strictEqual(category.subcategories.find(item => item.id === 12).productCount, 2);
    assert(audit.categories.some(item => item.isSystem));
    assert(!audit.categories.some(item => item.subcategories.some(subcategory => subcategory.id === 9)));
    assert(issueCodes.includes("EMPTY_CATEGORY"));
    assert(issueCodes.includes("EMPTY_SUBCATEGORY"));
    assert(issueCodes.includes("SUBCATEGORY_WITHOUT_PARENT"));
    assert(issueCodes.includes("CATEGORY_HAS_PARENT"));
    assert(issueCodes.includes("SUBCATEGORY_IN_INACTIVE_CATEGORY"));
    assert(issueCodes.includes("DUPLICATE_CATEGORY_NAME"));
    assert(issueCodes.includes("DUPLICATE_SUBCATEGORY_NAME"));
    assert(issueCodes.includes("SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES"));
    assert(issueCodes.includes("PRODUCTS_WITHOUT_STRUCTURE"));

    // Audit, detail and catalog filters now share the same membership contract.
    const unifiedWithoutStructureIds = [2, 3, 4];

    console.log(JSON.stringify({
        success: true,
        summary: audit.summary,
        issueCodes: [...new Set(issueCodes)].sort(),
        orphanInTree: false,
        auditWithoutStructureIds: unifiedWithoutStructureIds,
        detailWithoutStructureIds: unifiedWithoutStructureIds
    }));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
