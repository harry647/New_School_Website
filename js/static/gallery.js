// /js/static/gallery.js - Advanced Gallery with Upload, Pagination, Search & ZIP

document.addEventListener('DOMContentLoaded', () => {

    /* Common Variables */
    const ITEMS_PER_PAGE = 12;
    let currentPhotoPage = 1;
    let currentVideoPage = 1;
    let allPhotos = [];
    let allVideos = [];
    let filteredPhotos = [];
    let filteredVideos = [];

    /* 1. Photo Gallery - Dynamic + Filter + Search + Pagination + ZIP */
    const galleryGrid = document.getElementById('galleryGrid');
    const photoLoader = galleryGrid.querySelector('.loader');
    const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
    const searchInput = document.getElementById('gallerySearch');
    const loadMorePhotos = document.getElementById('loadMorePhotos');
    const downloadAlbum = document.getElementById('downloadAlbum');

    fetch('/data/gallery-photos.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            allPhotos = data.map(p => ({ ...p, id: Math.random() })); // add unique id
            filteredPhotos = allPhotos;
            renderPhotos();
        })
        .catch(() => {
            allPhotos = []; // fallback empty
            renderPhotos();
        })
        .finally(() => photoLoader.style.display = 'none');

    function renderPhotos() {
        const start = 0;
        const end = currentPhotoPage * ITEMS_PER_PAGE;
        const toShow = filteredPhotos.slice(0, end);

        if (currentPhotoPage === 1) {
            galleryGrid.innerHTML = '';
        }

        const fragment = document.createDocumentFragment();
        toShow.slice((currentPhotoPage - 1) * ITEMS_PER_PAGE).forEach(photo => {
            const a = document.createElement('a');
            a.href = photo.src;
            a.dataset.lightbox = "gallery";
            a.dataset.title = photo.title || '';
            a.innerHTML = `
                <div class="gallery-item">
                    <img src="${photo.thumb || photo.src}" alt="${photo.title || ''}" loading="lazy">
                    <div class="gallery-overlay">
                        <i class="fas fa-search-plus"></i>
                        <p>${photo.title || ''}</p>
                    </div>
                </div>
            `;
            fragment.appendChild(a);
        });
        galleryGrid.appendChild(fragment);

        loadMorePhotos.style.display = end < filteredPhotos.length ? 'block' : 'none';
    }

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filteredPhotos = filter === 'all' ? allPhotos : allPhotos.filter(p => p.category === filter);
            currentPhotoPage = 1;
            renderPhotos();
        });
    });

    // Search
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredPhotos = allPhotos.filter(p => 
            (p.title || '').toLowerCase().includes(term) ||
            (p.description || '').toLowerCase().includes(term)
        );
        currentPhotoPage = 1;
        renderPhotos();
    });

    // Load More
    loadMorePhotos?.addEventListener('click', () => {
        currentPhotoPage++;
        renderPhotos();
    });

    // Download Album as ZIP (client-side using JSZip)
    downloadAlbum?.addEventListener('click', async () => {
        if (filteredPhotos.length === 0) return alert('No photos to download');

        const zip = new JSZip();
        const folder = zip.folder("BarUnion_Gallery_Album");

        const promises = filteredPhotos.slice(0, 50).map(async (photo, i) => { // limit to 50
            try {
                const response = await fetch(photo.src);
                const blob = await response.blob();
                folder.file(`photo_${i + 1}_${photo.title?.slice(0,20) || 'image'}.jpg`, blob);
            } catch (e) { console.warn('Failed to add:', photo.src); }
        });

        await Promise.all(promises);
        zip.generateAsync({ type: "blob" }).then(blob => {
            saveAs(blob, "BarUnion_Gallery_Album.zip");
        });
    });

    /* 2. Video Gallery - Dynamic + Tabs + Search + Pagination */
    const videoGrid = document.getElementById('videoGrid');
    const videoTabs = document.querySelectorAll('#videoCategories .tab-btn');
    const videoSearch = document.getElementById('videoSearch');
    const loadMoreVideos = document.getElementById('loadMoreVideos');

    fetch('/data/gallery-videos.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            allVideos = data;
            filteredVideos = allVideos;
            renderVideos();
        })
        .catch(() => {
            filteredVideos = allVideos = [];
            renderVideos();
        });

    function renderVideos() {
        const start = 0;
        const end = currentVideoPage * ITEMS_PER_PAGE;
        const toShow = filteredVideos.slice(0, end);

        if (currentVideoPage === 1) videoGrid.innerHTML = '';

        const fragment = document.createDocumentFragment();
        toShow.slice((currentVideoPage - 1) * ITEMS_PER_PAGE).forEach(video => {
            const div = document.createElement('div');
            div.className = 'video-item';
            div.dataset.category = video.category;
            div.innerHTML = `
                <iframe src="${video.embedUrl}" allowfullscreen loading="lazy" frameborder="0"></iframe>
                <h3>${video.title}</h3>
                <p>${video.description}</p>
            `;
            fragment.appendChild(div);
        });
        videoGrid.appendChild(fragment);

        loadMoreVideos.style.display = end < filteredVideos.length ? 'block' : 'none';
    }

    videoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            videoTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.tab;
            filteredVideos = cat === 'all' ? allVideos : allVideos.filter(v => v.category === cat);
            currentVideoPage = 1;
            renderVideos();
        });
    });

    videoSearch?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filteredVideos = allVideos.filter(v =>
            v.title.toLowerCase().includes(term) ||
            v.description.toLowerCase().includes(term)
        );
        currentVideoPage = 1;
        renderVideos();
    });

    loadMoreVideos?.addEventListener('click', () => {
        currentVideoPage++;
        renderVideos();
    });
    
    /* 3. Video Upload Modal - With Real Backend Integration */
    const uploadModal = document.getElementById('videoUploadModal');
    const openBtn = document.getElementById('openUploadModal');
    const closeBtn = uploadModal?.querySelector('.close-modal');
    const uploadForm = document.getElementById('videoUploadForm');
    const fileInput = document.getElementById('videoFile');
    const fileInfo = document.getElementById('fileInfo');
    const uploadStatus = document.getElementById('uploadStatus'); // We'll add this in HTML
    const submitBtn = uploadForm?.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn?.innerHTML || '';

    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

    // Open / Close Modal
    openBtn?.addEventListener('click', () => {
        uploadModal.style.display = 'flex';
        uploadForm.reset();
        fileInfo.textContent = 'No file selected';
        fileInfo.style.color = '';
        if (uploadStatus) uploadStatus.classList.add('hidden');
    });

    closeBtn?.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    uploadModal?.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    });

    // File selection feedback
    fileInput?.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            fileInfo.textContent = `${file.name} (${sizeMB} MB)`;
            fileInfo.style.color = file.size > MAX_FILE_SIZE ? '#e74c3c' : '#2ecc71';
        } else {
            fileInfo.textContent = 'No file selected';
            fileInfo.style.color = '';
        }
    });

    // Form Submission with Backend
    uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
            showUploadStatus('Please select a video file.', false);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showUploadStatus('Video file is too large! Maximum size is 500MB.', false);
            return;
        }

        // Validate other required fields
        const requiredFields = uploadForm.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                showUploadStatus('Please fill in all required fields.', false);
                return;
            }
        }

        // Prepare for upload
        setUploadLoading(true);

        const formData = new FormData(uploadForm);

        try {
            const response = await fetch('/api/upload-video', {  // ← Your actual backend endpoint
                method: 'POST',
                body: formData,
                // Do NOT set Content-Type header — browser sets it with proper boundary
            });

            if (response.ok) {
                const result = await response.json().catch(() => ({}));
                showUploadStatus(`
                    <strong>Thank you!</strong><br>
                    Your video "<strong>${formData.get('title')}</strong>" has been successfully submitted.<br>
                    Our team will review it and add it to the gallery soon.<br>
                    We'll notify you at <strong>${formData.get('email')}</strong>.
                `, true);

                // Reset form & close modal after delay
                setTimeout(() => {
                    uploadModal.style.display = 'none';
                    uploadForm.reset();
                    fileInfo.textContent = 'No file selected';
                }, 4000);
            } else {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Video upload error:', err);
            showUploadStatus(`
                <strong>Upload Failed</strong><br>
                There was a problem submitting your video.<br>
                Possible reasons: network issue, server error, or file format not supported.<br>
                Please try again or contact <a href="mailto:gallery@barunionschool.ac.ke">gallery@barunionschool.ac.ke</a>.
            `, false);
        } finally {
            setUploadLoading(false);
        }
    });

    // Helper: Loading state
    function setUploadLoading(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Video...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    // Helper: Show status message
    function showUploadStatus(message, isSuccess = true) {
        if (!uploadStatus) return;

        uploadStatus.innerHTML = message;
        uploadStatus.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        uploadStatus.classList.remove('hidden');

        // Auto scroll to status
        uploadStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* 4. Photo Upload Modal - With Backend Integration */
    const photoUploadModal = document.getElementById('photoUploadModal');
    const openPhotoBtn = document.getElementById('openPhotoUploadModal');
    const closePhotoBtn = photoUploadModal?.querySelector('.close-modal');
    const photoUploadForm = document.getElementById('photoUploadForm');
    const photoFilesInput = document.getElementById('photoFiles');
    const selectedPhotosList = document.getElementById('selectedPhotosList');
    const photoUploadStatus = document.getElementById('photoUploadStatus');
    const photoSubmitBtn = photoUploadForm?.querySelector('button[type="submit"]');
    const originalPhotoBtnText = photoSubmitBtn?.innerHTML || '';

    const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB per photo
    const MAX_PHOTOS = 10;

    openPhotoBtn?.addEventListener('click', () => {
        photoUploadModal.style.display = 'flex';
        photoUploadForm.reset();
        selectedPhotosList.innerHTML = '';
        if (photoUploadStatus) photoUploadStatus.classList.add('hidden');
    });

    closePhotoBtn?.addEventListener('click', () => {
        photoUploadModal.style.display = 'none';
    });

    photoUploadModal?.addEventListener('click', (e) => {
        if (e.target === photoUploadModal) {
            photoUploadModal.style.display = 'none';
        }
    });

    // Show selected photos preview
    photoFilesInput?.addEventListener('change', () => {
        selectedPhotosList.innerHTML = '';
        const files = Array.from(photoFilesInput.files);

        if (files.length > MAX_PHOTOS) {
            showPhotoStatus(`You can only upload up to ${MAX_PHOTOS} photos at once.`, false);
            photoFilesInput.value = '';
            return;
        }

        files.forEach((file, index) => {
            if (file.size > MAX_PHOTO_SIZE) {
                showPhotoStatus(`"${file.name}" is too large (max 10MB).`, false);
                photoFilesInput.value = '';
                return;
            }

            const div = document.createElement('div');
            div.className = 'selected-file-item';
            div.innerHTML = `
                <span><strong>${index + 1}.</strong> ${file.name}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            `;
            selectedPhotosList.appendChild(div);
        });
    });

    // Photo Upload Submission
    photoUploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const files = photoFilesInput.files;
        if (files.length === 0) {
            showPhotoStatus('Please select at least one photo.', false);
            return;
        }

        if (files.length > MAX_PHOTOS) {
            showPhotoStatus(`Maximum ${MAX_PHOTOS} photos allowed.`, false);
            return;
        }

        // Check file sizes
        for (let file of files) {
            if (file.size > MAX_PHOTO_SIZE) {
                showPhotoStatus(`"${file.name}" exceeds 10MB limit.`, false);
                return;
            }
        }

        setPhotoLoading(true);

        const formData = new FormData();

        // Append text fields
        formData.append('name', photoUploadForm.name.value);
        formData.append('email', photoUploadForm.email.value);
        formData.append('category', photoUploadForm.category.value);
        formData.append('event_date', photoUploadForm.event_date.value || '');
        formData.append('description', photoUploadForm.description.value);

        // Append all photos
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        try {
            const response = await fetch('/api/upload-photos', {  // ← Your backend endpoint
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json().catch(() => ({}));
                showPhotoStatus(`
                    <strong>Thank You!</strong><br>
                    Your ${files.length} photo(s) have been successfully submitted.<br>
                    They will be reviewed and added to the "<strong>${photoUploadForm.category.options[photoUploadForm.category.selectedIndex].text}</strong>" gallery soon.<br>
                    We'll email you at <strong>${formData.get('email')}</strong> when they're live!
                `, true);

                setTimeout(() => {
                    photoUploadModal.style.display = 'none';
                    photoUploadForm.reset();
                    selectedPhotosList.innerHTML = '';
                }, 5000);
            } else {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Photo upload error:', err);
            showPhotoStatus(`
                <strong>Upload Failed</strong><br>
                There was an issue submitting your photos.<br>
                Please try again or email them to <a href="mailto:gallery@barunionschool.ac.ke">gallery@barunionschool.ac.ke</a>
            `, false);
        } finally {
            setPhotoLoading(false);
        }
    });

    // Helpers
    function setPhotoLoading(loading) {
        if (loading) {
            photoSubmitBtn.disabled = true;
            photoSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Photos...';
        } else {
            photoSubmitBtn.disabled = false;
            photoSubmitBtn.innerHTML = originalPhotoBtnText;
        }
    }

    function showPhotoStatus(message, isSuccess = true) {
        photoUploadStatus.innerHTML = message;
        photoUploadStatus.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        photoUploadStatus.classList.remove('hidden');
        photoUploadStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* 5. 360° Virtual Tour */
    pannellum.viewer('#panorama', {
        type: "multires",
        multiRes: {
            basePath: "/assets/images/360/school-tour.jpg",
            path: "/%l/%s%y_%x",
            fallbackPath: "/fallback/%s",
            extension: "jpg",
            tileResolution: 512,
            maxLevel: 4,
            cubeResolution: 2048
        },
        autoLoad: true,
        showControls: true,
        hotSpots: [
            { pitch: -10, yaw: 180, type: "info", text: "Main Academic Block" },
            { pitch: -5, yaw: 0, type: "info", text: "Library & Resource Center" },
            { pitch: -15, yaw: -90, type: "info", text: "Sports Field" }
        ]
    });

    /* 4. Stats Animation */
    const statsGrid = document.getElementById('galleryStats');
    const statNumbers = statsGrid?.querySelectorAll('h3');

    const animateStat = (el) => {
        const targetText = el.textContent.trim();
        const suffix = targetText.match(/[\+%]/)?.[0] || '';
        const target = parseInt(targetText);
        let start = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start) + suffix;
            }
        }, 20);
    };

    if (statsGrid && statNumbers) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                statNumbers.forEach(animateStat);
                observer.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });
        observer.observe(statsGrid);
    }

    /* 5. Back to Top */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

});