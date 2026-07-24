const { test, expect } = require("@playwright/test");

async function movePointerOutsideViewport(page) {
    await page.mouse.move(-1, -1);
    await expect.poll(() => page.locator(".hero-actions").evaluate(container =>
        ![...container.querySelectorAll("a, button")].some(action => action.matches(":hover"))
    )).toBe(true);
}

async function seedCartItems(page, count = 24) {
    const items = Array.from({ length: count }, (_, index) => ({
        productId: 98000 + index,
        title: `Тестовый товар с длинным названием для проверки адаптивной корзины ${index + 1}`,
        price: 100 + index,
        weight: 1.25 + index / 10,
        unit: "шт",
        quantity: index % 3 + 1
    }));
    await page.evaluate(cart => localStorage.setItem("matmix_cart", JSON.stringify(cart)), items);
    await page.reload();
}

async function dropUploadFiles(page, files) {
    await page.locator("#uploadDropZone").evaluate((zone, fileSpecs) => {
        const transfer = new DataTransfer();
        fileSpecs.forEach(spec => {
            const content = spec.bytes
                ? new Uint8Array(spec.bytes)
                : new Uint8Array(spec.size || 1);
            transfer.items.add(new File(
                [content],
                spec.name,
                { type: spec.type || "application/octet-stream", lastModified: spec.lastModified || 123456789 }
            ));
        });
        for (const type of ["dragenter", "dragover", "drop"]) {
            zone.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }));
        }
    }, files);
}

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

test("header and footer delivery links share canonical navigation", async ({ page }) => {
    const sourcePaths = ["/", "/catalog"];
    const deliveryLink = container => container.getByRole("link", { name: "Доставка", exact: true });
    const pathname = () => new URL(page.url()).pathname;

    await page.setViewportSize({ width: 1280, height: 900 });
    for (const sourcePath of sourcePaths) {
        await page.goto(sourcePath);
        const headerLink = deliveryLink(page.locator("#mainNav"));
        const footerLink = deliveryLink(page.locator(".footer-buyers"));

        await expect(headerLink).toHaveAttribute("href", "/delivery");
        await expect(footerLink).toHaveAttribute("href", "/delivery");
        expect(await headerLink.getAttribute("href")).toBe(await footerLink.getAttribute("href"));

        await headerLink.click();
        await expect.poll(pathname).toBe("/delivery");
        await expect(page.getByRole("heading", { level: 1, name: "Доставка", exact: true })).toBeVisible();
        await page.goBack();
        await expect.poll(pathname).toBe(sourcePath);

        await deliveryLink(page.locator(".footer-buyers")).click();
        await expect.poll(pathname).toBe("/delivery");
        await expect(page.getByRole("heading", { level: 1, name: "Доставка", exact: true })).toBeVisible();
        await page.goBack();
        await expect.poll(pathname).toBe(sourcePath);
    }

    await page.setViewportSize({ width: 320, height: 800 });
    for (const sourcePath of sourcePaths) {
        await page.goto(sourcePath);
        await page.locator("#menuToggle").click();
        const mobileHeaderLink = deliveryLink(page.locator("#mainNav"));
        await expect(mobileHeaderLink).toBeVisible();
        await expect(mobileHeaderLink).toHaveAttribute("href", "/delivery");
        await mobileHeaderLink.click();
        await expect.poll(pathname).toBe("/delivery");
        await expect(page.getByRole("heading", { level: 1, name: "Доставка", exact: true })).toBeVisible();
    }
});

test("catalog, search, cart persistence and responsive smoke", async ({ page, request }) => {
    await page.goto("/catalog"); await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    await expect(page.locator("#categoryControls button").nth(1)).toBeVisible();
    const search = page.locator('input[type="search"], input[placeholder*="Поиск"]').first(); if (await search.count()) { await search.fill("Ротбанд"); await page.waitForTimeout(500); await search.press("Escape"); await search.fill("<img src=x onerror=alert(1)>"); await page.waitForTimeout(300); }
    const productsResponse = await request.get("/api/public/products?limit=1"); const productsBody = await productsResponse.json(); const product = (productsBody.items || productsBody.products || productsBody.data || [])[0];
    await page.goto(`/product/${product.externalId || product.external_id}`); const add = page.locator("[data-add-product]"); await expect(add).toBeVisible(); await add.click(); await page.reload(); expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.toLowerCase().includes("cart") && localStorage.getItem(key)?.includes("productId")))).toBeTruthy();
    for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) { await page.setViewportSize(viewport); const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, offenders: [...document.querySelectorAll("*")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 5).map(element => `${element.tagName}.${element.className}:${Math.round(element.getBoundingClientRect().right)}`) })); expect(dimensions.scrollWidth, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(dimensions.clientWidth + 1); }
});

