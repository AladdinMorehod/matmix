"use strict";

const CHECKED_AT = "2026-09-18";

const SOURCES = Object.freeze({
  litokolPrimerA: { title: "LITOKOL Primer A — официальный сайт", url: "https://www.litokol.ru/catalog/primer-a/", owner: "LITOKOL" },
  oscarG: { title: "Oscar G os-10kg — brand support/catalog", url: "https://support.alaxar.ru/produktsiya/katalog/gruntovka-2/dlya-naruzhnyh-rabot.html", owner: "Oscar / brand support" },
  oscarCatalog: { title: "Oscar — catalog PDF", url: "https://itelgroup-bucket.storage.yandexcloud.net/Production/exb_doc/2032/4956/%D0%9F%D1%80%D0%B0%D0%B9%D1%81-%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3_300425_preview2.pdf", owner: "Oscar / brand catalog" },
  forbo044: { title: "Forbo Eurocol 044 Europrimer Multi — официальный сайт", url: "https://www.forbo.com/eurocol/ru/044-europrimer-multi/ewr8vw", owner: "Forbo Eurocol" },
  forbo041: { title: "Forbo Eurocol 041 Europrimer EC — официальный сайт", url: "https://www.forbo.com/eurocol/ru/041-europrimer-ec/e3spag", owner: "Forbo Eurocol" },
  localTitle: { title: "Локальная карточка MatMix", url: null, owner: "MatMix local audit" }
});

const ready = (value, sources, extra = {}) => ({ status: "READY", value, sources, ...extra });
const need = (reason, sources) => ({ status: "NEEDS_SOURCE", value: null, reason, sources });
const absent = (reason, sources) => ({ status: "ABSENT_BY_DESIGN", value: null, reason, sources });

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
  { code: "package_volume", label: "Объём упаковки", dataType: "number", defaultUnit: "л" },
  { code: "primer_type", label: "Тип грунтовки", dataType: "text", defaultUnit: null },
  { code: "application_area", label: "Область применения", dataType: "text", defaultUnit: null },
  { code: "application_method", label: "Способ нанесения", dataType: "text", defaultUnit: null },
  { code: "substrates", label: "Основания", dataType: "text", defaultUnit: null },
  { code: "consumption", label: "Расход", dataType: "text", defaultUnit: null },
  { code: "drying_time", label: "Время высыхания", dataType: "text", defaultUnit: null },
  { code: "dilution_ratio", label: "Разбавление", dataType: "text", defaultUnit: null },
  { code: "concentrate", label: "Концентрат", dataType: "boolean", defaultUnit: null },
  { code: "color", label: "Цвет", dataType: "text", defaultUnit: null }
]);

const CORE_ORDER = Object.freeze([
  "brand", "product_type", "base", "purpose", "package_weight", "package_volume", "primer_type",
  "application_area", "application_method", "substrates", "consumption", "drying_time",
  "dilution_ratio", "concentrate", "color", "application_temperature", "shelf_life"
]);

const local = ["localTitle"];
const p = (externalId, expectedTitle, brand, core, meta = {}) => ({ externalId, expectedTitle, expectedCategory: "Грунт / БетонКонтакт", expectedSubcategory: "Грунтовка", brand, core, sourceKeys: meta.sourceKeys || [...new Set(Object.values(core).flatMap(value => value.sources || []))], ...meta });

