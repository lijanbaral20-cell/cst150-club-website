/*
    merchandisepage.js
    -------------------
    Loads merchandise from the Flask/MySQL API
    and renders the product grid.
*/

document.addEventListener("DOMContentLoaded", async function () {

    await loadMerchandise();

});


/* --------------------------------------------------
   LOAD PRODUCTS FROM FLASK / MYSQL
-------------------------------------------------- */

async function loadMerchandise() {

    const grid = document.getElementById("merchandiseGrid");

    if (!grid) {
        console.error("merchandiseGrid element not found.");
        return;
    }

    grid.innerHTML = "<p>Loading merchandise...</p>";

    try {

        console.log("Requesting products from Render API...");

        const response = await fetch(
            `${API_URL}/api/products`
        );

        console.log(
            "Products API status:",
            response.status
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "Products API response:",
            data
        );

        if (!data.success) {
            throw new Error(
                data.error || "Product request failed"
            );
        }

        if (!Array.isArray(data.products)) {
            throw new Error(
                "Invalid products response from server"
            );
        }

        if (data.products.length === 0) {

            grid.innerHTML =
                "<p>No products found.</p>";

            return;
        }

        /*
            Store products globally so cart.js
            can use them.
        */

        window.PRODUCTS = data.products;

        /*
            Also update the PRODUCTS variable
            from cart.js if it exists.
        */

        if (typeof PRODUCTS !== "undefined") {
            PRODUCTS = data.products;
        }

        renderMerchandiseGrid(data.products);

    } catch (error) {

        console.error(
            "Merchandise loading error:",
            error
        );

        grid.innerHTML = `
            <p class="error-message">
                Unable to load merchandise.
                Please try again.
            </p>
        `;
    }
}


/* --------------------------------------------------
   RENDER PRODUCT GRID
-------------------------------------------------- */

function renderMerchandiseGrid(products) {

    const grid =
        document.getElementById("merchandiseGrid");

    if (!grid) {
        console.error(
            "merchandiseGrid element not found."
        );
        return;
    }

    grid.innerHTML = products.map(function (product) {

        let imageSrc =
            "images/placeholder.jpg";

        if (product.product_image) {

            let imageName =
                String(product.product_image).trim();

            /*
                If database contains a complete URL,
                use it directly.
            */

            if (
                imageName.startsWith("http://") ||
                imageName.startsWith("https://")
            ) {

                imageSrc = imageName;

            } else {

                /*
                    Database currently returns values such as:

                    /images/nightwave-club-cap.jpg

                    Remove /images/ before sending the
                    filename to Flask.
                */

                imageName =
                    imageName.replace(
                        /^\/?images\//,
                        ""
                    );

                imageName =
                    imageName.replace(
                        /^\/+/,
                        ""
                    );

                imageSrc =
                    `${API_URL}/images/${encodeURIComponent(imageName)}`;
            }
        }

        console.log(
            "Product:",
            product.product_title,
            "Image:",
            imageSrc
        );

        return `
            <article
                class="product-card"
                data-id="${product.product_id}"
            >

                <div class="product-thumb">

                    <img
                        src="${imageSrc}"
                        alt="${escapeHTML(product.product_title)}"
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
                            onclick="
                                addToCart(${product.product_id});
                                showAddedToast('${escapeJS(product.product_title)}');
                            "
                        >
                            Add to Cart
                        </button>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


/* --------------------------------------------------
   CATEGORY FILTERS
-------------------------------------------------- */

function renderCategoryFilters(products) {

    const container =
        document.getElementById(
            "categoryFilters"
        );

    if (!container) {
        return;
    }

    /*
        There is currently no category column
        in the products table.
    */

    container.innerHTML = "";
}


/* --------------------------------------------------
   HTML ESCAPING
-------------------------------------------------- */

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


/* --------------------------------------------------
   JAVASCRIPT STRING ESCAPING
-------------------------------------------------- */

function escapeJS(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");
}