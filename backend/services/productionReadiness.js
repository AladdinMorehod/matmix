const fs = require("fs");
const path = require("path");
const { legalConfig, readiness: legalReadiness } = require("./legal");
const { runtimePaths, verifyBackup, verifyReferences, isInside } = require("./productionBackup");
const { CURRENT_SCHEMA_VERSION } = require("../databaseMigrations");

const REQUIRED_PRODUCTION_ENV = [
    "NODE_ENV", "PORT", "SESSION_SECRET", "SESSION_DB_PATH", "MATMIX_DB_PATH", "PRODUCT_UPLOADS_PATH",
    "BACKUP_ROOT_PATH", "BACKUP_RETENTION_COUNT", "BACKUP_MAX_AGE_HOURS", "APP_RUNTIME_LOCK_PATH",
    "PUBLIC_BASE_URL", "SEO_ALLOW_INDEXING", "SITE_NAME", "DEFAULT_OG_IMAGE", "CORS_ALLOWED_ORIGINS",
    "TRUST_PROXY", "LOGIN_RATE_WINDOW_MS", "LOGIN_RATE_MAX", "MIN_FREE_DISK_MB"
];

function splitOrigins(value) { return String(value || "").split(",").map(item => item.trim()).filter(Boolean); }
function isOrigin(value, https = false) {
    try { const parsed = new URL(value); return (!https || parsed.protocol === "https:") && ["http:", "https:"].includes(parsed.protocol) && parsed.origin === String(value).replace(/\/$/, ""); } catch { return false; }
}
function isAbsoluteSafeRuntimePath(value, projectRoot, publicRoot) {
    if (!value || !path.isAbsolute(value)) return false;
    const resolved = path.resolve(value);
    return !isInside(publicRoot, resolved) && !isInside(path.join(projectRoot, ".git"), resolved);
}
function numeric(env, name, min, max, errors) {
    const value = Number(env[name]);
    if (!Number.isFinite(value) || value < min || value > max) errors.push(`${name} must be between ${min} and ${max}.`);
    return value;
}
function validateProductionEnvironment(env = process.env, options = {}) {
    const projectRoot = path.resolve(options.projectRoot || path.join(__dirname, "..", ".."));
    const publicRoot = path.join(projectRoot, "public");
    const errors = []; const warnings = [];
    for (const name of REQUIRED_PRODUCTION_ENV) if (!String(env[name] || "").trim()) errors.push(`${name} is required.`);
    if (env.NODE_ENV !== "production") errors.push("NODE_ENV must be production.");
    if (String(env.SESSION_SECRET || "").length < 48) errors.push("SESSION_SECRET must contain at least 48 characters.");
    numeric(env, "PORT", 1, 65535, errors); numeric(env, "BACKUP_RETENTION_COUNT", 2, 365, errors);
    numeric(env, "BACKUP_MAX_AGE_HOURS", 1, 720, errors); numeric(env, "MIN_FREE_DISK_MB", 128, 1048576, errors);
    numeric(env, "LOGIN_RATE_WINDOW_MS", 1000, 86400000, errors); numeric(env, "LOGIN_RATE_MAX", 2, 1000, errors);
    if (!isOrigin(env.PUBLIC_BASE_URL, true)) errors.push("PUBLIC_BASE_URL must be an HTTPS origin without a path.");
    if (!/^(true|false)$/.test(String(env.SEO_ALLOW_INDEXING || ""))) errors.push("SEO_ALLOW_INDEXING must be true or false.");
    if (env.TRUST_PROXY !== "1") errors.push("TRUST_PROXY must be 1 behind the supported single reverse proxy.");
    const origins = splitOrigins(env.CORS_ALLOWED_ORIGINS);
    if (!origins.length || origins.some(origin => !isOrigin(origin, true))) errors.push("CORS_ALLOWED_ORIGINS must contain HTTPS origins only.");
    if (env.PUBLIC_BASE_URL && !origins.includes(String(env.PUBLIC_BASE_URL).replace(/\/$/, ""))) errors.push("CORS_ALLOWED_ORIGINS must include PUBLIC_BASE_URL.");
    for (const name of ["SESSION_DB_PATH", "MATMIX_DB_PATH", "PRODUCT_UPLOADS_PATH", "BACKUP_ROOT_PATH", "APP_RUNTIME_LOCK_PATH"]) {
        if (!isAbsoluteSafeRuntimePath(env[name], projectRoot, publicRoot)) errors.push(`${name} must be an absolute path outside public and .git.`);
    }
    const resolved = runtimePaths(env);
    if (isInside(resolved.uploadsPath, resolved.backupRoot) || isInside(resolved.backupRoot, resolved.uploadsPath)) errors.push("Uploads and backup paths must not contain each other.");
    const legal = legalReadiness(env); if (!legal.ready) errors.push("Legal configuration is incomplete; run npm run legal:check.");
    if (String(env.SEO_ALLOW_INDEXING) === "false") warnings.push("SEO indexing is disabled (appropriate only for intentional soft launch/staging).");
    return { ready: errors.length === 0, errors, warnings, publicBaseUrl: env.PUBLIC_BASE_URL || "", paths: { db: env.MATMIX_DB_PATH, sessions: env.SESSION_DB_PATH, uploads: env.PRODUCT_UPLOADS_PATH, backups: env.BACKUP_ROOT_PATH, lock: env.APP_RUNTIME_LOCK_PATH }, legalVersions: { privacy: legalConfig(env).privacyVersion, terms: legalConfig(env).termsVersion } };
}

