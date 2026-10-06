"use strict";

const ENGINE = require("./tile-adhesive-batch1-engine");
const DATA = require("./data/tile-adhesive-core-batch1");

const PRODUCT = Object.freeze({
  externalId: "MAT-000139",
  title: "Клей для плитки Unis Гранит 25кг",
  category: "Смеси",
  subcategory: "Клей для Плитки",
  weight: 25,
  unit: "шт"
});
const ATTRIBUTE_CODE = "substrates";
const OLD_VALUE = "Бетонные (включая ячеистый бетон и шлакобетон), цементные и цементно-известковые штукатурки, кирпичные, гипсовые (ГКЛ, ГВЛ, ПГП), а также старые плиточные покрытия и нагреваемые поверхности (система «Тёплый пол»).";
const NEW_VALUE = "Бетонные (включая ячеистый бетон и шлакобетон), цементные и полимерные основания (в том числе цементная штукатурка), кирпичные, гипсовые (ГКЛ, ГВЛ, ПГП), старые плиточные покрытия и нагреваемые поверхности (в том числе система «Тёплый пол»).";
const CONFIRM_TOKEN = "FIX_MAT000139_SUBSTRATES_SOURCE_BACKED_VALUE";
const stable = value => JSON.stringify(value);

function parseArgs(args) {
  const options = { db: null, backupDir: null, confirm: null, apply: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [flag, ...inline] = String(args[i]).split("=");
    if (seen.has(flag)) throw new Error(`Duplicate option ${flag}`);
    seen.add(flag);
    if (flag === "--apply") {
      if (inline.length) throw new Error("--apply takes no value");
      options.apply = true;
      continue;
    }
    if (flag === "--dry-run") {
      if (inline.length) throw new Error("--dry-run takes no value");
      continue;
    }
    if (!["--db", "--backup-dir", "--confirm"].includes(flag)) throw new Error(`Unknown option ${flag}`);
    const value = inline.length ? inline.join("=") : args[++i];
    if (!value || String(value).startsWith("--")) throw new Error(`Value required for ${flag}`);
    if (flag === "--db") options.db = value;
    if (flag === "--backup-dir") options.backupDir = value;
    if (flag === "--confirm") options.confirm = value;
  }
  if (!options.db || options.db === ":memory:") throw new Error("Explicit existing --db path required");
  if (options.apply) {
    if (!options.backupDir || options.confirm !== CONFIRM_TOKEN) throw new Error(`--apply requires --backup-dir and --confirm ${CONFIRM_TOKEN}`);
  } else if (options.backupDir || options.confirm) {
    throw new Error("--backup-dir and --confirm are accepted only with --apply");
  }
  return options;
}

function assertExactProduct(product) {
  if (!product || product.external_id !== PRODUCT.externalId || product.title !== PRODUCT.title
      || product.category !== PRODUCT.category || product.subcategory !== PRODUCT.subcategory
      || Number(product.weight) !== PRODUCT.weight || product.unit !== PRODUCT.unit
      || Number(product.is_active) !== 1 || product.deleted_at !== null) {
    throw new Error(`IDENTITY_BLOCKED expected exact active product ${PRODUCT.externalId}: ${JSON.stringify(product || null)}`);
  }
}

async function inspect(db) {
  await ENGINE.assertSchema(db);
  const health = await ENGINE.integrity(db);
  const products = await db.all("SELECT * FROM products WHERE external_id=? ORDER BY id", [PRODUCT.externalId]);
  if (products.length !== 1) throw new Error(`IDENTITY_BLOCKED expected exactly one ${PRODUCT.externalId}, found ${products.length}`);
  const product = products[0];
  assertExactProduct(product);

  const definitions = await db.all("SELECT * FROM product_attribute_definitions WHERE code=? ORDER BY id", [ATTRIBUTE_CODE]);
  if (definitions.length !== 1) throw new Error(`SCHEMA_BLOCKED expected exactly one ${ATTRIBUTE_CODE} definition, found ${definitions.length}`);
  const definition = definitions[0];
  if (definition.code !== ATTRIBUTE_CODE || definition.data_type !== "text" || Number(definition.is_active) !== 1) {
    throw new Error(`SCHEMA_BLOCKED incompatible ${ATTRIBUTE_CODE} definition: ${JSON.stringify(definition)}`);
  }

  const rows = await db.all(`SELECT * FROM product_attribute_values
    WHERE product_id=? AND attribute_definition_id=? ORDER BY id`, [product.id, definition.id]);
  if (rows.length !== 1) throw new Error(`VALUE_BLOCKED expected exactly one ${PRODUCT.externalId}/${ATTRIBUTE_CODE} row, found ${rows.length}`);
  const row = rows[0];
  const sourceFact = DATA.PRODUCTS.find(item => item.externalId === PRODUCT.externalId)?.core?.[ATTRIBUTE_CODE];
  if (!sourceFact || sourceFact.status !== "READY" || sourceFact.value !== NEW_VALUE) {
    throw new Error("DATA_BLOCKED correction target does not match reviewed READY dataset value");
  }

  let status;
  let willFix;
  if (row.value_text === OLD_VALUE && row.value_number === null && row.value_boolean === null && row.unit_override === null) {
    status = "READY";
    willFix = 1;
  } else if (row.value_text === NEW_VALUE && row.value_number === null && row.value_boolean === null && row.unit_override === null) {
    status = "EXISTING_OK";
    willFix = 0;
  } else {
    throw new Error(`VALUE_BLOCKED current value is neither exact approved old nor corrected value: ${JSON.stringify(row)}`);
  }
  return {
    product,
    definition,
    row,
    status,
    willFix,
    health,
    report: {
      externalId: PRODUCT.externalId,
      title: product.title,
      attribute: ATTRIBUTE_CODE,
      attributeLabel: definition.label,
      rowId: row.id,
      currentValue: row.value_text,
      newValue: NEW_VALUE,
      status,
      willFix,
      writes: 0,
      schemaVersion: 11,
      integrity: health.integrity,
      foreignKeyViolations: health.foreignKeyViolations
    }
  };
}

