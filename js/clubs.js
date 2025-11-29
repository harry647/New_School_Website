// /static/clubs/clubs.js
// Fully dynamic – loads clubs from /static/clubs/clubs.json and events.json
// Updated 2025+ – dashboard-ready, filterable, login-protected, back-button ready

let CLUBS = [];
let EVENTS = [];

// === LOGIN CHECK ===
function isUserLoggedIn() {
  return (
    localStorage.getItem("userLoggedIn") === "true" ||
    sessionStorage.getItem("userToken") ||
    document.cookie.includes("auth=") ||
    window.currentUser
  );
}

function showLoginPrompt() {
  document.getElementById("mainContent")?.classList.add("d-none");
  document.getElementById("loginCheck")?.classList.remove("d-none");
}

// === CLUB GRID ===
function loadClubsList(filtered = CLUBS) {
  const grid = document.getElementById("clubsGrid");
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No clubs found.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(club => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="glass-card p-5 text-center text-white h-100 shadow-lg"
           style="border-top: 8px solid ${club.color}; cursor: pointer;"
           onclick="loadClub('${club.id}')">
        <i class="fas ${club.icon} fa-4x mb-4"></i>
        <h3 class="h4 fw-bold mb-2">${club.name}</h3>
        <p class="small opacity-80">${club.category || "General"} • Click to explore →</p>
        <p class="club-leader">Leader: ${club.leader || "TBA"}</p>
      </div>
    </div>
  `).join("");
}

// === LOAD INDIVIDUAL CLUB PAGE ===
function loadClub(id) {
  const container = document.getElementById("clubContainer");
  const grid = document.getElementById("clubsGrid");
  if (!container || !grid) return;

  grid.style.display = "none";
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" style="width:4rem;height:4rem;"></div>
      <p class="mt-3 text-muted">Loading club...</p>
    </div>`;

  fetch(`/static/clubs/clubs/${id}.html`)
    .then(r => r.ok ? r.text() : Promise.reject("Not found"))
    .then(html => {
      container.innerHTML = html;

      // Re-initialize Fancybox if available
      if (window.Fancybox) {
        Fancybox.bind("[data-fancybox]", {
          Thumbs: { autoStart: false },
          Toolbar: { display: ["zoom","slideshow","download","close"] }
        });
      }

      // Execute scripts in loaded HTML
      container.querySelectorAll("script").forEach(old => {
        const script = document.createElement("script");
        Array.from(old.attributes).forEach(attr => script.setAttribute(attr.name, attr.value));
        script.appendChild(document.createTextNode(old.innerHTML));
        old.parentNode.replaceChild(script, old);
      });

      // Show upcoming events for this club
      displayClubEvents(id);

      history.pushState({ club: id }, "", `#${id}`);
    })
    .catch(() => {
      container.innerHTML = `
        <div class="text-center py-5 text-danger">
          <i class="fas fa-exclamation-triangle fa-4x mb-3"></i>
          <h3>Club Not Found</h3>
          <p>The requested club page could not be loaded.</p>
          <button onclick="showAllClubs()" class="btn btn-primary btn-lg">Back to Clubs</button>
        </div>`;
    });
}

// === DISPLAY EVENTS FOR SPECIFIC CLUB ===
function displayClubEvents(clubId) {
  const eventsContainer = document.getElementById("clubEvents");
  if (!eventsContainer) return;

  const clubEvents = EVENTS.find(ev => ev.clubId === clubId)?.events || [];
  if (clubEvents.length === 0) {
    eventsContainer.innerHTML = `<p class="text-muted text-center py-3">No upcoming events.</p>`;
    return;
  }

  eventsContainer.innerHTML = clubEvents.map(ev => `
    <div class="glass-card p-4 text-white mb-3">
      <i class="fas fa-calendar-alt fa-2x mb-2"></i>
      <h5 class="mb-1">${ev.title}</h5>
      <p class="small opacity-80">${ev.date} • ${ev.location}</p>
      <p>${ev.description}</p>
    </div>
  `).join("");
}

// === BACK TO ALL CLUBS ===
function showAllClubs() {
  document.getElementById("clubsGrid").style.display = "flex";
  document.getElementById("clubContainer").innerHTML = "";
  history.pushState({}, "", "/static/clubs.html");
}

// === JOIN MODAL ===
function openJoinModal(clubName) {
  document.getElementById("modalClubName").textContent = clubName;
  new bootstrap.Modal(document.getElementById("joinModal")).show();
}

// === BACK/FORWARD BUTTON SUPPORT ===
window.addEventListener("popstate", () => {
  if (!location.hash || location.hash === "#") {
    showAllClubs();
  } else {
    const id = location.hash.substring(1);
    if (CLUBS.find(c => c.id === id)) loadClub(id);
  }
});

// === SEARCH & CATEGORY FILTER ===
function filterClubs(search = "", category = "") {
  const filtered = CLUBS.filter(c => {
    return (!search || c.name.toLowerCase().includes(search.toLowerCase())) &&
           (!category || c.category === category);
  });
  loadClubsList(filtered);
}

// === LOAD UPCOMING EVENTS DASHBOARD ===
function loadUpcomingEvents() {
  const grid = document.getElementById("eventsGrid");
  if (!grid || !EVENTS.length) return;

  const allEvents = EVENTS.flatMap(ev => ev.events.map(e => {
    const clubName = CLUBS.find(c => c.id === ev.clubId)?.name || "Unknown Club";
    return { ...e, club: clubName };
  }));

  grid.innerHTML = allEvents.map(ev => `
    <div class="col-md-6 col-lg-4">
      <div class="glass-card p-4 text-white text-center">
        <i class="fas fa-calendar-alt fa-3x mb-3"></i>
        <h5>${ev.title}</h5>
        <p class="small opacity-80">${ev.date}</p>
        <p>${ev.club}</p>
      </div>
    </div>
  `).join("");
}

// === FETCH CLUBS + EVENTS JSON ===
Promise.all([
  fetch("/static/clubs/clubs.json").then(r => r.ok ? r.json() : Promise.reject("clubs.json missing")),
  fetch("/static/clubs/events.json").then(r => r.ok ? r.json() : [])
]).then(([clubsData, eventsData]) => {
  CLUBS = clubsData;
  EVENTS = eventsData;

  w3.includeHTML(() => {
    if (isUserLoggedIn()) {
      document.getElementById("mainContent")?.classList.remove("d-none");
      loadClubsList();
      loadUpcomingEvents();

      // Auto-load club if hash exists
      if (location.hash) {
        const id = location.hash.substring(1);
        if (CLUBS.find(c => c.id === id)) loadClub(id);
      }

      // Attach search/filter listeners
      document.getElementById("clubSearch")?.addEventListener("input", e =>
        filterClubs(e.target.value, document.getElementById("clubCategoryFilter").value)
      );
      document.getElementById("clubCategoryFilter")?.addEventListener("change", e =>
        filterClubs(document.getElementById("clubSearch").value, e.target.value)
      );

    } else {
      showLoginPrompt();
    }
  });
}).catch(err => {
  console.error("Failed to load clubs or events:", err);
  document.body.innerHTML = `
    <div class="text-center py-5 text-danger">
      <h1>Error Loading Clubs</h1>
      <p>Could not load club or event data. Please try again later.</p>
    </div>`;
});
