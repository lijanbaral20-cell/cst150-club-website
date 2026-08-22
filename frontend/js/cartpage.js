/*
    cartpage.js
    -----------
    Handles rendering of the cart page.
    Cart data/functions are handled by cart.js.
*/

const API_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", function () {

    if (!document.getElementById("cartItems")) {
        return;
    }

    renderCartPage();
});


/*
    Build the correct Flask image URL
*/
function getCartImageUrl(productImage) {

    // No image in database
    if (!productImage) {
        return "images/placeholder.jpg";
    }

    let imageName =
        String(productImage).trim();

    // If database already contains a complete URL
    if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://")
    ) {
        return imageName;
    }

    // Remove /images/ or images/ if already stored
    imageName = imageName
        .replace(/^\/?images\//, "")
        .replace(/^\/+/, "");

    return `${API_URL}/images/${encodeURIComponent(imageName)}`;
}


function renderCartPage() {

    const items = getCartWithDetails();

    const container =
        document.getElementById("cartItems");

    const emptyState =
        document.getElementById("cartEmptyState");

    const totalEl =
        document.getElementById("cartTotal");

    const checkoutLink =
        document.getElementById("checkoutLink");


    console.log("Cart:", getCart());

    console.log(
        "Cart items with details:",
        items
    );

    console.log(
        "PRODUCTS:",
        typeof PRODUCTS !== "undefined"
            ? PRODUCTS
            : "PRODUCTS is undefined"
    );


    /*
        Empty cart
    */
    if (items.length === 0) {

        container.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "block";
        }

        if (checkoutLink) {
            checkoutLink.classList.add("disabled");
        }

        if (totalEl) {
            totalEl.textContent = "$0.00";
        }

        return;
    }


    /*
        Cart contains products
    */

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (checkoutLink) {
        checkoutLink.classList.remove("disabled");
    }


    container.innerHTML = items.map(function (item) {

        const imageSrc =
            getCartImageUrl(item.product_image);


        console.log(
            "Cart product image:",
            item.product_title,
            "Database value:",
            item.product_image,
            "Final URL:",
            imageSrc
        );


        return `
            <div class="cart-row">

                <div class="cart-row-thumb">

                    <img
                        src="${imageSrc}"
                        alt="${escapeCartHTML(item.product_title)}"
                        class="cart-product-image"
                        onerror="
                            this.onerror=null;
                            this.src='images/placeholder.jpg';
                        "
                    >

                </div>


                <div class="cart-row-info">

                    <h3>
                        ${escapeCartHTML(item.product_title)}
                    </h3>

                    <p>
                        $${Number(
                            item.sell_price
                        ).toFixed(2)} each
                    </p>

                </div>


                <div class="cart-row-qty">

                    <button
                        class="qty-btn"
                        onclick="changeQty(
                            ${item.product_id},
                            ${item.quantity - 1}
                        )"
                    >
                        -
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        class="qty-btn"
                        onclick="changeQty(
                            ${item.product_id},
                            ${item.quantity + 1}
                        )"
                    >
                        +
                    </button>

                </div>


                <div class="cart-row-subtotal">

                    $${Number(
                        item.subtotal
                    ).toFixed(2)}

                </div>


                <button
                    class="remove-btn"
                    onclick="removeItem(
                        ${item.product_id}
                    )"
                    aria-label="Remove item"
                >
                    Remove
                </button>

            </div>
        `;

    }).join("");


    /*
        Update cart total
    */

    if (totalEl) {

        totalEl.textContent =
            "$" +
            Number(
                getCartTotal()
            ).toFixed(2);
    }
}


/*
    Change quantity
*/

function changeQty(
    productId,
    newQuantity
) {

    updateCartQuantity(
        productId,
        newQuantity
    );

    renderCartPage();
}


/*
    Remove product
*/

function removeItem(productId) {

    removeFromCart(productId);

    renderCartPage();
}


/*
    Basic HTML escaping
*/

function escapeCartHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}