/*
    data.js
    -------
    Placeholder product data. Field names match the "products" table columns
    exactly (product_id, product_title, product_description, cost_price,
    sell_price, product_image) so this array can be swapped for a fetch()
    call to the Flask API later without touching any other file.

    product_image currently just stores a short keyword - real product
    images/URLs will replace these once they're uploaded to the DB.
    Until then, product cards render an animated "waveform" placeholder
    instead of an actual image (see renderWaveform() in main.js).
*/

const API_BASE_URL = "http://127.0.0.1:5000/api";

let PRODUCTS = [];

// Load products from Flask/MySQL
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to load products");
        }

        PRODUCTS = data.products;

        return PRODUCTS;

    } catch (error) {
        console.error("Failed to load products:", error);
        PRODUCTS = [];
        return [];
    }
}

loadProducts();

// Submit completed order to Flask
async function submitOrder(orderPayload) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
        });

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Order submission error:", error);

        return {
            success: false,
            error: "Unable to connect to the server."
        };
    }
}

// Admin login
async function loginAdmin(username, password) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        return await response.json();

    } catch (error) {
        console.error("Login error:", error);

        return {
            success: false,
            error: "Unable to connect to server."
        };
    }
}

// Check admin session
async function checkAdminStatus() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/status`,
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

// Admin sales
async function fetchAdminSales() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/sales`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {
        console.error("Sales error:", error);

        return {
            success: false,
            sales: []
        };
    }
}

// Admin logout
async function logoutAdmin() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/logout`,
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

// Admin dashboard stats
async function fetchAdminDashboard() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/dashboard`,
            {
                credentials: "include"
            }
        );

        return await response.json();

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        return {
            success: false
        };
    }
}