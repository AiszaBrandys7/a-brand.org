const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

const css = `
<style id="roi-polish-ui-2025">
/* wyrównanie nagłówków */
#roi .roi-head{margin-bottom:18px;}
#roi .roi-title,
#roi .roi-contact h3{line-height:1.05;margin-top:0;}
#roi .roi-contact h3{font-size:1.05rem;}

/* równe kafelki */
#roi .roi-grid{
  align-items:stretch;
}
#roi .roi-card,
#roi .roi-contact{
  min-height:320px;
}

/* żeby textarea nie spychała przycisku w dół */
#roi .roi-contact textarea{
  min-height:110px;
  resize:vertical;
}

/* przyciski na jednej linii (desktop) */
@media (min-width: 901px){
  #roi .roi-card .roi-btn,
  #roi .roi-contact .roi-btn{
    margin-top:14px;
  }
}

/* na mobile zdejmujemy min-height żeby nie było "pustych" kart */
@media (max-width: 900px){
  #roi .roi-card,
  #roi .roi-contact{
    min-height:auto;
  }
  #roi .roi-contact textarea{
    min-height:92px;
  }
}

/* delikatniej ten mały dopisek, żeby nie krzyczał */
#roi .roi-meta{
  color:rgba(243,246,255,.40);
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html += '\n' + css + '\n';
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI UI dopieszczone: równe boksy, wyrównane nagłówki, przyciski na jednej wysokości.');
