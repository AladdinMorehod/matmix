const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(
    path.join(__dirname, "..", "..", "public", "js", "crm", "products.js"),
    "utf8"
);
const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const context = {
    console,
    currentUser: { role: "admin" },
    products: [
        { productGroup: " Готовые " },
        { product_group: "Сухая смесь" },
        { productGroup: "Готовые" },
        { productGroup: " " },
        { productGroup: '<Опасная "группа">' }
    ],
    escapeHtml
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(`${source}
globalThis.__productGroupTest = {
    getProductPayloadFromForm,
    getProductGroupValue,
    getProductGroupSuggestions,
    renderProductForm
};`, context);

const {
    getProductPayloadFromForm,
    getProductGroupValue,
    getProductGroupSuggestions,
    renderProductForm
} = context.__productGroupTest;

assert.strictEqual(getProductGroupValue({ productGroup: " Новая " }), "Новая");
assert.strictEqual(getProductGroupValue({ product_group: " Legacy " }), "Legacy");
assert.deepStrictEqual(
    Array.from(getProductGroupSuggestions()),
    ['<Опасная "группа">', "Готовые", "Сухая смесь"]
);

const fields = new Map([
    ["title", " Товар "],
    ["category", " Категория "],
    ["subcategory", " Подкатегория "],
    ["productGroup", " Сухая смесь "],
    ["price", "100"],
    ["weight", "2"],
    ["unit", "шт"],
    ["description", "Описание"],
    ["isActive", "on"]
]);
const payload = getProductPayloadFromForm({ get: key => fields.get(key) });
assert.deepStrictEqual(JSON.parse(JSON.stringify(payload)), {
    title: "Товар",
    category: "Категория",
    subcategory: "Подкатегория",
    productGroup: "Сухая смесь",
    price: "100",
    weight: "2",
    unit: "шт",
    description: "Описание",
    isActive: true
});

fields.set("productGroup", "   ");
assert.strictEqual(getProductPayloadFromForm({ get: key => fields.get(key) }).productGroup, "");

const camelCaseHtml = renderProductForm({
    title: "Товар",
    category: "",
    productGroup: '<Новая "группа">',
    isActive: true
});
assert(camelCaseHtml.includes('name="productGroup"'));
assert(camelCaseHtml.includes('list="product-group-options"'));
assert(camelCaseHtml.includes('maxlength="200"'));
assert(camelCaseHtml.includes('&lt;Новая &quot;группа&quot;&gt;'));
assert(!camelCaseHtml.includes('<Новая "группа">'));
assert(camelCaseHtml.includes('&lt;Опасная &quot;группа&quot;&gt;'));

const snakeCaseHtml = renderProductForm({ product_group: "Legacy", isActive: true });
assert(snakeCaseHtml.includes('value="Legacy"'));

console.log("CRM product group UI scenarios passed: 10");
