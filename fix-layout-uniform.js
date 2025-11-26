const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// usuwamy ewentualne stare style hero i spacing
html = html.replace(/<style id="abrand-hero-simple">[\s\S]*?<\/style>/gi, '');
html = html.replace(/<style id="abrand-fix">[\s\S]*?<\/style>/gi, '');

// nowy, równy layout
const styleBlock = `
<style id="abrand-uniform-layout">
:root {
  --maxw: 1200px;
  --pad-section: 72px;
  --pad-section-mob: 52px;
}

/* wspólny kontener dla wszystkich sekcji */
main > section,
section {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: var(--pad-section) 20px;
}
section + section {
  margin-top: 0;
  border-top: 1px solid rgba(255,255,255,0.05);
}

/* HERO */
#hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: 88vh;
  padding: 120px 20px 100px;
  max-width: var(--maxw);
  margin: 0 auto;
}
#hero h1 {font-size: clamp(2.2rem, 3vw, 3rem); line-height: 1.2;}
#hero p.sub {max-width: 680px; opacity: 0.9; margin-top: 12px;}
#hero .btn, #hero button {margin-top: 28px;}

/* SERVICES / PROCESS / CASES / ROI / CONTACT */
#services, #process, #cases, #roi, #contact {
  max-width: var(--maxw);
  margin: 0 auto;
}

/* ROI calc block */
#roi {
  text-align: left;
}
#roi h2 {
  margin-bottom: 18px;
}
#roi p {
  margin: 4px 0;
}
#roi .calc-results {
  margin-top: 18px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 16px 20px;
  line-height: 1.5;
}

/* CONTACT form fix */
#contact form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
}
#contact input, #contact textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  color: #fff;
}
#contact button {
  align-self: flex-start;
  margin-top: 8px;
}

/* responsive tweaks */
@media (max-width: 900px) {
  :root { --maxw: 100%; }
  section, #hero {
    padding: var(--pad-section-mob) 20px;
  }
  #hero {
    min-height: auto;
    padding-top: 80px;
  }
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', styleBlock + '\n</head>');
} else {
  html = styleBlock + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Wyrównano szerokości i odstępy, hero pełna wysokość, ROI i formularz poprawione.');
