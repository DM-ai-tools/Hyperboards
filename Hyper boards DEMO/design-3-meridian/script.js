(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-navigation]');
  const closeMenu = (restoreFocus = false) => {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    if (restoreFocus) menu?.focus();
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => closeMenu());
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  // Native details keep sector explanations and FAQs available without scripts.
  const form = document.querySelector('[data-owner-form]');
  if (!form) return;
  const industry = form.elements.namedItem('industry');
  const selection = new URLSearchParams(window.location.search).get('industry');
  if (selection && [...industry.options].some(option => option.value === selection)) industry.value = selection;
  const status = form.querySelector('[data-form-status]');
  if (location.protocol === 'file:') {
    status.dataset.state = 'notice';
    status.textContent = 'Local preview: online delivery needs the Hyperboards server. Use the published website or email hello@hyperboards.com.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type=submit]');
    if (submit.disabled) return;
    if (location.protocol === 'file:') {
      status.dataset.state = 'error';
      status.textContent = 'This local preview cannot send an introduction. Online delivery needs the Hyperboards server. Your entries are preserved; use the published website or email hello@hyperboards.com.';
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.dataset.state = 'loading';
    status.textContent = 'Sending your introduction…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form)),
        signal: controller.signal
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('invalid-response'); }
      if (response.ok && result?.ok === true) {
        status.dataset.state = 'success';
        status.textContent = typeof result.message === 'string' ? result.message : 'Your introduction has been received. Thank you for contacting Hyperboards.';
        form.reset();
      } else {
        status.dataset.state = 'error';
        status.textContent = typeof result?.message === 'string'
          ? `${result.message} Your entries are preserved.`
          : 'Your introduction could not be accepted. Your entries are preserved; please try again later or email hello@hyperboards.com.';
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'AbortError'
        ? 'Delivery could not be confirmed because the request timed out. Your entries are preserved. Please email hello@hyperboards.com before trying again.'
        : 'Delivery could not be confirmed. Your entries are preserved; please email hello@hyperboards.com or try again later.';
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
})();
