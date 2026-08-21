// CRM entry point and event wiring.
const crmMenuToggle = document.getElementById("crmMenuToggle");

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch(() => {}));
}
const crmMenuClose = document.getElementById("crmMenuClose");
const crmSidebar = document.getElementById("crmSidebar");
const crmSidebarOverlay = document.getElementById("crmSidebarOverlay");
const crmMobileSection = document.getElementById("crmMobileSection");

function setMobileMenuOpen(isOpen) {
    document.body.classList.toggle("crm-nav-open", isOpen);
    crmMenuToggle?.setAttribute("aria-expanded", String(isOpen));
    if (crmSidebarOverlay) {
        crmSidebarOverlay.hidden = !isOpen;
    }
}

function closeMobileMenu() {
    setMobileMenuOpen(false);
}

function renderCrmNavigation() {
    if (!crmNav) return;

    crmNav.innerHTML = crmNavigation.filter(item => !item.adminOnly || currentUser?.role === "admin").map(item => item.enabled
        ? `<button class="${item.id === activeSection ? "active" : ""}" data-section="${escapeHtml(item.id)}" type="button">
            ${escapeHtml(item.label)}
            ${item.id === "orders"
                ? '<output class="order-notification-badge" data-order-notification-badge aria-hidden="true" hidden>0</output>'
                : ""}
        </button>`
        : `<span>${escapeHtml(item.label)} <small>скоро</small></span>`
    ).join("");

    crmNavButtons = document.querySelectorAll(".crm-nav button[data-section]");
    window.CrmOrderNotifications?.render();
}

function loadCrmSectionContent(section, options = {}) {
    const preserveMessage = Boolean(options.preserveMessage);

    if (section === "dashboard") {
        loadDashboard({ preserveMessage });
        return;
    }

    if (section === "orders" || section === "myOrders") {
        statusFilter.value = "";
        ordersPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
        loadOrders({ preserveMessage });
        return;
    }

    if (section === "clients") {
        if (currentUser?.role !== "admin") return;
        if (!clients.length) {
            clientsPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
            loadClients({ preserveMessage });
        }
        return;
    }

    if (section === "catalog") {
        productFilters.page = 1;
        loadProducts();
        return;
    }

    if (section === "catalogImport") {
        renderImportView();
        return;
    }

    if (section === "settings") {
        loadSettings();
    }
}

function getCrmSectionFromUrl() {
    return new URL(window.location.href).searchParams.get("section") || "dashboard";
}

function getOrderDeepLinkId() {
    const match = /^#order-([1-9]\d*)$/.exec(window.location.hash);
    if (!match) return null;
    const id = Number(match[1]);
    return Number.isSafeInteger(id) ? String(id) : null;
}

async function openOrderDeepLink() {
    const orderId = getOrderDeepLinkId();
    if (!orderId || !window.CrmOrders?.openOrderById) return;
    try {
        await window.CrmOrders.openOrderById(orderId);
    } catch (error) {
        setMessage(window.CrmErrorHandler?.getMessage(error, "Не удалось открыть заявку."));
    }
}

function syncCrmSectionUrl(section, historyMode = "push") {
    if (historyMode === "none") return;

    const url = new URL(window.location.href);
    const currentSection = url.searchParams.get("section");
    url.searchParams.set("section", section);
    const method = historyMode === "replace" || currentSection === section ? "replaceState" : "pushState";
    window.history[method]({ section }, "", `${url.pathname}${url.search}${url.hash}`);
}

function navigateToCrmSection(section, options = {}) {
    setActiveSection(section);
    syncCrmSectionUrl(activeSection, options.historyMode);
    const activeButton = Array.from(crmNavButtons).find(button => button.dataset.section === activeSection);
    const activeNavigationItem = crmNavigation.find(item => item.id === activeSection);
    if (crmMobileSection && activeButton && activeNavigationItem) {
        crmMobileSection.textContent = activeNavigationItem.label;
    }
    if (options.load !== false) {
        loadCrmSectionContent(activeSection, options);
    }
    return activeSection;
}

