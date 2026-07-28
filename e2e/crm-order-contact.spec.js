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

    const headers = page.locator(".order-card-header[data-order-toggle]");
    for (let index = 0; index < await headers.count(); index += 1) {
        const header = headers.nth(index);
        if (await header.getAttribute("aria-expanded") === "false") {
            await header.click();
        }
    }
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

test("mobile order keeps product metrics and footer actions compact", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await mockOrders(page, [
        order({
            id: 401,
            orderNumber: "MOBILE-COMPACT",
            customerName: "Мобильный клиент",
            phone: "+7 900 111-22-33",
            managerId: null,
            managerName: "",
            items: [
                {
                    name: "Плита теплоизоляционная",
                    qty: 1,
                    unit: "шт",
                    weight: 11,
                    lineWeight: 11,
                    lineTotal: 102.9,
                    priceOnRequest: false
                },
                {
                    name: "Материал с ценой по запросу",
                    qty: 2,
                    unit: "шт",
                    weight: 0,
                    lineWeight: 0,
                    lineTotal: null,
                    priceOnRequest: true
                }
            ],
            totalPrice: 102.9,
            totalWeight: 11
        }),
        order({
            id: 402,
            orderNumber: "MOBILE-TELEGRAM",
            customerName: "Клиент Telegram",
            managerId: null,
            preferredContactMethod: "telegram",
            preferredContactValue: "@matmix"
        }),
        order({
            id: 403,
            orderNumber: "MOBILE-WHATSAPP",
            customerName: "Клиент WhatsApp",
            managerId: null,
            preferredContactMethod: "whatsapp",
            preferredContactValue: "+7 900 765-43-21"
        })
    ]);
    await login(page);
    await openOrders(page);

    const card = page.locator('article.order-card[data-id="401"]');
    const rows = card.locator(".order-item-row");
    await expect(rows).toHaveCount(2);
    await expect(card.locator(".order-items-list table")).toHaveCount(0);

    const firstRow = rows.first();
    await expect(firstRow.locator(".order-item-name")).toHaveText("Плита теплоизоляционная");
    await expect(firstRow.locator(".order-item-label")).toHaveText(["Кол-во:", "Вес:", "Сумма:"]);
    await expect(firstRow.locator(".order-item-value")).toHaveText(["1 шт", "11,000 кг", "102,90 ₽"]);
    await expect(rows.nth(1).locator(".order-item-value").last()).toHaveText("Цена по запросу");

    const metricLayout = await firstRow.locator(".order-item-metrics").evaluate(element => {
        const metrics = Array.from(element.querySelectorAll(".order-item-metric"));
        return {
            display: getComputedStyle(element).display,
            columns: getComputedStyle(element).gridTemplateColumns,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            metrics: metrics.map(metric => ({
                top: metric.getBoundingClientRect().top,
                fontWeight: getComputedStyle(metric).fontWeight
            }))
        };
    });
    expect(metricLayout.display).toBe("grid");
    expect(metricLayout.columns.trim().split(/\s+/)).toHaveLength(3);
    expect(metricLayout.scrollWidth).toBeLessThanOrEqual(metricLayout.clientWidth);
    expect(metricLayout.metrics.map(metric => metric.fontWeight)).toEqual(["400", "400", "400"]);
    expect(new Set(metricLayout.metrics.map(metric => Math.round(metric.top))).size).toBe(1);

    const footer = card.locator(".order-card-footer");
    const primaryActions = footer.locator(".order-primary-actions-compact");
    const actions = primaryActions.locator(".order-actions > a, .order-actions > button, .order-controls > button");
    await expect(actions).toHaveText(["Позвонить", "Скачать заказ", "Взять в работу", "Удалить"]);
    const actionLayout = await primaryActions.evaluate(element => {
        const actions = Array.from(element.querySelectorAll(
            ".order-actions > a, .order-actions > button, .order-controls > button"
        ));
        const footer = element.closest(".order-card-footer");
        const footerBox = footer.getBoundingClientRect();
        const documentElement = document.documentElement;
        return {
            clientWidth: footer.clientWidth,
            scrollWidth: footer.scrollWidth,
            documentClientWidth: documentElement.clientWidth,
            documentScrollWidth: documentElement.scrollWidth,
            flexWrap: getComputedStyle(element).flexWrap,
            gap: getComputedStyle(element).columnGap,
            actions: actions.map(action => ({
                width: action.getBoundingClientRect().width,
                height: action.getBoundingClientRect().height,
                top: action.getBoundingClientRect().top,
                bottom: action.getBoundingClientRect().bottom,
                left: action.getBoundingClientRect().left,
                right: action.getBoundingClientRect().right,
                whiteSpace: getComputedStyle(action).whiteSpace,
                fontSize: getComputedStyle(action).fontSize,
                paddingLeft: getComputedStyle(action).paddingLeft,
                paddingRight: getComputedStyle(action).paddingRight,
                backgroundColor: getComputedStyle(action).backgroundColor,
                color: getComputedStyle(action).color,
                clientWidth: action.clientWidth,
                scrollWidth: action.scrollWidth,
                inlineWidth: action.style.width
            })),
            footerLeft: footerBox.left,
            footerRight: footerBox.right,
            footerWidth: footerBox.width
        };
    });
    expect(actionLayout.flexWrap).toBe("nowrap");
    expect(actionLayout.scrollWidth).toBeLessThanOrEqual(actionLayout.clientWidth);
    expect(actionLayout.documentScrollWidth).toBeLessThanOrEqual(actionLayout.documentClientWidth);
    expect(new Set(actionLayout.actions.map(action => Math.round(action.height))).size).toBe(1);
    expect(Math.max(...actionLayout.actions.map(action => action.top))
        - Math.min(...actionLayout.actions.map(action => action.top))).toBeLessThanOrEqual(2);
    expect(Math.max(...actionLayout.actions.map(action => action.bottom))
        - Math.min(...actionLayout.actions.map(action => action.bottom))).toBeLessThanOrEqual(2);
    for (const action of actionLayout.actions) {
        expect(action.width).toBeLessThan(actionLayout.footerWidth);
        expect(action.height).toBeGreaterThanOrEqual(34);
        expect(action.height).toBeLessThanOrEqual(38);
        expect(action.left).toBeGreaterThanOrEqual(actionLayout.footerLeft);
        expect(action.right).toBeLessThanOrEqual(actionLayout.footerRight);
        expect(action.whiteSpace).toBe("nowrap");
        expect(action.scrollWidth).toBeLessThanOrEqual(action.clientWidth);
        expect(action.inlineWidth).not.toBe("100%");
    }
    const [callAction, downloadAction, takeAction, deleteAction] = actionLayout.actions;
    expect(callAction.left).toBeLessThan(downloadAction.left);
    expect(downloadAction.left).toBeLessThan(takeAction.left);
    expect(takeAction.left).toBeLessThan(deleteAction.left);
    expect(deleteAction.left - takeAction.right).toBeGreaterThan(0);
    expect(actionLayout.footerRight - deleteAction.right).toBeLessThanOrEqual(12);
    expect(callAction.backgroundColor).toBe(takeAction.backgroundColor);
    expect(downloadAction.backgroundColor).not.toBe(callAction.backgroundColor);
    expect(downloadAction.backgroundColor).not.toBe(deleteAction.backgroundColor);
    expect(deleteAction.backgroundColor).not.toBe(callAction.backgroundColor);
    expect(Number(deleteAction.backgroundColor.match(/\d+/g)[0]))
        .toBeGreaterThan(Number(deleteAction.backgroundColor.match(/\d+/g)[1]));
    expect(deleteAction.right).toBeLessThanOrEqual(actionLayout.footerRight);

    const telegram = page.locator('[data-id="402"] .order-card-footer').getByRole("link", { name: "Telegram" });
    const whatsapp = page.locator('[data-id="403"] .order-card-footer').getByRole("link", { name: "WhatsApp" });
    await expect(telegram).toHaveAttribute("href", "https://t.me/matmix");
    await expect(whatsapp).toHaveAttribute("href", "https://wa.me/79007654321");
    for (const [contactAction, cardId] of [[telegram, "402"], [whatsapp, "403"]]) {
        const dimensions = await contactAction.evaluate(element => {
            const footer = element.closest(".order-card-footer");
            return {
                label: element.textContent.trim(),
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height,
                footerWidth: footer.getBoundingClientRect().width,
                footerClientWidth: footer.clientWidth,
                footerScrollWidth: footer.scrollWidth
            };
        });
        expect(dimensions.width).toBeLessThan(dimensions.footerWidth);
        expect(dimensions.height).toBeGreaterThanOrEqual(40);
        expect(dimensions.footerScrollWidth).toBeLessThanOrEqual(dimensions.footerClientWidth);
        await expect(page.locator(`[data-id="${cardId}"] .contact-actions`)).toContainText(dimensions.label);
        const takeColor = await page.locator(`[data-id="${cardId}"] [data-action="take"]`)
            .evaluate(element => getComputedStyle(element).backgroundColor);
        expect(takeColor).toBe(callAction.backgroundColor);
    }

    const pageOverflow = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
    }));
    expect(pageOverflow.scrollWidth).toBeLessThanOrEqual(pageOverflow.clientWidth);
});

