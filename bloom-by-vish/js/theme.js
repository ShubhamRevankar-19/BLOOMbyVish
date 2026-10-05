/* =====================================================================
   BLOOM by Vish — theme.js   "Midnight Orchid" decorations
   ---------------------------------------------------------------------
   Adds the floating chenille flowers, sprigs, sparkles, glow orbs, hero
   halo and wavy section edges. Pure decoration (aria-hidden) — nothing
   here affects shopping, forms or checkout.
   To change/remove decorations edit the DECOR list below.
   ===================================================================== */
(function () {
  'use strict';
  if (!document.body || typeof BloomArt === 'undefined') return;
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const ST = hasGsap && typeof ScrollTrigger !== 'undefined' ? ScrollTrigger : null;

  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z"/></svg>';
  const SPRIG = (a, b) => '<svg viewBox="0 0 120 220" aria-hidden="true"><path d="M60 215 C58 150 66 90 60 8" fill="none" stroke="' + b + '" stroke-width="3.5" stroke-linecap="round"/>' +
    [[60, 190, -1, 0], [62, 160, 1, 0], [58, 128, -1, 0], [62, 98, 1, 0], [58, 66, -1, 0], [61, 38, 1, 0]].map(function (l, i) {
      var d = l[2], s = 1 - i * 0.07;
      return '<path d="M' + l[0] + ' ' + l[1] + ' q' + (d * 46 * s) + ' -26 ' + (d * 52 * s) + ' -60 q' + (-d * 40 * s) + ' 6 ' + (-d * 52 * s) + ' 60z" fill="' + (i % 2 ? a : b) + '" opacity=".92"/>';
    }).join('') + '<path d="M60 8 q10 -6 14 -2 q-4 8 -14 2z" fill="' + a + '"/></svg>';

  /* ---- what goes where -------------------------------------------------
     k: flower | sprig | star | orb | ring      x/y: position inside section
     w: size    t/c: flower type/colour          f: float distance (px)
     p: parallax (% of own height)              sm: hide on phones           */
  const DECOR = {
    '#home': [
      { k: 'orb', x: '58%', y: '30%', w: '520px', c1: 'rgba(255,126,179,.45)', b: '70px' },
      { k: 'flower', t: 'rose', c: 'pink', x: '43%', y: '58%', w: '84px', r: -20, f: 16, p: -14, sm: 1 },
      { k: 'flower', t: 'daisy', c: 'white', x: '46%', y: '8%', w: '96px', r: 12, f: 12, p: -22, sm: 1 },
      { k: 'flower', t: 'bloom', c: 'purple', x: '91%', y: '72%', w: '140px', r: 25, f: 18, p: -10 },
      { k: 'sprig', x: '86%', y: '4%', w: '90px', r: 30, a: '#8ee6c4', b: '#34b58d', f: 8, sm: 1 },
      { k: 'star', x: '52%', y: '20%', w: '22px', c: '#e8b04a' }, { k: 'star', x: '93%', y: '40%', w: '16px', c: '#ff7eb3', d: '1s' },
      { k: 'star', x: '8%', y: '24%', w: '18px', c: '#b66bff', d: '.5s' }, { k: 'star', x: '70%', y: '90%', w: '20px', c: '#e8b04a', d: '1.6s' },
      { k: 'star', x: '38%', y: '82%', w: '14px', c: '#ff7eb3', d: '2.1s', sm: 1 }
    ],
    '#handmade': [
      { k: 'flower', t: 'blossom', c: 'purple', x: '-3%', y: '8%', w: '170px', r: 14, f: 14, p: -12 },
      { k: 'flower', t: 'rose', c: 'pink', x: '93%', y: '66%', w: '190px', r: -14, f: 16, p: -16 },
      { k: 'sprig', x: '90%', y: '6%', w: '90px', r: 24, a: '#8ee6c4', b: '#34b58d', f: 8, sm: 1 },
      { k: 'star', x: '12%', y: '70%', w: '20px', c: '#e8b04a' }, { k: 'star', x: '80%', y: '30%', w: '16px', c: '#ff7eb3', d: '1s' }
    ],
    '#shop': [
      { k: 'flower', t: 'daisy', c: 'yellow', x: '-4%', y: '3%', w: '170px', r: 8, f: 12, p: -10 },
      { k: 'flower', t: 'bloom', c: 'pink', x: '94%', y: '34%', w: '160px', r: 20, f: 14, p: -18, sm: 1 },
      { k: 'flower', t: 'rose', c: 'purple', x: '-3%', y: '78%', w: '160px', r: -16, f: 14, p: -12, sm: 1 },
      { k: 'star', x: '88%', y: '8%', w: '22px', c: '#b66bff' }, { k: 'star', x: '6%', y: '40%', w: '16px', c: '#e8b04a', d: '.8s' }, { k: 'star', x: '92%', y: '82%', w: '18px', c: '#ff7eb3', d: '1.5s' }
    ],
    '#custom': [
      { k: 'flower', t: 'rose', c: 'pink', x: '-4%', y: '4%', w: '180px', r: -10, f: 14, p: -14 },
      { k: 'flower', t: 'blossom', c: 'blue', x: '95%', y: '88%', w: '150px', r: 18, f: 14, p: -10, sm: 1 },
      { k: 'ring', x: '78%', y: '4%', w: '260px', c: 'rgba(139,92,246,.35)', t: '90s', sm: 1 },
      { k: 'star', x: '45%', y: '3%', w: '20px', c: '#e8b04a' }, { k: 'star', x: '5%', y: '90%', w: '18px', c: '#b66bff', d: '1s' }
    ],
    '#collections': [
      { k: 'flower', t: 'bloom', c: 'purple', x: '95%', y: '5%', w: '170px', r: 10, f: 14, p: -14 },
      { k: 'flower', t: 'daisy', c: 'pink', x: '-4%', y: '88%', w: '150px', r: -12, f: 12, p: -10, sm: 1 },
      { k: 'star', x: '10%', y: '10%', w: '18px', c: '#ff7eb3' }, { k: 'star', x: '85%', y: '92%', w: '22px', c: '#e8b04a', d: '1.2s' }
    ],
    '#why': [
      { k: 'flower', t: 'rose', c: 'pink', x: '-3%', y: '50%', w: '180px', r: 12, f: 16, p: -10, o: .9, sm: 1 },
      { k: 'flower', t: 'blossom', c: 'white', x: '94%', y: '10%', w: '140px', r: -20, f: 14, p: -14, o: .9, sm: 1 },
      { k: 'star', x: '20%', y: '18%', w: '20px', c: '#ffe3a3' }, { k: 'star', x: '76%', y: '30%', w: '16px', c: '#ff7eb3', d: '.7s' },
      { k: 'star', x: '60%', y: '80%', w: '22px', c: '#ffe3a3', d: '1.4s' }, { k: 'star', x: '8%', y: '12%', w: '14px', c: '#b66bff', d: '2s' },
      { k: 'ring', x: '70%', y: '55%', w: '320px', c: 'rgba(255,227,163,.28)', t: '100s', sm: 1 }
    ],
    '#process': [
      { k: 'flower', t: 'daisy', c: 'white', x: '-3%', y: '10%', w: '140px', r: 10, f: 12, p: -12 },
      { k: 'flower', t: 'rose', c: 'purple', x: '95%', y: '70%', w: '170px', r: -18, f: 14, p: -14, sm: 1 },
      { k: 'sprig', x: '92%', y: '8%', w: '80px', r: 20, a: '#8ee6c4', b: '#34b58d', f: 8, sm: 1 },
      { k: 'star', x: '30%', y: '6%', w: '18px', c: '#e8b04a' }, { k: 'star', x: '10%', y: '86%', w: '20px', c: '#ff7eb3', d: '1s' }
    ],
    '#gallery': [
      { k: 'flower', t: 'bloom', c: 'yellow', x: '-4%', y: '6%', w: '160px', r: -8, f: 14, p: -12 },
      { k: 'flower', t: 'blossom', c: 'pink', x: '95%', y: '60%', w: '150px', r: 16, f: 14, p: -14, sm: 1 },
      { k: 'star', x: '88%', y: '6%', w: '20px', c: '#b66bff' }, { k: 'star', x: '4%', y: '60%', w: '16px', c: '#e8b04a', d: '.9s' }
    ],
    '#reviews': [
      { k: 'flower', t: 'rose', c: 'pink', x: '-4%', y: '60%', w: '190px', r: 14, f: 16, p: -12 },
      { k: 'flower', t: 'daisy', c: 'white', x: '93%', y: '8%', w: '150px', r: -10, f: 12, p: -14, sm: 1 },
      { k: 'star', x: '14%', y: '12%', w: '22px', c: '#e8b04a' }, { k: 'star', x: '86%', y: '78%', w: '18px', c: '#ff7eb3', d: '1.1s' }, { k: 'star', x: '50%', y: '4%', w: '16px', c: '#b66bff', d: '.4s' }
    ],
    '#social': [
      { k: 'flower', t: 'blossom', c: 'purple', x: '-3%', y: '8%', w: '150px', r: 12, f: 12, p: -10 },
      { k: 'flower', t: 'rose', c: 'pink', x: '94%', y: '86%', w: '160px', r: -14, f: 14, p: -12, sm: 1 },
      { k: 'star', x: '90%', y: '10%', w: '18px', c: '#e8b04a' }, { k: 'star', x: '6%', y: '88%', w: '20px', c: '#ff7eb3', d: '1s' }
    ],
    '#about': [
      { k: 'flower', t: 'bloom', c: 'pink', x: '48%', y: '2%', w: '120px', r: 12, f: 12, p: -14, sm: 1 },
      { k: 'sprig', x: '-1%', y: '62%', w: '90px', r: -20, a: '#8ee6c4', b: '#34b58d', f: 8, sm: 1 },
      { k: 'star', x: '90%', y: '8%', w: '22px', c: '#b66bff' }, { k: 'star', x: '44%', y: '92%', w: '18px', c: '#e8b04a', d: '1.3s' }
    ],
    '#contact': [
      { k: 'flower', t: 'rose', c: 'purple', x: '94%', y: '4%', w: '170px', r: 14, f: 14, p: -12 },
      { k: 'flower', t: 'daisy', c: 'pink', x: '-4%', y: '82%', w: '150px', r: -10, f: 12, p: -10, sm: 1 },
      { k: 'star', x: '10%', y: '10%', w: '20px', c: '#e8b04a' }, { k: 'star', x: '86%', y: '90%', w: '18px', c: '#ff7eb3', d: '1s' }
    ],
    'footer.site-footer': [
      { k: 'flower', t: 'rose', c: 'pink', x: '92%', y: '58%', w: '150px', r: -10, f: 12, o: .85, sm: 1 },
      { k: 'flower', t: 'blossom', c: 'purple', x: '-3%', y: '8%', w: '120px', r: 16, f: 10, o: .85, sm: 1 },
      { k: 'star', x: '30%', y: '14%', w: '16px', c: '#ffe3a3' }, { k: 'star', x: '70%', y: '30%', w: '20px', c: '#ff7eb3', d: '1s' },
      { k: 'star', x: '50%', y: '80%', w: '14px', c: '#ffe3a3', d: '1.8s' }, { k: 'star', x: '12%', y: '70%', w: '18px', c: '#b66bff', d: '.6s' }
    ]
  };

  function build(item) {
    var el = document.createElement('div');
    var st = el.style;
    st.setProperty('--x', item.x); st.setProperty('--y', item.y);
    if (item.w) st.setProperty('--w', item.w);
    if (item.o != null) st.setProperty('--o', item.o);
    if (item.k === 'flower') {
      el.className = 'd-flower'; el.innerHTML = BloomArt.flowerHeadSVG(item.t, item.c, '');
      el.firstChild.setAttribute('aria-hidden', 'true'); el.firstChild.removeAttribute('role'); el.firstChild.removeAttribute('aria-label');
    } else if (item.k === 'sprig') { el.className = 'd-leaf'; el.innerHTML = SPRIG(item.a, item.b); }
    else if (item.k === 'star') {
      el.className = 'd-star'; el.innerHTML = STAR; st.setProperty('--c', item.c);
      if (item.d) st.setProperty('--d', item.d);
      st.setProperty('--t', (2.8 + Math.random() * 2).toFixed(1) + 's');
    } else if (item.k === 'orb') { el.className = 'd-orb'; st.setProperty('--c1', item.c1); if (item.b) st.setProperty('--b', item.b); }
    else if (item.k === 'ring') { el.className = 'd-ring'; st.setProperty('--c', item.c); if (item.t) st.setProperty('--t', item.t); }
    if (item.sm) el.classList.add('hide-sm');
    if (item.r) st.transform = 'rotate(' + item.r + 'deg)';
    return el;
  }

  function wave(fill, pos) {
    var d = document.createElement('div');
    d.className = 'wave wave--' + pos; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path fill="' + fill + '" d="M0 0H1440V38C1260 92 1080 8 900 40S540 96 360 52 90 12 0 62Z"/></svg>';
    return d;
  }

  var motion = [];
  Object.keys(DECOR).forEach(function (sel) {
    var host = document.querySelector(sel);
    if (!host) return;
    var layer = document.createElement('div');
    layer.className = 'deco'; layer.setAttribute('aria-hidden', 'true');
    DECOR[sel].forEach(function (it) {
      var el = build(it); layer.appendChild(el);
      if (it.f || it.p) motion.push({ el: el, it: it, host: host });
    });
    host.insertBefore(layer, host.firstChild);
  });

  /* wavy edges between light and dark sections */
  var why = document.getElementById('why');
  if (why) { why.appendChild(wave('#fffbff', 'top')); why.appendChild(wave('#fffbff', 'bottom')); }
  var foot = document.querySelector('footer.site-footer');
  if (foot) foot.appendChild(wave('#fdeefa', 'top'));

  /* hero halo: orbit rings with little gold beads, behind the arch */
  var stage = document.getElementById('heroStage');
  if (stage) {
    var h = document.createElement('div');
    h.className = 'hero__halo'; h.setAttribute('aria-hidden', 'true');
    h.innerHTML = '<svg viewBox="0 0 600 600"><defs><linearGradient id="hl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb3"/><stop offset=".5" stop-color="#b66bff"/><stop offset="1" stop-color="#e8b04a"/></linearGradient></defs>' +
      '<g class="r1"><circle cx="300" cy="300" r="286" fill="none" stroke="url(#hl)" stroke-width="1.4" stroke-dasharray="3 9"/><circle cx="300" cy="14" r="7" fill="#e8b04a"/><circle cx="586" cy="300" r="5" fill="#ff7eb3"/><circle cx="120" cy="520" r="6" fill="#b66bff"/></g>' +
      '<g class="r2"><circle cx="300" cy="300" r="252" fill="none" stroke="#b66bff" stroke-opacity=".45" stroke-width="1"/><circle cx="48" cy="300" r="6" fill="#ff7eb3"/><circle cx="478" cy="86" r="5" fill="#e8b04a"/></g></svg>';
    stage.insertBefore(h, stage.firstChild);
  }

  /* motion: gentle float + scroll parallax */
  if (!hasGsap || reduced) return;
  motion.forEach(function (m) {
    var it = m.it, el = m.el, rot = it.r || 0;
    if (it.f) {
      gsap.to(el, { y: it.f * (Math.random() < .5 ? -1 : 1), rotation: rot + (Math.random() * 14 - 7), duration: 3.2 + Math.random() * 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: Math.random() * 2 });
    }
    if (it.p && ST) {
      gsap.to(el, { yPercent: it.p * 3, ease: 'none', scrollTrigger: { trigger: m.host, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    }
  });
  if (ST) setTimeout(function () { ST.refresh(); }, 700);
})();
