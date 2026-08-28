const { test, expect } = require("@playwright/test");
const ExcelJS = require("exceljs");

async function loginAsAdmin(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin");
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

async function openCrmSection(page, section) {
    const sectionButton = page.locator(`.crm-nav [data-section="${section}"]`);
    const menuToggle = page.locator("#crmMenuToggle");
    if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await expect(sectionButton).toBeInViewport();
    }
    await sectionButton.click();
}

test("CRM login, invalid login, session and logout", async ({ page }) => {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin"); await page.locator('input[name="password"], input[type="password"]').fill("wrong"); await page.locator('button[type="submit"]').click(); await expect(page.locator("body")).toContainText(/невер|ошиб/i);
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234"); await page.locator('button[type="submit"]').click(); await page.waitForURL(/manager/); await expect(page.locator("body")).toContainText(/MatMix|Заказ|Каталог/i);
    expect((await page.context().cookies()).find(cookie => cookie.name === "matmix.sid")?.httpOnly).toBeTruthy();
    const menuToggle = page.locator("#crmMenuToggle"); if (await menuToggle.isVisible()) await menuToggle.click();
    const logout = page.locator('button, a').filter({ hasText: /выйти/i }).first(); await logout.click(); await page.waitForURL(/login/); await page.goto("/manager"); await page.waitForURL(/login/);
});

test("public order API enforces consent and server price", async ({ request }) => {
    const products = await request.get("/api/public/products?limit=1"); expect(products.ok()).toBeTruthy(); const body = await products.json(); const product = (body.items || body.products || body.data || [])[0]; expect(product).toBeTruthy();
    const payload = { customerName: "E2E Test", phone: "+7 900 000-00-00", address: "E2E address", unloading: "Нет", paymentMethod: "При получении", items: [{ productId: product.id, qty: 1, price: 1 }] };
    const rejected = await request.post("/api/orders", { data: payload }); expect(rejected.status()).toBe(400); expect((await rejected.json()).code).toBe("CONSENT_REQUIRED");
    const accepted = await request.post("/api/orders", { data: { ...payload, consent: true } }); expect([201, 409]).toContain(accepted.status());
});

test("admin edits a product group and export uses the current value", async ({ page, request }) => {
    const unauthorizedProducts = await request.get("/api/products?limit=1");
    expect(unauthorizedProducts.status()).toBe(401);

    await loginAsAdmin(page);
    const productsResponse = await page.request.get("/api/products?limit=1");
    expect(productsResponse.ok()).toBeTruthy();
    const product = (await productsResponse.json()).products[0];
    expect(product).toBeTruthy();

    await openCrmSection(page, "catalog");
    const productRow = page.locator(".products-row", { hasText: product.title });
    await expect(productRow).toBeVisible();
    await productRow.getByRole("button", { name: "Редактировать" }).click();
    const modal = page.locator(".crm-modal");
    const groupInput = modal.locator('input[name="productGroup"]');
    await expect(groupInput).toHaveValue(product.productGroup);
    await expect(modal.locator("#product-group-options")).toHaveCount(1);
    await page.setViewportSize({ width: 320, height: 800 });
    const mobileLayout = await modal.evaluate(element => ({
        overflow: element.scrollWidth - element.clientWidth,
        inputOverflow: element.querySelector('input[name="productGroup"]').scrollWidth
            - element.querySelector('input[name="productGroup"]').clientWidth
    }));
    expect(mobileLayout.overflow).toBeLessThanOrEqual(1);
    expect(mobileLayout.inputOverflow).toBeLessThanOrEqual(1);
    await modal.getByRole("button", { name: "Закрыть окно" }).click();

    const updatePayload = {
        title: product.title,
        category: product.category,
        subcategory: product.subcategory,
        productGroup: "  Сухая смесь  ",
        price: product.price,
        weight: product.weight,
        unit: product.unit,
        description: product.description,
        isActive: product.isActive
    };
    const updateResponse = await page.request.patch(`/api/products/${product.id}`, { data: updatePayload });
    expect(updateResponse.ok()).toBeTruthy();
    const updatedProduct = (await updateResponse.json()).product;
    expect(updatedProduct.productGroup).toBe("Сухая смесь");
    expect(updatedProduct.category).toBe(product.category);
    expect(updatedProduct.subcategory).toBe(product.subcategory);

    const invalidType = await page.request.patch(`/api/products/${product.id}`, {
        data: { ...updatePayload, productGroup: { value: "invalid" } }
    });
    expect(invalidType.status()).toBe(400);
    expect(await invalidType.json()).toMatchObject({ success: false });

    const tooLong = await page.request.patch(`/api/products/${product.id}`, {
        data: { ...updatePayload, productGroup: "x".repeat(201) }
    });
    expect(tooLong.status()).toBe(400);

    const controlCharacter = await page.request.patch(`/api/products/${product.id}`, {
        data: { ...updatePayload, productGroup: "Сухая\nсмесь" }
    });
    expect(controlCharacter.status()).toBe(400);

    const exportResponse = await page.request.get("/api/products/import/export/excel");
    expect(exportResponse.ok()).toBeTruthy();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await exportResponse.body());
    const sheet = workbook.worksheets[0];
    const exportedRow = Array.from({ length: sheet.rowCount }, (_, index) => sheet.getRow(index + 1))
        .find(row => String(row.getCell(11).value || "").trim() === product.externalId);
    expect(exportedRow).toBeTruthy();
    expect(String(exportedRow.getCell(8).value || "").trim()).toBe("Сухая смесь");
    expect(String(exportedRow.getCell(8).value || "").trim()).not.toBe(product.productGroup);

    const emptyGroup = await page.request.patch(`/api/products/${product.id}`, {
        data: { ...updatePayload, productGroup: "   " }
    });
    expect(emptyGroup.ok()).toBeTruthy();
    expect((await emptyGroup.json()).product.productGroup).toBe("");
});

