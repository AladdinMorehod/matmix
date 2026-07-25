const { test, expect } = require("@playwright/test");

async function loginAsAdmin(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin");
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

test("CRM login, invalid login, session and logout", async ({ page }) => {
    await page.goto("/login.html");
    await page.locator('input[name="login"], input[type="text"]').first().fill("e2e_admin"); await page.locator('input[name="password"], input[type="password"]').fill("wrong"); await page.locator('button[type="submit"]').click(); await expect(page.locator("body")).toContainText(/невер|ошиб/i);
    await page.locator('input[name="password"], input[type="password"]').fill("E2eAdmin!234"); await page.locator('button[type="submit"]').click(); await page.waitForURL(/manager/); await expect(page.locator("body")).toContainText(/MatMix|Заказ|Каталог/i);
    expect((await page.context().cookies()).find(cookie => cookie.name === "matmix.sid")?.httpOnly).toBeTruthy();
    const menuToggle = page.locator("#crmMenuToggle"); if (await menuToggle.isVisible()) await menuToggle.click();
    const logout = page.locator('button, a').filter({ hasText: /выйти/i }).first(); await logout.click(); await page.waitForURL(/login/); await page.goto("/manager"); await page.waitForURL(/login/);
});

test("public order API enforces consent and server price", async ({ request }) => {
    const products = await request.get("/api/public/products?limit=1"); expect(products.ok()).toBeTruthy(); const body = await products.json(); const product = (body.items || body.products || body.data || [])[0]; expect(product).toBeTruthy();
    const payload = { customerName: "E2E Test", phone: "+7 900 000-00-00", address: "E2E address", unloading: "Нет", paymentMethod: "При получении", items: [{ productId: product.id, qty: 1, price: 1 }] };
    const rejected = await request.post("/api/orders", { data: payload }); expect(rejected.status()).toBe(400); expect((await rejected.json()).code).toBe("CONSENT_REQUIRED");
    const accepted = await request.post("/api/orders", { data: { ...payload, consent: true } }); expect([201, 409]).toContain(accepted.status());
});

test("CRM shows and securely downloads file request attachments", async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('.crm-nav [data-section="orders"]').click();

    const fileOrder = page.locator("article.order-card", { hasText: "E2E-FILES" });
    const ordinaryOrder = page.locator("article.order-card", { hasText: "E2E-ORDINARY" });
    await expect(fileOrder).toBeVisible();
    await expect(fileOrder.locator(".order-request-type")).toContainText("Файловая заявка");
    await expect(fileOrder.locator(".order-request-type")).toContainText("Файлы: 2");
    await expect(ordinaryOrder.locator(".order-request-type")).toHaveCount(0);

    await fileOrder.getByRole("button", { name: "Клиент" }).click();
    await expect(fileOrder).toContainText("files@example.test");
    await fileOrder.getByRole("button", { name: "Обзор" }).click();
    await expect(fileOrder).toContainText("Товары к заявке не добавлены");

    await page.route("**/api/orders/*/attachments", async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
    }, { times: 1 });
    await fileOrder.getByRole("button", { name: "Документы" }).click();
    await expect(fileOrder).toContainText("Загружаем документы");
    await expect(fileOrder).toContainText("Смета проекта.xlsx");
    await expect(fileOrder).toContainText("План помещения.pdf");
    await expect(fileOrder).toContainText("XLSX");
    await expect(fileOrder).toContainText("PDF");
    await expect(fileOrder).not.toContainText("e2e-estimate.xlsx");
    await expect(fileOrder).not.toContainText("order-attachments");

    const attachmentButton = fileOrder.getByRole("button", { name: "Скачать файл Смета проекта.xlsx" });
    const orderId = await fileOrder.getAttribute("data-id");
    const attachmentId = await attachmentButton.getAttribute("data-attachment-id");
    const response = await page.request.get(`/api/orders/${orderId}/attachments/${attachmentId}/download`);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-disposition"]).toContain("attachment;");
    expect(response.headers()["content-disposition"]).toContain("filename*=UTF-8''");
    expect((await response.body()).toString()).toBe("E2E estimate content");

    await page.route(`**/api/orders/${orderId}/attachments/${attachmentId}/download`, async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.fulfill({
            status: 410,
            contentType: "application/json",
            body: JSON.stringify({ success: false, message: "Файл больше недоступен." })
        });
    }, { times: 1 });
    await attachmentButton.click();
    await expect(attachmentButton).toHaveText("Скачиваем…");
    await expect(page.locator(".crm-toast-error")).toContainText("Файл больше недоступен.");
    await expect(attachmentButton).toBeEnabled();
    await expect(fileOrder.getByRole("button", { name: "Скачать файл План помещения.pdf" })).toBeEnabled();

    await ordinaryOrder.getByRole("button", { name: "Документы" }).click();
    await expect(ordinaryOrder).toContainText("Документов пока нет.");

    await page.setViewportSize({ width: 320, height: 900 });
    await fileOrder.getByRole("button", { name: "Документы" }).click();
    const geometry = await fileOrder.evaluate(element => {
        const cardRect = element.getBoundingClientRect();
        const rows = [...element.querySelectorAll(".order-attachment")].map(row => row.getBoundingClientRect());
        return {
            cardOverflow: element.scrollWidth - element.clientWidth,
            attachmentOverflow: rows.some(row => row.left < cardRect.left - 1 || row.right > cardRect.right + 1)
        };
    });
    expect(geometry.cardOverflow).toBeLessThanOrEqual(1);
    expect(geometry.attachmentOverflow).toBeFalsy();
    await expect(attachmentButton).toBeVisible();
});
