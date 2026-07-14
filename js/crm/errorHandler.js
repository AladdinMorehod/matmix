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
    const codeMessages = {
        NETWORK_ERROR: "Нет связи с сервером. Проверьте подключение и повторите попытку.",
        REQUEST_TIMEOUT: "Сервер не ответил вовремя. Повторите попытку позже.",
        UNAUTHORIZED: statusMessages[401],
        FORBIDDEN: statusMessages[403],
        NOT_FOUND: statusMessages[404],
        VALIDATION_ERROR: statusMessages[400],
        CONFLICT: statusMessages[409],
        INTERNAL_ERROR: statusMessages[500],
        INVALID_PREVIEW_TOKEN: "Предпросмотр импорта устарел. Загрузите файл заново.",
        MAT_ACCEPT_AMBIGUOUS_CANDIDATES: "Нельзя автоматически принять MAT: найдено несколько подходящих кандидатов.",
        MAT_TITLE_MISMATCH: "Название товара не совпадает с выбранным MAT.",
        MAT_ALREADY_USED: "Этот MAT уже используется другим товаром.",
        DUPLICATE_MAT: "В файле найден повторяющийся MAT.",
        DAMAGED_TITLE_MARKER: "В названии повреждён маркер MAT. Проверьте строку в файле.",
        STRUCTURE_CODE_CONFLICT: "Код структуры уже используется.",
        IMPORT_APPLY_FAILED: "Не удалось применить импорт.",
        BACKUP_FAILED: "Не удалось создать резервную копию.",
        CATALOG_STRUCTURE_AUDIT_FAILED: "Не удалось выполнить аудит структуры каталога.",
        CATALOG_STRUCTURE_PRODUCTS_FAILED: "Не удалось загрузить товары по структуре каталога.",
        CATALOG_STRUCTURE_INVALID_SELECTION: "Выберите элементы структуры.",
        CATALOG_STRUCTURE_INVALID_TARGET: "Выберите активную целевую категорию.",
        CATALOG_STRUCTURE_SUBCATEGORY_NOT_FOUND: "Одна или несколько подкатегорий не найдены.",
        CATALOG_STRUCTURE_MOVE_FAILED: "Не удалось переместить подкатегории.",
        CATALOG_STRUCTURE_MOVE_PREVIEW_FAILED: "Не удалось подготовить предварительный просмотр перемещения.",
        CATEGORY_HAS_PARENT: "Категория не должна иметь родителя.",
        EMPTY_CATEGORY: "Категория не содержит товаров.",
        EMPTY_SUBCATEGORY: "Подкатегория не содержит товаров.",
        SUBCATEGORY_WITHOUT_PARENT: "Подкатегория не привязана к категории.",
        SUBCATEGORY_IN_INACTIVE_CATEGORY: "Подкатегория находится в неактивной категории.",
        DUPLICATE_CATEGORY_NAME: "Найдены категории с одинаковым названием.",
        DUPLICATE_SUBCATEGORY_NAME: "Найдены подкатегории с одинаковым названием в одной категории.",
        SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES: "Одинаковое название подкатегории встречается в разных категориях.",
        PRODUCTS_WITHOUT_STRUCTURE: "Есть товары без корректной структуры каталога."
    };
    const legacyMessageMap = [
        [/invalid preview token|token expired|preview token/i, codeMessages.INVALID_PREVIEW_TOKEN],
        [/ambiguous candidates|cannot be accepted automatically/i, codeMessages.MAT_ACCEPT_AMBIGUOUS_CANDIDATES],
        [/title mismatch/i, codeMessages.MAT_TITLE_MISMATCH],
        [/already used/i, codeMessages.MAT_ALREADY_USED],
        [/duplicate mat/i, codeMessages.DUPLICATE_MAT],
        [/damaged title marker/i, codeMessages.DAMAGED_TITLE_MARKER],
        [/structure code conflict|external_code/i, codeMessages.STRUCTURE_CODE_CONFLICT],
        [/backup failed/i, codeMessages.BACKUP_FAILED],
        [/apply failed|import apply failed/i, codeMessages.IMPORT_APPLY_FAILED]
    ];

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
        if (typeof error?.error === "string") return error.error.trim();
        if (typeof error?.error?.message === "string") return error.error.message.trim();
        return String(error?.message || "").trim();
    }

    function getErrorCode(error) {
        if (!error || typeof error === "string") return "";
        return String(
            error.code
            || error.data?.code
            || error.error?.code
            || error.data?.error?.code
            || ""
        ).trim();
    }

    function getLegacyMessage(message) {
        const match = legacyMessageMap.find(([pattern]) => pattern.test(message));
        return match ? match[1] : "";
    }

    function isTechnicalMessage(message) {
        return rawServerErrorPattern.test(message)
            || /\b(sqlite|select|insert|update|delete|where|join|stack|trace|at\s+\w+|:\d+:\d+|[a-z]:\\|\/app\/|node_modules)\b/i.test(message);
    }

    function getMessage(error, fallback = messages.ERROR_UNKNOWN || "Произошла непредвиденная ошибка.") {
        const message = getRawMessage(error);
        const code = getErrorCode(error);

        if (code && codeMessages[code]) return codeMessages[code];
        const legacyMessage = getLegacyMessage(message);
        if (legacyMessage) return legacyMessage;

        if (error?.status && statusMessages[error.status] && (!message || isTechnicalMessage(message))) {
            return statusMessages[error.status];
        }
        if (error?.status === 401) return message || statusMessages[401];
        if (error?.status === 403) return error.message || messages.ERROR_FORBIDDEN;
        if (error?.status === 404) return error.message || messages.ERROR_NOT_FOUND;
        if (!message) return fallback;
        if (error instanceof TypeError || rawBrowserErrorPattern.test(message)) {
            return messages.ERROR_NETWORK || codeMessages.NETWORK_ERROR;
        }

        if (isTechnicalMessage(message)) {
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
