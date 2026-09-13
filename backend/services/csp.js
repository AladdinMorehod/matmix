function buildContentSecurityPolicy({ nonce = "", yandexMetrikaId = "" } = {}) {
    const yandexEnabled = /^\d+$/.test(String(yandexMetrikaId || "").trim());
    const yandexSources = yandexEnabled ? " https://mc.yandex.ru" : "";
    const nonceSource = nonce ? ` 'nonce-${nonce}'` : "";
    const yandexConnectSources = yandexEnabled ? " https://mc.yandex.ru wss://mc.yandex.ru" : "";
    const yandexFrameSources = yandexEnabled ? " blob: https://mc.yandex.ru https://mc.yandex.md" : "";
    return `default-src 'self'; script-src 'self'${nonceSource}${yandexSources}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${yandexSources}; font-src 'self' data:; connect-src 'self'${yandexConnectSources}; frame-src 'self'${yandexFrameSources}; child-src 'self'${yandexFrameSources}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; worker-src 'self' blob:`;
}

module.exports = { buildContentSecurityPolicy };
