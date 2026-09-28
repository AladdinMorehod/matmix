"use strict";

// Exact two-product correction. Owner-provided identity evidence is kept
// separate from technical sources; MAT-000028's retained title is never a fact source.
const TARGETS = Object.freeze(["MAT-000027", "MAT-000028"]);
const CONFIRM = "FIX_PLASTERS_027_028_IDENTITY";
const CHECKED_AT = "2026-09-28";
const PRODUCT_FIELDS = Object.freeze(["brand", "short_description", "full_description", "seo_title", "seo_description"]);
const ATTRIBUTE_CODES = Object.freeze([
    "brand", "product_type", "base", "purpose", "package_weight", "consumption_10mm",
    "wall_layer_thickness", "application_temperature", "shelf_life", "substrates", "color", "application_method"
]);
const SOURCE_KEYS = Object.freeze({
    ownerImage027: {
        title: "Owner-provided MAT-000027 packaging image",
        kind: "owner-provided-identity-evidence",
        note: "Visible EUROmix brand, Сухая Смесь М-150 ВЫСОКОПРОЧНАЯ and ГОСТ 28013-98. Used only for exact identity/product-family corroboration, not technical numeric values."
    },
    euroMixRs: {
        url: "https://russ-kirpich.ru/sukhie-smesi/tsementno-peschanye-smesi/sukhaya-smes-universalnaya-m-150-40-kg-euromix/",
        title: "Сухая смесь высокопрочная М-150 40 кг EUROMIX",
        kind: "secondary-retailer-product-page",
        checkedAt: CHECKED_AT,
        note: "Exact EUROmix M-150 40 kg listing; not a manufacturer source. Supports the technical facts mapped to it below."
    },
    euroMixLaterus: {
        url: "https://laterus.ru/catalog/sukhaya-smes-euromix-peskobeton-m-150-vysokoprochnaya/",
        title: "EUROmix пескобетон М-150 высокопрочная, 40 кг",
        kind: "secondary-dealer-product-page",
        checkedAt: CHECKED_AT,
        note: "Independent exact 40 kg listing used only as corroboration of model/weight and selected technical values; not an official manufacturer source."
    },
    euroMixConsumption: {
        url: "https://filtrakt.ru/catalog/tsementno-peschanye-smesi/78660/",
        title: "Сухая смесь М150 универсальная 40 кг Euromix",
        kind: "secondary-retailer-product-page",
        checkedAt: CHECKED_AT,
        note: "Exact product listing explicitly states 18 kg/m² at a 10 mm layer. Used only for consumption_10mm; no other facts are taken from this page."
    },
    ownerImage028: {
        title: "Owner-provided MAT-000028 packaging image",
        kind: "owner-provided-identity-evidence",
        note: "Visible РУСЕАН, СУХАЯ СМЕСЬ ШТУКАТУРНАЯ, 40 КГ and ГОСТ 33083-2014; owner also confirmed manual application and wall use inside/outside. Does not establish M-150."
    },
    ruseanModified40: {
        url: "https://rusean.ru/catalog/shtukaturka_tsementnaya/shtukaturnaya_sukhaya_smes_modifitsirovannaya_po_40_kg/",
        title: "Штукатурная сухая смесь модифицированная по 40 кг",
        kind: "official-manufacturer-product-page",
        market: "RU",
        checkedAt: CHECKED_AT,
        note: "Current official Rusean page for the exact manual modified plaster 40 kg identity evidenced by the owner image and product wording. The legacy local title's M-150 is explicitly excluded as technical provenance."
    }
});

