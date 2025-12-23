// JavaScript for resource-view.html
console.log('Resource view page loaded');

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const resourceId = urlParams.get('id');

// DOM elements
const resourceTitle = document.getElementById('resourceTitle');
const resourceDescription = document.getElementById('resourceDescription');
const resourceTypeBadge = document.getElementById('resourceTypeBadge');
const resourceSubjectBadge = document.getElementById('resourceSubjectBadge');
const resourcePreview = document.getElementById('resourcePreview');
const resourceAuthor = document.getElementById('resourceAuthor');
const resourceSubject = document.getElementById('resourceSubject');
const resourceLevel = document.getElementById('resourceLevel');
const resourceUploaded = document.getElementById('resourceUploaded');
const resourceFileSize = document.getElementById('resourceFileSize');
const downloadButton = document.getElementById('downloadButton');
const bookmarkButton = document.getElementById('bookmarkButton');
const copyLinkButton = document.getElementById('copyLinkButton');
const printButton = document.getElementById('printButton');
const progressBar = document.getElementById('progressBar');
const markCompletedButton = document.getElementById('markCompletedButton');
const markReviewedButton = document.getElementById('markReviewedButton');
const commentsSection = document.getElementById('commentsSection');
const commentInput = document.getElementById('commentInput');
const ratingStars = document.getElementById('ratingStars');
const ratingCount = document.getElementById('ratingCount');
const relatedResources = document.getElementById('relatedResources');
const structuredData = document.getElementById('structuredData');

// Current resource data
let currentResource = null;
let userProgress = 0;
let isBookmarked = false;

// Initialize the page
async function init() {
  if (!resourceId) {
    showError('No resource ID provided in URL');
    return;
  }

  try {
    // Load resource data
    await loadResource(resourceId);
    
    // Load related resources
    await loadRelatedResources(currentResource.subject, currentResource.level);
    
    // Load user progress
    loadUserProgress();
    
    // Load comments
    loadComments();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize rating system
    initRatingSystem();
  } catch (error) {
    showError(`Failed to load resource: ${error.message}`);
  }
}

// Load resource data
async function loadResource(id) {
  try {
    const response = await fetch(`/api/resources/${id}`);
    if (!response.ok) throw new Error('Resource not found');
    
    currentResource = await response.json();
    
    // Update UI with resource data
    updateResourceUI();
    
    // Load preview based on resource type
    loadResourcePreview();
    
  } catch (error) {
    console.error('Error loading resource:', error);
    throw error;
  }
}

// Update UI with resource data
function updateResourceUI() {
  if (!currentResource) return;

  // Basic info
  resourceTitle.textContent = sanitizeText(currentResource.title);
  resourceDescription.textContent = sanitizeText(currentResource.description);
  
  // Badges
  resourceTypeBadge.textContent = currentResource.type.toUpperCase();
  resourceTypeBadge.className = `badge ${getTypeBadgeClass(currentResource.type)}`;
  resourceSubjectBadge.textContent = currentResource.subject || 'General';

  // Metadata
  resourceAuthor.textContent = currentResource.author || 'Unknown';
  resourceSubject.textContent = currentResource.subject || 'General';
  resourceLevel.textContent = currentResource.level || 'All Levels';
  resourceUploaded.textContent = formatDate(currentResource.uploaded || currentResource.createdAt);
  resourceFileSize.textContent = formatFileSize(currentResource.fileSize);

  // Actions
  downloadButton.href = sanitizeUrl(currentResource.url);
  downloadButton.download = currentResource.title || 'resource';

  // Structured data for SEO
  updateStructuredData();
}

// Load resource preview based on type
function loadResourcePreview() {
  if (!currentResource) return;

  resourcePreview.innerHTML = '';

  switch (currentResource.type) {
    case 'pdf':
      loadPDFPreview();
      break;
    case 'video':
      loadVideoPreview();
      break;
    case 'interactive':
      loadInteractivePreview();
      break;
    case 'image':
      loadImagePreview();
      break;
    default:
      resourcePreview.innerHTML = '<p class="text-muted p-3">No preview available for this resource type.</p>';
  }
}

