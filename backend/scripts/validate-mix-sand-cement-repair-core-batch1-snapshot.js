"use strict";

const fs = require("fs");

const PROTECTED_TABLES = Object.freeze([
  "products",
  "product_attribute_values",
  "product_attribute_definitions",
  "product_attribute_templates",
  "product_images"
]);

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function rowsFor(snapshot, table) {
  const tables = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
    ? (snapshot.tables || snapshot)
    : null;
  if (!tables || !Array.isArray(tables[table])) {
    throw new Error(`Snapshot is missing protected table rows: ${table}`);
  }
  return tables[table];
}

function canonicalRows(rows) {
  return rows.map(row => stable(row)).sort();
}

function assertProtectedTablesUnchanged(before, after) {
  for (const table of PROTECTED_TABLES) {
    const beforeRows = canonicalRows(rowsFor(before, table));
    const afterRows = canonicalRows(rowsFor(after, table));
    if (stable(beforeRows) !== stable(afterRows)) {
      throw new Error(`Protected product data changed during dry-run: ${table}`);
    }
  }
  return { unchanged: true, protectedTables: [...PROTECTED_TABLES] };
}

function main(args) {
  if (args.length !== 2) throw new Error("Usage: node validate-mix-sand-cement-repair-core-batch1-snapshot.js <before.json> <after.json>");
  const before = JSON.parse(fs.readFileSync(args[0], "utf8"));
  const after = JSON.parse(fs.readFileSync(args[1], "utf8"));
  const result = assertProtectedTablesUnchanged(before, after);
  console.log("PRODUCT_DATA_SNAPSHOT=UNCHANGED");
  console.log(`PROTECTED_TABLES=${result.protectedTables.join(",")}`);
}

if (require.main === module) {
  try { main(process.argv.slice(2)); }
  catch (error) {
    console.error(`PRODUCT_DATA_SNAPSHOT=CHANGED: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { PROTECTED_TABLES, assertProtectedTablesUnchanged };
