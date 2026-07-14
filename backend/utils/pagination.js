const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 50;

function normalizePositiveInteger(value, fallback) {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getPaginationParams(query = {}) {
    const page = Math.max(1, normalizePositiveInteger(query.page, 1));
    const requestedLimit = normalizePositiveInteger(query.limit, DEFAULT_LIMIT);
    const limit = Math.min(MAX_LIMIT, requestedLimit);
    return {
        page,
        limit,
        offset: (page - 1) * limit
    };
}

function buildPaginationMeta({ page, limit, total }) {
    const safeTotal = Math.max(0, Number(total) || 0);
    const totalPages = Math.max(1, Math.ceil(safeTotal / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);

    return {
        page: safePage,
        limit,
        total: safeTotal,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrevious: safePage > 1
    };
}

module.exports = {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    getPaginationParams,
    buildPaginationMeta
};
