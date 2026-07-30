// Order rendering, filters, and list loading.
const orderAttachments = new Map();
const orderAttachmentErrors = new Map();
const orderAttachmentsLoading = new Set();
const expandedOrdersStorageKey = "matmix.crm.expandedOrderIds";

try {
    window.sessionStorage.removeItem(expandedOrdersStorageKey);
} catch {
    // The in-memory card state still works when storage is unavailable.
}

const expandedOrderIds = new Set();

function toggleOrderExpanded(orderId) {
    const normalizedOrderId = String(orderId);
    if (expandedOrderIds.has(normalizedOrderId)) {
        expandedOrderIds.delete(normalizedOrderId);
    } else {
        expandedOrderIds.add(normalizedOrderId);
    }
    return expandedOrderIds.has(normalizedOrderId);
}

function renderStatusOptions(selectedStatus) {
    return statuses
        .map(status => `<option value="${escapeHtml(status)}"${status === selectedStatus ? " selected" : ""}>${escapeHtml(status)}</option>`)
        .join("");
}

function renderItems(items = [], requestType = "order") {
    if (!items.length) {
        return requestType === "file_request"
            ? '<p class="history-empty">Товары к заявке не добавлены.</p>'
            : "<p>Товары не указаны.</p>";
    }

    return `
        <div class="order-items-list">
            ${items.map(item => `
                <article class="order-item-row">
                    <div class="order-item-name">${escapeHtml(item.name)}</div>
                    <div class="order-item-metrics">
                        <span class="order-item-metric">
                            <span class="order-item-label">Кол-во:</span>
                            <span class="order-item-value">${escapeHtml(item.qty)} ${escapeHtml(item.unit || "шт")}</span>
                        </span>
                        <span class="order-item-metric">
                            <span class="order-item-label">Вес:</span>
                            <span class="order-item-value">${formatWeight(item.lineWeight ?? ((item.weight || 0) * (item.qty || 0)))}</span>
                        </span>
                        <span class="order-item-metric">
                            <span class="order-item-label">Сумма:</span>
                            <span class="order-item-value">${item.priceOnRequest || item.lineTotal === null
                                ? "Цена по запросу"
                                : formatMoney(item.lineTotal)}</span>
                        </span>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

function renderContactControl(action) {
    if (!action) {
        return '<span class="contact-disabled">Контакт не указан</span>';
    }

    if (action.disabled) {
        return `<span class="contact-disabled">${escapeHtml(action.label)}</span>`;
    }

    return `<a href="${escapeHtml(action.href)}"${action.external ? ` target="_blank" rel="noopener"` : ""}>${escapeHtml(action.label)}</a>`;
}

function renderOrderActions(order) {
    const action = getContactAction(order);
    const contactControl = action?.external ? "" : renderContactControl(action);
    const exportButton = `<button class="download-order-excel" data-id="${order.id}" type="button">Скачать заказ</button>`;
    return `<div class="order-actions">${contactControl}${exportButton}</div>`;
}

function renderExternalContactActions(order) {
    const action = getContactAction(order);
    return action?.external
        ? `<div class="contact-actions">${renderContactControl(action)}</div>`
        : "";
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
    if (!currentUser || order.deletedAt) return false;
    if (currentUser.role === "admin") return true;
    if (!order.managerId) return true;
    return isOwnOrder(order);
}

function renderAssignment(order) {
    if (!order.managerId) {
        return `
            <section class="assignment assignment-free">
                <div>
                    <span class="assignment-label">Закреплен за</span>
                    <strong><i></i> Свободна</strong>
                </div>
            </section>
        `;
    }

    const lockText = isOwnOrder(order) || currentUser?.role === "admin" ? "" : `<span class="assignment-lock">В работе у: ${escapeHtml(order.managerName || "Менеджер")}</span>`;

    return `
        <section class="assignment assignment-taken">
            <div>
                <span class="assignment-label">Закреплен за</span>
                <strong>${escapeHtml(order.managerName || "Менеджер")}</strong>
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
                <span class="visually-hidden">Изменить статус</span>
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

    return `<div class="order-controls${statusControl ? " order-controls-status" : ""}">${takeButton}${releaseButton}${statusControl}${deleteButton}${lockText}</div>`;
}

function renderEventList(events) {
    if (!events) {
        return renderCrmLoader("Загружаем историю...");
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
    const events = orderEvents.get(orderId);
    const noteDraft = window.CrmDrafts?.getValue(`note:${order.id}`, "") || "";

    return `
        <section class="order-history">
            <div class="history-panel">
                ${canAddNote(order) ? `
                    <div class="note-form">
                        <textarea class="note-input" data-id="${order.id}" maxlength="1000" rows="3" placeholder="Внутренняя заметка">${escapeHtml(noteDraft)}</textarea>
                        <button class="note-submit" data-id="${order.id}" type="button">Добавить заметку</button>
                    </div>
                ` : `<p class="history-empty">Заметки доступны только ответственному менеджеру или администратору.</p>`}
                ${renderEventList(events)}
            </div>
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
    const hasPriceOnRequest = order.hasPriceOnRequest
        || (Array.isArray(order.items) && order.items.some(item => item?.priceOnRequest === true));

    return `
        <div class="order-summary">
            <span>${hasPriceOnRequest ? "Предварительная сумма" : "Итого"}:
                <strong>${formatMoney(order.totalPrice)}</strong>
            </span>
            ${hasPriceOnRequest
                ? '<span><strong>Есть позиции с ценой по запросу</strong></span>'
                : ""}
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

function formatAttachmentSize(sizeBytes) {
    const size = Number(sizeBytes) || 0;
    if (size < 1024) return `${size} Б`;
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} КБ`;
    return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} МБ`;
}

function renderOrderDocuments(order) {
    const orderId = String(order.id);
    const attachments = orderAttachments.get(orderId);
    const error = orderAttachmentErrors.get(orderId);

    if (orderAttachmentsLoading.has(orderId) || (!attachments && !error)) {
        return renderCrmLoader("Загружаем документы...");
    }
    if (error) {
        return `
            <div class="order-attachments-error" role="alert">
                <p>${escapeHtml(error)}</p>
                <button class="retry-order-attachments" data-order-id="${order.id}" type="button">Повторить</button>
            </div>
        `;
    }
    if (!attachments.length) {
        return '<p class="history-empty">Документов пока нет.</p>';
    }

    return `
        <ul class="order-attachments">
            ${attachments.map(attachment => {
                const originalName = String(attachment.originalName || "Документ");
                const extension = String(attachment.extension || "").toUpperCase();
                return `
                    <li class="order-attachment">
                        <span class="order-attachment-icon" aria-hidden="true">📎</span>
                        <span class="order-attachment-details">
                            <strong title="${escapeHtml(originalName)}">${escapeHtml(originalName)}</strong>
                            <span>${escapeHtml(extension)} · ${escapeHtml(formatAttachmentSize(attachment.sizeBytes))} · ${escapeHtml(formatDate(attachment.createdAt))}</span>
                        </span>
                        <button
                            class="download-order-attachment"
                            data-order-id="${order.id}"
                            data-attachment-id="${attachment.id}"
                            type="button"
                            aria-label="Скачать файл ${escapeHtml(originalName)}"
                        >Скачать</button>
                    </li>
                `;
            }).join("")}
        </ul>
    `;
}

async function loadOrderAttachments(orderId) {
    const normalizedOrderId = String(orderId);
    if (orderAttachmentsLoading.has(normalizedOrderId)) return;

    orderAttachmentsLoading.add(normalizedOrderId);
    orderAttachmentErrors.delete(normalizedOrderId);
    renderOrders();
    try {
        const result = await CrmApi.get(`/api/orders/${normalizedOrderId}/attachments`);
        orderAttachments.set(normalizedOrderId, Array.isArray(result.attachments) ? result.attachments : []);
    } catch (error) {
        orderAttachmentErrors.set(
            normalizedOrderId,
            window.CrmErrorHandler?.getMessage(error, "Не удалось загрузить документы.")
                || "Не удалось загрузить документы."
        );
    } finally {
        orderAttachmentsLoading.delete(normalizedOrderId);
        renderOrders();
    }
}

function renderOverviewTab(order) {
    const customerName = String(order.customerName || "").trim() || "Не указано";
    const customerPhone = String(order.phone || "").trim() || "Не указан";
    const contactAction = getContactAction(order);
    const hasCompactPrimaryActions = contactAction?.href?.startsWith("tel:")
        && canTakeOrder(order)
        && canDeleteOrder(order);
    const hasStatusControls = canChangeOrderStatus(order)
        && canReleaseOrder(order)
        && canDeleteOrder(order);
    const hasUnifiedPrimaryActions = canDeleteOrder(order)
        && (canTakeOrder(order) || hasStatusControls);

    return `
        <div class="order-sections">
            <section class="order-section order-section-wide order-customer-summary order-overview-summary">
                <h2>Клиент и доставка</h2>
                <div class="order-overview-summary-grid">
                    ${renderInfoRow("Имя", customerName)}
                    ${renderInfoRow("Тел.", customerPhone)}
                    ${renderInfoRow("Разгрузка", order.unloading || "Нет")}
                    ${renderInfoRow("Оплата", order.paymentMethod || "Не указана")}
                    ${renderInfoRow("Адрес", order.address || "Не указан")}
                    ${renderInfoRow("Комментарий", order.comment || "Нет")}
                </div>
            </section>

            <section class="order-section order-section-wide">
                <h2>Заказ</h2>
                ${renderItems(order.items, order.requestType)}
                ${renderOrderSummary(order)}
            </section>
        </div>

        <footer class="order-card-footer">
            <div class="order-primary-actions${hasCompactPrimaryActions ? " order-primary-actions-compact" : ""}${hasStatusControls ? " order-primary-actions-status" : ""}${hasUnifiedPrimaryActions ? " order-primary-actions-unified" : ""}">
                ${renderOrderActions(order)}
                ${renderOrderControls(order)}
            </div>
            ${renderExternalContactActions(order)}
        </footer>
    `;
}

function renderClientTab(order) {
    return `
        <section class="order-section order-section-wide">
            <h2>Клиент</h2>
            ${renderInfoRow("Имя", order.customerName)}
            ${renderInfoRow("Телефон", order.phone)}
            ${renderInfoRow("Email", order.email)}
            ${renderInfoRow("Предпочтительный способ связи", getPreferredContactText(order))}
            ${order.consent?.given ? `
                ${renderInfoRow("Согласие", "Получено")}
                ${renderInfoRow("Дата согласия", formatDate(order.consent.at))}
                ${renderInfoRow("Версия политики", order.consent.privacyVersion || "—")}
                ${renderInfoRow("Версия условий", order.consent.termsVersion || "—")}
            ` : `<p class="order-consent-legacy">Согласие не зафиксировано — заказ создан до внедрения версионирования.</p>`}
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
        return `<section class="order-section order-section-wide"><h2>История заявки</h2>${renderHistory(order)}</section>`;
    }

    if (activeTab === "documents") {
        return `<section class="order-section order-section-wide"><h2>Документы</h2>${renderOrderDocuments(order)}</section>`;
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
                    <span>${escapeHtml(order.customerName || "Клиент не указан")}</span>
                    <span>${formatMoney(order.totalPrice)} · Вес: ${formatWeight(order.totalWeight)}</span>
                    <span>Создан: ${escapeHtml(formatDate(order.createdAt))}</span>
                    <span>Удалил: ${escapeHtml(order.deletedByName || "не указано")}</span>
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
                        ${renderInfoRow("Предпочтительный способ связи", getPreferredContactText(order))}
                    </section>
                    <section class="order-section">
                        <h2>Доставка и оплата</h2>
                        ${renderInfoRow("Адрес", order.address || "Не указан")}
                        ${renderInfoRow("Разгрузка", order.unloading || "Нет")}
                        ${renderInfoRow("Оплата", order.paymentMethod || "Не указана")}
                    </section>
                    <section class="order-section order-section-wide">
                        <h2>Заказ</h2>
                        ${renderItems(order.items, order.requestType)}
                        ${renderOrderSummary(order)}
                    </section>
                </div>
            ` : ""}
        </article>
    `;
}

