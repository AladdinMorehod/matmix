"use strict";

const { BATCH_MATS } = require("./data/mix-sand-cement-repair-core-batch1");

function extractJsonDocuments(text) {
  const source = String(text ?? "");
  const documents = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (start < 0) {
      if (character !== "{" && character !== "[") continue;
      start = index;
      depth = 1;
      inString = false;
      escaped = false;
      continue;
    }

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{" || character === "[") depth += 1;
    else if (character === "}" || character === "]") depth -= 1;

    if (depth === 0) {
      try { documents.push(JSON.parse(source.slice(start, index + 1))); }
      catch { /* Ignore braces in non-JSON log text. */ }
      start = -1;
    }
  }
  return documents;
}

function rowId(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null;
  return typeof row.externalId === "string" ? row.externalId
    : typeof row.external_id === "string" ? row.external_id
      : null;
}

function findRunnerRows(documents) {
  const reportsWithRows = documents.filter(value => value && !Array.isArray(value)
    && typeof value === "object" && Array.isArray(value.rows));
  if (reportsWithRows.length) return reportsWithRows[reportsWithRows.length - 1].rows;

  const topLevelRows = documents.filter(value => rowId(value) !== null);
  if (topLevelRows.length) return topLevelRows;

  return documents.flatMap(value => Array.isArray(value) ? value : []);
}

function validateRunnerScope(output, expected = BATCH_MATS) {
  const documents = Array.isArray(output) ? output : extractJsonDocuments(output);
  const rows = findRunnerRows(documents);
  const ids = rows.map(rowId);
  if (ids.some(id => id === null)) throw new Error("Runner output contains a row without externalId.");

  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) throw new Error(`Duplicate MAT rows: ${[...new Set(duplicates)].join(",")}`);

  const actualSet = new Set(ids);
  const expectedSet = new Set(expected);
  const missing = expected.filter(id => !actualSet.has(id));
  const extra = ids.filter(id => !expectedSet.has(id));
  if (ids.length !== expected.length || missing.length || extra.length) {
    throw new Error(`Runner MAT scope mismatch: missing=[${missing.join(",")}], extra=[${extra.join(",")}]`);
  }
  return ids;
}

if (require.main === module) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", chunk => { input += chunk; });
  process.stdin.on("end", () => {
    try {
      const ids = validateRunnerScope(input);
      console.log(`RUNNER_SCOPE_VALIDATION=PASS`);
      console.log(`RUNNER_MATS=${ids.join(",")}`);
    } catch (error) {
      console.error(`RUNNER_SCOPE_VALIDATION=FAIL: ${error.message}`);
      process.exitCode = 1;
    }
  });
}

module.exports = { extractJsonDocuments, validateRunnerScope };
