// Register plugins
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor (Desktop Only)
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const interactiveElements = document.querySelectorAll('a, button, .hover-target');

let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
});

gsap.ticker.add(() => {
    cursorX += (mouseX - cursorX) * 0.8;
    cursorY += (mouseY - cursorY) * 0.8;
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    gsap.set(cursor, { x: cursorX, y: cursorY });
    gsap.set(follower, { x: followerX, y: followerY });
});

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover'); follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover'); follower.classList.remove('hover');
    });
});

// Device Preview Logic
const toggleButtons = document.querySelectorAll('.toggle-btn');
const portfolioView = document.getElementById('portfolio-view');

toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Toggle Active State
        toggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle View Class
        const view = btn.getAttribute('data-view');
        if (view === 'mobile') {
            portfolioView.classList.add('is-mobile');
        } else {
            portfolioView.classList.remove('is-mobile');
        }

        // Extremely important: refresh ScrollTrigger and Canvas after layout transition
        setTimeout(() => {
            ScrollTrigger.refresh();
            // Dispatch a resize event to trigger canvas update
            window.dispatchEvent(new Event('resize'));
        }, 800); // 700ms transition time + 100ms buffer
    });
});


// Initialization Sequence
function initIntro() {
    gsap.set('.line', { y: '110%' });
    gsap.set('.reveal-hero', { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero-title .line', { y: '0%', duration: 1.5, stagger: 0.1, delay: 0.2 })
      .to('.hero-subtitle .line', { y: '0%', duration: 1.2, stagger: 0.1 }, "-=1")
      .to('.reveal-hero', { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.8");
}

// Scroll Animations
function initScroll() {
    // Crucial: Tell ScrollTrigger to watch the .portfolio-view element instead of window
    ScrollTrigger.defaults({
        scroller: ".portfolio-view"
    });

    gsap.utils.toArray('.reveal-text').forEach(text => {
        gsap.from(text, {
            scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none reverse' },
            y: 40, opacity: 0, duration: 1.2, ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.reveal-card, .reveal-list').forEach(card => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
            y: 40, opacity: 0, duration: 1, ease: 'power3.out'
        });
    });

    gsap.from('.reveal-button', {
        scrollTrigger: { trigger: '.reveal-button', start: 'top 90%', toggleActions: 'play none none reverse' },
        scale: 0.9, opacity: 0, duration: 0.8, ease: 'back.out(1.5)'
    });
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    initIntro();
    initScroll();
    initParticles();
});

// Minimalist Particle System
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    const container = document.getElementById('portfolio-view');
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Config
    const particleCount = 40; // Keeps it clean and subtle
    const connectionDistance = 150;
    
    function resize() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow drift
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.5 + 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Wrap around edges softly
            if (this.x < -50) this.x = width + 50;
            if (this.x > width + 50) this.x = -50;
            if (this.y < -50) this.y = height + 50;
            if (this.y > height + 50) this.y = -50;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();
        }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Connect nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < connectionDistance) {
                    // Opacity based on distance (closer = more opaque)
                    const opacity = 1 - (dist / connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}
