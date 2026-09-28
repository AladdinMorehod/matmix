"use strict";

const FLOOR = require("./floor-mixes-core-batch1");
const CANONICAL = require("./attribute-templates-closed-subcategories");

const TARGETS = Object.freeze(["MAT-000075", "MAT-000077"]);
const CONFIRM = "FIX_FLOOR_075_077_IDENTITY";
const CHECKED_AT = "2026-09-28";
const TEMPLATE = CANONICAL.categories.find(item => item.name === "Наливной Пол");
if (!TEMPLATE || TEMPLATE.structureId !== 7) throw new Error("Canonical Наливной Пол template metadata is missing");
const TEMPLATE_CODES = Object.freeze([...CANONICAL.mainAttributes, ...TEMPLATE.codes]);
const WRITABLE_PRODUCT_FIELDS = Object.freeze(["short_description", "full_description", "seo_title", "seo_description"]);
const WRITABLE_ATTRIBUTE_CODES = Object.freeze([
  "product_type", "shelf_life", "base", "application_area", "application_method", "substrates",
  "layer_thickness", "consumption", "water_requirement", "pot_life", "application_temperature", "walkability", "adhesion", "flexural_strength"
]);
if (WRITABLE_ATTRIBUTE_CODES.some(code => !TEMPLATE_CODES.includes(code))) throw new Error("Attribute allowlist includes a code outside Наливной Пол template");

const PRODUCT_FACTS = Object.freeze({
  "MAT-000075": {
    current: Object.freeze({
      title: 'Наливной пол "Unis Горизонт" 20 кг',
      slug: "наливной-пол-unis-горизонт-20-кг",
      brand: "UNIS", weight: 20, unit: "шт", category: "Смеси", subcategory: "Наливной Пол", price: 345,
      short_description: null, full_description: null,
      seo_title: "UNIS Горизонт 20 кг — купить наливной пол в Москве",
      seo_description: "Наливной пол «Unis Горизонт» 20 кг. Закажите материал в каталоге MatMix с доставкой по Москве и Московской области.",
      image_url: "/uploads/products/MAT-000075-7584c202645c34c1.webp", stock_status: "unknown", is_active: 1, deleted_at: null
    }),
    visible: Object.freeze({
      short_description: "UNIS Горизонт Универсальный М-45 — армированный быстротвердеющий наливной пол. Фасовка — 20 кг.",
      full_description: "UNIS Горизонт Универсальный М-45 — армированный быстротвердеющий наливной пол для базового и финишного выравнивания оснований. Материал подходит для бетонных, цементно-песчаных и гипсовых оснований, систем «Тёплый пол» и «Плавающий пол». Толщина слоя — 3–100 мм, расход — 15–17 кг/м² при слое 10 мм, возможность хождения — через 2–3 часа.",
      seo_title: "UNIS Горизонт Универсальный М-45 20 кг — купить в Москве",
      seo_description: "Армированный быстротвердеющий наливной пол UNIS Горизонт Универсальный М-45 20 кг. Слой 3–100 мм, хождение через 2–3 часа. Доставка по Москве и МО."
    })
  },
  "MAT-000077": {
    current: Object.freeze({
      title: 'Наливной пол "Старатели" Быстрый 20 кг',
      slug: "наливной-пол-старатели-быстрый-20-кг",
      brand: "Старатели", weight: 20, unit: "шт", category: "Смеси", subcategory: "Наливной Пол", price: 365,
      short_description: null, full_description: null,
      seo_title: "Старатели Быстрый 20 кг — купить наливной пол в Москве",
      seo_description: "Наливной пол «Старатели» «Быстрый» 20 кг. Выберите материал в каталоге MatMix и оформите доставку по Москве и Московской области.",
      image_url: "/uploads/products/MAT-000077-a2ff7cd16c732bb5.webp", stock_status: "unknown", is_active: 1, deleted_at: null
    }),
    visible: Object.freeze({
      short_description: "Старатели Быстротвердеющий — самонивелирующийся наливной пол для внутренних работ. Фасовка — 20 кг.",
      full_description: "Наливной пол «Старатели Быстротвердеющий» в фасовке 20 кг предназначен для базового и финишного выравнивания бетонных, цементно-песчаных, гипсовых и ангидридных оснований. Подходит для системы «Тёплый пол» и ручного или механизированного нанесения. Толщина слоя — 3–100 мм, расход — около 14,5 кг/м² при слое 10 мм, возможность хождения — через 4 часа.",
      seo_title: "Старатели Быстротвердеющий 20 кг — купить наливной пол",
      seo_description: "Самонивелирующийся наливной пол Старатели Быстротвердеющий 20 кг. Слой 3–100 мм, расход около 14,5 кг/м² при 10 мм. Доставка по Москве и МО."
    })
  }
});

