// /js/static/contact.js - Interactive features for Contact Us page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Hero Scroll Indicator Fade */
    const heroIndicator = document.querySelector('.page-hero .hero-scroll-indicator');
    if (heroIndicator) {
        window.addEventListener('scroll', () => {
            const opacity = Math.max(0, 1 - window.scrollY / 400);
            heroIndicator.style.opacity = opacity;
        });
    }

    /* 2. FAQ Accordion */
    const faqList = document.getElementById('faqList');
    if (faqList) {
        // If you load FAQs from JSON, do it here. For now, assume static HTML with .faq-item
        const faqItems = faqList.querySelectorAll('.faq-item'); // Add this class to each FAQ in HTML

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all
                    faqItems.forEach(i => i.classList.remove('active'));
                    
                    // Open clicked if it wasn't active
                    if (!isActive) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    /* 3. Contact Form Handling with File Upload */
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    const setLoading = (loading) => {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    };

    const showStatus = (message, isSuccess = true) => {
        // Remove existing status
        const existing = contactForm.querySelector('.form-status');
        if (existing) existing.remove();

        const status = document.createElement('div');
        status.className = `form-status ${isSuccess ? 'success' : 'error'}`;
        status.innerHTML = message;
        contactForm.querySelector('.form-actions').insertBefore(status, contactForm.querySelector('.form-note'));

        // Auto hide
        setTimeout(() => {
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 400);
        }, 10000);
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate required fields
        let hasError = false;
        contactForm.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim() && field.type !== 'file') {
                field.style.borderColor = '#e74c3c';
                hasError = true;
            } else {
                field.style.borderColor = '';
            }
        });

        if (hasError) {
            showStatus('Please fill in all required fields.', false);
            return;
        }

        // Validate file
        const fileInput = document.getElementById('attachment');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > MAX_FILE_SIZE) {
                showStatus('File is too large. Maximum size is 10MB.', false);
                return;
            }
        }

        setLoading(true);

        const formData = new FormData(contactForm);

        try {
            const response = await fetch('/api/contact-message', {  // ← Your backend endpoint
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showStatus(`
                    <strong>Message Sent Successfully!</strong><br>
                    Thank you, ${formData.get('name') || 'Visitor'}. 
                    We've received your message and will reply to 
                    <strong>${formData.get('_replyto')}</strong> within 24 hours.
                `);
                contactForm.reset();
                window.scrollTo({ top: document.querySelector('#contactForm').offsetTop - 100, behavior: 'smooth' });
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            showStatus(`
                <strong>Submission Failed</strong><br>
                Please try again or reach us directly via 
                <a href="mailto:barunionsecondary@gmail.com">email</a> or 
                <a href="https://wa.me/254700735472" target="_blank">WhatsApp</a>.
            `, false);
        } finally {
            setLoading(false);
        }
    });

    // Real-time input feedback
    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.style.borderColor = '#2ecc71';
            }
        });
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                field.style.borderColor = '#e74c3c';
            }
        });
    });

    // File upload visual feedback
    const attachmentInput = document.getElementById('attachment');
    if (attachmentInput) {
        attachmentInput.addEventListener('change', () => {
            const label = attachmentInput.closest('.form-group').querySelector('p');
            if (attachmentInput.files.length > 0) {
                const file = attachmentInput.files[0];
                label.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
                label.style.color = '#2ecc71';
            } else {
                label.textContent = 'PDF, Word, or images only • Max 10MB';
                label.style.color = '';
            }
        });
    }

    /* 4. Back to Top Button */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* 5. Floating WhatsApp Button Hover Effect */
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.addEventListener('mouseenter', () => {
            waFloat.style.transform = 'scale(1.1)';
        });
        waFloat.addEventListener('mouseleave', () => {
            waFloat.style.transform = 'scale(1)';
        });
    }

});