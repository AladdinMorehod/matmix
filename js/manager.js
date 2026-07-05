// Compatibility loader. manager.html loads js/crm/*.js directly.
(function loadCrmChunks() {
    const scripts = [
        "js/crm/state.js",
        "js/crm/orders.js",
        "js/crm/clients.js",
        "js/crm/actions.js",
        "js/crm/dashboard.js",
        "js/crm/settings.js",
        "js/crm/manager.js"
    ];

    scripts.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    })), Promise.resolve()).catch(() => {
        const message = document.getElementById("managerMessage");
        if (message) message.textContent = "Не удалось загрузить CRM. Обновите страницу.";
    });
})();
