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
                legalLinks: boxes(".footer-group a"),
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
        for (const action of [...measurements.contactActions, ...measurements.legalLinks]) {
            expect(action.height).toBeGreaterThanOrEqual(44);
            expect(action.left).toBeGreaterThanOrEqual(0);
            expect(action.right).toBeLessThanOrEqual(viewport.width + 1);
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

test("footer keeps semantic groups ordered and responsive", async ({ page }) => {
    const paths = ["/", "/catalog.html"];
    const widths = [320, 375, 414, 601, 700, 768, 820, 980, 1024, 1366, 1440, 1920];
    const expectedGroups = ["company", "contacts", "owner", "buyers", "documents"];

    for (const path of paths) {
        for (const width of widths) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(path);
            const layout = await page.evaluate(() => {
                const footer = document.querySelector(".footer");
                const groups = [...footer.querySelectorAll(".footer-inner > .footer-group")];
                const rect = element => {
                    const box = element.getBoundingClientRect();
                    return {
                        left: box.left,
                        right: box.right,
                        top: box.top,
                        bottom: box.bottom,
                        width: box.width,
                        height: box.height,
                        clipped: element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
                    };
                };
                const overlaps = (first, second) => (
                    first.left < second.right - 1
                    && first.right > second.left + 1
                    && first.top < second.bottom - 1
                    && first.bottom > second.top + 1
                );
                const groupName = element => [...element.classList]
                    .find(name => name.startsWith("footer-group-") && name !== "footer-group-links")
                    .replace("footer-group-", "");
                const groupBoxes = groups.map(rect);
                const visualOrder = groups
                    .map((element, index) => ({ name: groupName(element), index, ...rect(element) }))
                    .sort((a, b) => Math.abs(a.top - b.top) > 1 ? a.top - b.top : a.left - b.left)
                    .map(item => item.name);
                const childOutsideGroup = groups.some((group, index) => {
                    const groupBox = groupBoxes[index];
                    return [...group.children].some(child => {
                        const childBox = rect(child);
                        return childBox.left < groupBox.left - 1
                            || childBox.right > groupBox.right + 1
                            || childBox.top < groupBox.top - 1
                            || childBox.bottom > groupBox.bottom + 1;
                    });
                });
                let overlapCount = 0;
                for (let first = 0; first < groupBoxes.length; first += 1) {
                    for (let second = first + 1; second < groupBoxes.length; second += 1) {
                        if (overlaps(groupBoxes[first], groupBoxes[second])) overlapCount += 1;
                    }
                }
                const links = [...footer.querySelectorAll("a")];
                const footerVisitedRule = [...document.styleSheets]
                    .flatMap(sheet => [...sheet.cssRules])
                    .find(rule => rule.selectorText?.includes(".footer-group a:visited"));
                const titleGaps = groups
                    .map(group => {
                        const title = group.querySelector(".footer-group-title");
                        const content = group.querySelector(".footer-group-links");
                        if (!title || !content) return null;
                        return content.getBoundingClientRect().top - title.getBoundingClientRect().bottom;
                    })
                    .filter(value => value !== null);
                return {
                    groupNames: groups.map(groupName),
                    visualOrder,
                    groupBoxes,
                    linkBoxes: links.map(rect),
                    overlapCount,
                    childOutsideGroup,
                    company: footer.querySelector(".footer-group-company").textContent.trim(),
                    contacts: footer.querySelector(".footer-group-contacts").textContent.replace(/\s+/g, " ").trim(),
                    owner: footer.querySelector(".footer-group-owner").textContent.replace(/\s+/g, " ").trim(),
                    buyers: footer.querySelector(".footer-group-buyers").textContent.replace(/\s+/g, " ").trim(),
                    documents: footer.querySelector(".footer-group-documents").textContent.replace(/\s+/g, " ").trim(),
                    contactsIndex: groups.findIndex(group => group.classList.contains("footer-group-contacts")),
                    ownerIndex: groups.findIndex(group => group.classList.contains("footer-group-owner")),
                    contactsBox: rect(footer.querySelector(".footer-group-contacts")),
                    ownerBox: rect(footer.querySelector(".footer-group-owner")),
                    buyersBox: rect(footer.querySelector(".footer-group-buyers")),
                    documentsBox: rect(footer.querySelector(".footer-group-documents")),
                    normalLinkColor: getComputedStyle(links[0]).color,
                    visitedRuleColor: footerVisitedRule?.style.color || "",
                    titleGaps,
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth
                };
            });

            expect(layout.groupNames).toEqual(expectedGroups);
            expect(layout.visualOrder).toEqual(expectedGroups);
            expect(layout.contactsIndex).toBeLessThan(layout.ownerIndex);
            expect(layout.company).toBe("МатМикс");
            expect(layout.contacts).toContain("Контакты +7 909 944-33-83 Opt-Mat@mail.ru");
            expect(layout.owner).toBe("Андрей Дмитриевич Все права защищены");
            expect(layout.buyers).toContain("Покупателям Доставка Оплата Возврат");
            expect(layout.documents).toContain("Документы Политика конфиденциальности Условия Контакты и реквизиты");
            expect(layout.overlapCount).toBe(0);
            expect(layout.childOutsideGroup).toBeFalsy();
            expect(layout.normalLinkColor).toBe("rgba(255, 255, 255, 0.92)");
            expect(layout.visitedRuleColor).toBe(layout.normalLinkColor);
            expect(layout.normalLinkColor).not.toBe("rgb(0, 0, 238)");
            for (const gap of layout.titleGaps) expect(gap).toBeCloseTo(8, 1);
            expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
            for (const item of [...layout.groupBoxes, ...layout.linkBoxes]) expect(item.clipped).toBeFalsy();

            if (width <= 600) {
                expect(layout.contactsBox.bottom).toBeLessThanOrEqual(layout.ownerBox.top + 1);
                expect(layout.buyersBox.top).toBeCloseTo(layout.documentsBox.top, 1);
                expect(layout.buyersBox.right).toBeLessThanOrEqual(layout.documentsBox.left + 1);
                for (const link of layout.linkBoxes) expect(link.height).toBeGreaterThanOrEqual(44);
            }
        }

        await page.setViewportSize({ width: 768, height: 900 });
        await page.goto(path);
        const footerLinks = page.locator(".footer a");
        const expectedTabOrder = [
            "tel:+79099443383",
            "mailto:Opt-Mat@mail.ru",
            "/delivery",
            "/payment",
            "/returns",
            "/privacy",
            "/terms",
            "/contacts"
        ];
        await footerLinks.first().hover();
        await expect.poll(() => footerLinks.first().evaluate(element => getComputedStyle(element).color))
            .toBe("rgb(255, 255, 255)");
        await footerLinks.first().focus();
        for (let index = 0; index < expectedTabOrder.length; index += 1) {
            await expect.poll(() => page.evaluate(() => getComputedStyle(document.activeElement).color))
                .toBe("rgb(255, 255, 255)");
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
            expect(focusState.href).toBe(expectedTabOrder[index]);
            expect(focusState.outlineStyle).not.toBe("none");
            expect(focusState.outlineWidth).toBeGreaterThanOrEqual(2);
            expect(focusState.color).toBe("rgb(255, 255, 255)");
            expect(focusState.outlineInsideFooter).toBeTruthy();
            if (index < expectedTabOrder.length - 1) await page.keyboard.press("Tab");
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

test("accessibility and performance smoke", async ({ page }) => {
    const started = Date.now(); let requests = 0; page.on("request", () => { requests += 1; });
    await page.goto("/"); const loadMs = Date.now() - started;
    expect(await page.locator("h1").count()).toBe(1); expect(await page.locator("img:not([alt])").count()).toBe(0); expect(await page.locator("button:not([aria-label])").evaluateAll(items => items.filter(item => !item.textContent.trim()).length)).toBe(0);
    await page.keyboard.press("Tab"); expect(await page.evaluate(() => document.activeElement !== document.body)).toBeTruthy();
    const metrics = await page.evaluate(() => ({ resources: performance.getEntriesByType("resource").length, transfer: performance.getEntriesByType("resource").reduce((sum, item) => sum + (item.transferSize || 0), 0), navigation: performance.getEntriesByType("navigation")[0]?.duration || 0 }));
    expect(loadMs).toBeLessThan(10000); expect(requests).toBeLessThan(100); expect(metrics.transfer).toBeLessThan(15 * 1024 * 1024);
});
