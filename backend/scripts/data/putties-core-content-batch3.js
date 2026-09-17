"use strict";

const CHECKED_AT = "2026-09-17";
const CANONICAL = require("./putties-core-content");
const REUSABLE_DEFINITIONS = CANONICAL.REUSABLE_DEFINITIONS;
const NEW_DEFINITIONS = CANONICAL.NEW_DEFINITIONS;
const CORE_ORDER = CANONICAL.CORE_ORDER;
const PUTTY_CODES = CANONICAL.PUTTY_CODES;

const SOURCES = Object.freeze({
  knaufMultiFinish: {
    title: "KNAUF-Мульти-Финиш — официальный сайт и TDS",
    url: "https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shpaklyevki/knauf-multi-finish/",
    owner: "KNAUF",
    note: "Официальная карточка продукта; белая TDS: https://www.knauf.ru/upload/iblock/a6f/znbug54f7lfpmcp0h0bw9bl9oiboa70i/25_IL_KNAUF_Multi_Finish_belyy_25_03_2025_v01_Preview.pdf. Цвет exact local variant и точное время высыхания не установлены."
  },
  starBaseCement: {
    title: "Старатели — цементная Базовая",
    url: "https://www.starateli.ru/catalog/229-229/",
    owner: "Старатели",
    note: "Официальная карточка цементной шпатлевки «Базовая» ГОСТ 33699-2015, фасовка 20 кг."
  },
  starFacadeFinish: {
    title: "Старатели — цементная Фасадно-финишная",
    url: "https://www.starateli.ru/good/show/59/",
    owner: "Старатели",
    note: "Официальная карточка цементной шпатлевки «Фасадно-финишная» ГОСТ 33699-2015, фасовка 20 кг."
  },
  vetonitVH: {
    title: "Vetonit ВХ 20 кг — официальный сайт и TDS",
    url: "https://vetonit.com/product/vetonit_vkh_20_kg/",
    owner: "Vetonit",
    note: "Официальная карточка Vetonit ВХ 20 кг; TDS: https://vetonit.com/upload/iblock/5c0/pd6sfdysuk62adx6p07bk210y3o6iu7q.pdf. Локальное VH — legacy spelling; title не меняется."
  },
  vgtExtraWood: {
    title: "VGT — Шпатлевка «Экстра» по дереву",
    url: "https://vgtkraska.ru/ekstra-po-derevu",
    owner: "VGT",
    note: "Официальная карточка готовой белой шпатлевки по дереву; фасовка 1 кг."
  },
  localTitle: {
    title: "Локальная карточка MatMix",
    url: null,
    owner: "MatMix local audit",
    note: "Только identity/weight guard; не источник технических свойств и не production truth."
  }
});

const ready = (value, sources, extra = {}) => ({ status: "READY", value, sources, ...extra });
const need = (reason, sources) => ({ status: "NEEDS_SOURCE", value: null, reason, sources });
const absent = (reason, sources) => ({ status: "ABSENT_BY_DESIGN", value: null, reason, sources });
const formDry = ready("Сухая смесь", ["localTitle"]);
const formPaste = ready("Готовая паста", ["vgtExtraWood"]);
const p = (externalId, expectedTitle, brand, sourceKeys, core, meta = {}) => ({ externalId, expectedTitle, brand, identityStatus: "IDENTITY_CONFIRMED", sourceKeys, core, ...meta });

