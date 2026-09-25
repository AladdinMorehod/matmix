"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const REVIEW = require("../../docs/product-content/plaster-putty-backfill-review.json");
const SOURCE = require("./backfill-source-reviewed-content");
const PROD = require("./apply-source-reviewed-content-production");

const targetCommit = "a".repeat(40);
function approvedFixture(review = REVIEW) {
    const rows = review.rows.map(expected => {
        const attributes = [
            ...expected.regularAdds.map((item, index) => ({ code: item.code, value: item.value, action: item.status, typed: { code: item.code }, dataType: item.code === "consumption_10mm" ? "number" : null, currentIds: item.status === "WILL_UPDATE" ? [7000 + index] : [], currentValue: item.status === "WILL_UPDATE" ? item.current : null, currentCount: item.status === "WILL_UPDATE" ? 1 : 0, needsSource: [] })),
            ...(expected.existingOk || []).map((item, index) => ({ code: item.code, action: "EXISTING_OK", typed: { code: item.code }, dataType: item.code === "consumption_10mm" ? "number" : null, currentIds: [8000 + index], currentValue: item.current, currentCount: 1, needsSource: [] })),
            ...Object.values(expected.main).filter(item => ["WILL_ADD", "WILL_UPDATE"].includes(item.status)).map((item, index) => ({ code: item.code, value: item.proposed, action: item.status, typed: { code: item.code }, currentIds: item.status === "WILL_UPDATE" ? [7500 + index] : [], currentValue: item.status === "WILL_UPDATE" ? item.current : null, currentCount: item.status === "WILL_UPDATE" ? 1 : 0, needsSource: [] })),
            ...expected.conflicts.map(item => ({ code: item.code, action: "SOURCE_CONFLICT", needsSource: [] }))
        ];
        for (const item of expected.needsSource) {
            const existing = attributes.find(attribute => attribute.code === item.code);
            if (existing) existing.needsSource.push(item);
            else attributes.push({ code: item.code, action: "NEEDS_SOURCE", needsSource: [item] });
        }
        return {
            MAT: expected.MAT, TITLE: expected.TITLE, category: "Смеси",
            subcategory: expected.category === "Штукатурка" ? "Штукатурка" : "Шпаклевка",
            guardReasons: expected.disposition === "IDENTITY_BLOCKED" ? [...expected.identityGuard.reasons] : [],
            attributes,
            brand: { action: expected.brand.status, current: expected.brand.current, proposed: expected.brand.proposed }
        };
    });
    return {
        mode: "dry-run", allowlistCount: 61, rows,
        summaries: {
            plaster: { willAdd: 200, willUpdate: 0, existingOk: 8 },
            putty: { willAdd: 297, willUpdate: 0, existingOk: 0 },
            brand: { SAFE_TO_FILL: 57, EXISTING_OK: 1, CONFLICT: 0, IDENTITY_BLOCKED: 3, NO_REVIEWED_BRAND: 0 }
        }
    };
}

function testArgsAndHostGuards() {
    const opts = PROD.parseArgs(["--db", PROD.PRODUCTION_DB, "--expected-commit", targetCommit]);
    assert.strictEqual(opts.apply, false, "dry-run is default");
    assert.throws(() => PROD.parseArgs(["--db", PROD.PRODUCTION_DB]), /expected-commit/);
    assert.throws(() => PROD.parseArgs(["--db", PROD.PRODUCTION_DB, "--expected-commit", targetCommit, "--apply"]), /Apply requires --confirm/);
    assert.throws(() => PROD.assertProductionTarget("/tmp/matmix.db"), /must be exactly/);
    assert.doesNotThrow(() => PROD.assertProductionTarget(PROD.PRODUCTION_DB));
    const git = (_bin, args) => args[0] === "rev-parse" ? `${targetCommit}\n` : "";
    assert.strictEqual(PROD.checkReleaseEnvironment({ expectedCommit: targetCommit, repoDir: path.resolve(__dirname, "../.."), git, hostname: "matmix-prod-01", apply: true }).trackedWorktree, "clean");
    assert.throws(() => PROD.checkReleaseEnvironment({ expectedCommit: "b".repeat(40), repoDir: process.cwd(), git, hostname: "matmix-prod-01" }), /differs from/);
    assert.throws(() => PROD.checkReleaseEnvironment({ expectedCommit: targetCommit, repoDir: process.cwd(), git: (_bin, args) => args[0] === "rev-parse" ? `${targetCommit}\n` : " M tracked.js", hostname: "matmix-prod-01" }), /not clean/);
    assert.throws(() => PROD.checkReleaseEnvironment({ expectedCommit: targetCommit, repoDir: process.cwd(), git, hostname: "developer-laptop", apply: true }), /restricted to hostname/);
}

