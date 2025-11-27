// ../js/animations.js
// Smooth Scroll Reveal Animations – Performance & Dynamic Ready

document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
    };

    const animateElements = document.querySelectorAll(`
        .fade-in,
        .animate-pop,
        .slide-left,
        .slide-right,
        .reveal,
        .house-card,
        .activity-card,
        .sport-item,
        .event-month
    `);

    // Intersection Observer for scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");

                // Apply staggered delay for grid items
                const delayAttr = entry.target.dataset.delay;
                if (delayAttr) {
                    entry.target.style.transitionDelay = delayAttr;
                }

                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach((el, index) => {
        // Add optional staggered delay (0.05s per element)
        el.dataset.delay = `${index * 0.05}s`;
        observer.observe(el);
    });

    // Hero section animations (force on load)
    const heroElements = document.querySelectorAll(".page-hero .animate-pop, .page-hero .animate-fade, .page-hero .btn");
    heroElements.forEach(el => {
        const delay = el.dataset.delay || "0.3s";
        el.style.transitionDelay = delay;
        setTimeout(() => {
            el.classList.add("show");
        }, parseFloat(delay) * 1000);
    });

    // Optional: animate event timeline sequentially
    const events = document.querySelectorAll(".event-month");
    events.forEach((eventEl, i) => {
        eventEl.style.transitionDelay = `${i * 0.15}s`;
    });

    // Optional: fade-in for sections already in viewport on load
    const sections = document.querySelectorAll(".section");
    sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            sec.querySelectorAll(".fade-in, .reveal, .slide-left, .slide-right").forEach(el => {
                el.classList.add("show");
            });
        }
    });
});
