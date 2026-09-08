const MAT_CODE_PATTERN = /^MAT-(\d+)$/i;

function normalizeCodeText(value) {
    if (value === null || value === undefined) return "";
    const normalized = String(value)
        .normalize("NFKC")
        .replace(/\u00a0/g, " ")
        .trim();
    if (!normalized || ["nan", "null", "undefined"].includes(normalized.toLowerCase())) return "";
    return normalized
        .replace(/\s*-\s*/g, "-")
        .replace(/\s+/g, "")
        .toUpperCase();
}

function normalizeMatCode(value) {
    const normalized = normalizeCodeText(value);
    const match = normalized.match(MAT_CODE_PATTERN);
    if (!match) return normalized;
    return `MAT-${match[1].padStart(6, "0")}`;
}

function validateMatCode(value) {
    return MAT_CODE_PATTERN.test(normalizeMatCode(value));
}

module.exports = { MAT_CODE_PATTERN, normalizeCodeText, normalizeMatCode, validateMatCode };
