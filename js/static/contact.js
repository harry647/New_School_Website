// =======================================================
// contact.js – Bar Union Mixed Secondary School Contact Page
// Fully backend-powered, mobile-first, smooth UX (2025+)
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // =====================================================
  // 1. Contact Form – Submit to YOUR backend (no Formspree)
  // =====================================================
  const form = document.querySelector(".contact-form");
  const submitBtn = form?.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn?.innerHTML || "Send Message";

  if (form) {
    // File preview for uploaded document
    const fileInput = form.querySelector('input[name="attachment"]');
    const preview = document.getElementById("filePreview");

    fileInput?.addEventListener("change", function () {
      preview.innerHTML = "";
      if (this.files && this.files[0]) {
        const file = this.files[0];
        if (file.size > 10 * 1024 * 1024) {
          alert("File too large! Maximum size is 10MB.");
          this.value = "";
          return;
        }
        const div = document.createElement("div");
        div.style.cssText = "margin-top:0.5rem; color:#16a34a; font-weight:500;";
        div.innerHTML = `<i class="fas fa-paperclip"></i> ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)`;
        preview.appendChild(div);
      }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous errors
      document.querySelectorAll(".form-error").forEach(el => el.remove());
      form.querySelectorAll("input, select, textarea").forEach(f => f.style.borderColor = "");

      // Basic validation
      const name = form.name.value.trim();
      const email = form._replyto.value.trim();
      const phone = form.phone.value.trim();
      const subject = form.subject.value;
      const message = form.message.value.trim();

      if (!name || !email || !phone || !subject || !message) {
        showError("Please fill in all required fields.");
        return;
      }

      // Kenyan phone validation
      const phoneRegex = /^(\+254|0)[71]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        showError("Please enter a valid Kenyan phone number (e.g. 0712 345 678 or +254712345678)");
        form.phone.focus();
        return;
      }

      // Show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Message...`;

      try {
        const formData = new FormData(form);

        const response = await fetch("/api/contact", {
          method: "POST",
          body: formData,
          headers: { "Accept": "application/json" }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // SUCCESS – Beautiful thank you
          form.innerHTML = `
            <div style="
              text-align:center; padding:3rem 2rem; background:#d4edda;
              border-radius:16px; color:#0f5132; line-height:1.7;
            ">
              <i class="fas fa-check-circle fa-5x mb-4" style="color:#28a745;"></i>
              <h2 style="color:#166534; margin:1rem 0;">Message Sent Successfully!</h2>
              <p style="font-size:1.1rem;">
                Thank you, <strong>${name}</strong>!
              </p>
              <p>We have received your message regarding "<strong>${subject}</strong>".</p>
              <p>
                Our team will get back to you within <strong>24 hours</strong> via 
                <strong>${phone}</strong> or <strong>${email}</strong>.
              </p>
              <p style="margin-top:2rem; font-weight:600; color:#166534;">
                Bar Union Mixed Secondary School – Always Here for You
              </p>
            </div>
          `;
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (err) {
        console.error("Contact form error:", err);
        showError(`
          Unable to send your message right now.<br><br>
          Please try again or contact us directly:<br>
          <strong>Phone:</strong> +254 700 735 472<br>
          <strong>Email:</strong> barunionsecondary@gmail.com
        `);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  function showError(msg) {
    const div = document.createElement("div");
    div.className = "form-error";
    div.style.cssText = `
      background:#fdf2f2; color:#c33; padding:1.2rem; border-radius:8px;
      border-left:5px solid #e74c3c;
      margin:1.5rem 0; text-align:center; font-weight:500;
    `;
    div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${msg}`;
    form.appendChild(div);
  }

  // =====================================================
  // 2. Mobile-Friendly Enhancements
  // =====================================================

  // Make contact grid stack perfectly on mobile
  const contactGrid = document.querySelector(".contact-grid");
  if (contactGrid && window.innerWidth <= 768) {
    contactGrid.style.gridTemplateColumns = "1fr";
  }

  // FAQ Accordion (mobile-first)
  document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) return;

    question.style.cursor = "pointer";
    question.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : "0";
      question.querySelector("i")?.classList.toggle("fa-chevron-down", !isOpen);
      question.querySelector("i")?.classList.toggle("fa-chevron-up", isOpen);
    });

    // Add chevron icon if missing
    if (!question.querySelector("i")) {
      question.innerHTML += ' <i class="fas fa-chevron-down" style="float:right; color:#007bff;"></i>';
    }
  });

  // =====================================================
  // 3. Back to Top Button
  // =====================================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 500);
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // =====================================================
  // 4. Optional: Load Dynamic Stats (FAQ, Stats) from JSON later
  // =====================================================
  // You can later fetch /data/contact-faq.json and /data/contact-stats.json
  // For now, static content is perfect and mobile-ready.

  // =====================================================
  // 5. AOS Refresh on Mobile Resize
  // =====================================================
  window.addEventListener("resize", () => {
    setTimeout(() => AOS.refresh(), 300);
  });
});