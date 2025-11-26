// roi-hardtest.js
// testuje tę samą logikę co masz na stronie: min 250, max 20000, cap 320%

function calcROI(input){
  function num(v){
    if (v === undefined || v === null) return 0;
    v = String(v).replace(/[^0-9.,]/g,'').replace(',','.');
    return parseFloat(v) || 0;
  }

  let traffic = num(input.traffic);
  let cr      = input.cr !== undefined ? num(input.cr) : 1.5;
  let ltv     = input.ltv !== undefined ? num(input.ltv) : 800;
  let inv     = num(input.inv);
  let ccy     = input.ccy || 'EUR';

  // safety takie jak na stronie
  if (traffic < 0) traffic = 0;
  if (traffic > 30000) traffic = 30000;
  if (cr < 0) cr = 0;
  if (ltv <= 0) ltv = 800;

  const MIN_INV = 250;
  const MAX_INV = 20000;
  const usedInv = inv === 0 ? 0 : Math.min(Math.max(inv, MIN_INV), MAX_INV);

  const leads   = traffic * (cr/100);
  const revenue = leads * ltv;

  let roi = 0;
  if (usedInv > 0){
    roi = ((revenue - usedInv) / usedInv) * 100;
    if (roi < 0) roi = 0;
    if (roi > 320) roi = 320;
  }

  const cpl = leads > 0 && usedInv > 0 ? (usedInv / leads) : null;

  return {
    usedInv,
    traffic,
    cr,
    ltv,
    leads,
    revenue,
    roi,
    cpl,
    ccy
  };
}

const cases = [
  {label:'A) puste / zera', data:{traffic:0, inv:0}},
  {label:'B) 1€ (powinno podnieść do 250)', data:{traffic:850, inv:1}},
  {label:'C) 80€ (poniżej progu)', data:{traffic:1200, inv:80}},
  {label:'D) dokładnie 250€', data:{traffic:1200, inv:250}},
  {label:'E) normalny case 3000€', data:{traffic:3000, inv:3000, cr:1.5, ltv:800}},
  {label:'F) duży budżet 50000€ (powinno ściąć do 20000)', data:{traffic:9000, inv:50000}},
  {label:'G) user wpisał pierdoły "7o9o9999"', data:{traffic:'1000', inv:'7o9o9999', cr:'1,5', ltv:'800'}},
  {label:'H) bardzo słaby CR 0.3%', data:{traffic:4000, inv:3000, cr:0.3}},
  {label:'I) bardzo wysoki LTV 99999', data:{traffic:2000, inv:3000, ltv:99999}},
  {label:'J) user traffic 50000 (powinno ściąć do 30000)', data:{traffic:50000, inv:3000}},
  {label:'K) investment = 0 ale jest traffic', data:{traffic:5000, inv:0, cr:2, ltv:600}},
  {label:'L) ujemne wartości (powinno się znormalizować)', data:{traffic:-100, inv:-300, cr:-2}}
];

console.log('=== A-BRAND ROI HARDTEST (LOCAL) ===');
cases.forEach(function(c){
  const r = calcROI(c.data);
  console.log('\n' + c.label);
  console.log('  inv użyty:     ' + r.usedInv);
  console.log('  traffic final: ' + r.traffic);
  console.log('  leads:         ' + r.leads.toFixed(2));
  console.log('  revenue:       ' + r.revenue.toFixed(2) + ' ' + r.ccy);
  console.log('  ROI:           ' + r.roi.toFixed(1) + '%');
  console.log('  CPL:           ' + (r.cpl === null ? '-' : r.cpl.toFixed(2) + ' ' + r.ccy));
});
console.log('\nKoniec hardtestu 💚');
