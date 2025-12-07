// =======================================================
// resources.js – Full School Resources Hub (2026+)
// Backend-powered, upload, preview, search, filters, pagination
// =======================================================

let DATA = { resources: [], featured: [], tags: [], submissions: [] };
let currentRole = "student";
let currentPage = 1;
const PAGE_SIZE = 12;
let filteredResources = [];
let currentUser = null;

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

async function getCurrentUser() {
  try {
    const response = await fetch('/api/profile', {
      credentials: 'include'
    });
    const data = await response.json();
    if (data.success) {
      currentUser = data.user;
      return data.user;
    }
  } catch (error) {
    console.error('Failed to get user profile:', error);
  }
  return null;
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", async () => {
  w3.includeHTML(async () => {
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    // Get user profile and set role
    const user = await getCurrentUser();
    if (user) {
      currentRole = user.role || "student";
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // Initialize everything
    await LoadAllData();
    setupRoleSwitcher();
    setupUploads();
    setupFilters();
    setupSearch();
    setupQuickUpload();
    setupUploadForm();
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function LoadAllData() {
  try {
    showLoading(true);
    const res = await fetch("/api/resources/all", { 
      cache: "no-store",
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        showAlert("Please log in to access resources.", "warning");
        window.location.href = '/user/login.html';
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    DATA = data;

    renderAll();
    updateAnalytics();
    populateTags();
    
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load resources. Please refresh the page.", "danger");
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;
  
  if (show) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading resources...</p>
      </div>
    `;
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
      <article class="resource-card p-4 h-100 glass-card shadow-sm position-relative">
        ${['teacher', 'admin'].includes(currentRole) ? `
          <button class="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2" 
                  onclick="deleteResource('${r.id}')" title="Delete Resource">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
        
        <div class="d-flex align-items-start gap-3">
          <div class="icon-box rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
               style="width:60px;height:60px;background:${r.color || '#f0f8ff'};">
            <i class="fas ${r.icon || getFileIcon(r.type)} fa-2x text-white"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="h6 fw-bold mb-1 resource-title">${r.title}</h3>
            <p class="small text-muted mb-2">
              <strong>Category:</strong> ${r.category || 'General'}<br>
              <strong>By:</strong> ${r.uploadedBy || 'Unknown'}<br>
              <strong>Date:</strong> ${formatDate(r.date)}<br>
              ${r.size ? `<strong>Size:</strong> ${r.size}<br>` : ''}
              ${r.description ? `<strong>Description:</strong> ${r.description}` : ''}
            </p>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-primary btn-sm" 
                      onclick="openPreview(${JSON.stringify(r)})">
                <i class="fas fa-eye me-1"></i>Preview
              </button>
              <a href="${r.url}" class="btn btn-success btn-sm" download>
                <i class="fas fa-download me-1"></i>Download
              </a>
              ${r.mimeType?.includes('video') ? `
                <button class="btn btn-outline-info btn-sm" onclick="playVideo('${r.url}')">
                  <i class="fas fa-play me-1"></i>Play
                </button>
              ` : ''}
              ${r.mimeType?.includes('audio') ? `
                <button class="btn btn-outline-warning btn-sm" onclick="playAudio('${r.url}')">
                  <i class="fas fa-volume-up me-1"></i>Listen
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </article>
    </div>
  `).join("");

  setupPagination(filteredResources.length);
}

async function deleteResource(resourceId) {
  if (!confirm("Are you sure you want to delete this resource?")) {
    return;
  }
  
  try {
    const response = await fetch(`/api/resources/${resourceId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    const result = await response.json();
    if (result.success) {
      showAlert("Resource deleted successfully!", "success");
      await LoadAllData();
    } else {
      showAlert(result.message || "Failed to delete resource.", "danger");
    }
  } catch (err) {
    console.error('Error deleting resource:', err);
    showAlert("Failed to delete resource.", "danger");
  }
}

function playVideo(url) {
  const modal = new bootstrap.Modal(document.getElementById("previewModal"));
  const title = document.getElementById("previewTitle");
  const body = document.getElementById("previewBody");
  const download = document.getElementById("previewDownload");

  title.textContent = "Video Player";
  download.href = url;
  
  body.innerHTML = `
    <div class="text-center">
      <video controls class="w-100" style="max-height: 70vh;">
        <source src="${url}" type="video/mp4">
        Your browser does not support video playback.
      </video>
    </div>
  `;
  
  modal.show();
}

function playAudio(url) {
  const modal = new bootstrap.Modal(document.getElementById("previewModal"));
  const title = document.getElementById("previewTitle");
  const body = document.getElementById("previewBody");
  const download = document.getElementById("previewDownload");

  title.textContent = "Audio Player";
  download.href = url;
  
  body.innerHTML = `
    <div class="text-center">
      <audio controls class="w-100">
        <source src="${url}" type="audio/mpeg">
        Your browser does not support audio playback.
      </audio>
    </div>
  `;
  
  modal.show();
}

// ==================== SUBMISSIONS LIST ====================
function renderSubmissions() {
  const container = document.getElementById("submissionsList");
  if (!container) return;

  const subs = currentRole === "teacher" || currentRole === "admin"
    ? DATA.submissions || []
    : (DATA.submissions || []).filter(s => s.uploadedBy === (currentUser?.name || 'Student'));

  container.innerHTML = subs.length === 0
    ? `<div class="col-12 text-center text-muted py-4">
         <i class="fas fa-inbox fa-3x mb-3"></i>
         <p>No submissions yet.</p>
       </div>`
    : subs.map(s => `
      <div class="col-md-6 col-lg-4">
        <div class="glass-card p-4 h-100">
          <div class="d-flex align-items-start gap-3">
            <div class="icon-box rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                 style="width:50px;height:50px;background:#f0f8ff;">
              <i class="fas ${getFileIcon(s.type || 'file')} fa-lg text-primary"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="fw-bold mb-1">${s.title || 'Assignment'}</h6>
              <p class="small text-muted mb-2">
                <strong>Subject:</strong> ${s.subject || 'General'}<br>
                <strong>By:</strong> ${s.uploadedBy || 'Unknown'}<br>
                <strong>Date:</strong> ${formatDate(s.date)}<br>
                <strong>Size:</strong> ${s.size || 'Unknown'}
              </p>
              <div class="d-flex gap-2 flex-wrap">
                <a href="${s.url}" class="btn btn-sm btn-outline-success" download>
                  <i class="fas fa-download me-1"></i>Download
                </a>
                ${currentRole !== "student" ? `
                  <button class="btn btn-sm btn-primary" onclick="approveSubmission('${s.id}')">
                    <i class="fas fa-check me-1"></i>Approve
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteSubmission('${s.id}')">
                    <i class="fas fa-trash me-1"></i>Delete
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");
}

async function approveSubmission(submissionId) {
  try {
    const response = await fetch(`/api/resources/submissions/${submissionId}/approve`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const result = await response.json();
    if (result.success) {
      showAlert("Submission approved successfully!", "success");
      await LoadAllData();
    } else {
      showAlert(result.message || "Failed to approve submission.", "danger");
    }
  } catch (err) {
    console.error('Error approving submission:', err);
    showAlert("Failed to approve submission.", "danger");
  }
}

async function deleteSubmission(submissionId) {
  if (!confirm("Are you sure you want to delete this submission?")) {
    return;
  }
  
  try {
    const response = await fetch(`/api/resources/submissions/${submissionId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    const result = await response.json();
    if (result.success) {
      showAlert("Submission deleted successfully!", "success");
      await LoadAllData();
    } else {
      showAlert(result.message || "Failed to delete submission.", "danger");
    }
  } catch (err) {
    console.error('Error deleting submission:', err);
    showAlert("Failed to delete submission.", "danger");
  }
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

// ==================== UPLOAD FORM SETUP ====================
function setupUploadForm() {
  const uploadForm = document.getElementById("uploadForm");
  if (!uploadForm) return;

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("resourceTitle").value.trim();
    const category = document.getElementById("resourceCategory").value;
    const type = document.getElementById("resourceType").value;
    const description = document.getElementById("resourceDesc").value.trim();
    const files = document.getElementById("uploadFiles").files;

    if (!title || !category || !type || files.length === 0) {
      showAlert("Please fill all required fields and select files.", "warning");
      return;
    }

    await handleFileUpload(files, { title, category, type, description }, 'upload');
  });

  // File input change handler
  const uploadFilesInput = document.getElementById("uploadFiles");
  if (uploadFilesInput) {
    uploadFilesInput.addEventListener("change", handleFileSelection);
  }

  // Student submission handler
  const studentUpload = document.getElementById("studentUpload");
  if (studentUpload) {
    studentUpload.addEventListener("change", async function() {
      if (this.files.length === 0) return;
      
      const assignmentTitle = prompt("Enter assignment title (optional):") || "Student Assignment";
      const subject = prompt("Enter subject/category:") || "General";
      
      await handleFileUpload(this.files, { assignmentTitle, subject }, 'submit');
    });
  }

  // Quick upload handler
  const quickInput = document.getElementById("quickFile");
  if (quickInput) {
    quickInput.addEventListener("change", async function() {
      if (this.files.length === 0) return;
      
      const title = prompt("Enter resource title:");
      const category = prompt("Enter category (e.g., Mathematics, Sciences):");
      
      if (title && category) {
        await handleFileUpload(this.files, { title, category, type: "mixed" }, 'upload');
      } else {
        showAlert("Title and category are required for quick upload.", "warning");
      }
    });
  }
}

async function handleFileUpload(files, metadata, uploadType) {
  try {
    const formData = new FormData();
    
    // Add files
    Array.from(files).forEach(file => formData.append("files", file));
    
    // Add metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const endpoint = uploadType === 'submit' ? '/api/resources/submit' : '/api/resources/upload';
    
    showLoading(true);
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: 'include'
    });

    const result = await res.json();
    
    if (result.success) {
      showAlert(result.message, "success");
      
      // Clear form and refresh data
      clearUploadForm();
      await LoadAllData();
    } else {
      showAlert(result.message || "Upload failed.", "danger");
    }
    
  } catch (err) {
    console.error("Upload error:", err);
    showAlert("Upload failed. Please try again.", "danger");
  } finally {
    showLoading(false);
  }
}

function handleFileSelection(e) {
  const files = e.target.files;
  const dropZone = document.getElementById("uploadDropZone");
  
  if (!dropZone) return;
  
  if (files.length > 0) {
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    dropZone.innerHTML = `
      <div class="text-success">
        <i class="fas fa-check-circle"></i>
        <strong>${files.length}</strong> file(s) selected:
        <br><small>${fileNames}</small>
      </div>
    `;
  } else {
    dropZone.innerHTML = `
      <p class="mb-2">Drag & drop files here or click to select</p>
      <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('uploadFiles').click()">Choose files</button>
    `;
  }
}

function clearUploadForm() {
  // Clear form inputs
  document.getElementById("resourceTitle").value = "";
  document.getElementById("resourceCategory").value = "";
  document.getElementById("resourceType").value = "";
  document.getElementById("resourceDesc").value = "";
  document.getElementById("uploadFiles").value = "";
  
  // Reset drop zone
  const dropZone = document.getElementById("uploadDropZone");
  if (dropZone) {
    dropZone.innerHTML = `
      <p class="mb-2">Drag & drop files here or click to select</p>
      <button type="button" class="btn btn-outline-secondary" onclick="document.getElementById('uploadFiles').click()">Choose files</button>
    `;
  }
  
  // Clear student upload
  const studentUpload = document.getElementById("studentUpload");
  if (studentUpload) studentUpload.value = "";
  
  // Clear quick upload
  const quickInput = document.getElementById("quickFile");
  if (quickInput) quickInput.value = "";
}

// ==================== ROLE SWITCHER ====================
function setupRoleSwitcher() {
  document.querySelectorAll('[id^="role"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[id^="role"]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRole = btn.id.replace("role", "").toLowerCase();
      
      // Show/hide teacher quick upload based on role
      const teacherQuick = document.getElementById("teacherQuick");
      if (teacherQuick) {
        teacherQuick.classList.toggle("d-none", !['teacher', 'admin'].includes(currentRole));
      }
      
      // Show/hide upload button based on role
      const uploadBtn = document.getElementById("openUploadBtn");
      if (uploadBtn) {
        uploadBtn.classList.toggle("d-none", !['teacher', 'admin'].includes(currentRole));
      }
      
      renderSubmissions();
    });
  });
}

// ==================== ROLE MANAGEMENT ====================
function setRole(role) {
  currentRole = role;
  
  // Update button states
  document.querySelectorAll('[id^="role"]').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const roleBtn = document.getElementById(`role${role.charAt(0).toUpperCase() + role.slice(1)}`);
  if (roleBtn) {
    roleBtn.classList.add('active');
  }
  
  // Show/hide teacher/admin features
  const teacherQuick = document.getElementById("teacherQuick");
  if (teacherQuick) {
    teacherQuick.classList.toggle("d-none", !['teacher', 'admin'].includes(role));
  }
  
  const uploadBtn = document.getElementById("openUploadBtn");
  if (uploadBtn) {
    uploadBtn.classList.toggle("d-none", !['teacher', 'admin'].includes(role));
  }
  
  renderSubmissions();
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
  download.download = resource.originalName || resource.title;

  let previewContent = '';
  
  if (resource.type === "pdf") {
    previewContent = `<embed src="${resource.url}#toolbar=1" type="application/pdf" width="100%" height="600px">`;
  } else if (resource.type === "video") {
    previewContent = `<video controls class="w-100" style="max-height: 70vh;"><source src="${resource.url}" type="${resource.mimeType || 'video/mp4'}">Your browser does not support video.</video>`;
  } else if (resource.type === "audio") {
    previewContent = `<audio controls class="w-100"><source src="${resource.url}" type="${resource.mimeType || 'audio/mpeg'}">Your browser does not support audio.</audio>`;
  } else if (resource.type === "image") {
    previewContent = `<div class="text-center"><img src="${resource.url}" alt="${resource.title}" class="img-fluid" style="max-height: 70vh;"></div>`;
  } else if (resource.type === "text") {
    previewContent = `<div class="p-3 bg-light"><pre class="mb-0">Loading text content...</pre></div>`;
    
    // Load text content asynchronously
    fetch(resource.url)
      .then(response => response.text())
      .then(text => {
        body.innerHTML = `<div class="p-3 bg-light"><pre class="mb-0">${text}</pre></div>`;
      })
      .catch(() => {
        body.innerHTML = "<p class='text-muted text-center'>Unable to load text content.</p>";
      });
    modal.show();
    return;
  } else {
    previewContent = `
      <div class="text-center p-5">
        <i class="fas ${getFileIcon(resource.type)} fa-4x text-muted mb-3"></i>
        <h5>File Preview Not Available</h5>
        <p class="text-muted">This file type cannot be previewed in the browser.</p>
        <p><strong>File:</strong> ${resource.originalName || resource.title}</p>
        <p><strong>Type:</strong> ${resource.type}</p>
        <p><strong>Size:</strong> ${resource.size || 'Unknown'}</p>
      </div>
    `;
  }

  body.innerHTML = previewContent;
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

// ==================== ANALYTICS & TAGS ====================
function updateAnalytics() {
  const countTotal = document.getElementById("countTotal");
  const countPdf = document.getElementById("countPdf");
  const countVideo = document.getElementById("countVideo");
  const countAudio = document.getElementById("countAudio");

  if (countTotal) countTotal.textContent = DATA.resources?.length || 0;
  if (countPdf) countPdf.textContent = DATA.resources?.filter(r => r.type === 'pdf').length || 0;
  if (countVideo) countVideo.textContent = DATA.resources?.filter(r => r.type === 'video').length || 0;
  if (countAudio) countAudio.textContent = DATA.resources?.filter(r => r.type === 'audio').length || 0;
}

function populateTags() {
  const container = document.getElementById("tagList");
  if (!container) return;

  const tags = [...new Set(DATA.resources?.flatMap(r => r.tags || [r.category]).filter(Boolean))].slice(0, 12);
  container.innerHTML = tags.map(t => `
    <span class="badge bg-secondary cursor-pointer" onclick="searchByTag('${t}')">${t}</span>
  `).join("");
}

function searchByTag(tag) {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = tag;
    resetAndRender();
  }
}

// ==================== QUICK UPLOAD SETUP ====================
function setupQuickUpload() {
  const quickDrop = document.getElementById("quickDrop");
  const quickFile = document.getElementById("quickFile");

  if (!quickDrop || !quickFile) return;

  // Drag and drop functionality
  quickDrop.addEventListener("dragover", (e) => {
    e.preventDefault();
    quickDrop.classList.add("bg-light");
  });

  quickDrop.addEventListener("dragleave", () => {
    quickDrop.classList.remove("bg-light");
  });

  quickDrop.addEventListener("drop", (e) => {
    e.preventDefault();
    quickDrop.classList.remove("bg-light");
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files, {}, 'quick');
    }
  });

  quickDrop.addEventListener("click", () => {
    quickFile.click();
  });
}

// ==================== SEARCH SETUP ====================
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  // Debounced search
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      resetAndRender();
    }, 300);
  });
}

