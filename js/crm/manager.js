// CRM entry point and event wiring.
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
        const orderId = String(tabButton.dataset.orderId);
        const tab = tabButton.dataset.tab;

        activeOrderTabs.set(orderId, tab);
        renderOrders();

        if (tab === "history" && !orderEvents.has(orderId)) {
            loadOrderEvents(orderId);
        }

        return;
    }

    const deletedHeader = event.target.closest(".deleted-order-header");
    if (deletedHeader && !event.target.closest(".restore-order")) {
        const orderId = String(deletedHeader.dataset.id);
        expandedDeletedOrderId = expandedDeletedOrderId === orderId ? null : orderId;
        renderOrders();
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