function testLogicalPreflight() {
    const report = approvedFixture();
    const approved = PROD.validateProductionPreflight(report, REVIEW);
    assert.strictEqual(approved.counts.willAdd, 497);
    assert.strictEqual(approved.brandPlan.length, 57);
    assert.deepStrictEqual([...approved.reviewedSafePlan.keys()].slice(0, 1).length, 1);

    assert.strictEqual(SOURCE.attributeValuesEqual("8,5", 8.5, "text"), true);
    assert.strictEqual(SOURCE.attributeValuesEqual("8.5", 8.5, "text"), true);
    assert.strictEqual(SOURCE.attributeValuesEqual("19,5", 19.5, "text"), true);
    assert.strictEqual(SOURCE.attributeValuesEqual("около 8,5", 8.5, "text"), false, "approximate values keep their qualifier and remain blocked");
    assert.strictEqual(SOURCE.attributeValuesEqual("8,5", 9, "text"), false, "different numeric values remain a mismatch");
    assert.strictEqual(SOURCE.attributeValuesEqual("Гипсовая", "Цементная", "text"), false, "different ordinary text values remain a mismatch");
    const decimalCommaExisting = approvedFixture();
    const mat2Consumption = decimalCommaExisting.rows.find(row => row.MAT === "MAT-000002").attributes.find(item => item.code === "consumption_10mm");
    assert(mat2Consumption, "review fixture must include MAT-000002/consumption_10mm");
    mat2Consumption.dataType = "text";
    mat2Consumption.currentValue = "8,5";
    const decimalCommaPreflight = PROD.validateProductionPreflight(decimalCommaExisting, REVIEW);
    assert.strictEqual(mat2Consumption.action, "EXISTING_OK");
    assert.strictEqual(decimalCommaPreflight.reviewedSafePlan.has("MAT-000002|consumption_10mm"), false, "numerically equal existing value must not be written");

    const approximateExisting = approvedFixture();
    approximateExisting.rows.find(row => row.MAT === "MAT-000002").attributes.find(item => item.code === "consumption_10mm").currentValue = "около 8,5";
    assert.throws(() => PROD.validateProductionPreflight(approximateExisting, REVIEW), /Approved existing value changed/);

    const mismatchReview = JSON.parse(JSON.stringify(REVIEW));
    mismatchReview.rows.find(row => row.MAT === "MAT-000002").existingOk.find(item => item.code === "consumption_10mm").current = 9;
    const mismatchedDecimal = approvedFixture(mismatchReview);
    mismatchedDecimal.rows.find(row => row.MAT === "MAT-000002").attributes.find(item => item.code === "consumption_10mm").currentValue = "8,5";
    assert.throws(() => PROD.validateProductionPreflight(mismatchedDecimal, mismatchReview), /Approved existing value changed/);

    const alreadyFilled = approvedFixture();
    const existingProductType = alreadyFilled.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "product_type");
    existingProductType.action = "EXISTING_OK";
    existingProductType.currentValue = existingProductType.value;
    existingProductType.currentIds = [9001];
    existingProductType.currentCount = 1;
    delete existingProductType.value;
    alreadyFilled.summaries.plaster.willAdd--;
    alreadyFilled.summaries.plaster.existingOk++;
    const partial = PROD.validateProductionPreflight(alreadyFilled, REVIEW);
    assert.strictEqual(partial.counts.willAdd, 496);
    assert.strictEqual(partial.counts.existingOk, 9);
    assert.strictEqual(partial.reviewedSafePlan.size, 496, "already matching approved value must be skipped");

    const existingBlockedProposal = approvedFixture();
    const consumption = existingBlockedProposal.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "consumption_10mm");
    assert(consumption, "fixture must include the reviewed non-writable consumption field");
    consumption.action = "EXISTING_OK";
    consumption.currentValue = "около 8,5";
    consumption.currentIds = [9101];
    consumption.currentCount = 1;
    consumption.existingNonWritable = true;
    consumption.existingProposalValue = "около 8,5";
    existingBlockedProposal.summaries.plaster.existingOk++;
    const blockedProposalPreflight = PROD.validateProductionPreflight(existingBlockedProposal, REVIEW);
    assert.strictEqual(blockedProposalPreflight.counts.existingReviewedBlockedProposal, 1);
    assert.strictEqual(blockedProposalPreflight.reviewedSafePlan.size, 497, "matching blocked proposal must not enter the write plan");

    const absentBlockedProposal = approvedFixture();
    assert.strictEqual(SOURCE.expectedActionMap(absentBlockedProposal).has("MAT-000001|consumption_10mm"), false, "NEEDS_SOURCE fields must not enter the write plan when absent");
    const liveCandidateBlockedField = approvedFixture();
    const unresolvedLiveAdd = liveCandidateBlockedField.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "consumption_10mm");
    unresolvedLiveAdd.action = "WILL_ADD";
    unresolvedLiveAdd.value = "около 8,5";
    unresolvedLiveAdd.typed = { valueText: "около 8,5", valueNumber: null, valueBoolean: null };
    unresolvedLiveAdd.currentValue = null;
    unresolvedLiveAdd.currentCount = 0;
    liveCandidateBlockedField.summaries.plaster.willAdd++;
    const unresolvedPreflight = PROD.validateProductionPreflight(liveCandidateBlockedField, REVIEW);
    assert.strictEqual(unresolvedPreflight.counts.willAdd, 497, "unreviewed live candidate must be excluded from approved counts");
    assert.strictEqual(unresolvedPreflight.reviewedSafePlan.has("MAT-000001|consumption_10mm"), false, "NEEDS_SOURCE candidate must not enter the approved write plan");
    assert.strictEqual(unresolvedPreflight.excludedBlockedActionsByGroup.plaster.WILL_ADD, 1);

    const missingSchemaReviewField = approvedFixture();
    missingSchemaReviewField.rows.find(row => row.MAT === "MAT-000001").attributes.push({
        code: "drying_time", action: "WILL_ADD", value: 24, typed: { valueNumber: 24 }, currentIds: [], currentValue: null, currentCount: 0, needsSource: []
    });
    missingSchemaReviewField.summaries.plaster.willAdd++;
    const schemaBlockedPreflight = PROD.validateProductionPreflight(missingSchemaReviewField, REVIEW);
    assert.strictEqual(schemaBlockedPreflight.reviewedSafePlan.has("MAT-000001|drying_time"), false, "schema-blocked drying_time must stay out of the approved write plan");

    const changedBlockedProposal = approvedFixture();
    const changedConsumption = changedBlockedProposal.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "consumption_10mm");
    changedConsumption.action = "EXISTING_OK";
    changedConsumption.currentValue = "8,5";
    changedConsumption.currentCount = 1;
    changedConsumption.existingNonWritable = true;
    changedConsumption.existingProposalValue = "около 8,5";
    changedBlockedProposal.summaries.plaster.existingOk++;
    assert.throws(() => PROD.validateProductionPreflight(changedBlockedProposal, REVIEW), /Existing blocked proposal value differs/);

    const identityBlockedExisting = approvedFixture();
    identityBlockedExisting.rows.find(row => row.MAT === "MAT-000027").attributes.push({
        code: "consumption_10mm", action: "EXISTING_OK", currentValue: "8–9", currentCount: 1,
        existingNonWritable: true, existingProposalValue: "8–9", needsSource: []
    });
    identityBlockedExisting.summaries.plaster.existingOk++;
    assert.throws(() => PROD.validateProductionPreflight(identityBlockedExisting, REVIEW), /Attribute is not in approved safe preview/);

    const conflictingExisting = approvedFixture();
    const conflict = conflictingExisting.rows.find(row => row.MAT === "MAT-000006").attributes.find(item => item.action === "SOURCE_CONFLICT");
    conflict.action = "EXISTING_OK";
    conflict.currentValue = "Гипсовая";
    conflict.currentCount = 1;
    conflict.existingNonWritable = true;
    conflict.existingProposalValue = "Гипсовая";
    conflictingExisting.summaries.plaster.existingOk++;
    assert.throws(() => PROD.validateProductionPreflight(conflictingExisting, REVIEW), /Attribute is not in approved safe preview|Conflict field set differs/);

    const differentExisting = approvedFixture();
    const mismatchedProductType = differentExisting.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "product_type");
    mismatchedProductType.action = "EXISTING_OK";
    mismatchedProductType.currentValue = "Different type";
    mismatchedProductType.currentIds = [9002];
    mismatchedProductType.currentCount = 1;
    assert.throws(() => PROD.validateProductionPreflight(differentExisting, REVIEW), /Existing value differs from approved add/);

    const completed = approvedFixture();
    for (const row of completed.rows) for (const attr of row.attributes) {
        if (attr.action === "WILL_ADD") {
            attr.action = "EXISTING_OK";
            attr.currentValue = attr.value;
            attr.currentIds = [10000 + completed.rows.indexOf(row)];
            attr.currentCount = 1;
            delete attr.value;
        }
        if (row.brand.action === "SAFE_TO_FILL") {
            row.brand.action = "EXISTING_OK";
            row.brand.current = row.brand.proposed;
        }
    }
    completed.summaries.plaster = { willAdd: 0, willUpdate: 0, existingOk: 208 };
    completed.summaries.putty = { willAdd: 0, willUpdate: 0, existingOk: 297 };
    completed.summaries.brand = { SAFE_TO_FILL: 0, EXISTING_OK: 58, CONFLICT: 0, IDENTITY_BLOCKED: 3, NO_REVIEWED_BRAND: 0 };
    assert.strictEqual(PROD.validateProductionPreflight(completed, REVIEW).reviewedSafePlan.size, 0);
    assert.strictEqual(PROD.validatePostApply(completed, REVIEW).existingOk, 505, "repeat validation after apply must be a no-op state");

    const updateReview = JSON.parse(JSON.stringify(REVIEW));
    const approvedUpdate = updateReview.rows.find(row => row.MAT === "MAT-000001").main.product_type;
    approvedUpdate.status = "WILL_UPDATE";
    approvedUpdate.current = "Old approved baseline";
    const updateFixture = approvedFixture(updateReview);
    updateFixture.summaries.plaster.willAdd--;
    updateFixture.summaries.plaster.willUpdate++;
    const updatePlan = SOURCE.validateApprovedReviewLogical(updateFixture, updateReview);
    assert.strictEqual(updatePlan.reviewedSafePlan.get("MAT-000001|product_type").action, "WILL_UPDATE");
    const unexpectedUpdate = approvedFixture(updateReview);
    unexpectedUpdate.rows.find(row => row.MAT === "MAT-000001").attributes.find(item => item.code === "product_type").currentValue = "Unexpected current value";
    assert.throws(() => SOURCE.validateApprovedReviewLogical(unexpectedUpdate, updateReview), /Approved update current value changed/);

    const wrongCount = approvedFixture();
    wrongCount.summaries.putty.willAdd = 296;
    assert.throws(() => PROD.validateProductionPreflight(wrongCount, REVIEW), /Attribute logical preflight mismatch|Category attribute counts differ/);

    const wrongTitle = approvedFixture();
    wrongTitle.rows[0].TITLE = "Different product";
    assert.throws(() => PROD.validateProductionPreflight(wrongTitle, REVIEW), /identity\/title mismatch/);

    const wrongCategory = approvedFixture();
    wrongCategory.rows[0].subcategory = "Шпаклевка";
    assert.throws(() => PROD.validateProductionPreflight(wrongCategory, REVIEW), /category\/subcategory guard/);

    const wrongConflict = approvedFixture();
    wrongConflict.rows.find(row => row.MAT === "MAT-000007").attributes.find(item => item.action === "SOURCE_CONFLICT").code = "purpose";
    assert.throws(() => PROD.validateProductionPreflight(wrongConflict, REVIEW), /Conflict field set differs|Source-conflict field list mismatch|Approved attribute no longer matches live plan/);

    const wrongBrand = approvedFixture();
    wrongBrand.summaries.brand.SAFE_TO_FILL = 56;
    assert.throws(() => PROD.validateProductionPreflight(wrongBrand, REVIEW), /Brand logical preflight mismatch/);

    const wrongIdentity = approvedFixture();
    wrongIdentity.rows.find(row => row.MAT === "MAT-000060").brand.action = "SAFE_TO_FILL";
    assert.throws(() => PROD.validateProductionPreflight(wrongIdentity, REVIEW), /Brand status\/current value differs|Brand logical preflight mismatch|Identity-blocked MAT list mismatch/);
}

