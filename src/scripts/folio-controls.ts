type FolioOption = HTMLButtonElement & { dataset: DOMStringMap & { value?: string } };

export function initSingleSelect(root: HTMLElement): void {
  const options = [...root.querySelectorAll<FolioOption>('[data-folio-option]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-folio-panel]')];
  if (options.length === 0 || panels.length === 0) return;

  const activate = (value: string, focus = false) => {
    options.forEach((option) => {
      const selected = option.dataset.value === value;
      option.setAttribute('aria-selected', String(selected));
      option.tabIndex = selected ? 0 : -1;
      if (selected && focus) option.focus();
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.value !== value;
    });

    root.dataset.active = value;
    root.dispatchEvent(new CustomEvent('foliochange', { detail: { value } }));
  };

  options.forEach((option, index) => {
    option.addEventListener('click', () => activate(option.dataset.value ?? ''));
    option.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = options.length - 1;
      else return;

      event.preventDefault();
      activate(options[next]?.dataset.value ?? '', true);
    });
  });

  const initial = options.find((option) => option.getAttribute('aria-selected') === 'true') ?? options[0];
  activate(initial?.dataset.value ?? '');
  root.dataset.enhanced = 'true';
}

export function initSectionTracker(root: HTMLElement): void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => Boolean(section));

  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    const active = entries.find((entry) => entry.isIntersecting);
    if (!active) return;
    links.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });

  sections.forEach((section) => observer.observe(section));
}
