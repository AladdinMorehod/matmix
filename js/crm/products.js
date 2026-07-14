function canEditProducts() {
    return currentUser?.role === "admin";
}

let productStructure = [];
const productUnitOptions = ["шт", "кг", "м", "м2"];

function normalizeProductStructureName(value) {
    return String(value || "")
        .trim()
        .replace(/ё/g, "е")
        .replace(/Ё/g, "е")
        .toLowerCase()
        .replace(/\s*-\s*/g, " - ")
        .replace(/\s+/g, " ")
        .trim();
}

function getProductStatusLabel(product) {
    if (product.deletedAt) return "Удален";
    return product.isActive ? "Активен" : "Скрыт";
}

function isDeletedProductsFilter() {
    return productFilters.status === "deleted";
}

function getProductImage(product) {
    const value = product.image || "";
    return value && value.includes("/") ? `<img src="${escapeHtml(value)}" alt="">` : `<span>${escapeHtml(value || "Т")}</span>`;
}

function getProductPayloadFromForm(formData) {
    return {
        title: String(formData.get("title") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        subcategory: String(formData.get("subcategory") || "").trim(),
        price: String(formData.get("price") || "").trim(),
        weight: String(formData.get("weight") || "").trim(),
        unit: String(formData.get("unit") || "шт").trim(),
        description: String(formData.get("description") || "").trim(),
        image: String(formData.get("image") || "").trim(),
        isActive: formData.get("isActive") === "on"
    };
}

function getStructureCategoryByName(value) {
    const normalized = normalizeProductStructureName(value);
    return productStructure.find(category => normalizeProductStructureName(category.name) === normalized) || null;
}

function getStructureSubcategoryByName(category, value) {
    const normalized = normalizeProductStructureName(value);
    return category?.subcategories?.find(subcategory => normalizeProductStructureName(subcategory.name) === normalized) || null;
}

function renderCategoryOptions(selectedValue = "") {
    const selectedCategory = getStructureCategoryByName(selectedValue);
    const temporaryOption = selectedValue && !selectedCategory
        ? `<option value="${escapeHtml(selectedValue)}" selected>Текущее значение: ${escapeHtml(selectedValue)}</option>`
        : "";

    return `
        <option value="">Выберите категорию</option>
        ${temporaryOption}
        ${productStructure.map(category => `
            <option value="${escapeHtml(category.name)}"${selectedCategory?.id === category.id ? " selected" : ""}>${escapeHtml(category.name)}</option>
        `).join("")}
    `;
}

function renderSubcategoryOptions(categoryValue = "", selectedValue = "") {
    const category = getStructureCategoryByName(categoryValue);
    if (!category) {
        const temporaryOption = selectedValue
            ? `<option value="${escapeHtml(selectedValue)}" selected>Текущее значение: ${escapeHtml(selectedValue)}</option>`
            : "";
        return `
            <option value="">Сначала выберите категорию</option>
            ${temporaryOption}
        `;
    }

    const selectedSubcategory = getStructureSubcategoryByName(category, selectedValue);
    const temporaryOption = selectedValue && !selectedSubcategory
        ? `<option value="${escapeHtml(selectedValue)}" selected>Текущее значение: ${escapeHtml(selectedValue)}</option>`
        : "";

    return `
        <option value="">Выберите подкатегорию</option>
        ${temporaryOption}
        ${(category.subcategories || []).map(subcategory => `
            <option value="${escapeHtml(subcategory.name)}"${selectedSubcategory?.id === subcategory.id ? " selected" : ""}>${escapeHtml(subcategory.name)}</option>
        `).join("")}
    `;
}

function renderUnitOptions(selectedValue = "шт") {
    const unit = String(selectedValue || "шт").trim() || "шт";
    const temporaryOption = productUnitOptions.includes(unit)
        ? ""
        : `<option value="${escapeHtml(unit)}" selected>Текущее значение: ${escapeHtml(unit)}</option>`;

    return `
        ${temporaryOption}
        ${productUnitOptions.map(option => `
            <option value="${escapeHtml(option)}"${option === unit ? " selected" : ""}>${escapeHtml(option)}</option>
        `).join("")}
    `;
}

function renderProductForm(product = {}) {
    const selectedCategory = product.category || "";
    const selectedSubcategory = product.subcategory || "";
    const hasKnownCategory = Boolean(getStructureCategoryByName(selectedCategory));
    const canAddStructure = canEditProducts();

    return `
        <div class="product-form-grid">
            <label>
                <span>Название</span>
                <input name="title" type="text" value="${escapeHtml(product.title || "")}" required>
            </label>
            <label>
                <span>Категория</span>
                <span class="product-field-with-action">
                    <select name="category" required>
                        ${renderCategoryOptions(selectedCategory)}
                    </select>
                    ${canAddStructure ? `<button class="product-structure-add" data-structure-action="category" type="button">+ Добавить</button>` : ""}
                </span>
            </label>
            <label>
                <span>Подкатегория</span>
                <span class="product-field-with-action">
                    <select name="subcategory"${hasKnownCategory ? "" : " disabled"}>
                        ${renderSubcategoryOptions(selectedCategory, selectedSubcategory)}
                    </select>
                    ${canAddStructure ? `<button class="product-structure-add" data-structure-action="subcategory" type="button"${hasKnownCategory ? "" : " disabled"}>+ Добавить</button>` : ""}
                </span>
            </label>
            <label>
                <span>Цена</span>
                <input name="price" type="number" step="0.01" min="0" value="${product.price ?? ""}">
            </label>
            <label>
                <span>Вес</span>
                <input name="weight" type="number" step="0.001" min="0" value="${product.weight ?? 0}">
            </label>
            <label>
                <span>Единица</span>
                <select name="unit">
                    ${renderUnitOptions(product.unit || "шт")}
                </select>
            </label>
            <label>
                <span>Изображение</span>
                <input name="image" type="text" value="${escapeHtml(product.image || "")}" placeholder="img/product.png или символ">
            </label>
            <label class="product-form-wide">
                <span>Описание</span>
                <textarea name="description" rows="4">${escapeHtml(product.description || "")}</textarea>
            </label>
            <label class="product-checkbox">
                <input name="isActive" type="checkbox"${product.isActive !== false ? " checked" : ""}>
                <span>Активен</span>
            </label>
        </div>
    `;
}

function renderProductsView() {
    if (!productsView) return;

    const isAdmin = canEditProducts();
    const categoryOptions = productCategories.map(category => `
        <option value="${escapeHtml(category)}"${productFilters.category === category ? " selected" : ""}>${escapeHtml(category)}</option>
    `).join("");

    productsView.innerHTML = `
        <header class="crm-topbar">
            <div>
                <h1>Каталог</h1>
                <p>Товары MatMix</p>
            </div>
            <div class="crm-topbar-actions">
                <button class="products-export" type="button">Скачать прайс Excel</button>
                ${isAdmin ? `<button class="products-add" type="button">Добавить товар</button>` : ""}
            </div>
        </header>

        <section class="products-toolbar">
            <label>
                <span>Поиск</span>
                <input id="productSearchInput" type="search" value="${escapeHtml(productFilters.search)}" placeholder="Название">
            </label>
            <label>
                <span>Категория</span>
                <select id="productCategoryFilter">
                    <option value="">Все категории</option>
                    ${categoryOptions}
                </select>
            </label>
            <label>
                <span>Фильтр</span>
                <select id="productStatusFilter">
                    <option value=""${productFilters.status === "" ? " selected" : ""}>Все</option>
                    <option value="active"${productFilters.status === "active" ? " selected" : ""}>Активные</option>
                    <option value="hidden"${productFilters.status === "hidden" ? " selected" : ""}>Скрытые</option>
                    <option value="deleted"${productFilters.status === "deleted" ? " selected" : ""}>Удаленные</option>
                </select>
            </label>
        </section>

        <section class="products-list">
            ${productsLoading ? renderCrmLoader("Загружаем каталог...") : renderProductsList()}
        </section>
    `;
}

function renderProductsList() {
    if (!productsLoaded) {
        return `<p class="settings-muted">Каталог еще не загружен.</p>`;
    }

    if (!products.length) {
        return `
            <section class="empty-state">
                <h2>${isDeletedProductsFilter() ? "Удаленных товаров нет" : "Товары не найдены"}</h2>
                <p>${isDeletedProductsFilter() ? "Удаленные товары появятся здесь после удаления из каталога." : "Измените фильтр или добавьте новый товар."}</p>
            </section>
        `;
    }

    return `
        <div class="products-table" role="table" aria-label="Товары">
            <div class="products-row products-head" role="row">
                <span>Товар</span>
                <span>Описание</span>
                <span>Статус</span>
                <span></span>
            </div>
            ${products.map(renderProductRow).join("")}
        </div>
        ${renderPaginationControls(productsPagination, {
            id: "products",
            loadedCount: products.length,
            loading: productsLoading
        })}
    `;
}

function renderProductsListContainer() {
    const list = productsView?.querySelector(".products-list");
    if (!list) {
        renderProductsView();
        return;
    }

    list.innerHTML = productsLoading ? renderCrmLoader("Загружаем каталог...") : renderProductsList();
}

function appendProductsToList(nextProducts = []) {
    const list = productsView?.querySelector(".products-list");
    const table = list?.querySelector(".products-table");
    if (!list || !table) {
        renderProductsListContainer();
        return;
    }

    removeCrmPagination(list);
    appendCrmHtml(table, nextProducts.map(renderProductRow).join(""));
    appendCrmHtml(list, renderPaginationControls(productsPagination, {
        id: "products",
        loadedCount: products.length
    }));
}

function renderProductRow(product) {
    const isDeleted = Boolean(product.deletedAt);
    const productMeta = `
        <div class="product-meta-pills">
            <span>Цена: ${product.price === null ? "—" : formatMoney(product.price)}</span>
            <span>Вес: ${formatWeight(product.weight)}</span>
            <span>Ед.: ${escapeHtml(product.unit || "шт")}</span>
        </div>
    `;
    const deletedMeta = isDeleted
        ? `<small class="product-deleted-meta">
            Удален: ${escapeHtml(formatDate(product.deletedAt))}
            ${product.deletedByName ? ` · ${escapeHtml(product.deletedByName)}` : ""}
        </small>`
        : "";
    const actions = canEditProducts()
        ? (isDeleted
            ? `
            <div class="product-actions">
                <button class="product-restore" data-product-id="${product.id}" type="button">Восстановить</button>
            </div>
        `
            : `
            <div class="product-actions">
                <button class="product-edit" data-product-id="${product.id}" type="button">Редактировать</button>
                <button class="product-toggle" data-product-id="${product.id}" data-is-active="${product.isActive ? "0" : "1"}" type="button">
                    ${product.isActive ? "Скрыть" : "Показать"}
                </button>
                <button class="product-delete" data-product-id="${product.id}" type="button">Удалить</button>
            </div>
        `)
        : `<span class="settings-muted">Просмотр</span>`;

    return `
        <article class="products-row${isDeleted ? " is-deleted" : ""}" role="row" data-product-id="${product.id}">
            <div class="product-title-cell">
                <span class="product-thumb">${getProductImage(product)}</span>
                <div>
                    <strong>${escapeHtml(product.title)}</strong>
                    ${deletedMeta}
                </div>
            </div>
            <div class="product-info-cell">
                <div class="product-info-text">
                    <span>${escapeHtml(product.category || "—")}</span>
                    <span>${escapeHtml(product.subcategory || "—")}</span>
                </div>
                ${productMeta}
            </div>
            <span class="product-status ${isDeleted ? "deleted" : (product.isActive ? "active" : "hidden")}">${getProductStatusLabel(product)}</span>
            ${actions}
        </article>
    `;
}

function getProductsQuery(options = {}) {
    const { forExport = false } = options;
    const params = new URLSearchParams();
    if (productFilters.search) params.set("search", productFilters.search);
    if (productFilters.category) params.set("category", productFilters.category);
    if (!forExport && isDeletedProductsFilter()) {
        params.set("deleted", "true");
    } else if (productFilters.status && !isDeletedProductsFilter()) {
        params.set("status", productFilters.status);
    }
    if (!forExport) {
        params.set("page", productFilters.page || 1);
        params.set("limit", CRM_LIST_LIMIT);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
}

async function loadProducts(options = {}) {
    const { preserveControls = false, append = false } = options;
    const requestId = ++productsRequestId;
    productsLoading = !append;
    let uniqueNextProducts = [];
    let loaded = false;
    if (!append) {
        if (preserveControls) {
            renderProductsListContainer();
        } else {
            renderProductsView();
        }
    }

    try {
        const result = await CrmApi.get(`/api/products${getProductsQuery()}`);
        if (requestId !== productsRequestId) return;
        const nextProducts = result.products || [];
        uniqueNextProducts = nextProducts.filter(product => !products.some(existing => Number(existing.id) === Number(product.id)));
        products = append
            ? [...products, ...uniqueNextProducts].slice(-CRM_DOM_ACCUMULATION_LIMIT)
            : nextProducts;
        productsPagination = normalizePaginationMeta(result.pagination);
        productCategories = result.categories || [];
        productsLoaded = true;
        loaded = true;
    } catch (error) {
        if (requestId !== productsRequestId) return;
        notifyError(error, "Не удалось загрузить каталог.");
        if (!append) products = [];
    } finally {
        if (requestId !== productsRequestId) return;
        productsLoading = false;
        if (append && loaded) {
            appendProductsToList(uniqueNextProducts);
        } else if (append) {
            return;
        } else if (preserveControls) {
            renderProductsListContainer();
        } else {
            renderProductsView();
        }
    }
}

async function loadProductStructure() {
    const result = await CrmApi.get("/api/products/structure");
    productStructure = result.categories || [];
    return productStructure;
}

function parseStructurePosition(value) {
    if (value === "start") return { position: "start" };
    if (value?.startsWith("after:")) {
        return { position: "after", afterId: Number(value.slice(6)) || null };
    }
    return { position: "end" };
}

function renderCategoryPositionOptions() {
    return `
        <option value="start">В начале списка</option>
        ${productStructure.map(category => `
            <option value="after:${category.id}">После: ${escapeHtml(category.name)}</option>
        `).join("")}
        <option value="end" selected>В конце списка</option>
    `;
}

function renderSubcategoryPositionOptions(category) {
    return `
        <option value="start">В начале списка</option>
        ${(category?.subcategories || []).map(subcategory => `
            <option value="after:${subcategory.id}">После: ${escapeHtml(subcategory.name)}</option>
        `).join("")}
        <option value="end" selected>В конце списка</option>
    `;
}

function renderCreateCategoryForm() {
    return `
        <div class="product-form-grid">
            <label class="product-form-wide">
                <span>Название категории</span>
                <input name="name" type="text" required>
            </label>
            <label class="product-form-wide">
                <span>Расположение</span>
                <select name="position">
                    ${renderCategoryPositionOptions()}
                </select>
            </label>
        </div>
    `;
}

function renderCreateSubcategoryForm(category) {
    return `
        <div class="product-form-grid">
            <label class="product-form-wide">
                <span>Родительская категория</span>
                <input type="text" value="${escapeHtml(category?.name || "")}" disabled>
            </label>
            <label class="product-form-wide">
                <span>Название подкатегории</span>
                <input name="name" type="text" required>
            </label>
            <label class="product-form-wide">
                <span>Расположение</span>
                <select name="position">
                    ${renderSubcategoryPositionOptions(category)}
                </select>
            </label>
        </div>
    `;
}

function refreshCategorySelect(formElement, selectedValue = "") {
    const categorySelect = formElement.querySelector("select[name='category']");
    if (!categorySelect) return;
    categorySelect.innerHTML = renderCategoryOptions(selectedValue);
    categorySelect.value = selectedValue;
}

function refreshSubcategorySelect(formElement, selectedValue = "") {
    const categorySelect = formElement.querySelector("select[name='category']");
    const subcategorySelect = formElement.querySelector("select[name='subcategory']");
    const addButton = formElement.querySelector("[data-structure-action='subcategory']");
    if (!categorySelect || !subcategorySelect) return;

    const category = getStructureCategoryByName(categorySelect.value);
    const selectedSubcategory = category ? getStructureSubcategoryByName(category, selectedValue) : null;
    const nextValue = selectedSubcategory ? selectedValue : "";
    subcategorySelect.innerHTML = renderSubcategoryOptions(categorySelect.value, selectedSubcategory ? selectedValue : "");
    subcategorySelect.disabled = !category;
    subcategorySelect.value = nextValue;
    if (addButton) {
        addButton.disabled = !category;
    }
}

async function openCreateCategoryForm(formElement) {
    const formData = await CrmModal.form({
        title: "Добавить категорию",
        content: renderCreateCategoryForm(),
        submitText: "Добавить"
    });
    if (!formData) return;

    const result = await CrmApi.post("/api/products/structure/categories", {
        name: String(formData.get("name") || "").trim(),
        ...parseStructurePosition(formData.get("position"))
    });
    await loadProductStructure();
    refreshCategorySelect(formElement, result.item.name);
    refreshSubcategorySelect(formElement, "");
    notifySuccess("Категория добавлена.");
}

async function openCreateSubcategoryForm(formElement) {
    const categorySelect = formElement.querySelector("select[name='category']");
    const category = getStructureCategoryByName(categorySelect?.value);
    if (!category) {
        notifyWarning("Сначала выберите категорию.");
        return;
    }

    const formData = await CrmModal.form({
        title: "Добавить подкатегорию",
        content: renderCreateSubcategoryForm(category),
        submitText: "Добавить"
    });
    if (!formData) return;

    const result = await CrmApi.post("/api/products/structure/subcategories", {
        categoryId: category.id,
        name: String(formData.get("name") || "").trim(),
        ...parseStructurePosition(formData.get("position"))
    });
    await loadProductStructure();
    refreshCategorySelect(formElement, category.name);
    refreshSubcategorySelect(formElement, result.item.name);
    notifySuccess("Подкатегория добавлена.");
}

function setupProductFormControls(formElement) {
    formElement.querySelector("select[name='category']")?.addEventListener("change", () => {
        refreshSubcategorySelect(formElement, "");
    });

    formElement.querySelector("[data-structure-action='category']")?.addEventListener("click", async () => {
        try {
            await openCreateCategoryForm(formElement);
        } catch (error) {
            notifyError(error, "Не удалось добавить категорию.");
        }
    });

    formElement.querySelector("[data-structure-action='subcategory']")?.addEventListener("click", async () => {
        try {
            await openCreateSubcategoryForm(formElement);
        } catch (error) {
            notifyError(error, "Не удалось добавить подкатегорию.");
        }
    });
}

async function openProductForm(product = null) {
    if (!canEditProducts()) return;

    try {
        await loadProductStructure();
    } catch (error) {
        notifyError(error, "Не удалось загрузить структуру каталога.");
        return;
    }

    const formData = await CrmModal.form({
        title: product ? "Редактировать товар" : "Добавить товар",
        content: renderProductForm(product || { isActive: true }),
        submitText: product ? "Сохранить" : "Создать",
        draftKey: product ? `product:${product.id}` : "product:new",
        onReady: ({ formElement }) => setupProductFormControls(formElement)
    });

    if (!formData) return;

    const payload = getProductPayloadFromForm(formData);
    if (!payload.title) {
        notifyWarning("Укажите название товара.");
        return;
    }

    try {
        if (product) {
            await CrmApi.patch(`/api/products/${product.id}`, payload);
            notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_UPDATED);
        } else {
            await CrmApi.post("/api/products", payload);
            notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_CREATED);
        }
        await loadProducts();
    } catch (error) {
        notifyError(error, product ? "Не удалось обновить товар." : "Не удалось создать товар.");
    }
}

