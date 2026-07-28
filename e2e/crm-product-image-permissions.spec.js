const { test, expect } = require("@playwright/test");
const sharp = require("sharp");

async function login(page, loginName, password) {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill(loginName);
    await page.locator('input[name="password"], input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

async function openCatalog(page) {
    const catalogButton = page.locator('.crm-nav [data-section="catalog"]');
    const menuToggle = page.locator("#crmMenuToggle");
    if (await menuToggle.isVisible()) {
        await menuToggle.click();
    }
    await catalogButton.click();
    await expect(page.locator(".products-bulk-image")).toBeVisible();
    await expect(page.locator(".products-row[role='row']").nth(1)).toBeVisible();
}

async function expectNoHorizontalOverflow(page, width) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
        const toolbar = document.querySelector(".products-bulk-image");
        return {
            documentClientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            toolbarClientWidth: toolbar?.clientWidth || 0,
            toolbarScrollWidth: toolbar?.scrollWidth || 0
        };
    });
    expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
    expect(layout.toolbarScrollWidth).toBeLessThanOrEqual(layout.toolbarClientWidth);
}

test("ordinary admin keeps scoped image actions but cannot start global replacement", async ({ page }) => {
    await login(page, "e2e_admin", "E2eAdmin!234");
    await openCatalog(page);

    const toolbar = page.locator(".products-bulk-image");
    await expect(toolbar.locator(".products-all-image-upload")).toHaveCount(0);
    await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
    await expect(toolbar.locator(".products-batch-image-upload")).toBeVisible();
    await expect(page.locator(".product-select").first()).toBeVisible();

    await page.locator(".products-row[role='row']").nth(1)
        .getByRole("button", { name: "Редактировать" })
        .click();
    const productModal = page.locator(".crm-modal");
    await expect(productModal.locator("[data-product-image-input]")).toBeVisible();
    await expect(productModal.locator("[data-product-image-upload]")).toBeVisible();
    await productModal.getByRole("button", { name: "Закрыть окно" }).click();

    const image = await sharp({
        create: {
            width: 32,
            height: 32,
            channels: 3,
            background: "#4f8f5f"
        }
    }).png().toBuffer();
    const denied = await page.request.post("/api/products/images/by-filter?role=chief_admin", {
        multipart: {
            image: {
                name: "direct-global.png",
                mimeType: "image/png",
                buffer: image
            },
            scope: "all",
            filters: "{}",
            role: "chief_admin",
            allProducts: "true"
        }
    });
    expect(denied.status()).toBe(403);
    expect(await denied.json()).toEqual({
        success: false,
        code: "GLOBAL_PRODUCT_IMAGE_REPLACE_FORBIDDEN",
        message: "Глобальная замена изображений доступна только главному администратору."
    });

    for (const width of [1280, 390, 320]) {
        await expectNoHorizontalOverflow(page, width);
        await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
        await expect(toolbar.locator(".products-batch-image-upload")).toBeVisible();
        await expect(toolbar.locator(".products-all-image-upload")).toHaveCount(0);
    }
});

test("chief admin sees global replacement workflow with existing confirmation", async ({ page }) => {
    await login(page, "admin", "E2eChiefAdmin!234");
    await openCatalog(page);

    const toolbar = page.locator(".products-bulk-image");
    const globalButton = toolbar.locator(".products-all-image-upload");
    await expect(globalButton).toBeVisible();
    await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
    await expect(toolbar.locator(".products-batch-image-upload")).toBeVisible();

    const image = await sharp({
        create: {
            width: 32,
            height: 32,
            channels: 3,
            background: "#6f4f8f"
        }
    }).png().toBuffer();
    await toolbar.locator("#productBatchImageInput").setInputFiles({
        name: "chief-global.png",
        mimeType: "image/png",
        buffer: image
    });
    await expect(globalButton).toBeEnabled();
    await globalButton.click();

    const confirmation = page.locator(".crm-modal");
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText("Опасное массовое действие");
    await expect(confirmation).toContainText("всем");
    await confirmation.locator(".crm-modal-secondary").click();
    await expect(confirmation).toHaveCount(0);

    for (const width of [1280, 390, 320]) {
        await expectNoHorizontalOverflow(page, width);
        await expect(globalButton).toBeVisible();
        await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
        await expect(toolbar.locator(".products-batch-image-upload")).toBeVisible();
    }
});
