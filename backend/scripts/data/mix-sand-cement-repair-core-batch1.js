"use strict";

const CHECKED_AT = "2026-10-02";
const EXPECTED_CATEGORY = "Смеси";
const BATCH_MATS = Object.freeze(["MAT-000109", "MAT-000117", "MAT-000118"]);
const CONFIRM = "BACKFILL_MIX_SAND_CEMENT_REPAIR_CORE_BATCH1";

const SOURCES = Object.freeze({
  ruseanM300: {
    owner: "Русеан",
    title: "Пескобетон М-300, 40 кг",
    url: "https://rusean.ru/catalog/peskobeton/peskobeton_m_300_40_kg_/",
    evidence: "Официальная страница exact product/40 kg. Описание и таблица расхода расходятся (18–19 против 19 кг/м² при 10 мм); описание и таблица морозостойкости расходятся (F50 против F35). Значения оставлены SOURCE_CONFLICT."
  },
  ceresitCn83Catalog: {
    owner: "Ceresit/Henkel RU",
    title: "Официальный российский каталог CN 83",
    url: "https://www.ceresit.ru/ru/products/flooring/levelling-compounds",
    evidence: "Каталог производителя называет CN 83 ремонтной смесью для бетона и указывает толщину 5–35 мм."
  },
  ceresitCn83RuTds: {
    owner: "Henkel/Ceresit RU",
    title: "CN 83 — CERESIT_CN 83_11.2020, официальный RU TDS",
    url: "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN83-",
    evidence: "Официальный индекс Henkel DAM возвращает полный текст RU TDS редакции 11.2020, включая 25 кг упаковку, состав, применение и таблицу характеристик. Прямая загрузка URL во время проверки вернула 404; values основаны только на индексированном русском документе, не на украинской версии."
  },
  glimsProCrt40: {
    owner: "GLIMS",
    title: "GLIMS PRO CRT-40 — ремонтная смесь класса R3",
    url: "https://glims.ru/catalog/remontnye-smesi/remontnaya-tiksotropnaya-smes-klass-r3-glims-pro-crt-40/",
    evidence: "Официальная страница производителя: PRO CRT-40, 25 кг, штрихкод 4607009095967 и технические характеристики; exact standard CRT-40, не CRT-40 AF."
  },
  glimsProCrt40Tds: {
    owner: "GLIMS",
    title: "GLIMS PRO CRT-40 — официальный технический PDF",
    url: "https://glims.ru/upload/iblock/269/6zxy9omk7p1uybqgmlb0upxynqo43qb7/GLIMS%C2%AE%20PRO%20CRT-40.pdf",
    evidence: "Официальный TDS exact GLIMS PRO CRT-40. Дополнительная идентификация из предыдущего source audit: артикул О00010269 и EAN 4607009095967; CRT-40 AF имеет другой артикул О00014105."
  }
});

// Existing canonical definitions only. This batch creates no definitions.
const DEFINITIONS = Object.freeze({
  brand: { dataType: "text", unit: null },
  product_type: { dataType: "text", unit: null },
  base: { dataType: "text", unit: null },
  purpose: { dataType: "text", unit: null },
  package_weight: { dataType: "number", unit: "кг" },
  application_area: { dataType: "text", unit: null },
  application_method: { dataType: "text", unit: null },
  substrates: { dataType: "text", unit: null },
  color: { dataType: "text", unit: null },
  layer_thickness: { dataType: "text", unit: null },
  consumption_10mm: { dataType: "text", unit: "кг/м²" },
  consumption: { dataType: "text", unit: null },
  water_requirement: { dataType: "text", unit: null },
  pot_life: { dataType: "text", unit: null },
  application_temperature: { dataType: "text", unit: null },
  compressive_strength: { dataType: "number", unit: "МПа" },
  adhesion: { dataType: "number", unit: "МПа" },
  frost_resistance: { dataType: "text", unit: null },
  shelf_life: { dataType: "number", unit: "месяцев" },
  standard: { dataType: "text", unit: null },
  mortar_grade: { dataType: "text", unit: null },
  walkability: { dataType: "text", unit: null },
  flexural_strength: { dataType: "text", unit: null }
});

