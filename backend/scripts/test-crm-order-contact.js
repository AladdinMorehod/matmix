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
globalThis.__contactTest = { getContactAction, getPreferredContact };`, context);

const ordersSource = fs.readFileSync(path.join(root, "public", "js", "crm", "orders.js"), "utf8");
vm.runInContext(`${ordersSource}
globalThis.__orderRenderTest = { renderOverviewTab, renderClientTab };`, context);

const { getContactAction } = context.__contactTest;
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
assert(emptyOverviewHtml.includes("Телефон не указан"));

const clientTabHtml = renderClientTab({
    customerName: "Иван",
    phone: "+7 999 123-45-67",
    consent: {}
});
assert(clientTabHtml.includes("Иван"));
assert(clientTabHtml.includes("+7 999 123-45-67"));

console.log(`CRM order contact scenarios passed: ${scenarios.length + 6}`);
