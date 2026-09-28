"use strict";

const MASONRY = require("./masonry-mixes-core-batch1");
const FLOORS = require("./floor-mixes-core-batch1");
const SOURCES = Object.freeze({ ...MASONRY.SOURCES, ...FLOORS.SOURCES });

const CONTENT = Object.freeze({
    "MAT-000067": {
        shortDescription: "Кладочно-монтажная смесь EUROMIX М-200 в фасовке 40 кг.",
        fullDescription: "EUROMIX М-200 — сухая кладочно-монтажная смесь. Фасовка — 40 кг, марка раствора — М-200.",
        factsUsed: ["brand", "product_type", "package_weight", "mortar_grade"],
        factsOmitted: ["Other technical characteristics are not confirmed for this product identity."]
    },
    "MAT-000068": {
        shortDescription: "Сухая смесь «Русеан» М-200 для кладки кирпича и монтажа бетонных блоков. Фасовка — 40 кг.",
        fullDescription: "Смесь «Русеан» М-200 на основе портландцемента и сухого фракционного песка предназначена для кладки кирпича и монтажа бетонных блоков. Её также применяют для ремонта кирпичных и бетонных стен и полов, укладки тротуарной плитки и брусчатки. Подходит для внутренних и наружных работ. Фасовка — 40 кг.",
        factsUsed: ["brand", "product_type", "base", "purpose", "application_area", "package_weight", "mortar_grade"],
        factsOmitted: ["Расход, количество воды и остальные числовые параметры оставлены в характеристиках карточки."]
    },
    "MAT-000069": {
        shortDescription: "Монтажно-кладочная смесь VERTEX М-200 на основе цемента и специальных добавок. Фасовка — 40 кг.",
        fullDescription: "Сухая монтажно-кладочная смесь VERTEX М-200 изготовлена на основе цемента и специальных добавок. Её применяют для кладки кирпича, монтажа бетонных блоков и укладки тротуарной плитки и брусчатки. Смесь подходит для внутренних и наружных работ. Фасовка — 40 кг.",
        factsUsed: ["brand", "product_type", "base", "purpose", "application_area", "package_weight", "mortar_grade"],
        factsOmitted: ["Подробные числовые характеристики не включены: exact source-backed values are not available in this reviewed record."]
    },
    "MAT-000076": {
        shortDescription: "Армированный базовый ровнитель UNIS Горизонт для пола. Фасовка — 20 кг.",
        fullDescription: "UNIS Горизонт Армированный — базовый ровнитель для пола в фасовке 20 кг. Смесь наносят слоем 30–300 мм; для затворения требуется 3,8–4,8 л воды на мешок. Возможность хождения по покрытию — через 12 часов.",
        factsUsed: ["brand", "product_type", "package_weight", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["consumption: NEEDS_SOURCE; deliberately omitted because the latest reviewed source does not confirm it for this SKU."]
    },
    "MAT-000078": {
        shortDescription: "Цементная смесь «Старатели» Толстый 25 кг для внутренних и наружных работ.",
        fullDescription: "Наливной пол «Старатели» Толстый — цементная смесь для внутренних и наружных работ, в том числе при нормальной и высокой влажности. Её можно наносить вручную и механизированно слоем 30–100 мм. Для затворения требуется 5–6 л воды на 25 кг; возможность хождения — через 24 часа.",
        factsUsed: ["brand", "base", "package_weight", "application_area", "application_method", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["Расход и прочность не включены в видимый текст, чтобы не перегружать описание характеристиками."]
    },
    "MAT-000079": {
        shortDescription: "Финишный самовыравнивающийся пол Weber Vetonit 3000 для ручного нанесения слоем 1–5 мм. Фасовка — 20 кг.",
        fullDescription: "Weber Vetonit 3000 — финишный самовыравнивающийся состав для пола. Смесь наносят вручную слоем 1–5 мм. Расход составляет 1,5 кг/м² на каждый миллиметр слоя; возможность хождения — через 3–4 часа. Фасовка — 20 кг.",
        factsUsed: ["brand", "product_type", "package_weight", "application_method", "layer_thickness", "consumption", "walkability"],
        factsOmitted: ["Прочностные показатели не включены в короткое описание карточки."]
    },
    "MAT-000080": {
        shortDescription: "Weber Vetonit fast 4000, 20 кг, для сухих и влажных помещений. Ручное и механизированное нанесение.",
        fullDescription: "Weber Vetonit fast 4000 в фасовке 20 кг применяют в сухих и влажных помещениях. Материал наносят вручную или механизированно слоем 3–80 мм. Для затворения 20 кг требуется 5,2–5,4 л воды; возможность хождения — через 4 часа.",
        factsUsed: ["brand", "package_weight", "application_area", "application_method", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["Температурные и прочностные характеристики оставлены в соответствующих полях карточки."]
    },
    "MAT-000081": {
        shortDescription: "Weber Vetonit 4100, 20 кг, для ручного и механизированного нанесения слоем 2–30 мм.",
        fullDescription: "Weber Vetonit 4100 поставляется в фасовке 20 кг. Материал наносят вручную или механизированно слоем 2–30 мм. Расход составляет 1,6 кг/м² на каждый миллиметр слоя; возможность хождения — через 3–4 часа.",
        factsUsed: ["brand", "package_weight", "application_method", "layer_thickness", "consumption", "walkability"],
        factsOmitted: ["Температура применения и прочностные показатели не дублируются в видимом описании."]
    },
    "MAT-000082": {
        shortDescription: "Weber Vetonit 5000, 25 кг, для сухих и влажных помещений. Ручное нанесение.",
        fullDescription: "Weber Vetonit 5000 в фасовке 25 кг применяют во внутренних сухих и влажных помещениях. Материал наносят вручную слоем 5–50 мм, локально — до 80 мм. Для затворения 25 кг требуется 3–3,5 л воды; возможность хождения — через 3–4 часа.",
        factsUsed: ["brand", "package_weight", "application_area", "application_method", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["Расход и прочностные показатели не перечисляются в видимом тексте."]
    },
    "MAT-000083": {
        shortDescription: "Тонкослойный самовыравнивающийся состав Litokol LitoLiv S10 Express для внутренних помещений и тёплого пола. Фасовка — 20 кг.",
        fullDescription: "Litokol LitoLiv S10 Express — тонкослойный самовыравнивающийся состав для внутренних помещений, включая системы тёплого пола. Он предназначен для бетонных оснований и цементных или гипсовых стяжек; толщина нанесения — 1–10 мм. Фасовка — 20 кг.",
        factsUsed: ["brand", "product_type", "package_weight", "application_area", "substrates", "layer_thickness"],
        factsOmitted: ["Подготовка основания и расход не включены: reviewed record не содержит подтверждённых значений для этих полей."]
    },
    "MAT-000084": {
        shortDescription: "Litokol LITOLIV S50 EVO, 20 кг. Толщина слоя — 2–100 мм.",
        fullDescription: "Litokol LITOLIV S50 EVO поставляется в фасовке 20 кг. Материал наносят слоем 2–100 мм; для затворения 20 кг требуется 4,2–4,6 л воды. Работы проводят при температуре от +5 до +35 °C. Возможность хождения — через 2–4 часа.",
        factsUsed: ["brand", "package_weight", "layer_thickness", "water_requirement", "application_temperature", "walkability"],
        factsOmitted: ["Область применения и перечень оснований не указаны: exact facts are not confirmed in the reviewed record."]
    },
    "MAT-000085": {
        shortDescription: "Смесь ВОЛМА-Нивелир Экспресс для выравнивания пола. Фасовка — 25 кг.",
        fullDescription: "ВОЛМА-Нивелир Экспресс — смесь для выравнивания пола в фасовке 25 кг. Толщина слоя составляет 2–100 мм. Расход воды — 0,29–0,34 л на килограмм смеси; возможность хождения — через 3 часа.",
        factsUsed: ["brand", "package_weight", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["Не добавлены сведения о помещениях и основании: reviewed record не подтверждает эти факты."]
    },
    "MAT-000086": {
        shortDescription: "Основит Скорлайн FK45 R, 20 кг, для внутренних сухих и влажных помещений.",
        fullDescription: "Основит Скорлайн FK45 R применяют во внутренних сухих и влажных помещениях. Материал можно наносить вручную и механизированно по бетону, гипсовым и цементно-песчаным основаниям слоем 2–100 мм. Для затворения требуется 0,26–0,27 л воды на килограмм; возможность хождения — через 4 часа. Фасовка — 20 кг.",
        factsUsed: ["brand", "package_weight", "application_area", "application_method", "substrates", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["Температурные показатели и срок хранения не включены в публичный текст."]
    },
    "MAT-000087": {
        shortDescription: "Ceresit CN 175 Super, 20 кг. Толщина слоя — 3–60 мм.",
        fullDescription: "Ceresit CN 175 Super поставляется в фасовке 20 кг. Материал можно наносить вручную и механизированно слоем 3–60 мм. Для затворения упаковки 20 кг требуется около 3,6 л воды; возможность хождения — не ранее чем через 5 часов.",
        factsUsed: ["brand", "package_weight", "application_method", "layer_thickness", "water_requirement", "walkability"],
        factsOmitted: ["consumption: reviewed multi-pack source confirms approximately 1.8 kg/m²/mm, but it is intentionally omitted from this customer-facing text."]
    },
    "MAT-000089": {
        shortDescription: "Лёгкая стяжка пола KNAUF Ubo для слабых оснований и размещения коммуникаций. Фасовка — 25 кг.",
        fullDescription: "KNAUF Ubo — лёгкая стяжка пола на основе специального цемента и гранул полистирола. Смесь предназначена для слабых оснований и размещения коммуникаций; толщина слоя — 3–30 см. Возможность хождения — через 48 часов. Фасовка — 25 кг.",
        factsUsed: ["brand", "base", "purpose", "package_weight", "layer_thickness", "walkability"],
        factsOmitted: ["Технические параметры, отсутствующие в reviewed record, не добавлены."]
    },
    "MAT-000090": {
        shortDescription: "Высокопрочная стяжка пола Основит Стартолайн FC41 H для внутренних и наружных работ. Фасовка — 25 кг.",
        fullDescription: "Основит Стартолайн FC41 H — высокопрочная смесь для устройства стяжки пола. Её применяют для внутренних и наружных работ, включая устройство тёплого пола. Фасовка — 25 кг.",
        factsUsed: ["brand", "product_type", "package_weight", "application_area"],
        factsOmitted: ["Параметры слоя, расхода и времени хождения не указаны, поскольку exact значения не подтверждены в reviewed record."]
    }
});

const CURRENT_TITLES = Object.freeze({
    "MAT-000067": "Кладочно-монтажная смесь EUROmix М-200 40 кг",
    "MAT-000068": "Кладочно-монтажная смесь Русеан М-200 40 кг",
    "MAT-000069": "Кладочно-монтажная смесь VERTEX М-200 40 кг",
    "MAT-000076": "Наливной пол UNIS Горизонт Армированный 20 кг",
    "MAT-000078": "Наливной пол Старатели Толстый 25 кг",
    "MAT-000079": "Наливной пол Weber Vetonit 3000 20 кг",
    "MAT-000080": "Наливной пол Weber Vetonit fast 4000 20 кг",
    "MAT-000081": "Наливной пол Weber Vetonit 4100 20 кг",
    "MAT-000082": "Наливной пол Weber Vetonit 5000 25 кг",
    "MAT-000083": "Наливной пол Litokol LITOLIV S10 EXPRESS 20 кг",
    "MAT-000084": "Наливной пол Litokol LITOLIV S50 EVO 20 кг",
    "MAT-000085": "Наливной пол ВОЛМА-Нивелир Экспресс 25 кг",
    "MAT-000086": "Наливной пол Основит Скорлайн FK45 R 20 кг",
    "MAT-000087": "Наливной пол Ceresit CN 175 Super 20 кг",
    "MAT-000089": "Легкая стяжка пола KNAUF Ubo 25 кг",
    "MAT-000090": "Стяжка пола Основит Стартолайн FC41 H высокопрочная, 25 кг"
});

const PRODUCTS = Object.freeze([...MASONRY.PRODUCTS, ...FLOORS.PRODUCTS]
    .filter(product => Object.prototype.hasOwnProperty.call(CONTENT, product.externalId))
    .map(product => {
        const content = CONTENT[product.externalId];
        const sourceKeys = [...new Set(content.factsUsed.flatMap(code => code === "brand" ? product.core.brand?.sources || product.sourceKeys : product.core[code]?.sources || []))];
        const factsUsed = content.factsUsed.map(code => ({ code, value: code === "brand" ? product.core.brand?.value : product.core[code]?.value, sourceKeys: code === "brand" ? product.core.brand?.sources || [] : product.core[code]?.sources || [] }));
        const omittedCodes = Object.entries(product.core).filter(([code]) => !content.factsUsed.includes(code));
        const factsOmitted = [
            ...omittedCodes.map(([code, fact]) => ({ code, status: fact.status, reason: fact.status === "NEEDS_SOURCE" ? fact.reason : "Reviewed fact intentionally omitted from public copy." })),
            ...content.factsOmitted.map(reason => ({ reason }))
        ];
        return Object.freeze({ ...product, expectedTitle: CURRENT_TITLES[product.externalId] || product.expectedTitle, ...content, sourceKeys, factsUsed, factsOmitted });
    }));

const ONLY = Object.freeze([
    "MAT-000067", "MAT-000068", "MAT-000069", "MAT-000076", "MAT-000078", "MAT-000079",
    "MAT-000080", "MAT-000081", "MAT-000082", "MAT-000083", "MAT-000084", "MAT-000085",
    "MAT-000086", "MAT-000087", "MAT-000089", "MAT-000090"
]);

module.exports = Object.freeze({ ONLY, PRODUCTS, SOURCES });
