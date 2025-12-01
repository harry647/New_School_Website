// =======================================================
// e-learning.js – E-Learning Portal Page (2026+)
// Mobile-first, Swiper carousel, backend newsletter, smooth UX
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ========================================
  // 1. TESTIMONIALS SWIPER CAROUSEL
  // ========================================
  if (typeof Swiper !== "undefined") {
    new Swiper("#testimonialsSwiper", {
      loop: true,
      autoplay: {
        delay: 7000,
        disableOnInteraction: false,
      },
      speed: 800,
      spaceBetween: 30,
      slidesPerView: 1,
      centeredSlides: true,
      grabCursor: true,
      pagination: {
        el: "#testimonialsSwiper .swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: "#testimonialsSwiper .swiper-button-next",
        prevEl: "#testimonialsSwiper .swiper-button-prev",
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
        depth: 120,
        modifier: 2,
        slideShadows: true,
      },
    });
  }

  // ========================================
  // 2. NEWSLETTER SUBSCRIPTION – YOUR BACKEND
  // ========================================
  const newsletterForm = document.getElementById("newsletterForm");
  const successMsg = document.getElementById("subscriptionSuccess");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Subscribing...`;

      try {
        const formData = new FormData(newsletterForm);
        const preferences = [];
        formData.getAll("preferences[]").forEach(p => preferences.push(p));

        const payload = {
          email: formData.get("_replyto")?.trim().toLowerCase(),
          name: formData.get("name")?.trim() || null,
          preferences: preferences
        };

        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          newsletterForm.style.opacity = "0.5";
          newsletterForm.style.pointerEvents = "none";
          successMsg.style.display = "block";
          successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          throw new Error(result.message || "Subscription failed");
        }
      } catch (err) {
        console.error("Subscription error:", err);
        alert("Could not subscribe. Please try again later or email us directly.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }

  // ========================================
  // 3. MOBILE RESPONSIVE ENHANCEMENTS
  // ========================================

  // FAQ Accordion on mobile
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".faq-item").forEach(item => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      question.style.cursor = "cursor:pointer; padding:1rem 0; border-bottom:1px solid #eee;";
      question.addEventListener("click", () => {
        const isOpen = item.classList.toggle("open");
        answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : "0";
      });

      // Add chevron
      if (!question.querySelector("i")) {
        question.innerHTML += ' <i class="fas fa-chevron-down float-right"></i>';
      }
    });
  }

  // Features grid – stack on mobile
  const featuresGrid = document.querySelector(".features-grid");
  if (featuresGrid && window.innerWidth <= 768) {
    featuresGrid.style.gridTemplateColumns = "1fr";
  }

  // App promo layout
  const appPromo = document.querySelector(".app-promo");
  if (appPromo && window.innerWidth <= 768) {
    appPromo.style.flexDirection = "column";
    appPromo.querySelector(".app-image")?.style.setProperty("order", "-1");
  }

  // ========================================
  // 4. BACK TO TOP BUTTON
  // ========================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 500);
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ========================================
  // 5. SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || !document.querySelector(href)) return;

      e.preventDefault();
      const target = document.querySelector(href);
      const offset = 90;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth"
      });

      history.pushState(null, null, href);
    });
  });

  // ========================================
  // 6. SCROLL REVEAL ANIMATIONS (AOS-style fallback)
  // ========================================
  const revealElements = document.querySelectorAll('.feature-box, .testimonial-card, .faq-item, .quick-card');

  const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s ease";
    revealOnScroll.observe(el);
  });
});