test("mobile header stays single-line and expands search without layout shift", async ({ page }) => {
    const viewports = [
        { width: 320, height: 568 },
        { width: 360, height: 800 },
        { width: 375, height: 812 },
        { width: 390, height: 844 },
        { width: 414, height: 896 },
        { width: 430, height: 932 },
        { width: 480, height: 900 }
    ];
    const pages = ["/", "/catalog.html"];
    const searchProduct = {
        id: 9101,
        externalId: "responsive-search-product",
        name: "Длинное название товара для проверки мобильного поиска",
        price: 450,
        weight: 1,
        unit: "шт",
        category: "Тестовая категория",
        subcategory: "Тестовая подкатегория",
        image: ""
    };
    const productResponse = products => ({
        success: true,
        products,
        items: products,
        total: products.length,
        page: 1,
        limit: 50,
        totalPages: 1
    });

    await page.route("**/api/public/products?*", async route => {
        await route.fulfill({ contentType: "application/json", body: JSON.stringify(productResponse([searchProduct])) });
    });

    for (const pathname of pages) {
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto(pathname);

            const compact = await page.evaluate(() => {
                const rect = selector => document.querySelector(selector).getBoundingClientRect();
                const header = rect(".header");
                const logo = rect(".logo");
                const search = rect(".header-search");
                const input = rect("#searchInput");
                const cart = rect("#cartBtn");
                const burger = rect("#menuToggle");
                const badge = document.querySelector("#cartCount").getBoundingClientRect();
                return {
                    header, logo, search, input, cart, burger, badge,
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth
                };
            });

            expect(compact.header.height).toBeCloseTo(56, 0);
            expect(compact.logo.x).toBeLessThan(compact.search.x);
            expect(compact.search.x).toBeLessThan(compact.cart.x);
            expect(compact.cart.x).toBeLessThan(compact.burger.x);
            expect(compact.input.width).toBeGreaterThanOrEqual(44);
            expect(compact.search.height).toBeGreaterThanOrEqual(44);
            expect(compact.input.height).toBe(32);
            expect(Math.abs((compact.input.y + compact.input.height / 2) - (compact.search.y + compact.search.height / 2))).toBeLessThanOrEqual(1);
            expect(compact.cart.width).toBeGreaterThanOrEqual(44);
            expect(compact.cart.height).toBeGreaterThanOrEqual(44);
            expect(compact.burger.width).toBeGreaterThanOrEqual(44);
            expect(compact.burger.height).toBeGreaterThanOrEqual(44);
            expect(compact.search.x + compact.search.width).toBeLessThanOrEqual(compact.cart.x + 1);
            expect(compact.cart.x + compact.cart.width).toBeLessThanOrEqual(compact.burger.x + 1);
            expect(compact.badge.right).toBeLessThanOrEqual(viewport.width + 1);
            expect(compact.scrollWidth).toBeLessThanOrEqual(compact.clientWidth + 1);

            const headerHeightBeforeFocus = compact.header.height;
            const searchInput = page.locator("#searchInput");
            await searchInput.focus();
            await expect(page.locator(".header")).toHaveClass(/is-search-expanded/);
            await searchInput.fill("Очень длинный поисковый запрос, который не должен ломать мобильный header");
            await expect(searchInput).toBeFocused();
            await expect(page.locator(".search-dropdown")).toBeVisible();

            const expanded = await page.evaluate(() => {
                const rect = selector => document.querySelector(selector).getBoundingClientRect();
                return {
                    header: rect(".header"),
                    logoDisplay: getComputedStyle(document.querySelector(".logo")).display,
                    burger: rect("#menuToggle"),
                    search: rect(".header-search"),
                    input: rect("#searchInput"),
                    cart: rect("#cartBtn"),
                    dropdown: rect(".search-dropdown"),
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth
                };
            });

            expect(expanded.header.height).toBeCloseTo(headerHeightBeforeFocus, 0);
            expect(expanded.logoDisplay).toBe("none");
            expect(expanded.burger.x).toBeLessThan(expanded.search.x);
            expect(expanded.search.x).toBeLessThan(expanded.cart.x);
            expect(Math.abs(compact.input.height - expanded.input.height)).toBeLessThanOrEqual(1);
            expect(Math.abs((expanded.input.y + expanded.input.height / 2) - (expanded.search.y + expanded.search.height / 2))).toBeLessThanOrEqual(1);
            expect(expanded.input.height).toBe(32);
            expect(expanded.burger.x + expanded.burger.width).toBeLessThanOrEqual(expanded.search.x + 1);
            expect(expanded.search.x + expanded.search.width).toBeLessThanOrEqual(expanded.cart.x + 1);
            expect(expanded.dropdown.x).toBeGreaterThanOrEqual(0);
            expect(expanded.dropdown.x + expanded.dropdown.width).toBeLessThanOrEqual(viewport.width + 1);
            expect(expanded.dropdown.y).toBeGreaterThanOrEqual(expanded.header.y + expanded.header.height);
            expect(expanded.scrollWidth).toBeLessThanOrEqual(expanded.clientWidth + 1);

            await page.mouse.click(4, Math.min(viewport.height - 4, 300));
            await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
            await expect(searchInput).toHaveValue("Очень длинный поисковый запрос, который не должен ломать мобильный header");
            await expect(page.locator(".search-dropdown")).toBeHidden();
        }
    }

    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await page.evaluate(product => {
        localStorage.setItem("matmix_cart", JSON.stringify([{
            productId: product.id,
            title: product.name,
            price: product.price,
            weight: product.weight,
            unit: product.unit,
            quantity: 1
        }]));
    }, searchProduct);
    await page.reload();
    await expect(page.locator("#cartCount")).toBeVisible();
    await expect(page.locator("#cartCount")).toHaveText("1");
    const badgeGeometry = await page.evaluate(() => {
        const badge = document.querySelector("#cartCount").getBoundingClientRect();
        const burger = document.querySelector("#menuToggle").getBoundingClientRect();
        return { badgeRight: badge.right, burgerLeft: burger.left, viewportWidth: document.documentElement.clientWidth };
    });
    expect(badgeGeometry.badgeRight).toBeLessThanOrEqual(badgeGeometry.burgerLeft);
    expect(badgeGeometry.badgeRight).toBeLessThanOrEqual(badgeGeometry.viewportWidth + 1);
    await page.evaluate(() => localStorage.removeItem("matmix_cart"));
    await page.reload();
    const searchInput = page.locator("#searchInput");
    await searchInput.fill("товар");
    await expect(page.locator(".search-dropdown")).toBeVisible();
    await expect(page.locator(".search-result")).toHaveCount(1);
    await searchInput.press("ArrowDown");
    await expect(page.locator(".search-result.active")).toHaveCount(1);
    await searchInput.press("Escape");
    await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
    await expect(searchInput).toHaveValue("товар");

    await searchInput.focus();
    await expect(page.locator(".search-dropdown")).toBeVisible();
    await expect(page.locator(".search-result")).toHaveCount(1);
    await searchInput.press("ArrowDown");
    await searchInput.press("Enter");
    await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
    await expect(searchInput).toHaveValue("товар");

    await searchInput.focus();
    await page.locator("#menuToggle").click();
    await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
    await expect(page.locator("#mainNav")).toHaveClass(/is-open/);
    await expect(page.locator("#menuToggle")).toHaveAttribute("aria-expanded", "true");
    await page.locator("#menuToggle").click();

    await searchInput.focus();
    await page.locator("#cartBtn").click();
    await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
    await expect(page.locator("#cartModal")).not.toHaveClass(/hidden/);

    await page.locator("#closeCart").click();
    await searchInput.fill("товар");
    await expect(page.locator(".search-dropdown")).toBeVisible();
    const addButton = page.locator(".search-dropdown .add");
    await addButton.click();
    const quantity = page.locator(`.search-dropdown .qty-input[data-id="${searchProduct.id}"]`);
    await expect(quantity).toHaveValue("1");
    await page.locator(".search-dropdown .plus").click();
    await expect(quantity).toHaveValue("2");
    await expect(page.locator(".header")).toHaveClass(/is-search-expanded/);

    await page.setViewportSize({ width: 601, height: 900 });
    await expect(page.locator(".header")).not.toHaveClass(/is-search-expanded/);
    await expect(searchInput).toHaveValue("товар");
});

