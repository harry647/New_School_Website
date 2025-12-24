// ==================================================
// NEWS & EVENTS PAGE – BAR UNION MIXED SECONDARY SCHOOL
// STUNNING 2025–2026 ULTRA-PREMIUM EDITION
// Advanced JavaScript with Micro-interactions & Animations
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // ===================== ENHANCED UTILITIES =====================
  
  // Enhanced formatDate with better localization
  const formatDate = (dateStr) => {
    const options = { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      weekday: "long"
    };
    return new Date(dateStr).toLocaleDateString("en-KE", options);
  };

  // Enhanced reading time calculation
  const readingTime = (text = "") => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time < 1 ? 1 : time;
  };

  // Enhanced smooth scroll function
  const smoothScrollTo = (target, duration = 800) => {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop - 90; // Account for fixed header
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    const ease = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  };

  // Enhanced DOM manipulation utilities
  const createElement = (tag, className = "", innerHTML = "") => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  };

  const removeLoader = (parent) => {
    const loader = parent?.querySelector(".loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 300);
    }
  };

  // Enhanced fade-in animation
  const fadeIn = (element, duration = 600) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";
    element.style.transition = `all ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    });
  };

  // ===================== ENHANCED STATE MANAGEMENT =====================
  
  let allNews = [], filteredNews = [], visibleNews = 6, increment = 6;
  let allBlogs = [], filteredBlogs = [], visibleBlogs = 6, blogsIncrement = 6;
  let allEvents = [];
  let searchTimeout;

  // Enhanced debounce function
  const debounce = (func, wait) => {
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(searchTimeout);
        func(...args);
      };
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(later, wait);
    };
  };

  // ===================== DOM ELEMENTS =====================
  const elements = {
    newsGrid: document.getElementById("newsGrid"),
    featuredNewsWrapper: document.getElementById("featuredNews"),
    blogGrid: document.getElementById("blogGrid"),
    eventPhotosGrid: document.getElementById("eventPhotos"),
    downloadsResources: document.getElementById("downloadsResources"),
    eventsCalendar: document.getElementById("eventsCalendar"),
    searchInput: document.getElementById("newsSearch"),
    blogSearchInput: document.getElementById("blogSearch"),
    filterBtns: document.querySelectorAll("#latest-news .filter-btn"),
    blogFilterBtns: document.querySelectorAll(".blog-controls .filter-btn"),
    loadMoreBtn: document.getElementById("loadMoreBtn"),
    loadMoreBlogsBtn: document.getElementById("loadMoreBlogs"),
    noResults: document.getElementById("noResults"),
    noBlogResults: document.getElementById("noBlogResults")
  };

  // Stats elements
  const statsElements = {
    totalNewsEl: document.getElementById("totalNews"),
    totalEventsEl: document.getElementById("totalEvents"),
    totalAchievementsEl: document.getElementById("totalAchievements"),
    totalBlogsEl: document.getElementById("totalBlogs"),
    activeBloggersEl: document.getElementById("activeBloggers"),
    popularTopicEl: document.getElementById("mostPopularTopic")
  };

  const constants = {
    DEFAULT_IMG: "/assets/images/defaults/default-news.jpg",
    DEFAULT_BLOG_IMG: "/assets/images/defaults/default-gallery.jpg",
    DEFAULT_AVATAR: "/assets/images/defaults/default-user.png"
  };

  // ===================== ENHANCED DATA FETCHING =====================
  const fetchJSON = async (path, fallback = []) => {
    try {
      const res = await fetch(path + `?t=${Date.now()}`, { 
        cache: "no-store",
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
      const data = await res.json();
      console.log(`✅ Successfully loaded ${path}:`, data.length, 'items');
      return data;
    } catch (e) {
      console.warn(`❌ Failed to load ${path}:`, e);
      return fallback;
    }
  };

  // ===================== ENHANCED NEWS RENDERING =====================
  const renderNews = () => {
    if (!elements.newsGrid) return;

    const items = filteredNews.slice(0, visibleNews);
    elements.newsGrid.innerHTML = "";

    if (items.length === 0) {
      elements.noResults.style.display = "block";
      elements.loadMoreBtn.style.display = "none";
      return;
    }

    elements.noResults.style.display = "none";

    const frag = document.createDocumentFragment();
    

    items.forEach((item, index) => {
      const card = createElement("article", "news-card");
      card.dataset.category = (item.category || "general").toLowerCase();
      card.style.animationDelay = `${index * 0.1}s`;

      const catLabel = (item.category || "news").charAt(0).toUpperCase() +
                      (item.category || "news").slice(1);
      const readTime = readingTime(item.excerpt || "");

      card.innerHTML = `
        <div class="news-thumb">
          <img src="${item.image || constants.DEFAULT_IMG}" 
               alt="${item.title}" 
               loading="lazy"
               onerror="this.src='${constants.DEFAULT_IMG}'">
          <span class="news-tag">${catLabel}</span>
        </div>
        <div class="news-body">
          <span class="news-date">${formatDate(item.date)} • ${readTime} min read</span>
          <h3>${item.title}</h3>
          <p>${item.excerpt || ""}</p>
          <a href="${item.link || '#'}" class="read-more" aria-label="Read more about ${item.title}">
            Read More <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;

      // Enhanced hover effects
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.02)';
      });
      

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });

      frag.appendChild(card);
      fadeIn(card, 800);
    });

    elements.newsGrid.appendChild(frag);
    elements.loadMoreBtn.style.display = visibleNews < filteredNews.length ? "block" : "none";
    removeLoader(elements.newsGrid);
  };

  // ===================== ENHANCED BLOG RENDERING =====================
  const renderBlogs = () => {
    if (!elements.blogGrid) return;

    const items = filteredBlogs.slice(0, visibleBlogs);

    if (items.length === 0) {
      elements.blogGrid.innerHTML = "";
      elements.noBlogResults.style.display = "block";
      elements.loadMoreBlogsBtn.style.display = "none";
      return;
    }

    elements.noBlogResults.style.display = "none";

    const frag = document.createDocumentFragment();
    

    items.forEach((blog, index) => {
      const card = createElement("div", "blog-card");
      card.dataset.topic = (blog.topic || "general").toLowerCase();
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <img src="${blog.image || constants.DEFAULT_BLOG_IMG}" 
             alt="${blog.title}" 
             loading="lazy"
             onerror="this.src='${constants.DEFAULT_BLOG_IMG}'">
        <div class="blog-body">
          <h4>${blog.title}</h4>
          <p class="blog-excerpt">${blog.excerpt || "No preview available."}</p>
          <div class="blog-meta">
            <span><i class="fas fa-user"></i> ${blog.author || "Student"}</span>
            <span><i class="fas fa-calendar"></i> ${formatDate(blog.date)}</span>
            <span><i class="fas fa-clock"></i> ${readingTime(blog.excerpt || "")} min read</span>
          </div>
          <a href="${blog.link || '#'}" class="read-more" aria-label="Read full blog by ${blog.author}">
            Read Full Blog <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      `;

      // Enhanced card interactions
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-20px) scale(1.03)';
        const img = card.querySelector('img');
        if (img) img.style.transform = 'scale(1.1)';
      });
      

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        const img = card.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      });

      frag.appendChild(card);
      fadeIn(card, 600);
    });

    elements.blogGrid.appendChild(frag);
    elements.loadMoreBlogsBtn.style.display = visibleBlogs < filteredBlogs.length ? "block" : "none";
    removeLoader(elements.blogGrid);
  };

  // ===================== ENHANCED EVENT CALENDAR =====================
  const renderEventsCalendar = (events = []) => {
    if (!elements.eventsCalendar) return;
    elements.eventsCalendar.innerHTML = "";
    

    if (events.length === 0) {
      elements.eventsCalendar.innerHTML = `
        <div class="no-events-message">
          <i class="fas fa-calendar-times fa-3x"></i>
          <h3>No Upcoming Events</h3>
          <p>Check back soon for exciting events!</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    

    events.forEach((ev, index) => {
      const div = createElement("div", "event-item");
      div.style.animationDelay = `${index * 0.2}s`;
      

      const eventDate = new Date(ev.date);
      const formattedDate = eventDate.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long", 
        year: "numeric"
      });

      div.innerHTML = `
        <div class="event-date">${formattedDate}</div>
        <h3>${ev.title}</h3>
        <ul>
          <li><strong>Time:</strong> ${ev.time || "TBA"}</li>
          <li><strong>Venue:</strong> ${ev.venue || "Main Hall"}</li>
          <li><strong>Organizer:</strong> ${ev.organizer || "School Administration"}</li>
          ${ev.description ? `<li><strong>Details:</strong> ${ev.description}</li>` : ""}
        </ul>
        <div class="event-cta">
          <button class="btn btn-primary" onclick="registerForEvent('${ev.id}')">
            <i class="fas fa-calendar-plus"></i> Register
          </button>
        </div>
      `;

      // Enhanced event card hover effects
      div.addEventListener('mouseenter', () => {
        div.style.transform = 'translateY(-20px) scale(1.05)';
      });
      

      div.addEventListener('mouseleave', () => {
        div.style.transform = 'translateY(0) scale(1)';
      });

      frag.appendChild(div);
      fadeIn(div, 700);
    });

    elements.eventsCalendar.appendChild(frag);
  };

  // ===================== ENHANCED EVENT PHOTOS =====================
  const renderEventPhotos = (photos = []) => {
    if (!elements.eventPhotosGrid) return;
    elements.eventPhotosGrid.innerHTML = "";
    

    if (photos.length === 0) {
      elements.eventPhotosGrid.innerHTML = `
        <div class="no-photos-message">
          <i class="fas fa-images fa-3x"></i>
          <h3>No Event Photos Available</h3>
          <p>Photos from recent events will appear here!</p>
        </div>
      `;
      return;
    }
   

    const frag = document.createDocumentFragment();
    

    photos.forEach((photo, index) => {
      const div = createElement("div", "photo-item");
      div.style.animationDelay = `${index * 0.15}s`;
      

      const img = createElement("img");
      img.src = photo.image || '/assets/images/defaults/default-news.jpg';
      img.alt = photo.title || 'Event Photo';
      img.loading = "lazy";
      img.onerror = () => { img.src = '/assets/images/defaults/default-news.jpg'; };

      const caption = createElement("div", "photo-caption");
      caption.textContent = photo.title || 'Event Photo';

      // Enhanced image interactions with lightbox effect
      div.addEventListener('click', () => openLightbox(img.src, img.alt));
      div.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.1) rotate(2deg)';
        img.style.filter = 'brightness(1.1)';
      });
      

      div.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1) rotate(0deg)';
        img.style.filter = 'brightness(1)';
      });

      div.appendChild(img);
      div.appendChild(caption);
      frag.appendChild(div);
      fadeIn(div, 500);
    });
  

    elements.eventPhotosGrid.appendChild(frag);
  };

  // ===================== ENHANCED SPOTLIGHT =====================
  const renderSpotlight = (profiles = []) => {
    if (!elements.spotlightProfiles) return;
    elements.spotlightProfiles.innerHTML = "";
    

    if (profiles.length === 0) {
      elements.spotlightProfiles.innerHTML = `
        <div class="no-profiles-message">
          <i class="fas fa-users fa-3x"></i>
          <h3>No Spotlight Profiles</h3>
          <p>Outstanding student and teacher profiles coming soon!</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    

    profiles.forEach((profile, index) => {
      const div = createElement("div", "spotlight-card");
      div.style.animationDelay = `${index * 0.2}s`;
      

      div.innerHTML = `
        <img src="${profile.photo || constants.DEFAULT_AVATAR}" 
             alt="${profile.name || 'Profile'}" 
             loading="lazy"
             onerror="this.src='${constants.DEFAULT_AVATAR}'">
        <h4>${profile.name || "Unnamed"}</h4>
        <p>${profile.role || ""}</p>
        ${profile.achievement ? `<p class="achievement"><i class="fas fa-trophy"></i> ${profile.achievement}</p>` : ""}
      `;

      // Enhanced spotlight card interactions
      div.addEventListener('mouseenter', () => {
        div.style.transform = 'translateY(-15px) scale(1.05)';
        const img = div.querySelector('img');
        if (img) img.style.borderColor = 'var(--gold)';
      });
      

      div.addEventListener('mouseleave', () => {
        div.style.transform = 'translateY(0) scale(1)';
        const img = div.querySelector('img');
        if (img) img.style.borderColor = 'var(--blue)';
      });

      frag.appendChild(div);
      fadeIn(div, 600);
    });

    elements.spotlightProfiles.appendChild(frag);
  };

  // ===================== ENHANCED MEDIA COVERAGE =====================
  const renderMedia = (mediaItems = []) => {
    if (!elements.mediaCoverage) return;
    elements.mediaCoverage.innerHTML = "";
    

    if (mediaItems.length === 0) {
      elements.mediaCoverage.innerHTML = `
        <div class="no-media-message">
          <i class="fas fa-newspaper fa-3x"></i>
          <h3>No Media Coverage</h3>
          <p>Latest media mentions will appear here!</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    

    mediaItems.forEach((item, index) => {
      const div = createElement("div", "media-card");
      div.style.animationDelay = `${index * 0.15}s`;
      

      const img = createElement("img");
      img.src = item.image || '/assets/images/defaults/default-news.jpg';
      img.alt = item.title || 'Media Coverage';
      img.loading = "lazy";
      img.onerror = () => { img.src = '/assets/images/defaults/default-news.jpg'; };

      const link = createElement("a");
      link.href = item.link || '#';
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      

      const title = createElement("p", "", item.title || '');
      

      // Enhanced media card hover effects
      div.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.08) translateY(-5px)';
        img.style.filter = 'brightness(1.1) contrast(1.1)';
      });
      

      div.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1) translateY(0)';
        img.style.filter = 'brightness(1) contrast(1)';
      });

      link.appendChild(img);
      link.appendChild(title);
      div.appendChild(link);
      frag.appendChild(div);
      fadeIn(div, 500);
    });

    elements.mediaCoverage.appendChild(frag);
  };

  // ===================== ENHANCED DOWNLOADS =====================
  const renderDownloads = (downloads = []) => {
    if (!elements.downloadsResources) return;
    elements.downloadsResources.innerHTML = "";
    

    if (downloads.length === 0) {
      elements.downloadsResources.innerHTML = `
        <div class="no-downloads-message">
          <i class="fas fa-download fa-3x"></i>
          <h3>No Downloads Available</h3>
          <p>New resources will be available soon!</p>
        </div>
      `;
      return;
    }

    const frag = document.createDocumentFragment();
    

    downloads.forEach((file, index) => {
      const a = createElement("a", "download-card");
      a.href = file.link || "#";
      a.style.animationDelay = `${index * 0.1}s`;
      a.setAttribute('download', file.title || 'download');
      a.setAttribute('title', `Download ${file.title}`);
      
      a.innerHTML = `
        <div class="download-icon">
          <i class="fas fa-file-${getFileIcon(file.type || 'pdf')}"></i>
          <span class="download-badge"><i class="fas fa-download"></i></span>
        </div>
        <div class="download-info">
          <h4 class="download-title">${file.title || 'Download'}</h4>
          <p class="download-description">${file.description || 'Click to download'}</p>
          <div class="download-meta">
            <span class="file-type">${file.type || 'PDF'}</span>
            <span class="file-size">${file.size || ''}</span>
          </div>
        </div>
        <div class="download-action">
          <i class="fas fa-arrow-down"></i>
        </div>
      `;

      // Enhanced download card interactions
      a.addEventListener('mouseenter', () => {
        a.style.transform = 'translateY(-10px) scale(1.05)';
        a.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
        const icon = a.querySelector('.download-icon i');
        const badge = a.querySelector('.download-badge');
        const action = a.querySelector('.download-action');
        if (icon) {
          icon.style.transform = 'scale(1.2) rotate(5deg)';
          icon.style.color = 'var(--gold)';
        }
        if (badge) {
          badge.style.transform = 'scale(1.3)';
          badge.style.opacity = '1';
        }
        if (action) {
          action.style.transform = 'translateX(10px)';
          action.style.opacity = '1';
        }
      });
      

      a.addEventListener('mouseleave', () => {
        a.style.transform = 'translateY(0) scale(1)';
        a.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
        const icon = a.querySelector('.download-icon i');
        const badge = a.querySelector('.download-badge');
        const action = a.querySelector('.download-action');
        if (icon) {
          icon.style.transform = 'scale(1) rotate(0deg)';
          icon.style.color = 'var(--blue)';
        }
        if (badge) {
          badge.style.transform = 'scale(1)';
          badge.style.opacity = '0.8';
        }
        if (action) {
          action.style.transform = 'translateX(0)';
          action.style.opacity = '0.7';
        }
      });

      frag.appendChild(a);
      fadeIn(a, 400);
    });

    elements.downloadsResources.appendChild(frag);
  };

  // Helper function to get file icon
  const getFileIcon = (type) => {
    const icons = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'ppt': 'file-powerpoint',
      'pptx': 'file-powerpoint',
      'zip': 'file-archive',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'gif': 'file-image',
      'mp4': 'file-video',
      'mp3': 'file-audio'
    };
    return icons[type.toLowerCase()] || 'file';
  };

  // ===================== ENHANCED SEARCH & FILTER =====================
  const applyNewsFilters = () => {
    const term = (elements.searchInput?.value || "").toLowerCase().trim();
    const activeFilter = document.querySelector("#latest-news .filter-btn.active")?.dataset.filter || "all";

    let filtered = allNews;

    if (activeFilter !== "all") {
      filtered = filtered.filter(n => (n.category || "general").toLowerCase() === activeFilter);
    }
    

    if (term) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        (n.excerpt || "").toLowerCase().includes(term) ||
        (n.category || "").toLowerCase().includes(term)
      );
    }

    filteredNews = filtered;
    visibleNews = 6;
    

    // Enhanced search feedback
    if (term) {
      console.log(`🔍 Search for "${term}" found ${filteredNews.length} results`);
    }
    

    renderNews();
  };

  const applyBlogFilters = () => {
    const term = (elements.blogSearchInput?.value || "").toLowerCase().trim();
    const activeFilter = document.querySelector(".blog-controls .filter-btn.active")?.dataset.filter || "all";

    let filtered = allBlogs;

    if (activeFilter !== "all") {
      filtered = filtered.filter(b => (b.topic || "general").toLowerCase() === activeFilter);
    }
    

    if (term) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(term) ||
        (b.author || "").toLowerCase().includes(term) ||
        (b.topic || "").toLowerCase().includes(term) ||
        (b.excerpt || "").toLowerCase().includes(term)
      );
    }

    filteredBlogs = filtered;
    visibleBlogs = 6;
    renderBlogs();
  };

  // ===================== ENHANCED EVENT LISTENERS =====================
  

  // Enhanced search with debouncing
  elements.searchInput?.addEventListener('input', debounce(applyNewsFilters, 300));
  elements.blogSearchInput?.addEventListener('input', debounce(applyBlogFilters, 300));

  // Enhanced filter buttons
  elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      elements.filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.transform = 'scale(1)';
      });
      

      // Add active class to clicked button with animation
      btn.classList.add('active');
      btn.style.transform = 'scale(1.05) translateY(-2px)';
      

      // Reset transform after animation
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
      

      applyNewsFilters();
    });
  });

  elements.blogFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.blogFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.transform = 'scale(1)';
      });
      

      btn.classList.add('active');
      btn.style.transform = 'scale(1.05) translateY(-2px)';
      

      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
      

      applyBlogFilters();
    });
  });

  // Enhanced load more buttons
  elements.loadMoreBtn?.addEventListener('click', () => {
    visibleNews += increment;
    renderNews();
    

    // Enhanced button feedback
    elements.loadMoreBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      elements.loadMoreBtn.style.transform = 'scale(1)';
    }, 150);
  });

  elements.loadMoreBlogsBtn?.addEventListener('click', () => {
    visibleBlogs += blogsIncrement;
    renderBlogs();
    

    elements.loadMoreBlogsBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      elements.loadMoreBlogsBtn.style.transform = 'scale(1)';
    }, 150);
  });

  // Enhanced smooth scrolling for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target && target !== '#') {
        smoothScrollTo(target);
      }
    });
  });

  // ===================== ENHANCED LIGHTBOX FUNCTIONALITY =====================
  const openLightbox = (src, alt) => {
    const lightbox = createElement('div', 'lightbox-overlay');
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="${src}" alt="${alt}">
        <button class="lightbox-close" aria-label="Close lightbox">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    

    // Enhanced lightbox animations
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.style.opacity = '1';
    }, 10);
    

    const closeLightbox = () => {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(lightbox);
        document.body.style.overflow = '';
      }, 300);
    };
    

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        closeLightbox();
      }
    });
    

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closeLightbox();
        document.removeEventListener('keydown', escHandler);
      }
    });
  };

  // ===================== ENHANCED STATISTICS UPDATES =====================
  const updateStatistics = () => {
    if (statsElements.totalNewsEl) {
      animateCounter(statsElements.totalNewsEl, allNews.length, 2000);
    }
    

    if (statsElements.totalEventsEl) {
      const eventCount = allNews.filter(n => n.category === "events").length;
      animateCounter(statsElements.totalEventsEl, eventCount, 2000);
    }
    

    if (statsElements.totalAchievementsEl) {
      const achievementCount = allNews.filter(n => n.category === "achievements").length;
      animateCounter(statsElements.totalAchievementsEl, achievementCount, 2000);
    }
    

    if (statsElements.totalBlogsEl) {
      animateCounter(statsElements.totalBlogsEl, allBlogs.length, 2000);
    }
    

    if (statsElements.activeBloggersEl) {
      const authors = [...new Set(allBlogs.map(b => b.author))].filter(Boolean);
      animateCounter(statsElements.activeBloggersEl, authors.length, 2000);
    }
    

    if (statsElements.popularTopicEl && allBlogs.length > 0) {
      const topics = allBlogs.reduce((acc, b) => {
        const t = (b.topic || "general").toLowerCase();
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
      const popularTopic = Object.keys(topics).reduce((a, b) => topics[a] > topics[b] ? a : b);
      statsElements.popularTopicEl.textContent = popularTopic.charAt(0).toUpperCase() + popularTopic.slice(1);
    }
  };

  // Enhanced counter animation
  const animateCounter = (element, target, duration) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  };

  // ===================== ENHANCED DATA LOADING =====================
  const loadAllData = async () => {
    console.log('🚀 Starting to load all data...');
    

    const [
      news,
      blogs,
      events,
      photos,
      downloads
    ] = await Promise.all([
      fetchJSON("/data/static/news-events.json", []),
      fetchJSON("/data/static/student-blogs.json", []),
      fetchJSON("/data/static/upcoming-events.json", []),
      fetchJSON("/data/static/event-photos.json", []),
      fetchJSON("/data/static/downloads.json", [])
    ]);

    // Sort newest first
    allNews = news.sort((a, b) => new Date(b.date) - new Date(a.date));
    allBlogs = blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredNews = [...allNews];
    filteredBlogs = [...allBlogs];
    allEvents = events;

    console.log('📊 Data loaded:', {
      news: allNews.length,
      blogs: allBlogs.length,
      events: events.length,
      photos: photos.length,
      downloads: downloads.length
    });

    // Update statistics with animation
    setTimeout(updateStatistics, 500);

    // Render everything with staggered animations
    setTimeout(() => {
      renderNews();
      renderBlogs();
    }, 800);

    setTimeout(() => {
      renderEventsCalendar(events);
      renderEventPhotos(photos);
    }, 1200);

    setTimeout(() => {
      renderDownloads(downloads);
    }, 2000);
  };

  // ===================== ENHANCED BLOG SUBMISSION FORM =====================
  const blogForm = document.querySelector('.blog-form');
  if (blogForm) {
    const imageInput = blogForm.querySelector('input[name="featured_image"]');
    const imagePreview = document.getElementById("imagePreview") || createElement('div', 'image-preview');
    

    // Live image preview
    imageInput?.addEventListener("change", function () {
      if (imagePreview) {
        imagePreview.innerHTML = '';
        const file = this.files[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            alert("Image too large! Please use an image under 10MB.");
            this.value = "";
            return;
          }
         

          const img = createElement('img');
          img.src = URL.createObjectURL(file);
          img.style.cssText = "max-height:200px; border-radius:12px; box-shadow:0 8px 25px rgba(0,0,0,0.15);";
          img.alt = 'Image preview';
         

          imagePreview.appendChild(img);
          fadeIn(imagePreview, 300);
        }
      }
    });

    blogForm.addEventListener("submit", async function (e) {
      e.preventDefault();
  

      const submitBtn = blogForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
  

      // Validate form fields
      const authorName = blogForm.querySelector('input[name="author_name"]').value.trim();
      const grade = blogForm.querySelector('select[name="grade"]').value;
      const email = blogForm.querySelector('input[name="email"]').value.trim();
      const title = blogForm.querySelector('input[name="title"]').value.trim();
      const topic = blogForm.querySelector('select[name="topic"]').value;
      const content = blogForm.querySelector('textarea[name="content"]').value.trim();
      const consent = blogForm.querySelector('input[name="consent"]').checked;
  

      if (!authorName || !grade || !email || !title || !topic || !content || !consent) {
        alert("All fields are required. Please fill in all the fields and check the consent box.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        return;
      }
  

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
  

      try {
        const formData = new FormData(blogForm);
  

        const response = await fetch(blogForm.action, {
          method: "POST",
          body: formData
        });
  

        const result = await response.json();
  

        if (response.ok && result.success) {
          blogForm.innerHTML = `
            <div class="success-message">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <h2>Blog Submitted Successfully!</h2>
              <p>Thank you, <strong>${authorName}!</strong></p>
              <p>Your blog "<strong>${title}</strong>" has been received.</p>
              <p>Our team will review it within 3–5 days and notify you by email when it goes live!</p>
              <p class="encouragement">
                <i class="fas fa-heart"></i>
                Keep writing — your voice matters!
                <i class="fas fa-heart"></i>
              </p>
            </div>
          `;
  

          // Enhanced success animation
          const successDiv = blogForm.querySelector('.success-message');
          fadeIn(successDiv, 600);
  

        } else {
          throw new Error(result.message || "Submission failed");
        }
      } catch (err) {
        console.error('Blog submission error:', err);
        alert("Could not submit blog. Please try again or email your post to blog@barunion.sc.ke");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    });
  }

  // ===================== ENHANCED PERFORMANCE OPTIMIZATIONS =====================
  

  // Intersection Observer for lazy loading and animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const observeElements = () => {
    const elementsToObserve = document.querySelectorAll('.news-card, .blog-card, .event-item, .spotlight-card, .download-card');
    elementsToObserve.forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  };

  // Enhanced scroll performance
  let ticking = false;
  

  const updateOnScroll = () => {
    // Add scroll-based effects here
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });

  // ===================== INITIALIZATION =====================
  console.log('🎉 Initializing Enhanced News & Events Page...');
  

  // Initialize enhanced features
  setTimeout(() => {
    observeElements();
    console.log('✨ All enhanced features loaded successfully!');
  }, 100);

  // Start loading data
  loadAllData();

  // ===================== GLOBAL FUNCTIONS =====================
  

  // Expose global functions for event handlers
  window.registerForEvent = (eventId) => {
    console.log(`📝 Registering for event: ${eventId}`);
    // Add event registration logic here
    alert('Event registration feature coming soon!');
  };

  window.openLightbox = openLightbox;

  console.log('🎊 Enhanced News & Events Page JavaScript loaded successfully!');
});

