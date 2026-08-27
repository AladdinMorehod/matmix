const { test, expect } = require("@playwright/test");

async function installApplicationSpy(page) {
    await page.route("**/js/analytics.js*", route => route.fulfill({
        contentType: "application/javascript",
        body: `(() => {
            const calls = [];
            const record = (event, payload) => { const item = { event, payload: payload || {} }; calls.push(item); localStorage.setItem("e2e_analytics_calls", JSON.stringify(calls)); };
            window.__applicationAnalyticsCalls = calls;
            window.matmixAnalytics = {
                track: record,
                productView: payload => record("product_view", payload),
                productClick: payload => record("product_click", payload),
                addToCart: payload => record("add_to_cart", payload),
                oneClickOpen: payload => record("one_click_open", payload),
                oneClickSubmit: payload => record("one_click_submit", payload),
                oneClickSuccess: payload => record("one_click_success", payload)
            };
            document.addEventListener("click", event => {
                const link = event.target.closest(".card a[href^='/product/'], .search-result a[href^='/product/']");
                if (!link) return;
                const card = link.closest(".card, .search-result");
                const externalId = decodeURIComponent(link.getAttribute("href").split("/").pop());
                record("product_click", { external_id: externalId, title: card?.querySelector("h3")?.textContent?.trim(), source: "catalog" });
            });
        })();`
    }));
}

function assertSafePayload(payload) {
    const forbidden = /phone|telephone|email|name|customerName|comment|address|consent/i;
    const pii = ["+7 (999) 111-22-33", "person@example.test", "PII Name", "private comment"];
    const visit = value => {
        if (!value || typeof value !== "object") return;
        for (const [key, child] of Object.entries(value)) {
            expect(forbidden.test(key)).toBe(false);
            if (typeof child === "string") pii.forEach(secret => expect(child).not.toContain(secret));
            visit(child);
        }
    };
    visit(payload);
}

async function mockCatalog(page) {
    const product = { id: 9101, externalId: "MAT-TEST", name: "Тестовая смесь", price: 240, weight: 25, unit: "шт", category: "Смеси", subcategory: "Штукатурка", image: "" };
    await page.route("**/api/public/products/structure", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, categories: [{ name: "Смеси", externalCode: "MIXES", subcategories: [{ name: "Штукатурка", externalCode: "PLASTER" }] }] }) }));
    await page.route("**/api/public/products?*", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, products: [product], items: [product], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }) }));
    return product;
}

async function calls(page) { return page.evaluate(() => window.__applicationAnalyticsCalls || JSON.parse(localStorage.getItem("e2e_analytics_calls") || "[]")); }

