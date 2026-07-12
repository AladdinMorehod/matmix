let catalogStructureAudit = null;
let catalogStructureLoading = false;
let catalogStructureQuery = "";
let catalogStructureFilter = "all";
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

function renderCatalogStructureCategory(category) {
    const isExpanded = expandedStructureCategories.has(String(category.id));
    const subcategories = category.subcategories || [];
    return `
        <article class="structure-category">
            <button class="structure-category-header" type="button" data-structure-toggle="${escapeHtml(category.id)}" aria-expanded="${isExpanded ? "true" : "false"}">
                <span>${isExpanded ? "−" : "+"}</span>
                <strong>${escapeHtml(category.name)}</strong>
                <small>${escapeHtml(subcategories.length)} SUB · ${escapeHtml(category.productCount || 0)} товаров</small>
                ${renderStructureIssuePills(category.issues || [])}
            </button>
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
        </label>
    `;
}

function renderCatalogStructureTree() {
    const categories = getVisibleStructureCategories();
    if (!categories.length) {
        return `<section class="empty-state"><h2>Структура не найдена</h2><p>Измените поиск или фильтр.</p></section>`;
    }
    return `<section class="structure-tree">${categories.map(renderCatalogStructureCategory).join("")}</section>`;
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
            ${renderCatalogStructureStats()}
            <section class="products-toolbar structure-toolbar">
                <label>
                    <span>Поиск</span>
                    <input id="structureSearchInput" type="search" value="${escapeHtml(catalogStructureQuery)}" placeholder="Категория или подкатегория">
                </label>
                <label>
                    <span>Фильтр</span>
                    <select id="structureFilter">
                        <option value="all"${catalogStructureFilter === "all" ? " selected" : ""}>Все</option>
                        <option value="issues"${catalogStructureFilter === "issues" ? " selected" : ""}>Есть проблемы</option>
                        <option value="emptyCategories"${catalogStructureFilter === "emptyCategories" ? " selected" : ""}>Пустые категории</option>
                        <option value="emptySubcategories"${catalogStructureFilter === "emptySubcategories" ? " selected" : ""}>Пустые подкатегории</option>
                        <option value="withoutParent"${catalogStructureFilter === "withoutParent" ? " selected" : ""}>Без родителя</option>
                        <option value="inactive"${catalogStructureFilter === "inactive" ? " selected" : ""}>Неактивные</option>
                        <option value="duplicates"${catalogStructureFilter === "duplicates" ? " selected" : ""}>Возможные дубли</option>
                    </select>
                </label>
            </section>
            <div id="catalogStructureTreePanel">${renderCatalogStructureTree()}</div>
        `}
    `;
}

function updateCatalogStructureTreePanel() {
    const panel = catalogStructureView?.querySelector("#catalogStructureTreePanel");
    if (panel) panel.innerHTML = renderCatalogStructureTree();
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
    if (!input) return;
    catalogStructureQuery = input.value;
    updateCatalogStructureTreePanel();
});

catalogStructureView?.addEventListener("change", event => {
    const filter = event.target.closest("#structureFilter");
    if (filter) {
        catalogStructureFilter = filter.value;
        renderCatalogStructureView();
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
    if (event.target.closest(".structure-move-selected")) {
        moveSelectedCatalogSubcategories().catch(error => notifyError(error, "Не удалось переместить подкатегории."));
    }
});