// ===================== ENHANCED CSS FOR LIGHTBOX =====================
const lightboxStyles = `
  <style>
    .lightbox-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      transition: opacity 0.3s ease;
    }
    

    .lightbox-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
    }
    

    .lightbox-content img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }
    

    .lightbox-close {
      position: absolute;
      top: -40px;
      right: -40px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #333;
      transition: all 0.3s ease;
    }
    

    .lightbox-close:hover {
      background: white;
      transform: scale(1.1);
    }
    

    .success-message {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      border-radius: 16px;
      color: #0f5132;
      animation: success-entrance 0.8s ease-out;
    }
    

    .success-icon {
      font-size: 5rem;
      color: #28a745;
      margin-bottom: 2rem;
      animation: icon-bounce 1s ease-in-out;
    }
    

    @keyframes success-entrance {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(30px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    

    @keyframes icon-bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    

    .no-events-message,
    .no-photos-message,
    .no-profiles-message,
    .no-media-message,
    .no-downloads-message {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-light);
      grid-column: 1 / -1;
    }
    

    .no-events-message i,
    .no-photos-message i,
    .no-profiles-message i,
    .no-media-message i,
    .no-downloads-message i {
      font-size: 4rem;
      margin-bottom: 2rem;
      color: var(--gray);
      opacity: 0.5;
    }
    

    .encouragement {
      margin-top: 2rem;
      font-weight: 600;
      color: #0f5132;
    }
    

    .achievement {
      color: var(--gold);
      font-weight: 600;
      margin-top: 0.5rem;
    }
    

    .achievement i {
      margin-right: 0.5rem;
    }
    
    /* Enhanced Download Cards Styles */
    .download-card {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }
    
    .download-card:hover {
      border-color: var(--gold);
      transform: translateY(-5px) scale(1.02);
    }
    
    .download-icon {
      position: relative;
      margin-right: 1.5rem;
      flex-shrink: 0;
    }
    
    .download-icon i {
      font-size: 2.5rem;
      color: var(--blue);
      transition: all 0.3s ease;
    }
    
    .download-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: var(--gold);
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      opacity: 0.8;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4);
    }
    
    .download-info {
      flex: 1;
      min-width: 0;
    }
    
    .download-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--dark);
      margin: 0 0 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .download-description {
      font-size: 0.9rem;
      color: var(--gray-dark);
      margin: 0 0 0.8rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .download-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
    }
    
    .file-type {
      background: var(--blue-light);
      color: var(--blue-dark);
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 500;
    }
    
    .file-size {
      background: var(--gray-light);
      color: var(--gray-dark);
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-weight: 500;
    }
    
    .download-action {
      margin-left: 1.5rem;
      font-size: 1.5rem;
      color: var(--gold);
      opacity: 0.7;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
    
    /* Download Section Header */
    .downloads-section-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .downloads-section-header h2 {
      font-size: 2rem;
      color: var(--dark);
      margin-bottom: 1rem;
      position: relative;
      display: inline-block;
      padding-bottom: 0.5rem;
    }
    
    .downloads-section-header h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, var(--blue), var(--gold));
      border-radius: 2px;
    }
    
    .downloads-section-header p {
      color: var(--gray-dark);
      font-size: 1.1rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    /* Download Card Animation */
    @keyframes downloadPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.8;
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
      }
    }
    
    .download-badge {
      animation: downloadPulse 2s ease-in-out infinite;
    }
  </style>
`;

// Inject lightbox styles
document.head.insertAdjacentHTML('beforeend', lightboxStyles);