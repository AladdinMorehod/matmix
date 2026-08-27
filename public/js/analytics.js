"use strict";

(() => {
    const EVENT_NAMES = new Set([
        "product_view", "product_click", "add_to_cart", "cart_open", "begin_checkout",
        "one_click_open", "one_click_submit", "one_click_success", "one_click_error",
        "checkout_success", "checkout_error", "search"
    ]);
    const SAFE_KEYS = new Set(["external_id", "title", "category", "subcategory", "product_group", "unit", "quantity", "price", "source", "query_length", "results_count", "order_source"]);
    const PII_KEYS = /phone|telephone|email|name|customer|comment|address|consent/i;
    let counterId = "";
    let providerReady = false;
    let providerPromise = null;
    let configLoaded = false;
    const pendingEvents = [];

    function safePayload(params = {}) {
        return Object.fromEntries(Object.entries(params).filter(([key, value]) => SAFE_KEYS.has(key) && !PII_KEYS.test(key) && value !== undefined && value !== null));
    }

    function loadProvider(id) {
        if (!/^\d+$/.test(String(id || ""))) return Promise.resolve(false);
        counterId = String(id);
        if (window.ym) {
            window.ym(Number(counterId), "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
            providerReady = true;
            return Promise.resolve(true);
        }
        window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
        window.ym.l = Date.now();
        providerPromise = new Promise(resolve => {
            const script = document.createElement("script");
            script.async = true;
            script.src = `https://mc.yandex.ru/metrika/tag.js?id=${encodeURIComponent(counterId)}`;
            script.onload = () => { providerReady = true; window.ym(Number(counterId), "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true }); pendingEvents.splice(0).forEach(([name, payload]) => track(name, payload)); resolve(true); };
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
        return providerPromise;
    }

    function track(eventName, params = {}) {
        if (!EVENT_NAMES.has(eventName)) return false;
        if (!counterId) { if (!configLoaded) pendingEvents.push([eventName, params]); return false; }
        if (!providerReady) { pendingEvents.push([eventName, params]); return false; }
        try {
            window.ym(Number(counterId), "reachGoal", eventName, safePayload(params));
            return true;
        } catch {
            return false;
        }
    }

    window.matmixAnalytics = { track, productView: params => track("product_view", params), productClick: params => track("product_click", params), addToCart: params => track("add_to_cart", params), oneClickOpen: params => track("one_click_open", params), oneClickSubmit: params => track("one_click_submit", params), oneClickSuccess: params => track("one_click_success", params) };

    document.addEventListener("click", event => {
        const link = event.target.closest("a[href^='/product/']");
        if (!link) return;
        const card = link.closest(".card");
        const source = card?.closest(".product-page-related") ? "related" : card?.closest("#featuredCatalog") ? "featured" : card?.closest("#popularGrid") ? "popular" : card?.closest("#searchDropdown") ? "search" : "catalog";
        track("product_click", { external_id: decodeURIComponent(link.getAttribute("href").split("/").pop()), title: card?.querySelector("h3")?.textContent?.trim(), source });
    });

    const trackProductView = () => {
        const product = document.querySelector(".product-page");
        if (!product || product.dataset.analyticsViewed) return;
        product.dataset.analyticsViewed = "true";
        track("product_view", { external_id: product.dataset.externalId, title: product.dataset.title, price: Number(product.dataset.price) || undefined, unit: product.dataset.unit, source: "product_page" });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", trackProductView, { once: true });
    else trackProductView();

    fetch("/api/public/analytics-config", { credentials: "same-origin" })
        .then(response => response.ok ? response.json() : null)
        .then(config => { configLoaded = true; if (!config?.yandexMetrikaId) pendingEvents.length = 0; return loadProvider(config?.yandexMetrikaId); })
        .catch(() => false);
})();
