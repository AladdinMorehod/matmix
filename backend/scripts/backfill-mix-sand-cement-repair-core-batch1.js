"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/mix-sand-cement-repair-core-batch1");

const CONFIRM = DATA.CONFIRM;
const ALL_MATS = DATA.BATCH_MATS;
const PRODUCT_MUTABLE_FIELDS_EXACTLY = Object.freeze(["brand"]);
const MAIN_CODES = Object.freeze(["brand", "product_type", "shelf_life", "package_weight"]);
const VALID_SOURCE_STATUSES = new Set(["READY", "SOURCE_CONFLICT", "NEEDS_MAPPING", "NOT_AVAILABLE"]);
const PROTECTED_TABLES = Object.freeze(["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]);
const clean = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
const normalize = value => clean(value).toLocaleLowerCase("ru-RU").replace(/ё/g, "е");
const nonempty = value => value !== null && value !== undefined && String(value).trim() !== "";
const valueOf = row => row?.value_text ?? row?.value_number ?? row?.value_boolean ?? null;
const stable = value => JSON.stringify(value);

function openDatabase(file, writable = false) {
  if (!file || file === ":memory:") throw new Error("Explicit --db path to an existing database is required");
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) throw new Error(`Database does not exist: ${resolved}`);
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(resolved, writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY, error => {
      if (error) return reject(error);
      const db = {
        raw,
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
        all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
        close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
      };
      db.run("PRAGMA foreign_keys=ON").then(() => writable ? db : db.run("PRAGMA query_only=ON").then(() => db)).then(resolve).catch(async err => { await db.close(); reject(err); });
    });
  });
}

function assertExactBatch(values) {
  const normalized = (Array.isArray(values) ? values : []).map(value => String(value).trim());
  if (normalized.length !== ALL_MATS.length || normalized.some((value, index) => value !== ALL_MATS[index])) {
    throw new Error(`Exact batch required in canonical order: ${ALL_MATS.join(",")}`);
  }
  return normalized;
}

