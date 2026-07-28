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

async function dispatchDropZoneEvent(page, type, file = null) {
    await page.evaluate(({ eventType, fileData }) => {
        const dropZone = document.querySelector("[data-products-batch-image-drop-zone]");
        const transfer = new DataTransfer();
        if (fileData) {
            const binary = atob(fileData.base64);
            const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
            transfer.items.add(new File([bytes], fileData.name, { type: fileData.type }));
        }
        dropZone.dispatchEvent(new DragEvent(eventType, {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer
        }));
    }, { eventType: type, fileData: file });
}

async function expectNoHorizontalOverflow(page, width) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
        const toolbar = document.querySelector(".products-bulk-image");
        const header = toolbar?.querySelector(".products-bulk-image-header");
        const fileArea = toolbar?.querySelector(".products-bulk-image-file");
        const actions = toolbar?.querySelector(".products-bulk-image-actions");
        const buttons = [...(toolbar?.querySelectorAll(".products-bulk-image-actions button") || [])]
            .filter(button => !button.hidden)
            .map(button => {
                const rect = button.getBoundingClientRect();
                return {
                    text: button.textContent.trim(),
                    width: rect.width,
                    height: rect.height
                };
            });
        return {
            documentClientWidth: document.documentElement.clientWidth,
            documentScrollWidth: document.documentElement.scrollWidth,
            toolbarClientWidth: toolbar?.clientWidth || 0,
            toolbarScrollWidth: toolbar?.scrollWidth || 0,
            toolbarDisplay: toolbar ? getComputedStyle(toolbar).display : "",
            headerDirection: header ? getComputedStyle(header).flexDirection : "",
            fileColumns: fileArea ? getComputedStyle(fileArea).gridTemplateColumns : "",
            actionsDirection: actions ? getComputedStyle(actions).flexDirection : "",
            buttons
        };
    });
    expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
    expect(layout.toolbarScrollWidth).toBeLessThanOrEqual(layout.toolbarClientWidth);
    expect(layout.toolbarDisplay).toBe("grid");
    expect(layout.buttons.every(button => button.height >= 40 && button.width > 0)).toBe(true);
    if (width <= 768) {
        expect(layout.headerDirection).toBe("column");
        expect(layout.fileColumns.split(" ")).toHaveLength(1);
        expect(layout.actionsDirection).toBe("column");
    } else {
        expect(layout.headerDirection).toBe("row");
        expect(layout.actionsDirection).toBe("row");
    }
}

