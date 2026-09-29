const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const sharp = require("sharp");
const {
    planBatch, classifyImage, extractMat, parseImageFilename, parseArgs,
    assertSafeApply, applyPlan, createVerifiedBackup
} = require("./import-product-images");

const run = (db, sql, params = []) => new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve(this); }));
const get = (db, sql, params = []) => new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
const all = (db, sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
const close = db => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve()));
const open = file => new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, error => error ? reject(error) : resolve(db));
});
const createPng = (file, width = 400, height = 900, background = "#345678") => sharp({ create: { width, height, channels: 3, background } }).png().toFile(file);
const snapshot = async db => ({
    products: await all(db, "SELECT * FROM products ORDER BY id"),
    images: await all(db, "SELECT * FROM product_images ORDER BY id")
});

(async () => {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-photo-import-"));
    const importerSource = fs.readFileSync(path.join(__dirname, "import-product-images.js"), "utf8");
    assert.doesNotMatch(importerSource, /copyFile\s*\(\s*(?:dbPath|sourcePath)/, "database backup must not use file copy");
    assert.match(importerSource, /UPDATE products SET image_url=\? WHERE id=\?/);
    assert.doesNotMatch(importerSource, /UPDATE products SET image_url=\?,\s*updated_at/i, "product.updated_at is outside the writable surface");
    assert.match(importerSource, /UPDATE product_images SET image_url=\? WHERE id=\?/);
    assert.match(importerSource, /only primary image bindings are allowed/);
    const backupCall = importerSource.indexOf("const backup = await createVerifiedBackup(dbPath)");
    const beginCall = importerSource.indexOf('await run(db, "BEGIN IMMEDIATE")', backupCall);
    assert.ok(backupCall >= 0 && beginCall > backupCall, "verified online backup must complete before BEGIN IMMEDIATE");

    // Online backup must include data committed to WAL and produce a standalone, verified SQLite file.
    const walPath = path.join(root, "wal-source.db");
    let walDb = await open(walPath);
    await run(walDb, "PRAGMA journal_mode=WAL");
    await run(walDb, "PRAGMA user_version=11");
    await run(walDb, "CREATE TABLE parent(id INTEGER PRIMARY KEY)");
    await run(walDb, "CREATE TABLE snapshot_probe(value TEXT NOT NULL, parent_id INTEGER REFERENCES parent(id))");
    await run(walDb, "INSERT INTO parent VALUES(1)");
    await run(walDb, "INSERT INTO snapshot_probe VALUES('committed-in-wal',1)");
    assert.ok(fs.existsSync(`${walPath}-wal`));
    assert.ok(fs.statSync(`${walPath}-wal`).size > 32, "fixture change remains in WAL before online backup");
    const walBackup = await createVerifiedBackup(walPath);
    assert.ok(fs.existsSync(walBackup.backupPath));
    assert.ok(walBackup.backupSize > 1024);
    assert.match(walBackup.backupSha256, /^[a-f0-9]{64}$/);
    assert.strictEqual(walBackup.backupUserVersion, 11);
    const walCopy = await open(walBackup.backupPath);
    assert.strictEqual((await get(walCopy, "SELECT value FROM snapshot_probe")).value, "committed-in-wal");
    assert.strictEqual((await get(walCopy, "PRAGMA integrity_check")).integrity_check, "ok");
    assert.deepStrictEqual(await all(walCopy, "PRAGMA foreign_key_check"), []);
    assert.strictEqual((await get(walCopy, "PRAGMA user_version")).user_version, 11);
    await close(walCopy);
    await close(walDb);

    const badFkPath = path.join(root, "bad-fk.db");
    const badFkDb = await open(badFkPath);
    await run(badFkDb, "PRAGMA user_version=11");
    await run(badFkDb, "CREATE TABLE parent(id INTEGER PRIMARY KEY)");
    await run(badFkDb, "CREATE TABLE child(parent_id INTEGER REFERENCES parent(id))");
    await run(badFkDb, "INSERT INTO child VALUES(999)");
    await close(badFkDb);
    await assert.rejects(() => createVerifiedBackup(badFkPath), /foreign_key_check failed/);

    const oldSchemaPath = path.join(root, "old-schema.db");
    const oldSchemaDb = await open(oldSchemaPath);
    await run(oldSchemaDb, "PRAGMA user_version=4");
    await run(oldSchemaDb, "CREATE TABLE old_schema_probe(value TEXT)");
    await close(oldSchemaDb);
    await assert.rejects(() => createVerifiedBackup(oldSchemaPath), /Expected MatMix schema version 11/);

    // Local fixtures exercise exact --only scope, read-only dry-run and primary-only apply.
    const input = path.join(root, "input");
    const primaryInput = path.join(root, "primary-input");
    const uploads = path.join(root, "uploads");
    const dbPath = path.join(root, "test.db");
    await fs.promises.mkdir(input);
    await fs.promises.mkdir(primaryInput);
    await fs.promises.mkdir(uploads);
    let db = await open(dbPath);
    await run(db, "PRAGMA journal_mode=WAL");
    await run(db, "PRAGMA user_version=11");
    await run(db, "CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,image_url TEXT,updated_at TEXT)");
    await run(db, "CREATE TABLE product_images(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER REFERENCES products(id),image_url TEXT,alt_text TEXT,sort_order INTEGER,is_primary INTEGER,created_at TEXT,updated_at TEXT)");
    const placeholder = "/uploads/products/MAT-000001-20260714153714969-3fb7fe.png";
    await run(db, "INSERT INTO products VALUES(1,'MAT-000003','Test product',?,NULL)", [placeholder]);
    await run(db, "INSERT INTO products VALUES(2,'MAT-000002','Protected product','/uploads/products/MAT-000002-8a18a30a9571debc.webp','unchanged')");
    await run(db, "INSERT INTO products VALUES(3,'MAT-000004','Second batch product',?,NULL)", [placeholder]);
    await run(db, "INSERT INTO product_images(product_id,image_url,alt_text,sort_order,is_primary,created_at,updated_at) VALUES(1,?,'old alt',0,1,'created-before','updated-before')", [placeholder]);
    await run(db, "INSERT INTO product_images(product_id,image_url,is_primary) VALUES(2,'/uploads/products/MAT-000002-8a18a30a9571debc.webp',1)");
    await run(db, "INSERT INTO product_images(product_id,image_url,is_primary) VALUES(3,?,1)", [placeholder]);
    assert.ok(fs.existsSync(`${dbPath}-wal`));
    assert.ok(fs.statSync(`${dbPath}-wal`).size > 32, "apply fixture remains in WAL");
    await createPng(path.join(input, "MAT-000003.png"));
    await createPng(path.join(input, "MAT-000002.png"), 10, 10, "#ffffff");
    await createPng(path.join(input, "MAT-000003-2.png"), 300, 300, "#abcdef");
    await fs.promises.copyFile(path.join(input, "MAT-000003.png"), path.join(primaryInput, "MAT-000003.png"));

    assert.strictEqual(extractMat("MAT-000003.png"), "MAT-000003");
    assert.strictEqual(extractMat("MAT-3.png"), null);
    assert.strictEqual(classifyImage({ image_url: placeholder }), "placeholder");
    assert.deepStrictEqual(parseImageFilename("MAT-000003-1.webp"), { mat: "MAT-000003", position: 1 });
    assert.deepStrictEqual(parseImageFilename("MAT-000003-2.webp"), { mat: "MAT-000003", position: 2 });
    assert.deepStrictEqual(parseImageFilename("MAT-000003.webp"), { mat: "MAT-000003", position: 1 });

    const cliBase = ["--input", input, "--db", dbPath, "--apply", "--confirm-apply"];
    // A canonical, unique list parses; repeated and malformed entries reject.
    assert.deepStrictEqual([...parseArgs([...cliBase, "--only", "MAT-000003,MAT-000002"]).only], ["MAT-000003", "MAT-000002"]);
    assert.throws(() => parseArgs([...cliBase, "--only", "MAT-000003,MAT-000003"]), /duplicate MAT/);
    assert.throws(() => parseArgs([...cliBase, "--only", "MAT-000003", "--only", "MAT-000003"]), /must not be repeated/);
    assert.throws(() => parseArgs([...cliBase, "--only", "MAT-3"]), /MAT-xxxxxx/);
    assert.throws(() => parseArgs([...cliBase, "--only"]), /requires a value/);
    assert.throws(() => parseArgs(["--input", input, "--db", dbPath, "--apply"]), /confirm-apply/);
    assert.throws(() => assertSafeApply(path.join(root, ".local-audit", "matmix-prod-snapshot.db")), /forbidden/);
    assert.throws(() => parseArgs(["--input", input, "--db", dbPath, "--cleanup-input"]), /requires --apply/);
    assert.throws(() => parseArgs(["--input", input, "--db", dbPath, "--apply", "--confirm-apply", "--allow-real-overwrite"]), /requires --only/);

    const beforeDryRun = await snapshot(db);
    const dry = await planBatch({ input, dbPath, uploadsRoot: uploads });
    assert.strictEqual(dry.summary.ready, 2);
    assert.strictEqual(dry.summary.protected, 1);
    assert.strictEqual(dry.items.find(item => item.position === 2).role, "GALLERY");
    assert.deepStrictEqual(await fs.promises.readdir(uploads), []);
    assert.deepStrictEqual(await snapshot(db), beforeDryRun, "dry-run must leave database rows unchanged");

    // A strict target set must match all input MATs: subsets, supersets and absent scopes cannot apply.
    const mismatchInput = path.join(root, "mismatch-input");
    await fs.promises.mkdir(mismatchInput);
    await fs.promises.copyFile(path.join(primaryInput, "MAT-000003.png"), path.join(mismatchInput, "MAT-000003.png"));
    await createPng(path.join(mismatchInput, "MAT-000004.png"), 500, 500, "#abcdef");
    const subsetPlan = await planBatch({ input: mismatchInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    await assert.rejects(() => applyPlan(subsetPlan, { dbPath, uploadsRoot: uploads }), /exactly match MATs/);
    const supersetPlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003", "MAT-000004"]) });
    await assert.rejects(() => applyPlan(supersetPlan, { dbPath, uploadsRoot: uploads }), /exactly match MATs/);
    const noScopePlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads });
    await assert.rejects(() => applyPlan(noScopePlan, { dbPath, uploadsRoot: uploads }), /exact --only scope/);
    const galleryPlan = await planBatch({ input, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003", "MAT-000002"]) });
    await assert.rejects(() => applyPlan(galleryPlan, { dbPath, uploadsRoot: uploads }), /only primary image bindings/);

    // Changed product image_url or primary product_images binding since dry-run aborts inside BEGIN IMMEDIATE.
    let stalePlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    await run(db, "UPDATE products SET image_url='/uploads/products/unexpected-real.webp' WHERE id=1");
    await assert.rejects(() => applyPlan(stalePlan, { dbPath, uploadsRoot: uploads }), /state changed since dry-run/);
    assert.deepStrictEqual(await fs.promises.readdir(uploads), [], "stale product state must not produce output files");
    await run(db, "UPDATE products SET image_url=? WHERE id=1", [placeholder]);

    stalePlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    await run(db, "UPDATE product_images SET image_url='/uploads/products/unexpected-primary.webp' WHERE product_id=1 AND is_primary=1");
    await assert.rejects(() => applyPlan(stalePlan, { dbPath, uploadsRoot: uploads }), /state changed since dry-run/);
    assert.deepStrictEqual(await fs.promises.readdir(uploads), [], "stale primary binding must not produce output files");
    await run(db, "UPDATE product_images SET image_url=? WHERE product_id=1 AND is_primary=1", [placeholder]);

    await run(db, "UPDATE products SET image_url='/uploads/products/already-real.webp' WHERE id=1");
    const unexpectedRealPlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    assert.strictEqual(unexpectedRealPlan.items[0].status, "REAL_IMAGE_EXISTS");
    await assert.rejects(() => applyPlan(unexpectedRealPlan, { dbPath, uploadsRoot: uploads }), /non-READY items/);
    await run(db, "UPDATE products SET image_url=? WHERE id=1", [placeholder]);

    const beforeApplyProduct = await get(db, "SELECT * FROM products WHERE id=1");
    const beforeApplyOtherProduct = await get(db, "SELECT * FROM products WHERE id=2");
    const beforeApplyBinding = await get(db, "SELECT * FROM product_images WHERE product_id=1 AND is_primary=1");
    const applyPlanData = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    const applyResult = await applyPlan(applyPlanData, { dbPath, uploadsRoot: uploads });
    assert.ok(fs.existsSync(applyResult.backupPath));
    assert.ok(applyResult.backupSize > 1024);
    assert.match(applyResult.backupSha256, /^[a-f0-9]{64}$/);
    assert.strictEqual(applyResult.backupUserVersion, 11);
    const preApplyDb = await open(applyResult.backupPath);
    assert.strictEqual((await get(preApplyDb, "SELECT image_url FROM products WHERE id=1")).image_url, placeholder, "online backup must finish before apply transaction");
    assert.strictEqual((await get(preApplyDb, "PRAGMA integrity_check")).integrity_check, "ok");
    assert.deepStrictEqual(await all(preApplyDb, "PRAGMA foreign_key_check"), []);
    await close(preApplyDb);
    const afterApplyProduct = await get(db, "SELECT * FROM products WHERE id=1");
    assert.deepStrictEqual({ ...afterApplyProduct, image_url: beforeApplyProduct.image_url }, beforeApplyProduct, "only products.image_url may change; title and updated_at remain untouched");
    assert.deepStrictEqual(await get(db, "SELECT * FROM products WHERE id=2"), beforeApplyOtherProduct, "other MAT must remain unchanged");
    const afterApplyBinding = await get(db, "SELECT * FROM product_images WHERE product_id=1 AND is_primary=1");
    assert.strictEqual(afterApplyBinding.image_url, afterApplyProduct.image_url);
    for (const key of ["id", "product_id", "alt_text", "sort_order", "is_primary", "created_at", "updated_at"]) assert.strictEqual(afterApplyBinding[key], beforeApplyBinding[key], `primary binding ${key} must remain unchanged`);
    const renderedMeta = await sharp(path.join(uploads, path.basename(afterApplyProduct.image_url))).metadata();
    assert.strictEqual(renderedMeta.format, "webp");
    assert.strictEqual(renderedMeta.width, 1200);
    assert.strictEqual(renderedMeta.height, 1200);

    // Existing real image is not overwritten without explicit overwrite authorization.
    const afterRealPlan = await planBatch({ input: primaryInput, dbPath, uploadsRoot: uploads, only: new Set(["MAT-000003"]) });
    assert.strictEqual(afterRealPlan.items[0].status, "REAL_IMAGE_EXISTS");
    await assert.rejects(() => applyPlan(afterRealPlan, { dbPath, uploadsRoot: uploads }), /non-READY items/);

    // Explicit allow-real-overwrite remains limited to the exact target set; cleanup remains opt-in.
    const cleanupInput = path.join(root, "cleanup-input");
    await fs.promises.mkdir(cleanupInput);
    await fs.promises.copyFile(path.join(primaryInput, "MAT-000003.png"), path.join(cleanupInput, "MAT-000003.png"));
    const cleanupPlan = await planBatch({ input: cleanupInput, dbPath, uploadsRoot: uploads, allowRealOverwrite: true, only: new Set(["MAT-000003"]) });
    await applyPlan(cleanupPlan, { dbPath, uploadsRoot: uploads, cleanupInput: true });
    assert.strictEqual(fs.existsSync(path.join(cleanupInput, "MAT-000003.png")), false);

    // A failure on the second product rolls the whole DB batch back and removes created files.
    const rollbackInput = path.join(root, "rollback-input");
    const rollbackUploads = path.join(root, "rollback-uploads");
    const rollbackDbPath = path.join(root, "rollback.db");
    await fs.promises.mkdir(rollbackInput);
    let rollbackDb = await open(rollbackDbPath);
    await run(rollbackDb, "PRAGMA user_version=11");
    await run(rollbackDb, "CREATE TABLE products(id INTEGER PRIMARY KEY,external_id TEXT UNIQUE,title TEXT,image_url TEXT,updated_at TEXT)");
    await run(rollbackDb, "CREATE TABLE product_images(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER REFERENCES products(id),image_url TEXT,alt_text TEXT,sort_order INTEGER,is_primary INTEGER,created_at TEXT,updated_at TEXT)");
    await run(rollbackDb, "INSERT INTO products VALUES(1,'MAT-000003','One',?,NULL)", [placeholder]);
    await run(rollbackDb, "INSERT INTO products VALUES(2,'MAT-000004','Two',?,NULL)", [placeholder]);
    await run(rollbackDb, "INSERT INTO product_images(product_id,image_url,is_primary) VALUES(1,?,1)", [placeholder]);
    await run(rollbackDb, "INSERT INTO product_images(product_id,image_url,is_primary) VALUES(2,?,1)", [placeholder]);
    await run(rollbackDb, "CREATE TRIGGER fail_update AFTER UPDATE ON products WHEN NEW.id=2 BEGIN SELECT RAISE(ABORT,'intentional'); END");
    await close(rollbackDb);
    await createPng(path.join(rollbackInput, "MAT-000003.png"));
    await createPng(path.join(rollbackInput, "MAT-000004.png"), 500, 500, "#abcdef");
    const rollbackPlan = await planBatch({ input: rollbackInput, dbPath: rollbackDbPath, uploadsRoot: rollbackUploads, only: new Set(["MAT-000003", "MAT-000004"]) });
    await assert.rejects(() => applyPlan(rollbackPlan, { dbPath: rollbackDbPath, uploadsRoot: rollbackUploads, cleanupInput: true }), /intentional/);
    assert.ok(fs.existsSync(path.join(rollbackInput, "MAT-000003.png")));
    assert.ok(fs.existsSync(path.join(rollbackInput, "MAT-000004.png")));
    assert.deepStrictEqual(await fs.promises.readdir(rollbackUploads), [], "rollback removes newly-created output files");
    rollbackDb = await open(rollbackDbPath);
    assert.strictEqual((await get(rollbackDb, "SELECT image_url FROM products WHERE id=1")).image_url, placeholder);
    assert.strictEqual((await get(rollbackDb, "SELECT image_url FROM products WHERE id=2")).image_url, placeholder);
    assert.strictEqual((await get(rollbackDb, "SELECT image_url FROM product_images WHERE product_id=1 AND is_primary=1")).image_url, placeholder);
    await close(rollbackDb);

    await close(db);
    console.log("import-product-images tests: OK");
})().catch(error => { console.error(error); process.exitCode = 1; });
