// ../js/admissions.js
// Enhanced Admissions Page Script (2025–2026+)

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // 1. Fetch Dynamic Admissions Data
    // =====================================================
    const datesList = document.getElementById("datesList");
    const feeTableBody = document.getElementById("feeTableBody");
    const gradeSelect = document.getElementById("gradeSelect");
    const feeBrochureLink = document.getElementById("feeBrochureLink");

    try {
        const res = await fetch("../data/admissions-data.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load admissions data");

        const data = await res.json();

        // --- Key Dates ---
        if (datesList && data.dates) {
            datesList.innerHTML = "";
            data.dates.forEach(date => {
                const li = document.createElement("li");
                li.classList.add("fade-in");
                li.innerHTML = `<strong>${date.label}:</strong> ${date.value}`;
                datesList.appendChild(li);
            });
        }

        // --- Fee Table ---
        if (feeTableBody && data.fees) {
            feeTableBody.innerHTML = "";
            data.fees.forEach(fee => {
                const tr = document.createElement("tr");
                tr.classList.add("fade-in");
                tr.innerHTML = `
                    <td>${fee.level}</td>
                    <td>${fee.tuition.toLocaleString()}</td>
                    <td>${fee.other.toLocaleString()}</td>
                    <td>${fee.total.toLocaleString()}</td>
                `;
                feeTableBody.appendChild(tr);
            });
        }

        // --- Grade / Pathway Options ---
        if (gradeSelect && data.pathways) {
            while (gradeSelect.options.length > 1) gradeSelect.remove(1);
            data.pathways.forEach(path => {
                const option = new Option(path, path);
                gradeSelect.add(option);
            });
        }

        // --- Fee Brochure ---
        if (feeBrochureLink && data.documents?.feeBrochure) {
            feeBrochureLink.href = data.documents.feeBrochure;
            feeBrochureLink.style.opacity = "1";
        }

    } catch (err) {
        console.warn("Admissions data not loaded:", err);
    }

    // =====================================================
    // 2. Smooth Scroll with Precise Section Alignment
    // =====================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            const offset = 90; // Matches section scroll margin
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top, behavior: "smooth" });
            history.pushState(null, null, href);
        });
    });

    // =====================================================
    // 3. Timeline Modal (Updated + Better UI)
    // =====================================================
    const modal = document.createElement("div");
    modal.id = "timelineModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">×</span>
            <div id="modalBody"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalBody = document.getElementById("modalBody");

    document.querySelectorAll(".timeline-item").forEach(item => {
        item.classList.add("fade-in");

        // Improved click behavior
        item.addEventListener("click", () => {
            const title = item.querySelector("h3")?.innerText ?? "Admission Step";
            const content = item.querySelector("p")?.innerText ?? "No further information.";

            modalBody.innerHTML = `
                <h3 style="margin-top:0; color:#007bff; font-size:1.5rem;">${title}</h3>
                <p style="line-height:1.75; color:#444;">${content}</p>
            `;

            modal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    // Close modal
    modal.addEventListener("click", (e) => {
        if (e.target.classList.contains("close-modal") || e.target === modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });

    // Close with ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            modal.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    });

    // =====================================================
    // 4. Enhanced Form Validation + Polished UX
    // =====================================================
    const form = document.querySelector(".admission-form");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            let valid = true;
            form.querySelectorAll("[required]").forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = "#e74c3c";
                    field.classList.add("shake");
                    setTimeout(() => field.classList.remove("shake"), 400);
                    valid = false;
                } else field.style.borderColor = "#e0e0e0";
            });

            if (!valid) {
                alert("Please complete all required fields.");
                return;
            }

            const submitBtn = form.querySelector("button[type='submit']");
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;
            submitBtn.disabled = true;

            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { "Accept": "application/json" }
            })
            .then(() => {
                alert("Thank you! Your application has been submitted.");
                form.reset();
            })
            .catch(() => {
                alert("Submission failed. Please try again.");
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // =====================================================
    // 5. Universal Fade-In Animations on Scroll
    // =====================================================
    const fadeItems = document.querySelectorAll(".fade-in, .card, .requirement-card");
    const observer = new IntersectionObserver((items) => {
        items.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.18, rootMargin: "0px 0px -60px 0px" });

    fadeItems.forEach(el => observer.observe(el));

    // =====================================================
    // 6. Hero Title Pop Animation
    // =====================================================
    const heroTitle = document.querySelector(".animate-pop");
    if (heroTitle) {
        setTimeout(() => heroTitle.classList.add("popped"), 250);
    }
});
