const { test, expect } = require("@playwright/test");

async function login(page, username = "e2e_admin", password = "E2eAdmin!234") {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await page.waitForFunction(() => typeof currentUser !== "undefined" && Boolean(currentUser));
}

async function openEmbeddedStructure(page) {
    await page.evaluate(() => { setActiveSection("catalog"); renderProductsView(); });
    await page.locator('[data-catalog-mode="structure"]').click();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
}

async function getOrder(page) {
    const response = await page.request.get("/api/products/structure/categories/order");
    expect(response.ok()).toBeTruthy();
    return response.json();
}

async function saveOrder(page, categoryIds, expectedVersion) {
    return page.request.patch("/api/products/structure/categories/order", {
        data: { categoryIds, expectedVersion }
    });
}

test("admin reorders all root categories from embedded modal", async ({ page }) => {
    await login(page);
    const initial = await getOrder(page);
    test.skip(initial.categories.length < 2, "Fixture requires two root categories");
    const originalIds = initial.categories.map(item => item.id);
    await openEmbeddedStructure(page);
    await page.locator(".structure-configure-order").click();
    await expect(page.locator(".category-order-row")).toHaveCount(originalIds.length);
    await expect(page.locator('.category-order-row:first-child [data-category-order-move="up"]')).toBeDisabled();
    await page.locator('.category-order-row:first-child [data-category-order-move="down"]').click();
    await expect(page.locator(".crm-modal-primary")).toBeEnabled();
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".crm-modal-overlay")).toHaveCount(0);

    const reordered = await getOrder(page);
    expect(reordered.categories.map(item => item.id)).toEqual([originalIds[1], originalIds[0], ...originalIds.slice(2)]);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-category").first()).toContainText(reordered.categories[0].name);

    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-category").first()).toContainText(reordered.categories[0].name);

    const restore = await saveOrder(page, originalIds, reordered.version);
    expect(restore.ok()).toBeTruthy();
});

test("manager can read structure but cannot reorder", async ({ page }) => {
    await login(page, "e2e_manager", "E2eManager!234");
    await openEmbeddedStructure(page);
    await expect(page.locator(".structure-configure-order")).toHaveCount(0);
    const response = await page.request.patch("/api/products/structure/categories/order", {
        data: { categoryIds: [1], expectedVersion: "x" }
    });
    expect(response.status()).toBe(403);
});

test("stale modal keeps local order and offers refresh", async ({ page }) => {
    await login(page);
    const initial = await getOrder(page);
    test.skip(initial.categories.length < 2, "Fixture requires two root categories");
    const originalIds = initial.categories.map(item => item.id);
    await openEmbeddedStructure(page);
    await page.locator(".structure-configure-order").click();
    await page.locator('.category-order-row:first-child [data-category-order-move="down"]').click();

    const external = await saveOrder(page, [originalIds[1], originalIds[0], ...originalIds.slice(2)], initial.version);
    expect(external.ok()).toBeTruthy();
    const externalPayload = await external.json();
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".category-order-feedback")).toContainText("Порядок категорий изменился");
    await expect(page.locator(".category-order-refresh")).toBeVisible();

    await page.locator(".crm-modal-secondary").click();
    const restore = await saveOrder(page, originalIds, externalPayload.version);
    expect(restore.ok()).toBeTruthy();
});

test("category reorder modal fits 320px and keeps arrow controls", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await login(page);
    await openEmbeddedStructure(page);
    await page.locator(".structure-configure-order").click();
    await expect(page.locator("[data-category-order-move='up']").first()).toBeVisible();
    await expect(page.locator("[data-category-order-move='down']").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
