const fs = require('fs');

// ---------- 1. HARD TEST ROI ----------
function calcROI({ traffic = 0, cr = 1.5, ltv = 200, cost = 0 }) {
  // to jest wersja jak na stronie: user traffic > budżetowy -> szanujemy usera
  const baseTraffic = 1200;        // minimalny sensowny ruch
  const trafficPerEuro = 2.4;      // ile ruchu daje 1 EUR
  const maxTraffic = 18000;        // sufit
  const budgetTraffic = Math.min(baseTraffic + cost * trafficPerEuro, maxTraffic);
  const finalTraffic = Math.max(traffic, budgetTraffic); // bierzemy większe z tych dwóch

  const conv = finalTraffic * (cr / 100);
  const revenue = conv * ltv;
  let rawRoi = cost ? ((revenue - cost) / cost) * 100 : 0;
  const roi = Math.min(rawRoi, 320); // cap tak jak teraz na stronie
  const cpl = conv ? cost / conv : null;

  return { finalTraffic, conv, revenue, roi, cpl, cost };
}

const roiTests = [
  { name: 'A) cost = 0 (powinno być ROI = 0)', data: { cost: 0, traffic: 4000, cr: 1.5, ltv: 200 } },
  { name: 'B) cost = 1 EUR',                    data: { cost: 1, cr: 1.5, ltv: 200 } },
  { name: 'C) cost = 10 EUR',                   data: { cost: 10, cr: 1.5, ltv: 200 } },
  { name: 'D) cost = 100 EUR',                  data: { cost: 100, cr: 1.5, ltv: 200 } },
  { name: 'E) cost = 800 EUR (uwaga taty)',     data: { cost: 800, cr: 1.5, ltv: 200 } },
  { name: 'F) cost = 3000 EUR (Twój case)',     data: { cost: 3000, cr: 1.5, ltv: 200 } },
  { name: 'G) cost = 10000 EUR',                data: { cost: 10000, cr: 1.5, ltv: 200 } },
];

let out = [];
out.push('=== HARD TEST: ROI CALCULATOR ===');
roiTests.forEach(t => {
  const r = calcROI(t.data);
  out.push(`\n${t.name}`);
  out.push(`  cost:           ${r.cost} €`);
  out.push(`  traffic(final): ${Math.round(r.finalTraffic)}`);
  out.push(`  revenue:        ${Math.round(r.revenue)} €`);
  out.push(`  ROI:            ${r.roi.toFixed(1)}% ${r.roi >= 320 ? '(CAP hit)' : ''}`);
  out.push(`  CPL:            ${r.cpl ? r.cpl.toFixed(2) + ' €' : '-'}`);
});

// ---------- 2. SEO / HTML CHECK ----------
out.push('\n=== SEO / HTML DIAG ===');
const idxPath = 'index.html';
if (!fs.existsSync(idxPath)) {
  out.push('index.html: NIE ZNALEZIONO 😱');
} else {
  const html = fs.readFileSync(idxPath, 'utf8');

  const hasTitle = /<title>[^<]+<\/title>/i.test(html);
  const hasDesc = /<meta[^>]+name=["']description["'][^>]+>/i.test(html);
  const hasH1 = /<h1[^>]*>[\s\S]*?<\/h1>/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html);
  const hasOgImg = /<meta[^>]+property=["']og:image["'][^>]+>/i.test(html);
  const hasOgTitle = /<meta[^>]+property=["']og:title["'][^>]+>/i.test(html);
  const hasOgDesc = /<meta[^>]+property=["']og:description["'][^>]+>/i.test(html);
  const hasFavicon = /<link[^>]+rel=["']icon["'][^>]*>/i.test(html) || /favicon-a\.svg/.test(html);

  out.push(`title:        ${hasTitle ? 'OK' : 'BRAK'}`);
  out.push(`description:   ${hasDesc ? 'OK' : 'BRAK'}`);
  out.push(`h1:            ${hasH1 ? 'OK' : 'BRAK'}`);
  out.push(`canonical:     ${hasCanonical ? 'OK' : 'BRAK'}`);
  out.push(`og:image:      ${hasOgImg ? 'OK' : 'BRAK'}`);
  out.push(`og:title:      ${hasOgTitle ? 'OK' : 'BRAK'}`);
  out.push(`og:description:${hasOgDesc ? 'OK' : 'BRAK'}`);
  out.push(`favicon:       ${hasFavicon ? 'OK' : 'BRAK'}`);

  // szukamy obrazków bez alt
  const imgRegex = /<img[^>]*>/gi;
  const imgs = html.match(imgRegex) || [];
  const imgsNoAlt = imgs.filter(i => !/alt=/.test(i));
  if (imgsNoAlt.length) {
    out.push(`images without alt: ${imgsNoAlt.length} ⚠️`);
  } else {
    out.push('images without alt: 0 ✅');
  }
}

// sprawdź sitemap + robots
out.push('\n=== FILES ===');
out.push(`sitemap.xml: ${fs.existsSync('sitemap.xml') ? 'OK' : 'BRAK'}`);
out.push(`robots.txt:  ${fs.existsSync('robots.txt') ? 'OK' : 'BRAK'}`);

// zapisz
fs.writeFileSync('audit-report.txt', out.join('\n'), 'utf8');
console.log(out.join('\n'));
