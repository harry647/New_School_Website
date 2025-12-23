// JavaScript for study-plans.html
document.addEventListener('DOMContentLoaded', () => {
    const apiBase = '/api'; // Adjust to your backend URL
    const token = localStorage.getItem('authToken'); // For auth (robustness)

    async function fetchPlans() {
        document.getElementById('loadingSpinner').classList.remove('d-none');
        document.getElementById('errorMessage').classList.add('d-none');
        try {
            const response = await fetch(`${apiBase}/study-plans`, {
                headers: { 'Authorization': `Bearer ${token}` } // Secure API calls
            });
            if (!response.ok) throw new Error('Failed to fetch plans');
            const plans = await response.json();
            renderPlans(plans);
        } catch (error) {
            document.getElementById('errorMessage').textContent = error.message;
            document.getElementById('errorMessage').classList.remove('d-none');
        } finally {
            document.getElementById('loadingSpinner').classList.add('d-none');
        }
    }

    function renderPlans(plans) {
        const grid = document.getElementById('studyPlansGrid');
        grid.innerHTML = '';
        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            card.innerHTML = `
                <div class="card study-plan-card">
                    <div class="card-body">
                        <h5 class="card-title">${plan.title}</h5>
                        <p class="card-text">${plan.description}</p>
                        <div class="progress mb-3"><div class="progress-bar" style="width: ${plan.progress}%"></div></div>
                        <button class="btn btn-sm btn-primary editBtn" data-id="${plan.id}">Edit</button>
                        <button class="btn btn-sm btn-danger deleteBtn" data-id="${plan.id}">Delete</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Event listeners for create/edit/save
    document.getElementById('createPlanBtn').addEventListener('click', () => {
        document.getElementById('planForm').reset();
        document.getElementById('planId').value = '';
        new bootstrap.Modal(document.getElementById('planModal')).show();
    });

    document.getElementById('savePlanBtn').addEventListener('click', async () => {
        const id = document.getElementById('planId').value;
        const data = {
            title: document.getElementById('planTitle').value,
            description: document.getElementById('planDescription').value,
            duration: document.getElementById('planDuration').value,
            courses: document.getElementById('planCourses').value.split(',').map(c => c.trim())
        };
        try {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `${apiBase}/study-plans/${id}` : `${apiBase}/study-plans`;
            await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
            fetchPlans(); // Refresh
            bootstrap.Modal.getInstance(document.getElementById('planModal')).hide();
        } catch (error) {
            alert('Error saving plan: ' + error.message);
        }
    });

    // Add listeners for edit/delete buttons
    document.getElementById('studyPlansGrid').addEventListener('click', (e) => {
        if (e.target.classList.contains('editBtn')) {
            const planId = e.target.getAttribute('data-id');
            // Fetch plan details and populate modal
            fetch(`${apiBase}/study-plans/${planId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(plan => {
                document.getElementById('planTitle').value = plan.title;
                document.getElementById('planDescription').value = plan.description;
                document.getElementById('planDuration').value = plan.duration;
                document.getElementById('planCourses').value = plan.courses.join(', ');
                document.getElementById('planId').value = plan.id;
                new bootstrap.Modal(document.getElementById('planModal')).show();
            })
            .catch(error => alert('Error fetching plan: ' + error.message));
        } else if (e.target.classList.contains('deleteBtn')) {
            const planId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this plan?')) {
                fetch(`${apiBase}/study-plans/${planId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(() => fetchPlans())
                .catch(error => alert('Error deleting plan: ' + error.message));
            }
        }
    });

    // Search/filter: Add input listeners to filter rendered plans client-side
    document.getElementById('searchInput').addEventListener('input', () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const cards = document.querySelectorAll('.study-plan-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            const status = card.getAttribute('data-status') || '';
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesStatus = !statusFilter || status === statusFilter;
            card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
        });
    });

    document.getElementById('filterStatus').addEventListener('change', () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const cards = document.querySelectorAll('.study-plan-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            const status = card.getAttribute('data-status') || '';
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesStatus = !statusFilter || status === statusFilter;
            card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
        });
    });

    // Logout (for auth in e-learning)
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    });

    fetchPlans(); // Initial load
});