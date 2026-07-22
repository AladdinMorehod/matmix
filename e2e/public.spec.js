const { test, expect } = require("@playwright/test");

test("public pages, legal navigation and security headers", async ({ page }) => {
    const consoleErrors = []; const failed = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", request => {
        const failure = request.failure()?.errorText || "";
        if (failure.includes("ERR_ABORTED")) return;
        failed.push(`${request.method()} ${request.url()} — ${failure}`);
    });
    const response = await page.goto("/"); expect(response.status()).toBe(200);
    await expect(page.locator("header")).toBeVisible(); await expect(page.locator(".hero")).toBeVisible(); await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    const headers = response.headers(); expect(headers["x-frame-options"]).toBe("DENY"); expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    for (const route of ["/privacy", "/terms", "/delivery", "/payment", "/returns", "/contacts", "/legal"]) { await page.goto(route); await expect(page.locator("h1")).toBeVisible(); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(route)); }
    expect(consoleErrors).toEqual([]); expect(failed).toEqual([]);
    const notFound = await page.goto("/not-a-real-page-e2e"); expect(notFound.status()).toBe(404);
});

test("catalog, search, cart persistence and responsive smoke", async ({ page, request }) => {
    await page.goto("/catalog"); await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.locator("#categoryControls button").nth(1)).toBeVisible();
    const search = page.locator('input[type="search"], input[placeholder*="Поиск"]').first(); if (await search.count()) { await search.fill("Ротбанд"); await page.waitForTimeout(500); await search.press("Escape"); await search.fill("<img src=x onerror=alert(1)>"); await page.waitForTimeout(300); }
    const productsResponse = await request.get("/api/public/products?limit=1"); const productsBody = await productsResponse.json(); const product = (productsBody.items || productsBody.products || productsBody.data || [])[0];
    await page.goto(`/product/${product.externalId || product.external_id}`); const add = page.locator("[data-add-product]"); await expect(add).toBeVisible(); await add.click(); await page.reload(); expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.toLowerCase().includes("cart") && localStorage.getItem(key)?.includes("productId")))).toBeTruthy();
    for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) { await page.setViewportSize(viewport); const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, offenders: [...document.querySelectorAll("*")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 5).map(element => `${element.tagName}.${element.className}:${Math.round(element.getBoundingClientRect().right)}`) })); expect(dimensions.scrollWidth, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(dimensions.clientWidth + 1); }
});

test("cart quantity works when the product is outside the current catalog page", async ({ page }) => {
    const category = "Тестовая категория";
    const subcategory = "Целевая подкатегория";
    const targetProduct = { id: 9001, externalId: "cart-target", name: "Товар из популярного", price: 125, weight: 2, unit: "шт", category, subcategory, image: "" };
    const rootProduct = { id: 9002, externalId: "catalog-root", name: "Товар корневой выдачи", price: 75, weight: 1, unit: "шт", category, subcategory: "Другая подкатегория", image: "" };
    const productResponse = products => ({ success: true, products, items: products, total: products.length, page: 1, limit: 50, totalPages: 1 });

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, categories: [{ name: category, subcategories: [{ name: subcategory, groups: [] }, { name: "Другая подкатегория", groups: [] }] }] })
    }));
    await page.route("**/api/public/products?*", async route => {
        const url = new URL(route.request().url());
        const products = url.searchParams.has("search") || url.searchParams.get("subcategory") === subcategory
            ? [targetProduct]
            : [rootProduct];
        await route.fulfill({ contentType: "application/json", body: JSON.stringify(productResponse(products)) });
    });

    const readCartQuantity = productId => page.evaluate(id => {
        const cart = JSON.parse(localStorage.getItem("matmix_cart") || "[]");
        return cart.find(item => Number(item.productId ?? item.id) === id)?.quantity ?? null;
    }, productId);

    await page.goto("/");
    const popularCard = page.locator(`#popularGrid [data-product-id="${targetProduct.id}"]`);
    await expect(popularCard).toContainText(targetProduct.name);
    await popularCard.locator(".add").click();
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBe(1);

    await page.goto("/catalog.html");
    await expect(page.locator(`.card[data-product-id="${targetProduct.id}"]`)).toHaveCount(0);
    await page.locator("#cartBtn").click();
    const cartItem = page.locator(`.cart-item:has(.qty-input[data-id="${targetProduct.id}"])`);
    const quantityInput = cartItem.locator(".qty-input");
    await expect(cartItem).toContainText(targetProduct.name);

    await cartItem.locator(".plus").click();
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBe(2);
    await cartItem.locator(".minus").click();
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBe(1);
    await quantityInput.fill("7");
    await quantityInput.press("Enter");
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBe(7);

    await page.reload();
    await page.locator("#cartBtn").click();
    await expect(quantityInput).toHaveValue("7");
    await quantityInput.fill("1");
    await quantityInput.press("Enter");
    await cartItem.locator(".minus").click();
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBeNull();
    await expect(cartItem).toHaveCount(0);

    await page.evaluate(product => {
        localStorage.setItem("matmix_cart", JSON.stringify([{ productId: product.id, title: product.name, price: product.price, weight: product.weight, unit: product.unit, quantity: 1 }]));
    }, targetProduct);
    await page.reload();
    await page.getByRole("button", { name: category, exact: true }).click();
    await page.getByRole("button", { name: subcategory, exact: true }).click();
    await expect(page.locator(`#productGrid [data-product-id="${targetProduct.id}"]`)).toBeVisible();
    await page.locator("#cartBtn").click();
    await cartItem.locator(".plus").click();
    await expect.poll(() => readCartQuantity(targetProduct.id)).toBe(2);
});

test("accessibility and performance smoke", async ({ page }) => {
    const started = Date.now(); let requests = 0; page.on("request", () => { requests += 1; });
    await page.goto("/"); const loadMs = Date.now() - started;
    expect(await page.locator("h1").count()).toBe(1); expect(await page.locator("img:not([alt])").count()).toBe(0); expect(await page.locator("button:not([aria-label])").evaluateAll(items => items.filter(item => !item.textContent.trim()).length)).toBe(0);
    await page.keyboard.press("Tab"); expect(await page.evaluate(() => document.activeElement !== document.body)).toBeTruthy();
    const metrics = await page.evaluate(() => ({ resources: performance.getEntriesByType("resource").length, transfer: performance.getEntriesByType("resource").reduce((sum, item) => sum + (item.transferSize || 0), 0), navigation: performance.getEntriesByType("navigation")[0]?.duration || 0 }));
    expect(loadMs).toBeLessThan(10000); expect(requests).toBeLessThan(100); expect(metrics.transfer).toBeLessThan(15 * 1024 * 1024);
});
