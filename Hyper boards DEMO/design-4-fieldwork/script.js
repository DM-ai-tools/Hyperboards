(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const header = document.querySelector('.header');
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => {
    header?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    header.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!header?.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04 });
    document.querySelectorAll('.section-head, .relationship, .principles').forEach(node => {
      if (node.getBoundingClientRect().top > innerHeight) {
        node.classList.add('reveal-pending');
        observer.observe(node);
      }
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        document.querySelectorAll('.reveal-pending').forEach(node => node.classList.add('reveal-visible'));
        observer.disconnect();
      }
    });
  }
  document.querySelectorAll('[data-owner-form]').forEach(form => {
    const status = form.querySelector('[data-form-status]');
    const submit = form.querySelector('[type="submit"]');
    if (location.protocol === 'file:') status.textContent = 'This local preview cannot deliver inquiries. Online delivery requires the website server. You can also email hello@hyperboards.com.';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity() || submit.disabled) return;
      if (location.protocol === 'file:') {
        status.dataset.state = 'error';
        status.textContent = 'No information was delivered. This local preview needs the website server to send an inquiry. Use the published website or email hello@hyperboards.com.';
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
          headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: new URLSearchParams(new FormData(form)),
          signal: controller.signal
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok !== true) {
          const message = typeof result?.message === 'string' ? result.message.trim() : '';
          status.dataset.state = 'error';
          status.textContent = message || 'We could not confirm delivery. Your information is still in the form. Please try again or email hello@hyperboards.com.';
          return;
        }
        status.dataset.state = 'success';
        status.textContent = 'Your introduction has been received. Thank you for sharing the broad outline of your business.';
        form.reset();
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = error.name === 'AbortError'
          ? 'The request timed out. Delivery has not been confirmed, and your information is still in the form. Please email hello@hyperboards.com before trying again.'
          : 'We could not confirm delivery. Your information is still in the form. Please try again or email hello@hyperboards.com.';
      } finally {
        clearTimeout(timeout);
        submit.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
