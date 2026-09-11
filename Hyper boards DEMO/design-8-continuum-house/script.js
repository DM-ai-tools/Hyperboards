document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const header = document.querySelector('[data-continuum-header]');
const menu = document.querySelector('[data-continuum-menu]');
const navigation = document.querySelector('[data-continuum-nav]');
const path = document.querySelector('[data-continuum-path]');
const pathNodes = [...document.querySelectorAll('[data-continuum-path-node]')];
const narrativeSections = [...document.querySelectorAll('[data-continuum-section]')];
const lens = document.querySelector('.continuum-lens');
const lensButtons = [...document.querySelectorAll('[data-continuum-lens-button]')];
const lensTitle = document.querySelector('[data-continuum-lens-title]');
const lensCopy = document.querySelector('[data-continuum-lens-copy]');
const lensCount = document.querySelector('[data-continuum-lens-count]');
const sectorButtons = [...document.querySelectorAll('[data-continuum-sector]')];
const sectorCopy = document.querySelector('[data-continuum-sector-copy]');

const closeNavigation = () => {
  menu?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
};

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));

const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 30);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const arrivals = [...document.querySelectorAll('.continuum-arrive')];
arrivals.forEach((element, index) => element.style.setProperty('--continuum-delay', `${Math.min(index % 4, 3) * 60}ms`));
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  arrivals.forEach((element) => element.classList.add('is-present'));
} else {
  const arrivalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-present');
      arrivalObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
  arrivals.forEach((element) => arrivalObserver.observe(element));
}

const activatePathNode = (index) => {
  const boundedIndex = Math.max(0, Math.min(index, pathNodes.length - 1));
  const progress = pathNodes.length > 1 ? boundedIndex / (pathNodes.length - 1) : 1;
  path?.style.setProperty('--continuum-progress', String(progress));
  pathNodes.forEach((node, nodeIndex) => {
    node.classList.toggle('is-active', nodeIndex === boundedIndex);
    node.classList.toggle('is-passed', nodeIndex < boundedIndex);
  });
};

if ('IntersectionObserver' in window && narrativeSections.length) {
  const narrativeObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    if (!active) return;
    activatePathNode(Number(active.target.dataset.continuumSection || 0));
  }, { rootMargin: '-26% 0px -58% 0px', threshold: [0, 0.2, 0.55] });
  narrativeSections.forEach((section) => narrativeObserver.observe(section));
}

const activateLens = (button) => {
  const index = lensButtons.indexOf(button);
  lensButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
  lens?.style.setProperty('--lens-index', String(index));
  if (lensCount) lensCount.textContent = String(index + 1).padStart(2, '0');
  if (lensTitle) lensTitle.textContent = button.dataset.title || '';
  if (lensCopy) lensCopy.textContent = button.dataset.copy || '';
};
lensButtons.forEach((button) => button.addEventListener('click', () => activateLens(button)));

sectorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    sectorButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    if (sectorCopy) sectorCopy.textContent = button.dataset.copy || '';
  });
});

document.querySelectorAll('.continuum-questions details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.continuum-questions details[open]').forEach((candidate) => {
      if (candidate !== detail) candidate.removeAttribute('open');
    });
  });
});

const hero = document.querySelector('.continuum-hero');
const topography = document.querySelector('.continuum-topography');
if (hero && topography && finePointer.matches && !reducedMotion.matches) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    topography.style.setProperty('--continuum-topo-x', `${x.toFixed(2)}px`);
    topography.style.setProperty('--continuum-topo-y', `${y.toFixed(2)}px`);
  });
  hero.addEventListener('pointerleave', () => {
    topography.style.setProperty('--continuum-topo-x', '0px');
    topography.style.setProperty('--continuum-topo-y', '0px');
  });
}

document.querySelectorAll('[data-continuum-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
