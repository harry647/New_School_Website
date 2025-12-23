// JavaScript for live.html - Enhanced Live Sessions Overview
console.log('Live page loaded');

// Mock API data for demonstration
const mockApiData = {
  totalSessions: 12,
  sessionsAttended: 5,
  upcomingSessions: [
    {
      id: 1,
      title: 'Advanced Mathematics: Calculus Review',
      time: '2025-12-24T10:00:00',
      subject: 'Mathematics',
      instructor: 'Mr. Johnson',
      isFeatured: true,
      link: '#'
    },
    {
      id: 2,
      title: 'Biology: Cell Structure Deep Dive',
      time: '2025-12-24T14:00:00',
      subject: 'Biology',
      instructor: 'Ms. Williams',
      isFeatured: true,
      link: '#'
    },
    {
      id: 3,
      title: 'English Writing Workshop',
      time: '2025-12-24T16:00:00',
      subject: 'English',
      instructor: 'Mr. Thompson',
      isFeatured: false,
      link: '#'
    },
    {
      id: 4,
      title: 'Physics: Newton\'s Laws',
      time: '2025-12-25T09:00:00',
      subject: 'Physics',
      instructor: 'Dr. Lee',
      isFeatured: false,
      link: '#'
    }
  ],
  allSessions: [
    {
      id: 1,
      title: 'Advanced Mathematics: Calculus Review',
      time: '2025-12-24T10:00:00',
      subject: 'Mathematics',
      instructor: 'Mr. Johnson',
      link: '#'
    },
    {
      id: 2,
      title: 'Biology: Cell Structure Deep Dive',
      time: '2025-12-24T14:00:00',
      subject: 'Biology',
      instructor: 'Ms. Williams',
      link: '#'
    },
    {
      id: 3,
      title: 'English Writing Workshop',
      time: '2025-12-24T16:00:00',
      subject: 'English',
      instructor: 'Mr. Thompson',
      link: '#'
    },
    {
      id: 4,
      title: 'Physics: Newton\'s Laws',
      time: '2025-12-25T09:00:00',
      subject: 'Physics',
      instructor: 'Dr. Lee',
      link: '#'
    },
    {
      id: 5,
      title: 'Chemistry: Chemical Reactions',
      time: '2025-12-25T11:00:00',
      subject: 'Chemistry',
      instructor: 'Ms. Davis',
      link: '#'
    },
    {
      id: 6,
      title: 'History: World War II Analysis',
      time: '2025-12-25T13:00:00',
      subject: 'History',
      instructor: 'Mr. Wilson',
      link: '#'
    }
  ]
};

// DOM Elements
const elements = {
  totalLiveSessions: document.getElementById('totalLiveSessions'),
  featuredSessions: document.getElementById('featuredSessions'),
  liveSearch: document.getElementById('liveSearch'),
  liveFilter: document.getElementById('liveFilter'),
  nextSessionCountdown: document.getElementById('nextSessionCountdown'),
  statsTotalSessions: document.getElementById('statsTotalSessions'),
  statsAttended: document.getElementById('statsAttended'),
  statsNextSession: document.getElementById('statsNextSession'),
  livePagination: document.getElementById('livePagination')
};

// Utility Functions
function formatTime(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timeString) {
  const date = new Date(timeString);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function calculateCountdown(targetTime) {
  const now = new Date();
  const target = new Date(targetTime);
  const diff = target - now;
  
  if (diff <= 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateCountdown() {
  if (mockApiData.upcomingSessions.length > 0) {
    const nextSession = mockApiData.upcomingSessions[0];
    elements.nextSessionCountdown.textContent = calculateCountdown(nextSession.time);
    elements.statsNextSession.textContent = `${formatDate(nextSession.time)} ${formatTime(nextSession.time)}`;
  }
}

// Render Functions
function renderFeaturedSessions() {
  const featured = mockApiData.upcomingSessions.filter(session => session.isFeatured).slice(0, 2);
  
  if (featured.length === 0) {
    elements.featuredSessions.innerHTML = '<p class="text-muted">No featured sessions at this time.</p>';
    return;
  }
  
  elements.featuredSessions.innerHTML = featured.map(session => `
    <div class="col-md-6">
      <div class="card h-100 border-0 shadow-sm featured-session">
        <div class="card-body">
          <span class="badge bg-primary mb-2">Featured</span>
          <h5 class="card-title">${session.title}</h5>
          <p class="card-text"><strong>Subject:</strong> ${session.subject}</p>
          <p class="card-text"><strong>Instructor:</strong> ${session.instructor}</p>
          <p class="card-text"><strong>Time:</strong> ${formatDate(session.time)} ${formatTime(session.time)}</p>
          <a href="${session.link}" class="btn btn-primary">Join Session</a>
        </div>
      </div>
    </div>
  `).join('');
}

function renderStatistics() {
  elements.totalLiveSessions.textContent = mockApiData.totalSessions;
  elements.statsTotalSessions.textContent = mockApiData.totalSessions;
  elements.statsAttended.textContent = mockApiData.sessionsAttended;
}

function setupSearchAndFilter() {
  // Search functionality
  elements.liveSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    console.log('Searching for:', searchTerm);
    // In a real implementation, this would filter the sessions
  });
  
  // Filter functionality
  elements.liveFilter.addEventListener('change', function(e) {
    const filterValue = e.target.value;
    console.log('Filtering by:', filterValue);
    // In a real implementation, this would filter the sessions
  });
}

function setupLoadMore() {
  const loadMoreButton = elements.livePagination.querySelector('button');
  loadMoreButton.addEventListener('click', function() {
    console.log('Load more sessions clicked');
    // In a real implementation, this would load more sessions
    // For now, we'll just show a message
    alert('Load more functionality would be implemented here');
  });
  
  // Show the load more button since we have more than 4 sessions
  elements.livePagination.classList.remove('d-none');
}

// Main Initialization
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing live sessions overview');
  
  // Update statistics
  renderStatistics();
  
  // Render featured sessions
  renderFeaturedSessions();
  
  // Setup search and filter
  setupSearchAndFilter();
  
  // Setup countdown timer
  updateCountdown();
  setInterval(updateCountdown, 1000);
  
  // Setup load more functionality
  setupLoadMore();
  
  console.log('Live sessions overview initialized');
});