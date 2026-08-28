function canEditProducts() {
    return currentUser?.role === "admin";
}

function canReplaceAllProductImages() {
    return canEditProducts() && currentUser?.login === "admin";
}

let productStructure = [];
let catalogInnerMode = "products";
let activeProductStructureFilter = null;
const productImageAllowedTypes = ["image/jpeg", "image/png", "image/webp"];
const productImageMaxSize = 10 * 1024 * 1024;
const productUnitOptions = ["шт", "кг", "м", "м2"];
const productGroupMaxLength = 200;
let productContentEditor = { definitions: [], content: null };

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
        brand: String(formData.get("brand") || "").trim(),
        shortDescription: String(formData.get("shortDescription") || "").trim(),
        fullDescription: String(formData.get("fullDescription") || "").trim(),
        seoTitle: String(formData.get("seoTitle") || "").trim(),
        seoDescription: String(formData.get("seoDescription") || "").trim(),
        isActive: formData.get("isActive") === "on"
    };
}

function getProductContentPayloadFromForm(formData) {
    const attributes = [];
    for (const definition of productContentEditor.definitions) {
        const field = `attribute_${definition.id}`;
        if (!formData.has(field)) continue;
        const raw = formData.get(field);
        const value = definition.dataType === "boolean" ? raw === "true" : String(raw || "").trim();
        if (definition.dataType !== "boolean" && value === "") continue;
        attributes.push({
            definitionId: definition.id,
            value,
            unitOverride: String(formData.get(`attribute_unit_${definition.id}`) || "").trim(),
            sortOrder: Number(formData.get(`attribute_sort_${definition.id}`)) || 0
        });
    }
    return {
        brand: String(formData.get("brand") || "").trim(),
        shortDescription: String(formData.get("shortDescription") || "").trim(),
        fullDescription: String(formData.get("fullDescription") || "").trim(),
        seoTitle: String(formData.get("seoTitle") || "").trim(),
        seoDescription: String(formData.get("seoDescription") || "").trim(),
        attributes
    };
}

function getEditorAttributeRows() {
    const content = productContentEditor.content || {};
    const templates = content.templates || [];
    const values = content.values || [];
    const ids = new Set([...templates.map(item => item.definitionId), ...values.map(item => item.definitionId)]);
    return [...ids].map(id => {
        const definition = productContentEditor.definitions.find(item => item.id === id) || {};
        const template = templates.find(item => item.definitionId === id) || {};
        const value = values.find(item => item.definitionId === id) || {};
        return { ...definition, ...template, ...value, id, definitionId: id, value: value.value ?? "" };
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.label).localeCompare(String(b.label), "ru"));
}

function renderAttributeInput(item) {
    const name = `attribute_${item.definitionId}`;
    if (item.dataType === "boolean") return `<select name="${name}"><option value="">Не задано</option><option value="true"${item.value === true ? " selected" : ""}>Да</option><option value="false"${item.value === false ? " selected" : ""}>Нет</option></select>`;
    return `<input name="${name}" type="${item.dataType === "number" ? "number" : "text"}" ${item.dataType === "number" ? "step=\"any\"" : "maxlength=\"2000\""} value="${escapeHtml(item.value ?? "")}">`;
}

function getAttributeDataTypeLabel(dataType) {
    return ({ text: "Текст", number: "Число", boolean: "Логическое значение" })[dataType] || dataType || "";
}

