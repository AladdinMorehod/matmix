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

test("admin creates category and subcategory from embedded toolbar", async ({ page }, testInfo) => {
    await login(page);
    await openEmbedded(page);
    const categoryName = `E2E Созданная категория ${testInfo.project.name}`;
    const subcategoryName = `E2E Созданная подкатегория ${testInfo.project.name}`;

    await page.locator(".structure-create-embedded-category").click();
    await page.locator('.crm-modal-form input[name="name"]').fill(categoryName);
    await page.locator('.crm-modal-form select[name="position"]').selectOption("start");
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".crm-modal-overlay")).toHaveCount(0);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-category").first()).toContainText(categoryName);

    const order = await (await page.request.get("/api/products/structure/categories/order")).json();
    expect(order.categories[0].name).toBe(categoryName);
    const category = order.categories[0];

    await page.locator(".structure-create-embedded-subcategory").click();
    await page.locator('.crm-modal-form select[name="parentId"]').selectOption(String(category.id));
    await page.locator('.crm-modal-form input[name="name"]').fill(subcategoryName);
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".crm-modal-overlay")).toHaveCount(0);
    const createdCategoryRow = page
      .locator("#catalogEmbeddedStructurePanel .structure-category")
      .filter({ hasText: categoryName });
    await createdCategoryRow.locator("[data-readonly-toggle]").click();
    await expect(createdCategoryRow).toContainText(subcategoryName);

    const context = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    const subcategory = context.subcategories.find(item => item.name === subcategoryName);
    expect(subcategory.parentId).toBe(category.id);
    expect(subcategory.productCount).toBe(0);

    await page.evaluate(async () => {
        setActiveSection("catalogStructure");
        await loadCatalogStructureAudit({ force: true });
    });
    await expect(page.locator("#catalogStructureView .structure-tree")).toContainText(categoryName);
});

test("embedded create validation keeps modal open", async ({ page }) => {
    await login(page);
    await openEmbedded(page);
    const existing = await (await page.request.get("/api/products/structure/categories/order")).json();
    await page.locator(".structure-create-embedded-category").click();
    await page.locator('.crm-modal-form input[name="name"]').fill(existing.categories[0].name);
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".structure-create-error")).toBeVisible();
    await expect(page.locator(".crm-modal-overlay")).toHaveCount(1);
    await page.locator(".crm-modal-secondary").click();

    const context = await (await page.request.get("/api/products/structure/subcategories/move-context")).json();
    const parent = context.categories.find(category => context.subcategories.some(item => item.parentId === category.id));
    const duplicate = context.subcategories.find(item => item.parentId === parent.id);
    await page.evaluate(() => { setActiveSection("catalog"); renderProductsView(); });
    await page.locator('[data-catalog-mode="structure"]').click();
    await page.locator(".structure-create-embedded-subcategory").click();
    await page.locator('[name="parentId"]').selectOption(String(parent.id));
    await page.locator('input[name="name"]').fill(duplicate.name);
    await page.locator(".crm-modal-primary").click();
    await expect(page.locator(".structure-create-error")).toBeVisible();
});

test("product form structure creation remains available without saving product", async ({ page }, testInfo) => {
    await login(page);
    await page.evaluate(() => { setActiveSection("catalog"); catalogInnerMode = "products"; renderProductsView(); });
    await page.locator(".products-add").click();
    const productForm = page.locator(".crm-modal-overlay").last();
    const categoryName = `E2E Product Form Category ${testInfo.project.name}`;
    const subcategoryName = `E2E Product Form Subcategory ${testInfo.project.name}`;

    await productForm.locator('[data-structure-action="category"]').click();
    const categoryModal = page.locator(".crm-modal-overlay").last();
    await categoryModal.locator('input[name="name"]').fill(categoryName);
    await categoryModal.locator(".crm-modal-primary").click();
    await expect(productForm.locator('select[name="category"]')).toHaveValue(categoryName);

    await productForm.locator('[data-structure-action="subcategory"]').click();
    const subcategoryModal = page.locator(".crm-modal-overlay").last();
    await subcategoryModal.locator('input[name="name"]').fill(subcategoryName);
    await subcategoryModal.locator(".crm-modal-primary").click();
    await expect(productForm.locator('select[name="subcategory"]')).toHaveValue(subcategoryName);
    await productForm.locator(".crm-modal-secondary").click();

    await openEmbedded(page);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toContainText(categoryName);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toContainText(subcategoryName);
});

test("manager cannot create catalog structure", async ({ page }) => {
    await login(page, "e2e_manager", "E2eManager!234");
    await openEmbedded(page);
    await expect(page.locator(".structure-create-embedded-category")).toHaveCount(0);
    await expect(page.locator(".structure-create-embedded-subcategory")).toHaveCount(0);
    expect((await page.request.post("/api/products/structure/categories", { data: { name: "Forbidden" } })).status()).toBe(403);
    expect((await page.request.post("/api/products/structure/subcategories", {
        data: { categoryId: 1, name: "Forbidden" }
    })).status()).toBe(403);
});

test("create toolbar and modals fit 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await login(page);
    await openEmbedded(page);
    await expect(page.locator(".structure-create-embedded-category")).toBeVisible();
    await expect(page.locator(".structure-create-embedded-subcategory")).toBeVisible();
    await page.locator(".structure-create-embedded-category").click();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('select[name="position"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
