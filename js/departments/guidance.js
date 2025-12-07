// =======================================================
// guidance.js – Professional Guidance & Counselling System (2026+)
// Optimized for performance, accessibility, and user experience
// =======================================================

let DATA = { counsellors: [], resources: [] };
let POSTS = [];
let currentSession = "";
let isLoading = false;

// Performance optimization: Debounce function for rapid user actions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ==================== AUTH ====================
async function isLoggedIn() {
  try {
    const response = await fetch('/auth/check', {
      method: 'GET',
      credentials: 'include' // Include session cookies
    });
    const data = await response.json();
    return data.loggedIn === true;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", async () => {
  w3.includeHTML(async () => {
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // Load all data from backend
    loadGuidanceData();

    // Setup file upload
    setupResourceUpload();

    // Setup anonymous posting
    setupAnonymousPost();

    // Setup appointment form
    setupAppointmentForm();
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadGuidanceData() {
  if (isLoading) return; // Prevent multiple simultaneous requests
  isLoading = true;

  // Show loading state
  const loadingEl = document.getElementById("loadingState");
  if (loadingEl) loadingEl.style.display = "block";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch("/api/guidance/data", { 
      cache: "no-store",
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const responseData = await res.json();
    
    // Validate response data structure
    if (responseData && typeof responseData === 'object') {
      DATA = {
        counsellors: Array.isArray(responseData.counsellors) ? responseData.counsellors : [],
        resources: Array.isArray(responseData.resources) ? responseData.resources : []
      };
    } else {
      throw new Error('Invalid data format received');
    }

    renderCounsellors();
    renderResources();
    loadAnonymousPosts();
    
  } catch (err) {
    console.error("Load error:", err);
    const errorMessage = err.name === 'AbortError' 
      ? "Request timed out. Please check your connection and try again."
      : "Unable to load counselling content. Please refresh the page.";
    showAlert(errorMessage, "danger");
  } finally {
    // Hide loading state
    if (loadingEl) loadingEl.style.display = "none";
    isLoading = false;
  }
}

// ==================== RENDER COUNSELLORS ====================
function renderCounsellors() {
  const grid = document.getElementById("counsellorsGrid");
  if (!grid) return;

  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();

  if (DATA.counsellors.length === 0) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "col-12 text-center py-5 text-muted";
    emptyDiv.innerHTML = `
      <i class="fas fa-user-friends fa-3x mb-3 text-muted"></i>
      <p class="lead">No counsellors currently listed.</p>
      <p class="text-muted">Please contact the school office for assistance.</p>
    `;
    fragment.appendChild(emptyDiv);
  } else {
    DATA.counsellors.forEach(c => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-md-6 col-lg-4 mb-4";
      
      const safeName = c.name || 'Unknown Counsellor';
      const safeTitle = c.title || 'School Counsellor';
      const safeSpecialty = c.specialty || 'Student Support';
      const safePhoto = c.photo || '/assets/images/defaults/default-user.png';
      
      colDiv.innerHTML = `
        <article class="counsellor-card text-center p-4 shadow-sm h-100">
          <div class="counsellor-image-container mb-3">
            <img src="${safePhoto}"
                 class="rounded-circle mb-3 shadow-sm"
                 loading="lazy"
                 width="140" height="140" 
                 alt="${safeName} - ${safeTitle}"
                 onerror="this.src='/assets/images/defaults/default-user.png'">
          </div>
          <h4 class="fw-bold mb-2 text-primary">${safeName}</h4>
          <p class="text-muted mb-1 fw-medium">${safeTitle}</p>
          <p class="text-info small mb-3">
            <i class="fas fa-star me-1" aria-hidden="true"></i>${safeSpecialty}
          </p>
          <button onclick="openAppointment('${safeName}')"
                  class="btn btn-outline-primary btn-lg w-100 mt-auto"
                  aria-label="Book a session with ${safeName}">
            <i class="fas fa-calendar-plus me-2" aria-hidden="true"></i>
            Book Session
          </button>
        </article>
      `;

      fragment.appendChild(colDiv);
    });
  }

  // Clear and append in one operation for better performance
  grid.innerHTML = "";
  grid.appendChild(fragment);
}

// ==================== RENDER RESOURCES ====================
function renderResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  grid.innerHTML = DATA.resources.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources available.</div>`
    : DATA.resources.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="resource-card p-5 text-center glass-card shadow-sm">
          <i class="fas ${r.icon || 'fa-heart'} fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">${r.category || 'Wellbeing'}</p>
          <a href="${r.url}" class="btn btn-outline-light btn-sm w-100" download>
            Download Resource
          </a>
        </div>
      </div>
    `).join("");
}

// ==================== ANONYMOUS SUPPORT FORUM ====================
async function setupAnonymousPost() {
  const textarea = document.getElementById("anonymousPost");
  if (!textarea) return;

  textarea.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      await postAnonymously();
    }
  });

  // Load existing posts
  loadAnonymousPosts();
}

