# BLOOM by Vish — website

A premium, fully responsive site for handmade pipe-cleaner flowers.
Plain HTML + CSS + JavaScript, Bootstrap 5 (grid only), GSAP + ScrollTrigger, Lenis smooth-scroll.
**Everything is bundled locally — just double-click `index.html`.** No internet, server or build step needed.

---

## ⚠️ Read this first — things to replace before launch

| What | Where | Status |
|---|---|---|
| **Logo** | `assets/images/logo.png`, `logo-nav.png`, `assets/icons/favicon.png` | ✅ Your real BLOOM by Vish logo (cut out as a transparent circle, unchanged). |
| **Product & gallery photos** | `assets/images/*.jpg` | Placeholders — illustrations of pipe-cleaner flowers drawn in code. Swap in your real photos. |
| **WhatsApp number & e-mail** | top of `js/script.js` → `CONFIG` | Empty. Until you set them, WhatsApp buttons open WhatsApp with the message ready and let the customer pick a contact, and the e-mail link opens a blank draft. |
| **Star ratings** | `PRODUCTS[].rating` | **Sample values.** Replace with real ones (or delete the `rating` display) before launch. |
| **Customer reviews** | `index.html` → section `#reviews` | Your three example quotes, attributed to "A BLOOM by Vish customer". Replace with real reviews and names (with permission). |
| **Stats** ("1000+ Petals Crafted") | `index.html` → section `#why` | Your numbers from the brief — change `data-target` if you want different values. |
| **About story** | `index.html` → section `#about` | Written to be warm and general. Add your own real story, dates and details. |
| **Prices / delivery fees / free-delivery limit** | `js/script.js` | Sample prices in ₹ — set your own. |
| **Instagram** | `CONFIG.instagram` | Set to `https://www.instagram.com/bloombyvish`. |

---

## 1 · Project structure

```
bloom-by-vish/
├── index.html                 ← the whole page (all 15 sections + cart/checkout/modals)
├── README.md                  ← this file
├── css/
│   ├── style.css              ← all custom styling (design tokens at the top)
│   ├── theme.css              ← the "Midnight Orchid" look: gradients, glow, decorations (delete its <link> to go back to the old look)
│   └── vendor/bootstrap.min.css
├── js/
│   ├── script.js              ← shop logic, forms, GSAP animations  ← YOU EDIT THIS ONE
│   ├── theme.js               ← floating flowers, sparkles, hero halo, wavy edges (edit the DECOR list to move/remove them)
│   ├── art.js                 ← draws the placeholder pipe-cleaner flowers & the live bouquet preview
│   └── vendor/                ← gsap, ScrollTrigger, lenis (local copies)
└── assets/
    ├── images/                ← logo + every photo on the site (replace these)
    ├── icons/favicon.png + apple-touch-icon.png
    └── fonts/                 ← Cormorant Garamond, Jost, Pinyon Script (self-hosted)
```

**Colours** live at the top of `css/style.css` under `:root` (`--navy` = deep plum, `--pink` = orchid pink, `--violet`, `--gold` …); `--aurora` is the pink→violet→blue gradient used on buttons and headings.

> **Note:** `art.js` also powers the **live bouquet preview** in "Create Your Own Bloom" and the cart thumbnails for custom bouquets, so keep that file even after you replace all the photos.

---

## 2 · Adding / replacing images

Every image is a plain file in `assets/images/`. **Keep the same file name and just overwrite the file** — nothing else to change.

| File | Used for | Suggested size |
|---|---|---|
| `logo.png` | Hero, loader, footer | transparent PNG, 900 × 900 |
| `logo-nav.png` | Top navigation (small round version) | transparent PNG, 260 × 260 |
| `hero-flower.jpg` | Hero arch | 4:5 portrait, 1200 × 1500 |
| `product-1.jpg` … `product-8.jpg` | Shop cards + product window | 4:5 portrait, 900 × 1125 |
| `occasion-*.jpg` (8) | Occasion cards | 4:5 portrait |
| `gallery-1.jpg` … `gallery-12.jpg` | Masonry gallery (any aspect ratio works) | width ≥ 900 |
| `social-1.jpg` … `social-6.jpg` | "Follow The Bloom" tiles | square, 900 × 900 |
| `about-1.jpg`, `about-2.jpg` | About collage | 4:5 portrait |

