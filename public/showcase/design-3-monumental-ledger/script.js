const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = [...document.querySelectorAll('.ledger-reveal')];
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.ledger-progress');

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const updateLedgerChrome = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  header?.classList.toggle('is-compact', window.scrollY > 80);
  if (progress && !CSS.supports('animation-timeline: scroll()')) {
    progress.style.transform = `scaleX(${ratio})`;
  }
};

updateLedgerChrome();
window.addEventListener('scroll', updateLedgerChrome, { passive: true });
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
