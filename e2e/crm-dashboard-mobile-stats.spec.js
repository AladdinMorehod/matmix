const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await expect(page.locator("#dashboardView")).not.toHaveClass(/hidden/);
}

async function readDashboardLayout(page) {
    return page.evaluate(() => {
        const container = document.querySelector(".dashboard-stats");
        const cards = Array.from(container.querySelectorAll(".dashboard-stat"));
        return {
            documentClientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            containerClientWidth: container.clientWidth,
            containerScrollWidth: container.scrollWidth,
            containerGap: Number.parseFloat(getComputedStyle(container).gap),
            cards: cards.map(card => {
                const label = card.querySelector("span");
                const value = card.querySelector("strong");
                const cardRect = card.getBoundingClientRect();
                const labelRect = label.getBoundingClientRect();
                const valueRect = value.getBoundingClientRect();
                const cardStyle = getComputedStyle(card);
                const valueStyle = getComputedStyle(value);
                return {
                    label: label.textContent.trim(),
                    value: value.textContent.trim(),
                    cardHeight: cardRect.height,
                    cardRight: cardRect.right,
                    labelLeft: labelRect.left,
                    labelRight: labelRect.right,
                    labelCenterY: labelRect.top + labelRect.height / 2,
                    valueLeft: valueRect.left,
                    valueRight: valueRect.right,
                    valueCenterY: valueRect.top + valueRect.height / 2,
                    display: cardStyle.display,
                    minHeight: cardStyle.minHeight,
                    paddingTop: Number.parseFloat(cardStyle.paddingTop),
                    paddingRight: Number.parseFloat(cardStyle.paddingRight),
                    paddingBottom: Number.parseFloat(cardStyle.paddingBottom),
                    paddingLeft: Number.parseFloat(cardStyle.paddingLeft),
                    valueFlexShrink: valueStyle.flexShrink,
                    valueWhiteSpace: valueStyle.whiteSpace,
                    valueTextAlign: valueStyle.textAlign
                };
            })
        };
    });
}

test("dashboard statistics stay desktop-sized and become compact rows on mobile", async ({ page }) => {
    await login(page);

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktop = await readDashboardLayout(page);
    expect(desktop.cards).toHaveLength(5);
    for (const card of desktop.cards) {
        expect(card.display).toBe("grid");
        expect(card.cardHeight).toBeGreaterThanOrEqual(86);
        expect(card.minHeight).toBe("86px");
    }

    for (const width of [390, 360, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const mobile = await readDashboardLayout(page);
        expect(mobile.cards.map(card => card.label)).toEqual([
            "Новые заявки",
            "В работе",
            "Ожидают клиента",
            "Завершены сегодня",
            "Всего клиентов"
        ]);
        expect(mobile.documentScrollWidth).toBeLessThanOrEqual(mobile.documentClientWidth);
        expect(mobile.containerScrollWidth).toBeLessThanOrEqual(mobile.containerClientWidth);
        expect(mobile.containerGap).toBeGreaterThanOrEqual(8);
        expect(mobile.containerGap).toBeLessThanOrEqual(12);

        for (const card of mobile.cards) {
            expect(card.display).toBe("flex");
            expect(card.minHeight).toBe("0px");
            expect(card.cardHeight).toBeLessThan(70);
            expect(card.paddingTop).toBeGreaterThanOrEqual(12);
            expect(card.paddingTop).toBeLessThanOrEqual(14);
            expect(card.paddingBottom).toBe(card.paddingTop);
            expect(card.paddingLeft).toBeGreaterThanOrEqual(14);
            expect(card.paddingRight).toBe(card.paddingLeft);
            expect(card.labelLeft).toBeLessThan(card.valueLeft);
            expect(card.labelRight).toBeLessThanOrEqual(card.valueLeft);
            expect(Math.abs(card.labelCenterY - card.valueCenterY)).toBeLessThanOrEqual(1);
            expect(card.cardRight - card.valueRight).toBeGreaterThanOrEqual(card.paddingRight - 1);
            expect(card.cardRight - card.valueRight).toBeLessThanOrEqual(card.paddingRight + 2);
            expect(card.valueFlexShrink).toBe("0");
            expect(card.valueWhiteSpace).toBe("nowrap");
            expect(card.valueTextAlign).toBe("right");
        }
    }
});
