// ==================================================
// CUSTOM LIGHTBOX – FINAL 2025+ BULLETPROOF VERSION
// Works even if other lightbox libraries exist
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // Avoid conflict with other lightbox plugins
    if (window.customLightboxActive) return;
    window.customLightboxActive = true;

    // Create modal
    let lightbox = document.getElementById("custom-lightbox");
    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.id = "custom-lightbox";
        lightbox.className = "custom-lightbox";
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev">&lt;</button>
                <button class="lightbox-next">&gt;</button>
                <img src="" alt="" class="lightbox-img">
                <div class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const overlay = lightbox.querySelector(".lightbox-overlay");
    const content = lightbox.querySelector(".lightbox-content");
    const img = lightbox.querySelector(".lightbox-img");
    const caption = lightbox.querySelector(".lightbox-caption");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    let currentIndex = 0;
    let galleryItems = [];

    // Collect all clickable images
    function collectItems() {
        galleryItems = Array.from(document.querySelectorAll(`
            .gallery-item img,
            .sport-item img,
            [data-lightbox],
            a[href$=".jpg"],
            a[href$=".jpeg"],
            a[href$=".png"],
            a[href$=".webp"],
            a[href$=".gif"]
        `)).filter(el => {
            const href = el.getAttribute("href") || el.src;
            return href && (href.includes("http") || href.includes("/assets/"));
        });
    }

    // Open lightbox
    function openLightbox(index) {
        if (!galleryItems[index]) return;

        currentIndex = index;
        const item = galleryItems[index];
        const src = item.dataset.full || item.getAttribute("href") || item.src || item.dataset.src;
        const title = item.dataset.title || item.alt || item.title || "";

        img.src = "";
        img.classList.remove("loaded");
        caption.textContent = title;

        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";

        const loader = new Image();
        loader.onload = () => {
            img.src = src;
            img.alt = title;
            img.classList.add("loaded");
        };
        loader.onerror = () => {
            img.src = "/assets/images/default-gallery.jpg";
            img.alt = "Image not available";
            img.classList.add("loaded");
        };
        loader.src = src;
    }

    // Close
    function closeLightbox() {
        lightbox.classList.remove("open");
        setTimeout(() => {
            img.src = "";
            document.body.style.overflow = "";
        }, 300);
    }

    // Navigate
    function navigate(direction) {
        currentIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
        openLightbox(currentIndex);
    }

    // Event Listeners
    collectItems();
    galleryItems.forEach((item, i) => {
        item.style.cursor = "pointer";
        item.addEventListener("click", (e) => {
            e.preventDefault();
            openLightbox(i);
        });
    });

    closeBtn.onclick = closeLightbox;
    overlay.onclick = closeLightbox;

    prevBtn.onclick = () => navigate(-1);
    nextBtn.onclick = () => navigate(1);

    // Keyboard
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(1);
    });

    // Re-collect on dynamic content (for galleries loaded later)
    const observer = new MutationObserver(() => {
        collectItems();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("%cCustom Lightbox Active – Stunning & Working!", "color:#ec4899;font-weight:bold");
});