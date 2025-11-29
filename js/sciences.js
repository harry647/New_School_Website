// sciences.js – Full Featured Science Department System
let DATA = { teachers: [], achievements: [], resources: [], competitions: [] };

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

    fetch("/static/sciences/data/science-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;
        loadTeachers();
        loadAchievements();
        loadResources();
        loadCompetitions();
        Fancybox.bind("[data-fancybox]");
      });
  });
});

function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  grid.innerHTML = DATA.teachers.map(t => `
    <div class="col-md-6 col-lg-4">
      <div class="teacher-card text-center p-4">
        <img src="${t.photo}" class="rounded-circle mb-3" width="120" alt="${t.name}">
        <h4 class="fw-bold">${t.name}</h4>
        <p class="text-muted">${t.subject}</p>
        <span class="dept-badge ${t.dept.toLowerCase()} text-white">
          ${t.dept.charAt(0).toUpperCase() + t.dept.slice(1)}
        </span>
      </div>
    </div>
  `).join("");
}

function loadAchievements() {
  const grid = document.getElementById("achievementsGrid");
  grid.innerHTML = DATA.achievements.map((a, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <div class="achievement-card p-4 text-center mx-auto" style="max-width: 400px;">
        <i class="fas fa-trophy fa-3x text-warning mb-3"></i>
        <h5>${a.title}</h5>
        <p class="text-muted">${a.student} • ${a.year}</p>
        <p>${a.event}</p>
      </div>
    </div>
  `).join("");
}

function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4">
        <i class="fas ${r.icon} fa-3x mb-3" style="color:${r.color}"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">Uploaded: ${r.date}</p>
        <p class="text-muted">${r.description || ''}</p>
        <a href="${r.url}" data-fancybox="resources" class="btn btn-outline-primary btn-sm w-100">View / Download</a>
      </div>
    </div>
  `).join("");

  document.getElementById("uploadFile").onchange = e => {
    alert(`Uploading ${e.target.files.length} file(s) as lab resource...`);
  };

  const studentUpload = document.getElementById("studentUpload");
  if(studentUpload){
    studentUpload.onchange = e => {
      alert(`Student submission received: ${e.target.files.length} file(s)`);
    };
  }
}

function loadCompetitions() {
  const grid = document.getElementById("competitionsGrid");
  grid.innerHTML = DATA.competitions.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="competition-card glass-card p-4 text-center">
        <h5 class="fw-bold">${c.name}</h5>
        <p class="text-muted">${c.date} • ${c.location}</p>
        <p>${c.description}</p>
        <button class="btn btn-success btn-lg mt-2">Register</button>
      </div>
    </div>
  `).join("");
}
