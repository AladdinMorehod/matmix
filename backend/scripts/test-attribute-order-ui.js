const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { MAIN_ATTRIBUTES, resolve } = require("../services/productAttributeOrder");
const { productPage, seoConfig } = require("../services/seo");

const productsUi = fs.readFileSync(path.join(__dirname, "../../public/js/crm/products.js"), "utf8");
const openProductFormSource = productsUi.slice(productsUi.indexOf("async function openProductForm"));
const templateManagerStart = productsUi.indexOf("async function openAttributeTemplateManager");
const templateManagerSource = productsUi.slice(templateManagerStart, productsUi.indexOf("function captureAttributeEditor", templateManagerStart));
assert(!openProductFormSource.includes("/api/products/attribute-templates/"), "product Save must not call template API");
assert(templateManagerSource.includes("CrmApi.put("), "template modal owns the independent PUT");

function makeFixture() {
    const main = MAIN_ATTRIBUTES.map((row, index) => Object.assign({}, row, { id: index + 1, dataType: "text", isActive: true, sortOrder: index }));
    const regular = Array.from({ length: 25 }, (_, index) => ({
        id: index + 5, code: index === 0 ? "alpha" : "attribute_" + (index + 5),
        label: index === 0 ? "Очень длинная характеристика для проверки переноса текста в редакторе" : "Характеристика " + (index + 5),
        dataType: "text", defaultUnit: index === 0 ? "мм" : "", isActive: true, sortOrder: index
    }));
    const beta = { id: 30, code: "beta", label: "Бета", dataType: "text", defaultUnit: "кг", isActive: true, sortOrder: 30 };
    const gamma = { id: 31, code: "gamma", label: "Гамма", dataType: "text", defaultUnit: "", isActive: true, sortOrder: 31 };
    const definitions = main.concat(regular, beta, gamma);
    const templateRows = [1, 2, 3, 4].map((id, index) => ({
        attribute_definition_id: id, code: definitions.find(item => item.id === id).code,
        label: definitions.find(item => item.id === id).label, data_type: "text", default_unit: null, unit_override: null,
        section: "main", sort_order: index, is_required: Number(id === 2), is_active: 1
    })).concat(regular.map((item, index) => ({
        attribute_definition_id: item.id, code: item.code, label: item.label, data_type: item.dataType,
        default_unit: item.defaultUnit || null, unit_override: null, section: "regular", sort_order: index, is_required: 0, is_active: 1
    })));
    return { main, regular, beta, gamma, definitions, templateRows };
}

