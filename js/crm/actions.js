// Order API actions and history/note mutations.
async function loadOrderEvents(id) {
    const orderId = String(id);

    try {
        const result = await CrmApi.get(`/api/orders/${id}/events`);

        orderEvents.set(orderId, result.events || []);
        renderOrders();
    } catch (error) {
        orderEvents.set(orderId, []);
        notifyError(error, "Не удалось загрузить историю заявки.");
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

    return getSafeErrorMessage(error, "");
}

async function addOrderNote(id, message) {
    const cleanMessage = String(message || "").trim();

    if (cleanMessage.length < 2) {
        notifyWarning(CRM_MESSAGES.WARNING_SHORT_NOTE);
        return;
    }

    try {
        await CrmApi.post(`/api/orders/${id}/notes`, getOrderMutationPayload(id, { message: cleanMessage }));

        notifySuccess(CRM_MESSAGES.SUCCESS_ORDER_NOTE_SAVED);
        await loadOrders({ preserveMessage: true });
        await loadOrderEvents(id);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        notifyError(getOrderConflictMessage(error) || error, "Не удалось сохранить заметку.");
    }
}

async function updateOrderStatus(id, status) {
    try {
        await CrmApi.patch(`/api/orders/${id}/status`, getOrderMutationPayload(id, { status }));

        notifySuccess(CRM_MESSAGES.SUCCESS_ORDER_STATUS_CHANGED);
        await loadOrders({ preserveMessage: true });
        await refreshExpandedHistory(id);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        notifyError(getOrderConflictMessage(error) || error, "Не удалось обновить статус.");
        renderOrders();
    }
}

async function runOrderAction(id, action) {
    const actionMessages = {
        take: CRM_MESSAGES.SUCCESS_ORDER_TAKEN,
        release: CRM_MESSAGES.SUCCESS_ORDER_RELEASED
    };

    try {
        await CrmApi.post(`/api/orders/${id}/${action}`, getOrderMutationPayload(id));

        await loadOrders({ preserveMessage: true });
        await refreshExpandedHistory(id);
        notifySuccess(actionMessages[action] || "Заявка обновлена.");
    } catch (error) {
        await loadOrders({ preserveMessage: true });
        notifyError(getOrderConflictMessage(error) || error, "Не удалось обновить заявку.");
    }
}

async function deleteOrder(orderId) {
    if (!orderId) {
        notifyWarning("Не удалось определить номер заявки для удаления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    const confirmed = await CrmModal.open({
        title: CRM_MESSAGES.CONFIRM_DELETE_ORDER_TITLE,
        message: `Удалить заявку ${orderNumber}? Она будет скрыта из CRM, но останется в базе.`,
        confirmText: CRM_MESSAGES.CONFIRM_DELETE_ORDER_ACTION
    });
    if (!confirmed) {
        return;
    }

    try {
        await CrmApi.delete(`/api/orders/${orderId}`, getOrderMutationPayload(orderId));

        orderEvents.delete(String(orderId));
        activeOrderTabs.delete(String(orderId));
        await loadOrders({ preserveMessage: true });
        notifySuccess(CRM_MESSAGES.SUCCESS_ORDER_DELETED);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        notifyError(getOrderConflictMessage(error) || error, "Не удалось удалить заявку.");
    }
}

async function restoreOrder(orderId) {
    if (!orderId) {
        notifyWarning("Не удалось определить номер заявки для восстановления.");
        return;
    }

    const order = orders.find(item => String(item.id) === String(orderId));
    const orderNumber = order ? getOrderNumber(order) : `№${orderId}`;

    const confirmed = await CrmModal.open({
        title: CRM_MESSAGES.CONFIRM_RESTORE_ORDER_TITLE,
        message: `Восстановить заявку ${orderNumber}?`,
        confirmText: CRM_MESSAGES.CONFIRM_RESTORE_ORDER_ACTION
    });
    if (!confirmed) {
        return;
    }

    try {
        await CrmApi.post(`/api/orders/${orderId}/restore`, getOrderMutationPayload(orderId));

        await loadOrders({ preserveMessage: true });
        if (String(expandedDeletedOrderId) === String(orderId)) {
            expandedDeletedOrderId = null;
        }
        notifySuccess(CRM_MESSAGES.SUCCESS_ORDER_RESTORED);
    } catch (error) {
        if (error.message === "Заявка была изменена другим пользователем.") {
            await loadOrders({ preserveMessage: true });
        }
        notifyError(getOrderConflictMessage(error) || error, "Не удалось восстановить заявку.");
    }
}

async function downloadOrderExcel(orderId) {
    try {
        await CrmApi.download(`/api/orders/${orderId}/export/excel`);
        notifySuccess(CRM_MESSAGES.SUCCESS_ORDER_EXCEL_DOWNLOADED);
    } catch (error) {
        notifyError(error, "Не удалось скачать заказ.");
    }
}
