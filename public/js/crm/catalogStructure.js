let catalogStructureAudit = null;
let catalogStructureLoading = false;
let catalogStructureQuery = "";
let catalogStructureFilter = "all";
let structureDetailSelection = null;
let structureDetailProducts = [];
let structureDetailProductsPagination = normalizePaginationMeta();
let structureDetailProductsLoading = false;
let structureDetailProductsAppendLoading = false;
let structureDetailProductsSearch = "";
let structureDetailProductsStatus = "all";
let structureDetailProductsRequestId = 0;
const expandedStructureCategories = new Set();
const selectedStructureSubcategories = new Set();

function canEditCatalogStructure() {
    return currentUser?.role === "admin";
}

function normalizeStructureUiText(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
}

function getStructureIssueLabel(code) {
    const labels = {
        CATEGORY_HAS_PARENT: "Категория с parent_id",
        EMPTY_CATEGORY: "Пустая категория",
        EMPTY_SUBCATEGORY: "Пустая подкатегория",
        SUBCATEGORY_WITHOUT_PARENT: "Без родителя",
        SUBCATEGORY_IN_INACTIVE_CATEGORY: "В неактивной категории",
        DUPLICATE_CATEGORY_NAME: "Дубль категории",
        DUPLICATE_SUBCATEGORY_NAME: "Дубль подкатегории",
        SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES: "Одинаковые SUB",
        PRODUCTS_WITHOUT_STRUCTURE: "Товары без структуры"
    };
    return labels[code] || code || "Проблема";
}

function structureHasIssue(item) {
    return (item.issues || []).some(issue => issue.severity !== "info");
}

function getStructureIssueMessage(issue = {}) {
    return issue.messageRu || issue.message || getStructureIssueLabel(issue.code);
}

function resetStructureDetailProductsState() {
    structureDetailProducts = [];
    structureDetailProductsPagination = normalizePaginationMeta();
    structureDetailProductsLoading = false;
    structureDetailProductsAppendLoading = false;
    structureDetailProductsSearch = "";
    structureDetailProductsStatus = "all";
}

function getAllStructureSubcategories() {
    return (catalogStructureAudit?.categories || [])
        .flatMap(category => (category.subcategories || []).map(subcategory => ({
            ...subcategory,
            parentName: subcategory.parentName || category.name,
            parentId: subcategory.parentId || category.id
        })));
}

function findStructureNode(type, id) {
    const normalizedId = String(id || "");
    if (type === "category") {
        return (catalogStructureAudit?.categories || []).find(category => String(category.id) === normalizedId) || null;
    }
    if (type === "subcategory") {
        return getAllStructureSubcategories().find(subcategory => String(subcategory.id) === normalizedId) || null;
    }
    if (type === "withoutStructure") {
        return {
            id: "withoutStructure",
            type: "withoutStructure",
            name: "Товары без структуры",
            issues: (catalogStructureAudit?.issues || []).filter(issue => issue.code === "PRODUCTS_WITHOUT_STRUCTURE"),
            productCount: catalogStructureAudit?.summary?.productsWithoutStructure || 0
        };
    }
    return null;
}

function structureNodeMatchesQuery(node) {
    const query = normalizeStructureUiText(catalogStructureQuery);
    if (!query) return true;
    return normalizeStructureUiText([
        node.name,
        node.parentName,
        node.code,
        ...(node.issues || []).map(issue => `${issue.code} ${getStructureIssueMessage(issue)}`)
    ].join(" ")).includes(query);
}

