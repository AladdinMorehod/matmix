const crypto = require("crypto");

const SITE_NAME = String(process.env.SITE_NAME || "MatMix").trim().slice(0, 80) || "MatMix";

function seoConfig(env = process.env) {
    const indexing = String(env.SEO_ALLOW_INDEXING || "").toLowerCase() === "true";
    const rawBase = String(env.PUBLIC_BASE_URL || "").trim();
    let baseUrl = "";
    if (rawBase) {
        const parsed = new URL(rawBase);
        if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") throw new Error("PUBLIC_BASE_URL must be an http(s) origin without path, credentials, query or hash.");
        baseUrl = parsed.origin;
    }
    if (indexing && !baseUrl) throw new Error("PUBLIC_BASE_URL is required when SEO_ALLOW_INDEXING=true.");
    return { indexing, baseUrl, siteName: SITE_NAME, defaultOgImage: String(env.DEFAULT_OG_IMAGE || "/img/logo-burgundy.png") };
}

function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
function escapeXml(value) { return escapeHtml(value); }
function truncate(value, length) { return Array.from(String(value || "").replace(/\s+/g, " ").trim()).slice(0, length).join(""); }
function absolute(config, pathname) { return config.baseUrl ? new URL(pathname, `${config.baseUrl}/`).href : pathname; }
function codePath(code) { return encodeURIComponent(String(code || "").trim().toUpperCase()); }
function productPath(product) { return `/product/${codePath(product.external_id)}`; }
function categoryPath(category) { return `/catalog/category/${codePath(category.external_code)}`; }
function subcategoryPath(category, subcategory) { return `${categoryPath(category)}/${codePath(subcategory.external_code)}`; }
function imageUrl(config, value) { const safe = /^\/uploads\/products\/[A-Za-z0-9._-]+$/.test(String(value || "")) ? value : config.defaultOgImage; return absolute(config, safe); }
function jsonLd(value) { return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026"); }
function nonce() { return crypto.randomBytes(16).toString("base64"); }

function breadcrumb(config, items) {
    return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absolute(config, item.path) })) };
}

function page({ config, title, description, pathname, h1, body, type = "website", image = "", schemas = [], robots = "" }) {
    const pageNonce = nonce();
    const canonical = absolute(config, pathname);
    const safeTitle = truncate(title, 65); const safeDescription = truncate(description, 170);
    const robotsValue = robots || (config.indexing ? "index,follow" : "noindex,nofollow");
    const schemaHtml = schemas.map(schema => `<script nonce="${pageNonce}" type="application/ld+json">${jsonLd(schema)}</script>`).join("\n");
    return { nonce: pageNonce, html: `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(safeTitle)}</title><meta name="description" content="${escapeHtml(safeDescription)}"><meta name="robots" content="${robotsValue}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="${type}"><meta property="og:title" content="${escapeHtml(safeTitle)}"><meta property="og:description" content="${escapeHtml(safeDescription)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(imageUrl(config, image))}"><meta property="og:site_name" content="${escapeHtml(config.siteName)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(safeTitle)}"><meta name="twitter:description" content="${escapeHtml(safeDescription)}"><meta name="twitter:image" content="${escapeHtml(imageUrl(config, image))}"><link rel="stylesheet" href="/css/style.css">${schemaHtml}</head><body><header class="header"><a class="logo" href="/" aria-label="На главную"><img src="/img/logo-burgundy.png" alt="MatMix"></a><nav class="nav" aria-label="Основная навигация"><a href="/">Главная</a><a href="/catalog">Каталог</a></nav></header><main class="products catalog-page"><h1>${escapeHtml(h1)}</h1>${body}</main><footer><a href="/">MatMix</a> · <a href="/catalog">Каталог</a></footer></body></html>` };
}

