/* =====================================================================
   BLOOM by Vish — script.js
   ---------------------------------------------------------------------
   Everything is plain JavaScript + GSAP. There is no backend: the cart,
   wishlist and orders live in localStorage.

   QUICK EDIT GUIDE (search for these headings in this file)
     ① CONFIG          — WhatsApp number, e-mail, Instagram, delivery, payments
     ② PRODUCTS        — your catalogue: names, prices, images, colours, sizes
     ③ CONFIGURATOR    — prices for the "Create Your Own Bloom" builder
     ④ PAYMENT GATEWAY — the one place to plug in Razorpay / Stripe / etc.

   FILE MAP
     01 Config & data           08 Checkout
     02 Helpers                 09 Configurator
     03 Store (cart/wishlist)   10 Gallery + lightbox
     04 Overlays                11 Reviews slider
     05 Product grid + search   12 Contact form
     06 Cart & wishlist UI      13 Animations (GSAP)
     07 Product modal (3D)      14 Boot
   ===================================================================== */
(function () {
  'use strict';

  /* ===================================================================
     01 · CONFIG & DATA
  =================================================================== */

  /* ① CONFIG ------------------------------------------------------- */
  const CONFIG = {
    storeName: 'BLOOM by Vish',
    currency: '₹',
    locale: 'en-IN',

    /* WhatsApp number in international format, digits only, no "+".
       Example India: '919876543210'.  Leave '' to let the customer pick a
       contact (the WhatsApp buttons still work). */
    whatsappNumber: '',

    /* Shown on the site and used for "Send by Email". Leave '' until you have one. */
    email: '',

    instagram: 'https://www.instagram.com/bloombyvish',

    /* Optional: paste a Formspree / Getform / your own endpoint here and the
       custom-request form will POST its data there as JSON. */
    formEndpoint: '',

    /* Ratings in PRODUCTS are sample values. Review counts are hidden until
       you have real ones — set to true to show them. */
    showReviewCounts: false,

    /* Delivery methods. freeOver: subtotal above which this option is free. */
    shipping: [
      { id: 'standard', name: 'Standard delivery', note: 'Arrives in 4–6 working days', fee: 99,  freeOver: 2000 },
      { id: 'express',  name: 'Express delivery',  note: 'Arrives in 1–2 working days (select cities)', fee: 199, freeOver: null }
    ],
    freeShippingThreshold: 2000,

    /* Payment methods shown at checkout (UI only until a gateway is connected) */
    payments: [
      { id: 'upi',  name: 'UPI',                  note: 'GPay, PhonePe, Paytm and more', hint: 'You will complete the UPI payment securely once a payment gateway is connected.' },
      { id: 'card', name: 'Credit / Debit card',  note: 'Visa, Mastercard, RuPay',        hint: 'Card details are entered on the gateway\'s secure page — never stored on this site.' },
      { id: 'cod',  name: 'Pay on delivery / confirm on WhatsApp', note: 'We will confirm your order with you directly', hint: 'We will message you to confirm the details and payment before we start crafting.' }
    ]
  };

  /* Occasion keys → labels (used by the Collections cards and shop filter) */
  const OCCASIONS = {
    birthday: 'Birthday', anniversary: 'Anniversary', valentine: "Valentine's Day", friendship: 'Friendship',
    wedding: 'Wedding', proposal: 'Proposal', thanks: 'Thank You', justbecause: 'Just Because'
  };

  /* Colour name → swatch hex (matches the artwork palette in art.js) */
  const COLOR_HEX = {
    Pink: '#f0a1b8', Blush: '#f8cdd8', Red: '#d9475f', Blue: '#6d91dc', Royal: '#2f4aa8', Navy: '#1f2d5c',
    White: '#fbf6ec', Purple: '#a58bd8', Yellow: '#f5cf65', Peach: '#f6b496', Sage: '#86b08a', Pastel: '#e9c7e5'
  };

  /* ② PRODUCTS ----------------------------------------------------- */
  /* Each product:
       id        unique, no spaces
       name, short (card text), long (modal text)
       price     base price in rupees      rating  sample rating (0–5)
       category  'bouquet' | 'single' | 'mini' | 'custom'  (matches the shop filter chips)
       occasions keys from OCCASIONS above
       image     path in assets/images/    images360  optional array of frames (see README)
       colors    names from COLOR_HEX      sizes  [{id,name,add}]  add = extra rupees
       customName  true → shows a "Name on tag" field in the product window
       colorImages optional { ColourName: 'path.jpg' } → the photo changes when a colour is picked  */
  const SIZE_SETS = {
    bouquet: [{ id: 'petite', name: 'Petite', add: 0 }, { id: 'classic', name: 'Classic', add: 300 }, { id: 'grand', name: 'Grand', add: 700 }],
    single:  [{ id: 'standard', name: 'Standard', add: 0 }, { id: 'long', name: 'Long stem', add: 80 }],
    mini:    [{ id: 'small', name: 'Small', add: 0 }, { id: 'medium', name: 'Medium', add: 150 }],
    custom:  [{ id: 'classic', name: 'Classic', add: 0 }, { id: 'grand', name: 'Grand', add: 400 }]
  };

  const PRODUCTS = [
    { id: 'blue-bliss', name: 'Blue Bliss Bouquet', price: 1299, rating: 4.9, category: 'bouquet', badge: 'Signature',
      short: 'Sky-blue roses and ivory daisies in ivory wrapping with a navy bow.',
      long: 'A calm, dreamy bouquet of hand-shaped blue roses and ivory daisies, layered with leaves and tiny gold-bead sprigs. Wrapped in ivory paper and finished with a navy ribbon — a gift that feels like a deep breath.',
      occasions: ['birthday', 'friendship', 'thanks', 'justbecause', 'anniversary'], image: 'assets/images/product-1.jpg',
      colors: ['Blue', 'Royal', 'Pink', 'White'], sizes: SIZE_SETS.bouquet },
    { id: 'pink-love', name: 'Pink Love Bloom', price: 449, rating: 4.8, category: 'single', badge: 'New',
      short: 'One oversized blush-pink bloom on a long stem, with two tiny buds.',
      long: 'A single statement flower — a generous, many-petalled pink bloom with two little buds on the stem. Perfect when you want a small gesture that still feels special.',
      occasions: ['valentine', 'justbecause', 'birthday'], image: 'assets/images/product-2.jpg',
      colors: ['Pink', 'Blush', 'Purple', 'Peach'], sizes: SIZE_SETS.single },
    { id: 'mini-daisy', name: 'Mini Daisy Bouquet', price: 699, rating: 4.9, category: 'mini', badge: 'Mini',
      short: 'Cheerful white daisies with golden hearts in a pocket-sized bouquet.',
      long: 'A little bunch of happiness: white pipe-cleaner daisies with golden centres and tiny yellow blooms, wrapped in dotted ivory paper with a pink ribbon. Small in size, big on smiles.',
      occasions: ['friendship', 'thanks', 'justbecause', 'birthday'], image: 'assets/images/product-3.jpg',
      colors: ['White', 'Yellow', 'Pink', 'Blue'], sizes: SIZE_SETS.mini },
    { id: 'forever-rose', name: 'Forever Rose', price: 349, rating: 5.0, category: 'single', badge: 'Classic',
      short: 'One classic red rose, shaped petal by petal. It will never wilt.',
      long: 'The timeless red rose, reimagined in soft chenille. Every petal is bent and layered by hand, and it never needs water, sunlight or replacing — a flower that lasts as long as the feeling.',
      occasions: ['valentine', 'anniversary', 'proposal'], image: 'assets/images/product-4.jpg',
      colors: ['Red', 'Pink', 'White', 'Blue'], sizes: SIZE_SETS.single },
    { id: 'pastel-garden', name: 'Pastel Garden', price: 1799, rating: 4.9, category: 'bouquet', badge: 'Large',
      short: 'Roses, daisies, tulips and blossoms in soft pastel colours.',
      long: 'Our fullest bouquet: a mixed garden of roses, daisies, tulips and five-petal blossoms in soft pastels, wrapped in blush paper and tied with gold. Generous, joyful and impossible to ignore.',
      occasions: ['birthday', 'wedding', 'justbecause', 'thanks'], image: 'assets/images/product-5.jpg',
      colors: ['Pastel', 'Pink', 'Blue', 'Purple'], sizes: SIZE_SETS.bouquet },
    { id: 'royal-blue', name: 'Royal Blue Bloom', price: 1499, rating: 4.8, category: 'bouquet', badge: 'Royal',
      short: 'Deep royal and navy blooms with white daisies, wrapped in navy and gold.',
      long: 'Bold and elegant: royal and navy roses with crisp white daisies and gold-bead filler, wrapped in deep navy with a gold ribbon. A statement bouquet with real presence.',
      occasions: ['anniversary', 'birthday', 'wedding'], image: 'assets/images/product-6.jpg',
      colors: ['Royal', 'Navy', 'Blue', 'White'], sizes: SIZE_SETS.bouquet },
    { id: 'sweetheart', name: 'Sweetheart Bouquet', price: 1599, rating: 4.9, category: 'bouquet', badge: 'Gift pick',
      short: 'Red and pink roses with a handmade heart charm.',
      long: 'Red and pink roses with soft blush blossoms, a little handmade heart charm tucked in on a stem, and a pink ribbon. Made for the moments when "I love you" needs more than words.',
      occasions: ['valentine', 'anniversary', 'proposal'], image: 'assets/images/product-7.jpg',
      colors: ['Red', 'Pink', 'Blush', 'White'], sizes: SIZE_SETS.bouquet },
    { id: 'custom-name', name: 'Custom Name Bouquet', price: 1899, rating: 5.0, category: 'custom', badge: 'Personalised', customName: true,
      short: 'Your choice of blooms with a hand-lettered name tag.',
      long: 'A bouquet made around one person: choose the colours, and we add a hand-lettered name tag to the ribbon. The most personal way to say "this was made for you".',
      occasions: ['birthday', 'anniversary', 'wedding', 'friendship', 'thanks', 'justbecause', 'valentine', 'proposal'], image: 'assets/images/product-8.jpg',
      colors: ['Pastel', 'Pink', 'Blue', 'White', 'Purple'], sizes: SIZE_SETS.custom }
  ];

  /* ③ CONFIGURATOR OPTIONS ----------------------------------------- */
  const CFG = {
    flowers: [
      { id: 'rose',  name: 'Rose',         price: 129, art: 'rose'  },
      { id: 'daisy', name: 'Daisy',        price: 99,  art: 'daisy' },
      { id: 'tulip', name: 'Tulip',        price: 119, art: 'tulip' },
      { id: 'bloom', name: 'Custom Bloom', price: 159, art: 'bloom' }
    ],
    colors: [
      { id: 'pink', name: 'Pink' }, { id: 'blue', name: 'Blue' }, { id: 'white', name: 'White' },
      { id: 'purple', name: 'Purple' }, { id: 'yellow', name: 'Yellow' }, { id: 'red', name: 'Red' }
    ],
    colorBg: {
      pink: ['#fdeaf0', '#f8cdda'], blue: ['#e8f0fc', '#cfdcf4'], white: ['#f7f0e6', '#eadfcf'],
      purple: ['#f1ebfb', '#ddd0f3'], yellow: ['#fff8de', '#fdeab0'], red: ['#fde9ee', '#f5c6d3']
    },
    sizes: [
      { id: 'mini',    name: 'Mini',    add: 0,   scale: 0.88 },
      { id: 'classic', name: 'Classic', add: 250, scale: 1 },
      { id: 'grand',   name: 'Grand',   add: 550, scale: 1.1 }
    ],
    wraps: [
      { id: 'ivory', name: 'Ivory', add: 0 }, { id: 'blush', name: 'Blush', add: 0 }, { id: 'kraft', name: 'Kraft', add: 0 },
      { id: 'navy', name: 'Navy', add: 60 }, { id: 'sheer', name: 'Sheer', add: 80 }
    ],
    ribbons: [
      { id: 'none', name: 'None', add: 0 }, { id: 'gold', name: 'Gold', add: 30 }, { id: 'pink', name: 'Pink', add: 30 },
      { id: 'navy', name: 'Navy', add: 30 }, { id: 'white', name: 'White', add: 30 }
    ],
    nameTag: 59,       // price of the name tag
    messageCard: 49,   // price of the message card
    minQty: 1, maxQty: 25
  };

  /* ===================================================================
     02 · HELPERS
  =================================================================== */
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = n => CONFIG.currency + Math.round(n).toLocaleString(CONFIG.locale);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const icon = (name, cls) => '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const byId = id => PRODUCTS.find(p => p.id === id);
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* localStorage wrapper — never throws (private mode, blocked storage…) */
  const storage = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }
  };
  const KEYS = { cart: 'bv_cart_v1', wish: 'bv_wishlist_v1', orders: 'bv_orders_v1', requests: 'bv_requests_v1' };

  let lenis = null;           // smooth-scroll instance (set in section 13)
  let gsapOK = false;         // true once GSAP animations are running

  /* Star rating markup */
  function starsHTML(n, total) {
    let s = '';
    for (let i = 1; i <= (total || 5); i++) s += '<svg class="ic' + (i <= Math.round(n) ? '' : ' off') + '" aria-hidden="true"><use href="#i-star"/></svg>';
    return s;
  }

  /* Toast notifications */
  function toast(message, type) {
    const box = $('#toasts'); if (!box) return;
    while (box.children.length >= 3) box.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    t.setAttribute('role', type === 'error' ? 'alert' : 'status');
    t.innerHTML = '<span class="toast__icon">' + icon(type === 'error' ? 'x' : 'check') + '</span><span>' + esc(message) + '</span>';
    box.appendChild(t);
    const kill = () => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 450); };
    setTimeout(kill, 3200);
    t.addEventListener('click', kill);
  }

  /* WhatsApp / e-mail helpers */
  function waLink(text) {
    const num = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    return 'https://wa.me/' + num + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function mailLink(subject, body) {
    return 'mailto:' + (CONFIG.email || '') + '?subject=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || '');
  }
  function openExternal(url) { window.open(url, '_blank', 'noopener'); }

  /* ===================================================================
     03 · STORE (cart + wishlist, persisted in localStorage)
  =================================================================== */
  const Store = {
    cart: [],
    wish: [],

    load() {
      const cart = storage.get(KEYS.cart, []);
      // drop anything that refers to a product that no longer exists
      this.cart = Array.isArray(cart) ? cart.filter(l => l && l.qty > 0 && (l.custom || byId(l.id))) : [];
      const wish = storage.get(KEYS.wish, []);
      this.wish = Array.isArray(wish) ? wish.filter(id => byId(id)) : [];
    },
    save() { storage.set(KEYS.cart, this.cart); storage.set(KEYS.wish, this.wish); },

    /* ---- cart ---- */
    lineKey(id, color, size, tag) { return [id, color, size, (tag || '').toLowerCase()].join('|'); },
    unit(line) {
      if (line.custom) return line.price;
      const p = byId(line.id); if (!p) return 0;
      const s = p.sizes.find(x => x.id === line.size) || p.sizes[0];
      return p.price + s.add;
    },
    count() { return this.cart.reduce((n, l) => n + l.qty, 0); },
    subtotal() { return this.cart.reduce((n, l) => n + this.unit(l) * l.qty, 0); },
    addProduct(id, opts) {
      const p = byId(id); if (!p) return null;
      opts = opts || {};
      const color = opts.color || p.colors[0], size = opts.size || p.sizes[0].id, tag = p.customName ? (opts.tag || '') : '';
      const key = this.lineKey(id, color, size, tag), qty = clamp(opts.qty || 1, 1, 99);
      const found = this.cart.find(l => l.key === key);
      if (found) found.qty = Math.min(99, found.qty + qty);
      else this.cart.push({ key, id, qty, color, size, tag });
      this.save(); return p;
    },
    addCustom(config, price) {
      this.cart.push({ key: 'custom|' + Date.now(), id: 'custom', custom: config, price, qty: 1 });
      this.save();
    },
    setQty(key, qty) {
      const l = this.cart.find(x => x.key === key); if (!l) return;
      if (qty <= 0) return this.remove(key);
      l.qty = Math.min(99, qty); this.save();
    },
    remove(key) { this.cart = this.cart.filter(l => l.key !== key); this.save(); },
    clear() { this.cart = []; this.save(); },

    /* ---- wishlist ---- */
    has(id) { return this.wish.includes(id); },
    toggleWish(id) {
      if (this.has(id)) this.wish = this.wish.filter(x => x !== id); else this.wish.push(id);
      this.save(); return this.has(id);
    }
  };

  /* Describe a cart line for display (name, meta text, thumbnail markup) */
  function describeLine(line) {
    if (line.custom) {
      const c = line.custom;
      const f = CFG.flowers.find(x => x.id === c.flower), col = CFG.colors.find(x => x.id === c.color);
      const bits = [c.qty + ' × ' + col.name + ' ' + f.name + (c.qty > 1 ? 's' : ''), c.size.name, c.wrap.name + ' wrap'];
      if (c.ribbon.id !== 'none') bits.push(c.ribbon.name + ' ribbon');
      if (c.name) bits.push('Tag: “' + c.name + '”');
      if (c.message) bits.push('Card: “' + c.message + '”');
      return { name: 'Custom Bouquet', meta: bits.join(' · '), thumb: configToSVG(c), plain: 'Custom Bouquet (' + bits.join(', ') + ')' };
    }
    const p = byId(line.id), s = p.sizes.find(x => x.id === line.size) || p.sizes[0];
    const bits = [line.color, s.name]; if (line.tag) bits.push('Tag: “' + line.tag + '”');
    return { name: p.name, meta: bits.join(' · '), thumb: '<img src="' + esc(p.image) + '" alt="" width="84" height="100">', plain: p.name + ' (' + bits.join(', ') + ')' };
  }

  /* ===================================================================
     04 · OVERLAYS (drawers, modals, search, lightbox, mobile menu)
  =================================================================== */
  const Overlay = (function () {
    const stack = [], focusMemo = new WeakMap(), backdrop = $('#backdrop');
    const needsBackdrop = el => el.classList.contains('drawer') || el.classList.contains('search-overlay');
    const focusables = el => $$('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(n => n.offsetParent !== null || n === document.activeElement);

    function lock(on) {
      document.documentElement.classList.toggle('is-locked', on);
      if (lenis) { on ? lenis.stop() : lenis.start(); }
    }
    function open(el) {
      if (!el || el.classList.contains('is-open')) return;
      closeMenu();
      focusMemo.set(el, document.activeElement);
      el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
      if (needsBackdrop(el)) backdrop.classList.add('is-open');
      stack.push(el); lock(true);
      setTimeout(() => { const t = $('[data-autofocus]', el) || focusables(el)[0]; if (t) t.focus({ preventScroll: true }); }, 380);
    }
    function close(el) {
      if (!el || !el.classList.contains('is-open')) return;
      el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
      const i = stack.indexOf(el); if (i > -1) stack.splice(i, 1);
      if (!stack.some(needsBackdrop)) backdrop.classList.remove('is-open');
      if (!stack.length) lock(false);
      const back = focusMemo.get(el); if (back && back.focus) { try { back.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
    function closeAll() { stack.slice().forEach(close); }
    function top() { return stack[stack.length - 1]; }

    backdrop.addEventListener('click', () => { const t = top(); if (t && needsBackdrop(t)) close(t); });
    document.addEventListener('click', e => {
      const c = e.target.closest('[data-close]');
      if (c) { const ov = c.closest('.drawer, .modal, .search-overlay, .lightbox'); if (ov) close(ov); }
      if (e.target.classList && (e.target.classList.contains('modal') || e.target.classList.contains('lightbox'))) close(e.target);
    });
    document.addEventListener('keydown', e => {
      const t = top();
      if (e.key === 'Escape') { if (t) close(t); else closeMenu(); }
      if (e.key === 'Tab' && t) {                       // keep keyboard focus inside the open overlay
        const f = focusables(t); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return { open, close, closeAll, top, isOpen: el => el.classList.contains('is-open'), any: () => stack.length > 0 };
  })();

  /* Mobile menu */
  const menuBtn = $('#menuToggle'), menuEl = $('#mobileMenu');
  function openMenu() {
    menuEl.classList.add('is-open'); menuBtn.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu'); menuEl.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked'); if (lenis) lenis.stop();
  }
  function closeMenu() {
    if (!menuEl.classList.contains('is-open')) return;
    menuEl.classList.remove('is-open'); menuBtn.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); menuEl.setAttribute('aria-hidden', 'true');
    if (!Overlay.any()) { document.documentElement.classList.remove('is-locked'); if (lenis) lenis.start(); }
  }
  menuBtn.addEventListener('click', () => menuEl.classList.contains('is-open') ? closeMenu() : openMenu());
  window.addEventListener('resize', () => { if (window.innerWidth > 991) closeMenu(); });

  /* ===================================================================
     05 · PRODUCT GRID + FILTERS + SEARCH
  =================================================================== */
  const grid = $('#productGrid');
  const shopState = { cat: 'all', occasion: null, q: '', sort: 'featured' };

  function haystack(p) {
    return [p.name, p.short, p.long, p.category, p.badge || '', p.colors.join(' '), p.occasions.map(o => OCCASIONS[o]).join(' ')].join(' ').toLowerCase();
  }
  function matchesQuery(p, q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return true;
    const h = haystack(p); return terms.every(t => h.includes(t));
  }
  function visibleProducts() {
    let list = PRODUCTS.filter(p =>
      (shopState.cat === 'all' || p.category === shopState.cat) &&
      (!shopState.occasion || p.occasions.includes(shopState.occasion)) &&
      matchesQuery(p, shopState.q));
    if (shopState.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (shopState.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (shopState.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }
  function ratingHTML(p) {
    return '<span class="rating" aria-label="Rated ' + p.rating.toFixed(1) + ' out of 5">' + icon('star') + p.rating.toFixed(1) +
      (CONFIG.showReviewCounts && p.reviews ? ' <small>(' + p.reviews + ')</small>' : '') + '</span>';
  }
  function cardHTML(p) {
    const wished = Store.has(p.id);
    return '<article class="product-card" data-id="' + p.id + '">' +
      '<div class="product-card__media" data-open="' + p.id + '" data-cursor="View">' +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + ' — handmade pipe-cleaner flowers" loading="lazy" width="900" height="1125">' +
        (p.badge ? '<span class="product-card__badge">' + esc(p.badge) + '</span>' : '') +
        '<button type="button" class="wish-btn' + (wished ? ' is-active' : '') + '" data-wish="' + p.id + '" aria-pressed="' + wished + '" aria-label="' + (wished ? 'Remove ' : 'Add ') + esc(p.name) + (wished ? ' from' : ' to') + ' wishlist">' + icon('heart') + '</button>' +
        '<button type="button" class="quick-btn" data-quick="' + p.id + '">' + icon('eye') + 'Quick view</button>' +
      '</div>' +
      '<div class="product-card__body">' +
        '<div class="product-card__info">' +
          '<h3 class="product-card__name" data-open="' + p.id + '">' + esc(p.name) + '</h3>' +
          '<p class="product-card__desc">' + esc(p.short) + '</p>' +
          '<div class="product-card__row"><span class="price">' + money(p.price) + '</span>' + ratingHTML(p) + '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-primary product-card__add" data-add="' + p.id + '"><span>Add to Cart</span>' + icon('bag') + '</button>' +
      '</div></article>';
  }
  function renderProducts(animate) {
    const list = visibleProducts();
    grid.innerHTML = list.map(cardHTML).join('');
    $('#noResults').hidden = list.length > 0;
    if (animate) Motion.cards($$('.product-card', grid));
    Motion.refreshSoon();
  }
  function setOccasion(key) {
    shopState.occasion = key || null;
    const bar = $('#activeOccasion');
    bar.hidden = !key;
    if (key) $('#activeOccasionName').textContent = OCCASIONS[key];
    renderProducts(true);
  }

  /* Filter chips, sort, inline search */
  $('#filterBar').addEventListener('click', e => {
    const b = e.target.closest('[data-filter]'); if (!b) return;
    shopState.cat = b.dataset.filter;
    $$('#filterBar .chip').forEach(c => c.classList.toggle('is-active', c === b));
    renderProducts(true);
  });
  $('#sortSelect').addEventListener('change', e => { shopState.sort = e.target.value; renderProducts(true); });
  let shopSearchTimer;
  $('#shopSearch').addEventListener('input', e => {
    clearTimeout(shopSearchTimer);
    shopSearchTimer = setTimeout(() => { shopState.q = e.target.value.trim(); renderProducts(true); }, 140);
  });
  $('#clearOccasion').addEventListener('click', () => setOccasion(null));

  /* Occasion cards → filter the shop */
  $('#occasionGrid').addEventListener('click', e => {
    const a = e.target.closest('[data-occasion]'); if (!a) return;
    e.preventDefault();
    shopState.cat = 'all'; shopState.q = ''; $('#shopSearch').value = '';
    $$('#filterBar .chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === 'all'));
    setOccasion(a.dataset.occasion);
    scrollToEl($('#shop'));
    toast('Showing blooms for ' + OCCASIONS[a.dataset.occasion]);
  });

  /* Search overlay */
  const searchInput = $('#searchInput'), searchResults = $('#searchResults');
  function renderSearch(q) {
    q = (q || '').trim();
    const list = (q ? PRODUCTS.filter(p => matchesQuery(p, q)) : PRODUCTS.slice(0, 4)).slice(0, 8);
    if (!list.length) { searchResults.innerHTML = '<li class="search-empty">No blooms match “' + esc(q) + '”. Try “rose”, “blue” or “birthday”.</li>'; return; }
    searchResults.innerHTML = (q ? '' : '<li class="search-empty">Popular right now</li>') + list.map(p =>
      '<li><button type="button" class="search-result" data-open="' + p.id + '">' +
      '<img src="' + esc(p.image) + '" alt="" width="70" height="84"><span><h4>' + esc(p.name) + '</h4><p>' + esc(p.short) + '</p></span>' +
      '<span class="price">' + money(p.price) + '</span></button></li>').join('');
  }
  $('#openSearch').addEventListener('click', () => { Overlay.open($('#searchOverlay')); renderSearch(''); setTimeout(() => searchInput.focus(), 420); });
  searchInput.addEventListener('input', () => renderSearch(searchInput.value));
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('.search-result', searchResults); if (first) first.click(); }
  });
  $('#searchSuggest').addEventListener('click', e => {
    const b = e.target.closest('[data-suggest]'); if (!b) return;
    searchInput.value = b.dataset.suggest; renderSearch(searchInput.value); searchInput.focus();
  });

  /* ===================================================================
     06 · CART & WISHLIST UI
  =================================================================== */
  function bumpBadge(el) { el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); }

  function updateBadges(bump) {
    const c = Store.count(), w = Store.wish.length;
    const cb = $('#cartCount'), wb = $('#wishCount');
    cb.textContent = c; cb.dataset.count = c; wb.textContent = w; wb.dataset.count = w;
    if (bump === 'cart') bumpBadge(cb); if (bump === 'wish') bumpBadge(wb);
  }

  function shippingFor(subtotal, shipId) {
    const opt = CONFIG.shipping.find(s => s.id === shipId) || CONFIG.shipping[0];
    if (!subtotal) return { opt, fee: 0 };
    return { opt, fee: (opt.freeOver && subtotal >= opt.freeOver) ? 0 : opt.fee };
  }

  function renderCart() {
    const list = $('#cartItems'), empty = $('#cartEmpty'), foot = $('#cartFoot'), meter = $('#shipMeter');
    const has = Store.cart.length > 0;
    empty.hidden = has; foot.hidden = !has; meter.hidden = !has;
    list.innerHTML = Store.cart.map(l => {
      const d = describeLine(l), unit = Store.unit(l);
      return '<li class="line" data-key="' + esc(l.key) + '">' +
        '<div class="line__thumb">' + d.thumb + '</div>' +
        '<div class="line__info"><h4>' + esc(d.name) + '</h4><p class="line__meta">' + esc(d.meta) + '</p>' +
          '<div class="line__row"><div class="qty qty--sm">' +
            '<button type="button" data-act="dec" aria-label="Decrease quantity">' + icon('minus') + '</button><output>' + l.qty + '</output>' +
            '<button type="button" data-act="inc" aria-label="Increase quantity">' + icon('plus') + '</button></div>' +
          '<strong class="line__price">' + money(unit * l.qty) + '</strong></div></div>' +
        '<button type="button" class="icon-btn line__remove" data-act="remove" aria-label="Remove ' + esc(d.name) + '">' + icon('trash') + '</button></li>';
    }).join('');
    const sub = Store.subtotal();
    $('#cartSubtotal').textContent = money(sub);
    const left = CONFIG.freeShippingThreshold - sub;
    $('#shipMeterText').innerHTML = left > 0 ? 'You\'re <strong>' + money(left) + '</strong> away from free standard delivery' : 'You\'ve unlocked <strong>free standard delivery</strong> ✿';
    $('#shipMeterFill').style.width = clamp(sub / CONFIG.freeShippingThreshold * 100, 0, 100) + '%';
    updateBadges();
  }

  function renderWishlist() {
    const list = $('#wishItems'), empty = $('#wishEmpty');
    empty.hidden = Store.wish.length > 0;
    list.innerHTML = Store.wish.map(id => {
      const p = byId(id);
      return '<li class="line" data-id="' + p.id + '">' +
        '<div class="line__thumb"><img src="' + esc(p.image) + '" alt="" width="84" height="100"></div>' +
        '<div class="line__info"><h4>' + esc(p.name) + '</h4><p class="line__meta">' + esc(p.short) + '</p>' +
          '<div class="line__row"><strong class="line__price">' + money(p.price) + '</strong>' +
          '<button type="button" class="btn btn-ghost line__add" data-add="' + p.id + '"><span>Add to cart</span></button>' +
          '<button type="button" class="link-btn" data-open="' + p.id + '">View</button></div></div>' +
        '<button type="button" class="icon-btn line__remove" data-unwish="' + p.id + '" aria-label="Remove ' + esc(p.name) + ' from wishlist">' + icon('x') + '</button></li>';
    }).join('');
    updateBadges();
  }

  /* Reflect wishlist state on every heart on the page */
  function syncWishButtons() {
    $$('[data-wish]').forEach(b => {
      const on = Store.has(b.dataset.wish), p = byId(b.dataset.wish);
      b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on);
      if (b.classList.contains('wish-btn--text')) $('span', b).textContent = on ? 'Saved to wishlist' : 'Add to wishlist';
      else if (p) b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + p.name + (on ? ' from' : ' to') + ' wishlist');
    });
  }

  function toggleWish(id) {
    const on = Store.toggleWish(id), p = byId(id);
    renderWishlist(); syncWishButtons(); updateBadges('wish');
    toast(on ? p.name + ' saved to your wishlist' : p.name + ' removed from wishlist');
  }

  /* A little flower flies from the button to the cart icon */
  function flyToCart(fromEl) {
    if (!gsapOK || prefersReduced || !fromEl || !window.BloomArt) return;
    const from = fromEl.getBoundingClientRect(), to = $('#openCart').getBoundingClientRect();
    const f = document.createElement('div');
    f.style.cssText = 'position:fixed;left:0;top:0;width:54px;height:54px;z-index:99998;pointer-events:none;';
    const types = ['rose', 'daisy', 'blossom', 'bloom'], cols = ['pink', 'blue', 'white', 'purple', 'yellow'];
    f.innerHTML = BloomArt.flowerHeadSVG(types[Math.floor(Math.random() * 4)], cols[Math.floor(Math.random() * 5)], '');
    document.body.appendChild(f);
    gsap.set(f, { x: from.left + from.width / 2 - 27, y: from.top + from.height / 2 - 27, scale: .6, opacity: 0 });
    gsap.timeline({ onComplete: () => { f.remove(); updateBadges('cart'); } })
      .to(f, { opacity: 1, scale: 1.1, duration: .25, ease: 'power2.out' })
      .to(f, { x: to.left + to.width / 2 - 27, y: to.top + to.height / 2 - 27, scale: .25, rotation: 260, duration: .85, ease: 'power3.in' }, '>-.05')
      .to(f, { opacity: 0, duration: .15 }, '>-.15');
  }

  function addProductToCart(id, opts, fromEl) {
    const p = Store.addProduct(id, opts); if (!p) return;
    renderCart();
    flyToCart(fromEl);
    if (!gsapOK) updateBadges('cart');
    toast(p.name + ' added to your cart');
  }

  /* Cart drawer interactions */
  $('#openCart').addEventListener('click', () => Overlay.open($('#cartDrawer')));
  $('#openWishlist').addEventListener('click', () => Overlay.open($('#wishDrawer')));
  $('#cartItems').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const key = b.closest('.line').dataset.key, line = Store.cart.find(l => l.key === key); if (!line) return;
    if (b.dataset.act === 'inc') Store.setQty(key, line.qty + 1);
    if (b.dataset.act === 'dec') Store.setQty(key, line.qty - 1);
    if (b.dataset.act === 'remove') { Store.remove(key); toast('Removed from your cart'); }
    renderCart();
  });
  $('#cartClear').addEventListener('click', () => { Store.clear(); renderCart(); toast('Your cart is empty'); });
  $('#cartCheckout').addEventListener('click', () => { Overlay.close($('#cartDrawer')); Checkout.open(); });
  $('#cartWhatsApp').addEventListener('click', () => {
    if (!Store.cart.length) return;
    openExternal(waLink(orderText({ items: Store.cart, subtotal: Store.subtotal() })));
  });
  $('#wishItems').addEventListener('click', e => {
    const u = e.target.closest('[data-unwish]'); if (u) toggleWish(u.dataset.unwish);
  });

  /* Global delegation for buttons that appear in generated markup */
  document.addEventListener('click', e => {
    const wish = e.target.closest('[data-wish]');
    if (wish) { e.preventDefault(); e.stopPropagation(); toggleWish(wish.dataset.wish); return; }
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addProductToCart(add.dataset.add, null, add); return; }
    const open = e.target.closest('[data-open], [data-quick]');
    if (open) { e.preventDefault(); ProductModal.open(open.dataset.open || open.dataset.quick); }
  });

  /* Order text — used for WhatsApp messages */
  function orderText(o) {
    const lines = o.items.map((l, i) => { const d = describeLine(l); return (i + 1) + '. ' + d.plain + ' × ' + l.qty + ' — ' + money(Store.unit(l) * l.qty); });
    let t = 'Hi ' + CONFIG.storeName + '! I would like to order:\n\n' + lines.join('\n') + '\n\nSubtotal: ' + money(o.subtotal);
    if (o.shipping) t += '\nDelivery (' + o.shipping.name + '): ' + (o.shipping.fee ? money(o.shipping.fee) : 'Free');
    if (o.total != null) t += '\nTotal: ' + money(o.total);
    if (o.id) t = 'Order ' + o.id + '\n' + t;
    if (o.customer) {
      const c = o.customer;
      t += '\n\nName: ' + c.name + '\nPhone: ' + c.phone + '\nAddress: ' + c.address + ', ' + c.city + ', ' + c.state + ' ' + c.pin;
      if (c.note) t += '\nNote: ' + c.note;
    }
    return t;
  }

  /* ===================================================================
     07 · PRODUCT MODAL (with interactive 360° / 3D view)
  =================================================================== */
  const ProductModal = (function () {
    const modal = $('#productModal'), stage = $('#pmStage'), obj = $('#pmObject'), img = $('#pmImg'), back = $('#pmImgBack');
    let p = null, st = { color: '', size: '', qty: 1 };
    const view = { x: 0, y: 0 };             // rotateX / rotateY in degrees
    let frames = null, frameIndex = 0, dragging = false, moved = 0, startX = 0, startY = 0, baseY = 0, baseX = 0, spinTween = null;

    function unitPrice() { const s = p.sizes.find(x => x.id === st.size) || p.sizes[0]; return p.price + s.add; }

    function paintPrice() {
      const unit = unitPrice();
      $('#pmPrice').textContent = money(unit);
      $('#pmQty').textContent = st.qty;
      $('#pmAdd span').textContent = 'Add to Cart · ' + money(unit * st.qty);
    }
    function buildOptions() {
      $('#pmColors').innerHTML = p.colors.map(c =>
        '<button type="button" class="swatch' + (c === st.color ? ' is-selected' : '') + '" role="radio" aria-checked="' + (c === st.color) + '" aria-label="' + c + '" title="' + c + '" data-color="' + c + '" style="--sw:' + (COLOR_HEX[c] || '#ddd') + '"></button>').join('');
      $('#pmColorName').textContent = st.color;
      $('#pmSizes').innerHTML = p.sizes.map(s =>
        '<button type="button" class="seg__btn' + (s.id === st.size ? ' is-selected' : '') + '" role="radio" aria-checked="' + (s.id === st.size) + '" data-size="' + s.id + '">' + s.name + '<small>' + (s.add ? '+' + money(s.add) : 'Included') + '</small></button>').join('');
    }

    /* ---- 3D / 360 view ---- */
    function applyView() {
      obj.style.transform = 'rotateX(' + view.x.toFixed(2) + 'deg) rotateY(' + view.y.toFixed(2) + 'deg)';
      const norm = ((view.y % 360) + 540) % 360 - 180;               // −180…180
      stage.style.setProperty('--sx', clamp(50 + norm * 0.9, -20, 120) + '%');
    }
    function resetView(animated) {
      if (spinTween) { spinTween.kill(); spinTween = null; }
      stage.classList.remove('is-spinning');
      if (animated && gsapOK) gsap.to(view, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.55)', onUpdate: applyView });
      else { view.x = 0; view.y = 0; applyView(); }
    }
    function setFrame(i) {
      if (!frames) return;
      frameIndex = ((i % frames.length) + frames.length) % frames.length;
      img.src = frames[frameIndex]; back.src = frames[frameIndex];
    }
    function spin() {
      if (spinTween) return;
      if (stage.classList.contains('is-zoomed')) toggleZoom(false);
      stage.classList.add('is-touched');
      if (frames) {                                                      // real 360° photo sequence
        const o = { f: frameIndex };
        spinTween = gsap.to(o, { f: frameIndex + frames.length, duration: 3.2, ease: 'power1.inOut', onUpdate: () => setFrame(Math.round(o.f)), onComplete: () => { spinTween = null; } });
        return;
      }
      stage.classList.add('is-spinning');                                // pseudo-3D: turn the card around
      view.x = 0; view.y = 0;
      if (!gsapOK) { applyView(); return; }
      spinTween = gsap.to(view, { y: 360, duration: 2.1, ease: 'power2.inOut', onUpdate: applyView, onComplete: () => { view.y = 0; applyView(); stage.classList.remove('is-spinning'); spinTween = null; } });
    }
    function toggleZoom(force) {
      const on = typeof force === 'boolean' ? force : !stage.classList.contains('is-zoomed');
      stage.classList.toggle('is-zoomed', on); $('#pmZoom').setAttribute('aria-pressed', on);
      if (on) { resetView(false); stage.classList.add('is-touched'); } else img.style.transformOrigin = '';
    }

    stage.addEventListener('pointerdown', e => {
      if (stage.classList.contains('is-zoomed') || spinTween) return;
      dragging = true; moved = 0; startX = e.clientX; startY = e.clientY; baseY = view.y; baseX = view.x;
      stage.classList.add('is-dragging', 'is-touched'); stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (stage.classList.contains('is-zoomed')) {                       // zoom: pan around the image
        const r = stage.getBoundingClientRect();
        img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
        return;
      }
      if (dragging) {
        const dx = e.clientX - startX, dy = e.clientY - startY; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        if (frames) { setFrame(Math.round(baseY / 10 - dx / 14)); return; }
        view.y = clamp(baseY + dx * 0.45, -42, 42); view.x = clamp(baseX - dy * 0.3, -22, 22); applyView();
      } else if (finePointer && gsapOK && !spinTween && !frames) {      // gentle hover tilt
        const r = stage.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        gsap.to(view, { y: px * 16, x: -py * 10, duration: .5, ease: 'power2.out', overwrite: true, onUpdate: applyView });
      }
    });
    const endDrag = () => { if (!dragging) return; dragging = false; stage.classList.remove('is-dragging'); if (!frames) resetView(true); };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerleave', () => { if (!dragging && !spinTween && !stage.classList.contains('is-zoomed') && !frames) resetView(true); });
    stage.addEventListener('click', () => { if (stage.classList.contains('is-zoomed') && moved < 6) toggleZoom(false); });
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); stage.classList.add('is-touched');
        const d = e.key === 'ArrowLeft' ? -1 : 1;
        if (frames) setFrame(frameIndex + d); else { view.y = clamp(view.y + d * 14, -42, 42); applyView(); }
      }
    });
    $('#pmSpin').addEventListener('click', spin);
    $('#pmZoom').addEventListener('click', () => toggleZoom());

    /* ---- option + action handlers ---- */
    $('#pmColors').addEventListener('click', e => {
      const b = e.target.closest('[data-color]'); if (!b) return;
      st.color = b.dataset.color; buildOptions();
      /* optional: a different photo per colour — add  colorImages: { Blue: 'assets/images/product-1-blue.jpg', … }  to the product */
      if (p.colorImages && p.colorImages[st.color] && !frames) { img.src = p.colorImages[st.color]; back.src = p.colorImages[st.color]; }
    });
    $('#pmSizes').addEventListener('click', e => {
      const b = e.target.closest('[data-size]'); if (!b) return;
      st.size = b.dataset.size; buildOptions(); paintPrice();
    });
    $('#pmMinus').addEventListener('click', () => { st.qty = Math.max(1, st.qty - 1); paintPrice(); });
    $('#pmPlus').addEventListener('click', () => { st.qty = Math.min(20, st.qty + 1); paintPrice(); });
    /* #pmWish carries data-wish, so the page-wide [data-wish] handler already toggles it — no separate listener (it would toggle twice). */

    function currentOpts() { return { color: st.color, size: st.size, qty: st.qty, tag: $('#pmNameInput').value.trim() }; }
    $('#pmAdd').addEventListener('click', e => {
      addProductToCart(p.id, currentOpts(), e.currentTarget);
      Overlay.close(modal);
    });
    $('#pmBuy').addEventListener('click', () => {
      Store.addProduct(p.id, currentOpts()); renderCart();
      Overlay.close(modal);
      setTimeout(() => Checkout.open(), 260);
    });

    function open(id) {
      p = byId(id); if (!p) return;
      Overlay.close($('#searchOverlay'));
      st = { color: p.colors[0], size: p.sizes[0].id, qty: 1 };
      frames = Array.isArray(p.images360) && p.images360.length > 3 ? p.images360 : null; frameIndex = 0;
      $('#pmCategory').textContent = ({ bouquet: 'Bouquet', single: 'Single stem', mini: 'Mini bouquet', custom: 'Personalised' })[p.category] || 'Bloom';
      $('#pmName').textContent = p.name;
      $('#pmStars').innerHTML = starsHTML(p.rating);
      $('#pmReviews').textContent = p.rating.toFixed(1) + ' / 5' + (CONFIG.showReviewCounts && p.reviews ? ' · ' + p.reviews + ' reviews' : '');
      $('#pmDesc').textContent = p.long;
      img.src = frames ? frames[0] : p.image; img.alt = p.name + ' — handmade pipe-cleaner flowers';
      back.src = frames ? frames[0] : p.image;
      $('#pmNameWrap').hidden = !p.customName; $('#pmNameInput').value = '';
      stage.classList.remove('is-zoomed', 'is-touched', 'is-spinning', 'is-dragging'); $('#pmZoom').setAttribute('aria-pressed', 'false'); img.style.transformOrigin = '';
      resetView(false);
      buildOptions(); paintPrice(); syncWishButtons();
      $('#pmWish').dataset.wish = p.id; syncWishButtons();
      Overlay.open(modal);
      modal.scrollTop = 0; $('.modal__panel', modal).scrollTop = 0;
    }
    return { open };
  })();

  /* ===================================================================
     08 · CHECKOUT  (front-end only — ready for a real gateway)
  =================================================================== */

  /* ④ PAYMENT GATEWAY ----------------------------------------------
     This is the ONLY place you need to change to take real payments.
     Both functions receive the full `order` object and must return a
     Promise. In demo mode they just wait a moment and succeed.

       createOrder(order) → call YOUR backend (e.g. POST /api/orders).
                            The backend should recalculate the total from its
                            own price list, create the gateway order and return
                            e.g. { ok:true, gatewayOrderId:'order_abc123' }.

       pay(order, created) → open the gateway UI (Razorpay Checkout, Stripe
                            Checkout redirect, PayU…) and resolve with
                            { ok:true, paymentId:'pay_xyz' } when paid, or
                            { ok:false, error:'…' } if cancelled/failed.

     See README.md → "Connecting a payment gateway" for worked examples. */
  const PaymentGateway = {
    demo: true,
    createOrder(order) {
      // TODO (production): return fetch('/api/orders', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order)}).then(r => r.json());
      return new Promise(res => setTimeout(() => res({ ok: true, gatewayOrderId: null, demo: true }), 700));
    },
    pay(order, created) {
      // TODO (production): open Razorpay / Stripe here using `created.gatewayOrderId`.
      return new Promise(res => setTimeout(() => res({ ok: true, paymentId: null, demo: true }), 500));
    }
  };

  const Checkout = (function () {
    const modal = $('#checkoutModal'), form = $('#checkoutForm');
    let ship = CONFIG.shipping[0].id, pay = CONFIG.payments[0].id, busy = false;

    function totals() {
      const subtotal = Store.subtotal(), s = shippingFor(subtotal, ship);
      return { subtotal, shipping: { id: s.opt.id, name: s.opt.name, fee: s.fee }, total: subtotal + s.fee };
    }
    function buildChoices() {
      $('#coShip').innerHTML = CONFIG.shipping.map(s => {
        const fee = shippingFor(Store.subtotal(), s.id).fee;
        return '<label class="radio-card' + (s.id === ship ? ' is-selected' : '') + '"><input type="radio" name="ship" value="' + s.id + '"' + (s.id === ship ? ' checked' : '') + '>' +
          '<span class="radio-card__dot"></span><span class="radio-card__text"><strong>' + esc(s.name) + '</strong><small>' + esc(s.note) + '</small></span>' +
          '<span class="radio-card__price">' + (fee ? money(fee) : 'Free') + '</span></label>';
      }).join('');
      $('#coPay').innerHTML = CONFIG.payments.map(m =>
        '<label class="radio-card' + (m.id === pay ? ' is-selected' : '') + '"><input type="radio" name="pay" value="' + m.id + '"' + (m.id === pay ? ' checked' : '') + '>' +
        '<span class="radio-card__dot"></span><span class="radio-card__text"><strong>' + esc(m.name) + '</strong><small>' + esc(m.note) + '</small></span></label>').join('');
      $('#coPayHint').textContent = (CONFIG.payments.find(m => m.id === pay) || {}).hint || '';
    }
    function paintSummary() {
      $('#coLines').innerHTML = Store.cart.map(l => {
        const d = describeLine(l);
        return '<li class="co-line"><div class="co-line__thumb">' + d.thumb + '<span class="co-line__q">' + l.qty + '</span></div>' +
          '<div><h5>' + esc(d.name) + '</h5><small>' + esc(d.meta) + '</small></div><b>' + money(Store.unit(l) * l.qty) + '</b></li>';
      }).join('');
      const t = totals();
      $('#coSub').textContent = money(t.subtotal);
      $('#coShipFee').textContent = t.shipping.fee ? money(t.shipping.fee) : 'Free';
      $('#coTotal').textContent = money(t.total);
      $('#coPlaceLabel').textContent = (pay === 'cod' ? 'Place order · ' : 'Pay ') + money(t.total);
    }
    function open() {
      if (!Store.cart.length) { toast('Your cart is empty — add a bloom first', 'error'); return; }
      $('#coMain').hidden = false; $('#coSuccess').hidden = true;
      busy = false; $('#coPlace').disabled = false;
      $$('.field.has-error', form).forEach(f => f.classList.remove('has-error'));
      $$('.err', form).forEach(x => x.textContent = '');
      buildChoices(); paintSummary(); Overlay.open(modal);
    }

    form.addEventListener('change', e => {
      if (e.target.name === 'ship') ship = e.target.value;
      if (e.target.name === 'pay') pay = e.target.value;
      if (e.target.name === 'ship' || e.target.name === 'pay') { buildChoices(); paintSummary(); }
    });

    const rules = [
      { id: 'coName',    test: v => v.length >= 2, msg: 'Please enter your full name' },
      { id: 'coEmail',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), msg: 'Please enter a valid email address' },
      { id: 'coPhone',   test: v => { const d = v.replace(/\D/g, ''); return d.length >= 10 && d.length <= 13; }, msg: 'Please enter a valid phone number' },
      { id: 'coAddress', test: v => v.length >= 6, msg: 'Please enter your delivery address' },
      { id: 'coCity',    test: v => v.length >= 2, msg: 'Required' },
      { id: 'coState',   test: v => v.length >= 2, msg: 'Required' },
      { id: 'coPin',     test: v => /^\d{6}$/.test(v), msg: '6-digit PIN code' }
    ];

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;
      if (!validate(rules)) return;
      const t = totals(), v = id => $('#' + id).value.trim();
      const order = {
        id: 'BV-' + Date.now().toString(36).toUpperCase().slice(-6),
        createdAt: new Date().toISOString(),
        customer: { name: v('coName'), email: v('coEmail'), phone: v('coPhone'), address: v('coAddress'), city: v('coCity'), state: v('coState'), pin: v('coPin'), note: v('coNote') },
        shipping: t.shipping, payment: pay,
        items: Store.cart.map(l => Object.assign({}, l, { unitPrice: Store.unit(l), title: describeLine(l).plain })),
        subtotal: t.subtotal, total: t.total, currency: 'INR'
      };
      busy = true; $('#coPlace').disabled = true; $('#coPlaceLabel').textContent = 'Processing…';
      try {
        const created = await PaymentGateway.createOrder(order);
        if (!created || created.ok === false) throw new Error((created && created.error) || 'Could not create the order');
        let paid = { ok: true };
        if (pay !== 'cod') paid = await PaymentGateway.pay(order, created);
        if (!paid || paid.ok === false) throw new Error((paid && paid.error) || 'Payment was not completed');
        order.gatewayOrderId = created.gatewayOrderId || null; order.paymentId = paid.paymentId || null; order.demo = !!PaymentGateway.demo;

        const orders = storage.get(KEYS.orders, []); orders.push(order); storage.set(KEYS.orders, orders);
        const summaryItems = Store.cart.slice();
        Store.clear(); renderCart();
        $('#coThanksName').textContent = order.customer.name.split(' ')[0];
        $('#coOrderId').textContent = order.id;
        $('#coConfirmWA').href = waLink(orderText({ id: order.id, items: summaryItems, subtotal: order.subtotal, shipping: order.shipping, total: order.total, customer: order.customer }));
        $('#coMain').hidden = true; $('#coSuccess').hidden = false;
        $('.modal__panel', modal).scrollTop = 0;
        form.reset(); ship = CONFIG.shipping[0].id; pay = CONFIG.payments[0].id;
      } catch (err) {
        toast(err.message || 'Something went wrong — please try again', 'error');
        busy = false; $('#coPlace').disabled = false; paintSummary();
      }
    });
    $('#coDone').addEventListener('click', () => { Overlay.close(modal); scrollToEl($('#shop')); });

    return { open };
  })();

  /* Shared form validation helpers */
  function setError(el, msg) {
    const wrap = el.closest('.field'); if (!wrap) return;
    wrap.classList.toggle('has-error', !!msg);
    const e = $('.err', wrap); if (e) e.textContent = msg || '';
  }
  function validate(rules) {
    let first = null;
    rules.forEach(r => {
      const el = $('#' + r.id), ok = r.test(el.value.trim());
      setError(el, ok ? '' : r.msg);
      if (!ok && !first) first = el;
    });
    if (first) { first.focus(); toast('Please check the highlighted fields', 'error'); }
    return !first;
  }
  document.addEventListener('input', e => {                 // clear an error as soon as the user edits the field
    if (e.target.closest && e.target.closest('.field.has-error')) setError(e.target, '');
  });

  /* ===================================================================
     09 · CUSTOM BOUQUET CONFIGURATOR
  =================================================================== */
  const cfg = { flower: 'rose', color: 'pink', qty: 9, size: 'classic', wrap: 'ivory', ribbon: 'gold', name: '', message: '' };
  const pick = (list, id) => list.find(x => x.id === id) || list[0];

  function configSnapshot() {
    return { flower: cfg.flower, color: cfg.color, qty: cfg.qty, size: pick(CFG.sizes, cfg.size), wrap: pick(CFG.wraps, cfg.wrap), ribbon: pick(CFG.ribbons, cfg.ribbon), name: cfg.name.trim(), message: cfg.message.trim() };
  }
  function configPrice(c) {
    const f = pick(CFG.flowers, c.flower);
    const lines = [
      { label: c.qty + ' × ' + f.name + (c.qty > 1 ? 's' : '') + ' (' + money(f.price) + ' each)', amount: c.qty * f.price },
      { label: c.size.name + ' size', amount: c.size.add },
      { label: c.wrap.name + ' wrapping', amount: c.wrap.add },
      { label: c.ribbon.id === 'none' ? 'No ribbon' : c.ribbon.name + ' ribbon', amount: c.ribbon.add }
    ];
    if (c.name) lines.push({ label: 'Hand-lettered name tag', amount: CFG.nameTag });
    if (c.message) lines.push({ label: 'Message card', amount: CFG.messageCard });
    return { lines, total: lines.reduce((n, l) => n + l.amount, 0) };
  }
  function configToSVG(c) {
    const f = pick(CFG.flowers, c.flower), size = c.size.scale || 1;
    return BloomArt.bouquetSVG({
      count: c.qty, mix: [{ t: f.art, c: '$main' }], color: c.color, wrap: c.wrap.id, ribbon: c.ribbon.id === 'none' ? null : c.ribbon.id,
      name: c.name, message: c.message, size, bg: CFG.colorBg[c.color], seed: 3,
      filler: c.color === 'white' ? 'gold' : 'white', label: 'Your custom bouquet preview'
    });
  }

  function initConfigurator() {
    const flowersEl = $('#cfgFlowers'), colorsEl = $('#cfgColors'), sizesEl = $('#cfgSizes'), wrapsEl = $('#cfgWraps'), ribbonsEl = $('#cfgRibbons');
    const stage = $('#cfgPreview');

    function renderFlowers() {
      flowersEl.innerHTML = CFG.flowers.map(f =>
        '<button type="button" class="option-card' + (f.id === cfg.flower ? ' is-selected' : '') + '" role="radio" aria-checked="' + (f.id === cfg.flower) + '" data-flower="' + f.id + '">' +
        BloomArt.flowerHeadSVG(f.art, cfg.color, f.name) + '<span>' + f.name + '</span><small>' + money(f.price) + ' / stem</small></button>').join('');
    }
    function renderColors() {
      colorsEl.innerHTML = CFG.colors.map(c =>
        '<button type="button" class="swatch' + (c.id === cfg.color ? ' is-selected' : '') + '" role="radio" aria-checked="' + (c.id === cfg.color) + '" aria-label="' + c.name + '" title="' + c.name + '" data-color="' + c.id + '" style="--sw:' + COLOR_HEX[c.name] + '"></button>').join('');
      $('#cfgColorName').textContent = pick(CFG.colors, cfg.color).name;
    }
    function segs(el, list, key, extra) {
      el.innerHTML = list.map(o =>
        '<button type="button" class="seg__btn' + (o.id === cfg[key] ? ' is-selected' : '') + '" role="radio" aria-checked="' + (o.id === cfg[key]) + '" data-' + key + '="' + o.id + '">' + o.name +
        (extra ? '<small>' + (o.add ? '+' + money(o.add) : 'Included') + '</small>' : '') + '</button>').join('');
    }
    function renderSegs() {
      segs(sizesEl, CFG.sizes, 'size', true);
      segs(wrapsEl, CFG.wraps, 'wrap', false);
      segs(ribbonsEl, CFG.ribbons, 'ribbon', false);
      wrapsEl.querySelectorAll('.seg__btn').forEach((b, i) => { const a = CFG.wraps[i].add; if (a) b.insertAdjacentHTML('beforeend', '<small>+' + money(a) + '</small>'); });
      ribbonsEl.querySelectorAll('.seg__btn').forEach((b, i) => { const a = CFG.ribbons[i].add; if (a) b.insertAdjacentHTML('beforeend', '<small>+' + money(a) + '</small>'); });
    }

    let raf = 0;
    function update(animate) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const c = configSnapshot(), price = configPrice(c);
        stage.innerHTML = configToSVG(c);
        const bg = CFG.colorBg[c.color];                         // show the whole bouquet; tint the sides to match the artwork background
        stage.style.background = 'linear-gradient(180deg,' + bg[0] + ',' + bg[1] + ')';
        stage.firstChild.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        if (animate && gsapOK && !prefersReduced) gsap.fromTo(stage.firstChild, { scale: .965, opacity: .55 }, { scale: 1, opacity: 1, duration: .55, ease: 'power3.out', overwrite: true });
        $('#cfgQtyVal').textContent = c.qty;
        $('#cfgTotal').textContent = money(price.total);
        $('#cfgBreakdown').innerHTML = price.lines.map(l => '<li><span>' + esc(l.label) + '</span><b>' + (l.amount ? money(l.amount) : 'Included') + '</b></li>').join('');
        const f = pick(CFG.flowers, c.flower), col = pick(CFG.colors, c.color);
        $('#cfgSummaryText').textContent = c.qty + ' ' + col.name.toLowerCase() + ' ' + f.name.toLowerCase() + (c.qty > 1 ? 's' : '') + ', ' + c.wrap.name.toLowerCase() + ' wrap' + (c.ribbon.id !== 'none' ? ' & ' + c.ribbon.name.toLowerCase() + ' ribbon' : '') + '.';
        $('#cfgMsgCount').textContent = cfg.message.length;
      });
    }

    flowersEl.addEventListener('click', e => { const b = e.target.closest('[data-flower]'); if (!b) return; cfg.flower = b.dataset.flower; renderFlowers(); update(true); });
    colorsEl.addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (!b) return; cfg.color = b.dataset.color; renderColors(); renderFlowers(); update(true); });
    sizesEl.addEventListener('click', e => { const b = e.target.closest('[data-size]'); if (!b) return; cfg.size = b.dataset.size; renderSegs(); update(true); });
    wrapsEl.addEventListener('click', e => { const b = e.target.closest('[data-wrap]'); if (!b) return; cfg.wrap = b.dataset.wrap; renderSegs(); update(true); });
    ribbonsEl.addEventListener('click', e => { const b = e.target.closest('[data-ribbon]'); if (!b) return; cfg.ribbon = b.dataset.ribbon; renderSegs(); update(true); });
    $('#cfgMinus').addEventListener('click', () => { cfg.qty = Math.max(CFG.minQty, cfg.qty - 1); update(false); });
    $('#cfgPlus').addEventListener('click', () => { cfg.qty = Math.min(CFG.maxQty, cfg.qty + 1); update(false); });
    $('#cfgName').addEventListener('input', e => { cfg.name = e.target.value; update(false); });
    $('#cfgMessage').addEventListener('input', e => { cfg.message = e.target.value; update(false); });

    $('#cfgAdd').addEventListener('click', e => {
      const c = configSnapshot(), price = configPrice(c);
      Store.addCustom(c, price.total); renderCart(); flyToCart(e.currentTarget);
      if (!gsapOK) updateBadges('cart');
      toast('Your custom bouquet was added to the cart');
      setTimeout(() => Overlay.open($('#cartDrawer')), gsapOK ? 900 : 300);
    });

    renderFlowers(); renderColors(); renderSegs(); update(false);
  }

  /* ===================================================================
     10 · GALLERY (masonry filter + lightbox)
  =================================================================== */
  function initGallery() {
    const items = $$('#galleryGrid .g-item'), lb = $('#lightbox'), lbImg = $('#lbImg'), fig = $('.lightbox__figure');
    let list = [], idx = 0;
    items.forEach(it => { it.tabIndex = 0; it.setAttribute('role', 'button'); it.setAttribute('aria-label', 'View image: ' + it.dataset.cap); it.dataset.cursor = 'View'; });

    $('#galleryFilter').addEventListener('click', e => {
      const b = e.target.closest('[data-gfilter]'); if (!b) return;
      $$('#galleryFilter .chip').forEach(c => c.classList.toggle('is-active', c === b));
      const f = b.dataset.gfilter;
      items.forEach(it => it.classList.toggle('is-hidden', f !== 'all' && it.dataset.cat !== f));
      if (gsapOK) gsap.fromTo(items.filter(i => !i.classList.contains('is-hidden')), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .7, stagger: .05, ease: 'power3.out', clearProps: 'opacity,transform' });
      Motion.refreshSoon();
    });

    function show(i, dir) {
      idx = (i + list.length) % list.length;
      const it = list[idx], img = $('img', it);
      const swap = () => { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; $('#lbCap').textContent = it.dataset.cap; $('#lbCount').textContent = (idx + 1) + ' / ' + list.length; fig.classList.remove('is-swapping'); };
      if (dir) { fig.classList.add('is-swapping'); setTimeout(swap, 220); } else swap();
    }
    function openAt(it) { list = items.filter(x => !x.classList.contains('is-hidden')); show(list.indexOf(it), 0); Overlay.open(lb); }
    items.forEach(it => {
      it.addEventListener('click', () => openAt(it));
      it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(it); } });
    });
    $('#lbPrev').addEventListener('click', () => show(idx - 1, -1));
    $('#lbNext').addEventListener('click', () => show(idx + 1, 1));
    $('#lbClose').addEventListener('click', () => Overlay.close(lb));
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft') show(idx - 1, -1);
      if (e.key === 'ArrowRight') show(idx + 1, 1);
    });
    let sx = null;                                                        // swipe on touch screens
    lb.addEventListener('pointerdown', e => { sx = e.clientX; });
    lb.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60 && e.target.closest('.lightbox__figure')) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); });
  }

  /* ===================================================================
     11 · REVIEWS SLIDER
  =================================================================== */
  function initSlider() {
    const track = $('#reviewTrack'), slides = $$('.review', track), dots = $('#revDots'), root = $('#reviewSlider');
    let i = 0, timer = null, sx = null;
    $$('.review .stars', track).forEach(s => { s.innerHTML = starsHTML(5); });
    dots.innerHTML = slides.map((_, n) => '<button type="button" role="tab" aria-label="Review ' + (n + 1) + '"></button>').join('');
    const dotEls = $$('button', dots);
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      dotEls.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.setAttribute('aria-selected', k === i); });
      slides.forEach((s, k) => s.setAttribute('aria-hidden', k !== i));
    }
    const play = () => { stop(); if (!prefersReduced) timer = setInterval(() => go(i + 1), 6500); };
    const stop = () => { clearInterval(timer); timer = null; };
    $('#revPrev').addEventListener('click', () => { go(i - 1); play(); });
    $('#revNext').addEventListener('click', () => { go(i + 1); play(); });
    dotEls.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
    root.addEventListener('pointerdown', e => { sx = e.clientX; });
    root.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { go(i + (dx < 0 ? 1 : -1)); play(); } });
    root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : play());
    go(0); play();
  }

  /* ===================================================================
     12 · CONTACT / CUSTOM-ORDER FORM
  =================================================================== */
  function initContact() {
    const form = $('#contactForm'), ok = $('#contactSuccess');
    const rules = [
      { id: 'cName',    test: v => v.length >= 2, msg: 'Please tell us your name' },
      { id: 'cEmail',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), msg: 'Please enter a valid email address' },
      { id: 'cPhone',   test: v => !v || (v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 13), msg: 'Please enter a valid phone number' },
      { id: 'cWhat',    test: v => !!v, msg: 'Please choose what you\'d like' },
      { id: 'cMessage', test: v => v.length >= 10, msg: 'Tell us a little more (at least 10 characters)' }
    ];
    function requestData() {
      const g = id => $('#' + id).value.trim();
      return {
        name: g('cName'), email: g('cEmail'), phone: g('cPhone'), what: g('cWhat'), occasion: g('cOccasion'), budget: g('cBudget'),
        colors: $$('#cColors input:checked').map(x => x.value), message: g('cMessage'), createdAt: new Date().toISOString()
      };
    }
    function requestText(d) {
      return 'Hi ' + CONFIG.storeName + '! I\'d like to request a custom order.\n\n' +
        'Name: ' + d.name + '\nEmail: ' + d.email + (d.phone ? '\nPhone: ' + d.phone : '') +
        '\nWhat I\'d like: ' + d.what + (d.occasion ? '\nOccasion: ' + d.occasion : '') + (d.budget ? '\nBudget: ' + d.budget : '') +
        (d.colors.length ? '\nColours: ' + d.colors.join(', ') : '') + '\n\n' + d.message;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(rules)) return;
      const d = requestData(), text = requestText(d);
      const saved = storage.get(KEYS.requests, []); saved.push(d); storage.set(KEYS.requests, saved);
      let sent = false;
      if (CONFIG.formEndpoint) {                                  // optional: send to your form service
        try {
          const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
          sent = r.ok;
        } catch (err) { sent = false; }
        if (!sent) toast('We could not send that automatically — please use WhatsApp or email below', 'error');
      }
      $('#contactSuccessText').textContent = sent ? 'Thank you, ' + d.name.split(' ')[0] + '! Your request is with us and we will reply soon.' : 'Thank you, ' + d.name.split(' ')[0] + '! Send your request to us in one tap and we\'ll get back to you soon.';
      $('#contactSendWA').href = waLink(text);
      $('#contactSendMail').href = mailLink('Custom order request — ' + d.name, text);
      form.hidden = true; ok.hidden = false;
      if (gsapOK) gsap.from(ok.children, { opacity: 0, y: 24, stagger: .08, duration: .7, ease: 'power3.out' });
      toast('Your request is ready to send');
    });
    $('#contactReset').addEventListener('click', () => { form.reset(); form.hidden = false; ok.hidden = true; });
    $$('input, select, textarea', form).forEach(el => el.addEventListener('blur', () => {
      const r = rules.find(x => x.id === el.id); if (r && el.value.trim()) setError(el, r.test(el.value.trim()) ? '' : r.msg);
    }));
  }

  /* ===================================================================
     LINKS: Instagram / WhatsApp / e-mail wiring
  =================================================================== */
  function wireLinks() {
    $$('[data-link="instagram"]').forEach(a => { a.href = CONFIG.instagram; });
    $$('[data-link="whatsapp"]').forEach(a => { a.href = waLink('Hi ' + CONFIG.storeName + '! I\'d love to know more about your handmade flowers.'); });
    $$('[data-link="email"]').forEach(a => { a.href = mailLink('Hello from the ' + CONFIG.storeName + ' website', ''); });
    const num = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    if (num) $('#contactWhatsApp').textContent = '+' + num.replace(/^(\d{2})(\d{5})(\d+)$/, '$1 $2 $3');
    if (CONFIG.email) $('#contactEmail').textContent = CONFIG.email;
  }

  /* ===================================================================
     SCROLLING: anchors, header state, active nav link
  =================================================================== */
  function scrollToEl(el, offset) {
    if (!el) return;
    Overlay.closeAll(); closeMenu();
    const off = offset == null ? 0 : offset;
    if (lenis) { lenis.start(); lenis.scrollTo(el, { offset: off, duration: 1.5 }); }
    else el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  }
  function scrollTopNow() {
    Overlay.closeAll(); closeMenu();
    if (lenis) { lenis.start(); lenis.scrollTo(0, { duration: 1.6 }); } else window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function initNavigation() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"][data-scroll], a[href^="#"].nav-link');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = $(id); if (!target) return;
      e.preventDefault();
      id === '#home' ? scrollTopNow() : scrollToEl(target, 0);
      history.replaceState(null, '', id);
    });
    $('#toTop').addEventListener('click', scrollTopNow);

    const header = $('#header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const links = $$('.nav-link');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          links.forEach(l => l.classList.toggle('is-active', l.dataset.section === en.target.id));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['home', 'shop', 'collections', 'custom', 'about', 'contact'].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ===================================================================
     13 · ANIMATIONS (GSAP + ScrollTrigger + Lenis)
  =================================================================== */
  const Motion = (function () {
    let refreshT = null;
    function refreshSoon() { if (!gsapOK) return; clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 250); }

    /* Fade+slide elements in, without leaving inline styles that would block CSS hover effects */
    function animateIn(els, o) {
      els = gsap.utils.toArray(els); if (!els.length) return;
      o = Object.assign({ stagger: .1, duration: 1, delay: 0 }, o || {});
      els.forEach(el => el.classList.add('is-animating'));
      gsap.to(els, {
        opacity: 1, y: 0, duration: o.duration, stagger: o.stagger, delay: o.delay, ease: 'power3.out', overwrite: true,
        onComplete() { els.forEach(el => { el.classList.remove('is-animating'); el.classList.add('is-revealed'); gsap.set(el, { clearProps: 'opacity,transform,visibility' }); }); }
      });
    }

    /* Product cards: hidden until they scroll into view (or immediately after a filter change) */
    function cards(list) {
      if (!gsapOK || !list.length) return;
      gsap.set(list, { opacity: 0, y: 50 });
      const inView = el => el.getBoundingClientRect().top < window.innerHeight * 0.95;
      const now = list.filter(inView), later = list.filter(el => !inView(el));
      animateIn(now, { stagger: .08, duration: .9 });
      if (later.length) ScrollTrigger.batch(later, { start: 'top 92%', once: true, onEnter: b => animateIn(b, { stagger: .1, duration: .9 }) });
    }

    /* Wrap every word in <span.w><span.wi> so lines can slide up out of a mask */
    function splitWords(el) {
      (function walk(node) {
        Array.from(node.childNodes).forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'), wi = document.createElement('span');
              w.className = 'w'; wi.className = 'wi'; wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
        });
      })(el);
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      $$('.w', el).forEach(w => w.setAttribute('aria-hidden', 'true'));
    }

    function initSmoothScroll() {
      if (prefersReduced || typeof window.Lenis !== 'function') return;
      try {
        lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch (e) { lenis = null; }
    }

    /* Falling petals + drifting gold motes behind the hero */
    function initPetals() {
      const layer = $('#petals'); if (!layer || prefersReduced) return;
      const small = window.innerWidth < 768, N = small ? 9 : 18, M = small ? 8 : 16;
      const pairs = [['#fbd3df', '#f0a1b8'], ['#ffffff', '#fbd3df'], ['#cfe0fb', '#8fb0ea'], ['#fff1c9', '#ecd8a2'], ['#fde8ee', '#e8a3b9']];
      const tweens = [];
      for (let i = 0; i < N; i++) {
        const p = document.createElement('i'), pr = pairs[i % pairs.length], s = rand(13, 30);
        p.className = 'petal'; p.style.setProperty('--s', s + 'px'); p.style.setProperty('--c1', pr[0]); p.style.setProperty('--c2', pr[1]);
        layer.appendChild(p);
        const W = () => layer.clientWidth, H = () => layer.clientHeight;
        const fall = gsap.timeline({ repeat: -1, delay: rand(0, 14), repeatRefresh: true })
          .fromTo(p, { x: () => rand(-40, W()), y: -50, rotation: () => rand(0, 360), opacity: 0 },
                     { x: () => '+=' + rand(-160, 200), y: () => H() + 60, rotation: () => '+=' + rand(200, 600), duration: rand(13, 24), ease: 'none' }, 0)
          .to(p, { opacity: rand(.5, .85), duration: 2, ease: 'power1.out' }, 0)
          .to(p, { opacity: 0, duration: 2, ease: 'power1.in' }, '>+=8');
        const sway = gsap.to(p, { xPercent: () => rand(-90, 90), rotationX: () => rand(-50, 50), duration: rand(2.2, 4), ease: 'sine.inOut', yoyo: true, repeat: -1 });
        tweens.push(fall, sway);
      }
      for (let i = 0; i < M; i++) {
        const m = document.createElement('i'); m.className = 'mote'; m.style.setProperty('--s', rand(5, 11) + 'px'); layer.appendChild(m);
        const t = gsap.timeline({ repeat: -1, delay: rand(0, 8), repeatRefresh: true })
          .fromTo(m, { x: () => rand(0, layer.clientWidth), y: () => layer.clientHeight * rand(.5, 1.05), opacity: 0 }, { y: '-=' + rand(160, 320), x: '+=' + rand(-50, 50), duration: rand(7, 12), ease: 'sine.inOut' }, 0)
          .to(m, { opacity: rand(.5, .9), duration: 2 }, 0).to(m, { opacity: 0, duration: 2.5 }, '>+=2');
        tweens.push(t);
      }
      ScrollTrigger.create({ trigger: '#home', start: 'top bottom', end: 'bottom top', onToggle: s => tweens.forEach(t => s.isActive ? t.resume() : t.pause()) });
    }

    /* Floating flower heads around the hero artwork */
    function initFloaters() {
      const box = $('#heroFloaters'); if (!box || !window.BloomArt) return [];
      const defs = [
        { t: 'rose', c: 'pink', w: 104, x: '-9%', y: '6%', r: -14 }, { t: 'daisy', c: 'white', w: 92, x: '81%', y: '-3%', r: 12 },
        { t: 'blossom', c: 'blue', w: 76, x: '92%', y: '44%', r: 20 }, { t: 'bloom', c: 'purple', w: 84, x: '78%', y: '82%', r: -10 },
        { t: 'blossom', c: 'yellow', w: 58, x: '-4%', y: '40%', r: 8 }
      ];
      return defs.map(d => {
        const el = document.createElement('div'); el.className = 'floater'; el.style.cssText = 'left:' + d.x + ';top:' + d.y + ';--w:' + d.w + 'px';
        el.innerHTML = BloomArt.flowerHeadSVG(d.t, d.c, ''); box.appendChild(el);
        gsap.set(el, { rotation: d.r });
        if (!prefersReduced) gsap.to(el, { y: '+=' + rand(12, 22), rotation: d.r + rand(-8, 8), duration: rand(3, 5), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: rand(0, 2) });
        return el;
      });
    }

    function heroIntro(floaters) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('#header', { y: -40, opacity: 0, duration: 1 }, 0)
        .from('#heroLogo', { opacity: 0, y: 24, scale: .94, duration: 1.4, ease: 'power3.out' }, 0.1)
        .from('#heroTitle .wi', { yPercent: 118, duration: 1.3, stagger: .075 }, 0.3)
        .from(['#heroLead', '#heroCta .btn', '#heroTrust li'], { opacity: 0, y: 30, duration: 1, stagger: .1, clearProps: 'opacity,transform' }, 0.9)
        .from('#heroStage', { opacity: 0, y: 70, scale: .9, rotationY: -14, duration: 1.7, ease: 'power3.out', clearProps: 'opacity' }, 0.35)
        .from('#heroImg', { scale: 1.35, duration: 2.2, ease: 'power3.out' }, 0.35)
        .from(floaters, { scale: 0, opacity: 0, duration: 1.1, stagger: .12, ease: 'back.out(1.8)' }, 1.0)
        .from('.hero__badge', { scale: 0, rotation: -90, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, 1.3)
        .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.8);
      return tl;
    }

    function preloader() {
      const pre = $('#preloader');
      return new Promise(resolve => {
        const logo = $('.preloader__logo', pre), bar = $('#preloaderBar');
        const done = () => { pre.remove(); resolve(); };
        const tl = gsap.timeline();
        tl.fromTo(logo, { opacity: 0, y: 18, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }, 0)
          .to(bar, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.15);
        const ready = Promise.all([
          document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
          $('#heroImg').decode ? $('#heroImg').decode().catch(() => { }) : Promise.resolve(),
          new Promise(r => tl.eventCallback('onComplete', r))
        ]);
        Promise.race([ready, new Promise(r => setTimeout(r, 4500))]).then(() => {
          gsap.timeline({ onComplete: done })
            .to(logo, { y: -24, opacity: 0, duration: .55, ease: 'power2.in' })
            .to(pre, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, '-=.15');
          resolve();                                                // start the hero intro while the curtain lifts
        });
      });
    }

    function initScrollEffects() {
      /* headings split into words, revealed on scroll */
      $$('[data-split]').forEach(el => {
        splitWords(el);
        if (el.id === 'heroTitle') return;                          // hero is animated by its own timeline
        gsap.from($$('.wi', el), { yPercent: 118, duration: 1.15, ease: 'power4.out', stagger: .05, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });

      /* generic reveals */
      ScrollTrigger.batch('.reveal', { start: 'top 90%', once: true, onEnter: b => animateIn(b, { stagger: .12, duration: 1 }) });

      /* grids that aren't .reveal (they keep CSS margins/hover) */
      [['.occasion-card', 'top 90%'], ['.social-tile', 'top 92%'], ['.g-item', 'top 94%']].forEach(([sel, start]) => {
        const list = $$(sel); if (!list.length) return;
        gsap.set(list, { opacity: 0, y: 60 });
        ScrollTrigger.batch(list, { start, once: true, onEnter: b => animateIn(b, { stagger: .09, duration: 1 }) });
      });

      /* parallax */
      $$('[data-parallax]').forEach(el => gsap.to(el, { y: parseFloat(el.dataset.parallax) || 40, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } }));
      gsap.to('#heroImg', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('#heroArt', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.configurator__bg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '#custom', start: 'top bottom', end: 'bottom top', scrub: true } });

      /* animated counters */
      $$('.counter').forEach(el => {
        const target = parseFloat(el.dataset.target) || 0, o = { v: 0 };
        ScrollTrigger.create({
          trigger: el, start: 'top 88%', once: true,
          onEnter: () => gsap.to(o, { v: target, duration: target > 10 ? 2.4 : 1.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString(CONFIG.locale); } })
        });
      });
      const inf = $('#statInf');
      if (inf) ScrollTrigger.create({
        trigger: inf, start: 'top 88%', once: true,
        onEnter: () => gsap.fromTo(inf, { scale: .3, opacity: 0, rotation: -120 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.6, ease: 'elastic.out(1,.55)' })
      });

      /* process timeline: line fills as you scroll, steps light up in turn */
      const tlEl = $('#timeline'), steps = $$('.step', tlEl);
      ScrollTrigger.create({
        trigger: tlEl, start: 'top 78%', end: () => (window.innerWidth <= 991 ? 'bottom 62%' : 'top 38%'), scrub: .4,
        onUpdate: self => {
          tlEl.style.setProperty('--p', self.progress.toFixed(3));
          steps.forEach((s, i) => s.classList.toggle('is-in', self.progress >= (i / (steps.length - 1)) * 0.96 + 0.02));
        }
      });
      gsap.from(steps.map(s => $$('h3, p, .step__n', s)).flat(), { opacity: 0, y: 24, duration: .9, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: tlEl, start: 'top 82%', once: true } });
      steps.forEach(s => gsap.set(s, { opacity: 1 }));
    }

    /* Custom cursor, magnetic buttons, hero tilt (desktop only) */
    function initPointerEffects() {
      if (!finePointer || prefersReduced) return;
      const dot = $('#cursorDot'), ring = $('#cursorRing'), label = $('#cursorLabel');
      document.documentElement.classList.add('has-cursor');
      const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
      const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
      window.addEventListener('mousemove', e => { document.documentElement.classList.add('cursor-live'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
      const HOVER = 'a, button, [role="button"], .swatch, .option-card, .seg__btn, .radio-card, .chip, .chip-check, .wish-btn, label[for], summary';
      document.addEventListener('mouseover', e => {
        const v = e.target.closest('[data-cursor]');
        if (v) { label.textContent = v.dataset.cursor; ring.classList.add('is-view'); ring.classList.remove('is-hover'); return; }
        ring.classList.remove('is-view'); ring.classList.toggle('is-hover', !!e.target.closest(HOVER));
      });
      document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
      document.addEventListener('mouseenter', () => { dot.style.opacity = ''; ring.style.opacity = ''; });

      /* magnetic buttons */
      $$('.magnetic').forEach(el => {
        const strength = .32;
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength * 1.2, duration: .45, ease: 'power3.out' });
        });
        el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }));
      });

      /* hero 3D tilt */
      const art = $('#heroArt'), stage = $('#heroStage');
      if (art && stage) {
        const ry2 = gsap.quickTo(stage, 'rotationY', { duration: .9, ease: 'power3' }), rx2 = gsap.quickTo(stage, 'rotationX', { duration: .9, ease: 'power3' });
        art.addEventListener('mousemove', e => {
          const r = art.getBoundingClientRect();
          ry2(((e.clientX - r.left) / r.width - .5) * 14); rx2(-((e.clientY - r.top) / r.height - .5) * 10);
        });
        art.addEventListener('mouseleave', () => { ry2(0); rx2(0); });
      }
    }

    function revealImmediately() {            // reduced-motion / no-GSAP fallback
      document.documentElement.classList.remove('anim-ready');
      const pre = $('#preloader'); if (pre) pre.remove();
    }

    function init() {
      if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
        revealImmediately();
        if (window.gsap && !prefersReduced) gsapOK = false;
        // still need floating flowers in the hero for non-animated browsers
        if (window.BloomArt) { const f = $('#heroFloaters'); if (f) { /* leave empty for reduced motion */ } }
        return;
      }
      gsap.registerPlugin(ScrollTrigger);
      gsapOK = true;
      document.documentElement.classList.add('anim-ready');
      initSmoothScroll();
      const floaters = initFloaters();
      initScrollEffects();
      initPointerEffects();
      initPetals();
      lenis && lenis.stop();
      preloader().then(() => { heroIntro(floaters); if (lenis && !Overlay.any()) lenis.start(); setTimeout(() => ScrollTrigger.refresh(), 600); });
      window.addEventListener('load', () => ScrollTrigger.refresh());
      let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250); });
    }
    return { init, cards, refreshSoon, animateIn };
  })();

  /* ===================================================================
     14 · BOOT
  =================================================================== */
  function boot() {
    Store.load();
    wireLinks();
    renderProducts(false);
    renderCart(); renderWishlist(); syncWishButtons(); updateBadges();
    initNavigation();
    initConfigurator();
    initGallery();
    initSlider();
    initContact();
    $$('.product-card__media').forEach(m => { m.dataset.cursor = 'View'; });

    try { Motion.init(); }
    catch (err) {                       // never let an animation problem hide the shop
      console.error('[BLOOM] animation setup failed — continuing without it:', err);
      document.documentElement.classList.remove('anim-ready'); gsapOK = false;
      const pre = $('#preloader'); if (pre) pre.remove();
      if (lenis) { try { lenis.destroy(); } catch (e) { /* ignore */ } lenis = null; }
    }

    /* Product cards need their entrance animation once GSAP is ready */
    if (gsapOK) Motion.cards($$('.product-card', grid));

    /* keep several open tabs in sync */
    window.addEventListener('storage', e => {
      if (e.key === KEYS.cart || e.key === KEYS.wish) { Store.load(); renderCart(); renderWishlist(); syncWishButtons(); }
    });
  }

  /* Expose a small API so you can tweak things from the console / other scripts */
  window.BloomShop = { CONFIG, PRODUCTS, CFG, PaymentGateway, Store, toast };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
