// Enhanced Alumni Page JavaScript - Stunning Interactive Experience
// 2025 • Premium Features • Professional Animations

const DEFAULT_ALUMNI_PHOTO = "/assets/images/defaults/default-user.png";

// Enhanced Data Loading and Error Handling
document.addEventListener("DOMContentLoaded", async () => {
    // Show loading state
    showLoadingState();
    
    try {
        const res = await fetch('/data/static/alumni-data.json');
        if (!res.ok) throw new Error('Alumni data not found');
        const data = await res.json();

        // Initialize all components
        initHeroStats(data);
        initWelcomeSection(data);
        initNotableAlumni(data);
        initAlumniEvents(data);
        initSearchAndFilter();
        initFormEnhancements();
        initScrollAnimations();
        initIntersectionObservers();
        initParallaxEffects();
        
        // Hide loading state
        hideLoadingState();
        
        console.log("Alumni page initialized successfully");
    } catch (err) {
        console.error("Alumni data failed to load:", err);
        handleDataLoadError();
    }
});

// ==============================
// LOADING STATES
// ==============================
function showLoadingState() {
    const loaders = document.querySelectorAll('.loader');
    loaders.forEach(loader => {
        loader.innerHTML = `
            <div class="loading-animation">
                <div class="spinner"></div>
                <p>Loading alumni data...</p>
            </div>
        `;
    });
}

function hideLoadingState() {
    setTimeout(() => {
        document.querySelectorAll('.loader').forEach(l => {
            l.style.opacity = '0';
            setTimeout(() => l.remove(), 300);
        });
    }, 500);
}

function handleDataLoadError() {
    const sections = ['#notableAlumni', '#alumniEvents'];
    sections.forEach(sel => {
        const el = document.querySelector(sel);
        if(el) {
            el.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load data</h3>
                    <p>Please check your connection and try again later.</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    });
}

// ==============================
// ENHANCED HERO STATS
// ==============================
function initHeroStats(data) {
    const heroStats = document.getElementById('heroStats');
    if (heroStats && data.stats) {
        // Animate numbers
        animateNumbers(heroStats);
        
        heroStats.innerHTML = `
            <div class="stat" data-target="${data.stats.alumni || '2500'}">
                <h3 class="counter">0</h3>
                <p>Alumni Worldwide</p>
            </div>
            <div class="stat" data-target="${data.stats.years || '50'}">
                <h3 class="counter">0</h3>
                <p>Years of Legacy</p>
            </div>
            <div class="stat" data-target="${data.stats.countries || '10'}">
                <h3 class="counter">0</h3>
                <p>Countries Represented</p>
            </div>
        `;
    }
}

function animateNumbers(container) {
    const counters = container.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.parentElement.dataset.target);
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString() + '+';
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    });
}

// ==============================
// ENHANCED WELCOME SECTION
// ==============================
function initWelcomeSection(data) {
    if (data.welcome) {
        const txt1 = document.getElementById('welcomeText1');
        const txt2 = document.getElementById('welcomeText2');
        const img = document.getElementById('reunionImage');
        
        if (txt1) {
            txt1.textContent = data.welcome.text1;
            animateText(txt1);
        }
        if (txt2) {
            txt2.textContent = data.welcome.text2;
            animateText(txt2);
        }
        if (img) {
            img.src = data.welcome.image || DEFAULT_ALUMNI_PHOTO;
            img.alt = data.welcome.alt || "Alumni Reunion";
            img.onerror = () => { img.src = DEFAULT_ALUMNI_PHOTO; };
            addImageHoverEffect(img);
        }
    }
}

function animateText(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    setTimeout(() => {
        element.style.transition = 'all 0.8s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 200);
}

function addImageHoverEffect(img) {
    img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.05) rotate(2deg)';
    });
    img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1) rotate(0deg)';
    });
}

