const { defineConfig, devices } = require("@playwright/test");
const isWindows = process.platform === "win32";

module.exports = defineConfig({
    testDir: "./e2e",
    timeout: 45000,
    expect: { timeout: 10000 },
    fullyParallel: false,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
    outputDir: "test-results",
    globalSetup: isWindows ? "./e2e/global-setup.js" : undefined,
    use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure", screenshot: "only-on-failure", video: "off" },
    webServer: isWindows ? undefined : { command: "node e2e/test-server.js", url: "http://127.0.0.1:4173/health", reuseExistingServer: false, timeout: 120000 },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"], ...(process.env.CI ? {} : { channel: "chrome" }) } },
        { name: "mobile-chromium", use: { ...devices["Pixel 5"], ...(process.env.CI ? {} : { channel: "chrome" }) } }
    ]
});
