const fs = require('fs');

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

// usuń stare nasze wstrzyknięte skrypty z poprzednich prób
html = html.replace(/<script[^>]*data-roi[^>]*>[\s\S]*?<\/script>/g, '');

// nowy, uporządkowany kalkulator
const roiScript = `
<script data-roi="abrand">
document.addEventListener('DOMContentLoaded', function () {
  const trafficEl = document.getElementById('traffic');
  const crEl      = document.getElementById('cr');
  const ltvEl     = document.getElementById('ltv');
  const invEl     = document.getElementById('cost');
  const ccyEl     = document.getElementById('ccy');
  const outEl     = document.getElementById('roi-out');

  function calc() {
    // 1. wejścia
    const userTraffic = Number(trafficEl && trafficEl.value ? trafficEl.value : 0);
    const cr          = Number(crEl && crEl.value ? crEl.value : 1.5);
    let   ltv         = Number(ltvEl && ltvEl.value ? ltvEl.value : 800);
    let   inv         = Number(invEl && invEl.value ? invEl.value : 0);
    const ccy         = ccyEl && ccyEl.value ? ccyEl.value : 'EUR';

    // 2. safety caps
    const MIN_INV     = 250;
    const MAX_LTV     = 5000;
    const MAX_TRAFFIC = 30000;

    if (ltv > MAX_LTV) ltv = MAX_LTV;

    // 3. budżetowy traffic
    let budgetTraffic = 0;
    let usedInv = 0;

    if (inv > 0) {
      usedInv = Math.max(inv, MIN_INV);
      budgetTraffic = 1000 + usedInv * 0.6;
      if (budgetTraffic > MAX_TRAFFIC) budgetTraffic = MAX_TRAFFIC;
    } else {
      // brak inwestycji → symboliczny ruch
      budgetTraffic = 800;
    }

    // 4. jeśli user podał traffic ręcznie → szanujemy, ale nie pozwalamy na kosmos
    let finalTraffic = userTraffic > 0 ? Math.min(userTraffic, MAX_TRAFFIC) : budgetTraffic;

    // 5. liczymy
    const leads   = finalTraffic * (cr / 100);
    const revenue = leads * ltv;

    // 6. tiered ROI cap wg inwestycji
    let roi = 0;
    if (usedInv > 0) {
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;

      let roiCap = 420;          // małe budżety mogą marzyć
      if (usedInv >= 1000) roiCap = 320;   // średnie bardziej realne
      if (usedInv >= 5000) roiCap = 180;   // duże – najbardziej przyziemne

      if (roi > roiCap) roi = roiCap;
    }

    // 7. CPL
    let cpl = null;
    if (usedInv > 0 && leads > 0) {
      cpl = usedInv / leads;
    }

    // 8. wypisz
    if (outEl) {
      const parts = [];
      parts.push('Est. monthly value: ' + revenue.toLocaleString('en-US') + ' ' + ccy);
      parts.push('Est. ROI: ' + roi.toFixed(1) + '%');
      parts.push('Est. leads: ' + (leads || 0).toFixed(0));
      outEl.textContent = parts.join(' • ');

      // dodatkowa linijka pod spodem
      let note = document.getElementById('roi-note');
      if (!note) {
        note = document.createElement('p');
        note.id = 'roi-note';
        note.style.fontSize = '.7rem';
        note.style.opacity = '.6';
        outEl.parentElement && outEl.parentElement.appendChild(note);
      }
      note.textContent = 'ROI capped by investment tier. User traffic respected. LTV & traffic safety caps on.';

      let cplLine = document.getElementById('roi-cpl');
      if (!cplLine) {
        cplLine = document.createElement('p');
        cplLine.id = 'roi-cpl';
        cplLine.style.fontSize = '.7rem';
        cplLine.style.opacity = '.5';
        outEl.parentElement && outEl.parentElement.appendChild(cplLine);
      }
      cplLine.textContent = cpl ? ('Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy) : '';
    }
  }

  // live
  [trafficEl, crEl, ltvEl, invEl, ccyEl].forEach(function (el) {
    if (el) el.addEventListener('input', calc);
  });

  const btn = document.querySelector('#calc, #roi-btn, #calc-roi, form button[type="submit"]');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      calc();
    });
  }

  calc();
});
</script>
`;

// wstrzykujemy tuż przed </body>
if (html.includes('</body>')) {
  html = html.replace('</body>', roiScript + '\n</body>');
} else {
  html = html + '\n' + roiScript + '\n';
}

fs.writeFileSync(path, html, 'utf8');
console.log('✅ ROI script z tierami wstrzyknięty.');
