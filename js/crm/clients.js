// CRM section switching and client list/history rendering.
function setActiveSection(section) {
    activeSection = section;

    crmNavButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.section === section);
    });

    const isDashboard = section === "dashboard";
    const isOrders = section === "orders";
    const isMyOrders = section === "myOrders";
    const isClients = section === "clients";
    const isSettings = section === "settings";
    const isCatalog = section === "catalog";
    const orderModeTitle = isMyOrders ? "Мои заказы" : "Заказы";
    const orderModeSubtitle = isMyOrders ? "Заявки, закрепленные за вами" : "Заявки с сайта MatMix";

    dashboardView?.classList.toggle("hidden", !isDashboard);
    ordersTopbar?.classList.toggle("hidden", !(isOrders || isMyOrders));
    statusFilter?.closest(".manager-toolbar")?.classList.toggle("hidden", !(isOrders || isMyOrders));
    ordersList?.classList.toggle("hidden", !(isOrders || isMyOrders));
    clientsView?.classList.toggle("hidden", !isClients);
    productsView?.classList.toggle("hidden", !isCatalog);
    settingsView?.classList.toggle("hidden", !isSettings);
    const ordersTitle = ordersTopbar?.querySelector("h1");
    const ordersSubtitle = ordersTopbar?.querySelector("p");
    if (ordersTitle) ordersTitle.textContent = orderModeTitle;
    if (ordersSubtitle) ordersSubtitle.textContent = orderModeSubtitle;
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
        return renderCrmLoader("История заказов загружается...");
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
        const phoneDigits = cleanPhoneForLink(client.phone);
        const phoneHtml = phoneDigits
            ? `<a class="client-phone-link" href="tel:+${phoneDigits}">${escapeHtml(client.phone)}</a>`
            : `<span>${escapeHtml(client.phone)}</span>`;

        return `
            <article class="client-card" data-client-id="${client.id}">
                <header class="client-card-header">
                    <div>
                        <strong>${escapeHtml(client.name)}</strong>
                        ${phoneHtml}
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
        setMessage(CRM_MESSAGES.LOADING_CLIENTS);
        clientsList.innerHTML = renderCrmLoader(CRM_MESSAGES.LOADING_CLIENTS);
    }

    try {
        const result = await CrmApi.get("/api/clients");

        clients = result.clients || [];
        if (!preserveMessage) setMessage("");
        renderClients();
    } catch (error) {
        const message = notifyError(error, "Сервер недоступен. Попробуйте обновить список.");
        clientsList.innerHTML = `
            <section class="empty-state error-state">
                <h2>Не удалось загрузить клиентов</h2>
                <p>${escapeHtml(message)}</p>
                <button class="retry-clients-load" type="button">Повторить</button>
            </section>
        `;
    }
}

async function loadClientOrders(clientId) {
    const key = String(clientId);

    try {
        const result = await CrmApi.get(`/api/clients/${clientId}/orders`);

        clientOrders.set(key, result.orders || []);
        renderClients();
    } catch (error) {
        clientOrders.set(key, []);
        notifyError(error, "Не удалось загрузить историю заказов клиента.");
        renderClients();
    }
}
