// JavaScript for assignment-view.html
console.log('Assignment view page loaded');

// Extract assignment ID from URL
const urlParams = new URLSearchParams(window.location.search);
const assignmentId = urlParams.get('id');

// Display assignment details
document.addEventListener('DOMContentLoaded', function() {
  const assignmentDetails = document.getElementById('assignmentDetails');
  
  if (assignmentId) {
    // Sample assignment data
    const assignment = {
      id: assignmentId,
      title: 'Mathematics Assignment 1',
      description: 'Solve the following problems from Chapter 4 of the Algebra textbook.',
      dueDate: '2025-12-30',
      status: 'Pending',
      subject: 'Mathematics'
    };

    assignmentDetails.innerHTML = `
      <h1 class="display-5 fw-bold mb-4">${assignment.title}</h1>
      <div class="row">
        <div class="col-md-8">
          <p><strong>Description:</strong> ${assignment.description}</p>
          <p><strong>Due Date:</strong> ${assignment.dueDate}</p>
          <p><strong>Status:</strong> ${assignment.status}</p>
          <p><strong>Subject:</strong> ${assignment.subject}</p>
          <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#submitAssignmentModal">
            <i class="fas fa-upload me-2"></i> Submit Assignment
          </button>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Instructions</h5>
              <p>Submit your completed assignment in PDF or DOCX format. Ensure all work is shown clearly.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    assignmentDetails.innerHTML = '<p>No assignment specified.</p>';
  }
});