// =======================================================
// sciences.js – Full Science Department System (2026+)
// Backend-powered, file upload, achievements carousel, session filter
// =======================================================

let DATA = { teachers: [], achievements: [], resources: [], competitions: [] };
let currentSession = "";

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
    loadScienceData();

    // Setup file uploads
    setupFileUploads();

    // Session filter
    document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
      currentSession = e.target.value;
      filterBySession(currentSession);
    });
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadScienceData() {
  try {
    const res = await fetch("/api/departments/science", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    renderAll();
    populateSessionFilter();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load Science content. Please try again.", "danger");
  }
}

// Populate session dropdown
function populateSessionFilter() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...DATA.resources.map(r => r.session).filter(Boolean),
    ...DATA.achievements.map(a => a.session).filter(Boolean),
    ...DATA.competitions.map(c => c.session).filter(Boolean)
  ])].sort().reverse();

  sessions.forEach(sess => {
    const opt = document.createElement("option");
    opt.value = sess;
    opt.textContent = sess;
    filter.appendChild(opt);
  });
}

// ==================== RENDER ALL ====================
function renderAll() {
  renderTeachers();
  renderAchievements();
  renderResources();
  renderCompetitions();
}

// ==================== RENDER FUNCTIONS ====================
function renderTeachers() {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  grid.innerHTML = DATA.teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : DATA.teachers.map(t => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="teacher-card text-center p-5 glass-card shadow-sm">
          <img src="${t.photo || '/assets/images/defaults/default-user.png'}"
               class="rounded-circle mb-4 shadow" width="140" height="140" alt="${t.name}">
          <h4 class="fw-bold mb-2">${t.name}</h4>
          <p class="text-muted mb-1">${t.subject}</p>
          <p class="small text-primary">${t.email}</p>
        </div>
      </div>
    `).join("");
}

function renderAchievements() {
  const container = document.getElementById("achievementsGrid");
  if (!container) return;

  const filtered = currentSession
    ? DATA.achievements.filter(a => a.session === currentSession)
    : DATA.achievements;

  container.innerHTML = filtered.length === 0
    ? `<div class="carousel-item active">
        <div class="text-center py-5 text-muted">No achievements this session.</div>
      </div>`
    : filtered.map((a, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="achievement-card p-5 text-center mx-auto" style="max-width:500px;">
          <i class="fas fa-trophy fa-4x text-warning mb-4"></i>
          <h3 class="fw-bold">${a.title}</h3>
          <p class="lead">${a.student}</p>
          <p class="text-muted">${a.event} • ${a.year || a.session}</p>
          <p class="mb-4">${a.description}</p>
          ${a.photo ? `
            <a href="${a.photo}" data-fancybox="achievements">
              <img src="${a.photo}" class="img-fluid rounded shadow" alt="Achievement">
            </a>
          ` : ""}
        </div>
      </div>
    `).join("");

  // Re-init Fancybox
  if (window.Fancybox) {
    Fancybox.bind("[data-fancybox='achievements']");
  }
}

function renderResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  const filtered = currentSession
    ? DATA.resources.filter(r => r.session === currentSession)
    : DATA.resources;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources available.</div>`
    : filtered.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="resource-card p-5 text-center glass-card shadow-sm">
          <i class="fas ${getFileIcon(r.type)} fa-4x mb-4 text-primary"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-success btn-sm w-100" download>
            Download ${r.type === 'video' ? 'Video' : 'File'}
          </a>
        </div>
      </div>
    `).join("");
}

function renderCompetitions() {
  const grid = document.getElementById("competitionsGrid");
  if (!grid) return;

  const filtered = currentSession
    ? DATA.competitions.filter(c => c.session === currentSession)
    : DATA.competitions;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No competitions scheduled.</div>`
    : filtered.map(c => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="competition-card p-5 text-center glass-card shadow-sm">
          <i class="fas fa-flask fa-4x mb-4 text-info"></i>
          <h5 class="fw-bold">${c.name}</h5>
          <p class="mb-2">${new Date(c.date).toLocaleDateString('en-KE', { 
            weekday: 'long', month: 'long', day: 'numeric' 
          })}</p>
          <p class="text-muted small mb-3">${c.location}</p>
          <p>${c.description}</p>
          <button class="btn btn-warning btn-sm w-100">
            Register Now
          </button>
        </div>
      </div>
    `).join("");
}

// ==================== FILE UPLOADS ====================
function setupFileUploads() {
  const labUpload = document.getElementById("uploadFile");
  const studentUpload = document.getElementById("studentUpload");

  [labUpload, studentUpload].forEach(input => {
    if (!input) return;

    input.addEventListener("change", async function () {
      if (this.files.length === 0) return;

      const formData = new FormData();
      Array.from(this.files).forEach(file => {
        formData.append("files", file);
      });
      formData.append("uploadedBy", getCurrentUserName());

      try {
        const res = await fetch("/api/departments/science/upload", {
          method: "POST",
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          showAlert(`Uploaded ${this.files.length} file(s)!`, "success");
          this.value = "";
          loadScienceData(); // Refresh
        }
      } catch (err) {
        showAlert("Upload failed.", "danger");
      }
    });
  });
}

// ==================== SESSION FILTERING ====================
function filterBySession(session) {
  renderAchievements();
  renderResources();
  renderCompetitions();
}

// ==================== UTILITIES ====================
function getCurrentUserName() {
  return localStorage.getItem("userName") || "Student";
}

function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf text-danger",
    doc: "fa-file-word text-primary",
    docx: "fa-file-word text-primary",
    video: "fa-file-video text-success",
    image: "fa-file-image text-info"
  };
  return icons[type] || "fa-file text-secondary";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

// Scroll to section function
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}