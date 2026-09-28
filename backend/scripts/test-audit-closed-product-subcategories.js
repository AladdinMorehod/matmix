"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const audit = require("./audit-closed-product-subcategories");

function open(file) { return new sqlite3.Database(file); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function close(db) { return new Promise(resolve => db.close(() => resolve())); }
function hash(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }

const now = "2026-09-28T00:00:00.000Z";

async function createFixture(file) {
    const db = open(file);
    try {
        await run(db, "PRAGMA foreign_keys=ON");
        await run(db, `CREATE TABLE catalog_structure (id INTEGER PRIMARY KEY,type TEXT,name TEXT,normalized_name TEXT,parent_id INTEGER,sort_order INTEGER,is_active INTEGER,created_at TEXT,updated_at TEXT,external_code TEXT,is_system INTEGER)`);
        await run(db, `CREATE TABLE products (id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,slug TEXT,category TEXT,subcategory TEXT,product_group TEXT,price REAL,weight REAL,unit TEXT,image TEXT,description TEXT,is_active INTEGER,sort_order INTEGER,source TEXT,last_imported_at TEXT,created_at TEXT,updated_at TEXT,deleted_at TEXT,deleted_by_id INTEGER,deleted_by_name TEXT,image_url TEXT,brand TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,stock_status TEXT)`);
        await run(db, `CREATE TABLE product_attribute_definitions (id INTEGER PRIMARY KEY,code TEXT UNIQUE,label TEXT,data_type TEXT,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER,created_at TEXT,updated_at TEXT)`);
        await run(db, `CREATE TABLE product_attribute_templates (id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,is_required INTEGER,unit_override TEXT,created_at TEXT,updated_at TEXT,UNIQUE(structure_id,attribute_definition_id))`);
        await run(db, `CREATE TABLE product_attribute_values (id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT,UNIQUE(product_id,attribute_definition_id))`);
        await run(db, `CREATE TABLE product_images (id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,alt_text TEXT,sort_order INTEGER,is_primary INTEGER,created_at TEXT,updated_at TEXT)`);
        await run(db, "PRAGMA user_version=11");
        await run(db, "INSERT INTO catalog_structure VALUES (1,'category','Смеси','смеси',NULL,0,1,?,?, 'CAT-000001',1)", [now, now]);
        const structures = audit.TEMPLATE_CODES;
        const ids = { "Штукатурка": 2, "Шпаклевка": 4, "Кладочные Смеси": 5, "Наливной Пол": 7, "Стяжки Пола": 8 };
        for (const [name, id] of Object.entries(ids)) await run(db, "INSERT INTO catalog_structure VALUES (?,?,?,?,?,?,?,?,?,?,?)", [id, "subcategory", name, name.toLowerCase(), 1, 0, 1, now, now, `SUB-${String(id).padStart(6, "0")}`, 0]);
        const allCodes = [...new Set([...audit.MAIN_CODES, ...Object.values(structures).flat()])];
        let definitionId = 1;
        for (const code of allCodes) {
            const main = audit.MAIN_CODES.includes(code);
            await run(db, "INSERT INTO product_attribute_definitions VALUES (?,?,?,?,?,?,?,?,?,?)", [definitionId, code, code, "text", code === "package_weight" ? "кг" : null, main ? "main" : "regular", definitionId, 1, now, now]);
            definitionId += 1;
        }
        const defRows = await new Promise((resolve, reject) => db.all("SELECT id,code FROM product_attribute_definitions", (e, rows) => e ? reject(e) : resolve(rows)));
        const defByCode = new Map(defRows.map(row => [row.code, row.id]));
        let templateId = 1;
        for (const [name, structureId] of Object.entries(ids)) {
            for (const [sortOrder, code] of audit.MAIN_CODES.entries()) await run(db, "INSERT INTO product_attribute_templates VALUES (?,?,?,?,?,?,?,?,?)", [templateId++, structureId, defByCode.get(code), "main", sortOrder, 0, null, now, now]);
            for (const [sortOrder, code] of structures[name].entries()) await run(db, "INSERT INTO product_attribute_templates VALUES (?,?,?,?,?,?,?,?,?)", [templateId++, structureId, defByCode.get(code), "regular", sortOrder, 0, null, now, now]);
        }
        let productId = 1;
        for (const [name, structureId] of Object.entries(ids)) {
            const externalId = name === "Кладочные Смеси" ? "MAT-000067" : `TEST-${structureId}`;
            await run(db, `INSERT INTO products (id,external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at,deleted_at,deleted_by_id,deleted_by_name,image_url,brand,short_description,full_description,seo_title,seo_description,stock_status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [productId, externalId, `Тест ${name}`, `test-${structureId}`, "Смеси", name, "Тест", 100, 20, "шт", null, "Описание", 1, 0, "test", now, now, now, null, null, null, "/uploads/products/test.webp", "Тестовый бренд", "Коротко", "Полное описание", `SEO ${name}`, `SEO desc ${name}`, "unknown"]);
            for (const [code, value] of [["brand", "Тестовый бренд"], ["product_type", "Товар"], ["shelf_life", "12 месяцев"], ["package_weight", "20 кг"]]) await run(db, "INSERT INTO product_attribute_values VALUES (?,?,?,?,?,?,?,?,?,?)", [productId * 100 + defByCode.get(code), productId, defByCode.get(code), value, null, null, code === "package_weight" ? "кг" : null, 0, now, now]);
            await run(db, "INSERT INTO product_images VALUES (?,?,?,?,?,?,?,?)", [productId, productId, "/uploads/products/test.webp", `Тест ${name}`, 0, 1, now, now]);
            productId += 1;
        }
    } finally { await close(db); }
}

(async () => {
    const source = fs.readFileSync(path.join(__dirname, "audit-closed-product-subcategories.js"), "utf8");
    assert(!/\b(?:INSERT|UPDATE|DELETE|REPLACE)\b/i.test(source), "audit runner must not contain mutation SQL keywords");
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Кладочные Смеси"], ["MAT-000067", "MAT-000068", "MAT-000069"]);
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Наливной Пол"], ["MAT-000075", "MAT-000076", "MAT-000077", "MAT-000078", "MAT-000079", "MAT-000080", "MAT-000081", "MAT-000082", "MAT-000083", "MAT-000084", "MAT-000085", "MAT-000086", "MAT-000087"]);
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Стяжки Пола"], ["MAT-000089", "MAT-000090"]);
    assert.throws(() => audit.parseArgs([]), /Explicit --db/);
    const parsed = audit.parseArgs(["--db", "fixture.db", "--uploads", "uploads", "--report-dir", "report"]);
    assert.deepStrictEqual(parsed, { db: "fixture.db", uploads: "uploads", reportDir: "report", writeReport: true });
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-closed-audit-")); const dbPath = path.join(root, "fixture.db");
    try {
        await createFixture(dbPath); const before = hash(dbPath); const report = await audit.auditDatabase({ db: dbPath, uploads: null }); const repeat = await audit.auditDatabase({ db: dbPath, uploads: null }); const after = hash(dbPath);
        assert.strictEqual(before, after, "read-only audit must not change DB bytes"); assert.strictEqual(report.readOnly, true); assert.strictEqual(report.schema.userVersion, 11); assert.strictEqual(report.schema.productionTemplateAuditAvailable, true); assert.strictEqual(report.templates.length, 5); assert(report.templates.every(row => row.status === "TEMPLATE_OK")); assert.strictEqual(report.products.length, 5); assert(report.products.every(row => row.publicDataStatus === "READY")); assert.strictEqual(report.mixSeo.rows.length, 18); assert.strictEqual(report.subcategoryConclusions.every(row => row.status === "CLOSED"), true);
        assert.deepStrictEqual(report, repeat, "same DB must produce deterministic report data");
        console.log("PASS read-only SQL/source guard"); console.log("PASS schema v11 template integrity fixture"); console.log("PASS scope, attributes, SEO, images and readiness fixture"); console.log("PASS DB hash unchanged"); console.log("PASS 4 test groups; synthetic SQLite only");
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
