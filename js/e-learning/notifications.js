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

// API Functions
async function fetchNotifications() {
    try {
        showLoading(true);
        logger.info('Fetching notifications from API');
        
        const response = await fetch(`${CONFIG.API_BASE}/notifications`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        notifications = await response.json();
        logger.info(`Loaded ${notifications.length} notifications`);
        
        applyFilters();
        updateStats();
        showLoading(false);
        
    } catch (error) {
        logger.error('Failed to load notifications', error);
        showError('Failed to load notifications. Please try again later.');
        showLoading(false);
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

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');

    if (filteredNotifications.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    emptyState.style.display = 'none';

    container.innerHTML = filteredNotifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'} ${notification.priority || 'low'}-priority"
             data-id="${notification.id}">
            <div class="d-flex align-items-start">
                <div class="notification-icon ${notification.type || 'administrative'}">
                    <i class="fas ${notification.icon || 'fa-bell'}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <h5 class="mb-0">${notification.title || 'Notification'}</h5>
                        <div class="d-flex align-items-center gap-2">
                            ${notification.priority ? `
                                <span class="priority-badge priority-${notification.priority}">
                                    ${notification.priority}
                                </span>
                            ` : ''}
                            <small class="text-muted">${formatTime(notification.createdAt || notification.time)}</small>
                        </div>
                    </div>
                    <p class="mb-2 text-muted">${notification.message || ''}</p>
                    ${notification.category ? `
                        <span class="badge bg-secondary mb-2">${notification.category}</span>
                    ` : ''}
                    <div class="notification-actions">
                        ${!notification.read ? `
                            <button class="btn-action btn-mark-read" onclick="markAsRead('${notification.id}')">
                                <i class="fas fa-check me-1"></i>Mark Read
                            </button>
                        ` : ''}
                        <button class="btn-action btn-delete" onclick="deleteNotification('${notification.id}')">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
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
    
    // Set up real-time updates using Server-Sent Events if available
    setupRealTimeUpdates();
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