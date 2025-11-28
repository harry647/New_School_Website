document.addEventListener('DOMContentLoaded', () => {

    function includeHTML() {
        const includes = document.querySelectorAll('[w3-include-html]');
        const promises = [];

        includes.forEach(el => {
            const file = el.getAttribute('w3-include-html');
            if (file) {
                const p = fetch(file)
                    .then(response => {
                        if (!response.ok) throw new Error('File not found: ' + file);
                        return response.text();
                    })
                    .then(data => {
                        el.innerHTML = data;
                        el.removeAttribute('w3-include-html');

                        // Immediately initialize nav for this included header
                        if (el.querySelector('.header')) initNav(el.querySelector('.header'));
                    })
                    .catch(err => console.error(err));
                promises.push(p);
            }
        });

        // Optional: init other navs if header already exists
        Promise.all(promises).then(() => {
            const existingHeaders = document.querySelectorAll('.header');
            existingHeaders.forEach(h => initNav(h));
        });
    }

    function initNav(header) {
        if (!header) return;

        const hamburger = header.querySelector('.hamburger');
        const navMenu = header.querySelector('.nav-menu');
        const navLinks = navMenu ? navMenu.querySelectorAll('.nav-link') : [];
        const dropdowns = header.querySelectorAll('.dropdown');

        // Mobile menu toggle
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                const expanded = hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                header.classList.toggle('nav-open');
                hamburger.setAttribute('aria-expanded', expanded);
            });
        }

        // Highlight current page
        const currentPage = window.location.pathname.split("/").pop();
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split("/").pop();
            if (linkPage === currentPage || (linkPage === "index.html" && currentPage === "")) {
                link.classList.add('active');
                const parentDrop = link.closest('.dropdown');
                if (parentDrop) {
                    const parentToggle = parentDrop.querySelector('a.nav-link');
                    if (parentToggle) parentToggle.classList.add('active');
                }
            }
        });

        // Dropdown toggle
        dropdowns.forEach(drop => {
            const toggle = drop.querySelector('a.nav-link');
            const menu = drop.querySelector('.dropdown-menu');

            const closeOtherDropdowns = () => {
                dropdowns.forEach(otherDrop => {
                    if (otherDrop !== drop) {
                        const otherMenu = otherDrop.querySelector('.dropdown-menu');
                        const otherToggle = otherDrop.querySelector('a.nav-link');
                        if (otherMenu) otherMenu.classList.remove('active');
                        if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            };

            toggle.addEventListener('click', e => {
                e.preventDefault();
                closeOtherDropdowns();
                menu.classList.toggle('active');
                toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
            });

            toggle.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeOtherDropdowns();
                    menu.classList.toggle('active');
                    toggle.setAttribute('aria-expanded', menu.classList.contains('active'));
                }
            });
        });

        // Close menus on outside click
        document.addEventListener('click', (e) => {
            dropdowns.forEach(drop => {
                const toggle = drop.querySelector('a.nav-link');
                const menu = drop.querySelector('.dropdown-menu');
                if (!drop.contains(e.target)) {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });

            if (hamburger && navMenu && header) {
                if (!header.contains(e.target) && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                    header.classList.remove('nav-open');
                    hamburger.setAttribute('aria-expanded', false);
                }
            }
        });

        // Auto-update year
        const yearEl = document.getElementById("currentYear");
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    // Run includes
    includeHTML();
});
