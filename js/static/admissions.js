// =======================================================
// admissions.js – Ultra-Premium Enhanced Admissions Page (2025–2026)
// Stunning Animations, Professional Interactions, Mobile-Perfect
// =======================================================

document.addEventListener("DOMContentLoaded", async function () {
  "use strict";

  // =====================================================
  // 1. Dynamic Admissions Data with Enhanced Loading
  // =====================================================
  const datesList = document.getElementById("datesList");
  const feeTableBody = document.getElementById("feeTableBody");
  const gradeSelect = document.querySelector('select[name="grade"]');
  const feeBrochureLink = document.getElementById("feeBrochureLink");

  // Show loading animations
  if (datesList) {
    datesList.innerHTML = '<li class="loading">Loading important dates...</li>';
  }
  if (feeTableBody) {
    feeTableBody.innerHTML = '<tr class="loading"><td colspan="4">Loading fee structure...</td></tr>';
  }

  try {
    const res = await fetch("/data/static/admissions-data.json?t=" + Date.now(), {
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();

      // Key Dates with enhanced animations
      if (datesList && data.dates?.length) {
        datesList.innerHTML = "";
        data.dates.forEach((date, i) => {
          const li = document.createElement("li");
          li.className = "fade-in";
          li.style.animationDelay = `${i * 150}ms`;
          li.innerHTML = `<strong>${date.label}:</strong> ${date.value}`;
          datesList.appendChild(li);
        });
      }

      // Fee Structure with stagger animation
      if (feeTableBody && data.fees?.length) {
        feeTableBody.innerHTML = "";
        data.fees.forEach((fee, i) => {
          const tr = document.createElement("tr");
          tr.className = "fade-in";
          tr.style.animationDelay = `${i * 200}ms`;
          tr.innerHTML = `
            <td>${fee.level}</td>
            <td>Ksh ${fee.tuition.toLocaleString()}</td>
            <td>Ksh ${fee.other.toLocaleString()}</td>
            <td><strong>Ksh ${fee.total.toLocaleString()}</strong></td>
          `;
          feeTableBody.appendChild(tr);
        });
      }

      // Grade/Pathway Options
      if (gradeSelect && data.pathways?.length) {
        while (gradeSelect.options.length > 1) {
          gradeSelect.remove(1);
        }
        data.pathways.forEach(path => {
          gradeSelect.add(new Option(path, path));
        });
      }

      // Fee Brochure Link
      if (feeBrochureLink && data.documents?.feeBrochure) {
        feeBrochureLink.href = data.documents.feeBrochure;
        feeBrochureLink.style.opacity = "1";
        feeBrochureLink.style.pointerEvents = "auto";
      }
    }
  } catch (err) {
    console.warn("Could not load admissions data:", err);
    if (datesList) {
      datesList.innerHTML = '<li class="error">Unable to load dates. Please contact us directly.</li>';
    }
    if (feeTableBody) {
      feeTableBody.innerHTML = '<tr class="error"><td colspan="4">Unable to load fees. Please contact us directly.</td></tr>';
    }
  }

  // =====================================================
  // 2. Enhanced Smooth Scroll with Progress Indicator
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      // Create scroll progress indicator
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #0175C2, #ffd700);
        z-index: 9999;
        transition: width 0.3s ease;
      `;
      document.body.appendChild(progressBar);

      // Animate scroll with progress
      const startPosition = window.scrollY;
      const distance = top - startPosition;
      const duration = 1000;
      let start = null;

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        
        // Update progress bar
        const progress = (timeElapsed / duration) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
        
        if (timeElapsed < duration) requestAnimationFrame(animation);
        else {
          progressBar.remove();
          history.pushState(null, null, href);
        }
      }

      requestAnimationFrame(animation);
    });
  });

  function easeInOutCubic(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t + 2) + b;
  }

  // =====================================================
  // 3. Enhanced Timeline with Interactive Modals
  // =====================================================
  const modal = document.createElement("div");
  modal.id = "timelineModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">×</span>
      <div id="modalBody" class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Enhanced modal styles
  const modalStyles = document.createElement('style');
  modalStyles.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s ease;
    }
    
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    
    .modal-content {
      background: white;
      padding: 3rem;
      border-radius: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      transform: scale(0.8) translateY(50px);
      transition: transform 0.4s ease;
    }
    
    .modal-overlay.active .modal-content {
      transform: scale(1) translateY(0);
    }
    
    .close-modal {
      position: absolute;
      top: 1rem;
      right: 1.5rem;
      font-size: 2rem;
      cursor: pointer;
      color: #666;
      transition: color 0.3s ease;
    }
    
    .close-modal:hover {
      color: #0175C2;
    }
  `;
  document.head.appendChild(modalStyles);

  document.querySelectorAll(".timeline-item").forEach((item, index) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      const title = item.querySelector("h3")?.innerText || "Admission Step";
      const desc = item.querySelector("p")?.innerHTML || "No details available.";
      
      // Add more detailed content for each step
      const detailedContent = getDetailedStepContent(index + 1, title, desc);
      
      document.getElementById("modalBody").innerHTML = detailedContent;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    // Add hover effects
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateX(10px)";
    });
    
    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateX(0)";
    });
  });

  function getDetailedStepContent(step, title, desc) {
    const details = {
      1: `
        <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
        <div style="line-height: 1.8; color: #555;">
          <p>${desc}</p>
          <h4 style="color: #0b2d5e; margin: 1.5rem 0 0.5rem;">What happens next:</h4>
          <ul style="margin-left: 1.5rem;">
            <li>You will receive a confirmation email within 24 hours</li>
            <li>Our admissions counselor will call you within 48 hours</li>
            <li>You'll get access to our virtual school tour</li>
            <li>Download the admission form and requirements checklist</li>
          </ul>
        </div>
      `,
      2: `
        <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
        <div style="line-height: 1.8; color: #555;">
          <p>${desc}</p>
          <h4 style="color: #0b2d5e; margin: 1.5rem 0 0.5rem;">Tour highlights:</h4>
          <ul style="margin-left: 1.5rem;">
            <li>State-of-the-art science and computer labs</li>
            <li>Modern library and resource centers</li>
            <li>Sports facilities and recreational areas</li>
            <li>Student dormitories and dining facilities</li>
            <li>Art studios and music rooms</li>
          </ul>
        </div>
      `,
      3: `
        <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
        <div style="line-height: 1.8; color: #555;">
          <p>${desc}</p>
          <h4 style="color: #0b2d5e; margin: 1.5rem 0 0.5rem;">Assessment includes:</h4>
          <ul style="margin-left: 1.5rem;">
            <li>English and Mathematics proficiency</li>
            <li>Critical thinking and problem-solving</li>
            <li>Subject-specific skills based on pathway choice</li>
            <li>Interview with academic staff</li>
          </ul>
        </div>
      `,
      4: `
        <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
        <div style="line-height: 1.8; color: #555;">
          <p>${desc}</p>
          <h4 style="color: #0b2d5e; margin: 1.5rem 0 0.5rem;">Discussion topics:</h4>
          <ul style="margin-left: 1.5rem;">
            <li>Academic goals and career aspirations</li>
            <li>Extracurricular interests and talents</li>
            <li>School culture and values alignment</li>
            <li>Support services and resources</li>
          </ul>
        </div>
      `,
      5: `
        <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
        <div style="line-height: 1.8; color: #555;">
          <p>${desc}</p>
          <h4 style="color: #0b2d5e; margin: 1.5rem 0 0.5rem;">Final steps:</h4>
          <ul style="margin-left: 1.5rem;">
            <li>Complete enrollment forms and documentation</li>
            <li>Pay registration fee to secure placement</li>
            <li>Receive welcome package and orientation schedule</li>
            <li>Join our student and parent communities</li>
          </ul>
        </div>
      `
    };
    
    return details[step] || `
      <h3 style="color: #0175C2; margin-bottom: 1.5rem;">${title}</h3>
      <div style="line-height: 1.8; color: #555;">${desc}</div>
    `;
  }

  // Close modal with enhanced animations
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close-modal")) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // =====================================================
  // 4. Enhanced Form with Real-time Validation
  // =====================================================
  const form = document.querySelector(".apply-form");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn?.innerHTML || "Submit Application";

  if (form) {
    // Real-time validation
    const requiredFields = form.querySelectorAll("[required]");
    requiredFields.forEach(field => {
      field.addEventListener("blur", validateField);
      field.addEventListener("input", clearFieldError);
    });

    // Phone number formatting
    const phoneField = form.phone;
    if (phoneField) {
      phoneField.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 0) {
          if (value.startsWith("0")) {
            value = value.substring(0, 10);
          } else if (value.startsWith("254")) {
            value = value.substring(0, 12);
          } else {
            value = "0" + value.substring(0, 9);
          }
        }
        e.target.value = value;
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Reset previous errors
      document.querySelectorAll(".form-error").forEach(el => el.remove());
      document.querySelectorAll(".field-error").forEach(el => el.remove());
      form.querySelectorAll("input, select, textarea").forEach(field => {
        field.style.borderColor = "";
        field.classList.remove("error");
      });

      // Enhanced validation
      let hasError = false;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          showFieldError(field, "This field is required");
          hasError = true;
        }
      });

      // Email validation
      const emailField = form._replyto;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailField.value && !emailRegex.test(emailField.value)) {
        showFieldError(emailField, "Please enter a valid email address");
        hasError = true;
      }

      // Phone validation
      if (phoneField.value && !/^0[71]\d{8}$/.test(phoneField.value.replace(/\s/g, ""))) {
        showFieldError(phoneField, "Please enter a valid Kenyan phone number");
        hasError = true;
      }

      // Age validation
      const dobField = form.dob;
      if (dobField.value) {
        const birthDate = new Date(dobField.value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13 || age > 20) {
          showFieldError(dobField, "Student must be between 13 and 20 years old");
          hasError = true;
        }
      }

      if (hasError) {
        showFormError("Please correct the highlighted fields and try again.");
        return;
      }

      // Submit with enhanced loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing Application...`;
      submitBtn.style.transform = "scale(0.95)";

      try {
        const response = await fetch("/api/static/submit-application", {
          method: "POST",
          body: new FormData(form),
          headers: {
            "Accept": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Enhanced success animation
          form.innerHTML = `
            <div class="success-message" style="
              text-align: center;
              padding: 4rem 2rem;
              background: linear-gradient(135deg, #d4edda, #c3e6cb);
              border-radius: 24px;
              color: #0f5132;
              font-family: 'Inter', sans-serif;
              animation: successPulse 1s ease-out;
            ">
              <div style="font-size: 4rem; margin-bottom: 2rem; animation: bounce 1s ease-out;">
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
              </div>
              <h2 style="color: #166534; margin: 1rem 0; font-size: 2.5rem;">Application Received!</h2>
              <p style="font-size: 1.3rem; margin: 1.5rem 0; line-height: 1.6;">
                Thank you, <strong style="color: #15803d;">${form.student_name.value.trim()}</strong>!
              </p>
              <p style="font-size: 1.2rem; margin: 1rem 0;">
                Your application for <strong>${form.grade.value}</strong> has been successfully submitted.
              </p>
              <div style="background: rgba(255,255,255,0.8); padding: 1.5rem; border-radius: 16px; margin: 2rem 0;">
                <p style="margin: 0.5rem 0; font-size: 1.1rem;">
                  <i class="fas fa-phone" style="color: #0175C2;"></i> 
                  <strong>Phone:</strong> ${form.phone.value}
                </p>
                <p style="margin: 0.5rem 0; font-size: 1.1rem;">
                  <i class="fas fa-envelope" style="color: #0175C2;"></i> 
                  <strong>Email:</strong> ${form._replyto.value}
                </p>
              </div>
              <p style="margin-top: 2rem; font-weight: 600; color: #166534; font-size: 1.2rem;">
                Our admissions team will contact you within <strong>24 hours</strong>
              </p>
              <p style="margin-top: 1rem; color: #0f5132; font-style: italic;">
                Welcome to Bar Union Mixed Secondary School — We're excited to meet you!
              </p>
            </div>
          `;

          // Add success animations
          const successStyles = document.createElement('style');
          successStyles.textContent = `
            @keyframes successPulse {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            
            @keyframes bounce {
              0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
              40%, 43% { transform: translateY(-30px); }
              70% { transform: translateY(-15px); }
              90% { transform: translateY(-4px); }
            }
          `;
          document.head.appendChild(successStyles);

        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (err) {
        console.error("Submission error:", err);
        showFormError(`
          Unable to submit your application at the moment.<br><br>
          Please try again later or contact us directly:<br>
          <strong>Phone:</strong> +254 700 000 000<br>
          <strong>Email:</strong> admissions@barunionschool.sc.ke
        `);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.style.transform = "scale(1)";
      }
    });
  }

  function validateField(e) {
    const field = e.target;
    if (field.hasAttribute("required") && !field.value.trim()) {
      showFieldError(field, "This field is required");
    }
  }

  function clearFieldError(e) {
    const field = e.target;
    field.classList.remove("error");
    field.style.borderColor = "";
    const errorMsg = field.parentNode.querySelector(".field-error");
    if (errorMsg) errorMsg.remove();
  }

  function showFieldError(field, message) {
    field.classList.add("error");
    field.style.borderColor = "#e74c3c";
    
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.style.cssText = `
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
  }

  function showFormError(message) {
    const error = document.createElement("div");
    error.className = "form-error";
    error.style.cssText = `
      background: linear-gradient(135deg, #fdf2f2, #fce7e7);
      border-left: 6px solid #e74c3c;
      color: #c33;
      padding: 1.5rem;
      margin: 2rem 0;
      border-radius: 12px;
      text-align: center;
      font-weight: 500;
      animation: shake 0.5s ease-in-out;
    `;
    error.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i> ${message}`;
    form.appendChild(error);

    // Add shake animation
    const shakeStyles = document.createElement('style');
    shakeStyles.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(shakeStyles);
  }

  // =====================================================
  // 5. Enhanced Scroll Animations with Intersection Observer
  // =====================================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        
        // Stagger animations for grid items
        if (entry.target.classList.contains('requirement-card')) {
          const cards = document.querySelectorAll('.requirement-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("visible");
            }, index * 150);
          });
        }
        
        if (entry.target.classList.contains('timeline-item')) {
          const items = document.querySelectorAll('.timeline-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add("visible");
            }, index * 200);
          });
        }
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  document.querySelectorAll(".fade-in, .card, .requirement-card, .timeline-item").forEach(el => {
    el.classList.add("fade-in");
    observer.observe(el);
  });

  // =====================================================
  // 6. Enhanced Hero Animations
  // =====================================================
  const heroTitle = document.querySelector("h1.animate-pop");
  if (heroTitle) {
    // Add staggered text animation
    const text = heroTitle.textContent;
    heroTitle.innerHTML = text.split('').map((char, i) => 
      `<span style="display: inline-block; animation: popIn 0.8s ease-out ${i * 0.1}s both;">${char}</span>`
    ).join('');
    
    // Add pop-in animation
    const popStyles = document.createElement('style');
    popStyles.textContent = `
      @keyframes popIn {
        0% {
          opacity: 0;
          transform: scale(0.3) translateY(50px);
        }
        50% {
          transform: scale(1.1) translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(popStyles);
  }

  // =====================================================
  // 7. Enhanced Button Interactions
  // =====================================================
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // =====================================================
  // 8. Parallax Effects for Hero Section
  // =====================================================
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.page-hero');
    
    if (hero && scrolled < hero.offsetHeight) {
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });

  // =====================================================
  // 9. Loading Screen (if exists)
  // =====================================================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    });
  }

  // =====================================================
  // 10. Enhanced Mobile Menu Integration
  // =====================================================
  // Ensure mobile menu works smoothly
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      this.classList.toggle('active');
    });
  }
});