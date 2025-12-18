// =======================================================
// applied-sciences.js – Applied Sciences Department (2026+)
// Fully backend-powered, mobile-responsive, secure uploads
// =======================================================

let DATA = {};
let currentSession = "";

// ==================== AUTH & LOGIN CHECK ====================
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

    // Load all department data from backend
    loadDepartmentData();

    // Setup file upload
    setupFileUpload();

    // Session filter
    document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
      currentSession = e.target.value;
      filterBySession(currentSession);
    });
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadDepartmentData() {
  try {
    const res = await fetch("/api/departments/applied-sciences", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load");

    DATA = await res.json();

    renderAll();
    populateSessionFilter();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load Applied Sciences content. Please try again.", "danger");
  }
}

// Populate session dropdown
function populateSessionFilter() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...DATA.subjects?.map(s => s.session).filter(Boolean) || [],
    ...DATA.resources?.map(r => r.session).filter(Boolean) || [],
    ...DATA.events?.map(e => e.session).filter(Boolean) || []
  ])].sort().reverse();

  sessions.forEach(sess => {
    const opt = document.createElement("option");
    opt.value = sess;
    opt.textContent = sess;
    filter.appendChild(opt);
  });
}

// ==================== RENDER ALL SECTIONS ====================
function renderAll(filteredData = DATA) {
  loadSubjects(filteredData.subjects);
  loadTeachers(filteredData.teachers);
  loadResources(filteredData.resources);
  loadEvents(filteredData.events);
  loadMedia(filteredData.media);
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects(data) {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const subjects = data || [];
  grid.innerHTML = subjects.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No subjects found for this session.</div>`
    : subjects.map(s => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="subject-card p-5 text-center h-100 glass-card shadow-sm">
          <i class="fas ${s.icon || 'fa-flask'} fa-4x mb-4 text-success"></i>
          <h3 class="h5 fw-bold">${s.name}</h3>
          <p class="text-muted small mb-2">Teacher: ${s.teacher}</p>
          <p class="mb-3">${s.description}</p>
          <span class="badge bg-info">${s.session || 'All Years'}</span>
        </div>
      </div>
    `).join("");
}

function loadTeachers(data) {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  const teachers = data || [];
  grid.innerHTML = teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : teachers.map(t => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="teacher-card text-center p-4 glass-card">
          <img src="${t.photo || '/assets/images/defaults/teacher.png'}"
               class="rounded-circle mb-3 shadow lazy"
               width="140" height="140" alt="${t.name}"
               loading="lazy"
               data-src="${t.photo || '/assets/images/defaults/teacher.png'}">
          <h4 class="fw-bold">${t.name}</h4>
          <p class="text-muted mb-1">${t.subjects?.join(" • ") || "Applied Sciences"}</p>
          <p class="small text-primary">${t.email}</p>
        </div>
      </div>
    `).join("");

  // Initialize lazy loading
  initializeLazyLoading();
}

function loadResources(data) {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  const resources = data || [];
  grid.innerHTML = resources.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources uploaded yet.</div>`
    : resources.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="resource-card p-4 glass-card h-100">
          <i class="fas ${getFileIcon(r.type)} fa-3x mb-3" style="color:${r.color || '#28a745'}"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-success btn-sm w-100 mt-2" download>
            Download ${r.type === 'video' ? 'Video' : 'File'}
          </a>
        </div>
      </div>
    `).join("");
}

function loadEvents(data) {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;

  const events = data || [];
  grid.innerHTML = events.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No upcoming events.</div>`
    : events.map(e => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="event-card p-4 glass-card text-white" style="background:#1a5d57;">
          <h5 class="fw-bold">${e.title}</h5>
          <p class="small opacity-90 mb-2">
            ${new Date(e.date).toLocaleDateString('en-KE', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </p>
          ${e.time ? `<p class="small opacity-90"><i class="far fa-clock"></i> ${e.time}</p>` : ''}
          ${e.location ? `<p class="small opacity-90"><i class="fas fa-map-marker-alt"></i> ${e.location}</p>` : ''}
          <p class="mt-3">${e.description}</p>
        </div>
      </div>
    `).join("");
}

function loadMedia(data) {
  const grid = document.getElementById("mediaGrid");
  if (!grid) return;

  const media = data || [];
  grid.innerHTML = media.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No media uploaded yet.</div>`
    : media.map(m => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="media-card glass-card overflow-hidden">
          ${m.type === 'video'
            ? `<video controls class="w-100" poster="${m.thumbnail || ''}">
                 <source src="${m.url}" type="video/mp4">
                 Your browser does not support video.
               </video>`
            : `<img src="${m.url}" class="img-fluid" alt="${m.title}" loading="lazy">`
          }
          <div class="p-3">
            <h5>${m.title}</h5>
            <p class="text-muted small mb-0">By: ${m.uploadedBy} • ${formatDate(m.date)}</p>
          </div>
        </div>
      </div>
    `).join("");
}

// ==================== SESSION FILTERING ====================
function filterBySession(session) {
  if (!session) {
    renderAll();
    return;
  }

  const filtered = {
    subjects: DATA.subjects?.filter(s => !s.session || s.session === session) || [],
    teachers: DATA.teachers || [],
    resources: DATA.resources?.filter(r => !r.session || r.session === session) || [],
    events: DATA.events?.filter(e => !e.session || e.session === session) || [],
    media: DATA.media?.filter(m => !m.session || m.session === session) || []
  };

  renderAll(filtered);
}

// ==================== FILE UPLOAD (Lab Reports, Projects) ====================
function setupFileUpload() {
  const input = document.getElementById("fileUpload");
  if (!input) return;

  input.addEventListener("change", async function () {
    if (this.files.length === 0) return;

    const formData = new FormData();
    Array.from(this.files).forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/departments/applied-sciences/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${this.files.length} file(s) successfully!`, "success");
        this.value = "";
        loadDepartmentData(); // Refresh resources
      } else {
        throw new Error();
      }
    } catch (err) {
      showAlert("Upload failed. Please try again.", "danger");
    }
  });
}

// ==================== UTILITIES ====================
function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    video: "fa-file-video",
    image: "fa-file-image",
    ppt: "fa-file-powerpoint"
  };
  return icons[type] || "fa-file-alt";
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

// ==================== LAZY LOADING ====================
function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
}