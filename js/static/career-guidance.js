/**
 * ===============================================
 * CAREER & GUIDANCE PAGE – ENHANCED INTERACTIVE SCRIPT (2026+)
 * Advanced functionality with premium UX and animations
 * ===============================================
 */

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    // Configuration
    const CONFIG = {
        DEFAULT_PHOTO: "/assets/images/defaults/default-user.png",
        SWIPER_CONFIG: {
            loop: true,
            autoplay: { delay: 7000, disableOnInteraction: false },
            speed: 800,
            spaceBetween: 30,
            slidesPerView: 1,
            centeredSlides: true,
            grabCursor: true,
            pagination: { el: "#successStoriesSwiper .swiper-pagination", clickable: true },
            navigation: {
                nextEl: "#successStoriesSwiper .swiper-button-next",
                prevEl: "#successStoriesSwiper .swiper-button-prev",
            },
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
            effect: "coverflow",
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2.5,
                slideShadows: true,
            },
        }
    };

    // ===============================================
    // UTILITY FUNCTIONS
    // ===============================================
    
    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element, duration = 1000) {
        const targetPosition = element.offsetTop - 100;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
            
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }

        requestAnimationFrame(animation);
    }

    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Intersection Observer for animations
     */
    const createIntersectionObserver = (callback, options = {}) => {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -80px 0px'
        };
        return new IntersectionObserver(callback, { ...defaultOptions, ...options });
    };

    // ===============================================
    // ENHANCED SCROLL REVEAL ANIMATIONS
    // ===============================================
    
    function initScrollRevealAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -80px 0px"
        };

        const observer = createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add staggered animation delays for grouped elements
                    if (element.classList.contains('service-card')) {
                        animateServiceCards(element);
                    } else if (element.classList.contains('stat')) {
                        animateStats(element);
                    } else {
                        animateElement(element);
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, observerOptions);

        // Observe all revealable elements
        const revealElements = document.querySelectorAll('.reveal, .service-card, .success-card, .stat, .mission-text, .mission-image');
        revealElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    function animateElement(element) {
        element.style.animation = 'fadeInUp 0.8s ease forwards';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    function animateServiceCards(element) {
        element.style.animation = 'fadeInUp 0.8s ease forwards';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Add special hover effect after animation
        setTimeout(() => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0) scale(1)';
            });
        }, 800);
    }

    function animateStats(element) {
        element.style.animation = 'fadeInUp 0.8s ease forwards';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        
        // Trigger counter animation
        const counter = element.querySelector('.counter');
        if (counter) {
            animateCounter(counter);
        }
    }

    // ===============================================
    // ENHANCED COUNTER ANIMATION
    // ===============================================
    
    function animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000; // 2 seconds
        const start = performance.now();
        const startValue = 0;
        const suffix = element.textContent.includes('+') ? '+' : '';

        function updateCounter(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easedProgress = easeOutQuart(progress);
            const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
            
            element.textContent = currentValue.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    function easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    // ===============================================
    // SUCCESS STORIES ENHANCEMENT
    // ===============================================
    
    async function loadSuccessStories() {
        const swiperWrapper = document.querySelector("#successStoriesSwiper .swiper-wrapper");
        const loader = document.querySelector("#successStories .loader");

        try {
            const res = await fetch("/data/static/career-success-stories.json?t=" + Date.now(), {
                cache: "no-store"
            });
            
            if (!res.ok) throw new Error("Stories not found");

            const data = await res.json();
            swiperWrapper.innerHTML = "";

            data.successStories.forEach((story, index) => {
                const slide = document.createElement("div");
                slide.className = "swiper-slide";
                slide.innerHTML = `
                    <div class="success-card reveal" style="animation-delay: ${index * 0.1}s;">
                        <div class="success-card-inner">
                            <img src="${story.photo || CONFIG.DEFAULT_PHOTO}"
                                 alt="${story.name}"
                                 loading="lazy"
                                 onerror="this.src='${CONFIG.DEFAULT_PHOTO}'; this.onerror=null;">
                            <div class="success-info">
                                <h4>${story.name}</h4>
                                <p class="batch">Batch of ${story.batch}</p>
                                <p class="achievement">${story.achievement}</p>
                                <p class="story">${story.story}</p>
                            </div>
                        </div>
                    </div>
                `;
                swiperWrapper.appendChild(slide);
            });

        } catch (err) {
            console.warn("Using static success stories:", err);
        } finally {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }
            initSwiper();
        }
    }

    function initSwiper() {
        if (typeof Swiper === "undefined") {
            console.warn("Swiper not loaded");
            return;
        }

        // Destroy existing instance if any
        const existingSwiper = document.querySelector("#successStoriesSwiper").swiper;
        if (existingSwiper) {
            existingSwiper.destroy();
        }

        new Swiper("#successStoriesSwiper", CONFIG.SWIPER_CONFIG);
    }

    // ===============================================
    // CAREER STATS ENHANCEMENT
    // ===============================================
    
    async function loadCareerStats() {
        const statsGrid = document.getElementById("careerStatsGrid");
        if (!statsGrid) return;

        try {
            const res = await fetch("/data/static/career-stats.json?t=" + Date.now());
            if (!res.ok) throw new Error();

            const data = await res.json();
            statsGrid.innerHTML = "";

            data.stats.forEach((stat, index) => {
                const item = document.createElement("div");
                item.className = "stat text-center reveal";
                item.style.animationDelay = `${index * 0.1}s`;
                item.innerHTML = `
                    <div class="stat-icon">
                        <i class="${stat.icon} fa-3x mb-4 text-cyan-300"></i>
                    </div>
                    <h3 class="counter text-5xl font-bold" data-target="${stat.value.replace(/\D/g, '')}">
                        ${stat.value.includes('+') ? '0+' : '0'}
                    </h3>
                    <p class="mt-2 text-lg opacity-white/90">${stat.label}</p>
                `;
                statsGrid.appendChild(item);
            });

        } catch (err) {
            console.info("Using static stats");
        }

        initCounterAnimations();
    }

    function initCounterAnimations() {
        const statsSection = document.querySelector('.career-stats');
        if (!statsSection) return;

        const observer = createIntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => animateCounter(counter));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        observer.observe(statsSection);
    }

    // ===============================================
    // ENHANCED FORM HANDLING
    // ===============================================
    
    function initFormHandling() {
        const counselingForm = document.getElementById("counselingForm");
        if (!counselingForm) return;

        const resumeInput = document.querySelector('input[name="resume"]');
        const resumePreview = document.getElementById("resumePreview");

        // Enhanced file preview
        if (resumeInput) {
            resumeInput.addEventListener("change", handleFilePreview);
        }

        // Enhanced form validation
        counselingForm.addEventListener("submit", handleFormSubmission);
        
        // Real-time validation
        addRealTimeValidation(counselingForm);
        
        // Auto-resize textarea
        addAutoResizeTextarea();
    }

    function handleFilePreview(event) {
        const file = event.target.files[0];
        const preview = document.getElementById("resumePreview");
        
        if (!file) {
            preview.innerHTML = "";
            return;
        }

        // Validation
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (file.size > maxSize) {
            showFormError("File too large! Maximum 10MB allowed.");
            event.target.value = "";
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showFormError("Please select a PDF or Word document.");
            event.target.value = "";
            return;
        }

        // Show preview
        preview.innerHTML = `
            <div class="file-preview-content">
                <i class="fas fa-file-alt"></i>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button type="button" class="remove-file" onclick="this.parentElement.parentElement.innerHTML=''">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    function handleFormSubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        // Validate form
        if (!validateForm(form)) {
            return;
        }

        // Update button state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Booking Session...`;
        submitBtn.style.opacity = '0.8';

        // Show progress indicator
        showFormProgress();

        // Prepare form data
        const formData = new FormData(form);
        
        // Enhanced submission with better error handling
        fetch("/api/book-counseling", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                showFormSuccess(formData);
            } else {
                throw new Error(result.message || "Booking failed");
            }
        })
        .catch(error => {
            console.error("Booking error:", error);
            showFormError("Could not book session. Please try again or call +254 700 735 472");
            resetSubmitButton(submitBtn, originalHTML);
        });
    }

    function validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, "This field is required");
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, "Please enter a valid email address");
                isValid = false;
            } else if (field.type === 'tel' && !isValidPhone(field.value)) {
                showFieldError(field, "Please enter a valid phone number");
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }

    function showFormProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'formProgress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #8b5cf6);
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(progressBar);
        
        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressBar.style.width = progress + '%';
        }, 200);
    }

    function hideFormProgress() {
        const progressBar = document.getElementById('formProgress');
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => progressBar.remove(), 500);
        }
    }

    function showFormSuccess(formData) {
        hideFormProgress();
        
        const form = document.getElementById("counselingForm");
        form.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Session Booked Successfully!</h2>
                <p>Thank you, <strong>${formData.get("student_name")}</strong>!</p>
                <p>Your counseling session request for <strong>${formData.get("grade")}</strong> has been received.</p>
                <p>
                    Our team will contact you within <strong>24–48 hours</strong> on<br>
                    <strong>${formData.get("phone")}</strong> and <strong>${formData.get("_replyto")}</strong>
                    to confirm your slot and send the Zoom link.
                </p>
                <div class="success-footer">
                    <p>We look forward to helping you shape your future!</p>
                    <button type="button" onclick="location.reload()" class="btn btn-primary">
                        Book Another Session
                    </button>
                </div>
            </div>
        `;
        
        // Add success styles
        const style = document.createElement('style');
        style.textContent = `
            .success-message {
                text-align: center;
                padding: 4rem 2rem;
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border-radius: 20px;
                color: #0f5132;
                line-height: 1.8;
            }
            .success-icon {
                font-size: 4rem;
                color: #28a745;
                margin-bottom: 2rem;
                animation: bounceIn 0.8s ease;
            }
            .success-message h2 {
                color: #166534;
                margin-bottom: 1.5rem;
            }
            .success-message p {
                font-size: 1.1rem;
                margin-bottom: 1rem;
            }
            .success-footer {
                margin-top: 2rem;
            }
        `;
        document.head.appendChild(style);
    }

    function showFormError(message) {
        hideFormProgress();
        alert(message);
    }

    function resetSubmitButton(button, originalHTML) {
        button.disabled = false;
        button.innerHTML = originalHTML;
        button.style.opacity = '1';
    }

    function addRealTimeValidation(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
    }

    function validateField(field) {
        if (!field.hasAttribute('required') || field.value.trim()) return;
        showFieldError(field, "This field is required");
    }

    function addAutoResizeTextarea() {
        const textarea = document.querySelector('textarea[name="query"]');
        if (!textarea) return;

        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 300) + 'px';
        });
    }

    // ===============================================
    // ENHANCED HERO SECTION INTERACTIONS
    // ===============================================
    
    function initHeroInteractions() {
        const heroSection = document.querySelector('.career-hero');
        if (!heroSection) return;

        // Parallax effect on scroll
        window.addEventListener('scroll', debounce(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }, 10));

        // Add interactive particles (optional enhancement)
        createHeroParticles();
    }

    function createHeroParticles() {
        const heroSection = document.querySelector('.career-hero');
        if (!heroSection || window.innerWidth < 768) return; // Skip on mobile

        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 2}s;
            `;
            heroSection.appendChild(particle);
            particles.push(particle);
        }

        // Clean up particles on page unload
        window.addEventListener('beforeunload', () => {
            particles.forEach(particle => particle.remove());
        });
    }

    // ===============================================
    // ENHANCED LOADING STATES
    // ===============================================
    
    function initLoadingStates() {
        // Smooth page load transition
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });

        // Lazy load images
        const images = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.3s ease';
                        
                        img.onload = () => {
                            img.style.opacity = '1';
                        };
                        
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // ===============================================
    // ENHANCED ACCESSIBILITY
    // ===============================================
    
    function initAccessibility() {
        // Add skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 9999;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content ID
        const mainContent = document.querySelector('main') || document.querySelector('.section');
        if (mainContent) {
            mainContent.id = 'main-content';
        }

        // Enhance keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or dropdowns
                const activeElement = document.activeElement;
                if (activeElement && activeElement.blur) {
                    activeElement.blur();
                }
            }
        });
    }

    // ===============================================
    // INITIALIZATION
    // ===============================================
    
    // Set minimum date for session booking
    function setMinimumDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const sessionDateInput = document.getElementById("sessionDate");
        if (sessionDateInput) {
            sessionDateInput.setAttribute("min", tomorrow.toISOString().split("T")[0]);
        }
    }

    // Handle smooth scrolling for anchor links
    function initSmoothScrolling() {
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

    // Performance monitoring
    function initPerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.timing;
                const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
            });
        }
    }

    // ===============================================
    // MAIN INITIALIZATION
    // ===============================================
    
    try {
        // Initialize core functionality
        setMinimumDate();
        initLoadingStates();
        initAccessibility();
        initSmoothScrolling();
        initPerformanceMonitoring();
        
        // Initialize enhanced features
        initScrollRevealAnimations();
        initHeroInteractions();
        initFormHandling();
        
        // Load dynamic content
        await Promise.allSettled([
            loadSuccessStories(),
            loadCareerStats()
        ]);
        
        // Mark page as loaded
        document.body.classList.add('page-loaded');
        
        console.log('Career Guidance page initialized successfully');
        
    } catch (error) {
        console.error('Error initializing Career Guidance page:', error);
    }
});

// ===============================================
// GLOBAL UTILITY FUNCTIONS
// ===============================================

// Expose utility functions globally for external use
window.CareerGuidanceUtils = {
    smoothScrollTo: (element, duration) => {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (target) {
            // Import smooth scroll logic
            const targetPosition = target.offsetTop - 100;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                
                const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 
                    (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
                
                window.scrollTo(0, startPosition + distance * easedProgress);
                
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            requestAnimationFrame(animation);
        }
    }
};