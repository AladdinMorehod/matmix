const { withTransaction } = require("../database");
const {
    normalizeCatalogStructureName,
    validateProductStructureSelection
} = require("./catalogStructure");
const { validateProductGroupInput } = require("./productStructureValidation");

const productStructureBulkLimit = 500;
const productLoadChunkSize = 400;
const supportedChangeFields = new Set(["category", "subcategory", "productGroup", "product_group"]);

function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

class ProductBulkStructureError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "ProductBulkStructureError";
        this.code = code;
        this.details = details;
    }
}

function fail(code, message, details) {
    throw new ProductBulkStructureError(code, message, details);
}

function parseBulkProductStructureRequest(body = {}) {
    if (!Array.isArray(body.productIds) || !body.productIds.length) {
        fail("PRODUCT_IDS_REQUIRED", "Передайте непустой массив productIds.");
    }

    const invalidIds = body.productIds.filter(id => !Number.isInteger(id) || id <= 0);
    if (invalidIds.length) {
        fail("INVALID_PRODUCT_IDS", "Все productIds должны быть положительными целыми числами.");
    }

    if (body.productIds.length > productStructureBulkLimit) {
        fail(
            "PRODUCT_BATCH_LIMIT_EXCEEDED",
            `За одну операцию можно изменить не более ${productStructureBulkLimit} товаров.`
        );
    }
    const productIds = [...new Set(body.productIds)];

    const changes = body.changes;
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
        fail("PRODUCT_CHANGES_REQUIRED", "Передайте объект changes.");
    }

    const unknownFields = Object.keys(changes).filter(field => !supportedChangeFields.has(field));
    if (unknownFields.length) {
        fail("UNKNOWN_PRODUCT_CHANGE_FIELDS", `Неподдерживаемые поля: ${unknownFields.join(", ")}.`);
    }

    const hasCategory = Object.prototype.hasOwnProperty.call(changes, "category");
    const hasSubcategory = Object.prototype.hasOwnProperty.call(changes, "subcategory");
    const hasCamelGroup = Object.prototype.hasOwnProperty.call(changes, "productGroup");
    const hasSnakeGroup = Object.prototype.hasOwnProperty.call(changes, "product_group");
    if (!hasCategory && !hasSubcategory && !hasCamelGroup && !hasSnakeGroup) {
        fail("PRODUCT_CHANGES_REQUIRED", "Выберите хотя бы одно поле структуры для изменения.");
    }
    if (hasCamelGroup && hasSnakeGroup) {
        fail("AMBIGUOUS_PRODUCT_GROUP", "Передайте группу только в одном формате имени поля.");
    }

    for (const field of ["category", "subcategory"]) {
        if (Object.prototype.hasOwnProperty.call(changes, field) && typeof changes[field] !== "string") {
            fail("INVALID_PRODUCT_STRUCTURE_FIELD", `Поле ${field} должно быть строкой.`);
        }
    }

    const normalizedChanges = {};
    if (hasCategory) normalizedChanges.category = normalizeText(changes.category);
    if (hasSubcategory) normalizedChanges.subcategory = normalizeText(changes.subcategory);
    if (hasCamelGroup || hasSnakeGroup) {
        const groupInput = hasCamelGroup
            ? { productGroup: changes.productGroup }
            : { product_group: changes.product_group };
        const validationMessage = validateProductGroupInput(groupInput);
        if (validationMessage) fail("INVALID_PRODUCT_GROUP", validationMessage);

        normalizedChanges.productGroup = normalizeText(hasCamelGroup ? changes.productGroup : changes.product_group);
        if (!normalizedChanges.productGroup && body.allowClearProductGroup !== true) {
            fail(
                "PRODUCT_GROUP_CLEAR_CONFIRMATION_REQUIRED",
                "Для массовой очистки группы требуется allowClearProductGroup: true."
            );
        }
    }

    return { productIds, changes: normalizedChanges };
}

