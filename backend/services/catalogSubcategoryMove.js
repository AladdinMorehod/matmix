const crypto = require("crypto");
const {
    normalizeStructureName,
    buildCatalogStructureIndex,
    resolveProductStructureMembership
} = require("./catalogStructureMembership");

const SUBCATEGORY_MOVE_BATCH_LIMIT = 100;

function domainError(status, code, message, details = null) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    if (details) error.details = details;
    return error;
}

async function transaction(db, callback) {
    await db.run("BEGIN IMMEDIATE TRANSACTION");
    try {
        const result = await callback();
        await db.run("COMMIT");
        return result;
    } catch (error) {
        await db.run("ROLLBACK");
        throw error;
    }
}

async function loadState(db) {
    const structure = await db.all(
        `SELECT *
         FROM catalog_structure
         WHERE is_active = 1 AND COALESCE(is_system, 0) = 0
         ORDER BY CASE type WHEN 'category' THEN 0 ELSE 1 END, sort_order, id`
    );
    const products = await db.all(
        `SELECT id, title, category, subcategory, product_group, is_active, deleted_at
         FROM products`
    );
    return { structure, products };
}

function validState(state) {
    const categories = state.structure
        .filter(row => row.type === "category" && !row.parent_id)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id));
    const categoryIds = new Set(categories.map(row => Number(row.id)));
    const subcategories = state.structure
        .filter(row => row.type === "subcategory" && categoryIds.has(Number(row.parent_id)))
        .sort((a, b) => {
            const parentA = categories.findIndex(category => Number(category.id) === Number(a.parent_id));
            const parentB = categories.findIndex(category => Number(category.id) === Number(b.parent_id));
            return parentA - parentB || Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id);
        });
    return { categories, subcategories };
}

function structureVersion(state) {
    const { categories, subcategories } = validState(state);
    const source = [
        ...categories.map(row => `category:${row.id}:${row.sort_order}:${row.updated_at || ""}:${normalizeStructureName(row.name)}`),
        ...subcategories.map(row => `subcategory:${row.id}:${row.parent_id}:${row.sort_order}:${row.updated_at || ""}:${normalizeStructureName(row.name)}`)
    ].join("|");
    return crypto.createHash("sha256").update(source).digest("hex");
}

function publicNode(row) {
    return {
        id: Number(row.id),
        name: row.name || "",
        externalCode: row.external_code || "",
        parentId: Number(row.parent_id) || null,
        sortOrder: Number(row.sort_order) || 0
    };
}

function validateRequest(payload = {}, { requireVersion = true } = {}) {
    if (!Array.isArray(payload.subcategoryIds)) {
        throw domainError(400, "SUBCATEGORY_IDS_REQUIRED", "Передайте массив subcategoryIds.");
    }
    if (!payload.subcategoryIds.length) {
        throw domainError(400, "SUBCATEGORY_IDS_EMPTY", "Выберите подкатегории для перемещения.");
    }
    if (payload.subcategoryIds.length > SUBCATEGORY_MOVE_BATCH_LIMIT) {
        throw domainError(400, "SUBCATEGORY_MOVE_BATCH_LIMIT_EXCEEDED", `Можно переместить не более ${SUBCATEGORY_MOVE_BATCH_LIMIT} подкатегорий.`);
    }
    const ids = payload.subcategoryIds.map(Number);
    if (ids.some((id, index) => !Number.isInteger(id) || id <= 0 || Number(payload.subcategoryIds[index]) !== id)) {
        throw domainError(400, "INVALID_SUBCATEGORY_IDS", "Все subcategoryIds должны быть положительными целыми числами.");
    }
    if (new Set(ids).size !== ids.length) {
        throw domainError(400, "DUPLICATE_SUBCATEGORY_IDS", "subcategoryIds не должны содержать дубликаты.");
    }
    const targetCategoryId = Number(payload.targetCategoryId);
    if (!Number.isInteger(targetCategoryId) || targetCategoryId <= 0) {
        throw domainError(400, "TARGET_CATEGORY_REQUIRED", "Выберите целевую категорию.");
    }
    if (requireVersion && (typeof payload.expectedVersion !== "string" || !payload.expectedVersion)) {
        throw domainError(400, "STRUCTURE_VERSION_REQUIRED", "Обновите структуру перед перемещением.");
    }
    return { ids, targetCategoryId, expectedVersion: payload.expectedVersion || "" };
}