const FLOOR_PRODUCTS = new Map(FLOOR.PRODUCTS.map(product => [product.externalId, product]));
const PRODUCTS = Object.freeze(TARGETS.map(externalId => {
  const sourceProduct = FLOOR_PRODUCTS.get(externalId);
  const expected = PRODUCT_FACTS[externalId];
  if (!sourceProduct || !sourceProduct.dedicatedCorrectionOnly || sourceProduct.identityStatus !== "READY_FOR_CORE_REVIEW") throw new Error(`Core dataset is not delegated for ${externalId}`);
  const attributes = Object.fromEntries(WRITABLE_ATTRIBUTE_CODES.flatMap(code => {
    const fact = sourceProduct.core[code];
    if (!fact || fact.status === "NEEDS_SOURCE" || fact.value === null || fact.value === undefined) return [];
    if (fact.status !== "READY") throw new Error(`Invalid source status ${externalId}/${code}`);
    return [[code, Object.freeze({ value: fact.value, sourceKeys: Object.freeze(fact.sources.slice()), note: code === "adhesion" ? "Official source qualifies this number as not less than; qualifier retained here because the canonical attribute definition is numeric." : code === "flexural_strength" ? "Official source states not less than 4 MPa; qualifier is retained in text." : "" })]];
  }));
  return Object.freeze({
    externalId,
    expectedTitle: expected.current.title,
    expectedSlug: expected.current.slug,
    expectedProduct: expected.current,
    proposedProduct: expected.visible,
    identityStatus: sourceProduct.identityStatus,
    sourceKeys: sourceProduct.sourceKeys,
    attributes: Object.freeze(attributes),
    sourceFactsNotStoredAsAttributes: Object.freeze({
      purpose: sourceProduct.core.purpose,
      compressive_strength: Object.freeze({ status: "NEEDS_SOURCE", sourceRange: externalId === "MAT-000075" ? "16–20 МПа (производственная площадка влияет на минимум)" : "16–20 МПа", reason: "Range cannot be represented faithfully by the numeric canonical attribute; no scalar will be invented." })
    })
  });
}));

const SOURCES = FLOOR.SOURCES;
const EXPECTED_TEMPLATE_CODES = TEMPLATE_CODES;
const DEFINITION_CONTRACT = Object.freeze({
  brand: Object.freeze({ type: "text", unit: null }), product_type: Object.freeze({ type: "text", unit: null }),
  shelf_life: Object.freeze({ type: "number", unit: "месяцев" }), package_weight: Object.freeze({ type: "number", unit: "кг" }),
  base: Object.freeze({ type: "text", unit: null }), application_area: Object.freeze({ type: "text", unit: null }),
  application_method: Object.freeze({ type: "text", unit: null }), substrates: Object.freeze({ type: "text", unit: null }),
  layer_thickness: Object.freeze({ type: "text", unit: null }), consumption: Object.freeze({ type: "text", unit: null }),
  water_requirement: Object.freeze({ type: "text", unit: null }), pot_life: Object.freeze({ type: "text", unit: null }),
  application_temperature: Object.freeze({ type: "text", unit: null }), walkability: Object.freeze({ type: "text", unit: null }),
  compressive_strength: Object.freeze({ type: "number", unit: "МПа" }), adhesion: Object.freeze({ type: "number", unit: "МПа" }),
  flexural_strength: Object.freeze({ type: "text", unit: null })
});

module.exports = Object.freeze({ CHECKED_AT, CONFIRM, DEFINITION_CONTRACT, EXPECTED_TEMPLATE_CODES, PRODUCTS, SOURCES, TARGETS, TEMPLATE_STRUCTURE_ID: TEMPLATE.structureId, WRITABLE_ATTRIBUTE_CODES, WRITABLE_PRODUCT_FIELDS });
