document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 768) { initCursor(); }
    initMagneticElements();
    initThemeToggle();
    initContactForm();
    
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
        blogPosts = data.posts || [];
        currentBlogPage = 1;
        initializeBlogUI();

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

let blogPosts = [];
let currentBlogPage = 1;
const BLOGS_PER_PAGE = 4;

function initThemeToggle() {
    const savedTheme = localStorage.getItem('siteTheme');
    const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(preferredTheme);

    const nav = document.querySelector('nav');
    if (!nav || nav.querySelector('.theme-toggle')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle hover-target';
    button.setAttribute('aria-label', 'Toggle theme');
    button.innerHTML = `<span class="theme-icon">${preferredTheme === 'light' ? '☀' : '☾'}</span><span class="theme-label">Theme</span>`;
    button.addEventListener('click', () => {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem('siteTheme', nextTheme);
    });

    nav.appendChild(button);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'light' ? '☀' : '☾';
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const status = document.getElementById('formStatus');
    const button = document.getElementById('submitBtn');

    const showFormStatus = (message, type) => {
        if (!status) return;
        status.textContent = message;
        status.className = `status-message ${type}`;
        status.style.display = 'block';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('[name="name"]');
        const email = form.querySelector('[name="email"]');
        const message = form.querySelector('[name="message"]');

        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
            showFormStatus('Please fill in all required fields before sending.', 'error');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
            showFormStatus('Please enter a valid email address.', 'error');
            email.focus();
            return;
        }

        button.disabled = true;
        button.textContent = 'Sending...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            });

            if (response.ok) {
                showFormStatus('Message sent successfully. We will reply shortly.', 'success');
                form.reset();
            } else {
                const result = await response.json();
                showFormStatus(result.error || 'Submission failed. Please try again later.', 'error');
            }
        } catch (error) {
            console.error(error);
            showFormStatus('Unable to send right now. Please try again later.', 'error');
        } finally {
            button.disabled = false;
            button.textContent = 'Send Message';
        }
    });
}

function renderBlogCards(posts, page = 1) {
    const container = document.getElementById('blog-container');
    if (!container) return;

    const startIndex = (page - 1) * BLOGS_PER_PAGE;
    const chunk = posts.slice(startIndex, startIndex + BLOGS_PER_PAGE);

    if (!chunk.length) {
        container.innerHTML = `<div class="no-results">No posts match your search. Try a different keyword.</div>`;
        return;
    }

    container.innerHTML = chunk.map((post, index) => `
        <a href="${post.link}" class="article-card reveal" style="transition-delay: ${index * 0.07}s" target="_blank" rel="noopener noreferrer">
            <div class="article-meta">
                <span>${post.category}</span>
                <span>${post.date}</span>
            </div>
            <h2 class="article-title text-target">${post.title}</h2>
            <p class="article-desc text-target">${post.description}</p>
            <span class="read-more">Read more →</span>
        </a>
    `).join('');

    initScrollReveal();
}

function renderBlogPagination(totalPosts, totalPages) {
    const pagination = document.getElementById('blog-pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;
        return `<button class="page-button ${pageNumber === currentBlogPage ? 'active' : ''}" data-page="${pageNumber}">${pageNumber}</button>`;
    }).join('');

    pagination.querySelectorAll('.page-button').forEach(button => {
        button.addEventListener('click', () => {
            currentBlogPage = Number(button.dataset.page);
            const filtered = getFilteredPosts();
            renderBlogCards(filtered, currentBlogPage);
            renderBlogPagination(filtered.length, Math.ceil(filtered.length / BLOGS_PER_PAGE));
        });
    });
}

function getFilteredPosts() {
    const query = document.getElementById('blog-search')?.value.trim().toLowerCase() || '';
    if (!query) return blogPosts;
    return blogPosts.filter(post => {
        return [post.title, post.description, post.category].some(value => value.toLowerCase().includes(query));
    });
}

function updateBlogResults(posts) {
    const resultCount = document.querySelector('.result-count');
    if (!resultCount) return;
    const total = posts.length;
    const start = total === 0 ? 0 : (currentBlogPage - 1) * BLOGS_PER_PAGE + 1;
    const end = Math.min(currentBlogPage * BLOGS_PER_PAGE, total);
    resultCount.textContent = total === 0 ? 'No insights found.' : `Showing ${start}–${end} of ${total} insights`;
}

function attachBlogSearch() {
    const search = document.getElementById('blog-search');
    if (!search) return;

    search.addEventListener('input', () => {
        currentBlogPage = 1;
        const filtered = getFilteredPosts();
        renderBlogCards(filtered, currentBlogPage);
        renderBlogPagination(filtered.length, Math.ceil(filtered.length / BLOGS_PER_PAGE));
        updateBlogResults(filtered);
    });
}

function initializeBlogUI() {
    const filtered = getFilteredPosts();
    renderBlogCards(filtered, currentBlogPage);
    renderBlogPagination(filtered.length, Math.ceil(filtered.length / BLOGS_PER_PAGE));
    updateBlogResults(filtered);
    attachBlogSearch();
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
// ==========================================
// 🖱️ CYBERPUNK CUSTOM CURSOR LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.querySelector('.cursor');
    
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add 'hovering' class to cursor when mousing over interactive elements
        const hoverTargets = document.querySelectorAll('a, button, input, .hover-target, .bento-cta, .cap-card');

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            target.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }
});