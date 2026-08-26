const { test, expect } = require("@playwright/test");
const sharp = require("sharp");
const { createDocFixture, createDocxFixture } = require("../backend/scripts/word-file-fixtures");

const WORD_UPLOAD_ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function movePointerOutsideViewport(page) {
    await page.mouse.move(-1, -1);
    await expect.poll(() => page.locator(".hero-actions").evaluate(container =>
        ![...container.querySelectorAll("a, button")].some(action => action.matches(":hover"))
    )).toBe(true);
}

async function openUploadRequestFromHeader(page) {
    const uploadRequestLink = page.locator("#mainNav #uploadRequestNav");
    const menuToggle = page.locator("#menuToggle");
    if (await menuToggle.isVisible()) {
        await menuToggle.click();
        await expect(uploadRequestLink).toBeInViewport();
    }
    await uploadRequestLink.click();
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

test("public home copies the current contact email without navigation", async ({ page, context }) => {
    const consoleErrors = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    const emailButton = page.locator("#copyContactEmail");
    const toast = page.locator("#contactEmailToast");
    const initialUrl = page.url();
    const initialPageCount = context.pages().length;
    const readClipboard = () => page.evaluate(() => navigator.clipboard.readText());
    const clearClipboard = () => page.evaluate(() => navigator.clipboard.writeText(""));

    await expect(emailButton).toHaveText("orders@matmix.ru");
    await expect(emailButton).not.toHaveAttribute("href", /mailto:/);
    expect((await page.content()).toLowerCase()).not.toContain("opt-mat@mail.ru");

    await emailButton.click();
    await expect.poll(readClipboard).toBe("orders@matmix.ru");
    await expect(toast).toHaveText("Почта скопирована");
    await expect(toast).toBeVisible();

    for (const activation of ["click", "Enter", "Space"]) {
        await clearClipboard();
        activation === "click" ? await emailButton.click() : await emailButton.press(activation);
        await expect.poll(readClipboard).toBe("orders@matmix.ru");
    }
    await expect(toast).toBeHidden({ timeout: 4000 });
    expect(page.url()).toBe(initialUrl);
    expect(context.pages()).toHaveLength(initialPageCount);

    await page.evaluate(() => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
        document.execCommand = command => {
            if (command !== "copy") return false;
            window.__fallbackContactEmail = document.activeElement?.value || "";
            return true;
        };
    });
    await emailButton.click();
    await expect.poll(() => page.evaluate(() => window.__fallbackContactEmail)).toBe("orders@matmix.ru");
    await expect(toast).toHaveText("Почта скопирована");
    await expect(page.locator("[data-copy-fallback]")).toHaveCount(0);
    await page.evaluate(() => { document.execCommand = () => false; });
    await emailButton.click();
    await expect(toast).toHaveText("Не удалось скопировать почту");
    expect(consoleErrors).toEqual([]);
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
    await page.goto(`/product/${product.externalId || product.external_id}`); const add = page.locator(".product-page-summary [data-add-product]"); await expect(add).toBeVisible(); await add.click(); await page.reload(); expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.toLowerCase().includes("cart") && localStorage.getItem(key)?.includes("productId")))).toBeTruthy();
    for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) { await page.setViewportSize(viewport); const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, offenders: [...document.querySelectorAll("*")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 5).map(element => `${element.tagName}.${element.className}:${Math.round(element.getBoundingClientRect().right)}`) })); expect(dimensions.scrollWidth, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(dimensions.clientWidth + 1); }
});

