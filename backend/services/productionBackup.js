const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const FORMAT_VERSION = 1;
const TOOL_VERSION = "1.0.0";
const REQUIRED_TABLES = ["products", "catalog_structure", "clients", "orders", "users"];

function runtimePaths(env = process.env) {
    const projectRoot = path.resolve(__dirname, "..", "..");
    const dbPath = path.resolve(env.MATMIX_DB_PATH || path.join(projectRoot, "backend", "database", "matmix.db"));
    return {
        dbPath,
        uploadsPath: path.resolve(env.PRODUCT_UPLOADS_PATH || path.join(projectRoot, "public", "uploads", "products")),
        backupRoot: path.resolve(env.BACKUP_ROOT_PATH || path.join(path.dirname(dbPath), "production-backups")),
        lockPath: path.resolve(env.APP_RUNTIME_LOCK_PATH || path.join(path.dirname(dbPath), "matmix-runtime.lock")),
        retentionCount: Math.max(1, Number(env.BACKUP_RETENTION_COUNT) || 14)
    };
}

function isInside(parent, child) {
    const relative = path.relative(path.resolve(parent), path.resolve(child));
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function safeRelative(value) {
    if (typeof value !== "string" || !value || path.isAbsolute(value)) throw new Error("Manifest contains an unsafe path.");
    const normalized = value.replace(/\\/g, "/");
    if (normalized.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Manifest contains path traversal.");
    return normalized;
}

function sha256(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);
        stream.on("error", reject); stream.on("data", chunk => hash.update(chunk)); stream.on("end", () => resolve(hash.digest("hex")));
    });
}

function openDb(filePath, mode = sqlite3.OPEN_READONLY) {
    const db = new sqlite3.Database(filePath, mode);
    return {
        all(sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows))); },
        run(sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(error) { error ? reject(error) : resolve({ changes: this.changes }); })); },
        close() { return new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())); }
    };
}

async function verifyDatabase(filePath) {
    const db = openDb(filePath);
    try {
        const integrity = await db.all("PRAGMA integrity_check");
        const foreignKeys = await db.all("PRAGMA foreign_key_check");
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        const names = new Set(tables.map(row => row.name));
        const missingTables = REQUIRED_TABLES.filter(name => !names.has(name));
        if (integrity.length !== 1 || integrity[0].integrity_check !== "ok") throw new Error("SQLite integrity_check failed.");
        if (foreignKeys.length) throw new Error("SQLite foreign_key_check failed.");
        if (missingTables.length) throw new Error(`Backup DB misses required tables: ${missingTables.join(", ")}`);
        return { integrity: "ok", foreignKeys: [], schemaVersion: Number((await db.all("PRAGMA user_version"))[0]?.user_version || 0) };
    } finally { await db.close(); }
}

async function vacuumInto(sourcePath, targetPath) {
    const db = openDb(sourcePath);
    try {
        await db.run("PRAGMA busy_timeout=30000");
        await db.run(`VACUUM INTO '${targetPath.replace(/'/g, "''")}'`);
    } finally { await db.close(); }
}

async function walkUploads(root) {
    if (!fs.existsSync(root)) return [];
    const result = [];
    async function walk(current, prefix = "") {
        for (const entry of await fs.promises.readdir(current, { withFileTypes: true })) {
            const source = path.join(current, entry.name);
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
            const stat = await fs.promises.lstat(source);
            if (stat.isSymbolicLink()) throw new Error(`Symbolic link is not allowed in uploads: ${relative}`);
            if (stat.isDirectory()) await walk(source, relative);
            else if (stat.isFile()) result.push({ source, relative: safeRelative(relative), size: stat.size, mtimeMs: stat.mtimeMs });
        }
    }
    await walk(root); return result.sort((a, b) => a.relative.localeCompare(b.relative));
}

async function copyUploads(sourceRoot, targetRoot) {
    const files = await walkUploads(sourceRoot); const manifestFiles = []; let totalSize = 0;
    for (const file of files) {
        const target = path.join(targetRoot, ...file.relative.split("/"));
        await fs.promises.mkdir(path.dirname(target), { recursive: true });
        await fs.promises.copyFile(file.source, target, fs.constants.COPYFILE_EXCL);
        const [sourceAfter, targetStat, digest] = await Promise.all([fs.promises.stat(file.source), fs.promises.stat(target), sha256(target)]);
        if (sourceAfter.size !== file.size || sourceAfter.mtimeMs !== file.mtimeMs || targetStat.size !== file.size) throw new Error(`Upload changed during backup: ${file.relative}`);
        manifestFiles.push({ relativePath: file.relative, size: file.size, sha256: digest }); totalSize += file.size;
    }
    return { files: manifestFiles, count: files.length, totalSize };
}

async function gitCommit(projectRoot) {
    try { return require("child_process").execFileSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; }
}