test("taken order keeps release, delete, and status control in one row", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    let mutableOrder = order({
        id: 501,
        orderNumber: "MOBILE-STATUS",
        customerName: "Заказ для смены статуса",
        phone: "+7 900 111-22-33",
        managerId: null,
        managerName: "",
        updatedAt: "2026-07-27T06:00:00.000Z"
    });
    const mutations = [];
    const fulfillMutation = (route, action) => {
        mutableOrder = {
            ...mutableOrder,
            ...action,
            updatedAt: new Date(Date.parse(mutableOrder.updatedAt) + 1000).toISOString()
        };
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, order: mutableOrder })
        });
    };

    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: [mutableOrder],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            stats: {
                total: 1,
                new: mutableOrder.status === "Новая" ? 1 : 0,
                work: mutableOrder.status === "В работе" ? 1 : 0
            }
        })
    }));
    await page.route("**/api/orders/501/take", route => {
        mutations.push("take");
        return fulfillMutation(route, {
            managerId: 2,
            managerName: "E2E Admin",
            status: "В работе"
        });
    });
    await page.route("**/api/orders/501/status", async route => {
        const payload = route.request().postDataJSON();
        mutations.push(`status:${payload.status}`);
        return fulfillMutation(route, { status: payload.status });
    });
    await page.route("**/api/orders/501/release", route => {
        mutations.push("release");
        return fulfillMutation(route, {
            managerId: null,
            managerName: "",
            status: "Новая"
        });
    });

    await login(page);
    await openOrders(page);

    const card = page.locator('article.order-card[data-id="501"]');
    await card.getByRole("button", { name: "Взять в работу" }).click();

    const primaryActions = card.locator(".order-primary-actions-status");
    const controls = primaryActions.locator(".order-controls-status");
    const callButton = primaryActions.getByRole("link", { name: "Позвонить" });
    const downloadButton = primaryActions.getByRole("button", { name: "Скачать заказ" });
    const releaseButton = controls.getByRole("button", { name: "Освободить" });
    const deleteButton = controls.getByRole("button", { name: "Удалить" });
    const statusSelect = controls.locator(".status-select");
    await expect(callButton).toBeVisible();
    await expect(downloadButton).toBeVisible();
    await expect(releaseButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
    await expect(statusSelect).toHaveValue("В работе");
    await expect(controls.locator(":scope > button")).toHaveText(["Освободить", "Удалить"]);
    await expect(controls.locator(".status-control > .visually-hidden")).toHaveText("Изменить статус");
    await expect(controls.locator(".status-control > span:not(.visually-hidden)")).toHaveCount(0);
    await statusSelect.selectOption("Ожидает клиента");
    await expect(card.locator(".status-select")).toHaveValue("Ожидает клиента");
    await expect(primaryActions).toBeVisible();

    const measureLayout = () => primaryActions.evaluate(element => {
        const footer = element.closest(".order-card-footer");
        const call = element.querySelector('.order-actions a[href^="tel:"]');
        const download = element.querySelector(".download-order-excel");
        const release = element.querySelector('[data-action="release"]');
        const remove = element.querySelector(".delete-order");
        const select = element.querySelector(".status-select");
        const rowStyle = getComputedStyle(element);
        const selectStyle = getComputedStyle(select);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = selectStyle.font;
        const selectedText = select.selectedOptions[0].textContent;
        const selectedTextLetterSpacing = parseFloat(selectStyle.letterSpacing) || 0;
        const dimensions = target => {
            const box = target.getBoundingClientRect();
            return {
                left: box.left,
                right: box.right,
                top: box.top,
                bottom: box.bottom,
                width: box.width,
                height: box.height,
                clientWidth: target.clientWidth,
                scrollWidth: target.scrollWidth
            };
        };
        return {
            display: getComputedStyle(element).display,
            flexWrap: getComputedStyle(element).flexWrap,
            gap: rowStyle.columnGap,
            selectedText,
            selectedTextWidth: context.measureText(selectedText).width
                + selectedTextLetterSpacing * Math.max(0, selectedText.length - 1),
            selectedTextAvailableWidth: select.clientWidth
                - parseFloat(selectStyle.paddingLeft)
                - parseFloat(selectStyle.paddingRight),
            selectFontSize: selectStyle.fontSize,
            selectPaddingLeft: selectStyle.paddingLeft,
            selectPaddingRight: selectStyle.paddingRight,
            call: dimensions(call),
            download: dimensions(download),
            release: dimensions(release),
            remove: dimensions(remove),
            select: dimensions(select),
            footerLeft: footer.getBoundingClientRect().left,
            footerRight: footer.getBoundingClientRect().right,
            footerClientWidth: footer.clientWidth,
            footerScrollWidth: footer.scrollWidth,
            documentClientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth
        };
    });
    const layout = await measureLayout();
    expect(layout.display).toBe("flex");
    expect(layout.flexWrap).toBe("nowrap");
    expect(layout.call.left).toBeLessThan(layout.download.left);
    expect(layout.download.left).toBeLessThan(layout.release.left);
    expect(layout.release.left).toBeLessThan(layout.select.left);
    expect(layout.select.left).toBeLessThan(layout.remove.left);
    expect(Math.max(layout.call.top, layout.download.top, layout.release.top, layout.select.top, layout.remove.top)
        - Math.min(layout.call.top, layout.download.top, layout.release.top, layout.select.top, layout.remove.top)).toBeLessThanOrEqual(2);
    expect(layout.select.left - layout.release.right).toBeGreaterThanOrEqual(0);
    expect(layout.remove.left - layout.select.right).toBeGreaterThan(0);
    expect(layout.footerRight - layout.remove.right).toBeLessThanOrEqual(12);
    expect(layout.selectedText).toBe("Ожидает клиента");
    expect(layout.selectedTextWidth).toBeLessThanOrEqual(layout.selectedTextAvailableWidth);
    for (const item of [layout.call, layout.download, layout.release, layout.select, layout.remove]) {
        expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
        expect(item.height).toBeGreaterThanOrEqual(34);
        expect(item.height).toBeLessThanOrEqual(38);
    }
    expect(layout.footerScrollWidth).toBeLessThanOrEqual(layout.footerClientWidth);
    expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);

    for (const width of [360, 390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const responsiveLayout = await measureLayout();
        expect(responsiveLayout.call.left).toBeLessThan(responsiveLayout.download.left);
        expect(responsiveLayout.download.left).toBeLessThan(responsiveLayout.release.left);
        expect(responsiveLayout.release.left).toBeLessThan(responsiveLayout.select.left);
        expect(responsiveLayout.select.left).toBeLessThan(responsiveLayout.remove.left);
        expect(Math.max(
            responsiveLayout.call.top,
            responsiveLayout.download.top,
            responsiveLayout.release.top,
            responsiveLayout.select.top,
            responsiveLayout.remove.top
        ) - Math.min(
            responsiveLayout.call.top,
            responsiveLayout.download.top,
            responsiveLayout.release.top,
            responsiveLayout.select.top,
            responsiveLayout.remove.top
        )).toBeLessThanOrEqual(2);
        expect(responsiveLayout.footerScrollWidth).toBeLessThanOrEqual(responsiveLayout.footerClientWidth);
        expect(responsiveLayout.documentScrollWidth).toBeLessThanOrEqual(responsiveLayout.documentClientWidth);
        expect(responsiveLayout.selectedTextWidth).toBeLessThanOrEqual(responsiveLayout.selectedTextAvailableWidth);
        for (const item of [
            responsiveLayout.call,
            responsiveLayout.download,
            responsiveLayout.release,
            responsiveLayout.select,
            responsiveLayout.remove
        ]) {
            expect(item.height).toBeLessThanOrEqual(38);
        }
    }

    await card.getByRole("button", { name: "Освободить" }).click();
    await expect(card.getByRole("button", { name: "Взять в работу" })).toBeVisible();
    await expect(card.locator(".status-select")).toHaveCount(0);
    expect(mutations).toEqual(["take", "status:Ожидает клиента", "release"]);
});
