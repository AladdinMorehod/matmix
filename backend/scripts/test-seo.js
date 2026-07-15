const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const sqlite3 = require("sqlite3").verbose();

function query(file, sql, params = []) { return new Promise((resolve, reject) => { const db = new sqlite3.Database(file, sqlite3.OPEN_READONLY); db.all(sql, params, (error, rows) => db.close(() => error ? reject(error) : resolve(rows))); }); }
async function wait(url) { for (let i = 0; i < 80; i += 1) { try { if ((await fetch(url)).status) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error("SEO test server did not start."); }
function meta(html, name, property = false) { const key = property ? "property" : "name"; return html.match(new RegExp(`<meta ${key}="${name}" content="([^"]*)"`, "i"))?.[1] || ""; }
function canonical(html) { return html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] || ""; }
function jsonLd(html) { return [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1])); }
async function start(root, dbPath, indexing) {
    const port = 43000 + Math.floor(Math.random() * 1000); const base = `http://127.0.0.1:${port}`;
    const child = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { cwd: path.join(__dirname, "..", ".."), windowsHide: true, stdio: "ignore", env: { ...process.env, NODE_ENV: "test", PORT: String(port), MATMIX_DB_PATH: dbPath, SESSION_DB_PATH: path.join(root, `sessions-${port}.db`), PRODUCT_UPLOADS_PATH: path.join(root, "uploads"), APP_RUNTIME_LOCK_PATH: path.join(root, `runtime-${port}.lock`), PUBLIC_BASE_URL: base, SEO_ALLOW_INDEXING: String(indexing), SITE_NAME: "MatMix" } });
    await wait(`${base}/robots.txt`); return { child, base };
}
async function stop(child) { child.kill("SIGTERM"); await new Promise(resolve => child.once("exit", resolve)); }

