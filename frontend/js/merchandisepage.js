/*
    merchandisepage.js
    -------------------
    Loads merchandise directly from the Flask/MySQL API
    and renders the product grid.
*/



document.addEventListener("DOMContentLoaded", async function () {
    await loadProducts();
    renderProducts(PRODUCTS);
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

        console.log("Requesting products from MySQL...");

        const response = await fetch(
            `${API_URL}/api/products`
        );

        console.log(
            "Products API status:",
            response.status
        );

        const data = await response.json();

        console.log(
            "Products API response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.error || "Unable to load products"
            );
        }

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

        window.PRODUCTS = data.products;
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

    const grid = document.getElementById("merchandiseGrid");

    if (!grid) {
        console.error("merchandiseGrid element not found.");
        return;
    }

    grid.innerHTML = products.map(function (product) {

        let imageSrc = "images/placeholder.jpg";

        if (product.product_image) {

            const imageName =
                String(product.product_image).trim();

            if (imageName.startsWith("http://") ||
                imageName.startsWith("https://")) {

                imageSrc = imageName;

            } else {

                // Remove any existing /images/ prefix
                const cleanName = imageName
                    .replace(/^\/?images\//, "")
                    .replace(/^\/+/, "");

                imageSrc =
                    `${API_URL}/images/${encodeURIComponent(cleanName)}`;
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
                        onerror="this.onerror=null; this.src='images/placeholder.jpg';"
                    >

                </div>

                <div class="product-body">

                    <h3 class="product-title">
                        ${escapeHTML(product.product_title)}
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
                            onclick="addToCart(${product.product_id}); showAddedToast('${escapeJS(product.product_title)}')"
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
        document.getElementById("categoryFilters");

    if (!container) {
        return;
    }

    /*
       Your current products table does NOT have a
       category column.

       Therefore, category filtering should not be
       generated from product.category.
    */

    container.innerHTML = "";
}


/* --------------------------------------------------
   HTML ESCAPING
-------------------------------------------------- */

function escapeHTML(value) {

    if (value === null || value === undefined) {
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

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}