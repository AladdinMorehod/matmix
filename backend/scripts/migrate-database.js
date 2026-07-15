const fs = require("fs");
const { runtimePaths } = require("../services/productionBackup");
const { migrateDatabase } = require("../databaseMigrations");

async function main() {
    const apply = process.argv.includes("--apply");
    const dryRun = process.argv.includes("--dry-run");
    const confirmation = process.argv[process.argv.indexOf("--confirm") + 1];
    if (apply === dryRun) throw new Error("Choose exactly one of --dry-run or --apply.");
    if (apply && confirmation !== "MIGRATE_MATMIX_DATABASE") throw new Error("Apply requires --confirm MIGRATE_MATMIX_DATABASE.");
    const paths = runtimePaths();
    if (apply && fs.existsSync(paths.lockPath)) throw new Error("Application runtime lock exists. Stop MatMix before migration.");
    const result = await migrateDatabase(paths.dbPath, { dryRun });
    console.log(JSON.stringify(result, null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
