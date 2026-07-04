const statuses = [
    "Новая",
    "В работе",
    "Ожидает клиента",
    "Доставка",
    "Завершена",
    "Отменена"
];

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
const refreshOrdersBtn = document.getElementById("refreshOrders");
const managerMessage = document.getElementById("managerMessage");

let orders = [];

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

function cleanPhoneForLink(phone) {
    return String(phone || "").replace(/\D/g, "");
}

function getTelegramUsername(value) {
    return String(value || "").trim().replace(/^@/, "");
}

function setMessage(message = "") {
    managerMessage.textContent = message;
}

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
    const phoneDigits = cleanPhoneForLink(order.phone);
    const telegram = getTelegramUsername(order.telegram);

    return `
        <div class="order-actions">
            ${phoneDigits ? `<a href="tel:+${phoneDigits}">Позвонить</a>` : ""}
            ${phoneDigits ? `<a class="whatsapp-link" href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
            ${telegram ? `<a class="telegram-link" href="https://t.me/${escapeHtml(telegram)}" target="_blank" rel="noopener">Telegram</a>` : ""}
            ${order.maxContact ? `<span class="max-disabled">MAX</span>` : ""}
        </div>
    `;
}

function renderOrders() {
    const selectedStatus = statusFilter.value;
    const visibleOrders = selectedStatus
        ? orders.filter(order => order.status === selectedStatus)
        : orders;

    if (!visibleOrders.length) {
        ordersList.innerHTML = "<p>Заявок пока нет.</p>";
        return;
    }

    ordersList.innerHTML = visibleOrders.map(order => `
        <article class="order-card" data-id="${order.id}">
            <header class="order-card-header">
                <div class="order-title">
                    <strong>Заказ #${order.id}</strong>
                    <span>${escapeHtml(formatDate(order.createdAt))}</span>
                </div>
                <span class="status-badge ${statusClassMap[order.status] || "status-new"}">${escapeHtml(order.status)}</span>
            </header>

            <div class="order-grid">
                <div class="order-field"><span>Клиент</span><strong>${escapeHtml(order.customerName)}</strong></div>
                <div class="order-field"><span>Телефон</span><strong>${escapeHtml(order.phone)}</strong></div>
                <div class="order-field"><span>Telegram</span><strong>${escapeHtml(order.telegram || "Не указан")}</strong></div>
                <div class="order-field"><span>MAX</span><strong>${escapeHtml(order.maxContact || "Не указан")}</strong></div>
                <div class="order-field"><span>Адрес</span><strong>${escapeHtml(order.address || "Не указан")}</strong></div>
                <div class="order-field"><span>Разгрузка</span><strong>${escapeHtml(order.unloading || "Нет")}</strong></div>
                <div class="order-field"><span>Оплата</span><strong>${escapeHtml(order.paymentMethod || "Не указана")}</strong></div>
                <div class="order-field"><span>Комментарий</span><p>${escapeHtml(order.comment || "Без комментария")}</p></div>
            </div>

            ${renderItems(order.items)}

            <footer class="order-card-footer">
                <div class="order-total">
                    <span>Итого: ${formatMoney(order.totalPrice)}</span>
                    <span>Вес: ${formatWeight(order.totalWeight)}</span>
                </div>
                ${renderContactActions(order)}
                <label class="order-field">
                    <span>Изменить статус</span>
                    <select class="status-select" data-id="${order.id}">
                        ${renderStatusOptions(order.status)}
                    </select>
                </label>
            </footer>
        </article>
    `).join("");
}

async function loadOrders() {
    setMessage("Загружаем заявки...");

    try {
        const response = await fetch("/api/orders");
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Список заявок не загрузился.");
        }

        orders = result.orders || [];
        setMessage("");
        renderOrders();
    } catch (error) {
        ordersList.innerHTML = "";
        setMessage(error.message || "Сервер недоступен. Попробуйте обновить страницу.");
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`/api/orders/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Статус не обновился.");
        }

        const order = orders.find(item => String(item.id) === String(id));
        if (order) {
            order.status = status;
        }

        setMessage("Статус обновлен.");
        renderOrders();
    } catch (error) {
        setMessage(error.message || "Не удалось обновить статус.");
        renderOrders();
    }
}

statuses.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusFilter.appendChild(option);
});

statusFilter.addEventListener("change", renderOrders);
refreshOrdersBtn.addEventListener("click", loadOrders);
ordersList.addEventListener("change", event => {
    const select = event.target.closest(".status-select");
    if (!select) return;

    updateOrderStatus(select.dataset.id, select.value);
});

loadOrders();
