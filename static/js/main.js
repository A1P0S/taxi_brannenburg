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
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerClose?.focus();
  };
  const closeDrawer = () => {
    drawer?.classList.remove('open');
    drawerOverlay?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
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
        ? 'rgba(20, 20, 20, 0.92)'
        : 'rgba(250, 250, 250, 0.92)',
      top: isDark
        ? 'rgba(20, 20, 20, 0.85)'
        : 'rgba(250, 250, 250, 0.85)'
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
    } else {
      header.style.background = c.top;
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
    q.setAttribute('aria-expanded', 'false');

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings
      item.parentElement?.querySelectorAll('.faq-item.open').forEach((s) => {
        if (s !== item) {
          s.classList.remove('open');
          const sq = s.querySelector('.faq-q');
          const sa = s.querySelector('.faq-a');
          if (sq) sq.setAttribute('aria-expanded', 'false');
          if (sa) sa.style.maxHeight = '0px';
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = '0px';
      } else {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  const formToPayload = (form) => {
    const payload = {};
    new FormData(form).forEach((value, key) => {
      payload[key] = value;
    });
    return payload;
  };

  const setFormSending = (form, isSending) => {
    const submit = form.querySelector('button[type="submit"]');
    if (!submit) return;
    submit.disabled = isSending;
    if (!submit.dataset.originalText) {
      submit.dataset.originalText = submit.textContent;
    }
    submit.textContent = isSending ? 'Wird gesendet...' : submit.dataset.originalText;
  };

  const showFormMessage = (form, type, text = '') => {
    const success = form.querySelector('.form-success');
    const error = form.querySelector('.form-error') || document.createElement('div');

    if (!error.classList.contains('form-error')) {
      error.className = 'form-error';
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');
      success?.insertAdjacentElement('afterend', error);
    }

    const isSuccess = type === 'success';
    const isError = type === 'error' && text;

    if (success) {
      success.setAttribute('role', 'status');
      success.setAttribute('aria-live', 'polite');
      success.classList.toggle('show', isSuccess);
      success.hidden = !isSuccess;
    }

    error.classList.toggle('show', !!isError);
    error.textContent = isError ? text : '';

    if (!isSuccess && !isError) return;

    const target = isSuccess ? success : error;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const bindAjaxForm = (form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setFormSending(form, true);
      showFormMessage(form, 'idle');
      let sent = false;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formToPayload(form))
        });

        if (!response.ok) throw new Error('Request failed');

        form.reset();
        showFormMessage(form, 'success', '');
        sent = true;
        const submit = form.querySelector('button[type="submit"]');
        if (submit) {
          submit.disabled = false;
          submit.textContent = 'Gesendet';
          window.setTimeout(() => {
            submit.textContent = submit.dataset.originalText || 'Senden';
          }, 2200);
        }
      } catch (error) {
        showFormMessage(
          form,
          'error',
          'Die Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns direkt unter 08035 907813 an.'
        );
      } finally {
        if (!sent) {
          setFormSending(form, false);
        }
      }
    });
  };

  // ===== Forms =====
  document.querySelectorAll('#booking-form, #contact-form').forEach(bindAjaxForm);

  // ===== Set min datetime for booking =====
  const datetimeInput = document.querySelector('input[type="datetime-local"]');
  if (datetimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 30);
    datetimeInput.min = now.toISOString().slice(0, 16);
  }

  // ===== Cookie Consent =====
  const banner = document.querySelector('#cookie-banner');
  if (banner && !localStorage.getItem('cookie-consent')) {
    banner.show();
    banner.addEventListener('close', () => {
      localStorage.setItem('cookie-consent', 'accepted');
    });
  }
})();
