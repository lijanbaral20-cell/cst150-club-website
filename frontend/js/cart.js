/*
    cart.js
    -------
    Handles all cart state. Cart is stored in localStorage as a simple
    array of { product_id, quantity } so it survives page navigation
    without a backend.

     (backend integration): once the Flask API is live, swap
    localStorage.getItem/setItem below for fetch() calls to the cart
    endpoints, and swap PRODUCTS (from data.js) for a fetch() to
    GET /api/products. The function signatures below can stay the same
    so merchandise.html, cart.html and checkout.html don't need to change.
*/

const CART_KEY = "nightwave_cart";
// Get the current cart from localStorage, or return an empty array if none exists
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
// Save the current cart to localStorage
function saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}
// Add a product to the cart, or increase its quantity if it already exists
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
        item => item.product_id === productId
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
// Update the quantity of a product in the cart, or remove it if the quantity is zero or less
function updateCartQuantity(productId, quantity) {
    productId = Number(productId);
    quantity = Number(quantity);
    let cart = getCart();

    if (quantity <= 0) {
        cart = cart.filter(
            item => item.product_id !== productId
        );

    } else {

        const item = cart.find(
            item => item.product_id === productId
        );

        if (item) {
            item.quantity = quantity;
        }
    }

    saveCart(cart);
    updateCartBadge();
}

// Remove a product from the cart entirely
function removeFromCart(productId) {
    productId = Number(productId);
    const cart = getCart().filter(
        item => item.product_id !== productId
    );
    saveCart(cart);
    updateCartBadge();
}

function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

// Get the cart with product details from PRODUCTS (from data.js)
function getCartWithDetails() {

    if (typeof PRODUCTS === "undefined" || !Array.isArray(PRODUCTS)) {
        console.error("PRODUCTS is not available or is not an array.");
        return [];
    }

    return getCart()
        .map(item => {

            const product = PRODUCTS.find(
                p => Number(p.product_id) === Number(item.product_id)
            );

            if (!product) {
                console.warn(
                    "Product not found for cart item:",
                    item.product_id
                );
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

// Get the total number of items in the cart
function getCartCount() {
    return getCart().reduce(
        (sum, item) => sum + item.quantity,
        0
    );
}

// Get the total cost of items in the cart
function getCartTotal() {
    return getCartWithDetails().reduce(
        (sum, item) => sum + item.subtotal,
        0
    );
}

// Update the cart badge in the header to reflect the current cart count
function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (badge) {
        badge.textContent = getCartCount();
    }
}