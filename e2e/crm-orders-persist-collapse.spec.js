const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await expect(page.locator("#managerUserName")).toHaveText("E2E Admin");
}

async function openSection(page, section) {
    const button = page.locator(`.crm-nav [data-section="${section}"]`);
    const menuToggle = page.locator("#crmMenuToggle");
    if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await expect(button).toBeInViewport();
    }
    await button.click();
    await expect(button).toHaveClass(/active/);
    await expect.poll(() => new URL(page.url()).searchParams.get("section")).toBe(section);
}

function order(overrides) {
    return {
        id: overrides.id,
        orderNumber: overrides.orderNumber,
        customerName: overrides.customerName || "Клиент",
        phone: overrides.phone || "+7 900 111-22-33",
        requestType: overrides.requestType || "order",
        attachmentCount: overrides.attachmentCount || 0,
        items: [],
        totalPrice: 0,
        totalWeight: 0,
        status: overrides.status || "Новая",
        managerId: overrides.managerId ?? null,
        managerName: overrides.managerName || "",
        createdAt: overrides.createdAt || "2026-07-28T08:30:00.000Z",
        consent: {},
        ...overrides
    };
}

async function mockOrders(page, items) {
    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: items,
            pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
            stats: {
                total: items.length,
                new: items.filter(item => item.status === "Новая").length,
                work: items.filter(item => item.status === "В работе").length
            }
        })
    }));
}

test("CRM section survives reload, supports history and normalizes invalid URLs", async ({ page }) => {
    await login(page);

    await openSection(page, "orders");
    await page.reload();
    await expect(page.locator('.crm-nav [data-section="orders"]')).toHaveClass(/active/);
    await expect(page.locator("#ordersList")).toBeVisible();
    expect(new URL(page.url()).searchParams.get("section")).toBe("orders");

    await openSection(page, "clients");
    await page.reload();
    await expect(page.locator('.crm-nav [data-section="clients"]')).toHaveClass(/active/);
    await expect(page.locator("#clientsView")).not.toHaveClass(/hidden/);
    expect(new URL(page.url()).searchParams.get("section")).toBe("clients");

    await openSection(page, "orders");
    await openSection(page, "clients");
    await page.goBack();
    await expect(page.locator('.crm-nav [data-section="orders"]')).toHaveClass(/active/);
    await expect(page.locator("#ordersList")).toBeVisible();
    await page.goForward();
    await expect(page.locator('.crm-nav [data-section="clients"]')).toHaveClass(/active/);
    await expect(page.locator("#clientsView")).not.toHaveClass(/hidden/);

    await page.goto("/manager.html?section=removed-section");
    await expect(page.locator('.crm-nav [data-section="dashboard"]')).toHaveClass(/active/);
    await expect(page.locator("#dashboardView")).not.toHaveClass(/hidden/);
    expect(new URL(page.url()).searchParams.get("section")).toBe("dashboard");
});

