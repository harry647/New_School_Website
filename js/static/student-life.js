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
        // 1. Enhanced Lightbox Modal
        // ===============================
        function initLightbox() {
            const modal = document.getElementById("lightboxModal");
            const modalImg = document.getElementById("lightboxImage");
            const closeBtn = document.querySelector(".close-lightbox");

            // Add click handlers for lightbox items
            document.addEventListener("click", (e) => {
                if (e.target.matches(".lightbox-open, .lightbox-open *")) {
                    e.preventDefault();
                    
                    // Find the image
                    let img = e.target;
                    if (!img.tagName || img.tagName !== "IMG") {
                        img = img.closest(".sport-item").querySelector("img");
                    }
                    
                    if (img && modal && modalImg) {
                        modalImg.src = img.src || img.dataset.src;
                        modalImg.alt = img.alt || "Gallery Image";
                        modal.classList.add("active");
                        document.body.style.overflow = "hidden";
                        
                        // Add entrance animation
                        modalImg.style.transform = "scale(0.8)";
                        modalImg.style.opacity = "0";
                        setTimeout(() => {
                            modalImg.style.transition = "all 0.3s ease-out";
                            modalImg.style.transform = "scale(1)";
                            modalImg.style.opacity = "1";
                        }, 10);
                    }
                }
            });

            // Close modal functionality
            function closeModal() {
                if (modal) {
                    modal.classList.remove("active");
                    document.body.style.overflow = "";
                    modalImg.style.transform = "scale(0.8)";
                    modalImg.style.opacity = "0";
                }
            }

            if (closeBtn) {
                closeBtn.addEventListener("click", closeModal);
            }

            if (modal) {
                modal.addEventListener("click", (e) => {
                    if (e.target === modal) closeModal();
                });

                // Escape key to close
                document.addEventListener("keydown", (e) => {
                    if (e.key === "Escape" && modal.classList.contains("active")) {
                        closeModal();
                    }
                });
            }
        }

        // ===============================
        // 2. Enhanced Intersection Observer with Staggered Animations
        // ===============================
        function initAnimations() {
            // Lazy load images with smooth transition
            document.querySelectorAll("img.lazy-blur").forEach(img => {
                const fullSrc = img.dataset.full;
                if (!fullSrc) return;
                
                const tempImg = new Image();
                tempImg.src = fullSrc;
                tempImg.onload = () => {
                    img.style.filter = "blur(10px)";
                    img.style.transition = "filter 0.6s ease-out, transform 0.6s ease-out";
                    img.src = fullSrc;
                    
                    setTimeout(() => {
                        img.style.filter = "blur(0)";
                        img.classList.add("loaded");
                    }, 50);
                };
            });

            // Enhanced Intersection Observer with multiple thresholds
            const observerOptions = {
                threshold: [0.1, 0.3, 0.5, 0.7],
                rootMargin: "0px 0px -100px 0px"
            };

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // Add different animation classes based on element type
                        if (element.classList.contains("house-card")) {
                            element.style.animationDelay = `${Math.random() * 0.3}s`;
                        } else if (element.classList.contains("activity-card")) {
                            element.style.animationDelay = `${Math.random() * 0.4}s`;
                        } else if (element.classList.contains("sport-item")) {
                            element.style.animationDelay = `${Math.random() * 0.2}s`;
                        }
                        
                        element.classList.add("in-view");
                        
                        // Unobserve after animation to improve performance
                        obs.unobserve(element);
                    }
                });
            }, observerOptions);

            fadeElements.forEach(el => observer.observe(el));
        }

        // ===============================
        // 3. Enhanced Smooth Scroll for Navigation
        // ===============================
        function initSmoothScroll() {
            quickNavLinks.forEach(link => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute("href");
                    const target = document.querySelector(targetId);
                    
                    if (target) {
                        // Add active state to clicked link
                        quickNavLinks.forEach(l => l.classList.remove("active"));
                        link.classList.add("active");
                        
                        // Smooth scroll with offset for sticky header
                        const headerOffset = 120;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                });
            });

            // Update active nav on scroll
            window.addEventListener("scroll", throttle(() => {
                let current = '';
                const scrollPosition = window.pageYOffset + 150;

                document.querySelectorAll('section[id]').forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    
                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                quickNavLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${current}`) {
                        link.classList.add("active");
                    }
                });
            }, 100));
        }

        // ===============================
        // 4. Throttle function for performance
        // ===============================
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }

        // ===============================
        // 5. Enhanced Dynamic Content Loading
        // ===============================
        const loadSectionData = async () => {
            const JSON_PATH = "/api/student-life/data";

            try {
                const res = await fetch(JSON_PATH, { 
                    cache: "no-cache",
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (!res.ok) throw new Error(`Failed to fetch JSON: ${res.status} ${res.statusText}`);

                const response = await res.json();
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch data');
                }
                
                const data = response.data;
                console.log("JSON data loaded:", data);

                // Render sections with enhanced animations
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
                fallbackMsg.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                    Content could not be loaded dynamically. Showing default page content.
                `;
                fallbackMsg.style.cssText = `
                    color: #e74c3c; 
                    font-weight: bold; 
                    text-align: center; 
                    padding: 1rem;
                    background: rgba(231, 76, 60, 0.1);
                    border-radius: 8px;
                    margin: 1rem 0;
                `;

                Object.values(sections).forEach(sec => {
                    if (sec) sec.prepend(fallbackMsg.cloneNode(true));
                });
            }
        };

        // ===============================
        // 6. Enhanced Clubs Render Function
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
                
                // Add hover effect
                fc.addEventListener("mouseenter", () => {
                    fc.style.transform = "translateY(-8px) scale(1.02)";
                });
                fc.addEventListener("mouseleave", () => {
                    fc.style.transform = "translateY(0) scale(1)";
                });

                featuredGrid.appendChild(fc);

                const ac = document.createElement("div");
                ac.className = "activity-card fade-in show";
                ac.style.animationDelay = `${idx * 0.1}s`;
                ac.innerHTML = `
                    <i class="${club.icon || DEFAULT_ICON} fa-3x" style="color: ${club.color || DEFAULT_COLOR}"></i>
                    <h4>${club.name}</h4>
                    <p>${club.shortDesc || club.description.substring(0, 80) + "..."}</p>
                `;
                
                // Add hover effect
                ac.addEventListener("mouseenter", () => {
                    ac.style.transform = "translateY(-8px) scale(1.02)";
                });
                ac.addEventListener("mouseleave", () => {
                    ac.style.transform = "translateY(0) scale(1)";
                });

                activitiesGrid.appendChild(ac);
            });

            document.querySelectorAll('.loader').forEach(loader => loader.remove());
        }

        // ===============================
        // 7. Enhanced Events Render Function
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
                
                // Add click to expand functionality
                div.addEventListener("click", () => {
                    const details = div.querySelector(".event-details");
                    if (details) {
                        details.style.maxHeight = details.style.maxHeight === "none" ? "150px" : "none";
                        div.classList.toggle("expanded");
                    }
                });

                container.appendChild(div);
            });
        }

        // ===============================
        // 8. Enhanced Houses Render Function
        // ===============================
        function renderHouses(houses, container) {
            container.innerHTML = "";
            houses.forEach((h, idx) => {
                console.log("Rendering house:", h.name);
                const div = document.createElement("div");
                div.className = "house-card hover-zoom fade-in show";
                div.style.setProperty("--house-color", h.color || DEFAULT_COLOR);
                div.style.animationDelay = `${idx * 0.1}s`;
                div.innerHTML = `
                    <div class="house-emblem"><i class="${h.icon || DEFAULT_ICON} fa-2x"></i></div>
                    <h3>${h.name}</h3>
                    <p><strong>Motto:</strong> ${h.motto}</p>
                    ${h.points.map(p => `<p><i class="${p.icon}"></i> ${p.text}</p>`).join("")}
                `;
                
                // Add enhanced hover effects
                div.addEventListener("mouseenter", () => {
                    div.style.transform = "translateY(-12px) rotateX(5deg)";
                    div.querySelector(".house-emblem").style.transform = "scale(1.1) rotateY(180deg)";
                });
                div.addEventListener("mouseleave", () => {
                    div.style.transform = "translateY(0) rotateX(0deg)";
                    div.querySelector(".house-emblem").style.transform = "scale(1) rotateY(0deg)";
                });

                container.appendChild(div);
            });
        }

        // ===============================
        // 9. Enhanced Sports Render Function
        // ===============================
        function renderSports(sports, container) {
            container.innerHTML = "";
            sports.forEach((s, idx) => {
                console.log("Rendering sport:", s.name);
                const a = document.createElement("a");
                a.href = s.full;
                a.dataset.lightbox = "sports-gallery";
                a.dataset.title = s.name;
                a.className = "sport-item lightbox-open fade-in show";
                a.style.animationDelay = `${idx * 0.12}s`;
                a.innerHTML = `
                    <img src="${s.img}" alt="${s.name}" loading="lazy">
                    <h4><i class="${s.icon}" style="color: ${s.color}"></i> ${s.name}</h4>
                    <p class="sport-desc">${s.description}</p>
                `;
                
                // Add enhanced hover effects for sports items
                a.addEventListener("mouseenter", () => {
                    const img = a.querySelector("img");
                    if (img) {
                        img.style.transform = "scale(1.15) rotate(2deg)";
                    }
                    a.style.transform = "translateY(-8px) rotateX(5deg)";
                });
                a.addEventListener("mouseleave", () => {
                    const img = a.querySelector("img");
                    if (img) {
                        img.style.transform = "scale(1) rotate(0deg)";
                    }
                    a.style.transform = "translateY(0) rotateX(0deg)";
                });

                container.appendChild(a);
            });
        }

        // ===============================
        // 10. Enhanced Info Cards Render Function
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
                
                // Add enhanced hover effects for info cards
                div.addEventListener("mouseenter", () => {
                    div.style.transform = "translateY(-6px) scale(1.02)";
                    const icon = div.querySelector("i");
                    if (icon) {
                        icon.style.transform = "scale(1.3) rotate(10deg)";
                    }
                });
                div.addEventListener("mouseleave", () => {
                    div.style.transform = "translateY(0) scale(1)";
                    const icon = div.querySelector("i");
                    if (icon) {
                        icon.style.transform = "scale(1) rotate(0deg)";
                    }
                });

                container.appendChild(div);
            });
        }

        // ===============================
        // 11. Enhanced Page Load Effects
        // ===============================
        function initPageEffects() {
            // Add page entrance animation
            document.body.style.opacity = "0";
            document.body.style.transition = "opacity 0.5s ease-in-out";
            
            setTimeout(() => {
                document.body.style.opacity = "1";
            }, 100);

            // Add floating animation to hero elements
            const heroElements = document.querySelectorAll(".page-hero h1, .page-hero p");
            heroElements.forEach((el, idx) => {
                el.style.animation = `float 6s ease-in-out ${idx * 0.5}s infinite`;
            });

            // Add parallax effect to hero background
            window.addEventListener("scroll", throttle(() => {
                const scrolled = window.pageYOffset;
                const hero = document.querySelector(".page-hero");
                if (hero && scrolled < hero.offsetHeight) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
            }, 16));
        }

        // ===============================
        // 12. Enhanced Mobile Menu Integration
        // ===============================
        function initMobileEnhancements() {
            // Add touch-friendly hover states for mobile
            if ('ontouchstart' in window) {
                document.querySelectorAll('.activity-card, .house-card, .sport-item, .info-card').forEach(card => {
                    card.addEventListener("touchstart", () => {
                        card.style.transform = "scale(0.98)";
                    });
                    card.addEventListener("touchend", () => {
                        setTimeout(() => {
                            card.style.transform = "scale(1)";
                        }, 150);
                    });
                });
            }

            // Optimize quick nav for mobile
            const quickNav = document.querySelector(".quick-nav");
            if (quickNav && window.innerWidth <= 768) {
                quickNav.style.position = "sticky";
                quickNav.style.zIndex = "99";
                quickNav.style.top = "70px";
            }
        }

        // ===============================
        // 13. Performance Optimizations
        // ===============================
        function initPerformanceOptimizations() {
            // Preload critical images
            const criticalImages = [
                '/assets/images/student-life/group-happy-small.jpg',
                '/assets/images/student-life/group-happy.jpg'
            ];

            criticalImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });

            // Add resource hints
            const dnsLink = document.createElement('link');
            dnsLink.rel = 'dns-prefetch';
            dnsLink.href = 'https://fonts.googleapis.com';
            document.head.appendChild(dnsLink);

            const preconnectLink = document.createElement('link');
            preconnectLink.rel = 'preconnect';
            preconnectLink.href = 'https://cdnjs.cloudflare.com';
            document.head.appendChild(preconnectLink);
        }

        // ===============================
        // 14. Error Handling & Fallbacks
        // ===============================
        window.addEventListener("error", (e) => {
            console.error("Global error:", e.error);
        });

        window.addEventListener("unhandledrejection", (e) => {
            console.error("Unhandled promise rejection:", e.reason);
        });

        // ===============================
        // 15. Initialize All Functions
        // ===============================
        try {
            initLightbox();
            initAnimations();
            initSmoothScroll();
            initPageEffects();
            initMobileEnhancements();
            initPerformanceOptimizations();
            loadSectionData();

            console.log("Student Life page initialized successfully");
        } catch (error) {
            console.error("Error initializing Student Life page:", error);
        }
    });
})();
