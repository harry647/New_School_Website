// JavaScript for calendar.html
console.log('Calendar page loaded');

// Calendar State
const state = {
  currentDate: new Date(),
  events: [],
  isLoading: false,
  error: null
};

// DOM Elements
const elements = {
  calendarGrid: document.getElementById('calendarGrid'),
  calendarLoading: document.getElementById('calendarLoading'),
  calendarEmpty: document.getElementById('calendarEmpty'),
  calendarError: document.getElementById('calendarError'),
  currentMonth: document.getElementById('currentMonth'),
  prevMonth: document.getElementById('prevMonth'),
  nextMonth: document.getElementById('nextMonth'),
  goToday: document.getElementById('goToday'),
  refreshCalendar: document.getElementById('refreshCalendar'),
  upcomingEvents: document.getElementById('upcomingEvents'),
  calendarAdminControls: document.getElementById('calendarAdminControls')
};

// Initialize the calendar
function initCalendar() {
  setupEventListeners();
  renderCalendar();
  loadEvents();
}

// Set up event listeners
function setupEventListeners() {
  elements.prevMonth.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
  });

  elements.nextMonth.addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
  });

  elements.goToday.addEventListener('click', () => {
    state.currentDate = new Date();
    renderCalendar();
  });

  elements.refreshCalendar.addEventListener('click', loadEvents);

  // Keyboard navigation for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      state.currentDate.setMonth(state.currentDate.getMonth() - 1);
      renderCalendar();
    } else if (e.key === 'ArrowRight') {
      state.currentDate.setMonth(state.currentDate.getMonth() + 1);
      renderCalendar();
    }
  });
}

// Load events from the API
async function loadEvents() {
  state.isLoading = true;
  state.error = null;
  updateLoadingState();

  try {
    // Simulate API call
    const response = await fetch(`/api/elearning/calendar?month=${state.currentDate.getMonth() + 1}&year=${state.currentDate.getFullYear()}`);
    
    if (!response.ok) {
      throw new Error('Failed to load calendar data');
    }

    const data = await response.json();
    state.events = data.events || [];
    
    renderCalendar();
    renderUpcomingEvents();
  } catch (error) {
    console.error('Error loading events:', error);
    state.error = error.message;
    updateLoadingState();
  } finally {
    state.isLoading = false;
    updateLoadingState();
  }
}

// Update loading state UI
function updateLoadingState() {
  if (state.isLoading) {
    elements.calendarLoading.classList.remove('d-none');
    elements.calendarEmpty.classList.add('d-none');
    elements.calendarError.classList.add('d-none');
  } else if (state.error) {
    elements.calendarLoading.classList.add('d-none');
    elements.calendarEmpty.classList.add('d-none');
    elements.calendarError.classList.remove('d-none');
  } else if (state.events.length === 0) {
    elements.calendarLoading.classList.add('d-none');
    elements.calendarEmpty.classList.remove('d-none');
    elements.calendarError.classList.add('d-none');
  } else {
    elements.calendarLoading.classList.add('d-none');
    elements.calendarEmpty.classList.add('d-none');
    elements.calendarError.classList.add('d-none');
  }
}

// Render the calendar
function renderCalendar() {
  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();
  
  // Update current month display
  elements.currentMonth.textContent = new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'long' 
  }).format(state.currentDate);

  // Clear previous calendar
  elements.calendarGrid.innerHTML = '';

  // Generate calendar days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create day headers
  const daysHeader = document.createElement('div');
  daysHeader.className = 'd-flex flex-wrap mb-2';
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day-header text-center fw-bold';
    dayElement.textContent = day;
    daysHeader.appendChild(dayElement);
  });
  elements.calendarGrid.appendChild(daysHeader);

  // Create calendar grid
  const calendarBody = document.createElement('div');
  calendarBody.className = 'd-flex flex-wrap';

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    calendarBody.appendChild(emptyCell);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    // Highlight current day
    const today = new Date();
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      dayCell.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayCell.appendChild(dayNumber);

    // Add events for this day
    const dayEvents = state.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });

    if (dayEvents.length > 0) {
      const eventsContainer = document.createElement('div');
      eventsContainer.className = 'calendar-day-events';
      
      dayEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event ${getEventTypeClass(event.type)}`;
        eventElement.textContent = event.title;
        eventsContainer.appendChild(eventElement);
      });
      
      dayCell.appendChild(eventsContainer);
    }

    calendarBody.appendChild(dayCell);
  }

  elements.calendarGrid.appendChild(calendarBody);
}

// Get CSS class for event type
function getEventTypeClass(type) {
  switch (type) {
    case 'class': return 'text-primary';
    case 'assignment': return 'text-warning';
    case 'exam': return 'text-danger';
    case 'meeting': return 'text-success';
    default: return 'text-secondary';
  }
}

// Render upcoming events
function renderUpcomingEvents() {
  elements.upcomingEvents.innerHTML = '';

  if (state.events.length === 0) {
    elements.upcomingEvents.innerHTML = '<p class="text-muted">No upcoming events</p>';
    return;
  }

  // Sort events by date
  const sortedEvents = [...state.events].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  // Get upcoming events (next 5 events)
  const upcomingEvents = sortedEvents.slice(0, 5);

  upcomingEvents.forEach(event => {
    const eventElement = document.createElement('div');
    eventElement.className = 'upcoming-event mb-2 p-2 rounded';
    
    // Add appropriate link based on event type
    let linkUrl = '#';
    if (event.type === 'assignment') {
      linkUrl = `/e-learning/assignment-view.html?id=${event.id}`;
    } else if (event.type === 'class') {
      linkUrl = `/e-learning/live.html?session=${event.id}`;
    }

    eventElement.innerHTML = `
      <a href="${linkUrl}" class="text-decoration-none ${getEventTypeClass(event.type)}">
        <div class="fw-bold">${event.title}</div>
        <div class="small">
          <time datetime="${event.date}">${formatDate(event.date)}</time>
          ${event.startTime ? ` • ${event.startTime}` : ''}
        </div>
      </a>
    `;
    
    elements.upcomingEvents.appendChild(eventElement);
  });
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', initCalendar);