// JavaScript for live-sessions.html

// Mock data for development - replace with actual API calls
const mockSessions = [
  {
    id: 1,
    title: "Advanced Calculus Workshop",
    instructor: "Dr. Sarah Johnson",
    startTime: "2025-12-24T14:00:00",
    endTime: "2025-12-24T16:00:00",
    platformUrl: "https://zoom.us/j/123456789",
    isOngoing: true,
    isRecorded: false,
    description: "Explore advanced calculus concepts and problem-solving techniques.",
    subject: "math"
  },
  {
    id: 2,
    title: "Physics: Quantum Mechanics",
    instructor: "Prof. Michael Chen",
    startTime: "2025-12-25T10:00:00",
    endTime: "2025-12-25T12:00:00",
    platformUrl: "https://meet.google.com/abc-defg-hij",
    isOngoing: false,
    isRecorded: true,
    description: "Introduction to quantum physics and its applications.",
    subject: "science"
  },
  {
    id: 3,
    title: "Algebra Fundamentals",
    instructor: "Ms. Emily Wilson",
    startTime: "2025-12-26T09:30:00",
    endTime: "2025-12-26T11:30:00",
    platformUrl: "https://teams.microsoft.com/l/meetup-join/123456789",
    isOngoing: false,
    isRecorded: false,
    description: "Basic algebra concepts and problem-solving strategies.",
    subject: "math"
  },
  {
    id: 4,
    title: "Chemistry Lab: Reactions",
    instructor: "Dr. Robert Smith",
    startTime: "2025-12-27T13:00:00",
    endTime: "2025-12-27T15:00:00",
    platformUrl: "https://zoom.us/j/987654321",
    isOngoing: false,
    isRecorded: false,
    description: "Hands-on chemistry experiments and reaction analysis.",
    subject: "science"
  }
];

// DOM elements
const liveLoading = document.getElementById('liveLoading');
const liveEmpty = document.getElementById('liveEmpty');
const liveError = document.getElementById('liveError');
const liveSessionsGrid = document.getElementById('liveSessionsGrid');
const liveSearch = document.getElementById('liveSearch');
const liveFilter = document.getElementById('liveFilter');
const livePagination = document.getElementById('livePagination');

// State management
let allSessions = [];
let currentPage = 1;
const sessionsPerPage = 3;

// Initialize the page
async function initLiveSessions() {
  try {
    showLoading();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch sessions (mock data for now)
    allSessions = mockSessions;
    
    if (allSessions.length === 0) {
      showEmpty();
      return;
    }
    
    // Render initial sessions
    renderSessions(allSessions.slice(0, sessionsPerPage));
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if there are more sessions to load
    if (allSessions.length > sessionsPerPage) {
      livePagination.classList.remove('d-none');
    }
    
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    showError();
  }
}

// Show loading state
function showLoading() {
  liveLoading.classList.remove('d-none');
  liveEmpty.classList.add('d-none');
  liveError.classList.add('d-none');
  liveSessionsGrid.classList.add('d-none');
}

// Show empty state
function showEmpty() {
  liveLoading.classList.add('d-none');
  liveEmpty.classList.remove('d-none');
  liveError.classList.add('d-none');
  liveSessionsGrid.classList.add('d-none');
}

// Show error state
function showError() {
  liveLoading.classList.add('d-none');
  liveEmpty.classList.add('d-none');
  liveError.classList.remove('d-none');
  liveSessionsGrid.classList.add('d-none');
}

// Show sessions grid
function showSessions() {
  liveLoading.classList.add('d-none');
  liveEmpty.classList.add('d-none');
  liveError.classList.add('d-none');
  liveSessionsGrid.classList.remove('d-none');
}

// Render session cards
function renderSessions(sessions) {
  if (sessions.length === 0) {
    showEmpty();
    return;
  }
  
  sessions.forEach(session => {
    const sessionCard = createSessionCard(session);
    liveSessionsGrid.appendChild(sessionCard);
  });
  
  showSessions();
  
  // Initialize countdown timers
  initCountdownTimers();
}

// Create a session card element
function createSessionCard(session) {
  const cardCol = document.createElement('div');
  cardCol.className = 'col-md-6 col-lg-4';
  
  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);
  const now = new Date();
  
  // Determine session status
  const isUpcoming = startDate > now;
  const isOngoing = now >= startDate && now <= endDate;
  const isPast = endDate < now;
  
  cardCol.innerHTML = `
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">${session.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${session.instructor}</h6>
        <p class="card-text">${session.description}</p>
        
        <div class="mb-3">
          <p class="mb-1"><strong>Start:</strong> ${formatDate(startDate)}</p>
          <p class="mb-1"><strong>End:</strong> ${formatDate(endDate)}</p>
          
          ${isUpcoming ? `
            <p class="text-muted" id="sessionCountdown-${session.id}">Starts in ${calculateTimeRemaining(startDate)}</p>
          ` : ''}
          
          ${isOngoing ? '<span class="badge bg-success">Live Now</span>' : ''}
          ${isPast && !session.isRecorded ? '<span class="badge bg-secondary">Completed</span>' : ''}
          ${isPast && session.isRecorded ? '<span class="badge bg-info">Recording Available</span>' : ''}
        </div>
        
        <div class="d-flex gap-2">
          ${isOngoing || isUpcoming ? `
            <button class="btn btn-success btn-sm join-session" data-session-id="${session.id}">Join Live</button>
          ` : ''}
          ${session.isRecorded ? `
            <button class="btn btn-secondary btn-sm watch-replay" data-session-id="${session.id}">Watch Replay</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  return cardCol;
}

