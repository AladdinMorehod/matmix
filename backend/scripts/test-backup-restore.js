const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const { migrateDatabase } = require("../databaseMigrations");
const { createBackup, verifyBackup, verifyDatabase, sha256 } = require("../services/productionBackup");
const { restore } = require("./restore-production-data");

function dbRun(file, sql, params = []) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.run(sql, params, function done(error) { const result = { lastID: this?.lastID, changes: this?.changes }; db.close(() => error ? reject(error) : resolve(result)); }); }); }
function dbGet(file, sql, params = []) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY); db.get(sql, params, (error, row) => db.close(() => error ? reject(error) : resolve(row))); }); }
async function expectFailure(work, pattern) { let error; try { await work(); } catch (caught) { error = caught; } assert(error && pattern.test(error.message), `Expected failure ${pattern}, got ${error?.message}`); }
async function copyDir(source, target) { await fs.promises.mkdir(target, { recursive: true }); for (const entry of await fs.promises.readdir(source, { withFileTypes: true })) { const src = path.join(source, entry.name); const dst = path.join(target, entry.name); if (entry.isDirectory()) await copyDir(src, dst); else if (entry.isFile()) await fs.promises.copyFile(src, dst); } }
async function snapshotTree(root) { const files = []; async function walk(current, prefix = "") { for (const entry of await fs.promises.readdir(current, { withFileTypes: true })) { const relative = prefix ? `${prefix}/${entry.name}` : entry.name; const target = path.join(current, entry.name); if (entry.isDirectory()) await walk(target, relative); else if (entry.isFile()) { const stat = await fs.promises.stat(target); files.push({ relative, size: stat.size, sha256: await sha256(target) }); } } } await walk(root); return files.sort((left, right) => left.relative.localeCompare(right.relative)); }
async function snapshotRuntime(paths) { return { database: await sha256(paths.dbPath), uploads: await snapshotTree(paths.uploadsPath), attachments: await snapshotTree(paths.attachmentsPath), catalogImports: await snapshotTree(paths.catalogImportsPath) }; }
async function waitForServer(url) { for (let attempt = 0; attempt < 120; attempt += 1) { try { if ((await fetch(url)).ok) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Restored CRM test server did not start."); }
async function stopServer(child) { if (!child || child.exitCode !== null) return; child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-backup-test-"));
    const paths = { dbPath: path.join(root, "runtime", "matmix.db"), uploadsPath: path.join(root, "runtime", "uploads"), attachmentsPath: path.join(root, "runtime", "attachments"), catalogImportsPath: path.join(root, "runtime", "catalog-imports"), backupRoot: path.join(root, "backups"), lockPath: path.join(root, "runtime", "app.lock"), retentionCount: 2 };
    await fs.promises.mkdir(path.dirname(paths.dbPath), { recursive: true });
    await fs.promises.mkdir(paths.uploadsPath, { recursive: true });
    await fs.promises.mkdir(paths.attachmentsPath, { recursive: true });
    await fs.promises.mkdir(paths.catalogImportsPath, { recursive: true });

    process.env.MATMIX_DB_PATH = paths.dbPath;
    const { initDatabase, db: initializationDb } = require("../database");
    await initDatabase();
    await new Promise((resolve, reject) => initializationDb.close(error => error ? reject(error) : resolve()));
    await migrateDatabase(paths.dbPath, { dryRun: false });

    const product = await dbRun(
        paths.dbPath,
        `INSERT INTO products (
            external_id, title, category, price, unit, image_url, description,
            brand, short_description, full_description, seo_title, seo_description,
            is_active, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
            "MAT-BACKUP-001",
            "Тестовый товар резервного копирования",
            "Тестовая категория",
            1000,
            "шт",
            "/uploads/products/test-product-image.txt",
            "Legacy backup description",
            "Backup Brand",
            "Короткое описание",
            "Полное описание",
            "SEO заголовок",
            "SEO описание"
        ]
    );

    await fs.promises.writeFile(
        path.join(paths.uploadsPath, "test-product-image.txt"),
        "deterministic backup upload fixture"
    );
    const structure = await dbRun(paths.dbPath, `INSERT INTO catalog_structure
        (type,name,normalized_name,external_code,parent_id,sort_order,is_active,is_system,created_at,updated_at)
        VALUES('category','Backup category','backup category','CAT-BACKUP',NULL,999,1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
    const definition = await dbRun(paths.dbPath, `INSERT INTO product_attribute_definitions
        (code,label,data_type,default_unit,default_section,sort_order,is_active,created_at,updated_at)
        VALUES('backup_value','Backup value','text','шт','Backup section',1,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
    await dbRun(paths.dbPath, `INSERT INTO product_attribute_templates
        (structure_id,attribute_definition_id,sort_order,is_required,created_at,updated_at)
        VALUES(?,?,1,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [structure.lastID, definition.lastID]);
    await dbRun(paths.dbPath, `INSERT INTO product_attribute_values
        (product_id,attribute_definition_id,value_text,sort_order,created_at,updated_at)
        VALUES(?,?,?,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [product.lastID, definition.lastID, "Preserved value"]);
    await dbRun(paths.dbPath, `INSERT INTO product_images
        (product_id,image_url,alt_text,sort_order,is_primary,created_at,updated_at)
        VALUES(?,?,?,0,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`, [product.lastID, "/uploads/products/test-product-image.txt", "Backup image"]);
    const catalogImportName = "catalog-import-20260101T000000-0123456789abcdef.xlsx";
    const catalogImportBody = Buffer.from("deterministic catalog import archive fixture");
    await fs.promises.writeFile(path.join(paths.catalogImportsPath, catalogImportName), catalogImportBody);
    await fs.promises.writeFile(path.join(paths.catalogImportsPath, ".catalog-import-0011223344556677.tmp"), "incomplete archive must not enter backup");
    const password = "BackupRestore!234";
    const backupUser = await dbRun(paths.dbPath, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["backup_admin", await bcrypt.hash(password, 10), "admin", "Backup Admin", new Date().toISOString(), new Date().toISOString()]);
    const order = await dbRun(paths.dbPath, "INSERT INTO orders(customer_name,phone,items_json,created_at,updated_at,request_type) VALUES(?,?,?,?,?,'file_request')", ["Backup fixture", "+70000000000", "[]", new Date().toISOString(), new Date().toISOString()]);
    const outboxCreatedAt = new Date().toISOString();
    await dbRun(paths.dbPath, `INSERT INTO order_email_outbox(event_key,order_id,event_type,status,attempt_count,next_attempt_at,created_at,updated_at)
        VALUES(?,?,'new_order','pending',0,?,?,?)`, [`new_order:${order.lastID}`, order.lastID, outboxCreatedAt, outboxCreatedAt, outboxCreatedAt]);
    const pushSubscription = await dbRun(paths.dbPath, "INSERT INTO web_push_subscriptions(user_id,endpoint,p256dh,auth,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", [backupUser.lastID, "https://push.test/backup", "backup-key", "backup-auth", outboxCreatedAt, outboxCreatedAt]);
    await dbRun(paths.dbPath, "INSERT INTO web_push_outbox(event_key,order_id,subscription_id,status,attempt_count,next_attempt_at,created_at,updated_at) VALUES(?,?,?,'pending',0,?,?,?)", [`new_order:${order.lastID}:${pushSubscription.lastID}`, order.lastID, pushSubscription.lastID, outboxCreatedAt, outboxCreatedAt, outboxCreatedAt]);
    await dbRun(paths.dbPath, "INSERT INTO order_notification_reads(user_id,order_id,read_at) VALUES(?,?,?)", [backupUser.lastID, order.lastID, new Date().toISOString()]);
    const attachmentBody = Buffer.from("deterministic private attachment fixture");
    const storageKey = `${crypto.randomBytes(32).toString("hex")}.txt`;
    const attachmentSha = crypto.createHash("sha256").update(attachmentBody).digest("hex");
    await fs.promises.writeFile(path.join(paths.attachmentsPath, storageKey), attachmentBody);
    await dbRun(paths.dbPath, "INSERT INTO order_attachments(order_id,original_name,storage_key,mime_type,extension,size_bytes,sha256,created_at) VALUES(?,?,?,?,?,?,?,?)", [order.lastID, "Заявка на материалы.txt", storageKey, "text/plain", "txt", attachmentBody.length, attachmentSha, new Date().toISOString()]);
    const additionalAttachments = [
        { key: `${crypto.randomBytes(32).toString("hex")}.pdf`, name: "План.pdf", mime: "application/pdf", extension: "pdf", body: Buffer.from("%PDF-1.4 backup fixture") },
        { key: `${crypto.randomBytes(32).toString("hex")}.xlsx`, name: "Смета.xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx", body: Buffer.from("xlsx backup fixture") }
    ];
    for (const fixture of additionalAttachments) {
        const digest = crypto.createHash("sha256").update(fixture.body).digest("hex");
        await fs.promises.writeFile(path.join(paths.attachmentsPath, fixture.key), fixture.body);
        await dbRun(paths.dbPath, "INSERT INTO order_attachments(order_id,original_name,storage_key,mime_type,extension,size_bytes,sha256,created_at) VALUES(?,?,?,?,?,?,?,?)", [order.lastID, fixture.name, fixture.key, fixture.mime, fixture.extension, fixture.body.length, digest, new Date().toISOString()]);
    }
    const baseline = { products: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM products")).count, orders: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM orders")).count, clients: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM clients")).count, dbHash: await sha256(paths.dbPath) };
    const backup = await createBackup({ paths }); const verified = await verifyBackup(backup.backupPath); assert(verified.success); assert.strictEqual(verified.catalogImports.fileCount, 1);
    const rehearsal = spawnSync(process.execPath, [path.join(__dirname, "rehearse-offsite-restore.js"), "--local-source", backup.backupPath], { cwd: path.resolve(__dirname, "..", ".."), encoding: "utf8" });
    assert.strictEqual(rehearsal.status, 0, String(rehearsal.stderr || rehearsal.stdout));
    await dbRun(paths.dbPath, "DELETE FROM product_attribute_values WHERE product_id=?", [product.lastID]);
    await dbRun(paths.dbPath, "DELETE FROM product_images WHERE product_id=?", [product.lastID]);
    await dbRun(paths.dbPath, "DELETE FROM products WHERE id=?", [product.lastID]); await fs.promises.writeFile(path.join(paths.uploadsPath, "unrelated-test.txt"), "changed");
    await dbRun(paths.dbPath, "DELETE FROM order_notification_reads");
    await dbRun(paths.dbPath, "DELETE FROM order_email_outbox");
    await dbRun(paths.dbPath, "DELETE FROM web_push_outbox");
    await dbRun(paths.dbPath, "DELETE FROM web_push_subscriptions");
    await dbRun(paths.dbPath, "DELETE FROM order_attachments");
    await fs.promises.rm(path.join(paths.attachmentsPath, storageKey));
    for (const fixture of additionalAttachments) await fs.promises.rm(path.join(paths.attachmentsPath, fixture.key));
    await fs.promises.rm(path.join(paths.catalogImportsPath, catalogImportName));
    await fs.promises.writeFile(path.join(paths.catalogImportsPath, "catalog-import-20260102T000000-fedcba9876543210.xlsx"), "not in backup");
    const restored = await restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA" }); assert(restored.success); assert.strictEqual(restored.catalogImportsRestored, true);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM products")).count, baseline.products); assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM orders")).count, baseline.orders); assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM clients")).count, baseline.clients); assert(!fs.existsSync(path.join(paths.uploadsPath, "unrelated-test.txt"))); await verifyDatabase(paths.dbPath);
    assert.deepStrictEqual(await dbGet(paths.dbPath, `SELECT brand,short_description,full_description,seo_title,seo_description
        FROM products WHERE id=?`, [product.lastID]), {
        brand: "Backup Brand", short_description: "Короткое описание", full_description: "Полное описание",
        seo_title: "SEO заголовок", seo_description: "SEO описание"
    });
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM product_attribute_definitions WHERE id=?", [definition.lastID])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM product_attribute_templates WHERE attribute_definition_id=? AND structure_id=?", [definition.lastID, structure.lastID])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT value_text FROM product_attribute_values WHERE product_id=?", [product.lastID])).value_text, "Preserved value");
    assert.deepStrictEqual(await dbGet(paths.dbPath, "SELECT image_url,is_primary FROM product_images WHERE product_id=?", [product.lastID]), { image_url: "/uploads/products/test-product-image.txt", is_primary: 1 });
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM order_notification_reads WHERE user_id=? AND order_id=?", [backupUser.lastID, order.lastID])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM order_email_outbox WHERE event_key=? AND order_id=?", [`new_order:${order.lastID}`, order.lastID])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM web_push_subscriptions WHERE endpoint=?", ["https://push.test/backup"])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM web_push_outbox WHERE event_key=?", [`new_order:${order.lastID}:${pushSubscription.lastID}`])).count, 1);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM order_attachments")).count, 3); assert.strictEqual(await sha256(path.join(paths.attachmentsPath, storageKey)), attachmentSha);
    assert.deepStrictEqual(await fs.promises.readdir(paths.catalogImportsPath), [catalogImportName]); assert.deepStrictEqual(await fs.promises.readFile(path.join(paths.catalogImportsPath, catalogImportName)), catalogImportBody);

    const beforeStagedCorruption = await snapshotRuntime(paths);
    let stagedCorruptionInjected = false;
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", afterCatalogImportsStaged: async ({ stageCatalogImports, manifest }) => { stagedCorruptionInjected = true; await fs.promises.appendFile(path.join(stageCatalogImports, manifest.files[0].relativePath), "staged corruption"); } }), /catalog import archive checksum/i);
    assert.strictEqual(stagedCorruptionInjected, true); assert.deepStrictEqual(await snapshotRuntime(paths), beforeStagedCorruption); assert(!(await fs.promises.readdir(path.dirname(paths.dbPath))).some(name => name.includes(".restore-") && name.endsWith(".old")));

    const beforeActiveCorruption = await snapshotRuntime(paths);
    let activeCorruptionInjected = false;
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", afterCatalogImportsSwapped: async ({ catalogImportsPath, manifest }) => { activeCorruptionInjected = true; await fs.promises.appendFile(path.join(catalogImportsPath, manifest.files[0].relativePath), "active corruption"); } }), /catalog import archive checksum/i);
    assert.strictEqual(activeCorruptionInjected, true); assert.deepStrictEqual(await snapshotRuntime(paths), beforeActiveCorruption);

    const corruptDb = path.join(root, "corrupt-db"); await copyDir(backup.backupPath, corruptDb); await fs.promises.appendFile(path.join(corruptDb, "database", "matmix.db"), "x"); await expectFailure(() => verifyBackup(corruptDb), /checksum/i);
    const corruptUpload = path.join(root, "corrupt-upload"); await copyDir(backup.backupPath, corruptUpload); const upload = verified.manifest.uploads.files[0]; if (upload) { await fs.promises.appendFile(path.join(corruptUpload, "uploads", "products", upload.relativePath), "x"); await expectFailure(() => verifyBackup(corruptUpload), /checksum/i); }
    const corruptAttachment = path.join(root, "corrupt-attachment"); await copyDir(backup.backupPath, corruptAttachment); await fs.promises.appendFile(path.join(corruptAttachment, "attachments", "orders", storageKey), "x"); await expectFailure(() => verifyBackup(corruptAttachment), /attachment checksum/i);
    const missingAttachment = path.join(root, "missing-attachment"); await copyDir(backup.backupPath, missingAttachment); await fs.promises.rm(path.join(missingAttachment, "attachments", "orders", storageKey)); await expectFailure(() => verifyBackup(missingAttachment), /ENOENT|no such file/i);
    const extraAttachment = path.join(root, "extra-attachment"); await copyDir(backup.backupPath, extraAttachment); await fs.promises.writeFile(path.join(extraAttachment, "attachments", "orders", "orphan.txt"), "x"); await expectFailure(() => verifyBackup(extraAttachment), /unlisted attachment/i);
    const attachmentTraversal = path.join(root, "attachment-traversal"); await copyDir(backup.backupPath, attachmentTraversal); const attachmentTraversalManifest = JSON.parse(await fs.promises.readFile(path.join(attachmentTraversal, "manifest.json"))); attachmentTraversalManifest.attachments.files[0].relativePath = "../outside"; await fs.promises.writeFile(path.join(attachmentTraversal, "manifest.json"), JSON.stringify(attachmentTraversalManifest)); await expectFailure(() => verifyBackup(attachmentTraversal), /traversal|unsafe/i);
    const attachmentAbsolute = path.join(root, "attachment-absolute"); await copyDir(backup.backupPath, attachmentAbsolute); const attachmentAbsoluteManifest = JSON.parse(await fs.promises.readFile(path.join(attachmentAbsolute, "manifest.json"))); attachmentAbsoluteManifest.attachments.files[0].relativePath = path.resolve(paths.attachmentsPath, storageKey); await fs.promises.writeFile(path.join(attachmentAbsolute, "manifest.json"), JSON.stringify(attachmentAbsoluteManifest)); await expectFailure(() => verifyBackup(attachmentAbsolute), /unsafe/i);
    const attachmentTotals = path.join(root, "attachment-totals"); await copyDir(backup.backupPath, attachmentTotals); const attachmentTotalsManifest = JSON.parse(await fs.promises.readFile(path.join(attachmentTotals, "manifest.json"))); attachmentTotalsManifest.attachments.totalBytes += 1; await fs.promises.writeFile(path.join(attachmentTotals, "manifest.json"), JSON.stringify(attachmentTotalsManifest)); await expectFailure(() => verifyBackup(attachmentTotals), /totals/i);
    const corruptCatalogImport = path.join(root, "corrupt-catalog-import"); await copyDir(backup.backupPath, corruptCatalogImport); await fs.promises.appendFile(path.join(corruptCatalogImport, "catalog-imports", catalogImportName), "x"); await expectFailure(() => verifyBackup(corruptCatalogImport), /catalog import archive checksum/i);
    const missingCatalogImport = path.join(root, "missing-catalog-import"); await copyDir(backup.backupPath, missingCatalogImport); await fs.promises.rm(path.join(missingCatalogImport, "catalog-imports", catalogImportName)); await expectFailure(() => verifyBackup(missingCatalogImport), /ENOENT|no such file/i);
    const extraCatalogImport = path.join(root, "extra-catalog-import"); await copyDir(backup.backupPath, extraCatalogImport); await fs.promises.writeFile(path.join(extraCatalogImport, "catalog-imports", "extra.xlsx"), "x"); await expectFailure(() => verifyBackup(extraCatalogImport), /unlisted catalog import archive/i);
    const duplicateCatalogImport = path.join(root, "duplicate-catalog-import"); await copyDir(backup.backupPath, duplicateCatalogImport); const duplicateCatalogImportManifest = JSON.parse(await fs.promises.readFile(path.join(duplicateCatalogImport, "manifest.json"))); duplicateCatalogImportManifest.catalogImports.files.push({ ...duplicateCatalogImportManifest.catalogImports.files[0] }); duplicateCatalogImportManifest.catalogImports.fileCount += 1; duplicateCatalogImportManifest.catalogImports.totalBytes += duplicateCatalogImportManifest.catalogImports.files[0].size; await fs.promises.writeFile(path.join(duplicateCatalogImport, "manifest.json"), JSON.stringify(duplicateCatalogImportManifest)); await expectFailure(() => verifyBackup(duplicateCatalogImport), /duplicate catalog import archive/i);
    const catalogImportTraversal = path.join(root, "catalog-import-traversal"); await copyDir(backup.backupPath, catalogImportTraversal); const catalogImportTraversalManifest = JSON.parse(await fs.promises.readFile(path.join(catalogImportTraversal, "manifest.json"))); catalogImportTraversalManifest.catalogImports.files[0].relativePath = "../outside.xlsx"; await fs.promises.writeFile(path.join(catalogImportTraversal, "manifest.json"), JSON.stringify(catalogImportTraversalManifest)); await expectFailure(() => verifyBackup(catalogImportTraversal), /traversal|unsafe/i);
    const catalogImportAbsolute = path.join(root, "catalog-import-absolute"); await copyDir(backup.backupPath, catalogImportAbsolute); const catalogImportAbsoluteManifest = JSON.parse(await fs.promises.readFile(path.join(catalogImportAbsolute, "manifest.json"))); catalogImportAbsoluteManifest.catalogImports.files[0].relativePath = path.resolve(paths.catalogImportsPath, catalogImportName); await fs.promises.writeFile(path.join(catalogImportAbsolute, "manifest.json"), JSON.stringify(catalogImportAbsoluteManifest)); await expectFailure(() => verifyBackup(catalogImportAbsolute), /unsafe/i);
    const catalogImportTotals = path.join(root, "catalog-import-totals"); await copyDir(backup.backupPath, catalogImportTotals); const catalogImportTotalsManifest = JSON.parse(await fs.promises.readFile(path.join(catalogImportTotals, "manifest.json"))); catalogImportTotalsManifest.catalogImports.totalBytes += 1; await fs.promises.writeFile(path.join(catalogImportTotals, "manifest.json"), JSON.stringify(catalogImportTotalsManifest)); await expectFailure(() => verifyBackup(catalogImportTotals), /totals/i);
    const catalogImportTemp = path.join(root, "catalog-import-temp"); await copyDir(backup.backupPath, catalogImportTemp); const catalogImportTempName = ".catalog-import-ffeeddccbbaa0099.tmp"; const catalogImportTempPath = path.join(catalogImportTemp, "catalog-imports", catalogImportTempName); await fs.promises.writeFile(catalogImportTempPath, "complete bytes with a forbidden temp filename"); const catalogImportTempManifest = JSON.parse(await fs.promises.readFile(path.join(catalogImportTemp, "manifest.json"))); const catalogImportTempStat = await fs.promises.stat(catalogImportTempPath); catalogImportTempManifest.catalogImports.files.push({ relativePath: catalogImportTempName, size: catalogImportTempStat.size, sha256: await sha256(catalogImportTempPath) }); catalogImportTempManifest.catalogImports.fileCount += 1; catalogImportTempManifest.catalogImports.totalBytes += catalogImportTempStat.size; await fs.promises.writeFile(path.join(catalogImportTemp, "manifest.json"), JSON.stringify(catalogImportTempManifest)); await expectFailure(() => verifyBackup(catalogImportTemp), /not a finalized archive/i);
    const previousV2 = path.join(root, "previous-v2"); await copyDir(backup.backupPath, previousV2); const previousV2Manifest = JSON.parse(await fs.promises.readFile(path.join(previousV2, "manifest.json"))); previousV2Manifest.formatVersion = 2; delete previousV2Manifest.catalogImports; await fs.promises.rm(path.join(previousV2, "catalog-imports"), { recursive: true }); await fs.promises.writeFile(path.join(previousV2, "manifest.json"), JSON.stringify(previousV2Manifest)); assert((await verifyBackup(previousV2)).success);
    const legacyPreservedName = "catalog-import-20260103T000000-aabbccddeeff0011.xlsx"; const legacyPreservedBody = Buffer.from("must survive legacy restore"); await fs.promises.writeFile(path.join(paths.catalogImportsPath, legacyPreservedName), legacyPreservedBody); const archiveBeforeLegacyRestore = new Map(await Promise.all((await fs.promises.readdir(paths.catalogImportsPath)).map(async name => [name, await fs.promises.readFile(path.join(paths.catalogImportsPath, name))]))); const restoredV2 = await restore(previousV2, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA" }); assert.strictEqual(restoredV2.catalogImportsRestored, false); assert.deepStrictEqual(new Set(await fs.promises.readdir(paths.catalogImportsPath)), new Set(archiveBeforeLegacyRestore.keys())); for (const [name, body] of archiveBeforeLegacyRestore) assert.deepStrictEqual(await fs.promises.readFile(path.join(paths.catalogImportsPath, name)), body);
    const legacyIncomplete = path.join(root, "legacy-incomplete"); await copyDir(backup.backupPath, legacyIncomplete); const legacyManifest = JSON.parse(await fs.promises.readFile(path.join(legacyIncomplete, "manifest.json"))); legacyManifest.formatVersion = 1; delete legacyManifest.attachments; await fs.promises.writeFile(path.join(legacyIncomplete, "manifest.json"), JSON.stringify(legacyManifest)); await expectFailure(() => verifyBackup(legacyIncomplete), /legacy backup is incomplete/i);
    const legacyEmpty = path.join(root, "legacy-empty"); await copyDir(backup.backupPath, legacyEmpty); const legacyDb = path.join(legacyEmpty, "database", "matmix.db"); await dbRun(legacyDb, "DELETE FROM order_attachments"); const legacyEmptyManifest = JSON.parse(await fs.promises.readFile(path.join(legacyEmpty, "manifest.json"))); legacyEmptyManifest.formatVersion = 1; delete legacyEmptyManifest.attachments; legacyEmptyManifest.database.size = (await fs.promises.stat(legacyDb)).size; legacyEmptyManifest.database.sha256 = await sha256(legacyDb); await fs.promises.rm(path.join(legacyEmpty, "attachments"), { recursive: true }); await fs.promises.writeFile(path.join(legacyEmpty, "manifest.json"), JSON.stringify(legacyEmptyManifest)); assert((await verifyBackup(legacyEmpty)).success);
    const traversal = path.join(root, "traversal"); await copyDir(backup.backupPath, traversal); const traversalManifest = JSON.parse(await fs.promises.readFile(path.join(traversal, "manifest.json"))); traversalManifest.database.filename = "../matmix.db"; await fs.promises.writeFile(path.join(traversal, "manifest.json"), JSON.stringify(traversalManifest)); await expectFailure(() => verifyBackup(traversal), /traversal|unsafe/i);
    const version = path.join(root, "version"); await copyDir(backup.backupPath, version); const versionManifest = JSON.parse(await fs.promises.readFile(path.join(version, "manifest.json"))); versionManifest.formatVersion = 999; await fs.promises.writeFile(path.join(version, "manifest.json"), JSON.stringify(versionManifest)); await expectFailure(() => verifyBackup(version), /unsupported/i);
    const extra = path.join(root, "extra"); await copyDir(backup.backupPath, extra); await fs.promises.writeFile(path.join(extra, "uploads", "products", "extra.txt"), "x"); await expectFailure(() => verifyBackup(extra), /unlisted/i);
    const malformed = path.join(root, "malformed"); await copyDir(backup.backupPath, malformed); await fs.promises.writeFile(path.join(malformed, "manifest.json"), "{broken"); await expectFailure(() => verifyBackup(malformed), /JSON|position|property/i);
    const absolute = path.join(root, "absolute"); await copyDir(backup.backupPath, absolute); const absoluteManifest = JSON.parse(await fs.promises.readFile(path.join(absolute, "manifest.json"))); absoluteManifest.database.filename = path.resolve(paths.dbPath); await fs.promises.writeFile(path.join(absolute, "manifest.json"), JSON.stringify(absoluteManifest)); await expectFailure(() => verifyBackup(absolute), /unsafe/i);
    if (upload) { const missing = path.join(root, "missing"); await copyDir(backup.backupPath, missing); await fs.promises.rm(path.join(missing, "uploads", "products", upload.relativePath)); await expectFailure(() => verifyBackup(missing), /ENOENT|no such file/i); }
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "WRONG" }), /confirm/i);
    await expectFailure(() => createBackup({ paths: { ...paths, backupRoot: path.join(paths.uploadsPath, "backups") } }), /inside uploads/i);
    const beforeRollback = await sha256(paths.dbPath); await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failAt: "after-db" }), /injected/i); assert.strictEqual(await sha256(paths.dbPath), beforeRollback);
    await new Promise(resolve => setTimeout(resolve, 1100));
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failAt: "after-uploads" }), /injected/i); assert.strictEqual(await sha256(paths.dbPath), beforeRollback);
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failAt: "after-attachments" }), /injected/i); assert.strictEqual(await sha256(paths.dbPath), beforeRollback); assert.strictEqual(await sha256(path.join(paths.attachmentsPath, storageKey)), attachmentSha);
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failAt: "after-catalog-imports" }), /injected/i); assert.strictEqual(await sha256(paths.dbPath), beforeRollback); assert.strictEqual(await sha256(path.join(paths.catalogImportsPath, catalogImportName)), await sha256(path.join(backup.backupPath, "catalog-imports", catalogImportName)));
    await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", writeReport: async () => { const error = new Error("Injected restore report ENOSPC"); error.code = "ENOSPC"; throw error; } }), /restore report ENOSPC/i); assert.strictEqual(await sha256(paths.dbPath), beforeRollback); assert.deepStrictEqual(new Set(await fs.promises.readdir(paths.catalogImportsPath)), new Set(archiveBeforeLegacyRestore.keys()));
    const cleanupWarningResult = await restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failCleanupAt: "catalog-imports" }); assert.strictEqual(cleanupWarningResult.success, true); assert(cleanupWarningResult.cleanupWarnings.some(message => message.includes("catalog-imports"))); assert.deepStrictEqual(await fs.promises.readFile(path.join(paths.catalogImportsPath, catalogImportName)), catalogImportBody);
    for (const name of await fs.promises.readdir(path.dirname(paths.catalogImportsPath))) if (/^catalog-imports\.restore-.*\.old$/.test(name)) await fs.promises.rm(path.join(path.dirname(paths.catalogImportsPath), name), { recursive: true, force: true });
    await dbRun(paths.dbPath, "UPDATE products SET title=title || ' [rollback marker]' WHERE id=(SELECT MIN(id) FROM products)"); const rollbackDbHash = await sha256(paths.dbPath); const rollbackUploadName = "rollback-marker.txt"; await fs.promises.writeFile(path.join(paths.uploadsPath, rollbackUploadName), "rollback marker"); const rollbackArchiveName = "catalog-import-20260104T000000-1122334455667788.xlsx"; await fs.promises.writeFile(path.join(paths.catalogImportsPath, rollbackArchiveName), "rollback archive marker"); let rollbackFailureError; try { await restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA", failAt: "after-catalog-imports", failRollbackAt: "catalog-imports" }); } catch (error) { rollbackFailureError = error; } assert.strictEqual(rollbackFailureError?.code, "RESTORE_ROLLBACK_INCOMPLETE"); assert(rollbackFailureError.rollbackErrors.some(item => item.name === "catalog-imports")); assert.strictEqual(await sha256(paths.dbPath), rollbackDbHash); assert(fs.existsSync(path.join(paths.uploadsPath, rollbackUploadName))); const archiveParent = path.dirname(paths.catalogImportsPath); const failedArchiveOld = (await fs.promises.readdir(archiveParent)).find(name => /^catalog-imports\.restore-.*\.old$/.test(name)); assert(failedArchiveOld, "Failed archive rollback must leave an explicit recovery source"); await fs.promises.rm(paths.catalogImportsPath, { recursive: true, force: true }); await fs.promises.rename(path.join(archiveParent, failedArchiveOld), paths.catalogImportsPath);
    await fs.promises.writeFile(paths.lockPath, "running"); await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA" }), /lock/i); await fs.promises.rm(paths.lockPath);
    const port = 46300 + Math.floor(Math.random() * 200);
    const base = `http://127.0.0.1:${port}`;
    const server = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
        cwd: path.resolve(__dirname, "..", ".."),
        windowsHide: true,
        stdio: "ignore",
        env: { ...process.env, NODE_ENV: "test", PORT: String(port), SESSION_SECRET: "backup-restore-test-secret-12345678901234567890", MATMIX_DB_PATH: paths.dbPath, SESSION_DB_PATH: path.join(root, "sessions.db"), PRODUCT_UPLOADS_PATH: paths.uploadsPath, ORDER_ATTACHMENTS_PATH: paths.attachmentsPath, CATALOG_IMPORT_ARCHIVE_PATH: paths.catalogImportsPath, BACKUP_ROOT_PATH: paths.backupRoot, APP_RUNTIME_LOCK_PATH: paths.lockPath, PUBLIC_BASE_URL: base, SEO_ALLOW_INDEXING: "false" }
    });
    try {
        await waitForServer(`${base}/health`);
        const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login: "backup_admin", password }) });
        assert.strictEqual(login.status, 200);
        const cookie = login.headers.get("set-cookie").split(";")[0];
        const metadataResponse = await fetch(`${base}/api/orders/${order.lastID}/attachments`, { headers: { Cookie: cookie } });
        assert.strictEqual(metadataResponse.status, 200);
        const metadata = await metadataResponse.json();
        assert.strictEqual(metadata.attachments[0].originalName, "Заявка на материалы.txt");
        const download = await fetch(`${base}${metadata.attachments[0].downloadUrl}`, { headers: { Cookie: cookie } });
        assert.strictEqual(download.status, 200);
        assert.deepStrictEqual(Buffer.from(await download.arrayBuffer()), attachmentBody);
    } finally {
        await stopServer(server);
    }
    if (process.platform !== "win32" && verified.manifest.uploads.files[0]) { const symlinkBackup = path.join(root, "symlink"); await copyDir(backup.backupPath, symlinkBackup); const rel = verified.manifest.uploads.files[0].relativePath; await fs.promises.rm(path.join(symlinkBackup, "uploads", "products", rel)); await fs.promises.symlink(paths.dbPath, path.join(symlinkBackup, "uploads", "products", rel)); await expectFailure(() => verifyBackup(symlinkBackup), /symbolic|checksum|unsafe/i); const attachmentSymlink = path.join(root, "attachment-symlink"); await copyDir(backup.backupPath, attachmentSymlink); await fs.promises.rm(path.join(attachmentSymlink, "attachments", "orders", storageKey)); await fs.promises.symlink(paths.dbPath, path.join(attachmentSymlink, "attachments", "orders", storageKey)); await expectFailure(() => verifyBackup(attachmentSymlink), /symbolic|checksum|unsafe/i); const archiveSymlink = path.join(root, "catalog-import-symlink"); await copyDir(backup.backupPath, archiveSymlink); await fs.promises.rm(path.join(archiveSymlink, "catalog-imports", catalogImportName)); await fs.promises.symlink(paths.dbPath, path.join(archiveSymlink, "catalog-imports", catalogImportName)); await expectFailure(() => verifyBackup(archiveSymlink), /symbolic|checksum|unsafe/i); }
    const retentionBackups = [];
    for (let index = 0; index < 3; index += 1) retentionBackups.push(await createBackup({ paths }));
    const retained = (await fs.promises.readdir(paths.backupRoot)).filter(name => /^matmix-backup-/.test(name));
    assert.strictEqual(retained.length, 2);
    await fs.promises.appendFile(path.join(paths.attachmentsPath, storageKey), "changed");
    await expectFailure(() => createBackup({ paths }), /attachment audit failed/i);
    const afterFailedBackup = await fs.promises.readdir(paths.backupRoot);
    assert.strictEqual(afterFailedBackup.filter(name => /^matmix-backup-/.test(name)).length, 2);
    assert.strictEqual(afterFailedBackup.filter(name => name.includes(".tmp-")).length, 0);
    console.log(JSON.stringify({ success: true, baseline, backupUploads: verified.manifest.uploads.count, backupAttachments: verified.manifest.attachments.fileCount, backupCatalogImports: verified.manifest.catalogImports.fileCount, offsiteRehearsalOnTemporaryData: "ok", restore: "ok", crmMetadataAfterRestore: "ok", crmDownloadAfterRestore: "ok", rollback: "ok", corruption: "ok", attachmentCorruption: "ok", attachmentMissingAndExtra: "ok", attachmentManifestTraversalAndTotals: "ok", catalogImportCorruptionTraversalAndTotals: "ok", previousV2Accepted: "ok", legacyEmptyAccepted: "ok", legacyIncompleteRejected: "ok", malformedManifest: "ok", traversal: "ok", absolutePath: "ok", missingAndExtraUploads: "ok", retention: retained.length, failedBackupExcludedFromRetention: "ok", temporaryBackupCleanup: "ok", confirmation: "ok", lock: "ok", symlink: process.platform === "win32" ? "skipped-windows" : "ok", emergencyBackup: path.basename(restored.emergencyBackup) }));
    await fs.promises.rm(root, { recursive: true, force: true });
}
main().catch(error => { console.error(error); process.exitCode = 1; });
