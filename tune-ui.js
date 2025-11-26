const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// styl który wstrzykniemy na sam KONIEC, żeby nadpisał wszystkie wcześniejsze eksperymenty
const css = `
<style id="abrand-latest-ui">
/* ===== hero: tekst szerzej + planeta po prawej ===== */
.hero{
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0,1.1fr) minmax(260px,0.9fr);
  gap: 32px;
  align-items: center;
  padding: 74px 16px 54px; /* góra mniejsza niż było */
}
.hero-visual{
  display:flex !important;
  justify-content:flex-end;
  align-items:center;
  position:relative;
  max-width: 320px;
  margin-left:auto;
  opacity:1 !important;
  visibility:visible !important;
}
.hero-visual img{
  width:100%;
  height:auto;
  display:block;
  border-radius:50%;
  filter:drop-shadow(0 18px 36px rgba(0,0,0,.42));
}
@media (min-width: 1180px){
  .hero-visual{max-width: 340px;}
}
/* ===== mobile hero ===== */
@media (max-width: 900px){
  .hero{
    grid-template-columns: 1fr;
    padding: 62px 14px 40px;
  }
  .hero-visual{
    max-width: 300px;
    margin: 20px auto 0;
  }
}
/* delikatne rozjaśnienie tła na mobile, żeby nie była czarna plama */
@media (max-width: 720px){
  body{
    background:
      radial-gradient(circle at 30% 0%, rgba(104,232,196,.10) 0%, rgba(7,10,18,0) 55%),
      #070a12;
  }
}

/* ===== sekcje: mniej pionu, równo ===== */
main section, section{
  padding: 44px 0 40px;
}
section + section{
  margin-top: 30px;
}
/* mobilka – jeszcze ciaśniej (to twoje kółeczko) */
@media (max-width: 720px){
  main section, section{
    padding: 36px 0 34px;
  }
  section + section{
    margin-top: 22px;
  }
  /* wyłączamy te cienkie linie/pseudo jeśli były */
  section::after{
    display:none !important;
  }
}

/* ===== ROI box kosmetyka ===== */
#roi, section#roi{
  max-width: 1180px;
  margin-left:auto;
  margin-right:auto;
}
#roi .card, #roi .calc, .roi-box{
  max-width: 560px;
}
#roi p{
  margin-bottom: .35rem;
  line-height: 1.4;
}
</style>
`;

// wstrzykujemy tuż przed </head> albo na sam początek
if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ UI odświeżony: ciaśniejsze sekcje, planeta zawsze widoczna, hero wyrównany.');
