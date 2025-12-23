// JavaScript for dashboard.html

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const dashboardLoading = document.getElementById('dashboardLoading');
  const dashboardError = document.getElementById('dashboardError');
  const refreshDashboard = document.getElementById('refreshDashboard');
  const progressBar = document.getElementById('progressBar');
  const achievementsGrid = document.getElementById('achievementsGrid');
  const noAchievements = document.getElementById('noAchievements');

  // Hide loading state and show dashboard content
  function hideLoading() {
    dashboardLoading.classList.add('d-none');
  }

  // Show error state
  function showError() {
    dashboardLoading.classList.add('d-none');
    dashboardError.classList.remove('d-none');
  }

  // Simulate loading dashboard data
  function loadDashboardData() {
    // Show loading state
    dashboardLoading.classList.remove('d-none');
    dashboardError.classList.add('d-none');

    // Simulate API call delay
    setTimeout(function() {
      try {
        // Simulate successful data loading
        const mockData = {
          totalLessons: 42,
          overallProgress: 75,
          studyStreak: 14,
          totalPoints: 1250,
          achievements: []
        };

        // Update stats
        document.getElementById('totalLessons').textContent = mockData.totalLessons;
        document.getElementById('overallProgress').textContent = mockData.overallProgress + '%';
        document.getElementById('studyStreak').textContent = mockData.studyStreak;
        document.getElementById('totalPoints').textContent = mockData.totalPoints;

        // Update progress bar
        progressBar.style.width = mockData.overallProgress + '%';

        // Handle achievements
        if (mockData.achievements.length === 0) {
          noAchievements.classList.remove('d-none');
        } else {
          noAchievements.classList.add('d-none');
          // Populate achievements grid
          mockData.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = 'col-md-4';
            achievementElement.innerHTML = `
              <div class="achievement-card glass-card p-3">
                <h6 class="mb-2">${achievement.title}</h6>
                <p class="text-muted mb-0">${achievement.description}</p>
              </div>
            `;
            achievementsGrid.appendChild(achievementElement);
          });
        }

        // Hide loading state
        hideLoading();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError();
      }
    }, 1500); // Simulate network delay
  }

  // Refresh dashboard data
  function refreshDashboardData() {
    // Clear achievements grid
    achievementsGrid.innerHTML = '';
    achievementsGrid.appendChild(noAchievements);
    noAchievements.classList.add('d-none');

    // Reload data
    loadDashboardData();
  }

  // Event listeners
  if (refreshDashboard) {
    refreshDashboard.addEventListener('click', refreshDashboardData);
  }

  // Initial load
  loadDashboardData();
});