function productMembership(state) {
    const index = buildCatalogStructureIndex(state.structure);
    return state.products.map(product => ({
        product,
        membership: product.deleted_at ? null : resolveProductStructureMembership(product, index)
    }));
}

function buildPreview(state, request) {
    const { categories, subcategories } = validState(state);
    const categoryById = new Map(categories.map(row => [Number(row.id), row]));
    const subcategoryById = new Map(subcategories.map(row => [Number(row.id), row]));
    const target = categoryById.get(request.targetCategoryId);
    if (!target) throw domainError(404, "INVALID_TARGET_CATEGORY", "Целевая категория не найдена или недоступна.");

    const selected = request.ids.map(id => subcategoryById.get(id));
    if (selected.some(row => !row)) {
        throw domainError(404, "SUBCATEGORY_NOT_FOUND", "Одна или несколько подкатегорий не найдены или недоступны.");
    }
    const conflicts = [];
    const targetNames = new Map(
        subcategories
            .filter(row => Number(row.parent_id) === target.id && !request.ids.includes(Number(row.id)))
            .map(row => [normalizeStructureName(row.name), row])
    );
    const selectedNames = new Map();
    selected.forEach(row => {
        if (Number(row.parent_id) === target.id) {
            conflicts.push({ code: "SUBCATEGORY_ALREADY_IN_TARGET", subcategoryId: Number(row.id), message: `"${row.name}" уже находится в целевой категории.` });
        }
        const normalized = normalizeStructureName(row.name);
        const duplicate = targetNames.get(normalized);
        if (duplicate) {
            conflicts.push({ code: "SUBCATEGORY_NAME_CONFLICT", subcategoryId: Number(row.id), duplicateId: Number(duplicate.id), message: `В целевой категории уже есть подкатегория "${duplicate.name}".` });
        }
        if (selectedNames.has(normalized)) {
            conflicts.push({ code: "SELECTED_SUBCATEGORY_NAME_CONFLICT", subcategoryId: Number(row.id), duplicateId: selectedNames.get(normalized), message: `Выбранные подкатегории имеют одинаковое нормализованное имя "${row.name}".` });
        } else {
            selectedNames.set(normalized, Number(row.id));
        }
    });

    const memberships = productMembership(state);
    const items = selected.map(row => {
        const parent = categoryById.get(Number(row.parent_id));
        const related = memberships
            .filter(entry => entry.membership?.subcategoryId === Number(row.id))
            .map(entry => entry.product);
        const sampleProducts = related.slice(0, 20).map(product => ({ id: Number(product.id), title: product.title || "" }));
        return {
            id: Number(row.id),
            name: row.name || "",
            externalCode: row.external_code || "",
            sourceCategory: publicNode(parent),
            productCount: related.length,
            activeProductCount: related.filter(product => Number(product.is_active) === 1).length,
            hiddenProductCount: related.filter(product => Number(product.is_active) !== 1).length,
            productIds: related.map(product => Number(product.id)),
            sampleProducts,
            productsTruncated: related.length > sampleProducts.length
        };
    });
    return {
        canMove: conflicts.length === 0,
        version: structureVersion(state),
        targetCategory: publicNode(target),
        subcategories: items,
        items,
        totalSubcategories: items.length,
        totalProducts: items.reduce((sum, item) => sum + item.productCount, 0),
        affectedProducts: items.reduce((sum, item) => sum + item.productCount, 0),
        conflicts
    };
}

