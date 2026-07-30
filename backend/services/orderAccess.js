const NEW_ORDER_STATUS = "Новая";

function canViewOrder(user, order) {
    if (user.role === "admin") return true;
    if (Number(order.manager_id) === Number(user.id)) return true;
    return !order.deleted_at && order.status === NEW_ORDER_STATUS && !order.manager_id;
}

function activeOrderVisibility(user, tableAlias = "orders") {
    if (!["orders", "o"].includes(tableAlias)) {
        throw new Error("Unsupported order table alias.");
    }

    if (user.role === "admin") {
        return {
            sql: `${tableAlias}.deleted_at IS NULL`,
            params: []
        };
    }

    return {
        sql: `${tableAlias}.deleted_at IS NULL
            AND (
                (${tableAlias}.status = ? AND ${tableAlias}.manager_id IS NULL)
                OR ${tableAlias}.manager_id = ?
            )`,
        params: [NEW_ORDER_STATUS, user.id]
    };
}

module.exports = {
    NEW_ORDER_STATUS,
    activeOrderVisibility,
    canViewOrder
};
