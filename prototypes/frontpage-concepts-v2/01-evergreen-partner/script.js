document.documentElement.classList.add('js');

const menu = document.querySelector('[data-evergreen-menu]');
const navigation = document.querySelector('[data-evergreen-nav]');
const header = document.querySelector('[data-evergreen-header]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const closeNavigation = () => {
  if (!menu || !navigation) return;
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
};

menu?.addEventListener('click', () => {
  const nextState = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(nextState));
  navigation?.classList.toggle('is-open', nextState);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));

const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reveals = [...document.querySelectorAll('.evergreen-reveal')];
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  reveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach((element) => observer.observe(element));
}

document.querySelectorAll('[data-evergreen-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
