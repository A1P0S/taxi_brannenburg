/* ============================================
   TAXI BRANNENBURG — main.js
   Navigation, Animations, FAQ, Form
   ============================================ */

(() => {
  'use strict';

  // ===== Mobile Drawer =====
  const menuToggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const drawerClose = document.querySelector('.drawer-close');

  const openDrawer = () => {
    drawer?.classList.add('open');
    drawerOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerOverlay?.addEventListener('click', closeDrawer);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // ===== Header on scroll =====
  const header = document.querySelector('.site-header');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const getHeaderColors = () => {
    const isDark = darkQuery.matches;
    return {
      scrolled: isDark
        ? 'rgba(10, 10, 10, 0.94)'
        : 'rgba(255, 255, 255, 0.92)',
      top: isDark
        ? 'rgba(10, 10, 10, 0.72)'
        : 'rgba(255, 255, 255, 0.72)',
      borderScrolled: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.08)',
      borderTop: isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(0, 0, 0, 0.06)'
    };
  };

  // ===== Parallax hero logo =====
  const logo = document.querySelector('.hero-logo');
  let ticking = false;

  const updateParallax = () => {
    if (!logo) return;
    const scrollY = window.scrollY;
    const speed = 0.35;
    logo.style.backgroundPositionY = `calc(55% + ${scrollY * speed}px)`;
    ticking = false;
  };

  const onScroll = () => {
    if (!header) return;
    const c = getHeaderColors();
    if (window.scrollY > 8) {
      header.style.background = c.scrolled;
      header.style.borderBottomColor = c.borderScrolled;
    } else {
      header.style.background = c.top;
      header.style.borderBottomColor = c.borderTop;
    }
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  darkQuery.addEventListener('change', onScroll);
  onScroll();

  // ===== Scroll-triggered fade-ins =====
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .stagger').forEach((el) => observer.observe(el));

  // ===== FAQ Accordion =====
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings
      item.parentElement?.querySelectorAll('.faq-item.open').forEach((s) => {
        if (s !== item) {
          s.classList.remove('open');
          const sa = s.querySelector('.faq-a');
          if (sa) sa.style.maxHeight = '0px';
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = '0px';
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // ===== Booking Form =====
  const bookingForm = document.querySelector('#booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(bookingForm);
      const payload = {};
      data.forEach((v, k) => { payload[k] = v; });

      const success = bookingForm.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      bookingForm.reset();

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    });
  }

  // ===== Contact Form =====
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(contactForm);
      const payload = {};
      data.forEach((v, k) => { payload[k] = v; });

      const success = contactForm.querySelector('.form-success');
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      contactForm.reset();

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    });
  }

  // ===== Set min datetime for booking =====
  const datetimeInput = document.querySelector('input[type="datetime-local"]');
  if (datetimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 30);
    datetimeInput.min = now.toISOString().slice(0, 16);
  }
})();
