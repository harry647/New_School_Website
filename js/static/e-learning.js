// =============================
// E-Learning Portal – Interactive Features
// Fully compatible with your current HTML (Nov 2025)
// =============================

document.addEventListener("DOMContentLoaded", () => {
  // ============================
  // 1. Initialize Swiper for Testimonials
  // ============================
  function initTestimonialsSwiper() {
    if (typeof Swiper === "undefined") {
      console.warn("Swiper not loaded yet.");
      return;
    }

    new Swiper("#testimonialsSwiper", {
      loop: true,
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
      },
      pagination: {
        el: "#testimonialsSwiper .swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: "#testimonialsSwiper .swiper-button-next",
        prevEl: "#testimonialsSwiper .swiper-button-prev",
      },
      effect: "slide",
      speed: 800,
      slidesPerView: 1,
      spaceBetween: 30,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }

  // ============================
  // 2. FAQ Accordion (Toggle)
  // ============================
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");

        // Close all
        faqItems.forEach((i) => {
          i.classList.remove("open");
          const ans = i.querySelector(".faq-answer");
          if (ans) ans.style.maxHeight = null;
        });

        // Open clicked one
        if (!isOpen) {
          item.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + 40 + "px"; // padding
        }
      });
    });
  }

  // ============================
  // 3. Back to Top Button
  // ============================
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 600);
    });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ============================
  // 4. Newsletter Form (Formspree)
  // ============================
  function initNewsletterForm() {
    const form = document.querySelector(".newsletter-form");
    const successMsg = document.getElementById("subscriptionSuccess");

    if (!form || !successMsg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Subscribing...`;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          successMsg.style.display = "block";
          successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
          form.reset();
        } else {
          throw new Error("Submission failed");
        }
      } catch (err) {
        alert("Subscription failed. Please try again later.");
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // ============================
  // 5. Smooth Scroll for Anchor Links
  // ============================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#" || !href) return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Update URL without page jump
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ============================
  // 6. Scroll Reveal Animations
  // ============================
  function initScrollReveal() {
    const elements = document.querySelectorAll(
      ".feature-box, .quick-card, .testimonial-card, .faq-item, .stat-card"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ============================
  // 7. Animated Stats Counter (on scroll)
  // ============================
  function initAnimatedStats() {
    const statsSection = document.getElementById("appStats");
    if (!statsSection) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !animated) {
            animated = true;
            document.querySelectorAll('.counter').forEach(counter => {
                const target = parseInt(counter.textContent.replace(/\D/g, '')) || 0;
                const suffix = counter.textContent.includes('+') ? '+' : '';
                let count = 0;
                const increment = target > 1000 ? Math.ceil(target / 90) : Math.ceil(target / 50);
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
        }
    }, { threshold: 0.6 });

    observer.observe(statsSection);


    function animateCounters() {
      const counters = statsSection.querySelectorAll("h3");
      counters.forEach((counter) => {
        const target = parseInt(counter.textContent.replace(/\D/g, ""), 10) || 0;
        let count = 0;
        const increment = Math.ceil(target / 80);
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            counter.textContent = target.toLocaleString() + (target > 1000 ? "+" : "");
            clearInterval(timer);
          } else {
            counter.textContent = count.toLocaleString();
          }
        }, 30);
      });
    }
  }

  // ============================
  // 8. Initialize Everything
  // ============================
  function init() {
    initTestimonialsSwiper();
    initFAQAccordion();
    initBackToTop();
    initNewsletterForm();
    initSmoothScroll();
    initScrollReveal();
    initAnimatedStats();
  }

  // Run after Swiper is fully loaded (in case CDN delay)
  if (typeof Swiper !== "undefined") {
    init();
  } else {
    window.addEventListener("load", init);
  }
});