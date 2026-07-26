(function initializeCatalogStructureCreate(global) {
    function normalizePosition(position, afterId) {
        const safePosition = ["start", "end", "after"].includes(position) ? position : "end";
        const payload = { position: safePosition };
        if (safePosition === "after" && Number.isInteger(Number(afterId)) && Number(afterId) > 0) {
            payload.afterId = Number(afterId);
        }
        return payload;
    }

    async function createCategory({ name, position = "end", afterId = null }) {
        const response = await CrmApi.post("/api/products/structure/categories", {
            name: String(name || "").trim(),
            ...normalizePosition(position, afterId)
        });
        global.invalidateCatalogStructureReadonlyCache?.();
        return response.item || response.data?.item;
    }

    async function createSubcategory({ parentId, name, position = "end", afterId = null }) {
        const response = await CrmApi.post("/api/products/structure/subcategories", {
            categoryId: Number(parentId),
            name: String(name || "").trim(),
            ...normalizePosition(position, afterId)
        });
        global.invalidateCatalogStructureReadonlyCache?.();
        return response.item || response.data?.item;
    }

    global.CatalogStructureCreate = { createCategory, createSubcategory };
})(window);
