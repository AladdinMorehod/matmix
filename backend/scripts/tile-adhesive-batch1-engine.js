const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const DATA = require('./data/tile-adhesive-core-batch1');

const STATUS_SET = new Set(['READY', 'NEEDS_SOURCE', 'NEEDS_MAPPING', 'SOURCE_CONFLICT', 'NOT_AVAILABLE']);
const TABLES = ['products', 'product_attribute_values', 'product_attribute_definitions', 'product_attribute_templates', 'product_images'];
const CORE_CONFIRM = DATA.CONFIRM_H2;
const TEMPLATE_CONFIRM = DATA.CONFIRM_H1;
const clean = value => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim();
const norm = value => clean(value).toLocaleLowerCase('ru-RU').replace(/ё/g, 'е');
const stable = value => JSON.stringify(value);
const hash = value => crypto.createHash('sha256').update(stable(value)).digest('hex');

function assertExactOnly(value) {
  const exact = DATA.ALL_MATS.join(',');
  if (Array.isArray(value)) {
    if (value.length !== DATA.ALL_MATS.length || value.some((id, index) => id !== DATA.ALL_MATS[index])) throw new Error(`--only must be exactly ${exact}`);
    return [...value];
  }
  if (String(value ?? '') !== exact) throw new Error(`--only must be exactly ${exact}`);
  return [...DATA.ALL_MATS];
}
function assertDryRunOnly(value) {
  const fullScope = DATA.ALL_MATS.join(',');
  if ((Array.isArray(value) && value.length === DATA.ALL_MATS.length && value.every((id, index) => id === DATA.ALL_MATS[index])) || String(value ?? '') === fullScope) return [...DATA.ALL_MATS];
  if ((Array.isArray(value) && value.length === 1 && value[0] === 'MAT-000133') || String(value ?? '') === 'MAT-000133') return ['MAT-000133'];
  throw new Error(`--only dry-run scope must be exactly ${DATA.ALL_MATS.join(',')} or MAT-000133`);
}
function parseArgs(args, stage) {
  if (!['template', 'core'].includes(stage)) throw new Error(`Unknown stage ${stage}`);
  const out = { db: null, backupDir: null, confirm: null, only: null, apply: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const [flag, ...tail] = String(args[i]).split('=');
    if (seen.has(flag)) throw new Error(`Duplicate option ${flag}`);
    seen.add(flag);
    if (flag === '--apply') { if (tail.length) throw new Error('--apply takes no value'); out.apply = true; continue; }
    if (flag === '--dry-run') { if (tail.length) throw new Error('--dry-run takes no value'); continue; }
    if (!['--db', '--backup-dir', '--confirm', '--only'].includes(flag)) throw new Error(`Unknown option ${flag}`);
    const value = tail.length ? tail.join('=') : args[++i];
    if (!value || String(value).startsWith('--')) throw new Error(`Value required for ${flag}`);
    if (flag === '--db') out.db = value;
    if (flag === '--backup-dir') out.backupDir = value;
    if (flag === '--confirm') out.confirm = value;
    if (flag === '--only') out.only = value;
  }
  if (!out.db || out.db === ':memory:') throw new Error('Explicit existing --db path required');
  if (seen.has('--apply') && seen.has('--dry-run')) throw new Error('Choose either --dry-run or --apply');
  if (stage === 'template' && out.only !== null) throw new Error('--only is not accepted for H1');
  if (stage === 'core') out.only = out.apply ? assertExactOnly(out.only) : assertDryRunOnly(out.only);
  const expectedConfirm = stage === 'template' ? TEMPLATE_CONFIRM : CORE_CONFIRM;
  if (out.apply && (!out.backupDir || out.confirm !== expectedConfirm)) throw new Error(`--apply requires --backup-dir and --confirm ${expectedConfirm}`);
  if (!out.apply && out.confirm) throw new Error('--confirm is accepted only with --apply');
  return out;
}
function dbOpen(file, writable = false) {
  const full = path.resolve(file);
  if (!fs.existsSync(full)) throw new Error(`Database does not exist: ${full}`);
  return new Promise((resolve, reject) => {
    const raw = new sqlite3.Database(full, writable ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY, error => {
      if (error) return reject(error);
      const db = {
        raw,
        run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function done(err) { err ? rej(err) : res({ id: this.lastID, changes: this.changes }); })); },
        get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
        all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
        backup(target) { return new Promise((res, rej) => { let op; try { op = raw.backup(target); } catch (e) { rej(e); return; } op.step(-1, e => op.finish(fe => (e || fe) ? rej(e || fe) : res())); }); },
        close() { return new Promise((res, rej) => raw.close(e => e ? rej(e) : res())); }
      };
      Promise.resolve().then(async () => { await db.run('PRAGMA foreign_keys=ON'); if (!writable) await db.run('PRAGMA query_only=ON'); resolve(db); }).catch(async e => { await db.close().catch(() => {}); reject(e); });
    });
  });
}
async function columns(db, table) { return new Set((await db.all(`PRAGMA table_info(${table})`)).map(row => row.name)); }
async function assertSchema(db) {
  const version = Number((await db.get('PRAGMA user_version'))?.user_version ?? 0);
  if (version !== 11) throw new Error(`SCHEMA_BLOCKED expected user_version=11, got ${version}`);
  for (const [table, required] of Object.entries({
    catalog_structure: ['id','parent_id','type','name','normalized_name','external_code','is_active'],
    products: ['id','external_id','title','slug','category','subcategory','brand','weight','unit','is_active','deleted_at'],
    product_attribute_definitions: ['id','code','label','data_type','default_unit','default_section','sort_order','is_active','created_at','updated_at'],
    product_attribute_templates: ['id','structure_id','attribute_definition_id','section','sort_order','is_required','unit_override','created_at','updated_at'],
    product_attribute_values: ['id','product_id','attribute_definition_id','value_text','value_number','value_boolean','unit_override','sort_order','created_at','updated_at'],
    product_images: ['id','product_id']
  })) {
    const found = await columns(db, table);
    const missing = required.filter(name => !found.has(name));
    if (missing.length) throw new Error(`SCHEMA_BLOCKED missing ${table} columns: ${missing.join(',')}`);
  }
  return version;
}
async function integrity(db) {
  const row = await db.get('PRAGMA integrity_check');
  if (row?.integrity_check !== 'ok') throw new Error(`integrity_check failed: ${JSON.stringify(row)}`);
  const foreign = await db.all('PRAGMA foreign_key_check');
  if (foreign.length) throw new Error(`foreign_key_check failed: ${foreign.length} row(s)`);
  return { integrity: 'ok', foreignKeyViolations: 0 };
}
async function structureGuard(db) {
  const s = await db.get(`SELECT s.id,s.parent_id,s.type,s.name,s.normalized_name,s.external_code,s.is_active,
      p.name AS parent_name,p.type AS parent_type,p.is_active AS parent_active
    FROM catalog_structure s LEFT JOIN catalog_structure p ON p.id=s.parent_id WHERE s.id=?`, [DATA.TEMPLATE.structureId]);
  const expected = DATA.TEMPLATE;
  if (!s || Number(s.id) !== 16 || Number(s.parent_id) !== 1 || s.type !== 'subcategory' || s.name !== 'Клей для Плитки'
      || s.normalized_name !== 'клей для плитки' || s.external_code !== 'SUB-000015' || Number(s.is_active) !== 1
      || s.parent_name !== 'Смеси' || s.parent_type !== 'category' || Number(s.parent_active) !== 1) {
    throw new Error(`EXACT_STRUCTURE_GUARD_BLOCKED expected structure 16/SUB-000015 under active Смеси, got ${JSON.stringify(s || null)}`);
  }
  return s;
}
function definitionCompatible(row, expected, exactLabel = false) {
  return row && row.code === expected.code && (!exactLabel || row.label === expected.label)
    && row.data_type === (expected.dataType ?? expected.data_type)
    && (row.default_unit ?? null) === (expected.defaultUnit ?? expected.unit ?? null)
    && Number(row.is_active) === 1
    && (expected.defaultSection === undefined || row.default_section === expected.defaultSection);
}
function assertIdentityStatusContract(products = DATA.PRODUCTS) {
  if (products.some(product => product.identityStatus === 'PARTIAL' && product.externalId !== 'MAT-000133')) throw new Error('DATA_BLOCKED only MAT-000133 may remain PARTIAL');
  if (products.some(product => !['IDENTITY_CONFIRMED', 'PARTIAL'].includes(product.identityStatus))) throw new Error('DATA_BLOCKED unsupported product identity status');
}
function validateData() {
  const expectedMats = Array.from({ length: 19 }, (_, index) => `MAT-${String(127 + index).padStart(6, '0')}`);
  if (stable(DATA.ALL_MATS) !== stable(expectedMats)) throw new Error('DATA_BLOCKED exact ordered 19-MAT scope mismatch');
  if (stable(DATA.PRODUCTS.map(product => product.externalId)) !== stable(expectedMats)) throw new Error('DATA_BLOCKED product rows do not match exact ordered scope');
  assertIdentityStatusContract();
  const expectedMain = ['brand', 'product_type', 'shelf_life', 'package_weight'];
  const expectedRegular = ['base', 'purpose', 'application_area', 'substrates', 'color', 'adhesive_class', 'layer_thickness', 'consumption', 'water_requirement', 'pot_life', 'application_temperature', 'open_time', 'adjustment_time', 'walkability', 'heated_floor_compatibility', 'standard'];
  if (stable(DATA.TEMPLATE.mainCodes) !== stable(expectedMain) || stable(DATA.TEMPLATE.regularCodes) !== stable(expectedRegular)) throw new Error('DATA_BLOCKED exact H1 template order mismatch');
  const expectedNew = [
    { code: 'adhesive_class', label: 'Класс клея', dataType: 'text' },
    { code: 'open_time', label: 'Открытое время', dataType: 'text' },
    { code: 'adjustment_time', label: 'Время корректировки', dataType: 'text' },
    { code: 'heated_floor_compatibility', label: 'Подходит для теплого пола', dataType: 'boolean' }
  ];
  if (DATA.NEW_DEFINITIONS.length !== expectedNew.length) throw new Error('DATA_BLOCKED new-definition count mismatch');
  for (let index = 0; index < expectedNew.length; index += 1) {
    const actual = DATA.NEW_DEFINITIONS[index]; const expected = expectedNew[index];
    if (actual.code !== expected.code || actual.label !== expected.label || actual.dataType !== expected.dataType || actual.defaultUnit !== null || actual.defaultSection !== 'Характеристики') throw new Error(`DATA_BLOCKED incompatible new definition ${expected.code}`);
  }
  const definitionCodes = [...DATA.EXISTING_DEFINITIONS, ...DATA.NEW_DEFINITIONS].map(item => item.code);
  if (new Set(definitionCodes).size !== definitionCodes.length || stable([...definitionCodes].sort()) !== stable([...DATA.ALL_CODES].sort())) throw new Error('DATA_BLOCKED definition codes do not exactly cover template codes');
  const sourceIds = new Set(Object.keys(DATA.SOURCES));
  let regularReady = 0;
  for (const product of DATA.PRODUCTS) {
    if (!product.expectedTitle || !product.expectedCategory || !product.expectedSubcategory || !product.expectedBrand || !Number.isFinite(Number(product.expectedWeight)) || !product.expectedUnit) throw new Error(`DATA_BLOCKED missing immutable identity fields ${product.externalId}`);
    if (!product.sourceKeys?.length || product.sourceKeys.some(source => !sourceIds.has(source))) throw new Error(`DATA_BLOCKED unknown identity source ${product.externalId}`);
    if (!product.core || stable(Object.keys(product.core).sort()) !== stable([...DATA.ALL_CODES].sort())) throw new Error(`DATA_BLOCKED exact core slot set mismatch ${product.externalId}`);
    for (const code of DATA.ALL_CODES) {
      const fact = product.core[code];
      if (!STATUS_SET.has(fact.status)) throw new Error(`DATA_BLOCKED invalid status ${product.externalId}/${code}`);
      if (!Array.isArray(fact.sources) || (fact.status === 'READY' && fact.sources.length === 0) || fact.sources.some(source => !sourceIds.has(source))) throw new Error(`DATA_BLOCKED unknown/missing fact source ${product.externalId}/${code}`);
      if (fact.status === 'READY') {
        const definition = [...DATA.EXISTING_DEFINITIONS, ...DATA.NEW_DEFINITIONS].find(item => item.code === code);
        if (!definition || fact.dataType !== (definition.dataType ?? definition.data_type)) throw new Error(`DATA_BLOCKED READY type mismatch ${product.externalId}/${code}`);
        if (definition.dataType === 'text' && (typeof fact.value !== 'string' || !fact.value.trim())) throw new Error(`DATA_BLOCKED empty/nontext READY fact ${product.externalId}/${code}`);
        if (definition.dataType === 'number' && (typeof fact.value !== 'number' || !Number.isFinite(fact.value))) throw new Error(`DATA_BLOCKED nonnumeric READY fact ${product.externalId}/${code}`);
        if (definition.dataType === 'boolean' && typeof fact.value !== 'boolean') throw new Error(`DATA_BLOCKED nonboolean READY fact ${product.externalId}/${code}`);
        if ((fact.unit ?? null) !== (definition.defaultUnit ?? definition.unit ?? null)) throw new Error(`DATA_BLOCKED READY unit mismatch ${product.externalId}/${code}`);
        if (code === 'heated_floor_compatibility') {
          if (typeof fact.sourceWording !== 'string' || !fact.sourceWording.trim()) throw new Error(`DATA_BLOCKED heated-floor fact lacks exact source wording ${product.externalId}`);
          if (fact.value === false && !/(^|\b)(нет|не\s+подходит|не\s+допускается|без\s+подогрева)(\b|$)/iu.test(fact.sourceWording)) throw new Error(`DATA_BLOCKED false heated-floor value lacks explicit incompatibility ${product.externalId}`);
        }
      } else if (fact.value !== null && fact.value !== undefined) throw new Error(`DATA_BLOCKED unresolved slot carries a value ${product.externalId}/${code}`);
      if (DATA.TEMPLATE.regularCodes.includes(code) && fact.status === 'READY') regularReady += 1;
    }
  }
  if (regularReady !== 235) throw new Error(`DATA_BLOCKED corrected regular READY count expected 235, got ${regularReady}`);
  return { products: DATA.PRODUCTS.length, logicalSlots: DATA.PRODUCTS.length * DATA.ALL_CODES.length, regularReady };
}
async function loadDefinitionState(db) {
  const rows = await db.all('SELECT * FROM product_attribute_definitions ORDER BY id');
  const byCode = new Map();
  for (const row of rows) {
    if (byCode.has(row.code)) throw new Error(`DUPLICATE_DEFINITION_CODE ${row.code}`);
    byCode.set(row.code, row);
  }
  for (const expected of DATA.EXISTING_DEFINITIONS) {
    const row = byCode.get(expected.code);
    if (!row) throw new Error(`SCHEMA_BLOCKED required existing definition missing: ${expected.code}`);
    if (!definitionCompatible(row, expected)) throw new Error(`SCHEMA_BLOCKED incompatible existing definition: ${expected.code}`);
  }
  for (const expected of DATA.NEW_DEFINITIONS) {
    const row = byCode.get(expected.code);
    if (row && !definitionCompatible(row, expected, true)) throw new Error(`SCHEMA_BLOCKED incompatible existing definition: ${expected.code}`);
  }
  return { rows, byCode };
}
function expectedMemberships() {
  return [
    ...DATA.TEMPLATE.mainCodes.map((code, sortOrder) => ({ code, section: 'main', sortOrder, isRequired: 0, unitOverride: null })),
    ...DATA.TEMPLATE.regularCodes.map((code, sortOrder) => ({ code, section: 'regular', sortOrder, isRequired: 0, unitOverride: null }))
  ];
}
function isExactMembershipState(rows) {
  const want = expectedMemberships();
  if (rows.length !== want.length) return false;
  return want.every(item => {
    const matches = rows.filter(row => row.code === item.code);
    return matches.length === 1 && matches[0].section === item.section && Number(matches[0].sort_order) === item.sortOrder
      && Number(matches[0].is_required) === 0 && (matches[0].unit_override ?? null) === null;
  }) && new Set(rows.map(row => row.code)).size === want.length;
}
async function inspectTemplate(db) {
  validateData(); await assertSchema(db); await structureGuard(db); const definitions = await loadDefinitionState(db);
  const rows = await db.all(`SELECT t.*,d.code FROM product_attribute_templates t
    LEFT JOIN product_attribute_definitions d ON d.id=t.attribute_definition_id
    WHERE t.structure_id=? ORDER BY t.section,t.sort_order,t.id`, [DATA.TEMPLATE.structureId]);
  const exact = isExactMembershipState(rows);
  const missingCodes = DATA.NEW_DEFINITIONS.filter(d => !definitions.byCode.has(d.code)).map(d => d.code);
  if (rows.length !== 0 && !exact) throw new Error(`H1 membership state BLOCKED: expected baseline 0 or exact final ordered 20, found ${rows.length}`);
  if (exact && missingCodes.length) throw new Error('H1 exact membership exists without all four compatible definitions');
  const definitionInserts = rows.length === 0 ? missingCodes.length : 0;
  const membershipInserts = rows.length === 0 ? expectedMemberships().length : 0;
  const planDeviation = rows.length === 0 && definitionInserts !== DATA.NEW_DEFINITIONS.length
    ? `Expected clean H1 baseline to insert 4 new definitions and 20 memberships; compatible allowlisted definitions already exist, so actual plan is ${definitionInserts} definition(s) + ${membershipInserts} membership(s). Apply is blocked until reviewed.`
    : null;
  return {
    stage: 'H1', mode: 'dry-run', status: exact ? 'EXISTING_OK' : planDeviation ? 'PLAN_DEVIATION' : 'READY', planDeviation, structure: { id: 16, externalCode: 'SUB-000015', name: 'Клей для Плитки', normalizedName: 'клей для плитки', parentId: 1, parentName: 'Смеси' },
    schemaVersion: 11, currentMemberships: rows.length, expectedMemberships: 20,
    definitionsToCreate: rows.length === 0 ? missingCodes : [], definitionInserts, membershipInserts,
    writes: definitionInserts + membershipInserts, mainOrder: DATA.TEMPLATE.mainCodes, regularOrder: DATA.TEMPLATE.regularCodes,
    existingDefinitions: DATA.EXISTING_DEFINITIONS.length, newDefinitionsCompatible: DATA.NEW_DEFINITIONS.length - missingCodes.length
  };
}
async function readTable(db, name) { return db.all(`SELECT * FROM ${name} ORDER BY id`); }
async function snapshots(db) { const out = {}; for (const name of TABLES) out[name] = await readTable(db, name); return out; }
function assertSame(label, a, b) { if (stable(a) !== stable(b)) throw new Error(`${label} snapshot changed`); }
async function backupDatabase(db, dbPath, backupDir, prefix) {
  if (!backupDir) throw new Error('Apply requires --backup-dir');
  const dir = path.resolve(backupDir); await fs.promises.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${prefix}-${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomBytes(6).toString('hex')}.db`);
  const fd = fs.openSync(target, 'wx'); fs.closeSync(fd);
  try {
    await db.backup(target); const stat = await fs.promises.stat(target);
    if (stat.size < 1024) throw new Error('Verified backup is unexpectedly small');
    const check = await dbOpen(target, false);
    try { await assertSchema(check); await integrity(check); } finally { await check.close(); }
    const sha256 = await new Promise((resolve, reject) => { const h = crypto.createHash('sha256'); fs.createReadStream(target).on('data',chunk=>h.update(chunk)).on('error',reject).on('end',()=>resolve(h.digest('hex'))); });
    return { path: target, source: path.resolve(dbPath), size: stat.size, sha256, schemaVersion: 11, integrity: 'ok', foreignKeyViolations: 0, verified: true };
  } catch (error) { throw new Error(`Backup verification failed at ${target}: ${error.message}`); }
}
async function applyTemplate(db, dbPath, backupDir) {
  const before = await snapshots(db); const initial = await inspectTemplate(db);
  if (initial.status === 'EXISTING_OK') return { ...initial, mode: 'apply', writes: 0, backup: null };
  if (initial.writes !== 24 || initial.definitionInserts !== 4 || initial.membershipInserts !== 20) throw new Error(`H1 baseline write plan mismatch; expected 24 (4 definitions + 20 memberships), got ${initial.writes}`);
  const backup = await backupDatabase(db, dbPath, backupDir, 'tile-adhesive-h1');
  await db.run('BEGIN IMMEDIATE'); let writes = 0;
  try {
    const locked = await inspectTemplate(db);
    if (stable(locked) !== stable(initial)) throw new Error('H1 state changed after backup/preflight');
    const now = new Date().toISOString();
    for (const def of DATA.NEW_DEFINITIONS) {
      const exists = await db.get('SELECT * FROM product_attribute_definitions WHERE code=?', [def.code]);
      if (exists) throw new Error(`H1 guarded definition insert found existing code ${def.code}`);
      const ins = await db.run(`INSERT INTO product_attribute_definitions
        (code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?)`, [def.code,def.label,def.dataType,def.defaultUnit,def.defaultSection || 'Характеристики',100,1,now,now]);
      if (ins.changes !== 1) throw new Error(`H1 definition insert count mismatch ${def.code}`); writes += 1;
    }
    const defs = await db.all('SELECT id,code FROM product_attribute_definitions'); const ids = new Map(defs.map(x=>[x.code,x.id]));
    for (const item of expectedMemberships()) {
      const definitionId = ids.get(item.code); if (!definitionId) throw new Error(`H1 missing definition for membership ${item.code}`);
      const ins = await db.run(`INSERT INTO product_attribute_templates
        (structure_id,attribute_definition_id,section,sort_order,is_required,unit_override,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?)`, [16,definitionId,item.section,item.sortOrder,0,null,now,now]);
      if (ins.changes !== 1) throw new Error(`H1 membership insert count mismatch ${item.code}`); writes += 1;
    }
    if (writes !== 24) throw new Error(`H1 write count mismatch ${writes}/24`);
    const after = await snapshots(db);
    assertSame('H1 products', before.products, after.products);
    assertSame('H1 product_attribute_values', before.product_attribute_values, after.product_attribute_values);
    assertSame('H1 product_images', before.product_images, after.product_images);
    assertSame('H1 existing definitions', before.product_attribute_definitions, after.product_attribute_definitions.filter(row=>!DATA.NEW_DEFINITIONS.some(d=>d.code===row.code)));
    assertSame('H1 other templates', before.product_attribute_templates.filter(row=>Number(row.structure_id)!==16), after.product_attribute_templates.filter(row=>Number(row.structure_id)!==16));
    const final = await inspectTemplate(db);
    if (final.status !== 'EXISTING_OK' || final.writes !== 0 || final.currentMemberships !== 20) throw new Error('H1 final ordered template verification failed');
    await integrity(db); await db.run('COMMIT'); return { ...final, mode: 'apply', writes, backup, expectedMemberships: 20 };
  } catch (error) { await db.run('ROLLBACK').catch(()=>{}); throw error; }
}
function decodeValue(row) { if (!row) return null; if (row.value_text !== null && row.value_text !== undefined) return row.value_text; if (row.value_number !== null && row.value_number !== undefined) return row.value_number; if (row.value_boolean !== null && row.value_boolean !== undefined) return Boolean(Number(row.value_boolean)); return null; }
function valueTuple(entry, def) {
  if (def.data_type === 'text' && typeof entry.value === 'string' && entry.value.trim()) return { value_text: entry.value, value_number: null, value_boolean: null, unit_override: def.default_unit ?? null };
  if (def.data_type === 'number' && typeof entry.value === 'number' && Number.isFinite(entry.value)) return { value_text: null, value_number: entry.value, value_boolean: null, unit_override: def.default_unit ?? null };
  if (def.data_type === 'boolean' && typeof entry.value === 'boolean') return { value_text: null, value_number: null, value_boolean: entry.value ? 1 : 0, unit_override: def.default_unit ?? null };
  throw new Error(`VALUE_TYPE_BLOCKED ${entry.code || ''}: expected ${def.data_type}, got ${typeof entry.value}`);
}
function tupleFromRow(row) { return { value_text: row.value_text ?? null, value_number: row.value_number ?? null, value_boolean: row.value_boolean ?? null, unit_override: row.unit_override ?? null }; }
function tupleMatches(row, tuple) { return stable(tupleFromRow(row)) === stable(tuple); }
function checkIdentity(product, config) {
  if (Number(product.is_active) !== 1 || product.deleted_at) throw new Error(`IDENTITY_BLOCKED inactive/deleted ${config.externalId}`);
  if (product.title !== config.expectedTitle) throw new Error(`TITLE_GUARD_BLOCKED ${config.externalId}: exact title mismatch`);
  if (product.category !== config.expectedCategory || product.subcategory !== config.expectedSubcategory) throw new Error(`CATEGORY_GUARD_BLOCKED ${config.externalId}`);
  if (Number(product.weight) !== Number(config.expectedWeight) || product.unit !== config.expectedUnit) throw new Error(`PACKAGE_GUARD_BLOCKED ${config.externalId}: expected ${config.expectedWeight} operational weight/${config.expectedUnit}, got ${product.weight}/${product.unit}`);
}
function sourceCounts(product) { const counts = { READY:0, NEEDS_SOURCE:0, NEEDS_MAPPING:0, SOURCE_CONFLICT:0, NOT_AVAILABLE:0 }; for (const c of DATA.ALL_CODES) { const status = product.core[c]?.status; if (!STATUS_SET.has(status)) throw new Error(`DATA_STATUS_BLOCKED ${product.externalId}/${c}: ${status}`); counts[status] += 1; } return counts; }
async function inspectCore(db, only = DATA.ALL_MATS) {
  validateData(); only = assertDryRunOnly(only); await assertSchema(db); await structureGuard(db); const template = await inspectTemplate(db);
  if (template.status !== 'EXISTING_OK') throw new Error('H2 BLOCKED: exact final H1 template must be applied first');
  const definitionState = await loadDefinitionState(db); const products = await db.all('SELECT * FROM products ORDER BY id');
  const rows = [];
  for (const config of DATA.PRODUCTS.filter(product => only.includes(product.externalId))) {
    const matches = products.filter(p=>p.external_id===config.externalId);
    if (matches.length !== 1) throw new Error(`IDENTITY_BLOCKED ${config.externalId}: expected one product, found ${matches.length}`);
    const product = matches[0]; checkIdentity(product,config);
    const values = await db.all(`SELECT v.*,d.code,d.data_type,d.default_unit FROM product_attribute_values v
      JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=? ORDER BY v.id`,[product.id]);
    const byCode = new Map(); for (const value of values) { if (byCode.has(value.code)) throw new Error(`VALUE_CONFLICT duplicate ${config.externalId}/${value.code}`); byCode.set(value.code,value); }
    const partial = config.identityStatus === 'PARTIAL'; const slots=[]; let valueConflicts=0, schemaBlocks=0;
    for (const code of DATA.ALL_CODES) {
      const proposal = config.core[code]; if (!proposal) throw new Error(`DATA_BLOCKED missing ${config.externalId}/${code}`);
      const current = byCode.get(code); const def = definitionState.byCode.get(code);
      const item = { code, sourceStatus:proposal.status, status:proposal.status, value:proposal.value ?? null, sources:proposal.sources, reason:proposal.reason ?? null, currentValue:decodeValue(current), action:'NOT_WRITTEN' };
      if (proposal.status === 'READY') {
        if (!definitionCompatible(def,{code,dataType:proposal.dataType,unit:proposal.unit})) { item.status='SCHEMA_BLOCKED'; item.reason=`Definition incompatible with reviewed ${proposal.dataType}/${proposal.unit??'null'}`; schemaBlocks++; }
        else {
          const tuple=valueTuple({ ...proposal,code },def);
          if (current && !tupleMatches(current,tuple)) { item.status='VALUE_CONFLICT'; item.reason='Existing value differs from exact READY source value; overwrite is forbidden.'; valueConflicts++; }
          else if (partial) item.action='SKIPPED_IDENTITY_PARTIAL';
          else if (current) { item.status='EXISTING_OK'; item.action='EXISTING_OK'; }
          else { item.status='WILL_ADD'; item.action='WILL_ADD'; item.writeTuple=tuple; item.definitionId=def.id; }
        }
      } else if (partial) item.action='SKIPPED_IDENTITY_PARTIAL';
      else if (current) { item.status='VALUE_CONFLICT'; item.reason=`Existing value occupies unresolved ${proposal.status} slot; no overwrite/removal is allowed.`; valueConflicts++; }
      slots.push(item);
    }
    const extras=partial?[]:values.filter(v=>!DATA.ALL_CODES.includes(v.code));
    if (extras.length) { valueConflicts+=extras.length; }
    const rawBrand = product.brand;
    const brandColumnAction = partial ? 'SKIPPED_IDENTITY_PARTIAL' : !clean(rawBrand) ? 'WILL_UPDATE' : norm(rawBrand)===norm(config.expectedBrand) ? 'EXISTING_OK' : 'BRAND_CONFLICT';
    const brandAttribute = slots.find(x=>x.code==='brand');
    const brandConflict = brandColumnAction==='BRAND_CONFLICT' || brandAttribute?.status==='VALUE_CONFLICT';
    const readyFacts=slots.filter(x=>x.sourceStatus==='READY').length;
    const attrWillAdd=slots.filter(x=>x.action==='WILL_ADD').length;
    const existingOk=slots.filter(x=>x.action==='EXISTING_OK').length;
    const blocking=Boolean(valueConflicts||schemaBlocks||brandConflict);
    const counts=sourceCounts(config);
    rows.push({externalId:config.externalId,identityStatus:config.identityStatus,title:product.title,brand:rawBrand,expectedBrand:config.expectedBrand,brandColumnAction,readyFacts,readyRegularFacts:DATA.TEMPLATE.regularCodes.filter(c=>config.core[c].status==='READY').length,attributeWrites:partial?0:attrWillAdd,existingOk:partial?0:existingOk,unresolved:{needsSource:counts.NEEDS_SOURCE,needsMapping:counts.NEEDS_MAPPING,sourceConflict:counts.SOURCE_CONFLICT,notAvailable:counts.NOT_AVAILABLE},status:blocking?'BLOCKED':partial?'SKIPPED_IDENTITY_PARTIAL':attrWillAdd||brandColumnAction==='WILL_UPDATE'?'READY':'EXISTING_OK',blocked:valueConflicts+schemaBlocks+(brandConflict?1:0),valueConflicts,schemaBlocks,slots,partialSnapshotRequired:partial,partialAttributeRows:partial?values.length:undefined,unexpectedCodes:extras.map(x=>x.code)});
  }
  const confirmed=rows.filter(r=>r.identityStatus==='IDENTITY_CONFIRMED');
  const sum={total:rows.length,logicalSlots:rows.length*DATA.ALL_CODES.length,readyFacts:rows.reduce((n,r)=>n+r.readyFacts,0),readyRegularFacts:rows.reduce((n,r)=>n+r.readyRegularFacts,0),eligibleReadyFacts:confirmed.reduce((n,r)=>n+r.readyFacts,0),willAdd:confirmed.reduce((n,r)=>n+r.attributeWrites,0),existingOk:confirmed.reduce((n,r)=>n+r.existingOk,0),plannedBrandUpdates:confirmed.filter(r=>r.brandColumnAction==='WILL_UPDATE').length,needsSource:rows.reduce((n,r)=>n+r.unresolved.needsSource,0),needsMapping:rows.reduce((n,r)=>n+r.unresolved.needsMapping,0),sourceConflict:rows.reduce((n,r)=>n+r.unresolved.sourceConflict,0),notAvailable:rows.reduce((n,r)=>n+r.unresolved.notAvailable,0),schemaBlocked:rows.reduce((n,r)=>n+r.schemaBlocks,0),valueConflict:rows.reduce((n,r)=>n+r.valueConflicts,0),brandConflict:rows.filter(r=>r.brandColumnAction==='BRAND_CONFLICT').length,blockedProducts:rows.filter(r=>r.status==='BLOCKED').length,identityPartialProducts:rows.filter(r=>r.identityStatus==='PARTIAL').length,errors:0,definitionsToCreate:0,templateMembershipChanges:0};
  return {stage:'H2',mode:'dry-run',scope:[...only],rows,summary:sum,writableSurface:{products:['brand'],product_attribute_values:DATA.ALL_CODES,forbidden:['title','slug','weight','unit','category','subcategory','price','stock','images','descriptions','SEO','definitions','templates']}};
}
async function snapshotProductsForId(db,id){const rows=await db.all('SELECT * FROM products WHERE external_id=? ORDER BY id',[id]);const attr=rows.length?await db.all('SELECT * FROM product_attribute_values WHERE product_id=? ORDER BY id',[rows[0].id]):[];const images=rows.length?await db.all('SELECT * FROM product_images WHERE product_id=? ORDER BY id',[rows[0].id]):[];return {products:rows,values:attr,images};}
async function compareCoreSnapshots(before,after,plan) {
  const targetSet=new Set(DATA.ALL_MATS);const configById=new Map(DATA.PRODUCTS.map(x=>[x.externalId,x]));
  assertSame('H2 product row count',before.products.map(x=>Number(x.id)).sort((a,b)=>a-b),after.products.map(x=>Number(x.id)).sort((a,b)=>a-b));
  const beforeProducts=new Map(before.products.map(x=>[x.external_id,x]));const afterProducts=new Map(after.products.map(x=>[x.external_id,x]));
  for(const [id,a] of beforeProducts){const b=afterProducts.get(id);if(!b)throw new Error(`POSTCHECK product removed ${id}`);if(!targetSet.has(id)){assertSame(`H2 non-target product ${id}`,a,b);continue;}const cfg=configById.get(id);if(cfg.identityStatus==='PARTIAL'){assertSame(`MAT-000133 immutable product`,a,b);continue;}const expected={...a};if(plan.rows.find(x=>x.externalId===id).brandColumnAction==='WILL_UPDATE')expected.brand=cfg.expectedBrand;assertSame(`H2 immutable product fields ${id}`,expected,b);}
  assertSame('H2 product_attribute_definitions',before.product_attribute_definitions,after.product_attribute_definitions);assertSame('H2 product_attribute_templates',before.product_attribute_templates,after.product_attribute_templates);assertSame('H2 product_images',before.product_images,after.product_images);
  const targetIds=new Set([...beforeProducts.values()].filter(x=>targetSet.has(x.external_id)).map(x=>Number(x.id)));
  const beforeMap=new Map(before.product_attribute_values.map(v=>[Number(v.id),v]));const afterMap=new Map(after.product_attribute_values.map(v=>[Number(v.id),v]));
  for(const [id,row] of beforeMap){const next=afterMap.get(id);if(!next)throw new Error(`H2 removed existing product_attribute_values row ${id}`);assertSame(`H2 existing attribute row ${id}`,row,next);if(!targetIds.has(Number(row.product_id)))assertSame(`H2 non-target attribute row ${id}`,row,next);}
  const additions=after.product_attribute_values.filter(v=>!beforeMap.has(Number(v.id)));const expectedAdds=[];
  for(const row of plan.rows.filter(x=>x.identityStatus==='IDENTITY_CONFIRMED'))for(const slot of row.slots)if(slot.action==='WILL_ADD')expectedAdds.push({externalId:row.externalId,productId:Number(beforeProducts.get(row.externalId).id),code:slot.code,definitionId:Number(slot.definitionId),tuple:slot.writeTuple,sortOrder:DATA.ALL_CODES.indexOf(slot.code)});
  if(additions.length!==expectedAdds.length)throw new Error(`H2 unexpected attribute insert count ${additions.length}/${expectedAdds.length}`);
  for(const exp of expectedAdds){const matches=additions.filter(v=>Number(v.product_id)===exp.productId&&Number(v.attribute_definition_id)===exp.definitionId&&tupleMatches(v,exp.tuple)&&Number(v.sort_order)===exp.sortOrder);if(matches.length!==1)throw new Error(`H2 inserted READY value mismatch ${exp.externalId}/${exp.code}`);}
  const partial=DATA.PRODUCTS.find(p=>p.identityStatus==='PARTIAL');if(partial){const pb=beforeProducts.get(partial.externalId),pa=afterProducts.get(partial.externalId);assertSame(`${partial.externalId} products row`,pb,pa);const partialValuesBefore=before.product_attribute_values.filter(v=>Number(v.product_id)===Number(pb.id));const partialValuesAfter=after.product_attribute_values.filter(v=>Number(v.product_id)===Number(pb.id));assertSame(`${partial.externalId} product_attribute_values`,partialValuesBefore,partialValuesAfter);const partialImagesBefore=before.product_images.filter(v=>Number(v.product_id)===Number(pb.id));const partialImagesAfter=after.product_images.filter(v=>Number(v.product_id)===Number(pb.id));assertSame(`${partial.externalId} product_images`,partialImagesBefore,partialImagesAfter);}
}
async function applyCore(db,dbPath,backupDir,only=DATA.ALL_MATS){
  assertExactOnly(only);const before=await snapshots(db);const pre=await inspectCore(db,only);if(pre.summary.blockedProducts||pre.summary.errors)throw new Error('H2 preflight blocked; no writes performed');if(pre.summary.willAdd===0&&pre.summary.plannedBrandUpdates===0)return {...pre,mode:'apply',writes:0,backup:null};
  const backup=await backupDatabase(db,dbPath,backupDir,'tile-adhesive-h2');await db.run('BEGIN IMMEDIATE');let writes=0;
  try{const locked=await inspectCore(db,only);if(stable(locked)!==stable(pre))throw new Error('H2 database changed after backup/preflight');const now=new Date().toISOString();
    for(const row of pre.rows){if(row.identityStatus!=='IDENTITY_CONFIRMED')continue;const product=before.products.find(p=>p.external_id===row.externalId);if(row.brandColumnAction==='WILL_UPDATE'){const result=await db.run(`UPDATE products SET brand=? WHERE id=? AND external_id=? AND (brand IS NULL OR TRIM(brand)='')`,[row.expectedBrand,product.id,row.externalId]);if(result.changes!==1)throw new Error(`H2 guarded brand update failed ${row.externalId}`);writes++;}
      for(const slot of row.slots.filter(x=>x.action==='WILL_ADD')){const t=slot.writeTuple;const result=await db.run(`INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`,[product.id,slot.definitionId,t.value_text,t.value_number,t.value_boolean,t.unit_override,DATA.ALL_CODES.indexOf(slot.code),now,now]);if(result.changes!==1)throw new Error(`H2 insert count mismatch ${row.externalId}/${slot.code}`);writes++;}}
    const after=await snapshots(db);await compareCoreSnapshots(before,after,pre);const post=await inspectCore(db,only);if(post.summary.blockedProducts||post.summary.errors||post.summary.willAdd!==0||post.summary.plannedBrandUpdates!==0)throw new Error('H2 post-apply/idempotency validation failed');await integrity(db);await db.run('COMMIT');return {...post,mode:'apply',writes,backup};
  }catch(error){await db.run('ROLLBACK').catch(()=>{});throw error;}
}
async function run(stage,args=process.argv.slice(2)) {const opts=parseArgs(args,stage);const db=await dbOpen(opts.db,opts.apply);try{const result=stage==='template'?(opts.apply?await applyTemplate(db,opts.db,opts.backupDir):await inspectTemplate(db)):(opts.apply?await applyCore(db,opts.db,opts.backupDir,opts.only):await inspectCore(db,opts.only));console.log(JSON.stringify(result,null,2));return result;}finally{await db.close();}}
module.exports={DATA,assertExactOnly,assertIdentityStatusContract,parseArgs,validateData,dbOpen,assertSchema,integrity,structureGuard,loadDefinitionState,expectedMemberships,inspectTemplate,applyTemplate,inspectCore,applyCore,backupDatabase,snapshots,compareCoreSnapshots,run,valueTuple,STATUS_SET};
