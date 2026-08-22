/*
    admin.js
    --------
    Admin dashboard.
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


        if (
            sales.success &&
            Array.isArray(sales.sales)
        ) {

            renderSalesTable(
                sales.sales
            );

        } else {

            console.error(
                sales.error ||
                "Unable to load sales"
            );
        }


        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


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


/* =========================================================
   ADMIN STATUS
========================================================= */

async function checkAdminStatus() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/status`,
                {
                    credentials:
                        "include"
                }
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Admin status error:",
            error
        );

        return {
            success: false,
            authenticated: false
        };
    }
}


/* =========================================================
   ADMIN SALES
========================================================= */

async function fetchAdminSales() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/sales`,
                {
                    credentials:
                        "include"
                }
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Admin sales error:",
            error
        );

        return {
            success: false,
            sales: [],
            error:
                "Unable to load sales"
        };
    }
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",
                    credentials:
                        "include"
                }
            );

        return await response.json();

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        return {
            success: false
        };
    }
}


/* =========================================================
   SALES TABLE
========================================================= */

function renderSalesTable(
    sales
) {

    const tbody =
        document.getElementById(
            "salesTableBody"
        );

    if (!tbody) {
        return;
    }


    let totalRevenue = 0;

    let totalProfit = 0;


    tbody.innerHTML =
        sales.map(
            function (sale) {

                const cost =
                    Number(
                        sale.cost_price
                    ) || 0;

                const price =
                    Number(
                        sale.sale_price
                    ) || 0;

                const quantity =
                    Number(
                        sale.quantity
                    ) || 0;

                const subtotal =
                    Number(
                        sale.subtotal
                    ) || 0;

                const profit =
                    price - cost;


                totalRevenue +=
                    subtotal;

                totalProfit +=
                    profit *
                    quantity;


                return `

                    <tr>

                        <td>
                            #${sale.order_id}
                        </td>

                        <td>
                            ${escapeAdminHTML(
                                sale.email
                            )}
                        </td>

                        <td>
                            ${escapeAdminHTML(
                                sale.product_title
                            )}
                        </td>

                        <td>
                            ${quantity}
                        </td>

                        <td>
                            $${cost.toFixed(2)}
                        </td>

                        <td>
                            $${price.toFixed(2)}
                        </td>

                        <td>
                            $${profit.toFixed(2)}
                        </td>

                        <td>
                            ${new Date(
                                sale.order_date
                            ).toLocaleDateString()}
                        </td>

                    </tr>

                `;
            }
        ).join("");


    const ordersEl =
        document.getElementById(
            "statOrders"
        );

    const revenueEl =
        document.getElementById(
            "statRevenue"
        );

    const profitEl =
        document.getElementById(
            "statProfit"
        );


    if (ordersEl) {

        ordersEl.textContent =
            sales.length;
    }

    if (revenueEl) {

        revenueEl.textContent =
            `$${totalRevenue.toFixed(2)}`;
    }

    if (profitEl) {

        profitEl.textContent =
            `$${totalProfit.toFixed(2)}`;
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeAdminHTML(
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


window.checkAdminStatus =
    checkAdminStatus;

window.fetchAdminSales =
    fetchAdminSales;

window.logoutAdmin =
    logoutAdmin;