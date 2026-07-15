const CRM_LIST_LIMIT = 50;
const CRM_DOM_ACCUMULATION_LIMIT = 200;

function normalizePaginationMeta(meta = {}) {
    const limit = Math.min(CRM_LIST_LIMIT, Math.max(1, Number(meta.limit) || CRM_LIST_LIMIT));
    const total = Math.max(0, Number(meta.total) || 0);
    const totalPages = Math.max(1, Number(meta.totalPages) || Math.ceil(total / limit) || 1);
    const page = Math.min(totalPages, Math.max(1, Number(meta.page) || 1));

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: Boolean(meta.hasNext ?? page < totalPages),
        hasPrevious: Boolean(meta.hasPrevious ?? page > 1)
    };
}

function getPaginationRange(meta = {}) {
    const pagination = normalizePaginationMeta(meta);
    if (!pagination.total) return "Показано 0 из 0";

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.total, pagination.page * pagination.limit);
    return `Показано ${start}-${end} из ${pagination.total}`;
}

function getCompactPageItems(page, totalPages) {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    const validPages = [...pages].filter(item => item >= 1 && item <= totalPages).sort((a, b) => a - b);
    const items = [];

    validPages.forEach(item => {
        const previous = items[items.length - 1];
        if (previous && item - previous > 1) items.push("ellipsis");
        items.push(item);
    });

    return items;
}

function renderPaginationControls(meta, { id, showMore = true, loading = false, loadedCount = 0 } = {}) {
    const pagination = normalizePaginationMeta(meta);
    const pageItems = getCompactPageItems(pagination.page, pagination.totalPages);
    const canShowMore = showMore
        && pagination.hasNext
        && loadedCount < CRM_DOM_ACCUMULATION_LIMIT;
    const reachedDomLimit = showMore
        && pagination.hasNext
        && loadedCount >= CRM_DOM_ACCUMULATION_LIMIT;

    return `
        <nav class="crm-pagination" data-pagination="${escapeHtml(id || "")}" aria-label="Навигация по страницам">
            <div class="crm-pagination-range" aria-live="polite">${escapeHtml(getPaginationRange(pagination))}</div>
            <div class="crm-pagination-pages">
                <button type="button" data-page="${pagination.page - 1}"${pagination.hasPrevious && !loading ? "" : " disabled"} aria-label="Предыдущая страница">Назад</button>
                ${pageItems.map(item => item === "ellipsis"
                    ? `<span class="crm-pagination-ellipsis">...</span>`
                    : `<button type="button" data-page="${item}"${item === pagination.page || loading ? " disabled" : ""} aria-current="${item === pagination.page ? "page" : "false"}">${item}</button>`
                ).join("")}
                <button type="button" data-page="${pagination.page + 1}"${pagination.hasNext && !loading ? "" : " disabled"} aria-label="Следующая страница">Вперёд</button>
            </div>
            ${canShowMore ? `<button class="crm-pagination-more" type="button" data-load-more${loading ? " disabled" : ""}>${loading ? "Загружаем..." : `Показать ещё ${pagination.limit}`}</button>` : ""}
            ${reachedDomLimit ? `<p class="crm-pagination-note">Для просмотра следующих результатов перейдите на страницу.</p>` : ""}
        </nav>
    `;
}

function removeCrmPagination(container) {
    container?.querySelector(".crm-pagination")?.remove();
}

function appendCrmHtml(container, html) {
    if (!container || !html) return;

    const template = document.createElement("template");
    template.innerHTML = html.trim();
    container.appendChild(template.content);
}

function restoreScrollIfApplicationMoved(previousScrollY) {
    if (!Number.isFinite(previousScrollY)) return;

    const currentScrollY = window.scrollY || 0;
    if (Math.abs(currentScrollY - previousScrollY) > 24) {
        window.scrollTo({ top: previousScrollY, behavior: "auto" });
    }
}
