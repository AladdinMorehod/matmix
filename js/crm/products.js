function canEditProducts() {
    return currentUser?.role === "admin";
}

function getProductStatusLabel(product) {
    return product.isActive ? "Активен" : "Скрыт";
}

function getProductImage(product) {
    const value = product.image || "";
    return value && value.includes("/") ? `<img src="${escapeHtml(value)}" alt="">` : `<span>${escapeHtml(value || "Т")}</span>`;
}

function getProductPayloadFromForm(formData) {
    return {
        title: String(formData.get("title") || "").trim(),
        externalId: String(formData.get("externalId") || "").trim(),
        slug: String(formData.get("slug") || "").trim(),
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
                <span>External ID</span>
                <input name="externalId" type="text" value="${escapeHtml(product.externalId || "")}" required>
            </label>
            <label>
                <span>Slug</span>
                <input name="slug" type="text" value="${escapeHtml(product.slug || "")}">
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
                <input id="productSearchInput" type="search" value="${escapeHtml(productFilters.search)}" placeholder="Название или External ID">
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
                <h2>Товары не найдены</h2>
                <p>Измените фильтр или добавьте новый товар.</p>
            </section>
        `;
    }

    return `
        <div class="products-table" role="table" aria-label="Товары">
            <div class="products-row products-head" role="row">
                <span>Товар</span>
                <span>Категория</span>
                <span>Подкатегория</span>
                <span>Цена</span>
                <span>Вес</span>
                <span>Ед.</span>
                <span>Статус</span>
                <span>Источник</span>
                <span></span>
            </div>
            ${products.map(renderProductRow).join("")}
        </div>
    `;
}

function renderProductRow(product) {
    const actions = canEditProducts()
        ? `
            <div class="product-actions">
                <button class="product-edit" data-product-id="${product.id}" type="button">Редактировать</button>
                <button class="product-toggle" data-product-id="${product.id}" data-is-active="${product.isActive ? "0" : "1"}" type="button">
                    ${product.isActive ? "Скрыть" : "Показать"}
                </button>
            </div>
        `
        : `<span class="settings-muted">Просмотр</span>`;

    return `
        <article class="products-row" role="row" data-product-id="${product.id}">
            <div class="product-title-cell">
                <span class="product-thumb">${getProductImage(product)}</span>
                <div>
                    <strong>${escapeHtml(product.title)}</strong>
                    <small>${escapeHtml(product.externalId)}</small>
                </div>
            </div>
            <span>${escapeHtml(product.category || "—")}</span>
            <span>${escapeHtml(product.subcategory || "—")}</span>
            <span>${product.price === null ? "—" : formatMoney(product.price)}</span>
            <span>${formatWeight(product.weight)}</span>
            <span>${escapeHtml(product.unit || "шт")}</span>
            <span class="product-status ${product.isActive ? "active" : "hidden"}">${getProductStatusLabel(product)}</span>
            <span>${escapeHtml(product.source || "crm")}</span>
            ${actions}
        </article>
    `;
}

function getProductsQuery() {
    const params = new URLSearchParams();
    if (productFilters.search) params.set("search", productFilters.search);
    if (productFilters.category) params.set("category", productFilters.category);
    if (productFilters.status) params.set("status", productFilters.status);
    const query = params.toString();
    return query ? `?${query}` : "";
}

async function loadProducts() {
    productsLoading = true;
    renderProductsView();

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
        renderProductsView();
    }
}

async function openProductForm(product = null) {
    if (!canEditProducts()) return;

    const formData = await CrmModal.form({
        title: product ? "Редактировать товар" : "Добавить товар",
        content: renderProductForm(product || { isActive: true }),
        submitText: product ? "Сохранить" : "Создать"
    });

    if (!formData) return;

    const payload = getProductPayloadFromForm(formData);
    if (!payload.title || !payload.externalId) {
        notifyWarning("Укажите название и External ID товара.");
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

async function downloadProductsPrice() {
    try {
        await CrmApi.download(`/api/products/export/excel${getProductsQuery()}`);
        notifySuccess(CRM_MESSAGES.SUCCESS_PRICE_DOWNLOADED);
    } catch (error) {
        notifyError(error, "Не удалось скачать прайс.");
    }
}
