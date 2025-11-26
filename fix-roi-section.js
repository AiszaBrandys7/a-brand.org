const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal wszystkie stare style/script z id zaczynającym się na "roi"
html = html
  .replace(/<style id="roi[^"]*">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script id="roi[^"]*">[\s\S]*?<\/script>\s*/g, '');

// 2) podmień samą sekcję ROI na nową, czystą wersję
const roiNew = `
<section id="roi" class="roi-shell">
  <div class="roi-grid">
    <article class="roi-card">
      <p class="roi-eyebrow">READY TO MEASURE &amp; TALK?</p>
      <h2 class="roi-title">Estimate your ROI</h2>
      <p class="roi-sub">Directional — to decide if now is the right moment.</p>

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

      <button id="roi-btn" class="roi-btn roi-btn-wide">Calculate</button>

      <div id="roi-out" class="roi-out"></div>
      <p id="roi-note" class="roi-note"></p>
      <p id="roi-cpl" class="roi-note"></p>
    </article>

    <article class="roi-contact">
      <h2 class="roi-title">Contact</h2>
      <p class="roi-sub">Tell us what you're building — we'll help you make it visible.</p>
      <label class="roi-label" for="c-name">Name</label>
      <input id="c-name" class="roi-input" type="text" placeholder="Your name" />
      <label class="roi-label" for="c-mail">Email</label>
      <input id="c-mail" class="roi-input" type="email" placeholder="you@company.com" />
      <label class="roi-label" for="c-msg">Message</label>
      <textarea id="c-msg" class="roi-input" rows="3" placeholder="Describe the project..."></textarea>
      <button class="roi-btn roi-btn-wide">Send</button>
      <p class="roi-foot">We usually reply within 1–2 business days.</p>
      <p class="roi-foot muted">Working across EU, UK, US &amp; global teams. SEO • AI • Strategy • Automation.</p>
    </article>
  </div>
</section>
`;

// jeśli jest stara sekcja #roi → zamień, jeśli nie ma → dołóż przed </main> albo przed </footer>
if (html.includes('<section id="roi')) {
  html = html.replace(/<section id="roi"[\s\S]*?<\/section>/, roiNew);
} else if (html.includes('</main>')) {
  html = html.replace('</main>', roiNew + '\n</main>');
} else {
  html += '\n' + roiNew + '\n';
}

// 3) dołóż świeży CSS
const roiCSS = `
<style id="roi-section">
  #roi.roi-shell{
    max-width: 1180px;
    margin: 0 auto;
    padding: 50px 20px 56px;
  }
  #roi .roi-grid{
    display: flex;
    gap: 32px;
    align-items: stretch;
  }
  #roi .roi-card,
  #roi .roi-contact{
    background: rgba(11,15,24,.35);
    border: 1px solid rgba(255,255,255,.03);
    border-radius: 18px;
    padding: 18px 18px 20px;
    flex: 1 1 0;
    min-width: 340px;
  }
  #roi .roi-eyebrow{
    text-transform: uppercase;
    letter-spacing: .08em;
    font-size: .65rem;
    color: rgba(255,255,255,.55);
    margin-bottom: 4px;
  }
  #roi .roi-title{
    margin: 0 0 6px;
    font-size: 1.15rem;
  }
  #roi .roi-sub{
    margin: 0 0 16px;
    font-size: .78rem;
    color: rgba(255,255,255,.46);
  }
  #roi .roi-label{
    display:block;
    font-size:.68rem;
    margin-bottom:5px;
  }
  #roi .roi-input,
  #roi .roi-ccy{
    width:100%;
    background: rgba(4,7,12,.3);
    border:1px solid rgba(255,255,255,.03);
    border-radius:12px;
    padding:8px 10px;
    color:#fff;
    font-size:.8rem;
    outline:none;
  }
  #roi .roi-inline{display:flex;gap:10px;margin-bottom:10px;}
  #roi .roi-col{flex:1;}
  #roi .roi-ccy-wrap{display:flex;gap:6px;}
  #roi .roi-ccy{max-width:78px;}
  #roi .roi-btn{
    background: linear-gradient(135deg,#63e6b9,#73bff5);
    border:none;
    color:#041014;
    font-weight:600;
    padding:8px 16px;
    border-radius:14px;
    cursor:pointer;
    transition:transform .12s ease;
  }
  #roi .roi-btn:hover{transform:translateY(-1px);}
  #roi .roi-btn-wide{width:100%;margin-top:10px;}
  #roi .roi-out{
    margin-top:12px;
    font-size:.7rem;
    line-height:1.35;
  }
  #roi .roi-note{
    font-size:.65rem;
    color:rgba(255,255,255,.5);
    margin-top:4px;
  }
  #roi .roi-contact textarea{
    min-height:120px;
    resize:vertical;
  }
  #roi .roi-foot{
    margin-top:10px;
    font-size:.62rem;
    color:rgba(255,255,255,.55);
  }
  #roi .roi-foot.muted{
    color:rgba(255,255,255,.35);
  }
  @media (max-width: 980px){
    #roi .roi-grid{flex-direction:column;gap:20px;}
    #roi .roi-card,#roi .roi-contact{min-width:0;width:100%;}
  }
</style>
`;

