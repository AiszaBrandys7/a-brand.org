const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

// 1) usuń stare sekcje/skrypty ROI, które mogły się tam namnożyć
html = html
  .replace(/<section id="roi"[\s\S]*?<\/section>/g, '')
  .replace(/<script[^>]*roi[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*roi[^>]*>[\s\S]*?<\/style>/gi, '');

// 2) nasza nowa, jednolita sekcja ROI + contact
const roiSection = `
<section id="roi" class="roi-shell">
  <div class="roi-head">
    <p class="roi-eyebrow">READY TO MEASURE &amp; TALK?</p>
    <h2 class="roi-title">Estimate your ROI</h2>
    <p class="roi-sub">Directional — to decide if now is the right moment.</p>
  </div>
  <div class="roi-grid">
    <div class="roi-calc card">
      <div class="roi-calc-head">Estimate your ROI</div>

      <label class="roi-label" for="roi-traffic">Monthly target traffic</label>
      <input id="roi-traffic" type="number" min="0" step="50" value="1000" class="roi-input" />

      <div class="roi-inline">
        <div class="roi-col">
          <label class="roi-label" for="roi-cr">Conversion rate (%)</label>
          <input id="roi-cr" type="number" step="0.1" value="1.5" class="roi-input" />
        </div>
        <div class="roi-col">
          <label class="roi-label" for="roi-ltv">Avg. order/lead value</label>
          <div class="roi-ccy-wrap">
            <select id="roi-ccy" class="roi-ccy">
              <option value="EUR" selected>EUR</option>
              <option value="USD">USD</option>
              <option value="PLN">PLN</option>
            </select>
            <input id="roi-ltv" type="number" step="10" value="800" class="roi-input" />
          </div>
        </div>
      </div>

      <label class="roi-label" for="roi-inv">Monthly investment</label>
      <input id="roi-inv" type="number" min="0" step="50" value="3000" class="roi-input" />

      <button id="roi-btn" class="roi-btn">Calculate</button>

      <div id="roi-out" class="roi-out"></div>
    </div>

    <div class="roi-contact card">
      <h3>Contact</h3>
      <p class="roi-contact-sub">Tell us what you're building — we'll help you make it visible.</p>
      <label class="roi-label" for="c-name">Name</label>
      <input id="c-name" class="roi-input" type="text" placeholder="Your name" />
      <label class="roi-label" for="c-mail">Email</label>
      <input id="c-mail" class="roi-input" type="email" placeholder="you@company.com" />
      <label class="roi-label" for="c-msg">Message</label>
      <textarea id="c-msg" class="roi-input" rows="3" placeholder="Describe the project..."></textarea>
      <button class="roi-btn roi-btn-wide">Send</button>
      <div class="roi-footnotes">
        <p class="small">We usually reply within 1–2 business days.</p>
        <p class="small muted">Working across EU, UK, US &amp; global teams. SEO • AI • Strategy • Automation.</p>
      </div>
    </div>
  </div>
</section>
`;

// 3) dopnij style
const styles = `
<style id="abrand-roi-v4">
#roi.roi-shell{max-width:1200px;margin:0 auto;padding:42px 1.5rem 56px;}
#roi .roi-head{margin-bottom:26px;}
#roi .roi-eyebrow{letter-spacing:.08em;font-size:.7rem;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:4px;}
#roi .roi-title{font-size:1.4rem;margin:0 0 3px;}
#roi .roi-sub{color:rgba(255,255,255,.45);max-width:520px;font-size:.85rem;}
#roi .roi-grid{display:flex;gap:34px;align-items:flex-start;}
#roi .card{background:rgba(1,16,22,.25);border:1px solid rgba(255,255,255,.02);border-radius:22px;padding:20px 20px 18px;}
#roi .roi-calc{flex:1.05;min-width:360px;}
#roi .roi-contact{flex:.8;}
#roi .roi-label{display:block;font-size:.7rem;margin-bottom:5px;color:rgba(255,255,255,.7);}
#roi .roi-input,#roi .roi-ccy{width:100%;background:rgba(3,17,23,.65);border:1px solid rgba(255,255,255,.03);border-radius:14px;padding:8px 10px;color:#fff;font-size:.78rem;outline:none;}
#roi .roi-input:focus,#roi .roi-ccy:focus{border-color:rgba(130,244,237,.45);}
#roi .roi-inline{display:flex;gap:10px;margin-bottom:10px;}
#roi .roi-col{flex:1;}
#roi .roi-ccy-wrap{display:flex;gap:8px;}
#roi .roi-ccy{max-width:80px;}
#roi .roi-btn{margin-top:14px;background:linear-gradient(90deg,#6ce0dd,#55f2b0);border:none;border-radius:16px;padding:8px 18px;font-weight:600;color:#012;font-size:.78rem;cursor:pointer;}
#roi .roi-btn-wide{width:100%;text-align:center;margin-top:14px;}
#roi .roi-out{margin-top:16px;font-size:.7rem;line-height:1.4;color:rgba(255,255,255,.85);}
#roi .roi-out p{margin:2px 0;}
#roi .roi-contact-sub{font-size:.72rem;color:rgba(255,255,255,.5);margin-bottom:14px;}
#roi .roi-footnotes{margin-top:14px;}
#roi .roi-footnotes .small{font-size:.62rem;color:rgba(255,255,255,.5);line-height:1.25;}
#roi .roi-footnotes .muted{color:rgba(255,255,255,.32);}
@media (max-width:900px){
  #roi.roi-shell{padding:32px 1rem 46px;}
  #roi .roi-grid{flex-direction:column;gap:20px;}
  #roi .roi-calc,#roi .roi-contact{min-width:0;width:100%;}
}
</style>
`;

// 4) dopnij JS z kalkulatorem – CAP = 320
const script = `
<script id="abrand-roi-calc">
(function(){
  const sec = document.querySelector('#roi');
  if(!sec) return;

  const trafficEl = sec.querySelector('#roi-traffic');
  const crEl      = sec.querySelector('#roi-cr');
  const ltvEl     = sec.querySelector('#roi-ltv');
  const invEl     = sec.querySelector('#roi-inv');
  const ccyEl     = sec.querySelector('#roi-ccy');
  const btn       = sec.querySelector('#roi-btn');
  const outEl     = sec.querySelector('#roi-out');

  const CAP = 320;           // max ROI
  const MIN_INV = 250;       // min invest
  const MAX_TRAFFIC = 30000; // safety
  const MAX_LTV = 5000;      // safety

  function fmt(num, ccy){
    const n = Math.round(num);
    if (ccy === 'PLN') return new Intl.NumberFormat('pl-PL').format(n);
    if (ccy === 'USD') return new Intl.NumberFormat('en-US').format(n);
    return new Intl.NumberFormat('de-DE').format(n);
  }

  function calc(){
    let traffic = Number(trafficEl.value || 0);
    let cr = Number(crEl.value || 0);
    let ltv = Number(ltvEl.value || 0);
    let inv = Number(invEl.value || 0);
    const ccy = ccyEl.value || 'EUR';

    if (traffic > MAX_TRAFFIC) traffic = MAX_TRAFFIC;
    if (ltv > MAX_LTV) ltv = MAX_LTV;
    if (cr < 0) cr = 0;

    let usedInv = inv;
    if (inv > 0 && inv < MIN_INV) usedInv = MIN_INV;

    // jeżeli nie ma ruchu a jest inwestycja → oszacuj ruch
    let effTraffic = traffic;
    if (!traffic && usedInv > 0){
      effTraffic = Math.round(usedInv * 3.5);
    }

    // leads + revenue
    const leads = effTraffic * (cr/100);
    const revenue = leads * ltv;

    let roi = 0;
    if (usedInv > 0){
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > CAP) roi = CAP;
    }

    let cpl = null;
    if (usedInv > 0 && leads > 0){
      cpl = usedInv / leads;
    }

    outEl.innerHTML = ''
      + '<p class="roi-result">Est. monthly value: <strong>' + fmt(revenue, ccy) + ' ' + ccy + '</strong>'
      + ' • Est. ROI: <strong>' + roi.toFixed(1) + '%</strong>'
      + ' • Est. leads: <strong>' + Math.round(leads) + '</strong></p>'
      + '<p class="roi-note">Live calc: user traffic wins, budget fills gaps, ROI capped at ' + CAP + '%.</p>'
      + '<p class="roi-note">Est. cost per lead: <strong>' + (cpl ? cpl.toFixed(2) + ' ' + ccy : '–') + '</strong></p>';
  }

  [trafficEl, crEl, ltvEl, invEl, ccyEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
})();
</script>
`;

// 5) wstrzyknij przed </main> albo na koniec body
if (html.includes('</main>')) {
  html = html.replace('</main>', roiSection + '\n</main>');
} else if (html.includes('</body>')) {
  html = html.replace('</body>', roiSection + '\n</body>');
} else {
  html += '\n' + roiSection;
}

// 6) upewnij się, że style i script są w <head> / na końcu
if (html.includes('</head>')) {
  html = html.replace('</head>', styles + '\n</head>');
} else {
  html = styles + '\n' + html;
}
if (html.includes('</body>')) {
  html = html.replace('</body>', script + '\n</body>');
} else {
  html += '\n' + script;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI sekcja podmieniona, CAP=320%, jeden CPL, kontakt z małą czcionką.');
