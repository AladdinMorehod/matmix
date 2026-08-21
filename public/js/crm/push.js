(function initCrmWebPush(window, document) {
    let boundRoot = null;
    let boundButton = null;

    function setState(root, message, { enabled = false, disabled = false } = {}) {
        const status = root?.querySelector("#crmPushStatus");
        const button = root?.querySelector("#crmEnablePush");
        const disableButton = root?.querySelector("#crmDisablePush");
        if (status) status.textContent = message;
        if (button) button.disabled = disabled;
        if (disableButton) {
            disableButton.hidden = !enabled;
            disableButton.disabled = disabled;
        }
        if (button) button.hidden = enabled;
    }

    async function enable(root) {
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
            setState(root, "Этот браузер не поддерживает Web Push.", { disabled: true });
            return;
        }
        try {
            const config = await window.CrmApi.get("/api/order-notifications/push/config");
            if (!config.enabled || !config.publicKey) {
                setState(root, "Уведомления пока отключены на сервере.", { disabled: true });
                return;
            }
            if (Notification.permission === "denied") {
                setState(root, "Уведомления запрещены в настройках браузера.", { disabled: true });
                return;
            }
            const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
            if (permission !== "granted") { setState(root, "Разрешение на уведомления не предоставлено."); return; }
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToBytes(config.publicKey) });
            await window.CrmApi.post("/api/order-notifications/push/subscriptions", subscription.toJSON());
            setState(root, "Уведомления включены.", { enabled: true });
        } catch (error) {
            setState(root, "Не удалось включить уведомления. Повторите позже.");
            window.CrmErrorHandler?.report?.(error);
        }
    }

    async function refresh(root) {
        if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
            setState(root, "Этот браузер не поддерживает Web Push.", { disabled: true });
            return;
        }
        try {
            const config = await window.CrmApi.get("/api/order-notifications/push/config");
            if (!config.enabled || !config.publicKey) {
                setState(root, "Уведомления пока отключены на сервере.", { disabled: true });
                return;
            }
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription && Notification.permission === "granted") setState(root, "Уведомления включены.", { enabled: true });
            else if (Notification.permission === "denied") setState(root, "Уведомления запрещены в настройках браузера.", { disabled: true });
            else setState(root, "Уведомления выключены.");
        } catch (error) {
            setState(root, "Состояние уведомлений недоступно.");
            window.CrmErrorHandler?.report?.(error);
        }
    }

    async function disable(root) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await window.CrmApi.delete("/api/order-notifications/push/subscriptions", { endpoint: subscription.endpoint });
                await subscription.unsubscribe();
            }
            if (typeof navigator.clearAppBadge === "function") await navigator.clearAppBadge().catch(() => {});
            setState(root, "Уведомления выключены.");
        } catch (error) {
            setState(root, "Не удалось отключить уведомления. Повторите позже.");
            window.CrmErrorHandler?.report?.(error);
        }
    }

    function urlBase64ToBytes(value) {
        const padding = "=".repeat((4 - value.length % 4) % 4);
        const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
        return Uint8Array.from(raw, char => char.charCodeAt(0));
    }

    function bind(root) {
        if (!root || boundRoot === root) return;
        boundRoot = root;
        boundButton = root.querySelector("#crmEnablePush");
        boundButton?.addEventListener("click", () => enable(root));
        root.querySelector("#crmDisablePush")?.addEventListener("click", () => disable(root));
        refresh(root);
    }

    window.CrmWebPush = { bind, enable, disable, refresh };
})(window, document);
