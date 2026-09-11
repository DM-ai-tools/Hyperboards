(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('[data-navigation]');
  const closeMenu = (returnFocus = false) => {
    menu?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    if (returnFocus) menu?.focus();
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => closeMenu());
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.remove('will-reveal');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach(node => {
      // Only defer content currently below the viewport; readable if enhancement fails.
      if (node.getBoundingClientRect().top > window.innerHeight) node.classList.add('will-reveal');
      observer.observe(node);
    });
  }

  const stage = document.querySelector('[data-art-stage]');
  const motion = document.querySelector('[data-motion-toggle]');
  let artVisible = false;
  let paused = false;
  const syncMotion = () => stage?.classList.toggle('is-active', artVisible && !document.hidden && !reduced.matches && !paused);
  if (stage && 'IntersectionObserver' in window) {
    const artObserver = new IntersectionObserver(entries => {
      artVisible = entries[0].isIntersecting;
      syncMotion();
    }, { threshold: .1 });
    artObserver.observe(stage);
  }
  motion?.addEventListener('click', () => {
    paused = !paused;
    document.body.classList.toggle('motion-paused', paused);
    motion.setAttribute('aria-pressed', String(paused));
    motion.innerHTML = `<span aria-hidden="true">${paused ? '▷' : 'Ⅱ'}</span>${paused ? 'Resume motion' : 'Pause motion'}`;
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener('change', () => {
    syncMotion();
    if (reduced.matches) document.querySelectorAll('.will-reveal').forEach(node => node.classList.remove('will-reveal'));
  });
  if (stage && window.matchMedia('(hover: hover)').matches) {
    stage.addEventListener('pointermove', event => {
      if (reduced.matches || paused) return;
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - .5) * 13}deg`);
      stage.style.setProperty('--rx', `${((event.clientY - rect.top) / rect.height - .5) * -10}deg`);
    });
    stage.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });
  }

  document.querySelectorAll('[data-sector-explorer]').forEach(explorer => {
    const buttons = [...explorer.querySelectorAll('[data-sector]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      explorer.querySelector('[data-sector-number]').textContent = button.dataset.number;
      explorer.querySelector('[data-sector-title]').textContent = button.dataset.title;
      explorer.querySelector('[data-sector-copy]').textContent = button.dataset.rationale;
      explorer.querySelector('[data-sector-link]').href = `sell-your-business.html?industry=${encodeURIComponent(button.dataset.sector)}`;
    }));
    // Hide the native explanations only after the interactive explorer is ready.
    explorer.querySelector('.sector-fallback')?.setAttribute('hidden', '');
  });

  const form = document.querySelector('[data-owner-form]');
  if (!form) return;
  const selected = new URLSearchParams(window.location.search).get('industry');
  const industry = form.elements.namedItem('industry');
  if (selected && [...industry.options].some(option => option.value === selected)) industry.value = selected;
  const status = form.querySelector('[data-form-status]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('[type=submit]');
    if (submit.disabled) return;
    if (location.protocol === 'file:') {
      status.dataset.state = 'error';
      status.textContent = 'This local preview cannot send an introduction. Please use the published Hyperboards website or email hello@hyperboards.com.';
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.dataset.state = 'loading';
    status.textContent = 'Sending your introduction…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', headers: { Accept: 'application/json' },
        body: new URLSearchParams(new FormData(form)), signal: controller.signal
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('invalid-response'); }
      if (response.ok && result.ok === true) {
        status.dataset.state = 'success';
        status.textContent = result.message || 'Your confidential introduction has been received.';
        form.reset();
      } else {
        status.dataset.state = 'error';
        status.textContent = typeof result.message === 'string' ? result.message : 'The service could not accept your introduction. Please try again or email hello@hyperboards.com.';
      }
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'AbortError'
        ? 'Delivery could not be confirmed because the request timed out. Please email hello@hyperboards.com before trying again.'
        : 'Delivery could not be confirmed. Your entries are preserved; please email hello@hyperboards.com or try again later.';
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
})();