function renderProductAttributes() {
    const rows = getEditorAttributeRows();
    const unused = productContentEditor.definitions.filter(item => item.isActive && !rows.some(row => row.definitionId === item.id));
    return `<div data-product-attributes>
        <div class="product-content-toolbar">
            <label><span>Дополнительная характеристика</span><select data-add-attribute><option value="">Выберите характеристику</option>${unused.map(item => `<option value="${item.id}">${escapeHtml(item.label)} (${escapeHtml(item.code)})</option>`).join("")}</select></label>
            <button type="button" data-add-attribute-button>Добавить</button>
            <button type="button" data-manage-definitions>Справочник характеристик</button>
        </div>
        ${rows.length ? `<div class="product-attribute-list">${rows.map(item => `<div class="product-attribute-row" data-definition-id="${item.definitionId}">
            <label><strong>${escapeHtml(item.label || item.code)}</strong><small>${escapeHtml(item.code)} · ${escapeHtml(getAttributeDataTypeLabel(item.dataType))}${item.isRequired ? " · обязательно" : ""}</small>${renderAttributeInput(item)}</label>
            <label><span>Единица</span><input name="attribute_unit_${item.definitionId}" maxlength="40" value="${escapeHtml(item.unit || item.defaultUnit || "")}"></label>
            <input name="attribute_sort_${item.definitionId}" type="hidden" value="${Number(item.sortOrder) || 0}">
            <button type="button" data-remove-attribute="${item.definitionId}" aria-label="Убрать характеристику">×</button>
        </div>`).join("")}</div>` : `<p class="product-content-empty">Для товара пока нет характеристик.</p>`}
        ${productContentEditor.content?.structureId ? `<div class="product-template-editor"><strong>Шаблон выбранной подкатегории</strong>${productContentEditor.definitions.filter(item => item.isActive).map(item => { const template = (productContentEditor.content.templates || []).find(row => row.definitionId === item.id); return `<label><input type="checkbox" name="templateDefinition" value="${item.id}"${template ? " checked" : ""}> ${escapeHtml(item.label)} <input name="templateSort_${item.id}" type="number" value="${template?.sortOrder ?? item.sortOrder ?? 0}" aria-label="Порядок"><input name="templateUnit_${item.id}" maxlength="40" value="${escapeHtml(template?.unit || "")}" placeholder="Другая единица"><input name="templateRequired_${item.id}" type="checkbox"${template?.isRequired ? " checked" : ""}> обязательно</label>`; }).join("")}</div>` : ""}
    </div>`;
}