async function dragTemplateRow(page, sourceId, targetId, afterTarget = false) {
    await page.evaluate(({ sourceId, targetId, afterTarget }) => {
        const root = document.querySelector('[role="dialog"] .product-template-manager');
        const source = root.querySelector(`[data-template-drag-handle="${sourceId}"]`);
        const target = root.querySelector(`[data-template-row="${targetId}"]`);
        const transfer = new DataTransfer();
        const box = target.getBoundingClientRect();
        const clientY = box.top + (afterTarget ? box.height - 1 : 1);
        source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }));
        target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY }));
        target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY }));
    }, { sourceId, targetId, afterTarget });
}

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe" });
    const errors = [];
    try {
        for (const width of [360, 390, 768, 1024, 1440]) {
            const page = await browser.newPage();
            page.on("pageerror", error => errors.push(error.message));
            await page.setViewportSize({ width, height: 900 });
            await page.setContent('<div class="crm-modal-overlay"><section class="crm-modal crm-modal-wide"><form class="crm-modal-form"><div class="crm-modal-content" id="fixture"></div></form></section></div>');
            for (const file of ["manager.css", "crm-toast.css"]) await page.addStyleTag({ path: path.join(__dirname, "../../public/css", file) });
            await page.addScriptTag({ content: "function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('\"', '&quot;').replaceAll(\"'\", '&#39;'); }" });
            await page.addScriptTag({ path: path.join(__dirname, "../../public/js/attribute-order.js") });
            await page.addScriptTag({ path: path.join(__dirname, "../../public/js/crm/ui/modal.js") });
            await page.addScriptTag({ path: path.join(__dirname, "../../public/js/crm/products.js") });
            const fixture = makeFixture();
            await page.evaluate(({ definitions, templateRows }) => {
                window.__calls = [];
                window.__templatePut = null;
                window.__productValues = [{ definitionId: 2, value: "Сохранить тип" }, { definitionId: 30, value: "Сохранить значение" }];
                window.CrmApi = {
                    get: async url => { window.__calls.push({ method: "GET", url }); return { templates: templateRows }; },
                    put: async (url, payload) => {
                        window.__calls.push({ method: "PUT", url, payload });
                        window.__templatePut = { url, payload };
                        return { templates: payload.templates.map(item => {
                            const definition = definitions.find(row => row.id === item.definitionId);
                            return { id: item.definitionId, structure_id: 2, attribute_definition_id: item.definitionId, sort_order: item.sortOrder,
                                section: item.section, is_required: Number(item.isRequired), unit_override: item.unitOverride || null,
                                code: definition.code, label: definition.label, data_type: definition.dataType,
                                default_unit: definition.defaultUnit || null, is_active: 1 };
                        }) };
                    }
                };
                window.notifySuccess = () => {};
                window.notifyWarning = () => {};
                window.notifyError = error => { throw new Error(String(error)); };
                productContentEditor = { definitions, removedDefinitionIds: [], selectedSubcategoryName: "Штукатурка", content: {
                    product: { brand: "Test Brand A" }, structureId: 2,
                    templates: templateRows.map(item => ({ definitionId: item.attribute_definition_id, code: item.code, label: item.label,
                        dataType: item.data_type, section: item.section, sortOrder: item.sort_order, unitOverride: item.unit_override || "",
                        defaultUnit: item.default_unit || "", isRequired: Boolean(item.is_required), isActive: true })),
                    values: [
                        Object.assign({}, definitions.find(item => item.id === 2), { definitionId: 2, value: "Тип A", unitOverride: "" }),
                        Object.assign({}, definitions.find(item => item.id === 30), { definitionId: 30, value: "Сохранить текст", unit: "кг", unitOverride: "" })
                    ]
                } };
                document.querySelector("#fixture").innerHTML = renderProductAttributes();
                setupProductAttributeControls(document.querySelector("form"));
            }, { definitions: fixture.definitions, templateRows: fixture.templateRows });

            assert.strictEqual(await page.locator("[data-template-row]").count(), 0);
            assert((await page.locator("[data-template-settings]").textContent()).includes("Штукатурка"));
            assert(await page.locator('[data-add-attribute="main"] option[value="3"]').count());
            assert(await page.locator('[data-add-attribute="regular"] option[value="5"]').count());
            assert.strictEqual(await page.locator('[data-add-attribute="main"] option[value="30"]').count(), 0,
                "product main Add must exclude definitions outside this subcategory's main memberships");
            assert.strictEqual(await page.locator('[data-add-attribute="regular"] option[value="31"]').count(), 0,
                "product Add must exclude definitions outside the regular template");
            assert.strictEqual(await page.locator(".product-attribute-unit summary").filter({ hasText: "Единица +" }).count(), 0,
                "unitless text attributes should not show the old noisy unit action");
            await page.locator('[name="attribute_2"]').fill("Введённый тип продукта");
            await page.locator('[name="brand"]').fill("Test Brand B");
            await page.locator('[data-add-attribute="main"]').selectOption("3");
            await page.locator('[data-add-attribute-button="main"]').click();
            await page.locator('[name="attribute_3"]').fill("18 месяцев");
            await page.locator('[data-add-attribute="regular"]').selectOption("5");
            await page.locator('[data-add-attribute-button="regular"]').click();
            await page.locator('[name="attribute_5"]').fill("4–6 мм");
            const productRowLayout = await page.locator('[name="attribute_2"]').evaluate(input => {
                const row = input.closest(".product-attribute-row");
                const rect = selector => { const box = row.querySelector(selector).getBoundingClientRect(); return { top: box.top, bottom: box.bottom, left: box.left, right: box.right }; };
                return { label: rect(".product-attribute-label"), value: rect(".product-attribute-value"), remove: rect(".product-attribute-remove") };
            });
            if (width >= 1200) assert(Math.abs(productRowLayout.label.top - productRowLayout.value.top) < 24, "desktop attribute rows should remain compact and inline");
            if (width <= 767) {
                assert(productRowLayout.label.top < productRowLayout.value.top, "mobile attribute rows should stack label and value");
                assert(productRowLayout.value.right <= productRowLayout.remove.left, "mobile remove button must not cover the value field");
            }
            await page.locator('[data-remove-attribute="3"]').click();
            await page.locator('[data-remove-attribute="5"]').click();
            const contentPayload = await page.evaluate(() => getProductContentPayloadFromForm(new FormData(document.querySelector("form"))));
            assert.strictEqual(contentPayload.brand, "Test Brand B");
            assert.strictEqual(contentPayload.attributes.find(item => item.definitionId === 2).value, "Введённый тип продукта");
            assert.deepStrictEqual(contentPayload.removedDefinitionIds, [3, 5]);
            assert(await page.evaluate(() => productContentEditor.content.templates.some(item => item.definitionId === 3 && item.section === "main")));
            assert.strictEqual(await page.evaluate(() => window.__templatePut), null);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "CRM horizontal overflow at " + width);
            assert(await page.locator(".crm-modal").evaluate(element => element.scrollWidth <= element.clientWidth + 1), "Product editor overflow at " + width);
            if (process.argv[2]) await page.screenshot({ path: path.join(process.argv[2], "attribute-order-crm-" + width + ".png"), fullPage: false });

            await page.locator("[data-template-settings]").click();
            await page.locator('[role="dialog"] h2').filter({ hasText: "Шаблон подкатегории: Штукатурка" }).waitFor();
            const topDialogText = await page.locator('[role="dialog"]').evaluate(dialog => {
                const bounds = dialog.getBoundingClientRect();
                const topElement = document.elementsFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2).find(element => element.closest(".crm-modal"));
                return topElement?.closest(".crm-modal")?.innerText || "";
            });
            assert(topDialogText.includes("Порядок меняется кнопками"), "template modal must be visually top; got: " + topDialogText.slice(0, 90));
            assert(await page.locator('[role="dialog"] .crm-modal-primary').isVisible());
            assert(await page.locator('[role="dialog"] .crm-modal-secondary').isVisible());
            await page.locator('[role="dialog"] .crm-modal-secondary').click();
            await page.locator('[role="dialog"] h2').waitFor({ state: "detached" });
            assert.strictEqual(await page.evaluate(() => window.__templatePut), null);
            await page.locator("[data-template-settings]").click();
            await page.locator('[role="dialog"] h2').filter({ hasText: "Шаблон подкатегории: Штукатурка" }).waitFor();
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-row]').count(), 29);
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-list="main"] [data-template-row]').count(), 4);
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-list="regular"] [data-template-row]').count(), 25);
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-add="main"]').count(), 0,
                "template editor must not show a native select for the global definition list");
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-picker-toggle="main"]').count(), 1);
            assert.strictEqual(await page.locator('[role="dialog"] input[type="number"]').count(), 0);
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-unit="5"]').getAttribute("placeholder"), "По умолчанию: мм");
            assert(await page.locator('[role="dialog"] .crm-modal-content').evaluate(element => element.scrollHeight > element.clientHeight));
            const templateActions = await page.locator('[role="dialog"] .crm-modal-actions').evaluate(element => {
                const box = element.getBoundingClientRect();
                return { top: box.top, bottom: box.bottom, buttons: [...element.querySelectorAll("button")].map(button => {
                    const rect = button.getBoundingClientRect();
                    return { label: button.textContent.trim(), top: rect.top, bottom: rect.bottom, right: rect.right };
                }) };
            });
            assert(templateActions.bottom <= 900 && templateActions.buttons.every(button => button.top >= 0 && button.bottom <= 900 && button.right <= width), "template Save/Cancel controls must fit within the viewport: " + JSON.stringify(templateActions));
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Template modal overflow at " + width);
            assert(await page.locator('[role="dialog"].crm-modal').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
            if (process.argv[2]) {
                await page.waitForTimeout(220);
                await page.screenshot({ path: path.join(process.argv[2], "attribute-template-modal-" + width + ".png"), fullPage: false });
            }

            page.on("dialog", dialog => dialog.accept());
            await page.locator('[role="dialog"] [data-template-remove="6"]').click();
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-row="6"]').count(), 0,
                "removing a template row should remove only draft membership");
            await page.locator('[role="dialog"] [data-template-picker-toggle="main"]').click();
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-picker-results="main"] [data-definition-id="2"]').count(), 0,
                "picker must not show definitions already in the template");
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-picker-results="main"] [data-definition-id="6"]').count(), 1,
                "picker should offer the definition removed from this draft template");
            await page.locator('[role="dialog"] [data-template-search="main"]').fill("Бета");
            await page.locator('[role="dialog"] [data-template-pick="main"][data-definition-id="30"]').click();
            await page.locator('[role="dialog"] [data-template-picker-toggle="regular"]').click();
            await page.locator('[role="dialog"] [data-template-search="regular"]').fill("Гамма");
            await page.locator('[role="dialog"] [data-template-pick="regular"][data-definition-id="31"]').click();
            await page.locator('[role="dialog"] [data-template-row="5"] .product-template-unit summary').click();
            await page.locator('[role="dialog"] [data-template-unit="5"]').fill("см");
            await page.locator('[role="dialog"] [data-template-required="5"]').check();
            await page.locator('[role="dialog"] [data-template-section-move="30"]').click();
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-section-panel="regular"] [data-template-row="30"]').count(), 1,
                "explicit section action must move an existing draft membership main to regular");
            await page.locator('[role="dialog"] [data-template-move="30"][data-offset="-1"]').click();
            await page.locator('[role="dialog"] [data-template-section-move="31"]').click();
            assert.strictEqual(await page.locator('[role="dialog"] [data-template-section-panel="main"] [data-template-row="31"]').count(), 1,
                "explicit section action must move an existing draft membership regular to main");
            await dragTemplateRow(page, 30, 5, true);
            await page.locator('[role="dialog"] .crm-modal-primary').click();
            await page.locator('[role="dialog"] h2').waitFor({ state: "detached" });
            const saved = await page.evaluate(() => window.__templatePut);
            assert.strictEqual(saved.url, "/api/products/attribute-templates/2");
            assert.strictEqual(saved.payload.templates.some(item => item.definitionId === 6), false);
            assert(saved.payload.templates.some(item => item.definitionId === 2 && item.section === "main"));
            assert(saved.payload.templates.some(item => item.definitionId === 5 && item.section === "regular" && item.unitOverride === "см" && item.isRequired));
            assert(saved.payload.templates.some(item => item.definitionId === 30 && item.section === "regular"));
            assert(saved.payload.templates.some(item => item.definitionId === 31 && item.section === "main"));
            for (const section of ["main", "regular"]) {
                const orders = saved.payload.templates.filter(item => item.section === section).map(item => item.sortOrder).sort((a, b) => a - b);
                assert.deepStrictEqual(orders, Array.from({ length: orders.length }, (_, index) => index));
            }
            assert.deepStrictEqual(await page.evaluate(() => window.__productValues), [{ definitionId: 2, value: "Сохранить тип" }, { definitionId: 30, value: "Сохранить значение" }]);
            assert.deepStrictEqual((await page.evaluate(() => window.__calls)).map(item => item.method), ["GET", "GET", "PUT"]);

            const definitions = [{ id: 101, code: "alpha", label: "Основа", dataType: "text", isActive: true },
                { id: 102, code: "product_type", label: "Тип продукта", dataType: "text", isActive: true }];
            const attributes = resolve({ definitions, templates: [
                { definitionId: 101, section: "main", sortOrder: 0 }, { definitionId: 102, section: "regular", sortOrder: 0 }
            ], values: [{ definitionId: 101, code: "alpha", label: "Основа", value: "Минеральная" },
                { definitionId: 102, code: "product_type", label: "Тип продукта", value: "Штукатурка" }] });
            const html = productPage(seoConfig({}), { product: { id: 1, external_id: "TEST", title: "Тестовый товар", brand: "Бренд", price: 100, unit: "шт" }, attributes, images: [] }).html;
            await page.setContent(html);
            await page.addStyleTag({ path: path.join(__dirname, "../../public/css/style.css") });
            assert.deepStrictEqual(await page.locator(".product-page-attribute-group h3").allTextContents(), ["Основные характеристики", "Характеристики"]);
            assert.deepStrictEqual(await page.locator("#productCharacteristics dt").allTextContents(), ["Основа", "Тип продукта"]);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Public page overflow at " + width);
            assert.strictEqual(await page.locator(".product-page-image-empty").count(), 1);
            const fallback = resolve({ definitions: MAIN_ATTRIBUTES.map((item, index) => Object.assign({}, item, { id: index + 1 })),
                values: [{ definitionId: 2, code: "product_type", value: "Штукатурка" }] });
            assert(fallback.find(item => item.code === "product_type").isMain);
            if (process.argv[2]) await page.screenshot({ path: path.join(process.argv[2], "attribute-order-public-" + width + ".png"), fullPage: true });
            await page.close();
        }
        assert.deepStrictEqual(errors, []);
        console.log("PASS Chromium 360/390/768/1024/1440: main/regular add-remove, template section CRUD/move/reorder, independent Save/Cancel, public grouping, no horizontal overflow");
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
