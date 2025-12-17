// /js/static/academics.js - Enhanced with Interactive Department Tabs

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Animate KCSE Stats Counters */
    const statNumbers = document.querySelectorAll('.results-stats-grid .stat-number');

    const animateValue = (element, endValue, duration = 2000) => {
        const isPercentage = endValue.includes('%');
        const target = parseFloat(endValue);

        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = isPercentage ? target + '%' : target.toFixed(2);
                clearInterval(timer);
            } else {
                element.textContent = isPercentage ? Math.floor(start) + '%' : Math.floor(start);
            }
        }, 16);
    };

    const resultsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(stat => {
                    const value = stat.textContent.trim();
                    animateValue(stat, value);
                });
                resultsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) resultsObserver.observe(resultsSection);

    /* 2. Interactive Department Tabs */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.dept-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetDept = button.getAttribute('data-dept');

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active panel
            tabPanels.forEach(panel => {
                if (panel.id === targetDept) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });

    /* 3. Fade out hero scroll indicator */
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 400);
            scrollIndicator.style.opacity = opacity;
        });
    }

    /* 4. Hover lift for other cards */
    const hoverCards = document.querySelectorAll('.pathway-card, .movement-card, .feature-card, .term-card, .resource-card');
    hoverCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    /* 5. Staggered reveal for calendar terms */
    const termCards = document.querySelectorAll('.term-card');
    const calendarObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
                calendarObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    termCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        calendarObserver.observe(card);
    });

});