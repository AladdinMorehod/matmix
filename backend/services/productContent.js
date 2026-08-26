const { get, all, withTransaction } = require("../database");
const { hasProductImageReference } = require("./productImageReferences");

const LIMITS = Object.freeze({
    brand: 160,
    shortDescription: 500,
    fullDescription: 12000,
    seoTitle: 160,
    seoDescription: 320,
    definitionCode: 80,
    definitionLabel: 160,
    unit: 40,
    section: 120,
    attributeText: 2000,
    altText: 500
});

function contentError(status, message, code) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

function text(value, max, field, { nullable = true } = {}) {
    const normalized = String(value ?? "").trim();
    if (!normalized) return nullable ? null : "";
    if (normalized.length > max) throw contentError(400, `${field}: максимум ${max} символов.`, "CONTENT_FIELD_TOO_LONG");
    return normalized;
}

function integer(value, field, fallback = 0) {
    if (value === undefined || value === null || value === "") return fallback;
    const normalized = Number(value);
    if (!Number.isSafeInteger(normalized)) throw contentError(400, `${field}: требуется целое число.`, "INVALID_INTEGER");
    return normalized;
}

function flag(value) {
    return value === true || value === 1 || value === "1" || value === "true" ? 1 : 0;
}

function positiveId(value, field = "id") {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) throw contentError(400, `${field}: некорректный идентификатор.`, "INVALID_ID");
    return id;
}

function normalizeDefinitionInput(input = {}, existing = null) {
    const rawCode = String(input.code ?? existing?.code ?? "").trim();
    if (!existing && !/^[a-z][a-z0-9_]{0,79}$/.test(rawCode)) {
        throw contentError(400, "Code должен быть в lower_snake_case и начинаться с буквы.", "INVALID_ATTRIBUTE_CODE");
    }
    if (existing && input.code !== undefined && rawCode !== existing.code) {
        throw contentError(400, "Code характеристики нельзя изменить после создания.", "ATTRIBUTE_CODE_READ_ONLY");
    }
    const dataType = String(input.dataType ?? input.data_type ?? existing?.data_type ?? "").trim();
    if (!existing && !["text", "number", "boolean"].includes(dataType)) {
        throw contentError(400, "Некорректный тип характеристики.", "INVALID_ATTRIBUTE_TYPE");
    }
    if (existing && input.dataType !== undefined && dataType !== existing.data_type) {
        throw contentError(400, "Тип характеристики нельзя изменить после создания.", "ATTRIBUTE_TYPE_READ_ONLY");
    }
    const label = text(input.label ?? existing?.label, LIMITS.definitionLabel, "Label", { nullable: false });
    if (!label) throw contentError(400, "Укажите label характеристики.", "ATTRIBUTE_LABEL_REQUIRED");
    return {
        code: rawCode,
        label,
        dataType,
        defaultUnit: text(input.defaultUnit ?? input.default_unit ?? existing?.default_unit, LIMITS.unit, "Unit"),
        defaultSection: text(input.defaultSection ?? input.default_section ?? existing?.default_section, LIMITS.section, "Section"),
        sortOrder: integer(input.sortOrder ?? input.sort_order, "Sort order", Number(existing?.sort_order) || 0),
        isActive: input.isActive === undefined && input.is_active === undefined
            ? Number(existing?.is_active ?? 1)
            : flag(input.isActive ?? input.is_active)
    };
}

