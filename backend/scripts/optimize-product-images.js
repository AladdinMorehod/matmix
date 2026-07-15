const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { runtimePaths, createBackup } = require("../services/productionBackup");
const { openDatabase } = require("../databaseMigrations");
const { optimizeProductImage, MAX_INPUT_PIXELS, MAX_INPUT_SIDE } = require("../services/productImages");

const URL_PREFIX = "/uploads/products/";

function safeFilename(url) {
    if (typeof url !== "string" || !url.startsWith(URL_PREFIX) || url.includes("\\") || url.includes("..")) return "";
    const name = path.posix.basename(url);
    return name === url.slice(URL_PREFIX.length) ? name : "";
}

async function scan(paths, db) {
    const references = await db.all("SELECT id, external_id, image_url FROM products WHERE image_url IS NOT NULL AND image_url<>''");
    const referenceCounts = new Map();
    for (const row of references) referenceCounts.set(row.image_url, (referenceCounts.get(row.image_url) || 0) + 1);
    const entries = await fs.promises.readdir(paths.uploadsPath, { withFileTypes: true });
    const files = entries.filter(entry => entry.isFile());
    const result = { files: files.length, totalBytes: 0, formats: {}, corrupt: [], oversized: [], orphan: [], missing: [], symlinks: entries.filter(entry => entry.isSymbolicLink()).map(entry => entry.name), sharedReferences: 0, maxBytes: 0, candidates: [] };
    const diskNames = new Set(files.map(entry => entry.name));
    for (const entry of files) {
        const file = path.join(paths.uploadsPath, entry.name);
        const stat = await fs.promises.stat(file);
        result.totalBytes += stat.size; result.maxBytes = Math.max(result.maxBytes, stat.size);
        const url = `${URL_PREFIX}${entry.name}`;
        if (!referenceCounts.has(url)) result.orphan.push(entry.name);
        if ((referenceCounts.get(url) || 0) > 1) result.sharedReferences += 1;
        try {
            const metadata = await sharp(file, { limitInputPixels: MAX_INPUT_PIXELS, animated: true, pages: 2 }).metadata();
            result.formats[metadata.format || "unknown"] = (result.formats[metadata.format || "unknown"] || 0) + 1;
            if ((metadata.width || 0) > MAX_INPUT_SIDE || (metadata.height || 0) > MAX_INPUT_SIDE || (metadata.width || 0) * (metadata.height || 0) > MAX_INPUT_PIXELS) result.oversized.push(entry.name);
            if (!/placeholder/i.test(entry.name) && (metadata.format !== "webp" || metadata.width > 1000 || metadata.height > 1000)) result.candidates.push(entry.name);
        } catch (error) { result.corrupt.push(entry.name); }
    }
    for (const url of referenceCounts.keys()) { const name = safeFilename(url); if (!name || !diskNames.has(name)) result.missing.push(url); }
    return { ...result, referencedUrls: referenceCounts.size };
}

async function apply(paths, db) {
    if (fs.existsSync(paths.lockPath)) throw new Error("Application runtime lock exists. Stop MatMix before image migration.");
    const backup = await createBackup({ paths });
    const rows = await db.all("SELECT id, external_id, image_url FROM products WHERE image_url IS NOT NULL AND image_url<>'' ORDER BY id");
    const groups = new Map();
    for (const row of rows) { if (!groups.has(row.image_url)) groups.set(row.image_url, []); groups.get(row.image_url).push(row); }
    const report = { backupPath: backup.backupPath, converted: 0, skipped: 0, failures: [] };
    for (const [oldUrl, products] of groups) {
        const filename = safeFilename(oldUrl);
        if (!filename || /placeholder/i.test(filename)) { report.skipped += 1; continue; }
        const source = path.join(paths.uploadsPath, filename);
        if (!fs.existsSync(source)) { report.failures.push({ filename, code: "MISSING" }); continue; }
        try {
            if ((await fs.promises.lstat(source)).isSymbolicLink()) throw Object.assign(new Error("Symlink rejected"), { code: "SYMLINK_REJECTED" });
            const optimized = await optimizeProductImage({ buffer: await fs.promises.readFile(source), product: products[0], uploadsRoot: paths.uploadsPath });
            const newUrl = `${URL_PREFIX}${optimized.filename}`;
            await db.run("BEGIN IMMEDIATE");
            try {
                await db.run("UPDATE products SET image_url=?, updated_at=? WHERE image_url=?", [newUrl, new Date().toISOString(), oldUrl]);
                await db.run("COMMIT");
            } catch (error) { await db.run("ROLLBACK").catch(() => {}); throw error; }
            if (newUrl !== oldUrl && Number((await db.get("SELECT COUNT(*) n FROM products WHERE image_url=?", [oldUrl])).n) === 0) await fs.promises.unlink(source);
            report.converted += 1;
        } catch (error) { report.failures.push({ filename, code: error.code || "FAILED" }); }
    }
    return report;
}

(async () => {
    const scanMode = process.argv.includes("--scan") || process.argv.includes("--dry-run");
    const applyMode = process.argv.includes("--apply");
    if (scanMode === applyMode) throw new Error("Choose --scan/--dry-run or --apply.");
    if (applyMode && process.argv[process.argv.indexOf("--confirm") + 1] !== "OPTIMIZE_MATMIX_IMAGES") throw new Error("Apply requires --confirm OPTIMIZE_MATMIX_IMAGES.");
    const paths = runtimePaths();
    const db = await openDatabase(paths.dbPath);
    try { console.log(JSON.stringify(applyMode ? await apply(paths, db) : await scan(paths, db), null, 2)); } finally { await db.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
