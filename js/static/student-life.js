(() => {
    const DEFAULT_ICON = "fas fa-star";
    const DEFAULT_COLOR = "#1e3a8a";

    document.addEventListener("DOMContentLoaded", () => {

        // ===============================
        // DOM Selectors
        // ===============================
        const fadeElements = document.querySelectorAll(".fade-in, .animate-pop, .slide-left, .slide-right, .reveal");
        const quickNavLinks = document.querySelectorAll(".quick-nav a");

        const sections = {
            clubs: document.getElementById("clubs"),
            featuredClubs: document.getElementById("featuredClubs"),
            activitiesGrid: document.getElementById("clubsGrid"),
            eventsTimeline: document.querySelector(".events-timeline"),
            housesGrid: document.querySelector(".houses-grid"),
            sportsGrid: document.querySelector(".sports-grid"),
            overviewCardsGrid: document.querySelectorAll(".info-cards-grid")[0],
            orgCardsGrid: document.querySelectorAll(".info-cards-grid")[1]
        };

        console.log("Section containers:", sections);

        // ===============================
        // 1. Fetch JSON data and render sections dynamically
        // ===============================
        const loadSectionData = async () => {
            const JSON_PATH = "/data/static/clubs-data.json";

            try {
                const res = await fetch(JSON_PATH, { cache: "no-cache" });
                if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status} ${res.statusText}`);

                const data = await res.json();
                console.log("JSON data loaded:", data);

                // Render sections
                if (data.clubs && sections.featuredClubs && sections.activitiesGrid) {
                    console.log("Rendering clubs...");
                    renderClubs(data.clubs, sections.featuredClubs, sections.activitiesGrid);
                }

                if (data.events && sections.eventsTimeline) {
                    console.log("Rendering events...");
                    renderEvents(data.events, sections.eventsTimeline);
                }

                if (data.houses && sections.housesGrid) {
                    console.log("Rendering houses...");
                    renderHouses(data.houses, sections.housesGrid);
                }

                if (data.sports && sections.sportsGrid) {
                    console.log("Rendering sports...");
                    renderSports(data.sports, sections.sportsGrid);
                }

                if (data.overviewCards && sections.overviewCardsGrid) {
                    console.log("Rendering overview cards...");
                    renderInfoCards(data.overviewCards, sections.overviewCardsGrid);
                }

                if (data.orgCards && sections.orgCardsGrid) {
                    console.log("Rendering org cards...");
                    renderInfoCards(data.orgCards, sections.orgCardsGrid);
                }

                console.log("Student life data loaded successfully");

            } catch (err) {
                console.error("Failed to load student-life data:", err);

                const fallbackMsg = document.createElement("p");
                fallbackMsg.textContent = "Content could not be loaded dynamically. Showing default page content.";
                fallbackMsg.style.color = "#e74c3c";
                fallbackMsg.style.fontWeight = "bold";

                Object.values(sections).forEach(sec => {
                    if (sec) sec.prepend(fallbackMsg.cloneNode(true));
                });
            }
        };

        // ===============================
        // 2. Clubs Render Function
        // ===============================
        function renderClubs(clubs, featuredGrid, activitiesGrid) {
            featuredGrid.innerHTML = "";
            activitiesGrid.innerHTML = "";

            clubs.forEach((club, idx) => {
                console.log("Rendering club:", club.name);

                const fc = document.createElement("div");
                fc.className = "activity-card fade-in show";
                fc.style.animationDelay = `${idx * 0.1}s`;
                fc.innerHTML = `
                    <i class="${club.icon || DEFAULT_ICON} fa-3x" style="color: ${club.color || DEFAULT_COLOR}"></i>
                    <h4>${club.name}</h4>
                    <p>${club.description}</p>
                    ${club.highlight ? `<p class="highlight"><strong>${club.highlight}</strong></p>` : ''}
                `;
                featuredGrid.appendChild(fc);

                const ac = document.createElement("div");
                ac.className = "activity-card fade-in show";
                ac.style.animationDelay = `${idx * 0.1}s`;
                ac.innerHTML = `
                    <i class="${club.icon || DEFAULT_ICON} fa-3x" style="color: ${club.color || DEFAULT_COLOR}"></i>
                    <h4>${club.name}</h4>
                    <p>${club.shortDesc || club.description.substring(0, 80) + "..."}</p>
                `;
                activitiesGrid.appendChild(ac);
            });

            document.querySelectorAll('.loader').forEach(loader => loader.remove());
        }

        // ===============================
        // 3. Events Render Function
        // ===============================
        function renderEvents(events, container) {
            console.log("Events container before rendering:", container);

            // Clear container completely, including any hardcoded elements
            while (container.firstChild) container.removeChild(container.firstChild);

            events.forEach((ev, idx) => {
                console.log("Rendering event:", ev.title);

                const div = document.createElement("div");
                div.className = `event-month fade-in ${idx % 2 === 0 ? 'slide-left' : 'slide-right'}`;
                div.style.animationDelay = `${idx * 0.15}s`;
                div.innerHTML = `
                    ${ev.month}
                    <span>${ev.title}</span>
                    <p class="event-details">${ev.description}</p>
                `;
                container.appendChild(div);
            });
        }

        // ===============================
        // 4. Houses Render Function
        // ===============================
        function renderHouses(houses, container) {
            container.innerHTML = "";
            houses.forEach(h => {
                console.log("Rendering house:", h.name);
                const div = document.createElement("div");
                div.className = "house-card hover-zoom fade-in show";
                div.style.setProperty("--house-color", h.color || DEFAULT_COLOR);
                div.innerHTML = `
                    <div class="house-emblem"><i class="${h.icon || DEFAULT_ICON} fa-2x"></i></div>
                    <h3>${h.name}</h3>
                    <p><strong>Motto:</strong> ${h.motto}</p>
                    ${h.points.map(p => `<p><i class="${p.icon}"></i> ${p.text}</p>`).join("")}
                `;
                container.appendChild(div);
            });
        }

        // ===============================
        // 5. Sports Render Function
        // ===============================
        function renderSports(sports, container) {
            container.innerHTML = "";
            sports.forEach((s, idx) => {
                console.log("Rendering sport:", s.name);
                const div = document.createElement("div");
                div.className = "sport-item fade-in show lightbox-open";
                div.style.animationDelay = `${idx * 0.12}s`;
                div.innerHTML = `
                    <img src="${s.img}" alt="${s.name}">
                    <h4><i class="${s.icon}" style="color: ${s.color}"></i> ${s.name}</h4>
                    <p class="sport-desc">${s.description}</p>
                `;
                container.appendChild(div);
            });
        }

        // ===============================
        // 6. Info Cards Render Function
        // ===============================
        function renderInfoCards(cards, container) {
            if (!container || !cards) return;
            container.innerHTML = "";
            cards.forEach((card, idx) => {
                console.log("Rendering info card:", card.title);
                const div = document.createElement("div");
                div.className = "info-card fade-in show";
                div.style.animationDelay = `${idx * 0.1}s`;
                div.innerHTML = `
                    <i class="${card.icon || DEFAULT_ICON}" style="color: ${card.color || DEFAULT_COLOR}"></i>
                    <h3>${card.title}</h3>
                    <p>${card.description}</p>
                    ${card.list ? `<ul>${card.list.map(li => `<li>${li}</li>`).join("")}</ul>` : ''}
                `;
                container.appendChild(div);
            });
        }

        // ===============================
        // 7. Lazy Load Images + Fade Animations
        // ===============================
        function initAnimations() {
            document.querySelectorAll("img.lazy-blur").forEach(img => {
                const fullSrc = img.dataset.full;
                if (!fullSrc) return;
                const tempImg = new Image();
                tempImg.src = fullSrc;
                tempImg.onload = () => {
                    img.src = fullSrc;
                    img.classList.add("loaded");
                };
            });

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: "50px" });

            fadeElements.forEach(el => observer.observe(el));
        }

        // ===============================
        // 8. Smooth Scroll for Quick Navigation
        // ===============================
        quickNavLinks.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute("href"));
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        // ===============================
        // 9. Initialize All
        // ===============================
        loadSectionData();
        initAnimations();
    });
})();
