"use strict";

const DISCOVERY = require("../../../docs/product-content/floor-mixes-discovery-review.json");

const CHECKED_AT = "2026-09-24";
const EXPECTED_CATEGORY = "Смеси";
const EXPECTED_SUBCATEGORIES = Object.freeze(["Наливной Пол", "Стяжки Пола"]);
const SHARED_PLACEHOLDER = "/uploads/products/MAT-000001-20260714153714969-3fb7fe.png";
const CONFIRMED_MATS = Object.freeze(DISCOVERY.scope.externalIds);
const READY_MATS = Object.freeze(DISCOVERY.summary.readyForCoreReview);

const SOURCES = Object.freeze({
  unisArmoredCurrent: { title: "UNIS Горизонт Армированный — текущая карточка производителя", owner: "UNIS", url: "https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/", provenanceNote: "Для canonical current значений приоритет у текущей карточки производителя. Официальный TDS той же линейки указывает 25–30 МПа (в зависимости от площадки) и верхнюю границу воды 4 л; в его вводном списке слоя также есть 10–100 мм при 10–200 мм в таблице. Текущая карточка указывает 30 МПа, 2,75–3,75 л на 25 кг и 10–200 мм. Различия сохранены и не усредняются." },
  unisArmoredTds: { title: "UNIS Горизонт Армированный — официальный технический лист", owner: "UNIS", url: "https://unistrom.ru/upload/iblock/112/q1w1m0wsq0d9yzebod4boxlbzsayelji.pdf", provenanceNote: "Используется для диапазона температуры выполнения работ от +5 до +30 °C. Для compressive strength и воды текущая карточка производителя имеет приоритет; различия версии явно описаны у unisArmoredCurrent." },
  unisM45OwnerPack: { title: "Owner-provided MAT-000075 package image", owner: "Owner supplied", kind: "owner-identity-evidence", url: null, provenanceNote: "На упаковке указаны UNIS, ГОРИЗОНТ УНИВЕРСАЛЬНЫЙ М-45, наливной пол армированный быстротвердеющий и ГОСТ 31358-2019. Подтверждает точный 20 кг вариант/маркировку; не является источником технических параметров." },
  unisM45Current: { title: "UNIS Горизонт Универсальный М-45 — current official product page", owner: "UNIS", url: "https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/", market: "RU", provenanceNote: "Текущая карточка называет продукт Горизонт Универсальный М-45; объясняет переименование прежней линейки Горизонт Универсальный / F-45 без изменения формулы. Перечисляет фасовки 20/25 кг, состав, область, применение и технические параметры." },
  unisM45Tds: { title: "UNIS Горизонт Универсальный М-45 — official technical sheet", owner: "UNIS", url: "https://unistrom.ru/upload/iblock/7c4/qwogsbpzwhq3wvfbor2cxgtb0ddfzwvh.pdf", market: "RU", provenanceNote: "Официальный TDS с точной маркировкой М-45. Указывает 0,17–0,22 л/кг, слой 3–100 мм, расход 15–17 кг/м² при 10 мм, жизнеспособность не менее 40 минут, температуру +5…+30 °C, хождение 2–3 часа, адгезию не менее 0,7 МПа и хранение 12 месяцев. Прочность на сжатие дана диапазоном/по площадкам и не записывается в числовое поле." },
  unisM45OwnerIdentity: { title: "Owner decision on legacy MAT-000075 title", owner: "Owner supplied", kind: "owner-identity-and-write-policy", url: null, provenanceNote: "Текущий title и slug сохраняются; legacy title используется только как точный guard и не служит техническим источником." },
  starateliCatalog: { title: "Старатели — наливные полы", owner: "Старатели", url: "https://www.starateli.ru/nalivnoy-pol/" },
  starateli77OwnerPack: { title: "Owner-provided MAT-000077 package image", owner: "Owner supplied", kind: "owner-identity-evidence", url: null, provenanceNote: "На упаковке указаны Старатели, НАЛИВНОЙ ПОЛ, БЫСТРОТВЕРДЕЮЩИЙ, САМОНИВЕЛИРУЮЩИЙСЯ, 20 кг и ГОСТ 31358-2019. Подтверждает точный 20 кг SKU; слово «Быстрый» из legacy title не является техническим источником." },
  starateli77Official: { title: "Старатели — Наливной пол Быстротвердеющий 20 кг", owner: "Старатели", url: "https://www.starateli.ru/nalivnoi_pol_bistrodeistvuyushiy/", market: "RU", provenanceNote: "Официальная текущая страница производителя. Явно перечисляет 20/25 кг, состав, назначение, применения/основания, ручной и механизированный способ, слой 3–100 мм, расход, воду на 20 кг, жизнеспособность, температуру, хождение, адгезию и срок хранения." },
  starateli77OwnerIdentity: { title: "Owner decision on legacy MAT-000077 title", owner: "Owner supplied", kind: "owner-identity-and-write-policy", url: null, provenanceNote: "Текущий title и slug сохраняются; слово «Быстрый» остаётся только в exact guard и не переносится в новые характеристики, описания или SEO." },
  starateliThick: { title: "Старатели Толстый", owner: "Старатели", url: "https://market.starateli.ru/products/nalivnye-poly/nalivnoj-pol-tolstyj/" },
  vetonit3000: { title: "Vetonit 3000", owner: "Vetonit", url: "https://vetonit.com/product/vetonit_3000_20kg/" },
  vetonitFast4000: { title: "Vetonit fast 4000", owner: "Vetonit", url: "https://vetonit.com/product/vetonit_fast_4000_20kg/" },
  vetonit4100: { title: "Vetonit 4100", owner: "Vetonit", url: "https://vetonit.com/product/vetonit_4100_20kg/" },
  vetonit5000: { title: "Vetonit 5000", owner: "Vetonit", url: "https://www.vetonit.com/product/vetonit_5000_25kg/" },
  litokolS10: { title: "Litokol LITOLIV S10 EXPRESS", owner: "Litokol", url: "https://www.litokol.ru/catalog/litoliv-s10-express/" },
  litokolS50: { title: "Litokol LITOLIV S50 EVO", owner: "Litokol", url: "https://litokol-market.ru/catalog/styazhki-i-nalivnye-poly/litoliv-s50-evo/?offer=1005" },
  volmaExpress: { title: "ВОЛМА-Нивелир Экспресс", owner: "ВОЛМА", url: "https://www.volma.ru/production/catalog/mixtures-for-floor-leveling/volma-nivelir-ekspress-25kg/" },
  osnovitFk45: { title: "Основит Скорлайн FK45 R", owner: "Основит", url: "https://www.osnovit.msk.ru/fk45r" },
  ceresitCn175: { title: "Ceresit CN 175 Super", owner: "Ceresit/Henkel", url: "https://www.ceresit.ru/ru/products/flooring/levelling-compounds/cn_175_super", tds: "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CN175-" },
  knaufUbo: { title: "KNAUF Ubo", owner: "KNAUF", url: "https://www.knauf.ru/upload/iblock/dc7/dxgmyqn4icdelrl4jzevwo2w26lb633j/34_IL_KNAUF_Ubo_25_03_2025_v01_Preview.pdf", catalog: "https://www.knauf.ru/upload/iblock/f14/fpvhzrlva5q9ra48tx3iajbx1aua443o/KNAUF-Katalog-produktsii-Blok-_10_03_2025_-v10-Preview.pdf" },
  osnovitFc41: { title: "Основит Стартолайн FC41 H", owner: "Основит", url: "https://osnovit.ru/articles/sravnenie-trekh-tipov-styazhek-osnovit-startolayn-legkaya-fc43-l-fc41-h-i-fc40/", catalog: "https://osnovit.ru/catalog/styazhki/" },
  unisFamily: { title: "UNIS Горизонт family", owner: "UNIS", url: "https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj/", variant: "https://unistrom.ru/catalog/ustrojstvo-polov/nalivnye-poly/gorizont-universalnyj-monolit/" }
});

