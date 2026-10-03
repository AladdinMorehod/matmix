"use strict";

const assert = require("assert");
const { PROTECTED_TABLES, assertProtectedTablesUnchanged } = require("./validate-mix-sand-cement-repair-core-batch1-snapshot");

function capture() {
  return {
    tables: {
      products: [{ id: 109, external_id: "MAT-000109", brand: null, title: "Exact title" }],
      product_attribute_values: [],
      product_attribute_definitions: [{ id: 1, code: "base", data_type: "text" }],
      product_attribute_templates: [{ id: 1, attribute_definition_id: 1, section: "regular" }],
      product_images: [{ id: 1, product_id: 109, image_url: "/placeholder.webp" }]
    },
    runtime: { dbFileSha256: "before", walBytes: 128, shmBytes: 64 }
  };
}

const before = capture();
const afterRuntimeOnly = capture();
afterRuntimeOnly.runtime = { dbFileSha256: "after", walBytes: 0, shmBytes: 96, journalMode: "wal" };
assert.deepStrictEqual(assertProtectedTablesUnchanged(before, afterRuntimeOnly).protectedTables, [...PROTECTED_TABLES]);
console.log("PASS SQLite runtime artifact changes do not fail product-data snapshot");

for (const table of PROTECTED_TABLES) {
  const changed = capture();
  changed.tables[table] = [...changed.tables[table], { id: 999, unexpected_write: true }];
  assert.throws(() => assertProtectedTablesUnchanged(before, changed), new RegExp(`Protected product data changed during dry-run: ${table}`));
}
console.log("PASS mutations in every protected product-data table are rejected");

const reordered = capture();
reordered.tables.products = [...reordered.tables.products].reverse();
assert.doesNotThrow(() => assertProtectedTablesUnchanged(before, reordered));
console.log("PASS row ordering does not create a false positive");

const incomplete = capture();
delete incomplete.tables.product_images;
assert.throws(() => assertProtectedTablesUnchanged(before, incomplete), /missing protected table rows: product_images/);
console.log("PASS incomplete snapshots fail closed");
