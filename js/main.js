document.addEventListener('DOMContentLoaded', () => {

    // Function to include external HTML
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
                    })
                    .catch(err => console.error(err));
                promises.push(p);
            }
        });

        // After all includes are loaded, initialize nav
        Promise.all(promises).then(() => {
            initNav();
        });
    }

    function initNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = navMenu ? navMenu.querySelectorAll('.nav-link') : [];
    const dropdowns = document.querySelectorAll('.dropdown');

    // -------------------------------
    // Mobile Menu Toggle
    // -------------------------------
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const expanded = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', expanded);
        });
    }

    // -------------------------------
    // Highlight Current Page
    // -------------------------------
    const currentPage = window.location.pathname.split("/").pop(); // e.g., "about.html"
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split("/").pop();
        if (linkPage === currentPage || (linkPage === "index.html" && currentPage === "")) {
            link.classList.add('active');
            // If inside a dropdown, also highlight parent link
            const parentDrop = link.closest('.dropdown');
            if (parentDrop) {
                const parentToggle = parentDrop.querySelector('a.nav-link');
                if (parentToggle) parentToggle.classList.add('active');
            }
        }
    });

    // -------------------------------
    // Dropdowns
    // -------------------------------
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

    // Close dropdowns if clicking outside
    document.addEventListener('click', (e) => {
        dropdowns.forEach(drop => {
            const toggle = drop.querySelector('a.nav-link');
            const menu = drop.querySelector('.dropdown-menu');
            if (!drop.contains(e.target)) {
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Auto-update Copyright Year
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}


    // Run includeHTML first
    includeHTML();
});
