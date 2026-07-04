const statuses = [
    "Новая",
    "В работе",
    "Ожидает клиента",
    "Доставка",
    "Завершена",
    "Отменена"
];
const deletedStatusFilter = "__deleted";

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
const crmNavButtons = document.querySelectorAll(".crm-nav button[data-section]");
const ordersTopbar = document.getElementById("ordersTopbar");
const clientsView = document.getElementById("clientsView");
const clientsList = document.getElementById("clientsList");
const clientSearchInput = document.getElementById("clientSearchInput");
const refreshClientsBtn = document.getElementById("refreshClients");
const clientsTotalCount = document.getElementById("clientsTotalCount");
const repeatClientsCount = document.getElementById("repeatClientsCount");
const clientsTotalSpent = document.getElementById("clientsTotalSpent");

let orders = [];
let clients = [];
let currentUser = null;
let activeSection = "orders";
let regularOrderStats = {
    total: 0,
    new: 0,
    work: 0
};
const expandedHistoryIds = new Set();
const orderEvents = new Map();
const expandedClientOrderIds = new Set();
const clientOrders = new Map();
const activeOrderTabs = new Map();
let expandedDeletedOrderId = null;

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

function getOrderNumber(order) {
    return order?.orderNumber || `№${order?.id || ""}`;
}

