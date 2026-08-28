"use strict";

const CART_KEY = "matmix_cart";

function readCart() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function normalizedQuantity(value) {
    return Math.max(1, Math.min(999, Math.floor(Number(value) || 1)));
}

const currentProduct = (() => {
    const element = document.querySelector(".product-page");
    if (!element) return null;
    return Object.freeze({
        productId: Number(element.dataset.productId),
        title: element.dataset.title || "Товар",
        externalId: element.dataset.externalId || "",
        price: Number(element.dataset.price) || 0,
        weight: Number(element.dataset.weight) || 0,
        unit: element.dataset.unit || "шт"
    });
})();

function updateCartBadge() {
    const badge = document.querySelector("[data-cart-count]");
    if (badge && !badge.dataset.feedback) badge.textContent = "";
}

function productPageCartQuantity() {
    const id = currentProduct?.productId;
    if (!Number.isInteger(id) || id <= 0) return 0;
    return window.matmixCart?.getQuantity(id) ?? (Number(readCart().find(item => Number(item.productId ?? item.id) === id)?.quantity) || 0);
}

function setProductPageQuantity(nextQuantity, source = "product_page") {
    const product = document.querySelector(".product-page");
    const id = currentProduct?.productId;
    if (!Number.isInteger(id) || id <= 0) return;
    const before = productPageCartQuantity();
    const next = Math.max(0, Math.min(999, Math.floor(Number(nextQuantity) || 0)));
    const options = {
        analyticsSource: source,
        analyticsQuantity: Math.max(0, next - before),
        productData: { id, name: currentProduct.title, ...currentProduct }
    };
    if (window.matmixCart?.setQuantity) {
        window.matmixCart.setQuantity(id, next, options);
    } else {
        const cart = readCart();
        const index = cart.findIndex(item => Number(item.productId ?? item.id) === id);
        if (next <= 0) {
            if (index >= 0) cart.splice(index, 1);
        } else if (index >= 0) cart[index].quantity = next;
        else cart.push({ productId: id, title: product.dataset.title || "", price: Number(product.dataset.price) || 0, weight: Number(product.dataset.weight) || 0, unit: product.dataset.unit || "шт", quantity: next });
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
    return productPageCartQuantity();
}

function addProduct(button) {
    const productId = Number(button.dataset.productId);
    if (!Number.isInteger(productId) || productId <= 0) return;
    try {
        const actualQuantity = setProductPageQuantity(1, "product_page");
        if (actualQuantity !== 1) throw new Error("Не удалось добавить товар в корзину.");
        const badge = document.querySelector("[data-cart-count]");
        if (badge) {
            badge.dataset.feedback = "true";
            badge.textContent = "Товар добавлен в корзину";
        }
        updateCartBadge();
    } catch {
        button.textContent = "Не удалось добавить";
    }
}

function syncProductQuantity() {
    const product = document.querySelector(".product-page");
    const input = document.querySelector("[data-quantity]");
    const addButton = document.querySelector("[data-add-product]");
    const controls = document.querySelector(".product-page-quantity");
    if (!product || !input || !addButton || !controls) return;
    const quantity = productPageCartQuantity();
    input.value = String(quantity || 1);
    const inCart = quantity > 0;
    controls.hidden = !inCart;
    addButton.hidden = inCart;
    addButton.textContent = "В корзину";
}

document.querySelectorAll("[data-gallery-thumbnail]").forEach(button => button.addEventListener("click", () => {
    const main = document.querySelector("[data-gallery-main]");
    if (!main) return;
    main.src = button.dataset.imageUrl || main.src;
    main.alt = button.dataset.imageAlt || main.alt;
    document.querySelectorAll("[data-gallery-thumbnail]").forEach(item => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
    });
}));

document.querySelectorAll(".product-page [data-add-product]").forEach(button => button.addEventListener("click", event => { event.stopPropagation(); addProduct(button); }));

