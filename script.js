'use strict';
/* ═══════════════════════════════════════════════════════════
   EXODUS 6.0 — script.js
   SCAD College · Department of Computer Science & Engineering
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   CUSTOM CURSOR (desktop only)
───────────────────────────────────────────── */
(function () {
  const ring = document.getElementById('cr');
  const dot  = document.getElementById('crd');
  if (!ring || !dot || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -200, my = -200, rx = -200, ry = -200;
  let hovering = false;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  // Cursor expand on interactive elements
  document.addEventListener('mouseover', e => {
    const isInt = e.target.closest('button, a, [data-go], input, select, textarea, .gain, .evi, .cti, .tlr');
    if (isInt && !hovering) { ring.classList.add('hov'); hovering = true; }
    else if (!isInt && hovering) { ring.classList.remove('hov'); hovering = false; }
  });

  (function lerp() {
    rx += (mx - rx) * .13;
    ry += (my - ry) * .13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerp);
  })();
})();

/* ─────────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────────── */
const PAGES = {
  home:     'pg-home',
  tech:     'pg-tech',
  nontech:  'pg-nontech',
  schedule: 'pg-schedule',
  contact:  'pg-contact',
  register: 'pg-register',
};

let current = 'home';
const pto = document.getElementById('pto');

function navigate(id) {
  if (!PAGES[id]) return;
  if (id === current) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

  // Slide bars in
  pto.classList.remove('out');
  void pto.offsetWidth; // reflow
  pto.classList.add('in');

  setTimeout(() => {
    // Swap page
    document.getElementById(PAGES[current])?.classList.remove('active');
    const next = document.getElementById(PAGES[id]);
    if (next) { next.classList.add('active'); }
    window.scrollTo({ top: 0, behavior: 'instant' });
    current = id;

    // Update nav indicators
    document.querySelectorAll('.nl').forEach(l =>
      l.classList.toggle('active', l.dataset.go === id)
    );

    // Close hamburger
    closeMobNav();

    // Slide bars out
    pto.classList.remove('in');
    pto.classList.add('out');

    // Trigger reveals
    setTimeout(() => {
      revealAll();
      if (id === 'home') runCounters();
    }, 160);
  }, 420);
}

function wireNav() {
  document.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
}

/* Hamburger */
const hbg  = document.getElementById('hbg');
const mnav = document.getElementById('mnav');

function closeMobNav() {
  hbg?.classList.remove('open');
  mnav?.classList.remove('open');
  mnav?.setAttribute('aria-hidden', 'true');
  hbg?.setAttribute('aria-expanded', 'false');
}

hbg?.addEventListener('click', () => {
  const open = mnav.classList.toggle('open');
  hbg.classList.toggle('open', open);
  mnav.setAttribute('aria-hidden', String(!open));
  hbg.setAttribute('aria-expanded', String(open));
});

/* ─────────────────────────────────────────────
   NAVBAR SCROLL
───────────────────────────────────────────── */
const nav = document.getElementById('nav');
const spb = document.getElementById('spb');

