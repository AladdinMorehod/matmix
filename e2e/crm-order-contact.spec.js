const { test, expect } = require("@playwright/test");

async function login(page, role = "admin") {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill(`e2e_${role}`);
    await page.locator('input[name="password"], input[type="password"]').fill(role === "manager" ? "E2eManager!234" : "E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await expect(page.locator("#managerUserName")).toHaveText(role === "manager" ? "E2E Manager" : "E2E Admin");
}

async function openOrders(page) {
    const sectionButton = page.locator('.crm-nav [data-section="orders"]');
    const menuToggle = page.locator("#crmMenuToggle");

    if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await expect(sectionButton).toBeInViewport();
    }

    await sectionButton.click();
    await expect(page.locator("#ordersList")).toBeVisible();
}

function order(overrides) {
    return {
        id: overrides.id,
        orderNumber: overrides.orderNumber,
        customerName: overrides.customerName,
        phone: overrides.phone || "",
        email: overrides.email || "",
        telegram: overrides.telegram || "",
        maxContact: overrides.maxContact || "",
        preferredContactMethod: overrides.preferredContactMethod || "",
        preferredContactValue: overrides.preferredContactValue || "",
        requestType: "order",
        items: [],
        totalPrice: 0,
        totalWeight: 0,
        status: "Новая",
        managerId: 2,
        managerName: "E2E Admin",
        createdAt: "2026-07-27T06:00:00.000Z",
        consent: {},
        ...overrides
    };
}

async function mockOrders(page, orders) {
    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders,
            pagination: { page: 1, limit: 20, total: orders.length, totalPages: 1 },
            stats: { total: orders.length, new: orders.length, work: 0 }
        })
    }));
}

test("order Overview keeps canonical phone, preferred and no-contact actions", async ({ page }) => {
    await mockOrders(page, [
        order({
            id: 101,
            orderNumber: "CONTACT-PHONE",
            customerName: "Клиент с пустым preferred Telegram",
            phone: "+7 900 111-22-33",
            preferredContactMethod: "telegram",
            preferredContactValue: " "
        }),
        order({
            id: 102,
            orderNumber: "CONTACT-TELEGRAM",
            customerName: "Клиент Telegram",
            phone: "+7 900 444-55-66",
            preferredContactMethod: "telegram",
            preferredContactValue: "@matmix"
        }),
        order({
            id: 103,
            orderNumber: "CONTACT-NONE",
            customerName: "Клиент без контакта"
        })
    ]);
    await login(page);
    await openOrders(page);

    const phoneCard = page.locator('[data-id="101"]');
    const phoneSummary = phoneCard.locator(".order-customer-summary");
    await expect(phoneSummary).toContainText("Клиент с пустым preferred Telegram");
    await expect(phoneSummary).toContainText("+7 900 111-22-33");
    await expect(phoneSummary.getByRole("link", { name: "Позвонить" })).toHaveAttribute("href", "tel:+79001112233");
    await expect(phoneCard.locator(".order-card-footer").getByRole("link", { name: "Позвонить" })).toHaveAttribute("href", "tel:+79001112233");

    const telegramCard = page.locator('[data-id="102"]');
    const telegramSummary = telegramCard.locator(".order-customer-summary");
    await expect(telegramSummary.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/matmix");
    await expect(telegramSummary.getByRole("link", { name: "Telegram" })).toHaveAttribute("rel", "noopener");

    const noContactCard = page.locator('[data-id="103"]');
    const noContactSummary = noContactCard.locator(".order-customer-summary");
    await expect(noContactSummary.locator(".contact-disabled")).toHaveText("Контакт не указан");
    await expect(noContactSummary.locator("a")).toHaveCount(0);
});

test("manager sees the same canonical phone fallback", async ({ page }) => {
    await mockOrders(page, [order({
        id: 201,
        orderNumber: "CONTACT-MANAGER",
        customerName: "Менеджерский заказ",
        phone: "+7 900 777-88-99",
        preferredContactMethod: "email",
        preferredContactValue: "invalid"
    })]);
    await login(page, "manager");
    await openOrders(page);

    const card = page.locator('[data-id="201"]');
    await expect(card.locator(".order-customer-summary").getByRole("link", { name: "Позвонить" }))
        .toHaveAttribute("href", "tel:+79007778899");
});

test("contact summary fits 320px with a long customer name", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await mockOrders(page, [order({
        id: 301,
        orderNumber: "CONTACT-MOBILE",
        customerName: "Очень длинное имя клиента для проверки корректного переноса внутри мобильного обзора заказа",
        phone: "+7 (900) 123-45-67",
        preferredContactMethod: "whatsapp",
        preferredContactValue: "+7 (900) 765-43-21"
    })]);
    await login(page);
    await openOrders(page);

    const summary = page.locator('[data-id="301"] .order-customer-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Очень длинное имя клиента");
    await expect(summary).toContainText("+7 (900) 123-45-67");
    await expect(summary.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/79007654321");
    const dimensions = await summary.evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        actionWidth: element.querySelector(".order-customer-contact")?.getBoundingClientRect().width || 0,
        actionScrollWidth: element.querySelector(".order-customer-contact")?.scrollWidth || 0
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.actionScrollWidth).toBeLessThanOrEqual(Math.ceil(dimensions.actionWidth));
});
