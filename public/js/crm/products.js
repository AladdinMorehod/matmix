function canEditProducts() {
    return currentUser?.role === "admin";
}

let productStructure = [];
let catalogInnerMode = "products";
let activeProductStructureFilter = null;
const productImageAllowedTypes = ["image/jpeg", "image/png", "image/webp"];
const productImageMaxSize = 10 * 1024 * 1024;
const productUnitOptions = ["шт", "кг", "м", "м2"];
const productGroupMaxLength = 200;

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

function getProductImageFilterPayload() {
    const filters = {};
    if (productFilters.search) filters.search = productFilters.search;
    if (productFilters.category) filters.category = productFilters.category;
    if (productFilters.status === "deleted") {
        filters.status = "deleted";
    } else if (productFilters.status) {
        filters.status = productFilters.status;
    }
    return filters;
}

function hasActiveProductImageFilters() {
    const filters = getProductImageFilterPayload();
    return Object.keys(filters).some(key => String(filters[key] || "").trim());
}

function getFilteredProductImageTargetCount() {
    return Number(productsPagination?.total) || 0;
}

function getCatalogProductImageTargetCount() {
    return Number(productsTotalCount) || 0;
}

function getProductImage(product) {
    const value = product.image || "";
    return value && value.includes("/") ? `<img src="${escapeHtml(value)}" alt="">` : `<span>${escapeHtml(value || "Т")}</span>`;
}

function getProductImageUrl(product = {}) {
    const value = String(product.imageUrl || product.image_url || "").trim();
    return value.startsWith("/uploads/products/") && !value.includes("..") && !value.includes("\\") ? value : "";
}

function getProductImage(product) {
    const imageUrl = getProductImageUrl(product);
    if (imageUrl) return `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.title || product.name || "Товар")}" loading="lazy" decoding="async" width="600" height="600">`;

    const value = product.image || "";
    return `<span>${escapeHtml(value && !value.includes("/") ? value : "Т")}</span>`;
}

function formatProductImageSize(size) {
    if (!Number.isFinite(size)) return "";
    if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} МБ`;
    return `${Math.max(1, Math.round(size / 1024))} КБ`;
}

function validateProductImageFile(file) {
    if (!file) return "Выберите изображение.";
    if (!productImageAllowedTypes.includes(file.type)) return "Можно загрузить только JPG, PNG или WebP.";
    if (file.size > productImageMaxSize) return "Файл слишком большой. Максимум 10 МБ.";
    return "";
}

function getProductPayloadFromForm(formData) {
    return {
        title: String(formData.get("title") || "").trim(),
        category: String(formData.get("category") || "").trim(),
        subcategory: String(formData.get("subcategory") || "").trim(),
        productGroup: String(formData.get("productGroup") || "").trim(),
        price: String(formData.get("price") || "").trim(),
        weight: String(formData.get("weight") || "").trim(),
        unit: String(formData.get("unit") || "шт").trim(),
        description: String(formData.get("description") || "").trim(),
        isActive: formData.get("isActive") === "on"
    };
}

function getProductGroupValue(product = {}) {
    return String(product.productGroup ?? product.product_group ?? "").trim();
}

function getProductGroupSuggestions() {
    return [...new Set(products
        .map(getProductGroupValue)
        .filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, "ru"));
}

function renderProductGroupOptions() {
    return getProductGroupSuggestions()
        .map(group => `<option value="${escapeHtml(group)}"></option>`)
        .join("");
}

function renderAllProductSubcategoryOptions() {
    const subcategories = [...new Set(productStructure
        .flatMap(category => category.subcategories || [])
        .map(subcategory => String(subcategory.name || "").trim())
        .filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, "ru"));
    return `<option value="">Выберите подкатегорию</option>${subcategories
        .map(subcategory => `<option value="${escapeHtml(subcategory)}">${escapeHtml(subcategory)}</option>`)
        .join("")}`;
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

function renderProductImageManager(product = {}) {
    const imageUrl = getProductImageUrl(product);
    const canUpload = Boolean(product.id);
    const preview = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="">`
        : `<span>${escapeHtml((product.image || "Т").slice(0, 2))}</span>`;

    return `
        <section class="product-image-manager product-form-wide" data-product-image-manager>
            <div class="product-image-preview" data-product-image-preview>
                ${preview}
            </div>
            <div class="product-image-controls">
                <strong>Изображение товара</strong>
                <small data-product-image-file>${imageUrl ? escapeHtml(imageUrl) : "Фото не назначено"}</small>
                <input data-product-image-input type="file" accept="image/jpeg,image/png,image/webp"${canUpload ? "" : " disabled"}>
                <div class="product-image-actions">
                    <button data-product-image-upload type="button"${canUpload ? "" : " disabled"}>Загрузить</button>
                    <button data-product-image-delete type="button"${canUpload && imageUrl ? "" : " disabled"}>Удалить</button>
                </div>
                ${canUpload ? "" : `<small>Сначала создайте товар, затем загрузите фото.</small>`}
            </div>
        </section>
    `;
}

