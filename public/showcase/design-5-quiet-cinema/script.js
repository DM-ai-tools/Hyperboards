const cinemaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cinemaReveals = [...document.querySelectorAll('.cinema-reveal')];

if (cinemaMotion.matches || !('IntersectionObserver' in window)) {
  cinemaReveals.forEach((element) => element.classList.add('is-visible'));
} else {
  const cinemaObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  cinemaReveals.forEach((element) => cinemaObserver.observe(element));
}

const sceneButtons = [...document.querySelectorAll('[data-scene-target]')];
const scenes = [...document.querySelectorAll('[data-scene]')];

const showScene = (name) => {
  sceneButtons.forEach((button) => {
    const current = button.dataset.sceneTarget === name;
    button.classList.toggle('is-current', current);
    button.setAttribute('aria-pressed', String(current));
  });
  scenes.forEach((scene) => {
    const current = scene.dataset.scene === name;
    scene.hidden = !current;
    scene.classList.toggle('is-current', current);
  });
};

sceneButtons.forEach((button) => button.addEventListener('click', () => showScene(button.dataset.sceneTarget)));
document.querySelectorAll('[data-cinema-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });

if (!cinemaMotion.matches) {
  const aperture = document.querySelector('.aperture');
  aperture?.addEventListener('pointermove', (event) => {
    const bounds = aperture.getBoundingClientRect();
    aperture.style.setProperty('--light-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    aperture.style.setProperty('--light-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  });
}
