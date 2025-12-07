// =======================================================
// e-learning-portal.js – Complete E-Learning System (2026+)
// Enhanced with Dashboard, Analytics, Live Sessions, Calendar
// Teachers: Upload videos, PDFs, images, quizzes
// Students: View, download, submit assignments
// Fully backend-powered with comprehensive features
// =======================================================

// Configuration Management
const CONFIG = {
    API_BASE: '/api',
    LOG_LEVEL: 'info', // debug, info, warn, error
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    REAL_TIME_UPDATE_INTERVAL: 30000 // 30 seconds
};

// Logging Utility
const logger = {
    log: (level, message, data = null) => {
        const levels = ['debug', 'info', 'warn', 'error'];
        if (levels.indexOf(CONFIG.LOG_LEVEL) <= levels.indexOf(level)) {
            console[level](`[${new Date().toISOString()}] [E-Learning] ${message}`, data || '');
        }
    },
    debug: (msg, data) => logger.log('debug', msg, data),
    info: (msg, data) => logger.log('info', msg, data),
    warn: (msg, data) => logger.log('warn', msg, data),
    error: (msg, data) => logger.log('error', msg, data)
};

let DATA = {};
let currentRole = "student";
let cache = {};
let realTimeInterval = null;

// ==================== AUTH & ROLE ====================
function isLoggedIn() {
  return localStorage.getItem("userLoggedIn") === "true";
}

function setRole(role) {
  currentRole = role;
  localStorage.setItem("portalRole", role);

  document.getElementById("roleStudent")?.classList.toggle("active", role === "student");
  document.getElementById("roleTeacher")?.classList.toggle("active", role === "teacher");
  document.getElementById("teacherPanel")?.classList.toggle("d-none", role !== "teacher");
  
  // Update search placeholder based on role
  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.placeholder = role === 'teacher' ? 'Search lessons, students...' : 'Search courses, topics...';
  }
}

// Smooth scroll
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Logout function
function logout() {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('portalRole');
  localStorage.removeItem('userName');
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
  }
  window.location.reload();
}

// ==================== DOM LOADED ====================
document.addEventListener("DOMContentLoaded", () => {
  w3.includeHTML(() => {
    if (!isLoggedIn()) {
      document.getElementById("loginCheck")?.classList.remove("d-none");
      return;
    }

    document.getElementById("mainContent")?.classList.remove("d-none");

    // Restore saved role
    const savedRole = localStorage.getItem("portalRole") || "student";
    setRole(savedRole);

    // Show loading spinner
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.classList.remove("d-none");

    // Load all portal data
    loadPortalData().finally(() => {
      if (spinner) spinner.classList.add("d-none");
    });

    setupTeacherUpload();
    setupBackToTop();
    setupSearch();
    setupRealTimeUpdates();
    updateUserInfo();
  });
});

// ==================== BACK TO TOP FUNCTIONALITY ====================
function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop");

  if (!backToTopBtn) return;

  // Show/hide button based on scroll position
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  });

  // Smooth scroll to top
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ==================== SEARCH FUNCTIONALITY ====================
function setupSearch() {
  const searchInput = document.getElementById('globalSearch');
  if (!searchInput) return;

  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performGlobalSearch(e.target.value);
    }, 300);
  });

  // Resource filter buttons
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterResources(button.dataset.filter);
    });
  });

  // Subject filter
  const subjectFilter = document.getElementById('subjectFilter');
  if (subjectFilter) {
    subjectFilter.addEventListener('change', () => {
      filterResourcesBySubject(subjectFilter.value);
    });
  }
}

function performGlobalSearch(query) {
  if (!query.trim()) return;
  
  logger.info(`Performing global search for: ${query}`);
  // In a real implementation, this would search across all content
  showAlert(`Searching for: "${query}"`, 'info');
}

