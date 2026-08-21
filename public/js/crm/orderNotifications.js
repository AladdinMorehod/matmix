(function initCrmOrderNotifications(window, document) {
    const coordinationName = "matmix-order-notifications";
    const pollIntervalMs = 15000;
    const interactionEvents = ["pointerdown", "keydown"];
    const openedOrderIds = new Set();
    const readRequests = new Map();
    const mutationRequests = new Set();
    const originalTitle = document.title;
    const fallbackFaviconHref = "/img/logo-current.png";
    const faviconElement = document.querySelector('link[rel~="icon"]');
    const originalFaviconHref = faviconElement?.getAttribute("href") || fallbackFaviconHref;

    let active = false;
    let leader = false;
    let coordinated = false;
    let unreadCount = 0;
    let hasBaseline = false;
    let continuity = false;
    let pollTimer = null;
    let pollRequest = null;
    let readAllRequest = null;
    let reconciliationRequest = null;
    let reconciliationNeeded = false;
    let channel = null;
    let lockRequest = null;
    let hasUserInteracted = false;
    let audioContext = null;
    let lifecycleGeneration = 0;
    let stateRevision = 0;
    let faviconRequest = null;
    let unreadFaviconHref = "";
    let tabStateRevision = 0;

    function normalizeCount(value) {
        const count = Number(value);
        return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
    }

    function syncApplicationBadge(count) {
        const badgeNavigator = navigator;
        if (!badgeNavigator) return Promise.resolve();
        try {
            if (count > 0 && typeof badgeNavigator.setAppBadge === "function") {
                return Promise.resolve(badgeNavigator.setAppBadge(count)).catch(() => {});
            }
            if (count <= 0 && typeof badgeNavigator.clearAppBadge === "function") {
                return Promise.resolve(badgeNavigator.clearAppBadge()).catch(() => {});
            }
            if (count <= 0 && typeof badgeNavigator.setAppBadge === "function") {
                return Promise.resolve(badgeNavigator.setAppBadge(0)).catch(() => {});
            }
        } catch {
            return Promise.resolve();
        }
        return Promise.resolve();
    }

    function formatCount(value) {
        return value > 99 ? "99+" : String(value);
    }

    function isValidUnreadCount(value) {
        return typeof value === "number"
            && Number.isFinite(value)
            && Number.isInteger(value)
            && value >= 0;
    }

    function createRequestToken(options = {}) {
        if (options.invalidateState) {
            stateRevision += 1;
        }
        return {
            lifecycle: lifecycleGeneration,
            revision: stateRevision,
            promise: null
        };
    }

    function isCurrentLifecycle(token) {
        return active && token.lifecycle === lifecycleGeneration;
    }

    function canApplyResponse(token) {
        return isCurrentLifecycle(token) && token.revision === stateRevision;
    }

    function isCurrentLockRequest(token) {
        return isCurrentLifecycle(token) && lockRequest === token;
    }

    function restoreFavicon() {
        tabStateRevision += 1;
        faviconRequest = null;
        if (faviconElement) {
            faviconElement.setAttribute("href", originalFaviconHref);
        }
    }

    function drawUnreadFavicon(image = null) {
        const canvas = document.createElement("canvas");
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext?.("2d");
        if (!context || typeof canvas.toDataURL !== "function") return "";

        if (image) {
            context.drawImage(image, 0, 0, size, size);
        } else {
            context.fillStyle = "#205742";
            context.fillRect(0, 0, size, size);
            context.fillStyle = "#ffffff";
            context.beginPath();
            context.moveTo(14, 45);
            context.lineTo(14, 19);
            context.lineTo(32, 39);
            context.lineTo(50, 19);
            context.lineTo(50, 45);
            context.lineWidth = 7;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.strokeStyle = "#ffffff";
            context.stroke();
        }

        context.beginPath();
        context.arc(49, 15, 12, 0, Math.PI * 2);
        context.fillStyle = "#f28c28";
        context.fill();
        context.lineWidth = 4;
        context.strokeStyle = "#ffffff";
        context.stroke();
        return canvas.toDataURL("image/png");
    }

    function generateUnreadFavicon() {
        if (typeof window.Image !== "function") {
            return Promise.resolve(drawUnreadFavicon());
        }

        return new Promise(resolve => {
            const image = new window.Image();
            image.onload = () => {
                try {
                    resolve(drawUnreadFavicon(image));
                } catch {
                    try {
                        resolve(drawUnreadFavicon());
                    } catch {
                        resolve("");
                    }
                }
            };
            image.onerror = () => {
                try {
                    resolve(drawUnreadFavicon());
                } catch {
                    resolve("");
                }
            };
            image.src = faviconElement?.href || originalFaviconHref;
        });
    }

    function showUnreadFavicon() {
        if (!faviconElement) return;
        if (unreadFaviconHref) {
            faviconElement.setAttribute("href", unreadFaviconHref);
            return;
        }
        if (faviconRequest) return;

        const request = {
            lifecycle: lifecycleGeneration,
            revision: ++tabStateRevision,
            promise: null
        };
        faviconRequest = request;
        request.promise = Promise.resolve()
            .then(generateUnreadFavicon)
            .then(href => {
                if (href) unreadFaviconHref = href;
                if (!href
                    || faviconRequest !== request
                    || !active
                    || request.lifecycle !== lifecycleGeneration
                    || request.revision !== tabStateRevision
                    || unreadCount <= 0) {
                    return;
                }
                faviconElement.setAttribute("href", href);
            })
            .catch(() => {
                // The title and in-page notification UI remain functional without a dynamic favicon.
            })
            .finally(() => {
                if (faviconRequest === request) {
                    faviconRequest = null;
                }
            });
    }

    function renderTabState() {
        document.title = unreadCount > 0
            ? `(${formatCount(unreadCount)}) ${originalTitle}`
            : originalTitle;
        if (unreadCount > 0) {
            showUnreadFavicon();
        } else {
            restoreFavicon();
        }
    }

    function render() {
        const hasUnread = unreadCount > 0;
        renderTabState();
        document.querySelectorAll("[data-order-notification-badge]").forEach(badge => {
            badge.textContent = formatCount(unreadCount);
            badge.hidden = !hasUnread;
        });

        document.querySelectorAll('.crm-nav button[data-section="orders"]').forEach(button => {
            button.setAttribute(
                "aria-label",
                hasUnread ? `Заказы, непрочитанных: ${unreadCount}` : "Заказы"
            );
        });

        const readAllButton = document.getElementById("markAllOrdersRead");
        if (readAllButton) {
            readAllButton.hidden = !hasUnread;
            readAllButton.disabled = Boolean(readAllRequest);
            readAllButton.setAttribute(
                "aria-label",
                hasUnread
                    ? `Отметить все прочитанными. Непрочитанных заказов: ${unreadCount}`
                    : "Все доступные заказы прочитаны"
            );
        }
    }

    function broadcastSummary(source, notificationState = null) {
        try {
            channel?.postMessage({
                type: "summary",
                unreadCount,
                source,
                ...(notificationState || {})
            });
        } catch {
            // A closed channel must not affect notification state.
        }
    }

    function handleUnauthorized(error) {
        if (error?.status !== 401) return false;
        stop({ broadcastLogout: true });
        window.location.href = "/login.html";
        return true;
    }

    function createAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        const context = audioContext || new AudioContext();
        audioContext = context;
        return context;
    }

    function rememberInteraction(event) {
        if (event?.isTrusted === false) return;
        hasUserInteracted = true;
        try {
            const context = createAudioContext();
            if (context?.state === "suspended") {
                void context.resume().catch(() => {});
            }
        } catch {
            // Audio is optional and must never affect notification controls.
        }
        interactionEvents.forEach(eventName => {
            document.removeEventListener(eventName, rememberInteraction, true);
        });
    }

    async function playNewOrderSound() {
        if (!hasUserInteracted || !leader || document.visibilityState !== "visible") return;

        try {
            const lifecycle = lifecycleGeneration;
            const context = createAudioContext();
            if (!context) return;
            const canPlay = () => active
                && lifecycle === lifecycleGeneration
                && hasUserInteracted
                && leader
                && document.visibilityState === "visible"
                && audioContext === context
                && context.state !== "closed";
            if (!canPlay()) return;
            if (context.state === "suspended") {
                await context.resume();
            }
            if (!canPlay()) return;

            const now = context.currentTime;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(720, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        } catch {
            // Audio is optional and must never interrupt polling or badge updates.
        }
    }

    function signalIncrease(previousCount, nextCount) {
        if (!leader || document.visibilityState !== "visible") return;
        const increase = nextCount - previousCount;
        if (increase <= 0) return;

        window.CrmToast?.info(
            increase === 1 ? "Новый заказ" : `Новых заказов: ${increase}`,
            { duration: 5000 }
        );
        void playNewOrderSound();
    }

    function applySummary(value, options = {}) {
        const nextCount = normalizeCount(value);
        const previousCount = unreadCount;
        const wasBaseline = hasBaseline;
        const canSignal = Boolean(options.allowSignal && continuity && wasBaseline);

        unreadCount = nextCount;
        void syncApplicationBadge(nextCount);
        hasBaseline = true;
        continuity = true;
        render();

        if (canSignal && nextCount > previousCount) {
            signalIncrease(previousCount, nextCount);
        }
        if (options.broadcast) {
            broadcastSummary(options.source || "poll");
        }
    }

    async function pollSummary(options = {}) {
        if (!active || !leader) return;
        if (reconciliationRequest) return reconciliationRequest.promise;
        if (pollRequest) return pollRequest.promise;
        const allowSignal = options.allowSignal !== false && document.visibilityState === "visible";
        const token = createRequestToken();
        pollRequest = token;

        token.promise = Promise.resolve()
            .then(() => window.CrmApi.get("/api/order-notifications/summary"))
            .then(result => {
                if (reconciliationRequest || pollRequest !== token || !canApplyResponse(token)) {
                    return unreadCount;
                }
                applySummary(result.unreadCount, {
                    allowSignal,
                    broadcast: coordinated,
                    source: "poll"
                });
                return unreadCount;
            })
            .catch(error => {
                if (!isCurrentLifecycle(token) || pollRequest !== token) return unreadCount;
                if (!handleUnauthorized(error) && token.revision === stateRevision) {
                    continuity = false;
                }
                return unreadCount;
            })
            .finally(() => {
                if (pollRequest === token) {
                    pollRequest = null;
                }
            });

        return token.promise;
    }

    function stopPollTimer() {
        window.clearInterval(pollTimer);
        pollTimer = null;
    }

    function startPollTimer() {
        stopPollTimer();
        void pollSummary({ allowSignal: false });
        pollTimer = window.setInterval(() => {
            void pollSummary({ allowSignal: document.visibilityState === "visible" });
        }, pollIntervalMs);
    }

    function resetLeaderBaseline() {
        hasBaseline = false;
        continuity = false;
    }

    function startFallbackPolling() {
        coordinated = false;
        if (!active || document.visibilityState !== "visible") return;
        leader = true;
        resetLeaderBaseline();
        startPollTimer();
    }

    function requestLeadership() {
        const token = {
            lifecycle: lifecycleGeneration,
            abortController: new AbortController(),
            release: null,
            requestPromise: null
        };
        lockRequest = token;
        try {
            token.requestPromise = navigator.locks.request(
                coordinationName,
                { signal: token.abortController.signal },
                async () => {
                    if (!isCurrentLockRequest(token)) return;
                    leader = true;
                    resetLeaderBaseline();
                    startPollTimer();
                    await new Promise(resolve => {
                        token.release = resolve;
                    });
                    token.release = null;
                    if (!isCurrentLockRequest(token)) return;
                    stopPollTimer();
                    leader = false;
                    lockRequest = null;
                }
            ).catch(() => {
                if (!isCurrentLockRequest(token)) return;
                lockRequest = null;
                startFallbackPolling();
            });
        } catch {
            if (lockRequest !== token || !isCurrentLifecycle(token)) return;
            lockRequest = null;
            startFallbackPolling();
        }
    }

    function handleChannelMessage(event) {
        const message = event.data;
        if (!active) return;
        if (!message || typeof message !== "object" || Array.isArray(message)) return;
        if (message.type === "logout") {
            stop();
            window.location.href = "/login.html";
            return;
        }
        if (message.type === "summary-request") {
            if (leader && hasBaseline) {
                broadcastSummary("leader-snapshot");
            }
            return;
        }
        if (message.type !== "summary") return;
        if (!isValidUnreadCount(message.unreadCount)) return;
        const readOrderId = typeof message.readOrderId === "string" && /^[1-9]\d*$/.test(message.readOrderId)
            ? message.readOrderId
            : null;
        const allRead = message.allRead === true;
        if (message.readOrderId !== undefined && !readOrderId) return;
        if (message.allRead !== undefined && typeof message.allRead !== "boolean") return;
        if (readOrderId && allRead) return;

        const hasLocalReconciliationObligation = mutationRequests.size > 0
            || reconciliationNeeded
            || Boolean(reconciliationRequest);
        stateRevision += 1;
        if (hasLocalReconciliationObligation) {
            reconciliationNeeded = true;
        }
        applySummary(message.unreadCount, {
            allowSignal: false,
            broadcast: false
        });
        if (allRead) {
            window.CrmOrders?.setAllNotificationsRead?.();
        } else if (readOrderId) {
            window.CrmOrders?.setNotificationRead?.(readOrderId);
        }
    }

    function handleVisibilityChange() {
        if (!active) return;

        if (coordinated) {
            if (leader && document.visibilityState === "visible") {
                void pollSummary({ allowSignal: false });
            }
            return;
        }

        if (document.visibilityState === "visible") {
            startFallbackPolling();
        } else {
            stopPollTimer();
            leader = false;
            resetLeaderBaseline();
        }
    }

    function registerMutation(token) {
        mutationRequests.add(token);
        reconciliationNeeded = true;
    }

    function finishMutation(token) {
        mutationRequests.delete(token);
        if (isCurrentLifecycle(token)) {
            maybeStartReconciliation();
        }
    }

    function maybeStartReconciliation() {
        if (!active
            || !reconciliationNeeded
            || mutationRequests.size > 0
            || reconciliationRequest) {
            return reconciliationRequest?.promise;
        }

        reconciliationNeeded = false;
        const token = createRequestToken({ invalidateState: true });
        reconciliationRequest = token;
        token.promise = Promise.resolve()
            .then(() => window.CrmApi.get("/api/order-notifications/summary"))
            .then(result => {
                if (reconciliationRequest !== token || !canApplyResponse(token)) return unreadCount;
                applySummary(result.unreadCount, {
                    allowSignal: false,
                    broadcast: coordinated,
                    source: "reconciliation"
                });
                return unreadCount;
            })
            .catch(error => {
                if (reconciliationRequest !== token || !isCurrentLifecycle(token)) return unreadCount;
                if (!handleUnauthorized(error) && token.revision === stateRevision) {
                    continuity = false;
                }
                return unreadCount;
            })
            .finally(() => {
                if (reconciliationRequest === token) {
                    reconciliationRequest = null;
                    if (isCurrentLifecycle(token)) {
                        maybeStartReconciliation();
                    }
                }
            });

        return token.promise;
    }

    async function markOrderRead(orderId) {
        const normalizedOrderId = String(orderId || "");
        if (!active || !normalizedOrderId || readRequests.has(normalizedOrderId)) {
            return readRequests.get(normalizedOrderId)?.promise;
        }
        const token = createRequestToken({ invalidateState: true });
        readRequests.set(normalizedOrderId, token);
        registerMutation(token);

        token.promise = Promise.resolve()
            .then(() => window.CrmApi.post(`/api/orders/${encodeURIComponent(normalizedOrderId)}/read`))
            .then(result => {
                if (readRequests.get(normalizedOrderId) !== token || !canApplyResponse(token)) return;
                applySummary(result.unreadCount, {
                    allowSignal: false,
                    broadcast: false,
                    source: "read-one"
                });
                window.CrmOrders?.setNotificationRead?.(normalizedOrderId);
                if (coordinated) {
                    broadcastSummary("read-one", { readOrderId: normalizedOrderId });
                }
            })
            .catch(error => {
                if (readRequests.get(normalizedOrderId) === token && isCurrentLifecycle(token)) {
                    handleUnauthorized(error);
                }
            })
            .finally(() => {
                if (readRequests.get(normalizedOrderId) === token) {
                    readRequests.delete(normalizedOrderId);
                }
                finishMutation(token);
            });

        return token.promise;
    }

    function onOrderOpened(orderId) {
        const normalizedOrderId = String(orderId || "");
        if (!normalizedOrderId || openedOrderIds.has(normalizedOrderId)) return;
        openedOrderIds.add(normalizedOrderId);
        void markOrderRead(normalizedOrderId);
    }

    function onOrderClosed(orderId) {
        openedOrderIds.delete(String(orderId || ""));
    }

    async function markAllRead() {
        if (!active || unreadCount <= 0 || readAllRequest) return readAllRequest?.promise;
        const token = createRequestToken({ invalidateState: true });
        readAllRequest = token;
        registerMutation(token);

        token.promise = Promise.resolve()
            .then(() => window.CrmApi.post("/api/order-notifications/read-all"))
            .then(result => {
                if (readAllRequest !== token || !canApplyResponse(token)) return;
                applySummary(result.unreadCount, {
                    allowSignal: false,
                    broadcast: false,
                    source: "read-all"
                });
                window.CrmOrders?.setAllNotificationsRead?.();
                if (coordinated) {
                    broadcastSummary("read-all", { allRead: true });
                }
            })
            .catch(error => {
                if (readAllRequest !== token || !isCurrentLifecycle(token)) return;
                if (!handleUnauthorized(error) && token.revision === stateRevision) {
                    window.CrmToast?.error("Не удалось отметить заказы прочитанными.");
                }
            })
            .finally(() => {
                if (readAllRequest === token) {
                    readAllRequest = null;
                    if (isCurrentLifecycle(token)) {
                        render();
                    }
                }
                finishMutation(token);
            });

        render();
        return token.promise;
    }

    function handleReadAllClick() {
        void markAllRead();
    }

    function start() {
        if (active) return;
        active = true;
        lifecycleGeneration += 1;
        stateRevision = 0;
        unreadCount = 0;
        hasBaseline = false;
        continuity = false;
        reconciliationNeeded = false;
        render();

        interactionEvents.forEach(eventName => {
            document.addEventListener(eventName, rememberInteraction, true);
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.getElementById("markAllOrdersRead")?.addEventListener("click", handleReadAllClick);

        const supportsCoordination = Boolean(navigator.locks?.request && window.BroadcastChannel);
        if (supportsCoordination) {
            try {
                coordinated = true;
                channel = new BroadcastChannel(coordinationName);
                channel.addEventListener("message", handleChannelMessage);
                channel.postMessage({ type: "summary-request" });
                requestLeadership();
            } catch {
                channel = null;
                startFallbackPolling();
            }
        } else {
            startFallbackPolling();
        }
    }

    function stop(options = {}) {
        if (!active) return;
        if (options.broadcastLogout) {
            try {
                channel?.postMessage({ type: "logout" });
            } catch {
                // Ignore channel shutdown races.
            }
        }

        active = false;
        lifecycleGeneration += 1;
        stateRevision += 1;
        document.title = originalTitle;
        restoreFavicon();
        stopPollTimer();
        const currentLockRequest = lockRequest;
        if (currentLockRequest) {
            currentLockRequest.abortController.abort();
            currentLockRequest.release?.();
            if (lockRequest === currentLockRequest) {
                lockRequest = null;
            }
        }
        channel?.removeEventListener("message", handleChannelMessage);
        channel?.close();
        channel = null;
        leader = false;
        coordinated = false;
        pollRequest = null;
        readAllRequest = null;
        reconciliationRequest = null;
        reconciliationNeeded = false;
        openedOrderIds.clear();
        readRequests.clear();
        mutationRequests.clear();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.getElementById("markAllOrdersRead")?.removeEventListener("click", handleReadAllClick);
        interactionEvents.forEach(eventName => {
            document.removeEventListener(eventName, rememberInteraction, true);
        });
        const currentAudioContext = audioContext;
        if (audioContext === currentAudioContext) {
            audioContext = null;
        }
        if (currentAudioContext && currentAudioContext.state !== "closed") {
            void currentAudioContext.close().catch(() => {});
        }
        hasUserInteracted = false;
    }

    window.CrmOrderNotifications = {
        start,
        stop,
        render,
        refresh() {
            return pollSummary({ allowSignal: true });
        },
        markAllRead,
        onOrderOpened,
        onOrderClosed,
        isLeader() {
            return leader;
        },
        getUnreadCount() {
            return unreadCount;
        }
    };
})(window, document);
