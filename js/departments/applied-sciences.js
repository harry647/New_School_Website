// =======================================================
// applied-sciences.js – Applied Sciences Department
// Fully frontend-powered, mobile-responsive with search & filter
// =======================================================

let DATA = {};
let currentSession = "";
let currentContentType = "all";
let searchQuery = "";

// Fallback data if JSON fetch fails
const FALLBACK_DATA = {
  subjects: [
    {
      name: "Agriculture",
      icon: "fa-seedling",
      teacher: "Mr. Odhiambo",
      description: "Practical farming skills, crop management, and animal husbandry.",
      session: "2025-2026"
    },
    {
      name: "Computer Studies",
      icon: "fa-laptop-code",
      teacher: "Ms. Achieng",
      description: "Programming, databases, networking, and IT skills.",
      session: "2025-2026"
    },
    {
      name: "Home Science",
      icon: "fa-utensils",
      teacher: "Mrs. Kamau",
      description: "Nutrition, cooking, sewing, and household management.",
      session: "2025-2026"
    },
    {
      name: "Business Studies",
      icon: "fa-briefcase",
      teacher: "Mr. Mwangi",
      description: "Accounting, entrepreneurship, and financial literacy.",
      session: "2025-2026"
    },
    {
      name: "Technical Drawing",
      icon: "fa-ruler-combined",
      teacher: "Ms. Wanjiru",
      description: "Blueprint reading, CAD, and design principles.",
      session: "2024-2025"
    },
    {
      name: "Building & Construction",
      icon: "fa-hard-hat",
      teacher: "Mr. Mutua",
      description: "Construction skills, project planning, and safety practices.",
      session: "2024-2025"
    }
  ],
  teachers: [
    {
      name: "Mr. Odhiambo",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Agriculture"],
      email: "odhiambo@barunion.ac.ke"
    },
    {
      name: "Ms. Achieng",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Computer Studies"],
      email: "achieng@barunion.ac.ke"
    },
    {
      name: "Mrs. Kamau",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Home Science"],
      email: "kamau@barunion.ac.ke"
    },
    {
      name: "Mr. Mwangi",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Business Studies"],
      email: "mwangi@barunion.ac.ke"
    },
    {
      name: "Ms. Wanjiru",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Technical Drawing"],
      email: "wanjiru@barunion.ac.ke"
    },
    {
      name: "Mr. Mutua",
      photo: "/assets/images/defaults/default-user.jpg",
      subjects: ["Building & Construction"],
      email: "mutua@barunion.ac.ke"
    }
  ],
  resources: [
    {
      title: "Agriculture Lab Manual",
      uploadedBy: "Mr. Odhiambo",
      date: "2025-11-15",
      session: "2025-2026",
      url: "#",
      type: "pdf",
      color: "#28a745"
    },
    {
      title: "Computer Programming Notes",
      uploadedBy: "Ms. Achieng",
      date: "2025-10-20",
      session: "2025-2026",
      url: "#",
      type: "pdf",
      color: "#007bff"
    },
    {
      title: "Home Science Recipe Guide",
      uploadedBy: "Mrs. Kamau",
      date: "2025-09-15",
      session: "2025-2026",
      url: "#",
      type: "pdf",
      color: "#ffc107"
    }
  ],
  events: [
    {
      title: "Agriculture Exhibition",
      date: "2025-12-18",
      time: "09:00 AM",
      location: "School Field",
      session: "2025-2026",
      description: "Showcase of student farming projects and innovations.",
      color: "#28a745"
    },
    {
      title: "Coding Bootcamp",
      date: "2025-12-14",
      time: "10:00 AM",
      location: "Computer Lab",
      session: "2025-2026",
      description: "Hands-on programming workshops for students.",
      color: "#007bff"
    },
    {
      title: "Construction Project Showcase",
      date: "2026-01-15",
      time: "02:00 PM",
      location: "Workshop Area",
      session: "2024-2025",
      description: "Demonstration of student building projects.",
      color: "#fd7e14"
    }
  ],
  media: [
    {
      title: "Agriculture Project Photos",
      uploadedBy: "Mr. Odhiambo",
      date: "2025-11-20",
      session: "2025-2026",
      url: "/assets/images/defaults/default-gallery.jpg",
      type: "image"
    },
    {
      title: "Coding Workshop",
      uploadedBy: "Ms. Achieng",
      date: "2025-10-25",
      session: "2025-2026",
      url: "/assets/images/defaults/default-gallery.jpg",
      type: "image"
    },
    {
      title: "Home Science Cooking",
      uploadedBy: "Mrs. Kamau",
      date: "2025-09-20",
      session: "2025-2026",
      url: "/assets/images/defaults/default-gallery.jpg",
      type: "image"
    }
  ]
};

