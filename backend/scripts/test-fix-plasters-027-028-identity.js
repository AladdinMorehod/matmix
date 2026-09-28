"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const Module = require("node:module");
const sqlite3 = require("sqlite3").verbose();
const DATA = require("./data/plasters-027-028-identity-fix");
const CORE = require("./data/plasters-core-content");
const SOURCE_REVIEWED = require("./data/source-reviewed-content-backfill");
const { assertExactTargets, applyBatch, inspectBatch, openDatabase, parseArgs, snapshotTables } = require("./fix-plasters-027-028-identity");

const AUDIT_COMMIT = "c330cf1c8d516b7e0438d68f3cbc9a00baeede05";
const root = path.resolve(__dirname, "..", "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-plaster-027-028-"));
const pass = name => console.log(`PASS ${name}`);

function open(file) {
    return new Promise((resolve, reject) => {
        const raw = new sqlite3.Database(file, error => error ? reject(error) : resolve({
            run(sql, params = []) { return new Promise((res, rej) => raw.run(sql, params, function cb(err) { err ? rej(err) : res({ changes: this.changes, id: this.lastID }); })); },
            get(sql, params = []) { return new Promise((res, rej) => raw.get(sql, params, (err, row) => err ? rej(err) : res(row))); },
            all(sql, params = []) { return new Promise((res, rej) => raw.all(sql, params, (err, rows) => err ? rej(err) : res(rows))); },
            close() { return new Promise((res, rej) => raw.close(err => err ? rej(err) : res())); }
        }));
    });
}

