/* ================================================
   OLIGRA · main.js
   ================================================ */

/* ── PAGE TRANSITIONS ── */
const overlay = document.getElementById('pageOverlay');
if (overlay) {
  // Fade overlay out on page load
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('out')));

  // Intercept internal link clicks → fade before navigate
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.includes('://') || link.target === '_blank') return;
    e.preventDefault();
    overlay.classList.remove('out');
    setTimeout(() => { window.location.href = href; }, 460);
  });
}

/* ── NAV ACTIVE STATE ── */
(function () {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── MOBILE MENU ── */
const toggle = document.querySelector('.menu-toggle');
const nav    = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav a').forEach((link) =>
  link.addEventListener('click', () => nav.classList.remove('open'))
);

/* ── HERO SLIDER ── */
const heroSlides  = [...document.querySelectorAll('.hslide')];
const heroContent = document.getElementById('heroContent');
const dotsWrap    = document.getElementById('hdots');
const prevBtn     = document.querySelector('.hslider-prev');
const nextBtn     = document.querySelector('.hslider-next');

if (heroSlides.length > 1) {
  let cur = 0;
  let interval;

  // Build dot indicators
  const dots = heroSlides.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'hdot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', () => go(i));
    dotsWrap?.appendChild(d);
    return d;
  });

  function setHeroContent(idx) {
    if (!heroContent) return;
    const hide = (idx === 0);
    heroContent.style.opacity      = hide ? '0' : '1';
    heroContent.style.transform    = hide ? 'translateY(20px)' : '';
    heroContent.style.pointerEvents = hide ? 'none' : '';
  }

  function go(idx) {
    heroSlides[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = ((idx % heroSlides.length) + heroSlides.length) % heroSlides.length;
    heroSlides[cur].classList.add('active');
    dots[cur]?.classList.add('active');
    setHeroContent(cur);
    restart();
  }

  function restart() {
    clearInterval(interval);
    interval = setInterval(() => go(cur + 1), 5200);
  }

  prevBtn?.addEventListener('click', () => go(cur - 1));
  nextBtn?.addEventListener('click', () => go(cur + 1));

  setHeroContent(0); // Slide 0 is video — hide text
  restart();
}

/* ── HERO VIDEO — force mute + autoplay ── */
const heroVideo = document.querySelector('.hslide video');
if (heroVideo) {
  heroVideo.muted  = true;
  heroVideo.volume = 0;
  heroVideo.play().catch(() => {});
}

/* ── HERO PARTICLES ── */
const particlesEl = document.getElementById('heroParticles');
if (particlesEl) {
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const s = Math.random() * 5 + 3;
    p.style.cssText = [
      `width:${s}px`,
      `height:${s}px`,
      `left:${Math.random() * 100}%`,
      `animation-duration:${Math.random() * 14 + 10}s`,
      `animation-delay:-${Math.random() * 16}s`,
    ].join(';');
    particlesEl.appendChild(p);
  }
}

/* ── SCROLL REVEAL ── */
const revealObs = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

/* ── COUNTER ANIMATION ── */
const counters = [...document.querySelectorAll('.counter-num')];
if (counters.length) {
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const dur    = 1800;
      const t0     = performance.now();
      const tick   = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
      cObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => cObs.observe(el));
}

/* ── MAP PINS ── */
const mapPins    = [...document.querySelectorAll('.map-pin')];
const mapWrapper = document.querySelector('.map-wrapper');
if (mapPins.length && mapWrapper) {
  // Assign a random pulse-animation phase to each pin so pulses never sync up
  mapPins.forEach((pin) => {
    pin.style.setProperty('--pulse-delay', (Math.random() * 2.8).toFixed(2) + 's');
  });

  const mObs = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    // Appear in random order over ~3 seconds
    const order = [...mapPins].sort(() => Math.random() - 0.5);
    order.forEach((pin, i) => {
      const delay = i * 200 + Math.random() * 180;
      setTimeout(() => pin.classList.add('visible'), delay);
    });
    mObs.disconnect();
  }, { threshold: 0.25 });
  mObs.observe(mapWrapper);
}

/* ── PROCESS FLOW ANIMATION ── */
const pflowBlocks = [...document.querySelectorAll('.pflow-oil-block')];
if (pflowBlocks.length) {
  const fObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  pflowBlocks.forEach((el) => fObs.observe(el));
}

/* ── COUNTRY MARQUEE ── */
const countries = [
  'Estados Unidos','México','Brasil','Colombia','Chile','Perú','Bolivia',
  'Uruguay','Paraguay','Venezuela','Ecuador','Costa Rica','Guatemala','Cuba',
  'España','Italia','Portugal','Alemania','Francia','Países Bajos',
  'Arabia Saudita','Emiratos Árabes','Israel','India','Bangladesh',
  'China','Corea del Sur','Japón','Australia',
  'Sudáfrica','Nigeria','Angola','Senegal','Mozambique'
];
const marqueeEl = document.getElementById('marqueeInner');
if (marqueeEl) {
  marqueeEl.innerHTML = [...countries, ...countries]
    .map((c) => `<span class="country-tag">${c}</span>`)
    .join('');
}

/* ── CONTACT FORM ── */
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  submitBtn.disabled     = true;
  submitBtn.textContent  = 'Enviando…';
  formStatus.textContent = '';
  try {
    const res  = await fetch('send_mail.php', { method: 'POST', body: new FormData(form) });
    const json = await res.json();
    if (json.ok) {
      formStatus.textContent = '✓ Mensaje enviado. Te contactaremos pronto.';
      formStatus.style.color = 'var(--gold)';
      form.reset();
    } else {
      throw new Error(json.msg || 'Error al enviar.');
    }
  } catch (err) {
    formStatus.textContent = '✗ ' + err.message;
    formStatus.style.color = '#c0392b';
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Enviar mensaje';
  }
});
