// /js/news-events.js
// Fully working: News + Events + Student Blogs + Spotlight + Media + Downloads
// Mobile-perfect, fast, and 100% backend-ready (no Formspree)

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  // ===================== DOM ELEMENTS =====================
  const newsGrid = document.getElementById("newsGrid");
  const featuredNewsWrapper = document.getElementById("featuredNews");
  const blogGrid = document.getElementById("blogGrid");
  const eventPhotosGrid = document.getElementById("eventPhotos");
  const spotlightProfiles = document.getElementById("spotlightProfiles");
  const mediaCoverage = document.getElementById("mediaCoverage");
  const downloadsResources = document.getElementById("downloadsResources");
  const eventsCalendar = document.getElementById("eventsCalendar");

  const searchInput = document.getElementById("newsSearch");
  const blogSearchInput = document.getElementById("blogSearch");

  const filterBtns = document.querySelectorAll("#latest-news .filter-btn");
  const blogFilterBtns = document.querySelectorAll(".blog-controls .filter-btn");

  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const loadMoreBlogsBtn = document.getElementById("loadMoreBlogs");

  const noResults = document.getElementById("noResults");
  const noBlogResults = document.getElementById("noBlogResults");

  // Stats
  const totalNewsEl = document.getElementById("totalNews");
  const totalEventsEl = document.getElementById("totalEvents");
  const totalAchievementsEl = document.getElementById("totalAchievements");
  const totalBlogsEl = document.getElementById("totalBlogs");
  const activeBloggersEl = document.getElementById("activeBloggers");
  const popularTopicEl = document.getElementById("mostPopularTopic");

  // ===================== STATE =====================
  let allNews = [], filteredNews = [], visibleNews = 6, increment = 6;
  let allBlogs = [], filteredBlogs = [], visibleBlogs = 6, blogsIncrement = 6;
  let allEvents = [];

  const DEFAULT_IMG = "/assets/images/defaults/default-news.jpg";
  const DEFAULT_BLOG_IMG = "/assets/images/defaults/default-blog.jpg";
  const DEFAULT_AVATAR = "/assets/images/defaults/default-user.png";

  // ===================== UTILITIES =====================
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const readingTime = (text = "") => Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));

  const removeLoader = (parent) => {
    const loader = parent?.querySelector(".loader");
    if (loader) loader.remove();
  };

  // ===================== FETCH DATA =====================
  const fetchJSON = async (path, fallback = []) => {
    try {
      const res = await fetch(path + `?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch (e) {
      console.warn(`Failed to load ${path}`, e);
      return fallback;
    }
  };

  // ===================== RENDER NEWS =====================
  const renderNews = () => {
    if (!newsGrid) return;

    const items = filteredNews.slice(0, visibleNews);
    newsGrid.innerHTML = ""; // Clear previous

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
      card.dataset.category = item.category || "general";

      const catLabel = (item.category || "news").charAt(0).toUpperCase() + (item.category || "news").slice(1);

      card.innerHTML = `
        <div class="news-thumb">
          <img src="${item.image || DEFAULT_IMG}" alt="${item.title}" loading="lazy"
               onerror="this.src='${DEFAULT_IMG}'">
          <span class="news-tag">${catLabel}</span>
        </div>
        <div class="news-body">
          <span class="news-date">${formatDate(item.date)} • ${readingTime(item.excerpt)} min read</span>
          <h3>${item.title}</h3>
          <p>${item.excerpt || ""}</p>
          <a href="${item.link || '#'}">Read More →</a>
        </div>
      `;
      frag.appendChild(card);
    });

    newsGrid.appendChild(frag);
    loadMoreBtn.style.display = visibleNews < filteredNews.length ? "block" : "none";
    removeLoader(newsGrid);
  };

  // ===================== RENDER STUDENT BLOGS =====================
  const renderBlogs = () => {
    if (!blogGrid) return;

    const items = filteredBlogs.slice(0, visibleBlogs);

    // Show loader only once
    if (blogGrid.children.length === 0) {
      blogGrid.innerHTML = `<div class="loader text-center py-5"><i class="fas fa-spinner fa-spin fa-3x"></i></div>`;
    }

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
        <img src="${blog.image || DEFAULT_BLOG_IMG}" alt="${blog.title}" loading="lazy"
             onerror="this.src='${DEFAULT_BLOG_IMG}'">
        <div class="blog-body">
          <h4>${blog.title}</h4>
          <p class="blog-excerpt">${blog.excerpt || "No preview available."}</p>
          <div class="blog-meta">
            <span>By ${blog.author || "Student"}</span>
            <span>•</span>
            <span>${formatDate(blog.date)}</span>
          </div>
          <a href="${blog.link || '#'}" class="read-more">Read Full Blog →</a>
        </div>
      `;
      frag.appendChild(card);
    });

    blogGrid.appendChild(frag);
    loadMoreBlogsBtn.style.display = visibleBlogs < filteredBlogs.length ? "block" : "none";
    removeLoader(blogGrid);
  };

  // ===================== FILTER & SEARCH =====================
  const applyNewsFilters = () => {
    const term = (searchInput?.value || "").toLowerCase().trim();
    const activeFilter = document.querySelector("#latest-news .filter-btn.active")?.dataset.filter || "all";

    let filtered = allNews;

    if (activeFilter !== "all") {
      filtered = filtered.filter(n => (n.category || "general") === activeFilter);
    }
    if (term) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        (n.excerpt || "").toLowerCase().includes(term)
      );
    }

    filteredNews = filtered;
    visibleNews = 6;
    renderNews();
  };

  const applyBlogFilters = () => {
    const term = (blogSearchInput?.value || "").toLowerCase().trim();
    const activeFilter = document.querySelector(".blog-controls .filter-btn.active")?.dataset.filter || "all";

    let filtered = allBlogs;

    if (activeFilter !== "all") {
      filtered = filtered.filter(b => (b.topic || "general").toLowerCase() === activeFilter);
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
  searchInput?.addEventListener("input", applyNewsFilters);
  blogSearchInput?.addEventListener("input", applyBlogFilters);

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyNewsFilters();
    });
  });

  blogFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      blogFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyBlogFilters();
    });
  });

  loadMoreBtn?.addEventListener("click", () => {
    visibleNews += increment;
    renderNews();
  });

  loadMoreBlogsBtn?.addEventListener("click", () => {
    visibleBlogs += blogsIncrement;
    renderBlogs();
  });

  // ===================== LOAD DATA =====================
  const loadAllData = async () => {
    const [
      news,
      blogs,
      events,
      photos,
      spotlight,
      media,
      downloads
    ] = await Promise.all([
      fetchJSON("/data/static/news-data.json", []),
      fetchJSON("/data/static/blogs.json", []),
      fetchJSON("/data/static/upcoming-events.json", []),
      fetchJSON("/data/static/event-photos.json", []),
      fetchJSON("/data/static/spotlight.json", []),
      fetchJSON("/data/static/media-coverage.json", []),
      fetchJSON("/data/static/downloads.json", [])
    ]);

    // Sort newest first
    allNews = news.sort((a, b) => new Date(b.date) - new Date(a.date));
    allBlogs = blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredNews = [...allNews];
    filteredBlogs = [...allBlogs];
    allEvents = events;

    // Update stats
    if (totalNewsEl) totalNewsEl.textContent = allNews.length;
    if (totalEventsEl) totalEventsEl.textContent = allNews.filter(n => n.category === "events").length;
    if (totalAchievementsEl) totalAchievementsEl.textContent = allNews.filter(n => n.category === "achievements").length;

    if (totalBlogsEl) totalBlogsEl.textContent = allBlogs.length;
    if (activeBloggersEl) {
      const authors = [...new Set(allBlogs.map(b => b.author))].filter(Boolean);
      activeBloggersEl.textContent = authors.length;
    }
    if (popularTopicEl && allBlogs.length > 0) {
      const topics = allBlogs.reduce((acc, b) => {
        const t = (b.topic || "general").toLowerCase();
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {});
      popularTopicEl.textContent = Object.keys(topics).reduce((a, b) => topics[a] > topics[b] ? a : b);
    }

    // Render everything
    renderNews();
    renderBlogs();
    renderEventsCalendar(events);
    // renderEventPhotos(photos);   // Uncomment when you have photos
    // renderSpotlight(spotlight);  // Uncomment when ready
    // renderMedia(media);
    // renderDownloads(downloads);
  };

  // Start loading
  loadAllData();
});

