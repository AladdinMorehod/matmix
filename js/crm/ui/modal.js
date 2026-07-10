(function initCrmModal(window, document) {
    let activeModal = null;
    let previousFocus = null;
    let overlayPointerStarted = false;

    function closeModal(result = false) {
        if (!activeModal) return;
        const { overlay, resolve } = activeModal;
        activeModal = null;
        overlayPointerStarted = false;
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

    function bindOverlayClose(overlay, result) {
        overlay.addEventListener("pointerdown", event => {
            overlayPointerStarted = event.target === overlay;
        });

        overlay.addEventListener("pointerup", event => {
            const shouldClose = overlayPointerStarted && event.target === overlay;
            overlayPointerStarted = false;

            if (shouldClose) {
                closeModal(result);
            }
        });

        overlay.addEventListener("pointercancel", () => {
            overlayPointerStarted = false;
        });
    }

    function open(options = {}) {
        if (activeModal) closeModal(false);
        overlayPointerStarted = false;

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

            bindOverlayClose(overlay, false);
            closeButton.addEventListener("click", () => closeModal(false));
            cancelButton.addEventListener("click", () => closeModal(false));
            confirmButton.addEventListener("click", () => closeModal(true));

            window.setTimeout(() => confirmButton.focus(), 0);
        });
    }

    function form(options = {}) {
        if (activeModal) closeModal(false);
        overlayPointerStarted = false;

        previousFocus = document.activeElement;

        return new Promise(resolve => {
            const overlay = document.createElement("div");
            overlay.className = "crm-modal-overlay";
            overlay.innerHTML = `
                <section class="crm-modal crm-modal-wide" role="dialog" aria-modal="true" aria-labelledby="crmModalTitle">
                    <button class="crm-modal-close" type="button" aria-label="Закрыть окно">×</button>
                    <form class="crm-modal-form">
                        <div class="crm-modal-body">
                            <h2 id="crmModalTitle">${escapeHtml(options.title || "Форма")}</h2>
                            ${options.description ? `<p>${escapeHtml(options.description)}</p>` : ""}
                        </div>
                        <div class="crm-modal-content">${options.content || ""}</div>
                        <div class="crm-modal-actions">
                            <button class="crm-modal-secondary" type="button">${escapeHtml(options.cancelText || "Отмена")}</button>
                            <button class="crm-modal-primary" type="submit">${escapeHtml(options.submitText || "Сохранить")}</button>
                        </div>
                    </form>
                </section>
            `;

            activeModal = { overlay, resolve };
            document.body.appendChild(overlay);

            const dialog = overlay.querySelector(".crm-modal");
            const formElement = overlay.querySelector(".crm-modal-form");
            const closeButton = overlay.querySelector(".crm-modal-close");
            const cancelButton = overlay.querySelector(".crm-modal-secondary");
            const draftKey = options.draftKey || "";

            if (draftKey) {
                window.CrmDrafts?.bindForm(formElement, draftKey);
            }

            bindOverlayClose(overlay, null);
            closeButton.addEventListener("click", () => closeModal(null));
            cancelButton.addEventListener("click", () => closeModal(null));
            formElement.addEventListener("submit", event => {
                event.preventDefault();
                if (draftKey) {
                    window.CrmDrafts?.clear(draftKey);
                }
                closeModal(new FormData(formElement));
            });

            window.setTimeout(() => formElement.querySelector("input, select, textarea, button")?.focus(), 0);
        });
    }

    window.CrmModal = {
        open,
        form
    };
})(window, document);