test("home mobile actions and footer remain usable without horizontal overflow", async ({ page }) => {
    for (const viewport of [
        { width: 320, height: 568 },
        { width: 360, height: 800 },
        { width: 375, height: 812 },
        { width: 390, height: 844 },
        { width: 414, height: 896 },
        { width: 430, height: 932 },
        { width: 480, height: 900 }
    ]) {
        await page.setViewportSize(viewport);
        await page.goto("/");
        await movePointerOutsideViewport(page);
        const measurements = await page.evaluate(() => {
            const box = selector => {
                const element = document.querySelector(selector);
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return {
                    width: rect.width,
                    height: rect.height,
                    left: rect.left,
                    right: rect.right,
                    top: rect.top,
                    bottom: rect.bottom,
                    text: element.textContent.trim(),
                    backgroundColor: style.backgroundColor,
                    borderColor: style.borderColor,
                    borderStyle: style.borderStyle,
                    borderWidth: style.borderWidth,
                    color: style.color
                };
            };
            const boxes = selector => [...document.querySelectorAll(selector)].map(element => {
                const rect = element.getBoundingClientRect();
                return { width: rect.width, height: rect.height, left: rect.left, right: rect.right };
            });
            return {
                heroActions: {
                    contact: box('.hero-actions a[href^="tel:"]'),
                    catalog: box("#homeCatalogButton")
                },
                contactActions: boxes(".contact-actions a"),
                legalLinks: boxes(".footer a"),
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth
            };
        });

        const { contact, catalog } = measurements.heroActions;
        expect(contact.text).toBe("Связаться");
        expect(catalog.text).toBe("В каталог");
        expect(contact.top).toBeLessThan(catalog.top);
        expect(catalog.top - contact.bottom).toBeCloseTo(8, 0);
        expect(Math.abs(contact.left - catalog.left)).toBeLessThanOrEqual(1);
        expect(Math.abs(contact.width - catalog.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(contact.height - catalog.height)).toBeLessThanOrEqual(1);
        expect(contact.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        expect(catalog.backgroundColor).toBe(contact.backgroundColor);
        expect(catalog.borderColor).toBe(contact.borderColor);
        expect(catalog.borderStyle).toBe(contact.borderStyle);
        expect(catalog.borderWidth).toBe(contact.borderWidth);
        expect(catalog.color).toBe(contact.color);
        for (const action of [contact, catalog]) {
            expect(action.width).toBeGreaterThanOrEqual(160);
            expect(action.width).toBeLessThanOrEqual(175);
            expect(action.height).toBeGreaterThanOrEqual(44);
            expect(action.height).toBeLessThanOrEqual(48);
        }

        const geometryBeforeInteraction = { contact, catalog };
        await page.locator('.hero-actions a[href^="tel:"]').hover();
        await page.locator("#homeCatalogButton").focus();
        const geometryAfterInteraction = await page.evaluate(() => {
            const rect = selector => {
                const box = document.querySelector(selector).getBoundingClientRect();
                return { width: box.width, height: box.height, left: box.left, top: box.top };
            };
            return {
                contact: rect('.hero-actions a[href^="tel:"]'),
                catalog: rect("#homeCatalogButton")
            };
        });
        for (const key of ["contact", "catalog"]) {
            expect(geometryAfterInteraction[key].width).toBeCloseTo(geometryBeforeInteraction[key].width, 1);
            expect(geometryAfterInteraction[key].height).toBeCloseTo(geometryBeforeInteraction[key].height, 1);
            expect(geometryAfterInteraction[key].left).toBeCloseTo(geometryBeforeInteraction[key].left, 1);
            expect(geometryAfterInteraction[key].top).toBeCloseTo(geometryBeforeInteraction[key].top, 1);
        }
        for (const action of measurements.contactActions) {
            expect(action.height).toBeGreaterThanOrEqual(44);
            expect(action.left).toBeGreaterThanOrEqual(0);
            expect(action.right).toBeLessThanOrEqual(viewport.width + 1);
        }
        for (const link of measurements.legalLinks) {
            expect(link.height).toBeGreaterThanOrEqual(26);
            expect(link.left).toBeGreaterThanOrEqual(0);
            expect(link.right).toBeLessThanOrEqual(viewport.width + 1);
        }
        expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.clientWidth + 1);
    }
});

test("hero CTA keeps one outline style across mobile and desktop", async ({ page }) => {
    const readActions = () => page.evaluate(() => {
        const read = selector => {
            const element = document.querySelector(selector);
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
                text: element.textContent.trim(),
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                bottom: rect.bottom,
                backgroundColor: style.backgroundColor,
                borderColor: style.borderColor,
                borderStyle: style.borderStyle,
                borderWidth: style.borderWidth,
                borderRadius: style.borderRadius,
                color: style.color
            };
        };
        const heroVisitedRule = [...document.styleSheets]
            .flatMap(sheet => [...sheet.cssRules])
            .find(rule => rule.selectorText?.includes(".hero-actions a:visited"));
        return {
            contact: read('.hero-actions a[href^="tel:"]'),
            catalog: read("#homeCatalogButton"),
            visitedColor: heroVisitedRule?.style.color || "",
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        };
    });

    for (const viewport of [
        { width: 320, height: 568 },
        { width: 414, height: 896 },
        { width: 600, height: 900 },
        { width: 601, height: 900 },
        { width: 768, height: 900 },
        { width: 980, height: 900 },
        { width: 1024, height: 900 },
        { width: 1366, height: 900 },
        { width: 1920, height: 1080 }
    ]) {
        await page.setViewportSize(viewport);
        await page.goto("/");
        await movePointerOutsideViewport(page);
        const initial = await readActions();
        const { contact, catalog } = initial;

        expect(contact.text).toBe("Связаться");
        expect(catalog.text).toBe("В каталог");
        expect(catalog.backgroundColor).toBe("rgba(0, 0, 0, 0)");
        expect(initial.visitedColor).toBe("white");
        for (const property of ["backgroundColor", "borderColor", "borderStyle", "borderWidth", "borderRadius", "color"]) {
            expect(catalog[property]).toBe(contact[property]);
        }
        expect(initial.scrollWidth).toBeLessThanOrEqual(initial.clientWidth + 1);

        if (viewport.width <= 600) {
            expect(contact.top).toBeLessThan(catalog.top);
            expect(catalog.top - contact.bottom).toBeCloseTo(8, 0);
            expect(Math.abs(contact.left - catalog.left)).toBeLessThanOrEqual(1);
            expect(Math.abs(contact.width - catalog.width)).toBeLessThanOrEqual(1);
            expect(Math.abs(contact.height - catalog.height)).toBeLessThanOrEqual(1);
            for (const action of [contact, catalog]) {
                expect(action.width).toBeGreaterThanOrEqual(170);
                expect(action.width).toBeLessThanOrEqual(175);
                expect(action.height).toBe(46);
            }
        } else {
            expect(catalog.top).toBeCloseTo(contact.top, 1);
            expect(catalog.left).toBeLessThan(contact.left);
        }

        await page.locator('.hero-actions a[href^="tel:"]').hover();
        const contactHover = await readActions();
        await page.locator("#homeCatalogButton").hover();
        const catalogHover = await readActions();
        for (const property of ["backgroundColor", "borderColor", "borderStyle", "borderWidth", "borderRadius", "color"]) {
            expect(catalogHover.catalog[property]).toBe(contactHover.contact[property]);
        }

        await page.locator('.hero-actions a[href^="tel:"]').focus();
        const contactFocus = await readActions();
        await page.locator("#homeCatalogButton").focus();
        const catalogFocus = await readActions();
        for (const property of ["backgroundColor", "borderColor", "borderStyle", "borderWidth", "borderRadius", "color"]) {
            expect(catalogFocus.catalog[property]).toBe(contactFocus.contact[property]);
        }
        for (const [state, action] of [
            [contactHover.contact, contact],
            [catalogHover.catalog, catalog],
            [contactFocus.contact, contact],
            [catalogFocus.catalog, catalog]
        ]) {
            expect(state.width).toBeCloseTo(action.width, 1);
            expect(state.height).toBeCloseTo(action.height, 1);
            expect(state.left).toBeCloseTo(action.left, 1);
            expect(state.top).toBeCloseTo(action.top, 1);
        }
    }
});