Tips: export JPGs at ~80 % quality (under 300 KB each) so the page stays fast. If a gallery photo has a different shape than the placeholder, update the `width`/`height` attributes on its `<img>` in `index.html` (this just prevents layout jumps).

**Adding a gallery photo:** copy one `<figure class="g-item" …>…</figure>` block in `index.html` (section `#galleryGrid`), change `src`, `alt`, `data-cap` (the caption) and `data-cat` (`closeup`, `bouquet`, `making`, `packaging`, `orders` or `custom`).

### Real 360° product view (optional)
By default the product window gives a 3D "turn the card" view from the single photo. For a genuine 360° spin, photograph the bouquet on a turntable (24–36 shots), save them as `assets/images/360/blue-bliss-01.jpg …`, and add them to the product:

```js
images360: ['assets/images/360/blue-bliss-01.jpg', 'assets/images/360/blue-bliss-02.jpg', /* … */],
```
Dragging then scrubs through the frames and the "360° view" button auto-plays them.

---

## 3 · Changing products, prices and options

Open `js/script.js` and find **`② PRODUCTS`**. Each product is one block:

```js
{ id: 'blue-bliss',                 // unique, no spaces
  name: 'Blue Bliss Bouquet',
  price: 1299,                      // base price in ₹
  rating: 4.9,                      // sample — replace with a real rating
  category: 'bouquet',              // bouquet | single | mini | custom  (the filter chips)
  badge: 'Signature',               // small label on the card (or remove the line)
  short: 'One-line description for the card.',
  long:  'Longer description shown in the product window.',
  occasions: ['birthday', 'friendship'],   // birthday, anniversary, valentine, friendship,
                                            // wedding, proposal, thanks, justbecause
  image: 'assets/images/product-1.jpg',
  colors: ['Blue', 'Royal', 'Pink', 'White'],   // swatches the customer can pick
  sizes: SIZE_SETS.bouquet,                      // or write your own: [{id:'s',name:'Small',add:0}, …]
  customName: false,                // true → shows a "Name on tag" box
  colorImages: { Blue: 'assets/images/product-1-blue.jpg' } }   // optional: photo changes with the colour swatch
```

* **Add a product:** copy a block, give it a new `id` and image path (e.g. `product-9.jpg`). It appears in the shop, search, wishlist and filters automatically.
* **Remove a product:** delete its block.
* **Size prices:** edit `SIZE_SETS` just above `PRODUCTS` (`add` = extra rupees on top of the base price).
* **Colours:** the swatch colour for each name is in `COLOR_HEX`.
* **Currency:** `CONFIG.currency` and `CONFIG.locale` (for ₹ with Indian number formatting).
* **Delivery:** `CONFIG.shipping` (fee, "free over" amount) and `CONFIG.freeShippingThreshold` (drives the progress bar in the cart).

### The bouquet builder's prices
Find **`③ CONFIGURATOR OPTIONS`** (`const CFG`). Change the price per flower (`CFG.flowers[].price`), size / wrapping / ribbon extras (`add`), the name-tag fee (`nameTag`) and message-card fee (`messageCard`). The live total and breakdown update automatically.

---

## 4 · Connecting WhatsApp

1. In `js/script.js` set your number in `CONFIG` — **international format, digits only, no `+` or spaces**:
   ```js
   whatsappNumber: '919876543210',   // +91 98765 43210
   ```
2. That's it. This switches on:
   * the WhatsApp icons (menu, contact section, footer),
   * **"Order on WhatsApp instead"** in the cart — sends the full cart as a message,
   * **"Send on WhatsApp"** after the custom-request form,
   * **"Confirm on WhatsApp"** on the order-success screen.

Also set `email: 'you@yourdomain.com'` so the e-mail links and the contact section show your address.

---

## 5 · Taking real payments later (payment gateway / backend)

