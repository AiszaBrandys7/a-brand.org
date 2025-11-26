const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wstrzykujemy nasz skrypt na sam koniec strony
const script = `
<script id="roi-final-logic">
document.addEventListener('DOMContentLoaded', function () {
  const wrap = document.querySelector('#roi, .roi-shell, [data-roi]');
  if (!wrap) return;

  const trafficEl = wrap.querySelector('[name="roi-traffic"], input[data-roi="traffic"], input[placeholder*="traffic"]') || wrap.querySelector('input[type="range"]');
  const crEl      = wrap.querySelector('[name="roi-cr"], input[data-roi="cr"]');
  const ltvEl     = wrap.querySelector('[name="roi-ltv"], input[data-roi="ltv"]');
  const ccyEl     = wrap.querySelector('select[data-roi="ccy"], select[name="roi-ccy"]');
  const invEl     = wrap.querySelector('[name="roi-invest"], input[data-roi="invest"], input[placeholder*="investment"]');
  const btn       = wrap.querySelector('button[data-roi="calc"], button[type="submit"], button');
  const outEl     = wrap.querySelector('.roi-out, .roi-result, p[data-roi="out"]');

  function num(v){
    if (!v) return 0;
    v = String(v).replace(/[^0-9.,]/g,'').replace(',','.');
    return parseFloat(v) || 0;
  }

  function fmt(n){
    return n.toLocaleString('en-US', {maximumFractionDigits:0});
  }

  function calc(){
    // wejścia
    let traffic = trafficEl ? num(trafficEl.value) : 0;
    let cr      = crEl ? num(crEl.value) : 1.5;
    let ltv     = ltvEl ? num(ltvEl.value) : 800;
    let ccy     = ccyEl ? ccyEl.value : 'EUR';
    let inv     = invEl ? num(invEl.value) : 0;

    // bezpieczne granice
    if (traffic < 0) traffic = 0;
    if (traffic > 30000) traffic = 30000;
    if (cr < 0) cr = 0;
    if (ltv <= 0) ltv = 800;

    // min / max investment
    const MIN_INV = 250;
    const MAX_INV = 20000;
    const usedInv = inv === 0 ? 0 : Math.min(Math.max(inv, MIN_INV), MAX_INV);

    // liczenie
    const leads   = traffic * (cr/100);
    const revenue = leads * ltv;

    // ROI
    let roi = 0;
    if (usedInv > 0) {
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > 320) roi = 320;
    }

    const cpl = leads > 0 && usedInv > 0 ? (usedInv / leads) : null;

    // wyświetlanie
    if (outEl){
      outEl.innerHTML =
        'Est. monthly value: ' + fmt(revenue) + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }

    // notatki pod spodem – znajdź wszystkie .roi-note w bloku i zrób z tego 2 linijki
    const notes = wrap.querySelectorAll('.roi-note');
    notes.forEach((n,i) => {
      if (i === 0) {
        let extra = '';
        if (cpl !== null) extra = ' Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy + '.';
        n.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.' + extra;
      } else {
        n.textContent = 'Values are directional only.';
      }
    });

    // podmień wartość w polu inwestycji na tę użytą (żeby 700000000 zamieniło się na 20000)
    if (invEl) invEl.value = usedInv ? usedInv : inv;
  }

  // zdarzenia
  [trafficEl, crEl, ltvEl, ccyEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

// usuń stare nasze skrypty, które się wstrzykiwały wiele razy
html = html.replace(/<script id="roi-final-logic">[\s\S]*?<\/script>/g, '');

// wstrzyknij na koniec
if (html.includes('</body>')){
  html = html.replace('</body>', script + '\n</body>');
} else {
  html += '\n' + script + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI logic fixed: min 250, max 20000, cap 320%, jeden tekst, czyste wyniki.');
