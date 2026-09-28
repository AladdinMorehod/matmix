"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/hydroisolation-core-batch1");

const STAGES = Object.freeze({
  template: { confirm: "BOOTSTRAP_HYDROISOLATION_TEMPLATE_BATCH1", writable: ["product_attribute_definitions (three allowlisted codes)", "product_attribute_templates (structure_id=10 only)"] },
  core: { confirm: "BACKFILL_HYDROISOLATION_CORE_BATCH1", writable: ["products.brand (NULL/empty only)", "product_attribute_values (READY codes, exact MAT allowlist)"] },
  visible: { confirm: "BACKFILL_HYDROISOLATION_VISIBLE_BATCH1", writable: ["products.short_description", "products.full_description", "products.seo_title", "products.seo_description"] }
});
const MUTABLE_CORE = Object.freeze(["brand"]);
const MUTABLE_VISIBLE = Object.freeze(["short_description", "full_description", "seo_title", "seo_description"]);
const FORBIDDEN_PUBLIC_COPY = Object.freeze(["по локальной карточке", "локальные title", "products.weight", "источники расходятся", "не переносились", "NEEDS_SOURCE", "SOURCE_CONFLICT", "ABSENT_BY_DESIGN"]);
const EXPECTED_DEFINITIONS = Object.freeze(Object.fromEntries(DATA.ALL_CODES.map(code => [code, {
  data_type: ["shelf_life", "package_weight", "compressive_strength", "adhesion"].includes(code) ? "number" : "text",
  default_unit: ({ shelf_life: "месяцев", package_weight: "кг", compressive_strength: "МПа", adhesion: "МПа" })[code] || null
}])));
const PRODUCT_IMMUTABLE = Object.freeze(["external_id", "title", "slug", "category", "subcategory", "product_group", "price", "weight", "unit", "image", "description", "is_active", "sort_order", "source", "last_imported_at", "created_at", "updated_at", "deleted_at", "deleted_by_id", "deleted_by_name", "image_url", "stock_status"]);

