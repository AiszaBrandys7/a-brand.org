// roi-trim.js
// przycina lewy panel ROI i ustawia wyrównanie z kontaktem
const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

const styleId = 'roi-align-fix';
const css =
  '<style id="' + styleId + '">'+
  '#roi, .roi-shell{padding-top:34px;}'+
  '.roi-grid{align-items:flex-start;gap:28px;}'+
  '.roi-calc{margin-top:0;}'+
  '@media (max-width:900px){#roi, .roi-shell{padding-top:26px;} .roi-grid{gap:20px;}}'+
  '</style>';

if (html.indexOf(styleId) === -1){
  if (html.indexOf('</head>') !== -1){
    html = html.replace('</head>', css + '\n</head>');
  } else {
    html = css + '\n' + html;
  }
  fs.writeFileSync(FILE, html, 'utf8');
  console.log('✅ ROI panel przycięty i wyrównany z kontaktem.');
} else {
  console.log('ℹ️ ROI align fix już był w pliku – nic nie zmieniono.');
}