function renderProductGallery(product = {}) {
    const images = productContentEditor.content?.images || [];
    return `<div data-product-gallery>
        ${renderProductImageManager(product)}
        ${product.id ? `<label class="product-gallery-upload"><span>Добавить изображения</span><input data-gallery-files type="file" multiple accept="image/jpeg,image/png,image/webp"><button data-gallery-upload type="button">Загрузить выбранные</button></label>` : ""}
        <div class="product-gallery-list">${images.map((image, index) => `<article class="product-gallery-item" data-image-id="${image.id}">
            <img src="${escapeHtml(image.imageUrl)}" alt="${escapeHtml(image.altText || "")}">
            <div><strong>${image.isPrimary ? "Главное изображение" : `Изображение ${index + 1}`}</strong><input data-gallery-alt maxlength="500" value="${escapeHtml(image.altText || "")}" placeholder="Альтернативный текст"><div class="product-gallery-actions"><button type="button" data-gallery-alt-save>Сохранить описание</button>${image.isPrimary ? "" : `<button type="button" data-gallery-primary>Сделать главным</button>`}<button type="button" data-gallery-up${index === 0 ? " disabled" : ""}>↑</button><button type="button" data-gallery-down${index === images.length - 1 ? " disabled" : ""}>↓</button><button type="button" data-gallery-delete>Удалить</button></div></div>
        </article>`).join("")}</div>
    </div>`;
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

    const content = productContentEditor.content?.product || product;
    return `
        <nav class="product-editor-tabs" aria-label="Разделы товара">
            ${[["main", "Основное"], ["attributes", "Характеристики"], ["description", "Описание"], ["seo", "SEO"], ["images", "Изображения"]].map(([id, label], index) => `<button type="button" data-product-tab="${id}" class="${index ? "" : "active"}">${label}</button>`).join("")}
        </nav>
        <section class="product-editor-panel active" data-product-panel="main"><div class="product-form-grid">
            <label>
                <span>Название</span>
                <input name="title" type="text" maxlength="300" value="${escapeHtml(product.title || "")}" required>
            </label>
            <label><span>MAT-код</span><input type="text" value="${escapeHtml(product.externalId || "Будет назначен автоматически")}" readonly></label>
            <label><span>Бренд</span><input name="brand" maxlength="160" value="${escapeHtml(content.brand || product.brand || "")}"></label>
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
            <label class="product-checkbox">
                <input name="isActive" type="checkbox"${product.isActive !== false ? " checked" : ""}>
                <span>Активен</span>
            </label>
        </div></section>
        <section class="product-editor-panel" data-product-panel="attributes">${product.id ? renderProductAttributes() : `<p class="product-content-empty">Сначала создайте товар, затем настройте характеристики.</p>`}</section>
        <section class="product-editor-panel" data-product-panel="description"><div class="product-form-grid">
            <label class="product-form-wide"><span>Короткое описание</span><textarea name="shortDescription" rows="4" maxlength="500">${escapeHtml(content.shortDescription || product.shortDescription || "")}</textarea><small>Обычный текст, до 500 символов.</small></label>
            <label class="product-form-wide"><span>Полное описание</span><textarea name="fullDescription" rows="12" maxlength="12000">${escapeHtml(content.fullDescription || product.fullDescription || "")}</textarea><small>Обычный текст, до 12 000 символов.</small></label>
            <label class="product-form-wide"><span>Описание (старое поле)</span><textarea name="description" rows="4">${escapeHtml(product.description || content.legacyDescription || "")}</textarea><small>Старое поле сохранено для совместимости.</small></label>
        </div></section>
        <section class="product-editor-panel" data-product-panel="seo"><div class="product-form-grid">
            <label class="product-form-wide"><span>SEO-заголовок</span><input name="seoTitle" maxlength="160" value="${escapeHtml(content.seoTitle || product.seoTitle || "")}"><small data-seo-title-preview>${content.seoTitle ? "Будет использовано заданное значение." : `По умолчанию: ${escapeHtml(product.title || "название товара")}`}</small></label>
            <label class="product-form-wide"><span>SEO-описание</span><textarea name="seoDescription" rows="4" maxlength="320">${escapeHtml(content.seoDescription || product.seoDescription || "")}</textarea><small data-seo-description-preview>${content.seoDescription ? "Будет использовано заданное значение." : "По умолчанию: короткое описание, либо старое описание."}</small></label>
        </div></section>
        <section class="product-editor-panel" data-product-panel="images">${renderProductGallery(product)}</section>
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

    setupProductImageDropZone();
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
        <section class="products-bulk-image" aria-labelledby="productsBulkImageTitle">
            <header class="products-bulk-image-header">
                <div class="products-bulk-image-heading">
                    <strong id="productsBulkImageTitle">Фото товаров</strong>
                    <small>Выберите товары и изображение для назначения</small>
                </div>
                <div class="products-bulk-image-counts" aria-label="Количество товаров">
                    <span data-products-selected-count>Выбрано: ${selectedCount}</span>
                    <span data-products-filtered-count>Найдено: ${filteredCount}</span>
                    <span data-products-total-count>В каталоге: ${totalCount}</span>
                </div>
            </header>
            <div class="products-bulk-image-file" data-products-batch-image-drop-zone>
                <input class="visually-hidden" id="productBatchImageInput" type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-describedby="productBatchImageDropHint productBatchImageFileName">
                <label class="product-batch-image-picker" for="productBatchImageInput">Выбрать изображение</label>
                <div class="products-bulk-image-file-copy">
                    <span id="productBatchImageDropHint" data-products-batch-image-drop-hint>или перетащите изображение сюда</span>
                    <small id="productBatchImageFileName" data-products-batch-image-file aria-live="polite">Файл не выбран</small>
                </div>
            </div>
            <div class="products-bulk-image-actions">
                <div class="products-bulk-image-primary-actions" aria-label="Действия с выбранными товарами">
                    <button class="products-batch-image-upload" type="button" disabled>Назначить выбранным</button>
                    <button class="products-selection-clear" type="button"${selectedCount ? "" : " disabled"}>Снять выбор</button>
                    <button class="products-bulk-structure-edit" type="button"${selectedCount ? "" : " hidden"}>Изменить структуру</button>
                </div>
                <div class="products-bulk-image-scope-actions" aria-label="Массовые действия">
                    <button class="products-filter-image-upload" type="button" disabled>Назначить всем найденным</button>
                    ${canReplaceAllProductImages() ? `<button class="products-all-image-upload" type="button" disabled>Назначить всему каталогу</button>` : ""}
                </div>
            </div>
        </section>
    `;
}

