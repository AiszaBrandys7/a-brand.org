const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

html = html.replace(/<style id="abrand-uniform-layout">[\s\S]*?<\/style>/gi, '');

const css = `
<style id="abrand-uniform-layout">
:root {
  --maxw: 1200px;
  --pad-section: 72px;
  --pad-section-mob: 52px;
}

/* kontener dla wszystkich sekcji */
main > section,
section {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: var(--pad-section) 20px;
}
section + section {
  margin-top: 0;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* HERO: bez sztywnej wysokości, z lekkim oddechem u góry */
#hero {
  display: block;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 110px 20px 64px;
}
#hero h1 {font-size: clamp(2.3rem, 3vw, 3rem); line-height: 1.25;}
#hero p.sub {max-width: 680px; opacity: 0.9; margin-top: 12px;}
#hero .btn, #hero button {margin-top: 24px;}

/* ROI i contact — kosmetyka */
#roi .calc-results {
  margin-top: 14px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 14px 18px;
}
#contact form {max-width: 640px; margin-top: 20px; gap: 12px;}

@media (max-width: 900px) {
  section, #hero {padding: var(--pad-section-mob) 20px;}
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Hero dopasowany do treści, odstępy ściśnięte i wyrównane.');
