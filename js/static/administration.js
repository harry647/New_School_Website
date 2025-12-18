// ================================================================
// administration.js – STUNNING 2025 EDITION
// Enhanced with Premium Animations, Smooth Interactions, & Mobile-First Design
// ================================================================

console.log("%c🎓 [Administration] Script initializing...", "color: #0175C2; font-size: 16px; font-weight: bold;");

// ================================================================
// 1. ENHANCED UTILITIES & HELPERS
// ================================================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll to element
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Enhanced intersection observer with thresholds
const observerOptions = {
    threshold: [0.1, 0.3, 0.7],
    rootMargin: '0px 0px -50px 0px'
};

// ================================================================
// 2. ENHANCED CONTENT LOADING
// ================================================================

class ContentLoader {
    constructor() {
        this.grids = {
            bom: document.getElementById('bomGrid'),
            leadership: document.getElementById('leadershipGrid'),
            departments: document.getElementById('departmentsGrid'),
            dynamicDepartments: document.getElementById('dynamicDepartmentsGrid')
        };
        
        this.targetDeptGrid = this.grids.dynamicDepartments || this.grids.departments;
        this.cache = new Map();
        this.loadingStates = new Map();
        
        console.log("📊 Grids found →", {
            bom: !!this.grids.bom,
            leadership: !!this.grids.leadership,
            dynamicDepts: !!this.grids.dynamicDepartments,
            target: this.targetDeptGrid?.id
        });
    }
    
