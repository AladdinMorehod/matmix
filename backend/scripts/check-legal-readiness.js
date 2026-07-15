const fs = require("fs");
const path = require("path");
const { readiness, LEGAL_PATHS } = require("../services/legal");

const root = path.resolve(__dirname, "..", "..");
const report = readiness();
report.pages = LEGAL_PATHS.map(url => ({ url, configured: fs.readFileSync(path.join(root, "backend", "routes", "seo.js"), "utf8").includes("LEGAL_PATHS") }));
report.footerLinks = ["index.html", "catalog.html"].every(file => LEGAL_PATHS.slice(0, 6).every(url => fs.readFileSync(path.join(root, "public", file), "utf8").includes(`href=\"${url}\"`)));
report.consentBackend = fs.readFileSync(path.join(root, "backend", "routes", "orders.js"), "utf8").includes("CONSENT_REQUIRED");
report.ready = report.ready && report.pages.every(page => page.configured) && report.footerLinks && report.consentBackend;
console.log(process.argv.includes("--json") ? JSON.stringify(report) : JSON.stringify(report, null, 2));
if (!report.ready) process.exitCode = 2;
