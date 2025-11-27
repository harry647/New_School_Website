// about.js – FINAL 2025 VERSION (Vision/Mission FIXED + Everything Perfect)
document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 1. Animated Counters – Accurate & Smooth
    // =============================================
    const animateCounters = () => {
        document.querySelectorAll('.counter').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const display = counter.querySelector('h3');
            let current = 0;
            const increment = target / 180;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    if (target === 41) display.textContent = "41";
                    else if (target === 953) display.textContent = "953";
                    else if (target === 1000) display.textContent = "1000+";
                    else if (target === 7) display.textContent = "7";
                } else {
                    const value = Math.floor(current);
                    display.textContent = value.toLocaleString() + (target >= 1000 ? '+' : '');
                }
            }, 15);
        });
    };

    // =============================================
    // 2. Growth Chart – Beautiful Horizontal Bar
    // =============================================
    const initGrowthChart = () => {
        const canvas = document.getElementById('growthChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1984', '2001', '2010', '2025 (Current)', '2026 (Proj.)'],
                datasets: [
                    {
                        label: 'Student Enrollment',
                        data: [50, 320, 480, 953, 1000],
                        backgroundColor: 'rgba(30, 58, 138, 0.92)',
                        borderColor: '#1e3a8a',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    },
                    {
                        label: 'Teaching Staff (TSC + BOM)',
                        data: [8, 18, 28, 41, 50],
                        backgroundColor: 'rgba(59, 130, 246, 0.85)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 2800, easing: 'easeOutQuart' },
                plugins: {
                    legend: { position: 'top', labels: { font: { size: 15, family: 'Inter' }, padding: 20 } },
                    title: {
                        display: true,
                        text: 'Bar Union Mixed Secondary School: Growth Since 1983',
                        font: { size: 20, weight: 'bold', family: "'Playfair Display', serif" },
                        color: '#1e293b',
                        padding: { top: 10, bottom: 30 }
                    }
                },
                scales: {
                    x: { beginAtZero: true, grid: { display: false }, ticks: { font: { size: 14 } } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 14, weight: 500 } } }
                }
            }
        });
    };

    // =============================================
    // 3. Vision/Mission Cards – FIXED & ALWAYS VISIBLE
    // =============================================
    const vmObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.vm-card').forEach((card, index) => {
        // CRITICAL FIX: Don't force opacity=0 via JS → let CSS handle initial state only
        // This ensures cards are visible even if JS is slow/blocked
        card.style.transition = `all 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${index * 150}ms`;
        vmObserver.observe(card);
    });

    // =============================================
    // 4. Principal Section – Elegant Sequential Animation
    // =============================================
    const principalGrid = document.querySelector('.principal-message-grid');
    if (principalGrid) {
        const principalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Blockquotes
                    document.querySelectorAll('.message-content blockquote').forEach((bq, i) => {
                        setTimeout(() => {
                            bq.style.opacity = '1';
                            bq.style.transform = 'translateY(0)';
                        }, i * 350);
                    });

                    // Timeline items
                    document.querySelectorAll('.principal-timeline li, .principal-sidebar .principal-timeline li').forEach((li, i) => {
                        setTimeout(() => {
                            li.style.opacity = '1';
                            li.style.transform = 'translateX(0)';
                        }, i * 300);
                    });

                    // Principal photo
                    const photo = document.querySelector('.principal-photo img');
                    if (photo) {
                        setTimeout(() => {
                            photo.style.opacity = '1';
                            photo.style.transform = 'scale(1)';
                        }, 500);
                    }

                    principalObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        principalObserver.observe(principalGrid);

        // Initial states (only applied once)
        document.querySelectorAll('.message-content blockquote').forEach(bq => {
            bq.style.opacity = '0';
            bq.style.transform = 'translateY(30px)';
            bq.style.transition = 'all 0.9s ease';
        });

        document.querySelectorAll('.principal-timeline li, .principal-sidebar .principal-timeline li').forEach(li => {
            li.style.opacity = '0';
            li.style.transform = 'translateX(-30px)';
            li.style.transition = 'all 0.8s ease';
        });

        const photo = document.querySelector('.principal-photo img');
        if (photo) {
            photo.style.opacity = '0';
            photo.style.transform = 'scale(0.95)';
            photo.style.transition = 'all 1.2s ease';
        }
    }

    // =============================================
    // 5. Trigger Counters + Chart on Scroll
    // =============================================
    const historySection = document.querySelector('.about-grid');
    if (historySection) {
        const trigger = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    initGrowthChart();
                    trigger.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        trigger.observe(historySection);
    }
});