test("footer keeps three compact semantic groups responsive", async ({ page }) => {
    const paths = ["/", "/catalog.html"];
    const widths = [320, 350, 351, 375, 414, 480, 600, 601, 768, 1024, 1366, 1920];
    const expectedClasses = ["footer-brand", "footer-buyers", "footer-service"];
    const expectedLinks = [
        ["Доставка", "/delivery"],
        ["Оплата", "/payment"],
        ["Возврат", "/returns"],
        ["Реквизиты", "/contacts"],
        ["Политика конф.", "/privacy"],
        ["Условия и Контакты", "/terms"]
    ];

    for (const path of paths) {
        for (const width of widths) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(path);
            const layout = await page.evaluate(() => {
                const footer = document.querySelector(".footer");
                const inner = footer.querySelector(".footer-inner");
                const groups = [...inner.children];
                const links = [...footer.querySelectorAll("a")];
                const rect = element => {
                    const box = element.getBoundingClientRect();
                    return {
                        left: box.left,
                        right: box.right,
                        top: box.top,
                        bottom: box.bottom,
                        width: box.width,
                        height: box.height,
                        clipped: element.scrollWidth > element.clientWidth + 1
                            || element.scrollHeight > element.clientHeight + 1
                    };
                };
                const overlaps = (first, second) => (
                    first.left < second.right - 1
                    && first.right > second.left + 1
                    && first.top < second.bottom - 1
                    && first.bottom > second.top + 1
                );
                const groupBoxes = groups.map(rect);
                let overlapCount = 0;
                for (let first = 0; first < groupBoxes.length; first += 1) {
                    for (let second = first + 1; second < groupBoxes.length; second += 1) {
                        if (overlaps(groupBoxes[first], groupBoxes[second])) overlapCount += 1;
                    }
                }
                const separators = [...footer.querySelectorAll(".footer-separator")];
                const visitedRule = [...document.styleSheets]
                    .flatMap(sheet => [...sheet.cssRules])
                    .find(rule => rule.selectorText?.includes(".footer a:visited"));
                const innerStyle = getComputedStyle(inner);
                const contentTop = Math.min(...groupBoxes.map(box => box.top));
                const contentBottom = Math.max(...groupBoxes.map(box => box.bottom));
                return {
                    directChildClasses: groups.map(group => group.className),
                    groupBoxes,
                    linkBoxes: links.map(rect),
                    overlapCount,
                    innerBox: rect(inner),
                    footerBox: rect(footer),
                    brand: footer.querySelector(".footer-brand").textContent.replace(/\s+/g, " ").trim(),
                    buyers: footer.querySelector(".footer-buyers").textContent.replace(/\s+/g, " ").trim(),
                    service: footer.querySelector(".footer-service").textContent.replace(/\s+/g, " ").trim(),
                    links: links.map(link => [link.textContent.trim(), link.getAttribute("href")]),
                    separators: separators.map(separator => ({
                        text: separator.textContent,
                        ariaHidden: separator.getAttribute("aria-hidden"),
                        tagName: separator.tagName
                    })),
                    oldGroupCount: footer.querySelectorAll(".footer-group, .footer-group-title").length,
                    forbiddenContactCount: footer.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').length,
                    forbiddenText: ["Андрей", "Opt-Mat", "+7 909", "Покупателям", "Документы"]
                        .filter(text => footer.textContent.includes(text)),
                    normalLinkColor: getComputedStyle(links[0]).color,
                    visitedRuleColor: visitedRule?.style.color || "",
                    paddingTop: contentTop - rect(inner).top,
                    paddingBottom: rect(inner).bottom - contentBottom,
                    columnGap: parseFloat(innerStyle.columnGap),
                    rowGap: parseFloat(innerStyle.rowGap) || 0,
                    lineHeight: parseFloat(innerStyle.lineHeight),
                    fontSize: parseFloat(innerStyle.fontSize),
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth
                };
            });

            expect(layout.directChildClasses).toEqual(expectedClasses);
            expect(layout.brand).toBe("© МатМикс Все права защищены");
            expect(layout.buyers).toBe("Доставка· Оплата· Возврат");
            expect(layout.service).toBe("Реквизиты Политика конф. Условия и Контакты");
            expect(layout.links).toEqual(expectedLinks);
            expect(layout.separators).toEqual([
                { text: "·", ariaHidden: "true", tagName: "SPAN" },
                { text: "·", ariaHidden: "true", tagName: "SPAN" }
            ]);
            expect(layout.oldGroupCount).toBe(0);
            expect(layout.forbiddenContactCount).toBe(0);
            expect(layout.forbiddenText).toEqual([]);
            expect(layout.overlapCount).toBe(0);
            expect(layout.normalLinkColor).toBe("rgba(255, 255, 255, 0.92)");
            expect(layout.visitedRuleColor).toBe(layout.normalLinkColor);
            expect(layout.normalLinkColor).not.toBe("rgb(0, 0, 238)");
            expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
            expect(layout.paddingTop).toBeGreaterThanOrEqual(10);
            expect(layout.paddingTop).toBeLessThanOrEqual(16);
            expect(layout.paddingBottom).toBeGreaterThanOrEqual(10);
            expect(layout.paddingBottom).toBeLessThanOrEqual(16);
            expect(layout.lineHeight / layout.fontSize).toBeGreaterThanOrEqual(1.25);
            for (const item of [...layout.groupBoxes, ...layout.linkBoxes]) {
                expect(item.clipped).toBeFalsy();
                expect(item.left).toBeGreaterThanOrEqual(layout.footerBox.left - 1);
                expect(item.right).toBeLessThanOrEqual(layout.footerBox.right + 1);
            }

            const [brand, buyers, service] = layout.groupBoxes;
            if (width <= 350) {
                expect(layout.footerBox.height).toBeLessThanOrEqual(225);
                expect(layout.rowGap).toBeCloseTo(12, 1);
                expect(brand.bottom).toBeLessThanOrEqual(service.top + 1);
                expect(service.bottom).toBeLessThanOrEqual(buyers.top + 1);
                expect(Math.abs(brand.left - service.left)).toBeLessThanOrEqual(1);
                expect(Math.abs(layout.linkBoxes[0].top - layout.linkBoxes[1].top)).toBeLessThanOrEqual(1);
                expect(Math.abs(layout.linkBoxes[1].top - layout.linkBoxes[2].top)).toBeLessThanOrEqual(1);
            } else if (width <= 600) {
                expect(layout.footerBox.height).toBeLessThanOrEqual(170);
                expect(layout.rowGap).toBeCloseTo(14, 1);
                expect(layout.columnGap).toBeCloseTo(20, 1);
                expect(Math.abs(brand.top - service.top)).toBeLessThanOrEqual(1);
                expect(brand.right).toBeLessThanOrEqual(service.left + 1);
                expect(Math.max(brand.bottom, service.bottom)).toBeLessThanOrEqual(buyers.top + 1);
                expect(Math.abs(
                    (buyers.left + buyers.right) / 2 - (layout.innerBox.left + layout.innerBox.right) / 2
                )).toBeLessThanOrEqual(1);
                expect(Math.abs(layout.linkBoxes[0].top - layout.linkBoxes[1].top)).toBeLessThanOrEqual(1);
                expect(Math.abs(layout.linkBoxes[1].top - layout.linkBoxes[2].top)).toBeLessThanOrEqual(1);
            } else {
                expect(layout.footerBox.height).toBeLessThanOrEqual(120);
                expect(layout.columnGap).toBeLessThanOrEqual(56);
                expect(Math.abs(brand.top - buyers.top)).toBeLessThanOrEqual(1);
                expect(Math.abs(buyers.top - service.top)).toBeLessThanOrEqual(1);
                expect(brand.right).toBeLessThanOrEqual(buyers.left + 1);
                expect(buyers.right).toBeLessThanOrEqual(service.left + 1);
                expect(layout.linkBoxes[0].bottom).toBeLessThanOrEqual(layout.linkBoxes[1].top + 1);
                expect(layout.linkBoxes[1].bottom).toBeLessThanOrEqual(layout.linkBoxes[2].top + 1);
                expect(layout.linkBoxes[3].bottom).toBeLessThanOrEqual(layout.linkBoxes[4].top + 1);
                expect(layout.linkBoxes[4].bottom).toBeLessThanOrEqual(layout.linkBoxes[5].top + 1);
            }
        }

        await page.setViewportSize({ width: 768, height: 900 });
        await page.goto(path);
        const footerLinks = page.locator(".footer a");
        await footerLinks.first().hover();
        await expect.poll(() => footerLinks.first().evaluate(element => getComputedStyle(element).color))
            .toBe("rgb(255, 255, 255)");
        await footerLinks.first().focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        for (const [, expectedHref] of expectedLinks) {
            const focusState = await page.evaluate(() => {
                const active = document.activeElement;
                const footerBox = document.querySelector(".footer").getBoundingClientRect();
                const activeBox = active.getBoundingClientRect();
                const style = getComputedStyle(active);
                const outlineSpace = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
                return {
                    href: active.getAttribute("href"),
                    outlineStyle: style.outlineStyle,
                    outlineWidth: parseFloat(style.outlineWidth),
                    color: style.color,
                    outlineInsideFooter: activeBox.left - outlineSpace >= footerBox.left
                        && activeBox.right + outlineSpace <= footerBox.right
                        && activeBox.top - outlineSpace >= footerBox.top
                        && activeBox.bottom + outlineSpace <= footerBox.bottom
                };
            });
            expect(focusState.href).toBe(expectedHref);
            expect(focusState.outlineStyle).not.toBe("none");
            expect(focusState.outlineWidth).toBeGreaterThanOrEqual(2);
            expect(focusState.color).not.toBe("rgb(0, 0, 238)");
            expect(focusState.outlineInsideFooter).toBeTruthy();
            if (expectedHref !== expectedLinks.at(-1)[1]) await page.keyboard.press("Tab");
        }
    }
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

test("cart opens only by activation and keeps accessible controls", async ({ page }) => {
    for (const path of ["/", "/catalog.html"]) {
        await page.goto(path);
        await seedCartItems(page, 4);

        const cartButton = page.locator("#cartBtn");
        const cartModal = page.locator("#cartModal");
        await expect(page.locator("#cartPreview")).toHaveCount(0);
        await expect(cartButton).toHaveAttribute("aria-controls", "cartModal");
        await expect(cartButton).toHaveAttribute("aria-expanded", "false");

        await cartButton.hover();
        await expect(cartModal).toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "false");
        await cartButton.focus();
        await expect(cartModal).toHaveClass(/hidden/);

        await cartButton.click();
        await expect(cartModal).not.toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "true");
        await page.locator("#closeCart").click();
        await expect(cartModal).toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "false");

        await cartButton.focus();
        await cartButton.press("Enter");
        await expect(cartModal).not.toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "true");
        await page.locator("footer").click({ position: { x: 2, y: 2 } });
        await expect(cartModal).toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "false");

        await cartButton.focus();
        await cartButton.press("Space");
        await expect(cartModal).not.toHaveClass(/hidden/);
        await expect(cartButton).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator("#cartView > .cart-header")).toHaveCount(1);
        await expect(page.locator("#cartView > .cart-body")).toHaveCount(1);
        await expect(page.locator("#cartView > .cart-footer")).toHaveCount(1);
        await expect(page.locator(".cart-actions > button")).toHaveText(["Закрыть", "Очистить", "Заказать"]);

        await page.locator("#openCheckout").click();
        await expect(page.locator("#checkoutForm")).toBeVisible();
        await expect(page.locator("#cartView")).toHaveClass(/hidden/);
        await page.locator("#cancelCheckout").click();
        await expect(page.locator("#cartView")).toBeVisible();

        await page.locator("#clearCartBtn").click();
        await expect(page.locator("#clearCartConfirm")).toBeVisible();
        await expect(page.locator("#confirmClearCart")).toBeFocused();
        await page.locator("#cancelClearCart").click();
        await expect(page.locator("#clearCartConfirm")).toBeHidden();
        await expect(page.locator("#clearCartBtn")).toBeFocused();

        await page.locator("#clearCartBtn").click();
        await page.locator("#confirmClearCart").click();
        await expect(page.locator("#cartItems")).toContainText("Корзина пока пустая");
        await expect(page.locator("#clearCartBtn")).toBeDisabled();
        await expect(page.locator("#closeCart")).toBeFocused();
    }
});

