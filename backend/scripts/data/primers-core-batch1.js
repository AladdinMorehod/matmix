"use strict";

const CHECKED_AT = "2026-09-18";

const SOURCES = Object.freeze({
  knaufTiefengrund: { title: "KNAUF Tiefengrund — официальный сайт", url: "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/gruntovki/knauf-tifengrund/", owner: "KNAUF" },
  knaufMultigrund: { title: "KNAUF Multigrund — официальный сайт", url: "https://www.knauf.ru/catalog/gruntovki/knauf-multigrund/", owner: "KNAUF" },
  ceresitCt17: { title: "Ceresit CT 17 PRO — официальный сайт", url: "https://www.ceresit.ru/ru/products/tiling/supplementary-materials/ct_17_pro", owner: "Ceresit" },
  ceresitCt17Tds: { title: "Ceresit CT 17 — официальный TDS", url: "https://dm.henkel-dam.com/is/content/henkel/ru-ceresit-tds-CT17-new", owner: "Henkel/Ceresit" },
  ceresitCt16: { title: "Ceresit CT 16 — официальный TDS", url: "https://dm.henkel-dam.com/is/content/henkel/tds-ru-ceresit-ct16pdf", owner: "Henkel/Ceresit" },
  ceresitFacade: { title: "Ceresit facade plasters — официальный каталог", url: "https://www.ceresit.ru/ru/products/etics/facade-plasters", owner: "Ceresit" },
  starateli: { title: "Старатели — Грунтовка Универсальная", url: "https://www.starateli.ru/gruntovka_universalnaya/", owner: "Старатели" },
  unisCatalog: { title: "UNIS — каталог грунтовок", url: "https://unistrom.ru/catalog/grunty/gruntovki-10-litrov/", owner: "UNIS" },
  unisRetailer: { title: "UNIS — exact 10 l retailer context", url: "https://www.unimart24.ru/product/gruntovka-glubokogo-proniknoveniya-unis-kanistra-10-l/", owner: "UNIS / retailer" },
  knaufMittelgrund: { title: "KNAUF Mittelgrund — официальный сайт", url: "https://www.knauf.ru/catalog/gruntovki/knauf-mittelgrund/", owner: "KNAUF" },
  tikkurila: { title: "Tikkurila Euro Primer — regional product page", url: "https://tikkurila-russia.ru/tikkurila-euro-primer", owner: "Tikkurila regional" },
  tikkurilaCatalog: { title: "Tikkurila — catalog PDF", url: "https://tikkurila-color.ru/upload/iblock/b78/8ru2u12d2dcid0ndjs6k284anryu30xu.pdf", owner: "Tikkurila regional" },
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
const p = (externalId, expectedTitle, brand, core, meta = {}) => ({ externalId, expectedTitle, expectedCategory: "Грунт / БетонКонтакт", expectedSubcategory: "Грунтовка", brand, core, sourceKeys: meta.sourceKeys || [...new Set(Object.values(core).flatMap(v => v.sources || []))], ...meta });
const commonReady = (source, brand, productType, base, purpose, area, substrates, extra) => ({
  brand: ready(brand, [source]), product_type: ready(productType, [source]), base: ready(base, [source]), purpose: ready(purpose, [source]),
  primer_type: ready(extra.primerType, [source]), application_area: ready(area, [source]), application_method: need("Source registry does not contain an exact application-method statement for this SKU.", [source]),
  substrates: ready(substrates, [source]), consumption: ready(extra.consumption, [source]), drying_time: ready(extra.drying, [source]),
  dilution_ratio: extra.dilution ? ready(extra.dilution, [source]) : absent("Готовый состав; разбавление не заявлено для этого SKU.", [source]),
  concentrate: ready(Boolean(extra.concentrate), [source]), color: extra.color ? ready(extra.color, [source]) : need("Цвет exact SKU не подтверждён в source registry.", [source]),
  application_temperature: extra.temperature ? ready(extra.temperature, [source]) : need("Температура применения не подтверждена в source registry.", [source]),
  shelf_life: extra.shelfLife ? ready(extra.shelfLife, [source]) : need("Срок хранения в месяцах не подтверждён для exact SKU.", [source])
});

function withPackage(core, packageProposal) { return { ...core, ...packageProposal }; }

const PRODUCTS = Object.freeze([
  p("MAT-000227", "Грунтовка Knauf Тифенгрунд 5 л", "KNAUF", withPackage(commonReady("knaufTiefengrund", "KNAUF", "Грунтовка глубокого проникновения", "Полимерная дисперсия", "Укрепление основания, снижение впитываемости и улучшение адгезии", "Внутренние и наружные работы", "ГКЛ/ГВЛ, гипсовые и цементные штукатурки, ПГП, стяжки", { primerType: "Глубокого проникновения", consumption: "0,1 кг/м²", drying: "3 часа", color: "Белый", shelfLife: 12 }), { package_weight: ready(5, ["knaufTiefengrund"]), package_volume: need("Local title says 5 л, while the official source confirms 5 кг; no kg→l conversion is allowed.", ["knaufTiefengrund"]) }), { sourceKeys: ["knaufTiefengrund", ...local], titleStatus: "TITLE_UNIT_MISMATCH" }),
  p("MAT-000228", "Грунтовка Knauf Тифенгрунд 10 л", "KNAUF", withPackage(commonReady("knaufTiefengrund", "KNAUF", "Грунтовка глубокого проникновения", "Полимерная дисперсия", "Укрепление основания, снижение впитываемости и улучшение адгезии", "Внутренние и наружные работы", "ГКЛ/ГВЛ, гипсовые и цементные штукатурки, ПГП, стяжки", { primerType: "Глубокого проникновения", consumption: "0,1 кг/м²", drying: "3 часа", color: "Белый", shelfLife: 12 }), { package_weight: ready(10, ["knaufTiefengrund"]), package_volume: need("Local title says 10 л, while the official source confirms 10 кг; no kg→l conversion is allowed.", ["knaufTiefengrund"]) }), { sourceKeys: ["knaufTiefengrund", ...local], titleStatus: "TITLE_UNIT_MISMATCH" }),
  p("MAT-000230", "Грунтовка Knauf Мульти Грунд универсальный 10 л", "KNAUF", withPackage(commonReady("knaufMultigrund", "KNAUF", "Универсальная грунтовка для впитывающих оснований", "Полимерная дисперсия", "Снижение и регулирование впитываемости, улучшение адгезии", "Внутренние и наружные работы", "Газо- и пенобетон, кирпич, штукатурки, стяжки", { primerType: "Универсальная для впитывающих оснований", consumption: "0,2 кг/м²", drying: "6 часов", color: "Жёлтый", shelfLife: 12 }), { package_weight: ready(10, ["knaufMultigrund"]), package_volume: need("Local title says 10 л, while the official source confirms 10 кг; no kg→l conversion is allowed.", ["knaufMultigrund"]) }), { sourceKeys: ["knaufMultigrund", ...local], titleStatus: "TITLE_UNIT_MISMATCH" }),
  p("MAT-000231", "Грунтовка Ceresit CT-17 PRO, 5л", "Ceresit", withPackage(commonReady("ceresitCt17", "Ceresit", "Грунтовка глубокого проникновения", "Водная дисперсия сополимеров акрилатов", "Укрепление, связывание пыли, снижение впитываемости и повышение адгезии", "Внутренние и наружные работы", "Цементные, известковые и гипсовые штукатурки, стяжки, бетон, кирпич, ГКЛ, ДСП/ДВП", { primerType: "Глубокого проникновения", consumption: "0,1–0,2 л/м²", drying: "до 2 часов", color: "Светло-жёлтый", temperature: "0…+35 °C" }), { package_weight: absent("Source specifies this liquid SKU in litres; mass is not provided.", ["ceresitCt17"]), package_volume: ready(5, ["ceresitCt17"]) }), { sourceKeys: ["ceresitCt17", ...local], titleStatus: "MATCH" }),
  p("MAT-000232", "Грунтовка Ceresit CT-17 PRO, 10л", "Ceresit", withPackage({
    ...commonReady("ceresitCt17", "Ceresit", "Грунтовка глубокого проникновения", "Водная дисперсия сополимеров акрилатов", "Укрепление, связывание пыли, снижение впитываемости и повышение адгезии", "Внутренние и наружные работы", "Цементные, известковые и гипсовые штукатурки, стяжки, бетон, кирпич, ГКЛ, ДСП/ДВП", { primerType: "Глубокого проникновения", consumption: "0,1–0,2 л/м²", drying: "до 2 часов", color: "Светло-жёлтый", temperature: "0…+35 °C" }),
    product_type: ready("Универсальная грунтовка глубокого проникновения", ["ceresitCt17"]),
    purpose: ready("Укрепление впитывающих оснований, связывание пыли и снижение впитываемости", ["ceresitCt17"]),
    shelf_life: ready(24, ["ceresitCt17Tds"])
  }, { package_weight: absent("Source specifies this liquid SKU in litres; mass is not provided.", ["ceresitCt17"]), package_volume: ready(10, ["ceresitCt17"]) }), { sourceKeys: ["ceresitCt17", "ceresitCt17Tds", ...local], titleStatus: "MATCH" }),
  p("MAT-000233", "Грунтовка Ceresit CT16 под декоративную штукатурку 10 л", "Ceresit", withPackage(commonReady("ceresitCt16", "Ceresit", "Кварц-грунтовка под декоративные штукатурки", "Водная дисперсия полимеров с пигментами и минеральными наполнителями", "Подготовка оснований перед декоративными штукатурками и повышение адгезии", "Внутренние и наружные работы", "Бетон, цементные/гипсовые/цементно-известковые штукатурки, ГКЛ, ДСП, прочные ЛКМ", { primerType: "Кварц-грунтовка", consumption: "0,2–0,5 л/м²", drying: "около 3 часов", color: "Белый, может колероваться", temperature: "+5…+30 °C", shelfLife: 12 }), { package_weight: absent("Source specifies this liquid SKU in litres; mass is not provided.", ["ceresitCt16"]), package_volume: ready(10, ["ceresitCt16"]) }), { sourceKeys: ["ceresitCt16", "ceresitFacade", ...local], titleStatus: "MATCH" }),
  p("MAT-000235", "Грунтовка Старатели универсальная 10 л", "Старатели", withPackage(commonReady("starateli", "Старатели", "Универсальная грунтовка", "Водная грунтовка; binder не указан в карточке", "Увеличение сцепления, обеспыливание, регулирование впитываемости, подготовка стен, потолков и полов", "Внутренние и наружные работы", "Стены, потолки и полы; полный список оснований требует TDS", { primerType: "Универсальная", consumption: "100–200 мл/м²", drying: "не менее 1 часа", color: "Прозрачный после высыхания", temperature: "+5…+30 °C", shelfLife: 18 }), { package_weight: absent("Source specifies this liquid SKU in litres; mass is not provided.", ["starateli"]), package_volume: ready(10, ["starateli"]) }), { sourceKeys: ["starateli", ...local], titleStatus: "MATCH" }),
  p("MAT-000236", "Грунтовка UNIS глубокого проникновения укрепляющий 10 л", "UNIS", withPackage(commonReady("unisCatalog", "UNIS", "Грунтовка глубокого проникновения", "Акриловый полимер", "Укрепление рыхлых, мелящих и сильновпитывающих оснований, обеспыливание", "Внутренние и наружные работы", "Минеральные впитывающие основания; полный список требует TDS", { primerType: "Глубокого проникновения", consumption: "около 100 мл/м²", drying: "около 3 часов", temperature: "+5…+30 °C", shelfLife: 12 }), { package_weight: absent("Source specifies this liquid SKU in litres; mass is not provided.", ["unisCatalog", "unisRetailer"]), package_volume: ready(10, ["unisCatalog", "unisRetailer"]) }), { sourceKeys: ["unisCatalog", "unisRetailer", ...local], titleStatus: "MINOR_NAMING_DIFFERENCE" }),
  p("MAT-000240", "Грунтовка Knauf Миттельгрунд для впитывающих оснований концентрат 10 л", "KNAUF", withPackage(commonReady("knaufMittelgrund", "KNAUF", "Грунтовка-концентрат для впитывающих оснований", "Полимерная дисперсия с жёлтым пигментом", "Снижение и регулирование впитываемости, подготовка под штукатурки, плитку и стяжки", "Внутренние и наружные работы", "Газо- и пенобетон, кирпич, штукатурки, бетонные и гипсовые стяжки", { primerType: "Концентрат для впитывающих оснований", consumption: "0,05 кг/м² концентрата; раствор зависит от основания", drying: "6 часов", dilution: "1:3–1:5 в зависимости от основания", concentrate: true, color: "Жёлтый", shelfLife: 12 }), { package_weight: ready(10, ["knaufMittelgrund"]), package_volume: need("Local title says 10 л, while the official source confirms 10 кг; no kg→l conversion is allowed.", ["knaufMittelgrund"]) }), { sourceKeys: ["knaufMittelgrund", ...local], titleStatus: "TITLE_UNIT_MISMATCH" }),
  p("MAT-000241", "Грунт Tikkurila Euro Primer концентрат 0,9 л", "Tikkurila", withPackage(commonReady("tikkurila", "Tikkurila", "Акрилатная грунтовка-концентрат глубокого проникновения", "Акрилатная основа", "Укрепление пористых оснований и выравнивание впитываемости перед окраской", "Внутренние и наружные работы", "Штукатурка, кирпич, бетон, ГКЛ, газобетон, гипсовые материалы, ДВП/ДСП", { primerType: "Концентрат глубокого проникновения", consumption: "5–14 м²/л", drying: "1–1,5 часа", dilution: "1:3", concentrate: true, shelfLife: 24 }), { package_weight: absent("Source identifies the exact SKU by volume; mass is not provided.", ["tikkurila", "tikkurilaCatalog"]), package_volume: ready(0.9, ["tikkurila", "tikkurilaCatalog"]) }), { sourceKeys: ["tikkurila", "tikkurilaCatalog", ...local], titleStatus: "MATCH" }),
  p("MAT-000242", "Грунт Tikkurila Euro Primer концентрат 3 л", "Tikkurila", withPackage(commonReady("tikkurila", "Tikkurila", "Акрилатная грунтовка-концентрат глубокого проникновения", "Акрилатная основа", "Укрепление пористых оснований и выравнивание впитываемости перед окраской", "Внутренние и наружные работы", "Штукатурка, кирпич, бетон, ГКЛ, газобетон, гипсовые материалы, ДВП/ДСП", { primerType: "Концентрат глубокого проникновения", consumption: "5–14 м²/л", drying: "1–1,5 часа", dilution: "1:3", concentrate: true, shelfLife: 24 }), { package_weight: absent("Source identifies the exact SKU by volume; mass is not provided.", ["tikkurila", "tikkurilaCatalog"]), package_volume: ready(3, ["tikkurila", "tikkurilaCatalog"]) }), { sourceKeys: ["tikkurila", "tikkurilaCatalog", ...local], titleStatus: "MATCH" })
]);

module.exports = { CHECKED_AT, SOURCES, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, PRODUCTS };
