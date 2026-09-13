#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const sharp = require("sharp");

const MAT_RE = /^MAT-\d{6}$/;
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PROTECTED_MATS = new Set(["MAT-000002", "MAT-000005"]);
const PLACEHOLDER_FILES = new Set([
    "MAT-000001-20260714153714969-3fb7fe.png",
    "MAT-000002-20260714154207481-2251c3.png",
    "MAT-004031-20260715124610972-db5d52.png"
]);
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const OUTPUT_SIDE = 1200;
const CONTENT_SIDE = 1080;

function usage() {
    console.log("Usage: node backend/scripts/import-product-images.js --input DIR --db FILE [--dry-run] [--apply --confirm-apply] [--allow-real-overwrite] [--allow-protected-overwrite --protected-mats MAT-000002] [--only MAT-000001,MAT-000003]");
}

function parseArgs(argv) {
    const args = { dryRun: true, apply: false, cleanupInput: false, allowRealOverwrite: false, allowProtectedOverwrite: false };
    for (let i = 0; i < argv.length; i += 1) {
        const a = argv[i];
        if (a === "--help" || a === "-h") return { help: true };
        if (["--input", "--db", "--uploads-dir", "--only", "--protected-mats"].includes(a)) {
            const key = ({ "--db": "dbPath", "--uploads-dir": "uploadsDir", "--input": "input", "--only": "only", "--protected-mats": "protectedMats" })[a];
            args[key] = argv[++i];
        }
        else if (a === "--dry-run") args.dryRun = true;
        else if (a === "--apply") { args.apply = true; args.dryRun = false; }
        else if (a === "--confirm-apply") args.confirmApply = true;
        else if (a === "--cleanup-input") args.cleanupInput = true;
        else if (a === "--allow-real-overwrite") args.allowRealOverwrite = true;
        else if (a === "--allow-protected-overwrite") args.allowProtectedOverwrite = true;
        else throw new Error(`Unknown argument: ${a}`);
    }
    if (!args.input || !args.dbPath) throw new Error("--input and --db are required");
    if (args.apply && !args.confirmApply) throw new Error("--apply requires --confirm-apply");
    if (args.cleanupInput && !args.apply) throw new Error("--cleanup-input requires --apply --confirm-apply");
    args.only = args.only ? new Set(args.only.split(",").map(v => v.trim().toUpperCase()).filter(Boolean)) : null;
    if (args.apply && args.allowRealOverwrite && !args.only) throw new Error("--allow-real-overwrite requires --only");
    args.protectedMats = args.protectedMats ? new Set(args.protectedMats.split(",").map(v => v.trim().toUpperCase()).filter(Boolean)) : new Set(PROTECTED_MATS);
    return args;
}

function openDb(file, mode = sqlite3.OPEN_READONLY) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file, mode, error => error ? reject(error) : resolve(db));
    });
}
function closeDb(db) { return new Promise(resolve => db.close(() => resolve())); }
function all(db, sql, params = []) { return new Promise((resolve, reject) => db.all(sql, params, (e, rows) => e ? reject(e) : resolve(rows))); }
function get(db, sql, params = []) { return new Promise((resolve, reject) => db.get(sql, params, (e, row) => e ? reject(e) : resolve(row))); }
function run(db, sql, params = []) { return new Promise((resolve, reject) => db.run(sql, params, function done(e) { e ? reject(e) : resolve({ changes: this.changes }); })); }
async function removeFile(file) { await fs.promises.rm(file, { force: true, maxRetries: 8, retryDelay: 50 }).catch(() => {}); }