const REUSABLE_DEFINITIONS = Object.freeze({
  brand: { label: "Бренд", dataType: "text", defaultUnit: null },
  product_type: { label: "Тип продукта", dataType: "text", defaultUnit: null },
  base: { label: "Основа", dataType: "text", defaultUnit: null },
  purpose: { label: "Назначение", dataType: "text", defaultUnit: null },
  package_weight: { label: "Фасовка", dataType: "number", defaultUnit: "кг" },
  consumption_10mm: { label: "Расход при слое 10 мм", dataType: "text", defaultUnit: "кг/м²" },
  application_area: { label: "Область применения", dataType: "text", defaultUnit: null },
  application_method: { label: "Способ нанесения", dataType: "text", defaultUnit: null },
  substrates: { label: "Основания", dataType: "text", defaultUnit: null },
  color: { label: "Цвет", dataType: "text", defaultUnit: null },
  layer_thickness: { label: "Толщина слоя", dataType: "text", defaultUnit: null },
  water_requirement: { label: "Расход воды", dataType: "text", defaultUnit: null },
  pot_life: { label: "Жизнеспособность раствора", dataType: "text", defaultUnit: null },
  application_temperature: { label: "Температура основания и воздуха", dataType: "text", defaultUnit: null },
  compressive_strength: { label: "Прочность на сжатие", dataType: "number", defaultUnit: "МПа" },
  adhesion: { label: "Адгезия", dataType: "number", defaultUnit: "МПа" },
  frost_resistance: { label: "Морозостойкость", dataType: "text", defaultUnit: null },
  shelf_life: { label: "Срок хранения", dataType: "number", defaultUnit: "месяцев" },
  standard: { label: "Стандарт", dataType: "text", defaultUnit: null },
  mortar_grade: { label: "Марка раствора", dataType: "text", defaultUnit: null },
  consumption: { label: "Расход", dataType: "text", defaultUnit: null },
  flexural_strength: { label: "Прочность на изгиб", dataType: "text", defaultUnit: null },
  walkability: { label: "Возможность хождения", dataType: "text", defaultUnit: null }
});

