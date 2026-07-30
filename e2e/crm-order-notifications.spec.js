const { test, expect } = require("@playwright/test");

async function login(page) {
    await page.goto("/login.html");
    await page.locator('input[name="login"]').fill("e2e_admin");
    await page.locator('input[name="password"]').fill("E2eAdmin!234");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/manager/);
    await expect(page.locator("#managerUserName")).toHaveText("E2E Admin");
}

async function waitForLeader(page) {
    await expect.poll(() => page.evaluate(() => window.CrmOrderNotifications?.isLeader())).toBe(true);
}

async function openSection(page, section) {
    const button = page.locator(`.crm-nav [data-section="${section}"]`);
    const menuToggle = page.locator("#crmMenuToggle");
    if (await menuToggle.isVisible()) {
        await menuToggle.click();
    }
    await button.click();
    await expect(button).toHaveClass(/active/);
}

function order(overrides = {}) {
    return {
        id: 901,
        orderNumber: "NOTIFY-901",
        customerName: "Клиент уведомлений",
        phone: "+7 900 111-22-33",
        requestType: "order",
        attachmentCount: 0,
        items: [],
        totalPrice: 0,
        totalWeight: 0,
        status: "Новая",
        isNotificationRead: false,
        managerId: null,
        managerName: "",
        createdAt: "2026-07-30T08:30:00.000Z",
        consent: {},
        ...overrides
    };
}

async function mockOrders(page, items) {
    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: items,
            pagination: { page: 1, limit: 20, total: items.length, totalPages: 1 },
            stats: {
                total: items.length,
                new: items.filter(item => item.status === "Новая").length,
                work: items.filter(item => item.status === "В работе").length
            }
        })
    }));
}

function audioContextMock() {
    window.__notificationSoundStarts = 0;
    window.__notificationGainPeaks = [];
    class MockAudioContext {
        constructor() {
            this.currentTime = 0;
            this.destination = {};
            this.state = "running";
        }

        createOscillator() {
            return {
                type: "",
                frequency: { setValueAtTime() {} },
                connect() {},
                start() { window.__notificationSoundStarts += 1; },
                stop() {}
            };
        }

        createGain() {
            return {
                gain: {
                    setValueAtTime() {},
                    exponentialRampToValueAtTime(value) {
                        window.__notificationGainPeaks.push(value);
                    }
                },
                connect() {}
            };
        }

        resume() {
            this.state = "running";
            return Promise.resolve();
        }

        close() {
            this.state = "closed";
            return Promise.resolve();
        }
    }
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = undefined;
}

function gestureRequiredAudioContextMock() {
    window.__notificationAudioConstructedInGesture = false;
    window.__notificationAudioResumedInGesture = false;
    window.__notificationSoundStarts = 0;
    class GestureRequiredAudioContext {
        constructor() {
            this.currentTime = 0;
            this.destination = {};
            this.state = "suspended";
            this.createdInGesture = navigator.userActivation.isActive;
            window.__notificationAudioConstructedInGesture = this.createdInGesture;
        }

        createOscillator() {
            return {
                type: "",
                frequency: { setValueAtTime() {} },
                connect() {},
                start() { window.__notificationSoundStarts += 1; },
                stop() {}
            };
        }

        createGain() {
            return {
                gain: {
                    setValueAtTime() {},
                    exponentialRampToValueAtTime() {}
                },
                connect() {}
            };
        }

        resume() {
            window.__notificationAudioResumedInGesture = navigator.userActivation.isActive;
            if (!this.createdInGesture) {
                return Promise.reject(new Error("AudioContext was created outside a user gesture"));
            }
            this.state = "running";
            return Promise.resolve();
        }

        close() {
            this.state = "closed";
            return Promise.resolve();
        }
    }

    window.AudioContext = GestureRequiredAudioContext;
    window.webkitAudioContext = undefined;
}

function delayedFaviconImageMock() {
    const NativeImage = window.Image;
    window.__pendingFaviconImages = [];
    window.Image = function DelayedFaviconImage() {
        const image = new NativeImage();
        const sourceDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
        Object.defineProperty(image, "src", {
            configurable: true,
            get() {
                return sourceDescriptor.get.call(image);
            },
            set(value) {
                window.__pendingFaviconImages.push(() => {
                    sourceDescriptor.set.call(image, value);
                });
            }
        });
        return image;
    };
}

function failingFaviconImageMock() {
    window.Image = class FailingFaviconImage {
        set src(value) {
            void value;
            queueMicrotask(() => this.onerror?.(new Event("error")));
        }
    };
}

function createDeferred() {
    let resolve;
    const promise = new Promise(done => {
        resolve = done;
    });
    return { promise, resolve };
}

function controlledLocksMock() {
    const records = [];
    Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: {
            request(name, options, callback) {
                let resolveRequest;
                let rejectRequest;
                const requestPromise = new Promise((resolve, reject) => {
                    resolveRequest = resolve;
                    rejectRequest = reject;
                });
                const record = {
                    name,
                    signal: options.signal,
                    requestPromise,
                    granted: false,
                    grant() {
                        if (record.granted) return;
                        record.granted = true;
                        try {
                            Promise.resolve(callback()).then(resolveRequest, rejectRequest);
                        } catch (error) {
                            rejectRequest(error);
                        }
                    },
                    reject() {
                        rejectRequest(new DOMException("Lock request aborted", "AbortError"));
                    }
                };
                records.push(record);
                return requestPromise;
            }
        }
    });
    window.__notificationLockRecords = records;
}

function pendingAudioContextMock() {
    window.__notificationAudioContexts = [];
    class MockAudioContext {
        constructor() {
            this.currentTime = 0;
            this.destination = {};
            this.state = "suspended";
            this.oscillatorStarts = 0;
            this.resumePromise = new Promise(resolve => {
                this.resolveResume = () => {
                    if (this.state !== "closed") {
                        this.state = "running";
                    }
                    resolve();
                };
            });
            window.__notificationAudioContexts.push(this);
        }

        createOscillator() {
            const context = this;
            return {
                type: "",
                frequency: { setValueAtTime() {} },
                connect() {},
                start() { context.oscillatorStarts += 1; },
                stop() {}
            };
        }

        createGain() {
            return {
                gain: {
                    setValueAtTime() {},
                    exponentialRampToValueAtTime() {}
                },
                connect() {}
            };
        }

        resume() {
            return this.resumePromise;
        }

        close() {
            this.state = "closed";
            return Promise.resolve();
        }
    }
    Object.defineProperty(navigator, "locks", {
        configurable: true,
        value: undefined
    });
    window.BroadcastChannel = undefined;
    window.AudioContext = MockAudioContext;
    window.webkitAudioContext = undefined;
}

