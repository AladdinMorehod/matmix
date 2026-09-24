"use strict";

const CHECKED_AT = "2026-09-24";
const EXPECTED_CATEGORY = "Смеси";
const EXPECTED_SUBCATEGORY = "Кладочные Смеси";
const SHARED_PLACEHOLDER = "/uploads/products/MAT-000001-20260714153714969-3fb7fe.png";

const SOURCES = Object.freeze({
  ownerEuromix: { owner: "MatMix owner identity", title: "Owner-confirmed EUROMIX M-200 identity", url: "", evidence: "Owner-confirmed EUROMIX/EUROmix M-200 cement dry masonry/installation mix, 40 kg. Identity source only; technical fields remain unresolved." },
  euromixSecondary: { owner: "Bobrёнок", title: "Сухая смесь М-200 Euromix Кладочная (40 кг)", url: "https://bobr.su/sukhaya-smes-m-200-euromix-kladochnaya-40kg/", evidence: "Exact product/pack context from a secondary listing; not used for unverified technical specifications." },
  ruseanM200: { owner: "Русеан", title: "Сухая смесь М-200 монтажно-кладочная, 40 кг", url: "https://rusean.ru/catalog/sukhie_smesi_/sukhaya_smes_m_200_montazhno_kladochnaya_40_kg/", evidence: "Official product page with exact 40 kg identity and specification table." },
  ruseanPrice: { owner: "Русеан", title: "Русеан official price list", url: "https://rusean.ru/pricelist/", evidence: "Official price list separately lists the exact M-200 монтажно-кладочная 40 kg product." },
  vertexM200: { owner: "VERTEX.production", title: "VERTEX.production M-200", url: "https://vertexproduction.ru/", evidence: "Official manufacturer page identifies M-200 as a 40 kg cement-based dry masonry/installation mix for internal and external work." }
});

const REUSABLE_DEFINITIONS = Object.freeze({
  brand: { label: "Бренд", dataType: "text", defaultUnit: null },
  product_type: { label: "Тип продукта", dataType: "text", defaultUnit: null },
  base: { label: "Основа", dataType: "text", defaultUnit: null },
  purpose: { label: "Назначение", dataType: "text", defaultUnit: null },
  package_weight: { label: "Фасовка", dataType: "number", defaultUnit: "кг" },
  consumption_10mm: { label: "Расход при слое 10 мм", dataType: "number", defaultUnit: "кг/м²" },
  application_temperature: { label: "Температура основания и воздуха", dataType: "text", defaultUnit: null },
  shelf_life: { label: "Срок хранения", dataType: "number", defaultUnit: "месяцев" }
});

const NEW_DEFINITIONS = Object.freeze([
  { code: "application_area", label: "Область применения", dataType: "text", defaultUnit: null },
  { code: "application_method", label: "Способ нанесения", dataType: "text", defaultUnit: null },
  { code: "substrates", label: "Основания", dataType: "text", defaultUnit: null },
  { code: "color", label: "Цвет", dataType: "text", defaultUnit: null },
  { code: "layer_thickness", label: "Толщина слоя", dataType: "text", defaultUnit: null },
  { code: "water_requirement", label: "Расход воды", dataType: "text", defaultUnit: null },
  { code: "pot_life", label: "Жизнеспособность раствора", dataType: "number", defaultUnit: "час" },
  { code: "compressive_strength", label: "Прочность на сжатие", dataType: "number", defaultUnit: "МПа" },
  { code: "adhesion", label: "Адгезия", dataType: "number", defaultUnit: "МПа" },
  { code: "frost_resistance", label: "Морозостойкость", dataType: "text", defaultUnit: null },
  { code: "standard", label: "Стандарт", dataType: "text", defaultUnit: null },
  { code: "mortar_grade", label: "Марка раствора", dataType: "text", defaultUnit: null }
]);

const CORE_ORDER = Object.freeze([
  "brand", "product_type", "base", "purpose", "package_weight", "application_area", "application_method", "substrates", "color", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "shelf_life", "standard", "mortar_grade"
]);

const IMAGE_CLEANUP = Object.freeze({
  code: "image_url",
  value: null,
  expectedPlaceholder: SHARED_PLACEHOLDER,
  reason: "Remove only the known MAT-000001 shared placeholder when no product_images rows exist; SSR and SPA render the neutral 'Фото скоро появятся' fallback for an empty URL."
});

const ready = (value, sources) => ({ status: "READY", value, sources });
const need = (reason, sources) => ({ status: "NEEDS_SOURCE", value: null, sources, reason });

const commonNeeds = (sourceKey, names) => Object.fromEntries(names.map(code => [code, need("Exact product source does not confirm this field.", [sourceKey])]));

