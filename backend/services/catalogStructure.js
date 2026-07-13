function normalizeCatalogStructureName(value) {
    return String(value || "")
        .normalize("NFKC")
        .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, " ")
        .trim()
        .replace(/ё/g, "е")
        .replace(/Ё/g, "е")
        .replace(/\u0451/g, "\u0435")
        .replace(/\u0401/g, "\u0435")
        .replace(/[\u2010-\u2015\u2212]/g, "-")
        .toLowerCase()
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanCatalogStructureName(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function createStructureError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function createStructureCodeError(status, code, message) {
    const error = createStructureError(status, message);
    error.code = code;
    return error;
}

function isSkippedCatalogStructureName(value) {
    const normalized = normalizeCatalogStructureName(value);

    return !normalized
        || normalized === "-"
        || normalized === "—"
        || normalized === "n/a"
        || normalized === "null"
        || normalized === "undefined"
        || normalized === "категория"
        || normalized === "подкатегория"
        || normalized.startsWith("категория -")
        || normalized.startsWith("подкатегория -");
}

async function ensureColumn({ all, run }, tableName, columnName, columnDefinition) {
    const columns = await all(`PRAGMA table_info(${tableName})`);
    const exists = columns.some(column => column.name === columnName);

    if (!exists) {
        await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    }
}

async function ensureCatalogStructureSchema(db) {
    const { run } = db;

    await run(`
        CREATE TABLE IF NOT EXISTS catalog_structure (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            normalized_name TEXT NOT NULL,
            external_code TEXT,
            parent_id INTEGER NULL REFERENCES catalog_structure(id),
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            is_system INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);

    await ensureColumn(db, "catalog_structure", "type", "TEXT");
    await ensureColumn(db, "catalog_structure", "name", "TEXT");
    await ensureColumn(db, "catalog_structure", "normalized_name", "TEXT");
    await ensureColumn(db, "catalog_structure", "external_code", "TEXT");
    await ensureColumn(db, "catalog_structure", "parent_id", "INTEGER");
    await ensureColumn(db, "catalog_structure", "sort_order", "INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(db, "catalog_structure", "is_active", "INTEGER NOT NULL DEFAULT 1");
    await ensureColumn(db, "catalog_structure", "is_system", "INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(db, "catalog_structure", "created_at", "TEXT");
    await ensureColumn(db, "catalog_structure", "updated_at", "TEXT");

    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_type ON catalog_structure(type)");
    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_parent_id ON catalog_structure(parent_id)");
    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_sort_order ON catalog_structure(sort_order)");
    await run("DROP INDEX IF EXISTS idx_catalog_structure_category_unique");
    await run("DROP INDEX IF EXISTS idx_catalog_structure_subcategory_unique");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_structure_category_active_unique ON catalog_structure(normalized_name) WHERE type = 'category' AND is_active = 1 AND is_system = 0");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_structure_subcategory_active_unique ON catalog_structure(parent_id, normalized_name) WHERE type = 'subcategory' AND is_active = 1 AND is_system = 0");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_structure_external_code_unique ON catalog_structure(external_code) WHERE external_code IS NOT NULL AND external_code != ''");
}

function rememberFirstStructureItem(map, name, product) {
    const normalizedName = normalizeCatalogStructureName(name);
    const current = map.get(normalizedName);
    const sortOrder = Number(product.sort_order) || 0;
    const productId = Number(product.id) || 0;

    if (!current
        || sortOrder < current.sortOrder
        || (sortOrder === current.sortOrder && productId < current.firstProductId)) {
        map.set(normalizedName, {
            name: cleanCatalogStructureName(name),
            normalizedName,
            sortOrder,
            firstProductId: productId
        });
    }
}

async function findCategory(db, normalizedName) {
    return db.get(
        "SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [normalizedName]
    );
}

async function findSubcategory(db, parentId, normalizedName) {
    return db.get(
        "SELECT * FROM catalog_structure WHERE type = 'subcategory' AND parent_id = ? AND normalized_name = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [parentId, normalizedName]
    );
}

async function insertStructureItem(db, { type, name, normalizedName, parentId = null, sortOrder, now }) {
    const result = await db.run(
        `INSERT INTO catalog_structure (
            type,
            name,
            normalized_name,
            parent_id,
            sort_order,
            is_active,
            is_system,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [type, name, normalizedName, parentId, sortOrder, 1, 0, now, now]
    );

    return {
        id: result.id,
        type,
        name,
        normalized_name: normalizedName,
        parent_id: parentId,
        external_code: null,
        sort_order: sortOrder,
        is_active: 1,
        is_system: 0,
        created_at: now,
        updated_at: now
    };
}

function normalizePosition(value) {
    return ["start", "end", "after"].includes(value) ? value : "end";
}

function toPublicStructureItem(row) {
    const item = {
        id: row.id,
        type: row.type,
        name: row.name,
        sortOrder: Number(row.sort_order) || 0
    };
    if (row.external_code) item.externalCode = row.external_code;

    if (row.type === "subcategory") {
        item.parentId = row.parent_id;
    }

    return item;
}

function toStructureRow(row) {
    return {
        id: row.id,
        type: row.type,
        name: row.name || "",
        normalizedName: normalizeCatalogStructureName(row.name || row.normalized_name),
        externalCode: row.external_code || "",
        parentId: row.parent_id || null,
        sortOrder: Number(row.sort_order) || 0,
        isActive: Number(row.is_active) === 1,
        isSystem: Number(row.is_system) === 1
    };
}

function addIssue(target, issue) {
    target.push({
        severity: issue.severity || "warning",
        code: issue.code,
        message: issue.message,
        itemId: issue.itemId || null,
        itemType: issue.itemType || "",
        itemName: issue.itemName || "",
        parentId: issue.parentId || null,
        parentName: issue.parentName || ""
    });
}

async function runInTransaction(db, callback) {
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

async function getStructureLevelRows(db, { type, parentId = null }) {
    const parentCondition = type === "category" ? "parent_id IS NULL" : "parent_id = ?";
    const params = type === "category" ? [type] : [type, parentId];

    return db.all(
        `SELECT *
         FROM catalog_structure
         WHERE type = ?
           AND is_active = 1
           AND COALESCE(is_system, 0) = 0
           AND ${parentCondition}
         ORDER BY sort_order ASC, id ASC`,
        params
    );
}

async function validateStructurePosition(db, { type, parentId = null, position = "end", afterId = null }) {
    const safePosition = normalizePosition(position);
    if (safePosition !== "after") {
        return { position: safePosition, afterId: null };
    }

    const item = await db.get(
        "SELECT * FROM catalog_structure WHERE id = ? AND type = ? AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [Number(afterId) || 0, type]
    );
    const isValid = item && (
        type === "category"
            ? item.parent_id === null
            : Number(item.parent_id) === Number(parentId)
    );

    if (!isValid) {
        throw createStructureError(
            400,
            type === "category"
                ? "Выбранная позиция категории недоступна."
                : "Выбранная позиция подкатегории недоступна."
        );
    }

    return { position: safePosition, afterId: item.id };
}

async function reorderStructureLevel(db, { type, parentId = null, itemId, position = "end", afterId = null }) {
    const rows = await getStructureLevelRows(db, { type, parentId });
    const item = rows.find(row => Number(row.id) === Number(itemId));
    if (!item) return;

    const orderedRows = rows.filter(row => Number(row.id) !== Number(itemId));
    const safePosition = normalizePosition(position);

    if (safePosition === "start") {
        orderedRows.unshift(item);
    } else if (safePosition === "after") {
        const afterIndex = orderedRows.findIndex(row => Number(row.id) === Number(afterId));
        if (afterIndex === -1) {
            orderedRows.push(item);
        } else {
            orderedRows.splice(afterIndex + 1, 0, item);
        }
    } else {
        orderedRows.push(item);
    }

    for (let index = 0; index < orderedRows.length; index += 1) {
        await db.run(
            "UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?",
            [(index + 1) * 10, new Date().toISOString(), orderedRows[index].id]
        );
    }
}

async function moveRootCategoryToIndex(db, { categoryId, targetIndex }) {
    const itemId = Number(categoryId) || 0;
    const rows = await getStructureLevelRows(db, { type: "category", parentId: null });
    const item = rows.find(row => Number(row.id) === itemId);
    if (!item) {
        throw createStructureError(404, "Категория не найдена или недоступна для сортировки.");
    }

    const safeIndex = Number(targetIndex);
    if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex >= rows.length) {
        throw createStructureError(400, "Позиция категории недоступна.");
    }

    return runInTransaction(db, async () => {
        const orderedRows = rows.filter(row => Number(row.id) !== itemId);
        orderedRows.splice(safeIndex, 0, item);
        const now = new Date().toISOString();

        for (let index = 0; index < orderedRows.length; index += 1) {
            await db.run(
                "UPDATE catalog_structure SET sort_order = ?, updated_at = ? WHERE id = ?",
                [(index + 1) * 10, now, orderedRows[index].id]
            );
        }

        const updatedRows = await getStructureLevelRows(db, { type: "category", parentId: null });
        return updatedRows.map(toPublicStructureItem);
    });
}

async function createCategory(db, { name, position = "end", afterId = null }) {
    const cleanName = cleanCatalogStructureName(name);
    if (isSkippedCatalogStructureName(cleanName)) {
        throw createStructureError(400, "Укажите название категории.");
    }

    const normalizedName = normalizeCatalogStructureName(cleanName);
    const duplicate = await findCategory(db, normalizedName);
    if (duplicate) {
        throw createStructureError(409, "Категория с таким названием уже существует.");
    }

    return runInTransaction(db, async () => {
        const placement = await validateStructurePosition(db, { type: "category", position, afterId });
        const now = new Date().toISOString();
        const item = await insertStructureItem(db, {
            type: "category",
            name: cleanName,
            normalizedName,
            sortOrder: 0,
            now
        });
        await reorderStructureLevel(db, {
            type: "category",
            itemId: item.id,
            position: placement.position,
            afterId: placement.afterId
        });

        const created = await db.get("SELECT * FROM catalog_structure WHERE id = ?", [item.id]);
        return toPublicStructureItem(created);
    });
}

async function createSubcategory(db, { categoryId, name, position = "end", afterId = null }) {
    const parentId = Number(categoryId) || 0;
    const parent = await db.get(
        "SELECT * FROM catalog_structure WHERE id = ? AND type = 'category' AND is_active = 1 AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [parentId]
    );
    if (!parent) {
        throw createStructureError(400, "Выберите категорию.");
    }

    const cleanName = cleanCatalogStructureName(name);
    if (isSkippedCatalogStructureName(cleanName)) {
        throw createStructureError(400, "Укажите название подкатегории.");
    }

    const normalizedName = normalizeCatalogStructureName(cleanName);
    const duplicate = await findSubcategory(db, parent.id, normalizedName);
    if (duplicate) {
        throw createStructureError(409, "Такая подкатегория уже существует в выбранной категории.");
    }

    return runInTransaction(db, async () => {
        const placement = await validateStructurePosition(db, {
            type: "subcategory",
            parentId: parent.id,
            position,
            afterId
        });
        const now = new Date().toISOString();
        const item = await insertStructureItem(db, {
            type: "subcategory",
            name: cleanName,
            normalizedName,
            parentId: parent.id,
            sortOrder: 0,
            now
        });
        await reorderStructureLevel(db, {
            type: "subcategory",
            parentId: parent.id,
            itemId: item.id,
            position: placement.position,
            afterId: placement.afterId
        });

        const created = await db.get("SELECT * FROM catalog_structure WHERE id = ?", [item.id]);
        return toPublicStructureItem(created);
    });
}

async function getMoveSubcategoriesPreview(db, { subcategoryIds = [], targetCategoryId }) {
    const ids = Array.from(new Set((subcategoryIds || []).map(Number).filter(Boolean)));
    const targetId = Number(targetCategoryId) || 0;
    if (!ids.length) {
        throw createStructureCodeError(400, "CATALOG_STRUCTURE_INVALID_SELECTION", "Выберите подкатегории для перемещения.");
    }

    const target = await db.get(
        "SELECT * FROM catalog_structure WHERE id = ? AND type = 'category' AND is_active = 1 AND parent_id IS NULL AND COALESCE(is_system, 0) = 0 LIMIT 1",
        [targetId]
    );
    if (!target) {
        throw createStructureCodeError(400, "CATALOG_STRUCTURE_INVALID_TARGET", "Выберите активную корневую категорию.");
    }

    const placeholders = ids.map(() => "?").join(",");
    const rows = await db.all(
        `SELECT child.*, parent.name AS parent_name
         FROM catalog_structure child
         LEFT JOIN catalog_structure parent ON parent.id = child.parent_id
         WHERE child.id IN (${placeholders})
           AND child.type = 'subcategory'
           AND child.is_active = 1
           AND COALESCE(child.is_system, 0) = 0`,
        ids
    );
    if (rows.length !== ids.length) {
        throw createStructureCodeError(404, "CATALOG_STRUCTURE_SUBCATEGORY_NOT_FOUND", "Одна или несколько подкатегорий не найдены.");
    }

    const conflicts = [];
    const items = [];
    let affectedProducts = 0;
    const sourceCategories = new Map();

    for (const row of rows) {
        if (Number(row.parent_id) === target.id) {
            conflicts.push({
                code: "SAME_PARENT",
                message: `Подкатегория "${row.name}" уже находится в выбранной категории.`,
                subcategoryId: row.id
            });
        }

        const duplicate = await db.get(
            `SELECT id, name
             FROM catalog_structure
             WHERE type = 'subcategory'
               AND parent_id = ?
               AND normalized_name = ?
               AND id != ?
               AND is_active = 1
               AND COALESCE(is_system, 0) = 0
             LIMIT 1`,
            [target.id, normalizeCatalogStructureName(row.name), row.id]
        );
        if (duplicate) {
            conflicts.push({
                code: "TARGET_DUPLICATE_SUBCATEGORY",
                message: `В выбранной категории уже есть подкатегория "${duplicate.name}".`,
                subcategoryId: row.id,
                duplicateId: duplicate.id
            });
        }

        const productRow = await db.get(
            `SELECT COUNT(*) AS count
             FROM products
             WHERE deleted_at IS NULL
               AND category = ?
               AND subcategory = ?`,
            [row.parent_name || "", row.name]
        );
        const productCount = Number(productRow?.count || 0);
        affectedProducts += productCount;
        if (row.parent_name) sourceCategories.set(row.parent_name, (sourceCategories.get(row.parent_name) || 0) + 1);
        items.push({
            id: row.id,
            name: row.name,
            currentCategoryId: row.parent_id,
            currentCategoryName: row.parent_name || "",
            targetCategoryId: target.id,
            targetCategoryName: target.name,
            productCount
        });
    }

    return {
        canMove: conflicts.length === 0,
        targetCategory: toPublicStructureItem(target),
        items,
        affectedProducts,
        sourceCategories: Array.from(sourceCategories.entries()).map(([name, count]) => ({ name, count })),
        conflicts
    };
}

async function moveSubcategories(db, payload) {
    const preview = await getMoveSubcategoriesPreview(db, payload);
    if (!preview.canMove) {
        throw createStructureCodeError(409, "CATALOG_STRUCTURE_CONFLICT", preview.conflicts[0]?.message || "Перемещение невозможно.");
    }

    return runInTransaction(db, async () => {
        const now = new Date().toISOString();
        for (const item of preview.items) {
            await db.run(
                "UPDATE catalog_structure SET parent_id = ?, updated_at = ? WHERE id = ? AND type = 'subcategory'",
                [preview.targetCategory.id, now, item.id]
            );
            await db.run(
                `UPDATE products
                 SET category = ?,
                     updated_at = ?
                 WHERE deleted_at IS NULL
                   AND category = ?
                   AND subcategory = ?`,
                [preview.targetCategory.name, now, item.currentCategoryName, item.name]
            );
        }
        await reorderStructureLevel(db, {
            type: "subcategory",
            parentId: preview.targetCategory.id,
            itemId: preview.items[0].id,
            position: "end"
        });

        return {
            moved: preview.items.length,
            affectedProducts: preview.affectedProducts,
            targetCategory: preview.targetCategory,
            items: preview.items
        };
    });
}

async function validateProductStructureSelection(db, payload, existing = null) {
    const category = cleanCatalogStructureName(payload.category);
    const subcategory = cleanCatalogStructureName(payload.subcategory);
    const oldCategory = cleanCatalogStructureName(existing?.category);
    const oldSubcategory = cleanCatalogStructureName(existing?.subcategory);
    const categoryChanged = !existing
        || normalizeCatalogStructureName(category) !== normalizeCatalogStructureName(oldCategory);
    const subcategoryChanged = !existing
        || normalizeCatalogStructureName(subcategory) !== normalizeCatalogStructureName(oldSubcategory);

    if (existing && !categoryChanged && !subcategoryChanged) {
        return "";
    }

    if (!category) {
        return "Выберите категорию.";
    }

    const categoryRow = await findCategory(db, normalizeCatalogStructureName(category));
    if (!categoryRow || !categoryRow.is_active || Number(categoryRow.is_system) === 1) {
        return "Выберите категорию из списка.";
    }

    if (!subcategory) {
        return "";
    }

    const subcategoryRow = await findSubcategory(db, categoryRow.id, normalizeCatalogStructureName(subcategory));
    if (!subcategoryRow || !subcategoryRow.is_active || Number(subcategoryRow.is_system) === 1) {
        return "Выберите подкатегорию из списка выбранной категории.";
    }

    return "";
}

async function syncCatalogStructureFromProducts(db) {
    const rows = await db.all(`
        SELECT id, category, subcategory, sort_order
        FROM products
        WHERE deleted_at IS NULL
        ORDER BY sort_order ASC, id ASC
    `);
    const categories = new Map();
    const subcategoriesByCategory = new Map();
    let skipped = 0;
    let existing = 0;
    let categoriesAdded = 0;
    let subcategoriesAdded = 0;

    rows.forEach(product => {
        if (isSkippedCatalogStructureName(product.category)) {
            skipped += 1;
            return;
        }

        const categoryName = cleanCatalogStructureName(product.category);
        const categoryNormalizedName = normalizeCatalogStructureName(categoryName);
        rememberFirstStructureItem(categories, categoryName, product);

        if (isSkippedCatalogStructureName(product.subcategory)) {
            if (product.subcategory) skipped += 1;
            return;
        }

        const subcategoryName = cleanCatalogStructureName(product.subcategory);
        const subcategoryNormalizedName = normalizeCatalogStructureName(subcategoryName);
        if (!subcategoriesByCategory.has(categoryNormalizedName)) {
            subcategoriesByCategory.set(categoryNormalizedName, new Map());
        }

        rememberFirstStructureItem(
            subcategoriesByCategory.get(categoryNormalizedName),
            subcategoryName,
            product
        );
    });

    const now = new Date().toISOString();
    const sortedCategories = Array.from(categories.values())
        .sort((first, second) => first.sortOrder - second.sortOrder || first.firstProductId - second.firstProductId);

    for (const category of sortedCategories) {
        let categoryRow = await findCategory(db, category.normalizedName);
        if (categoryRow) {
            existing += 1;
        } else {
            categoryRow = await insertStructureItem(db, {
                type: "category",
                name: category.name,
                normalizedName: category.normalizedName,
                sortOrder: category.sortOrder,
                now
            });
            categoriesAdded += 1;
        }

        const subcategories = Array.from(subcategoriesByCategory.get(category.normalizedName)?.values() || [])
            .sort((first, second) => first.sortOrder - second.sortOrder || first.firstProductId - second.firstProductId);

        for (const subcategory of subcategories) {
            const subcategoryRow = await findSubcategory(db, categoryRow.id, subcategory.normalizedName);
            if (subcategoryRow) {
                existing += 1;
                continue;
            }

            await insertStructureItem(db, {
                type: "subcategory",
                name: subcategory.name,
                normalizedName: subcategory.normalizedName,
                parentId: categoryRow.id,
                sortOrder: subcategory.sortOrder,
                now
            });
            subcategoriesAdded += 1;
        }
    }

    if (categoriesAdded || subcategoriesAdded) {
        console.log(`Catalog structure sync: categories added=${categoriesAdded}, subcategories added=${subcategoriesAdded}, existing=${existing}, skipped=${skipped}`);
    }

    return {
        categoriesAdded,
        subcategoriesAdded,
        existing,
        skipped
    };
}

async function getCatalogStructureTree(db) {
    const rows = await db.all(`
        SELECT id, type, name, external_code, parent_id, sort_order
        FROM catalog_structure
        WHERE is_active = 1
          AND COALESCE(is_system, 0) = 0
          AND type IN ('category', 'subcategory')
        ORDER BY sort_order ASC, id ASC
    `);
    const categories = [];
    const categoriesById = new Map();

    rows.filter(row => row.type === "category").forEach(row => {
        const category = {
            id: row.id,
            name: row.name,
            externalCode: row.external_code || "",
            sortOrder: Number(row.sort_order) || 0,
            subcategories: []
        };
        categories.push(category);
        categoriesById.set(row.id, category);
    });

    rows.filter(row => row.type === "subcategory").forEach(row => {
        const parent = categoriesById.get(row.parent_id);
        if (!parent) return;

        parent.subcategories.push({
            id: row.id,
            name: row.name,
            externalCode: row.external_code || "",
            sortOrder: Number(row.sort_order) || 0
        });
    });

    return categories;
}

async function getCatalogStructureAudit(db) {
    const [rawRows, products] = await Promise.all([
        db.all(`
            SELECT id, type, name, normalized_name, external_code, parent_id, sort_order, is_active, is_system
            FROM catalog_structure
            WHERE type IN ('category', 'subcategory')
            ORDER BY sort_order ASC, id ASC
        `),
        db.all(`
            SELECT id, title, category, subcategory, product_group, is_active, deleted_at
            FROM products
            WHERE deleted_at IS NULL
        `)
    ]);
    const rows = rawRows.map(toStructureRow);
    const categories = rows.filter(row => row.type === "category");
    const subcategories = rows.filter(row => row.type === "subcategory");
    const categoriesById = new Map(categories.map(row => [Number(row.id), row]));
    const activeCategoriesByName = new Map();
    const activeSubcategoriesByParentAndName = new Map();
    const productCountByCategory = new Map();
    const productCountBySubcategory = new Map();
    const issues = [];

    categories.filter(row => row.isActive && !row.isSystem).forEach(row => {
        activeCategoriesByName.set(row.normalizedName, row);
    });
    subcategories.filter(row => row.isActive && !row.isSystem).forEach(row => {
        activeSubcategoriesByParentAndName.set(`${row.parentId}:${row.normalizedName}`, row);
    });

    products.forEach(product => {
        const normalizedCategory = normalizeCatalogStructureName(product.category);
        const category = activeCategoriesByName.get(normalizedCategory);
        if (category) {
            productCountByCategory.set(category.id, (productCountByCategory.get(category.id) || 0) + 1);
        }

        const normalizedSubcategory = normalizeCatalogStructureName(product.subcategory);
        if (category && normalizedSubcategory) {
            const subcategory = activeSubcategoriesByParentAndName.get(`${category.id}:${normalizedSubcategory}`);
            if (subcategory) {
                productCountBySubcategory.set(subcategory.id, (productCountBySubcategory.get(subcategory.id) || 0) + 1);
            }
        }
    });

    categories.forEach(category => {
        if (category.parentId) {
            addIssue(issues, {
                severity: "warning",
                code: "CATEGORY_HAS_PARENT",
                message: `Категория "${category.name}" ошибочно имеет parent_id.`,
                itemId: category.id,
                itemType: "category",
                itemName: category.name,
                parentId: category.parentId
            });
        }
        if (category.isActive && !productCountByCategory.get(category.id)) {
            addIssue(issues, {
                severity: "info",
                code: "EMPTY_CATEGORY",
                message: `В категории "${category.name}" нет товаров.`,
                itemId: category.id,
                itemType: "category",
                itemName: category.name
            });
        }
    });

    subcategories.forEach(subcategory => {
        const parent = categoriesById.get(Number(subcategory.parentId));
        if (!subcategory.parentId || !parent) {
            addIssue(issues, {
                severity: "critical",
                code: "SUBCATEGORY_WITHOUT_PARENT",
                message: `Подкатегория "${subcategory.name}" не привязана к существующей категории.`,
                itemId: subcategory.id,
                itemType: "subcategory",
                itemName: subcategory.name,
                parentId: subcategory.parentId
            });
            return;
        }
        if (!parent.isActive && subcategory.isActive) {
            addIssue(issues, {
                severity: "warning",
                code: "SUBCATEGORY_IN_INACTIVE_CATEGORY",
                message: `Подкатегория "${subcategory.name}" находится в неактивной категории "${parent.name}".`,
                itemId: subcategory.id,
                itemType: "subcategory",
                itemName: subcategory.name,
                parentId: parent.id,
                parentName: parent.name
            });
        }
        if (subcategory.isActive && !productCountBySubcategory.get(subcategory.id)) {
            addIssue(issues, {
                severity: "info",
                code: "EMPTY_SUBCATEGORY",
                message: `В подкатегории "${subcategory.name}" нет товаров.`,
                itemId: subcategory.id,
                itemType: "subcategory",
                itemName: subcategory.name,
                parentId: parent.id,
                parentName: parent.name
            });
        }
    });

    const categoryNames = new Map();
    categories.forEach(category => {
        if (!categoryNames.has(category.normalizedName)) categoryNames.set(category.normalizedName, []);
        categoryNames.get(category.normalizedName).push(category);
    });
    categoryNames.forEach(items => {
        if (items.length < 2) return;
        items.forEach(item => addIssue(issues, {
            severity: "warning",
            code: "DUPLICATE_CATEGORY_NAME",
            message: `Категория "${item.name}" имеет дубль после нормализации.`,
            itemId: item.id,
            itemType: "category",
            itemName: item.name
        }));
    });

    const subNamesByParent = new Map();
    subcategories.forEach(subcategory => {
        const key = `${subcategory.parentId}:${subcategory.normalizedName}`;
        if (!subNamesByParent.has(key)) subNamesByParent.set(key, []);
        subNamesByParent.get(key).push(subcategory);
    });
    subNamesByParent.forEach(items => {
        if (items.length < 2) return;
        items.forEach(item => addIssue(issues, {
            severity: "warning",
            code: "DUPLICATE_SUBCATEGORY_NAME",
            message: `Подкатегория "${item.name}" имеет дубль в своей категории.`,
            itemId: item.id,
            itemType: "subcategory",
            itemName: item.name,
            parentId: item.parentId
        }));
    });

    const suspiciousNames = new Map();
    subcategories.forEach(subcategory => {
        if (!suspiciousNames.has(subcategory.normalizedName)) suspiciousNames.set(subcategory.normalizedName, []);
        suspiciousNames.get(subcategory.normalizedName).push(subcategory);
    });
    suspiciousNames.forEach(items => {
        if (items.length < 2) return;
        items.forEach(item => {
            const parent = categoriesById.get(Number(item.parentId));
            addIssue(issues, {
                severity: "info",
                code: "SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES",
                message: `Подкатегория "${item.name}" встречается в нескольких категориях.`,
                itemId: item.id,
                itemType: "subcategory",
                itemName: item.name,
                parentId: item.parentId,
                parentName: parent?.name || ""
            });
        });
    });

    let productsWithoutStructure = 0;
    products.forEach(product => {
        const category = activeCategoriesByName.get(normalizeCatalogStructureName(product.category));
        const normalizedSubcategory = normalizeCatalogStructureName(product.subcategory);
        const subcategory = category && normalizedSubcategory
            ? activeSubcategoriesByParentAndName.get(`${category.id}:${normalizedSubcategory}`)
            : null;
        if (!category || (normalizedSubcategory && !subcategory)) {
            productsWithoutStructure += 1;
        }
    });

    if (productsWithoutStructure) {
        addIssue(issues, {
            severity: "warning",
            code: "PRODUCTS_WITHOUT_STRUCTURE",
            message: `Есть товары без активной связки category/subcategory в структуре: ${productsWithoutStructure}.`,
            itemType: "catalog",
            count: productsWithoutStructure
        });
    }

    const categoriesForTree = categories.map(category => ({
        ...category,
        productCount: productCountByCategory.get(category.id) || 0,
        subcategoryCount: subcategories.filter(item => Number(item.parentId) === Number(category.id)).length,
        issues: issues.filter(issue => issue.itemType === "category" && Number(issue.itemId) === Number(category.id)),
        subcategories: subcategories
            .filter(item => Number(item.parentId) === Number(category.id))
            .map(subcategory => ({
                ...subcategory,
                parentName: category.name,
                productCount: productCountBySubcategory.get(subcategory.id) || 0,
                issues: issues.filter(issue => issue.itemType === "subcategory" && Number(issue.itemId) === Number(subcategory.id))
            }))
    }));

    return {
        summary: {
            categories: categories.length,
            subcategories: subcategories.length,
            products: products.length,
            productsWithoutStructure,
            issues: issues.length,
            criticalIssues: issues.filter(issue => issue.severity === "critical").length,
            warnings: issues.filter(issue => issue.severity === "warning").length,
            inactiveItems: rows.filter(row => !row.isActive).length,
            duplicateIssues: issues.filter(issue => issue.code.includes("DUPLICATE")).length
        },
        categories: categoriesForTree,
        issues
    };
}

async function getPublicCatalogStructureTree(db) {
    const [structureRows, productRows] = await Promise.all([
        db.all(`
            SELECT id, type, name, normalized_name, external_code, parent_id, sort_order
            FROM catalog_structure
            WHERE is_active = 1
              AND COALESCE(is_system, 0) = 0
              AND type IN ('category', 'subcategory')
            ORDER BY sort_order ASC, id ASC
        `),
        db.all(`
            SELECT category, subcategory
            FROM products
            WHERE is_active = 1
              AND deleted_at IS NULL
        `)
    ]);
    const categories = [];
    const categoriesById = new Map();
    const categoriesByName = new Map();
    const categoriesWithProducts = new Set();
    const subcategoriesWithProducts = new Set();

    structureRows.filter(row => row.type === "category").forEach(row => {
        const category = {
            id: row.id,
            name: row.name,
            normalizedName: row.normalized_name,
            externalCode: row.external_code || "",
            subcategories: []
        };
        categoriesById.set(row.id, category);
        categoriesByName.set(row.normalized_name, category);
    });

    const subcategoriesByParentAndName = new Map();
    structureRows.filter(row => row.type === "subcategory").forEach(row => {
        const parent = categoriesById.get(row.parent_id);
        if (!parent) return;

        const subcategory = {
            id: row.id,
            name: row.name,
            normalizedName: row.normalized_name,
            externalCode: row.external_code || ""
        };
        parent.subcategories.push(subcategory);
        subcategoriesByParentAndName.set(`${row.parent_id}:${row.normalized_name}`, subcategory);
    });

    productRows.forEach(product => {
        const normalizedCategory = normalizeCatalogStructureName(product.category);
        const category = categoriesByName.get(normalizedCategory);
        if (!category) return;

        categoriesWithProducts.add(category.id);

        const normalizedSubcategory = normalizeCatalogStructureName(product.subcategory);
        if (!normalizedSubcategory) return;

        const subcategory = subcategoriesByParentAndName.get(`${category.id}:${normalizedSubcategory}`);
        if (subcategory) {
            subcategoriesWithProducts.add(subcategory.id);
        }
    });

    categoriesById.forEach(category => {
        if (!categoriesWithProducts.has(category.id)) return;

        categories.push({
            name: category.name,
            subcategories: category.subcategories
                .filter(subcategory => subcategoriesWithProducts.has(subcategory.id))
                .map(subcategory => ({ name: subcategory.name }))
        });
    });

    return categories;
}

module.exports = {
    normalizeCatalogStructureName,
    ensureCatalogStructureSchema,
    syncCatalogStructureFromProducts,
    getCatalogStructureTree,
    getPublicCatalogStructureTree,
    getCatalogStructureAudit,
    createCategory,
    createSubcategory,
    moveRootCategoryToIndex,
    getMoveSubcategoriesPreview,
    moveSubcategories,
    reorderStructureLevel,
    validateStructurePosition,
    validateProductStructureSelection
};
