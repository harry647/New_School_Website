
// Initialize header functionality - called after DOM is ready
function initializeHeader() {
    const header = document.querySelector('.site-header');
    const darkModeBtn = document.querySelector('[onclick="toggleDarkMode()"]');
    const body = document.body;

    /* ===============================
        MOBILE MENU TOGGLE
    =============================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mobileOverlay && mainNav) {
        const closeMenu = () => {
            mobileMenuBtn.classList.remove('active');
            mainNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            body.classList.remove('menu-open');
        };

        mobileMenuBtn.addEventListener('click', () => {
            console.log('Mobile menu clicked - toggling classes');
            mobileMenuBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            console.log('Mobile menu active:', mobileMenuBtn.classList.contains('active'));
            console.log('Main nav active:', mainNav.classList.contains('active'));
            console.log('Mobile overlay active:', mobileOverlay.classList.contains('active'));
            console.log('Body menu-open:', body.classList.contains('menu-open'));
        });

        mobileOverlay.addEventListener('click', closeMenu);

        // Auto-close menu when resizing to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992) closeMenu();
        });
    }

    /* ===============================
        BOOTSTRAP DROPDOWN INITIALIZATION
    =============================== */
    // Initialize Bootstrap dropdowns for proper functionality
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.dropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.toggle('show');
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.show').forEach(dropdown => {
                dropdown.classList.remove('show');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('show');
                }
            });
        }
    });

    /* ===============================
        DROPDOWN MOBILE TOGGLE
    =============================== */
    document.querySelectorAll('.dropdown-toggle:not([data-bs-toggle="dropdown"])').forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            this.parentElement.classList.toggle('active');
        });
    });

    /* ===============================
        HEADER SCROLL EFFECT
    =============================== */
    if (header) {
        window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    /* ===============================
        DARK MODE INIT
    =============================== */
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        body.classList.add('dark-mode');
        updateDarkIcon(true);
    }

    function updateDarkIcon(isDark) {
        if (!darkModeBtn) return;
        const icon = darkModeBtn.querySelector('i');
        if (!icon) return;

        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    /* ===============================
        DARK MODE TOGGLE
    =============================== */
    window.toggleDarkMode = function () {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        updateDarkIcon(isDark);
    };
}

// Make initializeHeader available globally
window.initializeHeader = initializeHeader;

// Initialize with retry logic for async loaded content
function initWithRetry(attempts = 0) {
    const maxAttempts = 10;
    const delay = 100; // 100ms between attempts
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (mobileMenuBtn || attempts >= maxAttempts) {
        // Elements found or max attempts reached, initialize
        initializeHeader();
    } else {
        // Elements not found yet, try again
        setTimeout(() => initWithRetry(attempts + 1), delay);
    }
}

// Start initialization process
initWithRetry();
