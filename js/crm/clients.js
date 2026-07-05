// CRM section switching and client list/history rendering.
function setActiveSection(section) {
    activeSection = section;

    crmNavButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });

    const isDashboard = section === "dashboard";
    const isOrders = section === "orders";
    const isClients = section === "clients";

    dashboardView?.classList.toggle("hidden", !isDashboard);
    ordersTopbar?.classList.toggle("hidden", !isOrders);
    statusFilter?.closest(".manager-toolbar")?.classList.toggle("hidden", !isOrders);
    ordersList?.classList.toggle("hidden", !isOrders);
    clientsView?.classList.toggle("hidden", !isClients);
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
