// =======================================================
// mathematics.js – Full Mathematics Department System (2026+)
// Backend-powered, file upload, topic tree, tools, charts, forum
// =======================================================

let DATA = { 
  subjects: [], 
  teachers: [], 
  resources: [], 
  competitions: [],
  kcseTrend: { years: [], scores: [] },
  topStudents: [],
  progress: { overall: 0, topicsMastered: 0 }
};
let currentSession = "";
let currentTopic = "";
let currentForm = "";

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
      const loggedIn = await isLoggedIn();

      if (!loggedIn) {
        document.getElementById("loginCheck").classList.remove("d-none");
        return;
      }

      document.getElementById("mainContent").classList.remove("d-none");

      // Initialize theme from localStorage
      const savedTheme = localStorage.getItem("math-theme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        const btn = document.getElementById("toggleDark");
        if (btn) {
          btn.innerHTML = '<i class="fas fa-sun"></i> Light';
        }
      }

      // Show loading state
      showLoadingState("subjectsGrid", "Loading mathematics content...");
      showLoadingState("teachersGrid", "Loading teacher profiles...");
      showLoadingState("resourcesGrid", "Loading resources...");

      // Load all data from backend
      await loadMathematicsData();

      // Setup all functionality
      setupFileUpload();
      setupFilters();
      setupUIControls();
      setupPracticeTools();
      setupMathTools();
      setupKeyboardShortcuts();
      setupAccessibility();

      // Start real-time updates
      startRealTimeUpdates();

      // Global search with debouncing
      document.getElementById("globalSearch")?.addEventListener("input", debounce(globalSearch, 300));
      document.getElementById("searchBtn")?.addEventListener("click", () => globalSearch());

      // Cleanup on page unload
      window.addEventListener("beforeunload", stopRealTimeUpdates);

      // Performance monitoring
      performanceMonitor.incrementMetric('apiCalls');
      console.log('Mathematics department initialized successfully');

    } catch (error) {
      handleError(error, 'DOM Ready');
    }
  });
});

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
}

// ==================== KEYBOARD SHORTCUTS ====================
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById("globalSearch");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById("globalSearch");
      if (searchInput && searchInput.value) {
        searchInput.value = "";
        globalSearch();
      }
    }

    // Ctrl/Cmd + R for refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
      e.preventDefault();
      loadMathematicsData();
      showAlert("Data refreshed!", "success");
    }
  });
}

// ==================== PERFORMANCE OPTIMIZATIONS ====================
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTime: 0,
      apiCalls: 0,
      errors: 0
    };
  }

  startTimer(label) {
    this[`${label}Start`] = performance.now();
  }

  endTimer(label) {
    if (this[`${label}Start`]) {
      this.metrics.renderTime = performance.now() - this[`${label}Start`];
      console.log(`${label} took ${this.metrics.renderTime.toFixed(2)}ms`);
    }
  }

  incrementMetric(metric) {
    this.metrics[metric] = (this.metrics[metric] || 0) + 1;
  }

  getReport() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}

const performanceMonitor = new PerformanceMonitor();

