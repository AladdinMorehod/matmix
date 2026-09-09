const { test, expect } = require("@playwright/test");

test("deleted MAT product pages are not publicly served", async ({ request }) => {
    for (const mat of ["MAT-004160", "MAT-004161"]) {
        const response = await request.get(`/product/${mat}`);
        expect(response.status()).not.toBe(200);
        const body = await response.text();
        expect(body).not.toContain(mat);
    }
    const catalog = await request.get("/api/public/products");
    expect(catalog.status()).toBe(200);
    const payload = await catalog.json();
    const products = payload.products || payload.items || [];
    expect(products.some(item => ["MAT-004160", "MAT-004161"].includes(item.externalId || item.external_id))).toBe(false);
});
