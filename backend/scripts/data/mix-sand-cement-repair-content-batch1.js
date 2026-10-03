"use strict";

const CORE_BATCH1 = require("./mix-sand-cement-repair-core-batch1");
const CORE_BATCH2 = require("./mix-sand-cement-repair-core-batch2");

const BATCH_MATS = Object.freeze([
    "MAT-000109",
    "MAT-000110",
    "MAT-000111",
    "MAT-000117",
    "MAT-000118"
]);
const EXPECTED_CATEGORY = "Смеси";
const SOURCES = Object.freeze({ ...CORE_BATCH1.SOURCES, ...CORE_BATCH2.SOURCES });
const CORE_PRODUCTS = new Map([...CORE_BATCH1.PRODUCTS, ...CORE_BATCH2.PRODUCTS].map(item => [item.externalId, item]));

const COPY = Object.freeze({
    "MAT-000109": {
        shortDescription: "Русеан М300, 40 кг — пескобетон для устройства полов, фундаментов, отмосток и монтажных работ.",
        fullDescription: "Пескобетон Русеан М300 на основе портландцемента и песка фракцией до 5 мм предназначен для устройства полов, ленточных фундаментов в малоэтажном строительстве, отмосток и отливок, а также монтажных работ. Подходит для внутренних и наружных работ; наносится вручную по бетонному основанию. Толщина слоя — 50–150 мм. Для затворения требуется 0,13–0,15 л воды на килограмм смеси. Возможность хождения — через 48 часов. Фасовка — 40 кг.",
        seoTitle: "Пескобетон Русеан М300 40 кг — купить в Москве",
        seoDescription: "Пескобетон Русеан М300, 40 кг, для полов, фундаментов и монтажных работ. Ручное нанесение по бетону. Закажите в MatMix с доставкой.",
        factsUsed: ["brand", "product_type", "base", "purpose", "package_weight", "application_area", "application_method", "substrates", "layer_thickness", "water_requirement", "walkability"]
    },
    "MAT-000110": {
        shortDescription: "Пескобетон VERTEX М-300, 40 кг — для стяжек, фундаментов и бетонных конструкций.",
        fullDescription: "Пескобетон VERTEX М-300 в фасовке 40 кг применяют для устройства стяжек пола, фундаментов, отмосток и других бетонных конструкций. Производитель указывает возможность применения для внутренних и наружных работ. Марка — М-300; норматив — ГОСТ 31358-2007. Фасовка — 40 кг.",
        seoTitle: "Пескобетон VERTEX М-300 40 кг — купить в Москве",
        seoDescription: "Пескобетон VERTEX М-300, 40 кг, для стяжек, фундаментов, отмосток и бетонных конструкций. Закажите с доставкой в MatMix.",
        factsUsed: ["brand", "product_type", "purpose", "package_weight", "application_area", "standard", "mortar_grade"],
        titleCorrection: {
            expectedOldTitle: "Пескобетон Tex Pro М-300 ГОСТ 40 кг",
            proposedTitle: "Пескобетон VERTEX М-300 ГОСТ 40 кг",
            recommended: true
        }
    },
    "MAT-000111": {
        shortDescription: "Пескобетон EUROMIX М-300, 40 кг — для фундаментов, стяжек и бетонных стен.",
        fullDescription: "Пескобетон EUROMIX М-300 предназначен для заливки фундаментов, устройства бетонных стяжек и несущих слоёв полов, возведения и ремонта бетонных стен и оснований. Допускается слой 10–50 мм; для затворения требуется 0,17–0,20 л воды на килограмм смеси. Работы проводят при температуре от +5 до +30 °C. Цвет — серый. Марка раствора — М-300; норматив — ГОСТ 31357-2007. Фасовка — 40 кг.",
        seoTitle: "Пескобетон EUROMIX М-300 40 кг — купить в Москве",
        seoDescription: "Пескобетон EUROMIX М-300, 40 кг: слой 10–50 мм и затворение 0,17–0,20 л/кг. Закажите с доставкой по Москве в MatMix.",
        factsUsed: ["brand", "product_type", "purpose", "package_weight", "color", "layer_thickness", "water_requirement", "application_temperature", "standard", "mortar_grade"],
        titleCorrection: {
            expectedOldTitle: "Пескобетон Евро М-300 ГОСТ 40кг",
            proposedTitle: "Пескобетон EUROMIX М-300 ГОСТ 40 кг",
            recommended: true
        }
    },
    "MAT-000117": {
        shortDescription: "Ceresit CN 83, 25 кг — ремонтная смесь для бетонных и железобетонных конструкций.",
        fullDescription: "Ceresit CN 83 — цементная ремонтная смесь для бетонных и железобетонных конструкций. Подходит для заполнения выбоин, каверн и дефектов глубиной от 5 мм, а также для изготовления стяжек. Смесь наносят шпателем или кельмой; при устройстве стяжек используют виброрейку. Толщина слоя — 5–35 мм, расход — около 2,0 кг/м² на каждый миллиметр слоя. Для затворения 25 кг требуется 3,0–3,2 л воды. Работы проводят при температуре от +5 до +30 °C; возможность хождения — через 6 часов. Фасовка — 25 кг.",
        seoTitle: "Ceresit CN 83 25 кг — купить ремонтную смесь в Москве",
        seoDescription: "Ceresit CN 83, 25 кг, для ремонта бетона и железобетона и устройства стяжек. Слой 5–35 мм. Закажите с доставкой по Москве.",
        factsUsed: ["brand", "product_type", "base", "purpose", "package_weight", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "water_requirement", "application_temperature", "walkability"]
    },
    "MAT-000118": {
        shortDescription: "GLIMS PRO CRT-40, 25 кг — тиксотропная ремонтная смесь класса R3.",
        fullDescription: "GLIMS PRO CRT-40 — тиксотропная ремонтная смесь класса R3 для конструкционного ремонта бетонных и железобетонных конструкций. Её наносят вручную шпателем на бетон, железобетон и другие минеральные основания; материал предназначен для внутренних и наружных работ. Толщина слоя — 10–40 мм, расход — 1,8 кг/м² на каждый миллиметр слоя. Для затворения 25 кг требуется 4,0–4,25 л воды. Работы проводят при температуре от +5 до +35 °C. Соответствие: ГОСТ Р 56378-2015, класс R3; ТУ 5745-010-40397319-2003 №0500/2. Фасовка — 25 кг.",
        seoTitle: "GLIMS PRO CRT-40 25 кг — купить ремонтную смесь в Москве",
        seoDescription: "GLIMS PRO CRT-40, 25 кг, тиксотропная ремонтная смесь класса R3 для бетонных конструкций. Слой 10–40 мм. Доставка по Москве.",
        factsUsed: ["brand", "product_type", "purpose", "package_weight", "application_area", "application_method", "substrates", "layer_thickness", "consumption", "water_requirement", "application_temperature", "standard"]
    }
});

