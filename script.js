/* ==========================================================================
   THE DERIVATIVE DIRECTORY — SCRIPT
   Sections:
     1. Theme toggle (dark / light, persisted)
     2. Sticky header + mobile navigation
     3. Smooth anchor navigation
     4. Scroll-reveal animations (Intersection Observer + stagger)
     5. Animated stat counters
     6. FAQ accordion
     7. Model library filtering
     8. Button ripple effect
     9. Copy email to clipboard
     10. Contact form handling
     11. Footer year
     12. Background graph-paper canvas
     13. Hero signature derivative graph animation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * 1. THEME TOGGLE
   * ------------------------------------------------------------------ */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const THEME_KEY = 'derivative-directory-theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      root.removeAttribute('data-theme');
      themeToggle.setAttribute('aria-pressed', 'false');
    }
  }

  // Initial theme: stored preference, else system preference, else dark.
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    applyTheme(stored);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });


  /* ------------------------------------------------------------------ *
   * 2. STICKY HEADER + MOBILE NAVIGATION
   * ------------------------------------------------------------------ */
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeMobileMenu() {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close mobile menu after choosing a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });


  /* ------------------------------------------------------------------ *
   * 3. SMOOTH ANCHOR NAVIGATION
   * (CSS handles the actual smooth scroll via `scroll-behavior: smooth`;
   * this keeps focus management sensible for keyboard/screen-reader users.)
   * ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      // Allow the element to receive focus for accessibility without
      // forcing a visible outline jump on click.
      target.setAttribute('tabindex', '-1');
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });


  /* ------------------------------------------------------------------ *
   * 4. SCROLL-REVEAL ANIMATIONS
   * Elements with [data-reveal] fade/slide in once visible. Siblings
   * inside the same parent get a small staggered delay.
   * ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    // Apply a staggered delay based on position among siblings revealing together.
    const groups = new Map();
    revealEls.forEach(el => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      const index = groups.get(parent);
      el.style.setProperty('--reveal-delay', `${Math.min(index * 80, 480)}ms`);
      groups.set(parent, index + 1);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }


  /* ------------------------------------------------------------------ *
   * 5. ANIMATED STAT COUNTERS
   * ------------------------------------------------------------------ */
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out for a satisfying "settle" at the end.
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    if (prefersReducedMotion) {
      el.textContent = target;
    } else {
      requestAnimationFrame(tick);
    }
  }

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));


  /* ------------------------------------------------------------------ *
   * 6. FAQ ACCORDION
   * ------------------------------------------------------------------ */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close any other open items (single-open accordion behaviour).
      document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(otherQ => {
        if (otherQ !== question) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherQ.nextElementSibling.style.maxHeight = null;
        }
      });

      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
    });
  });


  /* ------------------------------------------------------------------ *
   * 7. MODEL LIBRARY FILTERING
   * ------------------------------------------------------------------ */
  const filterPills = document.querySelectorAll('.filter-pill');
  const modelCards = document.querySelectorAll('.model-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const filter = pill.dataset.filter;
      modelCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });


  /* ------------------------------------------------------------------ *
   * 8. BUTTON RIPPLE EFFECT
   * ------------------------------------------------------------------ */
  document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });


  /* ------------------------------------------------------------------ *
   * 9. COPY EMAIL TO CLIPBOARD
   * ------------------------------------------------------------------ */
  const copyBtn = document.getElementById('copy-email');
  const copyConfirm = document.getElementById('copy-confirm');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = 'x85247540@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
      } catch (err) {
        // Clipboard API unavailable — fall back silently, message still shows.
      }
      copyConfirm.classList.add('is-visible');
      setTimeout(() => copyConfirm.classList.remove('is-visible'), 1800);
    });
  }


  /* ------------------------------------------------------------------ *
   * 10. CONTACT FORM
   * No backend is wired up — this validates input, gives the visitor
   * feedback, and opens their email client with a pre-filled message.
   * ------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        formStatus.textContent = 'Please fill in all required fields.';
        return;
      }

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const role = contactForm.role.value;
      const message = contactForm.message.value.trim();

      const subject = encodeURIComponent(`Message from ${name} (${role})`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      const mailto = `mailto:x85247540@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailto;
      formStatus.textContent = 'Opening your email client to send this message…';
    });
  }


  /* ------------------------------------------------------------------ *
   * 11. FOOTER YEAR
   * ------------------------------------------------------------------ */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();


  /* ------------------------------------------------------------------ *
   * 12. BACKGROUND GRAPH-PAPER CANVAS
   * A faint, fixed grid that subtly drifts with the page scroll —
   * evokes graph paper / a coordinate plane without being literal.
   * ------------------------------------------------------------------ */
  const bgCanvas = document.getElementById('bg-grid');
  const bgCtx = bgCanvas.getContext('2d');
  let bgOffset = 0;

  function resizeBgCanvas() {
    bgCanvas.width = window.innerWidth * window.devicePixelRatio;
    bgCanvas.height = window.innerHeight * window.devicePixelRatio;
    drawBgGrid();
  }

  function drawBgGrid() {
    const dpr = window.devicePixelRatio;
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    const spacing = 56 * dpr;

    bgCtx.clearRect(0, 0, w, h);

    const isLight = root.getAttribute('data-theme') === 'light';
    bgCtx.strokeStyle = isLight ? 'rgba(10,14,26,0.045)' : 'rgba(255,255,255,0.045)';
    bgCtx.lineWidth = 1;

    const offset = bgOffset % spacing;

    bgCtx.beginPath();
    for (let x = -spacing; x < w + spacing; x += spacing) {
      const px = x + offset;
      bgCtx.moveTo(px, 0);
      bgCtx.lineTo(px, h);
    }
    for (let y = -spacing; y < h + spacing; y += spacing) {
      const py = y + offset * 0.4;
      bgCtx.moveTo(0, py);
      bgCtx.lineTo(w, py);
    }
    bgCtx.stroke();
  }

  resizeBgCanvas();
  window.addEventListener('resize', resizeBgCanvas);

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      bgOffset = window.scrollY * 0.06;
      drawBgGrid();
    }, { passive: true });
  }

  // Redraw grid whenever the theme changes (line colour depends on theme).
  themeToggle.addEventListener('click', () => setTimeout(drawBgGrid, 50));


  /* ------------------------------------------------------------------ *
   * 13. HERO SIGNATURE GRAPH — live derivative visualization
   * Draws f(x) = sin(x) + 0.18x, animates a point moving along the curve,
   * and renders the tangent line at that point with its slope value
   * (the derivative) displayed live in the readout above the canvas.
   * ------------------------------------------------------------------ */
  const canvas = document.getElementById('derivative-canvas');
  const readout = document.getElementById('derivative-readout');

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let animating = !prefersReducedMotion;
    let t = 0; // parametric time, drives x position

    // Resize canvas for crisp rendering on high-DPI screens.
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render(); // redraw immediately at new size
    }

    // The function being visualized.
    const f = (x) => Math.sin(x) + 0.18 * x;
    const fPrime = (x) => Math.cos(x) + 0.18; // exact derivative

    // Domain shown on the graph.
    const xMin = -6.4;
    const xMax = 6.4;

    function toScreen(x, y, w, h) {
      const yMin = -3.2, yMax = 3.2;
      const sx = ((x - xMin) / (xMax - xMin)) * w;
      const sy = h - ((y - yMin) / (yMax - yMin)) * h;
      return [sx, sy];
    }

    function render() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const isLight = root.getAttribute('data-theme') === 'light';

      ctx.clearRect(0, 0, w, h);

      // --- grid ---
      ctx.strokeStyle = isLight ? 'rgba(10,14,26,0.07)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      const step = w / 13;
      ctx.beginPath();
      for (let gx = 0; gx <= w; gx += step) {
        ctx.moveTo(gx, 0); ctx.lineTo(gx, h);
      }
      for (let gy = 0; gy <= h; gy += step) {
        ctx.moveTo(0, gy); ctx.lineTo(w, gy);
      }
      ctx.stroke();

      // --- axes ---
      ctx.strokeStyle = isLight ? 'rgba(10,14,26,0.18)' : 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1.4;
      const [originX, originY] = toScreen(0, 0, w, h);
      ctx.beginPath();
      ctx.moveTo(0, originY); ctx.lineTo(w, originY);
      ctx.moveTo(originX, 0); ctx.lineTo(originX, h);
      ctx.stroke();

      // --- curve f(x) ---
      ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--accent-blue').trim();
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const samples = 200;
      for (let i = 0; i <= samples; i++) {
        const x = xMin + (xMax - xMin) * (i / samples);
        const y = f(x);
        const [sx, sy] = toScreen(x, y, w, h);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // --- moving point + tangent line ---
      const x0 = Math.sin(t) * (xMax - 0.6); // ping-pong across the domain
      const y0 = f(x0);
      const slope = fPrime(x0);

      // Tangent line spans a fixed visual length around the point.
      const dx = 1.6;
      const tx1 = x0 - dx, ty1 = y0 - slope * dx;
      const tx2 = x0 + dx, ty2 = y0 + slope * dx;
      const [p1x, p1y] = toScreen(tx1, ty1, w, h);
      const [p2x, p2y] = toScreen(tx2, ty2, w, h);

      ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--accent-amber').trim();
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();

      // The point itself.
      const [px, py] = toScreen(x0, y0, w, h);
      ctx.fillStyle = getComputedStyle(root).getPropertyValue('--accent-amber').trim();
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isLight ? '#ffffff' : '#0a0e1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.stroke();

      // --- live readout ---
      readout.textContent = `f\u2032(x) \u2248 ${slope.toFixed(2)}`;
    }

    function animate() {
      if (animating) {
        t += 0.012;
        render();
      }
      requestAnimationFrame(animate);
    }

    // Allow visitors to pause/resume the animation by clicking the canvas.
    canvas.addEventListener('click', () => {
      animating = !animating;
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    themeToggle.addEventListener('click', () => setTimeout(render, 50));
    requestAnimationFrame(animate);
  }

});
