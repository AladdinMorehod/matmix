(function initCrmErrorHandler(window) {
    const messages = window.CRM_MESSAGES || {};
    const rawBrowserErrorPattern = /(failed to fetch|networkerror|load failed|typeerror|syntaxerror|unexpected token|unexpected end|network request failed)/i;

    class CrmApiError extends Error {
        constructor(message, options = {}) {
            super(message || messages.ERROR_UNKNOWN || "Произошла непредвиденная ошибка.");
            this.name = "CrmApiError";
            this.status = options.status || 0;
            this.data = options.data || null;
        }
    }

    function getRawMessage(error) {
        if (typeof error === "string") return error.trim();
        return String(error?.message || "").trim();
    }

    function getMessage(error, fallback = messages.ERROR_UNKNOWN || "Произошла непредвиденная ошибка.") {
        const message = getRawMessage(error);

        if (error?.status === 403) return error.message || messages.ERROR_FORBIDDEN;
        if (error?.status === 404) return error.message || messages.ERROR_NOT_FOUND;
        if (!message) return fallback;
        if (error instanceof TypeError || rawBrowserErrorPattern.test(message)) {
            return messages.ERROR_NETWORK || "Не удалось соединиться с сервером.";
        }

        return message;
    }

    window.CrmApiError = CrmApiError;
    window.CrmErrorHandler = {
        getMessage,
        normalize(error, fallback) {
            return new CrmApiError(getMessage(error, fallback), {
                status: error?.status || 0,
                data: error?.data || null
            });
        }
    };
})(window);
