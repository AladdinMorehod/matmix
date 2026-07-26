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
            allowMutations: false
        });
    } else {
        embeddedCatalogStructureView.bind(root);
    }
    return embeddedCatalogStructureView;
}

function loadEmbeddedCatalogStructureAudit(options = {}) {
    return embeddedCatalogStructureView?.load({ force: options.force === true });
}
