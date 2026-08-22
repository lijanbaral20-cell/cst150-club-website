/*
    indexpage.js
    ------------
    Loads featured merchandise from Flask/MySQL
    and displays the first few products on the homepage.
*/


document.addEventListener("DOMContentLoaded", async function () {
    await loadProducts();
    loadFeaturedProducts();
});


async function loadFeaturedProducts() {

    const grid =
        document.getElementById("featuredGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        "<p>Loading merchandise...</p>";

    try {

        const response = await fetch(
            `${API_URL}/api/products`
        );

        const data = await response.json();

        console.log(
            "Homepage products:",
            data
        );

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                "Unable to load products"
            );
        }

        if (
            !Array.isArray(data.products) ||
            data.products.length === 0
        ) {

            grid.innerHTML =
                "<p>No featured products available.</p>";

            return;
        }

        /*
            Make database products available to
            cart.js as well.
        */
        window.PRODUCTS = data.products;

        /*
            Show first 4 products on homepage.
        */
        const featuredProducts =
            data.products.slice(0, 4);

        grid.innerHTML =
            featuredProducts
                .map(createFeaturedProductCard)
                .join("");

    } catch (error) {

        console.error(
            "Featured products error:",
            error
        );

        grid.innerHTML = `
            <p>
                Unable to load featured merchandise.
            </p>
        `;
    }
}


/*
    Create a featured product card
*/

function createFeaturedProductCard(product) {

    let imageSrc =
        "images/placeholder.jpg";

    if (product.product_image) {

        let imageName =
            String(product.product_image).trim();

        if (
            imageName.startsWith("http://") ||
            imageName.startsWith("https://")
        ) {

            imageSrc = imageName;

        } else {

            imageName = imageName
                .replace(/^\/?images\//, "")
                .replace(/^\/+/, "");

            imageSrc =
                `${API_URL}/images/${encodeURIComponent(
                    imageName
                )}`;
        }
    }

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
                        onclick="addToCart(
                            ${product.product_id}
                        )"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        </article>
    `;
}


/*
    Prevent HTML injection from product data.
*/

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