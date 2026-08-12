const { formatMoneyValue, formatWeightValue } = require("../utils/numberFormat");

function text(value) {
    return value === null || value === undefined ? "" : String(value);
}

function escapeHtml(value) {
    return text(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function displayOrderNumber(order) {
    return text(order.order_number).trim() || `#${order.id}`;
}

function requestTypeLabel(value) {
    return value === "file_request" ? "Файловая заявка" : "Заказ из корзины";
}

function itemDetails(item) {
    const quantity = Number(item.quantity ?? item.qty) || 0;
    const unit = text(item.unit || "шт");
    const name = text(item.title || item.name || item.externalId || item.external_id || "Товар");
    const price = item.unitPrice ?? item.price;
    const lineTotal = item.lineTotal;
    const priceText = item.priceOnRequest === true || price === null || price === undefined
        ? "цена по запросу"
        : `${formatMoneyValue(price)} ₽`;
    const totalText = lineTotal === null || lineTotal === undefined
        ? ""
        : `, сумма ${formatMoneyValue(lineTotal)} ₽`;
    return { name, quantity, unit, priceText, totalText };
}

function optionalRows(order) {
    return [
        ["Email", order.email],
        ["Адрес", order.address],
        ["Разгрузка", order.unloading],
        ["Оплата", order.payment_method],
        ["Комментарий", order.comment]
    ].filter(([, value]) => text(value).trim());
}

function buildOrderEmail({ order, attachments = [] }) {
    if (!order || !Number.isSafeInteger(Number(order.id))) throw new TypeError("Order email requires an order.");
    const orderNumber = displayOrderNumber(order);
    const items = Array.isArray(order.items) ? order.items : [];
    const subject = `MatMix — новый заказ ${orderNumber}`;
    const baseRows = [
        ["Номер", orderNumber],
        ["Тип", requestTypeLabel(order.request_type)],
        ["Дата", order.created_at],
        ["Клиент", order.customer_name],
        ["Телефон", order.phone],
        ...optionalRows(order)
    ];
    const textLines = [
        subject,
        "",
        ...baseRows.map(([label, value]) => `${label}: ${text(value)}`),
        "",
        "Позиции:"
    ];
    if (items.length) {
        for (const item of items) {
            const details = itemDetails(item);
            textLines.push(`- ${details.name}: ${details.quantity} ${details.unit}, ${details.priceText}${details.totalText}`);
        }
    } else {
        textLines.push("- Нет позиций корзины");
    }
    textLines.push("", `Итого: ${formatMoneyValue(order.total_price)} ₽`);
    textLines.push(`Общий вес: ${formatWeightValue(order.total_weight)} кг`);
    if (attachments.length) {
        textLines.push("", "Файлы:", ...attachments.map(file => `- ${text(file.original_name)}`));
    }

    const htmlRows = baseRows
        .map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
        .join("");
    const htmlItems = items.length
        ? items.map(item => {
            const details = itemDetails(item);
            return `<li>${escapeHtml(details.name)}: ${escapeHtml(details.quantity)} ${escapeHtml(details.unit)}, ${escapeHtml(details.priceText + details.totalText)}</li>`;
        }).join("")
        : "<li>Нет позиций корзины</li>";
    const htmlAttachments = attachments.length
        ? `<h2>Файлы</h2><ul>${attachments.map(file => `<li>${escapeHtml(file.original_name)}</li>`).join("")}</ul>`
        : "";
    const html = [
        `<h1>${escapeHtml(subject)}</h1>`,
        `<table><tbody>${htmlRows}</tbody></table>`,
        `<h2>Позиции</h2><ul>${htmlItems}</ul>`,
        `<p><strong>Итого:</strong> ${escapeHtml(formatMoneyValue(order.total_price))} ₽</p>`,
        `<p><strong>Общий вес:</strong> ${escapeHtml(formatWeightValue(order.total_weight))} кг</p>`,
        htmlAttachments
    ].join("");

    return { subject, text: textLines.join("\n"), html };
}

module.exports = { escapeHtml, buildOrderEmail };
