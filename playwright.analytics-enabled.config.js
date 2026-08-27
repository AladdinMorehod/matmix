const base = require("./playwright.config");
process.env.MATMIX_E2E_YANDEX_METRIKA_ID = "12345678";
process.env.ANALYTICS_E2E_ENABLED = "1";
module.exports = { ...base, testDir: "./e2e", globalSetup: "./e2e/global-setup-analytics-enabled.js" };
