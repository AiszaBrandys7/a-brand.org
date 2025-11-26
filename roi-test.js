// symulacja tego co masz w index.html
function calcROI({ userTraffic = 0, cr = 1.5, ltv = 500, cost = 1000, ccy = 'EUR' }) {
  const crDec = cr / 100;

  // to samo co wklejaliśmy na stronę:
  const budgetTraffic = cost > 0
    ? Math.min(18000, 900 + cost * 2.1)
    : userTraffic;

  const finalTraffic =
    userTraffic && userTraffic < budgetTraffic
      ? userTraffic
      : budgetTraffic;

  const leads   = finalTraffic * crDec;
  const revenue = leads * ltv;

  let roi = 0;
  if (cost > 0) {
    roi = ((revenue - cost) / cost) * 100;
    roi = Math.min(roi, 320); // cap jak na stronie
  }

  const cpl = leads > 0 ? cost / leads : null;

  return {
    userTraffic,
    finalTraffic,
    cr,
    ltv,
    cost,
    revenue,
    roi: Number(roi.toFixed(1)),
    cpl: cpl ? Number(cpl.toFixed(2)) : null,
    ccy,
  };
}

// zestaw testów “brutalnych”
const tests = [
  { name: '1) zero cost → użyj userTraffic', data: { userTraffic: 4000, cr: 1.5, ltv: 500, cost: 0 } },
  { name: '2) bardzo mały budżet', data: { userTraffic: 0, cr: 1.5, ltv: 500, cost: 50 } },
  { name: '3) typowy mały budżet', data: { userTraffic: 0, cr: 1.5, ltv: 500, cost: 500 } },
  { name: '4) twój case ~3000', data: { userTraffic: 0, cr: 1.5, ltv: 500, cost: 3000 } },
  { name: '5) wysoki budżet 10k', data: { userTraffic: 0, cr: 1.5, ltv: 500, cost: 10000 } },
  { name: '6) user wpisuje większy ruch niż budżet wylicza', data: { userTraffic: 20000, cr: 1.5, ltv: 500, cost: 2000 } },
  { name: '7) user wpisuje mniejszy ruch niż budżet → szanuj usera', data: { userTraffic: 1500, cr: 2.5, ltv: 400, cost: 2000 } },
  { name: '8) niska konwersja 0.5%', data: { userTraffic: 0, cr: 0.5, ltv: 500, cost: 2000 } },
  { name: '9) wysoka wartość leada', data: { userTraffic: 0, cr: 1.5, ltv: 1500, cost: 3000 } },
];

// dorzucamy trochę losowych, żeby zobaczyć czy coś nie wyskakuje
for (let i = 0; i < 8; i++) {
  const randCost = Math.floor(Math.random() * 12000);
  const randCR   = (Math.random() * 4 + 0.3).toFixed(2); // 0.3% – 4.3%
  const randLTV  = Math.floor(Math.random() * 1800) + 200;
  tests.push({
    name: `RANDOM ${i+1} (cost=${randCost})`,
    data: { userTraffic: 0, cr: Number(randCR), ltv: randLTV, cost: randCost }
  });
}

console.log('--- ROI brutal test ---\n');
tests.forEach(t => {
  const r = calcROI(t.data);
  console.log(t.name);
  console.log(`  cost:           ${r.cost}`);
  console.log(`  traffic(final): ${r.finalTraffic}`);
  console.log(`  conv.rate:      ${r.cr}%`);
  console.log(`  revenue:        ${r.revenue.toLocaleString()} ${r.ccy}`);
  console.log(`  ROI:            ${r.roi}%  ${r.roi >= 320 ? '(CAP hit)' : ''}`);
  console.log(`  CPL:            ${r.cpl !== null ? r.cpl + ' ' + r.ccy : '-'}`);
  console.log('');
});