test("public product cards link to canonical product pages without hijacking cart actions", async ({ page, request }) => {
    const response = await request.get("/api/public/products?limit=1");
    const body = await response.json();
    const product = (body.products || body.items || body.data || [])[0];
    expect(product).toBeTruthy();
    await page.route("**/api/public/products?*", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            products: [product],
            items: [product],
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
        })
    }));
    const productsRenderResponse = page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.pathname === "/api/public/products" && response.status() === 200;
    });
    await page.goto("/catalog");
    await productsRenderResponse;
    await page.evaluate(item => {
        const grid = document.querySelector("#productGrid");
        grid.innerHTML = "";
        grid.hidden = false;
        grid.style.display = "grid";
        grid.appendChild(createProductCard(item, item.id));
    }, product);
    const card = page.locator("#productGrid .card").first();
    await expect(card).toBeVisible();
    const expectedHref = await card.locator(".card-info h3 a").getAttribute("href");
    expect(expectedHref).toMatch(/^\/product\/.+/);
    const code = decodeURIComponent(expectedHref.split("/").at(-1));
    await expect(card.locator("a.thumb")).toHaveAttribute("href", expectedHref);
    await expect(card.locator(".card-info h3 a")).toHaveAttribute("href", expectedHref);
    expect(await card.locator("a").evaluateAll(anchors => anchors.some(anchor => anchor.querySelector("button")))).toBeFalsy();
    await card.locator(".card-info h3 a").press("Enter");
    await expect(page).toHaveURL(new RegExp(`/product/${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await page.goto("/catalog");
    await page.waitForTimeout(750);
    await page.evaluate(item => {
        const grid = document.querySelector("#productGrid");
        grid.innerHTML = "";
        grid.hidden = false;
        grid.style.display = "grid";
        grid.appendChild(createProductCard(item, item.id));
    }, product);
    await expect(page.locator("#productGrid .card").first()).toBeVisible();
    await page.evaluate(() => localStorage.setItem("matmix_cart", "[]"));
    const catalogPath = new URL(page.url()).pathname;
    await card.locator(".add").click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length)).toBe(1);
    expect(new URL(page.url()).pathname).toBe(catalogPath);

    const searchHref = await page.evaluate(item => getProductPageHref(item), product);
    expect(searchHref).toBe(expectedHref);
    const missingExternalId = await page.evaluate(() => {
        const fixture = createProductCard({ name: "Без кода", price: 1, unit: "шт" }, 999999);
        return { anchorCount: fixture.querySelectorAll("a").length, buttonCount: fixture.querySelectorAll("button").length };
    });
    expect(missingExternalId.anchorCount).toBe(0);
    expect(missingExternalId.buttonCount).toBe(1);

    await page.goto(`/product/${code}`);
    const related = page.locator(".product-page-related .card").first();
    if (await related.count()) {
        await expect(related.locator("a.thumb")).toHaveAttribute("href", /\/product\//);
        await expect(related.locator(".card-info h3 a")).toHaveAttribute("href", /\/product\//);
        expect(await related.locator("a").evaluateAll(anchors => anchors.some(anchor => anchor.querySelector("button")))).toBeFalsy();
        await page.setViewportSize({ width: 375, height: 812 });
        const relatedGrid = page.locator(".product-page-related-grid");
        const beforeUrl = page.url();
        await relatedGrid.evaluate(element => { element.scrollLeft = element.scrollWidth; });
        expect(page.url()).toBe(beforeUrl);
    }
});

test("SSR product page supports gallery, quantity, cart and responsive layouts", async ({ page, request }, testInfo) => {
    const sourceResponse = await request.get("/api/public/products?limit=1");
    const sourceBody = await sourceResponse.json();
    const source = (sourceBody.items || sourceBody.products || sourceBody.data || [])[0];
    expect(source).toBeTruthy();

    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin");
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);

    const suffix = `${testInfo.project.name.replace(/\W+/g, "_")}_${Date.now()}`;
    const create = await page.request.post("/api/products", { data: {
        title: `SSR товар ${suffix}`,
        category: source.category,
        subcategory: source.subcategory,
        productGroup: source.productGroup || source.product_group || "SSR группа",
        price: 720,
        weight: 3,
        unit: "шт",
        description: "Старое описание",
        isActive: true
    } });
    expect(create.status()).toBe(201);
    const product = (await create.json()).product;
    const definitionResponse = await page.request.post("/api/products/attribute-definitions", { data: {
        code: `e2e_ssr_${product.id}`,
        label: "Расход смеси",
        dataType: "number",
        defaultUnit: "кг/м²",
        defaultSection: "Применение",
        sortOrder: 1,
        isActive: true
    } });
    expect(definitionResponse.status()).toBe(201);
    const definition = (await definitionResponse.json()).definition;
    const contentResponse = await page.request.patch(`/api/products/${product.id}/content`, { data: {
        brand: "MatMix Test",
        shortDescription: "Короткое описание товара",
        fullDescription: "Первая строка\n<script>не исполнять</script>",
        seoTitle: "SSR SEO title",
        seoDescription: "SSR SEO description",
        attributes: [{ definitionId: definition.id, value: 2.5, unitOverride: "кг/м²", sortOrder: 1 }]
    } });
    expect(contentResponse.ok()).toBeTruthy();

    const images = await Promise.all(["#4f8f5f", "#7a2632"].map(background => sharp({ create: { width: 32, height: 32, channels: 3, background } }).png().toBuffer()));
    for (const [index, name] of ["primary.png", "secondary.png"].entries()) {
        const upload = await page.request.post(`/api/products/${product.id}/gallery`, { multipart: { image: { name, mimeType: "image/png", buffer: images[index] } } });
        expect(upload.status()).toBe(201);
    }

    const fallbackCreate = await page.request.post("/api/products", { data: {
        title: `SSR товар без фото ${suffix}`,
        category: source.category,
        subcategory: source.subcategory,
        productGroup: source.productGroup || source.product_group || "SSR группа",
        price: 0,
        weight: 0,
        unit: "шт",
        description: "",
        isActive: true
    } });
    expect(fallbackCreate.status()).toBe(201);
    const fallbackProduct = (await fallbackCreate.json()).product;
    const descriptionOnlyCreate = await page.request.post("/api/products", { data: {
        title: `SSR товар с описанием ${suffix}`,
        category: source.category,
        subcategory: source.subcategory,
        productGroup: source.productGroup || source.product_group || "SSR группа",
        price: 150,
        weight: 1,
        unit: "шт",
        description: "Описание без характеристик",
        isActive: true
    } });
    expect(descriptionOnlyCreate.status()).toBe(201);
    const descriptionOnlyProduct = (await descriptionOnlyCreate.json()).product;

    const code = product.externalId || product.external_id;
    const noJsResponse = await request.get(`/product/${code}`);
    const noJsHtml = await noJsResponse.text();
    expect(noJsResponse.status()).toBe(200);
    expect(noJsHtml).toContain("Расход смеси");
    expect(noJsHtml).toContain("2.5 кг/м²");
    expect(noJsHtml).toContain("&lt;script&gt;не исполнять&lt;/script&gt;");
    expect(noJsHtml).not.toContain("<script>не исполнять</script>");

    await page.goto(`/product/${code}`);
    await expect(page.getByRole("heading", { level: 1, name: product.title })).toBeVisible();
    await expect(page.locator("header.header #searchInput")).toBeVisible();
    await expect(page.locator("header.header #cartBtn")).toBeVisible();
    await expect(page.locator("header.header #mainNav")).toContainText("Загрузить заявку");
    await expect(page.locator("footer.footer .footer-inner")).toContainText("Все права защищены");
    await expect(page.locator(".product-page-summary .product-page-benefits")).toHaveCount(1);
    await expect(page.locator(".product-page > .product-page-benefits")).toHaveCount(0);
    await expect(page.locator(".product-page-supply")).toHaveText("Подтвердим наличие, цену и срок доставки после оформления заявки.");
    await expect(page.locator(".product-page-content-nav a")).toHaveText(["Характеристики", "Описание", "Доставка и оплата"]);
    await expect(page.getByText("Корзина пуста", { exact: true })).toHaveCount(0);
    await expect(page.locator("[data-gallery-thumbnail]")).toHaveCount(2);
    const mainImage = page.locator("[data-gallery-main]");
    const initialImage = await mainImage.getAttribute("src");
    await page.locator("[data-gallery-thumbnail]").nth(1).click();
    await expect(mainImage).not.toHaveAttribute("src", initialImage);

    await page.evaluate(() => localStorage.setItem("matmix_cart", "[]"));
    await page.reload();
    await page.locator("[data-quantity-plus]").click();
    await page.locator("[data-quantity-plus]").click();
    await page.locator(".product-page-summary [data-add-product]").click();
    await expect(page.locator("[data-cart-count]")).toHaveText("Товар добавлен в корзину");
    await expect(page.locator("#cartCount")).toHaveText("1");
    await page.locator("#cartBtn").click();
    await expect(page.locator(`#cartItems .cart-item:has(.qty-input[data-id="${product.id}"])`)).toBeVisible();
    await page.locator("#closeCart").click();
    const cartItem = await page.evaluate(id => JSON.parse(localStorage.getItem("matmix_cart") || "[]").find(item => Number(item.productId) === Number(id)), product.id);
    expect(cartItem.quantity).toBe(3);

    await page.locator("[data-one-click]").click();
    await expect(page.locator("[data-one-click-dialog]")).toBeVisible();
    await expect(page.locator("[data-one-click-form] [name=customerName]")).toBeVisible();
    await page.locator("[data-one-click-form] [name=customerName]").fill("Однокликовый клиент");
    await page.locator("[data-one-click-form] [name=phone]").fill("+7 (999) 555-12-34");
    await page.locator("[data-one-click-form] [name=quantity]").fill("2");
    await page.locator("[data-one-click-form] [name=comment]").fill("Комментарий заявки");
    await page.locator("[data-one-click-form] [name=consent]").check();
    await page.locator("[data-one-click-form] [type=submit]").click();
    await expect(page.locator("[data-one-click-message]")).toContainText("Заявка принята. Менеджер свяжется с вами для подтверждения цены, наличия и срока поставки.");
    await expect(page.locator("[data-one-click-message]")).toContainText("Номер заявки:");
    await expect(page.locator("[data-one-click-dialog]")).toBeHidden({ timeout: 5000 });

    for (const viewport of [
        { width: 320, height: 800 }, { width: 360, height: 800 }, { width: 375, height: 812 },
        { width: 390, height: 844 }, { width: 430, height: 900 }, { width: 1024, height: 768 },
        { width: 1280, height: 900 }, { width: 1366, height: 768 }, { width: 1440, height: 900 },
        { width: 1920, height: 1080 }
    ]) {
        await page.setViewportSize(viewport);
        const layout = await page.evaluate(() => ({
            innerWidth: window.innerWidth,
            mobileMedia: matchMedia("(max-width: 800px)").matches,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            imageRight: document.querySelector("[data-gallery-main]").getBoundingClientRect().right,
            imageHeight: document.querySelector("[data-gallery-main]").getBoundingClientRect().height,
            heroColumns: getComputedStyle(document.querySelector(".product-page-hero")).gridTemplateColumns,
            offenders: [...document.querySelectorAll("body *")].filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 8).map(element => ({ selector: `${element.tagName}.${element.className}`, right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) }))
        }));
        expect(layout.scrollWidth, JSON.stringify({ viewport, layout })).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(layout.imageRight).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(layout.imageHeight).toBeLessThanOrEqual(480);
        await expect(page.locator(".product-page-summary [data-add-product]")).toBeVisible();
        const benefitsLayout = await page.locator(".product-page-benefits").evaluate(element => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
        expect(benefitsLayout.scrollWidth).toBeLessThanOrEqual(benefitsLayout.clientWidth + 1);
        if (viewport.width <= 430) {
            const relatedScroll = await page.locator(".product-page-related-grid").evaluate(element => ({
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
                overflowX: getComputedStyle(element).overflowX,
                scrollbarWidth: getComputedStyle(element).scrollbarWidth,
                scrollSnapType: getComputedStyle(element).scrollSnapType,
                cardSnap: getComputedStyle(element.querySelector(".card")).scrollSnapAlign
            }));
            expect(relatedScroll.scrollWidth).toBeGreaterThan(relatedScroll.clientWidth);
            expect(relatedScroll.overflowX).toBe("auto");
            expect(relatedScroll.scrollbarWidth).toBe("none");
            expect(relatedScroll.scrollSnapType).toContain("x");
            expect(relatedScroll.cardSnap).toBe("start");
        }
    }


    const fallbackCode = fallbackProduct.externalId || fallbackProduct.external_id;
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/product/${fallbackCode}`);
    await expect(page.locator(".product-page-image-empty")).toContainText("Фото скоро появятся");
    await expect(page.locator(".product-page-price")).toContainText("Цена по запросу");
    await expect(page.locator("#productCharacteristics")).toHaveCount(0);
    await expect(page.locator("#productDescription")).toHaveCount(0);
    await expect(page.locator(".product-page-content-nav")).toHaveCount(0);
    await expect(page.locator("#productDelivery")).toBeVisible();
    await expect(page.locator(".product-page-related .card").first()).toBeVisible();
    const fallbackLayout = await page.evaluate(() => {
        const placeholder = document.querySelector(".product-page-image-empty").getBoundingClientRect();
        return {
            placeholderHeight: placeholder.height,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        };
    });
    expect(fallbackLayout.placeholderHeight).toBeLessThanOrEqual(350);
    expect(fallbackLayout.scrollWidth).toBeLessThanOrEqual(fallbackLayout.clientWidth + 1);

    const descriptionOnlyCode = descriptionOnlyProduct.externalId || descriptionOnlyProduct.external_id;
    await page.goto(`/product/${descriptionOnlyCode}`);
    await expect(page.locator("#productCharacteristics")).toHaveCount(0);
    await expect(page.locator("#productDescription")).toBeVisible();
    await expect(page.locator("#productDelivery")).toBeVisible();
    await expect(page.locator(".product-page-content-nav a")).toHaveText(["Описание", "Доставка и оплата"]);
});

test("one-click validation error keeps modal and entered fields", async ({ page, request }) => {
    const response = await request.get("/api/public/products?limit=1");
    const body = await response.json();
    const product = (body.items || body.products || body.data || [])[0];
    expect(product).toBeTruthy();
    await page.goto(`/product/${product.externalId || product.external_id}`);
    await page.locator("[data-one-click]").click();
    await page.locator("[data-one-click-form] [name=customerName]").fill("Проверка ошибки");
    await page.locator("[data-one-click-form] [name=phone]").fill("123");
    await page.locator("[data-one-click-form] [name=quantity]").fill("4");
    await page.locator("[data-one-click-form] [name=comment]").fill("Комментарий не теряется");
    await page.locator("[data-one-click-form] [name=consent]").check();
    await page.locator("[data-one-click-form] [type=submit]").click();
    await expect(page.locator("[data-one-click-dialog]")).toBeVisible();
    await expect(page.locator("[data-one-click-message]")).toContainText("корректный российский номер");
    await expect(page.locator("[data-one-click-form] [name=customerName]")).toHaveValue("Проверка ошибки");
    await expect(page.locator("[data-one-click-form] [name=phone]")).toHaveValue("123");
    await expect(page.locator("[data-one-click-form] [name=quantity]")).toHaveValue("4");
    await expect(page.locator("[data-one-click-form] [name=comment]")).toHaveValue("Комментарий не теряется");
});

test("catalog categories use one two-row horizontal scroller", async ({ page }) => {
    const categories = Array.from({ length: 18 }, (_, index) => ({
        name: `Категория ${index + 1} с длинным названием`,
        subcategories: []
    }));

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, categories })
    }));
    await page.route("**/api/public/products?*", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, products: [], items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 } })
    }));

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/catalog");
    const desktopGeometry = await page.locator(".category-main-list").evaluate(element => ({
        display: getComputedStyle(element).display,
        flexWrap: getComputedStyle(element).flexWrap,
        overflowX: getComputedStyle(element).overflowX
    }));
    expect(desktopGeometry.display).toBe("flex");
    expect(desktopGeometry.flexWrap).toBe("wrap");
    expect(desktopGeometry.overflowX).toBe("visible");
    await page.locator("#categoryControls .category-control.level-0").first().click();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/catalog");
    const scroller = page.locator(".category-main-list");
    await expect(scroller).toBeVisible();
    const mobileGeometry = await scroller.evaluate(element => ({
        display: getComputedStyle(element).display,
        rows: getComputedStyle(element).gridTemplateRows.split(" ").length,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        buttonParents: [...element.querySelectorAll("button")].every(button => button.parentElement === element)
    }));
    expect(mobileGeometry.display).toBe("grid");
    expect(mobileGeometry.rows).toBe(2);
    expect(mobileGeometry.scrollWidth).toBeGreaterThan(mobileGeometry.clientWidth);
    expect(mobileGeometry.buttonParents).toBeTruthy();

    await scroller.evaluate(element => { element.scrollLeft = 0; });
    await scroller.dispatchEvent("wheel", { deltaY: 240, deltaMode: 0 });
    await expect.poll(() => scroller.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);

    const activeCategory = page.locator("#categoryControls .category-control.level-0").first();
    await activeCategory.click();
    await expect(activeCategory).toHaveClass(/active/);
});

test("search selects query on re-entry and keeps results after mobile scroll blur", async ({ page }) => {
    const products = Array.from({ length: 14 }, (_, index) => ({
        id: 9700 + index,
        name: `Ротбанд тестовый товар ${index + 1}`,
        price: 100 + index,
        weight: 1,
        unit: "шт",
        category: "Смеси",
        subcategory: "Штукатурка",
        image: ""
    }));

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, categories: [] })
    }));
    await page.route("**/api/public/products?*", async route => {
        const search = new URL(route.request().url()).searchParams.get("search");
        const result = search ? products : [];
        await route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({ success: true, products: result, items: result, pagination: { page: 1, limit: 50, total: result.length, totalPages: 1 } })
        });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const input = page.locator("#searchInput");
    await input.fill("ротб");
    await expect(page.locator(".search-result")).toHaveCount(products.length);
    await page.locator(".search-result .add").first().click();
    await input.click();
    const selection = await input.evaluate(element => ({ start: element.selectionStart, end: element.selectionEnd, length: element.value.length }));
    expect(selection.start).toBe(0);
    expect(selection.end).toBe(selection.length);
    await page.keyboard.type("цеме");
    await expect(input).toHaveValue("цеме");
    await input.click({ position: { x: 12, y: 16 } });
    const caret = await input.evaluate(element => ({ start: element.selectionStart, end: element.selectionEnd }));
    expect(caret.start).toBe(caret.end);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await input.fill("ротб");
    await expect(page.locator(".search-result")).toHaveCount(products.length);
    const dropdown = page.locator(".search-dropdown");
    await expect.poll(() => dropdown.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
    await input.focus();
    await dropdown.evaluate(element => {
        const touch = (type, y) => {
            const event = new Event(type, { bubbles: true });
            Object.defineProperty(event, "touches", { value: [{ clientY: y }] });
            element.dispatchEvent(event);
        };
        touch("touchstart", 200);
        touch("touchmove", 206);
    });
    await expect(input).toBeFocused();
    await dropdown.evaluate(element => {
        const event = new Event("touchmove", { bubbles: true });
        Object.defineProperty(event, "touches", { value: [{ clientY: 220 }] });
        element.dispatchEvent(event);
    });
    await expect(input).not.toBeFocused();
    await expect(dropdown).toBeVisible();
    await expect(input).toHaveValue("ротб");
    await input.click();
    const mobileSelection = await input.evaluate(element => ({ start: element.selectionStart, end: element.selectionEnd, length: element.value.length }));
    expect(mobileSelection.start).toBe(0);
    expect(mobileSelection.end).toBe(mobileSelection.length);
});

test("catalog shows all subcategory products before optional group filtering", async ({ page }) => {
    const category = "Смеси";
    const plaster = "Штукатурка";
    const adhesives = "Клеи";
    const emptySubcategory = "Пустая подкатегория";
    const sharedGroup = "Общая группа";
    const products = [
        { id: 9201, externalId: "plaster-shared", name: "Штукатурка общая", price: 100, weight: 1, unit: "шт", category, subcategory: plaster, productGroup: sharedGroup, image: "" },
        { id: 9202, externalId: "plaster-gypsum", name: "Штукатурка гипсовая", price: 200, weight: 1, unit: "шт", category, subcategory: plaster, productGroup: "Гипсовая", image: "" },
        { id: 9203, externalId: "adhesive-shared", name: "Клей общий", price: 300, weight: 1, unit: "шт", category, subcategory: adhesives, productGroup: sharedGroup, image: "" }
    ];
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            categories: [{
                name: category,
                subcategories: [
                    { name: plaster, groups: [{ name: sharedGroup }, { name: "Гипсовая" }] },
                    { name: adhesives, groups: [{ name: sharedGroup }] },
                    { name: emptySubcategory, groups: [{ name: "Пустая группа" }] }
                ]
            }]
        })
    }));
    await page.route("**/api/public/products?*", async route => {
        const params = new URL(route.request().url()).searchParams;
        const filtered = products.filter(product => {
            return (!params.get("category") || product.category === params.get("category"))
                && (!params.get("subcategory") || product.subcategory === params.get("subcategory"))
                && (!params.get("productGroup") || product.productGroup === params.get("productGroup"));
        });
        await route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                products: filtered,
                items: filtered,
                pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1, hasNext: false }
            })
        });
    });

    const productGrid = page.locator("#productGrid");
    const cards = productGrid.locator(".card");
    const selectSubcategory = async name => {
        const picker = page.locator('[data-catalog-picker="subcategory"]');
        if (await picker.isVisible()) {
            const popover = page.locator(".catalog-picker-popover");
            if (await popover.isHidden()) await picker.click();
            await popover.getByRole("option", { name, exact: true }).click();
            return;
        }
        await page.locator("#categoryControls").getByRole("button", { name, exact: true }).click();
    };
    const selectGroup = async name => {
        const picker = page.locator('[data-catalog-picker="group"]');
        if (await picker.isVisible()) {
            await picker.click();
            await page.locator(".catalog-picker-popover").getByRole("option", {
                name: name === "Все товары подкатегории" ? "Все товары" : name,
                exact: true
            }).click();
            return;
        }
        await page.locator("#categoryControls").getByRole("button", { name, exact: true }).click();
    };

    for (const viewport of [{ width: 1280, height: 800 }, { width: 375, height: 812 }]) {
        await page.setViewportSize(viewport);
        await page.goto("/catalog");
        await page.locator("#categoryControls").getByRole("button", { name: category, exact: true }).click();

        await selectSubcategory(plaster);
        await expect(cards).toHaveCount(2);
        await expect(productGrid).toContainText("Штукатурка общая");
        await expect(productGrid).toContainText("Штукатурка гипсовая");
        await expect(productGrid).not.toContainText("Клей общий");
        await expect(productGrid).not.toContainText("Выберите группу товаров");

        await selectGroup(sharedGroup);
        await expect(cards).toHaveCount(1);
        await expect(productGrid).toContainText("Штукатурка общая");
        await expect(productGrid).not.toContainText("Клей общий");

        await selectGroup("Все товары подкатегории");
        await expect(cards).toHaveCount(2);

        await selectGroup("Гипсовая");
        await expect(cards).toHaveCount(1);
        await selectSubcategory(adhesives);
        await expect(cards).toHaveCount(1);
        await expect(productGrid).toContainText("Клей общий");
        await expect(productGrid).not.toContainText("Штукатурка общая");

        await selectGroup(sharedGroup);
        await expect(cards).toHaveCount(1);
        await expect(productGrid).toContainText("Клей общий");
        await expect(productGrid).not.toContainText("Штукатурка общая");

        await selectSubcategory(plaster);
        await expect(cards).toHaveCount(2);

        await selectSubcategory(emptySubcategory);
        await expect(cards).toHaveCount(0);
        await expect(productGrid.locator(".empty-products")).toHaveText("Товары не найдены.");
        expect(pageErrors).toEqual([]);
    }
});

test("catalog restores featured products and auto-opens mobile subcategories", async ({ page }) => {
    const featured = [
        { id: 9311, externalId: "featured-rotband", title: "Штукатурка гипсовая Knauf Ротбанд 30 кг", price: 100, weight: 30, unit: "шт", category: "Смеси", subcategory: "Штукатурка", productGroup: "Гипсовая" },
        { id: 9312, externalId: "featured-volma", title: "Штукатурка гипсовая ВОЛМА Холст Сер. 30 кг", price: 120, weight: 30, unit: "шт", category: "Смеси", subcategory: "Штукатурка", productGroup: "Гипсовая" }
    ];
    const categoryProducts = [
        ...featured,
        { id: 9313, externalId: "other-category", title: "Материал без подкатегории", price: 80, weight: 10, unit: "шт", category: "Без подкатегорий", subcategory: "", productGroup: "" }
    ];

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            categories: [
                { name: "Смеси", subcategories: [{ name: "Штукатурка", groups: [{ name: "Гипсовая" }] }] },
                { name: "Без подкатегорий", subcategories: [] }
            ]
        })
    }));
    await page.route("**/api/public/products?*", route => {
        const params = new URL(route.request().url()).searchParams;
        const search = params.get("search");
        const source = search
            ? categoryProducts.filter(product => product.title === search)
            : categoryProducts.filter(product => (
                (!params.get("category") || product.category === params.get("category"))
                && (!params.get("subcategory") || product.subcategory === params.get("subcategory"))
                && (!params.get("productGroup") || product.productGroup === params.get("productGroup"))
            ));
        return route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                products: source,
                items: source,
                pagination: { page: 1, limit: 50, total: source.length, totalPages: 1, hasNext: false }
            })
        });
    });

    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/catalog");
    await expect(page.locator("#featuredCatalog")).toBeVisible();
    await expect(page.locator("#featuredCatalogGrid .card")).toHaveCount(2);

    await page.locator("#categoryControls").getByRole("button", { name: "Смеси", exact: true }).click();
    await expect(page.locator(".catalog-picker-popover")).toBeHidden();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/catalog");
    await expect(page.locator("#featuredCatalog")).toBeVisible();
    await expect(page.locator("#featuredCatalogGrid .card")).toHaveCount(2);

    await page.locator("#categoryControls").getByRole("button", { name: "Смеси", exact: true }).click();
    const subcategoryPicker = page.locator('[data-catalog-picker="subcategory"]');
    const popover = page.locator(".catalog-picker-popover");
    await expect(subcategoryPicker).toHaveAttribute("aria-expanded", "true");
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("aria-label", "Выберите подкатегорию");
    const geometry = await page.evaluate(() => {
        const trigger = document.querySelector('[data-catalog-picker="subcategory"]').getBoundingClientRect();
        const panel = document.querySelector(".catalog-picker-popover").getBoundingClientRect();
        return { triggerBottom: trigger.bottom, panelTop: panel.top, placement: document.querySelector(".catalog-picker-popover").dataset.placement };
    });
    expect(geometry.placement).toBe("bottom");
    expect(Math.abs(geometry.panelTop - geometry.triggerBottom - 4)).toBeLessThanOrEqual(1);

    await popover.getByRole("option", { name: "Штукатурка", exact: true }).click();
    await expect(page.locator("#productGrid .card")).toHaveCount(2);
    await expect(popover).toBeHidden();

    await page.locator("#categoryControls").getByRole("button", { name: "Без подкатегорий", exact: true }).click();
    await expect(page.locator('[data-catalog-picker="subcategory"]')).toHaveCount(0);
    await expect(popover).toBeHidden();

    await page.locator("#categoryControls").getByRole("button", { name: "Все товары", exact: true }).click();
    await expect(page.locator("#featuredCatalog")).toBeVisible();
    await expect(page.locator("#featuredCatalogGrid .card")).toHaveCount(2);
    expect(pageErrors).toEqual([]);
});

test("mobile catalog uses compact pickers and anchored popovers", async ({ page }) => {
    const category = "Смеси";
    const targetSubcategory = "Штукатурка";
    const otherSubcategory = "Клеи";
    const sharedGroup = "Общая группа";
    const directGroupCategory = "Прочие материалы";
    const fillerSubcategories = Array.from({ length: 30 }, (_, index) => ({
        name: `Дополнительная подкатегория ${String(index + 1).padStart(2, "0")}`,
        groups: [{ name: `Группа ${index + 1}` }]
    }));
    const products = [
        { id: 9251, externalId: "mobile-plaster-shared", name: "Штукатурка общая", price: 100, weight: 1, unit: "шт", category, subcategory: targetSubcategory, productGroup: sharedGroup, image: "" },
        { id: 9252, externalId: "mobile-plaster-gypsum", name: "Штукатурка гипсовая", price: 200, weight: 1, unit: "шт", category, subcategory: targetSubcategory, productGroup: "Гипсовая", image: "" },
        { id: 9253, externalId: "mobile-adhesive-shared", name: "Клей общий", price: 300, weight: 1, unit: "шт", category, subcategory: otherSubcategory, productGroup: sharedGroup, image: "" },
        { id: 9254, externalId: "mobile-direct-group", name: "Материал без подкатегории", price: 400, weight: 1, unit: "шт", category: directGroupCategory, subcategory: "Без подкатегории", productGroup: "Специальная группа", image: "" }
    ];
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));

    await page.route("**/api/public/products/structure", route => route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            categories: [
                {
                    name: category,
                    subcategories: [
                        { name: targetSubcategory, groups: [{ name: sharedGroup }, { name: "Гипсовая" }] },
                        { name: otherSubcategory, groups: [{ name: sharedGroup }] },
                        ...fillerSubcategories
                    ]
                },
                {
                    name: directGroupCategory,
                    subcategories: [{ name: "Без подкатегории", groups: [{ name: "Специальная группа" }] }]
                }
            ]
        })
    }));
    await page.route("**/api/public/products?*", async route => {
        const params = new URL(route.request().url()).searchParams;
        const filtered = products.filter(product => {
            return (!params.get("category") || product.category === params.get("category"))
                && (!params.get("subcategory") || product.subcategory === params.get("subcategory"))
                && (!params.get("productGroup") || product.productGroup === params.get("productGroup"));
        });
        await route.fulfill({
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                products: filtered,
                items: filtered,
                pagination: { page: 1, limit: 50, total: filtered.length, totalPages: 1, hasNext: false }
            })
        });
    });

    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/catalog");
    await page.locator("#categoryControls").getByRole("button", { name: category, exact: true }).click();

    const subcategoryPicker = page.locator('[data-catalog-picker="subcategory"]');
    const groupPicker = page.locator('[data-catalog-picker="group"]');
    const popover = page.locator(".catalog-picker-popover");
    await expect(subcategoryPicker).toBeVisible();
    await expect(page.locator("#categoryControls select")).toHaveCount(0);
    await expect(subcategoryPicker.locator(".catalog-mobile-picker-label")).toHaveText("ПОДКАТЕГОРИЯ");

    if (await popover.isHidden()) await subcategoryPicker.click();
    await expect(popover).toBeVisible();
    await expect(popover).toHaveAttribute("aria-label", "Выберите подкатегорию");
    await expect(popover.getByRole("option", { name: "Все подкатегории", exact: true })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".catalog-picker-overlay")).toHaveCount(0);
    const openGeometry = await page.evaluate(() => {
        const trigger = document.querySelector('[data-catalog-picker="subcategory"]').getBoundingClientRect();
        const popoverElement = document.querySelector(".catalog-picker-popover");
        const popoverRect = popoverElement.getBoundingClientRect();
        const background = getComputedStyle(popoverElement).backgroundColor;
        return {
            background,
            bodyOverflow: getComputedStyle(document.body).overflow,
            placement: popoverElement.dataset.placement,
            position: getComputedStyle(popoverElement).position,
            trigger: trigger.toJSON(),
            popover: popoverRect.toJSON(),
            scrollable: popoverElement.scrollHeight > popoverElement.clientHeight,
            viewportHeight: window.innerHeight
        };
    });
    expect(openGeometry.background).toMatch(/^rgb\(/);
    expect(openGeometry.position).toBe("absolute");
    expect(openGeometry.placement).toBe("bottom");
    expect(Math.abs(openGeometry.popover.top - openGeometry.trigger.bottom - 4)).toBeLessThanOrEqual(1);
    expect(Math.abs(openGeometry.popover.width - openGeometry.trigger.width)).toBeLessThanOrEqual(1);
    expect(openGeometry.popover.height).toBeLessThanOrEqual(openGeometry.viewportHeight * 0.58 + 1);
    expect(openGeometry.scrollable).toBe(true);
    expect(openGeometry.bodyOverflow).not.toBe("hidden");

    await page.keyboard.press("ArrowDown");
    await expect(popover.getByRole("option", { name: targetSubcategory, exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();
    await expect(subcategoryPicker).toBeFocused();

    await subcategoryPicker.click();
    await subcategoryPicker.click();
    await expect(popover).toBeHidden();
    await expect(subcategoryPicker).toBeFocused();

    await page.setViewportSize({ width: 375, height: 420 });
    await subcategoryPicker.click();
    const upwardGeometry = await page.evaluate(() => {
        const trigger = document.querySelector('[data-catalog-picker="subcategory"]').getBoundingClientRect();
        const popoverElement = document.querySelector(".catalog-picker-popover");
        const popoverRect = popoverElement.getBoundingClientRect();
        return { trigger: trigger.toJSON(), popover: popoverRect.toJSON(), placement: popoverElement.dataset.placement };
    });
    expect(upwardGeometry.placement).toBe("top");
    expect(upwardGeometry.popover.bottom).toBeLessThanOrEqual(upwardGeometry.trigger.top - 3);
    expect(await popover.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);

    await page.locator("#cartBtn").click();
    await expect(popover).toBeHidden();
    await page.locator("#closeCart").click();

    await page.setViewportSize({ width: 375, height: 640 });
    await subcategoryPicker.click();
    await popover.getByRole("option", { name: targetSubcategory, exact: true }).click();
    await expect(page.locator("#productGrid .card")).toHaveCount(2);
    await expect(subcategoryPicker.locator(".catalog-mobile-picker-value")).toHaveText(targetSubcategory);
    await expect(groupPicker).toBeVisible();
    await expect(groupPicker.locator(".catalog-mobile-picker-label")).toHaveText("ГРУППА ТОВАРОВ");
    await expect(groupPicker.locator(".catalog-mobile-picker-value")).toHaveText("Все товары");

    const pickerGeometry = await page.evaluate(() => {
        const subcategory = document.querySelector('[data-catalog-picker="subcategory"]').getBoundingClientRect();
        const group = document.querySelector('[data-catalog-picker="group"]').getBoundingClientRect();
        return {
            subcategoryHeight: subcategory.height,
            groupHeight: group.height,
            gap: group.top - subcategory.bottom,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        };
    });
    expect(pickerGeometry.subcategoryHeight).toBeGreaterThanOrEqual(44);
    expect(pickerGeometry.groupHeight).toBeGreaterThanOrEqual(44);
    expect(pickerGeometry.gap).toBeLessThanOrEqual(6);
    expect(pickerGeometry.scrollWidth).toBeLessThanOrEqual(pickerGeometry.clientWidth + 1);

    await groupPicker.click();
    await expect(popover).toHaveAttribute("aria-label", "Выберите группу товаров");
    await popover.getByRole("option", { name: sharedGroup, exact: true }).click();
    await expect(page.locator("#productGrid .card")).toHaveCount(1);
    await expect(page.locator("#productGrid")).toContainText("Штукатурка общая");

    await groupPicker.click();
    await popover.getByRole("option", { name: "Все товары", exact: true }).click();
    await expect(page.locator("#productGrid .card")).toHaveCount(2);

    await subcategoryPicker.click();
    await popover.getByRole("option", { name: otherSubcategory, exact: true }).click();
    await expect(page.locator("#productGrid .card")).toHaveCount(1);
    await expect(page.locator("#productGrid")).toContainText("Клей общий");
    await expect(page.locator("#productGrid")).not.toContainText("Штукатурка общая");
    await expect(groupPicker.locator(".catalog-mobile-picker-value")).toHaveText("Все товары");

    await page.locator("#categoryControls").getByRole("button", { name: directGroupCategory, exact: true }).click();
    await expect(page.locator('[data-catalog-picker="subcategory"]')).toHaveCount(0);
    await expect(groupPicker).toBeVisible();
    await groupPicker.click();
    await expect(popover.getByRole("option", { name: "Специальная группа", exact: true })).toBeVisible();
    await popover.getByRole("option", { name: "Специальная группа", exact: true }).click();
    await expect(page.locator("#productGrid")).toContainText("Материал без подкатегории");

    const helpPlacement = await page.evaluate(() => {
        const grid = document.querySelector("#productGrid");
        const help = document.querySelector(".catalog-help");
        const lastCard = grid.querySelector(".card:last-child");
        const helpStyle = getComputedStyle(help);
        return {
            followsGrid: Boolean(grid.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING),
            followsLastCard: !lastCard || help.getBoundingClientRect().top >= lastCard.getBoundingClientRect().bottom,
            position: helpStyle.position
        };
    });
    expect(helpPlacement.followsGrid).toBe(true);
    expect(helpPlacement.followsLastCard).toBe(true);
    expect(["fixed", "sticky"]).not.toContain(helpPlacement.position);
    expect(pageErrors).toEqual([]);
});

test("product breadcrumbs use deterministic catalog deep links", async ({ page }) => {
    const product = { id: 1, externalId: "MAT-TEST", title: "Тестовая штукатурка", category: "Смеси", subcategory: "Штукатурка", price: 100, unit: "шт" };
    const structure = { success: true, categories: [{ id: 10, name: "Смеси", externalCode: "MIXES", subcategories: [{ id: 11, name: "Штукатурка", externalCode: "PLASTER", groups: [] }] }] };
    await page.route("**/api/public/products/structure", route => route.fulfill({ contentType: "application/json", body: JSON.stringify(structure) }));
    await page.route("**/api/public/products?*", route => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, products: [product], items: [product], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }) }));
    await page.route("**/product/MAT-TEST", route => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="ru"><body><nav class="product-page-breadcrumbs"><a href="/catalog">Каталог</a><span>/</span><a href="/catalog?category=MIXES">Смеси</a><span>/</span><a href="/catalog?category=MIXES&subcategory=PLASTER">Штукатурка</a><span>Тестовая штукатурка</span></nav></body></html>` }));

    await page.goto("/product/MAT-TEST");
    const breadcrumbs = page.locator(".product-page-breadcrumbs");
    await expect(breadcrumbs.locator("a").nth(0)).toHaveAttribute("href", "/catalog");
    await expect(breadcrumbs.locator("a").nth(1)).toHaveAttribute("href", "/catalog?category=MIXES");
    await expect(breadcrumbs.locator("a").nth(2)).toHaveAttribute("href", "/catalog?category=MIXES&subcategory=PLASTER");

    await breadcrumbs.locator("a").nth(2).click();
    await expect(page).toHaveURL(/\/catalog\?category=MIXES&subcategory=PLASTER$/);
    await expect(page.locator(".category-control.level-0.active")).toHaveText("Смеси");
    await expect(page.locator(".category-control.level-1.active")).toHaveText("Штукатурка");
    await expect(page.locator("#productGrid .card")).toHaveCount(1);
    await page.reload();
    await expect(page.locator(".category-control.level-0.active")).toHaveText("Смеси");
    await expect(page.locator(".category-control.level-1.active")).toHaveText("Штукатурка");
    await page.goBack();
    await expect(page).toHaveURL(/\/product\/MAT-TEST$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/catalog\?category=MIXES&subcategory=PLASTER$/);
    await expect(page.locator(".category-control.level-1.active")).toHaveText("Штукатурка");

    await page.goto("/catalog?category=UNKNOWN&subcategory=UNKNOWN");
    await expect(page.locator(".category-control.category-all.active")).toHaveText("Все товары");
    await page.goto("/catalog");
    await expect(page.locator(".category-control.category-all.active")).toHaveText("Все товары");
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
    await expect(page).toHaveURL(/\/product\/responsive-search-product$/i);
    await page.goBack();
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
                contactActions: boxes(".contact-actions a, .contact-email-button"),
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
        const search = url.searchParams.get("search");
        const products = search
            ? [targetProduct]
            : (url.searchParams.get("subcategory") === subcategory ? [targetProduct] : [rootProduct]);
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
    const subcategoryPicker = page.locator('[data-catalog-picker="subcategory"]');
    if (await subcategoryPicker.isVisible()) {
        const popover = page.locator(".catalog-picker-popover");
        if (await popover.isHidden()) await subcategoryPicker.click();
        await popover.getByRole("option", { name: subcategory, exact: true }).click();
    } else {
        await page.getByRole("button", { name: subcategory, exact: true }).click();
    }
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

        const cartBodyHeight = await page.locator(".cart-body").evaluate(element => element.getBoundingClientRect().height);
        await page.locator("#clearCartBtn").click();
        await expect(page.locator("#clearCartConfirm")).toBeVisible();
        await expect(page.locator("#clearCartConfirm")).toContainText("Очистить полностью?");
        await expect(page.locator("#confirmClearCart")).toBeFocused();
        await expect(page.locator("#clearCartBtn")).toHaveAttribute("aria-expanded", "true");
        expect(await page.locator(".cart-body").evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(cartBodyHeight, 0);
        await page.locator("#cancelClearCart").click();
        await expect(page.locator("#clearCartConfirm")).toBeHidden();
        await expect(page.locator("#clearCartBtn")).toBeFocused();
        await expect(page.locator("#clearCartBtn")).toHaveAttribute("aria-expanded", "false");

        await page.locator("#clearCartBtn").click();
        await page.locator(".cart-header").click();
        await expect(page.locator("#clearCartConfirm")).toBeHidden();
        await expect(page.locator("#clearCartBtn")).toBeFocused();

        await page.locator("#clearCartBtn").click();
        await page.keyboard.press("Escape");
        await expect(page.locator("#clearCartConfirm")).toBeHidden();
        await expect(page.locator("#clearCartBtn")).toBeFocused();

        await page.locator("#clearCartBtn").click();
        await page.locator("#clearCartBtn").click();
        await expect(page.locator("#clearCartConfirm")).toHaveCount(1);
        await page.locator("#confirmClearCart").click();
        await expect(page.locator("#cartItems")).toContainText("Корзина пока пустая");
        await expect(page.locator("#clearCartBtn")).toBeDisabled();
        await expect(page.locator("#closeCart")).toBeFocused();
    }
});

