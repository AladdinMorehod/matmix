const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function createHarness({ clients = [], badge = "supported", badgeError = false } = {}) {
    const listeners = new Map();
    const notifications = [];
    const shown = [];
    const badgeCalls = [];
    const clearBadgeCalls = [];
    const registration = {
        async getNotifications({ tag } = {}) {
            return notifications.filter(notification => !tag || notification.tag === tag);
        },
        async showNotification(title, options) {
            const notification = { title, ...options };
            notifications.push(notification);
            shown.push(notification);
        }
    };
    const badgeNavigator = {};
    if (badge !== "unsupported") {
        badgeNavigator.setAppBadge = async value => {
            badgeCalls.push(value);
            if (badgeError) throw new Error("badge unavailable");
        };
        badgeNavigator.clearAppBadge = async () => {
            clearBadgeCalls.push(true);
            if (badgeError) throw new Error("badge unavailable");
        };
    }
    const self = {
        location: { origin: "https://matmix.test" },
        navigator: badgeNavigator,
        registration,
        clients: {
            async matchAll() { return clients; },
            async openWindow(url) { return { url }; },
            claim() {}
        },
        addEventListener(type, listener) { listeners.set(type, listener); },
        skipWaiting() {}
    };
    const context = { self, URL, Number, Promise, console };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../../public/service-worker.js"), "utf8"), context);
    return {
        shown,
        badgeCalls,
        clearBadgeCalls,
        async push(payload) {
            let pending;
            listeners.get("push")({
                data: { json: () => payload },
                waitUntil(value) { pending = value; }
            });
            await pending;
        }
    };
}

async function main() {
    const background = createHarness();
    await background.push({ orderId: 41, eventId: "order-41", unreadCount: 5, title: "Order 41" });
    await background.push({ orderId: 41, eventId: "order-41", unreadCount: 5, title: "Order 41 duplicate" });
    await background.push({ orderId: 42, eventId: "order-42", unreadCount: 5, title: "Order 42" });
    assert.strictEqual(background.shown.length, 2);
    assert.deepStrictEqual(background.shown.map(item => item.tag), ["matmix-order-41", "matmix-order-42"]);
    assert.deepStrictEqual(background.badgeCalls, [5, 5, 5]);

    const zero = createHarness();
    await zero.push({ orderId: 45, eventId: "order-45", unreadCount: 0 });
    assert.deepStrictEqual(zero.clearBadgeCalls, [true]);

    const malformed = createHarness({ badge: "unsupported" });
    await malformed.push({ orderId: "41<script>", eventId: "javascript:alert(1)" });
    assert.strictEqual(malformed.shown[0].tag, "matmix-order-invalid");
    assert.strictEqual(malformed.shown[0].data.url, "/manager");

    const badgeError = createHarness({ badgeError: true });
    await badgeError.push({ orderId: 44, eventId: "order-44", unreadCount: 5 });
    assert.strictEqual(badgeError.shown.length, 1);

    const visible = createHarness({ clients: [{
        url: "https://matmix.test/manager",
        focused: false,
        visibilityState: "visible"
    }] });
    await visible.push({ orderId: 43, eventId: "order-43", unreadCount: 5 });
    assert.strictEqual(visible.shown.length, 0);

    console.log(JSON.stringify({ success: true, badgeSet: true, badgeClear: true, unsupportedSafe: true, badgeErrorSafe: true, duplicateSuppression: true, distinctOrders: true, malformedSafe: true, foregroundSuppressed: true }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
