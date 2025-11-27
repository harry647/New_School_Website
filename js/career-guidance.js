// ===============================================
// Career & Guidance Page – Full Interactive Script (2026+)
// Features: Dynamic Success Stories + Stats, Form Enhancements, Animations
// ===============================================

document.addEventListener("DOMContentLoaded", async () => {
    const DEFAULT_PHOTO = "/assets/images/default-user.png";

    // ========================================
    // 1. Load Success Stories from JSON
    // ========================================
    async function loadSuccessStories() {
        const swiperWrapper = document.querySelector("#successStoriesSwiper .swiper-wrapper");
        const loader = document.querySelector("#successStories .loader");

        try {
            const res = await fetch("/data/career-success-stories.json", { cache: "no-store" });
            if (!res.ok) throw new Error("Stories not found");

            const data = await res.json();
            swiperWrapper.innerHTML = ""; // Clear static fallback

            data.successStories.forEach(story => {
                const slide = document.createElement("div");
                slide.className = "swiper-slide";
                slide.innerHTML = `
                    <div class="success-card reveal">
                        <img src="${story.photo || DEFAULT_PHOTO}"
                             alt="${story.name}"
                             loading="lazy"
                             onerror="this.src='${DEFAULT_PHOTO}'; this.onerror=null;">
                        <div class="success-info">
                            <h4>${story.name}</h4>
                            <p class="batch">Batch of ${story.batch}</p>
                            <p class="achievement">${story.achievement}</p>
                            <p class="story">${story.story}</p>
                        </div>
                    </div>
                `;
                swiperWrapper.appendChild(slide);
            });

            // Initialize/Re-init Swiper after content load
            initSuccessStoriesSwiper();

        } catch (err) {
            console.warn("Using static success stories (JSON failed):", err);
            // Keep static HTML — perfect graceful degradation
            initSuccessStoriesSwiper();
        } finally {
            loader?.remove();
        }
    }

    function initSuccessStoriesSwiper() {
        if (typeof Swiper === "undefined") return;

        new Swiper("#successStoriesSwiper", {
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
        });
    }

    // ========================================
    // 2. Load Career Stats from JSON
    // ========================================
    async function loadCareerStats() {
        const statsGrid = document.getElementById("careerStatsGrid");

        try {
            const res = await fetch("/data/career-stats.json");
            if (!res.ok) throw new Error("Stats not found");

            const data = await res.json();
            statsGrid.innerHTML = ""; // Clear fallback

            data.stats.forEach(stat => {
                const item = document.createElement("div");
                item.className = "stat text-center reveal";
                item.innerHTML = `
                    <i class="${stat.icon} fa-3x mb-4 text-cyan-300"></i>
                    <h3 class="counter text-5xl font-bold">${stat.value}</h3>
                    <p class="mt-2 text-lg opacity-white/90">${stat.label}</p>
                `;
                statsGrid.appendChild(item);
            });

            // Trigger counter animation when visible
            animateStatsOnScroll();

        } catch (err) {
            console.info("Using static stats (JSON not available)");
            animateStatsOnScroll(); // Still animate static ones
        }
    }

    // Animate counters when section enters viewport
    function animateStatsOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.counter').forEach(counter => {
                        const target = counter.textContent.replace(/\D/g, '');
                        const suffix = counter.textContent.includes('+') ? '+' : '';
                        let count = 0;
                        const increment = Math.ceil(target / 80);

                        const timer = setInterval(() => {
                            count += increment;
                            if (count >= target) {
                                counter.textContent = target.toLocaleString() + suffix;
                                clearInterval(timer);
                            } else {
                                counter.textContent = count.toLocaleString();
                            }
                        }, 30);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(document.querySelector('.career-stats'));
    }

    // ========================================
    // 3. Form Enhancements
    // ========================================
    function initCounselingForm() {
        const form = document.getElementById("counselingForm");
        const dateInput = document.getElementById("sessionDate");
        const fileInput = document.getElementById("resumeUpload");
        const preview = document.getElementById("resumePreview");

        if (!form) return;

        // Set min date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput?.setAttribute("min", tomorrow.toISOString().split("T")[0]);

        // File preview with size check
        fileInput?.addEventListener("change", () => {
            preview.innerHTML = "";
            const file = fileInput.files[0];
            if (!file) {
                preview.innerHTML = '<small class="text-gray-500">No file selected</small>';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("File too large! Please upload a file under 5MB.");
                fileInput.value = "";
                return;
            }
            preview.innerHTML = `
                <div class="flex items-center gap-2 text-green-600 font-medium mt-2">
                    <i class="fas fa-check-circle"></i>
                    <span>${file.name}</span>
                    <small>(${(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                </div>
            `;
        });

        // Form submission with loading state
        form.addEventListener("submit", function (e) {
            const btn = form.querySelector("button[type='submit']");
            const originalHTML = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Booking Session...`;

            // Re-enable after 5s (in case Formspree is slow)
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 5000);
        });
    }

    // ========================================
    // 4. Scroll Reveal Animations
    // ========================================
    function initScrollReveal() {
        const elements = document.querySelectorAll('.reveal, .service-card, .success-card, .stat');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

        elements.forEach(el => observer.observe(el));
    }

    // ========================================
    // 5. Initialize Everything
    // ========================================
    function init() {
        loadSuccessStories();
        loadCareerStats();
        initCounselingForm();
        initScrollReveal();
    }

    // Run init when Swiper is ready
    if (typeof Swiper !== "undefined") {
        init();
    } else {
        window.addEventListener("load", init);
    }
});