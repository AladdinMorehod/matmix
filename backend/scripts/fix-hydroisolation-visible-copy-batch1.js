"use strict";

const ENGINE = require("./hydroisolation-batch1-engine");
const DATA = ENGINE.DATA;

const ONLY = Object.freeze(["MAT-000102", "MAT-000104", "MAT-000107"]);
const CONFIRM = "FIX_HYDROISOLATION_VISIBLE_COPY_BATCH1";
const CHANGES = Object.freeze({
  "MAT-000102": Object.freeze({
    full_description: "Готовая полиакриловая мастика СТК Профи БС-755 PROFI поставляется в ведре 5 кг. Производитель указывает её применение для обработки жилых и нежилых помещений, включая санузлы и ванные комнаты. Расход составляет 100–120 г/м². Характеристики других продуктов СТК Профи в этот текст не переносились.",
  }),
  "MAT-000104": Object.freeze({
    full_description: "Смесь Русеан НЦ в фасовке 25 кг основана на напрягающем цементе и предназначена для конструкционной гидроизоляции. Производитель описывает НЦ как специальную смесь для гидроизоляционных задач; доступный официальный материал допускает нанесение кистью или распылением. Технические параметры, по которым источники расходятся, в описание не включены.",
  }),
  "MAT-000107": Object.freeze({
    short_description: "Ceresit CR 166, комплект 32 кг по локальной карточке — двухкомпонентная эластичная гидроизоляция.",
    full_description: "Ceresit CR 166 — двухкомпонентная эластичная цементно-полимерная гидроизоляция для внутренних и наружных работ. Официальная упаковка включает компонент A — сухую смесь 24 кг — и компонент B — жидкий эластификатор 8 л; локальные title и products.weight остаются без изменений. Смесь наносят шпателем, кистью или механизированно на незасоленные минеральные основания без гипса. Плитку можно укладывать через 12 часов, гидравлическая нагрузка допускается через 7 суток.",
    seo_title: "Ceresit CR 166 комплект 32 кг — купить в Москве",
  }),
});

