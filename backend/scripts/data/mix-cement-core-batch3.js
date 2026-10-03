"use strict";

const CHECKED_AT = "2026-10-03";
const EXPECTED_CATEGORY = "Смеси";
const BATCH_MATS = Object.freeze(["MAT-000113", "MAT-000114", "MAT-000115"]);
const CONFIRM = "BACKFILL_MIX_CEMENT_CORE_BATCH3";

const SOURCES = Object.freeze({
  ownerMat113: {
    owner: "MatMix project owner",
    title: "Owner-supplied package identity for MAT-000113 (MAT-000113.webp)",
    url: null,
    evidence: "Owner reports that the supplied package visibly reads ЦЕМЕНТУМ / ЭКСТРАЦЕМ 500 / ПОРТЛАНДЦЕМЕНТ / 40 кг. Binary image was not present in the local workspace during this run; this source records the owner's supplied visual identification, not an independent pixel audit."
  },
  cementumExtraCem: {
    owner: "ЦЕМЕНТУМ",
    title: "Official ExtraCEM 500 product page",
    url: "https://cementum.ru/catalog/extracem-500-40/",
    evidence: "Exact product and 40 kg page. Identifies Portland cement with limestone up to 20%, ГОСТ 31108-2020, trade mark ExtraCEM 500, and product uses. It explicitly distinguishes plant variants: ЦЕМ II/А-И 42,5Н for some plants and 42,5Б for Voskresensk."
  },
  cementumExtraCemTds: {
    owner: "ЦЕМЕНТУМ",
    title: "Official ExtraCEM 500 technical sheet, updated 2025-07-09",
    url: "https://cementum.ru/upload/uf/ee3/ma0wdnwsqaa3xxdw0cd6dzn5c5wmkxb5/%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BB%D0%B8%D1%81%D1%82%20%D0%A6%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%20ExtraCEM500.pdf",
    evidence: "Official TDS states 40 kg paper bags, GOST 31108-2020, limestone up to 20%, and separate plant variants with differing class letter and two-/28-day strength values. Because MAT's plant is not identified, age-specific strengths and shelf-life mapping are not forced into scalar slots."
  },
  ownerMat114: {
    owner: "MatMix project owner",
    title: "Owner-supplied package identity for MAT-000114 (МЕШОК MAT-000114.png)",
    url: null,
    evidence: "Owner reports that the supplied package visibly reads РОСЦЕМЕНТ / ПОРТЛАНДЦЕМЕНТ / 50 кг. The package evidence resolves the product-level identity, but the cement class/standard microtext is not readable or otherwise mapped. Binary image was not present locally for an independent pixel audit."
  },
  roscementCatalog: {
    owner: "Росцемент / ТСК РУСЦЕМ",
    title: "Official seller cement catalog",
    url: "https://roscement.ru/cement/",
    evidence: "Seller page describes a multi-manufacturer assortment and packaging options. It does not map MAT-000114's package to one plant or cement class; it is retained as context only and supplies no technical READY facts for this MAT."
  },
  ownerMat115: {
    owner: "MatMix project owner",
    title: "Owner-supplied package identity for MAT-000115 (MAT-000115.jpg)",
    url: null,
    evidence: "Owner reports that the supplied package visibly reads РУСЕАН / ПОРТЛАНДЦЕМЕНТ / ЦЕМ I 42,5Н / 40 кг. Binary image was not present locally for an independent pixel audit."
  },
  ruseanCemI425N: {
    owner: "Русеан",
    title: "Official Русеан product page: ЦЕМ I 42,5Н, 40 kg",
    url: "https://rusean.ru/catalog/tsement/tsement_tsem_i_42_5n_v_meshkakh_po_40kg/",
    evidence: "Exact product page states Portland cement ЦЕМ I 42,5Н in 40 kg bags, ГОСТ 31108-2020, gray color, +10…+25 °C work temperature, 42.5 MPa compressive-strength field, and identifies the class notation. It lists two possible producer companies; no plant is assigned to this MAT. This is the exact technical source found; no separate exact-product manufacturer TDS was located."
  },
  ruseanPriceList: {
    owner: "Русеан",
    title: "Official Русеан price list",
    url: "https://rusean.ru/pricelist/",
    evidence: "Official company price list independently lists Цемент ЦЕМ I 42,5Н in 40 kg bags."
  }
});

