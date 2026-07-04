const statuses = [
    "Новая",
    "В работе",
    "Ожидает клиента",
    "Доставка",
    "Завершена",
    "Отменена"
];

const statusClassMap = {
    "Новая": "status-new",
    "В работе": "status-work",
    "Ожидает клиента": "status-wait",
    "Доставка": "status-delivery",
    "Завершена": "status-done",
    "Отменена": "status-cancel"
};

const ordersList = document.getElementById("ordersList");
const statusFilter = document.getElementById("statusFilter");
const statusTabs = document.getElementById("statusTabs");
const refreshOrdersBtn = document.getElementById("refreshOrders");
const managerMessage = document.getElementById("managerMessage");
const managerUserName = document.getElementById("managerUserName");
const managerUserRole = document.getElementById("managerUserRole");
const logoutBtn = document.getElementById("logoutBtn");
const ordersTotalCount = document.getElementById("ordersTotalCount");
const ordersNewCount = document.getElementById("ordersNewCount");
const ordersWorkCount = document.getElementById("ordersWorkCount");

let orders = [];
let currentUser = null;
const expandedHistoryIds = new Set();
const orderEvents = new Map();

const eventTypeLabels = {
    created: "Создание",
    taken: "Взята",
    released: "Освобождена",
    status_changed: "Статус",
    note: "Заметка"
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMoney(value) {
    return `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} ₽`;
}

function formatWeight(value) {
    return `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} кг`;
}

function formatDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(new Date(value));
}

function cleanPhoneForLink(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function getTelegramUsername(value) {
    return String(value || "").trim().replace(/^@/, "");
}

function getPreferredContact(order) {
    const method = String(order.preferredContactMethod || "").trim();
    const value = String(order.preferredContactValue || "").trim();

    if (method) {
        return {
            method,
            value: value || (["Телефон", "WhatsApp"].includes(method) ? order.phone : "")
        };
    }

    if (order.telegram) {
        return {
            method: "Telegram",
            value: order.telegram
        };
    }

    if (order.maxContact) {
        return {
            method: "MAX",
            value: order.maxContact
        };
    }

    return {
        method: "",
        value: ""
    };
}

function getPreferredContactText(order) {
    const contact = getPreferredContact(order);

    if (!contact.method) {
        return "Не указан";
    }

    return `${contact.method}: ${contact.value || "Не указан"}`;
}

function getContactAction(order) {
    const contact = getPreferredContact(order);
    const method = contact.method;
    const value = contact.value || "";
    const phoneDigits = cleanPhoneForLink(value || order.phone);

    if (!method) {
        return phoneDigits
            ? { label: "Позвонить", href: `tel:+${phoneDigits}` }
            : null;
    }

    if (method === "Телефон") {
        return phoneDigits
            ? { label: "Связаться", href: `tel:+${phoneDigits}` }
            : null;
    }

    if (method === "WhatsApp") {
        return phoneDigits
            ? { label: "Связаться", href: `https://wa.me/${phoneDigits}`, external: true }
            : null;
    }

    if (method === "Telegram") {
        const username = getTelegramUsername(value);
        return username
            ? { label: "Связаться", href: `https://t.me/${encodeURIComponent(username)}`, external: true }
            : null;
    }

    if (method === "Почта") {
        return value
            ? { label: "Связаться", href: `mailto:${value}` }
            : null;
    }

    if (method === "MAX") {
        return {
            label: value ? `Связь через MAX: контакт указан` : "Связь через MAX: контакт не указан",
            disabled: true
        };
    }

    return null;
}

function setMessage(message = "") {
    managerMessage.textContent = message;
}

function getRoleLabel(role) {
    const labels = {
        admin: "Админ",
        manager: "Менеджер"
    };

    return labels[role] || role || "";
}

async function checkAccess() {
    setMessage("Проверка доступа...");
    ordersList.innerHTML = "";

    try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            window.location.href = "/login.html";
            return false;
        }

        currentUser = result.user;
        managerUserName.textContent = currentUser.name;
        managerUserRole.textContent = getRoleLabel(currentUser.role);
        return true;
    } catch {
        setMessage("Не удалось проверить доступ. Сервер недоступен.");
        return false;
    }
}

function renderStatusOptions(selectedStatus) {
    return statuses
        .map(status => `<option value="${escapeHtml(status)}"${status === selectedStatus ? " selected" : ""}>${escapeHtml(status)}</option>`)
        .join("");
}

