const EPSILON = 1e-9;

function toFiniteNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    const normalized = typeof value === "string" ? value.replace(",", ".") : value;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
}

function ceilTo(value, precision) {
    const factor = 10 ** precision;
    const result = Math.ceil((toFiniteNumber(value) - EPSILON) * factor) / factor;
    return Object.is(result, -0) ? 0 : result;
}

function ceilMoney(value) {
    return ceilTo(value, 2);
}

function ceilWeight(value) {
    return ceilTo(value, 3);
}

function formatMoneyValue(value, options = {}) {
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: options.useGrouping !== false
    }).format(ceilMoney(value));
}

function formatWeightValue(value, options = {}) {
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        useGrouping: options.useGrouping !== false
    }).format(ceilWeight(value));
}

module.exports = {
    ceilMoney,
    ceilWeight,
    formatMoneyValue,
    formatWeightValue,
    toFiniteNumber
};
