// resources.js – Central School Resources Hub
let DATA = { resources: [], submissions: [], featured: [], tags: [] };
let currentRole = "student"; // student / teacher / admin
let currentPage = 1;
const pageSize = 9;

// Check login status
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

    // Fetch data
    fetch("/static/resources/data/resources-data.json")
      .then(r => r.json())
      .then(data => {
        DATA = data;
        loadAnalytics();
        loadTags();
        loadResources();
        loadFeatured();
        setupFilters();
        setupUploads();
      });
  });
});

// Role switch
function setRole(role) {
  currentRole = role;
  document.getElementById("teacherQuick").classList.toggle("d-none", role !== "teacher");
}

// Load resources into grid
function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  const template = document.getElementById("resourceCardTpl").content;
  
  const filtered = applyFilters(DATA.resources);
  const paged = paginate(filtered, currentPage, pageSize);

  grid.innerHTML = "";
  if (!paged.length) {
    document.getElementById("resourcesEmpty").hidden = false;
    return;
  }
  document.getElementById("resourcesEmpty").hidden = true;

  paged.forEach(r => {
    const clone = document.importNode(template, true);
    clone.querySelector(".resource-title").textContent = r.title;
    clone.querySelector(".meta").textContent = `By: ${r.uploadedBy} • ${r.date}`;
    clone.querySelector(".previewBtn").onclick = () => openPreview(r);
    const download = clone.querySelector(".downloadBtn");
    download.href = r.url;
    download.download = r.title;
    grid.appendChild(clone);
  });

  setupPagination(filtered.length);
}

// Pagination helpers
function paginate(array, page = 1, size = 9) {
  return array.slice((page-1)*size, page*size);
}

function setupPagination(total) {
  const pages = Math.ceil(total/pageSize);
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  for (let i=1;i<=pages;i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i===currentPage?'active':''}`;
    const a = document.createElement("a");
    a.className = "page-link";
    a.href="#";
    a.textContent = i;
    a.onclick = e => { e.preventDefault(); currentPage=i; loadResources(); };
    li.appendChild(a);
    container.appendChild(li);
  }
}

// Filter/search setup
function setupFilters() {
  document.getElementById("categoryFilter").onchange = loadResources;
  document.getElementById("typeFilter").onchange = loadResources;
  document.getElementById("searchInput").oninput = () => {
    currentPage=1;
    loadResources();
  };
}

function applyFilters(items) {
  const category = document.getElementById("categoryFilter").value.toLowerCase();
  const type = document.getElementById("typeFilter").value.toLowerCase();
  const search = document.getElementById("searchInput").value.toLowerCase();

  return items.filter(r => {
    let ok=true;
    if(category) ok = ok && r.category.toLowerCase()===category;
    if(type) ok = ok && r.type.toLowerCase()===type;
    if(search) ok = ok && (r.title.toLowerCase().includes(search) || (r.description && r.description.toLowerCase().includes(search)));
    return ok;
  });
}

// Analytics counts
function loadAnalytics() {
  document.getElementById("countTotal").textContent = DATA.resources.length;
  document.getElementById("countPdf").textContent = DATA.resources.filter(r=>r.type==='pdf').length;
  document.getElementById("countVideo").textContent = DATA.resources.filter(r=>r.type==='video').length;
  document.getElementById("countAudio").textContent = DATA.resources.filter(r=>r.type==='audio').length;
}

// Tags
function loadTags() {
  const container = document.getElementById("tagList");
  container.innerHTML = "";
  const uniqueTags = [...new Set(DATA.tags)];
  uniqueTags.forEach(tag => {
    const span = document.createElement("span");
    span.className="badge bg-secondary";
    span.textContent=tag;
    span.onclick=()=>{document.getElementById("searchInput").value=tag; loadResources();};
    container.appendChild(span);
  });
}

// Featured carousel
function loadFeatured() {
  const carousel = document.getElementById("featuredInner");
  carousel.innerHTML = "";
  DATA.featured.forEach((f,i)=>{
    const div=document.createElement("div");
    div.className="carousel-item" + (i===0?' active':'');
    div.innerHTML = `
      <div class="glass-card p-4 d-flex flex-column flex-md-row gap-4 align-items-center">
        <img src="${f.thumb}" alt="" class="d-none d-md-block" style="width:160px;height:auto;">
        <div>
          <h3 class="h5 fw-bold">${f.title}</h3>
          <p class="mb-2 text-muted">${f.description||''}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-light btn-sm" onclick='openPreview(${JSON.stringify(f)})'>Preview</button>
            <a class="btn btn-primary btn-sm" href="${f.url}" download>Download</a>
          </div>
        </div>
      </div>`;
    carousel.appendChild(div);
  });
}

// Resource preview
function openPreview(r) {
  const body = document.getElementById("previewBody");
  const title = document.getElementById("previewTitle");
  const download = document.getElementById("previewDownload");
  if(!r){body.innerHTML="<p class='text-muted text-center'>Preview unavailable.</p>";return;}
  title.textContent = r.title;
  download.href=r.url;
  body.innerHTML="";
  if(r.type==='pdf'){
    body.innerHTML=`<embed src="${r.url}" type="application/pdf" width="100%" height="600px">`;
  } else if(r.type==='video'){
    body.innerHTML=`<video controls width="100%"><source src="${r.url}" type="video/mp4">Your browser does not support video.</video>`;
  } else if(r.type==='audio'){
    body.innerHTML=`<audio controls class="w-100"><source src="${r.url}" type="audio/mpeg">Your browser does not support audio.</audio>`;
  } else {
    body.innerHTML=`<iframe src="${r.url}" width="100%" height="600px" style="border:none"></iframe>`;
  }
  const previewModal = new bootstrap.Modal(document.getElementById("previewModal"));
  previewModal.show();
}

// Uploads
function setupUploads() {
  const teacherInput = document.getElementById("uploadFiles");
  teacherInput.onchange = e => alert(`Uploading ${e.target.files.length} file(s) as teacher/admin...`);

  const studentInput = document.getElementById("studentUpload");
  studentInput.onchange = e => alert(`Student submitted ${e.target.files.length} file(s)`);

  const quickInput = document.getElementById("quickFile");
  if(quickInput) quickInput.onchange = e => alert(`Quick upload: ${e.target.files.length} file(s)`);
}