function normalizeValue(definition, input = {}) {
    const raw = input.value;
    if (raw === undefined || raw === null || (definition.data_type !== "boolean" && String(raw).trim() === "")) return null;
    const normalized = {
        definitionId: definition.id,
        valueText: null,
        valueNumber: null,
        valueBoolean: null,
        unitOverride: text(input.unitOverride ?? input.unit_override, LIMITS.unit, "Unit"),
        sortOrder: integer(input.sortOrder ?? input.sort_order, "Sort order", Number(definition.template_sort_order ?? definition.sort_order) || 0)
    };
    if (definition.data_type === "text") {
        normalized.valueText = text(raw, LIMITS.attributeText, definition.label, { nullable: false });
    } else if (definition.data_type === "number") {
        const number = typeof raw === "number" ? raw : Number(String(raw).replace(",", "."));
        if (!Number.isFinite(number)) throw contentError(400, `${definition.label}: требуется число.`, "INVALID_ATTRIBUTE_VALUE");
        normalized.valueNumber = number;
    } else if (definition.data_type === "boolean") {
        if (![true, false, 1, 0, "1", "0", "true", "false"].includes(raw)) {
            throw contentError(400, `${definition.label}: требуется логическое значение.`, "INVALID_ATTRIBUTE_VALUE");
        }
        normalized.valueBoolean = flag(raw);
    }
    return normalized;
}

async function listDefinitions({ includeInactive = true } = {}, database = { all }) {
    const rows = await database.all(`SELECT id,code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at
        FROM product_attribute_definitions ${includeInactive ? "" : "WHERE is_active=1"}
        ORDER BY is_active DESC, sort_order, label, id`);
    return rows.map(row => ({
        id: row.id, code: row.code, label: row.label, dataType: row.data_type,
        defaultUnit: row.default_unit || "", defaultSection: row.default_section || "",
        sortOrder: Number(row.sort_order) || 0, isActive: Boolean(row.is_active)
    }));
}

async function createDefinition(input, database = { withTransaction }) {
    const value = normalizeDefinitionInput(input);
    try {
        return await database.withTransaction(async transaction => {
            const now = new Date().toISOString();
            const result = await transaction.run(`INSERT INTO product_attribute_definitions
                (code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?)`, [value.code, value.label, value.dataType, value.defaultUnit, value.defaultSection, value.sortOrder, value.isActive, now, now]);
            return transaction.get("SELECT * FROM product_attribute_definitions WHERE id=?", [result.id]);
        });
    } catch (error) {
        if (String(error?.message).includes("UNIQUE constraint failed")) throw contentError(409, "Definition с таким code уже существует.", "ATTRIBUTE_CODE_EXISTS");
        throw error;
    }
}

async function updateDefinition(idValue, input, database = { get, withTransaction }) {
    const id = positiveId(idValue);
    const existing = await database.get("SELECT * FROM product_attribute_definitions WHERE id=?", [id]);
    if (!existing) throw contentError(404, "Definition не найдена.", "ATTRIBUTE_DEFINITION_NOT_FOUND");
    const value = normalizeDefinitionInput(input, existing);
    return database.withTransaction(async transaction => {
        await transaction.run(`UPDATE product_attribute_definitions SET label=?,default_unit=?,default_section=?,sort_order=?,is_active=?,updated_at=? WHERE id=?`,
            [value.label, value.defaultUnit, value.defaultSection, value.sortOrder, value.isActive, new Date().toISOString(), id]);
        return transaction.get("SELECT * FROM product_attribute_definitions WHERE id=?", [id]);
    });
}

async function getTemplates(structureIdValue, database = { all }) {
    const structureId = positiveId(structureIdValue, "structureId");
    return database.all(`SELECT t.id,t.structure_id,t.attribute_definition_id,t.sort_order,t.is_required,t.unit_override,
            d.code,d.label,d.data_type,d.default_unit,d.default_section,d.is_active
        FROM product_attribute_templates t JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
        WHERE t.structure_id=? ORDER BY t.sort_order,d.sort_order,d.label`, [structureId]);
}

