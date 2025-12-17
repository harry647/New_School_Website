// /js/static/about.js - Interactive features for the About page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Counter Animation for Stats */
    const counters = document.querySelectorAll('.stat-number');
    const animateCounter = (el) => {
        const target = +el.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                counters.forEach(counter => animateCounter(counter));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (counters.length > 0) {
        observer.observe(document.querySelector('.stats-grid'));
    }

    /* 2. Star Rating Visual Feedback */
    const ratingLabels = document.querySelectorAll('.rating-container label');
    ratingLabels.forEach(label => {
        label.addEventListener('click', () => {
            const clickedValue = label.previousElementSibling.value;
            ratingLabels.forEach(l => {
                const starValue = l.previousElementSibling.value;
                if (parseInt(starValue) <= parseInt(clickedValue)) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
        });
    });

    /* 3. Form Handling with Fetch API - Pointing to YOUR backend */

    // Helper: Toggle loading state
    const setLoading = (form, loading) => {
        const btnText = form.querySelector('.btn-text');
        const btnLoading = form.querySelector('.btn-loading');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (loading) {
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    };

    // Helper: Show status message
    const showStatus = (statusElId, message, isError = false) => {
        const statusEl = document.getElementById(statusElId);
        statusEl.textContent = message;
        statusEl.className = `form-status ${isError ? 'error' : 'success'}`;
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 8000);
    };

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            setLoading(contactForm, true);

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData); // Convert to JSON object

            try {
                const response = await fetch('/api/contact', {  // ← Change this to your backend endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showStatus('contactFormStatus', 'Thank you! Your message has been sent successfully.');
                    contactForm.reset();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Server error');
                }
            } catch (err) {
                showStatus('contactFormStatus', 'Oops! Something went wrong. Please try again later.', true);
                console.error('Contact form error:', err);
            } finally {
                setLoading(contactForm, false);
            }
        });
    }

    // Feedback Form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate rating
            const rating = feedbackForm.querySelector('input[name="rating"]:checked');
            if (!rating) {
                document.getElementById('feedbackRating-error').textContent = 'Please select a rating';
                return;
            }
            document.getElementById('feedbackRating-error').textContent = '';

            setLoading(feedbackForm, true);

            const formData = new FormData(feedbackForm);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/feedback', {  // ← Change this to your backend endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showStatus('feedbackFormStatus', 'Thank you for your feedback! We truly appreciate it.');
                    feedbackForm.reset();
                    // Reset star visuals
                    ratingLabels.forEach(l => l.classList.remove('active'));
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Server error');
                }
            } catch (err) {
                showStatus('feedbackFormStatus', 'Submission failed. Please try again later.', true);
                console.error('Feedback form error:', err);
            } finally {
                setLoading(feedbackForm, false);
            }
        });
    }

});