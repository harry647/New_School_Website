// =======================================================
// clubs.js – Optimized Clubs & Societies System (2026+)
// Backend-powered, mobile-perfect, secure, beautiful
// =======================================================

let CLUBS = [];
let EVENTS = [];
let currentClubId = null;
let cache = new Map();
let abortController = null;

// Configuration - loaded dynamically with fallback
let CLUBS_CONFIG = {
  api: {
    timeout: 10000,
    retries: 3,
    cache: { enabled: true, ttl: 300000 }
  },
  upload: {
    maxFiles: 20,
    maxFileSize: 50 * 1024 * 1024,
    allowedTypes: {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      media: ['video/mp4', 'video/mov', 'audio/mp3', 'audio/wav']
    }
  },
  performance: { debounceSearch: 300 },
  ui: { theme: { primaryColor: '#0175C2' } },
  messages: {
    errors: {
      network: 'Network error. Please check your connection and try again.',
      server: 'Server error. Please try again later.',
      validation: 'Please check your input and try again.',
      auth: 'You must be logged in to access this feature.',
      duplicate: 'You already have a pending application for this club.',
      upload: {
        noFiles: 'Please select files to upload.',
        invalidType: 'Invalid file type. Please check allowed formats.',
        tooLarge: 'File is too large. Please check size limits.',
        failed: 'Upload failed. Please try again.'
      }
    },
    success: {
      load: 'Data loaded successfully.',
      join: 'Application submitted successfully! We\'ll contact you soon.',
      upload: 'Files uploaded successfully.'
    }
  },
  features: {
    enableJoinApplications: true,
    enableFileUploads: true,
    enableEventRegistration: true,
    enableSearch: true,
    enableFiltering: true,
    enableGallery: true
  }
};

// Load configuration
async function loadConfig() {
  if (CLUBS_CONFIG) return CLUBS_CONFIG;

  try {
    const response = await fetch('/api/config/clubs');
    CLUBS_CONFIG = await response.json();
  } catch (err) {
    console.warn('Failed to load config, using defaults:', err);
    // Fallback configuration
    CLUBS_CONFIG = {
      api: { timeout: 10000, retries: 3, cache: { enabled: true, ttl: 300000 } },
      upload: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024 },
      performance: { debounceSearch: 300 },
      ui: { theme: { primaryColor: '#0175C2' } },
      messages: {
        errors: { network: 'Network error. Please try again.', server: 'Server error. Please try again.' },
        success: { load: 'Data loaded successfully.', join: 'Application submitted successfully!' }
      },
      features: {
        enableJoinApplications: true,
        enableFileUploads: true,
        enableSearch: true,
        enableFiltering: true
      }
    };
  }

  return CLUBS_CONFIG;
}

// Helper functions
function isFeatureEnabled(feature) {
  return CLUBS_CONFIG?.features?.[feature] !== false;
}

function getMessage(type, key) {
  return CLUBS_CONFIG?.messages?.[type]?.[key] || `${type}.${key}`;
}

// ==================== AUTH ====================
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success && data.user;
    }
    return false;
  } catch (err) {
    console.warn('Auth check failed:', err);
    return false;
  }
}

// ==================== UTILITIES ====================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showAlert(message, type = "info", duration = 5000) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width:300px;";
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);

  if (duration > 0) {
    setTimeout(() => alert.remove(), duration);
  }

  return alert;
}

