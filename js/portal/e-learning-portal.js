// =======================================================
// e-learning-portal.js – Updated for New HTML Structure (2025)
// Fully aligned with the provided HTML: #loginCheck + #loggedInContent
// Teachers: Upload videos, PDFs, images, quizzes
// Students: View, download, submit assignments
// =======================================================

// Configuration Management
const CONFIG = {
    API_BASE: '/api',
    LOG_LEVEL: 'info', // debug, info, warn, error
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
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

// ==================== AUTH & ROLE ====================
function isLoggedIn() {
    // Check localStorage for authentication state
    return localStorage.getItem("userLoggedIn") === "true";
}

function getUserName() {
    return localStorage.getItem("userName") || "Student";
}

function setRole(role) {
    currentRole = role;
    localStorage.setItem("portalRole", role);
    // Role-specific UI can be added later (e.g., teacher panel)
}

// Logout function to clear authentication state
function logout() {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("portalRole");
    window.location.href = "/user/login.html";
}

// Smooth scroll
function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== DOM LOADED ====================
document.addEventListener("DOMContentLoaded", () => {
    w3.includeHTML(() => {
        const loginCheck = document.getElementById("loginCheck");
        const loggedInContent = document.getElementById("loggedInContent");

        if (!isLoggedIn()) {
            // User not logged in - show login prompt, hide portal content
            if (loginCheck) loginCheck.classList.remove("d-none");
            if (loggedInContent) loggedInContent.classList.add("d-none");
            return;
        }

        // User is logged in → hide login prompt, show portal
        if (loginCheck) loginCheck.classList.add("d-none");
        if (loggedInContent) loggedInContent.classList.remove("d-none");

        // Set welcome messages
        const heroUserName = document.getElementById("heroUserName");
        const navUserName = document.getElementById("navUserName");
        const userName = getUserName();
        if (heroUserName) heroUserName.textContent = userName;
        if (navUserName) navUserName.textContent = userName;

        // Restore saved role
        const savedRole = localStorage.getItem("portalRole") || "student";
        setRole(savedRole);

        // Update teacher features based on role
        updateTeacherFeatures();

        // Show loading spinner
        const spinner = document.getElementById("loadingSpinner");
        if (spinner) spinner.classList.remove("d-none");

        // Load all portal data
        loadPortalData().finally(() => {
            if (spinner) spinner.classList.add("d-none");
        });

        setupBackToTop();
        setupSideNavigation();
        setupResourceTypeListener();
    });
});

// Show/hide upload controls based on type
const setupResourceTypeListener = () => {
    const resourceTypeElement = document.getElementById('resourceType');
    if (!resourceTypeElement) return;

    resourceTypeElement.addEventListener('change', function() {
        const type = this.value;
        const fileGroup = document.getElementById('fileUploadGroup');
        const linkGroup = document.getElementById('linkUploadGroup');

        if (type === 'interactive') {
            fileGroup.classList.add('d-none');
            linkGroup.classList.remove('d-none');
            document.getElementById('resourceFiles').required = false;
            document.getElementById('resourceLink').required = true;
        } else {
            fileGroup.classList.remove('d-none');
            linkGroup.classList.add('d-none');
            document.getElementById('resourceFiles').required = true;
            document.getElementById('resourceLink').required = false;
        }
    });
};

// Teacher Upload Form Submission
document.getElementById('teacherUploadForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';

    const statusDiv = document.getElementById('uploadStatus');
    const listDiv = document.getElementById('uploadedFilesList');
    statusDiv.innerHTML = '';
    listDiv.innerHTML = '';

    const formData = new FormData();
    formData.append('type', document.getElementById('resourceType').value);
    formData.append('subject', document.getElementById('resourceSubject').value);
    formData.append('title', document.getElementById('resourceTitle').value);
    formData.append('description', document.getElementById('resourceDescription').value);
    formData.append('tags', document.getElementById('resourceTags').value);

    const files = document.getElementById('resourceFiles').files;
    const link = document.getElementById('resourceLink').value.trim();

    if (files.length > 0) {
        for (let file of files) {
            formData.append('files', file);
        }
    } else if (link) {
        formData.append('url', link);
    }

    try {
        const res = await fetch(`${CONFIG.API_BASE}/teacher/upload`, {
            method: 'POST',
            body: formData
        });

        const result = await res.json();

        if (res.ok && result.success) {
            statusDiv.innerHTML = `<div class="alert alert-success">✅ ${result.message || 'Resource uploaded successfully!'}</div>`;
            
            // Optional: list uploaded files
            if (result.uploaded) {
                listDiv.innerHTML = '<strong>Uploaded:</strong><ul class="list-unstyled mt-2">' +
                    result.uploaded.map(f => `<li><i class="fas fa-check text-success me-2"></i>${f}</li>`).join('') +
                    '</ul>';
            }

            this.reset();
            document.getElementById('fileUploadGroup').classList.remove('d-none');
            document.getElementById('linkUploadGroup').classList.add('d-none');

            // Refresh relevant sections
            loadPortalData(true); // Force refresh
            showAlert('Resource uploaded and available to students!', 'success');
        } else {
            throw new Error(result.message || 'Upload failed');
        }
    } catch (err) {
        logger.error('Upload error:', err);
        statusDiv.innerHTML = `<div class="alert alert-danger">❌ Upload failed: ${err.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Optional: Only show upload button to teachers
function updateTeacherFeatures() {
    const uploadBtn = document.getElementById('teacherUploadBtn');
    if (currentRole === 'teacher') {
        uploadBtn?.classList.remove('d-none');
    } else {
        uploadBtn?.classList.add('d-none');
    }
}

// Call this after login/role detection
// e.g., in DOMContentLoaded after setting role
updateTeacherFeatures();

// ==================== BACK TO TOP FUNCTIONALITY ====================
function setupBackToTop() {
    const backToTopBtn = document.getElementById("backToTop");
    if (!backToTopBtn) return;

    window.addEventListener("scroll", () => {
        backToTopBtn.style.display = window.pageYOffset > 300 ? "block" : "none";
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ==================== SIDE NAVIGATION FUNCTIONALITY ====================
function setupSideNavigation() {
    const navButtons = document.querySelectorAll('.sidebar-nav .btn');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            loadSection(section);
        });
    });
}


// Load section content dynamically
async function loadSection(sectionKey) {
    const mainContentArea = document.getElementById('mainContentArea');
    if (!mainContentArea) return;

    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.classList.remove("d-none");

    // Mapping of button onclick values to actual content rendering
    const sectionMap = {
        'dashboard': renderDashboard,
        'subjects': renderSubjects,
        'live-sessions': renderLiveSessions,
        'calendar': renderCalendar,
        'resources': renderResources,
        'quizzes': renderQuizzes,
        'forum': renderForum,
        'analytics': renderAnalytics,
        'media': renderMedia,
        'study-plans': renderStudyPlans
    };

    const renderFn = sectionMap[sectionKey];

    if (renderFn) {
        mainContentArea.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        await renderFn();
    } else {
        mainContentArea.innerHTML = `
            <div class="alert alert-warning">
                <h4>Section Not Implemented Yet</h4>
                <p>The "${sectionKey}" section is under development.</p>
            </div>`;
    }

    if (spinner) spinner.classList.add("d-none");
}

// ==================== LOAD DATA FROM BACKEND ====================
async function loadPortalData(forceRefresh = false) {
    const cacheKey = 'portalData';
    const now = Date.now();

    if (!forceRefresh && cache[cacheKey] && (now - cache[cacheKey].timestamp) < CONFIG.CACHE_DURATION) {
        logger.debug('Using cached portal data');
        DATA = cache[cacheKey].data;
        updateHeroStats();
        return;
    }

    let attempts = 0;
    while (attempts < CONFIG.MAX_RETRY_ATTEMPTS) {
        try {
            logger.info(`Fetching portal data (attempt ${attempts + 1})`);
            const res = await fetch(`${CONFIG.API_BASE}/elearning/data`, {
                cache: forceRefresh ? "no-store" : "default"
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            DATA = await res.json();

            cache[cacheKey] = { data: DATA, timestamp: now };
            logger.info('Portal data loaded successfully');

            updateHeroStats();
            return;
        } catch (err) {
            attempts++;
            logger.warn(`Data load attempt ${attempts} failed:`, err.message);

            if (attempts >= CONFIG.MAX_RETRY_ATTEMPTS) {
                logger.error('All data load attempts failed');
                showAlert("Unable to load portal data. Using offline fallback if available.", "danger");
                if (cache[cacheKey]) {
                    DATA = cache[cacheKey].data;
                    updateHeroStats();
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempts));
        }
    }
}

// Update hero section dynamic stats
function updateHeroStats() {
    const pendingTasksEl = document.getElementById("pendingTasks");
    const currentStreakEl = document.getElementById("currentStreak");

    if (pendingTasksEl && DATA.stats) pendingTasksEl.textContent = DATA.stats.pendingTasks || 0;
    if (currentStreakEl && DATA.stats) currentStreakEl.textContent = `${DATA.stats.streak || 0}-day`;
}

// ==================== SECTION RENDERERS ====================
async function renderDashboard() {
    document.getElementById('mainContentArea').innerHTML = `
        <h3 class="mb-4">Dashboard Overview</h3>
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card glass-card p-4 text-center">
                    <h2 class="text-primary">${DATA.stats?.pendingTasks || 0}</h2>
                    <p>Pending Tasks</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card glass-card p-4 text-center">
                    <h2 class="text-success">${DATA.stats?.streak || 0} days</h2>
                    <p>Current Streak</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card glass-card p-4 text-center">
                    <h2 class="text-info">${DATA.subjects?.length || 0}</h2>
                    <p>Enrolled Subjects</p>
                </div>
            </div>
        </div>
        <h5 class="mt-5">Recent Activity</h5>
        <div id="notificationList"></div>
    `;
    loadNotifications(); // Reuse notification renderer
}

async function renderSubjects() {
    const grid = `<div class="row" id="subjectsGrid"></div>`;
    document.getElementById('mainContentArea').innerHTML = `<h3 class="mb-4">My Subjects</h3>${grid}`;
    loadSubjects();
}

async function renderResources() {
    const grid = `<div class="row" id="resourcesGrid"></div>`;
    document.getElementById('mainContentArea').innerHTML = `<h3 class="mb-4">Learning Resources</h3>${grid}`;
    loadResources();
}

async function renderQuizzes() {
    const grid = `<div class="row" id="quizGrid"></div>`;
    document.getElementById('mainContentArea').innerHTML = `<h3 class="mb-4">Quizzes & Assessments</h3>${grid}`;
    loadQuizzes();
}

async function renderForum() {
    const grid = `<div class="row" id="forumGrid"></div>
                   <div class="text-end mt-3">
                       <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newDiscussionModal">
                           <i class="fas fa-plus-circle me-2"></i>New Discussion
                       </button>
                   </div>`;
    document.getElementById('mainContentArea').innerHTML = `<h3 class="mb-4">Student Forum</h3>${grid}`;
    loadForum();
}

async function renderMedia() {
    const grid = `<div class="row" id="mediaGrid"></div>`;
    document.getElementById('mainContentArea').innerHTML = `<h3 class="mb-4">Media Gallery</h3>${grid}`;
    loadMedia();
}

async function renderAnalytics() {
    document.getElementById('mainContentArea').innerHTML = `
        <h3 class="mb-4">Learning Analytics</h3>
        <div class="alert alert-info">
            Detailed progress charts and analytics coming soon.
        </div>
    `;
}

async function renderLiveSessions() {
    document.getElementById('mainContentArea').innerHTML = `
        <h3 class="mb-4">Live Sessions</h3>
        <div class="alert alert-info">
            Live class schedule and links will appear here.
        </div>
    `;
}

async function renderCalendar() {
    document.getElementById('mainContentArea').innerHTML = `
        <h3 class="mb-4">Academic Calendar</h3>
        <div class="alert alert-info">
            Exam dates, holidays, and events calendar coming soon.
        </div>
    `;
}

async function renderStudyPlans() {
    document.getElementById('mainContentArea').innerHTML = `
        <h3 class="mb-4">Study Plans</h3>
        <div class="alert alert-info">
            Personalized study schedules and revision plans.
        </div>
    `;
}

// ==================== REUSABLE RENDER FUNCTIONS ====================
function loadSubjects() {
    const grid = document.getElementById("subjectsGrid");
    if (!grid || !DATA.subjects || DATA.subjects.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-book-open fa-4x mb-4 opacity-50"></i>
                <h5>No subjects enrolled yet</h5>
                <p>Contact your teacher or admin to get started.</p>
            </div>
        `;
        return;
    }

    // Sort by name or custom order
    const sorted = [...DATA.subjects].sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));

    grid.innerHTML = sorted.map(subject => {
        const progress = subject.progress || 0;
        const lessons = subject.lessons || 0;
        const quizzes = subject.quizzes || 0;
        const icon = subject.icon || 'fa-book';

        return `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card p-5 text-center h-100 subject-card hover-shadow position-relative overflow-hidden">
                    <!-- Background Accent -->
                    <div class="subject-accent" style="background: linear-gradient(135deg, ${subject.color || '#007bff'}20, transparent);"></div>

                    <i class="fas ${icon} fa-4x mb-4 text-primary opacity-75"></i>
                    <h4 class="fw-bold mb-3">${subject.name}</h4>
                    
                    <p class="text-muted mb-4">
                        ${lessons} Lessons • ${quizzes} Quizzes<br>
                        ${subject.teacher ? `<small>Teacher: ${subject.teacher}</small>` : ''}
                    </p>

                    <!-- Progress Bar -->
                    <div class="mb-4">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Progress</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress" style="height: 12px;">
                            <div class="progress-bar bg-success" style="width: ${progress}%">
                                ${progress > 20 ? progress + '%' : ''}
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-primary btn-lg w-100 shadow-sm" onclick="enterSubject('${subject.id}')">
                        <i class="fas fa-arrow-right me-2"></i>Enter Course
                    </button>

                    <!-- Optional Badge (e.g., new content) -->
                    ${subject.hasNew ? `<span class="badge bg-danger position-absolute top-0 end-0 m-3">New</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function enterSubject(subjectId) {
    const subject = DATA.subjects?.find(s => s.id === subjectId);
    if (!subject) {
        showAlert('Subject not found.', 'warning');
        return;
    }

    showAlert(`
        <strong class="fs-5">${subject.name}</strong><br>
        <small>${subject.teacher ? 'Teacher: ' + subject.teacher : ''}</small><hr>
        Entering course dashboard...<br>
        Lessons: ${subject.lessons || 0} • Quizzes: ${subject.quizzes || 0} • Progress: ${subject.progress || 0}%
    `, 'success');

    // Future enhancement:
    // loadSection('course-detail', subjectId);
    // or window.location.href = `/portal/course/${subjectId}`;
}

function loadQuizzes() {
    const grid = document.getElementById("quizGrid");
    if (!grid || !DATA.quizzes) return;

    grid.innerHTML = DATA.quizzes.map(q => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="quiz-card p-5 text-center h-100 glass-card shadow-sm">
                <i class="fas fa-clipboard-list fa-4x mb-4 text-success"></i>
                <h3 class="h5 fw-bold">${q.title}</h3>
                <p class="text-muted">${q.questions || 0} Questions • ${q.duration || 30} mins</p>
                <button class="btn btn-outline-success mt-3" onclick="startQuiz('${q.id}')">
                    Start Quiz
                </button>
            </div>
        </div>
    `).join("");
}

function loadDiscussionThreads() {
    const grid = document.getElementById("discussionGrid");
    if (!grid || !DATA.threads) return;

    grid.innerHTML = DATA.threads.map(t => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="thread-card p-4 h-100 glass-card shadow-sm">
                <div class="d-flex align-items-center mb-3">
                    <img src="${t.author.avatar}" alt="${t.author.name}" class="rounded-circle me-3" width="40">
                    <div>
                        <h6 class="mb-0">${t.author.name}</h6>
                        <small class="text-muted">${formatDate(t.date)}</small>
                    </div>
                </div>
                <h5 class="mb-2">${t.title}</h5>
                <p class="text-muted mb-3">${t.content.substring(0, 100)}...</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${t.subject}</span>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewThread('

                    
                </div>
            </div>
        </div>
    `).join("");
}

function loadAnnouncements() {
    const grid = document.getElementById("announcementGrid");
    if (!grid || !DATA.announcements) return;

    grid.innerHTML = DATA.announcements.map(a => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="announcement-card p-4 h-100 glass-card shadow-sm">
                <div class="d-flex align-items-center mb-3">
                    <i class="fas fa-bullhorn fa-2x text-warning me-3"></i>
                    <div>
                        <h6 class="mb-0">${a.title}</h6>
                        <small class="text-muted">${formatDate(a.date)}</small>
                    </div>
                </div>
                <p class="mb-3">${a.content}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-warning text-dark">${a.category}</span>
                    <button class="btn btn-sm btn-outline-warning" onclick="viewAnnouncement('${a.id}')">
                        Read More
                    </button>
                </div>
            </div>
        </div>
        
    `).join("");
}

// ==================== UTILITIES ====================
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getFileIcon(type) {
    const icons = {
        pdf: "fa-file-pdf",
        doc: "fa-file-word",
        video: "fa-file-video",
        image: "fa-file-image",
        ppt: "fa-file-powerpoint"
    };
    return icons[type] || "fa-file-alt";
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
    setTimeout(() => alert.remove(), 6000);
}

// Course / Quiz / Thread handlers
function openCourse(id) {
    const course = DATA.subjects?.find(s => s.id === id);
    if (course) {
        showAlert(`Entering ${course.name} course...`, "info");
        // Future: window.location.href = `/course/${id}`;
    } else {
        showAlert("Course not found.", "warning");
    }
}

function startQuiz(id) {
    const quiz = DATA.quizzes?.find(q => q.id === id);
    if (quiz) {
        const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
        document.getElementById('quizModalLabel').textContent = quiz.title;
        document.getElementById('quizContent').innerHTML = `<p>Loading quiz "${quiz.title}"...</p>`;
        quizModal.show();
    } else {
        showAlert("Quiz not found.", "warning");
    }
}



// ==================== MODAL HANDLERS ====================

/**
 * Submit a new forum discussion
 */
async function submitNewDiscussion() {
    const title = document.getElementById('discussionTitle').value.trim();
    const category = document.getElementById('discussionCategory').value;
    const content = document.getElementById('discussionContent').value.trim();
    const tags = document.getElementById('discussionTags').value.trim();

    if (!title || !category || !content) {
        showAlert('Please fill in all required fields (Title, Category, Content).', 'warning');
        return;
    }

    const submitBtn = document.querySelector('#newDiscussionModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Posting...';

    const discussionData = {
        title,
        category,
        content,
        tags: tags ? tags.split(',').map(t => t.trim()) : []
    };

    try {
        const res = await fetch(`${CONFIG.API_BASE}/elearning/forum/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discussionData)
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showAlert('Discussion posted successfully!', 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('newDiscussionModal'));
            modal.hide();
            // Reset form
            document.getElementById('newDiscussionForm').reset();
            // Refresh forum section if currently visible
            if (document.getElementById('forumGrid')) {
                loadForum();
            }
        } else {
            throw new Error(result.message || 'Failed to post discussion');
        }
    } catch (err) {
        logger.error('Error posting discussion:', err);
        showAlert('Failed to post discussion. Please try again.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Submit quiz answers
 */
async function submitQuiz() {
    // Collect answers – assuming questions have name="question-{id}" and value=selected option
    const formData = new FormData();
    const quizId = document.getElementById('quizModalLabel').dataset.quizId || 'unknown'; // You may store quizId when opening

    const answers = {};
    document.querySelectorAll('#quizContent input[name^="question-"], #quizContent select[name^="question-"]').forEach(input => {
        const qid = input.name.replace('question-', '');
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!answers[qid]) answers[qid] = [];
                answers[qid].push(input.value);
            }
        } else {
            answers[qid] = input.value;
        }
    });

    formData.append('quizId', quizId);
    formData.append('answers', JSON.stringify(answers));

    const submitBtn = document.getElementById('submitQuizBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';

    try {
        const res = await fetch(`${CONFIG.API_BASE}/elearning/quiz/submit`, {
            method: 'POST',
            body: formData
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showAlert(`Quiz submitted! Score: ${result.score}/${result.total} (${result.percentage}%)`, 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('quizModal'));
            modal.hide();
            // Refresh quizzes if visible
            if (document.getElementById('quizGrid')) {
                loadQuizzes();
            }
            // Update hero stats
            loadPortalData(true);
        } else {
            throw new Error(result.message || 'Failed to submit quiz');
        }
    } catch (err) {
        logger.error('Error submitting quiz:', err);
        showAlert('Failed to submit quiz. Please try again.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Submit assignment files
 */
async function submitAssignment() {
    const form = document.getElementById('assignmentSubmissionForm');
    const assignmentId = document.getElementById('assignmentId').value;
    const filesInput = document.getElementById('assignmentFiles');
    const notes = document.getElementById('assignmentNotes').value.trim();

    if (!assignmentId || filesInput.files.length === 0) {
        showAlert('Please select at least one file to submit.', 'warning');
        return;
    }

    const submitBtn = document.querySelector('#assignmentModal .btn-warning');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading...';

    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('notes', notes);

    // Append all selected files
    for (let i = 0; i < filesInput.files.length; i++) {
        formData.append('files', filesInput.files[i]);
    }

    try {
        const res = await fetch(`${CONFIG.API_BASE}/elearning/assignment/submit`, {
            method: 'POST',
            body: formData
        });

        const result = await res.json();

        if (res.ok && result.success) {
            showAlert('Assignment submitted successfully!', 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('assignmentModal'));
            modal.hide();
            // Reset form
            form.reset();
            // Refresh relevant sections (e.g., dashboard, subjects)
            loadPortalData(true);
        } else {
            throw new Error(result.message || 'Failed to submit assignment');
        }
    } catch (err) {
        logger.error('Error submitting assignment:', err);
        showAlert('Upload failed. Check file sizes and try again.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Optional: Enhance startQuiz() to load actual quiz questions
function startQuiz(id) {
    const quiz = DATA.quizzes?.find(q => q.id === id);
    if (!quiz) {
        showAlert("Quiz not found.", "warning");
        return;
    }

    // Store quiz ID for submission
    document.getElementById('quizModalLabel').dataset.quizId = id;
    document.getElementById('quizModalLabel').textContent = `${quiz.title}`;

    // Placeholder – in real app, fetch full quiz questions
    document.getElementById('quizContent').innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary mb-4" role="status"><span class="visually-hidden">Loading quiz...</span></div>
            <p>Loading questions for <strong>${quiz.title}</strong>...</p>
        </div>
    `;

    const quizModal = new bootstrap.Modal(document.getElementById('quizModal'));
    quizModal.show();

    // Simulate loading quiz (replace with actual fetch in production)
    setTimeout(() => {
        document.getElementById('quizContent').innerHTML = `
            <div class="alert alert-info">
                <h5>Quiz Ready!</h5>
                <p>This is where the actual quiz questions would be loaded dynamically from the backend.</p>
                <p><strong>Subject:</strong> ${quiz.subject} • <strong>Questions:</strong> ${quiz.questions || 20}</p>
            </div>
            <div class="text-end">
                <small class="text-muted">Demo mode – submission handler is active.</small>
            </div>
        `;
    }, 1500);
}

async function renderAnalytics() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Learning Analytics</h2>
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="glass-card p-4">
                    <h4 class="mb-3">Subject Performance</h4>
                    <div id="subjectProgressChart" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="glass-card p-4">
                    <h4 class="mb-3">Study Time This Week</h4>
                    <div id="studyTimeChart" style="height: 300px;"></div>
                </div>
            </div>
            <div class="col-12 mt-4">
                <div class="glass-card p-4">
                    <h4 class="mb-3">Overall Progress</h4>
                    <div class="d-flex justify-content-around flex-wrap text-center">
                        <div class="p-3">
                            <h3 class="text-primary">${DATA.stats?.completionRate || 68}%</h3>
                            <p>Course Completion</p>
                        </div>
                        <div class="p-3">
                            <h3 class="text-success">${DATA.stats?.totalHours || 142}</h3>
                            <p>Hours Studied</p>
                        </div>
                        <div class="p-3">
                            <h3 class="text-info">${DATA.stats?.quizzesPassed || 18}/${DATA.stats?.quizzesTaken || 20}</h3>
                            <p>Quizzes Passed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load charts only after DOM is updated
    initAnalyticsCharts();
}

function initAnalyticsCharts() {
    // Example using Chart.js – add this CDN once in main portal head:
    // <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    // Wait for Chart.js to be fully loaded
    if (typeof window.Chart === 'undefined') {
        logger.warn('Chart.js not loaded, cannot initialize charts');
        return;
    }

    const subjectCtx = document.getElementById('subjectProgressChart');
    const timeCtx = document.getElementById('studyTimeChart');

    if (subjectCtx) {
        try {
            new Chart(subjectCtx, {
                type: 'radar',
                data: {
                    labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili'],
                    datasets: [{
                        label: 'Your Score (%)',
                        data: [85, 78, 92, 70, 88, 81],
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderColor: '#007bff',
                        pointBackgroundColor: '#007bff'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        } catch (err) {
            logger.error('Failed to create subject progress chart:', err.message);
        }
    } else {
        logger.warn('Subject progress chart container not found');
    }

    if (timeCtx) {
        try {
            new Chart(timeCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Hours Studied',
                        data: [2.5, 3, 1.5, 4, 3.5, 2, 1],
                        backgroundColor: '#28a745'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        } catch (err) {
            logger.error('Failed to create study time chart:', err.message);
        }
    } else {
        logger.warn('Study time chart container not found');
    }
}

async function renderCalendar() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Your Schedule & Calendar</h2>
        <div class="row g-4">
            <!-- Main Calendar Grid -->
            <div class="col-lg-8">
                <div class="glass-card p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 id="calendarMonthYear" class="mb-0 fw-bold"></h4>
                        <div>
                            <button id="prevMonth" class="btn btn-outline-primary btn-sm me-2">&lt; Prev</button>
                            <button id="nextMonth" class="btn btn-outline-primary btn-sm">Next &gt;</button>
                        </div>
                    </div>
                    <div id="calendarGrid" class="calendar-grid"></div>
                </div>
            </div>

            <!-- Upcoming Events Sidebar -->
            <div class="col-lg-4">
                <div class="glass-card p-4">
                    <h4 class="mb-4">
                        <i class="fas fa-calendar-alt me-2 text-primary"></i>Upcoming Events
                    </h4>
                    <div id="upcomingEvents">
                        <div class="text-center text-muted py-5">
                            <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading events...</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Add Event (Optional - for future teacher/student use) -->
                <div class="glass-card p-4 mt-4">
                    <h5 class="mb-3">Quick Reminder</h5>
                    <form id="quickEventForm">
                        <div class="mb-3">
                            <input type="text" class="form-control" placeholder="Event title" id="quickEventTitle" required>
                        </div>
                        <div class="mb-3">
                            <input type="date" class="form-control" id="quickEventDate" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="fas fa-plus me-2"></i>Add Reminder
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Initialize calendar after DOM update
    initCalendar();
    loadUpcomingEvents();
}

let currentCalendarDate = new Date();

function initCalendar() {
    renderCalendarMonth(currentCalendarDate);
    
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendarMonth(currentCalendarDate);
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendarMonth(currentCalendarDate);
    });
}

function renderCalendarMonth(date) {
    const grid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('calendarMonthYear');
    if (!grid || !monthYear) return;

    const year = date.getFullYear();
    const month = date.getMonth();

    monthYear.textContent = date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    let html = `
        <div class="calendar-weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="calendar-days">
    `;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasEvent = DATA.events?.some(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}">
                <div class="day-number">${day}</div>
                ${hasEvent ? '<div class="event-dot"></div>' : ''}
            </div>
        `;
    }

    html += `</div>`;
    grid.innerHTML = html;
}

function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;

    const events = DATA.events || [];

    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-calendar-times fa-3x mb-3 opacity-50"></i>
                <p>No upcoming events</p>
            </div>
        `;
        return;
    }

    // Sort by date
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = sorted.map(event => {
        const eventDate = new Date(event.date);
        const isPast = eventDate < new Date();
        return `
            <div class="event-item mb-3 pb-3 border-bottom ${isPast ? 'text-muted' : ''}">
                <div class="d-flex justify-content-between">
                    <h6 class="fw-bold mb-1">${event.title}</h6>
                    <span class="badge bg-${isPast ? 'secondary' : event.type === 'exam' ? 'danger' : 'primary'}">
                        ${event.type || 'Event'}
                    </span>
                </div>
                <p class="small mb-1">
                    <i class="fas fa-calendar me-1"></i>${eventDate.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                ${event.time ? `<p class="small mb-0"><i class="fas fa-clock me-1"></i>${event.time}</p>` : ''}
                ${event.description ? `<p class="small text-muted mt-2">${event.description}</p>` : ''}
            </div>
        `;
    }).join('');
}

async function renderDashboard() {
    // Ensure hero stats are up-to-date (in case dashboard is first view)
    updateHeroStats();

    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Your Learning Dashboard</h2>

        <!-- Key Stats Cards -->
        <div class="row g-4 mb-5">
            <div class="col-md-3 col-sm-6">
                <div class="stat-card glass-card text-center p-4 shadow-sm">
                    <i class="fas fa-book-open fa-3x text-primary mb-3"></i>
                    <h3 class="fw-bold" id="dashLessons">0</h3>
                    <p class="text-muted mb-0">Lessons Completed</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card glass-card text-center p-4 shadow-sm">
                    <i class="fas fa-percentage fa-3x text-success mb-3"></i>
                    <h3 class="fw-bold" id="dashProgress">0%</h3>
                    <p class="text-muted mb-0">Overall Progress</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card glass-card text-center p-4 shadow-sm">
                    <i class="fas fa-fire fa-3x text-warning mb-3"></i>
                    <h3 class="fw-bold" id="dashStreak">0</h3>
                    <p class="text-muted mb-0">Day Streak</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="stat-card glass-card text-center p-4 shadow-sm">
                    <i class="fas fa-trophy fa-3x text-info mb-3"></i>
                    <h3 class="fw-bold" id="dashPoints">0</h3>
                    <p class="text-muted mb-0">Total Points</p>
                </div>
            </div>
        </div>

        <!-- Recent Achievements / Notifications -->
        <div class="row">
            <div class="col-12">
                <div class="glass-card p-4">
                    <h4 class="mb-4">
                        <i class="fas fa-medal text-warning me-2"></i>Recent Achievements & Activity
                    </h4>
                    <div id="achievementsGrid">
                        <div class="text-center text-muted py-5">
                            <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading your recent activity...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Populate dashboard stats & achievements
    populateDashboardStats();
    loadRecentAchievements();
}

function populateDashboardStats() {
    const stats = DATA.stats || {};

    // Update individual dashboard cards
    document.getElementById('dashLessons').textContent = stats.lessonsCompleted || 0;
    document.getElementById('dashProgress').textContent = `${stats.overallProgress || 0}%`;
    document.getElementById('dashStreak').textContent = stats.streak || 0;
    document.getElementById('dashPoints').textContent = stats.points || 0;
}

function loadRecentAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    const achievements = DATA.achievements || DATA.notifications || []; // fallback to notifications if no dedicated achievements

    if (achievements.length === 0) {
        grid.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-star fa-3x mb-3 opacity-50"></i>
                <p>No recent achievements yet. Keep learning!</p>
            </div>
        `;
        return;
    }

    // Sort newest first
    const sorted = [...achievements].sort((a, b) => new Date(b.date) - new Date(a.date));

    grid.innerHTML = `
        <div class="row g-3">
            ${sorted.map(item => `
                <div class="col-lg-4 col-md-6">
                    <div class="achievement-item glass-card p-3 d-flex align-items-center">
                        <div class="me-3">
                            <i class="fas ${item.icon || 'fa-certificate'} fa-2x ${item.type === 'badge' ? 'text-warning' : 'text-primary'}"></i>
                        </div>
                        <div>
                            <h6 class="fw-bold mb-1">${item.title || item.message}</h6>
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>${formatDate(item.date)}
                            </small>
                            ${item.description ? `<p class="small text-muted mb-0 mt-1">${item.description}</p>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function renderForum() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Discussion & Q&A Forum</h2>

        <div class="row g-4">
            <!-- Main Forum Threads -->
            <div class="col-lg-8">
                <div class="glass-card p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="mb-0">Recent Discussions</h4>
                        <button class="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#newDiscussionModal">
                            <i class="fas fa-plus-circle me-2"></i>New Discussion
                        </button>
                    </div>

                    <div id="forumGrid">
                        <div class="text-center py-5">
                            <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                            <p>Loading discussions...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar: Categories & Stats -->
            <div class="col-lg-4">
                <div class="glass-card p-4 mb-4">
                    <h5 class="mb-3">
                        <i class="fas fa-tags text-primary me-2"></i>Forum Categories
                    </h5>
                    <div id="forumCategories"></div>
                </div>

                <div class="glass-card p-4">
                    <h5 class="mb-3">
                        <i class="fas fa-chart-bar text-info me-2"></i>Forum Stats
                    </h5>
                    <ul class="list-unstyled mb-0">
                        <li class="d-flex justify-content-between mb-2">
                            <span>Total Threads</span>
                            <strong id="totalThreads">0</strong>
                        </li>
                        <li class="d-flex justify-content-between mb-2">
                            <span>Total Replies</span>
                            <strong id="totalReplies">0</strong>
                        </li>
                        <li class="d-flex justify-content-between">
                            <span>Active Users</span>
                            <strong id="activeUsers">0</strong>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Load forum data
    loadForumThreads();
    loadForumCategories();
    updateForumStats();
}

function loadForumThreads() {
    const grid = document.getElementById('forumGrid');
    if (!grid) return;

    const threads = DATA.forum || [];

    if (threads.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-comments fa-4x mb-4 opacity-50"></i>
                <h5>No discussions yet</h5>
                <p>Be the first to start a conversation!</p>
            </div>
        `;
        return;
    }

    // Sort by latest activity or pinned first
    const sorted = [...threads].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.lastReply || b.date) - new Date(a.lastReply || a.date);
    });

    grid.innerHTML = sorted.map(thread => `
        <div class="forum-thread-card glass-card p-4 mb-3 hover-shadow">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="flex-grow-1">
                    ${thread.pinned ? '<span class="badge bg-warning text-dark me-2"><i class="fas fa-thumbtack"></i> Pinned</span>' : ''}
                    <a href="#" class="thread-title h5 fw-bold text-decoration-none" onclick="viewThread('${thread.id}'); return false;">
                        ${thread.title}
                    </a>
                </div>
                <span class="badge bg-primary fs-6">${thread.category || 'General'}</span>
            </div>
            <div class="text-muted small mb-2">
                Started by <strong>${thread.author}</strong> • 
                ${formatDate(thread.date)} • 
                ${thread.replies || 0} ${thread.replies === 1 ? 'reply' : 'replies'}
                ${thread.views ? `• ${thread.views} views` : ''}
            </div>
            <div class="thread-preview text-muted small">
                ${thread.preview || thread.content.substring(0, 150) + (thread.content.length > 150 ? '...' : '')}
            </div>
            ${thread.tags ? `
                <div class="mt-3">
                    ${thread.tags.map(tag => `<span class="badge bg-light text-dark me-1">#${tag}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function loadForumCategories() {
    const container = document.getElementById('forumCategories');
    if (!container) return;

    // Extract unique categories from threads
    const categories = {};
    (DATA.forum || []).forEach(thread => {
        const cat = thread.category || 'General';
        if (!categories[cat]) categories[cat] = 0;
        categories[cat]++;
    });

    if (Object.keys(categories).length === 0) {
        container.innerHTML = '<p class="text-muted small">No categories yet</p>';
        return;
    }

    container.innerHTML = Object.entries(categories)
        .sort((a, b) => b[1] - a[1]) // most active first
        .map(([cat, count]) => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <a href="#" class="text-decoration-none" onclick="filterForumByCategory('${cat}'); return false;">
                    <i class="fas fa-folder me-2 text-primary"></i>${cat}
                </a>
                <span class="badge bg-secondary">${count}</span>
            </div>
        `).join('');
}

function updateForumStats() {
    const threads = DATA.forum || [];
    let totalReplies = 0;
    threads.forEach(t => totalReplies += (t.replies || 0));

    // Mock active users – replace with real data if available
    const activeUsers = new Set(threads.map(t => t.author)).size;

    document.getElementById('totalThreads').textContent = threads.length;
    document.getElementById('totalReplies').textContent = totalReplies;
    document.getElementById('activeUsers').textContent = activeUsers;
}

// Optional: Filter threads by category
function filterForumByCategory(category) {
    showAlert(`Filtering by: ${category} (feature coming soon)`, 'info');
    // In future: filter DATA.forum and re-render loadForumThreads()
}

function viewThread(id) {
    const thread = DATA.forum?.find(t => t.id === id);
    if (!thread) {
        showAlert('Thread not found.', 'warning');
        return;
    }

    // For now, show a simple alert/modal preview
    showAlert(`
        <strong>${thread.title}</strong><br>
        <small>By ${thread.author} • ${formatDate(thread.date)}</small><hr>
        ${thread.content}
    `, 'info');
    
    // Future: Open full thread view modal or dedicated page
}

async function renderLiveSessions() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Live Sessions & Classes</h2>

        <!-- Today's Highlight (if any live now or upcoming soon) -->
        <div id="liveHighlight" class="mb-5"></div>

        <!-- All Sessions Grid -->
        <div id="liveSessionsGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading live sessions...</p>
            </div>
        </div>
    `;

    loadLiveSessions();
}

function loadLiveSessions() {
    const grid = document.getElementById('liveSessionsGrid');
    const highlight = document.getElementById('liveHighlight');
    if (!grid) return;

    const sessions = DATA.liveSessions || [];

    // Find current live or next upcoming for highlight
    const now = new Date();
    let liveNow = null;
    let nextUpcoming = null;
    let minDiff = Infinity;

    sessions.forEach(session => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const diff = start - now;

        if (now >= start && now <= end) {
            liveNow = session;
        } else if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextUpcoming = session;
        }
    });

    // Render highlight if there's a live or upcoming session
    if (liveNow || nextUpcoming) {
        const featured = liveNow || nextUpcoming;
        const isLive = !!liveNow;

        highlight.innerHTML = `
            <div class="glass-card p-5 text-center highlight-session shadow-lg">
                <span class="badge bg-${isLive ? 'danger' : 'warning'} fs-5 px-4 py-2 mb-4">
                    <i class="fas fa-circle ${isLive ? 'live-pulse' : ''} me-2"></i>
                    ${isLive ? 'LIVE NOW' : 'NEXT SESSION'}
                </span>
                <h3 class="fw-bold mb-3">${featured.title}</h3>
                <p class="lead mb-4">${featured.subject} • ${featured.teacher}</p>
                <p class="fs-5 mb-4">
                    <i class="fas fa-clock me-2"></i>
                    ${formatDateTime(featured.startTime)} – ${formatTime(featured.endTime)}
                </p>
                <button class="btn btn-${isLive ? 'danger' : 'primary'} btn-lg px-5 shadow" onclick="joinLiveSession('${featured.id}')">
                    <i class="fas fa-video me-2"></i>
                    ${isLive ? 'Join Live Class' : 'Join When Starts'}
                </button>
                ${isLive ? `<p class="mt-3 text-danger fw-bold"><i class="fas fa-users me-2"></i>${featured.participants || 42} students watching</p>` : ''}
            </div>
        `;
    } else {
        highlight.innerHTML = '';
    }

    // Render all sessions
    if (sessions.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-video-slash fa-4x mb-4 opacity-50"></i>
                <h5>No live sessions scheduled</h5>
                <p>Check back later for upcoming classes!</p>
            </div>
        `;
        return;
    }

    // Sort by start time
    const sorted = [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    grid.innerHTML = sorted.map(session => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const isLive = now >= start && now <= end;
        const isPast = now > end;
        const isUpcoming = now < start;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card p-4 session-card h-100 ${isLive ? 'border-danger border-3' : isPast ? 'opacity-75' : ''}">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="badge bg-${isLive ? 'danger' : isPast ? 'secondary' : 'success'}">
                            ${isLive ? 'LIVE' : isPast ? 'Ended' : 'Upcoming'}
                        </span>
                        <small class="text-muted">${session.subject}</small>
                    </div>
                    <h5 class="fw-bold mb-3">${session.title}</h5>
                    <p class="text-muted mb-2">
                        <i class="fas fa-chalkboard-teacher me-2"></i>${session.teacher}
                    </p>
                    <p class="mb-3">
                        <i class="fas fa-calendar me-2"></i>${formatDate(start)}
                        <br>
                        <i class="fas fa-clock me-2"></i>${formatTime(start)} – ${formatTime(end)}
                    </p>
                    <button class="btn btn-${isLive ? 'danger' : isUpcoming ? 'primary' : 'secondary'} w-100" 
                            onclick="joinLiveSession('${session.id}')" 
                            ${isPast ? 'disabled' : ''}>
                        <i class="fas fa-video me-2"></i>
                        ${isLive ? 'Join Now' : isUpcoming ? 'Join When Starts' : 'View Recording'}
                    </button>
                    ${isLive ? `<p class="text-center mt-3 mb-0 text-danger"><strong>${session.participants || 0} watching</strong></p>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Helper to format time only (e.g., 14:30)
function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

// Enhanced date + time
function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-KE', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function joinLiveSession(id) {
    const session = DATA.liveSessions?.find(s => s.id === id);
    if (!session) {
        showAlert('Session not found.', 'warning');
        return;
    }

    if (session.link) {
        // Real integration: open in new tab or iframe
        window.open(session.link, '_blank');
        showAlert(`Joining ${session.title}...`, 'success');
    } else {
        // Mock/demo behavior
        showAlert(`
            <strong>${session.title}</strong><br>
            <small>Teacher: ${session.teacher}</small><hr>
            This would open the live streaming platform (e.g., Zoom, Google Meet, or custom room).
        `, 'info');
    }
}

async function renderMedia() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Media & Lesson Gallery</h2>

        <!-- Filter Tabs -->
        <ul class="nav nav-tabs justify-content-center mb-5" id="mediaTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="all-tab" data-filter="all" type="button">
                    <i class="fas fa-th me-2"></i>All Media
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="images-tab" data-filter="image" type="button">
                    <i class="fas fa-images me-2"></i>Images
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="videos-tab" data-filter="video" type="button">
                    <i class="fas fa-video me-2"></i>Videos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="documents-tab" data-filter="document" type="button">
                    <i class="fas fa-file-alt me-2"></i>Documents
                </button>
            </li>
        </ul>

        <!-- Media Grid -->
        <div id="mediaGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading media gallery...</p>
            </div>
        </div>
    `;

    // Initialize tabs and load media
    setupMediaTabs();
    loadMediaGallery();
}

function setupMediaTabs() {
    const tabs = document.querySelectorAll('#mediaTabs .nav-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter media
            const filter = tab.getAttribute('data-filter');
            filterMediaGallery(filter);
        });
    });
}

function loadMediaGallery() {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    const media = DATA.media || [];

    if (media.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-photo-video fa-4x mb-4 opacity-50"></i>
                <h5>No media uploaded yet</h5>
                <p>Check back later for lesson images, videos, and documents.</p>
            </div>
        `;
        return;
    }

    // Sort newest first
    const sorted = [...media].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    renderMediaItems(sorted);
}

function filterMediaGallery(filter) {
    const media = DATA.media || [];
    let filtered = media;

    if (filter !== 'all') {
        filtered = media.filter(item => item.type === filter);
    }

    // Sort newest first
    const sorted = [...filtered].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    renderMediaItems(sorted);
}

function renderMediaItems(items) {
    const grid = document.getElementById('mediaGrid');

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-search fa-3x mb-4 opacity-50"></i>
                <h5>No items in this category</h5>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(item => {
        const isVideo = item.type === 'video';
        const isImage = item.type === 'image';
        const isDocument = item.type === 'document';

        return `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card overflow-hidden h-100 media-item shadow-sm hover-shadow">
                    ${isVideo ? `
                        <div class="ratio ratio-16x9">
                            <video controls preload="metadata" poster="${item.thumbnail || ''}" class="w-100">
                                <source src="${item.url}" type="video/mp4">
                                Your browser does not support video.
                            </video>
                        </div>
                    ` : isImage ? `
                        <img src="${item.url}" class="img-fluid gallery-image" alt="${item.title}" loading="lazy" onclick="openLightbox('${item.url}', '${item.title}')">
                    ` : `
                        <div class="d-flex align-items-center justify-content-center bg-light" style="height: 200px;">
                            <i class="fas ${getFileIcon(item.format || 'pdf')} fa-5x text-primary opacity-50"></i>
                        </div>
                    `}
                    <div class="p-3">
                        <h6 class="fw-bold mb-1">${item.title}</h6>
                        <p class="small text-muted mb-2">
                            ${item.subject ? `<strong>${item.subject}</strong> • ` : ''}
                            Uploaded by ${item.uploader} • ${formatDate(item.uploadDate)}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${isVideo ? 'danger' : isImage ? 'success' : 'info'}">
                                ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                            <a href="${item.url}" class="btn btn-outline-primary btn-sm" target="_blank" download>
                                <i class="fas fa-download me-1"></i>Download
                            </a>
                        </div>
                        ${item.description ? `<p class="small text-muted mt-3 mb-0">${item.description}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Simple lightbox for images
function openLightbox(imageUrl, title) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content bg-transparent border-0">
                <div class="modal-body text-center p-0">
                    <img src="${imageUrl}" class="img-fluid rounded shadow-lg" alt="${title}">
                    <button type="button" class="btn btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal"></button>
                    ${title ? `<p class="text-white mt-3 fs-5 text-shadow">${title}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

async function renderQuizzes() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Quizzes & Assignments</h2>

        <!-- Summary Cards -->
        <div class="row g-4 mb-5">
            <div class="col-md-6">
                <div class="glass-card p-4 h-100 shadow-sm">
                    <h5 class="fw-bold text-primary mb-4">
                        <i class="fas fa-clipboard-list me-2"></i>Pending Quizzes
                    </h5>
                    <div id="pendingQuizzes">
                        <div class="text-center py-4 text-muted">
                            <i class="fas fa-spinner fa-spin fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="glass-card p-4 h-100 shadow-sm">
                    <h5 class="fw-bold text-warning mb-4">
                        <i class="fas fa-tasks me-2"></i>Active Assignments
                    </h5>
                    <div id="activeAssignments">
                        <div class="text-center py-4 text-muted">
                            <i class="fas fa-spinner fa-spin fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Quiz & Assignment Grid -->
        <h4 class="mb-4">All Assessments</h4>
        <div id="quizGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading quizzes and assignments...</p>
            </div>
        </div>
    `;

    loadPendingQuizzes();
    loadActiveAssignments();
    loadAllAssessments();
}

function loadPendingQuizzes() {
    const container = document.getElementById('pendingQuizzes');
    if (!container) return;

    const now = new Date();
    const pending = (DATA.quizzes || []).filter(q => {
        if (q.submitted) return false;
        if (!q.dueDate) return true;
        return new Date(q.dueDate) > now;
    });

    if (pending.length === 0) {
        container.innerHTML = `
            <div class="text-center text-success py-4">
                <i class="fas fa-check-circle fa-3x mb-3"></i>
                <p class="mb-0">All quizzes completed! Great job!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pending.map(quiz => `
        <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
            <div>
                <h6 class="fw-bold mb-1">${quiz.title}</h6>
                <small class="text-muted">${quiz.subject}</small>
                ${quiz.dueDate ? `<br><small class="text-danger"><i class="fas fa-clock me-1"></i>Due: ${formatDate(quiz.dueDate)}</small>` : ''}
            </div>
            <button class="btn btn-success btn-sm" onclick="startQuiz('${quiz.id}')">
                <i class="fas fa-play me-1"></i>Start
            </button>
        </div>
    `).join('');
}

function loadActiveAssignments() {
    const container = document.getElementById('activeAssignments');
    if (!container) return;

    const now = new Date();
    const active = (DATA.assignments || []).filter(a => {
        if (a.submitted) return false;
        if (!a.dueDate) return true;
        return new Date(a.dueDate) > now;
    });

    if (active.length === 0) {
        container.innerHTML = `
            <div class="text-center text-success py-4">
                <i class="fas fa-check-circle fa-3x mb-3"></i>
                <p class="mb-0">No pending assignments!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = active.map(assignment => `
        <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
            <div>
                <h6 class="fw-bold mb-1">${assignment.title}</h6>
                <small class="text-muted">${assignment.subject}</small>
                ${assignment.dueDate ? `<br><small class="text-danger"><i class="fas fa-clock me-1"></i>Due: ${formatDate(assignment.dueDate)}</small>` : ''}
            </div>
            <button class="btn btn-warning btn-sm text-dark" onclick="openAssignmentSubmission('${assignment.id}')">
                <i class="fas fa-upload me-1"></i>Submit
            </button>
        </div>
    `).join('');
}

function loadAllAssessments() {
    const grid = document.getElementById('quizGrid');
    if (!grid) return;

    const quizzes = (DATA.quizzes || []).map(q => ({ ...q, type: 'quiz' }));
    const assignments = (DATA.assignments || []).map(a => ({ ...a, type: 'assignment' }));
    const all = [...quizzes, ...assignments];

    if (all.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-tasks fa-4x mb-4 opacity-50"></i>
                <h5>No quizzes or assignments available</h5>
            </div>
        `;
        return;
    }

    // Sort by due date or most recent
    const sorted = all.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const now = new Date();

    grid.innerHTML = sorted.map(item => {
        const isQuiz = item.type === 'quiz';
        const isOverdue = item.dueDate && new Date(item.dueDate) < now && !item.submitted;
        const isSubmitted = item.submitted;

        return `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card p-4 h-100 assessment-card ${isOverdue ? 'border-danger' : ''}">
                    <div class="d-flex justify-content-between mb-3">
                        <span class="badge bg-${isQuiz ? 'success' : 'warning'}">
                            ${isQuiz ? 'Quiz' : 'Assignment'}
                        </span>
                        <span class="badge bg-${isSubmitted ? 'secondary' : isOverdue ? 'danger' : 'primary'}">
                            ${isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Active'}
                        </span>
                    </div>
                    <h5 class="fw-bold">${item.title}</h5>
                    <p class="text-muted small mb-2">${item.subject}</p>
                    ${item.dueDate ? `<p class="small mb-3"><strong>Due:</strong> ${formatDate(item.dueDate)}</p>` : ''}
                    ${isQuiz && item.score !== undefined ? `<p class="mb-3"><strong>Score:</strong> ${item.score}/${item.total} (${Math.round((item.score/item.total)*100)}%)</p>` : ''}
                    <button class="btn btn-${isQuiz ? 'success' : 'warning'} w-100" 
                            onclick="${isQuiz ? `startQuiz('${item.id}')` : `openAssignmentSubmission('${item.id}')`}"
                            ${isSubmitted ? 'disabled' : ''}>
                        <i class="fas ${isQuiz ? 'fa-play' : 'fa-upload'} me-2"></i>
                        ${isSubmitted ? 'Completed' : isQuiz ? 'Take Quiz' : 'Submit Work'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Helper to open assignment submission modal
function openAssignmentSubmission(assignmentId) {
    const assignment = DATA.assignments?.find(a => a.id === assignmentId);
    if (!assignment) {
        showAlert('Assignment not found.', 'warning');
        return;
    }

    // Populate modal
    document.getElementById('assignmentId').value = assignment.id;
    document.getElementById('assignmentTitle').textContent = assignment.title;
    document.getElementById('assignmentDescription').textContent = assignment.description || 'No additional instructions.';

    const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
    modal.show();
}

async function renderResources() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Learning Resources</h2>

        <!-- Filters -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <!-- Type Filters -->
                    <div class="btn-group" role="group" id="typeFilterGroup">
                        <button type="button" class="btn btn-outline-primary active" data-filter="all">All</button>
                        <button type="button" class="btn btn-outline-primary" data-filter="pdf">PDFs</button>
                        <button type="button" class="btn btn-outline-primary" data-filter="video">Videos</button>
                        <button type="button" class="btn btn-outline-primary" data-filter="interactive">Interactive</button>
                        <button type="button" class="btn btn-outline-primary" data-filter="notes">Notes</button>
                    </div>

                    <!-- Subject Filter -->
                    <div class="d-flex align-items-center gap-2">
                        <label class="fw-bold text-muted small mb-0">Subject:</label>
                        <select class="form-select w-auto" id="subjectFilter">
                            <option value="">All Subjects</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resources Grid -->
        <div id="resourcesGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading resources...</p>
            </div>
        </div>
    `;

    // Setup filters and load data
    setupResourceFilters();
    populateSubjectFilter();
    loadResources();
}

let currentResourceFilter = 'all';
let currentSubjectFilter = '';

function setupResourceFilters() {
    // Type filter buttons
    document.querySelectorAll('#typeFilterGroup .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#typeFilterGroup .btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentResourceFilter = btn.getAttribute('data-filter');
            filterAndRenderResources();
        });
    });

    // Subject filter dropdown
    const subjectSelect = document.getElementById('subjectFilter');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', () => {
            currentSubjectFilter = subjectSelect.value;
            filterAndRenderResources();
        });
    }
}

function populateSubjectFilter() {
    const select = document.getElementById('subjectFilter');
    if (!select) return;

    const subjects = new Set();
    (DATA.resources || []).forEach(r => {
        if (r.subject) subjects.add(r.subject);
    });

    // Clear existing options except "All"
    select.innerHTML = '<option value="">All Subjects</option>';

    [...subjects].sort().forEach(sub => {
        select.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

function loadResources() {
    currentResourceFilter = 'all';
    currentSubjectFilter = '';
    filterAndRenderResources();
}

function filterAndRenderResources() {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;

    let resources = DATA.resources || [];

    // Apply type filter
    if (currentResourceFilter !== 'all') {
        resources = resources.filter(r => r.type === currentResourceFilter);
    }

    // Apply subject filter
    if (currentSubjectFilter) {
        resources = resources.filter(r => r.subject === currentSubjectFilter);
    }

    // Sort by newest first
    const sorted = [...resources].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    if (sorted.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-folder-open fa-4x mb-4 opacity-50"></i>
                <h5>No resources found</h5>
                <p>Try adjusting the filters or check back later.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = sorted.map(resource => {
        const icon = getResourceIcon(resource.type);
        const badgeColor = {
            pdf: 'danger',
            video: 'success',
            interactive: 'info',
            notes: 'warning'
        }[resource.type] || 'primary';

        return `
            <div class="col-lg-4 col-md-6">
                <div class="glass-card p-4 h-100 resource-card hover-shadow">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <i class="fas ${icon} fa-3x text-${badgeColor} opacity-75"></i>
                        <span class="badge bg-${badgeColor}">${resource.type.toUpperCase()}</span>
                    </div>
                    <h5 class="fw-bold mb-2">${resource.title}</h5>
                    <p class="text-muted small mb-3">
                        <strong>${resource.subject || 'General'}</strong><br>
                        Uploaded by ${resource.uploader} • ${formatDate(resource.uploadDate)}
                    </p>
                    ${resource.description ? `<p class="small text-muted mb-3">${resource.description}</p>` : ''}
                    <div class="mt-auto">
                        <a href="${resource.url}" class="btn btn-outline-primary w-100" target="_blank">
                            <i class="fas fa-download me-2"></i>
                            ${resource.type === 'video' ? 'Watch / Download' : 'Open / Download'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getResourceIcon(type) {
    const icons = {
        pdf: 'fa-file-pdf',
        video: 'fa-file-video',
        interactive: 'fa-laptop-code',
        notes: 'fa-file-alt',
        default: 'fa-file'
    };
    return icons[type] || icons.default;
}

async function renderStudyPlans() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Your Study Plans</h2>

        <!-- Quick Summary -->
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="glass-card p-4 text-center">
                    <i class="fas fa-calendar-check fa-3x text-success mb-3"></i>
                    <h4 id="activePlansCount">0</h4>
                    <p class="text-muted mb-0">Active Plans</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="glass-card p-4 text-center">
                    <i class="fas fa-tasks fa-3x text-primary mb-3"></i>
                    <h4 id="tasksCompletedToday">0</h4>
                    <p class="text-muted mb-0">Tasks Done Today</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="glass-card p-4 text-center">
                    <i class="fas fa-clock fa-3x text-warning mb-3"></i>
                    <h4 id="totalStudyTimeThisWeek">0h</h4>
                    <p class="text-muted mb-0">Study Time This Week</p>
                </div>
            </div>
        </div>

        <!-- Study Plans Grid -->
        <div id="studyPlansGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading your study plans...</p>
            </div>
        </div>
    `;

    loadStudyPlans();
}

function loadStudyPlans() {
    const grid = document.getElementById('studyPlansGrid');
    const activeCountEl = document.getElementById('activePlansCount');
    const tasksTodayEl = document.getElementById('tasksCompletedToday');
    const studyTimeEl = document.getElementById('totalStudyTimeThisWeek');

    if (!grid) return;

    const plans = DATA.studyPlans || [];

    // Update summary stats
    const activePlans = plans.filter(p => p.status === 'active').length;
    let tasksToday = 0;
    let totalMinutesThisWeek = 0;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday start

    plans.forEach(plan => {
        if (plan.tasks) {
            plan.tasks.forEach(task => {
                if (task.completed && task.date) {
                    const taskDate = new Date(task.date);
                    if (isSameDay(taskDate, today)) tasksToday++;
                    if (taskDate >= weekStart) {
                        totalMinutesThisWeek += task.duration || 0;
                    }
                }
            });
        }
    });

    if (activeCountEl) activeCountEl.textContent = activePlans;
    if (tasksTodayEl) tasksTodayEl.textContent = tasksToday;
    if (studyTimeEl) studyTimeEl.textContent = `${Math.round(totalMinutesThisWeek / 60)}h`;

    if (plans.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="fas fa-book-open fa-4x mb-4 opacity-50"></i>
                <h5>No study plans yet</h5>
                <p>Create a personalized revision schedule to stay on track!</p>
            </div>
        `;
        return;
    }

    // Sort by priority or creation date
    const sorted = [...plans].sort((a, b) => (b.priority || 0) - (a.priority || 0));

    grid.innerHTML = sorted.map(plan => {
        const completedTasks = plan.tasks?.filter(t => t.completed).length || 0;
        const totalTasks = plan.tasks?.length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const statusBadge = {
            active: 'success',
            completed: 'info',
            paused: 'secondary'
        }[plan.status || 'active'];

        return `
            <div class="col-lg-6 col-xl-4">
                <div class="glass-card p-4 h-100 study-plan-card hover-shadow">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="fw-bold mb-0">${plan.title}</h5>
                        <span class="badge bg-${statusBadge}">${plan.status || 'Active'}</span>
                    </div>
                    <p class="text-muted small mb-3">${plan.description || 'Personalized study schedule'}</p>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>Progress</span>
                            <span>${completedTasks}/${totalTasks} tasks</span>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-success" style="width: ${progress}%">
                                ${progress}%
                            </div>
                        </div>
                    </div>

                    ${plan.subject ? `<p class="small mb-2"><strong>Subject:</strong> ${plan.subject}</p>` : ''}
                    ${plan.endDate ? `<p class="small mb-3"><strong>Target:</strong> ${formatDate(plan.endDate)}</p>` : ''}

                    <button class="btn btn-primary w-100" onclick="viewStudyPlanDetail('${plan.id}')">
                        <i class="fas fa-eye me-2"></i>View Plan
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function viewStudyPlanDetail(planId) {
    const plan = DATA.studyPlans?.find(p => p.id === planId);
    if (!plan) {
        showAlert('Study plan not found.', 'warning');
        return;
    }

    // For now: show summary in alert (future: open detailed modal/page)
    let taskList = '';
    if (plan.tasks && plan.tasks.length > 0) {
        taskList = plan.tasks.map(t => `
            • ${t.completed ? '✓' : '○'} ${t.title} 
              ${t.duration ? `(${t.duration} min)` : ''}
              ${t.date ? `– ${formatDate(t.date)}` : ''}
        `).join('<br>');
    } else {
        taskList = 'No tasks assigned yet.';
    }

    showAlert(`
        <strong class="fs-5">${plan.title}</strong><br>
        <small>${plan.description || ''}</small><hr>
        <strong>Tasks:</strong><br>${taskList}
    `, 'info');
}

async function renderSubjects() {
    document.getElementById('mainContentArea').innerHTML = `
        <h2 class="section-title text-center mb-5">Subjects & Courses</h2>

        <!-- Quick Stats -->
        <div class="row g-4 mb-5 text-center">
            <div class="col-md-3 col-sm-6">
                <div class="glass-card p-4">
                    <i class="fas fa-book fa-3x text-primary mb-3"></i>
                    <h4 class="fw-bold">${DATA.subjects?.length || 0}</h4>
                    <p class="text-muted mb-0">Enrolled Subjects</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="glass-card p-4">
                    <i class="fas fa-tasks fa-3x text-success mb-3"></i>
                    <h4 class="fw-bold">${DATA.stats?.lessonsCompleted || 0}</h4>
                    <p class="text-muted mb-0">Lessons Completed</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="glass-card p-4">
                    <i class="fas fa-chart-line fa-3x text-info mb-3"></i>
                    <h4 class="fw-bold">${DATA.stats?.overallProgress || 0}%</h4>
                    <p class="text-muted mb-0">Overall Progress</p>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="glass-card p-4">
                    <i class="fas fa-trophy fa-3x text-warning mb-3"></i>
                    <h4 class="fw-bold">${DATA.stats?.points || 0}</h4>
                    <p class="text-muted mb-0">Points Earned</p>
                </div>
            </div>
        </div>

        <!-- Subjects Grid -->
        <div id="subjectsGrid" class="row g-4">
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p>Loading your subjects...</p>
            </div>
        </div>
    `;

    loadSubjects();
}