const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await expect(page.locator("#managerUserName")).toHaveText("E2E Admin");
}

function linkedOrder() {
    return {
        id: 901,
        orderNumber: "PUSH-DEEPLINK-901",
        customerName: "Push deep link",
        phone: "+7 900 111-22-33",
        requestType: "order",
        attachmentCount: 0,
        items: [],
        totalPrice: 0,
        totalWeight: 0,
        status: "Новая",
        isNotificationRead: false,
        managerId: null,
        managerName: "",
        createdAt: "2026-08-20T08:30:00.000Z",
        consent: {}
    };
}

async function mockCrmApis(page, order) {
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 0 })
    }));
    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
            stats: { total: 0, new: 0, work: 0 }
        })
    }));
    await page.route("**/api/orders/901", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, order })
    }));
    await page.route("**/api/orders/901/read", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: 901, unreadCount: 0 })
    }));
}

test("manager order deep link opens the requested order without trusting arbitrary hashes", async ({ page }) => {
    await mockCrmApis(page, linkedOrder());
    await login(page);
    await page.goto("/manager#order-901");
    await expect(page.locator('.order-card[data-id="901"]')).toHaveClass(/expanded/);
    await expect(page.locator('.order-card[data-id="901"] .order-title strong')).toContainText("PUSH-DEEPLINK-901");
    await page.goto("/manager#javascript:alert(1)");
    await expect(page.locator('.order-card[data-id="901"]')).toHaveCount(0);
    expect(new URL(page.url()).hash).toBe("#javascript:alert(1)");
});

test("push settings expose a disabled state without requesting browser permission", async ({ page }) => {
    await mockCrmApis(page, linkedOrder());
    await login(page);
    const settingsButton = page.locator('.crm-nav [data-section="settings"]');
    if (await page.locator("#crmMenuToggle").isVisible()) await page.locator("#crmMenuToggle").click();
    await settingsButton.click();
    await expect(page.locator("#crmPushStatus")).toContainText("отключены");
    await expect(page.locator("#crmEnablePush")).toBeDisabled();
    await expect(page.locator("#crmDisablePush")).toBeHidden();
});
