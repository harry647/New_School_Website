/**
 * ENHANCED STAFF DIRECTORY - BAR UNION MIXED SECONDARY SCHOOL
 * Ultra-Premium JavaScript with Modern Features
 * Professional • Smooth • Accessible • Mobile-First
 */

document.addEventListener("DOMContentLoaded", () => {
    // Constants and Configuration
    const CONFIG = {
        DEFAULT_PHOTO: "/assets/images/defaults/default-user.png",
        ANIMATION_DELAY: 100,
        SEARCH_DEBOUNCE_MS: 300,
        LOADING_MIN_TIME: 800,
        MODAL_ANIMATION_DURATION: 300
    };

    // DOM Elements
    const elements = {
        staffGrid: document.getElementById("staffGrid"),
        searchInput: document.getElementById("staffSearch"),
        staffCategories: document.getElementById("staffCategories"),
        departmentControls: document.getElementById("departmentControls"),
        noResults: document.getElementById("noResults"),
        modal: document.getElementById("staffModal"),
        modalDetails: document.getElementById("modalDetails")
    };

    // State Management
    const state = {
        allStaff: [],
        filteredStaff: [],
        activeCategory: "all",
        activeDept: null,
        searchTerm: "",
        isLoading: false,
        animations: [],
        observers: new Map()
    };

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Escape HTML to prevent XSS attacks
     */
    const escapeHtml = (str) => {
        if (!str) return "";
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Debounce function for search optimization
     */
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * Smooth scroll to element
     */
    const smoothScrollTo = (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    /**
     * Add loading state
     */
    const showLoading = () => {
        state.isLoading = true;
        elements.staffGrid.innerHTML = `
            <div class="loader">
                <i class="fas fa-spinner fa-spin fa-4x mb-4"></i>
                <p>Loading our dedicated team...</p>
            </div>
        `;
    };

    /**
     * Hide loading state
     */
    const hideLoading = () => {
        state.isLoading = false;
    };

    // ==========================================
    // DATA LOADING
    // ==========================================

    /**
     * Load staff data from API with enhanced error handling
     */
    const loadStaff = async () => {
        showLoading();
        const startTime = Date.now();
        
        try {
            const response = await fetch("/api/staff/data");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Ensure minimum loading time for smooth UX
            const elapsedTime = Date.now() - startTime;
            const remainingTime = CONFIG.LOADING_MIN_TIME - elapsedTime;
            
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
            state.allStaff = Array.isArray(data) ? data : [];
            state.filteredStaff = [...state.allStaff];
            
            populateDepartments();
            renderStaff();
            initIntersectionObserver();
            addEventListeners();
            
        } catch (error) {
            console.error("Staff load failed:", error);
            elements.staffGrid.innerHTML = `
                <div class="text-center py-5 text-danger">
                    <i class="fas fa-exclamation-triangle fa-4x mb-4"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>Unable to load staff directory.<br>Please check your connection and try again.</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
        } finally {
            hideLoading();
        }
    };

    // ==========================================
    // DEPARTMENT MANAGEMENT
    // ==========================================

    /**
     * Populate department filters dynamically
     */
    const populateDepartments = () => {
        const departments = [...new Set(state.allStaff
            .map(staff => staff.department)
            .filter(dept => dept && dept.trim())
        )].sort();

        const departmentButtons = [
            '<button class="dept-btn active px-4 py-2 rounded-full bg-white text-primary-800 border-2 border-white hover:bg-gray-100 font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg" data-dept="all">All Departments</button>',
            ...departments.map(dept =>
                `<button class="dept-btn px-4 py-2 rounded-full bg-white text-primary-800 border-2 border-white hover:bg-gray-100 font-semibold transition-all duration-300 shadow-md hover:shadow-lg" data-dept="${dept.toLowerCase()}">${escapeHtml(dept)}</button>`
            )
        ];

        elements.departmentControls.innerHTML = departmentButtons.join('');
    };

    // ==========================================
    // STAFF RENDERING
    // ==========================================

    /**
     * Render staff cards with enhanced animations
     */
    const renderStaff = () => {
        elements.staffGrid.innerHTML = '';

        if (state.filteredStaff.length === 0) {
            showNoResults();
            return;
        }

        hideNoResults();

        const fragment = document.createDocumentFragment();
        state.filteredStaff.forEach((member, index) => {
            const card = createStaffCard(member, index);
            fragment.appendChild(card);
        });

        elements.staffGrid.appendChild(fragment);
        
        // Trigger intersection observer for animations
        setTimeout(() => {
            state.observers.get('reveal')?.observeAll?.();
        }, 50);
    };

    /**
     * Create individual staff card with enhanced markup
     */
    const createStaffCard = (member, index) => {
        const card = document.createElement("div");
        card.className = "staff-card reveal bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-primary-200 hover:-translate-y-2 group";
        card.style.animationDelay = `${index * CONFIG.ANIMATION_DELAY}ms`;
        card.dataset.category = member.category || "teaching";
        card.dataset.department = (member.department || "").toLowerCase();

        card.innerHTML = `
            <div class="staff-photo relative overflow-hidden rounded-t-2xl">
                <img data-src="${escapeHtml(member.photo || CONFIG.DEFAULT_PHOTO)}"
                     alt="${escapeHtml(member.name)}"
                     class="lazy blur w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                     loading="lazy"
                     onerror="this.src='${CONFIG.DEFAULT_PHOTO}'; this.onerror=null;">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div class="staff-info p-6">
                <h3 class="font-bold text-xl text-primary-800 mb-2">${escapeHtml(member.name)}</h3>
                <p class="designation text-primary-600 font-semibold mb-2">${escapeHtml(member.designation || '')}</p>
                ${member.qualification ? `<p class="qualification text-gray-600 text-sm mb-2">${escapeHtml(member.qualification)}</p>` : ''}
                ${member.department ? `<p class="dept text-gray-500 text-sm"><strong>Dept:</strong> ${escapeHtml(member.department)}</p>` : ''}
            </div>
            <div class="card-overlay absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="text-center text-white">
                    <i class="fas fa-user-graduate text-3xl mb-2"></i>
                    <span class="font-semibold">View Details</span>
                </div>
            </div>
        `;

        // Add click event for modal
        card.addEventListener("click", () => openStaffModal(member));
        
        // Add keyboard navigation
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View details for ${member.name}`);
        
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openStaffModal(member);
            }
        });

        return card;
    };

    /**
     * Show no results message
     */
    const showNoResults = () => {
        elements.noResults.style.display = "block";
        elements.noResults.innerHTML = `
            <i class="fas fa-users-slash fa-4x mb-4"></i>
            <h3>No Staff Found</h3>
            <p>Try adjusting your search or filter criteria.</p>
        `;
    };

    /**
     * Hide no results message
     */
    const hideNoResults = () => {
        elements.noResults.style.display = "none";
    };

    // ==========================================
    // FILTERING & SEARCH
    // ==========================================

    /**
     * Apply all filters with enhanced logic
     */
    const applyFilters = () => {
        const searchTerm = state.searchTerm.toLowerCase().trim();

        state.filteredStaff = state.allStaff.filter(member => {
            const matchesCategory = state.activeCategory === "all" || 
                                  member.category === state.activeCategory;
            const matchesDept = !state.activeDept || 
                              (member.department || "").toLowerCase() === state.activeDept;
            const matchesSearch = !searchTerm || [
                member.name,
                member.designation,
                member.department,
                member.qualification,
                member.bio
            ].filter(field => field).some(field => 
                field.toLowerCase().includes(searchTerm)
            );

            return matchesCategory && matchesDept && matchesSearch;
        });

        renderStaff();
    };

    /**
     * Enhanced search with debouncing
     */
    const debouncedSearch = debounce((value) => {
        state.searchTerm = value;
        applyFilters();
    }, CONFIG.SEARCH_DEBOUNCE_MS);

    // ==========================================
    // MODAL FUNCTIONALITY
    // ==========================================

    /**
     * Open staff modal with enhanced features
     */
    const openStaffModal = (member) => {
        const vcard = createVCard(member);
        const qrUrl = generateQRCode(vcard);

        elements.modalDetails.innerHTML = `
            <div class="modal-profile">
                <div class="modal-photo">
                    <img src="${escapeHtml(member.photo || CONFIG.DEFAULT_PHOTO)}" 
                         alt="${escapeHtml(member.name)}" 
                         onerror="this.src='${CONFIG.DEFAULT_PHOTO}'">
                </div>
                <div class="modal-info">
                    <h2>${escapeHtml(member.name)}</h2>
                    <p class="designation">${escapeHtml(member.designation || '')}</p>
                    ${member.qualification ? `<p class="qualification">${escapeHtml(member.qualification)}</p>` : ''}
                    ${member.department ? `<p><strong>Department:</strong> ${escapeHtml(member.department)}</p>` : ''}
                    
                    ${member.bio ? `
                        <div class="bio">
                            <h4><i class="fas fa-info-circle"></i> About</h4>
                            <p>${escapeHtml(member.bio)}</p>
                        </div>
                    ` : ''}

                    <div class="modal-actions">
                        ${member.email ? `
                            <a href="mailto:${member.email}" class="btn btn-outline" aria-label="Email ${member.name}">
                                <i class="fas fa-envelope"></i> Email
                            </a>
                        ` : ''}
                        ${member.phone ? `
                            <a href="tel:${member.phone}" class="btn btn-primary" aria-label="Call ${member.name}">
                                <i class="fas fa-phone"></i> Call
                            </a>
                            <a href="https://wa.me/${member.phone.replace(/\D/g,'')}" 
                               target="_blank" 
                               rel="noopener" 
                               class="btn btn-success"
                               aria-label="WhatsApp ${member.name}">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </a>
                        ` : ''}
                        <button onclick="window.print()" class="btn btn-secondary" aria-label="Print contact info">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>

                    <div class="modal-qr">
                        <h4><i class="fas fa-qrcode"></i> Scan to Save Contact</h4>
                        <img src="${qrUrl}" alt="QR Code for ${escapeHtml(member.name)}" loading="lazy">
                        <p><small>Scan with your phone to save contact information</small></p>
                    </div>
                </div>
            </div>
        `;

        // Show modal with animation
        elements.modal.style.display = "block";
        document.body.style.overflow = "hidden";
        
        // Focus management for accessibility
        elements.modal.setAttribute("aria-hidden", "false");
        const firstFocusable = elements.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
    };

    /**
     * Create vCard for QR code
     */
    const createVCard = (member) => {
        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${member.name}`,
            `N:${member.name.split(" ").reverse().join(";")}`,
            `TITLE:${member.designation || ''}`,
            member.email ? `EMAIL:${member.email}` : '',
            member.phone ? `TEL;TYPE=WORK,VOICE:${member.phone}` : '',
            "END:VCARD"
        ].filter(Boolean).join("\n");
    };

    /**
     * Generate QR code URL
     */
    const generateQRCode = (data) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
    };

    /**
     * Close modal with animation
     */
    const closeModal = () => {
        elements.modal.style.display = "none";
        document.body.style.overflow = "";
        elements.modal.setAttribute("aria-hidden", "true");
    };

    // ==========================================
    // ANIMATIONS & INTERSECTION OBSERVER
    // ==========================================

    /**
     * Initialize intersection observer for animations
     */
    const initIntersectionObserver = () => {
        const lazyImages = document.querySelectorAll(".lazy");
        const revealElements = document.querySelectorAll(".reveal");

        // Image lazy loading observer
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("blur");
                    img.classList.add("loaded");
                    imageObserver.unobserve(img);
                }
            });
        }, { 
            rootMargin: "50px",
            threshold: 0.1 
        });

        // Reveal animation observer
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        // Store observers for later use
        state.observers.set('image', imageObserver);
        state.observers.set('reveal', {
            observeAll: () => revealElements.forEach(el => revealObserver.observe(el))
        });

        // Apply to existing elements
        lazyImages.forEach(img => imageObserver.observe(img));
        revealElements.forEach(el => revealObserver.observe(el));
    };

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    /**
     * Add all event listeners
     */
    const addEventListeners = () => {
        // Search input
        elements.searchInput?.addEventListener("input", (e) => {
            debouncedSearch(e.target.value);
        });

        // Category filters
        elements.staffCategories?.addEventListener("click", (e) => {
            const btn = e.target.closest(".filter-btn");
            if (!btn) return;

            elements.staffCategories.querySelectorAll(".filter-btn").forEach(b => 
                b.classList.remove("active")
            );
            btn.classList.add("active");
            state.activeCategory = btn.dataset.filter;
            applyFilters();
        });

        // Department filters
        elements.departmentControls?.addEventListener("click", (e) => {
            const btn = e.target.closest(".dept-btn");
            if (!btn) return;

            elements.departmentControls.querySelectorAll(".dept-btn").forEach(b => 
                b.classList.remove("active")
            );
            btn.classList.add("active");
            state.activeDept = btn.dataset.dept === "all" ? null : btn.dataset.dept;
            applyFilters();
        });

        // Modal events
        elements.modal?.addEventListener("click", (e) => {
            if (e.target === elements.modal || e.target.classList.contains("close-modal")) {
                closeModal();
            }
        });

        // Keyboard events
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && elements.modal.style.display === "block") {
                closeModal();
            }
        });

        // Window events
        window.addEventListener("beforeunload", () => {
            // Cleanup observers
            state.observers.forEach(observer => {
                if (observer.disconnect) observer.disconnect();
            });
        });
    };

    // ==========================================
    // ENHANCED FEATURES
    // ==========================================

    /**
     * Add keyboard navigation
     */
    const initKeyboardNavigation = () => {
        const cards = document.querySelectorAll('.staff-card');
        
        cards.forEach((card, index) => {
            card.addEventListener('keydown', (e) => {
                let targetIndex;
                
                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = (index + 1) % cards.length;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = (index - 1 + cards.length) % cards.length;
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = Math.min(index + getCardsPerRow(), cards.length - 1);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = Math.max(index - getCardsPerRow(), 0);
                        break;
                }
                
                if (targetIndex !== undefined) {
                    cards[targetIndex].focus();
                }
            });
        });
    };

    /**
     * Get number of cards per row for keyboard navigation
     */
    const getCardsPerRow = () => {
        const grid = elements.staffGrid;
        const style = window.getComputedStyle(grid);
        const gridTemplateColumns = style.gridTemplateColumns;
        return gridTemplateColumns.split(' ').length;
    };

    /**
     * Performance monitoring
     */
    const monitorPerformance = () => {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Staff page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }, 0);
            });
        }
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Initialize the staff directory
     */
    const init = async () => {
        try {
            await loadStaff();
            initKeyboardNavigation();
            monitorPerformance();
        } catch (error) {
            console.error("Initialization failed:", error);
        }
    };

    // Start the application
    init();

    // Export for potential external use
    window.StaffDirectory = {
        refresh: loadStaff,
        filter: applyFilters,
        openModal: openStaffModal,
        closeModal: closeModal
    };
});