const CORE_ORDER = Object.freeze(Object.keys(DEFINITIONS));
const ready = (value, sources, context, sourceValue = value, sourceUnit = null) => ({
  status: "READY", value, sources, sourceValue, sourceUnit, context
});
const unresolved = (status, reason, sources, sourceValue = null, sourceUnit = null, context = null) => ({
  status, value: null, sources, sourceValue, sourceUnit, reason, context
});
const notAvailable = (reason, sources = []) => unresolved("NOT_AVAILABLE", reason, sources);

const PRODUCTS = Object.freeze([
  {
    externalId: "MAT-000109",
    expectedTitle: "Пескобетон (ЦПС) М300 Русеан 40 кг",
    expectedSubcategory: "Пескобетон",
    expectedStructureId: 11,
    expectedParentStructureId: 1,
    brand: "Русеан",
    sourceKeys: ["ruseanM300"],
    identity: "Exact official product page and 40 kg title/weight match; official class is M-300.",
    core: {
      brand: ready("Русеан", ["ruseanM300"], "Manufacturer page for Пескобетон М-300, 40 кг."),
      product_type: ready("Пескобетон", ["ruseanM300"], "Official product title and product description."),
      base: ready("Портландцемент и песок фракцией до 5 мм", ["ruseanM300"], "Описание: inorganic binder (Portland cement) and sand up to 5 mm."),
      purpose: ready("Устройство полов; ленточные фундаменты в малоэтажном строительстве; отмостки и отливки; монтажные работы", ["ruseanM300"], "Official application list."),
      package_weight: ready(40, ["ruseanM300"], "Exact official page title and weight field.", "40", "кг"),
      application_area: ready("Внутренние и наружные работы", ["ruseanM300"], "Manual application inside and outside buildings."),
      application_method: ready("Ручное нанесение", ["ruseanM300"], "Official page explicitly says hand application."),
      substrates: ready("Бетонное основание", ["ruseanM300"], "Application instructions call for a sound concrete substrate."),
      color: ready("Серый", ["ruseanM300"], "Official characteristics table."),
      layer_thickness: ready("50–150 мм", ["ruseanM300"], "Official characteristics table."),
      consumption_10mm: unresolved("SOURCE_CONFLICT", "Official description states 18–19 kg/m² at 10 mm; the same page table states 19 kg/m². No value selected.", ["ruseanM300"], "18–19; таблица: 19", "кг/м² при 10 мм", "Official page, prose consumption section versus characteristics table."),
      consumption: notAvailable("The 10 mm consumption conflict is recorded under consumption_10mm; a second generic value is intentionally not duplicated.", ["ruseanM300"]),
      water_requirement: ready("0,13–0,15 л/кг", ["ruseanM300"], "Official table gives 0.13–0.15 L per kg; prose gives the equivalent 1.3–1.5 L per 10 kg.", "0,13–0,15", "л/кг"),
      pot_life: unresolved("NEEDS_MAPPING", "The official prose gives 1.5–2 hours while the characteristics table gives 2 hours; no value is selected because the source statements conflict.", ["ruseanM300"], "1,5–2; таблица: 2", "час", "Official page usage prose and characteristics table."),
      application_temperature: ready("от +5 до +25 °C", ["ruseanM300"], "Official characteristics table."),
      compressive_strength: ready(30, ["ruseanM300"], "Official characteristics table states 30 MPa.", "30", "МПа"),
      adhesion: ready(0.4, ["ruseanM300"], "Official table: adhesion to concrete after 28 days is 0.4 MPa.", "0,4", "МПа"),
      frost_resistance: unresolved("SOURCE_CONFLICT", "Official description labels the product F50; the same page table says F35. No value selected.", ["ruseanM300"], "F50; таблица: F35", null, "Official page description heading versus characteristics table."),
      shelf_life: ready(6, ["ruseanM300"], "Official storage section and characteristics table: 6 months.", "6", "месяцев"),
      standard: ready("ГОСТ 31358-2019", ["ruseanM300"], "Official page product classification."),
      mortar_grade: ready("М-300", ["ruseanM300"], "Official exact product name. Kept distinct from B25 class and 30 MPa strength."),
      walkability: ready("48 часов", ["ruseanM300"], "Official page: minimum strength for walking after 48 hours under +5…+25 °C conditions.", "48", "часов"),
      flexural_strength: notAvailable("No exact flexural-strength value is provided on the reviewed official product page.", ["ruseanM300"])
    }
  },
  {
    externalId: "MAT-000117",
    expectedTitle: "Цементная смесь ремонтная Ceresit CN 83 25 кг",
    expectedSubcategory: "Смесь Ремонтная",
    expectedStructureId: 13,
    expectedParentStructureId: 1,
    brand: "Ceresit",
    sourceKeys: ["ceresitCn83Catalog", "ceresitCn83RuTds"],
    identity: "Exact local model CN 83 and 25 kg match the official Russian catalogue and Russian TDS. No Ukrainian/foreign-market values used.",
    core: {
      brand: ready("Ceresit", ["ceresitCn83Catalog"], "Official Russian catalogue."),
      product_type: ready("Ремонтная смесь для бетона", ["ceresitCn83Catalog"], "Official Russian catalogue heading."),
      base: ready("Цемент, минеральные заполнители, модифицирующие добавки", ["ceresitCn83RuTds"], "RU TDS composition."),
      purpose: ready("Срочный ремонт бетонных и железобетонных конструкций; заполнение выбоин, каверн, дефектов и неровностей глубиной от 5 мм; изготовление стяжек", ["ceresitCn83RuTds"], "RU TDS application section."),
      package_weight: ready(25, ["ceresitCn83RuTds"], "RU TDS: multilayer paper bags of 25 kg.", "25", "кг"),
      application_area: ready("Внутренние и наружные работы", ["ceresitCn83RuTds"], "RU TDS explicitly permits internal and external work."),
      application_method: ready("Шпатель или кельма; для стяжек — виброрейка", ["ceresitCn83RuTds"], "RU TDS application instructions."),
      substrates: ready("Бетон и железобетон; горизонтальные и вертикальные основания", ["ceresitCn83RuTds"], "RU TDS application scope and instructions."),
      color: notAvailable("The reviewed Russian catalogue/TDS does not state the product color.", ["ceresitCn83Catalog", "ceresitCn83RuTds"]),
      layer_thickness: ready("5–35 мм", ["ceresitCn83Catalog", "ceresitCn83RuTds"], "Both RU catalogue and TDS specify 5–35 mm per pass."),
      consumption_10mm: notAvailable("The RU TDS gives consumption per 1 mm; it is retained verbatim in the text consumption attribute instead of deriving a 10 mm figure.", ["ceresitCn83RuTds"]),
      consumption: ready("около 2,0 кг/м² на 1 мм толщины слоя", ["ceresitCn83RuTds"], "RU TDS table, consumption of dry CN 83 per 1 mm layer.", "около 2,0", "кг/м² на 1 мм"),
      water_requirement: ready("3,0–3,2 л на 25 кг сухой смеси", ["ceresitCn83RuTds"], "RU TDS table; do not substitute the Ukrainian document's different range.", "3,0–3,2", "л на 25 кг"),
      pot_life: unresolved("NEEDS_MAPPING", "The RU TDS states about 30 minutes; this batch retains the existing conservative source classification and does not propose a value.", ["ceresitCn83RuTds"], "около 30", "минут", "RU TDS table: time of use."),
      application_temperature: ready("от +5 до +30 °C", ["ceresitCn83RuTds"], "RU TDS: application temperature."),
      compressive_strength: unresolved("NEEDS_MAPPING", "RU TDS has separate minimum values for 1 day and 28 days (13 MPa and 36 MPa); the numeric definition cannot preserve both age qualifiers.", ["ceresitCn83RuTds"], "не менее 13 (1 сутки); не менее 36 (28 суток)", "МПа", "RU TDS technical table."),
      adhesion: unresolved("NEEDS_MAPPING", "RU TDS gives a minimum 1.0 MPa at 28 days, with a footnote requiring a CC 81 adhesion layer; scalar definition would lose both qualifiers.", ["ceresitCn83RuTds"], "не менее 1,0 через 28 суток*", "МПа", "RU TDS technical table; *when using CC 81 adhesion layer."),
      frost_resistance: ready("F300 (затвердевший раствор); Fкз100 (контактная зона)", ["ceresitCn83RuTds"], "RU TDS separates hardened mortar and contact-zone frost resistance."),
      shelf_life: ready(12, ["ceresitCn83RuTds"], "RU TDS: up to 12 months from manufacture in intact packaging, dry storage.", "12", "месяцев"),
      standard: notAvailable("The reviewed Russian TDS extract does not provide a sufficiently clear standard mapping for a canonical value.", ["ceresitCn83RuTds"]),
      mortar_grade: notAvailable("No separate mortar-grade value is used; classification codes are not mapped into mortar_grade.", ["ceresitCn83RuTds"]),
      walkability: ready("через 6 часов", ["ceresitCn83RuTds"], "RU TDS: technological passage after 6 hours.", "6", "часов"),
      flexural_strength: ready("не менее 2,5 МПа (1 сутки); не менее 5,0 МПа (28 суток)", ["ceresitCn83RuTds"], "RU TDS gives separate minimum values by age; text type preserves both qualifiers.")
    }
  },
  {
    externalId: "MAT-000118",
    expectedTitle: "Цементная смесь ремонтная тиксотропная GLIMS CRT-40 25 кг",
    expectedSubcategory: "Смесь Ремонтная",
    expectedStructureId: 13,
    expectedParentStructureId: 1,
    brand: "GLIMS",
    sourceKeys: ["glimsProCrt40", "glimsProCrt40Tds"],
    identity: "Exact PRO CRT-40, 25 kg, article О00010269/EAN 4607009095967. CRT-40 AF is a separate product (article О00014105) and is excluded.",
    core: {
      brand: ready("GLIMS", ["glimsProCrt40"], "Official product name."),
      product_type: ready("Ремонтная тиксотропная смесь класса R3", ["glimsProCrt40"], "Official product page classification."),
      base: ready("Цементное вяжущее, фракционированный песок, минеральные наполнители и химические добавки; полимерная фибра", ["glimsProCrt40"], "Official product page composition; phrasing follows manufacturer list."),
      purpose: ready("Конструкционный ремонт бетонных и железобетонных конструкций", ["glimsProCrt40"], "Official page scope and stated use."),
      package_weight: ready(25, ["glimsProCrt40"], "Official product page shows 25 kg; exact product page and EAN match the local model.", "25", "кг"),
      application_area: ready("Внутренние и наружные работы", ["glimsProCrt40"], "Official page explicitly states indoor and outdoor use."),
      application_method: ready("Ручное нанесение шпателем", ["glimsProCrt40"], "Official application instructions say to fill defects and level with a spatula; no machine application inferred."),
      substrates: ready("Бетон, железобетон и другие минеральные основания", ["glimsProCrt40"], "Official page application substrates."),
      color: ready("Серый", ["glimsProCrt40"], "Official characteristics table."),
      layer_thickness: ready("10–40 мм", ["glimsProCrt40"], "Official page layer range."),
      consumption_10mm: notAvailable("The official source states consumption per 1 mm; no derived 10 mm number is written.", ["glimsProCrt40"]),
      consumption: ready("1,8 кг/м² на каждый 1 мм слоя", ["glimsProCrt40"], "Official characteristics table gives 1.8 kg/m² at 1 mm." , "1,8", "кг/м² на 1 мм"),
      water_requirement: ready("0,16–0,17 л/кг (4,0–4,25 л на 25 кг)", ["glimsProCrt40"], "Official page states both normalized per kg and exact 25 kg bag range.", "0,16–0,17; 4,0–4,25", "л/кг; л на 25 кг"),
      pot_life: unresolved("NEEDS_MAPPING", "The official source states at least 30 minutes; this batch retains the existing conservative source classification and does not propose a value.", ["glimsProCrt40"], "не менее 30", "минут", "Official characteristics and application instructions."),
      application_temperature: ready("от +5 до +35 °C", ["glimsProCrt40"], "Official page: substrate and air temperature during application and curing."),
      compressive_strength: unresolved("NEEDS_MAPPING", "Official page gives separate minimum values after 1 day and 28 days (15 MPa and 40 MPa); numeric definition cannot preserve age qualifiers.", ["glimsProCrt40"], "не менее 15 (1 сутки); не менее 40 (28 суток)", "МПа", "Official characteristics table."),
      adhesion: unresolved("NEEDS_MAPPING", "Official source says adhesion is at least 1.5 MPa; numeric definition cannot preserve the threshold qualifier.", ["glimsProCrt40"], "не менее 1,5", "МПа", "Official characteristics table."),
      frost_resistance: ready("F2 300", ["glimsProCrt40"], "Official page's exact typography for frost resistance: F2 300."),
      shelf_life: ready(12, ["glimsProCrt40"], "Official page: 12 months in intact factory packaging under stated dry-storage conditions.", "12", "месяцев"),
      standard: ready("ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2", ["glimsProCrt40"], "Official product page normative section."),
      mortar_grade: notAvailable("No mortar-grade value is stated; B20 substrate qualification is not a mortar grade and is not mapped here.", ["glimsProCrt40"]),
      walkability: notAvailable("No walkability time is provided by the reviewed official source.", ["glimsProCrt40"]),
      flexural_strength: ready("не менее 8 МПа", ["glimsProCrt40"], "Official characteristics table; text definition preserves the minimum qualifier.")
    }
  }
]);

