"use strict";

document.querySelector("[data-add-product]")?.addEventListener("click", event => {
    const button = event.currentTarget;
    const productId = Number(button.dataset.productId);
    if (!Number.isInteger(productId) || productId <= 0) return;
    let cart = [];
    try { const parsed = JSON.parse(localStorage.getItem("matmix_cart") || "[]"); if (Array.isArray(parsed)) cart = parsed; } catch {}
    const existing = cart.find(item => Number(item.productId ?? item.id) === productId);
    if (existing) existing.quantity = Math.max(0, Number(existing.quantity ?? existing.qty) || 0) + 1;
    else cart.push({ productId, title: button.dataset.title || "", price: Number(button.dataset.price) || 0, weight: Number(button.dataset.weight) || 0, unit: button.dataset.unit || "шт", quantity: 1 });
    try { localStorage.setItem("matmix_cart", JSON.stringify(cart)); button.textContent = "Добавлено в корзину"; } catch { button.textContent = "Не удалось добавить"; }
});