test("cart keeps fixed sections and one-row actions across responsive viewports", async ({ page }) => {
    const viewports = [
        { width: 320, height: 568 },
        { width: 350, height: 640 },
        { width: 351, height: 667 },
        { width: 360, height: 736 },
        { width: 375, height: 800 },
        { width: 390, height: 844 },
        { width: 414, height: 896 },
        { width: 480, height: 800 },
        { width: 600, height: 800 },
        { width: 601, height: 800 },
        { width: 768, height: 896 },
        { width: 980, height: 800 },
        { width: 1024, height: 800 },
        { width: 1366, height: 896 },
        { width: 1920, height: 896 },
        { width: 568, height: 320 },
        { width: 667, height: 375 },
        { width: 896, height: 414 }
    ];

    for (const path of ["/", "/catalog.html"]) {
        await page.setViewportSize({ width: 1024, height: 800 });
        await page.goto(path);
        await seedCartItems(page, 36);
        await page.locator("#cartBtn").click();

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            const cartBody = page.locator(".cart-body");
            await cartBody.evaluate(element => { element.scrollTop = 0; });
            const before = await page.locator("#cartView").evaluate(view => {
                const box = selector => {
                    const rect = view.querySelector(selector).getBoundingClientRect();
                    return { top: rect.top, bottom: rect.bottom };
                };
                return { header: box(".cart-header"), footer: box(".cart-footer") };
            });
            await cartBody.evaluate(element => { element.scrollTop = element.scrollHeight; });
            await expect.poll(() => cartBody.evaluate(element => element.scrollTop)).toBeGreaterThan(0);

            const dimensions = await page.evaluate(() => {
                const rect = selector => {
                    const box = document.querySelector(selector).getBoundingClientRect();
                    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
                };
                const modal = document.querySelector("#cartModal");
                const body = document.querySelector(".cart-body");
                const actions = [...document.querySelectorAll(".cart-actions > button")];
                const actionRects = actions.map(button => ({ ...rect(`#${button.id}`), clipped: button.scrollWidth > button.clientWidth + 1 }));
                const totals = [...document.querySelectorAll("#cartTotal > span")].map(element => element.getBoundingClientRect());
                return {
                    modal: rect("#cartModal"),
                    header: rect(".cart-header"),
                    body: rect(".cart-body"),
                    footer: rect(".cart-footer"),
                    modalScrollTop: modal.scrollTop,
                    bodyScrollTop: body.scrollTop,
                    modalOverflowY: getComputedStyle(modal).overflowY,
                    bodyOverflowY: getComputedStyle(body).overflowY,
                    actionRects,
                    totals: totals.map(box => ({ top: box.top, bottom: box.bottom })),
                    documentScrollWidth: document.documentElement.scrollWidth,
                    documentClientWidth: document.documentElement.clientWidth
                };
            });

            expect(dimensions.modal.left, JSON.stringify({ path, viewport, dimensions })).toBeGreaterThanOrEqual(-1);
            expect(dimensions.modal.right, JSON.stringify({ path, viewport, dimensions })).toBeLessThanOrEqual(viewport.width + 1);
            expect(dimensions.modal.top, JSON.stringify({ path, viewport, dimensions })).toBeGreaterThanOrEqual(0);
            expect(dimensions.modal.bottom, JSON.stringify({ path, viewport, dimensions })).toBeLessThanOrEqual(viewport.height + 1);
            expect(dimensions.modalScrollTop).toBe(0);
            expect(dimensions.bodyScrollTop).toBeGreaterThan(0);
            expect(dimensions.modalOverflowY).toBe("hidden");
            expect(dimensions.bodyOverflowY).toBe("auto");
            expect(Math.abs(dimensions.header.top - before.header.top)).toBeLessThanOrEqual(1);
            expect(Math.abs(dimensions.footer.bottom - before.footer.bottom)).toBeLessThanOrEqual(1);
            expect(Math.max(...dimensions.actionRects.map(box => box.top)) - Math.min(...dimensions.actionRects.map(box => box.top))).toBeLessThanOrEqual(1);
            expect(dimensions.actionRects.every(box => !box.clipped)).toBeTruthy();
            expect(dimensions.actionRects[0].right).toBeLessThanOrEqual(dimensions.actionRects[1].left + 1);
            expect(dimensions.actionRects[1].right).toBeLessThanOrEqual(dimensions.actionRects[2].left + 1);
            expect(Math.max(...dimensions.totals.map(box => box.top)) - Math.min(...dimensions.totals.map(box => box.top))).toBeLessThanOrEqual(1);
            expect(dimensions.documentScrollWidth).toBeLessThanOrEqual(dimensions.documentClientWidth + 1);
        }

        await page.setViewportSize({ width: 320, height: 568 });
        await page.locator("#openCheckout").click();
        await expect(page.locator("#checkoutForm")).toBeVisible();
        const checkoutGeometry = await page.evaluate(() => {
            const modal = document.querySelector("#cartModal");
            const form = document.querySelector("#checkoutForm");
            return {
                modalScrollTop: modal.scrollTop,
                modalScrollHeight: modal.scrollHeight,
                modalClientHeight: modal.clientHeight,
                modalOverflowY: getComputedStyle(modal).overflowY,
                formScrollTop: form.scrollTop,
                formScrollHeight: form.scrollHeight,
                formClientHeight: form.clientHeight,
                formOverflowY: getComputedStyle(form).overflowY,
                formBottom: form.getBoundingClientRect().bottom,
                viewportHeight: innerHeight
            };
        });
        expect(checkoutGeometry.modalScrollTop, JSON.stringify(checkoutGeometry)).toBe(0);
        expect(checkoutGeometry.modalOverflowY).toBe("hidden");
        expect(checkoutGeometry.formOverflowY).toBe("auto");
        expect(checkoutGeometry.formBottom).toBeLessThanOrEqual(checkoutGeometry.viewportHeight + 1);
        await page.locator("#cancelCheckout").click();
    }
});

