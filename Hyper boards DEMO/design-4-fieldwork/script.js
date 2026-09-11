(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('[data-menu]');
  const header = document.querySelector('.header');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => {
    header?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  };
  menu?.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!isOpen));
    header.classList.toggle('is-open', !isOpen);
  });
  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  const desktop = matchMedia('(min-width: 801px)');
  desktop.addEventListener('change', closeMenu);
  document.querySelectorAll('[data-year]').forEach(item => item.textContent = new Date().getFullYear());

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 35px 0px' });
    document.querySelectorAll('.reveal').forEach(item => {
      if (item.getBoundingClientRect().top > innerHeight) {
        item.classList.add('will-reveal');
        observer.observe(item);
      }
    });
    reduced.addEventListener('change', event => {
      if (event.matches) {
        document.querySelectorAll('.will-reveal').forEach(item => item.classList.add('is-visible'));
        observer.disconnect();
      }
    });
  }

  const art = document.querySelector('[data-art]');
  const sculpture = art?.querySelector('[data-sculpture]');
  if (art && sculpture && matchMedia('(pointer: fine)').matches) {
    let frame = 0;
    art.addEventListener('pointermove', event => {
      if (reduced.matches || frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = art.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        sculpture.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateY(${-y * 5}px)`;
        frame = 0;
      });
    });
    art.addEventListener('pointerleave', () => sculpture.style.transform = '');
  }

  document.querySelectorAll('[data-owner-form]').forEach(form => {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || submit.disabled) return;
      if (location.protocol === 'file:') {
        status.dataset.state = 'error';
        status.textContent = 'This local preview cannot send inquiries. No information was delivered. Please email hello@hyperboards.com or use the published website.';
        return;
      }
      submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.dataset.state = 'pending';
      status.textContent = 'Sending your introduction…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams(new FormData(form)),
          signal: controller.signal
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok !== true) {
          status.dataset.state = 'error';
          status.textContent = result?.message || 'We could not confirm delivery. Your information is still in the form. Please try again or email hello@hyperboards.com.';
          return;
        }
        status.dataset.state = 'success';
        status.textContent = result.message || 'Your introduction has been received.';
        form.reset();
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = error.name === 'AbortError'
          ? 'The request timed out. Delivery has not been confirmed. Please email hello@hyperboards.com before trying again.'
          : 'We could not confirm delivery. Your information is still in the form. Please try again or email hello@hyperboards.com.';
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
