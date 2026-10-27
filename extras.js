/* ============================================================
   EXTRAS — "আরও চমক" menu with small interactive surprises.
   Everything runs in the browser: no server, no storage.

   birthday.js calls:  const extras = initExtras({...});
     extras.show()   → reveal the ✨ button (when the film ends)
     extras.reset()  → close everything & hide (on "Again")
   ============================================================ */
import './extras.css';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bn  = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);
const fmt = (n) => bn(Math.round(n).toLocaleString('en-US'));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function el(tag, cls, text){
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function safeUrl(u){
  try { const x = new URL(u); return (x.protocol === 'http:' || x.protocol === 'https:') ? x.href : ''; }
  catch (_) { return ''; }
}
function parseDate(str){
  const p = (str || '').split('-');
  if (p.length < 3) return null;
  const d = new Date(+p[0], +p[1] - 1, +p[2]);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------------- static data ---------------- */
const WISHES = [
  '🌸 আজকের দিনটা তোমার মতোই সুন্দর হোক!',
  '💖 ভালোবাসা আর সুখ সবসময় তোমার সাথে থাকুক!',
  '✨ তোমার সব স্বপ্ন এই বছর পূরণ হোক!',
  '🎂 আরও একটা দারুণ বছর শুরু হলো — উপভোগ করো!',
  '🌟 তুমি অনেক বিশেষ একজন মানুষ!',
  '😊 তোমার হাসিটা এভাবেই থাকুক সবসময়।',
  '🎁 আজ শুধু তোমার দিন — প্রাণ খুলে আনন্দ করো!',
  '🌈 সামনের প্রতিটা দিন রঙিন হোক।',
  '💐 ফুলের মতো সুন্দর একটা বছর কাটুক।',
  '🕊️ মনটা শান্তিতে আর ভালো থাকুক সবসময়।',
];

const COMPLIMENTS = [
  'তোমার হাসি যেকোনো দিনকে সুন্দর করে দেয়।',
  'তুমি যেখানে থাকো, জায়গাটা আপন আপন লাগে।',
  'তোমার মনটা অনেক বড়।',
  'তোমার সাথে কথা বললে ভালো লাগে।',
  'তুমি যা শুরু করো, মন দিয়ে করো — এটা দারুণ।',
  'তোমার পাশে থাকলে ভরসা পাওয়া যায়।',
  'তুমি অনেকের কাছেই অনুপ্রেরণা।',
  'তোমার ছোট ছোট যত্নগুলো অনেক ভালো লাগার।',
  'তুমি যেমন আছো, তেমনটাই দারুণ।',
  'আজ শুধু তোমার দিন — প্রাণ খুলে উপভোগ করো!',
];

// month → [flower emoji, flower, flower meaning, stone, stone colour, stone meaning]
const MONTHS = [
  ['জানুয়ারি', '🌺', 'কার্নেশন',        'ভালোবাসা ও মুগ্ধতার প্রতীক',   'গার্নেট',     '#9b1b30', 'বিশ্বস্ততা ও সাহসের প্রতীক'],
  ['ফেব্রুয়ারি','🌷', 'ভায়োলেট',        'বিনয় আর বিশ্বস্ততার প্রতীক',  'অ্যামেথিস্ট', '#9b6fd1', 'শান্তি ও স্বচ্ছতার প্রতীক'],
  ['মার্চ',     '🌼', 'ড্যাফোডিল',       'নতুন শুরুর আনন্দ',             'অ্যাকোয়ামেরিন','#7fdbd4','সাহস ও প্রশান্তির প্রতীক'],
  ['এপ্রিল',    '🌼', 'ডেইজি',          'সরলতা ও পবিত্রতা',             'হীরা',        '#dcecff', 'শক্তি ও অটুট বন্ধনের প্রতীক'],
  ['মে',        '💐', 'লিলি অব দ্য ভ্যালি','মিষ্টি মনের প্রতীক',        'পান্না',      '#2fb36b', 'নতুন আশা ও সমৃদ্ধির প্রতীক'],
  ['জুন',       '🌹', 'গোলাপ',          'ভালোবাসা ও সৌন্দর্যের প্রতীক', 'মুক্তা',      '#f3e9dd', 'বিশুদ্ধতা ও প্রজ্ঞার প্রতীক'],
  ['জুলাই',     '💐', 'ল্যাকস্পার',      'খোলামেলা আর প্রাণবন্ত মন',     'চুনি',        '#d6203e', 'আবেগ ও প্রাণশক্তির প্রতীক'],
  ['আগস্ট',     '🌺', 'গ্ল্যাডিওলাস',    'আত্মসম্মান ও দৃঢ়তা',          'পেরিডট',      '#a8d45c', 'সুখ ও সৌভাগ্যের প্রতীক'],
  ['সেপ্টেম্বর','🌼', 'অ্যাস্টার',        'ধৈর্য আর ভালোবাসার প্রতীক',    'নীলা',        '#2e5bd8', 'জ্ঞান ও সত্যের প্রতীক'],
  ['অক্টোবর',   '🏵️', 'গাঁদা',           'উষ্ণতা আর আনন্দের প্রতীক',     'ওপাল',        '#bfe3e0', 'সৃজনশীলতা ও আশার প্রতীক'],
  ['নভেম্বর',   '🌼', 'ক্রিসান্থেমাম',    'আনন্দ ও দীর্ঘ জীবনের প্রতীক',  'পোখরাজ',      '#f2b233', 'উষ্ণতা ও আত্মবিশ্বাসের প্রতীক'],
  ['ডিসেম্বর',  '🌼', 'নার্সিসাস',       'আশা ও নতুন শুরুর প্রতীক',      'ফিরোজা',      '#3ec5c0', 'সৌভাগ্য ও সুরক্ষার প্রতীক'],
];

/* ============================================================
   initExtras(ctx)
   ctx = {
     getName, getDate, getMessage, getFrom, getSong,
     chime(freq,dur,delay), piano(), confetti(), fireworks(),
     petals(), openCake()
   }
   ============================================================ */
export function initExtras(ctx){
  const name    = () => (ctx.getName() || '').trim() || 'তুমি';
  const message = () => (ctx.getMessage() || '').trim();
  const fromWho = () => (ctx.getFrom() || '').trim();
  const song    = () => safeUrl((ctx.getSong() || '').trim());
  // birth date: the dedicated field first, else the (older) single date field
  const birth   = () => parseDate(ctx.getDob ? ctx.getDob() : '') || parseDate(ctx.getDate());

  const api = {
    name, message, fromWho,
    chime: (f, d, dl) => { try { ctx.chime(f, d, dl); } catch (_) {} },
    piano: () => { try { ctx.piano(); } catch (_) {} },
    confetti: () => { try { ctx.confetti(); } catch (_) {} },
    fireworks: () => { try { ctx.fireworks(); } catch (_) {} },
    toast: (t) => toast(t),
    mode: (m) => { if (m) stage.dataset.mode = m; else delete stage.dataset.mode; },
  };

  /* ---------- DOM ---------- */
  const fab = el('button', 'x-fab', '✨ চমক');
  fab.type = 'button'; fab.hidden = true;

  const menu = el('div', 'x-menu'); menu.hidden = true;
  const sheet = el('div', 'x-sheet');
  const menuClose = el('button', 'x-x', '✕'); menuClose.type = 'button'; menuClose.setAttribute('aria-label', 'Close');
  const menuHead = el('p', 'x-h', '✨ আরও চমক');
  const grid = el('div', 'x-grid');
  sheet.append(menuClose, menuHead, grid);
  menu.append(sheet);

  const stage = el('div', 'x-stage'); stage.hidden = true;
  const bar = el('div', 'x-bar');
  const back = el('button', 'x-back', '← মেনু'); back.type = 'button';
  const title = el('span', 'x-title', '');
  const stageClose = el('button', 'x-x', '✕'); stageClose.type = 'button'; stageClose.setAttribute('aria-label', 'Close');
  bar.append(back, title, stageClose);
  const body = el('div', 'x-body');
  stage.append(bar, body);

  const toastEl = el('div', 'x-toast'); toastEl.hidden = true;

  document.body.append(fab, menu, stage, toastEl);

  let toastTimer = 0;
  function toast(t){
    toastEl.textContent = t;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => { toastEl.hidden = true; }, 300);
    }, 2600);
  }

  /* ---------- finger trail (ambient) ---------- */
  const trail = el('canvas', 'x-trail');
  document.body.append(trail);
  const tctx = trail.getContext('2d');
  let trailOn = false, tParts = [], tRAF = 0;
  function sizeTrail(){ trail.width = window.innerWidth; trail.height = window.innerHeight; }
  sizeTrail();
  window.addEventListener('resize', sizeTrail);
  const TRAIL_CH = ['♥', '✦', '♥', '✧'];
  const TRAIL_COL = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#c084fc'];
  function trailLoop(){
    tctx.clearRect(0, 0, trail.width, trail.height);
    for (let i = tParts.length - 1; i >= 0; i--) {
      const p = tParts[i];
      p.life -= 0.022; p.x += p.vx; p.y += p.vy; p.vy += 0.03;
      if (p.life <= 0) { tParts.splice(i, 1); continue; }
      tctx.globalAlpha = p.life;
      tctx.fillStyle = p.col;
      tctx.font = `${p.size}px sans-serif`;
      tctx.fillText(p.ch, p.x, p.y);
    }
    tctx.globalAlpha = 1;
    if (tParts.length) tRAF = requestAnimationFrame(trailLoop); else { tRAF = 0; tctx.clearRect(0, 0, trail.width, trail.height); }
  }
  let lastTrail = 0;
  window.addEventListener('pointermove', (e) => {
    if (!trailOn) return;
    const now = performance.now();
    if (now - lastTrail < 28) return;
    lastTrail = now;
    tParts.push({ x: e.clientX + rand(-6, 6), y: e.clientY + rand(-6, 6), vx: rand(-0.5, 0.5), vy: rand(-1.1, -0.2), life: 1, size: rand(12, 22), ch: pick(TRAIL_CH), col: pick(TRAIL_COL) });
    if (tParts.length > 70) tParts.shift();
    if (!tRAF) tRAF = requestAnimationFrame(trailLoop);
  }, { passive: true });

  /* ---------- shake → petals ---------- */
  let shakeOn = false, lastShake = 0, lx = null, ly = 0, lz = 0;
  function onMotion(e){
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const x = a.x || 0, y = a.y || 0, z = a.z || 0;
    if (lx === null) { lx = x; ly = y; lz = z; return; }
    const d = Math.abs(x - lx) + Math.abs(y - ly) + Math.abs(z - lz);
    lx = x; ly = y; lz = z;
    const now = Date.now();
    if (d > 26 && now - lastShake > 900) {
      lastShake = now;
      try { ctx.petals(); } catch (_) {}
      api.chime(660, 0.3);
    }
  }
  async function enableShake(){
    if (shakeOn) { toast('📳 ঝাঁকানো আগেই চালু — ফোনটা ঝাঁকাও!'); return; }
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== 'granted') { toast('অনুমতি পাওয়া যায়নি'); return; }
      }
      if (!('DeviceMotionEvent' in window)) { toast('এই ডিভাইসে ঝাঁকানো কাজ করবে না'); return; }
      lx = null;
      window.addEventListener('devicemotion', onMotion);
      shakeOn = true;
      toast('📳 এবার ফোনটা ঝাঁকাও — গাছ থেকে পাপড়ি ঝরবে!');
    } catch (_) {
      toast('এই ডিভাইসে ঝাঁকানো কাজ করবে না');
    }
  }

  /* ============================================================
     ACTIVITIES — each run(body) returns an optional cleanup fn
     ============================================================ */

  /* ---- 🎈 balloons ---- */
  function runBalloons(host){
    const custom = message();
    const base = WISHES.slice().sort(() => Math.random() - 0.5);
    const msgs = custom ? [custom.slice(0, 140), ...base] : base;
    const score = el('div', 'xb-score', '০ / ১০');
    const bubble = el('div', 'xb-bubble', 'টোকা দিয়ে বেলুন ফাটাও 🎈');
    const field = el('div', 'xb-field');
    host.append(score, bubble, field);
    const colors = ['#ff6f97', '#ffb14e', '#a855f7', '#5ba8ff', '#52d88a', '#f4a626'];
    let popped = 0, alive = true;

    function dots(b){
      const r = b.getBoundingClientRect(), f = field.getBoundingClientRect();
      const cx = r.left - f.left + r.width / 2, cy = r.top - f.top + 40;
      for (let i = 0; i < 9; i++) {
        const d = el('span', 'xb-dot');
        const a = (i / 9) * Math.PI * 2, dist = rand(34, 70);
        d.style.left = cx + 'px'; d.style.top = cy + 'px';
        d.style.setProperty('--dx', Math.cos(a) * dist + 'px');
        d.style.setProperty('--dy', Math.sin(a) * dist + 'px');
        d.style.background = pick(colors);
        field.appendChild(d);
        setTimeout(() => d.remove(), 650);
      }
    }
    function pop(b){
      if (b.classList.contains('pop')) return;
      b.classList.add('pop');
      dots(b);
      setTimeout(() => b.remove(), 280);
      popped++;
      score.textContent = popped <= 10 ? `${bn(popped)} / ${bn(10)}` : `${bn(popped)} 🎈`;
      bubble.textContent = msgs[(popped - 1) % msgs.length];
      api.chime(480 + rand(0, 360), 0.25);
      if (popped === 10) {
        bubble.textContent = `🎉 দারুণ ${name()}! সব বেলুন ফাটিয়ে ফেললে!`;
        api.confetti(); api.piano();
      }
    }
    function spawn(){
      if (!alive) return;
      const b = el('div', 'xb-balloon');
      const i = el('i'); b.append(i);
      b.style.setProperty('--c', pick(colors));
      b.style.left = rand(2, 82) + '%';
      b.style.animationDuration = rand(6, 9.5) + 's';
      b.addEventListener('animationend', (e) => { if (e.animationName === 'xb-rise') b.remove(); });
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); pop(b); });
      field.appendChild(b);
    }
    spawn(); setTimeout(spawn, 250); setTimeout(spawn, 600);
    const timer = setInterval(spawn, 700);
    return () => { alive = false; clearInterval(timer); };
  }

  /* ---- 🎫 scratch card ---- */
  function runScratch(host){
    const wrap = el('div', 'xs-wrap');
    const card = el('div', 'xs-card');
    card.append(el('div', 'xs-big', `🎉 শুভ জন্মদিন, ${name()}!`));
    const custom = message();
    card.append(el('div', 'xs-msg', custom ? custom.slice(0, 180) : 'তোমার জন্য একটা ছোট্ট চমক — আজকের দিনটা হোক তোমার মতোই সুন্দর! 💖'));
    const cv = el('canvas', 'xs-canvas');
    wrap.append(card, cv);
    const hint = el('p', 'xs-hint', 'আঙুল দিয়ে ঘষো ✨');
    host.append(wrap, hint);

    let c2, W = 0, H = 0, dpr = 1, done = false, drawing = false, px = 0, py = 0, raf = 0;
    function init(){
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      c2 = cv.getContext('2d', { willReadFrequently: true });
      c2.scale(dpr, dpr);
      const g = c2.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#d8dce6'); g.addColorStop(0.5, '#f4f6fb'); g.addColorStop(1, '#bfc5d4');
      c2.fillStyle = g; c2.fillRect(0, 0, W, H);
      c2.fillStyle = 'rgba(120,130,150,.35)';
      for (let i = 0; i < 160; i++) c2.fillRect(rand(0, W), rand(0, H), rand(1, 3), rand(1, 3));
      c2.fillStyle = '#7c8499';
      c2.font = '700 22px "Hind Siliguri", sans-serif';
      c2.textAlign = 'center'; c2.textBaseline = 'middle';
      c2.fillText('✨ এখানে ঘষো ✨', W / 2, H / 2);
    }
    raf = requestAnimationFrame(init);

    function pos(e){ const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function scratch(x, y){
      if (!c2 || done) return;
      c2.globalCompositeOperation = 'destination-out';
      c2.lineWidth = 46; c2.lineCap = 'round'; c2.lineJoin = 'round';
      c2.beginPath(); c2.moveTo(px, py); c2.lineTo(x, y); c2.stroke();
      px = x; py = y;
    }
    function cleared(){
      const step = 12 * dpr;
      const data = c2.getImageData(0, 0, cv.width, cv.height).data;
      let total = 0, clear = 0;
      for (let y = 0; y < cv.height; y += step) for (let x = 0; x < cv.width; x += step) {
        total++;
        if (data[((y | 0) * cv.width + (x | 0)) * 4 + 3] < 40) clear++;
      }
      return total ? clear / total : 0;
    }
    function finish(){
      if (done) return;
      done = true;
      cv.classList.add('gone');
      hint.textContent = '🎉 পেয়ে গেছো!';
      api.confetti(); api.piano();
    }
    cv.addEventListener('pointerdown', (e) => {
      if (!c2) return;
      drawing = true;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      [px, py] = pos(e); scratch(px + 0.1, py + 0.1);
      e.preventDefault();
    });
    cv.addEventListener('pointermove', (e) => { if (drawing) { const [x, y] = pos(e); scratch(x, y); } });
    const end = () => { if (!drawing) return; drawing = false; if (c2 && !done && cleared() > 0.5) finish(); };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    return () => cancelAnimationFrame(raf);
  }

  /* ---- 🎁 gift box ---- */
  function runGift(host){
    const wrap = el('div', 'xg-wrap');
    const msgCard = el('div', 'xg-msg');
    const custom = message();
    msgCard.append(el('div', 'xg-msg-t', `🎉 শুভ জন্মদিন, ${name()}!`));
    msgCard.append(el('div', 'xg-msg-b', custom ? custom.slice(0, 180) : 'তোমার জন্য সবচেয়ে সুন্দর শুভেচ্ছা — সবসময় ভালো থেকো! 💖'));
    const box = el('div', 'xg-box');
    const lid = el('div', 'xg-lid'); lid.append(el('span', 'xg-bow', '🎀'));
    const bodyEl = el('div', 'xg-body');
    box.append(bodyEl, lid);
    const hint = el('p', 'xg-hint', 'বাক্সটায় ৩ বার টোকা দাও 🎁');
    wrap.append(msgCard, box, hint);
    host.append(wrap);
    let taps = 0, opened = false;
    box.addEventListener('click', () => {
      if (opened) return;
      taps++;
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      api.chime(300 + taps * 120, 0.2);
      if (taps < 3) { hint.textContent = `আর ${bn(3 - taps)} বার টোকা দাও 🎁`; return; }
      opened = true;
      box.classList.add('open');
      hint.textContent = '🎉 সারপ্রাইজ!';
      setTimeout(() => msgCard.classList.add('show'), 350);
      api.confetti(); api.piano();
    });
  }

  /* ---- 💗 catch the hearts ---- */
  function runCatch(host){
    const cv = el('canvas', 'xc-canvas');
    const hud = el('div', 'xc-hud');
    host.append(cv, hud);
    const c = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight - 56;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    c.scale(dpr, dpr);
    const KINDS = [['❤️', 1, 6], ['💖', 1, 6], ['💗', 1, 6], ['⭐', 2, 3], ['🎁', 3, 1]];
    const bag = []; KINDS.forEach((k) => { for (let i = 0; i < k[2]; i++) bag.push(k); });
    let basketX = W / 2, items = [], score = 0, left = 30, spawnT = 0, last = 0, raf = 0, over = false, endEl = null;
    const by = H - 96;

    function move(e){ const r = cv.getBoundingClientRect(); basketX = clamp(e.clientX - r.left, 36, W - 36); }
    cv.addEventListener('pointerdown', (e) => { try { cv.setPointerCapture(e.pointerId); } catch (_) {} move(e); e.preventDefault(); });
    cv.addEventListener('pointermove', move);

    function updHud(){ hud.textContent = `⏱ ${bn(Math.ceil(Math.max(0, left)))}    💗 ${bn(score)}`; }
    function finish(){
      over = true;
      endEl = el('div', 'xc-end');
      const t = score >= 30 ? 'অসাধারণ! তুমি সেরা! 🏆' : score >= 18 ? 'দারুণ খেলেছো! 🎉' : score >= 8 ? 'ভালোই তো! 😊' : 'চেষ্টা চালিয়ে যাও! 💪';
      endEl.append(el('div', 'xc-end-t', `তোমার স্কোর: ${bn(score)}`), el('div', 'xc-end-s', t));
      const again = el('button', 'xc-again', 'আবার খেলো 🔁'); again.type = 'button';
      again.addEventListener('click', () => { endEl.remove(); endEl = null; items = []; score = 0; left = 30; spawnT = 0; over = false; last = 0; updHud(); raf = requestAnimationFrame(loop); });
      endEl.append(again);
      host.append(endEl);
      if (score >= 18) { api.confetti(); api.piano(); }
    }
    function loop(ts){
      if (over) return;
      if (!last) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      left -= dt;
      const level = 1 + (30 - left) / 12;
      spawnT -= dt;
      if (spawnT <= 0) {
        const k = pick(bag);
        items.push({ x: rand(24, W - 24), y: -30, vy: rand(110, 160) * level * 0.8 + 40, e: k[0], pts: k[1], r: rand(-0.3, 0.3) });
        spawnT = Math.max(0.3, 0.7 - (30 - left) * 0.012);
      }
      c.clearRect(0, 0, W, H);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy * dt;
        if (it.y > by - 18 && it.y < by + 22 && Math.abs(it.x - basketX) < 46) {
          score += it.pts; items.splice(i, 1); api.chime(520 + it.pts * 140, 0.18); continue;
        }
        if (it.y > H + 30) { items.splice(i, 1); continue; }
        c.font = '32px "Noto Color Emoji","Apple Color Emoji",sans-serif';
        c.fillText(it.e, it.x, it.y);
      }
      c.font = '54px "Noto Color Emoji","Apple Color Emoji",sans-serif';
      c.fillText('🧺', basketX, by + 8);
      updHud();
      if (left <= 0) { finish(); return; }
      raf = requestAnimationFrame(loop);
    }
    updHud();
    raf = requestAnimationFrame(loop);
    return () => { over = true; cancelAnimationFrame(raf); };
  }

  /* ---- 💌 typewriter letter ---- */
  function runLetter(host){
    const custom = message();
    const f = fromWho();
    const text = custom
      ? `প্রিয় ${name()},\n\n${custom}\n\n${f ? 'ভালোবাসায়,\n' + f : 'ভালোবাসা রইল।'}`
      : `প্রিয় ${name()},\n\nশুভ জন্মদিন! আজকের দিনটা তোমার, তাই আজ শুধু হাসো, মন খুলে আনন্দ করো। সামনের প্রতিটা দিন ফুলের মতো সুন্দর হোক, আর তোমার সব স্বপ্ন সত্যি হোক।\n\n${f ? 'ভালোবাসায়,\n' + f : 'ভালোবাসা রইল।'}`;
    const paper = el('div', 'xl-paper');
    const txt = el('div', 'xl-text typing');
    paper.append(txt);
    const hint = el('p', 'xl-hint', 'টোকা দিলে পুরোটা একবারে দেখা যাবে');
    host.append(paper, hint);
    const seg = (typeof Intl !== 'undefined' && Intl.Segmenter)
      ? Array.from(new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(text), (s) => s.segment)
      : Array.from(text);
    let i = 0, timer = 0;
    function finish(){ clearInterval(timer); txt.textContent = text; txt.classList.remove('typing'); hint.textContent = '💌'; }
    timer = setInterval(() => {
      i++;
      txt.textContent = seg.slice(0, i).join('');
      paper.scrollTop = paper.scrollHeight;
      if (i >= seg.length) finish();
    }, 55);
    paper.addEventListener('click', finish);
    api.chime(523, 0.4);
    return () => clearInterval(timer);
  }

  /* ---- 🏮 wish lanterns ---- */
  function runLantern(host){
    api.mode('dark');
    const sky = el('div', 'xn-sky');
    const form = el('div', 'xn-form');
    const input = document.createElement('input');
    input.type = 'text'; input.maxLength = 60; input.placeholder = 'তোমার ইচ্ছেটা লেখো…'; input.className = 'xn-input';
    input.autocomplete = 'off';
    const btn = el('button', 'xn-btn', 'ছেড়ে দাও 🏮'); btn.type = 'button';
    form.append(input, btn);
    host.append(sky, form);
    function launch(){
      const t = input.value.trim() || `শুভ জন্মদিন ${name()}`;
      const l = el('div', 'xn-lantern');
      l.style.left = rand(8, 74) + '%';
      l.style.animationDuration = rand(10, 14) + 's';
      l.append(el('span', 'xn-text', t));
      l.addEventListener('animationend', (e) => { if (e.animationName === 'xn-float') l.remove(); });
      sky.appendChild(l);
      input.value = '';
      api.chime(660, 0.5);
    }
    btn.addEventListener('click', launch);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') launch(); });
    for (let i = 0; i < 40; i++) {
      const s = el('i', 'xn-star');
      s.style.left = rand(0, 100) + '%'; s.style.top = rand(0, 100) + '%';
      s.style.animationDelay = rand(0, 3) + 's';
      sky.appendChild(s);
    }
  }

  /* ---- ✨ name constellation ---- */
  function runStars(host){
    api.mode('dark');
    const cv = el('canvas', 'xt-canvas');
    host.append(cv);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight - 56;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    let alive = true, raf = 0;

    const bg = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, H), r: rand(0.5, 1.6), ph: rand(0, 6.28) }));
    let stars = [], links = [];

    function sample(){
      const text = name();
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d', { willReadFrequently: true });
      const face = '"Hind Siliguri","Tiro Bangla",sans-serif';
      let lines = [text], fs = Math.min(W * 0.3, 150);
      o.font = `700 ${fs}px ${face}`;
      if (o.measureText(text).width > W * 0.84 && text.includes(' ')) lines = text.split(/\s+/).slice(0, 3);
      const widest = () => Math.max(...lines.map((l) => o.measureText(l).width));
      while (widest() > W * 0.84 && fs > 24) { fs -= 4; o.font = `700 ${fs}px ${face}`; }
      o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
      const lh = fs * 1.25, y0 = H * 0.42 - ((lines.length - 1) * lh) / 2;
      lines.forEach((l, i) => o.fillText(l, W / 2, y0 + i * lh));
      const data = o.getImageData(0, 0, W, H).data;
      let step = Math.max(5, Math.round(fs / 13)), pts = [];
      for (let tries = 0; tries < 6; tries++) {
        pts = [];
        for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 140) pts.push({ x: x + rand(-1, 1), y: y + rand(-1, 1) });
        }
        if (pts.length <= 230) break;
        step = Math.round(step * 1.25);
      }
      stars = pts.map((p, i) => ({ ...p, r: rand(1.2, 2.6), ph: rand(0, 6.28), at: (p.x / W) * 1.6 + rand(0, 0.4) }));
      links = [];
      const lim = step * 1.75;
      for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
        if (Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y) < lim) links.push([i, j]);
      }
    }

    let t0 = 0;
    function draw(ts){
      if (!alive) return;
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      const g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#2a1650');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (const s of bg) {
        c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.6 + s.ph);
        c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 6.283); c.fill();
      }
      const prog = clamp((t - 0.4) / 2.4, 0, 1);
      c.lineWidth = 0.8; c.strokeStyle = '#ffd9a8';
      c.globalAlpha = 0.3 * clamp((t - 1.4) / 1.6, 0, 1);
      c.beginPath();
      for (const [i, j] of links) { c.moveTo(stars[i].x, stars[i].y); c.lineTo(stars[j].x, stars[j].y); }
      c.stroke();
      for (const s of stars) {
        const a = clamp((t - 0.3 - s.at) / 0.6, 0, 1);
        if (a <= 0) continue;
        const tw = 0.7 + 0.3 * Math.sin(t * 3 + s.ph);
        c.globalAlpha = a * tw;
        c.fillStyle = '#fff3c9';
        c.shadowColor = '#ffd36a'; c.shadowBlur = 10;
        c.beginPath(); c.arc(s.x, s.y, s.r * (0.9 + 0.2 * tw), 0, 6.283); c.fill();
      }
      c.shadowBlur = 0; c.globalAlpha = 1;
      if (prog >= 1 && !draw.done) { draw.done = true; api.chime(784, 0.6); }
      raf = requestAnimationFrame(draw);
    }

    (async () => {
      try { await Promise.all([document.fonts.load('700 80px "Hind Siliguri"'), document.fonts.load('400 80px "Tiro Bangla"')]); } catch (_) {}
      if (!alive) return;
      sample();
      raf = requestAnimationFrame(draw);
    })();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }

  /* ---- 📅 how long you've been here ---- */
  function aliveInfo(){
    const d = birth();
    if (!d) return null;
    const now = new Date();
    const days = Math.floor((now - d) / 86400000);
    if (days < 365 || days > 365 * 120) return null;
    return { d, days };
  }
  function runAlive(host){
    const info = aliveInfo();
    const wrap = el('div', 'xa-wrap');
    wrap.append(el('p', 'xa-h', `${name()}, তুমি এই পৃথিবীতে…`));
    const years = Math.floor(info.days / 365.25);
    const cards = [
      ['🌅', 'দিন',            info.days],
      ['⏰', 'ঘণ্টা',           info.days * 24],
      ['💗', 'বার হৃদস্পন্দন', info.days * 1440 * 72],
      ['🌕', 'টা পূর্ণিমা',     info.days / 29.53],
      ['🎂', 'টা জন্মদিন',      years],
    ];
    const g = el('div', 'xa-grid');
    const nums = [];
    cards.forEach(([ic, lab]) => {
      const c = el('div', 'xa-card');
      const n = el('b', 'xa-n', '০');
      c.append(el('span', 'xa-ic', ic), n, el('span', 'xa-l', lab));
      g.append(c); nums.push(n);
    });
    wrap.append(g, el('p', 'xa-note', 'হিসাবটা আনুমানিক — হৃদস্পন্দন গড়ে মিনিটে ৭২ বার ধরে। 💝'));
    host.append(wrap);
    const t0 = performance.now(); let raf = 0;
    const step = (ts) => {
      const k = clamp((ts - t0) / 1800, 0, 1), e = 1 - Math.pow(1 - k, 3);
      cards.forEach((c, i) => { nums[i].textContent = fmt(c[2] * e); });
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    api.chime(523, 0.4);
    return () => cancelAnimationFrame(raf);
  }

  /* ---- 🌸 birth flower & stone ---- */
  function runFlower(host){
    const d = birth();
    const m = MONTHS[d.getMonth()];
    const wrap = el('div', 'xf-wrap');
    wrap.append(el('p', 'xf-h', `${m[0]} মাসের জন্য`));
    const a = el('div', 'xf-card');
    a.append(el('span', 'xf-ic', m[1]), el('b', 'xf-t', `জন্মফুল: ${m[2]}`), el('span', 'xf-d', m[3]));
    const sw = el('span', 'xf-gem'); sw.style.setProperty('--g', m[5]);
    const b = el('div', 'xf-card');
    b.append(sw, el('b', 'xf-t', `জন্মপাথর: ${m[4]}`), el('span', 'xf-d', m[6]));
    wrap.append(a, b, el('p', 'xa-note', 'এগুলো প্রচলিত ধারণা — মজা করে দেখার জন্য! 🌟'));
    host.append(wrap);
    api.chime(587, 0.4);
  }

  /* ---- 💝 compliment cards ---- */
  function runCompliments(host){
    const wrap = el('div', 'xp-wrap');
    wrap.append(el('p', 'xp-h', `${name()}-এর ১০টা বিশেষত্ব 💝`), el('p', 'xp-sub', 'কার্ডে টোকা দাও'));
    const g = el('div', 'xp-grid');
    COMPLIMENTS.forEach((t, i) => {
      const card = el('button', 'xp-card'); card.type = 'button';
      const inner = el('span', 'xp-in');
      inner.append(el('span', 'xp-f', bn(i + 1)), el('span', 'xp-b', t));
      card.append(inner);
      card.addEventListener('click', () => {
        card.classList.toggle('flip');
        api.chime(500 + i * 40, 0.2);
        if (g.querySelectorAll('.flip').length === COMPLIMENTS.length) { api.confetti(); }
      });
      g.append(card);
    });
    wrap.append(g);
    host.append(wrap);
  }

  /* ============================================================
     POLAROIDS — photos come from public/photos/photos.json
     (or public/photos/<album>/photos.json when the link has &album=…)
     ============================================================ */
  let photos = [], photosTried = false;
  const BASE = (() => { try { return (import.meta.env && import.meta.env.BASE_URL) || './'; } catch (_) { return './'; } })();
  async function loadPhotos(){
    if (photosTried) return;
    photosTried = true;
    const album = String((ctx.getAlbum && ctx.getAlbum()) || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    const dir = BASE + 'photos/' + (album ? album + '/' : '');
    try {
      const r = await fetch(dir + 'photos.json', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (!Array.isArray(j)) return;
      photos = j.slice(0, 12).map((it) => {
        const o = typeof it === 'string' ? { src: it } : (it || {});
        let src = String(o.src || '');
        if (/^https?:\/\//i.test(src)) src = safeUrl(src);
        else if (/^[\w\-. ()%/]+$/.test(src) && !src.includes('..')) src = dir + src;
        else src = '';
        return src ? { src, cap: String(o.caption || o.cap || '').slice(0, 80) } : null;
      }).filter(Boolean);
    } catch (_) { /* no photos: the tile simply does not appear */ }
  }

  function runPolaroids(host){
    const wrap = el('div', 'xpo-wrap');
    wrap.append(el('p', 'xp-h', `${name()}-এর স্মৃতি 📸`), el('p', 'xp-sub', 'ছবিতে টোকা দাও'));
    const board = el('div', 'xpo-board');
    let z = 5;
    photos.forEach((p, i) => {
      const card = el('button', 'xpo-card'); card.type = 'button';
      card.style.setProperty('--r', rand(-7, 7).toFixed(1) + 'deg');
      card.style.animationDelay = (i * 0.35) + 's';
      const img = el('img', 'xpo-img');
      img.alt = p.cap || ''; img.decoding = 'async'; img.src = p.src;
      img.style.animationDelay = (i * 0.35 + 0.6) + 's';
      img.addEventListener('error', () => card.remove());
      card.append(img, el('span', 'xpo-cap', p.cap));
      card.addEventListener('click', () => {
        const on = card.classList.toggle('front');
        card.style.zIndex = on ? String(++z) : '';
        api.chime(600 + i * 30, 0.2);
      });
      board.append(card);
    });
    wrap.append(board);
    host.append(wrap);
  }

  /* ============================================================
     MENU
     ============================================================ */
  function tiles(){
    const info = aliveInfo();
    const date = birth();
    const list = [
      { icon: '🎂', label: 'কেক',            action: () => { closeAll(); ctx.openCake(); } },
      { icon: '🎈', label: 'বেলুন ফাটাও',    title: '🎈 বেলুন ফাটাও',    run: runBalloons },
      { icon: '🎫', label: 'স্ক্র্যাচ কার্ড', title: '🎫 স্ক্র্যাচ কার্ড', run: runScratch },
      { icon: '🎁', label: 'উপহারের বাক্স',  title: '🎁 উপহারের বাক্স',  run: runGift },
      { icon: '💗', label: 'হৃদয় ধরো',      title: '💗 হৃদয় ধরো',      run: runCatch },
      { icon: '💌', label: 'চিঠি',           title: '💌 তোমার জন্য চিঠি', run: runLetter },
      { icon: '🏮', label: 'ইচ্ছের লণ্ঠন',  title: '🏮 ইচ্ছের লণ্ঠন',   run: runLantern },
      { icon: '✨', label: 'নামের তারা',     title: '✨ নামের তারামণ্ডল', run: runStars },
      { icon: '📅', label: 'তুমি এতদিন',     title: '📅 তুমি এতদিন',     run: runAlive,
        off: info ? '' : 'জন্মতারিখ (সালসহ, অন্তত ১ বছর আগের) দিলে এটা দেখা যাবে' },
      { icon: '🌸', label: 'জন্মফুল ও পাথর', title: '🌸 জন্মফুল ও জন্মপাথর', run: runFlower,
        off: date ? '' : 'জন্মতারিখ দিলে এটা দেখা যাবে' },
      { icon: '💝', label: 'প্রশংসার কার্ড', title: '💝 প্রশংসার কার্ড',  run: runCompliments },
      { icon: '📳', label: 'ফোন ঝাঁকাও',    action: () => { closeAll(); enableShake(); } },
    ];
    if (photos.length) list.push({ icon: '📸', label: 'স্মৃতির পোলারয়েড', title: '📸 স্মৃতির পোলারয়েড', run: runPolaroids });
    const s = song();
    if (s) list.push({ icon: '🎵', label: 'এই গানটা তোমার জন্য', href: s });
    return list;
  }

  function buildGrid(){
    grid.textContent = '';
    tiles().forEach((t) => {
      const node = t.href ? el('a', 'x-tile') : el('button', 'x-tile');
      if (t.href) { node.href = t.href; node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      else node.type = 'button';
      node.append(el('span', 'x-ti', t.icon), el('span', 'x-tl', t.label));
      if (t.off) {
        node.classList.add('x-tile--off');
        node.addEventListener('click', () => toast(t.off));
      } else if (t.action) {
        node.addEventListener('click', t.action);
      } else if (t.run) {
        node.addEventListener('click', () => openActivity(t));
      }
      grid.append(node);
    });
  }

  let cleanup = null;
  function closeActivity(){
    if (cleanup) { try { cleanup(); } catch (_) {} cleanup = null; }
    body.textContent = '';
    stage.classList.remove('show');
    stage.hidden = true;
    delete stage.dataset.mode;
  }
  function openActivity(t){
    closeActivity();
    menu.hidden = true;
    title.textContent = t.title || t.label;
    stage.hidden = false;
    void stage.offsetWidth;
    stage.classList.add('show');
    try { cleanup = t.run(body) || null; } catch (e) { console.error(e); toast('কিছু একটা গোলমাল হয়েছে'); openMenu(); }
  }
  function openMenu(){
    closeActivity();
    buildGrid();
    menu.hidden = false;
    api.chime(523, 0.3);
  }
  function closeAll(){ closeActivity(); menu.hidden = true; }

  fab.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeAll);
  stageClose.addEventListener('click', closeAll);
  back.addEventListener('click', openMenu);
  menu.addEventListener('click', (e) => { if (e.target === menu) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  return {
    show(){
      loadPhotos();
      fab.hidden = false;
      requestAnimationFrame(() => fab.classList.add('is-shown'));
      trailOn = true;
    },
    reset(){
      photos = []; photosTried = false;
      closeAll();
      fab.classList.remove('is-shown');
      fab.hidden = true;
      trailOn = false;
      tParts = [];
    },
  };
}
