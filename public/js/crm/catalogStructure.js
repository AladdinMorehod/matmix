let standaloneCatalogStructureView = null;
let embeddedCatalogStructureView = null;

function canEditCatalogStructure() {
    return currentUser?.role === "admin";
}

function renderCatalogStructureMutationActions({ state }) {
    if (!canEditCatalogStructure()) return "";
    return `
        <button class="structure-create-category" type="button">Создать категорию</button>
        <button class="structure-move-selected" type="button" ${state.selectedSubcategories.size ? "" : "disabled"}>Переместить выбранные</button>
    `;
}

function renderEmbeddedCatalogStructureActions() {
    return canEditCatalogStructure()
        ? `<button class="structure-configure-order" type="button">Настроить порядок</button>`
        : "";
}

function renderCategoryOrderRows(categories) {
    return categories.map((category, index) => `
        <li class="category-order-row" data-category-order-id="${escapeHtml(category.id)}">
            <span class="category-order-position">${index + 1}.</span>
            <span class="category-order-name"><strong>${escapeHtml(category.name)}</strong>
                ${category.externalCode ? `<small>${escapeHtml(category.externalCode)}</small>` : ""}</span>
            <span class="category-order-controls">
                <button type="button" data-category-order-move="up" aria-label="Переместить категорию вверх" ${index === 0 ? "disabled" : ""}>↑</button>
                <button type="button" data-category-order-move="down" aria-label="Переместить категорию вниз" ${index === categories.length - 1 ? "disabled" : ""}>↓</button>
            </span>
        </li>
    `).join("");
}

async function openCategoryOrderModal() {
    let payload;
    try {
        payload = await CrmApi.get("/api/products/structure/categories/order");
    } catch (error) {
        notifyError(error, "Не удалось загрузить порядок категорий.");
        return;
    }
    let categories = [...(payload.categories || payload.data?.categories || [])];
    let version = payload.version || payload.data?.version || "";
    const originalIds = () => (payload.categories || payload.data?.categories || []).map(item => Number(item.id));

    await CrmModal.form({
        title: "Настроить порядок категорий",
        description: "Используйте стрелки для изменения порядка.",
        content: `<div class="category-order-feedback" role="alert" hidden></div>
            <ol class="category-order-list">${renderCategoryOrderRows(categories)}</ol>
            <button class="category-order-refresh" type="button" hidden>Обновить список</button>`,
        submitText: "Сохранить порядок",
        onReady({ formElement }) {
            const list = formElement.querySelector(".category-order-list");
            const submit = formElement.querySelector(".crm-modal-primary");
            const refresh = () => {
                list.innerHTML = renderCategoryOrderRows(categories);
                submit.disabled = categories.map(item => Number(item.id)).every((id, index) => id === originalIds()[index]);
            };
            refresh();
            formElement.addEventListener("click", async event => {
                const move = event.target.closest("[data-category-order-move]");
                if (move) {
                    const row = move.closest("[data-category-order-id]");
                    const index = categories.findIndex(item => Number(item.id) === Number(row.dataset.categoryOrderId));
                    const target = move.dataset.categoryOrderMove === "up" ? index - 1 : index + 1;
                    if (index >= 0 && target >= 0 && target < categories.length) {
                        [categories[index], categories[target]] = [categories[target], categories[index]];
                        refresh();
                    }
                    return;
                }
                if (event.target.closest(".category-order-refresh")) {
                    if (!window.confirm("Несохранённый локальный порядок будет заменён. Продолжить?")) return;
                    const next = await CrmApi.get("/api/products/structure/categories/order");
                    payload = next;
                    categories = [...(next.categories || next.data?.categories || [])];
                    version = next.version || next.data?.version || "";
                    formElement.querySelector(".category-order-feedback").hidden = true;
                    formElement.querySelector(".category-order-refresh").hidden = true;
                    refresh();
                }
            });
        },
        async onSubmit(formData, controls) {
            controls.setBusy(true, "Сохранение...");
            try {
                await CrmApi.patch("/api/products/structure/categories/order", {
                    categoryIds: categories.map(item => Number(item.id)),
                    expectedVersion: version
                });
                invalidateCatalogStructureReadonlyCache();
                await loadEmbeddedCatalogStructureAudit({ force: true });
                notifySuccess("Порядок категорий сохранён.");
                controls.close(true);
            } catch (error) {
                controls.setBusy(false);
                const feedback = controls.formElement.querySelector(".category-order-feedback");
                feedback.hidden = false;
                feedback.textContent = error?.message || "Не удалось сохранить порядок.";
                if (error?.status === 409 || error?.code === "CATEGORY_ORDER_STALE" || error?.code === "CATEGORY_ORDER_SET_CHANGED") {
                    controls.formElement.querySelector(".category-order-refresh").hidden = false;
                }
            }
            return false;
        }
    });
}

