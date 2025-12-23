// JavaScript for forum.html
console.log('Forum page loaded');

// Load discussions dynamically
document.addEventListener('DOMContentLoaded', function() {
  const discussionsGrid = document.getElementById('discussionsGrid');
  
  // Sample discussions data
  const discussions = [
    { id: 1, title: 'Help with Algebra', author: 'Student1', replies: 5 },
    { id: 2, title: 'Biology Study Group', author: 'Student2', replies: 12 },
    { id: 3, title: 'English Essay Tips', author: 'Student3', replies: 8 },
  ];

  discussions.forEach(discussion => {
    discussionsGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${discussion.title}</h5>
            <p class="card-text"><strong>Author:</strong> ${discussion.author}</p>
            <p class="card-text"><strong>Replies:</strong> ${discussion.replies}</p>
            <a href="/e-learning/forum-thread.html?id=${discussion.id}" class="btn btn-primary">View Discussion</a>
          </div>
        </div>
      </div>
    `;
  });
});