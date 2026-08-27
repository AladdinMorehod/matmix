const { test, expect } = require("@playwright/test");

test("analytics is a safe no-op without a configured counter", async ({ page }) => {
    const externalRequests = [];
    page.on("request", request => { if (request.url().includes("mc.yandex.ru")) externalRequests.push(request.url()); });
    await page.route("**/api/public/analytics-config", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ yandexMetrikaId: "" }) }));
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => Boolean(window.matmixAnalytics))).toBe(true);
    expect(externalRequests).toEqual([]);
});

test("analytics adapter sends allowlisted non-PII goals", async ({ page }) => {
    await page.addInitScript(() => { window.ymCalls = []; window.ym = (...args) => window.ymCalls.push(args); });
    await page.route("**/api/public/analytics-config", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ yandexMetrikaId: "123456" }) }));
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => window.ymCalls.some(call => call[1] === "init"))).toBe(true);
    await page.evaluate(() => window.matmixAnalytics.track("one_click_success", {
        external_id: "MAT-1", quantity: 2, phone: "+79990000000", email: "person@example.test",
        name: "Не отправлять", comment: "private", address: "private", consent: true,
        nested: { customer: { phone: "+79990000000" } }, query: "секретный запрос"
    }));
    const goal = await page.evaluate(() => window.ymCalls.find(call => call[1] === "reachGoal"));
    expect(goal[2]).toBe("one_click_success");
    expect(goal[3]).toEqual({ external_id: "MAT-1", quantity: 2 });
});

test("analytics emits one goal per explicit event and keeps commerce independent", async ({ page }) => {
    await page.addInitScript(() => { window.ymCalls = []; window.ym = (...args) => window.ymCalls.push(args); });
    await page.route("**/api/public/analytics-config", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ yandexMetrikaId: "123456" }) }));
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => window.ymCalls.some(call => call[1] === "init"))).toBe(true);
    await page.evaluate(() => {
        window.matmixAnalytics.track("product_view", { external_id: "MAT-1" });
        window.matmixAnalytics.track("add_to_cart", { external_id: "MAT-1", quantity: 1 });
        window.matmixAnalytics.track("one_click_success", { external_id: "MAT-1", quantity: 1 });
        window.matmixAnalytics.track("checkout_success", { quantity: 1, source: "cart" });
    });
    const counts = await page.evaluate(() => Object.fromEntries(window.ymCalls.filter(call => call[1] === "reachGoal").map(call => call[2]).map(name => [name, (window.ymCalls.filter(call => call[1] === "reachGoal" && call[2] === name).length)])));
    expect(counts).toEqual({ product_view: 1, add_to_cart: 1, one_click_success: 1, checkout_success: 1 });
});