// ==================== LOAD DATA FROM JSON ====================
async function loadDepartmentData() {
  try {
    try {
      const res = await fetch("/data/departments/applied-sciences-data.json", { 
        cache: "no-store" 
      });
      if (res.ok) {
        DATA = await res.json();
      } else {
        console.warn("JSON fetch failed, using fallback data");
        DATA = JSON.parse(JSON.stringify(FALLBACK_DATA));
      }
    } catch (fetchError) {
      console.warn("Fetch error, using fallback data:", fetchError.message);
      DATA = JSON.parse(JSON.stringify(FALLBACK_DATA));
    }

    // Ensure all sections exist
    DATA.subjects = DATA.subjects || [];
    DATA.teachers = DATA.teachers || [];
    DATA.resources = DATA.resources || [];
    DATA.events = DATA.events || [];
    DATA.media = DATA.media || [];

    renderAll();
    populateSessionFilter();
    setupSearchAndFilters();
  } catch (err) {
    console.error("Load error:", err);
    // Use fallback data as last resort
    DATA = JSON.parse(JSON.stringify(FALLBACK_DATA));
    renderAll();
    populateSessionFilter();
    setupSearchAndFilters();
  }
}

// ==================== POPULATE SESSION FILTER ====================
function populateSessionFilter() {
  const filter = document.getElementById("sessionFilter");
  if (!filter) return;

  const sessions = [...new Set([
    ...DATA.subjects?.map(s => s.session).filter(Boolean) || [],
    ...DATA.resources?.map(r => r.session).filter(Boolean) || [],
    ...DATA.events?.map(e => e.session).filter(Boolean) || [],
    ...DATA.media?.map(m => m.session).filter(Boolean) || []
  ])].sort().reverse();

  // Clear existing options except the first one
  filter.innerHTML = '<option value="">All Academic Years</option>';
  
  sessions.forEach(sess => {
    const opt = document.createElement("option");
    opt.value = sess;
    opt.textContent = sess;
    filter.appendChild(opt);
  });
}

// ==================== SETUP SEARCH AND FILTERS ====================
function setupSearchAndFilters() {
  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = e.target.value.toLowerCase().trim();
        applyFilters();
      }, 300);
    });
  }

  // Session filter
  const sessionFilter = document.getElementById("sessionFilter");
  if (sessionFilter) {
    sessionFilter.addEventListener("change", (e) => {
      currentSession = e.target.value;
      applyFilters();
    });
  }

  // Content type filters
  const contentTypeRadios = document.querySelectorAll('input[name="contentType"]');
  contentTypeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentContentType = e.target.value;
      applyFilters();
    });
  });
}

// ==================== APPLY FILTERS ====================
function applyFilters() {
  let filtered = {
    subjects: DATA.subjects || [],
    teachers: DATA.teachers || [],
    resources: DATA.resources || [],
    events: DATA.events || [],
    media: DATA.media || []
  };

  // Apply search
  if (searchQuery) {
    const query = searchQuery;
    filtered.subjects = filtered.subjects.filter(s => 
      s.name?.toLowerCase().includes(query) ||
      s.teacher?.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query)
    );
    filtered.teachers = filtered.teachers.filter(t => 
      t.name?.toLowerCase().includes(query) ||
      t.subjects?.some(s => s.toLowerCase().includes(query)) ||
      t.email?.toLowerCase().includes(query)
    );
    filtered.resources = filtered.resources.filter(r => 
      r.title?.toLowerCase().includes(query) ||
      r.uploadedBy?.toLowerCase().includes(query)
    );
    filtered.events = filtered.events.filter(e => 
      e.title?.toLowerCase().includes(query) ||
      e.description?.toLowerCase().includes(query) ||
      e.location?.toLowerCase().includes(query)
    );
    filtered.media = filtered.media.filter(m => 
      m.title?.toLowerCase().includes(query) ||
      m.uploadedBy?.toLowerCase().includes(query)
    );
  }

  // Apply session filter
  if (currentSession) {
    filtered.subjects = filtered.subjects.filter(s => !s.session || s.session === currentSession);
    filtered.resources = filtered.resources.filter(r => !r.session || r.session === currentSession);
    filtered.events = filtered.events.filter(e => !e.session || e.session === currentSession);
    filtered.media = filtered.media.filter(m => !m.session || m.session === currentSession);
  }

  // Apply content type filter
  switch (currentContentType) {
    case "subjects":
      filtered = { subjects: filtered.subjects, teachers: [], resources: [], events: [], media: [] };
      break;
    case "resources":
      filtered = { subjects: [], teachers: [], resources: filtered.resources, events: [], media: [] };
      break;
    case "events":
      filtered = { subjects: [], teachers: [], resources: [], events: filtered.events, media: [] };
      break;
    case "media":
      filtered = { subjects: [], teachers: [], resources: [], events: [], media: filtered.media };
      break;
    default:
      // Show all
      break;
  }

  renderAll(filtered);
}

