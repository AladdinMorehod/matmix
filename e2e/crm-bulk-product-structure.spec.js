const { test, expect } = require("@playwright/test");
const ExcelJS = require("exceljs");

async function login(page, loginName, password) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(loginName);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

async function getProducts(request) {
    const response = await request.get("/api/products?limit=100");
    expect(response.ok()).toBeTruthy();
    return (await response.json()).products;
}

test("bulk structure endpoint validates access and request shape", async ({ page, request, browser }) => {
    const unauthorized = await request.patch("/api/products/bulk/structure", {
        data: { productIds: [1], changes: { productGroup: "Новая" } }
    });
    expect(unauthorized.status()).toBe(401);

    const managerPage = await browser.newPage();
    await login(managerPage, "e2e_manager", "E2eManager!234");
    const managerResponse = await managerPage.request.patch("/api/products/bulk/structure", {
        data: { productIds: [1], changes: { productGroup: "Новая" } }
    });
    expect(managerResponse.status()).toBe(403);
    await managerPage.close();

    await login(page, "e2e_admin", "E2eAdmin!234");
    const products = await getProducts(page.request);
    const productId = products[0].id;
    const invalidRequests = [
        {},
        { productIds: "1", changes: { productGroup: "Новая" } },
        { productIds: [], changes: { productGroup: "Новая" } },
        { productIds: [0], changes: { productGroup: "Новая" } },
        { productIds: Array.from({ length: 501 }, (_, index) => index + 1), changes: { productGroup: "Новая" } },
        { productIds: [productId] },
        { productIds: [productId], changes: {} },
        { productIds: [productId], changes: { price: 10 } },
        { productIds: [productId], changes: { productGroup: 10 } },
        { productIds: [productId], changes: { productGroup: "x".repeat(201) } },
        { productIds: [productId], changes: { productGroup: "Группа\nтоваров" } },
        { productIds: [productId], changes: { productGroup: "   " } }
    ];
    for (const data of invalidRequests) {
        const response = await page.request.patch("/api/products/bulk/structure", { data });
        expect(response.status()).toBe(400);
    }

    const duplicateIds = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: [productId, productId], changes: { productGroup: "Без дублей" } }
    });
    expect(duplicateIds.ok()).toBeTruthy();
    expect(await duplicateIds.json()).toMatchObject({
        requestedCount: 1,
        updatedCount: 1,
        updatedProductIds: [productId]
    });

    const clearGroup = await page.request.patch("/api/products/bulk/structure", {
        data: {
            productIds: [productId],
            changes: { product_group: " " },
            allowClearProductGroup: true
        }
    });
    expect(clearGroup.ok()).toBeTruthy();
    expect((await clearGroup.json()).appliedChanges.productGroup).toBe("");
});

test("bulk structure endpoint is atomic, partial and reflected in XLSX", async ({ page }) => {
    await login(page, "e2e_admin", "E2eAdmin!234");
    const initialProducts = await getProducts(page.request);
    expect(initialProducts.length).toBeGreaterThanOrEqual(3);
    const selected = ["MAT-000001", "MAT-000002"]
        .map(externalId => initialProducts.find(product => product.externalId === externalId));
    const unselected = initialProducts.find(product => product.externalId === "MAT-000003");
    expect(selected.every(Boolean)).toBeTruthy();
    expect(unselected).toBeTruthy();
    const selectedIds = selected.map(product => product.id);

    const missingProduct = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: [selectedIds[0], 999999], changes: { productGroup: "Не применять" } }
    });
    expect(missingProduct.status()).toBe(404);
    expect(await missingProduct.json()).toMatchObject({
        details: { missingProductIds: [999999], requestedCount: 2 }
    });
    let currentProducts = await getProducts(page.request);
    expect(currentProducts.find(product => product.id === selectedIds[0]).productGroup)
        .toBe(initialProducts.find(product => product.id === selectedIds[0]).productGroup);

    const incompatibleCategory = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: selectedIds, changes: { category: "Другие материалы" } }
    });
    expect(incompatibleCategory.status()).toBe(400);

    const incompatibleSubcategory = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: selectedIds, changes: { subcategory: "Клеи" } }
    });
    expect(incompatibleSubcategory.status()).toBe(400);

    const beforeRollback = await getProducts(page.request);
    const forcedFailure = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: selectedIds, changes: { productGroup: "__E2E_FORCE_ROLLBACK__" } }
    });
    expect(forcedFailure.status()).toBe(500);
    currentProducts = await getProducts(page.request);
    for (const productId of selectedIds) {
        expect(currentProducts.find(product => product.id === productId).productGroup)
            .toBe(beforeRollback.find(product => product.id === productId).productGroup);
    }

    const previousUpdatedAt = new Map(currentProducts.map(product => [product.id, product.updatedAt]));
    await new Promise(resolve => setTimeout(resolve, 10));
    const groupOnly = await page.request.patch("/api/products/bulk/structure", {
        data: { productIds: selectedIds, changes: { productGroup: "  Массовая группа  " } }
    });
    expect(groupOnly.ok()).toBeTruthy();
    expect(await groupOnly.json()).toMatchObject({
        requestedCount: 2,
        updatedCount: 2,
        updatedProductIds: selectedIds,
        appliedChanges: { productGroup: "Массовая группа" }
    });

    currentProducts = await getProducts(page.request);
    for (const productId of selectedIds) {
        const product = currentProducts.find(item => item.id === productId);
        expect(product.productGroup).toBe("Массовая группа");
        expect(product.category).toBe("Сухие смеси");
        expect(product.subcategory).toBe("Штукатурки");
        expect(product.updatedAt).not.toBe(previousUpdatedAt.get(productId));
    }
    expect(currentProducts.find(product => product.id === unselected.id).productGroup).toBe(unselected.productGroup);

    const categoryAndSubcategory = await page.request.patch("/api/products/bulk/structure", {
        data: {
            productIds: selectedIds,
            changes: { category: "Другие материалы", subcategory: "Клеи" }
        }
    });
    expect(categoryAndSubcategory.ok()).toBeTruthy();
    currentProducts = await getProducts(page.request);
    for (const productId of selectedIds) {
        const product = currentProducts.find(item => item.id === productId);
        expect(product.category).toBe("Другие материалы");
        expect(product.subcategory).toBe("Клеи");
        expect(product.productGroup).toBe("Массовая группа");
    }

    const allFields = await page.request.patch("/api/products/bulk/structure", {
        data: {
            productIds: selectedIds,
            changes: {
                category: "Сухие смеси",
                subcategory: "Штукатурки",
                productGroup: "Экспортная группа"
            }
        }
    });
    expect(allFields.ok()).toBeTruthy();

    const exportResponse = await page.request.get("/api/products/import/export/excel");
    expect(exportResponse.ok()).toBeTruthy();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await exportResponse.body());
    const sheet = workbook.worksheets[0];
    const exportedGroups = new Map(
        Array.from({ length: sheet.rowCount }, (_, index) => sheet.getRow(index + 1))
            .map(row => [
                String(row.getCell(11).value || "").trim(),
                String(row.getCell(8).value || "").trim()
            ])
    );
    for (const product of selected) {
        expect(exportedGroups.get(product.externalId)).toBe("Экспортная группа");
    }
    expect(exportedGroups.get(unselected.externalId)).toBe(unselected.productGroup);
});

