const { runtimePaths } = require("../services/productionBackup");
const { auditOrderAttachments } = require("../services/orderAttachmentAudit");

async function main() {
    const args = process.argv.slice(2);
    if (args.some(argument => argument !== "--check" && argument !== "--json")) {
        throw new Error("Usage: audit-order-attachments.js [--check] [--json]");
    }
    const paths = runtimePaths();
    const report = await auditOrderAttachments({
        dbPath: paths.dbPath,
        attachmentsPath: paths.attachmentsPath
    });
    console.log(JSON.stringify(report, null, args.includes("--json") ? 0 : 2));
    if (args.includes("--check") && !report.healthy) process.exitCode = 2;
}

main().catch(error => {
    console.error(JSON.stringify({ healthy: false, error: error.message }));
    process.exitCode = 2;
});
