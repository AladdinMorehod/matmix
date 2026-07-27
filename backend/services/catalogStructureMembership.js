function normalizeStructureName(value) {
    return String(value || "")
        .normalize("NFKC")
        .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, " ")
        .trim()
        .replace(/\u0451/g, "\u0435")
        .replace(/\u0401/g, "\u0435")
        .replace(/[\u2010-\u2015\u2212]/g, "-")
        .toLowerCase()
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function buildCatalogStructureIndex(rows = []) {
    const nodesById = new Map();
    const categoriesByName = new Map();
    const subcategoriesByParentAndName = new Map();
    rows.forEach(row => nodesById.set(Number(row.id), row));
    rows.forEach(row => {
        const isActive = Boolean(row.isActive ?? row.is_active);
        const isSystem = Boolean(row.isSystem ?? row.is_system);
        const parentId = Number(row.parentId ?? row.parent_id) || null;
        const name = normalizeStructureName(row.normalizedName ?? row.normalized_name ?? row.name);
        if (!isActive || isSystem || !name) return;
        if (row.type === "category" && !parentId) categoriesByName.set(name, row);
        if (row.type === "subcategory" && parentId) {
            subcategoriesByParentAndName.set(`${parentId}:${name}`, row);
        }
    });
    return { nodesById, categoriesByName, subcategoriesByParentAndName };
}

function resolveProductStructureMembership(product = {}, index) {
    const categoryName = normalizeStructureName(product.category);
    const subcategoryName = normalizeStructureName(product.subcategory);
    const category = categoryName ? index.categoriesByName.get(categoryName) || null : null;
    const categoryId = Number(category?.id) || null;
    const subcategory = categoryId && subcategoryName
        ? index.subcategoriesByParentAndName.get(`${categoryId}:${subcategoryName}`) || null
        : null;
    let reason = "";
    if (!categoryName) reason = "missingCategory";
    else if (!category) reason = "unknownCategory";
    else if (!subcategoryName) reason = "missingSubcategory";
    else if (!subcategory) reason = "unknownSubcategory";
    return {
        category,
        subcategory,
        categoryId,
        subcategoryId: Number(subcategory?.id) || null,
        hasStructure: Boolean(category && subcategory),
        reason
    };
}

function getStructureFilterNode(filter = {}, index) {
    const node = index.nodesById.get(Number(filter.nodeId) || 0) || null;
    if (!node) return null;
    const isActive = Boolean(node.isActive ?? node.is_active);
    const isSystem = Boolean(node.isSystem ?? node.is_system);
    const parentId = Number(node.parentId ?? node.parent_id) || null;
    if (!["category", "subcategory"].includes(node.type) || !isActive || isSystem) return null;
    if (node.type === "category" && parentId) return null;
    if (node.type === "subcategory" && !parentId) return null;
    return node;
}

function matchesStructureFilter(product, filter = {}, index) {
    const membership = resolveProductStructureMembership(product, index);
    if (filter.mode === "withoutStructure") return !membership.hasStructure;
    const node = getStructureFilterNode(filter, index);
    if (!node) return false;
    return node.type === "category"
        ? membership.categoryId === Number(node.id)
        : membership.subcategoryId === Number(node.id);
}

module.exports = {
    normalizeStructureName,
    buildCatalogStructureIndex,
    resolveProductStructureMembership,
    getStructureFilterNode,
    matchesStructureFilter
};
