// =======================================================
// resources.js – Full School Resources Hub (2026+)
// Backend-powered, upload, preview, search, filters, pagination
// =======================================================

let DATA = { resources: [], featured: [], tags: [], submissions: [] };
let currentRole = "student";
let currentPage = 1;
const PAGE_SIZE = 12;
let filteredResources = [];

// ==================== AUTH ====================
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // LoadAllData();
    setupRoleSwitcher();
    setupUploads();
    setupFilters();
    setupSearch();
    setupQuickUpload();
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function LoadAllData() {
  try {
    const res = await fetch("/api/resources/all", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    DATA = data;

    renderAll();
    updateAnalytics();
    populateTags();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load resources. Please try again.", "danger");
  }
}

// ==================== RENDER ALL ====================
function renderAll() {
  renderFeatured();
  renderResources();
  renderSubmissions();
}

// ==================== FEATURED CAROUSEL ====================
function renderFeatured() {
  const container = document.getElementById("featuredInner");
  if (!container) return;

  container.innerHTML = DATA.featured.length === 0
    ? `<div class="carousel-item active"><div class="glass-card p-5 text-center"><p class="text-muted">No featured resources yet.</p></div></div>`
    : DATA.featured.map((f, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="glass-card p-5 d-flex flex-column flex-md-row gap-4 align-items-center">
          <img src="${f.thumb || '/assets/images/placeholder-doc.png'}" 
               class="d-none d-md-block rounded shadow" style="width:180px;" alt="">
          <div>
            <h3 class="h5 fw-bold text-warning">${f.title}</h3>
            <p class="mb-3 opacity-90">${f.description || ''}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-light btn-sm" onclick="openPreview(${JSON.stringify(f)})">
                Preview
              </button>
              <a href="${f.url}" class="btn btn-primary btn-sm" download>Download</a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
}

// ==================== MAIN RESOURCES GRID ====================
function renderResources() {
  const grid = document.getElementById("resourcesGrid");
  const empty = document.getElementById("resourcesEmpty");
  if (!grid) return;

  filteredResources = applyFilters();
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = filteredResources.slice(start, end);

  if (filteredResources.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    setupPagination(0);
    return;
  }

  empty.hidden = true;
  grid.innerHTML = pageItems.map(r => `
    <div class="col-md-6 col-lg-4">
      <article class="resource-card p-4 h-100 glass-card shadow-sm">
        <div class="d-flex align-items-start gap-3">
          <div class="icon-box rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
               style="width:60px;height:60px;background:#f0f8ff;">
            <i class="fas ${getFileIcon(r.type)} fa-2x text-primary"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="h6 fw-bold mb-1 resource-title">${r.title}</h3>
            <p class="small text-muted mb-2">
              By: ${r.uploadedBy} • ${formatDate(r.date)}
              ${r.subject ? ` • ${r.subject}` : ''}
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-primary btn-sm previewBtn" 
                      onclick="openPreview(${JSON.stringify(r)})">
                Preview
              </button>
              <a href="${r.url}" class="btn btn-success btn-sm" download>
                Download
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  `).join("");

  setupPagination(filteredResources.length);
}

// ==================== SUBMISSIONS LIST ====================
function renderSubmissions() {
  const container = document.getElementById("submissionsList");
  if (!container) return;

  const subs = currentRole === "teacher" || currentRole === "admin"
    ? DATA.submissions
    : DATA.submissions.filter(s => s.uploadedBy === getCurrentUserName());

  container.innerHTML = subs.length === 0
    ? `<p class="text-center text-muted">No submissions yet.</p>`
    : subs.map(s => `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4">
          <h6 class="fw-bold">${s.title || 'Assignment'}</h6>
          <p class="small text-muted mb-2">
            By: ${s.uploadedBy} • ${formatDate(s.date)}
          </p>
          <a href="${s.url}" class="btn btn-sm btn-outline-success" download>
            Download File
          </a>
          ${currentRole !== "student" ? `
            <button class="btn btn-sm btn-primary ms-2" onclick="approveSubmission('${s.id}')">
              Approve
            </button>
          ` : ''}
        </div>
      </div>
    `).join("");
}

// ==================== FILTERS & SEARCH ====================
function applyFilters() {
  const category = document.getElementById("categoryFilter")?.value.toLowerCase() || "";
  const type = document.getElementById("typeFilter")?.value.toLowerCase() || "";
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

  return DATA.resources.filter(r => {
    const matchCat = !category || r.category?.toLowerCase() === category;
    const matchType = !type || r.type?.toLowerCase() === type;
    const matchSearch = !search || 
      r.title.toLowerCase().includes(search) ||
      r.uploadedBy.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search);

    return matchCat && matchType && matchSearch;
  });
}

function setupFilters() {
  document.getElementById("categoryFilter")?.addEventListener("change", resetAndRender);
  document.getElementById("typeFilter")?.addEventListener("change", resetAndRender);
  document.getElementById("searchInput")?.addEventListener("input", resetAndRender);
}

function resetAndRender() {
  currentPage = 1;
  renderResources();
}

// ==================== PAGINATION ====================
function setupPagination(totalItems) {
  const container = document.getElementById("pagination");
  if (!container) return;

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  container.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderResources();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    container.appendChild(li);
  }
}

// ==================== UPLOADS (Teacher + Student) ====================
function setupUploads() {
  const teacherInput = document.getElementById("uploadFiles");
  const studentInput = document.getElementById("studentUpload");
  const quickInput = document.getElementById("quickFile");

  [teacherInput, studentInput, quickInput].forEach(input => {
    if (!input) return;

    input.addEventListener("change", async function () {
      if (this.files.length === 0) return;

      const formData = new FormData();
      Array.from(this.files).forEach(file => formData.append("files", file));
      formData.append("uploadedBy", getCurrentUserName());
      formData.append("role", currentRole);

      try {
        const res = await fetch("/api/resources/upload", {
          method: "POST",
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          showAlert(`Uploaded ${this.files.length} file(s)!`, "success");
          this.value = "";
          LoadAllData(); // Refresh
        }
      } catch (err) {
        showAlert("Upload failed.", "danger");
      }
    });
  });
}

// ==================== ROLE SWITCHER ====================
function setupRoleSwitcher() {
  document.querySelectorAll('[id^="role"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[id^="role"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRole = btn.id.replace("role", "").toLowerCase();
      document.getElementById("teacherQuick").classList.toggle("d-none", currentRole !== "teacher" && currentRole !== "admin");
      renderSubmissions();
    });
  });
}

