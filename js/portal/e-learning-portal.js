// =======================================================
// e-learning-portal.js – Full E-Learning System (2026+)
// Teachers: Upload videos, PDFs, images, quizzes
// Students: View, download, submit assignments
// Fully backend-powered (no Formspree)
// =======================================================

let DATA = {};
let currentRole = "student";

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

    // Load all portal data
    loadPortalData();
    setupTeacherUpload();
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadPortalData() {
  try {
    const res = await fetch("/api/elearning/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load data");

    DATA = await res.json();

    loadSubjects();
    loadResources();
    loadQuizzes();
    loadForum();
    loadProgress();
    loadMedia();
    loadNotifications();
  } catch (err) {
    console.error("Data load error:", err);
    showAlert("Unable to load portal data. Please refresh.", "danger");
  }
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
          ? `<video controls class="w-100" poster="${m.thumbnail || ''}">
               <source src="${m.url}" type="video/mp4">
               Your browser does not support video.
             </video>`
          : `<img src="${m.url}" class="img-fluid" alt="${m.title}" loading="lazy">`
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

    try {
      const res = await fetch("/api/elearning/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showAlert("Resource uploaded successfully!", "success");
        this.reset();
        fileList.innerHTML = "";
        loadPortalData(); // Refresh content
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      showAlert("Upload failed. Please try again.", "danger");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
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

// Placeholder functions
function openCourse(id) { alert(`Opening course ID: ${id}`); }
function startQuiz(id) { alert(`Starting quiz ID: ${id}`); }
function viewThread(id) { alert(`Viewing thread ID: ${id}`); }