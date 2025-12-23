// JavaScript for assignments.html
console.log('Assignments page loaded');

// Load assignments dynamically
document.addEventListener('DOMContentLoaded', function() {
  const assignmentsGrid = document.getElementById('assignmentsGrid');
  
  // Sample assignments data
  const assignments = [
    { id: 1, title: 'Mathematics Assignment 1', dueDate: '2025-12-30', status: 'Pending' },
    { id: 2, title: 'English Essay', dueDate: '2025-12-25', status: 'Submitted' },
    { id: 3, title: 'Biology Project', dueDate: '2025-12-28', status: 'Pending' },
  ];

  assignments.forEach(assignment => {
    assignmentsGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${assignment.title}</h5>
            <p class="card-text"><strong>Due Date:</strong> ${assignment.dueDate}</p>
            <p class="card-text"><strong>Status:</strong> ${assignment.status}</p>
            <a href="/e-learning/assignment-view.html?id=${assignment.id}" class="btn btn-primary">View Assignment</a>
          </div>
        </div>
      </div>
    `;
  });
});