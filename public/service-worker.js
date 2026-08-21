self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.getDeterministicPushTag = function getDeterministicPushTag(payload) {
    const orderId = Number(payload?.orderId);
    if (!Number.isSafeInteger(orderId) || orderId <= 0) return "matmix-order-invalid";
    const expectedEventId = `order-${orderId}`;
    const eventId = typeof payload?.eventId === "string" && payload.eventId === expectedEventId
        ? payload.eventId
        : expectedEventId;
    return `matmix-${eventId}`;
};

self.hasExistingPushNotification = async function hasExistingPushNotification(tag) {
    if (!tag || !self.registration.getNotifications) return false;
    try {
        const notifications = await self.registration.getNotifications({ tag });
        return notifications.some(notification => notification && notification.tag === tag);
    } catch {
        return false;
    }
};

self.syncPushBadge = async function syncPushBadge(value) {
    const badgeNavigator = self.navigator;
    if (!badgeNavigator) return;
    const unreadCount = Number(value);
    if (!Number.isFinite(unreadCount)) return;
    try {
        if (unreadCount > 0 && typeof badgeNavigator.setAppBadge === "function") {
            await badgeNavigator.setAppBadge(Math.floor(unreadCount));
        } else if (typeof badgeNavigator.clearAppBadge === "function") {
            await badgeNavigator.clearAppBadge();
        } else if (typeof badgeNavigator.setAppBadge === "function") {
            await badgeNavigator.setAppBadge(0);
        }
    } catch {
        // Badge support is optional and must never abort notification delivery.
    }
};

self.addEventListener("push", event => {
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
    const orderId = Number(payload.orderId);
    const url = Number.isSafeInteger(orderId) && orderId > 0 ? `/manager#order-${orderId}` : "/manager";
    const tag = self.getDeterministicPushTag(payload);
    const options = {
        body: typeof payload.body === "string" ? payload.body : "Новая заявка в MatMix",
        icon: "/img/logo-current.png",
        badge: "/img/logo-current.png",
        tag,
        data: { orderId, url },
        renotify: false
    };
    event.waitUntil((async () => {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const hasVisibleCrm = clients.some(client => {
            try {
                const url = new URL(client.url);
                return url.origin === self.location.origin
                    && (url.pathname === "/manager" || url.pathname === "/manager.html")
                    && (client.focused === true || client.visibilityState === "visible");
            } catch {
                return false;
            }
        });
        if (!hasVisibleCrm) {
            const duplicate = await self.hasExistingPushNotification(tag);
            if (!duplicate) {
                await self.registration.showNotification(typeof payload.title === "string" ? payload.title : "Новый заказ", options);
            }
        }
        await self.syncPushBadge(payload.unreadCount);
    })());
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    const orderId = Number(event.notification.data?.orderId);
    const target = Number.isSafeInteger(orderId) && orderId > 0 ? `/manager#order-${orderId}` : "/manager";
    event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async clients => {
        const existing = clients.find(client => new URL(client.url).origin === self.location.origin);
        if (existing) {
            if (existing.navigate) await existing.navigate(target);
            return existing.focus?.();
        }
        return self.clients.openWindow(target);
    }));
});
