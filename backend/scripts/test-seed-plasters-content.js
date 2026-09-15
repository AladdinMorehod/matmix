const assert = require("assert/strict");
const { spawnSync } = require("child_process");
const path = require("path");
const DATA = require("./data/plasters-content");
const { ensureProductPageSchema } = require("../services/productPageSchema");
const { CONFIRM, LIMITS, PROTECTED, openDatabase, parseArgs, runBatch, validateProposal, renderReview } = require("./seed-plasters-content");

const clone = value => JSON.parse(JSON.stringify(value));
async function fixture() {
    const db = await openDatabase(":memory:", true);
    await db.run(`CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,description TEXT,
        price REAL,weight REAL,unit TEXT,category TEXT,subcategory TEXT,image_url TEXT,deleted_at TEXT,updated_at TEXT)`);
    await db.run("CREATE TABLE catalog_structure(id INTEGER PRIMARY KEY)");
    await ensureProductPageSchema({ run: db.run, ensureColumn: (table, name, type) => db.run(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`) });
    let definitionId = 0;
    for (const [code, [label, type, unit]] of Object.entries(DATA.DEFINITIONS)) {
        if (["product_type", "base", "purpose", "package_weight", "wall_layer_thickness", "ceiling_layer_thickness", "application_temperature", "shelf_life", "consumption_10mm"].includes(code)) {
            await db.run("INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,is_active,sort_order) VALUES(?,?,?,?,?,1,0)", [++definitionId, code, label, type, unit || null]);
        }
    }
    for (const config of DATA.PRODUCTS) await db.run("INSERT INTO products(external_id,title,price,weight,unit,image_url,brand,updated_at) VALUES(?,?,100,7,'шт','/fixture.webp','keep-brand','before')", [config.externalId, config.expectedTitle]);
    for (const mat of PROTECTED) await db.run("INSERT INTO products(external_id,title,description,full_description,seo_title,price) VALUES(?,?,?,?,?,77)", [mat, "Protected fixture", mat.endsWith("2") ? "Keep legacy" : null, mat.endsWith("2") ? "Keep content" : null, mat.endsWith("2") ? "Keep SEO" : null]);
    await db.run("INSERT INTO product_images(product_id,image_url,alt_text,is_primary) SELECT id,'/fixture.webp','keep alt',1 FROM products");
    return db;
}
async function snapshot(db) {
    const result = {};
    for (const table of ["products", "product_attribute_definitions", "product_attribute_values", "product_attribute_templates", "product_images"]) result[table] = await db.all(`SELECT * FROM ${table} ORDER BY id`);
    return result;
}
async function withFixture(work) { const db = await fixture(); try { await work(db); } finally { await db.close(); } }
const tests = [];
function test(name, work) { tests.push([name, work]); }

test("catalog completeness, sources, unique copy and SEO/render limits", async () => {
    assert.equal(DATA.PRODUCTS.length, 26);
    assert.equal(new Set(DATA.PRODUCTS.map(item => item.externalId)).size, 26);
    for (const config of DATA.PRODUCTS) {
        assert(!PROTECTED.includes(config.externalId));
        validateProposal(config, DATA);
        assert.equal(config.content.full_description.value.split("\n\n").length, 2);
        assert(config.content.seo_title.value.length <= 65, config.externalId);
        assert(config.content.seo_description.value.length >= 120 && config.content.seo_description.value.length <= 160, `${config.externalId}: ${config.content.seo_description.value.length}`);
    }
    for (const field of Object.keys(LIMITS)) assert.equal(new Set(DATA.PRODUCTS.map(item => item.content[field].value)).size, 26, field);
    const invalid = clone(DATA.PRODUCTS[0]);
    for (const [field, limit] of Object.entries(LIMITS)) {
        const bad = clone(invalid); bad.content[field].value = "x".repeat(limit + 1);
        assert.throws(() => validateProposal(bad, DATA), /limit/);
    }
    const bad = clone(invalid); bad.attributes.product_type.value = "x".repeat(2001);
    assert.throws(() => validateProposal(bad, DATA), /limit/);
    const source = clone(invalid); source.content.full_description.sources = [];
    assert.throws(() => validateProposal(source, DATA), /sourced/);
    const marker = clone(invalid); marker.attributes.base.value = "UNKNOWN";
    assert.throws(() => validateProposal(marker, DATA), /placeholder/);
    const price = clone(invalid); price.content.price = { value: "100", status: "READY", sources: ["request"] };
    assert.throws(() => validateProposal(price, DATA), /Only/);
});

test("dry-run invokes no writes; full review includes protected and unresolved", () => withFixture(async db => {
    const before = await snapshot(db);
    const readOnly = { get: db.get, all: db.all, run: () => { throw new Error("Unexpected write method"); } };
    const report = await runBatch({ database: readOnly });
    assert.equal(report.summary.total, 28); assert.equal(report.targetSummary.total, 26);
    assert.equal(report.summary.protected, 2); assert.equal(report.summary.errors, 0);
    assert.equal(report.summary.needsSource, 3);
    assert.deepEqual(await snapshot(db), before);
    const markdown = renderReview({ ...report, generatedAt: "fixture", database: ":memory:" });
    assert(markdown.includes("PROTECTED")); assert(markdown.includes("DEFINITION_MISSING"));
    assert(markdown.includes("NEEDS_SOURCE")); assert(markdown.includes(DATA.PRODUCTS[0].content.full_description.value));
    assert(!markdown.includes("C:\\Users\\")); assert(!markdown.includes("/tmp/"));
}));

test("--only, invalid flags and missing confirmation fail closed", async () => {
    assert.deepEqual(parseArgs(["--db", "local.db", "--only", "MAT-000003,MAT-000004"]).only, ["MAT-000003", "MAT-000004"]);
    assert.deepEqual(parseArgs(["--db=local.db", "--only=MAT-000003"]).only, ["MAT-000003"]);
    for (const args of [["--apply"], ["--db=x", "--apply"], ["--db=x", "--allow-content-overwrite"], ["--db=x", "--only="], ["--db=x", "--dry-run", "--apply"], ["--db=x", "--confirm=wrong"], ["--db=x", "--db=y"]]) assert.throws(() => parseArgs(args));
    const cli = spawnSync(process.execPath, [path.join(__dirname, "seed-plasters-content.js"), "--unexpected"], { encoding: "utf8", windowsHide: true });
    assert.equal(cli.status, 1); assert.match(cli.stderr, /BATCH ABORTED/);
    const db = await openDatabase(":memory:");
    try { await assert.rejects(() => db.run("CREATE TABLE forbidden(id)"), /readonly/i); } finally { await db.close(); }
    await withFixture(async database => {
        const result = await runBatch({ database, only: ["MAT-000003", "MAT-000004", "MAT-000003"] });
        assert.deepEqual(result.rows.map(row => row.externalId), ["MAT-000003", "MAT-000004"]);
        await assert.rejects(() => runBatch({ database, apply: true, confirm: "wrong" }), /confirmation/);
    });
});

test("protected remain byte-for-byte unchanged, even empty and explicitly selected", () => withFixture(async database => {
    const before = await snapshot(database);
    const result = await runBatch({ database, only: PROTECTED, apply: true, confirm: CONFIRM });
    assert.equal(result.fieldsWritten, 0); assert.equal(result.specsInserted, 0);
    assert.deepEqual(await snapshot(database), before);
}));

test("existing fields/specs preserved; repeat idempotency; immutable data and no definitions writes", () => withFixture(async database => {
    await database.run("UPDATE products SET full_description='Existing full',seo_title='Existing title' WHERE external_id='MAT-000003'");
    await database.run("UPDATE products SET description='Existing legacy' WHERE external_id='MAT-000004'");
    await database.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text) SELECT p.id,d.id,'Existing purpose' FROM products p,product_attribute_definitions d WHERE p.external_id='MAT-000003' AND d.code='purpose'");
    const before = await snapshot(database);
    const first = await runBatch({ database, apply: true, confirm: CONFIRM });
    assert(first.fieldsWritten > 0); assert(first.specsInserted > 0);
    const after = await snapshot(database);
    assert.deepEqual(after.product_images, before.product_images);
    assert.deepEqual(after.product_attribute_definitions, before.product_attribute_definitions);
    assert.deepEqual(after.product_attribute_templates, before.product_attribute_templates);
    for (const product of before.products) {
        const current = after.products.find(item => item.id === product.id);
        for (const field of Object.keys(product)) if (![...Object.keys(LIMITS), "updated_at"].includes(field)) assert.deepEqual(current[field], product[field], `${product.external_id} ${field}`);
        if (PROTECTED.includes(product.external_id)) assert.deepEqual(current, product);
    }
    const three = after.products.find(product => product.external_id === "MAT-000003");
    assert.equal(three.full_description, "Existing full"); assert.equal(three.seo_title, "Existing title");
    assert.equal(after.products.find(product => product.external_id === "MAT-000004").full_description, null);
    assert.deepEqual(after.product_attribute_values.find(value => value.id === before.product_attribute_values[0].id), before.product_attribute_values[0]);
    const second = await runBatch({ database, apply: true, confirm: CONFIRM });
    assert.equal(second.fieldsWritten, 0); assert.equal(second.specsInserted, 0);
    assert.deepEqual(await snapshot(database), after);
    assert.equal((await database.all("SELECT product_id,attribute_definition_id,count(*) n FROM product_attribute_values GROUP BY product_id,attribute_definition_id HAVING n>1")).length, 0);
    assert(!JSON.stringify(after.products).includes("NEEDS_SOURCE"));
    assert(!JSON.stringify(after.product_attribute_values).includes("UNKNOWN"));
    for (const mat of ["MAT-000019", "MAT-000027", "MAT-000028"]) assert.deepEqual(after.products.find(p => p.external_id === mat), before.products.find(p => p.external_id === mat));
}));

test("selection constrains actual writes; unknown and changed identity are controlled errors", () => withFixture(async database => {
    const before = await snapshot(database);
    await runBatch({ database, only: ["MAT-000003"], apply: true, confirm: CONFIRM });
    const after = await snapshot(database);
    assert.deepEqual(after.products.filter(p => p.external_id !== "MAT-000003"), before.products.filter(p => p.external_id !== "MAT-000003"));
    const unknown = await runBatch({ database, only: ["MAT-999999"] });
    assert.equal(unknown.summary.errors, 1); assert.match(unknown.rows[0].error, /Unknown MAT/);
    await assert.rejects(() => runBatch({ database, only: ["MAT-000004", "MAT-999999"], apply: true, confirm: CONFIRM }), /preflight errors/);
    assert.deepEqual(await snapshot(database), after);
    await database.run("UPDATE products SET title='Different product' WHERE external_id='MAT-000004'");
    const mismatch = await runBatch({ database, only: ["MAT-000004"] });
    assert.match(mismatch.rows[0].error, /Identity mismatch/);
    await database.run("UPDATE products SET deleted_at='deleted' WHERE external_id='MAT-000006'");
    assert.equal((await runBatch({ database, only: ["MAT-000006"] })).summary.errors, 1);
}));

test("transaction rollback undoes content and earlier products after injected insert failure", () => withFixture(async database => {
    const before = await snapshot(database); let inserts = 0;
    const failing = { ...database, run(sql, params) {
        if (sql.startsWith("INSERT INTO product_attribute_values") && ++inserts === 8) throw new Error("injected insert failure");
        return database.run(sql, params);
    } };
    await assert.rejects(() => runBatch({ database: failing, apply: true, confirm: CONFIRM }), /injected insert failure/);
    assert.equal(inserts, 8); assert.deepEqual(await snapshot(database), before);
}));

test("semantic mass alias is preserved; malformed duplicates abort without changes", () => withFixture(async database => {
    await database.run("INSERT INTO product_attribute_definitions(code,label,data_type,default_unit) VALUES('mass','Масса упаковки','number','кг')");
    await database.run("INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_number) SELECT p.id,d.id,30 FROM products p,product_attribute_definitions d WHERE p.external_id='MAT-000003' AND d.code='mass'");
    const result = await runBatch({ database, only: ["MAT-000003"], apply: true, confirm: CONFIRM });
    const mass = result.rows[0].proposedSpecs.find(item => item.code === "package_weight");
    assert.equal(mass.status, "EXISTING"); assert.equal(mass.currentCode, "mass");
    assert.equal((await database.get("SELECT count(*) n FROM product_attribute_values v JOIN products p ON p.id=v.product_id JOIN product_attribute_definitions d ON d.id=v.attribute_definition_id WHERE p.external_id='MAT-000003' AND d.code='package_weight'")).n, 0);
    const before = await snapshot(database);
    const duplicate = { ...database, async all(sql, params) {
        const rows = await database.all(sql, params);
        if (sql.includes("FROM product_attribute_definitions ORDER BY") || sql.includes("FROM product_attribute_values v LEFT JOIN")) return rows.length ? [...rows, rows[0]] : rows;
        return rows;
    } };
    await assert.rejects(() => runBatch({ database: duplicate, only: ["MAT-000003"], apply: true, confirm: CONFIRM }), /Duplicate specifications/);
    await assert.rejects(() => runBatch({ database: duplicate, only: ["MAT-000004"], apply: true, confirm: CONFIRM }), /Ambiguous definition/);
    assert.deepEqual(await snapshot(database), before);
}));

test("incompatible definitions abort entire batch; unknown values never become writes", () => withFixture(async database => {
    await database.run("UPDATE product_attribute_definitions SET default_unit='г' WHERE code='package_weight'");
    const before = await snapshot(database);
    await assert.rejects(() => runBatch({ database, apply: true, confirm: CONFIRM }), /Incompatible definition/);
    assert.deepEqual(await snapshot(database), before);
    const data = clone(DATA); data.PRODUCTS[0].attributes.base.value = "NEEDS_SOURCE";
    const result = await runBatch({ database, data, only: ["MAT-000001"] });
    assert.equal(result.summary.errors, 1); assert.match(result.rows[0].error, /placeholder/);
}));

(async () => {
    for (const [name, work] of tests) { await work(); console.log(`PASS ${name}`); }
    console.log(`PASS ${tests.length} test groups; all mutations used synthetic in-memory SQLite only`);
})().catch(error => { console.error(error); process.exitCode = 1; });
