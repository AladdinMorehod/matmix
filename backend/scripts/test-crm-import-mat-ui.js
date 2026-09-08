const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const importSource = fs.readFileSync(path.join(__dirname, "..", "..", "public", "js", "crm", "import.js"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "..", "..", "public", "css", "manager.css"), "utf8");

const context = {
    console,
    document: { getElementById: () => null },
    importView: null,
    currentUser: null,
    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
    },
    formatMoney: value => String(value),
    window: {
        setTimeout: () => 0,
        clearTimeout: () => {},
        scrollY: 0,
        CrmImportUi: null
    }
};
vm.createContext(context);
vm.runInContext(importSource, context, { filename: "public/js/crm/import.js" });
const ui = context.window.CrmImportUi;
assert(ui, "CRM import UI test surface is available");

const emptyPlan = { reassignments: [], conflicts: [], dependencyGroups: [] };
assert.strictEqual(ui.renderImportMatPlanPanel(emptyPlan), "", "A/N: no MAT changes keeps ordinary import UI clean");

const reassignment = {
    valid: true,
    reassignments: [{ productId: 478, productTitle: "Пергамин 15м2", oldMat: "MAT-000541", targetMat: "MAT-000542", dependencyGroupId: null }],
    conflicts: [],
    dependencyGroups: []
};
const reassignmentHtml = ui.renderImportMatPlanPanel(reassignment);
assert(reassignmentHtml.includes("Изменения MAT"));
assert(reassignmentHtml.includes("MAT-000541") && reassignmentHtml.includes("MAT-000542"), "B: OLD → NEW is visible");
assert(reassignmentHtml.includes("productId: 478"), "B: product identity is visible");
assert(reassignmentHtml.includes("публичном адресе товара"), "B: public URL impact is visible");

const groupedPlan = {
    valid: true,
    reassignments: [
        { productId: 478, productTitle: "Пергамин 15м2", oldMat: "MAT-000541", targetMat: "MAT-000542", dependencyGroupId: 0 },
        { productId: 901, productTitle: "Пробковый компенсатор", oldMat: "MAT-000900", targetMat: "MAT-000541", dependencyGroupId: 0 }
    ],
    conflicts: [],
    dependencyGroups: [{ kind: "cycle_or_swap", identities: ["product:478", "product:901"], productIds: [478, 901] }]
};
const swapHtml = ui.renderImportMatPlanPanel(groupedPlan);
assert.strictEqual((swapHtml.match(/class="import-mat-group"/g) || []).length, 1, "C: swap is one dependency group");
assert(swapHtml.includes("swap / cycle") && swapHtml.includes("Будет применено атомарно"));

const chainHtml = ui.renderImportMatPlanPanel({
    ...groupedPlan,
    dependencyGroups: [{ kind: "chain", identities: ["product:478", "product:901"], productIds: [478, 901] }]
});
assert(chainHtml.includes("цепочка"), "D: chain group label is visible");

const conflictHtml = ui.renderImportMatPlanPanel({
    valid: false,
    reassignments: [],
    dependencyGroups: [],
    conflicts: [{ code: "TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT", mat: "MAT-000541", ownerProductId: 902 }]
});
assert(conflictHtml.includes("Этот MAT занят товаром"), "E: blocking conflict has human message");
assert(conflictHtml.includes("TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT"));
assert.strictEqual(ui.getImportMatConflictMessage({ code: "SOMETHING_NEW" }), "Конфликт MAT требует проверки.", "F: unknown code uses safe fallback");
assert(ui.renderImportMatPlanPanel({ valid: false, reassignments: [], dependencyGroups: [], conflicts: [{ code: "UNRESOLVED_IDENTITY" }] }).includes("Не определено"), "G: unresolved identity is blocking and readable");

