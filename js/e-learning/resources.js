// JavaScript for resources.html
console.log('Resources page loaded');

// Load resources dynamically
document.addEventListener('DOMContentLoaded', function() {
  const resourcesGrid = document.getElementById('resourcesGrid');
  
  // Sample resources data
  const resources = [
    { id: 1, title: 'Algebra Chapter 4 Notes', type: 'PDF', subject: 'Mathematics' },
    { id: 2, title: 'Introduction to Biology', type: 'Video', subject: 'Biology' },
    { id: 3, title: 'English Grammar Guide', type: 'PDF', subject: 'English' },
  ];

  resources.forEach(resource => {
    resourcesGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${resource.title}</h5>
            <p class="card-text">Type: ${resource.type}</p>
            <p class="card-text">Subject: ${resource.subject}</p>
            <a href="/e-learning/resource-view.html?id=${resource.id}" class="btn btn-primary">View Resource</a>
          </div>
        </div>
      </div>
    `;
  });
});