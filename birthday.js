/* ============================================================
   HAPPY BIRTHDAY — UPGRADED v2
   New features:
     • Name personalisation (setup screen)
     • Web Audio sound effects (whoosh, boom, piano)
     • Theme switcher (pink / blue / purple / gold)
     • Countdown banner (days until next birthday)
     • Confetti explosion (Act 4 bloom)
     • Secret message (tap tree canvas in Act 4)
     • Share panel (WhatsApp + copy link)
   ============================================================ */

import gsap from 'gsap';

/* ============================================================
   URL-BASED PERSONALISATION
   Sender:   opens site → fills name + date → gets shareable link
   Receiver: opens ?to=NAME&date=YYYY-MM-DD → film plays directly
   ============================================================ */

const params   = new URLSearchParams(location.search);
const urlName  = params.get('to')   || '';
const urlDate  = params.get('date') || '';
const urlMsg   = params.get('msg')  || '';
const isViewer = !!urlName;   // true = received a link, skip setup

/* ============================================================
   THEME SYSTEM
   ============================================================ */
let currentTheme = params.get('theme') || localStorage.getItem('hbd-theme') || 'pink';

function applyTheme(t){
  currentTheme = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('hbd-theme', t);
  document.querySelectorAll('.theme-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.theme === t);
  });
}
applyTheme(currentTheme);
document.querySelectorAll('.theme-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> applyTheme(btn.dataset.theme));
});

/* ============================================================
   SETUP SCREEN
   ============================================================ */
const setupEl   = document.getElementById('setup');
const nameInput = document.getElementById('nameInput');
const bdayInput = document.getElementById('bdayInput');
const setupGo   = document.getElementById('setupGo');

let userName = '';
let bdayDate  = '';
let shareSecret = urlMsg;

function buildShareURL(name, date, theme, secret){
  const base = location.origin + location.pathname;
  const p = new URLSearchParams();
  p.set('to', name);
  if(date)   p.set('date', date);
  if(theme && theme !== 'pink') p.set('theme', theme);
  if(secret) p.set('msg', secret);
  return base + '?' + p.toString();
}

function personalise(name, date){
  userName = name || 'তুমি';
  bdayDate  = date || '';
  document.getElementById('wHero').textContent    = `Happy Birthday, ${userName}!`;
  document.getElementById('kSub').textContent     = `to ${userName} — someone worth celebrating`;
  document.getElementById('eyebrow').textContent  = `a little something, for ${userName}`;
  // secret message: URL msg > input field > default
  const secretVal = urlMsg
    || (document.getElementById('secretInput')?.value || '').trim()
    || `🌸 ${userName}, তোমার জন্মদিন অনেক সুন্দর হোক!`;
  document.getElementById('secretText').textContent = secretVal;
  if(urlMsg || (document.getElementById('secretInput')?.value||'').trim()){
    SECRETS = [secretVal];
  }
  if(bdayDate) showCountdown(bdayDate);
}

function hideSetup(){
  setupEl.classList.add('hide');
  setTimeout(()=>{
    setupEl.hidden = true;
    document.body.style.overflow = '';
    // Reveal the film scene
    const scene = document.getElementById('mainScene');
    if(scene){
      scene.style.display = 'block';
    }
  }, 520);
}

/* — Viewer mode: pre-fill + auto-trigger same as sender — */
if(isViewer){
  // Immediately show scene for viewer
  const scene = document.getElementById('mainScene');
  if(scene){ scene.style.display='block'; }
  document.body.style.overflow = '';
  nameInput.value = urlName;
  if(urlDate) bdayInput.value = urlDate;
  const si = document.getElementById('secretInput');
  if(si && urlMsg) si.value = urlMsg;
  // Auto-trigger after fonts + layout ready
  window._viewerAutoStart = true;
} else {
  /* — Sender mode: show setup — */
  nameInput.value = localStorage.getItem('hbd-name') || '';
  bdayInput.value = localStorage.getItem('hbd-date') || '';
}

function copyText(text){
  const fallback = ()=> new Promise(res=>{
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); }catch(_){}
    ta.remove(); res();
  });
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).catch(fallback);
  }
  return fallback();
}

let linkGenerated = false;

