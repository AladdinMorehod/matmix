(function initCrmToast(window, document) {
    const maxToasts = 3;
    const defaultDuration = 4000;
    let container = null;
    const timers = new WeakMap();

    function getContainer() {
        if (container) return container;
        container = document.createElement("div");
        container.className = "crm-toast-stack";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-label", "Уведомления CRM");
        document.body.appendChild(container);
        return container;
    }

    function removeToast(toast) {
        window.clearTimeout(timers.get(toast));
        toast.classList.add("is-leaving");
        window.setTimeout(() => toast.remove(), 180);
    }

    function startTimer(toast, duration) {
        window.clearTimeout(timers.get(toast));
        timers.set(toast, window.setTimeout(() => removeToast(toast), duration));
    }

    function show(message, type = "info", options = {}) {
        const text = String(message || "").trim();
        if (!text) return null;

        const stack = getContainer();
        while (stack.children.length >= maxToasts) {
            removeToast(stack.firstElementChild);
        }

        const toast = document.createElement("section");
        toast.className = `crm-toast crm-toast-${type}`;
        toast.innerHTML = `
            <div class="crm-toast-mark" aria-hidden="true"></div>
            <p>${escapeHtml(text)}</p>
            <button type="button" aria-label="Закрыть уведомление">×</button>
        `;

        const duration = Number(options.duration) || defaultDuration;
        toast.addEventListener("mouseenter", () => window.clearTimeout(timers.get(toast)));
        toast.addEventListener("mouseleave", () => startTimer(toast, duration));
        toast.querySelector("button")?.addEventListener("click", () => removeToast(toast));

        stack.appendChild(toast);
        startTimer(toast, duration);
        return toast;
    }

    window.CrmToast = {
        show,
        success(message, options) {
            return show(message, "success", options);
        },
        warning(message, options) {
            return show(message, "warning", options);
        },
        error(message, options) {
            return show(message, "error", options);
        },
        info(message, options) {
            return show(message, "info", options);
        }
    };
})(window, document);