function renderItems(items = []) {
    if (!items.length) {
        return "<p>Товары не указаны.</p>";
    }

    return `
        <table class="items-table">
            <thead>
                <tr>
                    <th>Товар</th>
                    <th>Кол-во</th>
                    <th>Вес</th>
                    <th>Сумма</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${escapeHtml(item.name)}</td>
                        <td>${escapeHtml(item.qty)} ${escapeHtml(item.unit || "шт")}</td>
                        <td>${formatWeight(item.lineWeight ?? ((item.weight || 0) * (item.qty || 0)))}</td>
                        <td>${formatMoney(item.lineTotal)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function renderContactActions(order) {
    const action = getContactAction(order);

    if (!action) {
        return `<div class="order-actions"><span class="contact-disabled">Контакт не указан</span></div>`;
    }

    if (action.disabled) {
        return `<div class="order-actions"><span class="contact-disabled">${escapeHtml(action.label)}</span></div>`;
    }

    return `
        <div class="order-actions">
            <a href="${escapeHtml(action.href)}"${action.external ? ` target="_blank" rel="noopener"` : ""}>${escapeHtml(action.label)}</a>
        </div>
    `;
}

function isClosedOrder(order) {
    return ["Завершена", "Отменена"].includes(order.status);
}

function isOwnOrder(order) {
    return currentUser && Number(order.managerId) === Number(currentUser.id);
}

function canReleaseOrder(order) {
    if (!currentUser || !order.managerId || isClosedOrder(order)) return false;
    return currentUser.role === "admin" || isOwnOrder(order);
}

function canTakeOrder(order) {
    return currentUser
        && !order.managerId
        && !isClosedOrder(order)
        && ["admin", "manager"].includes(currentUser.role);
}

function canChangeOrderStatus(order) {
    return Boolean(order.managerId) && isOwnOrder(order) && !isClosedOrder(order);
}

function canAddNote(order) {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    if (!order.managerId) return true;
    return isOwnOrder(order);
}

function renderAssignment(order) {
    if (!order.managerId) {
        return `
            <section class="assignment assignment-free">
                <div>
                    <span class="assignment-label">Ответственный</span>
                    <strong><i></i> Свободна</strong>
                </div>
            </section>
        `;
    }

    const lockText = isOwnOrder(order) || currentUser?.role === "admin" ? "" : `<span class="assignment-lock">В работе у: ${escapeHtml(order.managerName || "Менеджер")}</span>`;

    return `
        <section class="assignment assignment-taken">
            <div>
                <span class="assignment-label">Ответственный</span>
                <strong>${escapeHtml(order.managerName || "Менеджер")}</strong>
                <small>Принята: ${escapeHtml(formatDate(order.takenAt))}</small>
                ${lockText}
            </div>
        </section>
    `;
}

function renderOrderControls(order) {
    const takeButton = canTakeOrder(order)
        ? `<button class="assignment-action" data-action="take" data-id="${order.id}" type="button">Взять в работу</button>`
        : "";
    const statusControl = canChangeOrderStatus(order)
        ? `
            <label class="order-field status-control">
                <span>Изменить статус</span>
                <select class="status-select" data-id="${order.id}">
                    ${renderStatusOptions(order.status)}
                </select>
            </label>
        `
        : "";
    const releaseButton = canReleaseOrder(order)
        ? `<button class="assignment-action secondary" data-action="release" data-id="${order.id}" type="button">Освободить</button>`
        : "";
    const lockText = order.managerId && !isOwnOrder(order) && currentUser?.role !== "admin"
        ? `<span class="order-lock">В работе у: ${escapeHtml(order.managerName || "Менеджер")}</span>`
        : "";

    if (!takeButton && !statusControl && !releaseButton && !lockText) return "";

    return `<div class="order-controls">${takeButton}${statusControl}${releaseButton}${lockText}</div>`;
}

function renderEventList(events) {
    if (!events) {
        return `<p class="history-empty">История загружается...</p>`;
    }

    if (!events.length) {
        return `<p class="history-empty">История пока пустая.</p>`;
    }

    return `
        <div class="history-timeline">
            ${events.map(eventItem => `
                <article class="history-event ${eventItem.eventType === "note" ? "history-event-note" : ""}">
                    <div class="history-event-meta">
                        <span class="history-type">${escapeHtml(eventTypeLabels[eventItem.eventType] || eventItem.eventType)}</span>
                        <strong>${escapeHtml(eventItem.userName || "Система")}</strong>
                        <time>${escapeHtml(formatDate(eventItem.createdAt))}</time>
                    </div>
                    <p>${escapeHtml(eventItem.message)}</p>
                </article>
            `).join("")}
        </div>
    `;
}

function renderHistory(order) {
    const orderId = String(order.id);
    const isExpanded = expandedHistoryIds.has(orderId);
    const events = orderEvents.get(orderId);

    return `
        <section class="order-history">
            <button class="history-toggle" data-id="${order.id}" type="button">
                ${isExpanded ? "Скрыть историю" : "История"}
            </button>
            ${isExpanded ? `
                <div class="history-panel">
                    ${renderEventList(events)}
                    ${canAddNote(order) ? `
                        <div class="note-form">
                            <textarea class="note-input" data-id="${order.id}" maxlength="1000" rows="3" placeholder="Внутренняя заметка"></textarea>
                            <button class="note-submit" data-id="${order.id}" type="button">Сохранить заметку</button>
                        </div>
                    ` : `<p class="history-empty">Заметки доступны только ответственному менеджеру или администратору.</p>`}
                </div>
            ` : ""}
        </section>
    `;
}

function renderInfoRow(label, value) {
    if (!value) return "";

    return `
        <div class="info-row">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </div>
    `;
}

function renderOrderSummary(order) {
    return `
        <div class="order-summary">
            <span>Итого: <strong>${formatMoney(order.totalPrice)}</strong></span>
            <span>Вес: <strong>${formatWeight(order.totalWeight)}</strong></span>
        </div>
    `;
}

function updateStats() {
    if (ordersTotalCount) ordersTotalCount.textContent = orders.length;
    if (ordersNewCount) ordersNewCount.textContent = orders.filter(order => order.status === "Новая").length;
    if (ordersWorkCount) ordersWorkCount.textContent = orders.filter(order => order.status === "В работе").length;
}

function renderStatusTabs() {
    if (!statusTabs) return;

    const activeStatus = statusFilter.value;
    const filters = [{ label: "Все", value: "" }, ...statuses.map(status => ({ label: status, value: status }))];

    statusTabs.innerHTML = filters.map(filter => `
        <button class="${filter.value === activeStatus ? "active" : ""}" data-status="${escapeHtml(filter.value)}" type="button">
            ${escapeHtml(filter.label)}
        </button>
    `).join("");
}

function renderOrders() {
    updateStats();
    renderStatusTabs();

    const selectedStatus = statusFilter.value;
    const visibleOrders = selectedStatus
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    if (!visibleOrders.length) {
        ordersList.innerHTML = `
            <section class="empty-state">
                <h2>Заявок пока нет</h2>
                <p>Новые заявки появятся здесь после оформления заказа на сайте.</p>
            </section>
        `;
        return;
    }

    ordersList.innerHTML = visibleOrders.map(order => `
        <article class="order-card" data-id="${order.id}">
            <header class="order-card-header">
                <div class="order-title">
                    <strong>Заказ #${order.id}</strong>
                    <span>${escapeHtml(formatDate(order.createdAt))}</span>
                </div>
                <div class="order-header-side">
                    <span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>
                    ${renderAssignment(order)}
                </div>
            </header>

            <div class="order-sections">
                <section class="order-section">
                    <h2>Клиент</h2>
                    ${renderInfoRow("Имя", order.customerName)}
                    ${renderInfoRow("Телефон", order.phone)}
                    ${renderInfoRow("Предпочтительный канал", getPreferredContactText(order))}
                </section>

                <section class="order-section">
                    <h2>Доставка и оплата</h2>
                    ${renderInfoRow("Адрес", order.address || "Не указан")}
                    ${renderInfoRow("Разгрузка", order.unloading || "Нет")}
                    ${renderInfoRow("Оплата", order.paymentMethod || "Не указана")}
                    ${order.comment ? renderInfoRow("Комментарий", order.comment) : ""}
                </section>

                <section class="order-section order-section-wide">
                    <h2>Заказ</h2>
                    ${renderItems(order.items)}
                    ${renderOrderSummary(order)}
                </section>
            </div>
            ${renderHistory(order)}

            <footer class="order-card-footer">
                ${renderContactActions(order)}
                ${renderOrderControls(order)}
            </footer>
        </article>
    `).join("");
}

async function loadOrders(options = {}) {
    const { preserveMessage = false } = options;
    if (!preserveMessage) {
        setMessage("Загружаем заявки...");
    }

    try {
        const response = await fetch("/api/orders", { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Список заявок не загрузился.");
        }

        orders = result.orders || [];
        if (!preserveMessage) {
            setMessage("");
        }
        renderOrders();
    } catch (error) {
        ordersList.innerHTML = `
            <section class="empty-state error-state">
                <h2>Не удалось загрузить заявки</h2>
                <p>${escapeHtml(error.message || "Сервер недоступен. Попробуйте обновить список.")}</p>
                <button class="retry-load" type="button">Повторить</button>
            </section>
        `;
        setMessage(error.message || "Сервер недоступен. Попробуйте обновить страницу.");
    }
}

async function loadOrderEvents(id) {
    const orderId = String(id);

    try {
        const response = await fetch(`/api/orders/${id}/events`, { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "История заявки не загрузилась.");
        }

        orderEvents.set(orderId, result.events || []);
        renderOrders();
    } catch (error) {
        orderEvents.set(orderId, []);
        setMessage(error.message || "Не удалось загрузить историю заявки.");
        renderOrders();
    }
}

async function refreshExpandedHistory(id) {
    const orderId = String(id);
    if (expandedHistoryIds.has(orderId)) {
        orderEvents.delete(orderId);
        await loadOrderEvents(orderId);
    }
}

async function addOrderNote(id, message) {
    const cleanMessage = String(message || "").trim();

    if (cleanMessage.length < 2) {
        setMessage("Заметка должна быть не короче 2 символов.");
        return;
    }

    try {
        const response = await fetch(`/api/orders/${id}/notes`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: cleanMessage })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заметка не сохранилась.");
        }

        setMessage("Заметка сохранена.");
        await loadOrderEvents(id);
    } catch (error) {
        setMessage(error.message || "Не удалось сохранить заметку.");
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`/api/orders/${id}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Статус не обновился.");
        }

        const order = orders.find(item => String(item.id) === String(id));
        if (order) {
            order.status = status;
        }

        setMessage("Статус обновлен.");
        renderOrders();
        await refreshExpandedHistory(id);
    } catch (error) {
        setMessage(error.message || "Не удалось обновить статус.");
        renderOrders();
    }
}

