// =======================================================
// sciences.js – Full Science Department System (2026+)
// Backend-powered, file upload, achievements carousel, session filter
// =======================================================

let DATA = { teachers: [], achievements: [], resources: [], competitions: [] };
let currentSession = "";

// ==================== AUTH ====================
async function isLoggedIn() {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include' // Include session cookies
    });
    const data = await response.json();
    return data.success === true;
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
          <img src="${t.photo || '/assets/images/defaults/teacher.png'}" 
               class="teacher-image mb-4 shadow" width="140" height="140" alt="${t.name}">
          <h4 class="teacher-name mb-2">${t.name}</h4>
          <p class="teacher-subject mb-2">${t.subject}</p>
          <div class="dept-badge ${t.dept} mb-3">${t.dept}</div>
          <p class="small text-muted mb-1"><i class="fas fa-envelope"></i> ${t.email || 'N/A'}</p>
          <p class="small text-muted mb-1"><i class="fas fa-graduation-cap"></i> ${t.qualification || 'N/A'}</p>
          <p class="small text-muted"><i class="fas fa-clock"></i> ${t.experience || 'N/A'} experience</p>
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
          <div class="achievement-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <h3 class="achievement-title">${a.title}</h3>
          <p class="achievement-student">${a.student}</p>
          <p class="achievement-event">${a.event} • ${a.year || a.session}</p>
          <p class="achievement-description mb-4">${a.description || ''}</p>
          ${a.photo ? `
            <div class="mt-4">
              <a href="${a.photo}" data-fancybox="achievements" class="d-inline-block">
                <img src="${a.photo}" class="img-fluid rounded shadow" alt="Achievement" style="max-height: 200px;">
              </a>
            </div>
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
        <div class="resource-card p-4 text-center glass-card shadow-sm">
          <div class="resource-icon">
            <i class="fas ${getFileIcon(r.type)}"></i>
          </div>
          <h5 class="resource-title">${r.title}</h5>
          <p class="resource-meta">
            <i class="fas fa-user"></i> ${r.uploadedBy} • 
            <i class="fas fa-calendar"></i> ${formatDate(r.date)}
          </p>
          ${r.size ? `<p class="small text-muted"><i class="fas fa-file"></i> ${r.size}</p>` : ''}
          <p class="mb-3 small">${r.description}</p>
          <a href="${r.url}" class="btn btn-success btn-sm w-100" download>
            <i class="fas fa-download"></i> Download ${r.type ? r.type.toUpperCase() : 'File'}
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
    : filtered.map(c => {
        const eventDate = new Date(c.date);
        const deadlineDate = c.registration_deadline ? new Date(c.registration_deadline) : null;
        const isUpcoming = eventDate > new Date();
        const isRegistrationOpen = deadlineDate ? (deadlineDate > new Date()) : true;
        
        return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="competition-card p-5 text-center glass-card shadow-sm">
            <i class="competition-icon fas fa-flask"></i>
            <h5 class="competition-title">${c.name}</h5>
            <p class="competition-date mb-2">
              <i class="fas fa-calendar"></i> ${eventDate.toLocaleDateString('en-KE', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
            <p class="text-muted small mb-2">
              <i class="fas fa-map-marker-alt"></i> ${c.location}
            </p>
            <p class="mb-3">${c.description}</p>
            
            ${c.prizes ? `
              <div class="mb-3">
                <small class="text-success fw-bold">
                  <i class="fas fa-trophy"></i> ${c.prizes}
                </small>
              </div>
            ` : ''}
            
            ${c.registration_deadline ? `
              <div class="mb-3">
                <small class="text-${isRegistrationOpen ? 'warning' : 'danger'}">
                  <i class="fas fa-clock"></i> Register by: ${deadlineDate.toLocaleDateString('en-KE')}
                </small>
              </div>
            ` : ''}
            
            ${c.requirements ? `
              <div class="mb-3">
                <small class="text-muted">
                  <i class="fas fa-info-circle"></i> ${c.requirements}
                </small>
              </div>
            ` : ''}
            
            <button class="btn btn-warning btn-sm w-100 ${!isRegistrationOpen ? 'disabled' : ''}" 
                    ${!isRegistrationOpen ? 'disabled' : ''}>
              ${isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
            </button>
          </div>
        </div>
        `;
      }).join("");
}

// ==================== FILE UPLOADS ====================
function setupFileUploads() {
  const labUpload = document.getElementById("uploadFile");
  const studentUpload = document.getElementById("studentUpload");

  // Lab photos/reports upload (for teachers/admins)
  if (labUpload) {
    labUpload.addEventListener("change", async function () {
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
  }

  // Student assignment submissions
  if (studentUpload) {
    studentUpload.addEventListener("change", async function () {
      if (this.files.length === 0) return;

      const assignmentTitle = prompt("Enter assignment title:");
      const subject = prompt("Enter subject (Physics/Chemistry/Biology/Environmental Science):");
      const description = prompt("Enter assignment description (optional):");

      if (!assignmentTitle || !subject) {
        showAlert("Assignment title and subject are required.", "warning");
        this.value = "";
        return;
      }

      const formData = new FormData();
      Array.from(this.files).forEach(file => {
        formData.append("files", file);
      });
      formData.append("assignmentTitle", assignmentTitle);
      formData.append("subject", subject);
      formData.append("description", description || "");

      try {
        const res = await fetch("/api/departments/science/submit", {
          method: "POST",
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          showAlert(result.message || "Assignment submitted successfully!", "success");
          this.value = "";
          loadScienceData(); // Refresh
        } else {
          showAlert(result.message || "Submission failed.", "danger");
        }
      } catch (err) {
        console.error('Submission error:', err);
        showAlert("Submission failed. Please try again.", "danger");
      }
    });
  }
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