test("title and favicon track 1, 99, 99+ and restore zero without duplicate icon links", async ({ page }) => {
    let unreadCount = 1;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await waitForLeader(page);
    const favicon = page.locator('link[rel~="icon"]');
    await expect(favicon).toHaveCount(1);
    await expect(page).toHaveTitle("(1) Кабинет менеджера MatMix");
    await expect.poll(() => favicon.getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    const unreadHref = await favicon.getAttribute("href");

    unreadCount = 99;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page).toHaveTitle("(99) Кабинет менеджера MatMix");
    await expect(favicon).toHaveAttribute("href", unreadHref);

    unreadCount = 100;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page).toHaveTitle("(99+) Кабинет менеджера MatMix");
    await expect(favicon).toHaveAttribute("href", unreadHref);

    unreadCount = 0;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page).toHaveTitle("Кабинет менеджера MatMix");
    await expect(favicon).toHaveAttribute("href", "img/logo-current.png");
    await expect(page.locator('link[rel~="icon"]')).toHaveCount(1);
});

test("favicon rendering failure leaves title and notification controls functional", async ({ page }) => {
    let unreadCount = 0;
    const browserErrors = [];
    page.on("console", message => {
        if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", error => browserErrors.push(error.message));
    await page.addInitScript(() => {
        HTMLCanvasElement.prototype.toDataURL = () => {
            throw new Error("canvas unavailable");
        };
    });
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await waitForLeader(page);
    await expect(page).toHaveTitle("Кабинет менеджера MatMix");
    browserErrors.length = 0;
    unreadCount = 4;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page).toHaveTitle("(4) Кабинет менеджера MatMix");
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    expect(browserErrors).toEqual([]);
});

test("an original favicon load error uses one generated fallback icon", async ({ page }) => {
    await page.addInitScript(failingFaviconImageMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 5 })
    }));

    await login(page);
    await expect(page).toHaveTitle("(5) Кабинет менеджера MatMix");
    await expect.poll(() => page.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    await expect(page.locator('link[rel~="icon"]')).toHaveCount(1);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("5");
});

test("stop restores tab state and an old favicon callback cannot overwrite a restarted lifecycle", async ({ page }) => {
    let unreadCount = 1;
    await page.addInitScript(delayedFaviconImageMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await expect(page).toHaveTitle("(1) Кабинет менеджера MatMix");
    await expect.poll(() => page.evaluate(() => window.__pendingFaviconImages.length)).toBe(1);
    await page.evaluate(() => window.CrmOrderNotifications.stop());
    await expect(page).toHaveTitle("Кабинет менеджера MatMix");
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");

    unreadCount = 2;
    await page.evaluate(() => window.CrmOrderNotifications.start());
    await expect(page).toHaveTitle("(2) Кабинет менеджера MatMix");
    await expect.poll(() => page.evaluate(() => window.__pendingFaviconImages.length)).toBe(2);
    await page.evaluate(() => window.__pendingFaviconImages[1]());
    await expect.poll(() => page.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    const restartedHref = await page.locator('link[rel~="icon"]').getAttribute("href");

    await page.evaluate(() => window.__pendingFaviconImages[0]());
    await expect(page).toHaveTitle("(2) Кабинет менеджера MatMix");
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute("href", restartedHref);
});

test("badge renders backend count, hides zero and caps large values", async ({ page }) => {
    let unreadCount = 7;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await login(page);
    await waitForLeader(page);

    const ordersButton = page.locator('.crm-nav button[data-section="orders"]');
    const badge = ordersButton.locator("[data-order-notification-badge]");
    const initialButtonWidth = await ordersButton.evaluate(button => button.getBoundingClientRect().width);
    await expect(badge).toHaveText("7");
    await expect(badge).toBeVisible();
    await expect(ordersButton).toHaveAttribute("aria-label", "Заказы, непрочитанных: 7");

    unreadCount = 125;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(badge).toHaveText("99+");
    await expect(ordersButton).toHaveAttribute("aria-label", "Заказы, непрочитанных: 125");
    expect(await ordersButton.evaluate(button => button.getBoundingClientRect().width)).toBeCloseTo(initialButtonWidth, 0);

    unreadCount = 0;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(badge).toBeHidden();
    await expect(page.locator("#markAllOrdersRead")).toBeHidden();
    expect(await ordersButton.evaluate(button => button.getBoundingClientRect().width)).toBeCloseTo(initialButtonWidth, 0);
});

test("baseline is silent, real growth signals once, reconnect growth is silent", async ({ page }) => {
    let unreadCount = 2;
    let failNext = false;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", route => {
        if (failNext) {
            failNext = false;
            return route.abort("failed");
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);

    await page.locator(".crm-brand").click();
    unreadCount = 3;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page.locator(".crm-toast-info")).toHaveCount(1);
    await expect(page.locator(".crm-toast-info")).toContainText("Новый заказ");
    await expect.poll(() => page.evaluate(() => window.__notificationSoundStarts)).toBe(1);

    failNext = true;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");

    unreadCount = 8;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("8");
    await expect(page.locator(".crm-toast-info")).toHaveCount(1);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(1);

    unreadCount = 10;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page.locator(".crm-toast-info")).toHaveCount(2);
    await expect.poll(() => page.evaluate(() => window.__notificationSoundStarts)).toBe(2);
    expect(await page.evaluate(() => Math.max(...window.__notificationGainPeaks))).toBeCloseTo(0.06, 5);
});