function assertProductionEnvironment(env = process.env) {
    const result = validateProductionEnvironment(env);
    if (!result.ready) { const error = new Error(`Production configuration invalid:\n- ${result.errors.join("\n- ")}`); error.code = "PRODUCTION_CONFIG_INVALID"; throw error; }
    return result;
}

async function accessCheck(target, mode) { try { await fs.promises.access(target, mode); return true; } catch { return false; } }
async function diskFreeMb(target) {
    const stat = await fs.promises.statfs(path.dirname(target));
    return Math.floor(Number(stat.bavail) * Number(stat.bsize) / 1024 / 1024);
}
async function latestBackup(root) {
    if (!await accessCheck(root, fs.constants.R_OK)) return null;
    const candidates = [];
    for (const entry of await fs.promises.readdir(root, { withFileTypes: true })) if (entry.isDirectory() && /^matmix-backup-/.test(entry.name) && !entry.name.includes(".tmp-")) {
        const fullPath = path.join(root, entry.name); const manifestPath = path.join(fullPath, "manifest.json");
        try { const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8")); candidates.push({ path: fullPath, manifest, createdAt: new Date(manifest.createdAt) }); } catch { /* invalid candidates are not successful backups */ }
    }
    return candidates.filter(item => Number.isFinite(item.createdAt.getTime())).sort((a, b) => b.createdAt - a.createdAt)[0] || null;
}
async function operationalReadiness(env = process.env) {
    const config = validateProductionEnvironment(env); const checks = {}; const paths = runtimePaths(env);
    checks.databaseReadable = await accessCheck(paths.dbPath, fs.constants.R_OK);
    checks.databaseDirectoryWritable = await accessCheck(path.dirname(paths.dbPath), fs.constants.W_OK);
    checks.sessionDirectoryWritable = await accessCheck(path.dirname(path.resolve(env.SESSION_DB_PATH || "")), fs.constants.W_OK);
    checks.uploadsReadableWritable = await accessCheck(paths.uploadsPath, fs.constants.R_OK | fs.constants.W_OK);
    checks.backupReadableWritable = await accessCheck(paths.backupRoot, fs.constants.R_OK | fs.constants.W_OK);
    checks.lockDirectoryWritable = await accessCheck(path.dirname(paths.lockPath), fs.constants.W_OK);
    const minDisk = Number(env.MIN_FREE_DISK_MB) || 1024; const disk = {};
    for (const [name, target] of Object.entries({ database: paths.dbPath, uploads: path.join(paths.uploadsPath, ".probe"), backups: path.join(paths.backupRoot, ".probe") })) {
        try { disk[name] = await diskFreeMb(target); } catch { disk[name] = null; }
    }
    checks.diskSpace = Object.values(disk).every(value => value !== null && value >= minDisk);
    let schemaVersion = null; let foreignKeys = null;
    if (checks.databaseReadable) {
        const sqlite3 = require("sqlite3").verbose(); const db = new sqlite3.Database(paths.dbPath, sqlite3.OPEN_READONLY);
        try { await new Promise((resolve, reject) => db.run("PRAGMA foreign_keys=ON", e => e ? reject(e) : resolve())); schemaVersion = await new Promise((resolve, reject) => db.get("PRAGMA user_version", (e, row) => e ? reject(e) : resolve(Number(row.user_version)))); foreignKeys = await new Promise((resolve, reject) => db.get("PRAGMA foreign_keys", (e, row) => e ? reject(e) : resolve(Number(row.foreign_keys)))); }
        finally { await new Promise(resolve => db.close(resolve)); }
    }
    checks.schemaVersion = schemaVersion === CURRENT_SCHEMA_VERSION; checks.databaseConnection = schemaVersion !== null; checks.foreignKeysEnabled = foreignKeys === 1;
    const backup = await latestBackup(paths.backupRoot); let backupStatus = { exists: false, verified: false, ageHours: null, path: null, size: null };
    if (backup) {
        const ageHours = (Date.now() - backup.createdAt.getTime()) / 3600000; let verified = false;
        try { await verifyBackup(backup.path); verified = true; } catch { verified = false; }
        backupStatus = { exists: true, verified, ageHours: Number(ageHours.toFixed(2)), path: backup.path, size: backup.manifest?.database?.size || null };
    }
    checks.backupFresh = backupStatus.exists && backupStatus.verified && backupStatus.ageHours <= (Number(env.BACKUP_MAX_AGE_HOURS) || 36);
    let uploadReferences = null; try { uploadReferences = await verifyReferences(paths.dbPath, paths.uploadsPath); checks.uploadsValid = uploadReferences.unsafe.length === 0 && uploadReferences.missing.filter(x => x.active).length === 0; } catch { checks.uploadsValid = false; }
    const ready = config.ready && Object.values(checks).every(Boolean);
    return { ready, config, checks, schemaVersion, expectedSchemaVersion: CURRENT_SCHEMA_VERSION, foreignKeys, diskFreeMb: disk, minimumFreeDiskMb: minDisk, backup: backupStatus, uploads: uploadReferences && { missing: uploadReferences.missing.length, unsafe: uploadReferences.unsafe.length, orphans: uploadReferences.orphanFiles.length } };
}

module.exports = { REQUIRED_PRODUCTION_ENV, validateProductionEnvironment, assertProductionEnvironment, operationalReadiness, latestBackup, diskFreeMb };
