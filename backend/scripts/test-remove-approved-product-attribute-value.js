"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { CONFIRM_TOKEN, APPROVED_REMOVAL, parseArgs, openDatabase, planRemoval, run } = require("./remove-approved-product-attribute-value");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-approved-removal-"));
function rawRun(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function fixture(name, { productExternalId = APPROVED_REMOVAL.externalId, title = APPROVED_REMOVAL.title, attributeCode = APPROVED_REMOVAL.code, valueNumber = APPROVED_REMOVAL.valueNumber, includeTarget = true, triggerDelete = false } = {}) {
    const file = path.join(root, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT);
            CREATE TABLE product_attribute_definitions(id INTEGER PRIMARY KEY,code TEXT);
            CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,attribute_definition_id INTEGER,value_text TEXT,value_number REAL,value_boolean INTEGER);`);
        await rawRun(raw, "INSERT INTO products VALUES(1,?,?)", [productExternalId, title]);
        await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(1,?)", [APPROVED_REMOVAL.code]);
        await rawRun(raw, "INSERT INTO product_attribute_definitions VALUES(2,?)", [attributeCode === APPROVED_REMOVAL.code ? "other_attribute" : attributeCode]);
        if (includeTarget) await rawRun(raw, "INSERT INTO product_attribute_values VALUES(29,1,?,?,?,NULL)", [attributeCode === APPROVED_REMOVAL.code ? 1 : 2, null, valueNumber]);
        await rawRun(raw, "INSERT INTO product_attribute_values VALUES(30,1,2,'keep',9,NULL)");
        if (triggerDelete) await rawRun(raw, "CREATE TRIGGER reject_delete BEFORE DELETE ON product_attribute_values BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");
    } finally { await rawClose(raw); }
    return file;
}

async function snapshot(db) { return db.all("SELECT * FROM product_attribute_values ORDER BY id"); }
async function expectBlocked(name, config) {
    const file = await fixture(name, config);
    const db = await openDatabase(file, true);
    try { assert.strictEqual((await planRemoval(db)).status, "BLOCKED", `${name} must be blocked`); }
    finally { await db.close(); }
}

async function main() {
    assert.strictEqual(parseArgs(["--db", "fixture.db"]).apply, false);
    assert.throws(() => parseArgs(["--db", "fixture.db", "--apply"]), /Apply requires --confirm/);
    assert.strictEqual(parseArgs(["--db", "fixture.db", "--apply", "--confirm", CONFIRM_TOKEN]).apply, true);

    const successFile = await fixture("success");
    const dryDb = await openDatabase(successFile, true);
    const dryBefore = await snapshot(dryDb);
    assert.strictEqual((await run(dryDb)).status, "DRY_RUN / WOULD_DELETE_ONE");
    assert.deepStrictEqual(await snapshot(dryDb), dryBefore, "dry-run must not delete the target");
    await dryDb.close();

    const applyDb = await openDatabase(successFile, false);
    const applied = await run(applyDb, { apply: true, backup: async () => ({ path: "fixture-backup", integrity: "ok" }) });
    assert.strictEqual(applied.status, "APPLIED_ONE_ROW");
    assert.strictEqual(applied.deleted.id, 29);
    assert.deepStrictEqual(await snapshot(applyDb), [{ id: 30, product_id: 1, attribute_definition_id: 2, value_text: "keep", value_number: 9, value_boolean: null }], "only the approved row may be removed; other IDs survive");
    assert.strictEqual((await run(applyDb)).status, "EXISTING_OK / ALREADY_ABSENT");
    await applyDb.close();

    await expectBlocked("wrong-mat", { productExternalId: "MAT-999999" });
    await expectBlocked("wrong-attribute", { attributeCode: "different_code" });
    await expectBlocked("wrong-value", { valueNumber: 3.6 });
    await expectBlocked("wrong-title", { title: "Other product title" });

    const absentFile = await fixture("absent", { includeTarget: false });
    const absentDb = await openDatabase(absentFile, true);
    try { assert.strictEqual((await run(absentDb)).status, "EXISTING_OK / ALREADY_ABSENT"); }
    finally { await absentDb.close(); }

    const rollbackFile = await fixture("rollback", { triggerDelete: true });
    const rollbackDb = await openDatabase(rollbackFile, false);
    const beforeRollback = await snapshot(rollbackDb);
    await assert.rejects(() => run(rollbackDb, { apply: true, backup: async () => ({ path: "fixture-backup", integrity: "ok" }) }), /fixture rollback/);
    assert.deepStrictEqual(await snapshot(rollbackDb), beforeRollback, "failed delete must roll back");
    await rollbackDb.close();

    console.log(JSON.stringify({ success: true, exactTarget: true, oneRowOnly: true, otherRowIdsPreserved: true, dryRunImmutable: true,
        wrongMatBlocked: true, wrongAttributeBlocked: true, wrongValueBlocked: true, wrongTitleBlocked: true,
        alreadyAbsentIdempotent: true, transactionRollback: true, explicitConfirmRequired: true }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