test("upload request entry points and tabs use the existing modal accessibly", async ({ page }) => {
    for (const path of ["/", "/catalog.html"]) {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto(path);
        await seedCartItems(page, 2);

        await expect(page.locator("#cartModal")).toHaveCount(1);
        const headerUpload = page.locator("#mainNav #uploadRequestNav");
        await expect(headerUpload).toHaveText("Загрузить заявку");
        await headerUpload.click();
        await expect(page.locator("#cartModal")).not.toHaveClass(/hidden/);
        await expect(page.locator("#checkoutView")).toBeVisible();
        await expect(page.locator("#uploadRequestForm")).toBeVisible();
        await expect(page.locator("#checkoutForm")).toBeHidden();
        await expect(page.locator("#uploadRequestTab")).toHaveAttribute("aria-selected", "true");
        await expect(page.locator("#orderCheckoutTab")).toHaveAttribute("aria-selected", "false");
        await expect(page.locator("#uploadDropZone")).toBeFocused();
        expect(await page.locator("#checkoutForm").evaluate(panel =>
            [...panel.querySelectorAll("input, select, textarea, button, a")].every(element => element.offsetParent === null)
        )).toBeTruthy();

        await dropUploadFiles(page, [{ name: "materials.pdf", type: "application/pdf", size: 24 }]);
        await expect(page.locator(".upload-file-item")).toHaveCount(1);
        await page.locator("#orderCheckoutTab").click();
        await expect(page.locator("#orderCheckoutTab")).toHaveAttribute("aria-selected", "true");
        await expect(page.locator("#uploadRequestForm")).toBeHidden();
        await page.locator("#uploadRequestTab").press("ArrowLeft");
        await expect(page.locator("#orderCheckoutTab")).toBeFocused();
        await page.locator("#orderCheckoutTab").press("ArrowRight");
        await expect(page.locator("#uploadRequestTab")).toBeFocused();
        await expect(page.locator("#uploadRequestForm")).toBeVisible();
        await expect(page.locator(".upload-file-item")).toHaveCount(1);

        await page.locator("footer").click({ position: { x: 2, y: 2 } });
        await expect(page.locator("#cartModal")).toHaveClass(/hidden/);
        await headerUpload.click();
        await expect(page.locator("#uploadRequestForm")).toBeVisible();
        await expect(page.locator(".upload-file-item")).toHaveCount(0);

        await page.locator("#cancelUploadRequest").click();
        await page.locator("#openCheckout").click();
        await expect(page.locator("#checkoutForm")).toBeVisible();
        await expect(page.locator("#orderCheckoutTab")).toHaveAttribute("aria-selected", "true");
        await page.locator("#cancelCheckout").click();
        await page.locator("#openUploadRequest").click();
        await expect(page.locator("#uploadRequestForm")).toBeVisible();
        await expect(page.locator("#uploadRequestTab")).toHaveAttribute("aria-selected", "true");
    }

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    await page.locator("#searchInput").focus();
    await expect(page.locator(".header")).toHaveClass(/is-search-expanded/);
    await page.locator("#menuToggle").click();
    await expect(page.locator("#mainNav")).toHaveClass(/is-open/);
    await page.locator("#mainNav #uploadRequestNav").click();
    await expect(page.locator("#mainNav")).not.toHaveClass(/is-open/);
    await expect(page.locator("#menuToggle")).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#uploadRequestForm")).toBeVisible();
    await expect(page.locator("#uploadDropZone")).toBeFocused();
});

