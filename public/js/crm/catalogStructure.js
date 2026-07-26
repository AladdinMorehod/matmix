let embeddedCatalogStructureView = null;

function canEditCatalogStructure() {
    return currentUser?.role === "admin";
}

function renderEmbeddedCatalogStructureActions({ state }) {
    return canEditCatalogStructure()
        ? `<button class="structure-create-embedded-category" type="button">Создать категорию</button>
           <button class="structure-create-embedded-subcategory" type="button" ${(state.audit?.categories || []).length ? "" : "disabled"}>Создать подкатегорию</button>
           <button class="structure-configure-order" type="button">Настроить порядок</button>
           <button class="structure-move-subcategories" type="button">Переместить подкатегории</button>`
        : "";
}

function renderStructureCreateError() {
    return `<div class="structure-create-error" role="alert" aria-live="polite" hidden></div>`;
}

async function openEmbeddedCategoryCreateModal() {
    await CrmModal.form({
        title: "Создать категорию",
        content: `${renderStructureCreateError()}
            <div class="product-form-grid">
                <label class="product-form-wide"><span>Название</span><input name="name" type="text" required autofocus></label>
                <label class="product-form-wide"><span>Позиция</span><select name="position">
                    <option value="end">В конец</option><option value="start">В начало</option>
                </select></label>
            </div>`,
        submitText: "Создать",
        async onSubmit(formData, controls) {
            controls.setBusy(true, "Создание...");
            const errorBox = controls.formElement.querySelector(".structure-create-error");
            try {
                const item = await CatalogStructureCreate.createCategory({
                    name: formData.get("name"),
                    position: formData.get("position")
                });
                await loadEmbeddedCatalogStructureAudit({ force: true });
                notifySuccess(`Категория "${item.name}" создана.`);
                controls.close(true);
            } catch (error) {
                controls.setBusy(false);
                errorBox.hidden = false;
                errorBox.textContent = error.message || "Не удалось создать категорию.";
            }
            return false;
        }
    });
}

async function openEmbeddedSubcategoryCreateModal() {
    let audit = embeddedCatalogStructureView?.getState().audit;
    if (!audit) {
        await loadEmbeddedCatalogStructureAudit({ force: true });
        audit = embeddedCatalogStructureView?.getState().audit;
    }
    const categories = (audit?.categories || [])
        .filter(category => category.type === "category" && category.isActive && !category.parentId);
    if (!categories.length) {
        notifyWarning("Сначала создайте активную категорию.");
        return;
    }
    await CrmModal.form({
        title: "Создать подкатегорию",
        content: `${renderStructureCreateError()}
            <div class="product-form-grid">
                <label class="product-form-wide"><span>Категория</span><select name="parentId" required>
                    <option value="">Выберите категорию</option>
                    ${categories.map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join("")}
                </select></label>
                <label class="product-form-wide"><span>Название подкатегории</span><input name="name" type="text" required></label>
                <label class="product-form-wide"><span>Позиция</span><select name="position">
                    <option value="end">В конец категории</option><option value="start">В начало категории</option>
                </select></label>
            </div>`,
        submitText: "Создать",
        async onSubmit(formData, controls) {
            controls.setBusy(true, "Создание...");
            const errorBox = controls.formElement.querySelector(".structure-create-error");
            try {
                const parentId = Number(formData.get("parentId"));
                const parent = categories.find(category => Number(category.id) === parentId);
                const item = await CatalogStructureCreate.createSubcategory({
                    parentId,
                    name: formData.get("name"),
                    position: formData.get("position")
                });
                await loadEmbeddedCatalogStructureAudit({ force: true });
                notifySuccess(`Подкатегория "${item.name}" создана в категории "${parent?.name || ""}".`);
                controls.close(true);
            } catch (error) {
                controls.setBusy(false);
                errorBox.hidden = false;
                errorBox.textContent = error.message || "Не удалось создать подкатегорию.";
            }
            return false;
        }
    });
}