const NEW_DEFINITIONS = Object.freeze([
  { code: "consumption", ...REUSABLE_DEFINITIONS.consumption },
  { code: "flexural_strength", ...REUSABLE_DEFINITIONS.flexural_strength },
  { code: "walkability", ...REUSABLE_DEFINITIONS.walkability }
]);

const CORE_ORDER = Object.freeze([
  "brand", "product_type", "base", "purpose", "package_weight", "application_area", "application_method", "substrates", "color", "layer_thickness", "consumption_10mm", "water_requirement", "pot_life", "application_temperature", "compressive_strength", "adhesion", "frost_resistance", "shelf_life", "standard", "mortar_grade", "consumption", "flexural_strength", "walkability"
]);

const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["brand", "image_url"]);
const discoveryById = new Map(DISCOVERY.rows.map(row => [row.externalId, row]));
const ready = (value, sources) => ({ status: "READY", value, sources });
const need = (reason, sources) => ({ status: "NEEDS_SOURCE", value: null, sources, reason });
const sourceFor = id => discoveryById.get(id)?.primarySource?.url ? [id] : [];
const sourceKeys = (...keys) => keys;

function expectedTitle(externalId) { return discoveryById.get(externalId)?.currentTitle; }
function expectedCategory(externalId) { return discoveryById.get(externalId)?.current?.category; }
function expectedSubcategory(externalId) { return discoveryById.get(externalId)?.current?.subcategory; }
function localState(externalId) { return discoveryById.get(externalId)?.current; }
function commonNeeds(sourceKeysForReason, reason = "Exact source does not confirm this field for the local SKU.") {
  return Object.fromEntries(CORE_ORDER.filter(code => code !== "brand").map(code => [code, need(reason, sourceKeysForReason)]));
}
function product(externalId, brand, identityStatus, sources, titleCandidate, core, dedicatedCorrectionOnly = false) {
  const local = localState(externalId);
  if (!local || local.category !== EXPECTED_CATEGORY || !EXPECTED_SUBCATEGORIES.includes(local.subcategory)) throw new Error(`Discovery scope mismatch for ${externalId}`);
  const currentTitle = expectedTitle(externalId);
  const acceptedTitles = identityStatus === "READY_FOR_CORE_REVIEW" && titleCandidate !== currentTitle ? [currentTitle, titleCandidate] : [currentTitle];
  return { externalId, expectedTitle: currentTitle, acceptedTitles, expectedCategory: expectedCategory(externalId), expectedSubcategory: expectedSubcategory(externalId), brand, identityStatus, sourceKeys: sources, titleCandidate, core, ...(dedicatedCorrectionOnly ? { dedicatedCorrectionOnly: true } : {}) };
}

