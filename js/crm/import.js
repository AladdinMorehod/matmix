// Catalog import preview UI. This module never applies changes to the catalog.
let importSelectedFile = null;
let importPreview = null;
let importLoading = false;
let importApplying = false;
let importApplyResult = null;
let importActiveTab = "new";
let importSearchQuery = "";
let importSearchTimer = null;

const IMPORT_MAX_FILE_SIZE = 30 * 1024 * 1024;

const importTabs = [
    { id: "new", label: "Новые" },
    { id: "updated", label: "Обновления" },
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
    { key: "criticalErrors", label: "Критические ошибки", primary: true },
    { key: "unchanged", label: "Без изменений" },
    { key: "manualOnly", label: "Только в CRM" },
    { key: "newCategories", label: "Новые категории" },
    { key: "newSubcategories", label: "Новые подкатегории" },
    { key: "newGroups", label: "Новые группы" },
    { key: "warnings", label: "Предупреждения" }
];

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
    if (key === "structure") {
        return [
            ...(importPreview.changes?.newCategories || []),
            ...(importPreview.changes?.newSubcategories || []),
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
            + Number(importPreview.summary?.newGroups || 0);
    }
    if (tabId === "issues") {
        return Number(importPreview.summary?.criticalErrors || 0)
            + Number(importPreview.summary?.warnings || 0);
    }
    return Number(importPreview.summary?.[tabId] || 0);
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
        importActiveTab = importTabs.find(tab => getImportTabCount(tab.id) > 0)?.id || "new";
        importSearchQuery = "";
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
    if (!importPreview || !importPreview.canImport) return "";
    return `
        <section class="import-apply-panel">
            <div>
                <strong>Preview готов к применению</strong>
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
    return `
        <section class="import-summary" aria-label="Сводка preview">
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
    if (importActiveTab === "new") return renderNewProductsTab();
    if (importActiveTab === "updated") return renderUpdatedTab();
    if (importActiveTab === "requiresReview") return renderRequiresReviewTab();
    if (importActiveTab === "missingFromFile") return renderMissingFromFileTab();
    if (importActiveTab === "manualOnly") return renderManualOnlyTab();
    if (importActiveTab === "missingCodes") return renderMissingCodesTab();
    if (importActiveTab === "structure") return renderStructureTab();
    if (importActiveTab === "issues") return renderIssuesTab();
    return "";
}

function renderRequiresReviewTab() {
    const items = getFilteredImportItems("requiresReview");
    if (!items.length) return renderEmptyImportState("Товаров, требующих решения, нет.");
    return `
        <p class="import-tab-note">Эти строки похожи на уже существующие несвязанные товары. Они не создаются автоматически.</p>
        ${items.map(item => `
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
    if (!items.length) return renderEmptyImportState("Новых товаров нет.");
    return items.map(item => `
        <article class="import-preview-row">
            <div>
                <strong>${escapeHtml(item.title)}</strong>
                <code>${escapeHtml(item.externalId)}</code>
                ${renderProductMeta(item)}
            </div>
            <dl>
                <div><dt>Цена</dt><dd>${item.price === null ? "По запросу" : escapeHtml(item.price)}</dd></div>
                <div><dt>Вес</dt><dd>${escapeHtml(item.weight)}</dd></div>
                <div><dt>Ед.</dt><dd>${escapeHtml(item.unit)}</dd></div>
            </dl>
        </article>
    `).join("");
}

function renderUpdatedTab() {
    const items = getFilteredImportItems("updated");
    if (!items.length) return renderEmptyImportState("Изменений не найдено.");
    return items.map(item => `
        <article class="import-preview-row import-updated-row">
            <div>
                <strong>${escapeHtml(item.title)}</strong>
                <code>${escapeHtml(item.externalId)}</code>
                ${item.rowNumber ? `<span class="import-row-number">Строка ${escapeHtml(item.rowNumber)}</span>` : ""}
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
    `).join("");
}

function renderMissingFromFileTab() {
    const items = getFilteredImportItems("missingFromFile");
    if (!items.length) return renderEmptyImportState("Отсутствующих в файле товаров нет.");
    return `
        <p class="import-tab-note">На следующем этапе можно будет выбрать: скрыть, оставить без изменений или обработать вручную.</p>
        ${items.map(item => `
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
    `;
}

function renderManualOnlyTab() {
    const items = getFilteredImportItems("manualOnly");
    if (!items.length) return renderEmptyImportState("Товаров только в CRM нет.");
    return `
        <p class="import-tab-note">Эти товары созданы вручную в CRM и отсутствуют в Excel. Они не будут автоматически скрыты.</p>
        ${items.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <code>${escapeHtml(item.externalId)}</code>
                    ${renderProductMeta(item)}
                </div>
                <span class="import-pill">manual</span>
            </article>
        `).join("")}
    `;
}

function renderMissingCodesTab() {
    const items = getFilteredImportItems("missingCodes");
    if (!items.length) return renderEmptyImportState("Товаров без MAT-кода нет.");
    return `
        <p class="import-tab-note">Код будет предложен автоматически, но на этом этапе файл и база не изменяются.</p>
        ${items.map(item => `
            <article class="import-preview-row">
                <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    <span class="import-row-number">Строка ${escapeHtml(item.rowNumber)}</span>
                    ${renderProductMeta(item)}
                </div>
                <code>${escapeHtml(item.suggestedExternalId)}</code>
            </article>
        `).join("")}
    `;
}

function renderStructureTab() {
    const categories = importPreview.changes?.newCategories || [];
    const subcategories = importPreview.changes?.newSubcategories || [];
    const groups = importPreview.changes?.newGroups || [];
    if (!categories.length && !subcategories.length && !groups.length) {
        return renderEmptyImportState("Новых элементов структуры нет.");
    }

    return `
        <div class="import-structure-grid">
            ${renderStructureList("Новые категории", categories, item => item.name)}
            ${renderStructureList("Новые подкатегории", subcategories, item => `${item.category || "Без категории"} / ${item.name}`)}
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

function renderIssuesTab() {
    const errors = (importPreview.errors || []).filter(item => getImportSearchText(item).includes(normalizeImportSearch(importSearchQuery)));
    const warnings = (importPreview.warnings || []).filter(item => getImportSearchText(item).includes(normalizeImportSearch(importSearchQuery)));
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
    return items.map(item => `
        <article class="import-issue ${item.severity === "critical" ? "critical" : "warning"}">
            <strong>${escapeHtml(item.code || item.severity)}</strong>
            <p>${escapeHtml(item.message || "Проверьте строку Excel.")}</p>
            <div class="import-row-meta">
                ${item.rowNumber ? `<span>Строка ${escapeHtml(item.rowNumber)}</span>` : ""}
                ${item.externalId ? `<span>${escapeHtml(item.externalId)}</span>` : ""}
                ${item.title ? `<span>${escapeHtml(item.title)}</span>` : ""}
            </div>
        </article>
    `).join("");
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

    const tabButton = event.target.closest("button[data-import-tab]");
    if (tabButton) {
        importActiveTab = tabButton.dataset.importTab;
        importSearchQuery = "";
        renderImportView();
    }
});

importView?.addEventListener("input", event => {
    const searchInput = event.target.closest("#importPreviewSearch");
    if (!searchInput) return;
    importSearchQuery = searchInput.value;
    window.clearTimeout(importSearchTimer);
    importSearchTimer = window.setTimeout(updateImportPreviewPanel, 200);
});