test("upload request file rules and validation submit to the secure endpoint", async ({ page }) => {
    let orderPostCount = 0;
    let fileRequestPostCount = 0;
    await page.route("**/api/orders/file-request", async route => {
        await new Promise(resolve => setTimeout(resolve, 150));
        await route.continue();
    });
    page.on("request", request => {
        if (request.method() !== "POST") return;
        const pathname = new URL(request.url()).pathname;
        if (pathname === "/api/orders") orderPostCount += 1;
        if (pathname === "/api/orders/file-request") fileRequestPostCount += 1;
    });

    await page.goto("/");
    await seedCartItems(page, 2);
    await page.locator("#uploadRequestNav").click();
    const fileInput = page.locator("#uploadRequestFiles");
    await expect(fileInput).toHaveAttribute("multiple", "");
    await expect(fileInput).toHaveAttribute("accept", ".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.csv");
    await expect(page.locator("[data-file-count], .upload-file-count")).toHaveCount(0);

    await page.locator("#uploadDropZone").evaluate(zone => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(["x"], "drag.pdf", { type: "application/pdf" }));
        zone.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    });
    await expect(page.locator("#uploadDropZone")).toHaveClass(/is-drag-over/);
    await page.locator("#uploadDropZone").evaluate(zone => {
        zone.dispatchEvent(new DragEvent("dragleave", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }));
    });
    await expect(page.locator("#uploadDropZone")).not.toHaveClass(/is-drag-over/);

    await dropUploadFiles(page, [{ name: "materials.pdf", type: "application/pdf", size: 32, lastModified: 1 }]);
    await expect(page.locator(".upload-file-item")).toHaveCount(1);
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator("#uploadDropZone").press("Enter");
    const fileChooser = await fileChooserPromise;
    expect(fileChooser.isMultiple()).toBeTruthy();
    await fileChooser.setFiles({ name: "plan.png", mimeType: "image/png", buffer: Buffer.from("png") });
    await expect(page.locator(".upload-file-item")).toHaveCount(2);
    expect(await fileInput.evaluate(input => input.files.length)).toBe(2);

    await dropUploadFiles(page, [{ name: "materials.pdf", type: "application/pdf", size: 32, lastModified: 1 }]);
    await expect(page.locator(".upload-file-item")).toHaveCount(2);
    await expect(page.locator("#uploadFileError")).toContainText("уже выбран");
    await page.locator(".upload-file-remove").first().click();
    await expect(page.locator(".upload-file-item")).toHaveCount(1);
    expect(await fileInput.evaluate(input => input.files.length)).toBe(1);
    await dropUploadFiles(page, [{ name: "materials.pdf", type: "application/pdf", size: 32, lastModified: 1 }]);
    await expect(page.locator(".upload-file-item")).toHaveCount(2);

    await dropUploadFiles(page, [{ name: "unsafe.exe", size: 10 }]);
    await expect(page.locator("#uploadFileError")).toContainText("неподдерживаемый формат");
    await dropUploadFiles(page, [{ name: "large.pdf", type: "application/pdf", size: 15 * 1024 * 1024 + 1 }]);
    await expect(page.locator("#uploadFileError")).toContainText("превышает лимит 15 МБ");

    await page.locator("#cancelUploadRequest").click();
    await page.locator("#uploadRequestNav").click();
    await dropUploadFiles(page, Array.from({ length: 6 }, (_, index) => ({
        name: `file-${index + 1}.pdf`,
        type: "application/pdf",
        size: 10,
        lastModified: index + 10
    })));
    await expect(page.locator(".upload-file-item")).toHaveCount(5);
    await expect(page.locator("#uploadFileError")).toContainText("не более 5 файлов");

    await page.locator("#cancelUploadRequest").click();
    await page.locator("#uploadRequestNav").click();
    await dropUploadFiles(page, Array.from({ length: 4 }, (_, index) => ({
        name: `volume-${index + 1}.pdf`,
        type: "application/pdf",
        size: 13 * 1024 * 1024,
        lastModified: index + 20
    })));
    await expect(page.locator(".upload-file-item")).toHaveCount(3);
    await expect(page.locator("#uploadFileError")).toContainText("50 МБ");

    await page.locator("#cancelUploadRequest").click();
    await page.locator("#uploadRequestNav").click();
    await dropUploadFiles(page, [{
        name: "request.pdf",
        type: "application/pdf",
        bytes: [...Buffer.from("%PDF-1.4\n%%EOF", "ascii")]
    }]);
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await expect(page.locator("#uploadCustomerName")).toBeFocused();
    await expect(page.locator("#uploadRequestMessage")).not.toContainText("отправлена");

    await page.locator("#uploadCustomerName").fill("Иван");
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadRequestComment").fill("Нужен расчёт материалов");
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await expect(page.locator("#uploadConsentError")).toContainText("Подтвердите согласие");
    await expect(page.locator("#uploadRequestConsent")).toBeFocused();

    await page.locator("#uploadRequestConsent").check();
    await page.locator("#uploadIncludeCart").uncheck();
    await page.locator("#uploadRequestForm button[type='submit']").evaluate(button => {
        button.click();
        button.click();
    });
    await expect(page.locator("#uploadRequestForm button[type='submit']")).toBeDisabled();
    await expect(page.locator("#uploadRequestMessage")).toContainText(/Заявка №MM-\d{4}-\d{6} принята/);
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/success/);
    expect(orderPostCount).toBe(0);
    expect(fileRequestPostCount).toBe(1);
    await expect(page.locator(".upload-file-item")).toHaveCount(0);
    expect(await fileInput.evaluate(input => input.files.length)).toBe(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length)).toBe(2);

    const paymentLabels = await page.locator("#uploadPaymentMethod option").allTextContents();
    expect(paymentLabels).toEqual(["Наличные", "Перевод на карту", "Терминал", "Безнал — с НДС", "Безнал — без НДС"]);
});

test("file request submission works with cart, without cart and on both public pages", async ({ page, request }) => {
    const productsResponse = await request.get("/api/public/products?limit=1");
    const productsBody = await productsResponse.json();
    const product = (productsBody.items || productsBody.products || productsBody.data || [])[0];
    const productId = Number(product.id);
    expect(productId).toBeGreaterThan(0);

    for (const [index, pathname] of ["/", "/catalog.html"].entries()) {
        await page.goto(pathname);
        if (index === 0) {
            await page.evaluate(item => localStorage.setItem("matmix_cart", JSON.stringify([item])), {
                productId,
                title: product.title || product.name,
                price: product.price,
                weight: product.weight,
                unit: product.unit,
                quantity: 2
            });
            await page.reload();
        } else {
            await page.evaluate(() => localStorage.setItem("matmix_cart", "[]"));
            await page.reload();
        }

        await page.locator("#uploadRequestNav").click();
        if (index === 0) {
            await expect(page.locator("#uploadCartOption")).toBeVisible();
            await expect(page.locator("#uploadIncludeCart")).toBeChecked();
        } else {
            await expect(page.locator("#uploadCartOption")).toBeHidden();
        }
        await page.locator("#uploadCustomerName").fill(`Тестовая заявка ${index + 1}`);
        await page.locator("#uploadCustomerPhone").fill("9991234567");
        await page.locator("#uploadCustomerEmail").fill(`request-${index + 1}@example.test`);
        await page.locator("#uploadRequestComment").fill("Нужен расчёт материалов по приложенным файлам");
        await page.locator("#uploadRequestConsent").check();
        const files = [{
            name: `request-${index + 1}.pdf`,
            type: "application/pdf",
            bytes: [...Buffer.from("%PDF-1.4\n%%EOF", "ascii")]
        }];
        if (index === 1) {
            files.push({
                name: "materials.csv",
                type: "text/csv",
                bytes: [...Buffer.from("code,qty\nMAT-E2E-001,2\n", "utf8")]
            });
        }
        await dropUploadFiles(page, files);
        await page.locator("#uploadRequestForm button[type='submit']").click();
        await expect(page.locator("#uploadRequestMessage")).toContainText(/Заявка №MM-\d{4}-\d{6} принята/);
        await expect(page.locator("#uploadRequestMessage")).toHaveClass(/success/);
        await expect(page.locator(".upload-file-item")).toHaveCount(0);
        const cartLength = await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length);
        expect(cartLength).toBe(index === 0 ? 1 : 0);
    }

    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    await page.locator("#menuToggle").click();
    await page.locator("#mainNav #uploadRequestNav").click();
    await expect(page.locator("#uploadRequestForm")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
});

test("file request server errors keep the form retryable", async ({ page }) => {
    await page.route("**/api/orders/file-request", route => route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
            success: false,
            code: "FILE_REQUEST_FAILED",
            message: "Тестовая ошибка отправки"
        })
    }));
    await page.goto("/");
    await page.locator("#uploadRequestNav").click();
    await page.locator("#uploadCustomerName").fill("Тестовый клиент");
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadRequestComment").fill("Повторить отправку после ошибки");
    await page.locator("#uploadRequestConsent").check();
    await dropUploadFiles(page, [{
        name: "retry.pdf",
        type: "application/pdf",
        bytes: [...Buffer.from("%PDF-1.4\n%%EOF", "ascii")]
    }]);

    const submit = page.locator("#uploadRequestForm button[type='submit']");
    await submit.click();
    await expect(page.locator("#uploadRequestMessage")).toHaveText("Тестовая ошибка отправки");
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/error/);
    await expect(submit).toBeEnabled();
    await expect(submit).toHaveText("Отправить заявку");
    await expect(page.locator(".upload-file-item")).toHaveCount(1);
});

