const { runtimePaths } = require("../services/productionBackup");
const { CURRENT_SCHEMA_VERSION, openDatabase } = require("../databaseMigrations");
const {
    loadOrderEmailConfig,
    createOrderEmailTransport
} = require("../services/orderEmailTransport");
const {
    sanitizeError,
    processOrderEmailOutbox
} = require("../services/orderEmailWorker");

async function assertSchema(databasePath) {
    const db = await openDatabase(databasePath);
    try {
        const version = Number((await db.get("PRAGMA user_version")).user_version || 0);
        if (version !== CURRENT_SCHEMA_VERSION) {
            throw new Error(`Unsupported database schema ${version}; expected ${CURRENT_SCHEMA_VERSION}.`);
        }
    } finally {
        await db.close();
    }
}

async function main() {
    const config = loadOrderEmailConfig();
    const databasePath = runtimePaths().dbPath;
    await assertSchema(databasePath);
    const transport = createOrderEmailTransport(config);
    const summary = await processOrderEmailOutbox({
        databasePath,
        transport,
        from: config.from,
        to: config.to,
        sensitiveValues: [config.password]
    });
    console.log(JSON.stringify(summary));
}

main().catch(error => {
    console.error(sanitizeError(error));
    process.exitCode = 1;
});
