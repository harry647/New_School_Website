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

        const response = await fetch("/api/static/subscribe", {
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
  // 3. ENHANCED MOBILE RESPONSIVE ENHANCEMENTS
  // ========================================

  // FAQ Accordion functionality with smooth animations
  function initializeFAQ() {
    document.querySelectorAll(".faq-item").forEach(item => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      if (question && answer) {
        // Initialize answer as collapsed
        answer.style.maxHeight = "0";
        answer.style.opacity = "0";
        answer.style.transform = "translateY(-10px)";
        
        // Add chevron icon if not present
        if (!question.querySelector("i")) {
          question.innerHTML += ' <i class="fas fa-chevron-down"></i>';
        }
        
        question.addEventListener("click", () => {
          const isOpen = item.classList.toggle("open");
          
          // Smooth animation for answer height
          if (isOpen) {
            answer.style.maxHeight = answer.scrollHeight + "px";
            answer.style.opacity = "1";
            answer.style.transform = "translateY(0)";
          } else {
            answer.style.maxHeight = "0";
            answer.style.opacity = "0";
            answer.style.transform = "translateY(-10px)";
          }
        });
        
        // Add keyboard support
        question.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            question.click();
          }
        });
      }
    });
  }
  
  // Initialize FAQ on page load
  initializeFAQ();

  // Enhanced scroll reveal animations
  const revealElements = document.querySelectorAll('.feature-box, .testimonial-card, .faq-item, .quick-card, .elearning-features li, .app-features li');

  const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) scale(1)";
        }, index * 100); // Staggered animation
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px) scale(0.95)";
    el.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    revealOnScroll.observe(el);
  });

  // ========================================
  // 4. ENHANCED INTERACTIONS & MICRO-ANIMATIONS
  // ========================================

  // Enhanced feature box interactions
  document.querySelectorAll('.feature-box').forEach(box => {
    box.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-15px) scale(1.02)';
      
      // Add ripple effect
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(1, 117, 194, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        margin-top: -50px;
      `;
      
      this.style.position = 'relative';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    box.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Enhanced quick card interactions
  document.querySelectorAll('.quick-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-12px) scale(1.03)';
      
      // Add subtle glow effect
      this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(139, 92, 246, 0.4)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '';
    });
  });

  // Add CSS for ripple animation
  if (!document.querySelector('#ripple-animation-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation-style';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // 5. BACK TO TOP BUTTON - ENHANCED
  // ========================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        backToTop.classList.add("show");
        backToTop.style.opacity = "1";
        backToTop.style.transform = "translateY(0)";
      } else {
        backToTop.classList.remove("show");
        backToTop.style.opacity = "0";
        backToTop.style.transform = "translateY(20px)";
      }
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ========================================
  // 6. SMOOTH SCROLL FOR ANCHOR LINKS
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
  // 7. ENHANCED MOBILE OPTIMIZATIONS
  // ========================================

  // Mobile touch interactions
  if (window.innerWidth <= 768) {
    // Add touch feedback
    document.querySelectorAll('.feature-box, .quick-card, .faq-item').forEach(element => {
      element.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.98)';
        this.style.transition = 'transform 0.1s ease';
      });

      element.addEventListener('touchend', function() {
        this.style.transform = 'scale(1)';
      });
    });

    // Improve mobile scrolling performance
    document.body.style.webkitOverflowScrolling = 'touch';
  }

  // ========================================
  // 8. LOADING ANIMATIONS
  // ========================================
  
  // Page load animation
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate intro elements with stagger
    const introElements = document.querySelectorAll('.elearning-intro > *');
    introElements.forEach((el, index) => {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, index * 200);
    });
  });

  // ========================================
  // 9. PERFORMANCE OPTIMIZATIONS
  // ========================================
  
  // Throttle scroll events for better performance
  let ticking = false;
  
  function updateScrollEffects() {
    // Update scroll-based effects here
    ticking = false;
  }
  
  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestScrollUpdate);

  // ========================================
  // 10. ACCESSIBILITY ENHANCEMENTS
  // ========================================
  
  // Keyboard navigation for FAQ items
  document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Focus management for modal-like interactions
  document.querySelectorAll('.feature-box, .quick-card').forEach(element => {
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Trigger click if element is a link or button
        const link = this.querySelector('a');
        if (link) {
          link.click();
        }
      }
    });
  });

  // ========================================
  // 11. CONSOLE WELCOME MESSAGE
  // ========================================
  console.log(`
    🎓 Welcome to Bar Union Mixed Secondary School E-Learning Portal!
    📱 Mobile-first design with advanced animations
    ✨ Enhanced with modern UX patterns
    🚀 Powered by cutting-edge web technologies
  `);
});