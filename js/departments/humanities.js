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
    try {
      showLoadingState();
      const loggedIn = await isLoggedIn();

      if (!loggedIn) {
        hideLoadingState();
        document.getElementById("loginCheck").classList.remove("d-none");
        return;
      }

      hideLoadingState();
      document.getElementById("mainContent").classList.remove("d-none");

      // Load all data from backend
      await loadHumanitiesData();

      // Setup file upload
      setupFileUpload();

      // Setup forum
      setupForum();

      // Session filter
      document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
        currentSession = e.target.value;
        filterBySession(currentSession);
      });
    } catch (error) {
      console.error('Initialization error:', error);
      hideLoadingState();
      showAlert("Failed to initialize page. Please refresh.", "danger");
    }
  });
});

// ==================== LOADING STATES ====================
function showLoadingState() {
  const mainContent = document.getElementById("mainContent");
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="container py-5">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h3 class="mt-3 text-muted">Loading Humanities Department...</h3>
        </div>
      </div>
    `;
  }
}

function hideLoadingState() {
  // Remove loading spinner when content is ready
  const spinner = document.querySelector('.spinner-border');
  if (spinner) {
    spinner.closest('.text-center')?.remove();
  }
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadHumanitiesData() {
  try {
    showContentLoading(true);
    
    const res = await fetch("/api/departments/humanities", { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format received');
    }

    DATA = {
      subjects: data.subjects || [],
      teachers: data.teachers || [],
      resources: data.resources || [],
      announcements: data.announcements || []
    };

    // Initialize poll from server data if available
    try {
      const pollRes = await fetch("/api/departments/humanities/poll", { method: "GET" });
      if (pollRes.ok) {
        POLL = await pollRes.json();
      } else {
        POLL = {};
        DATA.subjects.forEach(s => POLL[s.name] = 0);
      }
    } catch (pollErr) {
      console.warn('Could not load poll data:', pollErr);
      POLL = {};
      DATA.subjects.forEach(s => POLL[s.name] = 0);
    }

    renderAll();
    populateSessionFilter();
    showContentLoading(false);
    
  } catch (err) {
    console.error("Load error:", err);
    showContentLoading(false);
    showErrorState("Unable to load Humanities content. Please check your connection and try again.");
  }
}

function showContentLoading(isLoading) {
  const grids = ['subjectsGrid', 'teachersGrid', 'resourcesGrid'];
  grids.forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (grid) {
      if (isLoading) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading content...</p>
          </div>
        `;
      }
    }
  });
}

function showErrorState(message) {
  const grids = ['subjectsGrid', 'teachersGrid', 'resourcesGrid'];
  grids.forEach(gridId => {
    const grid = document.getElementById(gridId);
    if (grid) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4 class="text-muted">Oops! Something went wrong</h4>
          <p class="text-muted">${message}</p>
          <button class="btn btn-primary" onclick="loadHumanitiesData()">
            <i class="fas fa-redo me-2"></i>Try Again
          </button>
        </div>
      `;
    }
  });
}

// Populate session dropdown
function populateSessionFilter() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...DATA.subjects.map(s => s.session).filter(Boolean),
    ...DATA.resources.map(r => r.session).filter(Boolean)
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
  loadForum();
  renderPollResults();
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const filtered = currentSession
    ? DATA.subjects.filter(s => s.session === currentSession)
    : DATA.subjects;

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

  grid.innerHTML = DATA.teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : DATA.teachers.map(t => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="teacher-card text-center p-5 glass-card shadow-sm">
          <img src="${t.photo || '/assets/images/defaults/teacher.png'}" 
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

  const filtered = currentSession
    ? DATA.resources.filter(r => r.session === currentSession)
    : DATA.resources;

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
  if (!container || !DATA.announcements?.length) {
    container.innerHTML = `<p class="text-center text-white-50">No announcements.</p>`;
    return;
  }

  container.innerHTML = `
    <ul class="list-unstyled mb-0 fs-5">
      ${DATA.announcements.map(a => `
        <li class="mb-3">
          <i class="fas fa-bullhorn me-3 text-warning"></i>
          ${a.text} — <span class="text-info">${a.date}</span>
        </li>
      `).join("")}
    </ul>
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
  if (!text) {
    showAlert("Please write something first.", "warning");
    return;
  }

  const submitBtn = document.querySelector('button[onclick="postForum()"]');
  const originalText = submitBtn?.innerHTML;
  
  try {
    // Show loading state
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
      submitBtn.disabled = true;
    }

    const res = await fetch("/api/departments/humanities/forum", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
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
      throw new Error(result.message || 'Failed to post');
    }
  } catch (err) {
    console.error('Forum post error:', err);
    showAlert(`Failed to post: ${err.message}`, "danger");
  } finally {
    // Restore button state
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
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

  // Disable all poll buttons temporarily
  const pollButtons = document.querySelectorAll('#pollOptions button');
  pollButtons.forEach(btn => {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Voting...';
  });

  // Save vote to backend
  fetch("/api/departments/humanities/poll", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ subject }),
    credentials: 'include'
  })
  .then(res => res.json())
  .then(result => {
    if (result.success) {
      renderPollResults();
      showAlert(`Voted for ${subject}!`, "success");
    } else {
      throw new Error(result.message || 'Vote failed');
    }
  })
  .catch(err => {
    console.error('Vote error:', err);
    showAlert(`Failed to record vote: ${err.message}`, "danger");
    // Revert the vote on error
    POLL[subject]--;
  })
  .finally(() => {
    // Re-enable poll buttons
    pollButtons.forEach(btn => {
      btn.disabled = false;
      const subjectName = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      btn.innerHTML = subjectName || 'Vote';
    });
  });
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

    // Validate file sizes and types
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                         'application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];

    for (let file of this.files) {
      if (file.size > maxSize) {
        showAlert(`File "${file.name}" is too large. Maximum size is 50MB.`, "warning");
        this.value = "";
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        showAlert(`File "${file.name}" has an unsupported format.`, "warning");
        this.value = "";
        return;
      }
    }

    const formData = new FormData();
    Array.from(this.files).forEach(file => formData.append("files", file));

    // Show upload progress
    const uploadLabel = document.querySelector('label[for="fileUpload"]');
    const originalText = uploadLabel.innerHTML;
    uploadLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    uploadLabel.classList.add('disabled');

    try {
      const res = await fetch("/api/departments/humanities/upload", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      const result = await res.json();
      
      if (res.ok && result.success) {
        showAlert(`Successfully uploaded ${this.files.length} file(s)!`, "success");
        this.value = "";
        // Refresh resources to show new uploads
        setTimeout(() => loadHumanitiesData(), 1000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showAlert(`Upload failed: ${err.message}`, "danger");
    } finally {
      // Restore upload button
      uploadLabel.innerHTML = originalText;
      uploadLabel.classList.remove('disabled');
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
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // Set focus for accessibility
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function showAlert(message, type = "info") {
  // Remove existing alerts to prevent clutter
  const existingAlerts = document.querySelectorAll('.custom-alert');
  existingAlerts.forEach(alert => alert.remove());

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed custom-alert`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; max-width: 400px;";
  alert.setAttribute('role', 'alert');
  alert.setAttribute('aria-live', 'assertive');
  
  const iconMap = {
    'success': 'fas fa-check-circle',
    'danger': 'fas fa-exclamation-circle',
    'warning': 'fas fa-exclamation-triangle',
    'info': 'fas fa-info-circle'
  };

  alert.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="${iconMap[type] || iconMap.info} me-2" aria-hidden="true"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close alert"></button>
    </div>
  `;
  
  document.body.appendChild(alert);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}