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
    return { nonce: pageNonce, html: `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(safeTitle)}</title><meta name="description" content="${escapeHtml(safeDescription)}"><meta name="robots" content="${robotsValue}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="${type}"><meta property="og:title" content="${escapeHtml(safeTitle)}"><meta property="og:description" content="${escapeHtml(safeDescription)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(imageUrl(config, image))}"><meta property="og:site_name" content="${escapeHtml(config.siteName)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(safeTitle)}"><meta name="twitter:description" content="${escapeHtml(safeDescription)}"><meta name="twitter:image" content="${escapeHtml(imageUrl(config, image))}"><link rel="stylesheet" href="/css/style.css">${schemaHtml}</head><body><header class="header"><a class="logo" href="/" aria-label="На главную"><img src="/img/logo-burgundy.png" alt="MatMix"></a><nav class="nav" aria-label="Основная навигация"><a href="/">Главная</a><a href="/catalog">Каталог</a></nav></header><main class="products catalog-page">${h1 ? `<h1>${escapeHtml(h1)}</h1>` : ""}${body}</main><footer><a href="/">MatMix</a> · <a href="/catalog">Каталог</a><nav class="legal-links" aria-label="Юридическая информация"><a href="/privacy">Политика конфиденциальности</a><a href="/terms">Условия</a><a href="/delivery">Доставка</a><a href="/payment">Оплата</a><a href="/returns">Возврат</a><a href="/contacts">Контакты и реквизиты</a></nav></footer></body></html>` };
}