window.addEventListener('scroll', () => {
  nav.classList.toggle('sc', window.scrollY > 28);
  const pct = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight) * 100;
  spb.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

/* ─────────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────────── */
const TARGET = new Date('2026-10-06T09:30:00+05:30').getTime();
const p2 = n => String(Math.max(0, n)).padStart(2, '0');

function setEl(id, v) {
  const e = document.getElementById(id);
  if (e && e.textContent !== v) e.textContent = v;
}

function tick() {
  const d = Math.max(0, TARGET - Date.now());
  const days  = Math.floor(d / 86400000);
  const hours = Math.floor(d % 86400000 / 3600000);
  const mins  = Math.floor(d % 3600000 / 60000);
  const secs  = Math.floor(d % 60000 / 1000);
  setEl('hD', p2(days));  setEl('hH', p2(hours));
  setEl('hM', p2(mins));  setEl('hS', p2(secs));
  setEl('fD', p2(days));  setEl('fH', p2(hours));  setEl('fM', p2(mins));
}
tick();
setInterval(tick, 1000);

/* ─────────────────────────────────────────────
   ANIMATED COUNTERS
───────────────────────────────────────────── */
let countersDone = false;
function runCounters() {
  if (countersDone) return;
  const els = document.querySelectorAll('.cnt');
  if (!els.length) return;
  countersDone = true;
  els.forEach(el => {
    const to  = +el.dataset.to;
    const t0  = performance.now();
    const dur = 2000;
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(ease * to);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ─────────────────────────────────────────────
   INTERSECTION OBSERVER — reveal on scroll
───────────────────────────────────────────── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');
    obs.unobserve(e.target);
  });
}, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

function revealAll() {
  document.querySelectorAll('.pg.active [data-an]').forEach(el => {
    if (!el.classList.contains('on')) obs.observe(el);
  });
}

/* Watch for page swaps */
new MutationObserver(revealAll).observe(
  document.getElementById('app'),
  { attributes: true, subtree: true, attributeFilter: ['class'] }
);

/* ─────────────────────────────────────────────
   CANVAS — Mouse-reactive circuit background
───────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('cnv');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const mouse = { x: -999, y: -999 };
  const GRID  = 68;
  let nodes   = [], pulses = [], particles = [];

  /* ── Resize ── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNodes();
    buildPulses();
    buildParticles();
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* ── Grid nodes ── */
  function buildNodes() {
    nodes = [];
    const cols = Math.ceil(W / GRID) + 1;
    const rows = Math.ceil(H / GRID) + 1;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (Math.random() < .28) {
          nodes.push({
            x: c * GRID, y: r * GRID,
            alpha: .02 + Math.random() * .07,
            phase: Math.random() * Math.PI * 2,
            speed: .008 + Math.random() * .014,
            col: Math.floor(c), row: Math.floor(r), cols,
          });
        }
      }
    }
  }

  /* ── Animated circuit pulses ── */
  function buildPulses() {
    pulses = [];
    for (let i = 0; i < 18; i++) {
      pulses.push({
        x1: Math.random() * W,
        y1: Math.random() * H,
        dx: (Math.floor(Math.random() * 6) + 2) * GRID * (Math.random() > .5 ? 1 : -1),
        dy: (Math.floor(Math.random() * 5) + 2) * GRID * (Math.random() > .5 ? 1 : -1),
        prog: Math.random(),
        speed: .002 + Math.random() * .004,
        alpha: .035 + Math.random() * .05,
      });
    }
  }

  /* ── Floating particles ── */
  class Particle {
    constructor(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 8;
      this.vx = (Math.random() - .5) * .35;
      this.vy = -(Math.random() * .5 + .1);
      this.r  = Math.random() * 1.3 + .3;
      this.life = 0;
      this.max  = 200 + Math.random() * 500;
      const g   = 130 + Math.floor(Math.random() * 120);
      this.col  = `rgba(34,${g},80,`;
    }
    update() {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        const f = (100 - d) / 100 * .7;
        this.vx += dx / d * f * .05;
        this.vy += dy / d * f * .05;
      }
      this.vx *= .98; this.vy *= .98;
      this.x += this.vx; this.y += this.vy;
      this.life++;
      if (this.life > this.max || this.y < -10) {
        this.x = Math.random() * W; this.y = H + 8;
        this.life = 0; this.max = 200 + Math.random() * 500;
      }
    }
    draw() {
      const fade = Math.min(this.life / 50, 1) * Math.min((this.max - this.life) / 50, 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col + (fade * .55) + ')';
      ctx.fill();
    }
  }

  function buildParticles() {
    particles = [];
    const n = Math.floor(W * H / 9000);
    for (let i = 0; i < n; i++) particles.push(new Particle(true));
  }

  /* ── Draw grid lines ── */
  function drawGrid() {
    nodes.forEach(n => {
      n.phase += n.speed;
      const a = n.alpha * (.5 + .5 * Math.sin(n.phase));

      // Horizontal
      const right = nodes.find(m => m.col === n.col + 1 && m.row === n.row);
      if (right) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y); ctx.lineTo(right.x, right.y);
        ctx.strokeStyle = `rgba(34,197,94,${a})`;
        ctx.lineWidth = .7; ctx.stroke();
      }
      // Vertical
      const below = nodes.find(m => m.col === n.col && m.row === n.row + 1);
      if (below) {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y); ctx.lineTo(below.x, below.y);
        ctx.strokeStyle = `rgba(34,197,94,${a * .6})`;
        ctx.lineWidth = .7; ctx.stroke();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(74,222,128,${a * 2.2})`;
      ctx.fill();
    });
  }

  /* ── Draw pulse paths ── */
  function drawPulses() {
    pulses.forEach(p => {
      p.prog = (p.prog + p.speed) % 1;
      const x2 = p.x1 + p.dx, y2 = p.y1;
      const x3 = x2, y3 = p.y1 + p.dy;

      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.strokeStyle = `rgba(34,197,94,${p.alpha})`;
      ctx.lineWidth = .85; ctx.stroke();

      // Travelling signal dot
      const len1 = Math.abs(p.dx), len2 = Math.abs(p.dy);
      const tot  = len1 + len2, dist = p.prog * tot;
      let tx, ty;
      if (dist <= len1) {
        tx = p.x1 + (x2 - p.x1) * (dist / len1);
        ty = p.y1;
      } else {
        tx = x2;
        ty = y2 + (y3 - y2) * Math.min((dist - len1) / len2, 1);
      }
      const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, 9);
      grd.addColorStop(0, `rgba(134,239,172,${p.alpha * 5})`);
      grd.addColorStop(1, 'rgba(134,239,172,0)');
      ctx.beginPath();
      ctx.arc(tx, ty, 9, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });
  }

  /* ── Mouse glow ── */
  function drawMouseGlow() {
    if (mouse.x < 0) return;
    const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
    grd.addColorStop(0, 'rgba(34,197,94,.045)');
    grd.addColorStop(1, 'rgba(34,197,94,0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  /* ── Main loop ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawPulses();
    drawMouseGlow();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  loop();
})();

/* ─────────────────────────────────────────────
   HERO TITLE GLITCH EFFECT
   Delayed 4s so the title is readable on load
───────────────────────────────────────────── */
function glitch() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%◈';
  const els = document.querySelectorAll('.hc0');
  if (!els.length) return;
  const orig = [...els].map(e => e.textContent);
  let step = 0;
  const max = orig.length * 2.5;
  const iv = setInterval(() => {
    els.forEach((el, i) => {
      if (step > i * 2.2 || el.classList.contains('hca')) {
        el.textContent = orig[i];
        el.style.color = '';
      } else {
        el.textContent = chars[Math.floor(Math.random() * chars.length)];
        el.style.color = 'rgba(34,197,94,.7)';
      }
    });
    step++;
    if (step > max) {
      clearInterval(iv);
      els.forEach((el, i) => { el.textContent = orig[i]; el.style.color = ''; });
    }
  }, 45);
}

// Start after 4s (title visible and readable first), then every 12s
setTimeout(glitch, 4000);
setInterval(glitch, 12000);

/* ─────────────────────────────────────────────
   GAIN CARD NUMBER SCRAMBLE ON HOVER
───────────────────────────────────────────── */
function addGainScramble() {
  document.querySelectorAll('.gain').forEach(card => {
    const n = card.querySelector('.gn');
    if (!n) return;
    const orig = n.textContent;
    let iv = null;
    card.addEventListener('mouseenter', () => {
      if (iv) return;
      let s = 0;
      iv = setInterval(() => {
        n.textContent = s < 10
          ? String(Math.floor(Math.random() * 99)).padStart(2, '0')
          : orig;
        s++;
        if (s > 14) { clearInterval(iv); iv = null; n.textContent = orig; }
      }, 38);
    });
  });
}

/* ─────────────────────────────────────────────
   EVENT ITEM HOVER — number highlight
───────────────────────────────────────────── */
function addEvHover() {
  document.querySelectorAll('.evi').forEach(item => {
    const n   = item.querySelector('.evn');
    const isG = item.classList.contains('nt');
    const col = isG ? 'rgba(251,191,36,.65)' : 'rgba(34,197,94,.65)';
    if (!n) return;
    item.addEventListener('mouseenter', () => n.style.color = col);
    item.addEventListener('mouseleave', () => n.style.color = '');
  });
}

/* ─────────────────────────────────────────────
   FORMS
───────────────────────────────────────────── */
function contactSubmit(e) {
  e.preventDefault();
  openModal('✉️', 'Message Sent!', 'Our team will get back to you shortly. Thank you for reaching out to EXODUS 6.0.');
  e.target.reset();
}

function registerSubmit(e) {
  e.preventDefault();
  openModal('🎓', 'Registration Submitted!', 'You\'re registered for EXODUS 6.0! We\'ll confirm shortly. See you on October 6, 2026 at SCAD College, Tirunelveli.');
  e.target.reset();
}

function openModal(icon, title, msg) {
  document.getElementById('mIc').textContent    = icon;
  document.getElementById('mTitle').textContent = title;
  document.getElementById('mMsg').textContent   = msg;
  const m = document.getElementById('modal');
  m.classList.add('open');
  m.removeAttribute('aria-hidden');
}

function closeModal() {
  const m = document.getElementById('modal');
  m.classList.remove('open');
  m.setAttribute('aria-hidden', 'true');
}

document.getElementById('modal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─────────────────────────────────────────────
   LOGO — gentle glow pulse on load
───────────────────────────────────────────── */
function initLogoEffect() {
  // CSS already defines logoFloat animation — just ensure it applies
  const img = document.querySelector('.lv-img');
  if (img && img.complete) {
    // Animation already applied via CSS class — nothing extra needed
    img.style.opacity = '1';
  }
}

/* ─────────────────────────────────────────────
   BACK TO TOP BUTTON
───────────────────────────────────────────── */
function initBTT() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  const main = document.getElementById('app');

  // Show after scrolling 400px in current page
  main.addEventListener('scroll', () => {
    btn.classList.toggle('vis', main.scrollTop > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    main.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────────
   LAZY IMAGE FADE-IN
───────────────────────────────────────────── */
function initImgFade() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  imgs.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    }
  });
}

/* ─────────────────────────────────────────────
   MOBILE BOTTOM NAV ACTIVE SYNC
───────────────────────────────────────────── */
function syncMobileNav(pageId) {
  const btns = document.querySelectorAll('.mbn[data-go]');
  btns.forEach(b => {
    b.classList.toggle('active', b.dataset.go === pageId);
  });
}

/* ─────────────────────────────────────────────
   BUTTON RIPPLE MICRO-INTERACTION
───────────────────────────────────────────── */
function initRipple() {
  document.querySelectorAll('.btn-p, .btn-o, .nreg').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      const r = document.createElement('span');
      r.className = 'ripple-wave';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      r.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        border-radius:50%;
        background:rgba(255,255,255,.18);
        transform:scale(0);
        animation:ripple .5s ease-out forwards;
        pointer-events:none;z-index:10;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });

  // Add ripple keyframe once
  if (!document.getElementById('ripple-kf')) {
    const s = document.createElement('style');
    s.id = 'ripple-kf';
    s.textContent = '@keyframes ripple{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(s);
  }
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  wireNav();
  revealAll();
  runCounters();
  addGainScramble();
  addEvHover();
  initLogoEffect();
  initBTT();
  initImgFade();
  initRipple();

  // Patch navigate() to also sync mobile nav
  const origNavigate = window.navigate;
  if (origNavigate) {
    window.navigate = (id) => {
      origNavigate(id);
      syncMobileNav(id);
    };
  }

  // Initial page transition out to show page
  pto.classList.add('out');
  setTimeout(() => pto.classList.remove('out'), 600);
});
