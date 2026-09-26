"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { FIXED_ALLOWLIST, openDatabase, inspect, fullValueSnapshot, protectedHashes, createOnlineBackup, runBatch, expectedActionMap, parseArgs } = require("./backfill-source-reviewed-content");
const REVIEW = require("../../docs/product-content/plaster-putty-backfill-review.json");

const SOURCE_DB = path.resolve(__dirname, "../database/matmix.db");
const digest = value => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-content-backfill-test-"));
const fixturePath = path.join(tempRoot, "fixture.db");
fs.copyFileSync(SOURCE_DB, fixturePath);

async function testExistingBlockedProposal() {
    const isolatedPath = path.join(tempRoot, "blocked-existing-fixture.db");
    fs.copyFileSync(SOURCE_DB, isolatedPath);
    const db = await openDatabase(isolatedPath, false);
    try {
        const definition = await db.get("SELECT id FROM product_attribute_definitions WHERE code='consumption_10mm' AND is_active=1");
        assert(definition, "fixture needs consumption_10mm definition");
        await db.run("UPDATE product_attribute_definitions SET data_type='text' WHERE id=?", [definition.id]);
        await insertValue(db, "MAT-000001", "consumption_10mm", "около 8,5");
        const before = await fullValueSnapshot(db);
        const report = await runBatch(db);
        const row = report.rows.find(item => item.MAT === "MAT-000001");
        const attribute = row.attributes.find(item => item.code === "consumption_10mm");
        assert.strictEqual(attribute.action, "EXISTING_OK", "exact preexisting blocked proposal is classified as EXISTING_OK");
        assert.strictEqual(attribute.existingNonWritable, true);
        assert.strictEqual(attribute.currentValue, "около 8,5");
        assert.strictEqual(expectedActionMap(report).has("MAT-000001|consumption_10mm"), false, "matching blocked value must not enter the write plan");
        assert.deepStrictEqual(await fullValueSnapshot(db), before, "dry-run must not modify fixture values");
    } finally {
        await db.close();
    }
}

async function snapshot(db) {
    return {
        products: await db.all("SELECT * FROM products ORDER BY id"),
        images: await db.all("SELECT * FROM product_images ORDER BY id"),
        values: await fullValueSnapshot(db)
    };
}

async function insertValue(db, mat, code, value) {
    const product = await db.get("SELECT id FROM products WHERE external_id=?", [mat]);
    const definition = await db.get("SELECT id,data_type FROM product_attribute_definitions WHERE code=? AND is_active=1", [code]);
    assert(product && definition, `Fixture needs active definition for ${mat}/${code}`);
    const seed = definition.data_type === "number" ? (Number.isFinite(Number(value)) ? Number(value) : 42) : value;
    const text = definition.data_type === "text" ? String(seed) : null;
    const number = definition.data_type === "number" ? Number(seed) : null;
    assert(definition.data_type === "text" || Number.isFinite(number), `Fixture seed must fit ${definition.data_type}`);
    return db.run(`INSERT INTO product_attribute_values
        (product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
        VALUES(?,?,?,?,?,NULL,7,'fixture','fixture')`, [product.id, definition.id, text, number, null]);
}

