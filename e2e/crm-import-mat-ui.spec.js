const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

test("MAT dependency panel fits a 375px viewport", async ({ page }) => {
    await login(page);
    await page.goto("/manager.html");
    await page.waitForFunction(() => Boolean(window.CrmImportUi));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.evaluate(() => {
        const plan = {
            valid: false,
            reassignments: [
                { productId: 478, productTitle: "Очень длинное название товара для проверки переноса текста на мобильном экране", oldMat: "MAT-000541", targetMat: "MAT-000542", dependencyGroupId: 0 },
                { productId: 901, productTitle: "Пробковый компенсатор", oldMat: "MAT-000900", targetMat: "MAT-000541", dependencyGroupId: 0 }
            ],
            dependencyGroups: [{ kind: "cycle_or_swap", identities: ["product:478", "product:901"], productIds: [478, 901] }],
            conflicts: [{ code: "TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT", mat: "MAT-000541", ownerProductId: 902 }]
        };
        const host = document.createElement("main");
        host.id = "matUiViewport";
        host.innerHTML = window.CrmImportUi.renderImportMatPlanPanel(plan);
        document.body.appendChild(host);
    });
    const panel = page.locator(".import-mat-plan-panel");
    await expect(panel).toBeVisible();
    expect(await panel.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(panel).toContainText("MAT-000541");
    await expect(panel).toContainText("MAT-000542");
    await expect(panel).toContainText("Этот MAT занят товаром");
    expect(await panel.locator(".import-mat-assignment strong").first().boundingBox()).not.toBeNull();
});
