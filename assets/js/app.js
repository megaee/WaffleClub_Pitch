/* WaffleClub online shop — shared logic for every page.
   Static site: no backend. Cart, orders and the demo account live in the
   browser (localStorage, with a window.name fallback). No payment is taken. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Basics
   * ------------------------------------------------------------------ */
  var body = document.body;
  var ROOT = body.getAttribute('data-root') || './';
  var PAGE = body.getAttribute('data-page') || '';
  function u(p) { return ROOT + (p || ''); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function eur(n) { return '€' + round2(n).toFixed(2); }
  var params = new URLSearchParams(location.search);

  /* ------------------------------------------------------------------ *
   * Data (prices and wording from the pitch deck)
   * ------------------------------------------------------------------ */
  var IRON_PRICE = 1;
  var PLANS = {
    single: { id: 'single', name: 'Single', price: 9.99, pouches: 4, waffles: 16, sub: '4 pouches / month' },
    family: { id: 'family', name: 'Family', price: 19.99, pouches: 10, waffles: 40, sub: '10 pouches / month' },
    party:  { id: 'party',  name: 'Party Box', price: 29, pouches: 12, waffles: 48, sub: 'one box, any time' }
  };
  var GIFTS = {
    1: { months: 1, label: '1 month', price: 12.99, pouches: 4 },
    3: { months: 3, label: '3 months', price: 29.97, pouches: 12 },
    6: { months: 6, label: '6 months', price: 54.99, pouches: 24 }
  };
  var FLAVOURS = [
    { id: 'classic',    name: 'Classic Buttermilk', tags: [],                        label: 'in every plan', img: 'classic-buttermilk.jpg', color: '#e39b2d' },
    { id: 'berry',      name: 'Berry Crush',        tags: ['vegan'],                 label: 'vegan',         img: 'berry-crush.jpg',        color: '#b5452f' },
    { id: 'strawberry', name: 'Strawberry Sunday',  tags: ['gluten-free'],           label: 'gluten-free',   img: 'strawberry-sunday.jpg',  color: '#d0574a' },
    { id: 'oat',        name: 'Oat & Cinnamon',     tags: ['vegan', 'gluten-free'],  label: 'vegan · gluten-free', color: '#c8a26a' },
    { id: 'cheddar',    name: 'Cheddar & Herb',     tags: ['savoury'],               label: 'savoury',       color: '#3e7d5a' },
    { id: 'ginger',     name: 'Gingerbread',        tags: ['seasonal'],              label: 'seasonal',      color: '#8d4b2a' }
  ];
  function flavour(id) { for (var i = 0; i < FLAVOURS.length; i++) if (FLAVOURS[i].id === id) return FLAVOURS[i]; return null; }
  function flavourNames(ids, joinAnd) {
    var n = (ids || []).map(function (id) { var f = flavour(id); return f ? f.name : id; });
    if (joinAnd && n.length > 1) return n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
    return n.join(', ');
  }
  var PAYMENTS = {
    klarna: { name: 'Klarna', sub: 'pay later' },
    paypal: { name: 'PayPal', sub: '1 click' },
    applepay: { name: 'Apple Pay', sub: 'Face ID' }
  };

  /* ------------------------------------------------------------------ *
   * Dates
   * ------------------------------------------------------------------ */
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function addMonths(s, n) { var d = parse(s); var day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return iso(d); }
  function today() { return iso(new Date()); }
  function fmtShort(s) { var d = parse(s); return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MO[d.getMonth()]; }
  function fmtDay(s) { var d = parse(s); return d.getDate() + ' ' + MO[d.getMonth()]; }
  function fmtLong(s) { var d = parse(s); return d.getDate() + ' ' + MO[d.getMonth()] + ' ' + d.getFullYear(); }
  function endOfMonth() { var d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)); }

  /* ------------------------------------------------------------------ *
   * Persistent state
   * ------------------------------------------------------------------ */
  var KEY = 'waffleclub:v1';
  function demoAccount() {
    // "Hi Lisa!" demo account from the deck (slide 15)
    return {
      demo: true, name: 'Lisa', last: 'M.', city: 'Dortmund', plan: 'family', every: '4', status: 'active',
      nextBox: '2026-12-04', flavours: ['classic', 'berry', 'ginger'], pausedUntil: null, cancelAt: null,
      refCode: 'LISA-WAFFLE', skipped: null
    };
  }
  var DEMO_ORDERS = [
    { id: 'WC-261106', date: '2026-11-06', demo: true, status: 'Delivered', payment: 'paypal', items: [{ name: 'Family · 10 pouches', detail: 'Classic Buttermilk, Berry Crush', price: 19.99, qty: 1 }], total: 19.99 },
    { id: 'WC-261009', date: '2026-10-09', demo: true, status: 'Delivered', payment: 'paypal', items: [{ name: 'Family plan + smart iron', detail: 'First box', price: 20.99, qty: 1 }], total: 20.99 }
  ];
  function defaults() { return { cart: [], orders: [], account: demoAccount(), referral: null, offer: null, kpi: {} }; }
  function readStore() {
    try { var v = localStorage.getItem(KEY); if (v) return JSON.parse(v); } catch (e) { /* storage blocked */ }
    try { if (window.name && window.name.indexOf('{"wc":') === 0) return JSON.parse(window.name).wc; } catch (e) { /* ignore */ }
    return null;
  }
  var S = Object.assign(defaults(), readStore() || {});
  if (!S.account) S.account = demoAccount();
  function save() {
    var json = JSON.stringify(S);
    try { localStorage.setItem(KEY, json); } catch (e) { /* fall through */ }
    try { window.name = '{"wc":' + json + '}'; } catch (e) { /* ignore */ }
    updateBadge();
  }

  // Referral links (?ref=CODE) and the gift follow-up offer (?offer=gift50)
  if (params.get('ref')) { S.referral = params.get('ref').toUpperCase().slice(0, 24).replace(/[^A-Z0-9-]/g, ''); save(); }
  if (params.get('offer') === 'gift50') { S.offer = 'gift50'; save(); }

  /* ------------------------------------------------------------------ *
   * Header / footer
   * ------------------------------------------------------------------ */
  var NAV = [
    ['how-it-works', 'How it works', 'how-it-works/'],
    ['shop', 'Shop', 'shop/'],
    ['flavours', 'Flavours', 'flavours/'],
    ['gifts', 'Gifts', 'gifts/'],
    ['help', 'Help', 'help/']
  ];
  var ICON_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  var ICON_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>';
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  function cartCount() { return S.cart.reduce(function (a, i) { return a + i.qty; }, 0); }

  function renderHeader() {
    var host = $('#site-header');
    if (!host) return;
    var section = body.getAttribute('data-nav') || PAGE;
    var links = NAV.map(function (n) {
      return '<a href="' + u(n[2]) + '"' + (section === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    // Header pill follows the deck mockups: "Start now", "Cart (1)" on cart/checkout, "My account" on the account page
    var cta;
    if (PAGE === 'cart' || PAGE === 'checkout') cta = '<a class="btn btn-dark btn-sm header-cta" href="' + u('cart/') + '" data-cart-label>Cart (' + cartCount() + ')</a>';
    else if (PAGE === 'account') cta = '<a class="btn btn-dark btn-sm header-cta" href="' + u('account/') + '">My account</a>';
    else cta = '<a class="btn btn-dark btn-sm header-cta" href="' + u('shop/') + '">Start now</a>';
    host.outerHTML =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="proto-bar">University prototype for the E-Commerce course · no real orders, no payment · <a href="' + u('pitch/') + '">See the pitch</a></div>' +
      '<header class="site-header"><div class="wrap bar">' +
        '<a class="logo" href="' + u('') + '" aria-label="WaffleClub home"><img src="' + u('assets/icons/waffle.png') + '" alt="" width="36" height="36">WaffleClub</a>' +
        '<nav class="main-nav" id="mainNav" aria-label="Main">' + links + '</nav>' +
        '<div class="header-tools">' +
          '<a class="icon-btn" href="' + u('account/') + '" aria-label="My account"' + (PAGE === 'account' ? ' aria-current="page"' : '') + '>' + ICON_USER + '</a>' +
          '<a class="icon-btn" href="' + u('cart/') + '" aria-label="Cart" id="cartIcon"' + (PAGE === 'cart' ? ' aria-current="page"' : '') + '>' + ICON_CART + '<span class="badge" id="cartBadge" hidden>0</span></a>' +
          cta +
          '<button class="icon-btn menu-toggle" id="menuToggle" aria-expanded="false" aria-controls="mainNav" aria-label="Menu">' + ICON_MENU + '</button>' +
        '</div>' +
      '</div></header>';
    var t = $('#menuToggle');
    t.addEventListener('click', function () {
      var open = $('#mainNav').classList.toggle('open');
      t.setAttribute('aria-expanded', String(open));
    });
  }

  function renderFooter() {
    var host = $('#site-footer');
    if (!host) return;
    var cur = function (p) { return PAGE === p ? ' aria-current="page"' : ''; };
    host.outerHTML =
      '<footer class="site-footer"><div class="wrap">' +
        '<div class="f-top">' +
          '<div><a class="logo" href="' + u('') + '"><img src="' + u('assets/icons/waffle.png') + '" alt="" width="36" height="36">WaffleClub</a>' +
          '<p class="tagline">A smart waffle iron for €1, plus a batter subscription</p></div>' +
          '<nav aria-label="Legal"><ul class="f-links">' +
            '<li><a href="' + u('imprint/') + '"' + cur('imprint') + '>Imprint</a></li>' +
            '<li><a href="' + u('privacy/') + '"' + cur('privacy') + '>Privacy</a></li>' +
            '<li><a href="' + u('terms/') + '"' + cur('terms') + '>Terms</a></li>' +
            '<li><a href="' + u('help/#contact') + '">Contact</a></li>' +
          '</ul></nav>' +
        '</div>' +
        '<div class="f-bottom">' +
          '<span><a href="' + u('pitch/') + '">WaffleClub · E-Commerce · Group pitch</a></span>' +
          '<span>Prices incl. 7% VAT · Free delivery in Germany</span>' +
          '<span>Photos: <a href="https://www.pexels.com" rel="noopener" target="_blank">Pexels</a></span>' +
        '</div>' +
      '</div></footer>';
  }

  function updateBadge() {
    var b = $('#cartBadge');
    var n = cartCount();
    if (b) { b.textContent = n; b.hidden = n === 0; }
    var ci = $('#cartIcon');
    if (ci) ci.setAttribute('aria-label', 'Cart, ' + n + (n === 1 ? ' item' : ' items'));
    $$('[data-cart-label]').forEach(function (el) { el.textContent = 'Cart (' + n + ')'; });
  }

  /* ------------------------------------------------------------------ *
   * Toast, dialog, overlay
   * ------------------------------------------------------------------ */
  var toastTimer;
  function toast(msg, action) {
    var t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.innerHTML = '<span>' + esc(msg) + '</span>';
    if (action) {
      var el = document.createElement(action.href ? 'a' : 'button');
      el.textContent = action.label;
      if (action.href) { el.href = action.href; el.style.color = 'var(--caramel)'; el.style.fontWeight = '800'; }
      else { el.type = 'button'; el.addEventListener('click', function () { action.onClick(); t.hidden = true; }); }
      t.appendChild(el);
    }
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, action ? 6000 : 3200);
  }

  function openDialog(title, html, bind) {
    var d = document.createElement('dialog');
    d.setAttribute('aria-labelledby', 'dlg-title');
    d.innerHTML = '<div class="dlg"><div class="dlg-head"><h2 id="dlg-title">' + esc(title) + '</h2><button class="dlg-close" type="button" aria-label="Close">×</button></div>' + html + '</div>';
    document.body.appendChild(d);
    function close() { if (d.open) d.close(); }
    d.addEventListener('close', function () { d.remove(); });
    d.addEventListener('click', function (e) { if (e.target === d) close(); });
    $('.dlg-close', d).addEventListener('click', close);
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    if (bind) bind(d, close);
    return d;
  }

  function overlay(msg) {
    var o = document.createElement('div');
    o.className = 'overlay';
    o.setAttribute('role', 'status');
    o.innerHTML = '<div class="spinner" aria-hidden="true"></div><div>' + esc(msg) + '</div>';
    document.body.appendChild(o);
    return o;
  }

  /* ------------------------------------------------------------------ *
   * Cart
   * ------------------------------------------------------------------ */
  function addItem(item) {
    if (item.type === 'plan') {
      var had = S.cart.some(function (i) { return i.type === 'plan'; });
      S.cart = S.cart.filter(function (i) { return i.type !== 'plan'; });
      S.cart.unshift(Object.assign({ qty: 1 }, item));
      save();
      toast(had ? 'Your plan in the cart was updated' : item.name + ' added to cart', { label: 'Go to cart', href: u('cart/') });
      return;
    }
    var ex = S.cart.filter(function (i) { return i.id === item.id; })[0];
    if (ex && item.type !== 'gift') ex.qty += 1; else S.cart.push(Object.assign({ qty: 1 }, item));
    save();
    toast(item.name + ' added to cart', { label: 'Go to cart', href: u('cart/') });
  }

  function totals() {
    var sub = round2(S.cart.reduce(function (a, i) { return a + i.price * i.qty; }, 0));
    var plan = S.cart.filter(function (i) { return i.type === 'plan'; })[0] || null;
    var discounts = [];
    if (plan && S.referral) discounts.push({ label: "Friend's referral (" + S.referral + ')', amount: 5 });
    if (plan && S.offer === 'gift50') discounts.push({ label: 'Your own plan: first month 50% off', amount: round2(PLANS[plan.plan].price / 2) });
    // offers do not stack: the larger discount wins
    if (discounts.length > 1) discounts = [discounts.reduce(function (a, b) { return b.amount > a.amount ? b : a; })];
    var disc = discounts.reduce(function (a, d) { return a + d.amount; }, 0);
    return { sub: sub, plan: plan, discounts: discounts, total: Math.max(0, round2(sub - disc)) };
  }

  function recurringNote(t) {
    var hasGift = S.cart.some(function (i) { return i.type === 'gift'; });
    if (t.plan) return 'Then ' + eur(PLANS[t.plan.plan].price) + ' every ' + t.plan.every + ' weeks. Skip, pause or cancel in your account. Prices incl. 7% VAT.';
    if (hasGift) return 'One-time payment. No subscription for you. Prices incl. 7% VAT.';
    return 'One box, no subscription. Prices incl. 7% VAT.';
  }

  function itemThumb(i) {
    if (i.type === 'gift') return u('assets/img/gifts.jpg');
    if (i.type === 'party') return u('assets/img/strawberry-sunday.jpg');
    return u('assets/img/berry-crush.jpg');
  }

  /* ------------------------------------------------------------------ *
   * WaffleBot (scripted assistant: answers only with facts from the deck)
   * ------------------------------------------------------------------ */
  var HUMAN = { label: 'Talk to a human', href: u('help/#contact') };
  var BOT_RULES = [
    { re: /(enough|how many waffles|(4|four|5|five|3|three) (people|persons|of us))/i, reply: function () {
      return { text: 'Yes! 10 pouches make about 40 waffles a month. Shall I start Family for you?', actions: [{ label: 'Yes, start Family', href: u('shop/?plan=family') }] }; } },
    { re: /(cancel|quit|stop (my|the) (plan|subscription)|unsubscribe)/i, reply: function () {
      return { text: 'You can cancel at the end of any month in My WaffleClub, and you keep the iron. Before you go: skip next month instead?', actions: [{ label: 'Skip next month instead', href: u('account/?action=skip') }, { label: 'My WaffleClub', href: u('account/') }] }; } },
    { re: /(skip|pause|holiday|vacation|travel|away)/i, reply: function () {
      return { text: 'No problem: skip your next box with 1 click, or pause your plan for 1–3 months at no cost. Both are in My WaffleClub.', actions: [{ label: 'My WaffleClub', href: u('account/') }] }; } },
    { re: /(safe|kid|child|children|son|daughter|burn)/i, reply: function () {
      return { text: 'Safety questions deserve an answer from a person, not from me. A human is one click away, and you can read about the iron on our How it works page.', actions: [HUMAN, { label: 'The iron (specs)', href: u('how-it-works/#iron') }] }; } },
    { re: /(vegan|gluten|savou?ry|allerg|lactose|dairy|vegetarian)/i, reply: function () {
      return { text: 'Yes. Flavours rotate every month, including vegan, gluten-free and savoury options: Berry Crush and Oat & Cinnamon are vegan, Strawberry Sunday and Oat & Cinnamon are gluten-free, Cheddar & Herb is savoury.', actions: [{ label: 'Filter flavours', href: u('flavours/') }] }; } },
    { re: /(gift|present|christmas|birthday present|voucher)/i, reply: function () {
      return { text: 'Yes! Gift boxes come for 1, 3 or 6 months, gift-wrapped with a card and delivered on your date. You pay once, no subscription for you.', actions: [{ label: 'Gift boxes', href: u('gifts/') }] }; } },
    { re: /(party|birthday|event|brunch|guests)/i, reply: function () {
      return { text: 'The Party Box is €29: one box, any time, no subscription. Great for birthdays and events.', actions: [{ label: 'Party Box', href: u('shop/?plan=party') }] }; } },
    { re: /(price|cost|how much|cheap|expensive|per waffle|€|euro)/i, reply: function () {
      return { text: 'The smart iron costs €1 with every plan. Single is €9.99 a month (4 pouches, about €0.62 per waffle), Family is €19.99 (10 pouches, about €0.50 per waffle), and the Party Box is €29 on demand.', actions: [{ label: 'Build my box', href: u('shop/') }] }; } },
    { re: /(pay|paypal|klarna|apple ?pay|card)/i, reply: function () {
      return { text: 'You can pay with PayPal, Klarna (pay later) or Apple Pay. Checkout is one short page: address, payment, done.' }; } },
    { re: /(deliver|shipping|ship|arrive|when.*box|dhl|post)/i, reply: function () {
      return { text: 'Delivery in Germany is free, and your first box ships in 2 days. Shipping details are on our Help page.', actions: [{ label: 'Shipping & returns', href: u('help/#shipping') }] }; } },
    { re: /(iron|qr|scan|how (does|do) (it|this) work|machine|heat|time|measure)/i, reply: function () {
      return { text: 'Scan the pouch: the iron reads the QR code and sets heat and time. Add milk, shake, bake: golden, crispy waffles in four minutes, no measuring.', actions: [{ label: 'How it works', href: u('how-it-works/') }] }; } },
    { re: /(flavou?r|taste|mix|month)/i, reply: function () {
      return { text: "This month's flavours include Classic Buttermilk (in every plan), Berry Crush (vegan) and Strawberry Sunday (gluten-free). There are 6 flavours in total.", actions: [{ label: 'All flavours', href: u('flavours/') }] }; } },
    { re: /(refer|invite|friend|code)/i, reply: function () {
      return { text: 'Invite friends from My WaffleClub: you both get €5.', actions: [{ label: 'Invite friends', href: u('account/?action=invite') }] }; } },
    { re: /(human|person|agent|support|contact|email|phone|call)/i, reply: function () {
      return { text: 'Of course. A human is one click away.', actions: [HUMAN] }; } },
    { re: /^(hi|hello|hey|hallo|moin|good (morning|evening))\b/i, reply: function () {
      return { text: 'Hi! I am WaffleBot. Ask me about plans, flavours, gifts, delivery, or skipping and cancelling.' }; } }
  ];
  function botReply(q) {
    for (var i = 0; i < BOT_RULES.length; i++) if (BOT_RULES[i].re.test(q)) return BOT_RULES[i].reply();
    return { text: "I'm not sure about that one, and I don't want to guess. A human is one click away.", actions: [HUMAN] };
  }
  var CHIPS = ['Is Family enough for 4 people?', 'Is the iron safe for kids?', 'Can I skip or cancel anytime?', 'Is there a vegan option?'];

  function mountBot(host, opts) {
    opts = opts || {};
    host.classList.add('bot');
    host.setAttribute('role', 'region');
    host.setAttribute('aria-label', 'WaffleBot AI assistant');
    host.innerHTML =
      '<div class="bot-head"><span class="dot" aria-hidden="true"></span><span>WaffleBot · AI assistant</span>' +
      (opts.closable ? '<button class="close" type="button" aria-label="Close WaffleBot">×</button>' : '') + '</div>' +
      '<div class="bot-log" aria-live="polite"></div>' +
      '<div class="bot-chips"></div>' +
      '<form class="bot-form" autocomplete="off"><label class="sr-only" for="' + opts.id + '-q">Ask WaffleBot</label>' +
      '<input id="' + opts.id + '-q" type="text" maxlength="200" placeholder="Ask a question…"><button type="submit">Send</button></form>' +
      '<p class="bot-foot">Answered by AI · a human is <a href="' + u('help/#contact') + '">one click away</a></p>';
    var log = $('.bot-log', host);
    function add(who, text, actions) {
      var m = document.createElement('div');
      m.className = 'msg ' + who;
      m.textContent = text;
      if (actions && actions.length) {
        var a = document.createElement('div');
        a.className = 'msg-actions';
        actions.forEach(function (ac) { var l = document.createElement('a'); l.href = ac.href; l.textContent = ac.label; a.appendChild(l); });
        m.appendChild(a);
      }
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
    }
    function ask(q) {
      q = q.trim();
      if (!q) return;
      add('user', q);
      var t = document.createElement('div'); t.className = 'msg bot typing'; t.textContent = 'WaffleBot is typing…'; log.appendChild(t); log.scrollTop = log.scrollHeight;
      setTimeout(function () { t.remove(); var r = botReply(q); add('bot', r.text, r.actions); }, 550);
    }
    (opts.seed || []).forEach(function (s) { add(s[0], s[1], s[2]); });
    var chips = $('.bot-chips', host);
    CHIPS.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c; b.addEventListener('click', function () { ask(c); }); chips.appendChild(b); });
    $('.bot-form', host).addEventListener('submit', function (e) { e.preventDefault(); var i = $('input', host); ask(i.value); i.value = ''; });
    return { ask: ask };
  }

  function floatingBot() {
    var btn = document.createElement('button');
    btn.className = 'bot-launcher';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'botPanel');
    btn.innerHTML = '<span class="bubble" aria-hidden="true">💬</span>Ask WaffleBot';
    var panel = document.createElement('div');
    panel.className = 'bot-panel';
    panel.id = 'botPanel';
    panel.hidden = true;
    document.body.appendChild(panel);
    document.body.appendChild(btn);
    mountBot(panel, { id: 'fbot', closable: true, seed: [['bot', 'Hi! I am WaffleBot, the WaffleClub AI assistant. Ask me about plans, flavours, gifts, delivery, or skipping and cancelling.']] });
    function setOpen(o) { panel.hidden = !o; btn.setAttribute('aria-expanded', String(o)); if (o) $('input', panel).focus(); }
    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    $('.close', panel).addEventListener('click', function () { setOpen(false); btn.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); } });
  }

  /* ------------------------------------------------------------------ *
   * Form validation helper
   * ------------------------------------------------------------------ */
  function setInvalid(field, msg) {
    var f = field.closest('.field');
    if (!f) return;
    var err = $('.error', f);
    if (!err) { err = document.createElement('span'); err.className = 'error'; err.id = (field.id || 'f') + '-err'; f.appendChild(err); }
    if (msg) {
      f.classList.add('invalid'); err.textContent = msg;
      field.setAttribute('aria-invalid', 'true'); field.setAttribute('aria-describedby', err.id);
    } else {
      f.classList.remove('invalid'); err.textContent = '';
      field.removeAttribute('aria-invalid');
    }
  }
  function validate(rules) {
    var first = null;
    rules.forEach(function (r) {
      var msg = r.check(r.el.value.trim(), r.el);
      setInvalid(r.el, msg || '');
      if (msg && !first) first = r.el;
      if (!r.el._wcBound) {
        r.el._wcBound = true;
        r.el.addEventListener('input', function () { if (r.el.closest('.field').classList.contains('invalid')) setInvalid(r.el, r.check(r.el.value.trim(), r.el) || ''); });
      }
    });
    if (first) first.focus();
    return !first;
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var req = function (label) { return function (v) { return v ? '' : label + ' is required.'; }; };

  /* ------------------------------------------------------------------ *
   * Shared renderers
   * ------------------------------------------------------------------ */
  function pouchHTML(f) {
    var q = new Array(26).join('<i></i>');
    return '<div class="pouch-stage"><div class="pouch" style="--c:' + f.color + '" role="img" aria-label="' + esc(f.name) + ' batter pouch"><span class="p-brand">WaffleClub</span><span class="p-name">' + esc(f.name) + '</span><span class="p-qr">' + q + '</span></div></div>';
  }

  /* ================================================================== *
   * Page controllers
   * ================================================================== */
  var pages = {};

  /* ---------- Home (slides 10 + 11) ---------- */
  pages.home = function () {
    var start = $('#startBtn');
    $$('input[name="homeplan"]').forEach(function (r) {
      r.addEventListener('change', function () { start.href = u('shop/?plan=' + r.value); });
    });
    var host = $('#homeBot');
    if (host) mountBot(host, { id: 'hbot', seed: [
      ['user', 'Is Family enough for 4 people?'],
      ['bot', 'Yes! 10 pouches make about 40 waffles a month. Shall I start Family for you?', [{ label: 'Yes, start Family', href: u('shop/?plan=family') }]]
    ] });
    if (S.referral) showReferralBanner($('#refBanner'));
  };

  function showReferralBanner(el) {
    if (!el) return;
    el.hidden = false;
    el.innerHTML = '🎉 A friend invited you (code ' + esc(S.referral) + '). You both get €5 when you start a plan.';
  }

  /* ---------- Shop: build your box (slide 12) ---------- */
  pages.shop = function () {
    var form = $('#builder');
    var st = { plan: 'family', every: '4', picks: ['classic', 'berry'], partyDate: addDays(today(), 2) };
    var qp = params.get('plan');
    if (qp && PLANS[qp]) st.plan = qp;
    if (location.hash === '#party') st.plan = 'party';
    var dateInput = $('#partyDate');
    dateInput.min = addDays(today(), 2);
    dateInput.value = st.partyDate;

    // initial radio state
    $('#plan-' + st.plan).checked = true;
    $$('input[name="pick"]').forEach(function (c) { c.checked = st.picks.indexOf(c.value) > -1; });

    if (S.referral) showReferralBanner($('#refBanner'));
    if (S.offer === 'gift50') { var ob = $('#offerBanner'); ob.hidden = false; }

    function render() {
      var p = PLANS[st.plan];
      var isParty = st.plan === 'party';
      $('#deliverySub').hidden = isParty;
      $('#deliveryParty').hidden = !isParty;
      $$('input[name="pick"]').forEach(function (c) { c.disabled = isParty; });
      $('#flavourHint').textContent = isParty ? 'The Party Box comes with all 6 flavours (12 pouches).' : 'Pick up to 3. We split your ' + p.pouches + ' pouches between them.';
      var status = isParty
        ? 'Step 2: delivery ' + fmtDay(st.partyDate) + ' ✓    Step 3: all 6 flavours ✓'
        : 'Step 2: every ' + st.every + ' weeks ✓    Step 3: ' + st.picks.length + (st.picks.length === 1 ? ' flavour' : ' flavours') + (st.picks.length ? ' ✓' : ' – pick at least 1');
      $('#stepStatus').textContent = status;
      $('#stepStatus').classList.toggle('text-berry', !isParty && !st.picks.length);

      var lines = '';
      var total;
      if (isParty) {
        lines += '<div class="sum-line"><span>Party Box · one box</span><span class="tab">' + eur(p.price) + '</span></div>';
        lines += '<div class="sum-line"><span>Delivery · free</span><span>' + fmtShort(st.partyDate) + '</span></div>';
        lines += '<div class="sum-line"><span>All 6 flavours · 12 pouches</span></div>';
        lines += '<p class="sum-note">No subscription. The smart iron comes with the Single and Family plans.</p>';
        total = p.price;
      } else {
        lines += '<div class="sum-line"><span>' + p.name + ' plan · ' + eur(p.price) + ' / month</span></div>';
        lines += '<div class="sum-line"><span>Smart waffle iron · ' + eur(IRON_PRICE) + '</span></div>';
        lines += '<div class="sum-line"><span>Delivery · free</span></div>';
        lines += '<div class="sum-line"><span>Every ' + st.every + ' weeks · ' + (st.picks.length ? esc(flavourNames(st.picks).replace('Classic Buttermilk', 'Classic')) : 'choose flavours') + '</span></div>';
        lines += '<div class="sum-line"><span>Skip, pause or cancel in your account</span></div>';
        total = p.price + IRON_PRICE;
      }
      $('#sumLines').innerHTML = lines;
      var btn = $('#addBtn');
      btn.textContent = 'Add to cart  ·  ' + eur(total);
      btn.disabled = !isParty && st.picks.length === 0;
      $('#perWaffle').textContent = isParty ? '' : 'About ' + eur(p.price / p.waffles) + ' per waffle (' + p.pouches + ' pouches ≈ ' + p.waffles + ' waffles).';
    }

    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'plan') st.plan = t.value;
      if (t.name === 'every') st.every = t.value;
      if (t.name === 'pick') {
        if (t.checked && st.picks.length >= 3) {
          t.checked = false;
          toast('Pick up to 3 flavours');
          return;
        }
        st.picks = $$('input[name="pick"]:checked').map(function (c) { return c.value; });
      }
      if (t.id === 'partyDate') {
        if (!t.value || t.value < t.min) { t.value = t.min; toast('The earliest delivery date is ' + fmtShort(t.min)); }
        st.partyDate = t.value;
      }
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('#addBtn').addEventListener('click', function () {
      var p = PLANS[st.plan];
      if (st.plan === 'party') {
        addItem({ id: 'party-' + st.partyDate, type: 'party', name: 'Party Box', detail: 'All 6 flavours · 12 pouches · delivery ' + fmtShort(st.partyDate), price: p.price });
      } else {
        if (!st.picks.length) { toast('Pick at least 1 flavour'); return; }
        addItem({ id: 'plan', type: 'plan', plan: st.plan, every: st.every, flavours: st.picks.slice(), name: p.name + ' plan + smart iron', detail: 'Every ' + st.every + ' weeks · ' + flavourNames(st.picks), price: round2(p.price + IRON_PRICE) });
      }
    });
    $('#choosePartyBtn').addEventListener('click', function () {
      $('#plan-party').checked = true; st.plan = 'party'; render();
      $('#step1').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    render();
    if (location.hash === '#party') setTimeout(function () { $('#party').scrollIntoView({ block: 'center' }); }, 50);
  };

  /* ---------- Flavours ---------- */
  pages.flavours = function () {
    var btns = $$('[data-filter]');
    var cards = $$('[data-tags]');
    function apply(f) {
      var shown = 0;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
      cards.forEach(function (c) {
        var ok = f === 'all' || c.getAttribute('data-tags').split(' ').indexOf(f) > -1;
        c.hidden = !ok; if (ok) shown++;
      });
      $('#flavourCount').textContent = shown + (shown === 1 ? ' flavour' : ' flavours') + (f === 'all' ? '' : ' · ' + f);
      $('#noFlavours').hidden = shown > 0;
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        apply(f);
        try { history.replaceState(null, '', f === 'all' ? location.pathname : '?filter=' + f); } catch (e) { /* ignore */ }
      });
    });
    var f0 = params.get('filter');
    apply(['vegan', 'gluten-free', 'savoury'].indexOf(f0) > -1 ? f0 : 'all');
  };

  /* ---------- Gifts (slide 13) ---------- */
  pages.gifts = function () {
    var form = $('#giftForm');
    var date = $('#gDate');
    var min = addDays(today(), 2);
    date.min = min;
    var dec23 = new Date().getFullYear() + '-12-23';
    date.value = dec23 >= min ? dec23 : min;
    var msg = $('#gMsg');
    var counter = $('#gMsgCount');
    function count() { counter.textContent = msg.value.length + ' / 240'; }
    msg.addEventListener('input', count); count();
    $('#addMsgLink').addEventListener('click', function () {
      $('#msgField').hidden = false;
      msg.focus();
      $('#addMsgLink').setAttribute('aria-expanded', 'true');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validate([
        { el: $('#gTo'), check: req("Recipient's name") },
        { el: $('#gFrom'), check: req('Your name') },
        { el: date, check: function (v) { if (!v) return 'Choose a delivery date.'; if (v < min) return 'The earliest delivery date is ' + fmtShort(min) + '.'; return ''; } },
        { el: msg, check: function (v) { return v.length > 240 ? 'Keep the message under 240 characters.' : ''; } }
      ]);
      if (!ok) return;
      var months = ($('input[name="gift"]:checked') || {}).value || '3';
      var g = GIFTS[months];
      var fl = $('#gFlavour').value;
      addItem({
        id: 'gift-' + Date.now(), type: 'gift', months: +months, name: 'Gift box · ' + g.label,
        detail: g.pouches + ' pouches · ' + flavour(fl).name + ' · for ' + $('#gTo').value.trim() + ' · delivery ' + fmtShort(date.value) + ' · gift-wrapped',
        price: g.price,
        gift: { to: $('#gTo').value.trim(), from: $('#gFrom').value.trim(), date: date.value, msg: msg.value.trim(), flavour: fl, months: +months, wrap: true }
      });
    });
  };

  /* ---------- Gift greeting preview (Journey 3: "A gift from Tom") ---------- */
  pages.redeem = function () {
    var g = null;
    var oid = params.get('order');
    if (oid) {
      var o = S.orders.filter(function (x) { return x.id === oid; })[0];
      if (o) { var it = o.items.filter(function (i) { return i.gift; })[+(params.get('item') || 0)] || o.items.filter(function (i) { return i.gift; })[0]; if (it) g = it.gift; }
    }
    if (!g) g = { from: 'Tom', to: '', months: 3, flavour: 'ginger', msg: '', date: null };
    $('#rFrom').textContent = g.from;
    $('#rTo').textContent = g.to ? 'Hi ' + g.to + '!' : 'Hi!';
    $('#rBox').textContent = g.months + '-month gift box · ' + (flavour(g.flavour) || flavour('classic')).name;
    if (g.msg) { $('#rMsg').textContent = '“' + g.msg + '”'; $('#rMsgWrap').hidden = false; }
    $('#rDemo').hidden = !!oid;
  };

  /* ---------- Help: FAQ, shipping, contact ---------- */
  pages.help = function () {
    var form = $('#contactForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validate([
        { el: $('#cName'), check: req('Name') },
        { el: $('#cEmail'), check: function (v) { return !v ? 'Email is required.' : (EMAIL_RE.test(v) ? '' : 'Enter a valid email address.'); } },
        { el: $('#cTopic'), check: function (v) { return v ? '' : 'Choose a topic.'; } },
        { el: $('#cMsg'), check: function (v) { return v.length < 10 ? 'Write at least 10 characters.' : ''; } }
      ]);
      if (!ok) return;
      $('#contactDone').hidden = false;
      $('#contactDoneName').textContent = $('#cName').value.trim();
      form.hidden = true;
      $('#contactDone').focus();
    });
    $('#contactAgain').addEventListener('click', function () { form.reset(); form.hidden = false; $('#contactDone').hidden = true; $('#cName').focus(); });
    var t = params.get('topic');
    if (t) { var o = $('#cTopic option[value="' + t + '"]'); if (o) $('#cTopic').value = t; }
  };

  /* ---------- Cart ---------- */
  pages.cart = function () {
    var host = $('#cartView');
    function render() {
      if (!S.cart.length) {
        host.innerHTML = '<div class="card" style="align-items:flex-start;gap:14px;margin-top:10px"><h2 style="font-size:1.8rem">Your cart is empty</h2><p class="muted">Pick a plan to get your waffle iron for €1, or send a gift box.</p><div class="row-wrap"><a class="btn btn-dark" href="' + u('shop/') + '">Start my WaffleClub →</a><a class="text-link" href="' + u('gifts/') + '">Give it as a gift</a></div></div>';
        updateBadge();
        return;
      }
      var t = totals();
      var items = S.cart.map(function (i, ix) {
        var single = i.type === 'plan' || i.type === 'gift';
        return '<div class="cart-item"><div class="thumb"><img src="' + itemThumb(i) + '" alt="" loading="lazy"></div>' +
          '<div><div class="ci-name">' + esc(i.name) + '</div><div class="ci-detail">' + esc(i.detail || '') + '</div>' +
          (i.type === 'plan' ? '<div class="ci-detail">Then ' + eur(PLANS[i.plan].price) + ' every ' + esc(i.every) + ' weeks</div>' : '') + '</div>' +
          '<div class="ci-right"><span class="qty" aria-label="Quantity"><button type="button" data-dec="' + ix + '" aria-label="Decrease quantity of ' + esc(i.name) + '"' + (single || i.qty <= 1 ? ' disabled' : '') + '>−</button><span>' + i.qty + '</span><button type="button" data-inc="' + ix + '" aria-label="Increase quantity of ' + esc(i.name) + '"' + (single ? ' disabled' : '') + '>+</button></span>' +
          '<span class="ci-price tab">' + eur(i.price * i.qty) + '</span><button class="btn-danger-link" type="button" data-rm="' + ix + '">Remove</button></div></div>';
      }).join('');
      host.innerHTML = '<div class="split"><div><div class="cart-list">' + items + '</div>' +
        '<div class="row-wrap" style="margin-top:20px"><a class="text-link" href="' + u('shop/') + '">Continue shopping</a></div></div>' +
        '<aside class="summary" aria-label="Order summary"><h2>Order summary</h2>' + summaryLines(t) +
        '<a class="btn btn-dark btn-block" href="' + u('checkout/') + '">Checkout  ·  ' + eur(t.total) + '</a>' +
        '<p class="sum-note">' + esc(recurringNote(t)) + '</p></aside></div>';
      $$('[data-inc]', host).forEach(function (b) { b.addEventListener('click', function () { S.cart[+b.getAttribute('data-inc')].qty++; save(); render(); }); });
      $$('[data-dec]', host).forEach(function (b) { b.addEventListener('click', function () { var it = S.cart[+b.getAttribute('data-dec')]; if (it.qty > 1) { it.qty--; save(); render(); } }); });
      $$('[data-rm]', host).forEach(function (b) {
        b.addEventListener('click', function () {
          var ix = +b.getAttribute('data-rm');
          var removed = S.cart.splice(ix, 1)[0];
          save(); render();
          toast(removed.name + ' removed', { label: 'Undo', onClick: function () { S.cart.splice(ix, 0, removed); save(); render(); } });
        });
      });
      updateBadge();
    }
    render();
  };

  function summaryLines(t) {
    var out = S.cart.map(function (i) {
      return '<div class="sum-line"><span>' + esc(i.name) + (i.qty > 1 ? ' × ' + i.qty : '') + '</span><span class="tab">' + eur(i.price * i.qty) + '</span></div>';
    }).join('');
    t.discounts.forEach(function (d) { out += '<div class="sum-line discount"><span>' + esc(d.label) + '</span><span class="tab">−' + eur(d.amount) + '</span></div>'; });
    out += '<div class="sum-line"><span>Delivery (Germany)</span><span>free</span></div>';
    out += '<div class="sum-line total"><span>Total today</span><span class="tab">' + eur(t.total) + '</span></div>';
    return out;
  }

  /* ---------- Checkout (slide 14) ---------- */
  pages.checkout = function () {
    if (!S.cart.length && params.get('preview') === '1') {
      // Pitch slide 14 preview: show the deck's example cart (not saved)
      S.cart = [{ id: 'plan', type: 'plan', plan: 'family', every: '4', flavours: ['classic', 'berry'], name: 'Family plan + smart iron', detail: 'Every 4 weeks · Classic Buttermilk, Berry Crush', price: 20.99, qty: 1 }];
      updateBadge();
      setTimeout(function () { $('#demoFill').click(); }, 0);
    }
    if (!S.cart.length) {
      $('#checkoutView').innerHTML = '<div class="card" style="align-items:flex-start;gap:14px"><h2 style="font-size:1.8rem">Your cart is empty</h2><p class="muted">Add a plan or a gift box before you check out.</p><a class="btn btn-dark" href="' + u('shop/') + '">Go to the shop</a></div>';
      return;
    }
    var t = totals();
    $('#sumLines').innerHTML = summaryLines(t);
    $('#sumNote').textContent = recurringNote(t);
    var place = $('#placeBtn');
    place.textContent = 'Place order  ·  ' + eur(t.total);

    var f = {
      first: $('#coFirst'), last: $('#coLast'), email: $('#coEmail'), street: $('#coStreet'), zip: $('#coZip'), city: $('#coCity')
    };
    if (!S.account.demo) {
      // returning customer: prefill what we know
      f.first.value = S.account.name || '';
      f.city.value = S.account.city || '';
    }
    function deliverTo() {
      var name = f.first.value.trim();
      var li = f.last.value.trim() ? ' ' + f.last.value.trim().charAt(0).toUpperCase() + '.' : '';
      var city = f.city.value.trim();
      $('#deliverTo').textContent = name || city ? (name + li + (city ? ', ' + city : '')) : 'your address below';
    }
    Object.keys(f).forEach(function (k) { f[k].addEventListener('input', deliverTo); });
    deliverTo();
    $('#demoFill').addEventListener('click', function () {
      f.first.value = 'Lisa'; f.last.value = 'Müller'; f.email.value = 'lisa@example.com'; f.street.value = 'Westenhellweg 1'; f.zip.value = '44137'; f.city.value = 'Dortmund';
      deliverTo();
      Object.keys(f).forEach(function (k) { setInvalid(f[k], ''); });
    });
    function syncPay() {
      $$('.pay-card').forEach(function (c) {
        var on = $('input', c).checked;
        var tag = $('.tag', c);
        if (on && !tag) { tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = 'Selected'; c.appendChild(tag); }
        if (!on && tag) tag.remove();
      });
    }
    $$('input[name="pay"]').forEach(function (r) { r.addEventListener('change', syncPay); });
    syncPay();

    $('#checkoutForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = validate([
        { el: f.first, check: req('First name') },
        { el: f.last, check: req('Last name') },
        { el: f.email, check: function (v) { return !v ? 'Email is required.' : (EMAIL_RE.test(v) ? '' : 'Enter a valid email address.'); } },
        { el: f.street, check: req('Street and number') },
        { el: f.zip, check: function (v) { return /^\d{5}$/.test(v) ? '' : 'Enter a 5-digit German postcode.'; } },
        { el: f.city, check: req('City') }
      ]);
      if (!ok) { $('#formErrors').hidden = false; return; }
      $('#formErrors').hidden = true;
      var pay = $('input[name="pay"]:checked').value;
      place.disabled = true;
      var o = overlay('Connecting to ' + PAYMENTS[pay].name + '… (prototype, nothing is charged)');
      setTimeout(function () {
        var tt = totals();
        var id = 'WC-' + String(Date.now()).slice(-6);
        var order = {
          id: id, date: today(), status: 'Confirmed', payment: pay, total: tt.total, sub: tt.sub, discounts: tt.discounts,
          note: recurringNote(tt),
          address: { first: f.first.value.trim(), last: f.last.value.trim(), street: f.street.value.trim(), zip: f.zip.value.trim(), city: f.city.value.trim(), country: 'Germany' },
          email: f.email.value.trim(),
          items: S.cart.map(function (i) { return { name: i.name, detail: i.detail, price: i.price, qty: i.qty, type: i.type, gift: i.gift || null, plan: i.plan || null }; })
        };
        S.orders.unshift(order);
        var plan = tt.plan;
        if (plan) {
          S.account = {
            demo: false, name: order.address.first, last: order.address.last.charAt(0).toUpperCase() + '.', city: order.address.city,
            plan: plan.plan, every: plan.every, status: 'active', nextBox: addDays(today(), 2), flavours: plan.flavours.slice(0, 3),
            pausedUntil: null, cancelAt: null, refCode: (order.address.first.toUpperCase().replace(/[^A-Z]/g, '') || 'FRIEND') + '-WAFFLE', skipped: null
          };
        }
        S.cart = [];
        S.referral = null;
        S.offer = null;
        save();
        o.remove();
        location.href = u('confirmation/?order=' + encodeURIComponent(id));
      }, 1300);
    });
  };

  /* ---------- Order confirmation ---------- */
  pages.confirmation = function () {
    var id = params.get('order');
    var o = S.orders.filter(function (x) { return x.id === id; })[0] || S.orders[0];
    if (!o) {
      $('#confView').innerHTML = '<div class="card" style="align-items:flex-start;gap:14px"><h2 style="font-size:1.8rem">No order found</h2><p class="muted">Orders placed in this browser show up here.</p><a class="btn btn-dark" href="' + u('shop/') + '">Go to the shop</a></div>';
      return;
    }
    $('#confId').textContent = o.id;
    $('#confEmail').textContent = o.email;
    var hasPlan = o.items.some(function (i) { return i.type === 'plan'; });
    var gifts = o.items.filter(function (i) { return i.type === 'gift'; });
    var party = o.items.filter(function (i) { return i.type === 'party'; });
    var next = [];
    if (hasPlan) next.push('Your first box ships in 2 days. Scan the QR code on the first pouch and the iron sets heat and time.');
    gifts.forEach(function (g, ix) {
      next.push('Gift for ' + esc(g.gift.to) + ': delivery on ' + fmtLong(g.gift.date) + ', gift-wrapped. <a class="text-link" href="' + u('gifts/redeem/?order=' + encodeURIComponent(o.id) + '&item=' + ix) + '">Preview the greeting</a>');
    });
    party.forEach(function (p) { next.push('Party Box: ' + esc(p.detail) + '.'); });
    $('#confNext').innerHTML = next.map(function (n) { return '<li>' + n + '</li>'; }).join('');
    var lines = o.items.map(function (i) { return '<div class="sum-line"><span>' + esc(i.name) + (i.qty > 1 ? ' × ' + i.qty : '') + '<br><span class="sum-note">' + esc(i.detail || '') + '</span></span><span class="tab">' + eur(i.price * i.qty) + '</span></div>'; }).join('');
    (o.discounts || []).forEach(function (d) { lines += '<div class="sum-line discount"><span>' + esc(d.label) + '</span><span class="tab">−' + eur(d.amount) + '</span></div>'; });
    lines += '<div class="sum-line"><span>Delivery (Germany)</span><span>free</span></div>';
    lines += '<div class="sum-line total"><span>Paid today</span><span class="tab">' + eur(o.total) + '</span></div>';
    $('#confLines').innerHTML = lines;
    $('#confNote').textContent = o.note || '';
    var a = o.address;
    $('#confAddr').innerHTML = esc(a.first + ' ' + a.last) + '<br>' + esc(a.street) + '<br>' + esc(a.zip + ' ' + a.city) + '<br>' + esc(a.country);
    $('#confPay').textContent = PAYMENTS[o.payment].name + ' · ' + PAYMENTS[o.payment].sub;
    $('#confAccount').hidden = !hasPlan;
    $('#printBtn').addEventListener('click', function () { window.print(); });
  };

  /* ---------- My WaffleClub (slide 15) ---------- */
  pages.account = function () {
    var A = S.account;

    function render() {
      A = S.account;
      var p = PLANS[A.plan];
      var statusLabel = A.status === 'active' ? 'Active' : A.status === 'paused' ? 'Paused' : 'Cancelled';
      $('#acStatus').textContent = 'My WaffleClub · ' + p.name + ' plan · ' + statusLabel;
      $('#acHello').textContent = 'Hi ' + A.name + '!';
      var next;
      if (A.status === 'cancelled') next = 'Your plan ends on ' + fmtLong(A.cancelAt) + '. You keep the iron.';
      else if (A.status === 'paused') next = 'Your plan is paused. Next box: ' + fmtShort(A.nextBox) + '. ' + flavourNames(A.flavours, true) + '.';
      else next = 'Next box: ' + fmtShort(A.nextBox) + '. ' + flavourNames(A.flavours, true) + '.';
      $('#acNext').textContent = next;
      $('#acPill').className = 'status-pill ' + A.status;
      $('#acPill').textContent = statusLabel + ' · ' + eur(p.price) + ' every ' + A.every + ' weeks';

      var off = A.status === 'cancelled';
      // Skip card
      $('#skipSub').textContent = A.status === 'paused' ? 'resume first' : 'moves to ' + fmtDay(addDays(A.nextBox, 28));
      $('#skipCard').disabled = off || A.status === 'paused';
      // Pause card
      $('#pauseName').textContent = A.status === 'paused' ? 'Resume plan' : 'Pause plan';
      $('#pausePrice').textContent = A.status === 'paused' ? '1 click' : '1–3 months';
      $('#pauseSub').textContent = A.status === 'paused' ? 'next box ' + fmtDay(A.nextBox) : 'no cost';
      $('#pauseCard').disabled = off;
      // Change plan card
      $('#changeSub').textContent = 'Single ↔ Family';
      $('#changeCard').disabled = off;
      $('#flavourBtn').disabled = off;
      $('#cancelBtn').textContent = off ? 'Reactivate plan' : 'Cancel plan';
      $('#demoNote').hidden = !A.demo;
      renderOrders();
    }

    function renderOrders() {
      var list = S.orders.slice();
      if (S.account.demo) list = list.concat(DEMO_ORDERS);
      var tb = $('#ordersBody');
      if (!list.length) { tb.innerHTML = '<tr><td colspan="5" class="muted">No orders yet.</td></tr>'; return; }
      tb.innerHTML = list.map(function (o, ix) {
        return '<tr><td class="tab">' + esc(fmtLong(o.date)) + '</td><td>' + esc(o.id) + '</td><td>' + o.items.map(function (i) { return esc(i.name) + (i.qty > 1 ? ' × ' + i.qty : ''); }).join('<br>') + '</td><td class="num tab">' + eur(o.total) + '</td><td><span class="muted">' + esc(o.status) + '</span> · <button class="btn-danger-link" style="color:var(--ink-2)" type="button" data-invoice="' + ix + '">Invoice</button></td></tr>';
      }).join('');
      $$('[data-invoice]', tb).forEach(function (b) { b.addEventListener('click', function () { showInvoice(list[+b.getAttribute('data-invoice')]); }); });
    }

    function skip() {
      var before = S.account.nextBox;
      S.account.nextBox = addDays(before, 28);
      S.account.skipped = before;
      save(); render();
      toast('Next box skipped. New date: ' + fmtShort(S.account.nextBox), { label: 'Undo', onClick: function () { S.account.nextBox = before; save(); render(); } });
    }

    $('#skipCard').addEventListener('click', skip);

    $('#pauseCard').addEventListener('click', function () {
      if (S.account.status === 'paused') {
        S.account.status = 'active';
        S.account.pausedUntil = null;
        // resuming early brings back the box that was planned before the pause
        if (S.account.pausedFrom) { S.account.nextBox = S.account.pausedFrom; S.account.pausedFrom = null; }
        if (S.account.nextBox < addDays(today(), 2)) S.account.nextBox = addDays(today(), 2);
        save(); render(); toast('Welcome back! Your plan is active again. Next box: ' + fmtShort(S.account.nextBox) + '.');
        return;
      }
      openDialog('Pause plan', '<p class="muted">Pause for 1–3 months at no cost. You can resume any time.</p>' +
        '<fieldset class="options" style="grid-template-columns:repeat(3,minmax(0,1fr))"><legend class="sr-only">Pause length</legend>' +
        [1, 2, 3].map(function (n) { return '<label class="opt-card"><input type="radio" name="pauseN" value="' + n + '"' + (n === 1 ? ' checked' : '') + '><span class="opt-name">' + n + (n === 1 ? ' month' : ' months') + '</span><span class="opt-sub">until ' + fmtDay(addMonths(S.account.nextBox, n)) + '</span></label>'; }).join('') +
        '</fieldset><div class="dlg-actions"><button class="btn btn-light btn-sm" type="button" data-x>Keep my plan</button><button class="btn btn-dark btn-sm" type="button" data-ok>Pause plan</button></div>',
        function (d, close) {
          $('[data-x]', d).addEventListener('click', close);
          $('[data-ok]', d).addEventListener('click', function () {
            var n = +$('input[name="pauseN"]:checked', d).value;
            S.account.status = 'paused';
            S.account.pausedFrom = S.account.nextBox;
            S.account.nextBox = addMonths(S.account.nextBox, n);
            S.account.pausedUntil = S.account.nextBox;
            save(); close(); render();
            toast('Plan paused. Your next box arrives ' + fmtShort(S.account.nextBox) + '.');
          });
        });
    });

    $('#changeCard').addEventListener('click', function () {
      var cur = S.account.plan;
      openDialog('Change plan', '<p class="muted">Switch anytime. The new plan starts with your next box.</p>' +
        '<fieldset class="options" style="grid-template-columns:repeat(2,minmax(0,1fr))"><legend class="sr-only">Plan</legend>' +
        ['single', 'family'].map(function (id) { var p = PLANS[id]; return '<label class="opt-card"><input type="radio" name="newPlan" value="' + id + '"' + (id === cur ? ' checked' : '') + '><span class="opt-name">' + p.name + '</span><span class="opt-price">' + eur(p.price) + '</span><span class="opt-sub">' + p.sub + '</span></label>'; }).join('') +
        '</fieldset><div class="dlg-actions"><button class="btn btn-light btn-sm" type="button" data-x>Cancel</button><button class="btn btn-dark btn-sm" type="button" data-ok>Save plan</button></div>',
        function (d, close) {
          $('[data-x]', d).addEventListener('click', close);
          $('[data-ok]', d).addEventListener('click', function () {
            var v = $('input[name="newPlan"]:checked', d).value;
            close();
            if (v === cur) return;
            S.account.plan = v; save(); render();
            toast('Plan changed to ' + PLANS[v].name + ' from your next box.');
          });
        });
    });

    $('#flavourBtn').addEventListener('click', function () {
      openDialog('Flavours for your next box', '<p class="muted">Pick up to 3 flavours.</p><div class="grid grid-2" style="gap:10px">' +
        FLAVOURS.map(function (f) { return '<label class="opt-card compact checkbox"><input type="checkbox" name="nf" value="' + f.id + '"' + (S.account.flavours.indexOf(f.id) > -1 ? ' checked' : '') + '><span class="check-dot" aria-hidden="true"></span><span><span class="display">' + f.name + '</span><br><span class="small muted">' + f.label + '</span></span></label>'; }).join('') +
        '</div><p class="small text-berry" data-err hidden>Pick between 1 and 3 flavours.</p><div class="dlg-actions"><button class="btn btn-light btn-sm" type="button" data-x>Cancel</button><button class="btn btn-dark btn-sm" type="button" data-ok>Save flavours</button></div>',
        function (d, close) {
          $$('input[name="nf"]', d).forEach(function (c) {
            c.addEventListener('change', function () {
              if ($$('input[name="nf"]:checked', d).length > 3) { c.checked = false; $('[data-err]', d).hidden = false; }
            });
          });
          $('[data-x]', d).addEventListener('click', close);
          $('[data-ok]', d).addEventListener('click', function () {
            var v = $$('input[name="nf"]:checked', d).map(function (c) { return c.value; });
            if (!v.length || v.length > 3) { $('[data-err]', d).hidden = false; return; }
            S.account.flavours = v; save(); close(); render();
            toast('Flavours saved for your next box.');
          });
        });
    });

    function invite() {
      var link = new URL(u(''), location.href).href + '?ref=' + encodeURIComponent(S.account.refCode);
      openDialog('Invite friends', '<p>Share your link. When a friend starts a plan, <strong>you both get €5</strong>.</p>' +
        '<div class="field"><label for="refLink">Your referral link</label><div class="copy-row"><input id="refLink" class="input" type="text" readonly value="' + esc(link) + '"><button class="btn btn-dark btn-sm" type="button" data-copy>Copy</button></div></div>' +
        '<p class="small muted">Your code: <strong>' + esc(S.account.refCode) + '</strong></p>' +
        '<div class="dlg-actions">' + (navigator.share ? '<button class="btn btn-light btn-sm" type="button" data-share>Share…</button>' : '') + '<button class="btn btn-caramel btn-sm" type="button" data-x>Done</button></div>',
        function (d, close) {
          $('[data-x]', d).addEventListener('click', close);
          $('[data-copy]', d).addEventListener('click', function () {
            var inp = $('#refLink', d);
            function done() { toast('Link copied'); }
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(inp.value).then(done, function () { inp.select(); document.execCommand('copy'); done(); });
            else { inp.select(); document.execCommand('copy'); done(); }
          });
          var sh = $('[data-share]', d);
          if (sh) sh.addEventListener('click', function () { navigator.share({ title: 'WaffleClub', text: 'Your waffle iron for €1. We both get €5:', url: link }).catch(function () {}); });
        });
    }
    $('#inviteBtn').addEventListener('click', invite);

    $('#cancelBtn').addEventListener('click', function () {
      if (S.account.status === 'cancelled') {
        S.account.status = 'active'; S.account.cancelAt = null;
        if (S.account.nextBox < addDays(today(), 2)) S.account.nextBox = addDays(today(), 2);
        save(); render(); toast('Your plan is active again.');
        return;
      }
      var end = endOfMonth();
      // Journey 2 (Leo): the AI assistant offers "Skip next month instead?" before cancelling
      openDialog('Cancel plan', '<div class="bot-offer"><span class="who">WaffleBot · AI assistant</span><p>Exam stress or a busy month? Skip next month instead? Your next box would move to ' + fmtShort(addDays(S.account.nextBox, 28)) + '.</p></div>' +
        '<div class="row-wrap"><button class="btn btn-dark btn-sm" type="button" data-skip>Skip next month instead</button><button class="btn btn-light btn-sm" type="button" data-pause>Pause instead</button></div>' +
        '<hr style="border:0;border-top:1px solid var(--line);width:100%">' +
        '<p class="small">Cancelling is easy too: your plan ends at the end of this month (' + fmtLong(end) + '). You keep the iron.</p>' +
        '<div class="dlg-actions"><button class="btn btn-light btn-sm" type="button" data-x>Keep my plan</button><button class="btn btn-outline btn-sm" type="button" data-cancel style="color:var(--berry)">Cancel my plan</button></div>',
        function (d, close) {
          $('[data-x]', d).addEventListener('click', close);
          $('[data-skip]', d).addEventListener('click', function () { close(); if (S.account.status === 'paused') { toast('Your plan is paused. Resume it first.'); return; } skip(); });
          $('[data-pause]', d).addEventListener('click', function () { close(); $('#pauseCard').click(); });
          $('[data-cancel]', d).addEventListener('click', function () {
            S.account.status = 'cancelled'; S.account.cancelAt = end;
            save(); close(); render();
            toast('Plan cancelled. It ends on ' + fmtLong(end) + '. You keep the iron.', { label: 'Undo', onClick: function () { S.account.status = 'active'; S.account.cancelAt = null; save(); render(); } });
          });
        });
    });

    $('#partySuggest').addEventListener('click', function () {
      addItem({ id: 'party-' + addDays(today(), 2), type: 'party', name: 'Party Box', detail: 'All 6 flavours · 12 pouches · delivery ' + fmtShort(addDays(today(), 2)), price: PLANS.party.price });
    });
    $('#resetDemo').addEventListener('click', function () {
      S.account = demoAccount(); S.orders = []; save(); render(); toast('Demo account reset.');
    });

    function showInvoice(o) {
      var net = round2(o.total / 1.07);
      var vat = round2(o.total - net);
      var a = o.address || { first: S.account.name, last: S.account.last, street: '', zip: '', city: S.account.city, country: 'Germany' };
      var html = '<div class="invoice-print"><p class="small muted">WaffleClub (fictional student company) · Dortmund, Germany</p>' +
        '<p><strong>Invoice ' + esc(o.id) + '</strong> · ' + esc(fmtLong(o.date)) + '</p>' +
        '<p class="small">' + esc(a.first + ' ' + a.last) + (a.street ? '<br>' + esc(a.street) : '') + '<br>' + esc((a.zip ? a.zip + ' ' : '') + a.city) + '</p>' +
        '<div class="table-wrap"><table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Amount</th></tr></thead><tbody>' +
        o.items.map(function (i) { return '<tr><td>' + esc(i.name) + '</td><td class="num">' + i.qty + '</td><td class="num tab">' + eur(i.price * i.qty) + '</td></tr>'; }).join('') +
        (o.discounts || []).map(function (dd) { return '<tr><td>' + esc(dd.label) + '</td><td></td><td class="num tab">−' + eur(dd.amount) + '</td></tr>'; }).join('') +
        '<tr><td>Delivery (Germany)</td><td></td><td class="num">free</td></tr>' +
        '<tr><td>Net</td><td></td><td class="num tab">' + eur(net) + '</td></tr><tr><td>VAT 7%</td><td></td><td class="num tab">' + eur(vat) + '</td></tr>' +
        '<tr><td><strong>Total</strong></td><td></td><td class="num tab"><strong>' + eur(o.total) + '</strong></td></tr></tbody></table></div>' +
        '<p class="small muted">Paid with ' + esc(PAYMENTS[o.payment] ? PAYMENTS[o.payment].name : 'PayPal') + '. Prototype invoice, not a tax document.</p></div>';
      openDialog('Invoice', html + '<div class="dlg-actions no-print"><button class="btn btn-light btn-sm" type="button" data-print>Print</button><button class="btn btn-dark btn-sm" type="button" data-x>Close</button></div>', function (d, close) {
        $('[data-x]', d).addEventListener('click', close);
        $('[data-print]', d).addEventListener('click', function () {
          body.classList.add('print-dialog');
          window.print();
          setTimeout(function () { body.classList.remove('print-dialog'); }, 500);
        });
      });
    }

    render();
    var act = params.get('action');
    if (act === 'skip' && S.account.status === 'active') skip();
    if (act === 'invite') invite();
  };

  /* ---------- Pitch page (slides 1–17) ---------- */
  pages.pitch = function () {
    // Slide index highlighting
    var links = $$('.slide-index a');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); });
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('.slide').forEach(function (s) { io.observe(s); });
    }
    // Live page previews scaled into browser frames (slides 10–15)
    function fit() {
      $$('.frame-view').forEach(function (v) {
        var ifr = $('iframe', v);
        if (!ifr) return;
        var s = v.clientWidth / 1280;
        ifr.style.transform = 'scale(' + s + ')';
        v.style.height = Math.round(800 * s) + 'px';
      });
    }
    window.addEventListener('resize', fit);
    fit();
    // KPI dashboard (slide 16): compare your own numbers with the targets
    $$('[data-kpi]').forEach(function (inp) {
      var key = inp.getAttribute('data-kpi');
      var out = $('[data-kpi-out="' + key + '"]');
      var tgt = +inp.getAttribute('data-target');
      var mode = inp.getAttribute('data-mode');
      function evalK() {
        var raw = inp.value.trim();
        S.kpi[key] = raw; save();
        if (raw === '') { out.textContent = 'Enter a value'; out.className = 'kpi-out'; return; }
        var v = parseFloat(raw.replace(',', '.'));
        if (isNaN(v)) { out.textContent = 'Not a number'; out.className = 'kpi-out bad'; return; }
        var ok = mode === 'min' ? v >= tgt : v < tgt;
        out.textContent = ok ? 'On target ✓' : 'Off target';
        out.className = 'kpi-out ' + (ok ? 'good' : 'bad');
      }
      if (S.kpi && S.kpi[key] != null) inp.value = S.kpi[key];
      inp.addEventListener('input', evalK);
      evalK();
    });
    var resetK = $('#kpiReset');
    if (resetK) resetK.addEventListener('click', function () { $$('[data-kpi]').forEach(function (i) { i.value = ''; i.dispatchEvent(new Event('input')); }); });
  };

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  renderHeader();
  renderFooter();
  updateBadge();
  if (pages[PAGE]) pages[PAGE]();
  // header/footer are injected after load, so re-apply deep links like help/#contact or pitch/#s6
  var inFrame = window.self !== window.top;
  if (inFrame && params.get('section')) {
    // pitch-page previews: scroll only this frame (scrollIntoView would also move the parent page)
    var sec = document.getElementById(params.get('section'));
    var jump = function () { if (sec) document.scrollingElement.scrollTop = sec.getBoundingClientRect().top + document.scrollingElement.scrollTop - 90; };
    setTimeout(jump, 80);
    window.addEventListener('load', jump);
  }
  if (location.hash.length > 1 && !inFrame) {
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      // web fonts and images change heights after first paint: re-align until the user scrolls themselves
      var userMoved = false;
      var stop = function () { userMoved = true; };
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
      var align = function () { if (!userMoved) target.scrollIntoView({ block: 'start' }); };
      setTimeout(align, 80);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(align, 30); });
      window.addEventListener('load', function () { setTimeout(align, 30); });
    }
  }
  if (PAGE !== 'home' && PAGE !== 'pitch' && !body.hasAttribute('data-no-bot') && !inFrame) floatingBot();
  // keep the badge in sync across tabs
  window.addEventListener('storage', function (e) { if (e.key === KEY) { var v = readStore(); if (v) { S = Object.assign(defaults(), v); updateBadge(); } } });
})();