test("the first trusted interaction primes audio before asynchronous notification growth", async ({ page }) => {
    let unreadCount = 1;
    await page.addInitScript(gestureRequiredAudioContextMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
    await page.locator(".crm-brand").click();
    expect(await page.evaluate(() => ({
        constructed: window.__notificationAudioConstructedInGesture,
        resumed: window.__notificationAudioResumedInGesture
    }))).toEqual({ constructed: true, resumed: true });

    unreadCount = 2;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect.poll(() => page.evaluate(() => window.__notificationSoundStarts)).toBe(1);
});

test("Web Locks elect one polling leader and follower takes over", async ({ context }) => {
    await context.addInitScript(audioContextMock);
    let unreadCount = 4;
    let requestCount = 0;
    await context.route("**/api/order-notifications/summary", route => {
        requestCount += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });

    const firstPage = await context.newPage();
    const secondPage = await context.newPage();
    await login(firstPage);
    await secondPage.goto("/manager.html");
    await expect(secondPage.locator("#managerUserName")).toHaveText("E2E Admin");

    await expect.poll(async () => {
        const states = await Promise.all([
            firstPage.evaluate(() => window.CrmOrderNotifications.isLeader()),
            secondPage.evaluate(() => window.CrmOrderNotifications.isLeader())
        ]);
        return states.filter(Boolean).length;
    }).toBe(1);
    await expect(firstPage.locator("[data-order-notification-badge]")).toHaveText("4");
    await expect(secondPage.locator("[data-order-notification-badge]")).toHaveText("4");

    const countBeforeRefresh = requestCount;
    await firstPage.locator(".crm-brand").click();
    await secondPage.locator(".crm-brand").click();
    unreadCount = 5;
    await Promise.all([
        firstPage.evaluate(() => window.CrmOrderNotifications.refresh()),
        secondPage.evaluate(() => window.CrmOrderNotifications.refresh())
    ]);
    expect(requestCount - countBeforeRefresh).toBe(1);

    const firstIsLeader = await firstPage.evaluate(() => window.CrmOrderNotifications.isLeader());
    const leaderPage = firstIsLeader ? firstPage : secondPage;
    const followerPage = firstIsLeader ? secondPage : firstPage;
    await expect(leaderPage.locator(".crm-toast-info")).toHaveCount(1);
    await expect(followerPage.locator(".crm-toast-info")).toHaveCount(0);
    await expect.poll(() => leaderPage.evaluate(() => window.__notificationSoundStarts)).toBe(1);
    expect(await followerPage.evaluate(() => window.__notificationSoundStarts)).toBe(0);
    await expect(followerPage.locator("[data-order-notification-badge]")).toHaveText("5");

    const countBeforeClose = requestCount;
    await leaderPage.close();
    await waitForLeader(followerPage);
    await expect.poll(() => requestCount).toBeGreaterThan(countBeforeClose);
    await expect(followerPage.locator(".crm-toast-info")).toHaveCount(0);
});

test("an old waiting Web Lock rejection cannot start fallback polling in a restarted lifecycle", async ({ page }) => {
    let summaryRequests = 0;
    await page.addInitScript(controlledLocksMock);
    await page.route("**/api/order-notifications/summary", route => {
        summaryRequests += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount: 4 })
        });
    });

    await login(page);
    await expect.poll(() => page.evaluate(() => window.__notificationLockRecords.length)).toBe(1);
    await page.evaluate(async () => {
        window.CrmOrderNotifications.stop();
        window.CrmOrderNotifications.start();
        const oldRequest = window.__notificationLockRecords[0];
        oldRequest.reject();
        await oldRequest.requestPromise.catch(() => {});
        await Promise.resolve();
    });

    expect(summaryRequests).toBe(0);
    expect(await page.evaluate(() => window.CrmOrderNotifications.isLeader())).toBe(false);
    await page.evaluate(() => window.__notificationLockRecords[1].grant());
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
});

test("a released former leader cannot reset the new lifecycle leader or timer", async ({ page }) => {
    let summaryRequests = 0;
    await page.addInitScript(controlledLocksMock);
    await page.route("**/api/order-notifications/summary", route => {
        summaryRequests += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount: 6 })
        });
    });

    await login(page);
    await page.evaluate(() => window.__notificationLockRecords[0].grant());
    await waitForLeader(page);
    await expect.poll(() => summaryRequests).toBe(1);

    await page.evaluate(async () => {
        const oldRequest = window.__notificationLockRecords[0];
        window.CrmOrderNotifications.stop();
        window.CrmOrderNotifications.start();
        window.__notificationLockRecords[1].grant();
        await oldRequest.requestPromise;
        await Promise.resolve();
    });

    await waitForLeader(page);
    await expect.poll(() => summaryRequests).toBe(2);
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect.poll(() => summaryRequests).toBe(3);
    expect(await page.evaluate(() => window.CrmOrderNotifications.isLeader())).toBe(true);
});

test("old lock cleanup cannot clear the current token used by stop", async ({ page }) => {
    await page.addInitScript(controlledLocksMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 2 })
    }));

    await login(page);
    await page.evaluate(async () => {
        window.CrmOrderNotifications.stop();
        window.CrmOrderNotifications.start();
        const oldRequest = window.__notificationLockRecords[0];
        oldRequest.reject();
        await oldRequest.requestPromise.catch(() => {});
        await Promise.resolve();
        window.CrmOrderNotifications.stop();
        window.CrmOrderNotifications.start();
    });

    const lockState = await page.evaluate(() => ({
        recordCount: window.__notificationLockRecords.length,
        middleRequestAborted: window.__notificationLockRecords[1].signal.aborted
    }));
    expect(lockState).toEqual({
        recordCount: 3,
        middleRequestAborted: true
    });
    await page.evaluate(() => window.__notificationLockRecords[2].grant());
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
});