function setupProductImageDropZone() {
    const dropZone = productsView?.querySelector("[data-products-batch-image-drop-zone]");
    const input = dropZone?.querySelector("#productBatchImageInput");
    const hint = dropZone?.querySelector("[data-products-batch-image-drop-hint]");
    if (!dropZone || !input || !hint) return;

    const defaultHint = hint.textContent;
    let dragDepth = 0;
    const setDragState = isActive => {
        dropZone.classList.toggle("is-drag-over", isActive);
        hint.textContent = isActive ? "Отпустите файл для выбора" : defaultHint;
    };

    dropZone.addEventListener("dragenter", event => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth += 1;
        setDragState(true);
    });

    dropZone.addEventListener("dragover", event => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
        setDragState(true);
    });

    dropZone.addEventListener("dragleave", event => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) setDragState(false);
    });

    dropZone.addEventListener("drop", event => {
        event.preventDefault();
        event.stopPropagation();
        dragDepth = 0;
        setDragState(false);

        const file = event.dataTransfer?.files?.[0] || null;
        if (!file) return;

        const validationMessage = validateProductImageFile(file);
        if (validationMessage) {
            notifyWarning(validationMessage);
            return;
        }

        try {
            const transfer = new DataTransfer();
            transfer.items.add(file);
            input.files = transfer.files;
            input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch {
            notifyWarning("Не удалось выбрать перетащенный файл. Используйте кнопку выбора изображения.");
        }
    });
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
    if (totalCountElement) totalCountElement.textContent = `В каталоге: ${totalCount}`;
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

    formElement.__productImageDraft = { action: "upload", file };
    if (uploadButton) uploadButton.dataset.staged = "true";
    notifySuccess("Изображение будет сохранено после нажатия «Сохранить».");
}

async function deleteProductImage(product, formElement) {
    const manager = formElement.querySelector("[data-product-image-manager]");
    const deleteButton = manager?.querySelector("[data-product-image-delete]");
    formElement.__productImageDraft = { action: "delete" };
    if (deleteButton) deleteButton.dataset.staged = "true";
    notifySuccess("Удаление изображения будет применено после нажатия «Сохранить».");
}