async function replaceTemplates(structureIdValue, items, database = { get, all, withTransaction }) {
    const structureId = positiveId(structureIdValue, "structureId");
    if (!Array.isArray(items) || items.length > 200) throw contentError(400, "Некорректный список templates.", "INVALID_ATTRIBUTE_TEMPLATES");
    const structure = await database.get("SELECT id,type FROM catalog_structure WHERE id=? AND is_active=1", [structureId]);
    if (!structure || structure.type !== "subcategory") throw contentError(400, "Templates назначаются только подкатегории.", "INVALID_TEMPLATE_STRUCTURE");
    const ids = items.map(item => positiveId(item.definitionId ?? item.attributeDefinitionId, "definitionId"));
    if (new Set(ids).size !== ids.length) throw contentError(409, "Definition нельзя назначить дважды.", "DUPLICATE_TEMPLATE_DEFINITION");
    const definitions = ids.length ? await database.all(`SELECT id,is_active FROM product_attribute_definitions WHERE id IN (${ids.map(() => "?").join(",")})`, ids) : [];
    if (definitions.length !== ids.length || definitions.some(item => !item.is_active)) throw contentError(400, "Выбрана отсутствующая или неактивная definition.", "INVALID_TEMPLATE_DEFINITION");
    return database.withTransaction(async transaction => {
        await transaction.run("DELETE FROM product_attribute_templates WHERE structure_id=?", [structureId]);
        const now = new Date().toISOString();
        for (const [index, item] of items.entries()) {
            await transaction.run(`INSERT INTO product_attribute_templates
                (structure_id,attribute_definition_id,sort_order,is_required,unit_override,created_at,updated_at) VALUES(?,?,?,?,?,?,?)`,
            [structureId, ids[index], integer(item.sortOrder, "Sort order", index), flag(item.isRequired), text(item.unitOverride, LIMITS.unit, "Unit"), now, now]);
        }
        return getTemplates(structureId, transaction);
    });
}

async function getProductContent(productIdValue, database = { get, all }) {
    const productId = positiveId(productIdValue, "productId");
    const product = await database.get(`SELECT id,external_id,title,brand,short_description,full_description,seo_title,seo_description,
        description,image_url,category,subcategory FROM products WHERE id=? AND deleted_at IS NULL`, [productId]);
    if (!product) throw contentError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
    const structure = await database.get(`SELECT s.id FROM catalog_structure s JOIN catalog_structure p ON p.id=s.parent_id
        WHERE s.type='subcategory' AND s.is_active=1 AND lower(trim(s.name))=lower(trim(?))
          AND lower(trim(p.name))=lower(trim(?)) ORDER BY s.id LIMIT 1`, [product.subcategory || "", product.category || ""]);
    const templateRows = structure ? await getTemplates(structure.id, database) : [];
    const values = await database.all(`SELECT v.id,v.attribute_definition_id,v.value_text,v.value_number,v.value_boolean,v.unit_override,v.sort_order,
            d.code,d.label,d.data_type,d.default_unit,d.default_section,d.is_active
        FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
        WHERE v.product_id=? ORDER BY v.sort_order,d.sort_order,d.label`, [productId]);
    const images = await database.all(`SELECT id,image_url,alt_text,sort_order,is_primary FROM product_images
        WHERE product_id=? ORDER BY is_primary DESC,sort_order,id`, [productId]);
    return {
        product: {
            id: product.id, externalId: product.external_id, brand: product.brand || "",
            shortDescription: product.short_description || "", fullDescription: product.full_description || "",
            seoTitle: product.seo_title || "", seoDescription: product.seo_description || "",
            legacyDescription: product.description || "", imageUrl: product.image_url || ""
        },
        structureId: structure?.id || null,
        templates: templateRows.map(row => ({
            definitionId: row.attribute_definition_id, code: row.code, label: row.label, dataType: row.data_type,
            unit: row.unit_override || row.default_unit || "", section: row.default_section || "",
            sortOrder: Number(row.sort_order) || 0, isRequired: Boolean(row.is_required), isActive: Boolean(row.is_active)
        })),
        values: values.map(row => ({
            id: row.id, definitionId: row.attribute_definition_id, code: row.code, label: row.label, dataType: row.data_type,
            value: row.data_type === "text" ? row.value_text : row.data_type === "number" ? row.value_number : Boolean(row.value_boolean),
            unit: row.unit_override || row.default_unit || "", section: row.default_section || "", sortOrder: Number(row.sort_order) || 0,
            isActive: Boolean(row.is_active)
        })),
        images: images.map(row => ({ id: row.id, imageUrl: row.image_url, altText: row.alt_text || "", sortOrder: Number(row.sort_order) || 0, isPrimary: Boolean(row.is_primary) }))
    };
}