function structureMatchesFilter(category) {
    const query = normalizeStructureUiText(catalogStructureQuery);
    const categoryText = normalizeStructureUiText([
        category.name,
        ...(category.subcategories || []).map(item => item.name)
    ].join(" "));
    if (query && !categoryText.includes(query)) return false;

    if (catalogStructureFilter === "issues") {
        return structureHasIssue(category) || (category.subcategories || []).some(structureHasIssue);
    }
    if (catalogStructureFilter === "subcategories") {
        return (category.subcategories || []).some(structureNodeMatchesQuery);
    }
    if (catalogStructureFilter === "withoutStructure") {
        return false;
    }
    if (catalogStructureFilter === "emptyCategories") return Number(category.productCount || 0) === 0;
    if (catalogStructureFilter === "emptySubcategories") {
        return (category.subcategories || []).some(item => Number(item.productCount || 0) === 0);
    }
    if (catalogStructureFilter === "withoutParent") {
        return (category.subcategories || []).some(item => !item.parentId);
    }
    if (catalogStructureFilter === "inactive") {
        return !category.isActive || (category.subcategories || []).some(item => !item.isActive);
    }
    if (catalogStructureFilter === "duplicates") {
        return (category.issues || []).some(issue => issue.code.includes("DUPLICATE"))
            || (category.subcategories || []).some(item => (item.issues || []).some(issue => issue.code.includes("DUPLICATE") || issue.code === "SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES"));
    }
    return true;
}

function getVisibleStructureCategories() {
    return (catalogStructureAudit?.categories || []).filter(structureMatchesFilter);
}

function renderStructureIssuePills(issues = []) {
    if (!issues.length) return "";
    return `
        <div class="structure-issues">
            ${issues.slice(0, 4).map(issue => `
                <span class="structure-issue ${escapeHtml(issue.severity)}">${escapeHtml(getStructureIssueLabel(issue.code))}</span>
            `).join("")}
            ${issues.length > 4 ? `<span class="structure-issue info">+${escapeHtml(issues.length - 4)}</span>` : ""}
        </div>
    `;
}

function renderCatalogStructureStats() {
    const summary = catalogStructureAudit?.summary || {};
    const stats = [
        ["Категории", summary.categories || 0],
        ["Подкатегории", summary.subcategories || 0],
        ["Товары без структуры", summary.productsWithoutStructure || 0],
        ["Проблемы", summary.issues || 0],
        ["Дубли", summary.duplicateIssues || 0],
        ["Неактивные", summary.inactiveItems || 0]
    ];
    return `
        <section class="dashboard-stats structure-stats">
            ${stats.map(([label, value]) => `
                <article class="dashboard-stat">
                    <span>${escapeHtml(label)}</span>
                    <strong>${escapeHtml(value)}</strong>
                </article>
            `).join("")}
        </section>
    `;
}

function renderCatalogStructureFilterStats() {
    const summary = catalogStructureAudit?.summary || {};
    const stats = [
        ["categories", "Категории", summary.categories || 0],
        ["subcategories", "Подкатегории", summary.subcategories || 0],
        ["withoutStructure", "Товары без структуры", summary.productsWithoutStructure || 0],
        ["issues", "Проблемы", summary.issues || 0],
        ["duplicates", "Дубли", summary.duplicateIssues || 0],
        ["inactive", "Неактивные", summary.inactiveItems || 0]
    ];
    return `
        <section class="dashboard-stats structure-stats">
            ${stats.map(([filter, label, value]) => {
                const active = catalogStructureFilter === filter || (filter === "categories" && catalogStructureFilter === "all");
                return `
                    <button class="dashboard-stat structure-stat-filter${active ? " active" : ""}" type="button" data-structure-summary-filter="${escapeHtml(filter)}" aria-pressed="${active ? "true" : "false"}">
                        <span>${escapeHtml(label)}</span>
                        <strong>${escapeHtml(value)}</strong>
                    </button>
                `;
            }).join("")}
        </section>
    `;
}

