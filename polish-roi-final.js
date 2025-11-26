const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// dodaj końcowy CSS + poprawki alignmentu
const finalCSS = `
<style id="roi-final-polish">
  #roi .roi-shell > div {
    align-items: flex-start;
  }
  #roi .roi-shell > div > div {
    vertical-align: top;
  }
  #roi .roi-shell button, #roi .roi-shell input, #roi .roi-shell textarea, #roi .roi-shell select {
    font-family: inherit;
  }
  #roi .roi-shell p, #roi .roi-shell label, #roi .roi-shell h3 {
    font-family: inherit;
  }
  #roi .roi-shell #roi-cpl {
    margin-top: 4px !important;
    font-size: 0.7rem !important;
    color: rgba(255,255,255,0.65) !important;
  }
  #roi .roi-shell #roi-note {
    margin-top: 8px !important;
    color: rgba(255,255,255,0.5) !important;
  }
  #roi .roi-shell > div:last-child {
    margin-top: -4px;
  }
</style>
`;

if (!html.includes('id="roi-final-polish"')) {
  html = html.replace('</head>', finalCSS + '\n</head>');
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✨ ROI visually aligned + consistent typography + polished bottom text.');