test("clear cart popover stays floating and contained on mobile", async ({ page }) => {
    for (const path of ["/", "/catalog.html"]) {
        for (const width of [390, 360, 320]) {
            await page.setViewportSize({ width, height: 720 });
            await page.goto(path);
            await seedCartItems(page, 4);
            await page.locator("#cartBtn").click();

            const bodyHeightBefore = await page.locator(".cart-body").evaluate(element => element.getBoundingClientRect().height);
            await page.locator("#clearCartBtn").click();
            const layout = await page.evaluate(() => {
                const rect = selector => {
                    const box = document.querySelector(selector).getBoundingClientRect();
                    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, height: box.height };
                };
                const popover = rect("#clearCartConfirm");
                const modal = rect("#cartModal");
                const trigger = rect("#clearCartBtn");
                return {
                    bodyHeight: rect(".cart-body").height,
                    popover,
                    modal,
                    trigger,
                    documentScrollWidth: document.documentElement.scrollWidth,
                    documentClientWidth: document.documentElement.clientWidth
                };
            });

            expect(Math.abs(layout.bodyHeight - bodyHeightBefore)).toBeLessThanOrEqual(1);
            expect(layout.popover.bottom).toBeLessThanOrEqual(layout.trigger.top + 1);
            expect(layout.popover.left).toBeGreaterThanOrEqual(Math.max(0, layout.modal.left) - 1);
            expect(layout.popover.right).toBeLessThanOrEqual(Math.min(width, layout.modal.right) + 1);
            expect(layout.popover.top).toBeGreaterThanOrEqual(0);
            expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth + 1);
        }
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

        const consentLayout = await page.locator("#checkoutForm .checkout-consent").evaluate(consent => {
            const label = consent.querySelector(".checkout-consent-label");
            const lines = [...consent.querySelectorAll(".checkout-consent-line")];
            const links = [...consent.querySelectorAll("a")];
            const actions = document.querySelector("#checkoutForm .checkout-actions");
            const consentRect = consent.getBoundingClientRect();
            const actionsRect = actions.getBoundingClientRect();
            return {
                lineTexts: lines.map(line => line.textContent.trim()),
                linkHrefs: links.map(link => link.getAttribute("href")),
                lineOneTop: lines[0].getBoundingClientRect().top,
                lineTwoTop: lines[1].getBoundingClientRect().top,
                actionsGap: actionsRect.top - consentRect.bottom,
                labelScrollWidth: label.scrollWidth,
                labelClientWidth: label.clientWidth,
                documentScrollWidth: document.documentElement.scrollWidth,
                documentClientWidth: document.documentElement.clientWidth
            };
        });
        expect(consentLayout.lineTexts).toEqual(["Я согласен(на) на:", "Обработку персональных данных и Условия продажи"]);
        expect(consentLayout.linkHrefs).toEqual(["/privacy", "/terms"]);
        expect(consentLayout.lineTwoTop).toBeGreaterThan(consentLayout.lineOneTop);
        expect(consentLayout.actionsGap).toBeGreaterThanOrEqual(0);
        expect(consentLayout.actionsGap).toBeLessThanOrEqual(20);
        expect(consentLayout.labelScrollWidth).toBeLessThanOrEqual(consentLayout.labelClientWidth + 1);
        expect(consentLayout.documentScrollWidth).toBeLessThanOrEqual(consentLayout.documentClientWidth + 1);
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
        await expect(page.locator(".upload-request-intro")).toContainText("PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, CSV, TXT");
        await expect(page.locator("#uploadRequestFiles")).toHaveAttribute("accept", WORD_UPLOAD_ACCEPT);
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
    await openUploadRequestFromHeader(page);
    const fileInput = page.locator("#uploadRequestFiles");
    await expect(fileInput).toHaveAttribute("multiple", "");
    await expect(fileInput).toHaveAttribute("accept", WORD_UPLOAD_ACCEPT);
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
    await openUploadRequestFromHeader(page);
    await dropUploadFiles(page, Array.from({ length: 6 }, (_, index) => ({
        name: `file-${index + 1}.pdf`,
        type: "application/pdf",
        size: 10,
        lastModified: index + 10
    })));
    await expect(page.locator(".upload-file-item")).toHaveCount(5);
    await expect(page.locator("#uploadFileError")).toContainText("не более 5 файлов");

    await page.locator("#cancelUploadRequest").click();
    await openUploadRequestFromHeader(page);
    await dropUploadFiles(page, Array.from({ length: 4 }, (_, index) => ({
        name: `volume-${index + 1}.pdf`,
        type: "application/pdf",
        size: 13 * 1024 * 1024,
        lastModified: index + 20
    })));
    await expect(page.locator(".upload-file-item")).toHaveCount(3);
    await expect(page.locator("#uploadFileError")).toContainText("50 МБ");

    await page.locator("#cancelUploadRequest").click();
    await openUploadRequestFromHeader(page);
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
    await expect(page.locator("#cartModal")).toHaveClass(/hidden/);
    expect(orderPostCount).toBe(0);
    expect(fileRequestPostCount).toBe(1);
    await expect(page.locator(".upload-file-item")).toHaveCount(0);
    expect(await fileInput.evaluate(input => input.files.length)).toBe(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length)).toBe(2);

    const paymentLabels = await page.locator("#uploadPaymentMethod option").allTextContents();
    expect(paymentLabels).toEqual(["Наличные", "Перевод на карту", "Терминал", "Безнал — с НДС", "Безнал — без НДС"]);
});