    removeLoader(grid) {
        if (!grid) return;
        const loader = grid.parentElement?.querySelector('.loader');
        if (loader) {
            console.log(`🔄 Loader removed → ${grid.id}`);
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }
    
    createEnhancedCard(type, data) {
        const card = document.createElement('div');
        
        // Generate unique ID for the card
        const cardId = `${type}-${data.name.replace(/\s+/g, '-').toLowerCase()}`;
        card.id = cardId;
         
        switch (type) {
            case 'bom':
                card.className = 'bom-card fade-in';
                card.innerHTML = `
                    <div class="card-inner">
                        <img src="${data.photo || '/assets/images/defaults/default-user.png'}"
                             alt="${data.name}" loading="lazy"
                             onerror="this.src='/assets/images/defaults/default-user.png'">
                        <div class="card-content">
                            <h4>${data.name}</h4>
                            <p class="role">${data.role}</p>
                            ${data.representing ? `<p><em>Representing: ${data.representing}</em></p>` : ''}
                        </div>
                    </div>
                `;
                break;
                
            case 'leadership':
                const fullBio = data.bio || 'No additional details available.';
                card.className = `leader-card fade-in ${data.featured ? 'featured' : ''}`;
                card.innerHTML = `
                    <div class="card-inner">
                        <img src="${data.photo || '/assets/images/defaults/default-user.jpg'}"
                             alt="${data.name}" loading="lazy"
                             onerror="this.src='/assets/images/defaults/default-user.jpg'">
                        <div class="card-content">
                            <h4>${data.name}</h4>
                            <p><strong>${data.role}</strong></p>
                            <p>${fullBio.length > 130 ? fullBio.substring(0, 130) + '...' : fullBio}</p>
                            <button class="view-more-btn" data-details="${fullBio.replace(/"/g, '"')}">
                                <span class="btn-text">View More</span>
                                <span class="btn-icon"><i class="fas fa-arrow-right"></i></span>
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            case 'departments':
                card.className = 'dept-card fade-in';
                card.innerHTML = `
                    <div class="card-inner">
                        <i class="${data.icon || 'fas fa-building'} fa-3x" style="color:${data.color || '#0175C2'}"></i>
                        <div class="card-content">
                            <h4>${data.name}</h4>
                            <p><strong>${data.head}</strong><br><small>${data.headTitle || 'Department Head'}</small></p>
                            <div class="contact">
                                ${data.email ? `<span><i class="fas fa-envelope"></i> <a href="mailto:${data.email}">${data.email}</a></span>` : ''}
                                ${data.phone ? `<span><i class="fas fa-phone"></i> ${data.phone}</span>` : ''}
                                ${data.note ? `<span><i class="fas fa-info-circle"></i> ${data.note}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        return card;
    }
    
    async loadData() {
        try {
            console.log("📡 Fetching /data/static/admin-data.json...");
            
            // Add cache busting for development
            const cacheKey = 'adminData';
            if (this.cache.has(cacheKey)) {
                console.log("📦 Using cached data");
                return this.cache.get(cacheKey);
            }
            
            const res = await fetch('/data/static/admin-data.json?t=' + Date.now());
            if (!res.ok) {
                // Fallback to individual JSON files if admin-data.json is not found
                console.log("⚠️ Fallback: Loading individual JSON files...");
                return this.loadFallbackData();
            }
            
            const data = await res.json();
            this.cache.set(cacheKey, data);
            console.log("✅ JSON loaded →", data);
            
            return data;
            
        } catch (err) {
            console.error("❌ ERROR →", err);
            // Fallback to individual JSON files on error
            console.log("⚠️ Fallback: Loading individual JSON files...");
            return this.loadFallbackData();
        }
    }
    
    async loadFallbackData() {
        try {
            // Load BOM members
            const bomRes = await fetch('/data/static/bom-members.json?t=' + Date.now());
            const bomData = bomRes.ok ? await bomRes.json() : [];
            
            // Load leadership data
            const leadershipRes = await fetch('/data/static/leadership.json?t=' + Date.now());
            const leadershipData = leadershipRes.ok ? await leadershipRes.json() : [];
            
            // Load departments data
            const deptRes = await fetch('/data/static/admin-departments.json?t=' + Date.now());
            const deptData = deptRes.ok ? await deptRes.json() : [];
            
            // Transform departments data to match expected format
            const transformedDepts = deptData.map(dept => ({
                name: dept.title,
                head: dept.head,
                icon: dept.icon,
                description: dept.description,
                email: dept.email || '',
                phone: dept.phone || '',
                note: dept.note || ''
            }));
            
            const fallbackData = {
                bom: bomData,
                leadership: leadershipData,
                departments: transformedDepts
            };
            
            console.log("✅ Fallback data loaded →", fallbackData);
            return fallbackData;
            
        } catch (fallbackErr) {
            console.error("❌ Fallback ERROR →", fallbackErr);
            throw fallbackErr;
        }
    }
    
    async renderContent() {
        try {
            const data = await this.loadData();
            
            // Enhanced BOM rendering
            if (data.bom?.length && this.grids.bom) {
                console.log(`🏛️ Rendering ${data.bom.length} BOM members`);
                data.bom.forEach((member, index) => {
                    const card = this.createEnhancedCard('bom', member);
                    card.style.animationDelay = `${index * 0.1}s`;
                    this.grids.bom.appendChild(card);
                });
                this.removeLoader(this.grids.bom);
            }
            
            // Enhanced Leadership rendering
            if (data.leadership?.length && this.grids.leadership) {
                console.log(`👨‍💼 Rendering ${data.leadership.length} leadership cards`);
                data.leadership.forEach((person, index) => {
                    const card = this.createEnhancedCard('leadership', person);
                    card.style.animationDelay = `${index * 0.15}s`;
                    this.grids.leadership.appendChild(card);
                });
                this.removeLoader(this.grids.leadership);
            }
            
            // Enhanced Departments rendering
            if (data.departments?.length && this.targetDeptGrid) {
                console.log(`🏢 Rendering ${data.departments.length} departments → #${this.targetDeptGrid.id}`);
                data.departments.forEach((dept, index) => {
                    const card = this.createEnhancedCard('departments', dept);
                    card.style.animationDelay = `${index * 0.1}s`;
                    this.targetDeptGrid.appendChild(card);
                });
                this.removeLoader(this.targetDeptGrid);
            }
            
            console.log("%c🎉 SUCCESS → All cards rendered with enhanced animations!", "color:#2ecc71;font-size:18px;font-weight:bold;background:#000;padding:8px;border-radius:6px;");
            
        } catch (err) {
            console.error("❌ CRITICAL ERROR →", err);
            this.showError(err);
        }
    }
    
    showError(err) {
        Object.values(this.grids).forEach(grid => {
            if (grid) {
                grid.innerHTML = `
                    <div class="error-message fade-in" style="
                        text-align: center;
                        padding: 3rem;
                        background: #fee;
                        border: 1px solid #fcc;
                        border-radius: 16px;
                        color: #c33;
                        margin: 2rem 0;
                    ">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #e74c3c;"></i>
                        <h3>Unable to load content</h3>
                        <p>Please check your internet connection and try refreshing the page.</p>
                        <button onclick="location.reload()" style="
                            margin-top: 1rem;
                            padding: 0.8rem 2rem;
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                `;
            }
        });
    }
}

// ================================================================
// 3. ENHANCED ANIMATIONS SYSTEM
// ================================================================

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.init();
    }
    
    init() {
        // Enhanced fade-in observer
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add staggered animation for card grids
                    if (entry.target.classList.contains('card-grid')) {
                        this.animateChildren(entry.target);
                    }
                    
                    // Unobserve for performance
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            fadeObserver.observe(el);
        });
        
        // Enhanced scroll animations
        this.setupScrollAnimations();
        
        // Parallax effects for hero
        this.setupParallaxEffects();
    }
    
    animateChildren(container) {
        const children = container.querySelectorAll('.fade-in');
        children.forEach((child, index) => {
            child.style.animationDelay = `${index * 0.1}s`;
            child.classList.add('visible');
        });
    }
    
    setupScrollAnimations() {
        const handleScroll = debounce(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            // Parallax for hero background
            const hero = document.querySelector('.page-hero');
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
            
            // Floating animation for stats
            document.querySelectorAll('.stat').forEach((stat, index) => {
                const rect = stat.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = 1 - Math.abs(rect.top - window.innerHeight/2) / (window.innerHeight/2);
                    stat.style.transform = `translateY(${progress * 20}px)`;
                }
            });
        }, 16); // 60fps
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    setupParallaxEffects() {
        // Enhanced hover effects for cards
        document.querySelectorAll('.leader-card, .dept-card, .info-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                if (window.innerWidth > 768) { // Only on desktop
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const mouseX = e.clientX - centerX;
                    const mouseY = e.clientY - centerY;
                    
                    const rotateX = (mouseY / rect.height) * 10;
                    const rotateY = (mouseX / rect.width) * -10;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
            
            // Mobile touch interactions
            card.addEventListener('touchstart', () => {
                card.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', () => {
                setTimeout(() => card.style.transform = '', 150);
            });
        });
    }
}

