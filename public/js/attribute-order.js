(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.MatMixAttributeOrder = factory();
})(typeof globalThis === "object" ? globalThis : this, function () {
    "use strict";
    const MAIN_ATTRIBUTES = Object.freeze([
        Object.freeze({ code: "brand", label: "Бренд" }),
        Object.freeze({ code: "product_type", label: "Тип продукта" }),
        Object.freeze({ code: "shelf_life", label: "Срок хранения" }),
        Object.freeze({ code: "package_weight", label: "Фасовка" })
    ]);
    const isMain = code => MAIN_ATTRIBUTES.some(item => item.code === code);
    const hasValue = value => value !== null && value !== undefined && String(value).trim() !== "";
    const compare = (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
        || String(a.label || "").localeCompare(String(b.label || ""), "ru") || Number(a.definitionId) - Number(b.definitionId);
    const sortTemplates = rows => rows.slice().sort(compare);

    // Values carry data only. Their historical sortOrder never controls display.
    function resolve({ definitions = [], templates = [], values = [], brand = "", includeEmptyMain = true }) {
        const byId = new Map(definitions.map(item => [Number(item.id), item]));
        const templateById = new Map(templates.map(item => [Number(item.definitionId), item]));
        const rows = values.map(value => {
            const id = Number(value.definitionId);
            const definition = byId.get(id) || {};
            const template = templateById.get(id);
            return { ...definition, ...value, definitionId: id,
                sortOrder: Number(template ? template.sortOrder : definition.sortOrder) || 0,
                section: "Характеристики" };
        });
        const main = MAIN_ATTRIBUTES.map(item => {
            const definition = definitions.find(row => row.code === item.code) || {};
            const value = rows.find(row => row.code === item.code) || {};
            return { ...definition, ...value, ...item, definitionId: definition.id ?? value.definitionId ?? null,
                dataType: definition.dataType || value.dataType || "text",
                value: item.code === "brand" ? brand : value.value ?? "",
                section: "Основные характеристики", isMain: true };
        }).filter(item => includeEmptyMain || hasValue(item.value));
        const regular = rows.filter(item => !isMain(item.code)).sort(compare);
        return [...main, ...regular];
    }
    return Object.freeze({ MAIN_ATTRIBUTES, isMain, hasValue, resolve, sortTemplates });
});
