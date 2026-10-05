"use strict";

// Canonical template metadata for closed subcategories. Hydroisolation is a
// planned batch: it remains NOT_CLOSED in audit results until data and images
// have both been applied and verified.
module.exports = Object.freeze({
    parent: Object.freeze({ id: 1, type: "category", name: "Смеси" }),
    mainAttributes: Object.freeze(["brand", "product_type", "shelf_life", "package_weight"]),
    categories: Object.freeze([
        Object.freeze({ name: "Штукатурка", structureId: 2, codes: Object.freeze([
            "base", "purpose", "application_method", "substrates", "color", "wall_layer_thickness",
            "ceiling_layer_thickness", "consumption_10mm", "application_temperature"
        ]), removeCodes: Object.freeze(["coverage_30kg_10mm"]) }),
        Object.freeze({ name: "Шпаклевка", structureId: 4, codes: Object.freeze([
            "base", "purpose", "application_area", "application_method", "substrates", "color",
            "layer_thickness", "consumption", "application_temperature"
        ]) }),
        Object.freeze({ name: "Кладочные Смеси", structureId: 5, codes: Object.freeze([
            "base", "purpose", "application_area", "application_method", "substrates", "color", "layer_thickness",
            "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength",
            "adhesion", "frost_resistance", "mortar_grade", "standard"
        ]) }),
        Object.freeze({ name: "Наливной Пол", structureId: 7, codes: Object.freeze([
            "base", "application_area", "application_method", "substrates", "layer_thickness", "consumption",
            "water_requirement", "pot_life", "application_temperature", "walkability", "compressive_strength",
            "flexural_strength", "adhesion"
        ]) }),
        Object.freeze({ name: "Стяжки Пола", structureId: 8, codes: Object.freeze([
            "base", "purpose", "application_area", "layer_thickness", "walkability", "flexural_strength"
        ]) }),
        Object.freeze({ name: "Гидроизоляция", structureId: 10, codes: Object.freeze([
            "base", "purpose", "application_area", "application_method", "substrates", "color", "layer_thickness",
            "consumption", "water_requirement", "mixing_ratio", "pot_life", "drying_time", "application_temperature",
            "compressive_strength", "adhesion", "frost_resistance", "waterproofness", "crack_bridging", "standard"
        ]) }),
        Object.freeze({ name: "Клей для Плитки", structureId: 16, codes: Object.freeze([
            "base", "purpose", "application_area", "substrates", "color", "adhesive_class", "layer_thickness",
            "consumption", "water_requirement", "pot_life", "application_temperature", "open_time", "adjustment_time",
            "walkability", "heated_floor_compatibility", "standard"
        ]) })
    ])
});
