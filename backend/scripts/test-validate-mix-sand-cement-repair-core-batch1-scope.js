"use strict";

const assert = require("assert");
const { validateRunnerScope } = require("./validate-mix-sand-cement-repair-core-batch1-scope");

const expected = ["MAT-000109", "MAT-000117", "MAT-000118"];
const row = externalId => JSON.stringify({ externalId, identityStatus: "IDENTITY_CONFIRMED" });
const summary = JSON.stringify({ mode: "dry-run", summary: { total: 3 } }, null, 2);

function rejectsScope(rows, pattern) {
  assert.throws(() => validateRunnerScope(`${rows.join("\n")}\n${summary}`, expected), pattern);
}

// Runner's actual format is one JSON row per product followed by a separate summary.
assert.deepStrictEqual(validateRunnerScope(`${row(expected[2])}\n${row(expected[0])}\n${row(expected[1])}\n${summary}`, expected),
  [expected[2], expected[0], expected[1]]);

rejectsScope([row(expected[0]), row(expected[1]), row("MAT-000120")], /scope mismatch/);
rejectsScope([row(expected[0]), row(expected[1])], /scope mismatch/);
rejectsScope([row(expected[0]), row(expected[0]), row(expected[1]), row(expected[2])], /Duplicate MAT rows/);

// Also accept a combined report object that carries its product rows in `rows`.
assert.deepStrictEqual(validateRunnerScope(JSON.stringify({
  mode: "dry-run",
  rows: expected.map(externalId => ({ externalId })),
  summary: { total: 3 }
}), expected), expected);

console.log("mix sand/cement/repair batch scope parser tests passed");
