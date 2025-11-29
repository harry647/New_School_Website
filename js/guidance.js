// Guidance & Counselling – Full Featured System
let DATA = { counsellors: [], resources: [] };
let POSTS = [];

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

    // Load JSON data
    fetch("/static/guidance/data/guidance-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;
        loadCounsellors();
        loadResources();
      });

    // Anonymous posts
    const anonTextarea = document.getElementById("anonymousPost");
    if (anonTextarea) {
      anonTextarea.addEventListener("keydown", e => {
        if (e.key === "Enter" && e.ctrlKey) postAnonymously();
      });
    }

    // Appointment form submit
    const appointmentForm = document.getElementById("appointmentForm");
    if (appointmentForm) {
      appointmentForm.addEventListener("submit", e => {
        e.preventDefault();
        submitAppointment();
      });
    }

    // Resource upload (optional)
    const resourceUpload = document.getElementById("resourceUpload");
    if (resourceUpload) {
      resourceUpload.addEventListener("change", e => {
        alert(`Uploading ${e.target.files.length} file(s)...`);
        resourceUpload.value = "";
      });
    }
  });
});

// Load counsellors dynamically
function loadCounsellors(sessionFilter = "") {
  const grid = document.getElementById("counsellorsGrid");
  let counsellors = DATA.counsellors;

  if (sessionFilter) {
    counsellors = counsellors.filter(c => c.session === sessionFilter);
  }

  grid.innerHTML = counsellors.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="counsellor-card text-center p-4 glass-card">
        <img src="${c.photo}" class="rounded-circle mb-3" width="130" alt="${c.name}">
        <h4 class="fw-bold">${c.name}</h4>
        <p class="text-muted mb-1">${c.title}</p>
        <p class="small text-primary">${c.specialty}</p>
        <button onclick="openAppointment('${c.name}')" class="btn btn-outline-primary btn-sm mt-2">
          Book with ${c.name.split(" ")[0]}
        </button>
      </div>
    </div>
  `).join("");
}

// Load resources dynamically
function loadResources(sessionFilter = "") {
  const grid = document.getElementById("resourcesGrid");
  let resources = DATA.resources;

  if (sessionFilter) {
    resources = resources.filter(r => r.session === sessionFilter);
  }

  grid.innerHTML = resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="resource-card glass-card p-4 text-center">
        <i class="fas ${r.icon} fa-4x mb-3 text-primary"></i>
        <h5>${r.title}</h5>
        <p class="text-muted small">${r.category}</p>
        <a href="${r.url}" class="btn btn-outline-primary btn-sm w-100">Download / View</a>
      </div>
    </div>
  `).join("");
}

// Post anonymously
function postAnonymously() {
  const text = document.getElementById("anonymousPost").value.trim();
  if (!text) return alert("Please write something first.");

  const now = new Date();
  POSTS.unshift({ text, timestamp: now });

  renderAnonymousPosts();
  document.getElementById("anonymousPost").value = "";
  alert("Posted anonymously. A counsellor will respond privately within 24 hours.");
}

// Render anonymous posts
function renderAnonymousPosts() {
  const container = document.getElementById("anonymousPosts");
  container.innerHTML = POSTS.map(p => `
    <div class="glass-card p-4 mb-4">
      <p class="mb-2"><strong>Anonymous</strong> 
        <small class="text-muted">– ${p.timestamp.toLocaleString()}</small>
      </p>
      <p class="text-white-50">${p.text.replace(/\n/g, "<br>")}</p>
      <p class="text-success small mt-3"><em>A counsellor will respond privately within 24 hours.</em></p>
    </div>
  `).join("");
}

// Open appointment section
function openAppointment(counsellorName) {
  const form = document.getElementById("appointmentForm");
  form.querySelector("[placeholder='Your Name (optional for anonymity)']").value = "";
  form.querySelector("[type='email']").focus();
  scrollToSection("appointment");
  alert(`You are booking a session with ${counsellorName}`);
}

// Submit appointment
function submitAppointment() {
  alert("Your counselling session request has been submitted. You will be contacted shortly.");
  document.getElementById("appointmentForm").reset();
}

// Scroll helper
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