function filterResources(filter) {
  const resources = document.querySelectorAll('#resourcesGrid .resource-card');
  resources.forEach(resource => {
    const type = resource.dataset.type;
    if (filter === 'all' || type === filter) {
      resource.style.display = 'block';
    } else {
      resource.style.display = 'none';
    }
  });
}

function filterResourcesBySubject(subject) {
  const resources = document.querySelectorAll('#resourcesGrid .resource-card');
  resources.forEach(resource => {
    const resourceSubject = resource.dataset.subject;
    if (!subject || resourceSubject === subject) {
      resource.style.display = 'block';
    } else {
      resource.style.display = 'none';
    }
  });
}

// ==================== REAL-TIME UPDATES ====================
function setupRealTimeUpdates() {
  realTimeInterval = setInterval(() => {
    if (isLoggedIn()) {
      loadPortalData(true); // Force refresh for real-time updates
    }
  }, CONFIG.REAL_TIME_UPDATE_INTERVAL);
}

// ==================== USER INFO ====================
function updateUserInfo() {
  const userName = localStorage.getItem('userName') || 'Student';
  const userElement = document.getElementById('userName');
  const heroUserElement = document.getElementById('heroUserName');
  
  if (userElement) userElement.textContent = userName;
  if (heroUserElement) heroUserElement.textContent = userName;
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadPortalData(forceRefresh = false) {
  const cacheKey = 'portalData';
  const now = Date.now();

  // Check cache if not forcing refresh
  if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < CONFIG.CACHE_DURATION) {
    logger.debug('Using cached portal data');
    DATA = cache[cacheKey].data;
    renderAllSections();
    return;
  }

  let attempts = 0;
  while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
    try {
      logger.info(`Fetching portal data (attempt ${attempts + 1})`);
      const res = await fetch(`${CONFIG.API_BASE}/elearning/data`, {
        cache: forceRefresh ? "no-store" : "default",
        headers: { 'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300' }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      DATA = await res.json();

      // Cache the data
      cache[cacheKey] = { data: DATA, timestamp: now };
      logger.info('Portal data loaded successfully');

      renderAllSections();
      return;
    } catch (err) {
      attempts++;
      logger.warn(`Data load attempt ${attempts} failed:`, err.message);

      if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
        logger.error('All data load attempts failed');
        showAlert("Unable to load portal data. Please check your connection and refresh.", "danger");
        // Load from cache if available as fallback
        if (cache[cacheKey]) {
          logger.info('Falling back to cached data');
          DATA = cache[cacheKey].data;
          renderAllSections();
        }
        return;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
    }
  }
}

// Helper to render all sections
function renderAllSections() {
  loadDashboard();
  loadSubjects();
  loadLiveSessions();
  loadCalendar();
  loadResources();
  loadQuizzes();
  loadForum();
  loadAnalytics();
  loadMedia();
  loadNotifications();
  loadStudyPlans();
}

// ==================== RENDER FUNCTIONS ====================

// Dashboard & Stats
function loadDashboard() {
  if (!DATA.user || !DATA.progress) return;

  // Update hero stats
  const totalLessons = DATA.progress.subjects.reduce((sum, s) => sum + s.lessonsCompleted, 0);
  const overallProgress = Math.round(DATA.progress.overallCompletion);
  const studyStreak = DATA.user.streak || 0;
  const totalPoints = DATA.user.totalPoints || 0;

  document.getElementById('totalLessons').textContent = totalLessons;
  document.getElementById('overallProgress').textContent = overallProgress + '%';
  document.getElementById('studyStreak').textContent = studyStreak;
  document.getElementById('totalPoints').textContent = totalPoints.toLocaleString();

  // Update hero section with dynamic data
  const pendingTasks = (DATA.quizzes?.filter(q => q.status === 'available').length || 0) + 
                      (DATA.assignments?.filter(a => a.status === 'pending').length || 0);
  document.getElementById('pendingTasks').textContent = `${pendingTasks} tasks`;
  document.getElementById('currentStreak').textContent = `${studyStreak}-day`;

  // Load achievements
  loadAchievements();
}

function loadAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid || !DATA.achievements) return;

  const recentAchievements = DATA.achievements.slice(0, 4);
  
  grid.innerHTML = recentAchievements.map(achievement => `
    <div class="col-md-6 col-lg-3">
      <div class="achievement-badge">
        <div class="achievement-icon" style="background: ${achievement.color}">
          <i class="fas ${achievement.icon}"></i>
        </div>
        <div>
          <h6 class="mb-1 fw-bold">${achievement.title}</h6>
          <p class="text-muted small mb-1">${achievement.description}</p>
          <small class="text-muted">${achievement.points} points</small>
        </div>
      </div>
    </div>
  `).join('');
}

