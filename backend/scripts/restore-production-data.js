const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBackup, verifyBackup, verifyDatabase, verifyReferences, runtimePaths, isInside } = require("../services/productionBackup");

async function copyTree(source, target) {
    await fs.promises.mkdir(target, { recursive: true });
    for (const entry of await fs.promises.readdir(source, { withFileTypes: true })) {
        const src = path.join(source, entry.name); const dst = path.join(target, entry.name); const stat = await fs.promises.lstat(src);
        if (stat.isSymbolicLink()) throw new Error("Restore refuses symbolic links.");
        if (stat.isDirectory()) await copyTree(src, dst); else if (stat.isFile()) await fs.promises.copyFile(src, dst, fs.constants.COPYFILE_EXCL);
    }
}

async function restore(backupPath, options = {}) {
    const paths = options.paths || runtimePaths(); const verified = await verifyBackup(backupPath); const source = path.resolve(backupPath);
    if (isInside(paths.uploadsPath, source) || source === path.resolve(paths.dbPath) || source === path.resolve(paths.uploadsPath)) throw new Error("Backup source conflicts with runtime targets.");
    if (!options.apply) return { success: true, dryRun: true, backupPath: source, references: verified.references };
    if (options.confirm !== "RESTORE_MATMIX_DATA") throw new Error("Apply requires --confirm RESTORE_MATMIX_DATA.");
    if (fs.existsSync(paths.lockPath)) throw new Error(`Application runtime lock exists: ${paths.lockPath}`);

    const emergency = await createBackup({ paths, prefix: "pre-restore", skipRetention: true });
    const token = crypto.randomBytes(4).toString("hex"); const stageDb = `${paths.dbPath}.restore-${token}.tmp`; const stageUploads = `${paths.uploadsPath}.restore-${token}.tmp`; const oldDb = `${paths.dbPath}.restore-${token}.old`; const oldUploads = `${paths.uploadsPath}.restore-${token}.old`;
    let dbSwapped = false; let uploadsSwapped = false;
    try {
        await fs.promises.copyFile(path.join(source, "database", "matmix.db"), stageDb, fs.constants.COPYFILE_EXCL); await copyTree(path.join(source, "uploads", "products"), stageUploads); await verifyDatabase(stageDb);
        if (options.failAt === "before-swap") throw new Error("Injected restore failure before swap.");
        await fs.promises.rename(paths.dbPath, oldDb); await fs.promises.rename(stageDb, paths.dbPath); dbSwapped = true;
        if (options.failAt === "after-db") throw new Error("Injected restore failure after DB swap.");
        if (fs.existsSync(paths.uploadsPath)) await fs.promises.rename(paths.uploadsPath, oldUploads);
        await fs.promises.rename(stageUploads, paths.uploadsPath); uploadsSwapped = true;
        if (options.failAt === "after-uploads") throw new Error("Injected restore failure after uploads swap.");
        await verifyDatabase(paths.dbPath); const references = await verifyReferences(paths.dbPath, paths.uploadsPath);
        await fs.promises.rm(oldDb, { force: true }); await fs.promises.rm(oldUploads, { recursive: true, force: true });
        const report = { success: true, restoredAt: new Date().toISOString(), source, emergencyBackup: emergency.backupPath, references };
        await fs.promises.writeFile(path.join(paths.backupRoot, `restore-report-${Date.now()}.json`), `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" }); return report;
    } catch (error) {
        if (uploadsSwapped) await fs.promises.rm(paths.uploadsPath, { recursive: true, force: true });
        if (fs.existsSync(oldUploads)) await fs.promises.rename(oldUploads, paths.uploadsPath);
        if (dbSwapped) await fs.promises.rm(paths.dbPath, { force: true });
        if (fs.existsSync(oldDb)) await fs.promises.rename(oldDb, paths.dbPath);
        await fs.promises.rm(stageDb, { force: true }); await fs.promises.rm(stageUploads, { recursive: true, force: true }); throw error;
    }
}

async function main() {
    const args = process.argv.slice(2); const backupPath = args.find(arg => !arg.startsWith("--") && arg !== "RESTORE_MATMIX_DATA"); if (!backupPath) throw new Error("Usage: <backup-path> [--dry-run | --apply --confirm RESTORE_MATMIX_DATA]");
    const apply = args.includes("--apply"); const confirmIndex = args.indexOf("--confirm"); const result = await restore(backupPath, { apply, confirm: confirmIndex >= 0 ? args[confirmIndex + 1] : "" });
    console.log(result.dryRun ? "Restore dry-run verified; no data changed." : "Restore completed."); console.log(JSON.stringify(result));
}
if (require.main === module) main().catch(error => { console.error(`Restore failed: ${error.message}`); console.log(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
module.exports = { restore };
