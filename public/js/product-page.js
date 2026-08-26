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
document.querySelector("[data-one-click]")?.addEventListener("click", () => {
    if (typeof oneClickDialog?.showModal === "function") oneClickDialog.showModal();
});

updateCartBadge();
