// JavaScript for subject-view.html
console.log('Subject view page loaded');

// Extract subject from URL
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get('subject');

// Display subject details
document.addEventListener('DOMContentLoaded', function() {
  const subjectDetails = document.getElementById('subjectDetails');
  
  if (subject) {
    subjectDetails.innerHTML = `
      <h1 class="display-5 fw-bold mb-4">${subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
      <div class="row">
        <div class="col-md-8">
          <h3>Overview</h3>
          <p>This is the overview for ${subject.replace(/-/g, ' ')}. Here you can find all the resources, assignments, and quizzes related to this subject.</p>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Quick Links</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><a href="/e-learning/resources.html?subject=${subject}">Resources</a></li>
                <li class="list-group-item"><a href="/e-learning/assignments.html?subject=${subject}">Assignments</a></li>
                <li class="list-group-item"><a href="/e-learning/quizzes.html?subject=${subject}">Quizzes</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    subjectDetails.innerHTML = '<p>No subject specified.</p>';
  }
});