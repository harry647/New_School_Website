/**
 * Applied Sciences Department JavaScript Module
 * Professional, accessible, and efficient frontend integration
 * @version 2.0.0
 * @author Bar Union Secondary School
 */

class AppliedSciencesDepartment {
  constructor() {
    this.DATA = {};
    this.currentSession = "";
    this.currentSearchTerm = "";
    this.currentContentType = "all";
    this.isLoading = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    
    // Configuration
    this.config = {
      api: {
        timeout: 10000,
        baseURL: '/api/departments/applied-sciences'
      },
      upload: {
        maxSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 20,
        allowedTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'
        ]
      },
      ui: {
        searchDebounce: 300,
        animationDuration: 300
      }
    };
  }

  // ==================== INITIALIZATION ====================
  async init() {
    try {
      const loggedIn = await this.isLoggedIn();
      
      if (!loggedIn) {
        this.showLoginPrompt();
        return;
      }

      this.showLoadingState();
      await this.loadDepartmentData();
      this.initializeEventListeners();
      this.showMainContent();
      
    } catch (error) {
      console.error('Initialization error:', error);
      this.showErrorState('Failed to initialize Applied Sciences page');
    }
  }

  // ==================== AUTHENTICATION ====================
  async isLoggedIn() {
    try {
      const response = await fetch('/auth/check', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.loggedIn === true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.showAlert('Authentication service temporarily unavailable', 'warning');
      return false;
    }
  }

  // ==================== UI STATE MANAGEMENT ====================
  showLoginPrompt() {
    document.getElementById('loginCheck').classList.remove('d-none');
  }

  showLoadingState() {
    document.getElementById('loadingState').classList.remove('d-none');
  }

  showMainContent() {
    document.getElementById('mainContent').classList.remove('d-none');
  }

  // ==================== DATA LOADING ====================
  async loadDepartmentData() {
    try {
      this.setLoadingState(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.api.timeout);
      
      const response = await fetch(this.config.api.baseURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      this.DATA = await response.json();
      
      if (!this.DATA || typeof this.DATA !== 'object') {
        throw new Error('Invalid data format received from API');
      }

      this.renderAll();
      this.populateSessionFilter();
      this.retryCount = 0; // Reset retry count on success
      
    } catch (error) {
      console.error('Data loading error:', error);
      this.handleLoadError(error);
    } finally {
      this.setLoadingState(false);
    }
  }

  async handleLoadError(error) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.showAlert(`Retrying... (${this.retryCount}/${this.maxRetries})`, 'info');
      
      setTimeout(() => {
        this.loadDepartmentData();
      }, 2000 * this.retryCount); // Exponential backoff
    } else {
      this.showErrorInSections();
      this.showAlert('Unable to load Applied Sciences content after multiple attempts. Please refresh the page.', 'danger');
    }
  }

  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    const sections = ['subjectsGrid', 'teachersGrid', 'resourcesGrid', 'eventsGrid', 'mediaGrid'];
    
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.setAttribute('aria-busy', isLoading ? 'true' : 'false');
      }
    });
  }

  // ==================== EVENT LISTENERS ====================
  initializeEventListeners() {
    // Session filter
    const sessionFilter = document.getElementById('sessionFilter');
    if (sessionFilter) {
      sessionFilter.addEventListener('change', (e) => {
        this.currentSession = e.target.value;
        this.applyAllFilters();
      });
    }

    // Content type filters
    const contentTypeRadios = document.querySelectorAll('input[name="contentType"]');
    contentTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentContentType = e.target.value;
        this.applyAllFilters();
      });
    });

    // Initialize search with debouncing
    this.initializeSearch();
    
    // Setup drag and drop upload
    this.setupDragAndDropUpload();
  }

  initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.currentSearchTerm = searchInput.value.trim().toLowerCase();
        this.applyAllFilters();
      }, this.config.ui.searchDebounce);
    });
  }

  // ==================== FILTERING ====================
  applyAllFilters() {
    let filtered = {
      subjects: this.DATA.subjects || [],
      teachers: this.DATA.teachers || [],
      resources: this.DATA.resources || [],
      events: this.DATA.events || [],
      media: this.DATA.media || []
    };

    // Apply search filter
    if (this.currentSearchTerm) {
      filtered = this.applySearchFilter(filtered);
    }

    // Apply session filter
    if (this.currentSession) {
      filtered = this.applySessionFilter(filtered);
    }

    // Apply content type filter
    if (this.currentContentType !== 'all') {
      filtered = this.applyContentTypeFilter(filtered);
    }

    this.renderAll(filtered);
  }

  applySearchFilter(filtered) {
    const searchTerm = this.currentSearchTerm;
    
    filtered.subjects = filtered.subjects.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.teacher.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    );
    
    filtered.resources = filtered.resources.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.uploadedBy.toLowerCase().includes(searchTerm)
    );
    
    filtered.events = filtered.events.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      (item.location && item.location.toLowerCase().includes(searchTerm))
    );
    
    filtered.media = filtered.media.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.uploadedBy.toLowerCase().includes(searchTerm)
    );

    return filtered;
  }

  applySessionFilter(filtered) {
    const session = this.currentSession;
    
    filtered.subjects = filtered.subjects.filter(s => !s.session || s.session === session);
    filtered.resources = filtered.resources.filter(r => !r.session || r.session === session);
    filtered.events = filtered.events.filter(e => !e.session || e.session === session);
    filtered.media = filtered.media.filter(m => !m.session || m.session === session);

    return filtered;
  }

  applyContentTypeFilter(filtered) {
    const keys = Object.keys(filtered);
    keys.forEach(key => {
      if (key !== this.currentContentType) {
        filtered[key] = [];
      }
    });

    return filtered;
  }

  // ==================== RENDERING ====================
  renderAll(filteredData = this.DATA) {
    this.renderSubjects(filteredData.subjects);
    this.renderTeachers(filteredData.teachers);
    this.renderResources(filteredData.resources);
    this.renderEvents(filteredData.events);
    this.renderMedia(filteredData.media);
  }

  renderSubjects(subjects) {
    const grid = document.getElementById('subjectsGrid');
    if (!grid) return;

    const subjectData = subjects || [];
    
    if (subjectData.length === 0) {
      grid.innerHTML = this.createEmptyState('subjects');
      return;
    }

    grid.innerHTML = subjectData.map(subject => this.createSubjectCard(subject)).join('');
  }

  renderTeachers(teachers) {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;

    const teacherData = teachers || [];
    
    if (teacherData.length === 0) {
      grid.innerHTML = this.createEmptyState('teachers');
      return;
    }

    grid.innerHTML = teacherData.map(teacher => this.createTeacherCard(teacher)).join('');
    this.initializeLazyLoading();
  }

  renderResources(resources) {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;

    const resourceData = resources || [];
    
    if (resourceData.length === 0) {
      grid.innerHTML = this.createEmptyState('resources');
      return;
    }

    grid.innerHTML = resourceData.map(resource => this.createResourceCard(resource)).join('');
  }

  renderEvents(events) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;

    const eventData = events || [];
    
    if (eventData.length === 0) {
      grid.innerHTML = this.createEmptyState('events');
      return;
    }

    grid.innerHTML = eventData.map(event => this.createEventCard(event)).join('');
  }

  renderMedia(media) {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    const mediaData = media || [];
    
    if (mediaData.length === 0) {
      grid.innerHTML = this.createEmptyState('media');
      return;
    }

    grid.innerHTML = mediaData.map(item => this.createMediaCard(item)).join('');
  }

  // ==================== CARD CREATION ====================
  createSubjectCard(subject) {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="subject-card p-5 text-center h-100 glass-card shadow-sm" 
                 role="article" 
                 aria-labelledby="subject-${subject.name.replace(/\s+/g, '-').toLowerCase()}">
          <div class="subject-icon mb-3">
            <i class="fas ${subject.icon || 'fa-flask'} fa-3x text-white"></i>
          </div>
          <h3 id="subject-${subject.name.replace(/\s+/g, '-').toLowerCase()}" class="subject-title">
            ${this.highlightSearchTerm(subject.name)}
          </h3>
          <p class="subject-teacher">
            <strong>Teacher:</strong> ${this.highlightSearchTerm(subject.teacher)}
          </p>
          <p class="subject-description">
            ${this.highlightSearchTerm(subject.description)}
          </p>
          <span class="badge bg-info" aria-label="Academic year ${subject.session || 'All Years'}">
            ${subject.session || 'All Years'}
          </span>
        </article>
      </div>
    `;
  }

  createTeacherCard(teacher) {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="teacher-card text-center p-4 glass-card" 
                 role="article"
                 aria-labelledby="teacher-${teacher.name.replace(/\s+/g, '-').toLowerCase()}">
          <img src="${teacher.photo || '/assets/images/defaults/teacher.png'}"
               class="teacher-image lazy rounded-circle mb-3 shadow"
               width="120" height="120" 
               alt="Photo of ${teacher.name}"
               loading="lazy"
               data-src="${teacher.photo || '/assets/images/defaults/teacher.png'}">
          <h4 id="teacher-${teacher.name.replace(/\s+/g, '-').toLowerCase()}" class="teacher-name">
            ${teacher.name}
          </h4>
          <p class="teacher-subjects">
            ${teacher.subjects?.join(" • ") || "Applied Sciences"}
          </p>
          <a href="mailto:${teacher.email}" 
             class="btn btn-outline-primary btn-sm"
             aria-label="Email ${teacher.name}">
            <i class="fas fa-envelope me-1" aria-hidden="true"></i>
            Contact
          </a>
        </article>
      </div>
    `;
  }

  createResourceCard(resource) {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="resource-card p-4 glass-card h-100" 
                 role="article"
                 aria-labelledby="resource-${resource.title.replace(/\s+/g, '-').toLowerCase()}">
          <div class="resource-icon">
            <i class="fas ${this.getFileIcon(resource.type)} fa-2x" style="color: ${resource.color || '#28a745'}"></i>
          </div>
          <h5 id="resource-${resource.title.replace(/\s+/g, '-').toLowerCase()}" class="resource-title">
            ${this.highlightSearchTerm(resource.title)}
          </h5>
          <p class="resource-meta">
            <strong>By:</strong> ${this.highlightSearchTerm(resource.uploadedBy)} • 
            <strong>Date:</strong> ${this.formatDate(resource.date)}
          </p>
          <a href="${resource.url}" 
             class="btn btn-outline-success btn-sm w-100 mt-auto" 
             download
             aria-label="Download ${resource.title}">
            <i class="fas fa-download me-1" aria-hidden="true"></i>
            Download ${resource.type === 'video' ? 'Video' : 'File'}
          </a>
        </article>
      </div>
    `;
  }

  createEventCard(event) {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="event-card p-4 glass-card text-white" 
                 style="background: ${event.color || '#1a5d57'};" 
                 role="article"
                 aria-labelledby="event-${event.title.replace(/\s+/g, '-').toLowerCase()}">
          <h5 id="event-${event.title.replace(/\s+/g, '-').toLowerCase()}" class="fw-bold">
            ${this.highlightSearchTerm(event.title)}
          </h5>
          <p class="small opacity-90 mb-2">
            <i class="fas fa-calendar me-1" aria-hidden="true"></i>
            ${new Date(event.date).toLocaleDateString('en-KE', { 
              weekday: 'long', month: 'long', day: 'numeric' 
            })}
          </p>
          ${event.time ? `
            <p class="small opacity-90">
              <i class="fas fa-clock me-1" aria-hidden="true"></i>
              ${event.time}
            </p>
          ` : ''}
          ${event.location ? `
            <p class="small opacity-90">
              <i class="fas fa-map-marker-alt me-1" aria-hidden="true"></i>
              ${this.highlightSearchTerm(event.location)}
            </p>
          ` : ''}
          <p class="mt-3">${this.highlightSearchTerm(event.description)}</p>
        </article>
      </div>
    `;
  }

  createMediaCard(media) {
    const mediaId = media.title.replace(/\s+/g, '-').toLowerCase();
    
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="media-card glass-card overflow-hidden" 
                 role="article"
                 aria-labelledby="media-${mediaId}">
          ${media.type === 'video'
            ? `<video controls class="w-100" poster="${media.thumbnail || ''}">
                 <source src="${media.url}" type="video/mp4">
                 Your browser does not support video.
               </video>`
            : `<img src="${media.url}" 
                    class="img-fluid" 
                    alt="${this.highlightSearchTerm(media.title)}" 
                    loading="lazy">`
          }
          <div class="p-3">
            <h5 id="media-${mediaId}">${this.highlightSearchTerm(media.title)}</h5>
            <p class="text-muted small mb-0">
              <strong>By:</strong> ${this.highlightSearchTerm(media.uploadedBy)} • 
              <strong>Date:</strong> ${this.formatDate(media.date)}
            </p>
          </div>
        </article>
      </div>
    `;
  }

  // ==================== EMPTY STATES ====================
  createEmptyState(type) {
    const messages = {
      subjects: {
        icon: 'fa-book',
        title: 'No Subjects Found',
        message: 'No subjects match your current search criteria.'
      },
      teachers: {
        icon: 'fa-users',
        title: 'No Teachers Listed',
        message: 'Teacher information will be displayed here when available.'
      },
      resources: {
        icon: 'fa-file-alt',
        title: 'No Resources Available',
        message: 'Upload resources using the button above to get started.'
      },
      events: {
        icon: 'fa-calendar',
        title: 'No Upcoming Events',
        message: 'Events and competitions will be announced here.'
      },
      media: {
        icon: 'fa-photo-video',
        title: 'No Media Available',
        message: 'Photos and videos will be displayed here when available.'
      }
    };

    const config = messages[type] || messages.subjects;

    return `
      <div class="col-12 text-center py-5">
        <i class="fas ${config.icon} fa-3x text-muted mb-3" aria-hidden="true"></i>
        <h4 class="text-muted">${config.title}</h4>
        <p class="text-muted">${config.message}</p>
      </div>
    `;
  }

  // ==================== SESSION FILTER ====================
  populateSessionFilter() {
    const filter = document.getElementById('sessionFilter');
    if (!filter) return;

    const sessions = [...new Set([
      ...this.DATA.subjects?.map(s => s.session).filter(Boolean) || [],
      ...this.DATA.resources?.map(r => r.session).filter(Boolean) || [],
      ...this.DATA.events?.map(e => e.session).filter(Boolean) || [],
      ...this.DATA.media?.map(m => m.session).filter(Boolean) || []
    ])].sort().reverse();

    // Clear existing options except the first one
    while (filter.children.length > 1) {
      filter.removeChild(filter.lastChild);
    }

    sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session;
      option.textContent = session;
      filter.appendChild(option);
    });
  }

  // ==================== FILE UPLOAD ====================
  setupDragAndDropUpload() {
    const fileInput = document.getElementById('fileUpload');
    const dropZone = document.getElementById('dropZone');
    
    if (!fileInput || !dropZone) return;

    // Drag and drop events
    fileInput.parentElement.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.remove('d-none');
      dropZone.classList.add('border-primary', 'bg-primary', 'bg-opacity-10');
    });

    fileInput.parentElement.addEventListener('dragleave', (e) => {
      e.preventDefault();
      if (!dropZone.contains(e.relatedTarget)) {
        dropZone.classList.add('d-none');
        dropZone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
      }
    });

    fileInput.parentElement.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.add('d-none');
      dropZone.classList.remove('border-primary', 'bg-primary', 'bg-opacity-10');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        this.uploadFilesWithProgress(files);
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.uploadFilesWithProgress(e.target.files);
      }
    });
  }

  async uploadFilesWithProgress(files) {
    if (files.length === 0) return;

    // Validate files
    const validation = this.validateFiles(files);
    if (!validation.valid) {
      this.showAlert(validation.message, 'danger');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    // Show progress UI
    this.showUploadProgress();
    this.updateUploadProgress(0, `Uploading ${files.length} file(s)...`);

    try {
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          this.updateUploadProgress(percentComplete, `Uploading ${files.length} file(s)...`);
        }
      });

      // Completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            this.showAlert(`Successfully uploaded ${files.length} file(s)!`, 'success');
            this.hideUploadProgress();
            this.loadDepartmentData(); // Refresh resources
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Error handling
      xhr.addEventListener('error', () => {
        this.showAlert('Network error during upload. Please try again.', 'danger');
        this.hideUploadProgress();
      });

      xhr.open('POST', '/api/departments/applied-sciences/upload');
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      this.showAlert('Upload failed. Please try again.', 'danger');
      this.hideUploadProgress();
    }
  }

  validateFiles(files) {
    if (files.length > this.config.upload.maxFiles) {
      return {
        valid: false,
        message: `Maximum ${this.config.upload.maxFiles} files allowed`
      };
    }

    for (const file of files) {
      if (file.size > this.config.upload.maxSize) {
        return {
          valid: false,
          message: `File ${file.name} is too large. Maximum size is ${this.config.upload.maxSize / (1024 * 1024)}MB`
        };
      }
      if (!this.config.upload.allowedTypes.includes(file.type)) {
        return {
          valid: false,
          message: `File ${file.name} has an unsupported format`
        };
      }
    }

    return { valid: true };
  }

  showUploadProgress() {
    document.getElementById('uploadProgress').classList.remove('d-none');
  }

  hideUploadProgress() {
    setTimeout(() => {
      document.getElementById('uploadProgress').classList.add('d-none');
    }, 2000);
  }

  updateUploadProgress(percent, message) {
    const progressBar = document.getElementById('progressBar');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (progressBar) {
      progressBar.style.width = percent + '%';
      progressBar.textContent = Math.round(percent) + '%';
      progressBar.setAttribute('aria-valuenow', Math.round(percent));
    }
    
    if (uploadStatus) {
      uploadStatus.textContent = message;
    }
  }

  // ==================== UTILITIES ====================
  getFileIcon(type) {
    const icons = {
      pdf: 'fa-file-pdf',
      doc: 'fa-file-word',
      video: 'fa-file-video',
      image: 'fa-file-image',
      ppt: 'fa-file-powerpoint'
    };
    return icons[type] || 'fa-file-alt';
  }

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  highlightSearchTerm(text) {
    if (!this.currentSearchTerm || !text) return text;
    
    const regex = new RegExp(`(${this.currentSearchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning">$1</mark>');
  }

  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top:20px; right:20px; z-index:9999; max-width: 400px;';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  showErrorInSections() {
    const sections = ['subjectsGrid', 'teachersGrid', 'resourcesGrid', 'eventsGrid', 'mediaGrid'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.innerHTML = `
          <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3" aria-hidden="true"></i>
            <p class="text-muted">Failed to load content. Please try refreshing the page.</p>
            <button class="btn btn-outline-primary btn-sm" onclick="appliedSciences.loadDepartmentData()">
              <i class="fas fa-refresh me-1" aria-hidden="true"></i>
              Retry
            </button>
          </div>
        `;
      }
    });
  }

  // ==================== LAZY LOADING ====================
  initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }
}

// ==================== GLOBAL INSTANCE & INITIALIZATION ====================
let appliedSciences;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  appliedSciences = new AppliedSciencesDepartment();
  await appliedSciences.init();
});

// Make global functions available for HTML onclick handlers
window.scrollToSection = function(sectionId) {
  if (appliedSciences) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Focus management for accessibility
      element.setAttribute('tabindex', '-1');
      element.focus();
    }
  }
};