function generateLink(){
  const name = nameInput.value.trim();
  if(!name){ nameInput.focus(); nameInput.style.border='1.5px solid #e03060'; return; }
  nameInput.style.border='';
  const date   = bdayInput.value;
  const secret = (document.getElementById('secretInput')?.value || '').trim();
  const link   = buildShareURL(name, date, currentTheme, secret);
  // Update SECRETS for own preview
  shareSecret = secret;
  SECRETS = secret ? [secret] : DEFAULT_SECRETS;

  // Show preview
  const preview  = document.getElementById('linkPreview');
  const linkBox  = document.getElementById('linkBox');
  const previewWA   = document.getElementById('previewWA');
  const previewCopy = document.getElementById('previewCopy');

  linkBox.textContent = link;
  preview.hidden = false;
  linkGenerated = true;

  // Save
  localStorage.setItem('hbd-name', name);
  if(date) localStorage.setItem('hbd-date', date);
  userName = name; bdayDate = date;
  personalise(name, date);

  // Change button to "Film দেখো"
  setupGo.textContent = 'Film দেখো 🎬';

  previewWA.onclick = ()=>{
    const msg = `🎂 ${name}-এর জন্য একটা বিশেষ Birthday Film! 🌸\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
  };
  previewCopy.onclick = ()=>{
    copyText(link).then(()=>{
      previewCopy.textContent = '✅ কপি!';
      setTimeout(()=>{ previewCopy.textContent = 'কপি 🔗'; }, 2000);
    });
  };
}

function startFilm(){
  hideSetup();
  setTimeout(enter, 600);
}

setupGo.addEventListener('click', ()=>{
  if(window._viewerAutoStart || linkGenerated){
    // Viewer mode / link already made: go straight to the film
    startFilm();
  } else {
    generateLink();
  }
});
['input','change'].forEach(ev=>{
  [nameInput, bdayInput, document.getElementById('secretInput')].forEach(el=>{
    el && el.addEventListener(ev, ()=>{
      if(linkGenerated){ linkGenerated = false; setupGo.textContent = 'লিংক তৈরি করো ✨'; }
    });
  });
});
document.querySelectorAll('.theme-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    if(linkGenerated){ linkGenerated = false; setupGo.textContent = 'লিংক তৈরি করো ✨'; }
  });
});
nameInput.addEventListener('keydown', e=>{ if(e.key==='Enter') bdayInput.focus(); });
bdayInput.addEventListener('keydown', e=>{ if(e.key==='Enter') generateLink(); });

/* ============================================================
   COUNTDOWN BANNER
   ============================================================ */
function showCountdown(dateStr){
  const banner = document.getElementById('countdownBanner');
  const cdDays = document.getElementById('cdDays');
  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts  = dateStr.split('-');
  if(parts.length < 3 || isNaN(+parts[1]) || isNaN(+parts[2])) return;
  let next = new Date(today.getFullYear(), +parts[1]-1, +parts[2]);
  if(next < today) next = new Date(today.getFullYear()+1, +parts[1]-1, +parts[2]);
  const diff = Math.round((next - today)/(1000*60*60*24));
  if(diff === 0){
    banner.querySelector('span').textContent = `🎉 আজই ${userName}-এর জন্মদিন! Happy Birthday!`;
  } else {
    cdDays.textContent = diff;
  }
  banner.hidden = false;
}


/* ============================================================
   4. WEB AUDIO SOUND ENGINE
   ============================================================ */
let audioCtx = null;

function getACtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  return audioCtx;
}

function playWhoosh(){
  try{
    const ac = getACtx(); const t = ac.currentTime;
    const buf = ac.createBuffer(1,ac.sampleRate*0.35,ac.sampleRate);
    const data = buf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,1.8);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bf = ac.createBiquadFilter();
    bf.type='bandpass'; bf.frequency.setValueAtTime(900,t);
    bf.frequency.exponentialRampToValueAtTime(3200,t+0.28);
    bf.Q.value=0.8;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.5,t);
    gain.gain.exponentialRampToValueAtTime(0.001,t+0.35);
    src.connect(bf); bf.connect(gain); gain.connect(ac.destination);
    src.start(t); src.stop(t+0.35);
  } catch(_){}
}

function playBoom(){
  try{
    const ac = getACtx(); const t = ac.currentTime;
    // Thud
    const osc = ac.createOscillator();
    osc.type='sine';
    osc.frequency.setValueAtTime(140,t);
    osc.frequency.exponentialRampToValueAtTime(40,t+0.3);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.7,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.4);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t+0.4);
    // Crackle
    const buf = ac.createBuffer(1,ac.sampleRate*0.18,ac.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ac.sampleRate*0.04));
    const s2 = ac.createBufferSource(); s2.buffer=buf;
    const g2 = ac.createGain(); g2.gain.setValueAtTime(0.4,t);
    s2.connect(g2); g2.connect(ac.destination);
    s2.start(t); s2.stop(t+0.18);
  } catch(_){}
}

function playChime(freq=523, dur=0.6, delay=0){
  try{
    const ac = getACtx(); const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    osc.type='sine'; osc.frequency.value=freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(0.22,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t+dur);
  } catch(_){}
}

function playPiano(){
  // C major arpeggio — C4 E4 G4 C5
  const notes = [261.63,329.63,392,523.25];
  notes.forEach((f,i)=> playChime(f, 1.2, i*0.18));
}

/* ============================================================
   5. CONFETTI ENGINE
   ============================================================ */
const confCanvas = document.getElementById('confettiCanvas');
const confCtx    = confCanvas.getContext('2d');
let confetti     = [];
let confRAF      = 0;

function resizeConf(){
  confCanvas.width  = window.innerWidth;
  confCanvas.height = window.innerHeight;
}
resizeConf();
window.addEventListener('resize', resizeConf);

const CONF_COLORS = ['#ff6f97','#ffb14e','#a855f7','#5ba8ff','#f4a626','#ff5f86','#ffe38c','#c084fc'];

function spawnConfetti(){
  confetti = [];
  for(let i=0;i<180;i++){
    confetti.push({
      x: Math.random()*confCanvas.width,
      y: -20 - Math.random()*120,
      w: 6+Math.random()*8,
      h: 3+Math.random()*5,
      rot: Math.random()*Math.PI*2,
      vx: (Math.random()-0.5)*4,
      vy: 2+Math.random()*4,
      vrot: (Math.random()-0.5)*0.25,
      color: CONF_COLORS[Math.floor(Math.random()*CONF_COLORS.length)],
      alpha: 1,
    });
  }
}

function drawConf(){
  confCtx.clearRect(0,0,confCanvas.width,confCanvas.height);
  let alive = false;
  for(const c of confetti){
    c.x   += c.vx;
    c.y   += c.vy;
    c.rot += c.vrot;
    c.vy  += 0.06;
    if(c.y > confCanvas.height + 20) c.alpha -= 0.04;
    if(c.alpha <= 0) continue;
    alive = true;
    confCtx.save();
    confCtx.globalAlpha = c.alpha;
    confCtx.translate(c.x, c.y);
    confCtx.rotate(c.rot);
    confCtx.fillStyle = c.color;
    confCtx.fillRect(-c.w/2,-c.h/2,c.w,c.h);
    confCtx.restore();
  }
  if(alive) confRAF = requestAnimationFrame(drawConf);
  else confCtx.clearRect(0,0,confCanvas.width,confCanvas.height);
}

function launchConfetti(){
  if(confRAF) cancelAnimationFrame(confRAF);
  spawnConfetti();
  confRAF = requestAnimationFrame(drawConf);
}

/* ============================================================
   6. SECRET MESSAGE — tap tree canvas in Act 4
   ============================================================ */
const secretToast = document.getElementById('secretToast');
const DEFAULT_SECRETS = [
  '🌸 তোমার জীবন ফুলের মতো সুন্দর হোক!',
  '💖 ভালোবাসা আর সুখ সবসময় তোমার সাথে থাকুক!',
  '✨ তোমার স্বপ্ন পূরণ হোক এই বছর!',
  '🎂 আরও একটা দারুণ বছর শুরু হোক!',
  '🌟 তুমি অনেক বিশেষ একজন মানুষ!',
];
// URL এ ?msg= থাকলে সেটাই দেখাবে, না হলে default list
let SECRETS = urlMsg
  ? [urlMsg]
  : DEFAULT_SECRETS;
let secretIdx = 0;
let secretTimer = null;

function showSecret(){
  secretToast.querySelector('#secretText').textContent =
    `${SECRETS[secretIdx % SECRETS.length]}`;
  secretIdx++;
  secretToast.hidden = false;
  secretToast.classList.add('show');
  clearTimeout(secretTimer);
  secretTimer = setTimeout(()=>{
    secretToast.classList.remove('show');
    setTimeout(()=>{ secretToast.hidden = true; }, 450);
  }, 2800);
  playChime(659, 0.5);
}

/* We attach the tap listener to the tree canvas after Act 4 starts */
let secretTapBound = false;
function enableSecretTap(){
  const treeCanvas = document.getElementById('tree');
  treeCanvas.style.cursor = 'pointer';
  if(secretTapBound) return;
  secretTapBound = true;
  treeCanvas.addEventListener('click', showSecret);
}

/* ============================================================
   7. SHARE PANEL
   ============================================================ */
const shareFab   = document.getElementById('shareFab');
const sharePanel = document.getElementById('sharePanel');
const shareWA    = document.getElementById('shareWA');
const shareCopy  = document.getElementById('shareCopy');
const shareClose = document.getElementById('shareClose');

shareFab.addEventListener('click',()=>{
  sharePanel.hidden = false;
  playChime(440,0.4);
});
shareClose.addEventListener('click',()=>{ sharePanel.hidden = true; });

shareWA.addEventListener('click',()=>{
  const link = buildShareURL(userName, bdayDate, currentTheme, shareSecret);
  const msg = `🎂 ${userName}-এর জন্য একটা বিশেষ Birthday Film! 🌸\n${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
});

shareCopy.addEventListener('click',()=>{
  const link = buildShareURL(userName, bdayDate, currentTheme, shareSecret);
  copyText(link).then(()=>{
    shareCopy.textContent = '✅ কপি হয়েছে!';
    setTimeout(()=>{ shareCopy.textContent = 'লিঙ্ক কপি 🔗'; }, 2000);
  });
});

function showShareFab(){
  shareFab.hidden = false;
  requestAnimationFrame(()=> shareFab.classList.add('is-shown'));
}

/* ============================================================
   ORIGINAL FILM CODE (with sound hooks injected)
   ============================================================ */

gsap.registerPlugin({
  name: 'drawn',
  init(target, value) {
    const len = target.getTotalLength();
    target.style.strokeDasharray = len;
    this.target = target; this.len = len; this.value = value;
  },
  render(ratio, data) {
    data.target.style.strokeDashoffset = data.len * (1 - data.value * ratio);
  },
});

const $ = (id) => document.getElementById(id);

const canvas = $('tree');
const ctx    = canvas.getContext('2d');
const wishEl = $('wish');

const hero       = $('hero');
const eyebrow    = $('eyebrow');
const hint       = $('hint');
const motes      = $('motes');
const target     = $('target');
const targetHeart= $('targetHeart');
const heartGlow  = target.querySelector('.heart__glow');
const aim        = $('aim');

const archery = $('archery');
const bow     = $('bow');
const arrow   = $('arrow');
const strL    = $('strL');
const strR    = $('strR');
const serving = $('serving');

const flood   = $('flood');
const field   = $('field');
const camera  = $('camera');
const fgrid   = $('fgrid');
const kEyebrow= $('kEyebrow');
const kSub    = $('kSub');
const barTop  = $('barTop');
const barBot  = $('barBot');
const uline   = $('uline').querySelector('.uline__path');
const bloom   = $('bloom');
const replay  = $('replay');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isRecord     = new URLSearchParams(location.search).has('record');

if (isRecord) window.bdayCues = [];
let recT0 = 0;
function cue(name){
  if (isRecord && recT0) window.bdayCues.push({ cue: name, t: (performance.now() - recT0) / 1000 });
  // Sound hooks
  if(name === 'whoosh') playWhoosh();
  if(name === 'hit')    setTimeout(playBoom, 80);
  if(name === 'grow')   setTimeout(playPiano, 400);
}

const rand  = (a, b) => a + Math.random() * (b - a);
const pick  = (a)    => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack  = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function shade(hex, amt){
  const n = parseInt(hex.slice(1), 16);
  const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

const BLOSSOM = [
  { c0:'#fff0f4', c1:'#ffb3c8' }, { c0:'#ffeef5', c1:'#ff8fb4' },
  { c0:'#fff4e8', c1:'#ffcf9a' }, { c0:'#fff6f0', c1:'#ffbfa0' },
  { c0:'#fdf0ff', c1:'#e8a0ff' }, { c0:'#f0f8ff', c1:'#a0c8ff' },
];

const T = {
  trunkStart: 0.1,
  branchSpan: 3.2,
  bloomT0:    2.8,
  bloomSpan:  2.4,
  petalT0:    4.6,
  noteStart:  4.2,
  done:       8.0,
};

function heartShape(c, cx, cy, w, h){
  c.beginPath();
  const x = cx - w/2, y = cy, r = w/4;
  c.moveTo(cx, cy + h*0.62);
  c.bezierCurveTo(cx - w*0.08, cy + h*0.38, x, cy + h*0.22, x, cy);
  c.bezierCurveTo(x, cy - h*0.3, cx - r*0.1, cy - h*0.42, cx, cy - h*0.14);
  c.bezierCurveTo(cx + r*0.1, cy - h*0.42, cx + w/2, cy - h*0.3, cx + w/2, cy);
  c.bezierCurveTo(cx + w/2, cy + h*0.22, cx + w*0.08, cy + h*0.38, cx, cy + h*0.62);
  c.closePath();
}

function makeBlossom(b, soft){
  const SS = 128;
  const { c0, c1 } = b;
  const cv = document.createElement('canvas'); cv.width = cv.height = SS;
  const c = cv.getContext('2d');
  const w = SS * 0.62, h = SS * 0.58, x = SS / 2, top = SS * 0.17;
  c.save();
  c.shadowColor = 'rgba(150,38,72,0.32)';
  c.shadowBlur = SS * 0.085; c.shadowOffsetY = SS * 0.05;
  c.fillStyle = c1; heartShape(c, x, top, w, h); c.fill();
  c.restore();
  const g = c.createRadialGradient(x - w * 0.20, top + h * 0.20, h * 0.04, x, top + h * 0.42, h * 0.92);
  g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, shade(c1, -26));
  heartShape(c, x, top, w, h); c.fillStyle = g; c.fill();
  c.save(); heartShape(c, x, top, w, h); c.clip();
  const g2 = c.createLinearGradient(0, top, 0, top + h);
  g2.addColorStop(0, 'rgba(255,255,255,0)');
  g2.addColorStop(0.65, 'rgba(110,16,46,0)');
  g2.addColorStop(1, 'rgba(110,16,46,0.26)');
  c.fillStyle = g2; c.fillRect(0, 0, SS, SS);
  c.globalAlpha = 0.55; c.fillStyle = '#ffffff';
  c.beginPath(); c.ellipse(x - w * 0.15, top + h * 0.24, w * 0.17, h * 0.11, -0.5, 0, Math.PI * 2); c.fill();
  c.restore();
  if (!soft) return cv;
  const cv2 = document.createElement('canvas'); cv2.width = cv2.height = SS;
  const c2 = cv2.getContext('2d');
  c2.filter = 'blur(2.6px)'; c2.drawImage(cv, 0, 0); c2.filter = 'none';
  c2.globalCompositeOperation = 'source-atop';
  c2.globalAlpha = 0.42; c2.fillStyle = '#fff3ea'; c2.fillRect(0, 0, SS, SS);
  return cv2;
}

function makeBokeh(rgb){
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(0.45, `rgba(${rgb},0.22)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(0, 0, S, S);
  return cv;
}

function makeSparkle(){
  const S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'); const m = S / 2;
  const g = c.createRadialGradient(m, m, 0, m, m, m);
  g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.25, 'rgba(255,236,200,0.5)'); g.addColorStop(1, 'rgba(255,236,200,0)');
  c.fillStyle = g; c.beginPath(); c.arc(m, m, m, 0, 6.2832); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.95)';
  c.translate(m, m);
  for (let k = 0; k < 2; k++){
    c.beginPath();
    c.moveTo(0, -m); c.quadraticCurveTo(0, 0, m, 0); c.quadraticCurveTo(0, 0, 0, m); c.quadraticCurveTo(0, 0, -m, 0); c.quadraticCurveTo(0, 0, 0, -m);
    c.fill(); c.rotate(Math.PI / 4); c.scale(0.5, 0.5);
  }
  return cv;
}

let SPR = { crisp: [], soft: [] }, BOKEH = [], SPARKLE = null;
function buildSprites(){
  SPR = { crisp: BLOSSOM.map((b) => makeBlossom(b, false)), soft: BLOSSOM.map((b) => makeBlossom(b, true)) };
  BOKEH = [makeBokeh('255,224,188'), makeBokeh('255,196,214'), makeBokeh('255,238,210')];
  SPARKLE = makeSparkle();
}

function drawSprite(sprite, x, y, size, rot, alpha){
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -size * 0.5, -size * 0.47, size, size);
  ctx.restore();
}

let heartPoly = null;
function buildHeartPoly(){
  const raw = []; let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  for (let i = 0; i <= 160; i++){
    const t = (i / 160) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    raw.push([x, y]);
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const midX = (minX + maxX) / 2, midY = (minY + maxY) / 2, hw = (maxX - minX) / 2, hh = (maxY - minY) / 2;
  heartPoly = raw.map(([x, y]) => [(x - midX) / hw, (y - midY) / hh]);
}
function pointInPoly(x, y){
  let inside = false; const p = heartPoly;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++){
    const xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
    if (((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

let W = 0, H = 0, dpr = 1;
let cx = 0, cy = 0, rx = 0, ry = 0, groundY = 0;
let branches = [], hearts = [], petals = [], rested = [], orbs = [], floaters = [], twinkles = [];
let bgGrad = null, glowGrad = null, groundGrad = null;

const quad = (b, t) => { const m = 1 - t, a = m * m, k = 2 * m * t, d = t * t; return { x: a * b.x1 + k * b.cx + d * b.x2, y: a * b.y1 + k * b.cy + d * b.y2 }; };

function barkGrad(x1, y1, x2, y2, depth){
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  g.addColorStop(0, `hsl(348 26% ${26 + depth * 3}%)`);
  g.addColorStop(1, `hsl(346 24% ${40 + depth * 5}%)`);
  return g;
}

function buildScene(){
  branches = []; hearts = []; petals = []; rested = []; twinkles = []; orbs = []; floaters = [];
  buildHeartPoly();
  const wide = W / H > 1.2;
  cx = W * (wide ? 0.57 : 0.5);
  cy = H * (wide ? 0.37 : 0.38);
  ry = Math.min(H * (wide ? 0.33 : 0.33), W * 0.34);
  rx = ry * 1.16;
  groundY = H * 0.93;
  bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#fff3e9');
  bgGrad.addColorStop(0.46, '#ffe7d6');
  bgGrad.addColorStop(0.78, '#fcd9c4');
  bgGrad.addColorStop(1, '#f3c4b5');
  glowGrad = ctx.createRadialGradient(cx, cy, ry * 0.1, cx, cy, ry * 1.55);
  glowGrad.addColorStop(0, 'rgba(255,219,170,0.6)');
  glowGrad.addColorStop(0.5, 'rgba(255,170,150,0.2)');
  glowGrad.addColorStop(1, 'rgba(255,170,150,0)');
  groundGrad = ctx.createRadialGradient(cx, H * 1.02, ry * 0.2, cx, H * 1.02, ry * 1.6);
  groundGrad.addColorStop(0, 'rgba(255,205,165,0.5)');
  groundGrad.addColorStop(1, 'rgba(255,205,165,0)');
  for (let i = 0; i < 11; i++){
    orbs.push({ x: rand(0, W), y: rand(0, H), r: rand(W * 0.05, W * 0.17), vy: rand(-6, -16), drift: rand(-0.3, 0.3), phase: rand(0, 6.28), alpha: rand(0.05, 0.13), sprite: pick(BOKEH) });
  }
  const FN = wide ? 18 : 15;
  for (let i = 0; i < FN; i++){
    const depth = Math.random();
    floaters.push({ x: rand(0, W), y: rand(-H * 0.1, H * 1.1), depth, idx: (Math.random() * BLOSSOM.length) | 0, box: lerp(Math.min(W, H) * 0.025, Math.min(W, H) * 0.075, depth), vy: lerp(7, 20, depth), sway: rand(8, 22), phase: rand(0, 6.28), rot: rand(-0.4, 0.4), vrot: rand(-0.5, 0.5), baseA: lerp(0.16, 0.5, depth), soft: depth < 0.45 });
  }
  const baseX = cx, baseY = H * 1.0;
  const trunkTopY = cy + ry * 0.62;
  const trunkW = Math.max(9, W * 0.024);
  const limbLen = ry * 0.6;
  const insidePx = (x, y, m = 0.9) => pointInPoly((x - cx) / (rx * m), (cy - y) / (ry * m));
  function addBranch(x, y, ang, len, w0, depth, t0){
    let ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, clipped = false;
    if (!insidePx(ex, ey)){
      let lo = 0, hi = 1;
      for (let k = 0; k < 12; k++){ const mid = (lo + hi) / 2; (insidePx(x + Math.cos(ang) * len * mid, y + Math.sin(ang) * len * mid) ? lo = mid : hi = mid); }
      ex = x + Math.cos(ang) * len * lo; ey = y + Math.sin(ang) * len * lo; clipped = true;
    }
    const mx = (x + ex) / 2, my = (y + ey) / 2, perp = ang + Math.PI / 2, bend = rand(-1, 1) * len * 0.12, w1 = w0 * 0.66;
    branches.push({ x1: x, y1: y, cx: mx + Math.cos(perp) * bend, cy: my + Math.sin(perp) * bend, x2: ex, y2: ey, w0, w1, t0, dur: Math.max(0.14, 0.32 - depth * 0.03), depth, grad: barkGrad(x, y, ex, ey, depth) });
    return { ex, ey, w1, clipped };
  }
  function grow(x, y, ang, len, w, depth, t0){
    const r = addBranch(x, y, ang, len, w, depth, t0);
    if (r.clipped || depth >= 6 || len < ry * 0.06) return;
    const childT0 = t0 + (0.32 - depth * 0.03) * 0.6;
    const n = Math.random() < 0.55 ? 2 : 3;
    for (let i = 0; i < n; i++){
      const spread = 0.6 * (i - (n - 1) / 2) + rand(-0.22, 0.22), lift = -0.06 + rand(-0.05, 0.05);
      grow(r.ex, r.ey, ang + spread + lift, len * rand(0.74, 0.84), r.w1, depth + 1, childT0 + i * 0.03);
    }
  }
  addBranch(baseX, baseY, -Math.PI / 2, baseY - trunkTopY, trunkW, 0, T.trunkStart);
  branches[0].dur = 0.55;
  const limbT0 = T.trunkStart + 0.36, L = 3;
  for (let i = 0; i < L; i++){
    const ang = -Math.PI / 2 + 0.62 * (i - (L - 1) / 2) + rand(-0.12, 0.12);
    grow(baseX, trunkTopY, ang, limbLen, trunkW * 0.7, 1, limbT0 + i * 0.05);
  }
  const maxT0 = branches.reduce((m, b) => Math.max(m, b.t0 + b.dur), 0);
  const sc = (T.branchSpan - T.trunkStart) / (maxT0 - T.trunkStart);
  for (const b of branches) b.t0 = T.trunkStart + (b.t0 - T.trunkStart) * sc;
  const COUNT = Math.round(clamp(rx * ry / 56, 250, 440));
  const baseBox = clamp(Math.min(W, H) * 0.115, 30, 74);
  let guard = 0;
  while (hearts.length < COUNT && guard < COUNT * 50){
    guard++;
    const u = rand(-1.06, 1.06), v = rand(-1.06, 1.06);
    if (!pointInPoly(u, v)) continue;
    const x = cx + u * rx, y = cy - v * ry;
    const d = clamp01(Math.hypot(u, v + 1) / 2.4);
    const t0 = T.bloomT0 + d * (T.bloomSpan * 0.82) + rand(0, T.bloomSpan * 0.18);
    const soft = Math.random() < 0.42;
    hearts.push({ x, y, idx: (Math.random() * BLOSSOM.length) | 0, soft, box: baseBox * (soft ? rand(0.6, 0.85) : rand(0.78, 1.12)), rot: rand(-0.55, 0.55), sway: rand(0, 6.28), t0 });
  }
  hearts.sort((a, b) => (a.soft === b.soft ? a.y - b.y : a.soft ? -1 : 1));
}

function drawBackground(){ ctx.globalAlpha = 1; ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.fillStyle = groundGrad; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function drawGodRays(t, intensity){ if (intensity <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const ox = cx, oy = cy - ry * 0.35, R = Math.hypot(W, H) * 1.1; const rays = 9, sweep = Math.sin(t * 0.07) * 0.18; for (let i = 0; i < rays; i++){ const a = -Math.PI / 2 + sweep + (i - (rays - 1) / 2) * 0.2; const hw = 0.035 + 0.02 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.7)); const a1 = a - hw, a2 = a + hw; const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(a) * R, oy + Math.sin(a) * R); g.addColorStop(0, `rgba(255,232,190,${0.10 * intensity})`); g.addColorStop(0.5, `rgba(255,214,170,${0.05 * intensity})`); g.addColorStop(1, 'rgba(255,214,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a1) * R, oy + Math.sin(a1) * R); ctx.lineTo(ox + Math.cos(a2) * R, oy + Math.sin(a2) * R); ctx.closePath(); ctx.fill(); } ctx.restore(); }
function drawGlow(t){ const gi = clamp01((t - T.bloomT0) / (T.bloomSpan * 0.9)); if (gi <= 0) return; ctx.save(); ctx.globalAlpha = gi; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function drawBokeh(t, dt){ ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const o of orbs){ o.y += o.vy * dt; o.x += Math.sin(t * 0.3 + o.phase) * o.drift; if (o.y < -o.r){ o.y = H + o.r; o.x = rand(0, W); } ctx.globalAlpha = o.alpha; ctx.drawImage(o.sprite, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); } ctx.restore(); }
function drawFloaters(t, dt, front){ const appear = clamp01((t - 0.2) / 1.4); if (appear <= 0) return; for (const f of floaters){ if ((f.depth >= 0.6) !== front) continue; f.y -= f.vy * dt; f.x += Math.sin(t * 0.5 + f.phase) * f.sway * dt; f.rot += f.vrot * dt; if (f.y < -f.box){ f.y = H + f.box; f.x = rand(0, W); } drawSprite((f.soft ? SPR.soft : SPR.crisp)[f.idx], f.x, f.y, f.box, f.rot, f.baseA * appear); } }
function drawBranches(t){ ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (const b of branches){ const f = clamp01((t - b.t0) / b.dur); if (f <= 0) continue; const e = easeOutCubic(f); ctx.strokeStyle = b.grad; const steps = 12, last = Math.max(1, Math.ceil(steps * e)); let prev = quad(b, 0); for (let i = 1; i <= last; i++){ const tt = Math.min(e, i / steps), p = quad(b, tt); ctx.lineWidth = lerp(b.w0, b.w1, tt); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke(); prev = p; } } }
function drawHearts(t){ const breathe = 1 + Math.sin(t * 0.8) * 0.012; for (const h of hearts){ const p = clamp01((t - h.t0) / 0.6); if (p <= 0) continue; const scale = Math.max(0, easeOutBack(p)); let alpha = clamp01(p * 1.7); if (h.soft) alpha *= 0.8; const settled = clamp01((t - h.t0 - 0.6) / 0.7); const sway = settled * Math.sin(t * 1.5 + h.sway) * (h.box * 0.05); const rise = (1 - easeOutCubic(p)) * h.box * 0.45; const hx = cx + (h.x - cx) * breathe + sway; const hy = cy + (h.y - cy) * breathe - rise; drawSprite((h.soft ? SPR.soft : SPR.crisp)[h.idx], hx, hy, h.box * scale, h.rot + sway * 0.012, alpha); } }
function updateTwinkles(t, dt){ const active = t > T.bloomT0 + T.bloomSpan * 0.45; if (active && twinkles.length < 9 && Math.random() < 0.5){ const h = hearts[(Math.random() * hearts.length) | 0]; if (h) twinkles.push({ x: h.x, y: h.y, size: rand(0.6, 1.3) * (Math.min(W, H) * 0.05), age: 0, life: rand(0.7, 1.2), rot: rand(0, 6.28) }); } ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = twinkles.length - 1; i >= 0; i--){ const s = twinkles[i]; s.age += dt; const k = s.age / s.life; if (k >= 1){ twinkles.splice(i, 1); continue; } const a = Math.sin(k * Math.PI); drawSprite(SPARKLE, s.x, s.y, s.size * (0.6 + 0.4 * a), s.rot + k * 1.2, a); } ctx.restore(); }
function spawnPetal(){ const h = hearts[(Math.random() * hearts.length) | 0]; if (!h) return; petals.push({ x: h.x + rand(-8, 8), y: h.y + rand(-8, 8), vy: rand(14, 30), vx: rand(-8, 8), sway: rand(0.6, 1.4), phase: rand(0, 6.28), box: h.box * rand(0.34, 0.6), idx: h.idx, rot: rand(0, 6.28), vrot: rand(-1.4, 1.4), age: 0, land: groundY + rand(-6, H * 0.05) }); }
function drawPetals(t, dt){ for (let i = petals.length - 1; i >= 0; i--){ const p = petals[i]; p.age += dt; p.vy += 8 * dt; p.x += (p.vx + Math.sin(t * p.sway + p.phase) * 16) * dt; p.y += p.vy * dt; p.rot += p.vrot * dt; if (p.y >= p.land){ rested.push({ x: clamp(p.x, 6, W - 6), y: p.land, box: p.box, idx: p.idx, rot: p.rot, a: rand(0.7, 0.95) }); if (rested.length > 90) rested.shift(); petals.splice(i, 1); continue; } const a = p.age < 0.3 ? p.age / 0.3 : 1; drawSprite(SPR.crisp[p.idx], p.x, p.y, p.box, p.rot, a); } }
function drawRested(){ for (const r of rested) drawSprite(SPR.crisp[r.idx], r.x, r.y, r.box, r.rot, r.a); }
function showWish(on){ wishEl.classList.toggle('is-in', on); }

let treeStartT = 0, treeLastT = 0, treeRAF = 0, lastPetal = 0, replayArmed = false;
let confettiFired = false;
window.bdayDone = false;

function treeFrame(now){
  if (!treeStartT){ treeStartT = now; treeLastT = now; }
  const t  = (now - treeStartT) / 1000;
  const dt = Math.min(0.05, (now - treeLastT) / 1000); treeLastT = now;
  const rays = clamp01((t - T.bloomT0) / T.bloomSpan);
  drawBackground(); drawGodRays(t, rays); drawGlow(t); drawBokeh(t, dt);
  drawFloaters(t, dt, false); drawBranches(t); drawHearts(t); updateTwinkles(t, dt);
  if (t > T.petalT0 && now - lastPetal > 150){ spawnPetal(); spawnPetal(); lastPetal = now; }
  drawPetals(t, dt); drawRested(); drawFloaters(t, dt, true);
  showWish(t >= T.noteStart);

  // Confetti at bloom moment
  if(!confettiFired && t >= T.bloomT0 + 0.5){
    confettiFired = true;
    launchConfetti();
  }

  if (!window.bdayDone && t >= T.done) window.bdayDone = true;
  if (!replayArmed && t >= T.done + 1.0){ replayArmed = true; armReplay(); }
  treeRAF = requestAnimationFrame(treeFrame);
}

function treeStart(){
  treeStartT = 0; treeLastT = 0; lastPetal = 0; replayArmed = false;
  window.bdayDone = false; confettiFired = false;
  cue('grow');
  buildScene();
  enableSecretTap();
  showShareFab();
  if (!treeRAF) treeRAF = requestAnimationFrame(treeFrame);
}
function treeStop(){ if (treeRAF){ cancelAnimationFrame(treeRAF); treeRAF = 0; } ctx.clearRect(0, 0, W, H); }

function drawFinal(){
  buildScene();
  drawBackground(); drawGodRays(0, 1); drawGlow(T.done); drawBokeh(0, 0); drawFloaters(99, 0, false);
  drawBranches(99); drawHearts(99);
  for (let i = 0; i < 40; i++){ const h = hearts[(Math.random() * hearts.length) | 0]; if (h) rested.push({ x: clamp(h.x + rand(-W * 0.3, W * 0.3), 6, W - 6), y: groundY + rand(-6, H * 0.05), box: h.box * 0.5, idx: h.idx, rot: rand(0, 6.28), a: 0.85 }); }
  drawRested(); drawFloaters(99, 0, true);
  showWish(true); window.bdayDone = true;
}

function splitWord(el){
  const chars = [...el.textContent];
  el.textContent = '';
  return chars.map((c) => {
    const s = document.createElement('span');
    s.className = 'hl__ch';
    s.textContent = c === ' ' ? ' ' : c;
    el.appendChild(s);
    return s;
  });
}
const line1Chars = splitWord($('wLine1'));
const line2Chars = splitWord($('wLine2'));
const kChars = [...line1Chars, ...line2Chars];

function buildMotes(){
  motes.innerHTML = '';
  for (let i = 0; i < 12; i++){
    const m = document.createElement('span');
    m.className = 'mote';
    const s = rand(4, 12);
    m.style.width = m.style.height = `${s}px`;
    m.style.left = `${rand(4, 96)}%`;
    m.style.top  = `${rand(10, 96)}%`;
    motes.appendChild(m);
    gsap.set(m, { opacity: rand(0.25, 0.7) });
    gsap.to(m, { y: -rand(40, 140), x: rand(-30, 30), duration: rand(7, 14), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: -rand(0, 8) });
    gsap.to(m, { opacity: rand(0.1, 0.5), duration: rand(2.5, 5), repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
}

const tip = $('tip');
let svgScale = 1, arrowBaseX = 0, arrowBaseY = 0, maxDraw = 120, curDraw = 0;
let pullUX = 0, pullUY = 1;
const REST_NOCK = 96;
const nockProxy = { val: REST_NOCK };

function applyNock(){ const y = nockProxy.val; strL.setAttribute('y2', y); strR.setAttribute('y2', y); serving.setAttribute('cy', y); }

function refreshRig(){
  const VW = window.innerWidth;
  const VH = window.innerHeight;

  const gripX = VW * 0.30, gripY = VH * 0.80;
  const heartX = VW * 0.5, heartY = VH * 0.35;
  const aimRad = Math.atan2(heartX - gripX, gripY - heartY);
  pullUX = -Math.sin(aimRad); pullUY = Math.cos(aimRad);
  nockProxy.val = REST_NOCK; applyNock();

  // Try getBoundingClientRect first (accurate when visible)
  // Fall back to pure math when element is hidden
  const aR = archery.getBoundingClientRect();
  const bR = bow.getBoundingClientRect();
  const sR = serving.getBoundingClientRect();
  const rR = arrow.getBoundingClientRect();

  let gripLX, gripLY, nockLX, nockLY, arrowW, arrowH;

  if(bR.width > 0){
    // Element is visible — use accurate measurements
    svgScale = bR.width / 460;
    gripLX = (bR.left - aR.left) + 0.5 * bR.width;
    gripLY = (bR.top  - aR.top ) + (240 / 300) * bR.height;
    nockLX = (sR.left - aR.left) + 0.5 * sR.width;
    nockLY = (sR.top  - aR.top ) + 0.5 * sR.height;
    arrowBaseX = nockLX - ((rR.left - aR.left) + 0.5 * rR.width);
    arrowBaseY = nockLY - ((rR.top  - aR.top ) + (205 / 220) * rR.height);
    maxDraw = Math.min(bR.height * 0.72, VH * 0.16, 132);
  } else {
    // Element hidden — pure math fallback
    // Match CSS: clamp(160px, 42vw, 260px)
    const bowW = Math.min(Math.max(VW * 0.42, 160), 260);
    const bowH = bowW * (300 / 460);
    svgScale = bowW / 460;
    gripLX = bowW * (230 / 460);
    gripLY = bowH * (240 / 300);
    nockLX = bowW * (230 / 460);
    nockLY = bowH * (96  / 300);
    arrowW = bowW * 0.175;
    arrowH = arrowW * (220 / 64);
    arrowBaseX = nockLX - arrowW * 0.5;
    arrowBaseY = nockLY - arrowH * (205 / 220);
    archery.style.width = bowW + 'px';
    maxDraw = Math.min(bowH * 0.72, VH * 0.16, 132);
  }

  archery.style.left = (gripX - gripLX) + 'px';
  archery.style.top  = (gripY - gripLY) + 'px';

  gsap.set(archery, {
    rotation: 0, scale: 1, x: 0, y: 0,
    transformOrigin: `${gripLX}px ${gripLY}px`
  });
  gsap.set(archery, { rotation: aimRad * 180 / Math.PI });
  gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY });
  curDraw = 0;
}

function setDraw(d){ curDraw = clamp(d, 0, maxDraw); gsap.set(arrow, { x: arrowBaseX, y: arrowBaseY + curDraw }); nockProxy.val = REST_NOCK + curDraw / svgScale; applyNock(); gsap.set(aim, { opacity: 0.55 * (curDraw / maxDraw) }); }

let beatTL = null;
function startBeat(){
  gsap.set(targetHeart, { scale: 1 }); gsap.set(heartGlow, { scale: 1, opacity: 0.7 });
  beatTL = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
  beatTL.to(targetHeart, { scale: 1.07, duration: 0.13, ease: 'power2.out' }, 0)
        .to(heartGlow,   { scale: 1.15, opacity: 0.9, duration: 0.13, ease: 'power2.out' }, 0)
        .to(targetHeart, { scale: 1.0, duration: 0.2, ease: 'power2.in' }, 0.13)
        .to(targetHeart, { scale: 1.05, duration: 0.12, ease: 'power2.out' }, 0.3)
        .to(targetHeart, { scale: 1.0, duration: 0.5, ease: 'power2.inOut' }, 0.42)
        .to(heartGlow,   { scale: 1.0, opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, 0.3);
}
function stopBeat(){ if (beatTL){ beatTL.kill(); beatTL = null; } gsap.set(targetHeart, { scale: 1 }); }

function miniHeartSVG(fill){ return `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 20C5.5 15 1.5 11.4 1.5 6.9 1.5 3.6 4 1.5 7 1.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3 0 5.5 2.1 5.5 5.4C23.5 11.4 19.5 15 12 20Z" fill="${fill}"/></svg>`; }

function burstHearts(){
  const r = target.getBoundingClientRect();
  const hr = hero.getBoundingClientRect();
  const ox = r.left - hr.left + r.width / 2;
  const oy = r.top - hr.top + r.height * 0.42;
  const cols = ['#ff6f97', '#ffb14e', '#ff8fae', '#ffd36a', '#e23b67'];
  const frag = document.createDocumentFragment();
  const nodes = [];
  for (let i = 0; i < 12; i++){
    const heart = i < 8;
    const el = document.createElement('span');
    el.className = 'burst';
    const s = heart ? rand(12, 22) : rand(4, 8);
    el.style.cssText = `position:absolute;left:${ox}px;top:${oy}px;width:${s}px;height:${s}px;margin:${-s / 2}px 0 0 ${-s / 2}px;pointer-events:none;z-index:4;`;
    if (heart) el.innerHTML = miniHeartSVG(pick(cols));
    else { el.style.borderRadius = '50%'; el.style.background = 'radial-gradient(circle,#fff,rgba(255,210,150,0) 70%)'; }
    frag.appendChild(el); nodes.push({ el, heart });
  }
  hero.appendChild(frag);
  nodes.forEach(({ el, heart }) => {
    const ang = rand(-Math.PI, 0);
    const dist = rand(heart ? 70 : 40, heart ? 190 : 120);
    gsap.to(el, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - rand(10, 50), rotation: rand(-120, 120), scale: heart ? rand(0.7, 1.2) : rand(0.4, 1), duration: rand(0.7, 1.15), ease: 'power2.out' });
    gsap.to(el, { opacity: 0, duration: 0.5, delay: rand(0.35, 0.6), ease: 'power1.in', onComplete: () => el.remove() });
  });
}

function shotGeom(){
  const VW = window.innerWidth, VH = window.innerHeight;
  const tipR = tip.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  const tipX = tipR.left + tipR.width / 2, tipY = tipR.top + tipR.height / 2;
  const tcx = tRect.left + tRect.width / 2, tcy = tRect.top + tRect.height / 2;
  const flightDist = Math.hypot(tcx - tipX, tcy - tipY);
  const fallPx = Math.min(VH * 0.26, VH - tcy - tRect.height * 0.4);
  const impactX = tcx, impactY = tcy + fallPx;
  const distC = Math.hypot(Math.max(impactX, VW - impactX), Math.max(impactY, VH - impactY));
  const reach = Math.hypot(VW / 2, VH / 2);
  return { arrowStartY: arrowBaseY + curDraw, arrowFlyY: arrowBaseY + curDraw - flightDist, drawnNock: REST_NOCK + curDraw / svgScale, fallPx, fx: impactX - VW / 2, fy: impactY - VH / 2, floodScale: (distC * 1.12) / 70, bloomScale: (reach * 1.2) / 30 };
}

let filmTL = null;
function buildFilm(m){
  const t = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(field, { autoAlpha: 0 });
      treeStart();
      gsap.to(bloom, { autoAlpha: 0, duration: 1.15, ease: 'power2.out' });
    },
  });
  t.set(target, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 })
   .set(arrow, { opacity: 1, x: arrowBaseX, y: m.arrowStartY, scaleY: 1 })
   .set([flood, bloom], { autoAlpha: 0, scale: 0.001, x: 0, y: 0 })
   .set(flood, { x: m.fx, y: m.fy })
   .set(field, { autoAlpha: 0 })
   .set('.blob', { opacity: 0 })
   .set(camera, { scale: 1, yPercent: 0 })
   .set(fgrid, { xPercent: 0, yPercent: 0 })
   .set(barTop, { yPercent: -100 })
   .set(barBot, { yPercent: 100 })
   .set(kEyebrow, { opacity: 0, y: 12 })
   .set(kSub, { opacity: 0, y: 12 })
   .set(kChars, { transformPerspective: 620, transformOrigin: '50% 100%', yPercent: 135, rotationX: -82 })
   .set(uline, { drawn: 0 });
  t.fromTo(nockProxy, { val: m.drawnNock }, { val: REST_NOCK, duration: 0.5, ease: 'elastic.out(1,0.34)', onUpdate: applyNock }, 0)
   .to(arrow, { y: m.arrowFlyY, duration: 0.26, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.16, duration: 0.14, ease: 'power2.in' }, 0)
   .to(arrow, { scaleY: 1.0, duration: 0.1, ease: 'power1.out' }, 0.16)
   .to(aim, { opacity: 0, duration: 0.18 }, 0)
   .to([eyebrow, hint], { opacity: 0, duration: 0.2, ease: 'power1.out' }, 0);
  t.add(burstHearts, 0.26)
   .to(target, { x: 7, y: -9, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { x: 0, y: 0, duration: 0.32, ease: 'power2.out' }, 0.32)
   .to(target, { scale: 1.14, duration: 0.06, ease: 'power2.out' }, 0.26)
   .to(target, { scale: 1.0, duration: 0.26, ease: 'power2.inOut' }, 0.32)
   .to(arrow, { rotation: '+=4', duration: 0.05, yoyo: true, repeat: 4, ease: 'sine.inOut' }, 0.27)
   .set(arrow, { rotation: 0 }, 0.52)
   .to(arrow, { opacity: 0, duration: 0.16, ease: 'power1.out' }, 0.56);
  t.to(target, { y: m.fallPx, scaleX: 0.84, scaleY: 1.3, duration: 0.34, ease: 'power1.in' }, 0.64)
   .to(target, { scaleX: 1.4, scaleY: 0.6, duration: 0.07, ease: 'power2.out' }, 0.98)
   .set(flood, { autoAlpha: 1 }, 1.00)
   .fromTo(flood, { scale: 0.02 }, { scale: m.floodScale, duration: 0.34, ease: 'power2.in' }, 1.00)
   .to(target, { opacity: 0, duration: 0.12, ease: 'power1.out' }, 1.06);
  t.set(field, { autoAlpha: 1 }, 1.32)
   .set(hero, { autoAlpha: 0 }, 1.33)
   .to('.blob', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 1.34)
   .set(flood, { autoAlpha: 0 }, 1.36);
  t.fromTo(camera, { scale: 1.0, yPercent: 0 }, { scale: 1.07, yPercent: -1.3, duration: 2.6, ease: 'none' }, 1.38)
   .fromTo(fgrid, { xPercent: 0, yPercent: 0 }, { xPercent: -1.5, yPercent: -1.0, duration: 2.6, ease: 'none' }, 1.38);
  t.call(cue, ['hit'], 0.26)
   .call(cue, ['flood'], 1.00)
   .call(cue, ['wish'], 1.68)
   .call(cue, ['wish2'], 2.06)
   .call(cue, ['bloom'], 3.42);
  t.to(barTop, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5)
   .to(barBot, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 1.5);
  t.to(kEyebrow, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 1.54)
   .to(line1Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 1.68)
   .to(line2Chars, { yPercent: 0, rotationX: 0, duration: 0.55, ease: 'power3.out', stagger: 0.033 }, 2.06)
   .to(uline, { drawn: 1, duration: 0.45, ease: 'power2.inOut' }, 2.54)
   .to(kSub, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 2.74);
  t.to(barTop, { yPercent: -100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .to(barBot, { yPercent: 100, duration: 0.5, ease: 'power2.in' }, 3.32)
   .set(bloom, { autoAlpha: 1 }, 3.42)
   .fromTo(bloom, { scale: 0.02 }, { scale: m.bloomScale, duration: 0.58, ease: 'power2.in' }, 3.42);
  return t;
}

let played = false, drawing = false, startPX = 0, startPY = 0, startDraw = 0;

function fire(){
  if (played) return;
  played = true; drawing = false;
  stopBeat();
  cue('release'); cue('whoosh');
  filmTL = buildFilm(shotGeom());
  filmTL.play(0);
}

function springBack(){ const from = curDraw; gsap.to({ d: from }, { d: 0, duration: 0.55, ease: 'elastic.out(1,0.4)', onUpdate() { setDraw(this.targets()[0].d); } }); }

function autoFire(){
  if (played) return;
  recT0 = performance.now(); cue('draw');
  gsap.to({ d: curDraw }, { d: maxDraw * 0.94, duration: 0.62, ease: 'power2.inOut', onUpdate() { setDraw(this.targets()[0].d); }, onComplete: () => gsap.delayedCall(0.16, fire) });
}

archery.addEventListener('pointerdown', (e) => { if (played) return; drawing = true; try { archery.setPointerCapture(e.pointerId); } catch (_) {} startPX = e.clientX; startPY = e.clientY; startDraw = curDraw; e.preventDefault(); });
archery.addEventListener('pointermove', (e) => { if (!drawing) return; const proj = (e.clientX - startPX) * pullUX + (e.clientY - startPY) * pullUY; setDraw(startDraw + proj); });
function endDraw(){ if (!drawing) return; drawing = false; if (curDraw > maxDraw * 0.26) fire(); else springBack(); }
archery.addEventListener('pointerup', endDraw);
archery.addEventListener('pointercancel', endDraw);
archery.addEventListener('keydown', (e) => { if (played) return; if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); autoFire(); } });