function productPage(config, product) {
    const path = productPath(product); const hasPrice = Number(product.price) > 0;
    const description = product.description ? truncate(product.description, 165) : `${product.title}. Код ${product.external_id}. Каталог MatMix.`;
    const crumbs = [{ name: "Главная", path: "/" }, { name: "Каталог", path: "/catalog" }];
    if (product.category_code) crumbs.push({ name: product.category, path: `/catalog/category/${codePath(product.category_code)}` });
    if (product.subcategory_code) crumbs.push({ name: product.subcategory, path: `/catalog/category/${codePath(product.category_code)}/${codePath(product.subcategory_code)}` });
    crumbs.push({ name: product.title, path });
    const productSchema = { "@context": "https://schema.org", "@type": "Product", name: product.title, sku: product.external_id, mpn: product.external_id, url: absolute(config, path), category: [product.category, product.subcategory, product.product_group].filter(Boolean).join(" / ") };
    if (product.image_url) productSchema.image = [imageUrl(config, product.image_url)];
    if (product.description) productSchema.description = truncate(product.description, 500);
    if (Number(product.weight) > 0) productSchema.weight = { "@type": "QuantitativeValue", value: Number(product.weight), unitText: "kg" };
    if (hasPrice) productSchema.offers = { "@type": "Offer", priceCurrency: "RUB", price: Number(product.price).toFixed(2), url: absolute(config, path) };
    const image = product.image_url ? `<img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.title)}" width="1000" height="1000" decoding="async">` : `<div class="thumb" aria-label="Изображение отсутствует">${escapeHtml(String(product.title).slice(0, 1))}</div>`;
    const facts = [["Код", product.external_id], ["Категория", product.category], ["Подкатегория", product.subcategory], ["Группа", product.product_group], ["Единица", product.unit], ["Вес", Number(product.weight) > 0 ? `${product.weight} кг` : ""]].filter(([, value]) => value);
    const body = `<nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">${crumbs.map((item, i) => `${i ? "<span>/</span>" : ""}<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`).join("")}</nav><article class="card">${image}<p><strong>${hasPrice ? `${escapeHtml(product.price)} ₽` : "Цена по запросу"}</strong></p><dl>${facts.map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>${product.description ? `<p>${escapeHtml(product.description)}</p>` : ""}<button class="add-btn" type="button" data-add-product data-product-id="${Number(product.id)}" data-title="${escapeHtml(product.title)}" data-price="${Number(product.price) || 0}" data-weight="${Number(product.weight) || 0}" data-unit="${escapeHtml(product.unit || "шт")}">Добавить в корзину</button> <a href="/catalog?search=${encodeURIComponent(product.external_id)}">Открыть в каталоге</a></article><script src="/js/product-page.js" defer></script>`;
    return page({ config, title: `${product.title} — ${product.external_id} | ${config.siteName}`, description, pathname: path, h1: product.title, body, type: "product", image: product.image_url, schemas: [breadcrumb(config, crumbs), productSchema] });
}

function categoryPage(config, node, parent, children, products, pageNumber, totalPages) {
    const isSub = node.type === "subcategory"; const path = isSub ? subcategoryPath(parent, node) : categoryPath(node);
    const heading = isSub ? `${node.name} — ${parent.name}` : node.name;
    const crumbs = [{ name: "Главная", path: "/" }, { name: "Каталог", path: "/catalog" }]; if (isSub) crumbs.push({ name: parent.name, path: categoryPath(parent) }); crumbs.push({ name: node.name, path });
    const childHtml = children.length ? `<section><h2>Подкатегории</h2><ul>${children.map(child => `<li><a href="${subcategoryPath(node, child)}">${escapeHtml(child.name)}</a></li>`).join("")}</ul></section>` : "";
    const productHtml = `<section><h2>Товары</h2><ul>${products.map(product => `<li><a href="${productPath(product)}">${escapeHtml(product.title)} — ${escapeHtml(product.external_id)}</a>${Number(product.price) > 0 ? `, ${escapeHtml(product.price)} ₽` : ", цена по запросу"}</li>`).join("")}</ul></section>`;
    const pages = totalPages > 1 ? `<nav aria-label="Страницы">${pageNumber > 1 ? `<a href="${path}?page=${pageNumber - 1}">Предыдущая</a>` : ""} <span>Страница ${pageNumber} из ${totalPages}</span> ${pageNumber < totalPages ? `<a href="${path}?page=${pageNumber + 1}">Следующая</a>` : ""}</nav>` : "";
    const canonicalPath = pageNumber > 1 ? `${path}?page=${pageNumber}` : path;
    return page({ config, title: `${heading} | ${config.siteName}`, description: `Каталог товаров категории «${heading}» в ${config.siteName}.`, pathname: canonicalPath, h1: heading, body: `<nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">${crumbs.map((item, i) => `${i ? "<span>/</span>" : ""}<a href="${item.path}">${escapeHtml(item.name)}</a>`).join("")}</nav>${childHtml}${productHtml}${pages}`, schemas: [breadcrumb(config, crumbs)] });
}

function notFoundPage(config) { return page({ config, title: `Страница не найдена | ${config.siteName}`, description: "Запрошенная страница не найдена.", pathname: "/404", h1: "Страница не найдена", body: '<p>Проверьте адрес или перейдите на <a href="/">главную</a> либо в <a href="/catalog">каталог</a>.</p>', robots: "noindex,follow" }); }

module.exports = { seoConfig, escapeHtml, escapeXml, absolute, codePath, productPath, categoryPath, subcategoryPath, breadcrumb, jsonLd, page, productPage, categoryPage, notFoundPage };
