const fs = require('fs');
const path = require('path');

const ROOT = process.cwd(); // jesteś już w /Users/.../a-brand.org

// mały helper
function safeRead(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  return { path: p, html: fs.readFileSync(p, 'utf8') };
}

function writeBack(fileObj, html) {
  fs.writeFileSync(fileObj.path, html, 'utf8');
  console.log('✅ zapisano', path.basename(fileObj.path));
}

// 1) INDEX.HTML – planeta, gap, ROI padding
(function patchIndex(){
  const file = safeRead('index.html');
  if (!file) {
    console.log('⚠️ index.html nie znaleziony, pomijam.');
    return;
  }
  let html = file.html;

  // wstrzykujemy tylko jeśli jeszcze nie ma
  const styleBlock = `
<style id="a-brand-safe-2025">
/* tło i kontener takie jak na home */
body{
  background:
    radial-gradient(1100px 800px at 70% -5%, rgba(80,230,255,.12) 0%, rgba(5,7,13,0) 70%),
    radial-gradient(900px 600px at 10% 105%, rgba(90,255,190,.06) 0%, rgba(5,7,13,0) 70%),
    #05070d;
  background-attachment: fixed;
  color:#f3f6ff;
}
.container{max-width:1120px;margin:0 auto;padding:0 20px;}
/* hero: planeta widoczna na desktopie */
@media (min-width: 901px){
  .hero .hero-visual,
  section#hero .hero-visual{display:flex !important;max-width:360px;margin-left:auto;}
}
@media (max-width: 900px){
  .hero .hero-visual,
  section#hero .hero-visual{display:none !important;}
}
/* case → roi: jedna przerwa */
#cases{margin-bottom:26px !important;}
#roi, section#roi{margin-top:0 !important;}
/* ROI karty – oddech */
#roi .roi-card,
#roi .roi-contact{
  padding:18px 16px 20px !important;
  border-radius:18px !important;
}
/* pola w ROI */
#roi .roi-input,
#roi textarea.roi-input{
  padding:10px 12px !important;
  border-radius:12px !important;
}
/* na bardzo wąskich – ciaśniej sekcje */
@media (max-width: 768px){
  section{padding-top:42px;padding-bottom:44px;}
}
</style>`.trim();

  if (!html.includes('id="a-brand-safe-2025"')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', styleBlock + '\n</head>');
    } else {
      html = styleBlock + '\n' + html;
    }
  }

  writeBack(file, html);
})();


// 2) Wspólna belka do legal pages
const legalHeader = `
<header class="site">
  <div class="container nav">
    <a class="logo" href="index.html"><span class="logo-mark" aria-hidden="true"></span><span>a-brand.org</span></a>
    <nav id="topnav">
      <a href="index.html#services">Services</a>
      <a href="index.html#process">Process</a>
      <a href="index.html#cases">Case studies</a>
      <a href="index.html#roi">ROI</a>
      <a href="index.html#contact" class="cta">Request a diagnostic</a>
    </nav>
  </div>
</header>
`.trim();

const legalCss = `
<style id="a-brand-legal-safe">
body{
  background:
    radial-gradient(900px 700px at 72% -8%, rgba(80,230,255,.09) 0%, rgba(5,7,13,0) 70%),
    #05070d;
  color:#f3f6ff;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Arial,"Helvetica Neue",sans-serif;
  line-height:1.6;
}
.container{max-width:1120px;margin:0 auto;padding:0 20px;}
header.site{
  background:rgba(5,7,13,.55);
  backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(243,246,255,.02);
  position:sticky;
  top:0;
  z-index:40;
}
.nav{display:flex;align-items:center;justify-content:space-between;height:62px;gap:14px;}
.logo{display:flex;align-items:center;gap:8px;font-weight:700;}
.logo-mark{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#6ee7b7,#6ea8ff);}
#topnav{display:flex;gap:14px;align-items:center;}
#topnav a{white-space:nowrap;font-weight:500;font-size:.9rem;}
#topnav .cta{
  background:linear-gradient(135deg,#6ee7b7,#6ea8ff);
  color:#041017;
  font-weight:600;
  border:none;
  border-radius:14px;
  padding:7px 14px;
}
main.legal-shell{
  max-width:920px;
  margin:86px auto 60px;
  padding:0 16px 64px;
  background:transparent;
}
main.legal-shell h1{margin-top:0;margin-bottom:18px;}
main.legal-shell h2{margin-top:32px;}
main.legal-shell a{color:rgba(110,231,183,.85);}
@media (max-width: 760px){
  #topnav{overflow-x:auto;scrollbar-width:none;}
  #topnav::-webkit-scrollbar{display:none;}
  main.legal-shell{margin-top:78px;}
}
</style>
`.trim();

function patchLegal(filename){
  const file = safeRead(filename);
  if (!file) {
    console.log('⚠️', filename, 'nie znaleziony, pomijam.');
    return;
  }
  let html = file.html;

  // CSS
  if (!html.includes('id="a-brand-legal-safe"')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', legalCss + '\n</head>');
    } else {
      html = legalCss + '\n' + html;
    }
  }

  // header
  if (!html.includes('<header class="site">')) {
    html = html.replace('<body>', '<body>\n' + legalHeader + '\n');
  }

  // wrap main
  if (!html.includes('class="legal-shell"')) {
    if (html.includes('<main')) {
      html = html.replace('<main', '<main class="legal-shell"');
    } else {
      // jak nie ma <main> to owijamy całość
      html = html.replace('<body>', '<body>\n<main class="legal-shell">')
                 .replace('</body>', '</main>\n</body>');
    }
  }

  writeBack(file, html);
}

patchLegal('privacy.html');
patchLegal('tos.html');

console.log('🎉 gotowe: home + privacy + tos wyrównane.');
