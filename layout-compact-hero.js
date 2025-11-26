const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/**
 * 1. wyrzucamy stare nasze style-injecty jeśli były
 * (te z id="abrand-uniform-layout" albo wcześniejsze)
 */
html = html
  .replace(/<style id="abrand-uniform-layout">[\s\S]*?<\/style>/g, '')
  .replace(/<style id="abrand-hero-restore">[\s\S]*?<\/style>/g, '');

/**
 * 2. nowe, bardziej kompaktowe style + hero z planetką po prawej
 */
const css = `
<style id="abrand-layout-v2">
:root{
  --maxw:1180px;
  --sec-pad:54px;
  --sec-pad-m:40px;
}
/* ogólne sekcje */
main > section,
section{
  max-width:var(--maxw);
  margin:0 auto;
  padding:var(--sec-pad) 18px;
}
section + section{
  margin-top:0;
  border-top:1px solid rgba(255,255,255,0.03);
}

/* HERO: 2 kolumny, tekst + planeta po prawej */
#hero{
  max-width:var(--maxw);
  margin:0 auto;
  padding:96px 18px 46px;
  display:flex;
  gap:26px;
  align-items:center;
  position:relative;
}
#hero .hero-content{
  flex:1 1 55%;
  min-width:310px;
}
#hero h1{
  font-size:clamp(2.35rem, 3vw, 3.05rem);
  line-height:1.12;
  margin-bottom:12px;
}
#hero p.sub{
  max-width:620px;
  opacity:.86;
  margin-bottom:20px;
}

/* PLANETKA po prawej */
.hero-visual{
  flex:0 0 320px;
  max-width:340px;
  aspect-ratio:1/1;
  border-radius:50%;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-left:auto;
}
.hero-visual img{
  width:100%;
  height:auto;
  display:block;
  border-radius:50%;
}

/* trochę ciaśniej na dole strony */
#process,#cases,#roi,#contact{
  padding-top:44px;
  padding-bottom:44px;
}

/* kontakt na całą szerokość formularza */
#contact form{
  max-width:660px;
  gap:12px;
}

/* mobile: planeta pod spodem i mniejsze pady */
@media (max-width:900px){
  #hero{
    flex-direction:column;
    align-items:flex-start;
    padding:84px 16px 40px;
  }
  .hero-visual{
    width:62vw;
    max-width:360px;
    margin:18px 0 0;
  }
  main > section,
  section{
    padding:var(--sec-pad-m) 16px;
  }
}
@media (max-width:540px){
  .hero-visual{
    width:78vw;
  }
}
</style>
`;

if (html.includes('</head>')) {
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ kompaktowy layout wstawiony, hero = 2 kolumny, planetka po prawej.');
