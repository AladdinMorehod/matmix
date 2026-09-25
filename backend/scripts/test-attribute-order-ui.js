const assert = require("assert");
const path = require("path");
const { chromium } = require("playwright");
const { MAIN_ATTRIBUTES, resolve } = require("../services/productAttributeOrder");
const { productPage, seoConfig } = require("../services/seo");

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
    const errors = [];
    try {
        for (const width of [1280, 390]) {
            const page = await browser.newPage();
            page.on("pageerror", error => errors.push(error.message));
            await page.setViewportSize({ width, height: 900 });
            await page.setContent('<div class="crm-modal-overlay"><section class="crm-modal crm-modal-wide"><form class="crm-modal-form"><div class="crm-modal-content" id="fixture"></div></form></section></div>');
            for (const file of ["manager.css", "crm-toast.css"]) await page.addStyleTag({ path: path.join(__dirname, "../../public/css", file) });
            await page.addScriptTag({ content: "function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('\\\"', '&quot;'); }" });
            await page.addScriptTag({ path: path.join(__dirname, "../../public/js/attribute-order.js") });
            await page.addScriptTag({ path: path.join(__dirname, "../../public/js/crm/products.js") });
            await page.evaluate(main => {
                const definitions = [...main, { code: "alpha", label: "Очень длинная характеристика для проверки переноса текста в мобильном редакторе" }, { code: "beta", label: "Бета" }, { code: "gamma", label: "Гамма" }]
                    .map((row, index) => ({ ...row, id: index + 1, dataType: "text", isActive: true, sortOrder: index === 4 ? 90 : index === 5 ? 20 : 10 }));
                productContentEditor = { definitions, removedDefinitionIds: [], templateDirty: false, content: {
                    product: { brand: "Test Brand A" }, structureId: 2,
                    templates: [{ ...definitions[4], definitionId: 5, sortOrder: 5, unit: "", isRequired: false }],
                    values: [{ ...definitions[5], definitionId: 6, value: "Сохранить текст", unit: "" }]
                } };
                document.querySelector("#fixture").innerHTML = renderProductAttributes();
                setupProductAttributeControls(document.querySelector("form"));
            }, MAIN_ATTRIBUTES);
            assert.strictEqual(await page.locator('[data-remove-attribute]').count(), 1);
            assert.strictEqual(await page.locator('[data-template-row]').count(), 1);
            await page.locator('[name="attribute_2"]').fill("Введённый тип продукта");
            await page.locator('[name="brand"]').fill("Test Brand B");
            await page.locator('[data-add-attribute]').selectOption("5");
            await page.locator('[data-add-attribute-button]').click();
            assert.strictEqual(await page.locator('[name="attribute_2"]').inputValue(), "Введённый тип продукта");
            assert.strictEqual(await page.locator('[name="brand"]').inputValue(), "Test Brand B");
            assert.deepStrictEqual(await page.locator('[data-remove-attribute]').evaluateAll(rows => rows.map(row => row.dataset.removeAttribute)), ["5", "6"]);
            await page.locator('[data-remove-attribute="5"]').click();
            assert.strictEqual(await page.locator('[data-template-row="5"]').count(), 1);
            assert.strictEqual(await page.evaluate(() => productContentEditor.templateDirty), false);
            await page.locator('[data-add-attribute]').selectOption("5");
            await page.locator('[data-add-attribute-button]').click();
            await page.locator('[data-template-add]').selectOption("6");
            await page.locator('[data-template-add-button]').click();
            await page.locator('[data-template-move="6"][data-offset="-1"]').click();
            assert.deepStrictEqual(await page.locator('[data-remove-attribute]').evaluateAll(rows => rows.map(row => row.dataset.removeAttribute)), ["6", "5"]);
            assert.strictEqual(await page.locator('[name="attribute_6"]').inputValue(), "Сохранить текст");
            const payload = await page.evaluate(() => getProductContentPayloadFromForm(new FormData(document.querySelector("form"))));
            assert.strictEqual(payload.brand, "Test Brand B");
            assert.strictEqual(await page.evaluate(() => productContentEditor.content.product.brand), "Test Brand B");
            assert.strictEqual(payload.attributes.find(item => item.definitionId === 2).value, "Введённый тип продукта");
            assert.deepStrictEqual(payload.removedDefinitionIds, []);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `CRM overflow at ${width}`);
            assert(await page.locator('.crm-modal').evaluate(element => element.scrollWidth <= element.clientWidth + 1), `Modal overflow at ${width}`);
            if (process.argv[2]) { await page.locator(".crm-modal-content").evaluate(element => { element.scrollTop = 0; }); await page.screenshot({ path: path.join(process.argv[2], `attribute-order-crm-${width}.png`), fullPage: false }); }

            const attributes = resolve({ brand: "Бренд", values: [{ code: "shelf_life", value: "12 месяцев" }, { code: "package_weight", value: "25", unit: "кг" }] });
            const html = productPage(seoConfig({}), { product: { id: 1, external_id: "TEST", title: "Тестовый товар", brand: "Бренд", price: 100, unit: "шт" }, attributes, images: [] }).html;
            await page.setContent(html);
            await page.addStyleTag({ path: path.join(__dirname, "../../public/css/style.css") });
            assert.deepStrictEqual(await page.locator('#productCharacteristics dt').allTextContents(), ["Бренд", "Срок хранения", "Фасовка"]);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Public overflow at ${width}`);
            assert.strictEqual(await page.locator('.product-page-image-empty').count(), 1);
            if (process.argv[2]) await page.screenshot({ path: path.join(process.argv[2], `attribute-order-public-${width}.png`), fullPage: true });
            await page.close();
        }
        assert.deepStrictEqual(errors, []);
        console.log("PASS Chromium desktop/mobile: add/remove, template reorder, draft values retained, canonical brand, empty main, long labels, no overflow, public image fallback");
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
