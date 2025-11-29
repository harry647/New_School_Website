// applied-sciences.js – Full Featured Applied Sciences Department
let DATA = {};

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// DOM Loaded
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
    } else {
      document.getElementById("mainContent").classList.remove("d-none");

      // Load JSON data
      fetch("/static/applied-sciences/data/applied-sciences-data.json")
        .then(r => r.json())
        .then(data => {
          DATA = data;
          renderAll();
        });

      // Handle file uploads
      const fileUpload = document.getElementById("fileUpload");
      if (fileUpload) {
        fileUpload.addEventListener("change", e => {
          alert(`Uploading ${e.target.files.length} file(s) to Applied Sciences...`);
          fileUpload.value = ""; // reset input
        });
      }

      // Handle session filtering
      const sessionFilter = document.getElementById("sessionFilter");
      if (sessionFilter) {
        sessionFilter.addEventListener("change", e => filterBySession(e.target.value));
      }
    }
  });
});

// Render all grids
function renderAll() {
  loadSubjects();
  loadTeachers();
  loadResources();
  loadEvents();
  loadMedia();
}

// Load Subjects Grid
function loadSubjects(filteredData) {
  const grid = document.getElementById("subjectsGrid");
  const subjects = filteredData?.subjects || DATA.subjects || [];
  grid.innerHTML = subjects.map(s => `
    <div class="col-md-6 col-lg-4">
      <div class="subject-card p-5 text-center h-100 glass-card">
        <i class="fas ${s.icon} fa-4x mb-4 text-success"></i>
        <h3 class="h5 fw-bold">${s.name}</h3>
        <p class="text-muted small">Teacher: ${s.teacher}</p>
        <p>${s.description}</p>
      </div>
    </div>
  `).join("");
}

// Load Teachers Grid
function loadTeachers(filteredData) {
  const grid = document.getElementById("teachersGrid");
  const teachers = filteredData?.teachers || DATA.teachers || [];
  grid.innerHTML = teachers.map(t => `
    <div class="col-md-6 col-lg-4">
      <div class="teacher-card text-center p-4 glass-card">
        <img src="${t.photo}" class="rounded-circle mb-3" width="120" alt="${t.name}">
        <h4 class="fw-bold">${t.name}</h4>
        <p class="text-muted">${t.subjects.join(", ")}</p>
        <small>${t.email}</small>
      </div>
    </div>
  `).join("");
}

// Load Resources Grid
function loadResources(filteredData) {
  const grid = document.getElementById("resourcesGrid");
  const resources = filteredData?.resources || DATA.resources || [];
  grid.innerHTML = resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4 glass-card">
        <i class="fas ${r.icon} fa-3x mb-3" style="color:${r.color}"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">By: ${r.uploadedBy} • ${r.date}</p>
        <a href="${r.url}" class="btn btn-outline-success btn-sm w-100">Download</a>
      </div>
    </div>
  `).join("");
}

// Load Events / Announcements Grid
function loadEvents(filteredData) {
  const grid = document.getElementById("events");
  const events = filteredData?.events || DATA.events || [];
  grid.innerHTML = events.map(e => `
    <div class="event-card p-4 glass-card text-white mb-3" style="background:${e.color || '#1a5d57'}">
      <h5>${e.title}</h5>
      <p class="small">${e.date}</p>
      <p>${e.description}</p>
    </div>
  `).join("");
}

// Load Media / Gallery
function loadMedia(filteredData) {
  const grid = document.getElementById("mediaGrid");
  const media = filteredData?.media || DATA.media || [];
  grid.innerHTML = media.map(m => `
    <div class="col-md-6 col-lg-4">
      <div class="media-card p-4 glass-card">
        <img src="${m.url}" class="img-fluid mb-3 rounded" alt="${m.title}">
        <h5>${m.title}</h5>
        <p class="text-muted small">By: ${m.uploadedBy} • ${m.date}</p>
      </div>
    </div>
  `).join("");
}

// Session filter logic
function filterBySession(session) {
  if(!session) {
    renderAll(); // show all if no session selected
    return;
  }

  // Filter by session (example: filter subjects/resources/events/media)
  const filteredData = {
    subjects: DATA.subjects.filter(s => !s.session || s.session === session),
    teachers: DATA.teachers, // assuming teachers do not change per session
    resources: DATA.resources.filter(r => !r.session || r.session === session),
    events: DATA.events.filter(e => !e.session || e.session === session),
    media: DATA.media.filter(m => !m.session || m.session === session)
  };

  loadSubjects(filteredData);
  loadTeachers(filteredData);
  loadResources(filteredData);
  loadEvents(filteredData);
  loadMedia(filteredData);
}