// Existing canonical definitions only; no definitions or template memberships are created.
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
const ready = (value, sources, context, sourceValue = value, sourceUnit = null) => ({ status: "READY", value, sources, sourceValue, sourceUnit, context });
const unresolved = (status, reason, sources, sourceValue = null, sourceUnit = null, context = null) => ({ status, value: null, sources, sourceValue, sourceUnit, reason, context });
const notAvailable = (reason, sources = []) => unresolved("NOT_AVAILABLE", reason, sources);
const needsMapping = (reason, sources = [], sourceValue = null, sourceUnit = null, context = null) => unresolved("NEEDS_MAPPING", reason, sources, sourceValue, sourceUnit, context);

function core(brand, productType, packageWeight, sources, overrides = {}) {
  const slots = Object.fromEntries(CORE_ORDER.map(code => [code, notAvailable("No source-backed exact-SKU fact was found for this canonical slot.", sources)]));
  slots.brand = ready(brand, sources, "Exact product-line identity from the owner package evidence and corroborating catalog where available.");
  slots.product_type = ready(productType, sources, "Product type is explicitly named on the owner package evidence.");
  slots.package_weight = ready(packageWeight, sources, "Exact package mass stated by owner package evidence and corroborating exact product source.", String(packageWeight), "кг");
  return Object.freeze({ ...slots, ...overrides });
}

