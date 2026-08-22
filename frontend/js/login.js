/*
    login.js
    --------
    Admin login.
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "loginForm"
            );

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            handleLogin
        );
    }
);


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(
    event
) {

    event.preventDefault();


    const usernameEl =
        document.getElementById(
            "username"
        );

    const passwordEl =
        document.getElementById(
            "password"
        );

    const errorEl =
        document.getElementById(
            "loginError"
        );


    const username =
        usernameEl
            ? usernameEl.value.trim()
            : "";

    const password =
        passwordEl
            ? passwordEl.value
            : "";


    if (!username) {

        showLoginError(
            "Please enter your username."
        );

        return;
    }


    if (!password) {

        showLoginError(
            "Please enter your password."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({
                            username:
                                username,
                            password:
                                password
                        })
                }
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success
        ) {

            window.location.href =
                "admin.html";

            return;
        }


        showLoginError(
            data.error ||
            "Invalid username or password."
        );

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showLoginError(
            "Unable to connect to backend."
        );
    }
}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    const errorEl =
        document.getElementById(
            "loginError"
        );

    if (!errorEl) {
        return;
    }

    errorEl.textContent =
        message;

    errorEl.style.display =
        "block";
}


window.handleLogin =
    handleLogin;