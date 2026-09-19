"use strict";

const CHECKED_AT = "2026-09-19";

const SOURCES = Object.freeze({
  knaufBetogrund: { owner: "KNAUF Russia", title: "КНАУФ-Бетогрунд", url: "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-betogrund/", evidence: "Official RU product page confirms the product family, ready-to-use adhesive primer, 5/15 kg packs, pink color, consumption, drying and shelf life." },
  ceresitCt19: { owner: "Ceresit Russia", title: "Ceresit CT 19 Бетонконтакт", url: "https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct-19-contact-primer-supercontact", evidence: "Official RU product page confirms CT 19, ready-to-use adhesive primer, internal/external use, 5/15 kg packs, consumption, drying and temperature." },
  starateliBeton: { owner: "Старатели", title: "Грунтовка БЕТОН-КОНТАКТ", url: "https://www.starateli.ru/po-betonu/", evidence: "Official manufacturer page confirms 20/5/3 kg packs, ready-to-use composition, substrates, roller/brush application, consumption, drying, temperature, color and shelf life." }
});

const REUSABLE_DEFINITIONS = Object.freeze({
  brand: { label: "Бренд", dataType: "text", defaultUnit: null },
  product_type: { label: "Тип продукта", dataType: "text", defaultUnit: null },
  base: { label: "Основа", dataType: "text", defaultUnit: null },
  purpose: { label: "Назначение", dataType: "text", defaultUnit: null },
  package_weight: { label: "Фасовка", dataType: "number", defaultUnit: "кг" },
  application_temperature: { label: "Температура основания и воздуха", dataType: "text", defaultUnit: null },
  shelf_life: { label: "Срок хранения", dataType: "number", defaultUnit: "месяцев" }
});

const NEW_DEFINITIONS = Object.freeze([
  { code: "primer_type", label: "Тип грунтовки", dataType: "text", defaultUnit: null },
  { code: "application_area", label: "Область применения", dataType: "text", defaultUnit: null },
  { code: "application_method", label: "Способ нанесения", dataType: "text", defaultUnit: null },
  { code: "substrates", label: "Основания", dataType: "text", defaultUnit: null },
  { code: "consumption", label: "Расход", dataType: "text", defaultUnit: null },
  { code: "drying_time", label: "Время высыхания", dataType: "text", defaultUnit: null },
  { code: "concentrate", label: "Концентрат", dataType: "boolean", defaultUnit: null },
  { code: "color", label: "Цвет", dataType: "text", defaultUnit: null }
]);

const CORE_ORDER = Object.freeze([
  "brand", "product_type", "base", "purpose", "package_weight", "primer_type",
  "application_area", "application_method", "substrates", "consumption", "drying_time",
  "concentrate", "color", "application_temperature", "shelf_life"
]);

const ABSENT_BY_DESIGN = Object.freeze({
  package_volume: "All five exact SKUs are catalogued by mass (kg); no authoritative volume value exists, and kg↔l conversion is forbidden."
});

const ready = (value, sources) => ({ status: "READY", value, sources });
const need = (reason, sources) => ({ status: "NEEDS_SOURCE", value: null, sources, reason });
const absent = (reason, sources) => ({ status: "ABSENT_BY_DESIGN", value: null, sources, reason });
const product = (externalId, expectedTitle, brand, sourceKey, packageWeight, core) => ({
  externalId, expectedTitle, expectedCategory: "Грунт / БетонКонтакт", expectedSubcategory: "БетонКонтакт",
  brand, sourceKeys: [sourceKey], titleStatus: "MATCH", identityStatus: "IDENTITY_CONFIRMED", core: {
    brand: ready(brand, [sourceKey]), package_weight: ready(packageWeight, [sourceKey]), ...core
  }
});

