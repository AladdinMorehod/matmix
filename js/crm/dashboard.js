// Dashboard data loading, metrics, and actions.
function isToday(value) {
    if (!value) return false;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
}

function getDashboardStats(activeOrders, loadedClients) {
    return {
        newOrders: activeOrders.filter(order => order.status === "Новая").length,
        workOrders: activeOrders.filter(order => order.status === "В работе").length,
        waitingOrders: activeOrders.filter(order => order.status === "Ожидает клиента").length,
        doneToday: activeOrders.filter(order => order.status === "Завершена" && isToday(order.updatedAt || order.createdAt)).length,
        clientsTotal: loadedClients.length
    };
}

function getRecentDashboardOrders(activeOrders) {
    return [...activeOrders]
        .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
        .slice(0, 5);
}

function renderDashboardRecentOrders(activeOrders) {
    const recentOrders = getRecentDashboardOrders(activeOrders);

    if (!recentOrders.length) {
        dashboardRecentOrders.innerHTML = `<p class="dashboard-muted">Активных заявок пока нет.</p>`;
        return;
    }

    dashboardRecentOrders.innerHTML = recentOrders.map(order => `
        <article class="dashboard-recent-order">
            <div>
                <strong>${escapeHtml(getOrderNumber(order))}</strong>
                <span>${escapeHtml(order.customerName || "Клиент не указан")}</span>
            </div>
            <span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>
            <span>${formatMoney(order.totalPrice)}</span>
            <time>${escapeHtml(formatDate(order.createdAt))}</time>
        </article>
    `).join("");
}

function renderDashboard() {
    if (!dashboardView) return;

    const activeOrders = orders.filter(order => !order.deletedAt);
    const stats = getDashboardStats(activeOrders, clients);

    if (dashboardUserName) dashboardUserName.textContent = currentUser?.name || "пользователь";
    if (dashboardNewOrders) dashboardNewOrders.textContent = regularOrderStats.new || stats.newOrders;
    if (dashboardWorkOrders) dashboardWorkOrders.textContent = regularOrderStats.work || stats.workOrders;
    if (dashboardWaitingOrders) dashboardWaitingOrders.textContent = stats.waitingOrders;
    if (dashboardDoneToday) dashboardDoneToday.textContent = stats.doneToday;
    if (dashboardClientsTotal) dashboardClientsTotal.textContent = clientsStats.total || stats.clientsTotal;

    renderDashboardRecentOrders(activeOrders);
}

async function loadDashboard(options = {}) {
    const { preserveMessage = false } = options;

    if (!preserveMessage) {
        setMessage(CRM_MESSAGES.LOADING_DASHBOARD);
        if (dashboardRecentOrders) {
            dashboardRecentOrders.innerHTML = renderCrmLoader(CRM_MESSAGES.LOADING_DASHBOARD);
        }
    }

    try {
        const [ordersResult, clientsResult] = await Promise.all([
            CrmApi.get(`/api/orders?page=1&limit=${CRM_LIST_LIMIT}`),
            CrmApi.get(`/api/clients?page=1&limit=${CRM_LIST_LIMIT}`)
        ]);

        orders = ordersResult.orders || [];
        clients = clientsResult.clients || [];
        regularOrderStats = {
            total: orders.length,
            new: orders.filter(order => order.status === "Новая").length,
            work: orders.filter(order => order.status === "В работе").length
        };

        if (ordersResult.stats) {
            regularOrderStats = {
                total: Number(ordersResult.stats.total) || orders.length,
                new: Number(ordersResult.stats.new) || 0,
                work: Number(ordersResult.stats.work) || 0
            };
        }
        if (clientsResult.stats) {
            clientsStats = {
                total: Number(clientsResult.stats.total) || clients.length,
                repeat: Number(clientsResult.stats.repeat) || 0,
                totalSpent: Number(clientsResult.stats.totalSpent) || 0
            };
        }
        renderDashboard();
        if (!preserveMessage) setMessage("");
    } catch (error) {
        const message = notifyError(error, "Сервер недоступен. Попробуйте обновить страницу.");
        if (dashboardRecentOrders) {
            dashboardRecentOrders.innerHTML = `
                <section class="empty-state error-state">
                    <h2>Не удалось загрузить главную</h2>
                    <p>${escapeHtml(message)}</p>
                    <button class="dashboard-retry" type="button">Повторить</button>
                </section>
            `;
        }
    }
}

function openDashboardSection(section) {
    setActiveSection(section);

    if (section === "orders" || section === "myOrders") {
        statusFilter.value = "";
        loadOrders({ preserveMessage: true });
        return;
    }

    if (section === "clients") {
        loadClients({ preserveMessage: true });
    }
}