async function postAnonymously() {
  const textarea = document.getElementById("anonymousPost");
  const text = textarea.value.trim();

  if (!text) {
    showAlert("Please write something first.", "warning");
    return;
  }

  try {
    const res = await fetch("/api/guidance/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      textarea.value = "";
      showAlert("Posted anonymously. A counsellor will respond privately within 24 hours.", "success");
      loadAnonymousPosts();
    } else {
      throw new Error();
    }
  } catch (err) {
    showAlert("Failed to post. Try again.", "danger");
  }
}

async function loadAnonymousPosts() {
  const container = document.getElementById("anonymousPosts");
  if (!container) return;

  try {
    const res = await fetch("/api/guidance/anonymous");
    const posts = await res.json();

    container.innerHTML = posts.length === 0
      ? `<p class="text-center text-muted py-5">No posts yet. Be the first to share.</p>`
      : posts.map(p => `
        <div class="glass-card p-4 mb-4 rounded-3">
          <p class="mb-2">
            <strong>Anonymous</strong>
            <small class="text-muted">– ${new Date(p.timestamp).toLocaleString()}</small>
          </p>
          <p class="text-white opacity-90 mb-3">${p.text.replace(/\n/g, "<br>")}</p>
          <p class="text-success small">
            <em>A counsellor will respond privately within 24 hours.</em>
          </p>
        </div>
      `).join("");
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load posts.</p>`;
  }
}

// ==================== APPOINTMENT BOOKING ====================
function setupAppointmentForm() {
  const form = document.getElementById("appointmentForm");
  const submitBtn = document.getElementById("submitBtn");
  if (!form || !submitBtn) return;

  // Set minimum date to today
  const dateInput = document.getElementById("appointmentDate");
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener("submit", debounce(async function (e) {
    e.preventDefault();
    
    // Validate form
    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(this);
      const data = {
        name: formData.get("name")?.trim() || "Anonymous",
        email: formData.get("email")?.trim(),
        class: formData.get("class"),
        date: formData.get("date"),
        reason: formData.get("reason")?.trim() || "General counselling"
      };

      // Client-side validation
      if (!data.email || !data.class || !data.date) {
        throw new Error("Please fill in all required fields.");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please enter a valid email address.");
      }

      // Date validation (ensure it's not in the past)
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error("Please select a future date for your appointment.");
      }

      const response = await fetch("/api/guidance/appointment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert("Appointment request sent successfully! We'll contact you soon.", "success");
        this.reset();
        
        // Focus back to first input for better UX
        const firstInput = this.querySelector('input[type="text"]');
        if (firstInput) firstInput.focus();
      } else {
        throw new Error(result.message || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Appointment booking error:", err);
      showAlert(err.message || "Network error. Please try again.", "danger");
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }, 1000)); // Debounce to prevent double submissions
}

function openAppointment(counsellorName) {
  const form = document.getElementById("appointmentForm");
  const nameField = form.querySelector("input[placeholder='Your Name (optional for anonymity)']");
  if (nameField) nameField.value = "";
  form.querySelector("[type='email']").focus();
  scrollToSection("appointment");
  showAlert(`Booking session with ${counsellorName}...`, "info");
}

// ==================== RESOURCE UPLOAD ====================
function setupResourceUpload() {
  const input = document.getElementById("resourceUpload");
  if (!input) return;

  input.addEventListener("change", async function () {
    if (this.files.length === 0) return;

    const formData = new FormData();
    Array.from(this.files).forEach(file => {
      formData.append("resources", file);
    });

    try {
      const res = await fetch("/api/guidance/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${this.files.length} resource(s)!`, "success");
        this.value = "";
        loadGuidanceData(); // Refresh
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== UTILITIES ====================
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width:300px;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 6000);
}