// Order API actions and history/note mutations.
async function loadOrderEvents(id) {
    const orderId = String(id);

    try {
        const response = await fetch(`/api/orders/${id}/events`, { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "История заявки не загрузилась.");
        }

        orderEvents.set(orderId, result.events || []);
        renderOrders();
    } catch (error) {
        orderEvents.set(orderId, []);
        setMessage(error.message || "Не удалось загрузить историю заявки.");
        renderOrders();
    }
}

async function refreshExpandedHistory(id) {
    const orderId = String(id);
    const activeTab = activeOrderTabs.get(orderId);

    if (activeTab === "history") {
        orderEvents.delete(orderId);
        await loadOrderEvents(orderId);
    }
}

function getOrderForMutation(id) {
    return orders.find(item => String(item.id) === String(id));
}

function getOrderMutationPayload(id, extra = {}) {
    const order = getOrderForMutation(id);
    return {
        ...extra,
        updatedAt: order?.updatedAt || ""
    };
}

function getOrderConflictMessage(error) {
    if (error?.message === "Заявка была изменена другим пользователем.") {
        return "Заявка была изменена другим пользователем. Обновите данные.";
    }

    return error?.message || "";
}

async function addOrderNote(id, message) {
    const cleanMessage = String(message || "").trim();

    if (cleanMessage.length < 2) {
        setMessage("Заметка должна быть не короче 2 символов.");
        return;
    }

    try {
        const response = await fetch(`/api/orders/${id}/notes`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getOrderMutationPayload(id, { message: cleanMessage }))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заметка не сохранилась.");
        }

        setMessage("Заметка сохранена.");
        await loadOrders({ preserveMessage: true });
        await loadOrderEvents(id);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        setMessage(getOrderConflictMessage(error) || "Не удалось сохранить заметку.");
    }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`/api/orders/${id}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getOrderMutationPayload(id, { status }))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Статус не обновился.");
        }

        setMessage("Статус обновлен.");
        await loadOrders({ preserveMessage: true });
        await refreshExpandedHistory(id);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        setMessage(getOrderConflictMessage(error) || "Не удалось обновить статус.");
        renderOrders();
    }
}

async function runOrderAction(id, action) {
    const actionMessages = {
        take: "Заявка взята в работу.",
        release: "Заявка освобождена."
    };

    try {
        const response = await fetch(`/api/orders/${id}/${action}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getOrderMutationPayload(id))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Действие не выполнено.");
        }

        await loadOrders({ preserveMessage: true });
        await refreshExpandedHistory(id);
        setMessage(actionMessages[action] || "Заявка обновлена.");
    } catch (error) {
        await loadOrders({ preserveMessage: true });
        setMessage(getOrderConflictMessage(error) || "Не удалось обновить заявку.");
    }
}

async function deleteOrder(orderId) {
    if (!orderId) {
        setMessage("Не удалось определить номер заявки для удаления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    if (!window.confirm(`Удалить заявку ${orderNumber}? Она будет скрыта из CRM, но останется в базе.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getOrderMutationPayload(orderId))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заявка не удалена.");
        }

        orderEvents.delete(String(orderId));
        activeOrderTabs.delete(String(orderId));
        await loadOrders({ preserveMessage: true });
        setMessage("Заявка перемещена в удаленные.");
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        setMessage(getOrderConflictMessage(error) || "Не удалось удалить заявку.");
    }
}

async function restoreOrder(orderId) {
    if (!orderId) {
        setMessage("Не удалось определить номер заявки для восстановления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    if (!window.confirm(`Восстановить заявку ${orderNumber}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}/restore`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(getOrderMutationPayload(orderId))
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Заявка не восстановлена.");
        }

        await loadOrders({ preserveMessage: true });
        if (String(expandedDeletedOrderId) === String(orderId)) {
            expandedDeletedOrderId = null;
        }
        setMessage("Заявка восстановлена.");
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        setMessage(getOrderConflictMessage(error) || "Не удалось восстановить заявку.");
    }
}
