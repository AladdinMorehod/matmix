const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, error => error ? reject(error) : resolve())); }
async function waitFor(url) { for (let i = 0; i < 80; i += 1) { try { const response = await fetch(url); if (response.ok) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("Server did not become healthy."); }
async function stop(child) { child.kill("SIGTERM"); return new Promise((resolve, reject) => { const timer = setTimeout(() => reject(new Error("Graceful shutdown timed out.")), 35000); child.once("exit", (code, signal) => { clearTimeout(timer); code === 0 || (process.platform === "win32" && code === null) ? resolve({ code, signal }) : reject(new Error(`Server exited ${code || signal}`)); }); }); }
(async () => {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "matmix-lifecycle-")); const project = path.resolve(__dirname, "..", "..");
    try {
        const dbPath = path.join(root, "matmix.db"); const sourceDb = new sqlite3.Database(path.join(__dirname, "..", "database", "matmix.db"), sqlite3.OPEN_READONLY); await run(sourceDb, `VACUUM INTO '${dbPath.replace(/'/g, "''")}'`); await new Promise(resolve => sourceDb.close(resolve));
        const db = new sqlite3.Database(dbPath); const now = new Date().toISOString(); await run(db, "DELETE FROM users"); await run(db, "INSERT INTO users(login,password_hash,role,name,is_active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)", ["lifecycle_admin", await bcrypt.hash("Lifecycle!234", 10), "admin", "Lifecycle Admin", now, now]); await new Promise(resolve => db.close(resolve));
        const port = 45100 + Math.floor(Math.random() * 300); const base = `http://127.0.0.1:${port}`; const lock = path.join(root, "app.lock");
        const env = { ...process.env, NODE_ENV: "test", PORT: String(port), SESSION_SECRET: "lifecycle-test-secret-123456789012345678901234", MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(root, "sessions.db"), PRODUCT_UPLOADS_PATH: path.join(root, "uploads"), BACKUP_ROOT_PATH: path.join(root, "backups"), APP_RUNTIME_LOCK_PATH: lock, PUBLIC_BASE_URL: base, SEO_ALLOW_INDEXING: "false" };
        const start = () => spawn(process.execPath, [path.join(project, "backend", "server.js")], { cwd: project, env, windowsHide: true, stdio: "ignore" });
        let child = start(); await waitFor(`${base}/health`); const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: JSON.stringify({ login: "lifecycle_admin", password: "Lifecycle!234" }) }); const cookie = login.headers.get("set-cookie")?.split(";")[0]; if (!login.ok || !cookie) throw new Error("Fixture login failed.");
        await stop(child); const gracefulSignalSupported = process.platform !== "win32"; if (gracefulSignalSupported && fs.existsSync(lock)) throw new Error("Runtime lock remained after SIGTERM."); if (!gracefulSignalSupported) fs.rmSync(lock, { force: true });
        child = start(); await waitFor(`${base}/health`); const me = await fetch(`${base}/api/auth/me`, { headers: { Cookie: cookie } }); if (!me.ok) throw new Error("Session did not survive restart."); await stop(child);
        console.log(JSON.stringify({ success: true, gracefulSigterm: gracefulSignalSupported ? true : "requires Linux CI", lockRemoved: gracefulSignalSupported ? true : "requires Linux CI", sessionPersistence: true }));
    } finally { await fs.promises.rm(root, { recursive: true, force: true }); }
})().catch(error => { console.error(error); process.exitCode = 1; });
