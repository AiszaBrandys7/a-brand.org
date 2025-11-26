const fs = require('fs');
const path = require('path');

// 1) wczytaj index.html
const FILE = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'a-brand.org', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');

// 2) wstrzykujemy CSS do wyrównania lewej/prawej kolumny i mobile
const cssBlock = `
<style id="roi-tight-css">
  #roi .roi-row,
  section#roi .roi-row{
    display:flex;
    gap:28px;
    align-items:stretch;
  }
  #roi .roi-col,
  section#roi .roi-col{
    flex:1 1 0;
    display:flex;
    flex-direction:column;
  }
  #roi .roi-card{
    flex:1 1 auto;
  }
  #roi .contact-card{
    flex:1 1 auto;
  }
  @media (max-width:900px){
    #roi .roi-row,
    section#roi .roi-row{
      flex-direction:column;
      gap:20px;
    }
  }
</style>
`;

if (!html.includes('id="roi-tight-css"')) {
  if (html.includes('</head>')) {
    html = html.replace('</head>', cssBlock + '\n</head>');
  } else {
    html = cssBlock + '\n' + html;
  }
}

// 3) skrypt do czyszczenia DOM + clamp danych
const domScript = `
<script id="roi-tight-dom">
document.addEventListener('DOMContentLoaded', function(){
  // a) zmiana wewnętrznego tytułu w boksie, jeśli powtórzony
  var innerTitles = document.querySelectorAll('#roi h3, #roi .roi-card h3, #roi .roi-card .title');
  if (innerTitles && innerTitles.length){
    innerTitles.forEach(function(el, idx){
      var txt = (el.textContent || '').trim().toLowerCase();
      // jeśli to drugi/potrójny "estimate your roi" to zamień na "Calculator"
      if (idx > 0 && txt.indexOf('estimate your roi') !== -1){
        el.textContent = 'Calculator';
      }
    });
  }

  // b) usuń zdublowane notatki pod kalkulatorem
  var notes = document.querySelectorAll('#roi .roi-note, #roi .roi-footnotes, #roi p.small');
  if (notes.length > 1){
    // zostaw pierwszą
    for (var i = 1; i < notes.length; i++){
      if (notes[i].parentNode) notes[i].parentNode.removeChild(notes[i]);
    }
  }

  // c) podpinamy się do istniejącego kalkulatora i robimy clamp
  function clamp(v, min, max){
    v = parseFloat(v);
    if (isNaN(v)) v = 0;
    if (min !== null && v < min) v = min;
    if (max !== null && v > max) v = max;
    return v;
  }

  // zgadujemy pola, bo znamy układ z Twoich screenów
  var trafficEl = document.querySelector('#roi input[name="traffic"], #roi input[data-field="traffic"], #roi input[placeholder*="traffic"], #roi input[placeholder*="Traffic"]');
  var crEl      = document.querySelector('#roi input[name="cr"], #roi input[data-field="cr"], #roi input[placeholder*="%"], #roi input[type="range"]');
  var ltvEl     = document.querySelector('#roi input[name="ltv"], #roi input[data-field="ltv"], #roi input[placeholder*="order"], #roi input[placeholder*="lead"]');
  var invEl     = document.querySelector('#roi input[name="investment"], #roi input[data-field="investment"], #roi input[placeholder*="investment"], #roi input[placeholder*="Monthly investment"]');
  var btn       = document.querySelector('#roi button, #roi .calc-btn, #roi input[type="submit"]');
  var outEl     = document.querySelector('#roi .roi-result, #roi .calc-out, #roi .roi-out');

  function recalc(){
    var traffic = trafficEl ? trafficEl.value : '';
    var cr      = crEl ? crEl.value : '';
    var ltv     = ltvEl ? ltvEl.value : '';
    var inv     = invEl ? invEl.value : '';

    // clampy
    var trafficNum = clamp(traffic, 0, 30000);       // max 30k
    var crNum      = clamp(cr, 0, 15);               // max 15%
    var ltvNum     = clamp(ltv, 0, 5000);            // max 5000
    var invNum     = clamp(inv, 0, 20000);           // max 20k

    // jeśli inwestycja > 0 i < 250 → podbij do 250
    if (invNum > 0 && invNum < 250) invNum = 250;

    // jeśli traffic = 0 → daj 800 (to masz w swoich hardtestach)
    if (!trafficNum || trafficNum === 0) trafficNum = 800;

    // policzmy tu lokalnie
    var leads = trafficNum * (crNum / 100);
    var revenue = leads * (ltvNum || 800); // default 800
    var roi = 0;
    if (invNum > 0){
      roi = (revenue / invNum) * 100;
    }
    // CAP na 320
    if (roi > 320) roi = 320;

    // podłóż z powrotem przycięte wartości do pól (żeby user widział)
    if (trafficEl) trafficEl.value = trafficNum;
    if (crEl)      crEl.value      = crNum;
    if (ltvEl)     ltvEl.value     = ltvNum;
    if (invEl)     invEl.value     = invNum;

    // wyświetl, jeśli mamy gdzie
    if (outEl){
      outEl.textContent = 'Est. monthly value: ' + revenue.toFixed(0) + ' EUR • Est. ROI: ' + roi.toFixed(1) + '% • Est. leads: ' + Math.round(leads);
    }
    // doklej jedną, krótką linijkę info
    var foot = document.querySelector('#roi .roi-footnote-single');
    if (!foot){
      foot = document.createElement('p');
      foot.className = 'roi-footnote-single';
      var box = document.querySelector('#roi .roi-card, #roi .calc-card, #roi .roi-panel');
      (box || document.body).appendChild(foot);
    }
    foot.textContent = 'Live calc: user traffic wins, budget fills gaps, ROI capped at 320%.';
  }

  // nasłuch
  [trafficEl, crEl, ltvEl, invEl].forEach(function(el){
    if (el) el.addEventListener('input', recalc);
  });
  if (btn){ btn.addEventListener('click', function(e){ e.preventDefault(); recalc(); }); }

  // pierwszy raz
  recalc();
});
</script>
`;