async function main() {
    await testExistingBlockedProposal();
    assert.throws(() => parseArgs(["--db", fixturePath, "--apply"]), /requires --confirm/);
    assert.throws(() => parseArgs(["--db", fixturePath, "--apply", "--dry-run"]), /Choose either/);
    const db = await openDatabase(fixturePath, false);
    try {
        for (const reviewed of REVIEW.rows) {
            const product = await db.get("SELECT id FROM products WHERE external_id=?", [reviewed.MAT]);
            assert(product, `Fixture product is missing: ${reviewed.MAT}`);
            const approved = [
                ...reviewed.regularAdds,
                ...Object.values(reviewed.main).filter(item => item.status === "WILL_ADD").map(item => ({ code: item.code }))
            ];
            for (const item of approved) {
                const definition = await db.get("SELECT id FROM product_attribute_definitions WHERE code=?", [item.code]);
                if (definition) await db.run("DELETE FROM product_attribute_values WHERE product_id=? AND attribute_definition_id=?", [product.id, definition.id]);
            }
            if (reviewed.brand.status === "SAFE_TO_FILL") await db.run("UPDATE products SET brand=NULL WHERE id=?", [product.id]);
        }
        const firstPlan = await inspect(db);
        assert.strictEqual(firstPlan.rows.length, 61, "only the 61 allowed MAT products are inspected");
        assert.strictEqual(new Set(firstPlan.rows.map(row => row.MAT)).size, 61);
        assert.deepStrictEqual(firstPlan.rows.map(row => row.MAT).sort(), [...FIXED_ALLOWLIST].sort());
        const updateCandidate = firstPlan.rows.flatMap(row => row.attributes.map(attribute => ({ row, attribute }))).find(({ attribute }) => attribute.action === "WILL_ADD" && attribute.typed.valueText !== null);
        const conflictCandidate = firstPlan.rows.flatMap(row => row.attributes.map(attribute => ({ row, attribute }))).find(({ attribute }) => attribute.action === "SOURCE_CONFLICT");
        const unresolvedCandidate = firstPlan.rows.flatMap(row => row.attributes.map(attribute => ({ row, attribute }))).find(({ attribute }) => attribute.needsSource.length > 0 && attribute.proposedValues.length === 0);
        assert(updateCandidate, "fixture source must contain a safe reviewed text proposal");
        assert(conflictCandidate, "fixture source must contain a source conflict");
        assert(unresolvedCandidate, "fixture source must contain a source-unresolved proposal");

        await db.run("UPDATE products SET title=title||' fixture identity drift' WHERE external_id='MAT-000033'");
        const identityReport = await inspect(db);
        const drifted = identityReport.rows.find(row => row.MAT === "MAT-000033");
        assert.strictEqual(drifted.status, "IDENTITY_UNCERTAIN");
        assert(drifted.attributes.every(attribute => !["WILL_ADD", "WILL_UPDATE"].includes(attribute.action)), "title guard must block every write for a changed identity");

        await insertValue(db, updateCandidate.row.MAT, updateCandidate.attribute.code, "fixture old value");
        const updateRow = await db.get(`SELECT v.id FROM product_attribute_values v JOIN products p ON p.id=v.product_id
            JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id=? AND d.code=?`, [updateCandidate.row.MAT, updateCandidate.attribute.code]);
        await insertValue(db, conflictCandidate.row.MAT, conflictCandidate.attribute.code, "fixture conflict value");
        await insertValue(db, unresolvedCandidate.row.MAT, unresolvedCandidate.attribute.code, "fixture unresolved value");
        const beforeDryRun = await snapshot(db);
        const dryReport = await runBatch(db);
        assert.strictEqual(digest(await snapshot(db)), digest(beforeDryRun), "dry-run must not mutate any fixture table");
        const updatePlan = dryReport.rows.find(row => row.MAT === updateCandidate.row.MAT).attributes.find(item => item.code === updateCandidate.attribute.code);
        assert.strictEqual(updatePlan.action, "WILL_UPDATE");
        assert.deepStrictEqual(updatePlan.currentIds, [updateRow.id]);
        assert.strictEqual(dryReport.rows.find(row => row.MAT === conflictCandidate.row.MAT).attributes.find(item => item.code === conflictCandidate.attribute.code).action, "SOURCE_CONFLICT");
        assert.strictEqual(dryReport.rows.find(row => row.MAT === unresolvedCandidate.row.MAT).attributes.find(item => item.code === unresolvedCandidate.attribute.code).action, "NO_WRITE");
        assert(dryReport.rows.every(row => row.attributes.every(attribute => attribute.code !== "brand")), "brand must not be part of attribute writes");
        assert(dryReport.rows.every(row => typeof row.brand.action === "string"), "brand preview status must be present for every MAT");

        await assert.rejects(runBatch(db, {
            apply: true,
            backup: async () => {
                await db.run("UPDATE product_attribute_values SET value_text='concurrent change' WHERE id=?", [updateRow.id]);
                return { path: "fixture-online-backup", size: 1234 };
            }
        }), /Target values changed after dry-run/);
        await db.run("UPDATE product_attribute_values SET value_text='fixture old value' WHERE id=?", [updateRow.id]);

        const applyReport = await runBatch(db, { apply: true, backup: () => createOnlineBackup(db, fixturePath, tempRoot) });
        assert.strictEqual(applyReport.mode, "applied");
        assert(fs.existsSync(applyReport.backup.path), "apply must create a verified SQLite online backup");
        const after = await snapshot(db);
        const afterUpdate = after.values.find(value => Number(value.id) === Number(updateRow.id));
        assert(afterUpdate, "updated row ID must remain present");
        assert.strictEqual(afterUpdate.value_text, updateCandidate.attribute.value);
        assert.strictEqual(after.values.length - beforeDryRun.values.length, dryReport.rows.flatMap(row => row.attributes).filter(item => item.action === "WILL_ADD").length);
        assert(after.values.every(value => beforeDryRun.values.some(previous => Number(previous.id) === Number(value.id)) || FIXED_ALLOWLIST.includes(value.external_id)), "new rows must belong to the fixed MAT allowlist");
        const afterPlan = await inspect(db);
        assert(afterPlan.rows.flatMap(row => row.attributes).every(item => !["WILL_ADD", "WILL_UPDATE"].includes(item.action)), "second run must be idempotent");
        const protectedAfter = await protectedHashes(db);
        assert.strictEqual(protectedAfter.productsExceptBrand, digest(after.products.map(({ brand, ...product }) => product)));
        assert.strictEqual(protectedAfter.product_images, digest(after.images));

        const brandBefore = await db.get("SELECT brand FROM products WHERE external_id='MAT-000001'");
        const brandApply = await runBatch(db, { apply: true, brandPlan: [{ MAT: "MAT-000001", expectedCurrent: brandBefore.brand, value: "KNAUF" }], backup: async () => ({ path: "fixture-online-backup", size: 1234 }) });
        assert.strictEqual(brandApply.brandAdded, 1, "one explicitly planned canonical brand should be written");
        assert.strictEqual((await db.get("SELECT brand FROM products WHERE external_id='MAT-000001'")).brand, "KNAUF");

        await db.run("UPDATE product_attribute_values SET value_text='rollback original' WHERE id=?", [updateRow.id]);
        await db.run(`CREATE TRIGGER fixture_force_rollback BEFORE UPDATE ON product_attribute_values
            BEGIN SELECT RAISE(ABORT,'fixture rollback'); END`);
        const beforeRollback = await snapshot(db);
        await assert.rejects(runBatch(db, { apply: true, backup: () => createOnlineBackup(db, fixturePath, tempRoot) }), /fixture rollback/);
        assert.strictEqual(digest(await snapshot(db)), digest(beforeRollback), "transaction failure must rollback all earlier writes");
    } finally {
        await db.close();
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    console.log("Source-reviewed content backfill fixture tests passed.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