test("opening an order marks it read without duplicate requests on inner render", async ({ page }) => {
    let readCount = 0;
    let unreadCount = 3;
    const firstRead = createDeferred();
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await mockOrders(page, [order()]);
    await page.route("**/api/orders/901/read", async route => {
        readCount += 1;
        if (readCount === 1) {
            await firstRead.promise;
        }
        unreadCount = 2;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount: 2 })
        });
    });

    await login(page);
    await openSection(page, "orders");
    const card = page.locator('article.order-card[data-id="901"]');
    const indicator = card.locator(".order-unread-indicator");
    await expect(page).toHaveTitle("(3) Кабинет менеджера MatMix");
    await expect.poll(() => page.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await expect(card.locator(".order-card-header")).toHaveAttribute("aria-label", /непрочитанный заказ/);
    await card.locator(".order-card-header").click();
    await expect(card.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    await expect(indicator).toBeVisible();
    firstRead.resolve();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
    await expect(page).toHaveTitle("(2) Кабинет менеджера MatMix");
    await expect.poll(() => page.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    await expect(indicator).toHaveCount(0);
    expect(readCount).toBe(1);

    await card.locator('.order-tabs [data-tab="client"]').click();
    await expect(card.locator(".order-card-header")).toHaveAttribute("aria-expanded", "true");
    expect(readCount).toBe(1);

    await card.locator(".order-card-header").click();
    await card.locator(".order-card-header").click();
    await expect.poll(() => readCount).toBe(2);
});

test("a failed read-one keeps the order indicator", async ({ page }) => {
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 1 })
    }));
    await mockOrders(page, [order()]);
    await page.route("**/api/orders/901/read", route => route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false })
    }));

    await login(page);
    await openSection(page, "orders");
    const card = page.locator('article.order-card[data-id="901"]');
    await card.locator(".order-card-header").click();
    await expect(card.locator(".order-unread-indicator")).toBeVisible();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
});

test("read-all is single-flight, updates the badge and reports one failure", async ({ page }) => {
    let unreadCount = 3;
    let readAllCount = 0;
    let resolveReadAll;
    let failReadAll = false;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await mockOrders(page, [order(), order({ id: 902, orderNumber: "NOTIFY-902" })]);
    await page.route("**/api/order-notifications/read-all", async route => {
        readAllCount += 1;
        if (failReadAll) {
            return route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ success: false })
            });
        }
        await new Promise(resolve => {
            resolveReadAll = resolve;
        });
        unreadCount = 0;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, unreadCount: 0 })
        });
    });

    await login(page);
    await waitForLeader(page);
    await openSection(page, "orders");
    const readAll = page.locator("#markAllOrdersRead");
    await expect(page.locator(".order-unread-indicator")).toHaveCount(2);
    await expect(readAll).toBeVisible();
    await readAll.evaluate(button => {
        button.click();
        button.click();
    });
    await expect(readAll).toBeDisabled();
    await expect(page.locator(".order-unread-indicator")).toHaveCount(2);
    expect(readAllCount).toBe(1);
    resolveReadAll();
    await expect(readAll).toBeHidden();
    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    await expect(page).toHaveTitle("Кабинет менеджера MatMix");
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    await expect(page.locator(".order-unread-indicator")).toHaveCount(0);

    unreadCount = 2;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(readAll).toBeVisible();
    failReadAll = true;
    await readAll.click();
    await expect(page.locator(".crm-toast-error")).toHaveCount(1);
    expect(readAllCount).toBe(2);
});

test("a failed read-all keeps every order indicator", async ({ page }) => {
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 2 })
    }));
    await mockOrders(page, [order(), order({ id: 902, orderNumber: "NOTIFY-902" })]);
    await page.route("**/api/order-notifications/read-all", route => route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false })
    }));

    await login(page);
    await openSection(page, "orders");
    await expect(page.locator(".order-unread-indicator")).toHaveCount(2);
    await page.locator("#markAllOrdersRead").click();
    await expect(page.locator(".crm-toast-error")).toHaveCount(1);
    await expect(page.locator(".order-unread-indicator")).toHaveCount(2);
});

test("read-all broadcasts the updated count to a follower tab", async ({ context }) => {
    let unreadCount = 3;
    await context.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await context.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: [order(), order({ id: 902, orderNumber: "NOTIFY-902" })],
            pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            stats: { total: 2, new: 2, work: 0 }
        })
    }));
    await context.route("**/api/order-notifications/read-all", route => {
        unreadCount = 0;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, unreadCount })
        });
    });

    const firstPage = await context.newPage();
    const secondPage = await context.newPage();
    await login(firstPage);
    await secondPage.goto("/manager.html");
    await expect(secondPage.locator("#managerUserName")).toHaveText("E2E Admin");
    await expect(firstPage.locator("[data-order-notification-badge]")).toHaveText("3");
    await expect(secondPage.locator("[data-order-notification-badge]")).toHaveText("3");
    await expect(firstPage).toHaveTitle("(3) Кабинет менеджера MatMix");
    await expect(secondPage).toHaveTitle("(3) Кабинет менеджера MatMix");
    await expect.poll(() => firstPage.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    await expect.poll(() => secondPage.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);

    await openSection(firstPage, "orders");
    await openSection(secondPage, "orders");
    await expect(firstPage.locator(".order-unread-indicator")).toHaveCount(2);
    await expect(secondPage.locator(".order-unread-indicator")).toHaveCount(2);
    await secondPage.locator("#markAllOrdersRead").click();
    await expect(secondPage.locator("[data-order-notification-badge]")).toBeHidden();
    await expect(firstPage.locator("[data-order-notification-badge]")).toBeHidden();
    await expect(firstPage).toHaveTitle("Кабинет менеджера MatMix");
    await expect(secondPage).toHaveTitle("Кабинет менеджера MatMix");
    await expect(firstPage.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    await expect(secondPage.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    await expect(firstPage.locator(".order-unread-indicator")).toHaveCount(0);
    await expect(secondPage.locator(".order-unread-indicator")).toHaveCount(0);
});

test("read-one removes the same order indicator in the other tab without a signal", async ({ context }) => {
    let unreadCount = 1;
    await context.addInitScript(audioContextMock);
    await context.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await context.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: [order()],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            stats: { total: 1, new: 1, work: 0 }
        })
    }));
    await context.route("**/api/orders/901/read", route => {
        unreadCount = 0;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    const firstPage = await context.newPage();
    const secondPage = await context.newPage();
    await login(firstPage);
    await secondPage.goto("/manager.html");
    await expect(secondPage.locator("#managerUserName")).toHaveText("E2E Admin");
    await openSection(firstPage, "orders");
    await openSection(secondPage, "orders");
    await expect(firstPage.locator(".order-unread-indicator")).toHaveCount(1);
    await expect(secondPage.locator(".order-unread-indicator")).toHaveCount(1);
    await expect(firstPage).toHaveTitle("(1) Кабинет менеджера MatMix");
    await expect(secondPage).toHaveTitle("(1) Кабинет менеджера MatMix");

    await firstPage.locator('article.order-card[data-id="901"] .order-card-header').click();
    await expect(firstPage.locator(".order-unread-indicator")).toHaveCount(0);
    await expect(secondPage.locator(".order-unread-indicator")).toHaveCount(0);
    await expect(firstPage).toHaveTitle("Кабинет менеджера MatMix");
    await expect(secondPage).toHaveTitle("Кабинет менеджера MatMix");
    await expect(firstPage.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    await expect(secondPage.locator('link[rel~="icon"]')).toHaveAttribute("href", "img/logo-current.png");
    await expect(firstPage.locator(".crm-toast-info")).toHaveCount(0);
    await expect(secondPage.locator(".crm-toast-info")).toHaveCount(0);
    expect(await firstPage.evaluate(() => window.__notificationSoundStarts)).toBe(0);
    expect(await secondPage.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("reload restores the per-order read state from the orders API", async ({ page }) => {
    let unreadCount = 1;
    let isNotificationRead = false;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));
    await page.route("**/api/orders?**", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
            success: true,
            orders: [order({ isNotificationRead })],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            stats: { total: 1, new: 1, work: 0 }
        })
    }));
    await page.route("**/api/orders/901/read", route => {
        unreadCount = 0;
        isNotificationRead = true;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    await login(page);
    await openSection(page, "orders");
    await expect(page.locator(".order-unread-indicator")).toHaveCount(1);
    await page.locator('article.order-card[data-id="901"] .order-card-header').click();
    await expect(page.locator(".order-unread-indicator")).toHaveCount(0);

    await page.reload();
    await expect(page.locator("#managerUserName")).toHaveText("E2E Admin");
    await expect(page.locator('article.order-card[data-id="901"]')).toBeVisible();
    await expect(page.locator(".order-unread-indicator")).toHaveCount(0);
});

