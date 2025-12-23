// JavaScript for teacher-dashboard.html
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('authToken');
  if (!token) window.location.href = '/login'; // Robust auth redirect

  const apiBase = '/api';

  // Toggle file/link group
  document.getElementById('resourceType').addEventListener('change', (e) => {
    const fileGroup = document.getElementById('fileUploadGroup');
    const linkGroup = document.getElementById('linkUploadGroup');
    if (e.target.value === 'interactive') {
      fileGroup.classList.add('d-none');
      linkGroup.classList.remove('d-none');
    } else {
      fileGroup.classList.remove('d-none');
      linkGroup.classList.add('d-none');
    }
  });

  // Upload Resource
  document.getElementById('teacherUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append fields: type, subject, title, etc.
    formData.append('type', document.getElementById('resourceType').value);
    formData.append('subject', document.getElementById('resourceSubject').value);
    formData.append('title', document.getElementById('resourceTitle').value);
    formData.append('description', document.getElementById('resourceDescription').value);
    formData.append('tags', document.getElementById('resourceTags').value);
    
    const files = document.getElementById('resourceFiles').files;
    for (let file of files) formData.append('files', file);
    
    if (document.getElementById('resourceType').value === 'interactive') {
      formData.append('link', document.getElementById('resourceLink').value);
    }

    const progressBar = document.querySelector('#uploadProgress .progress-bar');
    document.getElementById('uploadProgress').classList.remove('d-none');

    try {
      const response = await fetch(`${apiBase}/resources`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      // Simulate progress for demonstration
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) clearInterval(interval);
      }, 200);
      
      if (response.ok) {
        alert('Upload successful!');
        // Refresh resources if you have a list
        loadAssignments();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setTimeout(() => {
        document.getElementById('uploadProgress').classList.add('d-none');
        progressBar.style.width = '0%';
      }, 1000);
    }
  });

  // Fetch and render assignments/quizzes
  async function loadAssignments() {
    try {
      const response = await fetch(`${apiBase}/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const assignments = await response.json();
        const assignmentsGrid = document.getElementById('assignmentsGrid');
        assignmentsGrid.innerHTML = '';
        
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
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
    }
  }

  // Fetch and render quizzes
  async function loadQuizzes() {
    try {
      const response = await fetch(`${apiBase}/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const quizzes = await response.json();
        const quizzesGrid = document.getElementById('quizzesGrid');
        quizzesGrid.innerHTML = '';
        
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
      }
    } catch (err) {
      console.error('Error loading quizzes:', err);
    }
  }

  // Update stats
  async function updateStats() {
    try {
      const response = await fetch(`${apiBase}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const stats = await response.json();
        document.getElementById('totalResources').textContent = stats.totalResources || 0;
        document.getElementById('activeAssignments').textContent = stats.activeAssignments || 0;
        document.getElementById('totalQuizzes').textContent = stats.totalQuizzes || 0;
        document.getElementById('studentEngagement').textContent = stats.studentEngagement || '0%';
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  // Event listeners for create buttons
  document.getElementById('createAssignmentBtn').addEventListener('click', () => {
    alert('Create Assignment functionality to be implemented');
  });

  document.getElementById('createQuizBtn').addEventListener('click', () => {
    alert('Create Quiz functionality to be implemented');
  });

  // Load data on page load
  loadAssignments();
  loadQuizzes();
  updateStats();
});