function showLoading(element, text = "Loading...") {
  if (!element) return;
  element.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>
      <p class="mt-3">${text}</p>
    </div>
  `;
}

// ==================== API CALLS ====================
async function apiCall(endpoint, options = {}) {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    signal: abortController.signal,
    timeout: CLUBS_CONFIG.api.timeout
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Check cache for GET requests
  const cacheKey = `${endpoint}-${JSON.stringify(finalOptions.body || {})}`;
  if (finalOptions.method === 'GET' && CLUBS_CONFIG.api.cache.enabled && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CLUBS_CONFIG.api.cache.ttl) {
      return cached.data;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

    const response = await fetch(endpoint, {
      ...finalOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache successful GET responses
    if (finalOptions.method === 'GET' && CLUBS_CONFIG.api.cache.enabled) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request cancelled');
    }

    console.error(`API call failed: ${endpoint}`, err);
    throw err;
  }
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Load configuration first
  await loadConfig();

  w3.includeHTML(async () => {
    const isLoggedIn = await checkAuthStatus();

    if (!isLoggedIn) {
      document.getElementById("loginCheck")?.classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent")?.classList.remove("d-none");

    // Load data from backend
    await loadClubsAndEvents();

    // Setup event listeners
    setupEventListeners();

    // Handle URL hash (deep linking)
    if (location.hash) {
      const id = location.hash.substring(1);
      await loadClub(id);
    }
  });
});

function setupEventListeners() {
  // Search with debounce
  const searchInput = document.getElementById("clubSearch");
  if (searchInput && isFeatureEnabled('enableSearch')) {
    const debouncedFilter = debounce(filterClubs, CLUBS_CONFIG.performance.debounceSearch);
    searchInput.addEventListener("input", debouncedFilter);
  }

  // Filter
  const filterSelect = document.getElementById("clubCategoryFilter");
  if (filterSelect && isFeatureEnabled('enableFiltering')) {
    filterSelect.addEventListener("change", filterClubs);
  }

  // Join form
  const joinForm = document.getElementById("joinForm");
  if (joinForm && isFeatureEnabled('enableJoinApplications')) {
    joinForm.addEventListener("submit", handleJoinSubmit);
  }
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadClubsAndEvents() {
  const grid = document.getElementById("clubsGrid");
  const eventsGrid = document.getElementById("eventsGrid");

  showLoading(grid, "Loading clubs...");
  showLoading(eventsGrid, "Loading events...");

  try {
    const [clubsData, eventsData] = await Promise.all([
      apiCall("/api/clubs/list"),
      apiCall("/api/clubs/events")
    ]);

    CLUBS = clubsData.data || [];
    EVENTS = eventsData.data || [];

    renderClubsGrid();
    renderUpcomingEvents();

    showAlert(getMessage('success', 'load'), 'success', 3000);

    // Auto-load club from URL hash
    if (location.hash) {
      const id = location.hash.substring(1);
      if (CLUBS.find(c => c.id === id)) await loadClub(id);
    }
  } catch (err) {
    console.error("Failed to load clubs:", err);
    showAlert(getMessage('errors', 'network'), "danger");

    // Show error state
    grid.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <h4>Unable to load clubs</h4>
        <p>Please check your connection and try again.</p>
        <button onclick="loadClubsAndEvents()" class="btn btn-primary">Retry</button>
      </div>
    `;
    eventsGrid.innerHTML = '<p class="text-center text-muted col-12">Events unavailable</p>';
  }
}