const P075 = commonNeeds(sourceKeys("unisM45OwnerPack", "unisM45Current", "unisM45Tds"));
Object.assign(P075, {
  brand: ready("UNIS", sourceKeys("unisM45OwnerPack", "unisM45Current")),
  product_type: ready("Армированный быстротвердеющий наливной пол", sourceKeys("unisM45OwnerPack", "unisM45Current", "unisM45Tds")),
  base: ready("Композиционное вяжущее, мелкофракционные наполнители, модифицирующие добавки, армирующие волокна", sourceKeys("unisM45Current", "unisM45Tds")),
  purpose: ready("Ручное и машинное выравнивание бетонных полов и цементных стяжек, устранение перепадов под последующую укладку напольных покрытий; системы «Тёплый пол» и «Плавающий пол»", sourceKeys("unisM45Current", "unisM45Tds")),
  package_weight: ready(20, sourceKeys("unisM45OwnerPack", "unisM45Current", "unisM45Tds")),
  application_area: ready("Внутренние отапливаемые помещения с умеренной и повышенной влажностью; системы «Тёплый пол» и «Плавающий пол»", sourceKeys("unisM45Current", "unisM45Tds")),
  application_method: ready("Ручное и машинное", sourceKeys("unisM45Current", "unisM45Tds")),
  substrates: ready("Бетонные, цементно-песчаные, гипсовые и другие недеформирующиеся основания", sourceKeys("unisM45Current", "unisM45Tds")),
  layer_thickness: ready("3–100 мм", sourceKeys("unisM45Current", "unisM45Tds")),
  consumption: ready("15–17 кг/м² при 10 мм", sourceKeys("unisM45Current", "unisM45Tds")),
  water_requirement: ready("0,17–0,22 л/кг", sourceKeys("unisM45Tds")),
  pot_life: ready("не менее 40 минут", sourceKeys("unisM45Current", "unisM45Tds")),
  application_temperature: ready("от +5 до +30 °C", sourceKeys("unisM45Current", "unisM45Tds")),
  adhesion: ready(0.7, sourceKeys("unisM45Current", "unisM45Tds")),
  shelf_life: ready(12, sourceKeys("unisM45Tds")),
  walkability: ready("2–3 часа", sourceKeys("unisM45Current", "unisM45Tds")),
  compressive_strength: need("Официальный источник даёт диапазон 16–20 МПа/зависимость от производственной площадки; текущее числовое поле не может сохранить этот факт без искажения.", sourceKeys("unisM45Current", "unisM45Tds"))
});

