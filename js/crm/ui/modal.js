(function initCrmModal(window, document) {
    let activeModal = null;
    let previousFocus = null;

    function closeModal(result = false) {
        if (!activeModal) return;
        const { overlay, resolve } = activeModal;
        activeModal = null;
        overlay.classList.add("is-closing");
        window.setTimeout(() => overlay.remove(), 160);
        previousFocus?.focus?.();
        previousFocus = null;
        resolve(result);
    }

    function onKeydown(event) {
        if (event.key === "Escape" && activeModal) {
            closeModal(false);
        }
    }

    document.addEventListener("keydown", onKeydown);

    function open(options = {}) {
        if (activeModal) closeModal(false);

        previousFocus = document.activeElement;

        return new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.className = "crm-modal-overlay";
            overlay.innerHTML = `
                <section class="crm-modal" role="dialog" aria-modal="true" aria-labelledby="crmModalTitle">
                    <button class="crm-modal-close" type="button" aria-label="Закрыть окно">×</button>
                    <div class="crm-modal-body">
                        <h2 id="crmModalTitle">${escapeHtml(options.title || "Подтвердите действие")}</h2>
                        <p>${escapeHtml(options.message || "Продолжить?")}</p>
                    </div>
                    <div class="crm-modal-actions">
                        <button class="crm-modal-secondary" type="button">${escapeHtml(options.cancelText || "Отмена")}</button>
                        <button class="crm-modal-primary" type="button">${escapeHtml(options.confirmText || "Подтвердить")}</button>
                    </div>
                </section>
            `;

            activeModal = { overlay, resolve };
            document.body.appendChild(overlay);

            const dialog = overlay.querySelector(".crm-modal");
            const closeButton = overlay.querySelector(".crm-modal-close");
            const cancelButton = overlay.querySelector(".crm-modal-secondary");
            const confirmButton = overlay.querySelector(".crm-modal-primary");

            overlay.addEventListener("click", event => {
                if (!dialog.contains(event.target)) closeModal(false);
            });
            closeButton.addEventListener("click", () => closeModal(false));
            cancelButton.addEventListener("click", () => closeModal(false));
            confirmButton.addEventListener("click", () => closeModal(true));

            window.setTimeout(() => confirmButton.focus(), 0);
        });
    }

    window.CrmModal = {
        open
    };
})(window, document);
