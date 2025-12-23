// ===============================================
// Bar Union Mixed Secondary School – Enhanced index.js
// Ultra-modern Interactive Features | Mobile-first | Production Ready
// ===============================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ===================================
  // 1. Enhanced Preloader with Stunning Animation
  // ===================================
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 800);
    });
  }

  // ===================================
  // 2. Advanced Animated Counters (Stats section)
  // ===================================
  const counters = document.querySelectorAll(".counter h3");
  const counterOptions = {
    threshold: 0.7,
    rootMargin: "0px 0px -100px 0px",
  };

  const startCounter = (counter) => {
    const parent = counter.parentElement;
    const target = parseInt(parent.getAttribute("data-target"));
    if (isNaN(target)) return;

    const suffix = counter.innerText.includes("%") ? "%" : "+";
    let current = parseInt(counter.innerText.replace(/[^\d]/g, "")) || 0;
    const increment = Math.ceil(target / 80);

    // Add counter animation with easing
    if (current < target) {
      const easeOutQuart = 1 - Math.pow(1 - (current / target), 4);
      current = Math.min(current + increment, target);
      const displayValue = Math.floor(current * (1 + easeOutQuart * 0.3));
      counter.innerText = Math.min(displayValue, target) + suffix;
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
          // Add pulse effect when counter starts
          counter.style.animation = 'pulse 0.5s ease-in-out';
          startCounter(counter);
          observer.unobserve(counter); // run once
          setTimeout(() => {
            counter.style.animation = '';
          }, 500);
        }
      });
    }, counterOptions);

    counters.forEach((counter) => observer.observe(counter));
  }

  // ===================================
  // 3. Enhanced Testimonial Slider with Touch Support
  // ===================================
  const slider = document.querySelector(".testimonial-slider");
  const prevBtn = document.querySelector(".testimonial-nav .prev");
  const nextBtn = document.querySelector(".testimonial-nav .next");

  if (slider && prevBtn && nextBtn) {
    const cardWidth = document.querySelector(".testimonial-card").offsetWidth + 32; // gap = 32px
    let scrollAmount = 0;
    let isAutoScrolling = false;

    // Enhanced button click handlers with smooth animation
    nextBtn.addEventListener("click", () => {
      if (isAutoScrolling) return;
      isAutoScrolling = true;
      scrollAmount += cardWidth;
      if (scrollAmount > slider.scrollWidth - slider.clientWidth) scrollAmount = 0; // loop
      
      // Add click animation
      nextBtn.style.transform = 'scale(0.95)';
      setTimeout(() => nextBtn.style.transform = '', 150);
      
      slider.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setTimeout(() => isAutoScrolling = false, 800);
    });

    prevBtn.addEventListener("click", () => {
      if (isAutoScrolling) return;
      isAutoScrolling = true;
      scrollAmount -= cardWidth;
      if (scrollAmount < 0) scrollAmount = slider.scrollWidth - slider.clientWidth;
      
      // Add click animation
      prevBtn.style.transform = 'scale(0.95)';
      setTimeout(() => prevBtn.style.transform = '', 150);
      
      slider.scrollTo({ left: scrollAmount, behavior: "smooth" });
      setTimeout(() => isAutoScrolling = false, 800);
    });

    // Auto-scroll with enhanced timing
    let autoScrollInterval;
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!document.hidden && !isAutoScrolling) {
          nextBtn.click();
        }
      }, 6000);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };

    // Start auto-scroll
    startAutoScroll();

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextBtn.click();
        } else {
          prevBtn.click();
        }
      }
    };

    // Pause when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });
  }

  // ===================================
  // 4. Enhanced Quick Enquiry Form – Professional Validation & UX
  // ===================================
  const form = document.querySelector(".enquiry-form");
  const submitBtn = form?.querySelector(".enquiry-btn");
  const originalBtnHTML = submitBtn?.innerHTML || "Send My Prospectus";

  if (form) {
    // Enhanced form validation
    const validateForm = () => {
      const studentName = form.querySelector('#studentName');
      const parentPhone = form.querySelector('#parentPhone');
      const email = form.querySelector('#email');

      let isValid = true;

      // Clear previous errors
      form.querySelectorAll('.error-message').forEach(err => err.remove());
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      // Validate student name
      if (!studentName.value.trim()) {
        showFieldError(studentName, 'Student name is required');
        isValid = false;
      }

      // Validate parent phone
      const phoneRegex = /^0[0-9]{9}$/;
      if (!parentPhone.value.trim()) {
        showFieldError(parentPhone, 'Parent phone number is required');
        isValid = false;
      } else if (!phoneRegex.test(parentPhone.value.trim())) {
        showFieldError(parentPhone, 'Please enter a valid Kenyan mobile number (07XX XXX XXX)');
        isValid = false;
      }

      // Validate email (optional but if provided, must be valid)
      if (email.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          showFieldError(email, 'Please enter a valid email address');
          isValid = false;
        }
      }

      return isValid;
    };

    const showFieldError = (field, message) => {
      field.classList.add('error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = message;
      errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem;';
      field.parentNode.appendChild(errorDiv);
    };

    // Real-time validation
    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', validateForm);
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
      });
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateForm()) {
        // Add shake animation to form
        form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => form.style.animation = '', 500);
        return;
      }

      // Disable button + show loading state with enhanced UX
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;
      submitBtn.style.background = '#64748b';

      try {
        const response = await fetch("/api/static/submit-enquiry", {
          method: "POST",
          body: new FormData(form),
          headers: {
            "Accept": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          // Success – Enhanced success animation and message
          form.innerHTML = `
            <div class="form-success" style="
              text-align: center; 
              padding: 3rem 2rem; 
              background: linear-gradient(135deg, #10b981, #059669); 
              border-radius: 16px; 
              color: white; 
              line-height: 1.6;
              animation: successSlideIn 0.8s ease-out;
            ">
              <i class="fas fa-check-circle fa-4x mb-4" style="color: #22c55e; animation: pulse 2s infinite;"></i>
              <h3 style="margin: 1rem 0; color: white;">Thank You!</h3>
              <p style="margin: 0.5rem 0 0; font-weight: 500;">Your request has been received successfully.</p>
              <p style="margin: 0.5rem 0 0; font-weight: 500;">
                The 2026 Prospectus will be sent to you shortly via WhatsApp & Email.
              </p>
              <div style="margin-top: 2rem;">
                <button onclick="location.reload()" style="
                  background: white; 
                  color: #059669; 
                  border: none; 
                  padding: 0.75rem 1.5rem; 
                  border-radius: 8px; 
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.3s ease;
                " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
                  Submit Another Request
                </button>
              </div>
            </div>`;
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (error) {
        // Enhanced error handling with better UX
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.style.background = '';
        }, 1000);

        // Show user-friendly error
        const errorHtml = `
          <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Oops! Something went wrong.</strong><br>
            Please reach us directly on WhatsApp: +254 7XX XXX XXX
          </div>
        `;
        
        const existingError = form.querySelector('.form-error');
        if (!existingError) {
          form.insertAdjacentHTML('afterbegin', errorHtml);
        }

        console.error("Form submission error:", error);
      }
    });
  }

  // ===================================
  // 5. Enhanced Scroll Animations & Intersection Observer
  // ===================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Special handling for different elements
        if (entry.target.classList.contains('value-card')) {
          setTimeout(() => {
            entry.target.style.transform = 'translateY(0) scale(1)';
          }, entry.target.dataset.delay || 0);
        }
        
        if (entry.target.classList.contains('news-card')) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, entry.target.dataset.delay || 0);
        }
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.stat, .vm-card, .value-card, .feature-card, .news-card, .gallery-item').forEach(el => {
    observer.observe(el);
  });

  // ===================================
  // 6. Enhanced Smooth Scroll for Navigation
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ===================================
  // 7. Enhanced Hero Scroll Indicator
  // ===================================
  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) {
    heroScroll.addEventListener('click', () => {
      const featuresSection = document.querySelector('#features');
      if (featuresSection) {
        featuresSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // ===================================
  // 8. Enhanced Gallery Lightbox Effect
  // ===================================
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const img = this.querySelector('img');
      if (img) {
        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
          <div class="lightbox-content">
            <img src="${img.src}" alt="${img.alt}">
            <button class="lightbox-close">&times;</button>
          </div>
        `;
        lightbox.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center;
          z-index: 10000; opacity: 0; transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(lightbox);
        
        // Animate in
        setTimeout(() => lightbox.style.opacity = '1', 10);
        
        // Close handlers
        const closeLightbox = () => {
          lightbox.style.opacity = '0';
          setTimeout(() => document.body.removeChild(lightbox), 300);
        };
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) closeLightbox();
        });
        
        // Close on escape
        const escapeHandler = (e) => {
          if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', escapeHandler);
          }
        };
        document.addEventListener('keydown', escapeHandler);
      }
    });
  });

  // ===================================
  // 9. Enhanced Form Field Animations
  // ===================================
  document.querySelectorAll('.enquiry-form input').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentNode.style.transform = 'scale(1.02)';
      this.parentNode.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', function() {
      this.parentNode.style.transform = 'scale(1)';
    });
  });

  // ===================================
  // 10. Enhanced Parallax Effect (Optional)
  // ===================================
  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < hero.offsetHeight) {
      const rate = scrolled * -0.5;
      hero.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // Only enable parallax on larger screens for performance
  if (window.innerWidth > 768) {
    window.addEventListener('scroll', requestTick);
  }

  // ===================================
  // 11. Enhanced Mobile Menu Handler
  // ===================================
  // This will be handled by the mobile-menu.js file that's already included
  // but we can add some additional enhancements here
  
  // Add touch-friendly improvements for mobile
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }

  // ===================================
  // 12. Performance Optimizations
  // ===================================
  
  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Refresh AOS animations on resize
      if (window.AOS) {
        AOS.refresh();
      }
    }, 250);
  });

  // Optimize scroll events
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Add scroll-based animations here if needed
    }, 16); // ~60fps
  });

  // ===================================
  // 13. Enhanced Error Handling
  // ===================================
  window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
  });

  // Handle promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
  });
});

// ===================================
// 14. Additional CSS Animations (injected dynamically)
// ===================================
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes successSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-30px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .animate-in {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .touch-device .testimonial-card {
    touch-action: pan-x;
  }
  
  .lightbox-content {
    max-width: 90vw;
    max-height: 90vh;
    position: relative;
  }
  
  .lightbox-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
  
  .lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }
  
  /* Enhanced focus states for accessibility */
  .btn:focus,
  input:focus,
  .testimonial-nav span:focus,
  .hero-scroll:focus {
    outline: 3px solid #ffd700;
    outline-offset: 2px;
  }
  
  /* Smooth transitions for all interactive elements */
  .stat,
  .vm-card,
  .value-card,
  .feature-card,
  .news-card,
  .gallery-item,
  .testimonial-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;
document.head.appendChild(style);

// Fallback: If JS fails, at least remove preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.style.display = "none";
});