const P076 = commonNeeds(sourceKeys("unisArmoredCurrent"), "Текущая карточка UNIS подтверждает identity Горизонт Армированный; неуказанные на ней поля оставлены NEEDS_SOURCE.");
Object.assign(P076, {
  brand: ready("UNIS", sourceKeys("unisArmoredCurrent")),
  product_type: ready("Высокопрочный армированный базовый ровнитель для пола", sourceKeys("unisArmoredCurrent")),
  purpose: ready("Подготовка прочных ровных оснований и стяжек под напольные покрытия и финишные ровнители", sourceKeys("unisArmoredCurrent")),
  package_weight: ready(25, sourceKeys("unisArmoredCurrent")),
  application_area: ready("Внутренние и наружные работы; сухие и влажные помещения", sourceKeys("unisArmoredCurrent")),
  substrates: ready("Бетонные и цементно-песчаные недеформирующиеся основания", sourceKeys("unisArmoredCurrent")),
  layer_thickness: ready("10–200 мм", sourceKeys("unisArmoredCurrent")),
  consumption_10mm: ready("18", sourceKeys("unisArmoredCurrent")),
  water_requirement: ready("2,75–3,75 л на 25 кг", sourceKeys("unisArmoredCurrent")),
  pot_life: ready("2 часа", sourceKeys("unisArmoredCurrent")),
  application_temperature: ready("от +5 до +30 °C", sourceKeys("unisArmoredTds")),
  compressive_strength: ready(30, sourceKeys("unisArmoredCurrent")),
  adhesion: ready(0.3, sourceKeys("unisArmoredCurrent")),
  frost_resistance: ready("50 циклов", sourceKeys("unisArmoredCurrent")),
  shelf_life: ready(12, sourceKeys("unisArmoredCurrent")),
  consumption: ready("1,8 кг/м²/мм", sourceKeys("unisArmoredCurrent")),
  flexural_strength: ready("4 МПа", sourceKeys("unisArmoredCurrent")),
  walkability: ready("12 часов", sourceKeys("unisArmoredCurrent"))
});

const P077 = commonNeeds(sourceKeys("starateli77OwnerPack", "starateli77Official"));
Object.assign(P077, {
  brand: ready("Старатели", sourceKeys("starateli77OwnerPack", "starateli77Official")),
  product_type: ready("Самонивелирующийся быстротвердеющий наливной пол", sourceKeys("starateli77OwnerPack", "starateli77Official")),
  base: ready("Комплексное минеральное вяжущее на основе гипса и цемента, фракционированный песок и модифицирующие добавки", sourceKeys("starateli77Official")),
  purpose: ready("Базовое и финишное выравнивание оснований под последующую укладку напольных покрытий; система «Тёплый пол» и устройство стяжки на разделительном слое", sourceKeys("starateli77Official")),
  package_weight: ready(20, sourceKeys("starateli77OwnerPack", "starateli77Official")),
  application_area: ready("Внутренние работы; помещения с нормальной влажностью; система «Тёплый пол»; стяжка на разделительном слое", sourceKeys("starateli77Official")),
  application_method: ready("Ручное и механизированное", sourceKeys("starateli77Official")),
  substrates: ready("Бетон, цементные стяжки, гипсовые и ангидридные основания", sourceKeys("starateli77Official")),
  layer_thickness: ready("3–100 мм", sourceKeys("starateli77Official")),
  consumption: ready("около 14,5 кг/м² при 10 мм", sourceKeys("starateli77Official")),
  water_requirement: ready("5,0–6,0 л на 20 кг", sourceKeys("starateli77Official")),
  pot_life: ready("не менее 40 минут", sourceKeys("starateli77Official")),
  application_temperature: ready("от +5 до +30 °C", sourceKeys("starateli77Official")),
  adhesion: ready(0.8, sourceKeys("starateli77Official")),
  flexural_strength: ready("не менее 4 МПа", sourceKeys("starateli77Official")),
  shelf_life: ready(12, sourceKeys("starateli77Official")),
  walkability: ready("4 часа", sourceKeys("starateli77Official")),
  compressive_strength: need("Официальный источник даёт диапазон 16–20 МПа; текущее числовое поле не может сохранить диапазон без искажения.", sourceKeys("starateli77Official")),
});

const P078 = commonNeeds(sourceKeys("starateliThick"));
Object.assign(P078, { brand: ready("Старатели", sourceKeys("starateliThick")), base: ready("Цементное вяжущее", sourceKeys("starateliThick")), package_weight: ready(25, sourceKeys("starateliThick")), application_area: ready("Внутренние и наружные работы; нормальная и высокая влажность", sourceKeys("starateliThick")), application_method: ready("Ручное и механизированное", sourceKeys("starateliThick")), layer_thickness: ready("30–100 мм", sourceKeys("starateliThick")), water_requirement: ready("5–6 л на 25 кг", sourceKeys("starateliThick")), consumption: ready("16–18 кг/м² при 10 мм", sourceKeys("starateliThick")), flexural_strength: ready("≥5 МПа", sourceKeys("starateliThick")), walkability: ready("24 часа", sourceKeys("starateliThick")) });