const TEMPLATE_AUDIT = Object.freeze([
  { structureId: 11, subcategory: "Пескобетон", template: "none; supported generic no-membership fallback", existingMemberships: [], requiredMemberships: [], missingMemberships: [], definitionsReused: CORE_ORDER, definitionsMissing: [], ordering: "Global main fields first (brand, product_type, shelf_life, package_weight); regular attributes use definition sort_order, then label, then definition id.", section: "main fields handled globally; remaining fields use regular fallback", readiness: "TEMPLATE_READY" },
  { structureId: 12, subcategory: "Цемент", template: "none; sibling unclosed structure, not a target", existingMemberships: [], requiredMemberships: [], missingMemberships: [], definitionsReused: [], definitionsMissing: [], ordering: "Generic no-membership fallback; main fields first; regular attributes use definition sort_order, label and id. Included as architecture context only.", section: "main fields globally; remaining regular fallback", readiness: "TEMPLATE_READY" },
  { structureId: 13, subcategory: "Смесь Ремонтная", template: "none; supported generic no-membership fallback", existingMemberships: [], requiredMemberships: [], missingMemberships: [], definitionsReused: CORE_ORDER, definitionsMissing: [], ordering: "Global main fields first (brand, product_type, shelf_life, package_weight); regular attributes use definition sort_order, then label, then definition id.", section: "main fields handled globally; remaining fields use regular fallback", readiness: "TEMPLATE_READY" }
]);

module.exports = { CHECKED_AT, CONFIRM, BATCH_MATS, EXPECTED_CATEGORY, CORE_ORDER, DEFINITIONS, PRODUCTS, SOURCES, TEMPLATE_AUDIT };
