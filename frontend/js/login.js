/*
    login.js
    --------
    Placeholder admin login. There's no real backend yet, so this checks
    against a hardcoded demo credential and sets a sessionStorage flag.

    (backend integration): replace checkCredentials() with a POST to
    something like /api/admin/login, which checks the submitted username
    and password against the password_hash column in the admins table.
    On success, the backend would normally return a session token/cookie
    instead of the sessionStorage flag used here.
*/


document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const errBox = document.getElementById("loginError");

    const res = await loginAdmin(user, pass);
    if (res.success) {
        window.location.href = "admin.html";
    } else {
        errBox.textContent = res.error || "Login failed.";
        errBox.style.display = "block";
    }
});