test("upload request clears the cart only after a successful included submission", async ({ page }) => {
    const requestBodies = [];
    let responseStatus = 201;
    let responseBody = null;
    await page.route("**/api/orders/file-request", async route => {
        requestBodies.push(route.request().postDataBuffer()?.toString("utf8") || "");
        await route.fulfill({
            status: responseStatus,
            contentType: "application/json",
            body: JSON.stringify(responseBody || {
                success: true,
                orderNumber: `MM-2026-${String(requestBodies.length).padStart(6, "0")}`
            })
        });
    });

    const readStoredCart = () => page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]"));
    const submitRequest = async includeCart => {
        await openUploadRequestFromHeader(page);
        await dropUploadFiles(page, [{
            name: "request.pdf",
            type: "application/pdf",
            bytes: [...Buffer.from("%PDF-1.4\n%%EOF", "ascii")]
        }]);
        await page.locator("#uploadCustomerName").fill("Проверка корзины");
        await page.locator("#uploadCustomerPhone").fill("9991234567");
        await page.locator("#uploadRequestComment").fill("Проверка lifecycle корзины");
        await page.locator("#uploadRequestConsent").check();
        await page.locator("#uploadIncludeCart").setChecked(includeCart);
        await page.locator("#uploadRequestForm button[type='submit']").click();
    };

    await page.goto("/");
    await seedCartItems(page, 2);
    await submitRequest(true);
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/success/);
    expect(requestBodies[0]).toMatch(/name="includeCart"\r?\n\r?\ntrue/);
    expect(requestBodies[0]).toMatch(/name="items"[\s\S]*"productId":98000/);
    expect(await readStoredCart()).toEqual([]);
    await expect(page.locator("#cartCount")).toHaveText("0");
    await expect(page.locator("#cartCount")).toHaveClass(/hidden/);
    await expect(page.locator("#cartItems")).toContainText("Корзина пока пустая");
    await expect(page.locator("#cartTotal")).toContainText("Итого: 0,00 ₽");
    await expect(page.locator("#cartWeight")).toHaveText("Вес: 0,000 кг");
    await page.reload();
    expect(await readStoredCart()).toEqual([]);
    await expect(page.locator("#cartCount")).toHaveClass(/hidden/);

    await seedCartItems(page, 2);
    const preservedCart = await readStoredCart();
    await submitRequest(false);
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/success/);
    expect(requestBodies[1]).toMatch(/name="includeCart"\r?\n\r?\nfalse/);
    expect(requestBodies[1]).not.toMatch(/name="items"/);
    expect(await readStoredCart()).toEqual(preservedCart);
    await expect(page.locator("#cartCount")).toHaveText("2");
    await page.reload();
    expect(await readStoredCart()).toEqual(preservedCart);
    await expect(page.locator("#cartCount")).toHaveText("2");

    const failedResponses = [
        { status: 500, body: { success: false, message: "HTTP 500" } },
        { status: 200, body: { success: false, message: "Заявка отклонена" } },
        { status: 200, body: { success: true } }
    ];
    for (const failure of failedResponses) {
        await seedCartItems(page, 2);
        const cartBeforeFailure = await readStoredCart();
        responseStatus = failure.status;
        responseBody = failure.body;
        await submitRequest(true);
        await expect(page.locator("#uploadRequestMessage")).toHaveClass(/error/);
        await expect(page.locator("#cartModal")).not.toHaveClass(/hidden/);
        expect(requestBodies.at(-1)).toMatch(/name="includeCart"\r?\n\r?\ntrue/);
        expect(await readStoredCart()).toEqual(cartBeforeFailure);
        await expect(page.locator("#cartCount")).toHaveText("2");
        await page.reload();
        expect(await readStoredCart()).toEqual(cartBeforeFailure);
        await expect(page.locator("#cartCount")).toHaveText("2");
    }
});

