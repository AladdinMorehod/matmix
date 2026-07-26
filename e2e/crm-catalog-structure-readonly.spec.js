const { test, expect } = require("@playwright/test");

async function login(page, username, password) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

const auditPayload = {
    summary: {
        categories: 2,
        subcategories: 2,
        products: 3,
        productsWithoutStructure: 1,
        issues: 3,
        duplicateIssues: 0,
        inactiveItems: 0
    },
    categories: [
        {
            id: 10,
            type: "category",
            name: "Сухие смеси",
            code: "CAT-10",
            isActive: true,
            sortOrder: 1,
            productCount: 2,
            activeProductCount: 2,
            inactiveProductCount: 0,
            issues: [],
            subcategories: [
                {
                    id: 11,
                    type: "subcategory",
                    name: "Штукатурки",
                    code: "SUB-11",
                    parentId: 10,
                    parentName: "Сухие смеси",
                    isActive: true,
                    sortOrder: 1,
                    productCount: 2,
                    activeProductCount: 2,
                    inactiveProductCount: 0,
                    issues: [{ code: "EMPTY_SUBCATEGORY", severity: "info", message: "Тестовая диагностика" }]
                }
            ]
        },
        {
            id: 20,
            type: "category",
            name: "Пустая категория",
            isActive: true,
            sortOrder: 2,
            productCount: 0,
            issues: [{ code: "EMPTY_CATEGORY", severity: "info", message: "Нет товаров" }],
            subcategories: []
        }
    ],
    issues: [
        { code: "EMPTY_CATEGORY", severity: "info", itemType: "category", itemId: 20, itemName: "Пустая категория", message: "Нет товаров" },
        { code: "SUBCATEGORY_WITHOUT_PARENT", severity: "critical", itemType: "subcategory", itemId: 99, itemName: "Orphan SUB", message: "Нет родителя" },
        { code: "PRODUCTS_WITHOUT_STRUCTURE", severity: "warning", itemType: "catalog", count: 1, message: "Один товар без структуры" }
    ]
};

async function installApiMocks(page, counters) {
    await page.route("**/api/products/structure/audit/products?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            products: [{
                id: 1,
                title: "Тестовый товар",
                category: "Сухие смеси",
                subcategory: "Штукатурки",
                productGroup: "Группа",
                isActive: true
            }],
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
        })
    }));
    await page.route("**/api/products/structure/audit", async route => {
        counters.audit += 1;
        if (counters.failNext) {
            counters.failNext = false;
            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ success: false, message: "Тестовая ошибка" })
            });
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 80));
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: auditPayload })
        });
    });
}

async function openCatalogWithoutGlobalNavigation(page) {
    await page.waitForFunction(() => currentUser && activeSection === "dashboard");
    await page.evaluate(() => {
        setActiveSection("catalog");
        renderProductsView();
    });
}

test("catalog structure is lazy, cached and refreshable", async ({ page }) => {
    const counters = { audit: 0, failNext: false };
    await installApiMocks(page, counters);
    await login(page, "e2e_admin", "E2eAdmin!234");
    await openCatalogWithoutGlobalNavigation(page);

    await expect(page.locator('[data-catalog-mode="products"]')).toHaveAttribute("aria-selected", "true");
    expect(counters.audit).toBe(0);

    await page.locator('[data-catalog-mode="structure"]').click();
    await expect(page.locator("#catalogEmbeddedStructurePanel .crm-loader")).toBeVisible();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
    expect(counters.audit).toBe(1);

    await page.locator('[data-catalog-mode="products"]').click();
    await page.locator('[data-catalog-mode="structure"]').click();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
    expect(counters.audit).toBe(1);

    await page.locator("#catalogEmbeddedStructurePanel [data-readonly-refresh]").click();
    await expect.poll(() => counters.audit).toBe(2);
});

test("embedded structure renders diagnostics, details and no mutations", async ({ page }) => {
    const counters = { audit: 0, failNext: false };
    await installApiMocks(page, counters);
    await login(page, "e2e_admin", "E2eAdmin!234");
    await openCatalogWithoutGlobalNavigation(page);
    await page.locator('[data-catalog-mode="structure"]').click();

    const embedded = page.locator("#catalogEmbeddedStructurePanel");
    await expect(embedded.getByText("Orphan SUB")).toBeVisible();
    await expect(embedded.locator(".structure-issue")).toContainText(["Пустая категория"]);
    await expect(embedded.locator(".structure-create-category")).toHaveCount(0);
    await expect(embedded.locator(".structure-move-selected")).toHaveCount(0);
    await expect(embedded.locator("[data-readonly-category-order]")).toHaveCount(0);

    await embedded.locator("[data-readonly-search]").fill("Пустая");
    await expect(embedded.locator(".structure-toggle-button strong", { hasText: "Пустая категория" })).toBeVisible();
    await embedded.locator("[data-readonly-search]").fill("");
    await embedded.locator("[data-readonly-filter]").selectOption("withoutParent");
    await expect(embedded.getByText("Orphan SUB")).toBeVisible();
    await embedded.locator("[data-readonly-node-id='99']").click();
    await expect(embedded.locator(".structure-detail-panel")).toContainText("Orphan SUB");
    await expect(embedded.locator(".structure-product-row")).toContainText("Тестовый товар");

    await embedded.locator("[data-readonly-filter]").selectOption("withoutStructure");
    await embedded.locator("[data-readonly-node-type='withoutStructure']").click();
    await expect(embedded.locator(".structure-detail-panel")).toContainText("Товары без структуры");

    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-create-embedded-category")).toBeVisible();
    await expect(page.locator("#catalogStructureView")).toHaveCount(0);
});

test("manager sees read-only embedded mode through legacy section mapping", async ({ page }) => {
    const counters = { audit: 0, failNext: false };
    await installApiMocks(page, counters);
    await login(page, "e2e_manager", "E2eManager!234");
    await openCatalogWithoutGlobalNavigation(page);
    await expect(page.locator('[data-catalog-mode="structure"]')).toBeVisible();
    await page.locator('[data-catalog-mode="structure"]').click();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-create-category")).toHaveCount(0);

    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-create-embedded-category")).toHaveCount(0);
});

test("embedded error retries and mobile layout stays within 320px", async ({ page }) => {
    const counters = { audit: 0, failNext: true };
    await page.setViewportSize({ width: 320, height: 800 });
    await installApiMocks(page, counters);
    await login(page, "e2e_admin", "E2eAdmin!234");
    await openCatalogWithoutGlobalNavigation(page);
    await page.locator('[data-catalog-mode="structure"]').click();

    const embedded = page.locator("#catalogEmbeddedStructurePanel");
    await expect(embedded.locator(".crm-inline-error")).toBeVisible();
    await embedded.locator("[data-readonly-retry]").click();
    await expect(embedded.locator(".structure-tree")).toBeVisible();
    await embedded.locator("[data-readonly-node-id='10']").click();
    await expect(embedded.locator(".structure-detail-panel")).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(counters.audit).toBe(2);
});
