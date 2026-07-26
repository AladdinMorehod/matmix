const productGroupMaxLength = 200;

function validateProductGroupInput(body = {}) {
    const hasCamelCase = Object.prototype.hasOwnProperty.call(body, "productGroup");
    const hasSnakeCase = Object.prototype.hasOwnProperty.call(body, "product_group");
    if (!hasCamelCase && !hasSnakeCase) return "";

    const value = hasCamelCase ? body.productGroup : body.product_group;
    if (typeof value !== "string") return "Группа товаров должна быть строкой.";

    const normalized = value.trim();
    if (normalized.length > productGroupMaxLength) {
        return `Группа товаров не должна превышать ${productGroupMaxLength} символов.`;
    }
    if (/[\u0000-\u001F\u007F]/.test(value)) {
        return "Группа товаров не должна содержать управляющие символы.";
    }

    return "";
}

module.exports = {
    productGroupMaxLength,
    validateProductGroupInput
};
