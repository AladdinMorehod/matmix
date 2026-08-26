const PRODUCT_IMAGE_URL_PREFIX = "/uploads/products/";
const PRODUCT_IMAGE_URL_PATTERN = /^\/uploads\/products\/([A-Za-z0-9][A-Za-z0-9._-]*)$/;

function normalizeProductImageReference(value) {
    const imageUrl = String(value ?? "").trim();
    const match = PRODUCT_IMAGE_URL_PATTERN.exec(imageUrl);
    return match ? { imageUrl, filename: match[1] } : null;
}

async function hasProductImagesTable(database) {
    const rows = await database.all("SELECT name FROM sqlite_master WHERE type='table' AND name='product_images'");
    return rows.length === 1;
}

async function collectProductImageReferences(database) {
    const productRows = await database.all(`SELECT id product_id,external_id,image_url,is_active,'products' source
        FROM products WHERE image_url IS NOT NULL AND length(trim(image_url))>0`);
    const galleryRows = await hasProductImagesTable(database)
        ? await database.all(`SELECT image.product_id,product.external_id,image.image_url,product.is_active,'product_images' source
            FROM product_images image JOIN products product ON product.id=image.product_id
            WHERE image.image_url IS NOT NULL AND length(trim(image.image_url))>0`)
        : [];
    const references = new Map();
    for (const row of [...productRows, ...galleryRows]) {
        const imageUrl = String(row.image_url || "").trim();
        const key = `${Number(row.product_id)}\u0000${imageUrl}`;
        const existing = references.get(key);
        if (existing) {
            existing.sources.add(row.source);
            continue;
        }
        references.set(key, {
            productId: Number(row.product_id),
            externalId: row.external_id || "",
            imageUrl,
            isActive: Number(row.is_active) === 1,
            sources: new Set([row.source])
        });
    }
    return [...references.values()].map(reference => ({ ...reference, sources: [...reference.sources].sort() }));
}

async function hasProductImageReference(database, value) {
    const normalized = normalizeProductImageReference(value);
    if (!normalized) return false;
    const productRows = await database.all("SELECT id FROM products WHERE trim(image_url)=? LIMIT 1", [normalized.imageUrl]);
    if (productRows.length) return true;
    if (!await hasProductImagesTable(database)) return false;
    const galleryRows = await database.all("SELECT id FROM product_images WHERE trim(image_url)=? LIMIT 1", [normalized.imageUrl]);
    return galleryRows.length > 0;
}

module.exports = {
    PRODUCT_IMAGE_URL_PREFIX,
    normalizeProductImageReference,
    hasProductImagesTable,
    collectProductImageReferences,
    hasProductImageReference
};
