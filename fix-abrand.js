const fs = require('fs');

const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/* 1) wyrzuć stare nasze ROI-scripty, żeby nie dublowały linijek */
html = html.replace(/<script[^>]*data-roi="abrand"[^>]*>[\s\S]*?<\/script>/g, '');

/* 2) dolej CSS, który:
   - przywraca planetę na desktopie
   - chowa ją na telefonie
   - ujednolica odstępy między sekcjami
*/
const styleFix = `
<style id="abrand-fix-hero-and-spacing">
/* hero: planeta wraca na desktopie */
@media (min-width: 901px){
  .hero-visual{
    display:block !important;
    max-width:420px;
    margin-left:auto;
  }
}
/* mobile – jak chciałaś, harmonijkowo */
@media (max-width: 900px){
  .hero-visual{display:none !important;}
}
/* sekcje: bliżej na desktopie, trochę luźniej na telku */
main section,
section {
  padding: 50px 0 50px;
}
section + section {
  margin-top: 46px;
}
@media (max-width: 720px){
  main section,
  section {
    padding: 42px 0 48px;
  }
  section + section {
    margin-top: 34px;
  }
}
</style>
`;

if (!html.includes('abrand-fix-hero-and-spacing')) {
  // spróbuj wstrzyknąć przed </head>, a jak nie ma, to na początek body
  if (html.includes('</head>')) {
    html = html.replace('</head>', styleFix + '\n</head>');
  } else {
    html = styleFix + '\n' + html;
  }
}

/* 3) nowy, JEDEN kalkulator ROI – live, z capami, bez podwójnego "Est. cost per lead" */
const roiScript = `
<script data-roi="abrand">
document.addEventListener('DOMContentLoaded', function () {
  const trafficEl = document.getElementById('traffic');
  const crEl      = document.getElementById('cr');
  const ltvEl     = document.getElementById('ltv');
  const invEl     = document.getElementById('cost');
  const ccyEl     = document.getElementById('ccy');
  const outEl     = document.getElementById('roi-out');

  function calc(){
    const userTraffic = Number(trafficEl && trafficEl.value ? trafficEl.value : 0);
    const cr  = Number(crEl && crEl.value ? crEl.value : 1.5);
    let   ltv = Number(ltvEl && ltvEl.value ? ltvEl.value : 800);
    let   inv = Number(invEl && invEl.value ? invEl.value : 0);
    const ccy = ccyEl && ccyEl.value ? ccyEl.value : 'EUR';

    const MIN_INV     = 250;
    const MAX_LTV     = 5000;
    const MAX_TRAFFIC = 30000;

    if (ltv > MAX_LTV) ltv = MAX_LTV;

    let usedInv = 0;
    let budgetTraffic = 800;

    if (inv > 0) {
      usedInv = Math.max(inv, MIN_INV);
      budgetTraffic = 1000 + usedInv * 0.6;
      if (budgetTraffic > MAX_TRAFFIC) budgetTraffic = MAX_TRAFFIC;
    }

    let finalTraffic = userTraffic > 0 ? Math.min(userTraffic, MAX_TRAFFIC) : budgetTraffic;

    const leads   = finalTraffic * (cr / 100);
    const revenue = leads * ltv;

    let roi = 0;
    if (usedInv > 0) {
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;

      // tiered caps – to jest ta „realistyczność”
      let roiCap = 420;
      if (usedInv >= 1000) roiCap = 320;
      if (usedInv >= 5000) roiCap = 180;
      if (roi > roiCap) roi = roiCap;
    }

    let cpl = null;
    if (usedInv > 0 && leads > 0) {
      cpl = usedInv / leads;
    }

    if (outEl) {
      outEl.textContent =
        'Est. monthly value: ' + revenue.toLocaleString('en-US') + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + (leads || 0).toFixed(0);

      // 1 notka
      let note = document.getElementById('roi-note');
      if (!note) {
        note = document.createElement('p');
        note.id = 'roi-note';
        note.style.fontSize = '.7rem';
        note.style.opacity  = '.58';
        outEl.parentElement && outEl.parentElement.appendChild(note);
      }
      note.textContent = 'ROI capped by investment tier. User traffic respected. LTV & traffic safety caps on.';

      // 1 linijka CPL
      let cplLine = document.getElementById('roi-cpl');
      if (!cplLine) {
        cplLine = document.createElement('p');
        cplLine.id = 'roi-cpl';
        cplLine.style.fontSize = '.7rem';
        cplLine.style.opacity  = '.5';
        outEl.parentElement && outEl.parentElement.appendChild(cplLine);
      }
      cplLine.textContent = cpl ? ('Est. cost per lead: ' + cpl.toFixed(2) + ' ' + ccy) : '';
    }
  }

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

if (html.includes('</body>')) {
  html = html.replace('</body>', roiScript + '\n</body>');
} else {
  html = html + '\n' + roiScript;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Planetka przywrócona CSS-em, odstępy wygładzone, kalkulator jeden i grzeczny.');
