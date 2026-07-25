const { createBackup, verifyBackup, runtimePaths, verifyReferences } = require("../services/productionBackup");
const { auditOrderAttachments } = require("../services/orderAttachmentAudit");

async function main() {
    const args = process.argv.slice(2);
    if (args[0] === "--verify-only") {
        if (!args[1]) throw new Error("Usage: --verify-only <backup-path>");
        const result = await verifyBackup(args[1]); console.log(`Backup verified: ${result.backupPath}`); console.log(JSON.stringify(result)); return;
    }
    if (args.includes("--dry-run")) {
        const paths = runtimePaths(); const references = await verifyReferences(paths.dbPath, paths.uploadsPath);
        const attachments = await auditOrderAttachments({ dbPath: paths.dbPath, attachmentsPath: paths.attachmentsPath });
        const result = { success: attachments.healthy, dryRun: true, database: paths.dbPath, uploads: paths.uploadsPath, attachmentsPath: paths.attachmentsPath, backupRoot: paths.backupRoot, references, attachments };
        console.log("Backup dry-run completed; no files created."); console.log(JSON.stringify(result)); return;
    }
    const result = await createBackup(); console.log(`Backup created: ${result.backupPath}`); console.log(JSON.stringify(result));
}
main().catch(error => { console.error(`Backup failed: ${error.message}`); console.log(JSON.stringify({ success: false, error: error.message })); process.exitCode = 1; });