const PRODUCTS = [
  p("MAT-000061", "Шпаклевка цементная Knauf Мультифиниш фасадная 25 кг", "KNAUF", ["knaufMultiFinish", "localTitle"], {
    product_type: ready("Цементная фасадная шпаклёвка", ["knaufMultiFinish"]),
    base: ready("Цемент, минеральный наполнитель, полимерные добавки, армирующее волокно", ["knaufMultiFinish"]),
    purpose: ready("Выравнивание бетонных и цементных поверхностей, ремонт и заполнение дефектов", ["knaufMultiFinish"]),
    package_weight: ready(25, ["localTitle"]),
    application_temperature: ready("Не менее +5 °C", ["knaufMultiFinish"]),
    shelf_life: ready(12, ["knaufMultiFinish"]),
    color: need("Официальный продукт выпускается в белом и сером вариантах; exact вариант локальной карточки не установлен.", ["knaufMultiFinish"]),
    form: ready("Сухая смесь", ["knaufMultiFinish"]),
    application_area: ready("Наружные и внутренние работы, включая влажные помещения", ["knaufMultiFinish"]),
    application_method: ready("Ручное нанесение", ["knaufMultiFinish"]),
    substrates: ready("Бетон, цементные штукатурки", ["knaufMultiFinish"]),
    layer_thickness: ready("1–3 мм; локально до 5 мм", ["knaufMultiFinish"]),
    consumption: ready("1,2 кг/м²", ["knaufMultiFinish"]),
    consumption_basis: ready("при толщине слоя 1 мм", ["knaufMultiFinish"]),
    pot_life: ready("не менее 3 часов", ["knaufMultiFinish"]),
    drying_time: need("Точное время высыхания для exact SKU/условий не подтверждено.", ["knaufMultiFinish"])
  }, { canonicalName: "КНАУФ-Мульти-Финиш", titleIssues: [{ kind: "TYPOGRAPHY", text: "Локальное «Мультифиниш» отличается от официального «КНАУФ-Мульти-Финиш»; title не меняется." }] }),
  p("MAT-000062", "Шпаклевка цементная базовая Старатели 20 кг", "Старатели", ["starBaseCement", "localTitle"], {
    product_type: ready("Цементная шпатлёвка базовая", ["starBaseCement"]),
    base: ready("Белый цемент с минеральными наполнителями и модифицирующими добавками", ["starBaseCement"]),
    purpose: ready("Выравнивание стен и потолков", ["starBaseCement"]),
    package_weight: ready(20, ["localTitle"]),
    application_temperature: ready("от +10 до +30 °C", ["starBaseCement"]),
    shelf_life: ready(12, ["starBaseCement"]),
    color: ready("Светло-бежевый", ["starBaseCement"]),
    form: ready("Сухая смесь", ["starBaseCement"]),
    application_area: ready("Внутри помещений, нормальная и повышенная влажность", ["starBaseCement"]),
    application_method: ready("Ручное и механизированное", ["starBaseCement"]),
    substrates: ready("Бетон, железобетон, ячеистый бетон, кирпич, цементная штукатурка", ["starBaseCement"]),
    layer_thickness: ready("0,8–8 мм", ["starBaseCement"]),
    consumption: ready("1 кг/м²", ["starBaseCement"]),
    consumption_basis: ready("при толщине слоя 1 мм", ["starBaseCement"]),
    pot_life: ready("не менее 3 часов", ["starBaseCement"]),
    drying_time: ready("24 часа до последующей обработки", ["starBaseCement"])
  }, { canonicalName: "Шпатлёвка цементная «Базовая» ГОСТ 33699-2015", titleIssues: [{ kind: "QUALIFIER/TYPOGRAPHY", text: "Локальное описательное имя отличается от официального «Шпатлевка цементная «Базовая»»; title не меняется." }] }),
  p("MAT-000063", "Шпаклевка цементная фасадно финишная Старатели 20 кг", "Старатели", ["starFacadeFinish", "localTitle"], {
    product_type: ready("Цементная фасадно-финишная шпатлёвка", ["starFacadeFinish"]),
    base: ready("Белый цемент с минеральными наполнителями и модифицирующими добавками", ["starFacadeFinish"]),
    purpose: ready("Финишное выравнивание фасадов, стен и потолков", ["starFacadeFinish"]),
    package_weight: ready(20, ["localTitle"]),
    application_temperature: ready("от +10 до +30 °C", ["starFacadeFinish"]),
    shelf_life: ready(12, ["starFacadeFinish"]),
    color: ready("Белый", ["starFacadeFinish"]),
    form: ready("Сухая смесь", ["starFacadeFinish"]),
    application_area: ready("Наружные и внутренние работы, включая влажные и неотапливаемые помещения", ["starFacadeFinish"]),
    application_method: ready("Ручное и механизированное", ["starFacadeFinish"]),
    substrates: ready("Бетон, цементные штукатурки, крупнозернистые шпатлёвки; допускаются ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон", ["starFacadeFinish"]),
    layer_thickness: ready("0,3–3 мм", ["starFacadeFinish"]),
    consumption: ready("1 кг/м²", ["starFacadeFinish"]),
    consumption_basis: ready("при толщине слоя 1 мм", ["starFacadeFinish"]),
    pot_life: ready("не менее 3 часов", ["starFacadeFinish"]),
    drying_time: ready("24 часа до последующей обработки", ["starFacadeFinish"])
  }, { canonicalName: "Шпатлёвка цементная «Фасадно-финишная» ГОСТ 33699-2015", titleIssues: [{ kind: "TYPOGRAPHY", text: "В локальном title отсутствует дефис в «фасадно финишная»; title не меняется." }] }),
  p("MAT-000064", "Шпаклевка Vetonit VH для влажных помещений белая 20 кг", "Vetonit", ["vetonitVH", "localTitle"], {
    product_type: ready("Цементная влагостойкая шпаклёвка", ["vetonitVH"]),
    base: ready("Цемент, молотый мрамор, функциональные добавки", ["vetonitVH"]),
    purpose: ready("Финишное выравнивание стен и потолков под окраску и обои", ["vetonitVH"]),
    package_weight: ready(20, ["localTitle"]),
    application_temperature: ready("от +10 до +30 °C", ["vetonitVH"]),
    shelf_life: ready(12, ["vetonitVH"]),
    color: ready("Белый", ["vetonitVH"]),
    form: ready("Сухая смесь", ["vetonitVH"]),
    application_area: ready("Сухие и влажные помещения, фасады", ["vetonitVH"]),
    application_method: ready("Ручное и механизированное", ["vetonitVH"]),
    substrates: ready("Цементные и цементно-известковые штукатурки, ГКЛ, ГВЛ", ["vetonitVH"]),
    layer_thickness: ready("1–4 мм", ["vetonitVH"]),
    consumption: ready("1,2 кг/м²/мм", ["vetonitVH"]),
    consumption_basis: ready("на 1 мм слоя", ["vetonitVH"]),
    pot_life: ready("1,5 часа после затворения", ["vetonitVH"]),
    drying_time: ready("1–2 суток для одного слоя", ["vetonitVH"])
  }, { canonicalName: "Vetonit ВХ", titleIssues: [{ kind: "LEGACY/TYPOGRAPHY", text: "Локальное Latin VH отличается от текущего официального Cyrillic ВХ; title не меняется." }, { kind: "QUALIFIER", text: "«для влажных помещений» и «белая» подтверждены официальным источником." }] }),
  p("MAT-000065", "Шпаклевка по дереву VGT Белая 1 кг", "VGT", ["vgtExtraWood", "localTitle"], {
    product_type: ready("Готовая шпаклёвка по дереву", ["vgtExtraWood"]),
    base: ready("Водная дисперсия стирол-акрилового полимера, наполнитель, модифицирующие добавки, пигмент", ["vgtExtraWood"]),
    purpose: ready("Заполнение и выравнивание деревянных поверхностей", ["vgtExtraWood"]),
    package_weight: ready(1, ["localTitle"]),
    application_temperature: ready("Не ниже +7 °C", ["vgtExtraWood"]),
    shelf_life: ready(24, ["vgtExtraWood"]),
    color: ready("Белая", ["vgtExtraWood"]),
    form: formPaste,
    application_area: ready("Внутренние и наружные работы", ["vgtExtraWood"]),
    application_method: ready("Шпатель", ["vgtExtraWood"]),
    substrates: ready("Деревянные поверхности", ["vgtExtraWood"]),
    layer_thickness: ready("около 1 мм (оптимально); локальное заполнение неровностей до 7 мм", ["vgtExtraWood"]),
    consumption: ready("0,5–1,4 кг/м²", ["vgtExtraWood"]),
    consumption_basis: ready("по данным производителя, без фиксированной толщины слоя", ["vgtExtraWood"]),
    pot_life: absent("Готовая паста, смешивание не требуется.", ["vgtExtraWood"]),
    drying_time: ready("до отлипа 2 часа; полное высыхание 24 часа при +20±2 °C, RH ≤65%, слой ≤2 мм", ["vgtExtraWood"])
  }, { canonicalName: "VGT «Шпатлевка Экстра по дереву»", titleIssues: [{ kind: "SUBSTANTIVE", text: "Локальное title не содержит официальное «Экстра»; title не меняется." }, { kind: "PACKAGING/VARIANT", text: "«Белая» — подтверждённый цветовой вариант официальной карточки." }] })
];

module.exports = { CHECKED_AT, REUSABLE_DEFINITIONS, NEW_DEFINITIONS, CORE_ORDER, PUTTY_CODES, PRODUCTS: Object.freeze(PRODUCTS), SOURCES };
