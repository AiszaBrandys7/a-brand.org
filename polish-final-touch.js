const fs = require('fs');
const path = require('path');

const files = ['index.html', 'privacy.html', 'tos.html'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');

  // usuń stare patche (żeby nie kumulować)
  html = html.replace(/<style id="a-brand-final-touch">[\s\S]*?<\/style>/g, '');

  const style = `
<style id="a-brand-final-touch">
/* === Final fine-tune 2025 === */
section{padding-top:52px;padding-bottom:52px;}
#cases{margin-bottom:22px!important;}
#roi{margin-top:0!important;padding-top:40px!important;padding-bottom:50px!important;}
#roi .roi-card,#roi .roi-contact{padding:16px 14px!important;border-radius:18px!important;}
@media(max-width:900px){
  section{padding-top:42px;padding-bottom:44px;}
  #roi .roi-card,#roi .roi-contact{padding:14px 12px!important;}
}
header.site{
  position:sticky!important;
  top:0;
  z-index:50;
  background:rgba(5,7,13,.55)!important;
  backdrop-filter:blur(16px)!important;
  border-bottom:1px solid rgba(243,246,255,.02)!important;
}
header.site a.cta{
  background:linear-gradient(135deg,#6ee7b7,#6ea8ff);
  color:#041017;
  border:none;
  border-radius:14px;
  padding:7px 14px;
  font-weight:600;
}
</style>`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', style + '\n</head>');
  } else {
    html = style + '\n' + html;
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log(`✅ dopieszczono ${file}`);
}
console.log('🎨 Wszystko gotowe: odstępy, ROI, nagłówki zsynchronizowane.');
