const fs = require('fs');
const FILE = 'index.html';
let html = fs.readFileSync(FILE, 'utf8');

/**
 * 1) wywalamy wszystkie nasze późniejsze “łatki” typu
 *    a-brand-..., abrand-..., roi-..., metrics-...
 *    – zostawiamy tylko oryginalne style z góry.
 */
html = html.replace(/<style id="(?:a-brand|abrand|roi|metrics)[^"]*">[\s\S]*?<\/style>/g, '');

/**
 * 2) dokładamy jedną, nową skórkę brandową
 *    – tło, poświaty, karty, przyciski, ROI, mobile.
 */
const brandCSS = `
<style id="a-brand-theme-2025">
:root{
  --bg:#05070d;
  --fg:#f3f6ff;
  --muted:#b7c0d9;
  --card:rgba(10,14,22,.78);
  --card-border:rgba(243,246,255,.05);
  --brand1:#6ee7b7;
  --brand2:#38bdf8;
  --radius:18px;
}

/* tło: desktop i mobile tak samo, dwie poświaty */
body{
  background:
    radial-gradient(1000px 700px at 78% -12%, rgba(56,189,248,.15) 0%, rgba(5,7,13,0) 70%),
    radial-gradient(900px 580px at 10% 110%, rgba(110,231,183,.1) 0%, rgba(5,7,13,0) 70%),
    var(--bg);
  background-attachment: fixed;
  color: var(--fg);
}
@media (max-width: 820px){
  body{
    background:
      radial-gradient(520px 420px at 80% -14%, rgba(56,189,248,.24) 0%, rgba(5,7,13,0) 75%),
      radial-gradient(520px 420px at 12% 108%, rgba(110,231,183,.16) 0%, rgba(5,7,13,0) 75%),
      var(--bg);
  }
}

/* sekcje – jedno tempo */
main > section,
section{
  max-width:1180px;
  margin:0 auto;
  padding:54px 18px 54px;
}
@media (max-width: 820px){
  main > section,
  section{
    padding:40px 14px 40px;
  }
}

/* karty – services / process / case studies */
.card,
.process .step,
#roi .roi-calc,
#roi .roi-contact {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  box-shadow: 0 10px 32px rgba(0,0,0,.25);
  backdrop-filter: blur(10px);
}

/* przyciski – brandowy, pulsujący gradient */
.cta,
#roi .roi-btn,
#roi .roi-contact button,
button[type="submit"]{
  display:inline-flex;
  justify-content:center;
  align-items:center;
  gap:6px;
  background: linear-gradient(135deg, var(--brand1), var(--brand2));
  background-size: 180% 180%;
  animation: btnFloat 9s ease-in-out infinite;
  color:#041017;
  font-weight:600;
  border:none;
  border-radius:14px;
  padding:9px 16px;
  cursor:pointer;
  transition: transform .15s ease-out;
}
.cta.secondary{background:transparent;border:1px solid rgba(243,246,255,.14);color:var(--fg);animation:none;}
#roi .roi-btn,
#roi .roi-contact button{width:100%;min-height:34px;}
@keyframes btnFloat {
  0%{background-position:0% 50%;}
  50%{background-position:100% 50%;}
  100%{background-position:0% 50%;}
}
.cta:hover,
#roi .roi-btn:hover,
#roi .roi-contact button:hover{transform:translateY(-1px);}

/* ROI layout – dwie kolumny równo */
#roi{
  padding-top:44px;
  padding-bottom:50px;
}
#roi .roi-head{margin-bottom:16px;}
#roi .roi-title{margin:0 0 2px;}
#roi .roi-sub{color:rgba(243,246,255,.55);font-size:.82rem;margin-bottom:14px;}
#roi .roi-grid{
  display:grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, .7fr);
  gap:26px;
  align-items:flex-start;
}
#roi .roi-calc label,
#roi .roi-contact label{font-size:.7rem;color:rgba(243,246,255,.75);margin-bottom:4px;display:block;}
#roi .roi-input,
#roi .roi-ccy,
#roi textarea{
  width:100%;
  background:rgba(3,7,12,.35);
  border:1px solid rgba(243,246,255,.03);
  border-radius:12px;
  padding:8px 10px;
  color:var(--fg);
  font-size:.78rem;
}
#roi .roi-inline{display:flex;gap:10px;}
#roi .roi-col{flex:1;}
#roi .roi-ccy-wrap{display:flex;gap:8px;}
#roi .roi-ccy{max-width:82px;}
#roi .roi-out{margin-top:12px;font-size:.7rem;line-height:1.35;}
#roi .roi-footnotes,
#roi .roi-note{font-size:.67rem;color:rgba(243,246,255,.5);margin-top:4px;line-height:1.35;}
#roi .roi-contact textarea{min-height:110px;resize:vertical;}
@media (max-width: 900px){
  #roi .roi-grid{grid-template-columns:1fr;gap:14px;}
}

/* sticky header przezroczysty tak jak było */
header.site{
  background:rgba(5,7,13,.62);
  backdrop-filter:blur(14px);
  border-bottom:1px solid rgba(243,246,255,.02);
}
</style>
`;

/**
 * 3) wstrzykujemy ten CSS tuż przed </head>
 */
if (html.includes('</head>')) {
  html = html.replace('</head>', brandCSS + '\n</head>');
} else {
  html = brandCSS + '\n' + html;
}

fs.writeFileSync(FILE, html, 'utf8');
console.log('✅ Brandowy CSS przywrócony: gradient body, karty, przyciski, ROI 2-col.');
