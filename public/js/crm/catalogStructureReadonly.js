(function initializeCatalogStructureReadonly(global) {
    const issueLabels = {
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

    function normalizeText(value) {
        return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
    }

    function createCatalogStructureReadonlyView(options = {}) {
        let root = options.root || null;
        const state = {
            audit: null,
            loading: false,
            error: "",
            loadedAt: "",
            query: "",
            filter: "all",
            expanded: new Set(),
            detail: null,
            products: [],
            productsPagination: normalizePaginationMeta(),
            productsLoading: false,
            productsAppendLoading: false,
            productsSearch: "",
            productsStatus: "all",
            requestId: 0,
            productsSearchTimer: null
        };

        function getIssueLabel(code) {
            return issueLabels[code] || code || "Проблема";
        }

        function getIssueMessage(issue = {}) {
            return issue.messageRu || issue.message || getIssueLabel(issue.code);
        }

        function hasIssue(item) {
            return (item.issues || []).some(issue => issue.severity !== "info");
        }

        function getOrphans() {
            const known = new Set((state.audit?.categories || [])
                .flatMap(category => category.subcategories || [])
                .map(item => String(item.id)));
            return (state.audit?.issues || [])
                .filter(issue => issue.code === "SUBCATEGORY_WITHOUT_PARENT" && !known.has(String(issue.itemId)))
                .map(issue => ({
                    id: issue.itemId,
                    type: "subcategory",
                    name: issue.itemName || "Без названия",
                    parentId: issue.parentId || null,
                    parentName: "",
                    isActive: true,
                    productCount: 0,
                    issues: [issue],
                    orphan: true
                }));
        }

        function getSubcategories() {
            return [
                ...(state.audit?.categories || []).flatMap(category => (category.subcategories || []).map(item => ({
                    ...item,
                    parentName: item.parentName || category.name,
                    parentId: item.parentId || category.id
                }))),
                ...getOrphans()
            ];
        }

        function findNode(type, id) {
            const nodeId = String(id || "");
            if (type === "category") {
                return (state.audit?.categories || []).find(item => String(item.id) === nodeId) || null;
            }
            if (type === "subcategory") {
                return getSubcategories().find(item => String(item.id) === nodeId) || null;
            }
            if (type === "withoutStructure") {
                return {
                    id: "withoutStructure",
                    type,
                    name: "Товары без структуры",
                    productCount: state.audit?.summary?.productsWithoutStructure || 0,
                    issues: (state.audit?.issues || []).filter(issue => issue.code === "PRODUCTS_WITHOUT_STRUCTURE")
                };
            }
            return null;
        }

        function matchesQuery(node) {
            if (!state.query) return true;
            return normalizeText([
                node.name,
                node.parentName,
                node.code,
                node.externalCode,
                ...(node.issues || []).map(issue => `${issue.code} ${getIssueMessage(issue)}`)
            ].join(" ")).includes(normalizeText(state.query));
        }

        function categoryMatches(category) {
            if (!matchesQuery({
                ...category,
                name: [category.name, ...(category.subcategories || []).map(item => item.name)].join(" ")
            })) return false;
            if (state.filter === "issues") return hasIssue(category) || (category.subcategories || []).some(hasIssue);
            if (state.filter === "emptyCategories") return Number(category.productCount || 0) === 0;
            if (state.filter === "emptySubcategories") return (category.subcategories || []).some(item => Number(item.productCount || 0) === 0);
            if (state.filter === "inactive") return !category.isActive || (category.subcategories || []).some(item => !item.isActive);
            if (state.filter === "duplicates") {
                return (category.issues || []).some(issue => issue.code.includes("DUPLICATE"))
                    || (category.subcategories || []).some(item => (item.issues || []).some(issue => issue.code.includes("DUPLICATE") || issue.code === "SAME_SUBCATEGORY_NAME_IN_MULTIPLE_CATEGORIES"));
            }
            if (state.filter === "withoutParent" || state.filter === "subcategories" || state.filter === "withoutStructure") return false;
            return true;
        }

        function renderIssues(issues = []) {
            if (!issues.length) return "";
            return `<div class="structure-issues">${issues.slice(0, 4).map(issue =>
                `<span class="structure-issue ${escapeHtml(issue.severity || "info")}">${escapeHtml(getIssueLabel(issue.code))}</span>`
            ).join("")}${issues.length > 4 ? `<span class="structure-issue info">+${issues.length - 4}</span>` : ""}</div>`;
        }

        function renderStats() {
            const summary = state.audit?.summary || {};
            const stats = [
                ["all", "Категории", summary.categories || 0],
                ["subcategories", "Подкатегории", summary.subcategories || 0],
                ["withoutStructure", "Товары без структуры", summary.productsWithoutStructure || 0],
                ["issues", "Проблемы", summary.issues || 0],
                ["duplicates", "Дубли", summary.duplicateIssues || 0],
                ["inactive", "Неактивные", summary.inactiveItems || 0]
            ];
            return `<section class="dashboard-stats structure-stats">${stats.map(([filter, label, value]) =>
                `<button class="dashboard-stat structure-stat-filter${state.filter === filter ? " active" : ""}" type="button" data-readonly-summary-filter="${filter}" aria-pressed="${state.filter === filter}">
                    <span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>
                </button>`
            ).join("")}</section>`;
        }

        function renderSubcategory(item) {
            return `<div class="structure-subcategory${item.orphan ? " structure-orphan" : ""}">
                <span><strong>${escapeHtml(item.name)}</strong>
                    <small>${escapeHtml(item.parentName || "Без родителя")} · ${escapeHtml(item.productCount || 0)} товаров · sort ${escapeHtml(item.sortOrder || 0)}</small>
                    ${renderIssues(item.issues || [])}
                </span>
                <button class="structure-node-detail" type="button" data-readonly-node-type="subcategory" data-readonly-node-id="${escapeHtml(item.id)}">Детали</button>
            </div>`;
        }

        function renderCategory(category) {
            const expanded = state.expanded.has(String(category.id));
            return `<article class="structure-category">
                <div class="structure-category-header">
                    <button class="structure-toggle-button" type="button" data-readonly-toggle="${escapeHtml(category.id)}" aria-expanded="${expanded}">
                        <span>${expanded ? "−" : "+"}</span><strong>${escapeHtml(category.name)}</strong>
                        <small>${escapeHtml((category.subcategories || []).length)} SUB · ${escapeHtml(category.productCount || 0)} товаров</small>
                        ${renderIssues(category.issues || [])}
                    </button>
                    <button class="structure-node-detail" type="button" data-readonly-node-type="category" data-readonly-node-id="${escapeHtml(category.id)}">Детали</button>
                </div>
                ${expanded ? `<div class="structure-subcategory-list">${(category.subcategories || []).length
                    ? category.subcategories.map(renderSubcategory).join("")
                    : `<p class="settings-muted">Подкатегорий нет.</p>`}</div>` : ""}
            </article>`;
        }

        function renderTree() {
            if (state.filter === "withoutStructure") {
                return `<section class="structure-without-panel"><h2>Товары без структуры</h2>
                    <p class="settings-muted">${escapeHtml(getIssueMessage((state.audit?.issues || []).find(issue => issue.code === "PRODUCTS_WITHOUT_STRUCTURE") || {}))}</p>
                    <button class="structure-node-detail" type="button" data-readonly-node-type="withoutStructure" data-readonly-node-id="withoutStructure">Открыть список товаров</button>
                </section>`;
            }
            let flatItems = null;
            if (state.filter === "withoutParent") flatItems = getOrphans();
            if (state.filter === "subcategories") flatItems = getSubcategories();
            if (flatItems) {
                const visible = flatItems.filter(matchesQuery);
                return visible.length
                    ? `<section class="structure-subcategory-flat-list">${visible.map(renderSubcategory).join("")}</section>`
                    : `<section class="empty-state"><h2>Подкатегории не найдены</h2><p>Измените поиск или фильтр.</p></section>`;
            }
            const categories = (state.audit?.categories || []).filter(categoryMatches);
            const orphanBlock = state.filter === "all" && getOrphans().length
                ? `<section class="structure-orphans"><h2>Подкатегории без родителя</h2>${getOrphans().map(renderSubcategory).join("")}</section>`
                : "";
            return `${categories.length
                ? `<section class="structure-tree">${categories.map(renderCategory).join("")}</section>`
                : `<section class="empty-state"><h2>Структура не найдена</h2><p>Измените поиск или фильтр.</p></section>`}${orphanBlock}`;
        }

        function renderProduct(product) {
            return `<article class="structure-product-row"><div><strong>${escapeHtml(product.title || "Без названия")}</strong>
                <small>${escapeHtml([product.category, product.subcategory, product.productGroup].filter(Boolean).join(" / ") || "Без привязки")}</small>
                </div><span>${product.isActive ? "Активен" : "Скрыт"}</span></article>`;
        }

        function renderProducts() {
            if (state.productsLoading && !state.products.length) return renderCrmLoader("Загружаем товары...");
            return `<div class="structure-products-list">${state.products.length
                ? state.products.map(renderProduct).join("")
                : `<section class="empty-state"><h2>Товары не найдены</h2><p>Измените поиск или статус.</p></section>`}</div>
                ${renderPaginationControls(state.productsPagination, {
                    id: options.paginationId || "structure-products",
                    loading: state.productsLoading || state.productsAppendLoading,
                    loadedCount: state.products.length
                })}`;
        }

        function renderDetail() {
            if (!state.detail) return "";
            const node = findNode(state.detail.type, state.detail.id);
            if (!node) return "";
            return `<aside class="structure-detail-panel" aria-live="polite">
                <div class="structure-detail-header"><div><span>${node.type === "category" ? "Категория" : node.type === "subcategory" ? "Подкатегория" : "Аудит"}</span>
                    <h2>${escapeHtml(node.name)}</h2></div><button data-readonly-detail-close type="button" aria-label="Закрыть">×</button></div>
                <dl class="structure-detail-meta">
                    <div><dt>ID</dt><dd>${escapeHtml(node.id || "—")}</dd></div>
                    <div><dt>Код</dt><dd>${escapeHtml(node.code || node.externalCode || "—")}</dd></div>
                    <div><dt>Статус</dt><dd>${node.isActive === false ? "Неактивен" : "Активен"}</dd></div>
                    <div><dt>sort_order</dt><dd>${escapeHtml(node.sortOrder || 0)}</dd></div>
                    <div><dt>Родитель</dt><dd>${escapeHtml(node.parentName || "—")}</dd></div>
                    <div><dt>Товары</dt><dd>${escapeHtml(node.productCount || 0)} / активных ${escapeHtml(node.activeProductCount || 0)} / скрытых ${escapeHtml(node.inactiveProductCount || 0)}</dd></div>
                    <div><dt>Обновлено</dt><dd>${escapeHtml(node.updatedAt || node.updated_at || "—")}</dd></div>
                </dl>
                <section><h3>Проблемы</h3>${(node.issues || []).length
                    ? `<ul class="structure-detail-issues">${node.issues.map(issue => `<li class="${escapeHtml(issue.severity || "info")}"><strong>${escapeHtml(getIssueLabel(issue.code))}</strong><span>${escapeHtml(getIssueMessage(issue))}</span></li>`).join("")}</ul>`
                    : `<p class="settings-muted">Проблем не найдено.</p>`}</section>
                ${typeof options.onShowProducts === "function" && !node.orphan
                    ? `<button class="structure-show-products" type="button" data-readonly-show-products data-node-type="${escapeHtml(node.type)}" data-node-id="${escapeHtml(node.id)}">Показать товары</button>`
                    : ""}
                <section class="structure-products-panel"><div class="structure-products-toolbar">
                    <label><span>Поиск товаров</span><input data-readonly-products-search type="search" value="${escapeHtml(state.productsSearch)}" placeholder="Название, MAT, группа"></label>
                    <label><span>Статус</span><select data-readonly-products-status>
                        <option value="all"${state.productsStatus === "all" ? " selected" : ""}>Все</option>
                        <option value="active"${state.productsStatus === "active" ? " selected" : ""}>Активные</option>
                        <option value="hidden"${state.productsStatus === "hidden" ? " selected" : ""}>Скрытые</option>
                    </select></label></div><div data-readonly-products-panel>${renderProducts()}</div></section>
            </aside>`;
        }

        function render() {
            if (!root) return;
            const actions = typeof options.renderActions === "function"
                ? options.renderActions({ state })
                : "";
            root.innerHTML = `<header class="crm-topbar structure-view-topbar"><div><h1>${escapeHtml(options.title || "Структура каталога")}</h1>
                <p>Аудит категорий, подкатегорий и связей с товарами</p></div>
                <div class="crm-topbar-actions"><span class="structure-updated-at">${state.loadedAt ? `Обновлено ${escapeHtml(new Date(state.loadedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }))}` : ""}</span>
                    <button data-readonly-refresh type="button" ${state.loading ? "disabled" : ""}>Обновить</button>${actions}</div></header>
                ${state.loading && !state.audit ? renderCrmLoader("Проверяем структуру каталога...") : ""}
                ${state.error && !state.audit ? `<section class="crm-inline-error" role="alert"><h2>Не удалось загрузить структуру</h2><p>${escapeHtml(state.error)}</p><button data-readonly-retry type="button">Повторить</button></section>` : ""}
                ${state.audit ? `${renderStats()}<section class="products-toolbar structure-toolbar">
                    <label><span>Поиск</span><input data-readonly-search type="search" value="${escapeHtml(state.query)}" placeholder="Категория или подкатегория"></label>
                    <label><span>Фильтр</span><select data-readonly-filter>
                        ${[
                            ["all", "Все"], ["subcategories", "Подкатегории"], ["withoutStructure", "Товары без структуры"],
                            ["issues", "Есть проблемы"], ["emptyCategories", "Пустые категории"], ["emptySubcategories", "Пустые подкатегории"],
                            ["withoutParent", "Без родителя"], ["inactive", "Неактивные"], ["duplicates", "Возможные дубли"]
                        ].map(([value, label]) => `<option value="${value}"${state.filter === value ? " selected" : ""}>${label}</option>`).join("")}
                    </select></label><button data-readonly-reset type="button" ${state.filter === "all" && !state.query ? "disabled" : ""}>Сбросить фильтр</button>
                </section><div class="structure-layout"><div data-readonly-tree>${renderTree()}</div>${renderDetail()}</div>` : ""}`;
        }

        function buildProductsUrl(page) {
            const params = new URLSearchParams({ page: String(page), limit: String(CRM_LIST_LIMIT), status: state.productsStatus });
            if (state.productsSearch) params.set("search", state.productsSearch);
            if (state.detail?.type === "withoutStructure") params.set("mode", "withoutStructure");
            else {
                params.set("mode", "node");
                params.set("type", state.detail?.type || "");
                params.set("id", state.detail?.id || "");
            }
            return `/api/products/structure/audit/products?${params.toString()}`;
        }

        async function loadProducts({ page = 1, append = false } = {}) {
            if (!state.detail) return;
            const requestId = ++state.requestId;
            state.productsLoading = !append;
            state.productsAppendLoading = append;
            if (!append) state.products = [];
            render();
            try {
                const result = await CrmApi.get(buildProductsUrl(page));
                if (requestId !== state.requestId) return;
                const rows = result.products || result.items || [];
                state.products = append ? [...state.products, ...rows].slice(0, CRM_DOM_ACCUMULATION_LIMIT) : rows.slice(0, CRM_DOM_ACCUMULATION_LIMIT);
                state.productsPagination = normalizePaginationMeta(result.pagination || {});
            } catch (error) {
                notifyError(error, "Не удалось загрузить товары по структуре.");
            } finally {
                if (requestId === state.requestId) {
                    state.productsLoading = false;
                    state.productsAppendLoading = false;
                    render();
                }
            }
        }

        async function load({ force = false } = {}) {
            if (state.loading || (state.audit && !force)) return;
            state.loading = true;
            state.error = "";
            render();
            try {
                const result = await CrmApi.get("/api/products/structure/audit");
                state.audit = result.data || null;
                state.loadedAt = new Date().toISOString();
                if (!state.expanded.size) {
                    (state.audit?.categories || []).slice(0, 6).forEach(item => state.expanded.add(String(item.id)));
                }
            } catch (error) {
                state.error = error?.message || "Повторите попытку.";
                if (!state.audit) state.audit = null;
            } finally {
                state.loading = false;
                render();
            }
        }

        async function openDetail(type, id) {
            if (!findNode(type, id)) return;
            state.detail = { type, id: String(id) };
            state.products = [];
            state.productsPagination = normalizePaginationMeta();
            state.productsSearch = "";
            state.productsStatus = "all";
            render();
            await loadProducts({ page: 1 });
        }

        function handleInput(event) {
            if (event.target.matches("[data-readonly-search]")) {
                state.query = event.target.value;
                render();
            } else if (event.target.matches("[data-readonly-products-search]")) {
                state.productsSearch = event.target.value;
                window.clearTimeout(state.productsSearchTimer);
                state.productsSearchTimer = window.setTimeout(() => loadProducts({ page: 1 }), 250);
            }
        }

        function handleChange(event) {
            if (event.target.matches("[data-readonly-filter]")) {
                state.filter = event.target.value;
                state.detail = null;
                render();
            } else if (event.target.matches("[data-readonly-products-status]")) {
                state.productsStatus = event.target.value;
                loadProducts({ page: 1 });
            }
        }

        function handleClick(event) {
            const showProducts = event.target.closest("[data-readonly-show-products]");
            if (showProducts && typeof options.onShowProducts === "function") {
                const type = showProducts.dataset.nodeType;
                const id = showProducts.dataset.nodeId;
                const node = findNode(type, id);
                options.onShowProducts({
                    mode: type === "withoutStructure" ? "withoutStructure" : "node",
                    nodeId: type === "withoutStructure" ? null : id,
                    label: type === "withoutStructure"
                        ? "Товары без структуры"
                        : [node?.parentName, node?.name].filter(Boolean).join(" → ")
                });
                return;
            }
            const summary = event.target.closest("[data-readonly-summary-filter]");
            if (summary) {
                state.filter = summary.dataset.readonlySummaryFilter || "all";
                state.detail = null;
                render();
                return;
            }
            const node = event.target.closest("[data-readonly-node-type]");
            if (node) {
                openDetail(node.dataset.readonlyNodeType, node.dataset.readonlyNodeId);
                return;
            }
            const toggle = event.target.closest("[data-readonly-toggle]");
            if (toggle) {
                const id = String(toggle.dataset.readonlyToggle);
                if (state.expanded.has(id)) state.expanded.delete(id);
                else state.expanded.add(id);
                render();
                return;
            }
            const pagination = event.target.closest(`[data-pagination="${options.paginationId || "structure-products"}"]`);
            if (pagination) {
                const more = event.target.closest("[data-load-more]");
                const pageButton = event.target.closest("[data-page]");
                if (more && !state.productsLoading && !state.productsAppendLoading) {
                    loadProducts({ page: state.productsPagination.page + 1, append: true });
                } else if (pageButton) {
                    const page = Number(pageButton.dataset.page || 1);
                    if (page !== state.productsPagination.page) loadProducts({ page });
                }
                return;
            }
            if (event.target.closest("[data-readonly-refresh]")) load({ force: true });
            else if (event.target.closest("[data-readonly-retry]")) load({ force: true });
            else if (event.target.closest("[data-readonly-reset]")) {
                state.query = "";
                state.filter = "all";
                render();
            } else if (event.target.closest("[data-readonly-detail-close]")) {
                state.detail = null;
                render();
            } else if (typeof options.onAction === "function") {
                options.onAction(event, { state, load, render });
            }
        }

        function bind(nextRoot) {
            if (root) {
                root.removeEventListener("input", handleInput);
                root.removeEventListener("change", handleChange);
                root.removeEventListener("click", handleClick);
            }
            root = nextRoot;
            if (root) {
                root.addEventListener("input", handleInput);
                root.addEventListener("change", handleChange);
                root.addEventListener("click", handleClick);
                render();
            }
        }

        function invalidate() {
            state.audit = null;
            state.loadedAt = "";
            state.detail = null;
            state.products = [];
            render();
        }

        bind(root);
        return { bind, load, render, invalidate, getState: () => state, openDetail };
    }

    global.createCatalogStructureReadonlyView = createCatalogStructureReadonlyView;
})(window);
