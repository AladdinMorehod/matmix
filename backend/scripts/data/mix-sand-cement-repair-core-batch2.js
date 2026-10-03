"use strict";

const CHECKED_AT = "2026-10-03";
const EXPECTED_CATEGORY = "Смеси";
const BATCH_MATS = Object.freeze(["MAT-000110", "MAT-000111"]);
const CONFIRM = "BACKFILL_MIX_SAND_CEMENT_REPAIR_CORE_BATCH2";

const SOURCES = Object.freeze({
  ownerMat110: {
    owner: "MatMix project owner",
    title: "Owner-confirmed identity for MAT-000110",
    url: null,
    evidence: "Owner confirms this exact local MAT is Пескобетон VERTEX М-300, 40 кг. This confirms the stated identity only; it does not authorize transferring technical data from an unmapped VERTEX variant."
  },
  vertexCatalog: {
    owner: "ООО «Вертекс Продакшн»",
    title: "Официальный каталог сухих смесей VERTEX.production",
    url: "https://vertexproduction.ru/",
    evidence: "Official manufacturer lists M-300, M-300 Крупнозернистый, and M-300 Эконом separately, each as пескобетон 40 kg, ГОСТ 31358-2007, with the same stated applications including indoor and outdoor use. Those shared identity-agnostic catalog facts support purpose, application area, and standard. No exact-version composition, substrate list, or layer thickness is published; variant-specific technical values are not inferred."
  },
  ownerMat111: {
    owner: "MatMix project owner",
    title: "Owner-confirmed identity for MAT-000111",
    url: null,
    evidence: "Owner confirms this exact local MAT is Пескобетон EUROMIX/EUROmix М-300, 40 кг. This confirmation applies only to MAT-000111."
  },
  euromixCatalog: {
    owner: "ООО «ЕВРОМИКС СМ»",
    title: "Официальный каталог EUROmix — пескобетон М-300",
    url: "https://www.xn----ctbiokkmpo.xn--p1ai/%D0%BA%D0%B0%D1%82%D0%B0%D0%BB%D0%BE%D0%B3",
    evidence: "Manufacturer site identifies ООО «ЕВРОМИКС СМ» in Коломна and lists EUROmix Пескобетон М-300, ГОСТ 31357-2007, 40 kg. Its exact M-300 listing and repeated Premium/M-300 catalog entries state the same 10–50 mm layer, 0.5 MPa adhesion, and six-month shelf life. The local title's M-300/ГОСТ/40 kg plus owner confirmation map to the manufacturer M-300 listing. Manufacturer values take precedence over secondary listings that provide no revision/SKU discriminator."
  },
  euromixRetailA: {
    owner: "Бетоныч",
    title: "Пескобетон М-300 EUROMIX, 40 кг",
    url: "https://betonych.com/product/peskobeton-m-300-euromix-40-kg-2",
    evidence: "Exact-name/40 kg secondary listing reports layer 10-100 mm, consumption 18 kg/m² at 10 mm, adhesion 0.3 MPa, water 7-8 l/bag, pot life 120 min, F50, and 24 h setting; some facts conflict with the current manufacturer catalog."
  },
  euromixRetailB: {
    owner: "Filtrakt",
    title: "Пескобетон М300 40кг Euromix",
    url: "https://filtrakt.ru/catalog/peskobeton/76987/",
    evidence: "Exact-name/40 kg secondary listing reports consumption 22-25 kg/m² at 10 mm, layer 10-50 mm, adhesion not stated, water 0.17-0.20 l/kg, pot life 120-180 min, and 12 months shelf life. Treated as secondary candidate evidence only."
  },
  euromixRetailC: {
    owner: "Rem-Market",
    title: "Пескобетон М-300 Евромикс 40кг",
    url: "https://rem-market.ru/stroitelnie-smesi/peskobeton/peskobeton-m-300-evromiks-40kg",
    evidence: "Exact-name/40 kg secondary listing reports recommended layer 30-200 mm, conflicting with the manufacturer catalog and other retail listing."
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
const sourceConflict = (reason, sources, sourceValue = null, sourceUnit = null, context = null) => unresolved("SOURCE_CONFLICT", reason, sources, sourceValue, sourceUnit, context);

const PRODUCTS = Object.freeze([
  {
    externalId: "MAT-000110",
    expectedTitle: "Пескобетон Tex Pro М-300 ГОСТ 40 кг",
    expectedSubcategory: "Пескобетон",
    expectedStructureId: 11,
    expectedParentStructureId: 1,
    identityStatus: "OWNER_CONFIRMED",
    brand: "VERTEX",
    sourceKeys: ["ownerMat110", "vertexCatalog"],
    identity: "Owner confirms VERTEX M-300, 40 kg. Official manufacturer lists multiple M-300 variants and 40 kg packaging, but no SKU/GTIN/package mapping establishes which technical variant this MAT represents.",
    core: {
      brand: ready("VERTEX", ["ownerMat110", "vertexCatalog"], "Owner-confirmed identity; official manufacturer is ООО «Вертекс Продакшн»."),
      product_type: ready("Пескобетон", ["ownerMat110", "vertexCatalog"], "Owner-confirmed identity and official manufacturer product title."),
      base: notAvailable("No exact-version composition is assigned without a SKU/package mapping.", ["vertexCatalog"]),
      purpose: ready("Устройство стяжек пола (в том числе плавающих и тёплых), фундаментов, отмосток и других бетонных конструкций в жилых и общественных зданиях", ["vertexCatalog"], "The official catalog states this purpose for its M-300 entries, including the separately listed coarse-grained and Economy variants."),
      package_weight: ready(40, ["ownerMat110", "vertexCatalog"], "Owner-confirmed 40 kg package; official VERTEX M-300 listings are 40 kg.", "40", "кг"),
      application_area: ready("Внутренние и наружные работы", ["vertexCatalog"], "The official catalog says its listed M-300 products are intended for constructions both inside and outside buildings."),
      application_method: notAvailable("No exact-version application method is confirmed for this local MAT.", ["vertexCatalog"]),
      substrates: notAvailable("The catalog lists application purposes but does not provide a distinct compatible-substrate list for the exact product." , ["vertexCatalog"]),
      color: notAvailable("No exact-version color is confirmed for this local MAT.", ["vertexCatalog"]),
      layer_thickness: unresolved("BLOCKED_BY_VARIANT", "The official catalog lists multiple M-300 variants but does not publish a layer-thickness value for any of them; do not assign a value without exact-version documentation.", ["vertexCatalog"]),
      consumption_10mm: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      consumption: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      water_requirement: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      pot_life: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      application_temperature: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      compressive_strength: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      adhesion: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      frost_resistance: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      shelf_life: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      standard: ready("ГОСТ 31358-2007", ["vertexCatalog"], "The official catalog lists this standard for the M-300 entries, including the separately listed coarse-grained and Economy variants."),
      mortar_grade: ready("М-300", ["ownerMat110", "vertexCatalog"], "Owner-confirmed product identity; official M-300 listing."),
      walkability: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"]),
      flexural_strength: notAvailable("No value is proposed without exact-version mapping.", ["vertexCatalog"])
    }
  },
  {
    externalId: "MAT-000111",
    expectedTitle: "Пескобетон Евро М-300 ГОСТ 40кг",
    expectedSubcategory: "Пескобетон",
    expectedStructureId: 11,
    expectedParentStructureId: 1,
    identityStatus: "OWNER_CONFIRMED",
    brand: "EUROMIX",
    sourceKeys: ["ownerMat111", "euromixCatalog"],
    identity: "Owner confirms this exact MAT as EUROMIX M-300, 40 kg. The official EUROmix SM catalog has an unqualified M-300 product listing with ГОСТ 31357-2007 and 40 kg, matching the local title. Technical secondary listings conflict on several values; those remain blocked.",
    core: {
      brand: ready("EUROMIX", ["ownerMat111", "euromixCatalog"], "Owner-confirmed brand; official catalog and company identity name EUROmix/ООО «ЕВРОМИКС СМ»."),
      product_type: ready("Пескобетон", ["ownerMat111", "euromixCatalog"], "Exact official product heading: М-300 / Пескобетон."),
      base: notAvailable("The reviewed official M-300 page does not state the composition.", ["euromixCatalog"]),
      purpose: ready("Заливка фундаментов; устройство бетонных стяжек и несущих слоев полов; возведение и ремонт бетонных стен и оснований", ["euromixCatalog"], "Official product application text."),
      package_weight: ready(40, ["ownerMat111", "euromixCatalog"], "Owner-confirmed 40 kg; official M-300 listing specifies 40 kg.", "40", "кг"),
      application_area: notAvailable("The official page does not explicitly identify indoor/outdoor application for this product.", ["euromixCatalog"]),
      application_method: notAvailable("No manual/mechanical method is stated in the reviewed official product page.", ["euromixCatalog"]),
      substrates: notAvailable("The page describes applications but does not define an exact substrate list.", ["euromixCatalog"]),
      color: ready("Серый", ["euromixCatalog"], "Official M-300 technical table."),
      layer_thickness: ready("10–50 мм", ["euromixCatalog"], "Exact manufacturer M-300 catalog lists 10–50 mm. Retail pages report 10–100 mm and 30–200 mm but provide no revision/SKU evidence; the official current catalog is authoritative under source priority."),
      consumption_10mm: sourceConflict("Secondary exact-name listings report 18 and 22–25 kg/m² at 10 mm; official catalog does not publish a consumption value. No value selected.", ["euromixRetailA", "euromixRetailB"], "18; 22–25", "кг/м² при 10 мм", "Secondary sources disagree; no manufacturer value was found."),
      consumption: sourceConflict("Secondary exact-name listings report different consumption ranges; official catalog does not publish consumption. No value selected.", ["euromixRetailA", "euromixRetailB"], "18; 22–25", "кг/м² при 10 мм", "Secondary sources disagree; no manufacturer value was found."),
      water_requirement: ready("0,17–0,20 л/кг", ["euromixCatalog"], "Official M-300 technical table.", "0,17–0,20", "л/кг"),
      pot_life: sourceConflict("Secondary exact-name listings report 120 and 120–180 minutes; the official catalog does not state pot life. No value selected.", ["euromixRetailA", "euromixRetailB"], "120; 120–180", "минут", "Secondary sources disagree; no manufacturer value was found."),
      application_temperature: ready("от +5 до +30 °C", ["euromixCatalog"], "Official M-300 technical table."),
      compressive_strength: ready(30, ["euromixCatalog"], "Official M-300 table states 30 MPa after 28 days.", "30", "МПа"),
      adhesion: ready(0.5, ["euromixCatalog"], "Exact manufacturer M-300 catalog lists 0.5 MPa; the secondary 0.3 MPa listing provides no SKU/revision discriminator. Manufacturer value takes precedence.", "0,5", "МПа"),
      frost_resistance: notAvailable("The reviewed official M-300 catalog does not publish a frost-resistance value; secondary candidate value was not promoted.", ["euromixCatalog", "euromixRetailA"]),
      shelf_life: ready(6, ["euromixCatalog"], "Exact manufacturer M-300 catalog states six months in sealed factory packaging; the secondary 12-month listing provides no SKU/revision discriminator. Manufacturer value takes precedence.", "6", "месяцев"),
      standard: ready("ГОСТ 31357-2007", ["euromixCatalog"], "Official product heading."),
      mortar_grade: ready("М-300", ["ownerMat111", "euromixCatalog"], "Owner-confirmed product identity and exact official product heading."),
      walkability: notAvailable("No walkability time is stated in the reviewed official M-300 catalog.", ["euromixCatalog"]),
      flexural_strength: notAvailable("No flexural-strength value is stated in the reviewed official M-300 catalog.", ["euromixCatalog"])
    }
  }
]);

const TEMPLATE_AUDIT = Object.freeze([{ structureId: 11, structureName: "Пескобетон", readiness: "TEMPLATE_READY", detail: "Runner requires the schema-v11 exact structure and uses the existing generic no-membership fallback; it never writes templates." }]);

module.exports = { BATCH_MATS, CHECKED_AT, CONFIRM, CORE_ORDER, DEFINITIONS, EXPECTED_CATEGORY, PRODUCTS, SOURCES, TEMPLATE_AUDIT, NEW_DEFINITIONS: [] };
