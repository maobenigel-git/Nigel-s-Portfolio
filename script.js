/* =========================================
   NIGEL PORTFOLIO — script.js
   Vanilla JS · Scroll effects · Interactions
   ========================================= */

'use strict';

// ---- Utilities ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* =========================================
   1. NAVBAR — hide on scroll down, show on scroll up
   ========================================= */
(function initNavbar() {
  const header = $('#header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;

        // Add scrolled class (black bg) once past hero
        if (currentY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        // Hide on scroll down, show on scroll up
        if (currentY > lastY && currentY > 200) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }

        lastY = currentY <= 0 ? 0 : currentY;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* =========================================
   2. REVEAL ANIMATIONS — Intersection Observer
   ========================================= */
(function initReveal() {
  const elements = $$('.reveal-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* =========================================
   3. PROJECTS — Sticky stacking scroll interaction
   Each card is sticky; they stack as you scroll.
   ========================================= */
(function initProjectStack() {
  const cards = $$('.project-card');
  if (!cards.length) return;

  // Assign scale + vertical offset per card for visual depth
  cards.forEach((card, i) => {
    // Each subsequent card starts slightly lower to create a fanned look
    card.style.setProperty('--card-offset', `${i * 6}px`);
  });

  // Add scroll-driven scale effect on each card
  window.addEventListener(
    'scroll',
    () => {
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Progress: 0 when card enters, 1 when fully scrolled past
        const progress = Math.max(
          0,
          Math.min(1, (windowH - rect.top) / (windowH + rect.height))
        );

        // Slightly shrink earlier cards as later ones appear
        if (i < cards.length - 1) {
          const scale = 1 - progress * 0.03 * (cards.length - 1 - i);
          card.style.transform = `scale(${Math.max(0.94, scale)})`;
        }
      });
    },
    { passive: true }
  );
})();

/* =========================================
   4. SERVICE ITEMS — staggered hover line
   ========================================= */
(function initServiceHover() {
  const items = $$('.service-item');
  items.forEach((item, i) => {
    item.style.setProperty('--delay', `${i * 0.08}s`);
    item.classList.add('reveal-up');
  });
})();

/* =========================================
   5. SMOOTH ANCHOR SCROLL — with header offset
   ========================================= */
(function initSmoothScroll() {
  const navHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
    10
  ) || 72;

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =========================================
   6. CURSOR TRAIL (subtle) — adds a refined
      trailing dot that follows the cursor.
   ========================================= */
(function initCursorTrail() {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 6px; height: 6px;
    background: #000;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.15s ease, opacity 0.3s ease;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
    opacity: 0;
  `;
  document.body.appendChild(cursor);

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 32px; height: 32px;
    border: 1px solid rgba(0,0,0,0.3);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.opacity = '1';
    ring.style.opacity = '1';
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    ring.style.opacity = '0';
  });

  // Lag ring for smooth follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Scale cursor on interactive elements
  const interactives = $$('a, button, .service-item, .project-card');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      ring.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
})();

/* =========================================
   7. PAGE LOAD — initial hero entrance
   ========================================= */
(function initPageLoad() {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.4s ease';

  window.addEventListener('load', () => {
    document.documentElement.style.opacity = '1';

    // Stagger hero elements
    const heroElements = $$('.hero .reveal-up');
    heroElements.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 200 + i * 120);
    });
  });
})();