// js/static/mobile-menu.js
// Enhanced Mobile Menu – Fully Accessible, Smooth & Production Ready
// Works perfectly with w3-include-html and all screen sizes

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    const menuOverlay = document.querySelector('.menu-overlay');

    // Safety check – if header not loaded yet (w3-include delay), wait a bit
    if (!hamburger || !navMenu) {
        // Retry once after w3-include finishes (max 3 seconds)
        const retry = setInterval(() => {
            const h = document.querySelector('.hamburger');
            const m = document.querySelector('.nav-menu');
            if (h && m) {
                clearInterval(retry);
                initMobileMenu(h, m);
            }
        }, 100);

        setTimeout(() => clearInterval(retry), 3000);
        return;
    }

    initMobileMenu(hamburger, navMenu);

    function initMobileMenu(hamburger, navMenu) {
        const allLinks = navMenu.querySelectorAll('.nav-link');
        const dropdownToggles = navMenu.querySelectorAll('.dropdown > .nav-link');

        // ===================================
        // 1. Hamburger Toggle
        // ===================================
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            body.classList.toggle('menu-open', isOpen); // Optional: prevent scroll when menu open
            if (menuOverlay) menuOverlay.classList.toggle('active', isOpen);
        });

        // ===================================
        // 2. Close menu when clicking a link (mobile only)
        // ===================================
        allLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close menu if this is a dropdown toggle on mobile
                if (navMenu.classList.contains('active') &&
                    !(link.parentElement.classList.contains('dropdown') && window.innerWidth <= 992)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    body.classList.remove('menu-open');
                    if (menuOverlay) menuOverlay.classList.remove('active');
                }
            });
        });

        // ===================================
        // 3. Dropdown Toggle on Mobile (Accordion Style)
        // ===================================
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                if (window.innerWidth > 992) return; // Only mobile

                e.preventDefault();
                const dropdown = this.parentElement;
                const submenu = dropdown.querySelector('.dropdown-menu');

                // Close other open dropdowns (optional single-open behavior)
                document.querySelectorAll('.dropdown.active').forEach(open => {
                    if (open !== dropdown) {
                        open.classList.remove('active');
                        open.querySelector('.dropdown-menu')?.classList.remove('active');
                    }
                });

                // Toggle current
                dropdown.classList.toggle('active');
                if (submenu) submenu.classList.toggle('active');
            });
        });

        // ===================================
        // 3b. Dropdown Toggle ON DESKTOP (Click to open)
        // ===================================
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                if (window.innerWidth <= 992) return; // skip mobile

                e.preventDefault();

                const dropdown = this.parentElement;

                document.querySelectorAll('.dropdown.active').forEach(open => {
                    if (open !== dropdown) open.classList.remove('active');
                });

                dropdown.classList.toggle('active');
            });
        });

        // ===================================
        // 4. Auto Highlight Current Page (Smart & Reliable)
        // ===================================
        const currentPath = window.location.pathname;
        const currentFullUrl = window.location.href;

        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;

            // Normalize paths
            const linkUrl = new URL(href, window.location.origin).pathname;

            // Exact match
            if (linkUrl === currentPath || linkUrl === currentPath + 'index.html') {
                link.classList.add('active');
            }

            // Home page special case ("/" or "/index.html")
            if ((currentPath === '/' || currentPath.endsWith('/index.html')) && 
                (href === '/' || href === 'index.html' || href.endsWith('/index.html'))) {
                link.classList.add('active');
            }
        });

        // ===================================
        // 5. Close menu when clicking outside (optional bonus UX)
        // ===================================
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
                if (menuOverlay) menuOverlay.classList.remove('active');
            }
        });

        // ===================================
        // 6. Close menu on Escape key
        // ===================================
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
                if (menuOverlay) menuOverlay.classList.remove('active');
            }
        });
    }
});