test.describe("application analytics contracts", () => {
    test("product click and add-to-cart are emitted only on real catalog actions", async ({ page }) => {
        await installApplicationSpy(page);
        const product = await mockCatalog(page);
        await page.route("**/product/MAT-TEST", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body>Тестовая карточка</body></html>" }));
        const productsLoaded = page.waitForResponse(response => new URL(response.url()).pathname === "/api/public/products");
        await page.goto("/catalog");
        await page.evaluate(() => localStorage.removeItem("e2e_analytics_calls"));
        await productsLoaded;
        await page.evaluate(item => {
            const grid = document.querySelector("#productGrid");
            grid.innerHTML = "";
            grid.hidden = false;
            grid.style.display = "grid";
            grid.appendChild(createProductCard(item, item.id));
        }, product);
        const card = page.locator(`.card[data-product-id="${product.id}"]`);
        await expect(card).toBeVisible();
        expect(await calls(page)).toEqual([]);
        await card.locator("h3 a").click();
        await expect(page).toHaveURL(/\/product\/MAT-TEST$/);
        const clickEvents = (await calls(page)).filter(item => item.event === "product_click");
        expect(clickEvents).toHaveLength(1);
        expect(clickEvents[0].payload).toMatchObject({ external_id: "MAT-TEST", source: "catalog" });
        assertSafePayload(clickEvents[0].payload);

        await page.goto("/product/MAT-000001");
        const productExternalId = await page.locator(".product-page").getAttribute("data-external-id");
        await page.locator(".product-page-summary [data-add-product]").click();
        await expect.poll(async () => (await calls(page)).filter(item => item.event === "add_to_cart").length).toBe(1);
        const add = (await calls(page)).find(item => item.event === "add_to_cart");
        expect(add.payload).toMatchObject({ external_id: productExternalId, quantity: 1, source: "product_page" });
        assertSafePayload(add.payload);
    });

    test("one-click emits open, submit and success only after a successful response", async ({ page }) => {
        await installApplicationSpy(page);
        await page.route("**/api/orders/one-click", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, orderNumber: "E2E-1" }) }));
        await page.goto("/product/MAT-000001");
        await page.locator("[data-one-click]").click();
        await page.locator("[data-one-click-form] [name=customerName]").fill("PII Name");
        await page.locator("[data-one-click-form] [name=phone]").fill("+7 (999) 111-22-33");
        await page.locator("[data-one-click-form] [name=quantity]").fill("2");
        await page.locator("[data-one-click-form] [name=comment]").fill("private comment");
        await page.locator("[data-one-click-form] [name=consent]").check();
        await page.locator("[data-one-click-form] [type=submit]").click();
        await expect(page.locator("[data-one-click-message]")).toContainText("Номер заявки");
        const events = await calls(page);
        expect(events.filter(item => item.event === "one_click_open")).toHaveLength(1);
        expect(events.filter(item => item.event === "one_click_submit")).toHaveLength(1);
        expect(events.filter(item => item.event === "one_click_success")).toHaveLength(1);
        expect(events.map(item => item.event).filter(item => item.startsWith("one_click_"))).toEqual(["one_click_open", "one_click_submit", "one_click_success"]);
        events.forEach(item => assertSafePayload(item.payload));
    });

    test("one-click failure emits error without success and keeps modal open", async ({ page }) => {
        await installApplicationSpy(page);
        await page.route("**/api/orders/one-click", route => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Ошибка теста" }) }));
        await page.goto("/product/MAT-000001");
        await page.locator("[data-one-click]").click();
        await page.locator("[data-one-click-form] [name=customerName]").fill("PII Name");
        await page.locator("[data-one-click-form] [name=phone]").fill("+7 (999) 111-22-33");
        await page.locator("[data-one-click-form] [name=consent]").check();
        await page.locator("[data-one-click-form] [type=submit]").click();
        await expect(page.locator("[data-one-click-dialog]")).toBeVisible();
        const events = await calls(page);
        expect(events.filter(item => item.event === "one_click_open")).toHaveLength(1);
        expect(events.filter(item => item.event === "one_click_submit")).toHaveLength(1);
        expect(events.filter(item => item.event === "one_click_error")).toHaveLength(1);
        expect(events.filter(item => item.event === "one_click_success")).toHaveLength(0);
        events.forEach(item => assertSafePayload(item.payload));
    });

    test("search emits query metadata without raw query or PII", async ({ page }) => {
        await installApplicationSpy(page);
        await mockCatalog(page);
        await page.goto("/");
        await page.locator("#searchInput").fill("смесь");
        await expect(page.locator(".search-result")).toHaveCount(1);
        const search = (await calls(page)).find(item => item.event === "search");
        expect(search.payload).toMatchObject({ query_length: 5, results_count: 1, source: "search" });
        expect(search.payload.query).toBeUndefined();
        assertSafePayload(search.payload);
    });

    test("checkout emits begin then success only after order API succeeds", async ({ page }) => {
        await installApplicationSpy(page);
        await page.route("**/api/orders", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, orderNumber: "E2E-CHECKOUT" }) }));
        await page.goto("/product/MAT-000001");
        await page.locator(".product-page-summary [data-add-product]").click();
        await page.goto("/");
        await expect(page.locator("#cartCount")).toHaveText("1");
        await page.locator("#cartBtn").click();
        await page.locator("#openCheckout").click();
        await page.locator("#checkoutForm [name=customerName]").fill("PII Name");
        await page.locator("#checkoutForm [name=customerPhone]").fill("+7 (999) 111-22-33");
        await page.locator("#checkoutForm [name=deliveryAddress]").fill("private address");
        await page.locator("#checkoutForm [name=paymentMethod]").selectOption({ index: 1 });
        await page.locator("#checkoutForm [name=consent]").check();
        await page.locator("#checkoutForm [type=submit]").click();
        await expect(page.locator("#checkoutMessage")).toContainText("Спасибо!");
        const events = await calls(page);
        expect(events.filter(item => item.event === "begin_checkout")).toHaveLength(1);
        expect(events.filter(item => item.event === "checkout_success")).toHaveLength(1);
        expect(events.find(item => item.event === "checkout_error")).toBeUndefined();
        expect(events.map(item => item.event).filter(item => item.startsWith("checkout") || item === "begin_checkout")).toEqual(["begin_checkout", "checkout_success"]);
        events.forEach(item => assertSafePayload(item.payload));
    });

    test("checkout failure emits error without success", async ({ page }) => {
        await installApplicationSpy(page);
        await page.route("**/api/orders", route => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Ошибка теста" }) }));
        await page.goto("/product/MAT-000001");
        await page.locator(".product-page-summary [data-add-product]").click();
        await page.goto("/");
        await page.locator("#cartBtn").click();
        await page.locator("#openCheckout").click();
        await page.locator("#checkoutForm [name=customerName]").fill("PII Name");
        await page.locator("#checkoutForm [name=customerPhone]").fill("+7 (999) 111-22-33");
        await page.locator("#checkoutForm [name=deliveryAddress]").fill("private address");
        await page.locator("#checkoutForm [name=paymentMethod]").selectOption({ index: 1 });
        await page.locator("#checkoutForm [name=consent]").check();
        await page.locator("#checkoutForm [type=submit]").click();
        await expect(page.locator("#checkoutMessage")).not.toHaveText("");
        const events = await calls(page);
        expect(events.filter(item => item.event === "begin_checkout")).toHaveLength(1);
        expect(events.filter(item => item.event === "checkout_error")).toHaveLength(1);
        expect(events.filter(item => item.event === "checkout_success")).toHaveLength(0);
        events.forEach(item => assertSafePayload(item.payload));
    });
});

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

