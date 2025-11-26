const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal nasze stare poprawki, żeby nie walczyły
html = html
  .replace(/<script id="a-brand-roi-final">[\s\S]*?<\/script>/g, '')
  .replace(/<script id="a-brand-roi-clean">[\s\S]*?<\/script>/g, '')
  .replace(/<style id="a-brand-roi-final">[\s\S]*?<\/style>/g, '');

// 2) dorzuć nowe style – lewa kolumna szerzej, żeby calc się zmieścił
const style = `
<style id="a-brand-roi-final">
  #roi .roi-wrap{
    max-width:1180px;
    margin:0 auto;
    display:grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(320px, 0.6fr);
    gap:32px;
    align-items:flex-start;
  }
  #roi .roi-heading{grid-column:1/-1;margin-bottom:4px;}
  #roi .roi-card{max-width:none;width:100%;}
  @media(max-width:820px){
    #roi .roi-wrap{grid-template-columns:1fr;gap:20px;padding:0 16px;}
    #roi .roi-card{width:100%;}
  }
</style>
`;

// 3) JS: 1 kalkulator, 1 opis, 1 ROI = 320%
const script = `
<script id="a-brand-roi-final">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.getElementById('roi');
  if (!roi) return;

  // usuń drugi, malutki nagłówek z wnętrza boxa
  roi.querySelectorAll('#roi .roi-card *').forEach(function(el){
    var t = (el.textContent || '').trim();
    if (/^READY TO MEASURE/i.test(t)) {
      el.remove();
    }
  });

  // pobieramy pola
  var trafficEl = roi.querySelector('[name="traffic"], input[data-roi="traffic"]') || roi.querySelector('#traffic');
  var crEl      = roi.querySelector('[name="cr"], input[data-roi="cr"]') || roi.querySelector('#cr');
  var ltvEl     = roi.querySelector('[name="ltv"], input[data-roi="ltv"]') || roi.querySelector('#ltv');
  var invEl     = roi.querySelector('[name="investment"], input[data-roi="investment"]') || roi.querySelector('#investment');
  var ccyEl     = roi.querySelector('[name="ccy"]') || roi.querySelector('#ccy');
  var outEl     = roi.querySelector('.roi-result, .result, [data-roi="result"]') || roi.querySelector('.roi-card');

  function num(val, fallback){
    var n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  }

  function format(n){
    return n.toLocaleString('en-US');
  }

  function calc(){
    var traffic = trafficEl ? num(trafficEl.value, 0) : 0;
    var cr      = crEl ? num(crEl.value, 1.5) : 1.5;   // ale w tym modelu nie używamy cr do ROI
    var ltv     = ltvEl ? num(ltvEl.value, 800) : 800;
    var inv     = invEl ? num(invEl.value, 0) : 0;
    var ccy     = ccyEl ? ccyEl.value : 'EUR';

    // zasady:
    // - min investment 250 jeśli >0
    // - CPL stałe 20
    // - leads = inv / 20
    // - revenue = leads * ltv
    // - roi = ((revenue - inv)/inv)*100, ale max 320%
    if (inv > 0 && inv < 250) inv = 250;

    var cpl = 20;
    var leads = inv > 0 ? inv / cpl : 0;

    // jeśli user podał traffic wyższy niż leads, to po prostu pokażmy jego traffic jako est. leads
    if (traffic && traffic > leads) {
      leads = traffic * (cr/100) || leads;
    }

    var revenue = leads * ltv;
    var roi = 0;
    if (inv > 0) {
      roi = ((revenue - inv) / inv) * 100;
    }
    if (roi < 0) roi = 0;
    if (roi > 320) roi = 320; // tu ustalamy jedną wartość

    var monthly = revenue;

    if (outEl) {
      outEl.querySelectorAll('.roi-line-fixed').forEach(function(x){ x.remove(); });

      var info = document.createElement('div');
      info.className = 'roi-line-fixed';
      info.style.marginTop = '14px';
      info.style.fontSize = '13.5px';
      info.style.lineHeight = '1.5';

      info.innerHTML =
        'Est. monthly value: <strong>' + format(monthly) + ' ' + ccy + '</strong>' +
        ' • Est. ROI: <strong>' + roi.toFixed(1) + '%</strong>' +
        ' • Est. leads: <strong>' + Math.round(leads) + '</strong><br>' +
        '<span style="opacity:.75">Live calc: user traffic wins; budget fills gaps; ROI capped at 320%.</span><br>' +
        '<span style="opacity:.75">Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy + '</span>';

      outEl.appendChild(info);
    }

    if (invEl) invEl.value = inv ? inv : '';
  }

  var btn = roi.querySelector('#calc, #roi-btn, #calc-roi, button[type="submit"]');
  [trafficEl, crEl, ltvEl, invEl, ccyEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

// 4) wstrzykujemy przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', style + script + '\n</body>');
} else {
  html = html + '\n' + style + script + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI: jeden nagłówek, jeden calc, ROI max 320%, jeden cost-per-lead.');
