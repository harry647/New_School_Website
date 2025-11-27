// ../js/alumni.js
// Enhanced Alumni Page – Dynamic, Robust & Interactive (2026+)

const DEFAULT_ALUMNI_PHOTO = "../assets/images/default-user.png";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('../data/alumni-data.json');
        if (!res.ok) throw new Error('Alumni data not found');
        const data = await res.json();

        // ==============================
        // 1. Hero Stats
        // ==============================
        const heroStats = document.getElementById('heroStats');
        if (heroStats && data.stats) {
            heroStats.innerHTML = `
                <div class="stat"><strong>${data.stats.alumni || "2,500"}+</strong><br>Alumni Worldwide</div>
                <div class="stat"><strong>${data.stats.years || "50"}+</strong><br>Years of Legacy</div>
                <div class="stat"><strong>${data.stats.countries || "10"}+</strong><br>Countries Represented</div>
            `;
        }

        // ==============================
        // 2. Welcome Section
        // ==============================
        if (data.welcome) {
            const txt1 = document.getElementById('welcomeText1');
            const txt2 = document.getElementById('welcomeText2');
            const img = document.getElementById('reunionImage');
            if (txt1) txt1.textContent = data.welcome.text1;
            if (txt2) txt2.textContent = data.welcome.text2;
            if (img) {
                img.src = data.welcome.image || DEFAULT_ALUMNI_PHOTO;
                img.alt = data.welcome.alt || "Alumni Reunion";
                img.onerror = () => { img.src = DEFAULT_ALUMNI_PHOTO; };
            }
        }

        // ==============================
        // 3. Notable Alumni Grid
        // ==============================
        const notableGrid = document.getElementById('notableAlumni');
        if (notableGrid && data.notable) {
            notableGrid.innerHTML = '';
            data.notable.forEach((alum, i) => {
                const photo = alum.photo?.trim() || DEFAULT_ALUMNI_PHOTO;
                const card = document.createElement('div');
                card.className = 'alumni-card hover-zoom fade-in';
                card.style.animationDelay = `${i * 0.1}s`;
                card.dataset.name = alum.name.toLowerCase();
                card.dataset.batch = alum.batch || '';
                card.dataset.role = alum.currentRole?.toLowerCase() || '';

                card.innerHTML = `
                    <img src="${photo}" alt="${alum.name}" loading="lazy" onerror="this.src='${DEFAULT_ALUMNI_PHOTO}'; this.onerror=null;">
                    <h4>${alum.name}</h4>
                    <p class="batch">Class of ${alum.batch || 'N/A'}</p>
                    <p class="achievement"><strong>${alum.achievement || 'Distinguished Alumnus'}</strong></p>
                    ${alum.currentRole ? `<p class="current"><em>${alum.currentRole}</em></p>` : ''}
                `;
                notableGrid.appendChild(card);
            });
        }

        // ==============================
        // 4. Upcoming Events with Countdown
        // ==============================
        const eventsGrid = document.getElementById('alumniEvents');
        if (eventsGrid && data.events) {
            eventsGrid.innerHTML = '';
            if (!data.events.length) {
                eventsGrid.innerHTML = `<p class="text-center">No upcoming events scheduled.</p>`;
            } else {
                data.events.forEach((event, i) => {
                    const card = document.createElement('div');
                    card.className = 'event-card fade-in';
                    card.style.animationDelay = `${i * 0.15}s`;
                    const eventDate = new Date(event.date);
                    card.innerHTML = `
                        <div class="event-date"><strong>${event.date}</strong></div>
                        <h4>${event.title}</h4>
                        <p>${event.description}</p>
                        <p class="event-meta">
                            <em><i class="fas fa-map-marker-alt"></i> ${event.location}</em><br>
                            <em><i class="fas fa-clock"></i> ${event.time || 'Time TBD'}</em>
                        </p>
                        <p class="countdown" data-date="${event.date}"></p>
                    `;
                    eventsGrid.appendChild(card);
                });

                // Countdown Timer
                const countdownElements = document.querySelectorAll('.countdown');
                setInterval(() => {
                    const now = new Date().getTime();
                    countdownElements.forEach(el => {
                        const target = new Date(el.dataset.date).getTime();
                        const diff = target - now;
                        if (diff <= 0) {
                            el.textContent = "Happening Now!";
                        } else {
                            const days = Math.floor(diff / (1000*60*60*24));
                            const hours = Math.floor((diff % (1000*60*60*24))/(1000*60*60));
                            const mins = Math.floor((diff % (1000*60*60))/(1000*60));
                            el.textContent = `Starts in ${days}d ${hours}h ${mins}m`;
                        }
                    });
                }, 60000);
            }
        }

        // ==============================
        // 5. Remove Loaders
        // ==============================
        document.querySelectorAll('.loader').forEach(l => l.remove());

        // ==============================
        // 6. File Upload Preview + Drag & Drop
        // ==============================
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            input.parentNode.appendChild(preview);

            const updatePreview = () => {
                preview.innerHTML = '';
                Array.from(input.files || []).forEach(file => {
                    if (!file.type.startsWith('image/')) return;
                    const reader = new FileReader();
                    reader.onload = e => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            };
            input.addEventListener('change', updatePreview);
            ['dragover','dragenter'].forEach(e => input.addEventListener(e, ev => {
                ev.preventDefault(); input.parentNode.classList.add('dragover');
            }));
            ['dragleave','drop'].forEach(e => input.addEventListener(e, ev => {
                ev.preventDefault(); input.parentNode.classList.remove('dragover'); if(e==='drop') updatePreview();
            }));
        });

        // ==============================
        // 7. Search/Filter Alumni
        // ==============================
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search alumni by name, batch, or role...';
        searchInput.className = 'alumni-search';
        notableGrid.parentNode.insertBefore(searchInput, notableGrid);

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            notableGrid.querySelectorAll('.alumni-card').forEach(card => {
                const name = card.dataset.name;
                const batch = card.dataset.batch.toLowerCase();
                const role = card.dataset.role;
                card.style.display = (name.includes(query) || batch.includes(query) || role.includes(query)) ? 'block' : 'none';
            });
        });

        // ==============================
        // 8. Smooth Scroll for anchor links
        // ==============================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if(target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // ==============================
        // 9. Animate on Scroll
        // ==============================
        const fadeEls = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) entry.target.classList.add('in-view');
            });
        }, { threshold: 0.15 });
        fadeEls.forEach(el => observer.observe(el));

    } catch (err) {
        console.error("Alumni data failed to load:", err);
        ['#notableAlumni','#alumniEvents'].forEach(sel => {
            const el = document.querySelector(sel);
            if(el) el.innerHTML = `<div class="error-msg">Data unavailable. Please check back later.</div>`;
        });
    }
});
