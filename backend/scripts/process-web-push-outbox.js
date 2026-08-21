const { runtimePaths } = require("../services/productionBackup");
const { loadWebPushConfig } = require("../services/webPush");
const { processWebPushOutbox } = require("../services/webPushWorker");
const { sanitizeError } = require("../services/orderEmailWorker");

async function main() {
    const config = loadWebPushConfig();
    const summary = await processWebPushOutbox({ databasePath: runtimePaths().dbPath, config });
    console.log(JSON.stringify(summary));
}

main().catch(error => { console.error(sanitizeError(error)); process.exitCode = 1; });
