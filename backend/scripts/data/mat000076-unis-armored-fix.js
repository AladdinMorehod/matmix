"use strict";

const EXTERNAL_ID = "MAT-000076";
const CONFIRM = "FIX_MAT000076_UNIS_ARMORED";
const SOURCE = Object.freeze({
  key: "unisArmoredCurrent",
  owner: "UNIS",
  type: "official current manufacturer product page",
  url: "https://unistrom.ru/catalog/ustrojstvo-polov/gorizont-armirovannyj/",
  tdsUrl: "https://unistrom.ru/upload/iblock/112/q1w1m0wsq0d9yzebod4boxlbzsayelji.pdf",
  fieldSourceKeys: Object.freeze({ application_temperature: "unisArmoredTds", otherConfirmedFacts: "unisArmoredCurrent" }),
  provenanceNote: "Current product page is canonical for current values. The official TDS lists compressive strength 25–30 MPa depending on production site and water up to 4 l; its introductory layer bullet says 10–100 mm while its table says 10–200 mm. The current page gives 30 MPa, 2.75–3.75 l per 25 kg, and 10–200 mm. Differences are recorded, not averaged."
});

const OLD_PRODUCT = Object.freeze({
  title: "Наливной пол UNIS Горизонт Армированный 20 кг",
  weight: 20,
  short_description: "Армированный базовый ровнитель UNIS Горизонт для пола. Фасовка — 20 кг.",
  full_description: "UNIS Горизонт Армированный — базовый ровнитель для пола в фасовке 20 кг. Смесь наносят слоем 30–300 мм; для затворения требуется 3,8–4,8 л воды на мешок. Возможность хождения по покрытию — через 12 часов.",
  seo_title: "UNIS Горизонт Армированный 20 кг — ровнитель купить в Москве",
  seo_description: "Армированный базовый ровнитель для пола UNIS Горизонт 20 кг. Слой 30–300 мм, возможность хождения через 12 часов. Закажите с доставкой по Москве и МО."
});

const NEW_PRODUCT = Object.freeze({
  title: "Наливной пол UNIS Горизонт Армированный 25 кг",
  weight: 25,
  short_description: "UNIS Горизонт Армированный — высокопрочный базовый ровнитель для пола. Фасовка — 25 кг.",
  full_description: "UNIS Горизонт Армированный — высокопрочный армированный базовый ровнитель для пола в фасовке 25 кг. Материал предназначен для подготовки прочных ровных оснований под напольные покрытия и финишные ровнители. Толщина слоя — 10–200 мм, расход — 1,8 кг/м² на каждый миллиметр слоя. Возможность хождения — через 12 часов.",
  seo_title: "UNIS Горизонт Армированный 25 кг — ровнитель купить в Москве",
  seo_description: "Высокопрочный армированный базовый ровнитель UNIS Горизонт Армированный 25 кг. Слой 10–200 мм, расход 1,8 кг/м²/мм. Закажите с доставкой по Москве и МО."
});

// Each old value is an exact preflight alternative; null means the field must be absent.
// Values use the product's existing definition type and unit. Definitions are never written.
const ATTRIBUTE_CHANGES = Object.freeze({
  product_type: { old: "Армированный базовый ровнитель для пола", value: "Высокопрочный армированный базовый ровнитель для пола", dataType: "text", unit: null },
  package_weight: { old: 20, value: 25, dataType: "number", unit: "кг" },
  purpose: { old: null, value: "Подготовка прочных ровных оснований и стяжек под напольные покрытия и финишные ровнители", dataType: "text", unit: null },
  application_area: { old: null, value: "Внутренние и наружные работы; сухие и влажные помещения", dataType: "text", unit: null },
  substrates: { old: null, value: "Бетонные и цементно-песчаные недеформирующиеся основания", dataType: "text", unit: null },
  layer_thickness: { old: "30–300 мм", value: "10–200 мм", dataType: "text", unit: null },
  consumption_10mm: { old: null, value: "18", dataType: "text", unit: "кг/м²" },
  water_requirement: { old: "3,8–4,8 л на 20 кг", value: "2,75–3,75 л на 25 кг", dataType: "text", unit: null },
  pot_life: { old: "1 час", value: "2 часа", dataType: "text", unit: null },
  application_temperature: { old: null, value: "от +5 до +30 °C", dataType: "text", unit: null },
  compressive_strength: { old: 15, value: 30, dataType: "number", unit: "МПа" },
  adhesion: { old: 0.6, value: 0.3, dataType: "number", unit: "МПа" },
  frost_resistance: { old: null, value: "50 циклов", dataType: "text", unit: null },
  shelf_life: { old: 12, value: 12, dataType: "number", unit: "месяцев" },
  consumption: { old: "около 1,8 кг/м²/мм", value: "1,8 кг/м²/мм", dataType: "text", unit: null },
  flexural_strength: { old: null, value: "4 МПа", dataType: "text", unit: null },
  walkability: { old: "12 часов", value: "12 часов", dataType: "text", unit: null }
});

const PRODUCT_MUTABLE_FIELDS = Object.freeze(["title", "weight", "short_description", "full_description", "seo_title", "seo_description"]);
const CATEGORY = "Смеси";
const SUBCATEGORY = "Наливной Пол";
const SLUG = "наливной-пол-unis-горизонт-армированный-20-кг";

module.exports = Object.freeze({ EXTERNAL_ID, CONFIRM, SOURCE, OLD_PRODUCT, NEW_PRODUCT, ATTRIBUTE_CHANGES, PRODUCT_MUTABLE_FIELDS, CATEGORY, SUBCATEGORY, SLUG });
