// JavaScript for notifications.html
console.log('Notifications page loaded');

// Configuration
const CONFIG = {
    API_BASE: '/api',
    LOG_LEVEL: 'info',
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
    PAGE_SIZE: 50
};

// State management
let notifications = [];
let filteredNotifications = [];
let currentFilter = 'all';
let searchTerm = '';
let autoRefreshTimer = null;

// Logging utility
const logger = {
    log: (level, message, data = null) => {
        if (['debug', 'info', 'warn', 'error'].indexOf(CONFIG.LOG_LEVEL) <=
            ['debug', 'info', 'warn', 'error'].indexOf(level)) {
            console[level](`[${new Date().toISOString()}] ${message}`, data || '');
        }
    },
    debug: (msg, data) => logger.log('debug', msg, data),
    info: (msg, data) => logger.log('info', msg, data),
    warn: (msg, data) => logger.log('warn', msg, data),
    error: (msg, data) => logger.log('error', msg, data)
};

// DOM Elements
const notificationsList = document.getElementById('notificationsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');

// API Functions
async function fetchNotifications(page = 1, limit = CONFIG.PAGE_SIZE) {
    loadingSpinner.style.display = 'block';
    emptyState.style.display = 'none';
    
    if (page === 1) {
        notificationsList.innerHTML = '';
    }

    try {
        const response = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();

        if (data.length === 0 && page === 1) {
            emptyState.style.display = 'block';
        } else {
            if (page === 1) {
                notifications = data;
            } else {
                notifications = [...notifications, ...data];
            }
            applyFilters();
            updateStats();
        }
    } catch (err) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `<p class="text-danger">${err.message}</p>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Implement infinite scroll using IntersectionObserver
let currentPage = 1;
let isLoading = false;

function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                currentPage++;
                isLoading = true;
                fetchNotifications(currentPage).finally(() => {
                    isLoading = false;
                });
            }
        });
    }, { threshold: 0.1 });

    const sentinel = document.createElement('div');
    sentinel.id = 'infiniteScrollSentinel';
    notificationsList.appendChild(sentinel);
    observer.observe(sentinel);
}

// Support offline fallback with cached notifications
if (!navigator.onLine) {
    const cachedNotifications = localStorage.getItem('notificationsCache');
    if (cachedNotifications) {
        notifications = JSON.parse(cachedNotifications);
        applyFilters();
        updateStats();
    }
}

// Cache notifications when online
function cacheNotifications() {
    if (navigator.onLine) {
        localStorage.setItem('notificationsCache', JSON.stringify(notifications));
    }
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/notifications/${notificationId}/read`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                notification.readAt = new Date().toISOString();
                renderNotifications();
                updateStats();
                logger.info(`Marked notification ${notificationId} as read`);
            }
        }
    } catch (error) {
        logger.error('Failed to mark as read', error);
    }
}

async function deleteNotification(notificationId) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/notifications/${notificationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            notifications = notifications.filter(n => n.id !== notificationId);
            applyFilters();
            updateStats();
            logger.info(`Deleted notification ${notificationId}`);
        }
    } catch (error) {
        logger.error('Failed to delete notification', error);
    }
}

async function markAllAsRead() {
    try {
        const unreadNotifications = notifications.filter(n => !n.read);
        const promises = unreadNotifications.map(n => markAsRead(n.id));
        await Promise.all(promises);
        logger.info('Marked all notifications as read');
    } catch (error) {
        logger.error('Failed to mark all as read', error);
    }
}

// UI Functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const list = document.getElementById('notificationsList');
    
    if (show) {
        spinner.style.display = 'block';
        list.style.display = 'none';
    } else {
        spinner.style.display = 'none';
        list.style.display = 'block';
    }
}