// ==================== RENDER ALL CLUBS GRID ====================
function renderClubsGrid(clubsToRender = CLUBS) {
  const grid = document.getElementById("clubsGrid");
  if (!grid) return;

  if (clubsToRender.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
      <i class="fas fa-users fa-3x mb-3 opacity-50"></i>
      <h4>No clubs found</h4>
      <p>Try adjusting your search or filter criteria.</p>
    </div>`;
    return;
  }

  grid.innerHTML = clubsToRender.map(club => `
    <div class="col-md-6 col-lg-4 mb-4">
      <a href="/clubs/subfiles/${club.id}.html" class="text-decoration-none">
        <div class="glass-card p-4 text-center text-white h-100 shadow-lg cursor-pointer position-relative overflow-hidden"
             style="border-top: 8px solid ${club.color || CLUBS_CONFIG.ui.theme.primaryColor};">
          <div class="card-overlay"></div>
          <i class="fas ${club.icon || 'fa-users'} fa-3x mb-3 position-relative z-1"></i>
          <h3 class="h5 fw-bold mb-2 position-relative z-1">${club.name}</h3>
          <p class="small opacity-80 mb-2 position-relative z-1">${club.category || "General"}</p>
          <p class="small opacity-70 position-relative z-1">${club.members || 0} Members</p>
          <p class="mt-3 small position-relative z-1">${club.shortDesc || "Click to explore →"}</p>
          <div class="card-hover-indicator position-absolute bottom-0 start-50 translate-middle-x">
            <i class="fas fa-chevron-down fa-sm opacity-75"></i>
          </div>
        </div>
      </a>
    </div>
  `).join("");

  // Add keyboard navigation
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const link = e.target.closest('a');
      if (link) link.click();
    }
  });
}

// ==================== LOAD SINGLE CLUB PAGE ====================
async function loadClub(id) {
  currentClubId = id;
  const club = CLUBS.find(c => c.id === id);
  if (!club) {
    showAlert("Club not found", "warning");
    return;
  }

  // Hide main grid
  document.getElementById("clubsGrid").style.display = "none";

  const container = document.getElementById("clubContainer");
  showLoading(container, `Loading ${club.name}...`);

  try {
    const response = await fetch(`/clubs/subfiles/${id}.html`, {
      cache: CLUBS_CONFIG.performance.cacheImages ? 'default' : 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Club page not found`);
    }

    const html = await response.text();
    container.innerHTML = html;

    // Re-initialize Fancybox for galleries
    if (window.Fancybox && isFeatureEnabled('enableGallery')) {
      Fancybox.bind(`[data-fancybox]`, {
        Thumbs: { autoStart: false },
        Toolbar: { display: ["zoom", "slideshow", "download", "close"] }
      });
    }

    // Inject club-specific events
    injectClubEvents(id);

    // Setup file upload zone
    if (isFeatureEnabled('enableFileUploads')) {
      setupClubUpload(id);
    }

    // Update page title and URL
    document.title = `${club.name} | Clubs & Societies`;
    history.pushState({ clubId: id }, club.name, `#${id}`);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error(`Failed to load club ${id}:`, err);
    container.innerHTML = `
      <div class="text-center py-5 text-danger">
        <i class="fas fa-exclamation-triangle fa-4x mb-3"></i>
        <h3>Club Page Not Available</h3>
        <p class="mb-4">We're having trouble loading this club's information.</p>
        <div class="d-flex justify-content-center gap-2">
          <button onclick="loadClub('${id}')" class="btn btn-primary">
            <i class="fas fa-redo me-2"></i>Try Again
          </button>
          <button onclick="showAllClubs()" class="btn btn-outline-primary">
            <i class="fas fa-arrow-left me-2"></i>Back to Clubs
          </button>
        </div>
      </div>
    `;
  }
}

// ==================== INJECT CLUB EVENTS ====================
function injectClubEvents(clubId) {
  const container = document.getElementById(`${clubId}Events`) || document.getElementById("clubEvents");
  if (!container) return;

  const clubEvents = EVENTS
    .filter(e => e.clubId === clubId)
    .flatMap(e => e.events || []);

  if (clubEvents.length === 0) {
    container.innerHTML = `<p class="text-muted text-center py-3">No upcoming events.</p>`;
    return;
  }

  container.innerHTML = clubEvents.map(ev => `
    <div class="col-md-6 mb-4">
      <div class="glass-card p-4 text-white">
        <h5>${ev.title}</h5>
        <p><strong>${new Date(ev.date).toLocaleDateString('en-KE', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        })}</strong></p>
        <p>${ev.time || ''} • ${ev.location || 'TBA'}</p>
        <p>${ev.description || ''}</p>
      </div>
    </div>
  `).join("");
}

// ==================== FILE UPLOAD ZONE ====================
function setupClubUpload(clubId) {
  // Wait for the upload zone to be available
  const checkUploadZone = setInterval(() => {
    const zone = document.querySelector(".upload-zone");
    const input = document.getElementById("clubFileInput") || document.querySelector('input[type="file"]');
    const preview = document.getElementById("uploadPreview") || document.createElement("div");
 
    if (zone && input) {
      clearInterval(checkUploadZone);
      initializeUploadZone(zone, input, preview, clubId);
    }
  }, 100);
}

