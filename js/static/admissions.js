// =======================================================
// admissions.js – Full Admissions Page (2025–2026+)
// Enhanced, Animated, Backend-Powered, Mobile-Perfect
// =======================================================

document.addEventListener("DOMContentLoaded", async function () {
  "use strict";

  // =====================================================
  // 1. Fetch Dynamic Admissions Data (Dates, Fees, Pathways)
  // =====================================================
  const datesList = document.getElementById("datesList");
  const feeTableBody = document.getElementById("feeTableBody");
  const gradeSelect = document.querySelector('select[name="grade"]');
  const feeBrochureLink = document.getElementById("feeBrochureLink");

  try {
    const res = await fetch("/data/static/admissions-data.json?t=" + Date.now(), {
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();

      // Key Dates
      if (datesList && data.dates?.length) {
        datesList.innerHTML = "";
        data.dates.forEach((date, i) => {
          const li = document.createElement("li");
          li.className = "fade-in";
          li.style.animationDelay = `${i * 100}ms`;
          li.innerHTML = `<strong>${date.label}:</strong> ${date.value}`;
          datesList.appendChild(li);
        });
      }

      // Fee Structure
      if (feeTableBody && data.fees?.length) {
        feeTableBody.innerHTML = "";
        data.fees.forEach((fee, i) => {
          const tr = document.createElement("tr");
          tr.className = "fade-in";
          tr.style.animationDelay = `${i * 100}ms`;
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
        // Clear existing options except first
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
  }

  // =====================================================
  // 2. Smooth Scroll for Anchor Links (with header offset)
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = 90; // Adjust if your header height changes
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: "smooth"
      });

      // Update URL without page jump
      history.pushState(null, null, href);
    });
  });

  // =====================================================
  // 3. Timeline Step Modal (Clickable Cards)
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

  document.querySelectorAll(".timeline-item").forEach(item => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      const title = item.querySelector("h3")?.innerText || "Admission Step";
      const desc = item.querySelector("p")?.innerHTML || "No details available.";

      document.getElementById("modalBody").innerHTML = `
        <h3>${title}</h3>
        <div style="margin-top:1rem; line-height:1.8; color:#555;">${desc}</div>
      `;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Close modal
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
  // 4. FULLY BACKEND-POWERED APPLICATION FORM
  // =====================================================
  const form = document.querySelector(".admission-form");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn?.innerHTML || "Submit Application";

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Reset previous errors
      document.querySelectorAll(".form-error").forEach(el => el.remove());
      form.querySelectorAll("input, select, textarea").forEach(field => {
        field.style.borderColor = "";
      });

      // Client-side validation
      const requiredFields = form.querySelectorAll("[required]");
      let hasError = false;

      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = "#e74c3c";
          hasError = true;
        }
      });

      const phoneField = form.phone;
      const phoneRegex = /^0[71]\d{8}$/;
      if (phoneField.value && !phoneRegex.test(phoneField.value.replace(/\s/g, ""))) {
        phoneField.style.borderColor = "#e74c3c";
        hasError = true;
      }

      if (hasError) {
        showFormError("Please correct the highlighted fields and try again.");
        return;
      }

      // Submit to YOUR backend
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting Application...`;

      try {
        const response = await fetch("/api/submit-application", {
          method: "POST",
          body: new FormData(form),
          headers: {
            "Accept": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // SUCCESS – Beautiful confirmation
          form.innerHTML = `
            <div style="
              text-align:center;padding:3.5rem 2rem;background:#d4edda;
              border-radius:16px;color:#0f5132;font-family:'Inter',sans-serif;
            ">
              <i class="fas fa-check-circle fa-5x mb-4" style="color:#28a745;"></i>
              <h2 style="color:#166534;margin:1rem 0;">Application Received!</h2>
              <p style="font-size:1.15rem;margin:1rem 0;">
                Thank you, <strong>${form.student_name.value.trim()}</strong>!
              </p>
              <p>Your application for <strong>${form.grade.value}</strong> has been successfully submitted.</p>
              <p>
                Our admissions team will contact you within <strong>24 hours</strong> on<br>
                <strong>${form.phone.value}</strong> and <strong>${form._replyto.value}</strong>
              </p>
              <p style="margin-top:2rem;font-weight:600;color:#166534;">
                Welcome to Bar Union Mixed Secondary School — We're excited to meet you!
              </p>
            </div>
          `;
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
      }
    });
  }

  function showFormError(message) {
    const error = document.createElement("div");
    error.className = "form-error";
    error.style.cssText = `
      background:#fdf2f2;border-left:5px solid #e74c3c;
      color:#c33;padding:1.2rem;margin:1.5rem 0;border-radius:8px;
      text-align:center;font-weight:500;
    `;
    error.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    form.appendChild(error);
  }

  // =====================================================
  // 5. Scroll Fade-In Animations (Beautiful on Mobile Too)
  // =====================================================
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".fade-in, .card, .requirement-card, .timeline-item").forEach(el => {
    el.classList.add("fade-in"); // ensure class exists
    observer.observe(el);
  });

  // =====================================================
  // 6. Hero Title Animation
  // =====================================================
  const heroTitle = document.querySelector("h1.animate-pop");
  if (heroTitle) {
    heroTitle.classList.add("popped");
  }
});