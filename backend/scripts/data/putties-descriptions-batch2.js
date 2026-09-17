"use strict";

const CORE = require("./putties-core-content-batch2");

const DESCRIPTION_MUTABLE_FIELDS_EXACTLY = Object.freeze(["full_description"]);
const TARGET_MATS = Object.freeze(Array.from({ length: 14 }, (_, index) => `MAT-${String(index + 47).padStart(6, "0")}`));
const LOCAL_TITLES = Object.freeze({
  ...Object.fromEntries(CORE.PRODUCTS.map(product => [product.externalId, product.expectedTitle])),
  "MAT-000060": "Шпаклевка полимерная финишная Волма Искрит для внутренних и наружных работ, белоснежная мех. 19 кг"
});
const CANONICAL_IDENTITIES = Object.freeze({
  "MAT-000047": "Danogips SuperFinish",
  "MAT-000048": "Danogips SuperFinish",
  "MAT-000049": "КНАУФ Ротбанд Паста Профи",
  "MAT-000050": "КНАУФ Ротбанд Паста Профи",
  "MAT-000051": "SEMIN CE 78",
  "MAT-000052": "VGT универсальная акриловая шпаклёвка",
  "MAT-000053": "Vetonit LR+",
  "MAT-000054": "Vetonit LR+",
  "MAT-000055": "Vetonit KR",
  "MAT-000056": "Vetonit JS",
  "MAT-000057": "КНАУФ-Полимер Финиш",
  "MAT-000058": "ОСНОВИТ Элисилк PA39 W",
  "MAT-000059": "Danogips Dano JET5",
  "MAT-000060": "ВОЛМА-Искрит"
});

