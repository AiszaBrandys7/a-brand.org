const fs = require('fs');
const path = require('path');

const FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'a-brand.org', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

/* === 1) wspólny font + layout dla ROI i contact === */
const css = `
<style id="roi-tight-css">
  #roi, section#roi {
    font-family: inherit;
  }
  #roi .roi-row {
    display:flex;
    gap:28px;
    align-items:stretch;
  }
  #roi .roi-left, #roi .roi-right {
    flex:1 1 0;
    display:flex;
    flex-direction:column;
  }
  #roi .roi-box {
    background: rgba(0,0,0,.14);
    border: 1px solid rgba(255,255,255,.03);
    border-radius: 18px;
    padding: 20px 20px 16px;
  }
  #roi .roi-meta, #roi .roi-foot, #roi .roi-cpl {
    font-size: .7rem;
    line-height: 1.35;
    color: rgba(255,255,255,.72);
    margin-top: 6px;
  }
  #roi .roi-foot.muted {
    color: rgba(255,255,255,.45);
  }
  /* na mobile jedna pod drugą */
  @media (max-width: 900px) {
    #roi .roi-row { flex-direction:column; gap:20px; }
  }
</style>
`;
if (!html.includes('id="roi-tight-css"')) {
  html = html.replace('</head>', css + '\n</head>');
}

/* === 2) JS – łapie poprawne inputy, liczy i pilnuje 320% === */
const js = `
<script id="roi-tight-js">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.querySelector('#roi, section#roi');
  if (!roi) return;

  // 1. popraw nagłówek wewnątrz (żeby nie było drugi raz "Estimate your ROI")
  roi.querySelectorAll('h3, h4').forEach(function(h, i){
    var txt = (h.textContent || '').trim().toLowerCase();
    if (i > 0 && txt.indexOf('estimate your roi') !== -1) {
      h.textContent = 'Calculator';
    }
  });

  // 2. złap inputy – w tym layoucie są po kolei: traffic, CR, investment? / albo traffic, CR, value, investment
  var inputs = roi.querySelectorAll('#roi input[type="number"], #roi input:not([type])');
  // filtrujemy tylko widoczne
  inputs = Array.prototype.filter.call(inputs, function(el){
    return el.offsetParent !== null;
  });

  // helper do liczb PL
  function toNum(v){
    if (!v) return 0;
    v = String(v);
    // usuń spacje i niełamiące się spacje
    v = v.replace(/[\\s\\u00A0]/g, '');
    // zamień przecinek na kropkę
    v = v.replace(',', '.');
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  function clamp(n, min, max){
    if (n < min) n = min;
    if (max !== null && n > max) n = max;
    return n;
  }

  // mamy 4 pola, ale kolejność może być 1) traffic 2) CR 3) (waluta+value) 4) investment
  var trafficEl   = inputs[0] || null;
  var crEl        = inputs[1] || null;
  // LTV siedzi tuż za selectem walut
  var ltvEl       = null;
  var selects     = roi.querySelectorAll('#roi select');
  if (selects.length) {
    var sel = selects[0];
    // znajdź input w tym samym wierszu
    var maybeInput = sel.parentNode.querySelector('input');
    if (maybeInput) ltvEl = maybeInput;
  }
  // jeśli dalej brak ltv – spróbuj wziąć trzeci input
  if (!ltvEl && inputs[2]) ltvEl = inputs[2];

  // investment to ostatni input
  var invEl       = inputs[inputs.length - 1] || null;

  var btn = roi.querySelector('button, .calc-btn, input[type="submit"]');

  // miejsce na wynik
  var out = roi.querySelector('.roi-result');
  if (!out) {
    out = document.createElement('p');
    out.className = 'roi-result';
    roi.querySelector('.roi-left')?.appendChild(out);
  }

  // usuń stare linijki "ROI capped at 420%"
  roi.querySelectorAll('p, small, span').forEach(function(el){
    if (el.textContent && el.textContent.indexOf('420%') !== -1) {
      el.textContent = el.textContent.replace('420%', '320%');
    }
  });

  function calc(){
    var traffic = trafficEl ? toNum(trafficEl.value) : 0;
    var cr      = crEl ? toNum(crEl.value) : 0;
    var ltv     = ltvEl ? toNum(ltvEl.value) : 0;
    var inv     = invEl ? toNum(invEl.value) : 0;
    var ccy     = selects.length ? (selects[0].value || 'EUR') : 'EUR';

    // domyślki
    traffic = clamp(traffic || 0, 0, 30000);
    if (traffic === 0) traffic = 800; // nasz soft baseline
    cr      = clamp(cr || 0, 0, 15);
    ltv     = clamp(ltv || 800, 0, 5000); // 800 jeśli puste
    inv     = clamp(inv || 0, 0, 20000);
    if (inv > 0 && inv < 250) inv = 250;

    // policz
    var leads   = traffic * (cr / 100);
    var revenue = leads * ltv;
    var roiPct  = 0;
    if (inv > 0) {
      roiPct = (revenue / inv) * 100;
    }

    // CAP 320% – i revenue, i ROI
    if (roiPct > 320) {
      roiPct  = 320;
      if (inv > 0) {
        revenue = inv * 3.2;
      }
    }

    // zapisz z powrotem przycięte wartości do pól
    if (trafficEl) trafficEl.value = traffic;
    if (crEl)      crEl.value      = cr;
    if (ltvEl)     ltvEl.value     = ltv;
    if (invEl)     invEl.value     = inv;

    // wynik główny
    if (out) {
      out.textContent = 'Est. monthly value: ' + revenue.toFixed(0) + ' ' + ccy + ' • Est. ROI: ' + roiPct.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }

    // jedna linijka info
    var foot = roi.querySelector('.roi-foot-single');
    if (!foot) {
      foot = document.createElement('p');
      foot.className = 'roi-foot-single';
      roi.querySelector('.roi-left')?.appendChild(foot);
    }
    foot.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.';

    // CPL
    var cplEl = roi.querySelector('.roi-cpl');
    if (!cplEl) {
      cplEl = document.createElement('p');
      cplEl.className = 'roi-cpl';
      roi.querySelector('.roi-left')?.appendChild(cplEl);
    }
    if (leads > 0) {
      cplEl.textContent = 'Est. cost per lead: ' + (inv / leads).toFixed(2) + ' ' + ccy;
    } else {
      cplEl.textContent = 'Est. cost per lead: –';
    }
  }

  [trafficEl, crEl, ltvEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      calc();
    });
  }

  calc();
});
</script>
`;

if (!html.includes('id="roi-tight-js"')) {
  html = html.replace('</body>', js + '\n</body>');
}

// zapisz plik
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI: jednolity font, 320% wszędzie, parser PL liczb, jeden opis.');