const P079 = commonNeeds(sourceKeys("vetonit3000"));
Object.assign(P079, { brand: ready("Weber Vetonit", sourceKeys("vetonit3000")), product_type: ready("Финишный самовыравнивающийся пол", sourceKeys("vetonit3000")), package_weight: ready(20, sourceKeys("vetonit3000")), application_method: ready("Ручное нанесение", sourceKeys("vetonit3000")), layer_thickness: ready("1–5 мм", sourceKeys("vetonit3000")), compressive_strength: ready(20, sourceKeys("vetonit3000")), adhesion: ready(1, sourceKeys("vetonit3000")), consumption: ready("1,5 кг/м²/мм", sourceKeys("vetonit3000")), flexural_strength: ready("5 МПа", sourceKeys("vetonit3000")), walkability: ready("3–4 часа", sourceKeys("vetonit3000")) });

const P080 = commonNeeds(sourceKeys("vetonitFast4000"));
Object.assign(P080, { brand: ready("Weber Vetonit", sourceKeys("vetonitFast4000")), package_weight: ready(20, sourceKeys("vetonitFast4000")), application_area: ready("Сухие и влажные помещения", sourceKeys("vetonitFast4000")), application_method: ready("Ручное и механизированное", sourceKeys("vetonitFast4000")), layer_thickness: ready("3–80 мм", sourceKeys("vetonitFast4000")), water_requirement: ready("5,2–5,4 л на 20 кг", sourceKeys("vetonitFast4000")), compressive_strength: ready(16, sourceKeys("vetonitFast4000")), adhesion: ready(0.6, sourceKeys("vetonitFast4000")), application_temperature: ready("от +10 до +25 °C", sourceKeys("vetonitFast4000")), walkability: ready("4 часа", sourceKeys("vetonitFast4000")) });

const P081 = commonNeeds(sourceKeys("vetonit4100"));
Object.assign(P081, { brand: ready("Weber Vetonit", sourceKeys("vetonit4100")), package_weight: ready(20, sourceKeys("vetonit4100")), application_method: ready("Ручное и механизированное", sourceKeys("vetonit4100")), layer_thickness: ready("2–30 мм", sourceKeys("vetonit4100")), consumption: ready("1,6 кг/м²/мм", sourceKeys("vetonit4100")), water_requirement: ready("4,4–4,8 л на 20 кг", sourceKeys("vetonit4100")), compressive_strength: ready(20, sourceKeys("vetonit4100")), adhesion: ready(1, sourceKeys("vetonit4100")), application_temperature: ready("от +10 до +25 °C", sourceKeys("vetonit4100")), flexural_strength: ready("5 МПа", sourceKeys("vetonit4100")), walkability: ready("3–4 часа", sourceKeys("vetonit4100")) });

const P082 = commonNeeds(sourceKeys("vetonit5000"));
Object.assign(P082, { brand: ready("Weber Vetonit", sourceKeys("vetonit5000")), package_weight: ready(25, sourceKeys("vetonit5000")), application_area: ready("Внутренние сухие и влажные помещения", sourceKeys("vetonit5000")), application_method: ready("Ручное нанесение", sourceKeys("vetonit5000")), layer_thickness: ready("5–50 мм; локально до 80 мм", sourceKeys("vetonit5000")), consumption: ready("1,8 кг/м²/мм", sourceKeys("vetonit5000")), water_requirement: ready("3–3,5 л на 25 кг", sourceKeys("vetonit5000")), compressive_strength: ready(20, sourceKeys("vetonit5000")), adhesion: ready(1, sourceKeys("vetonit5000")), flexural_strength: ready("5 МПа", sourceKeys("vetonit5000")), walkability: ready("3–4 часа", sourceKeys("vetonit5000")) });

