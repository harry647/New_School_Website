// /js/static/admissions.js - Admissions with File Upload Support

document.addEventListener('DOMContentLoaded', () => {

    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 500);
            scrollIndicator.style.opacity = opacity;
        });
    }

    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('in-view'), index * 150);
            }
        });
    }, { threshold: 0.3 });
    timelineItems.forEach(item => timelineObserver.observe(item));

    const reqCards = document.querySelectorAll('.requirement-card');
    reqCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.12)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    /* ========== FORM WITH FILE UPLOAD ========== */
    const applyForm = document.querySelector('.apply-form');
    if (!applyForm) return;

    const submitBtn = applyForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    const setLoading = (loading) => {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    const showStatus = (message, isSuccess = true) => {
        const existing = applyForm.querySelector('.form-status');
        if (existing) existing.remove();

        const status = document.createElement('div');
        status.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        status.innerHTML = message;
        applyForm.querySelector('.form-actions').appendChild(status);

        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 400);
        }, 10000);
    };

    // File size limit: 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate required text fields
        let hasError = false;
        applyForm.querySelectorAll('[required]:not([type="file"])').forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                hasError = true;
            } else {
                field.style.borderColor = '';
            }
        });

        // Validate required files
        applyForm.querySelectorAll('input[type="file"][required]').forEach(input => {
            if (!input.files || input.files.length === 0) {
                input.style.borderColor = '#e74c3c';
                hasError = true;
            } else {
                input.style.borderColor = '';
            }
        });

        if (hasError) {
            showStatus('Please complete all required fields and upload required documents.', false);
            return;
        }

        // Check file sizes and types
        const fileInputs = applyForm.querySelectorAll('input[type="file"]');
        for (let input of fileInputs) {
            if (input.files.length > 0) {
                const file = input.files[0];
                if (file.size > MAX_FILE_SIZE) {
                    showStatus(`File "${file.name}" is too large. Maximum size is 5MB.`, false);
                    return;
                }
                const allowed = input.accept.split(',');
                const ext = '.' + file.name.split('.').pop().toLowerCase();
                if (!allowed.some(type => type.trim() === ext)) {
                    showStatus(`Invalid file type for "${file.name}". Please upload ${input.accept}.`, false);
                    return;
                }
            }
        }

        setLoading(true);

        const formData = new FormData(applyForm);

        try {
            const response = await fetch('/api/admission-application', {  // Your backend endpoint
                method: 'POST',
                body: formData  // Do NOT set Content-Type — browser sets it with boundary
            });

            if (response.ok) {
                const result = await response.json().catch(() => ({}));
                showStatus(`
                    <strong>Application Submitted Successfully!</strong><br>
                    Thank you, ${formData.get('parent_name') || ''}. 
                    We have received your application and documents.<br>
                    Our team will review and contact you via ${formData.get('_replyto')} within 24–48 hours.
                `);
                applyForm.reset();
                document.querySelector('#apply').scrollIntoView({ behavior: 'smooth' });
            } else {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Submission failed');
            }
        } catch (err) {
            console.error('Submission error:', err);
            showStatus(`
                <strong>Submission Failed</strong><br>
                There was an issue submitting your application. 
                Please try again or email your documents to 
                <a href="mailto:admissions@barunionschool.ac.ke">admissions@barunionschool.ac.ke</a>
            `, false);
        } finally {
            setLoading(false);
        }
    });

    // Visual feedback on file selection
    applyForm.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', () => {
            const label = input.closest('.upload-group').querySelector('.file-info');
            if (input.files.length > 0) {
                const file = input.files[0];
                label.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
                label.style.color = '#2ecc71';
                input.style.borderColor = '#2ecc71';
            } else {
                label.textContent = label.dataset.original || 'No file chosen';
                label.style.color = '';
            }
        });
    });

    // Store original file info text
    applyForm.querySelectorAll('.file-info').forEach(span => {
        span.dataset.original = span.textContent;
    });

});