function getOrderTitle(order) {
    return `Заказ ${getOrderNumber(order)}`;
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

function getClientPreferredContactText(client) {
    if (client.preferredContactMethod) {
        return `${client.preferredContactMethod}: ${client.preferredContactValue || "Не указан"}`;
    }

    if (client.telegram) return `Telegram: ${client.telegram}`;
    if (client.whatsapp) return `WhatsApp: ${client.whatsapp}`;
    if (client.maxContact) return `MAX: ${client.maxContact}`;
    if (client.email) return `Почта: ${client.email}`;

    return "";
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
    if (!currentUser || !order.managerId || order.deletedAt) return false;
    return currentUser.role === "admin" || isOwnOrder(order);
}

function canTakeOrder(order) {
    return currentUser
        && !order.managerId
        && !order.deletedAt
        && !isClosedOrder(order)
        && ["admin", "manager"].includes(currentUser.role);
}

function canChangeOrderStatus(order) {
    return Boolean(order.managerId) && isOwnOrder(order) && !order.deletedAt;
}

function canDeleteOrder(order) {
    if (!currentUser || order.deletedAt) return false;
    if (currentUser.role === "admin") return true;
    return isOwnOrder(order);
}

function canRestoreOrder(order) {
    if (!currentUser || !order.deletedAt) return false;
    if (currentUser.role === "admin") return true;
    return isOwnOrder(order);
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
    if (order.deletedAt) {
        return canRestoreOrder(order)
            ? `<div class="order-controls"><button class="restore-order" data-id="${order.id}" type="button">Восстановить</button></div>`
            : "";
    }

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
    const deleteButton = canDeleteOrder(order)
        ? `<button class="delete-order" data-id="${order.id}" type="button">Удалить</button>`
        : "";
    const lockText = order.managerId && !isOwnOrder(order) && currentUser?.role !== "admin"
        ? `<span class="order-lock">В работе у: ${escapeHtml(order.managerName || "Менеджер")}</span>`
        : "";

    if (!takeButton && !statusControl && !releaseButton && !deleteButton && !lockText) return "";

    return `<div class="order-controls">${takeButton}${statusControl}${releaseButton}${deleteButton}${lockText}</div>`;
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

function renderOrderClientBlock(order) {
    if (!order.clientId) return "";

    return `
        <div class="client-mini">
            <div>
                <span>Клиент в базе</span>
                <strong>${escapeHtml(order.clientOrdersCount || 1)} заказ(ов) · ${formatMoney(order.clientTotalSpent || order.totalPrice)}</strong>
            </div>
            <button class="open-client" data-client-id="${order.clientId}" type="button">История клиента</button>
        </div>
    `;
}

function getOrderTab(order) {
    return activeOrderTabs.get(String(order.id)) || "overview";
}

function renderOrderTabs(order) {
    const activeTab = getOrderTab(order);
    const tabs = [
        { id: "overview", label: "Обзор" },
        { id: "client", label: "Клиент" },
        { id: "history", label: "История" },
        { id: "documents", label: "Документы" }
    ];

    return `
        <nav class="order-tabs" aria-label="Разделы заявки">
            ${tabs.map(tab => `
                <button class="${activeTab === tab.id ? "active" : ""}" data-order-id="${order.id}" data-tab="${tab.id}" type="button">
                    ${escapeHtml(tab.label)}
                </button>
            `).join("")}
        </nav>
    `;
}

function renderOverviewTab(order) {
    return `
        <div class="order-sections">
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

        <footer class="order-card-footer">
            ${renderContactActions(order)}
            ${renderOrderControls(order)}
        </footer>
    `;
}

function renderClientTab(order) {
    return `
        <section class="order-section order-section-wide">
            <h2>Клиент</h2>
            ${renderInfoRow("Имя", order.customerName)}
            ${renderInfoRow("Телефон", order.phone)}
            ${renderInfoRow("Предпочтительный канал", getPreferredContactText(order))}
            ${order.clientId ? `
                <div class="client-mini">
                    <div>
                        <span>Клиент в базе</span>
                        <strong>${escapeHtml(order.clientOrdersCount || 1)} заказ(ов) · ${formatMoney(order.clientTotalSpent || order.totalPrice)}</strong>
                    </div>
                    <button class="open-client" data-client-id="${order.clientId}" type="button">История клиента</button>
                </div>
            ` : ""}
        </section>
    `;
}

function renderOrderTabContent(order) {
    const activeTab = getOrderTab(order);

    if (activeTab === "client") {
        return renderClientTab(order);
    }

    if (activeTab === "history") {
        return `<section class="order-section order-section-wide"><h2>История</h2><p class="history-empty">История будет добавлена следующим этапом.</p></section>`;
    }

    if (activeTab === "documents") {
        return `<section class="order-section order-section-wide"><h2>Документы</h2><p class="history-empty">Документы будут добавлены позже.</p></section>`;
    }

    return renderOverviewTab(order);
}

function renderDeletedOrder(order) {
    const isExpanded = String(order.id) === String(expandedDeletedOrderId);

    return `
        <article class="order-card order-card-deleted deleted-order-row ${isExpanded ? "expanded" : ""}" data-id="${order.id}">
            <header class="deleted-order-header" data-id="${order.id}" tabindex="0">
                <div class="order-title">
                    <strong>${escapeHtml(getOrderTitle(order))}</strong>
                    <span>Создан: ${escapeHtml(formatDate(order.createdAt))}</span>
                </div>
                <div class="deleted-order-meta">
                    <span class="status-badge status-deleted">Удалена</span>
                    <span class="deleted-date">Удалена: ${escapeHtml(formatDate(order.deletedAt))}</span>
                    ${canRestoreOrder(order) ? `<button class="restore-order" data-id="${order.id}" type="button">Восстановить</button>` : ""}
                </div>
            </header>

            ${isExpanded ? `
                <div class="deleted-order-details">
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
                    </section>
                    <section class="order-section order-section-wide">
                        <h2>Заказ</h2>
                        ${renderItems(order.items)}
                        ${renderOrderSummary(order)}
                    </section>
                </div>
            ` : ""}
        </article>
    `;
}

function renderActiveOrder(order) {
    return `
        <article class="order-card" data-id="${order.id}">
            <header class="order-card-header">
                <div class="order-title">
                    <strong>${escapeHtml(getOrderTitle(order))}</strong>
                    <span>${escapeHtml(formatDate(order.createdAt))}</span>
                </div>
                <div class="order-header-side">
                    <span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>
                    ${renderAssignment(order)}
                </div>
            </header>

            ${renderOrderTabs(order)}
            <div class="order-tab-panel">
                ${renderOrderTabContent(order)}
            </div>
        </article>
    `;
}

function updateStats() {
    if (ordersTotalCount) ordersTotalCount.textContent = regularOrderStats.total;
    if (ordersNewCount) ordersNewCount.textContent = regularOrderStats.new;
    if (ordersWorkCount) ordersWorkCount.textContent = regularOrderStats.work;
}

function renderStatusTabs() {
    if (!statusTabs) return;

    const activeStatus = statusFilter.value;
    const filters = [
        { label: "Все", value: "" },
        ...statuses.map(status => ({ label: status, value: status })),
        { label: "Удалены", value: deletedStatusFilter }
    ];

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
    const visibleOrders = selectedStatus && selectedStatus !== deletedStatusFilter
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    if (!visibleOrders.length) {
        const emptyTitle = selectedStatus === deletedStatusFilter ? "Удаленных заявок нет" : "Заявок пока нет";
        const emptyText = selectedStatus === deletedStatusFilter
            ? "Скрытые заявки появятся здесь после удаления из CRM."
            : "Новые заявки появятся здесь после оформления заказа на сайте.";

        ordersList.innerHTML = `
            <section class="empty-state">
                <h2>${emptyTitle}</h2>
                <p>${emptyText}</p>
            </section>
        `;
        return;
    }

    ordersList.innerHTML = visibleOrders
        .map(order => order.deletedAt ? renderDeletedOrder(order) : renderActiveOrder(order))
        .join("");
}

async function loadOrders(options = {}) {
    const { preserveMessage = false } = options;
    if (!preserveMessage) {
        setMessage("Загружаем заявки...");
    }

    try {
        const isDeletedFilter = statusFilter.value === deletedStatusFilter;
        const response = await fetch(isDeletedFilter ? "/api/orders?deleted=true" : "/api/orders", { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Список заявок не загрузился.");
        }

        orders = result.orders || [];
        if (!isDeletedFilter) {
            regularOrderStats = {
                total: orders.length,
                new: orders.filter(order => order.status === "Новая").length,
                work: orders.filter(order => order.status === "В работе").length
            };
        }
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

function setActiveSection(section) {
    activeSection = section;

    crmNavButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });

    const isOrders = section === "orders";
    ordersTopbar?.classList.toggle("hidden", !isOrders);
    statusFilter?.closest(".manager-toolbar")?.classList.toggle("hidden", !isOrders);
    ordersList?.classList.toggle("hidden", !isOrders);
    clientsView?.classList.toggle("hidden", isOrders);
    setMessage("");

}

function updateClientStats() {
    if (clientsTotalCount) clientsTotalCount.textContent = clients.length;
    if (repeatClientsCount) repeatClientsCount.textContent = clients.filter(client => Number(client.ordersCount) > 1).length;
    if (clientsTotalSpent) {
        const totalSpent = clients.reduce((sum, client) => sum + (Number(client.totalSpent) || 0), 0);
        clientsTotalSpent.textContent = formatMoney(totalSpent);
    }
}

function getVisibleClients() {
    const query = String(clientSearchInput?.value || "").trim().toLowerCase();
    if (!query) return clients;

    const digits = cleanPhoneForLink(query);
    return clients.filter(client => {
        const nameMatch = String(client.name || "").toLowerCase().includes(query);
        const phoneMatch = digits && cleanPhoneForLink(client.phone).includes(digits);
        return nameMatch || phoneMatch;
    });
}

function renderClientOrders(clientId) {
    const ordersForClient = clientOrders.get(String(clientId));

    if (!ordersForClient) {
        return `<p class="history-empty">История заказов загружается...</p>`;
    }

    if (!ordersForClient.length) {
        return `<p class="history-empty">Заказов пока нет.</p>`;
    }

    return `
        <div class="client-orders-list">
            ${ordersForClient.map(order => `
                <article class="client-order-row">
                    <strong>${escapeHtml(getOrderTitle(order))}</strong>
                    <span>${escapeHtml(formatDate(order.createdAt))}</span>
                    <span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>
                    <span>${formatMoney(order.totalPrice)}</span>
                    ${order.managerName ? `<span>Ответственный: ${escapeHtml(order.managerName)}</span>` : ""}
                </article>
            `).join("")}
        </div>
    `;
}

function renderClients() {
    updateClientStats();

    const visibleClients = getVisibleClients();
    if (!visibleClients.length) {
        clientsList.innerHTML = `
            <section class="empty-state">
                <h2>Клиентов пока нет</h2>
                <p>Клиенты появятся здесь после оформления заказов на сайте.</p>
            </section>
        `;
        return;
    }

    clientsList.innerHTML = visibleClients.map(client => {
        const clientId = String(client.id);
        const isExpanded = expandedClientOrderIds.has(clientId);

        return `
            <article class="client-card" data-client-id="${client.id}">
                <header class="client-card-header">
                    <div>
                        <strong>${escapeHtml(client.name)}</strong>
                        <span>${escapeHtml(client.phone)}</span>
                    </div>
                    <button class="client-orders-toggle" data-client-id="${client.id}" type="button">
                        ${isExpanded ? "Скрыть историю" : "История заказов"}
                    </button>
                </header>

                <div class="client-card-grid">
                    ${renderInfoRow("Предпочтительный канал", getClientPreferredContactText(client) || "Не указан")}
                    ${renderInfoRow("Заказов", String(client.ordersCount || 0))}
                    ${renderInfoRow("Общая сумма", formatMoney(client.totalSpent))}
                    ${client.lastOrderAt ? renderInfoRow("Последний заказ", formatDate(client.lastOrderAt)) : ""}
                </div>

                ${isExpanded ? `<section class="client-orders-panel">${renderClientOrders(client.id)}</section>` : ""}
            </article>
        `;
    }).join("");
}

async function loadClients(options = {}) {
    const { preserveMessage = false } = options;
    if (!preserveMessage) {
        setMessage("Загружаем клиентов...");
    }

    try {
        const response = await fetch("/api/clients", { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Список клиентов не загрузился.");
        }

        clients = result.clients || [];
        if (!preserveMessage) setMessage("");
        renderClients();
    } catch (error) {
        clientsList.innerHTML = `
            <section class="empty-state error-state">
                <h2>Не удалось загрузить клиентов</h2>
                <p>${escapeHtml(error.message || "Сервер недоступен. Попробуйте обновить список.")}</p>
                <button class="retry-clients-load" type="button">Повторить</button>
            </section>
        `;
        setMessage(error.message || "Не удалось загрузить клиентов.");
    }
}

async function loadClientOrders(clientId) {
    const key = String(clientId);

    try {
        const response = await fetch(`/api/clients/${clientId}/orders`, { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "История заказов клиента не загрузилась.");
        }

        clientOrders.set(key, result.orders || []);
        renderClients();
    } catch (error) {
        clientOrders.set(key, []);
        setMessage(error.message || "Не удалось загрузить историю заказов клиента.");
        renderClients();
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

async function deleteOrder(orderId) {
    if (!orderId) {
        setMessage("Не удалось определить номер заявки для удаления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    if (!window.confirm(`Удалить заявку ${orderNumber}? Она будет скрыта из CRM, но останется в базе.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: "DELETE",
            credentials: "include"
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заявка не удалена.");
        }

        expandedHistoryIds.delete(String(orderId));
        orderEvents.delete(String(orderId));
        activeOrderTabs.delete(String(orderId));
        await loadOrders({ preserveMessage: true });
        setMessage("Заявка перемещена в удаленные.");
    } catch (error) {
        setMessage(error.message || "Не удалось удалить заявку.");
    }
}

async function restoreOrder(orderId) {
    if (!orderId) {
        setMessage("Не удалось определить номер заявки для восстановления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    if (!window.confirm(`Восстановить заявку ${orderNumber}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}/restore`, {
            method: "POST",
            credentials: "include"
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заявка не восстановлена.");
        }

        await loadOrders({ preserveMessage: true });
        if (String(expandedDeletedOrderId) === String(orderId)) {
            expandedDeletedOrderId = null;
        }
        setMessage("Заявка восстановлена.");
    } catch (error) {
        setMessage(error.message || "Не удалось восстановить заявку.");
    }
}

statuses.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
});
const deletedOption = document.createElement("option");
deletedOption.value = deletedStatusFilter;
deletedOption.textContent = "Удалены";
statusFilter.appendChild(deletedOption);

statusFilter.addEventListener("change", loadOrders);
statusTabs?.addEventListener("click", event => {
    const button = event.target.closest("button[data-status]");
    if (!button) return;

    statusFilter.value = button.dataset.status;
    loadOrders();
});
crmNavButtons.forEach(button => {
    button.addEventListener("click", () => {
        setActiveSection(button.dataset.section);

        if (button.dataset.section === "clients" && !clients.length) {
            loadClients();
        }
    });
});
refreshOrdersBtn.addEventListener("click", loadOrders);
refreshClientsBtn?.addEventListener("click", () => loadClients());
clientSearchInput?.addEventListener("input", renderClients);
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

    const tabButton = event.target.closest(".order-tabs button[data-tab]");
    if (tabButton) {
        activeOrderTabs.set(String(tabButton.dataset.orderId), tabButton.dataset.tab);
        renderOrders();
        return;
    }

    const deletedHeader = event.target.closest(".deleted-order-header");
    if (deletedHeader && !event.target.closest(".restore-order")) {
        const orderId = String(deletedHeader.dataset.id);
        expandedDeletedOrderId = expandedDeletedOrderId === orderId ? null : orderId;
        renderOrders();
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

    const openClientButton = event.target.closest(".open-client");
    if (openClientButton) {
        const clientId = String(openClientButton.dataset.clientId);
        setActiveSection("clients");
        expandedClientOrderIds.add(clientId);
        loadClients({ preserveMessage: true }).then(() => {
            if (!clientOrders.has(clientId)) {
                loadClientOrders(clientId);
            }
        });
        return;
    }

    const deleteButton = event.target.closest(".delete-order");
    if (deleteButton) {
        deleteOrder(deleteButton.dataset.id);
        return;
    }

    const restoreButton = event.target.closest(".restore-order");
    if (restoreButton) {
        restoreOrder(restoreButton.dataset.id);
        return;
    }

    const button = event.target.closest(".assignment-action");
    if (!button) return;

    runOrderAction(button.dataset.id, button.dataset.action);
});

clientsList?.addEventListener("click", event => {
    const retryButton = event.target.closest(".retry-clients-load");
    if (retryButton) {
        loadClients();
        return;
    }

    const toggleButton = event.target.closest(".client-orders-toggle");
    if (!toggleButton) return;

    const clientId = String(toggleButton.dataset.clientId);
    if (expandedClientOrderIds.has(clientId)) {
        expandedClientOrderIds.delete(clientId);
        renderClients();
        return;
    }

    expandedClientOrderIds.add(clientId);
    renderClients();

    if (!clientOrders.has(clientId)) {
        loadClientOrders(clientId);
    }
});

checkAccess().then(isAllowed => {
    if (isAllowed) {
        loadOrders();
        setActiveSection("orders");
    }
});
