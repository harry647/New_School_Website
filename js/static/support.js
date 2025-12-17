// /js/static/support.js - Interactive features for Support & Utilities page with AOS animations

document.addEventListener('DOMContentLoaded', () => {

    /* Initialize AOS with custom settings for this page */
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
        anchorPlacement: 'top-bottom'
    });

    /* 1. Access Cards - Hover + AOS */
    const accessCards = document.querySelectorAll('.access-card');
    accessCards.forEach((card, index) => {
        // Add AOS attributes
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-12px)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        });
    });

    /* 2. Dynamic Downloads from JSON + AOS */
    const downloadsGrid = document.getElementById('downloadsGrid');

    fetch('/data/static/downloads.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            downloadsGrid.innerHTML = data.map((item, index) => `
                <a href="${item.file}" class="download-card" target="_blank" download
                   data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="card-icon"><i class="${item.icon}"></i></div>
                    <h3>${item.title}</h3>
                    <p>${item.size} • ${item.type}</p>
                    <p>${item.description}</p>
                </a>
            `).join('');

            // Refresh AOS after dynamic content is added
            AOS.refresh();
        })
        .catch(() => {
            downloadsGrid.innerHTML = `
                <div class="download-card placeholder" data-aos="fade-up">
                    <p>No downloads available at the moment.</p>
                </div>
            `;
            AOS.refresh();
        });

    /* 3. Donation Form Submission + AOS on Form Elements */
    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        // Add AOS to form elements
        donationForm.querySelectorAll('.form-group').forEach((group, index) => {
            group.setAttribute('data-aos', 'fade-up');
            group.setAttribute('data-aos-delay', index * 100);
        });
        donationForm.querySelector('.form-actions').setAttribute('data-aos', 'fade-up');
        donationForm.querySelector('.form-actions').setAttribute('data-aos-delay', '400');

        const submitBtn = donationForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        const setLoading = (loading) => {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Donation...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        };

        const showStatus = (message, isSuccess = true) => {
            let status = donationForm.querySelector('.form-status');
            if (!status) {
                status = document.createElement('div');
                status.className = 'form-status';
                donationForm.querySelector('.form-actions').appendChild(status);
            }
            status.innerHTML = message;
            status.className = `form-status ${isSuccess ? 'success' : 'error'}`;
            status.style.display = 'block';

            setTimeout(() => {
                status.style.opacity = '0';
                setTimeout(() => status.style.display = 'none', 600);
            }, 10000);
        };

        const MAX_FILE_SIZE = 10 * 1024 * 1024;

        donationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amount = donationForm.amount.value;
            if (amount < 50) {
                showStatus('Minimum donation amount is Ksh 50.', false);
                return;
            }

            const fileInput = donationForm.attachment;
            if (fileInput.files[0] && fileInput.files[0].size > MAX_FILE_SIZE) {
                showStatus('Attachment too large! Max 10MB.', false);
                return;
            }

            setLoading(true);

            const formData = new FormData(donationForm);

            try {
                const response = await fetch('/api/donation-request', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    showStatus(`
                        <strong>Thank You for Your Generosity!</strong><br>
                        Dear <strong>${formData.get('donor_name')}</strong>,<br>
                        Your pledge of <strong>Ksh ${formData.get('amount')}</strong> for <strong>${formData.get('purpose')}</strong> has been received.<br>
                        We will send payment instructions shortly.
                    `, true);

                    donationForm.reset();
                } else {
                    throw new Error();
                }
            } catch (err) {
                showStatus('Submission failed. Please try again or contact us directly.', false);
            } finally {
                setLoading(false);
            }
        });
    }

    /* 4. Support Cards - AOS + Hover */
    const supportCards = document.querySelectorAll('.support-card');
    supportCards.forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    /* 5. Impact Cards - AOS */
    document.querySelectorAll('.impact-card').forEach((card, index) => {
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 150);
    });

    /* 6. Refresh AOS after everything loads */
    setTimeout(() => {
        AOS.refresh();
    }, 500);

});