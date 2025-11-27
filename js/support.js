// ../js/support.js
// Ultimate Support & Utilities Page – Dynamic & Interactive (2026+)

document.addEventListener("DOMContentLoaded", () => {
    const donationForm = document.getElementById("donationForm");
    const donationMessage = document.getElementById("donationMessage");

    // ========================================
    // 1. Quick Navigation – Smooth Scroll
    // ========================================
    document.querySelectorAll(".quick-nav a").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // ========================================
    // 2. Donation Form – Full Processing
    // ========================================
    if (donationForm) {
        donationForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = this.donorName.value.trim();
            const email = this.donorEmail.value.trim();
            const amount = parseFloat(this.donationAmount.value);
            const purpose = this.donationPurpose.value;

            // Validation
            if (!name || !email || !amount || amount < 50 || !purpose) {
                showDonationMessage("Please fill all fields correctly. Minimum donation: Ksh 50", "#dc2626");
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(email)) {
                showDonationMessage("Please enter a valid email address.", "#dc2626");
                return;
            }

            // Show processing
            const submitBtn = this.querySelector("button");
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Simulate payment gateway (replace with real API later)
            setTimeout(() => {
                // Success message
                showDonationMessage(`
                    Thank you <strong>${name}</strong>!<br>
                    Your generous donation of <strong>Ksh ${amount.toLocaleString()}</strong> 
                    towards <em>${purpose.replace("-", " ")}</em> has been received.
                `, "#16a34a");

                // Save to localStorage
                localStorage.setItem("lastDonation", JSON.stringify({
                    name, email, amount, purpose, date: new Date().toISOString()
                }));

                // Reset form
                donationForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1800);
        });
    }

    // ========================================
    // 3. Show Donation Message with Animation
    // ========================================
    function showDonationMessage(msg, color = "#1e3a8a") {
        donationMessage.innerHTML = msg;
        donationMessage.style.color = color;
        donationMessage.classList.remove("show");
        void donationMessage.offsetWidth; // Trigger reflow
        donationMessage.classList.add("show");
    }

    // Load last donation on page load
    const lastDonation = JSON.parse(localStorage.getItem("lastDonation"));
    if (lastDonation && donationMessage) {
        const date = new Date(lastDonation.date).toLocaleDateString("en-KE", {
            day: "numeric", month: "long", year: "numeric"
        });
        showDonationMessage(`
            Welcome back, <strong>${lastDonation.name}</strong>!<br>
            Your last donation of <strong>Ksh ${lastDonation.amount.toLocaleString()}</strong> 
            on ${date} supports ${lastDonation.purpose.replace("-", " ")}.
        `, "#1e3a8a");
    }

    // ========================================
    // 4. Scroll Reveal Animations
    // ========================================
    const animateElements = document.querySelectorAll(`
        .utility-card,
        .download-item,
        .support-item,
        .donation-form,
        .impact-card,
        .quick-card
    `);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

    animateElements.forEach(el => observer.observe(el));

    // Initial trigger for elements already in view
    animateElements.forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add("show");
        }
    });
});