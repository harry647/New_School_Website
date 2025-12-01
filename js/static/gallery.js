// ==================================================
// GALLERY PAGE – FINAL 2025+ CLEAN & BULLETPROOF SCRIPT
// Photos + Videos + 360° Tour + Perfectly Working
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

    // ========================================
    // 1. LOAD & RENDER PHOTO GALLERY
    // ========================================
    async function loadPhotos() {
        try {
            const res = await fetch("/data/static/gallery-data.json");
            if (!res.ok) throw new Error("Not found");
            allPhotos = await res.json();
            renderPhotos(allPhotos);
            attachPhotoFilterEvents();
        } catch (err) {
            console.warn("Photo gallery JSON failed, using fallback");
            galleryGrid.innerHTML = `
                <div class="text-center text-muted p-5">
                    <i class="fas fa-images fa-4x mb-3 opacity-50"></i>
                    <p>Gallery photos will be available soon.</p>
                </div>`;
        }
    }

    function renderPhotos(photos) {
        galleryGrid.innerHTML = '';
        if (!photos?.length) {
            galleryGrid.innerHTML = `<p class="text-center text-muted p-5">No photos in this category yet.</p>`;
            morePhotosText.style.display = "none";
            return;
        }

        const fragment = document.createDocumentFragment();
        photos.forEach(photo => {
            const link = document.createElement("a");
            link.href = photo.full || photo.thumb || DEFAULT_PHOTO;
            link.dataset.lightbox = "school-gallery";
            link.dataset.title = photo.title || "Bar Union Mixed Secondary School";
            link.className = "gallery-item";
            link.dataset.category = photo.category || "all";

            const thumb = photo.thumb || photo.full || DEFAULT_PHOTO;

            link.innerHTML = `
                <img data-src="${thumb}" 
                     src="${thumb}" 
                     alt="${photo.title || 'School Memory'}" 
                     loading="lazy"
                     onerror="this.src='${DEFAULT_PHOTO}'">
                <div class="overlay">
                    <i class="fas fa-search-plus"></i>
                    <p>${photo.title || ''}</p>
                </div>
            `;

            fragment.appendChild(link);
        });

        galleryGrid.appendChild(fragment);
        morePhotosText.style.display = "block";

        // Re-init Lightbox
        if (typeof lightbox !== "undefined") {
            lightbox.option({
                resizeDuration: 300,
                wrapAround: true,
                albumLabel: "Image %1 of %2"
            });
        }
    }

    function attachPhotoFilterEvents() {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                const filter = btn.dataset.filter;
                const filtered = filter === "all"
                    ? allPhotos
                    : allPhotos.filter(p => p.category === filter);

                renderPhotos(filtered);
            });
        });
    }

    // ========================================
    // 2. LOAD & RENDER VIDEO GALLERY
    // ========================================
    async function loadVideos() {
        try {
            const res = await fetch("/data/static/video-gallery-data.json");
            if (!res.ok) throw new Error("Not found");
            allVideos = await res.json();
            renderVideos(allVideos);
            attachVideoTabEvents();
        } catch (err) {
            console.warn("Video gallery failed");
            videoGrid.innerHTML = `<p class="text-center text-muted p-5">Videos coming soon!</p>`;
        }
    }

    function renderVideos(videos) {
        videoGrid.innerHTML = '';
        if (!videos?.length) {
            videoGrid.innerHTML = `<p class="text-center text-muted p-5">No videos in this category yet.</p>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        videos.forEach((video, i) => {
            const card = document.createElement("div");
            card.className = "video-item";
            card.dataset.category = video.category || "all";
            card.style.transitionDelay = `${i * 80}ms`;

            const embed = video.type === "youtube"
                ? `<iframe src="https://www.youtube.com/embed/${video.id}?rel=0" 
                           title="${video.title}" 
                           allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                           allowfullscreen loading="lazy"></iframe>`
                : `<video controls poster="${video.poster || ''}">
                        <source src="${video.src}" type="video/mp4">
                        Your browser does not support video.
                   </video>`;

            card.innerHTML = `
                <div class="video-wrapper">${embed}</div>
                <p class="video-title text-center mt-2">${video.title}</p>
                <p class="video-description text-center mt-1">${video.desc || ''}</p>
            `;

            fragment.appendChild(card);
        });

        videoGrid.appendChild(fragment);
    }

    function attachVideoTabEvents() {
        videoTabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                videoTabBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                const filter = btn.dataset.tab;
                const filtered = filter === "all"
                    ? allVideos
                    : allVideos.filter(v => v.category === filter);

                renderVideos(filtered);
            });
        });
    }

    // ========================================
    // 3. 360° VIRTUAL TOUR – FINAL WORKING VERSION
    // ========================================
    if (panoramaContainer) {
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
            pannellum.viewer('panorama', {
                type: "equirectangular",
                panorama: "/assets/images/360/school-tour-2025.jpg",
                autoLoad: true,
                autoRotate: -3,
                autoRotateInactivityDelay: 3000,
                showControls: true,
                showFullscreenCtrl: true,
                showZoomCtrl: true,
                compass: true,
                northOffset: 45,
                pitch: 5,
                yaw: 0,
                hfov: 110,
                hotSpots: [
                    { pitch: 8, yaw: -20, type: "info", text: "<strong>Main Entrance</strong><br>Reception & Admin", CSSClass: "custom-hotspot" },
                    { pitch: -12, yaw: 135, type: "info", text: "<strong>Science Labs</strong><br>Modern Equipment", CSSClass: "custom-hotspot" },
                    { pitch: 10, yaw: 180, type: "info", text: "<strong>Assembly Hall</strong><br>Events & Prayers", CSSClass: "custom-hotspot" },
                    { pitch: 18, yaw: 70, type: "info", text: "<strong>Sports Ground</strong><br>Football & Athletics", CSSClass: "custom-hotspot" },
                    { pitch: -5, yaw: -90, type: "info", text: "<strong>Library</strong><br>15,000+ Books", CSSClass: "custom-hotspot" }
                ]
            });
        };

        initTour();
    }

    // ========================================
    // 4. BACK TO TOP
    // ========================================
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("visible", window.scrollY > 500);
        });
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ========================================
    // 5. REMOVE ALL LOADERS
    // ========================================
    function removeLoaders() {
        document.querySelectorAll('.loader').forEach(loader => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 600);
        });
    }

    // ========================================
    // 6. INITIALIZE EVERYTHING
    // ========================================
    await Promise.all([loadPhotos(), loadVideos()]);
    removeLoaders();

    console.log("%cGallery Page: Fully Loaded & Stunning!", "color:#ec4899;font-size:20px;font-weight:bold;background:#1e293b;padding:12px;border-radius:10px;");
});