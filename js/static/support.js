// =======================================================
// support.js – Support & Utilities Page (2026+)
// Fully responsive, donation form with backend, smooth UX
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ========================================
  // 1. DONATION FORM – Submit to YOUR backend
  // ========================================
  const donationForm = document.getElementById("donationForm");
  const fileInput = document.getElementById("pledgeDoc");
  const filePreview = document.getElementById("filePreview");

  if (donationForm) {
    // Live file preview
    fileInput?.addEventListener("change", function () {
      filePreview.innerHTML = "";
      const file = this.files[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        alert("File too large! Maximum 10MB allowed.");
        this.value = "";
        return;
      }

      filePreview.innerHTML = `
        <div class="text-green-600 font-medium flex items-center gap-2 mt-2">
          <i class="fas fa-paperclip"></i>
          <span>${file.name}</span>
          <small>(${(file.size / 1024 / 1024).toFixed(1)} MB)</small>
        </div>
      `;
    });

    // Submit donation
    donationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Processing Donation...`;

      try {
        const formData = new FormData(donationForm);

        const response = await fetch("/api/donate", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // SUCCESS – Beautiful thank you
          donationForm.innerHTML = `
            <div style="text-align:center; padding:4rem 2rem; background:#d4edda; border-radius:16px; color:#0f5132; line-height:1.8;">
              <i class="fas fa-heart fa-5x mb-4" style="color:#e91e63;"></i>
              <h2 style="color:#166534; margin:1rem 0;">Thank You for Your Kindness!</h2>
              <p style="font-size:1.2rem;">
                Dear <strong>${formData.get("donor_name") || "Generous Donor"}</strong>,
              </p>
              <p>
                Your donation of <strong>Ksh ${formData.get("amount")}</strong> for 
                <strong>"${formData.get("purpose")}"</strong> has been recorded.
              </p>
              <p>
                We will send M-Pesa Till Number / Bank details to your phone and email within minutes.
              </p>
              <p style="margin-top:2rem; font-weight:600; color:#c2185b;">
                Your support transforms lives at Bar Union Mixed Secondary School
              </p>
              <p class="mt-4 text-sm">A receipt will be emailed to you once payment is confirmed.</p>
            </div>
          `;
        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (err) {
        console.error("Donation error:", err);
        alert("Unable to process donation. Please try again or call +254 700 735 472");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }

  // ========================================
  // 2. RESPONSIVE UTILITIES GRID (Mobile Stacking)
  // ========================================
  const utilitiesGrid = document.querySelector(".utilities-grid");
  const quickGrid = document.querySelector(".quick-access-grid");

  function makeGridsResponsive() {
    if (window.innerWidth <= 768) {
      utilitiesGrid?.style.setProperty("grid-template-columns", "1fr");
      quickGrid?.style.setProperty("grid-template-columns", "1fr");
    } else {
      utilitiesGrid?.style.removeProperty("grid-template-columns");
      quickGrid?.style.removeProperty("grid-template-columns");
    }
  }

  makeGridsResponsive();
  window.addEventListener("resize", makeGridsResponsive);

  // ========================================
  // 3. DOWNLOADS GRID – Hover effect + mobile touch
  // ========================================
  document.querySelectorAll(".download-item").forEach(item => {
    item.addEventListener("click", function (e) {
      // Optional: Add analytics or confirmation later
    });

    // Mobile touch feedback
    item.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)";
    });
    item.addEventListener("touchend", function () {
      this.style.transform = "";
    });
  });

  // ========================================
  // 4. SUPPORT CONTACT CARDS – Mobile accordion (optional enhancement)
  // ========================================
  if (window.innerWidth <= 640) {
    document.querySelectorAll(".support-item").forEach(card => {
      const header = card.querySelector("div");
      if (!header) return;

      const content = document.createElement("div");
      content.className = "support-content";
      content.innerHTML = card.querySelector(".support-desc").outerHTML;
      card.querySelector(".support-desc").remove();
      card.appendChild(content);

      header.style.cursor = "pointer";
      header.addEventListener("click", () => {
        card.classList.toggle("open");
      });
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
  // 6. BACK TO TOP BUTTON (Optional – add if you have one)
  // ========================================
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 600);
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});