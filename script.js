const revealItems = [...document.querySelectorAll('.reveal')];
revealItems.forEach((item, index) => item.style.setProperty('--delay', `${Math.min(index % 5, 4) * 70}ms`));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !expanded);
});
navLinks.forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}));

document.querySelectorAll('.disclosure').forEach((button) => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  button.setAttribute('aria-label', expanded ? 'Show details' : 'Hide details');
  button.closest('.timeline-item').classList.toggle('open', !expanded);
}));

const dialog = document.querySelector('.terminal-dialog');
document.querySelector('.easter-egg').addEventListener('click', () => dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
dialog.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => dialog.close()));
document.querySelector('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.querySelector('#year').textContent = new Date().getFullYear();

// Skill chips can spotlight where a technology appears in the featured work.
const interactionStatus = document.querySelector('.interaction-status') || (() => {
  const status = document.createElement('span');
  status.className = 'sr-only interaction-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  document.body.append(status);
  return status;
})();
const skillAliases = {
  'computer vision': ['opencv', 'fer', 'mtcnn'],
  'data science': ['numpy'],
  'python': ['python', 'flask'],
  'c++': ['esp32'],
  'c': ['esp32'],
  'arduino': ['esp32'],
  'sensors': ['esp32'],
  'servo control': ['esp32'],
  'rfid': ['rfid'],
  'javascript': ['react'],
  'html / css': ['react']
};
const skillChips = [...document.querySelectorAll('.tool-list span')];
skillChips.forEach((chip) => {
  chip.setAttribute('role', 'button');
  chip.setAttribute('tabindex', '0');
  chip.setAttribute('aria-pressed', 'false');
  const activate = () => {
    const wasSelected = chip.getAttribute('aria-pressed') === 'true';
    skillChips.forEach((other) => other.setAttribute('aria-pressed', 'false'));
    document.querySelectorAll('.project-tags span').forEach((tag) => tag.classList.remove('is-match'));
    if (wasSelected) {
      interactionStatus.textContent = 'Technology highlight cleared.';
      return;
    }
    chip.setAttribute('aria-pressed', 'true');
    const key = chip.textContent.trim().toLowerCase();
    const terms = skillAliases[key] || [key];
    let matches = 0;
    document.querySelectorAll('.project-tags span').forEach((tag) => {
      if (terms.some((term) => tag.textContent.toLowerCase().includes(term))) {
        tag.classList.add('is-match');
        matches++;
      }
    });
    interactionStatus.textContent = matches
      ? `${chip.textContent.trim()} highlighted in ${matches} project technology tags.`
      : `No featured project technology tag matches ${chip.textContent.trim()}.`;
  };
  chip.addEventListener('click', activate);
  chip.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
  });
});

// The project diagrams double as small, keyboard-accessible system walkthroughs.
document.querySelectorAll('.project-visual').forEach((visual) => {
  visual.setAttribute('role', 'button');
  visual.setAttribute('tabindex', '0');
  const isGymGuard = visual.classList.contains('gym-visual');
  const steps = isGymGuard
    ? ['RFID identification', 'ESP32 connection', 'Server membership validation']
    : ['OpenCV frame capture', 'Face and expression analysis', 'Dashboard feedback'];
  const stepNodes = isGymGuard
    ? [...visual.querySelectorAll('.system-block')]
    : [...visual.querySelectorAll('.emotion-bars > span')];
  let step = 0;
  const advance = () => {
    step = (step + 1) % steps.length;
    stepNodes.forEach((node, index) => node.classList.toggle('is-active-step', index === step));
    visual.setAttribute('aria-label', `${isGymGuard ? 'GymGuard' : 'PRO-BOT'} walkthrough: ${steps[step]}. Activate to continue.`);
    interactionStatus.textContent = `${isGymGuard ? 'GymGuard' : 'PRO-BOT'} walkthrough: ${steps[step]}.`;
  };
  visual.setAttribute('aria-label', `${isGymGuard ? 'GymGuard' : 'PRO-BOT'} interactive diagram. Activate to step through the system.`);
  visual.addEventListener('click', advance);
  visual.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); advance(); }
  });
  visual.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = visual.getBoundingClientRect();
    visual.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    visual.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  });
  visual.addEventListener('pointerleave', () => {
    visual.style.removeProperty('--pointer-x');
    visual.style.removeProperty('--pointer-y');
  });
});

// Open the existing Easter egg with ? when focus is not in a text field.
document.addEventListener('keydown', (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (event.key === '?' && !typing && !dialog.open) dialog.showModal();
});
