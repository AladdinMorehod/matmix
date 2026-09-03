const assert = require("assert");
const { formatMoneyValue } = require("../utils/numberFormat");
const { productPage, jsonLd } = require("../services/seo");

function schema(product, attributes = []) {
    const html = productPage({ baseUrl: "https://matmix.test", siteName: "MatMix", defaultOgImage: "/img/logo-burgundy.png" }, { product, attributes, images: [], related: [] }).html;
    return [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(item => item["@type"] === "Product");
}

const money = value => formatMoneyValue(value).replace(/\u00a0/g, " ");
assert.strictEqual(money(1102.5), "1 102,50");
assert.strictEqual(money(102.9), "102,90");
assert.strictEqual(money(396.90000000000003), "396,90");
assert.strictEqual(money(1260), "1 260,00");
const base = { id: 1, external_id: "MAT-TEST", title: "Тест", price: 1102.5, weight: 10, unit: "шт", image_url: "" };
assert.deepStrictEqual(schema(base, [{ code: "package_weight", type: "number", value: 10, unit: "кг" }]).weight, { "@type": "QuantitativeValue", value: 10, unitText: "kg" });
assert(!schema({ ...base, external_id: "MAT-000232", title: "Ceresit CT 17 PRO 10 л" }, []).weight);
assert(!schema({ ...base, external_id: "MAT-000335", weight: 11 }, []).weight);
assert.strictEqual(schema({ ...base, price: 396.90000000000003 }, []).offers.price, "396.90");
assert(!schema({ ...base, price: 0 }, []).offers);
console.log(JSON.stringify({ success: true, moneyFormatting: true, weightTypedKgOnly: true, litersNotMass: true, zeroPriceRule: true, offerPriceNormalized: true }));