const PRODUCT067 = {
  externalId: "MAT-000067",
  expectedTitle: "Кладочно - монтажная смесь цементная Евро М-200 40кг",
  expectedCategory: EXPECTED_CATEGORY,
  expectedSubcategory: EXPECTED_SUBCATEGORY,
  brand: "EUROMIX",
  sourceKeys: ["ownerEuromix", "euromixSecondary"],
  titleCandidate: "Кладочно-монтажная смесь EUROmix М-200 40 кг",
  identityStatus: "CONFIRMED_OWNER_IDENTITY_PARTIAL_PRIMARY_SOURCE",
  core: {
    ...commonNeeds("ownerEuromix", ["base", "purpose", "application_area", "application_method", "substrates", "color", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "shelf_life", "standard"]),
    brand: ready("EUROMIX", ["ownerEuromix"]),
    product_type: ready("Кладочно-монтажная смесь", ["ownerEuromix"]),
    package_weight: ready(40, ["ownerEuromix", "euromixSecondary"]),
    mortar_grade: ready("М-200", ["ownerEuromix", "euromixSecondary"])
  }
};

const PRODUCT068 = {
  externalId: "MAT-000068",
  expectedTitle: "Кладочно - монтажная смесь цементная Русеан М-200 40кг",
  expectedCategory: EXPECTED_CATEGORY,
  expectedSubcategory: EXPECTED_SUBCATEGORY,
  brand: "Русеан",
  sourceKeys: ["ruseanM200", "ruseanPrice"],
  titleCandidate: "Кладочно-монтажная смесь Русеан М-200 40 кг",
  identityStatus: "CONFIRMED_PRIMARY",
  core: {
    brand: ready("Русеан", ["ruseanM200"]),
    product_type: ready("Сухая монтажно-кладочная смесь", ["ruseanM200"]),
    base: ready("Портландцемент и сухой фракционный песок", ["ruseanM200"]),
    purpose: ready("Кладка кирпича, монтаж бетонных блоков, укладка тротуарной плитки и брусчатки, ремонт кирпичных и бетонных стен и полов, заделка швов, трещин, выбоин и углублений, фиксация металлических элементов и конструкций", ["ruseanM200"]),
    package_weight: ready(40, ["ruseanM200"]),
    application_area: ready("Внутренние и наружные работы", ["ruseanM200"]),
    application_method: ready("Ручное нанесение", ["ruseanM200"]),
    substrates: ready("Кирпич, бетонные основания и бетонные блоки", ["ruseanM200"]),
    color: ready("Серый", ["ruseanM200"]),
    layer_thickness: ready("10–30 мм", ["ruseanM200"]),
    consumption_10mm: ready(19.5, ["ruseanM200"]),
    water_requirement: ready("4,4–5,6 л на 40 кг", ["ruseanM200"]),
    pot_life: ready(1, ["ruseanM200"]),
    application_temperature: ready("от +5 до +25 °C", ["ruseanM200"]),
    compressive_strength: ready(23, ["ruseanM200"]),
    adhesion: ready(0.4, ["ruseanM200"]),
    frost_resistance: ready("F35", ["ruseanM200"]),
    shelf_life: ready(6, ["ruseanM200"]),
    standard: ready("ГОСТ 31357-2007", ["ruseanM200"]),
    mortar_grade: ready("М-200", ["ruseanM200"])
  }
};

const PRODUCT069 = {
  externalId: "MAT-000069",
  expectedTitle: "Кладочно - монтажная смесь цементная Вертекс М-200 40кг",
  expectedCategory: EXPECTED_CATEGORY,
  expectedSubcategory: EXPECTED_SUBCATEGORY,
  brand: "VERTEX",
  sourceKeys: ["vertexM200"],
  titleCandidate: "Кладочно-монтажная смесь VERTEX М-200 40 кг",
  identityStatus: "CONFIRMED_PRIMARY_LIMITED_TECHNICAL_DATA",
  core: {
    ...commonNeeds("vertexM200", ["application_method", "color", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "shelf_life", "standard"]),
    brand: ready("VERTEX", ["vertexM200"]),
    product_type: ready("Сухая монтажно-кладочная смесь", ["vertexM200"]),
    base: ready("Цемент и специальные добавки", ["vertexM200"]),
    purpose: ready("Кладка стен из кирпича, монтаж бетонных блоков, укладка тротуарной плитки и брусчатки, устройство стяжек, ремонт кирпичных и бетонных стен, полов и фундаментов, заделка швов, трещин, выбоин и углублений, монтаж и крепление металлических элементов и конструкций", ["vertexM200"]),
    package_weight: ready(40, ["vertexM200"]),
    application_area: ready("Внутренние и наружные работы", ["vertexM200"]),
    substrates: ready("Кирпич, бетонные блоки, кирпичные и бетонные основания", ["vertexM200"]),
    mortar_grade: ready("М-200", ["vertexM200"])
  }
};

const PRODUCTS = Object.freeze([PRODUCT067, PRODUCT068, PRODUCT069]);

module.exports = { CHECKED_AT, EXPECTED_CATEGORY, EXPECTED_SUBCATEGORY, SHARED_PLACEHOLDER, SOURCES, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, IMAGE_CLEANUP, PRODUCTS };
