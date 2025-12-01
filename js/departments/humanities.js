// humanities.js – Full Featured Humanities Department
let DATA = { subjects: [], teachers: [], resources: [], announcements: [] };
let POLL = {}; // store poll votes

const isLoggedIn = () => localStorage.getItem("userLoggedIn") === "true";

document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    fetch("/static/humanities/data/humanities-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;

        // Initialize poll with all subjects
        POLL = Object.fromEntries(DATA.subjects.map(s => [s.name, 0]));

        loadSubjects();
        loadTeachers();
        loadResources();
        loadAnnouncements();
        setupFileUpload();
        renderPollResults();
      });
  });
});

function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = DATA.subjects.map(s => `
    <div class="col-md-6 col-lg-4">
      <div class="subject-card p-5 text-center h-100">
        <i class="fas ${s.icon} fa-4x mb-4 text-primary"></i>
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p class="text-muted small">Teacher: ${s.teacher}</p>
        <p>${s.description}</p>
        <button onclick="votePoll('${s.name}')" class="btn btn-outline-success btn-sm mt-3">
          Vote for ${s.name}
        </button>
      </div>
    </div>
  `).join("");
}

function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  grid.innerHTML = DATA.teachers.map(t => `
    <div class="col-md-6 col-lg-4">
      <div class="teacher-card text-center p-4">
        <img src="${t.photo}" class="rounded-circle mb-3" width="120" alt="${t.name}">
        <h4 class="fw-bold">${t.name}</h4>
        <p class="text-muted">${t.subjects.join(", ")}</p>
        <small>${t.email}</small>
      </div>
    </div>
  `).join("");
}

function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4">
        <i class="fas fa-file-pdf fa-3x text-danger mb-3"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">By: ${r.uploadedBy} • ${r.date}</p>
        <a href="${r.url}" class="btn btn-outline-primary btn-sm" target="_blank">Download</a>
      </div>
    </div>
  `).join("");
}

function loadAnnouncements() {
  if (!DATA.announcements || !DATA.announcements.length) return;
  const div = document.getElementById("announcements");
  const list = DATA.announcements.map(a => `
    <li><i class="fas ${a.icon} me-3"></i> ${a.text} – ${a.date}</li>
  `).join("");
  div.innerHTML = `<ul class="list-unstyled mb-0 fs-5">${list}</ul>`;
}

function setupFileUpload() {
  document.getElementById("fileUpload").onchange = e => {
    const files = e.target.files;
    if (!files.length) return;
    alert(`Uploading ${files.length} file(s)...`);
    // Future: implement actual upload to server here
  };
}

// Forum / Discussion
function postForum() {
  const text = document.getElementById("forumPost").value.trim();
  if (!text) return alert("Please write something first.");
  
  const posts = document.getElementById("forumPosts");
  posts.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <p class="mb-2"><strong>Student</strong> <small class="text-muted">– just now</small></p>
      <p>${text.replace(/\n/g, "<br>")}</p>
    </div>` + posts.innerHTML;

  document.getElementById("forumPost").value = "";
}

// Poll / Quiz
function votePoll(subject) {
  if (!POLL[subject]) POLL[subject] = 0;
  POLL[subject]++;
  renderPollResults();
}

function renderPollResults() {
  const resultsDiv = document.getElementById("pollResults");
  resultsDiv.innerHTML = Object.entries(POLL).map(([sub, count]) => `
    <div>${sub}: ${count} vote(s)</div>
  `).join("");
}

// Scroll helper
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
