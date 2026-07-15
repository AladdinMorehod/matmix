const { spawnSync } = require("child_process");
const path = require("path");
const { operationalReadiness } = require("../services/productionReadiness");

const root = path.resolve(__dirname, "..", "..");
function run(label, args) { const result = spawnSync(process.execPath, args, { cwd: root, env: process.env, encoding: "utf8" }); return { label, ok: result.status === 0, exitCode: result.status, summary: String(result.stdout || result.stderr || "").trim().split(/\r?\n/).slice(-2).join(" ").slice(0, 1000) }; }
(async () => {
    const production = await operationalReadiness();
    const checks = [
        run("syntax", ["--check", "backend/server.js"]),
        run("legal", ["backend/scripts/check-legal-readiness.js", "--json"]),
        run("database-health", ["backend/scripts/check-database-health.js", "--json"]),
        run("xss", ["backend/scripts/test-xss-safety.js"]),
        run("seo", ["backend/scripts/test-seo.js"]),
        run("database-migration", ["backend/scripts/test-database-integrity.js"]),
        run("backup-restore", ["backend/scripts/test-backup-restore.js"]),
        run("images", ["backend/scripts/test-product-images.js"]),
        run("legal-consent", ["backend/scripts/test-legal.js"])
    ];
    if (process.argv.includes("--with-e2e")) checks.push({ label: "e2e", ...run("e2e", [path.join("node_modules", "@playwright", "test", "cli.js"), "test", "--project=chromium"]) });
    const manualGates = ["external encrypted backup", "TLS/DNS and reverse-proxy smoke", "monitoring alerts", "legal approval", "production access permissions", "rollback rehearsal", "24-48 hour soft-launch observation"];
    const ready = production.ready && checks.every(check => check.ok);
    console.log(JSON.stringify({ ready, production, checks, e2eIncluded: process.argv.includes("--with-e2e"), manualGates }, null, 2));
    if (!ready) process.exitCode = 2;
})().catch(error => { console.error(JSON.stringify({ ready: false, error: error.message })); process.exitCode = 2; });
