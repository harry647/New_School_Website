// ===============================================
// Bar Union Mixed Secondary School – index.js
// Fully interactive, mobile-first, production ready
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ===================================
  // 1. Preloader (already in HTML, just hide safely)
  // ===================================
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 600);
    });
  }

  // ===================================
  // 2. Animated Counters (Stats section)
  // ===================================
  const counters = document.querySelectorAll(".counter h3");
  const counterOptions = {
    threshold: 0.7,
    rootMargin: "0px 0px -100px 0px",
  };

  const startCounter = (counter) => {
    const target = parseInt(counter.getAttribute("data-target"));
    const suffix = counter.innerText.includes("%") ? "%" : "+";
    const current = parseInt(counter.innerText.replace(/[^\d]/g, "")) || 0;
    const increment = target / 80; // speed control speed

    if (current < target) {
      counter.innerText =
        Math.ceil(current + increment) + (suffix === "%" && current + increment >= target ? "%" : suffix);
      setTimeout(() => startCounter(counter), 30);
    } else {
      counter.innerText = target + suffix;
    }
  };

  if (counters.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          startCounter(counter);
          observer.unobserve(counter); // run once
        }
      });
    }, counterOptions);

    counters.forEach((counter) => observer.observe(counter));
  }

  // ===================================
  // 3. Testimonial Slider (Simple & Lightweight)
  // ===================================
  const slider = document.querySelector(".testimonial-slider");
  const slides = document.querySelectorAll(".testimonial-card");
  const prevBtn = document.querySelector(".testimonial-nav .prev");
  const nextBtn = document.querySelector(".testimonial-nav .next");
  let currentSlide = 0;

  if (slider && slides.length > 1) {
    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      currentSlide = index;
    };

    prevBtn?.addEventListener("click", () => {
      let newIndex = currentSlide - 1;
      if (newIndex < 0) newIndex = slides.length - 1;
      showSlide(newIndex);
    });

    nextBtn?.addEventListener("click", () => {
      let newIndex = currentSlide + 1;
      if (newIndex >= slides.length) newIndex = 0;
      showSlide(newIndex);
    });

    // Auto-play (optional – comment out if you don’t want it)
    setInterval(() => {
      nextBtn.click();
    }, 7000);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    slider.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    slider.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextBtn.click();
      if (touchEndX - touchStartX > 50) prevBtn.click();
    });
  }

    // ===================================
  // 4. Quick Enquiry Form – YOUR OWN BACKEND (No Formspree)
  // ===================================
  const form = document.querySelector(".enquiry-form");
  const submitBtn = form?.querySelector(".enquiry-btn");
  const originalBtnHTML = submitBtn?.innerHTML || "Send My Prospectus";

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent page reload

      // Disable button + show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;

      try {
        const response = await fetch("/api/submit-enquiry", {
          method: "POST",
          body: new FormData(form),
          headers: {
            "Accept": "application/json",
          },
        });

        const result = await response.json(); // Expecting JSON from your backend

        if (response.ok) {

          // Success – replace entire form with thank-you message
          form.innerHTML = `
            <div class="form-success" style="text-align:center; padding:2.5rem 2rem; background:#d4edda; border-radius:12px; color:#155724; line-height:1.6;">
              <i class="fas fa-check-circle fa-4x mb-4" style="color:#28a745;"></i>
              <h3 style="margin:0.5rem 0; color:#0f5132;">Thank You!</h3>
              <p style="margin:0.5rem 0 0;">Your request has been received successfully.</p>
              <p style="margin:0.3rem 0 0; font-weight:500;">
                The 2026 Prospectus will be sent to you shortly via WhatsApp & Email.
              </p>
            </div>`;
        } else {
          // Backend returned error (e.g. validation fail, server issue)
          throw new Error(result.message || "Submission failed");
        }
      } catch (error) {
        // Network error or unexpected issue
        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
          }, 8000);

        alert(
          "Oops! We couldn't send your request right now.\n\n" +
          "Please reach us directly on WhatsApp: +254 7XX XXX XXX\n" +
          "We'll get back to you immediately!"
        );
        console.error("Form submission error:", error);
      }
    });
  }

  // ===================================
  // 5. Mobile Menu – already handled by mobile-menu.js
  //    (just make sure it's loaded before this file)
  // ===================================

  // No action needed here

  // ===================================
  // 6. AOS Refresh on mobile orientation change
  // ===================================
  window.addEventListener("orientationchange", () => {
    setTimeout(() => AOS.refresh(), 500);
  });

  // Optional: Refresh AOS when fonts are loaded (prevents jumpy animations)
  document.fonts?.ready.then(() => AOS.refresh());
});

// Fallback: If JS fails, at least remove preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.style.display = "none";
});