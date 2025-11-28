// ../js/index.js
// Ultimate Interactive Homepage – Bar Union Mixed Secondary School (2026+)

document.addEventListener("DOMContentLoaded", () => {
    // ========================================
    // 1. Preloader – Smooth Fade Out
    // ========================================
    const preloader = document.getElementById("preloader");
    window.addEventListener("load", () => {
        setTimeout(() => {
            preloader.style.opacity = "0";
            setTimeout(() => preloader.remove(), 600);
        }, 500);
    });

    // ========================================
    // 2. HTML Includes (Header & Footer)
    // ========================================
    const includeHTML = () => {
        document.querySelectorAll("[w3-include-html]").forEach(el => {
            const file = el.getAttribute("w3-include-html");
            if (!file) return;

            fetch(file)
                .then(res => res.ok ? res.text() : Promise.reject())
                .then(html => {
                    el.innerHTML = html;
                    el.removeAttribute("w3-include-html");

                    // Re-initialize everything after include
                    initMobileMenu();
                    highlightCurrentNav();
                    initDarkMode();
                })
                .catch(() => {
                    el.innerHTML = "<p style='color:red;'>Failed to load content.</p>";
                });
        });
    };

    // ========================================
    // 3. Mobile Menu Toggle
    // ========================================
    const initMobileMenu = () => {
        const burger = document.querySelector(".burger, .mobile-toggle");
        const nav = document.querySelector(".nav-links, nav ul");
        if (!burger || !nav) return;

        const overlay = document.createElement("div");
        overlay.className = "nav-overlay";
        document.body.appendChild(overlay);

        const toggleMenu = () => {
            nav.classList.toggle("nav-active");
            burger.classList.toggle("toggle");
            overlay.classList.toggle("active");
            document.body.style.overflow = nav.classList.contains("nav-active") ? "hidden" : "";
        };

        burger.addEventListener("click", toggleMenu);
        overlay.addEventListener("click", toggleMenu);

        document.querySelectorAll(".nav-links a, nav ul a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("nav-active");
                burger.classList.remove("toggle");
                overlay.classList.remove("active");
                document.body.style.overflow = "";
            });
        });
    };

    // ========================================
    // 4. Highlight Current Navigation Link
    // ========================================
    const highlightCurrentNav = () => {
        const current = location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll("nav a").forEach(link => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === current || (current === "" && href === "index.html"));
        });
    };

    // ========================================
    // 5. Dark Mode Toggle (Optional – if you have button)
    // ========================================
    const initDarkMode = () => {
        const toggle = document.querySelector(".dark-mode-toggle");
        if (!toggle) return;

        const isDark = localStorage.getItem("darkMode") === "enabled";
        if (isDark) document.body.classList.add("dark-mode");

        toggle.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        toggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const nowDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", nowDark ? "enabled" : "disabled");
            toggle.innerHTML = nowDark
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        });
    };

    // ========================================
    // 6. Back to Top Button (Uses Existing HTML Button)
    // ========================================
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 500);
        });
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ========================================
    // 7. Testimonial Auto-Slider
    // ========================================
    const testimonials = document.querySelectorAll(".testimonial-card");
    if (testimonials.length > 0) {
        let current = 0;
        const showTestimonial = (i) => {
            testimonials.forEach((t, idx) => t.classList.toggle("active", idx === i));
        };

        document.querySelector(".testimonial-nav .next")?.addEventListener("click", () => {
            current = (current + 1) % testimonials.length;
            showTestimonial(current);
        });
        document.querySelector(".testimonial-nav .prev")?.addEventListener("click", () => {
            current = (current - 1 + testimonials.length) % testimonials.length;
            showTestimonial(current);
        });

        // Auto-play every 7 seconds
        setInterval(() => {
            current = (current + 1) % testimonials.length;
            showTestimonial(current);
        }, 7000);
    }

    // ========================================
    // 8. Animated Counters (About Section)
    // ========================================
    const animateCounters = () => {
        document.querySelectorAll(".counter").forEach(counter => {
            const target = +counter.getAttribute("data-target");
            let count = 0;
            const increment = target / 120;

            const update = () => {
                count += increment;
                if (count < target) {
                    counter.textContent = Math.ceil(count).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString() + (target > 1000 ? "+" : "");
                }
            };
            update();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    const statsSection = document.querySelector(".stats");
    if (statsSection) statsObserver.observe(statsSection);

    // ========================================
    // 9. Quick Enquiry Form – WhatsApp Redirect
    // ========================================
    const quickForm = document.getElementById("quickForm");
    if (quickForm) {
        quickForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = this.studentName.value.trim();
            const phone = this.parentPhone.value.trim();
            const email = this.email.value.trim();

            if (!name || !phone) {
                alert("Please fill in Student Name and Phone Number.");
                return;
            }

            if (!/^0[0-9]{9}$/.test(phone)) {
                alert("Please enter a valid Kenyan mobile number (e.g., 0712345678)");
                return;
            }

            const message = `Hi Bar Union,%0A%0AI'd like the 2026 Prospectus!%0A%0AStudent: ${encodeURIComponent(name)}%0APhone: ${phone}${email ? `%0AEmail: ${email}` : ''}`;

            const btn = this.querySelector("button");
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            setTimeout(() => {
                window.open(`https://wa.me/254700735472?text=${message}`, "_blank");
                btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                btn.style.backgroundColor = "#28a745";
                setTimeout(() => {
                    quickForm.reset();
                    btn.innerHTML = original;
                    btn.disabled = false;
                    btn.style.backgroundColor = "";
                }, 3000);
            }, 800);
        });
    }

    // ========================================
    // 10. Smooth Scroll for All Anchor Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Hero scroll down arrow
    document.querySelector(".hero-scroll a")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
    });

    // ========================================
    // 11. Initialize Everything
    // ========================================
    includeHTML();
});