function handleEmbeddedCatalogStructureAction(event) {
    if (event.target.closest(".structure-configure-order")) {
        openCategoryOrderModal();
    }
}

function renderTargetCategoryOptions(audit) {
    return (audit?.categories || [])
        .filter(category => category.type === "category" && category.isActive && !category.parentId)
        .map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
        .join("");
}

async function createCatalogStructureCategory(view) {
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
    invalidateCatalogStructureReadonlyCache();
    notifySuccess(`Категория "${result.item?.name || result.data?.item?.name || ""}" создана.`);
    await view.load({ force: true });
}

async function moveCatalogStructureCategory(button, view) {
    const categoryId = Number(button.dataset.readonlyCategoryOrder || 0);
    const targetIndex = Number(button.dataset.targetIndex);
    if (!categoryId || !Number.isInteger(targetIndex)) return;
    button.disabled = true;
    try {
        await CrmApi.patch(`/api/products/structure/categories/${categoryId}/order`, { targetIndex });
        invalidateCatalogStructureReadonlyCache();
        notifySuccess("Порядок категорий обновлен.");
        await view.load({ force: true });
    } catch (error) {
        notifyError(error, "Не удалось изменить порядок категорий.");
        button.disabled = false;
    }
}

async function moveSelectedCatalogSubcategories(view) {
    const state = view.getState();
    if (!state.selectedSubcategories.size) {
        notifyWarning("Выберите подкатегории для перемещения.");
        return;
    }
    const formData = await CrmModal.form({
        title: "Переместить подкатегории",
        content: `
            <div class="product-form-grid">
                <label class="product-form-wide">
                    <span>Новая категория</span>
                    <select name="targetCategoryId" required>${renderTargetCategoryOptions(state.audit)}</select>
                </label>
            </div>
        `,
        submitText: "Проверить"
    });
    if (!formData) return;
    const payload = {
        subcategoryIds: Array.from(state.selectedSubcategories).map(Number),
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
    invalidateCatalogStructureReadonlyCache();
    state.selectedSubcategories.clear();
    notifySuccess(`Перемещено подкатегорий: ${result.data?.moved || 0}. Обновлено товаров: ${result.data?.affectedProducts || 0}.`);
    await view.load({ force: true });
}

function handleCatalogStructureMutation(event, context) {
    const view = standaloneCatalogStructureView;
    if (!view || !canEditCatalogStructure()) return;
    if (event.target.closest(".structure-create-category")) {
        createCatalogStructureCategory(view).catch(error => notifyError(error, "Не удалось создать категорию."));
        return;
    }
    const orderButton = event.target.closest("[data-readonly-category-order]");
    if (orderButton) {
        moveCatalogStructureCategory(orderButton, view);
        return;
    }
    if (event.target.closest(".structure-move-selected")) {
        moveSelectedCatalogSubcategories(view).catch(error => notifyError(error, "Не удалось переместить подкатегории."));
    }
}

if (catalogStructureView) {
    standaloneCatalogStructureView = createCatalogStructureReadonlyView({
        root: catalogStructureView,
        title: "Структура каталога",
        paginationId: "standalone-structure-products",
        allowMutations: true,
        renderActions: renderCatalogStructureMutationActions,
        onMutationAction: handleCatalogStructureMutation
    });
}

function loadCatalogStructureAudit(options = {}) {
    return standaloneCatalogStructureView?.load({ force: options.force === true });
}

function mountEmbeddedCatalogStructureView(root) {
    if (!root) return null;
    if (!embeddedCatalogStructureView) {
        embeddedCatalogStructureView = createCatalogStructureReadonlyView({
            root,
            title: "Структура",
            paginationId: "embedded-structure-products",
            allowMutations: false,
            onShowProducts: showProductsForStructure,
            renderActions: renderEmbeddedCatalogStructureActions,
            onAction: handleEmbeddedCatalogStructureAction
        });
    } else {
        embeddedCatalogStructureView.bind(root);
    }
    return embeddedCatalogStructureView;
}

function loadEmbeddedCatalogStructureAudit(options = {}) {
    return embeddedCatalogStructureView?.load({ force: options.force === true });
}

function invalidateCatalogStructureReadonlyCache() {
    embeddedCatalogStructureView?.invalidate();
    standaloneCatalogStructureView?.invalidate();
}
