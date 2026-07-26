const { test, expect } = require("@playwright/test");

async function login(page, username = "e2e_manager", password = "E2eManager!234") {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

const audit = {
    summary: { categories: 1, subcategories: 1, products: 3, productsWithoutStructure: 1, issues: 1 },
    categories: [{
        id: 10, type: "category", name: "Сухие смеси", isActive: true, productCount: 2,
        activeProductCount: 2, inactiveProductCount: 0, issues: [],
        subcategories: [{
            id: 11, type: "subcategory", name: "Штукатурки", parentId: 10,
            parentName: "Сухие смеси", isActive: true, productCount: 2,
            activeProductCount: 2, inactiveProductCount: 0, issues: []
        }]
    }],
    issues: [{
        code: "PRODUCTS_WITHOUT_STRUCTURE", severity: "warning", itemType: "catalog",
        count: 1, message: "Один товар без структуры"
    }]
};

test("embedded structure navigates to canonical product filters and resets them", async ({ page }) => {
    await login(page);
    const productRequests = [];
    await page.route("**/api/products/structure/audit/products?**", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, products: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 } })
    }));
    await page.route("**/api/products/structure/audit", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: audit })
    }));
    await page.route("**/api/products?**", route => {
        const url = new URL(route.request().url());
        productRequests.push(url.search);
        const title = url.searchParams.has("structureMode") ? "Без структуры" : "Структурный товар";
        return route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                products: [{ id: 501, title, isActive: true, category: "Сухие смеси", subcategory: "Штукатурки" }],
                categories: ["Сухие смеси"],
                pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
            })
        });
    });

    await page.waitForFunction(() => typeof currentUser !== "undefined" && Boolean(currentUser));
    await page.evaluate(() => { setActiveSection("catalog"); renderProductsView(); });
    await page.locator('[data-catalog-mode="structure"]').click();
    await page.locator('[data-readonly-node-type="category"]').first().click();
    await page.locator("[data-readonly-show-products]").click();
    await expect(page.locator(".product-structure-filter-chip")).toContainText("Сухие смеси");
    await expect(page.locator("article.products-row")).toContainText("Структурный товар");
    expect(productRequests.at(-1)).toContain("structureNodeId=10");

    await page.locator("[data-product-structure-filter-reset]").click();
    expect(productRequests.at(-1)).not.toContain("structureNodeId");

    await page.locator('[data-catalog-mode="structure"]').click();
    await page.locator('[data-readonly-node-type="subcategory"]').first().click();
    await page.locator("[data-readonly-show-products]").click();
    await expect(page.locator(".product-structure-filter-chip")).toContainText("Сухие смеси → Штукатурки");
    expect(productRequests.at(-1)).toContain("structureNodeId=11");

    await page.locator('[data-catalog-mode="structure"]').click();
    await page.locator('[data-readonly-summary-filter="withoutStructure"]').click();
    await page.locator('[data-readonly-node-type="withoutStructure"]').click();
    await page.locator("[data-readonly-show-products]").click();
    await expect(page.locator(".product-structure-filter-chip")).toContainText("Товары без структуры");
    expect(productRequests.at(-1)).toContain("structureMode=withoutStructure");

    await page.setViewportSize({ width: 320, height: 720 });
    await expect(page.locator("[data-product-structure-filter-reset]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("structure filters enforce access, node validation and matching totals", async ({ page, request }) => {
    expect((await request.get("/api/products?structureMode=withoutStructure")).status()).toBe(401);
    await login(page);
    const auditResponse = await page.request.get("/api/products/structure/audit");
    expect(auditResponse.ok()).toBeTruthy();
    const auditData = (await auditResponse.json()).data;
    const category = auditData.categories.find(item => item.isActive && !item.isSystem && !item.parentId);
    const subcategory = category?.subcategories?.find(item => item.isActive && !item.isSystem);
    expect(category).toBeTruthy();
    expect(subcategory).toBeTruthy();

    const categoryResponse = await page.request.get(`/api/products?structureNodeId=${category.id}&limit=1`);
    const subcategoryResponse = await page.request.get(`/api/products?structureNodeId=${subcategory.id}&limit=1`);
    const withoutResponse = await page.request.get("/api/products?structureMode=withoutStructure&limit=1");
    expect((await categoryResponse.json()).pagination.total).toBe(category.productCount);
    expect((await subcategoryResponse.json()).pagination.total).toBe(subcategory.productCount);
    expect((await withoutResponse.json()).pagination.total).toBe(auditData.summary.productsWithoutStructure);
    expect((await page.request.get("/api/products?structureNodeId=999999")).status()).toBe(404);
});
