// ==================================================
// GALLERY PAGE – ULTRA-PREMIUM 2025 EDITION
// Stunning Animations, Smooth Interactions & Perfect UX
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    const DEFAULT_PHOTO = "/assets/images/defaults/default-gallery.jpg";

    // DOM Elements
    const galleryGrid = document.getElementById("galleryGrid");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const morePhotosText = document.getElementById("morePhotos");
    const videoGrid = document.getElementById("videoGrid");
    const videoTabBtns = document.querySelectorAll(".tab-btn");
    const panoramaContainer = document.getElementById("panorama");
    const backToTop = document.getElementById("backToTop");

    let allPhotos = [];
    let allVideos = [];
    let currentFilter = "all";
    let currentVideoTab = "all";

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    // Smooth scroll to element
    const smoothScrollTo = (element, offset = 100) => {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
    };

    // Animate elements on scroll
    const observeElements = (elements, className = "animate-in") => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add(className);
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        elements.forEach(el => observer.observe(el));
    };

    // Debounce function for performance
    const debounce = (func, wait = 100) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // ========================================
    // 1. LOAD & RENDER PHOTO GALLERY
    // ========================================
    async function loadPhotos() {
        try {
            const res = await fetch("/data/static/gallery-photos.json");
            if (!res.ok) throw new Error("Not found");
            allPhotos = await res.json();
            renderPhotos(allPhotos);
            attachPhotoFilterEvents();
        } catch (err) {
            console.warn("Photo gallery JSON failed, using fallback images");
            // Use fallback gallery images
            allPhotos = generateFallbackPhotos();
            renderPhotos(allPhotos);
            attachPhotoFilterEvents();
        }
    }

    function generateFallbackPhotos() {
        const categories = ["campus", "academics", "sports", "events", "celebrations", "alumni"];
        const photos = [];
        
        for (let i = 1; i <= 9; i++) {
            photos.push({
                id: i,
                title: `School Memory ${i}`,
                category: categories[i % categories.length],
                thumb: `/assets/images/gallery/gallery${i}.jpg`,
                full: `/assets/images/gallery/gallery${i}.jpg`
            });
        }
        
        return photos;
    }

    function renderPhotos(photos) {
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';
        
        if (!photos?.length) {
            galleryGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images"></i>
                    <h3>No Photos Found</h3>
                    <p>No photos in this category yet. Check back soon!</p>
                </div>`;
            if (morePhotosText) morePhotosText.style.display = "none";
            return;
        }

        const fragment = document.createDocumentFragment();
        
        photos.forEach((photo, index) => {
            const link = document.createElement("a");
            link.href = photo.full || photo.thumb || DEFAULT_PHOTO;
            link.dataset.lightbox = "school-gallery";
            link.dataset.title = photo.title || "Bar Union Mixed Secondary School";
            link.className = "gallery-item";
            link.dataset.category = photo.category || "all";
            link.style.animationDelay = `${index * 50}ms`;

            const thumb = photo.thumb || photo.full || DEFAULT_PHOTO;

            link.innerHTML = `
                <img 
                    src="${thumb}" 
                    alt="${photo.title || 'School Memory'}" 
                    loading="lazy"
                    onerror="this.src='${DEFAULT_PHOTO}'"
                >
                <div class="overlay">
                    <i class="fas fa-search-plus"></i>
                    <p>${photo.title || ''}</p>
                </div>
            `;

            fragment.appendChild(link);
        });

        galleryGrid.appendChild(fragment);
        
        if (morePhotosText) {
            morePhotosText.style.display = photos.length > 0 ? "block" : "none";
        }

        // Animate gallery items
        requestAnimationFrame(() => {
            const items = galleryGrid.querySelectorAll('.gallery-item');
            observeElements(items, 'visible');
        });

        // Re-init Lightbox
        if (typeof lightbox !== "undefined") {
            lightbox.option({
                resizeDuration: 300,
                wrapAround: true,
                albumLabel: "Image %1 of %2",
                fadeDuration: 300,
                imageFadeDuration: 300,
                positionFromTop: 80
            });
        }
    }

    function attachPhotoFilterEvents() {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                // Update active state
                filterBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                this.classList.add("active");
                this.setAttribute("aria-selected", "true");

                // Filter photos
                currentFilter = this.dataset.filter;
                const filtered = currentFilter === "all"
                    ? allPhotos
                    : allPhotos.filter(p => p.category === currentFilter);

                // Add fade out effect
                if (galleryGrid) {
                    galleryGrid.style.opacity = "0";
                    galleryGrid.style.transform = "translateY(20px)";
                    
                    setTimeout(() => {
                        renderPhotos(filtered);
                        galleryGrid.style.opacity = "1";
                        galleryGrid.style.transform = "translateY(0)";
                    }, 300);
                }
            });
        });
    }

    // ========================================
    // 2. LOAD & RENDER VIDEO GALLERY
    // ========================================
    async function loadVideos() {
        // Get existing static videos from HTML
        const existingVideos = videoGrid ? Array.from(videoGrid.querySelectorAll('.video-item')) : [];
        
        try {
            const res = await fetch("/data/static/gallery-videos.json");
            if (!res.ok) throw new Error("Not found");
            allVideos = await res.json();
            
            // Store static video data for filtering
            existingVideos.forEach(item => {
                const category = item.dataset.category || 'all';
                const title = item.querySelector('.video-title')?.textContent || '';
                const desc = item.querySelector('.video-description')?.textContent || '';
                allVideos.unshift({
                    type: 'static',
                    category,
                    title,
                    desc,
                    element: item.cloneNode(true)
                });
            });
            
            renderVideos(allVideos);
            attachVideoTabEvents();
        } catch (err) {
            console.warn("Video gallery JSON not found, using static videos only");
            
            // Use static videos from HTML
            existingVideos.forEach(item => {
                const category = item.dataset.category || 'all';
                const title = item.querySelector('.video-title')?.textContent || '';
                const desc = item.querySelector('.video-description')?.textContent || '';
                allVideos.push({
                    type: 'static',
                    category,
                    title,
                    desc,
                    element: item.cloneNode(true)
                });
            });
            
            if (allVideos.length > 0) {
                renderVideos(allVideos);
                attachVideoTabEvents();
            } else if (videoGrid) {
                videoGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-video"></i>
                        <h3>Videos Coming Soon</h3>
                        <p>Our video gallery is being updated. Check back soon!</p>
                    </div>`;
            }
        }
    }

    function renderVideos(videos) {
        if (!videoGrid) return;
        
        videoGrid.innerHTML = '';
        
        if (!videos?.length) {
            videoGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash"></i>
                    <h3>No Videos Found</h3>
                    <p>No videos in this category yet.</p>
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        
        videos.forEach((video, index) => {
            // If it's a static video element, use it directly
            if (video.type === 'static' && video.element) {
                const clonedElement = video.element.cloneNode(true);
                clonedElement.style.animationDelay = `${index * 100}ms`;
                clonedElement.classList.add('visible');
                fragment.appendChild(clonedElement);
                return;
            }
            
            const card = document.createElement("div");
            card.className = "video-item";
            card.dataset.category = video.category || "all";
            card.style.animationDelay = `${index * 100}ms`;

            let embed = '';
            
            if (video.type === "youtube") {
                embed = `
                    <iframe 
                        src="https://www.youtube.com/embed/${video.id}?rel=0" 
                        title="${video.title}" 
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen 
                        loading="lazy"
                    ></iframe>`;
            } else if (video.type === "facebook") {
                embed = `
                    <iframe 
                        src="${video.src}"
                        style="border:none;overflow:hidden"
                        scrolling="no"
                        frameborder="0"
                        allowfullscreen="true"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        loading="lazy"
                    ></iframe>`;
            } else {
                embed = `
                    <video controls poster="${video.poster || ''}">
                        <source src="${video.src}" type="video/mp4">
                        Your browser does not support video.
                    </video>`;
            }

            card.innerHTML = `
                <div class="video-wrapper">${embed}</div>
                <h3 class="video-title">${video.title || 'Untitled Video'}</h3>
                <p class="video-description">${video.desc || ''}</p>
            `;

            fragment.appendChild(card);
        });

        videoGrid.appendChild(fragment);

        // Animate video items
        requestAnimationFrame(() => {
            const items = videoGrid.querySelectorAll('.video-item');
            items.forEach((item, i) => {
                setTimeout(() => item.classList.add('visible'), i * 100);
            });
        });
    }

    function attachVideoTabEvents() {
        videoTabBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                // Update active state
                videoTabBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                this.classList.add("active");
                this.setAttribute("aria-selected", "true");

                // Filter videos
                currentVideoTab = this.dataset.tab;
                const filtered = currentVideoTab === "all"
                    ? allVideos
                    : allVideos.filter(v => v.category === currentVideoTab);

                // Add fade effect
                if (videoGrid) {
                    videoGrid.style.opacity = "0";
                    videoGrid.style.transform = "translateY(20px)";
                    
                    setTimeout(() => {
                        renderVideos(filtered);
                        videoGrid.style.opacity = "1";
                        videoGrid.style.transform = "translateY(0)";
                    }, 300);
                }
            });
        });
    }

    // ========================================
    // 3. 360° VIRTUAL TOUR
    // ========================================
    function initPanorama() {
        if (!panoramaContainer) return;

        panoramaContainer.innerHTML = `
            <div class="tour-loading">
                <i class="fas fa-compass fa-spin"></i>
                <p>Loading 360° Virtual Tour...</p>
            </div>
        `;

        const initTour = () => {
            if (typeof pannellum === "undefined") {
                setTimeout(initTour, 500);
                return;
            }

            panoramaContainer.innerHTML = '';
            
            try {
                pannellum.viewer('panorama', {
                    type: "equirectangular",
                    panorama: "/assets/images/360/school-tour-2025.jpg",
                    autoLoad: true,
                    autoRotate: -2,
                    autoRotateInactivityDelay: 3000,
                    showControls: true,
                    showFullscreenCtrl: true,
                    showZoomCtrl: true,
                    compass: true,
                    northOffset: 45,
                    pitch: 5,
                    yaw: 0,
                    hfov: 110,
                    minHfov: 50,
                    maxHfov: 120,
                    hotSpots: [
                        { 
                            pitch: 8, 
                            yaw: -20, 
                            type: "info", 
                            text: "<strong>Main Entrance</strong><br>Reception & Admin Block",
                            cssClass: "custom-hotspot"
                        },
                        { 
                            pitch: -12, 
                            yaw: 135, 
                            type: "info", 
                            text: "<strong>Science Labs</strong><br>Modern Equipment & Research",
                            cssClass: "custom-hotspot"
                        },
                        { 
                            pitch: 10, 
                            yaw: 180, 
                            type: "info", 
                            text: "<strong>Assembly Hall</strong><br>Events & Morning Prayers",
                            cssClass: "custom-hotspot"
                        },
                        { 
                            pitch: 18, 
                            yaw: 70, 
                            type: "info", 
                            text: "<strong>Sports Ground</strong><br>Football, Athletics & More",
                            cssClass: "custom-hotspot"
                        },
                        { 
                            pitch: -5, 
                            yaw: -90, 
                            type: "info", 
                            text: "<strong>Library</strong><br>15,000+ Books & Digital Resources",
                            cssClass: "custom-hotspot"
                        }
                    ]
                });
            } catch (error) {
                console.warn("Pannellum initialization failed:", error);
                panoramaContainer.innerHTML = `
                    <div class="tour-loading">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Virtual tour temporarily unavailable. Please try again later.</p>
                    </div>
                `;
            }
        };

        initTour();
    }

    // ========================================
    // 4. BACK TO TOP BUTTON
    // ========================================
    function initBackToTop() {
        if (!backToTop) return;

        const handleScroll = debounce(() => {
            const scrolled = window.scrollY > 500;
            backToTop.classList.toggle("visible", scrolled);
        }, 50);

        window.addEventListener("scroll", handleScroll, { passive: true });
        
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ========================================
    // 5. ANIMATE STATS ON SCROLL
    // ========================================
    function initStatsAnimation() {
        const statsSection = document.getElementById("galleryStats");
        if (!statsSection) return;

        const stats = statsSection.querySelectorAll(".stat h3");
        let animated = false;

        const animateValue = (element, start, end, duration) => {
            const startTime = performance.now();
            const suffix = element.textContent.replace(/[0-9]/g, '');
            
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (end - start) * easeOut);
                
                element.textContent = current + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            
            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    stats.forEach(stat => {
                        const value = parseInt(stat.textContent);
                        if (!isNaN(value)) {
                            animateValue(stat, 0, value, 2000);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // ========================================
    // 6. REMOVE LOADERS
    // ========================================
    function removeLoaders() {
        document.querySelectorAll('.loader').forEach(loader => {
            loader.style.opacity = '0';
            loader.style.transform = 'scale(0.9)';
            setTimeout(() => loader.remove(), 500);
        });
    }

    // ========================================
    // 7. ADD SMOOTH TRANSITIONS TO GRIDS
    // ========================================
    function initGridTransitions() {
        if (galleryGrid) {
            galleryGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }
        if (videoGrid) {
            videoGrid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }
    }

    // ========================================
    // 8. KEYBOARD NAVIGATION
    // ========================================
    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Close lightbox with Escape
            if (e.key === 'Escape') {
                const lightboxOverlay = document.querySelector('.lightbox');
                if (lightboxOverlay) {
                    lightboxOverlay.click();
                }
            }
        });
    }

    // ========================================
    // 9. LAZY LOAD IMAGES
    // ========================================
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            }, { rootMargin: '50px 0px' });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ========================================
    // 10. MODAL FUNCTIONALITY
    // ========================================
    function initModals() {
      const photoUploadModal = document.getElementById('photoUploadModal');
      const videoUploadModal = document.getElementById('videoUploadModal');
      const openPhotoUploadBtn = document.getElementById('openPhotoUploadModal');
      const openVideoUploadBtn = document.getElementById('openUploadModal');
      const closeModalBtns = document.querySelectorAll('.close-modal');
  
      if (openPhotoUploadBtn && photoUploadModal) {
        openPhotoUploadBtn.addEventListener('click', () => {
          photoUploadModal.style.display = 'flex';
        });
      }
  
      if (openVideoUploadBtn && videoUploadModal) {
        openVideoUploadBtn.addEventListener('click', () => {
          videoUploadModal.style.display = 'flex';
        });
      }
  
      closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal-overlay');
          if (modal) {
            modal.style.display = 'none';
          }
        });
      });
  
      // Close modals when clicking outside the content
      window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal-overlay')) {
          event.target.style.display = 'none';
        }
      });
  
      // Handle photo upload form submission
      const photoUploadForm = document.getElementById('photoUploadForm');
      if (photoUploadForm) {
        photoUploadForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const statusElement = document.getElementById('photoUploadStatus');
          statusElement.classList.remove('hidden');
          statusElement.textContent = 'Uploading photos...';
          statusElement.style.color = '#0b2d5e';
  
          const formData = new FormData(photoUploadForm);
  
          try {
            const response = await fetch('/api/static/upload-photos', {
              method: 'POST',
              body: formData
            });
  
            const result = await response.json();
            if (result.success) {
              statusElement.textContent = result.message;
              statusElement.style.color = '#0175C2';
              photoUploadForm.reset();
              document.getElementById('selectedPhotosList').innerHTML = '';
            } else {
              statusElement.textContent = result.message || 'Failed to upload photos.';
              statusElement.style.color = '#dc2626';
            }
          } catch (error) {
            statusElement.textContent = 'An error occurred while uploading photos.';
            statusElement.style.color = '#dc2626';
            console.error('Error uploading photos:', error);
          }
        });
      }
  
      // Handle video upload form submission
      const videoUploadForm = document.getElementById('videoUploadForm');
      if (videoUploadForm) {
        videoUploadForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const statusElement = document.getElementById('uploadStatus');
          statusElement.classList.remove('hidden');
          statusElement.textContent = 'Uploading video...';
          statusElement.style.color = '#0b2d5e';
  
          const formData = new FormData(videoUploadForm);
  
          try {
            const response = await fetch('/api/static/upload-video', {
              method: 'POST',
              body: formData
            });
  
            const result = await response.json();
            if (result.success) {
              statusElement.textContent = result.message;
              statusElement.style.color = '#0175C2';
              videoUploadForm.reset();
              document.getElementById('fileInfo').textContent = 'No file selected';
            } else {
              statusElement.textContent = result.message || 'Failed to upload video.';
              statusElement.style.color = '#dc2626';
            }
          } catch (error) {
            statusElement.textContent = 'An error occurred while uploading video.';
            statusElement.style.color = '#dc2626';
            console.error('Error uploading video:', error);
          }
        });
      }
    }

    // ========================================
    // INITIALIZE EVERYTHING
    // ========================================
    async function init() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .gallery-item, .video-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .gallery-item.visible, .video-item.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .empty-state {
                grid-column: 1 / -1;
                text-align: center;
                padding: 4rem 2rem;
                color: #64748b;
            }
            .empty-state i {
                font-size: 4rem;
                margin-bottom: 1.5rem;
                opacity: 0.5;
            }
            .empty-state h3 {
                font-size: 1.5rem;
                margin: 0 0 0.5rem;
                color: #1e293b;
            }
            .empty-state p {
                margin: 0;
                font-size: 1rem;
            }
        `;
        document.head.appendChild(style);

        // Initialize all features
        initGridTransitions();
        initBackToTop();
        initKeyboardNav();
        initLazyLoading();
        initModals();
         
        // Load content
        await Promise.all([loadPhotos(), loadVideos()]);
        
        // Initialize remaining features
        initPanorama();
        initStatsAnimation();
        removeLoaders();

        console.log(
            "%c🎨 Gallery Page Loaded Successfully!",
            "color: #ffd700; font-size: 18px; font-weight: bold; background: #0b2d5e; padding: 12px 20px; border-radius: 8px;"
        );
    }

    init();
});