// ==================== PREVIEW MODAL ====================
function openPreview(resource) {
  const modal = new bootstrap.Modal(document.getElementById("previewModal"));
  const title = document.getElementById("previewTitle");
  const body = document.getElementById("previewBody");
  const download = document.getElementById("previewDownload");

  if (!resource) {
    body.innerHTML = "<p class='text-muted text-center'>Preview not available.</p>";
    modal.show();
    return;
  }

  title.textContent = resource.title;
  download.href = resource.url;

  if (resource.type === "pdf") {
    body.innerHTML = `<embed src="${resource.url}#toolbar=1" type="application/pdf" width="100%" height="600px">`;
  } else if (resource.type === "video") {
    body.innerHTML = `<video controls class="w-100"><source src="${resource.url}" type="video/mp4">Your browser does not support video.</video>`;
  } else if (resource.type === "audio") {
    body.innerHTML = `<audio controls class="w-100"><source src="${resource.url}" type="audio/mpeg">Your browser does not support audio.</audio>`;
  } else {
    body.innerHTML = `<iframe src="${resource.url}" width="100%" height="600px" style="border:none;"></iframe>`;
  }

  modal.show();
}

// ==================== ANALYTICS & TAGS ====================
function updateAnalytics() {
  document.getElementById("countTotal").textContent = DATA.resources.length;
  document.getElementById("countPdf").textContent = DATA.resources.filter(r => r.type === "pdf").length;
  document.getElementById("countVideo").textContent = DATA.resources.filter(r => r.type === "video").length;
  DATA.resources.filter(r => r.type === "audio").length;
}

function populateTags() {
  const container = document.getElementById("tagList");
  if (!container) return;

  const tags = [...new Set(DATA.resources.flatMap(r => r.tags || []))].slice(0, 12);
  container.innerHTML = tags.map(t => `
    <span class="badge bg-secondary cursor-pointer" onclick="searchByTag('${t}')">${t}</span>
  `).join("");
}

function searchByTag(tag) {
  document.getElementById("searchInput").value = tag;
  resetAndRender();
}

// ==================== UTILITIES ====================
function getCurrentUserName() {
  return localStorage.getItem("userName") || "Student";
}

function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf text-danger",
    doc: "fa-file-word text-primary",
    docx: "fa-file-word text-primary",
    video: "fa-file-video text-success",
    audio: "fa-file-audio text-info",
    image: "fa-file-image text-warning"
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