test("ordinary admin keeps scoped image actions but cannot start global replacement", async ({ page }) => {
    await login(page, "e2e_admin", "E2eAdmin!234");
    await openCatalog(page);

    const toolbar = page.locator(".products-bulk-image");
    const fileInput = toolbar.locator("#productBatchImageInput");
    const filePicker = toolbar.locator('label[for="productBatchImageInput"]');
    const dropZone = toolbar.locator("[data-products-batch-image-drop-zone]");
    const dropHint = toolbar.locator("[data-products-batch-image-drop-hint]");
    const selectedUpload = toolbar.locator(".products-batch-image-upload");
    const clearSelection = toolbar.locator(".products-selection-clear");
    await expect(toolbar.getByText("Фото товаров", { exact: true })).toBeVisible();
    await expect(toolbar.getByText("Выберите товары и изображение для назначения", { exact: true })).toBeVisible();
    await expect(toolbar.locator(".products-bulk-image-counts span")).toHaveCount(3);
    const nativeInputLayout = await fileInput.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
            width: rect.width,
            clip: style.clip,
            position: style.position
        };
    });
    expect(nativeInputLayout.width).toBeLessThanOrEqual(1);
    expect(nativeInputLayout.clip).not.toBe("auto");
    expect(nativeInputLayout.position).toBe("absolute");
    await expect(filePicker).toHaveText("Выбрать изображение");
    await expect(fileInput).toHaveAttribute(
        "aria-describedby",
        "productBatchImageDropHint productBatchImageFileName"
    );
    await expect(dropZone).toBeVisible();
    await expect(dropHint).toHaveText("или перетащите изображение сюда");
    await expect(selectedUpload).toBeDisabled();
    await expect(clearSelection).toBeDisabled();
    await expect(toolbar.locator(".products-all-image-upload")).toHaveCount(0);
    await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
    await expect(selectedUpload).toBeVisible();
    await expect(page.locator(".product-select").first()).toBeVisible();

    const image = await sharp({
        create: {
            width: 32,
            height: 32,
            channels: 3,
            background: "#4f8f5f"
        }
    }).png().toBuffer();
    await fileInput.setInputFiles({
        name: "picker-image.png",
        mimeType: "image/png",
        buffer: image
    });
    await expect(toolbar.locator("[data-products-batch-image-file]")).toContainText("picker-image.png");

    await dispatchDropZoneEvent(page, "dragenter");
    await expect(dropZone).toHaveClass(/is-drag-over/);
    await expect(dropHint).toHaveText("Отпустите файл для выбора");
    await dispatchDropZoneEvent(page, "dragleave");
    await expect(dropZone).not.toHaveClass(/is-drag-over/);
    await expect(dropHint).toHaveText("или перетащите изображение сюда");

    const longFileName = `${"очень-длинное-имя-файла-".repeat(8)}товара.png`;
    let uploadRequests = 0;
    page.on("request", request => {
        if (request.method() !== "GET" && request.url().includes("/api/products/images")) {
            uploadRequests += 1;
        }
    });
    await dispatchDropZoneEvent(page, "drop", {
        name: longFileName,
        type: "image/png",
        base64: image.toString("base64")
    });
    await expect(toolbar.locator("[data-products-batch-image-file]")).toContainText(longFileName);
    expect(await fileInput.evaluate(input => input.files?.[0]?.name)).toBe(longFileName);
    expect(uploadRequests).toBe(0);
    await expect(selectedUpload).toBeDisabled();
    await page.locator(".product-select").first().check();
    await expect(toolbar.locator("[data-products-selected-count]")).toContainText("1");
    await expect(selectedUpload).toBeEnabled();
    await expect(clearSelection).toBeEnabled();
    await clearSelection.click();
    await expect(toolbar.locator("[data-products-selected-count]")).toContainText("0");
    await expect(selectedUpload).toBeDisabled();
    await expect(clearSelection).toBeDisabled();

    await page.locator(".product-select").first().check();
    await dispatchDropZoneEvent(page, "drop", {
        name: "unsupported.exe",
        type: "application/x-msdownload",
        base64: Buffer.from("not-an-image").toString("base64")
    });
    await expect(page.locator(".crm-toast-warning")).toContainText("Можно загрузить только JPG, PNG или WebP.");
    expect(await fileInput.evaluate(input => input.files?.[0]?.name)).toBe(longFileName);
    await expect(selectedUpload).toBeEnabled();
    expect(uploadRequests).toBe(0);

    await page.locator(".products-row[role='row']").nth(1)
        .getByRole("button", { name: "Редактировать" })
        .click();
    const productModal = page.locator(".crm-modal");
    await expect(productModal.locator("[data-product-image-input]")).toBeVisible();
    await expect(productModal.locator("[data-product-image-upload]")).toBeVisible();
    await productModal.getByRole("button", { name: "Закрыть окно" }).click();

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

    for (const width of [1280, 390, 360, 320]) {
        await expectNoHorizontalOverflow(page, width);
        await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
        await expect(selectedUpload).toBeVisible();
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

    for (const width of [1280, 390, 360, 320]) {
        await expectNoHorizontalOverflow(page, width);
        await expect(globalButton).toBeVisible();
        await expect(toolbar.locator(".products-filter-image-upload")).toBeVisible();
        await expect(toolbar.locator(".products-batch-image-upload")).toBeVisible();
    }
});
