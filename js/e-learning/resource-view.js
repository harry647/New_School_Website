// JavaScript for resource-view.html
console.log('Resource view page loaded');

// Extract resource ID from URL
const urlParams = new URLSearchParams(window.location.search);
const resourceId = urlParams.get('id');

// Display resource details
document.addEventListener('DOMContentLoaded', function() {
  const resourceDetails = document.getElementById('resourceDetails');
  
  if (resourceId) {
    // Sample resource data
    const resource = {
      id: resourceId,
      title: 'Algebra Chapter 4 Notes',
      description: 'This document covers the key concepts of Algebra Chapter 4, including quadratic equations and functions.',
      type: 'PDF',
      subject: 'Mathematics',
      previewUrl: '/assets/images/common/placeholder-doc.png',
      downloadUrl: '#'
    };

    resourceDetails.innerHTML = `
      <h1 class="display-5 fw-bold mb-4">${resource.title}</h1>
      <div class="row">
        <div class="col-md-8">
          <p><strong>Description:</strong> ${resource.description}</p>
          <p><strong>Type:</strong> ${resource.type}</p>
          <p><strong>Subject:</strong> ${resource.subject}</p>
          <a href="${resource.downloadUrl}" class="btn btn-primary mt-3">
            <i class="fas fa-download me-2"></i> Download Resource
          </a>
        </div>
        <div class="col-md-4">
          <img src="${resource.previewUrl}" class="img-fluid rounded-3" alt="Resource Preview">
        </div>
      </div>
    `;
  } else {
    resourceDetails.innerHTML = '<p>No resource specified.</p>';
  }
});