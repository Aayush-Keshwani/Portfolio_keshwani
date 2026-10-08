// Contact rows. Rows with an empty value stay hidden.
var CONTACT = [
  { label: 'Email', value: 'aayushkeshwani@outlook.com' },
  { label: 'LinkedIn', value: 'linkedin.com/in/aayush-keshwani', href: 'https://www.linkedin.com/in/aayush-keshwani/' },
  { label: 'GitHub', value: 'github.com/Aayush-Keshwani', href: 'https://github.com/Aayush-Keshwani' }
];

(function () {
  var INK = '#14213d';
  function $(id) { return document.getElementById(id); }
  var world = $('world'), wback = $('wback'), spacer = $('spacer'), bot = $('bot'), flip = $('flip');
  var fill = $('fill'), levelEl = $('level'), xpEl = $('xp'), hint = $('hint'), pond = $('pond');
  var zWalk = $('zWalk'), zWater = $('zWater'), zSky = $('zSky');
  var par = [].slice.call(document.querySelectorAll('[data-par]'));
  var screens = [].slice.call(document.querySelectorAll('.screen'));
  var F = 1.0; // scroll pixels per world pixel; higher is slower
  var maxX = 0, lastY = window.scrollY, moveTimer = null, mode = 'walk';
  var T1 = 0, T2 = 0, botCx = 100, parked = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  /* ---------- SVG props ---------- */
  function S(w, h, vb, inner, cls) {
    return '<svg width="' + w + '" height="' + h + '" viewBox="' + vb + '" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : '') + '>' + inner.replace(/~/g, INK) + '</svg>';
  }
  var P = {
    tree: function (s) { s = s || 1; return S(86 * s, 130 * s, '0 0 86 130', '<rect x="36" y="78" width="14" height="52" fill="#8a5a3c" stroke="~" stroke-width="4"/><circle cx="43" cy="52" r="36" fill="#3fb37f" stroke="~" stroke-width="4"/><circle cx="30" cy="40" r="9" fill="#7fe0aa"/><circle cx="58" cy="64" r="7" fill="#2f9e6b"/>'); },
    pine: function (s) { s = s || 1; return S(70 * s, 130 * s, '0 0 70 130', '<rect x="30" y="100" width="10" height="30" fill="#8a5a3c" stroke="~" stroke-width="4"/><polygon points="35,54 68,106 2,106" fill="#2f9e6b" stroke="~" stroke-width="4" stroke-linejoin="round"/><polygon points="35,28 64,78 6,78" fill="#3fb37f" stroke="~" stroke-width="4" stroke-linejoin="round"/><polygon points="35,4 58,50 12,50" fill="#52c993" stroke="~" stroke-width="4" stroke-linejoin="round"/>'); },
    bush: function () { return S(90, 44, '0 0 90 44', '<path d="M4 42C-2 24 14 14 26 24C28 8 54 6 60 22C74 14 90 28 84 42Z" fill="#52c993" stroke="~" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="26" r="4" fill="#7fe0aa"/><circle cx="62" cy="28" r="3" fill="#7fe0aa"/>'); },
    flower: function (c) { c = c || '#ff6b9a'; return S(30, 44, '0 0 30 44', '<path d="M15 44V20" stroke="#2f9e6b" stroke-width="4"/><path d="M15 36l-8-6M15 32l8-6" stroke="#2f9e6b" stroke-width="3" fill="none"/><g fill="' + c + '" stroke="~" stroke-width="2.5"><circle cx="15" cy="6" r="5.5"/><circle cx="23" cy="12" r="5.5"/><circle cx="20" cy="21" r="5.5"/><circle cx="10" cy="21" r="5.5"/><circle cx="7" cy="12" r="5.5"/></g><circle cx="15" cy="15" r="4.5" fill="#ffc83d" stroke="~" stroke-width="2.5"/>'); },
    mush: function () { return S(34, 36, '0 0 34 36', '<rect x="12" y="20" width="10" height="14" fill="#fff4dc" stroke="~" stroke-width="3"/><path d="M2 22C2 6 32 6 32 22Z" fill="#ff6b2c" stroke="~" stroke-width="3" stroke-linejoin="round"/><circle cx="11" cy="15" r="3" fill="#fff"/><circle cx="22" cy="12" r="2.5" fill="#fff"/><circle cx="26" cy="18" r="2" fill="#fff"/>'); },
    rock: function () { return S(52, 34, '0 0 52 34', '<path d="M3 32L8 16L22 8L40 12L49 32Z" fill="#9aa8bd" stroke="~" stroke-width="4" stroke-linejoin="round"/><path d="M14 18L22 13L30 16" stroke="#c9d3e3" stroke-width="3" fill="none" stroke-linecap="round"/>'); },
    fence: function () { return S(110, 50, '0 0 110 50', '<g fill="#e9c58a" stroke="~" stroke-width="3"><rect x="4" y="4" width="14" height="44"/><rect x="30" y="4" width="14" height="44"/><rect x="56" y="4" width="14" height="44"/><rect x="82" y="4" width="14" height="44"/></g><rect x="0" y="16" width="110" height="6" fill="#d8a85f" stroke="~" stroke-width="3"/><rect x="0" y="32" width="110" height="6" fill="#d8a85f" stroke="~" stroke-width="3"/>'); },
    reed: function () { return S(40, 90, '0 0 40 90', '<path d="M10 90C8 60 10 30 8 8M22 90C22 62 24 38 26 14M32 90C32 66 34 48 34 34" stroke="#2f9e6b" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="4" y="6" width="9" height="24" rx="4" fill="#8a5a3c" stroke="~" stroke-width="3"/><rect x="21" y="12" width="9" height="24" rx="4" fill="#8a5a3c" stroke="~" stroke-width="3"/>'); },
    lily: function () { return S(52, 18, '0 0 52 18', '<ellipse cx="26" cy="11" rx="22" ry="6" fill="#3fb37f" stroke="~" stroke-width="3"/><path d="M26 11L40 7" stroke="~" stroke-width="2"/><circle cx="20" cy="6" r="5" fill="#ff8fb4" stroke="~" stroke-width="2.5"/>'); },
    sign: function (t) { return S(160, 112, '0 0 160 112', '<rect x="72" y="32" width="10" height="80" fill="#8a5a3c" stroke="~" stroke-width="4"/><polygon points="6,8 130,8 152,28 130,48 6,48" fill="#ffe08a" stroke="~" stroke-width="4" stroke-linejoin="round"/><text x="64" y="35" text-anchor="middle" font-family="Silkscreen, monospace" font-weight="700" font-size="15" fill="~">' + t + '</text>'); },
    csign: function (t) { var c = '<ellipse cx="95" cy="124" rx="82" ry="22"/><circle cx="58" cy="110" r="24"/><circle cx="104" cy="98" r="30"/><circle cx="142" cy="112" r="22"/>';
      return S(190, 150, '0 0 190 150', '<rect x="88" y="34" width="10" height="70" fill="#8a5a3c" stroke="~" stroke-width="4"/><polygon points="14,4 138,4 160,24 138,44 14,44" fill="#ffe08a" stroke="~" stroke-width="4" stroke-linejoin="round"/><text x="72" y="31" text-anchor="middle" font-family="Silkscreen, monospace" font-weight="700" font-size="15" fill="~">' + t + '</text><g fill="~" stroke="~" stroke-width="9" stroke-linejoin="round">' + c + '</g><g fill="#fff">' + c + '</g>'); },
    coral: function (v) { var cols = ['#ff6b9a', '#ff9a4a', '#b57bff']; var c = cols[v % 3];
      var d = v % 2 ? 'M30 78V46M30 62L12 46M30 52L48 34M12 46V30M48 34V20' : 'M30 78V40M30 60L16 44M30 50L46 36M30 40V20M16 44V32';
      return S(60, 80, '0 0 60 80', '<path d="' + d + '" fill="none" stroke="~" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'); },
    weed: function (dl) { return S(26, 90, '0 0 26 90', '<g class="sway" style="animation-delay:-' + dl + 's"><path d="M12 90C0 66 22 54 12 34C4 22 12 12 12 4" fill="none" stroke="~" stroke-width="11" stroke-linecap="round"/><path d="M12 90C0 66 22 54 12 34C4 22 12 12 12 4" fill="none" stroke="#2fb67a" stroke-width="5" stroke-linecap="round"/></g>'); },
    shell: function () { return S(46, 36, '0 0 46 36', '<path d="M3 32C3 6 43 6 43 32Z" fill="#ffb3a1" stroke="~" stroke-width="3.5" stroke-linejoin="round"/><path d="M23 32L10 14M23 32L23 9M23 32L36 14" stroke="~" stroke-width="2.5" fill="none"/><rect x="15" y="30" width="16" height="5" fill="#ffb3a1" stroke="~" stroke-width="3"/>'); },
    star: function () { return S(46, 44, '0 0 48 46', '<polygon points="24,3 30,18 46,18 33,28 38,44 24,34 10,44 15,28 2,18 18,18" fill="#ff8a5b" stroke="~" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="22" r="3" fill="#ffd0b8"/>'); },
    chest: function () { return S(84, 60, '0 0 84 60', '<rect x="4" y="26" width="76" height="30" fill="#8a5a3c" stroke="~" stroke-width="4"/><path d="M4 26C4 6 80 6 80 26Z" fill="#a9693a" stroke="~" stroke-width="4" stroke-linejoin="round"/><rect x="20" y="10" width="9" height="46" fill="#ffc83d" stroke="~" stroke-width="3"/><rect x="55" y="10" width="9" height="46" fill="#ffc83d" stroke="~" stroke-width="3"/><circle cx="42" cy="30" r="6" fill="#ffc83d" stroke="~" stroke-width="3"/><path d="M60 3L62 9L68 11L62 13L60 19L58 13L52 11L58 9Z" fill="#fff"/>'); },
    isle: function (s) { s = s || 1; return S(190 * s, 150 * s, '0 0 190 150', '<path d="M10 62C10 76 50 136 70 146C84 150 106 150 120 146C140 136 180 76 180 62Z" fill="#8a5a3c" stroke="~" stroke-width="4" stroke-linejoin="round"/><path d="M10 62C10 36 180 36 180 62C150 70 40 70 10 62Z" fill="#3fb37f" stroke="~" stroke-width="4" stroke-linejoin="round"/><rect x="88" y="14" width="9" height="30" fill="#8a5a3c" stroke="~" stroke-width="3"/><circle cx="92" cy="12" r="18" fill="#52c993" stroke="~" stroke-width="4"/><path d="M70 100L84 128M110 96L100 126" stroke="#6b4228" stroke-width="3" fill="none"/>'); },
    mini: function (c) { return S(44, 62, '0 0 44 62', '<path d="M22 3C8 3 3 16 6 26C8 34 16 40 18 44L26 44C28 40 36 34 38 26C41 16 36 3 22 3Z" fill="' + c + '" stroke="~" stroke-width="3"/><path d="M22 3C16 12 15 32 18 44L26 44C29 32 28 12 22 3Z" fill="#fff" opacity=".55"/><path d="M18 44L16 54M26 44L28 54" stroke="~" stroke-width="2"/><rect x="14" y="52" width="16" height="9" fill="#c98b52" stroke="~" stroke-width="3"/>'); },
    sandbag: function () { return S(46, 26, '0 0 46 26', '<path d="M4 24C0 12 8 3 23 3C38 3 46 12 42 24Z" fill="#c9a36b" stroke="~" stroke-width="3.5"/><path d="M16 5L30 5" stroke="~" stroke-width="3"/>'); },
    parked: function () { return document.querySelector('.balloon').outerHTML.replace('class="balloon"', 'class="parked-svg" style="opacity:1;transform:none;position:static"'); }
  };

  function add(type, x, arg, opt) {
    var el = document.createElement('div');
    opt = opt || {};
    el.className = 'p' + (opt.fl ? ' float' : '');
    el.style.left = typeof x === 'number' ? x + 'vw' : x;
    if (opt.bottom) el.style.bottom = opt.bottom;
    if (opt.delay) el.style.animationDelay = opt.delay;
    el.innerHTML = P[type](arg);
    wback.appendChild(el);
    return el;
  }

  function buildProps() {
    // meadow
    add('tree', 8, 1); add('bush', 22); add('sign', 36, 'START'); add('flower', 50, '#ff6b9a'); add('flower', 53, '#ffc83d');
    add('pine', 62); add('fence', 76); add('mush', 90); add('sign', 104, 'LEVEL 1'); add('tree', 126, 1.15); add('bush', 142);
    add('flower', 154, '#b57bff'); add('flower', 157, '#ff6b9a'); add('rock', 168); add('pine', 180, 1.1); add('fence', 194);
    add('tree', 212, 0.9); add('flower', 228, '#ffc83d'); add('bush', 240); add('mush', 254); add('pine', 268); add('tree', 286, 1.1);
    add('fence', 300); add('flower', 314, '#ff6b9a'); add('flower', 317, '#b57bff'); add('bush', 328); add('rock', 340); add('tree', 350, 1); add('reed', 364);
    // pond edge
    add('lily', 380, null, { bottom: 'calc(var(--ground) + var(--safe-b) - 14px)' });
    add('lily', 396, null, { bottom: 'calc(var(--ground) + var(--safe-b) - 14px)' });
    add('lily', 414, null, { bottom: 'calc(var(--ground) + var(--safe-b) - 14px)' });
    add('reed', 431);
    // lake bed
    add('coral', 446, 0); add('sign', 452, 'LEVEL 2'); add('weed', 478, 1); add('shell', 492); add('sign', 520, 'LEVEL 3');
    add('coral', 546, 1); add('weed', 562, 2); add('star', 576); add('chest', 604); add('weed', 628, 0); add('coral', 648, 2);
    add('rock', 666); add('weed', 684, 3); add('shell', 700); add('coral', 716, 0); add('weed', 732, 1);
    add('sandbag', 742); add('sandbag', 776);
    // balloon parked at the launch point
    parked = add('parked', 'calc(758vw - 100px)', null, { bottom: 'calc(var(--ground) + var(--safe-b) - 28px)' });
    // sky
    add('csign', 830, 'LEVEL 4', { fl: true, bottom: '52%' });
    add('isle', 900, 0.8, { fl: true, bottom: '18%', delay: '-1s' });
    add('mini', 960, '#ff6b2c', { fl: true, bottom: '62%', delay: '-2s' });
    add('mini', 1040, '#ffc83d', { fl: true, bottom: '36%', delay: '-3s' });
    add('isle', 1010, 0.6, { fl: true, bottom: '10%', delay: '-4s' });
    add('csign', 1130, 'LEVEL 5', { fl: true, bottom: '54%', delay: '-1s' });
    add('mini', 1180, '#7fd6ff', { fl: true, bottom: '60%', delay: '-2.5s' });
    add('isle', 1160, 0.7, { fl: true, bottom: '14%', delay: '-3s' });
    add('csign', 1230, 'LEVEL 6', { fl: true, bottom: '50%', delay: '-2s' });
    add('mini', 1270, '#e86bb3', { fl: true, bottom: '34%', delay: '-4s' });
    add('csign', 1330, 'LEVEL 7', { fl: true, bottom: '50%', delay: '-3s' });
    add('isle', 1290, 0.7, { fl: true, bottom: '12%', delay: '-2s' });
    add('mini', 1370, '#ffc83d', { fl: true, bottom: '58%', delay: '-1s' });
  }

  function buildFish() {
    var layer = $('fishLayer'), cols = ['#ff8a5b', '#ffd23f', '#e86bb3', '#7fd6ff', '#b4f08c'];
    for (var i = 0; i < 10; i++) {
      var s = 34 + Math.round(rnd() * 30), c = cols[i % cols.length], rev = i % 3 === 0;
      var el = document.createElement('div');
      el.className = 'fish' + (rev ? ' r' : '');
      el.style.setProperty('--y', (22 + Math.round(rnd() * 50)) + '%');
      el.style.setProperty('--d', (16 + Math.round(rnd() * 18)) + 's');
      el.style.setProperty('--dl', '-' + Math.round(rnd() * 30) + 's');
      el.style.setProperty('--x0', Math.round(rnd() * 90) + 'vw');
      el.innerHTML = S(s, s * 0.55, '0 0 64 34', '<polygon points="12,17 1,5 1,29" fill="' + c + '" stroke="~" stroke-width="3" stroke-linejoin="round"/><ellipse cx="36" cy="17" rx="24" ry="13" fill="' + c + '" stroke="~" stroke-width="3.5"/><path d="M32 9C36 14 36 20 32 25" stroke="~" stroke-width="2.5" fill="none" opacity=".5"/><circle cx="48" cy="14" r="3.2" fill="#fff" stroke="~" stroke-width="2"/><circle cx="49" cy="14" r="1.4" fill="~"/>');
      layer.appendChild(el);
    }
  }
  function buildBubbles() {
    var layer = $('bubbleLayer');
    for (var i = 0; i < 18; i++) {
      var b = document.createElement('span'), s = 8 + Math.round(rnd() * 16);
      b.className = 'bubble';
      b.style.setProperty('--l', Math.round(rnd() * 98) + '%');
      b.style.setProperty('--s', s + 'px');
      b.style.setProperty('--d', (9 + Math.round(rnd() * 10)) + 's');
      b.style.setProperty('--dl', '-' + Math.round(rnd() * 14) + 's');
      b.style.setProperty('--sw', Math.round(rnd() * 60 - 30) + 'px');
      layer.appendChild(b);
    }
  }
  function buildBirds() {
    var layer = $('birdLayer');
    for (var i = 0; i < 7; i++) {
      var el = document.createElement('div');
      el.className = 'bird';
      el.style.setProperty('--y', (8 + Math.round(rnd() * 40)) + '%');
      el.style.setProperty('--d', (24 + Math.round(rnd() * 22)) + 's');
      el.style.setProperty('--dl', '-' + Math.round(rnd() * 40) + 's');
      el.style.setProperty('--x0', Math.round(rnd() * 90) + 'vw');
      el.innerHTML = S(34, 16, '0 0 34 16', '<path d="M2 12C8 2 14 2 17 10C20 2 26 2 32 12" fill="none" stroke="~" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');
      layer.appendChild(el);
    }
  }

  /* ---------- skill bars and contact ---------- */
  [].forEach.call(document.querySelectorAll('.skill'), function (el) {
    var n = parseInt(el.getAttribute('data-n'), 10), bar = document.createElement('div');
    el.querySelector('.skill-head span:last-child').textContent = el.getAttribute('data-label') || ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'][n];
    bar.className = 'bar';
    for (var i = 1; i <= 5; i++) { var s = document.createElement('div'); s.className = 'seg' + (i <= n ? ' on' : ''); bar.appendChild(s); }
    el.appendChild(bar);
  });
  var box = $('contacts'), shown = 0;
  CONTACT.forEach(function (c) {
    if (!c.value) return;
    shown++;
    var row = document.createElement('div'); row.className = 'contact-row';
    var b = document.createElement('b'); b.textContent = c.label; row.appendChild(b);
    var v;
    if (c.href) { v = document.createElement('a'); v.href = c.href; v.target = '_blank'; v.rel = 'noopener'; } else { v = document.createElement('span'); }
    v.textContent = c.value; row.appendChild(v); box.appendChild(row);
  });
  if (!shown) { var note = document.createElement('p'); note.textContent = 'Contact details will appear here.'; box.appendChild(note); }

  buildProps(); buildFish(); buildBubbles(); buildBirds();

  /* ---------- scroll engine ---------- */
  function ss(a, b, v) { var t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); }

  function measure() {
    var vw = window.innerWidth;
    maxX = Math.max(0, world.scrollWidth - vw);
    wback.style.width = world.scrollWidth + 'px';
    spacer.style.height = Math.round(maxX * F + window.innerHeight) + 'px';
    bot.style.setProperty('--bs', Math.min(1, Math.max(0.62, vw / 560)).toFixed(3));
    botCx = bot.offsetLeft + 100;
    T1 = pond.offsetLeft + 0.04 * vw;
    T2 = parked ? parked.offsetLeft + 100 : maxX;
    update();
  }

  function setMode(m) {
    if (m === mode) return;
    mode = m;
    bot.classList.remove('m-walk', 'm-swim', 'm-fly');
    bot.classList.add('m-' + m);
    if (parked) parked.classList.toggle('hide', m === 'fly');
    if (m === 'swim' && !reduce) splash();
  }

  function splash() {
    var cx = bot.offsetLeft + 100, base = window.innerHeight - 110;
    for (var i = 0; i < 9; i++) {
      var d = document.createElement('span');
      d.style.cssText = 'position:absolute;z-index:4;pointer-events:none;border-radius:50%;background:#fff;border:3px solid ' + INK + ';width:' + (8 + i % 3 * 4) + 'px;height:' + (8 + i % 3 * 4) + 'px;left:' + cx + 'px;top:' + base + 'px';
      $('stage').appendChild(d);
      var dx = (i - 4) * 14, dy = -(50 + (i % 4) * 26);
      var a = d.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: 1, offset: 0.5 }, { transform: 'translate(' + dx * 1.4 + 'px,' + (dy + 70) + 'px)', opacity: 0 }], { duration: 750, easing: 'ease-out' });
      a.onfinish = (function (n) { return function () { n.remove(); }; })(d);
    }
  }

  function update() {
    var doc = document.documentElement, vw = window.innerWidth;
    var sMax = Math.max(1, doc.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / sMax));
    var x = p * maxX, tr = 'translate3d(' + (-x) + 'px,0,0)';
    world.style.transform = tr; wback.style.transform = tr;
    par.forEach(function (el) { el.style.backgroundPositionX = (-x * parseFloat(el.getAttribute('data-par'))) + 'px'; });

    var rx = x + botCx;
    var toWater = ss(T1 - 0.3 * vw, T1 + 0.5 * vw, rx);
    var toSky = ss(T2 - 0.4 * vw, T2 + 0.5 * vw, rx);
    zWalk.style.opacity = (1 - toWater).toFixed(3);
    zWater.style.opacity = (toWater * (1 - toSky)).toFixed(3);
    zSky.style.opacity = toSky.toFixed(3);
    setMode(rx >= T2 ? 'fly' : rx >= T1 ? 'swim' : 'walk');

    fill.style.width = (p * 100) + '%';
    xpEl.textContent = 'XP ' + String(Math.round(p * 1000)).padStart(4, '0');
    var idx = Math.min(screens.length - 1, Math.round(p * (screens.length - 1)));
    levelEl.textContent = screens[idx].getAttribute('data-level') + ' · ' + screens[idx].getAttribute('data-label');
    hint.style.opacity = window.scrollY > 40 ? '0' : '1';

    var dy = window.scrollY - lastY;
    if (dy !== 0) {
      flip.classList.toggle('back', dy < 0);
      bot.classList.add('moving');
      clearTimeout(moveTimer);
      moveTimer = setTimeout(function () { bot.classList.remove('moving'); }, 140);
    }
    lastY = window.scrollY;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  window.addEventListener('keydown', function (e) {
    var dir = 0;
    if (e.key === 'ArrowRight') dir = 1; else if (e.key === 'ArrowLeft') dir = -1;
    if (!dir) return;
    e.preventDefault();
    window.scrollBy({ top: dir * window.innerWidth * F * 0.6, behavior: 'smooth' });
  });
  $('replay').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  measure();
})();