// Format date for display
function formatDate(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Calculate time remaining for countdown
function calculateTimeRemaining(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) return "00:00:00";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize countdown timers
function initCountdownTimers() {
  const now = new Date();
  
  allSessions.forEach(session => {
    const startDate = new Date(session.startTime);
    if (startDate > now) {
      const countdownElement = document.getElementById(`sessionCountdown-${session.id}`);
      if (countdownElement) {
        updateCountdownTimer(session.id, startDate);
      }
    }
  });
}

// Update countdown timer for a specific session
function updateCountdownTimer(sessionId, targetDate) {
  const countdownElement = document.getElementById(`sessionCountdown-${sessionId}`);
  if (!countdownElement) return;
  
  const interval = setInterval(() => {
    const timeRemaining = calculateTimeRemaining(targetDate);
    countdownElement.textContent = `Starts in ${timeRemaining}`;
    
    if (timeRemaining === "00:00:00") {
      clearInterval(interval);
      countdownElement.textContent = "Session starting now!";
      
      // Refresh the session card to show live status
      setTimeout(() => {
        location.reload(); // Simple refresh to update status
      }, 5000);
    }
  }, 1000);
}

// Set up event listeners
function setupEventListeners() {
  // Search functionality
  liveSearch.addEventListener('input', debounce(() => {
    filterAndRenderSessions();
  }, 300));
  
  // Filter functionality
  liveFilter.addEventListener('change', () => {
    filterAndRenderSessions();
  });
  
  // Pagination functionality
  livePagination.querySelector('button').addEventListener('click', () => {
    loadMoreSessions();
  });
  
  // Join session buttons (delegated event listener)
  liveSessionsGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('join-session')) {
      const sessionId = parseInt(e.target.getAttribute('data-session-id'));
      joinSession(sessionId);
    } else if (e.target.classList.contains('watch-replay')) {
      const sessionId = parseInt(e.target.getAttribute('data-session-id'));
      watchReplay(sessionId);
    }
  });
}

// Debounce function for search
function debounce(func, delay) {
  let timeoutId;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Filter and render sessions based on search and filter criteria
function filterAndRenderSessions() {
  const searchTerm = liveSearch.value.toLowerCase();
  const filterValue = liveFilter.value;
  
  let filteredSessions = allSessions.filter(session => {
    // Search filter
    const matchesSearch = 
      session.title.toLowerCase().includes(searchTerm) ||
      session.instructor.toLowerCase().includes(searchTerm) ||
      session.description.toLowerCase().includes(searchTerm);
    
    // Subject filter
    const matchesFilter = filterValue === '' || session.subject === filterValue;
    
    return matchesSearch && matchesFilter;
  });
  
  // Clear and re-render
  liveSessionsGrid.innerHTML = '';
  
  if (filteredSessions.length === 0) {
    showEmpty();
    return;
  }
  
  // Render filtered sessions (reset to first page)
  currentPage = 1;
  renderSessions(filteredSessions.slice(0, sessionsPerPage));
  
  // Update pagination visibility
  if (filteredSessions.length > sessionsPerPage) {
    livePagination.classList.remove('d-none');
  } else {
    livePagination.classList.add('d-none');
  }
}

// Load more sessions (pagination)
function loadMoreSessions() {
  const searchTerm = liveSearch.value.toLowerCase();
  const filterValue = liveFilter.value;
  
  let filteredSessions = allSessions.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchTerm) ||
      session.instructor.toLowerCase().includes(searchTerm) ||
      session.description.toLowerCase().includes(searchTerm);
    
    const matchesFilter = filterValue === '' || session.subject === filterValue;
    
    return matchesSearch && matchesFilter;
  });
  
  currentPage++;
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const sessionsToAdd = filteredSessions.slice(startIndex, endIndex);
  
  if (sessionsToAdd.length === 0) {
    livePagination.classList.add('d-none');
    return;
  }
  
  renderSessions(sessionsToAdd);
  
  // Hide pagination if we've reached the end
  if (endIndex >= filteredSessions.length) {
    livePagination.classList.add('d-none');
  }
}

// Join a live session
function joinSession(sessionId) {
  const session = allSessions.find(s => s.id === sessionId);
  if (session) {
    // In a real app, this would call the API endpoint
    // POST /api/live-sessions/join with sessionId
    console.log(`Joining session: ${session.title}`, session);
    alert(`Redirecting to live session: ${session.platformUrl}`);
    // window.location.href = session.platformUrl;
  }
}

// Watch session replay
function watchReplay(sessionId) {
  const session = allSessions.find(s => s.id === sessionId);
  if (session) {
    console.log(`Watching replay for: ${session.title}`, session);
    alert(`Redirecting to session replay: ${session.platformUrl}?replay=true`);
    // window.location.href = `${session.platformUrl}?replay=true`;
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initLiveSessions);