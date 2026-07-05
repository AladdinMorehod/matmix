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
    if (dashboardNewOrders) dashboardNewOrders.textContent = stats.newOrders;
    if (dashboardWorkOrders) dashboardWorkOrders.textContent = stats.workOrders;
    if (dashboardWaitingOrders) dashboardWaitingOrders.textContent = stats.waitingOrders;
    if (dashboardDoneToday) dashboardDoneToday.textContent = stats.doneToday;
    if (dashboardClientsTotal) dashboardClientsTotal.textContent = stats.clientsTotal;

    renderDashboardRecentOrders(activeOrders);
}

async function loadDashboard(options = {}) {
    const { preserveMessage = false } = options;

    if (!preserveMessage) {
        setMessage("Загружаем главную...");
    }

    try {
        const [ordersResponse, clientsResponse] = await Promise.all([
            fetch("/api/orders", { credentials: "include" }),
            fetch("/api/clients", { credentials: "include" })
        ]);
        const ordersResult = await ordersResponse.json().catch(() => ({}));
        const clientsResult = await clientsResponse.json().catch(() => ({}));

        if (!ordersResponse.ok || !ordersResult.success) {
            throw new Error(ordersResult.message || "Показатели заявок не загрузились.");
        }

        if (!clientsResponse.ok || !clientsResult.success) {
            throw new Error(clientsResult.message || "Показатели клиентов не загрузились.");
        }

        orders = ordersResult.orders || [];
        clients = clientsResult.clients || [];
        regularOrderStats = {
            total: orders.length,
            new: orders.filter(order => order.status === "Новая").length,
            work: orders.filter(order => order.status === "В работе").length
        };

        renderDashboard();
        if (!preserveMessage) setMessage("");
    } catch (error) {
        if (dashboardRecentOrders) {
            dashboardRecentOrders.innerHTML = `
                <section class="empty-state error-state">
                    <h2>Не удалось загрузить главную</h2>
                    <p>${escapeHtml(error.message || "Сервер недоступен. Попробуйте обновить страницу.")}</p>
                    <button class="dashboard-retry" type="button">Повторить</button>
                </section>
            `;
        }
        setMessage(error.message || "Не удалось загрузить главную.");
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
