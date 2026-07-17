const path = require("path");
const { spawn } = require("child_process");

async function waitForHealth(url) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
        try { if ((await fetch(url)).ok) return; } catch { /* server is still starting */ }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error("E2E test server did not become healthy.");
}

module.exports = async function globalSetup() {
    const root = path.resolve(__dirname, "..");
    const child = spawn(process.execPath, [path.join(__dirname, "test-server.js")], {
        cwd: root,
        windowsHide: true,
        stdio: ["ignore", "inherit", "inherit", "ipc"]
    });
    const exited = new Promise((resolve, reject) => child.once("exit", code => code ? reject(new Error(`E2E test server exited with code ${code}.`)) : resolve()));
    await Promise.race([waitForHealth("http://127.0.0.1:4173/health"), exited]);

    return async () => {
        if (child.exitCode !== null || child.signalCode !== null) return exited;
        child.send("shutdown");
        await exited;
    };
};