// Load PDF preview using PDF.js
function loadPDFPreview() {
  const pdfUrl = sanitizeUrl(currentResource.url);
  
  resourcePreview.innerHTML = `
    <div class="pdf-preview-container">
      <iframe src="${pdfUrl}" width="100%" height="600px" frameborder="0"></iframe>
      <p class="text-center mt-2"><small>PDF Preview - <a href="${pdfUrl}" target="_blank">Open in new tab</a></small></p>
    </div>
  `;
}

// Load video preview
function loadVideoPreview() {
  const videoUrl = sanitizeUrl(currentResource.url);
  
  resourcePreview.innerHTML = `
    <div class="video-container">
      <iframe src="${videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-primary" onclick="playVideo()">
        <i class="fas fa-play me-1"></i>Play
      </button>
      <button class="btn btn-secondary" onclick="toggleFullscreen()">
        <i class="fas fa-expand me-1"></i>Fullscreen
      </button>
    </div>
  `;
}

// Load interactive content preview
function loadInteractivePreview() {
  const interactiveUrl = sanitizeUrl(currentResource.url);
  
  resourcePreview.innerHTML = `
    <div class="interactive-preview-container">
      <iframe src="${interactiveUrl}" width="100%" height="600px" frameborder="0" allowfullscreen></iframe>
      <p class="text-center mt-2"><small>Interactive Content - <a href="${interactiveUrl}" target="_blank">Open in new tab</a></small></p>
    </div>
  `;
}

// Load image preview
function loadImagePreview() {
  const imageUrl = sanitizeUrl(currentResource.url);
  
  resourcePreview.innerHTML = `
    <div class="image-preview-container text-center">
      <img src="${imageUrl}" class="img-fluid rounded shadow" alt="${sanitizeText(currentResource.title)}" style="max-height: 600px;">
      <p class="mt-2"><small><a href="${imageUrl}" target="_blank">View full size</a></small></p>
    </div>
  `;
}

