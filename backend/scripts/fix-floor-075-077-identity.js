"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/floor-075-077-identity-fix");

const TARGETS = DATA.TARGETS;
const CONFIRM = DATA.CONFIRM;
const WRITABLE_PRODUCT_FIELDS = DATA.WRITABLE_PRODUCT_FIELDS;
const WRITABLE_ATTRIBUTE_CODES = DATA.WRITABLE_ATTRIBUTE_CODES;
const SIGNATURE = value => JSON.stringify(value);
const TABLE_COLUMNS = new Set(["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "catalog_structure"]);

function normalizeOnly(values) {
  const result = (Array.isArray(values) ? values : String(values || "").split(",")).map(value => String(value).trim());
  if (result.length !== TARGETS.length || result.some((value, index) => value !== TARGETS[index])) {
    throw new Error(`Exact ordered floor identity batch required: ${TARGETS.join(",")}`);
  }
  return result;
}

function parseArgs(args) {
  const options = { apply: false, db: null, only: null, confirm: null, backupDir: null, review: null };
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const [flag, ...tail] = String(args[index]).split("=");
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === "--apply" || flag === "--dry-run") {
      if (tail.length) throw new Error(`Unexpected option value: ${flag}`);
      if (flag === "--apply") options.apply = true;
      continue;
    }
    if (!["--db", "--only", "--confirm", "--backup-dir", "--review"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = tail.length ? tail.join("=") : args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Value required: ${flag}`);
    const name = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    options[name] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!options.db || options.db === ":memory:" || !options.only) throw new Error("Explicit --db and exact --only are required");
  options.only = normalizeOnly(options.only);
  if (options.apply) {
    if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
    if (!options.backupDir) throw new Error("Apply requires --backup-dir");
  } else if (options.confirm || options.backupDir) throw new Error("--confirm and --backup-dir are valid only with --apply");
  return options;
}

function openDatabase(file, readOnly) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
  const flags = readOnly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(resolved, flags, async error => {
      if (error) return reject(error);
      const db = {
        raw,
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
        all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
        close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
      };
      try {
        await db.run("PRAGMA foreign_keys=ON");
        if (readOnly) await db.run("PRAGMA query_only=ON");
        resolve(db);
      } catch (err) { await db.close(); reject(err); }
    });
  });
}

function canonicalValue(value, definition) {
  if (definition.data_type === "number") return value.value_number;
  if (definition.data_type === "text") return value.value_text;
  if (definition.data_type === "boolean") return value.value_boolean;
  return null;
}

function expectedDefaultAttributes(product) {
  const current = product.expectedProduct;
  return {
    brand: { value: current.brand, type: "text", unit: null },
    package_weight: { value: current.weight, type: "number", unit: "кг" }
  };
}

function attrRowsMatch(rows, definitions, expected) {
  const byCode = new Map();
  for (const row of rows) {
    if (!row.code || byCode.has(row.code)) return { ok: false, reason: `Duplicate/orphan attribute row: ${row.code || row.attribute_definition_id}` };
    byCode.set(row.code, row);
  }
  const expectedCodes = Object.keys(expected).sort();
  if (SIGNATURE([...byCode.keys()].sort()) !== SIGNATURE(expectedCodes)) {
    return { ok: false, reason: `Attribute code set mismatch; expected ${expectedCodes.join(",")}, found ${[...byCode.keys()].sort().join(",")}` };
  }
  for (const [code, target] of Object.entries(expected)) {
    const row = byCode.get(code);
    const definition = definitions.get(code);
    if (!definition || Number(definition.is_active) !== 1 || definition.data_type !== target.type) return { ok: false, reason: `Missing/inactive/incompatible definition: ${code}` };
    if (definition.default_unit !== target.unit) return { ok: false, reason: `Definition unit mismatch: ${code}` };
    const actual = canonicalValue(row, definition);
    if (actual !== target.value) return { ok: false, reason: `Attribute value mismatch: ${code}` };
    const activeUnit = row.unit_override === null ? definition.default_unit : row.unit_override;
    if (activeUnit !== target.unit) return { ok: false, reason: `Attribute unit mismatch: ${code}` };
    const occupied = [row.value_text, row.value_number, row.value_boolean].filter(value => value !== null && value !== undefined).length;
    if (occupied !== 1) return { ok: false, reason: `Attribute storage cardinality mismatch: ${code}` };
  }
  return { ok: true };
}

async function loadDefinitionState(db) {
  const rows = await db.all("SELECT * FROM product_attribute_definitions ORDER BY id");
  const definitions = new Map();
  for (const row of rows) {
    if (definitions.has(row.code)) throw new Error(`Duplicate attribute definition code: ${row.code}`);
    definitions.set(row.code, row);
  }
  for (const [code, contract] of Object.entries(DATA.DEFINITION_CONTRACT)) {
    const definition = definitions.get(code);
    if (!definition || Number(definition.is_active) !== 1 || definition.data_type !== contract.type || definition.default_unit !== contract.unit) {
      throw new Error(`Missing/inactive/incompatible canonical definition: ${code}`);
    }
  }
  return { rows, definitions };
}

async function validateTemplate(db, definitions) {
  const parent = await db.get("SELECT id,type,name,is_active FROM catalog_structure WHERE id=1");
  const structure = await db.get("SELECT id,parent_id,type,name,is_active FROM catalog_structure WHERE id=?", [DATA.TEMPLATE_STRUCTURE_ID]);
  if (!parent || parent.type !== "category" || parent.name !== "Смеси" || Number(parent.is_active) !== 1 || !structure || Number(structure.parent_id) !== 1 || structure.type !== "subcategory" || structure.name !== "Наливной Пол" || Number(structure.is_active) !== 1) {
    throw new Error("Exact Смеси / Наливной Пол structure guard failed");
  }
  const rows = await db.all(`SELECT t.attribute_definition_id,d.code FROM product_attribute_templates t
    LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? ORDER BY t.id`, [DATA.TEMPLATE_STRUCTURE_ID]);
  if (rows.some(row => !row.code)) throw new Error("Template contains an orphan definition");
  const codes = rows.map(row => row.code);
  if (new Set(codes).size !== codes.length || SIGNATURE([...codes].sort()) !== SIGNATURE([...DATA.EXPECTED_TEMPLATE_CODES].sort())) {
    throw new Error("Наливной Пол template membership differs from canonical expected codes");
  }
  for (const code of DATA.WRITABLE_ATTRIBUTE_CODES) if (!codes.includes(code) || !definitions.has(code)) throw new Error(`Writable code is not in active canonical template: ${code}`);
  return rows;
}

function productImmutableMatches(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (WRITABLE_PRODUCT_FIELDS.includes(key)) continue;
    if (actual[key] !== value) return `Product guard mismatch: ${key}`;
  }
  return null;
}

function productMutationState(actual, product) {
  const immutableError = productImmutableMatches(actual, product.expectedProduct);
  if (immutableError) return { ok: false, reason: immutableError };
  const currentMutable = Object.fromEntries(WRITABLE_PRODUCT_FIELDS.map(field => [field, actual[field]]));
  const initialMutable = Object.fromEntries(WRITABLE_PRODUCT_FIELDS.map(field => [field, product.expectedProduct[field]]));
  const proposedMutable = Object.fromEntries(WRITABLE_PRODUCT_FIELDS.map(field => [field, product.proposedProduct[field]]));
  if (SIGNATURE(currentMutable) === SIGNATURE(initialMutable)) return { ok: true, state: "BASELINE" };
  if (SIGNATURE(currentMutable) === SIGNATURE(proposedMutable)) return { ok: true, state: "FINAL" };
  return { ok: false, reason: "Product visible/SEO fields are neither exact baseline nor exact proposed state" };
}

function expectedProposedAttributes(product) {
  return {
    ...expectedDefaultAttributes(product),
    ...Object.fromEntries(Object.entries(product.attributes).map(([code, fact]) => [code, {
      value: fact.value,
      type: DATA.DEFINITION_CONTRACT[code].type,
      unit: DATA.DEFINITION_CONTRACT[code].unit
    }]))
  };
}

async function inspectProduct(db, product, definitions) {
  const matches = await db.all("SELECT * FROM products WHERE external_id=?", [product.externalId]);
  if (matches.length !== 1) return { externalId: product.externalId, status: "BLOCKED_PRESTATE", reason: `Expected exactly one product, found ${matches.length}` };
  const row = matches[0];
  const productState = productMutationState(row, product);
  if (!productState.ok) return { externalId: product.externalId, title: row.title, status: "BLOCKED_PRESTATE", reason: productState.reason };
  const valueRows = await db.all(`SELECT v.*,d.code,d.data_type,d.default_unit,d.is_active FROM product_attribute_values v
    LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`, [row.id]);
  const baseMatch = attrRowsMatch(valueRows, definitions, expectedDefaultAttributes(product));
  const proposedMatch = attrRowsMatch(valueRows, definitions, expectedProposedAttributes(product));
  const attributeState = baseMatch.ok ? "BASELINE" : proposedMatch.ok ? "FINAL" : null;
  if (!attributeState) return { externalId: product.externalId, title: row.title, status: "BLOCKED_PRESTATE", reason: baseMatch.reason || proposedMatch.reason || "Current attributes are neither exact baseline nor exact proposed set" };
  if (attributeState !== productState.state) return { externalId: product.externalId, title: row.title, status: "BLOCKED_PRESTATE", reason: "Visible fields and attribute state are inconsistent; atomic batch appears partially applied" };
  return {
    externalId: product.externalId, title: row.title, slug: row.slug,
    status: productState.state === "FINAL" ? "EXISTING_OK" : "READY",
    productId: row.id,
    current: { short_description: row.short_description, full_description: row.full_description, seo_title: row.seo_title, seo_description: row.seo_description },
    proposed: product.proposedProduct,
    attributes: product.attributes,
    attributeState
  };
}

async function inspectBatch(db, { only } = {}) {
  const selected = normalizeOnly(only || []);
  const { rows: definitionRows, definitions } = await loadDefinitionState(db);
  const templateRows = await validateTemplate(db, definitions);
  const rows = [];
  for (const externalId of selected) rows.push(await inspectProduct(db, DATA.PRODUCTS.find(item => item.externalId === externalId), definitions));
  let errors = rows.filter(row => row.status === "BLOCKED_PRESTATE").length;
  const baseline = rows.filter(row => row.status === "READY").length;
  const final = rows.filter(row => row.status === "EXISTING_OK").length;
  if (errors || baseline && final) {
    rows.forEach(row => { row.status = "BLOCKED_PRESTATE"; row.reason ||= errors ? "At least one product failed exact pre-state; the complete atomic batch is blocked." : "Atomic two-product state mismatch; do not apply a partial batch."; });
    errors = rows.length;
  }
  const ready = rows.filter(row => row.status === "READY").length;
  const existingOk = rows.filter(row => row.status === "EXISTING_OK").length;
  const blocked = rows.filter(row => row.status === "BLOCKED_PRESTATE").length;
  return {
    mode: "dry-run", rows,
    summary: {
      total: rows.length, ready, existingOk, blocked, errors: blocked,
      willAdd: rows.filter(row => row.status === "READY").reduce((sum, row) => sum + Object.keys(DATA.PRODUCTS.find(product => product.externalId === row.externalId).attributes).length, 0),
      willFix: rows.filter(row => row.status === "READY").length * WRITABLE_PRODUCT_FIELDS.length,
      definitionsToCreate: 0, templateWrites: 0
    },
    contract: { exactTargets: TARGETS, productFields: WRITABLE_PRODUCT_FIELDS, attributeCodes: WRITABLE_ATTRIBUTE_CODES, titleAndSlugWritable: false, definitionsWritable: false, templatesWritable: false },
    schemaSnapshot: { definitions: definitionRows, templateRows }
  };
}

async function hashFile(file) { return crypto.createHash("sha256").update(await fs.promises.readFile(file)).digest("hex"); }

async function createOnlineBackup(db, databasePath, backupDir) {
  const directory = path.resolve(backupDir);
  await fs.promises.mkdir(directory, { recursive: true });
  const target = path.join(directory, `matmix-before-floor-075-077-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}.db`);
  const backup = db.raw.backup(target);
  await new Promise((resolve, reject) => backup.step(-1, error => {
    if (error) return reject(error);
    backup.finish(finishError => finishError ? reject(finishError) : resolve());
  }));
  return { path: target, sha256: await hashFile(target), source: path.resolve(databasePath) };
}

async function snapshot(db) {
  const products = await db.all("SELECT * FROM products ORDER BY id");
  const values = await db.all("SELECT * FROM product_attribute_values ORDER BY id");
  const definitions = await db.all("SELECT * FROM product_attribute_definitions ORDER BY id");
  const templates = await db.all("SELECT * FROM product_attribute_templates ORDER BY id");
  return { products, values, definitions, templates };
}

function assertSnapshotAfter(before, after, products, expectedNewRows) {
  const targetIds = new Map(products.map(product => [product.externalId, product.productId]));
  const targetById = new Map(before.products.filter(row => [...targetIds.values()].includes(row.id)).map(row => [row.id, row]));
  const beforeNonTargets = before.products.filter(row => !targetById.has(row.id));
  const afterById = new Map(after.products.map(row => [row.id, row]));
  for (const row of beforeNonTargets) if (SIGNATURE(afterById.get(row.id)) !== SIGNATURE(row)) throw new Error(`Non-target product changed: ${row.external_id}`);
  for (const [id, original] of targetById) {
    const current = afterById.get(id);
    if (!current) throw new Error(`Target product disappeared: ${original.external_id}`);
    for (const [field, value] of Object.entries(original)) if (!WRITABLE_PRODUCT_FIELDS.includes(field) && current[field] !== value) throw new Error(`Immutable product field changed: ${original.external_id}/${field}`);
    const target = products.find(product => product.externalId === original.external_id);
    for (const field of WRITABLE_PRODUCT_FIELDS) if (current[field] !== target.proposedProduct[field]) throw new Error(`Postcheck visible field failed: ${original.external_id}/${field}`);
  }
  if (SIGNATURE(before.definitions) !== SIGNATURE(after.definitions)) throw new Error("Attribute definitions changed");
  if (SIGNATURE(before.templates) !== SIGNATURE(after.templates)) throw new Error("Attribute templates changed");
  const afterValuesById = new Map(after.values.map(row => [row.id, row]));
  for (const value of before.values) if (SIGNATURE(afterValuesById.get(value.id)) !== SIGNATURE(value)) throw new Error(`Existing attribute value changed: ${value.id}`);
  const newRows = after.values.filter(row => !before.values.some(value => value.id === row.id));
  if (newRows.length !== expectedNewRows.length) throw new Error(`Unexpected attribute row count: ${newRows.length}/${expectedNewRows.length}`);
  const canonicalNewRows = newRows.map(({ id, created_at, updated_at, ...row }) => row).sort((a, b) => `${a.product_id}/${a.attribute_definition_id}`.localeCompare(`${b.product_id}/${b.attribute_definition_id}`));
  const canonicalExpectedRows = expectedNewRows.map(({ created_at, updated_at, ...row }) => row).sort((a, b) => `${a.product_id}/${a.attribute_definition_id}`.localeCompare(`${b.product_id}/${b.attribute_definition_id}`));
  if (SIGNATURE(canonicalNewRows) !== SIGNATURE(canonicalExpectedRows)) throw new Error("Unexpected attribute rows were inserted");
}

async function applyBatch(db, databasePath, options) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  const preflight = await inspectBatch(db, { only: options.only });
  if (preflight.summary.errors) throw new Error("Whole floor identity batch blocked by exact pre-state guard");
  if (preflight.summary.existingOk === TARGETS.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
  if (preflight.summary.ready !== TARGETS.length) throw new Error("Atomic exact two-product batch is not fully ready");

  const backup = await createOnlineBackup(db, databasePath, options.backupDir);
  const before = await snapshot(db);
  const newRowsExpected = [];
  let writes = 0;
  await db.run("BEGIN IMMEDIATE");
  try {
    for (const reportRow of preflight.rows) {
      const product = DATA.PRODUCTS.find(item => item.externalId === reportRow.externalId);
      for (const code of Object.keys(product.attributes)) {
        const definition = preflight.schemaSnapshot.definitions.find(item => item.code === code);
        const fact = product.attributes[code];
        const textValue = definition.data_type === "text" ? String(fact.value) : null;
        const numberValue = definition.data_type === "number" ? Number(fact.value) : null;
        if (definition.data_type === "number" && !Number.isFinite(numberValue)) throw new Error(`Non-finite numeric attribute: ${reportRow.externalId}/${code}`);
        const now = new Date().toISOString();
        const insert = { product_id: reportRow.productId, attribute_definition_id: definition.id, value_text: textValue, value_number: numberValue, value_boolean: null, unit_override: definition.default_unit || null, sort_order: DATA.EXPECTED_TEMPLATE_CODES.indexOf(code), created_at: now, updated_at: now };
        const result = await db.run(`INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
          VALUES(?,?,?,?,?,?,?,?,?)`, [insert.product_id, insert.attribute_definition_id, insert.value_text, insert.value_number, insert.value_boolean, insert.unit_override, insert.sort_order, insert.created_at, insert.updated_at]);
        if (result.changes !== 1) throw new Error(`Attribute insert failed: ${reportRow.externalId}/${code}`);
        newRowsExpected.push(insert); writes += 1;
      }
      const current = product.expectedProduct;
      const values = WRITABLE_PRODUCT_FIELDS.map(field => product.proposedProduct[field]);
      const update = await db.run(`UPDATE products SET short_description=?,full_description=?,seo_title=?,seo_description=?
        WHERE id=? AND external_id=? AND title=? AND slug=? AND brand=? AND weight=? AND unit=? AND category=? AND subcategory=? AND price=?
          AND short_description IS NULL AND full_description IS NULL AND seo_title=? AND seo_description=? AND image_url=?
          AND stock_status=? AND is_active=1 AND deleted_at IS NULL`, [
        ...values, reportRow.productId, product.externalId, current.title, current.slug, current.brand, current.weight, current.unit,
        current.category, current.subcategory, current.price, current.seo_title, current.seo_description, current.image_url, current.stock_status
      ]);
      if (update.changes !== 1) throw new Error(`Product guarded update failed: ${reportRow.externalId}`);
      writes += 1;
    }
    const post = await inspectBatch(db, { only: options.only });
    if (post.summary.existingOk !== TARGETS.length || post.summary.errors || post.summary.willAdd || post.summary.willFix) throw new Error("Postcheck did not reach exact EXISTING_OK batch state");
    const after = await snapshot(db);
    assertSnapshotAfter(before, after, DATA.PRODUCTS.map(product => ({ ...product, productId: preflight.rows.find(row => row.externalId === product.externalId).productId })), newRowsExpected);
    await db.run("COMMIT");
    return { ...post, mode: "apply", writes, backup };
  } catch (error) {
    try { await db.run("ROLLBACK"); } catch {}
    throw error;
  }
}

function renderReview(report) {
  const lines = ["# Наливной Пол — MAT-000075 / MAT-000077 identity corrective", "", `Prepared ${DATA.CHECKED_AT}; production untouched. Confirm token: ${CONFIRM}.`, "", `Exact batch: ${TARGETS.join(",")}.`, "", "## Safety", "", "- No writes to title, slug, external_id, brand, weight/unit, price, category/subcategory, image, stock or timestamps.", "- Product writes are limited to short_description, full_description, seo_title and seo_description.", `- Attribute writes are limited to: ${WRITABLE_ATTRIBUTE_CODES.join(", ")}. Existing brand/package_weight are pre-state guards.`, "- Definitions and templates are read-only and must exactly match the canonical Наливной Пол membership; missing/incompatible schema blocks the whole batch.", "- Backup is created before BEGIN IMMEDIATE. Both MATs are applied atomically; mismatch or postcheck failure rolls back.", "- Owner package images establish product identity. Technical specifications come from official manufacturer pages/TDS.", "", "## Dry-run", "", "```json", JSON.stringify(report.summary, null, 2), "```", "", "| MAT | current title (guard only) | identity | result |", "|---|---|---|---|"];
  for (const row of report.rows) lines.push(`| ${row.externalId} | ${row.title || "—"} | ${DATA.PRODUCTS.find(item => item.externalId === row.externalId).identityStatus} | ${row.status} |`);
  for (const product of DATA.PRODUCTS) {
    const sourceProduct = require("./data/floor-mixes-core-batch1").PRODUCTS.find(row => row.externalId === product.externalId);
    lines.push("", `## ${product.externalId}`, "", `- Exact current title guard: ${product.expectedTitle}`, `- Exact current slug guard: ${product.expectedSlug}`, `- Title/slug writes: none. Legacy title text is not technical evidence.`, "- Existing SEO:", `  - Title: ${product.expectedProduct.seo_title}`, `  - Description: ${product.expectedProduct.seo_description}`, "- Proposed visible/SEO content:", `  - Short: ${product.proposedProduct.short_description}`, `  - Full: ${product.proposedProduct.full_description}`, `  - SEO title (${product.proposedProduct.seo_title.length} chars): ${product.proposedProduct.seo_title}`, `  - SEO description (${product.proposedProduct.seo_description.length} chars): ${product.proposedProduct.seo_description}`, "- Attribute proposals:", "", "| code | value | source keys | note |", "|---|---|---|---|");
    for (const [code, fact] of Object.entries(product.attributes)) lines.push(`| ${code} | ${fact.value} | ${fact.sourceKeys.join(", ")} | ${fact.note || "—"} |`);
    lines.push("", "### Provenance exceptions", "", `Purpose (source-backed, not a template attribute): ${sourceProduct.core.purpose.value}`, `Compressive strength (not stored; schema is numeric): ${product.sourceFactsNotStoredAsAttributes.compressive_strength.sourceRange}.`, "The range is preserved here; the numeric field is not assigned a fabricated scalar.");
    lines.push("", "### Sources", "");
    for (const key of product.sourceKeys) { const source = DATA.SOURCES[key]; lines.push(`- ${source.title}${source.url ? ` — ${source.url}` : " (owner-provided evidence; no URL)"}: ${source.provenanceNote || "Identity/source context."}`); }
  }
  lines.push("", "## Template and schema", "", `Structure ID: ${DATA.TEMPLATE_STRUCTURE_ID}; canonical fields: ${DATA.EXPECTED_TEMPLATE_CODES.join(", ")}.`, "No attribute definition/template writes. Numeric compressive-strength range 16–20 MPa is intentionally not stored as a scalar.", "", "## Audit fixture expectation", "", "Use audit classification from c330cf1c8d516b7e0438d68f3cbc9a00baeede05 with this source dataset and final attribute fixture. MAT-000075/077 should not be SOURCE_BLOCKED; optional compressed-strength range remains unrepresented without an anomaly.");
  return lines.join("\n") + "\n";
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = await openDatabase(options.db, !options.apply);
  try {
    const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options);
    if (options.review) {
      const base = path.resolve(options.review);
      await fs.promises.mkdir(path.dirname(base), { recursive: true });
      await fs.promises.writeFile(`${base}.json`, `${JSON.stringify(report, null, 2)}\n`);
      await fs.promises.writeFile(`${base}.md`, renderReview(report));
    }
    for (const row of report.rows) console.log(JSON.stringify(row));
    console.log(JSON.stringify({ mode: report.mode, summary: report.summary, ...(report.backup ? { backup: report.backup, writes: report.writes } : {}) }));
    if (report.summary.errors) process.exitCode = 1;
  } finally { await db.close(); }
}

module.exports = { CONFIRM, DATA, TARGETS, WRITABLE_ATTRIBUTE_CODES, WRITABLE_PRODUCT_FIELDS, applyBatch, assertSnapshotAfter, attrRowsMatch, inspectBatch, normalizeOnly, openDatabase, parseArgs, productMutationState, renderReview };
if (require.main === module) main().catch(error => { console.error(`FLOOR IDENTITY CORRECTIVE ABORTED: ${error.message}`); process.exitCode = 1; });