function renderProductForm(product = {}) {
    const selectedCategory = product.category || "";
    const selectedSubcategory = product.subcategory || "";
    const selectedProductGroup = getProductGroupValue(product);
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
                <span>Группа товаров</span>
                <input
                    name="productGroup"
                    type="text"
                    list="product-group-options"
                    maxlength="${productGroupMaxLength}"
                    value="${escapeHtml(selectedProductGroup)}"
                    autocomplete="off"
                >
                <datalist id="product-group-options">${renderProductGroupOptions()}</datalist>
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
                ${renderProductImageManager(product)}
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
                <p>${catalogInnerMode === "products" ? "Товары MatMix" : "Диагностика структуры каталога"}</p>
            </div>
            <div class="crm-topbar-actions">
                ${catalogInnerMode === "products" ? `
                    <button class="products-export" type="button">Скачать прайс Excel</button>
                    ${isAdmin ? `<button class="products-add" type="button">Добавить товар</button>` : ""}
                ` : ""}
            </div>
        </header>

        <div class="catalog-inner-tabs" role="tablist" aria-label="Режим каталога">
            <button type="button" role="tab" id="catalogProductsTab" data-catalog-mode="products"
                aria-selected="${catalogInnerMode === "products"}" aria-controls="catalogProductsPanel"
                class="${catalogInnerMode === "products" ? "active" : ""}">Товары</button>
            <button type="button" role="tab" id="catalogStructureTab" data-catalog-mode="structure"
                aria-selected="${catalogInnerMode === "structure"}" aria-controls="catalogEmbeddedStructurePanel"
                class="${catalogInnerMode === "structure" ? "active" : ""}">Структура</button>
        </div>

        <div id="catalogProductsPanel" role="tabpanel" aria-labelledby="catalogProductsTab"${catalogInnerMode === "products" ? "" : " hidden"}>
        ${activeProductStructureFilter ? `<section class="product-structure-filter-chip" role="status">
            <strong>Структура: ${escapeHtml(activeProductStructureFilter.label)}</strong>
            <button type="button" data-product-structure-filter-reset>Сбросить</button>
        </section>` : ""}
        <section class="products-toolbar">
            <label>
                <span>Поиск</span>
                <input id="productSearchInput" type="search" value="${escapeHtml(productFilters.search)}" placeholder="Название">
            </label>
            <label>
                <span>Категория</span>
                <select id="productCategoryFilter"${activeProductStructureFilter ? " disabled" : ""}>
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

        ${isAdmin ? renderProductImageBulkToolbar() : ""}

        <section class="products-list">
            ${productsLoading ? renderCrmLoader("Загружаем каталог...") : renderProductsList()}
        </section>
        </div>
        <section id="catalogEmbeddedStructurePanel" class="catalog-embedded-structure" role="tabpanel"
            aria-labelledby="catalogStructureTab"${catalogInnerMode === "structure" ? "" : " hidden"}></section>
    `;

    const embeddedRoot = productsView.querySelector("#catalogEmbeddedStructurePanel");
    if (typeof mountEmbeddedCatalogStructureView === "function") {
        mountEmbeddedCatalogStructureView(embeddedRoot);
        if (catalogInnerMode === "structure") loadEmbeddedCatalogStructureAudit();
    }
}

function setCatalogInnerMode(mode) {
    const nextMode = mode === "structure" ? "structure" : "products";
    if (catalogInnerMode === nextMode) return;
    catalogInnerMode = nextMode;
    renderProductsView();
}

async function showProductsForStructure(filter) {
    if (!filter || (!filter.nodeId && filter.mode !== "withoutStructure")) return;
    activeProductStructureFilter = {
        mode: filter.mode === "withoutStructure" ? "withoutStructure" : "node",
        nodeId: filter.nodeId ? Number(filter.nodeId) : null,
        label: String(filter.label || "Выбранный узел")
    };
    catalogInnerMode = "products";
    productFilters.search = "";
    productFilters.category = "";
    if (productFilters.status === "deleted") productFilters.status = "";
    productFilters.page = 1;
    products = [];
    productsPagination = normalizePaginationMeta();
    clearProductSelection();
    renderProductsView();
    await loadProducts({ preserveControls: true });
}

async function resetProductStructureFilter() {
    activeProductStructureFilter = null;
    productFilters.page = 1;
    products = [];
    productsPagination = normalizePaginationMeta();
    clearProductSelection();
    await loadProducts();
}

function renderProductImageBulkToolbar() {
    const selectedCount = selectedProductIds.size;
    const filteredCount = getFilteredProductImageTargetCount();
    const totalCount = getCatalogProductImageTargetCount();
    return `
        <section class="products-bulk-image">
            <strong>Фото для выбранных товаров</strong>
            <span data-products-selected-count>Выбрано: ${selectedCount}</span>
            <span data-products-filtered-count>Найдено: ${filteredCount}</span>
            <span data-products-total-count>Всего в каталоге: ${totalCount}</span>
            <input id="productBatchImageInput" type="file" accept="image/jpeg,image/png,image/webp">
            <button class="products-filter-image-upload" type="button" disabled>Назначить всем найденным</button>
            <button class="products-all-image-upload" type="button" disabled>Назначить всему каталогу</button>
            <small data-products-batch-image-file>Файл не выбран</small>
            <button class="products-batch-image-upload" type="button" disabled>Назначить фото</button>
            <button class="products-bulk-structure-edit" type="button"${selectedCount ? "" : " hidden"}>Изменить структуру</button>
            <button class="products-selection-clear" type="button"${selectedCount ? "" : " disabled"}>Снять выбор</button>
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

function updateProductSelectionControls() {
    const selectedCount = selectedProductIds.size;
    const countElement = productsView?.querySelector("[data-products-selected-count]");
    const filteredCountElement = productsView?.querySelector("[data-products-filtered-count]");
    const totalCountElement = productsView?.querySelector("[data-products-total-count]");
    const uploadButton = productsView?.querySelector(".products-batch-image-upload");
    const filterButton = productsView?.querySelector(".products-filter-image-upload");
    const allButton = productsView?.querySelector(".products-all-image-upload");
    const clearButton = productsView?.querySelector(".products-selection-clear");
    const structureButton = productsView?.querySelector(".products-bulk-structure-edit");
    const input = productsView?.querySelector("#productBatchImageInput");
    const fileLabel = productsView?.querySelector("[data-products-batch-image-file]");
    const file = input?.files?.[0] || null;
    const filteredCount = getFilteredProductImageTargetCount();
    const totalCount = getCatalogProductImageTargetCount();
    const canUseFiltered = Boolean(file && hasActiveProductImageFilters() && filteredCount > 0);

    if (countElement) countElement.textContent = `Выбрано: ${selectedCount}`;
    if (fileLabel) fileLabel.textContent = file ? `${file.name} (${formatProductImageSize(file.size)})` : "Файл не выбран";
    if (filteredCountElement) filteredCountElement.textContent = `Найдено: ${filteredCount}`;
    if (totalCountElement) totalCountElement.textContent = `Всего в каталоге: ${totalCount}`;
    if (uploadButton) uploadButton.disabled = !selectedCount || !file;
    if (filterButton) filterButton.disabled = !canUseFiltered;
    if (allButton) allButton.disabled = !file || totalCount <= 0;
    if (clearButton) clearButton.disabled = !selectedCount;
    if (structureButton) structureButton.hidden = !selectedCount;
}

function setProductSelected(productId, isSelected) {
    const id = String(productId || "");
    if (!id) return;
    if (isSelected) selectedProductIds.add(id);
    else selectedProductIds.delete(id);
    updateProductSelectionControls();
}

function clearProductSelection() {
    selectedProductIds.clear();
    productsView?.querySelectorAll(".product-select").forEach(input => {
        input.checked = false;
    });
    updateProductSelectionControls();
}

function getBulkProductStructureRequest(formData) {
    const changes = {};
    const changeCategory = formData.get("changeCategory") === "on";
    const changeSubcategory = formData.get("changeSubcategory") === "on";
    const changeProductGroup = formData.get("changeProductGroup") === "on";

    if (changeCategory) changes.category = String(formData.get("category") || "").trim();
    if (changeSubcategory) changes.subcategory = String(formData.get("subcategory") || "").trim();
    if (changeProductGroup) changes.productGroup = String(formData.get("productGroup") || "").trim();

    if (!Object.keys(changes).length) {
        notifyWarning("Выберите хотя бы одно поле для изменения.");
        return null;
    }
    if (changeCategory && !changes.category) {
        notifyWarning("Выберите новую категорию.");
        return null;
    }
    if (changeProductGroup && !changes.productGroup) {
        notifyWarning("Пустая группа не применяется массово.");
        return null;
    }

    return {
        productIds: [...selectedProductIds].map(Number),
        changes
    };
}

function renderBulkProductStructureConfirmation(request) {
    const valueOrUnchanged = (field, label) => Object.prototype.hasOwnProperty.call(request.changes, field)
        ? `${label}: ${escapeHtml(request.changes[field] || "пустое значение")}`
        : `${label}: не изменяется`;
    return `
        <section class="bulk-structure-confirmation" role="status">
            <strong>Будут изменены ${request.productIds.length} товаров.</strong>
            <span>${valueOrUnchanged("category", "Категория")}</span>
            <span>${valueOrUnchanged("subcategory", "Подкатегория")}</span>
            <span>${valueOrUnchanged("productGroup", "Группа")}</span>
            ${Object.prototype.hasOwnProperty.call(request.changes, "category")
                && !Object.prototype.hasOwnProperty.call(request.changes, "subcategory")
                ? "<small>Существующие подкатегории должны быть совместимы с новой категорией.</small>"
                : ""}
        </section>
    `;
}

async function openBulkProductStructureForm() {
    if (!canEditProducts() || !selectedProductIds.size) return;

    await CrmModal.form({
        title: "Изменить структуру товаров",
        description: `Выбрано товаров: ${selectedProductIds.size}`,
        submitText: "Продолжить",
        content: `
            <div class="product-form-grid bulk-product-structure-form">
                <label class="product-checkbox">
                    <input name="changeCategory" type="checkbox">
                    <span>Изменить категорию</span>
                </label>
                <label>
                    <span>Категория</span>
                    <select name="category" disabled>${renderCategoryOptions("")}</select>
                </label>
                <label class="product-checkbox">
                    <input name="changeSubcategory" type="checkbox">
                    <span>Изменить подкатегорию</span>
                </label>
                <label>
                    <span>Подкатегория</span>
                    <select name="subcategory" disabled>${renderAllProductSubcategoryOptions()}</select>
                </label>
                <label class="product-checkbox">
                    <input name="changeProductGroup" type="checkbox">
                    <span>Изменить группу</span>
                </label>
                <label>
                    <span>Группа товаров</span>
                    <input
                        name="productGroup"
                        type="text"
                        list="bulk-product-group-options"
                        maxlength="${productGroupMaxLength}"
                        autocomplete="off"
                        disabled
                    >
                    <datalist id="bulk-product-group-options">${renderProductGroupOptions()}</datalist>
                </label>
                <div class="product-form-wide" data-bulk-structure-confirmation></div>
            </div>
        `,
        onReady({ formElement }) {
            const categoryCheckbox = formElement.elements.changeCategory;
            const subcategoryCheckbox = formElement.elements.changeSubcategory;
            const groupCheckbox = formElement.elements.changeProductGroup;
            const categorySelect = formElement.elements.category;
            const subcategorySelect = formElement.elements.subcategory;
            const groupInput = formElement.elements.productGroup;
            const submitButton = formElement.querySelector(".crm-modal-primary");
            const confirmation = formElement.querySelector("[data-bulk-structure-confirmation]");

            const resetConfirmation = () => {
                delete formElement.dataset.confirmedRequest;
                confirmation.innerHTML = "";
                submitButton.textContent = "Продолжить";
            };
            const updateEnabledFields = () => {
                categorySelect.disabled = !categoryCheckbox.checked;
                subcategorySelect.disabled = !subcategoryCheckbox.checked;
                groupInput.disabled = !groupCheckbox.checked;
            };
            formElement.addEventListener("change", event => {
                updateEnabledFields();
                if (event.target === categorySelect && categoryCheckbox.checked) {
                    subcategorySelect.innerHTML = renderSubcategoryOptions(categorySelect.value, "");
                    subcategorySelect.value = "";
                } else if (event.target === categoryCheckbox || event.target === subcategoryCheckbox) {
                    subcategorySelect.innerHTML = categoryCheckbox.checked && categorySelect.value
                        ? renderSubcategoryOptions(categorySelect.value, "")
                        : renderAllProductSubcategoryOptions();
                    subcategorySelect.value = "";
                }
                resetConfirmation();
            });
            formElement.addEventListener("input", resetConfirmation);
            updateEnabledFields();
        },
        async onSubmit(formData, controls) {
            const request = getBulkProductStructureRequest(formData);
            if (!request) return false;
            const serializedRequest = JSON.stringify(request);
            if (controls.formElement.dataset.confirmedRequest !== serializedRequest) {
                controls.formElement.dataset.confirmedRequest = serializedRequest;
                controls.formElement.querySelector("[data-bulk-structure-confirmation]").innerHTML =
                    renderBulkProductStructureConfirmation(request);
                controls.formElement.querySelector(".crm-modal-primary").textContent = "Изменить товары";
                return false;
            }

            controls.setBusy(true, "Изменение...");
            try {
                const result = await CrmApi.patch("/api/products/bulk/structure", request);
                invalidateCatalogStructureReadonlyCache();
                clearProductSelection();
                await loadProducts({ preserveControls: true });
                notifySuccess(`Изменено товаров: ${result.updatedCount}.`);
                return true;
            } catch (error) {
                notifyError(error, "Не удалось изменить структуру выбранных товаров.");
                controls.setBusy(false);
                return false;
            }
        }
    });
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
    updateProductSelectionControls();
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
                ${canEditProducts() && !isDeleted ? `<input class="product-select" type="checkbox" data-product-id="${product.id}"${selectedProductIds.has(String(product.id)) ? " checked" : ""} aria-label="Select product">` : ""}
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
    if (activeProductStructureFilter?.mode === "withoutStructure") {
        params.set("structureMode", "withoutStructure");
    } else if (activeProductStructureFilter?.nodeId) {
        params.set("structureNodeId", activeProductStructureFilter.nodeId);
    }
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
        productsTotalCount = Number(result.productTotal) || productsTotalCount || Number(productsPagination.total) || 0;
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

    const position = parseStructurePosition(formData.get("position"));
    const item = await CatalogStructureCreate.createCategory({
        name: String(formData.get("name") || "").trim(),
        ...position
    });
    await loadProductStructure();
    refreshCategorySelect(formElement, item.name);
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

    const position = parseStructurePosition(formData.get("position"));
    const item = await CatalogStructureCreate.createSubcategory({
        parentId: category.id,
        name: String(formData.get("name") || "").trim(),
        ...position
    });
    await loadProductStructure();
    refreshCategorySelect(formElement, category.name);
    refreshSubcategorySelect(formElement, item.name);
    notifySuccess("Подкатегория добавлена.");
}

function updateProductImageManager(manager, product) {
    if (!manager || !product) return;

    const preview = manager.querySelector("[data-product-image-preview]");
    const fileLabel = manager.querySelector("[data-product-image-file]");
    const deleteButton = manager.querySelector("[data-product-image-delete]");
    const imageUrl = getProductImageUrl(product);

    if (preview) {
        preview.innerHTML = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="">`
            : `<span>${escapeHtml((product.image || "Т").slice(0, 2))}</span>`;
    }
    if (fileLabel) fileLabel.textContent = imageUrl || "Фото не назначено";
    if (deleteButton) deleteButton.disabled = !imageUrl;
}

async function uploadProductImage(product, formElement) {
    const manager = formElement.querySelector("[data-product-image-manager]");
    const input = manager?.querySelector("[data-product-image-input]");
    const uploadButton = manager?.querySelector("[data-product-image-upload]");
    const file = input?.files?.[0] || null;
    const validationMessage = validateProductImageFile(file);
    if (validationMessage) {
        notifyWarning(validationMessage);
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    if (uploadButton) uploadButton.disabled = true;

    try {
        const result = await CrmApi.post(`/api/products/${product.id}/image`, formData);
        Object.assign(product, result.product || {}, {
            imageUrl: result.imageUrl || result.image_url || result.product?.imageUrl || "",
            image_url: result.image_url || result.imageUrl || result.product?.image_url || ""
        });
        if (input) input.value = "";
        updateProductImageManager(manager, product);
        notifySuccess("Изображение товара загружено.");
        await loadProducts({ preserveControls: true });
    } catch (error) {
        notifyError(error, "Не удалось загрузить изображение товара.");
    } finally {
        if (uploadButton) uploadButton.disabled = false;
    }
}

async function deleteProductImage(product, formElement) {
    const manager = formElement.querySelector("[data-product-image-manager]");
    const deleteButton = manager?.querySelector("[data-product-image-delete]");
    if (deleteButton) deleteButton.disabled = true;

    try {
        const result = await CrmApi.delete(`/api/products/${product.id}/image`);
        Object.assign(product, result.product || {}, { imageUrl: "", image_url: "" });
        updateProductImageManager(manager, product);
        notifySuccess("Изображение товара удалено.");
        await loadProducts({ preserveControls: true });
    } catch (error) {
        notifyError(error, "Не удалось удалить изображение товара.");
    } finally {
        if (deleteButton) deleteButton.disabled = !getProductImageUrl(product);
    }
}

async function uploadImageForSelectedProducts() {
    const input = productsView?.querySelector("#productBatchImageInput");
    const file = input?.files?.[0] || null;
    const validationMessage = validateProductImageFile(file);
    if (!selectedProductIds.size) {
        notifyWarning("Выберите товары для назначения фото.");
        return;
    }
    if (validationMessage) {
        notifyWarning(validationMessage);
        return;
    }

    const button = productsView?.querySelector(".products-batch-image-upload");
    const previousButtonText = button?.textContent || "";
    const formData = new FormData();
    formData.append("image", file);
    formData.append("productIds", JSON.stringify([...selectedProductIds]));
    if (button) {
        button.disabled = true;
        button.textContent = "Загрузка...";
    }

    try {
        const result = await CrmApi.post("/api/products/images/batch", formData);
        notifySuccess(`Изображение назначено товарам: ${result.updated || selectedProductIds.size}.`);
        if (input) input.value = "";
        clearProductSelection();
        await loadProducts({ preserveControls: true });
    } catch (error) {
        notifyError(error, "Не удалось назначить изображение выбранным товарам.");
    } finally {
        if (button) button.textContent = previousButtonText || "Назначить фото";
        updateProductSelectionControls();
    }
}

function setProductImageBulkLoading(isLoading, activeButton = null) {
    const buttons = productsView?.querySelectorAll(".products-bulk-image button") || [];
    buttons.forEach(button => {
        button.disabled = isLoading || button.disabled;
    });
    if (activeButton) {
        activeButton.dataset.originalText = activeButton.dataset.originalText || activeButton.textContent || "";
        activeButton.textContent = isLoading ? "Загрузка..." : (activeButton.dataset.originalText || activeButton.textContent);
    }
    if (!isLoading) updateProductSelectionControls();
}

async function confirmProductImageFilterUpload(scope, targetCount) {
    if (scope === "filtered") {
        return CrmModal.open({
            title: "Назначить изображение найденным",
            message: `Изображение будет назначено ${targetCount} товарам, соответствующим текущим фильтрам. Продолжить?`,
            confirmText: "Назначить"
        });
    }

    const firstConfirmed = await CrmModal.open({
        title: "Опасное массовое действие",
        message: `Вы собираетесь назначить одно изображение всем ${targetCount} товарам каталога. Текущие изображения этих товаров будут заменены. Продолжить?`,
        confirmText: "Продолжить"
    });
    if (!firstConfirmed) return false;

    return CrmModal.open({
        title: "Финальное подтверждение",
        message: "Подтвердите назначение изображения всему каталогу.",
        confirmText: "ПРИМЕНИТЬ"
    });
}

async function uploadImageByProductFilter(scope, button) {
    const input = productsView?.querySelector("#productBatchImageInput");
    const file = input?.files?.[0] || null;
    const validationMessage = validateProductImageFile(file);
    const targetCount = scope === "all" ? getCatalogProductImageTargetCount() : getFilteredProductImageTargetCount();

    if (validationMessage) {
        notifyWarning(validationMessage);
        return;
    }
    if (scope === "filtered" && !hasActiveProductImageFilters()) {
        notifyWarning("Задайте фильтр или используйте кнопку назначения всему каталогу.");
        return;
    }
    if (targetCount <= 0) {
        notifyWarning("Нет товаров для назначения изображения.");
        return;
    }

    const confirmed = await confirmProductImageFilterUpload(scope, targetCount);
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("scope", scope);
    formData.append("filters", JSON.stringify(scope === "filtered" ? getProductImageFilterPayload() : {}));

    setProductImageBulkLoading(true, button);
    try {
        const result = await CrmApi.post("/api/products/images/by-filter", formData);
        notifySuccess(`Изображение назначено товарам: ${result.updated || 0}. URL: ${result.imageUrl || result.image_url || ""}`);
        if (input) input.value = "";
        await loadProducts({ preserveControls: true });
    } catch (error) {
        notifyError(error, "Не удалось назначить изображение товарам.");
    } finally {
        setProductImageBulkLoading(false, button);
    }
}

function setupProductImageControls(formElement, product) {
    const legacyImageInput = formElement.querySelector("input[name='image']");
    legacyImageInput?.closest("label")?.remove();

    const manager = formElement.querySelector("[data-product-image-manager]");
    const descriptionLabel = formElement.querySelector("textarea[name='description']")?.closest("label");
    if (manager && descriptionLabel?.contains(manager)) {
        descriptionLabel.before(manager);
    }

    const input = manager?.querySelector("[data-product-image-input]");
    const preview = manager?.querySelector("[data-product-image-preview]");
    const fileLabel = manager?.querySelector("[data-product-image-file]");
    input?.addEventListener("change", () => {
        const file = input.files?.[0] || null;
        const validationMessage = file ? validateProductImageFile(file) : "";
        if (validationMessage) {
            notifyWarning(validationMessage);
            input.value = "";
            updateProductImageManager(manager, product);
            return;
        }
        if (!file) {
            updateProductImageManager(manager, product);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        if (preview) {
            preview.innerHTML = `<img src="${escapeHtml(objectUrl)}" alt="">`;
            preview.querySelector("img")?.addEventListener("load", () => URL.revokeObjectURL(objectUrl), { once: true });
        }
        if (fileLabel) fileLabel.textContent = `${file.name} (${formatProductImageSize(file.size)})`;
    });

    manager?.querySelector("[data-product-image-upload]")?.addEventListener("click", () => uploadProductImage(product, formElement));
    manager?.querySelector("[data-product-image-delete]")?.addEventListener("click", () => deleteProductImage(product, formElement));
}

function setupProductFormControls(formElement, product = {}) {
    setupProductImageControls(formElement, product);

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
        onReady: ({ formElement }) => setupProductFormControls(formElement, product || {})
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
            invalidateCatalogStructureReadonlyCache();
            notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_UPDATED);
        } else {
            await CrmApi.post("/api/products", payload);
            invalidateCatalogStructureReadonlyCache();
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
        invalidateCatalogStructureReadonlyCache();
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
        invalidateCatalogStructureReadonlyCache();
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
        invalidateCatalogStructureReadonlyCache();
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
