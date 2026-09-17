"use strict";

const CORE = require("./putties-core-content-batch3");

const DESCRIPTION_MUTABLE_FIELDS_EXACTLY = Object.freeze(["full_description"]);
const TARGET_MATS = Object.freeze(Array.from({ length: 5 }, (_, index) => `MAT-${String(index + 61).padStart(6, "0")}`));

const CANONICAL_IDENTITIES = Object.freeze({
  "MAT-000061": "КНАУФ-Мульти-Финиш",
  "MAT-000062": "Шпатлёвка цементная «Базовая» ГОСТ 33699-2015",
  "MAT-000063": "Шпатлёвка цементная «Фасадно-финишная» ГОСТ 33699-2015",
  "MAT-000064": "Vetonit ВХ",
  "MAT-000065": "VGT «Шпатлевка Экстра по дереву»"
});

const DESCRIPTIONS = Object.freeze({
  "MAT-000061": "КНАУФ-Мульти-Финиш 25 кг — цементная фасадная шпаклёвка для выравнивания бетонных и цементных поверхностей, ремонта и заполнения дефектов. Подходит для наружных и внутренних работ, включая влажные помещения.\n\nСухую смесь наносят вручную слоем 1–3 мм; локально допускается до 5 мм. Расход — 1,2 кг/м² при слое 1 мм. Работы выполняют при температуре не ниже +5 °C, жизнеспособность — не менее 3 часов. Фасовка — 25 кг.",
  "MAT-000062": "Старатели Базовая 20 кг — цементная базовая шпатлёвка для выравнивания стен и потолков внутри помещений с нормальной и повышенной влажностью. Подходит для бетона, железобетона, ячеистого бетона, кирпича и цементной штукатурки.\n\nСухую смесь наносят вручную или механизированно слоем 0,8–8 мм. Расход — 1 кг/м² при слое 1 мм. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — не менее 3 часов, последующая обработка возможна через 24 часа. Цвет — светло-бежевый. Фасовка — 20 кг.",
  "MAT-000063": "Старатели Фасадно-финишная 20 кг — цементная фасадно-финишная шпатлёвка для финишного выравнивания фасадов, стен и потолков. Подходит для наружных и внутренних работ, включая влажные и неотапливаемые помещения. Применяется по бетону, цементным штукатуркам и крупнозернистым шпатлёвкам; также допускается нанесение на ПГП, ГКЛ, ГВЛ, гипсовые штукатурки и ячеистый бетон.\n\nСухую смесь наносят вручную или механизированно слоем 0,3–3 мм. Расход — 1 кг/м² при слое 1 мм. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — не менее 3 часов, последующая обработка возможна через 24 часа. Цвет — белый. Фасовка — 20 кг.",
  "MAT-000064": "Vetonit ВХ 20 кг — цементная влагостойкая шпаклёвка для финишного выравнивания стен и потолков под окраску и обои. Подходит для сухих и влажных помещений, а также фасадов; наносится по цементным и цементно-известковым штукатуркам, ГКЛ и ГВЛ.\n\nСухую смесь наносят вручную или механизированно слоем 1–4 мм. Расход — 1,2 кг/м² на каждый 1 мм слоя. Работы выполняют при температуре от +10 до +30 °C; жизнеспособность — 1,5 часа после затворения, высыхание — 1–2 суток для одного слоя. Цвет — белый. Фасовка — 20 кг.",
  "MAT-000065": "VGT «Экстра по дереву» 1 кг — готовая белая шпаклёвка для заполнения и выравнивания деревянных поверхностей внутри и снаружи помещений.\n\nСостав наносят шпателем. Оптимальная толщина слоя — около 1 мм; локально можно заполнять неровности до 7 мм. Расход — 0,5–1,4 кг/м². Работы выполняют при температуре не ниже +7 °C; полное высыхание — 24 часа при +20±2 °C, относительной влажности не выше 65% и слое до 2 мм. Фасовка — 1 кг."
});

const FACTS_USED_CODES = Object.freeze({
  "MAT-000061": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "pot_life"],
  "MAT-000062": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "pot_life", "drying_time", "color"],
  "MAT-000063": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "pot_life", "drying_time", "color"],
  "MAT-000064": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "pot_life", "drying_time", "color"],
  "MAT-000065": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "application_temperature", "drying_time", "color"]
});

const factsUsedFor = product => (FACTS_USED_CODES[product.externalId] || [])
  .map(code => [code, product.core[code]])
  .filter(([, fact]) => fact && fact.status === "READY" && fact.value !== null && fact.value !== undefined)
  .map(([code, fact]) => `${code}: ${fact.value}`);
const factsOmittedFor = product => Object.entries(product.core)
  .filter(([, fact]) => fact.status !== "READY")
  .map(([code, fact]) => `${code}: ${fact.status === "ABSENT_BY_DESIGN" ? "absent by design" : fact.reason}`);

const PRODUCTS = Object.freeze(CORE.PRODUCTS.map(product => ({
  externalId: product.externalId,
  expectedTitle: product.expectedTitle,
  canonicalIdentity: CANONICAL_IDENTITIES[product.externalId],
  sourceKeys: product.sourceKeys,
  allowOverwrite: true,
  identityStatus: "IDENTITY_CONFIRMED",
  proposedDescription: DESCRIPTIONS[product.externalId],
  reasonForChange: "Заполнить full_description на основе подтверждённых core-фактов; остальные поля не изменяются.",
  factsUsed: factsUsedFor(product),
  factsIntentionallyOmitted: factsOmittedFor(product),
  expectedWeight: product.core.package_weight.value
})));

module.exports = { CHECKED_AT: CORE.CHECKED_AT, DESCRIPTION_MUTABLE_FIELDS_EXACTLY, TARGET_MATS, PRODUCTS, SOURCES: CORE.SOURCES };
