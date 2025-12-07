// =======================================================
// co-curriculum.js – Full Co-Curricular Activities System (2026+)
// Backend-powered, session filtering, photo upload, join form, Fancybox
// =======================================================

let ACTIVITIES = [];
let EVENTS = [];
let GALLERY = [];
let COORDINATORS = [];
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
    // Show loading state
    showLoadingState();
    
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      document.getElementById("loginCheck").classList.remove("d-none");
      hideLoadingState();
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");
    hideLoadingState();

    // Load all data from backend
    loadCoCurriculumData();

    // Setup file upload
    setupPhotoUpload();

    // Populate form/class dropdown with Kenyan secondary school forms
    populateFormClass();

    // Session filter
    document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
      currentSession = e.target.value;
      filterBySession(currentSession);
    });
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadCoCurriculumData() {
  try {
    const res = await fetch("/api/cocurriculum/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    ACTIVITIES = data.activities || [];
    EVENTS = data.events || [];
    GALLERY = data.gallery || [];
    COORDINATORS = data.coordinators || [];

    renderAll();
    populateFilters();
    setupJoinForm();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load co-curricular content. Please try again.", "danger");
  }
}

// Populate session dropdown
function populateFilters() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...ACTIVITIES.map(a => a.session).filter(Boolean),
    ...EVENTS.map(e => e.session).filter(Boolean),
    ...GALLERY.map(g => g.session).filter(Boolean)
  ])].sort().reverse();

  sessions.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    filter.appendChild(opt);
  });
}

// ==================== RENDER ALL ====================
function renderAll() {
  loadActivities();
  loadAchievements();
  loadEvents();
  loadGallery();
  loadCoordinators();
  populateActivitySelect();
}

// ==================== RENDER FUNCTIONS ====================
function loadActivities() {
  const grid = document.getElementById("activitiesGrid");
  if (!grid) return;

  const filtered = currentSession
    ? ACTIVITIES.filter(a => a.session === currentSession)
    : ACTIVITIES;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No activities found.</div>`
    : filtered.map(act => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="activity-card p-5 text-center h-100 glass-card shadow-sm">
          <div class="icon-circle mb-4 mx-auto" style="background:${act.color || '#4361ee'};">
            <i class="fas ${act.icon || 'fa-trophy'} fa-3x text-white"></i>
          </div>
          <h3 class="h5 fw-bold mb-3">${act.name}</h3>
          <p class="text-muted small mb-3">${act.category || "Co-Curricular"}</p>
          <p class="mb-4">${act.description}</p>
          <button onclick="scrollToJoinForm('${act.name}')" 
                  class="btn btn-success btn-sm px-4">
            Join ${act.name}
          </button>
        </div>
      </div>
    `).join("");
}

function loadAchievements() {
  const grid = document.getElementById("achievementsGrid");
  if (!grid) return;

  const achievements = ACTIVITIES
    .filter(a => a.achievements?.length)
    .flatMap(a => a.achievements.map(ach => ({ ...ach, activity: a.name })));

  grid.innerHTML = achievements.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No achievements recorded yet.</div>`
    : achievements.map(a => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="glass-card p-4 text-center h-100">
          <i class="fas fa-award fa-3x text-warning mb-3"></i>
          <h5 class="fw-bold">${a.title}</h5>
          <p class="text-muted small">${a.activity} • ${a.year || '2025'}</p>
          <p class="mb-0">${a.description}</p>
        </div>
      </div>
    `).join("");
}

function loadEvents() {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;

  const filtered = currentSession
    ? EVENTS.filter(e => e.session === currentSession)
    : EVENTS;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No upcoming events.</div>`
    : filtered.map(ev => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="glass-card p-4 text-white">
          <h5 class="fw-bold">${ev.title}</h5>
          <p class="small opacity-90 mb-2">
            ${new Date(ev.date).toLocaleDateString('en-KE', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </p>
          ${ev.time ? `<p class="small opacity-90"><i class="far fa-clock"></i> ${ev.time}</p>` : ''}
          ${ev.location ? `<p class="small opacity-90"><i class="fas fa-map-marker-alt"></i> ${ev.location}</p>` : ''}
          <p class="mt-3">${ev.description}</p>
        </div>
      </div>
    `).join("");
}

