const fs = require('fs');
const path = require('path');

const FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'a-brand.org', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

/* 1) CSS: jeden nagłówek, dwa panele obok siebie, równa wysokość */
const css = `
<style id="roi-final-css">
  section#roi, #roi {
    padding-top: 46px;
  }
  #roi .roi-row {
    display:flex;
    gap:28px;
    align-items:stretch;
  }
  #roi .roi-left,
  #roi .roi-right {
    flex:1 1 0;
    display:flex;
    flex-direction:column;
  }
  #roi .roi-card {
    flex:1 1 auto;
  }
  @media (max-width:900px){
    #roi .roi-row { flex-direction:column; gap:20px; }
  }
</style>
`;

if (!html.includes('id="roi-final-css"')) {
  html = html.includes('</head>')
    ? html.replace('</head>', css + '\n</head>')
    : css + '\n' + html;
}

/* 2) JS: clamp danych + jedna linijka o 320% + spójna kalkulacja */
const js = `
<script id="roi-final-js">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.querySelector('#roi, section#roi');
  if (!roi) return;

  // nagłówek główny zostaje; w środku boxu zamieniamy powtórkę na "Calculator"
  var innerTitles = roi.querySelectorAll('h3, .roi-card h3, .roi-card .title');
  innerTitles.forEach(function(el, idx){
    var t = (el.textContent || '').trim().toLowerCase();
    if (idx > 0 && t.indexOf('estimate your roi') !== -1) {
      el.textContent = 'Calculator';
    }
  });

  // helpery do pól
  function q(sel){
    return roi.querySelector(sel);
  }

  // spróbuj złapać pola
  var trafficEl = q('input[name="traffic"], input[data-field="traffic"], input[placeholder*="traffic"], input[placeholder*="Traffic"]');
  var crEl      = q('input[name="cr"], input[data-field="cr"], input[placeholder*="%"]');
  var ltvWrap   = q('input[name="ltv"], input[data-field="ltv"], input[placeholder*="order"], input[placeholder*="lead"]');
  var currencyEl= q('select, .currency select');
  var invEl     = q('input[name="investment"], input[data-field="investment"], input[placeholder*="investment"], input[placeholder*="Monthly investment"]');
  var btn       = q('button, .calc-btn, input[type="submit"]');
  var outEl     = q('.roi-result, .calc-out, .roi-out');

  // jeśli nie ma LTV, będziemy używać 800
  function clamp(num, min, max){
    num = parseFloat(num);
    if (isNaN(num)) num = 0;
    if (min !== null && num < min) num = min;
    if (max !== null && num > max) num = max;
    return num;
  }

  // usuń stare "ROI capped at 420%" jeśli jakieś siedziały w HTML
  roi.querySelectorAll('*').forEach(function(el){
    if (el.childNodes && el.childNodes.length){
      el.childNodes.forEach(function(n){
        if (n.nodeType === 3){
          var txt = n.textContent;
          if (txt && txt.indexOf('ROI capped at 420%') !== -1){
            n.textContent = txt.replace('420%', '320%');
          }
        }
      });
    }
  });

  function calc(){
    var traffic = trafficEl ? trafficEl.value : '';
    var cr      = crEl ? crEl.value : '';
    var ltv     = ltvWrap ? ltvWrap.value : '';
    var inv     = invEl ? invEl.value : '';
    var ccy     = currencyEl ? (currencyEl.value || 'EUR') : 'EUR';

    // domyślne
    var trafficNum = clamp(traffic, 0, 30000);
    if (trafficNum === 0) trafficNum = 800;
    var crNum      = clamp(cr, 0, 15);
    var ltvNum     = clamp(ltv, 0, 5000);
    if (!ltvWrap) ltvNum = 800;
    if (!ltvNum) ltvNum = 800;
    var invNum     = clamp(inv, 0, 20000);

    // min inwestycja
    if (invNum > 0 && invNum < 250) invNum = 250;

    // liczenie
    var leads   = trafficNum * (crNum / 100);
    var revenue = leads * ltvNum;           // surowy przychód

    var roiPct  = 0;
    if (invNum > 0) {
      roiPct = (revenue / invNum) * 100;
    }

    // CAP 320%: jeśli roi > 320, to przytnij i revenue, i roi
    if (roiPct > 320) {
      roiPct  = 320;
      if (invNum > 0) {
        revenue = invNum * 3.2;             // żeby ROI=320% było prawdziwe
      }
    }

    // przepisz przycięte wartości do inputów (żeby user widział)
    if (trafficEl) trafficEl.value = trafficNum;
    if (crEl)      crEl.value      = crNum;
    if (ltvWrap)   ltvWrap.value   = ltvNum;
    if (invEl)     invEl.value     = invNum;

    // wyświetl wynik
    if (outEl){
      outEl.textContent = 'Est. monthly value: ' + revenue.toFixed(0) + ' ' + ccy + ' • Est. ROI: ' + roiPct.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }

    // jedna linijka info
    var foot = q('.roi-footnote-single');
    if (!foot){
      foot = document.createElement('p');
      foot.className = 'roi-footnote-single';
      var card = q('.roi-card') || roi;
      card.appendChild(foot);
    }
    foot.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.';

    // ewentualny CPL
    var cplWrap = q('.roi-cpl');
    if (!cplWrap){
      cplWrap = document.createElement('p');
      cplWrap.className = 'roi-cpl';
      (q('.roi-card') || roi).appendChild(cplWrap);
    }
    var cpl = leads > 0 ? invNum / leads : null;
    cplWrap.textContent = cpl ? ('Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy) : 'Est. cost per lead: –';
  }

  [trafficEl, crEl, ltvWrap, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

if (!html.includes('id="roi-final-js"')) {
  html = html.includes('</body>')
    ? html.replace('</body>', js + '\n</body>')
    : html + '\n' + js + '\n';
}

// zapisz
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI: jeden nagłówek, 320% wszędzie, revenue spójne, layout wyrównany.');
