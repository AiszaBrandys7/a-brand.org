const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

// 1) wyrzuć wszystkie stare roi-style i roi-script
html = html
  .replace(/<style[^>]+id="[^"]*roi[^"]*"[\s\S]*?<\/style>\s*/gi, '')
  .replace(/<script[^>]+id="[^"]*roi[^"]*"[\s\S]*?<\/script>\s*/gi, '')
  // stare wstrzyknięcia z "Live calc:"
  .replace(/<script>[\s\S]*?Live calc:[\s\S]*?<\/script>\s*/gi, '');

// 2) nasz JEDYNY css dla tej sekcji
const roiCss = `
<style id="roi-clean-2025">
#roi{
  max-width:1180px;
  margin:0 auto;
  padding:46px 16px 54px;
}
#roi .roi-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  margin-bottom:20px;
}
#roi .roi-eyebrow{
  letter-spacing:.08em;
  font-size:.68rem;
  text-transform:uppercase;
  color:rgba(243,246,255,.55);
}
#roi .roi-title{
  font-size:1.4rem;
  margin:2px 0 3px;
}
#roi .roi-sub{
  color:rgba(243,246,255,.42);
  max-width:360px;
  font-size:.78rem;
}
#roi .roi-grid{
  display:grid;
  grid-template-columns:minmax(0,1.08fr) minmax(300px,.68fr);
  gap:26px;
  align-items:stretch;
}
#roi .roi-card,
#roi .roi-contact{
  background:rgba(12,18,30,.45);
  border:1px solid rgba(243,246,255,.03);
  border-radius:18px;
  padding:18px 18px 16px;
  display:flex;
  flex-direction:column;
}
#roi .roi-card-title{
  font-weight:600;
  margin-bottom:8px;
}
#roi label{
  font-size:.68rem;
  margin-bottom:4px;
  display:block;
}
#roi input,
#roi select,
#roi textarea{
  width:100%;
  background:rgba(5,7,13,.35);
  border:1px solid rgba(243,246,255,.02);
  border-radius:12px;
  padding:7px 10px;
  color:#fff;
  font-size:.77rem;
}
#roi .roi-inline{
  display:flex;
  gap:10px;
}
#roi .roi-inline .col{flex:1 1 0;}
#roi .roi-ccy-wrap{
  display:flex;
  gap:6px;
}
#roi .roi-ccy-wrap select{max-width:80px;}
#roi .roi-btn{
  margin-top:12px;
  background:linear-gradient(135deg,#6ce0dd,#55f2b0);
  border:none;
  border-radius:14px;
  padding:8px 18px;
  font-weight:600;
  color:#011017;
  cursor:pointer;
  transition:transform .15s ease;
}
#roi .roi-btn:hover{transform:translateY(-1px);}
#roi .roi-out{
  margin-top:14px;
  font-size:.7rem;
  line-height:1.35;
  color:rgba(243,246,255,.94);
}
#roi .roi-meta{
  margin-top:6px;
  font-size:.63rem;
  line-height:1.35;
  color:rgba(243,246,255,.48);
}
#roi .roi-contact .roi-btn{
  width:100%;
  margin-top:14px;
}
#roi .roi-foot{
  margin-top:6px;
  font-size:.61rem;
  color:rgba(243,246,255,.38);
}
@media (max-width:900px){
  #roi{padding:38px 14px 46px;}
  #roi .roi-head{flex-direction:column;gap:6px;}
  #roi .roi-grid{grid-template-columns:1fr;gap:16px;}
  #roi .roi-inline{flex-direction:column;}
  #roi .roi-contact{max-width:100%;}
}
</style>
`;

// 3) nasz JEDYNY js do liczenia (CAP = 320)
const roiJs = `
<script id="roi-clean-2025-js">
document.addEventListener('DOMContentLoaded', function(){
  var wrap = document.getElementById('roi');
  if (!wrap) return;

  var trafficEl = wrap.querySelector('#roi-traffic');
  var crEl      = wrap.querySelector('#roi-cr');
  var ltvEl     = wrap.querySelector('#roi-ltv');
  var ccyEl     = wrap.querySelector('#roi-ccy');
  var invEl     = wrap.querySelector('#roi-inv');
  var btn       = wrap.querySelector('#roi-btn');
  var outEl     = wrap.querySelector('#roi-out');
  var notesWrap = document.createElement('p');
  notesWrap.className = 'roi-meta';
  wrap.querySelector('.roi-card').appendChild(notesWrap);

  var CAP = 320;
  var MIN_INV = 250;
  var MAX_TRAFFIC = 30000;
  var MAX_LTV = 5000;

  function toNum(v, d){
    var n = parseFloat(String(v||'').replace(/,/g,'.'));
    return isNaN(n) ? (d||0) : n;
  }

  function calc(){
    var traffic = toNum(trafficEl && trafficEl.value, 0);
    var cr      = toNum(crEl && crEl.value, 1.5);
    var ltv     = toNum(ltvEl && ltvEl.value, 800);
    var ccy     = ccyEl ? ccyEl.value : 'EUR';
    var inv     = toNum(invEl && invEl.value, 0);

    if (traffic < 0) traffic = 0;
    if (traffic > MAX_TRAFFIC) traffic = MAX_TRAFFIC;
    if (cr < 0) cr = 0;
    if (ltv < 0) ltv = 0;
    if (ltv > MAX_LTV) ltv = MAX_LTV;

    var usedInv = 0;
    if (inv > 0){
      usedInv = inv < MIN_INV ? MIN_INV : inv;
    }

    // jeśli user nie podał traffic → używamy miękkiego domyślnego z inwestycji
    if (!traffic || traffic === 0){
      traffic = usedInv > 0 ? Math.min(800 + usedInv * 0.25, MAX_TRAFFIC) : 800;
    }

    var leads   = traffic * (cr / 100);
    var revenue = leads * (ltv || 800);

    var roi = 0;
    if (usedInv > 0){
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > CAP){
        roi = CAP;
        revenue = usedInv * (1 + CAP/100); // żeby ROI zgadzał się z revenue
      }
    }

    // CPL
    var cpl = (usedInv > 0 && leads > 0) ? (usedInv / leads) : null;

    if (outEl){
      outEl.textContent =
        'Est. monthly value: ' + Math.round(revenue).toLocaleString('en-US') + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }

    notesWrap.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at ' + CAP + '%.'
      + (cpl ? ' Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy + '.' : '');
  }

  [trafficEl, crEl, ltvEl, ccyEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      calc();
    });
  }

  calc();
});
</script>
`;

// 4) wstrzykujemy CSS przed </head>
if (html.includes('</head>')) {
  html = html.replace('</head>', roiCss + '\n</head>');
} else {
  html = roiCss + '\n' + html;
}

// 5) wstrzykujemy JS przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', roiJs + '\n</body>');
} else {
  html = html + '\n' + roiJs;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI i kontakt: jedna sekcja, CAP=320%, wyrównane nagłówki i przyciski.');
