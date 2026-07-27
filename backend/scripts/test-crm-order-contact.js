const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..", "..");
const domStub = {
    addEventListener() {},
    appendChild() {},
    classList: {
        add() {},
        remove() {},
        toggle() {}
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    dataset: {},
    style: {}
};
const context = {
    console,
    Intl,
    Map,
    Set,
    URLSearchParams,
    encodeURIComponent,
    document: {
        getElementById: () => domStub,
        querySelectorAll: () => []
    },
    window: {
        MatMixSafe: {
            escapeHtml(value) {
                return String(value ?? "")
                    .replaceAll("&", "&amp;")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                    .replaceAll('"', "&quot;")
                    .replaceAll("'", "&#39;");
            }
        }
    },
    normalizePaginationMeta: () => ({ page: 1, limit: 20, total: 0 })
};
context.globalThis = context;
vm.createContext(context);

const stateSource = fs.readFileSync(path.join(root, "public", "js", "crm", "state.js"), "utf8");
vm.runInContext(`${stateSource}
globalThis.__contactTest = { getContactAction, getPreferredContact, getPreferredContactText, resolveOrderContact };`, context);

const ordersSource = fs.readFileSync(path.join(root, "public", "js", "crm", "orders.js"), "utf8");
vm.runInContext(`${ordersSource}
globalThis.__orderRenderTest = { renderOverviewTab, renderClientTab };`, context);

const { getContactAction, getPreferredContact, getPreferredContactText, resolveOrderContact } = context.__contactTest;
const { renderOverviewTab, renderClientTab } = context.__orderRenderTest;

const scenarios = [
    {
        name: "phone method falls back to order phone",
        order: { preferredContactMethod: "phone", phone: "+7 (999) 123-45-67" },
        href: "tel:+79991234567"
    },
    {
        name: "valid Telegram keeps priority",
        order: { preferredContactMethod: "telegram", preferredContactValue: "@matmix", phone: "+7 999 123-45-67" },
        href: "https://t.me/matmix"
    },
    {
        name: "empty Telegram falls back to order phone",
        order: { preferredContactMethod: "telegram", preferredContactValue: "   ", phone: "+7 999 123-45-67" },
        href: "tel:+79991234567"
    },
    {
        name: "valid email keeps priority",
        order: { preferredContactMethod: "email", preferredContactValue: "client@example.test", phone: "+7 999 123-45-67" },
        href: "mailto:client@example.test"
    },
    {
        name: "empty MAX falls back to order phone",
        order: { preferredContactMethod: "max", preferredContactValue: null, phone: "+7 999 123-45-67" },
        href: "tel:+79991234567"
    },
    {
        name: "legacy Telegram works without order phone",
        order: { telegram: "@legacy_contact" },
        href: "https://t.me/legacy_contact"
    },
    {
        name: "invalid preferred phone falls through to legacy Telegram",
        order: { preferred_contact_method: "telephone", preferred_contact_value: " ", telegram: "@legacy_contact" },
        href: "https://t.me/legacy_contact"
    },
    {
        name: "legacy email works without order phone",
        order: { email: "legacy@example.test" },
        href: "mailto:legacy@example.test"
    },
    {
        name: "legacy max_contact remains a disabled informational action",
        order: { max_contact: "legacy-max" },
        disabled: true
    }
];

for (const scenario of scenarios) {
    const action = getContactAction(scenario.order);
    assert(action, `${scenario.name}: expected an action`);
    if (scenario.href) assert.strictEqual(action.href, scenario.href, scenario.name);
    if (scenario.disabled) assert.strictEqual(action.disabled, true, scenario.name);
}

const consistencyScenarios = [
    {
        name: "empty preferred Telegram uses order phone",
        order: { preferredContactMethod: "telegram", preferredContactValue: "", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "whitespace preferred Telegram uses order phone",
        order: { preferred_contact_method: "telegram", preferred_contact_value: "   ", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "invalid preferred Telegram uses order phone",
        order: { preferredContactMethod: "telegram", preferredContactValue: "invalid username", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "empty preferred email uses order phone",
        order: { preferredContactMethod: "email", preferredContactValue: "", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "invalid preferred email uses order phone",
        order: { preferredContactMethod: "email", preferredContactValue: "invalid@", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "empty preferred MAX uses order phone",
        order: { preferredContactMethod: "max", preferredContactValue: " ", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "unknown preferred method uses order phone",
        order: { preferredContactMethod: "signal", preferredContactValue: "contact", phone: "+7 900 111-22-33" },
        method: "Телефон",
        source: "order_phone",
        href: "tel:+79001112233"
    },
    {
        name: "valid preferred Telegram wins",
        order: { preferredContactMethod: "telegram", preferredContactValue: "@matmix", phone: "+7 900 111-22-33" },
        method: "Telegram",
        source: "preferred",
        href: "https://t.me/matmix"
    },
    {
        name: "valid preferred email wins",
        order: { preferredContactMethod: "email", preferredContactValue: "client@example.test", phone: "+7 900 111-22-33" },
        method: "E-mail",
        source: "preferred",
        href: "mailto:client@example.test"
    },
    {
        name: "valid preferred MAX remains informational",
        order: { preferredContactMethod: "max", preferredContactValue: "max-user", phone: "+7 900 111-22-33" },
        method: "MAX",
        source: "preferred",
        disabled: true
    },
    {
        name: "legacy Telegram follows missing preferred and phone",
        order: { preferredContactMethod: "telegram", preferredContactValue: "", telegram: "@legacy_contact" },
        method: "Telegram",
        source: "legacy",
        href: "https://t.me/legacy_contact"
    },
    {
        name: "no usable contact is consistent",
        order: { preferredContactMethod: "email", preferredContactValue: "invalid", phone: " ", telegram: "invalid username" },
        method: "",
        source: "none",
        noAction: true
    }
];

function assertContactConsistency(scenario) {
    const resolved = resolveOrderContact(scenario.order);
    const preferred = getPreferredContact(scenario.order);
    const text = getPreferredContactText(scenario.order);
    const action = getContactAction(scenario.order);

    assert.strictEqual(resolved.method, scenario.method, `${scenario.name}: resolved method`);
    assert.strictEqual(resolved.source, scenario.source, `${scenario.name}: resolved source`);
    assert.strictEqual(preferred.method, scenario.method, `${scenario.name}: preferred method`);
    assert.strictEqual(preferred.source, scenario.source, `${scenario.name}: preferred source`);
    assert.strictEqual(text, scenario.method || "Не выбран", `${scenario.name}: preferred text`);
    if (scenario.noAction) {
        assert.strictEqual(action, null, `${scenario.name}: expected no action`);
        return;
    }
    assert(action, `${scenario.name}: expected action`);
    assert.strictEqual(action.method, scenario.method, `${scenario.name}: action method`);
    assert.strictEqual(action.source, scenario.source, `${scenario.name}: action source`);
    if (scenario.href) assert.strictEqual(action.href, scenario.href, `${scenario.name}: action href`);
    if (scenario.disabled) assert.strictEqual(action.disabled, true, `${scenario.name}: action disabled`);
}

consistencyScenarios.forEach(assertContactConsistency);

for (const order of [
    {},
    { preferredContactMethod: null, preferredContactValue: undefined, phone: "   " },
    { preferredContactMethod: "telegram", preferredContactValue: "invalid username", phone: null }
]) {
    assert.strictEqual(getContactAction(order), null);
}

const overviewHtml = renderOverviewTab({
    id: 1,
    customerName: '<Иван "Тест">',
    phone: "+7 999 123-45-67",
    items: [],
    totalPrice: 0,
    totalWeight: 0
});
assert(overviewHtml.includes("&lt;Иван &quot;Тест&quot;&gt;"));
assert(overviewHtml.includes("+7 999 123-45-67"));
assert(!overviewHtml.includes('<Иван "Тест">'));

const emptyOverviewHtml = renderOverviewTab({ id: 2, customerName: null, phone: " ", items: [] });
assert(emptyOverviewHtml.includes("Не указано"));
assert(/<span>Тел\.<\/span>\s*<strong>Не указан<\/strong>/.test(emptyOverviewHtml));

const clientTabHtml = renderClientTab({
    customerName: "Иван",
    phone: "+7 999 123-45-67",
    consent: {}
});
assert(clientTabHtml.includes("Иван"));
assert(clientTabHtml.includes("+7 999 123-45-67"));

console.log(`CRM order contact scenarios passed: ${scenarios.length + consistencyScenarios.length + 6}`);