function initializeUploadZone(zone, input, preview, clubId) {
  let isDragOver = false;
 
  // Ensure preview container is properly placed
  if (preview && !preview.parentElement) {
    zone.appendChild(preview);
  }
 
  // Drag & drop effects
  const dragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      isDragOver = true;
      zone.classList.add("drag-over");
    }
  };
 
  const dragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!zone.contains(e.relatedTarget)) {
      isDragOver = false;
      zone.classList.remove("drag-over");
    }
  };
 
  const drop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDragOver = false;
    zone.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files);
  };
 
  // Click to browse functionality
  const clickToBrowse = (e) => {
    if (e.target === zone || e.target.classList.contains('upload-zone')) {
      input.click();
    }
  };
 
  // Add event listeners
  zone.addEventListener("dragenter", dragEnter);
  zone.addEventListener("dragover", dragEnter);
  zone.addEventListener("dragleave", dragLeave);
  zone.addEventListener("drop", drop);
  zone.addEventListener("click", clickToBrowse);
 
  input.addEventListener("change", () => {
    if (input.files.length) handleFiles(input.files);
  });
 
  async function handleFiles(files) {
    // Validate files
    const maxFiles = CLUBS_CONFIG.upload.maxFiles;
    const maxSize = CLUBS_CONFIG.upload.maxFileSize;
    const allowedTypes = [
      ...CLUBS_CONFIG.upload.allowedTypes.images,
      ...CLUBS_CONFIG.upload.allowedTypes.documents,
      ...CLUBS_CONFIG.upload.allowedTypes.media
    ].flat();
 
    if (files.length > maxFiles) {
      showAlert(`Maximum ${maxFiles} files allowed`, "warning");
      return;
    }
 
    for (let file of files) {
      if (file.size > maxSize) {
        showAlert(`File "${file.name}" is too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`, "warning");
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        showAlert(`File type "${file.type}" not allowed for "${file.name}"`, "warning");
        return;
      }
    }
 
    // Show preview of selected files
    preview.innerHTML = `<div class="text-info">
      <i class="fas fa-file-alt me-2"></i>
      Selected ${files.length} file(s): ${Array.from(files).map(f => f.name).join(', ')}
    </div>`;
 
    // Add upload button
    preview.innerHTML += `<button id="uploadButton" class="btn btn-success btn-sm mt-2">
      <i class="fas fa-upload me-2"></i>Upload Files
    </button>`;
 
    // Add event listener for upload button
    document.getElementById('uploadButton').addEventListener('click', async () => {
      preview.innerHTML = `<div class="text-info">
        <i class="fas fa-spinner fa-spin me-2"></i>
        Uploading ${files.length} file(s)...
      </div>`;
 
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("files", file));
      formData.append("clubId", clubId);
 
      try {
        const result = await apiCall("/api/clubs/upload", {
          method: "POST",
          body: formData,
          headers: {} // Let browser set content-type for FormData
        });
 
        if (result.success) {
          preview.innerHTML = `<div class="text-success">
            <i class="fas fa-check-circle me-2"></i>
            Successfully uploaded ${files.length} file(s)!
          </div>`;
          setTimeout(() => preview.innerHTML = "", 5000);

          // Clear file input
          input.value = '';
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        preview.innerHTML = `<div class="text-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${getMessage('errors', 'upload').failed}
        </div>`;
      }
    });
  }
}