const quantityInput = document.querySelector("[data-quantity]");
document.querySelector("[data-quantity-minus]")?.addEventListener("click", () => setProductPageQuantity(productPageCartQuantity() - 1, "product_page"));
document.querySelector("[data-quantity-plus]")?.addEventListener("click", () => setProductPageQuantity(productPageCartQuantity() + 1, "product_page"));
function commitProductQuantityInput() {
    if (!quantityInput) return;
    const raw = quantityInput.value.trim();
    if (!raw || !/^\d+$/.test(raw)) {
        syncProductQuantity();
        return;
    }
    setProductPageQuantity(Number(raw), "product_page");
}
let skipQuantityBlur = false;
quantityInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        skipQuantityBlur = true;
        commitProductQuantityInput();
    }
});
quantityInput?.addEventListener("change", () => {
    skipQuantityBlur = true;
    commitProductQuantityInput();
});
quantityInput?.addEventListener("blur", () => {
    if (skipQuantityBlur) {
        skipQuantityBlur = false;
        return;
    }
    commitProductQuantityInput();
});
window.addEventListener("matmix:cart-updated", syncProductQuantity);

const oneClickDialog = document.querySelector("[data-one-click-dialog]");
const oneClickForm = document.querySelector("[data-one-click-form]");
const oneClickMessage = document.querySelector("[data-one-click-message]");
let oneClickSubmitting = false;
const oneClickStartedAt = () => Date.now() - 1000;
function closeOneClick() {
    if (oneClickDialog?.open) oneClickDialog.close();
}
document.querySelector("[data-one-click]")?.addEventListener("click", () => {
    if (!oneClickDialog || typeof oneClickDialog.showModal !== "function") return;
    oneClickForm?.reset();
    const quantity = document.querySelector("[data-quantity]")?.value || "1";
    const quantityField = oneClickForm?.querySelector("[name=quantity]");
    if (quantityField) quantityField.value = normalizedQuantity(quantity);
    if (oneClickMessage) oneClickMessage.textContent = "";
    if (oneClickForm) oneClickForm.dataset.startedAt = String(oneClickStartedAt());
    window.matmixAnalytics?.oneClickOpen({ external_id: document.querySelector(".product-page")?.dataset.externalId, quantity: normalizedQuantity(quantity), source: "product_page" });
    oneClickDialog.showModal();
});
document.querySelector("[data-one-click-close]")?.addEventListener("click", closeOneClick);
document.querySelector("[data-one-click-cancel]")?.addEventListener("click", closeOneClick);
oneClickForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (oneClickSubmitting || !oneClickForm.checkValidity()) { oneClickForm.reportValidity(); return; }
    oneClickSubmitting = true;
    const submit = oneClickForm.querySelector("[type=submit]");
    if (submit) { submit.disabled = true; submit.dataset.initialText = submit.textContent; submit.textContent = "Отправляем…"; }
    const formData = new FormData(oneClickForm);
    window.matmixAnalytics?.oneClickSubmit({ external_id: document.querySelector(".product-page")?.dataset.externalId, quantity: Number(formData.get("quantity")) || 1, source: "product_page" });
    const payload = {
        productId: Number(document.querySelector(".product-page")?.dataset.productId),
        customerName: String(formData.get("customerName") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        quantity: Number(formData.get("quantity")),
        comment: String(formData.get("comment") || "").trim(),
        consent: formData.get("consent") === "on",
        website: String(formData.get("website") || ""),
        formStartedAt: Number(oneClickForm.dataset.startedAt),
        landingPath: window.location.pathname
    };
    try {
        const response = await fetch("/api/orders/one-click", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success || !result.orderNumber) throw new Error(result.message || (response.status === 429 ? "Слишком много заявок. Попробуйте позже." : "Не удалось отправить заявку. Попробуйте ещё раз."));
        window.matmixAnalytics?.oneClickSuccess({ external_id: document.querySelector(".product-page")?.dataset.externalId, quantity: Number(formData.get("quantity")) || 1, source: "product_page" });
        if (oneClickMessage) { oneClickMessage.className = "product-page-one-click-message success"; oneClickMessage.textContent = `Заявка принята. Менеджер свяжется с вами для подтверждения цены, наличия и срока поставки. Номер заявки: ${result.orderNumber}.`; }
        window.setTimeout(closeOneClick, 2000);
    } catch (error) {
        window.matmixAnalytics?.track("one_click_error", { external_id: document.querySelector(".product-page")?.dataset.externalId, quantity: Number(formData.get("quantity")) || 1, source: "product_page" });
        if (oneClickMessage) { oneClickMessage.className = "product-page-one-click-message error"; oneClickMessage.textContent = error.message || "Не удалось отправить заявку. Попробуйте ещё раз."; }
    } finally {
        oneClickSubmitting = false;
        if (submit) { submit.disabled = false; submit.textContent = submit.dataset.initialText || "Отправить заявку"; }
    }
});

updateCartBadge();
syncProductQuantity();