test("order cards collapse independently and restore expanded ids after reload", async ({ page }) => {
    const mockedOrders = [
        order({
            id: 701,
            orderNumber: "FILES-701",
            customerName: "Анна Петрова",
            phone: "+7 900 123-45-67",
            requestType: "file_request",
            attachmentCount: 2
        }),
        order({
            id: 702,
            orderNumber: "WORK-702",
            status: "В работе",
            managerId: 2,
            managerName: "E2E Admin"
        }),
        order({
            id: 703,
            orderNumber: "COLLAPSED-703",
            customerName: "",
            phone: "",
            requestType: "file_request",
            attachmentCount: 0
        })
    ];
    await mockOrders(page, mockedOrders);
    await login(page);
    await openSection(page, "orders");

    const cards = page.locator("article.order-card:not(.order-card-deleted)");
    await expect(cards).toHaveCount(3);
    await expect(cards.locator(".order-card-details")).toHaveCount(0);
    for (let index = 0; index < 3; index += 1) {
        await expect(cards.nth(index).locator(".order-card-header")).toHaveAttribute("aria-expanded", "false");
    }

    const first = page.locator('article.order-card[data-id="701"]');
    const second = page.locator('article.order-card[data-id="702"]');
    const third = page.locator('article.order-card[data-id="703"]');
    await expect(first.locator(".order-request-type")).toHaveText("Файловая заявка · Файлы: 2");
    await expect(third.locator(".order-request-type")).toHaveCount(0);
    await expect(first.locator(".order-header-customer")).toContainText("Клиент: Анна Петрова");
    await expect(first.locator(".order-header-customer")).toContainText("Тел.: +7 900 123-45-67");
    await expect(third.locator(".order-header-customer")).toContainText("Клиент: Не указан");
    await expect(third.locator(".order-header-customer")).toContainText("Тел.: Не указан");
    await expect(third.locator(".order-header-customer")).not.toContainText("Телефон не указан");
    await expect(first.locator(".status-new")).toHaveCount(0);
    await expect(first).not.toContainText("Новая");

    const desktopHeaderLayout = await first.locator(".order-card-header").evaluate(header => {
        const main = header.querySelector(".order-header-main").getBoundingClientRect();
        const customer = header.querySelector(".order-header-customer").getBoundingClientRect();
        const side = header.querySelector(".order-header-side").getBoundingClientRect();
        return {
            mainRight: main.right,
            customerLeft: customer.left,
            customerRight: customer.right,
            sideLeft: side.left
        };
    });
    if ((page.viewportSize()?.width || 0) > 768) {
        expect(desktopHeaderLayout.customerLeft).toBeGreaterThanOrEqual(desktopHeaderLayout.mainRight);
        expect(desktopHeaderLayout.sideLeft).toBeGreaterThanOrEqual(desktopHeaderLayout.customerRight);
    }

    await first.locator(".order-card-header").click();
    await second.locator(".order-card-header").click();
    await expect(first.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(second.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(third.locator(".order-card-header")).toHaveAttribute("aria-expanded", "false");
    await expect(first.locator(".order-header-customer")).toContainText("Клиент: Анна Петрова");
    await expect(first.locator(".order-header-customer")).toContainText("Тел.: +7 900 123-45-67");
    await expect(first.locator(".order-card-details")).toBeVisible();
    await expect(second.locator(".order-card-details")).toBeVisible();

    await first.locator('.order-tabs [data-tab="client"]').click();
    await expect(first.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(second.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");

    await page.reload();
    await expect(page.locator('.crm-nav [data-section="orders"]')).toHaveClass(/active/);
    await expect(first.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(second.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(third.locator(".order-card-header")).toHaveAttribute("aria-expanded", "false");

    await first.locator(".order-card-header").click();
    await expect(first.locator(".order-card-header")).toHaveAttribute("aria-expanded", "false");
    await expect(second.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");

    const beforeHover = await third.evaluate(element => getComputedStyle(element).transform);
    await third.hover();
    const afterHover = await third.evaluate(element => getComputedStyle(element).transform);
    expect(afterHover).toBe(beforeHover);
    expect(afterHover).toBe("none");
});

test("collapsed order header keeps all three zones in one row without overflow", async ({ page }) => {
    await mockOrders(page, [
        order({
            id: 704,
            orderNumber: "ОЧЕНЬ-ДЛИННЫЙ-НОМЕР-ЗАКАЗА-704",
            status: "В работе",
            managerId: 2,
            managerName: "Очень длинное имя ответственного менеджера",
            customerName: "Очень длинное имя клиента, которое должно безопасно переноситься внутри свёрнутой шапки заказа",
            phone: "+7-999-123-45-67-добавочный-1234567890",
            requestType: "file_request",
            attachmentCount: 5
        })
    ]);
    await login(page);
    await openSection(page, "orders");

    const card = page.locator('article.order-card[data-id="704"]');
    const customerBlock = card.locator(".order-header-customer");
    await expect(customerBlock).toBeVisible();
    await expect(customerBlock).toContainText("Клиент:");
    await expect(customerBlock).toContainText("Тел.:");

    for (const width of [1280, 390, 360, 320]) {
        await page.setViewportSize({ width, height: 800 });
        const layout = await card.locator(".order-card-header").evaluate(header => {
            const main = header.querySelector(".order-header-main").getBoundingClientRect();
            const customerElement = header.querySelector(".order-header-customer");
            const customer = customerElement.getBoundingClientRect();
            const customerName = header.querySelector(".order-header-customer > span:first-child");
            const customerNameRect = customerName.getBoundingClientRect();
            const customerPhone = header.querySelector(".order-header-customer > span:last-child");
            const side = header.querySelector(".order-header-side").getBoundingClientRect();
            const assignment = header.querySelector(".assignment").getBoundingClientRect();
            const card = header.closest(".order-card");
            return {
                columns: getComputedStyle(header).gridTemplateColumns,
                mainLeft: main.left,
                mainRight: main.right,
                mainTop: main.top,
                mainBottom: main.bottom,
                customerLeft: customer.left,
                customerRight: customer.right,
                customerTop: customer.top,
                customerClientWidth: customerElement.clientWidth,
                customerScrollWidth: customerElement.scrollWidth,
                customerNameHeight: customerNameRect.height,
                customerNameLineHeight: parseFloat(getComputedStyle(customerName).lineHeight),
                customerPhoneClientWidth: customerPhone.clientWidth,
                customerPhoneScrollWidth: customerPhone.scrollWidth,
                sideLeft: side.left,
                sideRight: side.right,
                assignmentLeft: assignment.left,
                assignmentRight: assignment.right,
                headerClientWidth: header.clientWidth,
                headerScrollWidth: header.scrollWidth,
                cardClientWidth: card.clientWidth,
                cardScrollWidth: card.scrollWidth,
                documentClientWidth: document.documentElement.clientWidth,
                documentScrollWidth: document.documentElement.scrollWidth
            };
        });

        expect(layout.columns.trim().split(/\s+/)).toHaveLength(3);
        expect(layout.customerLeft).toBeGreaterThanOrEqual(layout.mainRight);
        expect(Math.abs(layout.customerTop - layout.mainTop)).toBeLessThanOrEqual(2);
        expect(layout.customerTop).toBeLessThan(layout.mainBottom);
        expect(layout.sideLeft).toBeGreaterThanOrEqual(layout.customerRight);
        expect(layout.assignmentLeft).toBeGreaterThan(layout.customerLeft);
        expect(layout.sideRight).toBeLessThanOrEqual(width);
        expect(layout.customerScrollWidth).toBeLessThanOrEqual(layout.customerClientWidth);
        expect(layout.customerPhoneScrollWidth).toBeLessThanOrEqual(layout.customerPhoneClientWidth);
        expect(layout.headerScrollWidth).toBeLessThanOrEqual(layout.headerClientWidth);
        expect(layout.cardScrollWidth).toBeLessThanOrEqual(layout.cardClientWidth);
        expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
        if (width === 320) {
            expect(layout.customerNameHeight).toBeGreaterThan(layout.customerNameLineHeight);
        }
    }

    await expect(card.locator(".order-request-type")).toHaveText("Файловая заявка · Файлы: 5");
    await expect(card.locator(".order-card-header")).toHaveAttribute("aria-expanded", "false");
});
