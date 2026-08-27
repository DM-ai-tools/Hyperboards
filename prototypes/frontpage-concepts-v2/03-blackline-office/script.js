document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const header = document.querySelector('[data-blackline-header]');
const menu = document.querySelector('[data-blackline-menu]');
const navigation = document.querySelector('[data-blackline-nav]');
const indexLinks = [...document.querySelectorAll('[data-blackline-index-link]')];
const sections = indexLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const mandateTabs = [...document.querySelectorAll('[data-blackline-mandate-tab]')];
const mandatePanel = document.querySelector('[data-blackline-mandate-panel]');
const mandateTitle = document.querySelector('[data-blackline-mandate-title]');
const mandateCopy = document.querySelector('[data-blackline-mandate-copy]');
const sectorButtons = [...document.querySelectorAll('[data-blackline-sector]')];
const sectorCopy = document.querySelector('[data-blackline-sector-copy]');

const closeMenu = () => {
  menu?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
};

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 28);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const riseElements = [...document.querySelectorAll('.blackline-rise')];
riseElements.forEach((element, index) => element.style.setProperty('--blackline-delay', `${Math.min(index % 4, 3) * 55}ms`));
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  riseElements.forEach((element) => element.classList.add('is-ready'));
} else {
  const riseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-ready');
      riseObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
  riseElements.forEach((element) => riseObserver.observe(element));
}

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    if (!active) return;
    indexLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${active.target.id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.55] });
  sections.forEach((section) => sectionObserver.observe(section));
}

const activateMandate = (tab, focusPanel = false) => {
  const index = mandateTabs.indexOf(tab);
  mandateTabs.forEach((candidate) => {
    const active = candidate === tab;
    candidate.setAttribute('aria-selected', String(active));
    candidate.tabIndex = active ? 0 : -1;
  });
  if (mandatePanel) {
    mandatePanel.setAttribute('aria-labelledby', tab.id);
    const counter = mandatePanel.querySelector('span');
    if (counter) counter.textContent = `Current view / ${String(index + 1).padStart(2, '0')}`;
  }
  if (mandateTitle) mandateTitle.textContent = tab.dataset.title || '';
  if (mandateCopy) mandateCopy.textContent = tab.dataset.copy || '';
  if (focusPanel) mandatePanel?.focus({ preventScroll: true });
};

mandateTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateMandate(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = mandateTabs.indexOf(tab);
    let next = current;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = mandateTabs.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % mandateTabs.length;
    else next = (current - 1 + mandateTabs.length) % mandateTabs.length;
    mandateTabs[next].focus();
    activateMandate(mandateTabs[next]);
  });
});
const initiallySelectedMandate = mandateTabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
if (initiallySelectedMandate) activateMandate(initiallySelectedMandate);

sectorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    sectorButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    if (sectorCopy) sectorCopy.textContent = button.dataset.copy || '';
  });
});

document.querySelectorAll('.blackline-questions details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.blackline-questions details[open]').forEach((candidate) => {
      if (candidate !== detail) candidate.removeAttribute('open');
    });
  });
});

const mandateDesk = document.querySelector('.blackline-mandate__desk');
if (mandateDesk && mandatePanel && finePointer.matches && !reducedMotion.matches) {
  mandateDesk.addEventListener('pointermove', (event) => {
    const bounds = mandateDesk.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 6;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 6;
    mandatePanel.style.setProperty('--blackline-shift-x', `${x.toFixed(2)}px`);
    mandatePanel.style.setProperty('--blackline-shift-y', `${y.toFixed(2)}px`);
  });
  mandateDesk.addEventListener('pointerleave', () => {
    mandatePanel.style.setProperty('--blackline-shift-x', '0px');
    mandatePanel.style.setProperty('--blackline-shift-y', '0px');
  });
}

document.querySelectorAll('[data-blackline-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});
