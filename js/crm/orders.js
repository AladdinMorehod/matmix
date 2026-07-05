// Order rendering, filters, and list loading.
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
    const events = orderEvents.get(orderId);

    return `
        <section class="order-history">
            <div class="history-panel">
                ${canAddNote(order) ? `
                    <div class="note-form">
                        <textarea class="note-input" data-id="${order.id}" maxlength="1000" rows="3" placeholder="Внутренняя заметка"></textarea>
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
        return `<section class="order-section order-section-wide"><h2>История заявки</h2>${renderHistory(order)}</section>`;
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