function renderCatalogStructureCategory(category, rootCategories = []) {
    const isExpanded = expandedStructureCategories.has(String(category.id));
    const subcategories = category.subcategories || [];
    const rootIndex = rootCategories.findIndex(item => Number(item.id) === Number(category.id));
    const canReorder = canEditCatalogStructure() && rootIndex >= 0;
    return `
        <article class="structure-category">
            <div class="structure-category-header">
                <button class="structure-toggle-button" type="button" data-structure-toggle="${escapeHtml(category.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
                    <span>${isExpanded ? "−" : "+"}</span>
                    <strong>${escapeHtml(category.name)}</strong>
                    <small>${escapeHtml(subcategories.length)} SUB · ${escapeHtml(category.productCount || 0)} товаров</small>
                    ${renderStructureIssuePills(category.issues || [])}
                </button>
                <button class="structure-node-detail" type="button" data-structure-node-type="category" data-structure-node-id="${escapeHtml(category.id)}">Детали</button>
                ${canReorder ? `
                    <div class="structure-order-actions">
                        <button type="button" data-structure-category-order="${escapeHtml(category.id)}" data-target-index="${escapeHtml(rootIndex - 1)}" ${rootIndex <= 0 ? "disabled" : ""}>Поднять</button>
                        <button type="button" data-structure-category-order="${escapeHtml(category.id)}" data-target-index="${escapeHtml(rootIndex + 1)}" ${rootIndex >= rootCategories.length - 1 ? "disabled" : ""}>Опустить</button>
                    </div>
                ` : ""}
            </div>
            ${isExpanded ? `
                <div class="structure-subcategory-list">
                    ${subcategories.length ? subcategories.map(renderCatalogStructureSubcategory).join("") : `<p class="settings-muted">Подкатегорий нет.</p>`}
                </div>
            ` : ""}
        </article>
    `;
}

function renderCatalogStructureSubcategory(subcategory) {
    const isSelected = selectedStructureSubcategories.has(String(subcategory.id));
    return `
        <label class="structure-subcategory">
            ${canEditCatalogStructure() ? `<input type="checkbox" data-structure-subcategory-id="${escapeHtml(subcategory.id)}" ${isSelected ? "checked" : ""}>` : ""}
            <span>
                <strong>${escapeHtml(subcategory.name)}</strong>
                <small>${escapeHtml(subcategory.parentName || "Без родителя")} · ${escapeHtml(subcategory.productCount || 0)} товаров · sort ${escapeHtml(subcategory.sortOrder || 0)}</small>
                ${renderStructureIssuePills(subcategory.issues || [])}
            </span>
            <button class="structure-node-detail" type="button" data-structure-node-type="subcategory" data-structure-node-id="${escapeHtml(subcategory.id)}">Детали</button>
        </label>
    `;
}

function renderStructureSubcategoryList() {
    const items = getAllStructureSubcategories()
        .filter(structureNodeMatchesQuery)
        .filter(subcategory => {
            if (catalogStructureFilter === "issues") return structureHasIssue(subcategory);
            if (catalogStructureFilter === "duplicates") return (subcategory.issues || []).some(issue => issue.code.includes("DUPLICATE") || issue.code === "SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES");
            if (catalogStructureFilter === "inactive") return !subcategory.isActive;
            return true;
        });
    if (!items.length) {
        return `<section class="empty-state"><h2>Подкатегории не найдены</h2><p>Измените поиск или фильтр.</p></section>`;
    }
    return `<section class="structure-subcategory-flat-list">${items.map(renderCatalogStructureSubcategory).join("")}</section>`;
}

function renderProductsWithoutStructurePanel() {
    const issue = (catalogStructureAudit?.issues || []).find(item => item.code === "PRODUCTS_WITHOUT_STRUCTURE");
    return `
        <section class="structure-without-panel">
            <h2>Товары без структуры</h2>
            <p class="settings-muted">${escapeHtml(getStructureIssueMessage(issue || { message: "Есть товары, у которых категория или подкатегория не сопоставлена с активной структурой." }))}</p>
            <button class="structure-node-detail" type="button" data-structure-node-type="withoutStructure" data-structure-node-id="withoutStructure">Открыть список товаров</button>
        </section>
    `;
}

