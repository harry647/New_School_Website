// /js/static/alumni.js - Interactive features for Alumni Network page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Hero Scroll Indicator Fade */
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 500);
            scrollIndicator.style.opacity = opacity;
        });
    }

    /* 2. Timeline Animation on Scroll */
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, index * 200);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => timelineObserver.observe(item));

    /* 3. Animate Hero Stats Counters */
    const heroStats = document.querySelectorAll('.hero-stats-grid .stat-card h3');
    const animateHeroStat = (el) => {
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

    const heroObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            heroStats.forEach(stat => animateHeroStat(stat));
            heroObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    const heroSection = document.querySelector('.page-hero');
    if (heroSection) heroObserver.observe(heroSection);

    /* 4. Load Notable Alumni from JSON (with fallback to static) */
    const notableGrid = document.getElementById('notableAlumni');
    const notableLoader = notableGrid.previousElementSibling;

    fetch('/data/static/notable-alumni.json')  // Create this JSON file for easy updates
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            notableGrid.innerHTML = data.map(alum => `
                <div class="alumni-card" data-aos="fade-up">
                    <img src="${alum.photo}" alt="${alum.name}" onerror="this.src='/assets/images/common/placeholder-alumni.jpg'">
                    <h3>${alum.name}</h3>
                    <p>${alum.achievement}</p>
                </div>
            `).join('');
        })
        .catch(() => {
            // Fallback: keep static cards if JSON fails
            console.warn('Notable alumni JSON not loaded – using static fallback');
        })
        .finally(() => {
            notableLoader.style.display = 'none';
        });

    /* 5. Load Upcoming Events from JSON */
    const eventsGrid = document.getElementById('alumniEvents');
    const eventsLoader = eventsGrid.previousElementSibling;

    fetch('/data/static/alumni-events.json')  // Create this for dynamic events
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            if (data.length === 0) {
                eventsGrid.innerHTML = '<p class="text-center text-gray-600">No upcoming events at this time. Check back soon!</p>';
                return;
            }
            eventsGrid.innerHTML = data.map(event => `
                <div class="event-card" data-aos="fade-up">
                    <div class="event-date">
                        <span class="event-month">${event.month}</span>
                        <span class="event-day">${event.day}</span>
                    </div>
                    <div class="event-info">
                        <h3>${event.title}</h3>
                        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p class="event-desc">${event.description}</p>
                        <a href="${event.rsvp || '#register'}" class="btn-outline">RSVP / Learn More →</a>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            eventsGrid.innerHTML = `
                <div class="event-card" data-aos="fade-up">
                    <div class="event-date">
                        <span class="event-month">Jul</span>
                        <span class="event-day">15</span>
                    </div>
                    <div class="event-info">
                        <h3>Annual Alumni Reunion 2026</h3>
                        <p class="event-location"><i class="fas fa-map-marker-alt"></i> School Grounds, Kisumu</p>
                        <p class="event-desc">Join us for a day of celebration, networking, mentorship sessions, and school tours.</p>
                        <a href="#register" class="btn-outline">Express Interest →</a>
                    </div>
                </div>
                <div class="event-card" data-aos="fade-up">
                    <div class="event-date">
                        <span class="event-month">Mar</span>
                        <span class="event-day">20</span>
                    </div>
                    <div class="event-info">
                        <h3>Career Mentorship Day</h3>
                        <p class="event-location"><i class="fas fa-map-marker-alt"></i> Virtual & In-Person</p>
                        <p class="event-desc">Alumni share industry insights and guide current students on career paths.</p>
                        <a href="#register" class="btn-outline">Sign Up to Mentor →</a>
                    </div>
                </div>
            `;
        })
        .finally(() => {
            eventsLoader.style.display = 'none';
        });

    /* 6. Alumni Registration Form Handling (with file uploads) */
    const registerForm = document.querySelector('.register-form-card form');
    if (!registerForm) return;

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    const setLoading = (loading) => {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    const showStatus = (message, isSuccess = true) => {
        const existing = registerForm.querySelector('.form-status');
        if (existing) existing.remove();

        const status = document.createElement('div');
        status.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        status.innerHTML = message;
        registerForm.querySelector('.form-actions').appendChild(status);

        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 400);
        }, 10000);
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let hasError = false;
        registerForm.querySelectorAll('[required]').forEach(field => {
            if (!field.value && field.type !== 'file') {
                field.style.borderColor = '#e74c3c';
                hasError = true;
            } else {
                field.style.borderColor = '';
            }
        });

        // File size & type validation
        const fileInputs = registerForm.querySelectorAll('input[type="file"]');
        for (let input of fileInputs) {
            if (input.files.length > 0) {
                const file = input.files[0];
                if (file.size > MAX_FILE_SIZE) {
                    showStatus(`File "${file.name}" exceeds 5MB limit.`, false);
                    return;
                }
            }
        }

        if (hasError) {
            showStatus('Please fill all required fields.', false);
            return;
        }

        setLoading(true);

        const formData = new FormData(registerForm);

        try {
            const response = await fetch('/api/alumni-registration', {  // Change to your backend endpoint
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showStatus(`
                    <strong>Welcome to the Alumni Network!</strong><br>
                    Thank you, ${formData.get('name') || 'Alumnus'}. 
                    Your registration has been received. We'll send a confirmation to ${formData.get('_replyto')} soon.
                `);
                registerForm.reset();
                document.querySelector('#register').scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            console.error(err);
            showStatus(`
                <strong>Submission Failed</strong><br>
                Please try again or email alumni@barunionschool.ac.ke with your details.
            `, false);
        } finally {
            setLoading(false);
        }
    });

    // File upload visual feedback
    registerForm.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', () => {
            const label = input.parentElement;
            if (input.files.length > 0) {
                label.style.color = '#2ecc71';
                label.querySelector('label').textContent += ` — ${input.files[0].name}`;
            }
        });
    });

});