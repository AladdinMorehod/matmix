const { operationalReadiness } = require("../services/productionReadiness");

(async () => {
    const report = await operationalReadiness();
    report.manualGates = ["TLS certificate and HTTP-to-HTTPS redirect verified externally", "off-host encrypted backup confirmed", "monitoring and disk alerts enabled", "legal documents approved by owner and qualified counsel", "rollback rehearsal completed", "soft-launch audience and test-order procedure approved"];
    console.log(JSON.stringify(report, null, process.argv.includes("--json") ? 0 : 2));
    if (!report.ready) process.exitCode = 2;
})().catch(error => { console.error(JSON.stringify({ ready: false, error: { code: error.code || "PRODUCTION_CHECK_FAILED", message: error.message } })); process.exitCode = 2; });
