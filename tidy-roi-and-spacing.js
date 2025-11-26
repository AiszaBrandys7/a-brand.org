const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/* 1) wywal wszystkie stare nasze roi-style i roi-script,
      bo tam siedzi kilka wersji naraz i się gryzą */
html = html
  .replace(/<style id="[^"]*roi[^"]*">[\s\S]*?<\/style>/g, '')
  .replace(/<script id="[^"]*roi[^"]*">[\s\S]*?<\/script>/g, '');

/* 2) nowy, jeden CSS – równe sekcje + równy ROI */
const style = `
<style id="a-brand-2025-layout">
main > section,
section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 54px 18px 54px;
}
section + section {
  margin-top: 0;
}
#cases { padding-bottom: 40px; }
#roi {
  padding-top: 44px;
}
#roi .roi-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, .65fr);
  gap: 26px;
  align-items: flex-start;
}
#roi .roi-calc,
#roi .roi-contact {
  background: rgba(5,10,16,.35);
  border: 1px solid rgba(255,255,255,.03);
  border-radius: 18px;
  padding: 18px 18px 14px;
  min-height: 320px;
}
#roi .roi-head { margin-bottom: 16px; }
#roi .roi-title { margin: 0; line-height: 1.04; }
#roi .roi-contact h3 {
  margin-top: 0;
  line-height: 1.04;
}
#roi .roi-contact textarea {
  min-height: 110px;
  resize: vertical;
}
#roi .roi-btn {
  margin-top: 14px;
}
@media (max-width: 900px) {
  main > section,
  section {
    padding: 40px 14px 44px;
  }
  #roi .roi-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  #roi .roi-calc,
  #roi .roi-contact {
    min-height: auto;
  }
}
</style>
`;

/* 3) nowy, jeden JS – CAP 320%, clampy, jeden dopisek */
const script = `
<script id="a-brand-roi-320">
document.addEventListener('DOMContentLoaded', function () {
  var wrap = document.getElementById('roi');
  if (!wrap) return;

  var trafficEl = document.getElementById('roi-traffic');
  var crEl      = document.getElementById('roi-cr');
  var ltvEl     = document.getElementById('roi-ltv');
  var ccyEl     = document.getElementById('roi-ccy');
  var invEl     = document.getElementById('roi-inv');
  var btn       = document.getElementById('roi-btn');
  var outEl     = document.getElementById('roi-out');

  var CAP        = 320;
  var MIN_INV    = 250;
  var MAX_TRAFF  = 30000;
  var MAX_LTV    = 5000;
  var MAX_INV    = 20000;

  function toNum(v, defVal){
    if (v == null || v === '') return defVal || 0;
    v = String(v).replace(/[^0-9.,-]/g,'').replace(',','.');
    var n = parseFloat(v);
    return isNaN(n) ? (defVal || 0) : n;
  }
  function clamp(n, min, max){
    if (typeof n !== 'number') n = 0;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  }

  function calc(){
    var traffic = clamp(toNum(trafficEl && trafficEl.value, 0), 0, MAX_TRAFF);
    var cr      = clamp(toNum(crEl && crEl.value, 1.5), 0, 15);
    var ltv     = clamp(toNum(ltvEl && ltvEl.value, 800), 0, MAX_LTV);
    var ccy     = ccyEl && ccyEl.value ? ccyEl.value : 'EUR';
    var invRaw  = clamp(toNum(invEl && invEl.value, 0), 0, MAX_INV);

    // jeśli ktoś wpisał 0 ruchu → daj miękki 800
    if (traffic === 0) traffic = 800;

    // min inwestycja
    var usedInv = invRaw > 0 && invRaw < MIN_INV ? MIN_INV : invRaw;

    // liczymy
    var leads   = traffic * (cr / 100);
    var revenue = leads * ltv;

    var roi = 0;
    if (usedInv > 0) {
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > CAP) {
        roi = CAP;
        // żeby ROI=320% było prawdziwe → revenue = inv * (1 + 3.2)
        revenue = usedInv * (1 + CAP/100);
      }
    }

    // CPL
    var cpl = null;
    if (usedInv > 0 && leads > 0) {
      cpl = usedInv / leads;
    }

    if (outEl) {
      outEl.innerHTML =
        'Est. monthly value: ' + Math.round(revenue).toLocaleString('en-US') + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);

      // jeden dopisek pod spodem
      var note = wrap.querySelector('#roi-note-single');
      if (!note) {
        note = document.createElement('p');
        note.id = 'roi-note-single';
        note.style.fontSize = '.68rem';
        note.style.color = 'rgba(243,246,255,.45)';
        note.style.marginTop = '6px';
        outEl.parentNode.appendChild(note);
      }
      note.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.';

      var cplLine = wrap.querySelector('#roi-cpl-single');
      if (!cplLine) {
        cplLine = document.createElement('p');
        cplLine.id = 'roi-cpl-single';
        cplLine.style.fontSize = '.68rem';
        cplLine.style.color = 'rgba(243,246,255,.70)';
        outEl.parentNode.appendChild(cplLine);
      }
      cplLine.textContent = cpl ? ('Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy) : 'Est. cost per lead: –';
    }

    // przytnij pola widzialnie
    if (trafficEl) trafficEl.value = traffic;
    if (crEl)      crEl.value      = cr;
    if (ltvEl)     ltvEl.value     = ltv;
    if (invEl)     invEl.value     = usedInv ? usedInv : invRaw;
  }

  [trafficEl, crEl, ltvEl, ccyEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

/* 4) wstrzykujemy na koniec head i przed </body> */
if (html.includes('</head>')) {
  html = html.replace('</head>', style + '\n</head>');
} else {
  html = style + '\n' + html;
}
if (html.includes('</body>')) {
  html = html.replace('</body>', script + '\n</body>');
} else {
  html = html + '\n' + script;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ layout + ROI 320% odświeżone, jeden kalkulator, równe paddingi.');
