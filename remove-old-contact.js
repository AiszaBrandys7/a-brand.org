const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal stary, pierwszy kontakt (ten, co siedzi samodzielnie nad ROI)
const contactRe = /<section[^>]*id="contact"[^>]*>[\s\S]*?<\/section>/i;
if (contactRe.test(html)) {
  html = html.replace(contactRe, '');
  console.log('🗑  Stary <section id="contact"> usunięty.');
} else {
  console.log('ℹ️  Nie znalazłem osobnego <section id="contact"> – nic nie usuwam.');
}

// 2) dopnij mały CSS, żeby ROI podjechało wyżej i kolumny były równe
const fixCss = `
<style id="roi-tighten">
  #roi.roi-shell{padding-top:32px;}
  @media (max-width:900px){
    #roi.roi-shell{padding-top:26px;}
  }
</style>
`;

if (html.includes('</head>')) {
  // usuń poprzednią wersję jeśli była
  html = html.replace(/<style id="roi-tighten">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', fixCss + '\n</head>');
} else {
  html = fixCss + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Kontakt zostawiony tylko ten dolny + ROI podciągnięte.');
