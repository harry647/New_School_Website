// =======================================================
// e-learning-portal.js – Full E-Learning System (2026+)
// Teachers: Upload videos, PDFs, images, quizzes
// Students: View, download, submit assignments
// Fully backend-powered (no Formspree)
// =======================================================

// Configuration Management
const CONFIG = {
    API_BASE: '/api',
    LOG_LEVEL: 'info', // debug, info, warn, error
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
};

// Logging Utility
const logger = {
    log: (level, message, data = null) => {
        const levels = ['debug', 'info', 'warn', 'error'];
        if (levels.indexOf(CONFIG.LOG_LEVEL) <= levels.indexOf(level)) {
            console[level](`[${new Date().toISOString()}] [E-Learning] ${message}`, data || '');
        }
    },
    debug: (msg, data) => logger.log('debug', msg, data),
    info: (msg, data) => logger.log('info', msg, data),
    warn: (msg, data) => logger.log('warn', msg, data),
    error: (msg, data) => logger.log('error', msg, data)
};

let DATA = {};
let currentRole = "student";
let cache = {};

// ==================== AUTH & ROLE ====================
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

function setRole(role) {
  currentRole = role;
  localStorage.setItem("portalRole", role);

  document.getElementById("roleStudent").classList.toggle("active", role === "student");
  document.getElementById("roleTeacher").classList.toggle("active", role === "teacher");
  document.getElementById("teacherPanel").classList.toggle("d-none", role !== "teacher");
}

// Smooth scroll
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== DOM LOADED ====================
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // Restore saved role
    const savedRole = localStorage.getItem("portalRole") || "student";
    setRole(savedRole);

    // Show loading spinner
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.classList.remove("d-none");

    // Load all portal data
    loadPortalData().finally(() => {
      if (spinner) spinner.classList.add("d-none");
    });

    setupTeacherUpload();
    setupBackToTop();
  });
});

// ==================== BACK TO TOP FUNCTIONALITY ====================
function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Smooth scroll to top
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadPortalData(forceRefresh = false) {
  const cacheKey = 'portalData';
  const now = Date.now();

  // Check cache if not forcing refresh
  if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < CONFIG.CACHE_DURATION) {
    logger.debug('Using cached portal data');
    DATA = cache[cacheKey].data;
    renderAllSections();
    return;
  }

  let attempts = 0;
  while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
    try {
      logger.info(`Fetching portal data (attempt ${attempts + 1})`);
      const res = await fetch(`${CONFIG.API_BASE}/elearning/data`, {
        cache: forceRefresh ? "no-store" : "default",
        headers: { 'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300' }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      DATA = await res.json();

      // Cache the data
      cache[cacheKey] = { data: DATA, timestamp: now };
      logger.info('Portal data loaded successfully');

      renderAllSections();
      return;
    } catch (err) {
      attempts++;
      logger.warn(`Data load attempt ${attempts} failed:`, err.message);

      if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
        logger.error('All data load attempts failed');
        showAlert("Unable to load portal data. Please check your connection and refresh.", "danger");
        // Load from cache if available as fallback
        if (cache[cacheKey]) {
          logger.info('Falling back to cached data');
          DATA = cache[cacheKey].data;
          renderAllSections();
        }
        return;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
    }
  }
}

// Helper to render all sections
function renderAllSections() {
  loadSubjects();
  loadResources();
  loadQuizzes();
  loadForum();
  loadProgress();
  loadMedia();
  loadNotifications();
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid || !DATA.subjects) return;

  grid.innerHTML = DATA.subjects.map(s => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="subject-card p-5 text-center h-100 glass-card shadow-sm">
        <i class="fas ${s.icon || 'fa-book'} fa-4x mb-4 text-primary"></i>
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p class="text-muted">${s.lessons || 0} Lessons • ${s.quizzes || 0} Quizzes</p>
        <button class="btn btn-outline-primary mt-3" onclick="openCourse('${s.id}')">
          Enter Course
        </button>
      </div>
    </div>
  `).join("");
}

function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!grid || !DATA.resources) return;

  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="resource-card p-4 glass-card h-100">
        <i class="fas ${getFileIcon(r.type)} fa-3x mb-3" style="color:${r.color || '#007bff'}"></i>
        <h5 class="fw-bold">${r.title}</h5>
        <p class="text-muted small">By: ${r.teacher} • ${formatDate(r.date)}</p>
        <a href="${r.url}" target="_blank" class="btn btn-outline-primary btn-sm w-100 mt-2">
          ${r.type === 'video' ? 'Watch' : 'Open'} Resource
        </a>
      </div>
    </div>
  `).join("");
}

