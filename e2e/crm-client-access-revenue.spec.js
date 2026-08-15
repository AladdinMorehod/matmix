const { test, expect } = require("@playwright/test");

async function login(page, role) {
    const credentials = role === "manager"
        ? ["e2e_manager", "E2eManager!234", "E2E Manager"]
        : ["e2e_admin", "E2eAdmin!234", "E2E Admin"];
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill(credentials[0]);
    await page.locator('input[name="password"]').fill(credentials[1]);
    const ordersResponse = page.waitForResponse(response => (
        new URL(response.url()).pathname === "/api/orders"
        && response.request().method() === "GET"
    ));
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await ordersResponse;
    await expect(page.locator("#managerUserName")).toHaveText(credentials[2]);
}

test("client API is admin-only and completed revenue is canonical", async ({ page }) => {
    await login(page, "admin");
    await expect(page.locator('.crm-nav [data-section="clients"]')).toBeVisible();

    const mixedResponse = await page.request.get("/api/clients?search=Revenue%20Mixed&limit=50");
    expect(mixedResponse.ok()).toBeTruthy();
    const mixedPayload = await mixedResponse.json();
    expect(mixedPayload.clients).toHaveLength(1);
    expect(mixedPayload.clients[0]).toMatchObject({
        name: "Revenue Mixed",
        ordersCount: 7,
        totalSpent: 500
    });
    expect(mixedPayload.stats).toMatchObject({ total: 1, repeat: 1, totalSpent: 500 });

    const clientId = mixedPayload.clients[0].id;
    const clientResponse = await page.request.get(`/api/clients/${clientId}`);
    expect(clientResponse.ok()).toBeTruthy();
    expect((await clientResponse.json()).client.totalSpent).toBe(500);

    const historyResponse = await page.request.get(`/api/clients/${clientId}/orders?limit=50`);
    expect(historyResponse.ok()).toBeTruthy();
    const historyPayload = await historyResponse.json();
    expect(historyPayload.orders).toHaveLength(6);
    expect(historyPayload.orders.map(order => order.orderNumber)).not.toContain("REVENUE-DELETED-DONE");

    const multipleResponse = await page.request.get("/api/clients?search=Revenue%20Multiple&limit=50");
    expect(multipleResponse.ok()).toBeTruthy();
    const multiplePayload = await multipleResponse.json();
    expect(multiplePayload.clients).toHaveLength(1);
    expect(multiplePayload.clients[0].totalSpent).toBe(800);
    expect(multiplePayload.stats.totalSpent).toBe(800);

    const ordersResponse = await page.request.get("/api/orders?status=Завершена&limit=50");
    expect(ordersResponse.ok()).toBeTruthy();
    const completedOrder = (await ordersResponse.json()).orders.find(order => order.orderNumber === "REVENUE-DONE");
    expect(completedOrder).toBeTruthy();
    expect(completedOrder.clientTotalSpent).toBe(500);
});

test("manager cannot access the client base but keeps order contact data", async ({ page }) => {
    const dashboardClientRequests = [];
    page.on("request", request => {
        if (new URL(request.url()).pathname.startsWith("/api/clients")) {
            dashboardClientRequests.push(request.url());
        }
    });

    await login(page, "manager");
    expect(dashboardClientRequests).toEqual([]);
    await expect(page.locator('.crm-nav [data-section="clients"]')).toHaveCount(0);
    const adminClientElements = page.locator("[data-admin-clients-only]");
    await expect(adminClientElements).toHaveCount(2);
    expect(await adminClientElements.evaluateAll(elements => (
        elements.every(element => element.hidden && element.classList.contains("hidden"))
    ))).toBeTruthy();

    await page.goto("/manager.html?section=clients");
    await expect(page.locator("#managerUserName")).toHaveText("E2E Manager");
    await expect(page.locator("#dashboardView")).not.toHaveClass(/hidden/);
    await expect(page.locator("#clientsView")).toHaveClass(/hidden/);
    await expect.poll(() => new URL(page.url()).searchParams.get("section")).toBe("dashboard");
    expect(dashboardClientRequests).toEqual([]);

    for (const path of ["/api/clients", "/api/clients/1", "/api/clients/1/orders"]) {
        const response = await page.request.get(path);
        expect(response.status(), path).toBe(403);
    }

    const ordersResponse = await page.request.get("/api/orders?mine=true&limit=50");
    expect(ordersResponse.ok()).toBeTruthy();
    const managerOrder = (await ordersResponse.json()).orders.find(order => order.orderNumber === "REVENUE-WORK");
    expect(managerOrder).toMatchObject({
        customerName: "Revenue Mixed",
        phone: "+7 900 200-00-01",
        email: "mixed@example.test",
        telegram: "@revenue_mixed",
        preferredContactMethod: "Telegram",
        preferredContactValue: "@revenue_mixed",
        clientTotalSpent: 500
    });

    await page.goto("/manager.html?section=myOrders");
    const card = page.locator(".order-card", { hasText: "REVENUE-WORK" });
    await expect(card).toBeVisible();
    await card.locator(".order-card-header").click();
    await card.getByRole("button", { name: "Клиент", exact: true }).click();
    await expect(card).toContainText("Revenue Mixed");
    await expect(card).toContainText("+7 900 200-00-01");
    await expect(card).toContainText("mixed@example.test");
    await expect(card.locator(".open-client")).toHaveCount(0);
});
