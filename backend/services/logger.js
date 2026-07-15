function serializeError(error) { return { name: error?.name || "Error", code: error?.code || undefined, message: String(error?.message || "Unexpected error").slice(0, 500) }; }
function log(level, event, fields = {}) {
    const record = { timestamp: new Date().toISOString(), level, event, ...fields };
    const output = JSON.stringify(record);
    (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(output);
}
module.exports = { info: (event, fields) => log("info", event, fields), warn: (event, fields) => log("warn", event, fields), error: (event, error, fields = {}) => log("error", event, { ...fields, error: serializeError(error) }), serializeError };
