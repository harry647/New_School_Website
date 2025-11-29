// languages.js – Full Featured Languages Department
let DATA = { subjects: [], teachers: [], resources: [] };
let POLL = {}; // store poll votes
let FORUM_POSTS = []; // store forum posts
let RSVP_EVENTS = {}; // track event RSVPs

// Check login
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }
    document.getElementById("mainContent").classList.remove("d-none");

    fetch("/static/languages/data/languages-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;

        // Initialize Poll votes for subjects
        POLL = Object.fromEntries(DATA.subjects.map(s => [s.name, 0]));
        // Initialize RSVP status
        DATA.events?.forEach(ev => RSVP_EVENTS[ev.title] = false);

        loadSubjects();
        loadTeachers();
        loadResources();
        renderPoll();
        renderPollResults();
        setupFileUpload();
        renderForum();
        renderEvents();
      });

    // Filters
    document.getElementById("sessionFilter").addEventListener("change", applyFilters);
    document.getElementById("languageFilter").addEventListener("change", applyFilters);
  });
});

// Load Subjects
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = DATA.subjects.map(s => `
    <div class="col-md-6 col-lg-4">
      <div class="subject-card p-5 text-center h-100">
        ${s.flag ? `<img src="${s.flag}" class="lang-flag mb-4" alt="${s.name}">` : ''}
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p class="text-muted small">${s.levels || ''}</p>
        <p>${s.description}</p>
      </div>
    </div>
  `).join("");
}

// Load Teachers
function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  grid.innerHTML = DATA.teachers.map(t => `
    <div class="col-md-6 col-lg-4">
      <div class="teacher-card text-center p-4">
        <img src="${t.photo}" class="rounded-circle mb-3" width="120" alt="${t.name}">
        <h4 class="fw-bold">${t.name}</h4>
        <p class="text-muted">${t.languages.join(" • ")}</p>
        <small>${t.email}</small>
      </div>
    </div>
  `).join("");
}

// Load Resources
function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4">
        <i class="fas ${r.icon || 'fa-file-pdf'} fa-3x mb-3" style="color:${r.color || '#d9534f'}"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">By: ${r.uploadedBy} • ${r.date}</p>
        <a href="${r.url}" class="btn btn-outline-danger btn-sm" target="_blank">Download</a>
      </div>
    </div>
  `).join("");
}

// File Upload
function setupFileUpload() {
  document.getElementById("fileUpload").onchange = e => {
    const files = e.target.files;
    if (!files.length) return;
    alert(`Uploading ${files.length} language file(s)...`);
    // Future: implement actual upload to server
  };
}

// Poll / Quiz
function renderPoll() {
  const pollDiv = document.getElementById("pollOptions");
  pollDiv.innerHTML = DATA.subjects.map(s => `
    <button class="btn btn-outline-primary m-1" onclick="votePoll('${s.name}')">${s.name}</button>
  `).join("");
}

function votePoll(subject) {
  POLL[subject] = (POLL[subject] || 0) + 1;
  renderPollResults();
}

function renderPollResults() {
  const resultsDiv = document.getElementById("pollResults");
  resultsDiv.innerHTML = Object.entries(POLL).map(([sub, count]) => `
    <div>${sub}: ${count} vote(s)</div>
  `).join("");
}

// Forum
function postForum() {
  const text = document.getElementById("forumPost").value.trim();
  if (!text) return alert("Please write something first.");
  const post = {
    user: "Student",
    time: new Date().toLocaleString(),
    text
  };
  FORUM_POSTS.unshift(post);
  renderForum();
  document.getElementById("forumPost").value = "";
}

function renderForum() {
  const postsDiv = document.getElementById("forumPosts");
  postsDiv.innerHTML = FORUM_POSTS.map(p => `
    <div class="glass-card p-4 mb-4">
      <p class="mb-2"><strong>${p.user}</strong> <small class="text-muted">– ${p.time}</small></p>
      <p>${p.text.replace(/\n/g, "<br>")}</p>
    </div>
  `).join("");
}

// Events RSVP
function renderEvents() {
  const ul = document.getElementById("announcements").querySelector("ul");
  ul.innerHTML = DATA.events?.map(ev => `
    <li>
      <i class="fas ${ev.icon || 'fa-calendar'} me-3"></i> ${ev.title} – ${ev.date}
      <button class="btn btn-sm btn-light ms-2" onclick="toggleRSVP('${ev.title}')">
        ${RSVP_EVENTS[ev.title] ? "Cancel RSVP" : "RSVP"}
      </button>
    </li>
  `).join("") || "";
}

function toggleRSVP(title) {
  RSVP_EVENTS[title] = !RSVP_EVENTS[title];
  renderEvents();
}

// Filters
function applyFilters() {
  const session = document.getElementById("sessionFilter").value;
  const language = document.getElementById("languageFilter").value.toLowerCase();

  const filteredSubjects = DATA.subjects.filter(s => {
    const matchesSession = !session || s.session === session;
    const matchesLanguage = !language || s.name.toLowerCase().includes(language);
    return matchesSession && matchesLanguage;
  });

  const grid = document.getElementById("subjectsGrid");
  grid.innerHTML = filteredSubjects.map(s => `
    <div class="col-md-6 col-lg-4">
      <div class="subject-card p-5 text-center h-100">
        ${s.flag ? `<img src="${s.flag}" class="lang-flag mb-4" alt="${s.name}">` : ''}
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p class="text-muted small">${s.levels || ''}</p>
        <p>${s.description}</p>
      </div>
    </div>
  `).join("");
}

// Scroll Helper
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