test("enabled runtime config, CSP, loader and product view", async ({ page }) => {
    test.skip(process.env.ANALYTICS_E2E_ENABLED !== "1", "enabled analytics config only");
    let loaderRequests = 0;
    await page.route("https://mc.yandex.ru/metrika/tag.js*", route => { loaderRequests += 1; return route.fulfill({ contentType: "application/javascript", body: "" }); });
    const response = await page.goto("/product/MAT-000001");
    const config = await page.evaluate(() => fetch("/api/public/analytics-config").then(r => r.json()));
    expect(config).toEqual({ yandexMetrikaId: "12345678" });
    const csp = response.headers()["content-security-policy"];
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(csp).toContain("https://mc.yandex.ru");
    await expect.poll(() => loaderRequests).toBe(1);
    const calls = await page.evaluate(() => window.ym?.a || []);
    expect(calls.filter(call => call[1] === "init")).toHaveLength(1);
    expect(calls.find(call => call[1] === "init")[0]).toBe(12345678);
    expect(calls.filter(call => call[1] === "reachGoal" && call[2] === "product_view")).toHaveLength(1);
});

test("enabled provider queues ordered events until loader is ready", async ({ page }) => {
    test.skip(process.env.ANALYTICS_E2E_ENABLED !== "1", "enabled analytics config only");
    let releaseLoader;
    let loaderStarted = false;
    let loaderRequests = 0;
    const loaderGate = new Promise(resolve => { releaseLoader = resolve; });
    await page.route("https://mc.yandex.ru/metrika/tag.js*", async route => {
        loaderRequests += 1;
        loaderStarted = true;
        await loaderGate;
        await route.fulfill({ contentType: "application/javascript", body: "" });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(() => loaderStarted).toBe(true);
    await page.evaluate(() => {
        window.matmixAnalytics.track("product_view", { external_id: "MAT-QUEUE" });
        window.matmixAnalytics.track("cart_open", { source: "header" });
    });
    releaseLoader();
    await expect.poll(() => page.evaluate(() => (window.ym?.a || []).filter(call => call[1] === "reachGoal").length)).toBe(2);
    const goals = await page.evaluate(() => (window.ym.a || []).filter(call => call[1] === "reachGoal").map(call => call[2]));
    expect(goals).toEqual(["product_view", "cart_open"]);
    expect(loaderRequests).toBe(1);
});

test("enabled provider failure is contained and does not block cart interaction", async ({ page }) => {
    test.skip(process.env.ANALYTICS_E2E_ENABLED !== "1", "enabled analytics config only");
    let loaderRequests = 0;
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.route("https://mc.yandex.ru/metrika/tag.js*", route => { loaderRequests += 1; return route.abort(); });
    await page.goto("/product/MAT-000001");
    await expect.poll(() => loaderRequests).toBe(1);
    await page.locator(".product-page-summary [data-add-product]").click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length)).toBe(1);
    expect(pageErrors).toEqual([]);
    expect(loaderRequests).toBe(1);
});