async function runOrderAction(id, action) {
    const actionMessages = {
        take: "Заявка взята в работу.",
        release: "Заявка освобождена."
    };

    try {
        const response = await fetch(`/api/orders/${id}/${action}`, {
            method: "POST",
            credentials: "include"
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Действие не выполнено.");
        }

        await loadOrders({ preserveMessage: true });
        await refreshExpandedHistory(id);
        setMessage(actionMessages[action] || "Заявка обновлена.");
    } catch (error) {
        await loadOrders({ preserveMessage: true });
        setMessage(error.message || "Не удалось обновить заявку.");
    }
}

statuses.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
});

statusFilter.addEventListener("change", renderOrders);
statusTabs?.addEventListener("click", event => {
    const button = event.target.closest("button[data-status]");
    if (!button) return;

    statusFilter.value = button.dataset.status;
    renderOrders();
});
refreshOrdersBtn.addEventListener("click", loadOrders);
logoutBtn.addEventListener("click", async () => {
    try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
        window.location.href = "/login.html";
    }
});
ordersList.addEventListener("change", event => {
    const select = event.target.closest(".status-select");
    if (!select) return;

    updateOrderStatus(select.dataset.id, select.value);
});

ordersList.addEventListener("click", event => {
    const retryButton = event.target.closest(".retry-load");
    if (retryButton) {
        loadOrders();
        return;
    }

    const historyButton = event.target.closest(".history-toggle");
    if (historyButton) {
        const orderId = String(historyButton.dataset.id);

        if (expandedHistoryIds.has(orderId)) {
            expandedHistoryIds.delete(orderId);
            renderOrders();
            return;
        }

        expandedHistoryIds.add(orderId);
        renderOrders();

        if (!orderEvents.has(orderId)) {
            loadOrderEvents(orderId);
        }

        return;
    }

    const noteButton = event.target.closest(".note-submit");
    if (noteButton) {
        const orderId = String(noteButton.dataset.id);
        const noteInput = noteButton.closest(".order-history")?.querySelector(".note-input");

        addOrderNote(orderId, noteInput?.value || "");
        return;
    }

    const button = event.target.closest(".assignment-action");
    if (!button) return;

    runOrderAction(button.dataset.id, button.dataset.action);
});

checkAccess().then(isAllowed => {
    if (isAllowed) {
        loadOrders();
    }
});