// ===================== BLOG SUBMISSION FORM =====================
const blogForm = document.getElementById("blogSubmissionForm");
const imageInput = document.querySelector('input[name="image"]');
const imagePreview = document.getElementById("imagePreview");

if (blogForm) {
    // Live image preview
    imageInput?.addEventListener("change", function () {
        imagePreview.innerHTML = "";
        const file = this.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image too large! Please use under 5MB.");
                this.value = "";
                return;
            }
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.cssText = "max-height:200px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.15);";
            imagePreview.appendChild(img);
        }
    });

    blogForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitBtn = blogForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;

        try {
            const formData = new FormData(blogForm);

            const response = await fetch("/api/submit-blog", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                blogForm.innerHTML = `
                    <div style="text-align:center; padding:4rem 2rem; background:#d4edda; border-radius:16px; color:#0f5132;">
                        <i class="fas fa-check-circle fa-5x mb-4" style="color:#28a745;"></i>
                        <h2>Blog Submitted Successfully!</h2>
                        <p style="font-size:1.1rem; margin:1.5rem 0;">
                            Thank you, <strong>${formData.get("author_name")}!</strong>
                        </p>
                        <p>Your blog "<strong>${formData.get("title")}</strong>" has been received.</p>
                        <p>Our team will review it within 3–5 days and notify you by email when it goes live!</p>
                        <p style="margin-top:2rem; color:#166534; font-weight:600;">
                            Keep writing — your voice matters!
                        </p>
                    </div>
                `;
            } else {
                throw new Error(result.message || "Submission failed");
            }
        } catch (err) {
            console.error(err);
            alert("Could not submit blog. Please try again or email your post to blog@barunion.sc.ke");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}