async function getSubcategoryMoveContext(db) {
    const state = await loadState(db);
    const { categories, subcategories } = validState(state);
    const counts = new Map();
    productMembership(state).forEach(entry => {
        if (entry.membership?.subcategoryId) {
            const current = counts.get(entry.membership.subcategoryId) || { total: 0, active: 0, hidden: 0 };
            current.total += 1;
            if (Number(entry.product.is_active) === 1) current.active += 1;
            else current.hidden += 1;
            counts.set(entry.membership.subcategoryId, current);
        }
    });
    return {
        version: structureVersion(state),
        batchLimit: SUBCATEGORY_MOVE_BATCH_LIMIT,
        categories: categories.map(publicNode),
        subcategories: subcategories.map(row => ({
            ...publicNode(row),
            currentCategory: publicNode(categories.find(category => Number(category.id) === Number(row.parent_id))),
            productCount: counts.get(Number(row.id))?.total || 0,
            activeProductCount: counts.get(Number(row.id))?.active || 0,
            hiddenProductCount: counts.get(Number(row.id))?.hidden || 0
        }))
    };
}

async function previewSubcategoryMove(db, payload) {
    const request = validateRequest(payload);
    const state = await loadState(db);
    const version = structureVersion(state);
    if (request.expectedVersion !== version) {
        throw domainError(409, "STRUCTURE_VERSION_STALE", "Структура каталога изменилась. Обновите данные и повторите preview.");
    }
    return buildPreview(state, request);
}

async function normalizeChildren(db, parentId, now) {
    const rows = await db.all(
        `SELECT id FROM catalog_structure
         WHERE type = 'subcategory' AND parent_id = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0
         ORDER BY sort_order, id`,
        [parentId]
    );
    for (let index = 0; index < rows.length; index += 1) {
        await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [(index + 1) * 10, now, rows[index].id]);
    }
}

async function moveSubcategories(db, payload) {
    const request = validateRequest(payload);
    return transaction(db, async () => {
        const state = await loadState(db);
        const version = structureVersion(state);
        if (request.expectedVersion !== version) {
            throw domainError(409, "STRUCTURE_VERSION_STALE", "Структура каталога изменилась. Обновите данные и повторите preview.");
        }
        const preview = buildPreview(state, request);
        if (!preview.canMove) {
            throw domainError(409, "SUBCATEGORY_MOVE_CONFLICT", preview.conflicts[0].message, { conflicts: preview.conflicts });
        }
        const now = new Date().toISOString();
        const sourceIds = new Set(preview.subcategories.map(item => Number(item.sourceCategory.id)));
        const targetExisting = validState(state).subcategories
            .filter(row => Number(row.parent_id) === request.targetCategoryId && !request.ids.includes(Number(row.id)))
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id));
        const selectedById = new Map(validState(state).subcategories.map(row => [Number(row.id), row]));
        const selected = request.ids.map(id => selectedById.get(id));
        for (const item of preview.subcategories) {
            const changed = await db.run(
                "UPDATE catalog_structure SET parent_id = ?, updated_at = ? WHERE id = ? AND parent_id = ? AND type = 'subcategory'",
                [request.targetCategoryId, now, item.id, item.sourceCategory.id]
            );
            if (Number(changed?.changes) !== 1) {
                throw domainError(409, "SUBCATEGORY_MOVE_UPDATE_CONFLICT", "Подкатегория была изменена параллельно.");
            }
            for (const productId of item.productIds) {
                await db.run(
                    "UPDATE products SET category = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
                    [preview.targetCategory.name, now, productId]
                );
            }
        }
        const targetRows = [...targetExisting, ...selected];
        for (let index = 0; index < targetRows.length; index += 1) {
            await db.run("UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?", [(index + 1) * 10, now, targetRows[index].id]);
        }
        for (const sourceId of sourceIds) {
            if (sourceId !== request.targetCategoryId) await normalizeChildren(db, sourceId, now);
        }
        const updatedState = await loadState(db);
        return {
            moved: preview.totalSubcategories,
            affectedProducts: preview.totalProducts,
            targetCategory: preview.targetCategory,
            items: preview.subcategories,
            oldVersion: version,
            version: structureVersion(updatedState),
            updatedAt: now
        };
    });
}

module.exports = {
    SUBCATEGORY_MOVE_BATCH_LIMIT,
    getSubcategoryMoveContext,
    previewSubcategoryMove,
    moveSubcategories
};
