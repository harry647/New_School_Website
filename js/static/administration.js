// /js/static/administration.js - Dynamic loading for Administration page

document.addEventListener('DOMContentLoaded', () => {

    const modalOverlay = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('modalBody');

    // Close modal
    document.querySelector('.close-modal')?.addEventListener('click', () => {
        modalOverlay.style.display = 'none';
    });
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });

    // Open modal with content
    const openModal = (content) => {
        modalBody.innerHTML = content;
        modalOverlay.style.display = 'flex';
        setTimeout(() => modalOverlay.classList.add('show'), 10);
    };

    // Fetch and render BOM Members
    fetch('/data/static/bom-members.json')
        .then(response => {
            if (!response.ok) throw new Error('BOM data not found');
            return response.json();
        })
        .then(data => {
            const grid = document.getElementById('bomGrid');
            grid.innerHTML = data.map(member => `
                <div class="member-card" data-aos="fade-up">
                    <div class="member-photo">
                        <img src="${member.photo}" alt="${member.name}" onerror="this.src='/assets/images/common/placeholder.jpg'">
                    </div>
                    <div class="member-info">
                        <h3 class="member-name">${member.name}</h3>
                        <p class="member-role">${member.role}</p>
                        <p class="member-tenure"><strong>Tenure:</strong> ${member.tenure}</p>
                        <button class="btn-outline btn-small view-bio" data-bio="${encodeURIComponent(member.bio)}">
                            View Bio →
                        </button>
                    </div>
                </div>
            `).join('');

            // Attach bio click handlers
            document.querySelectorAll('.view-bio').forEach(btn => {
                btn.addEventListener('click', () => {
                    const bio = decodeURIComponent(btn.dataset.bio);
                    const name = btn.closest('.member-card').querySelector('.member-name').textContent;
                    openModal(`
                        <h3>${name}</h3>
                        <p><em>${btn.closest('.member-info').querySelector('.member-role').textContent}</em></p>
                        <p>${bio}</p>
                    `);
                });
            });
        })
        .catch(err => {
            console.error(err);
            document.getElementById('bomGrid').innerHTML = '<p class="text-center text-gray-500">Unable to load BOM members.</p>';
        });

    // Fetch and render Leadership Team
    fetch('/data/static/leadership.json')
        .then(response => {
            if (!response.ok) throw new Error('Leadership data not found');
            return response.json();
        })
        .then(data => {
            const grid = document.getElementById('leadershipGrid');
            grid.innerHTML = data.map(person => `
                <div class="member-card leadership-card" data-aos="fade-up" data-aos-delay="100">
                    <div class="member-photo large">
                        <img src="${person.photo}" alt="${person.name}" onerror="this.src='/assets/images/common/placeholder.jpg'">
                    </div>
                    <div class="member-info">
                        <h3 class="member-name">${person.name}</h3>
                        <p class="member-role highlight">${person.role}</p>
                        <p class="member-since">Since ${person.since}</p>
                        <p class="member-bio-preview">${person.bio}</p>
                        ${person.quote ? `<blockquote class="member-quote">"${person.quote}"</blockquote>` : ''}
                        <button class="btn-primary btn-small view-details">View Full Profile</button>
                    </div>
                </div>
            `).join('');

            // Full profile modal
            document.querySelectorAll('#leadershipGrid .view-details').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.member-card');
                    const name = card.querySelector('.member-name').textContent;
                    const role = card.querySelector('.member-role').textContent;
                    const since = card.querySelector('.member-since').textContent;
                    const bio = card.querySelector('.member-bio-preview').textContent;
                    const quote = card.querySelector('.member-quote')?.textContent || '';
                    const photo = card.querySelector('img').src;

                    openModal(`
                        <div class="modal-profile">
                            <img src="${photo}" alt="${name}" class="modal-photo">
                            <div class="modal-info">
                                <h3>${name}</h3>
                                <p class="modal-role">${role} • ${since}</p>
                                <p>${bio}</p>
                                ${quote ? `<blockquote>${quote}</blockquote>` : ''}
                            </div>
                        </div>
                    `);
                });
            });
        })
        .catch(err => {
            console.error(err);
            document.getElementById('leadershipGrid').innerHTML = '<p class="text-center text-gray-500">Unable to load leadership team.</p>';
        });

    // Fetch and render Administrative Departments
    fetch('/data/static/admin-departments.json')
        .then(response => {
            if (!response.ok) throw new Error('Departments data not found');
            return response.json();
        })
        .then(data => {
            const grid = document.getElementById('departmentsGrid');
            grid.innerHTML = data.map(dept => `
                <div class="department-card" data-aos="fade-up">
                    <div class="dept-icon">
                        <i class="${dept.icon}"></i>
                    </div>
                    <h3 class="dept-title">${dept.title}</h3>
                    <p class="dept-head"><strong>Head:</strong> ${dept.head}</p>
                    <p class="dept-desc">${dept.description}</p>
                    <ul class="dept-responsibilities">
                        ${dept.responsibilities.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            document.getElementById('departmentsGrid').innerHTML = '<p class="text-center text-gray-500">Unable to load departments.</p>';
        });

    // Optional: Animate stats numbers (like in previous pages)
    const stats = document.querySelectorAll('.stat-number');
    const animateStat = (el) => {
        const target = el.textContent.includes('%') 
            ? parseFloat(el.textContent) 
            : parseInt(el.textContent.replace(/[^\d]/g, ''));
        const isPercent = el.textContent.includes('%');
        const suffix = isPercent ? '%' : (el.textContent.includes('+') ? '+' : '');
        let start = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(start) + suffix;
            }
        }, 16);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                stats.forEach(stat => animateStat(stat));
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

});