const products = [
  p("MAT-000234", "Грунт Litokol PRIMER A универсальный укрепляющий 10 кг", "LITOKOL", {
    brand: ready("LITOKOL", ["litokolPrimerA"]),
    product_type: ready("Универсальная грунтовка", ["litokolPrimerA"]),
    base: ready("Водная дисперсия", ["litokolPrimerA"]),
    purpose: ready("Подготовка оснований перед покраской, оклейкой обоями, облицовкой плиткой, штукатурными и шпатлёвочными работами", ["litokolPrimerA"]),
    package_weight: ready(10, ["litokolPrimerA"]),
    package_volume: need("Official source confirms 10 kg packaging; volume is not inferred.", ["litokolPrimerA", ...local]),
    primer_type: ready("Универсальная", ["litokolPrimerA"]),
    application_area: ready("Внутренние и наружные работы", ["litokolPrimerA"]),
    application_method: ready("Валик, кисть или распылитель", ["litokolPrimerA"]),
    substrates: ready("Цементные, известковые и гипсовые штукатурки и шпатлёвки, стяжки, бетон, кирпич, ГКЛ, ГВЛ и гипсовые блоки", ["litokolPrimerA"]),
    consumption: ready("от 100 г/м²", ["litokolPrimerA"]),
    drying_time: ready("2–4 часа", ["litokolPrimerA"]),
    dilution_ratio: absent("Готова к применению; разбавление не заявлено для этого продукта.", ["litokolPrimerA"]),
    concentrate: ready(false, ["litokolPrimerA"]),
    color: ready("Голубой", ["litokolPrimerA"]),
    application_temperature: ready("от +5 до +35 °C", ["litokolPrimerA"]),
    shelf_life: need("Срок хранения exact SKU не указан на проверенной официальной странице.", ["litokolPrimerA"])
  }, { sourceKeys: ["litokolPrimerA", ...local], titleStatus: "TITLE_UNIT_CONFIRMED", notes: ["Official package is 10 kg; title normalized to the confirmed unit."] }),

  p("MAT-000237", "Грунтовка Oscar глубокого проникновения 10 кг", "Oscar", {
    brand: ready("Oscar", ["oscarG", "oscarCatalog"]),
    product_type: ready("Грунтовка глубокого проникновения", ["oscarG", "oscarCatalog"]),
    base: ready("Латексная грунтовка", ["oscarG", "oscarCatalog"]),
    purpose: ready("Укрепление оснований и снижение впитываемости", ["oscarG", "oscarCatalog"]),
    package_weight: ready(10, ["oscarG", "oscarCatalog"]),
    package_volume: need("Brand source identifies the exact package as 10 kg; volume is not inferred.", ["oscarG", "oscarCatalog", ...local]),
    primer_type: ready("Глубокого проникновения", ["oscarG", "oscarCatalog"]),
    application_area: ready("Наружные работы", ["oscarG"]),
    application_method: need("Exact application method for this SKU is not stated in the retained brand source.", ["oscarG", "oscarCatalog"]),
    substrates: need("Exact substrate list for this SKU is not stated in the retained brand source.", ["oscarG", "oscarCatalog"]),
    consumption: need("Exact consumption is not stated in the retained brand source.", ["oscarG", "oscarCatalog"]),
    drying_time: need("Exact drying time is not stated in the retained brand source.", ["oscarG", "oscarCatalog"]),
    dilution_ratio: need("Dilution requirement is not confirmed for this exact SKU.", ["oscarG", "oscarCatalog"]),
    concentrate: need("Concentrate status is not confirmed for this exact SKU.", ["oscarG", "oscarCatalog"]),
    color: need("Color is not confirmed for this exact SKU.", ["oscarG", "oscarCatalog"]),
    application_temperature: need("Application temperature is not confirmed for this exact SKU.", ["oscarG", "oscarCatalog"]),
    shelf_life: need("Shelf life is not confirmed for this exact SKU.", ["oscarG", "oscarCatalog"])
  }, { sourceKeys: ["oscarG", "oscarCatalog", ...local], titleStatus: "TITLE_UNIT_CONFIRMED", notes: ["Brand support/catalog confirms Oscar G os-10kg family; title normalized to the confirmed unit."] }),

  p("MAT-000243", "Грунт адгезионный Forbo Eurocol 044, концентрат 1:2 10 кг", "Forbo Eurocol", {
    brand: ready("Forbo Eurocol", ["forbo044"]),
    product_type: ready("Универсальная грунтовка-концентрат", ["forbo044"]),
    base: ready("Акриловая дисперсия", ["forbo044"]),
    purpose: ready("Снижение влаговпитывания пористых оснований и создание адгезии выравнивающих смесей к гладким, невпитывающим и деревянным основаниям", ["forbo044"]),
    package_weight: ready(10, ["forbo044"]),
    package_volume: need("Official source confirms 10 kg packaging; no exact litre volume is provided.", ["forbo044"]),
    primer_type: ready("Концентрат", ["forbo044"]),
    application_area: ready("Внутренние и наружные работы", ["forbo044"]),
    application_method: ready("Валик или распылитель", ["forbo044"]),
    substrates: ready("Цементные стяжки, основания на основе сульфата кальция, гипсовые поверхности, терраццо, керамическая плитка, натуральный камень, наливной асфальт, ДСП и фанера", ["forbo044"]),
    consumption: ready("около 50–150 г/м²", ["forbo044"]),
    drying_time: ready("0,5–15 часов в зависимости от основания", ["forbo044"]),
    dilution_ratio: ready("1:1–1:5 в зависимости от основания", ["forbo044"]),
    concentrate: ready(true, ["forbo044"]),
    color: ready("Белый", ["forbo044"]),
    application_temperature: ready("материал и помещение не ниже +18 °C; пол не ниже +15 °C", ["forbo044"]),
    shelf_life: ready(15, ["forbo044"])
  }, { sourceKeys: ["forbo044", ...local], titleStatus: "WEIGHT_DISCREPANCY", notes: ["Exact product and official 10 kg package are confirmed; products.weight=3 remains untouched as inventory discrepancy."] }),

  p("MAT-000244", "Грунтовка Forbo 041 Europrimer EC, для укладки токопроводящих и антистатических покрытий 10 кг", "Forbo Eurocol", {
    brand: ready("Forbo Eurocol", ["forbo041"]),
    product_type: ready("Токопроводящая водно-дисперсионная грунтовка", ["forbo041"]),
    base: ready("Акриловая дисперсия", ["forbo041"]),
    purpose: ready("Создание поперечной токопроводимости перед нанесением токопроводящего клея", ["forbo041"]),
    package_weight: ready(10, ["forbo041"]),
    package_volume: need("Official source confirms 10 kg packaging; no exact litre volume is provided.", ["forbo041"]),
    primer_type: ready("Токопроводящая", ["forbo041"]),
    application_area: need("Official page confirms use in flooring systems but does not define a general indoor/outdoor field for this attribute.", ["forbo041"]),
    application_method: ready("Валик из пеноматериала", ["forbo041"]),
    substrates: ready("Подготовленные влаговпитывающие поверхности", ["forbo041"]),
    consumption: ready("около 100–150 г/м²", ["forbo041"]),
    drying_time: ready("2–4 часа в зависимости от основания", ["forbo041"]),
    dilution_ratio: absent("Готова к применению; разбавление не заявлено.", ["forbo041"]),
    concentrate: ready(false, ["forbo041"]),
    color: ready("Чёрный", ["forbo041"]),
    application_temperature: ready("материал и помещение не ниже +18 °C; пол не ниже +15 °C", ["forbo041"]),
    shelf_life: ready(15, ["forbo041"])
  }, { sourceKeys: ["forbo041", ...local], titleStatus: "WEIGHT_DISCREPANCY", notes: ["Exact product and official 10 kg package are confirmed; products.weight=3 remains untouched as inventory discrepancy."] })
];

