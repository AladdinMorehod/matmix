// Shared CRM constants, DOM references, state, and small utilities.
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
const crmNav = document.getElementById("crmNav");
const dashboardView = document.getElementById("dashboardView");
const dashboardUserName = document.getElementById("dashboardUserName");
const dashboardNewOrders = document.getElementById("dashboardNewOrders");
const dashboardWorkOrders = document.getElementById("dashboardWorkOrders");
const dashboardWaitingOrders = document.getElementById("dashboardWaitingOrders");
const dashboardDoneToday = document.getElementById("dashboardDoneToday");
const dashboardClientsTotal = document.getElementById("dashboardClientsTotal");
const dashboardRecentOrders = document.getElementById("dashboardRecentOrders");
const settingsView = document.getElementById("settingsView");
const productsView = document.getElementById("productsView");
const importView = document.getElementById("importView");
const ordersTotalCount = document.getElementById("ordersTotalCount");
const ordersNewCount = document.getElementById("ordersNewCount");
const ordersWorkCount = document.getElementById("ordersWorkCount");
let crmNavButtons = document.querySelectorAll(".crm-nav button[data-section]");
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
let ordersPagination = normalizePaginationMeta();
let clientsPagination = normalizePaginationMeta();
let clientsStats = {
    total: 0,
    repeat: 0,
    totalSpent: 0
};
let ordersRequestId = 0;
let clientsRequestId = 0;
let ordersAppendLoading = false;
let clientsAppendLoading = false;
let productsAppendLoading = false;
let clientsSearchTimer = null;
let currentUser = null;
let activeSection = "dashboard";
let regularOrderStats = {
    total: 0,
    new: 0,
    work: 0
};
const orderEvents = new Map();
const expandedClientOrderIds = new Set();
const clientOrders = new Map();
const activeOrderTabs = new Map();
let expandedDeletedOrderId = null;
let settingsUsers = [];
let settingsUsersLoading = false;
let settingsUsersLoaded = false;
let settingsUsersError = "";
let activeSettingsTab = "profile";
let editingUserId = null;
let products = [];
let productCategories = [];
let productsPagination = normalizePaginationMeta();
let productsTotalCount = 0;
let productsRequestId = 0;
let productFilters = {
    search: "",
    category: "",
    status: "",
    page: 1
};
let productsLoading = false;
let productsLoaded = false;
let selectedProductIds = new Set();

const crmNavigation = [
    { id: "dashboard", label: "Главная", enabled: true },
    { id: "orders", label: "Заказы", enabled: true },
    { id: "myOrders", label: "Мои заказы", enabled: true },
    { id: "clients", label: "Клиенты", enabled: true },
    { id: "catalog", label: "Каталог", enabled: true },
    { id: "catalogImport", label: "Импорт каталога", enabled: true, adminOnly: true },
    { id: "statistics", label: "Статистика", enabled: false },
    { id: "settings", label: "Настройки", enabled: true }
];

const eventTypeLabels = {
    created: "Создание",
    taken: "Взята",
    released: "Освобождена",
    status_changed: "Статус",
    deleted: "Удаление",
    restored: "Восстановлена",
    note: "Заметка"
};

function escapeHtml(value) {
    return window.MatMixSafe.escapeHtml(value);
}

function formatMoney(value) {
    return `${new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0)} ₽`;
}