// ==================== SORT AND VIEW CONTROLS ====================
let currentSort = 'date'; // 'date', 'title', 'category', 'type'
let currentView = 'grid'; // 'grid', 'list'

function toggleSortMenu(event) {
  event.preventDefault();
  
  // Simple sort options for now
  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'title', label: 'Sort by Title' },
    { value: 'category', label: 'Sort by Category' },
    { value: 'type', label: 'Sort by Type' }
  ];
  
  let menuHtml = '<div class="dropdown-menu show">';
  sortOptions.forEach(option => {
    const activeClass = currentSort === option.value ? 'active' : '';
    menuHtml += `<a class="dropdown-item ${activeClass}" href="#" onclick="setSort('${option.value}')">${option.label}</a>`;
  });
  menuHtml += '</div>';
  
  // Create temporary dropdown
  const button = event.target.closest('button');
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown position-absolute';
  dropdown.style.cssText = `top: 100%; left: 0; z-index: 1000;`;
  dropdown.innerHTML = menuHtml;
  
  // Remove existing dropdowns
  document.querySelectorAll('.dropdown').forEach(d => d.remove());
  
  button.parentNode.appendChild(dropdown);
  
  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeDropdown(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    });
  }, 100);
}

function setSort(sortType) {
  currentSort = sortType;
  
  // Re-sort filtered resources
  filteredResources.sort((a, b) => {
    switch (sortType) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'date':
      default:
        return new Date(b.date || 0) - new Date(a.date || 0);
    }
  });
  
  // Re-render
  currentPage = 1;
  renderResources();
  
  // Remove dropdown
  document.querySelectorAll('.dropdown').forEach(d => d.remove());
}