const PRODUCTS = BATCH_MATS.map(externalId => {
    const core = CORE_PRODUCTS.get(externalId);
    const copy = COPY[externalId];
    if (!core || !copy) throw new Error(`Missing core identity or content copy for ${externalId}`);
    return Object.freeze({
        externalId,
        expectedTitle: core.expectedTitle,
        expectedCategory: EXPECTED_CATEGORY,
        expectedSubcategory: core.expectedSubcategory || (externalId === "MAT-000109" || externalId === "MAT-000110" || externalId === "MAT-000111" ? "Пескобетон" : "Смесь Ремонтная"),
        expectedIdentityBrand: core.brand,
        allowedCurrentBrands: Object.freeze([null, core.brand]),
        expectedWeight: Number(core.core.package_weight.value),
        expectedUnit: "шт",
        identityStatus: core.identityStatus || "IDENTITY_CONFIRMED",
        sourceKeys: core.sourceKeys,
        verifiedFacts: Object.freeze(Object.entries(core.core).filter(([, fact]) => fact.status === "READY").map(([code, fact]) => Object.freeze({ code, value: fact.value, unit: fact.sourceUnit || fact.unit || null }))),
        factsOmitted: Object.freeze(Object.entries(core.core).filter(([, fact]) => fact.status !== "READY").map(([code, fact]) => Object.freeze({ code, status: fact.status, reason: fact.reason || "Not a READY source-backed fact; intentionally omitted from public copy." }))),
        factsUsed: Object.freeze(copy.factsUsed),
        shortDescription: copy.shortDescription,
        fullDescription: copy.fullDescription,
        seoTitle: copy.seoTitle,
        seoDescription: copy.seoDescription,
        titleCorrection: copy.titleCorrection || null
    });
});

module.exports = { BATCH_MATS, EXPECTED_CATEGORY, PRODUCTS, SOURCES };