async function verifyReferences(dbPath, uploadsPath) {
    const db = openDb(dbPath); const rows = await db.all("SELECT id,image_url,is_active FROM products WHERE deleted_at IS NULL AND image_url IS NOT NULL AND trim(image_url)<>''"); await db.close();
    const counts = new Map(); const unsafe = []; const missing = [];
    for (const row of rows) {
        const match = /^\/uploads\/products\/([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(String(row.image_url));
        if (!match) { unsafe.push({ productId: row.id, imageUrl: row.image_url }); continue; }
        counts.set(match[1], (counts.get(match[1]) || 0) + 1);
        if (!fs.existsSync(path.join(uploadsPath, match[1]))) missing.push({ productId: row.id, filename: match[1], active: Number(row.is_active) === 1 });
    }
    const disk = await walkUploads(uploadsPath); const referenced = new Set(counts.keys());
    return { missing, unsafe, orphanFiles: disk.map(x => x.relative).filter(name => !referenced.has(name)), sharedReferences: [...counts].filter(([, count]) => count > 1).map(([filename, count]) => ({ filename, count })) };
}

async function verifyBackup(backupPath) {
    const root = path.resolve(backupPath); const rootStat = await fs.promises.lstat(root); if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("Backup path must be a real directory.");
    const manifest = JSON.parse(await fs.promises.readFile(path.join(root, "manifest.json"), "utf8"));
    if (manifest.formatVersion !== FORMAT_VERSION || manifest.application !== "MatMix") throw new Error("Unsupported backup manifest.");
    const dbRelative = safeRelative(manifest.database.filename); const dbPath = path.join(root, ...dbRelative.split("/"));
    if (!isInside(root, dbPath) || (await fs.promises.lstat(dbPath)).isSymbolicLink()) throw new Error("Unsafe backup database path.");
    const dbStat = await fs.promises.stat(dbPath); if (dbStat.size !== manifest.database.size || await sha256(dbPath) !== manifest.database.sha256) throw new Error("Database checksum mismatch.");
    const dbCheck = await verifyDatabase(dbPath); const listed = new Set();
    for (const file of manifest.uploads.files) {
        const relative = safeRelative(file.relativePath); if (listed.has(relative)) throw new Error("Duplicate upload in manifest."); listed.add(relative);
        const target = path.join(root, "uploads", "products", ...relative.split("/"));
        if (!isInside(path.join(root, "uploads", "products"), target)) throw new Error("Unsafe upload path.");
        const stat = await fs.promises.lstat(target); if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== file.size || await sha256(target) !== file.sha256) throw new Error(`Upload checksum mismatch: ${relative}`);
    }
    const actual = await walkUploads(path.join(root, "uploads", "products"));
    if (actual.length !== listed.size || actual.some(file => !listed.has(file.relative))) throw new Error("Backup contains unlisted upload files.");
    return { success: true, backupPath: root, manifest, database: dbCheck, references: await verifyReferences(dbPath, path.join(root, "uploads", "products")) };
}

function backupName(prefix = "matmix-backup") { return `${prefix}-${new Date().toISOString().replace(/\..+/, "").replace(/[T:]/g, "-")}`; }

async function createBackup(options = {}) {
    const paths = options.paths || runtimePaths(); if (isInside(paths.uploadsPath, paths.backupRoot)) throw new Error("Backup root cannot be inside uploads.");
    await fs.promises.mkdir(paths.backupRoot, { recursive: true }); const name = backupName(options.prefix); const finalPath = path.join(paths.backupRoot, name); const tempPath = `${finalPath}.tmp-${crypto.randomBytes(4).toString("hex")}`;
    if (fs.existsSync(finalPath)) throw new Error("Backup destination already exists.");
    try {
        await fs.promises.mkdir(path.join(tempPath, "database"), { recursive: true }); await fs.promises.mkdir(path.join(tempPath, "uploads", "products"), { recursive: true });
        const dbTarget = path.join(tempPath, "database", "matmix.db"); await vacuumInto(paths.dbPath, dbTarget); const dbCheck = await verifyDatabase(dbTarget);
        const uploads = await copyUploads(paths.uploadsPath, path.join(tempPath, "uploads", "products")); const dbStat = await fs.promises.stat(dbTarget);
        const manifest = { formatVersion: FORMAT_VERSION, application: "MatMix", createdAt: new Date().toISOString(), database: { filename: "database/matmix.db", size: dbStat.size, sha256: await sha256(dbTarget), integrity: dbCheck.integrity, foreignKeys: dbCheck.foreignKeys }, uploads, schemaVersion: dbCheck.schemaVersion, applicationCommit: await gitCommit(path.resolve(__dirname, "..", "..")), nodeVersion: process.version, platform: `${process.platform}-${process.arch}`, backupToolVersion: TOOL_VERSION };
        await fs.promises.writeFile(path.join(tempPath, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" }); await verifyBackup(tempPath); await fs.promises.rename(tempPath, finalPath);
        if (!options.skipRetention) await applyRetention(paths.backupRoot, paths.retentionCount, finalPath);
        return { success: true, backupPath: finalPath, manifest, references: await verifyReferences(path.join(finalPath, "database", "matmix.db"), path.join(finalPath, "uploads", "products")) };
    } catch (error) { await fs.promises.rm(tempPath, { recursive: true, force: true }); throw error; }
}

async function applyRetention(root, keep, current) {
    const entries = (await fs.promises.readdir(root, { withFileTypes: true })).filter(e => e.isDirectory() && /^matmix-backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/.test(e.name)).map(e => path.join(root, e.name)).sort().reverse();
    for (const item of entries.slice(keep)) if (path.resolve(item) !== path.resolve(current)) await fs.promises.rm(item, { recursive: true, force: true }).catch(error => console.warn("Retention delete failed:", error.message));
}

module.exports = { FORMAT_VERSION, runtimePaths, createBackup, verifyBackup, verifyDatabase, verifyReferences, safeRelative, isInside, sha256 };
