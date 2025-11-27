// ../js/staff.js
// Ultimate Dynamic Staff Directory – Bar Union Mixed Secondary School (2026+)
document.addEventListener("DOMContentLoaded", () => {
    const DEFAULT_PHOTO = "/assets/images/default-user.png"; // Fixed path (was ../)
    
    // DOM Elements
    const staffGrid = document.getElementById("staffGrid");
    const searchInput = document.getElementById("staffSearch");
    const staffCategories = document.getElementById("staffCategories");
    const departmentControls = document.getElementById("departmentControls");
    const noResults = document.getElementById("noResults");
    const modal = document.getElementById("staffModal");
    const modalDetails = document.getElementById("modalDetails");
    
    let allStaff = [];
    let filteredStaff = [];
    let activeCategory = "all";
    let activeDept = null;

    // ========================================
    // 1. Load Staff from JSON
    // ========================================
    const loadStaff = async () => {
        try {
            const res = await fetch("/data/staff-data.json"); // Fixed path
            if (!res.ok) throw new Error("Staff data not found");
            allStaff = await res.json();
            filteredStaff = [...allStaff];

            populateDepartments();   // Now safe to populate
            renderStaff();
            initObservers();
        } catch (err) {
            console.error("Staff load failed:", err);
            staffGrid.innerHTML = `
                <div class="text-center py-5 text-danger">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <p>Unable to load staff directory.<br>Please try again later.</p>
                </div>`;
        }
    };

    // ========================================
    // 2. Populate Department Filters Dynamically
    // ========================================
    const populateDepartments = () => {
        const depts = [...new Set(allStaff.map(s => s.department).filter(Boolean))].sort();
        
        // Clear and rebuild department buttons
        departmentControls.innerHTML = `
            <button class="dept-btn active" data-dept="all">All Departments</button>
            ${depts.map(d => `
                <button class="dept-btn" data-dept="${d.toLowerCase()}">${d}</button>
            `).join('')}
        `;

        // Re-attach event listeners
        departmentControls.querySelectorAll(".dept-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                departmentControls.querySelectorAll(".dept-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeDept = btn.dataset.dept === "all" ? null : btn.dataset.dept;
                applyFilters();
            });
        });
    };

    // ========================================
    // 3. Render Staff Cards
    // ========================================
    const renderStaff = () => {
        // Clear previous content (except loader if needed)
        staffGrid.innerHTML = '';

        if (filteredStaff.length === 0) {
            noResults.style.display = "block";
            return;
        }
        noResults.style.display = "none";

        const fragment = document.createDocumentFragment();
        filteredStaff.forEach(member => {
            const card = document.createElement("div");
            card.className = "staff-card reveal";
            card.dataset.category = member.category || "teaching";
            card.dataset.department = (member.department || "").toLowerCase();

            card.innerHTML = `
                <div class="staff-photo">
                    <img data-src="${member.photo || DEFAULT_PHOTO}"
                         alt="${member.name}"
                         class="lazy blur"
                         onerror="this.src='${DEFAULT_PHOTO}'; this.onerror=null;">
                </div>
                <div class="staff-info">
                    <h3>${escapeHtml(member.name)}</h3>
                    <p class="designation">${escapeHtml(member.designation || '')}</p>
                    <p class="qualification">${escapeHtml(member.qualification || '')}</p>
                    ${member.department ? `<p class="dept"><strong>Dept:</strong> ${escapeHtml(member.department)}</p>` : ''}
                </div>
            `;
            card.addEventListener("click", () => openStaffModal(member));
            fragment.appendChild(card);
        });
        staffGrid.appendChild(fragment);
    };

    // Simple HTML escape (security)
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // ========================================
    // 4. Filtering Logic
    // ========================================
    const applyFilters = () => {
        const term = searchInput.value.toLowerCase().trim();

        filteredStaff = allStaff.filter(member => {
            const matchesCategory = activeCategory === "all" || member.category === activeCategory;
            const matchesDept = !activeDept || (member.department || "").toLowerCase() === activeDept;
            const matchesSearch = !term ||
                member.name.toLowerCase().includes(term) ||
                (member.designation || "").toLowerCase().includes(term) ||
                (member.department || "").toLowerCase().includes(term) ||
                (member.qualification || "").toLowerCase().includes(term);

            return matchesCategory && matchesDept && matchesSearch;
        });

        renderStaff();
    };

    // Search input
    searchInput.addEventListener("input", applyFilters);

    // Category Filters (already in DOM)
    staffCategories.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        staffCategories.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.filter;
        applyFilters();
    });

    // ========================================
    // 5. Modal with QR + Contact Actions
    // ========================================
    const openStaffModal = (member) => {
        const vcard = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${member.name}`,
            `N:${member.name.split(" ").reverse().join(";")}`,
            `TITLE:${member.designation || ''}`,
            member.email ? `EMAIL:${member.email}` : '',
            member.phone ? `TEL;TYPE=WORK,VOICE:${member.phone}` : '',
            "END:VCARD"
        ].filter(Boolean).join("\n");

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vcard)}`;

        modalDetails.innerHTML = `
            <div class="modal-profile">
                <div class="modal-photo">
                    <img src="${member.photo || DEFAULT_PHOTO}" alt="${member.name}" onerror="this.src='${DEFAULT_PHOTO}'">
                </div>
                <div class="modal-info">
                    <h2>${escapeHtml(member.name)}</h2>
                    <p class="designation">${escapeHtml(member.designation || '')}</p>
                    <p class="qualification">${escapeHtml(member.qualification || '')}</p>
                    ${member.department ? `<p><strong>Department:</strong> ${escapeHtml(member.department)}</p>` : ''}
                    ${member.bio ? `<div class="bio"><h4>About</h4><p>${escapeHtml(member.bio)}</p></div>` : ''}

                    <div class="modal-actions">
                        ${member.email ? `<a href="mailto:${member.email}" class="btn btn-outline"><i class="fas fa-envelope"></i> Email</a>` : ''}
                        ${member.phone ? `<a href="tel:${member.phone}" class="btn btn-primary"><i class="fas fa-phone"></i> Call</a>` : ''}
                        ${member.phone ? `<a href="https://wa.me/${member.phone.replace(/\D/g,'')}" target="_blank" rel="noopener" class="btn btn-success"><i class="fab fa-whatsapp"></i> WhatsApp</a>` : ''}
                        <button onclick="window.print()" class="btn btn-secondary"><i class="fas fa-print"></i> Print</button>
                    </div>

                    <div class="modal-qr">
                        <h4>Scan to Save Contact</h4>
                        <img src="${qrUrl}" alt="QR Code for ${member.name}">
                        <p><small>Scan with your phone to save contact</small></p>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    // Close modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.classList.contains("close-modal")) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("open")) {
            modal.classList.remove("open");
            document.body.style.overflow = "";
        }
    });

    // ========================================
    // 6. Lazy Load & Reveal Animations (Fixed observeAll)
    // ========================================
    const initObservers = () => {
        const lazyImages = document.querySelectorAll(".lazy");
        const revealElements = document.querySelectorAll(".reveal");

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("blur");
                    img.classList.add("loaded");
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: "50px" });

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        lazyImages.forEach(img => imageObserver.observe(img));
        revealElements.forEach(el => revealObserver.observe(el));
    };

    // ========================================
    // 7. Initialize
    // ========================================
    loadStaff();
});