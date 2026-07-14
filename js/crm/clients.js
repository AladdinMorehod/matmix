// CRM section switching and client list/history rendering.
function setActiveSection(section) {
    if (section === "catalogImport" && currentUser?.role !== "admin") {
        section = "dashboard";
    }

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
    const isCatalogStructure = section === "catalogStructure";
    const isImport = section === "catalogImport";
    const orderModeTitle = isMyOrders ? "Мои заказы" : "Заказы";
    const orderModeSubtitle = isMyOrders ? "Заявки, закрепленные за вами" : "Заявки с сайта MatMix";

    dashboardView?.classList.toggle("hidden", !isDashboard);
    ordersTopbar?.classList.toggle("hidden", !(isOrders || isMyOrders));
    statusFilter?.closest(".manager-toolbar")?.classList.toggle("hidden", !(isOrders || isMyOrders));
    ordersList?.classList.toggle("hidden", !(isOrders || isMyOrders));
    clientsView?.classList.toggle("hidden", !isClients);
    productsView?.classList.toggle("hidden", !isCatalog);
    catalogStructureView?.classList.toggle("hidden", !isCatalogStructure);
    importView?.classList.toggle("hidden", !isImport);
    settingsView?.classList.toggle("hidden", !isSettings);
    const ordersTitle = ordersTopbar?.querySelector("h1");
    const ordersSubtitle = ordersTopbar?.querySelector("p");
    if (ordersTitle) ordersTitle.textContent = orderModeTitle;
    if (ordersSubtitle) ordersSubtitle.textContent = orderModeSubtitle;
    setMessage("");

}

function updateClientStats() {
    if (clientsTotalCount) clientsTotalCount.textContent = clientsStats.total || clientsPagination.total || clients.length;
    if (repeatClientsCount) repeatClientsCount.textContent = clientsStats.repeat || clients.filter(client => Number(client.ordersCount) > 1).length;
    if (clientsTotalSpent) clientsTotalSpent.textContent = formatMoney(clientsStats.totalSpent || clients.reduce((sum, client) => sum + (Number(client.totalSpent) || 0), 0));
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
        return renderCrmLoader("Загружаем историю заказов...");
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
        if (append) return;
        clientsList.innerHTML = `
            <section class="empty-state">
                <h2>Клиенты не найдены</h2>
                <p>Измените поиск или дождитесь новых заявок с сайта.</p>
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
    }).join("") + renderPaginationControls(clientsPagination, {
        id: "clients",
        loadedCount: clients.length
    });
}

function appendClientsToList(nextClients = []) {
    updateClientStats();
    removeCrmPagination(clientsList);

    const query = String(clientSearchInput?.value || "").trim().toLowerCase();
    const visibleClients = query
        ? nextClients.filter(client => {
            const digits = cleanPhoneForLink(query);
            const nameMatch = String(client.name || "").toLowerCase().includes(query);
            const phoneMatch = digits && cleanPhoneForLink(client.phone).includes(digits);
            return nameMatch || phoneMatch;
        })
        : nextClients;
    const rowsHtml = visibleClients.map(client => {
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
                        ${isExpanded ? "РЎРєСЂС‹С‚СЊ РёСЃС‚РѕСЂРёСЋ" : "РСЃС‚РѕСЂРёСЏ Р·Р°РєР°Р·РѕРІ"}
                    </button>
                </header>

                <div class="client-card-grid">
                    ${renderInfoRow("РџСЂРµРґРїРѕС‡С‚РёС‚РµР»СЊРЅС‹Р№ РєР°РЅР°Р»", getClientPreferredContactText(client) || "РќРµ СѓРєР°Р·Р°РЅ")}
                    ${renderInfoRow("Р—Р°РєР°Р·РѕРІ", String(client.ordersCount || 0))}
                    ${renderInfoRow("РћР±С‰Р°СЏ СЃСѓРјРјР°", formatMoney(client.totalSpent))}
                    ${client.lastOrderAt ? renderInfoRow("РџРѕСЃР»РµРґРЅРёР№ Р·Р°РєР°Р·", formatDate(client.lastOrderAt)) : ""}
                </div>

                ${isExpanded ? `<section class="client-orders-panel">${renderClientOrders(client.id)}</section>` : ""}
            </article>
        `;
    }).join("");

    appendCrmHtml(clientsList, rowsHtml);
    appendCrmHtml(clientsList, renderPaginationControls(clientsPagination, {
        id: "clients",
        loadedCount: clients.length
    }));
}

async function loadClients(options = {}) {
    const { preserveMessage = false, append = false } = options;
    const requestId = ++clientsRequestId;
    if (!preserveMessage) {
        setMessage(CRM_MESSAGES.LOADING_CLIENTS);
        clientsList.innerHTML = renderCrmLoader(CRM_MESSAGES.LOADING_CLIENTS);
    }

    try {
        const params = new URLSearchParams();
        params.set("page", clientsPagination.page || 1);
        params.set("limit", CRM_LIST_LIMIT);
        if (clientSearchInput?.value?.trim()) params.set("search", clientSearchInput.value.trim());
        const result = await CrmApi.get(`/api/clients?${params.toString()}`);

        if (requestId !== clientsRequestId) return;
        const nextClients = result.clients || [];
        const uniqueNextClients = nextClients.filter(client => !clients.some(existing => Number(existing.id) === Number(client.id)));
        clients = append
            ? [...clients, ...uniqueNextClients].slice(-CRM_DOM_ACCUMULATION_LIMIT)
            : nextClients;
        clientsPagination = normalizePaginationMeta(result.pagination);
        if (result.stats) {
            clientsStats = {
                total: Number(result.stats.total) || 0,
                repeat: Number(result.stats.repeat) || 0,
                totalSpent: Number(result.stats.totalSpent) || 0
            };
            if (clientsTotalCount) clientsTotalCount.textContent = Number(result.stats.total) || 0;
            if (repeatClientsCount) repeatClientsCount.textContent = Number(result.stats.repeat) || 0;
            if (clientsTotalSpent) clientsTotalSpent.textContent = formatMoney(result.stats.totalSpent);
        }
        if (!preserveMessage) setMessage("");
        if (append) {
            appendClientsToList(uniqueNextClients);
        } else {
            renderClients();
        }
    } catch (error) {
        if (requestId !== clientsRequestId) return;
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