function renderStructureNodeIssues(node) {
    const issues = node?.issues || [];
    if (!issues.length) return `<p class="settings-muted">Проблем не найдено.</p>`;
    return `
        <ul class="structure-detail-issues">
            ${issues.map(issue => `
                <li class="${escapeHtml(issue.severity || "info")}">
                    <strong>${escapeHtml(getStructureIssueLabel(issue.code))}</strong>
                    <span>${escapeHtml(getStructureIssueMessage(issue))}</span>
                    ${issue.recommendation ? `<small>${escapeHtml(issue.recommendation)}</small>` : ""}
                </li>
            `).join("")}
        </ul>
    `;
}

function renderStructureProductItem(product) {
    return `
        <article class="structure-product-row" data-structure-product-id="${escapeHtml(product.id)}">
            <div>
                <strong>${escapeHtml(product.title || "Без названия")}</strong>
                <small>${escapeHtml([product.category, product.subcategory, product.productGroup].filter(Boolean).join(" / ") || "Без привязки")}</small>
            </div>
            <span>${product.isActive ? "Активен" : "Скрыт"}</span>
        </article>
    `;
}

function renderStructureDetailProducts() {
    if (structureDetailProductsLoading && !structureDetailProducts.length) {
        return renderCrmLoader("Загружаем товары...");
    }
    const products = structureDetailProducts.slice(0, CRM_DOM_ACCUMULATION_LIMIT);
    return `
        <div class="structure-products-list">
            ${products.length ? products.map(renderStructureProductItem).join("") : `<section class="empty-state"><h2>Товары не найдены</h2><p>Измените поиск или статус.</p></section>`}
        </div>
        ${renderPaginationControls(structureDetailProductsPagination, {
            id: "structure-products",
            loading: structureDetailProductsAppendLoading || structureDetailProductsLoading,
            loadedCount: products.length
        })}
    `;
}

function renderStructureDetailPanel() {
    const selection = structureDetailSelection;
    if (!selection) return "";
    const node = findStructureNode(selection.type, selection.id);
    if (!node) return "";
    const typeLabel = node.type === "category" ? "Категория" : node.type === "subcategory" ? "Подкатегория" : "Аудит";
    const codeLabel = node.type === "category" ? "CAT" : node.type === "subcategory" ? "SUB" : "Код";
    return `
        <aside class="structure-detail-panel" aria-live="polite">
            <div class="structure-detail-header">
                <div>
                    <span>${escapeHtml(typeLabel)}</span>
                    <h2>${escapeHtml(node.name)}</h2>
                </div>
                <button class="structure-detail-close" type="button" aria-label="Закрыть">×</button>
            </div>
            <dl class="structure-detail-meta">
                <div><dt>ID</dt><dd>${escapeHtml(node.id || "—")}</dd></div>
                <div><dt>${escapeHtml(codeLabel)}</dt><dd>${escapeHtml(node.code || node.externalCode || "—")}</dd></div>
                <div><dt>Статус</dt><dd>${node.isActive === false ? "Неактивен" : "Активен"}</dd></div>
                <div><dt>sort_order</dt><dd>${escapeHtml(node.sortOrder || 0)}</dd></div>
                <div><dt>Родитель</dt><dd>${escapeHtml(node.parentName || "—")}</dd></div>
                <div><dt>Товары</dt><dd>${escapeHtml(node.productCount || 0)} / активных ${escapeHtml(node.activeProductCount || 0)} / скрытых ${escapeHtml(node.inactiveProductCount || 0)}</dd></div>
                <div><dt>Обновлено</dt><dd>${escapeHtml(node.updatedAt || node.updated_at || "—")}</dd></div>
            </dl>
            <section>
                <h3>Проблемы</h3>
                ${renderStructureNodeIssues(node)}
            </section>
            <section class="structure-products-panel">
                <div class="structure-products-toolbar">
                    <label>
                        <span>Поиск товаров</span>
                        <input id="structureProductsSearch" type="search" value="${escapeHtml(structureDetailProductsSearch)}" placeholder="Название, MAT, группа">
                    </label>
                    <label>
                        <span>Статус</span>
                        <select id="structureProductsStatus">
                            <option value="all"${structureDetailProductsStatus === "all" ? " selected" : ""}>Все</option>
                            <option value="active"${structureDetailProductsStatus === "active" ? " selected" : ""}>Активные</option>
                            <option value="hidden"${structureDetailProductsStatus === "hidden" ? " selected" : ""}>Скрытые</option>
                        </select>
                    </label>
                </div>
                <div id="structureDetailProductsPanel">${renderStructureDetailProducts()}</div>
            </section>
        </aside>
    `;
}

