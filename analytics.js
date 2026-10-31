/* ============================================================
   ANALYTICS — fill in the two values below, nothing else to change.
   Leave a value empty ('') to switch that service off.

   • ga4          : Google Analytics 4 Measurement ID, looks like  G-ABC123XYZ
   • goatcounter  : GoatCounter site code (the part before .goatcounter.com),
                    e.g.  shuvo-hbd   → also gives the visitor number shown
                    in the small pill at the bottom of every page.

   Privacy: only the page address WITHOUT "?to=…&msg=…" is ever sent,
   so names and personal messages never reach Google / GoatCounter.
   ============================================================ */
export const ANALYTICS = {
  ga4: 'G-E9WEN91YLF',
  goatcounter: 'shuvoahmed',
};

const BN = '০১২৩৪৫৬৭৮৯';

export function initAnalytics(cfg = ANALYTICS, opts = {}){
  const host = location.hostname;
  const isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  if (isLocal && !opts.force) return;                      // never count my own testing

  const ga = /^G-[A-Z0-9]{4,20}$/.test(cfg.ga4 || '') ? cfg.ga4 : '';
  const gc = /^[a-z0-9-]{1,40}$/.test(cfg.goatcounter || '') ? cfg.goatcounter : '';
  const cleanUrl = location.origin + location.pathname;     // no query string
  const add = (attrs) => {
    const s = document.createElement('script');
    s.async = true;
    for (const k in attrs) s.setAttribute(k, attrs[k]);
    document.head.append(s);
  };

  if (ga) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
    window.gtag('event', 'page_view', { page_location: cleanUrl, page_path: location.pathname, page_title: 'Birthday film' });
    add({ src: 'https://www.googletagmanager.com/gtag/js?id=' + ga });
  }

  if (gc) {
    window.goatcounter = { path: location.pathname || '/' };  // path only, never the query
    add({ 'data-goatcounter': `https://${gc}.goatcounter.com/count`, src: 'https://gc.zgo.at/count.js' });
    showCount(gc);
  }
}

/* total number from GoatCounter (needs "Allow adding visitor counts on your website" turned on there) */
async function showCount(code){
  const box = document.getElementById('devViews');
  if (!box) return;
  try {
    const r = await fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`);
    if (!r.ok) return;
    const j = await r.json();
    const n = String(j && j.count || '').trim();
    if (!/^\d[\d,.\s]*$/.test(n)) return;
    box.textContent = '· 👁 ' + n.replace(/\d/g, (d) => BN[+d]);
    box.hidden = false;
  } catch (_) { /* counter stays hidden */ }
}
