const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const atlasReveals = [...document.querySelectorAll('.atlas-reveal')];
const routePath = document.querySelector('[data-route-path]');

if (motionPreference.matches || !('IntersectionObserver' in window)) {
  atlasReveals.forEach((element) => element.classList.add('is-visible'));
  routePath?.classList.add('is-plotted');
} else {
  const atlasObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.closest('.atlas-route')) routePath?.classList.add('is-plotted');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  atlasReveals.forEach((element) => atlasObserver.observe(element));
}

const sectorButtons = [...document.querySelectorAll('[data-bearing]')];
const sectorName = document.querySelector('[data-sector-name]');
const sectorDetail = document.querySelector('[data-sector-detail]');
const compassNeedle = document.querySelector('.sector-compass__needle');

const selectSector = (button) => {
  sectorButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  if (sectorName) sectorName.textContent = button.childNodes[button.childNodes.length - 1].textContent.trim();
  if (sectorDetail) sectorDetail.textContent = button.dataset.detail;
  if (compassNeedle) compassNeedle.style.transform = `rotate(${button.dataset.bearing}deg)`;
};

sectorButtons.forEach((button) => button.addEventListener('click', () => selectSector(button)));
document.querySelectorAll('[data-atlas-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

if (!motionPreference.matches) {
  const instrument = document.querySelector('.atlas-hero__instrument');
  instrument?.addEventListener('pointermove', (event) => {
    const bounds = instrument.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
    instrument.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
  instrument?.addEventListener('pointerleave', () => { instrument.style.transform = ''; });
}
