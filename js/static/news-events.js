// /js/static/news-events.js - Full interactive News & Events page

document.addEventListener('DOMContentLoaded', () => {

    const ITEMS_PER_PAGE = 9;
    let currentNewsPage = 1;
    let currentBlogPage = 1;
    let allNews = [];
    let allBlogs = [];
    let filteredNews = [];
    let filteredBlogs = [];

    /* 1. Load & Render News */
    const newsGrid = document.getElementById('newsGrid');
    const newsLoader = newsGrid.querySelector('.loader');
    const noResults = document.getElementById('noResults');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const searchInput = document.getElementById('newsSearch');
    const filterBtns = document.querySelectorAll('.news-filters .filter-btn');

    fetch('/data/static/news-events.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            allNews = data.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first
            filteredNews = allNews;
            updateNewsStats();
            renderNews();
            populateFeaturedCarousel();
        })
        .catch(() => {
            newsGrid.innerHTML = '<p class="text-center text-gray-600">Unable to load news. Please try again later.</p>';
        })
        .finally(() => newsLoader.style.display = 'none');

    function renderNews() {
        const start = 0;
        const end = currentNewsPage * ITEMS_PER_PAGE;
        const toShow = filteredNews.slice(0, end);

        if (currentNewsPage === 1) newsGrid.innerHTML = '';

        const fragment = document.createDocumentFragment();
        toShow.slice((currentNewsPage - 1) * ITEMS_PER_PAGE).forEach(item => {
            const article = document.createElement('article');
            article.className = 'news-card';
            article.innerHTML = `
                <div class="news-img">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <span class="news-category">${item.category}</span>
                </div>
                <div class="news-body">
                    <span class="news-date">${formatDate(item.date)}</span>
                    <h3>${item.title}</h3>
                    <p>${item.excerpt}</p>
                    <a href="${item.link || '#'}">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            fragment.appendChild(article);
        });
        newsGrid.appendChild(fragment);

        // Visibility controls
        noResults.style.display = filteredNews.length === 0 ? 'block' : 'none';
        loadMoreBtn.style.display = end < filteredNews.length ? 'block' : 'none';
    }

    function updateNewsStats() {
        document.getElementById('totalNews').textContent = allNews.length;
        document.getElementById('totalEvents').textContent = allNews.filter(n => n.category === 'events').length;
        document.getElementById('totalAchievements').textContent = allNews.filter(n => n.category === 'achievements').length;
    }

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filteredNews = filter === 'all' ? allNews : allNews.filter(n => n.category === filter);
            currentNewsPage = 1;
            renderNews();
        });
    });

    // Search
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredNews = allNews.filter(n =>
            n.title.toLowerCase().includes(term) ||
            n.excerpt.toLowerCase().includes(term) ||
            n.category.toLowerCase().includes(term)
        );
        currentNewsPage = 1;
        renderNews();
    });

    // Load More
    loadMoreBtn?.addEventListener('click', () => {
        currentNewsPage++;
        renderNews();
    });

    /* 2. Featured Carousel */
    function populateFeaturedCarousel() {
        const featured = allNews.filter(n => n.featured).slice(0, 5);
        const wrapper = document.getElementById('featuredNews');

        wrapper.innerHTML = featured.map(item => `
            <div class="swiper-slide">
                <div class="featured-card">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="featured-overlay">
                        <span class="featured-tag">${item.category}</span>
                        <h3>${item.title}</h3>
                        <p>${item.excerpt}</p>
                        <a href="${item.link || '#'}" class="btn-outline">Read Story</a>
                    </div>
                </div>
            </div>
        `).join('');

        new Swiper('#featuredCarousel', {
            loop: featured.length > 1,
            autoplay: { delay: 5000 },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        });
    }

    /* 3. Student Blogs - Dynamic */
    const blogGrid = document.getElementById('blogGrid');
    const blogLoader = blogGrid.querySelector('.loader');
    const blogNoResults = document.getElementById('noBlogResults');
    const loadMoreBlogs = document.getElementById('loadMoreBlogs');
    const blogSearch = document.getElementById('blogSearch');
    const blogFilterBtns = document.querySelectorAll('.blog-filters .filter-btn');

    fetch('/data/static/student-blogs.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            allBlogs = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            filteredBlogs = allBlogs;
            updateBlogStats();
            renderBlogs();
        })
        .catch(() => {
            blogGrid.innerHTML = '<p class="text-center text-gray-600">No blogs available yet.</p>';
        })
        .finally(() => blogLoader.style.display = 'none');

    function renderBlogs() {
        const start = 0;
        const end = currentBlogPage * ITEMS_PER_PAGE;
        const toShow = filteredBlogs.slice(0, end);

        if (currentBlogPage === 1) blogGrid.innerHTML = '';

        const fragment = document.createDocumentFragment();
        toShow.slice((currentBlogPage - 1) * ITEMS_PER_PAGE).forEach(blog => {
            const div = document.createElement('div');
            div.className = 'blog-card';
            div.innerHTML = `
                <div class="blog-header">
                    ${blog.featuredImage ? `<img src="${blog.featuredImage}" alt="${blog.title}">` : ''}
                    <div class="blog-meta">
                        <span class="author">By ${blog.author}</span>
                        <span class="grade">${blog.grade}</span>
                        <span class="date">${formatDate(blog.date)}</span>
                    </div>
                </div>
                <h3>${blog.title}</h3>
                <p>${blog.excerpt}</p>
                <a href="#" class="read-more">Read Full Blog →</a>
            `;
            fragment.appendChild(div);
        });
        blogGrid.appendChild(fragment);

        blogNoResults.style.display = filteredBlogs.length === 0 ? 'block' : 'none';
        loadMoreBlogs.style.display = end < filteredBlogs.length ? 'block' : 'none';
    }

    function updateBlogStats() {
        document.getElementById('totalBlogs').textContent = allBlogs.length;
        const authors = [...new Set(allBlogs.map(b => b.author))];
        document.getElementById('activeBloggers').textContent = authors.length;
        // Most popular topic
        const topics = allBlogs.reduce((acc, b) => {
            acc[b.topic] = (acc[b.topic] || 0) + 1;
            return acc;
        }, {});
        const topTopic = Object.keys(topics).reduce((a, b) => topics[a] > topics[b] ? a : b, '');
        document.getElementById('mostPopularTopic').textContent = topTopic || '—';
    }

    // Blog Filters & Search
    blogFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            blogFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filteredBlogs = filter === 'all' ? allBlogs : allBlogs.filter(b => b.topic === filter);
            currentBlogPage = 1;
            renderBlogs();
        });
    });

    blogSearch?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredBlogs = allBlogs.filter(b =>
            b.title.toLowerCase().includes(term) ||
            b.excerpt.toLowerCase().includes(term) ||
            b.author.toLowerCase().includes(term)
        );
        currentBlogPage = 1;
        renderBlogs();
    });

    loadMoreBlogs?.addEventListener('click', () => {
        currentBlogPage++;
        renderBlogs();
    });

    /* 4. Blog Submission Form */
    const blogForm = document.querySelector('.blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(blogForm);
            const file = blogForm.featured_image.files[0];

            if (file && file.size > 10 * 1024 * 1024) {
                alert('Image too large! Max 10MB.');
                return;
            }

            try {
                const response = await fetch('/api/submit-blog', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Thank you! Your blog has been submitted and is pending review.');
                    blogForm.reset();
                    window.scrollTo({ top: document.getElementById('submitBlog').offsetTop, behavior: 'smooth' });
                } else {
                    throw new Error();
                }
            } catch (err) {
                alert('Submission failed. Please try again or contact the admin.');
            }
        });
    }

    /* Helper: Format Date */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
    }

});