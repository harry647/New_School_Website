// =============================
// administration.js – FINAL & INSTANTLY VISIBLE (2025)
// =============================

console.log("%c[Administration] Script started", "color: #2ecc71; font-weight: bold;");

document.addEventListener("DOMContentLoaded", async () => {
    const grids = {
        bom: document.getElementById('bomGrid'),
        leadership: document.getElementById('leadershipGrid'),
        departments: document.getElementById('departmentsGrid'),
        dynamicDepartments: document.getElementById('dynamicDepartmentsGrid')
    };

    const targetDeptGrid = grids.dynamicDepartments || grids.departments;

    console.log("Grids found →", {
        bom: !!grids.bom,
        leadership: !!grids.leadership,
        dynamicDepts: !!grids.dynamicDepartments,
        target: targetDeptGrid?.id
    });

    const removeLoader = (grid) => {
        if (!grid) return;
        const loader = grid.parentElement?.querySelector('.loader');
        if (loader) {
            console.log(`Loader removed → ${grid.id}`);
            loader.remove();
        }
    };

    try {
        console.log("Fetching /data/admin-data.json ...");
        const res = await fetch('/data/admin-data.json?t=' + Date.now()); // bust cache
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("JSON loaded →", data);

        // ==================== 1. BOM ====================
        if (data.bom?.length && grids.bom) {
            console.log(`Rendering ${data.bom.length} BOM members`);
            data.bom.forEach(member => {
                const card = document.createElement('div');
                card.className = 'bom-card visible'; // visible = instantly shown
                card.innerHTML = `
                    <img src="${member.photo || '/assets/images/default-user.png'}"
                         alt="${member.name}" loading="lazy"
                         onerror="this.src='/assets/images/default-user.png'">
                    <h4>${member.name}</h4>
                    <p class="role">${member.role}</p>
                    ${member.representing ? `<p><em>Representing: ${member.representing}</em></p>` : ''}
                `;
                grids.bom.appendChild(card);
            });
            removeLoader(grids.bom);
        }

        // ==================== 2. LEADERSHIP ====================
        if (data.leadership?.length && grids.leadership) {
            console.log(`Rendering ${data.leadership.length} leadership cards`);
            data.leadership.forEach((person, i) => {
                const card = document.createElement('div');
                card.className = `leader-card visible ${i === 0 ? 'featured' : ''}`; // visible = no fade-in delay
                const fullBio = person.bio || 'No additional details available.';

                card.innerHTML = `
                    <img src="${person.photo || '/assets/images/default-user.jpg'}"
                         alt="${person.name}" loading="lazy"
                         onerror="this.src='/assets/images/default-user.jpg'">
                    <h4>${person.name}</h4>
                    <p><strong>${person.role}</strong></p>
                    <p>${fullBio.length > 130 ? fullBio.substring(0, 130) + '...' : fullBio}</p>
                    <button class="view-more-btn" data-details="${fullBio.replace(/"/g, '&quot;')}">
                        View More
                    </button>
                `;
                grids.leadership.appendChild(card);
            });
            removeLoader(grids.leadership);
        }

        // ==================== 3. DEPARTMENTS ====================
        if (data.departments?.length && targetDeptGrid) {
            console.log(`Rendering ${data.departments.length} departments → #${targetDeptGrid.id}`);
            data.departments.forEach(dept => {
                const card = document.createElement('div');
                card.className = 'dept-card visible'; // visible = instantly shown
                card.innerHTML = `
                    <i class="${dept.icon || 'fas fa-building'} fa-3x" style="color:${dept.color || '#007bff'}"></i>
                    <h4>${dept.name}</h4>
                    <p><strong>${dept.head}</strong><br><small>${dept.headTitle || 'Department Head'}</small></p>
                    <div class="contact">
                        ${dept.email ? `<span><i class="fas fa-envelope"></i> <a href="mailto:${dept.email}">${dept.email}</a></span>` : ''}
                        ${dept.phone ? `<span><i class="fas fa-phone"></i> ${dept.phone}</span>` : ''}
                        ${dept.note ? `<span><i class="fas fa-info-circle"></i> ${dept.note}</span>` : ''}
                    </div>
                `;
                targetDeptGrid.appendChild(card);
            });
            removeLoader(targetDeptGrid);
        }

        console.log("%cSUCCESS → All cards rendered and visible!", "color:#2ecc71;font-size:20px;font-weight:bold;background:#000;padding:5px;border-radius:4px;");

    } catch (err) {
        console.error("%cERROR →", "color:#e74c3c;font-weight:bold;", err);
        Object.values(grids).forEach(grid => {
            if (grid) grid.innerHTML = `<p class="error text-center" style="color:#e74c3c;padding:2rem;">Failed to load content<br><small>${err.message}</small></p>`;
        });
    }
});

// ==================== ANIMATIONS & MODAL (unchanged) ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Administration] Animations & modal ready");

    // Fade-in observer (still works for static .fade-in elements)
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));

    // Modal
    const modal = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');
    if (modal && modalBody) {
        document.addEventListener('click', e => {
            if (e.target.matches('.view-more-btn')) {
                modalBody.innerHTML = `<p>${(e.target.dataset.details || '').replace(/\n/g, '</p><p>')}</p>`;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            if (e.target.matches('.close-modal') || e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Hover effect
    document.querySelectorAll('.leader-card, .dept-card, .bom-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-12px) scale(1.03)');
        card.addEventListener('mouseleave', () => card.style.transform = 'none');
    });
});