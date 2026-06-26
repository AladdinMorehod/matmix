const products = [
    {
        name: "Бетон М300",
        price: 4200,
        unit: "м³",
        category: "Бетон",
        image: "Б"
    },
    {
        name: "Песок речной",
        price: 900,
        unit: "т",
        category: "Сыпучие",
        image: "П"
    },
    {
        name: "Щебень 20-40",
        price: 1200,
        unit: "т",
        category: "Сыпучие",
        image: "Щ"
    },
    {
        name: "Кирпич строительный",
        price: 18,
        unit: "шт",
        category: "Материалы",
        image: "К"
    }
];

const grid = document.getElementById("productGrid");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItemsEl = document.getElementById("cartItems");
const closeCartBtn = document.getElementById("closeCart");
const cartTotalEl = document.getElementById("cartTotal");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

let cart = loadCart();

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem("matmix_cart") || "[]");
        return Array.isArray(saved) ? saved.filter(item => products[item.id]) : [];
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem("matmix_cart", JSON.stringify(cart));
}

function formatPrice(value) {
    return new Intl.NumberFormat("ru-RU").format(value);
}

function getCartTotal() {
    return cart.reduce((sum, item) => {
        const product = products[item.id];
        return sum + product.price * item.qty;
    }, 0);
}

function getCartQty() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartSummary() {
    cartCountEl.textContent = getCartQty();
    cartTotalEl.textContent = `Итого: ${formatPrice(getCartTotal())} ₽`;
}

function setProductQty(id, nextQty) {
    const item = cart.find(entry => entry.id === id);

    if (nextQty <= 0) {
        cart = cart.filter(entry => entry.id !== id);
    } else if (item) {
        item.qty = nextQty;
    } else {
        cart.push({ id, qty: nextQty });
    }

    saveCart();
    updateCartSummary();
    renderProducts();

    if (!cartModal.classList.contains("hidden")) {
        renderCart();
    }
}

function renderProducts() {
    grid.innerHTML = "";

    products.forEach((product, id) => {
        const cartItem = cart.find(item => item.id === id);
        const qty = cartItem ? cartItem.qty : 0;
        const card = document.createElement("article");
        card.className = "card";

        card.innerHTML = `
            <div class="thumb" aria-hidden="true">${product.image}</div>
            <div class="card-info">
                <span>${product.category}</span>
                <h3>${product.name}</h3>
                <p>${formatPrice(product.price)} ₽ / ${product.unit}</p>
            </div>
            <div class="actions">
                ${qty ? getQtyControls(id, qty) : `<button class="add" data-id="${id}" type="button">В корзину</button>`}
            </div>
        `;

        grid.appendChild(card);
    });
}

function getQtyControls(id, qty) {
    return `
        <div class="qty-row">
            <button class="qty minus" data-id="${id}" type="button" aria-label="Уменьшить количество">−</button>
            <span class="qty-val">${qty}</span>
            <button class="qty plus" data-id="${id}" type="button" aria-label="Увеличить количество">+</button>
        </div>
    `;
}

function renderCart() {
    cartItemsEl.innerHTML = "";

    if (!cart.length) {
        cartItemsEl.innerHTML = `<p class="empty-cart">Корзина пока пустая</p>`;
        updateCartSummary();
        return;
    }

    cart.forEach(item => {
        const product = products[item.id];
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div>
                <b>${product.name}</b>
                <span>${formatPrice(product.price)} ₽ / ${product.unit}</span>
            </div>
            ${getQtyControls(item.id, item.qty)}
        `;
        cartItemsEl.appendChild(row);
    });

    updateCartSummary();
}

function handleQtyClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    if (!Number.isInteger(id)) return;

    const current = cart.find(item => item.id === id)?.qty || 0;

    if (button.classList.contains("add") || button.classList.contains("plus")) {
        setProductQty(id, current + 1);
    }

    if (button.classList.contains("minus")) {
        setProductQty(id, current - 1);
    }
}

grid.addEventListener("click", handleQtyClick);
cartItemsEl.addEventListener("click", handleQtyClick);

cartBtn.addEventListener("click", event => {
    event.stopPropagation();
    cartModal.classList.toggle("hidden");
    renderCart();
});

closeCartBtn.addEventListener("click", () => {
    cartModal.classList.add("hidden");
});

cartModal.addEventListener("click", event => {
    event.stopPropagation();
});

document.addEventListener("click", () => {
    cartModal.classList.add("hidden");
    closeMenu();
});

function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.classList.remove("is-open");
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
}

menuToggle?.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
});

mainNav?.addEventListener("click", event => {
    if (event.target.closest("a")) {
        closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
        closeMenu();
    }
});

renderProducts();
updateCartSummary();