function renderCatalogStructureTree() {
    if (catalogStructureFilter === "withoutStructure") return renderProductsWithoutStructurePanel();
    if (catalogStructureFilter === "subcategories") return renderStructureSubcategoryList();
    const categories = getVisibleStructureCategories();
    const rootCategories = (catalogStructureAudit?.categories || []).filter(category => category.type === "category" && !category.parentId);
    if (!categories.length) {
        return `<section class="empty-state"><h2>Структура не найдена</h2><p>Измените поиск или фильтр.</p></section>`;
    }
    return `<section class="structure-tree">${categories.map(category => renderCatalogStructureCategory(category, rootCategories)).join("")}</section>`;
}

function renderCatalogStructureView() {
    if (!catalogStructureView) return;
    const isAdmin = canEditCatalogStructure();
    catalogStructureView.innerHTML = `
        <header class="crm-topbar">
            <div>
                <h1>Структура каталога</h1>
                <p>Аудит категорий, подкатегорий и связей с товарами</p>
            </div>
            <div class="crm-topbar-actions">
                <button class="structure-refresh" type="button">Обновить</button>
                ${isAdmin ? `<button class="structure-create-category" type="button">Создать категорию</button>` : ""}
                ${isAdmin ? `<button class="structure-move-selected" type="button" ${selectedStructureSubcategories.size ? "" : "disabled"}>Переместить выбранные</button>` : ""}
            </div>
        </header>
        ${catalogStructureLoading ? renderCrmLoader("Проверяем структуру каталога...") : `
            ${renderCatalogStructureFilterStats()}
            <section class="products-toolbar structure-toolbar">
                <label>
                    <span>Поиск</span>
                    <input id="structureSearchInput" type="search" value="${escapeHtml(catalogStructureQuery)}" placeholder="Категория или подкатегория">
                </label>
                <label>
                    <span>Фильтр</span>
                    <select id="structureFilter">
                        <option value="subcategories"${catalogStructureFilter === "subcategories" ? " selected" : ""}>Подкатегории</option>
                        <option value="withoutStructure"${catalogStructureFilter === "withoutStructure" ? " selected" : ""}>Товары без структуры</option>
                        <option value="all"${catalogStructureFilter === "all" ? " selected" : ""}>Все</option>
                        <option value="issues"${catalogStructureFilter === "issues" ? " selected" : ""}>Есть проблемы</option>
                        <option value="emptyCategories"${catalogStructureFilter === "emptyCategories" ? " selected" : ""}>Пустые категории</option>
                        <option value="emptySubcategories"${catalogStructureFilter === "emptySubcategories" ? " selected" : ""}>Пустые подкатегории</option>
                        <option value="withoutParent"${catalogStructureFilter === "withoutParent" ? " selected" : ""}>Без родителя</option>
                        <option value="inactive"${catalogStructureFilter === "inactive" ? " selected" : ""}>Неактивные</option>
                        <option value="duplicates"${catalogStructureFilter === "duplicates" ? " selected" : ""}>Возможные дубли</option>
                    </select>
                </label>
                <button class="structure-filter-reset" type="button" ${catalogStructureFilter === "all" && !catalogStructureQuery ? "disabled" : ""}>Сбросить фильтр</button>
            </section>
            <div class="structure-layout">
                <div id="catalogStructureTreePanel">${renderCatalogStructureTree()}</div>
                ${renderStructureDetailPanel()}
            </div>
        `}
    `;
}

