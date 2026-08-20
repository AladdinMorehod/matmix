const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createBackup, verifyBackup, verifyDatabase, verifyReferences, verifyCatalogImportArea, runtimePaths, isInside } = require("../services/productionBackup");
const { auditOrderAttachments } = require("../services/orderAttachmentAudit");

async function copyTree(source, target) {
    await fs.promises.mkdir(target, { recursive: true });
    for (const entry of await fs.promises.readdir(source, { withFileTypes: true })) {
        const src = path.join(source, entry.name); const dst = path.join(target, entry.name); const stat = await fs.promises.lstat(src);
        if (stat.isSymbolicLink()) throw new Error("Restore refuses symbolic links.");
        if (stat.isDirectory()) await copyTree(src, dst); else if (stat.isFile()) await fs.promises.copyFile(src, dst, fs.constants.COPYFILE_EXCL);
    }
}

async function runRecoveryStep(name, operation, errors, options = {}) {
    try {
        if (options.failRollbackAt === name) throw new Error(`Injected rollback failure: ${name}`);
        await operation();
    } catch (error) {
        errors.push({ name, message: error.message });
    }
}

async function restoreFileArea(current, old, swapped) {
    if (fs.existsSync(old)) {
        await fs.promises.rm(current, { force: true });
        await fs.promises.rename(old, current);
    } else if (swapped) {
        await fs.promises.rm(current, { force: true });
    }
}

async function restoreDirectoryArea(current, old, swapped) {
    if (fs.existsSync(old)) {
        await fs.promises.rm(current, { recursive: true, force: true });
        await fs.promises.rename(old, current);
    } else if (swapped) {
        await fs.promises.rm(current, { recursive: true, force: true });
    }
}

function rollbackFailure(originalError, rollbackErrors) {
    const detail = rollbackErrors.map(item => `${item.name}: ${item.message}`).join("; ");
    const error = new Error(`${originalError.message}; rollback failures: ${detail}`);
    error.code = "RESTORE_ROLLBACK_INCOMPLETE";
    error.cause = originalError;
    error.rollbackErrors = rollbackErrors;
    return error;
}

