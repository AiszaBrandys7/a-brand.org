const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wstrzykujemy planetę do hero, jeśli jej nie ma
if (!html.includes('class="hero-visual"')) {
  // spróbuj znaleźć sekcję hero
  const heroStart = html.indexOf('<section');
  // spróbuj po id="hero"
  const heroMatch = html.match(/<section[^>]+id="hero"[^>]*>/i);
  if (heroMatch) {
    const tag = heroMatch[0];
    const planet = `
    <div class="hero-visual">
      <img src="assets/hero-a-brand.png" alt="Growth visual" loading="lazy">
    </div>`;
    // wstawiamy planetę tuż po otwarciu hero
    html = html.replace(tag, tag + '\n' + planet);
  } else if (heroStart !== -1) {
    // jakby nie było id="hero", to i tak doklejamy na początek strony
    html = html.replace('<section', '<section>\n<div class="hero-visual"><img src="assets/hero-a-brand.png" alt="Growth visual" loading="lazy"></div>\n').replace('<section>', '<section');
  }
}

// 2) CSS – żeby hero miał dwie kolumny i żeby było ciaśniej
const styleBlock = `
<style id="a-brand-hero-fix">
/* === HERO two-column + planetka === */
.hero, section#hero {
  display:grid;
  grid-template-columns: 1.25fr 0.75fr;
  align-items:center;
  gap: 34px;
  min-height: 62vh;
}
.hero > *:first-child {
  max-width: 560px;
}
.hero-visual {
  justify-self:end;
  width: min(24vw, 360px);
  min-width: 230px;
}
.hero-visual img {
  width:100%;
  height:auto;
  display:block;
  border-radius:18px;
  filter: drop-shadow(0 16px 38px rgba(0,0,0,.35));
}
/* desktop spacing pod hero */
#services {
  margin-top: 40px;
}
/* mobile – chowamy planetę i robimy jedną kolumnę */
@media (max-width: 880px){
  .hero, section#hero {
    display:block;
    min-height: auto;
  }
  .hero-visual {
    display:none !important;
  }
  #services {
    margin-top: 28px;
  }
}
</style>
`;

if (!html.includes('a-brand-hero-fix')) {
  if (html.includes('</head>')) {
    html = html.replace('</head>', styleBlock + '\n</head>');
  } else {
    html = styleBlock + '\n' + html;
  }
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ hero: planetka wstawiona, grid ustawiony, mobile schowane.');
