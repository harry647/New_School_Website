// JavaScript for teacher-dashboard.html
console.log('Teacher dashboard page loaded');

// Load assignments and quizzes dynamically
document.addEventListener('DOMContentLoaded', function() {
  const assignmentsGrid = document.getElementById('assignmentsGrid');
  const quizzesGrid = document.getElementById('quizzesGrid');
  
  // Sample assignments data
  const assignments = [
    { id: 1, title: 'Mathematics Assignment 1', dueDate: '2025-12-30', status: 'Active' },
    { id: 2, title: 'English Essay', dueDate: '2025-12-25', status: 'Closed' },
  ];

  assignments.forEach(assignment => {
    assignmentsGrid.innerHTML += `
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${assignment.title}</h5>
            <p class="card-text"><strong>Due Date:</strong> ${assignment.dueDate}</p>
            <p class="card-text"><strong>Status:</strong> ${assignment.status}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary">Edit</button>
              <button class="btn btn-sm btn-outline-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Sample quizzes data
  const quizzes = [
    { id: 1, title: 'Algebra Quiz', subject: 'Mathematics', questions: 10 },
    { id: 2, title: 'Biology Basics', subject: 'Biology', questions: 15 },
  ];

  quizzes.forEach(quiz => {
    quizzesGrid.innerHTML += `
      <div class="col-md-6">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${quiz.title}</h5>
            <p class="card-text"><strong>Subject:</strong> ${quiz.subject}</p>
            <p class="card-text"><strong>Questions:</strong> ${quiz.questions}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary">Edit</button>
              <button class="btn btn-sm btn-outline-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
});