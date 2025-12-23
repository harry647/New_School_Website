// JavaScript for live.html
console.log('Live page loaded');

// Load live sessions dynamically
document.addEventListener('DOMContentLoaded', function() {
  const liveSessionsGrid = document.getElementById('liveSessionsGrid');
  
  // Sample live sessions data
  const liveSessions = [
    { id: 1, title: 'Mathematics Live Class', time: '10:00 AM - 11:00 AM', subject: 'Mathematics', link: '#' },
    { id: 2, title: 'Biology Q&A Session', time: '2:00 PM - 3:00 PM', subject: 'Biology', link: '#' },
    { id: 3, title: 'English Writing Workshop', time: '4:00 PM - 5:00 PM', subject: 'English', link: '#' },
  ];

  liveSessions.forEach(session => {
    liveSessionsGrid.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${session.title}</h5>
            <p class="card-text"><strong>Time:</strong> ${session.time}</p>
            <p class="card-text"><strong>Subject:</strong> ${session.subject}</p>
            <a href="${session.link}" class="btn btn-primary">Join Session</a>
          </div>
        </div>
      </div>
    `;
  });
});