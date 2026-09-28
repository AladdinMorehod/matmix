"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mat000076-unis-armored-fix");

const ONLY = Object.freeze([DATA.EXTERNAL_ID]);
const PRODUCT_WRITES = DATA.PRODUCT_MUTABLE_FIELDS;
const normalize = value => value === null || value === undefined ? null : String(value);
const jsonEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function openDatabase(file, writable = false) {
  if (!file || file === ":memory:") throw new Error("An explicit existing --db path is required");
  const resolved = path.resolve(file);
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(resolved, writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY, error => {
      if (error) return reject(error);
      const db = {
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ changes: this.changes, id: this.lastID }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
        all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
        backup(target) { const backup = raw.backup(target); return new Promise((res, rej) => backup.step(-1, error => { if (error) return rej(error); backup.finish(finishError => finishError ? rej(finishError) : res()); })); },
        close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
      };
      db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async err => { await db.close(); reject(err); });
    });
  });
}

function parseArgs(args) {
  const out = { apply: false, only: null }; const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("=");
    if (seen.has(key)) throw new Error(`Duplicate option ${key}`); seen.add(key);
    if (["--apply", "--dry-run"].includes(key)) { if (tail.length) throw new Error(`Unexpected value for ${key}`); if (key === "--apply") out.apply = true; continue; }
    if (!["--db", "--only", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option ${key}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required for ${key}`);
    out[key.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --apply or --dry-run");
  if (!out.db || out.db === ":memory:") throw new Error("Explicit --db path is required");
  if (out.only !== DATA.EXTERNAL_ID) throw new Error(`Exact --only ${DATA.EXTERNAL_ID} is required`);
  if (out.apply && (out.confirm !== DATA.CONFIRM || !out.backupDir)) throw new Error(`Apply requires --confirm ${DATA.CONFIRM} and explicit --backup-dir`);
  if (!out.apply && seen.has("--confirm")) throw new Error("--confirm requires --apply");
  if (!out.apply && seen.has("--backup-dir")) throw new Error("--backup-dir requires --apply");
  return out;
}

function getAttributeValue(row) {
  if (!row) return null;
  if (row.value_text !== null && row.value_text !== undefined) return row.value_text;
  if (row.value_number !== null && row.value_number !== undefined) return Number(row.value_number);
  if (row.value_boolean !== null && row.value_boolean !== undefined) return Boolean(row.value_boolean);
  return null;
}
function exact(value, expected) { return typeof expected === "number" ? Number(value) === expected : normalize(value) === normalize(expected); }
function plannedAttributeMatches(current, change) { return exact(current, change.value); }

async function productRow(db) {
  const rows = await db.all("SELECT * FROM products WHERE external_id=?", [DATA.EXTERNAL_ID]);
  return { row: rows[0] || null, count: rows.length };
}
async function attributeRows(db, productId) {
  return db.all("SELECT v.*,d.code,d.data_type,d.default_unit,d.is_active AS definition_is_active FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id", [productId]);
}
function productGuardIssues(product, count) {
  const issues = [];
  if (count !== 1 || !product) return [`expected one ${DATA.EXTERNAL_ID} row, found ${count}`];
  if (product.external_id !== DATA.EXTERNAL_ID) issues.push("external_id mismatch");
  for (const [field, oldValue] of Object.entries(DATA.OLD_PRODUCT)) if (!exact(product[field], oldValue) && !exact(product[field], DATA.NEW_PRODUCT[field])) issues.push(`${field} is neither exact old guard nor exact target`);
  if (!exact(product.brand, "UNIS")) issues.push("brand guard mismatch");
  if (!exact(product.unit, "шт")) issues.push("unit guard mismatch");
  if (!exact(product.category, DATA.CATEGORY)) issues.push("category guard mismatch");
  if (!exact(product.subcategory, DATA.SUBCATEGORY)) issues.push("subcategory guard mismatch");
  if (Number(product.is_active) !== 1 || product.deleted_at !== null) issues.push("active/deleted guard mismatch");
  if (!exact(product.slug, DATA.SLUG)) issues.push("slug stability guard mismatch");
  return issues;
}

async function inspect(db) {
  const { row: product, count } = await productRow(db);
  const report = { externalId: DATA.EXTERNAL_ID, mode: "dry-run", status: "BLOCKED", guards: [], productChanges: [], attributeChanges: [], summary: { total: 1, willFix: 0, existingOk: 0, blockers: 0, errors: 0 } };
  const observedStates = new Set();
  report.guards.push(...productGuardIssues(product, count));
  if (product) {
    const values = await attributeRows(db, product.id);
    const brandValues = values.filter(value => value.code === "brand");
    if (brandValues.length > 1 || (brandValues.length === 1 && !exact(getAttributeValue(brandValues[0]), "UNIS"))) report.guards.push("brand attribute is duplicate or differs from UNIS; it will not be changed");
    const defs = await db.all("SELECT id,code,data_type,default_unit,is_active FROM product_attribute_definitions WHERE code IN (" + Object.keys(DATA.ATTRIBUTE_CHANGES).map(() => "?").join(",") + ")", Object.keys(DATA.ATTRIBUTE_CHANGES));
    const defByCode = new Map();
    for (const def of defs) { if (defByCode.has(def.code)) report.guards.push(`duplicate definition ${def.code}`); defByCode.set(def.code, def); }
    for (const [field, desired] of Object.entries(DATA.NEW_PRODUCT)) {
      const current = product[field]; const oldValue = DATA.OLD_PRODUCT[field];
      const oldMatch = exact(current, oldValue); const targetMatch = exact(current, desired);
      if (!oldMatch && !targetMatch) report.guards.push(`unexpected products.${field}`);
      else if (oldMatch && !targetMatch) { observedStates.add("OLD"); report.productChanges.push({ field, from: current, to: desired }); }
      else if (targetMatch && !oldMatch) observedStates.add("TARGET");
    }
    for (const [code, change] of Object.entries(DATA.ATTRIBUTE_CHANGES)) {
      const matching = values.filter(value => value.code === code);
      if (matching.length > 1) { report.guards.push(`multiple MAT-000076 values for ${code}`); continue; }
      const currentRow = matching[0] || null; const current = getAttributeValue(currentRow);
      const definition = defByCode.get(code);
      if (!definition || definition.data_type !== change.dataType || (definition.default_unit || null) !== change.unit || Number(definition.is_active) !== 1) {
        report.guards.push(`missing/incompatible existing definition ${code}`); continue;
      }
      const isDesired = plannedAttributeMatches(current, change);
      const isOld = change.old === null ? current === null : exact(current, change.old);
      if (!isDesired && !isOld) { report.guards.push(`attribute guard mismatch ${code}`); continue; }
      if (isOld && !isDesired) observedStates.add("OLD");
      else if (isDesired && !isOld) observedStates.add("TARGET");
      if (currentRow && ((currentRow.value_text !== null && change.dataType !== "text") || (currentRow.value_number !== null && change.dataType !== "number") || currentRow.value_boolean !== null)) {
        report.guards.push(`attribute storage mismatch ${code}`); continue;
      }
      if (isDesired) report.summary.existingOk += 1;
      else { report.summary.willFix += 1; report.attributeChanges.push({ code, from: current, to: change.value, valueId: currentRow?.id || null, definitionId: definition.id }); }
    }
  }
  if (observedStates.size > 1) report.guards.push("current fields mix old and target states; partial corrections are blocked");
  report.summary.blockers = report.guards.length;
  report.status = report.summary.blockers ? "BLOCKED" : report.summary.willFix || report.productChanges.length ? "READY" : "EXISTING_OK";
  return report;
}

async function hashableSnapshot(db) {
  return {
    products: await db.all("SELECT * FROM products ORDER BY id"),
    values: await db.all("SELECT v.*,d.code FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id ORDER BY v.id"),
    definitions: await db.all("SELECT * FROM product_attribute_definitions ORDER BY id"),
    images: await db.all("SELECT * FROM product_images ORDER BY id")
  };
}
function assertNoUnauthorizedChanges(before, after) {
  const targetBefore = before.products.find(row => row.external_id === DATA.EXTERNAL_ID);
  const targetAfter = after.products.find(row => row.external_id === DATA.EXTERNAL_ID);
  const immutableBefore = Object.fromEntries(Object.entries(targetBefore).filter(([key]) => !PRODUCT_WRITES.includes(key)));
  const immutableAfter = Object.fromEntries(Object.entries(targetAfter).filter(([key]) => !PRODUCT_WRITES.includes(key)));
  if (!jsonEqual(immutableBefore, immutableAfter)) throw new Error("MAT-000076 immutable products fields changed");
  const otherProducts = rows => rows.filter(row => row.external_id !== DATA.EXTERNAL_ID);
  if (!jsonEqual(otherProducts(before.products), otherProducts(after.products))) throw new Error("another product row changed");
  const productId = targetBefore.id;
  const allowedCodes = new Set(Object.keys(DATA.ATTRIBUTE_CHANGES));
  const unchangedBefore = before.values.filter(row => row.product_id !== productId || !allowedCodes.has(row.code));
  const unchangedAfter = after.values.filter(row => row.product_id !== productId || !allowedCodes.has(row.code));
  if (!jsonEqual(unchangedBefore, unchangedAfter)) throw new Error("attribute values for another product changed");
  const allowedBefore = before.values.filter(row => row.product_id === productId && allowedCodes.has(row.code));
  const allowedAfter = after.values.filter(row => row.product_id === productId && allowedCodes.has(row.code));
  if (allowedAfter.length !== Object.keys(DATA.ATTRIBUTE_CHANGES).length) throw new Error("MAT-000076 allowed attribute row count is not complete");
  for (const beforeRow of allowedBefore) {
    const afterRow = allowedAfter.find(row => row.id === beforeRow.id);
    if (!afterRow) throw new Error(`MAT-000076 attribute row removed: ${beforeRow.code}`);
    const preservedKeys = Object.keys(beforeRow).filter(key => !["value_text", "value_number", "value_boolean"].includes(key));
    if (!jsonEqual(Object.fromEntries(preservedKeys.map(key => [key, beforeRow[key]])), Object.fromEntries(preservedKeys.map(key => [key, afterRow[key]])))) throw new Error(`MAT-000076 disallowed attribute columns changed: ${beforeRow.code}`);
  }
  for (const afterRow of allowedAfter) if (!allowedBefore.some(row => row.id === afterRow.id) && !DATA.ATTRIBUTE_CHANGES[afterRow.code]) throw new Error(`MAT-000076 unauthorized attribute inserted: ${afterRow.code}`);
  if (!jsonEqual(before.definitions, after.definitions)) throw new Error("attribute definitions changed");
  if (!jsonEqual(before.images, after.images)) throw new Error("product_images changed");
}

async function backupDatabase(db, backupDir) {
  if (!backupDir) throw new Error("Explicit --backup-dir is required");
  const dir = path.resolve(backupDir); await fs.promises.mkdir(dir, { recursive: true });
  const stamp = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
  const target = path.join(dir, `matmix-before-mat000076-unis-armored-${stamp}.backup`);
  await db.backup(target);
  const stat = await fs.promises.stat(target); if (stat.size < 1024) throw new Error(`Backup size validation failed: ${target}`);
  const backupDb = await openDatabase(target, false);
  try { const integrity = await backupDb.get("PRAGMA integrity_check"); if (integrity?.integrity_check !== "ok") throw new Error(`Backup integrity validation failed: ${target}`); }
  finally { await backupDb.close(); }
  return target;
}

async function applyBatch(db, dbPath, options) {
  if (options.confirm !== DATA.CONFIRM || !options.backupDir || options.only !== DATA.EXTERNAL_ID) throw new Error(`Apply requires exact --only ${DATA.EXTERNAL_ID}, --confirm ${DATA.CONFIRM}, and --backup-dir`);
  const preflight = await inspect(db);
  if (preflight.status === "BLOCKED") throw new Error(`Preflight guard blocked: ${preflight.guards.join("; ")}`);
  if (preflight.status === "EXISTING_OK") return { ...preflight, mode: "apply", writes: 0, backup: null };
  const before = await hashableSnapshot(db);
  const backup = await backupDatabase(db, options.backupDir);
  await db.run("BEGIN IMMEDIATE"); let writes = 0;
  try {
    const { row: product, count } = await productRow(db);
    const transactionPreflight = await inspect(db);
    if (count !== 1 || transactionPreflight.status === "BLOCKED") throw new Error(`Transactional preflight guard blocked: ${transactionPreflight.guards.join("; ")}`);
    if (transactionPreflight.status === "EXISTING_OK") { await db.run("COMMIT"); return { ...transactionPreflight, mode: "apply", writes: 0, backup }; }
    for (const change of transactionPreflight.productChanges) {
      const from = DATA.OLD_PRODUCT[change.field];
      const result = await db.run(`UPDATE products SET ${change.field}=? WHERE id=? AND external_id=? AND ${change.field}=?`, [change.to, product.id, DATA.EXTERNAL_ID, from]);
      if (result.changes !== 1) throw new Error(`Product write guard failed for ${change.field}`); writes += 1;
    }
    for (const change of transactionPreflight.attributeChanges) {
      const proposal = DATA.ATTRIBUTE_CHANGES[change.code];
      const text = proposal.dataType === "text" ? String(proposal.value) : null;
      const number = proposal.dataType === "number" ? Number(proposal.value) : null;
      if (change.valueId) {
        const result = await db.run("UPDATE product_attribute_values SET value_text=?,value_number=?,value_boolean=NULL WHERE id=? AND product_id=? AND attribute_definition_id=?", [text, number, change.valueId, product.id, change.definitionId]);
        if (result.changes !== 1) throw new Error(`Attribute update guard failed for ${change.code}`);
      } else {
        const result = await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,NULL,NULL,0,datetime('now'),datetime('now'))", [product.id, change.definitionId, text, number]);
        if (result.changes !== 1) throw new Error(`Attribute insert failed for ${change.code}`);
      }
      writes += 1;
    }
    const post = await inspect(db);
    if (post.status !== "EXISTING_OK") throw new Error(`Postcheck failed: ${post.guards.join("; ")}; state=${post.status}`);
    const after = await hashableSnapshot(db);
    assertNoUnauthorizedChanges(before, after);
    await db.run("COMMIT"); return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args); const db = await openDatabase(options.db, options.apply);
  try {
    const report = options.apply ? await applyBatch(db, options.db, options) : await inspect(db);
    console.log(JSON.stringify({ ...report, source: DATA.SOURCE, writableSurface: { productFields: PRODUCT_WRITES, attributeCodes: Object.keys(DATA.ATTRIBUTE_CHANGES), definitions: "read-only" } }, null, 2));
    if (report.status === "BLOCKED") process.exitCode = 1;
  } finally { await db.close(); }
}

module.exports = { ONLY, PRODUCT_WRITES, applyBatch, assertNoUnauthorizedChanges, getAttributeValue, inspect, openDatabase, parseArgs };
if (require.main === module) main().catch(error => { console.error(`MAT-000076 FIX ABORTED: ${error.message}`); process.exitCode = 1; });
