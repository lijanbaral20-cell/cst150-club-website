/*
    cart.js
    -------
    Handles cart state using localStorage.

    Products are loaded from the deployed Flask API.
*/

const API_URL = "https://cst150-club-website-2.onrender.com";

let PRODUCTS = [];

const CART_KEY = "nightwave_cart";


/* =========================
   LOAD PRODUCTS FROM API
========================= */

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "Failed to load products"
            );
        }

        PRODUCTS = data.products || [];

        console.log("Products loaded:", PRODUCTS);

        return PRODUCTS;

    } catch (error) {
        console.error(
            "Failed to load products:",
            error
        );

        PRODUCTS = [];

        return [];
    }
}


/* =========================
   GET CART
========================= */

function getCart() {

    const raw = localStorage.getItem(CART_KEY);

    if (!raw) {
        return [];
    }

    try {

        const cart = JSON.parse(raw);

        return Array.isArray(cart) ? cart : [];

    } catch (error) {

        console.error(
            "Invalid cart data:",
            error
        );

        return [];
    }
}


/* =========================
   SAVE CART
========================= */

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


/* =========================
   ADD TO CART
========================= */

function addToCart(productId, quantity = 1) {

    productId = Number(productId);
    quantity = Number(quantity);

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        console.error(
            "Invalid product ID:",
            productId
        );
        return;
    }

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        console.error(
            "Invalid quantity:",
            quantity
        );
        return;
    }

    const cart = getCart();

    const existing = cart.find(
        item =>
            Number(item.product_id) === productId
    );

    if (existing) {

        existing.quantity =
            Number(existing.quantity) + quantity;

    } else {

        cart.push({
            product_id: productId,
            quantity: quantity
        });
    }

    saveCart(cart);

    updateCartBadge();

    console.log(
        "Added to cart:",
        productId,
        "Quantity:",
        quantity
    );

    /* Optional toast */
    if (typeof showAddedToast === "function") {

        const product = PRODUCTS.find(
            p =>
                Number(p.product_id) === productId
        );

        if (product) {
            showAddedToast(
                product.product_title
            );
        }
    }
}


/* =========================
   UPDATE QUANTITY
========================= */

function updateCartQuantity(
    productId,
    quantity
) {

    productId = Number(productId);
    quantity = Number(quantity);

    let cart = getCart();

    if (quantity <= 0) {

        cart = cart.filter(
            item =>
                Number(item.product_id) !== productId
        );

    } else {

        const item = cart.find(
            item =>
                Number(item.product_id) === productId
        );

        if (item) {
            item.quantity = quantity;
        }
    }

    saveCart(cart);

    updateCartBadge();
}


/* =========================
   REMOVE FROM CART
========================= */

function removeFromCart(productId) {

    productId = Number(productId);

    const cart = getCart().filter(
        item =>
            Number(item.product_id) !== productId
    );

    saveCart(cart);

    updateCartBadge();
}


/* =========================
   CLEAR CART
========================= */

function clearCart() {

    localStorage.removeItem(CART_KEY);

    updateCartBadge();
}


/* =========================
   CART WITH PRODUCT DETAILS
========================= */

function getCartWithDetails() {

    if (!Array.isArray(PRODUCTS)) {

        console.error(
            "PRODUCTS is not available."
        );

        return [];
    }

    return getCart()
        .map(item => {

            const product =
                PRODUCTS.find(
                    p =>
                        Number(p.product_id) ===
                        Number(item.product_id)
                );

            if (!product) {

                console.warn(
                    "Product not found:",
                    item.product_id
                );

                return null;
            }

            const quantity =
                Number(item.quantity);

            const price =
                Number(product.sell_price) || 0;

            return {

                product_id:
                    Number(product.product_id),

                quantity:
                    quantity,

                product_title:
                    product.product_title,

                sell_price:
                    price,

                cost_price:
                    Number(product.cost_price) || 0,

                product_image:
                    product.product_image,

                subtotal:
                    price * quantity
            };

        })
        .filter(Boolean);
}


/* =========================
   CART COUNT
========================= */

function getCartCount() {

    return getCart().reduce(
        (sum, item) =>
            sum + Number(item.quantity),
        0
    );
}


/* =========================
   CART TOTAL
========================= */

function getCartTotal() {

    return getCartWithDetails().reduce(
        (sum, item) =>
            sum + Number(item.subtotal),
        0
    );
}


/* =========================
   UPDATE CART BADGE
========================= */

function updateCartBadge() {

    const badge =
        document.getElementById("cartCount");

    if (badge) {

        badge.textContent =
            getCartCount();
    }
}


/* =========================
   INITIAL CART BADGE
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateCartBadge();

    }
);