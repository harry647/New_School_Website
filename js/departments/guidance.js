// =======================================================
// guidance.js – Full Guidance & Counselling System (2026+)
// Backend-powered, anonymous posting, file upload, appointment booking
// =======================================================

let DATA = { counsellors: [], resources: [] };
let POSTS = [];
let currentSession = "";

// ==================== AUTH ====================
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
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
  try {
    const res = await fetch("/api/guidance/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    renderCounsellors();
    renderResources();
    loadAnonymousPosts();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load counselling content. Please try again.", "danger");
  }
}

// ==================== RENDER COUNSELLORS ====================
function renderCounsellors() {
  const grid = document.getElementById("counsellorsGrid");
  if (!grid) return;

  grid.innerHTML = DATA.counsellors.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No counsellors listed.</div>`
    : DATA.counsellors.map(c => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="counsellor-card text-center p-5 glass-card shadow-sm">
          <img src="${c.photo || '/assets/images/defaults/counsellor.png'}" 
               class="rounded-circle mb-4 shadow" width="150" height="150" alt="${c.name}">
          <h4 class="fw-bold mb-2">${c.name}</h4>
          <p class="text-muted mb-1">${c.title}</p>
          <p class="text-info small mb-3">${c.specialty}</p>
          <button onclick="openAppointment('${c.name}')" 
                  class="btn btn-outline-primary btn-lg w-100">
            Book Session with ${c.name.split(" ")[0]}
          </button>
        </div>
      </div>
    `).join("");
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
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
      name: formData.get("name") || "Anonymous",
      email: formData.get("email"),
      class: formData.get("class"),
      date: formData.get("date"),
      reason: formData.get("reason") || "General counselling"
    };

    try {
      const res = await fetch("/api/guidance/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        showAlert("Appointment request sent! We'll contact you soon.", "success");
        this.reset();
      } else {
        showAlert(result.message || "Failed to book", "danger");
      }
    } catch (err) {
      showAlert("Network error. Try again.", "danger");
    }
  });
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