function showError(message) {
    const list = document.getElementById('notificationsList');
    list.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
    `;
}

function updateStats() {
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('unreadCount').textContent = unreadCount;
    
    // Update notification badges on filter tabs
    document.querySelectorAll('[data-filter]').forEach(tab => {
        const filter = tab.dataset.filter;
        let count = 0;
        
        if (filter === 'unread') {
            count = notifications.filter(n => !n.read).length;
        } else if (filter !== 'all') {
            count = notifications.filter(n => n.category === filter).length;
        }
        
        const badge = tab.querySelector('.notification-badge');
        if (count > 0) {
            if (!badge) {
                const span = document.createElement('span');
                span.className = 'notification-badge';
                span.textContent = count;
                tab.appendChild(span);
            } else {
                badge.textContent = count;
            }
        } else if (badge) {
            badge.remove();
        }
    });
}

function applyFilters() {
    filteredNotifications = notifications.filter(notification => {
        // Search filter
        if (searchTerm) {
            const searchFields = [
                notification.title,
                notification.message,
                notification.type,
                notification.category
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm.toLowerCase())) {
                return false;
            }
        }

        // Category filter
        switch (currentFilter) {
            case 'unread':
                return !notification.read;
            case 'academic':
                return notification.category === 'academic';
            case 'administrative':
                return notification.category === 'administrative';
            case 'event':
                return notification.category === 'event';
            default:
                return true;
        }
    });

    renderNotifications();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderNotification(notification) {
    const div = document.createElement('div');
    div.className = `notification-item ${notification.read ? '' : 'unread'} ${notification.priority}-priority`;
    div.setAttribute('data-type', notification.type);
    div.setAttribute('data-read', notification.read);
    div.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="notification-icon ${notification.type}"><i class="${notification.icon}"></i></div>
            <div>
                <h5>${escapeHtml(notification.title)}</h5>
                <p>${escapeHtml(notification.message)}</p>
                <div class="notification-meta">${escapeHtml(notification.date)}</div>
            </div>
        </div>`;
    notificationsList.appendChild(div);
}

// Show skeleton loading cards instead of a spinner for a better UX
function showSkeletonLoading() {
    notificationsList.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'notification-item skeleton';
        skeleton.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="notification-icon skeleton-icon"></div>
                <div class="flex-grow-1">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>`;
        notificationsList.appendChild(skeleton);
    }
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        applyFilters();
    });

    // Filter tabs
    document.querySelectorAll('[data-filter]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active tab
            document.querySelectorAll('[data-filter]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Apply filter
            currentFilter = tab.dataset.filter;
            applyFilters();
        });
    });

    // Mark all read
    document.getElementById('markAllRead').addEventListener('click', markAllAsRead);

    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', fetchNotifications);

    // Auto-refresh
    autoRefreshTimer = setInterval(fetchNotifications, CONFIG.AUTO_REFRESH_INTERVAL);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    logger.info('Initializing notifications system');
    setupEventListeners();
    await fetchNotifications();
    setupInfiniteScroll();
    
    // Set up real-time updates using Server-Sent Events if available
    setupRealTimeUpdates();
});

// Event delegation for dynamically created notifications
notificationsList.addEventListener('click', (e) => {
    const notificationItem = e.target.closest('.notification-item');
    if (!notificationItem) return;
    
    const notificationId = notificationItem.dataset.id;
    const notification = notifications.find(n => n.id === notificationId);
    
    if (e.target.closest('.btn-mark-read')) {
        markAsRead(notificationId);
    } else if (e.target.closest('.btn-delete')) {
        deleteNotification(notificationId);
    }
});

function setupRealTimeUpdates() {
    try {
        const eventSource = new EventSource(`${CONFIG.API_BASE}/notifications/stream`);
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_notification') {
                notifications.unshift(data.notification);
                applyFilters();
                updateStats();
                logger.info('New notification received via SSE');
            }
        };
        eventSource.onerror = () => {
            logger.warn('SSE connection failed, falling back to polling');
            eventSource.close();
        };
    } catch (error) {
        logger.debug('SSE not supported, using polling only');
    }
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
});