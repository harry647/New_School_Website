// /js/news-events.js
// Fully working: Blogs + Upcoming Events Calendar + All Sections
document.addEventListener("DOMContentLoaded", async () => {
    // ===================== DOM ELEMENTS =====================
    const newsGrid = document.getElementById("newsGrid");
    const featuredNewsWrapper = document.getElementById("featuredNews");
    const eventPhotosGrid = document.getElementById("eventPhotos");
    const spotlightProfiles = document.getElementById("spotlightProfiles");
    const mediaCoverage = document.getElementById("mediaCoverage");
    const downloadsResources = document.getElementById("downloadsResources");
    const blogGrid = document.getElementById("blogGrid"); // ← Fixed: was blogGrid
    const eventsCalendar = document.getElementById("eventsCalendar");

    // Inputs & Buttons
    const searchInput = document.getElementById("newsSearch");
    const blogSearchInput = document.getElementById("blogSearch");
    const filterBtns = document.querySelectorAll("#latest-news .filter-btn");
    const blogFilterBtns = document.querySelectorAll(".blog-controls .filter-btn");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const loadMoreBlogsBtn = document.getElementById("loadMoreBlogs");

    // Stats
    const totalNewsEl = document.getElementById("totalNews");
    const totalEventsEl = document.getElementById("totalEvents");
    const totalAchievementsEl = document.getElementById("totalAchievements");

    // No Results
    const noResults = document.getElementById("noResults");
    const noBlogResults = document.getElementById("noBlogResults");

    // ===================== STATE =====================
    let allNews = [], filteredNews = [], visibleNews = 6, increment = 6;
    let allBlogs = [], filteredBlogs = [], visibleBlogs = 6, blogsIncrement = 6;
    let allEvents = [];

    const DEFAULT_IMG = "/assets/images/default-news.jpg";
    const DEFAULT_PHOTO = "/assets/images/default-gallery.jpg";
    const DEFAULT_AVATAR = "/assets/images/default-user.png";

    // ===================== UTILITIES =====================
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const formatShortDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-KE", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    };

    const readingTime = (text) => Math.max(1, Math.ceil((text.trim().split(/\s+/).length) / 200));

    const removeLoader = (parent) => {
        const loader = parent?.querySelector(".loader");
        if (loader) loader.remove();
    };

    // ===================== FETCH JSON =====================
    const fetchJSON = async (path, fallback = []) => {
        try {
            const res = await fetch(path + `?v=${Date.now()}`); // cache bust
            if (!res.ok) throw new Error();
            return await res.json();
        } catch (e) {
            console.warn("Failed to load:", path);
            return fallback;
        }
    };

    // ===================== RENDER FUNCTIONS =====================

    // 1. Main News Grid
    const renderNews = () => {
        if (!newsGrid) return;

        const items = filteredNews.slice(0, visibleNews);
        newsGrid.innerHTML = items.length === 0 ? "" : "";

        if (items.length === 0) {
            noResults.style.display = "block";
            loadMoreBtn.style.display = "none";
            return;
        }

        noResults.style.display = "none";
        const frag = document.createDocumentFragment();

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "news-card";
            card.dataset.category = item.category;

            const catDisplay = item.category.charAt(0).toUpperCase() + item.category.slice(1);

            card.innerHTML = `
                <div class="news-thumb">
                    <img src="${item.image || DEFAULT_IMG}" alt="${item.title}" loading="lazy"
                         onerror="this.src='${DEFAULT_IMG}'">
                    <span class="news-tag">${catDisplay}</span>
                </div>
                <div class="news-body">
                    <span class="news-date">${formatDate(item.date)} • ${readingTime(item.excerpt)} min read</span>
                    <h3>${item.title}</h3>
                    <p>${item.excerpt}</p>
                    <a href="${item.link || '#'}" class="read-more">${item.linkText || 'Read More'} →</a>
                    <div class="share-buttons">
                        <a href="https://wa.me/?text=${encodeURIComponent(item.title + " — " + location.origin + item.link)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.origin + item.link)}" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(location.origin + item.link)}" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
            `;
            frag.appendChild(card);
        });

        newsGrid.appendChild(frag);
        loadMoreBtn.style.display = visibleNews < filteredNews.length ? "inline-block" : "none";
        removeLoader(newsGrid);
    };

    // 2. Featured Carousel (Top 3 latest)
    const renderFeatured = (items) => {
        if (!featuredNewsWrapper || items.length === 0) return;

        featuredNewsWrapper.innerHTML = "";
        const frag = document.createDocumentFragment();

        items.slice(0, 5).forEach(item => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide";
            slide.innerHTML = `
                <div class="featured-news-card">
                    <img src="${item.image || DEFAULT_IMG}" alt="${item.title}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">
                    <div class="featured-body">
                        <span class="featured-tag">Featured</span>
                        <h4>${item.title}</h4>
                        <p>${item.excerpt}</p>
                        <a href="${item.link || '#'}" class="read-more btn btn-sm btn-outline-light">
                            ${item.linkText || 'Read More'} →
                        </a>
                    </div>
                </div>
            `;
            frag.appendChild(slide);
        });

        featuredNewsWrapper.appendChild(frag);

        // Initialize Swiper if available
        if (typeof Swiper !== "undefined") {
            new Swiper("#featuredCarousel", {
                loop: true,
                autoplay: { delay: 6000 },
                pagination: { el: ".swiper-pagination", clickable: true },
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                effect: "fade"
            });
        }
    };

    // 3. Event Photos (Optional JSON: event-photos.json)
    const renderEventPhotos = (photos) => {
        if (!eventPhotosGrid) return;
        eventPhotosGrid.innerHTML = "";
        if (photos.length === 0) {
            eventPhotosGrid.innerHTML = "<p class='text-center text-muted'>No photos available yet.</p>";
            return;
        }
        const frag = document.createDocumentFragment();
        photos.forEach(p => {
            const div = document.createElement("div");
            div.className = "photo-card";
            div.innerHTML = `<img src="${p.image || DEFAULT_PHOTO}" alt="${p.title || 'Event photo'}" loading="lazy" onerror="this.src='${DEFAULT_PHOTO}'">
                             <p>${p.title || ''}</p>`;
            frag.appendChild(div);
        });
        eventPhotosGrid.appendChild(frag);
        removeLoader(eventPhotosGrid);
    };

    // 4. Spotlight Profiles
    const renderSpotlight = (profiles) => {
        if (!spotlightProfiles) return;
        spotlightProfiles.innerHTML = profiles.length === 0
            ? "<p class='text-center text-muted'>No spotlight profiles yet.</p>"
            : "";
        const frag = document.createDocumentFragment();
        profiles.forEach(p => {
            const card = document.createElement("div");
            card.className = "spotlight-card";
            card.innerHTML = `
                <img src="${p.image || DEFAULT_AVATAR}" alt="${p.name}" loading="lazy" onerror="this.src='${DEFAULT_AVATAR}'">
                <h4>${p.name}</h4>
                <p>${p.role || p.achievement || ''}</p>
            `;
            frag.appendChild(card);
        });
        spotlightProfiles.appendChild(frag);
        removeLoader(spotlightProfiles);
    };

    // 5. Media Coverage
    const renderMedia = (items) => {
        if (!mediaCoverage) return;
        mediaCoverage.innerHTML = items.length === 0 ? "<p class='text-center text-muted'>No media coverage yet.</p>" : "";
        const frag = document.createDocumentFragment();
        items.forEach(m => {
            const card = document.createElement("div");
            card.className = "media-card";
            card.innerHTML = `<a href="${m.link}" target="_blank" rel="noopener">
                <img src="${m.image || DEFAULT_PHOTO}" alt="${m.title}" loading="lazy" onerror="this.src='${DEFAULT_PHOTO}'">
                <p>${m.title}</p>
            </a>`;
            frag.appendChild(card);
        });
        mediaCoverage.appendChild(frag);
        removeLoader(mediaCoverage);
    };

    // 6. Downloads
    const renderDownloads = (items) => {
        if (!downloadsResources) return;
        downloadsResources.innerHTML = items.length === 0 ? "<p class='text-center text-muted'>No downloads available.</p>" : "";
        const frag = document.createDocumentFragment();
        items.forEach(d => {
            const a = document.createElement("a");
            a.href = d.link || "#";
            a.className = "download-card";
            a.target = "_blank";
            a.innerHTML = `<i class="fas fa-file-pdf"></i><p>${d.title}</p>`;
            frag.appendChild(a);
        });
        downloadsResources.appendChild(frag);
        removeLoader(downloadsResources);
    };

    // ===================== RENDER BLOGS (NOW FIXED) =====================
    const renderBlogs = () => {
        if (!blogGrid) return;

        const items = filteredBlogs.slice(0, visibleBlogs);

        // Clear only the content, not the loader yet
        const loader = blogGrid.querySelector(".loader");
        blogGrid.innerHTML = loader ? '<div class="loader"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Loading...</p></div>' : "";

        if (items.length === 0) {
            blogGrid.innerHTML = "";
            noBlogResults.style.display = "block";
            loadMoreBlogsBtn.style.display = "none";
            return;
        }

        noBlogResults.style.display = "none";

        const frag = document.createDocumentFragment();
        items.forEach(blog => {
            const card = document.createElement("div");
            card.className = "blog-card";
            card.dataset.topic = (blog.topic || "general").toLowerCase();

            card.innerHTML = `
                <img src="${blog.image || DEFAULT_PHOTO}" alt="${blog.title}" loading="lazy" onerror="this.src='${DEFAULT_PHOTO}'">
                <div class="blog-body">
                    <h4>${blog.title}</h4>
                    <p>${blog.excerpt || "No preview available."}</p>
                    <div class="blog-meta">
                        <span>${blog.author || "Student"}</span>
                        <span>•</span>
                        <span>${formatDate(blog.date)}</span>
                    </div>
                    <a href="${blog.link || '#'}" class="read-more">Read Full Blog →</a>
                </div>
            `;
            frag.appendChild(card);
        });

        blogGrid.appendChild(frag);
        loadMoreBlogsBtn.style.display = visibleBlogs < filteredBlogs.length ? "inline-block" : "none";
        removeLoader(blogGrid);
    };

    // ===================== UPCOMING EVENTS CALENDAR =====================
    const renderEventsCalendar = (events) => {
        if (!eventsCalendar) return;
        eventsCalendar.innerHTML = "<p class='text-center text-muted'>Loading events...</p>";

        const upcoming = events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6);

        if (upcoming.length === 0) {
            eventsCalendar.innerHTML = "<p class='text-center text-muted'>No upcoming events</p>";
            return;
        }

        let html = `<div class="upcoming-events">`;
        upcoming.forEach(e => {
            const date = new Date(e.date);
            const day = date.getDate();
            const month = date.toLocaleDateString("en-KE", { month: "short" });
            html += `
                <div class="event-cal-item">
                    <div class="cal-date">
                        <strong>${day}</strong>
                        <span>${month}</span>
                    </div>
                    <div class="cal-info">
                        <h4>${e.title}</h4>
                        ${e.time ? `<small>${e.time}</small>` : ""}
                        ${e.location ? `<p>${e.location}</p>` : ""}
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        eventsCalendar.innerHTML = html;
    };

    // ===================== FILTER & SEARCH =====================
    const applyNewsFilter = () => {
        const term = (searchInput?.value || "").toLowerCase().trim();
        const activeFilter = document.querySelector("#latest-news .filter-btn.active")?.dataset.filter || "all";

        let filtered = allNews;
        if (activeFilter !== "all") filtered = filtered.filter(n => n.category === activeFilter);
        if (term) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(term) ||
                n.excerpt.toLowerCase().includes(term)
            );
        }
        filteredNews = filtered;
        visibleNews = 6;
        renderNews();
    };

    const applyBlogFilter = () => {
        const term = (blogSearchInput?.value || "").toLowerCase().trim();
        const activeBtn = document.querySelector(".blog-controls .filter-btn.active");
        const filter = activeBtn ? activeBtn.dataset.filter : "all";

        let filtered = allBlogs;

        if (filter !== "all") {
            filtered = filtered.filter(b => (b.topic || "general").toLowerCase() === filter);
        }
        if (term) {
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(term) ||
                (b.author || "").toLowerCase().includes(term) ||
                (b.excerpt || "").toLowerCase().includes(term)
            );
        }

        filteredBlogs = filtered;
        visibleBlogs = 6;
        renderBlogs();
    };


    // ===================== EVENT LISTENERS =====================
    searchInput?.addEventListener("input", applyNewsFilter);
    blogSearchInput?.addEventListener("input", applyBlogFilter);

    filterBtns.forEach(btn => btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyNewsFilter();
    }));

    blogFilterBtns.forEach(btn => btn.addEventListener("click", () => {
        blogFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyBlogFilter();
    }));

    loadMoreBtn?.addEventListener("click", () => { visibleNews += increment; renderNews(); });
    loadMoreBlogsBtn?.addEventListener("click", () => { visibleBlogs += blogsIncrement; renderBlogs(); });

    // ===================== LOAD ALL DATA =====================
    const init = async () => {
        const [news, photos, spotlight, media, downloads, blogs, events] = await Promise.all([
            fetchJSON("/data/news-data.json", []),
            fetchJSON("/data/event-photos.json", []),
            fetchJSON("/data/spotlight.json", []),
            fetchJSON("/data/media-coverage.json", []),
            fetchJSON("/data/downloads.json", []),
            fetchJSON("/data/blogs.json", []),
            fetchJSON("/data/upcoming-events.json", [])
        ]);

        // News
        allNews = news.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredNews = [...allNews];

        // Blogs
        allBlogs = blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredBlogs = [...allBlogs];

        // Events
        allEvents = events;

        // Update Stats
        if (totalNewsEl) totalNewsEl.textContent = allNews.length;
        if (totalEventsEl) totalEventsEl.textContent = allNews.filter(n => n.category === "events").length;
        if (totalAchievementsEl) totalAchievementsEl.textContent = allNews.filter(n => n.category === "achievements").length;

        // Render All
        renderNews();
        renderFeatured(allNews);
        renderEventPhotos(photos);
        renderSpotlight(spotlight);
        renderMedia(media);
        renderDownloads(downloads);
        renderBlogs();           // ← Now works!
        renderEventsCalendar(allEvents);
    };

    await init();
});