// JavaScript for index.html - E-Learning Portal Management
console.log('Index page loaded');

// Initialize the e-learning portal
document.addEventListener('DOMContentLoaded', function() {
    console.log('E-Learning portal initialized');
    
    // Set up navigation highlighting
    setupNavigation();
    
    // Set up back to top button
    setupBackToTop();
    
    // Initialize user session
    initUserSession();
});

// Navigation highlighting based on current page
function setupNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#portalNavbar .nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath.replace('/e-learning/', ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Back to top button functionality
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
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
}

// User session management
function initUserSession() {
    // Check if user is logged in (simplified for demo)
    const isLoggedIn = localStorage.getItem('eLearningLoggedIn') === 'true';
    
    if (isLoggedIn) {
        // Show logged in content
        document.getElementById('loginCheck').classList.add('d-none');
        document.getElementById('loggedInContent').classList.remove('d-none');
        
        // Load user data
        loadUserData();
        
        // Check if user is a teacher to show teacher dashboard link
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'teacher') {
            document.getElementById('teacherUploadNav').classList.remove('d-none');
        }
    } else {
        // Show login prompt
        document.getElementById('loginCheck').classList.remove('d-none');
        document.getElementById('loggedInContent').classList.add('d-none');
    }
}

// Load user data and update UI
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'Student';
    document.getElementById('navUserName').textContent = userName;
}

// Login simulation function
function login(userName, userRole = 'student') {
    localStorage.setItem('eLearningLoggedIn', 'true');
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    window.location.reload();
}

// Logout function
function logout() {
    localStorage.removeItem('eLearningLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = '/user/login.html';
}

// Navigation helper functions
function navigateTo(page) {
    window.location.href = `/e-learning/${page}.html`;
}

// Export functions for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        logout,
        navigateTo,
        initUserSession
    };
}