const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) dopisujemy markup planety, jeśli go nie ma
if (!html.includes('class="hero-visual"')) {
  html = html.replace(
    /(<section[^>]*id="hero"[^>]*>[\s\S]*?<div class="hero-content">[\s\S]*?<\/div>)/,
    `$1
    <div class="hero-visual">
      <img src="assets/hero-a-brand.png" alt="a-brand.org – global growth" loading="lazy">
    </div>`
  );
}

// 2) wstrzykujemy style: 2 kolumny + kompaktowy padding + planeta po prawej
const css = `
<style id="abrand-hero-final">
:root{
  --maxw:1180px;
}
#hero{
  max-width:var(--maxw);
  margin:0 auto;
  padding:92px 18px 34px;
  display:flex;
  gap:28px;
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
main > section,
section{
  max-width:var(--maxw);
  margin:0 auto;
  padding:44px 18px 44px;
}
section + section{
  margin-top:0;
  border-top:1px solid rgba(255,255,255,0.03);
}
/* mobile */
@media (max-width:900px){
  #hero{
    flex-direction:column;
    padding:82px 16px 30px;
  }
  .hero-visual{
    width:68vw;
    max-width:360px;
    margin-top:10px;
  }
  main > section,
  section{
    padding:38px 16px 40px;
  }
}
</style>
`;

if (html.includes('</head>')) {
  // usuń stare nasze layouty żeby się nie gryzły
  html = html
    .replace(/<style id="abrand-layout-v2">[\s\S]*?<\/style>/g, '')
    .replace(/<style id="abrand-uniform-layout">[\s\S]*?<\/style>/g, '')
    .replace(/<style id="abrand-hero-restore">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', css + '\n</head>');
} else {
  html = css + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ hero ma teraz planetkę po prawej i ciaśniejsze odstępy.');
