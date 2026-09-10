const assert = require("assert");
const { productPage, titleWithSuffix } = require("../services/seo");

function meta(html, property) {
    return html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`, "i"))?.[1] || "";
}

function title(html) { return html.match(/<title>([^<]*)<\/title>/i)?.[1] || ""; }
function schema(html) { return [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])).find(item => item["@type"] === "Product"); }

const config = { baseUrl: "https://matmix.test", siteName: "MatMix", defaultOgImage: "/img/logo-burgundy.png" };
const product = { id: 30, external_id: "MAT-000030", title: "Штукатурка короед акриловая Ceresit CT 63, 3 мм 25 кг", price: null, weight: 0, unit: "шт", image_url: "", description: "Штукатурка короед акриловая Ceresit CT 63, 3 мм 25 кг. Код MAT-000030. Каталог MatMix." };
const html = productPage(config, { product, attributes: [], images: [], related: [] }).html;
const renderedTitle = title(html);
assert.strictEqual(renderedTitle, "Штукатурка короед акриловая Ceresit CT 63, 3 мм 25 кг | MatMix");
assert(!renderedTitle.includes("MAT-00003"));
assert.strictEqual(meta(html, "og:title"), renderedTitle);
assert.strictEqual(html.match(/<meta name="twitter:title" content="([^"]*)"/i)?.[1], renderedTitle);
assert(html.includes("MAT-000030"));
assert(schema(html).sku === "MAT-000030");
assert(html.includes("MAT-000030. Каталог MatMix."));
const longDescriptionHtml = productPage(config, { product: { ...product, title: "Длинное название ".repeat(30) }, attributes: [], images: [], related: [] }).html;
assert(longDescriptionHtml.includes("Код MAT-000030. Каталог MatMix."));

assert.strictEqual(titleWithSuffix("Цемент М500", "MatMix"), "Цемент М500 | MatMix");
const veryLong = titleWithSuffix("Очень длинное русскоязычное название товара ".repeat(8), "MatMix");
assert(veryLong.endsWith(" | MatMix"));
assert(Array.from(veryLong).length <= 65);
assert(!/[|—–-]\s*$/.test(veryLong));
assert.strictEqual(titleWithSuffix("Товар", "MatMix", 14), "Товар | MatMix");

const customHtml = productPage(config, { product: { ...product, seo_title: "Мой SEO заголовок" }, attributes: [], images: [], related: [] }).html;
assert.strictEqual(title(customHtml), "Мой SEO заголовок");

console.log(JSON.stringify({ success: true, fallback: true, suffixPreserved: true, customSeoTitle: true, ogTwitterAligned: true, matIdentityPreserved: true }));
