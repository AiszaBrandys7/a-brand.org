const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) wywal blok z planetką, jeśli jest
html = html.replace(/<div class="hero-visual">[\s\S]*?<\/div>\s*/i, '');

// 2) dorzucamy prosty styl dla hero + równe sekcje
const styleBlock = `
<style id="abrand-hero-simple">
/* hero: jeden słupek, oddech, środek uwagi na tekst */
#hero.hero, #hero .hero, .hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: 78px 0 62px;
  display: block;
}
.hero h1 { max-width: 640px; }
.hero .sub { max-width: 520px; }

/* równe odstępy między sekcjami */
main section, section { padding: 52px 0 52px; }
section + section { margin-top: 46px; }

@media (max-width: 720px){
  .hero { padding: 64px 0 50px; }
  main section, section { padding: 42px 0 44px; }
  section + section { margin-top: 32px; }
}
</style>
`;

if (html.includes('</head>')) {
  if (html.includes('abrand-hero-simple')) {
    html = html.replace(/<style id="abrand-hero-simple">[\s\S]*?<\/style>/, styleBlock.trim());
  } else {
    html = html.replace('</head>', styleBlock + '\n</head>');
  }
} else {
  html = styleBlock + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Hero uproszczony, grafika usunięta, odstępy ujednolicone.');
