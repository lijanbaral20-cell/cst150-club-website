/*
    checkout.js
    -----------
    Renders the order summary, validates the delivery details form, and on
    submit builds an order object and saves it to localStorage as a stand-in
    for a real database write.

     (backend integration): replace the localStorage write in
    completeOrder() with a POST to something like /api/orders, sending the
    same shape of data (customer details + cart items). The customers,
    orders and order_items tables in the schema map directly onto this
    object's fields, so the backend mapping should be a fairly direct swap.
*/

document.addEventListener("DOMContentLoaded", async function () {

    await loadProducts();

    renderOrderSummary();

    const form = document.getElementById("checkoutForm");

    if (form) {
        form.addEventListener(
            "submit",
            handleCheckoutSubmit
        );
    }
});


function renderOrderSummary() {

    const items = getCartWithDetails();

    const container =
        document.getElementById("orderSummaryItems");

    const totalEl =
        document.getElementById("orderSummaryTotal");

    if (!container) {
        return;
    }

    if (items.length === 0) {

        container.innerHTML = `
            <p class="empty-note">
                Your cart is empty.
                <a href="merchandise.html">
                    Browse merchandise
                </a>
            </p>
        `;

        if (totalEl) {
            totalEl.textContent = "$0.00";
        }

        return;
    }

    container.innerHTML = items.map(item => `
        <div class="summary-row">

            <span>
                ${item.product_title}
                <span class="qty-note">
                    x${item.quantity}
                </span>
            </span>

            <span>
                $${item.subtotal.toFixed(2)}
            </span>

        </div>
    `).join("");

    if (totalEl) {
        totalEl.textContent =
            "$" + getCartTotal().toFixed(2);
    }
}


async function handleCheckoutSubmit(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const suburb =
        document.getElementById("suburb").value.trim();

    const items = getCart();

    if (items.length === 0) {

        alert(
            "Your cart is empty. Please add a product first."
        );

        return;
    }

    let valid = true;

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showFieldError(
            "email",
            "Please enter a valid email address."
        );

        valid = false;

    } else {

        clearFieldError("email");
    }


    if (!/^[0-9 +()\-]{8,20}$/.test(phone)) {

        showFieldError(
            "phone",
            "Please enter a valid phone number."
        );

        valid = false;

    } else {

        clearFieldError("phone");
    }


    if (!suburb) {

        showFieldError(
            "suburb",
            "Please enter your suburb."
        );

        valid = false;

    } else {

        clearFieldError("suburb");
    }


    if (!valid) {
        return;
    }


    const payload = {

        email: email,
        phone: phone,
        suburb: suburb,

        items: items.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity)
        }))
    };


    const result = await submitOrder(payload);


    if (result.success) {

        clearCart();

        showOrderConfirmation(
            result.order_id,
            result.total,
            email
        );

    } else {

        alert(
            "Error placing order: " +
            (result.error || "Unknown error")
        );
    }
}


function showFieldError(fieldId, message) {

    const errorEl =
        document.getElementById(fieldId + "Error");

    if (errorEl) {

        errorEl.textContent = message;
        errorEl.classList.add("visible");
    }
}


function clearFieldError(fieldId) {

    const errorEl =
        document.getElementById(fieldId + "Error");

    if (errorEl) {
        errorEl.textContent = "";
        errorEl.classList.remove("visible");
    }
}


function showOrderConfirmation(
    orderId,
    total,
    email
) {

    const checkoutContent =
        document.getElementById("checkoutContent");

    if (!checkoutContent) {
        return;
    }

    checkoutContent.innerHTML = `

        <div class="confirmation-box">

            <h2>Order Confirmed</h2>

            <p>
                Thanks - order #${orderId}
                has been completed.
            </p>

            <p>
                A confirmation would normally be emailed to
                <strong>${email}</strong>.
            </p>

            <p class="confirmation-total">
                Total paid:
                $${Number(total).toFixed(2)}
            </p>

            <a
                href="merchandise.html"
                class="btn btn-primary"
            >
                Continue Shopping
            </a>

        </div>

    `;
}