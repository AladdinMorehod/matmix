function sanitizeExcelText(value) {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "");
    return /^[\t\r]*[=+\-@]/.test(text) ? `'${text}` : text;
}

module.exports = { sanitizeExcelText };