async function toggleProductStatus(productId, isActive) {
    try {
        await CrmApi.patch(`/api/products/${productId}/status`, { isActive });
        notifySuccess(isActive ? CRM_MESSAGES.SUCCESS_PRODUCT_SHOWN : CRM_MESSAGES.SUCCESS_PRODUCT_HIDDEN);
        await loadProducts();
    } catch (error) {
        notifyError(error, "Не удалось изменить статус товара.");
    }
}

async function deleteProduct(productId) {
    if (!canEditProducts()) return;

    const confirmed = await CrmModal.open({
        title: CRM_MESSAGES.CONFIRM_DELETE_PRODUCT_TITLE,
        message: "Товар будет скрыт из каталога и перемещен в удаленные. Старые заказы не изменятся.",
        confirmText: CRM_MESSAGES.CONFIRM_DELETE_PRODUCT_ACTION
    });

    if (!confirmed) return;

    try {
        await CrmApi.delete(`/api/products/${productId}`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_DELETED);
        await loadProducts();
    } catch (error) {
        notifyError(error, "Не удалось удалить товар.");
    }
}

async function restoreProduct(productId) {
    if (!canEditProducts()) return;

    const confirmed = await CrmModal.open({
        title: CRM_MESSAGES.CONFIRM_RESTORE_PRODUCT_TITLE,
        message: "Товар снова появится в CRM-каталоге и на публичном сайте.",
        confirmText: CRM_MESSAGES.CONFIRM_RESTORE_PRODUCT_ACTION
    });

    if (!confirmed) return;

    try {
        await CrmApi.post(`/api/products/${productId}/restore`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_RESTORED);
        await loadProducts();
    } catch (error) {
        notifyError(error, "Не удалось восстановить товар.");
    }
}

async function downloadProductsPriceLegacy() {
    try {
        await CrmApi.download(`/api/products/export/excel${getProductsQuery({ forExport: true })}`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRICE_DOWNLOADED);
    } catch (error) {
        notifyError(error, "Не удалось скачать прайс.");
    }
}

async function downloadProductsPrice(button = null) {
    const previousText = button?.textContent || "";
    if (button) {
        button.disabled = true;
        button.textContent = "Формирование прайса...";
    }
    try {
        await CrmApi.download(`/api/products/export/excel${getProductsQuery({ forExport: true })}`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRICE_DOWNLOADED);
    } catch (error) {
        notifyError(error, "Не удалось скачать прайс.");
    } finally {
        if (button?.isConnected) {
            button.disabled = false;
            button.textContent = previousText || "Скачать прайс Excel";
        }
    }
}