test("stale summary cannot overwrite a newer read-all result", async ({ page }) => {
    const staleSummary = createDeferred();
    let summaryRequests = 0;
    let unreadCount = 5;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            await staleSummary.promise;
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/order-notifications/read-all", route => {
        unreadCount = 0;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("5");
    await page.evaluate(() => {
        window.__notificationBroadcasts = [];
        window.__notificationObserver = new BroadcastChannel("matmix-order-notifications");
        window.__notificationObserver.addEventListener("message", event => {
            window.__notificationBroadcasts.push(event.data);
        });
        window.__staleSummaryPromise = window.CrmOrderNotifications.refresh();
    });
    await expect.poll(() => summaryRequests).toBe(2);

    await openSection(page, "orders");
    await page.locator("#markAllOrdersRead").click();
    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    staleSummary.resolve();
    await page.evaluate(() => window.__staleSummaryPromise);

    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "poll").length)).toBe(0);
});

test("stale summary cannot overwrite a newer read-one result", async ({ page }) => {
    const staleSummary = createDeferred();
    let summaryRequests = 0;
    let unreadCount = 3;
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            await staleSummary.promise;
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await mockOrders(page, [order()]);
    await page.route("**/api/orders/901/read", route => {
        unreadCount = 2;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await openSection(page, "orders");
    await page.evaluate(() => {
        window.__staleSummaryPromise = window.CrmOrderNotifications.refresh();
    });
    await expect.poll(() => summaryRequests).toBe(2);
    await page.locator('article.order-card[data-id="901"] .order-card-header').click();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");

    staleSummary.resolve();
    await page.evaluate(() => window.__staleSummaryPromise);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
});

test("an older read-all response cannot overwrite a newer read-one result", async ({ page }) => {
    const oldReadAll = createDeferred();
    let readAllCompleted = false;
    let unreadCount = 3;
    let summaryRequests = 0;
    await page.route("**/api/order-notifications/summary", route => {
        summaryRequests += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await mockOrders(page, [order()]);
    await page.route("**/api/order-notifications/read-all", async route => {
        await oldReadAll.promise;
        unreadCount = 0;
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, unreadCount: 0 })
        });
        readAllCompleted = true;
    });
    await page.route("**/api/orders/901/read", route => {
        unreadCount = 2;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await openSection(page, "orders");
    await page.locator("#markAllOrdersRead").click();
    await expect(page.locator("#markAllOrdersRead")).toBeDisabled();
    await page.locator('article.order-card[data-id="901"] .order-card-header').click();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");

    oldReadAll.resolve();
    await expect.poll(() => readAllCompleted).toBe(true);
    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    await expect(page.locator("#markAllOrdersRead")).toBeHidden();
    expect(summaryRequests).toBe(2);
});

test("parallel read-one mutations coalesce into one silent exact reconciliation", async ({ page }) => {
    const firstRead = createDeferred();
    const secondRead = createDeferred();
    let unreadCount = 5;
    let summaryRequests = 0;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", route => {
        summaryRequests += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/orders/901/read", async route => {
        await firstRead.promise;
        unreadCount = 3;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });
    await page.route("**/api/orders/902/read", async route => {
        await secondRead.promise;
        unreadCount = 4;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 902, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await page.locator(".crm-brand").click();
    await page.evaluate(() => {
        window.__notificationBroadcasts = [];
        const observer = new BroadcastChannel("matmix-order-notifications");
        observer.addEventListener("message", event => window.__notificationBroadcasts.push(event.data));
        window.CrmOrderNotifications.onOrderOpened(901);
        window.CrmOrderNotifications.onOrderOpened(902);
    });

    secondRead.resolve();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    firstRead.resolve();
    await expect.poll(() => summaryRequests).toBe(2);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "reconciliation").length)).toBe(1);
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("a mutation started during reconciliation invalidates it and schedules one replacement", async ({ page }) => {
    const staleReconciliation = createDeferred();
    let unreadCount = 5;
    let summaryRequests = 0;
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            const staleCount = unreadCount;
            await staleReconciliation.promise;
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount: staleCount })
            });
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/orders/901/read", route => {
        unreadCount = 4;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });
    await page.route("**/api/orders/902/read", route => {
        unreadCount = 3;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 902, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(901));
    await expect.poll(() => summaryRequests).toBe(2);
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(902));
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");
    staleReconciliation.resolve();

    await expect.poll(() => summaryRequests).toBe(3);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
});

