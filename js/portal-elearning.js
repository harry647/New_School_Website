// elearning.js – Full Featured E-Learning System
let DATA = {};
let currentRole = "student";

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// Switch between student and teacher roles
function setRole(role) {
  currentRole = role;
  document.getElementById("roleStudent").classList.toggle("active", role === "student");
  document.getElementById("roleTeacher").classList.toggle("active", role === "teacher");
  document.getElementById("teacherPanel").classList.toggle("d-none", role !== "teacher");
}

// Scroll to section
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // Load data JSON
    fetch("/static/elearning/data/elearning-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;
        loadSubjects();
        loadResources();
        loadQuizzes();
        loadForum();
        loadProgress();
        loadMedia();
        loadNotifications();
      });

    // Handle teacher upload form
    const uploadForm = document.getElementById("uploadForm");
    if(uploadForm){
      uploadForm.addEventListener("submit", e => {
        e.preventDefault();
        alert("Resource uploaded successfully!");
        uploadForm.reset();
      });
    }
  });
});

// Load Subjects
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = DATA.subjects.map(s => `
    <div class="col-md-6 col-lg-4">
      <div class="subject-card p-5 text-center h-100 glass-card">
        <i class="fas ${s.icon} fa-4x mb-4 text-primary"></i>
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p>${s.lessons} Lessons • ${s.quizzes} Quizzes</p>
        <button onclick="alert('Opening ${s.name} course...')" class="btn btn-outline-primary mt-3">Enter Course</button>
      </div>
    </div>
  `).join("");
}

// Load Learning Resources
function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4 glass-card">
        <i class="fas ${r.icon} fa-3x mb-3" style="color:${r.color}"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">By: ${r.teacher} • ${r.date}</p>
        <a href="${r.url}" class="btn btn-outline-primary btn-sm w-100">Open Resource</a>
      </div>
    </div>
  `).join("");
}

// Load Quizzes & Assignments
function loadQuizzes() {
  const grid = document.getElementById("quizGrid");
  grid.innerHTML = DATA.quizzes.map(q => `
    <div class="col-md-6 col-lg-4">
      <div class="quiz-card p-4 glass-card">
        <h5>${q.title}</h5>
        <p class="text-muted small">Subject: ${q.subject} • Due: ${q.dueDate}</p>
        <button onclick="alert('Opening quiz: ${q.title}')" class="btn btn-outline-success w-100">Attempt Quiz</button>
      </div>
    </div>
  `).join("");
}

// Load Discussion / Q&A Forum
function loadForum() {
  const grid = document.getElementById("forumGrid");
  grid.innerHTML = DATA.forum.map(f => `
    <div class="col-md-6 col-lg-4">
      <div class="forum-card p-4 glass-card">
        <h5>${f.topic}</h5>
        <p class="text-muted small">Posted by: ${f.user} • ${f.date}</p>
        <button onclick="alert('Viewing thread: ${f.topic}')" class="btn btn-outline-info w-100">View Thread</button>
      </div>
    </div>
  `).join("");
}

// Load Progress Dashboard
function loadProgress() {
  const grid = document.getElementById("progressGrid");
  grid.innerHTML = DATA.progress.map(p => `
    <div class="col-md-6 col-lg-4">
      <div class="progress-card p-4 glass-card">
        <h5>${p.course}</h5>
        <div class="progress mb-2">
          <div class="progress-bar" role="progressbar" style="width: ${p.percent}%" aria-valuenow="${p.percent}" aria-valuemin="0" aria-valuemax="100">${p.percent}%</div>
        </div>
        <p class="small text-muted">${p.lessonsCompleted}/${p.totalLessons} Lessons Completed</p>
      </div>
    </div>
  `).join("");
}

// Load Media / Lesson Gallery
function loadMedia() {
  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = DATA.media.map(m => `
    <div class="col-md-6 col-lg-4">
      <div class="media-card p-4 glass-card">
        <img src="${m.url}" class="img-fluid mb-3 rounded" alt="${m.title}">
        <h5>${m.title}</h5>
        <p class="text-muted small">By: ${m.teacher} • ${m.date}</p>
      </div>
    </div>
  `).join("");
}

// Load Notifications / Announcements
function loadNotifications() {
  const list = document.getElementById("notificationList");
  list.innerHTML = DATA.notifications.map(n => `
    <a href="${n.link}" class="list-group-item list-group-item-action glass-card mb-2">
      <strong>${n.title}</strong> - <small class="text-muted">${n.date}</small>
      <p class="mb-0">${n.message}</p>
    </a>
  `).join("");
}
