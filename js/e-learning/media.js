// JavaScript for media.html
console.log('Media page loaded');

// Fetch media from API
async function loadMediaItems(page = 1, search = '', filter = '') {
  try {
    const response = await fetch(`/api/media?page=${page}&search=${search}&type=${filter}`);
    const data = await response.json();
    renderMedia(data.items);
  } catch (err) {
    console.error("Failed to load media:", err);
    document.getElementById('mediaGrid').innerHTML = "<p class='text-danger'>Failed to load media.</p>";
  }
}

// Render media cards
function renderMedia(items) {
  const grid = document.getElementById('mediaGrid');
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card shadow-sm border-0 media-card">
        <img src="${item.thumbnail}" class="card-img-top" alt="${item.title}" loading="lazy">
        <div class="card-body text-center">
          <h5 class="card-title">${item.title}</h5>
          <p class="text-muted mb-2">${item.type} • ${item.duration || ''}</p>
          <button class="btn btn-outline-primary btn-sm" onclick="previewMedia(${item.id})">
            <i class="fas fa-play me-1"></i> Preview
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="downloadMedia(${item.id})">
            <i class="fas fa-download me-1"></i> Download
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// Preview in modal
function previewMedia(id) {
  // fetch single media details and display in modal
  // dynamically insert <video>, <audio>, <img>, or <iframe> depending on type
  const modal = new bootstrap.Modal(document.getElementById('mediaPreviewModal'));
  document.getElementById('mediaModalTitle').innerText = "Loading...";
  document.getElementById('mediaModalBody').innerHTML = "<p>Loading media...</p>";
  fetch(`/api/media/${id}`).then(res => res.json()).then(item => {
    document.getElementById('mediaModalTitle').innerText = item.title;
    let html = '';
    if(item.type === 'video') html = `<video src="${item.url}" controls class="w-100"></video>`;
    else if(item.type === 'audio') html = `<audio src="${item.url}" controls class="w-100"></audio>`;
    else if(item.type === 'image') html = `<img src="${item.url}" class="img-fluid" alt="${item.title}">`;
    else html = `<iframe src="${item.url}" class="w-100" style="height:500px;"></iframe>`;
    document.getElementById('mediaModalBody').innerHTML = html;
    modal.show();
  });
}

// Download media
function downloadMedia(id) {
  window.open(`/api/media/${id}/download`, '_blank');
}

// Load more media
document.getElementById('loadMoreMedia').addEventListener('click', () => {
  const currentPage = parseInt(document.getElementById('loadMoreMedia').dataset.page) || 1;
  loadMediaItems(currentPage + 1, document.getElementById('mediaSearch').value, document.getElementById('mediaFilter').value);
  document.getElementById('loadMoreMedia').dataset.page = currentPage + 1;
});

// Search and filter hooks
document.getElementById('mediaSearch').addEventListener('input', (e) => {
  loadMediaItems(1, e.target.value, document.getElementById('mediaFilter').value);
});

document.getElementById('mediaFilter').addEventListener('change', (e) => {
  loadMediaItems(1, document.getElementById('mediaSearch').value, e.target.value);
});

// Initialize
loadMediaItems();