function parseArgs(args) {
  const options = { apply: false }; const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [key, ...tail] = args[i].split("=");
    if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
    seen.add(key);
    if (["--apply", "--dry-run"].includes(key)) {
      if (tail.length) throw new Error(`Unexpected option value: ${key}`);
      if (key === "--apply") options.apply = true;
      continue;
    }
    if (!["--db", "--only", "--confirm", "--backup-dir"].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = tail.length ? tail.join("=") : args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Value required: ${key}`);
    options[key.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  if (seen.has("--apply") && seen.has("--dry-run")) throw new Error("Choose either --dry-run or --apply");
  if (!options.db || options.db === ":memory:") throw new Error("Explicit --db path is required");
  if (options.only === undefined) throw new Error("Explicit --only is required");
  options.only = assertExactBatch(options.only.split(",").map(value => value.trim()));
  if (seen.has("--confirm") && !options.apply) throw new Error("--confirm requires --apply");
  if (options.apply && options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  if (options.apply && !options.backupDir) throw new Error("Apply requires explicit --backup-dir");
  return options;
}

function compatible(definition, code) {
  const expected = DATA.DEFINITIONS[code];
  return Boolean(definition && expected && Number(definition.is_active) === 1 && definition.data_type === expected.dataType && (definition.default_unit || null) === expected.unit);
}
function sameValue(existing, proposal, definition) {
  if (!existing) return false;
  if (definition.data_type === "number") return Number(existing.value_number) === Number(proposal.value);
  if (definition.data_type === "boolean") return Number(existing.value_boolean) === (proposal.value ? 1 : 0);
  return clean(existing.value_text) === clean(proposal.value);
}
function validateData(data = DATA) {
  if (stable(data.BATCH_MATS) !== stable(ALL_MATS)) throw new Error("Batch MAT allowlist mismatch");
  if (data.PRODUCTS.length !== ALL_MATS.length || stable(data.PRODUCTS.map(row => row.externalId)) !== stable(ALL_MATS)) throw new Error("Data must contain exactly the three ordered batch MATs");
  if (data.NEW_DEFINITIONS?.length) throw new Error("This batch cannot create attribute definitions");
  for (const product of data.PRODUCTS) {
    if (!product.expectedTitle || !product.expectedSubcategory || !product.core || stable(Object.keys(product.core)) !== stable(data.CORE_ORDER)) throw new Error(`Incomplete core matrix: ${product.externalId}`);
    for (const [code, item] of Object.entries(product.core)) {
      if (!data.DEFINITIONS[code] || !VALID_SOURCE_STATUSES.has(item.status)) throw new Error(`Invalid canonical field/status ${product.externalId}/${code}`);
      if (item.status === "READY" && (item.value === null || item.value === undefined || !item.sources?.length || !item.context)) throw new Error(`READY value needs value, source and context: ${product.externalId}/${code}`);
      if (item.status !== "READY" && item.value !== null) throw new Error(`Unresolved value must not contain a proposal: ${product.externalId}/${code}`);
      if ((item.sources || []).some(key => !data.SOURCES[key]?.url)) throw new Error(`Unknown source key: ${product.externalId}/${code}`);
    }
  }
  return true;
}

async function tableColumns(db, table) { return db.all(`PRAGMA table_info(${table})`); }
async function validateSchema(db, data = DATA) {
  const version = Number((await db.get("PRAGMA user_version"))?.user_version || 0);
  if (version !== 11) throw new Error(`Schema v11 required; found v${version}`);
  for (const table of PROTECTED_TABLES) {
    const exists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [table]);
    if (!exists) throw new Error(`Required table missing: ${table}`);
  }
  const templateColumns = await tableColumns(db, "product_attribute_templates");
  if (!templateColumns.some(column => column.name === "section")) throw new Error("Schema v11 product_attribute_templates.section is required");
  const definitions = await db.all("SELECT id,code,label,data_type,default_unit,is_active,sort_order FROM product_attribute_definitions ORDER BY id");
  const byCode = new Map();
  for (const definition of definitions) {
    if (byCode.has(definition.code)) throw new Error(`Duplicate canonical definition code: ${definition.code}`);
    byCode.set(definition.code, definition);
  }
  const missing = data.CORE_ORDER.filter(code => !compatible(byCode.get(code), code));
  if (missing.length) throw new Error(`Missing/incompatible existing canonical definitions: ${missing.join(", ")}`);
  return { version, definitions, definitionByCode: byCode };
}

async function templateState(db, product, data = DATA) {
  const parent = await db.get("SELECT id,parent_id,type,name,is_active FROM catalog_structure WHERE id=?", [product.expectedParentStructureId]);
  const structure = await db.get("SELECT id,parent_id,type,name,is_active FROM catalog_structure WHERE id=?", [product.expectedStructureId]);
  if (!parent || parent.type !== "category" || parent.name !== data.EXPECTED_CATEGORY || Number(parent.is_active) !== 1) throw new Error(`Parent structure guard failed for ${product.externalId}`);
  if (!structure || Number(structure.parent_id) !== Number(parent.id) || structure.type !== "subcategory" || structure.name !== product.expectedSubcategory || Number(structure.is_active) !== 1) throw new Error(`Exact structure guard failed for ${product.externalId}`);
  const memberships = await db.all(`SELECT t.id,t.structure_id,t.attribute_definition_id,t.section,t.sort_order,t.unit_override,d.code
      FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
      WHERE t.structure_id=? ORDER BY t.section,t.sort_order,t.id`, [structure.id]);
  if (memberships.length) throw new Error(`Template assumption changed: expected generic fallback with no memberships for ${product.expectedSubcategory}`);
  return { structureId: structure.id, sectionColumn: true, memberships: [], mode: "generic-no-membership-fallback", status: "TEMPLATE_READY" };
}

async function loadProduct(db, config, validation, data = DATA) {
  const rows = await db.all("SELECT * FROM products WHERE external_id=?", [config.externalId]);
  if (rows.length !== 1) throw new Error(`Expected one product for ${config.externalId}; found ${rows.length}`);
  const product = rows[0];
  if (Number(product.is_active) !== 1 || product.deleted_at) throw new Error(`Product is inactive/deleted: ${config.externalId}`);
  if (product.title !== config.expectedTitle) return { product, titleBlocked: `Exact title mismatch: ${product.title}` };
  if (normalize(product.category) !== normalize(data.EXPECTED_CATEGORY) || normalize(product.subcategory) !== normalize(config.expectedSubcategory)) return { product, titleBlocked: `Category/subcategory mismatch: ${product.category} / ${product.subcategory}` };
  if (Number(product.weight) !== Number(config.core.package_weight.value) || product.unit !== "шт") return { product, titleBlocked: `Local identity weight/unit mismatch: expected operational row ${config.core.package_weight.value} шт, found ${product.weight} ${product.unit}` };
  const template = await templateState(db, config, data);
  const values = await db.all(`SELECT v.*,d.code,d.label,d.data_type,d.default_unit,d.is_active
      FROM product_attribute_values v LEFT JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id
      WHERE v.product_id=? ORDER BY v.id`, [product.id]);
  const imageRows = await db.all("SELECT * FROM product_images WHERE product_id=? ORDER BY id", [product.id]);
  return { product, values, imageRows, template, definitions: validation.definitions };
}

function findExisting(values, code) {
  const matches = values.filter(row => row.code === code);
  if (matches.length > 1) throw new Error(`Duplicate product value: ${code}`);
  return matches[0] || null;
}
function planField(code, proposal, definitions, existing) {
  const definition = definitions.find(row => row.code === code);
  const item = { code, sourceStatus: proposal.status, status: proposal.status, value: proposal.value ?? null,
    currentValue: valueOf(existing), currentId: existing?.id ?? null, definitionId: definition?.id ?? null,
    dataType: definition?.data_type ?? null, unit: definition?.default_unit || null, sources: proposal.sources || [],
    context: proposal.context || null, sourceValue: proposal.sourceValue ?? null, sourceUnit: proposal.sourceUnit ?? null,
    reason: proposal.reason || null };
  if (proposal.status === "READY") {
    if (!compatible(definition, code)) { item.status = "SCHEMA_BLOCKED"; item.reason = `Existing definition is not compatible with ${DATA.DEFINITIONS[code].dataType}/${DATA.DEFINITIONS[code].unit || "no unit"}.`; }
    else if (!existing) item.status = "WILL_ADD";
    else if (sameValue(existing, item, definition)) item.status = "EXISTING_OK";
    else { item.status = "VALUE_CONFLICT"; item.reason = "Existing non-empty value differs; overwrite is forbidden."; }
  } else if (existing && nonempty(valueOf(existing))) {
    item.status = "VALUE_CONFLICT"; item.reason = `Existing value is present while source status is ${proposal.status}; overwrite/removal is forbidden.`;
  }
  return item;
}
function planBrand(config, state) {
  const definition = state.definitions.find(row => row.code === "brand");
  const attribute = findExisting(state.values, "brand");
  const attributeStatus = !attribute ? "WILL_ADD" : sameValue(attribute, { value: config.brand }, definition) ? "EXISTING_OK" : "BRAND_CONFLICT";
  const productStatus = !nonempty(state.product.brand) ? "WILL_ADD" : normalize(state.product.brand) === normalize(config.brand) ? "EXISTING_OK" : "BRAND_CONFLICT";
  return { code: "brand", status: attributeStatus === "BRAND_CONFLICT" || productStatus === "BRAND_CONFLICT" ? "BRAND_CONFLICT" : attributeStatus === "SCHEMA_BLOCKED" ? "SCHEMA_BLOCKED" : attributeStatus === "EXISTING_OK" && productStatus === "EXISTING_OK" ? "EXISTING_OK" : "WILL_ADD",
    attributeStatus, productColumnStatus: productStatus, value: config.brand, currentValue: valueOf(attribute), currentProductBrand: state.product.brand,
    currentId: attribute?.id ?? null, definitionId: definition?.id ?? null, sources: config.core.brand.sources, context: config.core.brand.context };
}

async function planProduct(db, config, validation, data = DATA) {
  const state = await loadProduct(db, config, validation, data);
  const row = { externalId: config.externalId, productId: state.product.id, title: state.product.title,
    category: state.product.category, subcategory: state.product.subcategory, brand: null, specs: [], template: state.template || null,
    identityStatus: state.titleBlocked ? "IDENTITY_GUARD_BLOCKED" : "IDENTITY_CONFIRMED",
    coreCoverageStatus: state.titleBlocked ? "NOT_EVALUATED" : null,
    identity: config.identity, sourceKeys: config.sourceKeys,
    current: { brand: state.product.brand, weight: state.product.weight, unit: state.product.unit, price: state.product.price,
      imageUrl: state.product.image_url, description: state.product.full_description || state.product.description || null,
      seoTitle: state.product.seo_title, seoDescription: state.product.seo_description },
    notStored: ["title", "slug", "description", "short_description", "full_description", "seo_title", "seo_description", "price", "weight", "unit", "category", "subcategory", "stock_status", "image_url", "product_images"] };
  if (state.titleBlocked) {
    row.status = "TITLE_GUARD_BLOCKED"; row.guardReason = state.titleBlocked;
    row.specs = DATA.CORE_ORDER.filter(code => code !== "brand").map(code => ({ code, sourceStatus: config.core[code].status, status: "NOT_EVALUATED", value: null, reason: state.titleBlocked }));
    row.summary = emptySummary(DATA.CORE_ORDER.length); row.summary.titleGuardBlocked = 1; row.summary.logicalSlots = DATA.CORE_ORDER.length;
    return row;
  }
  row.brand = planBrand(config, state);
  for (const code of DATA.CORE_ORDER.filter(code => code !== "brand")) row.specs.push(planField(code, config.core[code], state.definitions, findExisting(state.values, code)));
  const all = [row.brand, ...row.specs];
  const count = status => all.filter(item => item.status === status).length;
  row.summary = emptySummary(all.length);
  row.summary.logicalSlots = all.length;
  for (const item of all) {
    if (item.sourceStatus === "READY" || item.code === "brand") row.summary.ready += 1;
    if (item.status === "WILL_ADD") row.summary.willAdd += 1;
    if (item.status === "EXISTING_OK") row.summary.existingOk += 1;
    if (item.sourceStatus === "SOURCE_CONFLICT") row.summary.sourceConflict += 1;
    if (item.sourceStatus === "NEEDS_MAPPING") row.summary.needsMapping += 1;
    if (item.sourceStatus === "NOT_AVAILABLE") row.summary.notAvailable += 1;
    if (item.status === "SCHEMA_BLOCKED") row.summary.schemaBlocked += 1;
    if (item.status === "VALUE_CONFLICT") row.summary.valueConflict += 1;
    if (item.status === "BRAND_CONFLICT") row.summary.brandConflict += 1;
  }
  row.status = count("VALUE_CONFLICT") || count("BRAND_CONFLICT") || count("SCHEMA_BLOCKED") ? "BLOCKED" : all.every(item => ["WILL_ADD", "EXISTING_OK"].includes(item.status)) ? "READY" : "PARTIAL";
  row.coreCoverageStatus = row.status === "READY" ? "CORE_READY" : row.status === "PARTIAL" ? "CORE_PARTIAL" : "CORE_BLOCKED";
  return row;
}

function emptySummary(logicalSlots = 0) { return { logicalSlots, ready: 0, willAdd: 0, existingOk: 0, sourceConflict: 0, needsMapping: 0, notAvailable: 0, schemaBlocked: 0, valueConflict: 0, brandConflict: 0, titleGuardBlocked: 0, errors: 0 }; }
function sumRows(rows) { const total = emptySummary(); for (const row of rows) for (const key of Object.keys(total)) total[key] += row.summary?.[key] || 0; return total; }

async function inspectBatch(db, { only, data = DATA } = {}) {
  const selected = assertExactBatch(only || []);
  validateData(data);
  const schema = await validateSchema(db, data);
  const rows = [];
  for (const id of selected) {
    const config = data.PRODUCTS.find(item => item.externalId === id);
  try { rows.push(await planProduct(db, config, schema, data)); }
  catch (error) { const row = { externalId: id, identityStatus: "IDENTITY_NOT_EVALUATED", coreCoverageStatus: "NOT_EVALUATED", status: "ERROR", error: error.message, summary: emptySummary() }; row.summary.errors = 1; rows.push(row); }
  }
  const summary = sumRows(rows);
  summary.total = rows.length;
  summary.readyProducts = rows.filter(row => row.status === "READY").length;
  summary.partialProducts = rows.filter(row => row.status === "PARTIAL").length;
  summary.identityConfirmedProducts = rows.filter(row => row.identityStatus === "IDENTITY_CONFIRMED").length;
  summary.corePartialProducts = rows.filter(row => row.coreCoverageStatus === "CORE_PARTIAL").length;
  summary.blockedProducts = rows.filter(row => row.status === "BLOCKED" || row.status === "TITLE_GUARD_BLOCKED" || row.status === "ERROR").length;
  summary.definitionsToCreate = 0;
  summary.templateMembershipChanges = 0;
  return { mode: "dry-run", templateAudit: data.TEMPLATE_AUDIT, rows, summary,
    writableSurface: { products: PRODUCT_MUTABLE_FIELDS_EXACTLY, attributeValueCodes: data.CORE_ORDER, definitions: "none", templates: "none", forbidden: ["products fields other than brand", "product_attribute_definitions", "product_attribute_templates", "product_images", "SEO", "descriptions", "title/slug", "weight/price/stock"] }, sources: data.SOURCES };
}

async function snapshotTables(db) {
  const snapshot = {};
  for (const table of PROTECTED_TABLES) snapshot[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
  return snapshot;
}
function expectedInsertedValues(preflight) {
  const inserts = [];
  for (const row of preflight.rows) {
    if (row.brand.attributeStatus === "WILL_ADD") inserts.push({ productId: row.productId, code: "brand", value: row.brand.value, dataType: "text", unit: null, sortOrder: DATA.CORE_ORDER.indexOf("brand") });
    for (const item of row.specs) if (item.status === "WILL_ADD") inserts.push({ productId: row.productId, code: item.code, value: item.value, dataType: item.dataType, unit: item.unit, sortOrder: DATA.CORE_ORDER.indexOf(item.code) });
  }
  return inserts;
}
function rowValueEquals(row, expected) {
  if (expected.dataType === "number") return Number(row.value_number) === Number(expected.value) && row.value_text == null && row.value_boolean == null;
  if (expected.dataType === "boolean") return Number(row.value_boolean) === (expected.value ? 1 : 0) && row.value_text == null && row.value_number == null;
  return row.value_text === String(expected.value) && row.value_number == null && row.value_boolean == null;
}
async function assertPostSnapshot(db, before, preflight, data = DATA) {
  const after = await snapshotTables(db);
  const brandById = new Map(preflight.rows.map(row => [Number(row.productId), row.brand.value]));
  const afterProducts = new Map(after.products.map(row => [Number(row.id), row]));
  for (const original of before.products) {
    const current = afterProducts.get(Number(original.id));
    if (!current) throw new Error(`Product row disappeared: ${original.external_id}`);
    const expected = { ...original };
    if (brandById.has(Number(original.id))) expected.brand = brandById.get(Number(original.id));
    if (stable(current) !== stable(expected)) throw new Error(`Immutable product field changed: ${original.external_id}`);
  }
  const afterValues = after.product_attribute_values;
  const afterById = new Map(afterValues.map(row => [Number(row.id), row]));
  for (const original of before.product_attribute_values) {
    if (stable(afterById.get(Number(original.id))) !== stable(original)) throw new Error(`Existing attribute value changed: ${original.id}`);
  }
  const additions = afterValues.filter(row => !before.product_attribute_values.some(old => Number(old.id) === Number(row.id)));
  const expectedAdds = expectedInsertedValues(preflight);
  if (additions.length !== expectedAdds.length) throw new Error(`Unexpected attribute row count: ${additions.length}/${expectedAdds.length}`);
  const defs = new Map(after.product_attribute_definitions.map(row => [Number(row.id), row]));
  for (const expected of expectedAdds) {
    const matches = additions.filter(row => Number(row.product_id) === expected.productId && defs.get(Number(row.attribute_definition_id))?.code === expected.code && rowValueEquals(row, expected) && (row.unit_override || null) === expected.unit);
    if (matches.length !== 1) throw new Error(`Postcheck missing/non-unique inserted value: ${expected.productId}/${expected.code}`);
  }
  for (const table of ["product_attribute_definitions", "product_attribute_templates", "product_images"]) {
    if (stable(before[table]) !== stable(after[table])) throw new Error(`Protected table changed: ${table}`);
  }
}

async function createOnlineBackup(db, databasePath, backupDir) {
  const suffix = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
  const destination = path.resolve(backupDir, `matmix-before-mix-sand-cement-repair-core-${suffix}.db`);
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  if (fs.existsSync(destination)) throw new Error(`Backup destination already exists: ${destination}`);
  const backup = db.raw.backup(destination);
  await new Promise((resolve, reject) => backup.step(-1, error => {
    if (error) return reject(error);
    backup.finish(finishError => finishError ? reject(finishError) : resolve());
  }));
  const stat = await fs.promises.stat(destination);
  if (stat.size < 1024) throw new Error("Online backup is unexpectedly small");
  const verify = await openDatabase(destination, false);
  try {
    const integrity = await verify.get("PRAGMA integrity_check");
    if (integrity?.integrity_check !== "ok") throw new Error("Backup integrity check failed");
  } finally { await verify.close(); }
  return { path: destination, size: stat.size, source: path.resolve(databasePath), verified: true };
}

async function applyBatch(db, dbPath, options, data = DATA) {
  if (options.confirm !== CONFIRM) throw new Error(`Apply requires --confirm ${CONFIRM}`);
  if (!options.backupDir) throw new Error("Apply requires explicit --backup-dir");
  const preflight = await inspectBatch(db, { only: options.only, data });
  if (preflight.summary.errors || preflight.summary.titleGuardBlocked || preflight.summary.valueConflict || preflight.summary.brandConflict || preflight.summary.schemaBlocked) throw new Error("Apply blocked by exact guard, schema or value conflict");
  const targets = expectedInsertedValues(preflight);
  if (!targets.length) return { ...preflight, mode: "apply", writes: 0, backup: null };
  const backup = await createOnlineBackup(db, dbPath, options.backupDir);
  const before = await snapshotTables(db);
  await db.run("BEGIN IMMEDIATE");
  let writes = 0;
  try {
    const lockedPlan = await inspectBatch(db, { only: options.only, data });
    if (stable(lockedPlan.summary) !== stable(preflight.summary) || stable(expectedInsertedValues(lockedPlan)) !== stable(targets)) throw new Error("Database state changed after preflight/backup");
    const definitionMap = new Map((await db.all("SELECT id,code,data_type,default_unit,is_active FROM product_attribute_definitions", [])).map(row => [row.code, row]));
    const now = new Date().toISOString();
    for (const row of preflight.rows) {
      if (row.brand.productColumnStatus === "WILL_ADD") {
        const update = await db.run("UPDATE products SET brand=? WHERE id=? AND external_id=? AND (brand IS NULL OR TRIM(brand)='')", [row.brand.value, row.productId, row.externalId]);
        if (update.changes !== 1) throw new Error(`Brand write guard failed: ${row.externalId}`);
        writes += 1;
      }
      for (const item of [row.brand.attributeStatus === "WILL_ADD" ? row.brand : null, ...row.specs.filter(spec => spec.status === "WILL_ADD")].filter(Boolean)) {
        const definition = definitionMap.get(item.code);
        if (!definition || !compatible(definition, item.code)) throw new Error(`Canonical definition changed: ${item.code}`);
        const valueText = definition.data_type === "text" ? String(item.value) : null;
        const valueNumber = definition.data_type === "number" ? Number(item.value) : null;
        const valueBoolean = definition.data_type === "boolean" ? (item.value ? 1 : 0) : null;
        const insert = await db.run(`INSERT INTO product_attribute_values
          (product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at)
          VALUES(?,?,?,?,?,?,?,?,?)`, [row.productId, definition.id, valueText, valueNumber, valueBoolean, definition.default_unit || null, DATA.CORE_ORDER.indexOf(item.code), now, now]);
        if (insert.changes !== 1) throw new Error(`Attribute insert failed: ${row.externalId}/${item.code}`);
        writes += 1;
      }
    }
    const post = await inspectBatch(db, { only: options.only, data });
    if (post.summary.errors || post.summary.titleGuardBlocked || post.summary.valueConflict || post.summary.brandConflict || post.summary.schemaBlocked || post.summary.willAdd) throw new Error("Postcheck failed: planned source-backed values are not stable");
    await assertPostSnapshot(db, before, preflight, data);
    await db.run("COMMIT");
    return { ...post, mode: "apply", writes, backup };
  } catch (error) {
    try { await db.run("ROLLBACK"); } catch {}
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = await openDatabase(options.db, options.apply);
  try {
    const report = options.apply ? await applyBatch(db, options.db, options) : await inspectBatch(db, options);
    for (const row of report.rows) console.log(JSON.stringify(row));
    console.log(JSON.stringify({ mode: report.mode, summary: report.summary, writableSurface: report.writableSurface }, null, 2));
    if (report.summary.errors || report.summary.titleGuardBlocked || report.summary.valueConflict || report.summary.brandConflict || report.summary.schemaBlocked) process.exitCode = 1;
  } finally { await db.close(); }
}

module.exports = { ALL_MATS, CONFIRM, DATA, MAIN_CODES, PRODUCT_MUTABLE_FIELDS_EXACTLY, applyBatch, assertExactBatch, createOnlineBackup, inspectBatch, openDatabase, parseArgs, validateData, validateSchema };
if (require.main === module) main().catch(error => { console.error(`BACKFILL ABORTED: ${error.message}`); process.exitCode = 1; });
