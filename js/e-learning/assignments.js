// JavaScript for assignments.html
console.log('Assignments page loaded');

// DOM Elements
const assignmentsGrid = document.getElementById('assignmentsGrid');
const assignmentsLoading = document.getElementById('assignmentsLoading');
const assignmentsEmpty = document.getElementById('assignmentsEmpty');
const assignmentsError = document.getElementById('assignmentsError');
const filterSubject = document.getElementById('filterSubject');
const filterStatus = document.getElementById('filterStatus');
const applyFilters = document.getElementById('applyFilters');
const refreshAssignments = document.getElementById('refreshAssignments');

// Sample assignments data
let assignments = [
  { id: 1, title: 'Mathematics Assignment 1', subject: 'Mathematics', dueDate: '2025-12-30', status: 'pending', submitted: false },
  { id: 2, title: 'English Essay', subject: 'English', dueDate: '2025-12-25', status: 'submitted', submitted: true },
  { id: 3, title: 'Biology Project', subject: 'Biology', dueDate: '2025-12-28', status: 'pending', submitted: false },
  { id: 4, title: 'Chemistry Lab Report', subject: 'Chemistry', dueDate: '2025-12-27', status: 'graded', submitted: true },
  { id: 5, title: 'History Research Paper', subject: 'History', dueDate: '2025-12-29', status: 'pending', submitted: false },
];

// Populate subject filter
function populateSubjectFilter() {
  const subjects = [...new Set(assignments.map(a => a.subject))];
  filterSubject.innerHTML = '<option value="">All Subjects</option>';
  subjects.forEach(subject => {
    filterSubject.innerHTML += `<option value="${subject}">${subject}</option>`;
  });
}

// Render assignments
function renderAssignments(data) {
  assignmentsGrid.innerHTML = '';
  
  if (data.length === 0) {
    assignmentsEmpty.classList.remove('d-none');
    return;
  } else {
    assignmentsEmpty.classList.add('d-none');
  }
  
  data.forEach(assignment => {
    const statusBadge = {
      pending: 'bg-warning',
      submitted: 'bg-info',
      graded: 'bg-success'
    }[assignment.status] || 'bg-secondary';
    
    assignmentsGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm assignment-card">
          <div class="card-body">
            <span class="badge ${statusBadge} mb-2">${assignment.status}</span>
            <h5 class="card-title">${assignment.title}</h5>
            <p class="text-muted">${assignment.subject}</p>
            <p class="small text-muted">
              <i class="fas fa-calendar-alt me-1"></i> Due: ${new Date(assignment.dueDate).toLocaleDateString()}
            </p>
            <a href="/e-learning/assignment-view.html?id=${assignment.id}" class="stretched-link"></a>
          </div>
        </div>
      </div>
    `;
  });
}

// Show loading state
function showLoading() {
  assignmentsLoading.classList.remove('d-none');
  assignmentsEmpty.classList.add('d-none');
  assignmentsError.classList.add('d-none');
  assignmentsGrid.innerHTML = '';
}

// Show error state
function showError() {
  assignmentsLoading.classList.add('d-none');
  assignmentsEmpty.classList.add('d-none');
  assignmentsError.classList.remove('d-none');
  assignmentsGrid.innerHTML = '';
}

// Load assignments
function loadAssignments() {
  showLoading();
  
  // Simulate API call
  setTimeout(() => {
    try {
      // Apply filters
      const subject = filterSubject.value;
      const status = filterStatus.value;
      
      let filteredAssignments = assignments;
      
      if (subject) {
        filteredAssignments = filteredAssignments.filter(a => a.subject === subject);
      }
      
      if (status) {
        filteredAssignments = filteredAssignments.filter(a => a.status === status);
      }
      
      renderAssignments(filteredAssignments);
      assignmentsLoading.classList.add('d-none');
    } catch (error) {
      showError();
    }
  }, 1000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  populateSubjectFilter();
  loadAssignments();
});

applyFilters.addEventListener('click', loadAssignments);
refreshAssignments.addEventListener('click', loadAssignments);