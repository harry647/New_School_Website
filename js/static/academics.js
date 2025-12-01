// ==================================================
// ACADEMICS PAGE – FINAL 2025+ SCRIPT
// Animated KCSE Results + Smooth Scroll + All Sections Perfect
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================
    // 1. KCSE RESULTS – CINEMATIC COUNTER ANIMATION
    // Works perfectly with your HTML (4.96 mean score + percentages)
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
                    const duration = 2400; // Smooth 2.4s animation
                    const increment = target / (duration / 16);

                    const timer = setInterval(() => {
                        start += increment;

                        if (start >= target) {
                            // Final exact value
                            if (isPercentage) {
                                h3.textContent = target + '%';
                            } else if (isDecimal) {
                                h3.textContent = target.toFixed(2);
                            } else {
                                h3.textContent = Math.floor(target);
                            }
                            counter.classList.add('animated');
                            clearInterval(timer);
                        } else {
                            // Running value
                            const current = isDecimal ? start.toFixed(2) : Math.floor(start);
                            h3.textContent = isPercentage ? current + '%' : current;
                        }
                    }, 16);

                    observer.unobserve(counter); // Run once
                }
            });
        }, { threshold: 0.5, rootMargin: "0px 0px -100px 0px" });

        counters.forEach(counter => {
            const h3 = counter.querySelector('h3');
            const original = h3.textContent.trim();

            // Initialize with 0
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
    // 2. SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, href);
            }
        });
    });

    // ========================================
    // 3. SCROLL REVEAL ANIMATIONS (All Cards)
    // ========================================
    const revealElements = document.querySelectorAll(`
        .info-card,
        .dept-card,
        .resource-card,
        .calendar-item,
        .stat
    `);

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Inject reveal animation
    const style = document.createElement('style');
    style.textContent = `
        .info-card,
        .dept-card,
        .resource-card,
        .calendar-item,
        .stat {
            opacity: 0;
            transform: translateY(60px);
            transition: all 1.2s cubic-bezier(0.23,1,.32,1);
        }
        .reveal {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        .stat.animated h3 {
            animation: glowPulse 3s ease-in-out infinite alternate;
        }
        @keyframes glowPulse {
            from { text-shadow: 0 10px 30px rgba(251,191,36,0.6); }
            to { text-shadow: 0 15px 50px rgba(251,191,36,0.9), 0 0 0 80px rgba(251,191,36,0.6); }
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // 4. HOVER EFFECTS FOR CARDS
    // ========================================
    document.querySelectorAll('.dept-card, .resource-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-20px) scale(1.05)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    console.log("%cACADEMICS PAGE: All Sections Animated & Perfect!", "color:#7c3aed;font-size:20px;font-weight:bold;background:#1e293b;padding:15px;border-radius:12px;");
});