function updateCatalogStructureTreePanel() {
    const panel = catalogStructureView?.querySelector("#catalogStructureTreePanel");
    if (panel) panel.innerHTML = renderCatalogStructureTree();
}

function updateStructureDetailProductsPanel() {
    const panel = catalogStructureView?.querySelector("#structureDetailProductsPanel");
    if (panel) panel.innerHTML = renderStructureDetailProducts();
}

function buildStructureProductsUrl(page = 1) {
    const selection = structureDetailSelection;
    const params = new URLSearchParams({
        page: String(page),
        limit: String(CRM_LIST_LIMIT),
        status: structureDetailProductsStatus || "all"
    });
    if (structureDetailProductsSearch) params.set("search", structureDetailProductsSearch);
    if (selection?.type === "withoutStructure") {
        params.set("mode", "withoutStructure");
    } else {
        params.set("mode", "node");
        params.set("type", selection?.type || "");
        params.set("id", selection?.id || "");
    }
    return `/api/products/structure/audit/products?${params.toString()}`;
}

async function loadStructureDetailProducts({ page = 1, append = false } = {}) {
    if (!structureDetailSelection) return;
    const requestId = ++structureDetailProductsRequestId;
    if (append) {
        structureDetailProductsAppendLoading = true;
        updateStructureDetailProductsPanel();
    } else {
        structureDetailProductsLoading = true;
        structureDetailProducts = [];
        if (catalogStructureView?.querySelector("#structureDetailProductsPanel")) updateStructureDetailProductsPanel();
        else renderCatalogStructureView();
    }
    try {
        const result = await CrmApi.get(buildStructureProductsUrl(page));
        if (requestId !== structureDetailProductsRequestId) return;
        const products = result.products || result.items || [];
        structureDetailProducts = append
            ? [...structureDetailProducts, ...products].slice(0, CRM_DOM_ACCUMULATION_LIMIT)
            : products.slice(0, CRM_DOM_ACCUMULATION_LIMIT);
        structureDetailProductsPagination = normalizePaginationMeta(result.pagination || {});
    } catch (error) {
        notifyError(error, "Не удалось загрузить товары по структуре.");
    } finally {
        if (requestId === structureDetailProductsRequestId) {
            structureDetailProductsLoading = false;
            structureDetailProductsAppendLoading = false;
            if (append) updateStructureDetailProductsPanel();
            else if (catalogStructureView?.querySelector("#structureDetailProductsPanel")) updateStructureDetailProductsPanel();
            else renderCatalogStructureView();
        }
    }
}

function openStructureDetail(type, id) {
    const node = findStructureNode(type, id);
    if (!node) return;
    structureDetailSelection = { type, id: String(id) };
    resetStructureDetailProductsState();
    renderCatalogStructureView();
    loadStructureDetailProducts({ page: 1 }).catch(error => notifyError(error, "Не удалось открыть детали структуры."));
}

async function loadCatalogStructureAudit() {
    catalogStructureLoading = true;
    renderCatalogStructureView();
    try {
        const result = await CrmApi.get("/api/products/structure/audit");
        catalogStructureAudit = result.data || null;
        if (!expandedStructureCategories.size) {
            (catalogStructureAudit?.categories || []).slice(0, 6).forEach(category => expandedStructureCategories.add(String(category.id)));
        }
    } catch (error) {
        notifyError(error, "Не удалось загрузить аудит структуры каталога.");
        catalogStructureAudit = null;
    } finally {
        catalogStructureLoading = false;
        renderCatalogStructureView();
    }
}

