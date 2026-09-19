/* ==========================================================
   script.js — Portfolio Interactions & Animation Engine
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────────────────────
  // 1. CUSTOM CURSOR & MAGNETIC BUTTONS
  // ──────────────────────────────────────────────────────────
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  // Check touch / reduced-motion capability
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (cursorDot && cursorRing && !isTouchDevice && !prefersReducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursorRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(renderCursorRing);
    }
    requestAnimationFrame(renderCursorRing);

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card, .info-card, .timeline-card, .social-icon');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Magnetic Button Effect
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnX = e.clientX - rect.left - rect.width / 2;
        const btnY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${btnX * 0.2}px, ${btnY * 0.2}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // 2. HERO PARTICLE BACKGROUND
  // ──────────────────────────────────────────────────────────
  const canvas = document.getElementById('particleCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            this.x += dx * force * 0.02;
            this.y += dy * force * 0.02;
          }
        }

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 9000), 90);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 250);
    });
  }

  // ──────────────────────────────────────────────────────────
  // 3. TYPED ROLE EFFECT
  // ──────────────────────────────────────────────────────────
  const roles = [
    'Full Stack Developer',
    'Manual Testing & QA Intern',
    'AI & Machine Learning Enthusiast',
    'Cloud & DevOps Explorer',
    'Competitive Problem Solver'
  ];
  const typedEl = document.getElementById('heroTyped');
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeRole() {
    if (!typedEl) return;
    const current = roles[roleIdx];
    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIdx--);
      typeSpeed = 35;
    } else {
      typedEl.textContent = current.substring(0, charIdx++);
      typeSpeed = 80;
    }

    if (!isDeleting && charIdx > current.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx < 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400;
    }
    setTimeout(typeRole, typeSpeed);
  }
  if (typedEl) typeRole();

  // ──────────────────────────────────────────────────────────
  // 4. THEME TOGGLE
  // ──────────────────────────────────────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const savedTheme = localStorage.getItem('sb-theme');
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('sb-theme', nextTheme);
    });
  }

  // ──────────────────────────────────────────────────────────
  // 5. STICKY NAVBAR & ACTIVE NAV LINK
  // ──────────────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  function handleScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach((s) => navObserver.observe(s));

  // ──────────────────────────────────────────────────────────
  // 6. HAMBURGER MOBILE MENU
  // ──────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksEl.classList.toggle('open');
      document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    });

    navLinksEl.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // 7. SCROLL REVEAL ANIMATIONS (Progressive scroll entrance)
  // ──────────────────────────────────────────────────────────
  let revealObserver;
  function initRevealObserver() {
    if (revealObserver) {
      revealObserver.disconnect();
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  }
  initRevealObserver();

  function setupScrollReveals(container = document) {
    const reveals = container.querySelectorAll('.reveal, .reveal-hero, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger');
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inTopViewport = rect.top >= 0 && rect.top < window.innerHeight * 0.7;
      if (inTopViewport && window.scrollY < 120) {
        setTimeout(() => el.classList.add('visible'), 60);
      } else {
        el.classList.remove('visible');
        revealObserver.observe(el);
      }
    });
  }
  setupScrollReveals();

  // ──────────────────────────────────────────────────────────
  // 8. ANIMATED STAT COUNTERS
  // ──────────────────────────────────────────────────────────
  const counters = document.querySelectorAll('.stat-number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach((counter) => {
      const target = parseFloat(counter.dataset.target);
      const isDecimal = counter.dataset.decimal === 'true';
      const duration = 1800;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = isDecimal ? target.toFixed(1) : target;
        }
      }
      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  // ──────────────────────────────────────────────────────────
  // 9. LEETCODE BAR ANIMATION
  // ──────────────────────────────────────────────────────────
  const barFills = document.querySelectorAll('.lc-bar-fill');
  const codingSection = document.getElementById('coding');

  if (codingSection) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          barFills.forEach((bar) => bar.classList.add('animated'));
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    barObserver.observe(codingSection);
  }

  // ──────────────────────────────────────────────────────────
  // 10. CONTACT FORM HANDLING
  // ──────────────────────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending…`;

      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        _captcha: 'false'
      };

      fetch('https://formsubmit.co/ajax/burugusarayugoud@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then((response) => {
        if (!response.ok) throw new Error('Response error');
        return response.json();
      })
      .then(() => {
        formStatus.textContent = '✓ Message sent successfully! I will get back to you soon.';
        formStatus.className = 'form-status success';
        form.reset();
      })
      .catch(() => {
        formStatus.textContent = '❌ Unable to send message right now. Please email directly at burugusarayugoud@gmail.com';
        formStatus.className = 'form-status error';
      })
      .finally(() => {
        btn.disabled = false;
        btn.innerHTML = originalHTML;

        setTimeout(() => {
          formStatus.textContent = '';
          formStatus.className = 'form-status';
        }, 6000);
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // 11. IMAGE FALLBACKS
  // ──────────────────────────────────────────────────────────
  const heroImg = document.getElementById('heroImage');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      heroImg.src = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6366f1"/>
              <stop offset="100%" style="stop-color:#8b5cf6"/>
            </linearGradient>
          </defs>
          <rect width="300" height="300" fill="url(#g)"/>
          <text x="150" y="170" text-anchor="middle" font-family="Inter,sans-serif" font-size="85" font-weight="900" fill="white">SB</text>
        </svg>
      `)}`;
    });
  }

  // GitHub chart fallback
  const ghChart = document.querySelector('.gh-chart');
  if (ghChart) {
    ghChart.addEventListener('error', () => {
      ghChart.style.display = 'none';
      const parent = ghChart.parentElement;
      const fallback = document.createElement('div');
      fallback.style.cssText = 'padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.9rem;';
      fallback.innerHTML = `
        <p style="margin-bottom:0.5rem;">📊 GitHub Contribution Graph</p>
        <a href="https://github.com/SarayuBurugu" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600;">View on GitHub →</a>
      `;
      parent.appendChild(fallback);
    });
  }

  // Inject spin CSS animation dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
  `;
  document.head.appendChild(style);

  // ──────────────────────────────────────────────────────────
  // 12. MULTI-PAGE VIEW SPA ROUTER & CURTAIN WIPING ENGINE
  // ──────────────────────────────────────────────────────────
  const pageFx = document.getElementById('pageFx');
  const pageViews = document.querySelectorAll('.page-view');
  const spaNavLinks = document.querySelectorAll('.nav-link');
  const allPageTriggers = document.querySelectorAll('[data-page]');

  function switchPageView(pageId, triggerCurtain = true) {
    const targetView = document.getElementById(`view-${pageId}`);
    if (!targetView) return;

    if (triggerCurtain && pageFx) {
      pageFx.classList.remove('wiping');
      void pageFx.offsetWidth; // Force reflow
      pageFx.classList.add('wiping');
    }

    const switchDelay = triggerCurtain ? 350 : 0;

    setTimeout(() => {
      // Deactivate all page views
      pageViews.forEach((view) => view.classList.remove('active'));

      // Activate target page view
      targetView.classList.add('active');

      // Update Nav Links active state
      spaNavLinks.forEach((link) => {
        const linkPage = link.getAttribute('data-page');
        link.classList.toggle('active', linkPage === pageId);
      });

      // Reset scroll position to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Close mobile hamburger menu if open
      const hamburger = document.getElementById('hamburger');
      const navLinksEl = document.getElementById('navLinks');
      if (hamburger && navLinksEl) {
        hamburger.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      }

      // Observe elements in active page view for progressive scroll-triggered reveals
      setupScrollReveals(targetView);

      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, `#${pageId}`);
      }
    }, switchDelay);

    if (triggerCurtain && pageFx) {
      setTimeout(() => {
        pageFx.classList.remove('wiping');
      }, 850);
    }
  }

  // Attach click listeners to all elements with [data-page]
  allPageTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const pageId = trigger.getAttribute('data-page');
      if (pageId) {
        e.preventDefault();
        switchPageView(pageId, true);
      }
    });
  });

  // Handle Hash Navigation on Load & History Back/Forward
  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const validPages = ['home', 'about', 'skills', 'experience', 'projects', 'contact'];
    const pageId = validPages.includes(hash) ? hash : 'home';
    switchPageView(pageId, false);
  }

  window.addEventListener('popstate', handleHashNavigation);
  handleHashNavigation();

  // ──────────────────────────────────────────────────────────
  // 13. BACK TO TOP BUTTON WITH SCROLL PROGRESS RING
  // ──────────────────────────────────────────────────────────
  const backToTopBtn = document.getElementById('backToTop');
  const bttFill = document.getElementById('bttFill');
  const circumference = 2 * Math.PI * 20; // r=20

  function updateBackToTop() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

    // Show/hide button
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('visible', scrollTop > 300);
    }

    // Update progress ring
    if (bttFill) {
      const offset = circumference - (scrollPercent * circumference);
      bttFill.style.strokeDashoffset = offset;
    }
  }

  if (backToTopBtn) {
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});

