const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

test("manual product search finds MAT owner for a changed package row", async ({ page }) => {
    await login(page);
    const seedResponse = await page.request.get("/api/products?limit=1&status=active&deleted=false");
    const seedBody = await seedResponse.json();
    const seedProduct = (seedBody.products || seedBody.items || [])[0];
    expect(seedProduct).toBeTruthy();
    const titleTerm = String(seedProduct.title || "").trim().split(/\s+/)[0];
    const byTitle = await page.request.get(`/api/products?search=${encodeURIComponent(titleTerm)}&status=active&deleted=false&limit=20`);
    expect(byTitle.ok()).toBeTruthy();
    const titleBody = await byTitle.json();
    expect((titleBody.products || titleBody.items || []).some(product => Number(product.id) === Number(seedProduct.id))).toBe(true);

    const byMat = await page.request.get(`/api/products?search=${encodeURIComponent(seedProduct.externalId)}&status=active&deleted=false&limit=20`);
    expect(byMat.ok()).toBeTruthy();
    const matBody = await byMat.json();
    expect((matBody.products || matBody.items || []).some(product => Number(product.id) === Number(seedProduct.id))).toBe(true);
});

test("manual product search control stays usable at 375px", async ({ page }) => {
    await login(page);
    await page.goto("/manager.html");
    await page.waitForFunction(() => Boolean(window.CrmImportUi));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => {
        const host = document.createElement("main");
        host.id = "manualSearchFixture";
        host.innerHTML = window.CrmImportUi.renderManualProductSearch({
            rowNumber: 264,
            rowId: "264:MAT-000256:cat:sub",
            externalId: "MAT-000256",
            reason: "MAT_CODE_NOT_FOUND"
        });
        document.body.appendChild(host);
    });
    const panel = page.locator("#manualSearchFixture .import-manual-product-search");
    await expect(panel).toBeVisible();
    await expect(panel.locator("input[data-import-manual-product-query]")).toHaveAttribute("aria-label", "Поиск товара CRM");
    expect(await panel.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(panel).toContainText("Найти другой товар CRM");
});
