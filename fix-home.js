const fs = require('fs');
const FILE = 'index.html';

let html = fs.readFileSync(FILE, 'utf8');

/* 1) CSS: hero z planetką, równy ROI+Contact, poprawione inputy/textarea */
const css = `
<style id="home-final-2025">
/* --- HERO: 2 kolumny + planeta na desktopie --- */
.hero, section#hero{
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(280px,0.95fr);
  gap:32px;
  align-items:center;
}
.hero .hero-visual{
  display:flex !important;
  justify-content:flex-end;
  max-width:360px;
  margin-left:auto;
}
.hero .hero-visual img{
  width:100%;
  height:auto;
  border-radius:50%;
  display:block;
}

/* --- ROI + CONTACT: takie same karty i paddingi --- */
#roi, section#roi{
  padding-top:46px;
}
#roi .roi-grid{
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(280px,0.72fr);
  gap:26px;
  align-items:stretch;
}
#roi .roi-calc,
#roi .roi-contact{
  background:rgba(6,10,17,.45);
  border:1px solid rgba(243,246,255,.03);
  border-radius:20px;
  padding:18px 18px 20px;
}
/* wyrównanie tytułów do góry */
#roi .roi-calc h3,
#roi .roi-contact h3{
  margin-top:0;
  margin-bottom:12px;
}

/* --- formularz: równe linijki, nie dotykają krawędzi --- */
#roi .roi-input,
#roi input.roi-input,
#roi textarea.roi-input{
  padding:10px 12px;
  line-height:1.4;
  border-radius:12px;
}
#roi textarea.roi-input{
  min-height:120px;
}

/* przyciski w obu kartach takie same */
#roi .roi-btn,
#roi .roi-contact button{
  border-radius:999px;
  height:34px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-weight:600;
}

/* --- mobile: jedna kolumna + ukryta planeta --- */
@media (max-width:900px){
  .hero, section#hero{display:block;}
  .hero .hero-visual{display:none !important;}

  #roi .roi-grid{
    grid-template-columns:1fr;
    gap:16px;
  }
  #roi .roi-calc,
  #roi .roi-contact{
    border-radius:16px;
  }
}
</style>
`;

/* wstrzykujemy css jeśli go nie było */
if (!html.includes('home-final-2025')) {
  html = html.replace('</head>', css + '\n</head>');
}

/* 2) nic więcej nie ruszamy – privacy/tos zostają */

/* zapis */
fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ homepage: planeta wróciła, ROI + Contact równiutkie, pola w formularzu mają oddech.');