test("upload request cart option and layout remain responsive", async ({ page }) => {
    const viewports = [
        { width: 320, height: 568 },
        { width: 350, height: 640 },
        { width: 351, height: 667 },
        { width: 360, height: 736 },
        { width: 375, height: 800 },
        { width: 390, height: 844 },
        { width: 414, height: 896 },
        { width: 480, height: 800 },
        { width: 600, height: 800 },
        { width: 601, height: 800 },
        { width: 768, height: 896 },
        { width: 980, height: 800 },
        { width: 1024, height: 800 },
        { width: 1366, height: 896 },
        { width: 1920, height: 896 },
        { width: 568, height: 320 },
        { width: 667, height: 375 },
        { width: 896, height: 414 }
    ];

    await page.goto("/");
    await page.locator("#uploadRequestNav").click();
    await expect(page.locator("#uploadCartOption")).toBeHidden();
    await expect(page.locator("#uploadIncludeCart")).toBeDisabled();
    await page.locator("#cancelUploadRequest").click();
    await seedCartItems(page, 2);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator("#cartBtn").click();
    const cartHeaderGeometry = await page.locator(".cart-header").evaluate(header => {
        const title = header.querySelector("h3").getBoundingClientRect();
        const button = header.querySelector("#openUploadRequest").getBoundingClientRect();
        return { scrollWidth: header.scrollWidth, clientWidth: header.clientWidth, titleRight: title.right, buttonLeft: button.left };
    });
    expect(cartHeaderGeometry.scrollWidth).toBeLessThanOrEqual(cartHeaderGeometry.clientWidth + 1);
    expect(cartHeaderGeometry.titleRight).toBeLessThanOrEqual(cartHeaderGeometry.buttonLeft + 1);
    await page.locator("#openUploadRequest").click();
    await expect(page.locator("#uploadCartOption")).toBeVisible();
    await expect(page.locator("#uploadIncludeCart")).toBeChecked();
    const uploadCartText = page.locator("#uploadCartOption label span");
    const uploadCartGeometry = await page.locator("#uploadCartOption label").evaluate(label => {
        const input = label.querySelector("input").getBoundingClientRect();
        const text = label.querySelector("span").getBoundingClientRect();
        return {
            inputLeft: input.left,
            inputRight: input.right,
            inputCenter: input.top + input.height / 2,
            textLeft: text.left,
            textCenter: text.top + text.height / 2,
            scrollWidth: label.scrollWidth,
            clientWidth: label.clientWidth
        };
    });
    expect(uploadCartGeometry.inputLeft).toBeLessThan(uploadCartGeometry.textLeft);
    expect(uploadCartGeometry.inputRight).toBeLessThanOrEqual(uploadCartGeometry.textLeft);
    expect(Math.abs(uploadCartGeometry.inputCenter - uploadCartGeometry.textCenter)).toBeLessThanOrEqual(1);
    expect(uploadCartGeometry.scrollWidth).toBeLessThanOrEqual(uploadCartGeometry.clientWidth + 1);
    await uploadCartText.click();
    await expect(page.locator("#uploadIncludeCart")).not.toBeChecked();
    await page.locator("#orderCheckoutTab").click();
    await page.locator("#uploadRequestTab").click();
    await expect(page.locator("#uploadIncludeCart")).not.toBeChecked();

    await dropUploadFiles(page, [{
        name: `${"очень-длинное-название-".repeat(8)}материалов.xlsx`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 40
    }]);

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        const panel = page.locator("#uploadRequestForm");
        await panel.evaluate(form => { form.scrollTop = form.scrollHeight; });
        const dimensions = await page.evaluate(() => {
            const rect = selector => {
                const box = document.querySelector(selector).getBoundingClientRect();
                return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
            };
            const modal = document.querySelector("#cartModal");
            const panel = document.querySelector("#uploadRequestForm");
            const tabs = [...document.querySelectorAll(".checkout-tab")].map(tab => ({ ...rect(`#${tab.id}`), clipped: tab.scrollWidth > tab.clientWidth + 1 }));
            const submit = rect("#uploadRequestForm button[type='submit']");
            return {
                modal: rect("#cartModal"),
                panel: rect("#uploadRequestForm"),
                dropZone: rect("#uploadDropZone"),
                fileItem: rect(".upload-file-item"),
                submit,
                tabs,
                uploadCart: (() => {
                    const label = document.querySelector("#uploadCartOption label");
                    const input = label.querySelector("input").getBoundingClientRect();
                    const text = label.querySelector("span").getBoundingClientRect();
                    return {
                        inputLeft: input.left,
                        inputRight: input.right,
                        inputCenter: input.top + input.height / 2,
                        textLeft: text.left,
                        textCenter: text.top + text.height / 2,
                        scrollWidth: label.scrollWidth,
                        clientWidth: label.clientWidth
                    };
                })(),
                modalScrollTop: modal.scrollTop,
                panelScrollTop: panel.scrollTop,
                documentScrollWidth: document.documentElement.scrollWidth,
                documentClientWidth: document.documentElement.clientWidth
            };
        });

        expect(dimensions.modal.left, JSON.stringify({ viewport, dimensions })).toBeGreaterThanOrEqual(-1);
        expect(dimensions.modal.right, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(viewport.width + 1);
        expect(dimensions.modal.bottom, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(viewport.height + 1);
        expect(dimensions.modalScrollTop).toBe(0);
        expect(dimensions.panelScrollTop).toBeGreaterThan(0);
        expect(Math.abs(dimensions.tabs[0].top - dimensions.tabs[1].top)).toBeLessThanOrEqual(1);
        expect(dimensions.tabs[0].right).toBeLessThanOrEqual(dimensions.tabs[1].left + 1);
        expect(dimensions.tabs.every(tab => !tab.clipped)).toBeTruthy();
        expect(dimensions.dropZone.left).toBeGreaterThanOrEqual(dimensions.panel.left - 1);
        expect(dimensions.dropZone.right).toBeLessThanOrEqual(dimensions.panel.right + 1);
        expect(dimensions.fileItem.right).toBeLessThanOrEqual(dimensions.panel.right + 1);
        expect(dimensions.uploadCart.inputLeft).toBeLessThan(dimensions.uploadCart.textLeft);
        expect(dimensions.uploadCart.inputRight).toBeLessThanOrEqual(dimensions.uploadCart.textLeft);
        expect(Math.abs(dimensions.uploadCart.inputCenter - dimensions.uploadCart.textCenter)).toBeLessThanOrEqual(1);
        expect(dimensions.uploadCart.scrollWidth).toBeLessThanOrEqual(dimensions.uploadCart.clientWidth + 1);
        expect(dimensions.submit.bottom).toBeLessThanOrEqual(dimensions.modal.bottom + 1);
        expect(dimensions.documentScrollWidth).toBeLessThanOrEqual(dimensions.documentClientWidth + 1);
    }
});

test("accessibility and performance smoke", async ({ page }) => {
    const started = Date.now(); let requests = 0; page.on("request", () => { requests += 1; });
    await page.goto("/"); const loadMs = Date.now() - started;
    expect(await page.locator("h1").count()).toBe(1); expect(await page.locator("img:not([alt])").count()).toBe(0); expect(await page.locator("button:not([aria-label])").evaluateAll(items => items.filter(item => !item.textContent.trim()).length)).toBe(0);
    await page.keyboard.press("Tab"); expect(await page.evaluate(() => document.activeElement !== document.body)).toBeTruthy();
    const metrics = await page.evaluate(() => ({ resources: performance.getEntriesByType("resource").length, transfer: performance.getEntriesByType("resource").reduce((sum, item) => sum + (item.transferSize || 0), 0), navigation: performance.getEntriesByType("navigation")[0]?.duration || 0 }));
    expect(loadMs).toBeLessThan(10000); expect(requests).toBeLessThan(100); expect(metrics.transfer).toBeLessThan(15 * 1024 * 1024);
});
