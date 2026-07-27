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

test("order Overview renders one compact six-field summary and keeps footer contact actions", async ({ page }) => {
    await mockOrders(page, [
        order({
            id: 101,
            orderNumber: "CONTACT-PHONE",
            customerName: "Клиент с пустым preferred Telegram",
            phone: "+7 900 111-22-33",
            unloading: "Нет",
            paymentMethod: "Безнал — с НДС",
            address: "Не указан",
            comment: "TEST Download 2",
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
    await expect(phoneCard.locator(".order-customer-summary")).toHaveCount(1);
    await expect(phoneCard.locator(".order-delivery-section")).toHaveCount(0);
    await expect(phoneSummary.locator(".order-overview-summary-grid")).toHaveCount(1);
    await expect(phoneSummary.locator(".info-row")).toHaveCount(6);
    await expect(phoneSummary.locator(".info-row > span")).toHaveText([
        "Имя",
        "Тел.",
        "Разгрузка",
        "Оплата",
        "Адрес",
        "Комментарий"
    ]);
    await expect(phoneSummary.locator(".info-row > strong")).toHaveText([
        "Клиент с пустым preferred Telegram",
        "+7 900 111-22-33",
        "Нет",
        "Безнал — с НДС",
        "Не указан",
        "TEST Download 2"
    ]);
    await expect(phoneSummary.getByRole("link")).toHaveCount(0);
    await expect(phoneSummary.getByRole("button", { name: "Позвонить" })).toHaveCount(0);
    await expect(phoneCard.locator(".order-card-footer").getByRole("link", { name: "Позвонить" })).toHaveAttribute("href", "tel:+79001112233");

    const telegramCard = page.locator('[data-id="102"]');
    const telegramSummary = telegramCard.locator(".order-customer-summary");
    await expect(telegramSummary.getByRole("link")).toHaveCount(0);
    await expect(telegramCard.locator(".order-card-footer").getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/matmix");
    await expect(telegramCard.locator(".order-card-footer").getByRole("link", { name: "Telegram" })).toHaveAttribute("rel", "noopener");

    const noContactCard = page.locator('[data-id="103"]');
    const noContactSummary = noContactCard.locator(".order-customer-summary");
    await expect(noContactSummary.locator(".info-row > strong")).toHaveText([
        "Клиент без контакта",
        "Не указан",
        "Нет",
        "Не указана",
        "Не указан",
        "Нет"
    ]);
    await expect(noContactSummary.locator("a")).toHaveCount(0);
    await expect(noContactCard.locator(".order-card-footer .contact-disabled")).toHaveText("Контакт не указан");
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
    await expect(card.locator(".order-customer-summary")).toContainText("+7 900 777-88-99");
    await expect(card.locator(".order-customer-summary").getByRole("link")).toHaveCount(0);
    await expect(card.locator(".order-card-footer").getByRole("link", { name: "Позвонить" }))
        .toHaveAttribute("href", "tel:+79007778899");
});

test("contact summary keeps two columns and wraps long address and comment at 320px", async ({ page }) => {
    const longAddress = "ОченьДлинныйАдресБезПробеловДляПроверкиПереносаВнутриЛевойКолонки";
    const longComment = "ОченьДлинныйКомментарийБезПробеловДляПроверкиПереносаВнутриПравойКолонки";
    await page.setViewportSize({ width: 320, height: 900 });
    await mockOrders(page, [order({
        id: 301,
        orderNumber: "CONTACT-MOBILE",
        customerName: "Очень длинное имя клиента для проверки корректного переноса внутри мобильного обзора заказа",
        phone: "+7 (900) 123-45-67",
        address: longAddress,
        comment: longComment,
        preferredContactMethod: "whatsapp",
        preferredContactValue: "+7 (900) 765-43-21"
    })]);
    await login(page);
    await openOrders(page);

    const summary = page.locator('[data-id="301"] .order-customer-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Очень длинное имя клиента");
    await expect(summary).toContainText("+7 (900) 123-45-67");
    await expect(summary).toContainText(longAddress);
    await expect(summary).toContainText(longComment);
    await expect(summary.getByRole("link")).toHaveCount(0);
    await expect(page.locator('[data-id="301"] .order-card-footer').getByRole("link", { name: "WhatsApp" }))
        .toHaveAttribute("href", "https://wa.me/79007654321");
    const dimensions = await summary.evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        columns: getComputedStyle(element.querySelector(".order-overview-summary-grid")).gridTemplateColumns,
        fields: Array.from(element.querySelectorAll(".info-row")).map(field => ({
            clientWidth: field.clientWidth,
            scrollWidth: field.scrollWidth,
            valueClientWidth: field.querySelector("strong").clientWidth,
            valueScrollWidth: field.querySelector("strong").scrollWidth
        }))
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.columns.trim().split(/\s+/)).toHaveLength(2);
    for (const field of dimensions.fields) {
        expect(field.scrollWidth).toBeLessThanOrEqual(field.clientWidth);
        expect(field.valueScrollWidth).toBeLessThanOrEqual(field.valueClientWidth);
    }
});