function loadQuizzes() {
  const grid = document.getElementById("quizGrid");
  if (!grid || !DATA.quizzes) return;

  grid.innerHTML = DATA.quizzes.map(q => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="quiz-card p-4 glass-card">
        <span class="badge bg-${q.due ? 'danger' : 'success'} mb-2">${q.due ? 'Due Soon' : 'Open'}</span>
        <h5>${q.title}</h5>
        <p class="text-muted small">Subject: ${q.subject} • Due: ${q.dueDate || 'No deadline'}</p>
        <button class="btn btn-success w-100" onclick="startQuiz('${q.id}')">
          ${q.submitted ? 'View Results' : 'Start Quiz'}
        </button>
      </div>
    </div>
  `).join("");
}

function loadForum() {
  const grid = document.getElementById("forumGrid");
  if (!grid || !DATA.forum) return;

  grid.innerHTML = DATA.forum.map(f => `
    <div class="col-12 mb-4">
      <div class="forum-card p-4 glass-card">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="mb-1">${f.topic}</h5>
            <p class="text-muted small mb-2">By ${f.user} • ${formatDate(f.date)} • ${f.replies} replies</p>
            <p class="mb-0">${f.preview}</p>
          </div>
          <span class="badge bg-primary">${f.category}</span>
        </div>
        <button class="btn btn-outline-info btn-sm mt-3" onclick="viewThread('${f.id}')">
          View Discussion
        </button>
      </div>
    </div>
  `).join("");
}

function loadProgress() {
  const grid = document.getElementById("progressGrid");
  if (!grid || !DATA.progress) return;

  grid.innerHTML = DATA.progress.map(p => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="progress-card p-4 glass-card">
        <h5>${p.course}</h5>
        <div class="progress mt-3" style="height: 20px;">
          <div class="progress-bar bg-success" style="width: ${p.percent}%">
            ${p.percent}%
          </div>
        </div>
        <p class="small text-muted mt-2">
          ${p.lessonsCompleted}/${p.totalLessons} lessons • ${p.assignments} assignments
        </p>
      </div>
    </div>
  `).join("");
}

function loadMedia() {
  const grid = document.getElementById("mediaGrid");
  if (!grid || !DATA.media) return;

  grid.innerHTML = DATA.media.map(m => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="media-card glass-card overflow-hidden">
        ${m.type === 'video'
          ? `<video controls class="w-100" poster="${m.thumbnail || ''}" preload="metadata">
                <source src="${m.url}" type="video/mp4">
                Your browser does not support video.
              </video>`
          : `<img src="${m.url}" class="img-fluid" alt="${m.title}" loading="lazy" decoding="async">`
        }
        <div class="p-3">
          <h5 class="mb-1">${m.title}</h5>
          <p class="text-muted small mb-0">By: ${m.teacher} • ${formatDate(m.date)}</p>
        </div>
      </div>
    </div>
  `).join("");
}

function loadNotifications() {
  const list = document.getElementById("notificationList");
  if (!list || !DATA.notifications) return;

  list.innerHTML = DATA.notifications.map(n => `
    <div class="list-group-item glass-card mb-3 p-4">
      <div class="d-flex w-100 justify-content-between">
        <h6 class="mb-1 fw-bold">${n.title}</h6>
        <small class="text-muted">${formatDate(n.date)}</small>
      </div>
      <p class="mb-1">${n.message}</p>
      ${n.link ? `<a href="${n.link}" class="btn btn-sm btn-outline-primary">View →</a>` : ''}
    </div>
  `).join("");
}

// ==================== TEACHER UPLOAD SYSTEM ====================
function setupTeacherUpload() {
  const form = document.getElementById("uploadForm");
  const fileInput = form?.querySelector('input[type="file"]');
  const fileList = document.getElementById("fileList");

  if (!form) return;

  // Show selected files
  fileInput?.addEventListener("change", () => {
    fileList.innerHTML = "";
    Array.from(fileInput.files).forEach(file => {
      const div = document.createElement("div");
      div.className = "badge bg-light text-dark me-2 mb-2";
      div.innerHTML = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
      fileList.appendChild(div);
    });
  });

  // Submit upload to backend
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;

    const formData = new FormData(this);

    let attempts = 0;
    while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
      try {
        logger.info(`Uploading files (attempt ${attempts + 1})`);
        const res = await fetch(`${CONFIG.API_BASE}/elearning/upload`, {
          method: "POST",
          body: formData
        });

        let result;
        try {
          result = await res.json();
        } catch (parseErr) {
          logger.error('Failed to parse upload response', parseErr);
          throw new Error('Invalid response from server');
        }

        if (res.ok && result.success) {
          logger.info('Upload successful');
          showAlert("Resource uploaded successfully!", "success");
          this.reset();
          fileList.innerHTML = "";
          loadPortalData(true); // Force refresh content
          return;
        } else {
          throw new Error(result.message || `Upload failed with status ${res.status}`);
        }
      } catch (err) {
        attempts++;
        logger.warn(`Upload attempt ${attempts} failed:`, err.message);

        if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
          logger.error('All upload attempts failed');
          showAlert(`Upload failed after ${CONFIG.MAX_RETRY_ATTEMPTS} attempts. Please try again.`, "danger");
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }
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
    quiz: "fa-question-circle",
    assignment: "fa-tasks"
  };
  return icons[type] || "fa-file-alt";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

// Course and interaction functions
function openCourse(id) {
  logger.info(`Opening course: ${id}`);
  // In a real implementation, this would navigate to the course page
  // For now, show a modal or redirect to a course page
  const course = DATA.subjects?.find(s => s.id === id);
  if (course) {
    showAlert(`Opening ${course.name} course...`, "info");
    // Could redirect to: window.location.href = `/portal/course/${id}`;
  } else {
    showAlert("Course not found.", "warning");
  }
}

function startQuiz(id) {
  logger.info(`Starting quiz: ${id}`);
  const quiz = DATA.quizzes?.find(q => q.id === id);
  if (quiz) {
    showAlert(`Starting ${quiz.title}...`, "info");
    // Could redirect to: window.location.href = `/portal/quiz/${id}`;
  } else {
    showAlert("Quiz not found.", "warning");
  }
}

function viewThread(id) {
  logger.info(`Viewing forum thread: ${id}`);
  const thread = DATA.forum?.find(f => f.id === id);
  if (thread) {
    showAlert(`Opening discussion: ${thread.topic}`, "info");
    // Could redirect to: window.location.href = `/portal/forum/${id}`;
  } else {
    showAlert("Discussion thread not found.", "warning");
  }
}