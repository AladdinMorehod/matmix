const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "mobile", width: 375, height: 812 }]) {
    test(`authoritative delete confirmation ${viewport.name}`, async ({ page }) => {
        await login(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto("/manager.html");
        await page.waitForFunction(() => Boolean(window.CrmImportUi));
        await page.evaluate(() => {
            const host = document.createElement("section");
            host.id = "delete-contract-fixture";
            host.innerHTML = window.CrmImportUi.buildImportApplyConfirmation({
                summary: { missingFromFile: 2, new: 0, updated: 0, requiresReview: 0 },
                matPlan: { reassignments: [] }
            });
            document.body.appendChild(host);
        });
        const fixture = page.locator("#delete-contract-fixture");
        await expect(fixture).toContainText("Удалить из каталога");
        await expect(fixture.locator('option[value="delete"]')).toHaveText("Удалить из каталога");
        await expect(fixture.locator(".import-destructive-warning")).toContainText("сайта");
        await expect(fixture.locator(".import-destructive-warning")).toContainText("выгружаемого Excel");
        expect(await fixture.evaluate(node => node.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
}
