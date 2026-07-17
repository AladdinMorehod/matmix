const DEFAULT_READINESS_TIMEOUT_MS = 1500;

function safeErrorField(value, fallback) {
    const normalized = String(value || "");
    return /^[A-Za-z0-9_.-]{1,64}$/.test(normalized) ? normalized : fallback;
}

async function checkDatabaseReadiness({ dbProbe, timeoutMs = DEFAULT_READINESS_TIMEOUT_MS }) {
    if (typeof dbProbe !== "function") throw new TypeError("dbProbe must be a function.");

    let timer;
    const probeResult = Promise.resolve()
        .then(() => dbProbe())
        .then(
            () => ({ status: "ok" }),
            error => ({
                status: "error",
                errorName: safeErrorField(error?.name, "Error"),
                errorCode: safeErrorField(error?.code, "UNKNOWN")
            })
        );
    const timeoutResult = new Promise(resolve => {
        timer = setTimeout(() => resolve({ status: "timeout" }), timeoutMs);
    });

    try {
        return await Promise.race([probeResult, timeoutResult]);
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { DEFAULT_READINESS_TIMEOUT_MS, checkDatabaseReadiness };