function parseArgs(args) {
  const out = { db: null, backupDir: null, apply: false, confirm: null, only: null };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [flag, ...tail] = String(args[i]).split("=");
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === "--apply") { if (tail.length) throw new Error("--apply takes no value"); out.apply = true; continue; }
    if (!["--db", "--backup-dir", "--confirm", "--only"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = tail.length ? tail.join("=") : args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Value required for ${flag}`);
    if (flag === "--db") out.db = value;
    else if (flag === "--backup-dir") out.backupDir = value;
    else if (flag === "--confirm") out.confirm = value;
    else out.only = value;
  }
  if (!out.db || out.db === ":memory:") throw new Error("Explicit file path --db is required");
  if (typeof out.only !== "string" || out.only.split(",").map(value => value.trim()).join(",") !== ONLY.join(",")) throw new Error(`--only must equal exact ordered batch: ${ONLY.join(",")}`);
  if (out.apply && (!out.backupDir || out.confirm !== CONFIRM)) throw new Error(`Apply requires --backup-dir and --confirm ${CONFIRM}`);
  if (!out.apply && (out.confirm || out.backupDir)) throw new Error("--confirm and --backup-dir are accepted only with --apply");
  return out;
}

function normalizedRows(rows) { return rows.map(row => JSON.stringify(row)).sort(); }
function expectedConfig(externalId) {
  const config = DATA.PRODUCTS.find(row => row.externalId === externalId);
  if (!config) throw new Error(`Missing canonical product ${externalId}`);
  return config;
}
function newValue(config, field) {
  const key = { short_description: "shortDescription", full_description: "fullDescription", seo_title: "seoTitle" }[field];
  return config.copy[key];
}

async function inspect(db) {
  const rows = await db.all(`SELECT * FROM products WHERE external_id IN (${ONLY.map(() => "?").join(",")}) ORDER BY external_id`, ONLY);
  if (rows.length !== ONLY.length) throw new Error(`Exact target count required: expected ${ONLY.length}, got ${rows.length}`);
  const result = [];
  for (const externalId of ONLY) {
    const config = expectedConfig(externalId);
    const product = rows.find(row => row.external_id === externalId);
    if (!product || product.id !== config.expectedId || product.title !== config.expectedTitle || product.slug !== config.expectedSlug || product.category !== config.expectedCategory || product.subcategory !== config.expectedSubcategory || product.weight !== config.expectedWeight || product.unit !== config.expectedUnit) {
      throw new Error(`IDENTITY_GUARD_BLOCKED ${externalId}`);
    }
    const fields = CHANGES[externalId];
    let needsFix = false;
    for (const [field, oldValue] of Object.entries(fields)) {
      const canonical = newValue(config, field);
      if (product[field] !== oldValue && product[field] !== canonical) throw new Error(`MIGRATION_GUARD_BLOCKED ${externalId}/${field}`);
      if (product[field] === oldValue) needsFix = true;
    }
    result.push({ externalId, title: product.title, fields: Object.fromEntries(Object.keys(fields).map(field => [field, product[field]])), status: needsFix ? "READY" : "EXISTING_OK" });
  }
  return { stage: "H3_VISIBLE_COPY_CORRECTIVE", mode: "dry-run", rows: result, summary: { total: result.length, ready: result.filter(row => row.status === "READY").length, existingOk: result.filter(row => row.status === "EXISTING_OK").length, blocked: 0, errors: 0 }, writableSurface: Object.fromEntries(ONLY.map(id => [id, Object.keys(CHANGES[id]).map(field => `products.${field}`)])) };
}

async function snapshots(db) {
  const tables = ["products", "product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"];
  const out = {};
  for (const table of tables) out[table] = await db.all(`SELECT * FROM ${table} ORDER BY rowid`);
  return out;
}

function assertSnapshots(before, after) {
  for (const table of ["product_attribute_values", "product_attribute_definitions", "product_attribute_templates", "product_images"]) {
    if (JSON.stringify(normalizedRows(before[table])) !== JSON.stringify(normalizedRows(after[table]))) throw new Error(`IMMUTABLE_TABLE_CHANGED ${table}`);
  }
  const afterById = new Map(after.products.map(row => [row.id, row]));
  for (const oldRow of before.products) {
    const actual = afterById.get(oldRow.id);
    if (!actual) throw new Error(`PRODUCT_ROW_REMOVED ${oldRow.external_id}`);
    const allowed = CHANGES[oldRow.external_id] || {};
    const expected = { ...oldRow };
    for (const field of Object.keys(allowed)) expected[field] = newValue(expectedConfig(oldRow.external_id), field);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`IMMUTABLE_PRODUCT_FIELD_CHANGED ${oldRow.external_id}`);
  }
  if (after.products.length !== before.products.length) throw new Error("PRODUCT_SET_CHANGED");
}

async function apply(db, dbPath, backupDir) {
  const plan = await inspect(db);
  if (plan.summary.ready === 0) return { ...plan, mode: "apply", writes: 0, backup: null };
  const backup = await ENGINE.backupDatabase(db, dbPath, backupDir);
  await db.run("BEGIN IMMEDIATE");
  let writes = 0;
  try {
    const lockedPlan = await inspect(db);
    if (lockedPlan.summary.total !== ONLY.length) throw new Error("LOCKED_PREFLIGHT_CHANGED");
    const before = await snapshots(db);
    const products = await db.all(`SELECT * FROM products WHERE external_id IN (${ONLY.map(() => "?").join(",")}) ORDER BY external_id`, ONLY);
    for (const externalId of ONLY) {
      const config = expectedConfig(externalId);
      const product = products.find(row => row.external_id === externalId);
      const fields = CHANGES[externalId];
      const set = [];
      const setParams = [];
      const guards = [];
      const guardParams = [];
      for (const [field, oldValue] of Object.entries(fields)) {
        const canonical = newValue(config, field);
        guards.push(`${field} IS ?`);
        guardParams.push(product[field]);
        if (product[field] !== canonical) { set.push(`${field}=?`); setParams.push(canonical); }
      }
      if (set.length) {
        const params = [...setParams, product.id, externalId, config.expectedTitle, config.expectedSlug, ...guardParams];
        const update = await db.run(`UPDATE products SET ${set.join(",")} WHERE id=? AND external_id=? AND title=? AND slug=? AND ${guards.join(" AND ")}`, params);
        if (update.changes !== 1) throw new Error(`GUARDED_UPDATE_COUNT_MISMATCH ${externalId}`);
        writes += 1;
      }
    }
    const after = await snapshots(db);
    assertSnapshots(before, after);
    const post = await inspect(db);
    if (post.summary.ready !== 0 || post.summary.existingOk !== ONLY.length) throw new Error("POSTCHECK_NOT_EXISTING_OK");
    await ENGINE.integrity(db);
    await db.run("COMMIT");
    return { ...post, mode: "apply", writes, backup };
  } catch (error) {
    try { await db.run("ROLLBACK"); } catch {}
    throw error;
  }
}

async function run(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const db = await ENGINE.dbOpen(options.db, !options.apply);
  try {
    const report = options.apply ? await apply(db, options.db, options.backupDir) : await inspect(db);
    console.log(JSON.stringify(report, null, 2));
    return report;
  } finally { await db.close(); }
}

if (require.main === module) run().catch(error => { console.error(`HYDRO VISIBLE COPY CORRECTIVE ABORTED: ${error.message}`); process.exitCode = 1; });
module.exports = { ONLY, CONFIRM, CHANGES, parseArgs, inspect, snapshots, assertSnapshots, apply, run };
