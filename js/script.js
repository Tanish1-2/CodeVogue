document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 768) {
        initCursor();
    }
    
    initMagneticElements();
    initScrollReveal();
});

function initCursor() {
    const cursor = document.querySelector(".cursor");
    const cursorText = document.querySelector(".cursor-text");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        let distX = mouseX - cursorX;
        let distY = mouseY - cursorY;
        
        cursorX = cursorX + (distX * 0.2); 
        cursorY = cursorY + (distY * 0.2);
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    window.addEventListener("mousedown", () => cursor.classList.add("click-mode"));
    window.addEventListener("mouseup", () => cursor.classList.remove("click-mode"));

    const hoverTargets = document.querySelectorAll(".hover-target");
    hoverTargets.forEach(target => {
        target.addEventListener("mouseenter", () => cursor.classList.add("pointer-mode"));
        target.addEventListener("mouseleave", () => cursor.classList.remove("pointer-mode"));
    });

    // Portfolio "VIEW" trigger
    const projectRows = document.querySelectorAll(".project-row");
    projectRows.forEach(row => {
        row.addEventListener("mouseenter", () => {
            cursor.classList.add("view-mode");
            cursorText.textContent = "VIEW";
        });
        row.addEventListener("mouseleave", () => {
            cursor.classList.remove("view-mode");
            cursorText.textContent = "";
        });
    });

    // NEW: Blog/Insights "READ" trigger
    const articleCards = document.querySelectorAll(".article-card");
    articleCards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            cursor.classList.add("view-mode");
            cursorText.textContent = "READ"; // Changes text for blog posts
        });
        card.addEventListener("mouseleave", () => {
            cursor.classList.remove("view-mode");
            cursorText.textContent = "";
        });
    });

    const textTargets = document.querySelectorAll(".text-target, h1, h2");
    textTargets.forEach(target => {
        target.addEventListener("mouseenter", () => cursor.classList.add("text-mode"));
        target.addEventListener("mouseleave", () => cursor.classList.remove("text-mode"));
    });
}

function initMagneticElements() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
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
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); 
                observer.unobserve(entry.target); 
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px" 
    });

    document.querySelectorAll('.reveal').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });
}