function formatWeight(value) {
    return `${new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(Number(value) || 0)} кг`;
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

function normalizeContactMethod(value) {
    const method = String(value || "").trim().toLowerCase();
    const aliases = {
        phone: "Телефон",
        telephone: "Телефон",
        "телефон": "Телефон",
        whatsapp: "WhatsApp",
        telegram: "Telegram",
        email: "E-mail",
        "e-mail": "E-mail",
        "почта": "E-mail",
        max: "MAX",
        maxcontact: "MAX"
    };

    return aliases[method] || "";
}

function buildContactAction(method, value, source) {
    if (method === "Телефон") {
        const phoneDigits = cleanPhoneForLink(value);
        if (phoneDigits) return { method, value, source, label: "Позвонить", href: `tel:+${phoneDigits}` };
    }

    if (method === "WhatsApp") {
        const phoneDigits = cleanPhoneForLink(value);
        if (phoneDigits) return { method, value, source, label: "WhatsApp", href: `https://wa.me/${phoneDigits}`, external: true };
    }

    if (method === "Telegram") {
        const username = getTelegramUsername(value);
        if (username && !/\s/.test(username)) {
            return { method, value, source, label: "Telegram", href: `https://t.me/${encodeURIComponent(username)}`, external: true };
        }
    }

    if (method === "E-mail" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { method, value, source, label: "E-mail", href: `mailto:${value}` };
    }

    if (method === "MAX" && value) {
        return {
            method,
            value,
            source,
            label: "Связь через MAX: контакт указан",
            disabled: true
        };
    }

    return null;
}

function resolveOrderContact(order = {}) {
    const preferredMethod = normalizeContactMethod(order.preferredContactMethod || order.preferred_contact_method);
    const preferredValue = String(order.preferredContactValue || order.preferred_contact_value || "").trim();
    const preferredContact = buildContactAction(preferredMethod, preferredValue, "preferred");
    if (preferredContact) return preferredContact;

    const orderPhone = buildContactAction("Телефон", String(order.phone || "").trim(), "order_phone");
    if (orderPhone) return orderPhone;

    const legacyContacts = [
        ["Telegram", String(order.telegram || "").trim()],
        ["E-mail", String(order.email || "").trim()],
        ["MAX", String(order.maxContact || order.max_contact || "").trim()]
    ];
    for (const [method, value] of legacyContacts) {
        const legacyContact = buildContactAction(method, value, "legacy");
        if (legacyContact) return legacyContact;
    }

    return {
        method: "",
        value: "",
        source: "none",
        label: "Контакт не указан",
        disabled: true
    };
}

function getPreferredContact(order) {
    const contact = resolveOrderContact(order);
    return {
        method: contact.method,
        value: contact.value,
        source: contact.source
    };
}

function getPreferredContactText(order) {
    return resolveOrderContact(order).method || "Не выбран";
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

function getContactAction(order = {}) {
    const contact = resolveOrderContact(order);
    return contact.source === "none" ? null : contact;
}

function setMessage(message = "", options = {}) {
    managerMessage.textContent = message;

    if (message && options.toast) {
        const type = options.type || "info";
        window.CrmToast?.[type]?.(message);
    }
}

function getSafeErrorMessage(error, fallback = "Произошла непредвиденная ошибка.") {
    return window.CrmErrorHandler?.getMessage(error, fallback)
        || window.MatMixErrors?.getMessage(error, {
            fallback,
            networkFallback: "Не удалось соединиться с сервером."
        })
        || fallback;
}

function renderCrmLoader(message) {
    return window.CrmLoader?.render(message) || `<p>${escapeHtml(message || "Загрузка...")}</p>`;
}

function notifySuccess(message) {
    setMessage(message);
    window.CrmToast?.success(message);
}

function notifyWarning(message) {
    setMessage(message);
    window.CrmToast?.warning(message);
}

function notifyError(error, fallback) {
    const message = getSafeErrorMessage(error, fallback);
    setMessage(message);
    window.CrmToast?.error(message);
    return message;
}

function getRoleLabel(role) {
    const labels = {
        admin: "Админ",
        manager: "Менеджер"
    };

    return labels[role] || role || "";
}

async function checkAccess() {
    setMessage(CRM_MESSAGES.LOADING_ACCESS);
    ordersList.innerHTML = "";

    try {
        const result = await CrmApi.get("/api/auth/me");

        currentUser = result.user;
        managerUserName.textContent = currentUser.name;
        managerUserRole.textContent = getRoleLabel(currentUser.role);
        return true;
    } catch (error) {
        if (error?.status === 401) {
            window.location.href = "/login.html";
            return false;
        }

        notifyError(error, "Не удалось проверить доступ. Сервер недоступен.");
        return false;
    }
}