const common = (sourceKey, type, base, purpose, area, substrates, extra = {}) => ({
  product_type: ready(type, [sourceKey]), base: ready(base, [sourceKey]), purpose: ready(purpose, [sourceKey]),
  primer_type: ready("Адгезионная грунтовка-бетонконтакт", [sourceKey]),
  application_area: ready(area, [sourceKey]),
  application_method: extra.method ? ready(extra.method, [sourceKey]) : need("Official source does not state an exact application method for this SKU.", [sourceKey]),
  substrates: ready(substrates, [sourceKey]),
  consumption: ready(extra.consumption, [sourceKey]),
  drying_time: ready(extra.drying, [sourceKey]),
  concentrate: ready(false, [sourceKey]),
  color: ready(extra.color, [sourceKey]),
  application_temperature: extra.temperature ? ready(extra.temperature, [sourceKey]) : need("Exact application temperature is not stated on the authoritative source used for this batch.", [sourceKey]),
  shelf_life: extra.shelfLife ? ready(extra.shelfLife, [sourceKey]) : need("Shelf life in months is not confirmed for this exact SKU on the authoritative source.", [sourceKey])
});

const PRODUCTS = Object.freeze([
  product("MAT-000217", "Бетонконтакт Knauf Бетогрунд 5 кг", "KNAUF", "knaufBetogrund", 5, common("knaufBetogrund", "Грунтовка адгезионная для бетонных и гладких оснований", "Полимерная дисперсия с кварцевым песком", "Подготовка бетонных и гладких оснований перед нанесением последующих покрытий", "Внутренние работы", "Бетон, гладкие плотные основания", { consumption: "около 0,25 кг/м²", drying: "12 часов", color: "Розовый", shelfLife: 12 })),
  product("MAT-000218", "Бетонконтакт Knauf Бетогрунд 15 кг", "KNAUF", "knaufBetogrund", 15, common("knaufBetogrund", "Грунтовка адгезионная для бетонных и гладких оснований", "Полимерная дисперсия с кварцевым песком", "Подготовка бетонных и гладких оснований перед нанесением последующих покрытий", "Внутренние работы", "Бетон, гладкие плотные основания", { consumption: "около 0,25 кг/м²", drying: "12 часов", color: "Розовый", shelfLife: 12 })),
  product("MAT-000219", "Бетонконтакт Ceresit CT 19, 5 кг", "Ceresit", "ceresitCt19", 5, common("ceresitCt19", "Адгезионная грунтовка для бетонных оснований", "Водная дисперсия акриловых сополимеров с минеральными наполнителями", "Повышение адгезии последующих покрытий к гладким бетонным основаниям", "Внутренние и наружные работы", "Гладкий бетон; монолитные и сборные железобетонные основания", { consumption: "около 0,2 кг/м²", drying: "около 3 часов", color: "Розовый", temperature: "+5…+30 °C" })),
  product("MAT-000220", "Бетонконтакт Ceresit CT 19, 15 кг", "Ceresit", "ceresitCt19", 15, common("ceresitCt19", "Адгезионная грунтовка для бетонных оснований", "Водная дисперсия акриловых сополимеров с минеральными наполнителями", "Повышение адгезии последующих покрытий к гладким бетонным основаниям", "Внутренние и наружные работы", "Гладкий бетон; монолитные и сборные железобетонные основания", { consumption: "около 0,2 кг/м²", drying: "около 3 часов", color: "Розовый", temperature: "+5…+30 °C" })),
  product("MAT-000221", "Бетонконтакт Cтаратели 20 кг", "Старатели", "starateliBeton", 20, common("starateliBeton", "Грунтовка БЕТОН-КОНТАКТ", "Полимерная дисперсия с песком, водой и функциональными добавками", "Подготовка бетонных и других плотных оснований перед последующими покрытиями", "Внутренние работы", "Бетон, керамическая плитка, поверхности с масляной краской", { method: "Валик или кисть", consumption: "0,2–0,3 кг/м²", drying: "2–3 часа", color: "Вишнёвый", temperature: "+5…+30 °C", shelfLife: 12 }))
]);

module.exports = { CHECKED_AT, SOURCES, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, ABSENT_BY_DESIGN, PRODUCTS };
