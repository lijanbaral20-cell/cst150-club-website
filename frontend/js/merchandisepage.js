/*
    merchandisepage.js
    -------------------
    Loads and displays merchandise.
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const products =
            await loadProducts();

        renderMerchandiseGrid(
            products
        );
    }
);


/* =========================================================
   IMAGE URL
========================================================= */

function getProductImageUrl(
    productImage
) {

    if (!productImage) {
        return "images/placeholder.jpg";
    }

    let imageName =
        String(productImage).trim();

    /* Already a complete URL */

    if (
        imageName.startsWith("http://") ||
        imageName.startsWith("https://")
    ) {
        return imageName;
    }

    /*
        Database may contain:

        /images/nightwave-club-cap.jpg

        or

        images/nightwave-club-cap.jpg

        We only want:

        nightwave-club-cap.jpg
    */

    imageName = imageName
        .replace(/^\/?images\//i, "")
        .replace(/^\/+/, "");

    return `${API_URL}/images/${encodeURIComponent(
        imageName
    )}`;
}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderMerchandiseGrid(
    products
) {

    const grid =
        document.getElementById(
            "merchandiseGrid"
        );

    if (!grid) {
        return;
    }

    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        grid.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    grid.innerHTML =
        products.map(
            function (product) {

                const imageSrc =
                    getProductImageUrl(
                        product.product_image
                    );

                return `

                    <article
                        class="product-card"
                        data-id="${product.product_id}"
                    >

                        <div class="product-thumb">

                            <img
                                src="${imageSrc}"
                                alt="${escapeHTML(
                                    product.product_title
                                )}"
                                class="product-image"
                                onerror="
                                    this.onerror=null;
                                    this.src='images/placeholder.jpg';
                                "
                            >

                        </div>

                        <div class="product-body">

                            <h3 class="product-title">
                                ${escapeHTML(
                                    product.product_title
                                )}
                            </h3>

                            <p class="product-description">
                                ${escapeHTML(
                                    product.product_description
                                )}
                            </p>

                            <div class="product-footer">

                                <span class="product-price">
                                    $${Number(
                                        product.sell_price
                                    ).toFixed(2)}
                                </span>

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    onclick="handleAddToCart(${product.product_id})"
                                >
                                    Add to Cart
                                </button>

                            </div>

                        </div>

                    </article>

                `;
            }
        ).join("");
}


/* =========================================================
   ADD TO CART BUTTON
========================================================= */

function handleAddToCart(
    productId
) {

    addToCart(
        Number(productId)
    );

    const product =
        PRODUCTS.find(
            p =>
                Number(p.product_id) ===
                Number(productId)
        );

    if (product) {

        showAddedToast(
            product.product_title
        );
    }
}


/* =========================================================
   TOAST
========================================================= */

function showAddedToast(
    productTitle
) {

    let toast =
        document.getElementById(
            "cartToast"
        );

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "cartToast";

        toast.className =
            "cart-toast";

        document.body.appendChild(
            toast
        );
    }

    toast.textContent =
        `${productTitle} added to cart`;

    toast.classList.add(
        "visible"
    );

    clearTimeout(
        window._toastTimeout
    );

    window._toastTimeout =
        setTimeout(
            function () {

                toast.classList.remove(
                    "visible"
                );

            },
            2200
        );
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

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


window.handleAddToCart =
    handleAddToCart;

window.showAddedToast =
    showAddedToast;