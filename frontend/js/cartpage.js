/*
    cartpage.js
    -----------
    Renders shopping cart.
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const container =
            document.getElementById(
                "cartItems"
            );

        if (!container) {
            return;
        }

        await loadProducts();

        renderCartPage();

        updateCartBadge();
    }
);


/* =========================================================
   IMAGE URL
========================================================= */

function getCartImageUrl(
    productImage
) {

    if (!productImage) {
        return "images/placeholder.jpg";
    }

    let imageName =
        String(productImage).trim();

    if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://")
    ) {
        return imageName;
    }

    imageName = imageName
        .replace(/^\/?images\//i, "")
        .replace(/^\/+/, "");

    return `${API_URL}/images/${encodeURIComponent(
        imageName
    )}`;
}


/* =========================================================
   RENDER CART
========================================================= */

function renderCartPage() {

    const container =
        document.getElementById(
            "cartItems"
        );

    if (!container) {
        return;
    }

    const emptyState =
        document.getElementById(
            "cartEmptyState"
        );

    const totalEl =
        document.getElementById(
            "cartTotal"
        );

    const checkoutLink =
        document.getElementById(
            "checkoutLink"
        );

    const items =
        getCartWithDetails();


    /* EMPTY CART */

    if (items.length === 0) {

        container.innerHTML = "";

        if (emptyState) {
            emptyState.style.display =
                "block";
        }

        if (checkoutLink) {
            checkoutLink.classList.add(
                "disabled"
            );
        }

        if (totalEl) {
            totalEl.textContent =
                "$0.00";
        }

        return;
    }


    /* CART HAS ITEMS */

    if (emptyState) {
        emptyState.style.display =
            "none";
    }

    if (checkoutLink) {
        checkoutLink.classList.remove(
            "disabled"
        );
    }


    container.innerHTML =
        items.map(
            function (item) {

                const imageSrc =
                    getCartImageUrl(
                        item.product_image
                    );

                return `

                    <div class="cart-row">

                        <div class="cart-row-thumb">

                            <img
                                src="${imageSrc}"
                                alt="${escapeCartHTML(
                                    item.product_title
                                )}"
                                class="cart-product-image"
                                onerror="
                                    this.onerror=null;
                                    this.src='images/placeholder.jpg';
                                "
                            >

                        </div>


                        <div class="cart-row-info">

                            <h3>
                                ${escapeCartHTML(
                                    item.product_title
                                )}
                            </h3>

                            <p>
                                $${Number(
                                    item.sell_price
                                ).toFixed(2)}
                                each
                            </p>

                        </div>


                        <div class="cart-row-qty">

                            <button
                                type="button"
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
                                type="button"
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
                            type="button"
                            class="remove-btn"
                            onclick="removeItem(
                                ${item.product_id}
                            )"
                        >
                            Remove
                        </button>

                    </div>

                `;
            }
        ).join("");


    if (totalEl) {

        totalEl.textContent =
            "$" +
            Number(
                getCartTotal()
            ).toFixed(2);
    }
}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQty(
    productId,
    quantity
) {

    updateCartQuantity(
        productId,
        quantity
    );

    renderCartPage();
}


/* =========================================================
   REMOVE ITEM
========================================================= */

function removeItem(
    productId
) {

    removeFromCart(
        productId
    );

    renderCartPage();
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeCartHTML(
    value
) {

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


window.changeQty =
    changeQty;

window.removeItem =
    removeItem;

window.renderCartPage =
    renderCartPage;