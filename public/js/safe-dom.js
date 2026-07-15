(function initMatMixSafe(window) {
    function escapeHtml(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    function productImageUrl(value) {
        const text = String(value || "").trim();
        return /^\/uploads\/products\/[A-Za-z0-9][A-Za-z0-9._-]*$/.test(text) && !text.includes("..") ? text : "";
    }
    window.MatMixSafe = Object.freeze({ escapeHtml, productImageUrl });
})(window);