const previewA = { token: "a", canImport: true, matPlan: reassignment };
const previewB = { token: "b", canImport: true, matPlan: groupedPlan };
ui.replaceImportPreviewFromResponse({ data: { preview: previewA } });
assert.strictEqual(ui.getState().importPreview, previewA, "H: initial preview is stored");
ui.handleImportApplyError({ code: "IMPORT_MAT_PLAN_STALE" });
assert.strictEqual(ui.getState().importPreviewStale, true, "I: stale state is set");
assert.strictEqual(ui.getImportCanApply(), false, "I: stale preview cannot apply");
assert.strictEqual(ui.getState().importApplyMatSummary, null, "I: stale error clears MAT summary");
ui.replaceImportPreviewFromResponse({ data: { preview: previewB } });
assert.strictEqual(ui.getState().importPreview, previewB, "H: PATCH response replaces full preview");
assert.strictEqual(ui.getState().importPreviewStale, false, "H: refreshed preview clears stale state");
assert.strictEqual(ui.getImportCanApply(), true, "H: canImport comes from refreshed preview");
assert(ui.renderImportMatPlanPanel(ui.getState().importPreview.matPlan).includes("MAT-000900"), "H: old panel data is gone after replacement");
assert.strictEqual(ui.getImportMatErrorMessage({ data: { code: "IMPORT_MAT_PLAN_STALE" } }), "Каталог CRM изменился после предварительного просмотра. Обновите предварительный просмотр перед импортом.", "I: stale message");
assert.strictEqual(ui.getImportMatErrorMessage({ data: { code: "IMPORT_MAT_REASSIGNMENT_FAILED" } }), "Не удалось завершить переназначение MAT. Импорт отменён.", "J: safe apply failure message");
ui.handleImportApplyError({ data: { code: "IMPORT_MAT_REASSIGNMENT_FAILED" } });
assert.strictEqual(ui.getState().importPreviewStale, false, "J: non-stale apply failure does not invalidate preview");
assert.strictEqual(ui.getState().importApplyResult, null, "J: failed apply clears success result");

const confirmationHtml = ui.buildImportApplyConfirmation({ summary: {}, matPlan: { reassignments: [{}, {}, {}], dependencyGroups: [{}] } });
assert(confirmationHtml.includes("Будет изменено MAT: 3"), "K: confirmation count is runtime-generated");
assert(confirmationHtml.includes("Связанных переназначений: 1") && confirmationHtml.includes("публичные URL"), "K: confirmation dependency/url warning is runtime-generated");
assert.strictEqual(ui.buildImportApplyConfirmation({ summary: {}, matPlan: { reassignments: [], dependencyGroups: [] } }).includes("Будет изменено MAT:"), false, "K/N: ordinary confirmation has no MAT warning");
assert(ui.buildImportSuccessSummary({ reassignmentCount: 2, dependencyGroupCount: 1 }).includes("MAT переназначено: 2"), "L: success count is runtime-generated");
assert.strictEqual(ui.buildImportSuccessSummary(null), "", "L: cleared success state has no MAT count");
ui.resetStateForTest();
const ordinaryPreview = { token: "ordinary", canImport: true, summary: { updated: 1 }, matPlan: emptyPlan };
ui.replaceImportPreviewFromResponse({ data: { preview: ordinaryPreview } });
assert.strictEqual(ui.getImportCanApply(), true, "N: ordinary preview keeps Apply available");
assert.strictEqual(ui.renderImportMatPlanPanel(ordinaryPreview.matPlan), "", "N: ordinary preview has no MAT panel");
assert.strictEqual(ui.buildImportSuccessSummary(ui.getState().importApplyMatSummary), "", "N: ordinary preview has no MAT success count");
assert(cssSource.includes("flex-wrap") && cssSource.includes("import-mat-pair"), "M: MAT pairs wrap on narrow layouts");
assert(!importSource.includes("reassignments.filter(item => String(item.dependencyGroupId)"), "Performance: no per-group full reassignment scan");
assert(importSource.includes("importMatErrorPlan") && importSource.includes("result.data.preview"), "H/I: resolution and API error plans are refreshed from backend payload");

console.log(JSON.stringify({ success: true, cases: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"] }));
