const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// będziemy szukać naszego stylu z wcześniejszego kroku
const ID = 'abrand-hero-final';
const hasStyle = html.includes(`id="${ID}"`);

const mobilePatch = `
<style id="${ID}">
:root{ --maxw:1180px; }
#hero{
  max-width:var(--maxw);
  margin:0 auto;
  padding:90px 18px 30px;
  display:flex;
  gap:22px;
  align-items:center;
}
#hero .hero-content{
  flex:1 1 58%;
  min-width:310px;
}
.hero-visual{
  flex:0 0 320px;
  max-width:340px;
  display:flex;
  justify-content:center;
  align-items:center;
}
.hero-visual img{
  width:100%;
  height:auto;
  display:block;
  border-radius:50%;
}
/* sekcje pod spodem trochę ciaśniej */
main > section,
section{
  max-width:var(--maxw);
  margin:0 auto;
  padding:40px 18px 42px;
}
section + section{
  margin-top:0;
  border-top:1px solid rgba(255,255,255,0.02);
}
/* MOBILE – chowamy planetę całkiem */
@media (max-width:880px){
  #hero{
    flex-direction:column;
    padding:78px 16px 28px;
  }
  .hero-visual{
    display:none !important;
  }
  main > section,
  section{
    padding:36px 16px 38px;
  }
}
</style>
`;

if (hasStyle) {
  // zamieniamy cały poprzedni blok na ten świeży
  html = html.replace(/<style id="abrand-hero-final">[\s\S]*?<\/style>/, mobilePatch.trim());
} else if (html.includes('</head>')) {
  html = html.replace('</head>', mobilePatch + '\n</head>');
} else {
  html = mobilePatch + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Hero poprawiony: planeta tylko na desktopie, mobile czysty, sekcje ciaśniejsze.');
