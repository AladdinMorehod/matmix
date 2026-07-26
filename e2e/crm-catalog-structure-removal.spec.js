const { test, expect } = require("@playwright/test");

async function login(page, username = "e2e_admin", password = "E2eAdmin!234") {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await page.waitForFunction(() => typeof currentUser !== "undefined" && Boolean(currentUser));
}

test("standalone navigation and DOM are removed while embedded admin workflows remain", async ({ page }) => {
    await login(page);
    await expect(page.locator('.crm-nav [data-section="catalogStructure"]')).toHaveCount(0);
    await expect(page.locator('.crm-nav [data-section="catalog"]')).toBeVisible();
    await expect(page.locator("#catalogStructureView")).toHaveCount(0);

    await page.locator('.crm-nav [data-section="catalog"]').click();
    await expect(page.locator('[data-catalog-mode="products"]')).toBeVisible();
    await expect(page.locator('[data-catalog-mode="structure"]')).toBeVisible();
    await page.locator('[data-catalog-mode="structure"]').click();
    const embedded = page.locator("#catalogEmbeddedStructurePanel");
    await expect(embedded.locator(".structure-tree")).toBeVisible();
    await expect(embedded.locator(".structure-create-embedded-category")).toBeVisible();
    await expect(embedded.locator(".structure-create-embedded-subcategory")).toBeVisible();
    await expect(embedded.locator(".structure-configure-order")).toBeVisible();
    await expect(embedded.locator(".structure-move-subcategories")).toBeVisible();
    await expect(page.locator(".structure-create-category, .structure-move-selected, [data-readonly-category-order]")).toHaveCount(0);
});

test("legacy section value maps to one lazy-loaded embedded view", async ({ page }) => {
    await login(page);
    let auditRequests = 0;
    page.on("request", request => {
        if (new URL(request.url()).pathname === "/api/products/structure/audit") auditRequests += 1;
    });

    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect(page.locator("#productsView")).not.toHaveClass(/hidden/);
    await expect(page.locator('[data-catalog-mode="structure"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-tree")).toBeVisible();
    await expect.poll(() => auditRequests).toBe(1);
    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect.poll(() => auditRequests).toBe(1);
});

test("legacy mapping preserves manager read-only access", async ({ page }) => {
    await login(page, "e2e_manager", "E2eManager!234");
    await page.evaluate(() => setActiveSection("catalogStructure"));
    const embedded = page.locator("#catalogEmbeddedStructurePanel");
    await expect(embedded.locator(".structure-tree")).toBeVisible();
    await expect(embedded.locator(".structure-create-embedded-category")).toHaveCount(0);
    await expect(embedded.locator(".structure-configure-order")).toHaveCount(0);
});

test("unknown section falls back to dashboard", async ({ page }) => {
    await login(page);
    await page.evaluate(() => setActiveSection("removed-section"));
    await expect(page.locator("#dashboardView")).not.toHaveClass(/hidden/);
    await expect(page.locator('.crm-nav [data-section="dashboard"]')).toHaveClass(/active/);
});

test("embedded replacement fits 320px without standalone navigation", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await login(page);
    await page.evaluate(() => setActiveSection("catalogStructure"));
    await expect(page.locator('.crm-nav [data-section="catalogStructure"]')).toHaveCount(0);
    await expect(page.locator("#catalogEmbeddedStructurePanel .structure-toolbar")).toBeVisible();
    await expect(page.locator(".structure-create-embedded-category")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
