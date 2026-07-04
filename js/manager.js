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
const refreshOrdersBtn = document.getElementById("refreshOrders");
const managerMessage = document.getElementById("managerMessage");
const managerUserName = document.getElementById("managerUserName");
const managerUserRole = document.getElementById("managerUserRole");
const logoutBtn = document.getElementById("logoutBtn");

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
    const phoneDigits = cleanPhoneForLink(order.phone);
    const telegram = getTelegramUsername(order.telegram);

    return `
        <div class="order-actions">
            ${phoneDigits ? `<a href="tel:+${phoneDigits}">Позвонить</a>` : ""}
            ${phoneDigits ? `<a class="whatsapp-link" href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            ${telegram ? `<a class="telegram-link" href="https://t.me/${escapeHtml(telegram)}" target="_blank" rel="noopener">Telegram</a>` : ""}
            ${order.maxContact ? `<span class="max-disabled">MAX</span>` : ""}
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
                ${canTakeOrder(order) ? `<button class="assignment-action" data-action="take" data-id="${order.id}" type="button">Взять в работу</button>` : ""}
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

    if (!statusControl && !releaseButton) return "";

    return `<div class="order-controls">${statusControl}${releaseButton}</div>`;
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

function renderOrders() {
    const selectedStatus = statusFilter.value;
    const visibleOrders = selectedStatus
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    if (!visibleOrders.length) {
        ordersList.innerHTML = "<p>Заявок пока нет.</p>";
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

            <div class="order-grid">
                <div class="order-field"><span>Клиент</span><strong>${escapeHtml(order.customerName)}</strong></div>
                <div class="order-field"><span>Телефон</span><strong>${escapeHtml(order.phone)}</strong></div>
                <div class="order-field"><span>Telegram</span><strong>${escapeHtml(order.telegram || "Не указан")}</strong></div>
                <div class="order-field"><span>MAX</span><strong>${escapeHtml(order.maxContact || "Не указан")}</strong></div>
                <div class="order-field"><span>Адрес</span><strong>${escapeHtml(order.address || "Не указан")}</strong></div>
                <div class="order-field"><span>Разгрузка</span><strong>${escapeHtml(order.unloading || "Нет")}</strong></div>
                <div class="order-field"><span>Оплата</span><strong>${escapeHtml(order.paymentMethod || "Не указана")}</strong></div>
                <div class="order-field"><span>Комментарий</span><p>${escapeHtml(order.comment || "Без комментария")}</p></div>
            </div>

            ${renderItems(order.items)}
            ${renderHistory(order)}

            <footer class="order-card-footer">
                <div class="order-total">
                    <span>Итого: ${formatMoney(order.totalPrice)}</span>
                    <span>Вес: ${formatWeight(order.totalWeight)}</span>
                </div>
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
        ordersList.innerHTML = "";
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