// Subjects with enhanced data
function loadSubjects() {
  const grid = document.getElementById("subjectsGrid");
  if (!grid || !DATA.subjects) return;

  grid.innerHTML = DATA.subjects.map(s => {
    const progressPercent = Math.round((s.completed / s.lessons) * 100);
    return `
      <div class="col-md-4 mb-4">
        <div class="subject-card p-4 h-100" style="border-top: 4px solid ${s.color}">
          <i class="fas ${s.icon || 'fa-book'} fa-3x mb-3" style="color: ${s.color}"></i>
          <h3 class="h5 fw-bold mb-2">${s.name}</h3>
          <p class="text-muted small mb-3">${s.teacher}</p>
          
          <div class="progress mb-2" style="height: 8px;">
            <div class="progress-bar" style="width: ${progressPercent}%; background: ${s.color}"></div>
          </div>
          <p class="small text-muted mb-2">${s.completed}/${s.lessons} lessons completed</p>
          
          <p class="small text-info mb-3">
            <i class="fas fa-play-circle me-1"></i>Next: ${s.nextLesson}
          </p>
          
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-light text-dark">${s.quizzes} quizzes</span>
            <button class="btn btn-sm btn-primary" onclick="openCourse('${s.id}')">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Live Sessions
function loadLiveSessions() {
  const grid = document.getElementById("liveSessionsGrid");
  if (!grid || !DATA.liveSessions) return;

  grid.innerHTML = DATA.liveSessions.map(session => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="live-session-card p-4 h-100">
        <div class="live-indicator mb-3">
          <div class="live-dot"></div>
          <span>LIVE</span>
        </div>
        <h5 class="fw-bold mb-2">${session.title}</h5>
        <p class="text-muted small mb-2">${session.subject} • ${session.teacher}</p>
        <p class="small mb-3">${session.description}</p>
        
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge bg-info">${session.registered}/${session.maxParticipants} joined</span>
          <span class="small text-muted">${session.duration} mins</span>
        </div>
        
        <div class="d-grid">
          <button class="btn btn-success" onclick="joinLiveSession('${session.id}')">
            <i class="fas fa-video me-2"></i>Join Session
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Calendar & Schedule
function loadCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  const upcomingEvents = document.getElementById('upcomingEvents');
  
  if (!calendarGrid || !DATA.calendar) return;

  // Generate calendar for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  let calendarHTML = '';
  
  // Header row
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarHTML += '<div class="calendar-header" style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--primary); color: white; padding: 1rem; font-weight: bold;">';
  daysOfWeek.forEach(day => {
    calendarHTML += `<div class="text-center">${day}</div>`;
  });
  calendarHTML += '</div>';

  // Calendar days
  calendarHTML += '<div class="calendar-body" style="display: grid; grid-template-columns: repeat(7, 1fr);">';
  
  const currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = currentDate.toDateString() === today.toDateString();
    const hasEvent = DATA.calendar.some(event => event.date.startsWith(dateStr));
    
    calendarHTML += `
      <div class="calendar-day ${isCurrentMonth ? '' : 'text-muted'} ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" 
           data-date="${dateStr}">
        <div class="fw-bold">${currentDate.getDate()}</div>
      </div>
    `;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  calendarHTML += '</div>';
  
  calendarGrid.innerHTML = calendarHTML;

  // Upcoming events
  if (upcomingEvents) {
    const upcoming = DATA.calendar
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    upcomingEvents.innerHTML = upcoming.map(event => `
      <div class="event-item ${event.type}">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${event.title}</h6>
            <p class="text-muted small mb-1">${formatDate(event.date)} at ${event.time}</p>
            <span class="badge bg-light text-dark">${event.subject}</span>
          </div>
          ${event.reminder ? '<i class="fas fa-bell text-warning"></i>' : ''}
        </div>
      </div>
    `).join('');
  }
}

// Enhanced Resources
function loadResources() {
  const grid = document.getElementById("resourcesGrid");
  const subjectFilter = document.getElementById("subjectFilter");
  
  if (!grid || !DATA.resources) return;

  // Populate subject filter
  if (subjectFilter && DATA.subjects) {
    subjectFilter.innerHTML = '<option value="">All Subjects</option>' +
      DATA.subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  }

  grid.innerHTML = DATA.resources.map(r => {
    const stars = '★'.repeat(Math.floor(r.rating || 0)) + '☆'.repeat(5 - Math.floor(r.rating || 0));
    return `
      <div class="col-md-6 col-lg-4 mb-4" data-type="${r.type}" data-subject="${r.subject}">
        <div class="resource-card p-4 h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <i class="fas ${getFileIcon(r.type)} fa-3x" style="color:${r.color || '#007bff'}"></i>
            <div class="text-end">
              <div class="text-warning">${stars}</div>
              <small class="text-muted">${(r.rating || 0).toFixed(1)}</small>
            </div>
          </div>
          
          <h5 class="fw-bold mb-2">${r.title}</h5>
          <p class="text-muted small mb-2">${r.subject} • ${r.teacher}</p>
          <p class="small text-muted mb-3">${r.description}</p>
          
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge bg-light text-dark">${r.type.toUpperCase()}</span>
            <small class="text-muted">
              <i class="fas fa-download me-1"></i>${r.downloads || r.views || 0}
            </small>
          </div>
          
          <div class="d-grid">
            <a href="${r.url}" target="_blank" class="btn btn-primary btn-sm">
              <i class="fas ${r.type === 'video' ? 'fa-play' : 'fa-external-link-alt'} me-2"></i>
              ${r.type === 'video' ? 'Watch' : 'Open'} Resource
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Enhanced Quizzes & Assignments
function loadQuizzes() {
  const grid = document.getElementById("quizGrid");
  const pendingQuizzes = document.getElementById("pendingQuizzes");
  const activeAssignments = document.getElementById("activeAssignments");
  
  if (!grid || !DATA.quizzes) return;

  // Pending quizzes summary
  if (pendingQuizzes) {
    const pending = DATA.quizzes.filter(q => q.status === 'available');
    pendingQuizzes.innerHTML = pending.length > 0 ? 
      pending.map(q => `
        <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
          <div>
            <strong>${q.title}</strong>
            <div class="small text-muted">${q.subject} • Due: ${formatDate(q.dueDate)}</div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="startQuiz('${q.id}')">Start</button>
        </div>
      `).join('') : '<p class="text-muted">No pending quizzes</p>';
  }

  // Active assignments summary
  if (activeAssignments && DATA.assignments) {
    const active = DATA.assignments.filter(a => a.status === 'pending' || a.status === 'in-progress');
    activeAssignments.innerHTML = active.length > 0 ?
      active.map(a => `
        <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
          <div>
            <strong>${a.title}</strong>
            <div class="small text-muted">${a.subject} • Due: ${formatDate(a.dueDate)}</div>
            ${a.status === 'in-progress' ? `<div class="progress mt-1" style="height: 4px;"><div class="progress-bar" style="width: ${a.progress}%"></div></div>` : ''}
          </div>
          <span class="assignment-status">
            <span class="status-indicator ${a.status}"></span>
            <button class="btn btn-sm btn-outline-primary" onclick="viewAssignment('${a.id}')">View</button>
          </span>
        </div>
      `).join('') : '<p class="text-muted">No active assignments</p>';
  }

  // Full quiz grid
  grid.innerHTML = DATA.quizzes.map(q => {
    const isDueSoon = new Date(q.dueDate) - new Date() < 24 * 60 * 60 * 1000;
    const isOverdue = new Date(q.dueDate) < new Date();
    
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="quiz-card p-4 h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <span class="badge bg-${q.status === 'available' ? 'success' : 'secondary'}">
              ${q.status.toUpperCase()}
            </span>
            <span class="difficulty ${q.difficulty}">${q.difficulty}</span>
          </div>
          
          <h5 class="fw-bold mb-2">${q.title}</h5>
          <p class="text-muted small mb-2">${q.subject} • ${q.questions} questions • ${q.duration} mins</p>
          <p class="text-muted small mb-3">
            <i class="fas fa-calendar me-1"></i>Due: ${formatDate(q.dueDate)}
            ${isDueSoon && !isOverdue ? '<span class="text-warning ms-2"><i class="fas fa-exclamation-triangle"></i> Due Soon</span>' : ''}
            ${isOverdue ? '<span class="text-danger ms-2"><i class="fas fa-clock"></i> Overdue</span>' : ''}
          </p>
          
          <div class="mb-3">
            <small class="text-muted">Topics: ${q.topics.join(', ')}</small>
          </div>
          
          <div class="d-grid">
            <button class="btn btn-${q.status === 'available' ? 'primary' : 'secondary'}" 
                    onclick="startQuiz('${q.id}')" 
                    ${q.status !== 'available' ? 'disabled' : ''}>
              <i class="fas ${q.status === 'available' ? 'fa-play' : 'fa-lock'} me-2"></i>
              ${q.status === 'available' ? 'Start Quiz' : 'Coming Soon'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Enhanced Forum
function loadForum() {
  const grid = document.getElementById("forumGrid");
  const categories = document.getElementById("forumCategories");
  
  if (!grid || !DATA.forum) return;

  // Forum threads
  grid.innerHTML = DATA.forum.map(thread => `
    <div class="col-12 mb-4">
      <div class="forum-thread">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="d-flex align-items-center gap-3">
            <img src="${thread.authorAvatar}" alt="${thread.author}" class="rounded-circle" width="40" height="40">
            <div>
              <h5 class="mb-1">${thread.title}</h5>
              <div class="thread-meta">
                <span><i class="fas fa-user me-1"></i>${thread.author}</span>
                <span><i class="fas fa-calendar me-1"></i>${formatDate(thread.date)}</span>
                <span><i class="fas fa-eye me-1"></i>${thread.views} views</span>
                <span><i class="fas fa-reply me-1"></i>${thread.replies} replies</span>
              </div>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-${thread.status === 'answered' ? 'success' : 'warning'}">
              ${thread.status === 'answered' ? 'Answered' : 'Open'}
            </span>
            ${thread.isPinned ? '<i class="fas fa-thumbtack text-warning ms-1" title="Pinned"></i>' : ''}
          </div>
        </div>
        
        <p class="text-muted mb-3">${thread.content}</p>
        
        <div class="thread-tags">
          ${thread.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        
        <div class="d-flex justify-content-between align-items-center mt-3">
          <span class="badge bg-light text-dark">${thread.category}</span>
          <button class="btn btn-outline-primary btn-sm" onclick="viewThread('${thread.id}')">
            <i class="fas fa-comments me-1"></i>View Discussion
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Forum categories sidebar
  if (categories && DATA.subjects) {
    const categoryStats = DATA.subjects.map(subject => {
      const count = DATA.forum.filter(thread => thread.category === subject.name).length;
      return { name: subject.name, count, icon: subject.icon };
    });

    categories.innerHTML = categoryStats.map(cat => `
      <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <i class="fas ${cat.icon} text-primary"></i>
          <span>${cat.name}</span>
        </div>
        <span class="badge bg-primary">${cat.count}</span>
      </div>
    `).join('');
  }
}

// Analytics & Progress
function loadAnalytics() {
  if (!DATA.analytics) return;

  // Subject Performance Chart
  const subjectChart = document.getElementById('subjectProgressChart');
  if (subjectChart) {
    const subjects = Object.keys(DATA.analytics.subjectPerformance);
    const scores = subjects.map(s => DATA.analytics.subjectPerformance[s].score);
    
    subjectChart.innerHTML = `
      <div class="row g-3">
        ${subjects.map((subject, index) => `
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small fw-bold">${subject}</span>
              <span class="small">${scores[index]}%</span>
            </div>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-${scores[index] >= 80 ? 'success' : scores[index] >= 60 ? 'warning' : 'danger'}" 
                   style="width: ${scores[index]}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Study Time Chart
  const studyTimeChart = document.getElementById('studyTimeChart');
  if (studyTimeChart) {
    const weekData = DATA.analytics.weeklyProgress;
    const maxValue = Math.max(...weekData);
    
    studyTimeChart.innerHTML = `
      <div class="row g-2">
        ${weekData.map((value, index) => {
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const percentage = (value / maxValue) * 100;
          return `
            <div class="col text-center">
              <div class="d-flex flex-column align-items-center">
                <div class="bg-light rounded" style="height: 100px; width: 20px; position: relative;">
                  <div class="bg-primary rounded-bottom" 
                       style="height: ${percentage}%; width: 100%; position: absolute; bottom: 0;"></div>
                </div>
                <small class="mt-1">${dayNames[index]}</small>
                <small class="text-muted">${value}%</small>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

// Enhanced Media Gallery
function loadMedia() {
  const grid = document.getElementById("mediaGrid");
  if (!grid || !DATA.media) return;

  grid.innerHTML = DATA.media.map(m => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="media-card glass-card overflow-hidden">
        ${m.type === 'video'
          ? `
            <div class="position-relative">
              <video controls class="w-100 media-thumbnail" poster="${m.thumbnail || ''}" preload="metadata">
                <source src="${m.url}" type="video/mp4">
                Your browser does not support video.
              </video>
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-dark">${m.duration}</span>
              </div>
            </div>
          `
          : m.type === 'gallery'
          ? `
            <div class="position-relative">
              <div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                <i class="fas fa-images fa-3x text-muted"></i>
              </div>
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-primary">${m.images} images</span>
              </div>
            </div>
          `
          : `
            <div class="position-relative">
              <img src="${m.url}" class="media-thumbnail" alt="${m.title}" loading="lazy" decoding="async">
              ${m.interactions ? `<div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-info">${m.interactions} interactions</span>
              </div>` : ''}
            </div>
          `
        }
        <div class="p-3">
          <h5 class="mb-2">${m.title}</h5>
          <div class="media-meta">
            <span><i class="fas fa-user me-1"></i>${m.teacher}</span>
            <span><i class="fas fa-calendar me-1"></i>${formatDate(m.date)}</span>
          </div>
          <p class="text-muted small mt-2 mb-3">${m.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="badge bg-light text-dark">${m.subject}</span>
            <small class="text-muted">
              <i class="fas ${m.type === 'video' ? 'fa-eye' : 'fa-download'} me-1"></i>
              ${m.views || m.interactions || 0}
            </small>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// Enhanced Notifications
function loadNotifications() {
  const list = document.getElementById("notificationList");
  if (!list || !DATA.notifications) return;

  list.innerHTML = DATA.notifications.map(n => `
    <div class="notification-item ${n.read ? '' : 'unread'}">
      <div class="notification-icon ${n.type}">
        <i class="fas ${getNotificationIcon(n.type)}"></i>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="mb-1 fw-bold">${n.title}</h6>
          <small class="text-muted">${formatDate(n.date)}</small>
        </div>
        <p class="mb-2">${n.message}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge bg-light text-dark">${n.subject}</span>
          <div class="d-flex gap-2">
            ${n.priority === 'high' || n.priority === 'urgent' ? 
              `<span class="badge bg-${n.priority === 'urgent' ? 'danger' : 'warning'}">${n.priority}</span>` : ''}
            ${n.link ? `<a href="${n.link}" class="btn btn-sm btn-outline-primary">View</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// Study Plans
function loadStudyPlans() {
  const grid = document.getElementById('studyPlansGrid');
  if (!grid || !DATA.studyPlan) return;

  grid.innerHTML = DATA.studyPlan.map(plan => `
    <div class="col-md-6 mb-4">
      <div class="study-plan-card">
        <h5 class="fw-bold mb-3">${plan.title}</h5>
        
        <div class="plan-subjects">
          ${plan.subjects.map(subject => `<span class="plan-subject">${subject}</span>`).join('')}
        </div>
        
        <div class="plan-schedule">
          <h6 class="mb-2">Schedule:</h6>
          ${plan.timeSlots.map((slot, index) => `
            <div class="schedule-item">
              <span>${slot}</span>
              <span class="badge bg-light text-dark">${plan.duration} mins</span>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-3">
          <h6 class="mb-2">Goals:</h6>
          <ul class="list-unstyled">
            ${plan.goals.map(goal => `<li class="small"><i class="fas fa-check text-success me-2"></i>${goal}</li>`).join('')}
          </ul>
        </div>
        
        <div class="d-grid mt-3">
          <button class="btn btn-outline-primary" onclick="startStudyPlan('${plan.id}')">
            <i class="fas fa-play me-2"></i>Start This Plan
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==================== TEACHER UPLOAD SYSTEM ====================
function setupTeacherUpload() {
  const form = document.getElementById("uploadForm");
  const fileInput = form?.querySelector('input[type="file"]');
  const fileList = document.getElementById("fileList");

  if (!form) return;

  // Show selected files
  fileInput?.addEventListener("change", () => {
    fileList.innerHTML = "";
    Array.from(fileInput.files).forEach(file => {
      const div = document.createElement("div");
      div.className = "badge bg-light text-dark me-2 mb-2";
      div.innerHTML = `${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
      fileList.appendChild(div);
    });
  });

  // Submit upload to backend
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading...`;

    const formData = new FormData(this);

    let attempts = 0;
    while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
      try {
        logger.info(`Uploading files (attempt ${attempts + 1})`);
        const res = await fetch(`${CONFIG.API_BASE}/elearning/upload`, {
          method: "POST",
          body: formData
        });

        let result;
        try {
          result = await res.json();
        } catch (parseErr) {
          logger.error('Failed to parse upload response', parseErr);
          throw new Error('Invalid response from server');
        }

        if (res.ok && result.success) {
          logger.info('Upload successful');
          showAlert("Resource uploaded successfully!", "success");
          this.reset();
          fileList.innerHTML = "";
          loadPortalData(true); // Force refresh content
          return;
        } else {
          throw new Error(result.message || `Upload failed with status ${res.status}`);
        }
      } catch (err) {
        attempts++;
        logger.warn(`Upload attempt ${attempts} failed:`, err.message);

        if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
          logger.error('All upload attempts failed');
          showAlert(`Upload failed after ${CONFIG.MAX_RETRY_ATTEMPTS} attempts. Please try again.`, "danger");
          return;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
      }
    }
  });
}

// ==================== UTILITIES ====================
function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    video: "fa-file-video",
    image: "fa-file-image",
    quiz: "fa-question-circle",
    assignment: "fa-tasks"
  };
  return icons[type] || "fa-file-alt";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

// ==================== ACTION HANDLERS ====================

// Course and interaction functions
function openCourse(id) {
  logger.info(`Opening course: ${id}`);
  const course = DATA.subjects?.find(s => s.id === id);
  if (course) {
    showAlert(`Opening ${course.name} course...`, "info");
    // In a real implementation: window.location.href = `/portal/course/${id}`;
  } else {
    showAlert("Course not found.", "warning");
  }
}

function startQuiz(id) {
  logger.info(`Starting quiz: ${id}`);
  const quiz = DATA.quizzes?.find(q => q.id === id);
  if (quiz) {
    showAlert(`Starting ${quiz.title}...`, "info");
    // In a real implementation: window.location.href = `/portal/quiz/${id}`;
  } else {
    showAlert("Quiz not found.", "warning");
  }
}

function viewThread(id) {
  logger.info(`Viewing forum thread: ${id}`);
  const thread = DATA.forum?.find(f => f.id === id);
  if (thread) {
    showAlert(`Opening discussion: ${thread.topic}`, "info");
    // In a real implementation: window.location.href = `/portal/forum/${id}`;
  } else {
    showAlert("Discussion thread not found.", "warning");
  }
}

function viewAssignment(id) {
  logger.info(`Viewing assignment: ${id}`);
  const assignment = DATA.assignments?.find(a => a.id === id);
  if (assignment) {
    showAlert(`Opening assignment: ${assignment.title}`, "info");
    // In a real implementation: window.location.href = `/portal/assignment/${id}`;
  } else {
    showAlert("Assignment not found.", "warning");
  }
}

function joinLiveSession(id) {
  logger.info(`Joining live session: ${id}`);
  const session = DATA.liveSessions?.find(s => s.id === id);
  if (session) {
    showAlert(`Joining ${session.title}...`, "info");
    // In a real implementation: window.location.href = session.meetingLink;
  } else {
    showAlert("Live session not found.", "warning");
  }
}

function startStudyPlan(id) {
  logger.info(`Starting study plan: ${id}`);
  const plan = DATA.studyPlan?.find(p => p.id === id);
  if (plan) {
    showAlert(`Starting study plan: ${plan.title}`, "info");
    // In a real implementation: show study plan modal or redirect
  } else {
    showAlert("Study plan not found.", "warning");
  }
}

// Start new discussion
function startNewDiscussion() {
  showAlert('Opening new discussion form...', 'info');
  // In a real implementation: show modal or redirect to new discussion page
}

// ==================== UTILITY FUNCTIONS ====================

// Enhanced file icon getter
function getFileIcon(type) {
  const icons = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word", 
    docx: "fa-file-word",
    video: "fa-file-video",
    mp4: "fa-file-video",
    image: "fa-file-image",
    jpg: "fa-file-image",
    jpeg: "fa-file-image", 
    png: "fa-file-image",
    gallery: "fa-images",
    interactive: "fa-mouse-pointer",
    quiz: "fa-question-circle",
    assignment: "fa-tasks",
    audio: "fa-file-audio",
    zip: "fa-file-archive"
  };
  return icons[type?.toLowerCase()] || "fa-file-alt";
}

// Get notification icon based on type
function getNotificationIcon(type) {
  const icons = {
    assignment: "fa-tasks",
    quiz: "fa-question-circle", 
    live: "fa-video",
    achievement: "fa-trophy",
    forum: "fa-comments",
    system: "fa-cog"
  };
  return icons[type] || "fa-bell";
}

// Enhanced date formatter
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If within last week, show relative time
  if (diffDays <= 7) {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }
  
  // Otherwise show formatted date
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short", 
    year: "numeric"
  });
}

// Show alert messages
function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alert.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;";
  alert.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas ${getAlertIcon(type)} me-2"></i>
      <span>${message}</span>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

// Get icon for alert type
function getAlertIcon(type) {
  const icons = {
    success: "fa-check-circle",
    danger: "fa-exclamation-triangle", 
    warning: "fa-exclamation-circle",
    info: "fa-info-circle"
  };
  return icons[type] || "fa-info-circle";
}