test("upload request does not clear a cart changed while its response is pending", async ({ page }) => {
    let releaseResponse;
    let markRequestIntercepted;
    let requestBody = "";
    const requestIntercepted = new Promise(resolve => {
        markRequestIntercepted = resolve;
    });

    await page.route("**/api/orders/file-request", async route => {
        requestBody = route.request().postDataBuffer()?.toString("utf8") || "";
        await new Promise(resolve => {
            releaseResponse = async () => {
                await route.fulfill({
                    status: 201,
                    contentType: "application/json",
                    body: JSON.stringify({ success: true, orderNumber: "MM-2026-999999" })
                });
                resolve();
            };
            markRequestIntercepted();
        });
    });

    await page.goto("/");
    await seedCartItems(page, 2);
    await openUploadRequestFromHeader(page);
    await dropUploadFiles(page, [{
        name: "request.pdf",
        type: "application/pdf",
        bytes: [...Buffer.from("%PDF-1.4\n%%EOF", "ascii")]
    }]);
    await page.locator("#uploadCustomerName").fill("Проверка race condition");
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadRequestComment").fill("Корзина изменяется во время запроса");
    await page.locator("#uploadRequestConsent").check();
    await page.locator("#uploadIncludeCart").check();
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await requestIntercepted;

    expect(requestBody).toMatch(/name="items"[\s\S]*"productId":98000,"qty":1/);
    await page.locator("#cancelUploadRequest").click();
    await page.locator("#cartItems .cart-item .qty.plus").first().click();
    const changedCart = await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]"));
    expect(changedCart[0].quantity).toBe(2);

    await releaseResponse();
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/success/);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]"))).toEqual(changedCart);
    await expect(page.locator("#cartCount")).toHaveText("2");
    await page.reload();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]"))).toEqual(changedCart);
    await expect(page.locator("#cartCount")).toHaveText("2");
});