// ==================== RENDER ALL SECTIONS ====================
function renderAll(filteredData = DATA) {
  loadSubjects(filteredData.subjects);
  loadTeachers(filteredData.teachers);
  loadResources(filteredData.resources);
  loadEvents(filteredData.events);
  loadMedia(filteredData.media);
}

// ==================== RENDER FUNCTIONS ====================
function loadSubjects(data) {
  const grid = document.getElementById("subjectsGrid");
  if (!grid) return;

  const subjects = data || [];
  grid.innerHTML = subjects.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No subjects found for this session.</div>`
    : subjects.map(s => `
      <div class="grid-item">
        <div class="subject-card p-4 p-md-5 text-center h-100 glass-card shadow-sm">
          <div class="subject-icon mb-4">
            <i class="fas ${s.icon || 'fa-flask'}"></i>
          </div>
          <h3 class="h5 fw-bold mb-2">${s.name}</h3>
          <p class="text-muted small mb-2">Teacher: ${s.teacher}</p>
          <p class="mb-3">${s.description}</p>
          <span class="badge bg-info">${s.session || 'All Years'}</span>
        </div>
      </div>
    `).join("");
}

function loadTeachers(data) {
  const grid = document.getElementById("teachersGrid");
  if (!grid) return;

  const teachers = data || [];
  grid.innerHTML = teachers.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No teachers listed.</div>`
    : teachers.map(t => `
      <div class="grid-item">
        <div class="teacher-card text-center p-4 glass-card">
          <img src="${t.photo || '/assets/images/defaults/default-user.jpg'}"
               class="teacher-image mb-3 shadow lazy"
               width="140" height="140" alt="${t.name}"
               loading="lazy"
               data-src="${t.photo || '/assets/images/defaults/default-user.jpg'}">
          <h4 class="fw-bold teacher-name">${t.name}</h4>
          <p class="text-muted mb-1 teacher-subjects">${t.subjects?.join(" • ") || "Applied Sciences"}</p>
          <p class="small text-primary">${t.email}</p>
        </div>
      </div>
    `).join("");

  // Initialize lazy loading
  initializeLazyLoading();
}

function loadResources(data) {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  const resources = data || [];
  grid.innerHTML = resources.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No resources uploaded yet.</div>`
    : resources.map(r => `
      <div class="grid-item">
        <div class="resource-card p-4 glass-card h-100">
          <div class="resource-icon mb-3">
            <i class="fas ${getFileIcon(r.type)}"></i>
          </div>
          <h5 class="fw-bold resource-title">${r.title}</h5>
          <p class="text-muted small resource-meta">By: ${r.uploadedBy} • ${formatDate(r.date)}</p>
          <a href="${r.url}" class="btn btn-outline-success btn-sm w-100 mt-3" download>
            <i class="fas fa-download me-2"></i>
            Download ${r.type === 'video' ? 'Video' : 'File'}
          </a>
        </div>
      </div>
    `).join("");
}

function loadEvents(data) {
  const grid = document.getElementById("eventsGrid");
  if (!grid) return;

  const events = data || [];
  grid.innerHTML = events.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No upcoming events.</div>`
    : events.map(e => `
      <div class="grid-item">
        <div class="event-card p-4 glass-card" style="background: ${e.color || '#1a5d57'};">
          <div class="event-date mb-3">
            <span class="h3 fw-bold d-block">${new Date(e.date).getDate()}</span>
            <span class="text-uppercase small">${new Date(e.date).toLocaleDateString('en-KE', { month: 'short' })}</span>
          </div>
          <h5 class="fw-bold mb-2">${e.title}</h5>
          ${e.time ? `<p class="small opacity-90 mb-1"><i class="far fa-clock me-1"></i>${e.time}</p>` : ''}
          ${e.location ? `<p class="small opacity-90 mb-2"><i class="fas fa-map-marker-alt me-1"></i>${e.location}</p>` : ''}
          <p class="mt-3 mb-0">${e.description}</p>
        </div>
      </div>
    `).join("");
}

