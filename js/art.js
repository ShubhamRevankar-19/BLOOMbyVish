/* =====================================================================
   BLOOM by Vish — art.js
   ---------------------------------------------------------------------
   Procedural "pipe-cleaner" (chenille) flower illustrations, returned as
   SVG strings. They are used for:
     • the hero artwork
     • the live bouquet configurator preview
     • custom-bouquet thumbnails in the cart
     • placeholder product / gallery images (rendered once to JPG files in
       /assets/images — replace those files with your real photographs)

   Public API (global `BloomArt`):
     BloomArt.PALETTE                      colour palettes
     BloomArt.bouquetSVG(options)          a wrapped bouquet scene
     BloomArt.singleSVG(options)           one long-stem flower scene
     BloomArt.flowerHeadSVG(type, colour)  a single flower head (icon / float)
     BloomArt.sceneSVG(id)                 a named scene (used for placeholders)
     BloomArt.SCENES                       registry of every named scene
   ===================================================================== */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------------
     1. COLOUR HELPERS & PALETTES
  ------------------------------------------------------------------ */
  const PAL = {
    pink:   { base: '#f0a1b8', light: '#fbd3df', dark: '#cf6c89' },
    blush:  { base: '#f8cdd8', light: '#fde8ee', dark: '#e09fb2' },
    red:    { base: '#d9475f', light: '#ee8095', dark: '#a92d44' },
    blue:   { base: '#6d91dc', light: '#a9c1f0', dark: '#4468b8' },
    royal:  { base: '#2f4aa8', light: '#6d86d6', dark: '#1d2f78' },
    navy:   { base: '#1f2d5c', light: '#4a5b92', dark: '#121b3d' },
    white:  { base: '#fbf6ec', light: '#ffffff', dark: '#d8ccb6' },
    purple: { base: '#a58bd8', light: '#cdbcf0', dark: '#7a5fb3' },
    yellow: { base: '#f5cf65', light: '#fae6a0', dark: '#d4a53a' },
    peach:  { base: '#f6b496', light: '#fbd5c2', dark: '#df8a68' },
    sage:   { base: '#86b08a', light: '#b4d2b5', dark: '#5c8a64' },
    gold:   { base: '#d4b068', light: '#ecd8a2', dark: '#a8843a' }
  };
  const GOLD = PAL.gold;

  const WRAPS = {
    ivory: { a: '#faf4e8', b: '#e9dcc5', c: '#cdbd9f' },
    blush: { a: '#fbe1e8', b: '#efb9c8', c: '#d98fa6' },
    navy:  { a: '#33437f', b: '#1d2a5c', c: '#101839' },
    kraft: { a: '#e6c9a3', b: '#cda57a', c: '#a97f52' },
    sheer: { a: '#ffffff', b: '#e6ecf7', c: '#bcc9e6', sheer: true }
  };

  const RIBBONS = {
    gold:  { a: '#f1e0ae', b: '#cfaa62', c: '#a8843a' },
    pink:  { a: '#fbd0dc', b: '#ef93ae', c: '#cf6a8c' },
    navy:  { a: '#46579a', b: '#1f2d5c', c: '#121b3d' },
    white: { a: '#ffffff', b: '#f2ede2', c: '#d6cdbb' },
    red:   { a: '#ee8095', b: '#d9475f', c: '#a92d44' }
  };

  const f = n => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  function rgb2hex(a) { return '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
  function mixHex(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); }
  const tint = (c, t) => ({ base: mixHex(c.base, '#ffffff', t), light: mixHex(c.light, '#ffffff', t), dark: mixHex(c.dark, '#ffffff', t * 0.7) });
  const deepen = (c, t) => ({ base: mixHex(c.base, '#000000', t), light: mixHex(c.light, '#000000', t), dark: mixHex(c.dark, '#000000', t) });

  /* tiny seeded random generator so every render of a scene is identical */
  function rng(seed) {
    let a = (seed * 9301 + 49297) >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let UID = 0;
  const nid = () => 'bv' + (++UID);

  /* ------------------------------------------------------------------
     2. THE "CHENILLE" STROKE
        A pipe cleaner = dark edge + body + twisted-stripe + soft highlight
  ------------------------------------------------------------------ */
  function chen(d, c, w) {
    const dash = Math.max(1.1, w * 0.1), gap = Math.max(2.4, w * 0.3);
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="' + d + '" stroke="' + c.dark + '" stroke-width="' + f(w + 2) + '"/>' +
      '<path d="' + d + '" stroke="' + c.base + '" stroke-width="' + f(w) + '"/>' +
      '<path d="' + d + '" stroke="' + c.light + '" stroke-width="' + f(w * 0.6) + '" stroke-linecap="butt" stroke-dasharray="' + f(dash) + ' ' + f(gap) + '" opacity=".75"/>' +
      '<path d="' + d + '" stroke="#fff" stroke-width="' + f(Math.max(1, w * 0.18)) + '" opacity=".3" transform="translate(-.7 -.9)"/>' +
      '</g>';
  }

  /* petal outlines — drawn with the base at (0,0) pointing up (−y) */
  const loopRound = (L, W) => 'M0 0C' + f(-1.3 * W) + ' ' + f(-0.25 * L) + ' ' + f(-1.15 * W) + ' ' + f(-L) + ' 0 ' + f(-L) +
    'C' + f(1.15 * W) + ' ' + f(-L) + ' ' + f(1.3 * W) + ' ' + f(-0.25 * L) + ' 0 0Z';
  const loopPoint = (L, W) => 'M0 0C' + f(-1.2 * W) + ' ' + f(-0.2 * L) + ' ' + f(-1.1 * W) + ' ' + f(-0.7 * L) + ' 0 ' + f(-L) +
    'C' + f(1.1 * W) + ' ' + f(-0.7 * L) + ' ' + f(1.2 * W) + ' ' + f(-0.2 * L) + ' 0 0Z';

  function petal(a, off, L, W, c, w, kind, innerTint) {
    const fn = kind === 'point' ? loopPoint : loopRound;
    const outer = fn(L, W), inner = fn(L * 0.6, W * 0.5);
    return '<g transform="rotate(' + f(a) + ') translate(0 ' + f(-off) + ')">' +
      '<path d="' + outer + '" fill="' + c.base + '"/>' + chen(outer, c, w) +
      '<g transform="translate(0 ' + f(-L * 0.16) + ')">' + chen(inner, tint(c, innerTint == null ? 0.3 : innerTint), w * 0.6) + '</g></g>';
  }

  function spiralPath(r0, r1, turns) {
    const steps = Math.ceil(turns * 16); let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, th = t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t;
      d += (i ? 'L' : 'M') + f(r * Math.cos(th)) + ' ' + f(r * Math.sin(th));
    }
    return d;
  }

  function bead(x, y, r, c) {
    c = c || GOLD;
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + c.base + '" stroke="' + c.dark + '" stroke-width="1.6"/>' +
      '<circle cx="' + f(x - r * 0.3) + '" cy="' + f(y - r * 0.32) + '" r="' + f(r * 0.3) + '" fill="#fff" opacity=".6"/>';
  }

  /* ------------------------------------------------------------------
     3. FLOWER HEADS  (each ≈ 100 units in radius, centred on 0,0)
        returns { svg, by }  — `by` is where the stem attaches
  ------------------------------------------------------------------ */
  const HEAD = {
    rose(c) {
      const c2 = tint(c, 0.2), c3 = deepen(c, 0.08); let s = '';
      for (let i = 0; i < 5; i++) s += petal(i * 72, 22, 76, 54, c, 11);
      for (let i = 0; i < 5; i++) s += petal(i * 72 + 36, 12, 60, 44, c2, 10);
      for (let i = 0; i < 4; i++) s += petal(i * 90 + 20, 4, 40, 30, c, 9);
      s += chen(spiralPath(4, 30, 3.1), c3, 9);
      return { svg: s, by: 84 };
    },
    daisy(c) {
      const cs = deepen(c, 0.05), n = 13; let s = '';
      for (let i = 0; i < n; i++) s += petal(i * 360 / n, 16, 92, 15, cs, 6.5, 'round', 0.35);
      for (let i = 0; i < n; i++) s += petal(i * 360 / n + 180 / n, 14, 76, 14, c, 6.5, 'round', 0.35);
      s += '<circle r="29" fill="' + PAL.yellow.base + '" stroke="' + PAL.yellow.dark + '" stroke-width="2"/>';
      s += chen(spiralPath(2, 19, 3), PAL.yellow, 7);
      return { svg: s, by: 88 };
    },
    tulip(c) {
      const back = deepen(c, 0.1), mid = tint(c, 0.1);
      let s = '<g transform="translate(0 76)">';
      s += petal(-19, 0, 150, 42, back, 10, 'point', 0.2);
      s += petal(19, 0, 150, 42, back, 10, 'point', 0.2);
      s += petal(-8, 0, 158, 44, mid, 10, 'point', 0.25);
      s += petal(8, 0, 158, 44, mid, 10, 'point', 0.25);
      s += petal(0, 0, 164, 46, c, 11, 'point', 0.3);
      s += '</g>';
      return { svg: s, by: 80 };
    },
    bloom(c) {
      const c2 = tint(c, 0.25), c3 = tint(c, 0.45), d = deepen(c, 0.06); let s = '';
      for (let i = 0; i < 8; i++) s += petal(i * 45, 12, 90, 40, d, 10);
      for (let i = 0; i < 8; i++) s += petal(i * 45 + 22.5, 8, 70, 34, c, 10);
      for (let i = 0; i < 6; i++) s += petal(i * 60 + 10, 4, 48, 26, c2, 9);
      for (let i = 0; i < 5; i++) s += petal(i * 72 + 30, 0, 28, 18, c3, 7);
      for (let i = 0; i < 6; i++) s += bead(Math.cos(i * 1.047) * 11, Math.sin(i * 1.047) * 11, 6.5);
      s += bead(0, 0, 8);
      return { svg: s, by: 90 };
    },
    blossom(c) {
      let s = '';
      for (let i = 0; i < 5; i++) s += petal(i * 72, 12, 80, 44, c, 11, 'round', 0.3);
      s += '<circle r="19" fill="' + GOLD.light + '" stroke="' + GOLD.dark + '" stroke-width="1.6"/>';
      for (let i = 0; i < 5; i++) s += bead(Math.cos(i * 1.2566) * 11, Math.sin(i * 1.2566) * 11, 5);
      s += bead(0, 0, 5.5);
      return { svg: s, by: 84 };
    }
  };

  /* leaves, stems, small decorations */
  function leaf(x, y, a, L, W, c) {
    const p = loopPoint(L, W);
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(a) + ')"><path d="' + p + '" fill="' + c.base + '"/>' +
      chen(p, c, Math.max(5, W * 0.22)) +
      '<path d="M0 ' + f(-L * 0.08) + 'L0 ' + f(-L * 0.82) + '" stroke="' + c.dark + '" stroke-width="2.2" stroke-linecap="round" opacity=".55" fill="none"/></g>';
  }
  function stem(x0, y0, x1, y1, bend, w) {
    return chen('M' + f(x0) + ' ' + f(y0) + 'Q' + f((x0 + x1) / 2 + bend) + ' ' + f((y0 + y1) / 2) + ' ' + f(x1) + ' ' + f(y1), PAL.sage, w || 6);
  }
  function star(x, y, s, col, op) {
    return '<path transform="translate(' + f(x) + ' ' + f(y) + ')" d="M0 ' + f(-s) + 'Q0 0 ' + f(s) + ' 0Q0 0 0 ' + f(s) + 'Q0 0 ' + f(-s) + ' 0Q0 0 0 ' + f(-s) + 'Z" fill="' + (col || GOLD.base) + '" opacity="' + (op == null ? 0.9 : op) + '"/>';
  }
  function sprig(x, y, a, len, c1, c2, R) {
    // baby's-breath style filler: thin stem + cluster of beads
    const rad = a * Math.PI / 180, ex = x + Math.sin(rad) * len, ey = y - Math.cos(rad) * len;
    let s = chen('M' + f(x) + ' ' + f(y) + 'L' + f(ex) + ' ' + f(ey), PAL.sage, 3.2);
    for (let i = 0; i < 6; i++) {
      const bx = ex + (R() - 0.5) * 34, by = ey + (R() - 0.5) * 34;
      s += bead(bx, by, 6 + R() * 4, i % 2 ? c1 : c2);
    }
    return s;
  }
  function heartShape(w, c) {
    const d = 'M0 20C-42 -8 -26 -44 0 -20C26 -44 42 -8 0 20Z';
    return '<path d="' + d + '" fill="' + c.light + '"/>' + chen(d, c, w);
  }

  /* ------------------------------------------------------------------
     4. WRAP, RIBBON, TAG, CARD
  ------------------------------------------------------------------ */
  function wrapBack(W) {
    return '<path d="M150 500Q400 418 650 500L400 968Z" fill="' + W.c + '"' + (W.sheer ? ' fill-opacity=".55"' : '') + '/>' +
      '<path d="M150 500Q400 418 650 500Q400 452 150 500Z" fill="#fff" opacity=".22"/>';
  }
  function wrapFront(W, id, pattern) {
    const top = 'M150 500Q400 612 650 500';
    let s = '<path d="' + top + 'L400 968Z" fill="url(#' + id + 'wf)"' + (W.sheer ? ' fill-opacity=".62"' : '') + '/>';
    if (pattern === 'dots') s += '<path d="' + top + 'L400 968Z" fill="url(#' + id + 'pd)"/>';
    if (pattern === 'stripes') s += '<path d="' + top + 'L400 968Z" fill="url(#' + id + 'ps)"/>';
    s += '<path d="M400 556L650 500L400 968Z" fill="' + W.c + '" opacity=".33"/>';
    s += '<path d="M150 500L400 556L400 968Z" fill="#fff" opacity=".16"/>';
    s += '<path d="M400 556Q396 760 400 968M262 536Q340 760 400 968M538 536Q460 760 400 968" stroke="' + W.c + '" stroke-width="1.6" opacity=".4" fill="none"/>';
    s += '<path d="M150 500Q400 612 650 500Q400 644 150 500Z" fill="#fff" opacity=".26"/>';
    s += '<path d="' + top + '" stroke="' + GOLD.base + '" stroke-width="3" fill="none"/>';
    return s;
  }
  function bow(id, x, y, s) {
    const loopL = 'M0 0C-60 -70 -150 -50 -138 4C-128 44 -48 22 0 0Z';
    const tailL = 'M-8 6L-50 96L-26 86L-34 114L4 14Z';
    const half = '<path d="' + tailL + '" fill="url(#' + id + 'rb)" stroke="' + 'rgba(0,0,0,.15)' + '" stroke-width="1.2"/>' +
      '<path d="' + loopL + '" fill="url(#' + id + 'rb)" stroke="rgba(0,0,0,.15)" stroke-width="1.4"/>' +
      '<path d="M-14 -4C-60 -44 -110 -34 -114 -2" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>';
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')">' + half +
      '<g transform="scale(-1 1)">' + half + '</g>' +
      '<ellipse rx="19" ry="16" fill="url(#' + id + 'rb)" stroke="rgba(0,0,0,.2)" stroke-width="1.4"/>' +
      '<ellipse cx="-5" cy="-5" rx="6" ry="4" fill="#fff" opacity=".45"/></g>';
  }
  function ribbonBand(id, y) {
    const hw = 250 * (968 - y) / 468, l = 400 - hw, r = 400 + hw;
    return '<path d="M' + f(l) + ' ' + f(y - 14) + 'Q400 ' + f(y + 30) + ' ' + f(r) + ' ' + f(y - 14) + 'L' + f(r) + ' ' + f(y + 14) +
      'Q400 ' + f(y + 58) + ' ' + f(l) + ' ' + f(y + 14) + 'Z" fill="url(#' + id + 'rb)" stroke="rgba(0,0,0,.12)" stroke-width="1.2"/>';
  }
  function wrapLines(text, max) {
    const words = String(text).trim().split(/\s+/), lines = []; let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines.slice(0, 4);
  }
  function tagSVG(x, y, rot, name, squiggle) {
    const w = 200, h = 92, fs = name && name.length > 9 ? 28 : 38;
    let s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<path d="M0 -70Q-8 -38 0 -8" stroke="' + GOLD.base + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<rect x="' + (-w / 2) + '" y="-8" width="' + w + '" height="' + h + '" rx="14" fill="#fffaf0" stroke="' + GOLD.base + '" stroke-width="2.5"/>' +
      '<rect x="' + (-w / 2 + 8) + '" y="0" width="' + (w - 16) + '" height="' + (h - 16) + '" rx="9" fill="none" stroke="' + GOLD.light + '" stroke-width="1.2"/>' +
      '<circle cx="0" cy="3" r="4.5" fill="' + GOLD.base + '"/>';
    if (name) s += '<text x="0" y="56" text-anchor="middle" font-family="Pinyon Script, cursive" font-size="' + fs + '" fill="#1f2d5c">' + esc(name) + '</text>';
    else if (squiggle) s += '<path d="M-58 50q10-24 20 0t20 0t20 0t20 0t20 0t20 0" stroke="#1f2d5c" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>';
    return s + '</g>';
  }
  function cardSVG(x, y, rot, msg) {
    const lines = wrapLines(msg, 17), w = 220, h = 46 + lines.length * 30;
    let s = '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' +
      '<rect x="' + (-w / 2) + '" y="0" width="' + w + '" height="' + h + '" rx="8" fill="#fffdf8" stroke="' + GOLD.base + '" stroke-width="2.2"/>' +
      '<rect x="' + (-w / 2 + 7) + '" y="7" width="' + (w - 14) + '" height="' + (h - 14) + '" rx="5" fill="none" stroke="' + GOLD.light + '" stroke-width="1"/>';
    lines.forEach((ln, i) => {
      s += '<text x="0" y="' + (38 + i * 30) + '" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-size="25" fill="#1f2d5c">' + esc(ln) + '</text>';
    });
    return s + '</g>';
  }

  /* ------------------------------------------------------------------
     5. SHARED <defs> + BACKGROUND
  ------------------------------------------------------------------ */
  function defs(id, o, W, RB) {
    const bg = o.bg || ['#ffe0f0', '#e9c8ff'];
    let s = '<defs>' +
      '<filter id="' + id + 'fz" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + bg[0] + '"/><stop offset="1" stop-color="' + bg[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'gl" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'sd"><stop offset="0" stop-color="#1b2350" stop-opacity=".30"/><stop offset="1" stop-color="#1b2350" stop-opacity="0"/></radialGradient>';
    if (W) {
      s += '<linearGradient id="' + id + 'wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + W.a + '"/><stop offset="1" stop-color="' + W.b + '"/></linearGradient>' +
        '<pattern id="' + id + 'pd" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="2.6" fill="' + GOLD.base + '" opacity=".7"/></pattern>' +
        '<pattern id="' + id + 'ps" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="2" height="22" fill="' + GOLD.base + '" opacity=".4"/></pattern>';
    }
    if (RB) s += '<linearGradient id="' + id + 'rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + RB.a + '"/><stop offset=".55" stop-color="' + RB.b + '"/><stop offset="1" stop-color="' + RB.c + '"/></linearGradient>';
    return s + '</defs>';
  }
  function background(id, o) {
    if (!o.bg) return '';
    const dark = o.dark;
    let s = '<rect width="800" height="1000" fill="url(#' + id + 'bg)"/><rect width="800" height="1000" fill="url(#' + id + 'gl)" opacity="' + (dark ? 0.25 : 0.9) + '"/>';
    if (o.arch !== false) {
      s += '<path d="M130 992V330A270 270 0 0 1 670 330V992Z" fill="#fff" fill-opacity="' + (dark ? 0.05 : 0.32) + '" stroke="' + GOLD.base + '" stroke-opacity=".75" stroke-width="2"/>' +
        '<path d="M152 992V330A248 248 0 0 1 648 330V992Z" fill="none" stroke="' + GOLD.base + '" stroke-opacity=".32" stroke-width="1.2"/>';
    }
    s += '<ellipse cx="400" cy="976" rx="210" ry="22" fill="#1b2350" opacity="' + (dark ? 0.4 : 0.14) + '"/>';
    return s;
  }
  function sparkles(o) {
    if (o.sparkles === false) return '';
    const col = o.dark ? GOLD.light : GOLD.base;
    return star(96, 170, 17, col) + star(706, 236, 24, col) + star(118, 560, 12, col, 0.7) + star(702, 648, 15, col, 0.8) +
      star(640, 96, 12, col, 0.7) + star(210, 80, 10, col, 0.6);
  }
  function confetti(R, n, cols) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 60 + R() * 680, y = 40 + R() * 520, c = cols[i % cols.length], r = 5 + R() * 7;
      s += i % 3 === 0
        ? '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(r * 1.8) + '" height="' + f(r * 0.7) + '" rx="2" fill="' + c + '" transform="rotate(' + f(R() * 180) + ' ' + f(x) + ' ' + f(y) + ')" opacity=".9"/>'
        : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r * 0.6) + '" fill="' + c + '" opacity=".85"/>';
    }
    return s;
  }
  function balloon(x, y, rx, ry, col, rot) {
    const c = PAL[col] || PAL.pink;
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + (y + ry) + ')">' +
      '<path d="M' + x + ' ' + (y + ry) + 'Q' + (x - 24) + ' ' + (y + ry + 140) + ' ' + (x + 10) + ' ' + (y + ry + 300) + '" stroke="' + GOLD.base + '" stroke-width="2" fill="none" opacity=".8"/>' +
      '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + c.base + '"/>' +
      '<ellipse cx="' + (x - rx * 0.36) + '" cy="' + (y - ry * 0.4) + '" rx="' + rx * 0.2 + '" ry="' + ry * 0.3 + '" fill="#fff" opacity=".45" transform="rotate(-25 ' + (x - rx * 0.36) + ' ' + (y - ry * 0.4) + ')"/>' +
      '<path d="M' + (x - 9) + ' ' + (y + ry + 12) + 'L' + x + ' ' + (y + ry - 2) + 'L' + (x + 9) + ' ' + (y + ry + 12) + 'Z" fill="' + c.dark + '"/></g>';
  }

  /* ------------------------------------------------------------------
     6. COMPOSITION: BOUQUET
  ------------------------------------------------------------------ */
  function svgOpen(view, label) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + view.join(' ') + '" preserveAspectRatio="xMidYMid slice" class="bv-art" role="img" aria-label="' + esc(label || 'Handmade pipe-cleaner flowers') + '">';
  }

  function bouquetSVG(opt) {
    const o = Object.assign({
      count: 9, mix: [{ t: 'rose', c: 'pink' }], color: 'pink', wrap: 'ivory', pattern: 'none',
      ribbon: 'gold', bg: ['#ffe0f0', '#e9c8ff'], seed: 1, size: 1, filler: 'white', leaves: true,
      charm: null, name: '', message: '', tagSquiggle: false, decor: '', over: '', view: [0, 0, 800, 1000],
      dark: false, label: 'Handmade pipe-cleaner bouquet'
    }, opt || {});

    const id = nid(), R = rng(o.seed), S = o.size;
    const W = WRAPS[o.wrap] || WRAPS.ivory, RB = o.ribbon ? (RIBBONS[o.ribbon] || RIBBONS.gold) : null;
    const cx = 400, cy = 355, rx = 250 * S, ry = 200 * S, N = Math.max(1, o.count | 0);

    /* — flower list — */
    const fl = [];
    for (let i = 0; i < N; i++) {
      const rad = N === 1 ? 0 : Math.sqrt((i + 0.5) / N), th = i * 2.39996 + o.seed;
      const x = cx + Math.cos(th) * rad * rx, y = cy + Math.sin(th) * rad * ry * 0.9 + rad * rad * 18;
      const spec = o.mix[i % o.mix.length], ck = spec.c === '$main' ? o.color : spec.c;
      const baseR = clamp(Math.sqrt(rx * ry / N) * 1.1 * (1.12 - 0.32 * rad), 34, 125);
      const s = baseR / 100;
      const rot = spec.t === 'tulip' ? (R() - 0.5) * 50 : R() * 360;
      const head = HEAD[spec.t](PAL[ck] || PAL.pink);
      const a = rot * Math.PI / 180;
      fl.push({ head, x, y, s, rot, rad, bx: x - Math.sin(a) * head.by * s, by: y + Math.cos(a) * head.by * s });
    }
    fl.sort((a, b) => b.rad - a.rad);

    /* — foliage — */
    let leaves = '';
    if (o.leaves) {
      const nl = 6 + Math.round(N / 4), greens = [PAL.sage, tint(PAL.sage, 0.15), deepen(PAL.sage, 0.1)];
      for (let i = 0; i < nl; i++) {
        const th = (i / nl) * Math.PI * 2 + R() * 0.4;
        const lx = cx + Math.cos(th) * rx * 0.78, ly = cy + Math.sin(th) * ry * 0.7;
        leaves += leaf(lx, ly, th * 180 / Math.PI + 90, (120 + R() * 50) * S, 30 + R() * 8, greens[i % 3]);
      }
    }
    let filler = '';
    if (o.filler) {
      const c1 = o.filler === 'gold' ? GOLD : PAL.white, c2 = o.filler === 'gold' ? tint(GOLD, 0.3) : tint(PAL.white, 0.2), nf = 4 + Math.round(N / 2);
      for (let i = 0; i < nf; i++) {
        const th = R() * Math.PI * 2, px = cx + Math.cos(th) * rx * 0.85, py = cy + Math.sin(th) * ry * 0.8;
        filler += sprig(px, py, th * 180 / Math.PI + 90, (80 + R() * 50) * S, c1, c2, R);
      }
    }
    let stems = '';
    fl.forEach((q, i) => {
      stems += stem(q.bx, q.by, 400 + (i % 5 - 2) * 9, 700, (q.bx - 400) * 0.1, 6);
    });
    let heads = '';
    fl.forEach(q => {
      heads += '<circle cx="' + f(q.x + 5 * q.s) + '" cy="' + f(q.y + 9 * q.s) + '" r="' + f(112 * q.s) + '" fill="url(#' + id + 'sd)"/>' +
        '<g transform="translate(' + f(q.x) + ' ' + f(q.y) + ') rotate(' + f(q.rot) + ') scale(' + f(q.s) + ')">' + q.head.svg + '</g>';
    });

    /* — assemble — */
    let s = svgOpen(o.view, o.label) + defs(id, o, W, RB) + background(id, o) + o.decor;
    s += '<g transform="translate(400 968) scale(' + S + ') translate(-400 -968)">';
    s += '<g filter="url(#' + id + 'fz)">' + leaves + filler + '</g>';
    s += wrapBack(W);
    s += '<g filter="url(#' + id + 'fz)">' + stems + heads + '</g>';
    s += wrapFront(W, id, o.pattern);
    if (RB) s += ribbonBand(id, 722) + bow(id, 400, 744, 1);
    if (o.charm === 'heart') {
      s += '<g transform="translate(560 214) rotate(14)">' + chen('M0 18Q-8 120 -34 214', PAL.sage, 5) + heartShape(9, PAL.red) + '</g>';
    }
    if (o.name || o.tagSquiggle) s += tagSVG(590, 722, 8, o.name, o.tagSquiggle);
    if (o.message) s += cardSVG(206, 756, -7, o.message);
    s += '</g>' + sparkles(o) + o.over + '</svg>';
    return s;
  }

  /* ------------------------------------------------------------------
     7. COMPOSITION: SINGLE LONG-STEM FLOWER
  ------------------------------------------------------------------ */
  function singleSVG(opt) {
    const o = Object.assign({
      t: 'rose', color: 'red', scale: 1.8, bg: ['#ffe0f0', '#e9c8ff'], seed: 2, buds: [], ribbon: 'gold',
      decor: '', over: '', view: [0, 0, 800, 1000], dark: false, label: 'Handmade pipe-cleaner flower'
    }, opt || {});
    const id = nid(), RB = RIBBONS[o.ribbon] || RIBBONS.gold, hx = 420, hy = 420;
    const head = HEAD[o.t](PAL[o.color] || PAL.red), baseY = hy + head.by * o.scale;
    let g = '';
    const greens = [PAL.sage, tint(PAL.sage, 0.15), deepen(PAL.sage, 0.08)];
    g += leaf(404, 900, -58, 210, 46, greens[0]) + leaf(436, 780, 54, 190, 42, greens[1]) + leaf(414, 650, -48, 150, 36, greens[2]);
    g += chen('M398 985C372 820 456 660 ' + hx + ' ' + f(baseY), PAL.sage, 13);
    let buds = '';
    (o.buds || []).forEach(b => {
      const h2 = HEAD[b.t](PAL[b.c] || PAL.pink), bx = hx + b.x, by = hy + b.y;
      g += chen('M' + (hx - 6) + ' 760Q' + f((hx + bx) / 2) + ' ' + f((760 + by) / 2) + ' ' + f(bx) + ' ' + f(by + h2.by * b.s), PAL.sage, 7);
      buds += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(112 * b.s) + '" fill="url(#' + id + 'sd)"/><g transform="translate(' + f(bx) + ' ' + f(by) + ') rotate(' + f(b.r || 0) + ') scale(' + b.s + ')">' + h2.svg + '</g>';
    });
    let s = svgOpen(o.view, o.label) + defs(id, o, WRAPS.ivory, RB) + background(id, o) + o.decor;
    s += '<g filter="url(#' + id + 'fz)">' + g + '<circle cx="' + hx + '" cy="' + (hy + 10) + '" r="' + f(112 * o.scale) + '" fill="url(#' + id + 'sd)"/>' +
      '<g transform="translate(' + hx + ' ' + hy + ') rotate(' + (o.seed * 20) + ') scale(' + o.scale + ')">' + head.svg + '</g>' + buds + '</g>';
    s += bow(id, 404, 842, 0.8);
    s += sparkles(o) + o.over + '</svg>';
    return s;
  }

  /* ------------------------------------------------------------------
     8. COMPOSITION: HEART WREATH, WORKBENCH, GIFT BOX, PROPOSAL RING
  ------------------------------------------------------------------ */
  function heartWreathSVG(opt) {
    const o = Object.assign({ bg: ['#ffdcec', '#e9b6ff'], seed: 5, view: [0, 0, 800, 1000], label: 'Heart wreath of handmade roses' }, opt || {});
    const id = nid(), R = rng(o.seed), N = 24, types = [['rose', 'red'], ['rose', 'pink'], ['blossom', 'blush'], ['rose', 'red'], ['blossom', 'pink']];
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3), hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push({ x: 400 + hx * 15.6, y: 480 - hy * 15.6, t });
    }
    let leaves = '', heads = '';
    pts.forEach((p, i) => { leaves += leaf(p.x, p.y, (R() * 360), 90 + R() * 30, 24, i % 2 ? PAL.sage : tint(PAL.sage, 0.15)); });
    pts.forEach((p, i) => {
      const sp = types[i % types.length], h = HEAD[sp[0]](PAL[sp[1]]), s = 0.42 + R() * 0.1;
      heads += '<circle cx="' + f(p.x + 3) + '" cy="' + f(p.y + 6) + '" r="' + f(112 * s) + '" fill="url(#' + id + 'sd)"/><g transform="translate(' + f(p.x) + ' ' + f(p.y) + ') rotate(' + f(R() * 360) + ') scale(' + f(s) + ')">' + h.svg + '</g>';
    });
    let s = svgOpen(o.view, o.label) + defs(id, o, WRAPS.ivory, RIBBONS.gold) + background(id, Object.assign({}, o, { arch: false }));
    s += '<g filter="url(#' + id + 'fz)">' + leaves + heads + '</g>';
    s += bow(id, 400, 760, 0.9) + star(400, 450, 40, GOLD.base, 0.9) + star(330, 400, 16) + star(472, 520, 14) + sparkles(o) + '</svg>';
    return s;
  }

  function workbenchSVG(opt) {
    const o = Object.assign({ seed: 4, view: [0, 0, 800, 1000], label: 'Making pipe-cleaner flowers' }, opt || {});
    const id = nid(), R = rng(o.seed);
    let s = svgOpen(o.view, o.label) + defs(id, { bg: ['#f4e8d6', '#e8d5bb'] }, WRAPS.ivory, RIBBONS.gold);
    s += '<rect width="800" height="1000" fill="url(#' + id + 'bg)"/>';
    // cutting-mat grid
    let grid = '';
    for (let x = 0; x <= 800; x += 50) grid += 'M' + x + ' 0V1000';
    for (let y = 0; y <= 1000; y += 50) grid += 'M0 ' + y + 'H800';
    s += '<path d="' + grid + '" stroke="' + GOLD.base + '" stroke-opacity=".18" stroke-width="1" fill="none"/>';
    const cols = ['pink', 'blue', 'white', 'purple', 'yellow', 'sage', 'peach', 'pink', 'royal'];
    let strands = '';
    cols.forEach((c, i) => {
      const y0 = 90 + i * 98 + R() * 30, a = (R() - 0.5) * 60;
      strands += chen('M-40 ' + f(y0) + 'C200 ' + f(y0 + a) + ' 420 ' + f(y0 - a) + ' 560 ' + f(y0 + a * 0.4) + 'S720 ' + f(y0 + 40) + ' 700 ' + f(y0 + 90), PAL[c], 17);
    });
    s += '<g filter="url(#' + id + 'fz)">' + strands + '</g>';
    // loose petals + a half-built daisy
    let petals = '';
    [[160, 250, 20, 'pink'], [310, 400, 130, 'pink'], [120, 640, 80, 'blue'], [300, 800, 200, 'purple'], [560, 280, 300, 'yellow']].forEach(p => {
      petals += '<g transform="translate(' + p[0] + ' ' + p[1] + ') scale(1.15)">' + petal(p[2], 0, 120, 38, PAL[p[3]], 10) + '</g>';
    });
    petals += '<g transform="translate(560 640) scale(1.1)">';
    for (let i = 0; i < 8; i++) petals += petal(i * 27 - 10, 16, 92, 15, PAL.white, 6.5, 'round', 0.35);
    petals += '<circle r="29" fill="' + PAL.yellow.base + '" stroke="' + PAL.yellow.dark + '" stroke-width="2"/>' + chen(spiralPath(2, 19, 3), PAL.yellow, 7) + '</g>';
    s += '<g filter="url(#' + id + 'fz)">' + petals + '</g>';
    // spool of gold wire
    s += '<g transform="translate(185 850)"><circle r="78" fill="' + GOLD.base + '" stroke="' + GOLD.dark + '" stroke-width="3"/>';
    for (let r = 66; r > 22; r -= 9) s += '<circle r="' + r + '" fill="none" stroke="' + GOLD.light + '" stroke-width="3" opacity=".8"/>';
    s += '<circle r="20" fill="#f4e8d6" stroke="' + GOLD.dark + '" stroke-width="3"/></g>';
    // scissors
    s += '<g transform="translate(585 790) rotate(-38) scale(.92)">' +
      '<path d="M0 0L-13 -190L9 -6Z" fill="#dfe4ee" stroke="#6c7690" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M0 0L13 -190L-9 -6Z" fill="#c9d0de" stroke="#6c7690" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M-4 10L-30 76M4 10L30 76" stroke="#1f2d5c" stroke-width="9" stroke-linecap="round"/>' +
      '<circle cx="-34" cy="100" r="28" fill="none" stroke="#1f2d5c" stroke-width="11"/><circle cx="34" cy="100" r="28" fill="none" stroke="#1f2d5c" stroke-width="11"/>' +
      '<circle r="6" fill="' + GOLD.base + '"/></g>';
    return s + sparkles({ dark: false }) + '</svg>';
  }

  function giftBoxSVG(opt) {
    const o = Object.assign({ seed: 6, view: [0, 0, 800, 1000], label: 'Gift box packaging' }, opt || {});
    const id = nid(), R = rng(o.seed);
    let s = svgOpen(o.view, o.label) + defs(id, { bg: ['#ffe6f1', '#f2c5ff'] }, WRAPS.ivory, RIBBONS.gold) + background(id, { bg: ['#ffe6f1', '#f2c5ff'], arch: false });
    // tissue paper
    s += '<path d="M200 600C190 520 250 470 300 500C330 440 420 440 440 500C490 450 580 470 590 560L600 620Z" fill="#fbd9e2" stroke="#e8aabb" stroke-width="2"/>' +
      '<path d="M240 590C260 520 330 520 360 560M470 570C500 520 560 520 580 580" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>';
    // flowers peeking out
    let heads = '';
    [['rose', 'pink', 330, 450, 0.62], ['daisy', 'white', 450, 430, 0.58], ['blossom', 'blue', 540, 500, 0.5], ['bloom', 'purple', 260, 520, 0.46]].forEach(h => {
      const hd = HEAD[h[0]](PAL[h[1]]);
      heads += '<circle cx="' + (h[2] + 3) + '" cy="' + (h[3] + 6) + '" r="' + f(112 * h[4]) + '" fill="url(#' + id + 'sd)"/><g transform="translate(' + h[2] + ' ' + h[3] + ') rotate(' + f(R() * 360) + ') scale(' + h[4] + ')">' + hd.svg + '</g>';
    });
    s += '<g filter="url(#' + id + 'fz)">' + heads + '</g>';
    // box body + lid
    s += '<rect x="190" y="590" width="420" height="320" rx="10" fill="#1f2d5c"/><rect x="190" y="590" width="420" height="320" rx="10" fill="#fff" opacity=".04"/>' +
      '<rect x="168" y="560" width="464" height="76" rx="12" fill="#2a3b78" stroke="' + GOLD.base + '" stroke-width="2.4"/>' +
      '<rect x="376" y="560" width="48" height="350" fill="url(#' + id + 'rb)"/>' +
      '<rect x="168" y="582" width="464" height="30" fill="url(#' + id + 'rb)" opacity=".0"/>';
    s += bow(id, 400, 566, 0.85);
    s += tagSVG(618, 640, 12, '', true);
    return s + star(110, 220, 20) + star(700, 330, 16) + star(660, 180, 11, GOLD.base, 0.7) + '</svg>';
  }

  function proposalSVG(opt) {
    const o = Object.assign({ seed: 3, view: [0, 0, 800, 1000], label: 'A rose and a ring' }, opt || {});
    const base = singleSVG({ t: 'rose', color: 'red', scale: 1.7, bg: ['#3b1a78', '#170a33'], dark: true, seed: 1, view: o.view, sparkles: true });
    const ring = '<g transform="translate(580 820)"><ellipse rx="66" ry="76" fill="none" stroke="' + GOLD.dark + '" stroke-width="22"/>' +
      '<ellipse rx="66" ry="76" fill="none" stroke="' + GOLD.light + '" stroke-width="14"/>' +
      '<ellipse rx="66" ry="76" fill="none" stroke="#fff" stroke-width="3" opacity=".5" transform="translate(-3 -3)"/>' +
      '<path d="M0 -112L36 -86L0 -42L-36 -86Z" fill="#eef4ff" stroke="#9fb4e0" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M-36 -86H36M0 -112L-14 -86L0 -42L14 -86Z" fill="none" stroke="#9fb4e0" stroke-width="2"/></g>' +
      star(540, 690, 22, '#fff', 0.9) + star(650, 730, 14, '#fff', 0.8);
    return base.replace('</svg>', ring + '</svg>');
  }

  /* ------------------------------------------------------------------
     9. SMALL PUBLIC HELPERS
  ------------------------------------------------------------------ */
  function flowerHeadSVG(type, colour, label) {
    const id = nid(), h = (HEAD[type] || HEAD.rose)(PAL[colour] || PAL.pink);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-124 -124 248 248" class="bv-art bv-head" role="img" aria-label="' + esc(label || (colour + ' ' + type)) + '">' +
      '<defs><filter id="' + id + 'fz" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<radialGradient id="' + id + 'sd"><stop offset="0" stop-color="#1b2350" stop-opacity=".28"/><stop offset="1" stop-color="#1b2350" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="6" cy="10" r="112" fill="url(#' + id + 'sd)"/><g filter="url(#' + id + 'fz)">' + h.svg + '</g></svg>';
  }

  /* ------------------------------------------------------------------
     10. NAMED SCENES  (used to render the placeholder JPGs & previews)
         ratio = width / height of the rendered image file
  ------------------------------------------------------------------ */
  const pastelMix = [{ t: 'rose', c: 'pink' }, { t: 'daisy', c: 'white' }, { t: 'tulip', c: 'yellow' }, { t: 'blossom', c: 'purple' }, { t: 'bloom', c: 'peach' }, { t: 'blossom', c: 'blue' }];
  const P = {
    'product-1': () => bouquetSVG({ count: 9, mix: [{ t: 'rose', c: 'blue' }, { t: 'daisy', c: 'white' }, { t: 'bloom', c: 'blue' }, { t: 'blossom', c: 'white' }], wrap: 'ivory', ribbon: 'navy', bg: ['#dfe6ff', '#c4b8ff'], seed: 3, label: 'Blue Bliss Bouquet' }),
    'product-2': () => singleSVG({ t: 'bloom', color: 'pink', scale: 1.95, bg: ['#ffe3ee', '#ffc2dc'], seed: 2, buds: [{ t: 'blossom', c: 'blush', x: -190, y: 150, s: 0.5, r: 20 }, { t: 'blossom', c: 'pink', x: 190, y: 250, s: 0.42, r: 60 }], label: 'Pink Love Bloom' }),
    'product-3': () => bouquetSVG({ count: 6, mix: [{ t: 'daisy', c: 'white' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'yellow' }], wrap: 'ivory', pattern: 'dots', ribbon: 'pink', bg: ['#fff0d0', '#ffc9a6'], seed: 8, size: 0.92, filler: 'gold', label: 'Mini Daisy Bouquet' }),
    'product-4': () => singleSVG({ t: 'rose', color: 'red', scale: 1.8, bg: ['#ffd9e8', '#f7a8d0'], seed: 1, label: 'Forever Rose' }),
    'product-5': () => bouquetSVG({ count: 15, mix: pastelMix, wrap: 'blush', ribbon: 'gold', bg: ['#efe6ff', '#ffd6ea'], seed: 11, filler: 'white', label: 'Pastel Garden' }),
    'product-6': () => bouquetSVG({ count: 8, mix: [{ t: 'rose', c: 'royal' }, { t: 'bloom', c: 'royal' }, { t: 'daisy', c: 'white' }, { t: 'rose', c: 'navy' }], wrap: 'navy', ribbon: 'gold', bg: ['#d8d4ff', '#a99bf0'], seed: 5, filler: 'gold', label: 'Royal Blue Bloom' }),
    'product-7': () => bouquetSVG({ count: 12, mix: [{ t: 'rose', c: 'red' }, { t: 'rose', c: 'pink' }, { t: 'blossom', c: 'blush' }], wrap: 'blush', ribbon: 'pink', charm: 'heart', bg: ['#ffdcec', '#e9b6ff'], seed: 9, label: 'Sweetheart Bouquet' }),
    'product-8': () => bouquetSVG({ count: 10, mix: pastelMix, wrap: 'ivory', pattern: 'dots', ribbon: 'gold', tagSquiggle: true, bg: ['#ffeadb', '#ffc7dc'], seed: 14, label: 'Custom Name Bouquet' }),
    'hero-flower': () => bouquetSVG({ count: 12, mix: [{ t: 'rose', c: 'pink' }, { t: 'daisy', c: 'white' }, { t: 'rose', c: 'blue' }, { t: 'blossom', c: 'blush' }], wrap: 'ivory', ribbon: 'gold', bg: ['#ffeef8', '#e4d2ff'], seed: 21, label: 'BLOOM by Vish signature bouquet' }),

    'occasion-birthday': () => bouquetSVG({ count: 7, mix: pastelMix, wrap: 'ivory', pattern: 'dots', ribbon: 'pink', bg: ['#ffe8f4', '#ffd0b8'], seed: 31, decor: balloon(150, 300, 62, 78, 'pink', -8) + balloon(660, 250, 58, 74, 'blue', 9) + confetti(rng(2), 26, ['#f0a1b8', '#d4b068', '#6d91dc', '#f5cf65', '#a58bd8']), label: 'Birthday' }),
    'occasion-anniversary': () => bouquetSVG({ count: 9, mix: [{ t: 'rose', c: 'red' }, { t: 'rose', c: 'pink' }, { t: 'bloom', c: 'blush' }], wrap: 'ivory', ribbon: 'gold', bg: ['#3b1a78', '#170a33'], dark: true, seed: 12, filler: 'gold', label: 'Anniversary' }),
    'occasion-valentine': () => heartWreathSVG({ seed: 5 }),
    'occasion-friendship': () => bouquetSVG({ count: 8, mix: [{ t: 'daisy', c: 'yellow' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'peach' }], wrap: 'ivory', pattern: 'dots', ribbon: 'gold', bg: ['#fff0d0', '#ffb98f'], seed: 17, filler: 'gold', label: 'Friendship' }),
    'occasion-wedding': () => bouquetSVG({ count: 10, mix: [{ t: 'rose', c: 'white' }, { t: 'bloom', c: 'white' }, { t: 'blossom', c: 'blush' }], wrap: 'sheer', ribbon: 'white', bg: ['#fff4fb', '#e3d6f7'], seed: 23, filler: 'gold', label: 'Wedding' }),
    'occasion-proposal': () => proposalSVG(),
    'occasion-thanks': () => bouquetSVG({ count: 6, mix: [{ t: 'bloom', c: 'peach' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'yellow' }], wrap: 'kraft', ribbon: 'white', tagSquiggle: true, bg: ['#ffe9dc', '#ffbfa0'], seed: 27, size: 0.94, label: 'Thank You' }),
    'occasion-justbecause': () => bouquetSVG({ count: 11, mix: pastelMix, wrap: 'sheer', ribbon: 'pink', bg: ['#e6dcff', '#ffd1e6'], seed: 33, decor: confetti(rng(8), 20, ['#f0a1b8', '#a58bd8', '#f5cf65', '#6d91dc']), label: 'Just Because' }),

    'gallery-1': () => bouquetSVG({ count: 15, mix: pastelMix, wrap: 'blush', ribbon: 'gold', bg: ['#efe6ff', '#ffd6ea'], seed: 11, view: [190, 140, 420, 420], arch: false, label: 'Close-up of handmade petals' }),
    'gallery-2': () => P['product-1'](),
    'gallery-3': () => workbenchSVG({ seed: 4 }),
    'gallery-4': () => giftBoxSVG({ view: [0, 170, 800, 800] }),
    'gallery-5': () => bouquetSVG({ count: 12, mix: [{ t: 'rose', c: 'red' }, { t: 'rose', c: 'pink' }, { t: 'blossom', c: 'blush' }], wrap: 'blush', ribbon: 'pink', message: 'Happy Birthday!', bg: ['#ffdcec', '#e9b6ff'], seed: 9, label: 'A customer order' }),
    'gallery-6': () => bouquetSVG({ count: 10, mix: pastelMix, wrap: 'ivory', pattern: 'dots', ribbon: 'gold', name: 'Aanya', bg: ['#ffeadb', '#ffc7dc'], seed: 14, label: 'A custom name bouquet' }),
    'gallery-7': () => bouquetSVG({ count: 8, mix: [{ t: 'rose', c: 'royal' }, { t: 'bloom', c: 'royal' }, { t: 'daisy', c: 'white' }, { t: 'rose', c: 'navy' }], wrap: 'navy', ribbon: 'gold', bg: ['#d8d4ff', '#a99bf0'], seed: 5, view: [100, 170, 600, 450], arch: false, label: 'Royal blue blooms, close up' }),
    'gallery-8': () => bouquetSVG({ count: 6, mix: [{ t: 'daisy', c: 'white' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'yellow' }], wrap: 'ivory', pattern: 'dots', ribbon: 'pink', bg: ['#fff0d0', '#ffc9a6'], seed: 8, size: 0.92, filler: 'gold', view: [120, 20, 560, 840], label: 'Mini daisy bouquet' }),
    'gallery-9': () => bouquetSVG({ count: 6, mix: [{ t: 'daisy', c: 'white' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'yellow' }], wrap: 'ivory', ribbon: 'pink', bg: ['#fff0d0', '#ffc9a6'], seed: 8, size: 0.92, view: [230, 170, 360, 360], arch: false, label: 'Daisy petals close up' }),
    'gallery-10': () => workbenchSVG({ seed: 9, view: [0, 100, 800, 800] }),
    'gallery-11': () => P['product-5'](),
    'gallery-12': () => heartWreathSVG({ seed: 7, view: [0, 180, 800, 600] }),

    'social-1': () => heartWreathSVG({ seed: 5, view: [0, 100, 800, 800] }),
    'social-2': () => bouquetSVG({ count: 6, mix: [{ t: 'daisy', c: 'white' }, { t: 'daisy', c: 'white' }, { t: 'blossom', c: 'yellow' }], wrap: 'ivory', ribbon: 'pink', bg: ['#fff0d0', '#ffc9a6'], seed: 8, size: 0.92, view: [80, 120, 640, 640], label: 'Mini daisies' }),
    'social-3': () => workbenchSVG({ seed: 4, view: [0, 100, 800, 800] }),
    'social-4': () => bouquetSVG({ count: 15, mix: pastelMix, wrap: 'blush', ribbon: 'gold', bg: ['#efe6ff', '#ffd6ea'], seed: 11, view: [100, 120, 600, 600], label: 'Pastel garden' }),
    'social-5': () => bouquetSVG({ count: 8, mix: [{ t: 'rose', c: 'royal' }, { t: 'bloom', c: 'royal' }, { t: 'daisy', c: 'white' }, { t: 'rose', c: 'navy' }], wrap: 'navy', ribbon: 'gold', bg: ['#d8d4ff', '#a99bf0'], seed: 5, view: [100, 150, 600, 600], label: 'Royal blue bloom' }),
    'social-6': () => giftBoxSVG({ view: [0, 150, 800, 800] }),

    'about-1': () => workbenchSVG({ seed: 12 }),
    'about-2': () => bouquetSVG({ count: 11, mix: pastelMix, wrap: 'sheer', ribbon: 'gold', bg: ['#e6dcff', '#ffd1e6'], seed: 33, label: 'A BLOOM by Vish bouquet' })
  };

  /* sizes of the rendered placeholder files (width × height in px) */
  const SIZES = {
    'gallery-1': [900, 900], 'gallery-3': [900, 1350], 'gallery-4': [900, 900], 'gallery-6': [900, 1200], 'gallery-7': [900, 675],
    'gallery-8': [900, 1350], 'gallery-9': [900, 900], 'gallery-10': [900, 900], 'gallery-12': [900, 675], 'gallery-5': [900, 1125]
  };
  ['social-1', 'social-2', 'social-3', 'social-4', 'social-5', 'social-6'].forEach(k => { SIZES[k] = [900, 900]; });
  SIZES['about-1'] = [900, 1125]; SIZES['about-2'] = [900, 1125];

  const SCENES = {};
  Object.keys(P).forEach(k => { SCENES[k] = { make: P[k], size: SIZES[k] || [900, 1125] }; });

  global.BloomArt = {
    PALETTE: PAL, WRAPS: WRAPS, RIBBONS: RIBBONS,
    bouquetSVG: bouquetSVG, singleSVG: singleSVG, flowerHeadSVG: flowerHeadSVG,
    heartWreathSVG: heartWreathSVG, tagSVG: tagSVG, cardSVG: cardSVG,
    SCENES: SCENES,
    sceneSVG: function (id) { return SCENES[id] ? SCENES[id].make() : ''; }
  };
})(window);