const IDENTITY_REVIEW = Object.freeze([
  { externalId: "MAT-000229", status: "IDENTITY_BLOCKED_FINAL", currentTitle: "Грунтовка Knauf Тифенгрунд морозостойкая (до -40) 10 л", finding: "KNAUF Tiefengrund family is known, but a distinct exact frost-resistant до -40 SKU/package is not proven by the available official source.", missing: "Exact manufacturer SKU or current TDS/packaging proving the морозостойкая до -40 10 l identity." },
  { externalId: "MAT-000238", status: "IDENTITY_BLOCKED_FINAL", currentTitle: "Грунтовка Акрил 5 л", finding: "Generic title has no manufacturer, product model, or authoritative source identity.", missing: "Manufacturer and exact model/SKU for the 5 l acrylic primer." },
  { externalId: "MAT-000239", status: "IDENTITY_BLOCKED_FINAL", currentTitle: "Грунтовка Акрил 10 л", finding: "Generic title has no manufacturer, product model, or authoritative source identity.", missing: "Manufacturer and exact model/SKU for the 10 l acrylic primer." },
  { externalId: "MAT-000259", status: "IDENTITY_BLOCKED_FINAL", currentTitle: "Грунт ГФ-021 по металлу и дереву серый 0,8 кг", finding: "GF-021 is a generic product class; no manufacturer or exact SKU is established. Historical secondary reference is insufficient.", missing: "Manufacturer, exact GF-021 model, and authoritative 0.8 kg package evidence." },
  { externalId: "MAT-000260", status: "IDENTITY_BLOCKED_FINAL", currentTitle: "Грунт по металлу серый 1 л", finding: "Generic grey metal-primer title has no manufacturer or exact product model.", missing: "Manufacturer, exact model/SKU, and authoritative 1 l package evidence." }
]);

const PRODUCTION_INSPECTION_SQL = `SELECT p.external_id,p.title,p.brand,p.weight,
  CASE WHEN COALESCE(p.description,p.short_description,p.full_description,'')<>'' THEN 1 ELSE 0 END AS description_present,
  p.image,p.image_url,
  (SELECT GROUP_CONCAT(d.code || '=' || COALESCE(v.value_text,CAST(v.value_number AS TEXT),CAST(v.value_boolean AS TEXT)), ' | ')
   FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
   WHERE v.product_id=p.id) AS primer_attributes,
  (SELECT GROUP_CONCAT(i.image_url, ' | ') FROM product_images i WHERE i.product_id=p.id) AS gallery_refs
FROM products p
WHERE p.external_id IN ('MAT-000234','MAT-000237','MAT-000243','MAT-000244','MAT-000229','MAT-000238','MAT-000239','MAT-000259','MAT-000260')
ORDER BY p.external_id;`;

module.exports = { CHECKED_AT, SOURCES, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, PRODUCTS: Object.freeze(products), IDENTITY_REVIEW, PRODUCTION_INSPECTION_SQL };
