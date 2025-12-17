// /js/static/e-learning.js - Interactive features for E-Learning Portal page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Initialize Testimonials Swiper Carousel */
    const testimonialsSwiper = new Swiper('.testimonials-swiper', {
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

    // Optional: Load testimonials dynamically from JSON
    const swiperWrapper = document.querySelector('.testimonials-swiper .swiper-wrapper');
    fetch('/data/testimonials.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            swiperWrapper.innerHTML = data.map(t => `
                <div class="swiper-slide">
                    <div class="testimonial-card">
                        <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                        <p>"${t.quote}"</p>
                        <div class="testimonial-author">
                            <h4>${t.name}</h4>
                            <p>${t.role}</p>
                        </div>
                    </div>
                </div>
            `).join('');
            testimonialsSwiper.update();
        })
        .catch(() => {
            console.warn('Testimonials JSON not loaded – using static content');
        });

    /* 2. FAQ Accordion */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* 3. Newsletter Subscription Form */
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = newsletterForm.querySelector('input[name="_replyto"]').value.trim();
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            const formData = new FormData(newsletterForm);
            const preferences = [];
            newsletterForm.querySelectorAll('input[name="preferences[]"]:checked').forEach(cb => {
                preferences.push(cb.value);
            });
            formData.append('preferences', preferences.join(', '));

            // Simulate submission (replace with your backend endpoint)
            try {
                // const response = await fetch('/api/newsletter-subscribe', { method: 'POST', body: formData });
                // if (!response.ok) throw new Error();

                // Simulated success
                document.getElementById('subscriptionSuccess').classList.remove('hidden');
                newsletterForm.reset();
                setTimeout(() => {
                    document.getElementById('subscriptionSuccess').classList.add('hidden');
                }, 8000);
            } catch (err) {
                alert('Subscription failed. Please try again later.');
            }
        });
    }

    /* 4. Feature Cards Hover Effect */
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    /* 5. Quick Access Card Hover */
    const accessCard = document.querySelector('.access-card');
    if (accessCard) {
        accessCard.addEventListener('mouseenter', () => {
            accessCard.style.transform = 'scale(1.03)';
        });
        accessCard.addEventListener('mouseleave', () => {
            accessCard.style.transform = 'scale(1)';
        });
    }

    /* 6. App Store Images Hover */
    const appStoreLinks = document.querySelectorAll('.app-stores a');
    appStoreLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.querySelector('img').style.transform = 'scale(1.1)';
        });
        link.addEventListener('mouseleave', () => {
            link.querySelector('img').style.transform = 'scale(1)';
        });
    });

    /* 7. Back to Top Button */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});