document.documentElement.classList.add('js');

const menu = document.querySelector('[data-evergreen-menu]');
const navigation = document.querySelector('[data-evergreen-nav]');
const header = document.querySelector('[data-evergreen-header]');

menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation?.classList.toggle('is-open', open);
});
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));

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
const formResult = document.querySelector('[data-form-result]');
const emailDraft = document.querySelector('[data-email-draft]');
let sending = false;

form?.addEventListener('input', () => {
  if (sending) return;
  formResult.hidden = true;
  emailDraft.hidden = true;
  emailDraft.removeAttribute('href');
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const data = new FormData(form);
  formResult.hidden = false;
  emailDraft.hidden = true;

  if (form.dataset.deliveryMode !== 'online') {
    const value = (name) => String(data.get(name) || '').trim();
    const selection = (name) => form.elements.namedItem(name).selectedOptions[0].textContent;
    const body = [
      'Hello Hyperboards,', '', 'I would like to introduce my business.', '',
      `Name: ${value('fullName')}`, `Email: ${value('email')}`, `Phone: ${value('phone') || 'Not provided'}`,
      `Role: ${selection('role')}`, `Company: ${value('company')}`, `Location: ${value('location')}`,
      `Industry: ${selection('industry')}`, `Approximate EBITDA: ${selection('ebitda')}`,
      `Website: ${value('companyWebsite') || 'Not provided'}`, '', value('message'), '',
      'I understand that this introduction does not create an NDA, valuation, offer, or obligation.',
    ].join('\n');
    emailDraft.href = `mailto:hello@hyperboards.com?subject=${encodeURIComponent(`Business introduction: ${value('company')}`)}&body=${encodeURIComponent(body)}`;
    emailDraft.hidden = false;
    formStatus.textContent = 'Your introduction is ready as a draft. It has not been sent. Review and send it from your email app using the button below.';
    formStatus.dataset.state = 'draft';
    formResult.focus({ preventScroll: true });
    return;
  }

  const submit = form.querySelector('button[type="submit"]');
  const label = submit.textContent;
  const controls = [...form.querySelectorAll('input, select, textarea')];
  sending = true;
  submit.disabled = true;
  submit.textContent = 'Sending introduction…';
  form.setAttribute('aria-busy', 'true');
  controls.forEach(control => { control.disabled = true; });
  formStatus.textContent = 'Sending your confidential introduction…';
  formStatus.dataset.state = 'loading';
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new URLSearchParams(data),
      signal: controller.signal,
    });
    const result = await response.json();
    const delivered = response.ok && result.ok === true;
    formStatus.textContent = result.message || 'We could not submit the introduction.';
    formStatus.dataset.state = delivered ? 'success' : 'error';
    if (delivered) form.reset();
  } catch {
    formStatus.textContent = 'We could not confirm delivery. Your details are still here. Please contact hello@hyperboards.com before resending if you are unsure.';
    formStatus.dataset.state = 'error';
  } finally {
    window.clearTimeout(timeout);
    sending = false;
    submit.disabled = false;
    submit.textContent = label;
    controls.forEach(control => { control.disabled = false; });
    form.setAttribute('aria-busy', 'false');
    formResult.focus({ preventScroll: true });
  }
});

const industryButtons = [...document.querySelectorAll('[data-industry]')];
industryButtons.forEach(button => button.addEventListener('click', () => {
  industryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('[data-industry-title]').textContent = button.querySelector('strong').textContent;
  document.querySelector('[data-industry-copy]').textContent = button.dataset.rationale;
}));