const DESCRIPTIONS = Object.freeze({
  "MAT-000047": "Danogips SuperFinish 5 кг — готовая финишная полимерная шпаклёвка для выравнивания поверхностей внутри сухих помещений. Подходит для листовых материалов, ранее ошпатлёванных или окрашенных поверхностей, ПГП, стеклохолста, ГКЛ и швов ГКЛ.\n\nПаста наносится вручную или механизированно слоем до 2 мм. Расход — 1 л/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; высыхание — около 24 часов в зависимости от условий. Фасовка — 5 кг.",
  "MAT-000048": "Danogips SuperFinish 28 кг — готовая финишная полимерная шпаклёвка для выравнивания поверхностей внутри сухих помещений. Подходит для листовых материалов, ранее ошпатлёванных или окрашенных поверхностей, ПГП, стеклохолста, ГКЛ и швов ГКЛ.\n\nПаста наносится вручную или механизированно слоем до 2 мм. Расход — 1 л/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; высыхание — около 24 часов в зависимости от условий. Фасовка — 28 кг.",
  "MAT-000049": "КНАУФ Ротбанд Паста Профи 5 кг — готовая финишная шпаклёвка на виниловой основе для выравнивания поверхностей внутри помещений. Подходит для ГКЛ, ГВЛ, оштукатуренных и бетонных поверхностей, ПГП и стеклохолста.\n\nПасту наносят вручную или механизированно слоем 0,2–2 мм. Расход — 0,48 кг/м² при слое 0,3 мм. Работы выполняют при температуре от +10 до +25 °C; высыхание — около 24 часов при слое 1 мм. Фасовка — 5 кг.",
  "MAT-000050": "КНАУФ Ротбанд Паста Профи 18 кг — готовая финишная шпаклёвка на виниловой основе для выравнивания поверхностей внутри помещений. Подходит для ГКЛ, ГВЛ, оштукатуренных и бетонных поверхностей, ПГП и стеклохолста.\n\nПасту наносят вручную или механизированно слоем 0,2–2 мм. Расход — 0,48 кг/м² при слое 0,3 мм. Работы выполняют при температуре от +10 до +25 °C; высыхание — около 24 часов при слое 1 мм. Фасовка — 18 кг.",
  "MAT-000051": "SEMIN CE 78 20 кг — готовая полимерная шпаклёвка на акриловой дисперсии для заделки швов ГКЛ и финишного выравнивания стен и потолков внутри помещений. Подходит для ГКЛ, гипсовых блоков, окрашенных поверхностей и силикатного кальция.\n\nМатериал наносят вручную, валиком, airless, bazooka или banjo. Для швов расход составляет 500 г/м²/мм, для сплошного нанесения — 1 кг/м²; слой — 1–5 мм, для сплошного слоя 1–4 мм. Межслойная сушка занимает 12–24 часа. Фасовка — 20 кг.",
  "MAT-000052": "VGT 18 кг — готовая акриловая универсальная шпаклёвка для внутренних работ и наружного применения на защищённых от прямых атмосферных осадков участках. Предназначена для выравнивания и заполнения трещин до 7 мм на бетоне, кирпиче, штукатурке и минеральных основаниях.\n\nОптимальная толщина слоя — около 1 мм, расход — 0,5–1,4 кг/м². Материал наносят шпателем при температуре от +7 до +30 °C. До отлипа — до 2 часов, полное высыхание — 24 часа при 20±2 °C, относительной влажности 65±5% и слое не более 3 мм. Фасовка — 18 кг.",
  "MAT-000053": "Vetonit LR+ 5 кг — сухая полимерная финишная шпаклёвка для стен и потолков внутри сухих помещений под обои, окраску и декоративную отделку. Подходит для цементной и гипсовой штукатурки, гипсовых поверхностей, ГКЛ, ГВЛ и минеральных оснований.\n\nПосле затворения смесь наносят вручную или механизированно слоем 1–5 мм. Расход — 1,2 кг/м²/мм при слое 1 мм; жизнеспособность — до 72 часов после затворения, высыхание — 24 часа. Температура работ — от +10 до +30 °C. Фасовка — 5 кг.",
  "MAT-000054": "Vetonit LR+ 20 кг — сухая полимерная финишная шпаклёвка для стен и потолков внутри сухих помещений под обои, окраску и декоративную отделку. Подходит для цементной и гипсовой штукатурки, гипсовых поверхностей, ГКЛ, ГВЛ и минеральных оснований.\n\nПосле затворения смесь наносят вручную или механизированно слоем 1–5 мм. Расход — 1,2 кг/м²/мм при слое 1 мм; жизнеспособность — до 72 часов после затворения, высыхание — 24 часа. Температура работ — от +10 до +30 °C. Фасовка — 20 кг.",
  "MAT-000055": "Vetonit KR финиш белая 20 кг — сухая финишная шпаклёвка на основе органического клея для стен и потолков внутри сухих помещений. Подходит для бетона, гипса, оштукатуренных поверхностей, ГКЛ, ГВЛ и ЦСП.\n\nСмесь наносят вручную или механизированно слоем 1–3 мм; локально допускается до 4 мм. Расход — 1,2 кг/м²/мм при слое 1 мм. Жизнеспособность — 30 часов, в закрытой таре до 60 часов; высыхание — 1 сутки при 20 °C. Фасовка — 20 кг.",
  "MAT-000056": "Vetonit JS 20 кг — сухая полимерная финишная шпаклёвка на основе сополимера ПВА для заделки швов ГКЛ и финишного выравнивания внутри сухих помещений. Подходит для ГКЛ, ГВЛ, старой краски, гипсовой, цементной и известково-цементной штукатурки.\n\nСмесь наносят вручную или механизированно слоем 1–2 мм. Для швов расход составляет 0,1–0,2 кг/м²/мм, для сплошного шпаклевания — 1,2 кг/м²/мм. Жизнеспособность — 1–2 суток, высыхание — 3–24 часа. Фасовка — 20 кг.",
  "MAT-000057": "КНАУФ-Полимер Финиш 20 кг — сухая полимерная финишная шпаклёвка с микроволокнами для выравнивания поверхностей внутри помещений. Подходит для бетона, ГКЛ, ГВЛ, гипсовой и цементной штукатурки.\n\nСмесь наносят вручную или механизированно слоем 0,2–4 мм. Расход — 1,2 кг/м² при слое 1 мм. Жизнеспособность — до 24 часов, в закрытой ёмкости при температуре от +10 °C — до 72 часов. Фасовка — 20 кг.",
  "MAT-000058": "ОСНОВИТ Элисилк PA39 W 28 кг — готовая суперфинишная полимерная шпаклёвка для выравнивания стен и потолков внутри сухих и влажных отапливаемых помещений. Подходит для бетона, гипсовой и цементной штукатурки, выравнивающей шпаклёвки, ГКЛ, ГВЛ, ПГП, СМЛ и минеральных оснований.\n\nПасту наносят вручную или механизированно слоем 0–2 мм. Расход — 1,6 кг/м² при слое 1 мм. Температура работ — от +5 до +30 °C, высыхание — 24 часа. Фасовка — 28 кг.",
  "MAT-000059": "Danogips Dano JET5 25 кг — сухая полимерная выравнивающая шпаклёвка для подготовки плоскости перед финишной отделкой или оклейкой обоями внутри помещений. Подходит для минеральных оснований.\n\nСмесь наносят вручную, механизированно или безвоздушным способом слоем до 6 мм. Расход — 1,2 кг/м²/мм при слое 1 мм. Работы выполняют при температуре не ниже +13 °C; жизнеспособность — не менее 72 часов, высыхание — около 24 часов. Фасовка — 25 кг.",
  "MAT-000060": "ВОЛМА-Искрит 19 кг — сухая белоснежная финишная шпаклёвка для выравнивания стен, потолков и других недеформирующихся оснований внутри помещений с нормальной относительной влажностью.\n\nСмесь наносят вручную или машинным способом слоем 0,2–3 мм. Расход — 1,0–1,1 кг/м² при слое 1 мм. Температура работ — от +5 до +30 °C, жизнеспособность раствора — до 72 часов. Фасовка — 19 кг."
});

const FACTS_USED_CODES = Object.freeze({
  "MAT-000047": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "drying_time"],
  "MAT-000048": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "drying_time"],
  "MAT-000049": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "drying_time"],
  "MAT-000050": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "drying_time"],
  "MAT-000051": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "drying_time"],
  "MAT-000052": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "application_temperature", "drying_time"],
  "MAT-000053": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "drying_time", "application_temperature"],
  "MAT-000054": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "drying_time", "application_temperature"],
  "MAT-000055": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "drying_time", "application_temperature", "color"],
  "MAT-000056": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "drying_time", "application_temperature"],
  "MAT-000057": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life"],
  "MAT-000058": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "application_temperature", "drying_time"],
  "MAT-000059": ["product_type", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "drying_time", "application_temperature"],
  "MAT-000060": ["product_type", "base", "purpose", "package_weight", "form", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "consumption_basis", "pot_life", "application_temperature", "color"]
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
  expectedTitle: LOCAL_TITLES[product.externalId],
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
