document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 768) { initCursor(); }
    initMagneticElements();
    
    // Initialize Page Transitions
    initPageTransitions();
    
    // We load blogs first, then initialize the scroll reveal animations
    loadBlogs().then(() => {
        initScrollReveal();
    });
});

async function loadBlogs() {
    const container = document.getElementById('blog-container');
    if (!container) return; // Stop if we aren't on the insights page

    try {
        // Fetching with absolute path from root so it always finds the data folder
        const response = await fetch('/data/blogs.json');
        const data = await response.json();
        const posts = data.posts || [];

        container.innerHTML = posts.map((post, index) => `
            <a href="${post.link}" class="article-card reveal" style="transition-delay: ${index * 0.1}s">
                <div class="article-meta">
                    <span>${post.category}</span>
                    <span>${post.date}</span>
                </div>
                <h2 class="article-title text-target">${post.title}</h2>
                <p class="article-desc text-target">${post.description}</p>
            </a>
        `).join('');

        // Re-attach "READ" Cursor logic to new blog cards
        if (window.innerWidth > 768) {
            const cursor = document.querySelector(".cursor");
            const cursorText = document.querySelector(".cursor-text");
            document.querySelectorAll(".article-card").forEach(card => {
                card.addEventListener("mouseenter", () => { cursor.classList.add("view-mode"); cursorText.textContent = "READ"; });
                card.addEventListener("mouseleave", () => { cursor.classList.remove("view-mode"); cursorText.textContent = ""; });
            });
        }
    } catch (error) {
        console.error('Failed to load insights:', error);
    }
}

function initCursor() {
    const cursor = document.querySelector(".cursor");
    const cursorText = document.querySelector(".cursor-text");
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, cursorX = mouseX, cursorY = mouseY;

    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.2; 
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = `${cursorX}px`; cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    window.addEventListener("mousedown", () => cursor.classList.add("click-mode"));
    window.addEventListener("mouseup", () => cursor.classList.remove("click-mode"));

    document.querySelectorAll(".hover-target").forEach(target => {
        target.addEventListener("mouseenter", () => cursor.classList.add("pointer-mode"));
        target.addEventListener("mouseleave", () => cursor.classList.remove("pointer-mode"));
    });

    document.querySelectorAll(".project-row").forEach(row => {
        row.addEventListener("mouseenter", () => { cursor.classList.add("view-mode"); cursorText.textContent = "VIEW"; });
        row.addEventListener("mouseleave", () => { cursor.classList.remove("view-mode"); cursorText.textContent = ""; });
    });

    document.querySelectorAll(".text-target, h1, h2").forEach(target => {
        target.addEventListener("mouseenter", () => cursor.classList.add("text-mode"));
        target.addEventListener("mouseleave", () => cursor.classList.remove("text-mode"));
    });
}

function initMagneticElements() {
    document.querySelectorAll('.magnetic').forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
            elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            elem.style.transition = 'transform 0.1s ease-out';
        });
        elem.addEventListener('mouseleave', () => {
            elem.style.transform = `translate(0px, 0px)`;
            elem.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { 
            if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -80px 0px" });

    document.querySelectorAll('.reveal').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });
}

function initPageTransitions() {
    document.querySelectorAll('a').forEach(link => {
        // Only animate internal links, ignore links meant to open in a new tab or mailto links
        if (link.hostname === window.location.hostname && link.target !== "_blank" && !link.href.includes('mailto:')) {
            link.addEventListener('click', e => {
                e.preventDefault(); 
                const targetUrl = link.href;
                
                document.body.classList.add('fade-out');
                
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500); 
            });
        }
    });
}
// ==========================================
// 🚀 CYBERPUNK PRELOADER LOGIC
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Wait 1.2 seconds for the bar to "load", then slide screen up
        setTimeout(() => {
            preloader.classList.add('preloader-hide');
            // Remove completely from DOM after animation finishes
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }, 1200);
    }
});