function enter(){
  gsap.set(hero, { autoAlpha: 1 });
  // Hide elements first, then measure after 2 frames
  gsap.set([eyebrow, hint], { opacity: 0, y: 14 });
  gsap.set(target, { opacity: 0, y: 10, scaleX: 0.9, scaleY: 0.9 });
  gsap.set(archery, { opacity: 1, scale: 1 }); // keep visible for measurement
  gsap.set(heartGlow, { opacity: 0, scale: 1 });
  gsap.set(arrow, { opacity: 1 });
  // Measure after browser paints hero visible
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    refreshRig(); setDraw(0);
    // Now hide bow for entry animation
    gsap.set(archery, { opacity: 0, scale: 0.85 });
    const tl = gsap.timeline({ onComplete: startBeat });
    tl.to(target,   { opacity: 1, y: 0, scaleX: 1, scaleY: 1, duration: 0.8, ease: 'power3.out' }, 0.1)
      .to(heartGlow,{ opacity: 0.7, duration: 0.8, ease: 'power2.out' }, 0.2)
      .to(archery,  { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 0.28)
      .to(eyebrow,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.4)
      .to(hint,     { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.7);
  }));
}

function armReplay(){
  replay.hidden = false;
  requestAnimationFrame(() => replay.classList.add('is-shown'));
}

