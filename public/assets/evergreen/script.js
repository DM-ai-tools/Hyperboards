document.documentElement.classList.add('js');

const menu = document.querySelector('[data-evergreen-menu]');
const navigation = document.querySelector('[data-evergreen-nav]');
const header = document.querySelector('[data-evergreen-header]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sectorButtons = [...document.querySelectorAll('[data-evergreen-sector]')];
const sectorCopy = document.querySelector('[data-evergreen-sector-copy]');
const processLine = document.querySelector('[data-evergreen-process-line]');
const processSteps = [...document.querySelectorAll('[data-evergreen-process-step]')];

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
reveals.forEach((element, index) => {
  element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
});
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

sectorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    sectorButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    if (sectorCopy) sectorCopy.textContent = button.dataset.rationale || '';
  });
});

if (processLine && processSteps.length && 'IntersectionObserver' in window) {
  const processNodes = [...processLine.querySelectorAll('i')];
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = processSteps.indexOf(entry.target);
      const progress = processSteps.length === 1 ? 1 : index / (processSteps.length - 1);
      processLine.style.setProperty('--process-progress', String(progress));
      processNodes.forEach((node, nodeIndex) => node.classList.toggle('is-passed', nodeIndex <= index));
    });
  }, { rootMargin: '-20% 0px -45% 0px', threshold: 0.45 });
  processSteps.forEach((step) => processObserver.observe(step));
}

document.querySelectorAll('[data-evergreen-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
