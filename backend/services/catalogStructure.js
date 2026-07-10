function normalizeCatalogStructureName(value) {
    return String(value || "")
        .trim()
        .replace(/ё/g, "е")
        .replace(/Ё/g, "е")
        .toLowerCase()
        .replace(/\s*-\s*/g, " - ")
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
            parent_id INTEGER NULL REFERENCES catalog_structure(id),
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    `);

    await ensureColumn(db, "catalog_structure", "type", "TEXT");
    await ensureColumn(db, "catalog_structure", "name", "TEXT");
    await ensureColumn(db, "catalog_structure", "normalized_name", "TEXT");
    await ensureColumn(db, "catalog_structure", "parent_id", "INTEGER");
    await ensureColumn(db, "catalog_structure", "sort_order", "INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(db, "catalog_structure", "is_active", "INTEGER NOT NULL DEFAULT 1");
    await ensureColumn(db, "catalog_structure", "created_at", "TEXT");
    await ensureColumn(db, "catalog_structure", "updated_at", "TEXT");

    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_type ON catalog_structure(type)");
    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_parent_id ON catalog_structure(parent_id)");
    await run("CREATE INDEX IF NOT EXISTS idx_catalog_structure_sort_order ON catalog_structure(sort_order)");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_structure_category_unique ON catalog_structure(normalized_name) WHERE type = 'category'");
    await run("CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_structure_subcategory_unique ON catalog_structure(parent_id, normalized_name) WHERE type = 'subcategory'");
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
        "SELECT * FROM catalog_structure WHERE type = 'category' AND normalized_name = ? LIMIT 1",
        [normalizedName]
    );
}

async function findSubcategory(db, parentId, normalizedName) {
    return db.get(
        "SELECT * FROM catalog_structure WHERE type = 'subcategory' AND parent_id = ? AND normalized_name = ? LIMIT 1",
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
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [type, name, normalizedName, parentId, sortOrder, 1, now, now]
    );

    return {
        id: result.id,
        type,
        name,
        normalized_name: normalizedName,
        parent_id: parentId,
        sort_order: sortOrder,
        is_active: 1,
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

    if (row.type === "subcategory") {
        item.parentId = row.parent_id;
    }

    return item;
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
        "SELECT * FROM catalog_structure WHERE id = ? AND type = ? AND is_active = 1 LIMIT 1",
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
        "SELECT * FROM catalog_structure WHERE id = ? AND type = 'category' AND is_active = 1 LIMIT 1",
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
        throw createStructureError(409, "Подкатегория с таким названием уже существует в выбранной категории.");
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
    if (!categoryRow || !categoryRow.is_active) {
        return "Выберите категорию из списка.";
    }

    if (!subcategory) {
        return "";
    }

    const subcategoryRow = await findSubcategory(db, categoryRow.id, normalizeCatalogStructureName(subcategory));
    if (!subcategoryRow || !subcategoryRow.is_active) {
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
        SELECT id, type, name, parent_id, sort_order
        FROM catalog_structure
        WHERE is_active = 1
          AND type IN ('category', 'subcategory')
        ORDER BY sort_order ASC, id ASC
    `);
    const categories = [];
    const categoriesById = new Map();

    rows.filter(row => row.type === "category").forEach(row => {
        const category = {
            id: row.id,
            name: row.name,
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
            sortOrder: Number(row.sort_order) || 0
        });
    });

    return categories;
}

module.exports = {
    normalizeCatalogStructureName,
    ensureCatalogStructureSchema,
    syncCatalogStructureFromProducts,
    getCatalogStructureTree,
    createCategory,
    createSubcategory,
    reorderStructureLevel,
    validateStructurePosition,
    validateProductStructureSelection
};
