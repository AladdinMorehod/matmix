const { test, expect } = require("@playwright/test");
const ExcelJS = require("exceljs");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
}

async function createImportableCatalog() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("ШАБЛОН");
    sheet.addRow(["Категория - Сухие смеси", "Категория - Сухие смеси", null, null, null, null, null, null, null, null, "CAT-000001"]);
    sheet.addRow(["Подкатегория - Штукатурки", "Подкатегория - Штукатурки", null, null, null, null, null, null, null, null, "SUB-000001"]);
    [
        ["Ротбанд тестовый", "Гипсовые штукатурки", 750, 30, "MAT-000001"],
        ["Волма тестовая", "Гипсовые смеси", 500, 25, "MAT-000002"],
        ["Церезит тестовый", "Готовые", 500, 25, "MAT-000003"]
    ].forEach(([title, group, price, weight, code]) => {
        sheet.addRow([title, title, null, "шт", price, null, null, group, null, weight, code]);
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

test("catalog import apply returns success, archives Excel and consumes its token", async ({ page }) => {
    await login(page);

    const workbook = await createImportableCatalog();

    const previewResponse = await page.request.post("/api/products/import/preview", {
        multipart: {
            file: {
                name: "catalog-runtime-archive-regression.xlsx",
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                buffer: workbook
            }
        }
    });
    expect(previewResponse.ok()).toBeTruthy();
    const preview = await previewResponse.json();
    expect(preview.canImport).toBe(true);

    const applyResponse = await page.request.post("/api/products/import/apply", {
        data: { token: preview.token, options: {} }
    });
    expect(applyResponse.ok()).toBeTruthy();
    const applied = await applyResponse.json();
    expect(applied.success).toBe(true);
    expect(applied.excelCopyUrl).toMatch(/^\/api\/products\/import\/excel-copy\/\d+$/);

    const archivedWorkbook = await page.request.get(applied.excelCopyUrl);
    expect(archivedWorkbook.ok()).toBeTruthy();
    expect((await archivedWorkbook.body()).length).toBeGreaterThan(1000);

    const repeatedApply = await page.request.post("/api/products/import/apply", {
        data: { token: preview.token, options: {} }
    });
    expect(repeatedApply.status()).toBe(409);
    expect((await repeatedApply.json()).code).toBe("PREVIEW_TOKEN_EXPIRED");
});

test("catalog import UI shows a successful apply and offers the archived workbook", async ({ page }) => {
    await login(page);
    await page.locator('.crm-nav [data-section="catalogImport"]').click();
    await expect(page.locator("#importView h1")).toHaveText("Импорт каталога");

    await page.locator("#catalogImportFile").setInputFiles({
        name: "catalog-ui-runtime-archive-regression.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        buffer: await createImportableCatalog()
    });
    await page.locator(".import-preview-submit").click();
    await expect(page.locator(".import-status.success")).toContainText("Критических ошибок нет");
    await expect(page.locator(".import-apply-submit")).toBeEnabled();

    await page.locator(".import-apply-submit").click();
    await expect(page.locator(".crm-modal-form")).toBeVisible();
    await page.locator(".crm-modal-primary").click();

    await expect(page.locator(".import-apply-result h2")).toHaveText("Импорт применен");
    await expect(page.locator(".crm-toast-success").filter({ hasText: "Импорт каталога применен" })).toBeVisible();
    await expect(page.getByText("Не удалось применить импорт", { exact: false })).toHaveCount(0);
    await expect(page.locator("#import-preview-results")).toHaveCount(0);
    await expect(page.locator(".import-download-copy")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.locator(".import-download-copy").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^catalog-import-.*\.xlsx$/);
});
