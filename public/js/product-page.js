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

function updateCartBadge() {
    const badge = document.querySelector("[data-cart-count]");
    if (badge && !badge.dataset.feedback) badge.textContent = "";
}

function addProduct(button) {
    const productId = Number(button.dataset.productId);
    if (!Number.isInteger(productId) || productId <= 0) return;
    const quantityInput = button.closest(".product-page-summary")?.querySelector("[data-quantity]");
    const quantity = normalizedQuantity(quantityInput?.value || 1);
    const cart = readCart();
    const existing = cart.find(item => Number(item.productId ?? item.id) === productId);
    if (existing) existing.quantity = Math.max(0, Number(existing.quantity ?? existing.qty) || 0) + quantity;
    else cart.push({ productId, title: button.dataset.title || "", price: Number(button.dataset.price) || 0, weight: Number(button.dataset.weight) || 0, unit: button.dataset.unit || "шт", quantity });
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        window.matmixAnalytics?.addToCart({ external_id: document.querySelector(".product-page")?.dataset.externalId, title: button.dataset.title, quantity, price: Number(button.dataset.price) || 0, unit: button.dataset.unit || "шт", source: "product_page" });
        button.textContent = "Добавлено";
        const badge = document.querySelector("[data-cart-count]");
        if (badge) {
            badge.dataset.feedback = "true";
            badge.textContent = "Товар добавлен в корзину";
        }
        updateCartBadge();
        window.dispatchEvent(new CustomEvent("matmix:cart-updated"));
    } catch {
        button.textContent = "Не удалось добавить";
    }
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

document.querySelectorAll("[data-add-product]").forEach(button => button.addEventListener("click", () => addProduct(button)));

const quantityInput = document.querySelector("[data-quantity]");
document.querySelector("[data-quantity-minus]")?.addEventListener("click", () => { quantityInput.value = normalizedQuantity(Number(quantityInput.value) - 1); });
document.querySelector("[data-quantity-plus]")?.addEventListener("click", () => { quantityInput.value = normalizedQuantity(Number(quantityInput.value) + 1); });
quantityInput?.addEventListener("change", () => { quantityInput.value = normalizedQuantity(quantityInput.value); });

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