test("admin edits product content in readable tabs without mobile overflow", async ({ page }, testInfo) => {
    await loginAsAdmin(page);
    const productsResponse = await page.request.get("/api/products?limit=1");
    const sourceProduct = (await productsResponse.json()).products[0];
    expect(sourceProduct).toBeTruthy();
    const projectSuffix = testInfo.project.name.replace(/[^a-z0-9]+/g, "_");
    const createResponse = await page.request.post("/api/products", { data: {
        title: `E2E content ${projectSuffix}`, category: sourceProduct.category, subcategory: sourceProduct.subcategory,
        productGroup: sourceProduct.productGroup, price: 100, weight: 1, unit: "шт", description: "Старое описание E2E", isActive: true
    } });
    expect(createResponse.status()).toBe(201);
    const product = (await createResponse.json()).product;

    const code = `e2e_content_${product.id}_${projectSuffix}`;
    let definitionsResponse = await page.request.get("/api/products/attribute-definitions");
    let definition = (await definitionsResponse.json()).definitions.find(item => item.code === code);
    if (!definition) {
        const created = await page.request.post("/api/products/attribute-definitions", {
            data: { code, label: "E2E характеристика", dataType: "number", defaultUnit: "мм", defaultSection: "Проверка", sortOrder: 5, isActive: true }
        });
        expect(created.status()).toBe(201);
        definition = (await created.json()).definition;
    }

    await openCrmSection(page, "catalog");
    await page.locator("#productSearchInput").fill(product.title);
    await page.waitForResponse(response => response.url().includes("/api/products?") && response.ok());
    const productRow = page.locator(".products-row", { hasText: product.title });
    await productRow.getByRole("button", { name: "Редактировать" }).click();
    const modal = page.locator(".crm-modal");
    await expect(modal.getByRole("button", { name: "Основное" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Характеристики" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Описание" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "SEO" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Изображения" })).toBeVisible();
    for (const tabName of ["Основное", "Характеристики", "Описание", "SEO", "Изображения"]) {
        const tab = modal.getByRole("button", { name: tabName, exact: true });
        await tab.click();
        expect((await tab.boundingBox()).height).toBeGreaterThan(20);
    }
    await modal.getByRole("button", { name: "Основное", exact: true }).click();
    await expect(modal).toContainText("Обычный текст, до 500 символов.");
    await expect(modal).toContainText("Обычный текст, до 12 000 символов.");
    await expect(modal).toContainText("Описание (старое поле)");
    await expect(modal).toContainText("Старое поле сохранено для совместимости.");
    await expect(modal).toContainText("По умолчанию: короткое описание, либо старое описание.");
    await expect(modal).not.toContainText(/Plain text|Legacy description|Compatibility field|Fallback|Definitions|Выберите definition|SEO title|SEO description/);
    await expect(modal.locator('input[readonly][value^="MAT-"]')).toHaveCount(1);
    await modal.locator('input[name="brand"]').fill("E2E Brand");

    await modal.getByRole("button", { name: "Описание" }).click();
    await modal.locator('textarea[name="shortDescription"]').fill("Короткое E2E описание");
    await modal.locator('textarea[name="fullDescription"]').fill("Полное E2E описание без HTML-разметки");
    const modalScroll = modal.locator(".crm-modal-content");
    const tabsStyles = await modal.locator(".product-editor-tabs").evaluate(element => {
        const styles = getComputedStyle(element);
        return { position: styles.position, top: styles.top, minHeight: styles.minHeight, zIndex: styles.zIndex };
    });
    expect(tabsStyles).toEqual({ position: "sticky", top: "0px", minHeight: "39px", zIndex: "2" });
    await modalScroll.evaluate(element => { element.scrollTop = element.scrollHeight; });
    const tabLayout = await modal.locator(".product-editor-tabs button").evaluateAll(buttons => buttons.map(button => {
        const box = button.getBoundingClientRect();
        return { height: box.height, top: box.top, bottom: box.bottom };
    }));
    const scrollBox = await modalScroll.boundingBox();
    expect(tabLayout).toHaveLength(5);
    for (const tab of tabLayout) {
        expect(tab.height).toBeGreaterThan(20);
        expect(tab.bottom).toBeGreaterThan(scrollBox.y);
        expect(tab.top).toBeLessThan(scrollBox.y + scrollBox.height);
    }
    const lastDescriptionField = await modal.locator('textarea[name="description"]').locator("xpath=ancestor::label[1]").boundingBox();
    const actionsBox = await modal.locator(".crm-modal-actions").boundingBox();
    expect(actionsBox.y - (lastDescriptionField.y + lastDescriptionField.height)).toBeGreaterThanOrEqual(24);
    await expect(modal.getByRole("button", { name: "Отмена" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Сохранить" })).toBeVisible();
    const modalBox = await modal.boundingBox();
    expect(modalBox.y).toBeGreaterThanOrEqual(0);
    expect(modalBox.y + modalBox.height).toBeLessThanOrEqual(page.viewportSize().height);
    await modalScroll.evaluate(element => { element.scrollTop = 0; });
    await modal.getByRole("button", { name: "SEO" }).click();
    await modal.locator('input[name="seoTitle"]').fill("E2E SEO-заголовок");
    await expect(modal.locator("[data-seo-description-preview]")).toContainText("По умолчанию");

    await modal.getByRole("button", { name: "Характеристики" }).click();
    await expect(modal.getByRole("button", { name: "Справочник характеристик" })).toBeVisible();
    await expect(modal.locator("[data-add-attribute]")).toContainText("Выберите характеристику");
    await modal.getByRole("button", { name: "Справочник характеристик" }).click();
    const definitionsModal = page.locator(".crm-modal").last();
    await expect(definitionsModal.getByRole("heading", { name: "Справочник характеристик" })).toBeVisible();
    await expect(definitionsModal).toContainText("Характеристика");
    await expect(definitionsModal).toContainText("Тип данных");
    await expect(definitionsModal).toContainText("Единица по умолчанию");
    await expect(definitionsModal).toContainText("Раздел");
    await expect(definitionsModal).toContainText("Порядок");
    await expect(definitionsModal).not.toContainText(/Definitions|Definition|Data type|Default unit|Section|Sort/);
    await definitionsModal.getByRole("button", { name: "Отмена" }).click();
    await modal.locator("[data-add-attribute]").selectOption(String(definition.id));
    await modal.locator("[data-add-attribute-button]").click();
    await expect(modal).toContainText("Число");
    await modal.locator(`[name="attribute_${definition.id}"]`).fill("42.5");

    await page.setViewportSize({ width: 360, height: 800 });
    const overflow = await modal.evaluate(element => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await modal.locator(".crm-modal-primary").click();
    await expect(modal).toHaveCount(0);

    const contentResponse = await page.request.get(`/api/products/${product.id}/content`);
    expect(contentResponse.ok()).toBeTruthy();
    const content = (await contentResponse.json()).content;
    expect(content.product).toMatchObject({ brand: "E2E Brand", shortDescription: "Короткое E2E описание", fullDescription: "Полное E2E описание без HTML-разметки", seoTitle: "E2E SEO-заголовок" });
    expect(content.values.find(item => item.definitionId === definition.id)?.value).toBe(42.5);
});

test("CRM product edit cancel discards draft without writes", async ({ page, request }, testInfo) => {
    await loginAsAdmin(page);
    const productsResponse = await page.request.get("/api/products?limit=1");
    const source = (await productsResponse.json()).products[0];
    const suffix = `${testInfo.project.name.replace(/\W+/g, "_")}_${Date.now()}`;
    const created = await page.request.post("/api/products", { data: {
        title: `Cancel draft ${suffix}`, category: source.category, subcategory: source.subcategory,
        productGroup: source.productGroup, price: 111, weight: 2, unit: "шт", description: "Исходное", isActive: true
    } });
    expect(created.status()).toBe(201);
    const product = (await created.json()).product;
    await openCrmSection(page, "catalog");
    await page.locator("#productSearchInput").fill(product.title);
    await page.waitForResponse(response => response.url().includes("/api/products?") && response.ok());
    const row = page.locator(".products-row", { hasText: product.title });
    await row.getByRole("button", { name: "Редактировать" }).click();
    const modal = page.locator(".crm-modal");
    const mutations = [];
    const onRequest = requestEvent => {
        if (["POST", "PUT", "PATCH", "DELETE"].includes(requestEvent.method()) && /\/api\/products\//.test(requestEvent.url())) mutations.push(requestEvent.url());
    };
    page.on("request", onRequest);
    await modal.locator("input[name='title']").fill("Не должно сохраниться");
    await modal.locator("input[name='price']").fill("999");
    await modal.getByRole("button", { name: "Описание" }).click();
    await modal.locator("textarea[name='shortDescription']").fill("Черновик");
    await modal.getByRole("button", { name: "Отмена" }).click();
    page.off("request", onRequest);
    expect(mutations).toEqual([]);
    await row.getByRole("button", { name: "Редактировать" }).click();
    const reopened = page.locator(".crm-modal");
    await expect(reopened.locator("input[name='title']")).toHaveValue(product.title);
    await expect(reopened.locator("input[name='price']")).toHaveValue("111");
    await reopened.getByRole("button", { name: "Описание" }).click();
    await expect(reopened.locator("textarea[name='shortDescription']")).toHaveValue("");
    await reopened.getByRole("button", { name: "Отмена" }).click();
    await page.reload();
    await openCrmSection(page, "catalog");
    await page.locator("#productSearchInput").fill(product.title);
    await page.waitForResponse(response => response.url().includes("/api/products?") && response.ok());
    const persistedRow = page.locator(".products-row", { hasText: product.title });
    await expect(persistedRow).toContainText("111");
});

test("CRM shows and securely downloads file request attachments", async ({ page }) => {
    await loginAsAdmin(page);
    await openCrmSection(page, "orders");

    const fileOrder = page.locator("article.order-card", { hasText: "E2E-FILES" });
    const ordinaryOrder = page.locator("article.order-card", { hasText: "E2E-ORDINARY" });
    await expect(fileOrder).toBeVisible();
    await expect(fileOrder.locator(".order-request-type")).toContainText("Файловая заявка");
    await expect(fileOrder.locator(".order-request-type")).toContainText("Файлы: 3");
    await expect(ordinaryOrder.locator(".order-request-type")).toHaveCount(0);
    await fileOrder.locator(".order-card-header").click();

    await fileOrder.getByRole("button", { name: "Клиент" }).click();
    await expect(fileOrder).toContainText("files@example.test");
    await fileOrder.getByRole("button", { name: "Обзор" }).click();
    await expect(fileOrder).toContainText("Товары к заявке не добавлены");

    await page.route("**/api/orders/*/attachments", async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
    }, { times: 1 });
    await fileOrder.getByRole("button", { name: "Документы" }).click();
    await expect(fileOrder).toContainText("Загружаем документы");
    await expect(fileOrder).toContainText("Смета проекта.xlsx");
    await expect(fileOrder).toContainText("План помещения.pdf");
    await expect(fileOrder).toContainText("Комментарий.txt");
    expect(await fileOrder.textContent()).not.toMatch(/Ð|Ñ|Гђ|Г‘|Р Сџ/);
    await expect(fileOrder).toContainText("XLSX");
    await expect(fileOrder).toContainText("PDF");
    await expect(fileOrder).toContainText("TXT");
    await expect(fileOrder).not.toContainText("e2e-estimate.xlsx");
    await expect(fileOrder).not.toContainText("order-attachments");

    const attachmentButton = fileOrder.getByRole("button", { name: "Скачать файл Смета проекта.xlsx" });
    const orderId = await fileOrder.getAttribute("data-id");
    const attachmentId = await attachmentButton.getAttribute("data-attachment-id");
    const response = await page.request.get(`/api/orders/${orderId}/attachments/${attachmentId}/download`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-disposition"]).toContain("attachment;");
    expect(response.headers()["content-disposition"]).toContain("filename*=UTF-8''");
    expect((await response.body()).toString()).toBe("E2E estimate content");

    const txtButton = fileOrder.getByRole("button", { name: "Скачать файл Комментарий.txt" });
    const txtAttachmentId = await txtButton.getAttribute("data-attachment-id");
    const txtResponse = await page.request.get(`/api/orders/${orderId}/attachments/${txtAttachmentId}/download`);
    expect(txtResponse.ok()).toBeTruthy();
    expect(txtResponse.headers()["content-type"]).toBe("text/plain");
    expect(txtResponse.headers()["cache-control"]).toBe("private, no-store");
    expect(txtResponse.headers()["content-disposition"]).toContain(
        `filename*=UTF-8''${encodeURIComponent("Комментарий.txt")}`
    );
    expect(txtResponse.headers()["content-disposition"]).not.toMatch(/%25(?:D0|D1)/i);
    expect((await txtResponse.body()).toString("utf8")).toBe("E2E TXT русский текст\r\n");

    await page.route(`**/api/orders/${orderId}/attachments/${attachmentId}/download`, async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.fulfill({
            status: 410,
            contentType: "application/json",
            body: JSON.stringify({ success: false, message: "Файл больше недоступен." })
        });
    }, { times: 1 });
    await attachmentButton.click();
    await expect(attachmentButton).toHaveText("Скачиваем…");
    await expect(page.locator(".crm-toast-error")).toContainText("Файл больше недоступен.");
    await expect(attachmentButton).toBeEnabled();
    await expect(fileOrder.getByRole("button", { name: "Скачать файл План помещения.pdf" })).toBeEnabled();

    await ordinaryOrder.locator(".order-card-header").click();
    await ordinaryOrder.getByRole("button", { name: "Документы" }).click();
    await expect(ordinaryOrder).toContainText("Документов пока нет.");

    await page.setViewportSize({ width: 320, height: 900 });
    await fileOrder.getByRole("button", { name: "Документы" }).click();
    const geometry = await fileOrder.evaluate(element => {
        const cardRect = element.getBoundingClientRect();
        const rows = [...element.querySelectorAll(".order-attachment")].map(row => row.getBoundingClientRect());
        return {
            cardOverflow: element.scrollWidth - element.clientWidth,
            attachmentOverflow: rows.some(row => row.left < cardRect.left - 1 || row.right > cardRect.right + 1)
        };
    });
    expect(geometry.cardOverflow).toBeLessThanOrEqual(1);
    expect(geometry.attachmentOverflow).toBeFalsy();
    await expect(attachmentButton).toBeVisible();
});
