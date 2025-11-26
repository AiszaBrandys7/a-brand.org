const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

const stylePatch = `
<style id="roi-align-fix">
  #roi .roi-card, 
  #roi .roi-contact {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 520px;
  }
  #roi .roi-eyebrow {
    margin-top: -6px;
    margin-bottom: 2px;
    display: block;
  }
  #roi .roi-title {
    margin-top: 0;
    font-size: 1.1rem;
  }
  /* wyrównanie nagłówków */
  #roi .roi-card .roi-title,
  #roi .roi-contact .roi-title {
    padding-top: 6px;
  }
  /* batoniki na tej samej wysokości */
  #roi .roi-btn-wide {
    position: absolute;
    bottom: 28px;
    left: 18px;
    right: 18px;
  }
  #roi .roi-out, 
  #roi .roi-note, 
  #roi .roi-cpl {
    margin-bottom: 42px; /* żeby nie kolidowały z batonikami */
  }
  @media (max-width: 980px){
    #roi .roi-btn-wide {
      position: relative;
      bottom: 0;
      left: 0;
      right: 0;
      margin-top: 10px;
    }
  }
</style>
`;

if (!html.includes('id="roi-align-fix"')) {
  html = html.replace('</head>', stylePatch + '\n</head>');
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('🎯 ROI layout refined: titles aligned, CTA buttons leveled, eyebrow moved up.');