const P083 = commonNeeds(sourceKeys("litokolS10"));
Object.assign(P083, { brand: ready("Litokol", sourceKeys("litokolS10")), product_type: ready("Тонкослойный самовыравнивающийся состав", sourceKeys("litokolS10")), package_weight: ready(20, sourceKeys("litokolS10")), application_area: ready("Внутренние помещения, включая теплый пол", sourceKeys("litokolS10")), substrates: ready("Бетонные и цементные/гипсовые стяжки", sourceKeys("litokolS10")), layer_thickness: ready("1–10 мм", sourceKeys("litokolS10")) });

const P084 = commonNeeds(sourceKeys("litokolS50"));
Object.assign(P084, { brand: ready("Litokol", sourceKeys("litokolS50")), package_weight: ready(20, sourceKeys("litokolS50")), layer_thickness: ready("2–100 мм", sourceKeys("litokolS50")), water_requirement: ready("4,2–4,6 л на 20 кг", sourceKeys("litokolS50")), application_temperature: ready("от +5 до +35 °C", sourceKeys("litokolS50")), walkability: ready("2–4 часа", sourceKeys("litokolS50")), shelf_life: ready(12, sourceKeys("litokolS50")) });

const P085 = commonNeeds(sourceKeys("volmaExpress"));
Object.assign(P085, { brand: ready("ВОЛМА", sourceKeys("volmaExpress")), package_weight: ready(25, sourceKeys("volmaExpress")), layer_thickness: ready("2–100 мм", sourceKeys("volmaExpress")), water_requirement: ready("0,29–0,34 л/кг", sourceKeys("volmaExpress")), application_temperature: ready("от +5 до +30 °C", sourceKeys("volmaExpress")), walkability: ready("3 часа", sourceKeys("volmaExpress")), shelf_life: ready(12, sourceKeys("volmaExpress")) });

const P086 = commonNeeds(sourceKeys("osnovitFk45"));
Object.assign(P086, { brand: ready("Основит", sourceKeys("osnovitFk45")), package_weight: ready(20, sourceKeys("osnovitFk45")), application_area: ready("Внутренние сухие и влажные помещения", sourceKeys("osnovitFk45")), application_method: ready("Ручное и механизированное", sourceKeys("osnovitFk45")), substrates: ready("Бетон, гипсовые и цементно-песчаные основания", sourceKeys("osnovitFk45")), layer_thickness: ready("2–100 мм", sourceKeys("osnovitFk45")), water_requirement: ready("0,26–0,27 л/кг", sourceKeys("osnovitFk45")), application_temperature: ready("от +5 до +30 °C", sourceKeys("osnovitFk45")), walkability: ready("4 часа", sourceKeys("osnovitFk45")), shelf_life: ready(12, sourceKeys("osnovitFk45")) });

const P087 = commonNeeds(sourceKeys("ceresitCn175"));
Object.assign(P087, { brand: ready("Ceresit", sourceKeys("ceresitCn175")), package_weight: ready(20, sourceKeys("ceresitCn175")), application_method: ready("Ручное и механизированное", sourceKeys("ceresitCn175")), layer_thickness: ready("3–60 мм", sourceKeys("ceresitCn175")), water_requirement: ready("около 3,6 л на 20 кг; 4,5 л на 25 кг", sourceKeys("ceresitCn175")), application_temperature: ready("от +5 до +30 °C", sourceKeys("ceresitCn175")), consumption: ready("около 1,8 кг/м²/мм", sourceKeys("ceresitCn175")), walkability: ready("не менее 5 часов", sourceKeys("ceresitCn175")) });

const P089 = commonNeeds(sourceKeys("knaufUbo"));
Object.assign(P089, { brand: ready("KNAUF", sourceKeys("knaufUbo")), base: ready("Специальный цемент и гранулы полистирола", sourceKeys("knaufUbo")), purpose: ready("Легкая стяжка для слабых оснований и размещения коммуникаций", sourceKeys("knaufUbo")), package_weight: ready(25, sourceKeys("knaufUbo")), layer_thickness: ready("3–30 см", sourceKeys("knaufUbo")), walkability: ready("48 часов", sourceKeys("knaufUbo")), shelf_life: ready(12, sourceKeys("knaufUbo")), flexural_strength: ready(">0,5 МПа", sourceKeys("knaufUbo")) });

