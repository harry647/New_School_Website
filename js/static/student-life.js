// /js/static/student-life.js - Interactive features for Student Life page

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Sticky Quick Navigation - Active State on Scroll */
    const quickNav = document.querySelector('.quick-nav');
    const navLinks = quickNav?.querySelectorAll('a');

    if (navLinks) {
        const sections = Array.from(navLinks).map(link => ({
            link,
            target: document.querySelector(link.getAttribute('href'))
        }));

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(sec => {
                const top = sec.target?.offsetTop - 150;
                const bottom = top + sec.target?.offsetHeight;
                if (window.scrollY >= top && window.scrollY < bottom) {
                    current = sec.link.getAttribute('href');
                }
            });

            navLinks.forEach(link => link.classList.remove('active'));
            if (current) {
                document.querySelector(`.quick-nav a[href="${current}"]`)?.classList.add('active');
            }
        });

        // Smooth scroll
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* 2. Dynamic Clubs Loading from JSON */
    const clubsGrid = document.getElementById('clubsGrid');

    fetch('/data/student-clubs.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            clubsGrid.innerHTML = data.map(club => `
                <div class="club-card" data-aos="fade-up" data-aos-delay="${club.delay || 0}">
                    <div class="club-icon"><i class="${club.icon}"></i></div>
                    <h3>${club.name}</h3>
                    <p>${club.description}</p>
                    ${club.achievements ? `<p class="club-achievements"><strong>Achievements:</strong> ${club.achievements}</p>` : ''}
                </div>
            `).join('');
        })
        .catch(() => {
            // Fallback static clubs
            clubsGrid.innerHTML = `
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-theater-masks"></i></div>
                    <h3>Drama & Theatre</h3>
                    <p>Develop expression, creativity, confidence, and storytelling skills.</p>
                </div>
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-music"></i></div>
                    <h3>Music Club</h3>
                    <p>Choir, band, traditional instruments — nurturing musical talent.</p>
                </div>
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-microscope"></i></div>
                    <h3>Science Club</h3>
                    <p>Experiments, projects, and competitions for young innovators.</p>
                </div>
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-globe"></i></div>
                    <h3>Environmental Club</h3>
                    <p>Tree planting, recycling, and sustainability initiatives.</p>
                </div>
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-hands-helping"></i></div>
                    <h3>Community Service</h3>
                    <p>Outreach programs and charity drives for social responsibility.</p>
                </div>
                <div class="club-card">
                    <div class="club-icon"><i class="fas fa-robot"></i></div>
                    <h3>Robotics & Coding</h3>
                    <p>Building robots and learning programming for future tech leaders.</p>
                </div>
            `;
        });

    /* 3. Lightbox for All Images (using Lightbox2) */
    // Lightbox is already loaded — just ensure images have proper links
    document.querySelectorAll('img[data-full]').forEach(img => {
        const fullSrc = img.getAttribute('data-full');
        const wrapper = document.createElement('a');
        wrapper.href = fullSrc;
        wrapper.setAttribute('data-lightbox', 'student-life');
        wrapper.setAttribute('data-title', img.alt);
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
    });

    // Custom Lightbox options
    lightbox.option({
        resizeDuration: 300,
        fadeDuration: 300,
        imageFadeDuration: 300,
        wrapAround: true,
        albumLabel: "Image %1 of %2"
    });

    /* 4. House Cards Hover Effects */
    const houseCards = document.querySelectorAll('.house-card');
    houseCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.03)';
            card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        });
    });

    /* 5. Sports Cards & Events Timeline Animation */
    const timelineItems = document.querySelectorAll('.event-item');
    const sportsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, index * 200);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => sportsObserver.observe(item));

    /* 6. Intro Image Click to Lightbox */
    const introImage = document.querySelector('.intro-image img');
    if (introImage && introImage.hasAttribute('data-full')) {
        introImage.style.cursor = 'zoom-in';
    }

    /* 7. Club Registration Form */
    const clubRegForm = document.getElementById('clubRegistrationForm');
    const clubCheckboxes = document.getElementById('clubCheckboxes');
    const clubRegStatus = document.getElementById('clubRegStatus');
    const clubSubmitBtn = clubRegForm?.querySelector('button[type="submit"]');
    const originalClubBtnText = clubSubmitBtn?.innerHTML || '';

    let clubList = [];

    // Load clubs for checkboxes (reuse from clubs JSON)
    fetch('/data/student-clubs.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            clubList = data;
            clubCheckboxes.innerHTML = clubList.map(club => `
                <label class="checkbox-label">
                    <input type="checkbox" name="clubs" value="${club.name}">
                    <span>${club.name}</span>
                </label>
            `).join('');
        })
        .catch(() => {
            clubCheckboxes.innerHTML = '<p class="text-center text-gray-600">Unable to load clubs.</p>';
        });

    clubRegForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedClubs = Array.from(clubRegForm.querySelectorAll('input[name="clubs"]:checked'))
                                  .map(cb => cb.value);

        if (selectedClubs.length === 0) {
            showClubStatus('Please select at least one club.', false);
            return;
        }

        if (selectedClubs.length > 3) {
            showClubStatus('You can select up to 3 clubs only.', false);
            return;
        }

        setClubLoading(true);

        const formData = new FormData(clubRegForm);
        formData.append('selected_clubs', selectedClubs.join(', '));

        try {
            const response = await fetch('/api/club-registration', {  // Your backend endpoint
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showClubStatus(`
                    <strong>Registration Successful!</strong><br>
                    Thank you, <strong>${formData.get('student_name')}</strong>!<br>
                    You've registered interest in: <strong>${selectedClubs.join(', ')}</strong>.<br>
                    Club coordinators will contact you soon.
                `, true);
                clubRegForm.reset();
            } else {
                throw new Error();
            }
        } catch (err) {
            showClubStatus('Submission failed. Please try again or contact the school office.', false);
        } finally {
            setClubLoading(false);
        }
    });

    function setClubLoading(loading) {
        if (loading) {
            clubSubmitBtn.disabled = true;
            clubSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        } else {
            clubSubmitBtn.disabled = false;
            clubSubmitBtn.innerHTML = originalClubBtnText;
        }
    }

    function showClubStatus(message, success = true) {
        clubRegStatus.innerHTML = message;
        clubRegStatus.className = `form-status ${success ? 'success' : 'error'}`;
        clubRegStatus.classList.remove('hidden');
        clubRegStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* 8. Event Calendar Integration */
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('calendarMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    let currentCalendarDate = new Date();
    let calendarEvents = [];

    fetch('/data/school-calendar.json')
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            calendarEvents = data;
            renderCalendar(currentCalendarDate);
        })
        .catch(() => {
            calendarGrid.innerHTML = '<p class="text-center text-gray-600">Calendar unavailable.</p>';
        });

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYearDisplay.textContent = date.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '<div class="calendar-weekdays">';
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });
        html += '</div><div class="calendar-days">';

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day empty"></div>';
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = calendarEvents.filter(e => e.date === dateStr);

            html += `<div class="day ${dayEvents.length > 0 ? 'has-event' : ''}" data-date="${dateStr}">
                <span class="day-number">${day}</span>
                ${dayEvents.map(e => `
                    <span class="event-badge ${e.type}">${e.title}</span>
                `).join('')}
            </div>`;
        }

        html += '</div>';
        calendarGrid.innerHTML = html;
    }

    prevMonthBtn?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar(currentCalendarDate);
    });

    nextMonthBtn?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar(currentCalendarDate);
    });

});