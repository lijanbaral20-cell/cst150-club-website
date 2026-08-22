/*
    cart.js
    -------
    Handles all cart state.
*/

let PRODUCTS = [];
const CART_KEY = "nightwave_cart";

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to load products");
        }

        PRODUCTS = data.products;

        return PRODUCTS;

    } catch (error) {
        console.error("Failed to load products:", error);
        PRODUCTS = [];
        return [];
    }
}

function getCart() {
    const raw = localStorage.getItem(CART_KEY);

    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Invalid cart data:", error);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}

function addToCart(productId, quantity = 1) {

    productId = Number(productId);
    quantity = Number(quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return;
    }

    const cart = getCart();

    const existing = cart.find(
        item => Number(item.product_id) === productId
    );

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            product_id: productId,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartBadge();
}

function updateCartQuantity(productId, quantity) {

    productId = Number(productId);
    quantity = Number(quantity);

    let cart = getCart();

    if (quantity <= 0) {

        cart = cart.filter(
            item => Number(item.product_id) !== productId
        );

    } else {

        const item = cart.find(
            item => Number(item.product_id) === productId
        );

        if (item) {
            item.quantity = quantity;
        }
    }

    saveCart(cart);
    updateCartBadge();
}

function removeFromCart(productId) {

    productId = Number(productId);

    const cart = getCart().filter(
        item => Number(item.product_id) !== productId
    );

    saveCart(cart);
    updateCartBadge();
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

function getCartWithDetails() {

    return getCart()
        .map(item => {

            const product = PRODUCTS.find(
                p => Number(p.product_id) === Number(item.product_id)
            );

            if (!product) {
                return null;
            }

            return {
                product_id: Number(product.product_id),
                quantity: Number(item.quantity),
                product_title: product.product_title,
                sell_price: Number(product.sell_price) || 0,
                cost_price: Number(product.cost_price) || 0,
                product_image: product.product_image,
                subtotal:
                    (Number(product.sell_price) || 0) *
                    Number(item.quantity)
            };
        })
        .filter(Boolean);
}

function getCartCount() {

    return getCart().reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );
}

function getCartTotal() {

    return getCartWithDetails().reduce(
        (sum, item) => sum + item.subtotal,
        0
    );
}

function updateCartBadge() {

    const badge = document.getElementById("cartCount");

    if (badge) {
        badge.textContent = getCartCount();
    }
}


/*
    Make functions available to inline onclick=""
    handlers in HTML.
*/

window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getCart = getCart;
window.getCartWithDetails = getCartWithDetails;
window.getCartCount = getCartCount;
window.getCartTotal = getCartTotal;
window.updateCartBadge = updateCartBadge;
window.loadProducts = loadProducts;