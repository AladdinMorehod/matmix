const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const MAX_INPUT_SIDE = 12_000;
const OUTPUT_SIDE = 1000;
const OUTPUT_QUALITY = 82;
const MAX_CONCURRENCY = 2;
const MAX_QUEUE = 8;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);
let activeJobs = 0;
const waiting = [];

function imageError(status, code, message) {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    return error;
}

async function acquire() {
    if (activeJobs < MAX_CONCURRENCY) { activeJobs += 1; return; }
    if (waiting.length >= MAX_QUEUE) throw imageError(503, "IMAGE_UPLOAD_BUSY", "Обработка изображений временно занята.");
    await new Promise((resolve, reject) => {
        const entry = { resolve };
        waiting.push(entry);
        entry.timer = setTimeout(() => {
            const index = waiting.indexOf(entry);
            if (index !== -1) waiting.splice(index, 1);
            reject(imageError(503, "IMAGE_UPLOAD_BUSY", "Обработка изображений временно занята."));
        }, 15_000);
    });
    activeJobs += 1;
}

function release() {
    activeJobs -= 1;
    const next = waiting.shift();
    if (next) { clearTimeout(next.timer); next.resolve(); }
}

async function inspectInput(buffer) {
    if (!Buffer.isBuffer(buffer) || !buffer.length) throw imageError(400, "CORRUPT_IMAGE", "Файл изображения пуст или повреждён.");
    if (buffer.length > MAX_BYTES) throw imageError(413, "IMAGE_TOO_LARGE", "Максимальный размер изображения — 10 МБ.");
    const prefix = buffer.subarray(0, 32).toString("latin1");
    const bannedSignature = /^GIF8[79]a/.test(prefix) || prefix.startsWith("%PDF") || prefix.startsWith("PK\x03\x04")
        || /^\s*<(?:svg|html|!doctype)/i.test(buffer.subarray(0, 128).toString("utf8"));
    if (bannedSignature) throw imageError(415, "UNSUPPORTED_IMAGE_FORMAT", "Допустимы только JPEG, PNG и WebP.");
    let metadata;
    try {
        metadata = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, animated: true, pages: 2, failOn: "error" }).metadata();
    } catch (error) {
        if (/pixel limit/i.test(String(error.message))) throw imageError(413, "IMAGE_PIXEL_LIMIT_EXCEEDED", "Изображение превышает лимит 40 мегапикселей.");
        throw imageError(400, "CORRUPT_IMAGE", "Изображение повреждено или не может быть прочитано.");
    }
    if (!ALLOWED_FORMATS.has(metadata.format)) throw imageError(415, "UNSUPPORTED_IMAGE_FORMAT", "Допустимы только JPEG, PNG и WebP.");
    if ((metadata.pages || 1) !== 1) throw imageError(415, "UNSUPPORTED_IMAGE_FORMAT", "Анимированные и многостраничные изображения не поддерживаются.");
    if (!metadata.width || !metadata.height) throw imageError(400, "CORRUPT_IMAGE", "Не удалось определить размеры изображения.");
    if (metadata.width > MAX_INPUT_SIDE || metadata.height > MAX_INPUT_SIDE) {
        throw imageError(413, "IMAGE_DIMENSIONS_TOO_LARGE", `Размер стороны изображения не должен превышать ${MAX_INPUT_SIDE} px.`);
    }
    if (metadata.width * metadata.height > MAX_INPUT_PIXELS) throw imageError(413, "IMAGE_PIXEL_LIMIT_EXCEEDED", "Изображение превышает лимит 40 мегапикселей.");
    return metadata;
}

function safePrefix(product = {}) {
    const externalId = String(product.external_id || "").trim().toUpperCase();
    return /^MAT-\d+$/.test(externalId) ? externalId : `product-${Number(product.id) || "new"}`;
}

async function syncFile(file) {
    const handle = await fs.promises.open(file, "r+");
    try { await handle.sync(); } finally { await handle.close(); }
}

async function atomicRename(source, target) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        try { await fs.promises.rename(source, target); return; } catch (error) {
            if (!['EBUSY', 'EPERM'].includes(error.code) || attempt === 4) throw error;
            await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1)));
        }
    }
}

async function optimizeProductImage({ buffer, product = {}, uploadsRoot }) {
    await acquire();
    let tempPath = "";
    try {
        const input = await inspectInput(buffer);
        const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
        const filename = `${safePrefix(product)}-${hash}.webp`;
        const root = path.resolve(uploadsRoot);
        const finalPath = path.resolve(root, filename);
        if (!finalPath.startsWith(`${root}${path.sep}`)) throw imageError(400, "IMAGE_PROCESSING_FAILED", "Некорректное имя изображения.");
        await fs.promises.mkdir(root, { recursive: true });
        if (fs.existsSync(finalPath)) {
            if ((await fs.promises.lstat(finalPath)).isSymbolicLink()) throw imageError(400, "IMAGE_PROCESSING_FAILED", "Символические ссылки изображений запрещены.");
            const output = await sharp(finalPath, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
            return { filename, finalPath, input, output, bytes: (await fs.promises.stat(finalPath)).size, reused: true };
        }
        tempPath = path.join(root, `.${filename}.${crypto.randomBytes(6).toString("hex")}.tmp`);
        try {
            await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" })
                .rotate()
                .resize({ width: OUTPUT_SIDE, height: OUTPUT_SIDE, fit: "inside", withoutEnlargement: true })
                .toColourspace("srgb")
                .webp({ quality: OUTPUT_QUALITY, effort: 4 })
                .toFile(tempPath);
            const output = await sharp(await fs.promises.readFile(tempPath), { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" }).metadata();
            if (output.format !== "webp" || !output.width || !output.height || output.width > OUTPUT_SIDE || output.height > OUTPUT_SIDE) {
                throw imageError(500, "IMAGE_PROCESSING_FAILED", "Не удалось проверить оптимизированное изображение.");
            }
            await syncFile(tempPath);
            await atomicRename(tempPath, finalPath);
            tempPath = "";
            return { filename, finalPath, input, output, bytes: (await fs.promises.stat(finalPath)).size, reused: false };
        } catch (error) {
            if (error.code && String(error.code).startsWith("IMAGE_")) throw error;
            const wrapped = imageError(500, "IMAGE_PROCESSING_FAILED", "Не удалось обработать изображение.");
            wrapped.cause = error;
            throw wrapped;
        }
    } finally {
        if (tempPath) await fs.promises.unlink(tempPath).catch(() => {});
        release();
    }
}

module.exports = { MAX_BYTES, MAX_INPUT_PIXELS, MAX_INPUT_SIDE, OUTPUT_SIDE, OUTPUT_QUALITY, MAX_CONCURRENCY, MAX_QUEUE, inspectInput, optimizeProductImage };