function toggleGridList() {
  const grid = document.getElementById("resourcesGrid");
  const button = document.getElementById("viewToggle");
  
  if (!grid || !button) return;
  
  if (currentView === 'grid') {
    currentView = 'list';
    grid.className = 'row g-3';
    button.innerHTML = '<i class="fas fa-list"></i>';
    button.title = 'Switch to grid view';
  } else {
    currentView = 'grid';
    grid.className = 'row g-4';
    button.innerHTML = '<i class="fas fa-grip"></i>';
    button.title = 'Switch to list view';
  }
  
  // Adjust card layout for list view
  const cards = grid.querySelectorAll('.resource-card');
  cards.forEach(card => {
    if (currentView === 'list') {
      card.classList.add('d-flex', 'flex-row', 'align-items-center');
    } else {
      card.classList.remove('d-flex', 'flex-row', 'align-items-center');
    }
  });
}

// ==================== UTILITIES ====================
function getCurrentUserName() {
  return currentUser?.name || localStorage.getItem("userName") || "Student";
}

function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    docx: "fa-file-word",
    video: "fa-file-video",
    audio: "fa-file-audio",
    image: "fa-file-image",
    text: "fa-file-alt",
    file: "fa-file"
  };
  return icons[type?.toLowerCase()] || "fa-file";
}