test("reconciliation invalidates an older poll response without stale signals or broadcast", async ({ page }) => {
    const stalePoll = createDeferred();
    let summaryRequests = 0;
    let stalePollCompleted = false;
    let reconciliationCompleted = false;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            await stalePoll.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount: 5 })
            });
            stalePollCompleted = true;
            return;
        }
        const unreadCount = summaryRequests === 1 ? 5 : 0;
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
        if (summaryRequests === 3) {
            reconciliationCompleted = true;
        }
    });
    await page.route("**/api/orders/901/read", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: 901, unreadCount: 0 })
    }));

    await login(page);
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("5");
    await page.locator(".crm-brand").click();
    await page.evaluate(() => {
        window.__notificationBroadcasts = [];
        const observer = new BroadcastChannel("matmix-order-notifications");
        observer.addEventListener("message", event => window.__notificationBroadcasts.push(event.data));
        window.__stalePollPromise = window.CrmOrderNotifications.refresh();
    });
    await expect.poll(() => summaryRequests).toBe(2);
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(901));

    await expect.poll(() => reconciliationCompleted).toBe(true);
    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    stalePoll.resolve();
    await expect.poll(() => stalePollCompleted).toBe(true);
    await page.evaluate(() => window.__stalePollPromise);

    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "poll").length)).toBe(0);
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "reconciliation").length)).toBe(1);
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("refresh skips its endpoint while reconciliation is active and resumes afterwards", async ({ page }) => {
    const reconciliation = createDeferred();
    let summaryRequests = 0;
    let reconciliationCompleted = false;
    let unreadCount = 5;
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            await reconciliation.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount: 4 })
            });
            reconciliationCompleted = true;
            return;
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/orders/901/read", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: 901, unreadCount: 4 })
    }));

    await login(page);
    await waitForLeader(page);
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(901));
    await expect.poll(() => summaryRequests).toBe(2);
    const getCallsDuringReconciliation = await page.evaluate(async () => {
        const originalGet = window.CrmApi.get;
        window.__notificationSummaryGetCalls = 0;
        window.CrmApi.get = function wrappedGet(url, ...args) {
            if (url === "/api/order-notifications/summary") {
                window.__notificationSummaryGetCalls += 1;
            }
            return originalGet.call(this, url, ...args);
        };
        window.__refreshDuringReconciliation = window.CrmOrderNotifications.refresh();
        await Promise.resolve();
        await Promise.resolve();
        return window.__notificationSummaryGetCalls;
    });
    expect(getCallsDuringReconciliation).toBe(0);
    expect(summaryRequests).toBe(2);

    reconciliation.resolve();
    await expect.poll(() => reconciliationCompleted).toBe(true);
    await page.evaluate(() => window.__refreshDuringReconciliation);
    unreadCount = 3;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect.poll(() => summaryRequests).toBe(3);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");
});

test("a broadcast during reconciliation causes one exact replacement without a loop", async ({ page }) => {
    const staleReconciliation = createDeferred();
    let summaryRequests = 0;
    let firstReconciliationCompleted = false;
    let replacementCompleted = false;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 1) {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount: 7 })
            });
        }
        if (summaryRequests === 2) {
            await staleReconciliation.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount: 5 })
            });
            firstReconciliationCompleted = true;
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount: 3 })
        });
        replacementCompleted = true;
    });
    await page.route("**/api/orders/901/read", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, orderId: 901, unreadCount: 4 })
    }));

    await login(page);
    await waitForLeader(page);
    await page.locator(".crm-brand").click();
    await page.evaluate(() => {
        window.__notificationBroadcasts = [];
        const observer = new BroadcastChannel("matmix-order-notifications");
        observer.addEventListener("message", event => window.__notificationBroadcasts.push(event.data));
        window.CrmOrderNotifications.onOrderOpened(901);
    });
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    await expect.poll(() => summaryRequests).toBe(2);
    await page.evaluate(() => {
        const channel = new BroadcastChannel("matmix-order-notifications");
        channel.postMessage({ type: "summary", unreadCount: 6, source: "poll" });
        channel.close();
    });
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("6");
    staleReconciliation.resolve();

    await expect.poll(() => firstReconciliationCompleted).toBe(true);
    await expect.poll(() => replacementCompleted).toBe(true);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("3");
    expect(summaryRequests).toBe(3);
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "reconciliation").length)).toBe(1);
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("an incoming summary during a mutation is superseded by exact reconciliation", async ({ page }) => {
    const pendingRead = createDeferred();
    let unreadCount = 5;
    let summaryRequests = 0;
    await page.route("**/api/order-notifications/summary", route => {
        summaryRequests += 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/orders/901/read", async route => {
        await pendingRead.promise;
        unreadCount = 4;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await page.evaluate(() => {
        window.CrmOrderNotifications.onOrderOpened(901);
        const channel = new BroadcastChannel("matmix-order-notifications");
        channel.postMessage({ type: "summary", unreadCount: 1 });
        channel.close();
    });
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
    pendingRead.resolve();

    await expect.poll(() => summaryRequests).toBe(2);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
});

test("stop makes a late reconciliation inert", async ({ page }) => {
    const lateReconciliation = createDeferred();
    let unreadCount = 5;
    let summaryRequests = 0;
    let lateReconciliationCompleted = false;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests === 2) {
            await lateReconciliation.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ unreadCount })
            });
            lateReconciliationCompleted = true;
            return;
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount })
        });
    });
    await page.route("**/api/orders/901/read", route => {
        unreadCount = 4;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount })
        });
    });

    await login(page);
    await waitForLeader(page);
    await page.evaluate(() => {
        window.__notificationBroadcasts = [];
        const observer = new BroadcastChannel("matmix-order-notifications");
        observer.addEventListener("message", event => window.__notificationBroadcasts.push(event.data));
        window.CrmOrderNotifications.onOrderOpened(901);
    });
    await expect.poll(() => summaryRequests).toBe(2);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    await page.evaluate(() => window.CrmOrderNotifications.stop());
    unreadCount = 2;
    lateReconciliation.resolve();
    await expect.poll(() => lateReconciliationCompleted).toBe(true);

    await expect(page.locator("[data-order-notification-badge]")).toHaveText("4");
    expect(await page.evaluate(() => window.__notificationBroadcasts
        .filter(message => message?.source === "reconciliation").length)).toBe(0);
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("late read-one cannot affect a restarted lifecycle or clear its request slot", async ({ page }) => {
    const oldRead = createDeferred();
    const currentRead = createDeferred();
    let baselineCount = 3;
    let readRequests = 0;
    let oldReadCompleted = false;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: baselineCount })
    }));
    await page.route("**/api/orders/901/read", async route => {
        readRequests += 1;
        if (readRequests === 1) {
            await oldRead.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ success: true, orderId: 901, unreadCount: 2 })
            });
            oldReadCompleted = true;
            return;
        }
        await currentRead.promise;
        baselineCount = 1;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, orderId: 901, unreadCount: 1 })
        });
    });

    await login(page);
    await waitForLeader(page);
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(901));
    await expect.poll(() => readRequests).toBe(1);
    await page.evaluate(() => window.CrmOrderNotifications.stop());

    baselineCount = 7;
    await page.evaluate(() => window.CrmOrderNotifications.start());
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("7");
    await page.evaluate(() => window.CrmOrderNotifications.onOrderOpened(901));
    await expect.poll(() => readRequests).toBe(2);

    oldRead.resolve();
    await expect.poll(() => oldReadCompleted).toBe(true);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("7");
    await page.evaluate(() => {
        window.CrmOrderNotifications.onOrderClosed(901);
        window.CrmOrderNotifications.onOrderOpened(901);
    });
    expect(readRequests).toBe(2);

    currentRead.resolve();
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
});

