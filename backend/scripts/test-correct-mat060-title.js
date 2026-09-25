"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { CONFIRM_TOKEN, APPROVED_CORRECTION, parseArgs, openDatabase, planCorrection, createOnlineBackup, run } = require("./correct-mat060-title");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-mat060-title-"));
function rawRun(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ id: this.lastID, changes: this.changes }); })); }
function rawExec(db, sql) { return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve())); }
function rawClose(db) { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }

async function fixture(name, { externalId = APPROVED_CORRECTION.externalId, title = APPROVED_CORRECTION.oldTitle, duplicate = false, rejectUpdate = false } = {}) {
    const file = path.join(root, `${name}.db`);
    const raw = new sqlite3.Database(file);
    try {
        await rawExec(raw, `CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT,title TEXT,brand TEXT);
            CREATE TABLE product_attribute_values(id INTEGER PRIMARY KEY,product_id INTEGER,code TEXT,value_text TEXT);
            INSERT INTO products VALUES(1,'MAT-000060','${APPROVED_CORRECTION.oldTitle.replace(/'/g, "''")}','ВОЛМА');
            INSERT INTO products VALUES(2,'MAT-OTHER','Other title','Other brand');
            INSERT INTO product_attribute_values VALUES(31,1,'base','existing');
            INSERT INTO product_attribute_values VALUES(32,2,'base','untouched');`);
        if (externalId !== APPROVED_CORRECTION.externalId || title !== APPROVED_CORRECTION.oldTitle) {
            await rawRun(raw, "UPDATE products SET external_id=?,title=? WHERE id=1", [externalId, title]);
        }
        if (duplicate) await rawRun(raw, "INSERT INTO products VALUES(3,?,?,?)", [APPROVED_CORRECTION.externalId, APPROVED_CORRECTION.oldTitle, "Duplicate"]);
        if (rejectUpdate) await rawExec(raw, "CREATE TRIGGER reject_title_update BEFORE UPDATE OF title ON products BEGIN SELECT RAISE(ABORT,'fixture rollback'); END");
    } finally { await rawClose(raw); }
    return file;
}

async function snapshot(db) {
    return {
        products: await db.all("SELECT id,external_id,title,brand FROM products ORDER BY id"),
        attributes: await db.all("SELECT id,product_id,code,value_text FROM product_attribute_values ORDER BY id")
    };
}

async function main() {
    assert.strictEqual(parseArgs(["--db", "fixture.db"]).apply, false);
    assert.throws(() => parseArgs(["--db", "fixture.db", "--apply"]), /Apply requires --confirm/);
    assert.strictEqual(parseArgs(["--db", "fixture.db", "--apply", "--confirm", CONFIRM_TOKEN]).apply, true);

    const successFile = await fixture("success");
    const dryDb = await openDatabase(successFile, true);
    const before = await snapshot(dryDb);
    assert.strictEqual((await planCorrection(dryDb)).status, "WILL_UPDATE");
    assert.strictEqual((await run(dryDb)).status, "DRY_RUN / WOULD_UPDATE_TITLE");
    assert.deepStrictEqual(await snapshot(dryDb), before, "dry-run must not change any database values");
    await dryDb.close();

    const applyDb = await openDatabase(successFile, false);
    let backupSawOldTitle = false;
    const applied = await run(applyDb, { apply: true, backup: () => createOnlineBackup(applyDb, successFile, path.join(root, "backups")).then(async backup => {
        const backupDb = await openDatabase(backup.path, true);
        try { backupSawOldTitle = (await backupDb.get("SELECT title FROM products WHERE external_id=?", [APPROVED_CORRECTION.externalId])).title === APPROVED_CORRECTION.oldTitle; }
        finally { await backupDb.close(); }
        return backup;
    }) });
    assert.strictEqual(applied.status, "APPLIED_TITLE_CORRECTION");
    assert.strictEqual(applied.updatedRows, 1);
    assert.strictEqual(applied.backup.integrity, "ok");
    assert.strictEqual(backupSawOldTitle, true, "backup must precede the title update");
    const afterApply = await snapshot(applyDb);
    assert.strictEqual(afterApply.products[0].title, APPROVED_CORRECTION.newTitle);
    assert.deepStrictEqual(afterApply.products.slice(1), before.products.slice(1), "unrelated product rows must remain unchanged");
    assert.deepStrictEqual(afterApply.attributes, before.attributes, "attribute rows must remain unchanged");
    assert.strictEqual((await run(applyDb)).status, "EXISTING_OK");
    await applyDb.close();

    const alreadyNewFile = await fixture("already-new", { title: APPROVED_CORRECTION.newTitle });
    const alreadyNewDb = await openDatabase(alreadyNewFile, true);
    try { assert.strictEqual((await run(alreadyNewDb)).status, "EXISTING_OK"); }
    finally { await alreadyNewDb.close(); }

    const wrongTitleFile = await fixture("wrong-title", { title: "Unexpected title" });
    const wrongTitleDb = await openDatabase(wrongTitleFile, true);
    try { assert.strictEqual((await planCorrection(wrongTitleDb)).status, "BLOCKED"); }
    finally { await wrongTitleDb.close(); }

    const wrongMatFile = await fixture("wrong-mat", { externalId: "MAT-000061" });
    const wrongMatDb = await openDatabase(wrongMatFile, true);
    try { assert.strictEqual((await planCorrection(wrongMatDb)).status, "BLOCKED"); }
    finally { await wrongMatDb.close(); }

    const duplicateFile = await fixture("duplicate", { duplicate: true });
    const duplicateDb = await openDatabase(duplicateFile, true);
    try { assert.strictEqual((await planCorrection(duplicateDb)).status, "BLOCKED"); }
    finally { await duplicateDb.close(); }

    const rollbackFile = await fixture("rollback", { rejectUpdate: true });
    const rollbackDb = await openDatabase(rollbackFile, false);
    const rollbackBefore = await snapshot(rollbackDb);
    await assert.rejects(() => run(rollbackDb, { apply: true, backup: async () => ({ path: "fixture-backup", integrity: "ok" }) }), /fixture rollback/);
    assert.deepStrictEqual(await snapshot(rollbackDb), rollbackBefore, "failed update must roll back");
    await rollbackDb.close();

    console.log(JSON.stringify({ success: true, exactMatGuard: true, exactOldTitleGuard: true, alreadyNewIdempotent: true,
        wrongTitleBlocked: true, wrongMatBlocked: true, duplicateMatBlocked: true, dryRunImmutable: true,
        backupBeforeUpdate: true, oneTitleRowUpdated: true, attributeRowsUnchanged: true,
        unrelatedProductsUnchanged: true, transactionRollback: true, explicitConfirmRequired: true }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(root, { recursive: true, force: true }));
