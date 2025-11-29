// js/mobile-menu.js
// Enhanced version — Works perfectly with w3-include-html

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const allLinks = document.querySelectorAll('.nav-link');
    const dropdownToggles = document.querySelectorAll('.dropdown > .nav-link');

    if (!hamburger || !navMenu) return;

    /* -------------------------------------------------------
       1) MOBILE MENU TOGGLE
    ------------------------------------------------------- */
    hamburger.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
    });

    /* -------------------------------------------------------
       2) CLOSE MENU WHEN CLICKING ANY LINK
          (Great mobile UX)
    ------------------------------------------------------- */
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    /* -------------------------------------------------------
       3) MOBILE DROPDOWN TOGGLE (tap to expand)
    ------------------------------------------------------- */
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            // Only behave as accordion in mobile (<992px)
            if (window.innerWidth <= 992) {
                e.preventDefault(); // prevent navigation
                const parent = toggle.parentElement;

                parent.classList.toggle('open');

                const submenu = parent.querySelector('.dropdown-menu');
                if (submenu) submenu.classList.toggle('active');
            }
        });
    });

    /* -------------------------------------------------------
       4) AUTO HIGHLIGHT CURRENT PAGE
    ------------------------------------------------------- */
    const currentPath = window.location.pathname;

    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Exact URL match
        if (href === currentPath) {
            link.classList.add('active');
        }

        // Optional: highlight index within folder
        if (href.includes("index") && currentPath.endsWith("/")) {
            link.classList.add('active');
        }
    });
});