function parseImageFilename(filename) {
    const stem = path.basename(filename, path.extname(filename)).toUpperCase();
    const match = /^(MAT-\d{6})(?:-(\d+))?$/.exec(stem);
    if (!match || !MAT_RE.test(match[1])) return null;
    const position = match[2] ? Number(match[2]) : 1;
    return Number.isInteger(position) && position >= 1 ? { mat: match[1], position } : null;
}
function extractMat(filename) { const parsed = parseImageFilename(filename); return parsed ? parsed.mat : null; }
function isPlaceholder(url) {
    return !url ? false : PLACEHOLDER_FILES.has(path.basename(String(url)));
}
function classifyImage(product) {
    const bindings = [product.image_url, product.primary_image].filter(Boolean);
    if (!bindings.length) return "missing";
    return bindings.some(url => !isPlaceholder(url)) ? "real" : "placeholder";
}
async function validateInput(file) {
    const ext = path.extname(file).toLowerCase();
    if (!EXTENSIONS.has(ext)) throw new Error("unsupported extension");
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error("not a file");
    if (stat.size > MAX_BYTES) throw new Error("file exceeds 10 MB");
    const buffer = await fs.promises.readFile(file);
    let metadata;
    try { metadata = await sharp(buffer, { limitInputPixels: MAX_PIXELS, failOn: "error" }).metadata(); }
    catch (_) { throw new Error("invalid image or magic bytes"); }
    if (!["jpeg", "png", "webp"].includes(metadata.format)) throw new Error("MIME/format mismatch");
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) throw new Error("invalid dimensions");
    if ((metadata.pages || 1) !== 1) throw new Error("animated/multipage image is not supported");
    return { buffer, metadata, sha256: crypto.createHash("sha256").update(buffer).digest("hex") };
}
async function renderWebp(buffer, output) {
    const rendered = await sharp(buffer, { limitInputPixels: MAX_PIXELS, failOn: "error" })
        .rotate().flatten({ background: "#ffffff" })
        .resize({ width: CONTENT_SIDE, height: CONTENT_SIDE, fit: "contain", background: "#ffffff" })
        .extend({ top: 60, bottom: 60, left: 60, right: 60, background: "#ffffff" })
        .webp({ quality: 82, effort: 4 }).toBuffer();
    const meta = await sharp(rendered).metadata();
    if (meta.format !== "webp" || meta.width !== OUTPUT_SIDE || meta.height !== OUTPUT_SIDE) throw new Error("output normalization failed");
    if (output) await fs.promises.writeFile(output, rendered);
    return rendered;
}

async function loadProducts(db, mats) {
    if (!mats.length) return new Map();
    const rows = await all(db, `SELECT p.id,p.external_id,p.title,p.image_url,
        (SELECT image_url FROM product_images i WHERE i.product_id=p.id AND i.is_primary=1 ORDER BY i.sort_order,i.id LIMIT 1) primary_image
        ,(SELECT COUNT(*) FROM product_images i WHERE i.product_id=p.id AND i.is_primary=0) gallery_count
        FROM products p WHERE p.external_id IN (${mats.map(() => "?").join(",")})`, mats);
    return new Map(rows.map(row => [row.external_id.toUpperCase(), row]));
}