async function assertOnlyApprovedDelta(db, before, target) {
  const after = await ENGINE.snapshots(db);
  for (const table of ["products", "product_attribute_definitions", "product_attribute_templates", "product_images"]) {
    if (stable(before[table]) !== stable(after[table])) throw new Error(`POSTCHECK ${table} changed`);
  }
  if (before.product_attribute_values.length !== after.product_attribute_values.length) throw new Error("POSTCHECK product_attribute_values row count changed");
  const beforeRows = new Map(before.product_attribute_values.map(row => [Number(row.id), row]));
  const afterRows = new Map(after.product_attribute_values.map(row => [Number(row.id), row]));
  if (beforeRows.size !== afterRows.size) throw new Error("POSTCHECK product_attribute_values IDs changed");
  for (const [id, oldRow] of beforeRows) {
    const newRow = afterRows.get(id);
    if (!newRow) throw new Error(`POSTCHECK attribute row removed: ${id}`);
    if (id === Number(target.row.id)) {
      const expected = { ...oldRow, value_text: NEW_VALUE };
      if (stable(expected) !== stable(newRow)) throw new Error("POSTCHECK target row differs beyond approved value_text correction");
    } else if (stable(oldRow) !== stable(newRow)) {
      throw new Error(`POSTCHECK unrelated attribute row changed: ${id}`);
    }
  }
  return after;
}

async function apply(db, dbPath, backupDir) {
  const before = await ENGINE.snapshots(db);
  const initial = await inspect(db);
  if (initial.willFix === 0) return { ...initial.report, mode: "apply", writes: 0, backup: null };

  const backup = await ENGINE.backupDatabase(db, dbPath, backupDir, "mat000139-substrates-correction");
  await db.run("BEGIN IMMEDIATE");
  try {
    const locked = await inspect(db);
    if (locked.status !== "READY" || Number(locked.row.id) !== Number(initial.row.id)) {
      throw new Error("GUARD_BLOCKED target changed after verified backup");
    }
    const result = await db.run(`UPDATE product_attribute_values
      SET value_text=?
      WHERE id=? AND product_id=? AND attribute_definition_id=?
        AND value_text=? AND value_number IS NULL AND value_boolean IS NULL AND unit_override IS NULL`,
    [NEW_VALUE, initial.row.id, initial.product.id, initial.definition.id, OLD_VALUE]);
    if (result.changes !== 1) throw new Error(`WRITE_GUARD_BLOCKED expected changes=1, got ${result.changes}`);

    await assertOnlyApprovedDelta(db, before, initial);
    const final = await inspect(db);
    if (final.status !== "EXISTING_OK" || final.willFix !== 0) throw new Error("POSTCHECK corrected value/idempotency check failed");
    await ENGINE.integrity(db);
    await db.run("COMMIT");
    return { ...final.report, mode: "apply", writes: 1, backup };
  } catch (error) {
    await db.run("ROLLBACK").catch(() => {});
    throw error;
  }
}

async function run(options) {
  const db = await ENGINE.dbOpen(options.db, options.apply);
  try {
    const result = options.apply
      ? await apply(db, options.db, options.backupDir)
      : { ...(await inspect(db)).report, mode: "dry-run", writes: 0, backup: null };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    run(options).catch(error => {
      console.error(JSON.stringify({ status: "BLOCKED", error: error.message }, null, 2));
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(JSON.stringify({ status: "BLOCKED", error: error.message }, null, 2));
    process.exitCode = 1;
  }
}

module.exports = { PRODUCT, ATTRIBUTE_CODE, OLD_VALUE, NEW_VALUE, CONFIRM_TOKEN, parseArgs, inspect, apply, run };
