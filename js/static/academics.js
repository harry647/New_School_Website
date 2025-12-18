// ==================================================
// ACADEMICS PAGE – ULTRA-PREMIUM INTERACTIVE EDITION
// Bar Union Mixed Secondary School 2025-2026
// Enhanced Animations, Micro-interactions & Performance
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. KCSE RESULTS – CINEMATIC COUNTER ANIMATION
    // Enhanced with glow effects and smooth transitions
    // ========================================
    const counters = document.querySelectorAll('.stat.counter');

    if (counters.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const h3 = counter.querySelector('h3');
                    const target = parseFloat(counter.getAttribute('data-target'));
                    const isPercentage = counter.querySelector('p').textContent.toLowerCase().includes('rate') ||
                                        counter.querySelector('p').textContent.includes('%');
                    const isDecimal = target % 1 !== 0;

                    let start = 0;
                    const duration = 2800; // Enhanced duration for smoother animation
                    const increment = target / (duration / 16);

                    const timer = setInterval(() => {
                        start += increment;

                        if (start >= target) {
                            // Final exact value with celebration
                            if (isPercentage) {
                                h3.textContent = target + '%';
                            } else if (isDecimal) {
                                h3.textContent = target.toFixed(2);
                            } else {
                                h3.textContent = Math.floor(target);
                            }
                            
                            counter.classList.add('animated');
                            counter.classList.add('celebration');
                            
                            // Add glow effect when animation completes
                            setTimeout(() => {
                                h3.style.animation = 'celebrationGlow 2s ease-in-out';
                            }, 500);
                            
                            clearInterval(timer);
                        } else {
                            // Running value with smooth easing
                            const current = isDecimal ? start.toFixed(2) : Math.floor(start);
                            h3.textContent = isPercentage ? current + '%' : current;
                        }
                    }, 16);

                    observer.unobserve(counter); // Run once
                }
            });
        }, { threshold: 0.3, rootMargin: "0px 0px -50px 0px" });

        counters.forEach(counter => {
            const h3 = counter.querySelector('h3');
            const original = h3.textContent.trim();

            // Initialize with enhanced styling
            counter.style.opacity = '0.7';
            counter.style.transform = 'translateY(20px) scale(0.95)';
            
            if (original.includes('%')) {
                h3.textContent = '0%';
            } else if (original.includes('.')) {
                h3.textContent = '0.00';
            } else {
                h3.textContent = '0';
            }

            observer.observe(counter);
        });
    }

    // ========================================
    // 2. ENHANCED SMOOTH SCROLL FOR ANCHOR LINKS
    // With progress indicator and enhanced UX
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Add loading state
                this.classList.add('loading');
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Remove loading state after scroll
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
                
                history.pushState(null, null, href);
            }
        });
    });

    // ========================================
    // 3. ENHANCED SCROLL REveal ANIMATIONS
    // With staggered animations and enhanced effects
    // ========================================
    const revealElements = document.querySelectorAll(`
        .info-card,
        .dept-card,
        .resource-card,
        .calendar-item,
        .stat,
        .section-title,
        .section-intro,
        .subsection-title
    `);

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('reveal');
                    entry.target.style.animationDelay = `${index * 100}ms`;
                }, index * 100);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: "0px 0px -10% 0px"
    });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(60px) scale(0.95)';
        el.style.transition = 'all 0.8s cubic-bezier(0.23,1,.32,1)';
        revealObserver.observe(el);
    });

    // ========================================
    // 4. ENHANCED HOVER EFFECTS FOR CARDS
    // With magnetic effects and particle animations
    // ========================================
    function createParticleEffect(element) {
        const rect = element.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = 'particle-effect';
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, var(--accent-gold), var(--primary-blue));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: particleFloat 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }

    // Add particle animation keyframes
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: scale(0) rotate(0deg);
            }
            50% {
                opacity: 0.8;
                transform: scale(1) rotate(180deg);
            }
            100% {
                opacity: 0;
                transform: scale(0) rotate(360deg) translateY(-50px);
            }
        }
        
        @keyframes celebrationGlow {
            0%, 100% { 
                text-shadow: 0 10px 30px rgba(247, 183, 49, 0.6);
            }
            50% { 
                text-shadow: 0 15px 50px rgba(247, 183, 49, 0.9), 0 0 20px rgba(247, 183, 49, 0.6);
            }
        }
        
        .celebration {
            animation: celebrationPulse 2s ease-in-out;
        }
        
        @keyframes celebrationPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .magnetic-effect {
            transition: transform 0.3s cubic-bezier(0.23,1,.32,1);
        }
    `;
    document.head.appendChild(particleStyle);

    document.querySelectorAll('.dept-card, .resource-card, .info-card').forEach(card => {
        // Magnetic effect
        card.addEventListener('mouseenter', (e) => {
            card.classList.add('magnetic-effect');
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px) scale(1.05)`;
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.03)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
        });
        
        // Particle effect on click
        card.addEventListener('click', () => {
            createParticleEffect(card);
        });
    });

    // ========================================
    // 5. SCROLL PROGRESS INDICATOR
    // Shows reading progress for the page
    // ========================================
    const createScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-blue), var(--accent-gold));
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    };
    createScrollProgress();

    // ========================================
    // 6. TYPING EFFECT FOR HERO SECTION
    // Enhanced typewriter effect for the main tagline
    // ========================================
    const createTypingEffect = () => {
        const heroText = document.querySelector('.page-hero.academics-hero p');
        if (heroText) {
            const text = heroText.textContent;
            heroText.textContent = '';
            heroText.style.borderRight = '2px solid var(--accent-gold)';
            heroText.style.animation = 'blink 1s infinite';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    heroText.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 30);
                } else {
                    // Remove cursor after typing is complete
                    setTimeout(() => {
                        heroText.style.borderRight = 'none';
                        heroText.style.animation = 'none';
                    }, 1000);
                }
            };
            
            // Start typing effect after a delay
            setTimeout(typeWriter, 1000);
        }
    };

    // ========================================
    // 7. FLOATING ACTION BUTTON
    // For quick navigation back to top
    // ========================================
    const createFloatingButton = () => {
        const fab = document.createElement('button');
        fab.className = 'fab-back-to-top';
        fab.innerHTML = '<i class="fas fa-arrow-up"></i>';
        fab.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            transition: all 0.3s ease;
            opacity: 0;
            visibility: hidden;
            z-index: 1000;
        `;
        
        document.body.appendChild(fab);
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                fab.style.opacity = '1';
                fab.style.visibility = 'visible';
                fab.style.transform = 'translateY(0)';
            } else {
                fab.style.opacity = '0';
                fab.style.visibility = 'hidden';
                fab.style.transform = 'translateY(20px)';
            }
        });
        
        // Scroll to top on click
        fab.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Hover effects
        fab.addEventListener('mouseenter', () => {
            fab.style.transform = 'translateY(-5px) scale(1.1)';
            fab.style.boxShadow = 'var(--shadow-2xl)';
        });
        
        fab.addEventListener('mouseleave', () => {
            fab.style.transform = 'translateY(0) scale(1)';
            fab.style.boxShadow = 'var(--shadow-lg)';
        });
    };
    createFloatingButton();

    // ========================================
    // 8. PARALLAX EFFECTS
    // Subtle parallax for background elements
    // ========================================
    const initParallax = () => {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.page-hero.academics-hero');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    };

    // ========================================
    // 9. ENHANCED LOADING ANIMATIONS
    // Page entrance animations
    // ========================================
    const initPageAnimations = () => {
        // Hero section slide-up animation
        const hero = document.querySelector('.page-hero.academics-hero');
        if (hero) {
            hero.style.opacity = '0';
            hero.style.transform = 'translateY(100px)';
            
            setTimeout(() => {
                hero.style.transition = 'all 1.2s cubic-bezier(0.23,1,.32,1)';
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            }, 100);
        }
        
        // Trigger typing effect after hero loads
        setTimeout(createTypingEffect, 2000);
    };

    // ========================================
    // 10. PERFORMANCE OPTIMIZATIONS
    // Throttled scroll events and lazy loading
    // ========================================
    const throttle = (func, limit) => {
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
    };

    // Apply throttling to scroll events
    const throttledScroll = throttle(() => {
        // Any heavy scroll operations can be placed here
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScroll);

    // ========================================
    // 11. ACCESSIBILITY ENHANCEMENTS
    // Reduced motion and keyboard navigation
    // ========================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Disable animations for users who prefer reduced motion
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // ========================================
    // 12. ENHANCED CURSOR EFFECTS
    // Custom cursor that follows mouse movement
    // ========================================
    const createCustomCursor = () => {
        if (window.innerWidth > 768) { // Only on desktop
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, var(--accent-gold), var(--primary-blue));
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
                mix-blend-mode: difference;
            `;
            document.body.appendChild(cursor);

            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX - 10 + 'px';
                cursor.style.top = e.clientY - 10 + 'px';
            });

            // Scale cursor on hover
            document.querySelectorAll('a, button, .dept-card, .resource-card').forEach(element => {
                element.addEventListener('mouseenter', () => {
                    cursor.style.transform = 'scale(2)';
                });
                element.addEventListener('mouseleave', () => {
                    cursor.style.transform = 'scale(1)';
                });
            });
        }
    };
    createCustomCursor();

    // Initialize all effects
    initParallax();
    initPageAnimations();

    // ========================================
    // CONSOLE WELCOME MESSAGE
    // ========================================
    console.log(
        "%c🎓 ACADEMICS PAGE – ULTRA-PREMIUM EDITION 🎓\n%cAll sections enhanced with stunning animations and micro-interactions!\n%cBuilt with ❤️ for Bar Union Mixed Secondary School",
        "color: #0F4C75; font-size: 24px; font-weight: bold; padding: 20px; background: linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius: 12px; margin-bottom: 10px;",
        "color: #3282B8; font-size: 16px; font-weight: 600; padding: 10px;",
        "color: #F7B731; font-size: 14px; font-style: italic;"
    );

    // ========================================
    // PERFORMANCE MONITORING
    // ========================================
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
                console.log(`⚡ Page loaded in ${loadTime}ms`);
            }, 0);
        });
    }
});

// ========================================
// ADDITIONAL CSS ANIMATIONS VIA JAVASCRIPT
// ========================================
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Enhanced scroll animations */
    .reveal {
        opacity: 1 !important;
        transform: translateY(0) scale(1) !important;
    }
    
    /* Keyboard navigation focus styles */
    .keyboard-navigation *:focus {
        outline: 3px solid var(--accent-gold) !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
    }
    
    /* Button loading states */
    .btn.loading {
        position: relative;
        pointer-events: none;
        opacity: 0.7;
    }
    
    .btn.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Enhanced focus states */
    .btn:focus,
    .dept-card:focus {
        outline: 3px solid var(--accent-gold);
        outline-offset: 2px;
       (-2px);
    }
    
    /* Scroll transform: translateY progress bar */
    .scroll-progress {
        box-shadow: 0 0 10px rgba(15, 76, 117, 0.5);
    }
`;

document.head.appendChild(additionalStyles);