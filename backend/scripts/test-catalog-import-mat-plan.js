const assert = require("assert");
const catalogImport = require("../services/catalogImport");
const { normalizeMatCode, planMatReassignments } = require("../services/catalogImportMatPlan");

const products = [
    { id: 1, externalId: "MAT-000001", title: "A" },
    { id: 2, externalId: "MAT-000002", title: "B" },
    { id: 3, externalId: "MAT-000003", title: "C" },
    { id: 4, externalId: "MAT-000010", title: "Unaffected" },
    { id: 5, externalId: "MAT-000020", title: "Independent" }
];
const row = (sourceRowId, productId, targetMat, extra = {}) => ({ sourceRowId, productId, targetMat, ...extra });
const codes = plan => plan.conflicts.map(conflict => conflict.code);
const expectValid = (plan, count) => {
    assert.strictEqual(plan.valid, true, JSON.stringify(plan.conflicts));
    assert.strictEqual(plan.summary.valid, true);
    assert.strictEqual(plan.summary.reassignmentCount, count);
    assert.deepStrictEqual(plan.conflicts, []);
};

// A: existing -> free MAT.
expectValid(planMatReassignments({ products, rows: [row("a", 1, "MAT-000004")] }), 1);

// B: freed MAT -> another existing product.
expectValid(planMatReassignments({ products, rows: [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000005")] }), 2);

// C: exact two-product swap.
const swap = planMatReassignments({ products, rows: [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000001")] });
expectValid(swap, 2);
assert.deepStrictEqual(swap.reassignments.map(item => [item.productId, item.oldMat, item.targetMat]), [[1, "MAT-000001", "MAT-000002"], [2, "MAT-000002", "MAT-000001"]]);
assert.deepStrictEqual([swap.finalOwnerByMat["MAT-000001"], swap.finalOwnerByMat["MAT-000002"]], [2, 1]);
assert.strictEqual(swap.dependencyGroups.length, 1);
assert.deepStrictEqual(swap.dependencyGroups[0].productIds, [1, 2]);
assert.strictEqual(swap.dependencyGroups[0].kind, "cycle_or_swap");
assert.deepStrictEqual(swap.dependencyGroups[0].edges, [
    { from: "product:1", to: "product:2", mat: "MAT-000002" },
    { from: "product:2", to: "product:1", mat: "MAT-000001" }
]);

// D: chain A -> B -> C -> free.
const chain = planMatReassignments({ products, rows: [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000003"), row("c", 3, "MAT-000004")] });
expectValid(chain, 3);
assert.deepStrictEqual(chain.reassignments.map(item => item.productId), [1, 2, 3]);
assert.deepStrictEqual(chain.dependencyGroups[0].productIds, [1, 2, 3]);
assert.strictEqual(chain.dependencyGroups[0].kind, "chain");
assert.deepStrictEqual(chain.dependencyGroups[0].edges, [
    { from: "product:1", to: "product:2", mat: "MAT-000002" },
    { from: "product:2", to: "product:3", mat: "MAT-000003" }
]);
assert.deepStrictEqual([chain.finalOwnerByMat["MAT-000001"], chain.finalOwnerByMat["MAT-000002"], chain.finalOwnerByMat["MAT-000003"], chain.finalOwnerByMat["MAT-000004"]], [undefined, 1, 2, 3]);

// E: duplicate target MAT after normalization.
assert(codes(planMatReassignments({ products, rows: [row("a", 1, "MAT-000004"), row("b", 2, "MAT-000004")] })).includes("DUPLICATE_TARGET_MAT"));

// F: unaffected owner is a real conflict and is not safely applicable.
const unaffected = planMatReassignments({ products, rows: [row("a", 1, "MAT-000010")] });
assert.strictEqual(unaffected.valid, false);
assert.deepStrictEqual(unaffected.conflicts, [{ code: "TARGET_MAT_HELD_BY_UNAFFECTED_PRODUCT", mat: "MAT-000010", ownerProductId: 4, requestingProductId: 1, sourceRowId: "a" }]);
assert.strictEqual(unaffected.finalOwnerByMat["MAT-000010"], 4); // diagnostic preserves unaffected owner; valid=false forbids apply.

// G: explicit ambiguity remains ambiguity.
const ambiguous = planMatReassignments({ products, rows: [row("a", null, "MAT-000004", { candidates: [{ id: 1 }, { id: 2 }] })] });
assert(codes(ambiguous).includes("AMBIGUOUS_IDENTITY"));
assert.strictEqual(ambiguous.items[0].identityState, "unresolved");

// H: explicit new product gets a stable new identity.
const newProduct = planMatReassignments({ products, rows: [row("new", null, "MAT-000004", { isNew: true })] });
expectValid(newProduct, 0);
assert.strictEqual(newProduct.summary.newCount, 1);
assert.strictEqual(newProduct.finalOwnerByMat["MAT-000004"], "new:new");
const freedToNew = planMatReassignments({ products, rows: [row("a", 1, "MAT-000004"), row("new", null, "MAT-000001", { isNew: true })] });
expectValid(freedToNew, 1);
assert.deepStrictEqual(freedToNew.dependencyGroups[0].edges, [{ from: "new:new", to: "product:1", mat: "MAT-000001" }]);

// I: idempotence from a successful final state.
const first = planMatReassignments({ products, rows: [row("a", 1, "MAT-000004"), row("b", 2, "MAT-000005")] });
const appliedMatByProductId = Object.fromEntries(Object.entries(first.finalOwnerByMat).map(([mat, owner]) => [owner, mat]));
const appliedProducts = products.map(product => ({ ...product, externalId: appliedMatByProductId[product.id] || product.externalId }));
const second = planMatReassignments({ products: appliedProducts, rows: [row("a", 1, "MAT-000004"), row("b", 2, "MAT-000005")] });
expectValid(second, 0);
assert.deepStrictEqual(second.finalOwnerByMat, first.finalOwnerByMat);
assert.deepStrictEqual(second.dependencyGroups, []);

// J: excluded row does not free its MAT and cannot be used by another row.
const excluded = planMatReassignments({ products, rows: [row("excluded", 1, "MAT-000004", { action: "exclude" }), row("take", 2, "MAT-000001")] });
assert.strictEqual(excluded.reassignments.length, 1);
assert.strictEqual(excluded.finalOwnerByMat["MAT-000001"], 1);
assert.strictEqual(excluded.finalOwnerByMat["MAT-000002"], 2);
assert.strictEqual(excluded.items.find(item => item.sourceRowId === "excluded").action, "excluded");

// K: complete output is canonical under three row orders, including conflicts and dependencies.
const orderRows = [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000002"), row("c", 5, "MAT-000021")];
const plans = [orderRows, [orderRows[2], orderRows[0], orderRows[1]], [orderRows[1], orderRows[2], orderRows[0]]].map(rows => planMatReassignments({ products, rows }));
plans.slice(1).forEach(plan => assert.deepStrictEqual(plan, plans[0]));

// K2: missing source identity is invalid for new/unresolved rows, never index-derived.
const noSourceNewRows = [row(undefined, null, "MAT-000030", { isNew: true }), row(undefined, null, "MAT-000031", { isNew: true })];
const noSourcePlans = [noSourceNewRows, [...noSourceNewRows].reverse(), [noSourceNewRows[1], noSourceNewRows[0]]]
    .map(rows => planMatReassignments({ products, rows }));
noSourcePlans.forEach(plan => {
    assert.strictEqual(plan.valid, false);
    assert(plan.conflicts.some(item => item.code === "MISSING_SOURCE_IDENTITY"));
    assert(plan.items.every(item => !item.sourceRowId));
    assert(plan.items.every(item => !Object.values(item).includes("new:1") && !Object.values(item).includes("new:2")));
});
noSourcePlans.slice(1).forEach(plan => assert.deepStrictEqual(plan, noSourcePlans[0]));
const existingWithoutSource = planMatReassignments({ products, rows: [{ productId: 1, targetMat: "MAT-000004" }] });
assert.strictEqual(existingWithoutSource.valid, true);
assert.strictEqual(existingWithoutSource.reassignments[0].productId, 1);
assert(existingWithoutSource.reassignments.every(item => !item.sourceRowId));
const existingNoSourceConflictA = planMatReassignments({ products, rows: [{ productId: 1, targetMat: "MAT-000004" }, { productId: 2, targetMat: "MAT-000004" }] });
const existingNoSourceConflictB = planMatReassignments({ products, rows: [{ productId: 2, targetMat: "MAT-000004" }, { productId: 1, targetMat: "MAT-000004" }] });
assert.deepStrictEqual(existingNoSourceConflictA, existingNoSourceConflictB);

// L: longer cycle A -> B -> C -> A.
const cycle = planMatReassignments({ products, rows: [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000003"), row("c", 3, "MAT-000001")] });
assert.strictEqual(cycle.valid, true);
assert.strictEqual(cycle.dependencyGroups[0].kind, "cycle_or_swap");
assert.deepStrictEqual(cycle.dependencyGroups[0].productIds, [1, 2, 3]);

// M: identity is explicit, never inferred from target-MAT owner; duplicate existing target is blocked.
const identity = planMatReassignments({ products, rows: [row("a", 1, "MAT-000002"), row("b", 2, "MAT-000004")] });
assert.strictEqual(identity.reassignments[0].productId, 1);
assert.strictEqual(identity.finalOwnerByMat["MAT-000002"], 1);
assert(codes(planMatReassignments({ products, rows: [row("a", 1, "MAT-000004"), row("b", 1, "MAT-000005")] })).includes("DUPLICATE_PRODUCT_TARGET"));

// Unresolved identity is not new, does not occupy/free MAT, and cannot change ownership.
for (const options of [{}, { isNew: false }]) {
    const unresolved = planMatReassignments({ products, rows: [row("u", null, "MAT-000001", options)] });
    assert(codes(unresolved).includes("UNRESOLVED_IDENTITY"));
    assert.strictEqual(unresolved.items[0].identityState, "unresolved");
    assert.strictEqual(unresolved.items[0].isNew, false);
    assert.strictEqual(unresolved.finalOwnerByMat["MAT-000001"], 1);
}

// New and existing rows cannot silently share one MAT.
assert(codes(planMatReassignments({ products, rows: [row("a", 1, "MAT-000004"), row("new", null, "MAT-000004", { isNew: true })] })).includes("DUPLICATE_TARGET_MAT"));
assert(codes(planMatReassignments({ products, rows: [row("a", 1, "MAT-000004", { isNew: true })] })).includes("CONFLICTING_IDENTITY_FLAGS"));

// Normalization contract is shared with catalogImport.js.
for (const value of [null, undefined, "", "   ", "nan", "NaN", " NAN ", 0, 1, 541, false, true,
    "MAT-000001", "mat-000001", " MAT-000001 ", "MAT - 000001", "M A T - 0 0 0 0 0 1",
    "ＭＡＴ－０００００１", "ＭＡＴ - ０００００１"]) {
    assert.strictEqual(normalizeMatCode(value), catalogImport.normalizeMatCode(value));
}
assert.strictEqual(normalizeMatCode("MAT - 000001"), "MAT-000001");
assert.strictEqual(normalizeMatCode("nan"), "");

// Planner is pure and does not mutate products, rows, or nested candidate data.
const mutationInput = { products: JSON.parse(JSON.stringify(products)), rows: [row("m", null, "MAT-000004", { isNew: true, candidates: [{ id: 9 }] })] };
const mutationSnapshot = JSON.parse(JSON.stringify(mutationInput));
planMatReassignments(mutationInput);
assert.deepStrictEqual(mutationInput, mutationSnapshot);

console.log(JSON.stringify({ success: true, cases: "A-M+review", swap: swap.dependencyGroups, chain: chain.dependencyGroups }));
