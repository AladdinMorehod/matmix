(function initMatMixErrors(window) {
    const fallbackMessage = "Произошла непредвиденная ошибка.";
    const connectionMessage = "Не удалось соединиться с сервером.";
    const rawBrowserErrorPattern = /(failed to fetch|networkerror|load failed|typeerror|syntaxerror|unexpected token|unexpected end|network request failed)/i;

    function getRawMessage(error) {
        if (typeof error === "string") return error.trim();
        return String(error?.message || "").trim();
    }

    function isRawBrowserError(error, message) {
        return error instanceof TypeError || rawBrowserErrorPattern.test(message);
    }

    function getMessage(error, options = {}) {
        const fallback = options.fallback || fallbackMessage;
        const networkFallback = options.networkFallback || connectionMessage;
        const message = getRawMessage(error);

        if (!message) return fallback;
        if (isRawBrowserError(error, message)) return networkFallback;

        return message;
    }

    async function readJson(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    window.MatMixErrors = {
        fallbackMessage,
        connectionMessage,
        getMessage,
        readJson
    };
})(window);
