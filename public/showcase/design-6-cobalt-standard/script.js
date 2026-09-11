document.documentElement.classList.add('js');

const menu = document.querySelector('[data-cobalt-menu]');
const navigation = document.querySelector('[data-cobalt-nav]');
const header = document.querySelector('[data-cobalt-header]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const dismissMenu = () => {
  if (!menu || !navigation) return;
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
};

menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  navigation?.classList.toggle('is-open', expanded);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', dismissMenu));

const setHeaderState = () => header?.classList.toggle('is-raised', window.scrollY > 20);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const elements = [...document.querySelectorAll('.cobalt-rise')];
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  elements.forEach((element) => element.classList.add('is-ready'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-ready');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
  elements.forEach((element) => observer.observe(element));
}

document.querySelectorAll('[data-cobalt-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
