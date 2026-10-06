"use strict";

const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const FIX = require("./reconcile-tile-adhesive-mat000129");
const CORE = require("./data/tile-adhesive-core-batch1");
const CONTENT = require("./data/tile-adhesive-content-batch1");

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mat129-reconcile-"));
const MAT129 = CORE.PRODUCTS.find(item => item.externalId === FIX.MAT);
const COPY = CONTENT.PRODUCTS.find(item => item.externalId === FIX.MAT);
const OTHER_MAT = "MAT-OTHER-FIXTURE";

function hash(value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function rawRun(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes, id: this.lastID }); })); }
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function close(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
function wrapped(raw) {
    return {
        run(sql, params = []) { return new Promise((resolve, reject) => raw.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes, id: this.lastID }); })); },
        get(sql, params = []) { return new Promise((resolve, reject) => raw.get(sql, params, (error, row) => error ? reject(error) : resolve(row))); },
        all(sql, params = []) { return new Promise((resolve, reject) => raw.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        close() { return close(raw); }
    };
}

async function createFixture(name, { purpose = FIX.OLD.purpose, short = "old", full = "old", seo = "old", shelfLife = "absent", adjustment = "absent", duplicatePurpose = false, failAdjustmentInsert = false, schemaVersion = 11, productOverride = {} } = {}) {
    const file = path.join(ROOT, `${name}.db`);
    const raw = new sqlite3.Database(file);
    const db = wrapped(raw);
    const source = CORE.SOURCES.vetonitEasyFix;
    try {
        await rawExec(raw, `PRAGMA user_version=${schemaVersion};
          CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,slug TEXT,category TEXT,subcategory TEXT,brand TEXT,weight REAL,unit TEXT,is_active INTEGER,deleted_at TEXT,short_description TEXT,full_description TEXT,seo_title TEXT,seo_description TEXT,price REAL,stock INTEGER,image_url TEXT,updated_at TEXT);
          CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER,unit_override TEXT,sort_order INTEGER,created_at TEXT,updated_at TEXT);
          CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT,label TEXT,data_type TEXT,default_unit TEXT,default_section TEXT,sort_order INTEGER,is_active INTEGER,created_at TEXT,updated_at TEXT);
          CREATE TABLE product_attribute_templates(id INTEGER PRIMARY KEY,structure_id INTEGER,attribute_definition_id INTEGER,section TEXT,sort_order INTEGER,is_required INTEGER,unit_override TEXT,created_at TEXT,updated_at TEXT);
          CREATE TABLE product_images(id INTEGER PRIMARY KEY,product_id INTEGER,image_url TEXT,sort_order INTEGER);`);
        const now = "2026-10-06T00:00:00.000Z";
        for (const [id, code, label, type, unit] of [[1,"purpose","Назначение","text",null],[2,"shelf_life","Срок хранения","number","месяцев"],[3,"adjustment_time","Время корректировки","text",null]]) {
            await rawRun(raw, "INSERT INTO product_attribute_definitions(id,code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at) VALUES(?,?,?,?,?,'Характеристики',?,1,?,?)", [id,code,label,type,unit,id,now,now]);
            const section = code === "shelf_life" ? "main" : "regular";
            const order = code === "shelf_life" ? CORE.TEMPLATE.mainCodes.indexOf(code) : CORE.TEMPLATE.regularCodes.indexOf(code);
            await rawRun(raw, "INSERT INTO product_attribute_templates(structure_id,attribute_definition_id,section,sort_order,is_required,unit_override,created_at,updated_at) VALUES(16,?,?,?,0,NULL,?,?)", [id,section,order,now,now]);
        }
        const targetContent = { short_description: short === "old" ? FIX.OLD.short_description : short === "new" ? FIX.NEW.short_description : short, full_description: full === "old" ? FIX.OLD.full_description : full === "new" ? FIX.NEW.full_description : full, seo_description: seo === "old" ? FIX.OLD.seo_description : seo === "new" ? FIX.NEW.seo_description : seo };
        await rawRun(raw, `INSERT INTO products(id,external_id,title,slug,category,subcategory,brand,weight,unit,is_active,deleted_at,short_description,full_description,seo_title,seo_description,price,stock,image_url,updated_at) VALUES(1,?,?,?,?,?,?,?,?,1,NULL,?,?,?,?,123,5,'/placeholder.webp','unchanged')`, [FIX.MAT, productOverride.title ?? MAT129.expectedTitle,"slug-mat129",productOverride.category ?? MAT129.expectedCategory,productOverride.subcategory ?? MAT129.expectedSubcategory,productOverride.brand ?? MAT129.expectedBrand,productOverride.weight ?? MAT129.expectedWeight,productOverride.unit ?? MAT129.expectedUnit,targetContent.short_description,targetContent.full_description,productOverride.seo_title ?? COPY.seoTitle,targetContent.seo_description]);
        await rawRun(raw, "INSERT INTO products(id,external_id,title,slug,category,subcategory,brand,weight,unit,is_active,deleted_at,short_description,full_description,seo_title,seo_description,price,stock,image_url,updated_at) VALUES(2,?,?,?,?,?,?,?,?,1,NULL,'keep','keep','keep','keep',456,9,'/shared-placeholder.webp','other-stamp')", [OTHER_MAT,"Other product","other","Смеси","Клей для Плитки","Other",10,"шт"]);
        await rawRun(raw, "INSERT INTO product_attribute_values(id,product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order,created_at,updated_at) VALUES(1,1,1,?,NULL,NULL,NULL,?, ?, ?)", [purpose,CORE.TEMPLATE.regularCodes.indexOf("purpose"),now,now]);
        if (duplicatePurpose) await rawRun(raw, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,sort_order) VALUES(1,1,?,?)", [purpose,CORE.TEMPLATE.regularCodes.indexOf("purpose")]);
        if (shelfLife !== "absent") await rawRun(raw, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order) VALUES(1,2,NULL,?,NULL,'месяцев',?)", [shelfLife === "exact" ? 12 : 11,CORE.TEMPLATE.mainCodes.indexOf("shelf_life")]);
        if (adjustment !== "absent") await rawRun(raw, "INSERT INTO product_attribute_values(product_id,attribute_definition_id,value_text,value_number,value_boolean,unit_override,sort_order) VALUES(1,3,?,NULL,NULL,NULL,?)", [adjustment === "exact" ? "15 мин" : "20 мин",CORE.TEMPLATE.regularCodes.indexOf("adjustment_time")]);
        await rawRun(raw, "INSERT INTO product_images(id,product_id,image_url,sort_order) VALUES(1,1,'/placeholder.webp',0)");
        if (failAdjustmentInsert) await rawExec(raw, "CREATE TRIGGER fail_adjustment BEFORE INSERT ON product_attribute_values WHEN NEW.attribute_definition_id=3 BEGIN SELECT RAISE(ABORT,'synthetic adjustment insert failure'); END;");
    } finally { await db.close(); }
    return file;
}