renderCrmNavigation();

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

statusFilter.addEventListener("change", () => {
    ordersPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
    loadOrders();
});
statusTabs?.addEventListener("click", event => {
    const button = event.target.closest("button[data-status]");
    if (!button) return;

    statusFilter.value = button.dataset.status;
    ordersPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
    loadOrders();
});
crmNav?.addEventListener("click", event => {
    const button = event.target.closest("button[data-section]");
    if (!button) return;

    navigateToCrmSection(button.dataset.section);
    closeMobileMenu();
});
refreshOrdersBtn.addEventListener("click", () => {
    ordersPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
    loadOrders();
});
refreshClientsBtn?.addEventListener("click", () => {
    clientsPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
    loadClients();
});
clientSearchInput?.addEventListener("input", () => {
    clientsPagination = normalizePaginationMeta({ page: 1, limit: CRM_LIST_LIMIT });
    window.clearTimeout(clientsSearchTimer);
    clientsSearchTimer = window.setTimeout(() => loadClients({ preserveMessage: true }), 250);
});

clientsList?.addEventListener("click", event => {
    const paginationButton = event.target.closest(".crm-pagination [data-page]");
    if (paginationButton) {
        clientsPagination = normalizePaginationMeta({ ...clientsPagination, page: Number(paginationButton.dataset.page) || 1 });
        loadClients();
        return;
    }

    const loadMoreButton = event.target.closest(".crm-pagination [data-load-more]");
    if (loadMoreButton) {
        event.preventDefault();
        if (clientsAppendLoading) return;
        clientsAppendLoading = true;
        loadMoreButton.disabled = true;
        const previousScrollY = window.scrollY;
        clientsPagination = normalizePaginationMeta({ ...clientsPagination, page: (Number(clientsPagination.page) || 1) + 1 });
        loadClients({ preserveMessage: true, append: true }).finally(() => {
            clientsAppendLoading = false;
            if (loadMoreButton.isConnected) loadMoreButton.disabled = false;
            restoreScrollIfApplicationMoved(previousScrollY);
        });
    }
});

logoutBtn.addEventListener("click", async () => {
    window.CrmOrderNotifications?.stop({ broadcastLogout: true });
    try {
        await CrmApi.post("/api/auth/logout");
    } finally {
        window.location.href = "/login.html";
    }
});
ordersList.addEventListener("change", event => {
    const select = event.target.closest(".status-select");
    if (!select) return;

    updateOrderStatus(select.dataset.id, select.value);
});

ordersList.addEventListener("input", event => {
    const noteInput = event.target.closest(".note-input");
    if (!noteInput) return;

    window.CrmDrafts?.setValue(`note:${noteInput.dataset.id}`, noteInput.value);
});

