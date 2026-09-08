const assert = require("assert");
const childProcess = require("child_process");
const ExcelJS = require("exceljs");
const fs = require("fs");
const os = require("os");
const path = require("path");

const scenarios = ["existing", "new", "conflicts", "rollback-temp", "rollback-final", "rollback-insert", "rollback-structure", "stale", "ordinary"];

function runChild(scenario) {
    const result = childProcess.spawnSync(process.execPath, [__filename, scenario], {
        encoding: "utf8",
        env: process.env,
        maxBuffer: 20 * 1024 * 1024
    });
    if (result.status !== 0) {
        process.stderr.write(result.stdout || "");
        process.stderr.write(result.stderr || "");
        process.exit(result.status || 1);
    }
    return JSON.parse(String(result.stdout || "{}").trim().split(/\r?\n/).pop());
}

async function main() {
    if (!process.argv[2]) {
        const results = scenarios.map(runChild);
        console.log(JSON.stringify({ success: true, scenarios: results }));
        return;
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mat-apply-"));
    const databasePath = path.join(tempDir, "matmix.db");
    const archivePath = path.join(tempDir, "catalog-imports");
    fs.copyFileSync(path.join(__dirname, "..", "database", "matmix.db"), databasePath);
    process.env.MATMIX_DB_PATH = databasePath;
    process.env.CATALOG_IMPORT_ARCHIVE_PATH = archivePath;

    const database = require("../database");
    const catalogImport = require("../services/catalogImport");
    const { buildCatalogImportPreview, createCatalogImportPreviewToken, applyCatalogImport } = catalogImport;
    const user = { id: 1, name: "MAT apply runtime" };

    const products = await database.all("SELECT * FROM products WHERE deleted_at IS NULL AND external_id GLOB 'MAT-[0-9]*' ORDER BY id LIMIT 3");
    assert(products.length >= 3, "fixture requires three existing MAT products");
    const [a, b, c] = products;

    function parsedRows(rows) {
        return {
            errors: [], warnings: [], sheetName: "ШАБЛОН", rowsRead: rows.length,
            categoryRows: [], subcategoryRows: [], productRows: rows
        };
    }

    async function importBuffer() {
        const workbook = new ExcelJS.Workbook();
        workbook.addWorksheet("ШАБЛОН").addRow(["MAT apply runtime"]);
        return workbook.xlsx.writeBuffer();
    }

    function existingRow(product, targetMat, rowNumber, overrides = {}) {
        return {
            rowNumber,
            productId: Number(product.id),
            title: product.title,
            externalId: targetMat,
            category: product.category || "",
            subcategory: product.subcategory || "",
            productGroup: product.product_group || "",
            price: product.price,
            priceText: product.price === null || product.price === undefined ? "" : String(product.price),
            rawPrice: product.price,
            weight: product.weight || 0,
            unit: product.unit || "шт",
            sortOrder: product.sort_order || 0,
            ...overrides
        };
    }

    async function previewApply(rows, runtime = {}, fileName = "mat-apply.xlsx") {
        const parsed = parsedRows(rows);
        const preview = await createCatalogImportPreviewToken(
            database,
            parsed,
            { name: fileName, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            user,
            await importBuffer()
        );
        assert.strictEqual(preview.canImport, true, JSON.stringify(preview.summary));
        const result = await applyCatalogImport(database, preview.token, {}, user, runtime);
        [result.backupPath, result.excelCopyPath].forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) fs.rmSync(filePath, { force: true });
        });
        return result;
    }

    async function mats(ids) {
        const placeholders = ids.map(() => "?").join(",");
        return database.all(`SELECT id, external_id FROM products WHERE id IN (${placeholders}) ORDER BY id`, ids);
    }

    async function assertNoTemporaryMat() {
        const rows = await database.all("SELECT id FROM products WHERE external_id LIKE '__MAT_IMPORT_TMP__:%'");
        assert.deepStrictEqual(rows, []);
    }

    if (process.argv[2] === "existing") {
        const beforeIds = [a.id, b.id, c.id];
        const relationBefore = await database.all("SELECT product_id, attribute_definition_id, value_text, value_number, value_boolean FROM product_attribute_values WHERE product_id = ? ORDER BY id", [a.id]);
        const imagesBefore = await database.all("SELECT product_id, image_url, alt_text, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY id", [a.id]);
        await previewApply([existingRow(a, "MAT-990001", 10)]);
        const afterSimple = await database.get("SELECT id, external_id FROM products WHERE id = ?", [a.id]);
        assert.deepStrictEqual([afterSimple.id, afterSimple.external_id], [a.id, "MAT-990001"]);

        const current = await mats(beforeIds);
        const currentById = new Map(current.map(row => [row.id, row.external_id]));
        await previewApply([
            existingRow(a, currentById.get(a.id), 20, { externalId: currentById.get(b.id) }),
            existingRow(b, currentById.get(b.id), 21, { externalId: currentById.get(a.id) })
        ], {}, "swap.xlsx");
        const afterSwap = await mats([a.id, b.id]);
        assert.strictEqual(afterSwap.find(row => row.id === a.id).external_id, currentById.get(b.id));
        assert.strictEqual(afterSwap.find(row => row.id === b.id).external_id, currentById.get(a.id));

        const chainBefore = await mats([a.id, b.id, c.id]);
        const chainMap = new Map(chainBefore.map(row => [row.id, row.external_id]));
        await previewApply([
            existingRow(a, chainMap.get(b.id), 30),
            existingRow(b, chainMap.get(c.id), 31),
            existingRow(c, "MAT-990002", 32)
        ], {}, "chain.xlsx");
        const afterChain = await mats([a.id, b.id, c.id]);
        assert.strictEqual(afterChain.find(row => row.id === a.id).external_id, chainMap.get(b.id));
        assert.strictEqual(afterChain.find(row => row.id === b.id).external_id, chainMap.get(c.id));
        assert.strictEqual(afterChain.find(row => row.id === c.id).external_id, "MAT-990002");

        const cycleBefore = await mats([a.id, b.id, c.id]);
        const cycleMap = new Map(cycleBefore.map(row => [row.id, row.external_id]));
        await previewApply([
            existingRow(a, cycleMap.get(b.id), 40),
            existingRow(b, cycleMap.get(c.id), 41),
            existingRow(c, cycleMap.get(a.id), 42)
        ], {}, "cycle.xlsx");
        const afterCycle = await mats([a.id, b.id, c.id]);
        assert.strictEqual(afterCycle.find(row => row.id === a.id).external_id, cycleMap.get(b.id));
        assert.strictEqual(afterCycle.find(row => row.id === b.id).external_id, cycleMap.get(c.id));
        assert.strictEqual(afterCycle.find(row => row.id === c.id).external_id, cycleMap.get(a.id));
        const relationAfter = await database.all("SELECT product_id, attribute_definition_id, value_text, value_number, value_boolean FROM product_attribute_values WHERE product_id = ? ORDER BY id", [a.id]);
        const imagesAfter = await database.all("SELECT product_id, image_url, alt_text, sort_order, is_primary FROM product_images WHERE product_id = ? ORDER BY id", [a.id]);
        assert.deepStrictEqual(relationAfter, relationBefore);
        assert.deepStrictEqual(imagesAfter, imagesBefore);
        await assertNoTemporaryMat();
        console.log(JSON.stringify({ scenario: "existing", idsPreserved: true, swap: true, chain: true, cycle: true, relations: true, images: true, temporaryMat: 0 }));
        return;
    }

    if (process.argv[2] === "new") {
        const oldMat = a.external_id;
        const freeMat = "MAT-990010";
        const newTitle = "MAT apply new freed product";
        await previewApply([
            existingRow(a, freeMat, 50),
            { rowNumber: 51, title: newTitle, externalId: oldMat, category: a.category || "", subcategory: a.subcategory || "", productGroup: "New", price: 10, priceText: "10", rawPrice: 10, weight: 1, unit: "шт", sortOrder: 99 },
            { rowNumber: 52, title: "MAT apply new free product", externalId: "MAT-990011", category: a.category || "", subcategory: a.subcategory || "", productGroup: "New", price: 11, priceText: "11", rawPrice: 11, weight: 1, unit: "шт", sortOrder: 100 }
        ], {}, "new-freed.xlsx");
        const newProduct = await database.get("SELECT id, external_id FROM products WHERE title = ?", [newTitle]);
        const newFreeProduct = await database.get("SELECT id, external_id FROM products WHERE title = ?", ["MAT apply new free product"]);
        assert(newProduct);
        assert(newFreeProduct);
        assert.strictEqual(newProduct.external_id, oldMat);
        assert.strictEqual(newFreeProduct.external_id, "MAT-990011");
        assert.strictEqual((await database.get("SELECT external_id FROM products WHERE id = ?", [a.id])).external_id, freeMat);
        await assertNoTemporaryMat();
        console.log(JSON.stringify({ scenario: "new", freedMatToNew: true, temporaryMat: 0 }));
        return;
    }

    if (process.argv[2] === "stale") {
        const parsed = parsedRows([existingRow(a, "MAT-990011", 55)]);
        const preview = await createCatalogImportPreviewToken(database, parsed, { name: "stale.xlsx" }, user, await importBuffer());
        await database.run("UPDATE products SET external_id = ? WHERE id = ?", ["MAT-990012", a.id]);
        let staleError = null;
        try { await applyCatalogImport(database, preview.token, {}, user); } catch (caught) { staleError = caught; }
        assert.strictEqual(staleError?.code, "IMPORT_MAT_PLAN_STALE");
        assert.strictEqual((await database.get("SELECT external_id FROM products WHERE id = ?", [a.id])).external_id, "MAT-990012");
        await assertNoTemporaryMat();
        console.log(JSON.stringify({ scenario: "stale", blocked: true, code: staleError.code, temporaryMat: 0 }));
        return;
    }

    if (process.argv[2] === "conflicts") {
        const unaffected = await database.get("SELECT id, external_id FROM products WHERE id NOT IN (?, ?) AND deleted_at IS NULL AND external_id GLOB 'MAT-[0-9]*' ORDER BY id LIMIT 1", [a.id, b.id]);
        const ownerPreview = await createCatalogImportPreviewToken(database, parsedRows([existingRow(a, unaffected.external_id, 58)]), { name: "unaffected.xlsx" }, user, await importBuffer());
        assert.strictEqual(ownerPreview.canImport, false);
        const duplicatePreview = await createCatalogImportPreviewToken(database, parsedRows([
            existingRow(a, "MAT-990030", 59),
            existingRow(b, "MAT-990030", 60)
        ]), { name: "duplicate.xlsx" }, user, await importBuffer());
        assert.strictEqual(duplicatePreview.canImport, false);
        console.log(JSON.stringify({ scenario: "conflicts", unaffectedOwnerBlocked: true, duplicateTargetBlocked: true }));
        return;
    }

    if (process.argv[2] === "ordinary") {
        const sameMat = a.external_id;
        const preview = await createCatalogImportPreviewToken(database, parsedRows([existingRow(a, sameMat, 56, { title: `${a.title} renamed` })]), { name: "ordinary.xlsx" }, user, await importBuffer());
        assert.strictEqual(preview.canImport, true);
        await applyCatalogImport(database, preview.token, {}, user);
        const repeated = await createCatalogImportPreviewToken(database, parsedRows([existingRow(a, sameMat, 57, { title: `${a.title} renamed` })]), { name: "ordinary-repeat.xlsx" }, user, await importBuffer());
        assert.strictEqual(repeated.canImport, true);
        await applyCatalogImport(database, repeated.token, {}, user);
        assert.strictEqual((await database.get("SELECT external_id FROM products WHERE id = ?", [a.id])).external_id, sameMat);
        console.log(JSON.stringify({ scenario: "ordinary", sameMatRename: true, idempotent: true }));
        return;
    }

    const target = "MAT-990020";
    const original = await database.get("SELECT external_id FROM products WHERE id = ?", [a.id]);
    const rows = [existingRow(a, target, 60)];
    let runtime = {};
    if (process.argv[2] === "rollback-temp") runtime = { afterMatTemporaryPhase: () => { throw new Error("controlled temp failure"); } };
    if (process.argv[2] === "rollback-final") runtime = { afterMatFinalPhase: () => { throw new Error("controlled final failure"); } };
    if (process.argv[2] === "rollback-structure") runtime = { beforeStructureApply: () => { throw new Error("controlled structure failure"); } };
    if (process.argv[2] === "rollback-insert") {
        runtime = { afterNewProductInsert: () => { throw new Error("controlled insert failure"); } };
        rows.push({ rowNumber: 61, title: "MAT apply rollback new", externalId: original.external_id, category: a.category || "", subcategory: a.subcategory || "", productGroup: "New", price: 10, priceText: "10", rawPrice: 10, weight: 1, unit: "шт", sortOrder: 99 });
    }
    let error = null;
    try { await previewApply(rows, runtime, `${process.argv[2]}.xlsx`); } catch (caught) { error = caught; }
    assert(error, "controlled failure expected");
    assert.strictEqual((await database.get("SELECT external_id FROM products WHERE id = ?", [a.id])).external_id, original.external_id);
    if (process.argv[2] === "rollback-insert") assert.strictEqual(await database.get("SELECT id FROM products WHERE title = ?", ["MAT apply rollback new"]), undefined);
    await assertNoTemporaryMat();
    console.log(JSON.stringify({ scenario: process.argv[2], rolledBack: true, temporaryMat: 0 }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