const ready = (value, sourceKeys, note = "") => Object.freeze({ value, status: "READY", sourceKeys: Object.freeze(sourceKeys), note });
const PRODUCTS = Object.freeze([
    Object.freeze({
        externalId: "MAT-000027",
        expectedTitle: "Штукатурная смесь цементная Евро М-150 40кг",
        expectedSlug: "штукатурная-смесь-цементная-евро-м-150-40кг",
        expectedProduct: Object.freeze({ brand: null, weight: 40, category: "Смеси", subcategory: "Штукатурка", short_description: "Универсальная цементная смесь (пескобетон), который используется и как штукатурка, и как кладочный раствор, и для стяжки пола. Для внутренних и наружных работ. Подходит для оштукатуривания стен, кладки, стяжки и ремонта бетонных поверхностей", full_description: null, seo_title: null, seo_description: null, is_active: 1, deleted_at: null }),
        identityStatus: "CONFIRMED_OWNER_PACKAGING",
        sourceKeys: Object.freeze(["ownerImage027", "euroMixRs", "euroMixLaterus", "euroMixConsumption"]),
        sourceQuality: "Технические сведения получены из вторичных торговых/дилерских карточек; подтверждённого официального производителя EUROmix для этой партии не найдено.",
        facts: Object.freeze({
            brand: ready("EUROMIX", ["ownerImage027", "euroMixRs"]),
            product_type: ready("Универсальная сухая смесь М-150", ["ownerImage027", "euroMixRs"]),
            base: ready("Цемент и речной песок мелкой фракции с добавлением полимерных добавок", ["euroMixRs"]),
            purpose: ready("Оштукатуривание стен и других поверхностей, кладочные работы, устройство полов, ремонт бетонных поверхностей, обработка и заделка швов", ["euroMixRs"]),
            package_weight: ready(40, ["ownerImage027", "euroMixRs"]),
            consumption_10mm: ready("18", ["euroMixConsumption"], "Exact secondary listing states 18 kg/m² at 10 mm; replaces legacy 15-20 without averaging."),
            wall_layer_thickness: ready("5–50 мм", ["euroMixRs"]),
            application_temperature: ready("от +5 до +30 °C", ["euroMixRs"]),
            shelf_life: ready(6, ["euroMixLaterus"]),
            substrates: ready("Цементно-песчаные, кирпичные, цементно-известковые и бетонные основания", ["euroMixRs"]),
            color: ready("Серый", ["euroMixRs"]),
            application_method: null
        }),
        proposedProduct: Object.freeze({
            brand: "EUROMIX",
            short_description: "Высокопрочная сухая смесь EUROmix М-150 40 кг для штукатурных, кладочных и ремонтных работ.",
            full_description: "EUROmix М-150 — универсальная сухая смесь в фасовке 40 кг. Материал применяют для оштукатуривания стен и других поверхностей, кладочных работ, устройства полов, ремонта бетонных поверхностей и обработки швов. Рекомендуемая толщина слоя — 5–50 мм, температура проведения работ — от +5 до +30 °C.",
            seo_title: "EUROmix М-150 40 кг — купить сухую смесь в Москве",
            seo_description: "Высокопрочная сухая смесь EUROmix М-150 40 кг для штукатурных, кладочных и ремонтных работ. Слой 5–50 мм. Закажите с доставкой по Москве и МО."
        }),
        expectedAttributes: Object.freeze({
            brand: { value: "Euromix", type: "text" },
            base: { value: "Цемент и речной песок мелкой фракции с добавлением полимерных добавок", type: "text" },
            consumption_10mm: { value: "15-20", type: "text", unit: "кг/м²" },
            package_weight: { value: 40, type: "number", unit: "кг" },
            purpose: { value: "Универсальное. Используется для оштукатуривания стен (внутренних и наружных), кладки, стяжки пола, ремонта бетонных поверхностей и заделки швов", type: "text" },
            shelf_life: { value: 6, type: "number", unit: "месяцев" },
            wall_layer_thickness: { value: "5–50", type: "text" },
            application_temperature: { value: "+5…+30 °C", type: "text" }
        })
    }),
    Object.freeze({
        externalId: "MAT-000028",
        expectedTitle: "Штукатурная смесь цементная Русеан М-150 40кг",
        expectedSlug: "штукатурная-смесь-цементная-русеан-м-150-40кг",
        expectedProduct: Object.freeze({ brand: null, weight: 40, category: "Смеси", subcategory: "Штукатурка", short_description: "Это цементная выравнивающая штукатурка для черновой отделки стен и потолков.", full_description: "Это цементная штукатурка. Она прочная и влагостойкая, но требует обязательного грунтования основания перед нанесением и защиты от сквозняков и быстрого высыхания в первые сутки . При толщине слоя более 20 мм наносить в несколько приёмов с полным высыханием предыдущего слоя", seo_title: null, seo_description: null, is_active: 1, deleted_at: null }),
        identityStatus: "CONFIRMED_OWNER_PACKAGING_AND_OFFICIAL_PRODUCT",
        legacyTitleNote: "Локальный title сохраняется как владелец-зафиксированный identity guard; токен «М-150» в нём не является technical source и не переносится в facts, visible content или SEO.",
        sourceKeys: Object.freeze(["ownerImage028", "ruseanModified40"]),
        facts: Object.freeze({
            brand: ready("Русеан", ["ownerImage028", "ruseanModified40"]),
            product_type: ready("Сухая штукатурная смесь модифицированная", ["ownerImage028", "ruseanModified40"]),
            base: ready("Портландцемент, известь, фракционный песок и модифицирующие добавки", ["ruseanModified40"]),
            purpose: ready("Ручное оштукатуривание стен внутри и снаружи зданий, включая бетон, кирпич, керамические блоки и ячеистый бетон; заделка и обработка швов", ["ownerImage028", "ruseanModified40"]),
            application_method: ready("Ручное нанесение", ["ownerImage028", "ruseanModified40"]),
            substrates: ready("Бетон, кирпич, керамические блоки, цементные штукатурки, ячеистый бетон", ["ruseanModified40"]),
            color: ready("Серый", ["ruseanModified40"]),
            package_weight: ready(40, ["ownerImage028", "ruseanModified40"]),
            wall_layer_thickness: ready("10–20 мм; локально до 50 мм", ["ruseanModified40"]),
            consumption_10mm: ready("15–17", ["ruseanModified40"], "The same official page gives descriptive average 15–17 and separate nominal table value 17; descriptive range is preserved without averaging."),
            application_temperature: ready("от +5 до +25 °C", ["ruseanModified40"]),
            shelf_life: ready(6, ["ruseanModified40"])
        }),
        proposedProduct: Object.freeze({
            brand: "Русеан",
            short_description: "Штукатурная сухая смесь Русеан 40 кг для ручного нанесения на стены внутри и снаружи зданий.",
            full_description: "Сухая штукатурная смесь Русеан в фасовке 40 кг предназначена для ручного оштукатуривания стен внутри и снаружи зданий. Подходит для бетонных оснований, кирпича, керамических блоков, цементных штукатурок и ячеистого бетона. Рекомендуемая толщина слоя — 10–20 мм, локально до 50 мм. Средний расход — 15–17 кг/м² при слое 10 мм.",
            seo_title: "Штукатурная смесь Русеан 40 кг — купить в Москве",
            seo_description: "Штукатурная сухая смесь Русеан 40 кг для ручного нанесения внутри и снаружи зданий. Слой 10–20 мм. Закажите с доставкой по Москве и МО."
        }),
        expectedAttributes: Object.freeze({
            brand: { value: "Русеан", type: "text" },
            application_temperature: { value: "+5…+30 °C", type: "text" },
            base: { value: "Портландцемент М-400, фракционный песок, известь и модифицирующие добавки", type: "text" },
            consumption_10mm: { value: "17-18", type: "text", unit: "кг/м²" },
            package_weight: { value: 40, type: "number", unit: "кг" },
            purpose: { value: "Черновое выравнивание стен и потолков из бетона, кирпича и ячеистого бетона. Подходит для внутренних и наружных работ, а также для заделки швов и ремонта", type: "text" },
            shelf_life: { value: 6, type: "number", unit: "месяцев" },
            wall_layer_thickness: { value: "10-20 мм за проход", type: "text" }
        })
    })
]);

module.exports = Object.freeze({ TARGETS, CONFIRM, CHECKED_AT, PRODUCT_FIELDS, ATTRIBUTE_CODES, SOURCES: SOURCE_KEYS, PRODUCTS });
