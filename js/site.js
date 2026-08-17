(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const header = qs('[data-header]');
  const menuToggle = qs('[data-menu-toggle]');
  const mobileNav = qs('[data-mobile-nav]');
  const backdrop = qs('[data-backdrop]');
  const briefPanel = qs('[data-brief-panel]');
  const resultModal = qs('[data-result-modal]');
  const form = qs('[data-project-form]');
  let lastFocus = null;

  const setHeader = () => header.classList.toggle('scrolled', scrollY > 24);
  setHeader();
  addEventListener('scroll', setHeader, { passive: true });

  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileNav.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  qsa('a', mobileNav).forEach(link => link.addEventListener('click', closeMenu));

  const showBackdrop = () => {
    document.body.classList.add('ui-open');
    if (hasGsap && !reduceMotion) gsap.to(backdrop, { autoAlpha: 1, duration: .35 });
    else { backdrop.style.opacity = '1'; backdrop.style.visibility = 'visible'; }
  };
  const hideBackdrop = () => {
    document.body.classList.remove('ui-open');
    if (hasGsap && !reduceMotion) gsap.to(backdrop, { autoAlpha: 0, duration: .25 });
    else { backdrop.style.opacity = '0'; backdrop.style.visibility = 'hidden'; }
  };
  const openBrief = trigger => {
    lastFocus = trigger;
    showBackdrop();
    briefPanel.setAttribute('aria-hidden', 'false');
    if (hasGsap && !reduceMotion) {
      gsap.set(briefPanel, { autoAlpha: 1 });
      gsap.to(briefPanel, { x: 0, duration: .7, ease: 'power4.out' });
      gsap.fromTo(qsa('.brief-panel > *:not(.panel-close)'), { x: 35, opacity: 0 }, { x: 0, opacity: 1, stagger: .055, delay: .2, duration: .55, ease: 'power3.out' });
    } else { briefPanel.style.visibility = 'visible'; briefPanel.style.transform = 'none'; }
    qs('[data-brief-close]').focus();
  };
  const closeBrief = (restore = true) => {
    briefPanel.setAttribute('aria-hidden', 'true');
    hideBackdrop();
    if (hasGsap && !reduceMotion) gsap.to(briefPanel, { x: '105%', duration: .5, ease: 'power3.in', onComplete: () => gsap.set(briefPanel, { autoAlpha: 0 }) });
    else { briefPanel.style.visibility = 'hidden'; briefPanel.style.transform = 'translateX(105%)'; }
    if (restore && lastFocus) lastFocus.focus();
  };
  qsa('[data-brief-open]').forEach(trigger => trigger.addEventListener('click', event => { event.preventDefault(); openBrief(trigger); }));
  qs('[data-brief-close]').addEventListener('click', () => closeBrief());
  qsa('[data-service]').forEach(option => option.addEventListener('click', () => {
    const service = option.dataset.service;
    const input = qs(`input[value="${service}"]`, form);
    if (input) input.checked = true;
    closeBrief(false);
    setTimeout(() => { qs('#contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); setTimeout(() => qs('input[name="name"]', form).focus(), 650); }, 280);
  }));

  const showResult = success => {
    resultModal.classList.toggle('error', !success);
    qs('[data-result-icon]').textContent = success ? '✓' : '!';
    qs('[data-result-kicker]').textContent = success ? 'MESSAGE RECEIVED' : 'MESSAGE NOT SENT';
    qs('[data-result-title]').textContent = success ? 'That’s the first step done.' : 'We hit a small snag.';
    qs('[data-result-copy]').textContent = success ? 'Thanks for reaching out. We’ll review your project and come back to you within one business day.' : 'Your message could not be sent just now. Please try again, email us directly, or start a WhatsApp chat.';
    showBackdrop();
    resultModal.setAttribute('aria-hidden', 'false');
    if (hasGsap && !reduceMotion) gsap.to(resultModal, { autoAlpha: 1, yPercent: -5, scale: 1, duration: .55, ease: 'back.out(1.45)' });
    else { resultModal.style.opacity = '1'; resultModal.style.visibility = 'visible'; resultModal.style.transform = 'translate(-50%,-50%)'; }
    qs('[data-modal-close]', resultModal).focus();
  };
  const closeResult = () => {
    resultModal.setAttribute('aria-hidden', 'true');
    hideBackdrop();
    if (hasGsap && !reduceMotion) gsap.to(resultModal, { autoAlpha: 0, yPercent: 0, scale: .94, duration: .3 });
    else { resultModal.style.opacity = '0'; resultModal.style.visibility = 'hidden'; }
  };
  qsa('[data-modal-close]').forEach(button => button.addEventListener('click', closeResult));
  backdrop.addEventListener('click', () => resultModal.getAttribute('aria-hidden') === 'false' ? closeResult() : closeBrief());
  addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (resultModal.getAttribute('aria-hidden') === 'false') closeResult();
    else if (briefPanel.getAttribute('aria-hidden') === 'false') closeBrief();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = qs('.submit-button', form);
    const note = qs('[data-form-note]', form);
    button.disabled = true;
    button.classList.add('loading');
    note.textContent = 'Sending your project brief securely…';
    note.classList.remove('error');
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      note.textContent = 'No sales pitch. Just a useful first conversation.';
      showResult(true);
    } catch (error) {
      note.textContent = 'Could not send. Please try again or use WhatsApp.';
      note.classList.add('error');
      showResult(false);
    } finally {
      button.disabled = false;
      button.classList.remove('loading');
    }
  });

  const launchExperience = () => {
    const loader = qs('[data-loader]');
    const count = { value: 0 };
    if (hasGsap && !reduceMotion) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.set('.hero-copy,.hero-visual', { opacity: 1, y: 0 });
      gsap.to(count, { value: 100, duration: 1.15, ease: 'power2.inOut', onUpdate: () => qs('[data-loader-count]').textContent = String(Math.round(count.value)).padStart(2, '0') });
      const intro = gsap.timeline({ delay: 1.05 });
      intro.to('.loader-mark,.loader-copy,.loader-count', { opacity: 0, y: -14, duration: .3, stagger: .04 })
        .to(loader, { yPercent: -100, duration: .8, ease: 'power4.inOut' })
        .set(loader, { display: 'none' })
        .from('.site-header', { y: -90, duration: .7, ease: 'power3.out' }, '-=.3')
        .from('.hero .eyebrow', { opacity: 0, y: 18, duration: .5 }, '-=.4')
        .from('.hero h1', { opacity: 0, y: 55, duration: .9, ease: 'power4.out' }, '-=.3')
        .from('.hero-lede,.hero-actions,.hero-proof', { opacity: 0, y: 25, stagger: .1, duration: .65 }, '-=.55')
        .from('.hero-visual', { opacity: 0, x: 45, rotate: 2, duration: 1, ease: 'power4.out' }, '-=.85');
      qsa('.reveal:not(.hero-copy):not(.hero-visual)').forEach(element => gsap.fromTo(element, { opacity: 0, y: 38 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } }));
      gsap.to('.signal-number', { y: -9, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.orb-one', { yPercent: 18, scrollTrigger: { trigger: '.hero', scrub: 1.5 } });
      gsap.timeline({ delay: 2.25, onStart: () => qs('.whatsapp').classList.add('is-visible') }).to('.whatsapp', { autoAlpha: 1, y: 0, scale: 1, duration: .65, ease: 'back.out(1.8)' }).to('.whatsapp', { y: -11, duration: .7, repeat: 3, yoyo: true, ease: 'sine.inOut' }).to('.whatsapp', { y: -6, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    } else {
      loader.style.display = 'none';
      qsa('.reveal').forEach(element => element.classList.add('visible'));
      const whatsapp = qs('.whatsapp'); whatsapp.style.opacity = '1'; whatsapp.style.visibility = 'visible'; whatsapp.style.transform = 'none';
    }
  };
  document.readyState === 'complete' ? launchExperience() : addEventListener('load', launchExperience, { once: true });
  qs('[data-year]').textContent = new Date().getFullYear();
  qsa('.faq-list details').forEach(item => item.addEventListener('toggle', () => { if (item.open) qsa('.faq-list details').forEach(other => { if (other !== item) other.open = false; }); }));
})();