// ================================================================
// 4. ENHANCED MODAL SYSTEM
// ================================================================

class ModalManager {
    constructor() {
        this.modal = document.getElementById('modalOverlay');
        this.modalBody = document.getElementById('modalBody');
        this.init();
    }
    
    init() {
        if (!this.modal || !this.modalBody) return;
        
        // Enhanced modal event handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.view-more-btn')) {
                this.openModal(e.target);
            }
            
            if (e.target.matches('.close-modal') || e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.closeModal();
            }
        });
        
        // Prevent body scroll when modal is open
        this.modal.addEventListener('wheel', (e) => e.preventDefault());
    }
    
    openModal(button) {
        const details = button.dataset.details || 'No additional details available.';
        
        this.modalBody.innerHTML = `
            <div class="modal-header" style="
                border-bottom: 2px solid #eee;
                padding-bottom: 1rem;
                margin-bottom: 2rem;
            ">
                <h2 style="
                    font-family: 'Playfair Display', serif;
                    color: var(--primary-blue-dark);
                    font-size: 2rem;
                    margin: 0;
                ">More Details</h2>
            </div>
            <div class="modal-content-body" style="
                line-height: 1.8;
                color: var(--text-secondary);
                font-size: 1.1rem;
            ">
                ${details.replace(/\n/g, '</p><p>')}
            </div>
        `;
        
        this.modal.style.display = 'flex';
        this.modal.style.opacity = '0';
        document.body.style.overflow = 'hidden';
        
        // Animate modal in
        setTimeout(() => {
            this.modal.style.opacity = '1';
        }, 10);
        
        // Focus management for accessibility
        this.modal.focus();
    }
    
    closeModal() {
        this.modal.style.opacity = '0';
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }
}

// ================================================================
// 5. ENHANCED UTILITY FUNCTIONS
// ================================================================

// Loading progress indicator
function showLoadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'page-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light));
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 90) {
            progress = 90;
            clearInterval(interval);
        }
        progressBar.style.width = progress + '%';
    }, 100);
    
    return {
        complete: () => {
            progressBar.style.width = '100%';
            setTimeout(() => progressBar.remove(), 500);
        }
    };
}

// Enhanced navigation
function enhanceNavigation() {
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScrollTo(target);
            }
        });
    });
}

// Mobile performance optimization
function optimizeForMobile() {
    if (window.innerWidth <= 768) {
        // Reduce animation complexity on mobile
        document.querySelectorAll('.fade-in').forEach(el => {
            el.style.transitionDuration = '0.3s';
        });
        
        // Disable parallax on mobile for performance
        window.removeEventListener('scroll', () => {});
    }
}

// ================================================================
// 6. MAIN INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 Starting enhanced administration page...");
    
    // Show loading progress
    const progress = showLoadingProgress();
    
    try {
        // Initialize all systems
        const loader = new ContentLoader();
        const animations = new AnimationManager();
        const modal = new ModalManager();
        
        // Apply enhancements
        enhanceNavigation();
        optimizeForMobile();
        
        // Load content
        await loader.renderContent();
        
        // Complete loading
        progress.complete();
        
        console.log("%c🎊 SUCCESS → Enhanced Administration page loaded perfectly!", "color:#2ecc71;font-size:20px;font-weight:bold;background:#000;padding:10px;border-radius:8px;");
        
    } catch (error) {
        console.error("❌ Failed to initialize:", error);
        progress.complete();
    }
});

// Enhanced page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations when tab becomes visible
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// ================================================================
// 7. ENHANCED ERROR HANDLING
// ================================================================

window.addEventListener('error', (e) => {
    console.error("💥 JavaScript Error:", e.error);
    
    // Graceful degradation - show fallback content
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        el.classList.add('visible');
    });
});

// Network status monitoring
window.addEventListener('online', () => {
    console.log("🌐 Network connection restored");
    // Optionally reload content if needed
});

window.addEventListener('offline', () => {
    console.log("📡 Network connection lost");
});

// ================================================================
// 8. PERFORMANCE MONITORING
// ================================================================

if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`⚡ Page Load Time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        }, 0);
    });
}

// Enhanced debugging (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("🔧 Development mode - Enhanced debugging enabled");
    
    // Add development tools
    window.adminDebug = {
        loader: () => document.querySelectorAll('.fade-in').length,
        visible: () => document.querySelectorAll('.visible').length,
        grids: () => document.querySelectorAll('[id$="Grid"]').length
    };
}