// JavaScript for assignment-view.html
console.log('Assignment view page loaded');

// Extract assignment ID from URL
const assignmentId = new URLSearchParams(location.search).get('id');

// DOM elements
const assignmentDetails = document.getElementById('assignmentDetails');
const assignmentLoading = document.getElementById('assignmentLoading');
const assignmentError = document.getElementById('assignmentError');
const assignmentTitle = document.getElementById('assignmentTitle');
const assignmentSubject = document.getElementById('assignmentSubject');
const assignmentDueDate = document.getElementById('assignmentDueDate');
const assignmentDescription = document.getElementById('assignmentDescription');
const assignmentStatus = document.getElementById('assignmentStatus');
const assignmentAttachments = document.getElementById('assignmentAttachments');
const submissionStatus = document.getElementById('submissionStatus');
const submitAssignmentBtn = document.getElementById('submitAssignmentBtn');
const submissionFiles = document.getElementById('submissionFiles');
// Note: submissionAssignmentId is moved inside DOMContentLoaded to avoid null reference

// Debug: Log the state of critical elements
console.log('DEBUG - assignmentId:', assignmentId);
const submissionStatusMessage = document.getElementById('submissionStatusMessage');

// Display assignment details
document.addEventListener('DOMContentLoaded', function() {
  if (!assignmentId) {
    assignmentLoading.classList.add('d-none');
    assignmentError.classList.remove('d-none');
    assignmentError.textContent = 'No assignment ID specified in URL.';
    return;
  }

  // Set assignment ID in hidden field
  const submissionAssignmentId = document.getElementById('submissionAssignmentId');
  if (submissionAssignmentId) {
    submissionAssignmentId.value = assignmentId;
  } else {
    console.error('Error: submissionAssignmentId element not found');
  }
  assignmentDetails.dataset.assignmentId = assignmentId;

  // Simulate API fetch
  fetchAssignment(assignmentId);
});

// Fetch assignment details from API
async function fetchAssignment(id) {
  try {
    // Show loading state
    assignmentLoading.classList.remove('d-none');
    assignmentError.classList.add('d-none');
    assignmentDetails.classList.add('d-none');

    // Simulate API call (replace with actual fetch in production)
    // const response = await fetch(`/api/assignments/${id}`);
    // if (!response.ok) throw new Error('Failed to fetch assignment');
    // const assignment = await response.json();

    // Mock data for demonstration
    const assignment = {
      id: id,
      title: 'Mathematics Assignment 1',
      subject: 'Mathematics',
      description: 'Solve the following problems from Chapter 4 of the Algebra textbook. Make sure to show all your work clearly and submit in PDF format.',
      dueDate: '2025-12-30',
      attachments: [
        { name: 'Chapter 4 Problems', url: '/assets/docs/chapter4.pdf' },
        { name: 'Solution Template', url: '/assets/docs/template.docx' }
      ],
      status: 'Not Submitted',
      submitted: false
    };

    // Populate DOM with assignment data
    populateAssignmentData(assignment);

  } catch (error) {
    console.error('Error fetching assignment:', error);
    assignmentLoading.classList.add('d-none');
    assignmentError.classList.remove('d-none');
  }
}

// Populate assignment data into DOM
function populateAssignmentData(assignment) {
  // Hide loading state
  assignmentLoading.classList.add('d-none');

  // Show assignment details
  assignmentDetails.classList.remove('d-none');

  // Populate fields
  assignmentTitle.textContent = assignment.title;
  assignmentSubject.textContent = assignment.subject;
  assignmentDueDate.textContent = new Date(assignment.dueDate).toLocaleDateString();
  assignmentDescription.textContent = assignment.description;
  assignmentStatus.textContent = assignment.status;
  submissionStatus.textContent = assignment.submitted ? 'Submitted' : 'Not Submitted';

  // Update status badge based on status
  updateStatusBadge(assignment.status);

  // Populate attachments if any
  if (assignment.attachments && assignment.attachments.length > 0) {
    assignmentAttachments.classList.remove('d-none');
    const attachmentsList = assignmentAttachments.querySelector('ul');
    attachmentsList.innerHTML = '';

    assignment.attachments.forEach(attachment => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      listItem.innerHTML = `
        <span>${attachment.name}</span>
        <a href="${attachment.url}" class="btn btn-sm btn-outline-primary" download>
          <i class="fas fa-download me-1"></i> Download
        </a>
      `;
      attachmentsList.appendChild(listItem);
    });
  }

  // Set up submission form
  setupSubmissionForm(assignment.id);
}

// Update status badge based on assignment status
function updateStatusBadge(status) {
  const badge = assignmentStatus;
  
  // Remove all status classes first
  badge.classList.remove('bg-info', 'bg-success', 'bg-warning', 'bg-danger');

  // Add appropriate class based on status
  switch(status.toLowerCase()) {
    case 'not submitted':
      badge.classList.add('bg-info');
      break;
    case 'submitted':
      badge.classList.add('bg-success');
      break;
    case 'graded':
      badge.classList.add('bg-success');
      break;
    case 'late':
      badge.classList.add('bg-warning');
      break;
    default:
      badge.classList.add('bg-info');
  }
}

// Set up submission form
function setupSubmissionForm(assignmentId) {
  const submissionForm = document.getElementById('assignmentSubmissionForm');

  submissionForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Disable submit button
    submitAssignmentBtn.disabled = true;
    submitAssignmentBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';

    // Show uploading status
    submissionStatusMessage.classList.remove('d-none');
    submissionStatusMessage.innerHTML = '<div class="alert alert-info">Uploading your assignment...</div>';

    try {
      // Simulate file upload (replace with actual fetch in production)
      // const formData = new FormData();
      // formData.append('assignmentId', assignmentId);
      // Array.from(submissionFiles.files).forEach(file => {
      //   formData.append('files', file);
      // });

      // const response = await fetch('/api/submissions', {
      //   method: 'POST',
      //   body: formData
      // });

      // if (!response.ok) throw new Error('Failed to submit assignment');

      // Simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      submissionStatusMessage.innerHTML = '<div class="alert alert-success">Assignment submitted successfully!</div>';

      // Update submission status
      submissionStatus.textContent = 'Submitted';
      submissionStatus.classList.remove('bg-secondary');
      submissionStatus.classList.add('bg-success');

      // Close modal after 2 seconds
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('submitAssignmentModal'));
        modal.hide();
        
        // Reset form and button
        submissionForm.reset();
        submitAssignmentBtn.disabled = false;
        submitAssignmentBtn.textContent = 'Submit';
        submissionStatusMessage.classList.add('d-none');
      }, 2000);

    } catch (error) {
      console.error('Error submitting assignment:', error);
      submissionStatusMessage.innerHTML = '<div class="alert alert-danger">Error submitting assignment. Please try again.</div>';
      submitAssignmentBtn.disabled = false;
      submitAssignmentBtn.textContent = 'Submit';
    }
  });
}