// JavaScript for resources.html
console.log('Resources page loaded');

const resourcesGrid = document.getElementById('resourcesGrid');

async function loadResources() {
  resourcesGrid.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary"></div><p>Loading resources...</p></div>`;
  try {
    const res = await fetch('/api/resources');
    if (!res.ok) throw new Error('Failed to load resources.');
    const resources = await res.json();

    if (resources.length === 0) {
      resourcesGrid.innerHTML = `<p class="text-center text-muted my-5">No resources available at the moment.</p>`;
      return;
    }

    resourcesGrid.innerHTML = '';
    resources.forEach(resource => {
      const card = createResourceCard(resource);
      resourcesGrid.appendChild(card);
    });
  } catch (err) {
    resourcesGrid.innerHTML = `<p class="text-danger text-center my-5">${sanitizeText(err.message)}</p>`;
  }
}

function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sanitizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.href;
  } catch (e) {
    console.error('Invalid URL:', url);
    return '#';
  }
}

// Reusable card component
function createResourceCard(resource) {
  const col = document.createElement('div');
  col.className = 'col-md-4';
  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      ${resource.thumbnail ? `<img src="${sanitizeUrl(resource.thumbnail)}" class="card-img-top" alt="${sanitizeText(resource.title)}" loading="lazy">` : ''}
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="card-title">${sanitizeText(resource.title)}</h5>
          ${resource.type === 'pdf' ? `<span class="badge bg-primary">PDF</span>` : ''}
          ${resource.type === 'video' ? `<span class="badge bg-success">Video</span>` : ''}
          ${resource.type === 'interactive' ? `<span class="badge bg-warning text-dark">Interactive</span>` : ''}
        </div>
        <p class="card-text">${sanitizeText(resource.description)}</p>
        ${resource.type === 'pdf' ?
          `<a href="${sanitizeUrl(resource.url)}" target="_blank" class="btn btn-primary mt-auto" aria-label="View PDF for ${sanitizeText(resource.title)}" rel="noopener noreferrer"><i class="fas fa-file-pdf me-2"></i>View PDF</a>` : ''}
        ${resource.type === 'video' ?
          `<button class="btn btn-success mt-auto" onclick="playVideo('${sanitizeUrl(resource.url)}')" aria-label="Play video for ${sanitizeText(resource.title)}"><i class="fas fa-play me-2"></i>Play Video</button>` : ''}
        ${resource.type === 'interactive' ?
          `<button class="btn btn-warning mt-auto" onclick="launchInteractive('${sanitizeUrl(resource.url)}')" aria-label="Launch interactive content for ${sanitizeText(resource.title)}"><i class="fas fa-laptop-code me-2"></i>Launch</button>` : ''}
      </div>
    </div>`;
  return col;
}

document.addEventListener('DOMContentLoaded', loadResources);

function playVideo(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function launchInteractive(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Search functionality
document.getElementById('resourceSearch').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('#resourcesGrid .card').forEach(card => {
    card.style.display = card.querySelector('.card-title').textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});