async function planBatch({ input, dbPath, uploadsRoot = process.env.PRODUCT_UPLOADS_PATH || path.join(__dirname, "..", "..", "public", "uploads", "products"), allowRealOverwrite = false, allowProtectedOverwrite = false, protectedMats = PROTECTED_MATS, only = null }) {
    const files = (await fs.promises.readdir(input, { withFileTypes: true })).filter(e => e.isFile()).map(e => path.join(input, e.name)).sort();
    const candidates = files.map(file => ({ file, source: path.basename(file), ...parseImageFilename(file) }));
    const mats = candidates.filter(x => x.mat).map(x => x.mat);
    const db = await openDb(dbPath);
    try {
        const products = await loadProducts(db, [...new Set(mats)]);
        const seenPositions = new Set(), seenHash = new Set();
        const items = [];
        for (const candidate of candidates) {
            const item = { source: candidate.source, mat: candidate.mat || null, position: candidate.position || null, role: candidate.position === 1 ? "PRIMARY" : "GALLERY", product_id: null, title: null, current_image_url: null, current_primary_image: null, current_gallery_count: 0, classification: "missing", proposed_filename: null, overwrite_required: "no", status: "READY", reason: null };
            try {
                if (!candidate.mat) throw new Error("filename must be exactly MAT-xxxxxx.ext");
                if (only && !only.has(candidate.mat)) { item.status = "SKIPPED"; item.reason = "MAT excluded by --only"; items.push(item); continue; }
                const positionKey = `${candidate.mat}:${candidate.position}`;
                if (seenPositions.has(positionKey)) { item.status = "DUPLICATE_POSITION"; throw new Error("more than one file for MAT position"); }
                seenPositions.add(positionKey);
                const product = products.get(candidate.mat);
                if (!product) { item.status = "MAT_NOT_FOUND"; throw new Error("external_id not found"); }
                item.product_id = product.id; item.title = product.title; item.current_image_url = product.image_url; item.current_primary_image = product.primary_image; item.current_gallery_count = product.gallery_count || 0;
                item.classification = classifyImage(product); item.overwrite_required = item.classification === "missing" || item.classification === "placeholder" ? "no" : "yes";
                const checked = await validateInput(candidate.file);
                if (seenHash.has(checked.sha256)) { item.status = "DUPLICATE_FILE"; throw new Error("duplicate file content"); }
                seenHash.add(checked.sha256);
                item.proposed_filename = `${candidate.mat}-${checked.sha256.slice(0, 16)}.webp`;
                if (protectedMats.has(candidate.mat) && !allowProtectedOverwrite) { item.status = "PROTECTED"; item.reason = "protected MAT requires --allow-protected-overwrite"; }
                else if (candidate.position === 1 && item.classification === "real" && !allowRealOverwrite) { item.status = "REAL_IMAGE_EXISTS"; item.reason = "real primary binding requires --allow-real-overwrite"; }
                else item.status = "READY";
            } catch (error) { if (item.status === "READY") item.status = "INVALID_FILE"; item.reason = item.reason || error.message; }
            items.push(item);
        }
        const counts = items.reduce((acc, item) => { acc.total += 1; const key = ({ READY: "ready", PROTECTED: "protected", REAL_IMAGE_EXISTS: "existingReal", INVALID_FILE: "invalid", MAT_NOT_FOUND: "notFound", DUPLICATE_MAT: "duplicates", DUPLICATE_POSITION: "duplicates", DUPLICATE_FILE: "duplicates", ERROR: "errors" })[item.status]; if (key) acc[key] += 1; return acc; }, { total: 0, ready: 0, protected: 0, existingReal: 0, invalid: 0, notFound: 0, duplicates: 0, errors: 0 });
        return { items, summary: counts, inputRoot: path.resolve(input), uploadsRoot: path.resolve(uploadsRoot) };
    } finally { await closeDb(db); }
}

