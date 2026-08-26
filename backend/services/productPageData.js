function attributeValue(row) {
    if (row.data_type === "number") return row.value_number;
    if (row.data_type === "boolean") return Boolean(row.value_boolean);
    return row.value_text;
}

async function getProductPageDataByExternalId(externalId, executor = null) {
    const database = executor || require("../database");
    const code = String(externalId || "").trim();
    if (!code || code.length > 160) return null;

    const product = await database.get(`SELECT
        id, external_id, title, slug, category, subcategory, product_group,
        price, weight, unit, image, image_url, description, brand,
        short_description, full_description, seo_title, seo_description,
        is_active, sort_order, created_at, updated_at
        FROM products
        WHERE is_active=1 AND deleted_at IS NULL AND UPPER(external_id)=UPPER(?)`, [code]);
    if (!product) return null;

    const [attributeRows, imageRows] = await Promise.all([
        database.all(`SELECT
            value.id, definition.code, definition.label, definition.data_type,
            CASE WHEN value.unit_override IS NOT NULL THEN value.unit_override ELSE definition.default_unit END AS unit,
            definition.default_section AS section,
            value.value_text, value.value_number, value.value_boolean,
            value.sort_order, definition.sort_order AS definition_sort_order
            FROM product_attribute_values value
            JOIN product_attribute_definitions definition ON definition.id=value.attribute_definition_id
            WHERE value.product_id=?
            ORDER BY value.sort_order, definition.sort_order, definition.id`, [product.id]),
        database.all(`SELECT id, image_url, alt_text, sort_order, is_primary, created_at, updated_at
            FROM product_images
            WHERE product_id=?
            ORDER BY is_primary DESC, sort_order, id`, [product.id])
    ]);

    const images = imageRows.slice();
    if (!images.length && String(product.image_url || "").trim()) {
        images.push({
            id: null,
            image_url: product.image_url,
            alt_text: product.title,
            sort_order: 0,
            is_primary: 1,
            compatibilityFallback: true
        });
    }

    return {
        product,
        attributes: attributeRows.map(row => ({
            id: row.id,
            code: row.code,
            label: row.label,
            type: row.data_type,
            value: attributeValue(row),
            unit: row.unit || "",
            section: row.section || "",
            sortOrder: Number(row.sort_order) || 0
        })),
        images
    };
}

module.exports = { getProductPageDataByExternalId };
