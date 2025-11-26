const fs = require('fs');

const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal wszystkie stare style, które brutalnie chowały .hero-visual
// takie jak ".hero-visual{display:none;}" albo wersje z @media
html = html.replace(/\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}/g, '');
html = html.replace(/@media\s*\([^)]+\)\s*\{\s*\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}[^}]*\}/g, '');

// 2) dodaj nasz styl, który mówi:
// - na desktopie pokaż planetkę
// - na mobile schowaj (bo tak chciałaś)
// - ujednolić odstępy
const styleBlock = `
<style id="abrand-layout-fix">
/* pokaż planetę na dużych */
@media (min-width: 901px){
  .hero-visual{
    display:block !important;
    max-width:420px;
    margin-left:auto;
  }
}
/* schowaj na telku */
@media (max-width: 900px){
  .hero-visual{
    display:none !important;
  }
}

/* RÓWNE ODSTĘPY — desktop bliżej, mobile troszkę luźniej */
main section, section{
  padding:52px 0 52px;
}
section + section{
  margin-top:46px;
}
@media (max-width: 720px){
  main section, section{
    padding:42px 0 46px;
  }
  section + section{
    margin-top:32px;
  }
}
</style>
`;

if (!html.includes('abrand-layout-fix')) {
  if (html.includes('</head>')) {
    html = html.replace('</head>', styleBlock + '\n</head>');
  } else {
    html = styleBlock + '\n' + html;
  }
}

// 3) mały raport, żebyś w terminalu widziała
const sections = [];
const secRegex = /<section[^>]*id="([^"]+)"[^>]*>/gi;
let m;
while ((m = secRegex.exec(html)) !== null) {
  sections.push(m[1]);
}

fs.writeFileSync(FILE, html, 'utf8');

console.log('✅ Wstrzyknięty CSS: planetka na desktopie, ukryta na mobile, odstępy ujednolicone.');
console.log('📦 Sekcje znalezione na stronie (żebyś widziała co będzie równo):');
sections.forEach((id, i) => console.log(`  ${i+1}. #${id}`));
