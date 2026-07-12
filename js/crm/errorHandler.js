(function initCrmErrorHandler(window) {
    const messages = window.CRM_MESSAGES || {};
    const rawBrowserErrorPattern = /(failed to fetch|networkerror|load failed|typeerror|syntaxerror|unexpected token|unexpected end|network request failed)/i;
    const rawServerErrorPattern = /(unauthorized|forbidden|not found|internal server error|invalid file|missing field|preview failed|apply failed|request failed|unexpected error|file is required|invalid token|token expired|validation failed|sql error|stack trace)/i;
    const statusMessages = {
        400: "Проверьте данные запроса.",
        401: "Сессия истекла. Войдите снова.",
        403: "У вас недостаточно прав для выполнения операции.",
        404: "Запрошенные данные не найдены.",
        409: "Операцию нельзя выполнить из-за конфликта данных.",
        413: "Файл слишком большой.",
        422: "В файле обнаружены критические ошибки.",
        500: "Произошла внутренняя ошибка сервера."
    };

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

        if (error?.status && statusMessages[error.status] && (!message || rawServerErrorPattern.test(message))) {
            return statusMessages[error.status];
        }
        if (error?.status === 401) return message || statusMessages[401];
        if (error?.status === 403) return error.message || messages.ERROR_FORBIDDEN;
        if (error?.status === 404) return error.message || messages.ERROR_NOT_FOUND;
        if (!message) return fallback;
        if (error instanceof TypeError || rawBrowserErrorPattern.test(message)) {
            return messages.ERROR_NETWORK || "Не удалось соединиться с сервером.";
        }

        if (rawServerErrorPattern.test(message)) {
            return error?.status && statusMessages[error.status] ? statusMessages[error.status] : fallback;
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
