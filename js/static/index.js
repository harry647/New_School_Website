// /js/static/index.js - Interactive features for Homepage

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Preloader (already in HTML, enhance fade) */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.transition = 'opacity 0.6s ease';
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        });
    }

    /* 2. Hero Scroll Down Smooth */
    const heroScroll = document.querySelector('.hero-scroll .scroll-link');
    if (heroScroll) {
        heroScroll.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#features')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    /* 3. Stats Counter Animation */
    const statNumbers = document.querySelectorAll('.stats-grid .stat-number');

    const animateCounter = (el) => {
        const targetText = el.textContent.trim();
        const isPlus = targetText.includes('+');
        const isPercent = targetText.includes('%');
        const target = parseInt(targetText.replace(/[^\d]/g, ''));
        let start = 0;
        const increment = target / 100;
        const suffix = isPlus ? '+' : (isPercent ? '%' : '');

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

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            statNumbers.forEach(animateCounter);
            statsObserver.unobserve(entries[0].target);
        }
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

    /* 4. Testimonials Slider (Swiper) */
    if (document.querySelector('#testimonialSlider')) {
        new Swiper('#testimonialSlider', {
            loop: true,
            autoplay: {
                delay: 6000,
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

    /* 5. Quick Enquiry Form Submission */
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        const submitBtn = enquiryForm.querySelector('.btn-form-submit');
        const originalText = submitBtn.innerHTML;

        const setLoading = (loading) => {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        };

        const showSuccess = () => {
            const successMsg = document.createElement('div');
            successMsg.className = 'form-success-msg';
            successMsg.innerHTML = `
                <i class="fas fa-check-circle"></i>
                Thank you! We've received your request.<br>
                The 2026 Prospectus will be sent to you shortly via WhatsApp/Email.
            `;
            enquiryForm.appendChild(successMsg);
            enquiryForm.reset();

            setTimeout(() => {
                successMsg.style.opacity = '0';
                setTimeout(() => successMsg.remove(), 600);
            }, 8000);
        };

        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const phone = enquiryForm.parentPhone.value.trim();
            if (!/^0[0-9]{9}$/.test(phone)) {
                alert('Please enter a valid Kenyan mobile number (e.g., 0712345678)');
                return;
            }

            setLoading(true);

            const formData = new FormData(enquiryForm);
            const data = {
                studentName: formData.get('studentName'),
                parentPhone: formData.get('parentPhone'),
                email: formData.get('email') || 'N/A'
            };

            try {
                const response = await fetch('/api/enquiry', {  // ← Your backend endpoint
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showSuccess();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to send request. Please try WhatsApp or call us directly.');
            } finally {
                setLoading(false);
            }
        });
    }

    /* 6. WhatsApp Floating Button Hover */
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
        waFloat.addEventListener('mouseenter', () => {
            waFloat.style.transform = 'scale(1.1) translateY(-5px)';
        });
        waFloat.addEventListener('mouseleave', () => {
            waFloat.style.transform = 'scale(1) translateY(0)';
        });
    }

    /* 7. Gallery Preview Hover Effect */
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('img').style.transform = 'scale(1.1)';
            item.querySelector('.gallery-overlay').style.opacity = '1';
        });
        item.addEventListener('mouseleave', () => {
            item.querySelector('img').style.transform = 'scale(1)';
            item.querySelector('.gallery-overlay').style.opacity = '0.8';
        });
    });

});