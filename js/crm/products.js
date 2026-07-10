function canEditProducts() {
    return currentUser?.role === "admin";
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

function renderProductForm(product = {}) {
    return `
        <div class="product-form-grid">
            <label>
                <span>Название</span>
                <input name="title" type="text" value="${escapeHtml(product.title || "")}" required>
            </label>
            <label>
                <span>Категория</span>
                <input name="category" type="text" value="${escapeHtml(product.category || "")}">
            </label>
            <label>
                <span>Подкатегория</span>
                <input name="subcategory" type="text" value="${escapeHtml(product.subcategory || "")}">
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
                <input name="unit" type="text" value="${escapeHtml(product.unit || "шт")}">
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
    const query = params.toString();
    return query ? `?${query}` : "";
}

async function loadProducts(options = {}) {
    const { preserveControls = false } = options;
    productsLoading = true;
    if (preserveControls) {
        renderProductsListContainer();
    } else {
        renderProductsView();
    }

    try {
        const result = await CrmApi.get(`/api/products${getProductsQuery()}`);
        products = result.products || [];
        productCategories = result.categories || [];
        productsLoaded = true;
    } catch (error) {
        notifyError(error, "Не удалось загрузить каталог.");
        products = [];
    } finally {
        productsLoading = false;
        if (preserveControls) {
            renderProductsListContainer();
        } else {
            renderProductsView();
        }
    }
}

async function openProductForm(product = null) {
    if (!canEditProducts()) return;

    const formData = await CrmModal.form({
        title: product ? "Редактировать товар" : "Добавить товар",
        content: renderProductForm(product || { isActive: true }),
        submitText: product ? "Сохранить" : "Создать",
        draftKey: product ? `product:${product.id}` : "product:new"
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

async function downloadProductsPrice() {
    try {
        await CrmApi.download(`/api/products/export/excel${getProductsQuery({ forExport: true })}`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRICE_DOWNLOADED);
    } catch (error) {
        notifyError(error, "Не удалось скачать прайс.");
    }
}
