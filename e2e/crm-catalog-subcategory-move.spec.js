const { test, expect } = require("@playwright/test");

async function login(page, username = "e2e_admin", password = "E2eAdmin!234") {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await page.waitForFunction(() => typeof currentUser !== "undefined" && Boolean(currentUser));
}

async function openEmbedded(page) {
    await page.evaluate(() => { setActiveSection("catalog"); renderProductsView(); });
    await page.locator('[data-catalog-mode="structure"]').click();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
}

async function openMoveModal(page) {
    await openEmbedded(page);
    await page.locator(".structure-move-subcategories").click();
    await expect(page.locator(".subcategory-move-selection")).toBeVisible();
}

test("admin previews and moves a subcategory from embedded structure", async ({ page }) => {
    await login(page);
    const context = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    test.skip(context.subcategories.length < 1 || context.categories.length < 2, "Fixture requires movable structure");
    const item = context.subcategories[0];
    const target = context.categories.find(category => category.id !== item.parentId);
    await openMoveModal(page);
    await page.locator(`input[name="subcategoryIds"][value="${item.id}"]`).check();
    await page.locator('[name="targetCategoryId"]').selectOption(String(target.id));
    await page.locator(".subcategory-move-preview").click();
    await expect(page.locator(".subcategory-move-summary")).toBeVisible();
    await expect(page.locator(".crm-modal-primary")).toBeEnabled();
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".crm-modal-overlay")).toHaveCount(0);

    const after = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    expect(after.subcategories.find(candidate => candidate.id === item.id).parentId).toBe(target.id);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toContainText(item.name);
    await page.evaluate(async () => {
        setActiveSection("catalogStructure");
        await loadCatalogStructureAudit({ force: true });
    });
    await expect(page.locator("#catalogStructureView .structure-tree")).toContainText(item.name);
    const restoreContext = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    const restore = await page.request.post("/api/products/structure/subcategories/move", {
        data: { subcategoryIds: [item.id], targetCategoryId: item.parentId, expectedVersion: restoreContext.version }
    });
    expect(restore.ok()).toBeTruthy();
});

test("preview conflict disables apply", async ({ page }) => {
    await login(page);
    const context = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    const item = context.subcategories[0];
    await openMoveModal(page);
    await page.locator(`input[name="subcategoryIds"][value="${item.id}"]`).check();
    await page.locator('[name="targetCategoryId"]').selectOption(String(item.parentId));
    await page.locator(".subcategory-move-preview").click();
    await expect(page.locator(".subcategory-move-conflict")).toBeVisible();
    await expect(page.locator(".crm-modal-primary")).toBeDisabled();
});

test("stale preview is rejected and offers refresh", async ({ page }) => {
    await login(page);
    const context = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    test.skip(context.categories.length < 2, "Fixture requires two categories");
    const item = context.subcategories[0];
    const target = context.categories.find(category => category.id !== item.parentId);
    const previewResponse = await page.request.post("/api/products/structure/subcategories/move-preview", {
        data: { subcategoryIds: [item.id], targetCategoryId: target.id, expectedVersion: context.version }
    });
    expect(previewResponse.ok()).toBeTruthy();
    const order = await (await page.request.get("/api/products/structure/categories/order")).json();
    const changed = await page.request.patch("/api/products/structure/categories/order", {
        data: { categoryIds: [...order.categories.map(category => category.id)].reverse(), expectedVersion: order.version }
    });
    expect(changed.ok()).toBeTruthy();
    const stale = await page.request.post("/api/products/structure/subcategories/move", {
        data: { subcategoryIds: [item.id], targetCategoryId: target.id, expectedVersion: context.version }
    });
    expect(stale.status()).toBe(409);
    const changedPayload = await changed.json();
    const restore = await page.request.patch("/api/products/structure/categories/order", {
        data: { categoryIds: order.categories.map(category => category.id), expectedVersion: changedPayload.version }
    });
    expect(restore.ok()).toBeTruthy();
});

test("manager cannot access subcategory move", async ({ page }) => {
    await login(page, "e2e_manager", "E2eManager!234");
    await openEmbedded(page);
    await expect(page.locator(".structure-move-subcategories")).toHaveCount(0);
    expect((await page.request.get("/api/products/structure/subcategories/move-context")).status()).toBe(403);
    expect((await page.request.post("/api/products/structure/subcategories/move-preview", { data: {} })).status()).toBe(403);
    expect((await page.request.post("/api/products/structure/subcategories/move", { data: {} })).status()).toBe(403);
});

test("subcategory move modal fits 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await login(page);
    await openMoveModal(page);
    await expect(page.locator('input[name="subcategoryIds"]').first()).toBeVisible();
    await expect(page.locator('[name="targetCategoryId"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
