// =======================================================
// mathematics.js – Full Mathematics Department System (2026+)
// Backend-powered, file upload, topic tree, tools, charts, forum
// =======================================================

let DATA = { subjects: [], teachers: [], resources: [], competitions: [] };
let currentSession = "";
let currentTopic = "";

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
    loadMathematicsData();

    // Setup file upload
    setupFileUpload();

    // Global search
    document.getElementById("globalSearch")?.addEventListener("input", globalSearch);
    document.getElementById("searchBtn")?.addEventListener("click", () => globalSearch());

    // Session filter
    document.getElementById("sessionFilter")?.addEventListener("change", (e) => {
      currentSession = e.target.value;
      renderAll(getFilteredData()); // Re-render with current filters
    });
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadMathematicsData() {
  try {
    const res = await fetch("/api/departments/mathematics", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    renderAll();
    populateFilters();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load Mathematics content. Please try again.", "danger");
  }
}

// Populate session dropdown
function populateFilters() {
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
function renderAll(dataToRender = DATA) {
  renderTopicTree(dataToRender.subjects);
  renderSubjects(dataToRender.subjects);
  renderTeachers(dataToRender.teachers);
  renderResources(dataToRender.resources);
  renderCompetitions(dataToRender.competitions);
  renderKcseChart(dataToRender.kcseTrend);
  renderTopStudents(dataToRender.topStudents);
  renderProgressSummary(dataToRender.progress);
}

// ==================== TOPIC EXPLORER TREE ====================
function renderTopicTree(subjectsData = DATA.subjects) {
  const container = document.getElementById("topicTree");
  if (!container) return;

  const tree = subjectsData.reduce((acc, s) => {
    const form = s.form || "General";
    if (!acc[form]) acc[form] = [];
    acc[form].push(s);
    return acc;
  }, {});

  let html = "";
  Object.keys(tree).sort().forEach(form => {
    html += `
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#form-${form.replace(/\s+/g, '')}">
            ${form}
          </button>
        </h2>
        <div id="form-${form.replace(/\s+/g, '')}" class="accordion-collapse collapse">
          <div class="accordion-body">
            <ul class="list-group">
              ${tree[form].map(t => `
                <li class="list-group-item list-group-item-action cursor-pointer"
                    onclick="filterByTopic('${t.name}')">
                  ${t.name} <span class="badge bg-primary float-end">${t.topics?.length || 0}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || "<p class='text-muted'>No topics available.</p>";
}

// ==================== SUBJECTS GRID ====================
function renderSubjects(subjectsData = DATA.subjects) {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  // subjectsData is already filtered by session, topic, and search from getFilteredData
  const filtered = subjectsData;

  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No subjects match filters.</div>`
    : filtered.map(s => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="subject-card p-5 text-center h-100 glass-card shadow-sm">
          <i class="fas ${s.icon || 'fa-square-root-alt'} fa-4x mb-4 text-primary"></i>
          <h3 class="h5 fw-bold">${s.name}</h3>
          <p class="text-muted small mb-2">${s.form} • ${s.topics?.length || 0} Topics</p>
          <p class="mb-4">${s.description}</p>
          <button onclick="openTopic('${s.name}')" 
                  class="btn btn-outline-primary btn-sm w-100">
            View Topics
          </button>
        </div>
      </div>
    `).join("");
}

// ==================== TEACHERS GRID ====================
function renderTeachers(teachersData = DATA.teachers) {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  grid.innerHTML = teachersData.map(t => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="teacher-card text-center p-5 glass-card shadow-sm">
        <img src="${t.photo || '/assets/images/defaults/teacher.png'}" 
             class="rounded-circle mb-4 shadow" width="140" height="140" alt="${t.name}">
        <h4 class="fw-bold mb-2">${t.name}</h4>
        <p class="text-muted mb-1">${t.subjects?.join(" • ") || "Mathematics"}</p>
        <p class="small text-primary">${t.email}</p>
        <button onclick="openTeacherProfile(${JSON.stringify(t)})" 
                class="btn btn-outline-primary btn-sm mt-3 w-100">
          View Profile
        </button>
      </div>
    </div>
  `).join("");
}

// ==================== RESOURCES GRID ====================
function renderResources(resourcesData = DATA.resources) {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  const filtered = resourcesData; // resourcesData is already filtered by session and search from getFilteredData
  grid.innerHTML = filtered.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources available.</div>`
    : filtered.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="resource-card p-5 text-center glass-card shadow-sm">
          <i class="fas ${getFileIcon(r.type)} fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold">${r.title}</h5>
          <p class="text-muted small mb-3">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-primary btn-sm w-100" download>
            Download ${r.type === 'video' ? 'Video' : 'File'}
          </a>
        </div>
      </div>
    `).join("");
}

// ==================== COMPETITIONS ====================
function renderCompetitions(competitionsData = DATA.competitions) {
  const container = document.getElementById("competitionsList");
  if (!container) return;

  container.innerHTML = comps.length === 0
    ? `<p class="text-muted">No competitions scheduled.</p>`
    : comps.map(c => `
      <div class="d-flex align-items-center mb-3 p-3 glass-card">
        <div class="me-3">
          <i class="fas fa-trophy fa-2x text-warning"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="mb-1">${c.name}</h6>
          <p class="small text-muted mb-0">${c.date} • ${c.venue}</p>
        </div>
        <button class="btn btn-sm btn-outline-success">Register</button>
      </div>
    `).join("");
}

// ==================== CHARTS & PROGRESS ====================
function renderKcseChart(kcseTrendData = DATA.kcseTrend) {
  const ctx = document.getElementById("kcseChart");
  if (!ctx || !kcseTrendData) return;

  new Chart(ctx.getContext('2d'), { // Get 2D context for Chart.js
    type: 'line',
    data: {
      labels: DATA.kcseTrend.years,
      datasets: [{
        label: 'Mean Score',
        data: DATA.kcseTrend.scores,
        borderColor: '#0b2d5e',
        backgroundColor: 'rgba(11, 45, 94, 0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function renderTopStudents(topStudentsData = DATA.topStudents) {
  const container = document.getElementById("topStudents");
  if (!container || !topStudentsData) return;

  container.innerHTML = topStudentsData.map((s, i) => `
    <div class="d-flex align-items-center mb-3">
      <span class="badge bg-warning me-3 fs-5">#${i+1}</span>
      <div>
        <strong>${s.name}</strong> – ${s.score}/500<br>
        <small class="text-muted">${s.year}</small>
      </div>
    </div>
  `).join("");
}

function renderProgressSummary(progressData = DATA.progress) {
  const container = document.getElementById("progressMini");
  if (!container || !progressData) {
    container.innerHTML = "<p class='text-muted'>No progress data.</p>";
    return;
  }

  container.innerHTML = `
    <div class="progress mb-3" style="height:30px;">
      <div class="progress-bar bg-success" style="width:${DATA.progress.overall}%">
        ${DATA.progress.overall}%
      </div>
    </div>
    <p class="mb-2"><strong>Overall:</strong> ${progressData.overall}%</p>
    <p class="mb-0 small">Topics Mastered: ${progressData.topicsMastered || 0}</p>
  `;
}

// ==================== FILE UPLOAD ====================
function setupFileUpload() {
  const input = document.getElementById("fileUpload");
  if (!input) return;

  input.addEventListener("change", async () => { // Fixed syntax here
    if (input.files.length === 0) return;

    const formData = new FormData();
    Array.from(input.files).forEach(file => formData.append("files", file));

    try {
      const res = await fetch("/api/departments/mathematics/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        showAlert(`Uploaded ${input.files.length} file(s)!`, "success");
        input.value = "";
        loadMathematicsData();
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== GLOBAL SEARCH ====================
function globalSearch() {
  const term = document.getElementById("globalSearch")?.value.toLowerCase() || "";
  if (!term) {
    renderAll();
    return;
  }

  // Search subjects, teachers, resources
  const filtered = {
    subjects: DATA.subjects.filter(s => s.name.toLowerCase().includes(term)),
    teachers: DATA.teachers.filter(t => t.name.toLowerCase().includes(term)),
    resources: DATA.resources.filter(r => r.title.toLowerCase().includes(term))
  };

  renderSubjects(filtered);
  renderTeachers(filtered);
  renderResources(filtered);
}

// ==================== UTILITIES ====================
function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf text-danger",
    doc: "fa-file-word text-primary",
    docx: "fa-file-word text-primary",
    video: "fa-file-video text-success",
    image: "fa-file-image text-info"
  };
  return icons[type] || "fa-file text-secondary";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
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