async function restore(backupPath, options = {}) {
    const paths = options.paths || runtimePaths(); const verified = await verifyBackup(backupPath); const source = path.resolve(backupPath);
    if (isInside(paths.uploadsPath, source) || isInside(paths.attachmentsPath, source) || isInside(paths.catalogImportsPath, source) || source === path.resolve(paths.dbPath) || source === path.resolve(paths.uploadsPath) || source === path.resolve(paths.attachmentsPath) || source === path.resolve(paths.catalogImportsPath)) throw new Error("Backup source conflicts with runtime targets.");
    const restoreCatalogImports = verified.manifest.formatVersion >= 3;
    if (!options.apply) return { success: true, dryRun: true, backupPath: source, references: verified.references, attachments: verified.attachments, catalogImports: verified.catalogImports, catalogImportsRestored: restoreCatalogImports };
    if (options.confirm !== "RESTORE_MATMIX_DATA") throw new Error("Apply requires --confirm RESTORE_MATMIX_DATA.");
    if (fs.existsSync(paths.lockPath)) throw new Error(`Application runtime lock exists: ${paths.lockPath}`);

    const emergency = await createBackup({ paths, prefix: "pre-restore", skipRetention: true });
    const token = crypto.randomBytes(4).toString("hex"); const stageDb = `${paths.dbPath}.restore-${token}.tmp`; const stageUploads = `${paths.uploadsPath}.restore-${token}.tmp`; const stageAttachments = `${paths.attachmentsPath}.restore-${token}.tmp`; const stageCatalogImports = `${paths.catalogImportsPath}.restore-${token}.tmp`; const oldDb = `${paths.dbPath}.restore-${token}.old`; const oldUploads = `${paths.uploadsPath}.restore-${token}.old`; const oldAttachments = `${paths.attachmentsPath}.restore-${token}.old`; const oldCatalogImports = `${paths.catalogImportsPath}.restore-${token}.old`;
    let dbSwapped = false; let uploadsSwapped = false; let attachmentsSwapped = false; let catalogImportsSwapped = false;
    let report;
    let reportPath = "";
    try {
        await fs.promises.mkdir(path.dirname(paths.dbPath), { recursive: true });
        await fs.promises.mkdir(path.dirname(paths.uploadsPath), { recursive: true });
        await fs.promises.mkdir(path.dirname(paths.attachmentsPath), { recursive: true });
        if (restoreCatalogImports) await fs.promises.mkdir(path.dirname(paths.catalogImportsPath), { recursive: true });
        await fs.promises.copyFile(path.join(source, "database", "matmix.db"), stageDb, fs.constants.COPYFILE_EXCL);
        await copyTree(path.join(source, "uploads", "products"), stageUploads);
        if (verified.manifest.formatVersion === 2) await copyTree(path.join(source, "attachments", "orders"), stageAttachments);
        else if (verified.manifest.formatVersion >= 3) await copyTree(path.join(source, "attachments", "orders"), stageAttachments);
        else await fs.promises.mkdir(stageAttachments, { recursive: true, mode: 0o700 });
        if (restoreCatalogImports) {
            await copyTree(path.join(source, "catalog-imports"), stageCatalogImports);
            if (typeof options.afterCatalogImportsStaged === "function") {
                await options.afterCatalogImportsStaged({ stageCatalogImports, manifest: verified.manifest.catalogImports });
            }
            await verifyCatalogImportArea(stageCatalogImports, verified.manifest.catalogImports);
        }
        await verifyDatabase(stageDb);
        const stagedAttachments = await auditOrderAttachments({ dbPath: stageDb, attachmentsPath: stageAttachments });
        if (!stagedAttachments.healthy) throw new Error("Staged attachment audit failed.");
        if (options.failAt === "before-swap") throw new Error("Injected restore failure before swap.");
        await fs.promises.rename(paths.dbPath, oldDb); await fs.promises.rename(stageDb, paths.dbPath); dbSwapped = true;
        if (options.failAt === "after-db") throw new Error("Injected restore failure after DB swap.");
        if (fs.existsSync(paths.uploadsPath)) await fs.promises.rename(paths.uploadsPath, oldUploads);
        await fs.promises.rename(stageUploads, paths.uploadsPath); uploadsSwapped = true;
        if (options.failAt === "after-uploads") throw new Error("Injected restore failure after uploads swap.");
        if (fs.existsSync(paths.attachmentsPath)) await fs.promises.rename(paths.attachmentsPath, oldAttachments);
        await fs.promises.rename(stageAttachments, paths.attachmentsPath); attachmentsSwapped = true;
        if (options.failAt === "after-attachments") throw new Error("Injected restore failure after attachment swap.");
        if (restoreCatalogImports) {
            if (fs.existsSync(paths.catalogImportsPath)) await fs.promises.rename(paths.catalogImportsPath, oldCatalogImports);
            await fs.promises.rename(stageCatalogImports, paths.catalogImportsPath); catalogImportsSwapped = true;
            if (typeof options.afterCatalogImportsSwapped === "function") {
                await options.afterCatalogImportsSwapped({ catalogImportsPath: paths.catalogImportsPath, manifest: verified.manifest.catalogImports });
            }
            await verifyCatalogImportArea(paths.catalogImportsPath, verified.manifest.catalogImports);
            if (options.failAt === "after-catalog-imports") throw new Error("Injected restore failure after catalog import archive swap.");
        }
        await verifyDatabase(paths.dbPath); const references = await verifyReferences(paths.dbPath, paths.uploadsPath);
        const attachments = await auditOrderAttachments({ dbPath: paths.dbPath, attachmentsPath: paths.attachmentsPath });
        if (!attachments.healthy) throw new Error("Restored attachment audit failed.");
        report = { success: true, restoredAt: new Date().toISOString(), source, emergencyBackup: emergency.backupPath, references, attachments, catalogImports: verified.catalogImports, catalogImportsRestored: restoreCatalogImports, cleanupWarnings: [] };
        const writeReport = options.writeReport || fs.promises.writeFile;
        reportPath = path.join(paths.backupRoot, `restore-report-${Date.now()}-${token}.json`);
        await writeReport(reportPath, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    } catch (error) {
        const rollbackErrors = [];
        await runRecoveryStep("catalog-imports", () => restoreDirectoryArea(paths.catalogImportsPath, oldCatalogImports, catalogImportsSwapped), rollbackErrors, options);
        await runRecoveryStep("attachments", () => restoreDirectoryArea(paths.attachmentsPath, oldAttachments, attachmentsSwapped), rollbackErrors, options);
        await runRecoveryStep("uploads", () => restoreDirectoryArea(paths.uploadsPath, oldUploads, uploadsSwapped), rollbackErrors, options);
        await runRecoveryStep("database", () => restoreFileArea(paths.dbPath, oldDb, dbSwapped), rollbackErrors, options);
        await runRecoveryStep("staged-database", () => fs.promises.rm(stageDb, { force: true }), rollbackErrors);
        await runRecoveryStep("staged-uploads", () => fs.promises.rm(stageUploads, { recursive: true, force: true }), rollbackErrors);
        await runRecoveryStep("staged-attachments", () => fs.promises.rm(stageAttachments, { recursive: true, force: true }), rollbackErrors);
        await runRecoveryStep("staged-catalog-imports", () => fs.promises.rm(stageCatalogImports, { recursive: true, force: true }), rollbackErrors);
        await runRecoveryStep("restore-report", () => reportPath ? fs.promises.rm(reportPath, { force: true }) : Promise.resolve(), rollbackErrors);
        if (rollbackErrors.length) throw rollbackFailure(error, rollbackErrors);
        throw error;
    }

    // The restore is committed once all swaps, verification and the mandatory
    // report have succeeded. Cleanup below is deliberately non-rollback-able.
    for (const [name, target, recursive] of [
        ["database", oldDb, false],
        ["uploads", oldUploads, true],
        ["attachments", oldAttachments, true],
        ["catalog-imports", oldCatalogImports, true]
    ]) {
        if (name === "catalog-imports" && !restoreCatalogImports) continue;
        try {
            if (options.failCleanupAt === name) throw new Error(`Injected cleanup failure: ${name}`);
            await fs.promises.rm(target, { recursive, force: true });
        } catch (error) {
            const warning = `${name}: ${error.message}`;
            report.cleanupWarnings.push(warning);
            console.warn(`Restore cleanup warning: ${warning}`);
        }
    }
    return report;
}

async function main() {
    const args = process.argv.slice(2); const backupPath = args.find(arg => !arg.startsWith("--") && arg !== "RESTORE_MATMIX_DATA"); if (!backupPath) throw new Error("Usage: <backup-path> [--dry-run | --apply --confirm RESTORE_MATMIX_DATA]");
    const apply = args.includes("--apply"); const confirmIndex = args.indexOf("--confirm"); const result = await restore(backupPath, { apply, confirm: confirmIndex >= 0 ? args[confirmIndex + 1] : "" });
    console.log(result.dryRun ? "Restore dry-run verified; no data changed." : "Restore completed."); console.log(JSON.stringify(result));
}
if (require.main === module) main().catch(error => { console.error(`Restore failed: ${error.message}`); console.log(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
module.exports = { restore };
