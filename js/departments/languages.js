// =======================================================
// languages.js – Full Languages Department System (2026+)
// Backend-powered, dual filtering, audio upload, forum, poll, RSVP
// =======================================================

let DATA = { subjects: [], teachers: [], resources: [], events: [] };
let POLL = {};
let FORUM_POSTS = [];
let RSVP_EVENTS = {};
let currentSession = "";
let currentLanguage = "";

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
    loadLanguagesData();

    // Setup file upload
    setupFileUpload();

    // Setup forum
    setupForum();

    // Filters
    document.getElementById("sessionFilter")?.addEventListener("change", applyFilters);
    document.getElementById("languageFilter")?.addEventListener("change", applyFilters);
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadLanguagesData() {
  try {
    const res = await fetch("/api/departments/languages", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    // Initialize poll & RSVP
    POLL = Object.fromEntries(DATA.subjects.map(s => [s.name, 0]));
    DATA.events?.forEach(ev => RSVP_EVENTS[ev.title] = false);

    renderAll();
    populateFilters();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load Languages content. Please try again.", "danger");
  }
}

// Populate filter dropdowns
function populateFilters() {
  const sessionFilter = document.getElementById("sessionFilter");
  const langFilter = document.getElementById("languageFilter");

  if (!sessionFilter || !langFilter) return;

  // Sessions
  const sessions = [...new Set([
    ...DATA.subjects.map(s => s.session).filter(Boolean),
    ...DATA.resources.map(r => r.session).filter(Boolean)
  ])].sort().reverse();

  sessions.forEach(sess => {
    const opt = document.createElement("option");
    opt.value = sess;
    opt.textContent = sess;
    sessionFilter.appendChild(opt);
  });

  // Languages
  DATA.subjects.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    langFilter.appendChild(opt);
  });
}

// ==================== RENDER ALL ====================
function renderAll() {
  loadSubjects();
  loadTeachers();
  loadResources();
  loadEvents();
  renderPoll();
  renderForum();
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const filtered = DATA.subjects.filter(s => {
    const sessionMatch = !currentSession || s.session === currentSession;
    const langMatch = !currentLanguage || s.name === currentLanguage;
    return sessionMatch && langMatch;
  });

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No subjects match your filters.</div>`
    : filtered.map(s => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="subject-card p-5 text-center h-100 glass-card shadow-sm">
          ${s.flag ? `<img src="${s.flag}" class="lang-flag mb-4" alt="${s.name}">` : ''}
          <h3 class="h5 fw-bold">${s.name}</h3>
          <p class="text-muted small mb-2">${s.levels || 'All Levels'}</p>
          <p class="mb-4">${s.description}</p>
          <button onclick="votePoll('${s.name}')" 
                  class="btn btn-outline-warning btn-sm w-100">
            Vote for ${s.name}
          </button>
        </div>
      </div>
    `).join("");
}

function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  grid.innerHTML = DATA.teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : DATA.teachers.map(t => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="teacher-card text-center p-5 glass-card shadow-sm">
          <img src="${t.photo || '/assets/images/defaults/teacher.png'}" 
               class="rounded-circle mb-4 shadow" width="140" height="140" alt="${t.name}">
          <h4 class="fw-bold mb-2">${t.name}</h4>
          <p class="text-muted mb-1">${t.languages?.join(" • ") || "Languages"}</p>
          <p class="small text-primary">${t.email}</p>
        </div>
      </div>
    `).join("");
}

function loadResources() {
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
          <i class="fas ${getFileIcon(r.type)} fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-primary btn-sm w-100" download>
            Download ${r.type === 'audio' ? 'Audio' : 'File'}
          </a>
        </div>
      </div>
    `).join("");
}

function loadEvents() {
  const container = document.getElementById("announcements");
  if (!container) return;

  const filtered = currentSession
    ? DATA.events?.filter(e => e.session === currentSession) || []
    : DATA.events || [];

  container.innerHTML = filtered.length === 0
    ? `<p class="text-center text-white-50 py-5">No upcoming events.</p>`
    : `<ul class="list-unstyled mb-0 fs-5">
      ${filtered.map(ev => `
        <li class="mb-3">
          <i class="fas ${ev.icon || 'fa-calendar'} me-3 text-warning"></i>
          ${ev.title} — ${ev.date}
          <button class="btn btn-sm btn-light ms-3" onclick="toggleRSVP('${ev.title}')">
            ${RSVP_EVENTS[ev.title] ? 'Cancel RSVP' : 'RSVP'}
          </button>
        </li>
      `).join("")}
    </ul>`;
}

// ==================== POLL ====================
function renderPoll() {
  const container = document.getElementById("pollOptions");
  if (!container) return;

  container.innerHTML = DATA.subjects.map(s => `
    <button class="btn btn-outline-warning m-2 px-4" onclick="votePoll('${s.name}')">
      ${s.name}
    </button>
  `).join("");
}

function votePoll(subject) {
  POLL[subject] = (POLL[subject] || 0) + 1;

  fetch("/api/departments/languages/poll", {
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
    .map(([lang, votes]) => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${lang}</span>
        <span class="fw-bold">${votes} vote${votes !== 1 ? 's' : ''}</span>
      </div>
      <div class="progress mb-3" style="height:20px;">
        <div class="progress-bar bg-warning" style="width:${(votes/total*100)}%">
          ${Math.round(votes/total*100)}%
        </div>
      </div>
    `).join("");
}

// ==================== FORUM ====================
async function setupForum() {
  const textarea = document.getElementById("forumPost");
  const container = document.getElementById("forumPosts");

  if (!textarea || !container) return;

  // Load posts
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
  if (!text) return showAlert("Write something first.", "warning");

  try {
    const res = await fetch("/api/departments/languages/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      textarea.value = "";
      showAlert("Posted!", "success");
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
    const res = await fetch("/api/departments/languages/forum");
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

// ==================== RSVP ====================
function toggleRSVP(title) {
  RSVP_EVENTS[title] = !RSVP_EVENTS[title];
  loadEvents();
  showAlert(RSVP_EVENTS[title] ? "RSVP confirmed!" : "RSVP cancelled", "info");
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
      const res = await fetch("/api/departments/languages/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${this.files.length} file(s)!`, "success");
        this.value = "";
        loadLanguagesData(); // Refresh
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== FILTERS ====================
function applyFilters() {
  currentSession = document.getElementById("sessionFilter")?.value || "";
  currentLanguage = document.getElementById("languageFilter")?.value || "";

  loadSubjects();
  loadResources();
  loadEvents();
}

// ==================== UTILITIES ====================
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
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