// Load related resources
async function loadRelatedResources(subject, level) {
  try {
    const response = await fetch(`/api/resources?subject=${subject}&level=${level}&limit=3`);
    if (!response.ok) throw new Error('Failed to load related resources');
    
    const resources = await response.json();
    
    if (resources.length === 0) {
      relatedResources.innerHTML = '<p class="text-muted">No related resources found.</p>';
      return;
    }
    
    relatedResources.innerHTML = '';
    resources.forEach(resource => {
      if (resource.id === currentResource.id) return; // Skip current resource
      
      const card = createRelatedResourceCard(resource);
      relatedResources.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading related resources:', error);
    relatedResources.innerHTML = '<p class="text-muted">Failed to load related resources.</p>';
  }
}

// Create related resource card
function createRelatedResourceCard(resource) {
  const col = document.createElement('div');
  col.className = 'col-md-4';
  
  col.innerHTML = `
    <div class="card h-100">
      ${resource.thumbnail ? `<img src="${sanitizeUrl(resource.thumbnail)}" class="card-img-top" alt="${sanitizeText(resource.title)}" loading="lazy">` : ''}
      <div class="card-body">
        <h6 class="card-title">${sanitizeText(resource.title)}</h6>
        <p class="card-text text-muted small">${sanitizeText(resource.description.substring(0, 100))}...</p>
        <a href="/e-learning/resource-view.html?id=${resource.id}" class="btn btn-sm btn-outline-primary">View</a>
      </div>
    </div>
  `;
  
  return col;
}

// Load user progress
function loadUserProgress() {
  // In a real app, this would come from localStorage or API
  const savedProgress = localStorage.getItem(`resourceProgress_${resourceId}`);
  
  if (savedProgress) {
    userProgress = parseInt(savedProgress);
    updateProgressUI();
  }
}

// Update progress UI
function updateProgressUI() {
  progressBar.style.width = `${userProgress}%`;
  progressBar.textContent = `${userProgress}%`;
  progressBar.setAttribute('aria-valuenow', userProgress);
}

// Mark as completed
function markAsCompleted() {
  userProgress = 100;
  updateProgressUI();
  saveProgress();
  showToast('Resource marked as completed!', 'success');
  
  // Award badge
  awardBadge('resource-completed');
}

// Mark as reviewed
function markAsReviewed() {
  userProgress = 50;
  updateProgressUI();
  saveProgress();
  showToast('Resource marked as reviewed!', 'info');
}

// Save progress
function saveProgress() {
  localStorage.setItem(`resourceProgress_${resourceId}`, userProgress.toString());
}

// Award badge
function awardBadge(badgeType) {
  // In a real app, this would update user profile
  const badgesSection = document.getElementById('badgesSection');
  
  if (badgeType === 'resource-completed') {
    badgesSection.innerHTML += `
      <div class="text-center">
        <div class="bg-light p-3 rounded-circle mb-2" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-trophy fa-2x text-warning"></i>
        </div>
        <small>Completed!</small>
      </div>
    `;
  }
}

// Bookmark resource
function bookmarkResource() {
  isBookmarked = !isBookmarked;
  
  if (isBookmarked) {
    bookmarkButton.innerHTML = '<i class="fas fa-bookmark me-1"></i>Bookmarked';
    bookmarkButton.classList.remove('btn-warning');
    bookmarkButton.classList.add('btn-success');
    showToast('Resource bookmarked!', 'success');
    
    // Save to localStorage
    saveBookmark();
  } else {
    bookmarkButton.innerHTML = '<i class="fas fa-bookmark me-1"></i>Bookmark';
    bookmarkButton.classList.remove('btn-success');
    bookmarkButton.classList.add('btn-warning');
    showToast('Bookmark removed', 'info');
    
    // Remove from localStorage
    removeBookmark();
  }
}

// Save bookmark
function saveBookmark() {
  const bookmarks = JSON.parse(localStorage.getItem('resourceBookmarks') || '[]');
  
  if (!bookmarks.includes(resourceId)) {
    bookmarks.push(resourceId);
    localStorage.setItem('resourceBookmarks', JSON.stringify(bookmarks));
  }
}

// Remove bookmark
function removeBookmark() {
  let bookmarks = JSON.parse(localStorage.getItem('resourceBookmarks') || '[]');
  bookmarks = bookmarks.filter(id => id !== resourceId);
  localStorage.setItem('resourceBookmarks', JSON.stringify(bookmarks));
}

// Copy link to clipboard
function copyLink() {
  const currentUrl = window.location.href;
  
  navigator.clipboard.writeText(currentUrl).then(() => {
    showToast('Link copied to clipboard!', 'success');
    
    // Visual feedback
    copyLinkButton.innerHTML = '<i class="fas fa-check me-1"></i>Copied!';
    setTimeout(() => {
      copyLinkButton.innerHTML = '<i class="fas fa-link me-1"></i>Copy Link';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy link:', err);
    showToast('Failed to copy link', 'danger');
  });
}

// Print resource
function printResource() {
  window.print();
}

// Load comments
function loadComments() {
  // In a real app, this would come from an API
  const savedComments = localStorage.getItem(`resourceComments_${resourceId}`);
  
  if (savedComments) {
    const comments = JSON.parse(savedComments);
    displayComments(comments);
  } else {
    commentsSection.innerHTML = '<p class="text-muted">No comments yet. Be the first to add one!</p>';
  }
}

// Display comments
function displayComments(comments) {
  if (comments.length === 0) {
    commentsSection.innerHTML = '<p class="text-muted">No comments yet. Be the first to add one!</p>';
    return;
  }
  
  commentsSection.innerHTML = '';
  
  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'mb-3 p-3 bg-light rounded';
    commentElement.innerHTML = `
      <div class="d-flex justify-content-between">
        <strong>${sanitizeText(comment.author || 'Anonymous')}</strong>
        <small class="text-muted">${formatDate(comment.timestamp)}</small>
      </div>
      <p class="mb-1">${sanitizeText(comment.text)}</p>
    `;
    
    commentsSection.appendChild(commentElement);
  });
}

// Add comment
function addComment() {
  const commentText = commentInput.value.trim();
  
  if (!commentText) {
    showToast('Please enter a comment', 'warning');
    return;
  }
  
  // In a real app, this would be sent to an API
  const newComment = {
    id: Date.now().toString(),
    text: commentText,
    author: 'You',
    timestamp: new Date().toISOString()
  };
  
  // Save comment
  const savedComments = localStorage.getItem(`resourceComments_${resourceId}`);
  const comments = savedComments ? JSON.parse(savedComments) : [];
  comments.push(newComment);
  localStorage.setItem(`resourceComments_${resourceId}`, JSON.stringify(comments));
  
  // Update UI
  displayComments(comments);
  commentInput.value = '';
  
  showToast('Comment added!', 'success');
}

// Initialize rating system
function initRatingSystem() {
  const stars = ratingStars.querySelectorAll('.fa-star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));
      rateResource(value);
    });
    
    star.addEventListener('mouseover', () => {
      const value = parseInt(star.getAttribute('data-value'));
      highlightStars(value);
    });
    
    star.addEventListener('mouseout', () => {
      const savedRating = localStorage.getItem(`resourceRating_${resourceId}`);
      if (savedRating) {
        highlightStars(parseInt(savedRating));
      } else {
        resetStars();
      }
    });
  });
  
  // Load saved rating
  const savedRating = localStorage.getItem(`resourceRating_${resourceId}`);
  if (savedRating) {
    highlightStars(parseInt(savedRating));
  }
}

