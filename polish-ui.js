const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// dokładamy mały, ostatni styl który tylko DOPOLERUJE
const polish = `
<style id="a-brand-ui-polish">
/* 1) ROI dwie kolumny, nagłówki na jednej wysokości */
#roi{
  padding-top:42px;
}
#roi .roi-head{
  margin-bottom:18px;
}
#roi .roi-grid{
  display:grid;
  grid-template-columns: minmax(0,1.05fr) minmax(280px,.7fr);
  gap:26px;
  align-items:flex-start;
}

/* 2) karty: więcej powietrza w środku */
#roi .roi-calc,
#roi .roi-contact{
  padding:22px 22px 20px;
  border-radius:18px;
}
#roi .roi-label{
  margin-bottom:4px;
}
#roi .roi-input,
#roi .roi-ccy,
#roi textarea{
  margin-bottom:10px;
  min-height:32px;
}
#roi .roi-inline{gap:12px;}
#roi .roi-out{margin-top:12px;}
#roi .roi-contact .roi-btn,
#roi .roi-contact button{margin-top:6px;}

/* 3) przyciski calc / send na tej samej wysokości */
#roi .roi-calc .roi-btn{
  margin-top:4px;
}
#roi .roi-contact button{
  min-height:34px;
}

/* 4) napis nad kartą trochę wyżej, żeby nie “dotykał” */
#roi .roi-eyebrow{
  display:block;
  margin-bottom:4px;
  letter-spacing:.08em;
}
#roi .roi-title{
  margin-bottom:3px;
}

/* 5) planeta – pokaż na desktopie na pewno */
@media (min-width: 901px){
  .hero-visual{
    display:block !important;
  }
}

/* mobile – karty jedna pod drugą, dalej z paddingiem */
@media (max-width: 900px){
  #roi .roi-grid{
    grid-template-columns:1fr;
    gap:16px;
  }
  #roi .roi-calc,
  #roi .roi-contact{
    padding:20px 16px 18px;
  }
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', polish + '\n</head>');
} else {
  html = polisht + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ UI podopieszczał: ROI padding, wyrównane nagłówki, planeta przywrócona.');