function productPage(config, pageData) {
    const { product, attributes = [], images = [], category = null, subcategory = null, related = [] } = pageData;
    const path = productPath(product);
    const hasPrice = Number(product.price) > 0;
    const fullDescription = String(product.full_description || product.description || "").trim();
    const lead = String(product.short_description || "").trim();
    const description = String(product.seo_description || lead || product.description || `${product.title}. Код ${product.external_id}. Каталог MatMix.`).trim();
    const title = String(product.seo_title || `${product.title} — ${product.external_id} | ${config.siteName}`).trim();
    const gallery = images.filter(item => String(item.image_url || "").trim());
    const primaryImage = gallery[0]?.image_url || product.image_url || "";
    const crumbs = [{ name: "Каталог", path: "/catalog" }];
    if (category?.external_code) crumbs.push({ name: category.name, path: categoryPath(category) });
    if (category?.external_code && subcategory?.external_code) crumbs.push({ name: subcategory.name, path: subcategoryPath(category, subcategory) });
    crumbs.push({ name: product.title, path });
    const productSchema = { "@context": "https://schema.org", "@type": "Product", name: product.title, sku: product.external_id, mpn: product.external_id, url: absolute(config, path), category: [product.category, product.subcategory, product.product_group].filter(Boolean).join(" / ") };
    if (product.brand) productSchema.brand = { "@type": "Brand", name: product.brand };
    if (gallery.length) productSchema.image = gallery.map(item => imageUrl(config, item.image_url));
    else if (primaryImage) productSchema.image = [imageUrl(config, primaryImage)];
    if (fullDescription || lead) productSchema.description = truncate(fullDescription || lead, 500);
    if (Number(product.weight) > 0) productSchema.weight = { "@type": "QuantitativeValue", value: Number(product.weight), unitText: "kg" };
    if (hasPrice) productSchema.offers = { "@type": "Offer", priceCurrency: "RUB", price: Number(product.price).toFixed(2), url: absolute(config, path) };
    const imageMarkup = primaryImage
        ? `<img class="product-page-main-image" data-gallery-main src="${escapeHtml(primaryImage)}" alt="${escapeHtml(gallery[0]?.alt_text || product.title)}" width="900" height="900" decoding="async" fetchpriority="high">`
        : `<div class="product-page-image-empty" role="img" aria-label="Изображение отсутствует"><span>Фото скоро появятся</span></div>`;
    const thumbnails = gallery.length > 1 ? `<div class="product-page-thumbnails" aria-label="Галерея товара">${gallery.map((item, index) => `<button type="button" class="product-page-thumbnail${index ? "" : " active"}" data-gallery-thumbnail data-image-url="${escapeHtml(item.image_url)}" data-image-alt="${escapeHtml(item.alt_text || product.title)}" aria-label="Показать изображение ${index + 1}" aria-pressed="${index ? "false" : "true"}"><img src="${escapeHtml(item.image_url)}" alt="" width="96" height="96" loading="lazy" decoding="async"></button>`).join("")}</div>` : "";
    const pricePerKg = hasPrice && Number(product.weight) > 0 ? `<p class="product-page-unit-price">${escapeHtml((Number(product.price) / Number(product.weight)).toFixed(2))} ₽/кг</p>` : "";
    const dataAttributes = `data-product-id="${Number(product.id)}" data-title="${escapeHtml(product.title)}" data-price="${Number(product.price) || 0}" data-weight="${Number(product.weight) || 0}" data-unit="${escapeHtml(product.unit || "шт")}"`;
    const groupedAttributes = new Map();
    for (const item of attributes) {
        const value = item.type === "boolean" ? (item.value === true ? "Да" : item.value === false ? "Нет" : "") : String(item.value ?? "").trim();
        if (!value) continue;
        const section = String(item.section || "Характеристики").trim() || "Характеристики";
        if (!groupedAttributes.has(section)) groupedAttributes.set(section, []);
        groupedAttributes.get(section).push({ ...item, displayValue: value });
    }
    const attributesMarkup = groupedAttributes.size ? `<section class="product-page-section" id="productCharacteristics" aria-labelledby="productCharacteristicsTitle"><h2 id="productCharacteristicsTitle">Характеристики</h2>${[...groupedAttributes].map(([section, rows]) => `<div class="product-page-attribute-group"><h3>${escapeHtml(section)}</h3><dl>${rows.map(item => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.displayValue)}${item.unit ? ` ${escapeHtml(item.unit)}` : ""}</dd></div>`).join("")}</dl></div>`).join("")}</section>` : "";
    const descriptionMarkup = fullDescription ? `<section class="product-page-section" id="productDescription" aria-labelledby="productDescriptionTitle"><h2 id="productDescriptionTitle">Описание</h2><div class="product-page-description">${escapeHtml(fullDescription)}</div></section>` : "";
    const contentSectionCount = Number(groupedAttributes.size > 0) + Number(Boolean(fullDescription)) + 1;
    const contentNavigation = contentSectionCount > 1 ? `<nav class="product-page-content-nav" aria-label="Разделы товара">${groupedAttributes.size ? '<a href="#productCharacteristics">Характеристики</a>' : ""}${fullDescription ? '<a href="#productDescription">Описание</a>' : ""}<a href="#productDelivery">Доставка и оплата</a></nav>` : "";
    const relatedMarkup = related.length ? `<section class="product-page-related" aria-labelledby="relatedProducts"><h2 id="relatedProducts">Похожие товары</h2><div class="product-page-related-grid">${related.map(item => `<article class="card" data-product-id="${Number(item.id)}"><div class="card-main"><a class="thumb" href="${productPath(item)}" aria-label="${escapeHtml(item.title)}">${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">` : "Фото скоро появятся"}</a><div class="card-info"><h3><a href="${productPath(item)}">${escapeHtml(item.title)}</a></h3><p>${Number(item.price) > 0 ? `${escapeHtml(item.price)} ₽ / ${escapeHtml(item.unit || "шт")}` : "Цена по запросу"}</p></div></div><div class="actions"><button class="add" type="button" data-add-product ${`data-product-id="${Number(item.id)}" data-title="${escapeHtml(item.title)}" data-price="${Number(item.price) || 0}" data-weight="${Number(item.weight) || 0}" data-unit="${escapeHtml(item.unit || "шт")}"`}>В корзину</button></div></article>`).join("")}</div></section>` : "";
    const body = `<nav class="catalog-breadcrumbs product-page-breadcrumbs" aria-label="Хлебные крошки">${crumbs.map((item, i) => `${i ? "<span>/</span>" : ""}${i === crumbs.length - 1 ? `<span class="current" aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${escapeHtml(item.path)}">${escapeHtml(item.name)}</a>`}`).join("")}</nav>
        <article class="product-page" ${dataAttributes}>
            <section class="product-page-hero">
                <div class="product-page-gallery">${imageMarkup}${thumbnails}</div>
                <div class="product-page-summary"><h1>${escapeHtml(product.title)}</h1><div class="product-page-meta"><span>MAT-код: ${escapeHtml(product.external_id)}</span>${product.brand ? `<span>Бренд: <strong>${escapeHtml(product.brand)}</strong></span>` : ""}</div>${lead ? `<p class="product-page-lead">${escapeHtml(lead)}</p>` : ""}<div class="product-page-price"><strong>${hasPrice ? `${escapeHtml(product.price)} ₽` : "Цена по запросу"}</strong>${hasPrice && product.unit ? `<span>/ ${escapeHtml(product.unit)}</span>` : ""}${pricePerKg}</div><p class="product-page-supply">Подтвердим наличие, цену и срок доставки после оформления заявки.</p><div class="product-page-buy"><div class="product-page-quantity" aria-label="Количество"><button type="button" data-quantity-minus aria-label="Уменьшить количество">−</button><input data-quantity type="number" min="1" max="999" step="1" value="1" aria-label="Количество товара"><button type="button" data-quantity-plus aria-label="Увеличить количество">+</button></div><button class="add-btn" type="button" data-add-product ${dataAttributes}>В корзину</button><button class="product-page-one-click" type="button" data-one-click>Заказать в 1 клик</button></div><span class="product-page-cart-badge" data-cart-count aria-live="polite"></span><div class="product-page-benefits" aria-label="Преимущества"><span>Доставка по Москве и области</span><span>Подтверждение менеджером</span><span>Удобная оплата</span></div></div>
            </section>
            ${contentNavigation}
            <div class="product-page-details">${attributesMarkup}${descriptionMarkup}<section class="product-page-section" id="productDelivery" aria-labelledby="productDeliveryTitle"><h2 id="productDeliveryTitle">Доставка и оплата</h2><p>Условия зависят от адреса и состава заказа. Подробнее: <a href="/delivery">доставка</a> и <a href="/payment">оплата</a>.</p></section></div>
            ${relatedMarkup}
        </article>
        <dialog class="product-page-one-click-dialog" data-one-click-dialog aria-labelledby="oneClickTitle"><form data-one-click-form><button class="product-page-dialog-close" type="button" data-one-click-close aria-label="Закрыть">×</button><h2 id="oneClickTitle">Заказать в 1 клик</h2><p class="product-page-one-click-product">${escapeHtml(product.title)}</p><label><span>Имя</span><input name="customerName" type="text" autocomplete="name" maxlength="160" required></label><label><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" maxlength="50" required></label><label><span>Количество</span><input name="quantity" type="number" min="1" max="999" step="1" value="1" required></label><label><span>Комментарий к заказу — необязательно</span><textarea name="comment" rows="3" maxlength="2000"></textarea></label><label class="product-page-one-click-consent"><input name="consent" type="checkbox" required><span><span>Я согласен(на) на:</span><span><a href="/privacy" target="_blank" rel="noopener">Обработку персональных данных</a><span> и </span><a href="/terms" target="_blank" rel="noopener">Условия продажи</a></span></span></label><input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true"><p class="product-page-one-click-message" data-one-click-message aria-live="polite"></p><div class="product-page-one-click-actions"><button type="button" data-one-click-cancel>Отменить</button><button class="add-btn" type="submit">Отправить заявку</button></div></form></dialog><script src="/js/product-page.js" defer></script>`;
    return page({ config, title, description, pathname: path, h1: "", body, type: "product", image: primaryImage, schemas: [breadcrumb(config, crumbs), productSchema] });
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
