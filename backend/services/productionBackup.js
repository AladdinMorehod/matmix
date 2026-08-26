const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const sqlite3 = require("sqlite3").verbose();
const { auditOrderAttachments, listAttachmentMetadata } = require("./orderAttachmentAudit");
const { createOrderAttachmentStorage, validateStorageKey } = require("./orderAttachmentStorage");
const { ARCHIVE_FILE_PATTERN, ARCHIVE_TEMP_FILE_PATTERN, resolveCatalogImportArchivePath } = require("./catalogImportArchive");
const { collectProductImageReferences, normalizeProductImageReference } = require("./productImageReferences");

const FORMAT_VERSION = 3;
const ATTACHMENT_FORMAT_VERSION = 2;
const LEGACY_FORMAT_VERSION = 1;
const TOOL_VERSION = "3.0.0";
const REQUIRED_TABLES = ["products", "catalog_structure", "clients", "orders", "users"];

function runtimePaths(env = process.env, options = {}) {
    const projectRoot = path.resolve(__dirname, "..", "..");
    const dbPath = path.resolve(env.MATMIX_DB_PATH || path.join(projectRoot, "backend", "database", "matmix.db"));
    return {
        dbPath,
        uploadsPath: path.resolve(env.PRODUCT_UPLOADS_PATH || path.join(projectRoot, "public", "uploads", "products")),
        attachmentsPath: path.resolve(env.ORDER_ATTACHMENTS_PATH || path.join(projectRoot, "backend", "private", "order-attachments")),
        catalogImportsPath: resolveCatalogImportArchivePath(env, {
            projectRoot,
            allowMissingProduction: options.allowMissingProduction === true,
            allowUnsafePath: options.allowUnsafePath === true
        }),
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
    if (value.includes("\\") || /^[A-Za-z]:/.test(value) || value.startsWith("//")) throw new Error("Manifest contains an unsafe path.");
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
    db.configure("busyTimeout", 5000);
    db.run("PRAGMA foreign_keys=ON");
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

async function copyUploads(sourceRoot, targetRoot, options = {}) {
    const files = (await walkUploads(sourceRoot)).filter(file => !options.ignore?.(file.relative)); const manifestFiles = []; let totalSize = 0;
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

function manifestSize(value, fieldName) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${fieldName} must be a non-negative safe integer.`);
    return value;
}

function manifestSha256(value, fieldName) {
    if (!/^[a-f0-9]{64}$/.test(String(value || ""))) throw new Error(`${fieldName} must be a lowercase SHA-256.`);
    return value;
}

async function copyAttachments(dbPath, sourceRoot, targetRoot) {
    const audit = await auditOrderAttachments({ dbPath, attachmentsPath: sourceRoot, includeMetadata: true });
    if (!audit.healthy) {
        throw new Error(`Attachment audit failed before backup: missing=${audit.missing.length}, corrupt=${audit.corrupt.length}, orphan=${audit.orphans.length}, unsafe=${audit.unsafe.length}`);
    }
    const storage = createOrderAttachmentStorage({ rootPath: sourceRoot });
    const files = [];
    let totalBytes = 0;
    for (const item of audit.metadata) {
        const storageKey = validateStorageKey(item.storageKey);
        const opened = await storage.createReadStream(storageKey);
        if (opened.sizeBytes !== item.sizeBytes) throw new Error(`Attachment changed during backup: ${storageKey}`);
        const target = path.join(targetRoot, storageKey);
        await pipeline(opened.stream, fs.createWriteStream(target, { flags: "wx", mode: 0o600 }));
        const stat = await fs.promises.lstat(target);
        const digest = await sha256(target);
        if (!stat.isFile() || stat.size !== item.sizeBytes || digest !== item.sha256) {
            throw new Error(`Attachment changed during backup: ${storageKey}`);
        }
        files.push({
            storageKey,
            relativePath: `attachments/orders/${storageKey}`,
            sizeBytes: stat.size,
            sha256: digest
        });
        totalBytes += stat.size;
    }
    return { root: "attachments/orders", fileCount: files.length, totalBytes, files };
}

async function verifyCatalogImportArea(archiveRoot, catalogImportsManifest) {
    if (!catalogImportsManifest || catalogImportsManifest.root !== "catalog-imports" || !Array.isArray(catalogImportsManifest.files)) {
        throw new Error("Backup catalog import manifest is invalid.");
    }
    const archiveRootStat = await fs.promises.lstat(archiveRoot);
    if (archiveRootStat.isSymbolicLink() || !archiveRootStat.isDirectory()) {
        throw new Error("Backup catalog import archive root is unsafe or missing.");
    }
    const archiveListed = new Set();
    let totalBytes = 0;
    for (const file of catalogImportsManifest.files) {
        const relative = safeRelative(file.relativePath);
        if (relative !== path.basename(relative)
            || ARCHIVE_TEMP_FILE_PATTERN.test(relative)
            || !ARCHIVE_FILE_PATTERN.test(relative)) {
            throw new Error("Backup catalog import archive filename is not a finalized archive.");
        }
        if (archiveListed.has(relative)) throw new Error("Duplicate catalog import archive in manifest.");
        archiveListed.add(relative);
        const target = path.join(archiveRoot, relative);
        if (!isInside(archiveRoot, target)) throw new Error("Unsafe catalog import archive path.");
        const size = manifestSize(file.size, "catalogImports.files[].size");
        const digest = manifestSha256(file.sha256, "catalogImports.files[].sha256");
        const stat = await fs.promises.lstat(target);
        if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== size || await sha256(target) !== digest) {
            throw new Error(`Catalog import archive checksum mismatch: ${relative}`);
        }
        totalBytes += stat.size;
    }
    const actualArchives = await walkUploads(archiveRoot);
    if (actualArchives.length !== archiveListed.size || actualArchives.some(file => !archiveListed.has(file.relative))) {
        throw new Error("Backup contains unlisted catalog import archive files.");
    }
    if (manifestSize(catalogImportsManifest.fileCount, "catalogImports.fileCount") !== archiveListed.size
        || manifestSize(catalogImportsManifest.totalBytes, "catalogImports.totalBytes") !== totalBytes) {
        throw new Error("Backup catalog import archive totals do not match.");
    }
    return { legacy: false, fileCount: archiveListed.size, totalBytes };
}

async function gitCommit(projectRoot) {
    try { return require("child_process").execFileSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return null; }
}

async function verifyReferences(dbPath, uploadsPath) {
    const db = openDb(dbPath); let rows;
    try { rows = await collectProductImageReferences(db); } finally { await db.close(); }
    const counts = new Map(); const unsafe = []; const missing = [];
    for (const row of rows) {
        const normalized = normalizeProductImageReference(row.imageUrl);
        if (!normalized) { unsafe.push({ productId: row.productId, imageUrl: row.imageUrl }); continue; }
        counts.set(normalized.filename, (counts.get(normalized.filename) || 0) + 1);
        if (!fs.existsSync(path.join(uploadsPath, normalized.filename))) missing.push({ productId: row.productId, filename: normalized.filename, active: row.isActive });
    }
    const disk = await walkUploads(uploadsPath); const referenced = new Set(counts.keys());
    return { missing, unsafe, orphanFiles: disk.map(x => x.relative).filter(name => !referenced.has(name)), sharedReferences: [...counts].filter(([, count]) => count > 1).map(([filename, count]) => ({ filename, count })) };
}

async function verifyBackup(backupPath) {
    const root = path.resolve(backupPath); const rootStat = await fs.promises.lstat(root); if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("Backup path must be a real directory.");
    const manifest = JSON.parse(await fs.promises.readFile(path.join(root, "manifest.json"), "utf8"));
    if (![LEGACY_FORMAT_VERSION, ATTACHMENT_FORMAT_VERSION, FORMAT_VERSION].includes(manifest.formatVersion) || manifest.application !== "MatMix") throw new Error("Unsupported backup manifest.");
    const dbRelative = safeRelative(manifest.database.filename); const dbPath = path.join(root, ...dbRelative.split("/"));
    if (!isInside(root, dbPath) || (await fs.promises.lstat(dbPath)).isSymbolicLink()) throw new Error("Unsafe backup database path.");
    const dbSize = manifestSize(manifest.database.size, "database.size"); const dbSha256 = manifestSha256(manifest.database.sha256, "database.sha256");
    const dbStat = await fs.promises.stat(dbPath); if (dbStat.size !== dbSize || await sha256(dbPath) !== dbSha256) throw new Error("Database checksum mismatch.");
    const dbCheck = await verifyDatabase(dbPath); const listed = new Set();
    for (const file of manifest.uploads.files) {
        const relative = safeRelative(file.relativePath); if (listed.has(relative)) throw new Error("Duplicate upload in manifest."); listed.add(relative);
        const target = path.join(root, "uploads", "products", ...relative.split("/"));
        if (!isInside(path.join(root, "uploads", "products"), target)) throw new Error("Unsafe upload path.");
        const size = manifestSize(file.size, "uploads.files[].size"); const digest = manifestSha256(file.sha256, "uploads.files[].sha256");
        const stat = await fs.promises.lstat(target); if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== size || await sha256(target) !== digest) throw new Error(`Upload checksum mismatch: ${relative}`);
    }
    const actual = await walkUploads(path.join(root, "uploads", "products"));
    if (actual.length !== listed.size || actual.some(file => !listed.has(file.relative))) throw new Error("Backup contains unlisted upload files.");
    let attachments;
    const attachmentRows = await listAttachmentMetadata(dbPath);
    if (manifest.formatVersion === LEGACY_FORMAT_VERSION) {
        if (attachmentRows.length) throw new Error("Legacy backup is incomplete: database contains attachment metadata.");
        attachments = { healthy: true, legacy: true, metadataCount: 0, filesystemFileCount: 0, totalBytes: 0 };
    } else {
        if (!manifest.attachments || manifest.attachments.root !== "attachments/orders" || !Array.isArray(manifest.attachments.files)) {
            throw new Error("Backup attachment manifest is invalid.");
        }
        const attachmentRoot = path.join(root, "attachments", "orders");
        const attachmentListed = new Set();
        let totalBytes = 0;
        for (const file of manifest.attachments.files) {
            const storageKey = validateStorageKey(file.storageKey);
            const relative = safeRelative(file.relativePath);
            if (relative !== `attachments/orders/${storageKey}` || attachmentListed.has(storageKey)) throw new Error("Backup attachment manifest contains an unsafe or duplicate entry.");
            attachmentListed.add(storageKey);
            const target = path.join(attachmentRoot, storageKey);
            if (!isInside(attachmentRoot, target)) throw new Error("Unsafe backup attachment path.");
            const sizeBytes = manifestSize(file.sizeBytes, "attachments.files[].sizeBytes"); const digest = manifestSha256(file.sha256, "attachments.files[].sha256");
            const stat = await fs.promises.lstat(target);
            if (stat.isSymbolicLink() || !stat.isFile() || stat.size !== sizeBytes || await sha256(target) !== digest) {
                throw new Error(`Attachment checksum mismatch: ${storageKey}`);
            }
            totalBytes += stat.size;
        }
        const actualAttachments = await walkUploads(attachmentRoot);
        if (actualAttachments.length !== attachmentListed.size || actualAttachments.some(file => !attachmentListed.has(file.relative))) {
            throw new Error("Backup contains unlisted attachment files.");
        }
        if (manifestSize(manifest.attachments.fileCount, "attachments.fileCount") !== attachmentListed.size || manifestSize(manifest.attachments.totalBytes, "attachments.totalBytes") !== totalBytes) {
            throw new Error("Backup attachment manifest totals do not match.");
        }
        attachments = await auditOrderAttachments({ dbPath, attachmentsPath: attachmentRoot });
        if (!attachments.healthy) throw new Error("Backup attachment audit failed.");
    }
    let catalogImports;
    if (manifest.formatVersion < FORMAT_VERSION) {
        catalogImports = { legacy: true, fileCount: 0, totalBytes: 0 };
    } else {
        const archiveRoot = path.join(root, "catalog-imports");
        catalogImports = await verifyCatalogImportArea(archiveRoot, manifest.catalogImports);
    }
    return { success: true, backupPath: root, manifest, database: dbCheck, attachments, catalogImports, references: await verifyReferences(dbPath, path.join(root, "uploads", "products")) };
}

function backupName(prefix = "matmix-backup") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const suffix = crypto.randomBytes(4).toString("hex");
    return `${prefix}-${timestamp}-${suffix}`;
}

async function createBackup(options = {}) {
    const paths = options.paths || runtimePaths();
    if (isInside(paths.uploadsPath, paths.backupRoot)) throw new Error("Backup root cannot be inside uploads.");
    if (isInside(paths.attachmentsPath, paths.uploadsPath) || isInside(paths.uploadsPath, paths.attachmentsPath)) throw new Error("Attachment and upload roots must not contain each other.");
    if (isInside(paths.attachmentsPath, paths.backupRoot) || isInside(paths.backupRoot, paths.attachmentsPath)) throw new Error("Backup and attachment roots must not contain each other.");
    if (isInside(paths.catalogImportsPath, paths.uploadsPath) || isInside(paths.uploadsPath, paths.catalogImportsPath)) throw new Error("Catalog import archive and upload roots must not contain each other.");
    if (isInside(paths.catalogImportsPath, paths.attachmentsPath) || isInside(paths.attachmentsPath, paths.catalogImportsPath)) throw new Error("Catalog import archive and attachment roots must not contain each other.");
    if (isInside(paths.catalogImportsPath, paths.backupRoot) || isInside(paths.backupRoot, paths.catalogImportsPath)) throw new Error("Backup and catalog import archive roots must not contain each other.");
    await fs.promises.mkdir(paths.backupRoot, { recursive: true }); const name = backupName(options.prefix); const finalPath = path.join(paths.backupRoot, name); const tempPath = `${finalPath}.tmp-${crypto.randomBytes(4).toString("hex")}`;
    if (fs.existsSync(finalPath)) throw new Error("Backup destination already exists.");
    try {
        await fs.promises.mkdir(path.join(tempPath, "database"), { recursive: true }); await fs.promises.mkdir(path.join(tempPath, "uploads", "products"), { recursive: true }); await fs.promises.mkdir(path.join(tempPath, "attachments", "orders"), { recursive: true }); await fs.promises.mkdir(path.join(tempPath, "catalog-imports"), { recursive: true });
        const dbTarget = path.join(tempPath, "database", "matmix.db"); await vacuumInto(paths.dbPath, dbTarget); const dbCheck = await verifyDatabase(dbTarget);
        const uploads = await copyUploads(paths.uploadsPath, path.join(tempPath, "uploads", "products"));
        const attachments = await copyAttachments(dbTarget, paths.attachmentsPath, path.join(tempPath, "attachments", "orders"));
        const catalogImportFiles = await copyUploads(paths.catalogImportsPath, path.join(tempPath, "catalog-imports"), {
            ignore: relative => ARCHIVE_TEMP_FILE_PATTERN.test(relative)
        });
        const catalogImports = { root: "catalog-imports", fileCount: catalogImportFiles.count, totalBytes: catalogImportFiles.totalSize, files: catalogImportFiles.files };
        const dbStat = await fs.promises.stat(dbTarget);
        const manifest = { formatVersion: FORMAT_VERSION, application: "MatMix", createdAt: new Date().toISOString(), database: { filename: "database/matmix.db", size: dbStat.size, sha256: await sha256(dbTarget), integrity: dbCheck.integrity, foreignKeys: dbCheck.foreignKeys }, uploads, attachments, catalogImports, schemaVersion: dbCheck.schemaVersion, applicationCommit: await gitCommit(path.resolve(__dirname, "..", "..")), nodeVersion: process.version, platform: `${process.platform}-${process.arch}`, backupToolVersion: TOOL_VERSION };
        await fs.promises.writeFile(path.join(tempPath, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" }); await verifyBackup(tempPath); await fs.promises.rename(tempPath, finalPath);
        if (!options.skipRetention) await applyRetention(paths.backupRoot, paths.retentionCount, finalPath);
        return { success: true, backupPath: finalPath, manifest, references: await verifyReferences(path.join(finalPath, "database", "matmix.db"), path.join(finalPath, "uploads", "products")) };
    } catch (error) { await fs.promises.rm(tempPath, { recursive: true, force: true }); throw error; }
}

async function applyRetention(root, keep, current) {
    const entries = (await fs.promises.readdir(root, { withFileTypes: true })).filter(e => e.isDirectory() && /^matmix-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9]{8}$/.test(e.name)).map(e => path.join(root, e.name)).sort().reverse();
    for (const item of entries.slice(keep)) if (path.resolve(item) !== path.resolve(current)) await fs.promises.rm(item, { recursive: true, force: true }).catch(error => console.warn("Retention delete failed:", error.message));
}

module.exports = { FORMAT_VERSION, LEGACY_FORMAT_VERSION, runtimePaths, createBackup, verifyBackup, verifyDatabase, verifyReferences, verifyCatalogImportArea, safeRelative, isInside, sha256, applyRetention };