function normalizeIds(value) { return Array.isArray(value) ? value.map(v => String(v).trim()) : String(value || "").split(",").map(v => v.trim()); }
function assertExactOnly(value) {
  const ids = normalizeIds(value);
  if (ids.length !== DATA.ALL_MATS.length || ids.some((id, i) => id !== DATA.ALL_MATS[i]) || new Set(ids).size !== DATA.ALL_MATS.length) throw new Error(`--only must equal exact ordered batch: ${DATA.ALL_MATS.join(",")}`);
  return ids;
}
function parseArgs(args, stage) {
  if (!STAGES[stage]) throw new Error(`Unknown stage: ${stage}`);
  const out = { db: null, backupDir: null, apply: false, confirm: null, only: null };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [flag, ...tail] = String(args[i]).split("=");
    if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`); seen.add(flag);
    if (flag === "--apply") { if (tail.length) throw new Error("--apply takes no value"); out.apply = true; continue; }
    if (!["--db", "--backup-dir", "--confirm", "--only"].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = tail.length ? tail.join("=") : args[++i]; if (!value || value.startsWith("--")) throw new Error(`Value required for ${flag}`);
    if (flag === "--db") out.db = value; else if (flag === "--backup-dir") out.backupDir = value; else if (flag === "--confirm") out.confirm = value; else out.only = value;
  }
  if (!out.db || out.db === ":memory:") throw new Error("Explicit file path --db is required");
  if (stage !== "template") out.only = assertExactOnly(out.only);
  else if (out.only !== null) throw new Error("--only is not accepted for template stage");
  if (out.apply && (!out.backupDir || out.confirm !== STAGES[stage].confirm)) throw new Error(`Apply requires --backup-dir and --confirm ${STAGES[stage].confirm}`);
  if (!out.apply && out.confirm) throw new Error("--confirm is only accepted together with --apply");
  return out;
}
function dbOpen(file, readonly = true) {
  const full = path.resolve(file); if (!fs.existsSync(full)) throw new Error(`Database does not exist: ${full}`);
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(full, readonly ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE, error => {
      if (error) return reject(error);
      const db = {
        get(sql, p = []) { return new Promise((res, rej) => raw.get(sql, p, (e, row) => e ? rej(e) : res(row))); },
        all(sql, p = []) { return new Promise((res, rej) => raw.all(sql, p, (e, rows) => e ? rej(e) : res(rows))); },
        run(sql, p = []) { return new Promise((res, rej) => raw.run(sql, p, function cb(e) { e ? rej(e) : res({ id: this.lastID, changes: this.changes }); })); },
        backup(target) { return new Promise((res, rej) => {
          let operation;
          try { operation = raw.backup(target); } catch (error) { rej(error); return; }
          operation.step(-1, stepError => operation.finish(finishError => {
            const error = stepError || finishError;
            if (error) rej(error); else res();
          }));
        }); },
        close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
      };
      Promise.resolve().then(async () => { await db.run("PRAGMA foreign_keys=ON"); if (readonly) await db.run("PRAGMA query_only=ON"); resolve(db); }).catch(reject);
    });
  });
}
async function table(db, name) { return Boolean(await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name])); }
async function cols(db, name) { return new Set((await db.all(`PRAGMA table_info(${name})`)).map(x => x.name)); }
async function rows(db, name, where = "", params = []) { return db.all(`SELECT * FROM ${name} ${where} ORDER BY id`, params); }
function stable(value) { return JSON.stringify(value); }
async function snapshots(db) { const names = ["products", "product_attribute_definitions", "product_attribute_templates", "product_attribute_values", "product_images"]; const out = {}; for (const name of names) out[name] = await rows(db, name); return out; }
function compareFiltered(before, after, predicate, label) { const a = before.filter(predicate), b = after.filter(predicate); if (stable(a) !== stable(b)) throw new Error(`${label} snapshot changed`); }
function immutableProduct(row) { const o = {}; for (const key of PRODUCT_IMMUTABLE) o[key] = row[key] ?? null; return o; }
function onlyHydro(rows0) { return rows0.filter(r => DATA.ALL_MATS.includes(r.external_id)); }
function compareExceptProductBrand(before, after) {
  const a = before.map(r => { const x = { ...r }; if (DATA.ALL_MATS.includes(r.external_id)) x.brand = null; return x; });
  const b = after.map(r => { const x = { ...r }; if (DATA.ALL_MATS.includes(r.external_id)) x.brand = null; return x; });
  if (stable(a) !== stable(b)) throw new Error("H2 product snapshot changed outside target products.brand");
}
function assertSchema(db) { return db.get("PRAGMA user_version").then(row => { if (Number(row.user_version) !== 11) throw new Error(`Expected schema version 11, got ${row.user_version}`); }); }
async function structureGuard(db) {
  const struct = await db.get("SELECT s.*,p.name AS parent_name,p.type AS parent_type,p.is_active AS parent_active FROM catalog_structure s LEFT JOIN catalog_structure p ON p.id=s.parent_id WHERE s.id=?", [DATA.TEMPLATE.structureId]);
  if (!struct || struct.type !== "subcategory" || struct.name !== DATA.TEMPLATE.name || struct.normalized_name !== "гидроизоляция" || Number(struct.parent_id) !== DATA.TEMPLATE.parentId || struct.parent_name !== DATA.TEMPLATE.parentName || struct.parent_type !== "category" || Number(struct.parent_active) !== 1 || struct.external_code !== "SUB-000009" || Number(struct.is_active) !== 1) throw new Error("Exact hydroisolation structure/parent guard failed");
  return struct;
}
function defCompatible(row, expected) { return row.code === expected.code && row.label === expected.label && row.data_type === expected.dataType && (row.default_unit ?? null) === expected.defaultUnit && Number(row.is_active) === 1; }
async function loadDefinitions(db) {
  const all = await db.all("SELECT * FROM product_attribute_definitions ORDER BY id"); const by = new Map();
  for (const d of all) { if (by.has(d.code)) throw new Error(`Duplicate definition code: ${d.code}`); by.set(d.code, d); }
  for (const requiredCode of DATA.ALL_CODES) {
    const row = by.get(requiredCode);
    if (!row && !DATA.NEW_DEFINITIONS.some(x => x.code === requiredCode)) throw new Error(`Required reusable definition missing: ${requiredCode}`);
    if (row && (row.data_type !== EXPECTED_DEFINITIONS[requiredCode].data_type || (row.default_unit ?? null) !== EXPECTED_DEFINITIONS[requiredCode].default_unit || Number(row.is_active) !== 1)) throw new Error(`Incompatible reusable definition: ${requiredCode}`);
  }
  for (const expected of DATA.NEW_DEFINITIONS) { const row = by.get(expected.code); if (row && !defCompatible(row, expected)) throw new Error(`Incompatible new definition: ${expected.code}`); }
  return { all, by };
}
async function templateState(db) {
  await assertSchema(db); await structureGuard(db); const { by } = await loadDefinitions(db);
  const memberships = await db.all("SELECT t.*,d.code,d.data_type,d.default_unit,d.is_active AS definition_active FROM product_attribute_templates t LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id WHERE t.structure_id=? ORDER BY t.section,t.sort_order,t.id", [DATA.TEMPLATE.structureId]);
  const expectedCodes = DATA.ALL_CODES; const currentCodes = memberships.map(x => x.code); const count = DATA.ALL_CODES.length;
  const baseline = memberships.length === 0;
  const exact = memberships.length === count && DATA.TEMPLATE.mainCodes.every((code,i) => { const rows = memberships.filter(r => r.code === code); return rows.length === 1 && rows[0].section === "main" && Number(rows[0].sort_order) === i && rows[0].is_required === 0 && rows[0].unit_override === null; }) && DATA.TEMPLATE.regularCodes.every((code,i) => { const rows = memberships.filter(r => r.code === code); return rows.length === 1 && rows[0].section === "regular" && Number(rows[0].sort_order) === i && rows[0].is_required === 0 && rows[0].unit_override === null; }) && new Set(currentCodes).size === count && currentCodes.every(code => expectedCodes.includes(code));
  if (!baseline && !exact) throw new Error("Hydro template memberships must be exactly baseline 0 or exact final ordered 23");
  for (const code of DATA.ALL_CODES) {
    const d = by.get(code); if (!d) continue;
    if (!Number(d.is_active)) throw new Error(`Inactive canonical definition ${code}`);
    if (["mixing_ratio","waterproofness","crack_bridging"].includes(code) && !defCompatible(d, DATA.NEW_DEFINITIONS.find(x => x.code === code))) throw new Error(`Definition not compatible: ${code}`);
  }
  return { memberships, definitions: by, baseline, exact };
}
function countReady(product) { return Object.entries(product.core).filter(([,v]) => v.status === "READY").length + 1; }
function summary(rows0) { return rows0.reduce((s,r) => { s.total += 1; s[r.status === "ERROR" ? "errors" : r.status === "BLOCKED" ? "blocked" : r.status === "EXISTING_OK" ? "existingOk" : "partial"] += 1; s.readyAttributes += r.readyAttributes || 0; s.needsSource += r.needsSource || 0; s.sourceConflict += r.sourceConflict || 0; s.absentByDesign += r.absentByDesign || 0; s.willAdd += r.willAdd || 0; return s; }, { total:0, partial:0, existingOk:0, blocked:0, errors:0, readyAttributes:0, needsSource:0, sourceConflict:0, absentByDesign:0, willAdd:0 }); }

async function inspectTemplate(db) { const st = await templateState(db); const missing = DATA.NEW_DEFINITIONS.filter(x => !st.definitions.has(x.code)); return { stage:"H1", mode:"dry-run", status:st.exact?"EXISTING_OK":"READY", structureId:DATA.TEMPLATE.structureId, memberships:st.memberships.length, expectedMemberships:DATA.ALL_CODES.length, definitionsExisting:st.definitions.size, definitionsToCreate:missing.map(x=>x.code), writes:st.exact?0:missing.length+DATA.ALL_CODES.length }; }
async function productStates(db) {
  const all = await rows(db, "products"); const products = [];
  if (all.filter(p => DATA.ALL_MATS.includes(p.external_id)).length !== DATA.ALL_MATS.length) throw new Error("Exact target products do not all exist uniquely");
  for (const config of DATA.PRODUCTS) {
    const p = all.find(x => x.external_id === config.externalId);
    const imageCount = Number((await db.get("SELECT COUNT(*) AS n FROM product_images WHERE product_id=?", [p.id]))?.n ?? 0);
    if (Number(p.id) !== config.expectedId || p.title !== config.expectedTitle || p.slug !== config.expectedSlug || p.category !== "Смеси" || p.subcategory !== "Гидроизоляция" || Number(p.weight) !== config.expectedWeight || p.unit !== "шт" || (p.price ?? null) !== config.expectedPrice || p.image_url !== config.expectedImageUrl || imageCount !== 1 || Number(p.is_active) !== 1 || p.deleted_at) throw new Error(`Exact immutable identity/prestate guard failed for ${config.externalId}`);
    const v = await db.all("SELECT v.*,d.code,d.data_type,d.default_unit FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id", [p.id]);
    products.push({ config, product:p, values:v });
  }
  return { allProducts:all, products };
}
function valueTuple(entry, definition) {
  if (definition.data_type === "text" && typeof entry.value === "string") return { value_text:entry.value, value_number:null,value_boolean:null,unit_override:definition.default_unit || null };
  if (definition.data_type === "number" && typeof entry.value === "number" && Number.isFinite(entry.value)) return { value_text:null,value_number:entry.value,value_boolean:null,unit_override:definition.default_unit || null };
  if (definition.data_type === "boolean" && typeof entry.value === "boolean") return { value_text:null,value_number:null,value_boolean:entry.value?1:0,unit_override:definition.default_unit || null };
  throw new Error(`Source value incompatible with definition ${definition.code}`);
}
function currentTuple(row) { return { value_text:row.value_text??null,value_number:row.value_number??null,value_boolean:row.value_boolean??null,unit_override:row.unit_override??null }; }
async function inspectCore(db) {
  const tpl = await templateState(db); if (!tpl.exact) throw new Error("H2 requires final exact H1 template");
  const { allProducts, products } = await productStates(db); const rows0=[];
  for (const {config,product:p,values} of products) {
    const expectedReady = Object.entries(config.core).filter(([,v])=>v.status==="READY").map(([code])=>code).concat("brand");
    const byCode = new Map(); for (const v of values) { if (byCode.has(v.code)) throw new Error(`Duplicate target attribute ${config.externalId}/${v.code}`); byCode.set(v.code,v); }
    const unexpected = values.filter(v=>!DATA.ALL_CODES.includes(v.code)); if (unexpected.length) throw new Error(`Unapproved target values block ${config.externalId}: ${unexpected.map(v=>v.code).join(",")}`);
    if (values.length !== 0 && values.length !== expectedReady.length) throw new Error(`Unexpected attribute count for ${config.externalId}: ${values.length}; expected 0 or ${expectedReady.length}`);
    if (p.brand && String(p.brand).trim() && String(p.brand).trim() !== config.brand) throw new Error(`BRAND_CONFLICT ${config.externalId}`);
    const existingMode = values.length > 0;
    for (const [code,proposal] of Object.entries({brand:{status:"READY",value:config.brand},...config.core})) {
      const current=byCode.get(code);
      if (proposal.status === "READY") {
        const d=tpl.definitions.get(code); const tup=valueTuple(proposal,d);
        if (current && stable(currentTuple(current))!==stable(tup)) throw new Error(`VALUE_CONFLICT ${config.externalId}/${code}`);
        if (existingMode && !current) throw new Error(`Missing value in existing H2 state ${config.externalId}/${code}`);
      } else if (current) throw new Error(`Non-READY proposal already stored ${config.externalId}/${code}:${proposal.status}`);
    }
    const readyAttributes=expectedReady.length; rows0.push({ externalId:config.externalId,title:p.title,slug:p.slug,brand:config.brand,readyAttributes,needsSource:Object.values(config.core).filter(x=>x.status==="NEEDS_SOURCE").length,sourceConflict:Object.values(config.core).filter(x=>x.status==="SOURCE_CONFLICT").length,absentByDesign:Object.values(config.core).filter(x=>x.status==="ABSENT_BY_DESIGN").length,willAdd:existingMode?0:readyAttributes,status:existingMode?"EXISTING_OK":"PARTIAL" });
  }
  return { stage:"H2",mode:"dry-run",rows:rows0,summary:summary(rows0), writableSurface:{products:MUTABLE_CORE, values:DATA.ALL_CODES, images:[]}, nonTargetProducts:allProducts.filter(p=>!DATA.ALL_MATS.includes(p.external_id)).length };
}
async function applyCore(db, dbPath, backupDir) {
  const before=await snapshots(db); const plan=await inspectCore(db); if(plan.summary.errors||plan.rows.length!==9) throw new Error("H2 preflight failed");
  const backup=await backupDatabase(db,dbPath,backupDir); await db.run("BEGIN IMMEDIATE"); let writes=0;
  try {
    const lockedPlan = await inspectCore(db);
    if (lockedPlan.rows.length !== DATA.ALL_MATS.length) throw new Error("H2 locked preflight changed");
    const defRows=await db.all("SELECT * FROM product_attribute_definitions"); const defBy=new Map(defRows.map(d=>[d.code,d])); const targets=await productStates(db); const now=new Date().toISOString();
    for(const {config,product:p,values} of targets.products){
      if((p.brand??null)===null||String(p.brand).trim()===""){const u=await db.run("UPDATE products SET brand=? WHERE id=? AND external_id=? AND (brand IS NULL OR trim(brand)='')",[config.brand,p.id,config.externalId]); if(u.changes!==1) throw new Error(`brand guarded update count mismatch: ${config.externalId}`); writes+=1;}
      const hasBrand=values.some(v=>v.code==="brand");
      for(const [code,entry] of Object.entries({brand:{status:"READY",value:config.brand},...config.core})) if(entry.status==="READY"&&!values.some(v=>v.code===code)){
        const d=defBy.get(code);if(!d)throw new Error(`Missing canonical definition ${code}`);const t=valueTuple(entry,d);await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)",[p.id,d.id,t.value_text,t.value_number,t.value_boolean,t.unit_override,DATA.ALL_CODES.indexOf(code),now,now]);writes+=1;
      }
      if(hasBrand&&p.brand!==config.brand)throw new Error(`brand mismatch ${config.externalId}`);
    }
    const after=await snapshots(db); compareExceptProductBrand(before.products,after.products); compareFiltered(before.products,after.products,p=>!DATA.ALL_MATS.includes(p.external_id),"non-target products");
    compareFiltered(before.product_attribute_definitions,after.product_attribute_definitions,()=>true,"definitions"); compareFiltered(before.product_attribute_templates,after.product_attribute_templates,()=>true,"templates"); compareFiltered(before.product_images,after.product_images,()=>true,"images");
    compareFiltered(before.product_attribute_values,after.product_attribute_values,v=>!targets.products.some(x=>x.product.id===v.product_id),"non-target attribute values");
    const post=await inspectCore(db); if(post.summary.willAdd!==0||post.rows.some(r=>r.status!=="EXISTING_OK")) throw new Error("H2 idempotent postcheck failed");
    await integrity(db); await db.run("COMMIT"); return {...post,mode:"apply",writes,backup};
  }catch(e){try{await db.run("ROLLBACK");}catch{} throw e;}
}
async function backupDatabase(db,dbPath,dir){
  const source=path.resolve(dbPath);const targetDir=path.resolve(dir||path.dirname(source));await fs.promises.mkdir(targetDir,{recursive:true});
  let target=null;let reservation=null;
  for(let attempt=0;attempt<8;attempt+=1){const stamp=new Date().toISOString().replace(/[:.]/g,"-");const candidate=path.join(targetDir,`matmix-hydroisolation-${stamp}-${crypto.randomBytes(6).toString("hex")}.db`);try{reservation=fs.openSync(candidate,"wx");fs.closeSync(reservation);reservation=null;target=candidate;break;}catch(error){if(reservation!==null){try{fs.closeSync(reservation);}catch{}reservation=null;}if(error.code!=="EEXIST")throw error;}}
  if(!target)throw new Error("Unable to reserve a unique SQLite backup path");
  await db.backup(target);
  const stat=await fs.promises.stat(target);if(stat.size<1024)throw new Error(`Online SQLite backup is unexpectedly small: ${target}`);
  const sha256=await new Promise((resolve,reject)=>{const hash=crypto.createHash("sha256");const stream=fs.createReadStream(target);stream.on("error",reject);stream.on("data",chunk=>hash.update(chunk));stream.on("end",()=>resolve(hash.digest("hex")));});
  const verification=await dbOpen(target,true);
  try{const integrity=await verification.get("PRAGMA integrity_check");if(integrity?.integrity_check!=="ok")throw new Error(`Online backup integrity_check failed: ${JSON.stringify(integrity)}`);const version=Number((await verification.get("PRAGMA user_version"))?.user_version||0);if(version!==11)throw new Error(`Online backup has unexpected schema version: ${version}`);const foreignKeys=await verification.all("PRAGMA foreign_key_check");if(foreignKeys.length)throw new Error(`Online backup foreign_key_check rows=${foreignKeys.length}`);}
  finally{await verification.close();}
  return{path:target,size:stat.size,sha256,source};
}
async function integrity(db){const i=await db.get("PRAGMA integrity_check");if(i.integrity_check!=="ok")throw new Error(`integrity_check=${i.integrity_check}`);const fk=await db.all("PRAGMA foreign_key_check");if(fk.length)throw new Error(`foreign_key_check rows=${fk.length}`);}

function copyValue(config, field) { const names = { short_description:"shortDescription", full_description:"fullDescription", seo_title:"seoTitle", seo_description:"seoDescription" }; return config.copy[names[field]]; }
function assertPublicCopySafe(config) {
  for (const field of ["shortDescription", "fullDescription", "seoTitle", "seoDescription"]) {
    const value = config.copy[field];
    if (typeof value !== "string" || !value.trim()) throw new Error(`PUBLIC_COPY_EMPTY ${config.externalId}/${field}`);
    const phrase = FORBIDDEN_PUBLIC_COPY.find(item => value.toLocaleLowerCase("ru").includes(item.toLocaleLowerCase("ru")));
    if (phrase) throw new Error(`PUBLIC_COPY_META_PHRASE ${config.externalId}/${field}: ${phrase}`);
  }
}
async function inspectVisible(db){const core=await inspectCore(db);if(core.rows.some(r=>r.status!=="EXISTING_OK"))throw new Error("H3 requires exact completed H2 state");const {products}=await productStates(db);const out=[];for(const {config,product:p}of products){assertPublicCopySafe(config);const fields=Object.fromEntries(MUTABLE_VISIBLE.map(f=>[f,p[f]??null]));for(const f of MUTABLE_VISIBLE)if(fields[f]!==null&&fields[f]!==""&&fields[f]!==copyValue(config,f))throw new Error(`VISIBLE_VALUE_CONFLICT ${config.externalId}/${f}`);out.push({externalId:config.externalId,title:p.title,slug:p.slug,status:MUTABLE_VISIBLE.every(f=>fields[f]===copyValue(config,f))?"EXISTING_OK":"READY",fields,proposed:config.copy});}return{stage:"H3",mode:"dry-run",rows:out,summary:{total:out.length,ready:out.filter(r=>r.status==="READY").length,existingOk:out.filter(r=>r.status==="EXISTING_OK").length,blocked:0,errors:0},writableSurface:MUTABLE_VISIBLE};}
async function applyVisible(db,dbPath,backupDir){const before=await snapshots(db);const plan=await inspectVisible(db);const backup=await backupDatabase(db,dbPath,backupDir);await db.run("BEGIN IMMEDIATE");let writes=0;try{await inspectVisible(db);const {products}=await productStates(db);for(const{config,product:p}of products){const set=[];const vals=[];for(const f of MUTABLE_VISIBLE)if((p[f]??null)!==copyValue(config,f)){set.push(`${f}=?`);vals.push(copyValue(config,f));}if(set.length){vals.push(p.id,config.externalId);const result=await db.run(`UPDATE products SET ${set.join(",")} WHERE id=? AND external_id=?`,vals);if(result.changes!==1)throw new Error(`H3 exact update failed ${config.externalId}`);writes+=1;}}
  const after=await snapshots(db);compareFiltered(before.products,after.products,p=>!DATA.ALL_MATS.includes(p.external_id),"non-target products");for(const config of DATA.PRODUCTS){const a=before.products.find(p=>p.external_id===config.externalId),b=after.products.find(p=>p.external_id===config.externalId);if(stable(immutableProduct(a))!==stable(immutableProduct(b))||a.brand!==b.brand)throw new Error(`H3 immutable product fields changed ${config.externalId}`);}
  for(const t of ["product_attribute_definitions","product_attribute_templates","product_attribute_values","product_images"])compareFiltered(before[t],after[t],()=>true,t);const post=await inspectVisible(db);if(post.rows.some(r=>r.status!=="EXISTING_OK"))throw new Error("H3 postcheck failed");await integrity(db);await db.run("COMMIT");return{...post,mode:"apply",writes,backup};
 }catch(e){try{await db.run("ROLLBACK");}catch{}throw e;}}
async function applyTemplate(db, dbPath, backupDir) {
  const before = await snapshots(db);
  await inspectTemplate(db);
  const backup = await backupDatabase(db, dbPath, backupDir);
  await db.run("BEGIN IMMEDIATE");
  let writes = 0;
  try {
    const state = await templateState(db);
    const existingDefinitions = state.definitions;
    const definitionColumns = await cols(db, "product_attribute_definitions");
    for (const definition of DATA.NEW_DEFINITIONS) {
      if (existingDefinitions.has(definition.code)) continue;
      const fields = ["code", "label", "data_type", "default_unit", "default_section", "sort_order", "is_active"];
      const values = [definition.code, definition.label, definition.dataType, definition.defaultUnit, "Характеристики", 100, 1];
      if (definitionColumns.has("created_at")) { fields.push("created_at"); values.push(new Date().toISOString()); }
      if (definitionColumns.has("updated_at")) { fields.push("updated_at"); values.push(new Date().toISOString()); }
      await db.run(`INSERT INTO product_attribute_definitions(${fields.join(",")}) VALUES(${fields.map(() => "?").join(",")})`, values);
      writes += 1;
    }
    if (state.baseline) {
      const definitionRows = await db.all("SELECT id,code FROM product_attribute_definitions");
      const idByCode = new Map(definitionRows.map(row => [row.code, row.id]));
      const now = new Date().toISOString();
      for (const [section, codes] of [["main", DATA.TEMPLATE.mainCodes], ["regular", DATA.TEMPLATE.regularCodes]]) {
        for (const [sortOrder, code] of codes.entries()) {
          await db.run("INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order,is_required,unit_override,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)", [DATA.TEMPLATE.structureId, idByCode.get(code), section, sortOrder, 0, null, now, now]);
          writes += 1;
        }
      }
    }
    const after = await snapshots(db);
    compareFiltered(before.products, after.products, () => true, "products");
    compareFiltered(before.product_attribute_values, after.product_attribute_values, () => true, "values");
    compareFiltered(before.product_images, after.product_images, () => true, "images");
    const beforeOtherTemplates = before.product_attribute_templates.filter(row => row.structure_id !== DATA.TEMPLATE.structureId);
    const afterOtherTemplates = after.product_attribute_templates.filter(row => row.structure_id !== DATA.TEMPLATE.structureId);
    if (stable(beforeOtherTemplates) !== stable(afterOtherTemplates)) throw new Error("H1 changed other templates");
    const beforeDefinitions = new Map(before.product_attribute_definitions.map(row => [row.code, row]));
    const afterDefinitions = new Map(after.product_attribute_definitions.map(row => [row.code, row]));
    for (const [code, row] of beforeDefinitions) if (stable(row) !== stable(afterDefinitions.get(code))) throw new Error(`H1 changed existing definition ${code}`);
    const added = [...afterDefinitions.keys()].filter(code => !beforeDefinitions.has(code));
    const permitted = DATA.NEW_DEFINITIONS.filter(definition => !beforeDefinitions.has(definition.code)).map(definition => definition.code);
    if (added.length !== permitted.length || added.some(code => !permitted.includes(code))) throw new Error("H1 inserted a non-allowlisted definition");
    const post = await inspectTemplate(db);
    if (post.status !== "EXISTING_OK" || post.definitionsToCreate.length) throw new Error("H1 postcheck failed");
    await integrity(db);
    await db.run("COMMIT");
    return { ...post, mode: "apply", writes, backup };
  } catch (error) { try { await db.run("ROLLBACK"); } catch {} throw error; }
}

async function run(stage,args=process.argv.slice(2)){const opts=parseArgs(args,stage);const db=await dbOpen(opts.db,!opts.apply);try{let report;if(stage==="template")report=opts.apply?await applyTemplate(db,opts.db,opts.backupDir):await inspectTemplate(db);if(stage==="core")report=opts.apply?await applyCore(db,opts.db,opts.backupDir):await inspectCore(db);if(stage==="visible")report=opts.apply?await applyVisible(db,opts.db,opts.backupDir):await inspectVisible(db);console.log(JSON.stringify(report,null,2));return report;}finally{await db.close();}}
module.exports={DATA,STAGES,MUTABLE_CORE,MUTABLE_VISIBLE,FORBIDDEN_PUBLIC_COPY,EXPECTED_DEFINITIONS,assertExactOnly,assertPublicCopySafe,parseArgs,dbOpen,inspectTemplate,inspectCore,inspectVisible,applyTemplate,applyCore,applyVisible,backupDatabase,run,integrity};
