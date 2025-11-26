const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

// 1) CSS dla sekcji ROI (2 kolumny, wspólny nagłówek)
const roiCss = `
<style id="a-brand-roi-v3">
  #roi{padding:34px 0 40px;}
  #roi .roi-head{margin-bottom:16px;}
  #roi .roi-eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:11px;color:rgba(227,241,255,.55);margin-bottom:6px;}
  #roi .roi-title{font-size:22px;font-weight:600;line-height:1.15;margin-bottom:2px;}
  #roi .roi-sub{font-size:13px;color:rgba(227,241,255,.55);}
  #roi .roi-layout{
    display:grid;
    grid-template-columns:minmax(0,1.05fr) minmax(280px,.7fr);
    gap:26px;
    align-items:start;
  }
  #roi .roi-card{
    background:rgba(4,17,25,.35);
    backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,.03);
    border-radius:18px;
    padding:16px 16px 14px;
  }
  #roi .roi-meta{
    margin-top:14px;
    padding-top:10px;
    border-top:1px solid rgba(255,255,255,.04);
    font-size:12px;
    line-height:1.45;
    color:rgba(230,242,255,.65);
  }
  #roi .contact-card{
    background:rgba(4,17,25,.12);
    border:1px solid rgba(255,255,255,.015);
    border-radius:18px;
    padding:16px 16px 14px;
  }
  @media (max-width:900px){
    #roi{padding:30px 0 28px;}
    #roi .roi-layout{grid-template-columns:1fr;gap:18px;}
    #roi .roi-title{font-size:20px;}
  }
</style>
`;

// 2) wstrzyknięcie CSS
html = html.replace(/<style id="a-brand-roi-v3">[\s\S]*?<\/style>\s*/g, '');
if (html.includes('</head>')) {
  html = html.replace('</head>', roiCss + '\n</head>');
} else {
  html = roiCss + '\n' + html;
}

// 3) frontowy JS – dodaje nagłówek jeśli go brak i usuwa duplikaty "Est. cost per lead"
const frontJs = `
<script id="a-brand-roi-front">
document.addEventListener('DOMContentLoaded', function(){
  var roi = document.getElementById('roi');
  if (roi && !roi.querySelector('.roi-head')) {
    var head = document.createElement('div');
    head.className = 'roi-head';
    head.innerHTML = '<div class="roi-eyebrow">READY TO MEASURE & TALK?</div><div class="roi-title">Estimate your ROI</div><div class="roi-sub">Directional — to decide if now is the right moment.</div>';
    roi.insertBefore(head, roi.firstElementChild);
  }

  function dedupe(){
    var card = document.querySelector('#roi .roi-card');
    if (!card) return;
    var lines = Array.from(card.querySelectorAll('p,div')).filter(n => (n.textContent||'').trim().toLowerCase().startsWith('est. cost per lead'));
    for (let i=1;i<lines.length;i++){ lines[i].remove(); }
  }
  dedupe();
  var target = document.querySelector('#roi');
  if (target){
    new MutationObserver(dedupe).observe(target, {subtree:true, childList:true});
  }
});
</script>
`;
html = html.replace(/<script id="a-brand-roi-front">[\s\S]*?<\/script>\s*/g, '');
if (html.includes('</body>')) {
  html = html.replace('</body>', frontJs + '\n</body>');
} else {
  html = html + '\n' + frontJs;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ ROI layout v3 zapisany.');