test("late read-all cannot affect a restarted lifecycle or clear its request slot", async ({ page }) => {
    const oldReadAll = createDeferred();
    const currentReadAll = createDeferred();
    let baselineCount = 3;
    let readAllRequests = 0;
    let oldReadAllCompleted = false;
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: baselineCount })
    }));
    await page.route("**/api/order-notifications/read-all", async route => {
        readAllRequests += 1;
        if (readAllRequests === 1) {
            await oldReadAll.promise;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ success: true, unreadCount: 0 })
            });
            oldReadAllCompleted = true;
            return;
        }
        await currentReadAll.promise;
        baselineCount = 0;
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, unreadCount: 0 })
        });
    });

    await login(page);
    await waitForLeader(page);
    await openSection(page, "orders");
    await page.locator("#markAllOrdersRead").click();
    await expect.poll(() => readAllRequests).toBe(1);
    await page.evaluate(() => window.CrmOrderNotifications.stop());

    baselineCount = 7;
    await page.evaluate(() => window.CrmOrderNotifications.start());
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("7");
    await page.locator("#markAllOrdersRead").click();
    await expect.poll(() => readAllRequests).toBe(2);
    await expect(page.locator("#markAllOrdersRead")).toBeDisabled();

    oldReadAll.resolve();
    await expect.poll(() => oldReadAllCompleted).toBe(true);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("7");
    await expect(page.locator("#markAllOrdersRead")).toBeDisabled();

    currentReadAll.resolve();
    await expect(page.locator("[data-order-notification-badge]")).toBeHidden();
});

test("BroadcastChannel ignores malformed summaries and invalidates an older local summary", async ({ page }) => {
    const staleSummary = createDeferred();
    let summaryRequests = 0;
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", async route => {
        summaryRequests += 1;
        if (summaryRequests > 1) {
            await staleSummary.promise;
        }
        return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ unreadCount: 6 })
        });
    });

    await login(page);
    await waitForLeader(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("6");
    await expect(page).toHaveTitle("(6) Кабинет менеджера MatMix");
    await expect.poll(() => page.locator('link[rel~="icon"]').getAttribute("href")).toMatch(/^data:image\/png;base64,/);
    const faviconBeforeMalformedMessages = await page.locator('link[rel~="icon"]').getAttribute("href");
    const malformedSnapshot = await page.evaluate(() => new Promise(resolve => {
        const channel = new BroadcastChannel("matmix-order-notifications");
        channel.addEventListener("message", event => {
            if (event.data?.source === "leader-snapshot") {
                resolve(event.data.unreadCount);
                channel.close();
            }
        });
        [
            undefined,
            "6",
            { count: 6 },
            -1,
            Number.NaN,
            Number.POSITIVE_INFINITY,
            1.5
        ].forEach(unreadCount => {
            channel.postMessage({ type: "summary", unreadCount });
        });
        channel.postMessage({ type: "summary-request" });
    }));
    expect(malformedSnapshot).toBe(6);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("6");
    await expect(page).toHaveTitle("(6) Кабинет менеджера MatMix");
    await expect(page.locator('link[rel~="icon"]')).toHaveAttribute("href", faviconBeforeMalformedMessages);

    await page.evaluate(() => {
        window.__staleSummaryPromise = window.CrmOrderNotifications.refresh();
        const channel = new BroadcastChannel("matmix-order-notifications");
        channel.postMessage({ type: "summary", unreadCount: 2 });
        channel.close();
    });
    await expect.poll(() => summaryRequests).toBe(2);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
    staleSummary.resolve();
    await page.evaluate(() => window.__staleSummaryPromise);

    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("a pending sound helper from an old lifecycle cannot use the replacement AudioContext", async ({ page }) => {
    let unreadCount = 1;
    await page.addInitScript(pendingAudioContextMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
    await page.locator(".crm-brand").click();
    unreadCount = 2;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect.poll(() => page.evaluate(() => window.__notificationAudioContexts.length)).toBe(1);

    await page.evaluate(() => {
        window.CrmOrderNotifications.stop();
        window.CrmOrderNotifications.start();
    });
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("2");
    await page.locator(".crm-brand").click();
    unreadCount = 3;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect.poll(() => page.evaluate(() => window.__notificationAudioContexts.length)).toBe(2);

    await page.evaluate(async () => {
        const oldContext = window.__notificationAudioContexts[0];
        oldContext.resolveResume();
        await oldContext.resumePromise;
        await Promise.resolve();
    });
    expect(await page.evaluate(() => window.__notificationAudioContexts[0].oscillatorStarts)).toBe(0);
    expect(await page.evaluate(() => window.__notificationAudioContexts[1].oscillatorStarts)).toBe(0);

    await page.evaluate(async () => {
        const currentContext = window.__notificationAudioContexts[1];
        currentContext.resolveResume();
        await currentContext.resumePromise;
        await Promise.resolve();
    });
    expect(await page.evaluate(() => window.__notificationAudioContexts[1].oscillatorStarts)).toBe(1);
});

test("fallback polls visible tabs and treats return from hidden as a silent baseline", async ({ page }) => {
    let unreadCount = 1;
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "locks", {
            configurable: true,
            value: undefined
        });
        window.BroadcastChannel = undefined;
        let visibility = "visible";
        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => visibility
        });
        window.__setNotificationVisibility = value => {
            visibility = value;
            document.dispatchEvent(new Event("visibilitychange"));
        };
    });
    await page.addInitScript(audioContextMock);
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount })
    }));

    await login(page);
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");
    await page.locator(".crm-brand").click();
    await page.evaluate(() => window.__setNotificationVisibility("hidden"));
    unreadCount = 5;
    await page.evaluate(() => window.CrmOrderNotifications.refresh());
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("1");

    await page.evaluate(() => window.__setNotificationVisibility("visible"));
    await expect(page.locator("[data-order-notification-badge]")).toHaveText("5");
    await expect(page.locator(".crm-toast-info")).toHaveCount(0);
    expect(await page.evaluate(() => window.__notificationSoundStarts)).toBe(0);
});

