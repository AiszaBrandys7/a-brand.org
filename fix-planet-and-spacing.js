const fs = require('fs');

const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wstrzykujemy planetkę, jeśli jej nie ma
if (!html.includes('class="hero-visual"')) {
  const heroMatch = html.match(/<section[^>]+id="hero"[^>]*>/i);
  const planet = `
    <div class="hero-visual">
      <img src="assets/hero-a-brand.png" alt="A-brand visual" />
    </div>
  `;
  if (heroMatch) {
    html = html.replace(heroMatch[0], heroMatch[0] + planet);
    console.log('➕ Wstawiłam .hero-visual do sekcji #hero');
  } else {
    // awaryjnie na początek <main>
    html = html.replace('<main>', '<main>' + planet);
    console.log('➕ Wstawiłam .hero-visual na początek <main>');
  }
}

// 2) zbijamy wszystkie stare style chowające planetę
// usuń pojedyncze .hero-visual { ... display:none ... }
html = html.replace(/\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}(\s*)/gi, '');
// usuń media z display:none
html = html.replace(/@media[\s\S]{0,2000}?\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}[\s\S]{0,200}?}\s*/gi, '');

// 3) dopisujemy nasz jeden, najmocniejszy styl + równe odstępy
const restoreCss = `
<style id="abrand-fix">
/* pokaż planetę na desktopie */
@media (min-width: 901px){
  .hero{display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:46px;}
  .hero-visual{display:block !important;max-width:420px;margin-left:auto;}
  .hero-visual img{width:100%;height:auto;display:block;border-radius:18px;}
}
/* na telefonie chowamy, żeby nie psuła pionu */
@media (max-width: 900px){
  .hero-visual{display:none !important;}
}

/* równe odstępy między sekcjami */
main section, section{padding:52px 0 52px;}
section + section{margin-top:46px;}
@media (max-width: 720px){
  main section, section{padding:42px 0 44px;}
  section + section{margin-top:32px;}
}

/* małe wygładzenie ROI, bo duplikował notki */
#roi p + p {margin-top:6px;}
</style>
`;

if (html.includes('</head>')) {
  if (!html.includes('abrand-fix')) {
    html = html.replace('</head>', restoreCss + '\n</head>');
  } else {
    // podmień starą wersję
    html = html.replace(/<style id="abrand-fix">[\s\S]*?<\/style>/, restoreCss.trim());
  }
} else {
  html = restoreCss + '\n' + html;
}

// 4) zapis
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Planetka odblokowana i odstępy ujednolicone.');
