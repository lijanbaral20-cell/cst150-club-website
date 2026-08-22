/*
    checkout.js
    -----------
    Checkout validation and order submission.
*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const form =
            document.getElementById(
                "checkoutForm"
            );

        if (!form) {
            return;
        }

        await loadProducts();

        renderOrderSummary();

        form.addEventListener(
            "submit",
            handleCheckoutSubmit
        );
    }
);


/* =========================================================
   ORDER SUMMARY
========================================================= */

function renderOrderSummary() {

    const container =
        document.getElementById(
            "orderSummaryItems"
        );

    const totalEl =
        document.getElementById(
            "orderSummaryTotal"
        );

    if (!container) {
        return;
    }

    const items =
        getCartWithDetails();


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
            totalEl.textContent =
                "$0.00";
        }

        return;
    }


    container.innerHTML =
        items.map(
            function (item) {

                return `

                    <div class="summary-row">

                        <span>

                            ${escapeCheckoutHTML(
                                item.product_title
                            )}

                            <span class="qty-note">
                                x${item.quantity}
                            </span>

                        </span>

                        <span>
                            $${Number(
                                item.subtotal
                            ).toFixed(2)}
                        </span>

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
   CHECKOUT SUBMIT
========================================================= */

async function handleCheckoutSubmit(
    event
) {

    event.preventDefault();


    const emailEl =
        document.getElementById(
            "email"
        );

    const phoneEl =
        document.getElementById(
            "phone"
        );

    const suburbEl =
        document.getElementById(
            "suburb"
        );


    const email =
        emailEl
            ? emailEl.value.trim()
            : "";

    const phone =
        phoneEl
            ? phoneEl.value.trim()
            : "";

    const suburb =
        suburbEl
            ? suburbEl.value.trim()
            : "";


    /* Clear previous errors */

    clearFieldError("email");
    clearFieldError("phone");
    clearFieldError("suburb");


    /* CART CHECK */

    const items =
        getCart();

    if (items.length === 0) {

        showCheckoutMessage(
            "Your cart is empty. Please add a product first."
        );

        return;
    }


    let valid = true;


    /* EMAIL */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showFieldError(
            "email",
            "Please enter a valid email address."
        );

        valid = false;
    }


    /* PHONE */

    const phonePattern =
        /^[0-9 +()\-]{8,20}$/;

    if (!phonePattern.test(phone)) {

        showFieldError(
            "phone",
            "Please enter a valid phone number."
        );

        valid = false;
    }


    /* SUBURB */

    if (
        suburb.length < 2 ||
        suburb.length > 100
    ) {

        showFieldError(
            "suburb",
            "Please enter a valid suburb."
        );

        valid = false;
    }


    if (!valid) {
        return;
    }


    /* BUILD ORDER */

    const payload = {

        email: email,

        phone: phone,

        suburb: suburb,

        items:
            items.map(
                function (item) {

                    return {

                        product_id:
                            Number(
                                item.product_id
                            ),

                        quantity:
                            Number(
                                item.quantity
                            )
                    };
                }
            )
    };


    /* DISABLE BUTTON */

    const submitButton =
        event.submitter;

    if (submitButton) {
        submitButton.disabled =
            true;

        submitButton.textContent =
            "Processing...";
    }


    try {

        const result =
            await submitOrder(
                payload
            );


        if (result.success) {

            clearCart();

            showOrderConfirmation(
                result.order_id,
                result.total,
                email
            );

        } else {

            showCheckoutMessage(
                result.error ||
                "Unable to complete your order."
            );

        }

    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );

        showCheckoutMessage(
            "Unable to connect to the server. Please try again."
        );

    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Complete Order";
        }
    }
}


/* =========================================================
   SEND ORDER TO FLASK
========================================================= */

async function submitOrder(
    payload
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            return {

                success: false,

                error:
                    data.error ||
                    `Server error ${response.status}`
            };
        }


        return data;

    } catch (error) {

        console.error(
            "Order submission error:",
            error
        );

        return {

            success: false,

            error:
                "Unable to connect to backend."
        };
    }
}


/* =========================================================
   FIELD ERROR
========================================================= */

function showFieldError(
    fieldId,
    message
) {

    const errorEl =
        document.getElementById(
            `${fieldId}Error`
        );

    if (errorEl) {

        errorEl.textContent =
            message;

        errorEl.classList.add(
            "visible"
        );
    }


    const input =
        document.getElementById(
            fieldId
        );

    if (input) {

        input.classList.add(
            "input-error"
        );

        input.setAttribute(
            "aria-invalid",
            "true"
        );
    }
}


/* =========================================================
   CLEAR FIELD ERROR
========================================================= */

function clearFieldError(
    fieldId
) {

    const errorEl =
        document.getElementById(
            `${fieldId}Error`
        );

    if (errorEl) {

        errorEl.textContent =
            "";

        errorEl.classList.remove(
            "visible"
        );
    }


    const input =
        document.getElementById(
            fieldId
        );

    if (input) {

        input.classList.remove(
            "input-error"
        );

        input.removeAttribute(
            "aria-invalid"
        );
    }
}


/* =========================================================
   GENERAL CHECKOUT MESSAGE
========================================================= */

function showCheckoutMessage(
    message
) {

    let messageEl =
        document.getElementById(
            "checkoutMessage"
        );

    if (!messageEl) {

        messageEl =
            document.createElement(
                "div"
            );

        messageEl.id =
            "checkoutMessage";

        messageEl.className =
            "checkout-error";

        const form =
            document.getElementById(
                "checkoutForm"
            );

        if (form) {
            form.prepend(
                messageEl
            );
        }
    }

    messageEl.textContent =
        message;

    messageEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================================
   ORDER CONFIRMATION
========================================================= */

function showOrderConfirmation(
    orderId,
    total,
    email
) {

    const checkoutContent =
        document.getElementById(
            "checkoutContent"
        );

    if (!checkoutContent) {
        return;
    }

    checkoutContent.innerHTML = `

        <div class="confirmation-box">

            <h2>
                Order Confirmed
            </h2>

            <p>
                Thanks - order #${orderId}
                has been completed.
            </p>

            <p>
                A confirmation would normally
                be emailed to
                <strong>
                    ${escapeCheckoutHTML(email)}
                </strong>.
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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeCheckoutHTML(
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


window.submitOrder =
    submitOrder;

window.renderOrderSummary =
    renderOrderSummary;