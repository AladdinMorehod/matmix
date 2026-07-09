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
let productFilters = {
    search: "",
    category: "",
    status: ""
};
let productsLoading = false;
let productsLoaded = false;

const crmNavigation = [
    { id: "dashboard", label: "Главная", enabled: true },
    { id: "orders", label: "Заказы", enabled: true },
    { id: "myOrders", label: "Мои заказы", enabled: true },
    { id: "clients", label: "Клиенты", enabled: true },
    { id: "catalog", label: "Каталог", enabled: true },
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
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMoney(value) {
    return `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} ₽`;
}

function formatWeight(value) {
    return `${new Intl.NumberFormat("ru-RU").format(Number(value) || 0)} кг`;
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

function getPreferredContact(order) {
    const method = String(order.preferredContactMethod || "").trim();
    const value = String(order.preferredContactValue || "").trim();

    if (method) {
        return {
            method,
            value: value || (["Телефон", "WhatsApp"].includes(method) ? order.phone : "")
        };
    }

    if (order.telegram) {
        return {
            method: "Telegram",
            value: order.telegram
        };
    }

    if (order.maxContact) {
        return {
            method: "MAX",
            value: order.maxContact
        };
    }

    return {
        method: "",
        value: ""
    };
}

function getPreferredContactText(order) {
    const contact = getPreferredContact(order);

    if (!contact.method) {
        return "Не выбран";
    }

    return contact.method === "Почта" ? "E-mail" : contact.method;
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

function getContactAction(order) {
    const contact = getPreferredContact(order);
    const method = contact.method;
    const value = contact.value || "";
    const phoneDigits = cleanPhoneForLink(value || order.phone);

    if (!method) {
        return phoneDigits
            ? { label: "Позвонить", href: `tel:+${phoneDigits}` }
            : null;
    }

    if (method === "Телефон") {
        return phoneDigits
            ? { label: "Связаться", href: `tel:+${phoneDigits}` }
            : null;
    }

    if (method === "WhatsApp") {
        return phoneDigits
            ? { label: "Связаться", href: `https://wa.me/${phoneDigits}`, external: true }
            : null;
    }

    if (method === "Telegram") {
        const username = getTelegramUsername(value);
        return username
            ? { label: "Связаться", href: `https://t.me/${encodeURIComponent(username)}`, external: true }
            : null;
    }

    if (method === "E-mail" || method === "Почта") {
        return value
            ? { label: "Связаться", href: `mailto:${value}` }
            : null;
    }

    if (method === "MAX") {
        return {
            label: value ? `Связь через MAX: контакт указан` : "Связь через MAX: контакт не указан",
            disabled: true
        };
    }

    return null;
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