const P090 = commonNeeds(sourceKeys("osnovitFc41"), "Exact current FC41 H TDS is required for this technical field.");
Object.assign(P090, { brand: ready("Основит", sourceKeys("osnovitFc41")), product_type: ready("Высокопрочная стяжка", sourceKeys("osnovitFc41")), package_weight: ready(25, sourceKeys("osnovitFc41")), application_area: ready("Внутренние и наружные работы; тёплый пол", sourceKeys("osnovitFc41")) });

const PRODUCTS = Object.freeze([
  product("MAT-000075", "UNIS", "READY_FOR_CORE_REVIEW", ["unisM45OwnerPack", "unisM45Current", "unisM45Tds", "unisM45OwnerIdentity"], "Наливной пол \"Unis Горизонт\" 20 кг", P075, true),
  product("MAT-000076", "UNIS", "READY_FOR_CORE_REVIEW", ["unisArmoredCurrent"], "Наливной пол UNIS Горизонт Армированный 25 кг", P076),
  product("MAT-000077", "Старатели", "READY_FOR_CORE_REVIEW", ["starateli77OwnerPack", "starateli77Official", "starateli77OwnerIdentity"], "Наливной пол \"Старатели\" Быстрый 20 кг", P077, true),
  product("MAT-000078", "Старатели", "READY_FOR_CORE_REVIEW", ["starateliThick"], "Наливной пол Старатели Толстый 25 кг", P078),
  product("MAT-000079", "Weber Vetonit", "READY_FOR_CORE_REVIEW", ["vetonit3000"], "Наливной пол Weber Vetonit 3000 20 кг", P079),
  product("MAT-000080", "Weber Vetonit", "READY_FOR_CORE_REVIEW", ["vetonitFast4000"], "Наливной пол Weber Vetonit fast 4000 20 кг", P080),
  product("MAT-000081", "Weber Vetonit", "READY_FOR_CORE_REVIEW", ["vetonit4100"], "Наливной пол Weber Vetonit 4100 20 кг", P081),
  product("MAT-000082", "Weber Vetonit", "READY_FOR_CORE_REVIEW", ["vetonit5000"], "Наливной пол Weber Vetonit 5000 25 кг", P082),
  product("MAT-000083", "Litokol", "READY_FOR_CORE_REVIEW", ["litokolS10"], "Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг", P083),
  product("MAT-000084", "Litokol", "READY_FOR_CORE_REVIEW", ["litokolS50"], "Наливной пол Litokol LITOLIV S50 EVO 20 кг", P084),
  product("MAT-000085", "ВОЛМА", "READY_FOR_CORE_REVIEW", ["volmaExpress"], "Наливной пол ВОЛМА-Нивелир Экспресс 25 кг", P085),
  product("MAT-000086", "Основит", "READY_FOR_CORE_REVIEW", ["osnovitFk45"], "Наливной пол Основит Скорлайн FK45 R 20 кг", P086),
  product("MAT-000087", "Ceresit", "READY_FOR_CORE_REVIEW", ["ceresitCn175"], "Наливной пол Ceresit CN 175 Super 20 кг", P087),
  product("MAT-000089", "KNAUF", "READY_FOR_CORE_REVIEW", ["knaufUbo"], "Легкая стяжка пола KNAUF Ubo 25 кг", P089),
  product("MAT-000090", "Основит", "PARTIAL", ["osnovitFc41"], "Стяжка пола Основит Стартолайн FC41 H 25 кг", P090)
]);

if (CONFIRMED_MATS.length !== 15 || PRODUCTS.length !== 15 || READY_MATS.length !== 12) throw new Error("Discovery scope/status contract mismatch");
if (PRODUCTS.some(item => !CONFIRMED_MATS.includes(item.externalId))) throw new Error("Product outside discovery scope");

module.exports = { CHECKED_AT, DISCOVERY, EXPECTED_CATEGORY, EXPECTED_SUBCATEGORIES, SHARED_PLACEHOLDER, CONFIRMED_MATS, READY_MATS, SOURCES, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, PRODUCT_MUTABLE_FIELDS_EXACTLY, PRODUCTS };
