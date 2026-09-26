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
            const main = templates.length
                ? Boolean(template && template.section === "main")
                : isMain(value.code || definition.code);
            return { ...definition, ...value, definitionId: id,
                sortOrder: Number(template ? template.sortOrder : definition.sortOrder) || 0,
                unit: value.unitOverride || template?.unitOverride || value.unit || definition.unit || definition.defaultUnit || "",
                section: main ? "Основные характеристики" : "Характеристики", isMain: main };
        });
        const templatesAreAvailable = templates.length > 0;
        const main = templatesAreAvailable
            ? [
                ...templates.filter(item => item.section === "main").map(template => {
                const definition = byId.get(Number(template.definitionId)) || {};
                const value = rows.find(row => Number(row.definitionId) === Number(template.definitionId)) || {};
                return { ...definition, ...value, definitionId: Number(template.definitionId),
                    value: (definition.code || value.code) === "brand" ? brand : value.value ?? "",
                    unitOverride: value.unitOverride ?? "", unit: value.unitOverride || template.unitOverride || value.unit || definition.unit || definition.defaultUnit || "",
                    sortOrder: Number(template.sortOrder) || 0,
                    section: "Основные характеристики", isMain: true };
                })
            ]
            : MAIN_ATTRIBUTES.map(item => {
                const definition = definitions.find(row => row.code === item.code) || {};
                const value = rows.find(row => row.code === item.code) || {};
                return { ...definition, ...value, ...item, definitionId: definition.id ?? value.definitionId ?? null,
                    dataType: definition.dataType || value.dataType || "text",
                    value: item.code === "brand" ? brand : value.value ?? "",
                    section: "Основные характеристики", isMain: true };
            });
        const visibleMain = includeEmptyMain ? main : main.filter(item => hasValue(item.value));
        const regular = rows.filter(item => !item.isMain).sort(compare);
        return [...visibleMain, ...regular];
    }
    return Object.freeze({ MAIN_ATTRIBUTES, isMain, hasValue, resolve, sortTemplates });
});