function renderTargetCategoryOptions() {
    return (catalogStructureAudit?.categories || [])
        .filter(category => category.type === "category" && category.isActive && !category.parentId)
        .map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
        .join("");
}

async function createCatalogStructureCategory() {
    const formData = await CrmModal.form({
        title: "Создать категорию",
        content: `
            <div class="product-form-grid">
                <label class="product-form-wide">
                    <span>Название</span>
                    <input name="name" type="text" required>
                </label>
            </div>
        `,
        submitText: "Создать"
    });
    if (!formData) return;
    const result = await CrmApi.post("/api/products/structure/categories", {
        name: String(formData.get("name") || "").trim()
    });
    notifySuccess(`Категория "${result.item?.name || result.data?.item?.name || ""}" создана.`);
    await loadCatalogStructureAudit();
}

async function moveCatalogStructureCategory(button) {
    const categoryId = Number(button.dataset.structureCategoryOrder || 0);
    const targetIndex = Number(button.dataset.targetIndex);
    if (!categoryId || !Number.isInteger(targetIndex)) return;

    button.disabled = true;
    try {
        await CrmApi.patch(`/api/products/structure/categories/${categoryId}/order`, { targetIndex });
        notifySuccess("Порядок категорий обновлен.");
        await loadCatalogStructureAudit();
    } catch (error) {
        notifyError(error, "Не удалось изменить порядок категорий.");
        button.disabled = false;
    }
}

async function moveSelectedCatalogSubcategories() {
    if (!selectedStructureSubcategories.size) {
        notifyWarning("Выберите подкатегории для перемещения.");
        return;
    }
    const formData = await CrmModal.form({
        title: "Переместить подкатегории",
        content: `
            <div class="product-form-grid">
                <label class="product-form-wide">
                    <span>Новая категория</span>
                    <select name="targetCategoryId" required>${renderTargetCategoryOptions()}</select>
                </label>
            </div>
        `,
        submitText: "Проверить"
    });
    if (!formData) return;
    const payload = {
        subcategoryIds: Array.from(selectedStructureSubcategories).map(Number),
        targetCategoryId: Number(formData.get("targetCategoryId") || 0)
    };
    const previewResult = await CrmApi.post("/api/products/structure/subcategories/move-preview", payload);
    const preview = previewResult.data;
    const confirmed = await CrmModal.open({
        title: "Подтвердить перемещение",
        message: `Будет перемещено подкатегорий: ${preview.items.length}. Затронуто товаров: ${preview.affectedProducts}. Целевая категория: ${preview.targetCategory.name}.`,
        confirmText: "Переместить"
    });
    if (!confirmed) return;
    const result = await CrmApi.post("/api/products/structure/subcategories/move", payload);
    selectedStructureSubcategories.clear();
    notifySuccess(`Перемещено подкатегорий: ${result.data?.moved || 0}. Обновлено товаров: ${result.data?.affectedProducts || 0}.`);
    await loadCatalogStructureAudit();
}

catalogStructureView?.addEventListener("input", event => {
    const input = event.target.closest("#structureSearchInput");
    if (input) {
        catalogStructureQuery = input.value;
        updateCatalogStructureTreePanel();
        return;
    }
    const productsSearch = event.target.closest("#structureProductsSearch");
    if (productsSearch) {
        structureDetailProductsSearch = productsSearch.value;
        loadStructureDetailProducts({ page: 1 }).catch(error => notifyError(error, "Не удалось обновить список товаров."));
    }
});

