/**
 * =================================================
 * BAR UNION MIXED SECONDARY SCHOOL - ABOUT PAGE
 * Enhanced JavaScript with Advanced Interactions
 * Professional animations, smooth scrolling, and optimal performance
 * =================================================
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================
    // UTILITY FUNCTIONS
    // =================================================
    
    /**
     * Debounce function to limit the rate of function execution
     */
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
    /**
     * Throttle function to limit function calls to once per time interval
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element) {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // =================================================
    // ENHANCED ANIMATED COUNTERS
    // =================================================
    
    class AnimatedCounter {
        constructor(element, target, duration = 2000) {
            this.element = element;
            this.target = parseInt(target);
            this.duration = duration;
            this.current = 0;
            this.startTime = null;
            this.easing = this.easeOutCubic;
            this.isAnimating = false;
            
            // Validate element exists
            if (!this.element) {
                console.warn('AnimatedCounter: No element provided');
                return;
            }
        }
        
        easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }
        
        animate() {
            if (this.isAnimating || !this.element) return;
            this.isAnimating = true;
            this.startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - this.startTime;
                const progress = Math.min(elapsed / this.duration, 1);
                const easedProgress = this.easing(progress);
                
                this.current = Math.floor(easedProgress * this.target);
                this.updateDisplay();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    this.isAnimating = false;
                    this.current = this.target;
                    this.updateDisplay();
                }
            };
            
            requestAnimationFrame(updateCounter);
        }
        
        updateDisplay() {
            if (this.element) {
                if (this.target >= 1000) {
                    this.element.textContent = this.current.toLocaleString() + '+';
                } else {
                    this.element.textContent = this.current.toLocaleString();
                }
            }
        }
    }
    
    /**
     * Initialize animated counters with enhanced effects
     */
    function initAnimatedCounters() {
        const counters = document.querySelectorAll('.counter');
        const counterInstances = [];
        
        // Check if any counter elements exist
        if (counters.length === 0) {
            console.log('No counter elements found, skipping counter initialization');
            return;
        }
        
        counters.forEach(counter => {
            const target = counter.getAttribute('data-target');
            // Use the counter element directly, not a child h3
            const counterInstance = new AnimatedCounter(
                counter,
                target,
                2500
            );
            counterInstances.push(counterInstance);
        });
        
        // Create observer for counter animation
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = counterObserver.targets.indexOf(entry.target);
                    if (index !== -1 && !counterInstances[index].isAnimating) {
                        counterInstances[index].animate();
                    }
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Initialize targets array
        counterObserver.targets = [];
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
            counterObserver.targets.push(counter);
        });
    }
    
    // =================================================
    // ENHANCED CHART INTEGRATION
    // =================================================
    
    class GrowthChart {
        constructor(canvasId, data) {
            this.canvas = document.getElementById(canvasId);
            this.data = data;
            this.chart = null;
            this.init();
        }
        
        init() {
            if (!this.canvas || typeof Chart === 'undefined') return;
            
            const ctx = this.canvas.getContext('2d');
            
            const config = {
                type: 'bar',
                data: this.data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 14,
                                    weight: '600'
                                },
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Bar Union Mixed Secondary School: Growth Since 1983',
                            font: {
                                family: "'Playfair Display', serif",
                                size: 18,
                                weight: 'bold'
                            },
                            color: '#0b2d5e',
                            padding: {
                                top: 20,
                                bottom: 30
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(11, 45, 94, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#0175C2',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.x.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 13,
                                    weight: '500'
                                },
                                color: '#64748b'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 13,
                                    weight: '500'
                                },
                                color: '#64748b'
                            }
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'easeOutQuart',
                        delay: function(context) {
                            return context.dataIndex * 300;
                        }
                    }
                }
            };
            
            this.chart = new Chart(ctx, config);
            
            // Animate chart when it comes into view
            const chartObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && this.chart) {
                        this.chart.update('active');
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            chartObserver.observe(this.canvas);
        }
    }
    
    /**
     * Initialize growth chart
     */
    function initGrowthChart() {
        const chartData = {
            labels: ['1984', '2001', '2010', '2025 (Current)', '2026 (Projected)'],
            datasets: [
                {
                    label: 'Student Enrollment',
                    data: [50, 320, 480, 953, 1000],
                    backgroundColor: 'rgba(11, 45, 94, 0.85)',
                    borderColor: '#0b2d5e',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: '#0175C2',
                    hoverBorderWidth: 3
                },
                {
                    label: 'Teaching Staff (TSC + BOM)',
                    data: [8, 18, 28, 41, 50],
                    backgroundColor: 'rgba(1, 117, 194, 0.85)',
                    borderColor: '#0175C2',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: '#0175C2',
                    hoverBorderWidth: 3
                }
            ]
        };
        
        new GrowthChart('growthChart', chartData);
    }
    
    // =================================================
    // INTERSECTION OBSERVER ANIMATIONS
    // =================================================
    
    class ScrollAnimations {
        constructor() {
            this.observers = new Map();
            this.init();
        }
        
        init() {
            this.createObserver('fadeInUp', this.fadeInUpAnimation);
            this.createObserver('fadeInLeft', this.fadeInLeftAnimation);
            this.createObserver('fadeInRight', this.fadeInRightAnimation);
            this.createObserver('scaleIn', this.scaleInAnimation);
            this.createObserver('slideInBottom', this.slideInBottomAnimation);
        }
        
        createObserver(name, animationFunction) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animationFunction(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            this.observers.set(name, observer);
        }
        
        fadeInUpAnimation(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
        
        fadeInLeftAnimation(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(-30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            });
        }
        
        fadeInRightAnimation(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            });
        }
        
        scaleInAnimation(element) {
            element.style.opacity = '0';
            element.style.transform = 'scale(0.9)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
            });
        }
        
        slideInBottomAnimation(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
        
        observe(element, animationType) {
            const observer = this.observers.get(animationType);
            if (observer) {
                observer.observe(element);
            }
        }
    }
    
    // =================================================
    // VISION/MISSION CARDS ENHANCEMENT
    // =================================================
    
    function enhanceVisionMissionCards() {
        const vmCards = document.querySelectorAll('.vm-card');
        const scrollAnimations = new ScrollAnimations();
        
        vmCards.forEach((card, index) => {
            // Add stagger animation
            card.style.animationDelay = `${index * 150}ms`;
            scrollAnimations.observe(card, 'fadeInUp');
            
            // Add enhanced hover effects
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-12px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // =================================================
    // CORE VALUES CARDS ENHANCEMENT
    // =================================================
    
    function enhanceValueCards() {
        const valueCards = document.querySelectorAll('.value-card');
        const scrollAnimations = new ScrollAnimations();
        
        valueCards.forEach((card, index) => {
            // Add stagger animation
            card.style.animationDelay = `${index * 100}ms`;
            scrollAnimations.observe(card, 'fadeInUp');
            
            // Add enhanced interactive effects
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'translateY(-10px) rotate(10deg) scale(1.2)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                }
            });
        });
    }
    
    // =================================================
    // PRINCIPAL MESSAGE ENHANCEMENT
    // =================================================
    
    function enhancePrincipalMessage() {
        const blockquotes = document.querySelectorAll('.message-content blockquote');
        const timelineItems = document.querySelectorAll('.principal-timeline li');
        const principalPhoto = document.querySelector('.principal-photo img');
        const scrollAnimations = new ScrollAnimations();
        
        // Animate blockquotes
        blockquotes.forEach((blockquote, index) => {
            blockquote.style.animationDelay = `${index * 300}ms`;
            scrollAnimations.observe(blockquote, 'fadeInLeft');
        });
        
        // Animate timeline items
        timelineItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 200}ms`;
            scrollAnimations.observe(item, 'fadeInRight');
        });
        
        // Animate principal photo
        if (principalPhoto) {
            scrollAnimations.observe(principalPhoto, 'scaleIn');
        }
        
        // Add signature animation
        const signature = document.querySelector('.signature');
        if (signature) {
            scrollAnimations.observe(signature, 'slideInBottom');
        }
    }
    
    // =================================================
    // PARALLAX EFFECTS
    // =================================================
    
    class ParallaxEffect {
        constructor() {
            this.elements = document.querySelectorAll('.about-image, .page-hero');
            this.init();
        }
        
        init() {
            if (this.elements.length === 0) return;
            
            window.addEventListener('scroll', throttle(() => {
                this.updateParallax();
            }, 16)); // ~60fps
        }
        
        updateParallax() {
            const scrollTop = window.pageYOffset;
            
            this.elements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const rect = element.getBoundingClientRect();
                
                if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                    const yPos = -(scrollTop * speed);
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            });
        }
    }
    
    // =================================================
    // ENHANCED STATS SECTION
    // =================================================
    
    function enhanceStatsSection() {
        const statsContainer = document.querySelector('.stats');
        if (!statsContainer) return;
        
        const scrollAnimations = new ScrollAnimations();
        const stats = document.querySelectorAll('.stat');
        
        stats.forEach((stat, index) => {
            stat.style.animationDelay = `${index * 150}ms`;
            scrollAnimations.observe(stat, 'scaleIn');
            
            // Add enhanced hover effects
            stat.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.05)';
                const h3 = this.querySelector('h3');
                if (h3) {
                    h3.style.transform = 'scale(1.1)';
                }
            });
            
            stat.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                const h3 = this.querySelector('h3');
                if (h3) {
                    h3.style.transform = 'scale(1)';
                }
            });
        });
    }
    
    // =================================================
    // TIMELINE ENHANCEMENT
    // =================================================
    
    function enhanceTimeline() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        
        const timelineItems = document.querySelectorAll('.timeline li');
        const scrollAnimations = new ScrollAnimations();
        
        timelineItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 200}ms`;
            scrollAnimations.observe(item, 'fadeInLeft');
            
            // Add hover effects to timeline items
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px)';
                const marker = this.querySelector('::before');
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0)';
            });
        });
    }
    
    // =================================================
    // SMOOTH SCROLL NAVIGATION
    // =================================================
    
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    smoothScrollTo(targetElement);
                }
            });
        });
    }
    
    // =================================================
    // PERFORMANCE OPTIMIZATIONS
    // =================================================
    
    function optimizePerformance() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Preload critical resources
        const criticalImages = [
            '/assets/images/common/hero-about.jpg',
            '/assets/images/common/about-history1.png',
            '/assets/images/admin/principal.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    // =================================================
    // ACCESSIBILITY ENHANCEMENTS
    // =================================================
    
    function enhanceAccessibility() {
        // Add skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #0175C2;
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', function() {
            this.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content ID
        const mainContent = document.querySelector('.about-grid');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // Enhance focus management
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.style.outline = '2px solid #0175C2';
                this.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }
    
    // =================================================
    // INITIALIZATION
    // =================================================
    
    function init() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            // Initialize all enhanced features
            initAnimatedCounters();
            initGrowthChart();
            enhanceVisionMissionCards();
            enhanceValueCards();
            enhancePrincipalMessage();
            enhanceStatsSection();
            enhanceTimeline();
            new ParallaxEffect();
        }
        
        // Always initialize these features
        initSmoothScroll();
        optimizePerformance();
        enhanceAccessibility();
        
        // Add loading animation
        document.body.classList.add('loaded');
        
        console.log('About page enhancements initialized successfully!');
    }
    
    // Initialize when DOM is ready
    init();
    
    // Handle window resize for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        // Recalculate any size-dependent features
        console.log('Window resized - recalculating layouts');
    }, 250));
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Resume animations when page becomes visible
            console.log('Page visible - resuming animations');
        }
    });
    
});