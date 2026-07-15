const assert = require("assert");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { createBackup, verifyBackup, verifyDatabase, sha256 } = require("../services/productionBackup");
const { restore } = require("./restore-production-data");

function dbRun(file, sql, params = []) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file); db.run(sql, params, error => db.close(() => error ? reject(error) : resolve())); }); }
function dbGet(file, sql) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY); db.get(sql, (error, row) => db.close(() => error ? reject(error) : resolve(row))); }); }
async function expectFailure(work, pattern) { let error; try { await work(); } catch (caught) { error = caught; } assert(error && pattern.test(error.message), `Expected failure ${pattern}, got ${error?.message}`); }
async function copyDir(source, target) { await fs.promises.mkdir(target, { recursive: true }); for (const entry of await fs.promises.readdir(source, { withFileTypes: true })) { const src = path.join(source, entry.name); const dst = path.join(target, entry.name); if (entry.isDirectory()) await copyDir(src, dst); else if (entry.isFile()) await fs.promises.copyFile(src, dst); } }

async function main() {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-backup-test-"));
    const paths = { dbPath: path.join(root, "runtime", "matmix.db"), uploadsPath: path.join(root, "runtime", "uploads"), backupRoot: path.join(root, "backups"), lockPath: path.join(root, "runtime", "app.lock"), retentionCount: 2 };
    await fs.promises.mkdir(path.dirname(paths.dbPath), { recursive: true }); await fs.promises.copyFile(path.join(__dirname, "..", "database", "matmix.db"), paths.dbPath); await copyDir(path.join(__dirname, "..", "..", "public", "uploads", "products"), paths.uploadsPath);
    const baseline = { products: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM products")).count, orders: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM orders")).count, clients: (await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM clients")).count, dbHash: await sha256(paths.dbPath) };
    const backup = await createBackup({ paths }); const verified = await verifyBackup(backup.backupPath); assert(verified.success);
    await dbRun(paths.dbPath, "DELETE FROM products WHERE id=(SELECT MAX(id) FROM products)"); await fs.promises.writeFile(path.join(paths.uploadsPath, "unrelated-test.txt"), "changed");
    const restored = await restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA" }); assert(restored.success);
    assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM products")).count, baseline.products); assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM orders")).count, baseline.orders); assert.strictEqual((await dbGet(paths.dbPath, "SELECT COUNT(*) count FROM clients")).count, baseline.clients); assert(!fs.existsSync(path.join(paths.uploadsPath, "unrelated-test.txt"))); await verifyDatabase(paths.dbPath);

    const corruptDb = path.join(root, "corrupt-db"); await copyDir(backup.backupPath, corruptDb); await fs.promises.appendFile(path.join(corruptDb, "database", "matmix.db"), "x"); await expectFailure(() => verifyBackup(corruptDb), /checksum/i);
    const corruptUpload = path.join(root, "corrupt-upload"); await copyDir(backup.backupPath, corruptUpload); const upload = verified.manifest.uploads.files[0]; if (upload) { await fs.promises.appendFile(path.join(corruptUpload, "uploads", "products", upload.relativePath), "x"); await expectFailure(() => verifyBackup(corruptUpload), /checksum/i); }
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
    await fs.promises.writeFile(paths.lockPath, "running"); await expectFailure(() => restore(backup.backupPath, { paths, apply: true, confirm: "RESTORE_MATMIX_DATA" }), /lock/i); await fs.promises.rm(paths.lockPath);
    if (process.platform !== "win32" && verified.manifest.uploads.files[0]) { const symlinkBackup = path.join(root, "symlink"); await copyDir(backup.backupPath, symlinkBackup); const rel = verified.manifest.uploads.files[0].relativePath; await fs.promises.rm(path.join(symlinkBackup, "uploads", "products", rel)); await fs.promises.symlink(paths.dbPath, path.join(symlinkBackup, "uploads", "products", rel)); await expectFailure(() => verifyBackup(symlinkBackup), /symbolic|checksum|unsafe/i); }
    console.log(JSON.stringify({ success: true, baseline, backupUploads: verified.manifest.uploads.count, restore: "ok", rollback: "ok", corruption: "ok", malformedManifest: "ok", traversal: "ok", absolutePath: "ok", missingAndExtraUploads: "ok", confirmation: "ok", lock: "ok", symlink: process.platform === "win32" ? "skipped-windows" : "ok", emergencyBackup: path.basename(restored.emergencyBackup) }));
    await fs.promises.rm(root, { recursive: true, force: true });
}
main().catch(error => { console.error(error); process.exitCode = 1; });