async function applyProductImageDraft(product, formElement) {
    const draft = formElement?.__productImageDraft;
    if (!draft || !product?.id) return;
    if (draft.action === "delete") {
        const result = await CrmApi.delete(`/api/products/${product.id}/image`);
        Object.assign(product, result.product || {}, { imageUrl: "", image_url: "" });
        return;
    }
    if (draft.action === "upload" && draft.file) {
        const body = new FormData();
        body.append("image", draft.file);
        const result = await CrmApi.post(`/api/products/${product.id}/image`, body);
        Object.assign(product, result.product || {}, {
            imageUrl: result.imageUrl || result.image_url || result.product?.imageUrl || "",
            image_url: result.image_url || result.imageUrl || result.product?.image_url || ""
        });
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
        if (button) button.textContent = previousButtonText || "Назначить выбранным";
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
    if (scope === "all" && !canReplaceAllProductImages()) {
        notifyWarning("Глобальная замена изображений доступна только главному администратору.");
        return;
    }

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

        formElement.__productImageDraft = { action: "upload", file };

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

function setupProductTabs(formElement) {
    formElement.querySelectorAll("[data-product-tab]").forEach(button => button.addEventListener("click", () => {
        const tab = button.dataset.productTab;
        formElement.querySelectorAll("[data-product-tab]").forEach(item => item.classList.toggle("active", item === button));
        formElement.querySelectorAll("[data-product-panel]").forEach(panel => panel.classList.toggle("active", panel.dataset.productPanel === tab));
    }));
}

function refreshAttributeEditor(formElement) {
    const current = formElement.querySelector("[data-product-attributes]");
    if (!current) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderProductAttributes();
    current.replaceWith(wrapper.firstElementChild);
    setupProductAttributeControls(formElement);
}

async function openAttributeDefinitionManager(formElement) {
    const definitions = productContentEditor.definitions;
    const formData = await CrmModal.form({
        title: "Справочник характеристик",
        submitText: "Сохранить",
        content: `<div class="product-form-grid">
            <label class="product-form-wide"><span>Характеристика</span><select name="definitionId"><option value="">Новая характеристика</option>${definitions.map(item => `<option value="${item.id}">${escapeHtml(item.label)} (${escapeHtml(item.code)})</option>`).join("")}</select></label>
            <label><span>Код</span><input name="code" maxlength="80" pattern="[a-z][a-z0-9_]*" placeholder="layer_thickness"></label>
            <label><span>Тип данных</span><select name="dataType"><option value="text">Текст</option><option value="number">Число</option><option value="boolean">Логическое значение</option></select></label>
            <label class="product-form-wide"><span>Название</span><input name="label" maxlength="160" required></label>
            <label><span>Единица по умолчанию</span><input name="defaultUnit" maxlength="40"></label>
            <label><span>Раздел</span><input name="defaultSection" maxlength="120"></label>
            <label><span>Порядок</span><input name="sortOrder" type="number" value="0"></label>
            <label class="product-checkbox"><input name="isActive" type="checkbox" checked><span>Активна</span></label>
        </div>`,
        onReady: ({ formElement: definitionForm }) => {
            const select = definitionForm.querySelector("[name=definitionId]");
            const fill = () => {
                const selected = definitions.find(item => item.id === Number(select.value));
                for (const name of ["code", "dataType"]) definitionForm.elements[name].disabled = Boolean(selected);
                definitionForm.elements.code.value = selected?.code || "";
                definitionForm.elements.dataType.value = selected?.dataType || "text";
                definitionForm.elements.label.value = selected?.label || "";
                definitionForm.elements.defaultUnit.value = selected?.defaultUnit || "";
                definitionForm.elements.defaultSection.value = selected?.defaultSection || "";
                definitionForm.elements.sortOrder.value = selected?.sortOrder || 0;
                definitionForm.elements.isActive.checked = selected ? selected.isActive : true;
            };
            select.addEventListener("change", fill);
            fill();
        }
    });
    if (!formData) return;
    const id = Number(formData.get("definitionId"));
    const payload = {
        code: String(formData.get("code") || "").trim(), dataType: String(formData.get("dataType") || "text"),
        label: String(formData.get("label") || "").trim(), defaultUnit: String(formData.get("defaultUnit") || "").trim(),
        defaultSection: String(formData.get("defaultSection") || "").trim(), sortOrder: Number(formData.get("sortOrder")) || 0,
        isActive: formData.get("isActive") === "on"
    };
    if (id) { delete payload.code; delete payload.dataType; }
    try {
        if (id) await CrmApi.patch(`/api/products/attribute-definitions/${id}`, payload);
        else await CrmApi.post("/api/products/attribute-definitions", payload);
        productContentEditor.definitions = (await CrmApi.get("/api/products/attribute-definitions")).definitions || [];
        refreshAttributeEditor(formElement);
        notifySuccess("Характеристика сохранена.");
    } catch (error) {
        notifyError(error, "Не удалось сохранить характеристику.");
    }
}

function setupProductAttributeControls(formElement) {
    formElement.querySelector("[data-add-attribute-button]")?.addEventListener("click", () => {
        const id = Number(formElement.querySelector("[data-add-attribute]")?.value);
        if (!id) return;
        const definition = productContentEditor.definitions.find(item => item.id === id);
        productContentEditor.content.values = [...(productContentEditor.content.values || []), { ...definition, definitionId: id, value: "" }];
        refreshAttributeEditor(formElement);
    });
    formElement.querySelectorAll("[data-remove-attribute]").forEach(button => button.addEventListener("click", () => {
        const id = Number(button.dataset.removeAttribute);
        productContentEditor.content.values = (productContentEditor.content.values || []).filter(item => item.definitionId !== id);
        productContentEditor.content.templates = (productContentEditor.content.templates || []).filter(item => item.definitionId !== id);
        refreshAttributeEditor(formElement);
    }));
    formElement.querySelector("[data-manage-definitions]")?.addEventListener("click", () => openAttributeDefinitionManager(formElement));
}

async function refreshGalleryEditor(formElement, product) {
    productContentEditor.content = (await CrmApi.get(`/api/products/${product.id}/content`)).content;
    const current = formElement.querySelector("[data-product-gallery]");
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderProductGallery(product);
    current.replaceWith(wrapper.firstElementChild);
    setupProductImageControls(formElement, product);
    setupProductGalleryControls(formElement, product);
}

function setupProductGalleryControls(formElement, product) {
    const stage = operation => {
        formElement.__productGalleryDraft = formElement.__productGalleryDraft || [];
        formElement.__productGalleryDraft.push(operation);
        notifySuccess("Изменение галереи будет применено после нажатия «Сохранить».");
    };
    formElement.querySelector("[data-gallery-upload]")?.addEventListener("click", () => {
        const files = [...(formElement.querySelector("[data-gallery-files]")?.files || [])];
        const invalid = files.map(validateProductImageFile).find(Boolean);
        if (!files.length || invalid) return notifyWarning(invalid || "Выберите изображения.");
        files.forEach(file => stage({ type: "upload", file }));
    });
    formElement.querySelectorAll("[data-image-id]").forEach(card => {
        const imageId = Number(card.dataset.imageId);
        card.querySelector("[data-gallery-alt-save]")?.addEventListener("click", () => stage({ type: "patch", imageId, payload: { altText: card.querySelector("[data-gallery-alt]").value } }));
        card.querySelector("[data-gallery-primary]")?.addEventListener("click", () => stage({ type: "patch", imageId, payload: { isPrimary: true } }));
        card.querySelector("[data-gallery-delete]")?.addEventListener("click", () => stage({ type: "delete", imageId }));
        for (const [selector, offset] of [["[data-gallery-up]", -1], ["[data-gallery-down]", 1]]) card.querySelector(selector)?.addEventListener("click", () => {
            const ids = (productContentEditor.content.images || []).map(item => item.id); const index = ids.indexOf(imageId); const target = index + offset;
            if (target < 0 || target >= ids.length) return; [ids[index], ids[target]] = [ids[target], ids[index]];
            stage({ type: "order", imageIds: ids });
        });
    });
}

async function applyProductGalleryDraft(product, formElement) {
    for (const operation of formElement?.__productGalleryDraft || []) {
        if (operation.type === "upload") {
            const body = new FormData(); body.append("image", operation.file);
            await CrmApi.post(`/api/products/${product.id}/gallery`, body);
        } else if (operation.type === "patch") {
            await CrmApi.patch(`/api/products/${product.id}/gallery/${operation.imageId}`, operation.payload);
        } else if (operation.type === "delete") {
            await CrmApi.delete(`/api/products/${product.id}/gallery/${operation.imageId}`);
        } else if (operation.type === "order") {
            await CrmApi.put(`/api/products/${product.id}/gallery-order`, { imageIds: operation.imageIds });
        }
    }
}

function setupProductFormControls(formElement, product = {}) {
    setupProductImageControls(formElement, product);
    setupProductTabs(formElement);
    setupProductAttributeControls(formElement);
    setupProductGalleryControls(formElement, product);

    formElement.querySelector("select[name='category']")?.addEventListener("change", () => {
        refreshSubcategorySelect(formElement, "");
    });
    formElement.querySelector("select[name='subcategory']")?.addEventListener("change", async event => {
        const category = getStructureCategoryByName(formElement.querySelector("select[name='category']")?.value);
        const subcategory = getStructureSubcategoryByName(category, event.target.value);
        try {
            productContentEditor.content.structureId = subcategory?.id || null;
            productContentEditor.content.templates = subcategory?.id
                ? (await CrmApi.get(`/api/products/attribute-templates/${subcategory.id}`)).templates.map(item => ({
                    definitionId: item.attribute_definition_id, code: item.code, label: item.label, dataType: item.data_type,
                    unit: item.unit_override || item.default_unit || "", section: item.default_section || "",
                    sortOrder: Number(item.sort_order) || 0, isRequired: Boolean(item.is_required), isActive: Boolean(item.is_active)
                })) : [];
            refreshAttributeEditor(formElement);
        } catch (error) { notifyError(error, "Не удалось загрузить шаблон подкатегории."); }
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
        const definitionsResponse = await CrmApi.get("/api/products/attribute-definitions");
        productContentEditor.definitions = definitionsResponse.definitions || [];
        productContentEditor.content = product?.id
            ? (await CrmApi.get(`/api/products/${product.id}/content`)).content
            : { product: {}, structureId: null, templates: [], values: [], images: [] };
    } catch (error) {
        notifyError(error, "Не удалось загрузить данные редактора товара.");
        return;
    }

    const formData = await CrmModal.form({
        title: product ? "Редактировать товар" : "Добавить товар",
        content: renderProductForm(product || { isActive: true }),
        submitText: product ? "Сохранить" : "Создать",
        draftKey: product ? `product:${product.id}` : "product:new",
        clearDraftOnCancel: true,
        onDiscard: () => { productContentEditor.content = null; },
        onReady: ({ formElement }) => setupProductFormControls(formElement, product || {})
    });

    if (!formData) return;

    const payload = getProductPayloadFromForm(formData);
    const contentPayload = getProductContentPayloadFromForm(formData);
    if (!payload.title) {
        notifyWarning("Укажите название товара.");
        return;
    }

    try {
        let savedProduct = product;
        if (product) {
            savedProduct = (await CrmApi.patch(`/api/products/${product.id}`, payload)).product;
            invalidateCatalogStructureReadonlyCache();
            notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_UPDATED);
        } else {
            savedProduct = (await CrmApi.post("/api/products", payload)).product;
            invalidateCatalogStructureReadonlyCache();
            notifySuccess(CRM_MESSAGES.SUCCESS_PRODUCT_CREATED);
        }
        if (savedProduct?.id) {
            await CrmApi.patch(`/api/products/${savedProduct.id}/content`, contentPayload);
            await applyProductImageDraft(savedProduct, formData.crmFormElement);
            await applyProductGalleryDraft(savedProduct, formData.crmFormElement);
            const category = getStructureCategoryByName(payload.category);
            const subcategory = getStructureSubcategoryByName(category, payload.subcategory);
            if (subcategory?.id) {
                const templates = formData.getAll("templateDefinition").map(value => {
                    const definitionId = Number(value);
                    return {
                        definitionId,
                        sortOrder: Number(formData.get(`templateSort_${definitionId}`)) || 0,
                        unitOverride: String(formData.get(`templateUnit_${definitionId}`) || "").trim(),
                        isRequired: formData.get(`templateRequired_${definitionId}`) === "on"
                    };
                });
                await CrmApi.put(`/api/products/attribute-templates/${subcategory.id}`, { templates });
            }
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
