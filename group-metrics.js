const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1. znajdź sekcje
const roiStart = html.indexOf('<section id="roi"');
const contactStart = html.indexOf('<section id="contact"');

if (roiStart === -1 || contactStart === -1) {
  console.log('⚠️ Nie znalazłem <section id="roi"> albo <section id="contact"> – nic nie zmieniam.');
  process.exit(0);
}

// wyciągnij kawałki
const roiEnd = html.indexOf('</section>', roiStart) + '</section>'.length;
const contactEnd = html.indexOf('</section>', contactStart) + '</section>'.length;

const roiSection = html.slice(roiStart, roiEnd);
const contactSection = html.slice(contactStart, contactEnd);

// złożymy nowy blok
const grouped = `
<section id="metrics-block" class="metrics-block">
  <div class="metrics-grid">
    <div class="metrics-col metrics-roi">
      ${roiSection}
    </div>
    <div class="metrics-col metrics-contact">
      ${contactSection}
    </div>
  </div>
</section>
`;

// podmieniamy stary układ na nowy (usuwamy stare pojedyncze roi/contact)
let before = html.slice(0, roiStart);
let after = html.slice(contactEnd);

html = before + grouped + after;

// 2. dopisujemy CSS na końcu <head>
const css = `
<style id="metrics-pair">
.metrics-block{max-width:1180px;margin:0 auto;padding:40px 16px 44px;}
.metrics-grid{display:grid;grid-template-columns:1.05fr .75fr;gap:26px;align-items:flex-start;}
.metrics-col section{padding:0;margin:0;}
.metrics-col section + section{margin-top:0;}
/* żeby formularz się nie rozciągał */
.metrics-contact form{background:rgba(6,9,14,.35);}
@media (max-width: 980px){
  .metrics-grid{grid-template-columns:1fr;gap:18px;}
  .metrics-block{padding:32px 14px 38px;}
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI i Contact spięte w jeden blok (desktop obok siebie, mobile pod sobą).');