test("401 stops polling and uses the existing login redirect", async ({ page }) => {
    let requestCount = 0;
    await page.route("**/api/order-notifications/summary", route => {
        requestCount += 1;
        return route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ success: false, code: "AUTH_REQUIRED" })
        });
    });

    await login(page);
    await page.waitForURL(/login/);
    const countAfterRedirect = requestCount;
    await expect.poll(() => requestCount).toBe(countAfterRedirect);
});

test("notification controls remain accessible without overflow at supported widths", async ({ page }) => {
    const browserErrors = [];
    page.on("console", message => {
        if (message.type() === "error") {
            browserErrors.push(`console: ${message.text()}`);
        }
    });
    page.on("pageerror", error => {
        browserErrors.push(`pageerror: ${error.message}`);
    });
    await page.route("**/api/order-notifications/summary", route => route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unreadCount: 12 })
    }));
    await mockOrders(page, [order()]);
    await login(page);
    await openSection(page, "orders");
    browserErrors.length = 0;

    for (const width of [1280, 390, 320]) {
        await page.setViewportSize({ width, height: 800 });
        const menuToggle = page.locator("#crmMenuToggle");
        if (await menuToggle.isVisible()) {
            await menuToggle.click();
        }
        const ordersButton = page.locator('.crm-nav button[data-section="orders"]');
        const badge = ordersButton.locator("[data-order-notification-badge]");
        await expect(badge).toBeVisible();
        await expect(ordersButton).toHaveAttribute("aria-label", /непрочитанных: 12/);
        await ordersButton.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(ordersButton).toBeFocused();
        expect(await ordersButton.evaluate(button => getComputedStyle(button).outlineStyle)).not.toBe("none");

        if (await menuToggle.isVisible()) {
            await page.locator("#crmMenuClose").click();
            await expect(page.locator("body")).not.toHaveClass(/crm-nav-open/);
            await expect.poll(() => page.locator(".crm-sidebar").evaluate(sidebar => (
                sidebar.getBoundingClientRect().right
            ))).toBeLessThanOrEqual(0);
        }
        const readAll = page.locator("#markAllOrdersRead");
        await expect(readAll).toBeVisible();
        const metrics = await page.evaluate(() => {
            const button = document.getElementById("markAllOrdersRead");
            const rect = button.getBoundingClientRect();
            const card = document.querySelector("article.order-card");
            const cardRect = card.getBoundingClientRect();
            const headerMainRect = card.querySelector(".order-header-main").getBoundingClientRect();
            const indicator = card.querySelector(".order-unread-indicator");
            const indicatorRect = indicator.getBoundingClientRect();
            indicator.style.pointerEvents = "auto";
            const indicatorVisibleAtCenter = document.elementFromPoint(
                indicatorRect.left + indicatorRect.width / 2,
                indicatorRect.top + indicatorRect.height / 2
            ) === indicator;
            indicator.style.pointerEvents = "";
            return {
                documentClientWidth: document.documentElement.clientWidth,
                documentScrollWidth: document.documentElement.scrollWidth,
                buttonHeight: rect.height,
                buttonRight: rect.right,
                cardClientWidth: card.clientWidth,
                cardScrollWidth: card.scrollWidth,
                indicatorDiameter: indicatorRect.width,
                indicatorTop: indicatorRect.top,
                indicatorLeft: indicatorRect.left,
                indicatorRight: indicatorRect.right,
                indicatorVisibleAtCenter,
                cardTop: cardRect.top,
                cardLeft: cardRect.left,
                headerMainLeft: headerMainRect.left
            };
        });
        expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.documentClientWidth);
        expect(metrics.buttonHeight).toBeGreaterThanOrEqual(width <= 768 ? 42 : 40);
        expect(metrics.buttonRight).toBeLessThanOrEqual(metrics.documentClientWidth);
        expect(metrics.cardScrollWidth).toBeLessThanOrEqual(metrics.cardClientWidth);
        expect(metrics.indicatorDiameter).toBeGreaterThanOrEqual(10);
        expect(metrics.indicatorDiameter).toBeLessThanOrEqual(12);
        expect(metrics.indicatorTop).toBeGreaterThanOrEqual(metrics.cardTop);
        expect(metrics.indicatorLeft).toBeGreaterThanOrEqual(metrics.cardLeft);
        expect(metrics.indicatorRight).toBeLessThan(metrics.headerMainLeft);
        expect(metrics.indicatorVisibleAtCenter).toBe(true);
    }
    expect(browserErrors).toEqual([]);
});