function renderSubcategoryMoveSelection(context, search = "") {
    const query = String(search || "").trim().toLocaleLowerCase("ru");
    return context.categories.map(category => {
        const items = context.subcategories.filter(item => Number(item.parentId) === Number(category.id)
            && (!query || `${item.name} ${item.externalCode || ""}`.toLocaleLowerCase("ru").includes(query)));
        if (!items.length) return "";
        return `<fieldset class="subcategory-move-group">
            <legend>${escapeHtml(category.name)}</legend>
            ${items.map(item => `<label class="subcategory-move-option">
                <input type="checkbox" name="subcategoryIds" value="${escapeHtml(item.id)}">
                <span><strong>${escapeHtml(item.name)}</strong>
                ${item.externalCode ? `<small>${escapeHtml(item.externalCode)}</small>` : ""}
                <small>${item.productCount} товаров · текущая категория: ${escapeHtml(category.name)}</small></span>
            </label>`).join("")}
        </fieldset>`;
    }).join("");
}

function renderSubcategoryMovePreview(preview) {
    const conflicts = preview.conflicts || [];
    return `<div class="subcategory-move-summary">
        <strong>Будут перемещены ${preview.totalSubcategories} подкатегории</strong>
        <span>Будут обновлены ${preview.totalProducts} товаров</span>
        <span>Целевая категория: ${escapeHtml(preview.targetCategory.name)}</span>
    </div>
    ${(preview.subcategories || []).map(item => `<article class="subcategory-move-preview-card">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.sourceCategory.name)} → ${escapeHtml(preview.targetCategory.name)}</span>
        <span>${item.productCount} товаров: ${item.activeProductCount} активных, ${item.hiddenProductCount} скрытых</span>
    </article>`).join("")}
    ${conflicts.map(conflict => `<div class="subcategory-move-conflict" role="alert">${escapeHtml(conflict.message)}</div>`).join("")}`;
}