const PRODUCTS = Object.freeze([
  {
    externalId: "MAT-000113",
    expectedTitle: "Цемент \"Цементум\" 40кг",
    expectedSubcategory: "Цемент",
    expectedStructureId: 12,
    expectedParentStructureId: 1,
    identityStatus: "IDENTITY_CONFIRMED",
    brand: "ЦЕМЕНТУМ",
    sourceKeys: ["ownerMat113", "cementumExtraCem", "cementumExtraCemTds"],
    identity: "ЦЕМЕНТУМ ExtraCEM 500, Portland cement, 40 kg. Plant-specific cement class variant remains unresolved.",
    core: core("ЦЕМЕНТУМ", "Портландцемент", 40, ["ownerMat113", "cementumExtraCem", "cementumExtraCemTds"], {
      brand: ready("ЦЕМЕНТУМ", ["ownerMat113", "cementumExtraCem"], "Brand and exact ExtraCEM 500 product line are identified by owner package evidence and official product page."),
      product_type: ready("Портландцемент", ["ownerMat113", "cementumExtraCem"], "Owner package names Portland cement; official page classifies ExtraCEM 500 as general-purpose Portland cement."),
      base: ready("Портландцемент с известняком до 20%", ["cementumExtraCem", "cementumExtraCemTds"], "Official product page and TDS state the limestone addition up to 20%; this wording is shared across the listed plant variants."),
      purpose: ready("Полусухие и мокрые стяжки; дорожки, отмостки, площадки, фундаменты, несущие стены и перекрытия; кладочные растворы, брусчатка и камень", ["cementumExtraCem"], "Official ExtraCEM 500 product page lists these applications."),
      package_weight: ready(40, ["ownerMat113", "cementumExtraCem", "cementumExtraCemTds"], "Owner package evidence and exact official product/TDS identify a 40 kg bag.", "40", "кг"),
      compressive_strength: needsMapping("Official TDS separates plant variants and reports different minimum compressive strengths at 2 and 28 days; the current scalar numeric definition cannot retain the age qualifier and plant mapping.", ["cementumExtraCem", "cementumExtraCemTds"], "2 days: ≥22.3 MPa (42.5Н variant) or ≥29.9 MPa (42.5Б variant); 28 days: ≥48.0 MPa", "MPa by age/plant", "MAT package evidence does not establish the production plant; do not select or collapse these values."),
      shelf_life: needsMapping("Official TDS states 60 days from dispatch, while the existing canonical definition stores months. Do not convert days to months.", ["cementumExtraCemTds"], "60", "суток", "A unit-compatible canonical definition is needed to preserve the exact duration."),
      standard: ready("ГОСТ 31108-2020", ["cementumExtraCem", "cementumExtraCemTds"], "Exact official product page and current official TDS both cite ГОСТ 31108-2020.")
    })
  },
  {
    externalId: "MAT-000114",
    expectedTitle: "Цемент \"РосЦемент\" 50кг",
    expectedSubcategory: "Цемент",
    expectedStructureId: 12,
    expectedParentStructureId: 1,
    identityStatus: "IDENTITY_CONFIRMED",
    brand: "РОСЦЕМЕНТ",
    sourceKeys: ["ownerMat114", "roscementCatalog"],
    identity: "РОСЦЕМЕНТ Portland cement, 50 kg. Product-level identity is confirmed by package label; manufacturer, cement class and standard are not established.",
    core: core("РОСЦЕМЕНТ", "Портландцемент", 50, ["ownerMat114", "roscementCatalog"], {
      brand: ready("РОСЦЕМЕНТ", ["ownerMat114"], "Brand printed on the exact owner-supplied package evidence."),
      product_type: ready("Портландцемент", ["ownerMat114"], "Product type printed on the exact owner-supplied package evidence."),
      package_weight: ready(50, ["ownerMat114"], "Exact bag mass printed on the owner-supplied package evidence.", "50", "кг"),
      standard: needsMapping("Package microtext for class/standard is not readable from the owner report, and the seller's assortment spans multiple manufacturers and cement classes. No class or standard is inferred.", ["ownerMat114", "roscementCatalog"], "class/standard unreadable", null, "Only the exact lot passport, readable package microtext, or supplier SKU mapping can resolve this slot."),
      mortar_grade: needsMapping("The exact cement class/grade is not readable or mapped. Roscement is a multi-manufacturer seller, so its other 50 kg products cannot be substituted.", ["ownerMat114", "roscementCatalog"], "grade unreadable", null, "Requires readable exact-package class or lot passport.")
    })
  },
  {
    externalId: "MAT-000115",
    expectedTitle: "Цемент \"Русеан\" 40кг",
    expectedSubcategory: "Цемент",
    expectedStructureId: 12,
    expectedParentStructureId: 1,
    identityStatus: "IDENTITY_CONFIRMED",
    brand: "Русеан",
    sourceKeys: ["ownerMat115", "ruseanCemI425N", "ruseanPriceList"],
    identity: "Русеан Portland cement ЦЕМ I 42,5Н, 40 kg. Exact class/package match official Русеан listing; the factory for this exact bag is not mapped.",
    core: core("Русеан", "Портландцемент", 40, ["ownerMat115", "ruseanCemI425N", "ruseanPriceList"], {
      brand: ready("Русеан", ["ownerMat115", "ruseanCemI425N"], "Brand shown on owner package evidence and exact official Русеан product page."),
      product_type: ready("Портландцемент", ["ownerMat115", "ruseanCemI425N"], "Owner package and exact official product page identify Portland cement."),
      base: ready("Портландцемент без минеральных добавок (ЦЕМ I)", ["ruseanCemI425N"], "Official Русеан product page explains ЦЕМ I as additive-free Portland cement."),
      purpose: ready("Железобетонные конструкции; гидротехнические сооружения в пресной воде; массивный монолитный бетон; аэродромное и дорожное строительство; зимнее бетонирование с обогревом", ["ruseanCemI425N"], "Official product page lists these uses for the exact ЦЕМ I 42,5Н 40 kg product."),
      package_weight: ready(40, ["ownerMat115", "ruseanCemI425N", "ruseanPriceList"], "Owner package evidence, exact product page and official price list all state 40 kg.", "40", "кг"),
      color: ready("Серый", ["ruseanCemI425N"], "Exact official product-page specification."),
      application_temperature: ready("от +10 до +25 °C", ["ruseanCemI425N"], "Exact official product-page specification."),
      compressive_strength: ready(42.5, ["ownerMat115", "ruseanCemI425N"], "Exact class is on the owner package evidence; the official product page lists 42.5 MPa.", "42,5", "МПа"),
      standard: ready("ГОСТ 31108-2020", ["ruseanCemI425N"], "Exact official product-page specification for ЦЕМ I 42,5Н.")
    })
  }
]);

const TEMPLATE_AUDIT = Object.freeze([{ structureId: 12, structureName: "Цемент", readiness: "TEMPLATE_READY", detail: "Uses the existing schema-v11 generic no-membership fallback; no template rows are created or changed." }]);

module.exports = { BATCH_MATS, CHECKED_AT, CONFIRM, CORE_ORDER, DEFINITIONS, EXPECTED_CATEGORY, PRODUCTS, SOURCES, TEMPLATE_AUDIT, NEW_DEFINITIONS: [] };