test("TXT file request reaches CRM metadata and protected download", async ({ page, request }) => {
    const txtBytes = Buffer.from("Русский TXT\r\nEnglish line\n", "utf8");
    const unicodeTxtName = "ЗАПРОС.txt";
    const uniqueSuffix = Date.now();
    const uniqueEmail = `txt-e2e-${uniqueSuffix}@example.test`;
    const uniqueCustomerName = `TXT E2E ${uniqueSuffix}`;

    await page.goto("/");
    await seedCartItems(page, 1);
    await openUploadRequestFromHeader(page);
    await expect(page.locator(".upload-request-intro")).toContainText("PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, CSV, TXT");
    await expect(page.locator("#uploadRequestFiles")).toHaveAttribute(
        "accept",
        WORD_UPLOAD_ACCEPT
    );

    const chooserPromise = page.waitForEvent("filechooser");
    await page.locator("#uploadDropZone").press("Enter");
    const chooser = await chooserPromise;
    await chooser.setFiles({
        name: "PICKER.TXT",
        mimeType: "text/plain",
        buffer: Buffer.from("Picker text", "utf8")
    });
    await expect(page.locator(".upload-file-item")).toContainText("PICKER.TXT");
    await page.locator(".upload-file-remove").click();
    await expect(page.locator(".upload-file-item")).toHaveCount(0);

    await dropUploadFiles(page, [{
        name: unicodeTxtName,
        type: "text/plain",
        bytes: [...txtBytes]
    }]);
    await expect(page.locator(".upload-file-item")).toHaveCount(1);
    await expect(page.locator(".upload-file-item")).toContainText(unicodeTxtName);
    await expect(page.locator(".upload-file-item")).toContainText(`${txtBytes.length}`);
    await page.setViewportSize({ width: 320, height: 800 });
    const uploadGeometry = await page.locator("#uploadRequestForm").evaluate(form => ({
        overflow: form.scrollWidth - form.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(uploadGeometry.overflow).toBeLessThanOrEqual(1);
    expect(uploadGeometry.pageOverflow).toBeLessThanOrEqual(1);

    await page.locator("#uploadCustomerName").fill(uniqueCustomerName);
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadCustomerEmail").fill(uniqueEmail);
    await page.locator("#uploadRequestComment").fill("Проверка TXT заявки");
    await page.locator("#uploadRequestConsent").check();
    await page.locator("#uploadIncludeCart").uncheck();
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await expect(page.locator("#uploadRequestMessage")).toContainText(/Заявка №MM-\d{4}-\d{6} принята/);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length)).toBe(1);

    const login = await request.post("/api/auth/login", {
        data: { login: "e2e_admin", password: "E2eAdmin!234" }
    });
    expect(login.ok()).toBeTruthy();
    const ordersResponse = await request.get("/api/orders");
    expect(ordersResponse.ok()).toBeTruthy();
    const ordersBody = await ordersResponse.json();
    const txtOrder = ordersBody.orders.find(order => order.email === uniqueEmail);
    expect(txtOrder).toBeTruthy();
    expect(txtOrder.requestType).toBe("file_request");
    expect(txtOrder.attachmentCount).toBe(1);
    const metadataResponse = await request.get(`/api/orders/${txtOrder.id}/attachments`);
    expect(metadataResponse.ok()).toBeTruthy();
    const metadata = await metadataResponse.json();
    expect(metadata.attachments).toHaveLength(1);
    expect(metadata.attachments[0]).toMatchObject({
        originalName: unicodeTxtName,
        extension: "txt",
        mimeType: "text/plain",
        sizeBytes: txtBytes.length
    });
    expect(JSON.stringify(metadata)).not.toContain("storageKey");
    const download = await request.get(metadata.attachments[0].downloadUrl);
    expect(download.ok()).toBeTruthy();
    expect(download.headers()["content-type"]).toBe("text/plain");
    expect(download.headers()["cache-control"]).toBe("private, no-store");
    expect(download.headers()["x-content-type-options"]).toBe("nosniff");
    expect(download.headers()["content-disposition"]).toContain("attachment;");
    expect(download.headers()["content-disposition"]).toContain(
        `filename*=UTF-8''${encodeURIComponent(unicodeTxtName)}`
    );
    expect(download.headers()["content-disposition"]).not.toMatch(/%25(?:D0|D1)/i);
    expect(await download.body()).toEqual(txtBytes);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin");
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await page.locator('.crm-nav [data-section="orders"]').click();
    const crmOrder = page.locator(`article.order-card[data-id="${txtOrder.id}"]`);
    await expect(crmOrder).toBeVisible();
    await crmOrder.locator(".order-card-header").click();
    await crmOrder.getByRole("button", { name: "Документы" }).click();
    await expect(crmOrder).toContainText(unicodeTxtName);
    const crmText = await crmOrder.textContent();
    expect(crmText).not.toMatch(/Ð|Ñ|Гђ|Г‘|Р Сџ/);
    await expect(crmOrder.getByRole("button", { name: `Скачать файл ${unicodeTxtName}` })).toBeVisible();

    await page.goto("/");
    await openUploadRequestFromHeader(page);
    await dropUploadFiles(page, [{
        name: "binary.txt",
        type: "application/octet-stream",
        bytes: [0xff, 0xd8, 0, 1, 2, 3]
    }]);
    await page.locator("#uploadCustomerName").fill("TXT binary");
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadRequestComment").fill("Проверка ошибки TXT");
    await page.locator("#uploadRequestConsent").check();
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await expect(page.locator("#uploadRequestMessage")).toContainText(
        "Файл повреждён или его содержимое не соответствует формату TXT"
    );
    await expect(page.locator(".upload-file-item")).toHaveCount(1);
});

test("DOC and DOCX requests reach CRM metadata and protected downloads", async ({ page, request }) => {
    const docBytes = createDocFixture();
    const docxBytes = createDocxFixture();
    const docName = "Техническое задание.doc";
    const docxName = `${"длинное-название-".repeat(8)}спецификация.docx`;
    const uniqueEmail = `word-e2e-${Date.now()}@example.test`;

    await page.goto("/");
    await openUploadRequestFromHeader(page);
    await expect(page.locator(".upload-request-intro")).toContainText("DOC, DOCX");
    await expect(page.locator("#uploadRequestFiles")).toHaveAttribute("accept", WORD_UPLOAD_ACCEPT);
    await dropUploadFiles(page, [
        { name: docName, type: "application/msword", bytes: [...docBytes] },
        {
            name: docxName,
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            bytes: [...docxBytes]
        }
    ]);
    await expect(page.locator(".upload-file-item")).toHaveCount(2);
    await expect(page.locator(".upload-file-item").nth(0)).toContainText(docName);
    await expect(page.locator(".upload-file-item").nth(1)).toContainText(docxName);
    await expect(page.locator(".upload-file-type")).toHaveText(["DOC", "DOCX"]);

    for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 800 });
        const geometry = await page.locator("#uploadRequestForm").evaluate(form => ({
            formScrollWidth: form.scrollWidth,
            formClientWidth: form.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            documentClientWidth: document.documentElement.clientWidth
        }));
        expect(geometry.formScrollWidth).toBeLessThanOrEqual(geometry.formClientWidth + 1);
        expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth + 1);
    }

    await page.locator("#uploadCustomerName").fill("Word E2E");
    await page.locator("#uploadCustomerPhone").fill("9991234567");
    await page.locator("#uploadCustomerEmail").fill(uniqueEmail);
    await page.locator("#uploadRequestComment").fill("Проверка DOC и DOCX");
    await page.locator("#uploadRequestConsent").check();
    await page.locator("#uploadRequestForm button[type='submit']").click();
    await expect(page.locator("#uploadRequestMessage")).toContainText(/Заявка №MM-\d{4}-\d{6} принята/);

    const login = await request.post("/api/auth/login", {
        data: { login: "e2e_admin", password: "E2eAdmin!234" }
    });
    expect(login.ok()).toBeTruthy();
    const ordersResponse = await request.get("/api/orders");
    expect(ordersResponse.ok()).toBeTruthy();
    const ordersBody = await ordersResponse.json();
    const wordOrder = ordersBody.orders.find(order => order.email === uniqueEmail);
    expect(wordOrder).toBeTruthy();
    expect(wordOrder.attachmentCount).toBe(2);

    const metadataResponse = await request.get(`/api/orders/${wordOrder.id}/attachments`);
    expect(metadataResponse.ok()).toBeTruthy();
    const metadata = await metadataResponse.json();
    const attachmentsByExtension = new Map(metadata.attachments.map(attachment => [attachment.extension, attachment]));
    expect(attachmentsByExtension.get("doc")).toMatchObject({
        originalName: docName,
        extension: "doc",
        mimeType: "application/msword"
    });
    expect(attachmentsByExtension.get("docx")).toMatchObject({
        originalName: docxName,
        extension: "docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    for (const attachment of metadata.attachments) {
        const download = await request.get(attachment.downloadUrl);
        expect(download.ok()).toBeTruthy();
        expect(download.headers()["content-type"]).toBe(attachment.mimeType);
        expect(download.headers()["content-disposition"]).toContain("attachment;");
        expect(await download.body()).toEqual(attachment.extension === "doc" ? docBytes : docxBytes);
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin");
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await page.locator('.crm-nav [data-section="orders"]').click();
    const crmOrder = page.locator(`article.order-card[data-id="${wordOrder.id}"]`);
    await expect(crmOrder).toBeVisible();
    await crmOrder.locator(".order-card-header").click();
    await crmOrder.getByRole("button", { name: "Документы" }).click();
    await expect(crmOrder).toContainText(docName);
    await expect(crmOrder).toContainText(docxName);
    await expect(crmOrder.getByRole("button", { name: `Скачать файл ${docName}` })).toBeVisible();
    await expect(crmOrder.getByRole("button", { name: `Скачать файл ${docxName}` })).toBeVisible();
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

        await openUploadRequestFromHeader(page);
        await expect(page.locator("#uploadRequestStatus")).toHaveCount(1);
        await expect(page.locator("#uploadRequestStatus #uploadRequestMessage")).toHaveCount(1);
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
        await expect(page.locator("#uploadRequestStatus")).toHaveClass(/has-message/);
        await expect(page.locator("#uploadRequestMessage")).toHaveAttribute("role", "status");
        await expect(page.locator(".upload-file-item")).toHaveCount(0);
        const cartLength = await page.evaluate(() => JSON.parse(localStorage.getItem("matmix_cart") || "[]").length);
        expect(cartLength).toBe(0);
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
    const longError = "Тестовая ошибка отправки. Проверьте выбранные документы и контактные данные, затем повторите отправку заявки.";
    await page.route("**/api/orders/file-request", route => route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
            success: false,
            code: "FILE_REQUEST_FAILED",
            message: longError
        })
    }));
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await openUploadRequestFromHeader(page);
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
    await expect(page.locator("#uploadRequestMessage")).toHaveText(longError);
    await expect(page.locator("#uploadRequestMessage")).toHaveClass(/error/);
    await expect(page.locator("#uploadRequestMessage")).toHaveAttribute("role", "alert");
    await expect(page.locator("#uploadRequestStatus")).toHaveClass(/has-message/);
    await expect(submit).toBeEnabled();
    await expect(submit).toHaveText("Отправить заявку");
    await expect(page.locator(".upload-file-item")).toHaveCount(1);

    const noticeLayout = await page.evaluate(() => {
        const form = document.querySelector("#uploadRequestForm");
        const status = document.querySelector("#uploadRequestStatus");
        const message = document.querySelector("#uploadRequestMessage");
        const actions = form.querySelector(".checkout-actions");
        const formRect = form.getBoundingClientRect();
        const statusRect = status.getBoundingClientRect();
        const actionsRect = actions.getBoundingClientRect();
        return {
            messageWhiteSpace: getComputedStyle(message).whiteSpace,
            messageHeight: message.getBoundingClientRect().height,
            lineHeight: parseFloat(getComputedStyle(message).lineHeight),
            statusBottom: statusRect.bottom,
            actionsTop: actionsRect.top,
            statusVisibleInForm: statusRect.top >= formRect.top - 1 && statusRect.bottom <= formRect.bottom + 1,
            formScrollWidth: form.scrollWidth,
            formClientWidth: form.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            documentClientWidth: document.documentElement.clientWidth
        };
    });
    expect(noticeLayout.messageWhiteSpace).toBe("normal");
    expect(noticeLayout.messageHeight).toBeGreaterThan(noticeLayout.lineHeight * 2);
    expect(noticeLayout.actionsTop).toBeGreaterThanOrEqual(noticeLayout.statusBottom - 1);
    expect(noticeLayout.statusVisibleInForm).toBeTruthy();
    expect(noticeLayout.formScrollWidth).toBeLessThanOrEqual(noticeLayout.formClientWidth + 1);
    expect(noticeLayout.documentScrollWidth).toBeLessThanOrEqual(noticeLayout.documentClientWidth + 1);

    await submit.click();
    await expect(page.locator("#uploadRequestStatus")).toHaveCount(1);
    await expect(page.locator("#uploadRequestStatus #uploadRequestMessage")).toHaveCount(1);
    await expect(page.locator("#uploadRequestMessage")).toHaveText(longError);
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
    await openUploadRequestFromHeader(page);
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
                panelScrollHeight: panel.scrollHeight,
                panelClientHeight: panel.clientHeight,
                documentScrollWidth: document.documentElement.scrollWidth,
                documentClientWidth: document.documentElement.clientWidth
            };
        });

        expect(dimensions.modal.left, JSON.stringify({ viewport, dimensions })).toBeGreaterThanOrEqual(-1);
        expect(dimensions.modal.right, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(viewport.width + 1);
        expect(dimensions.modal.bottom, JSON.stringify({ viewport, dimensions })).toBeLessThanOrEqual(viewport.height + 1);
        expect(dimensions.modalScrollTop).toBe(0);
        expect(dimensions.panelScrollTop).toBeCloseTo(
            Math.max(0, dimensions.panelScrollHeight - dimensions.panelClientHeight),
            0
        );
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
