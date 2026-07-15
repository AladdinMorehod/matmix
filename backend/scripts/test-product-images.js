const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const { optimizeProductImage, inspectInput, OUTPUT_SIDE, MAX_BYTES, MAX_CONCURRENCY } = require("../services/productImages");

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-images-"));
    const sources = [
        await sharp({ create: { width: 1800, height: 1200, channels: 3, background: "#336633" } }).jpeg({ quality: 95 }).withMetadata({ orientation: 6 }).toBuffer(),
        await sharp({ create: { width: 800, height: 600, channels: 4, background: { r: 20, g: 30, b: 40, alpha: 0.5 } } }).png().toBuffer(),
        await sharp({ create: { width: 320, height: 240, channels: 3, background: "#993333" } }).webp().toBuffer()
    ];
    const started = Date.now();
    const results = await Promise.all(sources.concat(sources).map((buffer, index) => optimizeProductImage({ buffer, product: { id: index + 1, external_id: `MAT-${String(index + 1).padStart(6, "0")}` }, uploadsRoot: root })));
    for (const result of results) {
        assert(result.filename.endsWith(".webp")); assert(result.output.width <= OUTPUT_SIDE); assert(result.output.height <= OUTPUT_SIDE);
        const metadata = await sharp(result.finalPath).metadata();
        assert.strictEqual(metadata.format, "webp"); assert(!metadata.exif); assert(!metadata.icc); assert(!metadata.orientation);
    }
    assert.strictEqual(results[2].output.width, 320); assert.strictEqual(results[2].output.height, 240);
    assert(results[0].output.height > results[0].output.width); assert(results[1].output.hasAlpha);
    const repeated = await optimizeProductImage({ buffer: sources[0], product: { external_id: "MAT-000001" }, uploadsRoot: root });
    assert(repeated.reused);
    const hugeSide = await sharp({ create: { width: 12001, height: 1, channels: 3, background: "white" } }).png().toBuffer();
    await assert.rejects(() => inspectInput(hugeSide), error => error.code === "IMAGE_DIMENSIONS_TOO_LARGE");
    const tooManyPixels = await sharp({ create: { width: 7000, height: 6000, channels: 3, background: "white" } }).png().toBuffer();
    await assert.rejects(() => inspectInput(tooManyPixels), error => error.code === "IMAGE_PIXEL_LIMIT_EXCEEDED");
    const gif = await sharp({ create: { width: 10, height: 10, channels: 3, background: "white" } }).gif().toBuffer();
    await assert.rejects(() => inspectInput(gif), error => error.code === "UNSUPPORTED_IMAGE_FORMAT");
    for (const invalid of [Buffer.from("<svg></svg>"), Buffer.from("PK\x03\x04archive"), Buffer.from("<html></html>")]) await assert.rejects(() => inspectInput(invalid), error => error.code === "UNSUPPORTED_IMAGE_FORMAT");
    const exactLimit = Buffer.concat([sources[0], Buffer.alloc(MAX_BYTES - sources[0].length)]); assert((await inspectInput(exactLimit)).format === "jpeg");
    await assert.rejects(() => inspectInput(Buffer.alloc(MAX_BYTES + 1)), error => error.code === "IMAGE_TOO_LARGE");
    await assert.rejects(() => inspectInput(Buffer.from("%PDF broken")), error => error.code === "UNSUPPORTED_IMAGE_FORMAT");
    await assert.rejects(() => inspectInput(Buffer.alloc(0)), error => error.code === "CORRUPT_IMAGE");
    const inputBytes = sources.reduce((sum, value) => sum + value.length, 0);
    const outputBytes = results.slice(0, 3).reduce((sum, value) => sum + value.bytes, 0);
    console.log(JSON.stringify({ success: true, formats: ["jpeg", "png", "webp"], outputs: results.length, maxConcurrency: MAX_CONCURRENCY, inputBytes, outputBytes, reductionPercent: Math.round((1 - outputBytes / inputBytes) * 100), durationMs: Date.now() - started }));
})().catch(error => { console.error(error); process.exitCode = 1; });
