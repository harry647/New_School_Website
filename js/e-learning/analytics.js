// E-Learning Analytics Dashboard - Professional Implementation
// Enterprise-grade analytics with Fetch API integration

console.log('Analytics dashboard initialized');

// Application State
const analyticsState = {
    isLoading: true,
    hasError: false,
    isEmpty: false,
    currentRange: '30',
    userData: null,
    charts: {}
};

// DOM Elements Cache
const elements = {
    loading: document.getElementById('analyticsLoading'),
    error: document.getElementById('analyticsError'),
    empty: document.getElementById('analyticsEmpty'),
    rangeSelect: document.getElementById('analyticsRange'),
    retryBtn: document.getElementById('retryAnalytics'),
    backToTop: document.getElementById('backToTop'),
    dataHooks: {
        subjectsCount: document.getElementById('subjectsCount'),
        pendingAssignments: document.getElementById('pendingAssignments'),
        studyStreak: document.getElementById('studyStreak')
    }
};

// Chart Configuration
const chartConfig = {
    subjectProgress: {
        element: document.getElementById('subjectProgressChart'),
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    },
    assignmentCompletion: {
        element: document.getElementById('assignmentCompletionChart'),
        type: 'doughnut',
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }
};

// Initialize the analytics dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing analytics dashboard');
    
    // Wait for W3.js includes to load before setting up event listeners
    // This ensures the header is fully loaded
    const checkW3Loaded = setInterval(function() {
        if (typeof w3 !== 'undefined' && document.querySelector('[w3-include-html]')) {
            clearInterval(checkW3Loaded);
            
            // Give a small delay for the includes to fully process
            setTimeout(function() {
                // Set up event listeners
                setupEventListeners();
                
                // Set up back to top button
                setupBackToTop();
                
                // Load initial data
                loadAnalyticsData();
            }, 500);
        }
    }, 100);
});

// Set up event listeners
function setupEventListeners() {
    // Time range filter
    if (elements.rangeSelect) {
        elements.rangeSelect.addEventListener('change', function() {
            analyticsState.currentRange = this.value;
            loadAnalyticsData();
        });
    }
    
    // Retry button
    if (elements.retryBtn) {
        elements.retryBtn.addEventListener('click', loadAnalyticsData);
    }
}

// Load analytics data from API
async function loadAnalyticsData() {
    console.log(`Loading analytics data for range: ${analyticsState.currentRange} days`);
    
    // Show loading state
    showLoadingState();
    
    try {
        // Simulate API call (in production, this would be a real fetch)
        const apiUrl = `/api/analytics/summary?range=${analyticsState.currentRange}`;
        console.log(`Fetching from: ${apiUrl}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate API response
        const mockResponse = await getMockAnalyticsData();
        
        if (!mockResponse || Object.keys(mockResponse).length === 0) {
            showEmptyState();
            return;
        }
        
        // Process and display data
        processAnalyticsData(mockResponse);
        renderCharts(mockResponse.charts);
        
        // Show success state
        showContentState();
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        showErrorState();
    }
}

// Simulate API response (replace with real fetch in production)
async function getMockAnalyticsData() {
    // In production: return await fetch(apiUrl).then(res => res.json());
    
    return {
        subjects: 8,
        pendingAssignments: 3,
        studyStreakDays: 5,
        charts: {
            subjectProgress: {
                labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Kiswahili'],
                data: [85, 72, 90, 68, 78, 88]
            },
            assignmentCompletion: {
                labels: ['Completed', 'Pending', 'Overdue'],
                data: [12, 3, 1],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545']
            }
        }
    };
}

// Process and display analytics data
function processAnalyticsData(data) {
    analyticsState.userData = data;
    
    // Update data hooks
    elements.dataHooks.subjectsCount.textContent = data.subjects;
    elements.dataHooks.pendingAssignments.textContent = data.pendingAssignments;
    elements.dataHooks.studyStreak.textContent = `${data.studyStreakDays} Days`;
    
    console.log('Analytics data processed:', data);
}

// Render charts using Chart.js
function renderCharts(chartData) {
    // Destroy existing charts if they exist
    Object.values(analyticsState.charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Create new charts
    analyticsState.charts.subjectProgress = new Chart(
        chartConfig.subjectProgress.element,
        {
            type: chartConfig.subjectProgress.type,
            data: {
                labels: chartData.subjectProgress.labels,
                datasets: [{
                    label: 'Progress %',
                    data: chartData.subjectProgress.data,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                }]
            },
            options: chartConfig.subjectProgress.options
        }
    );
    
    analyticsState.charts.assignmentCompletion = new Chart(
        chartConfig.assignmentCompletion.element,
        {
            type: chartConfig.assignmentCompletion.type,
            data: {
                labels: chartData.assignmentCompletion.labels,
                datasets: [{
                    data: chartData.assignmentCompletion.data,
                    backgroundColor: chartData.assignmentCompletion.backgroundColor,
                    borderWidth: 0
                }]
            },
            options: chartConfig.assignmentCompletion.options
        }
    );
}

// State management functions
function showLoadingState() {
    analyticsState.isLoading = true;
    analyticsState.hasError = false;
    analyticsState.isEmpty = false;
    
    console.log('DEBUG - Showing loading state');
    console.log('Loading element:', elements.loading);
    
    elements.loading.style.display = 'flex';
    elements.error.classList.add('d-none');
    elements.empty.classList.add('d-none');
}

function showErrorState() {
    analyticsState.isLoading = false;
    analyticsState.hasError = true;
    analyticsState.isEmpty = false;
    
    elements.loading.style.display = 'none';
    elements.error.classList.remove('d-none');
    elements.empty.classList.add('d-none');
}

function showEmptyState() {
    analyticsState.isLoading = false;
    analyticsState.hasError = false;
    analyticsState.isEmpty = true;
    
    elements.loading.style.display = 'none';
    elements.error.classList.add('d-none');
    elements.empty.classList.remove('d-none');
}

function showContentState() {
    analyticsState.isLoading = false;
    analyticsState.hasError = false;
    analyticsState.isEmpty = false;
    
    console.log('DEBUG - Showing content state');
    console.log('Loading element before hiding:', elements.loading);
    console.log('Loading element display style before:', elements.loading.style.display);
    
    // Use !important to ensure the style is applied
    elements.loading.style.setProperty('display', 'none', 'important');
    elements.error.classList.add('d-none');
    elements.empty.classList.add('d-none');
    
    console.log('Loading element display style after:', elements.loading.style.display);
    
    // Additional check after a small delay to see if something is changing it back
    setTimeout(function() {
        console.log('DEBUG - Loading element display style after 1 second:', elements.loading.style.display);
        console.log('DEBUG - Loading element computed style:', window.getComputedStyle(elements.loading).display);
    }, 1000);
}

// Set up back to top button
function setupBackToTop() {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            elements.backToTop.style.display = 'block';
        } else {
            elements.backToTop.style.display = 'none';
        }
    });
    
    elements.backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// Analytics tracking
function trackAnalyticsEvent(eventName, data = {}) {
    console.log(`Analytics Event: ${eventName}`, data);
    
    // In production, this would send to analytics service
    if (typeof analytics !== 'undefined') {
        analytics.track(eventName, {
            page: 'analytics',
            module: 'e-learning',
            ...data,
            timestamp: new Date().toISOString()
        });
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAnalyticsData,
        processAnalyticsData,
        renderCharts,
        showLoadingState,
        showErrorState,
        showEmptyState,
        trackAnalyticsEvent
    };
}