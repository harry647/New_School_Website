// ===============================================
// Career & Guidance Page – Full Interactive Script (2026+)
// Dynamic Stories + Stats + Backend-Powered Booking Form
// ===============================================

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const DEFAULT_PHOTO = "/assets/images/defaults/default-user.png";

  // Auto-set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sessionDateInput = document.getElementById("sessionDate");
  if (sessionDateInput) {
    sessionDateInput.setAttribute("min", tomorrow.toISOString().split("T")[0]);
  }

  // ========================================
  // 1. Load Success Stories from JSON
  // ========================================
  async function loadSuccessStories() {
    const swiperWrapper = document.querySelector("#successStoriesSwiper .swiper-wrapper");
    const loader = document.querySelector("#successStories .loader");

    try {
      const res = await fetch("/data/static/career-success-stories.json?t=" + Date.now(), {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Not found");

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

      initSwiper();
    } catch (err) {
      console.warn("Using static success stories:", err);
      initSwiper(); // Use static ones as fallback
    } finally {
      if (loader) loader.remove();
    }
  }

  function initSwiper() {
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
      const res = await fetch("/data/static/career-stats.json?t=" + Date.now());
      if (!res.ok) throw new Error();

      const data = await res.json();
      statsGrid.innerHTML = "";

      data.stats.forEach(stat => {
        const item = document.createElement("div");
        item.className = "stat text-center reveal";
        item.innerHTML = `
          <i class="${stat.icon} fa-3x mb-4 text-cyan-300"></i>
          <h3 class="counter text-5xl font-bold" data-target="${stat.value.replace(/\D/g, '')}">
            ${stat.value.includes('+') ? '0+' : '0'}
          </h3>
          <p class="mt-2 text-lg opacity-white/90">${stat.label}</p>
        `;
        statsGrid.appendChild(item);
      });

      animateCounters();
    } catch (err) {
      console.info("Using static stats");
      animateCounters(); // Animate static ones too
    }
  }

  function animateCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.counter').forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const suffix = counter.textContent.includes('+') ? '+' : '';
            let count = 0;
            const increment = Math.ceil(target / 60);

            const timer = setInterval(() => {
              count += increment;
              if (count >= target) {
                counter.textContent = target.toLocaleString() + suffix;
                clearInterval(timer);
              } else {
                counter.textContent = count.toLocaleString() + suffix;
              }
            }, 40);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    observer.observe(document.querySelector('.career-stats'));
  }

  // ========================================
  // 3. COUNSELING BOOKING FORM – FULLY BACKEND-POWERED
  // ========================================
  const counselingForm = document.getElementById("counselingForm");
  const resumeInput = document.querySelector('input[name="resume"]');
  const resumePreview = document.getElementById("resumePreview");

  if (counselingForm) {
    // Live file preview
    resumeInput?.addEventListener("change", function () {
      resumePreview.innerHTML = "";
      const file = this.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("File too large! Maximum 10MB allowed.");
        this.value = "";
        return;
      }

      resumePreview.innerHTML = `
        <div class="text-green-600 font-medium mt-2 flex items-center gap-2">
          <i class="fas fa-file-alt"></i>
          <span>${file.name}</span>
          <small>(${(file.size / 1024 / 1024).toFixed(1)} MB)</small>
        </div>
      `;
    });

    // Submit to YOUR backend
    counselingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Booking Session...`;

      try {
        const formData = new FormData(counselingForm);

        const response = await fetch("/api/book-counseling", {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          counselingForm.innerHTML = `
            <div style="text-align:center; padding:4rem 2rem; background:#d4edda; border-radius:16px; color:#0f5132; line-height:1.8;">
              <i class="fas fa-check-circle fa-5x mb-4" style="color:#28a745;"></i>
              <h2 style="color:#166534;">Session Booked Successfully!</h2>
              <p style="font-size:1.1rem; margin:1.5rem 0;">
                Thank you, <strong>${formData.get("student_name")}</strong>!
              </p>
              <p>Your counseling session request for <strong>${formData.get("grade")}</strong> has been received.</p>
              <p>
                Our team will contact you within <strong>24–48 hours</strong> on<br>
                <strong>${formData.get("phone")}</strong> and <strong>${formData.get("_replyto")}</strong>
                to confirm your slot and send the Zoom link.
              </p>
              <p style="margin-top:2rem; font-weight:600; color:#166534;">
                We look forward to helping you shape your future!
              </p>
            </div>
          `;
        } else {
          throw new Error(result.message || "Booking failed");
        }
      } catch (err) {
        console.error("Booking error:", err);
        alert("Could not book session. Please try again or call +254 700 735 472");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }

  // ========================================
  // 4. Scroll Reveal Animations
  // ========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

  document.querySelectorAll('.reveal, .service-card, .success-card, .stat').forEach(el => {
    observer.observe(el);
  });

  // ========================================
  // 5. Initialize Everything
  // ========================================
  loadSuccessStories();
  loadCareerStats();
});