// Co-Curricular Activities – Full Featured System
let ACTIVITIES = [];
let EVENTS = [];
let GALLERY = [];
let COORDINATORS = [];

function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck").classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent").classList.remove("d-none");

    // Load JSON Data
    fetch("/static/co-curriculum/data/activities.json")
      .then(r => r.json())
      .then(data => {
        ACTIVITIES = data.activities || [];
        EVENTS = data.events || [];
        GALLERY = data.gallery || [];
        COORDINATORS = data.coordinators || [];

        loadActivities();
        loadAchievements();
        loadEvents();
        loadGallery();
        loadCoordinators();
        populateActivitySelect();
        setupForms();

        // Initialize Fancybox for gallery
        Fancybox.bind("[data-fancybox]");
      });

    // Session Filter
    const sessionFilter = document.getElementById("sessionFilter");
    if (sessionFilter) {
      sessionFilter.addEventListener("change", e => filterBySession(e.target.value));
    }
  });
});

// Load Activities Grid
function loadActivities(session = "") {
  const grid = document.getElementById("activitiesGrid");
  const filtered = ACTIVITIES.filter(a => !session || a.session === session);
  grid.innerHTML = filtered.map(act => `
    <div class="col-md-6 col-lg-4">
      <div class="activity-card p-4 text-center h-100 glass-card">
        <div class="icon-circle mb-4 mx-auto" style="background: ${act.color};">
          <i class="fas ${act.icon} fa-3x text-white"></i>
        </div>
        <h3 class="h5 fw-bold">${act.name}</h3>
        <p class="text-muted">${act.description}</p>
        <button onclick="openJoinModal('${act.name}')" class="btn btn-outline-primary btn-sm mt-3">
          Join ${act.name}
        </button>
      </div>
    </div>
  `).join("");
}

// Load Achievements
function loadAchievements() {
  const grid = document.getElementById("achievementsGrid");
  grid.innerHTML = ACTIVITIES.map(a => `
    <div class="col-md-6 col-lg-4">
      <div class="achievement-card p-4 glass-card">
        <h4>${a.achievement || a.name}</h4>
        <p>${a.achievementDetail || ""}</p>
      </div>
    </div>
  `).join("");
}

// Load Events
function loadEvents(session = "") {
  const grid = document.getElementById("eventsGrid");
  const filtered = EVENTS.filter(e => !session || e.session === session);
  grid.innerHTML = filtered.map(ev => `
    <div class="col-md-6 col-lg-4">
      <div class="event-card p-4 glass-card text-white" style="background:${ev.color}">
        <h5>${ev.title}</h5>
        <p class="small">${ev.date}</p>
        <p>${ev.description}</p>
      </div>
    </div>
  `).join("");
}

// Load Gallery
function loadGallery(session = "") {
  const grid = document.getElementById("photoGallery");
  const filtered = GALLERY.filter(g => !session || g.session === session);
  grid.innerHTML = filtered.map(g => `
    <div class="col-md-4">
      <a href="${g.url}" data-fancybox="gallery" data-caption="${g.caption}">
        <img src="${g.url}" class="img-fluid rounded shadow-sm mb-3" alt="${g.caption}">
      </a>
    </div>
  `).join("");
}

// Load Coordinators
function loadCoordinators() {
  const grid = document.getElementById("coordinatorsGrid");
  grid.innerHTML = COORDINATORS.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="coordinator-card text-center p-4 glass-card">
        <img src="${c.photo}" class="rounded-circle mb-3" width="120" alt="${c.name}">
        <h5>${c.name}</h5>
        <p class="text-muted">${c.role}</p>
      </div>
    </div>
  `).join("");
}

// Populate Activity Selection in Join Form
function populateActivitySelect() {
  const select = document.getElementById("activitySelect");
  if (!select) return;
  select.innerHTML = `<option value="">Choose Activity</option>` +
    ACTIVITIES.map(a => `<option value="${a.name}">${a.name}</option>`).join("");
}

// Form Handling
function setupForms() {
  const photoUpload = document.getElementById("photoUpload");
  if(photoUpload){
    photoUpload.onchange = e => {
      alert(`Uploading ${e.target.files.length} photo(s)...`);
    };
  }

  const joinForm = document.getElementById("joinActivityForm");
  if(joinForm){
    joinForm.onsubmit = e => {
      e.preventDefault();
      alert("Application submitted! A coordinator will contact you soon.");
      joinForm.reset();
    };
  }
}

// Open Join Modal (if using modal)
function openJoinModal(name) {
  const select = document.getElementById("activitySelect");
  if(select) select.value = name;
  window.scrollTo({top: document.getElementById("joinActivityForm").offsetTop - 50, behavior: "smooth"});
}

// Filter by session
function filterBySession(session) {
  loadActivities(session);
  loadEvents(session);
  loadGallery(session);
}