// ==============================
// ENHANCED NOTABLE ALUMNI
// ==============================
function initNotableAlumni(data) {
    const notableGrid = document.getElementById('notableAlumni');
    if (notableGrid && data.notable) {
        notableGrid.innerHTML = '';
        
        data.notable.forEach((alum, i) => {
            const photo = alum.photo?.trim() || DEFAULT_ALUMNI_PHOTO;
            const card = createAlumniCard(alum, photo, i);
            notableGrid.appendChild(card);
        });
        
        // Add stagger animation
        animateCardsStagger(notableGrid.querySelectorAll('.alumni-card'));
    }
}

function createAlumniCard(alum, photo, index) {
    const card = document.createElement('div');
    card.className = 'alumni-card hover-zoom fade-in';
    card.style.animationDelay = `${index * 0.1}s`;
    card.dataset.name = alum.name.toLowerCase();
    card.dataset.batch = alum.batch || '';
    card.dataset.role = alum.currentRole?.toLowerCase() || '';
    
    card.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${photo}" alt="${alum.name}" loading="lazy" onerror="this.src='${DEFAULT_ALUMNI_PHOTO}'; this.onerror=null;">
            <div class="card-overlay">
                <button class="view-profile-btn" onclick="viewProfile('${alum.name}')">
                    <i class="fas fa-eye"></i> View Profile
                </button>
            </div>
        </div>
        <div class="card-content">
            <h4>${alum.name}</h4>
            <p class="batch">Class of ${alum.batch || 'N/A'}</p>
            <p class="achievement"><strong>${alum.achievement || 'Distinguished Alumnus'}</strong></p>
            ${alum.currentRole ? `<p class="current"><em>${alum.currentRole}</em></p>` : ''}
        </div>
    `;
    
    addCardInteractivity(card);
    return card;
}

function addCardInteractivity(card) {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-18px) rotateX(5deg) scale(1.02)';
        card.style.boxShadow = 'var(--shadow-xl), 0 0 40px rgba(139,92,246,0.3)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
        card.style.boxShadow = 'var(--shadow-md)';
    });
}

function animateCardsStagger(cards) {
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('in-view');
        }, index * 150);
    });
}

// ==============================
// ENHANCED EVENTS WITH COUNTDOWN
// ==============================
function initAlumniEvents(data) {
    const eventsGrid = document.getElementById('alumniEvents');
    if (eventsGrid && data.events) {
        eventsGrid.innerHTML = '';
        
        if (!data.events.length) {
            eventsGrid.innerHTML = `
                <div class="no-events-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Upcoming Events</h3>
                    <p>Check back soon for exciting alumni gatherings!</p>
                </div>
            `;
        } else {
            data.events.forEach((event, i) => {
                const card = createEventCard(event, i);
                eventsGrid.appendChild(card);
            });
            
            initEventCountdown();
        }
    }
}

function createEventCard(event, index) {
    const card = document.createElement('div');
    card.className = 'alumni-event-card fade-in event-card';
    card.style.animationDelay = `${index * 0.15}s`;
    const eventDate = new Date(event.date);
    
    card.innerHTML = `
        <div class="event-tag">Upcoming</div>
        <div class="event-icon">
            <i class="${getEventIcon(event.type)}"></i>
        </div>
        <div class="event-content">
            <h4>${event.title}</h4>
            <p class="event-description">${event.description}</p>
            <div class="event-meta">
                <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                <p><i class="fas fa-clock"></i> ${event.time || 'Time TBD'}</p>
                <p><i class="fas fa-calendar"></i> ${formatEventDate(eventDate)}</p>
            </div>
            <div class="countdown" data-date="${event.date}">
                <div class="countdown-timer">
                    <span class="days">00</span>
                    <span class="label">Days</span>
                </div>
                <div class="countdown-timer">
                    <span class="hours">00</span>
                    <span class="label">Hours</span>
                </div>
                <div class="countdown-timer">
                    <span class="minutes">00</span>
                    <span class="label">Minutes</span>
                </div>
            </div>
            <button class="event-btn" onclick="registerForEvent('${event.title}')">
                <i class="fas fa-ticket-alt"></i> Register Now
            </button>
        </div>
    `;
    
    return card;
}

function getEventIcon(type) {
    const icons = {
        'reunion': 'fas fa-users',
        'workshop': 'fas fa-chalkboard-teacher',
        'networking': 'fas fa-network-wired',
        'mentorship': 'fas fa-user-graduate',
        'default': 'fas fa-calendar-star'
    };
    return icons[type?.toLowerCase()] || icons.default;
}

function formatEventDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function initEventCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    function updateCountdowns() {
        const now = new Date().getTime();
        
        countdownElements.forEach(el => {
            const target = new Date(el.dataset.date).getTime();
            const diff = target - now;
            
            if (diff <= 0) {
                el.innerHTML = '<div class="event-happening">Happening Now!</div>';
                return;
            }
            
            const days = Math.floor(diff / (1000*60*60*24));
            const hours = Math.floor((diff % (1000*60*60*24))/(1000*60*60));
            const minutes = Math.floor((diff % (1000*60*60))/(1000*60));
            
            el.querySelector('.days').textContent = days.toString().padStart(2, '0');
            el.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
            el.querySelector('.minutes').textContent = minutes.toString().padStart(2, '0');
        });
    }
    
    // Update every minute
    setInterval(updateCountdowns, 60000);
    updateCountdowns(); // Initial update
}

// ==============================
// ENHANCED SEARCH AND FILTER
// ==============================
function initSearchAndFilter() {
    const notableGrid = document.getElementById('notableAlumni');
    if (!notableGrid) return;
    
    // Create enhanced search interface
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="search-wrapper">
            <div class="search-input-group">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="alumni-search" placeholder="Search alumni by name, batch, or role...">
                <button class="clear-search" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="filter-tags">
                <button class="filter-tag active" data-filter="all">All Alumni</button>
                <button class="filter-tag" data-filter="recent">Recent Graduates</button>
                <button class="filter-tag" data-filter="executive">Executives</button>
                <button class="filter-tag" data-filter="academic">Academia</button>
            </div>
        </div>
    `;
    
    notableGrid.parentNode.insertBefore(searchContainer, notableGrid);
    
    // Event listeners
    const searchInput = searchContainer.querySelector('.alumni-search');
    const clearButton = searchContainer.querySelector('.clear-search');
    const filterTags = searchContainer.querySelectorAll('.filter-tag');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterAlumni(query, getActiveFilter());
        toggleClearButton(query, clearButton);
    });
    
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        filterAlumni('', getActiveFilter());
        toggleClearButton('', clearButton);
        searchInput.focus();
    });
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterAlumni(searchInput.value.toLowerCase(), tag.dataset.filter);
        });
    });
}

