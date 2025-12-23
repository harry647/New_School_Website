// JavaScript for analytics.html
console.log('Analytics page loaded');

// Initialize charts
document.addEventListener('DOMContentLoaded', function() {
  // Subject Progress Chart
  const subjectProgressCtx = document.getElementById('subjectProgressChart').getContext('2d');
  new Chart(subjectProgressCtx, {
    type: 'bar',
    data: {
      labels: ['Mathematics', 'English', 'Biology', 'Computer Studies'],
      datasets: [{
        label: 'Progress (%)',
        data: [85, 75, 90, 80],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  // Assignment Completion Chart
  const assignmentCompletionCtx = document.getElementById('assignmentCompletionChart').getContext('2d');
  new Chart(assignmentCompletionCtx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [12, 3],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  });
});