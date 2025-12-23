
// =======================================================
// CONTACT PAGE JAVASCRIPT - ENHANCED INTERACTIVE VERSION
// Bar Union Mixed Secondary School - Stunning UX 2025+
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // =====================================================
  // 1. ENHANCED CONTACT FORM WITH BEAUTIFUL UX
  // =====================================================
  const form = document.querySelector("form#contactForm");
  
  // Additional check to ensure form is a valid HTMLFormElement
  if (!form || !(form instanceof HTMLFormElement)) {
    console.error('Contact form not found or not a valid HTMLFormElement');
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn?.innerHTML || "Send Message";

  if (form && submitBtn) {
    // Enhanced file preview for uploaded documents
    const fileInput = form.querySelector('input[name="attachment"]');
    const preview = document.getElementById("filePreview");

    // File upload handling with animations
    fileInput?.addEventListener("change", function () {
      preview.innerHTML = "";
      if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // File size validation
        if (file.size > 10 * 1024 * 1024) {
          showFormError("File too large! Maximum size is 10MB.");
          this.value = "";
          return;
        }

        // File type validation
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
          showFormError("Please upload a PDF, Word document, or image file.");
          this.value = "";
          return;
        }

        // Create animated preview
        const div = document.createElement("div");
        div.className = "scale-in";
        div.style.cssText = `
          margin-top: 0.5rem; 
          color: #16a34a; 
          font-weight: 500; 
          background: #f0f9ff; 
          padding: 0.75rem; 
          border-radius: 8px; 
          border: 1px solid #3b82f6;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        `;
        div.innerHTML = `
          <i class="fas fa-paperclip" style="color: #3b82f6;"></i> 
          <span>${file.name} (${(file.size/1024/1024).toFixed(1)} MB)</span>
          <button type="button" onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #ef4444; cursor: pointer;">
            <i class="fas fa-times"></i>
          </button>
        `;
        preview.appendChild(div);
      }
    });

    // Enhanced form validation with visual feedback
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    requiredFields.forEach(field => {
      // Add real-time validation
      field.addEventListener("blur", validateField);
      field.addEventListener("input", clearFieldError);
    });

    // Enhanced form submission
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous errors
      clearAllErrors();
      
      // Validate all fields
      if (!validateForm()) {
        return;
      }

      // Show loading state
      setLoadingState(true);

      try {
        const formData = new FormData(form);
        
        // Enhanced form data logging for debugging
        console.log("Form data being sent:", Object.fromEntries(formData));

        const response = await fetch("/api/static/contactus", {
          method: "POST",
          body: formData,
          headers: { 
            "Accept": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Beautiful success animation
          showSuccessAnimation();
        } else {
          throw new Error(result.message || "Submission failed. Please try again.");
        }
      } catch (err) {
        console.error("Contact form error:", err);
        showFormError(`
          <strong>Unable to send your message right now.</strong><br><br>
          Please try again or contact us directly:<br>
          <strong>Phone:</strong> <a href="tel:+254700735472" style="color: #3b82f6;">+254 700 735 472</a><br>
          <strong>Email:</strong> <a href="mailto:barunionsecondary@gmail.com" style="color: #3b82f6;">barunionsecondary@gmail.com</a>
        `);
        setLoadingState(false);
      }
    });

    // Enhanced field validation
    function validateField(e) {
      const field = e.target;
      const value = field.value.trim();
      
      // Remove previous error styling
      field.classList.remove('error');
      
      // Required field validation
      if (field.hasAttribute('required') && !value) {
        showFieldError(field, "This field is required");
        return false;
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          showFieldError(field, "Please enter a valid email address");
          return false;
        }
      }

      // Enhanced Kenyan phone validation
      if (field.type === 'tel' && value) {
        const phoneRegex = /^(\+254|0)[71]\d{8}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ""))) {
          showFieldError(field, "Please enter a valid Kenyan phone number (e.g. 0712 345 678 or +254712345678)");
          return false;
        }
      }

      // Add success styling
      field.classList.add('valid');
      return true;
    }

    function validateForm() {
      let isValid = true;
      requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
          isValid = false;
        }
      });
      return isValid;
    }

    function showFieldError(field, message) {
      field.classList.add('error');
      
      // Remove existing error message
      const existingError = field.parentNode.querySelector('.field-error');
      if (existingError) {
        existingError.remove();
      }

      // Add new error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.style.cssText = `
        color: #ef4444; 
        font-size: 0.875rem; 
        margin-top: 0.25rem; 
        display: flex; 
        align-items: center; 
        gap: 0.25rem;
        animation: slideDown 0.3s ease-out;
      `;
      errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(e) {
      const field = e.target;
      field.classList.remove('error');
      const errorDiv = field.parentNode.querySelector('.field-error');
      if (errorDiv) {
        errorDiv.remove();
      }
    }

    function clearAllErrors() {
      document.querySelectorAll('.form-error, .field-error').forEach(el => el.remove());
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    function showFormError(message) {
      const div = document.createElement("div");
      div.className = "form-error fade-in";
      div.style.cssText = `
        background: #fef2f2; 
        color: #dc2626; 
        padding: 1.5rem; 
        border-radius: 12px;
        border-left: 4px solid #ef4444;
        margin: 1.5rem 0; 
        text-align: left; 
        font-weight: 500;
        animation: slideDown 0.4s ease-out;
      `;
      div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
      form.insertBefore(div, form.firstChild);
      
      // Auto-remove after 10 seconds
      setTimeout(() => div.remove(), 10000);
    }

    function setLoadingState(loading) {
      if (loading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Message...`;
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = originalBtnHTML;
      }
    }

    function showSuccessAnimation() {
      const successHTML = `
        <div class="fade-in" style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 16px; color: #166534; line-height: 1.7; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);"></div>
          <i class="fas fa-check-circle fa-6x mb-4" style="color: #22c55e; animation: scaleIn 0.6s ease-out;"></i>
          <h2 style="color: #15803d; margin: 1rem 0; font-size: 2rem; font-weight: 700;">Message Sent Successfully!</h2>
          <p style="font-size: 1.2rem; margin: 1rem 0;">
            Thank you for reaching out to <strong>Bar Union Mixed Secondary School</strong>!
          </p>
          <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
            <p style="margin: 0.5rem 0;"><strong>What happens next?</strong></p>
            <ul style="text-align: left; margin: 1rem 0; padding-left: 1.5rem;">
              <li>Our team will review your message within <strong>24 hours</strong></li>
              <li>You'll receive a response via your preferred contact method</li>
              <li>We'll provide detailed information about your inquiry</li>
            </ul>
          </div>
          <p style="margin-top: 2rem; font-weight: 600; color: #15803d; font-size: 1.1rem;">
            Excellence Meets Opportunity - We're Here to Help!
          </p>
        </div>
      `;
      
      form.innerHTML = successHTML;
      
      // Add confetti effect
      createConfetti();
    }

    function createConfetti() {
      const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
      
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall 3s ease-out forwards;
          `;
          document.body.appendChild(confetti);
          
          setTimeout(() => confetti.remove(), 3000);
        }, i * 100);
      }
    }
  } else {
    console.warn('Contact form or submit button not found');
  }
  
  // =====================================================
  // 2. ENHANCED FAQ ACCORDION WITH ANIMATIONS
  // =====================================================
  document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    // Initialize answer as hidden
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.4s ease-out, padding 0.3s ease-out';

    question.style.cursor = 'pointer';
    question.style.position = 'relative';
    question.style.paddingRight = '30px';

    // Add chevron icon if missing
    if (!question.querySelector('i')) {
      question.innerHTML += ' <i class="fas fa-chevron-down" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); color: #3b82f6; transition: transform 0.3s ease-out;"></i>';
    }

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains('open');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item.open').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-question i');
          otherAnswer.style.maxHeight = '0';
          otherAnswer.style.padding = '0';
          otherIcon.style.transform = 'translateY(-50%) rotate(0deg)';
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
        answer.style.padding = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.padding = '1rem 0';
      }

      // Rotate chevron
      const icon = question.querySelector('i');
      icon.style.transform = isOpen ? 'translateY(-50%) rotate(0deg)' : 'translateY(-50%) rotate(180deg)';

      // Add click analytics (console log for now)
      console.log(`FAQ ${isOpen ? 'closed' : 'opened'}: ${question.textContent.trim()}`);
    });
  });

  // =====================================================
  // 3. INTERSECTION OBSERVER FOR ANIMATIONS
  // =====================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        
        // Special handling for stats counter
        if (entry.target.classList.contains('stat')) {
          animateCounter(entry.target.querySelector('h3'));
        }
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.contact-item, .faq-item, .stat, .form-wrapper').forEach(el => {
    observer.observe(el);
  });

  function animateCounter(element) {
    if (!element || element.hasAttribute('data-animated')) return;
    
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    element.setAttribute('data-animated', 'true');
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
    }, 16);
  }

  // =====================================================
  // 4. ENHANCED BACK TO TOP BUTTON
  // =====================================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    // Show/hide based on scroll position with smooth transition
    let ticking = false;
    
    function updateBackToTop() {
      const scrollY = window.scrollY;
      if (scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateBackToTop);
        ticking = true;
      }
    });

    backToTop.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Smooth scroll to top with easing
      const startPosition = window.scrollY;
      const startTime = performance.now();
      const duration = 1000;

      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      function scrollToTop(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        window.scrollTo(0, startPosition * (1 - easedProgress));
        
        if (progress < 1) {
          requestAnimationFrame(scrollToTop);
        }
      }

      requestAnimationFrame(scrollToTop);
    });
  }

  // =====================================================
  // 5. SMOOTH SCROLLING FOR INTERNAL LINKS
  // =====================================================
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

  // =====================================================
  // 6. ENHANCED MOBILE RESPONSIVENESS
  // =====================================================
  function handleResponsive() {
    const contactGrid = document.querySelector(".contact-grid");
    const formGrid = document.querySelector(".form-grid");
    const statsGrid = document.querySelector(".stats-grid");

    if (window.innerWidth <= 768) {
      // Mobile optimizations
      if (contactGrid) contactGrid.style.gridTemplateColumns = "1fr";
      if (formGrid) formGrid.style.gridTemplateColumns = "1fr";
      if (statsGrid) statsGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
    } else if (window.innerWidth <= 640) {
      if (statsGrid) statsGrid.style.gridTemplateColumns = "1fr";
    }
  }

  // Initial call and debounced resize handler
  handleResponsive();
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResponsive, 250);
  });

  // =====================================================
  // 7. CONTACT INFO INTERACTIONS
  // =====================================================
  document.querySelectorAll('.contact-item').forEach(item => {
    // Add ripple effect on click
    item.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // =====================================================
  // 8. SOCIAL LINKS ENHANCEMENT
  // =====================================================
  document.querySelectorAll('.social-links-contact a').forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.15) rotate(5deg)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
    });
  });

  // =====================================================
  // 9. KEYBOARD NAVIGATION ENHANCEMENT
  // =====================================================
  document.addEventListener('keydown', function(e) {
    // ESC key closes any open FAQ items
    if (e.key === 'Escape') {
      document.querySelectorAll('.faq-item.open').forEach(item => {
        item.classList.remove('open');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-question i');
        answer.style.maxHeight = '0';
        answer.style.padding = '0';
        if (icon) icon.style.transform = 'translateY(-50%) rotate(0deg)';
      });
    }
  });

  // =====================================================
  // 10. PERFORMANCE OPTIMIZATIONS
  // =====================================================
  
  // Lazy load non-critical animations
  setTimeout(() => {
    // Add hover effects for better performance
    document.body.classList.add('ready');
  }, 500);

  // Preload critical resources
  const criticalImages = [
    '/assets/images/common/hero-bg.jpg'
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  console.log('🚀 Contact page JavaScript loaded successfully!');
});

// =====================================================
// ADDITIONAL CSS ANIMATIONS VIA JAVASCRIPT
// =====================================================

// Inject additional CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes confettiFall {
    to {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
  
  .form-group input.error,
  .form-group textarea.error,
  .form-group select.error {
    border-color: #ef4444 !important;
    background: #fef2f2 !important;
    animation: shake 0.5s ease-in-out;
  }
  
  .form-group input.valid,
  .form-group textarea.valid,
  .form-group select.valid {
    border-color: #10b981 !important;
    background: #f0fdf4 !important;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .ready .contact-item:hover {
    transform: translateY(-5px);
  }
`;
document.head.appendChild(style);