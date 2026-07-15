const { test, expect } = require("@playwright/test");

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
