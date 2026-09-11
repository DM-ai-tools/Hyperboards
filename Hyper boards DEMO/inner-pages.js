document.documentElement.classList.add('js');

const menu = document.querySelector('[data-evergreen-menu]');
const navigation = document.querySelector('[data-evergreen-nav]');
const header = document.querySelector('[data-evergreen-header]');

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
});

const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

document.querySelectorAll('[data-evergreen-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = [...document.querySelectorAll('.evergreen-reveal')];
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((node) => node.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { threshold: .08, rootMargin: '0px 0px -7% 0px' });
  reveals.forEach((node, index) => {
    node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
    observer.observe(node);
  });
}

const form = document.querySelector('[data-owner-form]');
const formStatus = document.querySelector('[data-form-status]');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  formStatus.textContent = 'Sending your confidential introduction…';
  formStatus.dataset.state = 'loading';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(new FormData(form)),
    });
    const result = await response.json();
    formStatus.textContent = result.message || 'We could not submit the introduction.';
    formStatus.dataset.state = response.ok ? 'success' : 'error';
    if (response.ok) form.reset();
  } catch {
    formStatus.textContent = 'Online submission is unavailable. Please email hello@hyperboards.com.';
    formStatus.dataset.state = 'error';
  } finally {
    submit.disabled = false;
  }
});
