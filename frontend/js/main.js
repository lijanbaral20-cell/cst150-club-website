/*
    main.js
    -------
    Shared website functionality:
    - Cart badge
    - Hamburger menu
    - Footer year
    - Active navigation
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =========================================
           CART BADGE
        ========================================= */

        if (
            typeof updateCartBadge ===
            "function"
        ) {

            updateCartBadge();
        }


        /* =========================================
           FOOTER YEAR
        ========================================= */

        const yearEl =
            document.getElementById(
                "footerYear"
            );

        if (yearEl) {

            yearEl.textContent =
                new Date().getFullYear();
        }


        /* =========================================
           HAMBURGER MENU
        ========================================= */

        const navToggle =
            document.getElementById(
                "navToggle"
            );

        const siteNav =
            document.getElementById(
                "siteNav"
            );


        if (
            navToggle &&
            siteNav
        ) {

            navToggle.addEventListener(
                "click",
                function () {

                    const isOpen =
                        siteNav.classList.toggle(
                            "open"
                        );

                    navToggle.setAttribute(
                        "aria-expanded",
                        String(isOpen)
                    );
                }
            );
        }


        /* =========================================
           ACTIVE NAVIGATION
        ========================================= */

        const currentPage =
            window.location.pathname
                .split("/")
                .pop() ||
            "index.html";


        document
            .querySelectorAll(
                ".site-nav a"
            )
            .forEach(
                function (link) {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        href ===
                        currentPage
                    ) {

                        link.classList.add(
                            "active"
                        );
                    }
                }
            );
    }
);