function loadMedia(data) {
  const grid = document.getElementById("mediaGrid");
  if (!grid) return;

  const media = data || [];
  grid.innerHTML = media.length === 0
    ? `<div class="col-12 text-center py-5 text-muted">No media uploaded yet.</div>`
    : media.map(m => `
      <div class="grid-item">
        <div class="media-card glass-card overflow-hidden">
          ${m.type === 'video'
            ? `<video controls class="w-100" poster="${m.thumbnail || ''}">
                 <source src="${m.url}" type="video/mp4">
                 Your browser does not support video.
               </video>`
            : `<div class="media-image-wrapper">
                 <img src="${m.url}" class="img-fluid w-100" alt="${m.title}" loading="lazy">
               </div>`
          }
          <div class="p-3">
            <h5 class="mb-1">${m.title}</h5>
            <p class="text-muted small mb-0"><i class="fas fa-user me-1"></i>${m.uploadedBy} • ${formatDate(m.date)}</p>
          </div>
        </div>
      </div>
    `).join("");
}

// ==================== FILE UPLOAD ====================
function setupFileUpload() {
  const input = document.getElementById("fileUpload");
  const dropZone = document.getElementById("dropZone");
  
  if (!input) return;

  // Show drop zone on label click
  const uploadLabel = input.closest('label');
  if (uploadLabel && dropZone) {
    uploadLabel.addEventListener('click', () => {
      dropZone.classList.remove('d-none');
    });
  }

  // File input change
  input.addEventListener("change", async function () {
    if (this.files.length === 0) return;
    await uploadFiles(this.files);
  });

  // Drop zone events
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-primary', 'text-white');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('bg-primary', 'text-white');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-primary', 'text-white');
      if (e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        uploadFiles(e.dataTransfer.files);
      }
    });

    dropZone.addEventListener('click', () => input.click());
  }
}

async function uploadFiles(files) {
  const progressDiv = document.getElementById("uploadProgress");
  const progressBar = document.getElementById("progressBar");
  const statusDiv = document.getElementById("uploadStatus");
  
  if (!progressDiv || !progressBar) return;

  progressDiv.classList.remove("d-none");
  
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append("files", file);
  });

  try {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      progressBar.style.width = i + "%";
      progressBar.textContent = i + "%";
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // For demo, show success
    showAlert(`Uploaded ${files.length} file(s) successfully! (Demo mode)`, "success");
    
    // Reset
    progressDiv.classList.add("d-none");
    progressBar.style.width = "0%";
    progressBar.textContent = "0%";
    
  } catch (err) {
    console.error("Upload error:", err);
    showAlert("Upload failed. Please try again.", "danger");
    progressDiv.classList.add("d-none");
  }
}

// ==================== UTILITIES ====================
function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    docx: "fa-file-word",
    video: "fa-file-video",
    image: "fa-file-image",
    ppt: "fa-file-powerpoint",
    pptx: "fa-file-powerpoint",
    xls: "fa-file-excel",
    xlsx: "fa-file-excel"
  };
  return icons[type] || "fa-file-alt";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:80px; right:20px; z-index:9999; max-width:400px;";
  alert.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

// ==================== LAZY LOADING ====================
function initializeLazyLoading() {
  const lazyImages = document.querySelectorAll('img.lazy');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
      img.classList.remove('lazy');
    });
  }
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for w3.includeHTML to complete
  if (typeof w3 !== 'undefined') {
    w3.includeHTML(async () => {
      await initPage();
    });
  } else {
    await initPage();
  }
});

async function initPage() {
  // Show main content
  document.getElementById("mainContent")?.classList.remove("d-none");
  
  // Load department data
  await loadDepartmentData();

  // Setup file upload
  setupFileUpload();

  // Initialize accessibility features
  initializeAccessibility();
}

function initializeAccessibility() {
  // Add keyboard navigation support for the drop zone
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('fileUpload').click();
      }
    });
  }
  
  // Add aria-labels for dynamic content
  const sections = ['subjectsGrid', 'teachersGrid', 'resourcesGrid', 'eventsGrid', 'mediaGrid'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const label = id.replace('Grid', '').replace(/([A-Z])/g, ' $1').toLowerCase().trim();
      element.setAttribute('aria-label', `Loading ${label}`);
    }
  });
}
