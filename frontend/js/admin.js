/*
    admin.js
    --------
    Reads completed orders out of localStorage and renders the sales summary
    table - one row per line item, showing who bought what, at what cost
    price and sale price, so profit per sale is visible at a glance.

     (backend integration): replace loadOrders() with a fetch() to
    something like GET /api/admin/sales, which would join orders,
    order_items, customers and products server-side. The rendering logic
    below can stay as-is since it already expects that flattened shape.
*/
document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const status =
            await checkAdminStatus();

        if (!status.authenticated) {

            window.location.href =
                "login.html";

            return;
        }


        const sales =
            await fetchAdminSales();

        if (sales.success) {

            renderSalesTable(
                sales.sales
            );
        }


        const logoutBtn =
            document.getElementById("logoutBtn");

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async function () {

                    await logoutAdmin();

                    window.location.href =
                        "login.html";
                }
            );
        }
    }
);

async function checkAdminStatus() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/status`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {

        console.error("Admin status error:", error);

        return {
            success: false,
            authenticated: false
        };
    }
}

async function fetchAdminSales() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/sales`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {

        console.error("Admin sales error:", error);

        return {
            success: false,
            error: "Unable to load sales"
        };
    }
}

async function fetchAdminSales() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/sales`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {

        console.error("Admin sales error:", error);

        return {
            success: false,
            error: "Unable to load sales"
        };
    }
}

async function logoutAdmin() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {

        console.error("Logout error:", error);

        return {
            success: false
        };
    }
}

function renderSalesTable(sales) {
    const tbody = document.getElementById("salesTableBody");
    let totalRev = 0;
    let totalProfit = 0;

    tbody.innerHTML = sales.map(s => {
        const profit = s.sale_price - s.cost_price;
        totalRev += s.subtotal;
        totalProfit += profit * s.quantity;

        return `
            <tr>
                <td>#${s.order_id}</td>
                <td>${s.email}</td>
                <td>${s.product_title}</td>
                <td>${s.quantity}</td>
                <td>$${s.cost_price.toFixed(2)}</td>
                <td>$${s.sale_price.toFixed(2)}</td>
                <td>$${profit.toFixed(2)}</td>
                <td>${new Date(s.order_date).toLocaleDateString()}</td>
            </tr>
        `;
    }).join("");

    document.getElementById("statOrders").textContent = sales.length;
    document.getElementById("statRevenue").textContent = `$${totalRev.toFixed(2)}`;
    document.getElementById("statProfit").textContent = `$${totalProfit.toFixed(2)}`;
}