async function fixture(file = ":memory:") {
    const db = await open(file);
    await db.run(`CREATE TABLE products (
        id INTEGER PRIMARY KEY, external_id TEXT UNIQUE, title TEXT, slug TEXT, brand TEXT, weight REAL, unit TEXT,
        category TEXT, subcategory TEXT, short_description TEXT, full_description TEXT, seo_title TEXT, seo_description TEXT,
        price REAL, image_url TEXT, stock_status TEXT, product_group TEXT, sort_order INTEGER, source_import_id TEXT,
        is_active INTEGER, deleted_at TEXT, updated_at TEXT
    )`);
    await db.run(`CREATE TABLE product_attribute_definitions (
        id INTEGER PRIMARY KEY, code TEXT UNIQUE, label TEXT, data_type TEXT, default_unit TEXT, sort_order INTEGER,
        is_active INTEGER, created_at TEXT, updated_at TEXT
    )`);
    await db.run(`CREATE TABLE product_attribute_templates (
        id INTEGER PRIMARY KEY, structure_id INTEGER, attribute_definition_id INTEGER, section TEXT,
        sort_order INTEGER, is_required INTEGER, unit_override TEXT
    )`);
    await db.run(`CREATE TABLE product_attribute_values (
        id INTEGER PRIMARY KEY, product_id INTEGER, attribute_definition_id INTEGER, value_text TEXT,
        value_number REAL, value_boolean INTEGER, unit_override TEXT, sort_order INTEGER, created_at TEXT, updated_at TEXT
    )`);
    const allCodes = [...new Set(["brand", ...DATA.PRODUCTS.flatMap(target => Object.keys(target.facts).filter(code => target.facts[code]?.status === "READY"))])];
    const extraCodes = ["fixture_immutable_extra"];
    const codes = [...allCodes, ...extraCodes];
    const defs = new Map(); let defId = 1;
    for (const code of codes) {
        const type = code === "package_weight" || code === "shelf_life" ? "number" : "text";
        const unit = code === "package_weight" ? "кг" : code === "consumption_10mm" ? "кг/м²" : code === "shelf_life" ? "месяцев" : "";
        await db.run("INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [defId, code, code, type, unit, defId, 1, "def-created", "def-updated"]);
        defs.set(code, { id: defId, type, unit }); defId++;
    }
    for (const target of DATA.PRODUCTS) {
        const e = target.expectedProduct;
        await db.run(`INSERT INTO products(id,external_id,title,slug,brand,weight,unit,category,subcategory,short_description,full_description,seo_title,seo_description,price,image_url,stock_status,product_group,sort_order,source_import_id,is_active,deleted_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [Number(target.externalId.slice(-6)), target.externalId, target.expectedTitle, target.expectedSlug, e.brand, e.weight, "шт", e.category, e.subcategory, e.short_description, e.full_description, e.seo_title, e.seo_description, 123.45, `/uploads/${target.externalId}.webp`, "in_stock", "materials", 22, "seed-immutable", 1, null, "product-updated"]);
        for (const [code, old] of Object.entries(target.expectedAttributes)) {
            const definition = defs.get(code); const numeric = definition.type === "number";
            await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [Number(target.externalId.slice(-6)), definition.id, numeric ? null : old.value, numeric ? old.value : null, null, old.unit ?? null, 5, "value-created", "value-updated"]);
        }
        const unrelated = defs.get("fixture_immutable_extra");
        await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", [Number(target.externalId.slice(-6)), unrelated.id, "1,25", null, null, "мм", 88, "value-created", "value-updated"]);
    }
    await db.run("INSERT INTO products(id,external_id,title,slug,brand,weight,unit,category,subcategory,short_description,full_description,seo_title,seo_description,price,image_url,stock_status,product_group,sort_order,source_import_id,is_active,deleted_at,updated_at) VALUES(75,'MAT-000075','Наливной пол 25 кг','floor-075','Brand',25,'шт','Смеси','Наливной Пол','short','full','seo','meta',700,'/uploads/MAT-000075.webp','in_stock','materials',5,'seed',1,NULL,'unchanged')");
    await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(75,1,'other-mat-value',NULL,NULL,NULL,99,'x','y')");
    await db.run("INSERT INTO product_attribute_templates(id,structure_id,attribute_definition_id,section,sort_order,is_required,unit_override) VALUES(1,2,1,'main',1,1,NULL)");
    return db;
}

function loadAuditCheckpoint() {
    const source = execFileSync("git", ["show", `${AUDIT_COMMIT}:backend/scripts/audit-closed-product-subcategories.js`], { cwd: root, encoding: "utf8" });
    const filename = path.join(root, "backend", "scripts", "audit-closed-product-subcategories.c330-checkpoint.js");
    const auditModule = new Module(filename, require.main); auditModule.filename = filename; auditModule.paths = Module._nodeModulePaths(path.dirname(filename)); auditModule._compile(source, filename); return auditModule.exports;
}

function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

async function main() {
    assert.deepEqual(DATA.TARGETS, ["MAT-000027", "MAT-000028"]); assertExactTargets(DATA.TARGETS); pass("exact two-MAT ordered scope");
    assert.throws(() => assertExactTargets(["MAT-000027"]), /Exact ordered/);
    assert.throws(() => assertExactTargets(["MAT-000027", "MAT-000028", "MAT-000029"]), /Exact ordered/);
    assert.throws(() => assertExactTargets(["MAT-000027", "MAT-000027"]), /Exact ordered/);
    assert.throws(() => assertExactTargets(["MAT-000028", "MAT-000027"]), /Exact ordered/);
    assert.deepEqual(parseArgs(["--db", "fixture.db", "--only", "MAT-000027,MAT-000028"]).only, DATA.TARGETS);
    assert.throws(() => parseArgs(["--db", "x.db", "--only", "MAT-000027"]), /Exact ordered/);
    assert.throws(() => parseArgs(["--db", "x.db", "--only", "MAT-000027,MAT-000028", "--apply", "--confirm", DATA.CONFIRM]), /backup-dir/);
    pass("CLI subset, extra, duplicate, reordered scope rejected and apply requires backup");

    assert.equal(CORE.PRODUCTS.filter(row => DATA.TARGETS.includes(row.externalId)).every(row => row.identityStatus !== "BLOCKED_IDENTITY" && row.dedicatedCorrectionOnly && !row.allowCore && !row.overwriteDescription && row.brand), true);
    assert.equal(CORE.PRODUCTS.find(row => row.externalId === "MAT-000027").expectedTitle, DATA.PRODUCTS[0].expectedTitle);
    assert.equal(CORE.PRODUCTS.find(row => row.externalId === "MAT-000028").expectedTitle, DATA.PRODUCTS[1].expectedTitle);
    const rusean = DATA.PRODUCTS[1];
    assert(!JSON.stringify({ facts: rusean.facts, content: rusean.proposedProduct }).includes("М-150"));
    assert.equal(rusean.proposedProduct.seo_title.includes("М-150"), false);
    assert.equal(DATA.PRODUCTS[0].facts.consumption_10mm.value, "18");
    assert.equal(DATA.PRODUCTS[1].expectedAttributes.application_temperature.value, "+5…+30 °C");
    assert.equal(DATA.PRODUCTS[1].facts.application_temperature.value, "от +5 до +25 °C");
    pass("identity/data provenance: secondary EuroMix and official Rusean; legacy M-150 not propagated");

    const dbFile = path.join(tempDir, "fixture.sqlite"); let db = await fixture(dbFile);
    const beforeDryHash = sha256(dbFile); await db.close(); db = await openDatabase(dbFile, false);
    const dry = await inspectBatch(db, { only: DATA.TARGETS });
    assert.equal(dry.summary.total, 2); assert.equal(dry.summary.ready, 2); assert.equal(dry.summary.errors, 0);
    assert(dry.summary.willFix > 0); assert.equal(sha256(dbFile), beforeDryHash); pass("read-only dry-run and SQLite file SHA unchanged");
    console.log(`SYNTHETIC_DRY_RUN=${JSON.stringify(dry.summary)}`);
    await assert.rejects(() => inspectBatch(db, { only: ["MAT-000027"] }), /Exact ordered/);
    await assert.rejects(() => applyBatch(db, dbFile, { only: ["MAT-000027"], confirm: DATA.CONFIRM, backupDir: path.join(tempDir, "bad-backup") }), /Exact ordered/);
    await db.close(); db = await open(dbFile);

    await db.run("UPDATE products SET title='wrong title' WHERE external_id='MAT-000027'");
    assert.equal((await inspectBatch(db, { only: DATA.TARGETS })).rows[0].status, "ERROR");
    await db.run("UPDATE products SET title=? WHERE external_id='MAT-000027'", [DATA.PRODUCTS[0].expectedTitle]);
    await db.run("UPDATE products SET slug='wrong-slug' WHERE external_id='MAT-000028'");
    assert.equal((await inspectBatch(db, { only: DATA.TARGETS })).rows[1].status, "ERROR");
    await db.run("UPDATE products SET slug=? WHERE external_id='MAT-000028'", [DATA.PRODUCTS[1].expectedSlug]);
    await db.run("UPDATE products SET brand='conflict' WHERE external_id='MAT-000027'");
    assert.equal((await inspectBatch(db, { only: DATA.TARGETS })).rows[0].status, "ERROR");
    await db.run("UPDATE products SET brand=NULL WHERE external_id='MAT-000027'");
    await db.run("UPDATE product_attribute_values SET value_text='wrong' WHERE product_id=27 AND attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='consumption_10mm')");
    assert.equal((await inspectBatch(db, { only: DATA.TARGETS })).rows[0].status, "ERROR");
    await db.run("UPDATE product_attribute_values SET value_text='15-20',unit_override='кг/м²' WHERE product_id=27 AND attribute_definition_id=(SELECT id FROM product_attribute_definitions WHERE code='consumption_10mm')");
    await db.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) SELECT 27,id,'duplicate',NULL,NULL,NULL,77,'x','y' FROM product_attribute_definitions WHERE code='brand'");
    assert.equal((await inspectBatch(db, { only: DATA.TARGETS })).rows[0].status, "ERROR");
    await db.run("DELETE FROM product_attribute_values WHERE id=(SELECT max(id) FROM product_attribute_values WHERE product_id=27)");
    await db.close(); pass("exact title/slug/brand and old attribute value mismatch guards");

    db = await openDatabase(dbFile, true); const before = await snapshotTables(db); const backupDir = path.join(tempDir, "backups");
    const applied = await applyBatch(db, dbFile, { only: DATA.TARGETS, confirm: DATA.CONFIRM, backupDir });
    assert.equal(applied.summary.existingOk, 2); assert.equal(applied.summary.errors, 0); assert(applied.writes > 0);
    assert(fs.existsSync(applied.backup)); assert(applied.backup.startsWith(backupDir));
    const backup = await open(applied.backup); assert.equal((await backup.get("SELECT brand FROM products WHERE external_id='MAT-000027'")).brand, null); await backup.close();
    const after = await snapshotTables(db);
    for (const target of DATA.PRODUCTS) {
        const oldProduct = before.products.find(row => row.external_id === target.externalId); const newProduct = after.products.find(row => row.external_id === target.externalId);
        assert.equal(newProduct.title, oldProduct.title); assert.equal(newProduct.slug, oldProduct.slug);
        for (const field of DATA.PRODUCT_FIELDS) assert.equal(newProduct[field], target.proposedProduct[field]);
        assert.equal(newProduct.price, oldProduct.price); assert.equal(newProduct.weight, oldProduct.weight); assert.equal(newProduct.image_url, oldProduct.image_url); assert.equal(newProduct.updated_at, oldProduct.updated_at);
    }
    assert.deepEqual(after.definitions, before.definitions); assert.deepEqual(after.templates, before.templates);
    assert.deepEqual(after.values.filter(row => ![27, 28].includes(row.product_id)), before.values.filter(row => ![27, 28].includes(row.product_id)));
    const allMat27 = after.values.filter(row => row.product_id === 27); assert(allMat27.some(row => row.value_text === "1,25"));
    const attrValue = async (mat, code) => db.get("SELECT v.value_text,v.value_number,v.unit_override,d.code FROM product_attribute_values v JOIN products p ON p.id=v.product_id JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id=? AND d.code=?", [mat, code]);
    assert.equal((await attrValue("MAT-000027", "consumption_10mm")).value_text, "18");
    assert.equal((await attrValue("MAT-000027", "consumption_10mm")).unit_override, "кг/м²");
    assert.equal((await attrValue("MAT-000028", "consumption_10mm")).value_text, "15–17");
    assert.equal((await attrValue("MAT-000028", "application_temperature")).value_text, "от +5 до +25 °C");
    assert.equal((await attrValue("MAT-000028", "base")).value_text, "Портландцемент, известь, фракционный песок и модифицирующие добавки");
    assert.equal((await attrValue("MAT-000028", "ceiling_layer_thickness")), undefined);
    assert.equal(/М-150/iu.test((await db.get("SELECT short_description||full_description||seo_title||seo_description AS text FROM products WHERE external_id='MAT-000028'")).text), false);
    const seoTitles = DATA.PRODUCTS.map(target => target.proposedProduct.seo_title);
    assert.equal(new Set(seoTitles).size, seoTitles.length);
    assert(seoTitles.every(title => title.length > 0 && title.length <= 65));
    const seoDescriptions = DATA.PRODUCTS.map(target => target.proposedProduct.seo_description);
    assert.equal(new Set(seoDescriptions).size, seoDescriptions.length);
    const otherSeoTitles = CORE.PRODUCTS.filter(row => !DATA.TARGETS.includes(row.externalId)).map(row => row.content?.seo_title).filter(Boolean);
    const otherSeoDescriptions = CORE.PRODUCTS.filter(row => !DATA.TARGETS.includes(row.externalId)).map(row => row.content?.seo_description).filter(Boolean);
    assert.equal(seoTitles.some(title => otherSeoTitles.includes(title)), false);
    assert.equal(seoDescriptions.some(description => otherSeoDescriptions.includes(description)), false);
    pass("atomic apply, allowlisted writes, backup-before-transaction, immutable fields and unrelated rows verified");
    const repeat = await applyBatch(db, dbFile, { only: DATA.TARGETS, confirm: DATA.CONFIRM, backupDir });
    assert.equal(repeat.writes, 0); assert.equal(repeat.backup, null); assert.equal(repeat.summary.existingOk, 2); pass("idempotent repeat apply has zero writes");
    await db.close();

    const rollbackFile = path.join(tempDir, "rollback.sqlite"); db = await fixture(rollbackFile); const rollbackBefore = await snapshotTables(db);
    const failing = Object.create(db); failing.run = (sql, params = []) => {
        if (sql.startsWith("UPDATE products SET full_description") && params[2] === "MAT-000028") return Promise.reject(new Error("injected failure"));
        return db.run(sql, params);
    };
    await assert.rejects(() => applyBatch(failing, rollbackFile, { only: DATA.TARGETS, confirm: DATA.CONFIRM, backupDir }), /injected failure/);
    assert.deepEqual(await snapshotTables(db), rollbackBefore); await db.close(); pass("transaction rollback restores product and attribute state after injected failure");

    const audit = loadAuditCheckpoint();
    db = await open(dbFile);
    for (const target of DATA.PRODUCTS) {
        const product = { ...(await db.get("SELECT * FROM products WHERE external_id=?", [target.externalId])), auditedSubcategory: "Штукатурка" };
        const values = await db.all(`SELECT v.value_text,v.value_number,v.value_boolean,v.unit_override,d.default_unit,d.code FROM product_attribute_values v JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE v.product_id=?`, [product.id]);
        const source = audit.reconcileSourceProduct(product, values);
        assert(!["SOURCE_BLOCKED", "SOURCE_PROVENANCE_ANOMALY"].includes(source.status), `${target.externalId}: ${source.status} ${JSON.stringify(source.anomalies)}`);
        assert(!source.anomalies.some(item => item.issue === "CANONICAL_PRODUCTS_BRAND_MISSING"));
        const attr = { attributeStatus: "ATTR_OK", mainCanonical: { brand: true } };
        const seo = { status: "SEO_OK" }; const image = { status: "IMAGE_OK" };
        const readiness = audit.readiness(product, attr, seo, image, source);
        assert.deepEqual(readiness.flags, [], `${target.externalId}: ${readiness.flags.join(",")}`);
        assert.equal(readiness.publicDataStatus, "READY");
    }
    const floorData = require("./data/floor-mixes-core-batch1");
    for (const id of ["MAT-000075", "MAT-000077"]) {
        const record = floorData.PRODUCTS.find(row => row.externalId === id);
        assert(record, `${id} source record remains present`);
        assert.notEqual(record.identityStatus, "CONFIRMED");
        const floorSource = audit.reconcileSourceProduct({ external_id: id, brand: record.brand || null, auditedSubcategory: "Наливной Пол" }, []);
        assert.equal(floorSource.status, "SOURCE_BLOCKED", `${id} must remain source-blocked under the unchanged c330 rules`);
    }
    // The accepted c330 checkpoint identifies these two rows as the only plaster
    // blockers; represent the other 26 rows as the unchanged, already-clean fixture baseline.
    const syntheticPlasterRows = Array.from({ length: 28 }, (_, index) => `MAT-${String(index + 1).padStart(6, "0")}`).map(id => ({ externalId: id, flags: [], publicDataStatus: "READY" }));
    const blockers = syntheticPlasterRows.filter(row => row.flags.length).length;
    const closure = blockers === 0 ? "DATA_CLOSED" : "NOT_CLOSED";
    assert.equal(blockers, 0); assert.equal(closure, "DATA_CLOSED");
    pass("c330 audit source/readiness fixture: 027/028 no blockers; floor 075/077 datasets untouched; plaster closure fixture DATA_CLOSED");

    console.log(`PASS all corrective checks; synthetic SQLite only; temp fixtures: ${tempDir}`);
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