function toggleClearButton(query, button) {
    button.style.display = query ? 'block' : 'none';
}

function getActiveFilter() {
    const activeTag = document.querySelector('.filter-tag.active');
    return activeTag ? activeTag.dataset.filter : 'all';
}

function filterAlumni(query, filter) {
    const cards = document.querySelectorAll('#notableAlumni .alumni-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const name = card.dataset.name;
        const batch = card.dataset.batch.toLowerCase();
        const role = card.dataset.role;
        
        let matchesQuery = true;
        let matchesFilter = true;
        
        if (query) {
            matchesQuery = name.includes(query) || batch.includes(query) || role.includes(query);
        }
        
        if (filter && filter !== 'all') {
            const batchYear = parseInt(card.dataset.batch) || 0;
            const currentYear = new Date().getFullYear();
            
            switch (filter) {
                case 'recent':
                    matchesFilter = currentYear - batchYear <= 10;
                    break;
                case 'executive':
                    matchesFilter = role.includes('ceo') || role.includes('director') || role.includes('manager');
                    break;
                case 'academic':
                    matchesFilter = role.includes('professor') || role.includes('researcher') || role.includes('teacher');
                    break;
            }
        }
        
        const shouldShow = matchesQuery && matchesFilter;
        card.style.display = shouldShow ? 'block' : 'none';
        card.style.opacity = shouldShow ? '1' : '0';
        card.style.transform = shouldShow ? 'scale(1)' : 'scale(0.8)';
        
        if (shouldShow) visibleCount++;
    });
    
    // Show/hide no results message
    showNoResults(visibleCount === 0);
}

