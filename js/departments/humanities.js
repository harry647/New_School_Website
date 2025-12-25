// =======================================================
// humanities.js – Full Humanities Department System (2026+)
// Backend-powered, session filtering, file upload, forum, poll
// =======================================================

let DATA = { subjects: [], teachers: [], resources: [], announcements: [] };
let POLL = {};
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
    loadHumanitiesData();

    // Setup file upload
    setupFileUpload();

    // Setup forum
    setupForum();

    // Session filter
    document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
      currentSession = e.target.value;
      filterBySession(currentSession);
    });
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadHumanitiesData() {
  try {
    const res = await fetch("/api/departments/humanities", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    // Initialize poll
    POLL = {};
    if (DATA.subjects && Array.isArray(DATA.subjects)) {
      DATA.subjects.forEach(s => POLL[s.name] = 0);
    }

    renderAll();
    populateSessionFilter();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load Humanities content. Please try again.", "danger");
  }
}

// Populate session dropdown
function populateSessionFilter() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...(DATA.subjects ? DATA.subjects.map(s => s.session).filter(Boolean) : []),
    ...(DATA.resources ? DATA.resources.map(r => r.session).filter(Boolean) : [])
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
  loadSubjects();
  loadTeachers();
  loadResources();
  loadAnnouncements();
  loadForumPosts();
  renderPollResults();
  loadEventsCalendar();
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const subjects = DATA.subjects || [];
  const filtered = currentSession
    ? subjects.filter(s => s.session === currentSession)
    : subjects;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No subjects found for this session.</div>`
    : filtered.map(s => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="subject-card p-5 text-center h-100 glass-card shadow-sm">
          <i class="fas ${s.icon || 'fa-book'} fa-4x mb-4 text-primary"></i>
          <h3 class="h5 fw-bold">${s.name}</h3>
          <p class="text-muted small mb-2">Teacher: ${s.teacher}</p>
          <p class="mb-3">${s.description}</p>
          <button onclick="votePoll('${s.name}')"
                  class="btn btn-outline-warning btn-sm mt-3 w-100">
            Vote for ${s.name}
          </button>
        </div>
      </div>
    `).join("");
}

function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  const teachers = DATA.teachers || [];
  grid.innerHTML = teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : teachers.map(t => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="teacher-card text-center p-5 glass-card shadow-sm">
          <img src="${t.photo || '/assets/images/defaults/default-user.jpg'}"
               class="rounded-circle mb-4 shadow" width="140" height="140" alt="${t.name}">
          <h4 class="fw-bold mb-2">${t.name}</h4>
          <p class="text-muted mb-1">${t.subjects?.join(" • ") || "Humanities"}</p>
          <p class="small text-primary">${t.email}</p>
        </div>
      </div>
    `).join("");
}

function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  const resources = DATA.resources || [];
  const filtered = currentSession
    ? resources.filter(r => r.session === currentSession)
    : resources;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources available.</div>`
    : filtered.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="resource-card p-5 text-center glass-card shadow-sm">
          <i class="fas fa-file-pdf fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-primary btn-sm w-100" download>
            Download Resource
          </a>
        </div>
      </div>
    `).join("");
}

function loadAnnouncements() {
  const container = document.getElementById("announcements");
  const announcements = DATA.announcements || [];
  if (!container || announcements.length === 0) {
    container.innerHTML = `<p class="text-center text-white-50">No announcements.</p>`;
    return;
  }

  container.innerHTML = `
    <ul class="list-unstyled mb-0 fs-5">
      ${announcements.map(a => `
        <li class="mb-3">
          <i class="fas fa-bullhorn me-3 text-warning"></i>
          ${a.text} — <span class="text-info">${a.date}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function loadEventsCalendar() {
  const container = document.getElementById("eventsCalendar");
  const events = DATA.events || [];
  if (!container || events.length === 0) {
    container.innerHTML = `<p class="text-center text-white-50">No upcoming events.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="calendar-events">
      ${events.map(event => `
        <div class="event-item mb-3 p-3 bg-white rounded shadow-sm">
          <h5 class="fw-bold mb-1">${event.title}</h5>
          <p class="text-muted mb-1">${new Date(event.date).toLocaleDateString()}</p>
          <p class="mb-0">${event.description}</p>
        </div>
      `).join("")}
    </div>
  `;
}

// ==================== FORUM ====================
async function setupForum() {
  const textarea = document.getElementById("forumPost");
  const container = document.getElementById("forumPosts");

  if (!textarea || !container) return;

  // Load existing posts
  loadForumPosts();

  document.getElementById("forumPost").addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      await postForum();
    }
  });
}

async function postForum() {
  const textarea = document.getElementById("forumPost");
  const text = textarea.value.trim();
  if (!text) return showAlert("Please write something first.", "warning");

  try {
    const res = await fetch("/api/departments/humanities/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      textarea.value = "";
      showAlert("Posted successfully!", "success");
      loadForumPosts();
    }
  } catch (err) {
    showAlert("Failed to post.", "danger");
  }
}

async function loadForumPosts() {
  const container = document.getElementById("forumPosts");
  if (!container) return;

  try {
    const res = await fetch("/api/departments/humanities/forum");
    const posts = await res.json();

    container.innerHTML = posts.length === 0
      ? `<p class="text-center text-muted py-5">No posts yet. Start the conversation!</p>`
      : posts.map(p => `
        <div class="glass-card p-4 mb-4 rounded-3">
          <p class="mb-2">
            <strong>Student</strong>
            <small class="text-muted">– ${new Date(p.timestamp).toLocaleString()}</small>
          </p>
          <p class="text-white opacity-90">${p.text.replace(/\n/g, "<br>")}</p>
        </div>
      `).join("");
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Failed to load posts.</p>`;
  }
}

// ==================== POLL ====================
function votePoll(subject) {
  if (!POLL[subject]) POLL[subject] = 0;
  POLL[subject]++;

  // Save vote to backend
  fetch("/api/departments/humanities/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject })
  }).catch(() => {});

  renderPollResults();
  showAlert(`Voted for ${subject}!`, "success");
}

function renderPollResults() {
  const container = document.getElementById("pollResults");
  if (!container) return;

  const total = Object.values(POLL).reduce((a, b) => a + b, 0);
  if (total === 0) {
    container.innerHTML = `<p class="text-muted">No votes yet. Be the first!</p>`;
    return;
  }

  container.innerHTML = Object.entries(POLL)
    .sort((a, b) => b[1] - a[1])
    .map(([sub, count]) => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${sub}</span>
        <span class="fw-bold">${count} vote${count !== 1 ? 's' : ''} (${Math.round(count/total*100)}%)</span>
      </div>
      <div class="progress mb-3" style="height:20px;">
        <div class="progress-bar bg-warning" style="width:${(count/total*100)}%"></div>
      </div>
    `).join("");
}

// ==================== FILE UPLOAD ====================
function setupFileUpload() {
  const input = document.getElementById("fileUpload");
  if (!input) return;

  input.addEventListener("change", async function () {
    if (this.files.length === 0) return;

    const formData = new FormData();
    Array.from(this.files).forEach(file => formData.append("files", file));

    try {
      const res = await fetch("/api/departments/humanities/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${this.files.length} file(s)!`, "success");
        this.value = "";
        loadHumanitiesData(); // Refresh resources
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== SESSION FILTERING ====================
function filterBySession(session) {
  loadSubjects();
  loadResources();
}

// ==================== UTILITIES ====================
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
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