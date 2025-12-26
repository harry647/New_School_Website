// E-Learning Portal - Comprehensive State Management
// Implements all refactoring suggestions for clean, maintainable code

console.log('E-Learning portal initialized');

// Page metadata from HTML data attributes
const pageMetadata = {
    page: document.body.dataset.page || 'dashboard',
    module: document.body.dataset.module || 'e-learning'
};


// What We Offer cards configuration
const offerCardsConfig = [
    { title: 'Subjects', icon: 'fa-book', color: 'primary', link: '/e-learning/subjects.html', 
      description: 'Explore all your subjects in one place. Access notes, videos, and more.' },
    { title: 'Resources', icon: 'fa-folder-open', color: 'success', link: '/e-learning/resources.html',
      description: 'Access study materials, PDFs, videos, and interactive content.' },
    { title: 'Assignments', icon: 'fa-tasks', color: 'warning', link: '/e-learning/assignments.html',
      description: 'Submit assignments and track your progress.' },
    { title: 'Quizzes', icon: 'fa-question-circle', color: 'info', link: '/e-learning/quizzes.html',
      description: 'Test your knowledge with interactive quizzes.' },
    { title: 'Live Sessions', icon: 'fa-video', color: 'danger', link: '/e-learning/live.html',
      description: 'Join live classes and interact with teachers.' },
    { title: 'Forum', icon: 'fa-comments', color: 'secondary', link: '/e-learning/forum.html',
      description: 'Engage in discussions and ask questions.' },
    { title: 'Calendar', icon: 'fa-calendar-alt', color: 'info', link: '/e-learning/calendar.html',
      description: 'View your schedule and upcoming events.' },
    { title: 'Media Gallery', icon: 'fa-photo-video', color: 'warning', link: '/e-learning/media.html',
      description: 'Access lesson videos and images.' },
    { title: 'Notifications', icon: 'fa-bell', color: 'danger', link: '/e-learning/notifications.html',
      description: 'Stay updated with important alerts.' }
];

// User data hooks
const userDataHooks = {
    subjectsCount: 'subjectsCount',
    pendingAssignments: 'pendingAssignments', 
    studyStreak: 'studyStreak'
};

// Main application state
const appState = {
    isLoggedIn: false,
    userName: 'Student',
    userRole: 'student',
    userData: {
        subjectsEnrolled: 8,
        pendingAssignments: 3,
        studyStreakDays: 5
    }
};

// Load header dynamically
function loadHeader() {
    const headerContainer = document.getElementById('headerContainer');
    
    if (headerContainer) {
        fetch('/includes/el-header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load header');
                }
                return response.text();
            })
            .then(html => {
                headerContainer.innerHTML = html;
                
                // The new header has embedded JavaScript that will execute automatically
                // No need to load separate header script
                console.log('Header loaded successfully');
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing E-Learning Portal with refactored architecture');
    
    // Load header first
    loadHeader();
    
    // Load user session
    loadUserSession();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up back to top button
    setupBackToTop();
    
    // Log analytics
    logPageView();
});

// Load user session from localStorage
function loadUserSession() {
    const savedSession = localStorage.getItem('eLearningSession');
    
    if (savedSession) {
        try {
            const sessionData = JSON.parse(savedSession);
            appState.isLoggedIn = sessionData.isLoggedIn || false;
            appState.userName = sessionData.userName || 'Student';
            appState.userRole = sessionData.userRole || 'student';
            appState.userData = sessionData.userData || appState.userData;
        } catch (error) {
            console.error('Error parsing session data:', error);
        }
    }
    
    // Render appropriate UI based on auth state
    renderUI();
}

// Render UI based on current state
function renderUI() {
    if (appState.isLoggedIn) {
        renderLoggedInUI();
    } else {
        renderLoginPrompt();
    }
}

// Render login prompt
function renderLoginPrompt() {
    const loginContainer = document.getElementById('loginContainer');
    
    loginContainer.innerHTML = `
        <div class="container d-flex align-items-center justify-content-center min-vh-100">
            <div class="text-center p-5 bg-white rounded-4 shadow-lg loginCard">
                <i class="fas fa-graduation-cap fa-5x text-primary mb-4"></i>
                <h1 class="display-5 fw-bold mb-3">Welcome to E-Learning Hub</h1>
                <p class="lead mb-4">Please log in to access your courses, assignments, and resources.</p>
                <a href="/user/login.html" class="btn btn-primary btn-lg px-5">
                    <i class="fas fa-sign-in-alt me-2"></i> Login Now
                </a>
            </div>
        </div>
    `;
}

// Render logged-in UI
function renderLoggedInUI() {
    const portalContainer = document.getElementById('portalContainer');
    portalContainer.classList.remove('d-none');
    
    portalContainer.innerHTML = `
        <main id="portalMain">
            ${renderHeroSection()}
            ${renderOfferCards()}
            ${renderLearningSnapshot()}
        </main>
    `;
}


