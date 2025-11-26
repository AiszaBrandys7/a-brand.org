const fs = require('fs');

const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) jeśli w ogóle nie ma .hero-visual, to ją dolej do hero
if (!html.includes('class="hero-visual"')) {
  const heroOpen = html.match(/<section[^>]+class="[^"]*hero[^"]*"[^>]*>/i);
  if (heroOpen) {
    const snippet = `
    <div class="hero-visual">
      <img src="assets/hero-a-brand.png" alt="A-brand visual">
    </div>`;
    html = html.replace(heroOpen[0], heroOpen[0] + snippet);
    console.log('➕ Dodałem brakującą .hero-visual do hero.');
  } else {
    console.log('⚠️ Nie znalazłem sekcji hero, wstrzykuję na początek <main>.');
    html = html.replace('<main>', '<main>\n<div class="hero-visual"><img src="assets/hero-a-brand.png" alt="A-brand visual"></div>\n');
  }
}

// 2) wytnij wszystkie reguły, które chowają hero-visual
// pojedyncze .hero-visual { ... display:none ... }
html = html.replace(/\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}(\s*)/gi, '');
// media z display:none
html = html.replace(/@media[\s\S]{0,2000}?\.hero-visual\s*\{[^}]*display\s*:\s*none[^}]*\}[\s\S]{0,200}?}\s*/gi, '');

// 3) dopisz nasz jeden styl, który już wygra
const restoreStyle = `
<style id="abrand-hero-restore">
/* pokazujemy planetkę na desktopie */
@media (min-width: 901px){
  body .hero-visual{display:block !important; max-width:420px; margin-left:auto;}
  body .hero-visual img{width:100%; height:auto; display:block;}
}
/* chowamy tylko na telku */
@media (max-width: 900px){
  body .hero-visual{display:none !important;}
}
/* odstępy: desktop ciaśniej, mobile trochę luzu */
main section, section{padding:52px 0 52px;}
section + section{margin-top:46px;}
@media (max-width:720px){
  main section, section{padding:42px 0 46px;}
  section + section{margin-top:32px;}
}
</style>
`;

if (html.includes('</head>')) {
  if (!html.includes('abrand-hero-restore')) {
    html = html.replace('</head>', restoreStyle + '\n</head>');
  }
} else {
  html = restoreStyle + '\n' + html;
}

// zapisz
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Planetka przywrócona / odblokowana.');