The checkout is a complete front-end. Today it validates the form, builds a clean `order` object, saves it in `localStorage` (`bv_orders_v1`) and shows a success screen — **no money is taken**. Everything is routed through one object, **`PaymentGateway`** (section `④` of `js/script.js`), so connecting a real provider only means filling in two functions:

```js
const PaymentGateway = {
  demo: true,                         // ← set to false once connected
  createOrder(order) { … },           // 1) tell YOUR server about the order
  pay(order, created) { … }           // 2) open the gateway's payment screen
};
```

The `order` you receive:

```js
{ id:'BV-3F9K2A', createdAt:'2026-…', currency:'INR',
  customer:{ name, email, phone, address, city, state, pin, note },
  shipping:{ id, name, fee }, payment:'upi' | 'card' | 'cod',
  items:[ { id, qty, color, size, tag, unitPrice, title, custom? } ],
  subtotal, total }
```

> 🔒 **Security rule:** never trust the prices in the browser. Your server must **recompute the total from its own price list** before creating a payment. The front-end total is for display only.

### Example A — Razorpay (popular in India)

**Server (Node/Express sketch):**
```js
// npm i razorpay express
app.post('/api/orders', async (req, res) => {
  const order = req.body;
  const total = computeTotalOnServer(order.items, order.shipping.id);      // ← your own price list
  const rp = await razorpay.orders.create({ amount: total * 100, currency: 'INR', receipt: order.id });
  saveOrder({ ...order, total, gatewayOrderId: rp.id, status: 'created' });
  res.json({ ok: true, gatewayOrderId: rp.id, amount: rp.amount, key: process.env.RAZORPAY_KEY_ID });
});
app.post('/api/verify', (req, res) => { /* verify the HMAC signature, mark order paid */ });
```

**Front-end** — add `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` to `index.html`, then:
```js
const PaymentGateway = {
  demo: false,
  createOrder: order => fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) }).then(r => r.json()),
  pay: (order, created) => new Promise(resolve => {
    new Razorpay({
      key: created.key, order_id: created.gatewayOrderId, amount: created.amount, currency: 'INR', name: 'BLOOM by Vish',
      prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.phone },
      theme: { color: '#1f2d5c' },
      handler: r => fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) })
                      .then(v => v.json()).then(v => resolve({ ok: v.ok, paymentId: r.razorpay_payment_id })),
      modal: { ondismiss: () => resolve({ ok: false, error: 'Payment cancelled' }) }
    }).open();
  })
};
```

### Example B — Stripe Checkout (redirect)
```js
pay: (order, created) => { window.location.href = created.checkoutUrl; return new Promise(() => {}); }
```
with your server creating a Stripe Checkout Session in `createOrder` and returning `{ ok:true, checkoutUrl }`.

### No developer? Easy alternatives
* **Keep WhatsApp ordering** (already built) and collect payment by UPI on the chat.
* Use a hosted **payment link** (Razorpay Payment Links / Stripe Payment Links): in `pay()`, `window.open()` the link and `resolve({ ok: true })`.
* To **store orders somewhere** without a server, post them to a form service (Formspree, Getform, Google Apps Script) inside `createOrder`.

### Custom-request form
Set `CONFIG.formEndpoint` to a Formspree / Getform URL and requests are posted there as JSON. With it empty, the form still validates and offers one-tap "Send on WhatsApp / by Email".

---

## 6 · Features checklist (all working, no backend needed)

Shopping cart (add / remove / quantities, persisted in localStorage) · wishlist · product search (overlay + shop toolbar) · category & occasion filtering · sort · quick view & product window with colour/size/quantity, Buy Now and a 3D/360° viewer · live bouquet configurator with price breakdown · checkout UI with validation and gateway hook · gallery filter + lightbox (keyboard + swipe) · review slider · contact form validation · toast notifications · mobile menu · custom cursor (desktop only) · magnetic buttons · parallax · counters · smooth scrolling · respects "reduce motion".

## 7 · Troubleshooting

* **Reset the demo cart / wishlist / orders:** in the browser console run `localStorage.clear()` and reload.
* **Fonts look different:** keep the `assets/fonts` folder next to `css/`.
* **Hosting:** upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, Hostinger…). `index.html` must stay at the root.
