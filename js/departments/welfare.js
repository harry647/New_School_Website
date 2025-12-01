// welfare.js – Full Welfare & Support System
let DATA = { announcements: [], team: [], resources: [] };

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

    fetch("/static/welfare/data/welfare-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;
        loadAnnouncements();
        loadTeam();
        loadResources();
        Fancybox.bind("[data-fancybox]");
      });
  });
});

// Load Latest Announcements
function loadAnnouncements() {
  const list = document.querySelector("#announcements ul");
  if (!DATA.announcements.length) {
    list.innerHTML = "<li>No announcements at the moment.</li>";
    return;
  }
  list.innerHTML = DATA.announcements.map(a => `
    <li><i class="fas ${a.icon} me-3"></i> ${a.text}</li>
  `).join("");
}

// Load Welfare Team
function loadTeam() {
  const grid = document.getElementById("teamGrid");
  if (!DATA.team.length) {
    grid.innerHTML = "<p class='text-center'>No team members listed.</p>";
    return;
  }
  grid.innerHTML = DATA.team.map(m => `
    <div class="col-md-6 col-lg-4">
      <div class="glass-card p-5 text-center text-white">
        <img src="${m.photo}" class="rounded-circle mb-3" width="120" alt="${m.name}">
        <h4 class="fw-bold">${m.name}</h4>
        <p class="mb-1">${m.role}</p>
        <p class="small opacity-80">${m.contact}</p>
        <button onclick="alert('Appointment with ${m.name} booked!')" class="btn btn-outline-light btn-sm mt-3">
          Book Session
        </button>
      </div>
    </div>
  `).join("");
}

// Load Wellness Resources
function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  if (!DATA.resources.length) {
    grid.innerHTML = "<p class='text-center'>No resources available.</p>";
    return;
  }
  grid.innerHTML = DATA.resources.map(r => `
    <div class="col-md-6 col-lg-4">
      <div class="glass-card p-4 text-white text-center">
        <i class="fas ${r.icon} fa-4x mb-3"></i>
        <h5>${r.title}</h5>
        <a href="${r.url}" class="btn btn-outline-light btn-sm mt-3" data-fancybox>View / Download</a>
      </div>
    </div>
  `).join("");
}

// Submit Welfare Request Form
function submitWelfareRequest() {
  const userType = document.getElementById("userType").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const supportType = document.getElementById("supportType").value;
  const description = document.getElementById("description").value;

  if (!userType || !email || !supportType || !description) {
    alert("Please fill in all required fields.");
    return;
  }

  // Here you can implement AJAX to send form to backend
  console.log({
    userType, name, email, supportType, description,
    attachments: document.getElementById("attachments").files
  });

  alert("Your request has been submitted. A welfare officer will contact you within 24 hours.");
  document.querySelector("#userType").value = "";
  document.querySelector("#name").value = "";
  document.querySelector("#email").value = "";
  document.querySelector("#supportType").value = "";
  document.querySelector("#description").value = "";
  document.getElementById("attachments").value = "";
}