async function updateProductContent(productIdValue, input = {}, database = { get, all, withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    const existing = await database.get("SELECT id FROM products WHERE id=? AND deleted_at IS NULL", [productId]);
    if (!existing) throw contentError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
    const fields = {
        brand: text(input.brand, LIMITS.brand, "Brand"),
        shortDescription: text(input.shortDescription ?? input.short_description, LIMITS.shortDescription, "Короткое описание"),
        fullDescription: text(input.fullDescription ?? input.full_description, LIMITS.fullDescription, "Полное описание"),
        seoTitle: text(input.seoTitle ?? input.seo_title, LIMITS.seoTitle, "SEO title"),
        seoDescription: text(input.seoDescription ?? input.seo_description, LIMITS.seoDescription, "SEO description")
    };
    const valuesInput = input.attributes ?? input.values ?? [];
    if (!Array.isArray(valuesInput) || valuesInput.length > 300) throw contentError(400, "Некорректный список характеристик.", "INVALID_ATTRIBUTE_VALUES");
    const ids = valuesInput.map(item => positiveId(item.definitionId, "definitionId"));
    if (new Set(ids).size !== ids.length) throw contentError(409, "Характеристика указана дважды.", "DUPLICATE_ATTRIBUTE_VALUE");
    const definitions = ids.length ? await database.all(`SELECT * FROM product_attribute_definitions WHERE id IN (${ids.map(() => "?").join(",")})`, ids) : [];
    if (definitions.length !== ids.length) throw contentError(400, "Неизвестная definition.", "INVALID_ATTRIBUTE_DEFINITION");
    const byId = new Map(definitions.map(item => [item.id, item]));
    const values = valuesInput.map(item => normalizeValue(byId.get(Number(item.definitionId)), item)).filter(Boolean);
    return database.withTransaction(async transaction => {
        const now = new Date().toISOString();
        await transaction.run(`UPDATE products SET brand=?,short_description=?,full_description=?,seo_title=?,seo_description=?,updated_at=? WHERE id=?`,
            [fields.brand, fields.shortDescription, fields.fullDescription, fields.seoTitle, fields.seoDescription, now, productId]);
        await transaction.run("DELETE FROM product_attribute_values WHERE product_id=?", [productId]);
        for (const value of values) {
            await transaction.run(`INSERT INTO product_attribute_values
                (product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?)`, [productId, value.definitionId, value.valueText, value.valueNumber, value.valueBoolean, value.unitOverride, value.sortOrder, now, now]);
        }
        return getProductContent(productId, transaction);
    });
}

async function addGalleryImage(productIdValue, imageUrl, altTextValue = "", database = { get, withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    const url = text(imageUrl, 2048, "Image URL", { nullable: false });
    const altText = text(altTextValue, LIMITS.altText, "Alt text");
    return database.withTransaction(async transaction => {
        const product = await transaction.get("SELECT id,image_url FROM products WHERE id=? AND deleted_at IS NULL", [productId]);
        if (!product) throw contentError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
        const primary = await transaction.get("SELECT id FROM product_images WHERE product_id=? AND is_primary=1", [productId]);
        const next = await transaction.get("SELECT COALESCE(MAX(sort_order),-1)+1 value FROM product_images WHERE product_id=?", [productId]);
        const isPrimary = primary ? 0 : 1;
        const now = new Date().toISOString();
        const result = await transaction.run(`INSERT INTO product_images(product_id,image_url,alt_text,sort_order,is_primary,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?)`, [productId, url, altText, Number(next.value) || 0, isPrimary, now, now]);
        if (isPrimary) await transaction.run("UPDATE products SET image_url=?,updated_at=? WHERE id=?", [url, now, productId]);
        return transaction.get("SELECT * FROM product_images WHERE id=?", [result.id]);
    });
}

async function replacePrimaryImage(productIdValue, imageUrl, database = { withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    const url = text(imageUrl, 2048, "Image URL", { nullable: false });
    return database.withTransaction(async transaction => {
        const product = await transaction.get("SELECT id,image_url FROM products WHERE id=? AND deleted_at IS NULL", [productId]);
        if (!product) throw contentError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
        const primary = await transaction.get("SELECT id,image_url FROM product_images WHERE product_id=? AND is_primary=1", [productId]);
        const now = new Date().toISOString();
        if (primary) {
            await transaction.run("UPDATE product_images SET image_url=?,updated_at=? WHERE id=?", [url, now, primary.id]);
        } else {
            await transaction.run(`INSERT INTO product_images(product_id,image_url,sort_order,is_primary,created_at,updated_at)
                VALUES(?,?,0,1,?,?)`, [productId, url, now, now]);
        }
        await transaction.run("UPDATE products SET image_url=?,updated_at=? WHERE id=?", [url, now, productId]);
        return { previousImageUrl: primary?.image_url || product.image_url || null, imageUrl: url };
    });
}

async function replacePrimaryImages(productIdsValue, imageUrl, database = { withTransaction }) {
    if (!Array.isArray(productIdsValue) || !productIdsValue.length || productIdsValue.length > 10000) {
        throw contentError(400, "Некорректный список товаров.", "INVALID_PRODUCT_IDS");
    }
    const productIds = [...new Set(productIdsValue.map(id => positiveId(id, "productId")))];
    const url = text(imageUrl, 2048, "Image URL", { nullable: false });
    return database.withTransaction(async transaction => {
        const placeholders = productIds.map(() => "?").join(",");
        const products = await transaction.all(`SELECT id,image_url FROM products WHERE id IN (${placeholders}) AND deleted_at IS NULL`, productIds);
        if (products.length !== productIds.length) throw contentError(409, "Состав товаров изменился.", "STALE_PRODUCT_SET");
        const now = new Date().toISOString();
        for (const product of products) {
            const primary = await transaction.get("SELECT id FROM product_images WHERE product_id=? AND is_primary=1", [product.id]);
            if (primary) await transaction.run("UPDATE product_images SET image_url=?,updated_at=? WHERE id=?", [url, now, primary.id]);
            else await transaction.run(`INSERT INTO product_images(product_id,image_url,sort_order,is_primary,created_at,updated_at) VALUES(?,?,0,1,?,?)`, [product.id, url, now, now]);
        }
        await transaction.run(`UPDATE products SET image_url=?,updated_at=? WHERE id IN (${placeholders})`, [url, now, ...productIds]);
        return { updated: products.length, previousImageUrls: [...new Set(products.map(product => product.image_url).filter(Boolean))] };
    });
}

async function clearPrimaryImage(productIdValue, database = { withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    return database.withTransaction(async transaction => {
        const product = await transaction.get("SELECT id,image_url FROM products WHERE id=? AND deleted_at IS NULL", [productId]);
        if (!product) throw contentError(404, "Товар не найден.", "PRODUCT_NOT_FOUND");
        const primary = await transaction.get("SELECT * FROM product_images WHERE product_id=? AND is_primary=1", [productId]);
        const now = new Date().toISOString();
        if (primary) await transaction.run("DELETE FROM product_images WHERE id=?", [primary.id]);
        const next = await transaction.get("SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order,id LIMIT 1", [productId]);
        if (next) await transaction.run("UPDATE product_images SET is_primary=1,updated_at=? WHERE id=?", [now, next.id]);
        await transaction.run("UPDATE products SET image_url=?,updated_at=? WHERE id=?", [next?.image_url || null, now, productId]);
        return { removedImageUrl: primary?.image_url || product.image_url || null, primaryImageUrl: next?.image_url || null };
    });
}

async function updateGalleryImage(productIdValue, imageIdValue, input = {}, database = { withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    const imageId = positiveId(imageIdValue, "imageId");
    return database.withTransaction(async transaction => {
        const image = await transaction.get("SELECT * FROM product_images WHERE id=? AND product_id=?", [imageId, productId]);
        if (!image) throw contentError(404, "Изображение не найдено.", "PRODUCT_IMAGE_NOT_FOUND");
        const now = new Date().toISOString();
        if (input.isPrimary === true || input.is_primary === true) {
            await transaction.run("UPDATE product_images SET is_primary=0,updated_at=? WHERE product_id=? AND is_primary=1", [now, productId]);
            await transaction.run("UPDATE product_images SET is_primary=1,updated_at=? WHERE id=?", [now, imageId]);
            await transaction.run("UPDATE products SET image_url=?,updated_at=? WHERE id=?", [image.image_url, now, productId]);
        }
        if (input.altText !== undefined || input.alt_text !== undefined) {
            await transaction.run("UPDATE product_images SET alt_text=?,updated_at=? WHERE id=?", [text(input.altText ?? input.alt_text, LIMITS.altText, "Alt text"), now, imageId]);
        }
        return transaction.get("SELECT * FROM product_images WHERE id=?", [imageId]);
    });
}

async function reorderGallery(productIdValue, imageIds, database = { all, withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    if (!Array.isArray(imageIds) || imageIds.length > 100) throw contentError(400, "Некорректный порядок изображений.", "INVALID_IMAGE_ORDER");
    const ids = imageIds.map(id => positiveId(id, "imageId"));
    if (new Set(ids).size !== ids.length) throw contentError(400, "Изображение указано дважды.", "INVALID_IMAGE_ORDER");
    const existing = await database.all("SELECT id FROM product_images WHERE product_id=? ORDER BY id", [productId]);
    if (existing.length !== ids.length || existing.some(row => !ids.includes(row.id))) throw contentError(409, "Состав галереи изменился. Обновите форму.", "STALE_IMAGE_ORDER");
    return database.withTransaction(async transaction => {
        const now = new Date().toISOString();
        for (const [index, id] of ids.entries()) await transaction.run("UPDATE product_images SET sort_order=?,updated_at=? WHERE id=? AND product_id=?", [index, now, id, productId]);
        return transaction.all("SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order,id", [productId]);
    });
}

async function removeGalleryImage(productIdValue, imageIdValue, database = { withTransaction }) {
    const productId = positiveId(productIdValue, "productId");
    const imageId = positiveId(imageIdValue, "imageId");
    return database.withTransaction(async transaction => {
        const image = await transaction.get("SELECT * FROM product_images WHERE id=? AND product_id=?", [imageId, productId]);
        if (!image) throw contentError(404, "Изображение не найдено.", "PRODUCT_IMAGE_NOT_FOUND");
        await transaction.run("DELETE FROM product_images WHERE id=?", [imageId]);
        const now = new Date().toISOString();
        let nextPrimary = await transaction.get("SELECT * FROM product_images WHERE product_id=? AND is_primary=1", [productId]);
        if (image.is_primary && !nextPrimary) {
            nextPrimary = await transaction.get("SELECT * FROM product_images WHERE product_id=? ORDER BY sort_order,id LIMIT 1", [productId]);
            if (nextPrimary) await transaction.run("UPDATE product_images SET is_primary=1,updated_at=? WHERE id=?", [now, nextPrimary.id]);
        }
        await transaction.run("UPDATE products SET image_url=?,updated_at=? WHERE id=?", [nextPrimary?.image_url || null, now, productId]);
        return { removedImageUrl: image.image_url, primaryImageUrl: nextPrimary?.image_url || null };
    });
}

async function imageReferenceCount(imageUrl, database = { all }) {
    return await hasProductImageReference(database, imageUrl) ? 1 : 0;
}

module.exports = {
    LIMITS,
    contentError,
    listDefinitions,
    createDefinition,
    updateDefinition,
    getTemplates,
    replaceTemplates,
    getProductContent,
    updateProductContent,
    addGalleryImage,
    replacePrimaryImage,
    replacePrimaryImages,
    clearPrimaryImage,
    updateGalleryImage,
    reorderGallery,
    removeGalleryImage,
    imageReferenceCount
};