function createProductBulkStructureService({
    runTransaction = withTransaction,
    validateStructure = validateProductStructureSelection,
    now = () => new Date().toISOString()
} = {}) {
    return async function bulkUpdateProductStructure(body = {}) {
        const { productIds, changes } = parseBulkProductStructureRequest(body);
        let transactionResult;
        try {
            transactionResult = await runTransaction(async transaction => {
            const existingProducts = [];
            for (let offset = 0; offset < productIds.length; offset += productLoadChunkSize) {
                const chunk = productIds.slice(offset, offset + productLoadChunkSize);
                const placeholders = chunk.map(() => "?").join(",");
                existingProducts.push(...await transaction.all(
                    `SELECT id, category, subcategory, product_group
                     FROM products
                     WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
                    chunk
                ));
            }

            const existingById = new Map(existingProducts.map(product => [Number(product.id), product]));
            const missingProductIds = productIds.filter(id => !existingById.has(id));
            if (missingProductIds.length) {
                fail(
                    "BULK_PRODUCTS_NOT_FOUND",
                    "Часть выбранных товаров не найдена.",
                    { missingProductIds, requestedCount: productIds.length }
                );
            }

            const finalStructures = productIds.map(id => {
                const product = existingById.get(id);
                return {
                    id,
                    category: Object.prototype.hasOwnProperty.call(changes, "category")
                        ? changes.category
                        : normalizeText(product.category),
                    subcategory: Object.prototype.hasOwnProperty.call(changes, "subcategory")
                        ? changes.subcategory
                        : normalizeText(product.subcategory),
                    productGroup: Object.prototype.hasOwnProperty.call(changes, "productGroup")
                        ? changes.productGroup
                        : normalizeText(product.product_group)
                };
            });

            const uniqueStructures = new Map();
            for (const structure of finalStructures) {
                const key = `${normalizeCatalogStructureName(structure.category)}\u0000${normalizeCatalogStructureName(structure.subcategory)}`;
                if (!uniqueStructures.has(key)) uniqueStructures.set(key, structure);
            }
            for (const structure of uniqueStructures.values()) {
                const validationMessage = await validateStructure(transaction, structure);
                if (validationMessage) {
                    const affectedProductIds = finalStructures
                        .filter(candidate =>
                            normalizeCatalogStructureName(candidate.category) === normalizeCatalogStructureName(structure.category)
                            && normalizeCatalogStructureName(candidate.subcategory) === normalizeCatalogStructureName(structure.subcategory))
                        .map(candidate => candidate.id);
                    fail(
                        "INVALID_FINAL_PRODUCT_STRUCTURE",
                        validationMessage,
                        { affectedProductIds, requestedCount: productIds.length }
                    );
                }
            }

            const updateFields = [
                ...(Object.prototype.hasOwnProperty.call(changes, "category") ? ["category = ?"] : []),
                ...(Object.prototype.hasOwnProperty.call(changes, "subcategory") ? ["subcategory = ?"] : []),
                ...(Object.prototype.hasOwnProperty.call(changes, "productGroup") ? ["product_group = ?"] : [])
            ];
            const getUpdateValues = structure => [
                ...(Object.prototype.hasOwnProperty.call(changes, "category") ? [structure.category] : []),
                ...(Object.prototype.hasOwnProperty.call(changes, "subcategory") ? [structure.subcategory] : []),
                ...(Object.prototype.hasOwnProperty.call(changes, "productGroup") ? [structure.productGroup] : [])
            ];
            const updatedAt = now();
            const sql = `UPDATE products SET ${updateFields.join(", ")}, updated_at = ? WHERE id = ? AND deleted_at IS NULL`;

            let updatedCount = 0;
            for (const structure of finalStructures) {
                const updateResult = await transaction.run(
                    sql,
                    [...getUpdateValues(structure), updatedAt, structure.id]
                );
                if (Number(updateResult.changes) !== 1) {
                    fail(
                        "BULK_PRODUCT_UPDATE_CONFLICT",
                        `Товар ${structure.id} не был обновлён.`
                    );
                }
                updatedCount += 1;
            }

                return { updatedCount, updatedAt };
            });
        } catch (error) {
            error.bulkStructureContext = { productIds, changes };
            throw error;
        }

        return {
            success: true,
            requestedCount: productIds.length,
            updatedCount: transactionResult.updatedCount,
            updatedProductIds: productIds,
            appliedChanges: changes,
            updatedAt: transactionResult.updatedAt
        };
    };
}

const bulkUpdateProductStructure = createProductBulkStructureService();

module.exports = {
    ProductBulkStructureError,
    productStructureBulkLimit,
    parseBulkProductStructureRequest,
    createProductBulkStructureService,
    bulkUpdateProductStructure
};
