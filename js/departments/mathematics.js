// Mathematics Department – Upgraded to Match New HTML Features
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

    fetch("/static/mathematics/data/math-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;

        // Load Everything
        loadTeachers();
        loadAchievements();
        loadResources();
        loadCompetitions();

        // Enable Fancybox for images, certificates, videos
        Fancybox.bind("[data-fancybox]");
      });

    // Session Filter
    document.getElementById("sessionFilter").addEventListener("change", loadResources);
  });
});

/* -----------------------------
   TEACHERS GRID + PROFILE MODAL
--------------------------------*/
function loadTeachers() {
  const grid = document.getElementById("teachersGrid");
  grid.innerHTML = DATA.teachers.map(t => `
    <div class="col-md-6 col-lg-4">
      <div class="teacher-card text-center p-4">
        <img src="${t.photo}" class="rounded-circle mb-3 shadow" width="120" alt="${t.name}">
        <h4 class="fw-bold">${t.name}</h4>
        <p class="text-muted">${t.role}</p>
        <p class="small">${t.subject}</p>

        <button class="btn btn-outline-primary btn-sm mt-2"
          onclick='openTeacherProfile(${JSON.stringify(t)})'>
          View Profile
        </button>
      </div>
    </div>
  `).join("");
}

// Teacher Modal
function openTeacherProfile(t) {
  Fancybox.show([{
    src: `
      <div class='p-4 text-center'>
        <img src="${t.photo}" width="150" class="rounded-circle shadow mb-3">
        <h3>${t.name}</h3>
        <p class="text-muted">${t.role}</p>
        <p>${t.subject}</p>

        <hr>
        <p class="text-start"><strong>Teaching Philosophy:</strong> ${t.philosophy || "Not Provided"}</p>
        <p class="text-start"><strong>Experience:</strong> ${t.experience || "Not Provided"}</p>
        <p class="text-start"><strong>Email:</strong> ${t.email || "N/A"}</p>
      </div>
    `,
    type: "html"
  }]);
}

/* -----------------------------
   ACHIEVEMENTS (Supports Images)
--------------------------------*/
function loadAchievements() {
  const grid = document.getElementById("achievementsGrid");

  grid.innerHTML = DATA.achievements.map(a => `
    <div class="col-md-6 col-lg-4">
      <div class="achievement-card p-4 text-center">
        <i class="fas fa-trophy fa-3x text-warning mb-3"></i>
        <h5>${a.title}</h5>
        <p class="text-muted">${a.student} • ${a.year}</p>
        <p>${a.event}</p>

        ${a.photo ? `
          <a data-fancybox="achievement" href="${a.photo}">
            <img src="${a.photo}" class="img-fluid rounded mt-3 shadow-sm" style="max-height:180px; object-fit:cover;">
          </a>
        ` : ""}
      </div>
    </div>
  `).join("");
}

/* --------------------------------
   RESOURCES + AUTO ICON DETECTION
---------------------------------*/
function getFileIcon(file) {
  const ext = file.split(".").pop();

  return {
    pdf: "fa-file-pdf text-danger",
    doc: "fa-file-word text-primary",
    docx: "fa-file-word text-primary",
    mp4: "fa-file-video text-success",
    zip: "fa-file-zipper text-warning"
  }[ext] || "fa-file";
}

function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  const session = document.getElementById("sessionFilter").value;

  const filtered = session
    ? DATA.resources.filter(r => r.session === session)
    : DATA.resources;

  grid.innerHTML = filtered.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card p-4">
        <i class="fa-solid ${getFileIcon(r.url)} fa-3x mb-3"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">Uploaded by ${r.uploadedBy} — ${r.date}</p>

        <a href="${r.url}" target="_blank" class="btn btn-outline-primary btn-sm">Download</a>

        ${r.preview ? `
          <a data-fancybox href="${r.preview}" class="btn btn-outline-dark btn-sm ms-2">
            Preview
          </a>
        ` : ""}
      </div>
    </div>
  `).join("");

  document.getElementById("fileUpload").onchange = e => {
    alert(`Uploading ${e.target.files.length} file(s)...`);
  };
}

/* ---------------------------------
   COMPETITIONS (Now Supports Gallery)
-----------------------------------*/
function loadCompetitions() {
  const grid = document.getElementById("competitionsGrid");

  grid.innerHTML = DATA.competitions.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="competition-card p-4 text-center">
        <h4 class="fw-bold">${c.name}</h4>
        <p class="text-muted">${c.year}</p>
        <p>${c.description}</p>

        ${c.poster ? `
          <a data-fancybox="competitions" href="${c.poster}">
            <img src="${c.poster}" class="img-fluid rounded shadow-sm mt-3" style="max-height:180px;">
          </a>
        ` : ""}

        <button class="btn btn-success mt-3">Register</button>
      </div>
    </div>
  `).join("");
}