test("bulk structure controls preserve selection on error and clear it on success", async ({ page, browser }) => {
    const managerPage = await browser.newPage();
    await login(managerPage, "e2e_manager", "E2eManager!234");
    await managerPage.locator('.crm-nav [data-section="catalog"]').click();
    await expect(managerPage.locator(".product-select")).toHaveCount(0);
    await expect(managerPage.locator(".products-bulk-structure-edit")).toHaveCount(0);
    await managerPage.close();

    await login(page, "e2e_admin", "E2eAdmin!234");
    await page.locator('.crm-nav [data-section="catalog"]').click();
    const firstCheckbox = page.locator(".product-select").first();
    await expect(firstCheckbox).toBeVisible();
    await expect(page.locator(".products-bulk-structure-edit")).toBeHidden();
    await firstCheckbox.check();
    await expect(page.locator("[data-products-selected-count]")).toContainText("1");
    const bulkButton = page.locator(".products-bulk-structure-edit");
    await expect(bulkButton).toBeVisible();
    await bulkButton.click();

    const modal = page.locator(".crm-modal");
    await expect(modal).toBeVisible();
    await modal.locator('input[name="changeProductGroup"]').check();
    await modal.locator('input[name="productGroup"]').fill("UI массовая группа");
    await modal.locator('button[type="submit"]').click();
    await expect(modal.locator(".bulk-structure-confirmation")).toContainText("Будут изменены 1 товаров");

    let requestCount = 0;
    let capturedBody = null;
    await page.route("**/api/products/bulk/structure", async route => {
        requestCount += 1;
        capturedBody = route.request().postDataJSON();
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ success: false, message: "Тестовая ошибка backend" })
        });
    }, { times: 1 });
    const submit = modal.locator('button[type="submit"]');
    await submit.dblclick();
    await expect(modal).toBeVisible();
    await expect(submit).toBeEnabled();
    expect(requestCount).toBe(1);
    expect(capturedBody).toEqual({
        productIds: [Number(await firstCheckbox.getAttribute("data-product-id"))],
        changes: { productGroup: "UI массовая группа" }
    });
    await expect(firstCheckbox).toBeChecked();
    await expect(modal.locator('input[name="productGroup"]')).toHaveValue("UI массовая группа");

    await submit.click();
    await expect(modal).toHaveCount(0);
    await expect(page.locator("[data-products-selected-count]")).toContainText("0");
    await expect(page.locator(".products-bulk-structure-edit")).toBeHidden();

    await firstCheckbox.check();
    await expect(bulkButton).toBeVisible();
    await page.locator("#productSearchInput").fill("нет такого товара");
    await expect(page.locator("[data-products-selected-count]")).toContainText("0");

    await page.locator("#productSearchInput").fill("");
    await expect(page.locator(".product-select").first()).toBeVisible();
    await page.setViewportSize({ width: 320, height: 800 });
    const visibleCheckbox = page.locator(".product-select").first();
    await visibleCheckbox.check();
    await page.locator(".products-bulk-structure-edit").click();
    const mobileModal = page.locator(".crm-modal");
    const overflow = await mobileModal.evaluate(element => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await mobileModal.getByRole("button", { name: "Закрыть окно" }).click();
});
