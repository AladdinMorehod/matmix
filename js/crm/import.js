// Catalog import preview UI. This module never applies changes to the catalog.
let importSelectedFile = null;
let importPreview = null;
let importLoading = false;
let importApplying = false;
let importApplyResult = null;
let importActiveTab = "new";
let importSearchQuery = "";
let importSearchTimer = null;
let importPriceFilter = "changed";
let importVisibleCount = 100;
let importShowAllSummary = false;

const IMPORT_MAX_FILE_SIZE = 30 * 1024 * 1024;
const IMPORT_RESULT_PAGE_SIZE = 100;

const importTabs = [
    { id: "new", label: "Новые" },
    { id: "updated", label: "Обновления" },
    { id: "prices", label: "Цены" },
    { id: "requiresReview", label: "Требуют решения" },
    { id: "missingFromFile", label: "Отсутствуют в файле" },
    { id: "manualOnly", label: "Только в CRM" },
    { id: "missingCodes", label: "Без кода" },
    { id: "structure", label: "Структура" },
    { id: "issues", label: "Ошибки и предупреждения" }
];

const importSummaryCards = [
    { key: "new", label: "Новые товары", primary: true },
    { key: "updated", label: "Обновятся", primary: true },
    { key: "requiresReview", label: "Требуют решения", primary: true },
    { key: "missingFromFile", label: "Отсутствуют в файле", primary: true },
    { key: "missingCodes", label: "Без MAT-кода", primary: true },
    { key: "priceChanged", label: "Цены изменятся", primary: true },
    { key: "criticalErrors", label: "Критические ошибки", primary: true },
    { key: "unchanged", label: "Без изменений" },
    { key: "manualOnly", label: "Только в CRM" },
    { key: "newCategories", label: "Новые категории" },
    { key: "newSubcategories", label: "Новые подкатегории" },
    { key: "renamedCategories", label: "Переимен. категории" },
    { key: "renamedSubcategories", label: "Переимен. подкат." },
    { key: "assignedCategoryCodes", label: "Будет записано CAT" },
    { key: "assignedSubcategoryCodes", label: "Будет записано SUB" },
    { key: "missingCategoryCodes", label: "Не найдена категория" },
    { key: "missingSubcategoryCodes", label: "Не найдена подкатегория" },
    { key: "priceIncreased", label: "Цена выше" },
    { key: "priceDecreased", label: "Цена ниже" },
    { key: "priceWarnings", label: "Риски цены" },
    { key: "newGroups", label: "Новые группы" },
    { key: "warnings", label: "Предупреждения" }
];

const importSummaryGroups = [
    {
        label: "Каталог",
        cards: [
            { key: "new", label: "Новые товары", always: true, description: "Товары из Excel, которых еще нет в CRM." },
            { key: "updated", label: "Обновятся", always: true, description: "Существующие товары, у которых найдено изменение данных." },
            { key: "requiresReview", label: "Требуют решения", always: true, description: "Похожие товары требуют ручной проверки перед импортом." },
            { key: "missingFromFile", label: "Отсутствуют в файле", description: "Товары CRM, которых нет в текущем Excel." },
            { key: "manualOnly", label: "Только в CRM", description: "Ручные товары CRM, которых нет в Excel." },
            { key: "unchanged", label: "Без изменений", description: "Строки Excel, совпавшие с текущими данными CRM." }
        ]
    },
    {
        label: "Цены",
        cards: [
            { key: "priceChanged", label: "Цены изменятся", always: true, priceFilter: "changed", description: "Товары, у которых Apply обновит цену." },
            { key: "priceIncreased", label: "Цена выше", priceFilter: "increased", description: "Товары с повышением цены." },
            { key: "priceDecreased", label: "Цена ниже", priceFilter: "decreased", description: "Товары со снижением цены." },
            { key: "priceWarnings", label: "Риски цены", priceFilter: "warnings", description: "Ценовые предупреждения и конфликтные строки." }
        ]
    },
    {
        label: "Структура",
        cards: [
            { key: "newCategories", label: "Новые категории", description: "Категории, которых нет в структуре CRM." },
            { key: "newSubcategories", label: "Новые подкатегории", description: "Подкатегории, которых нет в структуре CRM." },
            { key: "renamedCategories", label: "Переименованы категории", description: "Категории с отличающимся названием." },
            { key: "renamedSubcategories", label: "Переименованы подкатегории", description: "Подкатегории с отличающимся названием." },
            { key: "assignedCategoryCodes", label: "Будет записано CAT", description: "CAT найден в структуре и будет записан в Excel-копию после Apply." },
            { key: "assignedSubcategoryCodes", label: "Будет записано SUB", description: "SUB найден в структуре и будет записан в Excel-копию после Apply." },
            { key: "missingCategoryCodes", label: "Не найдена категория", description: "Категория не найдена в catalog_structure." },
            { key: "missingSubcategoryCodes", label: "Не найдена подкатегория", description: "Подкатегория не найдена в catalog_structure." },
            { key: "newGroups", label: "Новые группы", description: "Группы товаров, появившиеся в Excel." }
        ]
    },
    {
        label: "Контроль",
        cards: [
            { key: "missingCodes", label: "Без MAT-кода", description: "Товары без MAT-кода, которым будет предложен код." },
            { key: "criticalErrors", label: "Критические ошибки", always: true, description: "Ошибки, блокирующие Apply." },
            { key: "warnings", label: "Предупреждения", always: true, description: "Некритичные предупреждения предварительной проверки." }
        ]
    }
];

const importPriceSummaryCardByFilter = {
    changed: "priceChanged",
    increased: "priceIncreased",
    decreased: "priceDecreased",
    warnings: "priceWarnings"
};

const importStructureLabels = {
    newCategories: "Новые категории",
    newSubcategories: "Новые подкатегории",
    renamedCategories: "Переименованы категории",
    renamedSubcategories: "Переименованы подкатегории",
    assignedCategoryCodes: "Будет записано CAT",
    assignedSubcategoryCodes: "Будет записано SUB",
    missingCategoryCodes: "Не найдена категория",
    missingSubcategoryCodes: "Не найдена подкатегория",
    newGroups: "Новые группы"
};

const importFieldLabels = {
    title: "Название",
    category: "Категория",
    subcategory: "Подкатегория",
    productGroup: "Группа",
    price: "Цена",
    weight: "Вес",
    unit: "Единица",
    sortOrder: "Порядок"
};

