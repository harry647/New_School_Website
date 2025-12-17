// /js/static/career-guidance.js - Interactive features for Career & Guidance page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Hero Scroll Indicator Fade */
    const scrollIndicator = document.querySelector('.page-hero .hero-scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 400);
            scrollIndicator.style.opacity = opacity;
        });
    }

    /* 2. Service Cards Hover Lift */
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    /* 3. Success Stories Carousel - Dynamic from JSON */
    const swiperWrapper = document.querySelector('#successStoriesSwiper .swiper-wrapper');
    const storiesLoader = document.querySelector('#successStories .loader');

    fetch('/data/static/success-stories.json')
        .then(res => {
            if (!res.ok) throw new Error('Stories not found');
            return res.json();
        })
        .then(data => {
            swiperWrapper.innerHTML = data.map(story => `
                <div class="swiper-slide">
                    <div class="story-card">
                        <img src="${story.photo}" alt="${story.name}" onerror="this.src='/assets/images/common/placeholder-student.jpg'">
                        <h3>${story.name}</h3>
                        <p class="batch">${story.batch}</p>
                        <p class="achievement">${story.achievement}</p>
                        <p>${story.story}</p>
                    </div>
                </div>
            `).join('');

            initializeSwiper();
        })
        .catch(() => {
            // Fallback to static content (already in HTML)
            console.warn('Success stories JSON failed – using static fallback');
            initializeSwiper();
        })
        .finally(() => {
            if (storiesLoader) storiesLoader.style.display = 'none';
        });

    function initializeSwiper() {
        new Swiper('#successStoriesSwiper', {
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            slidesPerView: 1,
            spaceBetween: 30,
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }

    /* 4. Stats Counter Animation */
    const statsGrid = document.getElementById('careerStatsGrid');
    const statNumbers = statsGrid.querySelectorAll('h3');

    const animateCounter = (el) => {
        const targetText = el.textContent.trim();
        const isPlus = targetText.includes('+');
        const target = parseInt(targetText.replace(/[^\d]/g, ''));
        let start = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.textContent = target + (isPlus ? '+' : '');
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start) + (isPlus ? '+' : '');
            }
        }, 20);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            statNumbers.forEach(num => animateCounter(num));
            statsObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    if (statsGrid) statsObserver.observe(statsGrid);

    /* 5. Counseling Booking Form */
    const counselingForm = document.getElementById('counselingForm');
    if (!counselingForm) return;

    const submitBtn = counselingForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('sessionDate');
    if (dateInput) dateInput.min = today;

    const setLoading = (loading) => {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking Session...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    const showStatus = (message, isSuccess = true) => {
        const existing = counselingForm.querySelector('.form-status');
        if (existing) existing.remove();

        const status = document.createElement('div');
        status.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        status.innerHTML = message;
        counselingForm.querySelector('.form-actions').appendChild(status);

        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 400);
        }, 10000);
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    counselingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let hasError = false;
        counselingForm.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim() && field.type !== 'file') {
                field.style.borderColor = '#e74c3c';
                hasError = true;
            } else {
                field.style.borderColor = '';
            }
        });

        // File validation
        const fileInput = document.getElementById('resume');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > MAX_FILE_SIZE) {
                showStatus('File too large. Maximum 10MB allowed.', false);
                return;
            }
        }

        if (hasError) {
            showStatus('Please fill all required fields.', false);
            return;
        }

        setLoading(true);

        const formData = new FormData(counselingForm);

        try {
            const response = await fetch('/api/career-counseling-booking', {  // Your backend endpoint
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showStatus(`
                    <strong>Session Booked Successfully!</strong><br>
                    Thank you, ${formData.get('student_name') || 'Student'}. 
                    We have received your request for a counseling session on ${formData.get('date')}.<br>
                    A confirmation email with Zoom link will be sent to ${formData.get('_replyto')} within 24–48 hours.
                `);
                counselingForm.reset();
                document.querySelector('#book-session').scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('Booking failed');
            }
        } catch (err) {
            console.error(err);
            showStatus(`
                <strong>Booking Failed</strong><br>
                Please try again or email guidance@barunionschool.ac.ke to schedule your session.
            `, false);
        } finally {
            setLoading(false);
        }
    });

    // Real-time feedback
    counselingForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                field.style.borderColor = '#e74c3c';
            }
        });
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.style.borderColor = '#2ecc71';
            }
        });
    });

    // File upload feedback
    const resumeInput = document.getElementById('resume');
    if (resumeInput) {
        resumeInput.addEventListener('change', () => {
            const label = resumeInput.closest('.form-group').querySelector('label');
            if (resumeInput.files.length > 0) {
                label.textContent = `Resume Uploaded: ${resumeInput.files[0].name}`;
                label.style.color = '#2ecc71';
            }
        });
    }

});