// ==================== ACCESSIBILITY ENHANCEMENTS ====================
function setupAccessibility() {
  // Add ARIA labels and roles
  const containers = [
    { id: "subjectsGrid", role: "main", label: "Mathematics subjects and topics" },
    { id: "teachersGrid", role: "main", label: "Mathematics department teachers" },
    { id: "resourcesGrid", role: "main", label: "Mathematics learning resources" },
    { id: "competitionsList", role: "main", label: "Mathematics competitions and events" }
  ];

  containers.forEach(container => {
    const element = document.getElementById(container.id);
    if (element) {
      element.setAttribute("role", container.role);
      element.setAttribute("aria-label", container.label);
    }
  });

  // Focus management for modals
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('shown.bs.modal', () => {
      const firstFocusable = modal.querySelector('input, button, select, textarea');
      if (firstFocusable) firstFocusable.focus();
    });
  });
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadMathematicsData() {
  try {
    const res = await fetch("/api/departments/mathematics", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    const backendData = await res.json();
    
    // Merge backend data with any existing structure
    DATA = {
      ...DATA,
      ...backendData
    };

    // Generate sample data if backend doesn't provide subjects
    if (!DATA.subjects || DATA.subjects.length === 0) {
      generateSampleData();
    }

    renderAll();
    populateFilters();
    
    // Show loading success
    showAlert("Mathematics department data loaded successfully!", "success");
  } catch (err) {
    console.error("Load error:", err);
    
    // Fallback to sample data
    generateSampleData();
    renderAll();
    populateFilters();
    
    showAlert("Using sample data. Please check your connection.", "warning");
  }
}

// Setup filters
function setupFilters() {
  // Session filter
  const sessionFilter = document.getElementById("filterForm");
  if (sessionFilter) {
    sessionFilter.addEventListener("change", (e) => {
      currentSession = e.target.value;
      renderAll(getFilteredData());
    });
  }

  // Topic filter
  const topicFilter = document.getElementById("filterTopic");
  if (topicFilter) {
    topicFilter.addEventListener("change", (e) => {
      currentTopic = e.target.value;
      renderAll(getFilteredData());
    });
  }

  populateFilters();
}

// Populate filter dropdowns
function populateFilters() {
  const topicFilter = document.getElementById("filterTopic");
  if (!topicFilter) return;

  const topics = [...new Set(DATA.subjects.map(s => s.name).filter(Boolean))].sort();
  
  topicFilter.innerHTML = '<option value="">All Topics</option>';
  topics.forEach(topic => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    topicFilter.appendChild(opt);
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

  container.innerHTML = competitionsData.length === 0
    ? `<p class="text-muted">No competitions scheduled.</p>`
    : competitionsData.map(c => `
      <div class="d-flex align-items-center mb-3 p-3 glass-card">
        <div class="me-3">
          <i class="fas fa-trophy fa-2x text-warning"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="mb-1">${c.name}</h6>
          <p class="small text-muted mb-0">${c.year} • ${c.description}</p>
        </div>
        <button class="btn btn-sm btn-outline-success" onclick="registerForCompetition('${c.name}')">Register</button>
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
  const input = document.getElementById("assignmentUpload");
  if (!input) return;

  input.addEventListener("change", async () => {
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
      } else {
        showAlert("Upload failed.", "danger");
      }
    } catch (err) {
      showAlert("Upload failed.", "danger");
    }
  });
}

// ==================== FILTERING ====================
function getFilteredData() {
  let filtered = { ...DATA };

  // Filter by session
  if (currentSession) {
    filtered.subjects = filtered.subjects.filter(s => s.session === currentSession);
    filtered.resources = filtered.resources.filter(r => r.session === currentSession);
  }

  // Filter by topic
  if (currentTopic) {
    filtered.subjects = filtered.subjects.filter(s => s.name === currentTopic);
  }

  return filtered;
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

// ==================== UI CONTROLS ====================
function setupUIControls() {
  // Theme toggle
  const toggleDarkBtn = document.getElementById("toggleDark");
  if (toggleDarkBtn) {
    toggleDarkBtn.addEventListener("click", toggleTheme);
  }

  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadMathematicsData();
      showAlert("Data refreshed successfully!", "success");
    });
  }

  // Bookmarks button
  const bookmarksBtn = document.getElementById("bookmarksBtn");
  if (bookmarksBtn) {
    bookmarksBtn.addEventListener("click", showBookmarks);
  }

  // Ask teacher form
  const askForm = document.getElementById("askForm");
  if (askForm) {
    askForm.addEventListener("submit", handleAskTeacher);
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("math-theme", isDark ? "dark" : "light");
  
  const btn = document.getElementById("toggleDark");
  if (btn) {
    btn.innerHTML = isDark ? 
      '<i class="fas fa-sun"></i> Light' : 
      '<i class="fas fa-moon"></i> Dark';
  }
}

function showBookmarks() {
  showAlert("Bookmarks feature coming soon!", "info");
}

function handleAskTeacher(e) {
  e.preventDefault();
  const question = document.getElementById("askQuestion").value;
  const teacherSelect = document.getElementById("askTeacherSelect").value;
  
  if (!question.trim()) {
    showAlert("Please enter a question", "warning");
    return;
  }

  // Simulate sending question
  showAlert("Question sent to teacher! You'll receive a response soon.", "success");
  document.getElementById("askForm").reset();
}

// ==================== INTERACTIVE FUNCTIONS ====================
function filterByTopic(topic) {
  currentTopic = topic;
  document.getElementById("filterTopic").value = topic;
  renderAll(getFilteredData());
  scrollToSection("subjects");
}

function openTopic(topicName) {
  // Scroll to the topic section
  scrollToSection("topicsPanel");
  filterByTopic(topicName);
}

function openTeacherProfile(teacher) {
  showAlert(`Teacher Profile: ${teacher.name} - ${teacher.role}`, "info");
}

function registerForCompetition(competitionName) {
  showAlert(`Registration for ${competitionName} will open soon!`, "info");
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== PRACTICE TOOLS ====================
function setupPracticeTools() {
  const startPracticeBtn = document.getElementById("startPractice");
  if (startPracticeBtn) {
    startPracticeBtn.addEventListener("click", startPractice);
  }
}

function startPractice() {
  showAlert("Starting practice session...", "info");
  // This would integrate with actual practice questions
  setTimeout(() => {
    showAlert("Practice session ready!", "success");
  }, 1000);
}

// ==================== MATH TOOLS ====================
function setupMathTools() {
  // Quadratic equation solver
  const quadForm = document.getElementById("quadForm");
  if (quadForm) {
    quadForm.addEventListener("submit", solveQuadratic);
  }

  // Graph plotter
  const plotBtn = document.getElementById("plotBtn");
  if (plotBtn) {
    plotBtn.addEventListener("click", plotGraph);
  }
}

function solveQuadratic(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const a = parseFloat(formData.get("a"));
  const b = parseFloat(formData.get("b"));
  const c = parseFloat(formData.get("c"));

  const result = document.getElementById("quadResult");
  if (!a) {
    result.innerHTML = '<div class="alert alert-danger">Coefficient "a" cannot be zero</div>';
    return;
  }

  const discriminant = b*b - 4*a*c;
  let html = '';

  if (discriminant > 0) {
    const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
    html = `<div class="alert alert-success">
      <strong>Two real solutions:</strong><br>
      x₁ = ${x1.toFixed(3)}<br>
      x₂ = ${x2.toFixed(3)}
    </div>`;
  } else if (discriminant === 0) {
    const x = -b / (2*a);
    html = `<div class="alert alert-success">
      <strong>One real solution:</strong><br>
      x = ${x.toFixed(3)}
    </div>`;
  } else {
    const real = -b / (2*a);
    const imaginary = Math.sqrt(-discriminant) / (2*a);
    html = `<div class="alert alert-warning">
      <strong>Complex solutions:</strong><br>
      x₁ = ${real.toFixed(3)} + ${imaginary.toFixed(3)}i<br>
      x₂ = ${real.toFixed(3)} - ${imaginary.toFixed(3)}i
    </div>`;
  }

  result.innerHTML = html;
}

function plotGraph() {
  const expr = document.getElementById("graphExpr").value;
  const canvas = document.getElementById("graphCanvas");
  
  if (!expr) {
    showAlert("Please enter a function to plot", "warning");
    return;
  }

  showAlert(`Plotting: ${expr}`, "info");
  canvas.innerHTML = '<p class="text-muted text-center">Graph plotting feature coming soon...</p>';
}

// ==================== REAL-TIME UPDATES ====================
let updateInterval;

function startRealTimeUpdates() {
  // Update progress and stats every 30 seconds
  updateInterval = setInterval(async () => {
    try {
      await updateProgressData();
    } catch (err) {
      console.log('Real-time update failed:', err);
    }
  }, 30000);
}

async function updateProgressData() {
  // Simulate real-time progress updates
  const randomChange = Math.random() > 0.8 ? (Math.random() - 0.5) * 2 : 0;
  DATA.progress.overall = Math.max(0, Math.min(100, DATA.progress.overall + randomChange));
  
  // Update the progress display
  renderProgressSummary(DATA.progress);
}

function stopRealTimeUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
}

// ==================== PROFESSIONAL UI ENHANCEMENTS ====================
function showLoadingState(containerId, message = "Loading...") {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center py-5">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">${message}</p>
        </div>
      </div>
    `;
  }
}

function showEmptyState(containerId, title, message, icon = "fas fa-info-circle") {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="${icon} fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">${title}</h5>
        <p class="text-muted">${message}</p>
      </div>
    `;
  }
}

// ==================== ENHANCED ERROR HANDLING ====================
class MathDepartmentError extends Error {
  constructor(message, type = 'general') {
    super(message);
    this.name = 'MathDepartmentError';
    this.type = type;
  }
}

function handleError(error, context = '') {
  console.error(`Math Department Error (${context}):`, error);
  
  let userMessage = 'An unexpected error occurred.';
  
  if (error instanceof MathDepartmentError) {
    userMessage = error.message;
  } else if (error.name === 'TypeError') {
    userMessage = 'Data format error. Please refresh the page.';
  } else if (error.name === 'NetworkError') {
    userMessage = 'Network error. Please check your connection.';
  }
  
  showAlert(userMessage, 'danger');
  
  // Log to monitoring service (in production)
  logError(error, context);
}

function logError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context: context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // In production, this would send to a logging service
  console.log('Error logged:', errorLog);
}

// ==================== ENHANCED DATA STRUCTURE ====================
// Generate sample subjects data if not present
function generateSampleData() {
  if (DATA.subjects.length === 0) {
    DATA.subjects = [
      {
        name: "Algebra",
        form: "Form 1",
        description: "Basic algebraic operations and equations",
        topics: ["Linear Equations", "Quadratic Equations", "Simultaneous Equations"],
        icon: "fa-square-root-alt"
      },
      {
        name: "Geometry",
        form: "Form 2",
        description: "Plane and solid geometry concepts",
        topics: ["Triangles", "Circles", "Polygons"],
        icon: "fa-drafting-compass"
      },
      {
        name: "Trigonometry",
        form: "Form 3",
        description: "Trigonometric functions and applications",
        topics: ["Sine and Cosine", "Tangent", "Unit Circle"],
        icon: "fa-wave-square"
      },
      {
        name: "Calculus",
        form: "Form 4",
        description: "Introduction to differential and integral calculus",
        topics: ["Differentiation", "Integration", "Applications"],
        icon: "fa-chart-line"
      }
    ];
  }

  // Add default KCSE trend data
  if (DATA.kcseTrend.years.length === 0) {
    DATA.kcseTrend = {
      years: ["2020", "2021", "2022", "2023", "2024", "2025"],
      scores: [6.8, 7.2, 7.5, 7.8, 8.1, 8.4]
    };
  }

  // Add default top students data
  if (DATA.topStudents.length === 0) {
    DATA.topStudents = [
      { name: "Mary Achieng", score: 98, year: "2024" },
      { name: "John Ochieng", score: 96, year: "2024" },
      { name: "Sarah Wanjiku", score: 94, year: "2023" }
    ];
  }

  // Add default progress data
  if (DATA.progress.overall === 0) {
    DATA.progress = {
      overall: 75,
      topicsMastered: 24
    };
  }
}