// Render hero section
function renderHeroSection() {
    return `
        <section class="container my-5" aria-labelledby="heroHeading">
            <h2 id="heroHeading" class="visually-hidden">Welcome Section</h2>
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="display-4 fw-bold mb-4">Welcome to the E-Learning Hub</h1>
                    <p class="lead mb-4">Your gateway to seamless learning. Access courses, track progress, and engage with resources anytime, anywhere.</p>
                    <div class="button-group">
                        <a href="/e-learning/subjects.html" class="btn btn-primary btn-lg">
                            <i class="fas fa-book me-2"></i> Browse Subjects
                        </a>
                        <a href="/e-learning/analytics.html" class="btn btn-outline-primary btn-lg">
                            <i class="fas fa-chart-line me-2"></i> View Progress
                        </a>
                    </div>
                </div>
                <div class="col-md-6">
                    <img src="/assets/images/elearning/portal-dashboard.png" 
                         class="img-fluid rounded-3" 
                         alt="E-Learning Dashboard"
                         loading="lazy"
                         decoding="async">
                </div>
            </div>
        </section>
    `;
}

// Render offer cards dynamically
function renderOfferCards() {
    return `
        <section class="container my-5" aria-labelledby="offersHeading">
            <h2 id="offersHeading" class="text-center mb-5">What We Offer</h2>
            <div class="row g-4" id="offerCardsContainer"></div>
        </section>
    `;
}

// Generate offer cards from configuration
function generateOfferCards() {
    const container = document.getElementById('offerCardsContainer');
    
    offerCardsConfig.forEach(card => {
        container.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body text-center">
                        <i class="fas ${card.icon} fa-3x text-${card.color} mb-3"></i>
                        <h5 class="card-title">${card.title}</h5>
                        <p class="card-text">${card.description}</p>
                        <a href="${card.link}" class="btn btn-${card.color}">${getCardButtonText(card.title)}</a>
                    </div>
                </div>
            </div>
        `;
    });
}

// Helper function for card button text
function getCardButtonText(title) {
    const buttonTexts = {
        'Subjects': 'Browse Subjects',
        'Resources': 'View Resources',
        'Assignments': 'View Assignments',
        'Quizzes': 'Take Quizzes',
        'Live Sessions': 'Join Live',
        'Forum': 'Visit Forum',
        'Calendar': 'View Calendar',
        'Media Gallery': 'View Media',
        'Notifications': 'View Notifications'
    };
    
    return buttonTexts[title] || `View ${title}`;
}

// Render learning snapshot with data hooks
function renderLearningSnapshot() {
    return `
        <section class="container my-5" aria-labelledby="snapshotHeading">
            <h2 id="snapshotHeading" class="text-center mb-4">Your Learning Snapshot</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-book fa-2x text-primary mb-3"></i>
                            <h5 class="card-title">Subjects Enrolled</h5>
                            <p class="fs-4 fw-bold" id="${userDataHooks.subjectsCount}">–</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-clipboard-list fa-2x text-warning mb-3"></i>
                            <h5 class="card-title">Pending Assignments</h5>
                            <p class="fs-4 fw-bold text-warning" id="${userDataHooks.pendingAssignments}">–</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-fire fa-2x text-success mb-3"></i>
                            <h5 class="card-title">Study Streak</h5>
                            <p class="fs-4 fw-bold text-success" id="${userDataHooks.studyStreak}">–</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Load user data into data hooks
function loadUserData() {
    // Simulate API call or use cached data
    setTimeout(() => {
        document.getElementById(userDataHooks.subjectsCount).textContent = appState.userData.subjectsEnrolled;
        document.getElementById(userDataHooks.pendingAssignments).textContent = appState.userData.pendingAssignments;
        document.getElementById(userDataHooks.studyStreak).textContent = `${appState.userData.studyStreakDays} Days`;
        
        // Generate offer cards after data is loaded
        generateOfferCards();
    }, 500); // Simulate network delay
}

// Set up event listeners
function setupEventListeners() {
    // Event delegation for any dynamic elements
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-role]')) {
            handleRoleBasedNavigation(e);
        }
    });
}

// Handle role-based navigation
function handleRoleBasedNavigation(event) {
    const navItem = event.target.closest('[data-role]');
    const requiredRole = navItem.dataset.role;
    
    if (appState.userRole !== requiredRole) {
        console.warn(`Access denied: User role ${appState.userRole} cannot access ${requiredRole} feature`);
        // Could show a toast notification here
    }
}

// Set up back to top button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Login function
function login(userName, userRole = 'student', userData = {}) {
    appState.isLoggedIn = true;
    appState.userName = userName;
    appState.userRole = userRole;
    appState.userData = { ...appState.userData, ...userData };
    
    // Save session
    localStorage.setItem('eLearningSession', JSON.stringify(appState));
    
    // Re-render UI
    renderUI();
    
    // Load user data
    loadUserData();
}

// Logout function
function logout() {
    appState.isLoggedIn = false;
    appState.userName = 'Student';
    appState.userRole = 'student';
    
    // Clear session
    localStorage.removeItem('eLearningSession');
    
    // Redirect to login
    window.location.href = '/user/login.html';
}

// Log page view for analytics
function logPageView() {
    console.log(`Page View: ${pageMetadata.module}/${pageMetadata.page}`);
    
    // In a real app, this would send to analytics service
    if (typeof analytics !== 'undefined') {
        analytics.track('pageView', {
            module: pageMetadata.module,
            page: pageMetadata.page,
            timestamp: new Date().toISOString()
        });
    }
}

// Navigation helper function
function navigateTo(page) {
    window.location.href = `/e-learning/${page}.html`;
}

// Export functions for testing or other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        logout,
        navigateTo,
        loadUserSession,
        renderUI,
        appState,
        pageMetadata
    };
}