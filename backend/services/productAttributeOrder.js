const ordering = require("../../public/js/attribute-order");

async function getOrderingContext(product, database) {
    const structure = await database.get(`SELECT s.id FROM catalog_structure s JOIN catalog_structure p ON p.id=s.parent_id
        WHERE s.type='subcategory' AND s.is_active=1 AND lower(trim(s.name))=lower(trim(?))
        AND lower(trim(p.name))=lower(trim(?)) ORDER BY s.id LIMIT 1`, [product.subcategory || "", product.category || ""]);
    const definitions = await database.all("SELECT id,code,label,data_type,default_unit,sort_order,is_active FROM product_attribute_definitions");
    const templates = structure ? await database.all("SELECT attribute_definition_id,section,sort_order,unit_override FROM product_attribute_templates WHERE structure_id=? ORDER BY section,sort_order", [structure.id]) : [];
    return {
        definitions: definitions.map(row => ({ id: row.id, code: row.code, label: row.label, dataType: row.data_type,
            unit: row.default_unit || "", sortOrder: row.sort_order, isActive: Boolean(row.is_active) })),
        templates: templates.map(row => ({ definitionId: row.attribute_definition_id, section: row.section || "regular", sortOrder: row.sort_order, unitOverride: row.unit_override || "" }))
    };
}
module.exports = { ...ordering, getOrderingContext };