ordersList.addEventListener("click", event => {
    const paginationButton = event.target.closest(".crm-pagination [data-page]");
    if (paginationButton) {
        ordersPagination = normalizePaginationMeta({ ...ordersPagination, page: Number(paginationButton.dataset.page) || 1 });
        loadOrders();
        return;
    }

    const loadMoreButton = event.target.closest(".crm-pagination [data-load-more]");
    if (loadMoreButton) {
        event.preventDefault();
        if (ordersAppendLoading) return;
        ordersAppendLoading = true;
        loadMoreButton.disabled = true;
        const previousScrollY = window.scrollY;
        ordersPagination = normalizePaginationMeta({ ...ordersPagination, page: (Number(ordersPagination.page) || 1) + 1 });
        loadOrders({ preserveMessage: true, append: true }).finally(() => {
            ordersAppendLoading = false;
            if (loadMoreButton.isConnected) loadMoreButton.disabled = false;
            restoreScrollIfApplicationMoved(previousScrollY);
        });
        return;
    }

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
        if (currentUser?.role !== "admin") return;
        const clientId = String(openClientButton.dataset.clientId);
        navigateToCrmSection("clients", { load: false });
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

    const downloadExcelButton = event.target.closest(".download-order-excel");
    if (downloadExcelButton) {
        downloadOrderExcel(downloadExcelButton.dataset.id);
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

dashboardView?.addEventListener("click", event => {
    const retryButton = event.target.closest(".dashboard-retry");
    if (retryButton) {
        loadDashboard();
        return;
    }

    const sectionButton = event.target.closest(".dashboard-open-section");
    if (!sectionButton) return;

    navigateToCrmSection(sectionButton.dataset.sectionTarget, { preserveMessage: true });
});

settingsView?.addEventListener("click", event => {
    const passwordToggle = event.target.closest("[data-password-toggle]");
    if (passwordToggle) {
        togglePasswordVisibility(passwordToggle);
        return;
    }

    const tabButton = event.target.closest("button[data-settings-tab]");
    if (tabButton) {
        activeSettingsTab = tabButton.dataset.settingsTab;
        loadSettings();
        return;
    }

    const refreshButton = event.target.closest(".settings-refresh-users");
    if (refreshButton) {
        loadUsers();
        return;
    }

    const editButton = event.target.closest(".settings-edit-user");
    if (editButton) {
        editingUserId = Number(editButton.dataset.userId);
        renderSettings();
        return;
    }

    const cancelEditButton = event.target.closest(".settings-cancel-edit");
    if (cancelEditButton) {
        editingUserId = null;
        renderSettings();
        return;
    }

    const deleteButton = event.target.closest(".settings-delete-user");
    if (deleteButton) {
        deleteUser(deleteButton.dataset.userId, deleteButton.dataset.userName || "пользователя");
        return;
    }

    const toggleButton = event.target.closest(".settings-toggle-user");
    if (toggleButton) {
        toggleUserStatus(toggleButton.dataset.userId, toggleButton.dataset.isActive === "1");
    }
});

settingsView?.addEventListener("submit", event => {
    if (event.defaultPrevented) return;

    const profilePasswordForm = event.target.closest("#profilePasswordForm");
    if (profilePasswordForm) {
        event.preventDefault();
        changeOwnPassword(profilePasswordForm);
        return;
    }

    const createUserForm = event.target.closest("#createUserForm");
    if (createUserForm) {
        event.preventDefault();
        createUser(createUserForm);
        return;
    }

    const userEditForm = event.target.closest(".settings-user-edit-form");
    if (userEditForm) {
        event.preventDefault();
        updateUser(userEditForm.dataset.userId, userEditForm);
        return;
    }

    const userPasswordForm = event.target.closest(".settings-user-password-form");
    if (userPasswordForm) {
        event.preventDefault();
        changeUserPassword(userPasswordForm.dataset.userId, userPasswordForm);
    }
});

productsView?.addEventListener("input", event => {
    const searchInput = event.target.closest("#productSearchInput");
    if (!searchInput) return;

    productFilters.search = searchInput.value.trim();
    productFilters.page = 1;
    clearProductSelection();
    window.clearTimeout(productsView.searchTimer);
    productsView.searchTimer = window.setTimeout(() => {
        loadProducts({ preserveControls: true });
    }, 200);
});

productsView?.addEventListener("change", event => {
    const batchImageInput = event.target.closest("#productBatchImageInput");
    if (batchImageInput) {
        const file = batchImageInput.files?.[0] || null;
        const validationMessage = file ? validateProductImageFile(file) : "";
        if (validationMessage) {
            notifyWarning(validationMessage);
            batchImageInput.value = "";
        }
        updateProductSelectionControls();
        return;
    }

    const productSelect = event.target.closest(".product-select");
    if (productSelect) {
        setProductSelected(productSelect.dataset.productId, productSelect.checked);
        return;
    }

    const categoryFilter = event.target.closest("#productCategoryFilter");
    if (categoryFilter) {
        activeProductStructureFilter = null;
        productFilters.category = categoryFilter.value;
        productFilters.page = 1;
        clearProductSelection();
        loadProducts();
        return;
    }

    const statusFilterElement = event.target.closest("#productStatusFilter");
    if (statusFilterElement) {
        productFilters.status = statusFilterElement.value;
        productFilters.page = 1;
        clearProductSelection();
        loadProducts();
    }
});

productsView?.addEventListener("click", event => {
    const structureFilterReset = event.target.closest("[data-product-structure-filter-reset]");
    if (structureFilterReset) {
        resetProductStructureFilter();
        return;
    }

    const catalogModeButton = event.target.closest("[data-catalog-mode]");
    if (catalogModeButton) {
        setCatalogInnerMode(catalogModeButton.dataset.catalogMode);
        return;
    }

    const paginationButton = event.target.closest(".crm-pagination [data-page]");
    if (paginationButton) {
        productFilters.page = Number(paginationButton.dataset.page) || 1;
        clearProductSelection();
        loadProducts();
        return;
    }

    const loadMoreButton = event.target.closest(".crm-pagination [data-load-more]");
    if (loadMoreButton) {
        event.preventDefault();
        if (productsAppendLoading) return;
        productsAppendLoading = true;
        loadMoreButton.disabled = true;
        const previousScrollY = window.scrollY;
        productFilters.page = (Number(productsPagination.page) || 1) + 1;
        loadProducts({ preserveControls: true, append: true }).finally(() => {
            productsAppendLoading = false;
            if (loadMoreButton.isConnected) loadMoreButton.disabled = false;
            restoreScrollIfApplicationMoved(previousScrollY);
        });
        return;
    }

    const exportButton = event.target.closest(".products-export");
    if (exportButton) {
        downloadProductsPrice(exportButton);
        return;
    }

    const addButton = event.target.closest(".products-add");
    if (addButton) {
        openProductForm();
        return;
    }

    const batchImageButton = event.target.closest(".products-batch-image-upload");
    if (batchImageButton) {
        uploadImageForSelectedProducts();
        return;
    }

    const bulkStructureButton = event.target.closest(".products-bulk-structure-edit");
    if (bulkStructureButton) {
        openBulkProductStructureForm();
        return;
    }

    const filterImageButton = event.target.closest(".products-filter-image-upload");
    if (filterImageButton) {
        uploadImageByProductFilter("filtered", filterImageButton);
        return;
    }

    const allImageButton = event.target.closest(".products-all-image-upload");
    if (allImageButton) {
        uploadImageByProductFilter("all", allImageButton);
        return;
    }

    const clearSelectionButton = event.target.closest(".products-selection-clear");
    if (clearSelectionButton) {
        clearProductSelection();
        return;
    }

    const editButton = event.target.closest(".product-edit");
    if (editButton) {
        const product = products.find(item => String(item.id) === String(editButton.dataset.productId));
        if (product) openProductForm(product);
        return;
    }

    const toggleButton = event.target.closest(".product-toggle");
    if (toggleButton) {
        toggleProductStatus(toggleButton.dataset.productId, toggleButton.dataset.isActive === "1");
        return;
    }

    const deleteButton = event.target.closest(".product-delete");
    if (deleteButton) {
        deleteProduct(deleteButton.dataset.productId);
        return;
    }

    const restoreButton = event.target.closest(".product-restore");
    if (restoreButton) {
        restoreProduct(restoreButton.dataset.productId);
    }
});

crmMenuToggle?.addEventListener("click", () => {
    setMobileMenuOpen(true);
});

crmMenuClose?.addEventListener("click", closeMobileMenu);
crmSidebarOverlay?.addEventListener("click", closeMobileMenu);
crmSidebar?.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

window.addEventListener("popstate", () => {
    if (!currentUser) return;
    navigateToCrmSection(getCrmSectionFromUrl(), {
        historyMode: "none",
        preserveMessage: true
    });
    closeMobileMenu();
});

checkAccess().then(isAllowed => {
    if (isAllowed) {
        renderCrmNavigation();
        navigateToCrmSection(getCrmSectionFromUrl(), { historyMode: "replace" });
        void openOrderDeepLink();
        window.CrmOrderNotifications?.start();
    }
});