// ==================== JOIN CLUB FORM ====================
async function handleJoinSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Disable form and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Get club info
    const club = CLUBS.find(c => c.id === currentClubId);
    if (!club) {
      throw new Error('Club information not found');
    }

    const payload = {
      ...data,
      clubId: currentClubId,
      clubName: club.name
    };

    const result = await apiCall("/api/clubs/join", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (result.success) {
      showAlert(getMessage('success', 'join'), "success");
      const modal = bootstrap.Modal.getInstance(document.getElementById("joinModal"));
      modal?.hide();
      form.reset();

      // Clear cache to refresh data
      cache.clear();
    } else {
      showAlert(result.message || getMessage('errors', 'server'), "danger");
    }
  } catch (err) {
    console.error('Join submission failed:', err);
    const message = err.message.includes('Network') ?
      getMessage('errors', 'network') :
      getMessage('errors', 'server');
    showAlert(message, "danger");
  } finally {
    // Re-enable form
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ==================== SEARCH & FILTER ====================
function filterClubs() {
  const searchTerm = document.getElementById("clubSearch")?.value.toLowerCase().trim() || "";
  const categoryFilter = document.getElementById("clubCategoryFilter")?.value || "";

  const filtered = CLUBS.filter(club => {
    const matchesSearch = !searchTerm ||
      club.name.toLowerCase().includes(searchTerm) ||
      (club.shortDesc || "").toLowerCase().includes(searchTerm) ||
      (club.category || "").toLowerCase().includes(searchTerm);

    const matchesCategory = !categoryFilter || club.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  renderClubsGrid(filtered);

  // Update results count
  const resultsCount = document.getElementById("resultsCount");
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filtered.length} of ${CLUBS.length} clubs`;
  }
}

// ==================== SEARCH & FILTER ====================
function filterClubs() {
  const search = document.getElementById("clubSearch")?.value.toLowerCase() || "";
  const category = document.getElementById("clubCategoryFilter")?.value || "";

  const filtered = CLUBS.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(search) ||
                         (club.shortDesc || "").toLowerCase().includes(search);
    const matchesCategory = !category || club.category === category;
    return matchesSearch && matchesCategory;
  });

  renderClubsGrid(filtered);
}

// ==================== UPCOMING EVENTS GRID ====================
function renderUpcomingEvents() {
  const grid = document.getElementById("eventsGrid");
  if (!grid || EVENTS.length === 0) return;

  const upcoming = EVENTS
    .flatMap(group => group.events.map(e => ({
      ...e,
      clubName: CLUBS.find(c => c.id === group.clubId)?.name || "Unknown"
    })))
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  grid.innerHTML = upcoming.length === 0
    ? '<p class="text-center text-muted col-12">No upcoming events</p>'
    : upcoming.map(ev => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="glass-card p-4 text-white text-center">
          <i class="fas fa-calendar-check fa-3x mb-3"></i>
          <h5>${ev.title}</h5>
          <p><strong>${new Date(ev.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></p>
          <p>${ev.clubName}</p>
        </div>
      </div>
    `).join("");
}

// ==================== BACK BUTTON SUPPORT ====================
window.addEventListener("popstate", (e) => {
  if (location.hash) {
    const id = location.hash.substring(1);
    if (CLUBS.find(c => c.id === id)) loadClub(id);
  } else {
    document.getElementById("clubsGrid").style.display = "";
    document.getElementById("clubContainer").innerHTML = "";
  }
});

// ==================== MODAL FUNCTIONS ====================
function openJoinModal(clubName) {
  const modal = document.getElementById("joinModal");
  const modalClubName = document.getElementById("modalClubName");

  if (modal && modalClubName) {
    modalClubName.textContent = clubName;
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }
}

// ==================== UTILITIES ====================
function showAllClubs() {
  document.getElementById("clubsGrid").style.display = "";
  document.getElementById("clubContainer").innerHTML = "";
  document.title = "Clubs & Societies | Bar Union Secondary";
  history.pushState({}, "", "/clubs/clubs.html");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== CLEANUP ====================
window.addEventListener('beforeunload', () => {
  if (abortController) {
    abortController.abort();
  }
  cache.clear();
});

// ==================== EXPORTS ====================
window.loadClub = loadClub;
window.showAllClubs = showAllClubs;
window.openJoinModal = openJoinModal;