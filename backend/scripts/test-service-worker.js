const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function createHarness({ clients = [] } = {}) {
    const listeners = new Map();
    const notifications = [];
    const shown = [];
    const registration = {
        async getNotifications({ tag } = {}) {
            return notifications.filter(notification => !tag || notification.tag === tag);
        },
        async showNotification(title, options) {
            const notification = { title, ...options };
            notifications.push(notification);
            shown.push(notification);
        },
        async setAppBadge() {}
    };
    const self = {
        location: { origin: "https://matmix.test" },
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
    await background.push({ orderId: 41, eventId: "order-41", title: "Order 41" });
    await background.push({ orderId: 41, eventId: "order-41", title: "Order 41 duplicate" });
    await background.push({ orderId: 42, eventId: "order-42", title: "Order 42" });
    assert.strictEqual(background.shown.length, 2);
    assert.deepStrictEqual(background.shown.map(item => item.tag), ["matmix-order-41", "matmix-order-42"]);

    const malformed = createHarness();
    await malformed.push({ orderId: "41<script>", eventId: "javascript:alert(1)" });
    assert.strictEqual(malformed.shown[0].tag, "matmix-order-invalid");
    assert.strictEqual(malformed.shown[0].data.url, "/manager");

    const visible = createHarness({ clients: [{
        url: "https://matmix.test/manager",
        focused: false,
        visibilityState: "visible"
    }] });
    await visible.push({ orderId: 43, eventId: "order-43" });
    assert.strictEqual(visible.shown.length, 0);

    console.log(JSON.stringify({ success: true, duplicateSuppression: true, distinctOrders: true, malformedSafe: true, foregroundSuppressed: true }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
