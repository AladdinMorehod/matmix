const assert = require("assert");
const {
    normalizeStructureName,
    buildCatalogStructureIndex,
    resolveProductStructureMembership,
    matchesStructureFilter
} = require("../services/catalogStructureMembership");

const rows = [
    { id: 1, type: "category", name: "Сухие смеси", parent_id: null, is_active: 1, is_system: 0 },
    { id: 2, type: "subcategory", name: "Штукатурки", parent_id: 1, is_active: 1, is_system: 0 },
    { id: 3, type: "category", name: "Неактивная", parent_id: null, is_active: 0, is_system: 0 },
    { id: 4, type: "subcategory", name: "Скрытая", parent_id: 1, is_active: 0, is_system: 0 },
    { id: 5, type: "category", name: "Системная", parent_id: null, is_active: 1, is_system: 1 },
    { id: 6, type: "subcategory", name: "Orphan", parent_id: null, is_active: 1, is_system: 0 }
];
const index = buildCatalogStructureIndex(rows);
const valid = { category: "  СУХИЕ   СМЕСИ ", subcategory: " штукатурки ", deleted_at: null };
const hidden = { ...valid, is_active: 0 };

assert.strictEqual(normalizeStructureName("  Ёлка — тест  "), "елка-тест");
assert.strictEqual(resolveProductStructureMembership(valid, index).hasStructure, true);
assert.strictEqual(resolveProductStructureMembership({ ...valid, subcategory: "" }, index).reason, "missingSubcategory");
assert.strictEqual(resolveProductStructureMembership({ ...valid, category: "Нет" }, index).reason, "unknownCategory");
assert.strictEqual(resolveProductStructureMembership({ ...valid, subcategory: "Нет" }, index).reason, "unknownSubcategory");
assert.strictEqual(resolveProductStructureMembership({ category: "Неактивная", subcategory: "Любая" }, index).hasStructure, false);
assert.strictEqual(resolveProductStructureMembership({ category: "Системная", subcategory: "Любая" }, index).hasStructure, false);
assert.strictEqual(matchesStructureFilter(valid, { nodeId: 1 }, index), true);
assert.strictEqual(matchesStructureFilter(hidden, { nodeId: 2 }, index), true);
assert.strictEqual(matchesStructureFilter({ category: "", subcategory: "" }, { mode: "withoutStructure" }, index), true);
assert.strictEqual(matchesStructureFilter(valid, { mode: "withoutStructure" }, index), false);

console.log(JSON.stringify({ success: true, scenarios: 10 }));