function loadGallery() {
  const grid = document.getElementById("photoGallery");
  if (!grid) return;

  const filtered = currentSession
    ? GALLERY.filter(g => g.session === currentSession)
    : GALLERY;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No media yet.</div>`
    : filtered.map(g => `
      <div class="col-6 col-md-4 col-lg-3 mb-4">
        <a href="${g.url}" data-fancybox="gallery" data-caption="${g.caption || ''}">
          <img src="${g.url}" class="img-fluid rounded shadow-sm" alt="${g.caption || 'Activity photo'}">
        </a>
      </div>
    `).join("");

  // Re-init Fancybox after load
  if (window.Fancybox) {
    Fancybox.bind("[data-fancybox]", {});
  }
}

function loadCoordinators() {
  const grid = document.getElementById("coordinatorsGrid");
  if (!grid) return;

  grid.innerHTML = COORDINATORS.map(c => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="coordinator-card text-center p-4 glass-card">
        <img src="${c.photo || '/assets/images/defaults/teacher.png'}" 
             class="rounded-circle mb-3 shadow" width="140" height="140" alt="${c.name}">
        <h5 class="fw-bold">${c.name}</h5>
        <p class="text-muted mb-1">${c.role}</p>
        <p class="small text-primary">${c.email || ''}</p>
      </div>
    </div>
  `).join("");
}

// ==================== JOIN FORM ====================
function populateFormClass() {
  const select = document.getElementById("formClass");
  if (!select) return;

  const kenyanForms = [
    { value: "Form 1", label: "Form 1" },
    { value: "Form 2", label: "Form 2" },
    { value: "Form 3", label: "Form 3" },
    { value: "Form 4", label: "Form 4" }
  ];

  select.innerHTML = `<option value="">Select Form/Class</option>` +
    kenyanForms.map(form => `<option value="${form.value}">${form.label}</option>`).join("");
}

function populateActivitySelect() {
  const select = document.getElementById("activitySelect");
  if (!select) return;

  select.innerHTML = `<option value="">Choose Activity</option>` +
    ACTIVITIES.map(a => `<option value="${a.name}">${a.name}</option>`).join("");
}

function scrollToJoinForm(activityName) {
  const select = document.getElementById("activitySelect");
  if (select) select.value = activityName;
  document.getElementById("joinActivityForm").scrollIntoView({ behavior: "smooth" });
}

function setupJoinForm() {
  const form = document.getElementById("joinActivityForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/cocurriculum/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        showAlert("Application submitted! We'll contact you soon.", "success");
        this.reset();
      } else {
        showAlert(result.message || "Failed", "danger");
      }
    } catch (err) {
      showAlert("Network error. Try again.", "danger");
    }
  });
}

// ==================== PHOTO UPLOAD ====================
function setupPhotoUpload() {
  const input = document.getElementById("photoUpload");
  if (!input) return;

  input.addEventListener("change", async function () {
    if (this.files.length === 0) return;

    const formData = new FormData();
    Array.from(this.files).forEach(file => formData.append("photos", file));

    try {
      const res = await fetch("/api/cocurriculum/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${this.files.length} photo(s)!`, "success");
        this.value = "";
        loadCoCurriculumData(); // Refresh gallery
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== FILTER BY SESSION ====================
function filterBySession(session) {
  loadActivities();
  loadEvents();
  loadGallery();
}

// ==================== UTILITIES ====================
function showLoadingState() {
  const loadingHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading co-curricular activities...</p>
    </div>
  `;
  
  const grids = ['activitiesGrid', 'achievementsGrid', 'eventsGrid', 'photoGallery', 'coordinatorsGrid'];
  grids.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = loadingHTML;
  });
}

function hideLoadingState() {
  // Loading will be hidden when data is loaded
}

function showAlert(msg, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; max-width: 400px;";
  alert.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}