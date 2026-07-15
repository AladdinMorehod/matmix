const express = require("express");
const fs = require("fs");
const path = require("path");
const seo = require("../services/seo");
const legal = require("../services/legal");

module.exports = function createSeoRouter({ publicDir, get, all, config }) {
    const router = express.Router();
    router.use((req, res, next) => { if (req.path.endsWith("/") && req.path !== "/") return res.redirect(301, req.originalUrl.replace(/\/(\?|$)/, "$1")); next(); });
    const csp = (res, nonce) => res.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:`);
    const send = (res, rendered, status = 200) => { csp(res, rendered.nonce); res.status(status).set("Cache-Control", "no-cache").type("html").send(rendered.html); };
    function staticPage(fileName, metadata) {
        const source = fs.readFileSync(path.join(publicDir, fileName), "utf8").replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.escapeHtml(metadata.title)}</title>`); const rendered = seo.page({ config, ...metadata, body: "" });
        const head = rendered.html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
        const additions = head.replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<title>[\s\S]*?<\/title>|<link rel="stylesheet"[^>]*>/gi, "");
        return { nonce: rendered.nonce, html: source.replace("</head>", `${additions}</head>`) };
    }
    const structure = (code, type) => get("SELECT * FROM catalog_structure WHERE type=? AND is_active=1 AND id<>3670 AND UPPER(external_code)=UPPER(?)", [type, code]);
    router.get("/index.html", (req, res) => res.redirect(301, "/"));
    router.get("/catalog.html", (req, res) => res.redirect(301, `/catalog${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`));
    router.get("/", (req, res) => send(res, staticPage("index.html", { title: "MatMix — строительные материалы для ремонта и отделки", description: "Каталог строительных и отделочных материалов MatMix с подбором товаров и доставкой.", pathname: "/", h1: "MatMix", schemas: [{ "@context": "https://schema.org", "@type": "Organization", name: config.siteName, url: seo.absolute(config, "/") }, { "@context": "https://schema.org", "@type": "WebSite", name: config.siteName, url: seo.absolute(config, "/") }] })));
    router.get("/catalog", async (req, res, next) => { try {
        const categories = await all("SELECT * FROM catalog_structure WHERE type='category' AND is_active=1 AND id<>3670 AND external_code IS NOT NULL ORDER BY sort_order,id");
        const rendered = staticPage("catalog.html", { title: "Каталог строительных материалов | MatMix", description: "Каталог строительных материалов MatMix: категории, поиск, цены и оформление заказа.", pathname: "/catalog", h1: "Каталог", robots: req.query.search ? "noindex,follow" : "", schemas: [seo.breadcrumb(config, [{ name: "Главная", path: "/" }, { name: "Каталог", path: "/catalog" }])] });
        const links = `<noscript><section><h2>Категории каталога</h2><ul>${categories.map(item => `<li><a href="${seo.categoryPath(item)}">${seo.escapeHtml(item.name)}</a></li>`).join("")}</ul></section></noscript>`;
        rendered.html = rendered.html.replace("</main>", `${links}</main>`).replace("</body>", `${links}</body>`); send(res, rendered);
    } catch (error) { next(error); } });
    const legalDocuments = legal.documentDefinitions(legal.legalConfig());
    for (const legalPath of legal.LEGAL_PATHS) router.get(legalPath, (req, res) => {
        const document = legalDocuments[legalPath];
        const nav = `<nav aria-label="Юридические документы">${legal.LEGAL_PATHS.map(item => `<a href="${item}">${seo.escapeHtml(legalDocuments[item].title)}</a>`).join(" · ")}</nav>`;
        const body = `${nav}${document.sections.map(([heading, text]) => `<section><h2>${seo.escapeHtml(heading)}</h2><p>${seo.escapeHtml(text)}</p></section>`).join("")}`;
        send(res, seo.page({ config, title: `${document.title} | ${config.siteName}`, description: document.description, pathname: legalPath, h1: document.title, body }));
    });
    router.get("/product/:code", async (req, res, next) => { try {
        const product = await get(`SELECT p.*,c.external_code category_code,sc.external_code subcategory_code FROM products p LEFT JOIN catalog_structure c ON c.type='category' AND c.is_active=1 AND c.name=p.category LEFT JOIN catalog_structure sc ON sc.type='subcategory' AND sc.is_active=1 AND sc.parent_id=c.id AND sc.name=p.subcategory WHERE p.id<>3670 AND p.is_active=1 AND p.deleted_at IS NULL AND UPPER(p.external_id)=UPPER(?)`, [req.params.code]);
        if (!product) return send(res, seo.notFoundPage(config), 404); const canonical = seo.productPath(product); if (req.path !== canonical) return res.redirect(301, canonical); send(res, seo.productPage(config, product));
    } catch (error) { next(error); } });
    async function categoryRequest(req, res, next, subCode = "") { try {
        const category = await structure(req.params.categoryCode, "category"); if (!category) return send(res, seo.notFoundPage(config), 404);
        let node = category; let parent = null; if (subCode) { node = await structure(subCode, "subcategory"); parent = category; if (!node || Number(node.parent_id) !== Number(category.id)) return send(res, seo.notFoundPage(config), 404); }
        const canonical = subCode ? seo.subcategoryPath(category, node) : seo.categoryPath(category); if (req.path !== canonical) return res.redirect(301, `${canonical}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`);
        const pageNumber = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1)); const limit = 40; const where = subCode ? "p.category=? AND p.subcategory=?" : "p.category=?"; const params = subCode ? [category.name, node.name] : [category.name];
        const count = Number((await get(`SELECT COUNT(*) count FROM products p WHERE p.id<>3670 AND p.is_active=1 AND p.deleted_at IS NULL AND ${where}`, params)).count); const totalPages = Math.max(1, Math.ceil(count / limit)); if (pageNumber > totalPages) return send(res, seo.notFoundPage(config), 404);
        const products = await all(`SELECT p.* FROM products p WHERE p.id<>3670 AND p.is_active=1 AND p.deleted_at IS NULL AND ${where} ORDER BY p.sort_order,p.id LIMIT ? OFFSET ?`, [...params, limit, (pageNumber - 1) * limit]);
        const children = subCode ? [] : await all("SELECT * FROM catalog_structure WHERE type='subcategory' AND parent_id=? AND is_active=1 AND id<>3670 ORDER BY sort_order,id", [category.id]); send(res, seo.categoryPage(config, node, parent, children, products, pageNumber, totalPages));
    } catch (error) { next(error); } }
    router.get("/catalog/category/:categoryCode", (req, res, next) => categoryRequest(req, res, next));
    router.get("/catalog/category/:categoryCode/:subcategoryCode", (req, res, next) => categoryRequest(req, res, next, req.params.subcategoryCode));
    router.get("/robots.txt", (req, res) => { const body = config.indexing ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /manager\nDisallow: /login\nDisallow: /catalog?search=\nSitemap: ${seo.absolute(config, "/sitemap.xml")}\n` : "User-agent: *\nDisallow: /\n"; res.set("Cache-Control", "public, max-age=300").type("text/plain").send(body); });
    router.get("/sitemap.xml", async (req, res, next) => { try {
        if (!config.indexing) return res.status(404).type("text/plain").send("Sitemap is disabled.");
        const structures = await all("SELECT * FROM catalog_structure WHERE is_active=1 AND id<>3670 AND external_code IS NOT NULL AND type IN ('category','subcategory') ORDER BY sort_order,id"); const categories = new Map(structures.filter(x => x.type === "category").map(x => [x.id, x]));
        const products = await all("SELECT id,external_id,updated_at FROM products WHERE id<>3670 AND is_active=1 AND deleted_at IS NULL AND external_id IS NOT NULL ORDER BY sort_order,id"); const urls = [{ path: "/" }, { path: "/catalog" }, ...legal.LEGAL_PATHS.map(path => ({ path }))];
        for (const item of structures) { if (item.type === "category") urls.push({ path: seo.categoryPath(item), updated_at: item.updated_at }); else if (categories.has(item.parent_id)) urls.push({ path: seo.subcategoryPath(categories.get(item.parent_id), item), updated_at: item.updated_at }); } for (const product of products) urls.push({ path: seo.productPath(product), updated_at: product.updated_at });
        if (urls.length > 50000) throw new Error("Sitemap exceeds 50,000 URLs; implement a sitemap index."); const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(x => `<url><loc>${seo.escapeXml(seo.absolute(config, x.path))}</loc>${x.updated_at ? `<lastmod>${seo.escapeXml(new Date(x.updated_at).toISOString())}</lastmod>` : ""}</url>`).join("")}</urlset>`; res.set("Cache-Control", "public, max-age=900").type("application/xml").send(xml);
    } catch (error) { next(error); } });
    router.notFound = (req, res) => req.path.startsWith("/api/") ? res.status(404).json({ success: false, message: "Маршрут не найден." }) : send(res, seo.notFoundPage(config), 404);
    return router;
};