function renderActiveOrder(order) {
    const orderId = String(order.id);
    const isExpanded = expandedOrderIds.has(orderId);
    const isNotificationUnread = order.isNotificationRead === false;
    const panelId = `order-details-${orderId}`;
    const attachmentCount = Number(order.attachmentCount) || 0;
    const customerName = String(order.customerName || "").trim() || "Не указан";
    const customerPhone = String(order.phone || "").trim() || "Не указан";

    return `
        <article class="order-card ${isExpanded ? "expanded" : "collapsed"}${isNotificationUnread ? " notification-unread" : ""}" data-id="${order.id}">
            ${isNotificationUnread ? '<span class="order-unread-indicator" aria-hidden="true"></span>' : ""}
            <header class="order-card-header" data-order-toggle="${order.id}" role="button" tabindex="0"
                aria-expanded="${isExpanded}" aria-controls="${escapeHtml(panelId)}"
                aria-label="${isExpanded ? "Свернуть" : "Раскрыть"} ${escapeHtml(getOrderTitle(order))}${isNotificationUnread ? ", непрочитанный заказ" : ""}">
                <div class="order-header-main">
                    <div class="order-title">
                        <strong>${escapeHtml(getOrderTitle(order))}</strong>
                        <span>${escapeHtml(formatDate(order.createdAt))}</span>
                    </div>
                    ${order.requestType === "file_request" && attachmentCount > 0
                        ? `<span class="order-request-type">Файловая заявка · Файлы: ${escapeHtml(attachmentCount)}</span>`
                        : ""}
                </div>
                <div class="order-header-customer">
                    <span><span class="order-header-customer-label">Клиент:</span> ${escapeHtml(customerName)}</span>
                    <span><span class="order-header-customer-label">Тел.:</span> ${escapeHtml(customerPhone)}</span>
                </div>
                <div class="order-header-side">
                    ${renderAssignment(order)}
                    ${order.status === "Новая"
                        ? ""
                        : `<span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>`}
                    <span class="order-expand-indicator" aria-hidden="true">⌄</span>
                </div>
            </header>

            ${isExpanded ? `
                <div id="${escapeHtml(panelId)}" class="order-card-details">
                    ${renderOrderTabs(order)}
                    <div class="order-tab-panel">
                        ${renderOrderTabContent(order)}
                    </div>
                </div>
            ` : ""}
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

    const isMyOrders = activeSection === "myOrders";
    if (isMyOrders && statusFilter.value === deletedStatusFilter) {
        statusFilter.value = "";
    }

    const activeStatus = statusFilter.value;
    const filters = [
        { label: isMyOrders ? "Все мои" : "Все", value: "" },
        ...statuses.map(status => ({ label: status, value: status })),
        ...(isMyOrders ? [] : [{ label: "Удалены", value: deletedStatusFilter }])
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
    const isMyOrders = activeSection === "myOrders";
    const visibleOrders = selectedStatus && selectedStatus !== deletedStatusFilter
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    if (!visibleOrders.length) {
        const emptyTitle = isMyOrders
            ? "У вас пока нет закрепленных заявок"
            : (selectedStatus === deletedStatusFilter ? "Удаленных заявок нет" : "Заявок пока нет");
        const emptyText = isMyOrders
            ? "Когда вы возьмете заявку в работу, она появится здесь."
            : (selectedStatus === deletedStatusFilter
            ? "Удаленные заявки появятся здесь после удаления из CRM."
            : "Новые заявки появятся здесь после оформления заказа на сайте.");

        if (append) return;
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
        .join("") + renderPaginationControls(ordersPagination, {
            id: "orders",
            loadedCount: orders.length
        });
}

function setOrderNotificationRead(orderId) {
    const normalizedOrderId = String(orderId || "");
    let changed = false;
    orders = orders.map(order => {
        if (String(order.id) !== normalizedOrderId || order.isNotificationRead === true) return order;
        changed = true;
        return { ...order, isNotificationRead: true };
    });
    if (changed) renderOrders();
}

function setAllOrderNotificationsRead() {
    let changed = false;
    orders = orders.map(order => {
        if (order.deletedAt || order.isNotificationRead === true) return order;
        changed = true;
        return { ...order, isNotificationRead: true };
    });
    if (changed) renderOrders();
}

function appendOrdersToList(nextOrders = []) {
    updateStats();
    renderStatusTabs();
    removeCrmPagination(ordersList);

    const selectedStatus = statusFilter.value;
    const visibleOrders = selectedStatus && selectedStatus !== deletedStatusFilter
        ? nextOrders.filter(order => order.status === selectedStatus)
        : nextOrders;
    const rowsHtml = visibleOrders
        .map(order => order.deletedAt ? renderDeletedOrder(order) : renderActiveOrder(order))
        .join("");

    appendCrmHtml(ordersList, rowsHtml);
    appendCrmHtml(ordersList, renderPaginationControls(ordersPagination, {
        id: "orders",
        loadedCount: orders.length
    }));
}

async function loadOrders(options = {}) {
    const { preserveMessage = false, append = false } = options;
    const requestId = ++ordersRequestId;
    if (!preserveMessage) {
        const loadingMessage = activeSection === "myOrders" ? CRM_MESSAGES.LOADING_MY_ORDERS : CRM_MESSAGES.LOADING_ORDERS;
        setMessage(loadingMessage);
        ordersList.innerHTML = renderCrmLoader(loadingMessage);
    }

    try {
        const isMyOrders = activeSection === "myOrders";
        const isDeletedFilter = !isMyOrders && statusFilter.value === deletedStatusFilter;
        const params = new URLSearchParams();
        params.set("page", ordersPagination.page || 1);
        params.set("limit", CRM_LIST_LIMIT);
        if (isMyOrders) params.set("mine", "true");
        if (isDeletedFilter) params.set("deleted", "true");
        if (statusFilter.value && statusFilter.value !== deletedStatusFilter) params.set("status", statusFilter.value);
        const url = `/api/orders?${params.toString()}`;
        const result = await CrmApi.get(url);

        if (requestId !== ordersRequestId) return;
        const nextOrders = result.orders || [];
        const uniqueNextOrders = nextOrders.filter(order => !orders.some(existing => Number(existing.id) === Number(order.id)));
        orders = append
            ? [...orders, ...uniqueNextOrders].slice(-CRM_DOM_ACCUMULATION_LIMIT)
            : nextOrders;
        ordersPagination = normalizePaginationMeta(result.pagination);
        if (!isDeletedFilter) {
            regularOrderStats = {
                total: orders.length,
                new: orders.filter(order => order.status === "Новая").length,
                work: orders.filter(order => order.status === "В работе").length
            };
        }
        if (!isDeletedFilter && result.stats) {
            regularOrderStats = {
                total: Number(result.stats.total) || ordersPagination.total || orders.length,
                new: Number(result.stats.new) || 0,
                work: Number(result.stats.work) || 0
            };
        }
        if (!preserveMessage) {
            setMessage("");
        }
        if (append) {
            appendOrdersToList(uniqueNextOrders);
        } else {
            renderOrders();
        }
    } catch (error) {
        if (requestId !== ordersRequestId) return;
        const message = notifyError(error, "Сервер недоступен. Попробуйте обновить список.");
        ordersList.innerHTML = `
            <section class="empty-state error-state">
                <h2>Не удалось загрузить заявки</h2>
                <p>${escapeHtml(message)}</p>
                <button class="retry-load" type="button">Повторить</button>
            </section>
        `;
    }
}

ordersList.addEventListener("click", event => {
    const orderHeader = event.target.closest(".order-card-header[data-order-toggle]");
    if (orderHeader) {
        const orderId = String(orderHeader.dataset.orderToggle);
        const isExpanded = toggleOrderExpanded(orderId);
        if (isExpanded) {
            window.CrmOrderNotifications?.onOrderOpened(orderId);
        } else {
            window.CrmOrderNotifications?.onOrderClosed(orderId);
        }
        renderOrders();
        window.requestAnimationFrame(() => {
            ordersList.querySelector(`.order-card-header[data-order-toggle="${CSS.escape(orderId)}"]`)?.focus();
        });
        return;
    }

    const documentsTab = event.target.closest('.order-tabs button[data-tab="documents"]');
    if (documentsTab) {
        const orderId = String(documentsTab.dataset.orderId);
        if (!orderAttachments.has(orderId) && !orderAttachmentsLoading.has(orderId)) {
            loadOrderAttachments(orderId);
        }
        return;
    }

    const retryButton = event.target.closest(".retry-order-attachments");
    if (retryButton) {
        loadOrderAttachments(retryButton.dataset.orderId);
        return;
    }

    const downloadButton = event.target.closest(".download-order-attachment");
    if (downloadButton) {
        event.preventDefault();
        event.stopPropagation();
        downloadOrderAttachment(
            downloadButton.dataset.orderId,
            downloadButton.dataset.attachmentId,
            downloadButton
        );
    }
});

ordersList.addEventListener("keydown", event => {
    const orderHeader = event.target.closest(".order-card-header[data-order-toggle]");
    if (!orderHeader || !["Enter", " "].includes(event.key)) return;

    event.preventDefault();
    orderHeader.click();
});

window.CrmOrders = {
    setNotificationRead: setOrderNotificationRead,
    setAllNotificationsRead: setAllOrderNotificationsRead
};