function assertSafeApply(dbPath) {
    const absolute = path.resolve(dbPath); const lower = absolute.toLowerCase();
    if (lower.endsWith("matmix-prod-snapshot.db") || lower.includes(`${path.sep}.local-audit${path.sep}`)) throw new Error("--apply is forbidden for production snapshots/.local-audit paths");
}
async function applyPlan(plan, { dbPath, uploadsRoot = plan.uploadsRoot, cleanupInput = false }) {
    const blocked = plan.items.filter(i => !["READY", "SKIPPED"].includes(i.status));
    if (blocked.length) throw new Error("apply aborted: validation/classification contains non-READY items");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${path.resolve(dbPath)}.backup-${stamp}`;
    const manifestPath = `${path.resolve(dbPath)}.image-bindings-${stamp}.json`;
    const auditPath = `${path.resolve(dbPath)}.image-import-audit-${stamp}.json`;
    await fs.promises.copyFile(dbPath, backupPath);
    const db = await openDb(dbPath, sqlite3.OPEN_READWRITE); const temp = []; const finalFiles = []; let committed = false;
    try {
        const bindings = await all(db, "SELECT p.external_id,p.id,p.image_url,i.image_url primary_image FROM products p LEFT JOIN product_images i ON i.product_id=p.id AND i.is_primary=1");
        await fs.promises.writeFile(manifestPath, JSON.stringify({ createdAt: new Date().toISOString(), bindings }, null, 2));
        for (const item of plan.items.filter(i => i.status === "READY")) {
            const source = path.join(plan.inputRoot, item.source);
            const sourceChecked = await validateInput(source);
            const filename = item.proposed_filename; const tmp = path.join(uploadsRoot, `.${filename}.${crypto.randomBytes(6).toString("hex")}.tmp`); const final = path.join(uploadsRoot, filename);
            await fs.promises.mkdir(uploadsRoot, { recursive: true }); await renderWebp(sourceChecked.buffer, tmp); temp.push(tmp);
            if (!fs.existsSync(final)) {
                try { await fs.promises.rename(tmp, final); }
                catch (error) {
                    if (error.code !== "EBUSY" && error.code !== "EPERM") throw error;
                    await fs.promises.copyFile(tmp, final, fs.constants.COPYFILE_EXCL); await removeFile(tmp);
                }
                finalFiles.push(final);
            } else await removeFile(tmp);
            item.new_image_url = `/uploads/products/${filename}`;
        }
        await fs.promises.writeFile(auditPath, JSON.stringify({ timestamp: new Date().toISOString(), mode: "apply", items: plan.items }, null, 2));
        await run(db, "BEGIN IMMEDIATE");
        for (const item of plan.items.filter(i => i.status === "READY")) {
            const product = await get(db, "SELECT id FROM products WHERE external_id=?", [item.mat]);
            if (item.position === 1) {
                const existing = await get(db, "SELECT id FROM product_images WHERE product_id=? AND is_primary=1 ORDER BY sort_order,id LIMIT 1", [product.id]);
                if (existing) await run(db, "UPDATE product_images SET image_url=?,alt_text=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [item.new_image_url, item.title, existing.id]);
                else await run(db, "INSERT INTO product_images(product_id,image_url,alt_text,sort_order,is_primary,created_at,updated_at) VALUES(?,?,?,0,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", [product.id, item.new_image_url, item.title]);
                await run(db, "UPDATE products SET image_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?", [item.new_image_url, product.id]);
            } else {
                const existingGallery = await get(db, "SELECT id FROM product_images WHERE product_id=? AND is_primary=0 AND image_url=? LIMIT 1", [product.id, item.new_image_url]);
                if (!existingGallery) await run(db, "INSERT INTO product_images(product_id,image_url,alt_text,sort_order,is_primary,created_at,updated_at) VALUES(?,?,?, ?,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", [product.id, item.new_image_url, item.title, item.position - 1]);
            }
        }
        await run(db, "COMMIT");
        committed = true;
        for (const file of temp) await removeFile(file);
        await fs.promises.writeFile(auditPath, JSON.stringify({ timestamp: new Date().toISOString(), mode: "apply", committed: true, items: plan.items }, null, 2));
        if (cleanupInput) {
            for (const item of plan.items.filter(i => i.status === "READY")) await removeFile(path.join(plan.inputRoot, item.source));
        }
        return { backupPath, manifestPath, auditPath, items: plan.items };
    } catch (error) {
        if (!committed) {
            await run(db, "ROLLBACK").catch(() => {});
            for (const file of finalFiles) await removeFile(file);
        }
        for (const file of temp) await removeFile(file);
        throw error;
    } finally { await closeDb(db); }
}

async function main() {
    const args = parseArgs(process.argv.slice(2)); if (args.help) return usage();
    if (args.apply) assertSafeApply(args.dbPath);
    const plan = await planBatch({ input: path.resolve(args.input), dbPath: path.resolve(args.dbPath), uploadsRoot: args.uploadsDir ? path.resolve(args.uploadsDir) : undefined, allowRealOverwrite: args.allowRealOverwrite, allowProtectedOverwrite: args.allowProtectedOverwrite, protectedMats: args.protectedMats, only: args.only });
    plan.cleanupInput = args.cleanupInput;
    plan.inputRoot = path.resolve(args.input);
    const result = args.apply ? await applyPlan(plan, args) : plan;
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), mode: args.apply ? "apply" : "dry-run", ...result }, null, 2));
}

if (require.main === module) main().catch(error => { console.error(`ERROR: ${error.message}`); process.exitCode = 1; });
module.exports = { MAT_RE, PROTECTED_MATS, PLACEHOLDER_FILES, parseImageFilename, extractMat, isPlaceholder, classifyImage, validateInput, renderWebp, planBatch, applyPlan, parseArgs, assertSafeApply };
