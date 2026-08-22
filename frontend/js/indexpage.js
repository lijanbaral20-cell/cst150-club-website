/*
    indexpage.js
    ------------
    Homepage featured products.
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const grid =
            document.getElementById(
                "featuredGrid"
            );

        if (!grid) {
            return;
        }

        const products =
            await loadProducts();

        if (!products.length) {

            grid.innerHTML =
                "<p>No featured products available.</p>";

            return;
        }

        grid.innerHTML =
            products
                .slice(0, 4)
                .map(
                    createFeaturedProductCard
                )
                .join("");
    }
);


/* =========================================================
   FEATURED PRODUCT
========================================================= */

function createFeaturedProductCard(
    product
) {

    const imageSrc =
        getProductImageUrl(
            product.product_image
        );

    return `

        <article class="product-card">

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
   ESCAPE HTML
========================================================= */

function escapeHTML(
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