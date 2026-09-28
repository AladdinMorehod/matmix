"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const audit = require("./audit-closed-product-subcategories");
const attributeOrder = require("../../public/js/attribute-order");

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
        const parent = audit.CANONICAL_TEMPLATE.parent;
        await run(db, "INSERT INTO catalog_structure VALUES (?,? ,?,'смеси',NULL,0,1,?,?, 'CAT-000001',1)", [parent.id, parent.type, parent.name, now, now]);
        const structures = audit.TEMPLATE_CODES;
        const ids = audit.TEMPLATE_STRUCTURE_IDS;
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
            for (const [sortOrder, code] of audit.MAIN_CODES.entries()) await run(db, "INSERT INTO product_attribute_templates VALUES (?,?,?,?,?,?,?,?,?)", [templateId++, structureId, defByCode.get(code), "main", sortOrder, code === "brand" ? 1 : 0, null, now, now]);
            for (const [sortOrder, code] of structures[name].entries()) await run(db, "INSERT INTO product_attribute_templates VALUES (?,?,?,?,?,?,?,?,?)", [templateId++, structureId, defByCode.get(code), "regular", sortOrder, 0, null, now, now]);
        }
        let productId = 1;
        for (const [name, structureId] of Object.entries(ids)) {
            const externalId = `TEST-${structureId}`;
            await run(db, `INSERT INTO products (id,external_id,title,slug,category,subcategory,product_group,price,weight,unit,image,description,is_active,sort_order,source,last_imported_at,created_at,updated_at,deleted_at,deleted_by_id,deleted_by_name,image_url,brand,short_description,full_description,seo_title,seo_description,stock_status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [productId, externalId, `Тест ${name}`, `test-${structureId}`, "Смеси", name, "Тест", 100, 20, "шт", null, "Описание", 1, 0, "test", now, now, now, null, null, null, "/uploads/products/test.webp", "Тестовый бренд", "Коротко", "Полное описание", `SEO ${name}`, `SEO desc ${name}`, "unknown"]);
            for (const [code, value] of [["brand", "Тестовый бренд"], ["product_type", "Товар"], ["shelf_life", "12 месяцев"], ["package_weight", "20 кг"]]) {
                if (productId === 1 && code === "brand") continue;
                await run(db, "INSERT INTO product_attribute_values VALUES (?,?,?,?,?,?,?,?,?,?)", [productId * 100 + defByCode.get(code), productId, defByCode.get(code), value, null, null, code === "package_weight" ? "кг" : null, 0, now, now]);
            }
            await run(db, "INSERT INTO product_images VALUES (?,?,?,?,?,?,?,?)", [productId, productId, "/uploads/products/test.webp", `Тест ${name}`, 0, 1, now, now]);
            productId += 1;
        }
    } finally { await close(db); }
}

(async () => {
    const source = fs.readFileSync(path.join(__dirname, "audit-closed-product-subcategories.js"), "utf8");
    assert(!/\b(?:INSERT\s+INTO\s+\w+|UPDATE\s+\w+\s+SET|DELETE\s+FROM\s+\w+|REPLACE\s+INTO\s+\w+)\b/i.test(source), "audit runner must not contain mutation SQL statements");
    assert.deepStrictEqual(audit.TEMPLATE_CODES, Object.fromEntries(audit.CANONICAL_TEMPLATE.categories.map(item => [item.name, item.codes])));
    assert.deepStrictEqual(audit.MAIN_CODES, audit.CANONICAL_TEMPLATE.mainAttributes);
    assert.deepStrictEqual(audit.TEMPLATE_STRUCTURE_IDS, Object.fromEntries(audit.CANONICAL_TEMPLATE.categories.map(item => [item.name, item.structureId])));
    assert.deepStrictEqual(audit.EXPECTED_MEMBERSHIPS, Object.fromEntries(audit.CANONICAL_TEMPLATE.categories.map(item => [item.name, audit.CANONICAL_TEMPLATE.mainAttributes.length + item.codes.length])));
    const runtimeBrandRows = attributeOrder.resolve({ definitions: [{ id: 1, code: "brand", label: "Бренд", dataType: "text" }], templates: [{ definitionId: 1, section: "main", sortOrder: 0 }], values: [], brand: "Brand from products.brand", includeEmptyMain: false });
    assert.strictEqual(runtimeBrandRows[0].value, "Brand from products.brand"); assert.strictEqual(runtimeBrandRows[0].code, "brand");
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Кладочные Смеси"], ["MAT-000067", "MAT-000068", "MAT-000069"]);
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Наливной Пол"], ["MAT-000075", "MAT-000076", "MAT-000077", "MAT-000078", "MAT-000079", "MAT-000080", "MAT-000081", "MAT-000082", "MAT-000083", "MAT-000084", "MAT-000085", "MAT-000086", "MAT-000087"]);
    assert.deepStrictEqual(audit.HISTORICAL_SCOPE["Стяжки Пола"], ["MAT-000089", "MAT-000090"]);
    assert.throws(() => audit.parseArgs([]), /Explicit --db/);
    const parsed = audit.parseArgs(["--db", "fixture.db", "--uploads", "uploads", "--report-dir", "report"]);
    assert.deepStrictEqual(parsed, { db: "fixture.db", uploads: "uploads", reportDir: "report", writeReport: true });
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-closed-audit-")); const dbPath = path.join(root, "fixture.db");
    try {
        const uploads = path.join(root, "uploads", "products"); fs.mkdirSync(uploads, { recursive: true }); fs.writeFileSync(path.join(uploads, "test.webp"), Buffer.from("not a real image; physical audit checks existence and size only"));
        await createFixture(dbPath); const before = hash(dbPath); const report = await audit.auditDatabase({ db: dbPath, uploads }); const repeat = await audit.auditDatabase({ db: dbPath, uploads }); const after = hash(dbPath);
        assert.strictEqual(before, after, "read-only audit must not change DB bytes"); assert.strictEqual(report.readOnly, true); assert.strictEqual(report.schema.userVersion, 11); assert.strictEqual(report.schema.productionTemplateAuditAvailable, true); assert.strictEqual(report.templates.length, 5); assert(report.templates.every(row => row.status === "TEMPLATE_OK")); assert.strictEqual(report.products.length, 5); assert(report.products.every(row => row.publicDataStatus === "READY"), JSON.stringify(report.products.map(row => ({ id: row.externalId, flags: row.flags, attr: row.attributeStatus, seo: row.seoStatus, image: row.imageStatus, source: row.sourceStatus })))); assert.strictEqual(report.mixSeo.rows.length, 18); assert.strictEqual(report.mixSeo.exactComparisonStatus, "EXACT_BATCH_COMPARISON_REQUIRES_HISTORICAL_REFERENCE"); assert.strictEqual(report.images.visualStatus, "VISUAL_REVIEW_REQUIRED"); assert.strictEqual(report.subcategoryConclusions.every(row => row.status === "CLOSED"), true);
        assert(report.attributeCoverage[0].present.includes("brand")); assert(!report.attributeCoverage[0].requiredMissing.includes("brand")); assert.strictEqual(report.attributeCoverage[0].brand.canonicalSource, "products.brand; runtime injects it into main brand rendering");
        assert.deepStrictEqual(report.sourceProvenance.modules, audit.SOURCE_DATASET_NAMES); assert(report.sourceProvenance.rows.every(row => row.status === "SOURCE_OPTIONAL_GAPS"));
        assert.deepStrictEqual(report, repeat, "same DB must produce deterministic report data");
        fs.unlinkSync(path.join(uploads, "test.webp"));
        const missingPhysicalReport = await audit.auditDatabase({ db: dbPath, uploads });
        assert(missingPhysicalReport.products.every(row => row.flags.some(flag => flag.startsWith("PHYSICAL_FILE_MISSING_FILE:"))));
        assert(missingPhysicalReport.blockingIssues.some(issue => issue.includes("PHYSICAL_FILE_MISSING_FILE")));
        assert(missingPhysicalReport.subcategoryConclusions.every(row => row.status === "NOT CLOSED"));
        console.log("PASS read-only SQL/source guard"); console.log("PASS canonical template metadata drift guard"); console.log("PASS schema v11 template integrity and canonical brand-required semantics"); console.log("PASS scope, attributes, effective SEO, source optional gaps and image readiness fixture"); console.log("PASS DB hash unchanged; synthetic SQLite only");

        const tempUploads = path.join(root, "physical", "products"); fs.mkdirSync(tempUploads, { recursive: true });
        const makeImageProduct = (url, image = "legacy text") => ({ id: 1, external_id: "MAT-TEST", image, image_url: url });
        const inspectImage = async (product, rows = []) => audit.inspectImages({ all: async sql => { assert(sql.includes("ORDER BY is_primary DESC,sort_order,id")); return rows.slice().sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || Number(a.sort_order) - Number(b.sort_order) || Number(a.id) - Number(b.id)); } }, [product], tempUploads);
        const validPath = path.join(tempUploads, "valid.webp"); fs.writeFileSync(validPath, Buffer.from("x"));
        const valid = await inspectImage(makeImageProduct("/uploads/products/valid.webp")); assert.strictEqual(valid.rows[0].status, "IMAGE_OK"); assert.strictEqual(valid.rows[0].physical[0].status, "OK");
        const missing = await inspectImage(makeImageProduct("/uploads/products/missing.webp")); assert.strictEqual(missing.rows[0].status, "IMAGE_ANOMALY"); assert.strictEqual(missing.rows[0].physicalFailures[0].status, "MISSING_FILE");
        const zeroPath = path.join(tempUploads, "zero.webp"); fs.writeFileSync(zeroPath, Buffer.alloc(0));
        const zero = await inspectImage(makeImageProduct("/uploads/products/zero.webp")); assert.strictEqual(zero.rows[0].status, "IMAGE_ANOMALY"); assert.strictEqual(zero.rows[0].physicalFailures[0].status, "ZERO_BYTE");
        fs.mkdirSync(path.join(tempUploads, "directory.webp"));
        const notFile = await inspectImage(makeImageProduct("/uploads/products/directory.webp")); assert.strictEqual(notFile.rows[0].status, "IMAGE_ANOMALY"); assert.strictEqual(notFile.rows[0].physicalFailures[0].status, "NOT_FILE");
        for (const result of [missing, zero, notFile]) assert(audit.readiness({ external_id: "MAT-TEST", slug: "test", title: "Test", is_active: 1 }, { attributeStatus: "ATTR_OK", mainCanonical: { brand: true } }, { status: "SEO_OK" }, result.rows[0], { status: "SOURCE_OK" }).flags.some(flag => flag.startsWith("PHYSICAL_FILE_")));
        const remote = await inspectImage(makeImageProduct("https://cdn.example.test/remote.webp")); assert.strictEqual(remote.rows[0].status, "IMAGE_MISSING", "catalog runtime rejects remote products.image_url even though SSR can render a remote gallery URL"); assert.strictEqual(remote.rows[0].physical[0].status, "REMOTE_NOT_CHECKED"); assert.strictEqual(remote.rows[0].physicalFailures.length, 0); assert(!remote.rows[0].issues.some(issue => issue.startsWith("PHYSICAL_FILE_")));
        const unsortedGallery = [
            { id: 8, image_url: "/uploads/products/secondary.webp", sort_order: 0, is_primary: 0 },
            { id: 9, image_url: "/uploads/products/primary.webp", sort_order: 4, is_primary: 1 }
        ];
        const galleryResult = await inspectImage(makeImageProduct("/uploads/products/primary.webp"), unsortedGallery); assert.strictEqual(galleryResult.rows[0].productPageImageUrl, "/uploads/products/primary.webp"); assert.strictEqual(galleryResult.rows[0].productPageSource, "product_images");
        const noGallery = audit.resolveCanonicalImages(makeImageProduct("/uploads/products/fallback.webp"), []); assert.strictEqual(noGallery.productPageSource, "products.image_url_fallback"); assert.strictEqual(noGallery.catalogImageUrl, "/uploads/products/fallback.webp"); assert.strictEqual(noGallery.legacyImageField, "legacy text");
        assert.strictEqual(audit.resolveCanonicalImages(makeImageProduct("/uploads/products/../outside.webp"), []).catalogImageUrl, null);
        const remoteGallery = audit.resolveCanonicalImages(makeImageProduct("https://cdn.example.test/remote.webp"), [{ image_url: "https://cdn.example.test/gallery.webp" }]); assert.strictEqual(remoteGallery.productPageImageUrl, "https://cdn.example.test/gallery.webp"); assert.strictEqual(remoteGallery.catalogImageUrl, null);
        console.log("PASS canonical image ordering, legacy image semantics, and physical file blockers (valid/missing/zero/non-file/remote)");

        const product = { external_id: "MAT-TEST", brand: "Brand A" };
        const sourceWithPrecedence = { identity: [{ moduleName: "identity", priority: 20, status: "CONFIRMED" }], entries: [
            { code: "color", moduleName: "older", priority: 10, status: "NEEDS_SOURCE", value: null },
            { code: "color", moduleName: "latest", priority: 20, status: "READY", value: "Белый", sourceKeys: ["official"] },
            { code: "brand", moduleName: "latest", priority: 20, status: "READY", value: "Brand A", sourceKeys: ["official"] }
        ] };
        const sourceOk = audit.reconcileSourceState(product, [{ code: "color", value_text: "Белый" }, { code: "brand", value_text: "Brand A" }], sourceWithPrecedence); assert.strictEqual(sourceOk.status, "SOURCE_OK"); assert.deepStrictEqual(sourceOk.needsSource, []); assert.strictEqual(sourceOk.superseded.find(item => item.code === "color").latestDataset, "latest");
        const sourceGap = audit.reconcileSourceState(product, [], { identity: [], entries: [{ code: "pot_life", moduleName: "latest", priority: 1, status: "NEEDS_SOURCE", value: null }] }); assert.strictEqual(sourceGap.status, "SOURCE_OPTIONAL_GAPS"); assert.deepStrictEqual(sourceGap.needsSource, ["pot_life"]);
        const sourceAnomaly = audit.reconcileSourceState(product, [{ code: "pot_life", value_text: "2 часа" }], { identity: [], entries: [{ code: "pot_life", moduleName: "latest", priority: 1, status: "NEEDS_SOURCE", value: null }] }); assert.strictEqual(sourceAnomaly.status, "SOURCE_PROVENANCE_ANOMALY");
        const identityBlocked = audit.reconcileSourceState(product, [], { identity: [{ moduleName: "latest", priority: 1, status: "IDENTITY_UNCERTAIN" }], entries: [] }); assert.strictEqual(identityBlocked.status, "SOURCE_BLOCKED");
        const sourceConflict = audit.reconcileSourceState(product, [], { identity: [], entries: [{ code: "color", moduleName: "a", priority: 1, status: "READY", value: "Белый" }, { code: "color", moduleName: "b", priority: 1, status: "READY", value: "Серый" }] }); assert.strictEqual(sourceConflict.status, "SOURCE_BLOCKED");
        const invalidSourceRef = audit.reconcileSourceState(product, [], { identity: [], entries: [{ code: "color", moduleName: "broken-reference", priority: 1, status: "READY", value: "Белый", sourceRefsValid: false, sourceKeys: ["missing"] }] }); assert.strictEqual(invalidSourceRef.status, "SOURCE_BLOCKED"); assert(invalidSourceRef.anomalies.some(item => item.issue === "CONFIRMED_SOURCE_REFERENCE_INVALID"));
        assert.strictEqual(audit.reconcileSourceProduct({ external_id: "MAT-000027", brand: null }, []).status, "SOURCE_BLOCKED");
        assert.strictEqual(audit.reconcileSourceProduct({ external_id: "MAT-000028", brand: null }, []).status, "SOURCE_BLOCKED");
        assert.strictEqual(audit.reconcileSourceProduct({ external_id: "MAT-000077", brand: "Старатели" }, []).status, "SOURCE_BLOCKED");
        assert(audit.reconcileSourceProduct({ external_id: "MAT-000022", brand: "ВОЛМА" }, []).needsSource.includes("consumption_10mm"));
        assert(audit.readiness({ external_id: "MAT-TEST", slug: "test", title: "Test", category: "Другая", is_active: 1 }, { attributeStatus: "ATTR_OK", mainCanonical: { brand: true } }, { status: "SEO_OK" }, { status: "IMAGE_OK", issues: [] }, { status: "SOURCE_OK" }).flags.includes("CARD_REVIEW:CATEGORY_MISMATCH"));
        console.log("PASS source provenance status, explicit precedence, optional gaps, unresolved identity, and DB/source anomalies");
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