function resetAll(){
  treeStop(); showWish(false);
  window.bdayDone = false; replayArmed = false; confettiFired = false;
  replay.classList.remove('is-shown'); replay.hidden = true;
  shareFab.classList.remove('is-shown'); shareFab.hidden = true;
  sharePanel.hidden = true;
  if (filmTL){ filmTL.pause(0); }
  gsap.set([flood, bloom], { autoAlpha: 0 });
  gsap.set(field, { autoAlpha: 0 });
  gsap.set(arrow, { opacity: 1, scaleY: 1 });
  played = false;
  enter();
}

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Use viewport size — canvas may be display:none initially
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildSprites(); buildScene();
  if (reduceMotion){ drawFinal(); return; }
  if (played && filmTL){ const at = filmTL.time(); const active = filmTL.isActive(); filmTL = buildFilm(shotGeom()); filmTL.pause(at); if (active) filmTL.play(at); }
  else { refreshRig(); setDraw(0); }
}

let resizeRAF = 0;
window.addEventListener('resize', () => { if (resizeRAF) return; resizeRAF = requestAnimationFrame(() => { resizeRAF = 0; resize(); }); });

if(isViewer) personalise(urlName, urlDate);

resize();

if (reduceMotion){
  drawFinal();
} else {
  buildMotes();
  document.fonts && document.fonts.ready.then(() => {
    resize();
    if(window._viewerAutoStart){
      // Viewer: auto start film directly (startFilm already calls enter once)
      startFilm();
    }
  });
  replay.addEventListener('click', resetAll);
}

if (isRecord){
  window.bdayAPI = {
    start(){ autoFire(); },
    replay(){ resetAll(); },
  };
}