function testPostApplyGuard() {
    const report = approvedFixture();
    for (const row of report.rows) {
        for (const attr of row.attributes) if (attr.action === "WILL_ADD") {
            attr.action = "EXISTING_OK";
            attr.currentValue = attr.value;
            attr.currentIds = [12000 + row.attributes.indexOf(attr)];
            attr.currentCount = 1;
            delete attr.value;
        }
        if (row.brand.action === "SAFE_TO_FILL") {
            row.brand.action = "EXISTING_OK";
            row.brand.current = row.brand.proposed;
        }
    }
    report.summaries.plaster = { willAdd: 0, willUpdate: 0, existingOk: 208 };
    report.summaries.putty = { willAdd: 0, willUpdate: 0, existingOk: 297 };
    report.summaries.brand = { SAFE_TO_FILL: 0, EXISTING_OK: 58, CONFLICT: 0, IDENTITY_BLOCKED: 3, NO_REVIEWED_BRAND: 0 };
    assert.strictEqual(PROD.validatePostApply(report, REVIEW).existingOk, 505);
    report.summaries.putty.existingOk = 296;
    assert.throws(() => PROD.validatePostApply(report, REVIEW), /Post-apply logical state mismatch|Category attribute counts differ/);
}

async function testDecimalCommaDatabaseFixture() {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-decimal-comma-preflight-"));
    const fixturePath = path.join(fixtureRoot, "fixture.db");
    fs.copyFileSync(path.resolve(__dirname, "../database/matmix.db"), fixturePath);
    const db = await SOURCE.openDatabase(fixturePath, false);
    try {
        const definitionUpdate = await db.run(`UPDATE product_attribute_definitions SET data_type='text'
            WHERE code='consumption_10mm' AND is_active=1`);
        assert.strictEqual(definitionUpdate.changes, 1, "fixture must model a production text definition");
        const update = await db.run(`UPDATE product_attribute_values SET value_text='8,5', value_number=NULL
            WHERE id=(SELECT v.id FROM product_attribute_values v JOIN products p ON p.id=v.product_id
                JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
                WHERE p.external_id='MAT-000002' AND d.code='consumption_10mm')`);
        assert.strictEqual(update.changes, 1, "fixture must replace exactly MAT-000002/consumption_10mm representation");
        const report = await SOURCE.inspect(db);
        const attribute = report.rows.find(row => row.MAT === "MAT-000002").attributes.find(item => item.code === "consumption_10mm");
        assert.strictEqual(attribute.currentValue, "8,5");
        assert.strictEqual(attribute.dataType, "text");
        assert.strictEqual(attribute.action, "EXISTING_OK");
        const preflight = PROD.validateProductionPreflight(report, REVIEW);
        assert.strictEqual(preflight.reviewedSafePlan.has("MAT-000002|consumption_10mm"), false, "equivalent numeric representation must produce no write");
    } finally {
        await db.close();
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
}

async function main() {
    testArgsAndHostGuards();
    testLogicalPreflight();
    testPostApplyGuard();
    await testDecimalCommaDatabaseFixture();
    console.log(JSON.stringify({ success: true, explicitDryRunAndConfirm: true, exactProductionPath: true, expectedCommitAndCleanTrackedTree: true,
        hostnameGuard: true, exact61ProductLogicalReview: true, exactCountsAndBlockedFields: true, postApplyCounts: true, decimalCommaNumericExistingOk: true }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
