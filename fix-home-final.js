const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/* 1) super-ostateczny CSS na końcu: planeta ma być na desktopie, kropka */
const css = `
<style id="home-planet-final" data-lock="true">
/* hero always 2-col on desktop */
@media (min-width: 901px){
  .hero, section#hero{
    display:grid;
    grid-template-columns:minmax(0,1.05fr) minmax(280px,0.95fr);
    gap:32px;
    align-items:center;
  }
  .hero .hero-visual,
  section#hero .hero-visual{
    display:flex !important;
    justify-content:flex-end;
    max-width:360px;
    margin-left:auto;
  }
}
/* mobile – możesz ją mieć, ale jak chcesz schować: */
@media (max-width: 900px){
  .hero .hero-visual,
  section#hero .hero-visual{
    display:none !important;
  }
}

/* 2) przerwa między case studies a ROI – na sztywno */
#cases { margin-bottom: 26px !important; }
#roi, section#roi { margin-top: 0 !important; }

/* 3) padding w kartach ROI/contact, żeby nie dotykało krawędzi */
#roi .roi-calc,
#roi .roi-contact{
  padding:18px 16px 20px !important;
  border-radius:18px !important;
}
#roi .roi-input,
#roi textarea.roi-input{
  padding:10px 12px !important;
  border-radius:12px !important;
}

/* 4) żeby cały main nie robił kolejnych wysokich sekcji */
main > section { padding-top: 54px; padding-bottom: 52px; }
</style>
`;

/* wstrzyknij CSS tuż przed </head> */
if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

/* 2) ostateczny JS dla ROI – 1 notka, CAP=320, brak duplikatów */
const js = `
<script id="roi-hard-final">
document.addEventListener('DOMContentLoaded', function(){
  var wrap = document.querySelector('#roi');
  if (!wrap) return;

  var trafficEl = wrap.querySelector('#roi-traffic');
  var crEl      = wrap.querySelector('#roi-cr');
  var ltvEl     = wrap.querySelector('#roi-ltv');
  var invEl     = wrap.querySelector('#roi-inv');
  var ccyEl     = wrap.querySelector('#roi-ccy');
  var outEl     = wrap.querySelector('#roi-out');
  var btn       = wrap.querySelector('#roi-btn');

  function num(v, d){
    var n = parseFloat((v||'').toString().replace(/[^0-9.,-]/g,'').replace(',','.'));
    return isNaN(n) ? (d||0) : n;
  }

  function calc(){
    var traffic = num(trafficEl && trafficEl.value, 0);
    var cr      = num(crEl && crEl.value, 1.5);
    var ltv     = num(ltvEl && ltvEl.value, 800);
    var inv     = num(invEl && invEl.value, 0);
    var ccy     = ccyEl ? ccyEl.value : 'EUR';

    if (traffic <= 0) traffic = 800;       // soft baseline
    if (traffic > 30000) traffic = 30000;
    if (cr < 0) cr = 0;
    if (cr > 15) cr = 15;
    if (ltv <= 0) ltv = 800;
    if (ltv > 5000) ltv = 5000;

    // inwestycja – jeśli user wpisał 0, to ROI będzie 0 i CPL nie pokazujemy
    var usedInv = inv;
    if (inv > 0 && inv < 250) usedInv = 250;
    if (inv > 20000) usedInv = 20000;

    var leads   = traffic * (cr/100);
    var revenue = leads * ltv;

    var roi = 0;
    if (usedInv > 0){
      roi = ((revenue - usedInv) / usedInv) * 100;
      if (roi < 0) roi = 0;
      if (roi > 320) {
        roi = 320;
        revenue = usedInv * 3.2; // tak żeby ROI=320% było prawdziwe
      }
    }

    if (outEl){
      outEl.textContent =
        'Est. monthly value: ' + Math.round(revenue).toLocaleString('en-US') + ' ' + ccy +
        ' • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }

    // usuń wszystkie duplikaty notek i zostaw jedną
    wrap.querySelectorAll('.roi-note, .roi-footnotes, .roi-footnote-single, .roi-cpl, .small').forEach(function(el){ el.remove(); });

    var note = document.createElement('p');
    note.className = 'roi-note';
    note.style.fontSize = '.68rem';
    note.style.opacity = '.58';
    note.style.marginTop = '6px';
    note.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.';
    outEl && outEl.parentNode && outEl.parentNode.appendChild(note);

    if (usedInv > 0 && leads > 0){
      var cpl = document.createElement('p');
      cpl.className = 'roi-note';
      cpl.style.fontSize = '.68rem';
      cpl.style.opacity = '.5';
      cpl.textContent = 'Est. cost per lead: ' + (usedInv / leads).toFixed(2) + ' ' + ccy;
      note.parentNode.appendChild(cpl);
    }

    // podbij z powrotem przycięte wartości
    if (trafficEl) trafficEl.value = traffic;
    if (crEl)      crEl.value      = cr;
    if (ltvEl)     ltvEl.value     = ltv;
    if (invEl)     invEl.value     = inv;
  }

  [trafficEl, crEl, ltvEl, invEl, ccyEl].forEach(function(el){
    if (el) el.addEventListener('input', calc);
  });
  if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); calc(); });

  calc();
});
</script>
`;

if (html.includes('</body>')) {
  html = html.replace('</body>', js + '\n</body>');
} else {
  html = html + '\n' + js;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ homepage: planeta zablokowana na desktopie, case→ROI bez dziury, ROI=320% z jedną notką.');