// Rate resource
function rateResource(value) {
  // Save rating
  localStorage.setItem(`resourceRating_${resourceId}`, value.toString());
  
  // Update UI
  highlightStars(value);
  
  // Update rating count (simulated)
  const ratingText = value === 1 ? 'rating' : 'ratings';
  ratingCount.textContent = `${value} ${ratingText}`;
  
  showToast('Thank you for your rating!', 'success');
}

// Highlight stars up to value
function highlightStars(value) {
  const stars = ratingStars.querySelectorAll('.fa-star');
  
  stars.forEach((star, index) => {
    if (index < value) {
      star.classList.remove('far', 'fa-star');
      star.classList.add('fas', 'fa-star');
    } else {
      star.classList.remove('fas', 'fa-star');
      star.classList.add('far', 'fa-star');
    }
  });
}

// Reset stars
function resetStars() {
  const stars = ratingStars.querySelectorAll('.fa-star');
  
  stars.forEach(star => {
    star.classList.remove('fas');
    star.classList.add('far');
  });
}

// Update structured data for SEO
function updateStructuredData() {
  if (!currentResource) return;
  
  const structuredDataContent = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": currentResource.title,
    "description": currentResource.description,
    "educationalLevel": currentResource.level || "All Levels",
    "url": window.location.href,
    "author": currentResource.author || "Unknown",
    "datePublished": currentResource.uploaded || new Date().toISOString()
  };
  
  structuredData.textContent = JSON.stringify(structuredDataContent, null, 2);
}

// Setup event listeners
function setupEventListeners() {
  // Back to top button
  const backToTopButton = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });
  
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Show toast notification
function showToast(message, type = 'info') {
  const toastContainer = document.createElement('div');
  toastContainer.className = `position-fixed top-0 end-0 p-3`;
  toastContainer.style.zIndex = '11';
  
  toastContainer.innerHTML = `
    <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  document.body.appendChild(toastContainer);
  
  const toast = new bootstrap.Toast(toastContainer.querySelector('.toast'));
  toast.show();
  
  setTimeout(() => {
    toastContainer.remove();
  }, 5000);
}

// Show error message
function showError(message) {
  const mainContainer = document.querySelector('.container.my-5');
  mainContainer.innerHTML = `
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Error</h4>
      <p>${sanitizeText(message)}</p>
      <hr>
      <p class="mb-0"><a href="/e-learning/resources.html" class="alert-link">Back to resources</a></p>
    </div>
  `;
}

// Utility functions
function getTypeBadgeClass(type) {
  switch (type) {
    case 'pdf': return 'bg-primary';
    case 'video': return 'bg-success';
    case 'interactive': return 'bg-warning text-dark';
    case 'image': return 'bg-info';
    default: return 'bg-secondary';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return 'Unknown date';
  }
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Byte';
  
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Logout function (from original resources.js)
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = '/e-learning/login.html';
}