function showNoResults(show) {
    let noResults = document.querySelector('.no-results');
    
    if (show && !noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No alumni found</h3>
            <p>Try adjusting your search criteria or filters</p>
        `;
        document.getElementById('notableAlumni').appendChild(noResults);
    } else if (!show && noResults) {
        noResults.remove();
    }
}

// ==============================
// ENHANCED FORM FEATURES
// ==============================
function initFormEnhancements() {
    const form = document.querySelector('.alumni-form');
    if (!form) return;
    
    // Enhanced file upload with drag & drop
    initFileUpload();
    
    // Real-time validation
    initFormValidation(form);
    
    // Enhanced submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Add form animations
    animateFormElements();
}

function initFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const wrapper = input.parentElement;
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        wrapper.appendChild(preview);
        
        // Enhanced drag & drop
        ['dragover', 'dragenter'].forEach(eventName => {
            input.addEventListener(eventName, (e) => {
                e.preventDefault();
                wrapper.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            input.addEventListener(eventName, (e) => {
                e.preventDefault();
                wrapper.classList.remove('dragover');
                if (eventName === 'drop') {
                    handleFileDrop(e, input, preview);
                }
            });
        });
        
        input.addEventListener('change', () => {
            handleFileSelection(input, preview);
        });
    });
}

function handleFileDrop(e, input, preview) {
    const files = e.dataTransfer.files;
    const dt = new DataTransfer();
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            dt.items.add(file);
        }
    });
    
    input.files = dt.files;
    handleFileSelection(input, preview);
}

function handleFileSelection(input, preview) {
    preview.innerHTML = '';
    const files = Array.from(input.files || []);
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-preview';
            imgContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            imgContainer.querySelector('.remove-image').addEventListener('click', () => {
                imgContainer.remove();
                // Remove from input
                const dt = new DataTransfer();
                Array.from(input.files).forEach(f => {
                    if (f !== file) dt.items.add(f);
                });
                input.files = dt.files;
            });
            
            preview.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    });
}

function initFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    
    if (!isValid) {
        showFieldError(field, message);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentElement.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) errorElement.remove();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please correct the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    // Actual API submission
    fetch('/api/static/register-alumni', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            form.reset();
            document.querySelectorAll('.file-preview').forEach(preview => preview.innerHTML = '');
            showNotification(data.message || 'Thank you for joining our alumni network!', 'success');
        } else {
            throw new Error(data.message || 'Submission failed');
        }
    })
    .catch(error => {
        console.error('Submission error:', error);
        showNotification('There was an error submitting your registration. Please try again.', 'error');
    })
    .finally(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Manual close
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
}

function animateFormElements() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        setTimeout(() => {
            group.style.transition = 'all 0.5s ease-out';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ==============================
// SCROLL ANIMATIONS
// ==============================
function initScrollAnimations() {
    // Add custom scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.fade-in:not(.in-view)');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('in-view');
            }
        });
    };
    
    // Throttled scroll event
    let ticking = false;
    const throttledScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                animateOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    };
    
    window.addEventListener('scroll', throttledScroll);
    animateOnScroll(); // Initial check
}

function initIntersectionObservers() {
    // Enhanced intersection observer for better performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Add special animations for specific elements
                if (entry.target.classList.contains('alumni-card')) {
                    entry.target.style.transform = 'translateY(0) rotateX(0deg)';
                }
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initParallaxEffects() {
    // Subtle parallax for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.alumni-hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ==============================
// UTILITY FUNCTIONS
// ==============================
function viewProfile(name) {
    // Create modal or navigate to profile page
    showNotification(`Viewing profile for ${name}`, 'info');
}

function registerForEvent(eventTitle) {
    showNotification(`Registration opened for: ${eventTitle}`, 'success');
    // Scroll to registration form
    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
}

// ==============================
// PERFORMANCE OPTIMIZATIONS
// ==============================
// Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initLazyLoading);