function formatFileSize(bytes) {
    const size = Number(bytes) || 0;
    if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} МБ`;
    if (size >= 1024) return `${Math.round(size / 1024)} КБ`;
    return `${size} Б`;
}

function normalizeImportSearch(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function getImportArray(key) {
    if (!importPreview) return [];
    if (key === "prices") {
        return getPriceChanges().items || [];
    }
    if (key === "structure") {
        return [
            ...(importPreview.changes?.newCategories || []),
            ...(importPreview.changes?.newSubcategories || []),
            ...(importPreview.changes?.renamedCategories || []),
            ...(importPreview.changes?.renamedSubcategories || []),
            ...(importPreview.changes?.assignedCategoryCodes || []),
            ...(importPreview.changes?.assignedSubcategoryCodes || []),
            ...(importPreview.changes?.missingCategoryCodes || []),
            ...(importPreview.changes?.missingSubcategoryCodes || []),
            ...(importPreview.changes?.newGroups || [])
        ];
    }
    if (key === "issues") {
        return [...(importPreview.errors || []), ...(importPreview.warnings || [])];
    }
    return importPreview.changes?.[key] || [];
}

function getImportTabCount(tabId) {
    if (!importPreview) return 0;
    if (tabId === "structure") {
        return Number(importPreview.summary?.newCategories || 0)
            + Number(importPreview.summary?.newSubcategories || 0)
            + Number(importPreview.summary?.renamedCategories || 0)
            + Number(importPreview.summary?.renamedSubcategories || 0)
            + Number(importPreview.summary?.assignedCategoryCodes || 0)
            + Number(importPreview.summary?.assignedSubcategoryCodes || 0)
            + Number(importPreview.summary?.missingCategoryCodes || 0)
            + Number(importPreview.summary?.missingSubcategoryCodes || 0)
            + Number(importPreview.summary?.newGroups || 0);
    }
    if (tabId === "issues") {
        return Number(importPreview.summary?.criticalErrors || 0)
            + Number(importPreview.summary?.warnings || 0);
    }
    if (tabId === "prices") {
        const priceChanges = getPriceChanges();
        return Number(priceChanges.changed || 0)
            + Number(priceChanges.newPrice || 0)
            + Number(priceChanges.zeroPrice || 0)
            + Number(priceChanges.invalid || 0)
            + Number(priceChanges.productNotFound || 0);
    }
    return Number(importPreview.summary?.[tabId] || 0);
}

function getImportSummaryCard(key) {
    return importSummaryGroups.flatMap(group => group.cards).find(card => card.key === key) || null;
}

function getImportSummaryCount(key) {
    if (!importPreview) return 0;
    const priceChanges = getPriceChanges();
    if (key === "priceChanged") return Number(priceChanges.changed || 0);
    if (key === "priceIncreased") return Number(priceChanges.increased || 0);
    if (key === "priceDecreased") return Number(priceChanges.decreased || 0);
    if (key === "priceWarnings") {
        return (priceChanges.warningSummary || []).reduce((total, item) => total + Number(item.count || 0), 0);
    }
    return Number(importPreview.summary?.[key] || 0);
}

function getInitialImportSummaryKey() {
    if (getImportSummaryCount("criticalErrors") > 0) return "criticalErrors";
    if (getImportSummaryCount("requiresReview") > 0) return "requiresReview";
    if (getImportSummaryCount("new") > 0) return "new";
    if (getImportSummaryCount("updated") > 0) return "updated";
    const firstWithRows = importSummaryGroups
        .flatMap(group => group.cards)
        .find(card => getImportSummaryCount(card.key) > 0);
    return firstWithRows?.key || "new";
}

function activateImportSummary(key, resetSearch = true) {
    const card = getImportSummaryCard(key);
    if (!card) return;
    importActiveTab = key;
    importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
    if (card.priceFilter) importPriceFilter = card.priceFilter;
    if (resetSearch) importSearchQuery = "";
}

function getVisibleImportItems(items) {
    return items.slice(0, importVisibleCount);
}

function renderImportLoadMore(total) {
    if (total <= IMPORT_RESULT_PAGE_SIZE) return "";
    const shown = Math.min(importVisibleCount, total);
    return `
        <div class="import-load-more">
            <span>Показано ${escapeHtml(shown)} из ${escapeHtml(total)}</span>
            ${shown < total ? `<button type="button" data-import-load-more>Показать ещё 100</button>` : ""}
        </div>
    `;
}

function getImportSearchText(item) {
    if (!item) return "";
    const changeText = Array.isArray(item.changes)
        ? item.changes.map(change => `${change.field} ${change.currentValue} ${change.incomingValue}`).join(" ")
        : "";
    return normalizeImportSearch([
        item.externalId,
        item.title,
        item.name,
        item.category,
        item.subcategory,
        item.productGroup,
        item.source,
        item.status,
        item.suggestedExternalId,
        item.productCode,
        item.productName,
        item.status,
        ...(item.warningCodes || []),
        item.message,
        item.code,
        changeText
    ].filter(Boolean).join(" "));
}

function getFilteredImportItems(tabId) {
    const items = getImportArray(tabId);
    const query = normalizeImportSearch(importSearchQuery);
    if (!query) return items;
    return items.filter(item => getImportSearchText(item).includes(query));
}

function createEmptyPriceChanges() {
    return {
        totalChecked: 0,
        changed: 0,
        increased: 0,
        decreased: 0,
        unchanged: 0,
        newPrice: 0,
        invalid: 0,
        zeroPrice: 0,
        productNotFound: 0,
        averageChangePercent: null,
        maxIncreasePercent: null,
        maxDecreasePercent: null,
        hasBlockingErrors: false,
        hasWarnings: false,
        warningSummary: [],
        items: []
    };
}

function getPriceChanges() {
    return importPreview?.priceChanges || createEmptyPriceChanges();
}

function formatImportPrice(value) {
    return value === null || value === undefined ? "—" : formatMoney(Number(value) || 0);
}

function formatImportPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
    return `${Number(value).toFixed(2)}%`;
}

function getPriceStatusLabel(status) {
    const labels = {
        increased: "Повышение",
        decreased: "Снижение",
        unchanged: "Без изменений",
        newPrice: "Новая цена",
        invalid: "Ошибка",
        zeroPrice: "Нулевая цена",
        productNotFound: "Товар не найден"
    };
    return labels[status] || status || "—";
}

function validateImportFile(file) {
    if (!file) return "Выберите Excel-файл.";
    if (!file.name.toLowerCase().endsWith(".xlsx")) return "Можно загрузить только файл .xlsx.";
    if (file.size > IMPORT_MAX_FILE_SIZE) return "Файл больше 30 МБ.";
    return "";
}

function setImportFile(file) {
    const error = validateImportFile(file);
    importSelectedFile = error ? null : file;
    importPreview = null;
    importApplyResult = null;
    importSearchQuery = "";
    importPriceFilter = "changed";
    importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
    renderImportView(error);
}

function resetImportPreview({ clearFile = false } = {}) {
    if (clearFile) importSelectedFile = null;
    importPreview = null;
    importApplyResult = null;
    importLoading = false;
    importApplying = false;
    importActiveTab = "new";
    importSearchQuery = "";
    importPriceFilter = "changed";
    importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
    renderImportView();
}

async function submitImportPreview() {
    const error = validateImportFile(importSelectedFile);
    if (error) {
        renderImportView(error);
        return;
    }

    importLoading = true;
    renderImportView();

    try {
        const formData = new FormData();
        formData.append("file", importSelectedFile);
        importPreview = await CrmApi.post("/api/products/import/preview", formData);
        importApplyResult = null;
        importActiveTab = getInitialImportSummaryKey();
        importSearchQuery = "";
        importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
        window.CrmToast?.success("Файл проанализирован.");
    } catch (error) {
        importPreview = null;
        notifyError(error, "Не удалось проанализировать Excel-файл.");
    } finally {
        importLoading = false;
        renderImportView();
    }
}

async function submitImportApply() {
    if (!importPreview?.token || importApplying) return;

    const summary = importPreview.summary || {};
    const formData = await CrmModal.form({
        title: "Применить импорт",
        description: "Импорт выполнится в одной транзакции. Перед изменениями будет создан backup базы.",
        submitText: "Применить импорт",
        content: `
            <div class="import-apply-confirm">
                <dl>
                    <div><dt>Создать</dt><dd>${Number(summary.new || 0)}</dd></div>
                    <div><dt>Обновить</dt><dd>${Number(summary.updated || 0)}</dd></div>
                    <div><dt>Назначить MAT</dt><dd>${Number(summary.missingCodes || 0)}</dd></div>
                    <div><dt>Скрыть</dt><dd>${Number(summary.missingFromFile || 0)}</dd></div>
                    <div><dt>Новые категории</dt><dd>${Number(summary.newCategories || 0)}</dd></div>
                    <div><dt>Переименовать CAT/SUB</dt><dd>${Number(summary.renamedCategories || 0) + Number(summary.renamedSubcategories || 0)}</dd></div>
                    <div><dt>Записать CAT/SUB</dt><dd>${Number(summary.assignedCategoryCodes || 0) + Number(summary.assignedSubcategoryCodes || 0)}</dd></div>
                    <div><dt>Требуют решения</dt><dd>${Number(summary.requiresReview || 0)}</dd></div>
                </dl>
                <label class="product-checkbox">
                    <input name="assignMissingCodes" type="checkbox" checked>
                    <span>Назначить MAT строкам без кода, если найден однозначный товар в CRM</span>
                </label>
                <label>
                    <span>Отсутствующие в Excel</span>
                    <select name="missingFromFileAction">
                        <option value="keep" selected>Оставить без изменений</option>
                        <option value="hide">Скрыть excel-товары</option>
                    </select>
                </label>
            </div>
        `
    });
    if (!formData) return;

    importApplying = true;
    renderImportView();

    try {
        importApplyResult = await CrmApi.post("/api/products/import/apply", {
            token: importPreview.token,
            options: {
                assignMissingCodes: formData.get("assignMissingCodes") === "on",
                missingFromFileAction: String(formData.get("missingFromFileAction") || "keep")
            }
        });
        importPreview = null;
        importSelectedFile = null;
        notifySuccess("Импорт каталога применен.");
    } catch (error) {
        notifyError(error, "Не удалось применить импорт каталога.");
    } finally {
        importApplying = false;
        renderImportView();
    }
}

function renderImportInfoList() {
    return `
        <ul class="import-info-list">
            <li>Файл должен быть .xlsx</li>
            <li>Используется лист "ШАБЛОН"</li>
            <li>MAT-коды читаются из колонки K</li>
            <li>Анализ не изменяет каталог</li>
            <li>Применение изменений появится на следующем этапе</li>
        </ul>
    `;
}

function renderImportUpload(error = "") {
    const fileName = importSelectedFile?.name || "Файл не выбран";
    const fileSize = importSelectedFile ? formatFileSize(importSelectedFile.size) : "";
    const isReady = Boolean(importSelectedFile) && !importLoading;

    return `
        <section class="import-upload-panel">
            <div class="import-dropzone${importSelectedFile ? " has-file" : ""}" data-import-dropzone>
                <input id="catalogImportFile" class="visually-hidden" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                <label for="catalogImportFile" class="import-file-label">
                    <span class="import-file-icon" aria-hidden="true">XLSX</span>
                    <strong>Выбрать Excel-файл</strong>
                    <span>Перетащите файл сюда или выберите его вручную</span>
                </label>
                <div class="import-file-meta">
                    <strong>${escapeHtml(fileName)}</strong>
                    ${fileSize ? `<span>${escapeHtml(fileSize)}</span>` : ""}
                </div>
            </div>
            ${error ? `<p class="import-message error">${escapeHtml(error)}</p>` : ""}
            <div class="import-actions">
                <button class="import-preview-submit" type="button" ${isReady ? "" : "disabled"}>Проверить файл</button>
                ${importPreview ? `
                    <button class="import-select-other" type="button">Выбрать другой файл</button>
                    <button class="import-rerun" type="button" ${isReady ? "" : "disabled"}>Проверить заново</button>
                ` : ""}
            </div>
        </section>
    `;
}

function renderApplyActions() {
    if (!importPreview) return "";
    if (!importPreview.canImport) {
        return `
            <section class="import-apply-panel blocked">
                <div>
                    <strong>Применение импорта недоступно</strong>
                    <span>Сначала устраните обязательные конфликты и повторите предварительную проверку.</span>
                </div>
                <button class="import-apply-submit" type="button" disabled>Применить импорт</button>
            </section>
        `;
    }
    return `
        <section class="import-apply-panel">
            <div>
                <strong>Предварительная проверка завершена.</strong>
                <span>Token активен до ${escapeHtml(formatDate(importPreview.tokenExpiresAt))}</span>
            </div>
            <button class="import-apply-submit" type="button" ${importApplying ? "disabled" : ""}>Применить импорт</button>
        </section>
    `;
}

function renderApplyResult() {
    if (!importApplyResult) return "";
    return `
        <section class="import-apply-result">
            <h2>Импорт применен</h2>
            <dl>
                <div><dt>Создано</dt><dd>${Number(importApplyResult.created || 0)}</dd></div>
                <div><dt>Обновлено</dt><dd>${Number(importApplyResult.updated || 0)}</dd></div>
                <div><dt>Назначено MAT</dt><dd>${Number(importApplyResult.assignedMat || 0)}</dd></div>
                <div><dt>Скрыто</dt><dd>${Number(importApplyResult.hidden || 0)}</dd></div>
                <div><dt>Требуют решения</dt><dd>${Number(importApplyResult.requiresReview || 0)}</dd></div>
            </dl>
            <p>Backup создан: ${escapeHtml(importApplyResult.backupPath || "")}</p>
            <p>Integrity check: ${escapeHtml(importApplyResult.integrityCheck || "")}</p>
            ${importApplyResult.excelCopyUrl ? `<button class="import-download-copy" type="button">Скачать обновленный Excel</button>` : ""}
        </section>
    `;
}

function renderImportStatus() {
    if (!importPreview) return "";
    return importPreview.canImport
        ? `<p class="import-status success">Файл прошел проверку. Критических ошибок нет.</p>`
        : `<p class="import-status danger">Файл содержит критические ошибки. Применение импорта невозможно.</p>`;
}

function renderImportSummary() {
    if (!importPreview) return "";
    const visibleGroups = importSummaryGroups.map(group => ({
        ...group,
        cards: group.cards.filter(card => importShowAllSummary || card.always || getImportSummaryCount(card.key) > 0)
    })).filter(group => group.cards.length);

    return `
        <section class="import-summary" aria-label="Сводка предварительной проверки">
            ${visibleGroups.map(group => `
                <section class="import-summary-group" aria-label="${escapeHtml(group.label)}">
                    <h3>${escapeHtml(group.label)}</h3>
                    <div class="import-summary-group-grid">
                        ${group.cards.map(card => {
                            const count = getImportSummaryCount(card.key);
                            const isActive = importActiveTab === card.key;
                            return `
                                <button class="import-summary-card${card.always ? " primary" : ""}${isActive ? " active" : ""}${count ? "" : " is-zero"}" type="button" data-summary-key="${escapeHtml(card.key)}" aria-pressed="${isActive ? "true" : "false"}" aria-controls="importPreviewPanel">
                                    <span>${escapeHtml(card.label)}</span>
                                    <strong>${escapeHtml(count)}</strong>
                                </button>
                            `;
                        }).join("")}
                    </div>
                </section>
            `).join("")}
            <button class="import-summary-toggle" type="button" data-summary-toggle>
                ${importShowAllSummary ? "Скрыть нулевые" : "Показать все показатели"}
            </button>
        </section>
    `;
    return `
        <section class="import-summary" aria-label="Сводка предварительной проверки">
            ${importSummaryCards.map(card => `
                <article class="import-summary-card${card.primary ? " primary" : ""}">
                    <span>${escapeHtml(card.label)}</span>
                    <strong>${Number(importPreview.summary?.[card.key] || 0)}</strong>
                </article>
            `).join("")}
        </section>
    `;
}

function renderImportTabs() {
    if (!importPreview) return "";
    const activeCard = getImportSummaryCard(importActiveTab) || getImportSummaryCard(getInitialImportSummaryKey());
    const activeCount = getImportSummaryCount(activeCard?.key || importActiveTab);
    return `
        <section id="import-preview-results" class="import-preview">
            <header class="import-preview-header">
                <div>
                    <h2>${escapeHtml(activeCard?.label || "Предварительная проверка")}</h2>
                    <p>${escapeHtml(activeCard?.description || "Выберите показатель выше, чтобы посмотреть строки предварительной проверки.")}</p>
                </div>
                <strong>${escapeHtml(activeCount)}</strong>
            </header>
            <div class="import-preview-tools">
                <label class="import-search">
                    <span>Поиск в выбранном списке</span>
                    <input id="importPreviewSearch" type="search" value="${escapeHtml(importSearchQuery)}" placeholder="MAT-код, название, категория" autocomplete="off">
                </label>
            </div>
            <div id="importPreviewPanel" class="import-preview-panel">
                ${renderImportTabPanel()}
            </div>
        </section>
    `;
    return `
        <section class="import-preview">
            <div class="import-preview-tools">
                <div class="import-tabs" role="tablist" aria-label="Изменения импорта">
                    ${importTabs.map(tab => {
                        const count = getImportTabCount(tab.id);
                        return `<button class="${tab.id === importActiveTab ? "active" : ""}" data-import-tab="${escapeHtml(tab.id)}" type="button" ${count ? "" : "disabled"}>${escapeHtml(tab.label)} <span>${count}</span></button>`;
                    }).join("")}
                </div>
                <label class="import-search">
                    <span>Поиск по вкладке</span>
                    <input id="importPreviewSearch" type="search" value="${escapeHtml(importSearchQuery)}" placeholder="MAT-код, название, категория" autocomplete="off">
                </label>
            </div>
            <div id="importPreviewPanel" class="import-preview-panel">
                ${renderImportTabPanel()}
            </div>
        </section>
    `;
}

function renderImportTabPanel() {
    if (!importPreview) return "";
    if (["priceChanged", "priceIncreased", "priceDecreased", "priceWarnings"].includes(importActiveTab)) return renderPriceChangesTab();
    if (Object.prototype.hasOwnProperty.call(importStructureLabels, importActiveTab)) return renderStructureItemsTab(importActiveTab);
    if (importActiveTab === "criticalErrors") return renderIssuesTab("critical");
    if (importActiveTab === "warnings") return renderIssuesTab("warning");
    if (importActiveTab === "unchanged") return renderSimpleProductsTab("unchanged", "Товаров без изменений нет.");
    if (importActiveTab === "new") return renderNewProductsTab();
    if (importActiveTab === "updated") return renderUpdatedTab();
    if (importActiveTab === "prices") return renderPriceChangesTab();
    if (importActiveTab === "requiresReview") return renderRequiresReviewTab();
    if (importActiveTab === "missingFromFile") return renderMissingFromFileTab();
    if (importActiveTab === "manualOnly") return renderManualOnlyTab();
    if (importActiveTab === "missingCodes") return renderMissingCodesTab();
    if (importActiveTab === "structure") return renderStructureTab();
    if (importActiveTab === "issues") return renderIssuesTab();
    return "";
}

function getImportStructureOptions() {
    return importPreview?.structureOptions || { categories: [], subcategories: [] };
}

function renderSelectOptions(items, selectedId, labelBuilder = item => item.name) {
    return (items || []).map(item => `
        <option value="${escapeHtml(item.id)}" ${Number(selectedId) === Number(item.id) ? "selected" : ""}>${escapeHtml(labelBuilder(item))}</option>
    `).join("");
}

function getStructureResolutionActions(item) {
    const keepCurrent = item.productId ? [["keep_current_structure", "Сохранить текущую структуру CRM"]] : [];
    if (item.conflictType === "missing_category") {
        return [
            ...keepCurrent,
            ["create_category", "Создать категорию"],
            ["map_category", "Связать с категорией CRM"],
            ["exclude", "Исключить из импорта"]
        ];
    }
    return [
        ...keepCurrent,
        ["create_subcategory", "Создать подкатегорию"],
        ["map_subcategory", "Связать с подкатегорией CRM"],
        ["exclude", "Исключить из импорта"]
    ];
}

function renderStructureResolutionControls(item) {
    if (item.reviewReason !== "STRUCTURE_CONFLICT") return "";
    const options = getImportStructureOptions();
    const resolution = item.resolution || {};
    const actions = getStructureResolutionActions(item);
    const selectedAction = resolution.action || actions[0]?.[0] || "exclude";
    const selectedCategoryId = resolution.categoryId || item.structureConflict?.categoryId || options.categories?.[0]?.id || "";
    const selectedSubcategoryId = resolution.subcategoryId || options.subcategories?.find(sub => Number(sub.parentId) === Number(selectedCategoryId))?.id || "";

    return `
        <div class="import-resolution-panel">
            <div class="import-resolution-status ${item.resolved ? "is-resolved" : ""}">
                ${item.resolved ? "Решение сохранено" : "Требуется решение"}
            </div>
            <label>
                <span>Действие</span>
                <select data-import-resolution-action>
                    ${actions.map(([value, label]) => `<option value="${escapeHtml(value)}" ${selectedAction === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
                </select>
            </label>
            <label>
                <span>Категория CRM</span>
                <select data-import-resolution-category>
                    ${renderSelectOptions(options.categories || [], selectedCategoryId)}
                </select>
            </label>
            <label>
                <span>Подкатегория CRM</span>
                <select data-import-resolution-subcategory>
                    ${renderSelectOptions(options.subcategories || [], selectedSubcategoryId, item => `${item.name} · #${item.parentId}`)}
                </select>
            </label>
            <div class="import-resolution-actions">
                <button type="button" data-import-resolution-save data-row-id="${escapeHtml(item.rowId || item.rowNumber)}">
                    ${item.resolved ? "Изменить решение" : "Сохранить решение"}
                </button>
                <button type="button" data-import-resolution-exclude data-row-id="${escapeHtml(item.rowId || item.rowNumber)}">Исключить из импорта</button>
            </div>
        </div>
    `;
}

function renderRequiresReviewTabLegacy() {
    const items = getFilteredImportItems("requiresReview");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Товаров, требующих решения, нет.");
    return `
        <p class="import-tab-note">Эти строки похожи на уже существующие несвязанные товары. Они не создаются автоматически.</p>
        <p class="import-tab-note">Ручное решение будет доступно на следующем этапе.</p>
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <code>${escapeHtml(item.externalId)}</code>
                    ${renderProductMeta(item)}
                    <span class="import-row-number">${escapeHtml(item.reviewReason || "REQUIRES_REVIEW")}</span>
                </div>
                ${item.candidate ? `
                    <dl>
                        <div><dt>Кандидат CRM</dt><dd>${escapeHtml(item.candidate.title)}</dd></div>
                        <div><dt>ID</dt><dd>${escapeHtml(item.candidate.id)}</dd></div>
                        <div><dt>Похожесть</dt><dd>${escapeHtml(item.similarity || "")}</dd></div>
                    </dl>
                ` : ""}
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderRequiresReviewTab() {
    const items = getFilteredImportItems("requiresReview");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Товаров, требующих решения, нет.");
    const structureItems = (importPreview.changes?.requiresReview || []).filter(item => item.reviewReason === "STRUCTURE_CONFLICT");
    const resolvedStructureItems = structureItems.filter(item => item.resolved).length;
    return `
        ${structureItems.length ? `<p class="import-tab-note">Решено ${escapeHtml(resolvedStructureItems)} из ${escapeHtml(structureItems.length)} структурных конфликтов.</p>` : ""}
        <p class="import-tab-note">При связывании с существующим товаром данные товара берутся из Excel, а MAT-код и текущая структура CRM сохраняются, если для них не выбрано отдельное решение.</p>
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <code>${escapeHtml(item.externalId)}</code>
                    ${renderProductMeta(item)}
                    <span class="import-row-number">${escapeHtml(item.reasonLabel || item.reviewReason || "REQUIRES_REVIEW")}</span>
                </div>
                ${item.candidate ? `
                    <dl>
                        <div><dt>Кандидат CRM</dt><dd>${escapeHtml(item.candidate.title)}</dd></div>
                        <div><dt>ID</dt><dd>${escapeHtml(item.candidate.id)}</dd></div>
                        <div><dt>Похожесть</dt><dd>${escapeHtml(item.similarity || "")}</dd></div>
                    </dl>
                ` : ""}
                ${renderStructureResolutionControls(item)}
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderEmptyImportState(message) {
    return `
        <section class="empty-state import-empty">
            <h2>${escapeHtml(message)}</h2>
        </section>
    `;
}

function renderProductMeta(item) {
    return `
        <div class="import-row-meta">
            ${item.rowNumber ? `<span>Строка ${escapeHtml(item.rowNumber)}</span>` : ""}
            ${item.category ? `<span>${escapeHtml(item.category)}</span>` : ""}
            ${item.subcategory ? `<span>${escapeHtml(item.subcategory)}</span>` : ""}
            ${item.productGroup ? `<span>${escapeHtml(item.productGroup)}</span>` : ""}
        </div>
    `;
}

function renderNewProductsTab() {
    const items = getFilteredImportItems("new");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Новых товаров нет.");
    return `
        ${visibleItems.map(item => `
        <article class="import-preview-row">
            <div>
                <strong>${escapeHtml(item.title)}</strong>
                <code>${escapeHtml(item.externalId)}</code>
                ${renderProductMeta(item)}
                <span class="import-row-number">${escapeHtml(item.reasonLabel || "MAT-код не найден в CRM")}</span>
            </div>
            <dl>
                <div><dt>Цена</dt><dd>${item.price === null ? "По запросу" : escapeHtml(item.price)}</dd></div>
                <div><dt>Вес</dt><dd>${escapeHtml(item.weight)}</dd></div>
                <div><dt>Ед.</dt><dd>${escapeHtml(item.unit)}</dd></div>
            </dl>
        </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderUpdatedTab() {
    const items = getFilteredImportItems("updated");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Изменений не найдено.");
    return `
        ${visibleItems.map(item => `
        <article class="import-preview-row import-updated-row">
            <div>
                <strong>${escapeHtml(item.title)}</strong>
                <code>${escapeHtml(item.externalId)}</code>
                ${item.rowNumber ? `<span class="import-row-number">Строка ${escapeHtml(item.rowNumber)}</span>` : ""}
                ${item.structureNote ? `<p class="import-tab-note">${escapeHtml(item.structureNote)}</p>` : ""}
            </div>
            <div class="import-diff-list">
                ${(item.changes || []).map(change => `
                    <div class="import-diff">
                        <span>${escapeHtml(importFieldLabels[change.field] || change.field)}</span>
                        <del>${escapeHtml(change.currentValue ?? "пусто")}</del>
                        <ins>${escapeHtml(change.incomingValue ?? "пусто")}</ins>
                    </div>
                `).join("")}
            </div>
        </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function filterPriceItems(items) {
    const query = normalizeImportSearch(importSearchQuery);
    return items.filter(item => {
        const matchesQuery = !query || getImportSearchText(item).includes(query);
        if (!matchesQuery) return false;
        if (importPriceFilter === "changed") return ["increased", "decreased", "newPrice"].includes(item.status);
        if (importPriceFilter === "increased") return item.status === "increased";
        if (importPriceFilter === "decreased") return item.status === "decreased";
        if (importPriceFilter === "newPrice") return item.status === "newPrice";
        if (importPriceFilter === "warnings") return (item.warningCodes || []).length > 0;
        if (importPriceFilter === "errors") return ["invalid", "productNotFound"].includes(item.status) || (item.warningCodes || []).includes("DUPLICATE_PRICE_CONFLICT");
        if (importPriceFilter === "unchanged") return item.status === "unchanged";
        return true;
    });
}

function renderPriceChangesTab() {
    const priceChanges = getPriceChanges();
    const filteredItems = filterPriceItems(priceChanges.items || []);
    const visibleItems = getVisibleImportItems(filteredItems);
    const filterOptions = [
        { id: "changed", label: "Все изменения" },
        { id: "increased", label: "Повышение" },
        { id: "decreased", label: "Снижение" },
        { id: "newPrice", label: "Новая цена" },
        { id: "warnings", label: "Риски" },
        { id: "errors", label: "Ошибки" },
        { id: "unchanged", label: "Без изменений" }
    ];

    if (!priceChanges.totalChecked && !(priceChanges.items || []).length) {
        return renderEmptyImportState("Данных для анализа цен нет.");
    }

    return `
        <section class="import-price-preview">
            <div class="import-price-summary">
                <div><span>Проверено</span><strong>${escapeHtml(priceChanges.totalChecked || 0)}</strong></div>
                <div><span>Изменятся</span><strong>${escapeHtml(priceChanges.changed || 0)}</strong></div>
                <div><span>Повышение</span><strong>${escapeHtml(priceChanges.increased || 0)}</strong></div>
                <div><span>Снижение</span><strong>${escapeHtml(priceChanges.decreased || 0)}</strong></div>
                <div><span>Без изменений</span><strong>${escapeHtml(priceChanges.unchanged || 0)}</strong></div>
                <div><span>Новая цена</span><strong>${escapeHtml(priceChanges.newPrice || 0)}</strong></div>
                <div><span>Нулевая</span><strong>${escapeHtml(priceChanges.zeroPrice || 0)}</strong></div>
                <div><span>Ошибки</span><strong>${escapeHtml(priceChanges.invalid || 0)}</strong></div>
            </div>
            ${renderPriceWarnings(priceChanges)}
            <div class="import-price-filters">
                ${filterOptions.map(option => `
                    <button class="${importPriceFilter === option.id ? "active" : ""}" data-price-filter="${escapeHtml(option.id)}" type="button">
                        ${escapeHtml(option.label)}
                    </button>
                `).join("")}
            </div>
            ${visibleItems.length ? renderPriceTable(visibleItems) : renderEmptyImportState("По выбранному фильтру строк нет.")}
            ${renderImportLoadMore(filteredItems.length)}
        </section>
    `;
}

function renderPriceWarnings(priceChanges) {
    const warnings = priceChanges.warningSummary || [];
    if (!warnings.length) return "";
    return `
        <div class="import-price-warnings">
            ${warnings.map(item => `
                <p>${escapeHtml(item.label || item.code)}: ${escapeHtml(item.count || 0)}</p>
            `).join("")}
        </div>
    `;
}

function renderPriceTable(items) {
    return `
        <div class="import-price-table-wrap">
            <table class="import-price-table">
                <thead>
                    <tr>
                        <th>Строка</th>
                        <th>MAT</th>
                        <th>Товар</th>
                        <th>Старая</th>
                        <th>Новая</th>
                        <th>Разница</th>
                        <th>%</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr class="import-price-row import-price-${escapeHtml(item.status || "unknown")}">
                            <td>${escapeHtml(item.rowNumber || "")}</td>
                            <td><code>${escapeHtml(item.productCode || "")}</code></td>
                            <td>
                                <strong>${escapeHtml(item.productName || "")}</strong>
                                ${(item.warningCodes || []).length ? `<span>${escapeHtml((item.warningCodes || []).join(", "))}</span>` : ""}
                            </td>
                            <td>${escapeHtml(formatImportPrice(item.oldPrice))}</td>
                            <td>${escapeHtml(formatImportPrice(item.newPrice))}</td>
                            <td>${escapeHtml(formatImportPrice(item.difference))}</td>
                            <td>${escapeHtml(formatImportPercent(item.differencePercent))}</td>
                            <td>${escapeHtml(getPriceStatusLabel(item.status))}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderMissingFromFileTab() {
    const items = getFilteredImportItems("missingFromFile");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Отсутствующих в файле товаров нет.");
    return `
        <p class="import-tab-note">На следующем этапе можно будет выбрать: скрыть, оставить без изменений или обработать вручную.</p>
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <code>${escapeHtml(item.externalId)}</code>
                    ${renderProductMeta(item)}
                </div>
                <span class="import-pill">${escapeHtml(item.source || "excel")}</span>
                <span class="import-pill muted">${escapeHtml(item.status || "")}</span>
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderManualOnlyTab() {
    const items = getFilteredImportItems("manualOnly");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Товаров только в CRM нет.");
    return `
        <p class="import-tab-note">Эти товары созданы вручную в CRM и отсутствуют в Excel. Они не будут автоматически скрыты.</p>
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <code>${escapeHtml(item.externalId)}</code>
                    ${renderProductMeta(item)}
                </div>
                <span class="import-pill">manual</span>
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderMissingCodesTab() {
    const items = getFilteredImportItems("missingCodes");
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState("Товаров без MAT-кода нет.");
    return `
        <p class="import-tab-note">Код будет предложен автоматически, но на этом этапе файл и база не изменяются.</p>
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <span class="import-row-number">Строка ${escapeHtml(item.rowNumber)}</span>
                    ${renderProductMeta(item)}
                </div>
                <code>${escapeHtml(item.suggestedExternalId)}</code>
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderSimpleProductsTab(key, emptyText) {
    const items = getFilteredImportItems(key);
    const visibleItems = getVisibleImportItems(items);
    if (!items.length) return renderEmptyImportState(emptyText);
    return `
        ${visibleItems.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title || item.name || item.productName || "Товар")}</strong>
                    ${item.externalId || item.productCode ? `<code>${escapeHtml(item.externalId || item.productCode)}</code>` : ""}
                    ${renderProductMeta(item)}
                </div>
                ${item.status ? `<span class="import-pill muted">${escapeHtml(item.status)}</span>` : ""}
            </article>
        `).join("")}
        ${renderImportLoadMore(items.length)}
    `;
}

function renderStructureItemsTab(key) {
    const items = getFilteredImportItems(key);
    const visibleItems = getVisibleImportItems(items);
    const title = importStructureLabels[key] || "Структура";
    if (!items.length) return renderEmptyImportState(`${title}: строк нет.`);
    return `
        <section class="import-structure-list import-structure-list-wide">
            <h3>${escapeHtml(title)}</h3>
            <ul>
                ${visibleItems.map(item => `<li>${escapeHtml(formatStructureItem(key, item))}</li>`).join("")}
            </ul>
        </section>
        ${renderImportLoadMore(items.length)}
    `;
}

function formatStructureItem(key, item) {
    if (key === "newCategories") return `${item.externalCode || "CAT будет назначен"} · ${item.name || ""}`;
    if (key === "newSubcategories") return `${item.externalCode || "SUB будет назначен"} · ${item.category || "Без категории"} / ${item.name || ""}`;
    if (key === "renamedCategories" || key === "renamedSubcategories") return `${item.externalCode || ""}: ${item.currentName || ""} -> ${item.incomingName || ""}`;
    if (key === "assignedCategoryCodes") return `${item.name || ""} · ${item.externalCode || ""} · строка ${item.rowNumber || ""}`;
    if (key === "assignedSubcategoryCodes") return `${item.category || "Без категории"} / ${item.name || ""} · ${item.externalCode || ""} · строка ${item.rowNumber || ""}`;
    if (key === "missingCategoryCodes") return `${item.name || ""} · строка ${item.rowNumber || ""}`;
    if (key === "missingSubcategoryCodes") return `${item.category || "Без категории"} / ${item.name || ""} · строка ${item.rowNumber || ""}`;
    if (key === "newGroups") return `${item.category || "Без категории"} / ${item.subcategory || "Без подкатегории"} / ${item.name || ""}`;
    return item.name || item.title || JSON.stringify(item);
}

function renderStructureTab() {
    const categories = importPreview.changes?.newCategories || [];
    const subcategories = importPreview.changes?.newSubcategories || [];
    const renamedCategories = importPreview.changes?.renamedCategories || [];
    const renamedSubcategories = importPreview.changes?.renamedSubcategories || [];
    const assignedCategoryCodes = importPreview.changes?.assignedCategoryCodes || [];
    const assignedSubcategoryCodes = importPreview.changes?.assignedSubcategoryCodes || [];
    const missingCategoryCodes = importPreview.changes?.missingCategoryCodes || [];
    const missingSubcategoryCodes = importPreview.changes?.missingSubcategoryCodes || [];
    const groups = importPreview.changes?.newGroups || [];
    if (!categories.length && !subcategories.length && !renamedCategories.length && !renamedSubcategories.length && !assignedCategoryCodes.length && !assignedSubcategoryCodes.length && !missingCategoryCodes.length && !missingSubcategoryCodes.length && !groups.length) {
        return renderEmptyImportState("Новых элементов структуры нет.");
    }

    return `
        <div class="import-structure-grid">
            ${renderStructureList("Новые категории", categories, item => `${item.externalCode || "CAT будет назначен"} · ${item.name}`)}
            ${renderStructureList("Новые подкатегории", subcategories, item => `${item.externalCode || "SUB будет назначен"} · ${item.category || "Без категории"} / ${item.name}`)}
            ${renderStructureList("Переименованные категории", renamedCategories, item => `${item.externalCode}: ${item.currentName} -> ${item.incomingName}`)}
            ${renderStructureList("Переименованные подкатегории", renamedSubcategories, item => `${item.externalCode}: ${item.currentName} -> ${item.incomingName}`)}
            ${renderStructureList("Будет записано CAT", assignedCategoryCodes, item => `${item.name} · ${item.externalCode} · строка ${item.rowNumber}`)}
            ${renderStructureList("Будет записано SUB", assignedSubcategoryCodes, item => `${item.category || "Без категории"} / ${item.name} · ${item.externalCode} · строка ${item.rowNumber}`)}
            ${renderStructureList("Не удалось определить CAT", missingCategoryCodes, item => `${item.name} · строка ${item.rowNumber}`)}
            ${renderStructureList("Не удалось определить SUB", missingSubcategoryCodes, item => `${item.category || "Без категории"} / ${item.name} · строка ${item.rowNumber}`)}
            ${renderStructureList("Новые группы", groups, item => `${item.category || "Без категории"} / ${item.subcategory || "Без подкатегории"} / ${item.name}`)}
        </div>
    `;
}

function renderStructureList(title, items, getLabel) {
    return `
        <section class="import-structure-list">
            <h3>${escapeHtml(title)}</h3>
            ${items.length ? `
                <ul>${items.map(item => `<li>${escapeHtml(getLabel(item))}</li>`).join("")}</ul>
            ` : `<p>Нет.</p>`}
        </section>
    `;
}

function renderIssuesTab(type = "all") {
    const errors = (importPreview.errors || []).filter(item => getImportSearchText(item).includes(normalizeImportSearch(importSearchQuery)));
    const warnings = (importPreview.warnings || []).filter(item => getImportSearchText(item).includes(normalizeImportSearch(importSearchQuery)));
    if (type === "critical") return renderIssueList(errors, "Критических ошибок нет.");
    if (type === "warning") return renderIssueList(warnings, "Предупреждений нет.");
    if (!errors.length && !warnings.length) return renderEmptyImportState("Критических ошибок нет.");
    return `
        <div class="import-issues-grid">
            <section>
                <h3>Критические ошибки</h3>
                ${renderIssueList(errors, "Критических ошибок нет.")}
            </section>
            <section>
                <h3>Предупреждения</h3>
                ${renderIssueList(warnings, "Предупреждений нет.")}
            </section>
        </div>
    `;
}

function renderIssueList(items, emptyText) {
    if (!items.length) return `<p class="import-tab-note">${escapeHtml(emptyText)}</p>`;
    const visibleItems = getVisibleImportItems(items);
    return visibleItems.map(item => `
        <article class="import-issue ${item.severity === "critical" ? "critical" : "warning"}">
            <strong>${escapeHtml(item.code || item.severity)}</strong>
            <p>${escapeHtml(item.message || "Проверьте строку Excel.")}</p>
            <div class="import-row-meta">
                ${item.rowNumber ? `<span>Строка ${escapeHtml(item.rowNumber)}</span>` : ""}
                ${item.externalId ? `<span>${escapeHtml(item.externalId)}</span>` : ""}
                ${item.title ? `<span>${escapeHtml(item.title)}</span>` : ""}
            </div>
        </article>
    `).join("") + renderImportLoadMore(items.length);
}

function renderImportView(error = "") {
    if (!importView) return;
    if (currentUser?.role !== "admin") {
        importView.innerHTML = "";
        return;
    }

    importView.innerHTML = `
        <header class="crm-topbar import-topbar">
            <div>
                <h1>Импорт каталога</h1>
                <p>Загрузите актуальный Excel-файл для проверки изменений перед обновлением каталога.</p>
            </div>
        </header>
        <section class="import-layout">
            <aside class="import-side">
                ${renderImportInfoList()}
                ${renderImportUpload(error)}
            </aside>
            <main class="import-main">
                ${importLoading ? renderCrmLoader("Анализируем файл и сравниваем каталог...") : ""}
                ${importApplying ? renderCrmLoader("Применяем импорт, создаем backup и Excel-копию...") : ""}
                ${renderImportStatus()}
                ${renderApplyActions()}
                ${renderApplyResult()}
                ${renderImportSummary()}
                ${renderImportTabs()}
                ${!importPreview && !importLoading && !importApplying && !importApplyResult ? renderEmptyImportState("Выберите Excel-файл, чтобы увидеть предварительный просмотр.") : ""}
            </main>
        </section>
    `;
}

function updateImportPreviewPanel() {
    const panel = importView?.querySelector("#importPreviewPanel");
    if (panel) panel.innerHTML = renderImportTabPanel();
}

async function saveImportStructureResolution(button, forcedAction = "") {
    if (!importPreview?.token || !button) return;
    const row = button.closest(".import-preview-row");
    if (!row) return;

    const action = forcedAction || row.querySelector("[data-import-resolution-action]")?.value || "";
    const payload = {
        rowId: button.dataset.rowId || "",
        action,
        categoryId: Number(row.querySelector("[data-import-resolution-category]")?.value || 0) || null,
        subcategoryId: Number(row.querySelector("[data-import-resolution-subcategory]")?.value || 0) || null
    };

    button.disabled = true;
    try {
        const result = await CrmApi.patch(`/api/products/import/preview/${importPreview.token}/resolutions`, {
            resolutions: [payload]
        });
        if (result?.data?.preview) {
            importPreview = result.data.preview;
        }
        importActiveTab = "requiresReview";
        importVisibleCount = Math.max(importVisibleCount, IMPORT_RESULT_PAGE_SIZE);
        window.CrmToast?.success("Решение сохранено.");
        renderImportView();
    } catch (error) {
        notifyError(error, "Не удалось сохранить решение импорта.");
        button.disabled = false;
    }
}

importView?.addEventListener("change", event => {
    const input = event.target.closest("#catalogImportFile");
    if (!input) return;
    setImportFile(input.files?.[0] || null);
});

importView?.addEventListener("dragover", event => {
    if (!event.target.closest("[data-import-dropzone]")) return;
    event.preventDefault();
    event.target.closest("[data-import-dropzone]")?.classList.add("is-dragover");
});

importView?.addEventListener("dragleave", event => {
    event.target.closest("[data-import-dropzone]")?.classList.remove("is-dragover");
});

importView?.addEventListener("drop", event => {
    const dropzone = event.target.closest("[data-import-dropzone]");
    if (!dropzone) return;
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    setImportFile(event.dataTransfer?.files?.[0] || null);
});

importView?.addEventListener("click", event => {
    const submitButton = event.target.closest(".import-preview-submit");
    if (submitButton) {
        submitImportPreview();
        return;
    }

    const rerunButton = event.target.closest(".import-rerun");
    if (rerunButton) {
        submitImportPreview();
        return;
    }

    const otherButton = event.target.closest(".import-select-other");
    if (otherButton) {
        resetImportPreview({ clearFile: true });
        return;
    }

    const applyButton = event.target.closest(".import-apply-submit");
    if (applyButton) {
        submitImportApply();
        return;
    }

    const copyButton = event.target.closest(".import-download-copy");
    if (copyButton && importApplyResult?.excelCopyUrl) {
        CrmApi.download(importApplyResult.excelCopyUrl).catch(error => {
            notifyError(error, "Не удалось скачать обновленный Excel.");
        });
        return;
    }

    const summaryButton = event.target.closest("button[data-summary-key]");
    if (summaryButton) {
        activateImportSummary(summaryButton.dataset.summaryKey);
        renderImportView();
        return;
    }

    const summaryToggle = event.target.closest("button[data-summary-toggle]");
    if (summaryToggle) {
        importShowAllSummary = !importShowAllSummary;
        renderImportView();
        return;
    }

    const priceFilterButton = event.target.closest("button[data-price-filter]");
    if (priceFilterButton) {
        importPriceFilter = priceFilterButton.dataset.priceFilter || "changed";
        importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
        importActiveTab = importPriceSummaryCardByFilter[importPriceFilter] || "priceChanged";
        renderImportView();
        return;
    }

    const resolutionSaveButton = event.target.closest("button[data-import-resolution-save]");
    if (resolutionSaveButton) {
        saveImportStructureResolution(resolutionSaveButton);
        return;
    }

    const resolutionExcludeButton = event.target.closest("button[data-import-resolution-exclude]");
    if (resolutionExcludeButton) {
        saveImportStructureResolution(resolutionExcludeButton, "exclude");
        return;
    }

    const loadMoreButton = event.target.closest("button[data-import-load-more]");
    if (loadMoreButton) {
        importVisibleCount += IMPORT_RESULT_PAGE_SIZE;
        updateImportPreviewPanel();
    }
});

importView?.addEventListener("input", event => {
    const searchInput = event.target.closest("#importPreviewSearch");
    if (!searchInput) return;
    importSearchQuery = searchInput.value;
    importVisibleCount = IMPORT_RESULT_PAGE_SIZE;
    window.clearTimeout(importSearchTimer);
    importSearchTimer = window.setTimeout(updateImportPreviewPanel, 200);
});