async function openEmbeddedSubcategoryMoveModal() {
    let context;
    try {
        context = await CrmApi.get("/api/products/structure/subcategories/move-context");
    } catch (error) {
        notifyError(error, "Не удалось загрузить подкатегории.");
        return;
    }
    context = context.data || context;
    let approvedPreview = null;
    await CrmModal.form({
        title: "Переместить подкатегории",
        description: `Выберите до ${context.batchLimit} подкатегорий, целевую категорию и выполните preview.`,
        content: `<label class="subcategory-move-search"><span>Поиск</span><input type="search" data-subcategory-move-search></label>
            <div class="subcategory-move-selection">${renderSubcategoryMoveSelection(context)}</div>
            <label class="subcategory-move-target"><span>Целевая категория</span>
                <select name="targetCategoryId" required><option value="">Выберите категорию</option>
                ${context.categories.map(category => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join("")}</select>
            </label>
            <div class="subcategory-move-count">Выбрано: 0</div>
            <button type="button" class="subcategory-move-preview">Проверить перемещение</button>
            <div class="subcategory-move-result"></div>
            <button type="button" class="subcategory-move-refresh" hidden>Обновить данные</button>`,
        submitText: "Переместить",
        onReady({ formElement }) {
            const submit = formElement.querySelector(".crm-modal-primary");
            const selection = formElement.querySelector(".subcategory-move-selection");
            const invalidatePreview = () => {
                approvedPreview = null;
                submit.disabled = true;
                formElement.querySelector(".subcategory-move-result").innerHTML = "";
                formElement.querySelector(".subcategory-move-count").textContent =
                    `Выбрано: ${formElement.querySelectorAll('input[name="subcategoryIds"]:checked').length}`;
            };
            submit.disabled = true;
            formElement.addEventListener("change", invalidatePreview);
            formElement.querySelector("[data-subcategory-move-search]").addEventListener("input", event => {
                const checked = new Set(Array.from(formElement.querySelectorAll('input[name="subcategoryIds"]:checked')).map(input => input.value));
                selection.innerHTML = renderSubcategoryMoveSelection(context, event.target.value);
                checked.forEach(id => {
                    const input = selection.querySelector(`input[value="${CSS.escape(id)}"]`);
                    if (input) input.checked = true;
                });
                invalidatePreview();
            });
            formElement.addEventListener("click", async event => {
                if (event.target.closest(".subcategory-move-preview")) {
                    const ids = Array.from(formElement.querySelectorAll('input[name="subcategoryIds"]:checked')).map(input => Number(input.value));
                    const targetCategoryId = Number(formElement.querySelector('[name="targetCategoryId"]').value);
                    try {
                        const response = await CrmApi.post("/api/products/structure/subcategories/move-preview", {
                            subcategoryIds: ids,
                            targetCategoryId,
                            expectedVersion: context.version
                        });
                        approvedPreview = response.data;
                        formElement.querySelector(".subcategory-move-result").innerHTML = renderSubcategoryMovePreview(approvedPreview);
                        submit.disabled = !approvedPreview.canMove;
                    } catch (error) {
                        formElement.querySelector(".subcategory-move-result").innerHTML =
                            `<div class="subcategory-move-conflict" role="alert">${escapeHtml(error.message || "Preview недоступен.")}</div>`;
                        if (error.status === 409) formElement.querySelector(".subcategory-move-refresh").hidden = false;
                    }
                }
                if (event.target.closest(".subcategory-move-refresh")) {
                    if (!window.confirm("Текущий preview будет сброшен. Обновить данные?")) return;
                    const response = await CrmApi.get("/api/products/structure/subcategories/move-context");
                    context = response.data || response;
                    selection.innerHTML = renderSubcategoryMoveSelection(context);
                    formElement.querySelector('[name="targetCategoryId"]').value = "";
                    formElement.querySelector(".subcategory-move-refresh").hidden = true;
                    invalidatePreview();
                }
            });
        },
        async onSubmit(formData, controls) {
            if (!approvedPreview?.canMove) return false;
            controls.setBusy(true, "Перемещение...");
            try {
                const result = await CrmApi.post("/api/products/structure/subcategories/move", {
                    subcategoryIds: approvedPreview.subcategories.map(item => Number(item.id)),
                    targetCategoryId: Number(approvedPreview.targetCategory.id),
                    expectedVersion: approvedPreview.version
                });
                invalidateCatalogStructureReadonlyCache();
                await loadEmbeddedCatalogStructureAudit({ force: true });
                notifySuccess(`Перемещено ${result.data.moved} подкатегорий и обновлено ${result.data.affectedProducts} товаров.`);
                controls.close(true);
            } catch (error) {
                controls.setBusy(false);
                controls.formElement.querySelector(".subcategory-move-result").innerHTML =
                    `<div class="subcategory-move-conflict" role="alert">${escapeHtml(error.message || "Перемещение не выполнено.")}</div>`;
                if (error.status === 409) controls.formElement.querySelector(".subcategory-move-refresh").hidden = false;
            }
            return false;
        }
    });
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
    if (event.target.closest(".structure-create-embedded-category")) {
        openEmbeddedCategoryCreateModal();
    } else if (event.target.closest(".structure-create-embedded-subcategory")) {
        openEmbeddedSubcategoryCreateModal();
    } else if (event.target.closest(".structure-configure-order")) {
        openCategoryOrderModal();
    } else if (event.target.closest(".structure-move-subcategories")) {
        openEmbeddedSubcategoryMoveModal();
    }
}

function mountEmbeddedCatalogStructureView(root) {
    if (!root) return null;
    if (!embeddedCatalogStructureView) {
        embeddedCatalogStructureView = createCatalogStructureReadonlyView({
            root,
            title: "Структура",
            paginationId: "embedded-structure-products",
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
}
