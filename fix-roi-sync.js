const fs = require('fs');
const path = require('path');

const FILES = ['index.html', 'contact.html']
  .map(f => path.join(process.cwd(), f))
  .filter(f => fs.existsSync(f));

if (!FILES.length) {
  console.log('❌ Nie znalazłem index.html ani contact.html');
  process.exit(0);
}

FILES.forEach(file => {
  let html = fs.readFileSync(file, 'utf8');

  // 1) cap: 420% -> 320%
  html = html.replace(/ROI capped at 420%/g, 'ROI capped at 320%');

  // 2) usuń doklejone stare linijki pod stopką (te "Live calc: ... 420%")
  //    często siedzą po </html> albo tuż przed </body>
  html = html.replace(/Live calc: user traffic wins, budget fills gaps, ROI capped at 320%\.\s*$/m, '');

  // 3) wstrzykujemy bezpieczniejszy kalkulator
  //    najpierw wywal stare nasze poprawki jeśli były
  html = html.replace(/<script id="roi-safe">[\s\S]*?<\/script>\s*/g, '');

  const safeScript = `
<script id="roi-safe">
document.addEventListener('DOMContentLoaded', function(){
  function norm(v){
    if (v == null) return 0;
    // zamień przecinek na kropkę i wywal spacje
    v = String(v).replace(/\\s/g,'').replace(',', '.');
    // zostaw cyfry i kropki
    v = v.replace(/[^0-9.\\-]/g,'');
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  const wrap = document.querySelector('#roi, .roi-shell');
  if (!wrap) return;

  const trafficEl = wrap.querySelector('[name="roi-traffic"], [data-roi="traffic"], input[placeholder="Monthly target traffic"]') || wrap.querySelector('input[type="range"]');
  const crEl      = wrap.querySelector('[name="roi-cr"], [data-roi="cr"]');
  const ltvEl     = wrap.querySelector('[name="roi-ltv"], [data-roi="ltv"]');
  const ccyEl     = wrap.querySelector('[name="roi-ccy"], [data-roi="ccy"], select');
  const costEl    = wrap.querySelector('[name="roi-cost"], [data-roi="cost"]') || wrap.querySelector('input[placeholder="Monthly investment"]');
  const outEl     = wrap.querySelector('.roi-out, .roi-result-line, .roi-output');

  function calc(){
    const traffic = norm(trafficEl && trafficEl.value);
    const cr      = norm(crEl && crEl.value) / 100; // %
    const ltv     = norm(ltvEl && ltvEl.value) || 800; // default 800
    const invRaw  = norm(costEl && costEl.value);
    const ccy     = ccyEl && ccyEl.value ? ccyEl.value : 'EUR';

    // min inwestycji
    const inv = invRaw > 0 && invRaw < 250 ? 250 : invRaw;

    // leady z ruchu
    const leads = traffic * cr;
    const revenue = leads * ltv;

    // ROI
    let roi = 0;
    if (inv > 0) {
      roi = ((revenue - inv) / inv) * 100;
    }
    if (roi < 0) roi = 0;
    if (roi > 320) roi = 320;

    // CPL
    let cpl = null;
    if (leads > 0) cpl = inv / leads;

    if (outEl) {
      outEl.innerHTML =
        'Est. monthly value: ' + revenue.toLocaleString('en-US', {maximumFractionDigits: 0}) + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads) +
        '<div class="small muted">Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.</div>' +
        (cpl !== null ? '<div class="small">Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy + '</div>' : '');
    }
  }

  // nasłuchy
  [trafficEl, crEl, ltvEl, ccyEl, costEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  const btn = wrap.querySelector('button, #calc, #roi-btn, #calc-roi');
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
  `.trim();

  // wstrzykujemy tuż przed </body>
  if (html.includes('</body>')) {
    html = html.replace('</body>', safeScript + '\n</body>');
  } else {
    html += '\n' + safeScript + '\n';
  }

  // 4) dopięcie stylu, żeby lewy i prawy box były równe
  html = html.replace(/<style id="roi-align">[\s\S]*?<\/style>\s*/g,'');
  const alignStyle = `
<style id="roi-align">
#roi.roi-shell{display:flex;gap:28px;align-items:flex-start;}
#roi .roi-left{flex:1 1 58%;min-width:360px;}
#roi .roi-right{flex:1 1 42%;max-width:420px;}
#roi .roi-out{margin-top:14px;}
@media (max-width:900px){
  #roi.roi-shell{flex-direction:column;}
  #roi .roi-left,#roi .roi-right{width:100%;min-width:0;max-width:none;}
}
</style>
  `.trim();
  if (html.includes('</head>')) {
    html = html.replace('</head>', alignStyle + '\n</head>');
  } else {
    html = alignStyle + '\n' + html;
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('✅ Zapisano', path.basename(file));
});
