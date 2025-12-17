// /js/static/staff.js - Dynamic Staff Directory for Bar Union Mixed Secondary School

document.addEventListener('DOMContentLoaded', () => {

    const staffGrid = document.getElementById('staffGrid');
    const staffLoader = staffGrid.querySelector('.loader');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('staffSearch');
    const categoryBtns = document.querySelectorAll('#staffCategories .filter-btn');
    const departmentControls = document.getElementById('departmentControls');
    const modal = document.getElementById('staffModal');
    const modalDetails = document.getElementById('modalDetails');
    const closeModalBtn = modal.querySelector('.close-modal');

    let allStaff = [];
    let filteredStaff = [];
    let selectedCategory = 'all';
    let selectedDepartment = 'all';

    /* Load Staff Data */
    fetch('/data/static/staff-data.json')
        .then(res => {
            if (!res.ok) throw new Error('Staff data not found');
            return res.json();
        })
        .then(data => {
            allStaff = data;
            filteredStaff = allStaff;
            renderDepartments();
            renderStaff();
        })
        .catch(err => {
            console.error(err);
            staffGrid.innerHTML = '<p class="text-center text-gray-600">Unable to load staff directory. Please try again later.</p>';
        })
        .finally(() => {
            staffLoader.style.display = 'none';
        });

    /* Render Unique Departments for Filter */
    function renderDepartments() {
        const departments = [...new Set(allStaff.map(s => s.department).filter(d => d))];
        departments.sort();

        departmentControls.innerHTML = `
            <button class="filter-btn active" data-dept="all">All Departments</button>
            ${departments.map(dept => `
                <button class="filter-btn" data-dept="${dept.toLowerCase().replace(/\s+/g, '-')}">
                    ${dept}
                </button>
            `).join('')}
        `;

        // Add event listeners to department buttons
        departmentControls.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                departmentControls.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDepartment = btn.dataset.dept;
                applyFilters();
            });
        });
    }

    /* Render Staff Grid */
    function renderStaff() {
        if (filteredStaff.length === 0) {
            noResults.style.display = 'block';
            staffGrid.innerHTML = '';
            return;
        }

        noResults.style.display = 'none';
        staffGrid.innerHTML = '';

        const fragment = document.createDocumentFragment();

        filteredStaff.forEach(member => {
            const card = document.createElement('div');
            card.className = 'staff-card';
            card.dataset.category = member.category;
            card.dataset.department = member.department?.toLowerCase().replace(/\s+/g, '-') || '';
            card.innerHTML = `
                <div class="staff-photo">
                    <img src="${member.photo}" alt="${member.name}" loading="lazy"
                         onerror="this.src='/assets/images/common/placeholder-staff.jpg'">
                </div>
                <div class="staff-info">
                    <h3 class="staff-name">${member.name}</h3>
                    <p class="staff-role">${member.role}</p>
                    ${member.department ? `<p class="staff-dept"><i class="fas fa-building"></i> ${member.department}</p>` : ''}
                    ${member.subjects ? `<p class="staff-subjects"><i class="fas fa-book"></i> ${member.subjects.join(', ')}</p>` : ''}
                    <button class="btn-view-profile" data-id="${member.id}">View Profile →</button>
                </div>
            `;
            fragment.appendChild(card);
        });

        staffGrid.appendChild(fragment);

        // Attach modal open events
        staffGrid.querySelectorAll('.btn-view-profile').forEach(btn => {
            btn.addEventListener('click', () => openStaffModal(btn.dataset.id));
        });
    }

    /* Apply All Filters */
    function applyFilters() {
        filteredStaff = allStaff.filter(staff => {
            const matchesCategory = selectedCategory === 'all' || staff.category === selectedCategory;
            const matchesDept = selectedDepartment === 'all' || 
                (staff.department?.toLowerCase().replace(/\s+/g, '-') === selectedDepartment);
            return matchesCategory && matchesDept;
        });
        renderStaff();
    }

    /* Category Filter Buttons */
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.dataset.filter;
            applyFilters();
        });
    });

    /* Search Functionality */
    searchInput?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        filteredStaff = allStaff.filter(staff => {
            return staff.name.toLowerCase().includes(term) ||
                   staff.role.toLowerCase().includes(term) ||
                   (staff.department && staff.department.toLowerCase().includes(term)) ||
                   (staff.subjects && staff.subjects.some(s => s.toLowerCase().includes(term))) ||
                   (staff.qualification && staff.qualification.toLowerCase().includes(term));
        });
        applyFilters(); // Re-apply category/dept filters on top of search
    });

    /* Staff Profile Modal */
    function openStaffModal(id) {
        const member = allStaff.find(s => s.id === id);
        if (!member) return;

        modalDetails.innerHTML = `
            <div class="modal-profile">
                <div class="modal-photo">
                    <img src="${member.photo}" alt="${member.name}"
                         onerror="this.src='/assets/images/common/placeholder-staff.jpg'">
                </div>
                <div class="modal-info">
                    <h2>${member.name}</h2>
                    <p class="modal-role"><strong>${member.role}</strong></p>
                    ${member.department ? `<p><i class="fas fa-building"></i> ${member.department}</p>` : ''}
                    ${member.qualification ? `<p><i class="fas fa-graduation-cap"></i> ${member.qualification}</p>` : ''}
                    ${member.experience ? `<p><i class="fas fa-clock"></i> ${member.experience} years experience</p>` : ''}
                    ${member.subjects ? `<p><i class="fas fa-book"></i> Teaches: ${member.subjects.join(', ')}</p>` : ''}
                    ${member.email ? `<p><i class="fas fa-envelope"></i> <a href="mailto:${member.email}">${member.email}</a></p>` : ''}
                    ${member.phone ? `<p><i class="fas fa-phone"></i> ${member.phone}</p>` : ''}
                    ${member.bio ? `<div class="modal-bio"><h4>About</h4><p>${member.bio}</p></div>` : ''}
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    closeModalBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

});