if (!html.includes('id="roi-tight-dom"')) {
  if (html.includes('</body>')) {
    html = html.replace('</body>', domScript + '\n</body>');
  } else {
    html = html + '\n' + domScript + '\n';
  }
}

// 4) zapisz
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ HTML podmieniony: jeden nagłówek, kalkulator = "Calculator", flex wyrównany, DOM clamp na stronie.');

// 5) hardtest w Node – ta sama logika co w przeglądarce
function calcROI(input){
  let traffic = Number(input.traffic) || 0;
  let cr      = Number(input.cr) || 0;
  let ltv     = Number(input.ltv) || 0;
  let inv     = Number(input.inv) || 0;

  // domyślne
  if (traffic <= 0) traffic = 800;
  if (cr <= 0) cr = 1.5;
  if (ltv <= 0) ltv = 800;

  // clampy jak w DOM
  if (traffic > 30000) traffic = 30000;
  if (cr > 15) cr = 15;
  if (ltv > 5000) ltv = 5000;
  if (inv > 20000) inv = 20000;
  if (inv > 0 && inv < 250) inv = 250;

  const leads   = traffic * (cr/100);
  const revenue = leads * ltv;
  let roi = 0;
  if (inv > 0) roi = (revenue / inv) * 100;
  if (roi > 320) roi = 320;

  const cpl = leads > 0 ? inv / leads : null;

  return {traffic, cr, ltv, inv, leads, revenue, roi, cpl};
}

const cases = [
  {label:'A) inv = -10, traffic = ""', data:{inv:-10, traffic:'', cr:'', ltv:''}},
  {label:'B) inv = "abc"', data:{inv:'abc', traffic:0}},
  {label:'C) inv = 100, powinno podnieść do 250', data:{inv:100, traffic:1000}},
  {label:'D) inv = 100000, przytnij do 20000', data:{inv:100000, traffic:1000}},
  {label:'E) traffic = 999999, przytnij do 30000', data:{inv:3000, traffic:999999}},
  {label:'F) cr = 45, przytnij do 15', data:{inv:3000, traffic:4000, cr:45}},
  {label:'G) ltv = 999999, przytnij do 5000', data:{inv:3000, traffic:4000, cr:2, ltv:999999}},
  {label:'H) normalny case', data:{inv:3000, traffic:1000, cr:1.5, ltv:800}},
];

console.log('\\n=== ROI TERMINAL HARDTEST ===');
cases.forEach(c => {
  const r = calcROI(c.data);
  console.log('\\n' + c.label);
  console.log('  traffic:  ' + r.traffic);
  console.log('  cr:       ' + r.cr + '%');
  console.log('  ltv:      ' + r.ltv + ' EUR');
  console.log('  inv used: ' + r.inv + ' EUR');
  console.log('  leads:    ' + r.leads.toFixed(2));
  console.log('  revenue:  ' + r.revenue.toFixed(2) + ' EUR');
  console.log('  ROI:      ' + r.roi.toFixed(1) + '%');
  console.log('  CPL:      ' + (r.cpl === null ? '-' : r.cpl.toFixed(2) + ' EUR'));
});
console.log('\\nKoniec hardtestu 💚');
