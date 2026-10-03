"use strict";

const CORE = require("./mix-cement-core-batch3");

const BATCH_MATS = Object.freeze(["MAT-000113", "MAT-000114", "MAT-000115"]);
const SOURCES = CORE.SOURCES;
const EXPECTED_CATEGORY = "Смеси";
const EXPECTED_SUBCATEGORY = "Цемент";

const COPY = Object.freeze({
    "MAT-000113": {
        shortDescription: "ЦЕМЕНТУМ ExtraCEM 500, 40 кг — портландцемент с известняком до 20% для стяжек, фундаментов и кладочных растворов.",
        fullDescription: "ЦЕМЕНТУМ ExtraCEM 500 — портландцемент с известняком до 20%. Применяется для устройства полусухих и мокрых стяжек, дорожек, отмосток и площадок, возведения фундаментов и несущих конструкций, приготовления кладочных растворов, а также при укладке брусчатки и камня. Соответствует ГОСТ 31108-2020. Фасовка — 40 кг.",
        seoTitle: "Цемент ЦЕМЕНТУМ ExtraCEM 500 40 кг — купить в Москве",
        seoDescription: "ЦЕМЕНТУМ ExtraCEM 500, 40 кг — портландцемент для стяжек, фундаментов и кладочных растворов, ГОСТ 31108-2020. Закажите с доставкой по Москве.",
        factsUsed: ["brand", "product_type", "base", "purpose", "package_weight", "standard"]
    },
    "MAT-000114": {
        shortDescription: "Портландцемент РОСЦЕМЕНТ в упаковке 50 кг.",
        fullDescription: "Портландцемент РОСЦЕМЕНТ, фасовка — 50 кг. Закажите с доставкой по Москве.",
        seoTitle: "Портландцемент РОСЦЕМЕНТ 50 кг — купить в Москве",
        seoDescription: "Портландцемент РОСЦЕМЕНТ, 50 кг. Закажите цемент с доставкой по Москве.",
        factsUsed: ["brand", "product_type", "package_weight"]
    },
    "MAT-000115": {
        shortDescription: "Русеан ЦЕМ I 42,5Н, 40 кг — портландцемент без минеральных добавок по ГОСТ 31108-2020.",
        fullDescription: "Цемент Русеан ЦЕМ I 42,5Н — портландцемент без минеральных добавок. Применяется для железобетонных конструкций, гидротехнических сооружений в пресной воде, массивного монолитного бетона, аэродромного и дорожного строительства, а также зимнего бетонирования с обогревом. Цвет — серый; температура проведения работ — от +10 до +25 °C. Соответствует ГОСТ 31108-2020. Фасовка — 40 кг.",
        seoTitle: "Цемент Русеан ЦЕМ I 42,5Н 40 кг — купить в Москве",
        seoDescription: "Русеан ЦЕМ I 42,5Н, 40 кг — портландцемент без минеральных добавок по ГОСТ 31108-2020. Закажите с доставкой по Москве.",
        factsUsed: ["brand", "product_type", "base", "purpose", "package_weight", "color", "application_temperature", "standard"]
    }
});

const PRODUCTS = BATCH_MATS.map(externalId => {
    const coreProduct = CORE.PRODUCTS.find(product => product.externalId === externalId);
    const copy = COPY[externalId];
    if (!coreProduct || !copy) throw new Error(`Missing Batch3 core/copy for ${externalId}`);
    const verifiedFacts = Object.entries(coreProduct.core)
        .filter(([, fact]) => fact.status === "READY")
        .map(([code, fact]) => ({ code, value: fact.value, unit: fact.sourceUnit || fact.unit || null }));
    const verifiedCodes = new Set(verifiedFacts.map(fact => fact.code));
    const factsOmitted = Object.entries(coreProduct.core)
        .filter(([, fact]) => fact.status !== "READY")
        .map(([code, fact]) => ({ code, status: fact.status, reason: fact.reason || "No verified public fact; intentionally omitted." }));
    if (copy.factsUsed.some(code => !verifiedCodes.has(code))) throw new Error(`Copy uses non-READY facts for ${externalId}`);
    return Object.freeze({
        externalId,
        expectedTitle: coreProduct.expectedTitle,
        expectedCategory: EXPECTED_CATEGORY,
        expectedSubcategory: EXPECTED_SUBCATEGORY,
        expectedBrand: coreProduct.brand,
        expectedWeight: Number(coreProduct.core.package_weight.value),
        expectedUnit: "шт",
        identityStatus: "IDENTITY_CONFIRMED",
        sourceKeys: coreProduct.sourceKeys,
        verifiedFacts,
        factsUsed: copy.factsUsed,
        factsOmitted,
        ...copy
    });
});

module.exports = { BATCH_MATS, EXPECTED_CATEGORY, EXPECTED_SUBCATEGORY, PRODUCTS, SOURCES };