html = html.replace('</head>', roiCSS + '\n</head>');

// 4) świeży kalkulator z CAP=320
const roiJS = `
<script id="roi-calc-clean">
document.addEventListener('DOMContentLoaded', function(){
  var wrap = document.getElementById('roi');
  if (!wrap) return;

  var trafficEl = document.getElementById('roi-traffic');
  var crEl      = document.getElementById('roi-cr');
  var ltvEl     = document.getElementById('roi-ltv');
  var ccyEl     = document.getElementById('roi-ccy');
  var invEl     = document.getElementById('roi-inv');
  var outEl     = document.getElementById('roi-out');
  var noteEl    = document.getElementById('roi-note');
  var cplEl     = document.getElementById('roi-cpl');
  var btn       = document.getElementById('roi-btn');

  var CAP = 320;
  var MIN_INV = 250;
  var MAX_TRAFFIC = 30000;
  var MAX_LTV = 5000;

  function num(v, d){ v = parseFloat(v); return isNaN(v) ? (d||0) : v; }

  function calc(){
    var traffic = num(trafficEl.value, 0);
    var cr      = num(crEl.value, 1.5);
    var ltv     = num(ltvEl.value, 800);
    var inv     = num(invEl.value, 0);
    var ccy     = ccyEl.value || 'EUR';

    if (traffic < 0) traffic = 0;
    if (traffic > MAX_TRAFFIC) traffic = MAX_TRAFFIC;
    if (ltv > MAX_LTV) ltv = MAX_LTV;
    if (cr < 0) cr = 0;

    var usedInv = inv > 0 ? inv : 0;
    if (usedInv > 0 && usedInv < MIN_INV) usedInv = MIN_INV;

    // leads & revenue
    var leads = traffic * (cr / 100);
    var revenue = leads * ltv;

    var roi = 0;
    if (usedInv > 0){
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > CAP) roi = CAP;
    }

    var cpl = (usedInv > 0 && leads > 0) ? (usedInv / leads) : null;

    if (outEl){
      outEl.textContent = 'Est. monthly value: ' + Math.round(revenue).toLocaleString() + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }
    if (noteEl){
      noteEl.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at ' + CAP + '%.';
    }
    if (cplEl){
      cplEl.textContent = 'Est. cost per lead: ' + (cpl ? cpl.toFixed(2) + ' ' + ccy : '–');
    }

    // podłóż przycięte wartości z powrotem
    trafficEl.value = traffic;
    ltvEl.value = ltv;
    invEl.value = inv > 0 ? usedInv : inv;
  }

  [trafficEl, crEl, ltvEl, ccyEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

html = html.replace('</body>', roiJS + '\n</body>');

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Clean ROI section injected: 2 columns, CAP=320%, calculator on the left, contact on the right.');