function formatDate(dateStr) {
  if (!dateStr) return "Unknown";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if invalid
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (err) {
    return dateStr;
  }
}

function showAlert(message, type = "info") {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.position-fixed.alert');
  existingAlerts.forEach(alert => alert.remove());

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width: 300px;";
  alert.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas ${getAlertIcon(type)} me-2"></i>
      <span>${message}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

function getAlertIcon(type) {
  const icons = {
    success: "fa-check-circle",
    danger: "fa-exclamation-triangle",
    warning: "fa-exclamation-circle",
    info: "fa-info-circle"
  };
  return icons[type] || "fa-info-circle";
}

// ==================== TRENDING RESOURCES ====================
function showTrending() {
  try {
    // Sort resources by download count (if available) or recent uploads
    const trending = (DATA.resources || [])
      .sort((a, b) => {
        const aDownloads = a.downloads || 0;
        const bDownloads = b.downloads || 0;
        if (aDownloads !== bDownloads) {
          return bDownloads - aDownloads; // Descending
        }
        // Fallback to date
        return new Date(b.date || 0) - new Date(a.date || 0);
      })
      .slice(0, 6);

    if (trending.length === 0) {
      showAlert("No trending resources available.", "info");
      return;
    }

    // Create a modal to show trending resources
    const modalHtml = `
      <div class="modal fade" id="trendingModal" tabindex="-1" aria-labelledby="trendingTitle" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 id="trendingTitle" class="modal-title">
                <i class="fas fa-fire text-danger me-2"></i>Trending Resources
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                ${trending.map((r, index) => `
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                          <span class="badge bg-danger me-2">#${index + 1}</span>
                          <i class="fas ${r.icon || getFileIcon(r.type)} me-2"></i>
                          <h6 class="card-title mb-0">${r.title}</h6>
                        </div>
                        <p class="card-text small text-muted mb-2">
                          ${r.category || 'General'} • ${r.uploadedBy || 'Unknown'}
                        </p>
                        <div class="d-flex gap-2">
                          <button class="btn btn-sm btn-outline-primary" onclick="openPreview(${JSON.stringify(r)})">
                            Preview
                          </button>
                          <a href="${r.url}" class="btn btn-sm btn-success" download>
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing trending modal if any
    const existingModal = document.getElementById('trendingModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('trendingModal'));
    modal.show();

    // Clean up modal after it's hidden
    document.getElementById('trendingModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });

  } catch (err) {
    console.error('Error showing trending:', err);
    showAlert("Failed to load trending resources.", "danger");
  }
}