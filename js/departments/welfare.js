// =======================================================
// welfare.js – Full Welfare & Support System (2026+)
// Backend-powered, anonymous support request, file upload, team & resources
// =======================================================

let DATA = { announcements: [], team: [], resources: [] };

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

    // Load all data from backend
    loadWelfareData();

    // Setup file upload for support request
    setupFileUpload();
  });
});

// ==================== LOAD DATA FROM BACKEND ====================
async function loadWelfareData() {
  try {
    const res = await fetch("/api/welfare/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed");

    DATA = await res.json();

    renderAnnouncements();
    renderTeam();
    renderResources();
  } catch (err) {
    console.error("Load error:", err);
    showAlert("Unable to load welfare content. Please try again.", "danger");
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderAnnouncements() {
  const list = document.querySelector("#announcements ul");
  if (!list) return;

  list.innerHTML = DATA.announcements.length === 0
    ? `<li class="text-center text-white-50">No announcements at the moment.</li>`
    : DATA.announcements.map(a => `
      <li class="mb-3">
        <i class="fas ${a.icon || 'fa-bell'} me-3 text-warning"></i>
        <strong>${a.text}</strong>
        ${a.date ? `<span class="text-white-50 ms-2">— ${formatDate(a.date)}</span>` : ''}
      </li>
    `).join("");
}

function renderTeam() {
  const grid = document.getElementById("teamGrid");
  if (!grid) return;

  grid.innerHTML = DATA.team.length === 0
    ? `<div class="col-12 text-center py-5 text-white-50">No team members listed.</div>`
    : DATA.team.map(m => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="glass-card p-5 text-center text-white shadow-sm">
          <img src="${m.photo || '/assets/images/defaults/staff.png'}" 
               class="rounded-circle mb-4 shadow" width="140" height="140" alt="${m.name}">
          <h4 class="fw-bold mb-2">${m.name}</h4>
          <p class="mb-1">${m.role}</p>
          <p class="small text-white-75 mb-3">${m.contact || ''}</p>
          <button onclick="openSupportRequest('${m.name}')" 
                  class="btn btn-outline-light btn-sm w-100">
            Request Support
          </button>
        </div>
      </div>
    `).join("");
}

function renderResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!grid) return;

  grid.innerHTML = DATA.resources.length === 0
    ? `<div class="col-12 text-center py-5 text-white-50">No wellness resources available.</div>`
    : DATA.resources.map(r => `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="glass-card p-5 text-center text-white shadow-sm">
          <i class="fas ${r.icon || 'fa-heart'} fa-4x mb-4 text-danger"></i>
          <h5 class="fw-bold mb-3">${r.title}</h5>
          <p class="small text-white-75 mb-3">${r.description || ''}</p>
          <a href="${r.url}" 
             class="btn btn-outline-light btn-sm w-100" 
             ${r.type === 'pdf' ? 'download' : 'target="_blank"'} 
             data-fancybox>
            ${r.type === 'video' ? 'Watch Video' : r.type === 'audio' ? 'Listen' : 'Open Resource'}
          </a>
        </div>
      </div>
    `).join("");

  // Re-init Fancybox for videos/PDFs
  if (window.Fancybox) {
    Fancybox.bind("[data-fancybox]");
  }
}

// ==================== SUPPORT REQUEST FORM ====================
function openSupportRequest(teamMemberName = "") {
  document.getElementById("userType").value = "";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("supportType").value = "";
  document.getElementById("description").value = "";
  document.getElementById("attachments").value = "";

  if (teamMemberName) {
    showAlert(`Preparing request for ${teamMemberName}...`, "info");
  }

  scrollToSection("request");
}

async function submitWelfareRequest() {
  const userType = document.getElementById("userType").value;
  const name = document.getElementById("name").value.trim() || "Anonymous";
  const email = document.getElementById("email").value.trim();
  const supportType = document.getElementById("supportType").value;
  const description = document.getElementById("description").value.trim();
  const files = document.getElementById("attachments").files;

  if (!email || !supportType || !description) {
    showAlert("Email, support type, and description are required.", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("userType", userType);
  formData.append("name", name);
  formData.append("email", email);
  formData.append("supportType", supportType);
  formData.append("description", description);
  Array.from(files).forEach(file => formData.append("attachments", file));

  try {
    const res = await fetch("/api/welfare/request", {
      method: "POST",
      body: formData
    });

    const result = await res.json();

    if (result.success) {
      showAlert("Your request has been submitted. A welfare officer will contact you within 24 hours.", "success");
      document.querySelectorAll("#request input, #request textarea, #request select").forEach(el => el.value = "");
      document.getElementById("attachments").value = "";
    } else {
      throw new Error(result.message || "Failed");
    }
  } catch (err) {
    console.error(err);
    showAlert("Failed to submit request. Try again or call emergency hotline.", "danger");
  }
}

// ==================== FILE UPLOAD FOR SUPPORT REQUEST ====================
function setupFileUpload() {
  const input = document.getElementById("attachments");
  if (!input) return;

  // Optional: preview or count files
  input.addEventListener("change", function () {
    const count = this.files.length;
    if (count > 0) {
      showAlert(`Attached ${count} file(s)`, "info");
    }
  });
}

// ==================== UTILITIES ====================
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width:300px;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 6000);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}