// =======================================================
// clubs.js – Full Clubs & Societies System (2026+)
// Backend-powered, mobile-perfect, secure, beautiful
// =======================================================

let CLUBS = [];
let EVENTS = [];
let currentClubId = null;

// ==================== AUTH ====================
function isUserLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isUserLoggedIn()) {
      document.getElementById("loginCheck")?.classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent")?.classList.remove("d-none");

    // Load data from backend
    loadClubsAndEvents();

    // Search & filter
    document.getElementById("clubSearch")?.addEventListener("input", filterClubs);
    document.getElementById("clubCategoryFilter")?.addEventListener("change", filterClubs);

    // Handle URL hash (deep linking)
    if (location.hash) {
      const id = location.hash.substring(1);
      loadClub(id);
    }
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadClubsAndEvents() {
  try {
    const [clubsRes, eventsRes] = await Promise.all([
      fetch("/api/clubs/list", { cache: "no-store" }),
      fetch("/api/clubs/events", { cache: "no-store" })
    ]);

    if (!clubsRes.ok || !eventsRes.ok) throw new Error("API error");

    CLUBS = await clubsRes.json();
    EVENTS = await eventsRes.json();

    renderClubsGrid();
    renderUpcomingEvents();

    // Auto-load club from URL hash
    if (location.hash) {
      const id = location.hash.substring(1);
      if (CLUBS.find(c => c.id === id)) loadClub(id);
    }
  } catch (err) {
    console.error("Failed to load clubs:", err);
    showAlert("Unable to load clubs. Please try again later.", "danger");
  }
}

// ==================== RENDER ALL CLUBS GRID ====================
function renderClubsGrid() {
  const grid = document.getElementById("clubsGrid");
  if (!grid) return;

  if (CLUBS.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">No clubs available.</div>`;
    return;
  }

  grid.innerHTML = CLUBS.map(club => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="glass-card p-5 text-center text-white h-100 shadow-lg cursor-pointer"
           style="border-top: 8px solid ${club.color || '#007bff'};"
           onclick="loadClub('${club.id}')">
        <i class="fas ${club.icon || 'fa-users'} fa-4x mb-4"></i>
        <h3 class="h4 fw-bold mb-2">${club.name}</h3>
        <p class="small opacity-80">${club.category || "General"} • ${club.members || 0} Members</p>
        <p class="mt-3">${club.shortDesc || "Click to explore →"}</p>
      </div>
    </div>
  `).join("");
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
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" style="width:4rem;height:4rem;"></div>
      <p class="mt-3">Loading ${club.name}...</p>
    </div>
  `;

  try {
    const res = await fetch(`/clubs/subfiles/${id}.html`);
    if (!res.ok) throw new Error("NotFound");

    const html = await res.text();
    container.innerHTML = html;

    // Re-initialize Fancybox
    if (window.Fancybox) {
      Fancybox.bind(`[data-fancybox]`, {
        Thumbs: { autoStart: false },
        Toolbar: { display: ["zoom", "slideshow", "download", "close"] }
      });
    }

    // Inject club-specific events
    injectClubEvents(id);

    // Setup file upload zone
    setupClubUpload(id);

    // Update URL
    history.pushState({ clubId: id }, club.name, `#${id}`);
  } catch (err) {
    container.innerHTML = `
      <div class="text-center py-5 text-danger">
        <i class="fas fa-exclamation-triangle fa-4x mb-3"></i>
        <h3>Club Page Not Found</h3>
        <button onclick="showAllClubs()" class="btn btn-primary btn-lg mt-3">
          Back to Clubs
        </button>
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
  const zone = document.querySelector(".upload-zone");
  const input = document.getElementById("clubFileInput") || document.querySelector('input[type="file"]');
  const preview = document.getElementById("uploadPreview") || document.createElement("div");

  if (!zone || !input) return;

  // Drag & drop effects
  ["dragenter", "dragover"].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.add("border-primary", "bg-primary/10");
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    zone.addEventListener(evt, e => {
      e.preventDefault();
      zone.classList.remove("border-primary", "bg-primary/10");
    });
  });

  zone.addEventListener("drop", e => {
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  });

  input.addEventListener("change", () => {
    if (input.files.length) handleFiles(input.files);
  });

  async function handleFiles(files) {
    preview.innerHTML = `<p class="text-info">Uploading ${files.length} file(s)...</p>`;

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("files", file));
    formData.append("clubId", clubId);

    try {
      const res = await fetch("/api/clubs/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        preview.innerHTML = `<p class="text-success">Uploaded ${files.length} file(s)!</p>`;
        setTimeout(() => preview.innerHTML = "", 5000);
      } else {
        throw new Error();
      }
    } catch (err) {
      preview.innerHTML = `<p class="text-danger">Upload failed. Try again.</p>`;
    }
  }
}

// ==================== JOIN CLUB FORM ====================
document.getElementById("joinForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/clubs/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        clubId: currentClubId,
        clubName: document.getElementById("modalClubName")?.textContent
      })
    });

    const result = await res.json();

    if (result.success) {
      showAlert("Application submitted! We'll contact you soon.", "success");
      bootstrap.Modal.getInstance(document.getElementById("joinModal")).hide();
      this.reset();
    } else {
      showAlert(result.message || "Failed to submit", "danger");
    }
  } catch (err) {
    showAlert("Network error. Try again.", "danger");
  }
});

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

// ==================== UTILITIES ====================
function showAllClubs() {
  document.getElementById("clubsGrid").style.display = "";
  document.getElementById("clubContainer").innerHTML = "";
  history.pushState({}, "", "/clubs/clubs.html");
}

function showAlert(msg, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width:300px;";
  alert.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 6000);
}