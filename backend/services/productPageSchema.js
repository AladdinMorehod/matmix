const PRODUCT_PAGE_INDEXES = Object.freeze([
    "idx_product_attribute_values_product_id",
    "idx_product_attribute_templates_structure_order",
    "idx_product_images_product_order",
    "idx_product_images_product_primary",
    "idx_product_images_one_primary"
]);

const PRODUCT_PAGE_TABLES = Object.freeze([
    "product_attribute_definitions",
    "product_attribute_templates",
    "product_attribute_values",
    "product_images"
]);

async function ensureProductPageSchema(db) {
    for (const [name, definition] of [
        ["brand", "TEXT"],
        ["short_description", "TEXT"],
        ["full_description", "TEXT"],
        ["seo_title", "TEXT"],
        ["seo_description", "TEXT"]
    ]) {
        await db.ensureColumn("products", name, definition);
    }

    await db.run(`CREATE TABLE IF NOT EXISTS product_attribute_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE CHECK (
            length(code) BETWEEN 1 AND 80
            AND code = lower(code)
            AND code GLOB '[a-z]*'
            AND code NOT GLOB '*[^a-z0-9_]*'
        ),
        label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 160),
        data_type TEXT NOT NULL CHECK (data_type IN ('text','number','boolean')),
        default_unit TEXT CHECK (default_unit IS NULL OR length(trim(default_unit)) BETWEEN 1 AND 40),
        default_section TEXT CHECK (default_section IS NULL OR length(trim(default_section)) BETWEEN 1 AND 120),
        sort_order INTEGER NOT NULL DEFAULT 0 CHECK (typeof(sort_order) = 'integer'),
        is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
        created_at TEXT,
        updated_at TEXT
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS product_attribute_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        structure_id INTEGER NOT NULL,
        attribute_definition_id INTEGER NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0 CHECK (typeof(sort_order) = 'integer'),
        is_required INTEGER NOT NULL DEFAULT 0 CHECK (is_required IN (0,1)),
        unit_override TEXT CHECK (unit_override IS NULL OR length(trim(unit_override)) BETWEEN 1 AND 40),
        created_at TEXT,
        updated_at TEXT,
        UNIQUE (structure_id, attribute_definition_id),
        FOREIGN KEY (structure_id) REFERENCES catalog_structure(id) ON DELETE CASCADE,
        FOREIGN KEY (attribute_definition_id) REFERENCES product_attribute_definitions(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS product_attribute_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        attribute_definition_id INTEGER NOT NULL,
        value_text TEXT,
        value_number REAL,
        value_boolean INTEGER,
        unit_override TEXT CHECK (unit_override IS NULL OR length(trim(unit_override)) BETWEEN 1 AND 40),
        sort_order INTEGER NOT NULL DEFAULT 0 CHECK (typeof(sort_order) = 'integer'),
        created_at TEXT,
        updated_at TEXT,
        UNIQUE (product_id, attribute_definition_id),
        CHECK (
            (value_text IS NOT NULL) + (value_number IS NOT NULL) + (value_boolean IS NOT NULL) = 1
            AND (value_text IS NULL OR length(trim(value_text)) BETWEEN 1 AND 2000)
            AND (value_number IS NULL OR typeof(value_number) IN ('integer','real'))
            AND (value_boolean IS NULL OR value_boolean IN (0,1))
        ),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (attribute_definition_id) REFERENCES product_attribute_definitions(id)
    )`);

    await db.run(`CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL CHECK (length(trim(image_url)) BETWEEN 1 AND 2048),
        alt_text TEXT CHECK (alt_text IS NULL OR length(trim(alt_text)) BETWEEN 1 AND 500),
        sort_order INTEGER NOT NULL DEFAULT 0 CHECK (typeof(sort_order) = 'integer'),
        is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`);

    await db.run("CREATE INDEX IF NOT EXISTS idx_product_attribute_values_product_id ON product_attribute_values(product_id)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_product_attribute_templates_structure_order ON product_attribute_templates(structure_id, sort_order)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_product_images_product_order ON product_images(product_id, sort_order)");
    await db.run("CREATE INDEX IF NOT EXISTS idx_product_images_product_primary ON product_images(product_id, is_primary)");
    await db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_primary ON product_images(product_id) WHERE is_primary=1");
}

async function backfillPrimaryProductImages(db) {
    await db.run(`INSERT INTO product_images (
        product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at
    )
    SELECT p.id, trim(p.image_url), NULL, 0, 1, NULL, NULL
    FROM products p
    WHERE p.image_url IS NOT NULL
      AND trim(p.image_url) <> ''
      AND NOT EXISTS (
          SELECT 1 FROM product_images image
          WHERE image.product_id = p.id AND image.is_primary = 1
      )`);
}

module.exports = {
    PRODUCT_PAGE_INDEXES,
    PRODUCT_PAGE_TABLES,
    ensureProductPageSchema,
    backfillPrimaryProductImages
};
