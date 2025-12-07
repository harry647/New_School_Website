// =======================================================
// languages.js – Professional Languages Department System
// Backend-powered, dual filtering, file upload, forum, poll, RSVP
// =======================================================

let DATA = { subjects: [], teachers: [], resources: [], events: [] };
let POLL = {};
let FORUM_POSTS = [];
let RSVP_EVENTS = {};
let currentSession = "";
let currentLanguage = "";
let isLoading = false;

// ==================== AUTH ====================
async function isLoggedIn() {
  try {
    // Check if user session exists by trying to access profile
    const response = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include'
    });
    return response.ok;
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
  if (isLoading) return;
  isLoading = true;

  try {
    showLoading(true);
    const res = await fetch("/api/departments/languages", { 
      cache: "no-store",
      credentials: 'include'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Validate data structure
    if (!data.subjects || !Array.isArray(data.subjects)) {
      throw new Error("Invalid data structure: missing subjects array");
    }

    DATA = {
      subjects: data.subjects || [],
      teachers: data.teachers || [],
      resources: data.resources || [],
      events: data.events || []
    };

    // Initialize poll data
    POLL = {};
    DATA.subjects.forEach(s => {
      POLL[s.name] = 0;
    });

    // Initialize RSVP events
    RSVP_EVENTS = {};
    DATA.events?.forEach(ev => {
      RSVP_EVENTS[ev.title] = false;
    });

    renderAll();
    populateFilters();
    showAlert("Languages content loaded successfully!", "success");
  } catch (err) {
    console.error("Load error:", err);
    showAlert(`Unable to load Languages content: ${err.message}`, "danger");
    renderErrorState();
  } finally {
    isLoading = false;
    showLoading(false);
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
          <i class="fas ${getFileIcon(r.type || 'document')} fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">By: ${r.uploadedBy || 'Unknown'} • ${formatDate(r.date)}</p>
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
  if (!subject || !POLL.hasOwnProperty(subject)) {
    showAlert("Invalid subject selection.", "warning");
    return;
  }

  POLL[subject] = (POLL[subject] || 0) + 1;

  // Send to backend
  fetch("/api/departments/languages/poll", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Credentials": "include"
    },
    body: JSON.stringify({ subject }),
    credentials: 'include'
  }).catch(err => {
    console.error("Poll vote error:", err);
    // Don't show error to user for poll failures, just log it
  });

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
  
  if (!text) {
    showAlert("Please write something before posting.", "warning");
    return;
  }

  if (text.length > 1000) {
    showAlert("Post is too long. Maximum 1000 characters allowed.", "warning");
    return;
  }

  try {
    showLoading(true);
    const res = await fetch("/api/departments/languages/forum", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Credentials": "include"
      },
      body: JSON.stringify({ text }),
      credentials: 'include'
    });

    const result = await res.json();

    if (res.ok && result.success) {
      textarea.value = "";
      showAlert("Posted successfully!", "success");
      await loadForumPosts();
    } else {
      throw new Error(result.message || "Failed to post");
    }
  } catch (err) {
    console.error("Forum post error:", err);
    showAlert(`Failed to post: ${err.message}`, "danger");
  } finally {
    showLoading(false);
  }
}

async function loadForumPosts() {
  const container = document.getElementById("forumPosts");
  if (!container) return;

  try {
    const res = await fetch("/api/departments/languages/forum", {
      credentials: 'include'
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const posts = await res.json();
    
    if (!Array.isArray(posts)) {
      throw new Error("Invalid posts data format");
    }

    container.innerHTML = posts.length === 0
      ? `<p class="text-center text-muted py-5">
           <i class="fas fa-comments fa-3x mb-3"></i><br>
           No posts yet. Start the conversation!
         </p>`
      : posts.map(p => `
        <div class="glass-card p-4 mb-4 rounded-3 forum-card">
          <p class="mb-2">
            <strong class="forum-author">Student</strong>
            <small class="forum-timestamp">– ${formatDate(p.timestamp)}</small>
          </p>
          <p class="forum-content">${escapeHtml(p.text).replace(/\n/g, "<br>")}</p>
        </div>
      `).join("");
      
  } catch (err) {
    console.error("Load forum posts error:", err);
    container.innerHTML = `<p class="text-danger text-center py-5">
      <i class="fas fa-exclamation-triangle fa-2x mb-3"></i><br>
      Failed to load posts. Please try again.
    </p>`;
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

    // Validate files
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'audio/', 'video/', 'image/',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (const file of this.files) {
      if (file.size > maxSize) {
        showAlert(`File "${file.name}" is too large. Maximum size is 50MB.`, "warning");
        this.value = "";
        return;
      }

      const isAllowed = allowedTypes.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        showAlert(`File "${file.name}" type is not allowed.`, "warning");
        this.value = "";
        return;
      }
    }

    const formData = new FormData();
    Array.from(this.files).forEach(file => formData.append("files", file));

    try {
      showLoading(true);
      const res = await fetch("/api/departments/languages/upload", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        showAlert(`Successfully uploaded ${this.files.length} file(s)!`, "success");
        this.value = "";
        await loadLanguagesData(); // Refresh
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showAlert(`Upload failed: ${err.message}`, "danger");
      this.value = "";
    } finally {
      showLoading(false);
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

// ==================== UTILITY FUNCTIONS ====================
function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If it's not a valid date, return as is (might be like "Nov 2025")
      return dateString;
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

function getFileIcon(type) {
  const icons = {
    'audio': 'fa-file-audio',
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'video': 'fa-file-video',
    'image': 'fa-file-image',
    'document': 'fa-file-alt'
  };
  return icons[type] || icons['document'];
}

function showLoading(show) {
  const mainContent = document.getElementById("mainContent");
  if (!mainContent) return;

  if (show) {
    mainContent.style.opacity = '0.6';
    mainContent.style.pointerEvents = 'none';
    
    // Add loading spinner if not exists
    if (!document.getElementById('loadingSpinner')) {
      const spinner = document.createElement('div');
      spinner.id = 'loadingSpinner';
      spinner.className = 'position-fixed top-50 start-50 translate-middle';
      spinner.style.cssText = 'z-index: 9999;';
      spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      document.body.appendChild(spinner);
    }
  } else {
    mainContent.style.opacity = '1';
    mainContent.style.pointerEvents = 'auto';
    
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.remove();
    }
  }
}

function renderErrorState() {
  const subjectsGrid = document.getElementById("subjectsGrid");
  const teachersGrid = document.getElementById("teachersGrid");
  const resourcesGrid = document.getElementById("resourcesGrid");
  const announcements = document.getElementById("announcements");

  if (subjectsGrid) {
    subjectsGrid.innerHTML = `<div class="col-12 text-center py-5 text-danger">
      <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
      <p>Failed to load subjects. Please refresh the page.</p>
    </div>`;
  }

  if (teachersGrid) {
    teachersGrid.innerHTML = `<div class="col-12 text-center py-5 text-danger">
      <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
      <p>Failed to load teachers. Please refresh the page.</p>
    </div>`;
  }

  if (resourcesGrid) {
    resourcesGrid.innerHTML = `<div class="col-12 text-center py-5 text-danger">
      <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
      <p>Failed to load resources. Please refresh the page.</p>
    </div>`;
  }

  if (announcements) {
    announcements.innerHTML = `<p class="text-center text-danger py-5">
      <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
      Failed to load events. Please refresh the page.
    </p>`;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}