catalogStructureView?.addEventListener("change", event => {
    const filter = event.target.closest("#structureFilter");
    if (filter) {
        catalogStructureFilter = filter.value;
        renderCatalogStructureView();
        return;
    }
    const productsStatus = event.target.closest("#structureProductsStatus");
    if (productsStatus) {
        structureDetailProductsStatus = productsStatus.value;
        loadStructureDetailProducts({ page: 1 }).catch(error => notifyError(error, "Не удалось обновить список товаров."));
        return;
    }
    const checkbox = event.target.closest("[data-structure-subcategory-id]");
    if (checkbox) {
        const id = String(checkbox.dataset.structureSubcategoryId);
        if (checkbox.checked) selectedStructureSubcategories.add(id);
        else selectedStructureSubcategories.delete(id);
        renderCatalogStructureView();
    }
});

catalogStructureView?.addEventListener("click", event => {
    const summaryFilter = event.target.closest("[data-structure-summary-filter]");
    if (summaryFilter) {
        const nextFilter = summaryFilter.dataset.structureSummaryFilter || "all";
        catalogStructureFilter = (catalogStructureFilter === nextFilter || (nextFilter === "categories" && catalogStructureFilter === "all"))
            ? "all"
            : (nextFilter === "categories" ? "all" : nextFilter);
        if (nextFilter === "withoutStructure" && catalogStructureFilter === "withoutStructure") {
            structureDetailSelection = { type: "withoutStructure", id: "withoutStructure" };
            resetStructureDetailProductsState();
            loadStructureDetailProducts({ page: 1 }).catch(error => notifyError(error, "Не удалось загрузить товары без структуры."));
        } else {
            structureDetailSelection = null;
            resetStructureDetailProductsState();
        }
        renderCatalogStructureView();
        return;
    }
    if (event.target.closest(".structure-filter-reset")) {
        catalogStructureFilter = "all";
        catalogStructureQuery = "";
        renderCatalogStructureView();
        return;
    }
    const detailButton = event.target.closest("[data-structure-node-type][data-structure-node-id]");
    if (detailButton) {
        event.preventDefault();
        openStructureDetail(detailButton.dataset.structureNodeType, detailButton.dataset.structureNodeId);
        return;
    }
    if (event.target.closest(".structure-detail-close")) {
        structureDetailSelection = null;
        resetStructureDetailProductsState();
        renderCatalogStructureView();
        return;
    }
    const detailPagination = event.target.closest('[data-pagination="structure-products"]');
    if (detailPagination) {
        const previousScrollY = window.scrollY || 0;
        const moreButton = event.target.closest("[data-load-more]");
        const pageButton = event.target.closest("[data-page]");
        if (moreButton) {
            event.preventDefault();
            if (structureDetailProductsAppendLoading || structureDetailProductsLoading) return;
            moreButton.disabled = true;
            loadStructureDetailProducts({ page: structureDetailProductsPagination.page + 1, append: true })
                .finally(() => restoreScrollIfApplicationMoved(previousScrollY));
            return;
        }
        if (pageButton) {
            const page = Number(pageButton.dataset.page || 1);
            if (page && page !== structureDetailProductsPagination.page) {
                loadStructureDetailProducts({ page }).catch(error => notifyError(error, "Не удалось загрузить страницу товаров."));
            }
            return;
        }
    }
    const toggle = event.target.closest("[data-structure-toggle]");
    if (toggle) {
        const id = String(toggle.dataset.structureToggle);
        if (expandedStructureCategories.has(id)) expandedStructureCategories.delete(id);
        else expandedStructureCategories.add(id);
        renderCatalogStructureView();
        return;
    }
    if (event.target.closest(".structure-refresh")) {
        loadCatalogStructureAudit();
        return;
    }
    if (event.target.closest(".structure-create-category")) {
        createCatalogStructureCategory().catch(error => notifyError(error, "Не удалось создать категорию."));
        return;
    }
    const categoryOrderButton = event.target.closest("button[data-structure-category-order]");
    if (categoryOrderButton) {
        moveCatalogStructureCategory(categoryOrderButton);
        return;
    }
    if (event.target.closest(".structure-move-selected")) {
        moveSelectedCatalogSubcategories().catch(error => notifyError(error, "Не удалось переместить подкатегории."));
    }
});