(async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "matmix-seo-")); fs.mkdirSync(path.join(root, "uploads")); const dbPath = path.join(root, "matmix.db"); fs.copyFileSync(path.join(__dirname, "..", "database", "matmix.db"), dbPath);
    const [product] = await query(dbPath, "SELECT * FROM products WHERE id<>3670 AND is_active=1 AND deleted_at IS NULL AND external_id LIKE 'MAT-%' ORDER BY id LIMIT 1");
    const [inactive] = await query(dbPath, "SELECT * FROM products WHERE is_active<>1 OR deleted_at IS NOT NULL LIMIT 1");
    const legacyProducts = await query(dbPath, "SELECT * FROM products WHERE id IN (469,470,3670)");
    const [pseudoStructure] = await query(dbPath, "SELECT * FROM catalog_structure WHERE id=3670");
    const [category] = await query(dbPath, "SELECT * FROM catalog_structure WHERE type='category' AND is_active=1 AND id<>3670 AND external_code IS NOT NULL ORDER BY sort_order,id LIMIT 1"); assert(product && category);
    const production = await start(root, dbPath, true);
    try {
        const robots = await (await fetch(`${production.base}/robots.txt`)).text(); assert(robots.includes("Disallow: /api/")); assert(robots.includes(`${production.base}/sitemap.xml`));
        const sitemapResponse = await fetch(`${production.base}/sitemap.xml`); assert.strictEqual(sitemapResponse.status, 200); const sitemap = await sitemapResponse.text(); const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]); assert(locations.length > 3900); assert(locations.includes(`${production.base}/`)); assert(locations.includes(`${production.base}/catalog`)); assert(!locations.some(url => /manager|login|api|search/i.test(url)));
        for (const legacy of legacyProducts.filter(item => [469, 470].includes(item.id) && item.is_active === 1 && !item.deleted_at)) assert(locations.includes(`${production.base}/product/${encodeURIComponent(legacy.external_id.toUpperCase())}`));
        const pseudoProduct = legacyProducts.find(item => item.id === 3670); if (pseudoProduct) assert(!locations.includes(`${production.base}/product/${encodeURIComponent(pseudoProduct.external_id.toUpperCase())}`));
        if (pseudoStructure?.external_code) assert(!locations.some(url => url.endsWith(`/${encodeURIComponent(pseudoStructure.external_code.toUpperCase())}`)));
        const productUrl = `${production.base}/product/${encodeURIComponent(product.external_id.toUpperCase())}`; const productResponse = await fetch(productUrl); assert.strictEqual(productResponse.status, 200); const productHtml = await productResponse.text(); assert(productHtml.includes(product.title)); assert(productHtml.includes(product.external_id)); assert(productHtml.includes(Number(product.price) > 0 ? "₽" : "Цена по запросу")); assert.strictEqual(canonical(productHtml), productUrl); assert(meta(productHtml, "description")); assert(meta(productHtml, "og:type", true) === "product"); assert.strictEqual((productHtml.match(/<h1[ >]/gi) || []).length, 1); const productSchemas = jsonLd(productHtml); assert(productSchemas.some(item => item["@type"] === "Product")); assert(productSchemas.some(item => item["@type"] === "BreadcrumbList")); if (!(Number(product.price) > 0)) assert(!productSchemas.find(item => item["@type"] === "Product").offers);
        const categoryUrl = `${production.base}/catalog/category/${category.external_code.toUpperCase()}`; const categoryResponse = await fetch(categoryUrl); assert.strictEqual(categoryResponse.status, 200); const categoryHtml = await categoryResponse.text(); assert(categoryHtml.includes(category.name)); assert(/href="\/product\//.test(categoryHtml)); assert.strictEqual(canonical(categoryHtml), categoryUrl); assert(jsonLd(categoryHtml).some(item => item["@type"] === "BreadcrumbList"));
        const homeHtml = await (await fetch(`${production.base}/`)).text(); const catalogHtml = await (await fetch(`${production.base}/catalog`)).text(); assert(meta(homeHtml, "description")); assert(meta(catalogHtml, "description")); assert.strictEqual((catalogHtml.match(/<h1[ >]/gi) || []).length, 1); assert.strictEqual(meta(await (await fetch(`${production.base}/catalog?search=test`)).text(), "robots"), "noindex,follow");
        assert.strictEqual((await fetch(`${production.base}/index.html`, { redirect: "manual" })).status, 301); assert.strictEqual((await fetch(`${production.base}/catalog.html`, { redirect: "manual" })).status, 301); assert.strictEqual((await fetch(`${production.base}/product/UNKNOWN`)).status, 404); assert.strictEqual((await fetch(`${production.base}/catalog/category/UNKNOWN`)).status, 404); assert.strictEqual((await fetch(`${production.base}/unknown-page`)).status, 404); assert.strictEqual((await fetch(`${production.base}/api/unknown`)).headers.get("content-type").includes("application/json"), true); if (inactive) assert.strictEqual((await fetch(`${production.base}/product/${encodeURIComponent(inactive.external_id)}`)).status, 404);
        assert.strictEqual(new Set([canonical(homeHtml), canonical(catalogHtml), canonical(productHtml), canonical(categoryHtml)]).size, 4);
        console.log(JSON.stringify({ production: true, sitemapUrls: locations.length, productNoJs: true, categoryNoJs: true, jsonLd: true, canonical: true, redirects: true, notFound: true }));
    } finally { await stop(production.child); }
    const staging = await start(root, dbPath, false); try { assert((await (await fetch(`${staging.base}/robots.txt`)).text()).includes("Disallow: /")); assert.strictEqual((await fetch(`${staging.base}/sitemap.xml`)).status, 404); assert.strictEqual(meta(await (await fetch(`${staging.base}/product/${encodeURIComponent(product.external_id)}`)).text(), "robots"), "noindex,nofollow"); console.log(JSON.stringify({ stagingNoindex: true })); } finally { await stop(staging.child); }
})().catch(error => { console.error(error); process.exitCode = 1; });