async function readSnapshot(file) {
    const db = await FIX.openDatabase(file, false);
    try { return await FIX.snapshot(db); } finally { await db.close(); }
}

async function withDb(file, fn) {
    const db = await FIX.openDatabase(file, true);
    try { return await fn(db); } finally { await db.close(); }
}

async function main() {
    try {
        assert.deepStrictEqual(FIX.assertOnly("MAT-000129"), ["MAT-000129"]);
        for (const bad of [undefined,"MAT-000128","MAT-000129,MAT-000130",["MAT-000129","MAT-000129"]]) assert.throws(() => FIX.assertOnly(bad),/Exact --only/);
        assert.throws(() => FIX.parseArgs(["--db","x.db","--only","MAT-000130"]),/Exact --only/);
        assert.throws(() => FIX.parseArgs(["--db","x.db","--only","MAT-000129","--apply","--backup-dir","backup","--confirm","wrong"]),/RECONCILE_TILE_ADHESIVE_MAT000129/);
        const exactOptions = FIX.parseArgs(["--db","x.db","--only","MAT-000129","--apply","--backup-dir","backup","--confirm",FIX.CONFIRM]);
        assert.equal(exactOptions.apply,true);
        console.log("PASS exact MAT allowlist and explicit apply authorization");

        const file = await createFixture("target");
        const before = await readSnapshot(file);
        const beforeHash = hash(before);
        const dry = await withDb(file, db => FIX.inspect(db));
        assert.equal(dry.mode,"dry-run");
        assert.deepStrictEqual(dry.scope,[FIX.MAT]);
        assert.equal(dry.planned.attributeUpdates,1);
        assert.equal(dry.planned.attributeInserts,2);
        assert.equal(dry.planned.contentUpdates,3);
        assert.equal(dry.planned.totalDatabaseMutations,6);
        assert.equal(dry.planned.brandUpdates,0);
        assert.equal(dry.planned.definitionWrites,0);
        assert.equal(dry.planned.templateWrites,0);
        assert.equal(dry.planned.imageWrites,0);
        assert.equal(hash(await readSnapshot(file)),beforeHash,"dry-run is read-only");
        console.log("PASS dry-run exact plan: purpose correction + shelf-life/adjustment inserts + 3 content fields; no forbidden writes");

        for (const [name,options,pattern] of [
            ["wrong-purpose",{purpose:"unexpected purpose"},/purpose must equal exact old value/],
            ["wrong-copy",{short:"unexpected"},/CONTENT_CONFLICT short_description/],
            ["wrong-full",{full:"unexpected"},/CONTENT_CONFLICT full_description/],
            ["wrong-seo-description",{seo:"unexpected"},/CONTENT_CONFLICT seo_description/],
            ["wrong-seo-title",{productOverride:{seo_title:"wrong SEO title"}},/seo_title differs/],
            ["wrong-shelf",{shelfLife:"wrong"},/shelf_life must be absent or exact/],
            ["wrong-adjustment",{adjustment:"wrong"},/adjustment_time must be absent or exact/],
            ["duplicate-purpose",{duplicatePurpose:true},/duplicate MAT-000129\/purpose/],
            ["wrong-schema",{schemaVersion:10},/expected v11/],
            ["wrong-title",{productOverride:{title:"wrong title"}},/title mismatch/],
            ["wrong-brand",{productOverride:{brand:"wrong brand"}},/brand mismatch/],
            ["wrong-category",{productOverride:{category:"wrong category"}},/category mismatch/],
            ["wrong-subcategory",{productOverride:{subcategory:"wrong subcategory"}},/subcategory mismatch/],
            ["wrong-unit",{productOverride:{unit:"kg"}},/unit mismatch/],
            ["wrong-weight",{productOverride:{weight:20}},/weight\/activity/],
        ]) {
            const badFile=await createFixture(name,options);
            await withDb(badFile,db=>assert.rejects(()=>FIX.inspect(db),pattern));
        }
        console.log("PASS exact old-value, identity/schema, and duplicate-row guards");

        const applyFile = await createFixture("apply");
        const backupDir = path.join(ROOT,"verified-backups");
        const applied = await withDb(applyFile,db=>FIX.applyBatch(db,applyFile,{only:[FIX.MAT],confirm:FIX.CONFIRM,backupDir}));
        assert.equal(applied.writes,6);
        assert.equal(applied.backup.verified,true);
        assert.equal(applied.backup.schemaVersion,11);
        assert.equal(applied.backup.integrityCheck,"ok");
        assert.equal(applied.backup.foreignKeyViolations,0);
        assert(applied.backup.path.startsWith(backupDir));
        assert(fs.existsSync(applied.backup.path));
        const afterApply = await readSnapshot(applyFile);
        const target = afterApply.products.find(row=>row.external_id===FIX.MAT);
        assert.equal(target.short_description,FIX.NEW.short_description);
        assert.equal(target.full_description,FIX.NEW.full_description);
        assert.equal(target.seo_description,FIX.NEW.seo_description);
        assert.equal(target.seo_title,COPY.seoTitle);
        assert.equal(target.title,MAT129.expectedTitle);
        assert.equal(target.slug,"slug-mat129");
        assert.equal(target.brand,"Vetonit");
        assert.deepStrictEqual(afterApply.products.find(row=>row.external_id===OTHER_MAT),before.products.find(row=>row.external_id===OTHER_MAT));
        assert.deepStrictEqual(afterApply.product_attribute_definitions,before.product_attribute_definitions);
        assert.deepStrictEqual(afterApply.product_attribute_templates,before.product_attribute_templates);
        assert.deepStrictEqual(afterApply.product_images,before.product_images);
        const purposeRow=afterApply.product_attribute_values.find(row=>row.attribute_definition_id===1);
        const shelfRow=afterApply.product_attribute_values.find(row=>row.attribute_definition_id===2);
        const adjustmentRow=afterApply.product_attribute_values.find(row=>row.attribute_definition_id===3);
        assert.equal(purposeRow.value_text,FIX.NEW.purpose);
        assert.equal(shelfRow.value_number,12);
        assert.equal(shelfRow.unit_override,"месяцев");
        assert.equal(adjustmentRow.value_text,"15 мин");
        const post=await withDb(applyFile,db=>FIX.inspect(db));
        assert.equal(post.planned.totalDatabaseMutations,0,"second run is idempotent");
        const noop=await withDb(applyFile,db=>FIX.applyBatch(db,applyFile,{only:[FIX.MAT],confirm:FIX.CONFIRM,backupDir:path.join(ROOT,"no-op-backups")}));
        assert.equal(noop.writes,0);
        assert.equal(noop.backup,null);
        assert.equal(fs.existsSync(path.join(ROOT,"no-op-backups")),false);
        console.log("PASS verified backup, exact apply delta, protected surfaces, and idempotent second run");

        const rollbackFile=await createFixture("rollback",{failAdjustmentInsert:true});
        const rollbackBefore=await readSnapshot(rollbackFile);
        await assert.rejects(()=>withDb(rollbackFile,db=>FIX.applyBatch(db,rollbackFile,{only:[FIX.MAT],confirm:FIX.CONFIRM,backupDir:path.join(ROOT,"rollback-backups")})),/synthetic adjustment insert failure/);
        assert.deepStrictEqual(await readSnapshot(rollbackFile),rollbackBefore,"transaction rolls back prior product and attribute writes");
        console.log("PASS rollback restores the full snapshot after an injected mid-transaction failure");

        console.log(JSON.stringify({ success:true, scope:[FIX.MAT], plannedMutations:6, attributeMutations:3, contentMutations:3, backupVerified:true, idempotent:true, rollback:true, unrelatedProductUnchanged:true, definitionsTemplatesImagesUnchanged:true },null,2));
    } finally { fs.rmSync(ROOT,{recursive:true,force:true,maxRetries:10,retryDelay:100}); }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
