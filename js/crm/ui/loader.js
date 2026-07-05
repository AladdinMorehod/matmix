(function initCrmLoader(window) {
    function render(message = "Загрузка...") {
        return `
            <div class="crm-loader" role="status" aria-live="polite">
                <span class="crm-spinner" aria-hidden="true"></span>
                <span>${escapeHtml(message)}</span>
            </div>
        `;
    }

    window.CrmLoader = {
        render
    };
})(window);
